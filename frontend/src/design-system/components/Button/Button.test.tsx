/**
 * VARAi Design System - Button Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../ThemeProvider';
import Button from './Button';

// Helper function to render Button with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Button Component', () => {
  test('renders correctly with default props', () => {
    renderWithTheme(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test('renders primary variant correctly', () => {
    renderWithTheme(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toBeInTheDocument();
  });

  test('renders secondary variant correctly', () => {
    renderWithTheme(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toBeInTheDocument();
  });

  test('renders tertiary variant correctly', () => {
    renderWithTheme(<Button variant="tertiary">Tertiary</Button>);
    const button = screen.getByRole('button', { name: /tertiary/i });
    expect(button).toBeInTheDocument();
  });

  test('renders different sizes correctly', () => {
    const { rerender } = renderWithTheme(<Button size="small">Small</Button>);
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Button size="medium">Medium</Button>
      </ThemeProvider>
    );
    button = screen.getByRole('button', { name: /medium/i });
    expect(button).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Button size="large">Large</Button>
      </ThemeProvider>
    );
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disables button when disabled prop is true', () => {
    renderWithTheme(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    
    expect(button).toBeDisabled();
  });

  test('disables button when loading prop is true', () => {
    renderWithTheme(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: /loading/i });
    
    expect(button).toBeDisabled();
  });

  test('renders with full width when fullWidth prop is true', () => {
    renderWithTheme(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button', { name: /full width/i });
    
    expect(button).toHaveStyle({ width: '100%' });
  });

  test('renders with start icon when startIcon prop is provided', () => {
    renderWithTheme(
      <Button startIcon={<span data-testid="start-icon">→</span>}>
        With Start Icon
      </Button>
    );
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  test('renders with end icon when endIcon prop is provided', () => {
    renderWithTheme(
      <Button endIcon={<span data-testid="end-icon">→</span>}>
        With End Icon
      </Button>
    );
    
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });
});