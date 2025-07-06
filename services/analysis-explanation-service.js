const EventEmitter = require('events');

/**
 * @class AnalysisExplanationService
 * @extends EventEmitter
 * @description Generates and delivers personalized explanations of face analysis results via an avatar.
 */
class AnalysisExplanationService extends EventEmitter {
  /**
   * @param {object} options - Configuration options.
   * @param {AvatarManager} options.avatarManager - The avatar manager to deliver the explanations.
   * @param {NvidiaMerlinConversationService} options.conversationService - The conversation service for generating human-like text.
   */
  constructor({ avatarManager, conversationService }) {
    super();
    if (!avatarManager || !conversationService) {
      throw new Error('avatarManager and conversationService are required.');
    }
    this.avatarManager = avatarManager;
    this.conversationService = conversationService;
  }

  /**
   * Explains the face analysis results to the user through the avatar.
   * @param {object} analysisResult - The results from the FaceAnalysisService.
   */
  async explain(analysisResult) {
    this.emit('explanation-started', analysisResult);
    try {
      const explanation = await this.generateExplanation(analysisResult);
      this.deliverExplanation(explanation);
      this.emit('explanation-complete', explanation);
    } catch (error) {
      console.error('Error generating or delivering explanation:', error);
      this.avatarManager.speak("I'm sorry, I had trouble preparing your results. Please try again later.");
      this.emit('error', new Error('Failed to explain analysis results.'));
    }
  }

  /**
   * Generates a personalized explanation script based on the analysis results.
   * @param {object} analysisResult - The face analysis data.
   * @returns {Promise<object>} A promise that resolves to an object containing the script and animations.
   * @private
   */
  async generateExplanation(analysisResult) {
    // Create a prompt for the conversational AI to generate a friendly explanation.
    const prompt = this.createExplanationPrompt(analysisResult);

    // Use the conversation service to generate a natural language explanation.
    const conversationalResponse = await this.conversationService.generateResponse(prompt);

    // Placeholder for mapping parts of the explanation to specific avatar animations.
    const animations = this.mapTextToAnimations(conversationalResponse, analysisResult);

    return {
      script: conversationalResponse,
      animations,
    };
  }

  /**
   * Delivers the explanation script and animations through the avatar.
   * @param {object} explanation - The explanation object containing script and animations.
   * @private
   */
  deliverExplanation(explanation) {
    // For simplicity, we'll just have the avatar speak the whole script.
    // A more advanced implementation would sequence speech and animations.
    this.avatarManager.speak(explanation.script);

    // Trigger animations if any are defined.
    if (explanation.animations && explanation.animations.length > 0) {
      explanation.animations.forEach(anim => {
        // Assuming avatarManager has a method to play animations by name.
        this.avatarManager.playAnimation(anim.name, anim.options);
      });
    }
  }

  /**
   * Creates a detailed prompt for the NVIDIA Merlin service to generate an explanation.
   * @param {object} analysisResult - The face analysis data.
   * @returns {string} The prompt for the conversation AI.
   * @private
   */
  createExplanationPrompt(analysisResult) {
    // This is a simplified example. A real implementation would be more detailed.
    let prompt = `You are a friendly and helpful AI assistant for an eyewear store. Your task is to explain face analysis results to a customer. Be positive and focus on recommendations. Here are the results:\n`;
    prompt += `- Face Shape: ${analysisResult.faceShape}\n`;
    prompt += `- Skin Tone: ${analysisResult.skinTone}\n`;
    prompt += `- Key facial points: ${JSON.stringify(analysisResult.landmarks)}\n\n`;
    prompt += `Based on this, generate a short, friendly script that explains their face shape and suggests eyeglass styles that would be a great fit. For example, for a 'round' face, you might suggest 'angular or geometric frames'.`;
    
    return prompt;
  }

  /**
   * Maps keywords in the generated text to avatar animations.
   * @param {string} text - The generated explanation script.
   * @param {object} analysisResult - The analysis data, for context.
   * @returns {object[]} An array of animation cues.
   * @private
   */
  mapTextToAnimations(text, analysisResult) {
    const animations = [];
    if (text.toLowerCase().includes('hello') || text.toLowerCase().includes('hi')) {
      animations.push({ name: 'wave', options: { speed: 1 } });
    }
    if (analysisResult.faceShape === 'oval' && text.toLowerCase().includes('oval')) {
        animations.push({ name: 'nod', options: { repetitions: 2 } });
    }
    if (text.toLowerCase().includes('perfect') || text.toLowerCase().includes('great fit')) {
        animations.push({ name: 'thumbs_up' });
    }
    return animations;
  }
}

module.exports = AnalysisExplanationService;