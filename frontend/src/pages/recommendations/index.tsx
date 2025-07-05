/**
 * Style Recommendations Page
 * 
 * This page displays personalized style recommendations based on user preferences and facial features.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Typography, Button } from '../../../src/design-system';

// Import components
// Import individual components instead of using index barrel
import StyleCategoryComponent from '../../components/recommendations/StyleCategoryComponent';
import RecommendationCard from '../../components/recommendations/RecommendationCard';
import SimilarStylesComponent from '../../components/recommendations/SimilarStylesComponent';
import RecentlyViewedComponent from '../../components/recommendations/RecentlyViewedComponent';
import SeasonalRecommendationsComponent from '../../components/recommendations/SeasonalRecommendationsComponent';
import OccasionRecommendationsComponent from '../../components/recommendations/OccasionRecommendationsComponent';
import TrendingStylesComponent from '../../components/recommendations/TrendingStylesComponent';
import ComplementaryStylesComponent from '../../components/recommendations/ComplementaryStylesComponent';
import QuickViewModal from '../../components/recommendations/QuickViewModal';

// Import services
import { recommendationService } from '../../services/recommendation-service';

// Import types
import { Frame } from '../../types/recommendations';

// Mock data for style categories
const mockStyleCategories = [
  {
    id: 'casual',
    name: 'Casual Everyday',
    description: 'Relaxed, comfortable frames perfect for everyday wear. These styles balance practicality with a laid-back aesthetic.',
    frames: [
      {
        id: 'frame-1',
        name: 'Classic Rectangle Frame',
        brand: 'Ray-Ban',
        style: 'classic',
        material: 'acetate',
        color: 'black',
        price: 149.99,
        image_url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'frame-2',
        name: 'Modern Round Frame',
        brand: 'Warby Parker',
        style: 'minimal',
        material: 'metal',
        color: 'gold',
        price: 95.00,
        image_url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'frame-6',
        name: 'Vintage Aviator Frame',
        brand: 'Ray-Ban',
        style: 'classic',
        material: 'metal',
        color: 'gold',
        price: 159.99,
        image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'professional',
    name: 'Professional & Office',
    description: 'Sophisticated frames that project confidence and competence in professional settings. These styles are perfect for the workplace.',
    frames: [
      {
        id: 'frame-5',
        name: 'Rimless Titanium Frame',
        brand: 'Calvin Klein',
        style: 'minimalist',
        material: 'titanium',
        color: 'silver',
        price: 219.99,
        image_url: 'https://images.unsplash.com/photo-1633621623555-acfaac1721ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'frame-7',
        name: 'Executive Rectangular Frame',
        brand: 'Hugo Boss',
        style: 'professional',
        material: 'acetate',
        color: 'tortoise',
        price: 245.00,
        image_url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'frame-8',
        name: 'Slim Semi-Rimless Frame',
        brand: 'Prada',
        style: 'elegant',
        material: 'metal',
        color: 'gunmetal',
        price: 289.99,
        image_url: 'https://images.unsplash.com/photo-1599838082493-8577ee8ebd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'trendy',
    name: 'Trendy & Fashion-Forward',
    description: 'Make a statement with these bold, fashion-forward frames. These styles showcase the latest trends and unique design elements.',
    frames: [
      {
        id: 'frame-3',
        name: 'Premium Cat-Eye Frame',
        brand: 'Gucci',
        style: 'luxury',
        material: 'acetate',
        color: 'tortoise',
        price: 299.99,
        image_url: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'frame-9',
        name: 'Oversized Square Frame',
        brand: 'Fendi',
        style: 'fashion',
        material: 'acetate',
        color: 'black',
        price: 329.99,
        image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'frame-10',
        name: 'Geometric Hexagon Frame',
        brand: 'Tom Ford',
        style: 'trendy',
        material: 'metal',
        color: 'rose gold',
        price: 279.99,
        image_url: 'https://images.unsplash.com/photo-1584036553516-bf83210aa16c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'active',
    name: 'Active & Sports',
    description: 'Durable frames designed for active lifestyles. These styles offer enhanced grip, flexibility, and impact resistance.',
    frames: [
      {
        id: 'frame-4',
        name: 'Sport Performance Frame',
        brand: 'Oakley',
        style: 'sporty',
        material: 'nylon',
        color: 'black',
        price: 189.99,
        image_url: 'https://images.unsplash.com/photo-1587400416320-26efb29b43d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'frame-11',
        name: 'Wraparound Sport Frame',
        brand: 'Nike',
        style: 'athletic',
        material: 'nylon',
        color: 'blue',
        price: 159.99,
        image_url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'frame-12',
        name: 'Flexible Running Frame',
        brand: 'Under Armour',
        style: 'sporty',
        material: 'polymer',
        color: 'red',
        price: 149.99,
        image_url: 'https://images.unsplash.com/photo-1584037182267-9bc22b8d08e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

// Mock data for top recommendations
const mockTopRecommendations: Array<Frame & { matchScore: number; matchReason: string }> = [
  {
    id: 'frame-1',
    name: 'Classic Rectangle Frame',
    brand: 'Ray-Ban',
    style: 'classic',
    material: 'acetate',
    color: 'black',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    matchScore: 0.92,
    matchReason: 'This frame complements your oval face shape with its balanced proportions and classic style. The rectangular shape adds definition to your features while maintaining a timeless look that works well with your preference for versatile eyewear.',
  },
  {
    id: 'frame-5',
    name: 'Rimless Titanium Frame',
    brand: 'Calvin Klein',
    style: 'minimalist',
    material: 'titanium',
    color: 'silver',
    price: 219.99,
    image_url: 'https://images.unsplash.com/photo-1633621623555-acfaac1721ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    matchScore: 0.88,
    matchReason: "The subtle elegance of these frames aligns with your preference for minimalist aesthetics. The lightweight titanium construction provides all-day comfort, while the rimless design creates a sophisticated look that's perfect for professional settings.",
  },
  {
    id: 'frame-3',
    name: 'Premium Cat-Eye Frame',
    brand: 'Gucci',
    style: 'luxury',
    material: 'acetate',
    color: 'tortoise',
    price: 299.99,
    image_url: 'https://images.unsplash.com/photo-1513146581-976d6fdb6879?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    matchScore: 0.85,
    matchReason: 'This glamorous frame offers a luxury aesthetic that elevates your style preferences. The cat-eye shape adds a touch of sophistication and complements your facial features by drawing attention upward, creating a balanced and flattering look.',
  },
];

// Mock data for similar styles
const mockSimilarStyles: Frame[] = [
  {
    id: 'frame-13',
    name: 'Modern Clubmaster',
    brand: 'Ray-Ban',
    style: 'retro',
    material: 'acetate',
    color: 'black',
    price: 169.99,
    image_url: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'frame-14',
    name: 'Thin Metal Round',
    brand: 'Persol',
    style: 'vintage',
    material: 'metal',
    color: 'gold',
    price: 199.99,
    image_url: 'https://images.unsplash.com/photo-1577744486770-2f42d0e5b8b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'frame-15',
    name: 'Classic Wayfarer',
    brand: 'Ray-Ban',
    style: 'classic',
    material: 'acetate',
    color: 'tortoise',
    price: 149.99,
    image_url: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'frame-16',
    name: 'Slim Rectangle',
    brand: 'Hugo Boss',
    style: 'professional',
    material: 'metal',
    color: 'silver',
    price: 189.99,
    image_url: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
];

// Mock data for recently viewed
const mockRecentlyViewed: Frame[] = [
  {
    id: 'frame-17',
    name: 'Aviator Classic',
    brand: 'Ray-Ban',
    style: 'classic',
    material: 'metal',
    color: 'gold',
    price: 159.99,
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'frame-18',
    name: 'Oversized Square',
    brand: 'Gucci',
    style: 'luxury',
    material: 'acetate',
    color: 'black',
    price: 289.99,
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'frame-19',
    name: 'Round Metal',
    brand: 'Warby Parker',
    style: 'vintage',
    material: 'metal',
    color: 'silver',
    price: 95.00,
    image_url: 'https://images.unsplash.com/photo-1577744486770-2f42d0e5b8b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
  },
];

// Styled components
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.spacing[24]};
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding: ${({ theme }) => theme.spacing.spacing[16]};
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[40]};
`;

const TopRecommendationsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const TopRecommendationsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.spacing[24]};
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.spacing[16]};
  }
`;

const TopRecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.spacing[24]};
`;

const StyleCategoriesSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[48]};
`;

const IntegrationSection = styled.div`
  margin: ${({ theme }) => theme.spacing.spacing[48]} 0;
  padding: ${({ theme }) => theme.spacing.spacing[24]};
  background-color: ${({ theme }) => theme.colors.primary[50]};
  border-radius: ${({ theme }) => theme.spacing.spacing[8]};
  text-align: center;
`;

const IntegrationButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  margin-top: ${({ theme }) => theme.spacing.spacing[24]};
  
  ${({ theme }) => theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: center;
  }
`;

/**
 * Style Recommendations Page
 */
const RecommendationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [quickViewFrame, setQuickViewFrame] = useState<Frame | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [userRegion, setUserRegion] = useState('New York');
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'fall' | 'winter'>('summer');
  
  // Determine current season based on date
  useEffect(() => {
    const date = new Date();
    const month = date.getMonth();
    
    if (month >= 2 && month <= 4) {
      setCurrentSeason('spring');
    } else if (month >= 5 && month <= 7) {
      setCurrentSeason('summer');
    } else if (month >= 8 && month <= 10) {
      setCurrentSeason('fall');
    } else {
      setCurrentSeason('winter');
    }
  }, []);
  
  // Simulate loading data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track page view for analytics
      recommendationService.trackInteraction('page_view', 'recommendations_page');
      
      // Get user region from browser locale or IP (simulated)
      const browserLocale = navigator.language;
      if (browserLocale.includes('en-US')) {
        setUserRegion('New York');
      } else if (browserLocale.includes('en-GB')) {
        setUserRegion('London');
      } else if (browserLocale.includes('fr')) {
        setUserRegion('Paris');
      } else {
        setUserRegion('New York'); // Default
      }
      
      setLoading(false);
      
      // Set active category from URL if provided
      if (categoryId) {
        setActiveCategory(categoryId);
      }
    };
    
    loadData();
  }, [categoryId]);
  
  // Handle frame selection
  const handleFrameSelect = (frameId: string) => {
    // Track selection for analytics
    recommendationService.trackInteraction('frame_select', frameId);
    navigate(`/frames/${frameId}`);
  };
  
  // Handle quick view
  const handleQuickView = (frameId: string) => {
    // Find the frame in our mock data
    const frame = mockTopRecommendations.find(f => f.id === frameId) ||
                 mockStyleCategories.flatMap(c => c.frames).find(f => f.id === frameId) ||
                 mockSimilarStyles.find(f => f.id === frameId) ||
                 mockRecentlyViewed.find(f => f.id === frameId);
    
    if (frame) {
      setQuickViewFrame(frame);
      setQuickViewOpen(true);
      // Track quick view for analytics
      recommendationService.trackInteraction('quick_view', frameId);
    }
  };
  
  // Handle feedback
  const handleFeedback = (frameId: string, liked: boolean) => {
    console.log(`User ${liked ? 'liked' : 'disliked'} frame ${frameId}`);
    // Track feedback for analytics
    recommendationService.trackInteraction(liked ? 'like' : 'dislike', frameId);
    // In a real app, we would send this to an API to improve recommendations
  };
  
  // Handle save for later
  const handleSaveForLater = (frameId: string) => {
    console.log(`User saved frame ${frameId} for later`);
    // Track save for later for analytics
    recommendationService.trackInteraction('save_for_later', frameId);
    // In a real app, we would send this to an API
  };
  
  // Handle try on
  const handleTryOn = (frameId: string) => {
    // Track try on for analytics
    recommendationService.trackInteraction('try_on', frameId);
    navigate(`/virtual-try-on?frameId=${frameId}`);
  };
  
  // Handle category toggle
  const handleCategoryToggle = (categoryId: string) => {
    const newActiveCategory = activeCategory === categoryId ? null : categoryId;
    setActiveCategory(newActiveCategory);
    
    // Track category toggle for analytics
    if (newActiveCategory) {
      recommendationService.trackInteraction('category_open', categoryId);
    } else {
      recommendationService.trackInteraction('category_close', categoryId);
    }
  };
  
  // Navigate to Frame Finder
  const navigateToFrameFinder = () => {
    // Track navigation for analytics
    recommendationService.trackInteraction('navigate', 'frame_finder');
    navigate('/frame-finder');
  };
  
  // Navigate to Virtual Try-On
  const navigateToVirtualTryOn = () => {
    // Track navigation for analytics
    recommendationService.trackInteraction('navigate', 'virtual_try_on');
    navigate('/virtual-try-on');
  };
  
  // Prepare occasion frames data
  const occasionFrames = {
    formal: mockStyleCategories.find(c => c.id === 'professional')?.frames || [],
    casual: mockStyleCategories.find(c => c.id === 'casual')?.frames || [],
    sport: mockStyleCategories.find(c => c.id === 'active')?.frames || []
  };
  
  // Prepare trending frames data (using trendy category)
  const trendingFrames = mockStyleCategories.find(c => c.id === 'trendy')?.frames || [];
  
  // Prepare complementary frames data (using first frame as existing purchase)
  const existingFrame = mockTopRecommendations[0];
  
  return (
    <PageContainer>
      <PageHeader>
        <Typography variant="h2" gutterBottom>
          Your Style Recommendations
        </Typography>
        <Typography variant="body1" muted>
          Based on your face shape, style preferences, and previous interactions,
          we've curated these personalized eyewear recommendations just for you.
        </Typography>
      </PageHeader>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Typography variant="body1">Loading your personalized recommendations...</Typography>
        </div>
      ) : (
        <>
          {/* Top Recommendations Section */}
          <TopRecommendationsSection>
            <TopRecommendationsHeader>
              <Typography variant="h3" gutterBottom={false}>
                Top Picks For You
              </Typography>
              <Typography variant="body2" muted>
                These frames are specifically chosen to match your unique style and features
              </Typography>
            </TopRecommendationsHeader>
            
            <TopRecommendationsGrid>
              {mockTopRecommendations.map((frame) => (
                <RecommendationCard
                  key={frame.id}
                  frame={frame}
                  matchScore={frame.matchScore}
                  matchReason={frame.matchReason}
                  onSelect={handleFrameSelect}
                  onFeedback={handleFeedback}
                  onSaveForLater={handleSaveForLater}
                  onTryOn={handleTryOn}
                />
              ))}
            </TopRecommendationsGrid>
          </TopRecommendationsSection>
          
          {/* Trending Styles Section */}
          <TrendingStylesComponent
            frames={trendingFrames}
            onSelect={handleQuickView}
            region={userRegion}
            trendingData={{
              percentageIncrease: 32,
              timeFrame: 'this month'
            }}
          />
          
          {/* Seasonal Recommendations Section */}
          <SeasonalRecommendationsComponent
            frames={mockStyleCategories.find(c => c.id === 'trendy')?.frames || []}
            onSelect={handleQuickView}
            season={currentSeason}
          />
          
          {/* Style Categories Section */}
          <StyleCategoriesSection>
            <Typography variant="h3" gutterBottom>
              Browse By Style
            </Typography>
            
            {mockStyleCategories.map((category) => (
              <StyleCategoryComponent
                key={category.id}
                category={category}
                onFrameSelect={handleQuickView}
                active={activeCategory === category.id}
                onToggle={() => handleCategoryToggle(category.id)}
              />
            ))}
          </StyleCategoriesSection>
          
          {/* Occasion Recommendations Section */}
          <OccasionRecommendationsComponent
            frames={occasionFrames}
            onSelect={handleQuickView}
            activeOccasion="formal"
          />
          
          {/* Complementary Styles Section */}
          <ComplementaryStylesComponent
            existingFrame={existingFrame}
            complementaryFrames={mockSimilarStyles}
            onSelect={handleQuickView}
            complementaryReason="These frames complement your existing eyewear with different styles for various occasions."
          />
          
          {/* Similar Styles Section */}
          <SimilarStylesComponent
            frames={mockSimilarStyles}
            onSelect={handleQuickView}
          />
          
          {/* Integration Section */}
          <IntegrationSection>
            <Typography variant="h4" gutterBottom>
              Find Your Perfect Frames
            </Typography>
            <Typography variant="body1">
              Not seeing what you're looking for? Try our Frame Finder to discover more options
              based on your preferences, or use our Virtual Try-On to see how frames look on your face.
            </Typography>
            
            <IntegrationButtons>
              <Button
                variant="primary"
                size="large"
                onClick={navigateToFrameFinder}
              >
                Use Frame Finder
              </Button>
              <Button
                variant="secondary"
                size="large"
                onClick={navigateToVirtualTryOn}
              >
                Try Frames Virtually
              </Button>
            </IntegrationButtons>
          </IntegrationSection>
          
          {/* Recently Viewed Section */}
          <RecentlyViewedComponent
            frames={mockRecentlyViewed}
            onSelect={handleQuickView}
          />
          
          {/* Quick View Modal */}
          {quickViewFrame && (
            <QuickViewModal
              frame={quickViewFrame}
              open={quickViewOpen}
              onClose={() => setQuickViewOpen(false)}
              onSelect={handleFrameSelect}
              onTryOn={handleTryOn}
              onFeedback={handleFeedback}
              onSaveForLater={handleSaveForLater}
              matchScore={
                mockTopRecommendations.find(f => f.id === quickViewFrame.id)?.matchScore || 0.75
              }
              matchReason={
                mockTopRecommendations.find(f => f.id === quickViewFrame.id)?.matchReason ||
                "This frame complements your style preferences and face shape."
              }
            />
          )}
        </>
      )}
    </PageContainer>
  );
};

export default RecommendationsPage;