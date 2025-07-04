# Apify to MongoDB Migration Guide

This document provides developers with comprehensive instructions on how to connect to Apify, run data extraction scripts, and migrate the data to MongoDB.

## Overview

The Apify to MongoDB migration process consists of three main steps:

1. Setting up Apify API access
2. Running extraction scripts to collect data
3. Migrating the extracted data to MongoDB

This workflow enables our system to maintain up-to-date product information and imagery for the eyewear ML models.

## Prerequisites

Before beginning the migration process, ensure you have:

- An Apify account with API access
- MongoDB Atlas account or a local MongoDB instance
- Node.js 14.x or higher
- Python 3.8 or higher
- Required npm packages and Python libraries (listed below)

## 1. Apify Setup

### 1.1 Creating an Apify Account

If you don't already have an Apify account:

1. Visit [https://apify.com](https://apify.com) and sign up for an account
2. Navigate to the Apify Console after signing in
3. Go to Settings → Integrations to find your API token

### 1.2 Configuring API Access

The API token should be stored securely as an environment variable:

```bash
# For Windows
set APIFY_API_TOKEN=your_api_token_here

# For macOS/Linux
export APIFY_API_TOKEN=your_api_token_here

# For permanent storage, add to your .env file
echo "APIFY_API_TOKEN=your_api_token_here" >> .env
```

### 1.3 Verify API Access

Test your API configuration with the following command:

```bash
curl -H "Authorization: Bearer your_api_token_here" https://api.apify.com/v2/user/me
```

You should receive a JSON response with your account details.

## 2. MongoDB Setup

### 2.1 MongoDB Connection

Set up your MongoDB connection string as an environment variable:

```bash
# For local MongoDB
export MONGODB_URI=mongodb://localhost:27017/eyewear_ml

# For MongoDB Atlas
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eyewear_ml
```

### 2.2 Database Structure

The migration scripts expect the following collections in your MongoDB database:

- `products` - Stores eyewear product information
- `frames` - Contains frame specifications and metadata
- `images` - Stores image URLs and metadata
- `measurements` - Houses product measurement data

## 3. Running the Migration Scripts

### 3.1 Installation

Clone the repository and install the required dependencies:

```bash
git clone https://github.com/Answerable/eyewear-ml.git
cd eyewear-ml
npm install
pip install -r requirements.txt
```

### 3.2 Extraction Scripts

The extraction scripts are located in the `scripts/apify` directory:

```bash
# Extract data from Apify
node scripts/apify/extract_data.js --dataset eyewear_products --output ./data/extracted

# Process extracted data
node scripts/apify/process_data.js --input ./data/extracted --output ./data/processed
```

### 3.3 Data Validation

Before migration, validate the processed data:

```bash
node scripts/apify/validate_data.js --input ./data/processed
```

This will generate a validation report in `./data/validation_report.json`.

### 3.4 MongoDB Migration

To migrate the processed data to MongoDB:

```bash
node scripts/mongodb/migrate.js --input ./data/processed
```

For incremental updates (only adding new or modified data):

```bash
node scripts/mongodb/migrate.js --input ./data/processed --incremental
```

### 3.5 Automated Full Pipeline

For convenience, a full pipeline script is available:

```bash
# Run the entire pipeline from extraction to migration
npm run apify-to-mongodb

# With specific options
npm run apify-to-mongodb -- --dataset custom_dataset_id --incremental
```

## 4. Monitoring & Logs

The migration process generates detailed logs in the `logs` directory:

- `logs/extraction.log` - Apify extraction logs
- `logs/processing.log` - Data processing logs
- `logs/validation.log` - Data validation logs
- `logs/migration.log` - MongoDB migration logs

Monitor these logs for any errors or warnings during the migration process.

## 5. Scheduling Automated Updates

To keep your MongoDB data in sync with Apify, set up a scheduled task:

### 5.1 Using Cron (Linux/macOS)

```bash
# Edit crontab
crontab -e

# Add the following line to run daily at 2 AM
0 2 * * * cd /path/to/eyewear-ml && npm run apify-to-mongodb -- --incremental >> logs/scheduled_migration.log 2>&1
```

### 5.2 Using Task Scheduler (Windows)

1. Open Task Scheduler
2. Create a new Basic Task
3. Set the trigger (e.g., daily at 2 AM)
4. Set the action as "Start a program"
5. Program/script: `npm`
6. Arguments: `run apify-to-mongodb -- --incremental`
7. Start in: `C:\path\to\eyewear-ml`

## 6. Troubleshooting

### 6.1 Common Issues

#### Apify API Connection Errors

- Verify your API token is correct
- Check your internet connection
- Ensure you're not exceeding Apify rate limits

#### MongoDB Connection Issues

- Confirm your MongoDB URI is correct
- Check firewall settings to ensure MongoDB port is accessible
- Verify network connectivity to MongoDB Atlas (if using cloud version)

#### Data Processing Errors

- Check that the input data structure matches expected format
- Ensure sufficient disk space for data processing
- Verify all required fields are present in the data

### 6.2 Error Recovery

If the migration fails midway:

1. Check the logs to identify the failure point
2. Fix the issue (e.g., incorrect data format, network connectivity)
3. Resume the process with the `--resume` flag:
   ```bash
   node scripts/mongodb/migrate.js --input ./data/processed --resume
   ```

## 7. Performance Optimization

For large datasets, consider the following optimizations:

- Use batch processing with the `--batch-size` parameter
- Increase memory allocation for Node.js with `NODE_OPTIONS="--max-old-space-size=8192"`
- Use MongoDB bulk operations for faster inserts
- Implement parallel processing with the `--workers` flag

## 8. Data Backup

Before running migrations, create a MongoDB backup:

```bash
# Using mongodump (local MongoDB)
mongodump --db eyewear_ml --out ./backups/$(date +%Y-%m-%d)

# Using Atlas (cloud MongoDB)
mongodump --uri "mongodb+srv://username:password@cluster.mongodb.net/eyewear_ml" --out ./backups/$(date +%Y-%m-%d)
```

## 9. Sample Migration Script

Here's an example script showing how to connect to both Apify and MongoDB:

```javascript
// migrate_data.js
const { ApifyClient } = require('apify-client');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Initialize Apify client
const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

// Initialize MongoDB client
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const db = mongoClient.db();
    const collection = db.collection('products');
    
    // Get dataset items from Apify
    const datasetId = 'your_dataset_id';
    console.log(`Fetching data from Apify dataset: ${datasetId}`);
    const { items } = await apifyClient.dataset(datasetId).listItems();
    console.log(`Retrieved ${items.length} items from Apify`);
    
    // Process and transform data if needed
    const processedItems = items.map(item => ({
      ...item,
      importedAt: new Date(),
      source: 'apify'
    }));
    
    // Insert into MongoDB
    console.log('Inserting data into MongoDB...');
    const result = await collection.insertMany(processedItems, { ordered: false });
    console.log(`Successfully inserted ${result.insertedCount} items into MongoDB`);
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close connections
    await mongoClient.close();
    console.log('MongoDB connection closed');
  }
}

migrateData();
```

## 10. Conclusion

Following this guide, you should be able to successfully connect to Apify, extract eyewear data, and migrate it to MongoDB. Regular updates through scheduled tasks will ensure your database remains synchronized with the latest product information.

For detailed information about the data pipeline structure and processing logic, refer to the main [Data Pipeline Documentation](data_pipeline.md).

## 11. Further Resources

- [Apify SDK Documentation](https://docs.apify.com/sdk/js/)
- [MongoDB Node.js Driver Documentation](https://mongodb.github.io/node-mongodb-native/)
- [Mongoose Documentation](https://mongoosejs.com/docs/) (if using Mongoose ODM)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
