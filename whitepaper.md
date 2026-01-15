# Vibe Token

## A Market-Priced Contribution System for Small Software

---

Token systems introduced sound economic primitives: programmable ownership, automated distribution, permissionless participation. What failed was not the mechanism but its deployment. Speculation displaced contribution. Financial games crowded out builders and referrers.

Vibe Token is designed for small, high-margin software businesses, the kind now cheap to create but still hard to distribute. It gives early contributors a direct stake in future revenue.

---

## The Six Rules

The entire system operates on six rules. Everything else follows from these.

**1. Price**
```
P = k * sqrt(S)
S_min = 1,000
```
Token price equals a constant times the square root of circulating supply. A minimum supply floor prevents the system from reaching P = $0.

**2. Pre-mint**
```
Founder receives a token treasury at launch.
```
Treasury tokens are inert until granted to contributors.

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

Software creation costs have collapsed. A developer with language models can ship a working product in hours. Distribution remains expensive: not in money, but in attention and trust. The people who spread software early create real value. They rarely capture it.

Traditional equity solves this for venture-scale companies. Vibe Token solves it for everything else: the micro-SaaS, the tool for a niche community, the app that serves six friends for one summer. Human-scale software deserves human-scale economics.

---

## The Commitment

**The founder specifies α (revenue share) at launch. Once set, it cannot be changed.**

This is the deal between founder and contributors. The founder chooses what percentage of gross revenue flows to token holders, typically 10-30%. Contributors can see this number before participating. After launch, it's locked. No renegotiation, no gradual reduction, no bait-and-switch.

---

## Variables

- **S** - circulating supply (increases with minting, decreases with exits)
- **S_min** - minimum supply floor (1,000 tokens)
- **R** - cumulative revenue (used for distribution calculations)
- **dR** - new revenue from a single event
- **alpha** - revenue share (founder-specified, locked at launch)
- **P** - current token price
- **k** - pricing constant (typically 0.01)

---

## Rule 1: Token Pricing

```
P = k * sqrt(S)
```

Token price is determined by circulating supply. When tokens are minted (through referral earnings), supply increases and price rises. When tokens are burned (through exits), supply decreases and price falls.

**Example with k = 0.01:**

| Circulating Supply | Price |
|--------------------|-------|
| 1,000 (floor) | $0.32 |
| 10,000 | $1.00 |
| 50,000 | $2.24 |
| 100,000 | $3.16 |

The square root function dampens volatility: a 20% supply reduction causes only a ~10% price drop. This prevents extreme swings while allowing meaningful price discovery.

**Why does this work?** Tokens represent claims on future distributions. The market prices those claims through minting and burning activity. If price diverges from fundamental value, arbitrage corrects it: underpriced tokens attract hustlers who earn their way in; overpriced tokens trigger exits.

---

## Rule 2: Pre-mint Treasury

```
Founder receives a token treasury at launch.
```

Pre-mint creates a treasury pool. These tokens are inert: they do not participate in distributions until the founder grants them to contributors. Only issued tokens circulate.

**Why a treasury?** Before any revenue exists, founders need tokens to distribute. Pre-mint solves this cold-start problem: give tokens to the influencer who tweets your launch, the friend who refers customers, the beta tester who finds bugs. No revenue means no tokens minted, but you need contributors to generate revenue.

**The founder's compensation is retained revenue (1-α), not tokens.** The founder does not hold tokens for personal distributions. The treasury exists solely as a pool to reward early contributors.

**Recommended quantity:** Set pre-mint equal to 100 times your expected first-year revenue. For a business expecting $10,000 in year one, pre-mint 100,000 tokens.

**What happens to treasury over time?** As founders grant tokens to contributors and referrers earn revenue-backed tokens, the treasury depletes. After year one of a successful business, treasury might be 30-50% depleted. Ungranted treasury tokens remain available for future contributors.

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

**Why floor (round down)?** Tokens must be whole integers. If a small referral would mint 0.3 tokens, the referrer receives 0. Design your pricing constant k so typical transactions mint at least one token.

**Why no direct purchases?** Purchasing tokens with money triggers securities law. Earning tokens through marketing, referrals, and sales compensates labor rather than selling investment contracts.

---

## Rule 4: Revenue Distribution

```
D = alpha * dR
payout_per_token = D / S
```

Each revenue event adds the founder's share (α) to a distribution pool. The system divides this pool among issued token holders proportionally. Treasury tokens do not participate.

**S counts only issued tokens.** If the founder has granted 1 token and $1,000 revenue comes in, that single token receives the full α × $1,000. Treasury tokens are inert.

**Example:** Business receives $1,000 in revenue. α = 0.20. Founder has issued 50,000 tokens from treasury.
- S = 50,000 (issued tokens only)
- Distribution pool D = $200
- Payout per token = $200 / 50,000 = $0.004

A holder with 1,000 tokens receives $4.00.

**When are distributions paid?** Implementation varies. Could be per-transaction, daily, weekly, or monthly batches. The math is the same; only the frequency differs.

**What about the exit queue?** Pending exits receive payment first. See Rule 6.

---

## Rule 5: Token Exit

```
exit_value = tokens * P
Exit blocked if S - tokens < S_min
```

Holders can exit any number of tokens at any time—one token, their entire stake, or anything in between. The system calculates exit value at current price. Exiting reduces circulating supply, which lowers the token price for remaining holders.

**How it works:**
1. Holder requests exit for N tokens (any amount they hold)
2. Exit value = N * P (at current price)
3. Burning tokens decreases supply, lowering P
4. Holder joins the exit queue
5. Future distributions pay exit value

**Example:** Holder has 500 tokens. Current supply S = 10,000, price P = $1.00. They exit 200 tokens.
- Exit value = 200 * $1.00 = $200
- 200 tokens are burned
- New supply S = 9,800, new price P = $0.99
- Holder joins queue for $200 payment
- Holder retains 300 tokens, continues receiving distributions

**Why would someone exit?** Two reasons:
1. They need liquidity now
2. They believe future distributions are worth less than exit value today

Both are legitimate. Partial exits let holders take some liquidity while maintaining exposure. The exit mechanism provides optionality without requiring a secondary market.

**Minimum supply floor:** Exit is blocked if it would reduce supply below S_min (1,000 tokens). The last tokens cannot exit, ensuring the system never reaches P = $0.

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

**Why a queue?** The system needs no reserve pool. Future revenue funds exits. If the business stops generating revenue, the queue stalls. That's honest: tokens were always claims on future revenue.

**Is this unfair to current holders?** During queue processing, they receive reduced or zero distributions. But:
- The pause is temporary and proportional
- Exiting holders gave up their future share
- When queue clears, remaining holders own a larger percentage

---

## System Properties

- **Supply-based pricing** - Price reflects market expectations through minting and burning
- **Earned, not purchased** - Tokens represent contribution, not investment
- **Continuous mint/burn** - Supply adjusts with each revenue event and exit
- **Price discovery** - Exits lower price, minting raises it
- **Early-weighted** - Square root pricing rewards early contributors
- **Self-liquidating** - Exit queue requires no reserve; funded by ongoing revenue
- **Floor protected** - Minimum supply prevents P = $0 singularity
- **Scale-agnostic** - Works for $500/month or $500,000/year

---

## Choosing k (Pricing Constant)

The constant k anchors token price to business scale. Set k proportional to expected revenue, with a minimum floor:

```
k = max(MRR / 1,000,000, 0.005)
```

Or equivalently: k = max(Annual Revenue / 10,000,000, 0.005)

| Business Scale | MRR | k | Price at S=10,000 |
|----------------|-----|---|-------------------|
| Micro/Pre-revenue | $0-5,000 | 0.005 (floor) | $0.50 |
| Early | $5,000 | 0.005 | $0.50 |
| Growing | $10,000 | 0.01 | $1.00 |
| Established | $100,000 | 0.1 | $10.00 |

**Why a floor?** Very small businesses need viable token economics. Without a minimum k, a $500 MRR business would have k = 0.0005, giving a floor price of $0.016. Tokens become too cheap to be meaningful. The floor of k = 0.005 ensures floor price is at least $0.16.

**Why this matters:** If k is too high relative to revenue, token grants become worth more than the business can pay out. A 10,000-token grant at k=0.01 is worth $1,000. If total year-one distributions are only $2,000, that single grant claims half the pie before anyone hustles.

**Rule of thumb:** Initial grants should total less than 50% of expected year-one distributions. If grants seem too valuable, k is too high

---

## Choosing α (Revenue Share)

The founder specifies what percentage of gross revenue flows to token holders. This choice is permanent.

**Considerations:**

- **Higher α (20-30%)** - More attractive to contributors. Faster token minting. Better for businesses that depend heavily on referral-driven growth.

- **Lower α (10-15%)** - More revenue retained by founder. Slower token minting. Better for businesses with established distribution or lower margins.

**Typical range:** 10-30%. Most businesses choose 15-20%.

**Remember:** α affects both token earning (how many tokens referrers receive) and distributions (how much cash holders receive). A higher α is more generous on both dimensions.

---

## Closing

New software architecture makes this possible. When applications run on user devices, with data synced rather than centralized, operational costs collapse. One developer can serve thousands of users. Communities can have their own isolated worlds: their own databases, their own economies, their own fates.

Vibe Token is infrastructure for this future. Not a movement, not a platform, not a promise. A mechanism: connect contribution to revenue, let the math handle distribution, see what people build when early support finally means something.
