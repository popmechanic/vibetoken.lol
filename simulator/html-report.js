/**
 * HTML Report Generator
 *
 * Generates a self-contained HTML visualization page from simulation output.
 * Styled to match the main Vibe Token website aesthetic.
 */

/**
 * Convert narrative markdown to HTML
 * Handles: ## headings, ### headings, **bold**, - lists, paragraphs
 */
function markdownToHTML(md) {
    // Split into blocks by double newlines
    const blocks = md.split(/\n\n+/);

    return blocks.map(block => {
        block = block.trim();
        if (!block) return '';

        // H2 heading
        if (block.startsWith('## ')) {
            return `<h2>${block.slice(3)}</h2>`;
        }

        // H3 heading
        if (block.startsWith('### ')) {
            return `<h3>${block.slice(4)}</h3>`;
        }

        // List block (consecutive lines starting with -)
        if (block.match(/^- /m)) {
            const items = block.split('\n')
                .filter(line => line.startsWith('- '))
                .map(line => `<li>${processBold(line.slice(2))}</li>`)
                .join('\n');
            return `<ul class="conditions">\n${items}\n</ul>`;
        }

        // Regular paragraph
        const text = block.replace(/\n/g, ' ');
        return `<p>${processBold(text)}</p>`;
    }).filter(Boolean).join('\n\n');
}

/**
 * Process **bold** markdown syntax
 */
function processBold(text) {
    return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Build histogram bins from an array of values
 */
function buildHistogramBins(values, binCount = 15) {
    if (!values || values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / binCount || 1;

    const bins = [];
    for (let i = 0; i < binCount; i++) {
        bins.push({
            min: min + i * binWidth,
            max: min + (i + 1) * binWidth,
            count: 0
        });
    }

    for (const value of values) {
        const binIndex = Math.min(
            Math.floor((value - min) / binWidth),
            binCount - 1
        );
        if (binIndex >= 0 && binIndex < binCount) {
            bins[binIndex].count++;
        }
    }

    return bins;
}

/**
 * Format large numbers with K/M suffixes
 */
function formatCompact(n) {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
}

/**
 * Generate the complete HTML report
 */
function generateHTMLReport(batchResult, config, narrativeMd) {
    const meta = config.meta || { name: 'Simulation Results' };
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Convert narrative markdown to HTML
    const narrativeHTML = markdownToHTML(narrativeMd);

    // Prepare data for embedding
    const priceDistribution = batchResult.results.map(r => r.finalState.P);
    const revenueDistribution = batchResult.results.map(r => r.finalState.cumulativeRevenue);

    // Build histogram data
    const priceBins = buildHistogramBins(priceDistribution, 12);
    const revenueBins = buildHistogramBins(revenueDistribution, 12);

    // Get participant stats sorted by ROI
    const participantStats = Object.entries(batchResult.participantStats || {})
        .filter(([_, stats]) => stats && stats.mean !== undefined && !isNaN(stats.mean))
        .sort((a, b) => b[1].mean - a[1].mean)
        .slice(0, 12); // Top 12 participants

    // Embedded data object
    const embeddedData = {
        runs: batchResult.runs,
        survivalRate: batchResult.survivalRate,
        priceStats: batchResult.priceStats,
        revenueStats: batchResult.revenueStats,
        participantStats: Object.fromEntries(participantStats),
        priceBins,
        revenueBins
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulation Report: ${meta.name}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --font-heading: Georgia, serif;
            --font-body: 'Crimson Pro', Georgia, serif;
            --font-mono: 'JetBrains Mono', monospace;

            --text-primary: #e8e8e8;
            --text-secondary: #a0a0a0;
            --bg: #0a0a0a;
            --border: #222;
            --accent: #c8c8c8;

            --chart-orange: #f5a623;
            --chart-teal: #4ecdc4;
            --chart-red: #ff6b6b;

            --space-sm: 0.75rem;
            --space-md: 1.5rem;
            --space-lg: 2.5rem;
            --space-xl: 4rem;

            --max-width: 720px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            font-size: 18px;
            -webkit-font-smoothing: antialiased;
        }

        body {
            font-family: var(--font-body);
            color: var(--text-primary);
            background: var(--bg);
            line-height: 1.65;
            padding: var(--space-lg) var(--space-md);
            position: relative;
        }

        /* Noise texture overlay */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.03;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .container {
            max-width: var(--max-width);
            margin: 0 auto;
            position: relative;
        }

        /* Typography */
        h1, h2, h3 {
            font-family: var(--font-heading);
            font-weight: bold;
        }

        h1 {
            font-size: 2.4rem;
            line-height: 1.1;
            margin-bottom: 0.25rem;
        }

        h2 {
            font-size: 1.1rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-top: var(--space-lg);
            margin-bottom: var(--space-sm);
            color: var(--accent);
        }

        h3 {
            font-size: 1rem;
            margin-top: var(--space-md);
            margin-bottom: var(--space-sm);
            color: var(--text-primary);
        }

        p {
            margin-bottom: 1em;
        }

        strong {
            color: var(--text-primary);
        }

        /* Header */
        header {
            text-align: center;
            margin-bottom: var(--space-lg);
            padding-bottom: var(--space-md);
            border-bottom: 1px solid var(--border);
        }

        .subtitle {
            font-family: var(--font-body);
            font-style: italic;
            font-size: 1.1rem;
            color: var(--text-secondary);
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--space-sm);
            margin-bottom: var(--space-lg);
        }

        .stat {
            text-align: center;
            padding: var(--space-md) var(--space-sm);
            border: 1px solid var(--border);
        }

        .stat-label {
            font-family: var(--font-mono);
            font-size: 0.65rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            margin-bottom: 0.5em;
        }

        .stat-value {
            font-family: var(--font-mono);
            font-size: 1.3rem;
            color: var(--text-primary);
        }

        /* Chart Grid */
        .chart-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-md);
            margin-bottom: var(--space-lg);
        }

        .chart-container {
            background: var(--bg);
            border: 1px solid var(--border);
            padding: var(--space-md);
            position: relative;
        }

        .chart-container canvas {
            width: 100% !important;
            height: 240px !important;
        }

        .chart-container.tall canvas {
            height: 320px !important;
        }

        .chart-container.full-width {
            grid-column: 1 / -1;
        }

        /* Conditions list (from narrative) */
        .conditions {
            list-style: none;
            margin: var(--space-sm) 0;
        }

        .conditions li {
            padding-left: 1.5em;
            position: relative;
            margin-bottom: 0.5em;
        }

        .conditions li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: var(--text-secondary);
        }

        /* Narrative section */
        .narrative {
            margin-top: var(--space-xl);
            padding-top: var(--space-lg);
            border-top: 1px solid var(--border);
        }

        .narrative p {
            color: var(--text-secondary);
        }

        .narrative strong {
            color: var(--text-primary);
        }

        /* Divider */
        .divider {
            width: 50px;
            height: 1px;
            background: var(--border);
            margin: var(--space-lg) auto;
        }

        /* Footer */
        footer {
            margin-top: var(--space-xl);
            padding-top: var(--space-md);
            border-top: 1px solid var(--border);
            text-align: center;
            font-family: var(--font-mono);
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        /* Mobile responsive */
        @media (max-width: 600px) {
            h1 {
                font-size: 1.8rem;
            }

            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .chart-grid {
                grid-template-columns: 1fr;
            }

            .chart-container canvas {
                height: 200px !important;
            }
        }

        @media (min-width: 768px) {
            body {
                padding: var(--space-xl) var(--space-lg);
            }
        }
    </style>
</head>
<body>
    <article class="container">
        <header>
            <h1>${meta.name}</h1>
            <p class="subtitle">Monte Carlo Simulation Report</p>
        </header>

        <!-- Summary Stats -->
        <div class="stats-grid">
            <div class="stat">
                <div class="stat-label">Simulations</div>
                <div class="stat-value">${batchResult.runs}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Survival Rate</div>
                <div class="stat-value">${(batchResult.survivalRate * 100).toFixed(0)}%</div>
            </div>
            <div class="stat">
                <div class="stat-label">Mean Price</div>
                <div class="stat-value">$${batchResult.priceStats.mean.toFixed(2)}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Mean Revenue</div>
                <div class="stat-value">${formatCompact(batchResult.revenueStats.mean)}</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="chart-grid">
            <div class="chart-container">
                <canvas id="chart-survival"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="chart-price"></canvas>
            </div>
            <div class="chart-container full-width tall">
                <canvas id="chart-roi"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="chart-revenue"></canvas>
            </div>
        </div>

        <div class="divider"></div>

        <!-- Narrative Content -->
        <section class="narrative">
            ${narrativeHTML}
        </section>

        <footer>
            Generated ${timestamp} | ${batchResult.runs} simulations × ${config.simulation.duration_months} months
        </footer>
    </article>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        const DATA = ${JSON.stringify(embeddedData, null, 2)};

        // Chart defaults
        Chart.defaults.color = '#888';
        Chart.defaults.borderColor = '#222';
        Chart.defaults.font.family = "'JetBrains Mono', monospace";

        // Colors
        const ORANGE = '#f5a623';
        const TEAL = '#4ecdc4';
        const RED = '#ff6b6b';

        // 1. Survival Doughnut
        new Chart(document.getElementById('chart-survival'), {
            type: 'doughnut',
            data: {
                labels: ['Survived', 'Failed'],
                datasets: [{
                    data: [
                        Math.round(DATA.survivalRate * DATA.runs),
                        Math.round((1 - DATA.survivalRate) * DATA.runs)
                    ],
                    backgroundColor: [TEAL, RED],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    title: {
                        display: true,
                        text: 'BUSINESS OUTCOMES',
                        font: { size: 11, weight: 'normal' },
                        padding: { bottom: 15 }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 10 }
                        }
                    }
                }
            }
        });

        // 2. Price Distribution Histogram
        new Chart(document.getElementById('chart-price'), {
            type: 'bar',
            data: {
                labels: DATA.priceBins.map(b => '$' + b.min.toFixed(2)),
                datasets: [{
                    data: DATA.priceBins.map(b => b.count),
                    backgroundColor: TEAL,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'FINAL PRICE DISTRIBUTION',
                        font: { size: 11, weight: 'normal' },
                        padding: { bottom: 15 }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 9 }, maxRotation: 45 }
                    },
                    y: {
                        grid: { color: '#222' },
                        ticks: { font: { size: 9 } },
                        title: { display: true, text: 'Runs', font: { size: 9 } }
                    }
                }
            }
        });

        // 3. ROI by Participant (Horizontal Bar)
        const participants = Object.entries(DATA.participantStats).sort((a, b) => a[1].mean - b[1].mean);
        new Chart(document.getElementById('chart-roi'), {
            type: 'bar',
            data: {
                labels: participants.map(([name]) => name),
                datasets: [{
                    data: participants.map(([_, stats]) => stats.mean),
                    backgroundColor: ORANGE,
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'MEAN ROI BY PARTICIPANT',
                        font: { size: 11, weight: 'normal' },
                        padding: { bottom: 15 }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { color: '#222' },
                        ticks: {
                            font: { size: 9 },
                            callback: function(value) { return value.toFixed(1) + 'x'; }
                        },
                        title: { display: true, text: 'ROI', font: { size: 9 } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { size: 9 } }
                    }
                }
            }
        });

        // 4. Revenue Distribution Histogram
        function formatRevenue(n) {
            if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
            if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
            return '$' + n.toFixed(0);
        }

        new Chart(document.getElementById('chart-revenue'), {
            type: 'bar',
            data: {
                labels: DATA.revenueBins.map(b => formatRevenue(b.min)),
                datasets: [{
                    data: DATA.revenueBins.map(b => b.count),
                    backgroundColor: ORANGE,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'REVENUE DISTRIBUTION',
                        font: { size: 11, weight: 'normal' },
                        padding: { bottom: 15 }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 9 }, maxRotation: 45 }
                    },
                    y: {
                        grid: { color: '#222' },
                        ticks: { font: { size: 9 } },
                        title: { display: true, text: 'Runs', font: { size: 9 } }
                    }
                }
            }
        });
    </script>
</body>
</html>`;
}

/**
 * Generate an index page listing all simulation runs
 */
function generateIndexPage(outputDir) {
    const fs = require('fs');
    const path = require('path');

    // Scan for simulation directories
    const entries = fs.readdirSync(outputDir, { withFileTypes: true });
    const simulations = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const summaryPath = path.join(outputDir, entry.name, 'summary.json');
        const indexPath = path.join(outputDir, entry.name, 'index.html');

        // Only include simulations that have both summary.json and index.html
        if (!fs.existsSync(summaryPath) || !fs.existsSync(indexPath)) continue;

        try {
            const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
            simulations.push({
                dirname: entry.name,
                timestamp: entry.name.replace('T', ' ').replace(/-/g, ':').slice(0, 16),
                name: summary.meta?.name || 'Unnamed',
                runs: summary.runs,
                survivalRate: summary.survivalRate,
                meanPrice: summary.priceStats?.mean || 0,
                meanRevenue: summary.revenueStats?.mean || 0
            });
        } catch (e) {
            // Skip invalid directories
        }
    }

    // Sort by timestamp descending (most recent first)
    simulations.sort((a, b) => b.dirname.localeCompare(a.dirname));

    // Generate table rows
    const rows = simulations.map(sim => `
            <tr>
                <td><a href="output/${sim.dirname}/index.html">${sim.timestamp}</a></td>
                <td>${sim.name}</td>
                <td>${sim.runs}</td>
                <td>${(sim.survivalRate * 100).toFixed(0)}%</td>
                <td>$${sim.meanPrice.toFixed(2)}</td>
                <td>${formatCompact(sim.meanRevenue)}</td>
            </tr>`).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulation Index | Vibe Token</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

    <style>
        :root {
            --font-heading: Georgia, serif;
            --font-body: 'Crimson Pro', Georgia, serif;
            --font-mono: 'JetBrains Mono', monospace;
            --text-primary: #e8e8e8;
            --text-secondary: #a0a0a0;
            --bg: #0a0a0a;
            --border: #222;
            --accent: #c8c8c8;
            --space-sm: 0.75rem;
            --space-md: 1.5rem;
            --space-lg: 2.5rem;
            --space-xl: 4rem;
            --max-width: 900px;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html { font-size: 18px; -webkit-font-smoothing: antialiased; }

        body {
            font-family: var(--font-body);
            color: var(--text-primary);
            background: var(--bg);
            line-height: 1.65;
            padding: var(--space-lg) var(--space-md);
        }

        body::before {
            content: '';
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            opacity: 0.03;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .container {
            max-width: var(--max-width);
            margin: 0 auto;
            position: relative;
        }

        header {
            text-align: center;
            margin-bottom: var(--space-lg);
            padding-bottom: var(--space-md);
            border-bottom: 1px solid var(--border);
        }

        h1 {
            font-family: var(--font-heading);
            font-size: 2.4rem;
            font-weight: bold;
            margin-bottom: 0.25rem;
        }

        .subtitle {
            font-style: italic;
            color: var(--text-secondary);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-family: var(--font-mono);
            font-size: 0.85rem;
        }

        th {
            text-align: left;
            padding: var(--space-sm);
            border-bottom: 2px solid var(--border);
            color: var(--accent);
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        td {
            padding: var(--space-sm);
            border-bottom: 1px solid var(--border);
        }

        tr:hover {
            background: rgba(255, 255, 255, 0.02);
        }

        a {
            color: var(--text-primary);
            text-decoration: none;
        }

        a:hover {
            color: #f5a623;
        }

        .count {
            margin-top: var(--space-lg);
            text-align: center;
            font-size: 0.85rem;
            color: var(--text-secondary);
        }

        footer {
            margin-top: var(--space-xl);
            padding-top: var(--space-md);
            border-top: 1px solid var(--border);
            text-align: center;
            font-family: var(--font-mono);
            font-size: 0.75rem;
            color: var(--text-secondary);
        }

        @media (max-width: 600px) {
            h1 { font-size: 1.8rem; }
            table { font-size: 0.75rem; }
            th, td { padding: 0.5rem 0.25rem; }
        }
    </style>
</head>
<body>
    <article class="container">
        <header>
            <h1>Simulation Index</h1>
            <p class="subtitle">Vibe Token Economic Stress-Testing</p>
        </header>

        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Runs</th>
                    <th>Survival</th>
                    <th>Price</th>
                    <th>Revenue</th>
                </tr>
            </thead>
            <tbody>
${rows}
            </tbody>
        </table>

        <p class="count">${simulations.length} simulation${simulations.length !== 1 ? 's' : ''} recorded</p>

        <footer>
            <a href="../index.html">← Back to Vibe Token</a>
        </footer>
    </article>
</body>
</html>`;
}

module.exports = {
    generateHTMLReport,
    generateIndexPage,
    markdownToHTML,
    buildHistogramBins
};
