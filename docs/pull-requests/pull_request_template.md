# Brand-Manufacturer Relationship & AI Enhancement

## Summary
This PR implements two major improvements to the EyewearML platform:
1. A hierarchical brand-manufacturer relationship model
2. AI-powered product data enhancement using Vertex AI

## Changes

### Data Model Enhancements
- Added manufacturer schema with relationships to brands
- Added brand schema with relationships to manufacturers and products
- Enhanced product schema to include brand and manufacturer references
- Created migration tools to update existing products

### AI Enhancement System
- Integrated with Google's Vertex AI for product data enrichment
- Implemented face shape compatibility scoring based on product attributes
- Added style keyword generation with brand context awareness
- Created feature summary and style description generation
- Built fallback simulation system for development/testing

### Testing and Deployment
- Created validation tests for brand-manufacturer relationships
- Added test scripts for AI enhancement
- Implemented batch processing for efficient data enhancement
- Added comprehensive error handling and logging

### Documentation
- Updated main README.md with new features
- Enhanced data module documentation
- Added usage examples and code snippets

## Testing Done
- Validated all existing products against new schema
- Tested AI enhancement on sample products
- Verified brand-manufacturer integrity through database queries
- Confirmed simulation fallback works properly

## Screenshots
[Include screenshots of enhanced product data if applicable]

## How to Test
1. Deploy the database with relationships:
   ```
   node src/data/scripts/deploy-with-relationships.js
   ```

2. Seed the database with brand and manufacturer data:
   ```
   node src/data/scripts/seed-brands.js
   ```

3. Test the validation system:
   ```
   node src/data/scripts/test-validation.js
   ```

4. Test the AI enhancement system:
   ```
   node src/data/scripts/test-ai-enhancement.js
   ```

## Notes
- Vertex AI integration requires valid Google Cloud credentials
- The simulation fallback ensures functionality in development environments
- Brand-manufacturer relationships provide foundation for improved filtering and organization

## Next Steps
- HTML Store integration to showcase enhanced product data
- Shopify connector updates to leverage new data model
- Dynamic face shape compatibility visualization
