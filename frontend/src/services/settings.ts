// Settings service for merchant configuration

// Account settings interfaces
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'invited' | 'disabled';
  lastLogin?: string;
}

export interface BillingInfo {
  plan: string;
  billingCycle: 'monthly' | 'annual';
  nextBillingDate: string;
  paymentMethod: {
    type: 'credit_card' | 'paypal' | 'bank_transfer';
    lastFour?: string;
    expiryDate?: string;
  };
}

export interface AccountSettings {
  profile: {
    companyName: string;
    website: string;
    contactEmail: string;
    contactPhone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    timezone: string;
    language: string;
  };
  teamMembers: TeamMember[];
  billing: BillingInfo;
}

// Integration settings interfaces
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  permissions: string[];
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  secret?: string;
}

export interface DataSyncConfig {
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSync?: string;
  entities: {
    products: boolean;
    customers: boolean;
    orders: boolean;
    inventory: boolean;
  };
}

export interface IntegrationSettings {
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  dataSync: DataSyncConfig;
  connectedPlatforms: {
    shopify?: {
      connected: boolean;
      storeUrl?: string;
      accessToken?: string;
    };
    magento?: {
      connected: boolean;
      storeUrl?: string;
      accessToken?: string;
    };
    woocommerce?: {
      connected: boolean;
      storeUrl?: string;
      consumerKey?: string;
      consumerSecret?: string;
    };
    bigcommerce?: {
      connected: boolean;
      storeUrl?: string;
      accessToken?: string;
    };
  };
}

// Appearance settings interfaces
export interface WidgetCustomization {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  showLogo: boolean;
  customCss?: string;
}

export interface AppearanceSettings {
  widget: WidgetCustomization;
  branding: {
    logo: string;
    favicon: string;
    companyName: string;
    tagline?: string;
  };
  emailTemplates: {
    headerColor: string;
    footerColor: string;
    fontFamily: string;
    showLogo: boolean;
  };
}

// Recommendation settings interfaces
export interface RecommendationSettings {
  algorithm: {
    preferenceWeight: number;
    similarityWeight: number;
    popularityWeight: number;
    newArrivalsBoost: number;
  };
  filters: {
    excludeOutOfStock: boolean;
    excludeLowInventory: boolean;
    minimumRating: number;
    priceRange: {
      min?: number;
      max?: number;
    };
    includedCategories: string[];
    excludedCategories: string[];
  };
  display: {
    maxRecommendations: number;
    showPrices: boolean;
    showRatings: boolean;
    showAvailability: boolean;
  };
}

// Notification settings interfaces
export interface NotificationSettings {
  email: {
    dailySummary: boolean;
    weeklySummary: boolean;
    lowInventoryAlerts: boolean;
    newOrderAlerts: boolean;
    customerSupportRequests: boolean;
    systemUpdates: boolean;
  };
  system: {
    browserNotifications: boolean;
    desktopNotifications: boolean;
    mobileAppNotifications: boolean;
  };
  alertThresholds: {
    lowInventory: number;
    highTraffic: number;
    orderVolume: number;
  };
}

// Combined settings interface
export interface MerchantSettings {
  account: AccountSettings;
  integration: IntegrationSettings;
  appearance: AppearanceSettings;
  recommendation: RecommendationSettings;
  notification: NotificationSettings;
}

// Mock data for settings
const mockSettings: MerchantSettings = {
  account: {
    profile: {
      companyName: 'Acme Eyewear',
      website: 'https://acme-eyewear.com',
      contactEmail: 'contact@acme-eyewear.com',
      contactPhone: '+1 (555) 123-4567',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
      },
      timezone: 'America/Los_Angeles',
      language: 'en-US',
    },
    teamMembers: [
      {
        id: 'tm-1',
        name: 'John Doe',
        email: 'john@acme-eyewear.com',
        role: 'Admin',
        status: 'active',
        lastLogin: '2025-04-28T15:30:00Z',
      },
      {
        id: 'tm-2',
        name: 'Jane Smith',
        email: 'jane@acme-eyewear.com',
        role: 'Manager',
        status: 'active',
        lastLogin: '2025-04-27T10:15:00Z',
      },
      {
        id: 'tm-3',
        name: 'Bob Johnson',
        email: 'bob@acme-eyewear.com',
        role: 'Viewer',
        status: 'invited',
      },
    ],
    billing: {
      plan: 'Professional',
      billingCycle: 'annual',
      nextBillingDate: '2026-01-15',
      paymentMethod: {
        type: 'credit_card',
        lastFour: '4242',
        expiryDate: '01/27',
      },
    },
  },
  integration: {
    apiKeys: [
      {
        id: 'key-1',
        name: 'Production API Key',
        key: 'process.env.SETTINGS_SECRET_12',
        createdAt: '2025-01-15T10:00:00Z',
        lastUsed: '2025-04-28T14:25:00Z',
        permissions: ['read', 'write'],
      },
      {
        id: 'key-2',
        name: 'Development API Key',
        key: 'process.env.SETTINGS_SECRET_13',
        createdAt: '2025-01-15T10:05:00Z',
        lastUsed: '2025-04-25T09:30:00Z',
        permissions: ['read'],
      },
    ],
    webhooks: [
      {
        id: 'wh-1',
        url: 'https://acme-eyewear.com/api/varai-webhooks',
        events: ['order.created', 'product.updated'],
        active: true,
        createdAt: '2025-01-20T11:00:00Z',
        lastTriggered: '2025-04-28T16:45:00Z',
        secret: 'process.env.SETTINGS_SECRET_14',
      },
    ],
    dataSync: {
      enabled: true,
      frequency: 'hourly',
      lastSync: '2025-04-29T14:00:00Z',
      entities: {
        products: true,
        customers: true,
        orders: true,
        inventory: true,
      },
    },
    connectedPlatforms: {
      shopify: {
        connected: true,
        storeUrl: 'acme-eyewear.myshopify.com',
        accessToken: '••••••••••••••••••••••••••••••••',
      },
      magento: {
        connected: false,
      },
      woocommerce: {
        connected: false,
      },
      bigcommerce: {
        connected: false,
      },
    },
  },
  appearance: {
    widget: {
      primaryColor: '#4C6FFF',
      secondaryColor: '#F5F7FF',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      buttonStyle: 'rounded',
      showLogo: true,
    },
    branding: {
      logo: 'https://placehold.co/200x60?text=Acme+Eyewear',
      favicon: 'https://placehold.co/32x32?text=AE',
      companyName: 'Acme Eyewear',
      tagline: 'See the world clearly',
    },
    emailTemplates: {
      headerColor: '#4C6FFF',
      footerColor: '#F5F7FF',
      fontFamily: 'Arial, sans-serif',
      showLogo: true,
    },
  },
  recommendation: {
    algorithm: {
      preferenceWeight: 0.7,
      similarityWeight: 0.5,
      popularityWeight: 0.3,
      newArrivalsBoost: 0.2,
    },
    filters: {
      excludeOutOfStock: true,
      excludeLowInventory: false,
      minimumRating: 3.5,
      priceRange: {
        min: 50,
        max: 500,
      },
      includedCategories: ['Sunglasses', 'Prescription', 'Reading'],
      excludedCategories: ['Accessories'],
    },
    display: {
      maxRecommendations: 4,
      showPrices: true,
      showRatings: true,
      showAvailability: true,
    },
  },
  notification: {
    email: {
      dailySummary: false,
      weeklySummary: true,
      lowInventoryAlerts: true,
      newOrderAlerts: true,
      customerSupportRequests: true,
      systemUpdates: true,
    },
    system: {
      browserNotifications: true,
      desktopNotifications: false,
      mobileAppNotifications: true,
    },
    alertThresholds: {
      lowInventory: 5,
      highTraffic: 1000,
      orderVolume: 50,
    },
  },
};

// Settings service
export const settingsService = {
  // Get all settings
  getSettings: async (): Promise<MerchantSettings> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockSettings;
  },

  // Get specific settings section
  getSettingsSection: async <K extends keyof MerchantSettings>(
    section: K
  ): Promise<MerchantSettings[K]> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSettings[section];
  },

  // Update settings
  updateSettings: async <K extends keyof MerchantSettings>(
    section: K,
    data: Partial<MerchantSettings[K]>
  ): Promise<MerchantSettings[K]> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return updated mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Merge the updated data with the existing data
    const updatedSection = {
      ...mockSettings[section],
      ...data,
    };
    
    // Update the mock settings
    mockSettings[section] = updatedSection as MerchantSettings[K];
    
    return updatedSection;
  },

  // Generate new API key
  generateApiKey: async (name: string, permissions: string[]): Promise<ApiKey> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name,
      key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      permissions,
    };
    
    // Add the new key to the mock data
    mockSettings.integration.apiKeys.push(newKey);
    
    return newKey;
  },

  // Delete API key
  deleteApiKey: async (id: string): Promise<void> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Remove the key from the mock data
    mockSettings.integration.apiKeys = mockSettings.integration.apiKeys.filter(key => key.id !== id);
  },

  // Add team member
  addTeamMember: async (name: string, email: string, role: string): Promise<TeamMember> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name,
      email,
      role,
      status: 'invited',
    };
    
    // Add the new member to the mock data
    mockSettings.account.teamMembers.push(newMember);
    
    return newMember;
  },

  // Update team member
  updateTeamMember: async (id: string, data: Partial<TeamMember>): Promise<TeamMember> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the member in the mock data
    const memberIndex = mockSettings.account.teamMembers.findIndex(member => member.id === id);
    
    if (memberIndex === -1) {
      throw new Error('Team member not found');
    }
    
    // Update the member
    const updatedMember = {
      ...mockSettings.account.teamMembers[memberIndex],
      ...data,
    };
    
    mockSettings.account.teamMembers[memberIndex] = updatedMember;
    
    return updatedMember;
  },

  // Remove team member
  removeTeamMember: async (id: string): Promise<void> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Remove the member from the mock data
    mockSettings.account.teamMembers = mockSettings.account.teamMembers.filter(member => member.id !== id);
  },
};