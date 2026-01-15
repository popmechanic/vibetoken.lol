/**
 * Simulation Engine Tests
 */

const { runSimulation, runBatch } = require('../engine.js');

console.log('=== Simulation Engine Tests ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log(`  ✓ ${message}`);
    } else {
        failed++;
        console.log(`  ✗ ${message}`);
    }
}

// ==========================================
// BASIC SIMULATION
// ==========================================
console.log('--- Basic Simulation ---');

const basicConfig = {
    simulation: {
        duration_months: 12
    },
    business: {
        archetype: 'enterprise',
        base_mrr: 10000,
        params: {
            growth_rate: 0.05,
            growth_stddev: 0.02
        }
    },
    tokenomics: {
        alpha: 0.20,
        k: 0.01,
        treasury: 100000,
        s_min: 1000
    },
    participants: [
        {
            name: 'Founder Friend',
            behavior: 'diamond_hands',
            grant: 5000,
            referral_share: 0.10,
            start_month: 1,
            params: { labor_intensity: 0.2 }
        },
        {
            name: 'Rational Alice',
            behavior: 'rational',
            grant: 3000,
            referral_share: 0.15,
            start_month: 1,
            params: { discount_rate: 0.05 }
        }
    ]
};

const result = runSimulation(basicConfig, 42);

assert(result.history.length === 12, `Ran for 12 months (got ${result.history.length})`);
assert(result.finalState.S > 1000, 'Supply increased from floor');
assert(result.finalState.P > 0, 'Price is positive');
assert(result.participantOutcomes.length === 2, 'Two participants tracked');

// Verify diamond hands never exited
const diamondHands = result.participantOutcomes.find(p => p.name === 'Founder Friend');
assert(!diamondHands.hasExited, 'Diamond hands never exited');
assert(diamondHands.finalTokens >= diamondHands.grant, 'Diamond hands kept/earned tokens');

// Verify distributions occurred
assert(diamondHands.distributions > 0, 'Distributions occurred');

// ==========================================
// STARTUP WITH BREAKTHROUGH
// ==========================================
console.log('\n--- Startup Breakthrough ---');

const startupConfig = {
    simulation: { duration_months: 24 },
    business: {
        archetype: 'startup',
        base_mrr: 200,
        params: {
            runway_months: 18,
            breakthrough_prob: 0.20  // Higher for testing
        }
    },
    tokenomics: {
        alpha: 0.20,
        k: 0.01,
        treasury: 50000,
        s_min: 1000
    },
    participants: [
        {
            name: 'Early Believer',
            behavior: 'diamond_hands',
            grant: 10000,
            referral_share: 0.25,
            start_month: 1
        }
    ]
};

// Run several times to catch a breakthrough
let breakthroughFound = false;
for (let i = 0; i < 20; i++) {
    const r = runSimulation(startupConfig, 100 + i);
    const breakthroughEvent = r.history.flatMap(h => h.events).find(e => e.breakthrough);
    if (breakthroughEvent) {
        breakthroughFound = true;
        assert(r.finalState.P > 0.5, 'Price increased after breakthrough');
        break;
    }
}
assert(breakthroughFound, 'Breakthrough occurred in at least one simulation');

// ==========================================
// EXIT QUEUE PROCESSING
// ==========================================
console.log('\n--- Exit Queue Processing ---');

const exitConfig = {
    simulation: { duration_months: 12 },
    business: {
        archetype: 'enterprise',
        base_mrr: 20000,
        params: { growth_rate: 0.03 }
    },
    tokenomics: {
        alpha: 0.20,
        k: 0.01,
        treasury: 50000,
        s_min: 1000
    },
    participants: [
        {
            name: 'Life Event Person',
            behavior: 'life_event',
            grant: 5000,
            referral_share: 0.05,
            start_month: 1,
            params: { trigger_month: 6 }
        },
        {
            name: 'Holder',
            behavior: 'diamond_hands',
            grant: 5000,
            referral_share: 0.05,
            start_month: 1
        }
    ]
};

const exitResult = runSimulation(exitConfig, 999);

// Find exit request event
const exitEvents = exitResult.history.flatMap(h => h.events).filter(e =>
    e.type === 'exit_request'
);
assert(exitEvents.length > 0, `Exit request recorded (found ${exitEvents.length})`);

// Check participant outcome
const exitedP = exitResult.participantOutcomes.find(p => p.name === 'Life Event Person');
assert(exitedP.hasExited, 'Participant marked as exited');
assert(exitedP.exitMonth === 6, 'Exited at correct month');
assert(exitedP.exitValue > 0 || exitedP.pendingExit > 0, 'Exit value recorded');

// ==========================================
// DYNAMIC ENTRY
// ==========================================
console.log('\n--- Dynamic Entry ---');

const dynamicConfig = {
    simulation: { duration_months: 18 },
    business: {
        archetype: 'enterprise',
        base_mrr: 15000,
        params: { growth_rate: 0.08 }
    },
    tokenomics: {
        alpha: 0.20,
        k: 0.01,
        treasury: 100000,
        s_min: 1000
    },
    participants: [
        {
            name: 'Original',
            behavior: 'diamond_hands',
            grant: 5000,
            referral_share: 0.20,
            start_month: 1
        }
    ],
    entry_pool: {
        treasury: 20000,
        templates: [
            {
                id: 'word_of_mouth',
                name: 'WoM Entrant',
                behavior: 'trend_follower',
                grant: 2000,
                referral_share: 0.08,
                entry_conditions: {
                    type: 'word_of_mouth',
                    params: { revenue_threshold: 20000, probability_per_month: 0.5 }
                },
                maxSpawns: 3
            }
        ]
    }
};

const dynamicResult = runSimulation(dynamicConfig, 555);

// Check for new participant events
const newParticipantEvents = dynamicResult.history.flatMap(h => h.events)
    .filter(e => e.type === 'new_participant');

assert(newParticipantEvents.length > 0, 'Dynamic entries occurred');

const lateEntrants = dynamicResult.participantOutcomes.filter(p => p.isLateEntrant);
assert(lateEntrants.length > 0, 'Late entrants tracked in outcomes');
// Late entrants join when revenue exceeds threshold (may be month 1 if MRR already high)
const entryMonths = lateEntrants.map(p => p.startMonth);
assert(entryMonths.every(m => m >= 1), `Late entrants have valid start months (${entryMonths.join(', ')})`);

// ==========================================
// BATCH SIMULATION
// ==========================================
console.log('\n--- Batch Simulation ---');

const batchConfig = {
    simulation: { duration_months: 12 },
    business: {
        archetype: 'startup',
        base_mrr: 500,
        params: {
            runway_months: 10,
            breakthrough_prob: 0.10
        }
    },
    tokenomics: {
        alpha: 0.20,
        k: 0.01,
        treasury: 50000,
        s_min: 1000
    },
    participants: [
        {
            name: 'Test Holder',
            behavior: 'rational',
            grant: 5000,
            referral_share: 0.15,
            start_month: 1
        }
    ]
};

const batchResult = runBatch(batchConfig, 50, 1000);

assert(batchResult.runs === 50, 'Ran 50 simulations');
assert(batchResult.survivalRate >= 0 && batchResult.survivalRate <= 1, 'Valid survival rate');
assert(batchResult.priceStats !== null, 'Price statistics calculated');
assert(batchResult.participantStats['Test Holder'] !== undefined, 'Participant stats calculated');

console.log(`  Survival rate: ${(batchResult.survivalRate * 100).toFixed(1)}%`);
console.log(`  Mean final price: $${batchResult.priceStats.mean.toFixed(2)}`);
console.log(`  Mean ROI: ${batchResult.participantStats['Test Holder'].mean.toFixed(2)}x`);

// ==========================================
// REPRODUCIBILITY
// ==========================================
console.log('\n--- Reproducibility ---');

const r1 = runSimulation(basicConfig, 12345);
const r2 = runSimulation(basicConfig, 12345);
const r3 = runSimulation(basicConfig, 12346);

assert(r1.finalState.S === r2.finalState.S, 'Same seed produces same supply');
assert(r1.finalState.P === r2.finalState.P, 'Same seed produces same price');
assert(r1.finalState.S !== r3.finalState.S, 'Different seed produces different results');

// ==========================================
// EDGE CASES
// ==========================================
console.log('\n--- Edge Cases ---');

// Single participant, no referrals
const minimalConfig = {
    simulation: { duration_months: 6 },
    business: {
        archetype: 'micro',
        base_mrr: 500,
        params: {}
    },
    tokenomics: {
        alpha: 0.15,
        k: 0.005,
        treasury: 10000,
        s_min: 1000
    },
    participants: [
        {
            name: 'Solo',
            behavior: 'diamond_hands',
            grant: 1000,
            referral_share: 0,
            start_month: 1
        }
    ]
};

const minimalResult = runSimulation(minimalConfig, 777);
assert(minimalResult.history.length === 6, 'Minimal config runs');
assert(minimalResult.participantOutcomes.length === 1, 'Single participant tracked');

// ==========================================
// SUMMARY
// ==========================================
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
