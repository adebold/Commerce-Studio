// Standard product schema for Vertex AI integration
export interface StandardProduct {
  id: string;
  title: string;
  description: string;
  price: {
    amount: number;
    currencyCode: string;
    compareAtPrice?: number;
  };
  url: string;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: {
    general: {
      tags: string[];
      vendor: string;
      productType: string;
      collections: string[];
    };
    eyewear: EyewearAttributes;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    shopifyId: string;
    shopDomain: string;
  };
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  width?: number;
  height?: number;
  position?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: {
    amount: number;
    currencyCode: string;
    compareAtPrice?: number;
  };
  sku: string;
  available: boolean;
  options: {
    name: string;
    value: string;
  }[];
  imageId?: string;
}

// Domain-specific attributes for eyewear products
export interface EyewearAttributes {
  frameShape?: string;
  frameMaterial?: string;
  frameStyle?: string;
  frameColor?: string;
  frameWidth?: string | number;
  frameHeight?: string | number;
  bridgeWidth?: string | number;
  templeLength?: string | number;
  lensDiameter?: string | number;
  lensHeight?: string | number;
  lensWidth?: string | number;
  lensColor?: string;
  lensMaterial?: string;
  lensCoating?: string[];
  lensType?: string;
  lensCategory?: string;
  uvProtection?: boolean;
  polarized?: boolean;
  recommendedFaceShapes?: string[];
  gender?: string;
  weight?: string | number;
  hingeType?: string;
  adjustableNosePads?: boolean;
  prescription?: {
    available: boolean;
    types?: string[];
    minSphere?: number;
    maxSphere?: number;
    minCylinder?: number;
    maxCylinder?: number;
  };
  virtualTryOn?: boolean;
  sustainabilityFeatures?: string[];
  warranty?: string;
  bestseller?: boolean;
  new?: boolean;
  onSale?: boolean;
}

// Shopify product structure (simplified, actual Shopify types are more extensive)
export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  handle: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  options: ShopifyOption[];
  metafields?: ShopifyMetafield[];
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  position: number;
  inventory_policy: string;
  fulfillment_service: string;
  inventory_management: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  grams: number;
  weight: number;
  weight_unit: string;
  inventory_quantity: number;
  requires_shipping: boolean;
  image_id: string | null;
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: string[];
}

export interface ShopifyOption {
  id: string;
  product_id: string;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyMetafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  value_type: string;
  description: string | null;
}

// Shopify collection interface
export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  updated_at: string;
  published_at: string;
  products: ShopifyProduct[];
}

// Cache interfaces
export interface ProductCacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of products to store in cache
}

// Search criteria for product search
export interface ProductSearchCriteria {
  tag?: string;
  query?: string;
  collection?: string;
  productType?: string;
  vendor?: string;
  available?: boolean;
  maxPrice?: number;
  minPrice?: number;
  frameShape?: string;
  frameMaterial?: string;
  recommendedFaceShape?: string;
  gender?: string;
  limit?: number;
}
