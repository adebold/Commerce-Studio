import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../../design-system/ThemeProvider';
import LandingPage from '../LandingPage';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('LandingPage Component', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <ThemeProvider>{ui}</ThemeProvider>
      </BrowserRouter>
    );
  };

  test('renders hero section with main heading', () => {
    renderWithProviders(<LandingPage />);
    
    // Check for main heading
    expect(screen.getByText(/Revolutionize Your Eyewear Experience with AI/i)).toBeInTheDocument();
  });

  test('renders feature section with feature cards', () => {
    renderWithProviders(<LandingPage />);
    
    // Check for feature section heading
    expect(screen.getByText(/Powerful Features for Modern Eyewear Retailers/i)).toBeInTheDocument();
    
    // Check for feature cards
    expect(screen.getByText(/Personalized Recommendations/i)).toBeInTheDocument();
    expect(screen.getByText(/Virtual Try-On with Precision/i)).toBeInTheDocument();
    expect(screen.getByText(/Style Expertise/i)).toBeInTheDocument();
    expect(screen.getByText(/Continuously Improving Experience/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise-Grade Reliability/i)).toBeInTheDocument();
  });

  test('renders pricing section with pricing cards', () => {
    renderWithProviders(<LandingPage />);
    
    // Check for pricing section heading
    expect(screen.getByText(/Simple, Transparent Pricing/i)).toBeInTheDocument();
    
    // Check for pricing tiers
    expect(screen.getByText(/Starter/i)).toBeInTheDocument();
    expect(screen.getByText(/Professional/i)).toBeInTheDocument();
    expect(screen.getByText(/Enterprise/i)).toBeInTheDocument();
  });

  test('renders sign-up form with required fields', () => {
    renderWithProviders(<LandingPage />);
    
    // Check for sign-up form heading
    expect(screen.getByText(/Create Your Account/i)).toBeInTheDocument();
    
    // Check for form fields
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    
    // Check for next step button
    expect(screen.getByText(/Next Step/i)).toBeInTheDocument();
  });
});