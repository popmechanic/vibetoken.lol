# Vibe Token

## A Revenue-Indexed Contribution System for Small Software

---

Token systems introduced sound economic primitives: programmable ownership, automated distribution, permissionless participation. What failed was not the mechanism but its deployment. Speculation displaced contribution. Financial games crowded out builders, referrers, and early believers who told their friends.

This paper describes a different application. Vibe Token is designed for small, high-margin software businesses—the kind now trivially cheap to create but still difficult to distribute. It gives early contributors a direct stake in future revenue without speculation, venture financing, or secondary markets.

---

## The Six Rules

The entire system operates on six rules. Everything else follows from these.

**1. Price**
```
P = k * sqrt(R)
```
Token price equals a constant times the square root of cumulative revenue.

**2. Pre-mint**
```
Founder receives a fixed token allocation at launch.
```
These tokens can be freely distributed to bootstrap early participation.

**3. Earning**
```
tokens = floor(alpha * dR / P)
```
Referrers earn whole tokens based on the revenue they generate.

**4. Distribution**
```
payout = (alpha * dR) / S
```
The founder's specified share of each revenue event is distributed to all token holders.

**5. Exit**
```
exit_value = tokens * P
```
Holders can exit by burning tokens. Exit value is calculated at current price.

**6. Queue**
```
Exits are paid first from distributions, then remainder flows to holders.
```
Exit payments have priority. When the queue clears, full distributions resume.

---

## The Problem

Software creation costs have collapsed. A competent developer with access to language models can ship a working product in hours. But distribution remains expensive—not in money, but in attention and trust. The people who spread software early—referrers, evangelists, early adopters who file bug reports—create real value. They rarely capture it.

Traditional equity solves this for venture-scale companies. Vibe Token solves it for everything else: the micro-SaaS, the tool for a niche community, the app that serves six friends for one summer and then fades. Human-scale software deserves human-scale economics.

---

## The Commitment

**The founder specifies α (revenue share) at launch. Once set, it cannot be changed.**

This is the deal between founder and contributors. The founder chooses what percentage of gross revenue flows to token holders—typically 10-30%. Contributors can see this number before participating. After launch, it's locked. No renegotiation, no gradual reduction, no bait-and-switch.

---

## Variables

- **R** — cumulative net revenue (lifetime total, only increases)
- **dR** — new revenue from a single event
- **alpha** — revenue share (founder-specified, locked at launch)
- **S** — total token supply outstanding
- **P** — current token price
- **k** — pricing constant (typically 0.01)

---

## Rule 1: Token Pricing

```
P = k * sqrt(R)
```

Token price is determined by cumulative revenue. The square root function means early revenue raises the price more than later revenue.

**Example with k = 0.01:**

| Cumulative Revenue | Price |
|--------------------|-------|
| $100 | $0.10 |
| $1,000 | $0.32 |
| $10,000 | $1.00 |
| $100,000 | $3.16 |
| $1,000,000 | $10.00 |

Price never decreases because cumulative revenue never decreases. A business that has earned $100,000 lifetime has proven something permanent, regardless of current month's performance.

**Why square root?** It rewards early contributors without locking out latecomers. The first $10,000 of revenue raises the price from $0 to $1. The next $10,000 only raises it from $1 to $1.41. Early risk earns early reward, but growth remains accessible.

---

## Rule 2: Pre-mint Allocation

```
Founder receives a fixed token allocation at launch.
```

Before any revenue exists, founders need tokens to distribute to early believers—the influencer who tweets about your launch, the friend who refers ten customers, the beta tester who finds critical bugs.

**Pre-mint solves the cold-start problem.** No revenue means no tokens minted. But you need contributors to generate revenue. Pre-mint breaks this cycle.

**Recommended quantity:** Set pre-mint equal to 100 times your expected first-year revenue. For a business expecting $10,000 in year one, pre-mint 100,000 tokens.

**What happens to pre-mint over time?** Natural dilution. As revenue-backed tokens are minted for referrers, pre-mint holders' share decreases. After year one of a successful business, pre-mint might represent 50-70% of supply. After year three, perhaps 20-30%. This is correct—ongoing contributors earn ongoing share.

---

## Rule 3: Token Earning

```
tokens = floor(alpha * dR / P)
```

Tokens are earned, not purchased. When someone refers a customer who generates revenue, the referrer earns tokens.

**How it works:**
1. Referrer brings in a customer
2. Customer pays $X for the product
3. Referrer earns tokens = floor(α * $X / P)
4. Tokens are whole integers; remainders are discarded

**Example:** Referrer brings in a $50 sale. α = 0.20, P = $1.00.
- Referrer value = 0.20 * $50 = $10
- Tokens earned = floor($10 / $1.00) = 10 tokens

**Why floor (round down)?** Tokens must be whole integers. If a small referral would mint 0.3 tokens, the referrer receives 0. This is acceptable—design your pricing constant k so typical transactions mint at least one token.

**Why no direct token purchases?** Purchasing tokens with money creates securities law complexity. Earning tokens through contribution—marketing, referrals, sales—is compensating labor, not selling investment contracts.

---

## Rule 4: Revenue Distribution

```
D = alpha * dR
payout_per_token = D / S
```

Each time revenue is generated, the founder's specified share (α) is added to a distribution pool. This pool is divided among all token holders proportionally.

**Example:** Business receives $1,000 in revenue. α = 0.20, S = 50,000 tokens.
- Distribution pool D = $200
- Payout per token = $200 / 50,000 = $0.004

A holder with 1,000 tokens receives $4.00.

**When are distributions paid?** Implementation varies. Could be per-transaction, daily, weekly, or monthly batches. The math is the same; only the frequency differs.

**What about the exit queue?** If there are pending exits, the distribution pool pays those first. See Rule 6.

---

## Rule 5: Token Exit

```
exit_value = tokens * P
```

Holders can exit at any time by burning their tokens. Exit value is calculated at the current price.

**How it works:**
1. Holder requests exit for N tokens
2. Exit value = N * P (at current price)
3. Tokens are burned (supply decreases)
4. Holder joins the exit queue
5. Exit value is paid from future distributions

**Example:** Holder has 500 tokens. Current price P = $2.00.
- Exit value = 500 * $2.00 = $1,000
- 500 tokens are burned
- Holder joins queue for $1,000 payment

**Why would someone exit?** Two reasons:
1. They need liquidity now
2. They believe future distributions are worth less than exit value today

Both are legitimate. The exit mechanism provides optionality without requiring a secondary market.

---

## Rule 6: Exit Queue

```
Each period:
  D = alpha * dR
  Pay exit queue first (FIFO)
  Remainder goes to distributions
```

Exiting holders don't receive immediate payment. They enter a queue and are paid from future distributions.

**How it works:**
1. Revenue generates distribution pool D
2. Queue is paid first, in order (first-in-first-out)
3. Whatever remains goes to current holders
4. When queue is empty, 100% goes to distributions

**Example:** Exit queue has $500 owed to Alice, then $300 owed to Bob. This month's distribution pool is $400.
- Alice receives $400, still owed $100
- Bob receives $0, still owed $300
- Current holders receive $0 this month

Next month, distribution pool is $600.
- Alice receives $100 (complete), exits queue
- Bob receives $300 (complete), exits queue
- Remaining $200 goes to current holders

**Why a queue?** No reserve pool is needed. Exits are funded by future business performance. If the business stops generating revenue, the queue doesn't clear—but that's honest. Tokens were always claims on future revenue.

**Is this unfair to current holders?** During queue processing, they receive reduced or zero distributions. But:
- The pause is temporary and proportional
- Exiting holders gave up their future share
- When queue clears, remaining holders own a larger percentage

---

## System Properties

- **Revenue-indexed** — Price tracks lifetime business performance, not speculation
- **Earned, not purchased** — Tokens represent contribution, not investment
- **Continuous mint/burn** — Supply adjusts with each revenue event and exit
- **Deflationary on exit** — Departures strengthen remaining positions
- **Early-weighted** — Square root pricing rewards early contributors
- **Self-liquidating** — Exit queue requires no reserve; funded by ongoing revenue
- **Whole integers** — Tokens are discrete units, no fractional accounting
- **Scale-agnostic** — Works for $500/month or $500,000/year

---

## Choosing k (Pricing Constant)

The constant k determines the scale of token prices. Choose based on your typical transaction size.

**Goal:** Ensure typical referrals mint at least 1 token.

| Typical Transaction | Recommended k | Price at R=$10,000 |
|--------------------|---------------|-------------------|
| $50+ | 0.01 | $1.00 |
| $10-50 | 0.005 | $0.50 |
| $5-10 | 0.001 | $0.10 |

**Example calculation:** Your typical sale is $20. Referrer value (at α = 0.20) = $4. You want at least 1 token minted.
- Need P ≤ $4
- At mature scale (R = $100,000), P = k * 316
- If k = 0.01, P = $3.16 ✓ (1 token minted)
- If k = 0.1, P = $31.60 ✗ (0 tokens minted)

---

## Choosing α (Revenue Share)

The founder specifies what percentage of gross revenue flows to token holders. This choice is permanent.

**Considerations:**

- **Higher α (20-30%)** — More attractive to contributors. Faster token minting. Better for businesses that depend heavily on referral-driven growth.

- **Lower α (10-15%)** — More revenue retained by founder. Slower token minting. Better for businesses with established distribution or lower margins.

**Typical range:** 10-30%. Most businesses choose 15-20%.

**Remember:** α affects both token earning (how many tokens referrers receive) and distributions (how much cash holders receive). A higher α is more generous on both dimensions.

---

## Closing

New approaches to software architecture make this possible. When applications run on user devices, with data synced rather than centralized, operational costs collapse. A single developer can serve thousands of users. Communities can have their own isolated worlds—their own databases, their own economies, their own fates.

Vibe Token is infrastructure for this future. Not a movement, not a platform, not a promise. A mechanism: connect contribution to revenue, let the math handle distribution, see what people build when early support finally means something.
