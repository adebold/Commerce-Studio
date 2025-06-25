import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  TextContainer,
  TextField,
  Button,
  Stack,
  Spinner,
  Avatar,
  Thumbnail,
  ResourceList,
  ResourceItem,
  TextStyle,
  Caption,
  Modal,
  Layout,
  Icon
} from '@shopify/polaris';
import { ChevronUpMinor, ChevronDownMinor, SendMajor } from '@shopify/polaris-icons';
import { StandardProduct } from '../types/product-catalog';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  products?: StandardProduct[];
  suggestedQueries?: string[];
}

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

export function ShoppingAssistant({
  shopDomain,
  initialMessage = "Hi! I'm your eyewear shopping assistant. I can help you find the perfect frames for your face shape, style, and needs. How can I help you today?",
  initialContext = [],
  autoOpen = false,
  position = 'bottom-right',
  buttonLabel = 'Shopping Assistant',
  avatarUrl = '/images/assistant-avatar.png',
  primaryColor = '#5c6ac4',
  secondaryColor = '#f9fafb',
  userAvatarUrl = '/images/user-avatar.png',
  assistantAvatarUrl = '/images/assistant-avatar.png',
  welcomeMessage = 'Hi! I can help you find the perfect eyewear. What are you looking for today?'
}: ShoppingAssistantProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StandardProduct | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Generate a session ID
  useEffect(() => {
    const generatedSessionId = `session_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    setSessionId(generatedSessionId);
    
    // Add initial welcome message
    if (welcomeMessage) {
      setMessages([
        {
          id: `assistant_${Date.now()}`,
          content: welcomeMessage,
          sender: 'assistant',
          timestamp: Date.now()
        }
      ]);
    }
  }, [welcomeMessage]);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle message submission
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage: Message = {
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
      
      if (!response.ok) {
        throw new Error('Failed to get response from shopping assistant');
      }
      
      const data = await response.json();
      
      // Add assistant response to messages
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        content: data.response,
        sender: 'assistant',
        timestamp: Date.now(),
        products: data.products,
        suggestedQueries: data.suggestedQueries
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
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
  
  // Handle key press for sending messages
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle clicking on a suggested query
  const handleSuggestedQueryClick = (query: string) => {
    setCurrentMessage(query);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };
  
  // Handle viewing product details
  const handleProductClick = (product: StandardProduct) => {
    setSelectedProduct(product);
  };
  
  // Get position styles
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
  
  // Render message content
  const renderMessageContent = (message: Message) => {
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
              renderItem={(product: StandardProduct) => (
                <ResourceItem
                  id={product.id}
                  media={
                    <Thumbnail
                      source={product.images[0]?.url || '/images/placeholder-product.png'}
                      alt={product.title}
                    />
                  }
                  onClick={() => handleProductClick(product)}
                >
                  <h3>
                    <TextStyle variation="strong">{product.title}</TextStyle>
                  </h3>
                  <div>
                    {product.price.compareAtPrice ? (
                      <>
                        <TextStyle variation="strong">${product.price.amount.toFixed(2)}</TextStyle>
                        <TextStyle variation="subdued">
                          <s>${product.price.compareAtPrice.toFixed(2)}</s>
                        </TextStyle>
                      </>
                    ) : (
                      <TextStyle variation="strong">${product.price.amount.toFixed(2)}</TextStyle>
                    )}
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
  
  // Chat toggle button
  const renderToggleButton = () => (
    <div 
      className="chat-toggle-button" 
      onClick={() => setIsOpen(!isOpen)}
      style={{
        ...getPositionStyles(),
        position: 'fixed',
        zIndex: 1000,
        backgroundColor: primaryColor,
        color: 'white',
        borderRadius: '50%',
        width: '60px',
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
      }}
    >
      {!isOpen ? (
        <Avatar source={avatarUrl} />
      ) : (
        <Icon source={ChevronDownMinor} color="base" />
      )}
    </div>
  );
  
  // Product details modal
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
                src={selectedProduct.images[0]?.url || '/images/placeholder-product.png'} 
                alt={selectedProduct.title}
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
              />
            </Layout.Section>
            <Layout.Section oneHalf>
              <TextContainer>
                <p>{selectedProduct.description}</p>
                <p>
                  <TextStyle variation="strong">Price: </TextStyle>
                  {selectedProduct.price.compareAtPrice ? (
                    <>
                      ${selectedProduct.price.amount.toFixed(2)}
                      <TextStyle variation="subdued">
                        <s> ${selectedProduct.price.compareAtPrice.toFixed(2)}</s>
                      </TextStyle>
                    </>
                  ) : (
                    <>${selectedProduct.price.amount.toFixed(2)}</>
                  )}
                </p>
                {selectedProduct.attributes.eyewear.frameShape && (
                  <p>
                    <TextStyle variation="strong">Frame Shape: </TextStyle>
                    {selectedProduct.attributes.eyewear.frameShape}
                  </p>
                )}
                {selectedProduct.attributes.eyewear.frameMaterial && (
                  <p>
                    <TextStyle variation="strong">Material: </TextStyle>
                    {selectedProduct.attributes.eyewear.frameMaterial}
                  </p>
                )}
                {selectedProduct.attributes.eyewear.recommendedFaceShapes && selectedProduct.attributes.eyewear.recommendedFaceShapes.length > 0 && (
                  <p>
                    <TextStyle variation="strong">Recommended For: </TextStyle>
                    {selectedProduct.attributes.eyewear.recommendedFaceShapes.join(', ')}
                  </p>
                )}
              </TextContainer>
            </Layout.Section>
          </Layout>
        </Modal.Section>
      </Modal>
    );
  };
  
  // Main chat window when opened
  const renderChatWindow = () => {
    if (!isOpen) return null;
    
    return (
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
        {/* Chat header */}
        <div 
          className="chat-header"
          style={{
            backgroundColor: primaryColor,
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Stack alignment="center" spacing="tight">
            <Avatar source={assistantAvatarUrl} />
            <TextStyle variation="strong">{buttonLabel}</TextStyle>
          </Stack>
          <Button plain monochrome onClick={() => setIsOpen(false)}>
            <Icon source={ChevronDownMinor} />
          </Button>
        </div>
        
        {/* Messages container */}
        <div 
          className="messages-container"
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '15px',
            backgroundColor: secondaryColor
          }}
        >
          {messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.sender}`}
              style={{
                display: 'flex',
                marginBottom: '15px',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <Avatar 
                source={message.sender === 'user' ? userAvatarUrl : assistantAvatarUrl} 
                size="small"
              />
              <div 
                style={{
                  maxWidth: '70%',
                  padding: '10px 15px',
                  borderRadius: '18px',
                  backgroundColor: message.sender === 'user' ? primaryColor : 'white',
                  color: message.sender === 'user' ? 'white' : 'inherit',
                  marginLeft: message.sender === 'assistant' ? '10px' : 0,
                  marginRight: message.sender === 'user' ? '10px' : 0,
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <div 
          className="message-input"
          style={{
            padding: '10px 15px',
            borderTop: '1px solid #e6e6e6',
            backgroundColor: 'white'
          }}
        >
          <Stack>
            <Stack.Item fill>
              <TextField
                label=""
                value={currentMessage}
                onChange={(value) => setCurrentMessage(value)}
                placeholder="Type your message..."
                onKeyDown={handleKeyPress}
                multiline={1}
                maxHeight={100}
                autoComplete={false}
                disabled={isLoading}
              />
            </Stack.Item>
            <Button 
              primary 
              icon={SendMajor} 
              onClick={handleSendMessage}
              disabled={isLoading || !currentMessage.trim()}
            >
              {isLoading ? <Spinner size="small" /> : null}
            </Button>
          </Stack>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {renderToggleButton()}
      {renderChatWindow()}
      {renderProductModal()}
    </>
  );
}
