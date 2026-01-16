## Simulation Results: Startup + Mixed Behaviors

This analysis covers 10 simulations of a startup business model over 36 months.

**Quick Summary:**
- Business survival rate: 80%
- Mean final token price: $1.58
- Revenue share (α): 20%
- Initial participant count: 5

### Business Outcomes

The startup achieved breakthrough in 80% of simulations, exceeding typical startup success rates. Failed businesses (20%) typically exhausted their runway before finding product-market fit.

**Revenue Distribution:**
- Mean: $125,477
- Median: $124,833
- Range: $1,177 - $257,876

### Participant Performance

**ROI Rankings (Mean):**
- WoM Entrant #5: 12.33x ██████████
- WoM Entrant #1: 11.14x ██████████
- WoM Entrant #4: 10.50x ██████████
- WoM Entrant #3: 9.57x █████████
- Momentum Trader: 9.18x █████████
- True Believer: 9.03x █████████
- Skeptical Tester: 7.69x ███████
- WoM Entrant #8: 6.40x ██████
- WoM Entrant #6: 6.37x ██████
- WoM Entrant #7: 6.30x ██████
- Life Event Lisa: 5.71x █████
- WoM Entrant #2: 5.52x █████
- Angel Referrer: 4.37x ████

**Earn-Mode Performers (Total Value):**
- Referral Hustler #3: $4255 ██████████
- Referral Hustler #2: $3968 ██████████
- Referral Hustler #4: $3942 ██████████
- Referral Hustler #6: $3911 ██████████
- Referral Hustler #1: $3776 ██████████
- Referral Hustler #5: $2501 ██████████
- Referral Hustler #7: $2079 ██████████
- Referral Hustler #8: $872 ██████████

**Behavior Analysis:**

**Diamond hands outperformed** in this scenario, achieving 9.03x average ROI. Their refusal to exit captured full upside when the business succeeded.

**Rational actors** achieved 4.37x average ROI. Their conservative approach may have triggered premature exits in some successful scenarios.

**Trend followers** achieved 9.18x average ROI. Momentum-based decisions led to variable outcomes depending on price trajectory timing.

**Skeptics** achieved 7.69x average ROI. Their early exits may have left money on the table in successful scenarios.



### Sample Narrative

*The most dramatic story from 10 simulations:*

**Drift AI** launched in Jan 2024 creating no-code tools for non-technical founders. In Jan 2024, moving on to a new project. skeptical_tester lost confidence after a slow quarter at 4.5x return. By month 36, the business had stabilized at $7,622/month.

**Timeline:**
- Jan 2024: LAUNCHED at $333 MRR
- Mar 2024: Officially launched after months of building
- Aug 2024: Lost confidence after a slow quarter
- Nov 2024: Accidentally went viral for the wrong reasons (but sales are sales) (5.5x spike)
- Nov 2024: Found traction and entered growth mode
- Dec 2025: Used stake for house down payment
- Mar 2026: Used stake for house down payment
- Aug 2026: Lost confidence after a slow quarter
- Dec 2026: Stabilized at $7,622/month

**All Business Stories:**
- **Drift AI**: accidentally went viral for the wrong reasons (but sales are sales) (survived, $104,396 total)
- **Drift**: product went viral on TikTok (survived, $257,876 total)
- **Nova Analytics**: DNS propagation took down the site for 48 hours (survived, $176,573 total)
- **Beacon**: holiday season surge brought unexpected traffic (survived, $248,231 total)
- **Verde AI**: accidentally shipped the wrong product to a reviewer (survived, $86,619 total)
- **Drift**: holiday season surge brought unexpected traffic (survived, $8,220 total)
- **Vertex**: featured on Theo (survived, $244,161 total)
- **Prism**: featured on Lofi Girl (survived, $124,833 total)
- **Vantage**: accidentally went viral for the wrong reasons (but sales are sales) (failed)
- **Beacon Logistics**: Stripe account suspended pending review (failed)


### Economic Observations

**Token Price Dynamics:**
- Final price range: $1.02 - $2.03
- Coefficient of variation: 21.0%

The √S pricing function dampened business volatility to 21% price variation—achieving the design goal of bounded volatility while preserving price discovery.

**Supply Floor (S_min = 1000):**
The minimum supply floor prevented price collapse in failure scenarios. Floor price: $0.32. No simulation reached the floor, indicating adequate supply cushion.

**Exit Queue Mechanism:**
With high survival rate, exit queues typically cleared quickly. The FIFO queue processed exits from ongoing revenue without delays.

### Key Findings

1. **High survival rate rewards patience.** Diamond hands and long-term holders outperformed reactive strategies in this scenario.

2. **WoM Entrant #5** achieved highest returns (12.33x), while **Angel Referrer** achieved lowest (4.37x).

### Design Principle Check

- ✗ **Early contributor reward**: 6.7x ROI for month 1-2 entrants vs 9.2x for later (0.7x advantage)
- ✓ **Bounded volatility**: Revenue CV 78% → Price CV 21% (73% dampening)
- ✓ **Floor protection**: No runs hit S_min
- ✓ **Exit liquidity**: High survival enabled queue clearance without secondary markets

**Implication:** For startup businesses with similar parameters, the token system creates meaningful value for early contributors.