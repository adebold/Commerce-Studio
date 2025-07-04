# Opticians Catalog Feature

## Overview

The Opticians Catalog feature allows opticians to create browseable catalogs where customers can request/reserve frames instead of using a traditional checkout process. This is designed for opticians who don't want to launch a full ecommerce store but still want to showcase their products online.

## Key Features

- **Store Management**: Create and manage optician stores with customizable branding, domains, and themes
- **Product Management**: Add, update, and manage products from the master frame database
- **Request System**: Allow customers to request/reserve frames with custom form templates
- **Page Customization**: Customize catalog pages with custom sections and content
- **Analytics**: Track catalog usage, popular products, and customer engagement

## Technical Implementation

### Database Models

- **OpticiansStore**: Stores information about the optician's catalog
- **OpticiansProduct**: Products in the optician's catalog
- **ProductRequest**: Customer requests/reservations
- **RequestFormTemplate**: Customizable request forms
- **StorePageCustomization**: Custom page content
- **CatalogAnalytics**: Usage analytics

### API Endpoints

#### Store Management

- `POST /opticians-catalog/stores` - Create a new store
- `GET /opticians-catalog/stores` - List stores
- `GET /opticians-catalog/stores/{store_id}` - Get store details
- `PUT /opticians-catalog/stores/{store_id}` - Update store
- `DELETE /opticians-catalog/stores/{store_id}` - Delete store
- `GET /opticians-catalog/stores/by-subdomain/{subdomain}` - Get store by subdomain
- `GET /opticians-catalog/stores/by-domain/{domain}` - Get store by custom domain
- `POST /opticians-catalog/stores/{store_id}/verify-domain` - Verify custom domain

#### Product Management

- `POST /opticians-catalog/products` - Add a product
- `GET /opticians-catalog/products` - List products
- `GET /opticians-catalog/products/{product_id}` - Get product details
- `PUT /opticians-catalog/products/{product_id}` - Update product
- `DELETE /opticians-catalog/products/{product_id}` - Delete product
- `GET /opticians-catalog/stores/{store_id}/products` - Get products for a store

#### Import API

- `POST /opticians-catalog/imports` - Create a new import job
- `POST /opticians-catalog/imports/{job_id}/start` - Start an import job
- `GET /opticians-catalog/imports/{job_id}` - Get import job details
- `GET /opticians-catalog/imports` - List import jobs
- `GET /opticians-catalog/imports/{job_id}/progress` - Get import job progress
- `POST /opticians-catalog/imports/{job_id}/cancel` - Cancel an import job
- `DELETE /opticians-catalog/imports/{job_id}` - Delete an import job
- `POST /opticians-catalog/imports/sample-templates/{file_type}` - Get a sample template

#### Master Frame API

- `GET /master-frames/search` - Search the master frame database with filters
- `GET /master-frames/{frame_id}` - Get detailed information about a specific frame
- `GET /master-frames/{frame_id}/images` - Get images for a specific frame
- `GET /master-frames/{frame_id}/availability` - Get availability information
- `GET /master-frames/{frame_id}/similar` - Get similar frames to a specific frame
- `GET /master-frames/{frame_id}/options` - Get available options (colors, materials, etc.)
- `GET /master-frames/filters` - Get available filter options for the master frame database

#### Product Requests

- `POST /opticians-catalog/requests` - Create a request (public endpoint)
- `GET /opticians-catalog/requests` - List requests
- `GET /opticians-catalog/requests/{request_id}` - Get request details
- `PUT /opticians-catalog/requests/{request_id}` - Update request
- `DELETE /opticians-catalog/requests/{request_id}` - Delete request (mark as cancelled)
- `GET /opticians-catalog/stores/{store_id}/requests` - Get requests for a store
- `GET /opticians-catalog/products/{product_id}/requests` - Get requests for a product

#### Form Templates

- `POST /opticians-catalog/form-templates` - Create a form template
- `GET /opticians-catalog/form-templates` - List form templates
- `GET /opticians-catalog/form-templates/{template_id}` - Get template details
- `PUT /opticians-catalog/form-templates/{template_id}` - Update template
- `DELETE /opticians-catalog/form-templates/{template_id}` - Delete template
- `GET /opticians-catalog/stores/{store_id}/form-templates` - Get templates for a store
- `GET /opticians-catalog/stores/{store_id}/default-form-template` - Get default template for a store (public)

#### Page Customization

- `POST /opticians-catalog/page-customizations` - Create a page customization
- `GET /opticians-catalog/page-customizations` - List page customizations
- `GET /opticians-catalog/page-customizations/{customization_id}` - Get customization details
- `PUT /opticians-catalog/page-customizations/{customization_id}` - Update customization
- `DELETE /opticians-catalog/page-customizations/{customization_id}` - Delete customization
- `GET /opticians-catalog/stores/{store_id}/page-customizations` - Get customizations for a store

### Future Endpoints (Not Yet Implemented)

#### Analytics

- `GET /opticians-catalog/analytics` - Get analytics data
- `GET /opticians-catalog/stores/{store_id}/analytics` - Get analytics for a store
- `GET /opticians-catalog/stores/{store_id}/analytics/summary` - Get analytics summary

## Development Status

- ✅ Database Models
- ✅ Database Migrations
- ✅ API Schemas
- ✅ Store Management Endpoints
- ✅ Product Management Endpoints
- ✅ Product Request Endpoints
- ✅ Form Template Management
- ✅ Page Customization
- ✅ Master Frame Integration
- ✅ CSV/Excel Import Service
- ✅ Notification System
- ✅ Analytics Tracking
- ✅ Frontend Components

## Usage Examples

### Creating a Store

```python
import requests

response = requests.post(
    "https://api.example.com/opticians-catalog/stores",
    json={
        "client_id": "client123",
        "store_name": "Vision Optics",
        "store_description": "Premium eyewear for discerning customers",
        "subdomain": "vision-optics",
        "contact_email": "info@visionoptics.com",
        "primary_color": "#336699"
    },
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

store = response.json()["store"]
print(f"Store created with ID: {store['id']}")
```

### Adding a Product

```python
import requests

response = requests.post(
    "https://api.example.com/opticians-catalog/products",
    json={
        "store_id": "store123",
        "frame_id": "frame123",
        "price": 199.99,
        "stock": 10,
        "is_featured": True,
        "custom_description": "Elegant round frames with gold accents",
        "custom_attributes": {
            "material": "Titanium",
            "color_options": ["Gold", "Silver", "Black"]
        }
    },
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

product = response.json()["product"]
print(f"Product added with ID: {product['id']}")
```

### Creating a Product Request

```python
import requests

response = requests.post(
    "https://api.example.com/opticians-catalog/requests",
    json={
        "store_id": "store123",
        "product_id": "product123",
        "customer_name": "John Doe",
        "customer_email": "john.doe@example.com",
        "customer_phone": "+1234567890",
        "notes": "I'd like to try these frames in your store",
        "prescription_data": {
            "sphere_right": "-2.00",
            "sphere_left": "-2.25",
            "cylinder_right": "-0.75",
            "cylinder_left": "-0.50",
            "axis_right": "180",
            "axis_left": "175",
            "pd": "64"
        },
        "appointment_preference": "Afternoon",
        "custom_fields": {
            "insurance_provider": "EyeCare Plus",
            "preferred_contact_method": "Email"
        }
    }
)

request = response.json()["request"]
print(f"Request submitted with ID: {request['id']}")
```

### Updating a Request Status

```python
import requests

response = requests.put(
    "https://api.example.com/opticians-catalog/requests/request123",
    json={
        "status": "processing"  # Can be "pending", "processing", "completed", or "cancelled"
    },
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

request = response.json()["request"]
print(f"Request updated: {request['status']}")
```

### Creating a Form Template

```python
import requests

response = requests.post(
    "https://api.example.com/opticians-catalog/form-templates",
    json={
        "store_id": "store123",
        "name": "Advanced Request Form",
        "description": "Form with additional fields for detailed requests",
        "is_default": True,
        "fields": [
            {
                "id": "prescription",
                "type": "prescription",
                "label": "Prescription Details",
                "required": True
            },
            {
                "id": "appointment",
                "type": "select",
                "label": "Preferred Appointment Time",
                "required": True,
                "options": ["Morning", "Afternoon", "Evening"]
            },
            {
                "id": "insurance",
                "type": "text",
                "label": "Insurance Provider",
                "required": False
            },
            {
                "id": "notes",
                "type": "textarea",
                "label": "Additional Notes",
                "required": False
            }
        ]
    },
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

template = response.json()["template"]
print(f"Form template created with ID: {template['id']}")
```

### Creating a Page Customization

```python
import requests

response = requests.post(
    "https://api.example.com/opticians-catalog/page-customizations",
    json={
        "store_id": "store123",
        "page_type": "home",
        "name": "Home Page Layout",
        "description": "Custom layout for the home page",
        "is_active": True,
        "content": {
            "hero": {
                "title": "Premium Eyewear Collection",
                "subtitle": "Discover our exclusive selection of designer frames",
                "image_url": "https://example.com/images/hero.jpg",
                "button_text": "Browse Collection",
                "button_link": "/collection"
            },
            "featured_products": {
                "title": "Featured Frames",
                "count": 4
            },
            "testimonials": [
                {
                    "text": "Amazing selection and service!",
                    "author": "Jane Smith"
                },
                {
                    "text": "The perfect frames for my style.",
                    "author": "John Davis"
                }
            ]
        }
    },
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

customization = response.json()["customization"]
print(f"Page customization created with ID: {customization['id']}")
```

### Searching Master Frames

```python
import requests

# Search for frames with filters
response = requests.get(
    "https://api.example.com/master-frames/search",
    params={
        "brand": "Ray-Ban",
        "style": "Round",
        "material": "Metal",
        "min_price": 100,
        "max_price": 300,
        "page": 1,
        "page_size": 20
    },
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

result = response.json()
frames = result["frames"]
total = result["total"]

print(f"Found {total} frames, showing page {result['page']} of {result['total_pages']}")
for frame in frames:
    print(f"{frame['brand']} {frame['name']} - ${frame['price']}")
```

### Getting Frame Details

```python
import requests

# Get detailed information about a specific frame
frame_id = "frame123"
response = requests.get(
    f"https://api.example.com/master-frames/{frame_id}",
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

if response.status_code == 200:
    frame_data = response.json()["frame"]
    print(f"Frame: {frame_data['brand']} {frame_data['name']}")
    print(f"Style: {frame_data['style']}")
    print(f"Material: {frame_data['material']}")
    print(f"Price: ${frame_data['price']}")
    print(f"Description: {frame_data['description']}")
    
    # Get frame images
    images_response = requests.get(
        f"https://api.example.com/master-frames/{frame_id}/images",
        headers={"Authorization": "Bearer YOUR_TOKEN"}
    )
    
    if images_response.status_code == 200:
        images = images_response.json()["images"]
        print(f"Number of images: {len(images)}")
        for image in images:
            print(f"Image URL: {image['url']} (Type: {image['type']})")
else:
    print(f"Frame not found: {response.status_code}")
```

## Notification System

The Opticians Catalog includes a comprehensive notification system that supports multiple delivery channels:

1. **Notification Types**:
   - Request Created - When a customer submits a product request
   - Request Updated - When a request's status changes
   - Request Cancelled - When a request is cancelled
   - Store Updated - When store details are updated
   - Product Added/Updated/Removed - When catalog products change
   - Import Completed/Failed - When a product import job finishes

2. **Delivery Channels**:
   - Email - HTML-formatted emails with store branding
   - SMS - Text message notifications (requires API integration)
   - Push - Browser and mobile push notifications
   - Webhook - HTTP POST to external URLs for integration
   - In-App - Notifications in the admin dashboard

3. **Template System**:
   - Dynamic content generation using Jinja2 templates
   - Store-specific template customization
   - Default templates for common notifications
   - Testing capabilities for template preview

4. **Preference Management**:
   - Per-user notification preferences
   - Per-store default settings
   - Channel-specific configurations
   - Opt-in/opt-out capabilities

5. **Branding and Customization**:
   - Store logo and colors in notifications
   - Customizable templates for each notification type
   - Store contact information automatically included
   - Professional formatting with context-specific details

## Analytics System

The Opticians Catalog features a robust analytics system to help store owners understand customer behavior and make data-driven decisions:

1. **Tracking Capabilities**:
   - Page view tracking with unique visitor detection
   - Product view tracking for popularity analysis
   - Search term tracking to understand customer interests
   - Request conversion tracking for measuring effectiveness
   - Recommendation click tracking to evaluate cross-selling

2. **Reporting Features**:
   - Dashboard summary with key performance metrics
   - Daily, weekly, and monthly data aggregation
   - Custom date range filtering for trend analysis
   - Period-over-period comparison to measure growth
   - Export capabilities for external analysis

3. **Product Analytics**:
   - View-to-request conversion rates for each product
   - Performance ranking of catalog items
   - Identification of trending and underperforming products
   - Search term correlation with product popularity
   - Featured product effectiveness measurement

4. **Integration Points**:
   - Automatic tracking hooks in product request flow
   - JavaScript tracking for frontend integration
   - API endpoints for custom analytics implementations
   - Event-based architecture for extensibility

5. **Privacy Considerations**:
   - Anonymous visitor tracking with non-identifying IDs
   - Compliance with data protection regulations
   - Configurable data retention policies
   - Transparent data collection with consent options

## Future Enhancements

- Implement multi-language support
- Add virtual try-on capabilities
- Develop mobile applications
- Integrate with external POS systems
- Add advanced reporting capabilities
