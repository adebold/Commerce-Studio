/**
 * Product Q&A App
 * 
 * This is the main entry point for the Product Q&A app.
 * It exports all the components and functionality of the app.
 */

// Configuration
import AppConfig from './config/app-config';

// API Types
import {
  Question,
  Answer,
  QuestionStatus,
  AnswerStatus,
  AuthorType,
  UserRole,
  NotificationType,
  QAAnalytics,
} from './api/types';

// API Handlers
import {
  handleQuestions,
  handleQuestion,
  handleAnswers,
  handleAnswer,
} from './api/index';

// Components
import ProductQAWidget from './components/ProductQAWidget';

// Frontend Pages
import Dashboard from './frontend/pages/dashboard';
import AnalyticsDashboard from './frontend/pages/analytics';

// Installation and Uninstallation Scripts
import { installApp } from './scripts/install';
import { uninstallApp } from './scripts/uninstall';

// Export configuration
export { AppConfig };

// Export API types
export type {
  Question,
  Answer,
  QuestionStatus,
  AnswerStatus,
  AuthorType,
  UserRole,
  NotificationType,
  QAAnalytics,
};

// Export API handlers
export {
  handleQuestions,
  handleQuestion,
  handleAnswers,
  handleAnswer,
};

// Export components
export { ProductQAWidget };

// Export frontend pages
export { Dashboard, AnalyticsDashboard };

// Export installation and uninstallation scripts
export { installApp, uninstallApp };

/**
 * Initialize the Product Q&A app
 */
export function initProductQA(options: {
  platform: 'shopify' | 'bigcommerce' | 'magento' | 'woocommerce';
  storeId: string;
  accessToken: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  adminEmail: string;
}) {
  console.log(`Initializing Product Q&A app for ${options.platform} store ${options.storeId}...`);
  
  // In a real implementation, this would initialize the app
  // and return an instance of the app
  
  return {
    config: AppConfig,
    widget: ProductQAWidget,
    dashboard: Dashboard,
    analytics: AnalyticsDashboard,
    api: {
      handleQuestions,
      handleQuestion,
      handleAnswers,
      handleAnswer,
    },
    install: () => installApp(options),
    uninstall: (appId: string, deleteData = false) => uninstallApp({
      appId,
      platform: options.platform,
      storeId: options.storeId,
      accessToken: options.accessToken,
      deleteData,
    }),
  };
}

export default {
  AppConfig,
  ProductQAWidget,
  Dashboard,
  AnalyticsDashboard,
  installApp,
  uninstallApp,
  initProductQA,
};