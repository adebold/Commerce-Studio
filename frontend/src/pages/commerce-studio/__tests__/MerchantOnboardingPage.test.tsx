import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MerchantOnboardingPage from '../MerchantOnboardingPage';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock the onboarding components
jest.mock('../../../components/merchant-onboarding/PlatformSelection', () => ({
  __esModule: true,
  default: ({ selectedPlatform, onPlatformSelect }: { selectedPlatform: string, onPlatformSelect: (platform: string) => void }) => (
    <div data-testid="platform-selection">
      <div>Selected Platform: {selectedPlatform}</div>
      <button onClick={() => onPlatformSelect('shopify')}>Select Shopify</button>
      <button onClick={() => onPlatformSelect('magento')}>Select Magento</button>
    </div>
  )
}));

jest.mock('../../../components/merchant-onboarding/AccountSetup', () => ({
  __esModule: true,
  default: ({ email, password, confirmPassword, onInputChange }: { 
    email: string, 
    password: string, 
    confirmPassword: string, 
    onInputChange: (field: string, value: unknown) => void 
  }) => (
    <div data-testid="account-setup">
      <input 
        data-testid="email-input" 
        value={email} 
        onChange={(e) => onInputChange('email', e.target.value)} 
      />
      <input 
        data-testid="password-input" 
        type="password"
        value={password} 
        onChange={(e) => onInputChange('password', e.target.value)} 
      />
      <input 
        data-testid="confirm-password-input" 
        type="password"
        value={confirmPassword} 
        onChange={(e) => onInputChange('confirmPassword', e.target.value)} 
      />
    </div>
  )
}));

jest.mock('../../../components/merchant-onboarding/StoreConfiguration', () => ({
  __esModule: true,
  default: ({ storeName, storeUrl, platform, onInputChange }: { 
    storeName: string, 
    storeUrl: string, 
    platform: string, 
    onInputChange: (field: string, value: unknown) => void 
  }) => (
    <div data-testid="store-configuration">
      <div>Platform: {platform}</div>
      <input 
        data-testid="store-name-input" 
        value={storeName} 
        onChange={(e) => onInputChange('storeName', e.target.value)} 
      />
      <input 
        data-testid="store-url-input" 
        value={storeUrl} 
        onChange={(e) => onInputChange('storeUrl', e.target.value)} 
      />
    </div>
  )
}));

jest.mock('../../../components/merchant-onboarding/IntegrationSetup', () => ({
  __esModule: true,
  default: ({ platform, apiKey, apiSecret, onInputChange }: { 
    platform: string, 
    apiKey: string, 
    apiSecret: string, 
    onInputChange: (field: string, value: unknown) => void 
  }) => (
    <div data-testid="integration-setup">
      <div>Platform: {platform}</div>
      <input 
        data-testid="api-key-input" 
        value={apiKey} 
        onChange={(e) => onInputChange('apiKey', e.target.value)} 
      />
      <input 
        data-testid="api-secret-input" 
        value={apiSecret} 
        onChange={(e) => onInputChange('apiSecret', e.target.value)} 
      />
    </div>
  )
}));

jest.mock('../../../components/merchant-onboarding/FinalVerification', () => ({
  __esModule: true,
  default: ({ onboardingData }: { onboardingData: Record<string, unknown> }) => (
    <div data-testid="final-verification">
      <div>Platform: {onboardingData.platform as string}</div>
      <div>Store Name: {onboardingData.storeName as string}</div>
      <div>Email: {onboardingData.email as string}</div>
    </div>
  )
}));

describe('MerchantOnboardingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the onboarding page with initial step', () => {
    render(
      <MemoryRouter>
        <MerchantOnboardingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Merchant Onboarding')).toBeInTheDocument();
    expect(screen.getByTestId('platform-selection')).toBeInTheDocument();
    expect(screen.getByText('Platform Selection')).toBeInTheDocument();
  });

  it('navigates through all steps and completes onboarding', async () => {
    render(
      <MemoryRouter>
        <MerchantOnboardingPage />
      </MemoryRouter>
    );

    // Step 1: Platform Selection
    expect(screen.getByTestId('platform-selection')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Select Shopify'));
    
    // Next button should be enabled after platform selection
    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);

    // Step 2: Account Setup
    expect(screen.getByTestId('account-setup')).toBeInTheDocument();
    
    // Fill in account details
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'Password123!' } });
    
    // Go to next step
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Store Configuration
    expect(screen.getByTestId('store-configuration')).toBeInTheDocument();
    expect(screen.getByText('Platform: shopify')).toBeInTheDocument();
    
    // Fill in store details
    fireEvent.change(screen.getByTestId('store-name-input'), { target: { value: 'Test Store' } });
    fireEvent.change(screen.getByTestId('store-url-input'), { target: { value: 'test-store.myshopify.com' } });
    
    // Go to next step
    fireEvent.click(screen.getByText('Next'));

    // Step 4: Integration Setup
    expect(screen.getByTestId('integration-setup')).toBeInTheDocument();
    expect(screen.getByText('Platform: shopify')).toBeInTheDocument();
    
    // Fill in API key and secret
    fireEvent.change(screen.getByTestId('api-key-input'), { target: { value: 'test-api-key' } });
    fireEvent.change(screen.getByTestId('api-secret-input'), { target: { value: 'test-api-secret' } });
    
    // Go to next step
    fireEvent.click(screen.getByText('Next'));

    // Step 5: Final Verification
    expect(screen.getByTestId('final-verification')).toBeInTheDocument();
    expect(screen.getByText('Platform: shopify')).toBeInTheDocument();
    expect(screen.getByText('Store Name: Test Store')).toBeInTheDocument();
    expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    
    // Complete onboarding
    fireEvent.click(screen.getByText('Complete'));
    
    // Wait for navigation to occur
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/commerce-studio/dashboard');
    });
  });

  it('disables the Next button when required fields are not filled', () => {
    render(
      <MemoryRouter>
        <MerchantOnboardingPage />
      </MemoryRouter>
    );

    // Next button should be disabled initially
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();

    // Select a platform
    fireEvent.click(screen.getByText('Select Shopify'));
    
    // Next button should be enabled now
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);

    // In Account Setup step, Next should be disabled until all fields are filled
    expect(nextButton).toBeDisabled();
    
    // Fill email only
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    expect(nextButton).toBeDisabled();
    
    // Fill password
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'Password123!' } });
    expect(nextButton).toBeDisabled();
    
    // Fill confirm password with different value
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'DifferentPassword' } });
    expect(nextButton).toBeDisabled();
    
    // Fix confirm password
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'Password123!' } });
    expect(nextButton).not.toBeDisabled();
  });

  it('allows going back to previous steps', () => {
    render(
      <MemoryRouter>
        <MerchantOnboardingPage />
      </MemoryRouter>
    );

    // Go to step 2
    fireEvent.click(screen.getByText('Select Shopify'));
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByTestId('account-setup')).toBeInTheDocument();
    
    // Go back to step 1
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByTestId('platform-selection')).toBeInTheDocument();
  });

  it('preserves data when navigating between steps', () => {
    render(
      <MemoryRouter>
        <MerchantOnboardingPage />
      </MemoryRouter>
    );

    // Step 1: Select platform
    fireEvent.click(screen.getByText('Select Shopify'));
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Fill account details
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByTestId('confirm-password-input'), { target: { value: 'Password123!' } });
    
    // Go back to step 1
    fireEvent.click(screen.getByText('Back'));
    
    // Verify platform selection is preserved
    expect(screen.getByText('Selected Platform: shopify')).toBeInTheDocument();
    
    // Go forward to step 2 again
    fireEvent.click(screen.getByText('Next'));
    
    // Verify account details are preserved
    expect(screen.getByTestId('email-input')).toHaveValue('test@example.com');
    expect(screen.getByTestId('password-input')).toHaveValue('Password123!');
    expect(screen.getByTestId('confirm-password-input')).toHaveValue('Password123!');
  });
});