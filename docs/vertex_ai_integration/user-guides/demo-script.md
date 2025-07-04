# Demo Script User Guide

The Vertex AI Shopping Assistant integration includes a command-line demo script that allows you to interact with the AI assistant without deploying the full Shopify app. This guide explains how to use the demo script for testing and demonstration purposes.

## Overview

The demo script provides a simple command-line interface for:

- Testing the Vertex AI integration
- Demonstrating the Shopping Assistant capabilities
- Validating your configuration settings
- Debugging any issues with the integration

## Prerequisites

Before using the demo script, ensure you have:

1. Completed the [Installation](../setup/installation.md) steps
2. Set up your environment variables with proper Vertex AI credentials
3. Node.js 18+ installed on your system

## Running the Demo

### Basic Usage

To run the demo script, navigate to the project root directory and execute:

```bash
node apps/shopify/scripts/vertex-ai-demo.js
```

Alternatively, if you're in the package directory, you can run:

```bash
node src/conversational_ai/package/demo.js
```

### Configuration

The demo script uses the following environment variables:

- `SHOP_DOMAIN`: The Shopify store domain to use (required)
- `VERTEX_AI_PROJECT_ID`: Your Google Cloud project ID
- `VERTEX_AI_LOCATION`: The region where your Vertex AI resources are deployed (defaults to "us-central1")
- `VERTEX_AI_CREDENTIALS_PATH`: Path to the Google Cloud credentials JSON file

You can set these variables in your `.env` file or provide them directly when running the script:

```bash
SHOP_DOMAIN=your-store.myshopify.com node apps/shopify/scripts/vertex-ai-demo.js
```

## Using the Demo

When you start the demo script, you'll see a welcome message and instructions for using the interface:

```
==================================================
       Vertex AI Shopping Assistant Demo
==================================================

Connected to shop: your-store.myshopify.com

Type your questions about eyewear products or type "exit" to quit.
Example questions:
 - What sunglasses do you recommend for a round face?
 - Do you have any blue light glasses?
 - Can you suggest lightweight frames for everyday use?
 - What are your best-selling women's frames?
==================================================
```

### Interacting with the Assistant

After the welcome message, you can start typing your questions about eyewear products. The assistant will process your queries and respond with relevant information and recommendations.

Example interaction:

```
Assistant: Hi! I'm your eyewear shopping assistant. I can help you find the perfect frames based on your face shape, style preferences, and needs. How can I help you today?

You: What sunglasses do you recommend for a round face?
