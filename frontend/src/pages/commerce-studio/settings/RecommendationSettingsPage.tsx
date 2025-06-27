import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Typography, Input, Card } from '../../../design-system';
import { FormSection, SettingsCard, ToggleSwitch } from '../../../components/settings';
import { settingsService, RecommendationSettings } from '../../../services/settings';

const RangeSlider = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const Slider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: ${({ theme }) => theme.colors.neutral[200]};
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary[500]};
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary[500]};
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.div`
  width: 40px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[12]};
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
  padding: ${({ theme }) => theme.spacing.spacing[8]};
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.spacing[8]};
  border-radius: 4px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
  }
  
  label {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.spacing[8]};
    width: 100%;
    cursor: pointer;
  }
  
  input {
    margin: 0;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * RecommendationSettingsPage Component
 * 
 * Page for managing recommendation algorithm settings and product filters.
 */
const RecommendationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<RecommendationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Mock categories for the demo
  const availableCategories = [
    'Sunglasses',
    'Prescription',
    'Reading',
    'Blue Light',
    'Sports',
    'Kids',
    'Luxury',
    'Vintage',
    'Accessories',
    'Contact Lenses',
  ];
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const recommendationSettings = await settingsService.getSettingsSection('recommendation');
        setSettings(recommendationSettings);
        setLoading(false);
      } catch (error) {
        console.error('Error loading recommendation settings:', error);
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const handleAlgorithmChange = (field: string, value: number) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      algorithm: {
        ...settings.algorithm,
        [field]: value,
      },
    });
  };
  
  const handleFilterChange = (field: string, value: boolean | number) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      filters: {
        ...settings.filters,
        [field]: value,
      },
    });
  };
  
  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    if (!settings) return;
    
    const numValue = value === '' ? undefined : Number(value);
    
    setSettings({
      ...settings,
      filters: {
        ...settings.filters,
        priceRange: {
          ...settings.filters.priceRange,
          [field]: numValue,
        },
      },
    });
  };
  
  const handleCategoryToggle = (category: string, listType: 'included' | 'excluded') => {
    if (!settings) return;
    
    if (listType === 'included') {
      const includedCategories = settings.filters.includedCategories.includes(category)
        ? settings.filters.includedCategories.filter(c => c !== category)
        : [...settings.filters.includedCategories, category];
      
      setSettings({
        ...settings,
        filters: {
          ...settings.filters,
          includedCategories,
        },
      });
    } else {
      const excludedCategories = settings.filters.excludedCategories.includes(category)
        ? settings.filters.excludedCategories.filter(c => c !== category)
        : [...settings.filters.excludedCategories, category];
      
      setSettings({
        ...settings,
        filters: {
          ...settings.filters,
          excludedCategories,
        },
      });
    }
  };
  
  const handleDisplayChange = (field: string, value: boolean | number) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      display: {
        ...settings.display,
        [field]: value,
      },
    });
  };
  
  const handleSaveAlgorithm = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('recommendation', {
        algorithm: settings.algorithm,
      });
      alert('Algorithm settings saved successfully!');
    } catch (error) {
      console.error('Error saving algorithm settings:', error);
      alert('Failed to save algorithm settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveFilters = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('recommendation', {
        filters: settings.filters,
      });
      alert('Filter settings saved successfully!');
    } catch (error) {
      console.error('Error saving filter settings:', error);
      alert('Failed to save filter settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveDisplay = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      await settingsService.updateSettings('recommendation', {
        display: settings.display,
      });
      alert('Display settings saved successfully!');
    } catch (error) {
      console.error('Error saving display settings:', error);
      alert('Failed to save display settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body1" align="center">
            Loading recommendation settings...
          </Typography>
        </Card.Content>
      </Card>
    );
  }
  
  if (!settings) {
    return (
      <Card variant="outlined">
        <Card.Content>
          <Typography variant="body1" align="center" color="semantic.error.main">
            Failed to load recommendation settings. Please refresh the page and try again.
          </Typography>
        </Card.Content>
      </Card>
    );
  }
  
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        Recommendation Settings
      </Typography>
      
      <SettingsCard
        title="Algorithm Weights"
        description="Configure how different factors influence product recommendations."
        onSave={handleSaveAlgorithm}
        saving={saving}
      >
        <FormSection title="Recommendation Factors">
          <div>
            <Typography variant="body1">
              Preference Weight
            </Typography>
            <Typography variant="body2" color="neutral.600">
              How much customer preferences influence recommendations
            </Typography>
            <RangeSlider>
              <SliderContainer>
                <Slider
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={settings.algorithm.preferenceWeight}
                  onChange={(e) => handleAlgorithmChange('preferenceWeight', parseFloat(e.target.value))}
                  aria-label="Preference Weight"
                />
                <SliderValue>{settings.algorithm.preferenceWeight.toFixed(1)}</SliderValue>
              </SliderContainer>
            </RangeSlider>
          </div>
          
          <div>
            <Typography variant="body1">
              Similarity Weight
            </Typography>
            <Typography variant="body2" color="neutral.600">
              How much product similarity influences recommendations
            </Typography>
            <RangeSlider>
              <SliderContainer>
                <Slider
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={settings.algorithm.similarityWeight}
                  onChange={(e) => handleAlgorithmChange('similarityWeight', parseFloat(e.target.value))}
                  aria-label="Similarity Weight"
                />
                <SliderValue>{settings.algorithm.similarityWeight.toFixed(1)}</SliderValue>
              </SliderContainer>
            </RangeSlider>
          </div>
          
          <div>
            <Typography variant="body1">
              Popularity Weight
            </Typography>
            <Typography variant="body2" color="neutral.600">
              How much product popularity influences recommendations
            </Typography>
            <RangeSlider>
              <SliderContainer>
                <Slider
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={settings.algorithm.popularityWeight}
                  onChange={(e) => handleAlgorithmChange('popularityWeight', parseFloat(e.target.value))}
                  aria-label="Popularity Weight"
                />
                <SliderValue>{settings.algorithm.popularityWeight.toFixed(1)}</SliderValue>
              </SliderContainer>
            </RangeSlider>
          </div>
          
          <div>
            <Typography variant="body1">
              New Arrivals Boost
            </Typography>
            <Typography variant="body2" color="neutral.600">
              How much to boost new products in recommendations
            </Typography>
            <RangeSlider>
              <SliderContainer>
                <Slider
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={settings.algorithm.newArrivalsBoost}
                  onChange={(e) => handleAlgorithmChange('newArrivalsBoost', parseFloat(e.target.value))}
                  aria-label="New Arrivals Boost"
                />
                <SliderValue>{settings.algorithm.newArrivalsBoost.toFixed(1)}</SliderValue>
              </SliderContainer>
            </RangeSlider>
          </div>
        </FormSection>
      </SettingsCard>
      
      <SettingsCard
        title="Product Filters"
        description="Configure which products are included in recommendations."
        onSave={handleSaveFilters}
        saving={saving}
      >
        <FormSection title="Availability Filters">
          <ToggleSwitch
            id="exclude-out-of-stock"
            label="Exclude Out of Stock Products"
            description="Don't recommend products that are out of stock"
            checked={settings.filters.excludeOutOfStock}
            onChange={(checked) => handleFilterChange('excludeOutOfStock', checked)}
          />
          
          <ToggleSwitch
            id="exclude-low-inventory"
            label="Exclude Low Inventory Products"
            description="Don't recommend products with low inventory levels"
            checked={settings.filters.excludeLowInventory}
            onChange={(checked) => handleFilterChange('excludeLowInventory', checked)}
          />
        </FormSection>
        
        <FormSection title="Quality Filters">
          <div>
            <Typography variant="body1">
              Minimum Rating
            </Typography>
            <Typography variant="body2" color="neutral.600">
              Only recommend products with at least this rating
            </Typography>
            <RangeSlider>
              <SliderContainer>
                <Slider
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={settings.filters.minimumRating}
                  onChange={(e) => handleFilterChange('minimumRating', parseFloat(e.target.value))}
                  aria-label="Minimum Rating"
                />
                <SliderValue>{settings.filters.minimumRating.toFixed(1)}</SliderValue>
              </SliderContainer>
            </RangeSlider>
          </div>
        </FormSection>
        
        <FormSection title="Price Range">
          <FormRow>
            <Input
              label="Minimum Price"
              type="number"
              value={settings.filters.priceRange.min?.toString() || ''}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              placeholder="No minimum"
            />
            <Input
              label="Maximum Price"
              type="number"
              value={settings.filters.priceRange.max?.toString() || ''}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              placeholder="No maximum"
            />
          </FormRow>
        </FormSection>
        
        <FormSection title="Category Filters">
          <div>
            <Typography variant="body1" gutterBottom>
              Included Categories
            </Typography>
            <Typography variant="body2" color="neutral.600" gutterBottom>
              Only recommend products from these categories (leave empty to include all)
            </Typography>
            <CategoryList>
              {availableCategories.map(category => (
                <CategoryItem key={`include-${category}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.filters.includedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category, 'included')}
                      aria-label={`Include ${category} category`}
                    />
                    {category}
                  </label>
                </CategoryItem>
              ))}
            </CategoryList>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <Typography variant="body1" gutterBottom>
              Excluded Categories
            </Typography>
            <Typography variant="body2" color="neutral.600" gutterBottom>
              Never recommend products from these categories
            </Typography>
            <CategoryList>
              {availableCategories.map(category => (
                <CategoryItem key={`exclude-${category}`}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.filters.excludedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category, 'excluded')}
                      aria-label={`Exclude ${category} category`}
                    />
                    {category}
                  </label>
                </CategoryItem>
              ))}
            </CategoryList>
          </div>
        </FormSection>
      </SettingsCard>
      
      <SettingsCard
        title="Display Settings"
        description="Configure how recommendations are displayed to customers."
        onSave={handleSaveDisplay}
        saving={saving}
      >
        <FormSection title="Recommendation Display">
          <div>
            <Typography variant="body1" gutterBottom>
              Maximum Recommendations
            </Typography>
            <Typography variant="body2" color="neutral.600" gutterBottom>
              Maximum number of products to display in recommendation widgets
            </Typography>
            <Input
              type="number"
              min={1}
              max={12}
              value={settings.display.maxRecommendations}
              onChange={(e) => handleDisplayChange('maxRecommendations', parseInt(e.target.value, 10))}
              style={{ maxWidth: '100px' }}
            />
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <Typography variant="body1" gutterBottom>
              Display Options
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ToggleSwitch
                id="show-prices"
                label="Show Prices"
                description="Display product prices in recommendation widgets"
                checked={settings.display.showPrices}
                onChange={(checked) => handleDisplayChange('showPrices', checked)}
              />
              
              <ToggleSwitch
                id="show-ratings"
                label="Show Ratings"
                description="Display product ratings in recommendation widgets"
                checked={settings.display.showRatings}
                onChange={(checked) => handleDisplayChange('showRatings', checked)}
              />
              
              <ToggleSwitch
                id="show-availability"
                label="Show Availability"
                description="Display product availability status in recommendation widgets"
                checked={settings.display.showAvailability}
                onChange={(checked) => handleDisplayChange('showAvailability', checked)}
              />
            </div>
          </div>
        </FormSection>
      </SettingsCard>
    </div>
  );
};

export default RecommendationSettingsPage;