// Product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  relevantTo: string;
  price?: number;
  category?: string;
}

// Pricing Plan interface
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'contained' | 'outlined';
}

// Mock product data
const mockProducts: Product[] = [
  {
    id: 'product-1',
    name: 'Virtual Try-On',
    description: 'Allow customers to virtually try on eyewear products before purchasing, increasing conversion rates and reducing returns.',
    image: 'https://placehold.co/600x400?text=Virtual+Try-On',
    relevantTo: 'Eyewear retailers, E-commerce platforms',
    category: 'Customer Experience'
  },
  {
    id: 'product-2',
    name: 'Style Recommendations',
    description: 'AI-powered style recommendations based on face shape, skin tone, and personal preferences.',
    image: 'https://placehold.co/600x400?text=Style+Recommendations',
    relevantTo: 'Fashion retailers, Personal stylists',
    category: 'AI Solutions'
  },
  {
    id: 'product-3',
    name: 'Inventory Optimization',
    description: 'Optimize your inventory with AI-driven insights on product performance and customer preferences.',
    image: 'https://placehold.co/600x400?text=Inventory+Optimization',
    relevantTo: 'Retail managers, Supply chain professionals',
    category: 'Business Intelligence'
  },
  {
    id: 'product-4',
    name: 'SKU Genie',
    description: 'Automated product catalog management with intelligent SKU generation and organization.',
    image: 'https://placehold.co/600x400?text=SKU+Genie',
    relevantTo: 'E-commerce managers, Product catalog specialists',
    category: 'Catalog Management'
  },
  {
    id: 'product-5',
    name: 'Analytics Dashboard',
    description: 'Comprehensive analytics dashboard providing insights into customer behavior and product performance.',
    image: 'https://placehold.co/600x400?text=Analytics+Dashboard',
    relevantTo: 'Marketing teams, Business analysts',
    category: 'Analytics'
  },
  {
    id: 'product-6',
    name: 'Commerce API',
    description: 'Integrate VARAi Commerce Studio capabilities into your existing systems with our robust API.',
    image: 'https://placehold.co/600x400?text=Commerce+API',
    relevantTo: 'Developers, System integrators',
    category: 'Integration'
  }
];

// Mock pricing plan data
const mockPricingPlans: PricingPlan[] = [
  {
    id: 'plan-1',
    name: 'Starter',
    price: '$99',
    period: '/month',
    description: 'Perfect for small businesses just getting started with AI-powered eyewear retail.',
    features: [
      'Virtual Try-On (100 sessions/mo)',
      'Basic Style Recommendations',
      'Standard Support',
      'Single Store Integration'
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outlined'
  },
  {
    id: 'plan-2',
    name: 'Professional',
    price: '$299',
    period: '/month',
    description: 'Ideal for growing businesses looking to enhance their customer experience.',
    features: [
      'Virtual Try-On (Unlimited)',
      'Advanced Style Recommendations',
      'Priority Support',
      'Multi-Store Integration',
      'Analytics Dashboard',
      'Inventory Optimization'
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'contained'
  },
  {
    id: 'plan-3',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions for large retailers with complex requirements.',
    features: [
      'All Professional Features',
      'Custom AI Model Training',
      'Dedicated Account Manager',
      'API Access',
      'White-Label Solution',
      'Custom Integrations'
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outlined'
  }
];

// Commerce Studio service
export const commerceStudioService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockProducts;
  },
  
  // Get a single product by ID
  getProductById: async (id: string): Promise<Product | undefined> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProducts.find(product => product.id === id);
  },
  
  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and filter mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const lowercaseQuery = query.toLowerCase();
    return mockProducts.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) || 
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category?.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Get pricing plans
  getPricingPlans: async (): Promise<PricingPlan[]> => {
    // In a real app, this would make an API call
    // For now, we'll simulate a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 700));
    return mockPricingPlans;
  }
};