/**
 * Vibe Token Simulation Engine
 *
 * Orchestrates the monthly tick loop, combining:
 * - Business revenue generation
 * - Token economics (earnings, distributions, exits)
 * - Participant behavioral decisions
 * - Dynamic entry system
 * - State tracking and snapshots
 */

const {
    calculatePrice,
    calculateTokensEarned,
    calculateDistributionPool,
    calculatePayoutPerToken,
    calculateExitValue,
    canExit,
    processExitQueue,
    mintTokens,
    burnTokens
} = require('./economics.js');

const { createBusiness, BusinessState } = require('./revenue.js');
const { createBehavior } = require('./behaviors.js');
const { createEntryPool } = require('./entry.js');
const { createRNG } = require('./revenue.js');

/**
 * Initialize simulation state from configuration
 */
function initializeState(config, rng) {
    const { tokenomics, participants: participantConfigs } = config;

    // Initialize tokenomics state
    const state = {
        S: tokenomics.s_min || 1000,  // Start at floor
        P: calculatePrice(tokenomics.s_min || 1000, tokenomics.k),
        queue: [],
        month: 0,
        cumulativeRevenue: 0,
        businessState: BusinessState.LAUNCHED,
        alpha: tokenomics.alpha,
        k: tokenomics.k,
        s_min: tokenomics.s_min || 1000,
        treasury: tokenomics.treasury,
        treasuryRemaining: tokenomics.treasury
    };

    // Initialize participants
    const participants = participantConfigs.map((p, idx) => {
        const behavior = createBehavior(p.behavior, p.params || {}, rng);
        const grant = p.grant || 0;

        // Issue grant from treasury
        if (grant > 0 && grant <= state.treasuryRemaining) {
            state.S = mintTokens(state.S, grant);
            state.treasuryRemaining -= grant;
        }

        return {
            id: p.id || `participant-${idx}`,
            name: p.name || `Participant ${idx + 1}`,
            tokens: grant,
            grant,
            referralShare: p.referral_share || 0,
            startMonth: p.start_month || 1,
            behavior,
            behaviorType: p.behavior,
            behaviorParams: p.params || {},
            distributions: 0,
            exitValue: 0,
            hasExited: false,
            exitMonth: null,
            monthlyTokensEarned: 0,
            isLateEntrant: false
        };
    });

    // Update price after grants
    state.P = calculatePrice(state.S, state.k);

    return { state, participants };
}

/**
 * Run a single month of the simulation
 */
function runMonth(state, participants, business, entryPool, history, rng) {
    const events = [];
    const month = state.month + 1;
    state.month = month;

    // 1. Generate Revenue
    const revenueResult = business.generateRevenue(month);
    const revenue = revenueResult.revenue;
    state.cumulativeRevenue += revenue;
    state.businessState = revenueResult.state;
    state.revenue = revenue;

    events.push({
        type: 'revenue',
        month,
        revenue,
        businessState: revenueResult.state,
        breakthrough: revenueResult.breakthrough || false,
        failed: revenueResult.failed || false
    });

    // 2. Calculate Distribution Pool
    const distributionPool = calculateDistributionPool(revenue, state.alpha);

    // 3. Process Exit Queue (priority over distributions)
    const queueResult = processExitQueue(state.queue, distributionPool);
    state.queue = queueResult.queue;
    const remainingPool = queueResult.remainder;

    if (queueResult.payments.length > 0) {
        // Record exit payments to participants
        for (const payment of queueResult.payments) {
            const p = participants.find(x => x.id === payment.id);
            if (p) {
                p.exitValue += payment.amount;
                if (payment.complete) {
                    events.push({
                        type: 'exit_complete',
                        participantId: p.id,
                        totalExitValue: p.exitValue
                    });
                }
            }
        }
        events.push({
            type: 'queue_payments',
            payments: queueResult.payments,
            queueRemaining: state.queue.length
        });
    }

    // 4. Calculate Token Earnings for active participants
    const activeParticipants = participants.filter(p =>
        p.startMonth <= month && !p.hasExited
    );

    for (const p of activeParticipants) {
        p.monthlyTokensEarned = 0;

        if (p.referralShare > 0 && revenue > 0) {
            const referralRevenue = revenue * p.referralShare;
            const tokensEarned = calculateTokensEarned(referralRevenue, state.alpha, state.P);

            if (tokensEarned > 0) {
                // Check treasury for new tokens
                if (state.treasuryRemaining >= tokensEarned) {
                    state.S = mintTokens(state.S, tokensEarned);
                    state.treasuryRemaining -= tokensEarned;
                    p.tokens += tokensEarned;
                    p.monthlyTokensEarned = tokensEarned;

                    events.push({
                        type: 'tokens_earned',
                        participantId: p.id,
                        tokens: tokensEarned,
                        referralRevenue
                    });
                }
            }
        }
    }

    // Update price after minting
    state.P = calculatePrice(state.S, state.k);

    // 5. Distribute to Holders
    if (remainingPool > 0 && state.S > 0) {
        const payoutPerToken = calculatePayoutPerToken(remainingPool, state.S);

        for (const p of activeParticipants) {
            if (p.tokens > 0) {
                const payout = p.tokens * payoutPerToken;
                p.distributions += payout;
            }
        }

        events.push({
            type: 'distributions',
            pool: remainingPool,
            payoutPerToken,
            totalTokens: state.S
        });
    }

    // 6. Participant Decisions
    for (const p of activeParticipants) {
        const decision = p.behavior(
            {
                month,
                S: state.S,
                P: state.P,
                revenue,
                alpha: state.alpha,
                k: state.k,
                businessState: state.businessState,
                queueDepth: state.queue.length
            },
            history,
            p,
            p.behaviorParams
        );

        if (decision.action === 'EXIT' && decision.tokens > 0) {
            const tokensToExit = Math.min(decision.tokens, p.tokens);

            // Check if exit is allowed (supply floor)
            if (canExit(state.S, tokensToExit, state.s_min)) {
                const exitValue = calculateExitValue(tokensToExit, state.P);

                // Burn tokens
                state.S = burnTokens(state.S, tokensToExit, state.s_min);
                p.tokens -= tokensToExit;

                // Add to exit queue
                state.queue.push({
                    id: p.id,
                    owed: exitValue,
                    tokens: tokensToExit,
                    enteredMonth: month
                });

                // Mark as exited if all tokens gone
                if (p.tokens <= 0) {
                    p.hasExited = true;
                    p.exitMonth = month;
                }

                // Update price after burn
                state.P = calculatePrice(state.S, state.k);

                events.push({
                    type: 'exit_request',
                    participantId: p.id,
                    tokens: tokensToExit,
                    exitValue,
                    reason: decision.reason,
                    newPrice: state.P
                });
            }
        }
    }

    // 7. Dynamic Entry - spawn new participants
    if (entryPool) {
        const newParticipants = entryPool.evaluateTick(
            {
                month,
                revenue,
                P: state.P,
                S: state.S,
                businessState: state.businessState
            },
            participants
        );

        for (const newP of newParticipants) {
            // Issue grant
            if (newP.grant <= state.treasuryRemaining) {
                state.S = mintTokens(state.S, newP.grant);
                state.treasuryRemaining -= newP.grant;
                participants.push(newP);

                events.push({
                    type: 'new_participant',
                    participantId: newP.id,
                    name: newP.name,
                    grant: newP.grant,
                    behavior: newP.behaviorType,
                    entryReason: newP.entryReason
                });
            }
        }

        // Update price after any grants
        state.P = calculatePrice(state.S, state.k);
    }

    // 8. Create snapshot for history
    const snapshot = {
        month,
        S: state.S,
        P: state.P,
        revenue,
        cumulativeRevenue: state.cumulativeRevenue,
        businessState: state.businessState,
        queueDepth: state.queue.length,
        queueValue: state.queue.reduce((sum, e) => sum + e.owed, 0),
        treasuryRemaining: state.treasuryRemaining,
        participantCount: participants.filter(p => !p.hasExited).length,
        events
    };

    return snapshot;
}

/**
 * Run a complete simulation
 *
 * @param {Object} config - Full simulation configuration
 * @param {number} seed - Random seed for reproducibility
 * @returns {Object} Complete simulation results
 */
function runSimulation(config, seed = null) {
    const rng = createRNG(seed || Date.now());

    // Initialize business
    const business = createBusiness(config.business, seed);

    // Initialize state and participants
    const { state, participants } = initializeState(config, rng);

    // Initialize entry pool if configured
    let entryPool = null;
    if (config.entry_pool) {
        entryPool = createEntryPool(config.entry_pool, rng);
    }

    // Run simulation
    const history = [];
    const duration = config.simulation?.duration_months || 36;

    for (let month = 1; month <= duration; month++) {
        const snapshot = runMonth(state, participants, business, entryPool, history, rng);
        history.push(snapshot);

        // Early termination if business has been failed for a while
        if (state.businessState === BusinessState.FAILED) {
            const failedMonths = history.filter(h => h.businessState === 'failed').length;
            if (failedMonths >= 6) {
                // Fill remaining months with terminal state
                for (let m = month + 1; m <= duration; m++) {
                    history.push({
                        month: m,
                        S: state.S,
                        P: state.P,
                        revenue: 0,
                        cumulativeRevenue: state.cumulativeRevenue,
                        businessState: 'failed',
                        queueDepth: state.queue.length,
                        queueValue: state.queue.reduce((sum, e) => sum + e.owed, 0),
                        treasuryRemaining: state.treasuryRemaining,
                        participantCount: participants.filter(p => !p.hasExited).length,
                        events: []
                    });
                }
                break;
            }
        }
    }

    // Calculate final participant outcomes
    const participantOutcomes = participants.map(p => {
        const tokenValue = p.tokens * state.P;
        const pendingExit = state.queue.filter(e => e.id === p.id).reduce((sum, e) => sum + e.owed, 0);
        const totalValue = tokenValue + p.exitValue + pendingExit + p.distributions;
        const grantValue = p.grant * calculatePrice(config.tokenomics.s_min || 1000, config.tokenomics.k);
        const roi = grantValue > 0 ? totalValue / grantValue : 0;

        return {
            id: p.id,
            name: p.name,
            behaviorType: p.behaviorType,
            isLateEntrant: p.isLateEntrant,
            startMonth: p.startMonth,
            grant: p.grant,
            finalTokens: p.tokens,
            tokenValue,
            distributions: p.distributions,
            exitValue: p.exitValue,
            pendingExit,
            totalValue,
            roi,
            hasExited: p.hasExited,
            exitMonth: p.exitMonth
        };
    });

    return {
        config: {
            business: config.business.archetype,
            alpha: config.tokenomics.alpha,
            k: config.tokenomics.k,
            duration
        },
        seed,
        finalState: {
            S: state.S,
            P: state.P,
            cumulativeRevenue: state.cumulativeRevenue,
            businessState: state.businessState,
            queueDepth: state.queue.length,
            queueValue: state.queue.reduce((sum, e) => sum + e.owed, 0),
            treasuryRemaining: state.treasuryRemaining
        },
        history,
        participantOutcomes,
        summary: {
            survived: state.businessState !== BusinessState.FAILED,
            finalPrice: state.P,
            totalRevenue: state.cumulativeRevenue,
            participantCount: participants.length,
            lateEntrantCount: participants.filter(p => p.isLateEntrant).length,
            exitCount: participants.filter(p => p.hasExited).length,
            avgROI: participantOutcomes.reduce((sum, p) => sum + p.roi, 0) / participantOutcomes.length
        }
    };
}

/**
 * Run multiple simulations and aggregate results
 *
 * @param {Object} config - Simulation configuration
 * @param {number} runs - Number of simulations to run
 * @param {number} baseSeed - Base seed for reproducibility
 * @returns {Object} Aggregated results
 */
function runBatch(config, runs = 100, baseSeed = null) {
    const results = [];
    const startSeed = baseSeed || Date.now();

    for (let i = 0; i < runs; i++) {
        const result = runSimulation(config, startSeed + i);
        results.push(result);
    }

    // Aggregate statistics
    const survived = results.filter(r => r.summary.survived);
    const failed = results.filter(r => !r.summary.survived);

    // Price distribution
    const finalPrices = results.map(r => r.finalState.P);
    const priceStats = calculateStats(finalPrices);

    // Revenue distribution
    const totalRevenues = results.map(r => r.finalState.cumulativeRevenue);
    const revenueStats = calculateStats(totalRevenues);

    // ROI by participant name (filter out NaN/invalid)
    const roiByParticipant = {};
    for (const result of results) {
        for (const p of result.participantOutcomes) {
            if (!roiByParticipant[p.name]) {
                roiByParticipant[p.name] = [];
            }
            // Only include valid ROI values
            if (isFinite(p.roi) && !isNaN(p.roi)) {
                roiByParticipant[p.name].push(p.roi);
            }
        }
    }

    const participantStats = {};
    for (const [name, rois] of Object.entries(roiByParticipant)) {
        if (rois.length > 0) {
            participantStats[name] = calculateStats(rois);
        }
    }

    return {
        runs,
        baseSeed: startSeed,
        survivalRate: survived.length / runs,
        priceStats,
        revenueStats,
        participantStats,
        results  // Full results for detailed analysis
    };
}

/**
 * Calculate basic statistics for an array of numbers
 */
function calculateStats(values) {
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / sorted.length;
    const stddev = Math.sqrt(variance);

    return { mean, median, min, max, stddev, count: values.length };
}

module.exports = {
    initializeState,
    runMonth,
    runSimulation,
    runBatch,
    calculateStats
};
