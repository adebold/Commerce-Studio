/**
 * Test Utilities Index
 * 
 * This file exports all test utilities for easy importing in test files.
 */

// Export Emotion test utilities
export * from './emotion-test-utils';

// Re-export testing-library utilities for convenience
export { render, screen, fireEvent, waitFor } from '@testing-library/react';
export { act } from 'react-dom/test-utils';
export { userEvent } from '@testing-library/user-event';

// Re-export design system test utilities
export { mockTheme } from '../design-system/test-utils';