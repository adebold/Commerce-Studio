/**
 * Enhanced Recommendation Service
 * ML-powered product matching with face shape analysis integration
 * Provides personalized eyewear recommendations with detailed reasoning
 */

import FaceShapeAnalysisService from './face-shape-analysis-service.js';

export default class EnhancedRecommendationService {
    constructor(config = {}) {
        this.config = {
            confidenceThreshold: config.confidenceThreshold || 0.6,
            maxRecommendations: config.maxRecommendations || 10,
            diversityFactor: config.diversityFactor || 0.3,
            mockMode: config.mockMode !== false, // Default to mock mode for demo
            ...config
        };
        
        // Initialize face shape analysis service
        this.faceShapeAnalyzer = new FaceShapeAnalysisService(config.faceShapeAnalysis || {});
        
        // Mock product catalog for demonstration
        this.productCatalog = this.initializeMockCatalog();
        
        // Scoring weights for different factors
        this.scoringWeights = {
            faceShapeMatch: 0.35,      // Face shape compatibility
            stylePreference: 0.25,     // User style preferences
            lifestyle: 0.15,           // Lifestyle needs
            budget: 0.15,              // Budget constraints
            measurements: 0.10         // Precise measurements fit
        };
        
        // Style preference mappings
        this.stylePreferences = {
            classic: {
                keywords: ['timeless', 'traditional', 'conservative', 'professional'],
                frameStyles: ['rectangular', 'oval', 'aviator'],
                materials: ['acetate', 'metal', 'titanium'],
                colors: ['black', 'brown', 'tortoiseshell', 'gold', 'silver']
            },
            modern: {
                keywords: ['contemporary', 'sleek', 'minimalist', 'trendy'],
                frameStyles: ['geometric', 'rimless', 'semi-rimless', 'rectangular'],
                materials: ['titanium', 'stainless steel', 'carbon fiber'],
                colors: ['black', 'silver', 'blue', 'gunmetal']
            },
            bold: {
                keywords: ['statement', 'dramatic', 'artistic', 'unique'],
                frameStyles: ['oversized', 'cat-eye', 'geometric', 'round'],
                materials: ['acetate', 'mixed materials'],
                colors: ['red', 'purple', 'green', 'patterned', 'bright colors']
            },
            vintage: {
                keywords: ['retro', 'classic', 'nostalgic', 'timeless'],
                frameStyles: ['round', 'cat-eye', 'aviator', 'browline'],
                materials: ['acetate', 'wire', 'horn'],
                colors: ['tortoiseshell', 'amber', 'gold', 'vintage patterns']
            },
            sporty: {
                keywords: ['active', 'athletic', 'performance', 'durable'],
                frameStyles: ['wrap', 'rectangular', 'semi-rimless'],
                materials: ['TR90', 'polycarbonate', 'flexible materials'],
                colors: ['black', 'blue', 'gray', 'sporty colors']
            }
        };
        
        // Lifestyle need mappings
        this.lifestyleNeeds = {
            professional: {
                priorities: ['sophisticated', 'conservative', 'reliable'],
                frameStyles: ['rectangular', 'oval', 'classic'],
                features: ['blue light filtering', 'anti-glare', 'lightweight']
            },
            student: {
                priorities: ['affordable', 'durable', 'comfortable'],
                frameStyles: ['rectangular', 'round', 'trendy'],
                features: ['blue light filtering', 'lightweight', 'flexible']
            },
            active: {
                priorities: ['durable', 'secure fit', 'performance'],
                frameStyles: ['sporty', 'wrap', 'secure'],
                features: ['impact resistant', 'non-slip', 'lightweight']
            },
            social: {
                priorities: ['stylish', 'trendy', 'expressive'],
                frameStyles: ['cat-eye', 'oversized', 'bold'],
                features: ['fashion-forward', 'statement', 'photochromic']
            },
            outdoor: {
                priorities: ['UV protection', 'durable', 'weather resistant'],
                frameStyles: ['aviator', 'wrap', 'sporty'],
                features: ['UV400', 'polarized', 'impact resistant']
            }
        };
    }

    /**
     * Initialize mock product catalog for demonstration
     */
    initializeMockCatalog() {
        return [
            {
                id: 'vc-001',
                name: 'VisionCraft Classic Rectangle',
                brand: 'VisionCraft',
                category: 'prescription',
                style: 'rectangular',
                material: 'acetate',
                color: 'black',
                price: 149.99,
                measurements: {
                    lensWidth: 52,
                    bridgeWidth: 18,
                    templeLength: 140,
                    frameWidth: 135,
                    frameHeight: 32
                },
                features: ['blue light filtering', 'anti-glare coating', 'lightweight'],
                suitableFaceShapes: ['oval', 'round', 'heart'],
                styleMatch: ['classic', 'professional'],
                lifestyleMatch: ['professional', 'student'],
                image: '/images/frames/vc-classic-rectangle.jpg',
                popularity: 0.85,
                inStock: true,
                rating: 4.5,
                reviews: 124
            },
            {
                id: 'vc-002',
                name: 'VisionCraft Modern Round',
                brand: 'VisionCraft',
                category: 'prescription',
                style: 'round',
                material: 'titanium',
                color: 'silver',
                price: 189.99,
                measurements: {
                    lensWidth: 48,
                    bridgeWidth: 20,
                    templeLength: 145,
                    frameWidth: 130,
                    frameHeight: 48
                },
                features: ['lightweight titanium', 'hypoallergenic', 'adjustable nose pads'],
                suitableFaceShapes: ['square', 'diamond', 'oblong'],
                styleMatch: ['modern', 'vintage'],
                lifestyleMatch: ['professional', 'social'],
                image: '/images/frames/vc-modern-round.jpg',
                popularity: 0.78,
                inStock: true,
                rating: 4.7,
                reviews: 89
            },
            {
                id: 'vc-003',
                name: 'VisionCraft Bold Cat-Eye',
                brand: 'VisionCraft',
                category: 'prescription',
                style: 'cat-eye',
                material: 'acetate',
                color: 'tortoiseshell',
                price: 169.99,
                measurements: {
                    lensWidth: 54,
                    bridgeWidth: 16,
                    templeLength: 138,
                    frameWidth: 140,
                    frameHeight: 38
                },
                features: ['premium acetate', 'hand-polished', 'spring hinges'],
                suitableFaceShapes: ['heart', 'diamond', 'round'],
                styleMatch: ['bold', 'vintage'],
                lifestyleMatch: ['social', 'professional'],
                image: '/images/frames/vc-bold-cat-eye.jpg',
                popularity: 0.72,
                inStock: true,
                rating: 4.6,
                reviews: 156
            },
            {
                id: 'vc-004',
                name: 'VisionCraft Sport Wrap',
                brand: 'VisionCraft',
                category: 'sunglasses',
                style: 'wrap',
                material: 'TR90',
                color: 'black',
                price: 129.99,
                measurements: {
                    lensWidth: 65,
                    bridgeWidth: 15,
                    templeLength: 125,
                    frameWidth: 145,
                    frameHeight: 42
                },
                features: ['impact resistant', 'UV400 protection', 'non-slip grip'],
                suitableFaceShapes: ['oval', 'square', 'oblong'],
                styleMatch: ['sporty', 'modern'],
                lifestyleMatch: ['active', 'outdoor'],
                image: '/images/frames/vc-sport-wrap.jpg',
                popularity: 0.68,
                inStock: true,
                rating: 4.4,
                reviews: 78
            },
            {
                id: 'vc-005',
                name: 'VisionCraft Vintage Aviator',
                brand: 'VisionCraft',
                category: 'sunglasses',
                style: 'aviator',
                material: 'metal',
                color: 'gold',
                price: 199.99,
                measurements: {
                    lensWidth: 58,
                    bridgeWidth: 14,
                    templeLength: 135,
                    frameWidth: 140,
                    frameHeight: 50
                },
                features: ['polarized lenses', 'classic design', 'adjustable nose pads'],
                suitableFaceShapes: ['oval', 'heart', 'square'],
                styleMatch: ['vintage', 'classic'],
                lifestyleMatch: ['outdoor', 'social'],
                image: '/images/frames/vc-vintage-aviator.jpg',
                popularity: 0.82,
                inStock: true,
                rating: 4.8,
                reviews: 203
            },
            {
                id: 'vc-006',
                name: 'VisionCraft Oversized Square',
                brand: 'VisionCraft',
                category: 'prescription',
                style: 'square',
                material: 'acetate',
                color: 'blue',
                price: 159.99,
                measurements: {
                    lensWidth: 56,
                    bridgeWidth: 17,
                    templeLength: 142,
                    frameWidth: 145,
                    frameHeight: 45
                },
                features: ['oversized design', 'statement piece', 'comfortable fit'],
                suitableFaceShapes: ['oblong', 'diamond'],
                styleMatch: ['bold', 'modern'],
                lifestyleMatch: ['social', 'student'],
                image: '/images/frames/vc-oversized-square.jpg',
                popularity: 0.65,
                inStock: true,
                rating: 4.3,
                reviews: 92
            }
        ];
    }

    /**
     * Generate enhanced recommendations with face shape analysis
     * @param {Object} consultationData - User consultation data
     * @param {Object} faceAnalysis - Face shape analysis results
     * @returns {Promise<Object>} Enhanced recommendation results
     */
    async generateEnhancedRecommendations(consultationData, faceAnalysis = null) {
        try {
            console.log('Generating enhanced recommendations...');
            
            // If no face analysis provided, use consultation data or default
            if (!faceAnalysis && consultationData.faceShape) {
                faceAnalysis = { faceShape: consultationData.faceShape };
            }
            
            // Score all products based on user preferences and face shape
            const scoredProducts = await this.scoreProducts(consultationData, faceAnalysis);
            
            // Apply diversity and filtering
            const filteredProducts = this.applyFiltersAndDiversity(scoredProducts, consultationData);
            
            // Generate explanations for recommendations
            const recommendationsWithExplanations = this.generateExplanations(
                filteredProducts, 
                consultationData, 
                faceAnalysis
            );
            
            // Create final recommendation response
            const result = {
                recommendations: recommendationsWithExplanations,
                metadata: {
                    totalProducts: this.productCatalog.length,
                    scoredProducts: scoredProducts.length,
                    filteredProducts: filteredProducts.length,
                    faceShapeUsed: faceAnalysis?.faceShape || 'none',
                    confidenceScore: this.calculateOverallConfidence(recommendationsWithExplanations),
                    generatedAt: new Date().toISOString(),
                    scoringWeights: this.scoringWeights
                },
                insights: this.generateInsights(consultationData, faceAnalysis, recommendationsWithExplanations),
                alternativeOptions: this.generateAlternatives(scoredProducts, consultationData)
            };
            
            console.log('Enhanced recommendations generated:', result);
            return result;
            
        } catch (error) {
            console.error('Enhanced recommendation generation error:', error);
            throw new Error('Failed to generate enhanced recommendations: ' + error.message);
        }
    }

    /**
     * Score all products based on multiple factors
     */
    async scoreProducts(consultationData, faceAnalysis) {
        const scoredProducts = [];
        
        for (const product of this.productCatalog) {
            const scores = {
                faceShapeMatch: this.calculateFaceShapeScore(product, faceAnalysis),
                stylePreference: this.calculateStyleScore(product, consultationData),
                lifestyle: this.calculateLifestyleScore(product, consultationData),
                budget: this.calculateBudgetScore(product, consultationData),
                measurements: this.calculateMeasurementScore(product, faceAnalysis)
            };
            
            // Calculate weighted total score
            const totalScore = Object.keys(scores).reduce((total, factor) => {
                return total + (scores[factor] * this.scoringWeights[factor]);
            }, 0);
            
            scoredProducts.push({
                ...product,
                scores: scores,
                totalScore: parseFloat(totalScore.toFixed(3)),
                confidence: this.calculateProductConfidence(scores, consultationData, faceAnalysis)
            });
        }
        
        // Sort by total score descending
        return scoredProducts.sort((a, b) => b.totalScore - a.totalScore);
    }

    /**
     * Calculate face shape compatibility score
     */
    calculateFaceShapeScore(product, faceAnalysis) {
        if (!faceAnalysis?.faceShape) return 0.5; // Neutral score if no face analysis
        
        const userFaceShape = faceAnalysis.faceShape;
        
        // Direct match
        if (product.suitableFaceShapes.includes(userFaceShape)) {
            return 1.0;
        }
        
        // Check for similar face shapes
        const similarities = product.suitableFaceShapes.map(shape => 
            this.faceShapeAnalyzer.compareFaceShapes(userFaceShape, shape)
        );
        
        return Math.max(...similarities, 0.2); // Minimum score of 0.2
    }

    /**
     * Calculate style preference score
     */
    calculateStyleScore(product, consultationData) {
        if (!consultationData.stylePreference) return 0.5;
        
        const userStyle = consultationData.stylePreference.toLowerCase();
        
        // Direct style match
        if (product.styleMatch.includes(userStyle)) {
            return 1.0;
        }
        
        // Check for related styles
        const stylePrefs = this.stylePreferences[userStyle];
        if (stylePrefs) {
            const frameStyleMatch = stylePrefs.frameStyles.includes(product.style) ? 0.8 : 0.3;
            const materialMatch = stylePrefs.materials.includes(product.material) ? 0.2 : 0;
            const colorMatch = stylePrefs.colors.includes(product.color) ? 0.2 : 0;
            
            return Math.min(frameStyleMatch + materialMatch + colorMatch, 1.0);
        }
        
        return 0.4; // Default score for unknown style
    }

    /**
     * Calculate lifestyle compatibility score
     */
    calculateLifestyleScore(product, consultationData) {
        if (!consultationData.lifestyle) return 0.5;
        
        const userLifestyle = consultationData.lifestyle.toLowerCase();
        
        // Direct lifestyle match
        if (product.lifestyleMatch.includes(userLifestyle)) {
            return 1.0;
        }
        
        // Check lifestyle needs compatibility
        const lifestyleNeeds = this.lifestyleNeeds[userLifestyle];
        if (lifestyleNeeds) {
            let score = 0;
            
            // Frame style compatibility
            if (lifestyleNeeds.frameStyles.includes(product.style)) {
                score += 0.5;
            }
            
            // Feature compatibility
            const featureMatches = product.features.filter(feature => 
                lifestyleNeeds.features.some(needed => 
                    feature.toLowerCase().includes(needed.toLowerCase())
                )
            ).length;
            
            score += (featureMatches / lifestyleNeeds.features.length) * 0.5;
            
            return Math.min(score, 1.0);
        }
        
        return 0.4;
    }

    /**
     * Calculate budget compatibility score
     */
    calculateBudgetScore(product, consultationData) {
        if (!consultationData.budget) return 0.8; // High score if no budget constraint
        
        const budgetRange = this.parseBudgetRange(consultationData.budget);
        const price = product.price;
        
        if (price >= budgetRange.min && price <= budgetRange.max) {
            return 1.0; // Perfect budget match
        }
        
        if (price < budgetRange.min) {
            // Under budget - still good but might be seen as lower quality
            const underAmount = budgetRange.min - price;
            return Math.max(0.7, 1.0 - (underAmount / budgetRange.min) * 0.3);
        }
        
        if (price > budgetRange.max) {
            // Over budget - penalty based on how much over
            const overAmount = price - budgetRange.max;
            const penalty = Math.min(overAmount / budgetRange.max, 1.0);
            return Math.max(0.1, 1.0 - penalty);
        }
        
        return 0.5;
    }

    /**
     * Calculate measurement fit score
     */
    calculateMeasurementScore(product, faceAnalysis) {
        if (!faceAnalysis?.measurements) return 0.7; // Neutral score if no measurements
        
        const userMeasurements = faceAnalysis.measurements;
        const productMeasurements = product.measurements;
        
        let score = 0;
        let factors = 0;
        
        // Frame width vs face width
        if (userMeasurements.faceWidth && productMeasurements.frameWidth) {
            const ideal = userMeasurements.faceWidth * 1.05; // 5% wider than face
            const difference = Math.abs(productMeasurements.frameWidth - ideal);
            const tolerance = ideal * 0.1; // 10% tolerance
            const widthScore = Math.max(0, 1 - (difference / tolerance));
            score += widthScore;
            factors++;
        }
        
        // Bridge width vs eye distance
        if (userMeasurements.eyeDistance && productMeasurements.bridgeWidth) {
            const ideal = userMeasurements.eyeDistance * 0.3;
            const difference = Math.abs(productMeasurements.bridgeWidth - ideal);
            const tolerance = ideal * 0.2; // 20% tolerance
            const bridgeScore = Math.max(0, 1 - (difference / tolerance));
            score += bridgeScore;
            factors++;
        }
        
        return factors > 0 ? score / factors : 0.7;
    }

    /**
     * Calculate overall product confidence
     */
    calculateProductConfidence(scores, consultationData, faceAnalysis) {
        const baseConfidence = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
        
        let confidence = baseConfidence;
        
        // Boost confidence if we have face analysis
        if (faceAnalysis?.faceShape) {
            confidence += 0.1;
        }
        
        // Boost confidence if we have detailed measurements
        if (faceAnalysis?.measurements) {
            confidence += 0.05;
        }
        
        // Boost confidence if user provided detailed preferences
        if (consultationData.stylePreference && consultationData.lifestyle) {
            confidence += 0.05;
        }
        
        return Math.min(confidence, 1.0);
    }

    /**
     * Apply filters and diversity to recommendations
     */
    applyFiltersAndDiversity(scoredProducts, consultationData) {
        let filtered = scoredProducts.filter(product => 
            product.totalScore >= this.config.confidenceThreshold
        );
        
        // Apply budget hard filter if specified
        if (consultationData.budget && consultationData.strictBudget) {
            const budgetRange = this.parseBudgetRange(consultationData.budget);
            filtered = filtered.filter(product => 
                product.price >= budgetRange.min && product.price <= budgetRange.max
            );
        }
        
        // Apply category filter if specified
        if (consultationData.category) {
            filtered = filtered.filter(product => 
                product.category === consultationData.category
            );
        }
        
        // Apply diversity - ensure we have variety in styles
        const diversified = this.applyDiversity(filtered);
        
        // Limit to max recommendations
        return diversified.slice(0, this.config.maxRecommendations);
    }

    /**
     * Apply diversity to ensure variety in recommendations
     */
    applyDiversity(products) {
        const diversified = [];
        const usedStyles = new Set();
        const usedBrands = new Set();
        
        // First pass: Add highest scoring unique styles
        for (const product of products) {
            if (!usedStyles.has(product.style) || diversified.length < 3) {
                diversified.push(product);
                usedStyles.add(product.style);
                usedBrands.add(product.brand);
            }
        }
        
        // Second pass: Fill remaining slots with high-scoring products
        for (const product of products) {
            if (diversified.length >= this.config.maxRecommendations) break;
            
            if (!diversified.includes(product)) {
                diversified.push(product);
            }
        }
        
        return diversified;
    }

    /**
     * Generate detailed explanations for recommendations
     */
    generateExplanations(products, consultationData, faceAnalysis) {
        return products.map((product, index) => {
            const explanation = this.generateProductExplanation(product, consultationData, faceAnalysis);
            
            return {
                ...product,
                rank: index + 1,
                explanation: explanation,
                tags: this.generateProductTags(product, consultationData, faceAnalysis),
                pros: this.generateProductPros(product, consultationData, faceAnalysis),
                considerations: this.generateProductConsiderations(product, consultationData)
            };
        });
    }

    /**
     * Generate explanation for individual product
     */
    generateProductExplanation(product, consultationData, faceAnalysis) {
        const reasons = [];
        
        // Face shape match explanation
        if (faceAnalysis?.faceShape) {
            if (product.scores.faceShapeMatch >= 0.8) {
                reasons.push(`Perfect match for ${faceAnalysis.faceShape} face shape`);
            } else if (product.scores.faceShapeMatch >= 0.6) {
                reasons.push(`Good compatibility with ${faceAnalysis.faceShape} face shape`);
            }
        }
        
        // Style preference explanation
        if (consultationData.stylePreference && product.scores.stylePreference >= 0.7) {
            reasons.push(`Matches your ${consultationData.stylePreference} style preference`);
        }
        
        // Lifestyle explanation
        if (consultationData.lifestyle && product.scores.lifestyle >= 0.7) {
            reasons.push(`Ideal for your ${consultationData.lifestyle} lifestyle`);
        }
        
        // Budget explanation
        if (product.scores.budget >= 0.9) {
            reasons.push(`Excellent value within your budget`);
        }
        
        // Features explanation
        if (product.features.length > 0) {
            const keyFeatures = product.features.slice(0, 2).join(' and ');
            reasons.push(`Features ${keyFeatures} for enhanced comfort`);
        }
        
        // Popularity/rating explanation
        if (product.rating >= 4.5) {
            reasons.push(`Highly rated by customers (${product.rating}/5)`);
        }
        
        return reasons.length > 0 ? reasons.join('. ') + '.' : 'Recommended based on your preferences.';
    }

    /**
     * Generate product tags
     */
    generateProductTags(product, consultationData, faceAnalysis) {
        const tags = [];
        
        if (product.scores.faceShapeMatch >= 0.8) tags.push('Perfect Face Match');
        if (product.scores.stylePreference >= 0.8) tags.push('Style Match');
        if (product.scores.budget >= 0.9) tags.push('Great Value');
        if (product.rating >= 4.5) tags.push('Highly Rated');
        if (product.popularity >= 0.8) tags.push('Popular Choice');
        if (product.inStock) tags.push('In Stock');
        
        return tags;
    }

    /**
     * Generate product pros
     */
    generateProductPros(product, consultationData, faceAnalysis) {
        const pros = [];
        
        if (faceAnalysis?.faceShape && product.suitableFaceShapes.includes(faceAnalysis.faceShape)) {
            pros.push(`Specifically designed for ${faceAnalysis.faceShape} face shapes`);
        }
        
        pros.push(...product.features.map(feature => `${feature.charAt(0).toUpperCase()}${feature.slice(1)}`));
        
        if (product.rating >= 4.5) {
            pros.push(`Excellent customer reviews (${product.reviews} reviews)`);
        }
        
        return pros;
    }

    /**
     * Generate product considerations
     */
    generateProductConsiderations(product, consultationData) {
        const considerations = [];
        
        if (consultationData.budget && product.scores.budget < 0.7) {
            const budgetRange = this.parseBudgetRange(consultationData.budget);
            if (product.price > budgetRange.max) {
                const over = product.price - budgetRange.max;
                considerations.push(`$${over.toFixed(2)} over your stated budget`);
            }
        }
        
        if (product.popularity < 0.5) {
            considerations.push('Less popular choice - you might want to try in-store first');
        }
        
        if (!product.inStock) {
            considerations.push('Currently out of stock - check for availability');
        }
        
        return considerations;
    }

    /**
     * Generate insights about the recommendations
     */
    generateInsights(consultationData, faceAnalysis, recommendations) {
        const insights = [];
        
        if (faceAnalysis?.faceShape) {
            const shapeInfo = this.faceShapeAnalyzer.getFaceShapeInfo(faceAnalysis.faceShape);
            insights.push({
                type: 'face_shape',
                title: `Your ${shapeInfo.name} Face Shape`,
                description: shapeInfo.description,
                recommendations: shapeInfo.idealFrames,
                avoid: shapeInfo.framesToAvoid
            });
        }
        
        if (consultationData.stylePreference) {
            const style = this.stylePreferences[consultationData.stylePreference.toLowerCase()];
            if (style) {
                insights.push({
                    type: 'style_preference',
                    title: `${consultationData.stylePreference} Style`,
                    description: `Based on your preference for ${consultationData.stylePreference.toLowerCase()} styles`,
                    recommendations: style.frameStyles,
                    materials: style.materials,
                    colors: style.colors
                });
            }
        }
        
        // Budget insights
        if (consultationData.budget) {
            const budgetRange = this.parseBudgetRange(consultationData.budget);
            const avgPrice = recommendations.reduce((sum, rec) => sum + rec.price, 0) / recommendations.length;
            insights.push({
                type: 'budget',
                title: 'Budget Analysis',
                description: `Average recommended price: $${avgPrice.toFixed(2)}`,
                budgetRange: budgetRange,
                recommendations: recommendations.filter(rec => rec.scores.budget >= 0.8).length
            });
        }
        
        return insights;
    }

    /**
     * Generate alternative options
     */
    generateAlternatives(scoredProducts, consultationData) {
        const alternatives = {
            budgetFriendly: [],
            premium: [],
            similarStyle: []
        };
        
        if (consultationData.budget) {
            const budgetRange = this.parseBudgetRange(consultationData.budget);
            alternatives.budgetFriendly = scoredProducts
                .filter(p => p.price < budgetRange.min * 0.8)
                .slice(0, 3);
            alternatives.premium = scoredProducts
                .filter(p => p.price > budgetRange.max * 1.2)
                .slice(0, 3);
        }
        
        // Similar style alternatives
        const topRecommendation = scoredProducts[0];
        if (topRecommendation) {
            alternatives.similarStyle = scoredProducts
                .filter(p => p.style === topRecommendation.style && p.id !== topRecommendation.id)
                .slice(0, 3);
        }
        
        return alternatives;
    }

    /**
     * Calculate overall confidence in recommendations
     */
    calculateOverallConfidence(recommendations) {
        if (recommendations.length === 0) return 0;
        
        const avgConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / recommendations.length;
        return parseFloat(avgConfidence.toFixed(3));
    }

    /**
     * Parse budget string to range
     */
    parseBudgetRange(budgetString) {
        const budget = budgetString.toLowerCase();
        
        if (budget.includes('under') || budget.includes('below')) {
            const amount = parseInt(budget.match(/\d+/)[0]);
            return { min: 0, max: amount };
        } else if (budget.includes('over') || budget.includes('above')) {
            const amount = parseInt(budget.match(/\d+/)[0]);
            return { min: amount, max: 1000 };
        } else if (budget.includes('-') || budget.includes('to')) {
            const amounts = budget.match(/\d+/g);
            return { min: parseInt(amounts[0]), max: parseInt(amounts[1]) };
        } else if (budget.includes('around') || budget.includes('about')) {
            const amount = parseInt(budget.match(/\d+/)[0]);
            return { min: amount * 0.8, max: amount * 1.2 };
        }
        
        // Default ranges for common terms
        if (budget.includes('budget') || budget.includes('affordable')) {
            return { min: 50, max: 150 };
        }
        if (budget.includes('premium') || budget.includes('high-end')) {
            return { min: 200, max: 500 };
        }
        
        return { min: 0, max: 1000 }; // Default wide range
    }

    /**
     * Explain specific recommendation
     * @param {string} productId - Product ID to explain
     * @param {Object} consultationData - User consultation data
     * @param {Object} faceAnalysis - Face analysis results
     * @returns {Object} Detailed explanation
     */
    async explainRecommendation(productId, consultationData, faceAnalysis) {
        const product = this.productCatalog.find(p => p.id === productId);
        if (!product) {
            throw new Error('Product not found');
        }
        
        // Re-score the product for detailed explanation
        const scores = {
            faceShapeMatch: this.calculateFaceShapeScore(product, faceAnalysis),
            stylePreference: this.calculateStyleScore(product, consultationData),
            lifestyle: this.calculateLifestyleScore(product, consultationData),
            budget: this.calculateBudgetScore(product, consultationData),
            measurements: this.calculateMeasurementScore(product, faceAnalysis)
        };
        
        return {
            product: product,
            detailedScores: scores,
            scoringWeights: this.scoringWeights,
            explanation: this.generateDetailedExplanation(product, scores, consultationData, faceAnalysis),
            recommendations: this.generateSpecificRecommendations(product, consultationData, faceAnalysis)
        };
    }

    /**
     * Generate detailed explanation for a specific product
     */
    generateDetailedExplanation(product, scores, consultationData, faceAnalysis) {
        const explanations = [];
        
        Object.keys(scores).forEach(factor => {
            const score = scores[factor];
            const weight = this.scoringWeights[factor];
            const contribution = score * weight;
            
            let explanation = '';
            
            switch (factor) {
                case 'faceShapeMatch':
                    if (faceAnalysis?.faceShape) {
                        explanation = `Face shape compatibility (${(score * 100).toFixed(0)}%): `;
                        if (score >= 0.8) {
                            explanation += `Excellent match for ${faceAnalysis.faceShape} face shape`;
                        } else if (score >= 0.6) {
                            explanation += `Good compatibility with ${faceAnalysis.faceShape} face shape`;
                        } else {
                            explanation += `Moderate compatibility with ${faceAnalysis.faceShape} face shape`;
                        }
                    }
                    break;
                    
                case 'stylePreference':
                    explanation = `Style preference match (${(score * 100).toFixed(0)}%): `;
                    if (consultationData.stylePreference) {
                        explanation += `${score >= 0.7 ? 'Strong' : 'Moderate'} alignment with ${consultationData.stylePreference} preferences`;
                    } else {
                        explanation += 'No specific style preference provided';
                    }
                    break;
                    
                case 'lifestyle':
                    explanation = `Lifestyle compatibility (${(score * 100).toFixed(0)}%): `;
                    if (consultationData.lifestyle) {
                        explanation += `${score >= 0.7 ? 'Excellent' : 'Good'} fit for ${consultationData.lifestyle} lifestyle`;
                    } else {
                        explanation += 'No specific lifestyle information provided';
                    }
                    break;
                    
                case 'budget':
                    explanation = `Budget compatibility (${(score * 100).toFixed(0)}%): `;
                    if (consultationData.budget) {
                        const budgetRange = this.parseBudgetRange(consultationData.budget);
                        if (product.price >= budgetRange.min && product.price <= budgetRange.max) {
                            explanation += `Within your budget range`;
                        } else if (product.price > budgetRange.max) {
                            explanation += `Above your budget by $${(product.price - budgetRange.max).toFixed(2)}`;
                        } else {
                            explanation += `Below your budget range`;
                        }
                    } else {
                        explanation += 'No budget constraints specified';
                    }
                    break;
                    
                case 'measurements':
                    explanation = `Measurement fit (${(score * 100).toFixed(0)}%): `;
                    if (faceAnalysis?.measurements) {
                        explanation += `${score >= 0.7 ? 'Good' : 'Acceptable'} fit based on facial measurements`;
                    } else {
                        explanation += 'No facial measurements available';
                    }
                    break;
            }
            
            if (explanation) {
                explanations.push({
                    factor: factor,
                    score: score,
                    weight: weight,
                    contribution: contribution,
                    explanation: explanation
                });
            }
        });
        
        return explanations;
    }

    /**
     * Generate specific recommendations for improvement
     */
    generateSpecificRecommendations(product, consultationData, faceAnalysis) {
        const recommendations = [];
        
        if (faceAnalysis?.faceShape) {
            const shapeInfo = this.faceShapeAnalyzer.getFaceShapeInfo(faceAnalysis.faceShape);
            recommendations.push({
                type: 'face_shape',
                title: 'Face Shape Considerations',
                content: `For ${faceAnalysis.faceShape} faces, consider frames that ${shapeInfo.characteristics[0].toLowerCase()}`
            });
        }
        
        if (product.features.length > 0) {
            recommendations.push({
                type: 'features',
                title: 'Key Features',
                content: `This frame offers: ${product.features.join(', ')}`
            });
        }
        
        recommendations.push({
            type: 'try_on',
            title: 'Next Steps',
            content: 'Use virtual try-on to see how these frames look on you, or visit a store for professional fitting'
        });
        
        return recommendations;
    }
}