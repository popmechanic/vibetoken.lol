/**
 * Dynamic Participant Entry System
 *
 * Allows new participants to join mid-simulation based on triggers:
 * - word_of_mouth: Join when business crosses revenue threshold
 * - price_signal: Join when token price rises above threshold
 * - scheduled: Join at specific month
 * - referral_chain: Spawned by existing participant's success
 */

const { createBehavior } = require('./behaviors.js');

/**
 * Entry condition types
 */
const EntryType = {
    WORD_OF_MOUTH: 'word_of_mouth',
    PRICE_SIGNAL: 'price_signal',
    SCHEDULED: 'scheduled',
    REFERRAL_CHAIN: 'referral_chain'
};

/**
 * Evaluate if a word-of-mouth entry should occur
 *
 * Params:
 * - revenue_threshold: MRR that triggers potential entry
 * - probability_per_month: Chance of entry once threshold met (0-1)
 */
function evaluateWordOfMouth(state, params, rng) {
    const { revenue_threshold = 5000, probability_per_month = 0.15 } = params;

    // Check if revenue threshold is met
    if (state.revenue < revenue_threshold) {
        return { shouldEnter: false, reason: 'Below revenue threshold' };
    }

    // Probability check
    if (rng.random() >= probability_per_month) {
        return { shouldEnter: false, reason: 'Random check failed' };
    }

    return {
        shouldEnter: true,
        reason: `Word of mouth: revenue $${state.revenue.toFixed(0)} > $${revenue_threshold}`
    };
}

/**
 * Evaluate if a price-signal entry should occur
 *
 * Params:
 * - price_threshold: Token price that triggers entry consideration
 * - probability: Chance of entry once threshold met (0-1)
 */
function evaluatePriceSignal(state, params, rng) {
    const { price_threshold = 1.50, probability = 0.20 } = params;

    if (state.P < price_threshold) {
        return { shouldEnter: false, reason: 'Below price threshold' };
    }

    if (rng.random() >= probability) {
        return { shouldEnter: false, reason: 'Random check failed' };
    }

    return {
        shouldEnter: true,
        reason: `Price signal: $${state.P.toFixed(2)} > $${price_threshold.toFixed(2)}`
    };
}

/**
 * Evaluate if a scheduled entry should occur
 *
 * Params:
 * - entry_month: Specific month to enter
 */
function evaluateScheduled(state, params) {
    const { entry_month } = params;

    if (state.month !== entry_month) {
        return { shouldEnter: false, reason: 'Not scheduled month' };
    }

    return {
        shouldEnter: true,
        reason: `Scheduled entry at month ${entry_month}`
    };
}

/**
 * Evaluate if a referral-chain entry should occur
 * Triggered when an existing participant earns significant tokens
 *
 * Params:
 * - trigger_participant_id: ID of participant whose success triggers entry
 * - tokens_earned_threshold: Tokens earned in a month to trigger
 * - probability: Chance of spawning on trigger
 */
function evaluateReferralChain(state, params, rng, participants) {
    const {
        trigger_participant_id,
        tokens_earned_threshold = 100,
        probability = 0.30
    } = params;

    // Find the trigger participant
    const trigger = participants.find(p => p.id === trigger_participant_id);
    if (!trigger) {
        return { shouldEnter: false, reason: 'Trigger participant not found' };
    }

    // Check if they earned enough tokens this month
    const monthlyEarnings = trigger.monthlyTokensEarned || 0;
    if (monthlyEarnings < tokens_earned_threshold) {
        return { shouldEnter: false, reason: 'Trigger not met (low earnings)' };
    }

    if (rng.random() >= probability) {
        return { shouldEnter: false, reason: 'Random check failed' };
    }

    return {
        shouldEnter: true,
        reason: `Referral chain: ${trigger.name} earned ${monthlyEarnings} tokens`
    };
}

/**
 * Evaluate any entry condition
 */
function evaluateEntry(entryCondition, state, rng, participants = []) {
    const { type, params } = entryCondition;

    switch (type) {
        case EntryType.WORD_OF_MOUTH:
            return evaluateWordOfMouth(state, params, rng);
        case EntryType.PRICE_SIGNAL:
            return evaluatePriceSignal(state, params, rng);
        case EntryType.SCHEDULED:
            return evaluateScheduled(state, params);
        case EntryType.REFERRAL_CHAIN:
            return evaluateReferralChain(state, params, rng, participants);
        default:
            return { shouldEnter: false, reason: `Unknown entry type: ${type}` };
    }
}

/**
 * Late Entrant Pool Manager
 *
 * Tracks potential late entrants and spawns them when conditions are met.
 * Manages treasury depletion for grants.
 */
class EntryPool {
    constructor(poolConfig, rng) {
        this.templates = poolConfig.templates || [];
        this.remainingTreasury = poolConfig.treasury || 100000;
        this.spawnedCount = 0;
        this.rng = rng;
        this.spawnedIds = new Set();
    }

    /**
     * Evaluate all potential entries for this tick
     * Returns array of new participants to add
     */
    evaluateTick(state, activeParticipants) {
        const newParticipants = [];

        for (const template of this.templates) {
            // Skip if already spawned all from this template
            if (template.maxSpawns && this.getSpawnedFromTemplate(template.id) >= template.maxSpawns) {
                continue;
            }

            // Skip if already spawned this specific entry (for scheduled)
            const entryId = `${template.id}-${state.month}`;
            if (this.spawnedIds.has(entryId)) {
                continue;
            }

            // Evaluate entry condition
            const result = evaluateEntry(
                template.entry_conditions,
                state,
                this.rng,
                activeParticipants
            );

            if (result.shouldEnter) {
                // Check if we have enough treasury
                const grant = template.grant || 1000;
                if (grant > this.remainingTreasury) {
                    continue; // Skip - not enough treasury
                }

                // Spawn the new participant
                const participant = this.spawnParticipant(template, state.month, result.reason);
                if (participant) {
                    newParticipants.push(participant);
                    this.spawnedIds.add(entryId);
                }
            }
        }

        return newParticipants;
    }

    /**
     * Spawn a new participant from a template
     */
    spawnParticipant(template, month, entryReason) {
        const grant = template.grant || 1000;

        // Deduct from treasury
        if (grant > this.remainingTreasury) {
            return null;
        }
        this.remainingTreasury -= grant;

        this.spawnedCount++;
        const id = `${template.id || 'late'}-${this.spawnedCount}`;

        // Create the behavior function
        const behavior = createBehavior(
            template.behavior || 'trend_follower',
            template.params || {},
            this.rng
        );

        return {
            id,
            name: template.name ? `${template.name} #${this.spawnedCount}` : `Late Entrant #${this.spawnedCount}`,
            tokens: grant,
            grant,
            referralShare: template.referral_share || 0.08,
            startMonth: month,
            behavior,
            behaviorType: template.behavior || 'trend_follower',
            behaviorParams: template.params || {},
            distributions: 0,
            exitValue: 0,
            hasExited: false,
            exitMonth: null,
            monthlyTokensEarned: 0,
            isLateEntrant: true,
            entryReason,
            templateId: template.id
        };
    }

    /**
     * Get count of participants spawned from a specific template
     */
    getSpawnedFromTemplate(templateId) {
        let count = 0;
        for (const id of this.spawnedIds) {
            if (id.startsWith(templateId)) {
                count++;
            }
        }
        return count;
    }

    /**
     * Get remaining treasury
     */
    getRemainingTreasury() {
        return this.remainingTreasury;
    }

    /**
     * Get total spawned count
     */
    getSpawnedCount() {
        return this.spawnedCount;
    }
}

/**
 * Create an entry pool from configuration
 */
function createEntryPool(config, rng) {
    return new EntryPool(config, rng);
}

module.exports = {
    EntryType,
    evaluateWordOfMouth,
    evaluatePriceSignal,
    evaluateScheduled,
    evaluateReferralChain,
    evaluateEntry,
    EntryPool,
    createEntryPool
};
