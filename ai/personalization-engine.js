const EventEmitter = require('events');

/**
 * @class PersonalizationEngine
 * @description Adapts avatar personality and responses to individual users.
 * @extends EventEmitter
 */
class PersonalizationEngine extends EventEmitter {
  /**
   * @constructor
   */
  constructor() {
    super();
    this.userProfiles = new Map();
    console.log('PersonalizationEngine initialized.');
  }

  /**
   * Retrieves or creates a profile for a user.
   * @param {string} userId - The unique identifier for the user.
   * @returns {object} The user's profile.
   */
  getProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, this.createDefaultProfile(userId));
      this.emit('profile-created', { userId });
    }
    return this.userProfiles.get(userId);
  }

  /**
   * Creates a default profile for a new user.
   * @param {string} userId - The user's unique identifier.
   * @returns {object} The default user profile.
   * @private
   */
  createDefaultProfile(userId) {
    return {
      userId,
      preferences: {
        // Explicitly opt-in for privacy
        allowPersonalization: false,
        communicationStyle: 'neutral', // e.g., 'formal', 'casual', 'neutral'
        topicsOfInterest: [],
      },
      personality: {
        // Avatar's personality adapted for this user
        humorLevel: 0.3, // 0 to 1
        formality: 0.5, // 0 to 1
        proactivity: 0.4, // 0 to 1
      },
      interactionHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Updates a user's profile based on an interaction.
   * This method respects the user's privacy settings.
   * @param {string} userId - The user's unique identifier.
   * @param {object} interaction - The interaction data (e.g., { type: 'topic', value: 'tech', sentiment: 0.8 }).
   */
  updateProfileFromInteraction(userId, interaction) {
    const profile = this.getProfile(userId);

    if (!profile.preferences.allowPersonalization) {
      return; // Respect user's privacy choice
    }

    try {
      profile.interactionHistory.push(interaction);
      this.evolveProfile(profile);
      profile.updatedAt = new Date();

      this.emit('profile-updated', { userId, profile });
    } catch (error) {
      this.emit('error', new Error(`Failed to update profile for user ${userId}: ${error.message}`));
    }
  }

  /**
   * Evolves the user's profile based on their interaction history.
   * @param {object} profile - The user profile to evolve.
   * @private
   */
  evolveProfile(profile) {
    // Placeholder for a more sophisticated ML-based evolution model.
    const recentInteractions = profile.interactionHistory.slice(-10);

    // Adapt communication style preference
    const positiveInteractions = recentInteractions.filter(i => i.sentiment > 0.6);
    if (positiveInteractions.length > 5) {
      // Example: if user responds well to a certain response style
      const styles = positiveInteractions.map(i => i.style).filter(Boolean);
      if (styles.length > 3) {
        profile.preferences.communicationStyle = this.getMostFrequent(styles);
      }
    }

    // Adapt personality
    const averageSentiment = recentInteractions.reduce((acc, i) => acc + (i.sentiment || 0.5), 0) / recentInteractions.length;
    if (averageSentiment > 0.7) {
      profile.personality.humorLevel = Math.min(1, profile.personality.humorLevel + 0.05);
    } else if (averageSentiment < 0.4) {
      profile.personality.humorLevel = Math.max(0, profile.personality.humorLevel - 0.05);
    }
  }

  /**
   * Allows a user to explicitly set their preferences.
   * @param {string} userId - The user's unique identifier.
   * @param {object} preferences - The preferences to set (e.g., { allowPersonalization: true, communicationStyle: 'casual' }).
   */
  setUserPreferences(userId, preferences) {
    const profile = this.getProfile(userId);
    
    // Ensure we only update allowed preference keys
    const allowedKeys = ['allowPersonalization', 'communicationStyle', 'topicsOfInterest'];
    for (const key in preferences) {
      if (allowedKeys.includes(key)) {
        profile.preferences[key] = preferences[key];
      }
    }
    
    profile.updatedAt = new Date();
    this.emit('preferences-updated', { userId, preferences: profile.preferences });
  }

  /**
   * Gets the adapted personality for a user.
   * @param {string} userId - The user's unique identifier.
   * @returns {object} The adapted personality settings.
   */
  getAdaptedPersonality(userId) {
    const profile = this.getProfile(userId);
    if (!profile.preferences.allowPersonalization) {
      // Return a default, non-personalized personality
      return this.createDefaultProfile('default').personality;
    }
    return profile.personality;
  }

  /**
   * Helper to find the most frequent item in an array.
   * @param {Array} arr - The array to analyze.
   * @returns {*} The most frequent item.
   * @private
   */
  getMostFrequent(arr) {
    const hashmap = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(hashmap).reduce((a, b) => hashmap[a] > hashmap[b] ? a : b);
  }

  /**
   * Deletes a user's profile and all associated data.
   * @param {string} userId - The user's unique identifier.
   * @returns {boolean} True if deletion was successful.
   */
  deleteUserProfile(userId) {
    if (this.userProfiles.has(userId)) {
      this.userProfiles.delete(userId);
      this.emit('profile-deleted', { userId });
      return true;
    }
    return false;
  }
}

module.exports = PersonalizationEngine;