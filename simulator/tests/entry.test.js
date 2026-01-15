/**
 * Dynamic Entry System Tests
 */

const { createRNG } = require('../revenue.js');
const {
    EntryType,
    evaluateEntry,
    createEntryPool
} = require('../entry.js');

console.log('=== Dynamic Entry System Tests ===\n');

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

const rng = createRNG(12345);

// ==========================================
// WORD OF MOUTH
// ==========================================
console.log('--- Word of Mouth ---');

const wordOfMouthCondition = {
    type: EntryType.WORD_OF_MOUTH,
    params: {
        revenue_threshold: 5000,
        probability_per_month: 1.0  // 100% for testing
    }
};

let state = { revenue: 3000, P: 1.00, month: 6 };
let result = evaluateEntry(wordOfMouthCondition, state, rng);
assert(!result.shouldEnter, 'Does not enter below revenue threshold');

state = { revenue: 8000, P: 1.00, month: 6 };
result = evaluateEntry(wordOfMouthCondition, state, rng);
assert(result.shouldEnter, 'Enters when revenue exceeds threshold');

// ==========================================
// PRICE SIGNAL
// ==========================================
console.log('\n--- Price Signal ---');

const priceSignalCondition = {
    type: EntryType.PRICE_SIGNAL,
    params: {
        price_threshold: 1.50,
        probability: 1.0  // 100% for testing
    }
};

state = { revenue: 5000, P: 1.20, month: 6 };
result = evaluateEntry(priceSignalCondition, state, rng);
assert(!result.shouldEnter, 'Does not enter below price threshold');

state = { revenue: 5000, P: 2.00, month: 6 };
result = evaluateEntry(priceSignalCondition, state, rng);
assert(result.shouldEnter, 'Enters when price exceeds threshold');

// ==========================================
// SCHEDULED
// ==========================================
console.log('\n--- Scheduled ---');

const scheduledCondition = {
    type: EntryType.SCHEDULED,
    params: {
        entry_month: 12
    }
};

state = { revenue: 5000, P: 1.00, month: 11 };
result = evaluateEntry(scheduledCondition, state, rng);
assert(!result.shouldEnter, 'Does not enter before scheduled month');

state = { revenue: 5000, P: 1.00, month: 12 };
result = evaluateEntry(scheduledCondition, state, rng);
assert(result.shouldEnter, 'Enters at scheduled month');

state = { revenue: 5000, P: 1.00, month: 13 };
result = evaluateEntry(scheduledCondition, state, rng);
assert(!result.shouldEnter, 'Does not enter after scheduled month');

// ==========================================
// REFERRAL CHAIN
// ==========================================
console.log('\n--- Referral Chain ---');

const referralChainCondition = {
    type: EntryType.REFERRAL_CHAIN,
    params: {
        trigger_participant_id: 'hustler1',
        tokens_earned_threshold: 50,
        probability: 1.0  // 100% for testing
    }
};

const participants = [
    { id: 'hustler1', name: 'Hustler', monthlyTokensEarned: 30 },
    { id: 'holder2', name: 'Holder', monthlyTokensEarned: 5 }
];

state = { revenue: 5000, P: 1.00, month: 6 };
result = evaluateEntry(referralChainCondition, state, rng, participants);
assert(!result.shouldEnter, 'Does not trigger below token earning threshold');

participants[0].monthlyTokensEarned = 100;
result = evaluateEntry(referralChainCondition, state, rng, participants);
assert(result.shouldEnter, 'Triggers when participant earns enough tokens');

// ==========================================
// ENTRY POOL
// ==========================================
console.log('\n--- Entry Pool ---');

const poolConfig = {
    treasury: 10000,
    templates: [
        {
            id: 'word_of_mouth_pool',
            name: 'WoM Entrant',
            behavior: 'trend_follower',
            grant: 1000,
            referral_share: 0.08,
            entry_conditions: {
                type: EntryType.WORD_OF_MOUTH,
                params: { revenue_threshold: 5000, probability_per_month: 1.0 }
            },
            maxSpawns: 3
        },
        {
            id: 'scheduled_partner',
            name: 'Partner',
            behavior: 'rational',
            grant: 5000,
            referral_share: 0.15,
            entry_conditions: {
                type: EntryType.SCHEDULED,
                params: { entry_month: 6 }
            }
        }
    ]
};

const pool = createEntryPool(poolConfig, rng);

// Month 3: below revenue threshold
state = { revenue: 3000, P: 1.00, month: 3 };
let newParticipants = pool.evaluateTick(state, []);
assert(newParticipants.length === 0, 'No entries when conditions not met');
assert(pool.getRemainingTreasury() === 10000, 'Treasury unchanged');

// Month 6: scheduled entry + revenue threshold met
state = { revenue: 8000, P: 1.00, month: 6 };
newParticipants = pool.evaluateTick(state, []);
assert(newParticipants.length === 2, 'Two entries (scheduled + word of mouth)');
assert(pool.getRemainingTreasury() === 4000, 'Treasury reduced by grants (5000 + 1000)');

// Verify spawned participant properties
const partner = newParticipants.find(p => p.name.includes('Partner'));
assert(partner !== undefined, 'Scheduled partner spawned');
assert(partner.grant === 5000, 'Correct grant amount');
assert(partner.behaviorType === 'rational', 'Correct behavior type');

const wom = newParticipants.find(p => p.name.includes('WoM'));
assert(wom !== undefined, 'Word of mouth entrant spawned');
assert(wom.isLateEntrant === true, 'Marked as late entrant');

// Month 7: more word of mouth entries
state = { revenue: 10000, P: 1.20, month: 7 };
newParticipants = pool.evaluateTick(state, []);
assert(newParticipants.length === 1, 'One more WoM entry');
assert(pool.getRemainingTreasury() === 3000, 'Treasury reduced');

// Month 8: third and final WoM entry (maxSpawns: 3)
state = { revenue: 12000, P: 1.30, month: 8 };
newParticipants = pool.evaluateTick(state, []);
assert(newParticipants.length === 1, 'Third WoM entry');
assert(pool.getSpawnedCount() === 4, 'Total 4 participants spawned');

// Month 9: no more WoM entries (maxSpawns reached)
state = { revenue: 15000, P: 1.50, month: 9 };
newParticipants = pool.evaluateTick(state, []);
assert(newParticipants.length === 0, 'No more WoM entries (max spawns reached)');

// ==========================================
// TREASURY DEPLETION
// ==========================================
console.log('\n--- Treasury Depletion ---');

const limitedPool = createEntryPool({
    treasury: 1500,
    templates: [{
        id: 'expensive',
        grant: 2000,
        entry_conditions: {
            type: EntryType.SCHEDULED,
            params: { entry_month: 1 }
        }
    }]
}, rng);

state = { month: 1, revenue: 5000, P: 1.00 };
newParticipants = limitedPool.evaluateTick(state, []);
assert(newParticipants.length === 0, 'Cannot spawn when treasury insufficient');
assert(limitedPool.getRemainingTreasury() === 1500, 'Treasury unchanged');

// ==========================================
// SUMMARY
// ==========================================
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
