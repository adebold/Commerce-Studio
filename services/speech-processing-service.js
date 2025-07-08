/**
 * @fileoverview Provides real-time speech-to-text and text-to-speech processing
 * by integrating with the NVIDIA Riva Speech Service.
 * @module services/speech-processing-service
 */

import { EventEmitter } from 'events';
import RivaSpeechService from './nvidia/riva-speech-service.js';

/**
 * @class SpeechProcessingService
 * @description A service for handling speech-to-text and text-to-speech functionality.
 * @extends EventEmitter
 */
class SpeechProcessingService extends EventEmitter {
  /**
   * @param {object} config - Configuration for the Riva Speech Service.
   */
  constructor(config = {}) {
    super();
    this.rivaService = new RivaSpeechService(config);
    this.isSttActive = false;
    this.setupEventListeners();
  }

  /**
   * @private
   * Sets up event listeners for the underlying Riva service.
   */
  setupEventListeners() {
    this.rivaService.on('stt-result', (result) => {
      this.emit('stt-result', result);
    });

    this.rivaService.on('tts-result', (result) => {
      this.emit('tts-result', result);
    });

    this.rivaService.on('error', (error) => {
      this.handleError(error, 'RivaSpeechService');
    });
  }

  /**
   * Starts the speech-to-text stream.
   * @param {object} options - Configuration for the STT stream.
   */
  startSpeechToText(options) {
    if (this.isSttActive) {
      console.warn('STT service is already active.');
      return;
    }
    try {
      this.rivaService.startSttStream(options);
      this.isSttActive = true;
      this.emit('stt-started');
    } catch (error) {
      this.handleError(error, 'startSpeechToText');
    }
  }

  /**
   * Stops the speech-to-text stream.
   */
  stopSpeechToText() {
    if (!this.isSttActive) {
      return;
    }
    try {
      this.rivaService.stopSttStream();
      this.isSttActive = false;
      this.emit('stt-stopped');
    } catch (error) {
      this.handleError(error, 'stopSpeechToText');
    }
  }

  /**
   * Sends audio chunks to the STT stream.
   * @param {Buffer} audioChunk - The audio data chunk.
   */
  sendAudioChunk(audioChunk) {
    if (!this.isSttActive) {
      this.handleError(new Error('STT service is not active.'), 'sendAudioChunk');
      return;
    }
    this.rivaService.sendAudio(audioChunk);
  }

  /**
   * Converts text to speech.
   * @param {string} text - The text to synthesize.
   * @param {object} options - Configuration for TTS.
   * @returns {Promise<Buffer>} A promise that resolves with the audio buffer.
   */
  async textToSpeech(text, options) {
    try {
      const audioBuffer = await this.rivaService.synthesize(text, options);
      this.emit('tts-completed', { text });
      return audioBuffer;
    } catch (error) {
      this.handleError(error, 'textToSpeech');
      throw error;
    }
  }

  /**
   * Handles errors from the service.
   * @param {Error} error - The error object.
   * @param {string} source - The source of the error.
   * @private
   */
  handleError(error, source) {
    console.error(`Error in SpeechProcessingService from ${source}:`, error);
    this.emit('error', { error, source });
  }
}

export default SpeechProcessingService;