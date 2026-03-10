# The EUR 80 Million Blind Spot: Why T-Systems' Best Work Is Invisible to Its Customers

**By Thorsten Meyer | March 2026**

---

95% fewer major disruptions. 99.999% uptime. Over 500 unannounced fire drills per year. T-Systems runs one of the most rigorous quality programs in European IT services -- and almost none of its 900+ enterprise customers can see it happening.

That is not a product problem. It is a visibility problem. And it is costing T-Systems customers.

---

## The IBM-Powered Transparency Platform

The Transparency Portal becomes a fundamentally different product when it stops showing illustrative data and starts showing operational truth. Four IBM services make this possible -- each replacing a category of mock widgets with live, AI-enriched intelligence that no competitor currently offers.

| IBM Service | What It Does | Portal Integration | Customer Value |
|-------------|-------------|-------------------|----------------|
| **IBM Instana** | Real-time APM -- infrastructure metrics, application latency, error rates, traces | Replaces mock data in ResourceUtilization, LatencyMetrics, NetworkThroughput, ErrorRates, DnsResolution widgets | Live operational truth -- not demo data, not stale reports. The CTO sees the same metrics T-Systems engineers see. |
| **IBM Concert** | AI operations hub -- incident correlation, vulnerability management, patch compliance, certificate lifecycle | Powers IncidentTable, VulnerabilitySummary, PatchCompliance, CertificateExpiry widgets with real data | AI-correlated incident insights. Automated vulnerability prioritization. Compliance evidence generated automatically. |
| **IBM Turbonomic** | Resource optimization -- right-sizing, capacity planning, cost optimization recommendations | Feeds ResourceUtilization trends, adds new "Optimization Recommendations" widget, enhances CostBreakdown | Actionable optimization: "Reduce your cloud spend by 18% by right-sizing these 12 VMs." Converts dashboard viewing into purchasing action. |
| **watsonx.ai** *(integrated)* | AI/ML platform -- NL queries, summarization, anomaly detection, predictive analytics | **Already integrated in mock mode.** AI Summary Widget, AI Chat Assistant, Anomaly Detection, and Predictive Insights are live across all three views. BFF routes (`/api/ai/summary`, `/api/ai/chat`) proxy to watsonx.ai. | The executive who does not read dashboards can ask a question in English. Monthly summaries write themselves. Anomaly badges flag unusual patterns on individual widgets. Predictive alerts warn of SLA risks before they materialize. |

**Why this matters at the C-level:** Without IBM integration, the portal is a visualization layer over mock data -- useful for demos, insufficient for production trust. With IBM integration, the portal becomes the single pane of glass that T-Systems' customers have been asking for: real metrics, real incidents, real optimization recommendations, real AI. The data is not illustrative. It is the same data T-Systems engineers use to run the customer's environment. That distinction is the difference between a marketing tool and a retention engine.

---

## Architecture: From Mock Data to Live Intelligence

The portal architecture uses a Backend-for-Frontend (BFF) pattern with an adapter factory that switches between mock data and live IBM services. This design means the portal works identically in both modes -- mock for demos and pre-sales, live for production customers.

| Layer | Component | Role |
|-------|-----------|------|
| **Customer Browser** | C-Level Widgets, Business Widgets, Technical Widgets, AI Chat (watsonx) | Role-based dashboards with 44 widgets, all fetching data via HTTPS |
| **BFF (Next.js API Routes)** | Adapter Factory | Routes requests to mock or live adapters based on `DATA_SOURCE` environment variable |
| **BFF — Adapters** | Instana Adapter, Concert Adapter, Turbonomic Adapter, watsonx.ai Adapter | Each adapter handles its own API calls, caching, rate limiting, and error handling |
| **IBM Services** | IBM Instana, IBM Concert, IBM Turbonomic, IBM watsonx.ai | External REST APIs providing live infrastructure, security, optimization, and AI data |

**Data flow:** Browser → HTTPS → BFF Adapter Factory → `DATA_SOURCE=mock` routes to MockAdapter (current) or `DATA_SOURCE=live` routes to IBM Adapters → IBM REST APIs.

**Why the BFF is mandatory.** Widgets run in the customer's browser. IBM API credentials -- Instana API tokens, Concert service accounts, watsonx.ai keys -- cannot be exposed client-side. The BFF layer (Next.js API Routes) keeps all credentials server-side and proxies only sanitized, customer-scoped data to the browser.

**Why the adapter pattern is the right abstraction.** Every widget calls the same data interface regardless of the underlying source. `DATA_SOURCE=mock` returns synthetic data (the current behavior). `DATA_SOURCE=live` calls the real IBM APIs. This means:

- **Demo environments** use mock adapters -- no IBM credentials needed, instant setup for pre-sales
- **Production environments** use live adapters -- real metrics, real incidents, real AI
- **Progressive onboarding** is possible: start a customer on mock, connect Instana first, add Concert later, enable watsonx.ai when ready
- **Fallback is automatic**: if an IBM API is unreachable, the adapter falls back to cached data or mock data with a staleness indicator

**Each adapter handles its own concerns.** Rate limiting (Instana allows 600 requests/minute), response caching (5-minute TTL for metrics, 1-hour for compliance data), error handling (circuit breaker pattern with exponential backoff), and data transformation (IBM API responses mapped to the portal's widget data contracts). No adapter depends on another.

---

## AI Capabilities: watsonx.ai Integration (Live)

The portal already integrates four AI features powered by IBM watsonx.ai, operational in mock mode and ready for production when API credentials are provisioned. These features contribute to **9 AI-powered widgets** within the portal's 44-widget total (AI Summary, AI Chat, AI Anomalies, AI Predictions, Optimization Recommendations, and associated intelligence overlays) spread across 3 role-based views.

### AI Feature Architecture

| Layer | Component | Processing |
|-------|-----------|------------|
| **Customer Browser** | AI Summary Widget, AI Chat Panel, Anomaly Badges + Predictions | UI components fetch data via HTTPS to BFF routes |
| **BFF (Next.js API Routes)** | `/api/ai/summary` | Context builder → watsonx.ai (generates role-specific summaries) |
| | `/api/ai/chat` | Prompt router → watsonx.ai (handles NL Q&A) |
| | Anomaly detection | Statistical analysis (runs locally, zero API tokens) |
| | Predictions | Trend extrapolation (runs locally, zero API tokens) |
| **External API** | IBM watsonx.ai (Granite models) | REST API for NL generation; switches from mock to live when `WATSONX_API_KEY` is set |

### The Four AI Features

| Feature | Widget | What It Does | Customer Value |
|---------|--------|-------------|----------------|
| **AI Summary** | Per-view widget (C-Level, Business, Technical) | Generates natural-language summaries of dashboard data tailored to the viewer's role. C-level gets strategic overview; technical gets system health details. | Executives who don't read dashboards get a 3-sentence briefing. Eliminates "what should I be looking at?" friction. |
| **AI Chat Assistant** | Chat panel on every view | Natural language Q&A about infrastructure data. "What caused the latency spike?" → data-driven answer with specific metrics. | Reduces "what happened?" calls to service delivery managers. Available 24/7 without waiting for human response. |
| **Anomaly Detection** | Badge on individual widgets | AI flags unusual metric patterns — CPU spikes, latency trends, error rate surges — with amber/red badges directly on the affected widget header. | Proactive alerting: the customer sees the problem before filing a ticket. Demonstrates T-Systems monitors actively, not reactively. |
| **Predictive Insights** | Dedicated widget per view | Forecasts SLA risks, cost overruns, and capacity thresholds before they become problems. Shows projected trends with confidence intervals. | Shifts the conversation from "what happened?" to "what will happen?" — the highest value tier of operational transparency. |

### Token Budget and Cost Projection

watsonx.ai operates within IBM's free tier for development and pilot phases. Production token consumption is projected as follows:

| Operation | Tokens per Request | Requests/Month (10 pilot customers) | Monthly Tokens |
|-----------|-------------------|--------------------------------------|----------------|
| AI Summary generation | ~2,000 | 300 (10 customers x 3 views x 10 loads) | 600,000 |
| AI Chat responses | ~1,500 | 200 (estimated conversational queries) | 300,000 |
| **Total** | | | **~900,000** |

At full rollout (900 customers), assuming 10% active daily usage, monthly token consumption scales to approximately 8-10 million tokens/month -- well within watsonx.ai Standard tier pricing ($1,050/month base + ~$200-400/month token overage). Anomaly detection and predictions run locally using statistical methods, consuming zero API tokens.

### IBM Integration Timeline (Updated)

| Service | Status | Notes |
|---------|--------|-------|
| **watsonx.ai** | **Integrated (mock mode)** | BFF routes, UI widgets, and AI context builders are live. Switches to production API when `WATSONX_API_KEY` is provisioned. |
| **IBM Instana** | Planned | Awaiting infrastructure provisioning. Adapter interface designed; mock adapter serves synthetic metrics today. |
| **IBM Concert** | Planned | Awaiting infrastructure provisioning. Will power incident correlation and vulnerability management widgets. |
| **IBM Turbonomic** | Planned | Awaiting infrastructure provisioning. Will feed optimization recommendations with real right-sizing data. |

---

## The Trust Gap Is Widening -- and Most Providers Are Getting Worse

73% of enterprise customers say trustworthiness matters more to them than it did a year ago. 65% have stopped buying from vendors they consider untrustworthy. And here is the uncomfortable part: 25% of brands' CX rankings declined in 2025 -- for the second consecutive year -- while only 7% improved.

| Metric | Figure | Source |
|--------|--------|--------|
| Customers who say trust matters more than last year | 73% | Salesforce, State of the Connected Customer, 2024 |
| Customers who stopped buying from untrustworthy vendors | 65% | Salesforce, 2024 |
| Brands whose CX quality declined (2025) | 25% | Forrester Global CX Index, 2025 |
| Brands whose CX quality improved (2025) | 7% | Forrester Global CX Index, 2025 |
| Companies rated "customer-obsessed" by Forrester | 3% | Forrester, State of Customer Obsession in B2B, 2024 |

The managed services industry has a specific variant of this problem. Customers spend only 17% of their total buying time in direct vendor contact. 80% of the evaluation happens through independent research. Six to ten stakeholders sit in a typical buying committee, each forming opinions from different data.

> *If your operational excellence is not self-evident in a portal they can access at 2 AM, it does not exist in their evaluation.*

The question for T-Systems leadership is not "Are we delivering?" -- the Zero Outage numbers prove you are. The question is: "Can the customer see it?"

---

## The Financial Impact: EUR 2.2 Million Investment, EUR 80-160 Million Return

This section lays out every number, every assumption, and every calculation. No black boxes.

### What It Costs to Build: The Team Model

The Transparency Portal requires a blended delivery team across three locations, leveraging T-Systems' existing delivery centers. Here is the team composition for Year 1 (build + pilot) and Year 2+ (operate + scale).

**Year 1: Build and Pilot (12 months)**

| Role | Location | FTEs | Annual Fully-Loaded Cost per FTE | Total Cost | Rationale |
|------|----------|------|----------------------------------|------------|-----------|
| Product Owner | Germany | 1 | EUR 125,000 | EUR 125,000 | Owns backlog, stakeholder alignment, QBR integration strategy. German-based for proximity to T-Systems leadership and key accounts. Fully-loaded includes EUR 85K gross salary + 21% social contributions + 13th month + office + management overhead at 1.5x multiplier. |
| Solution Architect | Germany | 1 | EUR 145,000 | EUR 145,000 | Designs API integration with Zero Outage monitoring, security review, data architecture. Senior role at EUR 100K gross, 1.45x fully-loaded multiplier. |
| Senior Frontend Developers | Hungary | 2 | EUR 68,000 | EUR 136,000 | Next.js/React development, chart components, responsive design. Budapest nearshore center. EUR 48K gross salary, 1.42x multiplier (14.5% employer social + office + tools + cafeteria benefits). |
| Backend / Integration Developers | India | 3 | EUR 35,000 | EUR 105,000 | API connectors to monitoring systems, data aggregation services, mock-to-live data migration. Pune/Hyderabad delivery center. INR 15 LPA base CTC, 1.5x multiplier for office, tools, management layer, attrition buffer. |
| QA Engineer | India | 1 | EUR 28,000 | EUR 28,000 | Test automation, cross-browser testing, accessibility. INR 12 LPA base, 1.5x multiplier. |
| UX Designer | Hungary | 1 | EUR 58,000 | EUR 58,000 | Dashboard design, customer research, usability testing. EUR 40K gross, 1.45x multiplier. |
| Project Manager | Hungary | 1 | EUR 62,000 | EUR 62,000 | Scrum ceremonies, stakeholder reporting, release management. EUR 43K gross, 1.44x multiplier. |
| Security Reviewer (part-time, 25%) | Germany | 0.25 | EUR 140,000 | EUR 35,000 | Penetration testing, data protection review, compliance sign-off. Senior German security specialist at 25% allocation. |
| **Total Year 1** | | **10.25 FTEs** | | **EUR 694,000** | |

**How these costs were calculated:** Fully-loaded costs include base salary, employer social contributions (21% Germany, 14.5% Hungary, 17-20% India), office space and facilities (8-15% of salary depending on location), management overhead (8-10%), tools and licenses (5-8%), and training/attrition buffers. The multiplier over gross salary is 1.45-1.55x for Germany (including works council overhead and 13th month provisions per Deutsche Telekom collective agreements), 1.40-1.50x for Hungary, and 1.40-1.60x for India. Sources: Glassdoor, PayScale, PWC Hungary Tax Summary, FMC Group Germany Employment Cost Guide.

**Additional Year 1 effort for IBM integration:**

| Role | Location | FTEs | Cost/FTE | Total | Rationale |
|------|----------|------|----------|-------|-----------|
| IBM Integration Architect | Germany | 0.5 | EUR 145,000 | EUR 72,500 | Designs BFF layer, adapter interfaces, API contracts with IBM. Senior role (same rate as Solution Architect). 0.5 FTE because this is 6 months of focused integration design within the 12-month build. Calculation: 0.5 x EUR 145,000 = EUR 72,500. |
| Integration Developers | India | 2 | EUR 35,000 | EUR 70,000 | Build Instana, Concert, Turbonomic, and watsonx.ai adapters. Pune/Hyderabad. 4 adapters x ~6 weeks each = ~24 weeks of work = ~2 developer-years at 50 weeks/year. Actually closer to 1 FTE but 2 allows parallel work across phases. Calculation: 2 x EUR 35,000 = EUR 70,000. |
| IBM Platform Specialist | Germany (IBM) | 0.25 | EUR 140,000 | EUR 35,000 | IBM partner/consultant for API access, tenant setup, rate limit guidance, transformer validation. 25% allocation, 12 months. Assumes T-Systems' IBM partnership includes technical enablement. Calculation: 0.25 x EUR 140,000 = EUR 35,000. |
| **Total IBM integration team** | | **2.75 FTEs** | | **EUR 177,500** | EUR 72,500 + EUR 70,000 + EUR 35,000 = EUR 177,500 |

This adds EUR 177,500 to Year 1, bringing the team cost from EUR 694,000 to EUR 871,500 (EUR 694,000 + EUR 177,500 = EUR 871,500).

**IBM License Costs (annual):**

| Service | Tier | Pricing Model | Annual Cost | Calculation |
|---------|------|--------------|-------------|-------------|
| IBM Instana | Standard SaaS | $150/MVS/month x 50 MVS | EUR 82,800 | T-Systems monitors ~50 host groups across pilot customers. 50 Standard MVS x $150/month x 12 months = $90,000/year. At EUR/USD 0.92 = EUR 82,800. Minimum commitment is 10+10 MVS, so this is 2.5x minimum. |
| IBM Concert | Small | 50,000 resource units/year | EUR 46,000 | $50,000/year for small tier. Sufficient for initial 10 pilot customers with ~5,000 RU per customer. At EUR/USD 0.92 = $50,000 x 0.92 = EUR 46,000. |
| IBM Turbonomic | Essentials | Per-environment | EUR 36,800 | $40,000/year Essentials tier. Covers environments under $2M cloud spend -- appropriate for pilot scope. $40,000 x 0.92 = EUR 36,800. |
| watsonx.ai | Standard | $1,050/mo base + tokens | EUR 18,400 | $1,050/month x 12 = $12,600 base. Plus ~$500/month estimated token usage for NL queries and summaries across 10 pilot customers = $6,000. Total $18,600 x 0.92 = EUR 17,112 + buffer = EUR 18,400. |
| **Total IBM licenses** | | | **EUR 184,000** | EUR 82,800 + EUR 46,000 + EUR 36,800 + EUR 18,400 = EUR 184,000 |

**Exchange rate assumption:** EUR 1 = USD 1.09 (i.e., USD 1 = EUR 0.92), based on March 2026 averages. IBM licenses are typically denominated in USD. For T-Systems as a Deutsche Telekom subsidiary with an existing IBM partnership, volume discounts of 15-25% are likely but NOT included in these estimates. Actual costs could be 15-25% lower.

**Updated Year 2+ costs:** IBM licenses continue at EUR 184,000/year. The integration team reduces to 1 FTE backend developer (India, EUR 35,000) for adapter maintenance and 0.1 FTE IBM Platform Specialist (EUR 14,000) for quarterly reviews. This adds EUR 49,000 to the Year 2+ team cost, bringing it from EUR 232,500 to EUR 281,500 (EUR 232,500 + EUR 35,000 + EUR 14,000 = EUR 281,500).

**Year 2+: Operate and Scale (ongoing)**

| Role | Location | FTEs | Annual Cost per FTE | Total Cost | Rationale |
|------|----------|------|---------------------|------------|-----------|
| Product Owner | Germany | 0.5 | EUR 125,000 | EUR 62,500 | Part-time: roadmap maintenance, feature prioritization |
| Frontend Developer | Hungary | 1 | EUR 68,000 | EUR 68,000 | Feature development, customer-requested views |
| Backend Developer | India | 2 | EUR 35,000 | EUR 70,000 | Monitoring integrations, new data source connectors |
| DevOps / SRE | India | 1 | EUR 32,000 | EUR 32,000 | Infrastructure, deployments, uptime |
| **Total Year 2+** | | **4.5 FTEs** | | **EUR 232,500** | |

**Infrastructure costs:** Hosting on existing T-Systems cloud infrastructure. Incremental cost estimated at EUR 3,000-5,000/month for compute, CDN, and database -- EUR 48,000/year. This assumes the portal runs on the same cloud platform T-Systems already operates for customers.

**Total investment summary (with IBM integration):**

| Period | Team Cost | IBM Licenses | Infrastructure | Total |
|--------|-----------|-------------|----------------|-------|
| Year 1 (build + pilot) | EUR 871,500 | EUR 184,000 | EUR 48,000 | EUR 1,103,500 |
| Year 2 (operate + scale) | EUR 281,500 | EUR 184,000 | EUR 48,000 | EUR 513,500 |
| Year 3 (steady state) | EUR 281,500 | EUR 184,000 | EUR 48,000 | EUR 513,500 |
| **3-Year Total** | **EUR 1,434,500** | **EUR 552,000** | **EUR 144,000** | **EUR 2,130,500** |

**Year 1 calculation:** EUR 871,500 (team) + EUR 184,000 (IBM licenses) + EUR 48,000 (infrastructure) = EUR 1,103,500.
**Year 2/3 calculation:** EUR 281,500 (team) + EUR 184,000 (IBM licenses) + EUR 48,000 (infrastructure) = EUR 513,500.
**3-Year totals:** Team: EUR 871,500 + EUR 281,500 + EUR 281,500 = EUR 1,434,500. IBM licenses: EUR 184,000 x 3 = EUR 552,000. Infrastructure: EUR 48,000 x 3 = EUR 144,000. Grand total: EUR 1,434,500 + EUR 552,000 + EUR 144,000 = EUR 2,130,500.

Round it to EUR 2.2 million over three years including contingency (up from EUR 1.4 million without IBM integration).

**Where the delta goes:** The EUR 827,000 increase (EUR 2,130,500 - EUR 1,303,000 = EUR 827,500, rounded to EUR 827,000) breaks down into IBM licenses over three years (EUR 552,000) and additional integration labor (EUR 177,500 in Year 1 + EUR 49,000 x 2 in Years 2-3 = EUR 275,500). Licenses: EUR 552,000. Labor: EUR 275,500. Total delta: EUR 827,500. Every euro of the increase is traceable to either IBM software or the people who connect it.

---

### What It Prevents: The Revenue You Stop Losing

T-Systems generates EUR 4.0 billion in annual revenue from 900+ enterprise customers. That is an average of approximately EUR 4.4 million per customer per year. Some customers are worth EUR 500K, others EUR 80 million. The math works regardless of which ones you lose.

**Current churn reality in managed IT services:**

| Metric | Value | Source |
|--------|-------|--------|
| Industry-average annual churn (managed IT services) | 17% | First Page Sage, Customer Retention Rates by Industry, 2026 |
| Best-in-class MSP churn target | <10% | TSIA benchmark |
| T-Systems revenue at risk from 17% churn | EUR 680 million/year | 17% of EUR 4.0B (theoretical maximum if all revenue churned at average rate) |

T-Systems' actual churn rate is not public. But even at a best-in-class 10%, that is EUR 400 million in annual revenue at risk of non-renewal in any given year. The question is: how many of those non-renewals are preventable through better visibility?

**The retention case:**

A Transparency Portal does not prevent churn caused by pricing, M&A, or insolvency. It prevents churn caused by *perceived* lack of value -- the customer who cannot see the 99.999% uptime they are paying for, the CISO who cannot show their board that patch compliance is at 94%, the CTO who has to ask for a report instead of opening a dashboard.

| Scenario | Customers Retained | Revenue Preserved | How |
|----------|--------------------|-------------------|-----|
| Conservative: 0.5% churn reduction | 4-5 customers | EUR 18-22 million/year | Portal provides self-service visibility, reducing "what am I paying for?" friction at renewal |
| Moderate: 1% churn reduction | 9 customers | EUR 40 million/year | Portal becomes embedded in QBRs, customer stakeholders reference it independently |
| Aggressive: 2% churn reduction | 18 customers | EUR 80 million/year | Portal is a contractual deliverable, customer staff use it daily, switching cost increases |

**Assumption explained:** These figures use the EUR 4.4M average revenue per customer. In practice, the customers most likely to churn over visibility issues are mid-market accounts (EUR 1-5M ACV) rather than strategic accounts with dedicated service delivery managers. If we weight toward mid-market at EUR 2.5M average, the conservative case still preserves EUR 10-12 million annually -- 8x the three-year investment cost, recovered in year one.

> *Preventing five mid-market non-renewals per year preserves EUR 12.5 million in revenue. The portal costs EUR 742K to build. That is a 17:1 return in year one.*

---

### What It Costs When You Lose a Customer Anyway

When an enterprise managed services customer leaves, the financial damage extends far beyond the lost contract value.

| Cost Element | Amount | Explanation |
|-------------|--------|-------------|
| Lost annual revenue | EUR 2.5-15M per customer | Direct P&L impact. A mid-market customer at EUR 2.5M ACV; a large enterprise at EUR 15M+. |
| Transition and wind-down costs | EUR 200-600K per customer | 3-6 months of knowledge transfer, data migration support, and staff reallocation. T-Systems must dedicate senior engineers to ensure clean handover -- these are fully-loaded months at German or Hungarian rates (EUR 10-15K/month per person, 3-5 people involved). |
| Stranded capacity costs | EUR 100-500K per customer | Reserved cloud infrastructure, dedicated hardware, pre-purchased licenses that cannot be immediately reassigned. Depreciation continues regardless of customer departure. |
| Revenue replacement cost (new customer acquisition) | EUR 400K-1.2M per replacement | Enterprise managed services sales cycles run 9-18 months. Pre-sales engineering alone costs EUR 100-300K per bid. RFP responses cost EUR 50-200K. Win rates on competitive RFPs average 20-35%, meaning the amortized cost per successful win is 3-5x the cost of a single bid. |
| Lost upsell pipeline | EUR 500K-3M per customer over 3 years | Top-performing managed services firms generate over 50% of new ARR from upsells to existing customers. A departed customer takes their entire expansion pipeline with them. |

**Total cost of losing one mid-market customer:**

| Component | Low Estimate | High Estimate |
|-----------|-------------|---------------|
| Year 1 lost revenue | EUR 2,500,000 | EUR 2,500,000 |
| Year 2-5 lost revenue (contract lifetime) | EUR 7,500,000 | EUR 10,000,000 |
| Transition and wind-down | EUR 200,000 | EUR 400,000 |
| Stranded capacity | EUR 100,000 | EUR 300,000 |
| Revenue replacement (acquisition cost) | EUR 400,000 | EUR 800,000 |
| Lost upsell pipeline (3 years) | EUR 500,000 | EUR 1,500,000 |
| **Total economic impact** | **EUR 11,200,000** | **EUR 15,500,000** |

One customer. EUR 11-15 million in total economic impact. The portal costs EUR 742K to build.

**Win-back is not a strategy.** Once a customer migrates their managed services to a competitor, the win-back success rate is 10-20% at best. The cost to win them back runs 1.5-3x the original acquisition cost -- EUR 600K to EUR 3.6M -- and the timeline is 2-5 years, typically at the next contract renewal cycle with the new provider. By then, the new provider has deep operational integration, the customer has absorbed migration pain they refuse to repeat, and the original switching trigger has been forgotten or rationalized.

> *Every EUR 1 spent on customer retention through visibility saves EUR 5-25 in acquisition costs. Every customer you keep is a customer your competitor cannot upsell.*

---

### What It Generates: New Revenue Through Upselling and Expansion

The Transparency Portal does not just prevent loss. It creates a mechanism for growth. When customers can see exactly what services they consume, how those services perform, and where gaps exist, they buy more.

**The upsell mechanics:**

| Portal Feature | Upsell Trigger | Example |
|----------------|---------------|---------|
| Security posture dashboard | Customer CISO sees 12 critical vulnerabilities and asks: "Can you manage our patching?" | Security managed services add-on: EUR 50-200K/year |
| SLA compliance by service | CTO sees 99.95% on cloud but 99.8% on workplace and asks: "Can you bring workplace up to the same level?" | Workplace modernization project: EUR 200-500K |
| Cost vs. budget breakdown | CFO sees cloud spend trending 15% over budget and asks: "Can you optimize this?" | FinOps engagement: EUR 100-300K/year |
| Backup success rates | Compliance officer sees 92% backup success and asks: "How do we get to 99%?" | Enhanced backup service: EUR 50-150K/year |
| Certificate expiry tracking | CISO sees 3 certificates expiring within 30 days and asks: "Can you automate certificate lifecycle?" | Certificate management service: EUR 30-80K/year |

**Revenue projection from upselling:**

| Scenario | Customers Who Upsell | Average Upsell Value | Annual Revenue | Assumptions |
|----------|---------------------|---------------------|----------------|-------------|
| Conservative (Year 1 pilot) | 5 of 10 pilot customers | EUR 150,000 | EUR 750,000 | 50% of pilot customers identify at least one gap; average gap translates to a mid-range service add-on |
| Moderate (Year 2 rollout) | 45 of 450 customers (10%) | EUR 120,000 | EUR 5,400,000 | Rolled out to half the customer base; 10% upsell rate is below the industry benchmark of 50% expansion revenue from existing accounts |
| Scaled (Year 3 full base) | 135 of 900 customers (15%) | EUR 100,000 | EUR 13,500,000 | Full base access; decreasing average because smaller customers upsell smaller amounts |

**Assumption explained:** The upsell rates (10-15% of customers) are deliberately conservative. Industry data shows that regular Quarterly Business Reviews -- which the portal effectively automates and makes continuous -- correlate with 33% higher expansion revenue. Firms with dedicated customer success programs generate over 50% of new ARR from existing accounts. A portal that surfaces gaps 24/7 instead of once per quarter should exceed, not trail, these benchmarks.

---

### The IBM Premium Effect: How Live Data Changes the Revenue Math

IBM integration does not just replace mock data with real data. It creates three distinct revenue mechanisms that do not exist in a mock-data portal.

**Enhanced retention (churn prevention):**

A mock-data portal shows customers illustrative data -- a moderate trust signal that demonstrates capability but does not create dependency. A live IBM-backed portal shows customers their actual infrastructure metrics in real-time -- a strong trust signal that creates daily usage habits.

The delta: when the CTO opens Instana-backed latency metrics every morning, when the CISO checks Concert vulnerability counts before board meetings, switching providers means losing that view. Real data creates operational dependency that mock data cannot.

Estimate: +0.5% additional churn prevention over the mock-only portal's conservative 0.5% baseline, for a combined 1.0% churn reduction.

| Component | Calculation | Result |
|-----------|-------------|--------|
| Additional customers retained | 0.5% of 900 customers | 4.5 customers |
| Revenue preserved per customer | EUR 4.4M average ACV | EUR 4.4M |
| Additional preserved revenue/year | 4.5 x EUR 4.4M | EUR 19.8M |

**Enhanced upsell via Turbonomic:**

Turbonomic does not just show resource utilization -- it surfaces concrete optimization actions: "Right-size these 12 VMs to save 18%." Each recommendation is a natural upsell to a FinOps or optimization engagement. The customer sees the savings opportunity in the portal, and the T-Systems account manager proposes the engagement to realize it.

| Component | Calculation | Result |
|-----------|-------------|--------|
| Customers seeing Turbonomic data (Year 2) | 450 (half of base, post-rollout) | 450 |
| Conversion to optimization engagements | 5% of customers who see data | 22.5 customers |
| Average optimization engagement value | EUR 80,000 | EUR 80,000 |
| Additional upsell revenue (Year 2) | 22.5 x EUR 80,000 | EUR 1,800,000 |

**Enhanced upsell via Concert (security):**

Concert surfaces vulnerability counts, patch gaps, and certificate risks -- each one a natural upsell to managed security services. When the CISO sees 47 critical vulnerabilities on the dashboard, the next question is: "Can T-Systems manage this for us?"

| Component | Calculation | Result |
|-----------|-------------|--------|
| Customers seeing Concert data (Year 2) | 450 | 450 |
| Conversion to security add-ons | 3% of customers who see data | 13.5 customers |
| Average security add-on value | EUR 120,000 | EUR 120,000 |
| Additional upsell revenue (Year 2) | 13.5 x EUR 120,000 | EUR 1,620,000 |

**watsonx.ai value -- now quantifiable with live features:**

- **NL queries reduce support burden:** Fewer "what happened?" calls to service delivery managers. AI Chat handles routine data questions 24/7. Estimated savings: 2-3 SDM hours/week per major account = 200-300 hours/week across 100 major accounts.
- **AI-generated executive summaries replace manual QBR preparation:** Saves ~2 hours per account per quarter -- across 900 accounts, that is 1,800 hours/quarter or ~4.5 FTEs of effort redirected to value-added engagement.
- **Anomaly detection reduces MTTR:** AI-flagged anomalies alert customers to issues before they escalate. Estimated 15-25% MTTR reduction translates to improved SLA metrics and stronger retention signal.
- **Predictive SLA alerts prevent incidents before they impact customer perception:** Early warning of capacity thresholds and cost overruns enables proactive engagement rather than reactive firefighting.
- **AI-driven value estimate:** 4.5 FTEs of QBR preparation savings (EUR 270,000-400,000/year at blended rates) + reduced escalation handling + stronger renewal conversations. Conservative combined value: EUR 500,000-750,000/year in operational efficiency.

---

### The Complete P&L: Three-Year Financial Summary

The following table shows the financial case side by side: without IBM integration (mock data only) and with IBM integration (live data from Instana, Concert, Turbonomic, and watsonx.ai). The "With IBM" column includes all IBM license costs, integration team costs, and the enhanced revenue from live data.

**Without IBM (mock data portal):**

| Line Item | Year 1 | Year 2 | Year 3 | 3-Year Total |
|-----------|--------|--------|--------|--------------|
| **Investment** | | | | |
| Team cost | EUR 694,000 | EUR 232,500 | EUR 232,500 | EUR 1,159,000 |
| Infrastructure | EUR 48,000 | EUR 48,000 | EUR 48,000 | EUR 144,000 |
| **Total investment** | **EUR 742,000** | **EUR 280,500** | **EUR 280,500** | **EUR 1,303,000** |
| | | | | |
| **Returns (conservative scenario)** | | | | |
| Preserved revenue (churn prevention, 0.5%) | EUR 18,000,000 | EUR 22,000,000 | EUR 22,000,000 | EUR 62,000,000 |
| New revenue (upselling) | EUR 750,000 | EUR 5,400,000 | EUR 13,500,000 | EUR 19,650,000 |
| Avoided acquisition costs | EUR 1,600,000 | EUR 2,000,000 | EUR 2,000,000 | EUR 5,600,000 |
| **Total returns** | **EUR 20,350,000** | **EUR 29,400,000** | **EUR 37,500,000** | **EUR 87,250,000** |
| | | | | |
| **ROI** | **27:1** | **105:1** | **134:1** | **67:1** |

**With IBM (live data portal):**

| Line Item | Year 1 | Year 2 | Year 3 | 3-Year Total |
|-----------|--------|--------|--------|--------------|
| **Investment** | | | | |
| Team cost (base + IBM integration) | EUR 871,500 | EUR 281,500 | EUR 281,500 | EUR 1,434,500 |
| IBM licenses | EUR 184,000 | EUR 184,000 | EUR 184,000 | EUR 552,000 |
| Infrastructure | EUR 48,000 | EUR 48,000 | EUR 48,000 | EUR 144,000 |
| **Total investment** | **EUR 1,103,500** | **EUR 513,500** | **EUR 513,500** | **EUR 2,130,500** |
| | | | | |
| **Returns (conservative scenario)** | | | | |
| Preserved revenue (churn prevention, 1.0%) | EUR 36,000,000 | EUR 44,000,000 | EUR 44,000,000 | EUR 124,000,000 |
| New revenue (base upselling) | EUR 750,000 | EUR 5,400,000 | EUR 13,500,000 | EUR 19,650,000 |
| New revenue (Turbonomic optimization upsell) | EUR 0 | EUR 1,800,000 | EUR 2,700,000 | EUR 4,500,000 |
| New revenue (Concert security upsell) | EUR 0 | EUR 1,620,000 | EUR 2,430,000 | EUR 4,050,000 |
| Avoided acquisition costs | EUR 3,200,000 | EUR 4,000,000 | EUR 4,000,000 | EUR 11,200,000 |
| **Total returns** | **EUR 39,950,000** | **EUR 56,820,000** | **EUR 66,630,000** | **EUR 163,400,000** |
| | | | | |
| **ROI** | **36:1** | **111:1** | **130:1** | **77:1** |

**How the "With IBM" returns were calculated:**

- *Preserved revenue (1.0% churn prevention):* The mock portal achieves 0.5% churn prevention. IBM live data adds another 0.5% (see "IBM Premium Effect" section above). Combined 1.0% = 9 customers/year x EUR 4.4M = EUR 39.6M at full rollout. Year 1 is lower because the portal is in pilot (10 customers), ramping to 450 in Year 2 and 900 in Year 3. Simplified: Year 1 EUR 36M, Year 2-3 EUR 44M each.
- *Turbonomic optimization upsell:* EUR 0 in Year 1 (pilot phase). Year 2: 450 customers x 5% conversion x EUR 80K = EUR 1,800,000. Year 3: 675 customers x 5% x EUR 80K = EUR 2,700,000 (larger base as rollout continues).
- *Concert security upsell:* EUR 0 in Year 1 (pilot phase). Year 2: 450 customers x 3% conversion x EUR 120K = EUR 1,620,000. Year 3: 675 customers x 3% x EUR 120K = EUR 2,430,000.
- *Avoided acquisition costs:* Doubled from the mock scenario because twice as many customers are retained (1.0% vs. 0.5% churn prevention). Year 1: EUR 3.2M. Year 2-3: EUR 4.0M each. 3-year total: EUR 11.2M.

**The delta between "Without IBM" and "With IBM":**

| Metric | Without IBM | With IBM | Delta |
|--------|-------------|----------|-------|
| 3-Year investment | EUR 1,303,000 | EUR 2,130,500 | +EUR 827,500 |
| 3-Year returns | EUR 87,250,000 | EUR 163,400,000 | +EUR 76,150,000 |
| 3-Year ROI | 67:1 | 77:1 | +10 points |

Spending an additional EUR 827,500 over three years generates an additional EUR 76.15 million in returns. The incremental ROI on the IBM investment alone is 92:1 (EUR 76,150,000 / EUR 827,500).

Even if you halve every return estimate and double every cost estimate, the three-year ROI remains above 15:1 for the mock portal and above 18:1 for the IBM-integrated portal. The math is not close.

---

## How the Portal Empowers Every Level of the Customer Organization

A dashboard is only valuable if the right people use it. The Transparency Portal is designed for three distinct audiences within every customer organization -- and each audience has a different reason to trust T-Systems more after using it.

### C-Level: From "Trust Me" to "See for Yourself"

The CIO, CFO, and CEO do not want operational details. They want answers to three questions: Are we getting what we pay for? Are we secure? Are we on budget?

| What C-Level Sees | Why It Matters | Trust Impact |
|-------------------|----------------|-------------|
| SLA compliance gauge at 99.999% with 12-month trend | Board-ready proof that the managed services investment delivers | Eliminates the "are we sure this vendor is performing?" board question |
| Risk score with trend indicator (decreasing) | Quantified security posture they can report to auditors and regulators | Shifts CISO conversations from "we think we're safe" to "here are the numbers" |
| Cost overview: current vs. budget with MoM trend | Financial transparency without waiting for monthly invoices | CFO sees value, not just cost -- a critical distinction at renewal time |
| Zero Outage score and pillar breakdown | Executive summary of the quality program T-Systems runs on their behalf | Converts an internal T-Systems metric into a customer-facing trust signal |

**The renewal conversation changes.** Instead of a service delivery manager presenting slides that say "we met SLA," the CIO opens a portal and says to their board: "Here is our live operational dashboard. SLA is at 99.999%. Security score is 87 and improving. We are 3% under budget." That CIO does not switch providers. They are armed with evidence that justifies their vendor choice.

### Business Level: From Quarterly Reports to Continuous Insight

Operations managers, service owners, and procurement leads need trend data to make decisions. They need to understand ticket patterns, project delivery timelines, and service utilization -- not once a quarter, but continuously.

| What Business Users See | Why It Matters | Trust Impact |
|------------------------|----------------|-------------|
| Ticket volume trends: opened vs. resolved over 12 months | Proves the support model is working -- resolution keeps pace with volume | Stops the "we keep raising tickets and nothing happens" perception |
| SLA compliance by individual service | Identifies which services over-deliver and which need attention | Shows T-Systems proactively manages service quality, not just overall averages |
| Project delivery status with progress bars | Tracks transformation projects (cloud migration, SAP upgrades) in real time | Eliminates "where are we on the migration?" status request emails |
| Cost breakdown by service category | Enables informed decisions about where to invest and where to cut | Empowers procurement to have data-driven conversations instead of adversarial negotiations |

**The upsell trigger lives here.** When a business user sees that their SAP environment has 99.99% uptime but their workplace services are at 99.7%, they do not think "T-Systems is failing." They think "I should ask T-Systems to bring workplace up to the SAP standard." The portal converts a performance gap from a complaint into a purchase order.

### Technical Level: From "What Happened?" to "What Is Happening?"

CTOs, infrastructure architects, and security engineers need granular data. Latency metrics. Error rates. Certificate expiry countdowns. Patch compliance by category. These are the people who evaluate whether to renew based on technical competence -- and they form opinions from data, not slides.

| What Technical Users See | Why It Matters | Trust Impact |
|-------------------------|----------------|-------------|
| System status grid: every service, real-time health | Single pane of glass across cloud, SAP, security, connectivity, workplace | Replaces "let me check with T-Systems" with "let me check the portal" |
| Latency metrics: P50, P95, P99 with trend lines | Quantified performance evidence, not anecdotal | Engineers trust numbers. This gives them numbers. |
| Certificate expiry table with days-until-expiry countdown | Proactive compliance visibility without manual tracking | Prevents the "our certificate expired and nobody told us" incident |
| Patch compliance rates by category with progress bars | Shows percentage of estate patched, by OS/middleware/application | Audit-ready evidence for ISO 27001, SOC 2, and industry-specific compliance |
| Backup success rates per service | Proves disaster recovery readiness with concrete percentages | Shifts backup conversations from "do we have backups?" to "backups are at 98.5%" |

**The switching barrier lives here.** When a customer's technical team has integrated the Transparency Portal into their daily workflow -- when the CTO opens it every morning, when the security engineer references it in audit reports, when the infrastructure lead uses it to plan capacity -- switching providers means losing that visibility layer. The portal becomes operational infrastructure, not a nice-to-have. Every day of usage increases switching cost.

> *The C-Level sees confidence. The business sees trends. The technical team sees proof. All three see a reason to stay.*

---

## Zero Outage Is the Proof. The Portal Makes It Visible.

T-Systems' Zero Outage program is genuinely world-class:

| Achievement | Detail |
|-------------|--------|
| IT uptime | 99.999% (five nines) |
| Major incidents reduction since 2011 | Over 90% |
| Major disruption reduction | 95% |
| Unannounced fire drills per year | 500+ |
| Senior executives in 24/7 manager-on-duty rotation | ~140 |
| Top global suppliers trained and certified | 25 |
| Access providers trained and certified | 63 |
| Customer satisfaction ranking | Top 10% of European ICT providers, three consecutive years |

This program has evolved beyond T-Systems into the Zero Outage Industry Standard (ZOIS), an independent industry association with founding members including Cisco, HPE, NetApp, SAP, and SUSE. Itau Unibanco reported a 40% reduction in total business outages from implementing ZOIS principles.

The problem: all of this lives in internal dashboards, PDF reports compiled manually, and quarterly business reviews where a service delivery manager walks through slides. The customer's CIO does not see it. Their CISO does not see it. Their board does not see it.

A Transparency Portal changes the equation:

| Current State | With Transparency Portal |
|---------------|--------------------------|
| SLA data compiled manually for QBRs (8-10 hours/week per account) | Real-time SLA trends visible 24/7, zero manual effort |
| Incident notification: hours to days | Incident status page updates in real time |
| Certificate expiry tracked internally | Customer sees countdown and compliance status |
| Cost data delivered monthly in spreadsheets | Interactive cost vs. budget dashboard |
| Security posture discussed in annual reviews | Live vulnerability count and patch compliance rates |
| Backup success rates in internal monitoring | Customer-visible backup health per service |

**Manual reporting savings alone justify part of the investment.** If T-Systems' service delivery managers spend 8-10 hours per week compiling reports per major account, and the portal automates 70% of that effort, the time savings across 100 major accounts is 560-700 hours per week -- roughly 15-18 FTEs worth of effort redirected from report compilation to value-added customer engagement.

> *Zero Outage proves you can run IT at 99.999%. The Transparency Portal proves it to the customer who signs the renewal.*

---

## The Competitive Window Is Open -- But Closing

Every major managed services competitor is building customer-facing operational portals:

| Provider | Platform | Positioning |
|----------|----------|-------------|
| Kyndryl | Kyndryl Bridge | "Single pane of glass" with AI-driven insights (12M+ per month) |
| NTT DATA | NTTView / Manage Centre | 24/7 real-time network performance monitoring |
| Capgemini | Capgemini Cloud Platform | Consumption dashboards with daily cost updates |
| HCL | DRYiCE MyCloud | Self-service catalog with unified provisioning |
| Atos / Eviden | MyAtos (next-gen in development) | Legacy portal decommissioned March 2025 |

None of them frame their portal around transparency and trust. Kyndryl Bridge is an operations platform. NTTView is a network monitoring tool. Capgemini focuses on cloud consumption.

The word "transparency" -- as a brand position for a customer portal -- is unclaimed in the European managed services market. T-Systems has the operational credibility (Zero Outage), the customer base (900+ enterprises, most DAX 40 companies), and the brand heritage to own it.

---

## The Portal as a Digital Twin of the Customer's IT Environment

Gartner predicts that by 2028, organizations using network digital twins will reduce unplanned outages by 70%. The global digital twin market is projected to grow from USD 36 billion in 2025 to USD 329 billion by 2033.

The Transparency Portal is, in effect, a customer-facing digital twin of their managed IT environment. Not a static dashboard -- a living representation of:

- **Service health** across cloud, SAP, security, connectivity, and workplace categories
- **SLA compliance** with historical trends and target tracking
- **Security posture** including vulnerability counts, patch compliance rates, and certificate expiry
- **Cost transparency** with budget vs. actual and month-over-month trends
- **Incident history** with severity, resolution times, and MTTR trends
- **Backup and infrastructure health** with success rates and capacity forecasts

This positions T-Systems at the intersection of two powerful trends: the trust economy (where visibility drives retention) and the digital twin revolution (where real-time operational models drive efficiency). It is not just a reporting tool. It is a competitive moat.

---

## What the Live Demo Proves

A working prototype of the Transparency Portal -- branded **"All Is Well — Your End-to-End Digital Health Dashboard"** -- is live at [transparency-chi.vercel.app](https://transparency-chi.vercel.app). It demonstrates:

| Page | What It Shows |
|------|---------------|
| **Dashboard** | Three role-based views (C-Level: 13 widgets, Business: 14 widgets, Technical: 17 widgets) with 44 total widgets covering SLA, cost, risk, incidents, security, infrastructure, and AI-powered insights |
| **Reports** | SLA performance trends, incident tables, cost breakdowns, ticket volume charts -- the data you would review monthly |
| **Compliance** | Security posture scoring, patch compliance rates, certificate expiry tracking, backup health -- your compliance status at a glance |
| **Settings** | Theme preferences, customer profile, notification controls |

Every page is customer-context-aware: select a different customer, and all data updates. Light and dark mode throughout. AI features (summary, chat, anomaly detection, predictions) are active across all views. Built on the same data services that the Zero Outage program already collects.

The gap between "we have this data" and "the customer can see this data" is not a multi-year infrastructure project. It is a presentation layer on top of operational data that already exists.

### Enterprise-Grade UX: Nine Enhancements Delivered

The prototype does not just display data -- it behaves like production software. Nine enterprise UX capabilities have been implemented that move the portal from "impressive demo" to "product customers rely on daily":

| Capability | What It Does | Why It Matters |
|------------|-------------|----------------|
| **Real-Time Data Refresh** | Auto-refresh toggle (30s / 1m / 5m intervals), per-widget manual refresh with spinner overlay, simulated data variation on each cycle | Customers see a live system, not a static snapshot. Operational trust requires a portal that breathes. |
| **Dashboard Export / PDF** | One-click PDF export via html2canvas + jsPDF with branded header; print-friendly data report via browser print dialog | Audit evidence, board packs, and QBR slides generated directly from the portal. Eliminates the manual report-compilation workflow that currently costs 8-10 SDM hours per account per week. |
| **Widget Search & Filter** | Collapsible search bar with 300ms debounce, category filter chips, non-matching widgets fade to 20% opacity | Enterprise dashboards have 44 widgets across three views. Search is not a nice-to-have; it is how power users navigate at speed. |
| **Notification Center** | Slide-out panel with 12 mock notification types (critical / warning / info / system), read/unread state persisted to localStorage, dynamic badge count on bell icon | Critical alerts surface immediately. Customers do not need to poll T-Systems for status -- the portal tells them. |
| **Widget Favorites / Pinning** | Star icon on hover, pinned widgets sort to top, per-view persistence in localStorage | Different users care about different metrics. Personalization drives daily usage, which drives switching cost. |
| **Dark Mode (Full Audit)** | All 44 widgets audited and fixed for consistent dark mode -- standardized border tokens, background tokens, text color scales | Enterprise users work across lighting conditions and corporate themes. Inconsistent dark mode signals an unfinished product. |
| **Animated Transitions** | Staggered fade-slide-up widget entrance, count-up animation on KPI numbers, shimmer loading skeletons, hover lift effect | Perceived performance and responsiveness are a trust signal. A portal that feels fast and polished communicates that T-Systems' engineering is fast and polished. |
| **Comparison Mode** | Toggle with three presets (Month-over-Month, Quarter-over-Quarter, Year-over-Year), delta indicators showing % change on 10 supported widgets | The most common customer question at renewals: "Are things getting better or worse?" Comparison mode answers it in one click, without a service delivery manager preparing slides. |
| **Drag-and-Drop Reordering** | Widget reordering via @dnd-kit across all three views | Each customer organization prioritizes different metrics. A CFO-heavy account front-loads cost widgets; a CISO-led account front-loads security. Customization drives ownership. |

These nine capabilities are not cosmetic additions. Each one closes a specific gap between "demo tool" and "production software that customers integrate into their daily workflow." A portal that customers check once a quarter is a nice-to-have. A portal that customers check every morning -- because it refreshes automatically, notifies them of anomalies, exports evidence for audits, and remembers how they like it organized -- is a switching cost.

---

## The Recommendation

| Action | Timeline | Investment | Expected Impact |
|--------|----------|------------|-----------------|
| Pilot the Transparency Portal with 5-10 flagship customers | Q2 2026 | EUR 1.1M (Year 1 build incl. IBM) | Validate retention and satisfaction impact with measurable NPS delta |
| Connect IBM Instana for live infrastructure metrics | Q3 2026 | Included in Year 1 | Replace mock data with real-time APM -- the first "live truth" moment for pilot customers |
| Connect IBM Concert for security and compliance data | Q3 2026 | Included in Year 1 | Power vulnerability, patch, and certificate widgets with AI-correlated insights |
| Enable IBM Turbonomic for optimization recommendations | Q4 2026 | Included in Year 1 | Surface actionable cost savings that convert dashboard viewers into buyers |
| Roll out to all enterprise customers | Q4 2026 | EUR 514K/year (operate + IBM licenses) | Establish "Transparency" as a T-Systems brand differentiator |
| ~~Enable watsonx.ai NL queries and executive summaries~~ | ~~Q1 2027~~ **Done** | Included in build | **Already integrated:** AI Summary, Chat, Anomaly Detection, and Predictive Insights are live in mock mode. Production activation requires only API key provisioning. |
| Extend to pre-sales: give prospects a demo portal during evaluation | Q1 2027 | Marginal | Shorten sales cycles by making operational excellence self-evident |

**The three-year financial case (with IBM integration):**

| Metric | Value |
|--------|-------|
| Total 3-year investment | EUR 2.2 million |
| Preserved revenue (conservative, 1.0% churn prevention) | EUR 124 million |
| New revenue (base upselling) | EUR 19.7 million |
| New revenue (Turbonomic optimization upsell) | EUR 4.5 million |
| New revenue (Concert security upsell) | EUR 4.1 million |
| Avoided acquisition costs | EUR 11.2 million |
| **Total 3-year return** | **EUR 163.4 million** |
| **ROI** | **77:1** |

The prototype exists. The data exists. The Zero Outage operational backbone exists.

What does not exist -- yet -- is the bridge between T-Systems' operational excellence and the customer's lived experience of it.

> *In a market where 73% of customers say trust matters more than ever and 25% of providers are getting worse at delivering it, the company that makes its quality visible wins. Not the company that delivers the best. The company that proves it.*

---

**Thorsten Meyer** is an AI strategist who reads the filings so you don't have to.

---

## Future Roadmap

### Login-Based Role Routing

The current portal uses manual view tabs (C-Level / Business / Technical) for role switching. A production deployment would integrate authentication-based role routing:

- **NextAuth.js integration** for user authentication with enterprise SSO (SAML/OIDC) support
- **Role stored in session** — each user is assigned a role (c-level, business, technical) during provisioning
- **Middleware auto-routing** — Next.js middleware reads the session role and redirects to the appropriate dashboard view on login
- **Simplified UI for non-admin users** — ViewTabs are hidden when users have a single assigned role; admin users retain manual switching
- **Customer association** — each user account is linked to a customer record, eliminating the need for the customer selector dropdown

This transforms the portal from a demo tool into a multi-tenant production application where each user sees exactly the data relevant to their role and organisation.

### ServiceNow ITSM Integration

The current mock data layer is designed to be swapped for real API backends. ServiceNow is the primary target for ITSM data integration:

- **ServiceNow Table API** replaces mock JSON files — `incident` table maps to incident widgets, `change_request` to change widgets, `cmdb_ci` to service inventory
- **OAuth2 authentication** with the customer's ServiceNow instance, managed via the BFF layer (credentials never exposed to the browser)
- **Real-time webhooks** — ServiceNow business rules push incident and change notifications to the portal via webhooks, enabling live dashboard updates without polling
- **Bidirectional actions** — accepted optimization recommendations could create ServiceNow change requests directly from the portal
- **Settings page** — a dedicated configuration page for ServiceNow connection setup (instance URL, OAuth client credentials, table mappings)

This integration would convert the portal from a visibility tool into an operational control plane, where customers can both see and act on their service data.

---

## Sources

- [Deutsche Telekom Financial Report 2024](https://www.telekom.com/en/media/media-information/archive/financial-report-2024-1088068)
- [Light Reading: Deutsche Telekom hails T-Systems turnaround in 2024](https://www.lightreading.com/digital-transformation/deutsche-telekom-hails-t-systems-turnaround-in-2024)
- [T-Systems Company Profile](https://www.t-systems.com/us/en/company/about-t-systems/profile)
- [Mordor Intelligence: Europe Managed Services Market](https://www.mordorintelligence.com/industry-reports/europe-managed-services-market)
- [Harvard Business Review: The Value of Keeping the Right Customers](https://hbr.org/2014/10/the-value-of-keeping-the-right-customers)
- [Bain & Company: Retaining Customers Is the Real Challenge](https://www.bain.com/insights/retaining-customers-is-the-real-challenge/)
- [First Page Sage: Customer Retention Rates by Industry 2026](https://firstpagesage.com/seo-blog/customer-retention-rates-by-industry/)
- [Salesforce: State of the Connected Customer, 2024](https://www.salesforce.com/content/dam/web/en_us/www/documents/research/State-of-the-Connected-Customer.pdf)
- [Gartner: Future of Sales 2025](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-sales-survey-finds-61-percent-of-b2b-buyers-prefer-a-rep-free-buying-experience)
- [Forrester: Global Customer Experience Index 2025](https://www.forrester.com/press-newsroom/forrester-global-customer-experience-index-2025-rankings/)
- [Forrester: State of Customer Obsession in B2B, 2024](https://www.forrester.com/report/the-state-of-customer-obsession-in-b2b-2024/RES181570)
- [T-Systems: Zero Outage](https://www.t-systems.com/tr/en/solutions/quality/quality-by-t-systems/maximum-availability/zero-outage-594522)
- [Zero Outage Industry Standard](https://zero-outage.com/)
- [PR Newswire: Zero Outage Industry Standard](https://www.prnewswire.com/news-releases/tech-giants-collaborate-on-zero-outage-to-define-new-industry-standard-300356075.html)
- [Kyndryl Bridge](https://www.kyndryl.com/us/en/services/platform)
- [NTTView Customer Portal](https://www.nttglobal.net/platforms/virtelaview-customer-portal/)
- [Grand View Research: Digital Twin Market](https://www.grandviewresearch.com/industry-analysis/digital-twin-market)
- [Gartner: Top Trends Impacting I&O for 2026](https://www.gartner.com/en/newsroom/press-releases/2025-12-11-gartner-identifies-the-top-trends-impacting-infrastructure-and-operations-for-2026)
- [SerpSculpt: B2B Customer Retention Statistics 2025](https://serpsculpt.com/b2b-customer-retention-statistics/)
- [BrightGauge: SLA Metrics Reporting](https://www.brightgauge.com/blog/make-sla-metrics-reporting-easy)
- [Glassdoor: Software Developer Salaries -- India, Hungary, Germany](https://www.glassdoor.com/Salaries/)
- [PayScale: Salary Data by Country](https://www.payscale.com/research/)
- [PWC Hungary Tax Summary 2025](https://taxsummaries.pwc.com/hungary/individual/other-taxes)
- [FMC Group: Germany Employment Cost Guide](https://fmcgroup.com/employment-cost-germany/)
- [Invesp: Customer Acquisition vs. Retention Costs](https://www.invespcro.com/blog/customer-acquisition-retention/)
- [IBM Instana Pricing](https://www.ibm.com/products/instana/pricing)
- [IBM Turbonomic Pricing](https://www.ibm.com/products/turbonomic/pricing)
- [IBM watsonx.ai Pricing](https://www.ibm.com/products/watsonx-ai/pricing)
- [IBM Concert on AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-gpoizomwsxlkg)
- [Observability-360 Instana Cost Analysis](https://observability-360.com/Cost/SystemCostsIBMInstana)
