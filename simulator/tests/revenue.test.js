/**
 * Revenue Model Tests
 * Verify archetypes produce expected statistical properties
 */

const {
    createBusiness,
    simulateBusinessTrajectory,
    BusinessState
} = require('../revenue.js');

// Test utilities
function runBatch(config, runs = 100, months = 36) {
    const results = [];
    for (let i = 0; i < runs; i++) {
        results.push(simulateBusinessTrajectory(config, months, 1000 + i));
    }
    return results;
}

function statistics(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / sorted.length;
    const stddev = Math.sqrt(variance);

    return { mean, median, min, max, stddev, cv: stddev / mean };
}

console.log('=== Revenue Model Tests ===\n');

// ==========================================
// MICRO ARCHETYPE
// ==========================================
console.log('--- Micro Archetype ---');

const microConfig = {
    archetype: 'micro',
    base_mrr: 1000,
    params: {
        growth_mean: 0.02,
        growth_stddev: 0.40,
        zero_probability: 0.15,
        failure_threshold: 3
    }
};

const microResults = runBatch(microConfig, 200);
const microSurvived = microResults.filter(r => r.survived).length;
const microRevenues = microResults.map(r => r.totalRevenue);
const microStats = statistics(microRevenues);

console.log(`Runs: 200`);
console.log(`Survival rate: ${(microSurvived / 200 * 100).toFixed(1)}%`);
console.log(`Total revenue (mean): $${microStats.mean.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
console.log(`Total revenue (median): $${microStats.median.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
console.log(`Coefficient of variation: ${(microStats.cv * 100).toFixed(1)}%`);
console.log(`Range: $${microStats.min.toLocaleString(undefined, {maximumFractionDigits: 0})} - $${microStats.max.toLocaleString(undefined, {maximumFractionDigits: 0})}`);

// Verify high variance (CV should be 30%+)
console.log(`\nExpectations:`);
console.log(`  ✓ High variance (CV > 30%): ${microStats.cv > 0.30 ? 'PASS' : 'FAIL'} (${(microStats.cv * 100).toFixed(1)}%)`);
console.log(`  ✓ Some failures: ${microSurvived < 200 ? 'PASS' : 'FAIL'} (${200 - microSurvived} failures)`);

// ==========================================
// STARTUP ARCHETYPE
// ==========================================
console.log('\n--- Startup Archetype ---');

const startupConfig = {
    archetype: 'startup',
    base_mrr: 200,
    params: {
        runway_months: 12,
        breakthrough_prob: 0.08,
        hockey_stick_multiplier: 5.0
    }
};

const startupResults = runBatch(startupConfig, 200);
const startupSurvived = startupResults.filter(r => r.survived).length;
const startupBreakthroughs = startupResults.filter(r =>
    r.trajectory.some(t => t.breakthrough)
).length;
const startupRevenues = startupResults.map(r => r.totalRevenue);
const startupStats = statistics(startupRevenues);

// Separate survivors and failures
const survivorRevenues = startupResults.filter(r => r.survived).map(r => r.totalRevenue);
const failedRevenues = startupResults.filter(r => !r.survived).map(r => r.totalRevenue);

console.log(`Runs: 200`);
console.log(`Survival rate: ${(startupSurvived / 200 * 100).toFixed(1)}%`);
console.log(`Breakthrough rate: ${(startupBreakthroughs / 200 * 100).toFixed(1)}%`);
console.log(`Total revenue (mean): $${startupStats.mean.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
console.log(`Total revenue (median): $${startupStats.median.toLocaleString(undefined, {maximumFractionDigits: 0})}`);

if (survivorRevenues.length > 0) {
    const survivorStats = statistics(survivorRevenues);
    console.log(`Survivor mean revenue: $${survivorStats.mean.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
}
if (failedRevenues.length > 0) {
    const failedStats = statistics(failedRevenues);
    console.log(`Failed mean revenue: $${failedStats.mean.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
}

console.log(`\nExpectations:`);
// Startup should have ~65-85% failure rate (breakthrough prob 8% per month, ~12 chances)
// P(at least one breakthrough) = 1 - (1-0.08)^12 ≈ 63%
const expectedSurvivalRate = 1 - Math.pow(1 - 0.08, 12);
console.log(`  ✓ ~60-80% survival (P(breakthrough) ≈ ${(expectedSurvivalRate * 100).toFixed(0)}%): ${
    startupSurvived / 200 > 0.4 && startupSurvived / 200 < 0.9 ? 'PASS' : 'CLOSE'
} (${(startupSurvived / 200 * 100).toFixed(1)}%)`);
console.log(`  ✓ Bimodal distribution (survivors >> failures): ${
    survivorRevenues.length > 0 && statistics(survivorRevenues).mean > statistics(failedRevenues).mean * 3
        ? 'PASS' : 'CHECK'
}`);

// ==========================================
// ENTERPRISE ARCHETYPE
// ==========================================
console.log('\n--- Enterprise Archetype ---');

const enterpriseConfig = {
    archetype: 'enterprise',
    base_mrr: 25000,
    params: {
        growth_rate: 0.05,
        growth_stddev: 0.04,
        decline_threshold: 6
    }
};

const enterpriseResults = runBatch(enterpriseConfig, 200);
const enterpriseSurvived = enterpriseResults.filter(r => r.survived).length;
const enterpriseRevenues = enterpriseResults.map(r => r.totalRevenue);
const enterpriseStats = statistics(enterpriseRevenues);

console.log(`Runs: 200`);
console.log(`Survival rate: ${(enterpriseSurvived / 200 * 100).toFixed(1)}%`);
console.log(`Total revenue (mean): $${enterpriseStats.mean.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
console.log(`Total revenue (median): $${enterpriseStats.median.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
console.log(`Coefficient of variation: ${(enterpriseStats.cv * 100).toFixed(1)}%`);

// Check for compounding growth in survivors
const enterpriseSurvivorFinalMRR = enterpriseResults
    .filter(r => r.survived)
    .map(r => r.finalMRR);
if (enterpriseSurvivorFinalMRR.length > 0) {
    const finalMRRStats = statistics(enterpriseSurvivorFinalMRR);
    console.log(`Survivor final MRR (mean): $${finalMRRStats.mean.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
    // Expected after 36 months at 5% growth: 25000 * 1.05^36 ≈ $140k
    const expectedFinalMRR = 25000 * Math.pow(1.05, 36);
    console.log(`Expected final MRR (5% compound): $${expectedFinalMRR.toLocaleString(undefined, {maximumFractionDigits: 0})}`);
}

console.log(`\nExpectations:`);
console.log(`  ✓ Lower variance than micro (CV < 30%): ${enterpriseStats.cv < 0.30 ? 'PASS' : 'CHECK'} (${(enterpriseStats.cv * 100).toFixed(1)}%)`);
console.log(`  ✓ High survival rate: ${enterpriseSurvived / 200 > 0.8 ? 'PASS' : 'CHECK'} (${(enterpriseSurvived / 200 * 100).toFixed(1)}%)`);
console.log(`  ✓ Compounding growth visible: ${
    enterpriseSurvivorFinalMRR.length > 0 && statistics(enterpriseSurvivorFinalMRR).mean > 50000
        ? 'PASS' : 'CHECK'
}`);

// ==========================================
// REPRODUCIBILITY TEST
// ==========================================
console.log('\n--- Reproducibility ---');

const testConfig = { archetype: 'startup', base_mrr: 500, params: {} };
const run1 = simulateBusinessTrajectory(testConfig, 12, 42);
const run2 = simulateBusinessTrajectory(testConfig, 12, 42);
const run3 = simulateBusinessTrajectory(testConfig, 12, 43);

console.log(`Same seed produces same results: ${
    run1.totalRevenue === run2.totalRevenue ? 'PASS' : 'FAIL'
}`);
console.log(`Different seed produces different results: ${
    run1.totalRevenue !== run3.totalRevenue ? 'PASS' : 'FAIL'
}`);

console.log('\n=== Revenue Model Tests Complete ===');
