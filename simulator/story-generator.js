/**
 * Story Generator Module
 *
 * Transforms dry simulation data into compelling business narratives.
 * Generates identities, annotates events, and selects the most dramatic stories.
 */

// ============================================================================
// BUSINESS IDENTITY GENERATION
// ============================================================================

const FOUNDER_NAMES = [
    'Luna', 'Marcus', 'Priya', 'Chen', 'Amara', 'Kai', 'Sofia', 'Dev',
    'Zara', 'Omar', 'Mia', 'Raj', 'Isla', 'Theo', 'Nina', 'Leo',
    'Ava', 'Sam', 'Yuki', 'Max'
];

const MICRO_BUSINESS_TEMPLATES = [
    // [Founder]'s [Adjective] [Product]
    { type: 'founder_product', adjectives: ['Lo-Fi', 'Cozy', 'Minimal', 'Neon', 'Vintage', 'Retro', 'Chill', 'Warm'],
      products: ['Beats', 'Icons', 'Templates', 'Presets', 'Loops', 'Sounds', 'Kits', 'Packs'] },
    // The [Product] [Suffix]
    { type: 'the_product', products: ['Loop Library', 'Font Foundry', 'Texture Pack', 'Preset Vault', 'Icon Set',
      'Sound Depot', 'Asset Shop', 'Design Attic', 'Beat Cellar', 'Template Trove'] },
    // [Two-word name]
    { type: 'compound', names: ['Pixel Perfect', 'Midnight Synths', 'Cozy Corners', 'Golden Hour',
      'Quiet Storm', 'Deep Focus', 'Soft Launch', 'Night Owl', 'Side Quest', 'Tiny Wins',
      'Late Night', 'Sunday Morning', 'Warm Static', 'Slow Burn', 'First Light', 'Last Call',
      'Good Vibes', 'Easy Mode', 'Chill Zone', 'Sweet Spot'] }
];

const STARTUP_TEMPLATES = [
    { type: 'single_word', names: ['Nimbus', 'Datapulse', 'Flowstate', 'Arcline', 'Vantage',
      'Beacon', 'Drift', 'Stratum', 'Vertex', 'Lumen', 'Prism', 'Cadence'] },
    { type: 'name_industry', bases: ['Verde', 'Beacon', 'Drift', 'Nova', 'Peak'],
      industries: ['Logistics', 'Analytics', 'AI', 'Labs', 'Tech'] }
];

const ENTERPRISE_TEMPLATES = [
    { type: 'formal', names: ['Meridian', 'Apex', 'Stratum', 'Pinnacle', 'Keystone', 'Citadel'],
      suffixes: ['Systems', 'Analytics', 'Group', 'Solutions', 'Technologies'] }
];

const PRODUCT_DESCRIPTIONS = {
    micro: [
        'selling ambient study music packs',
        'offering minimalist icon sets for indie devs',
        'curating retro synth presets',
        'creating lo-fi beat packs for content creators',
        'selling hand-crafted website templates',
        'offering vintage texture collections',
        'providing focus music for remote workers',
        'creating UI component libraries'
    ],
    startup: [
        'building AI-powered workflow automation',
        'developing real-time analytics for small teams',
        'creating no-code tools for non-technical founders',
        'building developer productivity tools',
        'offering API infrastructure for indie hackers',
        'developing collaborative editing tools'
    ],
    enterprise: [
        'providing enterprise resource planning solutions',
        'offering B2B analytics platforms',
        'developing compliance automation software',
        'building integration middleware for legacy systems'
    ]
};

/**
 * Generate a unique business identity for a simulation run
 */
function generateBusinessIdentity(archetype, runIndex, rng) {
    const founder = pickRandom(FOUNDER_NAMES, rng);
    let name, productDescription;

    if (archetype === 'micro') {
        const template = pickRandom(MICRO_BUSINESS_TEMPLATES, rng);
        if (template.type === 'founder_product') {
            const adj = pickRandom(template.adjectives, rng);
            const prod = pickRandom(template.products, rng);
            name = `${founder}'s ${adj} ${prod}`;
        } else if (template.type === 'the_product') {
            name = `The ${pickRandom(template.products, rng)}`;
        } else {
            name = pickRandom(template.names, rng);
        }
        productDescription = pickRandom(PRODUCT_DESCRIPTIONS.micro, rng);
    } else if (archetype === 'startup') {
        const template = pickRandom(STARTUP_TEMPLATES, rng);
        if (template.type === 'single_word') {
            name = pickRandom(template.names, rng);
        } else {
            name = `${pickRandom(template.bases, rng)} ${pickRandom(template.industries, rng)}`;
        }
        productDescription = pickRandom(PRODUCT_DESCRIPTIONS.startup, rng);
    } else {
        const template = pickRandom(ENTERPRISE_TEMPLATES, rng);
        name = `${pickRandom(template.names, rng)} ${pickRandom(template.suffixes, rng)}`;
        productDescription = pickRandom(PRODUCT_DESCRIPTIONS.enterprise, rng);
    }

    return { name, founder, productDescription, archetype, runIndex };
}

// ============================================================================
// EVENT NARRATIVES
// ============================================================================

const YOUTUBE_CHANNELS = [
    'Lofi Girl', 'Thomas Frank', 'Ali Abdaal', 'Fireship', 'Theo',
    'a popular tech reviewer', 'a trending lifestyle vlogger'
];

const PUBLICATIONS = [
    'Hacker News', 'Product Hunt', 'Indie Hackers', 'TechCrunch',
    'a popular newsletter', 'a niche industry blog'
];

const HOLIDAYS = ['Black Friday', 'holiday', 'back-to-school', 'New Year'];

const EVENT_NARRATIVES = {
    revenue_spike: [
        // Normal (80%)
        'featured on {youtube_channel}',
        'product went viral on TikTok',
        'landed on {publication} front page',
        '{holiday} season surge brought unexpected traffic',
        'competitor went offline, redirecting their customers',
        'SEO finally kicked in after months of content',
        'a single tweet from an influencer changed everything',
        // Weird spice (20%)
        'accidentally went viral for the wrong reasons (but sales are sales)',
        'a Reddit post meant as a joke somehow converted'
    ],
    revenue_crash: [
        // Normal (80%)
        'Stripe account suspended pending review',
        'server migration went sideways for a week',
        'negative review from a popular tech blogger hurt conversions',
        'key supplier delayed shipments',
        'Google algorithm update tanked organic traffic',
        'payment processor audit froze payouts',
        // Weird spice (20%)
        '{founder}\'s cat walked across the keyboard and deleted the landing page',
        'DNS propagation took down the site for 48 hours',
        'accidentally shipped the wrong product to a reviewer'
    ],
    plateau_entered: [
        '{founder} took a day job, runs it as a side project now',
        'hit natural ceiling in the niche market',
        'scaled back to sustainable pace after burnout scare',
        'decided to coast rather than chase growth'
    ],
    breakout_from_plateau: [
        'landed an unexpected enterprise client',
        'featured in {publication} after months of obscurity',
        'algorithm change boosted SEO traffic 4x',
        'a competitor\'s shutdown redirected their customers',
        'pivoted slightly and found a bigger market'
    ],
    participant_exit: [
        'cashed out to cover medical expenses',
        'used stake for house down payment',
        'lost confidence after a slow quarter',
        'moving on to a new project',
        'needed liquidity for a family emergency',
        'took profits to fund another venture'
    ],
    zero_month: [
        'website migration disaster',
        'payment processor audit froze everything',
        '{founder} on paternity leave',
        'complete product pivot in progress',
        'legal issue required temporary shutdown'
    ],
    business_failure: [
        'ran out of runway before finding product-market fit',
        'key customer churned and cascade followed',
        'founder burnout led to shutdown',
        'market window closed before they could capitalize',
        'couldn\'t compete with a well-funded competitor'
    ],
    state_transition: {
        'building_to_launched': 'officially launched after months of building',
        'launched_to_growing': 'found traction and entered growth mode',
        'launched_to_plateaued': 'stabilized at a comfortable revenue level',
        'growing_to_plateaued': 'growth leveled off at market saturation',
        'plateaued_to_growing': 'broke out of plateau with renewed momentum',
        'to_failed': 'shut down operations'
    }
};

/**
 * Pick a narrative template and fill in placeholders
 */
function pickEventNarrative(eventType, identity, rng) {
    let templates = EVENT_NARRATIVES[eventType];
    if (!templates) return null;

    // Handle state transitions specially
    if (eventType === 'state_transition') {
        return templates; // Return the whole object for lookup
    }

    const template = pickRandom(templates, rng);
    return fillNarrativePlaceholders(template, identity, rng);
}

function fillNarrativePlaceholders(template, identity, rng) {
    return template
        .replace('{founder}', identity.founder)
        .replace('{youtube_channel}', pickRandom(YOUTUBE_CHANNELS, rng))
        .replace('{publication}', pickRandom(PUBLICATIONS, rng))
        .replace('{holiday}', pickRandom(HOLIDAYS, rng));
}

// ============================================================================
// EVENT DETECTION
// ============================================================================

/**
 * Detect major events from a simulation run's history
 * Returns annotated events suitable for narrative generation
 */
function detectMajorEvents(runResult, identity, rng) {
    const history = runResult.history || [];
    const events = [];

    // Calculate baseline revenue (rolling average)
    let baselineRevenue = 0;
    let prevState = null;

    for (let i = 0; i < history.length; i++) {
        const month = history[i];
        const revenue = month.revenue || 0;

        // Update baseline (3-month rolling average)
        if (i >= 3) {
            baselineRevenue = (history[i - 1].revenue + history[i - 2].revenue + history[i - 3].revenue) / 3;
        } else if (i > 0) {
            baselineRevenue = history.slice(0, i).reduce((s, h) => s + h.revenue, 0) / i;
        }

        // Detect revenue spikes (>2.5x baseline)
        if (baselineRevenue > 0 && revenue > baselineRevenue * 2.5) {
            events.push({
                month: month.month,
                type: 'revenue_spike',
                magnitude: revenue / baselineRevenue,
                revenue,
                narrative: pickEventNarrative('revenue_spike', identity, rng)
            });
        }

        // Detect revenue crashes (<0.3x baseline when baseline is meaningful)
        if (baselineRevenue > 100 && revenue < baselineRevenue * 0.3) {
            events.push({
                month: month.month,
                type: 'revenue_crash',
                magnitude: baselineRevenue / Math.max(revenue, 1),
                revenue,
                narrative: pickEventNarrative('revenue_crash', identity, rng)
            });
        }

        // Detect zero-revenue months
        if (revenue === 0 && baselineRevenue > 50) {
            events.push({
                month: month.month,
                type: 'zero_month',
                narrative: pickEventNarrative('zero_month', identity, rng)
            });
        }

        // Detect state transitions
        const currentState = month.businessState;
        if (prevState && currentState !== prevState) {
            const transitionKey = `${prevState}_to_${currentState}`;
            const transitions = EVENT_NARRATIVES.state_transition;
            let narrative = transitions[transitionKey] || transitions[`to_${currentState}`];
            if (narrative) {
                narrative = fillNarrativePlaceholders(narrative, identity, rng);
            }
            events.push({
                month: month.month,
                type: 'state_transition',
                from: prevState,
                to: currentState,
                narrative
            });
        }
        prevState = currentState;

        // Detect participant exits from events array
        for (const evt of (month.events || [])) {
            if (evt.type === 'exit_complete' || evt.type === 'exit_request') {
                events.push({
                    month: month.month,
                    type: 'participant_exit',
                    participantName: evt.name || evt.participantId,
                    tokens: evt.tokens,
                    value: evt.exitValue,
                    narrative: pickEventNarrative('participant_exit', identity, rng)
                });
            }
        }
    }

    // Detect business failure
    const finalState = runResult.finalState?.businessState || history[history.length - 1]?.businessState;
    if (finalState === 'failed') {
        events.push({
            month: history.length,
            type: 'business_failure',
            narrative: pickEventNarrative('business_failure', identity, rng)
        });
    }

    return events;
}

// ============================================================================
// INTERESTINGNESS SCORING
// ============================================================================

/**
 * Score how interesting/dramatic a simulation run is
 * Higher scores = better stories
 */
function scoreInterestingness(runResult, events) {
    let score = 0;

    // State transitions are interesting (+3 each)
    const transitions = events.filter(e => e.type === 'state_transition');
    score += transitions.length * 3;

    // Revenue spikes and crashes (+2 each, +1 extra for high magnitude)
    const volatileEvents = events.filter(e =>
        e.type === 'revenue_spike' || e.type === 'revenue_crash'
    );
    for (const e of volatileEvents) {
        score += 2;
        if (e.magnitude > 4) score += 1; // Extra dramatic
    }

    // Dramatic reversals: near-death to success (+10)
    const history = runResult.history || [];
    const minSupply = Math.min(...history.map(h => h.S).filter(s => s > 0));
    const survived = runResult.summary?.survived;
    if (minSupply < 2000 && survived) {
        score += 10; // Comeback story!
    }

    // Near success then failure is also dramatic (+8)
    const maxRevenue = Math.max(...history.map(h => h.revenue || 0));
    if (maxRevenue > 10000 && !survived) {
        score += 8; // "They were so close..."
    }

    // Participant exits add drama (+2 each, +3 for bad timing)
    const exits = events.filter(e => e.type === 'participant_exit');
    for (const e of exits) {
        score += 2;
        // Bad timing: exited early in a run that ended well
        if (e.month < 18 && survived) {
            score += 3; // "If only they'd held..."
        }
    }

    // Business failure is inherently dramatic (+3)
    if (events.some(e => e.type === 'business_failure')) {
        score += 3;
    }

    // Zero-revenue months add tension (+1 each)
    const zeroMonths = events.filter(e => e.type === 'zero_month');
    score += zeroMonths.length;

    return score;
}

// ============================================================================
// NARRATIVE GENERATION
// ============================================================================

/**
 * Convert month number to a readable date string
 * Assumes simulation starts in January of the current year
 */
function monthToDate(monthNum, startYear = 2024) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const totalMonths = (startYear - 2024) * 12 + (monthNum - 1);
    const year = 2024 + Math.floor(totalMonths / 12);
    const monthIndex = totalMonths % 12;
    return `${months[monthIndex]} ${year}`;
}

/**
 * Generate a full narrative for a simulation run
 * Written to sound like a story a friend would tell you at a bar
 */
function generateFullNarrative(runResult, identity, events) {
    const history = runResult.history || [];
    const survived = runResult.summary?.survived;
    const finalRevenue = history[history.length - 1]?.revenue || 0;
    const totalRevenue = runResult.summary?.totalRevenue || 0;
    const startRevenue = history[0]?.revenue || 0;

    // Sort events by month
    events.sort((a, b) => a.month - b.month);

    // Categorize events for storytelling
    const spikes = events.filter(e => e.type === 'revenue_spike');
    const crashes = events.filter(e => e.type === 'revenue_crash');
    const transitions = events.filter(e => e.type === 'state_transition');
    const exits = events.filter(e => e.type === 'participant_exit');

    // Find the biggest spike and worst crash for dramatic effect
    const biggestSpike = spikes.length > 0 ? spikes.reduce((a, b) => (a.magnitude > b.magnitude) ? a : b) : null;
    const worstCrash = crashes.length > 0 ? crashes[0] : null;

    // Calculate some stats for the narrative
    const peakRevenue = Math.max(...history.map(h => h.revenue || 0));
    const revenueMultiple = startRevenue > 0 ? (peakRevenue / startRevenue).toFixed(0) : 'huge';

    // Build a conversational narrative
    let story = '';

    // Opening - set the scene
    story += `So ${identity.founder} started **${identity.name}** back in ${monthToDate(1)}, ${identity.productDescription}. `;
    if (startRevenue > 500) {
        story += `They kicked off at around $${Math.round(startRevenue).toLocaleString()} a month—not bad for a side project. `;
    } else if (startRevenue > 0) {
        story += `Started small, just a few hundred bucks a month, but ${identity.founder} saw the potential. `;
    } else {
        story += `No revenue yet, just building and hoping something would click. `;
    }

    // Early drama
    if (crashes.length > 0 && crashes[0].month <= 6) {
        story += `\n\nThings got rough early though. ${crashes[0].narrative.charAt(0).toUpperCase() + crashes[0].narrative.slice(1)}. `;
        story += `Revenue tanked, and honestly? Most people would've given up right there. `;
    } else if (spikes.length > 0 && spikes[0].month <= 6) {
        story += `\n\nThen something wild happened in ${monthToDate(spikes[0].month)}—${spikes[0].narrative}. `;
        story += `Revenue shot up ${spikes[0].magnitude.toFixed(1)}x basically overnight. `;
    } else {
        story += `\n\nThe first few months were pretty quiet—just grinding, building up a small customer base. `;
    }

    // The big moment (biggest spike or worst crash)
    if (biggestSpike && biggestSpike.magnitude > 3) {
        story += `\n\nBut here's the crazy part: in ${monthToDate(biggestSpike.month)}, ${biggestSpike.narrative}. `;
        story += `We're talking a ${biggestSpike.magnitude.toFixed(1)}x spike. `;
        if (biggestSpike.magnitude > 10) {
            story += `${identity.founder} literally thought the dashboard was broken at first. `;
        } else {
            story += `The kind of month that makes you think maybe this thing could actually work. `;
        }
    }

    // Setbacks and struggle
    if (worstCrash && worstCrash.month > 6) {
        story += `\n\nOf course, it wasn't all up and to the right. ${worstCrash.narrative.charAt(0).toUpperCase() + worstCrash.narrative.slice(1)} `;
        story += `and revenue cratered. `;
        if (survived) {
            story += `But ${identity.founder} hung in there. `;
        }
    }

    // Participant drama
    if (exits.length > 0) {
        const earlyExit = exits.find(e => e.month < 18);
        const lateExit = exits.find(e => e.month >= 18);

        if (earlyExit && survived) {
            const roi = runResult.participantOutcomes?.find(p =>
                p.name === earlyExit.participantName || p.id === earlyExit.participantName
            )?.roi;
            if (roi && roi < 10) {
                story += `\n\n${earlyExit.participantName} bailed early—${earlyExit.narrative}—`;
                story += `walked away at ${roi.toFixed(1)}x. Not bad, but if they'd stuck around... well, you'll see. `;
            }
        }
    }

    // Resolution
    story += `\n\n`;
    if (survived) {
        if (totalRevenue > 500000) {
            story += `Fast forward to today, and ${identity.name} has done over $${Math.round(totalRevenue).toLocaleString()} in total revenue. `;
            if (finalRevenue > 1000) {
                story += `Still pulling in about $${Math.round(finalRevenue).toLocaleString()} a month. `;
            }
            story += `${identity.founder}'s still running it, and the early believers who held on? They're doing just fine.`;
        } else if (totalRevenue > 100000) {
            story += `These days ${identity.name} has generated about $${Math.round(totalRevenue).toLocaleString()} total. `;
            story += `Nothing crazy, but ${identity.founder}'s got a real business now.`;
        } else {
            story += `${identity.name} is still going—about $${Math.round(totalRevenue).toLocaleString()} in total revenue so far. `;
            story += `It's not going to make anyone rich, but ${identity.founder}'s built something real.`;
        }
    } else {
        story += `Anyway, it didn't work out. ${identity.name} shut down after ${history.length} months. `;
        if (peakRevenue > 5000) {
            story += `The frustrating part? They hit $${Math.round(peakRevenue).toLocaleString()}/month at one point. `;
            story += `Sometimes that's how it goes.`;
        } else {
            story += `Never really found the traction they needed. `;
            story += `${identity.founder}'s already working on something new though.`;
        }
    }

    // Build timeline - limit to most important events
    const timeline = [];
    timeline.push({ month: 1, text: `LAUNCHED at $${Math.round(history[0]?.revenue || 0).toLocaleString()} MRR` });

    // Score and sort events for timeline (prioritize spikes, crashes, state changes)
    const timelineEvents = events
        .filter(e => e.narrative && e.month > 1)
        .map(e => ({
            ...e,
            importance: (e.type === 'revenue_spike' ? 3 + (e.magnitude || 0) :
                        e.type === 'revenue_crash' ? 3 :
                        e.type === 'state_transition' ? 4 :
                        e.type === 'participant_exit' ? 2 :
                        e.type === 'business_failure' ? 5 : 1)
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 8);  // Limit to top 8 events

    // Re-sort by month for chronological timeline
    timelineEvents.sort((a, b) => a.month - b.month);

    for (const event of timelineEvents) {
        let text = event.narrative.charAt(0).toUpperCase() + event.narrative.slice(1);
        if (event.type === 'revenue_spike') {
            text += ` (${event.magnitude.toFixed(1)}x spike)`;
        } else if (event.type === 'revenue_crash') {
            text += ` (revenue crashed)`;
        }
        timeline.push({ month: event.month, text });
    }

    // Final state
    if (survived) {
        timeline.push({
            month: history.length,
            text: `Stabilized at $${Math.round(finalRevenue).toLocaleString()}/month`
        });
    } else {
        timeline.push({ month: history.length, text: 'Business shut down' });
    }

    return { story, timeline };
}

/**
 * Generate a brief one-line summary for accordion display
 */
function generateBriefSummary(runResult, identity, events, score) {
    const survived = runResult.summary?.survived;
    const totalRevenue = runResult.summary?.totalRevenue || 0;

    // Find the most dramatic event
    const dramaticEvent = events.find(e =>
        e.type === 'revenue_spike' || e.type === 'revenue_crash' ||
        e.type === 'breakout_from_plateau' || e.type === 'business_failure'
    );

    let brief = identity.productDescription;
    if (dramaticEvent && dramaticEvent.narrative) {
        brief = dramaticEvent.narrative;
    }

    const outcome = survived ? `survived, $${Math.round(totalRevenue).toLocaleString()} total` : 'failed';

    return `${brief} (${outcome})`;
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

/**
 * Generate sample narratives section for the report
 */
function generateSampleNarrativesSection(batchResult, config) {
    const results = batchResult.results || [];
    if (results.length === 0) {
        return '### Sample Narrative\n\nNo simulation runs available.';
    }

    const baseSeed = batchResult.baseSeed || 42;

    // Generate identity and events for each run
    // Each run gets its own RNG seeded with baseSeed + runIndex for unique names
    const annotatedRuns = results.map((run, i) => {
        const runRng = createSimpleRNG(baseSeed + i * 1000);
        const identity = generateBusinessIdentity(config.business.archetype, i, runRng);
        const events = detectMajorEvents(run, identity, runRng);
        const score = scoreInterestingness(run, events);
        return { run, identity, events, score };
    });

    // Sort by interestingness
    annotatedRuns.sort((a, b) => b.score - a.score);

    // Pick the most interesting for featured story
    const featured = annotatedRuns[0];
    const { story, timeline } = generateFullNarrative(featured.run, featured.identity, featured.events);

    // Build output
    let output = `### Sample Narrative\n\n`;
    output += story + '\n\n';

    output += `**Timeline:**\n`;
    for (const t of timeline) {
        output += `- ${monthToDate(t.month)}: ${t.text}\n`;
    }
    output += '\n';

    // All runs accordion
    output += `**All Simulated Businesses:**\n`;
    for (const r of annotatedRuns) {
        const brief = generateBriefSummary(r.run, r.identity, r.events, r.score);
        output += `- **${r.identity.name}**: ${brief}\n`;
    }

    return output;
}

/**
 * Simple seeded RNG for consistent story generation
 */
function createSimpleRNG(seed) {
    let state = seed;
    return {
        random: function() {
            state = (state * 1103515245 + 12345) & 0x7fffffff;
            return state / 0x7fffffff;
        }
    };
}

function pickRandom(array, rng) {
    const index = Math.floor(rng.random() * array.length);
    return array[index];
}

module.exports = {
    generateBusinessIdentity,
    detectMajorEvents,
    scoreInterestingness,
    generateFullNarrative,
    generateBriefSummary,
    generateSampleNarrativesSection,
    monthToDate
};
