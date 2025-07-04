# Installation Guide

This guide walks through the process of installing and setting up the Vertex AI Shopping Assistant integration for a Shopify store.

## Prerequisites

Before installing the Vertex AI Shopping Assistant, ensure you have:

1. **Google Cloud Platform Account**
   - Access to Vertex AI API
   - Proper permissions to create and manage API credentials
   - Billing enabled on your GCP project

2. **Shopify Account**
   - A Shopify store with eyewear products
   - Partner or development store access
   - Appropriate admin permissions

3. **Development Environment**
   - Node.js 18+ and npm/yarn
   - Git
   - A code editor (Visual Studio Code recommended)

## Installation Steps

### 1. Clone the Repository

Clone the EyewearML repository to your local machine:

```bash
git clone https://github.com/your-organization/eyewear-ml.git
cd eyewear-ml
```

### 2. Set Up Google Cloud Credentials

#### 2.1. Create a Google Cloud Project

If you don't have one already:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Enter a project name (e.g., "Eyewear Shopping Assistant")
4. Click "Create"

#### 2.2. Enable Vertex AI API

1. Go to [API Library](https://console.cloud.google.com/apis/library)
2. Search for "Vertex AI API"
3. Click "Enable"

#### 2.3. Create Service Account Credentials

1. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" > "Service Account"
3. Enter a name and description, then click "Create"
4. Grant "Vertex AI User" role
5. Click "Continue" and then "Done"
6. Click on the newly created service account
7. Go to the "Keys" tab
8. Click "Add Key" > "Create new key"
9. Choose JSON and click "Create"
10. Save the downloaded JSON file securely

### 3. Install Dependencies

Install the required dependencies:

```bash
# Navigate to the Shopify app directory
cd apps/shopify

# Install dependencies
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `apps/shopify` directory:

```
# Shopify Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOP_DOMAIN=your-store.myshopify.com
HOST_NAME=your-app-hostname.com

# Vertex AI Configuration
VERTEX_AI_PROJECT_ID=your_gcp_project_id
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_CREDENTIALS_PATH=/path/to/credentials.json
VERTEX_AI_ENDPOINT_ID=shopping-assistant-endpoint
```

Replace the placeholder values with your actual credentials:

- `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`: Obtained from your Shopify Partner Dashboard
- `SHOP_DOMAIN`: Your Shopify store domain
- `HOST_NAME`: The hostname where your app is deployed
- `VERTEX_AI_PROJECT_ID`: Your Google Cloud project ID
- `VERTEX_AI_LOCATION`: The region where your Vertex AI resources are deployed
- `VERTEX_AI_CREDENTIALS_PATH`: Path to the downloaded JSON credentials file
- `VERTEX_AI_ENDPOINT_ID`: The endpoint ID for your Vertex AI model

For development environments, you can also create a `.env.development` file with specific development settings.

### 5. Test the Installation

Run the demo script to verify the installation:

```bash
node scripts/vertex-ai-demo.js
```

This should start a command-line interface where you can interact with the Vertex AI Shopping Assistant. Try asking a question like "Do you have any sunglasses for round faces?" to test the functionality.

## Deploying to Shopify

### 1. Create a Shopify App

1. Go to the [Shopify Partner Dashboard](https://partners.shopify.com/)
2. Click "Apps" > "Create app"
3. Choose "Public app" and enter app details
4. Set up the app URL and redirect URLs
5. Get your API credentials

### 2. Configure the App

Update your `.env` file with the Shopify API credentials obtained in the previous step.

### 3. Deploy the Backend

1. Deploy the backend API to your hosting platform (Heroku, Vercel, AWS, etc.)
2. Make sure the deployed API is accessible from the internet
3. Update the `HOST_NAME` in your environment variables

### 4. Add the App to Your Store

1. Go to your Shopify admin
2. Navigate to "Apps" > "Manage private apps"
3. Click "Create a new private app"
4. Configure the app permissions
5. Install the app

### 5. Add the Chat Widget to Your Theme

Add the Shopping Assistant component to your Shopify theme:

1. Navigate to your Shopify Admin
2. Go to "Online Store" > "Themes"
3. Click "Actions" > "Edit code"
4. Add the Shopping Assistant component to your theme layout

```liquid
<!-- In theme.liquid or another appropriate template -->
<div id="shopping-assistant-container"></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize the Shopping Assistant
    window.ShoppingAssistant({
      shopDomain: "{{ shop.domain }}",
      container: "shopping-assistant-container",
      primaryColor: "#5c6ac4",
      position: "bottom-right"
    });
  });
</script>
```

## Troubleshooting

### API Connection Issues

If you're having trouble connecting to the Vertex AI API:

1. Verify your credentials file is correctly referenced
2. Check that the Vertex AI API is enabled in your GCP project
3. Ensure your GCP project has billing enabled
4. Check the GCP console for any API quota issues

### Shopify Integration Issues

If the Shopify integration isn't working:

1. Verify your Shopify API credentials
2. Check that the app has the necessary permissions
3. Ensure the app is properly installed on your store
4. Check the browser console for any JavaScript errors

### Product Catalog Issues

If product recommendations aren't appearing:

1. Verify that your products have the necessary attributes (metafields)
2. Check that the product catalog sync is working
3. Ensure your products are visible and active in your Shopify store

## Next Steps

After successful installation:

1. Review the [Configuration Guide](./configuration.md) for detailed configuration options
2. Check the [Data Model Guide](../reference/data-models.md) to understand how to optimize your product catalog
3. Explore the [Chat Customization Guide](../user-guides/chat-customization.md) to customize the appearance and behavior of the chat widget
4. Read the [Development Guide](./development.md) if you plan to extend the functionality

## Support

If you encounter any issues not covered in this guide:

1. Review the complete documentation in the `docs/vertex_ai_integration` directory
2. Check for common issues in the [Troubleshooting Guide](../user-guides/troubleshooting.md)
3. Contact the development team for additional support
