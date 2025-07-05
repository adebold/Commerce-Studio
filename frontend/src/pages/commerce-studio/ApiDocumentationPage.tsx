import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Box,
  Button,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import DoneIcon from '@mui/icons-material/Done';

// Custom TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Helper function for a11y
function a11yProps(index: number) {
  return {
    id: `api-tab-${index}`,
    'aria-controls': `api-tabpanel-${index}`,
  };
}

// Code block component
interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative', mb: 3 }}>
      <Box sx={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 5 
      }}>
        <Chip 
          size="small" 
          label={language} 
          sx={{ 
            mr: 1, 
            bgcolor: '#4a5568', 
            color: 'white',
            fontSize: '0.75rem',
            height: '24px'
          }} 
        />
        <IconButton 
          size="small" 
          onClick={handleCopy}
          sx={{ 
            color: copied ? 'success.main' : 'text.secondary',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
            },
            p: 0.5
          }}
        >
          {copied ? <DoneIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Box>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: '#1e293b',
          color: '#e2e8f0',
          fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
          fontSize: '0.875rem',
          position: 'relative',
          overflowX: 'auto',
          whiteSpace: 'pre',
          maxWidth: '100%'
        }}
      >
        <pre style={{ margin: 0 }}>{code}</pre>
      </Paper>
    </Box>
  );
};

// Endpoint component
interface EndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requestParams?: Array<{ name: string; type: string; required: boolean; description: string }>;
  responseExample: string;
  requestExample?: string;
}

const Endpoint: React.FC<EndpointProps> = ({ 
  method, 
  path, 
  description, 
  requestParams, 
  responseExample,
  requestExample
}) => {
  const methodColors = {
    GET: '#10b981',
    POST: '#3b82f6',
    PUT: '#f59e0b',
    DELETE: '#ef4444',
    PATCH: '#8b5cf6'
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Chip 
          label={method} 
          sx={{ 
            mr: 2, 
            bgcolor: methodColors[method], 
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '4px'
          }} 
        />
        <Typography 
          variant="h6" 
          component="span" 
          sx={{ 
            fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
            fontSize: '1rem',
            fontWeight: 400
          }}
        >
          {path}
        </Typography>
      </Box>
      
      <Typography paragraph>{description}</Typography>
      
      {requestParams && requestParams.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Request Parameters</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Parameter</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestParams.map((param, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontFamily: 'Consolas, Monaco, monospace' }}>{param.name}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={param.type} 
                        sx={{ 
                          bgcolor: '#f1f5f9', 
                          fontSize: '0.75rem',
                          height: '20px'
                        }} 
                      />
                    </TableCell>
                    <TableCell>{param.required ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{param.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {requestExample && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Request Example</Typography>
          <CodeBlock code={requestExample} language="json" />
        </Box>
      )}
      
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Response Example</Typography>
      <CodeBlock code={responseExample} language="json" />
    </Box>
  );
};

const ApiDocumentationPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
        API Documentation
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
        Integrate VARAi's powerful eyewear AI with your applications through our RESTful API
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              API Reference
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                size="small"
                placeholder="Search endpoints"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip label="All" color={tabValue === 0 ? "primary" : "default"} onClick={() => setTabValue(0)} />
                <Chip label="Frames" color={tabValue === 1 ? "primary" : "default"} onClick={() => setTabValue(1)} />
                <Chip label="Recommendations" color={tabValue === 2 ? "primary" : "default"} onClick={() => setTabValue(2)} />
                <Chip label="Users" color={tabValue === 3 ? "primary" : "default"} onClick={() => setTabValue(3)} />
              </Box>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Getting Started
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                Authentication
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                Rate Limiting
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                Error Handling
              </Button>
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              SDKs & Libraries
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                JavaScript
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                Python
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                PHP
              </Button>
              <Button size="small" sx={{ justifyContent: 'flex-start', textTransform: 'none' }}>
                Ruby
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="API documentation tabs">
                <Tab label="Overview" {...a11yProps(0)} />
                <Tab label="Frames API" {...a11yProps(1)} />
                <Tab label="Recommendations API" {...a11yProps(2)} />
                <Tab label="Users API" {...a11yProps(3)} />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" gutterBottom>Getting Started with VARAi API</Typography>
              <Typography paragraph>
                The VARAi API provides programmatic access to our AI-powered eyewear recommendation platform. You can use our API to integrate frame recommendations, style analysis, fit consultation, and more into your applications.
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Authentication</Typography>
              <Typography paragraph>
                All API requests require authentication using an API key. You can generate an API key from your developer dashboard.
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>API Key Authentication</Typography>
              <CodeBlock 
                language="bash"
                code={`curl -X GET "https://api.varai.com/v1/frames" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Base URL</Typography>
              <Typography component="div" paragraph>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f8fafc', 
                  borderRadius: 1,
                  fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                  fontSize: '0.9rem'
                }}>
                  https://api.varai.com/v1
                </Box>
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Response Format</Typography>
              <Typography paragraph>
                All responses are returned in JSON format. Each response includes a <code>success</code> boolean field indicating whether the request was successful, along with either a <code>data</code> field (for successful requests) or an <code>error</code> field (for failed requests).
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>Success Response</Typography>
              <CodeBlock 
                language="json"
                code={`{
  "success": true,
  "data": {
    // Response data here
  }
}`}
              />
              
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Error Response</Typography>
              <CodeBlock 
                language="json"
                code={`{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}`}
              />
              
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Rate Limiting</Typography>
              <Typography paragraph>
                API requests are rate-limited to ensure fair usage and system stability. Rate limits are based on your subscription tier.
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Rate Limit</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Burst Limit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Developer</TableCell>
                      <TableCell>100 requests/minute</TableCell>
                      <TableCell>120 requests/minute</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Business</TableCell>
                      <TableCell>500 requests/minute</TableCell>
                      <TableCell>600 requests/minute</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Enterprise</TableCell>
                      <TableCell>1,000+ requests/minute</TableCell>
                      <TableCell>1,200+ requests/minute</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography paragraph>
                Rate limit information is included in the HTTP headers of each response:
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#f8fafc', 
                borderRadius: 1,
                fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                fontSize: '0.9rem',
                mb: 3
              }}>
                X-RateLimit-Limit: 100<br />
                X-RateLimit-Remaining: 95<br />
                X-RateLimit-Reset: 1619194742
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" gutterBottom>Frames API</Typography>
              <Typography paragraph>
                The Frames API allows you to manage and query the eyewear frames catalog.
              </Typography>
              
              <Endpoint 
                method="GET"
                path="/frames"
                description="Retrieve a list of frames with optional filtering."
                requestParams={[
                  { name: "brand", type: "string", required: false, description: "Filter frames by brand name" },
                  { name: "style", type: "string", required: false, description: "Filter frames by style (e.g., 'round', 'rectangle')" },
                  { name: "material", type: "string", required: false, description: "Filter frames by material (e.g., 'acetate', 'metal')" },
                  { name: "color", type: "string", required: false, description: "Filter frames by color" },
                  { name: "page", type: "integer", required: false, description: "Page number for pagination" },
                  { name: "limit", type: "integer", required: false, description: "Number of results per page (default: 20, max: 100)" }
                ]}
                responseExample={`{
  "success": true,
  "data": {
    "frames": [
      {
        "id": "f12345",
        "name": "Classic Wayframe",
        "brand": "RayBender",
        "style": "rectangle",
        "material": "acetate",
        "color": "tortoise",
        "price": 129.99,
        "dimensions": {
          "bridge": 20,
          "temple": 145,
          "lens_width": 52,
          "lens_height": 35
        },
        "images": [
          "https://api.varai.com/images/frames/f12345_1.jpg",
          "https://api.varai.com/images/frames/f12345_2.jpg"
        ],
        "created_at": "2024-12-01T10:30:00Z",
        "updated_at": "2025-02-15T14:22:33Z"
      }
    ],
    "pagination": {
      "total": 256,
      "pages": 13,
      "current_page": 1,
      "per_page": 20
    }
  }
}`}
              />
              
              <Endpoint 
                method="GET"
                path="/frames/{frame_id}"
                description="Retrieve details about a specific frame."
                requestParams={[
                  { name: "frame_id", type: "string", required: true, description: "Unique identifier of the frame" }
                ]}
                responseExample={`{
  "success": true,
  "data": {
    "id": "f12345",
    "name": "Classic Wayframe",
    "brand": "RayBender",
    "style": "rectangle",
    "material": "acetate",
    "color": "tortoise",
    "price": 129.99,
    "dimensions": {
      "bridge": 20,
      "temple": 145,
      "lens_width": 52,
      "lens_height": 35
    },
    "images": [
      "https://api.varai.com/images/frames/f12345_1.jpg",
      "https://api.varai.com/images/frames/f12345_2.jpg"
    ],
    "created_at": "2024-12-01T10:30:00Z",
    "updated_at": "2025-02-15T14:22:33Z",
    "variants": [
      {
        "id": "f12345-black",
        "color": "black",
        "images": [
          "https://api.varai.com/images/frames/f12345-black_1.jpg"
        ]
      },
      {
        "id": "f12345-blue",
        "color": "blue",
        "images": [
          "https://api.varai.com/images/frames/f12345-blue_1.jpg"
        ]
      }
    ],
    "similar_frames": [
      "f23456",
      "f34567"
    ]
  }
}`}
              />
              
              <Endpoint 
                method="POST"
                path="/frames"
                description="Add a new frame to the catalog. Requires admin or brand manager permissions."
                requestParams={[
                  { name: "name", type: "string", required: true, description: "Name of the frame" },
                  { name: "brand", type: "string", required: true, description: "Brand name" },
                  { name: "style", type: "string", required: true, description: "Frame style" },
                  { name: "material", type: "string", required: true, description: "Frame material" },
                  { name: "color", type: "string", required: true, description: "Primary color" },
                  { name: "price", type: "number", required: true, description: "Price in USD" },
                  { name: "dimensions", type: "object", required: true, description: "Frame dimensions" },
                  { name: "images", type: "array", required: false, description: "Array of image URLs" }
                ]}
                requestExample={`{
  "name": "Modern Round",
  "brand": "OpticTrend",
  "style": "round",
  "material": "metal",
  "color": "gold",
  "price": 149.99,
  "dimensions": {
    "bridge": 21,
    "temple": 140,
    "lens_width": 49,
    "lens_height": 49
  },
  "images": [
    "https://api.varai.com/images/frames/new_frame_1.jpg",
    "https://api.varai.com/images/frames/new_frame_2.jpg"
  ]
}`}
                responseExample={`{
  "success": true,
  "data": {
    "id": "f56789",
    "name": "Modern Round",
    "brand": "OpticTrend",
    "style": "round",
    "material": "metal",
    "color": "gold",
    "price": 149.99,
    "dimensions": {
      "bridge": 21,
      "temple": 140,
      "lens_width": 49,
      "lens_height": 49
    },
    "images": [
      "https://api.varai.com/images/frames/f56789_1.jpg",
      "https://api.varai.com/images/frames/f56789_2.jpg"
    ],
    "created_at": "2025-04-15T09:12:44Z",
    "updated_at": "2025-04-15T09:12:44Z"
  }
}`}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h5" gutterBottom>Recommendations API</Typography>
              <Typography paragraph>
                The Recommendations API provides AI-powered eyewear recommendations based on facial analysis, style preferences, and previous purchases.
              </Typography>
              
              <Endpoint 
                method="POST"
                path="/recommendations/style"
                description="Get style recommendations based on facial analysis."
                requestParams={[
                  { name: "image", type: "string (base64)", required: true, description: "Base64-encoded facial image" },
                  { name: "preferences", type: "object", required: false, description: "Style preferences" }
                ]}
                requestExample={`{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "preferences": {
    "styles": ["round", "cat_eye"],
    "materials": ["acetate"],
    "colors": ["tortoise", "black"]
  }
}`}
                responseExample={`{
  "success": true,
  "data": {
    "face_analysis": {
      "face_shape": "oval",
      "facial_features": {
        "face_width": 142.5,
        "face_height": 195.8,
        "eye_distance": 68.2,
        "nose_width": 34.6
      }
    },
    "recommendations": [
      {
        "frame_id": "f34567",
        "name": "Cat Eye Classic",
        "brand": "Vista Luxe",
        "confidence_score": 0.92,
        "match_reasons": [
          "Complements oval face shape",
          "Matches color preference",
          "Popular style for your demographics"
        ],
        "image_url": "https://api.varai.com/images/frames/f34567_1.jpg"
      },
      {
        "frame_id": "f78901",
        "name": "Round Retro",
        "brand": "OpticTrend",
        "confidence_score": 0.88,
        "match_reasons": [
          "Matches style preference",
          "Complements facial proportions",
          "Similar to previously viewed frames"
        ],
        "image_url": "https://api.varai.com/images/frames/f78901_1.jpg"
      }
    ]
  }
}`}
              />
              
              <Endpoint 
                method="POST"
                path="/recommendations/fit"
                description="Analyze how well a specific frame fits a user's face."
                requestParams={[
                  { name: "image", type: "string (base64)", required: true, description: "Base64-encoded image of person wearing frames" },
                  { name: "frame_id", type: "string", required: false, description: "Frame ID (if known)" }
                ]}
                requestExample={`{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "frame_id": "f34567"
}`}
                responseExample={`{
  "success": true,
  "data": {
    "fit_analysis": {
      "overall_score": 85,
      "alignment": {
        "score": 90,
        "details": "Frames are well-aligned on the face"
      },
      "sizing": {
        "score": 80,
        "details": "Width is appropriate; temples could be slightly longer"
      },
      "bridge_fit": {
        "score": 85,
        "details": "Good bridge fit with minimal gap"
      },
      "pressure_points": {
        "score": 85,
        "details": "No significant pressure points detected"
      }
    },
    "recommendations": {
      "adjustments": [
        {
          "type": "temple_adjustment",
          "description": "Consider extending temples by 2-3mm for improved comfort"
        }
      ],
      "alternative_frames": [
        {
          "frame_id": "f45678",
          "name": "Modern Cat Eye",
          "brand": "Vista Luxe",
          "fit_score": 95,
          "image_url": "https://api.varai.com/images/frames/f45678_1.jpg"
        }
      ]
    }
  }
}`}
              />
              
              <Endpoint 
                method="GET"
                path="/recommendations/popular"
                description="Get popular frames based on various criteria."
                requestParams={[
                  { name: "category", type: "string", required: false, description: "Category filter (e.g., 'sunglasses', 'prescription')" },
                  { name: "face_shape", type: "string", required: false, description: "Filter by face shape compatibility" },
                  { name: "limit", type: "integer", required: false, description: "Number of results (default: 10, max: 50)" }
                ]}
                responseExample={`{
  "success": true,
  "data": {
    "popular_frames": [
      {
        "frame_id": "f12345",
        "name": "Classic Wayframe",
        "brand": "RayBender",
        "popularity_score": 98,
        "view_count": 12560,
        "purchase_count": 3450,
        "image_url": "https://api.varai.com/images/frames/f12345_1.jpg"
      }
    ],
    "trending_styles": [
      {
        "style": "oversized round",
        "popularity_change": "+15%",
        "example_frame_id": "f67890"
      },
      {
        "style": "thin metal",
        "popularity_change": "+12%",
        "example_frame_id": "f78901"
      }
    ]
  }
}`}
              />
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h5" gutterBottom>Users API</Typography>
              <Typography paragraph>
                The Users API allows you to manage user profiles, preferences, and purchase history.
              </Typography>
              
              <Endpoint 
                method="GET"
                path="/users/{user_id}"
                description="Retrieve user profile information."
                requestParams={[
                  { name: "user_id", type: "string", required: true, description: "Unique identifier of the user" }
                ]}
                responseExample={`{
  "success": true,
  "data": {
    "id": "u12345",
    "email": "user@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "preferences": {
      "favorite_styles": ["cat_eye", "round"],
      "preferred_materials": ["acetate"],
      "preferred_colors": ["tortoise", "black", "transparent"]
    },
    "measurements": {
      "pd": 62,
      "face_shape": "oval",
      "face_width": 138.5
    },
    "created_at": "2024-10-15T08:24:11Z",
    "updated_at": "2025-03-22T14:30:45Z"
  }
}`}
              />
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ApiDocumentationPage;
