import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '../design-system';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

// Create a custom Emotion cache for testing
const createEmotionCache = () => {
  return createCache({
    key: 'process.env.EMOTION_TEST_UTILS_SECRET_2',
    prepend: true,
  });
};

// Custom render function that includes the Emotion CacheProvider and ThemeProvider
export const renderWithEmotion = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const cache = createEmotionCache();
  
  const Wrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
    return (
      <CacheProvider value={cache}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </CacheProvider>
    );
  };
  
  return render(ui, { wrapper: Wrapper, ...options });
};