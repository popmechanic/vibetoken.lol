## Simulation Results: Micro Business + Diamond Hands

This analysis covers 3 simulations of a micro business model over 36 months.

**Quick Summary:**
- Business survival rate: 100%
- Mean final token price: $1.43
- Revenue share (α): 20%
- Initial participant count: 3

### Business Outcomes

Despite high revenue volatility, the micro business survived in 100% of cases. The square root pricing function helped dampen price swings during spiky revenue periods.

**Revenue Distribution:**
- Mean: $261,749
- Median: $130,001
- Range: $72,762 - $582,483

The significant gap between mean and median revenue indicates a right-skewed distribution with occasional extreme successes.

### Participant Performance

**ROI Rankings (Mean):**
- Early Adopter: 28.65x ██████████
- Founder's Friend: 24.65x ██████████
- Committed Holder: 18.33x ██████████

**Behavior Analysis:**

**Diamond hands outperformed** in this scenario, achieving 23.88x average ROI. Their refusal to exit captured full upside when the business succeeded.



### Sample Narrative

So Zara started **The Asset Shop** back in Jan 2024, curating retro synth presets. They kicked off at around $2,289 a month—not bad for a side project. 

Things got rough early though. Accidentally shipped the wrong product to a reviewer. Revenue tanked, and honestly? Most people would've given up right there. 

But here's the crazy part: in Nov 2026, featured on Theo. We're talking a 12.4x spike. Zara literally thought the dashboard was broken at first. 

Fast forward to today, and The Asset Shop has done over $582,483 in total revenue. Still pulling in about $233,740 a month. Zara's still running it, and the early believers who held on? They're doing just fine.

**Timeline:**
- Jan 2024: LAUNCHED at $2,289 MRR
- May 2024: A Reddit post meant as a joke somehow converted (3.9x spike)
- Jul 2024: Featured on a trending lifestyle vlogger (3.7x spike)
- Oct 2024: Stabilized at a comfortable revenue level
- Feb 2025: A single tweet from an influencer changed everything (3.0x spike)
- Mar 2026: A Reddit post meant as a joke somehow converted (4.3x spike)
- Aug 2026: Accidentally went viral for the wrong reasons (but sales are sales) (3.5x spike)
- Nov 2026: Featured on Theo (12.4x spike)
- Dec 2026: Featured on Theo (4.5x spike)
- Dec 2026: Stabilized at $233,740/month

**All Simulated Businesses:**
- **The Asset Shop**: accidentally shipped the wrong product to a reviewer (survived, $582,483 total)
- **Raj's Vintage Packs**: Google algorithm update tanked organic traffic (survived, $130,001 total)
- **Kai's Warm Sounds**: negative review from a popular tech blogger hurt conversions (survived, $72,762 total)


### Economic Observations

**Token Price Dynamics:**
- Final price range: $1.19 - $1.80
- Coefficient of variation: 18.8%

The √S pricing function dampened business volatility to 19% price variation—achieving the design goal of bounded volatility while preserving price discovery.

**Supply Floor (S_min = 1000):**
The minimum supply floor prevented price collapse in failure scenarios. Floor price: $0.25. No simulation reached the floor, indicating adequate supply cushion.

**Exit Queue Mechanism:**
With high survival rate, exit queues typically cleared quickly. The FIFO queue processed exits from ongoing revenue without delays.

### Key Findings

1. **High survival rate rewards patience.** Diamond hands and long-term holders outperformed reactive strategies in this scenario.

2. **Early Adopter** achieved highest returns (28.65x), while **Committed Holder** achieved lowest (18.33x).

### Design Principle Check

- ✓ **Early contributor reward**: 26.7x ROI for month 1-2 entrants vs 18.3x for later (1.5x advantage)
- ✓ **Bounded volatility**: Revenue CV 87% → Price CV 19% (78% dampening)
- ✓ **Floor protection**: No runs hit S_min
- ✓ **Exit liquidity**: High survival enabled queue clearance without secondary markets

**Implication:** For micro businesses with similar parameters, the token system creates meaningful value for early contributors.