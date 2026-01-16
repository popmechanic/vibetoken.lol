## Simulation Results: Startup + Mixed Behaviors

This analysis covers 12 simulations of a startup business model over 36 months.

**Quick Summary:**
- Business survival rate: 83%
- Mean final token price: $1.63
- Revenue share (α): 20%
- Initial participant count: 5

### Business Outcomes

The startup achieved breakthrough in 83% of simulations, exceeding typical startup success rates. Failed businesses (17%) typically exhausted their runway before finding product-market fit.

**Revenue Distribution:**
- Mean: $158,418
- Median: $162,332
- Range: $550 - $489,334

### Participant Performance

**ROI Rankings (Mean):**
- WoM Entrant #4: 16.59x ██████████
- WoM Entrant #1: 16.11x ██████████
- WoM Entrant #2: 15.75x ██████████
- WoM Entrant #5: 13.36x ██████████
- Momentum Trader: 10.97x ██████████
- True Believer: 10.74x ██████████
- WoM Entrant #3: 10.36x ██████████
- WoM Entrant #7: 9.38x █████████
- Skeptical Tester: 9.11x █████████
- Life Event Lisa: 6.27x ██████
- Angel Referrer: 4.37x ████

**Earn-Mode Performers (Total Value):**
- Referral Hustler #3: $8484 ██████████
- Referral Hustler #5: $5955 ██████████
- Referral Hustler #2: $5515 ██████████
- Referral Hustler #6: $4467 ██████████
- Referral Hustler #4: $4131 ██████████
- Referral Hustler #7: $1880 ██████████
- Referral Hustler #8: $1227 ██████████

**Behavior Analysis:**

**Diamond hands outperformed** in this scenario, achieving 10.74x average ROI. Their refusal to exit captured full upside when the business succeeded.

**Rational actors** achieved 4.37x average ROI. Their conservative approach may have triggered premature exits in some successful scenarios.

**Trend followers** achieved 10.97x average ROI. Momentum-based decisions led to variable outcomes depending on price trajectory timing.

**Skeptics** achieved 9.11x average ROI. Their early exits may have left money on the table in successful scenarios.



### Sample Narrative

*The most dramatic story from 12 simulations:*

**Beacon Analytics** launched in Jan 2024 developing real-time analytics for small teams. In Feb 2024, product went viral on TikTok. Then in Jan 2025, holiday season surge brought unexpected traffic. angel_referrer lost confidence after a slow quarter at 4.4x return. By month 36, the business had stabilized at $4,713/month.

**Timeline:**
- Jan 2024: LAUNCHED at $86 MRR
- Feb 2024: Product went viral on TikTok (4.5x spike)
- Mar 2024: Officially launched after months of building
- Aug 2024: Needed liquidity for a family emergency
- Jan 2025: Holiday season surge brought unexpected traffic (5.3x spike)
- Jan 2025: Found traction and entered growth mode
- Feb 2025: Accidentally went viral for the wrong reasons (but sales are sales) (2.5x spike)
- Dec 2025: Took profits to fund another venture
- Nov 2026: Lost confidence after a slow quarter
- Dec 2026: Stabilized at $4,713/month

**All Business Stories:**
- **Beacon Analytics**: product went viral on TikTok (survived, $50,310 total)
- **Vantage**: a Reddit post meant as a joke somehow converted (survived, $296,485 total)
- **Stratum**: Google algorithm update tanked organic traffic (survived, $550 total)
- **Prism**: featured on a popular tech reviewer (survived, $162,332 total)
- **Beacon Logistics**: accidentally went viral for the wrong reasons (but sales are sales) (survived, $489,334 total)
- **Nova Logistics**: a single tweet from an influencer changed everything (survived, $290,122 total)
- **Verde Analytics**: a single tweet from an influencer changed everything (survived, $245,620 total)
- **Vertex**: product went viral on TikTok (survived, $239,805 total)
- **Prism**: SEO finally kicked in after months of content (survived, $115,683 total)
- **Vantage**: Leo's cat walked across the keyboard and deleted the landing page (failed)
- **Stratum**: a Reddit post meant as a joke somehow converted (survived, $3,479 total)
- **Flowstate**: Stripe account suspended pending review (failed)


### Economic Observations

**Token Price Dynamics:**
- Final price range: $1.00 - $2.35
- Coefficient of variation: 28.0%

The √S pricing function dampened business volatility to 28% price variation—achieving the design goal of bounded volatility while preserving price discovery.

**Supply Floor (S_min = 1000):**
The minimum supply floor prevented price collapse in failure scenarios. Floor price: $0.32. No simulation reached the floor, indicating adequate supply cushion.

**Exit Queue Mechanism:**
With high survival rate, exit queues typically cleared quickly. The FIFO queue processed exits from ongoing revenue without delays.

### Key Findings

1. **High survival rate rewards patience.** Diamond hands and long-term holders outperformed reactive strategies in this scenario.

2. **WoM Entrant #4** achieved highest returns (16.59x), while **Angel Referrer** achieved lowest (4.37x).

### Design Principle Check

- ✗ **Early contributor reward**: 7.6x ROI for month 1-2 entrants vs 11.0x for later (0.7x advantage)
- ✓ **Bounded volatility**: Revenue CV 95% → Price CV 28% (70% dampening)
- ✓ **Floor protection**: No runs hit S_min
- ✓ **Exit liquidity**: High survival enabled queue clearance without secondary markets

**Implication:** For startup businesses with similar parameters, the token system creates meaningful value for early contributors.