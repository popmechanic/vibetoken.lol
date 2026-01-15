/**
 * Unit tests for Vibe Token Economics
 * Verifies all formulas match whitepaper exactly
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
    burnTokens,
    processRevenueEvent,
    processExit
} = require('../economics.js');

// Test utilities
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

function assertClose(actual, expected, tolerance, message) {
    const diff = Math.abs(actual - expected);
    if (diff <= tolerance) {
        passed++;
        console.log(`  ✓ ${message} (${actual.toFixed(4)} ≈ ${expected.toFixed(4)})`);
    } else {
        failed++;
        console.log(`  ✗ ${message} (got ${actual.toFixed(4)}, expected ${expected.toFixed(4)})`);
    }
}

// ==========================================
// Rule 1: Token Pricing (P = k × √S)
// ==========================================
console.log('\n=== Rule 1: Token Pricing ===');

// Whitepaper example: k = 0.01
const k = 0.01;

// Table from whitepaper
assertClose(calculatePrice(1000, k), 0.316, 0.001, 'P at S=1,000 (floor)');
assertClose(calculatePrice(10000, k), 1.00, 0.001, 'P at S=10,000');
assertClose(calculatePrice(50000, k), 2.236, 0.001, 'P at S=50,000');
assertClose(calculatePrice(100000, k), 3.162, 0.001, 'P at S=100,000');

// Edge cases
try {
    calculatePrice(0, k);
    assert(false, 'Should throw on zero supply');
} catch (e) {
    assert(true, 'Throws on zero supply');
}

try {
    calculatePrice(-100, k);
    assert(false, 'Should throw on negative supply');
} catch (e) {
    assert(true, 'Throws on negative supply');
}

// ==========================================
// Rule 3: Token Earning
// ==========================================
console.log('\n=== Rule 3: Token Earning ===');

// Whitepaper example:
// Referrer brings $50 sale, α = 0.20, P = $1.00
// Referrer value = 0.20 * $50 = $10
// Tokens earned = floor($10 / $1.00) = 10 tokens
const alpha = 0.20;
const sale = 50;
const price = 1.00;

const referrerValue = alpha * sale; // $10
assert(referrerValue === 10, 'Referrer value = α × sale = $10');

const tokensEarned = calculateTokensEarned(sale, alpha, price);
assert(tokensEarned === 10, 'Tokens earned = floor(α × dR / P) = 10');

// Test floor behavior
const smallSale = 3; // α × 3 = 0.6, floor(0.6/1) = 0
const smallTokens = calculateTokensEarned(smallSale, alpha, price);
assert(smallTokens === 0, 'Small sale earns 0 tokens (floor)');

// Test with different price
const highPrice = 2.50;
const tokensAtHighPrice = calculateTokensEarned(sale, alpha, highPrice);
assert(tokensAtHighPrice === 4, 'Higher price = fewer tokens (floor(10/2.50) = 4)');

// ==========================================
// Rule 4: Revenue Distribution
// ==========================================
console.log('\n=== Rule 4: Revenue Distribution ===');

// Whitepaper example:
// Revenue = $1,000, α = 0.20, S = 50,000 issued tokens
// Distribution pool D = $200
// Payout per token = $200 / 50,000 = $0.004
// Holder with 1,000 tokens receives $4.00

const revenue = 1000;
const supply = 50000;

const distributionPool = calculateDistributionPool(revenue, alpha);
assert(distributionPool === 200, 'Distribution pool = α × dR = $200');

const payoutPerToken = calculatePayoutPerToken(distributionPool, supply);
assertClose(payoutPerToken, 0.004, 0.0001, 'Payout per token = D / S = $0.004');

const holderTokens = 1000;
const holderPayout = holderTokens * payoutPerToken;
assertClose(holderPayout, 4.00, 0.01, 'Holder with 1,000 tokens receives $4.00');

// Edge case: zero supply
const zeroSupplyPayout = calculatePayoutPerToken(100, 0);
assert(zeroSupplyPayout === 0, 'Zero supply returns zero payout');

// ==========================================
// Rule 5: Token Exit
// ==========================================
console.log('\n=== Rule 5: Token Exit ===');

// Whitepaper example:
// Holder has 500 tokens, S = 10,000, P = $1.00
// Exit value = 500 × $1.00 = $500
// 500 tokens burned, new S = 9,500, new P = $0.97

const exitTokens = 500;
const exitSupply = 10000;
const exitPrice = calculatePrice(exitSupply, k); // ~$1.00
assertClose(exitPrice, 1.00, 0.01, 'Initial price at S=10,000 ≈ $1.00');

const exitValue = calculateExitValue(exitTokens, exitPrice);
assertClose(exitValue, 500, 1, 'Exit value = 500 × P ≈ $500');

const newSupply = burnTokens(exitSupply, exitTokens, 1000);
assert(newSupply === 9500, 'New supply after burn = 9,500');

const newPrice = calculatePrice(newSupply, k);
assertClose(newPrice, 0.975, 0.01, 'New price at S=9,500 ≈ $0.975');

// Test supply floor
const S_min = 1000;
assert(canExit(10000, 500, S_min), 'Exit allowed: 10,000 - 500 ≥ 1,000');
assert(!canExit(1200, 500, S_min), 'Exit blocked: 1,200 - 500 < 1,000');
assert(canExit(1500, 500, S_min), 'Exit allowed: 1,500 - 500 = 1,000');

// Test floor enforcement
const floorBurn = burnTokens(1200, 500, S_min);
assert(floorBurn === 1000, 'Burn respects floor: max(700, 1000) = 1000');

// ==========================================
// Rule 6: Exit Queue
// ==========================================
console.log('\n=== Rule 6: Exit Queue ===');

// Whitepaper example:
// Queue: Alice owed $500, Bob owed $300
// Distribution pool: $400
// Alice receives $400, still owed $100
// Bob receives $0, still owed $300

let queue = [
    { id: 'alice', owed: 500 },
    { id: 'bob', owed: 300 }
];

let result = processExitQueue(queue, 400);

assert(result.payments.length === 1, 'One payment made');
assert(result.payments[0].id === 'alice', 'Alice paid first (FIFO)');
assert(result.payments[0].amount === 400, 'Alice receives $400');
assert(!result.payments[0].complete, 'Alice payment incomplete');
assert(result.remainder === 0, 'No remainder for distributions');

assert(result.queue.length === 2, 'Both still in queue');
assert(result.queue[0].id === 'alice', 'Alice still first');
assert(result.queue[0].owed === 100, 'Alice still owed $100');
assert(result.queue[1].id === 'bob', 'Bob still second');
assert(result.queue[1].owed === 300, 'Bob still owed $300');

// Next month: $600 distribution
result = processExitQueue(result.queue, 600);

assert(result.payments.length === 2, 'Two payments made');
assert(result.payments[0].amount === 100, 'Alice receives remaining $100');
assert(result.payments[0].complete, 'Alice payment complete');
assert(result.payments[1].amount === 300, 'Bob receives $300');
assert(result.payments[1].complete, 'Bob payment complete');

assert(result.queue.length === 0, 'Queue empty');
assert(result.remainder === 200, 'Remaining $200 for distributions');

// ==========================================
// Integration: Full Revenue Event
// ==========================================
console.log('\n=== Integration: Full Revenue Event ===');

const config = { k: 0.01, alpha: 0.20, S_min: 1000 };
let state = { S: 10000, P: 1.00, queue: [] };

const participants = [
    { id: 'holder1', tokens: 5000, referralShare: 0.30 },
    { id: 'holder2', tokens: 3000, referralShare: 0.10 },
    { id: 'holder3', tokens: 2000, referralShare: 0.00 }
];

// Process $1000 revenue event
const eventResult = processRevenueEvent(state, config, 1000, participants);

// Check token earnings
const earningsEvent = eventResult.events.find(e => e.type === 'tokens_earned');
assert(earningsEvent !== undefined, 'Token earnings recorded');

// holder1: 30% of $1000 = $300, earns floor(0.20 × 300 / 1.00) = 60 tokens
const holder1Earnings = earningsEvent.earnings.find(e => e.id === 'holder1');
assert(holder1Earnings.tokens === 60, 'Holder1 earns 60 tokens');

// holder2: 10% of $1000 = $100, earns floor(0.20 × 100 / ~1.00) = 20 tokens
const holder2Earnings = earningsEvent.earnings.find(e => e.id === 'holder2');
assert(holder2Earnings.tokens === 20, 'Holder2 earns 20 tokens');

// holder3: 0% referral, earns 0
const holder3Earnings = earningsEvent.earnings.find(e => e.id === 'holder3');
assert(holder3Earnings === undefined, 'Holder3 earns nothing (no referral)');

// New supply: 10000 + 60 + 20 = 10080
assert(eventResult.state.S === 10080, 'Supply increased by minted tokens');

// New price: k × √10080 ≈ $1.004
assertClose(eventResult.state.P, 1.004, 0.01, 'Price increased with supply');

// ==========================================
// Integration: Exit Flow
// ==========================================
console.log('\n=== Integration: Exit Flow ===');

state = { S: 10000, P: 1.00, queue: [], month: 5 };

const exitResult = processExit(state, config, 'exiter', 2000);

assert(exitResult.success, 'Exit succeeds');
assertClose(exitResult.exitValue, 2000, 10, 'Exit value ≈ $2000');
assert(exitResult.state.S === 8000, 'Supply reduced to 8000');
assert(exitResult.state.queue.length === 1, 'Exit added to queue');
assert(exitResult.state.queue[0].id === 'exiter', 'Correct ID in queue');
assertClose(exitResult.state.queue[0].owed, 2000, 10, 'Correct owed amount');

// New price: k × √8000 ≈ $0.894
assertClose(exitResult.state.P, 0.894, 0.01, 'Price decreased after burn');

// Test blocked exit (would violate floor)
const blockedResult = processExit(
    { S: 1500, P: 0.5, queue: [], month: 1 },
    config,
    'blocker',
    600
);
assert(!blockedResult.success, 'Exit blocked at floor');
assert(blockedResult.reason.includes('floor'), 'Reason mentions floor');

// ==========================================
// Summary
// ==========================================
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

process.exit(failed > 0 ? 1 : 0);
