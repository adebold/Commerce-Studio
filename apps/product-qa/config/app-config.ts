/**
 * Product Q&A App Configuration
 * 
 * This file contains the configuration settings for the Product Q&A app.
 */

export const AppConfig = {
  // App information
  name: 'Product Q&A',
  version: '1.0.0',
  description: 'Add a powerful Q&A section to your product pages to boost customer engagement and conversion rates',
  
  // API configuration
  api: {
    baseUrl: '/api/product-qa',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
  
  // Authentication configuration
  auth: {
    tokenExpiryTime: 86400, // 24 hours in seconds
    refreshTokenExpiryTime: 604800, // 7 days in seconds
    cookieName: 'product_qa_auth',
  },
  
  // Widget configuration
  widget: {
    defaultLocation: 'product_description_bottom',
    defaultEnabled: true,
    maxQuestionsPerPage: 10,
    maxAnswersPerQuestion: 5,
    characterLimitQuestion: 500,
    characterLimitAnswer: 1000,
  },
  
  // Notification configuration
  notifications: {
    types: [
      {
        name: 'new_question',
        defaultEnabled: true,
        template: 'A new question has been asked about {{product_name}}',
      },
      {
        name: 'new_answer',
        defaultEnabled: true,
        template: 'Your question about {{product_name}} has been answered',
      },
    ],
    channels: ['email', 'in_app', 'push'],
  },
  
  // Analytics configuration
  analytics: {
    trackEvents: true,
    eventTypes: [
      'question_asked',
      'question_answered',
      'question_upvoted',
      'answer_upvoted',
      'widget_viewed',
      'widget_expanded',
    ],
  },
  
  // Moderation configuration
  moderation: {
    autoModeration: true,
    profanityFilter: true,
    spamFilter: true,
    moderationQueue: true,
    requireApproval: false,
  },
  
  // Platform-specific configuration
  platforms: {
    shopify: {
      scriptTag: true,
      appBridge: true,
    },
    bigcommerce: {
      scriptTag: true,
      stencilHook: true,
    },
    magento: {
      scriptTag: true,
      moduleIntegration: true,
    },
    woocommerce: {
      scriptTag: true,
      pluginHook: true,
    },
  },
};

export default AppConfig;