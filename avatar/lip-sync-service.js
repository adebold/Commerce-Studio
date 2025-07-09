/**
 * Lip-Sync Service
 * 
 * This service provides lip-sync functionalities for the Facial Animation Controller.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

import { lipSyncMappings } from './animation-helpers.js';
import EventEmitter from 'events';

export class LipSyncService extends EventEmitter {
  constructor(googleSpeechService, omniverseService) {
    super();
    if (!googleSpeechService || !omniverseService) {
      throw new Error('LipSyncService requires googleSpeechService and omniverseService.');
    }
    this.googleSpeechService = googleSpeechService;
    this.omniverseService = omniverseService;
    this.lipSyncMappings = lipSyncMappings;
  }

  /**
   * Extract phonemes from audio data using Google Speech
   * @param {Buffer} audioData - The audio data to process
   * @returns {Promise<Object>} - The extracted phoneme data
   */
  async extractPhonemesFromGoogle(audioData) {
    try {
      const phonemeData = await this.googleSpeechService.recognize(audioData, {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
        enableWordTimeOffsets: true
      });
      
      this.emit('phonemesExtracted', { audioData, phonemeData });
      
      return phonemeData;
      
    } catch (error) {
      console.error('Failed to extract phonemes from Google Speech:', error);
      throw error;
    }
  }

  /**
   * Convert phonemes to visemes
   * @param {Object} phonemeData - The phoneme data to convert
   * @returns {Array} - The viseme sequence
   */
  convertPhonemesToVisemes(phonemeData) {
    const visemeSequence = [];
    
    for (const phoneme of phonemeData) {
      const viseme = this.lipSyncMappings[phoneme.phoneme];
      if (viseme) {
        visemeSequence.push({
          viseme: viseme.viseme,
          intensity: viseme.intensity,
          duration: phoneme.duration,
          timestamp: phoneme.timestamp
        });
      }
    }
    
    return visemeSequence;
  }

  /**
   * Play lip-sync animation
   * @param {Object} lipSyncStream - The lip-sync stream to play
   */
  async playLipSyncAnimation(lipSyncStream) {
    try {
      await this.omniverseService.synchronizeLipSync(
        lipSyncStream.avatarId,
        {
          visemeSequence: lipSyncStream.visemeSequence,
          audioTimestamp: lipSyncStream.startTime,
          duration: lipSyncStream.duration
        }
      );
      
    } catch (error) {
      console.error('Failed to play lip-sync animation:', error);
      throw error;
    }
  }

  /**
   * Set up real-time audio processing
   * @param {Object} realTimeLipSync - The real-time lip-sync object
   */
  async setupRealTimeAudioProcessing(realTimeLipSync) {
    // This function runs in a browser environment and needs access to browser APIs
    // It's being kept here for structural consistency but may need to be adapted
    // for a pure Node.js environment if window is not available.
    if (typeof window === 'undefined' || !window.AudioContext) {
        console.warn('Real-time audio processing is not supported in this environment.');
        return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(realTimeLipSync.audioStream);
    source.connect(analyser);
    
    const processAudioChunk = async (audioChunk) => {
      const phonemeData = await this.extractPhonemesFromGoogle(audioChunk);
      const visemeSequence = this.convertPhonemesToVisemes(phonemeData);
      
      await this.omniverseService.synchronizeLipSync(
        realTimeLipSync.avatarId,
        {
          visemeSequence,
          audioTimestamp: Date.now()
        }
      );
    };
    
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const process = () => {
      analyser.getByteTimeDomainData(dataArray);
      processAudioChunk(dataArray);
      if (realTimeLipSync.processingQueue) {
        realTimeLipSync.processingQueue.push(requestAnimationFrame(process));
      }
    };
    
    process();
  }
}