import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import { AuthProvider } from '../AuthProvider';
import { authService } from '../../../services/auth';

// Mock the auth service
jest.mock('../../../services/auth', () => {
  const originalModule = jest.requireActual('../../../services/auth');
  
  return {
    ...originalModule,
    authService: {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn(),
      getToken: jest.fn(),
      isTokenValid: jest.fn()
    }
  };
});

describe('LoginForm', () => {
  const mockOnLoginSuccess = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render the login form with email option selected by default', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Check for radio buttons
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    
    // Email should be selected by default
    expect(screen.getByLabelText(/email/i)).toBeChecked();
    
    // Check for input fields and button
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    
    // Check for demo account information
    expect(screen.getByText(/use one of the following demo accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/username: admin \(super admin\)/i)).toBeInTheDocument();
  });
  
  it('should switch between email and username login methods', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Initially should show Email Address field
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    
    // Switch to username
    userEvent.click(screen.getByLabelText(/username/i));
    
    // Should now show Username field
    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeChecked();
      expect(screen.getByLabelText(/username$/i)).toBeInTheDocument();
    });
    
    // Switch back to email
    userEvent.click(screen.getByLabelText(/email/i));
    
    // Should show Email Address field again
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeChecked();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });
  });
  
  it('should validate email input when email method is selected', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Try to submit with empty fields
    userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Enter invalid email
    userEvent.type(screen.getByLabelText(/email address/i), 'invalid-email');
    
    // Check for email validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
    
    // Enter valid email but short password
    userEvent.clear(screen.getByLabelText(/email address/i));
    userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), '12345');
    
    // Check for password validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    
    // Verify login was not called
    expect(authService.login).not.toHaveBeenCalled();
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
  
  it('should validate username input when username method is selected', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Switch to username login
    userEvent.click(screen.getByLabelText(/username/i));
    
    // Try to submit with empty fields
    userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Enter username but short password
    userEvent.type(screen.getByLabelText(/username$/i), 'admin');
    userEvent.type(screen.getByLabelText(/password/i), '12345');
    
    // Check for password validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    
    // Verify login was not called
    expect(authService.login).not.toHaveBeenCalled();
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
  
  it('should submit the form with valid email credentials', async () => {
    // Mock successful login
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'mock-token',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'CLIENT_ADMIN'
      }
    });
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Enter valid credentials
    userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'process.env.LOGINFORM_SECRET_1');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'process.env.LOGINFORM_SECRET_1'
      });
    });
    
    // Check that onLoginSuccess was called
    expect(mockOnLoginSuccess).toHaveBeenCalled();
  });
  
  it('should submit the form with valid username credentials', async () => {
    // Mock successful login
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'mock-token',
      user: {
        id: 'user-123',
        username: 'admin',
        role: 'SUPER_ADMIN'
      }
    });
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Switch to username login
    userEvent.click(screen.getByLabelText(/username/i));
    
    // Enter valid credentials
    userEvent.type(screen.getByLabelText(/username$/i), 'admin');
    userEvent.type(screen.getByLabelText(/password/i), 'process.env.LOGINFORM_SECRET_1');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for login to complete
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'admin', // The AuthProvider passes emailOrUsername as the email parameter
        password: 'process.env.LOGINFORM_SECRET_1'
      });
    });
    
    // Check that onLoginSuccess was called
    expect(mockOnLoginSuccess).toHaveBeenCalled();
  });
  
  it('should display error message on login failure', async () => {
    // Mock failed login
    (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Enter credentials
    userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    userEvent.type(screen.getByLabelText(/password/i), 'process.env.LOGINFORM_SECRET_1');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for login to fail
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalled();
    });
    
    // Check for error message
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    
    // Check that onLoginSuccess was not called
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();
  });
  
  it('should toggle password visibility', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginForm onLoginSuccess={mockOnLoginSuccess} />
        </AuthProvider>
      </MemoryRouter>
    );
    
    // Password field should be of type password initially
    const passwordField = screen.getByLabelText(/password/i);
    expect(passwordField).toHaveAttribute('type', 'password');
    
    // Click the visibility toggle button
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    userEvent.click(toggleButton);
    
    // Password field should now be of type text
    await waitFor(() => {
      expect(passwordField).toHaveAttribute('type', 'text');
    });
    
    // Click the toggle button again
    userEvent.click(toggleButton);
    
    // Password field should be back to type password
    await waitFor(() => {
      expect(passwordField).toHaveAttribute('type', 'password');
    });
  });
});