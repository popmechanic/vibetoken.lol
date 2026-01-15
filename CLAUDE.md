# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **writing project**, not a codebase. The repository contains planning materials for:

1. **Vibe Token** - An economic system using a revenue-indexed bonding curve for small software businesses
2. **Vibe Coding Essays** - A 12-part essay series about AI-assisted application development ("vibe coding")

## Vibe Token Design Objectives

These are the economic design goals that the token system aims to achieve. Use these to evaluate proposed changes and simulator configurations.

### Core Economics
1. **Reward early contributors** - sqrt pricing means early tokens are cheaper; early support is worth more
2. **Earned via labor, not purchased** - tokens come from work (referrals, marketing), not capital investment
3. **Speculation channeled through work** - people bet on success by hustling for it, not by buying in
4. **Scale-agnostic** - works for $500/month micro businesses, not just venture-scale companies

### Mechanism Properties
5. **Liquidity without secondary markets** - exit queue provides optionality without exchanges or AMMs
6. **Exits strengthen the system** - when people leave, remaining holders own a larger share
7. **Locked founder commitment** - α (revenue share) is permanent; no bait-and-switch
8. **Self-liquidating** - no reserve pool needed; exit queue funded by ongoing revenue
9. **Bounded volatility** - sqrt function dampens extreme swings while allowing price discovery
10. **Floor protection** - S_min prevents the system from reaching P=$0

### Design Philosophy
11. **Minimal rules** - six rules total; complexity is the enemy
12. **Fun to participate** - prediction and reward engage dopamine; trading should feel like play

### What This Means for the Simulator
- `labor_intensity` is behavioral flavor, not economic input (simplicity > accuracy)
- `referral_share` represents the deal, not variable effort
- Fun proxy metrics (decision density, outcome variance) complement ROI metrics

## Key Documents

- `whitepaper.md` - **Authoritative source** for Vibe Token economics (bonding curve formula, token mechanics). The website (`index.html`) should be updated FROM this file, not vice versa. When updating HTML, translate plaintext to symbols: `alpha` → `α`, `sqrt()` → `√`, `*` → `×`, `/` → `÷`.
- `Vibe coding content outlines.md` - Four-act structure with 12 essay outlines on vibe coding philosophy
- `sample_Vibe_Token_Model.xlsx` - Economic model spreadsheet

## Writing Guidelines

### Vibe Token White Paper
- Use Bitcoin white paper tone: pragmatic, neutral, minimal
- ASCII math only (use `*`, `sqrt()`, `max()`, not LaTeX)
- Fixed variables: R, dR, alpha (0.20), S, P, k
- Core formulas:
  - Price: `P = k * sqrt(S)`
  - k floor: `k = max(MRR / 1,000,000, 0.005)`
- Partial exits supported (holders can exit any number of tokens, not just full stake)
- One page maximum, no appendices or FAQs

### Vibe Coding Essays
- Four acts: The Vibe Zone → Seeing What the Model Sees → Architecture After Its Constraints → Worlds, Not Rows
- Central concepts: one-shot radius, complexity budget, local-first architecture, capability-based security
- Reference stack: Vibes DIY + Fireproof (local-first database with sync)
- Tone: technical but accessible, avoid evangelism

## Simulator

The `simulator/` directory contains a Monte Carlo stress-testing harness for Vibe Token economics.

**Running simulations:**
```bash
node simulator/run.js --preset startup-mixed --runs 100
```

**Available presets:** `startup-mixed`, `micro-rational`, `micro-diamond`, `growth-to-1k`, `high-alpha`, `enterprise-sophisticated`, `stress-test`

**Output:** Each run generates a timestamped folder in `simulator/output/` with:
- `index.html` - Visual report with charts
- `narrative.md` - Natural language analysis
- `summary.json` - Aggregate statistics

**Index page:** The simulation index at `simulator/index.html` is automatically updated after each run. Links use the `output/` prefix (e.g., `output/2026-01-15T03-50-32/index.html`).

**Key findings from simulations:**
- Diamond hands outperform rational actors 10-15x in micro businesses (no exits = supply grows)
- k floor of 0.005 ensures viable token economics for businesses under $5K MRR
- Partial exits allow holders to take liquidity while maintaining exposure
