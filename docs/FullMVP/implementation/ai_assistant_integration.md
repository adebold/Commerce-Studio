# AI Assistant Integration Guide for EyewearML Full MVP

This document provides implementation details for integrating the Hybrid AI Shopping Assistant with client stores in the EyewearML platform. It covers both HTML test stores and Shopify stores.

## Overview

The Hybrid AI Shopping Assistant provides personalized eyewear recommendations to customers based on their preferences, needs, and face shape. This guide focuses on the technical integration aspects of the assistant across different store types.

## Prerequisites

Before implementing the AI assistant integration, ensure you have:

1. A functioning HTML test store or Shopify store with product data
2. Access to the EyewearML MongoDB database
3. Google Cloud Platform project with Vertex AI enabled
4. Node.js server environment for the backend API
5. Client configuration for the AI assistant

## Step 1: Configure AI Assistant Backend

### 1.1. Set Up API Backend

First, set up a Node.js Express server to handle AI assistant requests:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { VertexAI } = require('@google-cloud/vertexai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Vertex AI
const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.VERTEX_AI_LOCATION,
});

const model = vertex.preview.getGenerativeModel({
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.2,
    topP: 0.8,
    topK: 40,
  },
});

// MongoDB connection
let db;
async function connectToMongoDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    db = client.db('eyewear_database');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// AI Assistant endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { query, client_id, store_type, session_id } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    if (!client_id) {
      return res.status(400).json({ error: 'Client ID is required' });
    }
    
    // Get relevant products based on query
    const relevantProducts = await getRelevantProducts(query, client_id);
    
    // Prepare prompt context
    const promptContext = await preparePromptContext(query, relevantProducts, store_type);
    
    // Call Vertex AI
    const response = await callVertexAI(promptContext, query);
    
    // Log interaction
    await logInteraction(client_id, session_id, query, response, relevantProducts);
    
    // Return response
    res.json({ response });
  } catch (error) {
    console.error('Assistant API error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// Start server
app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`AI Assistant API running on port ${port}`);
});

// Helper functions
async function getRelevantProducts(query, clientId) {
  // Extract keywords from query
  const keywords = extractKeywords(query);
  
  // Search for products matching keywords
  const products = await db.collection('products').find({
    client_id: clientId,
    "metadata.validation_status": "validated",
    $or: [
      { name: { $regex: keywords.join('|'), $options: 'i' } },
      { description: { $regex: keywords.join('|'), $options: 'i' } },
      { "specifications.frame_type": { $regex: keywords.join('|'), $options: 'i' } },
      { "specifications.frame_shape": { $regex: keywords.join('|'), $options: 'i' } },
      { "specifications.frame_color": { $regex: keywords.join('|'), $options: 'i' } },
      { "tags": { $in: keywords.map(k => new RegExp(k, 'i')) } }
    ]
  }).limit(5).toArray();
  
  // If face shape mentioned, also get products for that face shape
  const faceShape = detectFaceShape(query);
  if (faceShape) {
    const faceShapeProducts = await db.collection('products').find({
      client_id: clientId,
      "metadata.validation_status": "validated",
      "recommended_face_shapes": faceShape
    }).limit(5).toArray();
    
    // Combine and deduplicate products
    const allProductIds = new Set(products.map(p => p.id));
    for (const product of faceShapeProducts) {
      if (!allProductIds.has(product.id)) {
        products.push(product);
        allProductIds.add(product.id);
      }
    }
  }
  
  return products;
}

function extractKeywords(query) {
  // Simple keyword extraction (could be enhanced with NLP)
  const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'is', 'are'];
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

function detectFaceShape(query) {
  const faceShapes = ['oval', 'round', 'square', 'heart', 'diamond', 'rectangle', 'oblong'];
  const lowerQuery = query.toLowerCase();
  
  for (const shape of faceShapes) {
    if (lowerQuery.includes(shape)) {
      return shape;
    }
  }
  
  return null;
}

async function preparePromptContext(query, products, storeType) {
  // Load system prompt template
  const systemPrompt = await loadPromptTemplate();
  
  // Format product context
  const productContext = formatProductContext(products);
  
  return {
    systemPrompt,
    productContext,
    storeType
  };
}

async function loadPromptTemplate() {
  // In production, load from file or database
  return `
    You are an expert eyewear shopping assistant specialized in helping customers find the perfect eyewear products. Your task is to provide personalized recommendations, answer product questions, and guide the shopping experience.
    
    You have access to specific product information that you can recommend to customers. Only recommend products that are included in the PRODUCT CONTEXT section.
    
    When making recommendations:
    1. Consider the customer's face shape if mentioned
    2. Consider any style preferences they express
    3. Consider any specific features they're looking for
    4. Reference specific products by name and explain why they're a good fit
    
    Be conversational, helpful, and knowledgeable about eyewear.
  `;
}

function formatProductContext(products) {
  if (!products || products.length === 0) {
    return "No specific products are available for this query.";
  }
  
  return products.map(product => `
    Product ID: ${product.id}
    Name: ${product.name}
    Brand: ${product.brand}
    Price: ${product.price} ${product.currency}
    Frame Type: ${product.specifications?.frame_type || 'N/A'}
    Frame Shape: ${product.specifications?.frame_shape || 'N/A'}
    Frame Material: ${product.specifications?.frame_material || 'N/A'}
    Frame Color: ${product.specifications?.frame_color || 'N/A'}
    Recommended Face Shapes: ${product.recommended_face_shapes?.join(', ') || 'Not specified'}
    Description: ${product.short_description || product.description?.substring(0, 100) + '...' || 'No description available'}
  `).join('\n\n');
}

async function callVertexAI(promptContext, query) {
  try {
    // Prepare complete prompt
    const systemMessage = `
      ${promptContext.systemPrompt}
      
      STORE TYPE: ${promptContext.storeType}
      
      PRODUCT CONTEXT:
      ${promptContext.productContext}
    `;
    
    // Call Vertex AI
    const result = await model.generateContent({
      contents: [
        { role: 'system', parts: [{ text: systemMessage }] },
        { role: 'user', parts: [{ text: query }] }
      ],
    });
    
    return result.response.text();
  } catch (error) {
    console.error('Vertex AI error:', error);
    return "I'm sorry, I encountered an error while processing your request. Please try again.";
  }
}

async function logInteraction(clientId, sessionId, query, response, products) {
  try {
    // Create log entry
    const logEntry = {
      client_id: clientId,
      session_id: sessionId,
      timestamp: new Date(),
      query,
      response,
      products_referenced: products.map(p => p.id),
      metadata: {
        response_length: response.length,
        query_length: query.length,
        products_count: products.length
      }
    };
    
    // Insert into logs collection
    await db.collection('ai_assistant_logs').insertOne(logEntry);
  } catch (error) {
    console.error('Error logging interaction:', error);
  }
}
```

### 1.2. Configure Vertex AI

Configure your Google Cloud project and obtain credentials:

```bash
# Set up Google Cloud CLI
gcloud auth login
gcloud config set project your-project-id

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Create service account for Vertex AI access
gcloud iam service-accounts create eyewear-ai-assistant \
  --display-name="Eyewear AI Assistant Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding your-project-id \
  --member="serviceAccount:eyewear-ai-assistant@your-project-id.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create ./vertex-ai-key.json \
  --iam-account=eyewear-ai-assistant@your-project-id.iam.gserviceaccount.com
```

### 1.3. Configure Environment Variables

Set up environment variables for your backend service:

```bash
# .env file for backend service
MONGODB_URI=mongodb://username:password@hostname:port/eyewear_database
GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json
GOOGLE_CLOUD_PROJECT=your-project-id
VERTEX_AI_LOCATION=us-central1
PORT=3000
```

## Step 2: Integrate AI Assistant with HTML Store

### 2.1. Create Assistant Widget

Implement an AI assistant widget for HTML stores:

```html
<!-- ai-assistant-widget.html -->
<div id="ai-assistant-widget" class="assistant-widget">
  <button id="assistant-toggle" class="assistant-toggle">
    <span class="assistant-icon">💬</span>
    <span class="assistant-label">Shopping Assistant</span>
  </button>
  
  <div id="assistant-container" class="assistant-container hidden">
    <div class="assistant-header">
      <h3>Eyewear Shopping Assistant</h3>
      <button id="assistant-close" class="assistant-close">×</button>
    </div>
    
    <div id="assistant-messages" class="assistant-messages">
      <div class="assistant-message">
        Hi! I'm your eyewear shopping assistant. How can I help you find the perfect frames today?
      </div>
    </div>
    
    <div class="assistant-input">
      <input type="text" id="assistant-input-field" placeholder="Ask me about eyewear...">
      <button id="assistant-send">Send</button>
    </div>
  </div>
</div>
```

### 2.2. Add Assistant Styling

Add CSS for the assistant widget:

```css
/* ai-assistant.css */
.assistant-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: Arial, sans-serif;
}

.assistant-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 10px 20px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.assistant-toggle:hover {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.assistant-icon {
  font-size: 24px;
  margin-right: 8px;
}

.assistant-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
}

.assistant-container.hidden {
  display: none;
}

.assistant-header {
  padding: 15px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assistant-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.assistant-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.assistant-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.assistant-message, .user-message {
  padding: 10px 15px;
  margin-bottom: 10px;
  border-radius: 18px;
  max-width: 80%;
}

.assistant-message {
  background-color: #f0f0f0;
  align-self: flex-start;
}

.user-message {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
}

.assistant-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #ddd;
}

.assistant-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
  margin-right: 10px;
}

.assistant-input button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 15px;
  cursor: pointer;
}

.product-recommendation {
  display: flex;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.product-recommendation:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.product-recommendation img {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.product-details {
  padding: 10px;
}

.product-details h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.product-details p {
  margin: 3px 0;
  font-size: 12px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #f0f0f0;
  border-radius: 18px;
  align-self: flex-start;
  margin-bottom: 10px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #999;
  border-radius: 50%;
  display: inline-block;
  margin: 0 1px;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}
```

### 2.3. Implement Assistant JavaScript

Add JavaScript to interact with the API:

```javascript
// ai-assistant.js
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const toggleButton = document.getElementById('assistant-toggle');
  const closeButton = document.getElementById('assistant-close');
  const container = document.getElementById('assistant-container');
  const messagesContainer = document.getElementById('assistant-messages');
  const inputField = document.getElementById('assistant-input-field');
  const sendButton = document.getElementById('assistant-send');
  
  // Client configuration
  const clientId = 'client123'; // Replace with actual client ID
  
  // Products data
  let productsData = [];
  
  // Session ID
  const sessionId = generateSessionId();
  
  // Load products data
  fetch('/data/products.json')
    .then(response => response.json())
    .then(data => {
      productsData = data;
    })
    .catch(error => console.error('Error loading products:', error));
  
  // Toggle chat window
  toggleButton.addEventListener('click', function() {
    container.classList.toggle('hidden');
  });
  
  // Close chat window
  closeButton.addEventListener('click', function() {
    container.classList.add('hidden');
  });
  
  // Send message
  function sendMessage() {
    const userInput = inputField.value.trim();
    if (!userInput) return;
    
    // Add user message to chat
    addMessage('user', userInput);
    
    // Clear input field
    inputField.value = '';
    
    // Show typing indicator
    addTypingIndicator();
    
    // Call backend API
    fetch('https://your-api-url.com/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: userInput,
        client_id: clientId,
        store_type: 'html',
        session_id: sessionId
      })
    })
    .then(response => response.json())
    .then(data => {
      // Remove typing indicator
      removeTypingIndicator();
      
      // Add assistant response
      addMessage('assistant', data.response);
      
      // Enhance response with product links
      enhanceResponseWithProductLinks(data.response);
    })
    .catch(error => {
      console.error('Error calling assistant API:', error);
      removeTypingIndicator();
      addMessage('assistant', "I'm sorry, I encountered an error. Please try again.");
    });
  }
  
  // Send on button click
  sendButton.addEventListener('click', sendMessage);
  
  // Send on Enter key
  inputField.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Add message to chat
  function addMessage(role, content) {
    const messageElement = document.createElement('div');
    messageElement.className = `${role}-message`;
    messageElement.textContent = content;
    messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Add typing indicator
  function addTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  // Remove typing indicator
  function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
  
  // Enhance response with product links
  function enhanceResponseWithProductLinks(response) {
    for (const product of productsData) {
      if (response.includes(product.name) || response.includes(product.id)) {
        const productLink = document.createElement('a');
        productLink.href = product.url;
        productLink.className = 'product-recommendation';
        productLink.innerHTML = `
          <img src="/images/products/${product.main_image}" alt="${product.name}">
          <div class="product-details">
            <h4>${product.name}</h4>
            <p class="brand">${product.brand}</p>
            <p class="price">${product.price} ${product.currency}</p>
          </div>
        `;
        
        messagesContainer.appendChild(productLink);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }
  
  // Generate session ID
  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
});
```

### 2.4. Add Widget to Store Template

Update the HTML store templates to include the assistant:

```html
<!-- Add to bottom of index.html and other templates -->
<link rel="stylesheet" href="/css/ai-assistant.css">
<div id="ai-assistant-widget" class="assistant-widget">
  <!-- Assistant content from ai-assistant-widget.html -->
</div>
<script src="/js/ai-assistant.js"></script>
```

## Step 3: Integrate AI Assistant with Shopify Store

### 3.1. Create Shopify App Extension

Create a Shopify app for the AI assistant:

1. Set up a new Shopify app in the Partner Dashboard
2. Create a new Theme App Extension

### 3.2. Implement Shopify App Block

Create the app block for the assistant:

```liquid
{% comment %}
  // theme-extensions/ai-assistant/blocks/assistant.liquid
{% endcomment %}
<div id="eyewear-ai-assistant" 
  data-client-id="{{ block.settings.client_id }}"
  data-api-url="{{ block.settings.api_url }}">
</div>

{{ 'eyewear-assistant.css' | asset_url | stylesheet_tag }}
{{ 'eyewear-assistant.js' | asset_url | script_tag }}

{% schema %}
{
  "name": "AI Shopping Assistant",
  "target": "body",
  "settings": [
    {
      "type": "text",
      "id": "client_id",
      "label": "Client ID",
      "default": "client123"
    },
    {
      "type": "url",
      "id": "api_url",
      "label": "API URL",
      "default": "https://api.eyewearml.com/assistant"
    },
    {
      "type": "color",
      "id": "button_color",
      "label": "Button Color",
      "default": "#007bff"
    },
    {
      "type": "select",
      "id": "button_position",
      "label": "Button Position",
      "options": [
        { "value": "bottom-right", "label": "Bottom Right" },
        { "value": "bottom-left", "label": "Bottom Left" }
      ],
      "default": "bottom-right"
    }
  ]
}
{% endschema %}
```

### 3.3. Create Assistant Javascript for Shopify

Build the JavaScript implementation for Shopify:

```javascript
// theme-extensions/ai-assistant/assets/eyewear-assistant.js
(() => {
  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initializeAssistant();
  });
  
  function initializeAssistant() {
    // Get assistant element
    const assistantElement = document.getElementById('eyewear-ai-assistant');
    if (!assistantElement) return;
    
    // Get configuration
    const clientId = assistantElement.getAttribute('data-client-id');
    const apiUrl = assistantElement.getAttribute('data-api-url');
    
    // Create assistant UI
    createAssistantUI(assistantElement, clientId, apiUrl);
  }
  
  function createAssistantUI(container, clientId, apiUrl) {
    // Create widget HTML
    const widgetHTML = `
      <div class="eyewear-assistant-widget">
        <button class="eyewear-assistant-toggle">
          <span class="eyewear-assistant-icon">💬</span>
          <span class="eyewear-assistant-label">Shopping Assistant</span>
        </button>
        
        <div class="eyewear-assistant-container hidden">
          <div class="eyewear-assistant-header">
            <h3>Eyewear Shopping Assistant</h3>
            <button class="eyewear-assistant-close">×</button>
          </div>
          
          <div class="eyewear-assistant-messages">
            <div class="eyewear-assistant-message">
              Hi! I'm your eyewear shopping assistant. How can I help you find the perfect frames today?
            </div>
          </div>
          
          <div class="eyewear-assistant-input">
            <input type="text" placeholder="Ask me about eyewear...">
            <button>Send</button>
          </div>
        </div>
      </div>
    `;
    
    // Add to container
    container.innerHTML = widgetHTML;
    
    // Get elements
    const toggleButton = container.querySelector('.eyewear-assistant-toggle');
    const closeButton = container.querySelector('.eyewear-assistant-close');
    const assistantContainer = container.querySelector('.eyewear-assistant-container');
    const messagesContainer = container.querySelector('.eyewear-assistant-messages');
    const inputField = container.querySelector('.eyewear-assistant-input input');
    const sendButton = container.querySelector('.eyewear-assistant-input button');
    
    // Session ID
    const sessionId = 'shopify_' + Math.random().toString(36).substring(2, 15);
    
    // Toggle chat window
    toggleButton.addEventListener('click', () => {
      assistantContainer.classList.toggle('hidden');
    });
    
    // Close chat window
    closeButton.addEventListener('click', () => {
      assistantContainer.classList.add('hidden');
    });
    
    // Send message
    function sendMessage() {
      const userInput = inputField.value.trim();
      if (!userInput) return;
      
      // Add user message
      addMessage('user', userInput);
      
      // Clear input
      inputField.value = '';
      
      // Show typing
      showTypingIndicator();
      
      // Send to API
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: userInput,
          client_id: clientId,
          store_type: 'shopify',
          session_id: sessionId,
          shop: window.Shopify ? window.Shopify.shop : null
        })
      })
      .then(response => response.json())
      .then(data => {
        // Hide typing
        hideTypingIndicator();
        
        // Add response
        addMessage('assistant', data.response);
        
        // Find product mentions and enhance with links
        enhanceWithProductLinks(data.response);
      })
      .catch(error => {
        console.error('Assistant API error:', error);
        hideTypingIndicator();
        addMessage('assistant', "I'm sorry, I encountered an error. Please try again later.");
      });
    }
    
    // Send on button click
    sendButton.addEventListener('click', sendMessage);
    
    // Send on Enter
    inputField.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });
    
    // Add message to chat
    function addMessage(role, content) {
      const messageEl = document.createElement('div');
      messageEl.className = role === 'user' ? 'eyewear-assistant-user-message' : 'eyewear-assistant-message';
      messageEl.textContent = content;
      messagesContainer.appendChild(messageEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
      const typingEl = document.createElement('div');
      typingEl.className = 'eyewear-assistant-typing';
      typingEl.innerHTML = '<span></span><span></span><span></span>';
      typingEl.id = 'eyewear-assistant-typing';
      messagesContainer.appendChild(typingEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
      const typingEl = document.getElementById('eyewear-assistant-typing');
      if (typingEl) typingEl.remove();
    }
    
    // Enhance with product links
    function enhanceWithProductLinks(response) {
      // Search for product handles in the text
      // This is just a simple example - in production you'd want a more robust approach
      const productHandleRegex = /(?:glasses|frames|sunglasses) called ["']([^"']+)["']/gi;
      const productMatches = [...response.matchAll(productHandleRegex)];
      
      if (productMatches.length > 0) {
        for (const match of productMatches) {
          const productName = match[1];
          const productHandle = productName.toLowerCase().replace(/\s+/g, '-');
          
          // Look up real product URL - in production you'd query your database
          const productUrl = `/products/${productHandle}`;
          
          // Create
