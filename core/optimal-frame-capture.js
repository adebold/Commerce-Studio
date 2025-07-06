import { EventEmitter } from 'events';

/**
 * @class OptimalFrameCapture
 * @extends EventEmitter
 * @description Captures the optimal video frame when face positioning is ideal.
 */
class OptimalFrameCapture extends EventEmitter {
  /**
   * @param {object} options - Configuration options.
   * @param {HTMLVideoElement} options.videoElement - The video element to capture from.
   * @param {PositioningGuidanceTracker} options.positioningTracker - The tracker instance to monitor for optimal positioning.
   */
  constructor({ videoElement, positioningTracker }) {
    super();

    if (!videoElement || !positioningTracker) {
      throw new Error('videoElement and positioningTracker are required options.');
    }

    this.videoElement = videoElement;
    this.positioningTracker = positioningTracker;
    this.isListening = false;

    this.handleOptimalPosition = this.handleOptimalPosition.bind(this);
  }

  /**
   * Starts listening for the optimal position to capture a frame.
   */
  start() {
    if (this.isListening) {
      console.log('Optimal frame capture is already listening.');
      return;
    }
    this.positioningTracker.on('optimal-position-achieved', this.handleOptimalPosition);
    this.isListening = true;
    console.log('Started listening for optimal frame capture.');
    this.emit('started');
  }

  /**
   * Stops listening for the optimal position.
   */
  stop() {
    if (!this.isListening) {
      return;
    }
    this.positioningTracker.removeListener('optimal-position-achieved', this.handleOptimalPosition);
    this.isListening = false;
    console.log('Stopped listening for optimal frame capture.');
    this.emit('stopped');
  }

  /**
   * Handles the 'optimal-position-achieved' event from the tracker.
   * @private
   */
  handleOptimalPosition() {
    console.log('Optimal position achieved. Capturing frame...');
    this.captureFrame();
  }

  /**
   * Captures a frame from the video element, converts it to a Blob, and emits it.
   */
  captureFrame() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = this.videoElement.videoWidth;
      canvas.height = this.videoElement.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          console.log('Frame captured successfully.');
          this.emit('frame-captured', { blob, timestamp: Date.now() });
        } else {
          throw new Error('Canvas toBlob returned null.');
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error capturing frame:', error);
      this.emit('error', new Error('Failed to capture frame.'));
    }
  }
}

export default OptimalFrameCapture;