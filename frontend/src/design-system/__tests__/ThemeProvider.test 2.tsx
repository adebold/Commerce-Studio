/**
 * ThemeProvider Tests
 * Tests for the VARAi Design System ThemeProvider component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeProvider';

// Test component that uses the theme
const TestComponent: React.FC = () => {
  const { theme, mode, toggleMode } = useTheme();
  
  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="primary-color">{theme.colors.primary['500']}</div>
      <button onClick={toggleMode} data-testid="toggle-button">
        Toggle Mode
      </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  it('provides theme context to child components', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('primary-color')).toBeInTheDocument();
  });

  it('toggles between light and dark mode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const modeElement = screen.getByTestId('mode');
    const toggleButton = screen.getByTestId('toggle-button');

    expect(modeElement).toHaveTextContent('light');

    fireEvent.click(toggleButton);
    expect(modeElement).toHaveTextContent('dark');

    fireEvent.click(toggleButton);
    expect(modeElement).toHaveTextContent('light');
  });

  it('accepts initial mode prop', () => {
    render(
      <ThemeProvider initialMode="dark">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');

    consoleSpy.mockRestore();
  });
});