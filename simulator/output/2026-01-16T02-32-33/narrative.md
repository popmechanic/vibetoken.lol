## Simulation Results: Startup + Mixed Behaviors

This analysis covers 12 simulations of a startup business model over 36 months.

**Quick Summary:**
- Business survival rate: 75%
- Mean final token price: $1.34
- Revenue share (α): 20%
- Initial participant count: 5

### Business Outcomes

The startup achieved breakthrough in 75% of simulations, exceeding typical startup success rates. Failed businesses (25%) typically exhausted their runway before finding product-market fit.

**Revenue Distribution:**
- Mean: $72,491
- Median: $61,696
- Range: $528 - $293,910

### Participant Performance

**ROI Rankings (Mean):**
- WoM Entrant #5: 13.88x ██████████
- WoM Entrant #1: 11.84x ██████████
- WoM Entrant #2: 11.80x ██████████
- WoM Entrant #3: 8.13x ████████
- Momentum Trader: 6.43x ██████
- True Believer: 6.35x ██████
- Skeptical Tester: 6.01x ██████
- Life Event Lisa: 4.87x ████
- Angel Referrer: 4.37x ████

**Earn-Mode Performers (Total Value):**
- Referral Hustler #3: $7402 ██████████
- Referral Hustler #7: $2666 ██████████
- Referral Hustler #4: $2659 ██████████
- Referral Hustler #6: $2505 ██████████
- Referral Hustler #5: $2165 ██████████
- Referral Hustler #2: $1392 ██████████
- Referral Hustler #8: $1198 ██████████
- Referral Hustler #1: $1038 ██████████

**Behavior Analysis:**

**Diamond hands outperformed** in this scenario, achieving 6.35x average ROI. Their refusal to exit captured full upside when the business succeeded.

**Rational actors** achieved 4.37x average ROI. Their conservative approach may have triggered premature exits in some successful scenarios.

**Trend followers** achieved 6.43x average ROI. Momentum-based decisions led to variable outcomes depending on price trajectory timing.

**Skeptics** achieved 6.01x average ROI. Their early exits may have left money on the table in successful scenarios.



### Sample Narrative

So Zara started **Nova Logistics** back in Jan 2024, developing collaborative editing tools. Started small, just a few hundred bucks a month, but Zara saw the potential. 

Things got rough early though. Google algorithm update tanked organic traffic. Revenue tanked, and honestly? Most people would've given up right there. 

But here's the crazy part: in Jun 2025, product went viral on TikTok. We're talking a 5.5x spike. The kind of month that makes you think maybe this thing could actually work. 

angel_referrer bailed early—moving on to a new project—walked away at 4.4x. Not bad, but if they'd stuck around... well, you'll see. 

Nova Logistics is still going—about $5,552 in total revenue so far. It's not going to make anyone rich, but Zara's built something real.

**Timeline:**
- Jan 2024: LAUNCHED at $148 MRR
- Mar 2024: Officially launched after months of building
- Mar 2024: Google algorithm update tanked organic traffic (revenue crashed)
- Apr 2024: Google algorithm update tanked organic traffic (revenue crashed)
- Aug 2024: Took profits to fund another venture
- Jun 2025: Product went viral on TikTok (5.5x spike)
- Jun 2025: Found traction and entered growth mode
- Jul 2025: Landed on TechCrunch front page (2.9x spike)
- Dec 2025: Used stake for house down payment
- Dec 2026: Stabilized at $571/month

**All Simulated Businesses:**
- **Nova Logistics**: Google algorithm update tanked organic traffic (survived, $5,552 total)
- **Arcline**: a Reddit post meant as a joke somehow converted (survived, $75,300 total)
- **Cadence**: DNS propagation took down the site for 48 hours (survived, $10,215 total)
- **Lumen**: SEO finally kicked in after months of content (survived, $224,898 total)
- **Drift Tech**: a Reddit post meant as a joke somehow converted (survived, $293,910 total)
- **Peak Analytics**: negative review from a popular tech blogger hurt conversions (survived, $6,563 total)
- **Nimbus**: accidentally went viral for the wrong reasons (but sales are sales) (survived, $65,002 total)
- **Beacon**: featured on a trending lifestyle vlogger (survived, $61,696 total)
- **Nimbus**: holiday season surge brought unexpected traffic (survived, $120,257 total)
- **Vertex**: landed on Hacker News front page (failed)
- **Vantage**: landed on Product Hunt front page (failed)
- **Nimbus**: key customer churned and cascade followed (failed)


### Economic Observations

**Token Price Dynamics:**
- Final price range: $1.01 - $2.07
- Coefficient of variation: 25.0%

The √S pricing function dampened business volatility to 25% price variation—achieving the design goal of bounded volatility while preserving price discovery.

**Supply Floor (S_min = 1000):**
The minimum supply floor prevented price collapse in failure scenarios. Floor price: $0.32. No simulation reached the floor, indicating adequate supply cushion.

**Exit Queue Mechanism:**
With high survival rate, exit queues typically cleared quickly. The FIFO queue processed exits from ongoing revenue without delays.

### Key Findings

1. **High survival rate rewards patience.** Diamond hands and long-term holders outperformed reactive strategies in this scenario.

2. **WoM Entrant #5** achieved highest returns (13.88x), while **Angel Referrer** achieved lowest (4.37x).

### Design Principle Check

- ✗ **Early contributor reward**: 5.4x ROI for month 1-2 entrants vs 6.4x for later (0.8x advantage)
- ✓ **Bounded volatility**: Revenue CV 127% → Price CV 25% (80% dampening)
- ✓ **Floor protection**: No runs hit S_min
- ✓ **Exit liquidity**: High survival enabled queue clearance without secondary markets

**Implication:** For startup businesses with similar parameters, the token system creates meaningful value for early contributors.