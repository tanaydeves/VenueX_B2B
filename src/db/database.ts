import {
  BookingRecord,
  BusinessProfile,
  ChatMessage,
  DealRecord,
  DeliveryTokenLedgerEntry,
  PaymentRecord,
  ProductCategory,
  ResourceListing,
  ResourceRequest,
  ReviewRecord,
  SubscriptionRecord,
} from '../types';

const DB_NAME = 'venuex_hospitality_db';
const DB_VERSION = 2; // Incremented for new subscription, token ledger, and payment stores

const STORES = [
  'businesses',
  'resources',
  'requests',
  'deals',
  'messages',
  'bookings',
  'reviews',
  'subscriptions',
  'tokenLedger',
  'paymentRecords',
] as const;

type StoreName = (typeof STORES)[number];

// Event emitter for reactive state updates across the app
type ListenerCallback = () => void;
const listeners = new Set<ListenerCallback>();

export function subscribeToDatabase(callback: ListenerCallback): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifySubscribers() {
  listeners.forEach(cb => {
    try {
      cb();
    } catch (e) {
      console.error('Error notifying database subscriber', e);
    }
  });
}

// Initial Seed Data (Navi Mumbai / Panvel Realistic Hospitality Network)
const SEED_BUSINESSES: BusinessProfile[] = [
  {
    id: 'biz-grand-horizon',
    name: 'Grand Horizon Hotel',
    email: 'operations@grandhorizon.in',
    password: 'password123',
    category: 'Hotel',
    location: 'Vashi, Navi Mumbai',
    distanceFromUserKm: 2.8,
    role: 'BOTH',
    rating: 4.9,
    reviewsCount: 48,
    phone: '+91 98201 44921',
    gstin: '27AABCG1234F1Z8',
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'biz-royal-banquets',
    name: 'Royal Banquets & Convention',
    email: 'manager@royalbanquets.in',
    password: 'password123',
    category: 'Banquet Venue',
    location: 'CBD Belapur, Navi Mumbai',
    distanceFromUserKm: 4.1,
    role: 'BOTH',
    rating: 4.8,
    reviewsCount: 36,
    phone: '+91 98334 77210',
    gstin: '27BBCDE5678G2Z1',
    avatar: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-15T11:00:00.000Z',
  },
  {
    id: 'biz-urban-caterers',
    name: 'Urban Gala Caterers',
    email: 'info@urbancaterers.in',
    password: 'password123',
    category: 'Catering Company',
    location: 'Kharghar, Navi Mumbai',
    distanceFromUserKm: 5.4,
    role: 'BOTH',
    rating: 4.95,
    reviewsCount: 52,
    phone: '+91 98190 23118',
    gstin: '27CCDEF9012H3Z4',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-02-01T09:00:00.000Z',
  },
  {
    id: 'biz-sai-palace',
    name: 'Sai Palace Suites & Events',
    email: 'bookings@saipalacepanvel.in',
    password: 'password123',
    category: 'Hotel',
    location: 'Panvel, Navi Mumbai',
    distanceFromUserKm: 8.5,
    role: 'PROVIDER',
    rating: 4.7,
    reviewsCount: 29,
    phone: '+91 98700 88200',
    gstin: '27DDEFG3456J4Z7',
    avatar: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-02-12T14:00:00.000Z',
  },
  {
    id: 'biz-apex-centre',
    name: 'Apex Convention Centre',
    email: 'events@apexseawoods.in',
    password: 'password123',
    category: 'Banquet Venue',
    location: 'Seawoods, Navi Mumbai',
    distanceFromUserKm: 3.2,
    role: 'SEEKER',
    rating: 4.85,
    reviewsCount: 19,
    phone: '+91 98211 99182',
    gstin: '27EEFGH7890K5Z9',
    avatar: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-03-01T08:30:00.000Z',
  },
];

const SEED_RESOURCES: ResourceListing[] = [
  {
    id: 'res-chairs-chiavari',
    providerId: 'biz-grand-horizon',
    providerName: 'Grand Horizon Hotel',
    providerLocation: 'Vashi, Navi Mumbai',
    providerRating: 4.9,
    providerReviewsCount: 48,
    name: '250x Gold Chiavari Banquet Chairs with Cushions',
    category: 'Chairs & Seating',
    description: 'Commercial kiln-dried hardwood frame with 4-coat golden lacquer and high-density fire-retardant ivory padded cushions. Ideal for weddings, galas, and ballroom receptions.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-CYgaAYUcrbyc-vkPRsiYs5T07TJdKC9lxt9yn-Al_0n_QKc7AHTu3yJY_AmGtHBqqFS_SwYT-4-3kRrQiqw5a3kCgK_FkGEmnvkEYMkdmXdGnt_u5nqo7h5E0orvNf_cf5UjvWbcXj875zygXY9Jh00PElHjCK7Ethf-jfHD8IspZqMKqSLt9ffFujGUz8BBCkdwFtwMb8ZJic20XEsy5llWci7v5NLEOgsU0ONyAZBBlovyXEZJGw',
    galleryUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-CYgaAYUcrbyc-vkPRsiYs5T07TJdKC9lxt9yn-Al_0n_QKc7AHTu3yJY_AmGtHBqqFS_SwYT-4-3kRrQiqw5a3kCgK_FkGEmnvkEYMkdmXdGnt_u5nqo7h5E0orvNf_cf5UjvWbcXj875zygXY9Jh00PElHjCK7Ethf-jfHD8IspZqMKqSLt9ffFujGUz8BBCkdwFtwMb8ZJic20XEsy5llWci7v5NLEOgsU0ONyAZBBlovyXEZJGw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByQa9LY5X9kb_ae47VO4xLQVhHcBW2Z_16ipEjugw4RY3UsoGFkhTFwWw7afrWYrKcNCrMYTEmPe8uqHx5yPH5Hsw4gDiXUWUNzX3Cyz4yrDcTkvXfkBNk041CDYk9SGX2Ffh7xDOE1iWgyFuIEe2dRsFJXQlfy7cy-Ix-CUiTK2wTSjuY6g3yligJJRHnl_n9Zo0SWBBsfgU8XUkshwnAZU2TYCma34EE6UWvtIR_PyAsTUEN4WQJ1w',
    ],
    quantityTotal: 250,
    pricePerUnitPerDay: 120, // ₹120 per chair / day
    depositPercent: 15,
    location: 'Vashi, Navi Mumbai',
    distanceKm: 2.8,
    availabilityStartDate: '2026-09-01',
    availabilityEndDate: '2026-12-31',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: true,
      maxDistanceKm: 25,
      flatDeliveryFee: 1800,
    },
    specifications: [
      'Solid Beechwood Core with reinforced bracing',
      'Flame-retardant ivory velvet cushions with velcro ties',
      'Stackable up to 10 chairs per stack with protective felt sleeves',
      'Sanitized and inspected prior to dispatch',
    ],
    packagingNotes: 'Pre-palletized in protective covers (50 per skid) for quick loading dock roll-off.',
    loadingDockRequirements: 'Accessible for 14ft / 17ft Tata 407 or Porter container trucks. Bay loading dock available.',
    qualityInspected: true,
    minRentalDays: 1,
    createdAt: '2026-09-10T08:00:00.000Z',
  },
  {
    id: 'res-tables-round',
    providerId: 'biz-royal-banquets',
    providerName: 'Royal Banquets & Convention',
    providerLocation: 'CBD Belapur, Navi Mumbai',
    providerRating: 4.8,
    providerReviewsCount: 36,
    name: '40x Heavy Duty Round Banquet Tables (6ft, seats 10)',
    category: 'Tables & Dining',
    description: '72-inch circular commercial plywood event tables with heavy gauge wishbone folding steel legs and rubber protective bullnose edging. Seats 10 guests comfortably.',
    imageUrl: '/src/assets/images/banquet_round_tables_1790318100806.jpg',
    galleryUrls: [
      '/src/assets/images/banquet_round_tables_1790318100806.jpg',
    ],
    quantityTotal: 40,
    pricePerUnitPerDay: 450, // ₹450 per table / day
    depositPercent: 20,
    location: 'CBD Belapur, Navi Mumbai',
    distanceKm: 4.1,
    availabilityStartDate: '2026-09-01',
    availabilityEndDate: '2026-12-31',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: true,
      maxDistanceKm: 20,
      flatDeliveryFee: 2200,
    },
    specifications: [
      '18mm waterproof marine plywood top',
      'Self-locking wishbone powder-coated steel legs',
      'Edge-banded with heavy-duty T-molding vinyl',
      'Accommodates 10 adult banquet chairs with tabletop service',
    ],
    packagingNotes: 'Loaded on custom rolling table caddies for direct hotel freight elevator transport.',
    loadingDockRequirements: 'Basement ramp and service lift height minimum 7.5ft required.',
    qualityInspected: true,
    minRentalDays: 1,
    createdAt: '2026-09-12T10:30:00.000Z',
  },
  {
    id: 'res-combi-oven',
    providerId: 'biz-urban-caterers',
    providerName: 'Urban Gala Caterers',
    providerLocation: 'Kharghar, Navi Mumbai',
    providerRating: 4.95,
    providerReviewsCount: 52,
    name: 'Rational iCombi Pro 10-Pan Commercial Steamer Oven',
    category: 'Commercial Kitchen',
    description: 'Electric 10-tray GN 1/1 combi oven mounted on mobile lockable casters with built-in steam condensation hood and quick-connect 3-phase plug.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Bvt9xEHhMXh4Eav2DhHntp_Q7v17rSTrUTH5wSyHOrwQwYNtnmfa0pGMODcgsMUSmu8Zmtvb0G7T4tnx1RsHfDdCeAJ911f4Z_LcYRphBEbOBaHvf7jmO5x1ASSZKRL9QDNRHl9G6pMaMzZX4Imn4EQgmIxnu4hi7RfHqkkdMafoE0X1uyjP1mo8qoTr9s9LImI_qftU4aHMxsKP-ONaIhSZHp03D7blHDSaboqJrmyu6MZY96h59Q',
    galleryUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Bvt9xEHhMXh4Eav2DhHntp_Q7v17rSTrUTH5wSyHOrwQwYNtnmfa0pGMODcgsMUSmu8Zmtvb0G7T4tnx1RsHfDdCeAJ911f4Z_LcYRphBEbOBaHvf7jmO5x1ASSZKRL9QDNRHl9G6pMaMzZX4Imn4EQgmIxnu4hi7RfHqkkdMafoE0X1uyjP1mo8qoTr9s9LImI_qftU4aHMxsKP-ONaIhSZHp03D7blHDSaboqJrmyu6MZY96h59Q',
    ],
    quantityTotal: 2,
    pricePerUnitPerDay: 8500, // ₹8,500 per day
    depositPercent: 25,
    location: 'Kharghar, Navi Mumbai',
    distanceKm: 5.4,
    availabilityStartDate: '2026-09-01',
    availabilityEndDate: '2026-12-31',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: true,
      maxDistanceKm: 30,
      flatDeliveryFee: 3500,
    },
    specifications: [
      '10 x 1/1 GN capacity with intelligent climate management',
      'Temperature range 30°C to 300°C with core temperature probe',
      'Requires 3-Phase 415V power input and 3/4" water inlet',
      'Pre-sanitized with factory cert and water filter system included',
    ],
    packagingNotes: 'Rigid steel flight case with heavy-duty ramp rolling casters.',
    loadingDockRequirements: 'Hydraulic liftgate required for ground drop-off.',
    qualityInspected: true,
    minRentalDays: 1,
    createdAt: '2026-09-14T11:15:00.000Z',
  },
  {
    id: 'res-van-catering',
    providerId: 'biz-urban-caterers',
    providerName: 'Urban Gala Caterers',
    providerLocation: 'Kharghar, Navi Mumbai',
    providerRating: 4.95,
    providerReviewsCount: 52,
    name: 'Refrigerated Catering Delivery Van (Tata Ace Maxi 1-Ton)',
    category: 'Vehicles & Transport',
    description: 'Insulated refrigerated container van (+2°C to +8°C cooling) with integrated standby electric plug-in and side & rear lockable barn doors. Perfect for inter-venue food dispatch.',
    imageUrl: '/src/assets/images/catering_delivery_van_1790318085967.jpg',
    galleryUrls: [
      '/src/assets/images/catering_delivery_van_1790318085967.jpg',
    ],
    quantityTotal: 2,
    pricePerUnitPerDay: 4200, // ₹4,200 / day
    depositPercent: 20,
    location: 'Kharghar, Navi Mumbai',
    distanceKm: 5.4,
    availabilityStartDate: '2026-09-01',
    availabilityEndDate: '2026-12-31',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: false,
      maxDistanceKm: 0,
      flatDeliveryFee: 0,
    },
    specifications: [
      'Sub-zero / Chilled GRP insulated cargo box',
      'Payload capacity 1,000 kg with stainless steel interior floor',
      'Full commercial insurance and valid Maharashtra RTO permits',
      'Available with dedicated driver or self-drive commercial badge',
    ],
    packagingNotes: 'Dispatched fully fueled with sanitized sanitized food-grade cargo bay.',
    loadingDockRequirements: 'Clearance height 2.6m.',
    qualityInspected: true,
    minRentalDays: 1,
    createdAt: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'res-projector-laser',
    providerId: 'biz-grand-horizon',
    providerName: 'Grand Horizon Hotel',
    providerLocation: 'Vashi, Navi Mumbai',
    providerRating: 4.9,
    providerReviewsCount: 48,
    name: 'Epson Pro 4K Laser Conference Projector (8,500 Lumens)',
    category: 'AV & Staging',
    description: 'High-brightness 3LCD laser projector for large ballroom presentations, corporate conferences, and live gala feeds. Crisp 4K enhancement with motorized lens shift.',
    imageUrl: '/src/assets/images/conference_laser_projector_1790318116337.jpg',
    galleryUrls: [
      '/src/assets/images/conference_laser_projector_1790318116337.jpg',
    ],
    quantityTotal: 3,
    pricePerUnitPerDay: 3500, // ₹3,500 per day
    depositPercent: 25,
    location: 'Vashi, Navi Mumbai',
    distanceKm: 2.8,
    availabilityStartDate: '2026-09-01',
    availabilityEndDate: '2026-12-31',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: true,
      maxDistanceKm: 30,
      flatDeliveryFee: 800,
    },
    specifications: [
      '8,500 lumens equal color and white brightness',
      'Native WUXGA with 4K Enhancement Technology',
      'Inputs: HDMI 2.0, HDBaseT, 3G-SDI, and wireless screen mirror',
      'Supplied in custom Pelican padded shockproof flight case',
    ],
    packagingNotes: 'Includes 15m optical HDMI cables, power cord, remote, and truss clamp.',
    loadingDockRequirements: 'Hand carry or bellman trolley.',
    qualityInspected: true,
    minRentalDays: 1,
    createdAt: '2026-09-16T14:20:00.000Z',
  },
  {
    id: 'res-chairs-charcoal',
    providerId: 'biz-royal-banquets',
    providerName: 'Royal Banquets & Convention',
    providerLocation: 'CBD Belapur, Navi Mumbai',
    providerRating: 4.8,
    providerReviewsCount: 36,
    name: '200x Charcoal Ergonomic Banquet Chairs',
    category: 'Chairs & Seating',
    description: 'Sleek steel-framed conference and banquet seating upholstered in stain-resistant charcoal gray commercial fabric with lumbar support. Interlocking ganging clips included.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw1qjlVFPL56yn1pDS3hCHOEoWD0U8W9SYblqQaYm6ruRxwfjfg46iSWXLbxV3Q4_x6eJ43HA2LD9yGq587EMr8Lze2FDkZsob8cV5atT1TFMX9Ejip8MjFeDZa6PbD1AgLR_nGLwnmta2HpUxfeVDErWEmt2i7hAH2-Y8_MurkiHCodhvvnqTNhbvsekyh7GSui6LysgvquvLXF75RUIQlf3tE2zoIrsv1_Yi81QLwiAO5PUlN-gIbA',
    galleryUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDw1qjlVFPL56yn1pDS3hCHOEoWD0U8W9SYblqQaYm6ruRxwfjfg46iSWXLbxV3Q4_x6eJ43HA2LD9yGq587EMr8Lze2FDkZsob8cV5atT1TFMX9Ejip8MjFeDZa6PbD1AgLR_nGLwnmta2HpUxfeVDErWEmt2i7hAH2-Y8_MurkiHCodhvvnqTNhbvsekyh7GSui6LysgvquvLXF75RUIQlf3tE2zoIrsv1_Yi81QLwiAO5PUlN-gIbA',
    ],
    quantityTotal: 200,
    pricePerUnitPerDay: 140, // ₹140 per chair / day
    depositPercent: 15,
    location: 'CBD Belapur, Navi Mumbai',
    distanceKm: 4.1,
    availabilityStartDate: '2026-09-01',
    availabilityEndDate: '2026-12-31',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: true,
      maxDistanceKm: 25,
      flatDeliveryFee: 1600,
    },
    specifications: [
      'Heavy 16-gauge powder coated square steel tube frame',
      'Dual-density molded foam seat cushion with waterfall front',
      'Teflon stain-shield fabric protection treatment',
      'Stackable 12 high on dedicated rolling transport dolly',
    ],
    packagingNotes: 'Secured with stretch wrap and protective corner pads.',
    loadingDockRequirements: 'Standard 48" loading bay with freight lift access.',
    qualityInspected: true,
    minRentalDays: 1,
    createdAt: '2026-09-17T16:00:00.000Z',
  },
  {
    id: 'res-chafing-dishes',
    providerId: 'biz-urban-caterers',
    providerName: 'Urban Gala Caterers',
    providerLocation: 'Kharghar, Navi Mumbai',
    providerRating: 4.95,
    providerReviewsCount: 52,
    name: '6x Premium Stainless Steel Roll-Top Chafing Buffet Dishes',
    category: 'Commercial Kitchen',
    description: 'Luxury 9-litre roll-top buffet warmers in 18/10 mirror-polished stainless steel with 90° and 180° opening angles, water pans, and dual gel fuel burners.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    ],
    quantityTotal: 12,
    pricePerUnitPerDay: 280, // ₹280 per chafing dish / day
    depositPercent: 10,
    location: 'Kharghar, Navi Mumbai',
    distanceKm: 5.4,
    availabilityStartDate: '2026-09-01',
    availabilityEndDate: '2026-12-31',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: true,
      maxDistanceKm: 20,
      flatDeliveryFee: 600,
    },
    specifications: [
      'Full size 1/1 GN 65mm deep food pans included',
      'Roll top lid smooth hydraulic damper mechanism',
      'Supplied with stainless food tongs and burner covers',
      'Disinfected in commercial conveyor dishwasher',
    ],
    packagingNotes: 'Packaged in foam-lined heavy duty catering crates.',
    loadingDockRequirements: 'Standard cargo or car trunk.',
    qualityInspected: true,
    minRentalDays: 1,
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'res-boardroom-penthouse',
    providerId: 'biz-sai-palace',
    providerName: 'Sai Palace Suites & Events',
    providerLocation: 'Panvel, Navi Mumbai',
    providerRating: 4.7,
    providerReviewsCount: 29,
    name: 'Executive Penthouse Boardroom (35 guests, 4K Hub)',
    category: 'Event Spaces',
    description: 'Private 35-seat executive boardroom with 85-inch interactive digital whiteboard, polycom surround audio array, private espresso pantry, and panoramic Sahyadri hill views.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3N9_laYm7rHAqlHmqd-cjnuI0gzE8j1JAE4vRl9RV34TRN9eLhsX3oNThZNtcCOzb6W3OvpeYBrPFXl_2pvkGMDQ28JINIEqcVOA_v_dfQtcGPVq1NHEKMBTAbc7VV7GmmLePX52QgL9FCu2hdKJ6kyeJxZU-ZFu_1zKjv1pVhlYe-BYeDh24_05KlJl3nQH13I6-Bzxz8AYav2DOHQPt_4h9vlIOmZXCm5a5Q55BKI657FdBxFnQCQ',
    galleryUrls: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC3N9_laYm7rHAqlHmqd-cjnuI0gzE8j1JAE4vRl9RV34TRN9eLhsX3oNThZNtcCOzb6W3OvpeYBrPFXl_2pvkGMDQ28JINIEqcVOA_v_dfQtcGPVq1NHEKMBTAbc7VV7GmmLePX52QgL9FCu2hdKJ6kyeJxZU-ZFu_1zKjv1pVhlYe-BYeDh24_05KlJl3nQH13I6-Bzxz8AYav2DOHQPt_4h9vlIOmZXCm5a5Q55BKI657FdBxFnQCQ',
    ],
    quantityTotal: 1,
    pricePerUnitPerDay: 15000, // ₹15,000 / day
    depositPercent: 20,
    location: 'Panvel, Navi Mumbai',
    distanceKm: 8.5,
    availabilityStartDate: '2026-09-01',
    availabilityEndDate: '2026-12-31',
    deliveryOptions: {
      pickupAvailable: true,
      deliveryAvailable: false,
      maxDistanceKm: 0,
      flatDeliveryFee: 0,
    },
    specifications: [
      'Ergonomic leather executive swivel chairs',
      'Dual 85" 4K Sony Bravia video conference displays',
      'Private steward and dedicated high-speed guest WiFi (500 Mbps)',
      'Attached private washroom and pre-function lounge',
    ],
    packagingNotes: 'On-site venue reservation with keycard access provided.',
    loadingDockRequirements: 'Dedicated VIP elevator and secure underground parking.',
    qualityInspected: true,
    minRentalDays: 1,
    createdAt: '2026-09-19T12:00:00.000Z',
  },
];

// Pre-seeded Demo Booking with Porter Delivery Tracking (demonstrates quantity subtraction & tracking)
const SEED_BOOKINGS: BookingRecord[] = [
  {
    id: 'book-1001',
    dealId: 'deal-001',
    requestId: 'req-001',
    seekerId: 'biz-apex-centre',
    seekerName: 'Apex Convention Centre',
    providerId: 'biz-grand-horizon',
    providerName: 'Grand Horizon Hotel',
    resourceId: 'res-chairs-chiavari',
    resourceName: '250x Gold Chiavari Banquet Chairs with Cushions',
    resourceImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-CYgaAYUcrbyc-vkPRsiYs5T07TJdKC9lxt9yn-Al_0n_QKc7AHTu3yJY_AmGtHBqqFS_SwYT-4-3kRrQiqw5a3kCgK_FkGEmnvkEYMkdmXdGnt_u5nqo7h5E0orvNf_cf5UjvWbcXj875zygXY9Jh00PElHjCK7Ethf-jfHD8IspZqMKqSLt9ffFujGUz8BBCkdwFtwMb8ZJic20XEsy5llWci7v5NLEOgsU0ONyAZBBlovyXEZJGw',
    quantity: 100, // 100 chairs booked out of 250! Only 150 remain for this period!
    startDate: '2026-09-25',
    endDate: '2026-09-28',
    rentalDays: 3,
    subtotalRental: 36000, // 100 * 3 * 120
    deliveryFee: 1800,
    depositAmount: 5400, // 15% of 36000
    totalPaid: 43200,
    paymentStatus: 'SUCCESS',
    simulatedTransactionId: 'SIM-PAY-HDFC-994821',
    paymentMethod: 'Corporate NetBanking (HDFC/ICICI)',
    paidAt: '2026-09-24T18:00:00.000Z',
    bookingStatus: 'IN_PROGRESS',
    deliveryStatus: 'IN_TRANSIT',
    deliveryTracking: {
      partner: 'Porter',
      trackingNumber: 'PRTR-MUM-89234',
      driverName: 'Suresh Patil',
      driverPhone: '+91 98234 11299',
      vehicleNumber: 'MH-46-BM-7712 (Tata 407 14ft)',
      currentStepIndex: 3,
      timeline: [
        {
          status: 'PENDING',
          title: 'Dispatch Requested',
          description: 'Dock slot reserved by Grand Horizon Hotel dispatch team.',
          timestamp: '2026-09-24 14:00',
          completed: true,
        },
        {
          status: 'ASSIGNED',
          title: 'Porter Vehicle Assigned',
          description: 'Driver Suresh Patil confirmed pickup with Tata 407 (MH-46-BM-7712).',
          timestamp: '2026-09-24 15:30',
          completed: true,
        },
        {
          status: 'PICKED_UP',
          title: 'Loaded & Quality Inspected',
          description: '100 units loaded with protective covers at Vashi hotel bay 2.',
          timestamp: '2026-09-24 17:15',
          completed: true,
        },
        {
          status: 'IN_TRANSIT',
          title: 'In Transit to Seawoods',
          description: 'En route via Palm Beach Road. Estimated delivery in 25 mins.',
          timestamp: '2026-09-24 18:45',
          completed: true,
        },
        {
          status: 'DELIVERED',
          title: 'Loading Dock Handover',
          description: 'Final count sign-off by receiving banquet manager.',
          timestamp: 'Expected 2026-09-24 19:30',
          completed: false,
        },
      ],
    },
    createdAt: '2026-09-24T14:00:00.000Z',
  },
];

const SEED_REQUESTS: ResourceRequest[] = [
  {
    id: 'req-001',
    seekerId: 'biz-apex-centre',
    seekerName: 'Apex Convention Centre',
    seekerLocation: 'Seawoods, Navi Mumbai',
    providerId: 'biz-grand-horizon',
    providerName: 'Grand Horizon Hotel',
    resourceId: 'res-chairs-chiavari',
    resourceName: '250x Gold Chiavari Banquet Chairs with Cushions',
    resourceImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-CYgaAYUcrbyc-vkPRsiYs5T07TJdKC9lxt9yn-Al_0n_QKc7AHTu3yJY_AmGtHBqqFS_SwYT-4-3kRrQiqw5a3kCgK_FkGEmnvkEYMkdmXdGnt_u5nqo7h5E0orvNf_cf5UjvWbcXj875zygXY9Jh00PElHjCK7Ethf-jfHD8IspZqMKqSLt9ffFujGUz8BBCkdwFtwMb8ZJic20XEsy5llWci7v5NLEOgsU0ONyAZBBlovyXEZJGw',
    quantity: 100,
    startDate: '2026-09-25',
    endDate: '2026-09-28',
    rentalDays: 3,
    deliveryRequired: true,
    deliveryAddress: 'Hall 3, Grand Central Mall Complex, Seawoods, Navi Mumbai',
    status: 'ACCEPTED',
    notes: 'Need chairs for medical conference gala dinner. Loading dock accessible.',
    proposedPricePerUnit: 120,
    createdAt: '2026-09-23T11:00:00.000Z',
  },
  {
    id: 'req-002',
    seekerId: 'biz-royal-banquets',
    seekerName: 'Royal Banquets & Convention',
    seekerLocation: 'CBD Belapur, Navi Mumbai',
    providerId: 'biz-urban-caterers',
    providerName: 'Urban Gala Caterers',
    resourceId: 'res-combi-oven',
    resourceName: 'Rational iCombi Pro 10-Pan Commercial Steamer Oven',
    resourceImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Bvt9xEHhMXh4Eav2DhHntp_Q7v17rSTrUTH5wSyHOrwQwYNtnmfa0pGMODcgsMUSmu8Zmtvb0G7T4tnx1RsHfDdCeAJ911f4Z_LcYRphBEbOBaHvf7jmO5x1ASSZKRL9QDNRHl9G6pMaMzZX4Imn4EQgmIxnu4hi7RfHqkkdMafoE0X1uyjP1mo8qoTr9s9LImI_qftU4aHMxsKP-ONaIhSZHp03D7blHDSaboqJrmyu6MZY96h59Q',
    quantity: 1,
    startDate: '2026-10-02',
    endDate: '2026-10-04',
    rentalDays: 2,
    deliveryRequired: true,
    deliveryAddress: 'Kitchen Bay B, Royal Banquets, Sector 15 Belapur',
    status: 'COUNTERED',
    notes: 'High-surge corporate Diwali banquet prep weekend. Requesting slight price adjustment.',
    proposedPricePerUnit: 8000,
    createdAt: '2026-09-24T10:15:00.000Z',
  },
];

const SEED_DEALS: DealRecord[] = [
  {
    id: 'deal-001',
    requestId: 'req-001',
    seekerId: 'biz-apex-centre',
    seekerName: 'Apex Convention Centre',
    providerId: 'biz-grand-horizon',
    providerName: 'Grand Horizon Hotel',
    resourceId: 'res-chairs-chiavari',
    resourceName: '250x Gold Chiavari Banquet Chairs with Cushions',
    resourceImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-CYgaAYUcrbyc-vkPRsiYs5T07TJdKC9lxt9yn-Al_0n_QKc7AHTu3yJY_AmGtHBqqFS_SwYT-4-3kRrQiqw5a3kCgK_FkGEmnvkEYMkdmXdGnt_u5nqo7h5E0orvNf_cf5UjvWbcXj875zygXY9Jh00PElHjCK7Ethf-jfHD8IspZqMKqSLt9ffFujGUz8BBCkdwFtwMb8ZJic20XEsy5llWci7v5NLEOgsU0ONyAZBBlovyXEZJGw',
    quantity: 100,
    startDate: '2026-09-25',
    endDate: '2026-09-28',
    rentalDays: 3,
    rentalPricePerUnit: 120,
    subtotalRental: 36000,
    deliveryFee: 1800,
    depositPercent: 15,
    depositAmount: 5400,
    totalAmount: 43200,
    status: 'CONFIRMED',
    proposedBy: 'PROVIDER',
    lastModifiedByRole: 'PROVIDER',
    finalizedAt: '2026-09-24T13:45:00.000Z',
    createdAt: '2026-09-23T12:00:00.000Z',
  },
  {
    id: 'deal-002',
    requestId: 'req-002',
    seekerId: 'biz-royal-banquets',
    seekerName: 'Royal Banquets & Convention',
    providerId: 'biz-urban-caterers',
    providerName: 'Urban Gala Caterers',
    resourceId: 'res-combi-oven',
    resourceName: 'Rational iCombi Pro 10-Pan Commercial Steamer Oven',
    resourceImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Bvt9xEHhMXh4Eav2DhHntp_Q7v17rSTrUTH5wSyHOrwQwYNtnmfa0pGMODcgsMUSmu8Zmtvb0G7T4tnx1RsHfDdCeAJ911f4Z_LcYRphBEbOBaHvf7jmO5x1ASSZKRL9QDNRHl9G6pMaMzZX4Imn4EQgmIxnu4hi7RfHqkkdMafoE0X1uyjP1mo8qoTr9s9LImI_qftU4aHMxsKP-ONaIhSZHp03D7blHDSaboqJrmyu6MZY96h59Q',
    quantity: 1,
    startDate: '2026-10-02',
    endDate: '2026-10-04',
    rentalDays: 2,
    rentalPricePerUnit: 8000,
    subtotalRental: 16000,
    deliveryFee: 3000,
    depositPercent: 20,
    depositAmount: 3200,
    totalAmount: 22200,
    status: 'NEGOTIATING',
    proposedBy: 'SEEKER',
    lastModifiedByRole: 'SEEKER',
    createdAt: '2026-09-24T10:30:00.000Z',
  },
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-101',
    requestId: 'req-002',
    dealId: 'deal-002',
    senderId: 'biz-royal-banquets',
    senderName: 'Royal Banquets (Rajesh Sharma)',
    senderRole: 'SEEKER',
    text: 'Hello Urban Caterers team, we have a major wedding banquet on Oct 2-4 and our secondary steamer is under maintenance. Can you provide the Rational Combi oven for ₹8,000/day?',
    timestamp: '2026-09-24T10:15:00.000Z',
  },
  {
    id: 'msg-102',
    requestId: 'req-002',
    dealId: 'deal-002',
    senderId: 'biz-urban-caterers',
    senderName: 'Urban Gala Caterers (Chef Vikram)',
    senderRole: 'PROVIDER',
    text: 'Namaste Rajesh ji. ₹8,000/day works for 2 days since you are our regular peer in Belapur. We will deliver it on our hydraulic lift truck with sanitized water hoses.',
    timestamp: '2026-09-24T10:25:00.000Z',
  },
  {
    id: 'msg-103',
    requestId: 'req-002',
    dealId: 'deal-002',
    senderId: 'biz-royal-banquets',
    senderName: 'Royal Banquets (Rajesh Sharma)',
    senderRole: 'SEEKER',
    text: 'Excellent! I have updated the structured Deal Summary with ₹8,000/day and ₹3,000 delivery fee. Please inspect and finalize.',
    timestamp: '2026-09-24T10:30:00.000Z',
    structuredProposalSnapshot: {
      quantity: 1,
      rentalPricePerUnit: 8000,
      deliveryFee: 3000,
      depositPercent: 20,
      totalAmount: 22200,
    },
  },
];

const SEED_REVIEWS: ReviewRecord[] = [
  {
    id: 'rev-001',
    bookingId: 'book-prev-1',
    reviewerId: 'biz-urban-caterers',
    reviewerName: 'Urban Gala Caterers',
    reviewerRole: 'SEEKER',
    targetBusinessId: 'biz-grand-horizon',
    targetBusinessName: 'Grand Horizon Hotel',
    resourceId: 'res-chairs-chiavari',
    resourceName: '250x Gold Chiavari Banquet Chairs with Cushions',
    rating: 5,
    comment: 'Pristine chairs, perfectly cushioned and pre-stacked on pallets. Made our CIDCO exhibition gala look world-class. Return process was completely smooth.',
    createdAt: '2026-09-15T12:00:00.000Z',
  },
  {
    id: 'rev-002',
    bookingId: 'book-prev-2',
    reviewerId: 'biz-grand-horizon',
    reviewerName: 'Grand Horizon Hotel',
    reviewerRole: 'PROVIDER',
    targetBusinessId: 'biz-urban-caterers',
    targetBusinessName: 'Urban Gala Caterers',
    resourceId: 'res-chairs-chiavari',
    resourceName: '250x Gold Chiavari Banquet Chairs with Cushions',
    rating: 5,
    comment: 'Urban Caterers handled all 150 chairs with great care. Zero damages, returned promptly on time. 100% recommended peer partner.',
    createdAt: '2026-09-16T09:30:00.000Z',
  },
];

const SEED_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: 'sub-grand-horizon',
    partyId: 'biz-grand-horizon',
    partyName: 'Grand Horizon Hotel',
    partyType: 'SEEKER',
    planName: 'Seeker Pro Pass',
    status: 'ACTIVE',
    currentPeriodStart: '2026-09-01T00:00:00.000Z',
    currentPeriodEnd: '2026-10-01T00:00:00.000Z',
    autoRenew: true,
    initialTokenAllocation: 125,
    pricePaid: 2999,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'sub-apex-centre',
    partyId: 'biz-apex-centre',
    partyName: 'Apex Convention Centre',
    partyType: 'SEEKER',
    planName: 'Seeker Pro Pass',
    status: 'ACTIVE',
    currentPeriodStart: '2026-09-01T00:00:00.000Z',
    currentPeriodEnd: '2026-10-01T00:00:00.000Z',
    autoRenew: true,
    initialTokenAllocation: 125,
    pricePaid: 2999,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'sub-royal-banquets',
    partyId: 'biz-royal-banquets',
    partyName: 'Royal Banquets & Convention',
    partyType: 'PROVIDER',
    planName: 'Provider Enterprise Hub',
    status: 'ACTIVE',
    currentPeriodStart: '2026-09-01T00:00:00.000Z',
    currentPeriodEnd: '2026-10-01T00:00:00.000Z',
    autoRenew: true,
    initialTokenAllocation: 0,
    pricePaid: 4999,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'sub-urban-caterers',
    partyId: 'biz-urban-caterers',
    partyName: 'Urban Gala Caterers',
    partyType: 'PROVIDER',
    planName: 'Provider Enterprise Hub',
    status: 'ACTIVE',
    currentPeriodStart: '2026-09-01T00:00:00.000Z',
    currentPeriodEnd: '2026-10-01T00:00:00.000Z',
    autoRenew: true,
    initialTokenAllocation: 0,
    pricePaid: 4999,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
];

const SEED_TOKEN_LEDGER: DeliveryTokenLedgerEntry[] = [
  {
    id: 'tl-gh-01',
    seekerId: 'biz-grand-horizon',
    type: 'GRANT',
    amount: 125,
    balanceAfter: 125,
    referenceId: 'sub-grand-horizon',
    notes: 'Monthly subscription allocation of 125 Delivery Tokens (D.T.)',
    isSimulated: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'tl-gh-02',
    seekerId: 'biz-grand-horizon',
    type: 'CONSUME',
    amount: -1,
    balanceAfter: 124,
    referenceId: 'book-1',
    notes: 'Porter delivery token consumption for booking #book-1',
    isSimulated: true,
    createdAt: '2026-09-24T14:05:00.000Z',
  },
  {
    id: 'tl-ac-01',
    seekerId: 'biz-apex-centre',
    type: 'GRANT',
    amount: 125,
    balanceAfter: 125,
    referenceId: 'sub-apex-centre',
    notes: 'Monthly subscription allocation of 125 Delivery Tokens (D.T.)',
    isSimulated: true,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

const SEED_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay-gh-sub',
    partyId: 'biz-grand-horizon',
    partyName: 'Grand Horizon Hotel',
    partyType: 'SEEKER',
    type: 'SUBSCRIPTION_FEE',
    amount: 2999,
    status: 'SUCCESS',
    referenceId: 'sub-grand-horizon',
    paymentMethod: 'Corporate NetBanking',
    simulatedTransactionId: 'SIM-TXN-SUB-98101',
    isSimulated: true,
    simulationBadge: 'PROTOTYPE / SIMULATED PAYMENT',
    description: 'Monthly Seeker Pro Pass Subscription Fee',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'pay-bk1-rent',
    partyId: 'biz-grand-horizon',
    partyName: 'Grand Horizon Hotel',
    partyType: 'SEEKER',
    type: 'RENT',
    amount: 36000,
    status: 'SUCCESS',
    referenceId: 'deal-001',
    paymentMethod: 'Corporate NetBanking',
    simulatedTransactionId: 'SIM-TXN-RENT-44012',
    isSimulated: true,
    simulationBadge: 'PROTOTYPE / SIMULATED PAYMENT',
    description: 'Rental subtotal for 100x Gold Chiavari Chairs (3 days)',
    createdAt: '2026-09-24T14:00:00.000Z',
  },
  {
    id: 'pay-bk1-deposit',
    partyId: 'biz-grand-horizon',
    partyName: 'Grand Horizon Hotel',
    partyType: 'SEEKER',
    type: 'DEPOSIT',
    amount: 5400,
    status: 'SUCCESS',
    referenceId: 'deal-001',
    paymentMethod: 'Corporate NetBanking',
    simulatedTransactionId: 'SIM-TXN-DEP-44013',
    isSimulated: true,
    simulationBadge: 'PROTOTYPE / SIMULATED PAYMENT',
    description: 'Refundable Security Deposit (15%)',
    createdAt: '2026-09-24T14:00:00.000Z',
  },
  {
    id: 'pay-bk1-fee',
    partyId: 'biz-grand-horizon',
    partyName: 'Grand Horizon Hotel',
    partyType: 'SEEKER',
    type: 'SERVICE_FEE',
    amount: 1800,
    status: 'SUCCESS',
    referenceId: 'deal-001',
    paymentMethod: 'Corporate NetBanking',
    simulatedTransactionId: 'SIM-TXN-FEE-44014',
    isSimulated: true,
    simulationBadge: 'PROTOTYPE / SIMULATED PAYMENT',
    description: 'VenueX Marketplace Service Fee (5%)',
    createdAt: '2026-09-24T14:00:00.000Z',
  },
  {
    id: 'pay-bk1-payout',
    partyId: 'porter-logistics',
    partyName: 'Porter Express Logistics',
    partyType: 'LOGISTICS_PARTNER',
    type: 'DELIVERY_PAYOUT',
    amount: 1200,
    status: 'SUCCESS',
    referenceId: 'book-1',
    paymentMethod: 'VenueX Platform Payout',
    simulatedTransactionId: 'SIM-TXN-LOG-88192',
    isSimulated: true,
    simulationBadge: 'PROTOTYPE / SIMULATED PAYMENT',
    description: 'VenueX logistics settlement to Porter driver for booking #book-1',
    createdAt: '2026-09-24T14:05:00.000Z',
  },
];

// Open IndexedDB database instance
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Fallback / mirror to localStorage to guarantee data durability in all contexts
function getLocalStorageStore<T>(storeName: StoreName): T[] | null {
  try {
    const data = localStorage.getItem(`venuex_${storeName}`);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn(`Failed reading ${storeName} from localStorage`, e);
  }
  return null;
}

function setLocalStorageStore<T>(storeName: StoreName, items: T[]): void {
  try {
    localStorage.setItem(`venuex_${storeName}`, JSON.stringify(items));
  } catch (e) {
    console.warn(`Failed writing ${storeName} to localStorage`, e);
  }
}

// Seed the database if empty
export async function initializeDatabase(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES, 'readwrite');
    const bizStore = tx.objectStore('businesses');

    const countReq = bizStore.count();
    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        // Seed all stores
        const txSeed = db.transaction(STORES, 'readwrite');
        SEED_BUSINESSES.forEach(b => txSeed.objectStore('businesses').put(b));
        SEED_RESOURCES.forEach(r => txSeed.objectStore('resources').put(r));
        SEED_REQUESTS.forEach(req => txSeed.objectStore('requests').put(req));
        SEED_DEALS.forEach(d => txSeed.objectStore('deals').put(d));
        SEED_MESSAGES.forEach(m => txSeed.objectStore('messages').put(m));
        SEED_BOOKINGS.forEach(b => txSeed.objectStore('bookings').put(b));
        SEED_REVIEWS.forEach(rv => txSeed.objectStore('reviews').put(rv));
        SEED_SUBSCRIPTIONS.forEach(s => txSeed.objectStore('subscriptions').put(s));
        SEED_TOKEN_LEDGER.forEach(tl => txSeed.objectStore('tokenLedger').put(tl));
        SEED_PAYMENT_RECORDS.forEach(pr => txSeed.objectStore('paymentRecords').put(pr));

        // Mirror in localStorage
        setLocalStorageStore('businesses', SEED_BUSINESSES);
        setLocalStorageStore('resources', SEED_RESOURCES);
        setLocalStorageStore('requests', SEED_REQUESTS);
        setLocalStorageStore('deals', SEED_DEALS);
        setLocalStorageStore('messages', SEED_MESSAGES);
        setLocalStorageStore('bookings', SEED_BOOKINGS);
        setLocalStorageStore('reviews', SEED_REVIEWS);
        setLocalStorageStore('subscriptions', SEED_SUBSCRIPTIONS);
        setLocalStorageStore('tokenLedger', SEED_TOKEN_LEDGER);
        setLocalStorageStore('paymentRecords', SEED_PAYMENT_RECORDS);

        txSeed.oncomplete = () => {
          notifySubscribers();
        };
      }
    };
  } catch (err) {
    console.warn('IndexedDB unavailable, falling back to localStorage', err);
    if (!getLocalStorageStore('businesses')) {
      setLocalStorageStore('businesses', SEED_BUSINESSES);
      setLocalStorageStore('resources', SEED_RESOURCES);
      setLocalStorageStore('requests', SEED_REQUESTS);
      setLocalStorageStore('deals', SEED_DEALS);
      setLocalStorageStore('messages', SEED_MESSAGES);
      setLocalStorageStore('bookings', SEED_BOOKINGS);
      setLocalStorageStore('reviews', SEED_REVIEWS);
      setLocalStorageStore('subscriptions', SEED_SUBSCRIPTIONS);
      setLocalStorageStore('tokenLedger', SEED_TOKEN_LEDGER);
      setLocalStorageStore('paymentRecords', SEED_PAYMENT_RECORDS);
    }
  }
}

// Generic Store Access
async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as T[];
        if (results && results.length > 0) {
          resolve(results);
        } else {
          // Check localStorage fallback
          const local = getLocalStorageStore<T>(storeName);
          resolve(local || []);
        }
      };
      req.onerror = () => {
        const local = getLocalStorageStore<T>(storeName);
        resolve(local || []);
      };
    });
  } catch {
    const local = getLocalStorageStore<T>(storeName);
    return local || [];
  }
}

async function putToStore<T extends { id: string }>(storeName: StoreName, item: T): Promise<T> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(item);
  } catch (e) {
    console.warn(`IndexedDB write error for ${storeName}`, e);
  }

  // Update localStorage mirror
  const current = getLocalStorageStore<T>(storeName) || [];
  const idx = current.findIndex(x => x.id === item.id);
  if (idx >= 0) {
    current[idx] = item;
  } else {
    current.unshift(item);
  }
  setLocalStorageStore(storeName, current);

  notifySubscribers();
  return item;
}

// Public API
export const db = {
  // Businesses
  async getBusinesses(): Promise<BusinessProfile[]> {
    return getAllFromStore<BusinessProfile>('businesses');
  },
  async getBusinessById(id: string): Promise<BusinessProfile | null> {
    const list = await this.getBusinesses();
    return list.find(b => b.id === id) || null;
  },
  async saveBusiness(biz: BusinessProfile): Promise<BusinessProfile> {
    return putToStore<BusinessProfile>('businesses', biz);
  },

  // Resources
  async getResources(): Promise<ResourceListing[]> {
    return getAllFromStore<ResourceListing>('resources');
  },
  async getResourceById(id: string): Promise<ResourceListing | null> {
    const list = await this.getResources();
    return list.find(r => r.id === id) || null;
  },
  async saveResource(res: ResourceListing): Promise<ResourceListing> {
    return putToStore<ResourceListing>('resources', res);
  },

  // Requests
  async getRequests(): Promise<ResourceRequest[]> {
    return getAllFromStore<ResourceRequest>('requests');
  },
  async getRequestById(id: string): Promise<ResourceRequest | null> {
    const list = await this.getRequests();
    return list.find(r => r.id === id) || null;
  },
  async saveRequest(req: ResourceRequest): Promise<ResourceRequest> {
    return putToStore<ResourceRequest>('requests', req);
  },

  // Deals
  async getDeals(): Promise<DealRecord[]> {
    return getAllFromStore<DealRecord>('deals');
  },
  async getDealById(id: string): Promise<DealRecord | null> {
    const list = await this.getDeals();
    return list.find(d => d.id === id) || null;
  },
  async getDealByRequestId(requestId: string): Promise<DealRecord | null> {
    const list = await this.getDeals();
    return list.find(d => d.requestId === requestId) || null;
  },
  async saveDeal(deal: DealRecord): Promise<DealRecord> {
    return putToStore<DealRecord>('deals', deal);
  },

  // Messages
  async getMessagesByRequestId(requestId: string): Promise<ChatMessage[]> {
    const list = await getAllFromStore<ChatMessage>('messages');
    return list
      .filter(m => m.requestId === requestId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  async saveMessage(msg: ChatMessage): Promise<ChatMessage> {
    return putToStore<ChatMessage>('messages', msg);
  },

  // Bookings
  async getBookings(): Promise<BookingRecord[]> {
    return getAllFromStore<BookingRecord>('bookings');
  },
  async getBookingById(id: string): Promise<BookingRecord | null> {
    const list = await this.getBookings();
    return list.find(b => b.id === id) || null;
  },
  async saveBooking(booking: BookingRecord): Promise<BookingRecord> {
    return putToStore<BookingRecord>('bookings', booking);
  },

  // Reviews
  async getReviews(): Promise<ReviewRecord[]> {
    return getAllFromStore<ReviewRecord>('reviews');
  },
  async getReviewsForBusiness(businessId: string): Promise<ReviewRecord[]> {
    const list = await this.getReviews();
    return list.filter(r => r.targetBusinessId === businessId);
  },
  async saveReview(review: ReviewRecord): Promise<ReviewRecord> {
    const saved = await putToStore<ReviewRecord>('reviews', review);
    // Update target business average rating
    const allForBiz = await this.getReviewsForBusiness(review.targetBusinessId);
    const avg = allForBiz.reduce((sum, r) => sum + r.rating, 0) / allForBiz.length;
    const biz = await this.getBusinessById(review.targetBusinessId);
    if (biz) {
      biz.rating = Math.round(avg * 10) / 10;
      biz.reviewsCount = allForBiz.length;
      await this.saveBusiness(biz);
    }
    return saved;
  },

  // Subscriptions
  async getSubscriptions(): Promise<SubscriptionRecord[]> {
    return getAllFromStore<SubscriptionRecord>('subscriptions');
  },
  async getSubscriptionByParty(partyId: string): Promise<SubscriptionRecord | null> {
    const list = await this.getSubscriptions();
    return list.find(s => s.partyId === partyId && s.status === 'ACTIVE') || list.find(s => s.partyId === partyId) || null;
  },
  async saveSubscription(sub: SubscriptionRecord): Promise<SubscriptionRecord> {
    return putToStore<SubscriptionRecord>('subscriptions', sub);
  },

  // Token Ledger
  async getTokenLedger(): Promise<DeliveryTokenLedgerEntry[]> {
    return getAllFromStore<DeliveryTokenLedgerEntry>('tokenLedger');
  },
  async getTokenLedgerForSeeker(seekerId: string): Promise<DeliveryTokenLedgerEntry[]> {
    const list = await this.getTokenLedger();
    return list
      .filter(t => t.seekerId === seekerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async saveTokenLedgerEntry(entry: DeliveryTokenLedgerEntry): Promise<DeliveryTokenLedgerEntry> {
    return putToStore<DeliveryTokenLedgerEntry>('tokenLedger', entry);
  },

  // Payment Records
  async getPaymentRecords(): Promise<PaymentRecord[]> {
    return getAllFromStore<PaymentRecord>('paymentRecords');
  },
  async getPaymentRecordsForParty(partyId: string): Promise<PaymentRecord[]> {
    const list = await this.getPaymentRecords();
    return list
      .filter(p => p.partyId === partyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  async savePaymentRecord(record: PaymentRecord): Promise<PaymentRecord> {
    return putToStore<PaymentRecord>('paymentRecords', record);
  },

  // Reset database back to default seed data
  async resetToSeed(): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES, 'readwrite');
      STORES.forEach(s => tx.objectStore(s).clear());
      
      SEED_BUSINESSES.forEach(b => tx.objectStore('businesses').put(b));
      SEED_RESOURCES.forEach(r => tx.objectStore('resources').put(r));
      SEED_REQUESTS.forEach(req => tx.objectStore('requests').put(req));
      SEED_DEALS.forEach(d => tx.objectStore('deals').put(d));
      SEED_MESSAGES.forEach(m => tx.objectStore('messages').put(m));
      SEED_BOOKINGS.forEach(b => tx.objectStore('bookings').put(b));
      SEED_REVIEWS.forEach(rv => tx.objectStore('reviews').put(rv));
      SEED_SUBSCRIPTIONS.forEach(s => tx.objectStore('subscriptions').put(s));
      SEED_TOKEN_LEDGER.forEach(tl => tx.objectStore('tokenLedger').put(tl));
      SEED_PAYMENT_RECORDS.forEach(pr => tx.objectStore('paymentRecords').put(pr));

      setLocalStorageStore('businesses', SEED_BUSINESSES);
      setLocalStorageStore('resources', SEED_RESOURCES);
      setLocalStorageStore('requests', SEED_REQUESTS);
      setLocalStorageStore('deals', SEED_DEALS);
      setLocalStorageStore('messages', SEED_MESSAGES);
      setLocalStorageStore('bookings', SEED_BOOKINGS);
      setLocalStorageStore('reviews', SEED_REVIEWS);
      setLocalStorageStore('subscriptions', SEED_SUBSCRIPTIONS);
      setLocalStorageStore('tokenLedger', SEED_TOKEN_LEDGER);
      setLocalStorageStore('paymentRecords', SEED_PAYMENT_RECORDS);

      tx.oncomplete = () => {
        notifySubscribers();
      };
    } catch {
      setLocalStorageStore('businesses', SEED_BUSINESSES);
      setLocalStorageStore('resources', SEED_RESOURCES);
      setLocalStorageStore('requests', SEED_REQUESTS);
      setLocalStorageStore('deals', SEED_DEALS);
      setLocalStorageStore('messages', SEED_MESSAGES);
      setLocalStorageStore('bookings', SEED_BOOKINGS);
      setLocalStorageStore('reviews', SEED_REVIEWS);
      setLocalStorageStore('subscriptions', SEED_SUBSCRIPTIONS);
      setLocalStorageStore('tokenLedger', SEED_TOKEN_LEDGER);
      setLocalStorageStore('paymentRecords', SEED_PAYMENT_RECORDS);
      notifySubscribers();
    }
  }
};

