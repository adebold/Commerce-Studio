import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/utils';
import ForgotPassword from '../ForgotPassword';
import { useAuth } from '@/services/auth/AuthContext';

// Mock the useAuth hook
vi.mock('@/services/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ForgotPassword Component', () => {
  const mockForgotPassword = vi.fn();
  
  beforeEach(() => {
    // Setup the mock implementation for useAuth
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      forgotPassword: mockForgotPassword,
      isLoading: false
    });

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders forgot password form correctly', () => {
    render(<ForgotPassword />);
    
    // Check if important elements are in the document
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter your email address and we'll send you a link to reset your password./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
  });

  it('allows entering email address', async () => {
    const user = userEvent.setup();
    render(<ForgotPassword />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'test@example.com');
    
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('calls forgotPassword function when form is submitted with valid email', async () => {
    const user = userEvent.setup();
    render(<ForgotPassword />);
    
    // Fill in the form
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await user.click(submitButton);
    
    // Check if forgotPassword was called with correct parameter
    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success message after form submission', async () => {
    // Mock successful response
    mockForgotPassword.mockResolvedValueOnce(undefined);
    
    const user = userEvent.setup();
    render(<ForgotPassword />);
    
    // Fill in the form
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await user.click(submitButton);
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/Reset link sent! Check your email./i)).toBeInTheDocument();
    });
  });

  it('shows error message when forgotPassword fails', async () => {
    // Setup mock to throw an error
    mockForgotPassword.mockRejectedValueOnce(new Error('Email not found'));
    
    const user = userEvent.setup();
    render(<ForgotPassword />);
    
    // Fill in the form
    await user.type(screen.getByLabelText(/Email Address/i), 'nonexistent@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    await user.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to send reset link. Please try again./i)).toBeInTheDocument();
    });
  });
});
