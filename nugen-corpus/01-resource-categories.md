# VenueX Resource Categories and Use Cases

VenueX is a B2B marketplace connecting Resource Providers (businesses with idle hospitality resources) with Resource Seekers (businesses that need those resources temporarily). A business can act as both a Provider and a Seeker depending on the transaction. The platform covers four primary resource categories.

## 1. Venues

Idle or underused physical spaces offered for temporary use: banquet halls, rooftop lawns, open grounds, conference rooms, restaurant private dining areas, hotel function rooms, and courtyards. Venues are described by capacity (guest count), indoor/outdoor status, amenities (parking, power backup, AV setup, washrooms), and availability windows. Outdoor and semi-outdoor venues are the most weather-sensitive resource category on the platform — their desirability and safe usability change sharply with rain, storms, extreme heat, or flooding, while fully indoor venues are largely weather-independent.

Typical seekers: event planners, caterers, corporate teams, wedding organizers, small businesses hosting launches or workshops.

## 2. Equipment

Physical items rented for events and hospitality operations: chairs, tables, tents and canopies, catering equipment (chafing dishes, cutlery, serving stations), sound and lighting systems, generators, decor items, and heaters or coolers. Equipment is described by quantity available, condition, and per-unit or per-set pricing. Demand for specific equipment types shifts with weather — canopies, tents, and rain covers spike in demand ahead of rain events, while open-air decor and cooling equipment lose relevance in wet or cold conditions, and heaters or covered structures gain relevance in extreme heat or cold.

Typical seekers: caterers, event companies, small venues without their own inventory.

## 3. Staff

Temporary hospitality workforce made available by one business to another: waitstaff, event coordinators, security personnel, setup/breakdown crews, and drivers. Staff listings specify headcount, role, availability window, and hourly or per-event rate. Staff availability and reliability are affected by weather indirectly — through transport disruption (flooding, heavy rain delaying commutes) rather than the weather itself changing the nature of the work.

Typical seekers: caterers and venues short-staffed for a specific event date.

## 4. Vehicles

Transport resources offered for temporary use: delivery vans, catering trucks, passenger vehicles for staff or guest transport, and equipment transport vehicles. Vehicle listings specify capacity, vehicle type, and availability. Vehicle-based delivery and pickup is the resource category most directly affected by weather-driven operational risk — rain and flooding increase transit time, delay windows, and failure risk for scheduled deliveries and pickups.

Typical seekers: businesses needing one-off transport capacity without owning a fleet.

## Cross-category notes

- Every listing has a location (used for distance-based matching and for weather lookups tied to that location).
- Every listing has an `available_quantity` for a given date range, preventing double-booking of partial stock (e.g. 40 of 120 chairs already reserved).
- A single booking can combine multiple categories (e.g. a venue plus chairs, tables, and a delivery vehicle), so weather impact on one category can cascade into related categories within the same booking.
