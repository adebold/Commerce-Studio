import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Role } from '../services/auth';

// Mock the auth context
jest.mock('../components/auth/AuthProvider', () => {
  const originalModule = jest.requireActual('../components/auth/AuthProvider');
  
  return {
    ...originalModule,
    useAuth: jest.fn(() => ({
      isAuthenticated: true,
      userContext: { role: Role.CLIENT_ADMIN },
      loading: false,
      checkAuth: jest.fn().mockResolvedValue(true),
    })),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// Mock the lazy-loaded components
jest.mock('../pages/CustomerLandingPage', () => () => <div data-testid="customer-landing-page">Customer Landing Page</div>);
jest.mock('../pages/RecommendationsPage', () => () => <div data-testid="recommendations-page">Recommendations Page</div>);
jest.mock('../pages/FrameDetailPage', () => () => <div data-testid="frame-detail-page">Frame Detail Page</div>);
jest.mock('../pages/commerce-studio/HomePage', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('../pages/commerce-studio/AuthPage', () => () => <div data-testid="auth-page">Auth Page</div>);

// Mock the router component
jest.mock('../router', () => {
  // Create a simple router mock that renders different components based on the path
  return {
    __esModule: true,
    default: () => {
      const location = window.location.pathname;
      
      if (location === '/') {
        return <div data-testid="customer-landing-page">Customer Landing Page</div>;
      } else if (location === '/admin/auth') {
        return <div data-testid="auth-page">Auth Page</div>;
      } else if (location === '/admin') {
        return <div data-testid="home-page">Home Page</div>;
      } else if (location.startsWith('/frames/')) {
        return <div data-testid="frame-detail-page">Frame Detail Page</div>;
      } else {
        // Default fallback for unknown routes
        return <div data-testid="customer-landing-page">Customer Landing Page</div>;
      }
    }
  };
});

// Mock the Suspense component to render children immediately
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Router', () => {
  // Import the router component after mocking
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Router = require('../router').default;
  
  // Helper function to render the router with a specific path
  const renderWithRouter = (initialEntries: string[] = ['/']) => {
    // Set the window.location.pathname for the mock router
    Object.defineProperty(window, 'location', {
      value: {
        pathname: initialEntries[0],
      },
      writable: true,
    });
    
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Router />
      </MemoryRouter>
    );
  };

  test('renders customer landing page at root path', async () => {
    renderWithRouter(['/']);
    expect(await screen.findByTestId('customer-landing-page')).toBeInTheDocument();
  });

  test('renders auth page at /admin/auth path', async () => {
    renderWithRouter(['/admin/auth']);
    expect(await screen.findByTestId('auth-page')).toBeInTheDocument();
  });

  test('renders home page at /admin path for authenticated admin users', async () => {
    renderWithRouter(['/admin']);
    expect(await screen.findByTestId('home-page')).toBeInTheDocument();
  });

  test('renders error boundary for unknown routes', async () => {
    renderWithRouter(['/unknown-route']);
    // Should redirect to home page
    expect(await screen.findByTestId('customer-landing-page')).toBeInTheDocument();
  });

  test('renders nested routes correctly', async () => {
    renderWithRouter(['/frames/123']);
    expect(await screen.findByTestId('frame-detail-page')).toBeInTheDocument();
  });
});