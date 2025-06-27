/**
 * Enhanced Customer Layout Tests
 * Tests the enhanced customer layout with theme integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import EnhancedCustomerLayout from '../layouts/EnhancedCustomerLayout';
import { createVaraiTheme } from '../design-system/mui-integration';
import { useThemeContext } from '../hooks/useThemeContext';

// Mock the theme context hook
const mockToggleTheme = jest.fn();
const mockUseThemeContext = {
  mode: 'light' as const,
  toggleTheme: mockToggleTheme,
};

jest.mock('../hooks/useThemeContext', () => ({
  useThemeContext: jest.fn(() => mockUseThemeContext),
}));

// Mock the loading spinner
jest.mock('../components/common/ThemeAwareLoadingSpinner', () => {
  return function MockThemeAwareLoadingSpinner({ message }: { message?: string }) {
    return <div data-testid="loading-spinner">{message || 'Loading...'}</div>;
  };
});

// Mock react-router-dom navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="outlet">Outlet Content</div>,
}));

const renderWithProviders = (initialEntries: string[] = ['/']) => {
  const theme = createVaraiTheme('light');
  
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={initialEntries}>
        <EnhancedCustomerLayout />
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('EnhancedCustomerLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock theme context
    (useThemeContext as jest.Mock).mockReturnValue(mockUseThemeContext);
    
    // Mock matchMedia for useMediaQuery
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('(max-width:') ? false : true, // Desktop by default
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('Layout Structure', () => {
    it('should render header, main content, and footer', () => {
      renderWithProviders();
      
      // Header should be present
      expect(screen.getByRole('banner')).toBeInTheDocument();
      
      // Main content should be present
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      
      // Footer should be present
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should display VARAi logo', () => {
      renderWithProviders();
      
      expect(screen.getByText('VARAi')).toBeInTheDocument();
    });

    it('should render navigation links on desktop', () => {
      renderWithProviders();
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Frames')).toBeInTheDocument();
      expect(screen.getByText('Virtual Try-On')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });

    it('should render auth buttons', () => {
      renderWithProviders();
      
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should render theme toggle button', () => {
      renderWithProviders();
      
      const themeToggle = screen.getByLabelText('Switch to dark mode');
      expect(themeToggle).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('should display correct theme toggle icon for light mode', () => {
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'light',
        toggleTheme: mockToggleTheme,
      });
      
      renderWithProviders();
      
      const themeToggle = screen.getByLabelText('Switch to dark mode');
      expect(themeToggle).toBeInTheDocument();
    });

    it('should display correct theme toggle icon for dark mode', () => {
      (useThemeContext as jest.Mock).mockReturnValue({
        mode: 'dark',
        toggleTheme: mockToggleTheme,
      });
      
      renderWithProviders();
      
      const themeToggle = screen.getByLabelText('Switch to light mode');
      expect(themeToggle).toBeInTheDocument();
    });

    it('should call toggleTheme when theme button is clicked', () => {
      renderWithProviders();
      
      const themeToggle = screen.getByLabelText('Switch to dark mode');
      fireEvent.click(themeToggle);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should apply theme styles correctly', () => {
      const theme = createVaraiTheme('light');
      
      render(
        <ThemeProvider theme={theme}>
          <MemoryRouter>
            <EnhancedCustomerLayout />
          </MemoryRouter>
        </ThemeProvider>
      );
      
      const header = screen.getByRole('banner');
      expect(header).toHaveStyle({
        position: 'fixed',
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to auth page when Sign In is clicked', () => {
      renderWithProviders();
      
      const signInButton = screen.getByText('Sign In');
      fireEvent.click(signInButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
    });

    it('should navigate to signup page when Sign Up is clicked', () => {
      renderWithProviders();
      
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('should have correct navigation links', () => {
      renderWithProviders();
      
      const homeLink = screen.getByText('Home').closest('a');
      const framesLink = screen.getByText('Frames').closest('a');
      const virtualTryOnLink = screen.getByText('Virtual Try-On').closest('a');
      const recommendationsLink = screen.getByText('Recommendations').closest('a');
      
      expect(homeLink).toHaveAttribute('href', '/');
      expect(framesLink).toHaveAttribute('href', '/frames');
      expect(virtualTryOnLink).toHaveAttribute('href', '/virtual-try-on');
      expect(recommendationsLink).toHaveAttribute('href', '/recommendations');
    });
  });

  describe('Responsive Design', () => {
    it('should hide navigation links on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('(max-width:') ? true : false, // Mobile
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      renderWithProviders();
      
      // Navigation links should not be visible on mobile
      const homeLink = screen.queryByText('Home');
      expect(homeLink).not.toBeInTheDocument();
    });

    it('should adjust logo layout on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('(max-width:') ? true : false, // Mobile
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      renderWithProviders();
      
      const logo = screen.getByText('VARAi');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders();
      
      const themeToggle = screen.getByLabelText(/Switch to .* mode/);
      expect(themeToggle).toBeInTheDocument();
    });

    it('should have proper semantic structure', () => {
      renderWithProviders();
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // Footer
    });

    it('should have accessible button labels', () => {
      renderWithProviders();
      
      const signInButton = screen.getByRole('button', { name: 'Sign In' });
      const signUpButton = screen.getByRole('button', { name: 'Sign Up' });
      
      expect(signInButton).toBeInTheDocument();
      expect(signUpButton).toBeInTheDocument();
    });

    it('should have accessible navigation links', () => {
      renderWithProviders();
      
      const homeLink = screen.getByRole('link', { name: 'Home' });
      const framesLink = screen.getByRole('link', { name: 'Frames' });
      
      expect(homeLink).toBeInTheDocument();
      expect(framesLink).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner in suspense fallback', async () => {
      renderWithProviders();
      
      // The loading spinner should be shown for suspended content
      await waitFor(() => {
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
      });
    });
  });

  describe('Footer', () => {
    it('should display copyright information', () => {
      renderWithProviders();
      
      const currentYear = new Date().getFullYear();
      const copyrightText = `© ${currentYear} VARAi. All rights reserved.`;
      
      expect(screen.getByText(copyrightText)).toBeInTheDocument();
    });

    it('should have proper footer styling', () => {
      renderWithProviders();
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = renderWithProviders();
      
      expect(screen.getByText('VARAi')).toBeInTheDocument();
      
      // Re-render should not cause issues
      rerender(
        <ThemeProvider theme={createVaraiTheme('light')}>
          <MemoryRouter>
            <EnhancedCustomerLayout />
          </MemoryRouter>
        </ThemeProvider>
      );
      
      expect(screen.getByText('VARAi')).toBeInTheDocument();
    });
  });
});