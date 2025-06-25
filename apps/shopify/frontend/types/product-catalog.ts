/**
 * Product Catalog Types
 * 
 * This module defines the type interfaces for the EyewearML product catalog,
 * including support for brand-manufacturer relationships and AI-enhanced attributes.
 */

/**
 * Product data interface with brand-manufacturer relationships and AI enhancements
 */
export interface ProductData {
  id: string;
  name: string;
  brand: string;
  brand_id: string;
  manufacturer_id: string;
  description: string;
  model?: string;
  price: number;
  currency: string;
  specifications?: {
    frame_type?: string;
    frame_shape?: string;
    frame_material?: string;
    frame_color?: string;
    temple_material?: string;
    lens_material?: string;
    hinge_type?: string;
    prescription_type?: string;
    [key: string]: any;
  };
  measurements?: {
    lens_width?: number;
    bridge_width?: number;
    temples_length?: number;
    lens_height?: number;
    total_width?: number;
    weight?: number;
    [key: string]: any;
  };
  images?: {
    main_image: string;
    additional_images?: string[];
  };
  metadata?: {
    [key: string]: any;
  };
  ai_enhanced?: {
    face_shape_compatibility_scores?: {
      oval: number;
      round: number;
      square: number;
      heart: number;
      diamond: number;
      oblong: number;
      [key: string]: number;
    };
    style_keywords?: string[];
    feature_summary?: string;
    style_description?: string;
    similar_products?: string[];
    [key: string]: any;
  };
}

/**
 * Brand data interface with manufacturer relationship
 */
export interface BrandData {
  brand_id: string;
  name: string;
  manufacturer_id: string;
  description?: string;
  style_categories?: string[];
  country_of_origin?: string;
  founded_year?: number;
  website?: string;
  logo_url?: string;
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Manufacturer data interface
 */
export interface ManufacturerData {
  manufacturer_id: string;
  name: string;
  description?: string;
  country_of_origin?: string;
  founded_year?: number;
  headquarters?: string;
  website?: string;
  logo_url?: string;
  brands?: string[]; // References to brand_id
  metadata?: {
    [key: string]: any;
  };
}
