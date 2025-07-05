import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { GridContainer, GridItem } from '../../frontend/src/design-system/components/Layout/ResponsiveGrid';
import { Typography } from '../../frontend/src/design-system/components/Typography/Typography';
import { Card } from '../../frontend/src/design-system/components/Card/Card';
import { Button } from '../../frontend/src/design-system/components/Button/Button';
import { SearchBar, TableOfContents } from '../api/components';

// Import platform-specific sections
import ShopifyIntegration from './sections/ShopifyIntegration';
import MagentoIntegration from './sections/MagentoIntegration';
import WooCommerceIntegration from './sections/WooCommerceIntegration';
import BigCommerceIntegration from './sections/BigCommerceIntegration';
import CustomIntegration from './sections/CustomIntegration';

// Import reusable components
import {
  StepByStepGuide,
  CodeExample,
  ConfigScreenshot,
  Checklist,
  TroubleshootingFAQ,
  IntegrationDiagram,
  SuccessCriteria
} from './components';

// Define the available platforms
const PLATFORMS = [
  { value: 'shopify', label: 'Shopify', difficulty: 'Easy' },
  { value: 'magento', label: 'Magento', difficulty: 'Advanced' },
  { value: 'woocommerce', label: 'WooCommerce', difficulty: 'Intermediate' },
  { value: 'bigcommerce', label: 'BigCommerce', difficulty: 'Intermediate' },
  { value: 'custom', label: 'Custom E-commerce', difficulty: 'Advanced' },
];

// Define the table of contents items for each platform
const TOC_ITEMS = {
  shopify: [
    {
      id: 'shopify-overview',
      title: 'Overview & Prerequisites',
      level: 1,
    },
    {
      id: 'shopify-installation',
      title: 'Installation & Setup',
      level: 1,
      children: [
        { id: 'shopify-app-installation', title: 'App Installation' },
        { id: 'shopify-initial-setup', title: 'Initial Configuration' },
      ],
    },
    {
      id: 'shopify-configuration',
      title: 'Configuration Options',
      level: 1,
      children: [
        { id: 'shopify-general-settings', title: 'General Settings' },
        { id: 'shopify-display-options', title: 'Display Options' },
        { id: 'shopify-advanced-settings', title: 'Advanced Settings' },
      ],
    },
    {
      id: 'shopify-product-catalog',
      title: 'Product Catalog Integration',
      level: 1,
      children: [
        { id: 'shopify-product-sync', title: 'Product Synchronization' },
        { id: 'shopify-product-metadata', title: 'Product Metadata' },
        { id: 'shopify-product-images', title: 'Product Images' },
      ],
    },
    {
      id: 'shopify-user-data',
      title: 'User Data Integration',
      level: 1,
      children: [
        { id: 'shopify-customer-accounts', title: 'Customer Accounts' },
        { id: 'shopify-user-preferences', title: 'User Preferences' },
        { id: 'shopify-data-privacy', title: 'Data Privacy Compliance' },
      ],
    },
    {
      id: 'shopify-widget',
      title: 'Widget Implementation',
      level: 1,
      children: [
        { id: 'shopify-widget-placement', title: 'Widget Placement' },
        { id: 'shopify-widget-customization', title: 'Widget Customization' },
        { id: 'shopify-widget-events', title: 'Widget Events & Callbacks' },
      ],
    },
    {
      id: 'shopify-testing',
      title: 'Testing & Validation',
      level: 1,
      children: [
        { id: 'shopify-test-mode', title: 'Test Mode' },
        { id: 'shopify-validation-checklist', title: 'Validation Checklist' },
        { id: 'shopify-common-issues', title: 'Common Issues' },
      ],
    },
    {
      id: 'shopify-troubleshooting',
      title: 'Troubleshooting',
      level: 1,
      children: [
        { id: 'shopify-error-messages', title: 'Error Messages' },
        { id: 'shopify-debugging', title: 'Debugging Tools' },
        { id: 'shopify-support', title: 'Getting Support' },
      ],
    },
    {
      id: 'shopify-best-practices',
      title: 'Best Practices',
      level: 1,
      children: [
        { id: 'shopify-performance', title: 'Performance Optimization' },
        { id: 'shopify-security', title: 'Security Considerations' },
        { id: 'shopify-maintenance', title: 'Maintenance & Updates' },
      ],
    },
    {
      id: 'shopify-advanced',
      title: 'Advanced Customization',
      level: 1,
      children: [
        { id: 'shopify-api-integration', title: 'API Integration' },
        { id: 'shopify-theme-customization', title: 'Theme Customization' },
        { id: 'shopify-custom-workflows', title: 'Custom Workflows' },
      ],
    },
  ],
  magento: [
    // Similar structure as Shopify
    {
      id: 'magento-overview',
      title: 'Overview & Prerequisites',
      level: 1,
    },
    {
      id: 'magento-installation',
      title: 'Installation & Setup',
      level: 1,
      children: [
        { id: 'magento-extension-installation', title: 'Extension Installation' },
        { id: 'magento-initial-setup', title: 'Initial Configuration' },
      ],
    },
    {
      id: 'magento-configuration',
      title: 'Configuration Options',
      level: 1,
      children: [
        { id: 'magento-general-settings', title: 'General Settings' },
        { id: 'magento-display-options', title: 'Display Options' },
        { id: 'magento-advanced-settings', title: 'Advanced Settings' },
      ],
    },
    {
      id: 'magento-product-catalog',
      title: 'Product Catalog Integration',
      level: 1,
      children: [
        { id: 'magento-product-sync', title: 'Product Synchronization' },
        { id: 'magento-product-attributes', title: 'Product Attributes' },
        { id: 'magento-product-images', title: 'Product Images' },
      ],
    },
    {
      id: 'magento-user-data',
      title: 'User Data Integration',
      level: 1,
      children: [
        { id: 'magento-customer-accounts', title: 'Customer Accounts' },
        { id: 'magento-user-preferences', title: 'User Preferences' },
        { id: 'magento-data-privacy', title: 'Data Privacy Compliance' },
      ],
    },
    {
      id: 'magento-widget',
      title: 'Widget Implementation',
      level: 1,
      children: [
        { id: 'magento-widget-placement', title: 'Widget Placement' },
        { id: 'magento-widget-customization', title: 'Widget Customization' },
        { id: 'magento-widget-events', title: 'Widget Events & Callbacks' },
      ],
    },
    {
      id: 'magento-testing',
      title: 'Testing & Validation',
      level: 1,
    },
    {
      id: 'magento-troubleshooting',
      title: 'Troubleshooting',
      level: 1,
    },
    {
      id: 'magento-best-practices',
      title: 'Best Practices',
      level: 1,
    },
    {
      id: 'magento-advanced',
      title: 'Advanced Customization',
      level: 1,
    },
  ],
  woocommerce: [
    // Similar structure as Shopify
    {
      id: 'woocommerce-overview',
      title: 'Overview & Prerequisites',
      level: 1,
    },
    {
      id: 'woocommerce-installation',
      title: 'Installation & Setup',
      level: 1,
    },
    {
      id: 'woocommerce-configuration',
      title: 'Configuration Options',
      level: 1,
    },
    {
      id: 'woocommerce-product-catalog',
      title: 'Product Catalog Integration',
      level: 1,
    },
    {
      id: 'woocommerce-user-data',
      title: 'User Data Integration',
      level: 1,
    },
    {
      id: 'woocommerce-widget',
      title: 'Widget Implementation',
      level: 1,
    },
    {
      id: 'woocommerce-testing',
      title: 'Testing & Validation',
      level: 1,
    },
    {
      id: 'woocommerce-troubleshooting',
      title: 'Troubleshooting',
      level: 1,
    },
    {
      id: 'woocommerce-best-practices',
      title: 'Best Practices',
      level: 1,
    },
    {
      id: 'woocommerce-advanced',
      title: 'Advanced Customization',
      level: 1,
    },
  ],
  bigcommerce: [
    // Similar structure as Shopify
    {
      id: 'bigcommerce-overview',
      title: 'Overview & Prerequisites',
      level: 1,
    },
    {
      id: 'bigcommerce-installation',
      title: 'Installation & Setup',
      level: 1,
    },
    {
      id: 'bigcommerce-configuration',
      title: 'Configuration Options',
      level: 1,
    },
    {
      id: 'bigcommerce-product-catalog',
      title: 'Product Catalog Integration',
      level: 1,
    },
    {
      id: 'bigcommerce-user-data',
      title: 'User Data Integration',
      level: 1,
    },
    {
      id: 'bigcommerce-widget',
      title: 'Widget Implementation',
      level: 1,
    },
    {
      id: 'bigcommerce-testing',
      title: 'Testing & Validation',
      level: 1,
    },
    {
      id: 'bigcommerce-troubleshooting',
      title: 'Troubleshooting',
      level: 1,
    },
    {
      id: 'bigcommerce-best-practices',
      title: 'Best Practices',
      level: 1,
    },
    {
      id: 'bigcommerce-advanced',
      title: 'Advanced Customization',
      level: 1,
    },
  ],
  custom: [
    // Similar structure as Shopify
    {
      id: 'custom-overview',
      title: 'Overview & Prerequisites',
      level: 1,
    },
    {
      id: 'custom-installation',
      title: 'Installation & Setup',
      level: 1,
    },
    {
      id: 'custom-configuration',
      title: 'Configuration Options',
      level: 1,
    },
    {
      id: 'custom-product-catalog',
      title: 'Product Catalog Integration',
      level: 1,
    },
    {
      id: 'custom-user-data',
      title: 'User Data Integration',
      level: 1,
    },
    {
      id: 'custom-widget',
      title: 'Widget Implementation',
      level: 1,
    },
    {
      id: 'custom-testing',
      title: 'Testing & Validation',
      level: 1,
    },
    {
      id: 'custom-troubleshooting',
      title: 'Troubleshooting',
      level: 1,
    },
    {
      id: 'custom-best-practices',
      title: 'Best Practices',
      level: 1,
    },
    {
      id: 'custom-advanced',
      title: 'Advanced Customization',
      level: 1,
    },
  ],
};

// Mock search index for the SearchBar component
const SEARCH_INDEX = [
  { id: 'shopify-overview', title: 'Shopify Overview & Prerequisites', section: 'Shopify', url: '#shopify-overview' },
  { id: 'shopify-installation', title: 'Shopify Installation & Setup', section: 'Shopify', url: '#shopify-installation' },
  { id: 'magento-overview', title: 'Magento Overview & Prerequisites', section: 'Magento', url: '#magento-overview' },
  { id: 'magento-installation', title: 'Magento Installation & Setup', section: 'Magento', url: '#magento-installation' },
  // Add more search items for each platform
];

// Styled components
const PageContainer = styled.div`
  padding: ${({ theme }) => `${theme.spacing.spacing[32]} 0`};
  max-width: 1440px;
  margin: 0 auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const MainContent = styled.main`
  margin-top: ${({ theme }) => theme.spacing.spacing[32]};
`;

const Sidebar = styled.aside`
  position: sticky;
  top: 20px;
  height: calc(100vh - 40px);
  overflow-y: auto;
`;

const ContentArea = styled.div`
  min-height: 800px;
`;

const PlatformSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const PlatformButton = styled(Button)<{ isActive: boolean, difficulty: string }>`
  position: relative;
  
  &::after {
    content: "${props => props.difficulty}";
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: ${props => {
      switch (props.difficulty) {
        case 'Easy': return props.theme.colors.success.main;
        case 'Intermediate': return props.theme.colors.warning.main;
        case 'Advanced': return props.theme.colors.error.main;
        default: return props.theme.colors.primary.main;
      }
    }};
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
  }
`;

/**
 * IntegrationGuides Component
 * 
 * The main component for the VARAi Integration Guides site.
 */
const IntegrationGuides: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState(PLATFORMS[0].value);
  const [activeSection, setActiveSection] = useState(`${activePlatform}-overview`);
  
  // Handle platform change
  const handlePlatformChange = (platform: string) => {
    setActivePlatform(platform);
    setActiveSection(`${platform}-overview`);
  };
  
  // Handle TOC item click
  const handleTocItemClick = (id: string) => {
    setActiveSection(id);
    // Scroll to the section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id]');
      let currentSection = '';
      
      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        
        if (sectionTop < 100) {
          currentSection = section.id;
        }
      });
      
      if (currentSection !== activeSection && currentSection) {
        setActiveSection(currentSection);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection]);
  
  // Render the active platform's integration guide
  const renderPlatformContent = () => {
    switch (activePlatform) {
      case 'shopify':
        return <ShopifyIntegration />;
      case 'magento':
        return <MagentoIntegration />;
      case 'woocommerce':
        return <WooCommerceIntegration />;
      case 'bigcommerce':
        return <BigCommerceIntegration />;
      case 'custom':
        return <CustomIntegration />;
      default:
        return <ShopifyIntegration />;
    }
  };
  
  return (
    <PageContainer>
      <Header>
        <Typography variant="h1" gutterBottom>
          VARAi Integration Guides
        </Typography>
        
        <Typography variant="h5" gutterBottom color="neutral.600">
          Comprehensive guides for integrating VARAi with your e-commerce platform
        </Typography>
        
        <HeaderActions>
          <SearchBar
            placeholder="Search integration guides..."
            searchIndex={SEARCH_INDEX}
          />
          
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/docs/api'}
            style={{ marginRight: '8px' }}
          >
            View API Docs
          </Button>
          
          <Button
            variant="primary"
            onClick={() => window.location.href = '/docs/sdk'}
          >
            View SDK Docs
          </Button>
        </HeaderActions>
      </Header>
      
      <PlatformSelector>
        {PLATFORMS.map((platform) => (
          <PlatformButton
            key={platform.value}
            variant={activePlatform === platform.value ? 'primary' : 'secondary'}
            isActive={activePlatform === platform.value}
            difficulty={platform.difficulty}
            onClick={() => handlePlatformChange(platform.value)}
          >
            {platform.label}
          </PlatformButton>
        ))}
      </PlatformSelector>
      
      <MainContent>
        <GridContainer spacing="large">
          <GridItem xs={12} md={3}>
            <Sidebar>
              <TableOfContents
                items={TOC_ITEMS[activePlatform]}
                activeId={activeSection}
                onItemClick={handleTocItemClick}
              />
            </Sidebar>
          </GridItem>
          
          <GridItem xs={12} md={9}>
            <ContentArea>
              <Card variant="outlined">
                <Card.Content>
                  {renderPlatformContent()}
                </Card.Content>
              </Card>
            </ContentArea>
          </GridItem>
        </GridContainer>
      </MainContent>
    </PageContainer>
  );
};

export default IntegrationGuides;