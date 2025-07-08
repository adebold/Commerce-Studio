import { ApiClient } from './api-client';
import { FaceShape } from './types';

interface TryOnOptions {
    container: HTMLElement;
    productId: number;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    onCapture?: (imageData: string) => void;
    onFaceShapeDetected?: (faceShape: FaceShape) => void;
    detectFaceShape?: boolean;
    enableMeasurements?: boolean;
}

interface CameraSettings {
    mode: 'front' | 'rear';
    quality: 'low' | 'medium' | 'high';
    autoCapture: boolean;
    captureDelay: number;
    detectFaceShape: boolean;
    enableMeasurements: boolean;
}

export class VirtualTryOn {
    private apiClient: ApiClient;
    private container: HTMLElement | null = null;
    private video: HTMLVideoElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private stream: MediaStream | null = null;
    private model: any = null; // Three.js model
    private productId: number = 0;
    private faceShape: FaceShape | null = null;
    private measurements: Record<string, number> = {};
    private settings: CameraSettings = {
        mode: 'front',
        quality: 'medium',
        autoCapture: true,
        captureDelay: 3,
        detectFaceShape: true,
        enableMeasurements: true
    };
    private onFaceShapeDetected?: (faceShape: FaceShape) => void;

    constructor(apiClient: ApiClient) {
        this.apiClient = apiClient;
    }

    /**
     * Initialize virtual try-on
     */
    async initialize(options: TryOnOptions): Promise<void> {
        try {
            this.container = options.container;
            this.productId = options.productId;
            this.onFaceShapeDetected = options.onFaceShapeDetected;
            
            if (options.detectFaceShape !== undefined) {
                this.settings.detectFaceShape = options.detectFaceShape;
            }
            
            if (options.enableMeasurements !== undefined) {
                this.settings.enableMeasurements = options.enableMeasurements;
            }
            
            await this.setupContainer();
            await this.loadModel(options.productId);
            await this.initializeCamera();
            await this.setupScene();
            this.startTracking();

            if (options.onSuccess) {
                options.onSuccess();
            }
        } catch (error) {
            if (options.onError) {
                options.onError(error as Error);
            } else {
                console.error('Failed to initialize virtual try-on:', error);
            }
        }
    }

    /**
     * Setup container
     */
    private async setupContainer(): Promise<void> {
        if (!this.container) {
            throw new Error('Container element is required');
        }

        // Create video element
        this.video = document.createElement('video');
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.container.appendChild(this.video);

        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.style.display = 'none';
        this.container.appendChild(this.canvas);

        // Add controls
        const controls = document.createElement('div');
        controls.className = 'varai-try-on-controls';
        
        let controlsHTML = `
            <button class="varai-try-on-capture">Take Photo</button>
            <button class="varai-try-on-switch">Switch Camera</button>
        `;
        
        if (this.settings.detectFaceShape) {
            controlsHTML += `<button class="varai-detect-face-shape">Detect Face Shape</button>`;
        }
        
        if (this.settings.enableMeasurements) {
            controlsHTML += `<button class="varai-save-measurements">Save Measurements</button>`;
        }
        
        controls.innerHTML = controlsHTML;
        this.container.appendChild(controls);

        // Add event listeners
        controls.querySelector('.varai-try-on-capture')?.addEventListener('click', () => this.capture());
        controls.querySelector('.varai-try-on-switch')?.addEventListener('click', () => this.switchCamera());
        
        if (this.settings.detectFaceShape) {
            controls.querySelector('.varai-detect-face-shape')?.addEventListener('click', () => this.detectFaceShape());
        }
        
        if (this.settings.enableMeasurements) {
            controls.querySelector('.varai-save-measurements')?.addEventListener('click', () => this.saveMeasurements());
        }
        
        // Add face shape display if enabled
        if (this.settings.detectFaceShape) {
            const faceShapeDisplay = document.createElement('div');
            faceShapeDisplay.className = 'varai-face-shape-display';
            faceShapeDisplay.innerHTML = `
                <div class="varai-face-shape-label">Face Shape: <span class="varai-face-shape-value">Not detected</span></div>
                <div class="varai-face-shape-compatibility"></div>
            `;
            this.container.appendChild(faceShapeDisplay);
        }
    }

    /**
     * Load 3D model
     */
    private async loadModel(productId: number): Promise<void> {
        try {
            const modelData = await this.apiClient.getVirtualTryOnModel(productId);
            // Initialize Three.js and load model
            // This is a placeholder - actual implementation would use Three.js
            this.model = modelData;
        } catch (error) {
            throw new Error('Failed to load 3D model');
        }
    }

    /**
     * Initialize camera
     */
    private async initializeCamera(): Promise<void> {
        try {
            const constraints = {
                video: {
                    facingMode: this.settings.mode === 'front' ? 'user' : 'environment',
                    width: { ideal: this.getQualityDimensions().width },
                    height: { ideal: this.getQualityDimensions().height }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (this.video) {
                this.video.srcObject = this.stream;
            }
        } catch (error) {
            throw new Error('Failed to initialize camera');
        }
    }

    /**
     * Setup Three.js scene
     */
    private async setupScene(): Promise<void> {
        // Initialize Three.js scene, camera, renderer
        // This is a placeholder - actual implementation would use Three.js
        console.log('Setting up Three.js scene');
    }

    /**
     * Start face tracking
     */
    private startTracking(): void {
        // Initialize face tracking
        // This is a placeholder - actual implementation would use face-api.js or similar
        console.log('Starting face tracking');

        if (this.settings.autoCapture) {
            this.startAutoCapture();
        }
        
        // Auto-detect face shape if enabled
        if (this.settings.detectFaceShape && this.settings.autoCapture) {
            setTimeout(() => {
                if (this.isTracking()) {
                    this.detectFaceShape();
                }
            }, (this.settings.captureDelay + 1) * 1000);
        }
    }

    /**
     * Start auto capture
     */
    private startAutoCapture(): void {
        setTimeout(() => {
            if (this.isTracking()) {
                this.capture();
            }
        }, this.settings.captureDelay * 1000);
    }

    /**
     * Capture photo
     */
    private capture(): string {
        if (!this.video || !this.canvas) {
            throw new Error('Video or canvas not initialized');
        }

        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get canvas context');
        }

        // Set canvas dimensions to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(this.video, 0, 0);

        // Get image data
        const imageData = this.canvas.toDataURL('image/jpeg');

        // Emit capture event
        const event = new CustomEvent('varai-capture', {
            detail: { imageData }
        });
        this.container?.dispatchEvent(event);

        return imageData;
    }

    /**
     * Detect face shape
     */
    private async detectFaceShape(): Promise<void> {
        try {
            const imageData = this.capture();
            this.faceShape = await this.apiClient.detectFaceShape(imageData);
            
            // Update UI
            if (this.container && this.faceShape) {
                const faceShapeValue = this.container.querySelector('.varai-face-shape-value');
                if (faceShapeValue) {
                    faceShapeValue.textContent = this.faceShape;
                }
                
                // Check product compatibility with detected face shape
                const product = await this.apiClient.getProduct(this.productId);
                const compatibleShapes = product.customFields.varai_face_shape_compatibility?.split(',') || [];
                
                const compatibilityElement = this.container.querySelector('.varai-face-shape-compatibility');
                if (compatibilityElement) {
                    if (compatibleShapes.includes(this.faceShape)) {
                        compatibilityElement.innerHTML = `<div class="varai-compatible">✓ This frame is compatible with your face shape</div>`;
                    } else if (compatibleShapes.length > 0) {
                        compatibilityElement.innerHTML = `<div class="varai-not-compatible">✗ This frame may not be ideal for your face shape</div>`;
                    }
                }
            }
            
            // Track event
            this.apiClient.trackEvent({
                event_type: 'face_shape_detected',
                product_id: this.productId,
                face_shape: this.faceShape
            });
            
            // Call callback if provided
            if (this.onFaceShapeDetected) {
                this.onFaceShapeDetected(this.faceShape);
            }
        } catch (error) {
            console.error('Failed to detect face shape:', error);
        }
    }

    /**
     * Calculate and save facial measurements
     */
    private async saveMeasurements(): Promise<void> {
        try {
            // This would use face landmarks to calculate measurements
            // For now, we'll use placeholder values
            this.measurements = {
                face_width: 140,
                face_height: 200,
                temple_to_temple: 145,
                pupillary_distance: 62,
                bridge_width: 20
            };
            
            // Show measurements in UI
            if (this.container) {
                let measurementsDisplay = this.container.querySelector('.varai-measurements-display');
                
                if (!measurementsDisplay) {
                    measurementsDisplay = document.createElement('div');
                    measurementsDisplay.className = 'varai-measurements-display';
                    this.container.appendChild(measurementsDisplay);
                }
                
                measurementsDisplay.innerHTML = `
                    <h4>Your Measurements</h4>
                    <ul>
                        <li>Face Width: ${this.measurements.face_width}mm</li>
                        <li>Face Height: ${this.measurements.face_height}mm</li>
                        <li>Temple to Temple: ${this.measurements.temple_to_temple}mm</li>
                        <li>Pupillary Distance: ${this.measurements.pupillary_distance}mm</li>
                        <li>Bridge Width: ${this.measurements.bridge_width}mm</li>
                    </ul>
                    <div class="varai-measurements-saved">Measurements saved!</div>
                `;
            }
            
            // In a real implementation, we would save these to the customer's profile
            // For now, we'll just log them
            console.log('Measurements saved:', this.measurements);
        } catch (error) {
            console.error('Failed to save measurements:', error);
        }
    }

    /**
     * Switch camera
     */
    private async switchCamera(): Promise<void> {
        this.settings.mode = this.settings.mode === 'front' ? 'rear' : 'front';
        
        // Stop current stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        // Reinitialize camera
        await this.initializeCamera();
    }

    /**
     * Check if tracking is active
     */
    private isTracking(): boolean {
        // This is a placeholder - actual implementation would check face tracking status
        return true;
    }

    /**
     * Get quality dimensions
     */
    private getQualityDimensions(): { width: number; height: number } {
        switch (this.settings.quality) {
            case 'low':
                return { width: 640, height: 480 };
            case 'high':
                return { width: 1920, height: 1080 };
            default: // medium
                return { width: 1280, height: 720 };
        }
    }

    /**
     * Update settings
     */
    updateSettings(settings: Partial<CameraSettings>): void {
        this.settings = { ...this.settings, ...settings };
    }

    /**
     * Get detected face shape
     */
    getFaceShape(): FaceShape | null {
        return this.faceShape;
    }

    /**
     * Get measurements
     */
    getMeasurements(): Record<string, number> {
        return this.measurements;
    }

    /**
     * Cleanup
     */
    cleanup(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        if (this.video) {
            this.video.srcObject = null;
        }

        if (this.container) {
            this.container.innerHTML = '';
        }

        this.video = null;
        this.canvas = null;
        this.stream = null;
        this.model = null;
        this.faceShape = null;
        this.measurements = {};
    }
}
