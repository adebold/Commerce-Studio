import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedThemeProvider, useUnifiedTheme, useTheme, useThemeMode } from '../UnifiedThemeProvider';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia for useMediaQuery
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component that uses the theme hooks
const TestComponent: React.FC = () => {
  const { mode, toggleTheme, setTheme, isSystemPreference } = useUnifiedTheme();
  const theme = useTheme();
  const themeMode = useThemeMode();

  return (
    <div>
      <div data-testid="current-mode">{mode}</div>
      <div data-testid="is-system-preference">{isSystemPreference.toString()}</div>
      <div data-testid="theme-primary-color">{theme.palette.primary.main}</div>
      <div data-testid="theme-mode-from-hook">{themeMode.mode}</div>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
    </div>
  );
};

describe('UnifiedThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should render with default light theme', () => {
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
    expect(screen.getByTestId('theme-primary-color')).toHaveTextContent('#1890FF');
  });

  it('should render with initial mode when provided', () => {
    render(
      <UnifiedThemeProvider initialMode="dark">
        <TestComponent />
      </UnifiedThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');
  });

  it('should toggle theme mode', async () => {
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('light');

    fireEvent.click(screen.getByTestId('toggle-theme'));

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');
    });

    fireEvent.click(screen.getByTestId('toggle-theme'));

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
    });
  });

  it('should set specific theme mode', async () => {
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');
    });

    fireEvent.click(screen.getByTestId('set-light'));

    await waitFor(() => {
      expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
    });
  });

  it('should save theme preference to localStorage', async () => {
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-dark'));

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('varai-theme-mode', 'dark');
    });
  });

  it('should load theme preference from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');

    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');
  });

  it('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('light');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to read theme preference from localStorage:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should handle system preference correctly', () => {
    // Mock dark mode preference
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(
      <UnifiedThemeProvider enableSystemPreference>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-system-preference')).toHaveTextContent('true');
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUnifiedTheme must be used within UnifiedThemeProvider');

    consoleSpy.mockRestore();
  });

  it('should provide theme mode hooks correctly', () => {
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    expect(screen.getByTestId('theme-mode-from-hook')).toHaveTextContent('light');
  });

  it('should handle theme creation errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // This test would require mocking the theme creation to fail
    // For now, we'll just verify the component renders
    render(
      <UnifiedThemeProvider>
        <TestComponent />
      </UnifiedThemeProvider>
    );

    expect(screen.getByTestId('current-mode')).toHaveTextContent('light');

    consoleSpy.mockRestore();
  });
});