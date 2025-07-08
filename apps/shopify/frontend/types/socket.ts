/**
 * @fileoverview Socket.IO TypeScript definitions for Shopify AI Discovery Widget
 * @module types/socket
 */

// Fix LS5_003: Generic Socket type definition for cross-platform compatibility
export interface Socket {
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler?: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  disconnect(): void;
  connected: boolean;
  id: string;
}

// Fix LS5_003: Consolidated Socket.IO Event Types
export interface SocketEvents {
  // Client to Server Events
  'chat-message': (data: ChatMessageData) => void;
  'chat-message-batch': (data: ChatMessageData[]) => void; // LS5_002: Batch support
  'join-session': (sessionId: string) => void;
  'face-analysis': (data: FaceAnalysisData) => void;
  'typing-start': () => void;
  'typing-stop': () => void;

  // Server to Client Events
  'chat-response': (data: ChatResponseData) => void;
  'chat-response-batch': (data: ChatResponseData[]) => void; // LS5_002: Batch support
  'typing-end': () => void;
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'connect_error': (error: Error) => void;
  'error': (error: any) => void;
  'reconnect': (attemptNumber: number) => void;
  'reconnect_attempt': (attemptNumber: number) => void;
  'reconnect_error': (error: Error) => void;
  'reconnect_failed': () => void;
}

// Chat Message Data Structure
export interface ChatMessageData {
  message: string;
  sessionId: string;
  shopDomain?: string;
  conversationContext?: any[];
  faceAnalysisResult?: FaceAnalysisResult;
  timestamp: string;
  metadata?: {
    userAgent?: string;
    platform?: string;
    version?: string;
  };
}

// Chat Response Data Structure
export interface ChatResponseData {
  success: boolean;
  response?: string;
  error?: string;
  sessionId: string;
  provider: string;
  timestamp: string;
  products?: any[];
  suggestedQueries?: string[];
  actions?: Array<{
    type: string;
    label: string;
    productId?: string;
  }>;
  metadata?: {
    processingTime?: number;
    confidence?: number;
    model?: string;
  };
}

// Face Analysis Data Structure
export interface FaceAnalysisData {
  landmarks?: any[];
  measurements?: FaceAnalysisResult;
  sessionId: string;
  timestamp: string;
}

// Fix LS5_003: Consolidated Face Analysis Result Structure
export interface FaceAnalysisResult {
  faceShape: string;
  confidence: number;
  measurements: {
    faceWidth: number;
    faceHeight: number;
    jawWidth: number;
    foreheadWidth: number;
    pupillaryDistance: number;
  };
  timestamp: number;
  // Enhanced fields for better analysis
  analysisId?: string;
  processingTime?: number;
  qualityScore?: number;
  landmarks?: Array<{
    x: number;
    y: number;
    confidence: number;
  }>;
}

// Socket Connection Configuration
export interface SocketConfig {
  url?: string;
  options?: {
    transports?: string[];
    timeout?: number;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    forceNew?: boolean;
    autoConnect?: boolean;
  };
}

// Connection Status Types
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

// Socket Connection Manager Interface
export interface SocketConnectionManager {
  socket: Socket | null;
  status: ConnectionStatus;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  messageQueue: ChatMessageData[];
  
  connect(): Promise<void>;
  disconnect(): void;
  sendMessage(data: ChatMessageData): void;
  queueMessage(data: ChatMessageData): void;
  flushMessageQueue(): void;
  handleReconnection(): void;
  updateStatus(status: ConnectionStatus): void;
}

// Error Types
export interface SocketError {
  type: 'connection' | 'timeout' | 'server' | 'client';
  message: string;
  code?: string;
  timestamp: string;
  sessionId?: string;
}

// Event Handler Types
export type ChatResponseHandler = (data: ChatResponseData) => void;
export type ConnectionHandler = () => void;
export type DisconnectionHandler = (reason: string) => void;
export type ErrorHandler = (error: SocketError) => void;
export type TypingHandler = () => void;

// Socket Hook Return Type
export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  sendMessage: (message: string) => void;
  sendFaceAnalysis: (data: FaceAnalysisData) => void;
  disconnect: () => void;
  reconnect: () => void;
  error: SocketError | null;
}

// Socket Provider Context Type
export interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  connectionManager: SocketConnectionManager | null;
  sendMessage: (data: ChatMessageData) => void;
  sendFaceAnalysis: (data: FaceAnalysisData) => void;
  onChatResponse: (handler: ChatResponseHandler) => void;
  onConnect: (handler: ConnectionHandler) => void;
  onDisconnect: (handler: DisconnectionHandler) => void;
  onError: (handler: ErrorHandler) => void;
}

// Socket Configuration for Different Environments
export interface EnvironmentSocketConfig {
  development: SocketConfig;
  staging: SocketConfig;
  production: SocketConfig;
}

// Socket Metrics for Monitoring
export interface SocketMetrics {
  connectionTime: number;
  messagesSent: number;
  messagesReceived: number;
  reconnectionAttempts: number;
  errors: SocketError[];
  latency: number;
  uptime: number;
}

// Export default Socket type with our events
export type TypedSocket = Socket & {
  emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>): void;
  on<K extends keyof SocketEvents>(event: K, handler: SocketEvents[K]): void;
  off<K extends keyof SocketEvents>(event: K, handler?: SocketEvents[K]): void;
};