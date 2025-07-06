// VARAi AI Features - Face Analysis and Recommendations
// This file provides the AI functionality for the demo store

// AI Configuration
const AI_CONFIG = {
    apiEndpoint: '/api/ai',
    fallbackMode: true,
    enableLogging: true
};

// Face Analysis Service
class FaceAnalysisService {
    constructor() {
        this.isAnalyzing = false;
        this.lastAnalysis = null;
    }

    async analyzeFace(imageData = null) {
        if (this.isAnalyzing) {
            return { success: false, error: 'Analysis already in progress' };
        }

        this.isAnalyzing = true;
        
        try {
            // Simulate AI face analysis with realistic results
            await this.delay(2000); // Simulate processing time
            
            const faceShapes = ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'];
            const selectedShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
            
            const analysis = {
                faceShape: selectedShape,
                confidence: 0.85 + Math.random() * 0.1,
                features: {
                    jawline: this.getRandomFeature(['angular', 'soft', 'defined']),
                    cheekbones: this.getRandomFeature(['prominent', 'subtle', 'high']),
                    forehead: this.getRandomFeature(['wide', 'narrow', 'balanced'])
                },
                recommendations: this.getFrameRecommendations(selectedShape),
                timestamp: new Date().toISOString()
            };
            
            this.lastAnalysis = analysis;
            this.isAnalyzing = false;
            
            if (AI_CONFIG.enableLogging) {
                console.log('Face Analysis Result:', analysis);
            }
            
            return {
                success: true,
                data: analysis
            };
            
        } catch (error) {
            this.isAnalyzing = false;
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackAnalysis()
            };
        }
    }

    getRandomFeature(options) {
        return options[Math.floor(Math.random() * options.length)];
    }

    getFrameRecommendations(faceShape) {
        const recommendations = {
            oval: ['aviator', 'wayfarer', 'round', 'cat-eye'],
            round: ['rectangular', 'square', 'angular', 'geometric'],
            square: ['round', 'oval', 'aviator', 'cat-eye'],
            heart: ['aviator', 'round', 'rimless', 'bottom-heavy'],
            diamond: ['oval', 'cat-eye', 'rimless', 'round'],
            oblong: ['oversized', 'round', 'square', 'decorative']
        };
        
        return recommendations[faceShape] || ['universal', 'classic', 'modern'];
    }

    getFallbackAnalysis() {
        return {
            faceShape: 'oval',
            confidence: 0.75,
            features: {
                jawline: 'balanced',
                cheekbones: 'subtle',
                forehead: 'balanced'
            },
            recommendations: ['aviator', 'wayfarer', 'round'],
            note: 'Fallback analysis - please try again for more accurate results'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Recommendation Engine
class RecommendationEngine {
    constructor() {
        this.userPreferences = {};
        this.viewHistory = [];
        this.lastRecommendations = null;
    }

    async getPersonalizedRecommendations(userId = 'demo-user', options = {}) {
        try {
            // Simulate API call delay
            await this.delay(1500);
            
            const products = this.generateRecommendations(options);
            this.lastRecommendations = products;
            
            if (AI_CONFIG.enableLogging) {
                console.log('AI Recommendations Generated:', products);
            }
            
            return {
                success: true,
                data: {
                    recommendations: products,
                    algorithm: 'collaborative_filtering_v2',
                    confidence: 0.92,
                    personalization_score: 0.88,
                    timestamp: new Date().toISOString()
                }
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackRecommendations()
            };
        }
    }

    generateRecommendations(options = {}) {
        const frameStyles = [
            { id: 1, name: 'Classic Aviator', style: 'aviator', price: 129, rating: 4.8, match: 95 },
            { id: 2, name: 'Modern Wayfarer', style: 'wayfarer', price: 149, rating: 4.7, match: 92 },
            { id: 3, name: 'Elegant Cat-Eye', style: 'cat-eye', price: 159, rating: 4.9, match: 89 },
            { id: 4, name: 'Sophisticated Round', style: 'round', price: 139, rating: 4.6, match: 87 },
            { id: 5, name: 'Bold Square', style: 'square', price: 169, rating: 4.8, match: 85 },
            { id: 6, name: 'Trendy Oversized', style: 'oversized', price: 179, rating: 4.5, match: 83 }
        ];
        
        // Shuffle and select top recommendations
        const shuffled = frameStyles.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, options.limit || 4).map(frame => ({
            ...frame,
            aiReason: this.generateAIReason(frame),
            personalizedPrice: this.calculatePersonalizedPrice(frame.price),
            availability: 'in_stock'
        }));
    }

    generateAIReason(frame) {
        const reasons = [
            `Perfect match for your face shape with ${frame.match}% compatibility`,
            `Trending style that complements your preferences`,
            `Highly rated by customers with similar style preferences`,
            `Optimal fit based on your facial measurements`,
            `Recommended based on your browsing history`
        ];
        return reasons[Math.floor(Math.random() * reasons.length)];
    }

    calculatePersonalizedPrice(basePrice) {
        // Simulate personalized pricing (small discount)
        const discount = Math.random() * 0.1; // Up to 10% discount
        return Math.round(basePrice * (1 - discount));
    }

    getFallbackRecommendations() {
        return {
            recommendations: [
                { id: 1, name: 'Popular Choice', style: 'aviator', price: 129, rating: 4.5, match: 80 },
                { id: 2, name: 'Best Seller', style: 'wayfarer', price: 149, rating: 4.6, match: 78 }
            ],
            note: 'Showing popular items - personalized recommendations temporarily unavailable'
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize services
const faceAnalysisService = new FaceAnalysisService();
const recommendationEngine = new RecommendationEngine();

// Global functions for button clicks
async function getFaceAnalysis() {
    try {
        // Show loading state
        showAIModal('Face Analysis', 'Analyzing your facial features...', 'loading');
        
        // Perform face analysis
        const result = await faceAnalysisService.analyzeFace();
        
        if (result.success) {
            const analysis = result.data;
            const content = `
                <div class="ai-analysis-result">
                    <h5><i class="bi bi-person-check text-success me-2"></i>Analysis Complete!</h5>
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <h6>Face Shape</h6>
                            <p class="text-primary fw-bold">${analysis.faceShape.toUpperCase()}</p>
                            <small class="text-muted">Confidence: ${Math.round(analysis.confidence * 100)}%</small>
                        </div>
                        <div class="col-md-6">
                            <h6>Key Features</h6>
                            <ul class="list-unstyled">
                                <li><strong>Jawline:</strong> ${analysis.features.jawline}</li>
                                <li><strong>Cheekbones:</strong> ${analysis.features.cheekbones}</li>
                                <li><strong>Forehead:</strong> ${analysis.features.forehead}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="mt-3">
                        <h6>Recommended Frame Styles</h6>
                        <div class="d-flex flex-wrap gap-2">
                            ${analysis.recommendations.map(style => 
                                `<span class="badge bg-primary">${style}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-success" onclick="getRecommendations()">
                            <i class="bi bi-stars me-2"></i>Get Personalized Recommendations
                        </button>
                    </div>
                </div>
            `;
            showAIModal('Face Analysis Results', content, 'success');
        } else {
            showAIModal('Analysis Error', `Sorry, we couldn't analyze your face shape right now. ${result.error}`, 'error');
        }
        
    } catch (error) {
        showAIModal('Error', 'An unexpected error occurred during face analysis.', 'error');
        console.error('Face Analysis Error:', error);
    }
}

async function getRecommendations() {
    try {
        // Show loading state
        showAIModal('AI Recommendations', 'Finding your perfect frames...', 'loading');
        
        // Get personalized recommendations
        const result = await recommendationEngine.getPersonalizedRecommendations();
        
        if (result.success) {
            const recommendations = result.data.recommendations;
            const content = `
                <div class="ai-recommendations-result">
                    <h5><i class="bi bi-stars text-warning me-2"></i>Personalized Recommendations</h5>
                    <p class="text-muted">Based on AI analysis and your preferences</p>
                    <div class="row mt-3">
                        ${recommendations.map(product => `
                            <div class="col-md-6 mb-3">
                                <div class="card h-100">
                                    <div class="card-body">
                                        <h6 class="card-title">${product.name}</h6>
                                        <p class="text-muted small">${product.style} style</p>
                                        <div class="d-flex justify-content-between align-items-center">
                                            <span class="fw-bold text-primary">$${product.personalizedPrice}</span>
                                            <span class="badge bg-success">${product.match}% match</span>
                                        </div>
                                        <div class="mt-2">
                                            <small class="text-muted">${product.aiReason}</small>
                                        </div>
                                        <div class="mt-2">
                                            ${'★'.repeat(Math.floor(product.rating))} ${product.rating}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3 text-center">
                        <small class="text-muted">
                            Personalization Score: ${Math.round(result.data.personalization_score * 100)}% | 
                            Algorithm: ${result.data.algorithm}
                        </small>
                    </div>
                </div>
            `;
            showAIModal('AI Recommendations', content, 'success');
        } else {
            showAIModal('Recommendations Error', `Sorry, we couldn't generate recommendations right now. ${result.error}`, 'error');
        }
        
    } catch (error) {
        showAIModal('Error', 'An unexpected error occurred while generating recommendations.', 'error');
        console.error('Recommendations Error:', error);
    }
}

// Modal display function
function showAIModal(title, content, type = 'info') {
    // Remove existing modal if any
    const existingModal = document.getElementById('aiModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal fade" id="aiModal" tabindex="-1" aria-labelledby="aiModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="aiModalLabel">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${type === 'loading' ? `
                            <div class="text-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                                <p class="mt-3">${content}</p>
                            </div>
                        ` : content}
                    </div>
                    ${type !== 'loading' ? `
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('aiModal'));
    modal.show();
    
    // Auto-close loading modals after timeout
    if (type === 'loading') {
        setTimeout(() => {
            if (document.getElementById('aiModal')) {
                modal.hide();
            }
        }, 10000); // 10 second timeout
    }
}

// Virtual Try-On function
function startVirtualTryOn(productId) {
    try {
        // Show loading state
        showAIModal('Virtual Try-On', 'Initializing virtual try-on experience...', 'loading');
        
        setTimeout(() => {
            const content = `
                <div class="text-center">
                    <div class="mb-4">
                        <i class="bi bi-camera-video text-primary" style="font-size: 3rem;"></i>
                    </div>
                    <h5>Virtual Try-On Ready!</h5>
                    <p class="mb-4">This feature would normally activate your camera to let you try on frames virtually. In this demo, we're showing you what the experience would look like.</p>
                    
                    <div class="virtual-tryOn-demo p-4 bg-light rounded">
                        <h6><i class="bi bi-camera me-2"></i>Demo Features:</h6>
                        <ul class="list-unstyled text-start">
                            <li><i class="bi bi-check-circle text-success me-2"></i>Real-time face tracking</li>
                            <li><i class="bi bi-check-circle text-success me-2"></i>3D frame overlay</li>
                            <li><i class="bi bi-check-circle text-success me-2"></i>Multiple angle views</li>
                            <li><i class="bi bi-check-circle text-success me-2"></i>Size and fit analysis</li>
                            <li><i class="bi bi-check-circle text-success me-2"></i>Photo capture and sharing</li>
                        </ul>
                    </div>
                    
                    <div class="mt-4">
                        <button class="btn btn-primary me-2" onclick="document.getElementById('aiModal').querySelector('.btn-close').click()">
                            <i class="bi bi-camera me-1"></i>Start Camera (Demo)
                        </button>
                        <button class="btn btn-outline-secondary" onclick="document.getElementById('aiModal').querySelector('.btn-close').click()">
                            Maybe Later
                        </button>
                    </div>
                </div>
            `;
            showAIModal('Virtual Try-On', content, 'success');
        }, 1500);
        
    } catch (error) {
        showAIModal('Error', 'An unexpected error occurred while starting virtual try-on.', 'error');
        console.error('Virtual Try-On Error:', error);
    }
}

// Make functions globally available
window.getFaceAnalysis = getFaceAnalysis;
window.getRecommendations = getRecommendations;
window.startVirtualTryOn = startVirtualTryOn;
window.faceAnalysisService = faceAnalysisService;
window.recommendationEngine = recommendationEngine;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('VARAi AI Features initialized successfully');
    
    // Add AI demo buttons to the page if they don't exist
    addAIDemoButtons();
});

function addAIDemoButtons() {
    // Check if buttons already exist
    if (document.querySelector('[onclick*="getFaceAnalysis"]')) {
        return; // Buttons already exist
    }
    
    // Find a good place to add the buttons (after the hero section)
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const buttonSection = document.createElement('div');
        buttonSection.className = 'container my-5';
        buttonSection.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-8 text-center">
                    <h3 class="mb-4">Try Our AI-Powered Features</h3>
                    <div class="d-flex flex-wrap justify-content-center gap-3">
                        <button class="btn btn-primary btn-lg demo-button" onclick="getFaceAnalysis()">
                            <i class="bi bi-person-check me-2"></i>Get Face Shape Analysis
                        </button>
                        <button class="btn btn-success btn-lg demo-button" onclick="getRecommendations()">
                            <i class="bi bi-stars me-2"></i>Get AI Recommendations
                        </button>
                    </div>
                    <p class="text-muted mt-3">Experience our advanced AI technology for personalized eyewear selection</p>
                </div>
            </div>
        `;
        
        heroSection.insertAdjacentElement('afterend', buttonSection);
    }
}

console.log('VARAi AI Features script loaded');