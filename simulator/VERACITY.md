# Simulator Veracity Analysis

**Date:** January 2026
**Purpose:** Document how closely the simulator models real-world business dynamics, with empirical sources for all claims.

---

## Executive Summary

| Aspect | Current Model | Reality | Verdict |
|--------|---------------|---------|---------|
| Micro survival rate | ~45-65% (varies) | ~60% at 3 years | Reasonable |
| Startup failure rate | 70-80% within runway | 92% micro-SaaS fail ≤18mo | Conservative |
| Growth patterns | Continuous compounding | Phase-based step functions | Needs improvement |
| Revenue distribution | Normal (symmetric) | Right-skewed (long tail) | Needs improvement |
| Enterprise stability | Low variance (3-4%) | Moderate variance | Reasonable |
| Failure modes | Binary (consecutive zeros) | Gradual fade | Partially modeled |

---

## 1. Survival Rate Validation

### Empirical Data

**General Small Business (BLS 2024):**
- Year 1 survival: 79%
- Year 3 survival: 63%
- Year 5 survival: 51.6%
- Year 10 survival: 34.7%

> Source: [U.S. Bureau of Labor Statistics - 1-year survival rates (2024)](https://www.bls.gov/opub/ted/2024/1-year-survival-rates-for-new-business-establishments-by-year-and-location.htm)

**Tech/SaaS Startups:**
- 23.2% fail in first year
- 48.4% fail by year 5
- 63% of tech startups fail within 5 years (higher than 42% for finance/real estate)

> Source: [DemandSage - Startup Failure Rate Statistics 2026](https://www.demandsage.com/startup-failure-rate/)

**Micro-SaaS Specifically:**
- 92% fail within 18 months
- Only 18% reach "sustainability zone" ($1,000-$5,000 MRR)
- 82% remain stuck in "validation zone" ($0-$1,000 MRR)

> Source: [RockingWeb - 92% of Micro SaaS Fail Within 18 Months (2025)](https://www.rockingweb.com.au/18-month-rule-micro-saas-startup-failure-analysis/)

### Simulator Comparison

The simulator's startup archetype with 8% monthly breakthrough probability yields ~72% failure rate within 15 months, which aligns well with the 92% micro-SaaS failure rate (our model is slightly generous).

---

## 2. Growth Rate Validation

### Empirical Data

**Early-Stage SaaS (under $2M ARR):**
- Top performers: 15-20% MoM growth
- Median: 2-2.5% MoM across lifecycle
- Best-in-class reach $1M ARR in 9 months; median takes 2 years 9 months

> Source: [ChartMogul SaaS Growth Report 2023](https://chartmogul.com/reports/saas-growth-report/)

**Y Combinator Benchmark:**
- "Good" growth during YC: 5-7% weekly (~25% monthly)

> Source: [Eleken - Average SaaS Growth Rate 2024](https://www.eleken.co/blog-posts/average-saas-growth-rate-brief-guide-for-startups)

**Mature SaaS ($3M+ ARR):**
- Top decile: 6-7% monthly
- Top quartile: 3-5% monthly
- Growth tapers as companies mature

> Source: [Klipfolio - MoM MRR Growth Rate](https://www.klipfolio.com/resources/kpi-examples/saas/mom-mrr-growth)

### Simulator Comparison

| Archetype | Simulator Growth | Empirical Range | Assessment |
|-----------|------------------|-----------------|------------|
| Micro | 2-5% monthly | 2-7% (phase-dependent) | Reasonable |
| Startup (post-breakthrough) | 12% monthly | 10-20% for top performers | Conservative |
| Enterprise | 4.5% monthly | 2-4% for mature | Optimistic |

---

## 3. Revenue Volatility Validation

### Empirical Data

**Side Hustle Income Distribution:**
- Average: $1,122/month
- Median: $200/month
- This 5.6x gap indicates extreme right-skew

> Source: [Hostinger - Side Hustle Statistics 2025](https://www.hostinger.com/tutorials/side-hustle-statistics/)

**Micro-SaaS Revenue Phases:**
- Foundation (months 1-6): Highly volatile, seeking product-market fit
- Traction (months 7-12): 5-15% monthly if successful
- Scaling (months 13-18): 3-10% monthly
- Optimization (months 19-24): 2-7% monthly

> Source: [RockingWeb - 1,000 Micro-SaaS Analyzed (2025)](https://www.rockingweb.com.au/micro-saas-revenue-analysis-2025/)

### Issue: Normal Distribution vs Reality

The simulator uses normal distribution N(mean, stddev) for growth, which is symmetric around the mean. Real business revenue is heavily right-skewed:
- Most months: near-zero or small revenue
- Occasional months: 3-10x average (launches, viral moments)
- Rare: 50-100x (black swan success)

**Recommendation:** Consider log-normal or mixture distribution for micro archetype.

---

## 4. Failure Mode Validation

### Empirical Data

**Top Causes of Startup Failure:**
1. No market need: 42%
2. Ran out of cash: 29%
3. Team issues: 23%
4. Got outcompeted: 19%
5. Poor marketing: 13%

> Source: [CB Insights via DemandSage](https://www.demandsage.com/startup-failure-rate/)

**Cash Flow Issues:**
- 38% of small business failures cite cash flow problems
- Many businesses don't "fail" suddenly - they fade gradually

> Source: [Lendio - Small Business Survival and Failure Rates](https://www.lendio.com/blog/small-business-survival-and-failure-rates)

### Simulator Comparison

The simulator models failure as:
- **Micro:** 3+ consecutive zero-revenue months = terminal failure
- **Startup:** Runway exhaustion without breakthrough = terminal failure
- **Enterprise:** Gradual decline over 6+ negative months

**Issue:** Real businesses often enter "zombie" state - neither failing nor growing, just flatlined at low revenue indefinitely. The simulator lacks this plateau state.

**Important nuance:** Not all businesses plateau. Digital businesses have fat-tailed distributions where even simple products occasionally become breakout successes. The model should reflect:
- **Most likely:** Plateau at modest MRR
- **Less likely:** Failure (consecutive zeros)
- **Rare but real:** Breakout success (viral moment, unexpected growth)

---

## 5. Phase-Based Growth (Missing Pattern)

### Empirical Evidence

Real micro-SaaS growth is not continuous compounding but rather phase-based:

| Phase | Months | Behavior | Growth Rate |
|-------|--------|----------|-------------|
| Validation | 1-6 | Chaos, seeking PMF | Highly volatile |
| Traction | 7-12 | Found PMF (or plateau) | 5-15% if successful |
| Scaling | 13-18 | Systems maturing | 3-10% |
| Optimization | 19-24 | Retention focus | 2-7% |

> Source: [RockingWeb - 1,000 Micro-SaaS Analyzed](https://www.rockingweb.com.au/micro-saas-revenue-analysis-2025/)

The current micro archetype uses stateless growth (each month independent), missing these phase transitions.

**However:** Digital businesses also have fat-tailed outcomes. Even a simple MP3 store or template shop can occasionally go viral on TikTok, get featured on Product Hunt, or catch a trend. The model should capture:
- Phase-based typical progression (validation → traction → plateau)
- But with ongoing small probability of breakout at any phase
- This is why log-normal is better than normal: it has the right tail shape

---

## 6. Fat-Tailed Outcomes in Digital Businesses

### Why This Matters

Digital businesses have fundamentally different outcome distributions than traditional businesses:
- Near-zero marginal cost of distribution
- Network effects and viral potential
- Platform algorithms can surface any product to millions
- A single Reddit post, TikTok video, or Product Hunt feature can transform a $200/month business overnight

### Empirical Evidence

**Indie Hacker Success Stories:**
- Top indie SaaS range from $10K to $1.66M monthly
- Nomad List: $441K/month from a simple directory
- Tailwind CSS: $500K+/month from a utility framework
- Most start as side projects with modest expectations

> Source: [Market Clarity - Top 30 Most Profitable Indie SaaS](https://mktclarity.com/blogs/news/indie-saas-top)

**The Long Tail Reality:**
- Most micro-SaaS stay under $1K MRR forever
- But the ones that break out can reach $100K+ MRR
- This creates a power-law (Pareto) distribution, not normal

### Modeling Implications

The simulator should NOT cap all businesses at a ceiling. Instead:
- Use distributions with fat right tails (log-normal, Pareto)
- Include rare "breakout" events even for plateaued businesses
- Model viral spikes as correlated events (momentum matters)

A realistic distribution might be:
- 70% plateau at modest MRR ($200-$2000)
- 20% fail (fade to zero)
- 8% grow steadily to mid-tier ($5K-$20K MRR)
- 2% break out to significant scale ($50K+ MRR)

---

## 7. Digital Product Decay Pattern (Missing Pattern)

### Empirical Evidence

Digital product businesses (Etsy, Gumroad, course creators) show consistent decay pattern:

1. **Launch spike:** Big initial revenue from marketing push
2. **Rapid decay (weeks 2-4):** 50-80% drop from peak
3. **Slow decline (months 2-6):** 10-20% monthly decline
4. **Long tail plateau (month 6+):** Stabilizes at ~10% of peak

> Source: [Gumroad Trends 2025](https://www.accio.com/business/gumroad-trends) and creator economy reports

The simulator has no mechanism for launch decay - only business failure or stochastic growth.

---

## 8. Recommendations Based on Evidence

### High Priority (Affects Validity)

1. **Add plateau state to micro archetype (probabilistic, not universal)**
   - Evidence: Most businesses flatline, not die or grow
   - Implementation: New BusinessState.PLATEAUED that businesses can enter
   - **Important nuance:** Plateau should be the *most likely* outcome, but not forced:
     - ~60-70% plateau at some MRR ceiling
     - ~20-25% fail (consecutive zeros)
     - ~10-15% break out (rare viral success, graduation to startup)
   - Even from plateau, there should be small probability of breakout
   - Digital businesses can have unexpected viral moments at any time

2. **Switch micro growth to log-normal distribution**
   - Evidence: 5.6x mean/median gap in side hustle income
   - Implementation: Replace normal() with log-normal in growth calculation
   - **Key insight:** Log-normal naturally creates the right shape:
     - Most draws are small/modest
     - Occasional large draws (breakout months)
     - Rare very large draws (viral success)

3. **Extend startup runway to 18 months**
   - Evidence: Median time to $1M ARR is 2 years 9 months
   - Implementation: Update startup-mixed.json default

### Medium Priority (Improves Realism)

4. **Add momentum/correlation term (AR(1))**
   - Evidence: Good months cluster, bad months cluster
   - Implementation: Store previous growth, blend with new draw

5. **Reduce enterprise base growth to 2-4%**
   - Evidence: 4.5% monthly = 69% annual, too aggressive for mature SaaS
   - Implementation: Update enterprise-sophisticated.json

6. **Add launch decay pattern for digital products**
   - Evidence: Gumroad/Etsy creator patterns
   - Implementation: New "digital_product" archetype or modifier

---

## 9. Source Bibliography

### Government/Statistical Sources
- U.S. Bureau of Labor Statistics. "1-year survival rates for new business establishments." 2024. https://www.bls.gov/opub/ted/2024/1-year-survival-rates-for-new-business-establishments-by-year-and-location.htm
- U.S. Bureau of Labor Statistics. "34.7 percent of business establishments born in 2013 were still operating in 2023." 2024. https://www.bls.gov/opub/ted/2024/34-7-percent-of-business-establishments-born-in-2013-were-still-operating-in-2023.htm

### Industry Reports
- ChartMogul. "SaaS Growth Report 2023." https://chartmogul.com/reports/saas-growth-report/
- DemandSage. "Startup Failure Rate Statistics 2026." https://www.demandsage.com/startup-failure-rate/

### Research Studies
- RockingWeb. "92% of Micro SaaS Fail Within 18 Months [2025 Survival Data]." https://www.rockingweb.com.au/18-month-rule-micro-saas-startup-failure-analysis/
- RockingWeb. "1,000 Micro SaaS Analysed: Real Revenue Data [2025 Study]." https://www.rockingweb.com.au/micro-saas-revenue-analysis-2025/

### Business Metrics
- Eleken. "Average SaaS Growth Rate in 2024: Brief Guide for Startups." https://www.eleken.co/blog-posts/average-saas-growth-rate-brief-guide-for-startups
- Klipfolio. "MoM MRR Growth Rate: The Definitive Guide for SaaS." https://www.klipfolio.com/resources/kpi-examples/saas/mom-mrr-growth
- Consero. "What Is a Good Monthly Recurring Revenue Growth Rate?" https://conseroglobal.com/resources/what-is-a-good-monthly-recurring-revenue-growth-rate-for-a-business/

### Side Hustle/Creator Economy
- Hostinger. "Side hustle statistics 2025: Income, trends & insights." https://www.hostinger.com/tutorials/side-hustle-statistics/
- Side Hustle Nation. "2021 Side Hustle Statistics and Survey Results." https://www.sidehustlenation.com/side-hustle-statistics/
- Accio. "Gumroad Trends 2025: Top Digital Products & Market Insights." https://www.accio.com/business/gumroad-trends

### Additional References
- LLC Attorney. "What Percentage of Businesses Fail in Their First Three Years?" https://www.llcattorney.com/small-business-blog/percentage-of-businesses-failed-in-first-three-years
- Lendio. "Understanding Small Business Survival and Failure Rates." https://www.lendio.com/blog/small-business-survival-and-failure-rates
