/**
 * Enhanced Consultation Integration
 * Adds face shape analysis and enhanced recommendations to existing store
 */

// Add enhanced consultation features to the store
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Loading Enhanced Consultation Features...');
    
    // Add consultation controls to the page
    addConsultationControls();
    
    // Initialize enhanced features
    initializeEnhancedConsultation();
});

function addConsultationControls() {
    const controlsHTML = `
        <div id="enhanced-consultation-panel" class="consultation-panel">
            <h6><i class="bi bi-robot"></i> AI Eyewear Consultant</h6>
            <p class="text-muted">Get personalized recommendations based on your face shape</p>
            
            <div class="consultation-actions">
                <button id="start-face-analysis" class="consultation-btn primary">
                    <i class="bi bi-camera-video"></i>
                    Analyze Face Shape
                </button>
                
                <button id="get-enhanced-recommendations" class="consultation-btn secondary">
                    <i class="bi bi-stars"></i>
                    Get Smart Recommendations
                </button>
                
                <button id="view-consultation-guide" class="consultation-btn outline">
                    <i class="bi bi-info-circle"></i>
                    Face Shape Guide
                </button>
            </div>
            
            <div id="consultation-results" class="consultation-results" style="display: none;">
                <!-- Results will be populated here -->
            </div>
        </div>
    `;
    
    // Find a good place to add the controls
    const targetContainer = document.querySelector('.product-details, .main-content, .container');
    if (targetContainer) {
        targetContainer.insertAdjacentHTML('afterbegin', controlsHTML);
        addConsultationStyles();
    }
}

function addConsultationStyles() {
    const styles = `
        <style id="enhanced-consultation-styles">
            .consultation-panel {
                background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                border: 1px solid #dee2e6;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .consultation-panel h6 {
                margin: 0 0 8px 0;
                color: #2c5aa0;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
            }
            
            .consultation-panel .text-muted {
                margin: 0 0 15px 0;
                font-size: 0.9rem;
            }
            
            .consultation-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 20px;
            }
            
            .consultation-btn {
                padding: 10px 16px;
                border-radius: 8px;
                border: 1px solid;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 500;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s ease;
                text-decoration: none;
                background: white;
            }
            
            .consultation-btn.primary {
                background: linear-gradient(135deg, #2c5aa0, #1e3f73);
                color: white;
                border-color: #2c5aa0;
            }
            
            .consultation-btn.primary:hover {
                background: linear-gradient(135deg, #1e3f73, #152a52);
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(44, 90, 160, 0.3);
            }
            
            .consultation-btn.secondary {
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                border-color: #28a745;
            }
            
            .consultation-btn.secondary:hover {
                background: linear-gradient(135deg, #20c997, #17a2b8);
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            }
            
            .consultation-btn.outline {
                background: transparent;
                color: #6c757d;
                border-color: #6c757d;
            }
            
            .consultation-btn.outline:hover {
                background: #6c757d;
                color: white;
            }
            
            .consultation-results {
                margin-top: 20px;
                padding: 15px;
                background: white;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .face-shape-result {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 15px;
            }
            
            .face-shape-icon {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #2c5aa0, #1e3f73);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            
            .face-shape-details h6 {
                margin: 0 0 5px 0;
                color: #2c5aa0;
            }
            
            .confidence-score {
                color: #28a745;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .recommended-frames {
                margin-top: 15px;
            }
            
            .frame-recommendations {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
            
            .frame-rec-item {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 6px;
                padding: 10px;
                text-align: center;
                transition: all 0.2s ease;
            }
            
            .frame-rec-item:hover {
                border-color: #2c5aa0;
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 12px 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10000;
                max-width: 350px;
                animation: slideInRight 0.3s ease-out;
            }
            
            .notification.success {
                border-left: 4px solid #28a745;
                background: #d4edda;
            }
            
            .notification.error {
                border-left: 4px solid #dc3545;
                background: #f8d7da;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

async function initializeEnhancedConsultation() {
    // Setup event listeners for consultation actions
    document.getElementById('start-face-analysis')?.addEventListener('click', startFaceAnalysis);
    document.getElementById('get-enhanced-recommendations')?.addEventListener('click', getEnhancedRecommendations);
    document.getElementById('view-consultation-guide')?.addEventListener('click', showFaceShapeGuide);
}

async function startFaceAnalysis() {
    try {
        showNotification('Starting face shape analysis...', 'info');
        
        // Import and use the face shape analyzer
        const { default: FaceShapeAnalyzer } = await import('./components/face-shape-analyzer.js');
        
        const analyzer = new FaceShapeAnalyzer({
            onComplete: (analysis) => displayFaceAnalysisResults(analysis),
            onError: (error) => showNotification(error, 'error')
        });
        
        analyzer.showFaceAnalysisInterface();
        
    } catch (error) {
        console.error('Face analysis error:', error);
        showNotification('Failed to start face analysis. Please try again.', 'error');
    }
}

async function getEnhancedRecommendations() {
    try {
        showNotification('Generating enhanced recommendations...', 'info');
        
        // Import and use the enhanced recommendations
        const { default: EnhancedRecommendations } = await import('./components/enhanced-recommendations.js');
        
        const recommendations = new EnhancedRecommendations({
            onFrameSelect: (frameId) => showNotification(`Frame ${frameId} selected!`, 'success'),
            onError: (error) => showNotification(error, 'error')
        });
        
        // Generate recommendations with sample data
        await recommendations.generateEnhancedRecommendations(
            {
                stylePreference: 'modern',
                lifestyle: 'professional',
                budget: '$100-200'
            },
            null // No face analysis for basic recommendations
        );
        
    } catch (error) {
        console.error('Recommendations error:', error);
        showNotification('Failed to generate recommendations. Please try again.', 'error');
    }
}

function showFaceShapeGuide() {
    const guideHTML = `
        <div class="face-shape-guide">
            <h6>Face Shape Guide</h6>
            <div class="face-shapes-grid">
                <div class="face-shape-item">
                    <div class="shape-icon">⭕</div>
                    <strong>Oval</strong>
                    <p>Balanced proportions, gentle curves</p>
                    <small>Best: Rectangular, Square frames</small>
                </div>
                <div class="face-shape-item">
                    <div class="shape-icon">🔴</div>
                    <strong>Round</strong>
                    <p>Soft curves, equal width and length</p>
                    <small>Best: Angular, Square frames</small>
                </div>
                <div class="face-shape-item">
                    <div class="shape-icon">⬜</div>
                    <strong>Square</strong>
                    <p>Strong jawline, defined features</p>
                    <small>Best: Round, Oval frames</small>
                </div>
                <div class="face-shape-item">
                    <div class="shape-icon">💝</div>
                    <strong>Heart</strong>
                    <p>Wide forehead, narrow chin</p>
                    <small>Best: Cat-eye, Round frames</small>
                </div>
                <div class="face-shape-item">
                    <div class="shape-icon">💎</div>
                    <strong>Diamond</strong>
                    <p>Wide cheekbones, narrow forehead</p>
                    <small>Best: Cat-eye, Oval frames</small>
                </div>
                <div class="face-shape-item">
                    <div class="shape-icon">📱</div>
                    <strong>Oblong</strong>
                    <p>Long face, balanced width</p>
                    <small>Best: Oversized, Wide frames</small>
                </div>
            </div>
        </div>
    `;
    
    const resultsDiv = document.getElementById('consultation-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = guideHTML;
        resultsDiv.style.display = 'block';
        
        // Add grid styles
        if (!document.getElementById('face-shape-guide-styles')) {
            const styles = `
                <style id="face-shape-guide-styles">
                    .face-shapes-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 15px;
                        margin-top: 15px;
                    }
                    .face-shape-item {
                        text-align: center;
                        padding: 15px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border: 1px solid #e9ecef;
                    }
                    .shape-icon {
                        font-size: 2rem;
                        margin-bottom: 8px;
                    }
                    .face-shape-item strong {
                        display: block;
                        color: #2c5aa0;
                        margin-bottom: 5px;
                    }
                    .face-shape-item p {
                        font-size: 0.85rem;
                        color: #6c757d;
                        margin: 5px 0;
                    }
                    .face-shape-item small {
                        color: #28a745;
                        font-weight: 500;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
}

function displayFaceAnalysisResults(analysis) {
    const resultsHTML = `
        <div class="face-analysis-results">
            <div class="face-shape-result">
                <div class="face-shape-icon">
                    <i class="bi bi-person-badge"></i>
                </div>
                <div class="face-shape-details">
                    <h6>Your Face Shape: ${analysis.faceShape.toUpperCase()}</h6>
                    <div class="confidence-score">${(analysis.confidence * 100).toFixed(0)}% Confidence</div>
                </div>
            </div>
            
            <div class="recommended-frames">
                <strong>Recommended Frame Styles:</strong>
                <div class="frame-recommendations">
                    ${analysis.recommendations.idealFrameStyles.map(style => `
                        <div class="frame-rec-item">
                            <strong>${style.charAt(0).toUpperCase() + style.slice(1)}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    const resultsDiv = document.getElementById('consultation-results');
    if (resultsDiv) {
        resultsDiv.innerHTML = resultsHTML;
        resultsDiv.style.display = 'block';
    }
    
    showNotification(`Face shape detected: ${analysis.faceShape}`, 'success');
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; cursor: pointer; margin-left: auto;">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

console.log('✅ Enhanced Consultation Integration loaded');