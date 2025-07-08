const EventEmitter = require('events');
const PositioningGuidanceTracker = require('../core/positioning-guidance-tracker');
const OptimalFrameCapture = require('../core/optimal-frame-capture');

/**
 * @class AvatarGuidedFaceAnalysis
 * @extends EventEmitter
 * @description Orchestrates the face analysis process with real-time avatar guidance.
 */
class AvatarGuidedFaceAnalysis extends EventEmitter {
  /**
   * @param {object} options - Configuration options.
   * @param {HTMLVideoElement} options.videoElement - The video element for analysis.
   * @param {FaceAnalysisService} options.faceAnalysisService - Service for performing face analysis.
   * @param {AvatarManager} options.avatarManager - The avatar manager to provide feedback.
   */
  constructor({ videoElement, faceAnalysisService, avatarManager }) {
    super();

    if (!videoElement || !faceAnalysisService || !avatarManager) {
      throw new Error('videoElement, faceAnalysisService, and avatarManager are required.');
    }

    this.videoElement = videoElement;
    this.faceAnalysisService = faceAnalysisService;
    this.avatarManager = avatarManager;

    this.positioningTracker = new PositioningGuidanceTracker();
    this.frameCapture = new OptimalFrameCapture({
      videoElement: this.videoElement,
      positioningTracker: this.positioningTracker,
    });

    this.state = 'idle'; // idle, guiding, analyzing, complete
    this.bindEvents();
  }

  /**
   * Binds event listeners to the tracker and capture modules.
   * @private
   */
  bindEvents() {
    this.positioningTracker.on('guidance-message', (message) => {
      this.avatarManager.speak(message);
      this.emit('guidance-update', message);
    });

    this.positioningTracker.on('error', (error) => {
      console.error('Positioning tracker error:', error);
      this.avatarManager.speak("I'm having trouble seeing you clearly. Please check your camera.");
      this.emit('error', error);
      this.stop();
    });

    this.frameCapture.on('frame-captured', async ({ blob }) => {
      this.state = 'analyzing';
      this.emit('state-change', this.state);
      this.avatarManager.speak("Got it! Analyzing your features now. This will just take a moment.");
      try {
        const analysisResult = await this.faceAnalysisService.analyzeFrame(blob);
        this.state = 'complete';
        this.emit('state-change', this.state);
        this.emit('analysis-complete', analysisResult);
      } catch (error) {
        console.error('Face analysis failed:', error);
        this.avatarManager.speak("I'm sorry, there was an error during the analysis. Let's try again.");
        this.emit('error', new Error('Face analysis failed.'));
        this.startGuidance(); // Restart guidance
      }
    });

    this.frameCapture.on('error', (error) => {
        console.error('Frame capture error:', error);
        this.avatarManager.speak("I couldn't get a clear picture. Let's try that again.");
        this.emit('error', error);
        this.startGuidance();
    });
  }

  /**
   * Starts the avatar-guided face analysis process.
   */
  start() {
    if (this.state !== 'idle') {
      console.log(`Analysis process already started. Current state: ${this.state}`);
      return;
    }
    this.avatarManager.speak("Hi there! I'm going to help you with your face analysis. Please look at the camera.");
    this.startGuidance();
  }

  /**
   * Starts the guidance and capture process.
   * @private
   */
  startGuidance() {
    this.state = 'guiding';
    this.emit('state-change', this.state);
    this.positioningTracker.start(this.videoElement, this.faceAnalysisService.getDetector());
    this.frameCapture.start();
  }

  /**
   * Stops the entire analysis process.
   */
  stop() {
    this.positioningTracker.stop();
    this.frameCapture.stop();
    this.state = 'idle';
    this.emit('state-change', this.state);
    console.log('Avatar-guided face analysis stopped.');
  }

  /**
   * Unbinds all event listeners to clean up the instance.
   */
  destroy() {
    this.stop();
    this.positioningTracker.removeAllListeners();
    this.frameCapture.removeAllListeners();
    console.log('AvatarGuidedFaceAnalysis instance destroyed.');
  }
}

module.exports = AvatarGuidedFaceAnalysis;