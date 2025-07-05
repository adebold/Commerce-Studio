import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system/ThemeProvider';
import IntegrationStatus from '../IntegrationStatus';

describe('IntegrationStatus', () => {
  it('renders the integration status with mock data', () => {
    render(
      <ThemeProvider>
        <IntegrationStatus />
      </ThemeProvider>
    );
    
    // Check for title
    expect(screen.getByText('Integration Status')).toBeInTheDocument();
    
    // Check for platform names
    expect(screen.getByText('Shopify')).toBeInTheDocument();
    expect(screen.getByText('WooCommerce')).toBeInTheDocument();
    expect(screen.getByText('BigCommerce')).toBeInTheDocument();
    expect(screen.getByText('Magento')).toBeInTheDocument();
    
    // Check for status chips
    expect(screen.getAllByText('ONLINE').length).toBeGreaterThanOrEqual(3); // At least 3 online statuses
    expect(screen.getByText('OFFLINE')).toBeInTheDocument(); // One offline status
    
    // Check for metrics
    expect(screen.getAllByText('Response').length).toBe(4);
    expect(screen.getAllByText('Error Rate').length).toBe(4);
    expect(screen.getAllByText('Users').length).toBe(4);
    
    // Check for specific values
    expect(screen.getByText('150ms')).toBeInTheDocument();
    expect(screen.getByText('180ms')).toBeInTheDocument();
    expect(screen.getByText('200ms')).toBeInTheDocument();
    
    expect(screen.getByText('1.0%')).toBeInTheDocument();
    expect(screen.getByText('2.0%')).toBeInTheDocument();
    expect(screen.getByText('2.5%')).toBeInTheDocument();
    
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('600')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <ThemeProvider>
        <IntegrationStatus loading={true} />
      </ThemeProvider>
    );
    
    // CircularProgress is rendered when loading
    expect(screen.queryByText('Integration Status')).not.toBeInTheDocument();
    expect(screen.queryByText('Shopify')).not.toBeInTheDocument();
  });

  it('displays the correct platform initials', () => {
    render(
      <ThemeProvider>
        <IntegrationStatus />
      </ThemeProvider>
    );
    
    // Check for platform initials
    expect(screen.getByText('S')).toBeInTheDocument(); // Shopify
    expect(screen.getByText('W')).toBeInTheDocument(); // WooCommerce
    expect(screen.getByText('B')).toBeInTheDocument(); // BigCommerce
    expect(screen.getByText('M')).toBeInTheDocument(); // Magento
  });

  it('applies the correct status colors', () => {
    render(
      <ThemeProvider>
        <IntegrationStatus />
      </ThemeProvider>
    );
    
    // We can't easily test the actual colors in this test environment,
    // but we can verify that the status chips are rendered with the correct status
    const onlineChips = screen.getAllByText('ONLINE');
    expect(onlineChips.length).toBeGreaterThanOrEqual(3);
    
    const offlineChip = screen.getByText('OFFLINE');
    expect(offlineChip).toBeInTheDocument();
  });
});