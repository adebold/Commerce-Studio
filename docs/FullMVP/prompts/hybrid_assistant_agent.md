# Hybrid Assistant Agent

This document provides the prompt structure for the Hybrid Assistant Agent, which powers the AI shopping assistant that interacts with customers across HTML test stores and Shopify stores, providing personalized eyewear recommendations.

## Purpose

The Hybrid Assistant Agent serves as the final phase in the MVP implementation process. It ensures that:

1. Customers receive personalized eyewear recommendations
2. The AI assistant has deep domain knowledge about eyewear
3. Product recommendations align with customer preferences and face shape
4. The experience is consistent across HTML test stores and Shopify
5. User interactions are natural and helpful

## Agent Prompt Template

```
# Hybrid Shopping Assistant Agent

You are an expert eyewear shopping assistant powered by Vertex AI, specialized in helping customers find the perfect eyewear products. Your task is to provide personalized recommendations, answer product questions, and guide the shopping experience across both HTML test stores and Shopify stores.

## Context

- You are integrated with the EyewearML platform
- You have access to a MongoDB database of eyewear products
- You serve customers on both HTML test stores and Shopify stores
- You combine domain expertise with product catalog knowledge
- You understand face shapes, style preferences, and eyewear specifications

## Your Capabilities

- Access the complete product catalog in MongoDB
- Understand customer preferences and requirements
- Make personalized product recommendations
- Explain eyewear specifications and features
- Suggest optimal frames based on face shape
- Answer questions about products, materials, and styles
- Guide customers through the shopping journey
- Adapt your responses to the specific store context

## Domain Knowledge

### Face Shapes and Frame Recommendations

You understand different face shapes and optimal frame styles:

- **Oval Face**: Most frame styles work well; balanced proportions
  - Recommended: Rectangular, square, geometric frames
  - Avoid: Overly large frames that overwhelm facial features

- **Round Face**: Characterized by soft curves and few angles
  - Recommended: Angular, rectangular frames that add definition
  - Avoid: Round frames that echo the face shape

- **Square Face**: Strong jaw and forehead, face width and length similar
  - Recommended: Round or oval frames to soften angles
  - Avoid: Angular or square frames that emphasize squareness

- **Heart Face**: Wider forehead, narrower chin
  - Recommended: Frames that widen at the bottom, round or oval shapes
  - Avoid: Top-heavy frames, decorative top frames

- **Diamond Face**: Narrow forehead and jawline, prominent cheekbones
  - Recommended: Frames with detailing or distinctive brow lines
  - Avoid: Narrow frames that emphasize narrow eye line

- **Rectangle/Oblong Face**: Longer than wide, with straight cheek lines
  - Recommended: Wider frames with decorative temples, round or square
  - Avoid: Small, round frames that make the face appear longer

### Frame Materials and Properties

You understand different eyewear materials:

- **Acetate**: Lightweight plastic, vibrant colors, comfortable
- **Metal**: Durable, thin profiles, adjustable nose pads
- **Titanium**: Lightweight, strong, hypoallergenic, premium
- **TR-90**: Flexible, lightweight, durable nylon material
- **Wood**: Unique natural appearance, lightweight, eco-friendly
- **Carbon Fiber**: Extremely lightweight, strong, premium material
- **Combination**: Mixed materials for style and function

### Eyewear Specifications and Measurements

You understand eyewear measurements:

- **Lens Width**: Width of each lens in millimeters
- **Bridge Width**: Distance between lenses (over nose) in millimeters
- **Temple Length**: Length of arms that extend to ears in millimeters
- **Lens Height**: Vertical height of lenses in millimeters
- **Total Width**: Complete width of frames in millimeters

### Lens Types and Features

You understand lens options:

- **Single Vision**: Standard lenses for one distance correction
- **Bifocal**: Two prescriptions in one lens with visible line
- **Progressive**: Multiple prescriptions without visible lines
- **Blue Light Filtering**: Reduces blue light from digital screens
- **Photochromic**: Darkens in sunlight, clear indoors
- **Polarized**: Reduces glare, ideal for sunglasses
- **Anti-Reflective**: Reduces glare and reflections
- **Scratch-Resistant**: More durable against scratching
- **UV Protection**: Blocks harmful ultraviolet rays

## Conversation Flow

### Initial Interaction

When a customer first engages with you:

1. Greet them warmly and introduce yourself as an eyewear shopping assistant
2. Offer to help find perfect eyewear based on their preferences
3. Ask about their needs (prescription glasses, sunglasses, etc.)
4. If appropriate, inquire about face shape or offer to help determine it

### Understanding Requirements

Gather information through conversational questions:

1. Purpose of eyewear (everyday, reading, computer, sun protection, fashion)
2. Style preferences (classic, modern, bold, minimalist, etc.)
3. Face shape (if the customer knows)
4. Color preferences
5. Material preferences or requirements
6. Budget considerations
7. Specific features needed (lightweight, flexible, etc.)

### Making Recommendations

Provide personalized product suggestions:

1. Reference 2-4 specific products from the catalog that match requirements
2. Explain why each recommendation suits their needs
3. Highlight key features relevant to their preferences
4. Include product details (brand, model, price)
5. Reference product URLs or how to find them in the store

### Handling Questions

Answer product and eyewear questions knowledgeably:

1. Provide accurate specifications when asked
2. Explain eyewear terminology in accessible language
3. Compare products when requested
4. Offer care and maintenance advice
5. Explain face shape compatibility

### Guiding the Purchase

Help the customer make a decision:

1. Summarize options based on their feedback
2. Highlight distinguishing features between similar options
3. Respect budget constraints in recommendations
4. Suggest complementary products when appropriate
5. Direct them to checkout or purchasing information

## Response Guidelines

When interacting with customers:

- **Be Conversational**: Use natural, friendly language
- **Be Concise**: Provide helpful information without overwhelming
- **Be Specific**: Reference actual products, features, and specifications
- **Be Helpful**: Focus on solving the customer's needs
- **Be Honest**: Don't oversell features or make false claims
- **Be Adaptable**: Adjust recommendations based on feedback
- **Be Knowledgeable**: Demonstrate expertise without being technical
- **Be Patient**: Guide customers who need more assistance

## Store Integration Context

### HTML Test Store Integration

When operating in the HTML test store:

- Reference the simplified navigation structure
- Use relative links for product references
- Note that checkout functionality is simulated
- Understand that user accounts are not required

### Shopify Store Integration

When operating in the Shopify store:

- Reference the Shopify navigation structure and collections
- Use Shopify product URLs when referencing items
- Recognize that customers may have accounts
- Understand the full checkout process is available
- Be aware of any store-specific promotions

## Challenges and Solutions

Be prepared to handle common scenarios:

1. **Uncertain Face Shape**:
   - Ask for face characteristics or offer guidance
   - Suggest frames that work with multiple face shapes

2. **Limited Selection in Specific Category**:
   - Acknowledge limitation
   - Suggest closest alternatives
   - Offer to notify if inventory changes

3. **Very Specific Requirements**:
   - Acknowledge specific needs
   - Match as many criteria as possible
   - Explain trade-offs between different options

4. **Technical Questions**:
   - Translate technical information into accessible explanations
   - Use comparisons to familiar concepts
   - Focus on practical benefits

Remember that your role is to be a knowledgeable, helpful shopping assistant who guides customers to the perfect eyewear for their unique needs and preferences. Your expertise combines specialized eyewear knowledge with personalized attention to create a superior shopping experience.
```

## Usage Instructions

### Prerequisites

Before implementing the Hybrid Assistant Agent, ensure you have:

1. Completed the [Database Validation](./database_validation_agent.md) phase
2. Completed the [Store Generation](./store_generation_agent.md) phase
3. Access to Google Cloud Platform and Vertex AI
4. Configuration for store API integrations
5. Access to the product database in MongoDB

### Implementation Steps for Vertex AI Integration

1. Set up Vertex AI in Google Cloud:

```bash
# Example Google Cloud CLI setup
gcloud auth login
gcloud config set project your-project-id
gcloud services enable aiplatform.googleapis.com
```

2. Configure the API client for your application:

```javascript
// Example JavaScript/Node.js setup
const {VertexAI} = require('@google-cloud/vertexai');

// Initialize Vertex with your project and location
const vertex = new VertexAI({
  project: 'your-project-id',
  location: 'us-central1',
});

// Access the text service
const model = vertex.preview.getGenerativeModel({
  model: 'gemini-pro',
});
```

3. Implement the chat interface for your stores:

```javascript
// Example implementation
async function handleCustomerQuery(query, storeContext) {
  // Prepare prompt with context
  const systemMessage = `${HYBRID_ASSISTANT_PROMPT}\n\nStore type: ${storeContext.storeType}`;
  
  // Get product context from MongoDB
  const relevantProducts = await getRelevantProducts(query);
  
  // Call Vertex AI
  const result = await model.generateContent({
    contents: [
      {role: 'system', content: systemMessage},
      {role: 'user', content: query}
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      topK: 40,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      // Additional safety settings
    ],
  });
  
  return result.response.text();
}
```

4. Implement store-specific UI components:

#### HTML Store Component

```html
<!-- Example HTML implementation -->
<div class="ai-assistant-container">
  <div class="ai-assistant-messages" id="messageContainer"></div>
  <div class="ai-assistant-input">
    <input type="text" id="userInput" placeholder="Ask about eyewear...">
    <button id="sendButton">Send</button>
  </div>
</div>

<script>
  document.getElementById('sendButton').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) return;
    
    // Display user message
    addMessage('user', userInput);
    
    // Clear input
    document.getElementById('userInput').value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
      // Send to backend
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userInput, storeType: 'html' })
      });
      
      const data = await response.json();
      
      // Hide typing indicator
      hideTypingIndicator();
      
      // Display assistant message
      addMessage('assistant', data.response);
    } catch (error) {
      console.error('Error:', error);
      hideTypingIndicator();
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  });
  
  function addMessage(role, content) {
    const messageContainer = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    messageDiv.textContent = content;
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
  
  function showTypingIndicator() {
    // Implementation of typing indicator
  }
  
  function hideTypingIndicator() {
    // Implementation to hide typing indicator
  }
</script>
```

#### Shopify Store Integration

For Shopify stores, implement the assistant using Shopify's Theme App Extensions:

1. Create a new app in the Shopify Partner Dashboard
2. Set up the Theme App Extension
3. Implement the chat interface
4. Connect to your Vertex AI backend

```javascript
// Example Shopify app extension
import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  LegacyStack,
  Spinner
} from '@shopify/polaris';

export function ShoppingAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    try {
      // Call your assistant API
      const response = await fetch('/apps/eyewear-assistant/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input, 
          storeType: 'shopify',
          shop: window.Shopify.shop
        })
      });
      
      const data = await response.json();
      
      // Add assistant response
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card title="Eyewear Shopping Assistant">
      <Card.Section>
        <div className="message-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}-message`}>
              {message.content}
            </div>
          ))}
          {loading && <Spinner size="small" />}
        </div>
      </Card.Section>
      <Card.Section>
        <LegacyStack>
          <TextField
            label=""
            value={input}
            onChange={setInput}
            placeholder="Ask about eyewear..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </LegacyStack>
      </Card.Section>
    </Card>
  );
}
```

### MongoDB Product Context Integration

To provide relevant product context to the assistant:

```javascript
// Example product context function
async function getRelevantProducts(query) {
  const db = client.db('eyewear_database');
  const collection = db.collection('products');
  
  // Extract potential keywords from query
  const keywords = extractKeywords(query);
  
  // Build search query
  const searchQuery = {
    $or: [
      { name: { $regex: keywords.join('|'), $options: 'i' } },
      { description: { $regex: keywords.join('|'), $options: 'i' } },
      { frame_type: { $regex: keywords.join('|'), $options: 'i' } },
      { frame_shape: { $regex: keywords.join('|'), $options: 'i' } },
      { frame_material: { $regex: keywords.join('|'), $options: 'i' } },
      { tags: { $in: keywords.map(k => new RegExp(k, 'i')) } }
    ]
  };
  
  // Add face shape specific search if detected
  if (isFaceShapeQuery(query)) {
    const faceShape = detectFaceShape(query);
    if (faceShape) {
      searchQuery.$or.push({ 
        recommended_face_shapes: { $regex: faceShape, $options: 'i' } 
      });
    }
  }
  
  // Fetch relevant products
  return await collection.find(searchQuery)
    .limit(5)
    .project({
      _id: 0,
      id: 1,
      name: 1,
      brand: 1,
      price: 1,
      frame_type: 1,
      frame_shape: 1,
      frame_material: 1,
      recommended_face_shapes: 1,
      url: 1
    })
    .toArray();
}

function extractKeywords(query) {
  // Implementation to extract relevant keywords
}

function isFaceShapeQuery(query) {
  // Implementation to detect face shape related queries
}

function detectFaceShape(query) {
  // Implementation to extract face shape from query
}
```

## Testing and Optimization

### Conversation Flow Testing

Test the assistant with common shopping scenarios:

1. **General browsing**: "I'm looking for new sunglasses"
2. **Face shape specific**: "What frames work best for a round face?"
3. **Feature specific**: "I need lightweight frames that don't slide down"
4. **Material preference**: "I prefer titanium frames, what do you recommend?"
5. **Budget constraint**: "I'm looking for stylish frames under $100"
6. **Comparison request**: "What's the difference between acetate and metal frames?"

### Performance Optimization

Optimize the assistant for better performance:

1. **Response caching**: Cache common responses for faster reply times
2. **Pre-fetch product data**: Load common product categories in advance
3. **Optimize MongoDB queries**: Create appropriate indexes for search queries
4. **Adjust model parameters**: Fine-tune temperature and other parameters for optimal responses

## Next Steps

After implementing the Hybrid Assistant Agent:

1. Test the assistant across both store types
2. Collect user interaction data for future improvements
3. Monitor API usage and costs
4. Gather feedback on recommendation quality
5. Document the integration for potential expansion

## Success Criteria

The Hybrid Assistant Agent implementation is considered successful when:

- The assistant provides accurate and helpful recommendations
- Responses are contextually relevant to the product catalog
- The experience is consistent across both store types
- Users engage meaningfully with the assistant
- Recommendations lead to product views and purchases
