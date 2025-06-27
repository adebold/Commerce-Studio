import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardMedia,
  Box,
  CircularProgress,
  CardActions,
  Divider,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useAuth, RBAC } from '../../components/auth/AuthProvider';
import MetricCard from '../../components/dashboard/MetricCard';
import ServiceStatus from '../../components/dashboard/ServiceStatus';
import { metricsService } from '../../services/metrics';
import {
  commerceStudioService,
  Product,
  PricingPlan,
} from "../../services/commerce-studio";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { MLMetrics, DataPipelineMetrics, APIMetrics, BusinessMetrics, SystemMetrics, ServiceStatus as ServiceStatusType } from '../../services/metrics';

// Color palette from design document
const COLORS = {
  primary: "#0A2463", // Deep blue
  secondary: "#00A6A6", // Teal accent
  background: "#FFFFFF", // Clean white
  backgroundAlt: "#F8F9FA", // Subtle gray
  text: "#333333", // Dark gray
  headings: "#000000", // Black
  accent: "#FF5A5F", // Coral for CTA
};

// Styled components
const FeatureCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  border: "none",
  borderRadius: theme.shape.borderRadius * 2,
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.1)",
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 24,
  padding: "10px 24px",
  fontWeight: 600,
  textTransform: "none",
  fontSize: "1rem",
}));

const LearnMoreLink = styled(Button)(({ theme }) => ({
  color: COLORS.secondary,
  padding: theme.spacing(1, 0),
  fontWeight: 500,
  textTransform: "none",
  "&:hover": {
    backgroundColor: "transparent",
  },
  "& .MuiButton-endIcon": {
    transition: "transform 0.2s ease-in-out",
  },
  "&:hover .MuiButton-endIcon": {
    transform: "translateX(4px)",
  },
}));

const HeroSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(4, 2),
  background: `linear-gradient(135deg, ${COLORS.backgroundAlt} 0%, ${COLORS.background} 100%)`,
  marginBottom: theme.spacing(10),
  position: "relative",
  overflow: "hidden",
  width: "100vw",
  marginLeft: "calc(-50vw + 50%)",
  boxSizing: "border-box",
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(6),
  position: "relative",
  display: "inline-block",
  textAlign: "center",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: -10,
    left: "50%",
    transform: "translateX(-50%)",
    width: 60,
    height: 3,
    backgroundColor: COLORS.secondary,
  },
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  position: "relative",
  overflow: "visible",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.1)",
  },
  "&:before": {
    content: '"""',
    position: "absolute",
    top: 15,
    left: 20,
    fontSize: "4rem",
    lineHeight: 1,
    color: "rgba(0, 166, 166, 0.15)",
    fontFamily: '"Georgia", serif',
  },
}));

// TypeScript interface for the PricingCard props
interface PricingCardProps {
  featured?: boolean;
}

const PricingCard = styled(Card)<PricingCardProps>(
  ({ theme, featured = false }) => ({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: featured
      ? "0 8px 24px rgba(0, 0, 0, 0.12)"
      : "0 4px 12px rgba(0, 0, 0, 0.05)",
    border: featured ? `2px solid ${COLORS.secondary}` : "none",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    transform: featured ? "translateY(-12px)" : "none",
    overflow: "hidden",
    position: "relative",
    "&:hover": {
      transform: featured ? "translateY(-20px)" : "translateY(-12px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    },
  })
);

const PartnerLogo = styled(Box)(() => ({
  filter: "grayscale(100%)",
  opacity: 0.7,
  transition: "filter 0.3s ease, opacity 0.3s ease",
  maxWidth: 120,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    filter: "grayscale(0%)",
    opacity: 1,
  },
  "& img": {
    maxWidth: "100%",
    maxHeight: "100%",
  },
}));

const AppCard = styled(Card)(({ theme }) => ({
  width: 200,
  height: 240,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  padding: theme.spacing(3, 2),
  margin: theme.spacing(0, 1),
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.1)",
  },
}));

const AppIcon = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: 16,
  backgroundColor: theme.palette.grey[100],
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  overflow: "hidden",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
}));

// High-quality image URLs for various sections
const FEATURED_IMAGES = {
  faceShapeAnalysis:
    "https://s.ygstatic.com/image/face-shape/avatar-oblong-man.1440.2da2b7c4-bd1.jpg",
  virtualTryOn: "https://vu.ca/wp-content/uploads/2024/11/0G8A5070-2.jpg",
  aiRecommendations:
    "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80",
  productCatalog:
    "https://images.unsplash.com/photo-1556015048-4d3aa10df74c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80",
  heroBackground:
    "https://plugins-media.makeupar.com/smb/blog/post/2023-05-24/d2147afd-406e-4aba-beaa-1d44c38d53e4.jpg",
  integrationVisualization:
    "/freepik__create-me-a-hd-image-for-my-website-which-shows-th__21770.png",
  appMarketplace:
    "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80",
};

// Partner logos - using actual brand logos
const PARTNER_LOGOS = [
  {
    name: "Shopify",
    logo: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
  },
  {
    name: "Epic",
    logo: "https://1000logos.net/wp-content/uploads/2023/04/Epic-Systems-Logo.jpg",
  },
  {
    name: "Apollo",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVouz1keLbNkeEmXfm6ZBJwUdexXAVidM52A&s",
  },
  {
    name: "WooCommerce",
    logo: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
  },
];

// App marketplace data with proper icons
const MARKETPLACE_APPS = [
  {
    id: "1",
    name: "Product Manager",
    icon: "https://img.icons8.com/fluency/96/null/product.png",
    description: "Manage your product catalog",
  },
  {
    id: "2",
    name: "Style Analyzer",
    icon: "https://img.icons8.com/fluency/96/null/design.png",
    description: "Analyze product styles",
  },
  {
    id: "3",
    name: "Customer Insights",
    icon: "https://img.icons8.com/fluency/96/null/commercial.png",
    description: "Understand customer behavior",
  },
  {
    id: "4",
    name: "Face Scanner",
    icon: "https://img.icons8.com/fluency/96/null/face-id.png",
    description: "Scan customer face shapes",
  },
  {
    id: "5",
    name: "Inventory Sync",
    icon: "https://img.icons8.com/?size=100&id=jpw42mwg1V9K&format=png&color=000000",
    description: "Sync inventory across platforms",
  },
];

// Testimonial data with realistic avatars
const TESTIMONIALS = [
  {
    id: "1",
    quote:
      "VARAi Commerce Studio increased our online conversion rate by 25% and reduced returns by 15%. The face shape analysis feature is a game-changer.",
    author: "Sarah Johnson",
    position: "E-commerce Director",
    company: "EyeStyle Boutique",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    metric: "+25% Conversion Rate",
  },
  {
    id: "2",
    quote:
      "We integrated VARAi with our existing PMS and saw immediate improvements in customer satisfaction. The AI recommendations are remarkably accurate.",
    author: "Michael Chen",
    position: "CTO",
    company: "OptiVision Network",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    metric: "+32% Customer Satisfaction",
  },
];

// Feature icons with high-quality icons
const KEY_FEATURES = [
  {
    id: "1",
    name: "AI-Powered Product Enhancement",
    description: "Automatic optimization of product data with advanced AI",
    icon: "https://img.icons8.com/fluency/96/null/artificial-intelligence.png",
  },
  {
    id: "2",
    name: "Seamless Integration",
    description: "Connect with your existing systems effortlessly",
    icon: "https://img.icons8.com/fluency/96/null/api-settings.png",
  },
  {
    id: "3",
    name: "Enterprise Security",
    description: "Bank-level security for all your business data",
    icon: "https://img.icons8.com/?size=100&id=BtpxDGxJCEOg&format=png&color=000000",
  },
];

const HomePage = () => {
  useAuth(); // Initialize auth context
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard state
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [metrics, setMetrics] = useState<{
    ml: MLMetrics;
    pipeline: DataPipelineMetrics;
    api: APIMetrics;
    business: BusinessMetrics;
    system: SystemMetrics;
    status: ServiceStatusType;
  }>(metricsService.getMockData());

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Using mock data for now
        setMetrics(metricsService.getMockData());
      } catch {
        // Fallback to mock data on error
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [productsData, pricingData] = await Promise.all([
          commerceStudioService.getProducts(),
          commerceStudioService.getPricingPlans(),
        ]);

        // Get the first 3 products as featured products
        setFeaturedProducts(productsData.slice(0, 3));
        setPricingPlans(pricingData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log(featuredProducts);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* RBAC conditional rendering for admin dashboard */}
      <RBAC resourceType="admin-dashboard">
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 600,
              mb: 3,
            }}
          >
            Admin Dashboard
          </Typography>

          {/* System Health Row (across the top) */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="CPU Usage"
                  value={formatPercentage(metrics.system.cpuUsage)}
                  loading={dashboardLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Memory Usage"
                  value={formatPercentage(metrics.system.memoryUsage)}
                  loading={dashboardLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Storage Usage"
                  value={formatPercentage(metrics.system.storageUsage)}
                  loading={dashboardLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Active Jobs"
                  value={metrics.system.activeJobs.toString()}
                  loading={dashboardLoading}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Platform Metrics */}
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Platform Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Model Accuracy"
                  value={formatPercentage(metrics.ml.modelAccuracy)}
                  loading={dashboardLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="API Response Time"
                  value={`${metrics.ml.apiResponseTime}ms`}
                  loading={dashboardLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Active Integrations"
                  value={formatNumber(metrics.business.activeIntegrations)}
                  loading={dashboardLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  title="Conversion Rate"
                  value={formatPercentage(metrics.business.conversionRate)}
                  loading={dashboardLoading}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* App Status Table */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              App Status
            </Typography>
            <ServiceStatus status={metrics.status} loading={dashboardLoading} />
          </Paper>
        </Box>
      </RBAC>

      <Divider sx={{ my: 4 }} />
      {/* Hero Section - Full width like Apple.com */}
      <HeroSection>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
              letterSpacing: "-0.022em",
              mb: 3,
              color: COLORS.headings,
            }}
          >
            The Future of Eyewear Retail
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              color: COLORS.text,
              maxWidth: "800px",
              mx: "auto",
              mb: 5,
              fontSize: { xs: "1.1rem", md: "1.25rem" },
              lineHeight: 1.5,
            }}
          >
            AI-powered solutions for seamless omnichannel experiences
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <ActionButton
                variant="contained"
                size="large"
                href="/get-started"
                sx={{
                  bgcolor: COLORS.primary,
                  "&:hover": { bgcolor: "#0c2d7a" },
                  color: "white",
                  px: 4,
                }}
              >
                Get Started
              </ActionButton>
            </Grid>
            <Grid item>
              <ActionButton
                variant="outlined"
                size="large"
                href="/schedule-demo"
                sx={{
                  borderColor: COLORS.primary,
                  color: COLORS.primary,
                  "&:hover": { borderColor: "#0c2d7a", color: "#0c2d7a" },
                  px: 4,
                }}
              >
                Watch Demo
              </ActionButton>
            </Grid>
          </Grid>

          {/* Subtle animation/video placeholder */}
          <Box
            sx={{
              mt: 8,
              maxWidth: "800px",
              width: "100%",
              mx: "auto",
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Box
              component="img"
              src={FEATURED_IMAGES.heroBackground}
              alt="AI-powered eyewear retail"
              sx={{
                width: "100%",
                height: "auto",
              }}
            />
          </Box>
        </Container>
      </HeroSection>

      {/* Key Features Section */}
      <Box sx={{ py: 8, textAlign: "center" }}>
        <SectionHeading variant="h4">
          Intelligent Retail Solutions
        </SectionHeading>

        <Grid container spacing={4} justifyContent="center">
          {KEY_FEATURES.map((feature) => (
            <Grid item xs={12} md={4} key={feature.id}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 166, 166, 0.1)",
                    mb: 3,
                  }}
                >
                  <Box
                    component="img"
                    src={feature.icon}
                    alt={feature.name}
                    sx={{ width: 40, height: 40 }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{ fontWeight: 600, mb: 2, color: COLORS.headings }}
                >
                  {feature.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: COLORS.text }}>
                  {feature.description}
                </Typography>
                <Box sx={{ mt: "auto" }}>
                  <LearnMoreLink
                    endIcon={<ChevronRightIcon />}
                    href={`/features/${feature.id}`}
                  >
                    Learn more
                  </LearnMoreLink>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Integration Showcase */}
      <Box
        sx={{ py: 10, bgcolor: COLORS.backgroundAlt, borderRadius: 4, mb: 10 }}
      >
        <Container>
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 6,
              textAlign: "center",
              color: COLORS.headings,
            }}
          >
            Seamlessly Connect Your Retail Ecosystem
          </Typography>

          <Box
            sx={{
              width: "100%",
              maxWidth: 800,
              height: "auto",
              mx: "auto",
              mb: 6,

              overflow: "hidden",
              // boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box
              component="img"
              src={FEATURED_IMAGES.integrationVisualization}
              alt="Integration Visualization"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 2,
              }}
            />
          </Box>

          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="center"
          >
            {PARTNER_LOGOS.map((partner, index) => (
              <Grid item key={index}>
                <PartnerLogo>
                  <Box component="img" src={partner.logo} alt={partner.name} />
                </PartnerLogo>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Products Section */}
      <Box sx={{ py: 8, mb: 10 }}>
        <SectionHeading variant="h4" sx={{ textAlign: "center" }}>
          Our Products
        </SectionHeading>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", my: 4, color: "error.main" }}>
            <Typography variant="h6">{error}</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {featuredProducts.map((product) => (
              <Grid item xs={12} md={4} key={product.id}>
                <FeatureCard>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image || FEATURED_IMAGES.productCatalog}
                    alt={product.name}
                    sx={{
                      objectFit: "cover",
                      backgroundColor: "#f5f5f7",
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h5"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600, color: COLORS.headings }}
                    >
                      {product.name}
                    </Typography>
                    <Typography sx={{ color: COLORS.text }}>
                      {product.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 3, pb: 3 }}>
                    <LearnMoreLink
                      endIcon={<ArrowForwardIcon />}
                      href={`/products/${product.id}`}
                    >
                      Learn more
                    </LearnMoreLink>
                  </CardActions>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* App Marketplace Section */}
      <Box sx={{ py: 8, mb: 10, textAlign: "center" }}>
        <SectionHeading variant="h4">
          Powerful Apps for Every Need
        </SectionHeading>

        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            py: 4,
            px: 2,
            mb: 4,
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0,0,0,0.05)",
              borderRadius: 4,
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: 4,
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.15)",
              },
            },
          }}
        >
          {MARKETPLACE_APPS.map((app) => (
            <AppCard key={app.id}>
              <AppIcon>
                <Box component="img" src={app.icon} alt={app.name} />
              </AppIcon>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 600, color: COLORS.headings }}
              >
                {app.name}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.text, mb: 2 }}>
                {app.description}
              </Typography>
            </AppCard>
          ))}
        </Box>

        <ActionButton
          variant="contained"
          sx={{ bgcolor: COLORS.primary }}
          href="/marketplace"
        >
          Explore All Apps
        </ActionButton>
      </Box>

      {/* Testimonials Section */}
      <Box
        sx={{ py: 10, bgcolor: COLORS.backgroundAlt, borderRadius: 4, mb: 10 }}
      >
        <Container>
          <SectionHeading variant="h4">
            What Our Customers Are Saying
          </SectionHeading>

          <Grid container spacing={4}>
            {TESTIMONIALS.map((testimonial) => (
              <Grid item xs={12} md={6} key={testimonial.id}>
                <TestimonialCard>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1.1rem",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                      mb: 4,
                      pt: 2,
                      color: COLORS.text,
                    }}
                  >
                    {testimonial.quote}
                  </Typography>

                  <Box
                    sx={{ display: "flex", alignItems: "center", mt: "auto" }}
                  >
                    <Avatar
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: COLORS.headings }}
                      >
                        {testimonial.author}
                      </Typography>
                      <Typography variant="body2" sx={{ color: COLORS.text }}>
                        {testimonial.position}, {testimonial.company}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      pt: 2,
                      borderTop: `1px solid rgba(0,0,0,0.08)`,
                      color: COLORS.secondary,
                      fontWeight: 600,
                    }}
                  >
                    {testimonial.metric}
                  </Box>
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 8, mb: 10, textAlign: "center" }}>
        <SectionHeading variant="h4">
          Simple, Transparent Pricing
        </SectionHeading>

        <Grid container spacing={4} justifyContent="center">
          {pricingPlans.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id || index}>
              <PricingCard featured={index === 1}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, mb: 1, color: COLORS.headings }}
                  >
                    {plan.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: COLORS.primary }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ ml: 0.5, color: COLORS.text }}
                    >
                      {plan.period}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 3, color: COLORS.text }}
                  >
                    {plan.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ textAlign: "left", mb: 4 }}>
                    {plan.features.map((feature, i) => (
                      <Box
                        key={i}
                        sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
                      >
                        <Box
                          sx={{
                            minWidth: 24,
                            height: 24,
                            borderRadius: "50%",
                            bgcolor: "rgba(0, 166, 166, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mr: 1.5,
                            color: COLORS.secondary,
                          }}
                        >
                          ✓
                        </Box>
                        <Typography variant="body2" sx={{ color: COLORS.text }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
                <Box sx={{ p: 3, pt: 0, mt: "auto" }}>
                  <Button
                    fullWidth
                    variant={plan.buttonVariant}
                    sx={{
                      borderRadius: 6,
                      py: 1.5,
                      boxShadow:
                        plan.buttonVariant === "contained" ? 4 : "none",
                      bgcolor:
                        plan.buttonVariant === "contained"
                          ? COLORS.accent
                          : "transparent",
                      borderColor:
                        plan.buttonVariant === "outlined"
                          ? COLORS.accent
                          : "transparent",
                      color:
                        plan.buttonVariant === "contained"
                          ? "white"
                          : COLORS.accent,
                      "&:hover": {
                        bgcolor:
                          plan.buttonVariant === "contained"
                            ? "#e03e43"
                            : "rgba(255, 90, 95, 0.04)",
                        borderColor:
                          plan.buttonVariant === "outlined"
                            ? "#e03e43"
                            : "transparent",
                      },
                    }}
                    href={`/pricing/${plan.id}`}
                  >
                    {plan.buttonText}
                  </Button>
                </Box>
              </PricingCard>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Sign-up Section */}
      <Box
        sx={{
          py: 12,
          px: 4,
          textAlign: "center",
          borderRadius: 4,
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, #1a3f8d 100%)`,
          color: "white",
          mb: 10,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: "2rem", md: "2.5rem" },
          }}
        >
          Ready to Transform Your Business?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: "700px",
            mx: "auto",
            mb: 6,
            opacity: 0.9,
            fontSize: "1.1rem",
          }}
        >
          Get started today with VARAi Commerce Studio and see the difference
          AI-powered eyewear retail can make.
        </Typography>

        <Box
          component="form"
          sx={{
            display: "flex",
            maxWidth: 600,
            mx: "auto",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Box
            component="input"
            placeholder="Enter your email"
            sx={{
              flex: 1,
              py: 1.5,
              px: 3,
              borderRadius: { xs: 30, sm: "30px 0 0 30px" },
              border: "none",
              outline: "none",
              fontSize: "1rem",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            }}
          />
          <Button
            variant="contained"
            sx={{
              bgcolor: COLORS.accent,
              color: "white",
              py: 1.5,
              px: 4,
              borderRadius: { xs: 30, sm: "0 30px 30px 0" },
              "&:hover": {
                bgcolor: "#e03e43",
              },
              boxShadow: "none",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Get Started
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 4, opacity: 0.7 }}>
          Or{" "}
          <Button
            variant="text"
            sx={{
              color: "white",
              textDecoration: "underline",
              p: 0,
              fontWeight: 400,
              fontSize: "0.875rem",
              minWidth: "auto",
              ml: 0.5,
              verticalAlign: "baseline",
              "&:hover": {
                background: "transparent",
                opacity: 0.8,
              },
            }}
            href="/schedule-demo"
          >
            schedule a demo
          </Button>{" "}
          with our team
        </Typography>
      </Box>

      {/* Face Shape Analysis Section */}
      <Box
        sx={{
          py: 10,
          background: "linear-gradient(180deg, #fff 0%, #f5f5f7 100%)",
          mb: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={FEATURED_IMAGES.faceShapeAnalysis}
                alt="Face Shape Analysis"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  letterSpacing: "-0.022em",
                  color: "#1d1d1f",
                }}
              >
                Face Shape Analysis
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontSize: "1.2rem",
                  lineHeight: 1.5,
                  color: "#6e6e73",
                }}
              >
                Our advanced AI technology analyzes facial features to determine
                your unique face shape. Get personalized frame recommendations
                that complement your features perfectly.
              </Typography>
              <ActionButton
                variant="contained"
                color="primary"
                sx={{
                  bgcolor: "#0071e3",
                  "&:hover": { bgcolor: "#0077ed" },
                }}
                href="/face-shape-analysis"
              >
                Try It Now
              </ActionButton>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Virtual Try-On Section */}
      <Box
        sx={{
          py: 10,
          background: "#fff",
          mb: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            spacing={6}
            alignItems="center"
            direction={{ xs: "column-reverse", md: "row" }}
          >
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  letterSpacing: "-0.022em",
                  color: "#1d1d1f",
                }}
              >
                Virtual Try-On
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  fontSize: "1.2rem",
                  lineHeight: 1.5,
                  color: "#6e6e73",
                }}
              >
                See how each frame looks on you before you buy. Our AR
                technology provides an immersive virtual try-on experience that
                helps you make confident purchasing decisions.
              </Typography>
              <ActionButton
                variant="contained"
                color="primary"
                sx={{
                  bgcolor: "#0071e3",
                  "&:hover": { bgcolor: "#0077ed" },
                }}
                href="/virtual-try-on"
              >
                Start Virtual Try-On
              </ActionButton>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={FEATURED_IMAGES.virtualTryOn}
                alt="Virtual Try On"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Business Solutions Section */}
      <Paper
        elevation={0}
        sx={{
          p: 6,
          backgroundColor: "#f5f5f7",
          borderRadius: 3,
          mb: 8,
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 600,
                mb: 2,
                letterSpacing: "-0.022em",
              }}
            >
              Solutions for Your Business
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: "#6e6e73" }}>
              Our platform provides comprehensive solutions for eyewear
              retailers, brands, and manufacturers.
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: "#6e6e73" }}>
              From AI-powered product enhancement to seamless e-commerce
              integration, we have everything you need to succeed.
            </Typography>
            <ActionButton
              variant="contained"
              color="primary"
              sx={{
                bgcolor: "#0071e3",
                "&:hover": { bgcolor: "#0077ed" },
              }}
              href="/solutions"
            >
              Explore Solutions
            </ActionButton>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={FEATURED_IMAGES.productCatalog}
              alt="Solutions Visualization"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 2,
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.05)",
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            fontWeight: 600,
            mb: 3,
          }}
        >
          Ready to Get Started?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: "700px",
            mx: "auto",
            mb: 4,
            color: "text.secondary",
          }}
        >
          Try our platform today and transform your eyewear business with the
          power of AI.
        </Typography>
        <ActionButton
          variant="contained"
          color="primary"
          size="large"
          href="/contact"
        >
          Contact Us
        </ActionButton>
      </Box>
    </Container>
  );
};

export default HomePage;
