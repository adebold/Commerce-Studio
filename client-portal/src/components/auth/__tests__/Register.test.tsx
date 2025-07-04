import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/utils';
import Register from '../Register';
import { useAuth } from '@/services/auth/AuthContext';

// Mock the useAuth hook
vi.mock('@/services/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Create a mock navigate function that we'll use consistently
const mockNavigate = vi.fn();

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Component', () => {
  const mockRegister = vi.fn();
  
  beforeEach(() => {
    // Setup the mock implementation for useAuth
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      register: mockRegister,
      isLoading: false
    });
    
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders register form correctly', () => {
    render(<Register />);
    
    // Check if important elements are in the document
    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByText(/Already have an account\? Sign in/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    // Try submitting without filling in fields
    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);
    
    // Register should not be called without required fields
    expect(mockRegister).not.toHaveBeenCalled();
    
    // Check for required field error messages
    expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    // Fill required fields
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    
    // Enter invalid email
    await user.type(screen.getByLabelText(/Email Address/i), 'invalid-email');
    await user.type(screen.getByLabelText(/Password/i), 'Password123!');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);
    
    // Register should not be called with invalid email
    expect(mockRegister).not.toHaveBeenCalled();
    
    // Check for email validation error
    expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    // Fill required fields
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'john.doe@example.com');
    
    // Enter weak password
    await user.type(screen.getByLabelText(/Password/i), 'weak');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);
    
    // Register should not be called with weak password
    expect(mockRegister).not.toHaveBeenCalled();
    
    // Check for password strength error
    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('calls register function with correct data when form is valid', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    // Fill in the form with valid data
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'StrongPass123!');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);
    
    // Check if register was called with correct parameters
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'John', 
        'Doe', 
        'john.doe@example.com', 
        'StrongPass123!'
      );
    });
  });

  it('shows error message when registration fails', async () => {
    // Setup mock to throw an error
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'));
    
    const user = userEvent.setup();
    render(<Register />);
    
    // Fill in the form with valid data
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'StrongPass123!');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    // Update mock to show loading state
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      register: mockRegister,
      isLoading: true
    });
    
    render(<Register />);
    
    // Check if submit button shows loading state
    const submitButton = screen.getByRole('button', { name: /Registering/i });
    expect(submitButton).toBeDisabled();
  });

  it('navigates to login page after successful registration', async () => {
    // Mock successful registration
    mockRegister.mockResolvedValueOnce(undefined);
    
    const user = userEvent.setup();
    render(<Register />);
    
    // Fill in the form with valid data
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Email Address/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'StrongPass123!');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Register/i });
    await user.click(submitButton);
    
    // Wait for registration to complete
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
    
    // Check if success message is displayed
    expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    
    // Check if navigation was triggered
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
