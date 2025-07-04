# Chat Interface

The Shopping Assistant chat interface provides the user-facing component of the Vertex AI integration. It enables customers to interact with the AI shopping assistant through a conversational interface embedded in the Shopify storefront.

## Overview

The Shopping Assistant UI is implemented as a React component that provides:

- A floating chat button that can be positioned anywhere on the page
- An expandable chat window with message history
- Support for product recommendations with images and details
- A product detail modal for deeper product information
- Suggested follow-up questions to guide the conversation

## Implementation

The chat interface is implemented as a React component in TypeScript, located at `apps/shopify/frontend/components/ShoppingAssistant.tsx`. It provides a comprehensive set of features while maintaining flexibility for customization.

## Component Structure

### Main Components

1. **ShoppingAssistant**: The main container component that manages state and renders child components
2. **Chat Toggle Button**: Floating button to open/close the chat interface
3. **Chat Window**: Container for the conversation, including header, messages, and input
4. **Message Container**: Renders individual messages, including AI responses and user queries
5. **Product Recommendations**: Displays product cards based on AI recommendations
6. **Product Modal**: Shows detailed product information when a product is selected
7. **Suggested Queries**: Shows clickable suggested follow-up questions

### Component Hierarchy

```
ShoppingAssistant
├── renderToggleButton()
│   └── Avatar or Icon
├── renderChatWindow()
│   ├── Chat Header
│   │   ├── Avatar
│   │   └── Title
│   ├── Messages Container
│   │   └── Message (for each message)
│   │       ├── Avatar
│   │       ├── Text Content
│   │       ├── Product Recommendations (if present)
│   │       │   └── Product Card (for each product)
│   │       └── Suggested Queries (if present)
│   └── Message Input
│       ├── TextField
│       └── Send Button
└── renderProductModal()
    ├── Product Image
    ├── Product Details
    ├── Price Information
    ├── Specifications
    └── Action Buttons
```

## Props Interface

The `ShoppingAssistant` component accepts the following props:

```typescript
interface ShoppingAssistantProps {
  shopDomain: string;
  initialMessage?: string;
  initialContext?: string[];
  autoOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  buttonLabel?: string;
  avatarUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  userAvatarUrl?: string;
  assistantAvatarUrl?: string;
  welcomeMessage?: string;
}
```

### Props Description

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| shopDomain | string | The Shopify store domain (required) | - |
| initialMessage | string | First message displayed in the chat | "Hi! I'm your eyewear shopping assistant..." |
| initialContext | string[] | Context items to initialize the conversation | [] |
| autoOpen | boolean | Whether to open the chat automatically | false |
| position | string | Position of the chat button | "bottom-right" |
| buttonLabel | string | Text displayed in the chat header | "Shopping Assistant" |
| avatarUrl | string | Image URL for the chat button | "/images/assistant-avatar.png" |
| primaryColor | string | Main color for buttons and UI elements | "#5c6ac4" |
| secondaryColor | string | Background color for the chat window | "#f9fafb" |
| userAvatarUrl | string | Avatar for user messages | "/images/user-avatar.png" |
| assistantAvatarUrl | string | Avatar for assistant messages | "/images/assistant-avatar.png" |
| welcomeMessage | string | Initial welcome message from the assistant | "Hi! I can help you find..." |

## State Management

The component uses React's `useState` and `useEffect` hooks to manage:

1. **Chat State**:
   - `isOpen`: Whether the chat window is open
   - `messages`: Array of conversation messages
   - `currentMessage`: Current input text
   - `isLoading`: Loading state during API requests

2. **Session Management**:
   - `sessionId`: Unique identifier for the conversation session

3. **UI State**:
   - `selectedProduct`: Currently selected product for detail view

## Key Functions

### Message Handling

```typescript
const handleSendMessage = async () => {
  if (!currentMessage.trim()) return;
  
  // Add user message to the chat
  const userMessage = {
    id: `user_${Date.now()}`,
    content: currentMessage,
    sender: 'user',
    timestamp: Date.now()
  };
  
  setMessages(prevMessages => [...prevMessages, userMessage]);
  setCurrentMessage('');
  setIsLoading(true);
  
  try {
    // Send message to API
    const response = await fetch('/api/shopping-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: currentMessage,
        sessionId,
        contextItems: initialContext,
        shopDomain
      })
    });
    
    // Process API response
    if (!response.ok) {
      throw new Error('Failed to get response from shopping assistant');
    }
    
    const data = await response.json();
    
    // Add assistant response to messages
    const assistantMessage = {
      id: `assistant_${Date.now()}`,
      content: data.response,
      sender: 'assistant',
      timestamp: Date.now(),
      products: data.products,
      suggestedQueries: data.suggestedQueries
    };
    
    setMessages(prevMessages => [...prevMessages, assistantMessage]);
  } catch (error) {
    // Handle errors
    console.error('Error sending message:', error);
    
    // Add error message
    const errorMessage = {
      id: `assistant_error_${Date.now()}`,
      content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
      sender: 'assistant',
      timestamp: Date.now()
    };
    
    setMessages(prevMessages => [...prevMessages, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
```

### UI Rendering

#### Message Content Rendering

```typescript
const renderMessageContent = (message) => {
  return (
    <div className="message-container">
      <TextContainer>
        {message.content}
      </TextContainer>
      
      {/* Product recommendations */}
      {message.products && message.products.length > 0 && (
        <div className="product-recommendations">
          <ResourceList
            resourceName={{ singular: 'product', plural: 'products' }}
            items={message.products}
            renderItem={(product) => (
              <ResourceItem
                id={product.id}
                media={<Thumbnail source={product.images[0]?.url} alt={product.title} />}
                onClick={() => handleProductClick(product)}
              >
                <h3><TextStyle variation="strong">{product.title}</TextStyle></h3>
                <div>
                  <TextStyle variation="strong">${product.price.amount.toFixed(2)}</TextStyle>
                </div>
              </ResourceItem>
            )}
          />
        </div>
      )}
      
      {/* Suggested queries */}
      {message.suggestedQueries && message.suggestedQueries.length > 0 && (
        <div className="suggested-queries">
          <Caption>Suggested questions:</Caption>
          <Stack spacing="tight">
            {message.suggestedQueries.map((query, index) => (
              <Button
                key={`query_${index}`}
                plain
                onClick={() => handleSuggestedQueryClick(query)}
              >
                {query}
              </Button>
            ))}
          </Stack>
        </div>
      )}
    </div>
  );
};
```

## Styling and Customization

The component uses inline styles for flexibility, with customization through props:

```typescript
<div 
  className="chat-window"
  style={{
    ...getPositionStyles(),
    position: 'fixed',
    zIndex: 1000,
    width: '350px',
    maxWidth: 'calc(100vw - 40px)', 
    height: '500px',
    maxHeight: 'calc(100vh - 80px)',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  }}
>
  {/* Chat content here */}
</div>
```

The position is calculated based on the `position` prop:

```typescript
const getPositionStyles = () => {
  switch (position) {
    case 'bottom-right':
      return { bottom: '20px', right: '20px' };
    case 'bottom-left':
      return { bottom: '20px', left: '20px' };
    case 'top-right':
      return { top: '20px', right: '20px' };
    case 'top-left':
      return { top: '20px', left: '20px' };
    default:
      return { bottom: '20px', right: '20px' };
  }
};
```

## Accessibility

The component implements accessibility features for all users:

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels for interactive elements
3. **Focus Management**: Maintains proper focus when the chat opens/closes
4. **Color Contrast**: Ensures adequate contrast for readability

## Product Details Modal

When a user clicks on a product, the product details modal displays comprehensive information:

```typescript
const renderProductModal = () => {
  if (!selectedProduct) return null;
  
  return (
    <Modal
      open={!!selectedProduct}
      onClose={() => setSelectedProduct(null)}
      title={selectedProduct.title}
      primaryAction={{
        content: 'View Product',
        onAction: () => {
          window.open(selectedProduct.url, '_blank');
        }
      }}
      secondaryActions={[
        {
          content: 'Close',
          onAction: () => setSelectedProduct(null)
        }
      ]}
    >
      <Modal.Section>
        <Layout>
          <Layout.Section oneHalf>
            <img 
              src={selectedProduct.images[0]?.url} 
              alt={selectedProduct.title}
              style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
            />
          </Layout.Section>
          <Layout.Section oneHalf>
            <TextContainer>
              <p>{selectedProduct.description}</p>
              <p>
                <TextStyle variation="strong">Price: </TextStyle>
                ${selectedProduct.price.amount.toFixed(2)}
              </p>
              {/* Additional product details */}
            </TextContainer>
          </Layout.Section>
        </Layout>
      </Modal.Section>
    </Modal>
  );
};
```

## Usage Examples

### Basic Usage

```jsx
import { ShoppingAssistant } from './components/ShoppingAssistant';

function App() {
  return (
    <div className="app">
      <ShoppingAssistant 
        shopDomain="your-store.myshopify.com"
      />
    </div>
  );
}
```

### Customized Appearance

```jsx
import { ShoppingAssistant } from './components/ShoppingAssistant';

function App() {
  return (
    <div className="app">
      <ShoppingAssistant 
        shopDomain="your-store.myshopify.com"
        position="bottom-left"
        primaryColor="#00a0e9"
        secondaryColor="#f0f8ff"
        buttonLabel="Eyewear Assistant"
        avatarUrl="/custom-avatar.png"
        welcomeMessage="Hello! Looking for the perfect eyewear? I'm here to help!"
      />
    </div>
  );
}
```

### With Initial Context

```jsx
import { ShoppingAssistant } from './components/ShoppingAssistant';

function ProductPage({ product }) {
  // Pass product information as context
  const initialContext = [
    `User is viewing: ${product.title}`,
    `Product type: ${product.type}`,
    `Price: ${product.price}`
  ];

  return (
    <div className="product-page">
      {/* Product details */}
      
      <ShoppingAssistant 
        shopDomain="your-store.myshopify.com"
        initialContext={initialContext}
        welcomeMessage={`Have questions about ${product.title}? I'm happy to help!`}
      />
    </div>
  );
}
```

## Implementation Considerations

When implementing the Shopping Assistant UI:

1. **Integration with Themes**: Ensure the component works well with your Shopify theme
2. **Mobile Responsiveness**: Verify the chat interface is usable on small screens
3. **Performance Impact**: Lazy load the component to minimize impact on page load
4. **API Endpoint**: Ensure the `/api/shopping-assistant` endpoint is properly configured
5. **Asset Hosting**: Host avatar images and other assets in your Shopify theme

## Related Components

The Chat Interface works closely with:

- [API Endpoints](./api-endpoints.md): Provides the backend API for the chat interface
- [Vertex AI Connector](./vertex-ai-connector.md): Powers the AI responses and product recommendations
- [Product Catalog Adapter](./product-catalog-adapter.md): Provides the product data displayed in the interface
