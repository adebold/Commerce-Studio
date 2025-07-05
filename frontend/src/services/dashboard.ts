// Dashboard data service that integrates with the demo data from seed-demo-data.sh
import { commerceStudioService } from './commerce-studio';

// Types based on the demo data structure
export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'client' | 'viewer';
  is_demo: boolean;
  created_by: string;
}

export interface DemoStore {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  bopis_enabled: boolean;
  is_active: boolean;
  phone: string;
  email: string;
  hours: Record<string, string>;
  is_demo: boolean;
}

export interface DemoProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  description: string;
  category: string;
  brand: string;
  is_active: boolean;
  specifications: {
    frame_material: string;
    lens_material: string;
    frame_width: string;
    lens_width: string;
    bridge_width: string;
    temple_length: string;
  };
  images: string[];
  tags: string[];
  is_demo: boolean;
}

export interface DemoReservation {
  id: string;
  confirmation_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  store_id: string;
  frame_id: string;
  quantity: number;
  pickup_by_date: string;
  status: 'pending' | 'confirmed' | 'ready' | 'picked_up' | 'expired';
  special_instructions: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeCustomers: number;
  activeStores: number;
  conversionRate: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  pickupRate: number;
}

export interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
}

export interface ProductPerformanceData {
  name: string;
  sales: number;
  views: number;
  conversionRate: number;
  revenue: number;
}

export interface CustomerEngagementData {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'customer' | 'product' | 'integration' | 'bopis';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

export interface IntegrationStatus {
  platform: string;
  status: 'online' | 'offline' | 'maintenance';
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  lastUpdated: Date;
}

// Demo data based on seed-demo-data.sh structure
const DEMO_STORES: DemoStore[] = [
  {
    id: 'store-1',
    name: 'VARAi Store - Downtown',
    address: '123 Main Street, New York, NY 10001',
    latitude: 40.7128,
    longitude: -74.0060,
    bopis_enabled: true,
    is_active: true,
    phone: '(555) 123-4567',
    email: 'downtown@varai.com',
    hours: {
      monday: '9:00-18:00',
      tuesday: '9:00-18:00',
      wednesday: '9:00-18:00',
      thursday: '9:00-18:00',
      friday: '9:00-19:00',
      saturday: '10:00-19:00',
      sunday: '11:00-17:00'
    },
    is_demo: true
  },
  {
    id: 'store-2',
    name: 'VARAi Store - Mall',
    address: '456 Mall Avenue, New York, NY 10002',
    latitude: 40.7589,
    longitude: -73.9851,
    bopis_enabled: true,
    is_active: true,
    phone: '(555) 234-5678',
    email: 'mall@varai.com',
    hours: {
      monday: '10:00-21:00',
      tuesday: '10:00-21:00',
      wednesday: '10:00-21:00',
      thursday: '10:00-21:00',
      friday: '10:00-22:00',
      saturday: '10:00-22:00',
      sunday: '11:00-20:00'
    },
    is_demo: true
  },
  {
    id: 'store-3',
    name: 'VARAi Store - Midtown',
    address: '555 Broadway, New York, NY 10036',
    latitude: 40.7580,
    longitude: -73.9855,
    bopis_enabled: true,
    is_active: true,
    phone: '(555) 567-8901',
    email: 'midtown@varai.com',
    hours: {
      monday: '8:00-20:00',
      tuesday: '8:00-20:00',
      wednesday: '8:00-20:00',
      thursday: '8:00-20:00',
      friday: '8:00-21:00',
      saturday: '9:00-21:00',
      sunday: '10:00-19:00'
    },
    is_demo: true
  }
];

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'product-1',
    name: 'Classic Aviator',
    sku: 'AVT-001',
    price: 149.99,
    description: 'Timeless aviator style with premium materials',
    category: 'Sunglasses',
    brand: 'VARAi Collection',
    is_active: true,
    specifications: {
      frame_material: 'Premium Acetate',
      lens_material: 'CR-39 Plastic',
      frame_width: '140mm',
      lens_width: '52mm',
      bridge_width: '18mm',
      temple_length: '145mm'
    },
    images: [
      'https://via.placeholder.com/400x300/667eea/ffffff?text=AVT-001',
      'https://via.placeholder.com/400x300/764ba2/ffffff?text=AVT-001-Side'
    ],
    tags: ['demo', 'eyewear', 'varai', 'aviator', 'sunglasses'],
    is_demo: true
  },
  {
    id: 'product-2',
    name: 'Modern Square',
    sku: 'MSQ-002',
    price: 199.99,
    description: 'Contemporary square frames for everyday wear',
    category: 'Prescription',
    brand: 'VARAi Collection',
    is_active: true,
    specifications: {
      frame_material: 'Premium Acetate',
      lens_material: 'CR-39 Plastic',
      frame_width: '142mm',
      lens_width: '54mm',
      bridge_width: '16mm',
      temple_length: '140mm'
    },
    images: [
      'https://via.placeholder.com/400x300/667eea/ffffff?text=MSQ-002',
      'https://via.placeholder.com/400x300/764ba2/ffffff?text=MSQ-002-Side'
    ],
    tags: ['demo', 'eyewear', 'varai', 'square', 'prescription'],
    is_demo: true
  },
  {
    id: 'product-3',
    name: 'Vintage Round',
    sku: 'VRD-003',
    price: 179.99,
    description: 'Retro-inspired round frames with modern comfort',
    category: 'Prescription',
    brand: 'VARAi Collection',
    is_active: true,
    specifications: {
      frame_material: 'Premium Acetate',
      lens_material: 'CR-39 Plastic',
      frame_width: '138mm',
      lens_width: '50mm',
      bridge_width: '20mm',
      temple_length: '145mm'
    },
    images: [
      'https://via.placeholder.com/400x300/667eea/ffffff?text=VRD-003',
      'https://via.placeholder.com/400x300/764ba2/ffffff?text=VRD-003-Side'
    ],
    tags: ['demo', 'eyewear', 'varai', 'round', 'vintage'],
    is_demo: true
  },
  {
    id: 'product-4',
    name: 'Sport Performance',
    sku: 'SPT-004',
    price: 229.99,
    description: 'High-performance frames for active lifestyles',
    category: 'Sports',
    brand: 'VARAi Collection',
    is_active: true,
    specifications: {
      frame_material: 'TR90 Nylon',
      lens_material: 'Polycarbonate',
      frame_width: '145mm',
      lens_width: '58mm',
      bridge_width: '15mm',
      temple_length: '130mm'
    },
    images: [
      'https://via.placeholder.com/400x300/667eea/ffffff?text=SPT-004',
      'https://via.placeholder.com/400x300/764ba2/ffffff?text=SPT-004-Side'
    ],
    tags: ['demo', 'eyewear', 'varai', 'sport', 'performance'],
    is_demo: true
  }
];

// Generate realistic demo data
const generateSalesData = (period: 'daily' | 'weekly' | 'monthly'): SalesData[] => {
  const now = new Date();
  const data: SalesData[] = [];

  if (period === 'daily') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      data.push({
        period: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.floor(Math.random() * 15000) + 5000,
        orders: Math.floor(Math.random() * 150) + 50,
        customers: Math.floor(Math.random() * 100) + 30
      });
    }
  } else if (period === 'weekly') {
    // Last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - (i * 7));
      data.push({
        period: `Week ${8 - i}`,
        revenue: Math.floor(Math.random() * 80000) + 30000,
        orders: Math.floor(Math.random() * 800) + 300,
        customers: Math.floor(Math.random() * 500) + 200
      });
    }
  } else {
    // Last 12 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = now.getMonth();
    
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      data.push({
        period: months[monthIndex],
        revenue: Math.floor(Math.random() * 300000) + 100000,
        orders: Math.floor(Math.random() * 3000) + 1000,
        customers: Math.floor(Math.random() * 2000) + 800
      });
    }
  }

  return data;
};

const generateProductPerformanceData = (): ProductPerformanceData[] => {
  return DEMO_PRODUCTS.map(product => ({
    name: product.name,
    sales: Math.floor(Math.random() * 5000) + 1000,
    views: Math.floor(Math.random() * 15000) + 3000,
    conversionRate: Math.floor(Math.random() * 30) + 20,
    revenue: Math.floor(Math.random() * 50000) + 10000
  }));
};

const generateCustomerEngagementData = (): CustomerEngagementData[] => [
  { name: 'Virtual Try-On', value: 35, color: '#2563eb' },
  { name: 'Product Views', value: 25, color: '#10b981' },
  { name: 'Style Quiz', value: 20, color: '#f59e0b' },
  { name: 'Reviews & Ratings', value: 15, color: '#8b5cf6' },
  { name: 'Wishlist Saves', value: 5, color: '#ec4899' }
];

const generateActivityFeed = (): ActivityItem[] => {
  const activities: ActivityItem[] = [];
  const now = new Date();

  // Generate recent activities
  const activityTypes = [
    {
      type: 'order' as const,
      titles: ['New Order Received', 'Order Completed', 'Order Shipped', 'Order Cancelled'],
      descriptions: [
        'Order #12345 for $249.99 was placed',
        'Order #12340 completed successfully',
        'Order #12338 shipped via Express Delivery',
        'Order #12336 was cancelled by customer'
      ]
    },
    {
      type: 'customer' as const,
      titles: ['New Customer Registered', 'Customer Profile Updated', 'Customer Review Posted'],
      descriptions: [
        'jane.doe@example.com created an account',
        'john.smith@example.com updated profile information',
        'sarah.wilson@example.com posted a 5-star review'
      ]
    },
    {
      type: 'product' as const,
      titles: ['Product Stock Update', 'New Product Added', 'Product Price Updated'],
      descriptions: [
        'Classic Frames inventory updated to 24 units',
        'New product "Designer Cat-Eye" added to catalog',
        'Modern Square frames price updated to $199.99'
      ]
    },
    {
      type: 'bopis' as const,
      titles: ['BOPIS Reservation Created', 'BOPIS Pickup Completed', 'BOPIS Reservation Ready'],
      descriptions: [
        'New BOPIS reservation #BP001 created',
        'BOPIS reservation #BP002 picked up successfully',
        'BOPIS reservation #BP003 ready for pickup'
      ]
    },
    {
      type: 'integration' as const,
      titles: ['Shopify Integration Updated', 'WooCommerce Sync Completed', 'API Connection Refreshed'],
      descriptions: [
        'Shopify integration refreshed successfully',
        'WooCommerce product sync completed',
        'BigCommerce API connection restored'
      ]
    }
  ];

  for (let i = 0; i < 15; i++) {
    const typeData = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const titleIndex = Math.floor(Math.random() * typeData.titles.length);
    
    activities.push({
      id: `activity-${i + 1}`,
      type: typeData.type,
      title: typeData.titles[titleIndex],
      description: typeData.descriptions[titleIndex],
      timestamp: new Date(now.getTime() - (Math.random() * 24 * 60 * 60 * 1000 * 7)), // Last 7 days
      user: Math.random() > 0.5 ? {
        name: ['Sarah Chen', 'Marcus Rodriguez', 'Emily Johnson', 'Alex Kim'][Math.floor(Math.random() * 4)],
        avatar: ['👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻'][Math.floor(Math.random() * 4)]
      } : undefined
    });
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateIntegrationStatus = (): IntegrationStatus[] => [
  {
    platform: 'Shopify',
    status: 'online',
    responseTime: 145,
    errorRate: 0.01,
    activeUsers: 1250,
    lastUpdated: new Date()
  },
  {
    platform: 'WooCommerce',
    status: 'online',
    responseTime: 180,
    errorRate: 0.02,
    activeUsers: 890,
    lastUpdated: new Date()
  },
  {
    platform: 'BigCommerce',
    status: 'maintenance',
    responseTime: 220,
    errorRate: 0.05,
    activeUsers: 650,
    lastUpdated: new Date()
  },
  {
    platform: 'Magento',
    status: 'online',
    responseTime: 195,
    errorRate: 0.025,
    activeUsers: 420,
    lastUpdated: new Date()
  }
];

// Dashboard service
export const dashboardService = {
  // Get dashboard metrics
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      totalRevenue: 247850,
      totalOrders: 1847,
      activeCustomers: 1256,
      activeStores: DEMO_STORES.length,
      conversionRate: 0.068,
      averageOrderValue: 134.25,
      customerSatisfaction: 4.7,
      pickupRate: 0.893
    };
  },

  // Get sales data
  getSalesData: async (period: 'daily' | 'weekly' | 'monthly'): Promise<SalesData[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    return generateSalesData(period);
  },

  // Get product performance data
  getProductPerformance: async (): Promise<ProductPerformanceData[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 700));
    return generateProductPerformanceData();
  },

  // Get customer engagement data
  getCustomerEngagement: async (): Promise<CustomerEngagementData[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateCustomerEngagementData();
  },

  // Get activity feed
  getActivityFeed: async (): Promise<ActivityItem[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    return generateActivityFeed();
  },

  // Get integration status
  getIntegrationStatus: async (): Promise<IntegrationStatus[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateIntegrationStatus();
  },

  // Get demo stores
  getDemoStores: async (): Promise<DemoStore[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    return DEMO_STORES;
  },

  // Get demo products
  getDemoProducts: async (): Promise<DemoProduct[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    return DEMO_PRODUCTS;
  }
};