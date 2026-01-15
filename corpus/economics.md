## **PROMPT: Vibe Token White Paper Draft (Bonding Curve Explicit)**

You are writing a **one-page technical white paper** describing an economic system called **Vibe Token**, designed for small, high-margin software businesses. Read "Vibe coding content outlines.md" to understand more about the technology powering these apps, and the cultural and media theory that we're using to help people understand the implications of the tech.

Your task is to explain the **token economics and trading mechanism clearly and completely**, with restrained ideological framing.

The tone should resemble the **Bitcoin white paper** combined with the **“Other Internet” / Dark Forest Collective / Metalabel / post-crypto essays** (earnest ideological intent, cultural economics and media-theory informed, no hype).

Do not write marketing copy. Do not evangelize.

Start by expressing disappointment that the ideological aspects of Web 3 economics were eventually assumed by grifter capitalism and meme coins. This paper attempts to harvest the best ideas from that movement while placing us squarely in the future via an architectural software design that we think will help contribute to a better internet.

The purpose of this token is to help foster the creation of a better internet.

Use the Strunk and White skill to help edit after the other style prompts have been taken into consideration. Feel free to rewrite the plain English summaries that follow the equations.

## NOTE ON FORMULA FORMAT (IMPORTANT)

Formulas must be written in **ASCII math** (code-like), not LaTeX.

- Use `*` for multiplication.
- Use `sqrt(x)` for square roots.
- Use simple variable names exactly as defined below (R, dR, alpha, S, P, k).
- Do not introduce special characters like `Δ`, `·`, `√`, or backslash escapes.

Example format:

P = k * sqrt(R)

## **SYSTEM PURPOSE**

Vibe Token is designed to solve a specific problem:

Software has become cheap to create but remains difficult to distribute.  
Early contributors create value, but are rarely rewarded proportionally or early.

Vibe Token provides a way for contributors (referrers, early adopters, evangelists) to earn **direct participation in future revenue**, without introducing speculation, venture financing, or complex financial instruments.

---

## **CORE ECONOMIC INVARIANT**

Each participating application opts into a single global rule:

**20% of net revenue is continuously allocated to contributors.**

This percentage:

* Is fixed

* Is non-configurable

* Applies equally to all applications

---

## **BONDING CURVE DESIGN (REQUIRED SECTION)**

Vibe Token uses a **revenue-indexed bonding curve** to price entry and exit.

Unlike speculative bonding curves that price tokens based on demand or supply alone, this bonding curve is **anchored to realized business performance**.

Key properties of this bonding curve:

* Tokens are **minted** when revenue is generated

* Tokens are **burned** when holders exit

* Price is **deterministic**, not market-discovered

* No order books, liquidity pools, or AMMs are required

* Liquidity is limited to realized revenue, not promised capital

The bonding curve defines a continuous relationship between:

* cumulative net revenue,

* token price,

* token issuance,

* and token destruction.

This curve ensures:

* early contributors receive more tokens,

* late contributors are not excluded,

* exits consolidate ownership rather than destabilizing the system.

---

## **CANONICAL VARIABLES (USE EXACTLY)**

Define and use the following variables:

* **R** — cumulative net revenue of the application (lifetime)

* **dR** — new net revenue generated in a given period

* **alpha** — revenue share percentage (fixed at 0.20)

* **S** — total token supply currently outstanding

* **P** — token price

* **k** — global pricing constant (shared by all apps)

No additional variables or configuration parameters should be introduced.

---

## **TOKEN PRICING (BONDING CURVE FUNCTION)**

Token price is defined as:

P = k * sqrt(R)

This is the bonding curve.

Plain-English explanation must accompany the equation. 

As cumulative revenue grows, token price increases, but at a diminishing rate.  
Early success matters more than late success, and growth never locks out participation.  
---

## **TOKEN ISSUANCE (EARNING VIA CONTRIBUTION)**

When new revenue dR is generated, tokens are minted according to:

tokens_minted = (alpha * dR) / P

Constraints:

* Tokens are minted **only when revenue exists**

* Tokens are earned by contributing to growth (e.g. referrals)

* Buying tokens is optional and treated as revenue entering the system

* There are no bonus schedules, tiers, epochs, or multipliers

Plain-English explanation must be included.

---

## **TOKEN EXIT (SELLING AND BURNING)**

When a holder exits the system:

* Their tokens are **burned**

* Their future revenue participation ends

* Total supply **S decreases**

This implies:

* Remaining holders’ revenue share increases

* The bonding curve re-prices automatically

* Exits strengthen the system instead of weakening it

There are no secondary markets.

The bonding curve itself defines entry and exit pricing.

---

## **REVENUE DISTRIBUTION**

Each period, a revenue pool is created:

D = alpha * dR

Revenue accrues to holders proportionally:

payout_per_token = D / S

Important constraints:

* Payouts **accrue as balances**, not instant transfers

* Withdrawals occur only once balances exceed practical minimums

* Settlement may occur via traditional or stablecoin payment rails

* No dividends, guarantees, or fixed yields are promised

---

## **SYSTEM PROPERTIES (MUST INCLUDE)**

Explicitly describe these properties:

* Revenue-indexed bonding curve

* Continuous mint / burn

* Deflationary on exit

* Early-weighted without hard lock-in

* Scale-agnostic (micro-business compatible)

* Operationally conservative (accrual \+ batching)

* Non-speculative by design

---

## **STYLE CONSTRAINTS**

* Fit comfortably on **one page**

* Use equations sparingly and always explain them plainly

* Avoid crypto jargon, hype, or futurism

* Cultural or ideological intent should be **subtle**

* Treat the system as infrastructure, not a movement

---

## **OUTPUT REQUIREMENTS**

Produce:

* A single cohesive white paper

* Clear section headings

* No appendices, FAQs, diagrams, or governance discussions

* No deviation from the economic specification above

---

### **IMPORTANT**

This prompt defines a **complete economic system**.

Do not invent missing mechanics.

Do not add new parameters.

Do not reinterpret the bonding curve.

