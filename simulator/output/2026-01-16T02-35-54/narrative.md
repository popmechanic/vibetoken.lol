## Simulation Results: Startup + Mixed Behaviors

This analysis covers 20 simulations of a startup business model over 36 months.

**Quick Summary:**
- Business survival rate: 60%
- Mean final token price: $1.48
- Revenue share (α): 20%
- Initial participant count: 5

### Business Outcomes

The startup achieved breakthrough in 60% of simulations, exceeding typical startup success rates. Failed businesses (40%) typically exhausted their runway before finding product-market fit.

**Revenue Distribution:**
- Mean: $92,469
- Median: $43,636
- Range: $90 - $465,868

The significant gap between mean and median revenue indicates a right-skewed distribution with occasional extreme successes.

### Participant Performance

**ROI Rankings (Mean):**
- WoM Entrant #8: 13.46x ██████████
- WoM Entrant #6: 12.97x ██████████
- WoM Entrant #4: 12.84x ██████████
- WoM Entrant #3: 10.16x ██████████
- WoM Entrant #5: 9.47x █████████
- WoM Entrant #1: 8.52x ████████
- Momentum Trader: 7.88x ███████
- WoM Entrant #2: 7.81x ███████
- True Believer: 7.76x ███████
- Skeptical Tester: 6.88x ██████
- Life Event Lisa: 5.15x █████
- Angel Referrer: 4.37x ████

**Earn-Mode Performers (Total Value):**
- Referral Hustler #1: $7365 ██████████
- Referral Hustler #2: $5398 ██████████
- Referral Hustler #3: $4498 ██████████
- Referral Hustler #5: $4344 ██████████
- Referral Hustler #4: $3491 ██████████
- Referral Hustler #7: $3235 ██████████
- Referral Hustler #8: $1540 ██████████
- Referral Hustler #6: $1293 ██████████

**Behavior Analysis:**

**Diamond hands outperformed** in this scenario, achieving 7.76x average ROI. Their refusal to exit captured full upside when the business succeeded.

**Rational actors** achieved 4.37x average ROI. Their conservative approach may have triggered premature exits in some successful scenarios.

**Trend followers** achieved 7.88x average ROI. Momentum-based decisions led to variable outcomes depending on price trajectory timing.

**Skeptics** achieved 6.88x average ROI. Their early exits may have left money on the table in successful scenarios.



### Sample Narrative

So Yuki started **Drift Tech** back in Jan 2024, building developer productivity tools. Started small, just a few hundred bucks a month, but Yuki saw the potential. 

The first few months were pretty quiet—just grinding, building up a small customer base. 

Of course, it wasn't all up and to the right. Payment processor audit froze payouts and revenue cratered. 

Anyway, it didn't work out. Drift Tech shut down after 36 months. Never really found the traction they needed. Yuki's already working on something new though.

**Timeline:**
- Jan 2024: LAUNCHED at $389 MRR
- Mar 2024: Officially launched after months of building
- Aug 2024: Needed liquidity for a family emergency
- Jun 2025: Shut down operations
- Jun 2025: Payment processor audit froze payouts (revenue crashed)
- Jun 2025: Yuki on paternity leave
- Jul 2025: Yuki's cat walked across the keyboard and deleted the landing page (revenue crashed)
- Aug 2025: Stripe account suspended pending review (revenue crashed)
- Dec 2026: Key customer churned and cascade followed
- Dec 2026: Business shut down

**All Simulated Businesses:**
- **Drift Tech**: payment processor audit froze payouts (failed)
- **Flowstate**: accidentally shipped the wrong product to a reviewer (failed)
- **Beacon Labs**: accidentally went viral for the wrong reasons (but sales are sales) (survived, $24,443 total)
- **Flowstate**: SEO finally kicked in after months of content (survived, $170,298 total)
- **Verde Labs**: competitor went offline, redirecting their customers (survived, $134,917 total)
- **Peak Labs**: SEO finally kicked in after months of content (survived, $43,636 total)
- **Nova Tech**: a Reddit post meant as a joke somehow converted (survived, $465,868 total)
- **Beacon Labs**: Luna's cat walked across the keyboard and deleted the landing page (failed)
- **Peak Logistics**: accidentally shipped the wrong product to a reviewer (failed)
- **Verde AI**: product went viral on TikTok (survived, $63,685 total)
- **Beacon Logistics**: Marcus's cat walked across the keyboard and deleted the landing page (survived, $150,832 total)
- **Lumen**: Stripe account suspended pending review (failed)
- **Vantage**: featured on a popular tech reviewer (survived, $35,819 total)
- **Verde Tech**: New Year season surge brought unexpected traffic (survived, $193,220 total)
- **Stratum**: landed on Hacker News front page (survived, $257,020 total)
- **Peak Logistics**: product went viral on TikTok (survived, $217,405 total)
- **Drift Analytics**: a single tweet from an influencer changed everything (survived, $66,400 total)
- **Nova Labs**: market window closed before they could capitalize (failed)
- **Prism**: competitor went offline, redirecting their customers (failed)
- **Cadence**: market window closed before they could capitalize (failed)


### Economic Observations

**Token Price Dynamics:**
- Final price range: $1.07 - $2.41
- Coefficient of variation: 22.9%

The √S pricing function dampened business volatility to 23% price variation—achieving the design goal of bounded volatility while preserving price discovery.

**Supply Floor (S_min = 1000):**
The minimum supply floor prevented price collapse in failure scenarios. Floor price: $0.32. No simulation reached the floor, indicating adequate supply cushion.

**Exit Queue Mechanism:**
In failed scenarios, exit queues froze when revenue stopped. Participants who exited early captured value; late exits risked queue freeze.

### Key Findings

1. **Mixed outcomes favor balanced strategies.** Neither pure conviction nor pure caution dominated. Risk management mattered.

2. **WoM Entrant #8** achieved highest returns (13.46x), while **Angel Referrer** achieved lowest (4.37x).

### Design Principle Check

- ✗ **Early contributor reward**: 6.0x ROI for month 1-2 entrants vs 7.9x for later (0.8x advantage)
- ✓ **Bounded volatility**: Revenue CV 128% → Price CV 23% (82% dampening)
- ✓ **Floor protection**: No runs hit S_min
- ⚠ **Exit liquidity**: 40% failure rate risked queue freezes

**Implication:** For startup businesses with similar parameters, the token system creates meaningful value for early contributors.