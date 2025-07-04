import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/utils';
import ResetPassword from '../ResetPassword';
import { useAuth } from '@/services/auth/AuthContext';

// Mock the useAuth hook
vi.mock('@/services/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the useSearchParams hook from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => vi.fn(),
    useSearchParams: () => [
      {
        get: (param: string) => param === 'token' ? 'test-token-123' : null
      }
    ]
  };
});

describe('ResetPassword Component', () => {
  const mockResetPassword = vi.fn();
  
  beforeEach(() => {
    // Setup the mock implementation for useAuth
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      resetPassword: mockResetPassword,
      isLoading: false
    });

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders reset password form correctly', () => {
    render(<ResetPassword />);
    
    // Check if important elements are in the document
    expect(screen.getByRole('heading', { name: /Set New Password/i })).toBeInTheDocument();
    expect(screen.getByText(/Enter your new password below/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
  });

  it('allows entering new password', async () => {
    const user = userEvent.setup();
    render(<ResetPassword />);
    
    // Get password inputs by name attribute
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    // Ensure we found the inputs
    expect(passwordInput).not.toBeNull();
    expect(confirmPasswordInput).not.toBeNull();
    
    if (passwordInput && confirmPasswordInput) {
      await user.type(passwordInput, 'newPassword123');
      await user.type(confirmPasswordInput, 'newPassword123');
      
      expect(passwordInput).toHaveValue('newPassword123');
      expect(confirmPasswordInput).toHaveValue('newPassword123');
    }
  });

  it('validates password match before submission', async () => {
    const user = userEvent.setup();
    render(<ResetPassword />);
    
    // Get password inputs by name attribute
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    // Ensure we found the inputs
    expect(passwordInput).not.toBeNull();
    expect(confirmPasswordInput).not.toBeNull();
    
    if (passwordInput && confirmPasswordInput) {
      // Enter mismatched passwords
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password456');
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Reset Password/i });
      await user.click(submitButton);
      
      // Check if error message is displayed
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      
      // Verify resetPassword was not called
      expect(mockResetPassword).not.toHaveBeenCalled();
    }
  });

  it('calls resetPassword function when form is submitted with matching passwords', async () => {
    const user = userEvent.setup();
    render(<ResetPassword />);
    
    // Get password inputs by name attribute
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    // Ensure we found the inputs
    expect(passwordInput).not.toBeNull();
    expect(confirmPasswordInput).not.toBeNull();
    
    if (passwordInput && confirmPasswordInput) {
      // Enter matching passwords
      await user.type(passwordInput, 'newPassword123');
      await user.type(confirmPasswordInput, 'newPassword123');
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Reset Password/i });
      await user.click(submitButton);
      
      // Check if resetPassword was called with correct parameters
      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test-token-123', 'newPassword123');
      });
    }
  });

  it('shows success message after successful reset', async () => {
    // Mock successful response
    mockResetPassword.mockResolvedValueOnce(undefined);
    
    const user = userEvent.setup();
    render(<ResetPassword />);
    
    // Get password inputs by name attribute
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    // Ensure we found the inputs
    expect(passwordInput).not.toBeNull();
    expect(confirmPasswordInput).not.toBeNull();
    
    if (passwordInput && confirmPasswordInput) {
      // Enter matching passwords
      await user.type(passwordInput, 'newPassword123');
      await user.type(confirmPasswordInput, 'newPassword123');
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Reset Password/i });
      await user.click(submitButton);
      
      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/Password reset successful!/i)).toBeInTheDocument();
      });
    }
  });

  it('shows error message when resetPassword fails', async () => {
    // Setup mock to throw an error
    mockResetPassword.mockRejectedValueOnce(new Error('Invalid or expired token'));
    
    const user = userEvent.setup();
    render(<ResetPassword />);
    
    // Get password inputs by name attribute
    const passwordInput = document.querySelector('input[name="password"]');
    const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
    
    // Ensure we found the inputs
    expect(passwordInput).not.toBeNull();
    expect(confirmPasswordInput).not.toBeNull();
    
    if (passwordInput && confirmPasswordInput) {
      // Enter matching passwords
      await user.type(passwordInput, 'newPassword123');
      await user.type(confirmPasswordInput, 'newPassword123');
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Reset Password/i });
      await user.click(submitButton);
      
      // Check if error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Failed to reset password. The link may have expired./i)).toBeInTheDocument();
      });
    }
  });
});
