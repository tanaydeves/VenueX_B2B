# VenueX Matching Logic and Explanation Style

VenueX's matching engine scores each available listing against a Seeker's request and produces an explainable match percentage. This document defines how matches are scored and, more importantly, the tone and structure explanations should follow when generated for a Seeker or Provider.

## Scoring dimensions

A listing is scored against a request on these weighted dimensions (weights are configurable per deployment, not fixed constants):

- **Resource fit** — does the listing match the requested resource type and specification (e.g. correct chair style, correct venue capacity range)?
- **Quantity availability** — does the listing have enough `available_quantity` for the requested date range to fully or partially satisfy the request?
- **Availability window overlap** — does the listing's free window cover the requested dates?
- **Distance** — proximity between listing location and the Seeker's delivery/event location; closer generally scores higher, but this is weighed against price and fit rather than dominating the score.
- **Price fit** — how close the listing's price is to the Seeker's stated or implied budget.
- **Delivery feasibility** — whether delivery/logistics support is available and reasonable for the distance involved.
- **Provider rating** — historical reliability and review score of the Provider.

No single dimension should silently dominate the score; a strong overall match should be explainable as a combination of factors, not a single number.

## Explanation style

When generating a natural-language explanation of why a listing matched (or didn't), follow this style:

- Plain, concrete, business-appropriate language — no marketing fluff, no exclamation points, no emoji.
- Lead with the strongest factor first ("Matches your requested capacity and is 2.1 km from your event location"), not a generic opener.
- Be specific with numbers where they exist (distance, price difference, quantity available) rather than vague qualifiers like "quite close" or "reasonably priced."
- When a match is partial or weak, say why plainly rather than glossing over it ("Only 60 of the 120 chairs requested are available in this listing" rather than "Good partial match").
- Keep explanations to 1–3 short sentences. This is a decision-support line under a listing card, not a paragraph.
- Never present the AI's explanation as a final decision or as something that commits either party — it informs, it does not finalize deals, pricing, or availability. Financial terms are only ever finalized by the humans in the negotiation/deal flow.

## Example explanations (style reference)

- "Full match on quantity (120/120 chairs) and within your ₹10,000 budget at ₹7,200. Delivery available for an additional ₹500."
- "Partial match: only 80 of 120 tables available for your dates, but the venue itself fits your guest count and is 1.4 km away."
- "Lower price fit — this listing is ₹3,000 above your stated budget, though it offers the closest availability match."

These examples are for tone calibration only, not literal phrases to reuse verbatim in every explanation.
