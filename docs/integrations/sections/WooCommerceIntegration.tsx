import React from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../../frontend/src/design-system/components/Typography/Typography';
import {
  StepByStepGuide,
  CodeExample,
  ConfigScreenshot,
  Checklist,
  TroubleshootingFAQ,
  IntegrationDiagram,
  SuccessCriteria
} from '../components';

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const SectionDivider = styled.hr`
  border: 0;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.neutral[200]};
  margin: ${({ theme }) => `${theme.spacing.spacing[32]} 0`};
`;

/**
 * WooCommerceIntegration Component
 * 
 * The WooCommerce integration guide section.
 */
const WooCommerceIntegration: React.FC = () => {
  return (
    <div>
      {/* Overview & Prerequisites */}
      <SectionContainer id="woocommerce-overview">
        <Typography variant="h2" gutterBottom>
          Overview & Prerequisites
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi WooCommerce integration allows you to add virtual try-on and eyewear recommendation capabilities to your WordPress WooCommerce store. This guide will walk you through the installation, configuration, and customization of the VARAi plugin for WooCommerce.
        </Typography>
        
        <Typography variant="h4" gutterBottom style={{ marginTop: '24px' }}>
          Prerequisites
        </Typography>
        
        <Checklist
          title="Before You Begin"
          items={[
            {
              text: "WordPress with WooCommerce",
              description: "You need an active WordPress site with WooCommerce 4.0+ installed.",
              isRequired: true
            },
            {
              text: "Admin Access",
              description: "You need admin access to your WordPress site to install the plugin.",
              isRequired: true
            },
            {
              text: "VARAi Account",
              description: "You need a VARAi account with API access. If you don't have one, sign up at varai.com.",
              isRequired: true
            },
            {
              text: "PHP 7.3+",
              description: "Your server should be running PHP 7.3 or higher.",
              isRequired: true
            },
            {
              text: "Product Data",
              description: "Your eyewear products should have high-quality images and complete dimension data for optimal results.",
              isRequired: false
            }
          ]}
        />
        
        <IntegrationDiagram
          title="Integration Architecture"
          description="The VARAi WooCommerce integration connects your store with our AI services through a secure WordPress plugin."
          width={700}
          height={400}
          nodes={[
            { id: 'wordpress', label: 'WordPress', type: 'platform', x: 50, y: 170 },
            { id: 'woocommerce', label: 'WooCommerce', type: 'platform', x: 200, y: 170 },
            { id: 'plugin', label: 'VARAi Plugin', type: 'varai', x: 350, y: 170 },
            { id: 'api', label: 'VARAi API', type: 'varai', x: 530, y: 170 },
            { id: 'storefront', label: 'Storefront', type: 'user', x: 50, y: 50 },
            { id: 'admin', label: 'WordPress Admin', type: 'user', x: 50, y: 290 },
            { id: 'data', label: 'Product Data', type: 'data', x: 350, y: 290 }
          ]}
          connections={[
            { from: 'wordpress', to: 'woocommerce', label: 'Plugin' },
            { from: 'woocommerce', to: 'plugin', label: 'Integration' },
            { from: 'plugin', to: 'api', label: 'API Calls' },
            { from: 'storefront', to: 'wordpress', label: 'User Visits' },
            { from: 'admin', to: 'wordpress', label: 'Configuration' },
            { from: 'woocommerce', to: 'data', label: 'Product Sync', dashed: true },
            { from: 'data', to: 'plugin', label: 'Data Access', dashed: true }
          ]}
        />
      </SectionContainer>
      
      <SectionDivider />
      
      {/* Installation & Setup */}
      <SectionContainer id="woocommerce-installation">
        <Typography variant="h2" gutterBottom>
          Installation & Setup
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Follow these steps to install and set up the VARAi plugin on your WooCommerce store.
        </Typography>
        
        <StepByStepGuide
          title="Installing the VARAi Plugin"
          steps={[
            {
              title: "Download the Plugin",
              description: "Download the VARAi plugin from the WordPress Plugin Directory or from your VARAi account dashboard."
            },
            {
              title: "Install the Plugin",
              description: "Install the plugin through the WordPress admin panel or by uploading the files to your server.",
              code: `# Manual installation steps:
1. Download the plugin ZIP file
2. Go to WordPress Admin > Plugins > Add New > Upload Plugin
3. Choose the ZIP file and click "Install Now"
4. Activate the plugin after installation`
            },
            {
              title: "Configure the Plugin",
              description: "Navigate to WooCommerce > Settings > VARAi in your WordPress admin panel to configure the plugin."
            },
            {
              title: "Enter API Credentials",
              description: "Enter your VARAi API key and other credentials to connect your store to the VARAi platform."
            }
          ]}
        />
      </SectionContainer>
      
      {/* Additional sections would be added here */}
      <SectionDivider />
      
      <SectionContainer id="woocommerce-configuration">
        <Typography variant="h2" gutterBottom>
          Configuration Options
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi plugin offers various configuration options to customize the integration for your store.
        </Typography>
        
        {/* Configuration content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="woocommerce-product-catalog">
        <Typography variant="h2" gutterBottom>
          Product Catalog Integration
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          To enable virtual try-on for your products, you need to ensure your product data is properly structured and synchronized with VARAi.
        </Typography>
        
        {/* Product catalog content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="woocommerce-user-data">
        <Typography variant="h2" gutterBottom>
          User Data Integration
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi plugin can integrate with your customer data to provide personalized recommendations and save try-on history.
        </Typography>
        
        {/* User data content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="woocommerce-widget">
        <Typography variant="h2" gutterBottom>
          Widget Implementation
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi widget can be added to your WooCommerce store in several ways, depending on your needs and technical expertise.
        </Typography>
        
        {/* Widget implementation content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="woocommerce-testing">
        <Typography variant="h2" gutterBottom>
          Testing & Validation
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Before launching the VARAi integration to your customers, it's important to thoroughly test it to ensure everything works as expected.
        </Typography>
        
        {/* Testing content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="woocommerce-troubleshooting">
        <Typography variant="h2" gutterBottom>
          Troubleshooting
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          If you encounter issues with your VARAi integration, here are some common problems and their solutions.
        </Typography>
        
        {/* Troubleshooting content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="woocommerce-best-practices">
        <Typography variant="h2" gutterBottom>
          Best Practices
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Follow these best practices to get the most out of your VARAi integration.
        </Typography>
        
        {/* Best practices content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="woocommerce-advanced">
        <Typography variant="h2" gutterBottom>
          Advanced Customization
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          For developers and advanced users, the VARAi plugin offers extensive customization options.
        </Typography>
        
        {/* Advanced customization content would go here */}
      </SectionContainer>
    </div>
  );
};

export default WooCommerceIntegration;