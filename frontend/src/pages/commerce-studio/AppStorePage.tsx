import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  CardActionArea,
  Button,
  Chip,
  Rating,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import GlassesIcon from '@mui/icons-material/Visibility';
import InventoryIcon from '@mui/icons-material/Inventory';
import AnalyticsIcon from '@mui/icons-material/BarChart';
import ArIcon from '@mui/icons-material/ViewInAr';
import MarketingIcon from '@mui/icons-material/Campaign';
import HealthcareIcon from '@mui/icons-material/LocalHospital';
import EcommerceIcon from '@mui/icons-material/ShoppingCart';
import CustomerServiceIcon from '@mui/icons-material/Headset';
import BackgroundColorRounded from '@mui/icons-material/Style';
import SyncIcon from '@mui/icons-material/Sync';
import InsightsIcon from '@mui/icons-material/Insights';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ThreeDIcon from '@mui/icons-material/ThreeDRotation';
import ShareIcon from '@mui/icons-material/Share';

// App card component
interface AppCardProps {
  title: string;
  description: string;
  rating: number;
  reviewCount: number;
  developer: string;
  price: string;
  featured?: boolean;
  verified?: boolean;
  category: string;
  new?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({
  title,
  description,
  rating,
  reviewCount,
  developer,
  price,
  featured = false,
  verified = false,
  category,
  new: isNew = false
}) => {
  // Map app titles to appropriate icons
  const getAppIcon = () => {
    const iconProps = { style: { width: '100%', height: '100%' } };
    
    // App-specific icons
    if (title.includes("Frame Matcher")) return <GlassesIcon fontSize="large" {...iconProps} />;
    if (title.includes("Inventory Sync")) return <SyncIcon fontSize="large" {...iconProps} />;
    if (title.includes("Customer Insights")) return <InsightsIcon fontSize="large" {...iconProps} />;
    if (title.includes("Prescription")) return <ReceiptIcon fontSize="large" {...iconProps} />;
    if (title.includes("Virtual Try-On")) return <ThreeDIcon fontSize="large" {...iconProps} />;
    if (title.includes("Social Showroom")) return <ShareIcon fontSize="large" {...iconProps} />;
    if (title.includes("HTML Store")) return <EcommerceIcon fontSize="large" {...iconProps} />;
    if (title.includes("Shopify")) return <EcommerceIcon fontSize="large" {...iconProps} />;
    if (title.includes("WooCommerce")) return <EcommerceIcon fontSize="large" {...iconProps} />;
    if (title.includes("Retail POS")) return <InventoryIcon fontSize="large" {...iconProps} />;
    if (title.includes("Customer Feedback")) return <CustomerServiceIcon fontSize="large" {...iconProps} />;
    if (title.includes("SKU Genie")) return <InventoryIcon fontSize="large" {...iconProps} />;
    
    // Default icon based on category
    if (category === "Frame Selection") return <GlassesIcon fontSize="large" {...iconProps} />;
    if (category === "Inventory Management") return <InventoryIcon fontSize="large" {...iconProps} />;
    if (category === "Analytics") return <AnalyticsIcon fontSize="large" {...iconProps} />;
    if (category === "Augmented Reality") return <ArIcon fontSize="large" {...iconProps} />;
    if (category === "Marketing") return <MarketingIcon fontSize="large" {...iconProps} />;
    if (category === "Healthcare") return <HealthcareIcon fontSize="large" {...iconProps} />;
    if (category === "E-commerce") return <EcommerceIcon fontSize="large" {...iconProps} />;
    if (category === "Customer Service") return <CustomerServiceIcon fontSize="large" {...iconProps} />;
    if (category === "Retail Integration") return <InventoryIcon fontSize="large" {...iconProps} />;
    
    // Default fallback
    return <BackgroundColorRounded fontSize="large" {...iconProps} />;
  };

  return (
    <Card 
      elevation={featured ? 3 : 1} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: featured ? '1px solid #3f51b5' : 'none',
        position: 'relative'
      }}
    >
      {featured && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            zIndex: 1,
            bgcolor: '#3f51b5',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          FEATURED
        </Box>
      )}
      
      {isNew && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#ff9800',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          <NewReleasesIcon sx={{ fontSize: '0.75rem', mr: 0.5 }} />
          NEW
        </Box>
      )}
      
      <CardActionArea>
        <Box 
          sx={{ 
            height: 140, 
            bgcolor: title.includes("Frame Matcher") ? '#3f51b5' : 
                    title.includes("Inventory Sync") ? '#ff9800' :
                    title.includes("Customer Insights") ? '#4caf50' :
                    title.includes("Prescription") ? '#e91e63' :
                    title.includes("Virtual Try-On") ? '#9c27b0' :
                    title.includes("Social Showroom") ? '#00bcd4' : '#757575',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 2
          }}
        >
          {getAppIcon()}
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600, mb: 0 }}>
              {title}
            </Typography>
            <Chip 
              label={category} 
              size="small" 
              sx={{ 
                bgcolor: 'rgba(0, 0, 0, 0.08)', 
                fontSize: '0.7rem',
                height: '20px'
              }} 
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: '40px' }}>
            {description}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating 
              value={rating} 
              precision={0.5} 
              size="small" 
              readOnly 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              ({reviewCount})
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {developer}
            </Typography>
            {verified && (
              <VerifiedIcon 
                color="primary" 
                sx={{ ml: 0.5, fontSize: '1rem' }} 
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
      
      <Box sx={{ p: 2, pt: 0, mt: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            {price === "Free" ? "Free" : `$${price}`}
          </Typography>
          <Button variant="contained" size="small">
            {price === "Free" ? "Install" : "Buy"}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};

// Category card component
interface CategoryCardProps {
  title: string;
  count: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, count }) => {
  // Function to get the appropriate icon component based on category title
  const getCategoryIcon = () => {
    if (title === "Frame Selection") return <GlassesIcon color="primary" />;
    if (title === "Inventory Management") return <InventoryIcon sx={{ color: '#ff9800' }} />;
    if (title === "Analytics") return <AnalyticsIcon sx={{ color: '#4caf50' }} />;
    if (title === "Augmented Reality") return <ArIcon sx={{ color: '#9c27b0' }} />;
    if (title === "Marketing") return <MarketingIcon sx={{ color: '#00bcd4' }} />;
    if (title === "Healthcare") return <HealthcareIcon sx={{ color: '#e91e63' }} />;
    if (title === "E-commerce") return <EcommerceIcon sx={{ color: '#795548' }} />;
    if (title === "Customer Service") return <CustomerServiceIcon sx={{ color: '#607d8b' }} />;
    
    return <BackgroundColorRounded color="primary" />;
  };

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <CardActionArea sx={{ display: 'flex', alignItems: 'center', py: 1, px: 2 }}>
        <Box 
          sx={{ 
            width: 32, 
            height: 32, 
            mr: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {getCategoryIcon()}
        </Box>
        <Box>
          <Typography variant="subtitle1" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {count} apps
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  );
};

const AppStorePage = () => {
  // Example app data
  const apps = [
    {
      title: "Frame Matcher Pro",
      description: "Match frames to face shapes with AI precision",
      rating: 4.8,
      reviewCount: 156,
      developer: "OpticTech Solutions",
      price: "Free",
      featured: true,
      verified: true,
      category: "Frame Selection",
      new: true
    },
    {
      title: "Inventory Sync",
      description: "Sync inventory across multiple e-commerce platforms",
      rating: 4.6,
      reviewCount: 89,
      developer: "RetailConnect",
      price: "29.99",
      featured: false,
      verified: true,
      category: "Inventory Management"
    },
    {
      title: "Customer Insights",
      description: "Customer analytics and behavior tracking for eyewear retailers",
      rating: 4.2,
      reviewCount: 47,
      developer: "Data Optics Inc.",
      price: "49.99",
      featured: false,
      verified: false,
      category: "Analytics"
    },
    {
      title: "Prescription Validator",
      description: "Validate and process eyewear prescriptions digitally",
      rating: 4.7,
      reviewCount: 112,
      developer: "MedTech Solutions",
      price: "Free",
      featured: false,
      verified: true,
      category: "Healthcare"
    },
    {
      title: "Virtual Try-On",
      description: "Let customers try frames virtually using AR technology",
      rating: 4.9,
      reviewCount: 203,
      developer: "AR Eyewear",
      price: "79.99",
      featured: true,
      verified: true,
      category: "Augmented Reality",
      new: true
    },
    {
      title: "Social Showroom",
      description: "Share frame collections on social media with one click",
      rating: 4.1,
      reviewCount: 32,
      developer: "SocialOptics",
      price: "19.99",
      featured: false,
      verified: false,
      category: "Marketing"
    },
    {
      title: "HTML Store Integration",
      description: "Effortlessly integrate your eyewear catalog with any HTML-based storefront",
      rating: 4.7,
      reviewCount: 128,
      developer: "VARAi Official",
      price: "Free",
      featured: true,
      verified: true,
      category: "E-commerce",
      new: true
    },
    {
      title: "Shopify Connector",
      description: "Seamless integration with Shopify for eyewear businesses",
      rating: 4.8,
      reviewCount: 176,
      developer: "VARAi Official",
      price: "24.99",
      featured: false,
      verified: true,
      category: "E-commerce"
    },
    {
      title: "WooCommerce Plugin",
      description: "Add virtual try-on and recommendations to your WordPress store",
      rating: 4.5,
      reviewCount: 89,
      developer: "WebOptics",
      price: "19.99",
      featured: false,
      verified: true,
      category: "E-commerce"
    },
    {
      title: "Retail POS Connect",
      description: "Connect your in-store point of sale system with virtual inventory",
      rating: 4.3,
      reviewCount: 67,
      developer: "RetailTech Solutions",
      price: "59.99",
      featured: false,
      verified: true,
      category: "Retail Integration"
    },
    {
      title: "Customer Feedback Hub",
      description: "Collect and analyze customer feedback on frame styles and fits",
      rating: 4.4,
      reviewCount: 53,
      developer: "UserVoice Optics",
      price: "29.99",
      featured: false,
      verified: false,
      category: "Customer Service"
    },
    {
      title: "SKU Genie",
      description: "AI-powered SKU management and optimization for eyewear retailers",
      rating: 4.9,
      reviewCount: 142,
      developer: "VARAi Official",
      price: "69.99",
      featured: true,
      verified: true,
      category: "Inventory Management",
      new: false
    }
  ];

  // Example categories
  const categories = [
    { title: "Frame Selection", count: 24 },
    { title: "Inventory Management", count: 18 },
    { title: "Analytics", count: 15 },
    { title: "Augmented Reality", count: 12 },
    { title: "Marketing", count: 21 },
    { title: "Healthcare", count: 17 },
    { title: "E-commerce", count: 29 },
    { title: "Customer Service", count: 14 }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '2rem', md: '3rem' },
          letterSpacing: '-0.022em',
          mb: 2,
          textAlign: 'center',
        }}
      >
        VARAi App Store
      </Typography>
      
      <Typography
        variant="h6"
        sx={{
          fontWeight: 400,
          color: 'text.secondary',
          maxWidth: '800px',
          mx: 'auto',
          mb: 5,
          textAlign: 'center',
        }}
      >
        Extend your eyewear business with powerful apps and integrations
      </Typography>
      
      <Box sx={{ mb: 5 }}>
        <TextField
          fullWidth
          placeholder="Search for apps, categories, or developers..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label="All Apps" color="primary" />
          <Chip label="Free" />
          <Chip label="Premium" />
          <Chip label="New" />
          <Chip label="Trending" />
          <Chip label="Featured" />
        </Box>
      </Box>
      
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Featured Apps
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {apps.filter(app => app.featured).map((app, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <AppCard {...app} />
          </Grid>
        ))}
      </Grid>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Categories
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Price
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button size="small" variant="outlined" sx={{ justifyContent: 'flex-start' }}>
                Free
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start' }}>
                Paid
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start' }}>
                Free Trial Available
              </Button>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Developer
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button size="small" sx={{ justifyContent: 'flex-start' }}>
                Verified Partners
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start' }}>
                VARAi Official
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start' }}>
                Third-Party
              </Button>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            All Apps
          </Typography>
          
          <Grid container spacing={3}>
            {apps.map((app, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <AppCard {...app} />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined" size="large">
              Load More Apps
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AppStorePage;
