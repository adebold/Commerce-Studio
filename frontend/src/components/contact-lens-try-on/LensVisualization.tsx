import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Divider,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Styled components
const VisualizationContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4)
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  aspectRatio: '4/3'
}));

const StyledImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: theme.shape.borderRadius
}));

const InfoCard = styled(Card)({
  height: '100%'
});

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2)
}));

// Types
interface TryOnResult {
  image_url: string;
  lens_color: string;
  lens_type: string;
  opacity: number;
  original_iris_color: string;
  confidence_score: number;
}

// Component props
interface LensVisualizationProps {
  tryOnResult: TryOnResult | null;
  originalImage: string | null;
  onAddToComparison: () => void;
  onViewComparison: () => void;
  onTryDifferent: () => void;
  comparisonCount: number;
}

/**
 * LensVisualization Component
 * 
 * A component for visualizing contact lens try-on results.
 */
const LensVisualization: React.FC<LensVisualizationProps> = ({
  tryOnResult,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  originalImage,
  onAddToComparison,
  onViewComparison,
  onTryDifferent,
  comparisonCount
}) => {
  if (!tryOnResult) {
    return (
      <VisualizationContainer elevation={1}>
        <Typography variant="h6" gutterBottom>
          Try-On Results
        </Typography>
        <Typography variant="body1" align="center" color="textSecondary" sx={{ py: 4 }}>
          No try-on results available. Please select a lens and try again.
        </Typography>
      </VisualizationContainer>
    );
  }
  
  // Format opacity as percentage
  const formatOpacity = (opacity: number) => {
    return `${Math.round(opacity * 100)}%`;
  };
  
  // Capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  return (
    <VisualizationContainer elevation={1}>
      <Typography variant="h6" gutterBottom>
        Try-On Results
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ImageContainer>
            <StyledImage src={tryOnResult.image_url} alt="Contact lens try-on" />
          </ImageContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <ActionButton
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onAddToComparison}
            >
              Add to Comparison
            </ActionButton>
            
            <ActionButton
              variant="outlined"
              startIcon={<CompareArrowsIcon />}
              onClick={onViewComparison}
              disabled={comparisonCount === 0}
            >
              <Badge badgeContent={comparisonCount} color="primary" sx={{ mr: 1 }}>
                View Comparison
              </Badge>
            </ActionButton>
            
            <ActionButton
              variant="contained"
              color="primary"
              startIcon={<VisibilityIcon />}
              onClick={onTryDifferent}
            >
              Try Different Lenses
            </ActionButton>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <InfoCard variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lens Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Lens Color
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {capitalize(tryOnResult.lens_color)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Lens Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {capitalize(tryOnResult.lens_type)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Opacity
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatOpacity(tryOnResult.opacity)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Original Eye Color
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {capitalize(tryOnResult.original_iris_color)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Confidence Score
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {Math.round(tryOnResult.confidence_score * 100)}%
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="textSecondary">
                Try different lens colors and types to find your perfect look. Add lenses to comparison to see them side by side.
              </Typography>
            </CardContent>
          </InfoCard>
        </Grid>
      </Grid>
    </VisualizationContainer>
  );
};

export default LensVisualization;