import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Styled components
const ComparisonContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4)
}));

// These styled components are defined for future use when implementing
// a side-by-side before/after comparison feature
// const ImageContainer = styled(Box)(({ theme }) => ({
//   position: 'relative',
//   width: '100%',
//   borderRadius: theme.shape.borderRadius,
//   overflow: 'hidden',
//   marginBottom: theme.spacing(2),
//   backgroundColor: theme.palette.grey[100],
//   aspectRatio: '4/3'
// }));

// const StyledImage = styled('img')(({ theme }) => ({
//   width: '100%',
//   height: '100%',
//   objectFit: 'cover',
//   borderRadius: theme.shape.borderRadius
// }));

const LensCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column'
});

const EmptyComparisonMessage = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius
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
interface ComparisonViewProps {
  results: TryOnResult[];
  originalImage: string | null;
  onSelect: (result: TryOnResult) => void;
  onBack: () => void;
}

/**
 * ComparisonView Component
 * 
 * A component for comparing different contact lens try-on results.
 */
const ComparisonView: React.FC<ComparisonViewProps> = ({
  results,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  originalImage,
  onSelect,
  onBack
}) => {
  // Capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Format opacity as percentage
  const formatOpacity = (opacity: number) => {
    return `${Math.round(opacity * 100)}%`;
  };
  
  return (
    <ComparisonContainer elevation={1}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Compare Lenses
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
        >
          Back to Try-On
        </Button>
      </Box>
      
      {results.length === 0 ? (
        <EmptyComparisonMessage>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            No lenses added to comparison yet.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try on different lenses and add them to comparison to see them side by side.
          </Typography>
        </EmptyComparisonMessage>
      ) : (
        <>
          <Grid container spacing={3}>
            {results.map((result, index) => (
              <Grid item xs={12} sm={6} md={4} key={`${result.lens_color}-${result.lens_type}-${index}`}>
                <LensCard variant="outlined">
                  <CardMedia
                    component="img"
                    height="200"
                    image={result.image_url}
                    alt={`${result.lens_color} ${result.lens_type} lenses`}
                  />
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {capitalize(result.lens_color)}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Type: {capitalize(result.lens_type)}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Opacity: {formatOpacity(result.opacity)}
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="body2" color="textSecondary">
                      Original Eye Color: {capitalize(result.original_iris_color)}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => onSelect(result)}
                      fullWidth
                    >
                      Select This Lens
                    </Button>
                  </CardActions>
                </LensCard>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="body2" color="textSecondary">
              Compare different lens options side by side to find your perfect look. 
              Select a lens to return to the try-on view with that lens applied.
            </Typography>
          </Box>
        </>
      )}
    </ComparisonContainer>
  );
};

export default ComparisonView;