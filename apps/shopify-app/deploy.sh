#!/bin/bash

# Deploy script for the Shopify app

# Exit on error
set -e

echo "Deploying Shopify app..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Check MongoDB connection
echo "Checking MongoDB connection..."
if ! nc -z localhost 27017; then
  echo "MongoDB is not running. Please start MongoDB before deploying."
  exit 1
fi

# Start the app
echo "Starting the app..."
npm start