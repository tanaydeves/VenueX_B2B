import { BookingRecord, MatchScoreResult, ResourceListing, SearchFilterState } from '../types';

/**
 * Calculates date overlap between two date ranges [startA, endA] and [startB, endB]
 */
export function areDatesOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA <= eB && eA >= sB;
}

/**
 * Calculates remaining available quantity for a resource during a requested date range,
 * considering all active or confirmed bookings.
 */
export function calculateRemainingQuantity(
  resource: ResourceListing,
  targetStartDate: string,
  targetEndDate: string,
  allBookings: BookingRecord[]
): number {
  if (!targetStartDate || !targetEndDate) {
    // If no dates specified, check today
    const today = new Date().toISOString().split('T')[0];
    targetStartDate = today;
    targetEndDate = today;
  }

  // Filter bookings for this resource that are active/confirmed and overlap the window
  const activeBookings = allBookings.filter(b => 
    b.resourceId === resource.id &&
    (b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'IN_PROGRESS') &&
    areDatesOverlapping(targetStartDate, targetEndDate, b.startDate, b.endDate)
  );

  // Sum booked quantity for concurrent period
  const totalBooked = activeBookings.reduce((sum, b) => sum + b.quantity, 0);
  const remaining = Math.max(0, resource.quantityTotal - totalBooked);
  return remaining;
}

/**
 * Weighted scoring function computing:
 * 1. Resource type/category match (25%)
 * 2. Quantity match & capacity (20%)
 * 3. Date availability window (20%)
 * 4. Distance proximity in Navi Mumbai / Panvel (15%)
 * 5. Price fit relative to user's max budget (10%)
 * 6. Delivery availability if required (10%)
 */
export function computeMatchScore(
  resource: ResourceListing,
  filters: SearchFilterState,
  allBookings: BookingRecord[]
): MatchScoreResult {
  const remainingQty = calculateRemainingQuantity(
    resource, 
    filters.startDate, 
    filters.endDate, 
    allBookings
  );

  // 1. Category Match (Weight: 25)
  let categoryScore = 100;
  if (filters.category && filters.category !== 'All') {
    if (resource.category.toLowerCase() === filters.category.toLowerCase()) {
      categoryScore = 100;
    } else if (resource.name.toLowerCase().includes(filters.category.toLowerCase())) {
      categoryScore = 75;
    } else {
      categoryScore = 20;
    }
  }

  // 2. Quantity Match (Weight: 20)
  let quantityScore = 100;
  const requestedQty = filters.quantity || 1;
  if (remainingQty >= requestedQty) {
    // Exact or surplus capacity
    quantityScore = 100;
  } else if (remainingQty > 0) {
    // Partial capacity
    quantityScore = Math.round((remainingQty / requestedQty) * 85);
  } else {
    // Out of stock for these dates
    quantityScore = 10;
  }

  // 3. Date Availability (Weight: 20)
  let dateScore = 100;
  if (filters.startDate && filters.endDate) {
    const reqStart = new Date(filters.startDate).getTime();
    const reqEnd = new Date(filters.endDate).getTime();
    const availStart = new Date(resource.availabilityStartDate).getTime();
    const availEnd = new Date(resource.availabilityEndDate).getTime();

    if (reqStart >= availStart && reqEnd <= availEnd) {
      dateScore = remainingQty >= requestedQty ? 100 : 50;
    } else if (reqStart >= availStart && reqStart <= availEnd) {
      dateScore = 65; // Partially within availability range
    } else {
      dateScore = 25; // Outside season
    }
  }

  // 4. Distance Proximity (Weight: 15)
  // Distance in km within Navi Mumbai / Panvel cluster (typically 1 to 20 km)
  let distanceScore = 100;
  const dist = resource.distanceKm || 2.5;
  if (dist <= 3) {
    distanceScore = 100;
  } else if (dist <= 8) {
    distanceScore = 90;
  } else if (dist <= 15) {
    distanceScore = 75;
  } else if (dist <= 25) {
    distanceScore = 55;
  } else {
    distanceScore = 35;
  }

  // 5. Price Fit (Weight: 10)
  let priceScore = 100;
  if (filters.maxBudget && filters.maxBudget > 0) {
    if (resource.pricePerUnitPerDay <= filters.maxBudget) {
      priceScore = 100;
    } else {
      const overRatio = resource.pricePerUnitPerDay / filters.maxBudget;
      if (overRatio <= 1.2) priceScore = 75;
      else if (overRatio <= 1.5) priceScore = 50;
      else priceScore = 25;
    }
  }

  // 6. Delivery Alignment (Weight: 10)
  let deliveryScore = 100;
  if (filters.deliveryRequired) {
    if (resource.deliveryOptions.deliveryAvailable) {
      if (dist <= resource.deliveryOptions.maxDistanceKm) {
        deliveryScore = 100;
      } else {
        deliveryScore = 60; // Beyond standard delivery radius
      }
    } else {
      deliveryScore = 20; // Only warehouse pickup
    }
  }

  // Weighted aggregate: 0.25 + 0.20 + 0.20 + 0.15 + 0.10 + 0.10 = 1.00
  const finalScore = Math.min(
    99,
    Math.max(
      35,
      Math.round(
        categoryScore * 0.25 +
        quantityScore * 0.20 +
        dateScore * 0.20 +
        distanceScore * 0.15 +
        priceScore * 0.10 +
        deliveryScore * 0.10
      )
    )
  );

  // Generate natural concise explanation string
  const reasons: string[] = [];
  if (remainingQty >= requestedQty) {
    reasons.push(`Matches your requested count (${remainingQty} units ready)`);
  } else if (remainingQty > 0) {
    reasons.push(`${remainingQty} units available now for this window`);
  } else {
    reasons.push(`Currently reserved for overlapping dates`);
  }

  if (resource.deliveryOptions.deliveryAvailable && dist <= resource.deliveryOptions.maxDistanceKm) {
    reasons.push(`dock delivery supported within ${dist} km`);
  } else {
    reasons.push(`located ${dist} km away in ${resource.location.split(',')[0]}`);
  }

  const explanation = `${reasons.join(', ')}.`;

  return {
    score: finalScore,
    explanation,
    breakdown: {
      categoryMatch: categoryScore,
      quantityMatch: quantityScore,
      dateAvailability: dateScore,
      distanceProximity: distanceScore,
      priceFit: priceScore,
      deliveryAlignment: deliveryScore,
    },
    remainingAvailableQuantity: remainingQty,
  };
}
