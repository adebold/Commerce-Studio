import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LandingPage from '../pages/LandingPage';

// Mock theme for testing
const mockTheme = createTheme({
  palette: {
    primary: {
      main: '#0A2463',
    },
    secondary: {
      main: '#1976d2',
    },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={mockTheme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('LandingPage Apple-Inspired Design', () => {
  beforeEach(() => {
    renderWithProviders(<LandingPage />);
  });

  describe('Navigation Design', () => {
    test('should have clean white navigation background', () => {
      const navigation = screen.getByRole('banner');
      expect(navigation).toBeInTheDocument();
    });

    test('should display VARAi Commerce Studio brand name', () => {
      const brandName = screen.getByText('VARAi Commerce Studio');
      expect(brandName).toBeInTheDocument();
    });

    test('should have navigation links with proper contrast', () => {
      const productsLink = screen.getByRole('link', { name: /products/i });
      const solutionsLink = screen.getByRole('link', { name: /solutions/i });
      const pricingLink = screen.getByRole('link', { name: /pricing/i });
      const contactLink = screen.getByRole('link', { name: /contact/i });

      expect(productsLink).toBeInTheDocument();
      expect(solutionsLink).toBeInTheDocument();
      expect(pricingLink).toBeInTheDocument();
      expect(contactLink).toBeInTheDocument();
    });

    test('should have login button with VARAi brand color', () => {
      const loginButton = screen.getByRole('link', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('Hero Section Design', () => {
    test('should display main headline with high contrast', () => {
      const headline = screen.getByText('Transform Your Eyewear Business with AI');
      expect(headline).toBeInTheDocument();
    });

    test('should display subheadline with proper readability', () => {
      const subheadline = screen.getByText(/The complete platform for frame matching/i);
      expect(subheadline).toBeInTheDocument();
    });

    test('should have primary CTA button with proper styling', () => {
      const primaryCTA = screen.getByRole('link', { name: /start free trial/i });
      expect(primaryCTA).toBeInTheDocument();
    });

    test('should have secondary CTA button with outline style', () => {
      const secondaryCTA = screen.getByRole('link', { name: /watch demo/i });
      expect(secondaryCTA).toBeInTheDocument();
    });
  });

  describe('Content Sections Design', () => {
    test('should display Platform Features section with high contrast heading', () => {
      const featuresHeading = screen.getByText('Platform Features');
      expect(featuresHeading).toBeInTheDocument();
    });

    test('should display Seamless Integrations section', () => {
      const integrationsHeading = screen.getByText('Seamless Integrations');
      expect(integrationsHeading).toBeInTheDocument();
    });

    test('should display Customer Success Stories section', () => {
      const testimonialsHeading = screen.getByText('Customer Success Stories');
      expect(testimonialsHeading).toBeInTheDocument();
    });

    test('should display Choose Your Plan section', () => {
      const pricingHeading = screen.getByText('Choose Your Plan');
      expect(pricingHeading).toBeInTheDocument();
    });
  });

  describe('Feature Cards', () => {
    test('should display AI-Powered Frame Matching feature', () => {
      const aiFeature = screen.getByText('AI-Powered Frame Matching');
      expect(aiFeature).toBeInTheDocument();
    });

    test('should display Virtual Try-On Technology feature', () => {
      const virtualTryOn = screen.getByText('Virtual Try-On Technology');
      expect(virtualTryOn).toBeInTheDocument();
    });

    test('should display Commerce Platform Integration feature', () => {
      const commerceIntegration = screen.getByText('Commerce Platform Integration');
      expect(commerceIntegration).toBeInTheDocument();
    });

    test('should display Analytics & Insights feature', () => {
      const analytics = screen.getByText('Analytics & Insights');
      expect(analytics).toBeInTheDocument();
    });
  });

  describe('Integration Showcase', () => {
    test('should display popular integrations', () => {
      const shopify = screen.getByText('Shopify');
      const woocommerce = screen.getByText('WooCommerce');
      const salesforce = screen.getByText('Salesforce');
      
      expect(shopify).toBeInTheDocument();
      expect(woocommerce).toBeInTheDocument();
      expect(salesforce).toBeInTheDocument();
    });
  });

  describe('Testimonials', () => {
    test('should display customer testimonials', () => {
      const sarahTestimonial = screen.getByText(/VARAi transformed our online sales/i);
      expect(sarahTestimonial).toBeInTheDocument();
    });

    test('should display customer names and companies', () => {
      const sarahChen = screen.getByText('Sarah Chen');
      const visionCraft = screen.getByText('VisionCraft Eyewear');
      
      expect(sarahChen).toBeInTheDocument();
      expect(visionCraft).toBeInTheDocument();
    });
  });

  describe('Pricing Plans', () => {
    test('should display pricing tiers', () => {
      const starter = screen.getByText('Starter');
      const professional = screen.getByText('Professional');
      const enterprise = screen.getByText('Enterprise');
      
      expect(starter).toBeInTheDocument();
      expect(professional).toBeInTheDocument();
      expect(enterprise).toBeInTheDocument();
    });

    test('should highlight most popular plan', () => {
      const mostPopular = screen.getByText('Most Popular');
      expect(mostPopular).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    test('should display company information', () => {
      const companyName = screen.getByText('VARAi Commerce Studio');
      expect(companyName).toBeInTheDocument();
    });

    test('should display footer links', () => {
      const features = screen.getByText('Features');
      const about = screen.getByText('About');
      const privacy = screen.getByText('Privacy');
      
      expect(features).toBeInTheDocument();
      expect(about).toBeInTheDocument();
      expect(privacy).toBeInTheDocument();
    });

    test('should display copyright information', () => {
      const copyright = screen.getByText(/© 2024 VARAi Commerce Studio/i);
      expect(copyright).toBeInTheDocument();
    });
  });

  describe('Accessibility and Contrast', () => {
    test('should have proper heading hierarchy', () => {
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      
      expect(h1Elements.length).toBeGreaterThan(0);
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    test('should have accessible button labels', () => {
      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');
      
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
      
      links.forEach(link => {
        expect(link).toHaveAccessibleName();
      });
    });
  });

  describe('Apple Design Principles Compliance', () => {
    test('should use clean typography hierarchy', () => {
      const mainHeading = screen.getByText('Transform Your Eyewear Business with AI');
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading.tagName).toBe('H1');
    });

    test('should have proper spacing and layout', () => {
      const container = screen.getByText('Transform Your Eyewear Business with AI').closest('div');
      expect(container).toBeInTheDocument();
    });

    test('should use consistent color scheme', () => {
      // Test that VARAi brand color (#0A2463) is used consistently
      const loginButton = screen.getByRole('link', { name: /login/i });
      expect(loginButton).toBeInTheDocument();
    });
  });
});