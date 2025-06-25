# VisionCraft Eyewear - Retail Store Demo

A modern, responsive eyewear retail store powered by the EyewearML platform. This demo showcases how eyewear retailers can create beautiful, AI-enhanced online stores for their customers.

## Features

### 🛍️ Customer Experience
- **Modern Retail Interface**: Professional eyewear store design
- **AI-Powered Recommendations**: Face shape compatibility scoring
- **Product Search & Filtering**: Find the perfect frames quickly
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Product Quick View**: Detailed product information in modals
- **Shopping Cart Integration**: Add to cart functionality (demo)

### 🤖 AI Enhancement
- **Face Shape Compatibility**: AI-powered compatibility scores for different face shapes
- **Smart Product Recommendations**: Personalized suggestions based on customer preferences
- **Enhanced Product Data**: AI-generated descriptions and style keywords
- **Visual Search**: Find similar frames based on style preferences

### 🎨 Design Features
- **Premium UI/UX**: Modern gradient design with smooth animations
- **Product Collections**: Organized by Professional, Casual, and Premium categories
- **Interactive Elements**: Hover effects, smooth scrolling, and transitions
- **Accessibility**: WCAG compliant design with proper contrast and navigation

## Technology Stack

- **Frontend**: HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
- **API Integration**: EyewearML REST API
- **Deployment**: Docker containerization for cloud deployment
- **Responsive Framework**: Bootstrap 5 with custom CSS enhancements

## Quick Start

### Local Development

1. **Clone and Navigate**:
   ```bash
   git clone <repository>
   cd apps/html-store
   ```

2. **Open in Browser**:
   ```bash
   # Open index.html in your browser
   open index.html  # macOS
   start index.html # Windows
   ```

3. **Local Server** (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Then visit http://localhost:8000
   ```

### Docker Deployment

1. **Build Container**:
   ```bash
   docker build -t visioncraft-store .
   ```

2. **Run Container**:
   ```bash
   docker run -p 8080:80 visioncraft-store
   ```

3. **Visit**: http://localhost:8080

### Cloud Deployment

The store is configured for deployment to major cloud platforms:

- **Google Cloud Run**: Automated deployment via Cloud Build
- **AWS ECS**: Container-ready for ECS deployment
- **Azure Container Instances**: Direct container deployment
- **Netlify/Vercel**: Static site deployment options

## API Integration

The store integrates with the EyewearML API to provide:

### Endpoints Used
- `GET /api/v1/frames` - Fetch eyewear products
- `GET /api/v1/frames/{id}` - Get specific product details
- `GET /api/v1/recommendations` - AI-powered recommendations

### Configuration
API configuration is handled in `js/api-client.js`:

```javascript
const visionCraftClient = new VisionCraftClient(
    'https://your-api-endpoint.com/api/v1',
    'your-api-key'
);
```

## Customization

### Branding
Update branding elements in `index.html`:
- Store name and logo
- Color scheme in CSS variables
- Contact information
- Social media links

### Product Display
Customize product presentation in `js/main.js`:
- Product card layout
- Face shape compatibility display
- Search and filtering options
- Product modal content

### Styling
Modify the visual design in the `<style>` section of `index.html`:
- CSS custom properties for colors
- Component styling
- Responsive breakpoints
- Animation effects

## File Structure

```
apps/html-store/
├── index.html              # Main store page
├── js/
│   ├── api-client.js      # EyewearML API integration
│   └── main.js            # Store functionality
├── css/                   # Additional stylesheets (if needed)
├── images/                # Store assets
├── Dockerfile             # Container configuration
└── README.md             # This file
```

## Features in Detail

### AI-Enhanced Product Display
Each product shows:
- **Compatibility Scores**: Face shape compatibility percentages
- **Style Keywords**: AI-generated style descriptors
- **Smart Descriptions**: Enhanced product descriptions
- **Recommendation Engine**: "Customers also viewed" suggestions

### Customer Journey
1. **Landing**: Hero section with featured products
2. **Browse**: Product grid with search and filtering
3. **Discover**: AI-powered product recommendations
4. **Select**: Detailed product view with specifications
5. **Purchase**: Add to cart and checkout flow (demo)

### Responsive Design
- **Mobile-First**: Optimized for mobile shopping experience
- **Touch-Friendly**: Large buttons and touch targets
- **Fast Loading**: Optimized images and lazy loading
- **Offline Support**: Service worker for offline browsing (optional)

## Demo Data

The store includes fallback demo data when the API is unavailable:
- Sample eyewear products with realistic specifications
- AI compatibility scores for different face shapes
- Professional product images from Unsplash
- Realistic pricing and descriptions

## Performance

### Optimization Features
- **Lazy Loading**: Images load as needed
- **Debounced Search**: Efficient search input handling
- **Pagination**: Load more products on demand
- **Caching**: API response caching for better performance

### Metrics
- **Page Load**: < 3 seconds on 3G connection
- **First Contentful Paint**: < 1.5 seconds
- **Lighthouse Score**: 90+ for Performance, Accessibility, SEO
- **Mobile Friendly**: Google Mobile-Friendly Test compliant

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Security

- **Content Security Policy**: Implemented for XSS protection
- **HTTPS Only**: All external resources loaded over HTTPS
- **Input Sanitization**: User inputs properly sanitized
- **API Security**: Secure API key handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the EyewearML platform. See the main repository for license information.

## Support

For technical support or questions:
- **Documentation**: See the main EyewearML documentation
- **Issues**: Report bugs via GitHub issues
- **Contact**: hello@visioncraft.com

---

**VisionCraft Eyewear** - Powered by EyewearML Platform
