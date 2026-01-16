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

    // Log-normal distribution (right-skewed, fat-tailed)
    // Returns values with median exp(mu) and right tail controlled by sigma
    // Useful for modeling business outcomes where most are modest but some break out
    function logNormal(mu = 0, sigma = 1) {
        const normalValue = normal(mu, sigma);
        return Math.exp(normalValue);
    }

    return { random, normal, bernoulli, logNormal };
}

/**
 * Business state machine states
 */
const BusinessState = {
    BUILDING: 'building',      // Pre-revenue, burning runway
    LAUNCHED: 'launched',      // Product out, seeking traction
    GROWING: 'growing',        // Post-breakthrough, exponential
    PLATEAUED: 'plateaued',    // Stable at ceiling, not growing or failing
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
 * - Log-normal growth distribution (right-skewed, fat-tailed)
 * - Common zero-revenue months
 * - Spike potential: 2-5x in good months (viral moments)
 * - Failure: consecutive zeros
 * - Plateau: most businesses stabilize at a ceiling (~70%)
 * - Breakout: rare viral success possible at any time (~2-10%)
 *
 * State transitions:
 * - LAUNCHED → PLATEAUED (after plateau_months with low growth)
 * - LAUNCHED → FAILED (consecutive zeros)
 * - PLATEAUED → GROWING (rare breakout)
 * - PLATEAUED → FAILED (consecutive zeros)
 * - Any state → spike month (viral moment)
 */
function createMicroBusiness(config, rng) {
    const {
        base_mrr = 1000,
        // Log-normal parameters: median growth near 0, but right tail allows big months
        growth_mu = -0.02,          // Log-normal location (slightly negative median)
        growth_sigma = 0.35,        // Log-normal scale (controls tail fatness)
        spike_probability = 0.08,   // 8% chance of spike month (viral moment)
        spike_multiplier = 3.0,     // Spikes are 3x normal
        zero_probability = 0.12,    // 12% chance of zero month
        failure_threshold = 4,      // 4 consecutive zeros = failure (extended from 3)
        // Plateau mechanics
        plateau_months = 8,         // Months before plateau check begins
        plateau_probability = 0.12, // Monthly probability of entering plateau
        plateau_ceiling = null,     // If set, caps MRR at this value when plateaued
        plateau_variance = 0.08,    // Low variance while plateaued (±8%)
        // Breakout mechanics (fat tail)
        breakout_probability = 0.02 // 2% monthly chance of breakout from plateau
    } = config.params || {};

    let currentMRR = base_mrr;
    let consecutiveZeros = 0;
    let state = BusinessState.LAUNCHED;
    let monthsActive = 0;
    let plateauCeiling = plateau_ceiling || base_mrr * (1.5 + rng.random() * 2); // Random ceiling 1.5-3.5x base

    function generateRevenue(month) {
        monthsActive++;

        if (state === BusinessState.FAILED) {
            return { revenue: 0, state, failed: true };
        }

        // Check for zero month (applies to all non-failed states)
        if (rng.bernoulli(zero_probability)) {
            consecutiveZeros++;
            if (consecutiveZeros >= failure_threshold) {
                state = BusinessState.FAILED;
                return { revenue: 0, state, failed: true, failureReason: 'extended_zeros' };
            }
            return { revenue: 0, state, failed: false };
        }

        consecutiveZeros = 0;

        // Check for viral spike (can happen in any state - this is the fat tail)
        let multiplier = 1;
        let isSpike = false;
        if (rng.bernoulli(spike_probability)) {
            // Log-normal spike magnitude: usually 2-4x, occasionally 5-10x
            multiplier = spike_multiplier * rng.logNormal(0, 0.3);
            isSpike = true;
            // Viral success can break out of plateau
            if (state === BusinessState.PLATEAUED && multiplier > 4) {
                state = BusinessState.GROWING;
            }
        }

        // PLATEAUED state: stable with low variance, occasional breakout
        if (state === BusinessState.PLATEAUED) {
            // Check for breakout (rare but possible)
            if (rng.bernoulli(breakout_probability)) {
                state = BusinessState.GROWING;
                multiplier = Math.max(multiplier, 2.0 + rng.random()); // At least 2-3x boost
                return {
                    revenue: currentMRR * multiplier,
                    state,
                    failed: false,
                    isSpike: true,
                    breakout: true
                };
            }

            // Otherwise, stable revenue with low variance around ceiling
            const noise = rng.normal(0, plateau_variance);
            currentMRR = plateauCeiling * (1 + noise) * multiplier;
            currentMRR = Math.max(base_mrr * 0.1, currentMRR); // Floor at 10% of base

            return {
                revenue: currentMRR,
                state,
                failed: false,
                isSpike
            };
        }

        // GROWING state: post-breakout, strong growth
        if (state === BusinessState.GROWING) {
            // Growth with lower variance than LAUNCHED
            const growth = rng.logNormal(0.08, 0.15) - 1; // ~8% median growth
            currentMRR = currentMRR * (1 + growth) * multiplier;

            return {
                revenue: currentMRR,
                state,
                failed: false,
                isSpike
            };
        }

        // LAUNCHED state: high variance, seeking product-market fit
        // Use log-normal for right-skewed growth (most months modest, some big)
        const growthMultiplier = rng.logNormal(growth_mu, growth_sigma);
        currentMRR = Math.max(0, currentMRR * growthMultiplier * multiplier);

        // Check for plateau transition (after initial months)
        if (monthsActive >= plateau_months) {
            // More likely to plateau if revenue is near or below ceiling
            const atCeiling = currentMRR >= plateauCeiling * 0.8;
            const plateauChance = atCeiling ? plateau_probability * 1.5 : plateau_probability;

            if (rng.bernoulli(plateauChance)) {
                state = BusinessState.PLATEAUED;
                // Snap to ceiling when plateauing
                currentMRR = Math.min(currentMRR, plateauCeiling);
            }
        }

        return {
            revenue: currentMRR,
            state,
            failed: false,
            isSpike
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
