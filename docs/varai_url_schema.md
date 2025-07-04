# VARAi URL Schema

This document defines the URL schema for all VARAi platform components under the varai.ai domain.

## Domain Structure

The VARAi platform will use the following domain and subdomain structure:

| Domain/Subdomain | Purpose | Access |
|------------------|---------|--------|
| varai.ai | Main website and landing pages | Public |
| app.varai.ai | Commerce Studio dashboard | Authenticated merchants |
| api.varai.ai | Core API services | Authenticated via API keys |
| docs.varai.ai | Developer documentation | Public |
| try.varai.ai | Virtual try-on demo | Public |
| cdn.varai.ai | Static assets and media | Public |
| auth.varai.ai | Authentication service | Internal/API |
| analytics.varai.ai | Analytics dashboard | Authenticated merchants |
| partners.varai.ai | Partner portal | Authenticated partners |
| status.varai.ai | Service status page | Public |

## API Endpoint Structure

All API endpoints will follow RESTful conventions under the `api.varai.ai` domain:

### Core API

```
https://api.varai.ai/v1/[resource]/[identifier]/[action]
```

Examples:
- `https://api.varai.ai/v1/recommendations/product/123`
- `https://api.varai.ai/v1/frames/search`
- `https://api.varai.ai/v1/users/me/preferences`

### Authentication API

```
https://auth.varai.ai/v1/[action]
```

Examples:
- `https://auth.varai.ai/v1/login`
- `https://auth.varai.ai/v1/token`
- `https://auth.varai.ai/v1/refresh`

### Analytics API

```
https://analytics.varai.ai/v1/[resource]/[timeframe]
```

Examples:
- `https://analytics.varai.ai/v1/conversions/daily`
- `https://analytics.varai.ai/v1/engagement/monthly`
- `https://analytics.varai.ai/v1/revenue/quarterly`

## Frontend Application Routes

### Main Website (varai.ai)

```
https://varai.ai/[page]
```

Examples:
- `https://varai.ai/` (Home)
- `https://varai.ai/solutions`
- `https://varai.ai/pricing`
- `https://varai.ai/contact`

### Commerce Studio (app.varai.ai)

```
https://app.varai.ai/[section]/[resource]
```

Examples:
- `https://app.varai.ai/dashboard`
- `https://app.varai.ai/products/catalog`
- `https://app.varai.ai/analytics/conversions`
- `https://app.varai.ai/settings/integrations`

### Developer Documentation (docs.varai.ai)

```
https://docs.varai.ai/[section]/[topic]
```

Examples:
- `https://docs.varai.ai/api/authentication`
- `https://docs.varai.ai/sdks/javascript`
- `https://docs.varai.ai/integrations/shopify`

## E-commerce Integration Endpoints

### Shopify Integration

```
https://api.varai.ai/v1/integrations/shopify/[action]
```

Examples:
- `https://api.varai.ai/v1/integrations/shopify/webhook`
- `https://api.varai.ai/v1/integrations/shopify/products/sync`

### Magento Integration

```
https://api.varai.ai/v1/integrations/magento/[action]
```

Examples:
- `https://api.varai.ai/v1/integrations/magento/webhook`
- `https://api.varai.ai/v1/integrations/magento/products/sync`

### WooCommerce Integration

```
https://api.varai.ai/v1/integrations/woocommerce/[action]
```

Examples:
- `https://api.varai.ai/v1/integrations/woocommerce/webhook`
- `https://api.varai.ai/v1/integrations/woocommerce/products/sync`

### BigCommerce Integration

```
https://api.varai.ai/v1/integrations/bigcommerce/[action]
```

Examples:
- `https://api.varai.ai/v1/integrations/bigcommerce/webhook`
- `https://api.varai.ai/v1/integrations/bigcommerce/products/sync`

## Widget Embed URLs

The VARAi widgets will be embedded via JavaScript and will load resources from:

```
https://cdn.varai.ai/widgets/[widget-name]/v[version]/[resource]
```

Examples:
- `https://cdn.varai.ai/widgets/try-on/v1/try-on.js`
- `https://cdn.varai.ai/widgets/frame-finder/v1/frame-finder.js`
- `https://cdn.varai.ai/widgets/recommendations/v1/recommendations.js`

## Authentication Flow URLs

### OAuth Flow

```
https://auth.varai.ai/oauth/[action]
```

Examples:
- `https://auth.varai.ai/oauth/authorize`
- `https://auth.varai.ai/oauth/token`

### SSO Integration

```
https://auth.varai.ai/sso/[provider]
```

Examples:
- `https://auth.varai.ai/sso/google`
- `https://auth.varai.ai/sso/microsoft`

## Legacy URL Redirects

The following redirects will be implemented to ensure a smooth transition from legacy domains:

| Legacy URL Pattern | New URL Pattern |
|-------------------|-----------------|
| eyewear-ml.com/* | varai.ai/* |
| api.eyewear-ml.com/v1/* | api.varai.ai/v1/* |
| docs.eyewear-ml.com/* | docs.varai.ai/* |
| app.eyewear-ml.com/* | app.varai.ai/* |

## URL Parameters Standardization

All API endpoints will support the following standard query parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| api_key | API key for authentication | ?api_key=abc123 |
| version | API version override | ?version=2023-01-01 |
| fields | Comma-separated list of fields to include | ?fields=id,name,price |
| include | Related resources to include | ?include=variants,images |
| filter | Filter criteria | ?filter[status]=active |
| sort | Sort order | ?sort=-created_at |
| page | Page number for pagination | ?page=2 |
| limit | Number of items per page | ?limit=50 |

## CORS Configuration

The following domains will be allowed in CORS configuration:

- *.varai.ai
- *.shopify.com
- *.myshopify.com
- *.magento.com
- *.woocommerce.com
- *.bigcommerce.com
- Merchant domains (dynamically configured per merchant)

## Implementation Next Steps

1. Configure DNS records for all subdomains
2. Set up SSL certificates for all domains
3. Configure CDN for static assets
4. Implement API gateway routing
5. Create redirect rules for legacy domains
6. Update documentation with new URL patterns
7. Notify partners and customers of upcoming domain changes