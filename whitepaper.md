# Vibe Token

## A Revenue-Indexed Contribution System for Small Software

---

Token systems introduced sound economic primitives: programmable ownership, automated distribution, permissionless participation. What failed was not the mechanism but its deployment. Speculation displaced contribution. Financial games crowded out builders, referrers, and early believers who told their friends. Infrastructure meant to reward creation rewarded positioning instead.

This paper describes a different application. Vibe Token is designed for small, high-margin software businesses—the kind now trivially cheap to create but still difficult to distribute. It gives early contributors a direct stake in future revenue without speculation, venture financing, or secondary markets. The goal is not a movement. The goal is infrastructure: a way to reward the people who help software find its audience.

---

## The Problem

Software creation costs have collapsed. A competent developer with access to language models can ship a working product in hours. But distribution remains expensive—not in money, but in attention and trust. The people who spread software early—referrers, evangelists, early adopters who file bug reports—create real value. They rarely capture it.

Traditional equity solves this for venture-scale companies. Vibe Token solves it for everything else: the micro-SaaS, the tool for a niche community, the app that serves six friends for one summer and then fades. Human-scale software deserves human-scale economics.

---

## The Invariant

Each participating application opts into a single rule:

**20% of net revenue is continuously allocated to contributors.**

This percentage is fixed, non-configurable, and applies equally to all applications. There are no tiers, no negotiation, no exceptions.

---

## Bonding Curve Design

Vibe Token uses a revenue-indexed bonding curve to price entry and exit. Unlike speculative curves priced by demand alone, this curve anchors to realized business performance.

Revenue generates tokens. Exits burn them. Price is deterministic—no order books, liquidity pools, or market-makers required.

**Variables:**

- **R** — cumulative net revenue (lifetime)
- **dR** — new net revenue in a period
- **alpha** — revenue share (fixed at 0.20)
- **S** — total token supply outstanding
- **P** — token price
- **k** — global pricing constant

---

## Token Pricing

```
P = k * sqrt(R)
```

Price rises with cumulative revenue, but at a diminishing rate. The square root gives early revenue more weight than late. Growth never locks out participation; entering a proven business simply costs more than entering an unproven one.

---

## Token Issuance

```
tokens_minted = (alpha * dR) / P
```

Revenue mints tokens; the system distributes them to contributors. No tokens exist before revenue exists. No pre-sales, no bonus schedules, no multipliers. Contribution earns tokens—referrals, purchases, verified participation. The curve handles everything else.

---

## Token Exit

When a holder exits:

- Their tokens are burned
- Their future revenue share ends
- Total supply decreases

Remaining holders receive a larger share of future distributions. The curve re-prices automatically. Exits consolidate ownership rather than destabilize it. No secondary markets exist. The curve itself defines entry and exit.

---

## Revenue Distribution

Each period, a revenue pool is created:

```
D = alpha * dR
payout_per_token = D / S
```

Revenue accrues to holders proportionally. Payouts accumulate as balances, not instant transfers. Withdrawals occur when balances exceed practical minimums. Settlement uses traditional or stablecoin rails. The system promises no dividends, no guarantees, no fixed yields.

---

## System Properties

- **Revenue-indexed bonding curve** — price tracks business performance, not speculation
- **Continuous mint/burn** — supply adjusts with each revenue event and exit
- **Deflationary on exit** — departures strengthen remaining positions
- **Early-weighted without lock-in** — early contributors receive more tokens, but anyone can exit
- **Scale-agnostic** — works for a $500/month tool or a $500,000/year product
- **Operationally conservative** — accrual and batching reduce transaction overhead
- **Non-speculative by design** — no secondary markets, no price discovery games

---

## Closing

Local-first software architecture makes this possible. When applications run on user devices, with data synced rather than centralized, operational costs collapse. A single developer can serve thousands of users. Communities can have their own isolated worlds—their own databases, their own failure domains, their own economies.

Vibe Token is infrastructure for this future. Not a movement, not a platform, not a promise. A mechanism: connect contribution to revenue, let the math handle distribution, see what people build when early support finally means something.
