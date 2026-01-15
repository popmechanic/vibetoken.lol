/**
 * Participant Behavioral Models
 *
 * Each behavior model implements a decide() function that returns:
 * - { action: 'HOLD' } - Do nothing
 * - { action: 'EXIT', tokens: N } - Request exit of N tokens
 * - { action: 'LABOR', intensity: 0-1 } - Adjust referral effort
 *
 * Behaviors receive:
 * - state: Current simulation state (S, P, month, businessState, etc.)
 * - history: Array of past state snapshots
 * - participant: This participant's data (tokens, distributions, grant, etc.)
 * - params: Behavior-specific parameters
 */

// ==========================================
// RATIONAL MAXIMIZER
// ==========================================
/**
 * Calculates expected value and exits when NPV < exit value
 *
 * Params:
 * - discount_rate: Time preference (0.03 - 0.10)
 * - forecast_horizon: Months to consider (6-24)
 * - confidence: Trust in forecasts (0.5 - 1.0)
 * - exit_threshold: NPV ratio below which to exit (default 1.0)
 */
function decideRational(state, history, participant, params) {
    const {
        discount_rate = 0.05,
        forecast_horizon = 12,
        confidence = 0.7,
        exit_threshold = 1.0
    } = params;

    if (participant.tokens <= 0) {
        return { action: 'HOLD' };
    }

    // Calculate exit value now
    const exitValue = participant.tokens * state.P;

    // Estimate NPV of holding
    let npv = 0;

    // Estimate future distributions based on recent revenue trend
    const recentHistory = history.slice(-6);
    let avgRevenue = 0;
    let revenueGrowth = 0;

    if (recentHistory.length >= 2) {
        avgRevenue = recentHistory.reduce((sum, h) => sum + (h.revenue || 0), 0) / recentHistory.length;
        const firstHalf = recentHistory.slice(0, Math.floor(recentHistory.length / 2));
        const secondHalf = recentHistory.slice(Math.floor(recentHistory.length / 2));
        const firstAvg = firstHalf.reduce((sum, h) => sum + (h.revenue || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, h) => sum + (h.revenue || 0), 0) / secondHalf.length;
        revenueGrowth = firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
    }

    // Project future distributions
    for (let t = 1; t <= forecast_horizon; t++) {
        // Assume revenue grows/shrinks at observed rate
        const projectedRevenue = avgRevenue * Math.pow(1 + revenueGrowth, t);
        const projectedDistribution = projectedRevenue * state.alpha * (participant.tokens / state.S);

        // Discount to present value
        npv += projectedDistribution / Math.pow(1 + discount_rate, t);
    }

    // Add terminal value (tokens at projected future price)
    // Estimate future supply growth
    const projectedSupply = state.S * Math.pow(1 + revenueGrowth * 0.5, forecast_horizon);
    const projectedPrice = state.k * Math.sqrt(projectedSupply);
    const terminalValue = participant.tokens * projectedPrice;
    npv += terminalValue / Math.pow(1 + discount_rate, forecast_horizon);

    // Apply confidence adjustment
    npv *= confidence;

    // Decision: exit if NPV is below threshold relative to immediate exit value
    if (npv < exitValue * exit_threshold) {
        return {
            action: 'EXIT',
            tokens: participant.tokens,
            reason: `NPV ($${npv.toFixed(2)}) < exit value ($${exitValue.toFixed(2)})`
        };
    }

    // Also check for obvious failure signals
    if (state.businessState === 'failed') {
        return {
            action: 'EXIT',
            tokens: participant.tokens,
            reason: 'Business failed'
        };
    }

    return { action: 'HOLD' };
}

// ==========================================
// TREND FOLLOWER
// ==========================================
/**
 * Reacts to price momentum - panic sells on drops, holds on rises
 *
 * Params:
 * - lookback_window: Months to consider (2-6)
 * - panic_threshold: % drop that triggers exit (-0.15 to -0.30)
 * - fomo_threshold: % rise that triggers extra labor (0.20+)
 */
function decideTrendFollower(state, history, participant, params) {
    const {
        lookback_window = 4,
        panic_threshold = -0.20,
        fomo_threshold = 0.20
    } = params;

    if (participant.tokens <= 0) {
        return { action: 'HOLD' };
    }

    // Need enough history to compare
    if (history.length < lookback_window) {
        return { action: 'HOLD' };
    }

    // Calculate price change over lookback window
    const oldPrice = history[history.length - lookback_window]?.P || state.P;
    const priceChange = (state.P - oldPrice) / oldPrice;

    // Panic sell on significant drop
    if (priceChange < panic_threshold) {
        return {
            action: 'EXIT',
            tokens: participant.tokens,
            reason: `Price dropped ${(priceChange * 100).toFixed(1)}% (panic threshold: ${(panic_threshold * 100).toFixed(1)}%)`
        };
    }

    // FOMO: increase labor intensity on rises
    if (priceChange > fomo_threshold) {
        return {
            action: 'LABOR',
            intensity: Math.min(1, (priceChange - fomo_threshold) * 2),
            reason: `Price rose ${(priceChange * 100).toFixed(1)}% (FOMO mode)`
        };
    }

    return { action: 'HOLD' };
}

// ==========================================
// DIAMOND HANDS
// ==========================================
/**
 * Never exits regardless of price or business state
 *
 * Params:
 * - labor_intensity: Constant referral effort (0.0 - 0.5)
 */
function decideDiamondHands(state, history, participant, params) {
    const { labor_intensity = 0.1 } = params;

    // Diamond hands NEVER exit
    // Just maintain steady labor intensity
    return {
        action: 'LABOR',
        intensity: labor_intensity,
        reason: 'Diamond hands never sell'
    };
}

// ==========================================
// LIFE EVENT EXIT
// ==========================================
/**
 * Has external trigger for mandatory exit
 *
 * Params:
 * - trigger_month: Fixed exit month, OR
 * - trigger_value: Exit when holdings reach $X
 */
function decideLifeEvent(state, history, participant, params) {
    const { trigger_month, trigger_value } = params;

    if (participant.tokens <= 0 || participant.hasExited) {
        return { action: 'HOLD' };
    }

    // Check month trigger
    if (trigger_month && state.month >= trigger_month) {
        return {
            action: 'EXIT',
            tokens: participant.tokens,
            reason: `Life event at month ${trigger_month} (buying a car, etc.)`
        };
    }

    // Check value trigger
    const currentValue = participant.tokens * state.P;
    if (trigger_value && currentValue >= trigger_value) {
        return {
            action: 'EXIT',
            tokens: participant.tokens,
            reason: `Holdings reached target value $${trigger_value}`
        };
    }

    return { action: 'HOLD' };
}

// ==========================================
// SKEPTIC
// ==========================================
/**
 * Exits early if business doesn't validate expectations
 *
 * Params:
 * - patience: Months to wait before evaluating (3-12)
 * - validation_threshold: Revenue growth % needed to stay (0.05 - 0.20)
 */
function decideSkeptic(state, history, participant, params) {
    const {
        patience = 6,
        validation_threshold = 0.10
    } = params;

    if (participant.tokens <= 0 || participant.hasExited) {
        return { action: 'HOLD' };
    }

    // Wait for patience period
    if (state.month < patience) {
        return { action: 'HOLD' };
    }

    // Calculate revenue growth since start
    const startRevenue = history[0]?.revenue || 0;
    const currentRevenue = state.revenue || 0;

    // Avoid division by zero
    const growth = startRevenue > 0
        ? (currentRevenue - startRevenue) / startRevenue
        : (currentRevenue > 0 ? 1 : 0);

    // Check for business failure
    if (state.businessState === 'failed') {
        return {
            action: 'EXIT',
            tokens: participant.tokens,
            reason: 'Business failed - skeptic was right'
        };
    }

    // Exit if growth doesn't meet expectations
    if (growth < validation_threshold) {
        return {
            action: 'EXIT',
            tokens: participant.tokens,
            reason: `Growth (${(growth * 100).toFixed(1)}%) below threshold (${(validation_threshold * 100).toFixed(1)}%)`
        };
    }

    // Satisfied with progress, continue holding
    return { action: 'HOLD' };
}

// ==========================================
// SPECULATOR
// ==========================================
/**
 * Attempts to time the market, often incorrectly
 *
 * Params:
 * - timing_skill: Accuracy of predictions (0.3 - 0.7, where 0.5 = random)
 * - trade_frequency: How often they try to optimize (0.1 - 0.5)
 * - exit_portion: Fraction of tokens to exit when trading (0.3 - 1.0)
 */
function decideSpeculator(state, history, participant, params, rng) {
    const {
        timing_skill = 0.45,   // Slightly worse than random
        trade_frequency = 0.2,
        exit_portion = 0.5
    } = params;

    if (participant.tokens <= 0) {
        return { action: 'HOLD' };
    }

    // Decide whether to trade this month
    const willTrade = rng.random() < trade_frequency;
    if (!willTrade) {
        return { action: 'HOLD' };
    }

    // Speculator tries to predict price direction
    // They think they know, but they're often wrong

    // Actual trend (what's really happening)
    let actualTrend = 0;
    if (history.length >= 3) {
        const recentPrices = history.slice(-3).map(h => h.P);
        actualTrend = (recentPrices[2] - recentPrices[0]) / recentPrices[0];
    }

    // Speculator's noisy perception
    const noise = (rng.random() - 0.5) * 0.4; // +/- 20% noise
    const perceivedTrend = actualTrend + noise;

    // They think they should exit if trend is negative
    // But their prediction is only correct (timing_skill * 100)% of the time
    const predictionCorrect = rng.random() < timing_skill;

    // Speculator's action based on (possibly wrong) perception
    const shouldSell = predictionCorrect
        ? actualTrend < -0.05    // Correct: sell if actually declining
        : perceivedTrend < -0.05; // Wrong: sell based on noisy perception

    if (shouldSell) {
        const tokensToExit = Math.floor(participant.tokens * exit_portion);
        if (tokensToExit > 0) {
            return {
                action: 'EXIT',
                tokens: tokensToExit,
                reason: `Speculator thinks price will drop (skill: ${(timing_skill * 100).toFixed(0)}%)`
            };
        }
    }

    return { action: 'HOLD' };
}

// ==========================================
// HUSTLER
// ==========================================
/**
 * Focused on earning tokens through labor, reluctant to exit
 *
 * Params:
 * - labor_intensity: High referral effort (0.3 - 0.8)
 * - exit_aversion: Reluctance to sell (0.7 - 1.0)
 * - desperation_threshold: Price drop % that overcomes aversion (-0.50 to -0.70)
 */
function decideHustler(state, history, participant, params) {
    const {
        labor_intensity = 0.5,
        exit_aversion = 0.8,
        desperation_threshold = -0.50
    } = params;

    // Hustlers focus on earning, not trading
    // High labor intensity by default
    let intensity = labor_intensity;

    // Increase hustle if price is rising (momentum)
    if (history.length >= 3) {
        const recentPrices = history.slice(-3).map(h => h.P);
        const trend = (recentPrices[2] - recentPrices[0]) / recentPrices[0];
        if (trend > 0.1) {
            intensity = Math.min(1, intensity * 1.3); // Hustle harder when momentum is good
        }
    }

    // Only exit if things are truly desperate
    if (history.length >= 6) {
        const oldPrice = history[history.length - 6]?.P || state.P;
        const priceChange = (state.P - oldPrice) / oldPrice;

        if (priceChange < desperation_threshold) {
            // Even then, only exit a portion due to aversion
            const exitPortion = 1 - exit_aversion;
            const tokensToExit = Math.floor(participant.tokens * exitPortion);

            if (tokensToExit > 0) {
                return {
                    action: 'EXIT',
                    tokens: tokensToExit,
                    reason: `Desperate exit - price dropped ${(priceChange * 100).toFixed(1)}%`
                };
            }
        }
    }

    return {
        action: 'LABOR',
        intensity,
        reason: 'Hustler keeps hustling'
    };
}

// ==========================================
// BEHAVIOR FACTORY
// ==========================================
/**
 * Create a behavior decision function for a participant
 *
 * @param {string} behaviorType - Type of behavior
 * @param {Object} params - Behavior-specific parameters
 * @param {Object} rng - Random number generator (for stochastic behaviors)
 * @returns {Function} Decision function
 */
function createBehavior(behaviorType, params = {}, rng = null) {
    // Default RNG if not provided (for speculator)
    const defaultRng = rng || {
        random: () => Math.random(),
        bernoulli: (p) => Math.random() < p
    };

    switch (behaviorType) {
        case 'rational':
            return (state, history, participant) =>
                decideRational(state, history, participant, params);

        case 'trend_follower':
            return (state, history, participant) =>
                decideTrendFollower(state, history, participant, params);

        case 'diamond_hands':
            return (state, history, participant) =>
                decideDiamondHands(state, history, participant, params);

        case 'life_event':
            return (state, history, participant) =>
                decideLifeEvent(state, history, participant, params);

        case 'skeptic':
            return (state, history, participant) =>
                decideSkeptic(state, history, participant, params);

        case 'speculator':
            return (state, history, participant) =>
                decideSpeculator(state, history, participant, params, defaultRng);

        case 'hustler':
            return (state, history, participant) =>
                decideHustler(state, history, participant, params);

        default:
            throw new Error(`Unknown behavior type: ${behaviorType}`);
    }
}

module.exports = {
    decideRational,
    decideTrendFollower,
    decideDiamondHands,
    decideLifeEvent,
    decideSkeptic,
    decideSpeculator,
    decideHustler,
    createBehavior
};
