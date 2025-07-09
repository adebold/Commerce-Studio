/**
 * Animation Service
 * 
 * This service provides core animation functionalities for the Facial Animation Controller.
 * 
 * @author Commerce Studio AI Team
 * @version 1.0.0
 */

import { facialExpressions, gestureLibrary } from './animation-helpers.js';

export class AnimationService {
  constructor(omniverseService) {
    if (!omniverseService) {
      throw new Error('AnimationService requires omniverseService.');
    }
    this.omniverseService = omniverseService;
    this.facialExpressions = facialExpressions;
    this.gestureLibrary = gestureLibrary;
  }

  /**
   * Apply facial animation to the avatar
   * @param {Object} animation - The animation to apply
   */
  async applyFacialAnimation(animation) {
    try {
      await this.omniverseService.playAnimation(
        animation.avatarId,
        animation.type,
        {
          intensity: animation.intensity,
          duration: animation.duration,
          blendMode: animation.blendMode
        }
      );
    } catch (error) {
      console.error('Failed to apply facial animation:', error);
      throw error;
    }
  }

  /**
   * Apply expression update to the avatar
   * @param {Object} expressionUpdate - The expression update to apply
   */
  async applyExpressionUpdate(expressionUpdate) {
    try {
      await this.omniverseService.updateExpression(
        expressionUpdate.avatarId,
        expressionUpdate.emotion,
        expressionUpdate.intensity
      );
    } catch (error) {
      console.error('Failed to apply expression update:', error);
      throw error;
    }
  }

  /**
   * Apply gesture animation to the avatar
   * @param {Object} gesture - The gesture to apply
   */
  async applyGestureAnimation(gesture) {
    try {
      await this.omniverseService.playAnimation(
        gesture.avatarId,
        gesture.type,
        {
          intensity: gesture.intensity,
          duration: gesture.duration
        }
      );
    } catch (error) {
      console.error('Failed to apply gesture animation:', error);
      throw error;
    }
  }

  /**
   * Apply blended expression to the avatar
   * @param {string} avatarId - The ID of the avatar
   * @param {Object} blendedExpression - The blended expression to apply
   */
  async applyBlendedExpression(avatarId, blendedExpression) {
    try {
      await this.omniverseService.updateExpression(
        avatarId,
        'blend',
        blendedExpression.intensity,
        {
          components: blendedExpression.components
        }
      );
    } catch (error) {
      console.error('Failed to apply blended expression:', error);
      throw error;
    }
  }

  /**
   * Calculate a blended expression from multiple components.
   * @param {Array} expressions - An array of expression objects, each with `emotion` and `weight`.
   * @param {string} blendMode - The blending mode ('weighted' or 'additive').
   * @returns {Object} The calculated blended expression.
   */
  calculateExpressionBlend(expressions, blendMode = 'weighted') {
    const blendedExpression = {
      components: [],
      intensity: 0
    };

    let totalWeight = 0;
    for (const expr of expressions) {
      if (this.facialExpressions[expr.emotion]) {
        totalWeight += expr.weight || 1;
      }
    }

    for (const expr of expressions) {
      const expressionConfig = this.facialExpressions[expr.emotion];
      if (expressionConfig) {
        const weight = (expr.weight || 1) / (blendMode === 'weighted' ? totalWeight : 1);
        blendedExpression.components.push({
          emotion: expr.emotion,
          intensity: (expr.intensity || 1.0) * weight
        });
      }
    }

    blendedExpression.intensity = blendedExpression.components.reduce(
      (acc, curr) => acc + curr.intensity,
      0
    );

    return {
      ...blendedExpression,
      intensity: Math.min(1, blendedExpression.intensity)
    };
  }
}