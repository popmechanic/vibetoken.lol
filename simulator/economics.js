/**
 * Vibe Token Economics Engine
 *
 * Implements all formulas from the whitepaper:
 * - P = k × √S (supply-based pricing)
 * - Token earning via referral revenue
 * - Distribution calculations
 * - Exit value and queue processing
 * - Supply floor enforcement
 */

/**
 * Calculate token price from circulating supply
 * Formula: P = k × √S
 *
 * @param {number} S - Circulating supply
 * @param {number} k - Pricing constant
 * @returns {number} Token price
 */
function calculatePrice(S, k) {
    if (S <= 0) throw new Error('Supply must be positive');
    return k * Math.sqrt(S);
}

/**
 * Calculate tokens earned from referral revenue
 * Formula: tokens = floor(α × dR / P)
 *
 * @param {number} referralRevenue - Revenue attributed to this referrer
 * @param {number} alpha - Revenue share (0-1)
 * @param {number} P - Current token price
 * @returns {number} Whole tokens earned
 */
function calculateTokensEarned(referralRevenue, alpha, P) {
    if (P <= 0) throw new Error('Price must be positive');
    return Math.floor(alpha * referralRevenue / P);
}

/**
 * Calculate distribution pool from revenue event
 * Formula: D = α × dR
 *
 * @param {number} dR - Revenue from event
 * @param {number} alpha - Revenue share (0-1)
 * @returns {number} Distribution pool
 */
function calculateDistributionPool(dR, alpha) {
    return alpha * dR;
}

/**
 * Calculate per-token payout from distribution pool
 * Formula: payout_per_token = D / S
 *
 * @param {number} distributionPool - Total distribution pool
 * @param {number} S - Circulating supply (issued tokens only)
 * @returns {number} Payout per token
 */
function calculatePayoutPerToken(distributionPool, S) {
    if (S <= 0) return 0;
    return distributionPool / S;
}

/**
 * Calculate exit value for tokens
 * Formula: exit_value = tokens × P
 *
 * @param {number} tokens - Number of tokens to exit
 * @param {number} P - Current price
 * @returns {number} Exit value in dollars
 */
function calculateExitValue(tokens, P) {
    return tokens * P;
}

/**
 * Check if exit is allowed (supply floor)
 * Condition: S - tokens >= S_min
 *
 * @param {number} S - Current supply
 * @param {number} tokens - Tokens to burn
 * @param {number} S_min - Minimum supply floor
 * @returns {boolean} Whether exit is allowed
 */
function canExit(S, tokens, S_min) {
    return (S - tokens) >= S_min;
}

/**
 * Process exit queue against distribution pool
 * Rule: Exits are paid FIFO from distribution pool
 *
 * @param {Array} queue - Array of {id, owed} objects
 * @param {number} distributionPool - Available funds
 * @returns {{queue: Array, remainder: number, payments: Array}} Updated queue and remainder
 */
function processExitQueue(queue, distributionPool) {
    const payments = [];
    let remainder = distributionPool;
    const updatedQueue = [];

    for (const exit of queue) {
        if (remainder <= 0) {
            updatedQueue.push(exit);
            continue;
        }

        const payment = Math.min(exit.owed, remainder);
        remainder -= payment;

        if (payment < exit.owed) {
            // Partial payment
            updatedQueue.push({
                ...exit,
                owed: exit.owed - payment
            });
        }
        // If fully paid, exit is removed from queue

        if (payment > 0) {
            payments.push({
                id: exit.id,
                amount: payment,
                complete: payment >= exit.owed
            });
        }
    }

    return {
        queue: updatedQueue,
        remainder,
        payments
    };
}

/**
 * Calculate new supply after token minting
 *
 * @param {number} S - Current supply
 * @param {number} tokensMinted - New tokens minted
 * @returns {number} New supply
 */
function mintTokens(S, tokensMinted) {
    return S + tokensMinted;
}

/**
 * Calculate new supply after token burning (exit)
 * Enforces S_min floor
 *
 * @param {number} S - Current supply
 * @param {number} tokensBurned - Tokens to burn
 * @param {number} S_min - Minimum supply floor
 * @returns {number} New supply (never below S_min)
 */
function burnTokens(S, tokensBurned, S_min) {
    const newSupply = S - tokensBurned;
    return Math.max(newSupply, S_min);
}

/**
 * Full economic state update for a revenue event
 *
 * @param {Object} state - Current state {S, P, queue}
 * @param {Object} config - Configuration {k, alpha, S_min}
 * @param {number} dR - Revenue from event
 * @param {Array} participants - Array of {id, tokens, referralShare}
 * @returns {Object} Updated state and events
 */
function processRevenueEvent(state, config, dR, participants) {
    const { k, alpha, S_min } = config;
    let { S, queue } = state;
    const events = [];

    // 1. Calculate distribution pool
    const distributionPool = calculateDistributionPool(dR, alpha);

    // 2. Process exit queue first
    const queueResult = processExitQueue(queue, distributionPool);
    queue = queueResult.queue;
    const remainingPool = queueResult.remainder;

    if (queueResult.payments.length > 0) {
        events.push({
            type: 'queue_payments',
            payments: queueResult.payments
        });
    }

    // 3. Calculate token earnings for each participant
    const currentP = calculatePrice(S, k);
    const earnings = [];

    for (const p of participants) {
        const referralRevenue = dR * p.referralShare;
        const tokensEarned = calculateTokensEarned(referralRevenue, alpha, currentP);

        if (tokensEarned > 0) {
            S = mintTokens(S, tokensEarned);
            earnings.push({
                id: p.id,
                tokens: tokensEarned,
                revenue: referralRevenue
            });
        }
    }

    if (earnings.length > 0) {
        events.push({
            type: 'tokens_earned',
            earnings
        });
    }

    // 4. Calculate distributions to holders
    const newP = calculatePrice(S, k);
    const payoutPerToken = calculatePayoutPerToken(remainingPool, S);

    const distributions = [];
    for (const p of participants) {
        const payout = p.tokens * payoutPerToken;
        if (payout > 0) {
            distributions.push({
                id: p.id,
                amount: payout
            });
        }
    }

    if (distributions.length > 0) {
        events.push({
            type: 'distributions',
            payoutPerToken,
            distributions
        });
    }

    return {
        state: {
            S,
            P: newP,
            queue
        },
        events
    };
}

/**
 * Process an exit request
 *
 * @param {Object} state - Current state {S, P, queue}
 * @param {Object} config - Configuration {k, S_min}
 * @param {string} participantId - ID of exiting participant
 * @param {number} tokens - Tokens to exit
 * @returns {Object} Result with success, new state, exit value
 */
function processExit(state, config, participantId, tokens) {
    const { k, S_min } = config;
    const { S, P, queue } = state;

    // Check if exit is allowed
    if (!canExit(S, tokens, S_min)) {
        return {
            success: false,
            reason: 'Would violate minimum supply floor',
            state
        };
    }

    // Calculate exit value at current price
    const exitValue = calculateExitValue(tokens, P);

    // Burn tokens and update price
    const newS = burnTokens(S, tokens, S_min);
    const newP = calculatePrice(newS, k);

    // Add to exit queue
    const newQueue = [...queue, {
        id: participantId,
        owed: exitValue,
        tokens,
        enteredMonth: state.month || 0
    }];

    return {
        success: true,
        exitValue,
        state: {
            S: newS,
            P: newP,
            queue: newQueue
        }
    };
}

module.exports = {
    calculatePrice,
    calculateTokensEarned,
    calculateDistributionPool,
    calculatePayoutPerToken,
    calculateExitValue,
    canExit,
    processExitQueue,
    mintTokens,
    burnTokens,
    processRevenueEvent,
    processExit
};
