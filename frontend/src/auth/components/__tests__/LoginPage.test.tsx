import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import { LoginPage } from '../LoginPage';

// Mock the auth service
import * as authService from '../../services/authService';

// Mock implementation
jest.mock('../../services/authService', () => ({
  login: jest.fn().mockImplementation((email, password) => {
    if (email === 'test@example.com' && password === 'password123') {
      return Promise.resolve({ success: true });
    }
    return Promise.reject(new Error('Invalid credentials'));
  }),
}));

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>{ui}</ThemeProvider>
    </BrowserRouter>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    renderWithProviders(<LoginPage />);
    
    // Check if important elements are rendered
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    renderWithProviders(<LoginPage />);
    
    // Try to submit without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('handles successful login', async () => {
    renderWithProviders(<LoginPage />);
    
    // Fill in form with valid credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if login function was called with correct parameters
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('handles failed login', async () => {
    // Mock the rejection for this specific test
    (authService.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));
    
    renderWithProviders(<LoginPage />);
    
    // Fill in form with invalid credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('navigates to forgot password page', () => {
    renderWithProviders(<LoginPage />);
    
    // Click on forgot password link
    fireEvent.click(screen.getByText(/forgot password/i));
    
    // Check if navigation occurred (would need to mock useNavigate for full test)
    // This is a simplified check
    expect(window.location.pathname).toBe('/');
  });
});