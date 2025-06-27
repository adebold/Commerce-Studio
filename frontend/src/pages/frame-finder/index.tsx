import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { 
  QuestionnaireStep,
  FaceShapeSelector,
  StylePreferenceSelector,
  FilterSortControls,
  SizeGuideSelector,
  FeatureTagSelector,
  EnhancedRecommendationCard,
  FrameComparison
} from '../../components/frame-finder';
import { Card } from '../../design-system/components/Card/Card';
import { Button } from '../../design-system/components/Button/Button';
import { Frame } from '../../components/virtual-try-on';
import { recommendationService, UserPreferences, FrameRecommendation } from '../../services/recommendation-service';
import { useNavigate } from 'react-router-dom';

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.spacing.spacing[32]} ${theme.spacing.spacing[16]}`};
  
  @media (min-width: 768px) {
    padding: ${({ theme }) => `${theme.spacing.spacing[48]} ${theme.spacing.spacing[24]}`};
  }
`;

const PageHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[32]};
  text-align: center;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const ProgressContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background-color: ${({ theme }) => theme.colors.neutral[200]};
  border-radius: 4px;
  overflow: hidden;
  margin: 0 ${({ theme }) => theme.spacing.spacing[16]};
  
  &::after {
    content: '';
    display: block;
    width: ${({ progress }) => `${progress}%`};
    height: 100%;
    background-color: ${({ theme }) => theme.colors.primary[500]};
    transition: width 0.3s ease-in-out;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.spacing[48]};
  text-align: center;
`;

const LoadingSpinner = styled.div`
  border: 4px solid ${({ theme }) => theme.colors.neutral[200]};
  border-top: 4px solid ${({ theme }) => theme.colors.primary[500]};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SavePreferencesButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
`;

const PreferencesSavedMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.primary[50]};
  border-left: 4px solid ${({ theme }) => theme.colors.primary[500]};
  padding: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[16]};
  border-radius: 4px;
`;

// Types
type QuestionnaireStep = 
  | 'face-shape'
  | 'style-preferences'
  | 'size-fit'
  | 'features'
  | 'budget'
  | 'results';

/**
 * FrameFinderPage Component
 * 
 * A step-by-step questionnaire to help customers find the perfect frames
 * based on their preferences and facial features.
 */
const FrameFinderPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<QuestionnaireStep>('face-shape');
  const [questionnaireData, setQuestionnaireData] = useState<UserPreferences>({
    faceShape: null,
    stylePreferences: {
      colors: [],
      materials: [],
      shapes: []
    },
    sizeAndFit: {
      frameWidth: null,
      templeLength: null,
      bridgeWidth: null
    },
    features: [],
    budget: {
      min: 0,
      max: 500
    }
  });
  const [recommendedFrames, setRecommendedFrames] = useState<FrameRecommendation[]>([]);
  const [favoriteFrames, setFavoriteFrames] = useState<Frame[]>([]);
  const [compareFrames, setCompareFrames] = useState<Frame[]>([]);
  const [filterSortOptions, setFilterSortOptions] = useState<{
    sortBy: string;
    filterByColor: string[];
    filterByMaterial: string[];
    filterByShape: string[];
    filterByPrice: [number, number];
  }>({
    sortBy: 'recommended',
    filterByColor: [],
    filterByMaterial: [],
    filterByShape: [],
    filterByPrice: [0, 500]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  
  // Load saved preferences on initial render
  useEffect(() => {
    const savedPreferences = recommendationService.loadPreferences();
    if (savedPreferences) {
      setQuestionnaireData(savedPreferences);
    }
  }, []);
  
  // Calculate progress percentage
  const getProgressPercentage = () => {
    const steps: QuestionnaireStep[] = ['face-shape', 'style-preferences', 'size-fit', 'features', 'budget', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    return (currentIndex / (steps.length - 1)) * 100;
  };
  
  // Handle next step
  const handleNextStep = () => {
    switch (currentStep) {
      case 'face-shape':
        setCurrentStep('style-preferences');
        break;
      case 'style-preferences':
        setCurrentStep('size-fit');
        break;
      case 'size-fit':
        setCurrentStep('features');
        break;
      case 'features':
        setCurrentStep('budget');
        break;
      case 'budget':
        // Generate recommendations and move to results
        generateRecommendations();
        setCurrentStep('results');
        break;
      default:
        break;
    }
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'style-preferences':
        setCurrentStep('face-shape');
        break;
      case 'size-fit':
        setCurrentStep('style-preferences');
        break;
      case 'features':
        setCurrentStep('size-fit');
        break;
      case 'budget':
        setCurrentStep('features');
        break;
      case 'results':
        setCurrentStep('budget');
        break;
      default:
        break;
    }
  };
  
  // Update questionnaire data
  const updateQuestionnaireData = (step: QuestionnaireStep, data: Partial<UserPreferences>) => {
    setQuestionnaireData(prev => ({
      ...prev,
      ...data
    }));
  };
  
  // Generate recommendations based on questionnaire data
  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // Get recommendations from service
      const result = await recommendationService.getRecommendations(questionnaireData);
      setRecommendedFrames(result.frames);
      
      // Track recommendation generation
      recommendationService.trackInteraction('recommendations_generated', 'none');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to empty recommendations
      setRecommendedFrames([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding/removing frames to favorites
  const toggleFavorite = (frame: Frame) => {
    const isFavorite = favoriteFrames.some(f => f.id === frame.id);
    
    if (isFavorite) {
      setFavoriteFrames(favoriteFrames.filter(f => f.id !== frame.id));
      recommendationService.trackInteraction('remove_favorite', frame.id);
    } else {
      setFavoriteFrames([...favoriteFrames, frame]);
      recommendationService.trackInteraction('add_favorite', frame.id);
    }
  };
  
  // Handle adding/removing frames to comparison
  const toggleCompare = (frame: Frame) => {
    const isInCompare = compareFrames.some(f => f.id === frame.id);
    
    if (isInCompare) {
      setCompareFrames(compareFrames.filter(f => f.id !== frame.id));
      recommendationService.trackInteraction('remove_compare', frame.id);
    } else {
      // Limit to 4 frames for comparison
      if (compareFrames.length < 4) {
        setCompareFrames([...compareFrames, frame]);
        recommendationService.trackInteraction('add_compare', frame.id);
      }
    }
  };
  
  // Handle filter and sort changes
  const handleFilterSortChange = (options: typeof filterSortOptions) => {
    setFilterSortOptions(options);
    
    // Apply filters to recommended frames
    let filteredFrames = [...recommendedFrames];
    
    // Apply filters
    if (options.filterByColor.length > 0) {
      filteredFrames = filteredFrames.filter(item => 
        options.filterByColor.includes(item.frame.color)
      );
    }
    
    if (options.filterByMaterial.length > 0) {
      filteredFrames = filteredFrames.filter(item => 
        options.filterByMaterial.includes(item.frame.material)
      );
    }
    
    if (options.filterByShape.length > 0) {
      filteredFrames = filteredFrames.filter(item => 
        options.filterByShape.includes(item.frame.shape)
      );
    }
    
    // Apply price filter
    filteredFrames = filteredFrames.filter(item => 
      item.frame.price >= options.filterByPrice[0] && 
      item.frame.price <= options.filterByPrice[1]
    );
    
    // Apply sorting
    switch (options.sortBy) {
      case 'price-low-high':
        filteredFrames.sort((a, b) => a.frame.price - b.frame.price);
        break;
      case 'price-high-low':
        filteredFrames.sort((a, b) => b.frame.price - a.frame.price);
        break;
      case 'name-a-z':
        filteredFrames.sort((a, b) => a.frame.name.localeCompare(b.frame.name));
        break;
      case 'name-z-a':
        filteredFrames.sort((a, b) => b.frame.name.localeCompare(a.frame.name));
        break;
      case 'compatibility':
        filteredFrames.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        break;
      // 'recommended' is the default sorting which is already applied
      default:
        break;
    }
    
    setRecommendedFrames(filteredFrames);
    
    // Track filter/sort interaction
    recommendationService.trackInteraction('filter_sort_applied', options.sortBy);
  };
  
  // Handle try on
  const handleTryOn = (frame: Frame) => {
    // Navigate to virtual try-on page with selected frame
    navigate(`/virtual-try-on?frameId=${frame.id}`);
    
    // Track try-on interaction
    recommendationService.trackInteraction('try_on_clicked', frame.id);
  };
  
  // Save user preferences
  const savePreferences = () => {
    recommendationService.savePreferences(questionnaireData);
    setPreferencesSaved(true);
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      setPreferencesSaved(false);
    }, 3000);
    
    // Track save preferences interaction
    recommendationService.trackInteraction('preferences_saved', 'none');
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'face-shape':
        return (
          <QuestionnaireStep
            title="What's Your Face Shape?"
            description="Select the face shape that most closely resembles yours. This helps us recommend frames that complement your features."
          >
            <FaceShapeSelector
              selectedShape={questionnaireData.faceShape}
              onSelectShape={(shape) => updateQuestionnaireData('face-shape', { faceShape: shape })}
            />
          </QuestionnaireStep>
        );
      case 'style-preferences':
        return (
          <QuestionnaireStep
            title="Style Preferences"
            description="Select your preferred colors, materials, and frame shapes."
          >
            <StylePreferenceSelector
              selectedPreferences={questionnaireData.stylePreferences}
              onPreferenceChange={(preferences) => 
                updateQuestionnaireData('style-preferences', { stylePreferences: preferences })
              }
            />
          </QuestionnaireStep>
        );
      case 'size-fit':
        return (
          <QuestionnaireStep
            title="Size & Fit"
            description="Help us understand your size preferences for a comfortable fit."
          >
            <SizeGuideSelector
              selectedSizes={questionnaireData.sizeAndFit}
              onSizeChange={(sizes: {
                frameWidth: string | null;
                templeLength: string | null;
                bridgeWidth: string | null;
              }) =>
                updateQuestionnaireData('size-fit', { sizeAndFit: sizes })
              }
            />
          </QuestionnaireStep>
        );
      case 'features':
        return (
          <QuestionnaireStep
            title="Frame Features"
            description="Select specific features that are important to you."
          >
            <FeatureTagSelector
              selectedFeatures={questionnaireData.features}
              onFeatureChange={(features: string[]) =>
                updateQuestionnaireData('features', { features })
              }
            />
          </QuestionnaireStep>
        );
      case 'budget':
        return (
          <QuestionnaireStep
            title="Budget Range"
            description="Select your preferred price range for eyewear frames."
          >
            <Card variant="outlined">
              <Card.Content>
                <Typography variant="body1" gutterBottom>
                  What's your budget for eyewear frames?
                </Typography>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                  {[
                    { label: 'Under $100', min: 0, max: 100 },
                    { label: '$100 - $200', min: 100, max: 200 },
                    { label: '$200 - $300', min: 200, max: 300 },
                    { label: '$300 - $400', min: 300, max: 400 },
                    { label: '$400+', min: 400, max: 1000 }
                  ].map(range => (
                    <Button
                      key={range.label}
                      variant={
                        questionnaireData.budget.min === range.min && 
                        questionnaireData.budget.max === range.max 
                          ? 'primary' 
                          : 'secondary'
                      }
                      onClick={() => setQuestionnaireData({
                        ...questionnaireData,
                        budget: {
                          min: range.min,
                          max: range.max
                        }
                      })}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </QuestionnaireStep>
        );
      case 'results':
        if (isLoading) {
          return (
            <LoadingContainer>
              <LoadingSpinner />
              <Typography variant="h5" gutterBottom>
                Finding Your Perfect Frames
              </Typography>
              <Typography variant="body1" muted>
                Our AI is analyzing your preferences to find the best matches...
              </Typography>
            </LoadingContainer>
          );
        }
        
        return (
          <ResultsContainer>
            <Typography variant="h4" gutterBottom>
              Your Recommended Frames
            </Typography>
            
            <Typography variant="body1" muted gutterBottom>
              Based on your preferences, we've selected these frames that would look great on you.
            </Typography>
            
            <SavePreferencesButton 
              variant="secondary"
              onClick={savePreferences}
            >
              Save My Preferences
            </SavePreferencesButton>
            
            {preferencesSaved && (
              <PreferencesSavedMessage>
                <Typography variant="body2">
                  Your preferences have been saved! We'll use these to personalize your experience in the future.
                </Typography>
              </PreferencesSavedMessage>
            )}
            
            <FilterContainer>
              <FilterSortControls
                options={filterSortOptions}
                onFilterSortChange={handleFilterSortChange}
                availableFilters={{
                  colors: Array.from(new Set(recommendedFrames.map(item => item.frame.color))),
                  materials: Array.from(new Set(recommendedFrames.map(item => item.frame.material))),
                  shapes: Array.from(new Set(recommendedFrames.map(item => item.frame.shape)))
                }}
              />
            </FilterContainer>
            
            {compareFrames.length > 0 && (
              <div>
                <Button
                  variant={showComparison ? 'primary' : 'secondary'}
                  onClick={() => setShowComparison(!showComparison)}
                >
                  {showComparison ? 'Hide Comparison' : `Compare Selected Frames (${compareFrames.length})`}
                </Button>
                
                {showComparison && (
                  <FrameComparison
                    frames={compareFrames}
                    onRemoveFrame={(frameId: string) => {
                      setCompareFrames(compareFrames.filter(f => f.id !== frameId));
                    }}
                    onTryOn={handleTryOn}
                  />
                )}
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {recommendedFrames.map(item => (
                <EnhancedRecommendationCard
                  key={item.frame.id}
                  frame={item.frame}
                  isFavorite={favoriteFrames.some(f => f.id === item.frame.id)}
                  compatibilityScore={item.compatibilityScore}
                  faceShape={questionnaireData.faceShape}
                  selectedFeatures={questionnaireData.features}
                  onToggleFavorite={toggleFavorite}
                  onTryOn={handleTryOn}
                  onAddToCompare={toggleCompare}
                  isInCompare={compareFrames.some(f => f.id === item.frame.id)}
                />
              ))}
            </div>
            
            {favoriteFrames.length > 0 && (
              <>
                <Typography variant="h5" gutterBottom style={{ marginTop: '32px' }}>
                  Your Favorites
                </Typography>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                  {favoriteFrames.map(frame => {
                    // Find the recommendation data for this frame
                    const recommendation = recommendedFrames.find(r => r.frame.id === frame.id);
                    const compatibilityScore = recommendation?.compatibilityScore || 50;
                    
                    return (
                      <EnhancedRecommendationCard
                        key={frame.id}
                        frame={frame}
                        isFavorite={true}
                        compatibilityScore={compatibilityScore}
                        faceShape={questionnaireData.faceShape}
                        selectedFeatures={questionnaireData.features}
                        onToggleFavorite={toggleFavorite}
                        onTryOn={handleTryOn}
                        onAddToCompare={toggleCompare}
                        isInCompare={compareFrames.some(f => f.id === frame.id)}
                      />
                    );
                  })}
                </div>
                
                <Button 
                  variant="primary"
                  onClick={() => {
                    // Navigate to virtual try-on page with favorite frames
                    const frameIds = favoriteFrames.map(f => f.id).join(',');
                    navigate(`/virtual-try-on?frameIds=${frameIds}`);
                    
                    // Track try-on interaction
                    recommendationService.trackInteraction('try_on_favorites', 'multiple');
                  }}
                  style={{ marginTop: '16px' }}
                >
                  Try On Your Favorites
                </Button>
              </>
            )}
          </ResultsContainer>
        );
      default:
        return null;
    }
  };
  
  return (
    <PageContainer>
      <PageHeader>
        <Typography variant="h3" gutterBottom>
          Frame Finder
        </Typography>
        <Typography variant="body1" muted>
          Find the perfect frames for your face shape and style preferences.
        </Typography>
      </PageHeader>
      
      {currentStep !== 'results' && (
        <ProgressContainer>
          <Typography variant="body2">
            Step {['face-shape', 'style-preferences', 'size-fit', 'features', 'budget'].indexOf(currentStep) + 1} of 5
          </Typography>
          <ProgressBar progress={getProgressPercentage()} />
          <Typography variant="body2">
            {Math.round(getProgressPercentage())}%
          </Typography>
        </ProgressContainer>
      )}
      
      <ContentContainer>
        {renderStepContent()}
        
        {currentStep !== 'results' && (
          <ButtonContainer>
            <Button
              variant="secondary"
              onClick={handlePreviousStep}
              disabled={currentStep === 'face-shape'}
            >
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleNextStep}
              disabled={currentStep === 'face-shape' && !questionnaireData.faceShape}
            >
              {currentStep === 'budget' ? 'See Results' : 'Next'}
            </Button>
          </ButtonContainer>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default FrameFinderPage;