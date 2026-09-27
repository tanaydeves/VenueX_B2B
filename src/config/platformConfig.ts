export interface ExtraTokenPack {
  id: string;
  name: string;
  tokenAmount: number;
  price: number; // in INR ₹
  badge?: string;
}

export interface PlatformConfig {
  seekerServiceFeePercent: number; // e.g. 5 for 5% of rental subtotal
  seekerSubscriptionPrice: number; // in INR ₹, e.g. 2999
  seekerSubscriptionTokensGrant: number; // e.g. 125 D.T.
  providerSubscriptionPrice: number; // in INR ₹, e.g. 4999
  deliveryTokenCostPerOrder: number; // e.g. 1 D.T. per delivery request
  extraTokenPacks: ExtraTokenPack[];
}

// Initial Platform Settings (Configurable Constants - avoid hardcoded magic numbers)
export const DEFAULT_PLATFORM_CONFIG: PlatformConfig = {
  seekerServiceFeePercent: 5.0, // 5% VenueX Service Fee on Seeker deal finalization
  seekerSubscriptionPrice: 2999, // ₹2,999 / month Seeker Subscription
  seekerSubscriptionTokensGrant: 125, // 125 Delivery Tokens (D.T.) granted per subscription cycle
  providerSubscriptionPrice: 4999, // ₹4,999 / month Provider Subscription Fee
  deliveryTokenCostPerOrder: 1, // 1 D.T. per logistics delivery request
  extraTokenPacks: [
    {
      id: 'pack-starter',
      name: 'Starter Top-Up',
      tokenAmount: 25,
      price: 500, // ₹500 for 25 D.T. (₹20/D.T.)
    },
    {
      id: 'pack-pro',
      name: 'Pro Event Pack',
      tokenAmount: 50,
      price: 900, // ₹900 for 50 D.T. (₹18/D.T. - 10% saving)
      badge: 'Popular',
    },
    {
      id: 'pack-enterprise',
      name: 'Enterprise Bulk Pack',
      tokenAmount: 120,
      price: 1999, // ₹1,999 for 120 D.T. (Best value)
      badge: 'Best Value',
    },
  ],
};

let currentConfig: PlatformConfig = { ...DEFAULT_PLATFORM_CONFIG };

export function getPlatformConfig(): PlatformConfig {
  return currentConfig;
}

export function updatePlatformConfig(newConfig: Partial<PlatformConfig>): PlatformConfig {
  currentConfig = {
    ...currentConfig,
    ...newConfig,
  };
  return currentConfig;
}
