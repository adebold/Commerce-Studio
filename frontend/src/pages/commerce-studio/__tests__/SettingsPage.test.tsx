import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../../../design-system';
import SettingsPage from '../SettingsPage';
import { settingsService } from '../../../services/settings';

// Mock the settings service
jest.mock('../../../services/settings', () => ({
  settingsService: {
    getSettings: jest.fn().mockResolvedValue({
      account: {},
      integration: {},
      appearance: {},
      recommendation: {},
      notification: {},
    }),
  },
}));

// Mock the Outlet component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: () => <div data-testid="outlet-content">Outlet Content</div>,
  useLocation: () => ({ pathname: '/admin/settings/account' }),
  useNavigate: () => jest.fn(),
}));

// Mock theme for testing
jest.mock('../../../design-system/theme', () => ({
  colors: {
    primary: { 50: '#F5F7FF', 100: '#E5E7F0', 500: '#4C6FFF', 700: '#3B5BDB' },
    neutral: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 600: '#4B5563', 800: '#1F2937' },
    semantic: {
      error: { main: '#EF4444' },
    },
  },
  spacing: {
    spacing: {
      4: '4px',
      8: '8px',
      12: '12px',
      16: '16px',
      24: '24px',
    },
  },
  components: {
    card: {
      borderRadius: '8px',
    },
    button: {
      borderRadius: '4px',
    },
  },
  typography: {
    fontWeight: {
      regular: 400,
      medium: 500,
    },
  },
}));

describe('SettingsPage', () => {
  const renderWithThemeAndRouter = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/admin/settings/account']}>
          <Routes>
            <Route path="/admin/settings/*" element={ui} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders settings page with title', async () => {
    renderWithThemeAndRouter(<SettingsPage />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Configure your VARAi Commerce Studio integration and preferences.')).toBeInTheDocument();
  });

  test('renders settings navigation sidebar', async () => {
    renderWithThemeAndRouter(<SettingsPage />);
    
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText('Integration Settings')).toBeInTheDocument();
    expect(screen.getByText('Appearance Settings')).toBeInTheDocument();
    expect(screen.getByText('Recommendation Settings')).toBeInTheDocument();
    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
  });

  test('renders outlet content', async () => {
    renderWithThemeAndRouter(<SettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching settings', async () => {
    // Mock the settings service to delay response
    (settingsService.getSettings as jest.Mock).mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            account: {},
            integration: {},
            appearance: {},
            recommendation: {},
            notification: {},
          });
        }, 100);
      });
    });
    
    renderWithThemeAndRouter(<SettingsPage />);
    
    expect(screen.getByText('Loading settings...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading settings...')).not.toBeInTheDocument();
    });
  });

  test('calls settings service on mount', async () => {
    renderWithThemeAndRouter(<SettingsPage />);
    
    await waitFor(() => {
      expect(settingsService.getSettings).toHaveBeenCalledTimes(1);
    });
  });
});