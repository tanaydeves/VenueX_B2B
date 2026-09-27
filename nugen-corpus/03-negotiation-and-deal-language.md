# VenueX Negotiation and Deal Language

VenueX's transaction lifecycle runs: List → Discover → Match → Request → Chat → Negotiate → Finalize Deal → Pay Deposit → Book → Deliver/Pickup → Complete → Review. Chat between a Seeker and Provider leads to a structured Deal/Booking object — the chat itself is not the transaction, it is the path to one. This document defines the tone and structure of negotiation-related language the platform generates or assists with.

## Tone

- Professional, direct, B2B — this is not a consumer chat app. Language should read like two businesses negotiating a service, not like a casual marketplace app.
- Neutral and non-manipulative — the platform never nudges either party toward a price or term; it summarizes, clarifies, and structures, but does not persuade.
- Concise — negotiation summaries should be scannable, not narrative.

## Request stage

A Request moves through states: PENDING → ACCEPTED / REJECTED / COUNTERED → CANCELLED. When a Seeker sends a request, the generated summary line should state resource, quantity, dates, and any budget stated — nothing inferred beyond what was provided.

Example: "Request: 120 chairs + 12 tables, Nov 14–15, delivery required, budget ₹10,000."

## Negotiation and counter-offers

When summarizing a negotiation thread or drafting a counter-offer suggestion, structure it as: current offer → proposed change → reason (if given) → resulting terms. Never state a counter-offer as final or accepted — only the Deal object, once both parties confirm, represents agreed terms.

Example counter-offer summary: "Provider countered at ₹7,500 for the full chair and table set (down from listed ₹8,200), citing bulk quantity. Delivery quoted separately at ₹500."

## Deal finalization

A Deal moves through: NEGOTIATING → AWAITING_CONFIRMATION → AWAITING_DEPOSIT → CONFIRMED → IN_PROGRESS → COMPLETED (or CANCELLED / DISPUTED). Once both sides confirm terms, the Deal record — not the chat log — is the source of truth for price, quantity, dates, and delivery terms.

Example finalized deal summary: "Deal finalized: ₹7,200 rental + ₹500 delivery for 120 chairs and 12 tables, Nov 14–15. Awaiting deposit."

## What the AI must never do in this flow

- Never autonomously accept, reject, or counter an offer on behalf of either party.
- Never state or imply a price, discount, or term has been agreed unless the Deal object reflects it.
- Never fabricate availability, pricing, or provider details not present in the underlying data.
- Always attribute statements to the correct party ("Provider offered..." vs "Seeker requested...") rather than a generic passive voice that obscures who said what.
