export type BusinessRole = 'PROVIDER' | 'SEEKER' | 'BOTH';

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'CANCELLED';

export type DealStatus = 
  | 'NEGOTIATING' 
  | 'AWAITING_CONFIRMATION' 
  | 'AWAITING_DEPOSIT' 
  | 'CONFIRMED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'DISPUTED';

export type DeliveryStatus = 
  | 'NOT_REQUIRED' 
  | 'PENDING' 
  | 'ASSIGNED' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'FAILED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type ProductCategory = 
  | 'Chairs & Seating' 
  | 'Tables & Dining' 
  | 'Commercial Kitchen' 
  | 'AV & Staging' 
  | 'Vehicles & Transport' 
  | 'Event Spaces';

export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  category: 'Hotel' | 'Catering Company' | 'Banquet Venue' | 'Event Production';
  location: string; // e.g. "Vashi, Navi Mumbai", "CBD Belapur, Navi Mumbai", "Kharghar, Navi Mumbai", "Panvel"
  distanceFromUserKm: number;
  role: BusinessRole;
  rating: number;
  reviewsCount: number;
  phone: string;
  gstin: string;
  avatar: string;
  createdAt: string;
}

export interface ResourceListing {
  id: string;
  providerId: string;
  providerName: string;
  providerLocation: string;
  providerRating: number;
  providerReviewsCount: number;
  name: string;
  category: ProductCategory;
  description: string;
  imageUrl: string;
  galleryUrls?: string[];
  quantityTotal: number;
  pricePerUnitPerDay: number; // in INR ₹
  depositPercent: number; // e.g. 15 for 15%
  location: string;
  distanceKm: number;
  availabilityStartDate: string;
  availabilityEndDate: string;
  deliveryOptions: {
    pickupAvailable: boolean;
    deliveryAvailable: boolean;
    maxDistanceKm: number;
    flatDeliveryFee: number; // in INR ₹
  };
  specifications: string[];
  packagingNotes: string;
  loadingDockRequirements: string;
  qualityInspected: boolean;
  minRentalDays: number;
  createdAt: string;
}

export interface ResourceRequest {
  id: string;
  seekerId: string;
  seekerName: string;
  seekerLocation: string;
  providerId: string;
  providerName: string;
  resourceId: string;
  resourceName: string;
  resourceImage: string;
  quantity: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  deliveryRequired: boolean;
  deliveryAddress: string;
  status: RequestStatus;
  notes?: string;
  proposedPricePerUnit?: number;
  createdAt: string;
}

export interface DealRecord {
  id: string;
  requestId: string;
  seekerId: string;
  seekerName: string;
  providerId: string;
  providerName: string;
  resourceId: string;
  resourceName: string;
  resourceImage: string;
  quantity: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  rentalPricePerUnit: number; // in INR ₹
  subtotalRental: number;     // quantity * days * rentalPricePerUnit
  deliveryFee: number;        // in INR ₹
  depositPercent: number;     // e.g. 15%
  depositAmount: number;      // subtotalRental * (depositPercent / 100)
  totalAmount: number;        // subtotalRental + deliveryFee + depositAmount
  status: DealStatus;
  proposedBy: 'SEEKER' | 'PROVIDER';
  lastModifiedByRole: 'SEEKER' | 'PROVIDER';
  finalizedAt?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  dealId?: string;
  senderId: string;
  senderName: string;
  senderRole: 'SEEKER' | 'PROVIDER';
  text: string;
  timestamp: string;
  isSystemEvent?: boolean;
  structuredProposalSnapshot?: {
    quantity: number;
    rentalPricePerUnit: number;
    deliveryFee: number;
    depositPercent: number;
    totalAmount: number;
  };
}

export interface BookingRecord {
  id: string;
  dealId: string;
  requestId: string;
  seekerId: string;
  seekerName: string;
  providerId: string;
  providerName: string;
  resourceId: string;
  resourceName: string;
  resourceImage: string;
  quantity: number;
  startDate: string;
  endDate: string;
  rentalDays: number;
  subtotalRental: number;
  deliveryFee: number;
  depositAmount: number;
  totalPaid: number;
  paymentStatus: PaymentStatus;
  simulatedTransactionId: string;
  paymentMethod: 'UPI (GPay/PhonePe)' | 'Corporate NetBanking (HDFC/ICICI)' | 'Business Credit Card';
  paidAt: string;
  bookingStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  deliveryStatus: DeliveryStatus;
  deliveryTracking: {
    partner: 'Porter';
    trackingNumber: string;
    driverName: string;
    driverPhone: string;
    vehicleNumber: string;
    currentStepIndex: number;
    timeline: {
      status: DeliveryStatus;
      title: string;
      description: string;
      timestamp: string;
      completed: boolean;
    }[];
  };
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: 'SEEKER' | 'PROVIDER';
  targetBusinessId: string;
  targetBusinessName: string;
  resourceId: string;
  resourceName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface SearchFilterState {
  category: string;
  quantity: number;
  location: string;
  startDate: string;
  endDate: string;
  maxBudget: number;
  deliveryRequired: boolean;
  sortBy: 'best_match' | 'distance' | 'price_asc' | 'quantity';
}

export interface MatchScoreResult {
  score: number; // 0 to 100
  explanation: string;
  breakdown: {
    categoryMatch: number;
    quantityMatch: number;
    dateAvailability: number;
    distanceProximity: number;
    priceFit: number;
    deliveryAlignment: number;
  };
  remainingAvailableQuantity: number;
}
