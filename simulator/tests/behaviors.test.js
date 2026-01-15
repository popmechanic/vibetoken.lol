/**
 * Behavioral Model Tests
 */

const { createBehavior } = require('../behaviors.js');
const { createRNG } = require('../revenue.js');

console.log('=== Behavioral Model Tests ===\n');

// Helper to create test state
function makeState(overrides = {}) {
    return {
        month: 12,
        S: 10000,
        P: 1.00,
        k: 0.01,
        alpha: 0.20,
        revenue: 5000,
        businessState: 'growing',
        ...overrides
    };
}

function makeParticipant(overrides = {}) {
    return {
        id: 'test',
        tokens: 1000,
        grant: 1000,
        distributions: 50,
        hasExited: false,
        ...overrides
    };
}

function makeHistory(months, pricePattern = 'stable') {
    const history = [];
    for (let i = 0; i < months; i++) {
        let P = 1.00;
        let revenue = 5000;

        switch (pricePattern) {
            case 'rising':
                P = 0.80 + (i / months) * 0.40; // 0.80 -> 1.20
                revenue = 4000 + (i / months) * 2000;
                break;
            case 'falling':
                P = 1.20 - (i / months) * 0.40; // 1.20 -> 0.80
                revenue = 6000 - (i / months) * 2000;
                break;
            case 'crash':
                P = 1.00 - (i / months) * 0.60; // 1.00 -> 0.40
                revenue = 5000 - (i / months) * 4000;
                break;
            case 'stable':
            default:
                P = 1.00 + (Math.random() - 0.5) * 0.05;
                break;
        }

        history.push({
            month: i + 1,
            S: 10000,
            P,
            revenue,
            businessState: 'growing'
        });
    }
    return history;
}

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
// RATIONAL MAXIMIZER
// ==========================================
console.log('--- Rational Maximizer ---');

const rational = createBehavior('rational', {
    discount_rate: 0.05,
    forecast_horizon: 12,
    confidence: 0.7
});

// Should HOLD when business is growing
let state = makeState({ businessState: 'growing', revenue: 8000 });
let history = makeHistory(12, 'rising');
let participant = makeParticipant();
let decision = rational(state, history, participant);
assert(decision.action === 'HOLD', 'Holds when business growing with positive trend');

// Should EXIT when business has failed
state = makeState({ businessState: 'failed', revenue: 0 });
history = makeHistory(12, 'crash');
decision = rational(state, history, participant);
assert(decision.action === 'EXIT', 'Exits when business has failed');

// Should EXIT when NPV is clearly below exit value (declining revenue)
state = makeState({ businessState: 'declining', revenue: 1000 });
history = makeHistory(12, 'crash');
decision = rational(state, history, participant);
assert(decision.action === 'EXIT', 'Exits when NPV < exit value');

// ==========================================
// TREND FOLLOWER
// ==========================================
console.log('\n--- Trend Follower ---');

const trendFollower = createBehavior('trend_follower', {
    lookback_window: 4,
    panic_threshold: -0.20,
    fomo_threshold: 0.20
});

// Should HOLD on stable prices
state = makeState({ P: 1.00 });
history = makeHistory(6, 'stable');
participant = makeParticipant();
decision = trendFollower(state, history, participant);
assert(decision.action === 'HOLD', 'Holds on stable prices');

// Should EXIT on price crash
state = makeState({ P: 0.70 }); // 30% drop
history = [
    { P: 1.00 }, { P: 0.95 }, { P: 0.85 }, { P: 0.75 }, { P: 0.70 }
];
decision = trendFollower(state, history, participant);
assert(decision.action === 'EXIT', 'Panic exits on 30% price drop');
assert(decision.tokens === participant.tokens, 'Exits all tokens on panic');

// Should increase LABOR on price rise (FOMO)
state = makeState({ P: 1.30 });
history = [
    { P: 1.00 }, { P: 1.05 }, { P: 1.15 }, { P: 1.25 }, { P: 1.30 }
];
decision = trendFollower(state, history, participant);
assert(decision.action === 'LABOR', 'FOMO mode on 30% price rise');
assert(decision.intensity > 0, 'Labor intensity increased');

// ==========================================
// DIAMOND HANDS
// ==========================================
console.log('\n--- Diamond Hands ---');

const diamondHands = createBehavior('diamond_hands', {
    labor_intensity: 0.2
});

// Should NEVER exit, even on crash
state = makeState({ P: 0.30, businessState: 'failed' });
history = makeHistory(12, 'crash');
participant = makeParticipant();
decision = diamondHands(state, history, participant);
assert(decision.action === 'LABOR', 'Never exits, even on crash');
assert(decision.intensity === 0.2, 'Maintains steady labor intensity');

// ==========================================
// LIFE EVENT EXIT
// ==========================================
console.log('\n--- Life Event ---');

// Month trigger
const lifeEventMonth = createBehavior('life_event', {
    trigger_month: 18
});

state = makeState({ month: 17 });
participant = makeParticipant();
decision = lifeEventMonth(state, [], participant);
assert(decision.action === 'HOLD', 'Holds before trigger month');

state = makeState({ month: 18 });
decision = lifeEventMonth(state, [], participant);
assert(decision.action === 'EXIT', 'Exits at trigger month');
assert(decision.tokens === participant.tokens, 'Exits all tokens');

// Value trigger
const lifeEventValue = createBehavior('life_event', {
    trigger_value: 2000
});

state = makeState({ P: 1.50 }); // 1000 tokens × $1.50 = $1500
participant = makeParticipant({ tokens: 1000 });
decision = lifeEventValue(state, [], participant);
assert(decision.action === 'HOLD', 'Holds when below target value');

state = makeState({ P: 2.50 }); // 1000 tokens × $2.50 = $2500 > $2000
decision = lifeEventValue(state, [], participant);
assert(decision.action === 'EXIT', 'Exits when holdings reach target value');

// ==========================================
// SKEPTIC
// ==========================================
console.log('\n--- Skeptic ---');

const skeptic = createBehavior('skeptic', {
    patience: 6,
    validation_threshold: 0.10
});

// Should HOLD during patience period
state = makeState({ month: 5 });
participant = makeParticipant();
decision = skeptic(state, makeHistory(5), participant);
assert(decision.action === 'HOLD', 'Holds during patience period');

// Should EXIT if growth below threshold
state = makeState({ month: 8, revenue: 5200 }); // Only 4% growth
history = makeHistory(8, 'stable');
history[0].revenue = 5000;
decision = skeptic(state, history, participant);
assert(decision.action === 'EXIT', 'Exits when growth below threshold');

// Should HOLD if growth above threshold
state = makeState({ month: 8, revenue: 8000 }); // 60% growth
history = makeHistory(8, 'rising');
history[0].revenue = 5000;
decision = skeptic(state, history, participant);
assert(decision.action === 'HOLD', 'Holds when growth above threshold');

// ==========================================
// SPECULATOR
// ==========================================
console.log('\n--- Speculator ---');

const rng = createRNG(12345);
const speculator = createBehavior('speculator', {
    timing_skill: 0.45,
    trade_frequency: 1.0,  // Always trade for testing
    exit_portion: 0.5
}, rng);

// Run multiple times to verify stochastic behavior
let exitCount = 0;
let holdCount = 0;

for (let i = 0; i < 100; i++) {
    const testRng = createRNG(1000 + i);
    const testSpeculator = createBehavior('speculator', {
        timing_skill: 0.45,
        trade_frequency: 1.0,
        exit_portion: 0.5
    }, testRng);

    state = makeState({ P: 0.90 });
    history = [
        { P: 1.00 }, { P: 0.95 }, { P: 0.90 }
    ];
    participant = makeParticipant();
    decision = testSpeculator(state, history, participant);

    if (decision.action === 'EXIT') exitCount++;
    else holdCount++;
}

assert(exitCount > 20, `Speculator sometimes exits (${exitCount}/100)`);
assert(holdCount > 20, `Speculator sometimes holds (${holdCount}/100)`);
console.log(`  (Exit rate: ${exitCount}%, Hold rate: ${holdCount}%)`);

// ==========================================
// HUSTLER
// ==========================================
console.log('\n--- Hustler ---');

const hustler = createBehavior('hustler', {
    labor_intensity: 0.5,
    exit_aversion: 0.8,
    desperation_threshold: -0.50
});

// Should maintain high labor intensity normally
state = makeState({ P: 1.00 });
history = makeHistory(6, 'stable');
participant = makeParticipant();
decision = hustler(state, history, participant);
assert(decision.action === 'LABOR', 'Maintains labor focus');
assert(decision.intensity >= 0.5, 'High labor intensity');

// Should NOT exit on moderate drops (exit aversion)
state = makeState({ P: 0.75 }); // 25% drop
history = [
    { P: 1.00 }, { P: 0.95 }, { P: 0.90 },
    { P: 0.85 }, { P: 0.80 }, { P: 0.75 }
];
decision = hustler(state, history, participant);
assert(decision.action === 'LABOR', 'Resists exiting on moderate drops');

// Should exit only on desperate drops
state = makeState({ P: 0.40 }); // 60% drop
history = [
    { P: 1.00 }, { P: 0.90 }, { P: 0.80 },
    { P: 0.60 }, { P: 0.50 }, { P: 0.40 }
];
decision = hustler(state, history, participant);
assert(decision.action === 'EXIT', 'Exits on desperate drops');
assert(decision.tokens < participant.tokens, 'Partial exit due to aversion');

// ==========================================
// EDGE CASES
// ==========================================
console.log('\n--- Edge Cases ---');

// Zero tokens should always hold
const zeroTokenParticipant = makeParticipant({ tokens: 0 });
state = makeState();
history = makeHistory(6, 'crash');

decision = rational(state, history, zeroTokenParticipant);
assert(decision.action === 'HOLD', 'Rational holds with zero tokens');

decision = trendFollower(state, history, zeroTokenParticipant);
assert(decision.action === 'HOLD', 'Trend follower holds with zero tokens');

// Empty history should not crash
decision = rational(makeState(), [], makeParticipant());
assert(decision.action !== undefined, 'Handles empty history gracefully');

// ==========================================
// SUMMARY
// ==========================================
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
