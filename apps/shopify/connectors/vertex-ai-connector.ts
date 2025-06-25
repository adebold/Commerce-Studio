/**
 * Vertex AI Connector for Shopify Integration
 * 
 * This module provides integration with Google's Vertex AI services
 * via the EyewearML platform's AI enhancement system to enrich 
 * product data for Shopify.
 */

import { ProductData } from '../frontend/types/product-catalog';
import axios from 'axios';
import config from '../config/vertex-ai';

/**
 * Enhances a product with AI-generated attributes using Google's Vertex AI
 * via the EyewearML platform's enhancement system
 * 
 * @param {ProductData} product - The product object to enhance
 * @returns {Promise<ProductData>} Enhanced product with AI attributes
 */
export async function enhanceWithVertexAI(product: ProductData): Promise<ProductData> {
  console.log(`Enhancing product ${product.id} with Vertex AI...`);
  
  try {
    // Check if we're in development mode with simulation
    if (config.useSimulation) {
      console.log('Using simulated enhancement (development mode)');
      return simulateEnhancement(product);
    }
    
    // In production, make API call to EyewearML enhancement endpoint
    const response = await axios.post(
      `${config.apiBaseUrl}/products/enhance`,
      {
        product,
        options: {
          enhancementLevel: config.enhancementLevel,
          includeStyleKeywords: true,
          includeFaceShapeScores: true,
          includeFeatureSummary: true,
          includeStyleDescription: true
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );
    
    return response.data;
    
  } catch (error) {
    console.error('Error enhancing product with Vertex AI:', error);
    
    // Fallback to simulation in case of API error
    return simulateEnhancement(product);
  }
}

/**
 * Simulates AI enhancement for development and testing
 * 
 * @param {ProductData} product - The product to enhance
 * @returns {ProductData} Simulated enhanced product
 */
function simulateEnhancement(product: ProductData): ProductData {
  // Create a deep clone of the product
  const enhancedProduct = JSON.parse(JSON.stringify(product)) as ProductData;
  
  // Initialize AI enhanced attributes if not present
  if (!enhancedProduct.ai_enhanced) {
    enhancedProduct.ai_enhanced = {};
  }
  
  // Extract product attributes for more realistic simulation
  const frameShape = product.specifications?.frame_shape?.toLowerCase() || '';
  const frameMaterial = product.specifications?.frame_material?.toLowerCase() || '';
  const frameColor = product.specifications?.frame_color?.toLowerCase() || '';
  
  // Generate face shape compatibility scores
  enhancedProduct.ai_enhanced.face_shape_compatibility_scores = generateFaceShapeScores(frameShape);
  
  // Generate style keywords
  enhancedProduct.ai_enhanced.style_keywords = generateStyleKeywords(
    frameShape, 
    frameMaterial, 
    frameColor, 
    product.brand
  );
  
  // Generate feature summary
  enhancedProduct.ai_enhanced.feature_summary = generateFeatureSummary(product);
  
  // Generate style description
  enhancedProduct.ai_enhanced.style_description = generateStyleDescription(
    frameShape, 
    frameColor, 
    product.brand
  );
  
  return enhancedProduct;
}

/**
 * Generates face shape compatibility scores based on frame shape
 */
function generateFaceShapeScores(frameShape: string): ProductData['ai_enhanced']['face_shape_compatibility_scores'] {
  // Default scores for all face shapes
  const scores = {
    oval: 0.8,  // Oval generally works with most frames
    round: 0.6,
    square: 0.6,
    heart: 0.6,
    diamond: 0.6,
    oblong: 0.6
  };
  
  // Adjust scores based on frame shape
  switch (frameShape) {
    case 'round':
    case 'circular':
      scores.square = 0.9;
      scores.diamond = 0.85;
      scores.oblong = 0.9;
      scores.round = 0.4;
      break;
      
    case 'square':
    case 'rectangle':
    case 'rectangular':
      scores.round = 0.9;
      scores.oval = 0.9;
      scores.heart = 0.8;
      scores.square = 0.4;
      break;
      
    case 'cat-eye':
    case 'cateye':
      scores.square = 0.85;
      scores.diamond = 0.7;
      scores.heart = 0.5;
      break;
      
    case 'aviator':
    case 'pilot':
      scores.square = 0.9;
      scores.oval = 0.8;
      scores.heart = 0.85;
      break;
      
    case 'wayfarer':
      scores.oval = 0.85;
      scores.round = 0.8;
      scores.square = 0.5;
      break;
      
    case 'oversized':
      scores.heart = 0.85;
      scores.diamond = 0.8;
      scores.round = 0.75;
      scores.square = 0.5;
      break;
      
    case 'rimless':
    case 'semi-rimless':
      scores.oval = 0.85;
      scores.round = 0.7;
      scores.diamond = 0.8;
      break;
  }
  
  return scores;
}

/**
 * Generates style keywords based on product attributes
 */
function generateStyleKeywords(
  frameShape: string, 
  frameMaterial: string, 
  frameColor: string, 
  brand: string
): string[] {
  const keywords = new Set<string>();
  
  // Keywords based on frame shape
  const shapeKeywords: Record<string, string[]> = {
    'round': ['retro', 'intellectual', 'vintage'],
    'square': ['structured', 'confident', 'bold'],
    'rectangle': ['professional', 'structured', 'balanced'],
    'oval': ['classic', 'versatile', 'balanced'],
    'cat-eye': ['feminine', 'vintage', 'glamorous'],
    'aviator': ['timeless', 'iconic', 'cool'],
    'pilot': ['timeless', 'aviation-inspired', 'distinctive'],
    'wayfarer': ['iconic', 'classic', 'retro'],
    'geometric': ['modern', 'artistic', 'unique'],
    'oversized': ['fashion-forward', 'statement', 'dramatic'],
    'rimless': ['minimalist', 'lightweight', 'subtle'],
    'semi-rimless': ['sophisticated', 'refined', 'contemporary']
  };
  
  // Add shape keywords
  if (frameShape && shapeKeywords[frameShape]) {
    shapeKeywords[frameShape].forEach(keyword => keywords.add(keyword));
  } else {
    // Default
    keywords.add('stylish');
  }
  
  // Keywords based on material
  const materialKeywords: Record<string, string[]> = {
    'metal': ['sleek', 'durable', 'modern'],
    'titanium': ['premium', 'lightweight', 'hypoallergenic'],
    'stainless steel': ['sturdy', 'reliable', 'clean'],
    'acetate': ['vibrant', 'durable', 'versatile'],
    'plastic': ['affordable', 'lightweight', 'practical'],
    'wood': ['natural', 'organic', 'unique'],
    'bamboo': ['eco-friendly', 'sustainable', 'natural'],
    'carbon fiber': ['high-tech', 'ultralight', 'sporty']
  };
  
  // Add material keywords
  if (frameMaterial && materialKeywords[frameMaterial]) {
    materialKeywords[frameMaterial].forEach(keyword => keywords.add(keyword));
  }
  
  // Keywords based on color
  const colorKeywords: Record<string, string[]> = {
    'black': ['timeless', 'versatile', 'sleek'],
    'brown': ['classic', 'warm', 'natural'],
    'gold': ['luxurious', 'elegant', 'refined'],
    'silver': ['sophisticated', 'modern', 'versatile'],
    'red': ['bold', 'striking', 'passionate'],
    'blue': ['calming', 'trustworthy', 'distinctive'],
    'green': ['fresh', 'natural', 'unique'],
    'tortoise': ['classic', 'sophisticated', 'timeless'],
    'transparent': ['contemporary', 'light', 'minimalist'],
    'pink': ['playful', 'feminine', 'trendy'],
    'purple': ['creative', 'distinctive', 'expressive']
  };
  
  // Add color keywords
  if (frameColor && colorKeywords[frameColor]) {
    colorKeywords[frameColor].forEach(keyword => keywords.add(keyword));
  }
  
  // Keywords based on brand
  const brandKeywords: Record<string, string[]> = {
    'Ray-Ban': ['iconic', 'classic', 'timeless'],
    'Oakley': ['sporty', 'high-performance', 'technical'],
    'Gucci': ['luxury', 'designer', 'high-fashion'],
    'Prada': ['sophisticated', 'luxurious', 'elegant'],
    'Warby Parker': ['trendy', 'affordable', 'stylish'],
    'Oliver Peoples': ['artisanal', 'luxury', 'subtle'],
    'Persol': ['handcrafted', 'iconic', 'refined'],
    'Tom Ford': ['luxury', 'bold', 'elegant'],
    'Calvin Klein': ['minimal', 'modern', 'clean'],
    'Tommy Hilfiger': ['preppy', 'American', 'classic']
  };
  
  // Add brand keywords
  if (brand && brandKeywords[brand]) {
    brandKeywords[brand].forEach(keyword => keywords.add(keyword));
  }
  
  // Convert set to array and limit to 8 keywords
  return Array.from(keywords).slice(0, 8);
}

/**
 * Generates a feature summary based on product attributes
 */
function generateFeatureSummary(product: ProductData): string {
  const features: string[] = [];
  
  // Add frame type
  if (product.specifications?.frame_type) {
    features.push(`${product.specifications.frame_type} frame`);
  }
  
  // Add frame shape
  if (product.specifications?.frame_shape) {
    features.push(`${product.specifications.frame_shape} shape`);
  }
  
  // Add frame material
  if (product.specifications?.frame_material) {
    features.push(`crafted from ${product.specifications.frame_material}`);
  }
  
  // Add frame color
  if (product.specifications?.frame_color) {
    features.push(`in ${product.specifications.frame_color} color`);
  }
  
  // Add measurements
  if (product.measurements?.lens_width) {
    features.push(`${product.measurements.lens_width}mm lens width`);
  }
  
  // Create the summary
  let summary = '';
  
  if (features.length > 0) {
    if (product.brand) {
      summary = `This ${product.brand} eyewear features a `;
    } else {
      summary = 'This eyewear features a ';
    }
    
    summary += features.join(' ');
    
    // Replace last comma with "and" if there are multiple features
    const lastCommaIndex = summary.lastIndexOf(',');
    if (lastCommaIndex !== -1) {
      summary = summary.substring(0, lastCommaIndex) + ' and' + summary.substring(lastCommaIndex + 1);
    }
    
    summary += '.';
  } else {
    // Fallback summary
    summary = 'A stylish eyewear frame with contemporary design elements.';
  }
  
  return summary;
}

/**
 * Generates a style description based on product attributes
 */
function generateStyleDescription(frameShape: string, frameColor: string, brand: string): string {
  // Base descriptions for different frame shapes
  const shapeDescriptions: Record<string, string> = {
    'round': 'These round frames offer a classic, intellectual look that works well with angular face shapes. The circular design adds a vintage-inspired aesthetic that\'s both sophisticated and distinctive.',
    
    'square': 'These square frames feature clean lines and a bold silhouette that adds definition to your look. Their structured angles complement softer face shapes by providing contrast and character.',
    
    'rectangle': 'These rectangular frames provide a professional, structured look that suits most face shapes. Their horizontal emphasis creates a balanced, proportional aesthetic that works well for everyday wear.',
    
    'oval': 'These oval frames offer a versatile, universally flattering style that works with most face shapes. Their soft curves provide a balanced look that\'s both approachable and refined.',
    
    'cat-eye': 'These cat-eye frames feature an elegant upswept design that adds a touch of vintage glamour. Their feminine silhouette enhances cheekbones and creates a sophisticated, timeless look.',
    
    'aviator': 'These aviator frames deliver the iconic teardrop shape with a contemporary twist. Originally designed for pilots, their distinctive style projects confidence and effortless cool.',
    
    'wayfarer': 'These wayfarer frames showcase the iconic trapezoidal shape that revolutionized eyewear fashion. Their bold, distinctive silhouette provides timeless appeal with just the right amount of vintage character.',
    
    'geometric': 'These geometric frames feature innovative angles that create a fashion-forward, artistic statement. Their unique shape breaks away from traditional designs to offer something truly distinctive.',
    
    'oversized': 'These oversized frames make a bold fashion statement with their dramatic proportions. The larger silhouette creates a confident look that adds instant sophistication to any ensemble.',
    
    'rimless': 'These rimless frames offer an ultra-lightweight, minimalist design that emphasizes your natural features. Their subtle construction provides understated elegance with maximum comfort.',
    
    'semi-rimless': 'These semi-rimless frames combine sophisticated style with a lighter profile. Their partial frame design emphasizes the upper portion while creating an open, modern aesthetic below.'
  };
  
  // Get the base description
  let description = shapeDescriptions[frameShape] || 'These stylish frames feature a balanced design that works well with various face shapes and personal styles. Their proportions create a versatile look suitable for both professional and casual settings.';
  
  // Add color details if available
  if (frameColor) {
    const colorDescriptions: Record<string, string> = {
      'black': ' The timeless black finish provides versatility that complements any outfit or occasion.',
      'brown': ' The warm brown tone offers a softer alternative to black while maintaining versatility for everyday wear.',
      'gold': ' The luxurious gold finish adds a touch of elegance and sophistication to these distinctive frames.',
      'silver': ' The sleek silver finish creates a contemporary look that pairs easily with both warm and cool tones.',
      'red': ' The bold red color makes a confident statement, perfect for those who want their eyewear to stand out.',
      'blue': ' The distinctive blue hue adds personality while remaining surprisingly versatile for everyday wear.',
      'green': ' The unique green tone provides a fresh, nature-inspired look that sets these frames apart.',
      'tortoise': ' The classic tortoise pattern adds depth and sophistication with its warm, mottled appearance.',
      'transparent': ' The modern transparent finish offers a lightweight, contemporary aesthetic that\'s subtle yet distinctive.'
    };
    
    description += colorDescriptions[frameColor] || ` The ${frameColor} color adds character and style to these fashionable frames.`;
  }
  
  // Add brand context if available
  if (brand) {
    const brandDescriptions: Record<string, string> = {
      'Ray-Ban': ' As expected from Ray-Ban, these frames deliver timeless style with exceptional quality and craftsmanship.',
      'Oakley': ' In true Oakley fashion, these frames combine cutting-edge materials with high-performance design.',
      'Gucci': ' With Gucci\'s signature approach to luxury, these frames blend bold design with premium materials and craftsmanship.',
      'Prada': ' Following Prada\'s commitment to sophisticated style, these frames combine innovative design with luxurious materials.',
      'Warby Parker': ' True to Warby Parker\'s mission, these frames offer designer quality at an accessible price point.',
      'Oliver Peoples': ' Crafted with Oliver Peoples\' attention to detail, these frames showcase timeless design with subtle branding.',
      'Calvin Klein': ' With Calvin Klein\'s minimalist aesthetic, these frames offer clean lines and contemporary styling.',
      'Tommy Hilfiger': ' Reflecting Tommy Hilfiger\'s preppy American style, these frames combine classic design with modern sensibility.'
    };
    
    description += brandDescriptions[brand] || ` Made by ${brand}, these frames combine quality craftsmanship with distinctive style.`;
  }
  
  return description;
}
