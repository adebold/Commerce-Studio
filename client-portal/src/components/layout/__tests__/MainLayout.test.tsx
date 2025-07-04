import { describe, expect, it, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/utils';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import MainLayout from '../MainLayout';
import { useAuth } from '@/services/auth/AuthContext';

// Create a mock navigate function
const mockNavigate = vi.fn();

// Mock the useAuth hook
vi.mock('@/services/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock the react-router-dom hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Outlet: () => <div data-testid="outlet-content">Outlet Content</div>
  };
});

// Mock for useMediaQuery (for mobile tests)
const mockUseMediaQuery = vi.fn().mockReturnValue(false); // Default to desktop view

// Mock @mui/material hooks
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => mockUseMediaQuery()
  };
});

// Create a simple theme for testing
const theme = createTheme();

// Create a wrapper with providers
const renderWithProviders = (ui: React.ReactElement, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </MemoryRouter>
  );
};

describe('MainLayout Component', () => {
  const mockLogout = vi.fn();
  
  beforeEach(() => {
    // Setup the mock implementation for useAuth
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
      },
      isAuthenticated: true,
      logout: mockLogout
    });
    
    // Reset mocks
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUseMediaQuery.mockReturnValue(false); // Reset to desktop
  });

  it('renders layout with all key elements', () => {
    renderWithProviders(<MainLayout />);
    
    // Check for main layout elements
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Nav
    expect(screen.getByRole('main')).toBeInTheDocument(); // Main content area
    
    // Check for logo/brand
    expect(screen.getByText('EyewearML')).toBeInTheDocument();
    
    // Check for navigation items
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Reports/i)).toBeInTheDocument();
    
    // Check for user info
    expect(screen.getByText('JD')).toBeInTheDocument(); // User initials
  });
  
  it('renders outlet content', () => {
    renderWithProviders(<MainLayout />);
    
    // Check if outlet content is rendered
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
  });

  it('opens user menu when avatar is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);
    
    // User menu should be closed initially
    expect(screen.queryByText('Profile')).not.toBeVisible();
    expect(screen.queryByText('Logout')).not.toBeVisible();
    
    // Click user avatar to open menu
    const avatar = screen.getByText('JD');
    await user.click(avatar);
    
    // Check if menu is now visible
    await waitFor(() => {
      expect(screen.getByText(/Profile/i)).toBeVisible();
      expect(screen.getByText(/Logout/i)).toBeVisible();
    });
  });
  
  it('navigates to profile when profile menu item is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);
    
    // Click user avatar to open menu
    const avatar = screen.getByText('JD');
    await user.click(avatar);
    
    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText(/Profile/i)).toBeVisible();
    });
    
    // Click Profile option
    await user.click(screen.getByText(/Profile/i));
    
    // Check if navigation function was called with correct route
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });
  
  it('calls logout when logout menu item is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);
    
    // Click user avatar to open menu
    const avatar = screen.getByText('JD');
    await user.click(avatar);
    
    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText(/Logout/i)).toBeVisible();
    });
    
    // Click Logout option
    await user.click(screen.getByText(/Logout/i));
    
    // Check if logout function was called
    expect(mockLogout).toHaveBeenCalled();
    
    // Check if navigation function was called with login route
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
  
  it('navigates to dashboard when dashboard link is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);
    
    // Click Dashboard link
    await user.click(screen.getByText(/Dashboard/i));
    
    // Check if navigation function was called with correct route
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
  
  it('navigates to reports when reports link is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainLayout />);
    
    // Click Reports link
    await user.click(screen.getByText(/Reports/i));
    
    // Check if navigation function was called with correct route
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });
  
  it('highlights active navigation item based on current route', () => {
    // Render with specific route
    renderWithProviders(<MainLayout />, { route: '/reports' });
    
    // Find the reports link
    const reportsLink = screen.getByText(/Reports/i).closest('div');
    
    // Check if it has active style (this might need adjustment based on your implementation)
    expect(reportsLink).toHaveAttribute('aria-selected', 'true');
    
    // Dashboard link should not be active
    const dashboardLink = screen.getByText(/Dashboard/i).closest('div');
    expect(dashboardLink).not.toHaveAttribute('aria-selected', 'true');
  });
  
  describe('Mobile Responsive Behavior', () => {
    beforeEach(() => {
      // Mock media query to return true for mobile
      mockUseMediaQuery.mockReturnValue(true);
    });
    
    it('shows mobile menu button on small screens', () => {
      renderWithProviders(<MainLayout />);
      
      // Check if menu button is visible
      const menuButton = screen.getByLabelText(/open drawer/i);
      expect(menuButton).toBeInTheDocument();
    });
    
    it('opens drawer when menu button is clicked on mobile', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MainLayout />);
      
      // Click menu button
      const menuButton = screen.getByLabelText(/open drawer/i);
      await user.click(menuButton);
      
      // After clicking, drawer should be opened (implementation specific)
      // This might need adjustment based on how your drawer is implemented
      expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/Reports/i)).toBeInTheDocument();
    });
  });
  
  describe('Accessibility', () => {
    it('has correct semantic structure', () => {
      renderWithProviders(<MainLayout />);
      
      // Check for semantic HTML elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Nav
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    });
    
    it('allows keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<MainLayout />);
      
      // Focus should start at the beginning of the document
      await user.tab();
      
      // First interactive element should be focused
      // This might be different based on your implementation
      expect(document.activeElement).not.toBe(document.body);
      
      // Continue tabbing and verify focus moves as expected
      await user.tab();
      expect(document.activeElement).not.toBe(document.body);
    });
  });
});
