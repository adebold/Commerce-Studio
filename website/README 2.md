# VARAi Commerce Studio - SAAS Platform Website

This directory contains the **actual VARAi Commerce Studio SAAS platform website** - the complete marketing and customer-facing website for the AI-powered eyewear retail platform.

## 🌟 What This Is

This is the **CORRECT** Commerce Studio website that includes:

- **Professional SAAS Landing Page** - Complete with hero section, features, pricing
- **VARAi Commerce Studio Branding** - Proper company branding and messaging
- **Customer Signup Flow** - Complete onboarding process for new merchants
- **Interactive Demos** - Virtual try-on and platform demonstrations
- **Merchant Dashboard** - Access to the full platform functionality
- **Responsive Design** - Mobile-first, modern UI/UX

## 🚀 Quick Deploy

Deploy the website to Google Cloud Run:

```bash
cd website
./deploy-website.sh
```

## 📁 Directory Structure

```
website/
├── index.html              # Main landing page
├── pricing.html            # Pricing plans
├── products.html           # Product showcase
├── solutions.html          # Solution pages
├── company.html            # About company
├── get_started.html        # Getting started guide
├── signup/                 # Customer signup flow
│   ├── index.html          # Signup form
│   └── complete.html       # Signup completion
├── dashboard/              # Merchant dashboard
│   └── index.html          # Dashboard interface
├── demos/                  # Interactive demos
│   └── virtual-try-on.html # Virtual try-on demo
├── css/                    # Stylesheets
│   └── main.css            # Main CSS with VARAi branding
├── js/                     # JavaScript functionality
│   ├── main.js             # Core functionality
│   ├── dashboard.js        # Dashboard features
│   └── onboarding.js       # Signup flow
├── Dockerfile              # Container configuration
├── nginx.conf              # Web server configuration
├── cloudbuild.yaml         # Cloud Build configuration
└── deploy-website.sh       # Deployment script
```

## 🎯 Key Features

### Landing Page
- **Hero Section** - "Transform Your Eyewear Business with AI"
- **Feature Highlights** - AI-powered recommendations, virtual try-on
- **Social Proof** - Customer testimonials and case studies
- **Call-to-Action** - Clear signup and demo buttons

### Signup Flow
- **Multi-step Onboarding** - Guided merchant registration
- **Store Configuration** - Business setup and preferences
- **Integration Options** - Connect existing systems
- **Welcome Dashboard** - Immediate value demonstration

### Dashboard
- **Merchant Portal** - Complete business management interface
- **Analytics Dashboard** - Sales metrics and insights
- **Product Management** - Inventory and catalog tools
- **Customer Insights** - AI-powered customer analytics

### Demos
- **Virtual Try-On** - Live demonstration of AR technology
- **AI Recommendations** - Personalized product suggestions
- **Platform Tour** - Interactive feature walkthrough

## 🔧 Technical Details

### Docker Configuration
- **Base Image**: nginx:alpine
- **Port**: 8080 (Cloud Run compatible)
- **Security**: Non-root user, security headers
- **Performance**: Gzip compression, caching headers

### Nginx Configuration
- **Routing**: SPA-friendly routing with fallbacks
- **Caching**: Optimized static asset caching
- **Security**: Security headers and HTTPS enforcement
- **Health Checks**: Built-in health endpoint

### Cloud Build
- **Multi-stage Build**: Optimized container creation
- **Automatic Deployment**: Direct to Cloud Run
- **Service Updates**: Updates both website and frontend services
- **Rollback Support**: Tagged images for easy rollback

## 🌐 Deployment URLs

After deployment, the website will be available at:

- **Primary Website**: `https://commerce-studio-website-[hash].us-central1.run.app`
- **Frontend Service**: `https://commerce-studio-frontend-[hash].us-central1.run.app`

## 🧪 Testing

The deployment script automatically tests:

1. **Health Check** - Verifies service is responding
2. **Content Verification** - Confirms VARAi branding is present
3. **Feature Testing** - Validates key functionality

## 📊 Monitoring

Monitor the deployed website:

```bash
# Check service status
gcloud run services describe commerce-studio-website --region=us-central1

# View logs
gcloud logs read --service=commerce-studio-website --region=us-central1

# Monitor metrics
gcloud monitoring dashboards list
```

## 🔄 Updates

To update the website:

1. Make changes to HTML/CSS/JS files
2. Run the deployment script: `./deploy-website.sh`
3. The script will build and deploy automatically
4. Both website and frontend services will be updated

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Docker syntax in Dockerfile
   - Verify all required files are present
   - Check Cloud Build logs

2. **Deployment Issues**
   - Verify Google Cloud project is set correctly
   - Check IAM permissions for Cloud Run
   - Ensure required APIs are enabled

3. **Runtime Issues**
   - Check nginx configuration syntax
   - Verify file paths and permissions
   - Review Cloud Run logs

### Support Commands

```bash
# Check deployment status
gcloud run services list --region=us-central1

# View detailed logs
gcloud logs tail --service=commerce-studio-website

# Test locally
docker build -t test-website .
docker run -p 8080:8080 test-website
```

## ✨ This is the REAL Commerce Studio SAAS Platform

This website represents the complete, production-ready VARAi Commerce Studio platform - not a placeholder or demo, but the actual customer-facing SAAS application that merchants will use to transform their eyewear businesses with AI technology.