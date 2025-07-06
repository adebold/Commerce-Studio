/**
 * Shared Camera Interface Component
 * 
 * This component provides consistent camera functionality across all platforms
 * (HTML, Shopify, WooCommerce, Magento) for face analysis and AI recommendations.
 */

class CameraInterface {
    constructor(options = {}) {
        this.options = {
            width: options.width || 640,
            height: options.height || 480,
            facingMode: options.facingMode || 'user',
            enableFaceDetection: options.enableFaceDetection !== false,
            enableAnalysis: options.enableAnalysis !== false,
            onAnalysisComplete: options.onAnalysisComplete || null,
            onError: options.onError || null,
            onCameraReady: options.onCameraReady || null,
            ...options
        };
        
        this.stream = null;
        this.isActive = false;
        this.analysisInProgress = false;
        this.faceDetectionInterval = null;
    }

    /**
     * Request camera access and initialize stream
     */
    async requestCameraAccess() {
        try {
            const constraints = {
                video: {
                    width: { ideal: this.options.width },
                    height: { ideal: this.options.height },
                    facingMode: this.options.facingMode
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.isActive = true;
            
            if (this.options.onCameraReady) {
                this.options.onCameraReady(this.stream);
            }
            
            return this.stream;
        } catch (error) {
            console.error('Camera access denied:', error);
            if (this.options.onError) {
                this.options.onError(error);
            }
            throw error;
        }
    }

    /**
     * Create camera interface modal
     */
    createCameraModal(mode = 'face-analysis') {
        const modalId = 'camera-interface-modal';
        
        // Remove existing modal if any
        const existingModal = document.getElementById(modalId);
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = this.generateModalHTML(modalId, mode);
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialize modal functionality
        this.initializeModal(modalId, mode);
        
        return modalId;
    }

    /**
     * Generate modal HTML structure
     */
    generateModalHTML(modalId, mode) {
        const title = this.getModeTitle(mode);
        const instructions = this.getModeInstructions(mode);

        return `
            <div class="camera-modal-overlay" id="${modalId}">
                <div class="camera-modal">
                    <div class="camera-modal-header">
                        <h3 class="camera-modal-title">
                            <i class="camera-icon">📷</i>
                            ${title}
                        </h3>
                        <button class="camera-modal-close" onclick="this.closest('.camera-modal-overlay').remove()">
                            ✕
                        </button>
                    </div>
                    
                    <div class="camera-modal-body">
                        <div class="camera-container">
                            <video id="camera-video" autoplay muted playsinline></video>
                            <canvas id="capture-canvas" style="display: none;"></canvas>
                            
                            <!-- Face detection overlay -->
                            <div id="face-overlay" class="face-detection-overlay" style="display: none;">
                                <div class="face-detection-box"></div>
                            </div>
                        </div>
                        
                        <div class="camera-instructions">
                            <p>${instructions}</p>
                        </div>
                        
                        <div class="camera-controls">
                            <button id="capture-btn" class="camera-btn camera-btn-primary" disabled>
                                <i class="camera-icon">📸</i>
                                Capture & Analyze
                            </button>
                            <button id="retake-btn" class="camera-btn camera-btn-secondary" style="display: none;">
                                <i class="camera-icon">🔄</i>
                                Retake
                            </button>
                        </div>
                        
                        <div id="analysis-progress" class="analysis-progress" style="display: none;">
                            <div class="progress-spinner"></div>
                            <span>Analyzing your facial features...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize modal functionality
     */
    async initializeModal(modalId, mode) {
        const modal = document.getElementById(modalId);
        const video = modal.querySelector('#camera-video');
        const captureBtn = modal.querySelector('#capture-btn');
        const retakeBtn = modal.querySelector('#retake-btn');
        
        try {
            // Request camera access
            const stream = await this.requestCameraAccess();
            video.srcObject = stream;
            
            // Enable capture button when video is ready
            video.addEventListener('loadedmetadata', () => {
                captureBtn.disabled = false;
                this.startFaceDetection(modal);
            });

            // Set up event listeners
            captureBtn.addEventListener('click', () => this.captureAndAnalyze(modal, mode));
            retakeBtn.addEventListener('click', () => this.resetCapture(modal));
            
            // Clean up on modal close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cleanup();
                    modal.remove();
                }
            });

        } catch (error) {
            this.showError(modal, 'Failed to access camera: ' + error.message);
        }
    }

    /**
     * Start face detection visualization
     */
    startFaceDetection(modal) {
        if (!this.options.enableFaceDetection) return;

        const overlay = modal.querySelector('#face-overlay');
        
        // Simulate face detection by showing overlay after delay
        setTimeout(() => {
            if (overlay) {
                overlay.style.display = 'block';
            }
        }, 1000);
    }

    /**
     * Capture image and perform analysis
     */
    async captureAndAnalyze(modal, mode) {
        if (this.analysisInProgress) return;
        
        this.analysisInProgress = true;
        
        const video = modal.querySelector('#camera-video');
        const canvas = modal.querySelector('#capture-canvas');
        const captureBtn = modal.querySelector('#capture-btn');
        const progressDiv = modal.querySelector('#analysis-progress');
        
        // Show analysis progress
        captureBtn.style.display = 'none';
        progressDiv.style.display = 'block';

        try {
            // Capture frame from video
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Simulate analysis delay
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Generate analysis results
            const results = this.generateAnalysisResults(mode, imageData);
            
            // Clean up and close modal
            this.cleanup();
            modal.remove();
            
            // Call completion callback
            if (this.options.onAnalysisComplete) {
                this.options.onAnalysisComplete(results);
            }

        } catch (error) {
            this.showError(modal, 'Analysis failed: ' + error.message);
        } finally {
            this.analysisInProgress = false;
        }
    }

    /**
     * Generate analysis results based on mode
     */
    generateAnalysisResults(mode, imageData) {
        const faceShapes = ['oval', 'round', 'square', 'heart', 'diamond', 'oblong'];
        const selectedShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
        const confidence = 0.85 + Math.random() * 0.1;
        
        const baseResult = {
            mode,
            imageData,
            timestamp: Date.now(),
            faceShape: selectedShape,
            confidence: Math.round(confidence * 100) / 100,
            measurements: {
                faceWidth: 140 + Math.random() * 20,
                faceHeight: 180 + Math.random() * 20,
                jawWidth: 120 + Math.random() * 15,
                foreheadWidth: 135 + Math.random() * 15,
                pupillaryDistance: 60 + Math.random() * 8
            }
        };

        if (mode === 'face-analysis') {
            return {
                ...baseResult,
                recommendations: this.getFrameRecommendations(selectedShape)
            };
        } else if (mode === 'ai-recommendations') {
            return {
                ...baseResult,
                products: this.generatePersonalizedRecommendations(selectedShape)
            };
        }

        return baseResult;
    }

    /**
     * Get frame recommendations based on face shape
     */
    getFrameRecommendations(faceShape) {
        const recommendations = {
            oval: ['Aviator', 'Wayfarer', 'Round', 'Square'],
            round: ['Angular', 'Square', 'Rectangular', 'Cat-eye'],
            square: ['Round', 'Oval', 'Aviator', 'Curved'],
            heart: ['Bottom-heavy', 'Aviator', 'Round', 'Oval'],
            diamond: ['Oval', 'Cat-eye', 'Round', 'Rimless'],
            oblong: ['Wide', 'Oversized', 'Round', 'Square']
        };
        
        return recommendations[faceShape] || ['Classic', 'Modern', 'Trendy'];
    }

    /**
     * Generate personalized product recommendations
     */
    generatePersonalizedRecommendations(faceShape) {
        return [
            {
                id: 'rec-1',
                name: 'Classic Aviator Pro',
                brand: 'VisionCraft',
                price: 189.99,
                image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                reason: `Perfect for your ${faceShape} face shape with optimal proportions`,
                match: 94
            },
            {
                id: 'rec-2',
                name: 'Modern Rectangle Elite',
                brand: 'VisionCraft',
                price: 159.99,
                image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                reason: 'Complements your facial features beautifully',
                match: 89
            },
            {
                id: 'rec-3',
                name: 'Designer Cat-Eye Luxury',
                brand: 'VisionCraft',
                price: 229.99,
                image: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
                reason: 'Enhances your natural eye shape and style',
                match: 87
            }
        ];
    }

    /**
     * Reset capture interface
     */
    resetCapture(modal) {
        const captureBtn = modal.querySelector('#capture-btn');
        const retakeBtn = modal.querySelector('#retake-btn');
        const progressDiv = modal.querySelector('#analysis-progress');
        
        captureBtn.style.display = 'block';
        retakeBtn.style.display = 'none';
        progressDiv.style.display = 'none';
        captureBtn.disabled = false;
    }

    /**
     * Show error message
     */
    showError(modal, message) {
        const errorHTML = `
            <div class="camera-error">
                <i class="error-icon">⚠️</i>
                <p>${message}</p>
                <button onclick="this.closest('.camera-modal-overlay').remove()" class="camera-btn camera-btn-secondary">
                    Close
                </button>
            </div>
        `;
        
        modal.querySelector('.camera-modal-body').innerHTML = errorHTML;
    }

    /**
     * Get mode-specific title
     */
    getModeTitle(mode) {
        const titles = {
            'face-analysis': 'Face Shape Analysis',
            'ai-recommendations': 'AI Recommendations',
            'virtual-tryon': 'Virtual Try-On'
        };
        return titles[mode] || 'Camera Analysis';
    }

    /**
     * Get mode-specific instructions
     */
    getModeInstructions(mode) {
        const instructions = {
            'face-analysis': 'Position your face in the center of the frame for accurate face shape analysis.',
            'ai-recommendations': 'Look directly at the camera so we can analyze your features for personalized recommendations.',
            'virtual-tryon': 'Position your face in the frame to try on eyewear virtually.'
        };
        return instructions[mode] || 'Position your face in the center of the frame.';
    }

    /**
     * Clean up camera resources
     */
    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
            this.faceDetectionInterval = null;
        }
        
        this.isActive = false;
        this.analysisInProgress = false;
    }

    /**
     * Check if camera is supported
     */
    static isCameraSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    }

    /**
     * Show camera not supported message
     */
    static showNotSupportedMessage() {
        const message = `
            <div class="camera-modal-overlay">
                <div class="camera-modal">
                    <div class="camera-modal-header">
                        <h3>Camera Not Supported</h3>
                        <button onclick="this.closest('.camera-modal-overlay').remove()">✕</button>
                    </div>
                    <div class="camera-modal-body">
                        <div class="camera-error">
                            <i class="error-icon">📷</i>
                            <p>Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.</p>
                            <button onclick="this.closest('.camera-modal-overlay').remove()" class="camera-btn camera-btn-secondary">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', message);
    }
}

// CSS Styles for the camera interface
const cameraInterfaceCSS = `
<style>
.camera-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.camera-modal {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 90%;
    max-height: 90%;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.camera-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
}

.camera-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
}

.camera-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 5px;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.camera-modal-close:hover {
    background: #e9ecef;
    color: #333;
}

.camera-modal-body {
    padding: 20px;
    text-align: center;
}

.camera-container {
    position: relative;
    display: inline-block;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
}

#camera-video {
    width: 100%;
    max-width: 480px;
    height: auto;
    border-radius: 8px;
}

.face-detection-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.face-detection-box {
    border: 2px solid #28a745;
    border-radius: 50%;
    width: 200px;
    height: 200px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
}

.camera-instructions {
    margin: 15px 0;
    color: #666;
    font-size: 0.9rem;
}

.camera-controls {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 20px 0;
}

.camera-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.camera-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.camera-btn-primary {
    background: #007bff;
    color: white;
}

.camera-btn-primary:hover:not(:disabled) {
    background: #0056b3;
}

.camera-btn-secondary {
    background: #6c757d;
    color: white;
}

.camera-btn-secondary:hover {
    background: #545b62;
}

.analysis-progress {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #007bff;
    font-weight: 500;
}

.progress-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e9ecef;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.camera-error {
    text-align: center;
    padding: 40px 20px;
}

.camera-error .error-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    display: block;
}

.camera-error p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
}

.camera-icon {
    font-size: 1.1em;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .camera-modal {
        width: 95%;
        margin: 10px;
    }
    
    .camera-modal-header {
        padding: 15px;
    }
    
    .camera-modal-body {
        padding: 15px;
    }
    
    #camera-video {
        max-width: 100%;
    }
    
    .camera-controls {
        flex-direction: column;
        align-items: center;
    }
    
    .camera-btn {
        width: 100%;
        max-width: 250px;
    }
}
</style>
`;

// Add CSS to document head if not already added
if (!document.querySelector('#camera-interface-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'camera-interface-styles';
    styleElement.innerHTML = cameraInterfaceCSS;
    document.head.appendChild(styleElement);
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraInterface;
} else if (typeof window !== 'undefined') {
    window.CameraInterface = CameraInterface;
}