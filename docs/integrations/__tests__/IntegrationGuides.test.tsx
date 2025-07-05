import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../../frontend/src/design-system/ThemeProvider';
import IntegrationGuides from '../index';

// Mock the components that are used in IntegrationGuides
jest.mock('../components', () => ({
  StepByStepGuide: ({ title, steps }) => (
    <div data-testid="step-by-step-guide">
      <h3>{title}</h3>
      <ul>
        {steps.map((step, index) => (
          <li key={index}>{step.title}</li>
        ))}
      </ul>
    </div>
  ),
  CodeExample: ({ title }) => <div data-testid="code-example">{title}</div>,
  ConfigScreenshot: ({ title }) => <div data-testid="config-screenshot">{title}</div>,
  Checklist: ({ title }) => <div data-testid="checklist">{title}</div>,
  TroubleshootingFAQ: ({ title }) => <div data-testid="troubleshooting-faq">{title}</div>,
  IntegrationDiagram: ({ title }) => <div data-testid="integration-diagram">{title}</div>,
  SuccessCriteria: ({ title }) => <div data-testid="success-criteria">{title}</div>,
}));

// Mock the platform-specific sections
jest.mock('../sections/ShopifyIntegration', () => () => <div data-testid="shopify-integration">Shopify Integration</div>);
jest.mock('../sections/MagentoIntegration', () => () => <div data-testid="magento-integration">Magento Integration</div>);
jest.mock('../sections/WooCommerceIntegration', () => () => <div data-testid="woocommerce-integration">WooCommerce Integration</div>);
jest.mock('../sections/BigCommerceIntegration', () => () => <div data-testid="bigcommerce-integration">BigCommerce Integration</div>);
jest.mock('../sections/CustomIntegration', () => () => <div data-testid="custom-integration">Custom Integration</div>);

// Mock the TableOfContents component
jest.mock('../../api/components', () => ({
  SearchBar: ({ placeholder }) => <div data-testid="search-bar">{placeholder}</div>,
  TableOfContents: ({ items, activeId, onItemClick }) => (
    <div data-testid="table-of-contents">
      <ul>
        {items.map((item) => (
          <li 
            key={item.id} 
            data-active={activeId === item.id}
            onClick={() => onItemClick(item.id)}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  ),
}));

describe('IntegrationGuides', () => {
  const renderWithTheme = (component) => {
    return render(
      <ThemeProvider>
        {component}
      </ThemeProvider>
    );
  };

  test('renders the integration guides component', () => {
    renderWithTheme(<IntegrationGuides />);
    
    // Check if the title is rendered
    expect(screen.getByText('VARAi Integration Guides')).toBeInTheDocument();
    
    // Check if the subtitle is rendered
    expect(screen.getByText('Comprehensive guides for integrating VARAi with your e-commerce platform')).toBeInTheDocument();
    
    // Check if the search bar is rendered
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    
    // Check if the platform buttons are rendered
    expect(screen.getByText('Shopify')).toBeInTheDocument();
    expect(screen.getByText('Magento')).toBeInTheDocument();
    expect(screen.getByText('WooCommerce')).toBeInTheDocument();
    expect(screen.getByText('BigCommerce')).toBeInTheDocument();
    expect(screen.getByText('Custom E-commerce')).toBeInTheDocument();
    
    // Check if the table of contents is rendered
    expect(screen.getByTestId('table-of-contents')).toBeInTheDocument();
    
    // Check if the Shopify integration is rendered by default
    expect(screen.getByTestId('shopify-integration')).toBeInTheDocument();
  });

  test('changes platform when a platform button is clicked', () => {
    renderWithTheme(<IntegrationGuides />);
    
    // Initially, Shopify integration should be visible
    expect(screen.getByTestId('shopify-integration')).toBeInTheDocument();
    
    // Click on the Magento button
    fireEvent.click(screen.getByText('Magento'));
    
    // Now, Magento integration should be visible
    expect(screen.getByTestId('magento-integration')).toBeInTheDocument();
    
    // Click on the WooCommerce button
    fireEvent.click(screen.getByText('WooCommerce'));
    
    // Now, WooCommerce integration should be visible
    expect(screen.getByTestId('woocommerce-integration')).toBeInTheDocument();
    
    // Click on the BigCommerce button
    fireEvent.click(screen.getByText('BigCommerce'));
    
    // Now, BigCommerce integration should be visible
    expect(screen.getByTestId('bigcommerce-integration')).toBeInTheDocument();
    
    // Click on the Custom E-commerce button
    fireEvent.click(screen.getByText('Custom E-commerce'));
    
    // Now, Custom integration should be visible
    expect(screen.getByTestId('custom-integration')).toBeInTheDocument();
  });

  test('navigates to API docs when the API Docs button is clicked', () => {
    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
    
    renderWithTheme(<IntegrationGuides />);
    
    // Click on the API Docs button
    fireEvent.click(screen.getByText('View API Docs'));
    
    // Check if the href was updated
    expect(window.location.href).toBe('/docs/api');
    
    // Restore window.location
    window.location = originalLocation;
  });

  test('navigates to SDK docs when the SDK Docs button is clicked', () => {
    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
    
    renderWithTheme(<IntegrationGuides />);
    
    // Click on the SDK Docs button
    fireEvent.click(screen.getByText('View SDK Docs'));
    
    // Check if the href was updated
    expect(window.location.href).toBe('/docs/sdk');
    
    // Restore window.location
    window.location = originalLocation;
  });
});