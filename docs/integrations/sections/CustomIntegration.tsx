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
 * CustomIntegration Component
 * 
 * The Custom E-commerce integration guide section.
 */
const CustomIntegration: React.FC = () => {
  return (
    <div>
      {/* Overview & Prerequisites */}
      <SectionContainer id="custom-overview">
        <Typography variant="h2" gutterBottom>
          Overview & Prerequisites
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi API can be integrated with any custom e-commerce platform using our comprehensive REST API and JavaScript SDK. This guide will walk you through the process of integrating VARAi's virtual try-on and eyewear recommendation capabilities with your custom e-commerce solution.
        </Typography>
        
        <Typography variant="h4" gutterBottom style={{ marginTop: '24px' }}>
          Prerequisites
        </Typography>
        
        <Checklist
          title="Before You Begin"
          items={[
            {
              text: "VARAi Account",
              description: "You need a VARAi account with API access. If you don't have one, sign up at varai.com.",
              isRequired: true
            },
            {
              text: "API Key",
              description: "Generate an API key from your VARAi dashboard.",
              isRequired: true
            },
            {
              text: "Development Resources",
              description: "You'll need a developer familiar with your e-commerce platform and JavaScript/REST API integration.",
              isRequired: true
            },
            {
              text: "Product Data Structure",
              description: "Your product database should include eyewear dimensions and high-quality images.",
              isRequired: true
            }
          ]}
        />
        
        <IntegrationDiagram
          title="Integration Architecture"
          description="The VARAi custom integration connects your e-commerce platform with our AI services through our REST API and JavaScript SDK."
          width={700}
          height={400}
          nodes={[
            { id: 'ecommerce', label: 'Your E-commerce Platform', type: 'platform', x: 50, y: 170 },
            { id: 'backend', label: 'Your Backend', type: 'platform', x: 200, y: 170 },
            { id: 'sdk', label: 'VARAi SDK', type: 'varai', x: 350, y: 170 },
            { id: 'api', label: 'VARAi API', type: 'varai', x: 530, y: 170 },
            { id: 'storefront', label: 'Your Storefront', type: 'user', x: 50, y: 50 },
            { id: 'admin', label: 'Your Admin Panel', type: 'user', x: 50, y: 290 },
            { id: 'data', label: 'Product Data', type: 'data', x: 350, y: 290 }
          ]}
          connections={[
            { from: 'ecommerce', to: 'backend', label: 'Internal API' },
            { from: 'backend', to: 'api', label: 'REST API Calls' },
            { from: 'ecommerce', to: 'sdk', label: 'JavaScript SDK' },
            { from: 'sdk', to: 'api', label: 'API Calls' },
            { from: 'storefront', to: 'ecommerce', label: 'User Visits' },
            { from: 'admin', to: 'ecommerce', label: 'Configuration' },
            { from: 'ecommerce', to: 'data', label: 'Product Sync', dashed: true },
            { from: 'data', to: 'sdk', label: 'Data Access', dashed: true }
          ]}
        />
      </SectionContainer>
      
      <SectionDivider />
      
      {/* Installation & Setup */}
      <SectionContainer id="custom-installation">
        <Typography variant="h2" gutterBottom>
          Installation & Setup
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Follow these steps to set up the VARAi integration with your custom e-commerce platform.
        </Typography>
        
        <StepByStepGuide
          title="Setting Up the VARAi Integration"
          steps={[
            {
              title: "Create a VARAi Account",
              description: "Sign up for a VARAi account at varai.com and select the plan that fits your needs."
            },
            {
              title: "Generate API Credentials",
              description: "In your VARAi dashboard, navigate to the API section and generate an API key.",
              code: `// Example API key (keep this secure)
API_KEY = "process.env.API_KEY_254"`
            },
            {
              title: "Install the JavaScript SDK",
              description: "Add the VARAi JavaScript SDK to your e-commerce platform.",
              code: `<!-- Add this to your HTML head section -->
<script src="https://cdn.varai.com/sdk/v1/varai.min.js"></script>

<!-- Or install via npm -->
npm install @varai/sdk

// Then import in your JavaScript
import { VaraiSDK } from '@varai/sdk';`
            },
            {
              title: "Initialize the SDK",
              description: "Initialize the SDK with your API key.",
              code: `// Initialize the SDK
const varai = new VaraiSDK({
  apiKey: 'process.env.APIKEY_2547',
  environment: 'production', // or 'sandbox' for testing
  region: 'us', // or 'eu', 'ap' depending on your region
});`
            }
          ]}
        />
      </SectionContainer>
      
      {/* Additional sections would be added here */}
      <SectionDivider />
      
      <SectionContainer id="custom-configuration">
        <Typography variant="h2" gutterBottom>
          Configuration Options
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi SDK offers various configuration options to customize the integration for your platform.
        </Typography>
        
        <CodeExample
          title="SDK Configuration Options"
          description="Customize the SDK behavior with these configuration options."
          tabs={[
            {
              label: "Basic Configuration",
              language: "javascript",
              code: `// Basic SDK configuration
const varai = new VaraiSDK({
  apiKey: 'process.env.APIKEY_2547',
  environment: 'production',
  region: 'us',
  logLevel: 'error', // 'debug', 'info', 'warn', 'error'
  timeout: 10000, // API request timeout in ms
});`
            },
            {
              label: "Advanced Configuration",
              language: "javascript",
              code: `// Advanced SDK configuration
const varai = new VaraiSDK({
  apiKey: 'process.env.APIKEY_2547',
  environment: 'production',
  region: 'us',
  logLevel: 'error',
  timeout: 10000,
  retryPolicy: {
    maxRetries: 3,
    initialDelay: 300,
    maxDelay: 3000,
    backoffFactor: 2,
  },
  cachePolicy: {
    enabled: true,
    maxAge: 3600, // Cache TTL in seconds
    maxSize: 100, // Max number of cached items
  },
  analytics: {
    enabled: true,
    trackEvents: true,
    trackErrors: true,
  },
  onError: (error) => {
    console.error('VARAi SDK Error:', error);
    // Your custom error handling
  }
});`
            }
          ]}
        />
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="custom-product-catalog">
        <Typography variant="h2" gutterBottom>
          Product Catalog Integration
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          To enable virtual try-on for your products, you need to ensure your product data is properly structured and synchronized with VARAi.
        </Typography>
        
        <CodeExample
          title="Product Data Synchronization"
          description="Synchronize your product data with VARAi using the API."
          tabs={[
            {
              label: "Create/Update Product",
              language: "javascript",
              code: `// Create or update a product in VARAi
const product = await varai.products.createOrUpdate({
  externalId: 'your-product-id-123', // Your system's product ID
  name: 'Classic Aviator Sunglasses',
  description: 'Timeless aviator style with UV protection',
  images: [
    {
      url: 'https://your-store.com/images/aviator-front.jpg',
      type: 'front', // 'front', 'side', 'angle', etc.
    },
    {
      url: 'https://your-store.com/images/aviator-side.jpg',
      type: 'side',
    }
  ],
  dimensions: {
    frameWidth: 140, // in mm
    frameHeight: 45, // in mm
    bridgeWidth: 18, // in mm
    templeLength: 145, // in mm
  },
  attributes: {
    frameShape: 'aviator', // 'rectangle', 'round', 'cat-eye', etc.
    frameMaterial: 'metal', // 'acetate', 'metal', 'titanium', etc.
    frameColor: 'gold',
    lensColor: 'green',
    gender: 'unisex', // 'men', 'women', 'unisex'
    faceShapes: ['oval', 'heart', 'square'], // Compatible face shapes
  },
  variants: [
    {
      externalId: 'your-variant-id-456',
      sku: 'AVIA-GLD-GRN',
      attributes: {
        frameColor: 'gold',
        lensColor: 'green',
      },
      images: [
        {
          url: 'https://your-store.com/images/aviator-gold-green-front.jpg',
          type: 'front',
        }
      ]
    },
    // Additional variants...
  ],
  metadata: {
    // Any additional data you want to store
    collection: 'Summer 2025',
    bestseller: true,
  }
});

console.log('Product synchronized:', product.id);`
            },
            {
              label: "Bulk Product Sync",
              language: "javascript",
              code: `// Bulk synchronize multiple products
const products = [
  {
    externalId: 'product-1',
    name: 'Classic Aviator',
    // ... other product data
  },
  {
    externalId: 'product-2',
    name: 'Wayfarer Style',
    // ... other product data
  },
  // More products...
];

const results = await varai.products.bulkCreateOrUpdate(products);

console.log('Synchronized products:', results.length);
console.log('Successful:', results.filter(r => r.status === 'success').length);
console.log('Failed:', results.filter(r => r.status === 'error').length);

// Handle any errors
const errors = results.filter(r => r.status === 'error');
if (errors.length > 0) {
  console.error('Errors during product sync:', errors);
}`
            }
          ]}
        />
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="custom-user-data">
        <Typography variant="h2" gutterBottom>
          User Data Integration
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi SDK can integrate with your customer data to provide personalized recommendations and save try-on history.
        </Typography>
        
        {/* User data content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="custom-widget">
        <Typography variant="h2" gutterBottom>
          Widget Implementation
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          The VARAi widget can be added to your e-commerce platform in several ways, depending on your needs and technical expertise.
        </Typography>
        
        <CodeExample
          title="Widget Implementation"
          description="Add the VARAi widget to your product pages."
          tabs={[
            {
              label: "Basic Implementation",
              language: "html",
              code: `<!-- Add this where you want the widget to appear -->
<div id="varai-try-on-widget" data-product-id="your-product-id-123"></div>

<script>
  // Initialize the widget after the SDK is loaded
  document.addEventListener('DOMContentLoaded', function() {
    varai.widget.init({
      container: '#varai-try-on-widget',
      productId: 'your-product-id-123',
      buttonText: 'Try On Virtually',
      buttonStyle: 'primary',
      modalSize: 'large'
    });
  });
</script>`
            },
            {
              label: "Advanced Implementation",
              language: "javascript",
              code: `// Advanced widget implementation with callbacks
varai.widget.init({
  container: '#varai-try-on-widget',
  productId: 'your-product-id-123',
  buttonText: 'Try On Virtually',
  buttonStyle: 'primary',
  modalSize: 'large',
  showRecommendations: true,
  recommendationCount: 4,
  uiCustomizations: {
    primaryColor: '#0066cc',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '4px',
    buttonHoverEffect: 'shadow',
  },
  callbacks: {
    onLoad: function() {
      console.log('Widget loaded');
    },
    onOpen: function() {
      console.log('Widget opened');
      // Track event in your analytics
      trackEvent('virtual_try_on_opened', { productId: 'your-product-id-123' });
    },
    onClose: function() {
      console.log('Widget closed');
    },
    onTryOn: function(result) {
      console.log('Try-on completed', result);
      // You can use the result.imageUrl to display the try-on image elsewhere
      document.querySelector('.product-main-image').src = result.imageUrl;
    },
    onRecommendationClick: function(product) {
      console.log('Recommendation clicked', product);
      // Navigate to the recommended product
      window.location.href = '/products/' + product.externalId;
    }
  }
});`
            }
          ]}
        />
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="custom-testing">
        <Typography variant="h2" gutterBottom>
          Testing & Validation
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Before launching the VARAi integration to your customers, it's important to thoroughly test it to ensure everything works as expected.
        </Typography>
        
        {/* Testing content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="custom-troubleshooting">
        <Typography variant="h2" gutterBottom>
          Troubleshooting
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          If you encounter issues with your VARAi integration, here are some common problems and their solutions.
        </Typography>
        
        <TroubleshootingFAQ
          title="Common Integration Issues"
          items={[
            {
              question: "API Authentication Errors",
              answer: "If you're receiving 401 Unauthorized errors, verify that your API key is correct and has not expired. Also ensure you're using the correct environment (sandbox vs. production)."
            },
            {
              question: "Widget Not Displaying",
              answer: "Check the browser console for any JavaScript errors. Ensure the container element exists in the DOM before initializing the widget. Verify that the product ID passed to the widget matches a product that has been synchronized with VARAi."
            },
            {
              question: "Product Synchronization Failures",
              answer: "Ensure your product data includes all required fields, especially the dimensions and high-quality images. Check that image URLs are publicly accessible and not behind authentication."
            },
            {
              question: "Try-On Not Working Correctly",
              answer: "If frames are not positioning correctly on faces, verify that your product dimensions are accurate. The frame width, height, bridge width, and temple length are critical for proper positioning."
            },
            {
              question: "Performance Issues",
              answer: "If the widget is slow to load, consider implementing lazy loading so it only initializes when needed. Also ensure your product images are optimized for web delivery."
            }
          ]}
        />
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="custom-best-practices">
        <Typography variant="h2" gutterBottom>
          Best Practices
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Follow these best practices to get the most out of your VARAi integration.
        </Typography>
        
        {/* Best practices content would go here */}
      </SectionContainer>
      
      <SectionDivider />
      
      <SectionContainer id="custom-advanced">
        <Typography variant="h2" gutterBottom>
          Advanced Customization
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          For developers and advanced users, the VARAi SDK offers extensive customization options.
        </Typography>
        
        {/* Advanced customization content would go here */}
      </SectionContainer>
    </div>
  );
};

export default CustomIntegration;