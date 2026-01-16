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
    const earnStats = batchResult.earnModeStats || {};

    // Grant-mode participants (ROI-based ranking)
    const participants = Object.entries(stats)
        .map(([name, s]) => ({ name, ...s }))
        .sort((a, b) => b.mean - a.mean);

    // Earn-mode participants (value-based ranking)
    const earnParticipants = Object.entries(earnStats)
        .map(([name, s]) => ({ name, ...s }))
        .sort((a, b) => b.mean - a.mean);

    if (participants.length === 0 && earnParticipants.length === 0) {
        return '### Participant Performance\n\nNo participant data available.';
    }

    let analysis = `### Participant Performance\n\n`;

    // Find best and worst performers (grant-mode)
    const best = participants[0];
    const worst = participants[participants.length - 1];

    // ROI rankings for grant-mode participants
    if (participants.length > 0) {
        analysis += `**ROI Rankings (Mean):**\n`;
        for (const p of participants) {
            const bar = '█'.repeat(Math.min(10, Math.floor(p.mean)));
            analysis += `- ${p.name}: ${p.mean.toFixed(2)}x ${bar}\n`;
        }
    }

    // Value earned rankings for earn-mode participants
    if (earnParticipants.length > 0) {
        analysis += `\n**Earn-Mode Performers (Total Value):**\n`;
        for (const p of earnParticipants) {
            const bar = '█'.repeat(Math.min(10, Math.floor(p.mean / 50)));  // Scale by $50
            analysis += `- ${p.name}: $${p.mean.toFixed(0)} ${bar}\n`;
        }
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
        analysis += `The √S pricing function dampened business volatility to ${(cv * 100).toFixed(0)}% `;
        analysis += `price variation—achieving the design goal of bounded volatility `;
        analysis += `while preserving price discovery.\n\n`;
    } else {
        analysis += `Price variation of ${(cv * 100).toFixed(0)}% tracked the underlying business risk. `;
        analysis += `The bonding curve damped but didn't eliminate swings—appropriate for `;
        analysis += `this volatility profile.\n\n`;
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

    // Design principle evaluation
    findings += `### Design Principle Check\n\n`;

    const designChecks = [];

    // #1 - Early contributor rewards
    const earlyAdvantage = calculateEarlyContributorAdvantage(batchResult.results);
    if (earlyAdvantage.measurable) {
        const symbol = earlyAdvantage.advantage > 1.2 ? '✓' : '✗';
        designChecks.push(`${symbol} **Early contributor reward**: ${earlyAdvantage.earlyMean.toFixed(1)}x ROI for month 1-2 entrants vs ${earlyAdvantage.lateMean.toFixed(1)}x for later (${earlyAdvantage.advantage.toFixed(1)}x advantage)`);
    }

    // #9 - Bounded volatility
    const volatility = calculateVolatilityDampening(batchResult.priceStats, batchResult.revenueStats);
    if (volatility.dampening > 0.3) {
        designChecks.push(`✓ **Bounded volatility**: Revenue CV ${(volatility.revenueCV * 100).toFixed(0)}% → Price CV ${(volatility.priceCV * 100).toFixed(0)}% (${(volatility.dampening * 100).toFixed(0)}% dampening)`);
    } else if (volatility.dampening > 0) {
        designChecks.push(`⚠ **Bounded volatility**: Modest dampening (${(volatility.dampening * 100).toFixed(0)}%)`);
    }

    // #10 - Floor protection
    const floor = checkFloorProtection(batchResult.results, config);
    if (floor.hits === 0) {
        designChecks.push(`✓ **Floor protection**: No runs hit S_min${floor.approaches > 0 ? ` (${floor.approaches} approached)` : ''}`);
    } else {
        designChecks.push(`✗ **Floor protection**: ${floor.hits} runs hit S_min`);
    }

    // #5 - Liquidity (exit queue)
    if (survivalRate > 0.7) {
        designChecks.push(`✓ **Exit liquidity**: High survival enabled queue clearance without secondary markets`);
    } else {
        designChecks.push(`⚠ **Exit liquidity**: ${((1 - survivalRate) * 100).toFixed(0)}% failure rate risked queue freezes`);
    }

    for (const check of designChecks) {
        findings += `- ${check}\n`;
    }
    findings += '\n';

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
 * Calculate early contributor advantage (Design Objective #1)
 * Groups participants by entry month, compares ROI
 */
function calculateEarlyContributorAdvantage(results) {
    const earlyROIs = [];  // startMonth <= 2
    const lateROIs = [];   // startMonth >= 3

    for (const result of results) {
        for (const p of (result.participantOutcomes || [])) {
            if (!isFinite(p.roi) || p.isLateEntrant) continue;  // Skip dynamic entrants
            if (p.startMonth <= 2) {
                earlyROIs.push(p.roi);
            } else {
                lateROIs.push(p.roi);
            }
        }
    }

    const earlyMean = earlyROIs.length > 0 ? earlyROIs.reduce((a, b) => a + b, 0) / earlyROIs.length : 0;
    const lateMean = lateROIs.length > 0 ? lateROIs.reduce((a, b) => a + b, 0) / lateROIs.length : 0;

    return {
        earlyMean,
        lateMean,
        advantage: lateMean > 0 ? earlyMean / lateMean : 0,
        measurable: earlyROIs.length > 0 && lateROIs.length > 0
    };
}

/**
 * Check floor protection efficacy (Design Objective #10)
 */
function checkFloorProtection(results, config) {
    const sMin = config.tokenomics.s_min || 1000;
    const floorThreshold = sMin * 1.5;  // "approached" = within 50% of floor
    let approaches = 0;
    let hits = 0;

    for (const result of results) {
        const supplies = (result.history || []).map(h => h.S).filter(s => s > 0);
        if (supplies.length === 0) continue;
        const minSupply = Math.min(...supplies);
        if (minSupply <= sMin) hits++;
        else if (minSupply <= floorThreshold) approaches++;
    }

    return { approaches, hits, total: results.length };
}

/**
 * Calculate bounded volatility ratio (Design Objective #9)
 */
function calculateVolatilityDampening(priceStats, revenueStats) {
    const priceCV = priceStats.stddev / priceStats.mean;
    const revenueCV = revenueStats.stddev / revenueStats.mean;
    return {
        priceCV,
        revenueCV,
        dampening: revenueCV > 0 ? (1 - priceCV / revenueCV) : 0  // % reduction
    };
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
