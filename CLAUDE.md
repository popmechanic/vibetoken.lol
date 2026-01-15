# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **writing project**, not a codebase. The repository contains planning materials for:

1. **Vibe Token** - An economic system using a revenue-indexed bonding curve for small software businesses
2. **Vibe Coding Essays** - A 12-part essay series about AI-assisted application development ("vibe coding")

## Key Documents

- `whitepaper.md` - **Authoritative source** for Vibe Token economics (bonding curve formula, token mechanics). The website (`index.html`) should be updated FROM this file, not vice versa. When updating HTML, translate plaintext to symbols: `alpha` → `α`, `sqrt()` → `√`, `*` → `×`, `/` → `÷`.
- `Vibe coding content outlines.md` - Four-act structure with 12 essay outlines on vibe coding philosophy
- `sample_Vibe_Token_Model.xlsx` - Economic model spreadsheet

## Writing Guidelines

### Vibe Token White Paper
- Use Bitcoin white paper tone: pragmatic, neutral, minimal
- ASCII math only (use `*`, `sqrt()`, not LaTeX)
- Fixed variables: R, dR, alpha (0.20), S, P, k
- Core formula: `P = k * sqrt(R)`
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

**Available presets:** `startup-mixed`, `micro-rational`, `enterprise-sophisticated`, `stress-test`

**Output:** Each run generates a timestamped folder in `simulator/output/` with:
- `index.html` - Visual report with charts
- `narrative.md` - Natural language analysis
- `summary.json` - Aggregate statistics

**Index page:** The simulation index is at `simulator/index.html`. After running simulations, update this file to add links to new output folders. Links should use the `output/` prefix (e.g., `output/2026-01-15T03-50-32/index.html`).
