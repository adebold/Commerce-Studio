import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlatformSelection from '../../components/merchant-onboarding/PlatformSelection';
import AccountSetup from '../../components/merchant-onboarding/AccountSetup';
import StoreConfiguration from '../../components/merchant-onboarding/StoreConfiguration';
import IntegrationSetup from '../../components/merchant-onboarding/IntegrationSetup';
import FinalVerification from '../../components/merchant-onboarding/FinalVerification';

// Define the onboarding steps
const steps = [
  'Platform Selection',
  'Account Setup',
  'Store Configuration',
  'Integration Setup',
  'Final Verification'
];

const MerchantOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    platform: '',
    storeUrl: '',
    apiKey: '',
    apiSecret: '',
    storeId: '',
    storeName: '',
    email: '',
    password: '',
    confirmPassword: '',
    enableVirtualTryOn: true,
    enableRecommendations: true,
    enableFaceShapeDetection: true,
    enableStyleScoring: true,
    enableProductComparison: true,
    enableCustomerMeasurements: true,
    widgetPlacement: 'product_page',
    widgetStyle: 'floating',
    colorScheme: {
      primary: '#3C64F4',
      secondary: '#FF5C35',
      background: '#FFFFFF',
      text: '#333333'
    }
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Last step, complete onboarding
      completeOnboarding();
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleInputChange = (field: string, value: unknown) => {
    setOnboardingData({
      ...onboardingData,
      [field]: value
    });
  };

  const completeOnboarding = async () => {
    setLoading(true);
    
    try {
      // Simulate API call to save onboarding data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to dashboard after successful onboarding
      navigate('/commerce-studio/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled = () => {
    switch (activeStep) {
      case 0: // Platform Selection
        return !onboardingData.platform;
      case 1: // Account Setup
        return !onboardingData.email || 
               !onboardingData.password || 
               onboardingData.password !== onboardingData.confirmPassword;
      case 2: // Store Configuration
        return !onboardingData.storeName || !onboardingData.storeUrl;
      case 3: // Integration Setup
        return !onboardingData.apiKey;
      default:
        return false;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PlatformSelection 
            selectedPlatform={onboardingData.platform}
            onPlatformSelect={(platform: string) => handleInputChange('platform', platform)}
          />
        );
      case 1:
        return (
          <AccountSetup 
            email={onboardingData.email}
            password={onboardingData.password}
            confirmPassword={onboardingData.confirmPassword}
            onInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <StoreConfiguration 
            storeName={onboardingData.storeName}
            storeUrl={onboardingData.storeUrl}
            storeId={onboardingData.storeId}
            platform={onboardingData.platform}
            onInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <IntegrationSetup 
            platform={onboardingData.platform}
            apiKey={onboardingData.apiKey}
            apiSecret={onboardingData.apiSecret}
            enableVirtualTryOn={onboardingData.enableVirtualTryOn}
            enableRecommendations={onboardingData.enableRecommendations}
            enableFaceShapeDetection={onboardingData.enableFaceShapeDetection}
            enableStyleScoring={onboardingData.enableStyleScoring}
            enableProductComparison={onboardingData.enableProductComparison}
            enableCustomerMeasurements={onboardingData.enableCustomerMeasurements}
            widgetPlacement={onboardingData.widgetPlacement}
            widgetStyle={onboardingData.widgetStyle}
            colorScheme={onboardingData.colorScheme}
            onInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <FinalVerification 
            onboardingData={onboardingData}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Merchant Onboarding
        </Typography>
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            variant="outlined"
            sx={{ borderRadius: '28px', px: 3 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={isNextDisabled() || loading}
            sx={{ borderRadius: '28px', px: 3 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : activeStep === steps.length - 1 ? (
              'Complete'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default MerchantOnboardingPage;