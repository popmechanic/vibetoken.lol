#!/usr/bin/env node

/**
 * Vibe Token Simulation CLI
 *
 * Usage:
 *   node run.js --config presets/startup-mixed.json --runs 100
 *   node run.js --preset startup-mixed --runs 50 --seed 12345
 *   node run.js --config custom.json --output results/my-run
 */

const fs = require('fs');
const path = require('path');
const { runBatch, runSimulation } = require('./engine.js');
const { generateNarrative } = require('./narrative.js');
const { generateHTMLReport, generateIndexPage } = require('./html-report.js');

// Parse command line arguments
function parseArgs(args) {
    const options = {
        config: null,
        preset: null,
        runs: 100,
        seed: null,
        output: null,
        verbose: false,
        json: true,
        csv: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];

        switch (arg) {
            case '--config':
            case '-c':
                options.config = next;
                i++;
                break;
            case '--preset':
            case '-p':
                options.preset = next;
                i++;
                break;
            case '--runs':
            case '-r':
                options.runs = parseInt(next, 10);
                i++;
                break;
            case '--seed':
            case '-s':
                options.seed = parseInt(next, 10);
                i++;
                break;
            case '--output':
            case '-o':
                options.output = next;
                i++;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--csv':
                options.csv = true;
                break;
            case '--no-json':
                options.json = false;
                break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
        }
    }

    return options;
}

function printHelp() {
    console.log(`
Vibe Token Simulation CLI

Usage:
  node run.js [options]

Options:
  --config, -c <file>    Configuration JSON file
  --preset, -p <name>    Use preset (micro-rational, startup-mixed, enterprise-sophisticated, stress-test)
  --runs, -r <number>    Number of simulations (default: 100)
  --seed, -s <number>    Random seed for reproducibility
  --output, -o <path>    Output directory (default: output/<timestamp>)
  --verbose, -v          Show detailed progress
  --csv                  Also output CSV files
  --no-json              Skip JSON output
  --help, -h             Show this help

Examples:
  node run.js --preset startup-mixed --runs 50
  node run.js --config custom.json --runs 200 --seed 42 --output results/test1
`);
}

// Load configuration
function loadConfig(options) {
    let configPath;

    if (options.config) {
        configPath = options.config;
    } else if (options.preset) {
        configPath = path.join(__dirname, 'presets', `${options.preset}.json`);
    } else {
        console.error('Error: Must specify --config or --preset');
        process.exit(1);
    }

    if (!fs.existsSync(configPath)) {
        console.error(`Error: Config file not found: ${configPath}`);
        process.exit(1);
    }

    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        console.error(`Error parsing config: ${e.message}`);
        process.exit(1);
    }
}

// Format number with commas
function fmt(n, decimals = 0) {
    return n.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Generate summary statistics
function generateSummary(batchResult, config) {
    const lines = [];

    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push(`  SIMULATION RESULTS: ${config.meta?.name || 'Unnamed'}`);
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');

    // Business info
    lines.push(`  Business: ${config.business.archetype.toUpperCase()}`);
    lines.push(`  Base MRR: $${fmt(config.business.base_mrr)}`);
    lines.push(`  Revenue Share (α): ${(config.tokenomics.alpha * 100).toFixed(0)}%`);
    lines.push(`  Duration: ${config.simulation.duration_months} months`);
    lines.push('');

    // Overview
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('  OVERVIEW');
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push(`  Simulations run: ${fmt(batchResult.runs)}`);
    lines.push(`  Survival rate: ${(batchResult.survivalRate * 100).toFixed(1)}%`);
    lines.push('');

    // Price statistics
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('  TOKEN PRICE');
    lines.push('───────────────────────────────────────────────────────────────');
    const ps = batchResult.priceStats;
    lines.push(`  Mean:   $${ps.mean.toFixed(2)}`);
    lines.push(`  Median: $${ps.median.toFixed(2)}`);
    lines.push(`  Range:  $${ps.min.toFixed(2)} - $${ps.max.toFixed(2)}`);
    lines.push(`  StdDev: $${ps.stddev.toFixed(2)}`);
    lines.push('');

    // Revenue statistics
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('  CUMULATIVE REVENUE');
    lines.push('───────────────────────────────────────────────────────────────');
    const rs = batchResult.revenueStats;
    lines.push(`  Mean:   $${fmt(rs.mean)}`);
    lines.push(`  Median: $${fmt(rs.median)}`);
    lines.push(`  Range:  $${fmt(rs.min)} - $${fmt(rs.max)}`);
    lines.push('');

    // Participant outcomes
    lines.push('───────────────────────────────────────────────────────────────');
    lines.push('  PARTICIPANT OUTCOMES (ROI)');
    lines.push('───────────────────────────────────────────────────────────────');

    const participants = Object.entries(batchResult.participantStats)
        .sort((a, b) => b[1].mean - a[1].mean);

    for (const [name, stats] of participants) {
        const roiBar = '█'.repeat(Math.min(20, Math.floor(stats.mean * 4)));
        lines.push(`  ${name.padEnd(20)} ${stats.mean.toFixed(2)}x  ${roiBar}`);
    }

    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');

    return lines.join('\n');
}

// Generate CSV output
function generateCSV(batchResult) {
    const rows = ['run,survived,final_price,total_revenue,avg_roi'];

    for (let i = 0; i < batchResult.results.length; i++) {
        const r = batchResult.results[i];
        const validRois = r.participantOutcomes.filter(p => isFinite(p.roi) && !isNaN(p.roi));
        const avgRoi = validRois.length > 0
            ? validRois.reduce((sum, p) => sum + p.roi, 0) / validRois.length
            : 0;

        rows.push([
            i + 1,
            r.summary.survived ? 1 : 0,
            r.finalState.P.toFixed(4),
            r.finalState.cumulativeRevenue.toFixed(2),
            avgRoi.toFixed(4)
        ].join(','));
    }

    return rows.join('\n');
}

// Generate participant CSV
function generateParticipantCSV(batchResult) {
    const rows = ['run,name,behavior,grant,final_tokens,distributions,exit_value,total_value,roi,exited'];

    for (let i = 0; i < batchResult.results.length; i++) {
        const r = batchResult.results[i];
        for (const p of r.participantOutcomes) {
            const safeRoi = isFinite(p.roi) && !isNaN(p.roi) ? p.roi.toFixed(4) : '0.0000';
            rows.push([
                i + 1,
                `"${p.name}"`,
                p.behaviorType,
                p.grant,
                p.finalTokens,
                p.distributions.toFixed(2),
                p.exitValue.toFixed(2),
                p.totalValue.toFixed(2),
                safeRoi,
                p.hasExited ? 1 : 0
            ].join(','));
        }
    }

    return rows.join('\n');
}

// Main function
async function main() {
    const options = parseArgs(process.argv.slice(2));
    const config = loadConfig(options);

    // Override runs and seed if specified
    if (options.runs) {
        config.simulation.runs = options.runs;
    }

    // Setup output directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputDir = options.output || path.join(__dirname, 'output', timestamp);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Print header
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║         VIBE TOKEN ECONOMIC STRESS-TESTING HARNESS            ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  Config: ${options.config || options.preset}`);
    console.log(`  Runs: ${config.simulation.runs}`);
    console.log(`  Seed: ${options.seed || 'random'}`);
    console.log(`  Output: ${outputDir}`);
    console.log('');

    // Run simulations
    console.log('  Running simulations...');
    const startTime = Date.now();

    const batchResult = runBatch(config, config.simulation.runs, options.seed);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Completed ${batchResult.runs} simulations in ${elapsed}s`);
    console.log('');

    // Generate and display summary
    const summary = generateSummary(batchResult, config);
    console.log(summary);

    // Save outputs
    if (options.json) {
        // Full results JSON
        const resultsPath = path.join(outputDir, 'results.json');
        fs.writeFileSync(resultsPath, JSON.stringify({
            config: config,
            baseSeed: batchResult.baseSeed,
            runs: batchResult.runs,
            survivalRate: batchResult.survivalRate,
            priceStats: batchResult.priceStats,
            revenueStats: batchResult.revenueStats,
            participantStats: batchResult.participantStats
        }, null, 2));
        console.log(`  Saved: ${resultsPath}`);

        // Summary stats only (smaller file)
        const summaryPath = path.join(outputDir, 'summary.json');
        fs.writeFileSync(summaryPath, JSON.stringify({
            meta: config.meta,
            runs: batchResult.runs,
            survivalRate: batchResult.survivalRate,
            priceStats: batchResult.priceStats,
            revenueStats: batchResult.revenueStats,
            participantStats: batchResult.participantStats
        }, null, 2));
        console.log(`  Saved: ${summaryPath}`);
    }

    if (options.csv) {
        // Summary CSV
        const csvPath = path.join(outputDir, 'runs.csv');
        fs.writeFileSync(csvPath, generateCSV(batchResult));
        console.log(`  Saved: ${csvPath}`);

        // Participant CSV
        const participantCsvPath = path.join(outputDir, 'participants.csv');
        fs.writeFileSync(participantCsvPath, generateParticipantCSV(batchResult));
        console.log(`  Saved: ${participantCsvPath}`);
    }

    // Save text summary
    const summaryTextPath = path.join(outputDir, 'summary.txt');
    fs.writeFileSync(summaryTextPath, summary);
    console.log(`  Saved: ${summaryTextPath}`);

    // Generate and save narrative
    const narrative = generateNarrative(batchResult, config);
    const narrativePath = path.join(outputDir, 'narrative.md');
    fs.writeFileSync(narrativePath, narrative);
    console.log(`  Saved: ${narrativePath}`);

    // Generate and save HTML report
    const htmlReport = generateHTMLReport(batchResult, config, narrative);
    const htmlPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlReport);
    console.log(`  Saved: ${htmlPath}`);

    // Regenerate simulation index
    const outputRoot = path.join(__dirname, 'output');
    const indexHTML = generateIndexPage(outputRoot);
    fs.writeFileSync(path.join(outputRoot, 'index.html'), indexHTML);
    console.log(`  Updated: ${path.join(outputRoot, 'index.html')}`);

    // Copy config
    const configCopyPath = path.join(outputDir, 'config.json');
    fs.writeFileSync(configCopyPath, JSON.stringify(config, null, 2));
    console.log(`  Saved: ${configCopyPath}`);

    console.log('');
    console.log('  Done!');
    console.log('');
}

// Run if called directly
if (require.main === module) {
    main().catch(e => {
        console.error('Error:', e.message);
        process.exit(1);
    });
}

module.exports = { parseArgs, loadConfig, generateSummary };
