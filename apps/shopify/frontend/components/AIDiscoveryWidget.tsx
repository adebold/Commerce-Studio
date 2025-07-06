import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Card,
  TextField,
  Button,
  Stack,
  Badge
} from '@shopify/polaris';
import { StandardProduct } from '../../types/product-catalog';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import {
  ChatMessageData,
  ChatResponseData,
  FaceAnalysisResult,
  ConnectionStatus
} from '../types/socket';
import {
  validateAndSanitizeMessage,
  validateSessionId,
  globalRateLimiter
} from '../utils/inputValidation';

interface AIDiscoveryMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: number;
  type?: 'ai_discovery_welcome' | 'face_analysis_request' | 'product_recommendations' | 'virtual_try_on' | 'error_recovery';
  products?: StandardProduct[];
  suggestedQueries?: string[];
  actions?: Array<{
    type: string;
    label: string;
    productId?: string;
  }>;
  faceAnalysis?: FaceAnalysisResult;
}

interface AIDiscoveryWidgetProps {
  shopDomain: string;
  initialMessage?: string;
  autoOpen?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor?: string;
  secondaryColor?: string;
  enableFaceAnalysis?: boolean;
  enableVirtualTryOn?: boolean;
  maxRecommendations?: number;
}

export function AIDiscoveryWidget({
  shopDomain,
  initialMessage = "Hi! I'm your AI eyewear discovery assistant. I'll help you find the perfect frames by analyzing your face shape and understanding your style preferences. Shall we start with a quick face analysis?",
  autoOpen = false,
  position = 'bottom-right',
  primaryColor = '#5c6ac4',
  secondaryColor = '#f9fafb',
  enableFaceAnalysis = true,
  enableVirtualTryOn = true,
  maxRecommendations = 8
}: AIDiscoveryWidgetProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [messages, setMessages] = useState<AIDiscoveryMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StandardProduct | null>(null);
  const [faceAnalysisActive, setFaceAnalysisActive] = useState(false);
  const [faceAnalysisProgress, setFaceAnalysisProgress] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [faceAnalysisResult, setFaceAnalysisResult] = useState<FaceAnalysisResult | null>(null);
  const [conversationContext, setConversationContext] = useState<any[]>([]);
  
  // Socket.IO state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [useSocketIO, setUseSocketIO] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [messageQueue, setMessageQueue] = useState<ChatMessageData[]>([]);
  
  // Fix LS5_002: Performance optimization - Message batching and connection pooling
  const [messageBatch, setMessageBatch] = useState<ChatMessageData[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionPoolRef = useRef<Map<string, Socket>>(new Map());
  const maxBatchSize = 5;
  const batchTimeout = 100; // 100ms batching window
  
  // Fix LS4_001: Memory leak resolution - Use refs for timeout management
  const activeTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const socketTimeoutHandler = useRef<((data: any) => void) | null>(null);
  
  // Fix LS4_003: Race condition resolution - Use ref for immediate access
  const connectionAttemptsRef = useRef(0);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate session ID and initialize
  useEffect(() => {
    const generatedSessionId = `ai_discovery_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    setSessionId(generatedSessionId);
    
    // Add initial AI discovery welcome message
    if (initialMessage) {
      const welcomeMessage: AIDiscoveryMessage = {
        id: `assistant_${Date.now()}`,
        content: initialMessage,
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'ai_discovery_welcome',
        actions: enableFaceAnalysis ? [
          { type: 'start_face_analysis', label: 'Start Face Analysis' },
          { type: 'skip_analysis', label: 'Skip for Now' },
          { type: 'learn_more', label: 'How Does This Work?' }
        ] : [
          { type: 'browse_products', label: 'Browse Products' },
          { type: 'style_preferences', label: 'Tell Me Your Style' }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [initialMessage, enableFaceAnalysis]);

  // Socket.IO initialization and connection management
  useEffect(() => {
    if (!useSocketIO || !sessionId) return;

    const initializeSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socketUrl = `${protocol}//${window.location.host}`;
        
        const newSocket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000
        });

        // Connection event handlers
        newSocket.on('connect', () => {
          console.log('Socket.IO connected:', newSocket.id);
          setIsConnected(true);
          setConnectionStatus('connected');
          setConnectionAttempts(0);
          
          // Join session room
          newSocket.emit('join-session', sessionId);
          
          // Flush any queued messages
          flushMessageQueue();
          
          trackEvent('socket_connected', { sessionId, socketId: newSocket.id });
        });

        newSocket.on('disconnect', (reason: string) => {
          console.log('Socket.IO disconnected:', reason);
          setIsConnected(false);
          setConnectionStatus('disconnected');
          trackEvent('socket_disconnected', { sessionId, reason });
        });

        newSocket.on('connect_error', (error: any) => {
          console.error('Socket.IO connection error:', error);
          setConnectionStatus('error');
          
          // Fix LS4_003: Use ref for immediate access to prevent race condition
          connectionAttemptsRef.current += 1;
          setConnectionAttempts(connectionAttemptsRef.current);
          
          // Use ref value for immediate, atomic comparison
          if (connectionAttemptsRef.current >= 3) {
            console.log('Falling back to HTTP API after multiple connection failures');
            setUseSocketIO(false);
          }
          
          trackEvent('socket_connection_error', {
            sessionId,
            error: error?.message || 'Unknown connection error',
            attemptNumber: connectionAttemptsRef.current
          });
        });

        newSocket.on('reconnect_attempt', (attemptNumber: number) => {
          console.log('Socket.IO reconnection attempt:', attemptNumber);
          setConnectionStatus('reconnecting');
        });

        // Chat response handler
        newSocket.on('chat-response', handleChatResponse);

        // Error handler
        newSocket.on('error', (error: any) => {
          console.error('Socket.IO error:', error);
          trackEvent('socket_error', { sessionId, error: error.message });
        });

        setSocket(newSocket);

      } catch (error) {
        console.error('Socket initialization failed:', error);
        setUseSocketIO(false);
      }
    };

    // Initialize socket with delay to ensure session ID is set
    const initTimeout = setTimeout(initializeSocket, 100);

    return () => {
      clearTimeout(initTimeout);
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Fix LS5_002: Clean up batch timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      
      // Fix LS4_001: Clean up all active timeouts to prevent memory leaks
      activeTimeouts.current.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      activeTimeouts.current.clear();
      
      // Reset connection attempts ref
      connectionAttemptsRef.current = 0;
    };
  }, [sessionId, useSocketIO, connectionAttempts]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fix LS5_002: Enhanced message queue management with batching
  const flushMessageQueue = useCallback(() => {
    if (socket && isConnected && messageQueue.length > 0) {
      console.log(`Flushing ${messageQueue.length} queued messages`);
      messageQueue.forEach(message => {
        socket.emit('chat-message', message);
      });
      setMessageQueue([]);
    }
  }, [socket, isConnected, messageQueue]);

  const queueMessage = useCallback((messageData: ChatMessageData) => {
    console.log('Queueing message for later delivery:', messageData.message);
    setMessageQueue(prev => [...prev, messageData]);
  }, []);

  // Message batching for performance optimization
  const addToBatch = useCallback((messageData: ChatMessageData) => {
    setMessageBatch(prev => {
      const newBatch = [...prev, messageData];
      
      // Clear existing batch timeout
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      
      // If batch is full, send immediately
      if (newBatch.length >= maxBatchSize) {
        if (socket && isConnected) {
          console.log(`Sending batch of ${newBatch.length} messages`);
          socket.emit('chat-message-batch', newBatch);
        }
        return [];
      }
      
      // Set timeout to send batch
      batchTimeoutRef.current = setTimeout(() => {
        if (newBatch.length > 0 && socket && isConnected) {
          console.log(`Sending timed batch of ${newBatch.length} messages`);
          socket.emit('chat-message-batch', newBatch);
          setMessageBatch([]);
        }
      }, batchTimeout);
      
      return newBatch;
    });
  }, [socket, isConnected, maxBatchSize, batchTimeout]);

  const flushBatch = useCallback(() => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    setMessageBatch(prev => {
      if (prev.length > 0 && socket && isConnected) {
        console.log(`Force flushing batch of ${prev.length} messages`);
        socket.emit('chat-message-batch', prev);
      }
      return [];
    });
  }, [socket, isConnected]);

  // Socket.IO chat response handler
  const handleChatResponse = useCallback((data: ChatResponseData) => {
    console.log('Chat response received via Socket.IO:', data);
    setIsTyping(false);
    
    if (data.success && data.response) {
      const assistantMessage: AIDiscoveryMessage = {
        id: `assistant_${Date.now()}`,
        content: data.response,
        sender: 'assistant',
        timestamp: Date.now(),
        products: data.products,
        suggestedQueries: data.suggestedQueries,
        actions: data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationContext(prev => [...prev, { assistantMessage }]);

      // Track successful real-time response
      trackEvent('socket_chat_response_received', {
        sessionId,
        provider: data.provider,
        responseLength: data.response.length,
        timestamp: data.timestamp
      });

    } else if (data.error) {
      const errorMessage: AIDiscoveryMessage = {
        id: `assistant_error_${Date.now()}`,
        content: `I'm sorry, I encountered an error: ${data.error}. Let me try to help you in a different way.`,
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'error_recovery'
      };
      setMessages(prev => [...prev, errorMessage]);

      trackEvent('socket_chat_error', {
        sessionId,
        error: data.error,
        provider: data.provider
      });
    }
  }, [sessionId]);

  // Handle action button clicks
  const handleActionClick = useCallback(async (action: { type: string; label: string; productId?: string }) => {
    switch (action.type) {
      case 'start_face_analysis':
        await startFaceAnalysis();
        break;
      case 'skip_analysis':
        handleSkipAnalysis();
        break;
      case 'learn_more':
        handleLearnMore();
        break;
      case 'virtual_try_on':
        if (action.productId) {
          handleVirtualTryOn(action.productId);
        }
        break;
      case 'browse_products':
        handleBrowseProducts();
        break;
      case 'style_preferences':
        handleStylePreferences();
        break;
      default:
        console.log('Unknown action:', action.type);
    }
  }, []);

  // Start face analysis
  const startFaceAnalysis = useCallback(async () => {
    if (!enableFaceAnalysis) return;

    try {
      setFaceAnalysisActive(true);
      setFaceAnalysisProgress(0);

      // Add analysis starting message
      const analysisMessage: AIDiscoveryMessage = {
        id: `assistant_${Date.now()}`,
        content: "Great! Let's analyze your face shape to find the perfect frames. Please look directly at the camera and make sure your face is well-lit.",
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'face_analysis_request'
      };
      setMessages(prev => [...prev, analysisMessage]);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = resolve;
          }
        });
      }

      // Simulate face analysis progress
      const progressInterval = setInterval(() => {
        setFaceAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            completeFaceAnalysis();
            return 100;
          }
          return prev + 10;
        });
      }, 300);

    } catch (error) {
      console.error('Face analysis error:', error);
      handleFaceAnalysisError(error as Error);
    }
  }, [enableFaceAnalysis]);

  // Complete face analysis
  const completeFaceAnalysis = useCallback(async () => {
    try {
      // Simulate face analysis results
      const mockResult: FaceAnalysisResult = {
        faceShape: 'oval', // This would come from actual analysis
        confidence: 0.92,
        measurements: {
          faceWidth: 140,
          faceHeight: 180,
          jawWidth: 120,
          foreheadWidth: 135,
          pupillaryDistance: 62
        },
        timestamp: Date.now()
      };

      setFaceAnalysisResult(mockResult);
      setFaceAnalysisActive(false);
      
      // Stop camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }

      // Add analysis results message
      const resultsMessage: AIDiscoveryMessage = {
        id: `assistant_${Date.now()}`,
        content: `Perfect! I've analyzed your face shape and determined you have an ${mockResult.faceShape} face shape with ${Math.round(mockResult.confidence * 100)}% confidence. This means certain frame styles will look particularly great on you. Let me find the perfect recommendations!`,
        sender: 'assistant',
        timestamp: Date.now(),
        faceAnalysis: mockResult
      };
      setMessages(prev => [...prev, resultsMessage]);

      // Generate recommendations based on face analysis
      await generateAIRecommendations(mockResult);

    } catch (error) {
      console.error('Error completing face analysis:', error);
      handleFaceAnalysisError(error as Error);
    }
  }, [cameraStream]);

  // Generate AI-powered recommendations
  const generateAIRecommendations = useCallback(async (faceAnalysis?: FaceAnalysisResult) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/ai-discovery/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          shopDomain,
          faceAnalysis,
          conversationContext,
          maxRecommendations
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();

      const recommendationMessage: AIDiscoveryMessage = {
        id: `assistant_${Date.now()}`,
        content: data.message || `Based on your ${faceAnalysis?.faceShape || 'unique'} face shape, I've curated ${data.products?.length || 0} perfect frame recommendations for you. Each of these has been specifically chosen to complement your features.`,
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'product_recommendations',
        products: data.products?.slice(0, maxRecommendations) || [],
        suggestedQueries: [
          'Tell me more about the first recommendation',
          'Show me different styles',
          'Can I try these on virtually?',
          'What about different colors?'
        ]
      };

      setMessages(prev => [...prev, recommendationMessage]);

      // Track recommendations generated
      trackEvent('ai_recommendations_generated', {
        sessionId,
        faceShape: faceAnalysis?.faceShape,
        recommendationCount: data.products?.length || 0
      });

    } catch (error) {
      console.error('Error generating recommendations:', error);
      handleRecommendationError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, shopDomain, conversationContext, maxRecommendations]);

  // Handle message submission
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim()) return;

    // Fix LS4_002: Input validation and security
    const validationResult = validateAndSanitizeMessage(currentMessage);
    
    if (!validationResult.isValid) {
      console.warn('Message validation failed:', validationResult.errors);
      const errorMessage: AIDiscoveryMessage = {
        id: `assistant_error_${Date.now()}`,
        content: `Please check your message: ${validationResult.errors.join(', ')}`,
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'error_recovery'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Check session ID validation
    if (!validateSessionId(sessionId)) {
      console.warn('Invalid session ID format');
      const errorMessage: AIDiscoveryMessage = {
        id: `assistant_error_${Date.now()}`,
        content: "Session error. Please refresh the page and try again.",
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'error_recovery'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Check rate limiting
    if (globalRateLimiter.isRateLimited(sessionId)) {
      console.warn('Rate limit exceeded for session:', sessionId);
      const errorMessage: AIDiscoveryMessage = {
        id: `assistant_error_${Date.now()}`,
        content: "You're sending messages too quickly. Please wait a moment before trying again.",
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'error_recovery'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Record message for rate limiting
    globalRateLimiter.recordMessage(sessionId);

    const messageContent = validationResult.sanitizedValue;
    const userMessage: AIDiscoveryMessage = {
      id: `user_${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Try Socket.IO first if connected
      if (socket && isConnected && useSocketIO) {
        console.log('Sending message via Socket.IO');
        
        const messageData: ChatMessageData = {
          message: messageContent,
          sessionId,
          shopDomain,
          conversationContext,
          faceAnalysisResult: faceAnalysisResult || undefined,
          timestamp: new Date().toISOString()
        };
        
        socket.emit('chat-message', messageData);

        // Track Socket.IO message sent
        trackEvent('socket_message_sent', {
          sessionId,
          messageLength: messageContent.length,
          hasContext: conversationContext.length > 0,
          hasFaceAnalysis: !!faceAnalysisResult
        });

        // Fix LS5_001: Enhanced Map-based timeout tracking with proper cleanup
        const timeoutId = `timeout_${sessionId}_${Date.now()}`;
        
        // Clear any existing timeout for this session to prevent accumulation
        const existingTimeouts = Array.from(activeTimeouts.current.keys())
          .filter(id => id.startsWith(`timeout_${sessionId}_`));
        existingTimeouts.forEach(id => {
          clearTimeout(activeTimeouts.current.get(id));
          activeTimeouts.current.delete(id);
        });
        
        const socketTimeout = setTimeout(() => {
          console.log('Socket.IO response timeout, falling back to HTTP');
          setIsTyping(false);
          activeTimeouts.current.delete(timeoutId);
          handleHttpFallback(messageContent, userMessage);
        }, 10000);
        
        // Store timeout in Map for proper cleanup
        activeTimeouts.current.set(timeoutId, socketTimeout);
        
        // Enhanced timeout handler with proper cleanup
        const enhancedHandler = (data: any) => {
          // Clear and remove timeout when response received
          if (activeTimeouts.current.has(timeoutId)) {
            clearTimeout(activeTimeouts.current.get(timeoutId));
            activeTimeouts.current.delete(timeoutId);
          }
          handleChatResponse(data);
        };
        
        // Remove previous handler to prevent memory leaks
        if (socketTimeoutHandler.current) {
          socket.off('chat-response', socketTimeoutHandler.current);
        }
        
        // Set new handler and store reference
        socketTimeoutHandler.current = enhancedHandler;
        socket.on('chat-response', enhancedHandler);

      } else {
        // Use HTTP API as fallback
        await handleHttpFallback(messageContent, userMessage);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      await handleHttpFallback(messageContent, userMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentMessage, sessionId, shopDomain, conversationContext, faceAnalysisResult, socket, isConnected, useSocketIO, handleChatResponse]);

  // HTTP fallback function
  const handleHttpFallback = useCallback(async (messageContent: string, userMessage: AIDiscoveryMessage) => {
    try {
      console.log('Using HTTP API fallback');
      
      const response = await fetch('/api/ai-discovery/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageContent,
          sessionId,
          shopDomain,
          conversationContext,
          faceAnalysisResult
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: AIDiscoveryMessage = {
        id: `assistant_${Date.now()}`,
        content: data.response,
        sender: 'assistant',
        timestamp: Date.now(),
        products: data.products,
        suggestedQueries: data.suggestedQueries,
        actions: data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationContext(prev => [...prev, { userMessage, assistantMessage }]);

      // Track HTTP fallback usage
      trackEvent('http_fallback_used', {
        sessionId,
        reason: !socket ? 'no_socket' : !isConnected ? 'not_connected' : 'socket_disabled',
        responseLength: data.response?.length || 0
      });

    } catch (error) {
      console.error('HTTP fallback error:', error);
      const errorMessage: AIDiscoveryMessage = {
        id: `assistant_error_${Date.now()}`,
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'assistant',
        timestamp: Date.now(),
        type: 'error_recovery'
      };
      setMessages(prev => [...prev, errorMessage]);

      trackEvent('message_send_failed', {
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [sessionId, shopDomain, conversationContext, faceAnalysisResult, socket, isConnected]);

  // Handle various actions
  const handleSkipAnalysis = useCallback(() => {
    const skipMessage: AIDiscoveryMessage = {
      id: `assistant_${Date.now()}`,
      content: "No problem! I can still help you find great frames. Tell me about your style preferences or what kind of look you're going for.",
      sender: 'assistant',
      timestamp: Date.now(),
      suggestedQueries: [
        'I like classic styles',
        'I want something trendy',
        'I need professional-looking frames',
        'Show me colorful options'
      ]
    };
    setMessages(prev => [...prev, skipMessage]);
  }, []);

  const handleLearnMore = useCallback(() => {
    const learnMessage: AIDiscoveryMessage = {
      id: `assistant_${Date.now()}`,
      content: "I use advanced face analysis to determine your face shape and measurements, then match you with frames that will look best on you. The analysis is done privately in your browser - no images are stored. This helps me recommend frames that complement your unique features perfectly!",
      sender: 'assistant',
      timestamp: Date.now(),
      actions: [
        { type: 'start_face_analysis', label: 'Try Face Analysis' },
        { type: 'skip_analysis', label: 'Continue Without Analysis' }
      ]
    };
    setMessages(prev => [...prev, learnMessage]);
  }, []);

  const handleVirtualTryOn = useCallback((productId: string) => {
    // This would integrate with the VTO system
    console.log('Starting virtual try-on for product:', productId);
    trackEvent('virtual_try_on_started', { sessionId, productId });
  }, [sessionId]);

  const handleBrowseProducts = useCallback(async () => {
    await generateAIRecommendations();
  }, [generateAIRecommendations]);

  const handleStylePreferences = useCallback(() => {
    const styleMessage: AIDiscoveryMessage = {
      id: `assistant_${Date.now()}`,
      content: "Great! Tell me about your style. Are you looking for something classic and timeless, modern and trendy, or perhaps bold and statement-making?",
      sender: 'assistant',
      timestamp: Date.now(),
      suggestedQueries: [
        'Classic and professional',
        'Modern and trendy',
        'Bold and unique',
        'Minimalist and subtle'
      ]
    };
    setMessages(prev => [...prev, styleMessage]);
  }, []);

  // Error handlers
  const handleFaceAnalysisError = useCallback((error: Error) => {
    setFaceAnalysisActive(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }

    const errorMessage: AIDiscoveryMessage = {
      id: `assistant_error_${Date.now()}`,
      content: "I'm having trouble with the face analysis. This could be due to camera permissions or lighting. Would you like to try again or continue without face analysis?",
      sender: 'assistant',
      timestamp: Date.now(),
      type: 'error_recovery',
      actions: [
        { type: 'start_face_analysis', label: 'Try Again' },
        { type: 'skip_analysis', label: 'Continue Without Analysis' }
      ]
    };
    setMessages(prev => [...prev, errorMessage]);
    trackEvent('face_analysis_error', { sessionId, error: error.message });
  }, [cameraStream, sessionId]);

  const handleRecommendationError = useCallback((error: Error) => {
    const errorMessage: AIDiscoveryMessage = {
      id: `assistant_error_${Date.now()}`,
      content: "I'm having trouble generating recommendations right now. Let me try a different approach - what specific type of frames are you interested in?",
      sender: 'assistant',
      timestamp: Date.now(),
      type: 'error_recovery',
      suggestedQueries: [
        'Show me sunglasses',
        'I need reading glasses',
        'Looking for designer frames',
        'Show me popular styles'
      ]
    };
    setMessages(prev => [...prev, errorMessage]);
    trackEvent('recommendation_error', { sessionId, error: error.message });
  }, [sessionId]);

  // Utility functions
  const trackEvent = useCallback((eventName: string, data: any) => {
    // This would integrate with analytics
    console.log('Track event:', eventName, data);
  }, []);

  const handleKeyDown = useCallback((event: any) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleSuggestedQueryClick = useCallback((query: string) => {
    setCurrentMessage(query);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  }, [handleSendMessage]);

  const handleProductClick = useCallback((product: StandardProduct) => {
    setSelectedProduct(product);
    trackEvent('product_clicked', { sessionId, productId: product.id });
  }, [sessionId]);

  // Get position styles
  const getPositionStyles = useCallback(() => {
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
  }, [position]);

  // Render message content
  const renderMessageContent = useCallback((message: AIDiscoveryMessage) => {
    return (
      <div className="ai-discovery-message-container">
        <p style={{ margin: '0 0 10px 0' }}>{message.content}</p>

        {/* Face analysis progress */}
        {message.type === 'face_analysis_request' && faceAnalysisActive && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e1e3e5', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${faceAnalysisProgress}%`,
                height: '100%',
                backgroundColor: primaryColor,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6d7175' }}>
              Analyzing your face shape... {faceAnalysisProgress}%
            </p>
          </div>
        )}

        {/* Action buttons */}
        {message.actions && message.actions.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <Stack spacing="tight">
              {message.actions.map((action, index) => (
                <Button
                  key={`action_${index}`}
                  onClick={() => handleActionClick(action)}
                  primary={index === 0}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </div>
        )}

        {/* Product recommendations */}
        {message.products && message.products.length > 0 && (
          <div className="ai-discovery-recommendations" style={{ marginTop: '15px' }}>
            {message.products.map((product) => (
              <div
                key={product.id}
                style={{
                  border: '1px solid #e1e3e5',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onClick={() => handleProductClick(product)}
              >
                <img 
                  src={product.images[0]?.url || '/images/placeholder-product.png'} 
                  alt={product.title}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold' }}>{product.title}</h3>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}>
                    {product.price.compareAtPrice ? (
                      <>
                        <strong>${product.price.amount.toFixed(2)}</strong>
                        <span style={{ textDecoration: 'line-through', marginLeft: '8px', color: '#6d7175' }}>
                          ${product.price.compareAtPrice.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <strong>${product.price.amount.toFixed(2)}</strong>
                    )}
                  </p>
                  {product.attributes.eyewear.recommendedFaceShapes && (
                    <p style={{ margin: '0', fontSize: '12px', color: '#6d7175' }}>
                      Perfect for: {product.attributes.eyewear.recommendedFaceShapes.join(', ')}
                    </p>
                  )}
                </div>
                {enableVirtualTryOn && (
                  <Button
                    onClick={() => {
                      handleActionClick({
                        type: 'virtual_try_on',
                        label: 'Try On',
                        productId: product.id
                      });
                    }}
                  >
                    Try On
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Suggested queries */}
        {message.suggestedQueries && message.suggestedQueries.length > 0 && (
          <div className="ai-discovery-suggestions" style={{ marginTop: '10px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6d7175' }}>You might ask:</p>
            <Stack spacing="tight">
              {message.suggestedQueries.map((query, index) => (
                <Button
                  key={`query_${index}`}
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
  }, [faceAnalysisActive, faceAnalysisProgress, enableVirtualTryOn, handleActionClick, handleProductClick, handleSuggestedQueryClick, primaryColor]);

  // Chat toggle button
  const renderToggleButton = () => (
    <button 
      className="ai-discovery-toggle-button" 
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
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        border: 'none',
        fontSize: '24px'
      }}
    >
      {!isOpen ? '🤖' : '✕'}
    </button>
  );

  // Main chat window
  const renderChatWindow = () => {
    if (!isOpen) return null;

    return (
      <div 
        className="ai-discovery-chat-window"
        style={{
          ...getPositionStyles(),
          position: 'fixed',
          zIndex: 1000,
          width: '380px',
          maxWidth: 'calc(100vw - 40px)', 
          height: '600px',
          maxHeight: 'calc(100vh - 80px)',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Chat header */}
        <div
          className="ai-discovery-header"
          style={{
            backgroundColor: primaryColor,
            color: 'white',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 'bold' }}>AI Discovery Assistant</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', opacity: 0.9 }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? '#4ade80' : '#ef4444'
                }} />
                <span>
                  {isConnected ? 'Real-time' : useSocketIO ? 'Connecting...' : 'Standard'}
                </span>
                {isTyping && (
                  <>
                    <span style={{ margin: '0 4px' }}>•</span>
                    <span data-testid="typing-indicator">AI is typing...</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages container */}
        <div 
          className="ai-discovery-messages"
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: secondaryColor
          }}
        >
          {messages.map(message => (
            <div
              key={message.id}
              className={`ai-discovery-message ${message.sender}`}
              style={{
                display: 'flex',
                marginBottom: '16px',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
              }}
            >
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: message.sender === 'user' ? '#007ace' : '#5c6ac4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}>
                {message.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div 
                style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  backgroundColor: message.sender === 'user' ? primaryColor : 'white',
                  color: message.sender === 'user' ? 'white' : 'inherit',
                  marginLeft: message.sender === 'assistant' ? '10px' : 0,
                  marginRight: message.sender === 'user' ? '10px' : 0,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                {renderMessageContent(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Face analysis modal overlay */}
        {faceAnalysisActive && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '90%',
              maxHeight: '90%'
            }}>
              <h3 style={{ margin: '0 0 16px 0' }}>Face Analysis</h3>
              <p style={{ margin: '0 0 16px 0' }}>Please look directly at the camera and make sure your face is well-lit.</p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                backgroundColor: '#f4f6f8',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '16px'
              }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '320px',
                    height: '240px',
                    borderRadius: '8px'
                  }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                  width={320}
                  height={240}
                />
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#e1e3e5', 
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  width: `${faceAnalysisProgress}%`,
                  height: '100%',
                  backgroundColor: primaryColor,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#6d7175', textAlign: 'center' }}>
                Analyzing your face shape... {faceAnalysisProgress}%
              </p>
              <Button
                onClick={() => {
                  setFaceAnalysisActive(false);
                  if (cameraStream) {
                    cameraStream.getTracks().forEach(track => track.stop());
                    setCameraStream(null);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Message input */}
        <div
          className="ai-discovery-input"
          style={{
            padding: '16px',
            borderTop: '1px solid #e1e3e5',
            backgroundColor: 'white'
          }}
        >
          <Stack>
            <TextField
              label=""
              value={currentMessage}
              onChange={(value) => setCurrentMessage(value)}
              data-testid="message-input"
            />
            <Button
              primary
              onClick={handleSendMessage}
              data-testid="send-button"
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Sending</span>
                  {isConnected ? (
                    <span style={{ fontSize: '10px' }}>⚡</span>
                  ) : (
                    <span style={{ fontSize: '10px' }}>📡</span>
                  )}
                </span>
              ) : isTyping ? (
                'AI is typing...'
              ) : (
                'Send'
              )}
            </Button>
          </Stack>
          {/* Connection status footer */}
          <div style={{
            marginTop: '8px',
            fontSize: '10px',
            color: '#6d7175',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#4ade80' : '#ef4444'
            }} />
            <span>
              {isConnected ? 'Real-time connection active' :
               useSocketIO ? 'Connecting to real-time...' :
               'Using standard connection'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div data-testid="ai-discovery-widget">
      {renderToggleButton()}
      {isOpen && renderChatWindow()}
      
      {/* Connection Status Indicator */}
      <div data-testid="connection-status" style={{ display: 'none' }}>
        {isConnected ? 'Connected' : connectionStatus === 'reconnecting' ? 'Reconnecting' : 'Disconnected'}
      </div>
      
      {/* Force HTTP Mode Button (for testing) */}
      <button
        data-testid="force-http-mode"
        style={{ display: 'none' }}
        onClick={() => setUseSocketIO(false)}
      >
        Force HTTP Mode
      </button>
    </div>
  );
}