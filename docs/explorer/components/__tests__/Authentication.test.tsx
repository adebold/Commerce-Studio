import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Authentication, { AuthMethod } from '../Authentication';
import { ThemeProvider } from '../../../../frontend/src/design-system/ThemeProvider';

// Mock the onChange handler
const mockOnChange = jest.fn();

// Setup function to render the component with theme
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
};

describe('Authentication Component', () => {
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders correctly with default props', () => {
    renderWithTheme(<Authentication onChange={mockOnChange} />);
    
    // Check if the component title is rendered
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    
    // Check if all authentication methods are rendered
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('API Key')).toBeInTheDocument();
    expect(screen.getByText('OAuth 2.0')).toBeInTheDocument();
    expect(screen.getByText('JWT')).toBeInTheDocument();
  });

  it('renders with initial config', () => {
    const initialConfig = {
      method: AuthMethod.API_KEY,
      apiKey: 'process.env.API_KEY_250'
    };
    
    renderWithTheme(
      <Authentication 
        onChange={mockOnChange} 
        initialConfig={initialConfig} 
      />
    );
    
    // API Key method should be active
    const apiKeyButton = screen.getByText('API Key');
    expect(apiKeyButton).toHaveStyle({ opacity: '1' });
    
    // API Key input should be visible and have the initial value
    const apiKeyInput = screen.getByLabelText('API Key');
    expect(apiKeyInput).toBeInTheDocument();
    expect(apiKeyInput).toHaveValue('process.env.API_KEY_250');
  });

  it('changes authentication method when clicked', () => {
    renderWithTheme(<Authentication onChange={mockOnChange} />);
    
    // Initially, 'None' should be selected
    const noneButton = screen.getByText('None');
    expect(noneButton).toHaveStyle({ opacity: '1' });
    
    // Click on API Key button
    const apiKeyButton = screen.getByText('API Key');
    fireEvent.click(apiKeyButton);
    
    // onChange should be called with the new method
    expect(mockOnChange).toHaveBeenCalledWith({
      method: AuthMethod.API_KEY
    });
    
    // API Key input should be visible
    expect(screen.getByLabelText('API Key')).toBeInTheDocument();
  });

  it('updates API key when input changes', () => {
    renderWithTheme(
      <Authentication 
        onChange={mockOnChange} 
        initialConfig={{ method: AuthMethod.API_KEY }}
      />
    );
    
    // Find the API Key input
    const apiKeyInput = screen.getByLabelText('API Key');
    
    // Change the input value
    fireEvent.change(apiKeyInput, { target: { value: 'process.env.API_KEY_251' } });
    
    // onChange should be called with the updated API key
    expect(mockOnChange).toHaveBeenCalledWith({
      method: AuthMethod.API_KEY,
      apiKey: 'process.env.API_KEY_251'
    });
  });

  it('shows OAuth fields when OAuth method is selected', () => {
    renderWithTheme(<Authentication onChange={mockOnChange} />);
    
    // Click on OAuth button
    const oauthButton = screen.getByText('OAuth 2.0');
    fireEvent.click(oauthButton);
    
    // OAuth fields should be visible
    expect(screen.getByLabelText('Client ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Client Secret')).toBeInTheDocument();
    expect(screen.getByText('Authorize')).toBeInTheDocument();
  });

  it('shows JWT field when JWT method is selected', () => {
    renderWithTheme(<Authentication onChange={mockOnChange} />);
    
    // Click on JWT button
    const jwtButton = screen.getByText('JWT');
    fireEvent.click(jwtButton);
    
    // JWT field should be visible
    expect(screen.getByLabelText('JWT Token')).toBeInTheDocument();
  });

  it('disables the Authorize button when OAuth fields are empty', () => {
    renderWithTheme(<Authentication onChange={mockOnChange} />);
    
    // Click on OAuth button
    const oauthButton = screen.getByText('OAuth 2.0');
    fireEvent.click(oauthButton);
    
    // Authorize button should be disabled
    const authorizeButton = screen.getByText('Authorize');
    expect(authorizeButton).toBeDisabled();
  });

  it('enables the Authorize button when OAuth fields are filled', () => {
    renderWithTheme(
      <Authentication 
        onChange={mockOnChange} 
        initialConfig={{ 
          method: AuthMethod.OAUTH,
          clientId: 'client-id',
          clientSecret: 'process.env.AUTHENTICATION_SECRET'
        }}
      />
    );
    
    // Authorize button should be enabled
    const authorizeButton = screen.getByText('Authorize');
    expect(authorizeButton).not.toBeDisabled();
  });
});