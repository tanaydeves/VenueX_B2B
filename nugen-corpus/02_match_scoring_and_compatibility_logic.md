# VenueX Domain Corpus: Match Scoring Architecture & Compatibility Reasoning

## 1. Overview of Compatibility Evaluation
The VenueX Matching Engine computes a composite compatibility score (0 to 100) between a Seeker's structured resource request and a Provider's active listing. The matching architecture synthesizes 6 deterministic and probabilistic operational vectors to guarantee high fulfillment reliability in time-critical hospitality environments.

## 2. Weighted Compatibility Scoring Dimensions

| Dimension | Weight | Mathematical Basis & Evaluation Logic |
| :--- | :--- | :--- |
| **Category & Asset Subtype Fit** | **25%** | Exact match on asset taxonomy yields 100%. Direct functional substitute (e.g. Banquet Stacking Chair for Chiavari Chair) yields 75%. Mismatched categories receive 20%. |
| **Quantity & Available Reserve Capacity** | **20%** | Compares requested count ($Q_{req}$) against uncommitted inventory ($Q_{avail}$) for the date window. $Q_{avail} \ge Q_{req} \implies 100\%$. Partial capacity is scored proportionally ($Q_{avail}/Q_{req} \times 85\%$). Zero availability scores 10%. |
| **Date Window Feasibility & Overlap** | **20%** | Full containment within provider's operational active schedule and zero overlapping locked reservations yields 100%. Partial date overlap receives 50-65%. Out of window yields 25%. |
| **Geographic Proximity & Transit Corridor** | **15%** | Evaluated on road transit distance in the regional cluster (e.g., Navi Mumbai / Panvel). $\le 3\text{ km} \implies 100\%$, $\le 8\text{ km} \implies 90\%$, $\le 15\text{ km} \implies 75\%$, $\le 25\text{ km} \implies 55\%$, $> 25\text{ km} \implies 35\%$. |
| **Price Fit & Budget Compliance** | **10%** | Listing rate ($P_{list}$) compared to seeker max budget ($P_{budget}$). $P_{list} \le P_{budget} \implies 100\%$. Surcharges up to 20% over budget score 75%, up to 50% score 50%, higher overages score 25%. |
| **Delivery & Logistics Dock Alignment** | **10%** | Availability of turnkey dispatch or loading dock pickup within stated radius. Full alignment yields 100%, pickup-only when delivery requested yields 20-60%. |

## 3. Aligned Domain Reasoning Style & Explanation Guidelines
When explaining match scores to procurement managers and banquet directors, the AI model must strictly adhere to the following professional communication style:
- **Concise & Data-Driven**: State precise metrics (e.g., "100% capacity ready with 250 units uncommitted", "4.1 km transit corridor via Palm Beach Road").
- **Highlight Operational Strengths**: Emphasize turnkey logistics, high provider verification ratings (e.g. $\ge 4.8\star$), and verified loading dock compatibility.
- **Flag Actionable Risks or Trade-offs**: If quantity is partial or distance is $\ge 12\text{ km}$, clearly communicate the exact buffer requirements or token consumption needed.
- **Professional B2B Tone**: Maintain formal, courteous, and authoritative hospitality procurement terminology. Avoid vague buzzwords or speculative statements.

## 4. Exemplary Aligned Match Explanations

### Example A: High Affinity Match (Score: 96/100)
> "Exceptional match for Grand Horizon Hotel's 200-guest gala requirement. Royal Banquets has 250 uncommitted Chiavari chairs available across your requested Oct 1–4 window. Located just 4.1 km away in CBD Belapur with verified 14-foot hydraulic loading dock access and included Porter transit dispatch. Rate is 12% below your ceiling budget."

### Example B: Medium Affinity Match with Distance Warning (Score: 78/100)
> "Strong asset compatibility with full 150-unit inventory available. However, transit distance is 18.4 km from Panvel to Vashi, requiring a 90-minute logistics buffer during peak traffic hours. Includes standard security deposit (15%) and verified commercial maintenance log."
