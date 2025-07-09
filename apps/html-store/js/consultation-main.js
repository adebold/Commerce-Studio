/**
 * Main Consultation Interface Integration
 * Simple integration of enhanced consultation features
 */

class ConsultationMain {
    constructor() {
        this.sessionId = `session_${Date.now()}`;
        this.apiBaseUrl = '';
        this.components = {};
        
        this.init();
    }

    async init() {
        try {
            // Import components dynamically
            const { default: FaceShapeAnalyzer } = await import('./components/face-shape-analyzer.js');
            const { default: EnhancedRecommendations } = await import('./components/enhanced-recommendations.js');
            
            // Initialize components
            this.components.faceAnalyzer = new FaceShapeAnalyzer({
                apiBaseUrl: this.apiBaseUrl,
                onComplete: (analysis) => this.handleFaceAnalysis(analysis),
                onError: (error) => this.showError(error)
            });
            
            this.components.recommendations = new EnhancedRecommendations({
                apiBaseUrl: this.apiBaseUrl,
                onFrameSelect: (frameId) => this.handleFrameSelection(frameId),
                onError: (error) => this.showError(error)
            });
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Enhanced Consultation System initialized');
            
        } catch (error) {
            console.error('Failed to initialize consultation system:', error);
        }
    }

    setupEventListeners() {
        // Face analysis completion
        document.addEventListener('faceAnalysisComplete', (e) => {
            const analysis = e.detail.analysis;
            
            // Generate enhanced recommendations
            this.components.recommendations.generateEnhancedRecommendations(
                { sessionId: this.sessionId },
                analysis,
                this.sessionId
            );
        });
        
        // Add consultation triggers to existing interface
        this.addConsultationTriggers();
    }

    addConsultationTriggers() {
        // Add face analysis button to existing interface
        const triggerHtml = `
            <div class="consultation-triggers">
                <button id="start-face-analysis" class="btn btn-primary">
                    <i class="bi bi-person-check"></i> Analyze Face Shape
                </button>
                <button id="get-recommendations" class="btn btn-outline-primary">
                    <i class="bi bi-stars"></i> Get Recommendations
                </button>
            </div>
        `;
        
        // Find a suitable place to add triggers (product page, main content, etc.)
        const targetElement = document.querySelector('.product-info, .main-content, body');
        if (targetElement) {
            targetElement.insertAdjacentHTML('beforeend', triggerHtml);
            
            // Add event listeners
            document.getElementById('start-face-analysis')?.addEventListener('click', () => {
                this.startFaceAnalysis();
            });
            
            document.getElementById('get-recommendations')?.addEventListener('click', () => {
                this.getBasicRecommendations();
            });
        }
    }

    startFaceAnalysis() {
        this.components.faceAnalyzer.showFaceAnalysisInterface(this.sessionId);
    }

    getBasicRecommendations() {
        // Get recommendations without face analysis
        this.components.recommendations.generateEnhancedRecommendations(
            { 
                sessionId: this.sessionId,
                stylePreference: 'modern',
                lifestyle: 'professional',
                budget: '$100-200'
            },
            null,
            this.sessionId
        );
    }

    handleFaceAnalysis(analysis) {
        console.log('Face analysis completed:', analysis);
        this.showSuccess(`Face shape detected: ${analysis.faceShape} (${(analysis.confidence * 100).toFixed(0)}% confidence)`);
    }

    handleFrameSelection(frameId) {
        console.log('Frame selected:', frameId);
        this.showSuccess(`Frame ${frameId} added to your selection!`);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('consultation-notification-styles')) {
            const styles = `
                <style id="consultation-notification-styles">
                    .notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 10000;
                        max-width: 400px;
                        border-radius: 8px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                        animation: slideIn 0.3s ease-out;
                    }
                    .notification-success {
                        background: #d4edda;
                        border: 1px solid #c3e6cb;
                        color: #155724;
                    }
                    .notification-error {
                        background: #f8d7da;
                        border: 1px solid #f5c6cb;
                        color: #721c24;
                    }
                    .notification-info {
                        background: #d1ecf1;
                        border: 1px solid #bee5eb;
                        color: #0c5460;
                    }
                    .notification-content {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 12px 15px;
                    }
                    .notification-close {
                        background: none;
                        border: none;
                        cursor: pointer;
                        padding: 5px;
                        margin-left: auto;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    .consultation-triggers {
                        margin: 20px 0;
                        display: flex;
                        gap: 10px;
                        flex-wrap: wrap;
                    }
                    .btn {
                        padding: 10px 15px;
                        border-radius: 6px;
                        border: 1px solid;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        text-decoration: none;
                        font-size: 0.9rem;
                        transition: all 0.2s ease;
                    }
                    .btn-primary {
                        background: #007bff;
                        color: white;
                        border-color: #007bff;
                    }
                    .btn-primary:hover {
                        background: #0056b3;
                        border-color: #0056b3;
                    }
                    .btn-outline-primary {
                        background: transparent;
                        color: #007bff;
                        border-color: #007bff;
                    }
                    .btn-outline-primary:hover {
                        background: #007bff;
                        color: white;
                    }
                </style>
            `;
            document.head.insertAdjacentHTML('beforeend', styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ConsultationMain());
} else {
    new ConsultationMain();
}

// Export for manual initialization
window.ConsultationMain = ConsultationMain;