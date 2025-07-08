/**
 * @fileoverview Processes and unifies multi-modal inputs (text, voice, camera)
 * for the avatar chat system.
 * @module core/multi-modal-input-processor
 */

import { EventEmitter } from 'events';
import SpeechProcessingService from '../services/speech-processing-service.js';

/**
 * @class MultiModalInputProcessor
 * @description Handles input from various sources and formats it for the session manager.
 * @extends EventEmitter
 */
class MultiModalInputProcessor extends EventEmitter {
  /**
   * @param {object} config - Configuration for the input processor.
   * @param {object} config.speechConfig - Configuration for the SpeechProcessingService.
   */
  constructor(config = {}) {
    super();
    this.speechService = new SpeechProcessingService(config.speechConfig);
    this.setupEventListeners();
  }

  /**
   * @private
   * Sets up event listeners for underlying services.
   */
  setupEventListeners() {
    this.speechService.on('stt-result', (result) => {
      this.emit('processed-input', {
        type: 'voice',
        data: result.transcript,
        source: 'speech-service',
      });
    });

    this.speechService.on('error', (error) => {
      this.handleError(error, 'SpeechService');
    });
  }

  /**
   * Processes text input.
   * @param {string} text - The text input from the user.
   */
  processTextInput(text) {
    if (!text || typeof text !== 'string') {
      this.handleError(new Error('Invalid text input.'), 'processTextInput');
      return;
    }
    this.emit('processed-input', {
      type: 'text',
      data: text,
      source: 'text-input',
    });
  }

  /**
   * Starts processing voice input from a stream.
   * @param {object} options - Options for the speech-to-text stream.
   */
  startVoiceInput(options) {
    try {
      this.speechService.startSpeechToText(options);
      this.emit('voice-input-started');
    } catch (error) {
      this.handleError(error, 'startVoiceInput');
    }
  }

  /**
   * Stops processing voice input.
   */
  stopVoiceInput() {
    try {
      this.speechService.stopSpeechToText();
      this.emit('voice-input-stopped');
    } catch (error) {
      this.handleError(error, 'stopVoiceInput');
    }
  }

  /**
   * Processes a chunk of voice data.
   * @param {Buffer} audioChunk - The audio chunk to process.
   */
  processVoiceChunk(audioChunk) {
    try {
      this.speechService.sendAudioChunk(audioChunk);
    } catch (error) {
      this.handleError(error, 'processVoiceChunk');
    }
  }

  /**
   * Processes camera input (e.g., facial expressions, gestures).
   * This is a placeholder for future implementation.
   * @param {object} cameraData - The data from the camera.
   */
  processCameraInput(cameraData) {
    // Placeholder for camera input processing logic.
    // This could involve another service to analyze expressions or gestures.
    this.emit('processed-input', {
      type: 'camera',
      data: cameraData,
      source: 'camera-input',
    });
  }

  /**
   * Handles errors from the processor.
   * @param {Error} error - The error object.
   * @param {string} source - The source of the error.
   * @private
   */
  handleError(error, source) {
    console.error(`Error in MultiModalInputProcessor from ${source}:`, error);
    this.emit('error', { error, source });
  }
}

export default MultiModalInputProcessor;