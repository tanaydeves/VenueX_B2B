# VenueX Platform Glossary and Status Systems

This document grounds the model in VenueX's core entities, roles, and status vocabulary so generated language uses consistent, correct terminology.

## Roles

- **Resource Provider**: a business listing an idle hospitality resource (venue, equipment, staff, or vehicle) for temporary use by others.
- **Resource Seeker**: a business searching for and requesting a temporary hospitality resource.
- A single business account can act as both a Provider and a Seeker, depending on the transaction.

## Core objects

- **Listing**: a Provider's published resource, with category, specification, `available_quantity` for given date ranges, location, and price.
- **Request**: a Seeker's structured ask, either built from natural-language input or manual filters, specifying resource, quantity, dates, budget, and delivery need.
- **Match**: a scored pairing of a Request against an available Listing, with an explainable match percentage.
- **Deal**: the structured, agreed outcome of a negotiation — the source of truth for price, quantity, dates, and delivery terms.
- **Booking**: a confirmed Deal with deposit paid, entering the fulfillment lifecycle.
- **Delivery**: the logistics record for transporting a resource from Provider to Seeker or between locations, tracked independently of the Deal.

## Status systems

- **Request status**: PENDING → ACCEPTED / REJECTED / COUNTERED → CANCELLED
- **Deal status**: NEGOTIATING → AWAITING_CONFIRMATION → AWAITING_DEPOSIT → CONFIRMED → IN_PROGRESS → COMPLETED (or CANCELLED / DISPUTED at various points)
- **Delivery status**: NOT_REQUIRED → PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED (or FAILED)
- **Payment status**: PENDING → SUCCESS / FAILED / REFUNDED

## Monetization vocabulary (for correct terminology, not for negotiation content)

- **Delivery Tokens (D.T.)**: included in a Seeker's subscription, consumed per delivery/pickup — not a percentage-based fee.
- **Extra D.T.**: additional Delivery Tokens purchased once the included balance is exhausted.
- **Seeker Subscription**: recurring fee that includes an allocation of Delivery Tokens.
- **Provider Subscription Fee**: separate recurring fee paid by Providers.
- VenueX does not charge a per-transaction commission; revenue comes from subscriptions, Extra D.T. sales, and the margin between what Seekers' tokens cover and what VenueX pays its delivery partner.

## Weather Digital Twin vocabulary

- **Digital Twin**: a continuously updated simulated representation of VenueX's real entities (listings, bookings, delivery routes) that estimates how they behave under current and hypothetical weather conditions, without altering real records.
- **What-if simulation**: a user-triggered scenario where a weather parameter (rainfall intensity, storm duration, temperature, flooding severity) is changed and the Digital Twin recalculates match scores, demand signals, and delivery risk accordingly, shown as a live preview.
- **Cascading effect**: a secondary change caused by a primary weather effect — e.g. reduced outdoor venue suitability increasing demand for indoor alternatives.
