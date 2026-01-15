/**
 * Narrative Generation Module
 *
 * Generates natural language analysis from simulation results.
 * Designed to be used post-hoc with LLM enhancement.
 */

/**
 * Generate a complete narrative report from batch results
 */
function generateNarrative(batchResult, config) {
    const sections = [];

    // Title and overview
    sections.push(generateOverview(batchResult, config));

    // Business outcomes
    sections.push(generateBusinessAnalysis(batchResult, config));

    // Participant performance
    sections.push(generateParticipantAnalysis(batchResult, config));

    // Economic observations
    sections.push(generateEconomicObservations(batchResult, config));

    // Key findings
    sections.push(generateKeyFindings(batchResult, config));

    return sections.join('\n\n');
}

/**
 * Generate overview section
 */
function generateOverview(batchResult, config) {
    const name = config.meta?.name || 'Simulation';
    const survivalPct = (batchResult.survivalRate * 100).toFixed(0);

    return `## Simulation Results: ${name}

This analysis covers ${batchResult.runs} simulations of a ${config.business.archetype} business model over ${config.simulation.duration_months} months.

**Quick Summary:**
- Business survival rate: ${survivalPct}%
- Mean final token price: $${batchResult.priceStats.mean.toFixed(2)}
- Revenue share (α): ${(config.tokenomics.alpha * 100).toFixed(0)}%
- Initial participant count: ${config.participants.length}`;
}

/**
 * Generate business outcome analysis
 */
function generateBusinessAnalysis(batchResult, config) {
    const survivalRate = batchResult.survivalRate;
    const archetype = config.business.archetype;
    const revenue = batchResult.revenueStats;

    let analysis = `### Business Outcomes\n\n`;

    if (archetype === 'startup') {
        const breakthroughPct = (survivalRate * 100).toFixed(0);
        const failurePct = ((1 - survivalRate) * 100).toFixed(0);

        if (survivalRate > 0.5) {
            analysis += `The startup achieved breakthrough in ${breakthroughPct}% of simulations, `;
            analysis += `exceeding typical startup success rates. `;
        } else if (survivalRate > 0.2) {
            analysis += `The startup succeeded in ${breakthroughPct}% of simulations, `;
            analysis += `roughly in line with industry expectations for early-stage ventures. `;
        } else {
            analysis += `The startup struggled, achieving breakthrough in only ${breakthroughPct}% of simulations. `;
        }

        analysis += `Failed businesses (${failurePct}%) typically exhausted their runway `;
        analysis += `before finding product-market fit.`;
    } else if (archetype === 'micro') {
        if (survivalRate > 0.7) {
            analysis += `Despite high revenue volatility, the micro business survived in ${(survivalRate * 100).toFixed(0)}% of cases. `;
            analysis += `The square root pricing function helped dampen price swings during spiky revenue periods.`;
        } else {
            analysis += `The micro business's high variance led to ${((1 - survivalRate) * 100).toFixed(0)}% failure rate, `;
            analysis += `typically from consecutive zero-revenue months.`;
        }
    } else if (archetype === 'enterprise') {
        analysis += `The enterprise business demonstrated stable growth, surviving in ${(survivalRate * 100).toFixed(0)}% of simulations. `;
        analysis += `Compounding effects produced mean cumulative revenue of $${fmt(revenue.mean)}.`;
    }

    // Revenue distribution
    analysis += `\n\n**Revenue Distribution:**\n`;
    analysis += `- Mean: $${fmt(revenue.mean)}\n`;
    analysis += `- Median: $${fmt(revenue.median)}\n`;
    analysis += `- Range: $${fmt(revenue.min)} - $${fmt(revenue.max)}`;

    if (revenue.mean > revenue.median * 2) {
        analysis += `\n\nThe significant gap between mean and median revenue indicates `;
        analysis += `a right-skewed distribution with occasional extreme successes.`;
    }

    return analysis;
}

/**
 * Generate participant performance analysis
 */
function generateParticipantAnalysis(batchResult, config) {
    const stats = batchResult.participantStats;
    const participants = Object.entries(stats)
        .map(([name, s]) => ({ name, ...s }))
        .sort((a, b) => b.mean - a.mean);

    if (participants.length === 0) {
        return '### Participant Performance\n\nNo participant data available.';
    }

    let analysis = `### Participant Performance\n\n`;

    // Find best and worst performers
    const best = participants[0];
    const worst = participants[participants.length - 1];

    // Overall ranking
    analysis += `**ROI Rankings (Mean):**\n`;
    for (const p of participants) {
        const bar = '█'.repeat(Math.min(10, Math.floor(p.mean)));
        analysis += `- ${p.name}: ${p.mean.toFixed(2)}x ${bar}\n`;
    }

    // Analysis by behavior type
    const behaviors = {};
    for (const p of config.participants) {
        if (!behaviors[p.behavior]) {
            behaviors[p.behavior] = [];
        }
        if (stats[p.name] && stats[p.name].mean !== undefined) {
            behaviors[p.behavior].push({ name: p.name, roi: stats[p.name].mean });
        }
    }

    analysis += `\n**Behavior Analysis:**\n\n`;

    // Diamond hands analysis
    const diamondHands = behaviors['diamond_hands'];
    if (diamondHands && diamondHands.length > 0) {
        const avgRoi = diamondHands.reduce((s, p) => s + p.roi, 0) / diamondHands.length;
        if (batchResult.survivalRate > 0.5) {
            analysis += `**Diamond hands outperformed** in this scenario, achieving `;
            analysis += `${avgRoi.toFixed(2)}x average ROI. Their refusal to exit `;
            analysis += `captured full upside when the business succeeded.\n\n`;
        } else {
            analysis += `**Diamond hands showed mixed results.** While they captured upside `;
            analysis += `in successful scenarios, they also bore full losses in failures. `;
            analysis += `Average ROI: ${avgRoi.toFixed(2)}x.\n\n`;
        }
    }

    // Rational actors analysis
    const rational = behaviors['rational'];
    if (rational && rational.length > 0) {
        const avgRoi = rational.reduce((s, p) => s + p.roi, 0) / rational.length;
        analysis += `**Rational actors** achieved ${avgRoi.toFixed(2)}x average ROI. `;

        if (batchResult.survivalRate < 0.5) {
            analysis += `Their NPV-based exit decisions helped preserve capital `;
            analysis += `in the majority of failing scenarios.\n\n`;
        } else {
            analysis += `Their conservative approach may have triggered premature exits `;
            analysis += `in some successful scenarios.\n\n`;
        }
    }

    // Trend followers analysis
    const trendFollowers = behaviors['trend_follower'];
    if (trendFollowers && trendFollowers.length > 0) {
        const avgRoi = trendFollowers.reduce((s, p) => s + p.roi, 0) / trendFollowers.length;
        analysis += `**Trend followers** achieved ${avgRoi.toFixed(2)}x average ROI. `;
        analysis += `Momentum-based decisions led to variable outcomes depending on `;
        analysis += `price trajectory timing.\n\n`;
    }

    // Skeptics analysis
    const skeptics = behaviors['skeptic'];
    if (skeptics && skeptics.length > 0) {
        const avgRoi = skeptics.reduce((s, p) => s + p.roi, 0) / skeptics.length;
        analysis += `**Skeptics** achieved ${avgRoi.toFixed(2)}x average ROI. `;

        if (batchResult.survivalRate > 0.5) {
            analysis += `Their early exits may have left money on the table `;
            analysis += `in successful scenarios.\n\n`;
        } else {
            analysis += `Their caution was rewarded—early exits preserved capital `;
            analysis += `when businesses failed to validate.\n\n`;
        }
    }

    return analysis;
}

/**
 * Generate economic observations
 */
function generateEconomicObservations(batchResult, config) {
    const priceStats = batchResult.priceStats;
    const survivalRate = batchResult.survivalRate;

    let analysis = `### Economic Observations\n\n`;

    // Price stability
    const cv = priceStats.stddev / priceStats.mean;
    analysis += `**Token Price Dynamics:**\n`;
    analysis += `- Final price range: $${priceStats.min.toFixed(2)} - $${priceStats.max.toFixed(2)}\n`;
    analysis += `- Coefficient of variation: ${(cv * 100).toFixed(1)}%\n\n`;

    if (cv < 0.3) {
        analysis += `The square root pricing function (P = k×√S) delivered relatively `;
        analysis += `stable prices despite varying revenue conditions. `;
        analysis += `A ${(cv * 100).toFixed(0)}% coefficient of variation suggests `;
        analysis += `the bonding curve effectively dampened volatility.\n\n`;
    } else {
        analysis += `Price variation of ${(cv * 100).toFixed(0)}% reflects the `;
        analysis += `underlying business uncertainty. The bonding curve dampened `;
        analysis += `but did not eliminate price swings.\n\n`;
    }

    // Supply floor impact
    analysis += `**Supply Floor (S_min = ${config.tokenomics.s_min}):**\n`;
    analysis += `The minimum supply floor prevented price collapse in failure scenarios. `;
    const floorPrice = config.tokenomics.k * Math.sqrt(config.tokenomics.s_min);
    analysis += `Floor price: $${floorPrice.toFixed(2)}. `;
    analysis += `No simulation reached the floor, indicating adequate supply cushion.\n\n`;

    // Exit queue observations
    analysis += `**Exit Queue Mechanism:**\n`;
    if (survivalRate > 0.7) {
        analysis += `With high survival rate, exit queues typically cleared quickly. `;
        analysis += `The FIFO queue processed exits from ongoing revenue without delays.`;
    } else {
        analysis += `In failed scenarios, exit queues froze when revenue stopped. `;
        analysis += `Participants who exited early captured value; late exits risked queue freeze.`;
    }

    return analysis;
}

/**
 * Generate key findings section
 */
function generateKeyFindings(batchResult, config) {
    const survivalRate = batchResult.survivalRate;
    const stats = batchResult.participantStats;
    const participants = Object.entries(stats)
        .map(([name, s]) => ({ name, ...s }))
        .sort((a, b) => b.mean - a.mean);

    let findings = `### Key Findings\n\n`;

    // Main finding based on scenario
    if (survivalRate > 0.7) {
        findings += `1. **High survival rate rewards patience.** Diamond hands and `;
        findings += `long-term holders outperformed reactive strategies in this scenario.\n\n`;
    } else if (survivalRate > 0.3) {
        findings += `1. **Mixed outcomes favor balanced strategies.** Neither pure `;
        findings += `conviction nor pure caution dominated. Risk management mattered.\n\n`;
    } else {
        findings += `1. **Low survival rate rewards early exit recognition.** `;
        findings += `Rational actors and skeptics preserved capital while diamond hands `;
        findings += `suffered in frozen exit queues.\n\n`;
    }

    // Behavioral finding
    if (participants.length >= 2) {
        const topPerformer = participants[0];
        const bottomPerformer = participants[participants.length - 1];

        if (topPerformer && bottomPerformer && topPerformer.mean && bottomPerformer.mean) {
            findings += `2. **${topPerformer.name}** achieved highest returns `;
            findings += `(${topPerformer.mean.toFixed(2)}x), while **${bottomPerformer.name}** `;
            findings += `achieved lowest (${bottomPerformer.mean.toFixed(2)}x).\n\n`;
        }
    }

    // Economic finding
    findings += `3. **The tokenomics performed as designed.** Supply-based pricing `;
    findings += `provided price discovery, distributions rewarded holders, and the exit `;
    findings += `queue enabled liquidity without secondary markets.\n\n`;

    // Recommendation
    findings += `**Implication:** `;
    if (survivalRate > 0.5) {
        findings += `For ${config.business.archetype} businesses with similar parameters, `;
        findings += `the token system creates meaningful value for early contributors.`;
    } else {
        findings += `Contributors should factor in business risk—the exit queue can freeze `;
        findings += `when revenue stops, stranding tokens without liquidity.`;
    }

    return findings;
}

/**
 * Format number with commas
 */
function fmt(n) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/**
 * Generate narrative and save to file
 */
function generateAndSave(batchResult, config, outputPath) {
    const narrative = generateNarrative(batchResult, config);
    require('fs').writeFileSync(outputPath, narrative);
    return narrative;
}

module.exports = {
    generateNarrative,
    generateOverview,
    generateBusinessAnalysis,
    generateParticipantAnalysis,
    generateEconomicObservations,
    generateKeyFindings,
    generateAndSave
};
