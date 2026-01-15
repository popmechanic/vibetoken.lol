/**
 * Business Revenue Models
 *
 * Three archetypes with distinct revenue patterns:
 * - micro: High variance, spiky, common zeros
 * - startup: Binary state machine (building → breakthrough/failed)
 * - enterprise: Compounding with bounded noise
 *
 * All models use seeded RNG for reproducibility.
 */

/**
 * Seeded random number generator (Mulberry32)
 * Allows reproducible simulations
 */
function createRNG(seed) {
    let state = seed;

    function random() {
        state |= 0;
        state = state + 0x6D2B79F5 | 0;
        let t = Math.imul(state ^ state >>> 15, 1 | state);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // Box-Muller transform for normal distribution
    function normal(mean = 0, stddev = 1) {
        const u1 = random();
        const u2 = random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z * stddev;
    }

    // Bernoulli trial
    function bernoulli(p) {
        return random() < p;
    }

    return { random, normal, bernoulli };
}

/**
 * Business state machine states
 */
const BusinessState = {
    BUILDING: 'building',      // Pre-revenue, burning runway
    LAUNCHED: 'launched',      // Product out, seeking traction
    GROWING: 'growing',        // Post-breakthrough, exponential
    DECLINING: 'declining',    // Negative trend
    FAILED: 'failed'           // Terminal, zero revenue
};

// ==========================================
// MICRO ARCHETYPE
// ==========================================
/**
 * Very small businesses with high variance, spiky revenue
 *
 * Characteristics:
 * - Base MRR: $500-$2,000
 * - High coefficient of variation (50-100%)
 * - Common zero-revenue months
 * - Spike potential: 2-5x in good months
 * - Failure: 3+ consecutive zeros
 */
function createMicroBusiness(config, rng) {
    const {
        base_mrr = 1000,
        growth_mean = 0.02,         // 2% expected monthly growth
        growth_stddev = 0.40,       // 40% standard deviation (very high)
        spike_probability = 0.08,   // 8% chance of spike month
        spike_multiplier = 3.0,     // Spikes are 3x normal
        zero_probability = 0.15,    // 15% chance of zero month
        failure_threshold = 3       // 3 consecutive zeros = failure
    } = config.params || {};

    let currentMRR = base_mrr;
    let consecutiveZeros = 0;
    let state = BusinessState.LAUNCHED;

    function generateRevenue(month) {
        if (state === BusinessState.FAILED) {
            return { revenue: 0, state, failed: true };
        }

        // Check for zero month
        if (rng.bernoulli(zero_probability)) {
            consecutiveZeros++;
            if (consecutiveZeros >= failure_threshold) {
                state = BusinessState.FAILED;
                return { revenue: 0, state, failed: true, failureReason: 'extended_zeros' };
            }
            return { revenue: 0, state, failed: false };
        }

        consecutiveZeros = 0;

        // Check for spike
        let multiplier = 1;
        if (rng.bernoulli(spike_probability)) {
            multiplier = spike_multiplier * (0.8 + rng.random() * 0.4); // 80-120% of spike
        }

        // Apply growth with high variance
        const growth = rng.normal(growth_mean, growth_stddev);
        currentMRR = Math.max(0, currentMRR * (1 + growth) * multiplier);

        return {
            revenue: currentMRR,
            state,
            failed: false,
            isSpike: multiplier > 1
        };
    }

    return {
        type: 'micro',
        generateRevenue,
        getState: () => state,
        getMRR: () => currentMRR
    };
}

// ==========================================
// STARTUP ARCHETYPE
// ==========================================
/**
 * Boom-or-bust pattern with long runway
 *
 * States:
 * - BUILDING: Near-zero revenue, burning time
 * - LAUNCHED: Monthly Bernoulli trial for breakthrough
 * - GROWING: Exponential growth post-breakthrough
 * - FAILED: Never achieved breakthrough
 *
 * Characteristics:
 * - 70-80% failure rate
 * - Hockey stick when successful
 * - Long period of low/zero revenue
 */
function createStartupBusiness(config, rng) {
    const {
        base_mrr = 200,                      // Tiny initial revenue
        runway_months = 12,                  // Time before must breakthrough
        breakthrough_prob = 0.08,            // 8% per month chance
        hockey_stick_multiplier = 5.0,       // Initial breakthrough boost
        post_breakthrough_growth = 0.15,     // 15% monthly growth after
        growth_stddev = 0.08,                // Lower variance once growing
        building_revenue_range = [0, 500],   // Random revenue while building
        decline_rate = 0.05                  // 5% decline when failing
    } = config.params || {};

    let currentMRR = base_mrr;
    let state = BusinessState.BUILDING;
    let monthsSinceLaunch = 0;
    let monthsSinceBreakthrough = 0;

    function generateRevenue(month) {
        if (state === BusinessState.FAILED) {
            return { revenue: 0, state, failed: true };
        }

        // BUILDING phase: minimal revenue, counting down runway
        if (state === BusinessState.BUILDING) {
            monthsSinceLaunch++;

            // Transition to LAUNCHED after some building time
            if (monthsSinceLaunch >= 3) {
                state = BusinessState.LAUNCHED;
            }

            // Random small revenue during building
            const [min, max] = building_revenue_range;
            currentMRR = min + rng.random() * (max - min);
            return { revenue: currentMRR, state, failed: false };
        }

        // LAUNCHED phase: seeking breakthrough
        if (state === BusinessState.LAUNCHED) {
            monthsSinceLaunch++;

            // Check for breakthrough
            if (rng.bernoulli(breakthrough_prob)) {
                state = BusinessState.GROWING;
                currentMRR = currentMRR * hockey_stick_multiplier;
                return {
                    revenue: currentMRR,
                    state,
                    failed: false,
                    breakthrough: true
                };
            }

            // Check for failure (runway exhausted)
            if (monthsSinceLaunch >= runway_months) {
                state = BusinessState.FAILED;
                return {
                    revenue: 0,
                    state,
                    failed: true,
                    failureReason: 'runway_exhausted'
                };
            }

            // Modest revenue while seeking product-market fit
            const noise = rng.normal(0, 0.3);
            currentMRR = Math.max(0, currentMRR * (1 + noise));
            return { revenue: currentMRR, state, failed: false };
        }

        // GROWING phase: post-breakthrough exponential
        if (state === BusinessState.GROWING) {
            monthsSinceBreakthrough++;

            // Growth tapers over time
            const taper = Math.max(0.5, 1 - monthsSinceBreakthrough * 0.02);
            const growth = rng.normal(post_breakthrough_growth * taper, growth_stddev);
            currentMRR = currentMRR * (1 + growth);

            return { revenue: currentMRR, state, failed: false };
        }

        return { revenue: 0, state, failed: true };
    }

    return {
        type: 'startup',
        generateRevenue,
        getState: () => state,
        getMRR: () => currentMRR
    };
}

// ==========================================
// ENTERPRISE ARCHETYPE
// ==========================================
/**
 * Larger businesses with compounding growth
 *
 * Characteristics:
 * - Higher base MRR ($10k-$100k)
 * - Lower variance (CV 15-30%)
 * - Compounding growth with seasonal patterns
 * - Failure: gradual decline, not sudden death
 */
function createEnterpriseBusiness(config, rng) {
    const {
        base_mrr = 25000,                // $25k starting MRR
        growth_rate = 0.05,              // 5% monthly base growth
        growth_stddev = 0.04,            // 4% standard deviation
        seasonality_amplitude = 0.10,    // 10% seasonal swing
        seasonality_peak_month = 11,     // Q4 peak (November)
        decline_threshold = 6,           // 6 months negative = declining
        decline_rate = 0.03              // 3% decline rate when failing
    } = config.params || {};

    let currentMRR = base_mrr;
    let state = BusinessState.GROWING;
    let consecutiveNegativeMonths = 0;
    let cumulativeGrowth = 0;

    function generateRevenue(month) {
        if (state === BusinessState.FAILED) {
            // Even failed enterprises have some residual revenue
            currentMRR = currentMRR * (1 - decline_rate);
            return { revenue: Math.max(0, currentMRR), state, failed: true };
        }

        // Calculate seasonal factor (sinusoidal)
        const monthInYear = (month - 1) % 12;
        const seasonalPhase = ((monthInYear - seasonality_peak_month) / 12) * 2 * Math.PI;
        const seasonalFactor = seasonality_amplitude * Math.cos(seasonalPhase);

        // Base growth with noise
        const baseGrowth = rng.normal(growth_rate, growth_stddev);
        const totalGrowth = baseGrowth + seasonalFactor;

        // Track consecutive negative months
        if (totalGrowth < 0) {
            consecutiveNegativeMonths++;
        } else {
            consecutiveNegativeMonths = 0;
        }

        // Check for decline state
        if (consecutiveNegativeMonths >= decline_threshold) {
            state = BusinessState.DECLINING;
        }

        // Apply growth
        currentMRR = currentMRR * (1 + totalGrowth);
        cumulativeGrowth += totalGrowth;

        // Declining state accelerates downward
        if (state === BusinessState.DECLINING) {
            currentMRR = currentMRR * (1 - decline_rate);

            // Check for terminal failure
            if (currentMRR < base_mrr * 0.1) {
                state = BusinessState.FAILED;
                return {
                    revenue: currentMRR,
                    state,
                    failed: true,
                    failureReason: 'gradual_decline'
                };
            }
        }

        return {
            revenue: currentMRR,
            state,
            failed: false,
            seasonal: seasonalFactor > 0
        };
    }

    return {
        type: 'enterprise',
        generateRevenue,
        getState: () => state,
        getMRR: () => currentMRR
    };
}

// ==========================================
// FACTORY FUNCTION
// ==========================================
/**
 * Create a business model based on archetype
 *
 * @param {Object} config - Business configuration
 * @param {string} config.archetype - 'micro', 'startup', or 'enterprise'
 * @param {number} config.base_mrr - Starting MRR
 * @param {Object} config.params - Archetype-specific parameters
 * @param {number|null} seed - Random seed for reproducibility
 * @returns {Object} Business model with generateRevenue method
 */
function createBusiness(config, seed = null) {
    const rng = createRNG(seed || Date.now());

    switch (config.archetype) {
        case 'micro':
            return createMicroBusiness(config, rng);
        case 'startup':
            return createStartupBusiness(config, rng);
        case 'enterprise':
            return createEnterpriseBusiness(config, rng);
        default:
            throw new Error(`Unknown archetype: ${config.archetype}`);
    }
}

/**
 * Run a quick simulation to see revenue trajectory
 * Useful for testing and visualization
 */
function simulateBusinessTrajectory(config, months = 36, seed = null) {
    const business = createBusiness(config, seed);
    const trajectory = [];

    for (let month = 1; month <= months; month++) {
        const result = business.generateRevenue(month);
        trajectory.push({
            month,
            revenue: result.revenue,
            state: result.state,
            failed: result.failed,
            ...result
        });

        if (result.failed && result.state === BusinessState.FAILED) {
            // Fill remaining months with zeros
            for (let m = month + 1; m <= months; m++) {
                trajectory.push({
                    month: m,
                    revenue: 0,
                    state: BusinessState.FAILED,
                    failed: true
                });
            }
            break;
        }
    }

    return {
        trajectory,
        finalState: business.getState(),
        finalMRR: business.getMRR(),
        totalRevenue: trajectory.reduce((sum, t) => sum + t.revenue, 0),
        survived: business.getState() !== BusinessState.FAILED
    };
}

module.exports = {
    createRNG,
    BusinessState,
    createMicroBusiness,
    createStartupBusiness,
    createEnterpriseBusiness,
    createBusiness,
    simulateBusinessTrajectory
};
