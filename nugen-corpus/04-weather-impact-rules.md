# Weather Impact on VenueX Resource Categories

This document defines how weather conditions affect demand, availability, risk, and user behavior for each VenueX resource category. It is the reasoning basis for the platform's Weather Digital Twin, which simulates how a change in a weather parameter (rainfall intensity, storm duration, temperature, flooding) propagates into changes in match scores, demand, and delivery risk for existing listings and bookings — without altering the real booking.

## General principle

Weather does not affect all resources equally or immediately. Effects are direct (an outdoor venue becomes less usable in rain) and cascading (a wedding moving indoors increases demand for indoor venues and decreases demand for outdoor decor equipment, while increasing delivery risk if roads are affected). The Digital Twin should reason about both direct and secondary effects, and express predictions with uncertainty rather than false precision — weather forecasts themselves are probabilistic.

## Venues

- **Outdoor/open-air venues**: Availability desirability drops sharply with rain, storms, or forecast probability of rain above roughly 40–50%. Heavy rain or storm warnings should be treated as a strong negative signal on match score for any booking without a covered contingency. Extreme heat similarly reduces desirability for daytime outdoor events, especially multi-hour ones.
- **Semi-outdoor venues (covered but open-sided)**: Moderate sensitivity — reduced desirability in heavy rain or high wind, largely unaffected by heat alone.
- **Indoor venues**: Largely weather-independent, except that severe flooding or storm conditions can affect guest and staff transport to the venue, indirectly reducing attendance-dependent bookings.
- **Cascading effect**: A drop in outdoor venue suitability should increase simulated demand/interest in comparable indoor or semi-outdoor venues in the same area and date range.

## Equipment

- **Tents, canopies, rain covers**: Demand rises sharply as rain probability or intensity rises — treat this as a positive demand signal, and flag low-availability listings in this sub-category as at risk of stock-out under a rain scenario.
- **Open-air decor, uncovered seating arrangements**: Demand falls as rain probability rises.
- **Heaters**: Demand rises in low-temperature or cold-storm scenarios.
- **Cooling equipment, shade structures**: Demand rises in extreme heat scenarios.
- **Catering equipment (indoor-use items like chafing dishes, cutlery)**: Largely weather-independent.

## Staff

- Weather does not change the nature of staffing work directly, but heavy rain, flooding, or storm conditions reduce reliable staff availability by disrupting commute and transport, particularly for hourly or day-of staff.
- Simulated effect: as flooding/storm severity increases, reduce the effective reliability/confidence of staff availability for a given date, without changing the listed headcount itself.

## Vehicles and delivery

- This is the most directly and immediately weather-sensitive category. Rain, storm duration, and flooding increase transit time, increase delivery/pickup failure risk, and widen the uncertainty band on estimated arrival times.
- Simulated effect: as rainfall intensity or flooding severity increases, increase delivery ETA and delivery risk percentage for bookings requiring transport, proportionally to severity and duration, with wider uncertainty at higher severity.

## Extreme scenario handling

For storm, flooding, or extreme heat scenarios beyond normal seasonal variation, the Digital Twin should widen its uncertainty bands rather than extrapolate linearly — extreme conditions are less predictable from historical patterns than moderate ones, and this should be reflected in any probabilistic output.

## Example what-if scenario (reference case)

A wedding booking in Navi Mumbai combining an outdoor venue, 120 chairs, 12 tables, and delivery: increasing simulated rainfall intensity from light to heavy should (a) reduce the outdoor venue's match score and raise a suggested indoor/covered alternative, (b) raise simulated demand and risk-of-stockout for tent/canopy equipment in the area, (c) increase delivery ETA and risk for the chair/table delivery, and (d) leave indoor catering equipment demand unaffected.
