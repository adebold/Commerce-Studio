import { Frame } from '../components/virtual-try-on';

// Types
export interface UserPreferences {
  faceShape: string | null;
  stylePreferences: {
    colors: string[];
    materials: string[];
    shapes: string[];
  };
  sizeAndFit: {
    frameWidth: string | null;
    templeLength: string | null;
    bridgeWidth: string | null;
  };
  features: string[];
  budget: {
    min: number;
    max: number;
  };
}

export interface RecommendationResult {
  frames: FrameRecommendation[];
  cacheKey?: string;
  expiresAt?: number;
}

export interface FrameRecommendation {
  frame: Frame;
  compatibilityScore: number;
  reasons: string[];
}

// Cache for recommendations
interface CacheEntry {
  result: RecommendationResult;
  expiresAt: number;
}

class RecommendationService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  // Mock frames data - in a real app, this would come from an API
  private mockFrames: Frame[] = [
    {
      id: 'frame-1',
      name: 'Aviator Classic',
      brand: 'RayBan',
      price: 149.99,
      color: 'Gold',
      material: 'Metal',
      shape: 'Aviator',
      imageUrl: '/images/frames/aviator-classic.jpg'
    },
    {
      id: 'frame-2',
      name: 'Wayfarer',
      brand: 'RayBan',
      price: 139.99,
      color: 'Black',
      material: 'Acetate',
      shape: 'Square',
      imageUrl: '/images/frames/wayfarer.jpg'
    },
    {
      id: 'frame-3',
      name: 'Round Metal',
      brand: 'RayBan',
      price: 159.99,
      color: 'Silver',
      material: 'Metal',
      shape: 'Round',
      imageUrl: '/images/frames/round-metal.jpg'
    },
    {
      id: 'frame-4',
      name: 'Clubmaster',
      brand: 'RayBan',
      price: 169.99,
      color: 'Tortoise',
      material: 'Mixed',
      shape: 'Browline',
      imageUrl: '/images/frames/clubmaster.jpg'
    },
    {
      id: 'frame-5',
      name: 'Justin Classic',
      brand: 'RayBan',
      price: 129.99,
      color: 'Black',
      material: 'Propionate',
      shape: 'Rectangle',
      imageUrl: '/images/frames/justin-classic.jpg'
    },
    {
      id: 'frame-6',
      name: 'Erika',
      brand: 'RayBan',
      price: 139.99,
      color: 'Brown',
      material: 'Nylon',
      shape: 'Round',
      imageUrl: '/images/frames/erika.jpg'
    },
    {
      id: 'frame-7',
      name: 'Hexagonal',
      brand: 'RayBan',
      price: 149.99,
      color: 'Gold',
      material: 'Metal',
      shape: 'Hexagonal',
      imageUrl: '/images/frames/hexagonal.jpg'
    },
    {
      id: 'frame-8',
      name: 'Oval',
      brand: 'Warby Parker',
      price: 95.00,
      color: 'Silver',
      material: 'Metal',
      shape: 'Oval',
      imageUrl: '/images/frames/oval.jpg'
    },
    {
      id: 'frame-9',
      name: 'Cat Eye',
      brand: 'Prada',
      price: 299.99,
      color: 'Black',
      material: 'Acetate',
      shape: 'Cat Eye',
      imageUrl: '/images/frames/cat-eye.jpg'
    },
    {
      id: 'frame-10',
      name: 'Rectangular',
      brand: 'Oakley',
      price: 189.99,
      color: 'Blue',
      material: 'Plastic',
      shape: 'Rectangle',
      imageUrl: '/images/frames/rectangular.jpg'
    },
    {
      id: 'frame-11',
      name: 'Rimless',
      brand: 'Silhouette',
      price: 349.99,
      color: 'Clear',
      material: 'Titanium',
      shape: 'Round',
      imageUrl: '/images/frames/rimless.jpg'
    },
    {
      id: 'frame-12',
      name: 'Oversized',
      brand: 'Gucci',
      price: 399.99,
      color: 'Tortoise',
      material: 'Acetate',
      shape: 'Oversized',
      imageUrl: '/images/frames/oversized.jpg'
    }
  ];
  
  /**
   * Get recommendations based on user preferences
   * Calls the real API endpoint
   */
  async getRecommendations(preferences: UserPreferences): Promise<RecommendationResult> {
    // Generate a cache key based on preferences
    const cacheKey = this.generateCacheKey(preferences);
    
    // Check if we have a valid cached result
    const cachedResult = this.getCachedResult(cacheKey);
    if (cachedResult) {
      console.log('Using cached recommendations');
      return cachedResult;
    }
    
    try {
      // Call the real API endpoint for personalized recommendations
      const response = await fetch('/api/recommendations/personalized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'default' // This should come from user context
        },
        body: JSON.stringify({
          userId: 'current-user', // This should come from user context
          preferences,
          limit: 20
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert API response to our format
      const recommendations: FrameRecommendation[] = data.data.map((item: any) => ({
        frame: item.product,
        compatibilityScore: item.score * 100, // Convert to percentage
        reasons: item.reasons
      }));

      // Create result
      const result: RecommendationResult = {
        frames: recommendations,
        cacheKey,
        expiresAt: Date.now() + this.CACHE_DURATION
      };
      
      // Cache the result
      this.cacheResult(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error fetching recommendations from API:', error);
      
      // Fallback to mock data if API fails
      return this.getMockRecommendations(preferences);
    }
  }

  /**
   * Fallback method using mock data
   */
  private async getMockRecommendations(preferences: UserPreferences): Promise<RecommendationResult> {
    // Filter frames based on preferences
    let filteredFrames = [...this.mockFrames];
    
    // Filter by budget
    filteredFrames = filteredFrames.filter(frame => 
      frame.price >= preferences.budget.min && 
      frame.price <= preferences.budget.max
    );
    
    // Filter by style preferences if any are selected
    if (preferences.stylePreferences.shapes.length > 0) {
      filteredFrames = filteredFrames.filter(frame => 
        preferences.stylePreferences.shapes.includes(frame.shape)
      );
    }
    
    if (preferences.stylePreferences.materials.length > 0) {
      filteredFrames = filteredFrames.filter(frame => 
        preferences.stylePreferences.materials.includes(frame.material)
      );
    }
    
    if (preferences.stylePreferences.colors.length > 0) {
      filteredFrames = filteredFrames.filter(frame => 
        preferences.stylePreferences.colors.includes(frame.color)
      );
    }
    
    // Calculate compatibility scores and generate reasons
    const recommendations: FrameRecommendation[] = filteredFrames.map(frame => {
      const compatibilityScore = this.calculateCompatibilityScore(frame, preferences);
      const reasons = this.generateRecommendationReasons(frame, preferences);
      
      return {
        frame,
        compatibilityScore,
        reasons
      };
    });
    
    // Sort by compatibility score
    recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    
    // Create result
    const result: RecommendationResult = {
      frames: recommendations,
      cacheKey: 'mock-' + Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    };
    
    return result;
  }
  
  /**
   * Calculate compatibility score for a frame based on user preferences
   */
  private calculateCompatibilityScore(frame: Frame, preferences: UserPreferences): number {
    let score = 0;
    let totalFactors = 0;
    
    // Face shape compatibility
    if (preferences.faceShape) {
      totalFactors++;
      const faceShapeCompatibility: Record<string, string[]> = {
        'round': ['Square', 'Rectangle', 'Aviator', 'Cat Eye'],
        'square': ['Round', 'Oval', 'Browline'],
        'oval': ['Aviator', 'Square', 'Rectangle', 'Round', 'Oversized'],
        'heart': ['Round', 'Oval', 'Browline', 'Cat Eye'],
        'diamond': ['Oval', 'Browline', 'Cat Eye'],
        'oblong': ['Round', 'Square', 'Oversized']
      };
      
      const compatibleShapes = faceShapeCompatibility[preferences.faceShape.toLowerCase()] || [];
      
      if (compatibleShapes.includes(frame.shape)) {
        score += 25;
      }
    }
    
    // Color preferences
    if (preferences.stylePreferences.colors.length > 0) {
      totalFactors++;
      if (preferences.stylePreferences.colors.includes(frame.color)) {
        score += 20;
      }
    }
    
    // Material preferences
    if (preferences.stylePreferences.materials.length > 0) {
      totalFactors++;
      if (preferences.stylePreferences.materials.includes(frame.material)) {
        score += 20;
      }
    }
    
    // Shape preferences
    if (preferences.stylePreferences.shapes.length > 0) {
      totalFactors++;
      if (preferences.stylePreferences.shapes.includes(frame.shape)) {
        score += 20;
      }
    }
    
    // Feature preferences
    if (preferences.features.length > 0) {
      totalFactors++;
      
      // Map features to materials or other frame properties
      const featureScore = preferences.features.reduce((acc, feature) => {
        switch (feature) {
          case 'lightweight':
            return frame.material === 'Titanium' ? acc + 5 : acc;
          case 'flexible':
            return ['Nylon', 'Propionate'].includes(frame.material) ? acc + 5 : acc;
          case 'hypoallergenic':
            return ['Titanium', 'Acetate'].includes(frame.material) ? acc + 5 : acc;
          case 'eco-friendly':
            return frame.material === 'Acetate' ? acc + 5 : acc;
          default:
            return acc;
        }
      }, 0);
      
      score += featureScore;
    }
    
    // Price preferences - give higher scores to frames closer to the middle of the budget range
    totalFactors++;
    const budgetMidpoint = (preferences.budget.min + preferences.budget.max) / 2;
    const priceDifference = Math.abs(frame.price - budgetMidpoint);
    const priceRange = preferences.budget.max - preferences.budget.min;
    const priceScore = 15 * (1 - (priceDifference / (priceRange / 2)));
    score += Math.max(0, priceScore);
    
    // Calculate final percentage score
    const maxPossibleScore = totalFactors * 25; // 25 points per factor
    const finalScore = totalFactors > 0 ? Math.round((score / maxPossibleScore) * 100) : 50;
    
    // Ensure score is between 0 and 100
    return Math.min(100, Math.max(0, finalScore));
  }
  
  /**
   * Generate recommendation reasons for a frame based on user preferences
   */
  private generateRecommendationReasons(frame: Frame, preferences: UserPreferences): string[] {
    const reasons: string[] = [];
    
    // Face shape compatibility
    if (preferences.faceShape) {
      const faceShapeCompatibility: Record<string, string[]> = {
        'round': ['Square', 'Rectangle', 'Aviator', 'Cat Eye'],
        'square': ['Round', 'Oval', 'Browline'],
        'oval': ['Aviator', 'Square', 'Rectangle', 'Round', 'Oversized'],
        'heart': ['Round', 'Oval', 'Browline', 'Cat Eye'],
        'diamond': ['Oval', 'Browline', 'Cat Eye'],
        'oblong': ['Round', 'Square', 'Oversized']
      };
      
      const compatibleShapes = faceShapeCompatibility[preferences.faceShape.toLowerCase()] || [];
      
      if (compatibleShapes.includes(frame.shape)) {
        reasons.push(`${frame.shape} frames complement your ${preferences.faceShape} face shape`);
      }
    }
    
    // Style preferences
    if (preferences.stylePreferences.colors.includes(frame.color)) {
      reasons.push(`Matches your color preference for ${frame.color}`);
    }
    
    if (preferences.stylePreferences.materials.includes(frame.material)) {
      reasons.push(`Made from your preferred ${frame.material} material`);
    }
    
    if (preferences.stylePreferences.shapes.includes(frame.shape)) {
      reasons.push(`Features your preferred ${frame.shape} shape`);
    }
    
    // Feature preferences
    if (preferences.features.includes('lightweight') && frame.material === 'Titanium') {
      reasons.push('Titanium material provides a lightweight feel');
    }
    
    if (preferences.features.includes('flexible') && 
        (frame.material === 'Nylon' || frame.material === 'Propionate')) {
      reasons.push(`${frame.material} offers excellent flexibility`);
    }
    
    if (preferences.features.includes('hypoallergenic') && 
        (frame.material === 'Titanium' || frame.material === 'Acetate')) {
      reasons.push(`${frame.material} is hypoallergenic`);
    }
    
    if (preferences.features.includes('eco-friendly') && frame.material === 'Acetate') {
      reasons.push('Acetate is a more eco-friendly material option');
    }
    
    // Add generic reasons if we don't have enough specific ones
    if (reasons.length < 2) {
      reasons.push(`${frame.brand} is known for quality craftsmanship`);
    }
    
    if (reasons.length < 3) {
      reasons.push(`${frame.shape} shape is currently trending`);
    }
    
    return reasons;
  }
  
  /**
   * Generate a cache key based on user preferences
   */
  private generateCacheKey(preferences: UserPreferences): string {
    return JSON.stringify({
      faceShape: preferences.faceShape,
      colors: preferences.stylePreferences.colors.sort(),
      materials: preferences.stylePreferences.materials.sort(),
      shapes: preferences.stylePreferences.shapes.sort(),
      features: preferences.features.sort(),
      budget: preferences.budget
    });
  }
  
  /**
   * Get cached result if it exists and is not expired
   */
  private getCachedResult(cacheKey: string): RecommendationResult | null {
    const cachedEntry = this.cache.get(cacheKey);
    
    if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
      return cachedEntry.result;
    }
    
    return null;
  }
  
  /**
   * Cache a recommendation result
   */
  private cacheResult(cacheKey: string, result: RecommendationResult): void {
    this.cache.set(cacheKey, {
      result,
      expiresAt: Date.now() + this.CACHE_DURATION
    });
    
    // Clean up expired cache entries
    this.cleanupCache();
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Save user preferences to local storage
   */
  savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem('frameFinderPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences to local storage:', error);
    }
  }
  
  /**
   * Load user preferences from local storage
   */
  loadPreferences(): UserPreferences | null {
    try {
      const savedPreferences = localStorage.getItem('frameFinderPreferences');
      
      if (savedPreferences) {
        return JSON.parse(savedPreferences);
      }
    } catch (error) {
      console.error('Failed to load preferences from local storage:', error);
    }
    
    return null;
  }
  
  /**
   * Track user interaction with recommendations
   */
  trackInteraction(interactionType: string, frameId: string): void {
    // In a real app, this would send analytics data to a backend service
    console.log(`Tracking interaction: ${interactionType} for frame ${frameId}`);
    
    // Example analytics payload
    const analyticsPayload = {
      event: interactionType,
      frameId,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    };
    
    // Log the payload (in a real app, this would be sent to an analytics service)
    console.log('Analytics payload:', analyticsPayload);
  }
  
  /**
   * Get or create a session ID for analytics tracking
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('frameFinderSessionId');
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem('frameFinderSessionId', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Get trending products from API
   */
  async getTrendingProducts(category?: string, limit: number = 10, timeFrame: string = 'week'): Promise<Frame[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        timeFrame
      });
      
      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`/api/recommendations/trending?${params}`, {
        headers: {
          'X-Tenant-ID': 'default'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.product || item);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      // Fallback to mock data
      return this.mockFrames.slice(0, limit);
    }
  }

  /**
   * Get recently viewed products from API
   */
  async getRecentlyViewed(userId: string, limit: number = 10): Promise<Frame[]> {
    try {
      const response = await fetch(`/api/recommendations/recently-viewed/${userId}?limit=${limit}`, {
        headers: {
          'X-Tenant-ID': 'default'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.product || item);
    } catch (error) {
      console.error('Error fetching recently viewed products:', error);
      // Fallback to mock data
      return this.mockFrames.slice(0, limit);
    }
  }

  /**
   * Get similar products from API
   */
  async getSimilarProducts(productId: string, limit: number = 10, similarityType: string = 'visual'): Promise<Frame[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        similarityType
      });

      const response = await fetch(`/api/recommendations/similar/${productId}?${params}`, {
        headers: {
          'X-Tenant-ID': 'default'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map((item: any) => item.product || item);
    } catch (error) {
      console.error('Error fetching similar products:', error);
      // Fallback to mock data
      return this.mockFrames.slice(0, limit);
    }
  }

  /**
   * Track product view
   */
  async trackProductView(productId: string, userId?: string): Promise<void> {
    try {
      const response = await fetch('/api/recommendations/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'default'
        },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          productId,
          sessionId: this.getSessionId(),
          deviceType: this.getDeviceType(),
          source: 'web'
        })
      });

      if (!response.ok) {
        console.warn('Failed to track product view:', response.status);
      }
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }

  /**
   * Submit feedback for recommendations
   */
  async submitFeedback(productId: string, feedbackType: string, userId?: string, rating?: number, comment?: string): Promise<void> {
    try {
      const response = await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'default'
        },
        body: JSON.stringify({
          userId: userId || 'anonymous',
          productId,
          feedbackType,
          rating,
          comment
        })
      });

      if (!response.ok) {
        console.warn('Failed to submit feedback:', response.status);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }

  /**
   * Get device type for tracking
   */
  private getDeviceType(): 'web' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'web';
  }
}

// Create and export a singleton instance
export const recommendationService = new RecommendationService();