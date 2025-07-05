# VARAi UAT Test Data Management

This document outlines the approach for managing test data in the User Acceptance Testing (UAT) environment for the VARAi platform. Proper test data management is crucial for effective UAT, ensuring that testers have realistic and comprehensive data to validate the platform's functionality.

## Table of Contents

1. [Test Data Requirements](#test-data-requirements)
2. [Test Data Sources](#test-data-sources)
3. [Test Data Generation](#test-data-generation)
4. [Test Data Seeding](#test-data-seeding)
5. [Test Data Maintenance](#test-data-maintenance)
6. [Test Data Reset](#test-data-reset)
7. [Test Data Security](#test-data-security)

## Test Data Requirements

### Merchant Data

The UAT environment requires the following merchant data:

1. **Merchant Accounts**
   - Various merchant types (small, medium, large)
   - Different subscription levels
   - Various integration configurations

2. **Product Catalog**
   - Diverse product categories
   - Products with different attributes
   - Products with and without images
   - Products with various price points

3. **Store Configuration**
   - Different appearance settings
   - Various feature configurations
   - Different widget placements

### Customer Data

The UAT environment requires the following customer data:

1. **Customer Accounts**
   - Various demographics
   - Different purchase histories
   - Various preference settings

2. **User Profiles**
   - Different face shapes
   - Various style preferences
   - Different prescription information

3. **Order History**
   - Orders in different states
   - Orders with different products
   - Orders with various payment methods

### Analytics Data

The UAT environment requires the following analytics data:

1. **Usage Metrics**
   - Virtual try-on usage
   - Recommendation clicks
   - Search queries

2. **Conversion Data**
   - View-to-try-on conversion
   - Try-on-to-purchase conversion
   - Recommendation-to-purchase conversion

3. **Performance Metrics**
   - Response times
   - Error rates
   - User satisfaction scores

## Test Data Sources

### Synthetic Data

Most of the test data is synthetic, generated specifically for testing purposes. This includes:

1. **Generated Merchant Accounts**
   - Fictional business names and details
   - Synthetic contact information
   - Generated API credentials

2. **Generated Product Catalog**
   - Fictional product names and descriptions
   - Generated SKUs and prices
   - Synthetic product attributes

3. **Generated Customer Accounts**
   - Fictional user names and details
   - Synthetic contact information
   - Generated preferences

### Sample Images

The UAT environment includes sample images for testing visual components:

1. **Face Images**
   - Sample face images for virtual try-on
   - Images representing different face shapes
   - Images with various lighting conditions

2. **Product Images**
   - Sample eyewear product images
   - Images from different angles
   - Images with various backgrounds

3. **3D Models**
   - Sample 3D models for virtual try-on
   - Models representing different frame styles
   - Models with various materials and colors

### Anonymized Production Data

In some cases, anonymized production data may be used to create realistic test scenarios:

1. **Anonymized Usage Patterns**
   - Real usage patterns with personal information removed
   - Anonymized conversion funnels
   - Sanitized user journeys

2. **Anonymized Analytics**
   - Real performance metrics with identifying information removed
   - Anonymized conversion rates
   - Sanitized error logs

## Test Data Generation

### Data Generation Scripts

Test data is generated using the following scripts:

1. **`generate-merchant-data.py`**
   - Generates merchant accounts
   - Creates product catalogs
   - Builds store configurations

2. **`generate-customer-data.py`**
   - Generates customer accounts
   - Creates user profiles
   - Builds order history

3. **`generate-analytics-data.py`**
   - Generates usage metrics
   - Creates conversion data
   - Builds performance metrics

### Sample Script: Generate Merchant Data

```python
#!/usr/bin/env python3
# generate-merchant-data.py - Generate merchant test data for UAT

import argparse
import json
import os
import random
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any

import faker

# Configuration
OUTPUT_DIR = "tests/uat/fixtures/test-data"
NUM_MERCHANTS = 10
NUM_PRODUCTS_PER_MERCHANT = 20
PLATFORMS = ["shopify", "magento", "woocommerce", "bigcommerce"]
SUBSCRIPTION_LEVELS = ["basic", "professional", "enterprise"]

def generate_merchant(merchant_id: int, fake: faker.Faker) -> Dict[str, Any]:
    """Generate a merchant account."""
    platform = random.choice(PLATFORMS)
    subscription = random.choice(SUBSCRIPTION_LEVELS)
    
    return {
        "id": f"merchant-{merchant_id}",
        "name": fake.company(),
        "domain": fake.domain_name(),
        "email": fake.company_email(),
        "phone": fake.phone_number(),
        "address": {
            "street": fake.street_address(),
            "city": fake.city(),
            "state": fake.state(),
            "postal_code": fake.zipcode(),
            "country": fake.country_code()
        },
        "platform": platform,
        "subscription_level": subscription,
        "created_at": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
        "status": "active",
        "settings": {
            "currency": random.choice(["USD", "EUR", "GBP", "CAD", "AUD"]),
            "language": random.choice(["en", "fr", "es", "de", "it"]),
            "timezone": fake.timezone(),
            "notifications_enabled": random.choice([True, False]),
            "analytics_enabled": random.choice([True, False])
        },
        "integration": {
            "api_key": fake.uuid4(),
            "webhook_url": f"https://{fake.domain_name()}/webhooks/varai",
            "webhook_secret": fake.sha256(),
            "integration_date": (datetime.now() - timedelta(days=random.randint(1, 180))).isoformat()
        }
    }

def generate_product(product_id: int, merchant_id: str, fake: faker.Faker) -> Dict[str, Any]:
    """Generate a product."""
    price = round(random.uniform(50, 500), 2)
    discount = random.choice([0, 0, 0, 0.1, 0.15, 0.2, 0.25, 0.3])
    discounted_price = round(price * (1 - discount), 2) if discount > 0 else None
    
    return {
        "id": f"product-{product_id}",
        "merchant_id": merchant_id,
        "name": f"{fake.word().capitalize()} {fake.word().capitalize()} Eyewear",
        "sku": f"SKU-{fake.bothify('??####')}",
        "description": fake.paragraph(),
        "price": price,
        "discounted_price": discounted_price,
        "currency": random.choice(["USD", "EUR", "GBP", "CAD", "AUD"]),
        "inventory": random.randint(0, 100),
        "category": random.choice(["sunglasses", "eyeglasses", "reading glasses", "sports glasses"]),
        "tags": random.sample(["trendy", "classic", "luxury", "budget", "sports", "fashion", "vintage", "modern"], k=random.randint(1, 3)),
        "attributes": {
            "frame_material": random.choice(["metal", "plastic", "acetate", "titanium", "wood"]),
            "frame_shape": random.choice(["round", "square", "oval", "rectangle", "cat-eye", "aviator"]),
            "frame_color": fake.color_name(),
            "lens_type": random.choice(["single vision", "bifocal", "progressive", "reading", "non-prescription"]),
            "lens_color": fake.color_name(),
            "lens_coating": random.choice(["anti-reflective", "scratch-resistant", "UV protection", "blue light filter", "none"]),
            "gender": random.choice(["men", "women", "unisex"]),
            "size": random.choice(["small", "medium", "large", "extra large"])
        },
        "images": [
            {
                "url": f"https://storage.googleapis.com/varai-uat-test-data/product-images/{product_id}-1.jpg",
                "alt": f"Front view of {fake.word().capitalize()} {fake.word().capitalize()} Eyewear",
                "position": 1
            },
            {
                "url": f"https://storage.googleapis.com/varai-uat-test-data/product-images/{product_id}-2.jpg",
                "alt": f"Side view of {fake.word().capitalize()} {fake.word().capitalize()} Eyewear",
                "position": 2
            },
            {
                "url": f"https://storage.googleapis.com/varai-uat-test-data/product-images/{product_id}-3.jpg",
                "alt": f"Angle view of {fake.word().capitalize()} {fake.word().capitalize()} Eyewear",
                "position": 3
            }
        ],
        "created_at": (datetime.now() - timedelta(days=random.randint(1, 180))).isoformat(),
        "updated_at": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
        "status": random.choice(["active", "active", "active", "active", "inactive"]),
        "virtual_try_on_enabled": random.choice([True, True, True, False]),
        "recommendations_enabled": random.choice([True, True, True, False])
    }

def generate_store_configuration(merchant_id: str, fake: faker.Faker) -> Dict[str, Any]:
    """Generate a store configuration."""
    primary_color = fake.hex_color()
    secondary_color = fake.hex_color()
    
    return {
        "merchant_id": merchant_id,
        "appearance": {
            "primary_color": primary_color,
            "secondary_color": secondary_color,
            "text_color": "#333333",
            "background_color": "#FFFFFF",
            "font_family": random.choice(["Arial", "Helvetica", "Roboto", "Open Sans", "Lato"]),
            "button_style": random.choice(["rounded", "square", "pill"]),
            "border_radius": random.choice(["0px", "4px", "8px", "12px"]),
            "logo_url": f"https://storage.googleapis.com/varai-uat-test-data/merchant-logos/{merchant_id}.png"
        },
        "widgets": {
            "virtual_try_on": {
                "enabled": random.choice([True, True, True, False]),
                "position": random.choice(["product_page", "sidebar", "modal"]),
                "size": random.choice(["small", "medium", "large"]),
                "auto_open": random.choice([True, False])
            },
            "recommendations": {
                "enabled": random.choice([True, True, True, False]),
                "position": random.choice(["product_page", "cart_page", "home_page"]),
                "num_recommendations": random.choice([3, 4, 5, 6]),
                "show_prices": random.choice([True, False])
            }
        },
        "features": {
            "virtual_try_on": {
                "enabled": random.choice([True, True, True, False]),
                "allow_photo_upload": random.choice([True, False]),
                "allow_camera_access": random.choice([True, True, False]),
                "show_face_shape_detection": random.choice([True, False])
            },
            "recommendations": {
                "enabled": random.choice([True, True, True, False]),
                "algorithm": random.choice(["content_based", "collaborative", "hybrid"]),
                "show_explanation": random.choice([True, False]),
                "allow_feedback": random.choice([True, False])
            },
            "analytics": {
                "enabled": random.choice([True, True, False]),
                "track_user_interactions": random.choice([True, False]),
                "track_conversions": random.choice([True, False]),
                "track_revenue": random.choice([True, False])
            }
        },
        "integrations": {
            "google_analytics": {
                "enabled": random.choice([True, False]),
                "tracking_id": fake.bothify("UA-########-#") if random.choice([True, False]) else None
            },
            "facebook_pixel": {
                "enabled": random.choice([True, False]),
                "pixel_id": fake.bothify("##############") if random.choice([True, False]) else None
            }
        },
        "created_at": (datetime.now() - timedelta(days=random.randint(1, 180))).isoformat(),
        "updated_at": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat()
    }

def main() -> None:
    """Main function to generate merchant test data."""
    parser = argparse.ArgumentParser(description="Generate merchant test data for UAT")
    parser.add_argument("--num-merchants", type=int, default=NUM_MERCHANTS, help="Number of merchants to generate")
    parser.add_argument("--num-products", type=int, default=NUM_PRODUCTS_PER_MERCHANT, help="Number of products per merchant")
    parser.add_argument("--output-dir", default=OUTPUT_DIR, help="Output directory for generated data")
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Initialize faker
    fake = faker.Faker()
    
    # Generate merchant data
    merchants = []
    products = []
    store_configurations = []
    
    for i in range(1, args.num_merchants + 1):
        merchant = generate_merchant(i, fake)
        merchants.append(merchant)
        
        store_configuration = generate_store_configuration(merchant["id"], fake)
        store_configurations.append(store_configuration)
        
        for j in range(1, args.num_products + 1):
            product_id = (i - 1) * args.num_products + j
            product = generate_product(product_id, merchant["id"], fake)
            products.append(product)
    
    # Write data to files
    with open(os.path.join(args.output_dir, "merchants.json"), "w") as f:
        json.dump(merchants, f, indent=2)
    
    with open(os.path.join(args.output_dir, "products.json"), "w") as f:
        json.dump(products, f, indent=2)
    
    with open(os.path.join(args.output_dir, "store_configurations.json"), "w") as f:
        json.dump(store_configurations, f, indent=2)
    
    print(f"Generated {len(merchants)} merchants, {len(products)} products, and {len(store_configurations)} store configurations.")
    print(f"Data written to {args.output_dir}")

if __name__ == "__main__":
    main()
```

## Test Data Seeding

### Data Seeding Process

The test data seeding process involves:

1. **Database Seeding**
   - Loading test data into the database
   - Creating relationships between entities
   - Setting up initial state

2. **File Storage Seeding**
   - Uploading test images to cloud storage
   - Setting up file structure
   - Configuring access permissions

3. **Configuration Seeding**
   - Setting up environment configurations
   - Configuring feature flags
   - Setting up integration configurations

### Data Seeding Script

The data seeding is automated using the `seed-uat-data.py` script (see [Environment Setup](environment_setup.md#data-seeding) for details).

## Test Data Maintenance

### Data Refresh Schedule

The test data is refreshed according to the following schedule:

1. **Daily Refresh**
   - Reset user-generated content
   - Reset session data
   - Reset temporary files

2. **Weekly Refresh**
   - Reset all test data
   - Regenerate synthetic data
   - Reload sample images

3. **On-Demand Refresh**
   - Reset specific data sets
   - Regenerate specific entities
   - Reset to specific states

### Data Maintenance Scripts

The data maintenance is automated using the following scripts:

1. **`refresh-uat-data.sh`**
   - Refreshes all test data
   - Resets the environment to a clean state
   - Reseeds the database

2. **`refresh-uat-data-partial.sh`**
   - Refreshes specific data sets
   - Preserves other data
   - Allows targeted refreshes

## Test Data Reset

### Reset Process

The test data reset process involves:

1. **Database Reset**
   - Clearing all test data
   - Resetting sequences and counters
   - Removing user-generated content

2. **File Storage Reset**
   - Clearing uploaded files
   - Resetting to initial state
   - Removing user-generated content

3. **Configuration Reset**
   - Resetting to default configurations
   - Clearing custom settings
   - Resetting feature flags

### Reset Script

The data reset is automated using the `reset-uat-data.sh` script:

```bash
#!/bin/bash
# reset-uat-data.sh - Reset UAT test data to initial state

set -e

# Configuration
ENVIRONMENT="uat"
NAMESPACE="varai-uat"
MONGODB_PASSWORD="${TEST_DATA_MANAGEMENT_SECRET}"
GCS_BUCKET="varai-uat-uploads"

echo "Resetting UAT test data to initial state..."

# Reset database
echo "Resetting database..."
kubectl exec -it $(kubectl get pod -l app=mongodb -n ${NAMESPACE} -o jsonpath='{.items[0].metadata.name}') -n ${NAMESPACE} -- mongo admin -u admin -p ${MONGODB_PASSWORD} --eval 'db.getSiblingDB("varai").dropDatabase()'

# Clear uploaded files
echo "Clearing uploaded files..."
gsutil -m rm -r gs://${GCS_BUCKET}/user-uploads/* || true

# Reseed test data
echo "Reseeding test data..."
./seed-uat-data.py

echo "Test data reset completed successfully!"
```

To reset the test data:

```bash
# Make the script executable
chmod +x reset-uat-data.sh

# Reset the test data
./reset-uat-data.sh
```

## Test Data Security

### Data Protection

The test data is protected using the following measures:

1. **Access Control**
   - Role-based access control
   - Least privilege principle
   - Secure authentication

2. **Data Isolation**
   - Separate UAT environment
   - Isolated database
   - Dedicated storage buckets

3. **Data Anonymization**
   - No real customer data
   - Synthetic personal information
   - Anonymized usage patterns

### Security Guidelines

When working with test data, follow these security guidelines:

1. **No Production Data**
   - Never use real customer data
   - Never use real merchant data
   - Never use real payment information

2. **Secure Access**
   - Use secure authentication
   - Do not share credentials
   - Revoke access when not needed

3. **Data Handling**
   - Do not extract test data
   - Do not store test data locally
   - Do not share test data outside the team