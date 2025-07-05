import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/utils';
import Login from '../Login';
import { useAuth } from '@/services/auth/AuthContext';

// Mock the useAuth hook
vi.mock('@/services/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ 
      state: { from: { pathname: '/dashboard' } } 
    })
  };
});

describe('Login Component', () => {
  const mockLogin = vi.fn();
  
  beforeEach(() => {
    // Setup the mock implementation for useAuth
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false
    });
  });

  it('renders login form correctly', () => {
    render(<Login />);
    
    // Check if important elements are in the document
    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Forgot password?/i)).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account\? Sign up/i)).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    // Try submitting without filling in fields
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitButton);
    
    // Login should not be called without required fields
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function with correct credentials when form is submitted', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    // Fill in the form
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitButton);
    
    // Check if login was called with correct parameters
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows error message when login fails', async () => {
    // Setup mock to throw an error
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    const user = userEvent.setup();
    render(<Login />);
    
    // Fill in the form
    await user.type(screen.getByLabelText(/Email Address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'wrongpassword');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    await user.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });
});
