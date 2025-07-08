/**
 * @fileoverview Manages the lifecycle of an avatar chat session, including state,
 * user interactions, and integration with NVIDIA conversational AI services.
 * @module core/avatar-chat-session-manager
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { MerlinConversationService } from '../services/nvidia/merlin-conversation-service.js';
import { OmniverseAvatarService } from '../services/nvidia/omniverse-avatar-service.js';
import MultiModalInputProcessor from './multi-modal-input-processor.js';
import AvatarResponseGenerator from './avatar-response-generator.js';
import UnifiedDialogflowService from '../services/google/unified-dialogflow-service.js';

/**
 * @class AvatarChatSessionManager
 * @description Orchestrates the avatar chat session, managing state, inputs, and responses.
 * @extends EventEmitter
 */
class AvatarChatSessionManager extends EventEmitter {
  /**
   * @param {object} config - Configuration for the session manager.
   * @param {object} config.merlinConfig - NVIDIA Merlin service configuration.
   * @param {object} config.omniverseConfig - NVIDIA Omniverse service configuration.
   */
  constructor(config = {}) {
    super();
    this.sessionId = uuidv4();
    this.config = config;
    this.state = 'idle'; // idle, listening, processing, responding
    this.user = null;

    this.merlinService = new MerlinConversationService(this.config.merlinConfig);
    this.omniverseService = new OmniverseAvatarService(this.config.omniverseConfig);
    this.inputProcessor = new MultiModalInputProcessor();
    this.responseGenerator = new AvatarResponseGenerator();

    this.setupEventListeners();
    this.emit('ready', { sessionId: this.sessionId });
  }

  /**
   * @private
   * Sets up event listeners for internal components.
   */
  setupEventListeners() {
    this.inputProcessor.on('processed-input', (input) => this.handleUserInput(input));
    this.responseGenerator.on('response-generated', (response) => this.playResponse(response));
    this.merlinService.on('error', (error) => this.handleError(error, 'MerlinService'));
    this.omniverseService.on('error', (error) => this.handleError(error, 'OmniverseService'));
    this.inputProcessor.on('error', (error) => this.handleError(error, 'InputProcessor'));
    this.responseGenerator.on('error', (error) => this.handleError(error, 'ResponseGenerator'));
  }

  /**
   * Starts a new chat session.
   * @param {object} user - The user object for this session.
   */
  startSession(user) {
    if (this.state !== 'idle') {
      this.handleError(new Error('Session is already active.'));
      return;
    }
    this.user = user;
    this.updateState('listening');
    this.emit('session-started', { sessionId: this.sessionId, user: this.user });
    console.log(`[${this.sessionId}] Session started for user ${this.user.id}`);
  }

  /**
   * Handles processed user input from the MultiModalInputProcessor.
   * @param {object} input - The processed input.
   * @param {string} input.type - The type of input (e.g., 'text', 'voice').
   * @param {string} input.data - The input data.
   */
  async handleUserInput(input) {
    if (this.state !== 'listening') return;

    try {
      this.updateState('processing');
      const conversationContext = {
        sessionId: this.sessionId,
        userId: this.user.id,
        text: input.data,
      };
      const conversationalResponse = await this.merlinService.getConversationResponse(conversationContext);
      this.responseGenerator.generate(conversationalResponse, this.user);
    } catch (error) {
      this.handleError(error, 'handleUserInput');
    }
  }

  /**
   * Plays the generated avatar response.
   * @param {object} response - The response object from AvatarResponseGenerator.
   * @param {string} response.text - The text to be spoken.
   * @param {string} response.animation - The animation to be played.
   */
  async playResponse(response) {
    try {
      this.updateState('responding');
      await this.omniverseService.renderAvatar({
        text: response.text,
        animation: response.animation,
      });
      this.emit('response-played', { response });
      this.updateState('listening');
    } catch (error) {
      this.handleError(error, 'playResponse');
    }
  }

  /**
   * Ends the current chat session.
   */
  endSession() {
    this.updateState('idle');
    this.emit('session-ended', { sessionId: this.sessionId });
    console.log(`[${this.sessionId}] Session ended.`);
    this.user = null;
  }

  /**
   * Updates the session state and emits an event.
   * @param {string} newState - The new state.
   * @private
   */
  updateState(newState) {
    const oldState = this.state;
    this.state = newState;
    this.emit('state-changed', { newState, oldState });
  }

  /**
   * Handles errors from various components.
   * @param {Error} error - The error object.
   * @param {string} source - The source of the error.
   * @private
   */
  handleError(error, source) {
    console.error(`[${this.sessionId}] Error in ${source}:`, error);
    this.emit('error', { error, source, sessionId: this.sessionId });
    this.updateState('idle');
  }
}

module.exports = AvatarChatSessionManager;