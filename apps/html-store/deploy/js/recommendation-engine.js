/**
 * SKU-Genie Product Recommendation Engine
 * 
 * This module provides sophisticated product recommendations based on:
 * - Face shape compatibility
 * - Style preferences
 * - Browsing history
 * - Purchase history
 * - Collaborative filtering
 * - Content-based filtering
 */

// Configuration
const RECOMMENDATION_CONFIG = {
    // Weights for different recommendation factors (must sum to 1)
    weights: {
        faceShapeCompatibility: 0.35,
        stylePreference: 0.25,
        browsingHistory: 0.15,
        purchaseHistory: 0.10,
        collaborativeFiltering: 0.10,
        contentBasedFiltering: 0.05
    },
    
    // Minimum compatibility score for recommendations (0-1)
    minCompatibilityScore: 0.6,
    
    // Maximum number of recommendations to return
    maxRecommendations: 6,
    
    // Whether to use machine learning for recommendations
    useML: false,
    
    // ML model endpoint (if useML is true)
    mlEndpoint: 'https://api.skugenie.com/ml/recommendations'
};

// User data store (in a real implementation, this would be in a database)
const userDataStore = {
    // Map of user IDs to user data
    users: new Map(),
    
    // Get user data by ID
    getUserData(userId) {
        if (!this.users.has(userId)) {
            // Create new user data if it doesn't exist
            this.users.set(userId, {
                id: userId,
                faceShape: null,
                stylePreferences: [],
                browsingHistory: [],
                purchaseHistory: [],
                viewedProducts: new Set(),
                lastRecommendations: []
            });
        }
        
        return this.users.get(userId);
    },
    
    // Update user face shape
    updateFaceShape(userId, faceShape) {
        const userData = this.getUserData(userId);
        userData.faceShape = faceShape;
    },
    
    // Add style preference
    addStylePreference(userId, style, weight = 1) {
        const userData = this.getUserData(userId);
        
        // Check if style already exists
        const existingIndex = userData.stylePreferences.findIndex(p => p.style === style);
        
        if (existingIndex >= 0) {
            // Update existing preference
            userData.stylePreferences[existingIndex].weight += weight;
        } else {
            // Add new preference
            userData.stylePreferences.push({ style, weight });
        }
        
        // Sort by weight descending
        userData.stylePreferences.sort((a, b) => b.weight - a.weight);
    },
    
    // Add browsing history entry
    addBrowsingHistory(userId, productId, timestamp = Date.now()) {
        const userData = this.getUserData(userId);
        
        // Add to browsing history
        userData.browsingHistory.unshift({ productId, timestamp });
        
        // Keep only the last 50 entries
        if (userData.browsingHistory.length > 50) {
            userData.browsingHistory.pop();
        }
        
        // Add to viewed products
        userData.viewedProducts.add(productId);
    },
    
    // Add purchase history entry
    addPurchaseHistory(userId, productId, timestamp = Date.now()) {
        const userData = this.getUserData(userId);
        
        // Add to purchase history
        userData.purchaseHistory.unshift({ productId, timestamp });
        
        // Add to viewed products
        userData.viewedProducts.add(productId);
    },
    
    // Set last recommendations
    setLastRecommendations(userId, recommendations) {
        const userData = this.getUserData(userId);
        userData.lastRecommendations = recommendations;
    },
    
    // Get last recommendations
    getLastRecommendations(userId) {
        const userData = this.getUserData(userId);
        return userData.lastRecommendations;
    }
};

/**
 * Generate product recommendations for a user
 * @param {string} userId - The user ID
 * @param {Array} allProducts - All available products
 * @param {Object} options - Recommendation options
 * @returns {Promise<Array>} - Recommended products
 */
async function getRecommendations(userId, allProducts, options = {}) {
    // Get user data
    const userData = userDataStore.getUserData(userId);
    
    // If ML is enabled, use ML model
    if (RECOMMENDATION_CONFIG.useML) {
        return getMLRecommendations(userId, allProducts, options);
    }
    
    // Calculate scores for each product
    const productScores = allProducts.map(product => {
        // Skip products the user has already purchased
        const hasPurchased = userData.purchaseHistory.some(p => p.productId === product.id);
        if (hasPurchased && !options.includePurchased) {
            return { product, score: 0 };
        }
        
        // Calculate individual scores
        const scores = {
            faceShapeCompatibility: calculateFaceShapeScore(product, userData),
            stylePreference: calculateStyleScore(product, userData),
            browsingHistory: calculateBrowsingScore(product, userData),
            purchaseHistory: calculatePurchaseScore(product, userData),
            collaborativeFiltering: calculateCollaborativeScore(product, userData),
            contentBasedFiltering: calculateContentBasedScore(product, userData)
        };
        
        // Calculate weighted score
        let weightedScore = 0;
        for (const [factor, score] of Object.entries(scores)) {
            weightedScore += score * RECOMMENDATION_CONFIG.weights[factor];
        }
        
        return { product, score: weightedScore };
    });
    
    // Sort by score descending
    productScores.sort((a, b) => b.score - a.score);
    
    // Filter by minimum score
    const filteredScores = productScores.filter(
        item => item.score >= RECOMMENDATION_CONFIG.minCompatibilityScore
    );
    
    // Limit to max recommendations
    const limitedScores = filteredScores.slice(0, RECOMMENDATION_CONFIG.maxRecommendations);
    
    // Extract products
    const recommendations = limitedScores.map(item => ({
        ...item.product,
        recommendationScore: item.score
    }));
    
    // Store recommendations
    userDataStore.setLastRecommendations(userId, recommendations);
    
    return recommendations;
}

/**
 * Get recommendations using machine learning
 * @param {string} userId - The user ID
 * @param {Array} allProducts - All available products
 * @param {Object} options - Recommendation options
 * @returns {Promise<Array>} - Recommended products
 */
async function getMLRecommendations(userId, allProducts, options = {}) {
    try {
        // Get user data
        const userData = userDataStore.getUserData(userId);
        
        // Prepare request data
        const requestData = {
            userId,
            faceShape: userData.faceShape,
            stylePreferences: userData.stylePreferences,
            browsingHistory: userData.browsingHistory,
            purchaseHistory: userData.purchaseHistory,
            viewedProducts: Array.from(userData.viewedProducts),
            options
        };
        
        // Make API request
        const response = await fetch(RECOMMENDATION_CONFIG.mlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`ML API request failed: ${response.status} ${response.statusText}`);
        }
        
        // Parse response
        const data = await response.json();
        
        // Map product IDs to products
        const recommendations = data.recommendations.map(rec => {
            const product = allProducts.find(p => p.id === rec.productId);
            return {
                ...product,
                recommendationScore: rec.score
            };
        }).filter(p => p); // Remove undefined products
        
        // Store recommendations
        userDataStore.setLastRecommendations(userId, recommendations);
        
        return recommendations;
    } catch (error) {
        console.error('Error getting ML recommendations:', error);
        
        // Fall back to non-ML recommendations
        return getRecommendations(userId, allProducts, options);
    }
}

/**
 * Calculate face shape compatibility score
 * @param {Object} product - The product
 * @param {Object} userData - The user data
 * @returns {number} - Score between 0 and 1
 */
function calculateFaceShapeScore(product, userData) {
    // If user has no face shape, return neutral score
    if (!userData.faceShape) {
        return 0.5;
    }
    
    // If product has no face shape compatibility, return neutral score
    if (!product.ai_enhanced || !product.ai_enhanced.face_shape_compatibility_scores) {
        return 0.5;
    }
    
    // Get compatibility score for user's face shape
    const compatScore = product.ai_enhanced.face_shape_compatibility_scores[userData.faceShape] || 0;
    
    return compatScore;
}

/**
 * Calculate style preference score
 * @param {Object} product - The product
 * @param {Object} userData - The user data
 * @returns {number} - Score between 0 and 1
 */
function calculateStyleScore(product, userData) {
    // If user has no style preferences, return neutral score
    if (!userData.stylePreferences || userData.stylePreferences.length === 0) {
        return 0.5;
    }
    
    // If product has no style keywords, return neutral score
    if (!product.ai_enhanced || !product.ai_enhanced.style_keywords || product.ai_enhanced.style_keywords.length === 0) {
        return 0.5;
    }
    
    // Calculate match score based on style preferences
    let totalWeight = 0;
    let matchScore = 0;
    
    for (const preference of userData.stylePreferences) {
        // Check if product has this style
        const hasStyle = product.ai_enhanced.style_keywords.some(
            keyword => keyword.toLowerCase() === preference.style.toLowerCase()
        );
        
        if (hasStyle) {
            matchScore += preference.weight;
        }
        
        totalWeight += preference.weight;
    }
    
    // Normalize score
    return totalWeight > 0 ? matchScore / totalWeight : 0.5;
}

/**
 * Calculate browsing history score
 * @param {Object} product - The product
 * @param {Object} userData - The user data
 * @returns {number} - Score between 0 and 1
 */
function calculateBrowsingScore(product, userData) {
    // If user has no browsing history, return neutral score
    if (!userData.browsingHistory || userData.browsingHistory.length === 0) {
        return 0.5;
    }
    
    // Check if user has viewed this product
    const hasViewed = userData.viewedProducts.has(product.id);
    
    // If user has viewed this product, give it a lower score to promote diversity
    if (hasViewed) {
        return 0.3;
    }
    
    // Find similar products in browsing history
    const similarProducts = userData.browsingHistory.filter(item => {
        const browsedProduct = allProducts.find(p => p.id === item.productId);
        
        if (!browsedProduct) {
            return false;
        }
        
        // Check if products have similar styles
        return areSimilarProducts(product, browsedProduct);
    });
    
    // Calculate recency-weighted score
    let score = 0;
    const now = Date.now();
    
    for (let i = 0; i < similarProducts.length; i++) {
        // More recent products have higher weight
        const recency = Math.max(0, 1 - (now - similarProducts[i].timestamp) / (30 * 24 * 60 * 60 * 1000)); // 30 days max
        score += recency * (1 / (i + 1)); // Position weight
    }
    
    // Normalize score
    return Math.min(1, score);
}

/**
 * Calculate purchase history score
 * @param {Object} product - The product
 * @param {Object} userData - The user data
 * @returns {number} - Score between 0 and 1
 */
function calculatePurchaseScore(product, userData) {
    // If user has no purchase history, return neutral score
    if (!userData.purchaseHistory || userData.purchaseHistory.length === 0) {
        return 0.5;
    }
    
    // Find similar products in purchase history
    const similarProducts = userData.purchaseHistory.filter(item => {
        const purchasedProduct = allProducts.find(p => p.id === item.productId);
        
        if (!purchasedProduct) {
            return false;
        }
        
        // Check if products have similar styles
        return areSimilarProducts(product, purchasedProduct);
    });
    
    // Calculate score based on similar purchases
    return Math.min(1, similarProducts.length / 3); // Max score with 3 similar purchases
}

/**
 * Calculate collaborative filtering score
 * @param {Object} product - The product
 * @param {Object} userData - The user data
 * @returns {number} - Score between 0 and 1
 */
function calculateCollaborativeScore(product, userData) {
    // In a real implementation, this would use collaborative filtering
    // based on similar users' preferences
    
    // For now, return a random score
    return 0.5 + (Math.random() * 0.5);
}

/**
 * Calculate content-based filtering score
 * @param {Object} product - The product
 * @param {Object} userData - The user data
 * @returns {number} - Score between 0 and 1
 */
function calculateContentBasedScore(product, userData) {
    // In a real implementation, this would use content-based filtering
    // based on product attributes
    
    // For now, return a random score
    return 0.5 + (Math.random() * 0.5);
}

/**
 * Check if two products are similar
 * @param {Object} product1 - First product
 * @param {Object} product2 - Second product
 * @returns {boolean} - Whether the products are similar
 */
function areSimilarProducts(product1, product2) {
    // Check if products have the same brand
    if (product1.brand === product2.brand) {
        return true;
    }
    
    // Check if products have the same frame shape
    if (product1.specifications && product2.specifications &&
        product1.specifications.frame_shape === product2.specifications.frame_shape) {
        return true;
    }
    
    // Check if products have similar style keywords
    if (product1.ai_enhanced && product2.ai_enhanced &&
        product1.ai_enhanced.style_keywords && product2.ai_enhanced.style_keywords) {
        
        const keywords1 = product1.ai_enhanced.style_keywords;
        const keywords2 = product2.ai_enhanced.style_keywords;
        
        // Count matching keywords
        const matches = keywords1.filter(k1 => 
            keywords2.some(k2 => k1.toLowerCase() === k2.toLowerCase())
        );
        
        // If at least 2 keywords match, consider them similar
        if (matches.length >= 2) {
            return true;
        }
    }
    
    return false;
}

/**
 * Track product view
 * @param {string} userId - The user ID
 * @param {string} productId - The product ID
 */
function trackProductView(userId, productId) {
    userDataStore.addBrowsingHistory(userId, productId);
}

/**
 * Track product purchase
 * @param {string} userId - The user ID
 * @param {string} productId - The product ID
 */
function trackProductPurchase(userId, productId) {
    userDataStore.addPurchaseHistory(userId, productId);
}

/**
 * Set user face shape
 * @param {string} userId - The user ID
 * @param {string} faceShape - The face shape
 */
function setUserFaceShape(userId, faceShape) {
    userDataStore.updateFaceShape(userId, faceShape);
}

/**
 * Add user style preference
 * @param {string} userId - The user ID
 * @param {string} style - The style
 * @param {number} weight - The preference weight
 */
function addUserStylePreference(userId, style, weight = 1) {
    userDataStore.addStylePreference(userId, style, weight);
}

// Export functions
window.recommendationEngine = {
    getRecommendations,
    trackProductView,
    trackProductPurchase,
    setUserFaceShape,
    addUserStylePreference
};