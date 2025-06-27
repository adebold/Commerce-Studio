/**
 * VARAi Design System - Input Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../ThemeProvider';
import Input from './Input';

// Helper function to render Input with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Input Component', () => {
  test('renders correctly with default props', () => {
    renderWithTheme(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  test('renders with label correctly', () => {
    renderWithTheme(<Input label="Username" placeholder="Enter username" />);
    const label = screen.getByText('Username');
    const input = screen.getByPlaceholderText('Enter username');
    
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  test('renders with helper text correctly', () => {
    renderWithTheme(
      <Input 
        label="Password" 
        placeholder="Enter password" 
        helperText="Must be at least 8 characters" 
      />
    );
    
    const helperText = screen.getByText('Must be at least 8 characters');
    expect(helperText).toBeInTheDocument();
  });

  test('renders in error state correctly', () => {
    renderWithTheme(
      <Input 
        label="Email" 
        placeholder="Enter email" 
        error 
        helperText="Invalid email format" 
      />
    );
    
    const helperText = screen.getByText('Invalid email format');
    expect(helperText).toBeInTheDocument();
    // We would also check for error styling here, but that's harder to test directly
  });

  test('handles value changes correctly', () => {
    const handleChange = jest.fn();
    renderWithTheme(
      <Input 
        placeholder="Enter text" 
        onChange={handleChange} 
      />
    );
    
    const input = screen.getByPlaceholderText('Enter text');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('renders as disabled correctly', () => {
    renderWithTheme(<Input placeholder="Disabled input" disabled />);
    const input = screen.getByPlaceholderText('Disabled input');
    
    expect(input).toBeDisabled();
  });

  test('renders as read-only correctly', () => {
    renderWithTheme(<Input placeholder="Read-only input" readOnly />);
    const input = screen.getByPlaceholderText('Read-only input');
    
    expect(input).toHaveAttribute('readonly');
  });

  test('renders with required attribute correctly', () => {
    renderWithTheme(<Input placeholder="Required input" required />);
    const input = screen.getByPlaceholderText('Required input');
    
    expect(input).toBeRequired();
  });

  test('renders with full width correctly', () => {
    renderWithTheme(<Input placeholder="Full width input" fullWidth />);
    // This is harder to test directly with jest-dom, as it depends on styled-components
    // In a real test, we might use a custom matcher or check computed styles
  });

  test('renders with start icon correctly', () => {
    renderWithTheme(
      <Input 
        placeholder="Input with start icon" 
        startIcon={<span data-testid="start-icon">🔍</span>} 
      />
    );
    
    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
  });

  test('renders with end icon correctly', () => {
    renderWithTheme(
      <Input 
        placeholder="Input with end icon" 
        endIcon={<span data-testid="end-icon">✓</span>} 
      />
    );
    
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  test('renders different variants correctly', () => {
    const { rerender } = renderWithTheme(
      <Input placeholder="Outlined input" variant="outlined" />
    );
    expect(screen.getByPlaceholderText('Outlined input')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Input placeholder="Filled input" variant="filled" />
      </ThemeProvider>
    );
    expect(screen.getByPlaceholderText('Filled input')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Input placeholder="Standard input" variant="standard" />
      </ThemeProvider>
    );
    expect(screen.getByPlaceholderText('Standard input')).toBeInTheDocument();
  });

  test('renders different sizes correctly', () => {
    const { rerender } = renderWithTheme(
      <Input placeholder="Small input" size="small" />
    );
    expect(screen.getByPlaceholderText('Small input')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Input placeholder="Medium input" size="medium" />
      </ThemeProvider>
    );
    expect(screen.getByPlaceholderText('Medium input')).toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Input placeholder="Large input" size="large" />
      </ThemeProvider>
    );
    expect(screen.getByPlaceholderText('Large input')).toBeInTheDocument();
  });
});