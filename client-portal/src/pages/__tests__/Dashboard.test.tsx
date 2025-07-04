import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import Dashboard from '../Dashboard';

// Mock the useAuth hook since Dashboard might use auth-related functionality
vi.mock('@/services/auth/AuthContext', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: {
      firstName: 'Test',
      lastName: 'User'
    },
    isAuthenticated: true
  }),
}));

describe('Dashboard Component', () => {
  it('renders dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('renders dashboard cards', () => {
    render(<Dashboard />);
    
    // Check that the main dashboard card sections are rendered
    expect(screen.getAllByRole('heading', { level: 6 }).find(el => el.textContent === 'Recent Activity')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 6 }).find(el => el.textContent === 'Recommendations')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 6 }).find(el => el.textContent === 'Quick Stats')).toBeInTheDocument();
  });

  it('displays empty state messages when no data is available', () => {
    render(<Dashboard />);
    
    // Check empty state messages
    expect(screen.getByText(/No recent activity found/i)).toBeInTheDocument();
    expect(screen.getByText(/No recommendations available/i)).toBeInTheDocument();
    expect(screen.getByText(/No statistics available yet/i)).toBeInTheDocument();
  });

  // Additional tests for when data is loaded can be added when the dashboard is enhanced with actual data
});
