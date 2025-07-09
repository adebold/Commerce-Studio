# Commerce Studio - Merge Execution Guide
## Step-by-Step Implementation Instructions

### Overview
This guide provides detailed, executable instructions for implementing the comprehensive merge plan. Each step includes specific commands, file modifications, and validation procedures.

---

## 🚀 Phase 1: Critical Fixes Stabilization (Days 1-2)

### Step 1.1: Memory Leak Resolution

#### Target File: `apps/shopify/frontend/components/AIDiscoveryWidget.tsx`
**Lines to Replace**: 519-533

#### Current Problematic Code Pattern:
```typescript
// REMOVE THIS PATTERN (Lines 519-533)
const timeoutHandler = (data: any) => {
  clearTimeout(socketTimeout);
  originalHandler(data);
};

socket.off('chat-response', handleChatResponse);
socket.on('chat-response', timeoutHandler);

setTimeout(() => {
  socket.off('chat-response', timeoutHandler);
  socket.on('chat-response', handleChatResponse);
}, 10000);
```

#### Required Implementation:
```typescript
// ADD THIS IMPLEMENTATION (Replace lines 519-533)
const activeTimeouts = useRef(new Map<string, NodeJS.Timeout>());
const connectionAttemptsRef = useRef(0);

const generateSessionId = useCallback(() => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}, []);

const handleChatResponseWithTimeout = useCallback((data: any) => {
  const sessionId = data.sessionId || 'default';
  
  // Clear existing timeout for this session
  if (activeTimeouts.current.has(sessionId)) {
    clearTimeout(activeTimeouts.current.get(sessionId));
    activeTimeouts.current.delete(sessionId);
  }
  
  // Process the response
  handleChatResponse(data);
}, [handleChatResponse]);

const sendMessageWithTimeout = useCallback((messageContent: string, userMessage: string) => {
  const sessionId = generateSessionId();
  
  // Set timeout with proper cleanup
  const timeoutId = setTimeout(() => {
    console.log('Socket.IO response timeout, falling back to HTTP');
    setIsTyping(false);
    handleHttpFallback(messageContent, userMessage);
    activeTimeouts.current.delete(sessionId);
  }, 10000);
  
  activeTimeouts.current.set(sessionId, timeoutId);
  
  // Send message via Socket.IO
  if (socket && socket.connected) {
    socket.emit('chat-message', {
      message: messageContent,
      sessionId: sessionId,
      timestamp: Date.now()
    });
  } else {
    // Immediate fallback if socket not connected
    clearTimeout(timeoutId);
    activeTimeouts.current.delete(sessionId);
    handleHttpFallback(messageContent, userMessage);
  }
}, [generateSessionId, handleHttpFallback, socket]);

// Cleanup on unmount
useEffect(() => {
  return () => {
    // Clear all active timeouts
    activeTimeouts.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    activeTimeouts.current.clear();
  };
}, []);

// Update socket event handler registration
useEffect(() => {
  if (socket) {
    socket.on('chat-response', handleChatResponseWithTimeout);
    
    return () => {
      socket.off('chat-response', handleChatResponseWithTimeout);
    };
  }
}, [socket, handleChatResponseWithTimeout]);
```

#### Validation Commands:
```bash
# Run memory leak tests
npm run test:critical-fixes -- --testNamePattern="memory-leak"

# Expected output:
# ✅ should pass: single timeout handler with proper cleanup
# ✅ should pass: timeout tracking with Map-based cleanup
# ✅ should pass: component unmount clears all timeouts
```

### Step 1.2: Interface Consolidation

#### Files to Audit:
- `apps/shopify/frontend/types/socket.ts`
- `apps/shopify/frontend/services/FaceAnalysisService.ts`
- `apps/shopify/frontend/components/AIDiscoveryWidget.tsx`

#### Create Unified Types File: `apps/shopify/frontend/types/unified.ts`
```typescript
// Consolidated interface definitions
export interface FaceAnalysisResult {
  faceShape: string;
  skinTone: string;
  eyeColor: string;
  confidence: number;
  recommendations: ProductRecommendation[];
  timestamp: number;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  matchScore: number;
  features: string[];
}

export interface SocketMessage {
  sessionId: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'analysis' | 'recommendation';
}

export interface SocketResponse {
  sessionId: string;
  response: string;
  data?: any;
  timestamp: number;
  status: 'success' | 'error' | 'timeout';
}
```

#### Update Import Statements:
Replace all duplicate interface imports with:
```typescript
import { 
  FaceAnalysisResult, 
  ProductRecommendation, 
  SocketMessage, 
  SocketResponse 
} from '../types/unified';
```

### Step 1.3: Performance Optimization

#### Add Connection Pooling: `apps/shopify/frontend/utils/socketPool.ts`
```typescript
class SocketPool {
  private static instance: SocketPool;
  private connections: Map<string, any> = new Map();
  private maxConnections = 5;

  static getInstance(): SocketPool {
    if (!SocketPool.instance) {
      SocketPool.instance = new SocketPool();
    }
    return SocketPool.instance;
  }

  getConnection(endpoint: string): any {
    if (this.connections.has(endpoint)) {
      return this.connections.get(endpoint);
    }

    if (this.connections.size >= this.maxConnections) {
      // Remove oldest connection
      const firstKey = this.connections.keys().next().value;
      const oldConnection = this.connections.get(firstKey);
      oldConnection?.disconnect();
      this.connections.delete(firstKey);
    }

    // Create new connection
    const socket = io(endpoint, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3
    });

    this.connections.set(endpoint, socket);
    return socket;
  }

  cleanup(): void {
    this.connections.forEach((socket) => {
      socket.disconnect();
    });
    this.connections.clear();
  }
}

export default SocketPool;
```

---

## 🔄 Phase 2: Cross-Platform Propagation (Days 3-5)

### Step 2.1: WooCommerce Integration

#### Update: `apps/woocommerce/api/chat.js`
```javascript
// Add Socket.IO server integration
import { Server } from 'socket.io';
import { createServer } from 'http';

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  path: '/woocommerce/socket.io'
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('WooCommerce client connected:', socket.id);

  socket.on('chat-message', async (data) => {
    try {
      const { message, sessionId, timestamp } = data;
      
      // Process message through unified service
      const response = await processUnifiedChatMessage(message, {
        platform: 'woocommerce',
        sessionId,
        timestamp
      });

      // Send response back to client
      socket.emit('chat-response', {
        sessionId,
        response: response.message,
        data: response.data,
        timestamp: Date.now(),
        status: 'success'
      });

    } catch (error) {
      console.error('WooCommerce chat error:', error);
      socket.emit('chat-response', {
        sessionId: data.sessionId,
        response: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
        status: 'error'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('WooCommerce client disconnected:', socket.id);
  });
});
```

#### Create WooCommerce Widget: `apps/woocommerce/assets/js/socket-widget.js`
```javascript
// WooCommerce-specific Socket.IO widget
class WooCommerceSocketWidget {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/woocommerce/socket.io';
    this.socket = null;
    this.activeTimeouts = new Map();
    this.init();
  }

  init() {
    this.socket = io(this.endpoint, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 3
    });

    this.socket.on('connect', () => {
      console.log('WooCommerce Socket.IO connected');
    });

    this.socket.on('chat-response', (data) => {
      this.handleResponse(data);
    });

    this.socket.on('disconnect', () => {
      console.log('WooCommerce Socket.IO disconnected');
    });
  }

  sendMessage(message, userMessage) {
    const sessionId = this.generateSessionId();
    
    // Set timeout with proper cleanup
    const timeoutId = setTimeout(() => {
      console.log('WooCommerce Socket.IO timeout, falling back to HTTP');
      this.handleHttpFallback(message, userMessage);
      this.activeTimeouts.delete(sessionId);
    }, 10000);
    
    this.activeTimeouts.set(sessionId, timeoutId);
    
    if (this.socket && this.socket.connected) {
      this.socket.emit('chat-message', {
        message,
        sessionId,
        timestamp: Date.now()
      });
    } else {
      clearTimeout(timeoutId);
      this.activeTimeouts.delete(sessionId);
      this.handleHttpFallback(message, userMessage);
    }
  }

  handleResponse(data) {
    if (this.activeTimeouts.has(data.sessionId)) {
      clearTimeout(this.activeTimeouts.get(data.sessionId));
      this.activeTimeouts.delete(data.sessionId);
    }
    
    // Process response for WooCommerce
    this.displayResponse(data.response);
  }

  generateSessionId() {
    return `woo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  cleanup() {
    this.activeTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.activeTimeouts.clear();
    
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Initialize widget
window.WooCommerceSocketWidget = WooCommerceSocketWidget;
```

### Step 2.2: Magento Integration

#### Update: `apps/magento/api/chat.js`
```javascript
// Magento-specific Socket.IO implementation
// Similar structure to WooCommerce but adapted for Magento's RequireJS system

define([
    'jquery',
    'socket.io'
], function ($, io) {
    'use strict';

    return function (config) {
        const socket = io(config.endpoint || '/magento/socket.io', {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 3
        });

        const activeTimeouts = new Map();

        socket.on('connect', function () {
            console.log('Magento Socket.IO connected');
        });

        socket.on('chat-response', function (data) {
            if (activeTimeouts.has(data.sessionId)) {
                clearTimeout(activeTimeouts.get(data.sessionId));
                activeTimeouts.delete(data.sessionId);
            }
            
            // Process response for Magento
            $(config.responseContainer).html(data.response);
        });

        return {
            sendMessage: function (message, userMessage) {
                const sessionId = 'magento_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                const timeoutId = setTimeout(function () {
                    console.log('Magento Socket.IO timeout, falling back to HTTP');
                    // HTTP fallback implementation
                    activeTimeouts.delete(sessionId);
                }, 10000);
                
                activeTimeouts.set(sessionId, timeoutId);
                
                if (socket && socket.connected) {
                    socket.emit('chat-message', {
                        message: message,
                        sessionId: sessionId,
                        timestamp: Date.now()
                    });
                } else {
                    clearTimeout(timeoutId);
                    activeTimeouts.delete(sessionId);
                    // HTTP fallback
                }
            },

            cleanup: function () {
                activeTimeouts.forEach(function (timeoutId) {
                    clearTimeout(timeoutId);
                });
                activeTimeouts.clear();
                
                if (socket) {
                    socket.disconnect();
                }
            }
        };
    };
});
```

### Step 2.3: HTML Store Integration

#### Create: `apps/html-store/js/socket-widget.js`
```javascript
// Vanilla JavaScript Socket.IO widget for HTML stores
(function(window) {
    'use strict';

    function HTMLStoreSocketWidget(options) {
        this.endpoint = options.endpoint || '/html-store/socket.io';
        this.socket = null;
        this.activeTimeouts = new Map();
        this.responseContainer = options.responseContainer || '#chat-response';
        this.init();
    }

    HTMLStoreSocketWidget.prototype.init = function() {
        // Load Socket.IO if not already loaded
        if (typeof io === 'undefined') {
            this.loadSocketIO(() => {
                this.initSocket();
            });
        } else {
            this.initSocket();
        }
    };

    HTMLStoreSocketWidget.prototype.loadSocketIO = function(callback) {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    };

    HTMLStoreSocketWidget.prototype.initSocket = function() {
        this.socket = io(this.endpoint, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 3
        });

        this.socket.on('connect', () => {
            console.log('HTML Store Socket.IO connected');
        });

        this.socket.on('chat-response', (data) => {
            this.handleResponse(data);
        });

        this.socket.on('disconnect', () => {
            console.log('HTML Store Socket.IO disconnected');
        });
    };

    HTMLStoreSocketWidget.prototype.sendMessage = function(message, userMessage) {
        const sessionId = this.generateSessionId();
        
        const timeoutId = setTimeout(() => {
            console.log('HTML Store Socket.IO timeout, falling back to HTTP');
            this.handleHttpFallback(message, userMessage);
            this.activeTimeouts.delete(sessionId);
        }, 10000);
        
        this.activeTimeouts.set(sessionId, timeoutId);
        
        if (this.socket && this.socket.connected) {
            this.socket.emit('chat-message', {
                message: message,
                sessionId: sessionId,
                timestamp: Date.now()
            });
        } else {
            clearTimeout(timeoutId);
            this.activeTimeouts.delete(sessionId);
            this.handleHttpFallback(message, userMessage);
        }
    };

    HTMLStoreSocketWidget.prototype.handleResponse = function(data) {
        if (this.activeTimeouts.has(data.sessionId)) {
            clearTimeout(this.activeTimeouts.get(data.sessionId));
            this.activeTimeouts.delete(data.sessionId);
        }
        
        const container = document.querySelector(this.responseContainer);
        if (container) {
            container.innerHTML = data.response;
        }
    };

    HTMLStoreSocketWidget.prototype.generateSessionId = function() {
        return 'html_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    HTMLStoreSocketWidget.prototype.handleHttpFallback = function(message, userMessage) {
        // HTTP fallback implementation
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                userMessage: userMessage,
                platform: 'html-store'
            })
        })
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector(this.responseContainer);
            if (container) {
                container.innerHTML = data.response;
            }
        })
        .catch(error => {
            console.error('HTTP fallback error:', error);
        });
    };

    HTMLStoreSocketWidget.prototype.cleanup = function() {
        this.activeTimeouts.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });
        this.activeTimeouts.clear();
        
        if (this.socket) {
            this.socket.disconnect();
        }
    };

    // Expose to global scope
    window.HTMLStoreSocketWidget = HTMLStoreSocketWidget;

})(window);
```

---

## 🧪 Validation Commands

### Phase 1 Validation:
```bash
# Memory leak tests
npm run test:critical-fixes -- --testNamePattern="memory-leak"

# Interface consistency tests
npm run test:critical-fixes -- --testNamePattern="interface-consistency"

# Performance tests
npm run test:critical-fixes -- --testNamePattern="performance"
```

### Phase 2 Validation:
```bash
# Cross-platform consistency tests
npm run test:socketio

# Platform-specific tests
npm test -- --testPathPattern="shopify.*socket"
npm test -- --testPathPattern="woocommerce.*socket"
npm test -- --testPathPattern="magento.*socket"
npm test -- --testPathPattern="html-store.*socket"
```

### Complete System Validation:
```bash
# Run all critical tests
npm run test:critical-fixes:verbose

# Run cross-platform tests
npm run test:socketio

# Run avatar demo tests
npm run test:avatar-demo:verbose

# Expected Results:
# ✅ Memory leak tests: 100% pass rate
# ✅ Cross-platform tests: All platforms consistent
# ✅ Performance tests: Within acceptable limits
# ✅ Security tests: No vulnerabilities detected
```

---

## 📊 Success Criteria

### Phase 1 Success Metrics:
- [ ] Memory leak tests: 100% pass rate
- [ ] No duplicate interfaces detected
- [ ] Performance benchmarks: <100ms response time
- [ ] Zero critical security vulnerabilities

### Phase 2 Success Metrics:
- [ ] All platforms: Socket.IO connectivity working
- [ ] Fallback mechanisms: HTTP backup functional
- [ ] Cross-platform consistency: 100% feature parity
- [ ] Load testing: Handles 1000+ concurrent connections

### Overall Success Criteria:
- [ ] LS3 Score improvement: 72.4 → 85+
- [ ] All critical tests passing
- [ ] Production readiness validated
- [ ] Cross-platform propagation complete

This execution guide provides the specific implementation details needed to successfully merge all changes while maintaining system stability and performance.