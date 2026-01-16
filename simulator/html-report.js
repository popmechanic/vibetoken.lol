/**
 * HTML Report Generator
 *
 * Generates a self-contained HTML visualization page from simulation output.
 * Styled to match the main Vibe Token website aesthetic.
 */

/**
 * Convert narrative markdown to HTML
 * Handles: ## headings, ### headings, **bold**, - lists, paragraphs
 * Wraps ROI Rankings and Earn-Mode Performers in collapsible accordions
 */
function markdownToHTML(md) {
    // Split into blocks by double newlines
    const blocks = md.split(/\n\n+/);
    const result = [];

    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i].trim();
        if (!block) continue;

        // H2 heading
        if (block.startsWith('## ')) {
            result.push(`<h2>${block.slice(3)}</h2>`);
            continue;
        }

        // H3 heading
        if (block.startsWith('### ')) {
            result.push(`<h3>${block.slice(4)}</h3>`);
            continue;
        }

        // ROI Rankings block (header + list in same block) - make collapsible
        if (block.startsWith('**ROI Rankings')) {
            const lines = block.split('\n');
            const headerLine = lines[0];
            const listLines = lines.slice(1).filter(line => line.startsWith('- '));

            if (listLines.length > 0) {
                const headerText = processBold(headerLine);
                const items = listLines
                    .map(line => `<li>${processBold(line.slice(2))}</li>`)
                    .join('\n');
                result.push(`<details class="participant-accordion">
<summary><span class="accordion-icon">▸</span> ${headerText} <span class="accordion-count">(${listLines.length} participants)</span></summary>
<ul class="conditions">\n${items}\n</ul>
</details>`);
                continue;
            }
        }

        // Earn-Mode Performers block (header + list in same block) - make collapsible
        if (block.startsWith('**Earn-Mode Performers')) {
            const lines = block.split('\n');
            const headerLine = lines[0];
            const listLines = lines.slice(1).filter(line => line.startsWith('- '));

            if (listLines.length > 0) {
                const headerText = processBold(headerLine);
                const items = listLines
                    .map(line => `<li>${processBold(line.slice(2))}</li>`)
                    .join('\n');
                result.push(`<details class="participant-accordion">
<summary><span class="accordion-icon">▸</span> ${headerText} <span class="accordion-count">(${listLines.length})</span></summary>
<ul class="conditions">\n${items}\n</ul>
</details>`);
                continue;
            }
        }

        // All Business Stories block (header + list in same block) - make collapsible
        if (block.startsWith('**All Business Stories')) {
            const lines = block.split('\n');
            const headerLine = lines[0];
            const listLines = lines.slice(1).filter(line => line.startsWith('- '));

            if (listLines.length > 0) {
                const headerText = processBold(headerLine);
                const items = listLines
                    .map(line => `<li>${processBold(line.slice(2))}</li>`)
                    .join('\n');
                result.push(`<details class="participant-accordion">
<summary><span class="accordion-icon">▸</span> ${headerText} <span class="accordion-count">(${listLines.length} stories)</span></summary>
<ul class="conditions">\n${items}\n</ul>
</details>`);
                continue;
            }
        }

        // List block (consecutive lines starting with -)
        if (block.match(/^- /m)) {
            const items = block.split('\n')
                .filter(line => line.startsWith('- '))
                .map(line => `<li>${processBold(line.slice(2))}</li>`)
                .join('\n');
            result.push(`<ul class="conditions">\n${items}\n</ul>`);
            continue;
        }

        // Regular paragraph
        const text = block.replace(/\n/g, ' ');
        result.push(`<p>${processBold(text)}</p>`);
    }

    return result.filter(Boolean).join('\n\n');
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
 * Aggregate time-series data across all runs
 * Returns mean and percentile bands for each month
 */
function aggregateTimeSeries(results, fieldExtractor) {
    if (!results || results.length === 0) return null;

    const duration = results[0].history?.length || 36;
    const means = [];
    const p10 = [];
    const p90 = [];

    for (let month = 0; month < duration; month++) {
        const values = results
            .map(r => r.history?.[month] ? fieldExtractor(r.history[month]) : null)
            .filter(v => v !== null && isFinite(v));

        if (values.length === 0) {
            means.push(0);
            p10.push(0);
            p90.push(0);
            continue;
        }

        values.sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        means.push(sum / values.length);
        p10.push(values[Math.floor(values.length * 0.1)] || values[0]);
        p90.push(values[Math.floor(values.length * 0.9)] || values[values.length - 1]);
    }

    return { means, p10, p90 };
}

/**
 * Calculate "fun" engagement proxy metrics from simulation results
 * Measures decision activity, outcome variance, and timing rewards
 */
function calculateEngagementMetrics(results) {
    if (!results || results.length === 0) return null;

    let totalExitRequests = 0;
    let partialExits = 0;
    let fullExits = 0;
    let totalDecisions = 0;  // Non-HOLD decisions
    const roiValues = [];
    const earlyExiterROIs = [];  // Exited in first half
    const lateExiterROIs = [];   // Exited in second half or held

    for (const result of results) {
        const duration = result.history?.length || 36;
        const midpoint = Math.floor(duration / 2);

        // Count exit events from history
        for (const snapshot of (result.history || [])) {
            for (const event of (snapshot.events || [])) {
                if (event.type === 'exit_request') {
                    totalExitRequests++;
                    totalDecisions++;

                    // Track partial vs full by comparing to participant's grant
                    const participant = result.participantOutcomes?.find(p => p.id === event.participantId);
                    if (participant) {
                        if (event.tokens < participant.grant) {
                            partialExits++;
                        } else {
                            fullExits++;
                        }
                    }
                }
                if (event.type === 'tokens_earned') {
                    totalDecisions++;  // Earning tokens = active participation
                }
            }
        }

        // Collect ROI values for variance calculation
        for (const p of (result.participantOutcomes || [])) {
            if (isFinite(p.roi) && !isNaN(p.roi)) {
                roiValues.push(p.roi);

                // Categorize by exit timing
                if (p.hasExited && p.exitMonth && p.exitMonth <= midpoint) {
                    earlyExiterROIs.push(p.roi);
                } else {
                    lateExiterROIs.push(p.roi);
                }
            }
        }
    }

    // Calculate ROI variance (outcome spread = excitement)
    const roiMean = roiValues.length > 0
        ? roiValues.reduce((a, b) => a + b, 0) / roiValues.length
        : 0;
    const roiVariance = roiValues.length > 0
        ? roiValues.reduce((acc, v) => acc + (v - roiMean) ** 2, 0) / roiValues.length
        : 0;
    const roiStdDev = Math.sqrt(roiVariance);

    // Calculate timing spread (does exit timing matter?)
    const earlyMeanROI = earlyExiterROIs.length > 0
        ? earlyExiterROIs.reduce((a, b) => a + b, 0) / earlyExiterROIs.length
        : 0;
    const lateMeanROI = lateExiterROIs.length > 0
        ? lateExiterROIs.reduce((a, b) => a + b, 0) / lateExiterROIs.length
        : 0;
    const timingSpread = lateMeanROI - earlyMeanROI;

    // Decision density (decisions per run)
    const decisionDensity = totalDecisions / results.length;

    return {
        totalExitRequests,
        partialExits,
        fullExits,
        exitRate: totalExitRequests > 0 ? (partialExits / totalExitRequests * 100).toFixed(0) : 0,
        decisionDensity: decisionDensity.toFixed(1),
        roiStdDev: roiStdDev.toFixed(2),
        timingSpread: timingSpread.toFixed(2),
        // Interpretation flags
        highVariance: roiStdDev > 50,  // Exciting outcome spread
        timingMatters: Math.abs(timingSpread) > 5  // Exit timing affects ROI significantly
    };
}

/**
 * Aggregate participant balances by behavior type across all runs
 * Returns mean balance per month for each behavior type
 */
function aggregateBalancesByBehavior(results) {
    if (!results || results.length === 0) return null;

    const duration = results[0].history?.length || 36;

    // Collect all behavior types from first run's participant outcomes
    const behaviorTypes = [...new Set(
        results[0].participantOutcomes?.map(p => p.behaviorType) || []
    )];

    const balancesByBehavior = {};

    for (const behaviorType of behaviorTypes) {
        const monthlyMeans = [];

        for (let month = 0; month < duration; month++) {
            const balances = [];

            for (const result of results) {
                const snapshot = result.history?.[month];
                if (!snapshot?.participantBalances) continue;

                // Get balances for this behavior type
                for (const [pid, balance] of Object.entries(snapshot.participantBalances)) {
                    const participant = result.participantOutcomes?.find(p => p.id === pid);
                    if (participant?.behaviorType === behaviorType) {
                        balances.push(balance);
                    }
                }
            }

            const mean = balances.length > 0
                ? balances.reduce((a, b) => a + b, 0) / balances.length
                : 0;
            monthlyMeans.push(mean);
        }

        balancesByBehavior[behaviorType] = monthlyMeans;
    }

    return balancesByBehavior;
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

    // Aggregate time-series data
    const priceTimeSeries = aggregateTimeSeries(batchResult.results, h => h.P);
    const revenueTimeSeries = aggregateTimeSeries(batchResult.results, h => h.revenue);
    const balancesByBehavior = aggregateBalancesByBehavior(batchResult.results);

    // Calculate engagement/"fun" metrics
    const engagementMetrics = calculateEngagementMetrics(batchResult.results);

    // Generate month labels
    const duration = batchResult.results[0]?.history?.length || 36;
    const monthLabels = Array.from({ length: duration }, (_, i) => `M${i + 1}`);

    // Embedded data object
    const embeddedData = {
        runs: batchResult.runs,
        survivalRate: batchResult.survivalRate,
        priceStats: batchResult.priceStats,
        revenueStats: batchResult.revenueStats,
        participantStats: Object.fromEntries(participantStats),
        priceBins,
        revenueBins,
        // Time-series data
        monthLabels,
        priceTimeSeries,
        revenueTimeSeries,
        balancesByBehavior,
        // Engagement/"fun" metrics
        engagementMetrics
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
    <link rel="stylesheet" href="../../../css/variables.css">
    <link rel="stylesheet" href="../../../css/base.css">
    <link rel="stylesheet" href="../../../css/simulator.css">
</head>
<body>
    <article class="container narrow">
        <header>
            <h1>${meta.name}</h1>
            <p class="subtitle">Monte Carlo Simulation Report</p>
        </header>

        <!-- Summary Stats -->
        <div class="stats-grid">
            <div class="stat">
                <div class="stat-label has-tooltip" data-tooltip="Monte Carlo run count">Simulations</div>
                <div class="stat-value">${batchResult.runs}</div>
            </div>
            <div class="stat">
                <div class="stat-label has-tooltip" data-tooltip="% where business survived">Survival Rate</div>
                <div class="stat-value">${(batchResult.survivalRate * 100).toFixed(0)}%</div>
            </div>
            <div class="stat">
                <div class="stat-label has-tooltip" data-tooltip="Average final token price">Mean Price</div>
                <div class="stat-value">$${batchResult.priceStats.mean.toFixed(2)}</div>
            </div>
            <div class="stat">
                <div class="stat-label has-tooltip" data-tooltip="Average cumulative revenue">Mean Revenue</div>
                <div class="stat-value">${formatCompact(batchResult.revenueStats.mean)}</div>
            </div>
        </div>

        <!-- Engagement/"Fun" Metrics -->
        <div class="stats-grid">
            <div class="stat">
                <div class="stat-label has-tooltip" data-tooltip="Non-HOLD actions per simulation">Decisions/Run</div>
                <div class="stat-value">${engagementMetrics?.decisionDensity || '—'}</div>
            </div>
            <div class="stat">
                <div class="stat-label has-tooltip" data-tooltip="StdDev of returns — higher = more variance">ROI Spread</div>
                <div class="stat-value">${engagementMetrics?.roiStdDev || '—'}x</div>
            </div>
            <div class="stat">
                <div class="stat-label has-tooltip" data-tooltip="Total exit requests across all runs">Exit Events</div>
                <div class="stat-value">${engagementMetrics?.totalExitRequests || 0}</div>
            </div>
            <div class="stat">
                <div class="stat-label has-tooltip" data-tooltip="ROI advantage of holding vs early exit">Timing Edge</div>
                <div class="stat-value">${engagementMetrics?.timingSpread > 0 ? '+' : ''}${engagementMetrics?.timingSpread || '—'}x</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="chart-grid">
            <div class="chart-container">
                <canvas id="chart-survival"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="chart-price-dist"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="chart-price-time"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="chart-revenue-time"></canvas>
            </div>
            <div class="chart-container full-width tall">
                <canvas id="chart-roi"></canvas>
            </div>
            <div class="chart-container full-width tall">
                <canvas id="chart-balances"></canvas>
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

        // Tooltip styling (dark theme with dashed border)
        Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        Chart.defaults.plugins.tooltip.titleColor = '#e8e8e8';
        Chart.defaults.plugins.tooltip.bodyColor = '#e8e8e8';
        Chart.defaults.plugins.tooltip.borderColor = '#888';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 0;
        Chart.defaults.plugins.tooltip.displayColors = true;
        Chart.defaults.plugins.tooltip.boxPadding = 4;

        // Colors
        const ORANGE = '#f5a623';
        const TEAL = '#4ecdc4';
        const RED = '#ff6b6b';

        // External tooltip handler for dashed-border CSS styling
        function externalTooltipHandler(context) {
            const tooltip = document.getElementById('chart-tooltip');
            const tooltipModel = context.tooltip;

            if (tooltipModel.opacity === 0) {
                tooltip.style.opacity = 0;
                return;
            }

            // Build content
            let html = '';
            if (tooltipModel.title && tooltipModel.title.length > 0) {
                html += '<div style="margin-bottom:4px;font-weight:500">' + tooltipModel.title.join(' ') + '</div>';
            }
            if (tooltipModel.body) {
                tooltipModel.body.forEach((item, i) => {
                    const colors = tooltipModel.labelColors[i];
                    const color = colors ? colors.borderColor || colors.backgroundColor : '#888';
                    html += '<div style="display:flex;align-items:center;gap:6px">';
                    html += '<span style="width:8px;height:8px;background:' + color + ';display:inline-block"></span>';
                    html += item.lines.join(' ');
                    html += '</div>';
                });
            }
            tooltip.innerHTML = html;

            // Position relative to viewport
            const canvas = context.chart.canvas;
            const rect = canvas.getBoundingClientRect();
            tooltip.style.left = (rect.left + window.scrollX + tooltipModel.caretX) + 'px';
            tooltip.style.top = (rect.top + window.scrollY + tooltipModel.caretY - tooltip.offsetHeight - 10) + 'px';
            tooltip.style.opacity = 1;
        }

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
        new Chart(document.getElementById('chart-price-dist'), {
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

        // 4. Token Price Over Time (with percentile bands)
        if (DATA.priceTimeSeries && DATA.priceTimeSeries.means) {
            new Chart(document.getElementById('chart-price-time'), {
                type: 'line',
                data: {
                    labels: DATA.monthLabels,
                    datasets: [
                        {
                            label: '90th percentile',
                            data: DATA.priceTimeSeries.p90,
                            borderColor: 'transparent',
                            backgroundColor: 'rgba(245, 166, 35, 0.15)',
                            fill: '+1',
                            pointRadius: 0,
                            tension: 0
                        },
                        {
                            label: 'Mean Price',
                            data: DATA.priceTimeSeries.means,
                            borderColor: ORANGE,
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0
                        },
                        {
                            label: '10th percentile',
                            data: DATA.priceTimeSeries.p10,
                            borderColor: 'transparent',
                            backgroundColor: 'transparent',
                            fill: false,
                            pointRadius: 0,
                            tension: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'TOKEN PRICE OVER TIME',
                            font: { size: 11, weight: 'normal' },
                            padding: { bottom: 15 }
                        },
                        legend: { display: false },
                        tooltip: {
                            enabled: false,
                            external: externalTooltipHandler,
                            callbacks: {
                                label: function(context) {
                                    if (context.datasetIndex === 1) {
                                        return 'Mean: $' + context.parsed.y.toFixed(2);
                                    } else if (context.datasetIndex === 0) {
                                        return '90th %: $' + context.parsed.y.toFixed(2);
                                    } else {
                                        return '10th %: $' + context.parsed.y.toFixed(2);
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: '#222' },
                            ticks: { font: { size: 9 }, maxTicksLimit: 12 }
                        },
                        y: {
                            grid: { color: '#222' },
                            ticks: {
                                font: { size: 9 },
                                callback: function(value) { return '$' + value.toFixed(2); }
                            },
                            title: { display: true, text: 'Price', font: { size: 9 } }
                        }
                    }
                }
            });
        }

        // 5. Monthly Revenue Over Time (with percentile bands)
        function formatRevenue(n) {
            if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
            if (n >= 1000) return '$' + (n / 1000).toFixed(0) + 'K';
            return '$' + n.toFixed(0);
        }

        if (DATA.revenueTimeSeries && DATA.revenueTimeSeries.means) {
            new Chart(document.getElementById('chart-revenue-time'), {
                type: 'line',
                data: {
                    labels: DATA.monthLabels,
                    datasets: [
                        {
                            label: '90th percentile',
                            data: DATA.revenueTimeSeries.p90,
                            borderColor: 'transparent',
                            backgroundColor: 'rgba(78, 205, 196, 0.15)',
                            fill: '+1',
                            pointRadius: 0,
                            tension: 0
                        },
                        {
                            label: 'Mean Revenue',
                            data: DATA.revenueTimeSeries.means,
                            borderColor: TEAL,
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: 0
                        },
                        {
                            label: '10th percentile',
                            data: DATA.revenueTimeSeries.p10,
                            borderColor: 'transparent',
                            backgroundColor: 'transparent',
                            fill: false,
                            pointRadius: 0,
                            tension: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'MONTHLY REVENUE OVER TIME',
                            font: { size: 11, weight: 'normal' },
                            padding: { bottom: 15 }
                        },
                        legend: { display: false },
                        tooltip: {
                            enabled: false,
                            external: externalTooltipHandler,
                            callbacks: {
                                label: function(context) {
                                    if (context.datasetIndex === 1) {
                                        return 'Mean: ' + formatRevenue(context.parsed.y);
                                    } else if (context.datasetIndex === 0) {
                                        return '90th %: ' + formatRevenue(context.parsed.y);
                                    } else {
                                        return '10th %: ' + formatRevenue(context.parsed.y);
                                    }
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: '#222' },
                            ticks: { font: { size: 9 }, maxTicksLimit: 12 }
                        },
                        y: {
                            grid: { color: '#222' },
                            ticks: {
                                font: { size: 9 },
                                callback: function(value) { return formatRevenue(value); }
                            },
                            title: { display: true, text: 'Revenue', font: { size: 9 } }
                        }
                    }
                }
            });
        }

        // 6. Token Balances by Behavior Type
        const BEHAVIOR_COLORS = {
            'diamond_hands': '#f5a623',
            'rational': '#4ecdc4',
            'hustler': '#ff6b6b',
            'skeptic': '#95e1d3',
            'trend_follower': '#a8e6cf'
        };

        if (DATA.balancesByBehavior && Object.keys(DATA.balancesByBehavior).length > 0) {
            const behaviorDatasets = Object.entries(DATA.balancesByBehavior).map(([behavior, balances]) => ({
                label: behavior.replace('_', ' '),
                data: balances,
                borderColor: BEHAVIOR_COLORS[behavior] || '#888',
                backgroundColor: 'transparent',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0
            }));

            new Chart(document.getElementById('chart-balances'), {
                type: 'line',
                data: {
                    labels: DATA.monthLabels,
                    datasets: behaviorDatasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'TOKEN BALANCES BY BEHAVIOR TYPE',
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
                        },
                        tooltip: {
                            enabled: false,
                            external: externalTooltipHandler,
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + Math.round(context.parsed.y).toLocaleString() + ' tokens';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: '#222' },
                            ticks: { font: { size: 9 }, maxTicksLimit: 12 }
                        },
                        y: {
                            grid: { color: '#222' },
                            ticks: {
                                font: { size: 9 },
                                callback: function(value) { return value.toLocaleString(); }
                            },
                            title: { display: true, text: 'Tokens', font: { size: 9 } }
                        }
                    }
                }
            });
        }
    </script>
    <div id="chart-tooltip" class="chart-tooltip"></div>
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
            const engagement = summary.engagementMetrics || {};
            simulations.push({
                dirname: entry.name,
                timestamp: entry.name.replace('T', ' ').replace(/-/g, ':').slice(0, 16),
                name: summary.meta?.name || 'Unnamed',
                runs: summary.runs,
                survivalRate: summary.survivalRate,
                meanPrice: summary.priceStats?.mean || 0,
                meanRevenue: summary.revenueStats?.mean || 0,
                // Engagement metrics
                roiSpread: engagement.roiStdDev || '—',
                timingEdge: engagement.timingSpread || '—',
                decisions: engagement.decisionDensity || '—'
            });
        } catch (e) {
            // Skip invalid directories
        }
    }

    // Sort by timestamp descending (most recent first)
    simulations.sort((a, b) => b.dirname.localeCompare(a.dirname));

    // Generate table rows
    const rows = simulations.map(sim => {
        const timing = sim.timingEdge !== '—' ? (parseFloat(sim.timingEdge) > 0 ? '+' : '') + sim.timingEdge : '—';
        return `
            <tr>
                <td><a href="output/${sim.dirname}/index.html">${sim.timestamp}</a></td>
                <td>${sim.name}</td>
                <td>${sim.runs}</td>
                <td>${(sim.survivalRate * 100).toFixed(0)}%</td>
                <td>$${sim.meanPrice.toFixed(2)}</td>
                <td>${formatCompact(sim.meanRevenue)}</td>
                <td>${sim.roiSpread}x</td>
                <td>${timing}x</td>
                <td>${sim.decisions}</td>
            </tr>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulation Index | Vibe Token</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/variables.css">
    <link rel="stylesheet" href="../css/base.css">
    <link rel="stylesheet" href="../css/simulator.css">
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
                    <th class="has-tooltip" data-tooltip="Monte Carlo run count">Runs</th>
                    <th class="has-tooltip" data-tooltip="% where business survived">Survival</th>
                    <th class="has-tooltip" data-tooltip="Average final token price">Price</th>
                    <th class="has-tooltip" data-tooltip="Average cumulative revenue">Revenue</th>
                    <th class="has-tooltip" data-tooltip="StdDev of returns — higher = more variance">ROI Spread</th>
                    <th class="has-tooltip" data-tooltip="ROI advantage of holding vs early exit">Timing</th>
                    <th class="has-tooltip" data-tooltip="Non-HOLD actions per simulation">Decisions</th>
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
    buildHistogramBins,
    calculateEngagementMetrics
};
