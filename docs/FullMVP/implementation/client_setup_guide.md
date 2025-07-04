# Client Setup Guide for EyewearML Full MVP

This document provides practical guidance for setting up client implementations of the EyewearML Hybrid AI Shopping Platform MVP. It focuses on client-specific considerations, including data verification, store generation, and integration of the AI shopping assistant.

## Overview

The EyewearML client implementation process involves four key steps:

1. **Verifying client data** in the Master MongoDB database
2. **Generating client-specific HTML test store**
3. **Creating a client Shopify store**
4. **Integrating the Hybrid AI Shopping Assistant**

This guide assumes that the core platform infrastructure is already in place, and focuses on the steps required to onboard a new client to the platform.

## Prerequisites

Before starting the client setup process, ensure you have:

- Access to the EyewearML MongoDB database
- Client's scraped eyewear data
- Access to client's branding materials (logos, color schemes, etc.)
- Shopify Partner account for creating client stores
- Access to Google Cloud Platform for Vertex AI integration

## Step 1: Client Data Verification

### 1.1. Verify Scraped Data in MongoDB

First, ensure that the client's scraped data has been properly imported into the MongoDB master database:

```javascript
// Connect to MongoDB
const { MongoClient } = require('mongodb');

async function verifyClientData(clientId) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db("eyewear_database");
    const collection = db.collection("products");
    
    // Count total products for client
    const totalProducts = await collection.countDocuments({ client_id: clientId });
    console.log(`Total products for client ${clientId}: ${totalProducts}`);
    
    // Count validated products
    const validatedProducts = await collection.countDocuments({ 
      client_id: clientId,
      "metadata.validation_status": "validated"
    });
    console.log(`Validated products: ${validatedProducts} (${(validatedProducts/totalProducts*100).toFixed(2)}%)`);
    
    // Check for critical issues
    const criticalIssues = await collection.countDocuments({
      client_id: clientId,
      "metadata.validation_issues": { $elemMatch: { severity: "critical" } }
    });
    console.log(`Products with critical issues: ${criticalIssues}`);
    
    // Check image availability
    const missingImages = await collection.countDocuments({
      client_id: clientId,
      $or: [
        { "images.main_image": { $exists: false } },
        { "images.main_image": null },
        { "images.main_image": "" }
      ]
    });
    console.log(`Products missing main image: ${missingImages}`);
    
    return {
      totalProducts,
      validatedProducts,
      validationRate: validatedProducts / totalProducts,
      criticalIssues,
      missingImages,
      readyForStore: (validatedProducts / totalProducts > 0.9) && (criticalIssues === 0)
    };
    
  } finally {
    await client.close();
  }
}

// Example usage
verifyClientData("client123").then(result => {
  console.log("Verification result:", result);
  
  if (result.readyForStore) {
    console.log("✅ Client data is ready for store generation");
  } else {
    console.log("❌ Client data needs attention before proceeding");
  }
});
```

### 1.2. Generate Client Data Report

Create a client-specific data quality report to identify and address any issues:

```javascript
async function generateClientDataReport(clientId) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db("eyewear_database");
    const collection = db.collection("products");
    
    // Field completeness analysis
    const fieldStats = {};
    const requiredFields = ["name", "brand", "model", "price", "currency", "description", 
                           "specifications.frame_type", "specifications.frame_shape", 
                           "specifications.frame_material", "images.main_image"];
    
    for (const field of requiredFields) {
      const missingField = await collection.countDocuments({
        client_id: clientId,
        $or: [
          { [field]: { $exists: false } },
          { [field]: null },
          { [field]: "" }
        ]
      });
      
      fieldStats[field] = {
        missing: missingField,
        completeness: ((totalProducts - missingField) / totalProducts * 100).toFixed(2) + "%"
      };
    }
    
    // Brand analysis
    const brands = await collection.distinct("brand", { client_id: clientId });
    const brandCounts = {};
    
    for (const brand of brands) {
      brandCounts[brand] = await collection.countDocuments({
        client_id: clientId,
        brand
      });
    }
    
    // Face shape recommendations analysis
    const missingFaceShapes = await collection.countDocuments({
      client_id: clientId,
      $or: [
        { "recommended_face_shapes": { $exists: false } },
        { "recommended_face_shapes": { $size: 0 } }
      ]
    });
    
    // Generate report
    const report = {
      clientId,
      generatedAt: new Date().toISOString(),
      productCount: totalProducts,
      fieldCompleteness: fieldStats,
      brandDistribution: brandCounts,
      faceShapeStats: {
        missingRecommendations: missingFaceShapes,
        completeness: ((totalProducts - missingFaceShapes) / totalProducts * 100).toFixed(2) + "%"
      }
    };
    
    // Save report to database
    await db.collection("client_reports").insertOne(report);
    
    return report;
  } finally {
    await client.close();
  }
}
```

### 1.3. Fix Critical Data Issues

Address any critical data issues before proceeding:

```javascript
async function fixClientDataIssues(clientId) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db("eyewear_database");
    const collection = db.collection("products");
    
    // 1. Find products with critical issues
    const productsWithIssues = await collection.find({
      client_id: clientId,
      "metadata.validation_issues": { $elemMatch: { severity: "critical" } }
    }).toArray();
    
    console.log(`Found ${productsWithIssues.length} products with critical issues`);
    
    // 2. Fix each product
    let fixedCount = 0;
    
    for (const product of productsWithIssues) {
      // Extract specific issues
      const issues = product.metadata.validation_issues;
      const fixes = [];
      
      // Apply fixes based on issue type
      const updates = {};
      
      // Example fixes for common issues
      for (const issue of issues) {
        if (issue.field === "price" && issue.code === "missing_field") {
          // Add default price if missing
          updates.price = 99.99;
          fixes.push("Added default price");
        }
        
        if (issue.field === "currency" && issue.code === "missing_field") {
          // Add default currency if missing
          updates.currency = "USD";
          fixes.push("Added default currency");
        }
        
        if (issue.field === "description" && issue.code === "missing_field") {
          // Add generated description
          updates.description = `${product.brand} ${product.model} eyewear`;
          fixes.push("Added basic description");
        }
      }
      
      // Update the product if fixes were applied
      if (Object.keys(updates).length > 0) {
        await collection.updateOne(
          { _id: product._id },
          { 
            $set: {
              ...updates,
              "metadata.validation_issues": issues.filter(i => i.severity !== "critical"),
              "metadata.auto_fixed": true,
              "metadata.fix_notes": fixes
            }
          }
        );
        
        fixedCount++;
      }
    }
    
    console.log(`Fixed ${fixedCount} products with critical issues`);
    
    return { fixedCount };
  } finally {
    await client.close();
  }
}
```

### 1.4. Generate Missing Face Shape Recommendations

For products missing face shape recommendations, use an AI model to generate them:

```javascript
async function generateFaceShapeRecommendations(clientId) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db("eyewear_database");
    const collection = db.collection("products");
    
    // Find products missing face shape recommendations
    const productsNeedingFaceShapes = await collection.find({
      client_id: clientId,
      $or: [
        { "recommended_face_shapes": { $exists: false } },
        { "recommended_face_shapes": { $size: 0 } }
      ]
    }).toArray();
    
    console.log(`Found ${productsNeedingFaceShapes.length} products needing face shape recommendations`);
    
    // Use AI to generate recommendations
    const { VertexAI } = require('@google-cloud/vertexai');
    const vertex = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.VERTEX_AI_LOCATION,
    });
    
    const model = vertex.preview.getGenerativeModel({
      model: "gemini-pro",
    });
    
    let updatedCount = 0;
    
    for (const product of productsNeedingFaceShapes) {
      // Prepare product context for AI
      const productContext = `
        Product: ${product.name}
        Brand: ${product.brand}
        Frame Type: ${product.specifications?.frame_type || 'unknown'}
        Frame Shape: ${product.specifications?.frame_shape || 'unknown'}
        
        Based on eyewear expertise, recommend face shapes that would work well with this frame. 
        Choose from: oval, round, square, heart, diamond, rectangle/oblong.
        Return only the face shape names as a JSON array.
      `;
      
      try {
        // Call Vertex AI
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: productContext }] }],
        });
        
        // Extract and parse face shapes from response
        const responseText = result.response.text();
        let faceShapes = [];
        
        // Handle different response formats
        if (responseText.includes('[') && responseText.includes(']')) {
          // Extract JSON array from response
          const jsonMatch = responseText.match(/\[.*\]/s);
          if (jsonMatch) {
            try {
              faceShapes = JSON.parse(jsonMatch[0]);
            } catch (e) {
              // If JSON parsing fails, extract face shapes manually
              faceShapes = responseText.match(/["']([^"']+)["']/g)
                ?.map(s => s.replace(/["']/g, '')) || [];
            }
          }
        } else {
          // Extract face shapes from plain text
          const commonShapes = ['oval', 'round', 'square', 'heart', 'diamond', 'rectangle', 'oblong'];
          faceShapes = commonShapes.filter(shape => responseText.toLowerCase().includes(shape));
        }
        
        // Filter valid face shapes
        const validShapes = ['oval', 'round', 'square', 'heart', 'diamond', 'rectangle', 'oblong'];
        faceShapes = faceShapes.filter(shape => validShapes.includes(shape.toLowerCase()));
        
        // Ensure we have at least one recommendation
        if (faceShapes.length === 0) {
          faceShapes = ['oval']; // Default to oval if no valid shapes found
        }
        
        // Update product in database
        await collection.updateOne(
          { _id: product._id },
          { 
            $set: { 
              recommended_face_shapes: faceShapes,
              "metadata.ai_enhanced": true 
            }
          }
        );
        
        updatedCount++;
        
        // Respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error generating face shapes for product ${product.id}:`, error);
      }
    }
    
    console.log(`Added face shape recommendations to ${updatedCount} products`);
    
    return { updatedCount };
  } finally {
    await client.close();
  }
}
```

## Step 2: Generate HTML Test Store

### 2.1. Configure Client Store Settings

First, configure the store settings for the specific client:

```javascript
// Client store configuration
const clientStore = {
  client_id: "client123",
  store_name: "Luxury Eyewear Boutique",
  theme: {
    primary_color: "#007bff",
    secondary_color: "#6c757d",
    accent_color: "#ffc107",
    font_family: "Helvetica, Arial, sans-serif",
    logo_url: "/images/client_logo.png"
  },
  contact: {
    email: "support@luxuryeyewear.com",
    phone: "+1 (555) 123-4567",
    address: "123 Fashion Ave, New York, NY 10001"
  },
  social_media: {
    facebook: "https://facebook.com/luxuryeyewear",
    instagram: "https://instagram.com/luxuryeyewear",
    twitter: "https://twitter.com/luxuryeyewear"
  },
  analytics_id: "UA-12345678-1",
  custom_sections: [
    {
      id: "featured-brands",
      title: "Our Featured Brands",
      brands: ["Ray-Ban", "Gucci", "Prada", "Versace"]
    },
    {
      id: "customer-favorites",
      title: "Customer Favorites",
      product_ids: ["product-001", "product-002", "product-003"]
    }
  ]
};
```

### 2.2. Generate Client-Specific HTML Store

Generate an HTML store based on client data:

```javascript
async function generateClientHTMLStore(clientId, storeConfig, outputDir) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db("eyewear_database");
    
    // Create output directories
    const fs = require('fs');
    fs.mkdirSync(`${outputDir}/products`, { recursive: true });
    fs.mkdirSync(`${outputDir}/categories`, { recursive: true });
    fs.mkdirSync(`${outputDir}/brands`, { recursive: true });
    fs.mkdirSync(`${outputDir}/css`, { recursive: true });
    fs.mkdirSync(`${outputDir}/js`, { recursive: true });
    fs.mkdirSync(`${outputDir}/images`, { recursive: true });
    fs.mkdirSync(`${outputDir}/data`, { recursive: true });
    
    // Load templates
    const productTemplate = fs.readFileSync('./templates/product.html', 'utf-8');
    const categoryTemplate = fs.readFileSync('./templates/category.html', 'utf-8');
    const brandTemplate = fs.readFileSync('./templates/brand.html', 'utf-8');
    const indexTemplate = fs.readFileSync('./templates/index.html', 'utf-8');
    
    // Apply client theme to CSS
    let cssTemplate = fs.readFileSync('./templates/css/styles.css', 'utf-8');
    cssTemplate = cssTemplate
      .replace('{{PRIMARY_COLOR}}', storeConfig.theme.primary_color)
      .replace('{{SECONDARY_COLOR}}', storeConfig.theme.secondary_color)
      .replace('{{ACCENT_COLOR}}', storeConfig.theme.accent_color)
      .replace('{{FONT_FAMILY}}', storeConfig.theme.font_family);
    
    fs.writeFileSync(`${outputDir}/css/styles.css`, cssTemplate);
    
    // Copy JS files
    fs.copyFileSync('./templates/js/search.js', `${outputDir}/js/search.js`);
    fs.copyFileSync('./templates/js/filters.js', `${outputDir}/js/filters.js`);
    fs.copyFileSync('./templates/js/ai-assistant.js', `${outputDir}/js/ai-assistant.js`);
    
    // Get all validated products for client
    const products = await db.collection("products").find({
      client_id: clientId,
      "metadata.validation_status": "validated"
    }).toArray();
    
    console.log(`Generating HTML store with ${products.length} products`);
    
    // Generate product pages
    for (const product of products) {
      let productHTML = productTemplate;
      
      // Replace template variables
      productHTML = productHTML
        .replace('{{PRODUCT_NAME}}', product.name)
        .replace('{{PRODUCT_BRAND}}', product.brand)
        .replace('{{PRODUCT_PRICE}}', `${product.price} ${product.currency}`)
        .replace('{{PRODUCT_DESCRIPTION}}', product.description)
        .replace('{{PRODUCT_IMAGE}}', `/images/products/${product.images.main_image}`)
        .replace('{{FRAME_TYPE}}', product.specifications.frame_type || 'N/A')
        .replace('{{FRAME_SHAPE}}', product.specifications.frame_shape || 'N/A')
        .replace('{{FRAME_MATERIAL}}', product.specifications.frame_material || 'N/A')
        .replace('{{FRAME_COLOR}}', product.specifications.frame_color || 'N/A');
      
      // Add measurements if available
      if (product.measurements) {
        let measurementsHTML = '<div class="product-measurements">';
        
        if (product.measurements.lens_width) 
          measurementsHTML += `<div>Lens Width: ${product.measurements.lens_width} mm</div>`;
        if (product.measurements.bridge_width) 
          measurementsHTML += `<div>Bridge Width: ${product.measurements.bridge_width} mm</div>`;
        if (product.measurements.temples_length) 
          measurementsHTML += `<div>Temple Length: ${product.measurements.temples_length} mm</div>`;
        if (product.measurements.lens_height) 
          measurementsHTML += `<div>Lens Height: ${product.measurements.lens_height} mm</div>`;
        if (product.measurements.total_width) 
          measurementsHTML += `<div>Total Width: ${product.measurements.total_width} mm</div>`;
          
        measurementsHTML += '</div>';
        
        productHTML = productHTML.replace('{{PRODUCT_MEASUREMENTS}}', measurementsHTML);
      } else {
        productHTML = productHTML.replace('{{PRODUCT_MEASUREMENTS}}', '');
      }
      
      // Add face shape recommendations if available
      if (product.recommended_face_shapes && product.recommended_face_shapes.length > 0) {
        let faceShapesHTML = '<div class="face-shapes-section">';
        faceShapesHTML += '<h3>Recommended for Face Shapes:</h3>';
        faceShapesHTML += '<div class="face-shapes-list">';
        
        for (const shape of product.recommended_face_shapes) {
          faceShapesHTML += `<span class="face-shape">${shape}</span>`;
        }
        
        faceShapesHTML += '</div></div>';
        
        productHTML = productHTML.replace('{{FACE_SHAPE_RECOMMENDATIONS}}', faceShapesHTML);
      } else {
        productHTML = productHTML.replace('{{FACE_SHAPE_RECOMMENDATIONS}}', '');
      }
      
      // Write product HTML file
      fs.writeFileSync(`${outputDir}/products/${product.id}.html`, productHTML);
      
      // Copy product image
      const imagePath = `./data/processed/images/${product.images.main_image}`;
      const destPath = `${outputDir}/images/products/${product.images.main_image}`;
      
      if (fs.existsSync(imagePath)) {
        fs.copyFileSync(imagePath, destPath);
      }
    }
    
    // Generate category pages
    const categories = await db.collection("categories").find({ client_id: clientId }).toArray();
    
    for (const category of categories) {
      const categoryProducts = products.filter(p => 
        p.categories && p.categories.includes(category.name)
      );
      
      let categoryHTML = categoryTemplate;
      
      // Replace template variables
      categoryHTML = categoryHTML
        .replace('{{CATEGORY_NAME}}', category.name)
        .replace('{{CATEGORY_DESCRIPTION}}', category.description || '')
        .replace('{{STORE_NAME}}', storeConfig.store_name);
      
      // Add product listings
      let productsHTML = '';
      for (const product of categoryProducts) {
        productsHTML += `
          <div class="product-card" data-product-id="${product.id}">
            <a href="/products/${product.id}.html">
              <img src="/images/products/${product.images.main_image}" alt="${product.name}">
              <h3>${product.name}</h3>
              <p class="brand">${product.brand}</p>
              <p class="price">${product.price} ${product.currency}</p>
            </a>
          </div>
        `;
      }
      
      categoryHTML = categoryHTML.replace('{{PRODUCT_LISTINGS}}', productsHTML);
      
      // Write category HTML file
      fs.writeFileSync(`${outputDir}/categories/${category.slug}.html`, categoryHTML);
    }
    
    // Generate brand pages
    const brands = [...new Set(products.map(p => p.brand))];
    
    for (const brand of brands) {
      const brandProducts = products.filter(p => p.brand === brand);
      
      let brandHTML = brandTemplate;
      
      // Replace template variables
      brandHTML = brandHTML
        .replace('{{BRAND_NAME}}', brand)
        .replace('{{STORE_NAME}}', storeConfig.store_name);
      
      // Add product listings
      let productsHTML = '';
      for (const product of brandProducts) {
        productsHTML += `
          <div class="product-card" data-product-id="${product.id}">
            <a href="/products/${product.id}.html">
              <img src="/images/products/${product.images.main_image}" alt="${product.name}">
              <h3>${product.name}</h3>
              <p class="price">${product.price} ${product.currency}</p>
            </a>
          </div>
        `;
      }
      
      brandHTML = brandHTML.replace('{{PRODUCT_LISTINGS}}', productsHTML);
      
      // Write brand HTML file
      fs.writeFileSync(`${outputDir}/brands/${brand.toLowerCase().replace(/\s+/g, '-')}.html`, brandHTML);
    }
    
    // Generate index page
    let indexHTML = indexTemplate;
    
    // Replace template variables
    indexHTML = indexHTML
      .replace('{{STORE_NAME}}', storeConfig.store_name)
      .replace('{{STORE_DESCRIPTION}}', storeConfig.description || 'Welcome to our eyewear store');
    
    // Add featured products
    let featuredProductsHTML = '';
    const featuredProducts = products.filter(p => p.html_store?.featured).slice(0, 6);
    
    for (const product of featuredProducts) {
      featuredProductsHTML += `
        <div class="product-card featured" data-product-id="${product.id}">
          <a href="/products/${product.id}.html">
            <img src="/images/products/${product.images.main_image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="brand">${product.brand}</p>
            <p class="price">${product.price} ${product.currency}</p>
          </a>
        </div>
      `;
    }
    
    indexHTML = indexHTML.replace('{{FEATURED_PRODUCTS}}', featuredProductsHTML);
    
    // Add category navigation
    let categoryNavHTML = '<ul class="category-nav">';
    for (const category of categories) {
      categoryNavHTML += `<li><a href="/categories/${category.slug}.html">${category.name}</a></li>`;
    }
    categoryNavHTML += '</ul>';
    
    indexHTML = indexHTML.replace('{{CATEGORY_NAV}}', categoryNavHTML);
    
    // Add brand navigation
    let brandNavHTML = '<ul class="brand-nav">';
    for (const brand of brands) {
      brandNavHTML += `<li><a href="/brands/${brand.toLowerCase().replace(/\s+/g, '-')}.html">${brand}</a></li>`;
    }
    brandNavHTML += '</ul>';
    
    indexHTML = indexHTML.replace('{{BRAND_NAV}}', brandNavHTML);
    
    // Add custom sections
    let customSectionsHTML = '';
    
    for (const section of storeConfig.custom_sections || []) {
      if (section.id === 'featured-brands') {
        customSectionsHTML += `<section class="featured-brands">`;
        customSectionsHTML += `<h2>${section.title}</h2>`;
        customSectionsHTML += `<div class="brands-container">`;
        
        for (const brand of section.brands) {
          const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
          customSectionsHTML += `
            <div class="brand-card">
              <a href="/brands/${brandSlug}.html">
                <h3>${brand}</h3>
              </a>
            </div>
          `;
        }
        
        customSectionsHTML += `</div></section>`;
      }
      
      if (section.id === 'customer-favorites') {
        customSectionsHTML += `<section class="customer-favorites">`;
        customSectionsHTML += `<h2>${section.title}</h2>`;
        customSectionsHTML += `<div class="products-container">`;
        
        const favoriteProducts = products.filter(p => 
          section.product_ids.includes(p.id)
        );
        
        for (const product of favoriteProducts) {
          customSectionsHTML += `
            <div class="product-card favorite" data-product-id="${product.id}">
              <a href="/products/${product.id}.html">
                <img src="/images/products/${product.images.main_image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="brand">${product.brand}</p>
                <p class="price">${product.price} ${product.currency}</p>
              </a>
            </div>
          `;
        }
        
        customSectionsHTML += `</div></section>`;
      }
    }
    
    indexHTML = indexHTML.replace('{{CUSTOM_SECTIONS}}', customSectionsHTML);
    
    // Add contact information
    indexHTML = indexHTML
      .replace('{{CONTACT_EMAIL}}', storeConfig.contact.email)
      .replace('{{CONTACT_PHONE}}', storeConfig.contact.phone)
      .replace('{{CONTACT_ADDRESS}}', storeConfig.contact.address);
    
    // Add social media links
    indexHTML = indexHTML
      .replace('{{FACEBOOK_LINK}}', storeConfig.social_media.facebook)
      .replace('{{INSTAGRAM_LINK}}', storeConfig.social_media.instagram)
      .replace('{{TWITTER_LINK}}', storeConfig.social_media.twitter);
    
    // Add analytics
    indexHTML = indexHTML.replace('{{ANALYTICS_ID}}', storeConfig.analytics_id);
    
    // Write index HTML file
    fs.writeFileSync(`${outputDir}/index.html`, indexHTML);
    
    // Generate products.json for client-side features
    const productsJSON = products.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      currency: p.currency,
      frame_type: p.specifications.frame_type,
      frame_shape: p.specifications.frame_shape,
      frame_material: p.specifications.frame_material,
      frame_color: p.specifications.frame_color,
      categories: p.categories,
      tags: p.tags,
      recommended_face_shapes: p.recommended_face_shapes,
      gender: p.gender,
      main_image: p.images.main_image,
      url: `/products/${p.id}.html`
    }));
    
    fs.writeFileSync(`${outputDir}/data/products.json`, JSON.stringify(productsJSON, null, 2));
    
    console.log(`HTML store generated successfully at ${outputDir}`);
    
    return {
      productCount: products.length,
      categoryCount: categories.length,
      brandCount: brands.length,
      outputDirectory: outputDir
    };
  } finally {
    await client.close();
  }
}

// Example usage
generateClientHTMLStore(
  "client123", 
  clientStore, 
  "./client-stores/client123"
);
```

## Step 3: Create Client Shopify Store

### 3.1. Set Up Shopify Store

First, create a new Shopify store for the client:

```javascript
async function setupClientShopifyStore(clientId, storeConfig) {
  console.log(`Setting up Shopify store for client ${clientId}: ${storeConfig.store_name}`);
  
  // Note: Shopify Partner API doesn't allow programmatic store creation
  // This would typically be a manual step via the Shopify Partner Dashboard
  
  console.log(`
    Manual steps for Shopify store creation:
    1. Log in to Shopify Partner Dashboard
    2. Create a development store named "${storeConfig.store_name}"
    3. Set up store with following details:
       - Store URL: ${clientId.toLowerCase()}.myshopify.com
       - Contact email: ${storeConfig.contact.email}
       - Industry: Apparel & Accessories
    4. Once created, generate API credentials for the next step
  `);
  
  return {
    manualSetupRequired: true,
    setupInstructions: "Follow the manual steps in the console log"
  };
}
```

### 3.2. Import Products to Shopify

After setting up the Shopify store, import products from MongoDB:

```javascript
async function importProductsToShopify(clientId, shopifyConfig) {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db("eyewear_database");
    
    // Get all validated products for client
    const products = await db.collection("products").find({
      client_id: clientId,
      "metadata.validation_status": "validated"
    }).toArray();
    
    console.log
