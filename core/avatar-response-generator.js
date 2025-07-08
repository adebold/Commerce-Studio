/**
 * @fileoverview Generates coordinated avatar responses, combining conversational text
 * with appropriate animations and expressions.
 * @module core/avatar-response-generator
 */

import { EventEmitter } from 'events';
import FacialAnimationController from '../avatar/facial-animation-controller.js';
import ExpressionEmotionMapper from '../avatar/expression-emotion-mapper.js';

/**
 * @class AvatarResponseGenerator
 * @description Coordinates conversational text with avatar animations.
 * @extends EventEmitter
 */
class AvatarResponseGenerator extends EventEmitter {
  /**
   * @param {object} config - Configuration for the response generator.
   */
  constructor(config = {}) {
    super();
    this.config = config;
    this.animationController = new FacialAnimationController();
    this.emotionMapper = new ExpressionEmotionMapper();
  }

  /**
   * Generates a complete response object with text and a matching animation.
   * @param {object} conversationalResponse - The response from the Merlin service.
   * @param {string} conversationalResponse.text - The text of the response.
   * @param {object} [conversationalResponse.metadata] - Metadata, possibly including sentiment or intent.
   * @param {object} user - The user object for context.
   */
  generate(conversationalResponse, user) {
    try {
      const { text, metadata = {} } = conversationalResponse;
      const emotion = this.detectEmotion(metadata.sentiment, text);
      const animation = this.getAnimationForEmotion(emotion);

      const response = {
        text,
        animation,
        emotion,
        user,
      };

      this.emit('response-generated', response);
      return response;
    } catch (error) {
      this.handleError(error, 'generate');
    }
  }

  /**
   * Detects the emotion from the response metadata or text.
   * @param {string} sentiment - The sentiment from the conversation service.
   * @param {string} text - The response text.
   * @returns {string} The detected emotion (e.g., 'joy', 'neutral').
   * @private
   */
  detectEmotion(sentiment, text) {
    // Priority to explicit sentiment from the NLP service
    if (sentiment) {
      return sentiment.toLowerCase();
    }
    // Basic keyword-based emotion detection as a fallback
    if (text.includes('sorry') || text.includes('apologize')) {
      return 'sorrow';
    }
    if (text.includes('thank you') || text.includes('great')) {
      return 'joy';
    }
    return 'neutral';
  }

  /**
   * Gets an appropriate animation for a given emotion.
   * @param {string} emotion - The emotion to find an animation for.
   * @returns {string} The name of the animation.
   * @private
   */
  getAnimationForEmotion(emotion) {
    const animation = this.emotionMapper.getAnimation(emotion);
    if (animation) {
      // Potentially trigger a complex animation sequence via the controller
      this.animationController.playAnimation(animation);
      return animation;
    }
    // Fallback to a default talking animation
    const defaultAnimation = 'neutral-talking';
    this.animationController.playAnimation(defaultAnimation);
    return defaultAnimation;
  }

  /**
   * Handles errors from the generator.
   * @param {Error} error - The error object.
   * @param {string} source - The source of the error.
   * @private
   */
  handleError(error, source) {
    console.error(`Error in AvatarResponseGenerator from ${source}:`, error);
    this.emit('error', { error, source });
  }
}

export default AvatarResponseGenerator;