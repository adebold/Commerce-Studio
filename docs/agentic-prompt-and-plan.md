# Agentic Prompt and Plan: Central Eyewear Database and AI Agent

## Goal

Create a central database for eyewear and materials, along with an AI agent to monitor brands and import products.

## 1. Database Design and Setup

*   **Database Schema:**
    *   **Products Table:**
        *   `fullName` (TEXT): Full name of the product (e.g., "Giorgio Armani AR7074 5405")
        *   `price` (TEXT): Price of the product (e.g., "C$266")
        *   `brand` (TEXT): Brand of the product (e.g., "Giorgio Armani")
        *   `manufacturer` (TEXT): Manufacturer of the product (e.g., "EssilorLuxottica")
        *   `upc` (TEXT): UPC code of the product (e.g., "8053672392074")
        *   `gender` (TEXT): Gender for which the product is intended (e.g., "Men")
        *   `year` (TEXT): Year the product was released (e.g., "2015")
        *   `frameColor` (TEXT): Color of the frame (e.g., "Brown")
        *   `frameShape` (TEXT): Shape of the frame (e.g., "Square")
        *   `frameStyle` (TEXT): Style of the frame (e.g., "Full Rim")
        *   `frameMaterial` (TEXT): Material of the frame (e.g., "Acetate")
        *   `lensMaterial` (TEXT): Material of the lens (e.g., "Customisable")
        *   `lensColor` (TEXT): Color of the lens (e.g., "Clear")
        *   `frameWidth` (TEXT): Width of the frame (e.g., "135.4 mm")
        *   `lensWidth` (TEXT): Width of the lens (e.g., "50 mm")
        *   `bridgeWidth` (TEXT): Width of the bridge (e.g., "19 mm")
        *   `armLength` (TEXT): Length of the arm (e.g., "145 mm")
        *   `image_thumbnail` (TEXT): URL of the thumbnail image
        *   `image_original` (TEXT): URL of the original image
        *   `image_zoom` (TEXT): URL of the zoom image
    *   **Brands Table:**
        *   `brand_id` (SERIAL PRIMARY KEY): Unique identifier for the brand
        *   `brand_name` (TEXT): Name of the brand (e.g., "Giorgio Armani")
    *   **Images Table:**
        *   `image_id` (SERIAL PRIMARY KEY): Unique identifier for the image
        *   `product_id` (INTEGER REFERENCES Products(product_id)): Foreign key referencing the Products table
        *   `thumbnail` (TEXT): URL of the thumbnail image
        *   `original` (TEXT): URL of the original image
        *   `zoom` (TEXT): URL of the zoom image
*   **Database Technology:** PostgreSQL
*   **GCP Setup:** Create a new PostgreSQL database on Google Cloud Platform (GCP).
*   **Storage Bucket:** Create a Google Cloud Storage bucket to store product images.

## 2. AI Agent Implementation

*   **Image Storage:**
    *   The AI agent will download all image URLs (thumbnail, original, zoom) and store them in the Google Cloud Storage bucket.
    *   The database will store the URLs of the images in the storage bucket.
*   **Scraping Considerations:**
    *   Implement rate limiting to avoid overloading brand websites.
    *   Use rotating proxies to avoid IP blocking.
    *   Implement error handling to gracefully handle website changes or downtime.
*   **Data Extraction:** The AI agent will extract the following data points from the brand websites:
    *   `fullName`
    *   `price`
    *   `brand`
    *   `manufacturer`
    *   `upc`
    *   `gender`
    *   `year`
    *   `frameColor`
    *   `frameShape`
    *   `frameStyle`
    *   `frameMaterial`
    *   `lensMaterial`
    *   `lensColor`
    *   `frameWidth`
    *   `lensWidth`
    *   `bridgeWidth`
    *   `armLength`
    *   `images` (thumbnail, original, zoom)

## 3. Brand Onboarding Process

*   **SKU Genie Integration:**
    *   Brands can manage their own inventory, but when SKU Genie runs, the system will:
        *   Identify incomplete product records.
        *   Notify brands about the incomplete records and offer to enrich the product data.
        *   Warn brands that updating their records requires their consent and that they should back up their store first.
*   **CSV Format:** The CSV format should include the following columns:
    *   `fullName`
    *   `price`
    *   `brand`
    *   `manufacturer`
    *   `upc`
    *   `gender`
    *   `year`
    *   `frameColor`
    *   `frameShape`
    *   `frameStyle`
    *   `frameMaterial`
    *   `lensMaterial`
    *   `lensColor`
    *   `frameWidth`
    *   `lensWidth`
    *   `bridgeWidth`
    *   `armLength`
    *   `image_thumbnail`
    *   `image_original`
    *   `image_zoom`

## 4. Data Handling

*   **Missing Data:** If data cannot be found during scraping, it should be marked as "N/A" in the database.

## Mermaid Diagram

```mermaid
graph LR
    A[User] --> B(Brand Onboarding Page);
    B --> C{CSV Upload};
    B --> D{Shopify Store Connection};
    C --> E(CSV Parsing and Validation);
    D --> F(Shopify API Integration);
    E --> G(Data Cleaning and Transformation);
    F --> G;
    G --> H(Database Import);
    A --> I(Product Catalog);
    I --> J(Search and Filtering);
    I --> K(Product Listings);
    A --> L(AI Agent);
    L --> M(Brand Monitoring);
    M --> N(Website Scraping);
    N --> O(Data Extraction);
    O --> G;
    H --> P(PostgreSQL Database on GCP);
    L --> P;
    subgraph Brand Onboarding
    B, C, D, E, F, G, H
    end
    subgraph Marketplace
    I, J, K
    end
    subgraph AI Agent
    L, M, N, O
    end
    P --> Q[Products Table];
    P --> R[Brands Table];
    P --> S[Images Table];
    N --> T(Google Cloud Storage Bucket);
    T --> S;