import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Typography } from '../../design-system/components/Typography/Typography';
import { Button } from '../../design-system/components/Button/Button';
import { Card } from '../../design-system/components/Card/Card';

// Styled components
const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.spacing[16]};
`;

const FilterSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.spacing[16]};
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const FilterButton = styled(Button)<{ isActive: boolean }>`
  opacity: ${({ isActive }) => (isActive ? 1 : 0.7)};
`;

const SortOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
`;

const PriceRangeContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const PriceInputs = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.spacing[8]};
  margin-top: ${({ theme }) => theme.spacing.spacing[8]};
`;

const PriceInput = styled.input`
  width: 80px;
  padding: 8px;
  border: 1px solid ${({ theme }) => theme.colors.neutral[300]};
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
  }
`;

// Component props
interface FilterSortControlsProps {
  options: {
    sortBy: string;
    filterByColor: string[];
    filterByMaterial: string[];
    filterByShape: string[];
    filterByPrice: [number, number];
  };
  availableFilters: {
    colors: string[];
    materials: string[];
    shapes: string[];
  };
  onFilterSortChange: (options: FilterSortControlsProps['options']) => void;
}

/**
 * FilterSortControls Component
 * 
 * A component for filtering and sorting frame recommendations.
 */
const FilterSortControls: React.FC<FilterSortControlsProps> = ({
  options,
  availableFilters,
  onFilterSortChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localOptions, setLocalOptions] = useState(options);
  
  // Handle sort change
  const handleSortChange = (sortBy: string) => {
    const updatedOptions = {
      ...localOptions,
      sortBy
    };
    setLocalOptions(updatedOptions);
    onFilterSortChange(updatedOptions);
  };
  
  // Toggle color filter
  const toggleColorFilter = (color: string) => {
    const updatedColors = localOptions.filterByColor.includes(color)
      ? localOptions.filterByColor.filter(c => c !== color)
      : [...localOptions.filterByColor, color];
    
    const updatedOptions = {
      ...localOptions,
      filterByColor: updatedColors
    };
    
    setLocalOptions(updatedOptions);
    onFilterSortChange(updatedOptions);
  };
  
  // Toggle material filter
  const toggleMaterialFilter = (material: string) => {
    const updatedMaterials = localOptions.filterByMaterial.includes(material)
      ? localOptions.filterByMaterial.filter(m => m !== material)
      : [...localOptions.filterByMaterial, material];
    
    const updatedOptions = {
      ...localOptions,
      filterByMaterial: updatedMaterials
    };
    
    setLocalOptions(updatedOptions);
    onFilterSortChange(updatedOptions);
  };
  
  // Toggle shape filter
  const toggleShapeFilter = (shape: string) => {
    const updatedShapes = localOptions.filterByShape.includes(shape)
      ? localOptions.filterByShape.filter(s => s !== shape)
      : [...localOptions.filterByShape, shape];
    
    const updatedOptions = {
      ...localOptions,
      filterByShape: updatedShapes
    };
    
    setLocalOptions(updatedOptions);
    onFilterSortChange(updatedOptions);
  };
  
  // Handle price range change
  const handlePriceChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const updatedPriceRange = [...localOptions.filterByPrice] as [number, number];
    updatedPriceRange[index] = numValue;
    
    // Ensure min <= max
    if (index === 0 && numValue > updatedPriceRange[1]) {
      updatedPriceRange[1] = numValue;
    } else if (index === 1 && numValue < updatedPriceRange[0]) {
      updatedPriceRange[0] = numValue;
    }
    
    const updatedOptions = {
      ...localOptions,
      filterByPrice: updatedPriceRange
    };
    
    setLocalOptions(updatedOptions);
    onFilterSortChange(updatedOptions);
  };
  
  // Clear all filters
  const clearFilters = () => {
    const updatedOptions = {
      ...localOptions,
      filterByColor: [],
      filterByMaterial: [],
      filterByShape: [],
      filterByPrice: [0, 500] as [number, number]
    };
    
    setLocalOptions(updatedOptions);
    onFilterSortChange(updatedOptions);
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    localOptions.filterByColor.length > 0 ||
    localOptions.filterByMaterial.length > 0 ||
    localOptions.filterByShape.length > 0 ||
    localOptions.filterByPrice[0] > 0 ||
    localOptions.filterByPrice[1] < 500;
  
  return (
    <Card variant="outlined">
      <Card.Header 
        title="Filter & Sort" 
        action={
          <Button 
            variant="secondary"
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        }
      />
      <Card.Content>
        <ControlsContainer>
          <SortOptions>
            <Typography variant="body2" muted style={{ marginRight: '8px', alignSelf: 'center' }}>
              Sort by:
            </Typography>
            
            {[
              { id: 'recommended', label: 'Recommended' },
              { id: 'price-low-high', label: 'Price: Low to High' },
              { id: 'price-high-low', label: 'Price: High to Low' },
              { id: 'name-a-z', label: 'Name: A-Z' },
              { id: 'name-z-a', label: 'Name: Z-A' }
            ].map(sort => (
              <Button
                key={sort.id}
                variant={localOptions.sortBy === sort.id ? 'primary' : 'secondary'}
                size="small"
                onClick={() => handleSortChange(sort.id)}
              >
                {sort.label}
              </Button>
            ))}
          </SortOptions>
          
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="small"
              onClick={clearFilters}
              style={{ alignSelf: 'flex-end' }}
            >
              Clear All Filters
            </Button>
          )}
          
          {isExpanded && (
            <>
              {availableFilters.colors.length > 0 && (
                <FilterSection>
                  <Typography variant="body2" gutterBottom>
                    Filter by Color:
                  </Typography>
                  
                  <FilterOptions>
                    {availableFilters.colors.map(color => (
                      <FilterButton
                        key={color}
                        variant="secondary"
                        size="small"
                        isActive={localOptions.filterByColor.includes(color)}
                        onClick={() => toggleColorFilter(color)}
                      >
                        {color}
                      </FilterButton>
                    ))}
                  </FilterOptions>
                </FilterSection>
              )}
              
              {availableFilters.materials.length > 0 && (
                <FilterSection>
                  <Typography variant="body2" gutterBottom>
                    Filter by Material:
                  </Typography>
                  
                  <FilterOptions>
                    {availableFilters.materials.map(material => (
                      <FilterButton
                        key={material}
                        variant="secondary"
                        size="small"
                        isActive={localOptions.filterByMaterial.includes(material)}
                        onClick={() => toggleMaterialFilter(material)}
                      >
                        {material}
                      </FilterButton>
                    ))}
                  </FilterOptions>
                </FilterSection>
              )}
              
              {availableFilters.shapes.length > 0 && (
                <FilterSection>
                  <Typography variant="body2" gutterBottom>
                    Filter by Shape:
                  </Typography>
                  
                  <FilterOptions>
                    {availableFilters.shapes.map(shape => (
                      <FilterButton
                        key={shape}
                        variant="secondary"
                        size="small"
                        isActive={localOptions.filterByShape.includes(shape)}
                        onClick={() => toggleShapeFilter(shape)}
                      >
                        {shape}
                      </FilterButton>
                    ))}
                  </FilterOptions>
                </FilterSection>
              )}
              
              <FilterSection>
                <Typography variant="body2" gutterBottom>
                  Price Range:
                </Typography>
                
                <PriceRangeContainer>
                  <PriceInputs>
                    <Typography variant="body2" muted>$</Typography>
                    <PriceInput
                      type="number"
                      min="0"
                      value={localOptions.filterByPrice[0]}
                      onChange={(e) => handlePriceChange(0, e.target.value)}
                      placeholder="Min"
                    />
                    <Typography variant="body2" muted>to</Typography>
                    <PriceInput
                      type="number"
                      min="0"
                      value={localOptions.filterByPrice[1]}
                      onChange={(e) => handlePriceChange(1, e.target.value)}
                      placeholder="Max"
                    />
                  </PriceInputs>
                </PriceRangeContainer>
              </FilterSection>
            </>
          )}
        </ControlsContainer>
      </Card.Content>
    </Card>
  );
};

export default FilterSortControls;