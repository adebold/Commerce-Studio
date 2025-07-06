// VARAi AI Search Replacement System
// This file implements AI-driven product filtering to replace traditional search

// Face shape compatibility matrix for AI filtering
const FACE_SHAPE_COMPATIBILITY = {
    'oval': {
        'aviator': 0.95,
        'wayfarer': 0.90,
        'round': 0.85,
        'square': 0.88,
        'cat-eye': 0.82,
        'rectangular': 0.87
    },
    'round': {
        'square': 0.95,
        'rectangular': 0.92,
        'cat-eye': 0.88,
        'geometric': 0.85,
        'aviator': 0.75,
        'round': 0.60
    },
    'square': {
        'round': 0.95,
        'oval': 0.90,
        'cat-eye': 0.88,
        'aviator': 0.85,
        'curved': 0.82,
        'square': 0.65
    },
    'heart': {
        'cat-eye': 0.95,
        'round': 0.90,
        'aviator': 0.88,
        'oval': 0.85,
        'bottom-heavy': 0.92,
        'rectangular': 0.70
    },
    'diamond': {
        'cat-eye': 0.95,
        'oval': 0.90,
        'round': 0.88,
        'rectangular': 0.85,
        'rimless': 0.82,
        'square': 0.75
    },
    'oblong': {
        'wide': 0.95,
        'oversized': 0.92,
        'round': 0.88,
        'square': 0.85,
        'decorative': 0.80,
        'narrow': 0.60
    }
};

// Complete product catalog for AI filtering
function getFullProductCatalog() {
    return [
        {
            id: 'vc-001',
            name: 'Classic Aviator Pro',
            brand: 'VisionCraft',
            price: 189.99,
            frameStyle: 'aviator',
            frameWidth: 'medium',
            frameHeight: 'medium',
            color: 'gold',
            image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'sunglasses'
        },
        {
            id: 'vc-002',
            name: 'Modern Rectangle Elite',
            brand: 'VisionCraft',
            price: 159.99,
            frameStyle: 'rectangular',
            frameWidth: 'medium',
            frameHeight: 'medium',
            color: 'black',
            image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'eyeglasses'
        },
        {
            id: 'vc-003',
            name: 'Designer Cat-Eye Luxury',
            brand: 'VisionCraft',
            price: 229.99,
            frameStyle: 'cat-eye',
            frameWidth: 'medium',
            frameHeight: 'medium',
            color: 'tortoise',
            image: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'sunglasses'
        },
        {
            id: 'vc-004',
            name: 'Round Vintage Collection',
            brand: 'VisionCraft',
            price: 139.99,
            frameStyle: 'round',
            frameWidth: 'medium',
            frameHeight: 'medium',
            color: 'brown',
            image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'eyeglasses'
        },
        {
            id: 'vc-005',
            name: 'Square Executive Series',
            brand: 'VisionCraft',
            price: 199.99,
            frameStyle: 'square',
            frameWidth: 'wide',
            frameHeight: 'tall',
            color: 'black',
            image: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'eyeglasses'
        },
        {
            id: 'vc-006',
            name: 'Wayfarer Classic',
            brand: 'VisionCraft',
            price: 149.99,
            frameStyle: 'wayfarer',
            frameWidth: 'medium',
            frameHeight: 'medium',
            color: 'black',
            image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'sunglasses'
        },
        {
            id: 'vc-007',
            name: 'Oversized Glamour',
            brand: 'VisionCraft',
            price: 179.99,
            frameStyle: 'oversized',
            frameWidth: 'wide',
            frameHeight: 'tall',
            color: 'brown',
            image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'sunglasses'
        },
        {
            id: 'vc-008',
            name: 'Geometric Modern',
            brand: 'VisionCraft',
            price: 169.99,
            frameStyle: 'geometric',
            frameWidth: 'medium',
            frameHeight: 'medium',
            color: 'silver',
            image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'eyeglasses'
        },
        {
            id: 'vc-009',
            name: 'Rimless Professional',
            brand: 'VisionCraft',
            price: 219.99,
            frameStyle: 'rimless',
            frameWidth: 'medium',
            frameHeight: 'medium',
            color: 'clear',
            image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'eyeglasses'
        },
        {
            id: 'vc-010',
            name: 'Sport Performance',
            brand: 'VisionCraft',
            price: 159.99,
            frameStyle: 'sport',
            frameWidth: 'wide',
            frameHeight: 'medium',
            color: 'blue',
            image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
            inStock: true,
            category: 'sunglasses'
        }
    ];
}

// AI Product Filter Class
class AIProductFilter {
    constructor(faceAnalysis, userPreferences = {}) {
        this.faceAnalysis = faceAnalysis;
        this.userPreferences = userPreferences;
        this.compatibilityMatrix = FACE_SHAPE_COMPATIBILITY;
    }

    filterProducts(allProducts) {
        return allProducts
            .filter(product => product.inStock) // Only show available products
            .map(product => this.scoreProduct(product))
            .filter(product => product.aiScore > 0.6) // Only show good matches
            .sort((a, b) => b.aiScore - a.aiScore);
    }

    scoreProduct(product) {
        const baseScore = this.getFaceShapeCompatibility(product);
        const styleScore = this.getStyleCompatibility(product);
        const preferenceScore = this.getPreferenceScore(product);
        
        const aiScore = (baseScore * 0.6) + (styleScore * 0.3) + (preferenceScore * 0.1);
        
        return {
            ...product,
            aiScore: Math.round(aiScore * 100) / 100,
            matchPercentage: Math.round(aiScore * 100),
            reasoning: this.generateReasoning(product, baseScore, styleScore)
        };
    }

    getFaceShapeCompatibility(product) {
        const faceShape = this.faceAnalysis.faceShape;
        const frameStyle = product.frameStyle || 'rectangular';
        
        return this.compatibilityMatrix[faceShape]?.[frameStyle] || 0.5;
    }

    getStyleCompatibility(product) {
        const measurements = this.faceAnalysis.measurements;
        let score = 0.8; // Base style score
        
        // Adjust based on face width
        if (measurements.faceWidth > 150 && product.frameWidth === 'wide') {
            score += 0.15;
        } else if (measurements.faceWidth < 130 && product.frameWidth === 'narrow') {
            score += 0.15;
        } else if (measurements.faceWidth >= 130 && measurements.faceWidth <= 150 && product.frameWidth === 'medium') {
            score += 0.1;
        }
        
        // Adjust based on face height
        if (measurements.faceHeight > 190 && product.frameHeight === 'tall') {
            score += 0.05;
        }
        
        return Math.min(score, 1.0);
    }

    getPreferenceScore(product) {
        let score = 0.8; // Base preference score
        
        // Apply user preferences if available
        if (this.userPreferences.preferredBrands?.includes(product.brand)) {
            score += 0.15;
        }
        
        if (this.userPreferences.priceRange) {
            const inRange = product.price >= this.userPreferences.priceRange.min && 
                           product.price <= this.userPreferences.priceRange.max;
            if (inRange) score += 0.1;
        }
        
        if (this.userPreferences.colors?.includes(product.color)) {
            score += 0.05;
        }
        
        return Math.min(score, 1.0);
    }

    generateReasoning(product, baseScore, styleScore) {
        const reasons = [];
        
        if (baseScore > 0.9) {
            reasons.push(`Perfect match for your ${this.faceAnalysis.faceShape} face shape`);
        } else if (baseScore > 0.8) {
            reasons.push(`Excellent complement to your facial features`);
        } else if (baseScore > 0.7) {
            reasons.push(`Good fit for your face shape`);
        }
        
        if (styleScore > 0.85) {
            reasons.push('Ideal proportions for your measurements');
        }
        
        if (reasons.length === 0) {
            reasons.push('Recommended based on your facial analysis');
        }
        
        return reasons.join('. ');
    }
}

// AI Product Display Manager
class AIProductDisplay {
    constructor() {
        this.currentFilter = null;
        this.currentProducts = [];
        this.isAIMode = false;
    }

    async displayAIFilteredProducts(faceAnalysis, containerId = 'product-grid') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Product container not found');
            return;
        }

        // Show loading state
        this.showLoadingState(container);
        
        // Create AI filter
        this.currentFilter = new AIProductFilter(faceAnalysis);
        
        // Get and filter products
        const allProducts = getFullProductCatalog();
        const filteredProducts = this.currentFilter.filterProducts(allProducts);
        this.currentProducts = filteredProducts;
        this.isAIMode = true;
        
        // Display filtered results
        setTimeout(() => {
            this.renderAIProductGrid(container, filteredProducts, faceAnalysis);
        }, 1500);
    }

    renderAIProductGrid(container, products, faceAnalysis) {
        const gridHTML = `
            <div class="ai-search-replacement">
                <div class="ai-results-header">
                    <div class="ai-header-content">
                        <h2>🤖 AI-Curated Just For You</h2>
                        <p class="ai-subtitle">
                            Showing ${products.length} frames perfect for your <strong>${faceAnalysis.faceShape}</strong> face shape
                            <span class="confidence-badge">${Math.round(faceAnalysis.confidence * 100)}% confidence</span>
                        </p>
                    </div>
                    <div class="ai-controls">
                        <button class="ai-refine-btn" onclick="aiProductDisplay.showRefineOptions()">
                            <i class="bi bi-sliders"></i> Refine
                        </button>
                        <button class="ai-reset-btn" onclick="aiProductDisplay.resetToTraditionalSearch()">
                            <i class="bi bi-arrow-clockwise"></i> Show All
                        </button>
                    </div>
                </div>
                
                <div class="ai-insights-panel">
                    <div class="insights-content">
                        <h4><i class="bi bi-lightbulb"></i> Why These Recommendations?</h4>
                        <ul class="insights-list">
                            ${this.generateInsights(faceAnalysis, products).map(insight => `<li>${insight}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="ai-product-grid">
                    ${products.map(product => this.createAIProductCard(product)).join('')}
                </div>
                
                ${products.length === 0 ? this.createNoResultsMessage(faceAnalysis) : ''}
            </div>
        `;
        
        container.innerHTML = gridHTML;
        this.addAIStyles();
    }

    createAIProductCard(product) {
        return `
            <div class="ai-product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image" />
                    <div class="ai-match-badge">${product.matchPercentage}% Match</div>
                    <div class="ai-frame-style">${product.frameStyle}</div>
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-brand">${product.brand}</p>
                    <div class="product-price">$${product.price}</div>
                    <div class="ai-reasoning">
                        <i class="bi bi-robot"></i>
                        ${product.reasoning}
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary add-to-cart-btn" onclick="addToCart('${product.id}')">
                            <i class="bi bi-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline-secondary try-on-btn" onclick="startVirtualTryOn('${product.id}')">
                            <i class="bi bi-camera"></i> Try On
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generateInsights(faceAnalysis, products) {
        const insights = [
            `Your ${faceAnalysis.faceShape} face shape works best with frames that balance your natural proportions`,
            `We've filtered our entire catalog to show only the ${products.length} most compatible frames`,
            `Top recommendation: ${products[0]?.name} with ${products[0]?.matchPercentage}% compatibility`
        ];
        
        if (products.length > 5) {
            insights.push(`All recommendations score above 60% compatibility for optimal fit and style`);
        }
        
        return insights;
    }

    createNoResultsMessage(faceAnalysis) {
        return `
            <div class="ai-no-results">
                <div class="no-results-content">
                    <i class="bi bi-search" style="font-size: 3rem; color: #ccc;"></i>
                    <h3>No Perfect Matches Found</h3>
                    <p>We couldn't find frames that meet our high compatibility standards for your ${faceAnalysis.faceShape} face shape.</p>
                    <button class="btn btn-primary" onclick="aiProductDisplay.resetToTraditionalSearch()">
                        Browse All Products
                    </button>
                </div>
            </div>
        `;
    }

    showLoadingState(container) {
        container.innerHTML = `
            <div class="ai-loading-state">
                <div class="loading-content">
                    <div class="ai-loading-spinner"></div>
                    <h3>🤖 AI is analyzing your features...</h3>
                    <p>Filtering thousands of frames to find your perfect matches</p>
                    <div class="loading-steps">
                        <div class="step active">Analyzing face shape</div>
                        <div class="step">Calculating compatibility</div>
                        <div class="step">Ranking recommendations</div>
                    </div>
                </div>
            </div>
        `;
        
        // Animate loading steps
        setTimeout(() => {
            const steps = container.querySelectorAll('.step');
            steps[1]?.classList.add('active');
        }, 500);
        
        setTimeout(() => {
            const steps = container.querySelectorAll('.step');
            steps[2]?.classList.add('active');
        }, 1000);
    }

    showRefineOptions() {
        // Show refinement modal
        const refineModal = `
            <div class="modal fade" id="refineModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Refine Your AI Recommendations</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="refine-options">
                                <div class="option-group">
                                    <label>Price Range</label>
                                    <div class="price-range">
                                        <input type="range" min="100" max="300" value="200" id="priceRange">
                                        <span id="priceValue">$200</span>
                                    </div>
                                </div>
                                <div class="option-group">
                                    <label>Frame Category</label>
                                    <select id="categoryFilter">
                                        <option value="">All Categories</option>
                                        <option value="eyeglasses">Eyeglasses</option>
                                        <option value="sunglasses">Sunglasses</option>
                                    </select>
                                </div>
                                <div class="option-group">
                                    <label>Color Preference</label>
                                    <div class="color-options">
                                        <label><input type="checkbox" value="black"> Black</label>
                                        <label><input type="checkbox" value="brown"> Brown</label>
                                        <label><input type="checkbox" value="gold"> Gold</label>
                                        <label><input type="checkbox" value="silver"> Silver</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="aiProductDisplay.applyRefinements()">Apply Filters</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', refineModal);
        const modal = new bootstrap.Modal(document.getElementById('refineModal'));
        modal.show();
    }

    applyRefinements() {
        // Get refinement values and re-filter products
        const priceRange = document.getElementById('priceRange').value;
        const category = document.getElementById('categoryFilter').value;
        const colors = Array.from(document.querySelectorAll('.color-options input:checked')).map(cb => cb.value);
        
        // Update user preferences
        this.currentFilter.userPreferences = {
            priceRange: { min: 100, max: parseInt(priceRange) },
            category: category,
            colors: colors
        };
        
        // Re-filter and display
        const allProducts = getFullProductCatalog();
        let filteredProducts = this.currentFilter.filterProducts(allProducts);
        
        if (category) {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }
        
        this.currentProducts = filteredProducts;
        
        const container = document.getElementById('product-grid');
        this.renderAIProductGrid(container, filteredProducts, this.currentFilter.faceAnalysis);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('refineModal'));
        modal.hide();
        document.getElementById('refineModal').remove();
    }

    resetToTraditionalSearch() {
        this.isAIMode = false;
        const container = document.getElementById('product-grid');
        
        // Show all products in traditional grid
        const allProducts = getFullProductCatalog();
        const traditionalHTML = `
            <div class="traditional-search">
                <div class="search-header">
                    <h2>All Products</h2>
                    <p>Browse our complete eyewear collection</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="bi bi-robot"></i> Return to AI Recommendations
                    </button>
                </div>
                <div class="product-grid traditional-grid">
                    ${allProducts.map(product => this.createTraditionalProductCard(product)).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = traditionalHTML;
    }

    createTraditionalProductCard(product) {
        return `
            <div class="product-card traditional-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image" />
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-brand">${product.brand}</p>
                    <div class="product-price">$${product.price}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="addToCart('${product.id}')">
                            Add to Cart
                        </button>
                        <button class="btn btn-outline-secondary" onclick="startVirtualTryOn('${product.id}')">
                            Try On
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addAIStyles() {
        if (document.getElementById('ai-search-styles')) return;
        
        const styles = `
            <style id="ai-search-styles">
            .ai-search-replacement {
                padding: 20px 0;
            }
            
            .ai-results-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                color: white;
            }
            
            .ai-header-content h2 {
                margin: 0;
                font-size: 1.8rem;
                font-weight: 700;
            }
            
            .ai-subtitle {
                margin: 5px 0 0 0;
                opacity: 0.9;
            }
            
            .confidence-badge {
                background: rgba(255, 255, 255, 0.2);
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                margin-left: 10px;
            }
            
            .ai-controls {
                display: flex;
                gap: 10px;
            }
            
            .ai-refine-btn, .ai-reset-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .ai-refine-btn:hover, .ai-reset-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            .ai-insights-panel {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                border-left: 4px solid #667eea;
            }
            
            .insights-content h4 {
                color: #667eea;
                margin-bottom: 15px;
            }
            
            .insights-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .insights-list li {
                padding: 5px 0;
                position: relative;
                padding-left: 20px;
            }
            
            .insights-list li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #28a745;
                font-weight: bold;
            }
            
            .ai-product-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 25px;
                margin-top: 20px;
            }
            
            .ai-product-card {
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s ease;
                background: white;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .ai-product-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                border-color: #667eea;
            }
            
            .product-image-container {
                position: relative;
                overflow: hidden;
            }
            
            .product-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .ai-product-card:hover .product-image {
                transform: scale(1.05);
            }
            
            .ai-match-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #28a745;
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .ai-frame-style {
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-size: 0.7rem;
                text-transform: capitalize;
            }
            
            .product-info {
                padding: 20px;
            }
            
            .product-name {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 5px;
                color: #333;
            }
            
            .product-brand {
                color: #666;
                margin-bottom: 10px;
                font-size: 0.9rem;
            }
            
            .product-price {
                font-size: 1.2rem;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 15px;
            }
            
            .ai-reasoning {
                background: #f0f4ff;
                padding: 10px;
                border-radius: 6px;
                font-size: 0.85rem;
                color: #555;
                margin-bottom: 15px;
                border-left: 3px solid #667eea;
            }
            
            .product-actions {
                display: flex;
                gap: 10px;
            }
            
            .product-actions .btn {
                flex: 1;
                padding: 10px;
                font-size: 0.9rem;
            }
            
            .ai-loading-state {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 400px;
                text-align: center;
            }
            
            .loading-content h3 {
                color: #667eea;
                margin-bottom: 10px;
            }
            
            .ai-loading-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-steps {
                margin-top: 20px;
            }
            
            .step {
                padding: 5px 10px;
                margin: 5px;
                background: #f0f0f0;
                border-radius: 15px;
                display: inline-block;
                font-size: 0.8rem;
                transition: all 0.3s ease;
            }
            
            .step.active {
                background: #667eea;
                color: white;
            }
            
            .ai-no-results {
                text-align: center;
                padding: 60px 20px;
            }
            
            .no-results-content {
                max-width: 400px;
                margin: 0 auto;
            }
            
            .traditional-search .search-header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .traditional-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
            }
            
            .traditional-card {
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                transition: transform 0.2s ease;
            }
            
            .traditional-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            @media (max-width: 768px) {
                .ai-results-header {
                    flex-direction: column;
                    text-align: center;
                    gap: 15px;
                }
                
                .ai-product-grid {
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }
                
                .product-actions {
                    flex-direction: column;
                }
            }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Global instance for easy access
const aiProductDisplay = new AIProductDisplay();

// Integration functions for existing camera system
function handleAIRecommendationsResults(results) {
    // This function is called from the camera interface
    // Display AI-filtered products based on face analysis
    aiProductDisplay.displayAIFilteredProducts(results);
}

function handleFaceAnalysisResults(results) {
    // Show face analysis results and then display filtered products
    showFaceAnalysisResults(results);
    
    // After showing analysis, automatically show filtered products
    setTimeout(() => {
        aiProductDisplay.displayAIFilteredProducts(results);
    }, 2000);
}

// Utility functions for product actions
function addToCart(productId) {
    console.log('Adding product to cart:', productId);
    // Implement cart functionality
    alert(`Product ${productId} added to cart!`);
}

function startVirtualTryOn(productId) {
    console.log('Starting virtual try-on for:', productId);
    // Implement virtual try-on functionality
    alert(`Starting virtual try-on for product ${productId}`);
}

// Make functions globally available
window.aiProductDisplay = aiProductDisplay;
window.handleAIRecommendationsResults = handleAIRecommendationsResults;
window.handleFaceAnalysisResults = handleFaceAnalysisResults;
window.addToCart = addToCart;
window.startVirtualTryOn = startVirtualTryOn;

console.log('AI Search Replacement System loaded successfully');