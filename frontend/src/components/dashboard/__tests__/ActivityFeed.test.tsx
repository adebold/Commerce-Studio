import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../../design-system';
import ActivityFeed from '../ActivityFeed';

describe('ActivityFeed', () => {
  it('renders the activity feed with mock data', () => {
    render(
      <ThemeProvider>
        <ActivityFeed />
      </ThemeProvider>
    );
    
    // Check for title
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    
    // Check for activity items
    expect(screen.getByText('New Order Received')).toBeInTheDocument();
    expect(screen.getByText('Order #12345 for $249.99 was placed')).toBeInTheDocument();
    
    expect(screen.getByText('New Customer Registered')).toBeInTheDocument();
    expect(screen.getByText('jane.doe@example.com created an account')).toBeInTheDocument();
    
    expect(screen.getByText('Product Stock Update')).toBeInTheDocument();
    expect(screen.getByText('Classic Frames inventory updated to 24 units')).toBeInTheDocument();
    
    expect(screen.getByText('Shopify Integration Updated')).toBeInTheDocument();
    expect(screen.getByText('API connection refreshed successfully')).toBeInTheDocument();
    
    expect(screen.getByText('Order Shipped')).toBeInTheDocument();
    expect(screen.getByText('Order #12340 was shipped via Express Delivery')).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <ThemeProvider>
        <ActivityFeed loading={true} />
      </ThemeProvider>
    );
    
    // CircularProgress is rendered when loading
    expect(screen.queryByText('Recent Activity')).not.toBeInTheDocument();
    expect(screen.queryByText('New Order Received')).not.toBeInTheDocument();
  });

  it('displays the correct activity icons', () => {
    render(
      <ThemeProvider>
        <ActivityFeed />
      </ThemeProvider>
    );
    
    // Check for activity icons
    const orderIcons = screen.getAllByText('$');
    expect(orderIcons.length).toBeGreaterThanOrEqual(2); // There are at least 2 order activities
    
    expect(screen.getByText('C')).toBeInTheDocument(); // Customer icon
    expect(screen.getByText('P')).toBeInTheDocument(); // Product icon
    expect(screen.getByText('I')).toBeInTheDocument(); // Integration icon
  });

  it('formats timestamps correctly', () => {
    // Mock Date.now to return a fixed timestamp
    const originalDateNow = Date.now;
    const mockNow = new Date('2025-04-29T15:00:00Z').getTime();
    
    global.Date.now = jest.fn(() => mockNow);
    
    render(
      <ThemeProvider>
        <ActivityFeed />
      </ThemeProvider>
    );
    
    // Check for time ago formatting
    expect(screen.getByText('15m ago')).toBeInTheDocument();
    expect(screen.getByText('45m ago')).toBeInTheDocument();
    expect(screen.getByText('2h ago')).toBeInTheDocument();
    expect(screen.getByText('3h ago')).toBeInTheDocument();
    expect(screen.getByText('4h ago')).toBeInTheDocument();
    
    // Restore original Date.now
    global.Date.now = originalDateNow;
  });
});