## Simulation Results: Micro Business + Diamond Hands

This analysis covers 15 simulations of a micro business model over 36 months.

**Quick Summary:**
- Business survival rate: 93%
- Mean final token price: $1.45
- Revenue share (α): 20%
- Initial participant count: 3

### Business Outcomes

Despite high revenue volatility, the micro business survived in 93% of cases. The square root pricing function helped dampen price swings during spiky revenue periods.

**Revenue Distribution:**
- Mean: $377,375
- Median: $113,141
- Range: $47,322 - $2,051,303

The significant gap between mean and median revenue indicates a right-skewed distribution with occasional extreme successes.

### Participant Performance

**ROI Rankings (Mean):**
- Early Adopter: 40.57x ██████████
- Founder's Friend: 33.77x ██████████
- Committed Holder: 23.36x ██████████

**Behavior Analysis:**

**Diamond hands outperformed** in this scenario, achieving 32.57x average ROI. Their refusal to exit captured full upside when the business succeeded.



### Sample Narrative

*The most dramatic story from 15 simulations:*

**The Font Foundry** launched in Jan 2024 creating UI component libraries. In Feb 2024, Stripe account suspended pending review. Then in Feb 2025, negative review from a popular tech blogger hurt conversions. The business shut down in month 36.

**Timeline:**
- Jan 2024: LAUNCHED at $1,509 MRR
- Apr 2024: A single tweet from an influencer changed everything (6.1x spike)
- Jun 2024: Landed on Product Hunt front page (2.6x spike)
- Aug 2024: Product went viral on TikTok (4.3x spike)
- Oct 2024: A Reddit post meant as a joke somehow converted (3.5x spike)
- Nov 2024: Product went viral on TikTok (2.6x spike)
- Apr 2025: Product went viral on TikTok (2.7x spike)
- May 2026: Shut down operations
- Dec 2026: Ran out of runway before finding product-market fit
- Dec 2026: Business shut down

**All Business Stories:**
- **The Font Foundry**: Stripe account suspended pending review (failed)
- **Side Quest**: server migration went sideways for a week (survived, $113,141 total)
- **Soft Launch**: key supplier delayed shipments (survived, $209,210 total)
- **Night Owl**: a single tweet from an influencer changed everything (survived, $97,152 total)
- **Deep Focus**: accidentally shipped the wrong product to a reviewer (survived, $161,421 total)
- **Isla's Cozy Templates**: Stripe account suspended pending review (survived, $178,284 total)
- **Luna's Vintage Presets**: featured on Fireship (survived, $205,541 total)
- **Sofia's Neon Presets**: competitor went offline, redirecting their customers (survived, $47,876 total)
- **Deep Focus**: accidentally shipped the wrong product to a reviewer (survived, $51,849 total)
- **Yuki's Lo-Fi Loops**: key supplier delayed shipments (survived, $47,322 total)
- **Raj's Cozy Beats**: DNS propagation took down the site for 48 hours (survived, $88,817 total)
- **Pixel Perfect**: competitor went offline, redirecting their customers (survived, $76,907 total)
- **Golden Hour**: SEO finally kicked in after months of content (survived, $2,051,303 total)
- **Cozy Corners**: Stripe account suspended pending review (survived, $430,772 total)
- **Amara's Neon Loops**: server migration went sideways for a week (survived, $85,888 total)


### Economic Observations

**Token Price Dynamics:**
- Final price range: $1.14 - $2.61
- Coefficient of variation: 30.9%

Price variation of 31% tracked the underlying business risk. The bonding curve damped but didn't eliminate swings—appropriate for this volatility profile.

**Supply Floor (S_min = 1000):**
The minimum supply floor prevented price collapse in failure scenarios. Floor price: $0.25. No simulation reached the floor, indicating adequate supply cushion.

**Exit Queue Mechanism:**
With high survival rate, exit queues typically cleared quickly. The FIFO queue processed exits from ongoing revenue without delays.

### Key Findings

1. **High survival rate rewards patience.** Diamond hands and long-term holders outperformed reactive strategies in this scenario.

2. **Early Adopter** achieved highest returns (40.57x), while **Committed Holder** achieved lowest (23.36x).

### Design Principle Check

- ✓ **Early contributor reward**: 37.2x ROI for month 1-2 entrants vs 23.4x for later (1.6x advantage)
- ✓ **Bounded volatility**: Revenue CV 164% → Price CV 31% (81% dampening)
- ✓ **Floor protection**: No runs hit S_min
- ✓ **Exit liquidity**: High survival enabled queue clearance without secondary markets

**Implication:** For micro businesses with similar parameters, the token system creates meaningful value for early contributors.