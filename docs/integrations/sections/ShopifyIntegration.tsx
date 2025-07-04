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
 * ShopifyIntegration Component
 * 
 * The Shopify integration guide section.
 */
const ShopifyIntegration: React.FC = () => {
  return (
    <div>
      {/* Overview & Prerequisites */}
      <SectionContainer id="shopify-overview">
        <Typography variant="h2" gutterBottom>
          Overview & Prerequisites
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi Shopify integration allows you to add virtual try-on and eyewear recommendation capabilities to your Shopify store. This guide will walk you through the installation, configuration, and customization of the VARAi app for Shopify.
        </Typography>
        
        <Typography variant="h4" gutterBottom style={{ marginTop: '24px' }}>
          Prerequisites
        </Typography>
        
        <Checklist
          title="Before You Begin"
          items={[
            {
              text: "Shopify Store",
              description: "You need an active Shopify store on the Basic plan or higher.",
              isRequired: true
            },
            {
              text: "Admin Access",
              description: "You need admin access to your Shopify store to install the app.",
              isRequired: true
            },
            {
              text: "VARAi Account",
              description: "You need a VARAi account with API access. If you don't have one, sign up at varai.com.",
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
          description="The VARAi Shopify integration connects your store with our AI services through a secure app bridge."
          width={700}
          height={400}
          nodes={[
            { id: 'shopify', label: 'Shopify Store', type: 'platform', x: 50, y: 170 },
            { id: 'app', label: 'VARAi App', type: 'varai', x: 290, y: 170 },
            { id: 'api', label: 'VARAi API', type: 'varai', x: 530, y: 170 },
            { id: 'storefront', label: 'Storefront', type: 'user', x: 50, y: 50 },
            { id: 'admin', label: 'Shopify Admin', type: 'user', x: 50, y: 290 },
            { id: 'data', label: 'Product Data', type: 'data', x: 290, y: 290 }
          ]}
          connections={[
            { from: 'shopify', to: 'app', label: 'App Bridge' },
            { from: 'app', to: 'api', label: 'API Calls' },
            { from: 'storefront', to: 'shopify', label: 'User Visits' },
            { from: 'admin', to: 'shopify', label: 'Configuration' },
            { from: 'shopify', to: 'data', label: 'Product Sync', dashed: true },
            { from: 'data', to: 'app', label: 'Data Access', dashed: true }
          ]}
        />
      </SectionContainer>
      
      <SectionDivider />
      
      {/* Installation & Setup */}
      <SectionContainer id="shopify-installation">
        <Typography variant="h2" gutterBottom>
          Installation & Setup
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Follow these steps to install and set up the VARAi app on your Shopify store.
        </Typography>
        
        <StepByStepGuide
          title="Installing the VARAi App"
          steps={[
            {
              title: "Visit the Shopify App Store",
              description: "Go to the Shopify App Store and search for 'VARAi Virtual Try-On' or click the direct link: [VARAi App](https://apps.shopify.com/varai-virtual-try-on)."
            },
            {
              title: "Add the App to Your Store",
              description: "Click the 'Add app' button and follow the prompts to add the app to your store."
            },
            {
              title: "Authorize the App",
              description: "Review the permissions requested by the app and click 'Install app' to authorize it."
            },
            {
              title: "Complete the Onboarding Process",
              description: "Follow the onboarding wizard to connect your VARAi account and configure basic settings."
            }
          ]}
        />
      </SectionContainer>
      
      {/* Additional sections would be added here */}
      <SectionDivider />
      
      <SectionContainer id="shopify-configuration">
        <Typography variant="h2" gutterBottom>
          Configuration Options
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi app offers various configuration options to customize the integration for your store.
        </Typography>
        
        {/* Configuration content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="shopify-product-catalog">
        <Typography variant="h2" gutterBottom>
          Product Catalog Integration
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          To enable virtual try-on for your products, you need to ensure your product data is properly structured and synchronized with VARAi.
        </Typography>
        
        {/* Product catalog content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="shopify-user-data">
        <Typography variant="h2" gutterBottom>
          User Data Integration
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi app can integrate with your customer data to provide personalized recommendations and save try-on history.
        </Typography>
        
        {/* User data content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="shopify-widget">
        <Typography variant="h2" gutterBottom>
          Widget Implementation
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi widget can be added to your Shopify store in several ways, depending on your needs and technical expertise.
        </Typography>
        
        {/* Widget implementation content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="shopify-testing">
        <Typography variant="h2" gutterBottom>
          Testing & Validation
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Before launching the VARAi integration to your customers, it's important to thoroughly test it to ensure everything works as expected.
        </Typography>
        
        {/* Testing content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="shopify-troubleshooting">
        <Typography variant="h2" gutterBottom>
          Troubleshooting
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          If you encounter issues with your VARAi integration, here are some common problems and their solutions.
        </Typography>
        
        {/* Troubleshooting content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="shopify-best-practices">
        <Typography variant="h2" gutterBottom>
          Best Practices
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Follow these best practices to get the most out of your VARAi integration.
        </Typography>
        
        {/* Best practices content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="shopify-advanced">
        <Typography variant="h2" gutterBottom>
          Advanced Customization
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          For developers and advanced users, the VARAi app offers extensive customization options.
        </Typography>
        
        {/* Advanced customization content would go here */}
      </SectionContainer>
    </div>
  );
};

export default ShopifyIntegration;