# Phase 3: Socket.IO Integration Prompts - Layer LS3

## Context Summary
We've completed ES module migration (Phase 1) and unified API integration (Phase 2). Phase 3 focuses on adding Socket.IO client libraries and implementing `chat-response` event handlers to enable real-time chat functionality across all platforms (Shopify, WooCommerce, Magento, HTML Store).

**Reference Implementation**: The working demo at [`demo/live-demo/live-avatar-interface.html`](demo/live-demo/live-avatar-interface.html) contains the complete Socket.IO integration pattern that needs to be propagated.

**Key Requirements**:
1. Add Socket.IO client libraries to all platform widgets
2. Implement `chat-response` event handlers in frontend components
3. Update Content Security Policies for MediaPipe WebAssembly support
4. Ensure consistent real-time message display patterns
5. Maintain compatibility with existing unified `/api/chat` endpoints

---

## Prompt [LS3_01] - Shopify Socket.IO Integration

### Context
The Shopify [`AIDiscoveryWidget.tsx`](apps/shopify/frontend/components/AIDiscoveryWidget.tsx) currently uses HTTP requests to `/api/ai-discovery/chat`. We need to add Socket.IO support for real-time chat responses while maintaining backward compatibility.

### Task
Integrate Socket.IO client into the Shopify AIDiscoveryWidget component to enable real-time chat functionality.

### Requirements
- Add Socket.IO client library import and initialization
- Implement `chat-response` event handler following the demo pattern
- Add connection status indicators and error handling
- Maintain existing HTTP fallback for compatibility
- Add proper cleanup for socket connections
- Implement reconnection logic with exponential backoff

### Previous Issues
- Missing real-time chat capabilities
- No connection status feedback to users
- Potential memory leaks from unclosed connections

### Expected Output
Updated [`apps/shopify/frontend/components/AIDiscoveryWidget.tsx`](apps/shopify/frontend/components/AIDiscoveryWidget.tsx) with:
```typescript
// Socket.IO integration pattern
import io from 'socket.io-client';

// Connection management
const [socket, setSocket] = useState<Socket | null>(null);
const [isConnected, setIsConnected] = useState(false);

// Event handlers
const handleChatResponse = useCallback((data: any) => {
  // Real-time message handling
}, []);

// Connection lifecycle
useEffect(() => {
  // Initialize socket connection
  // Set up event listeners
  // Handle cleanup
}, []);
```

---

## Prompt [LS3_02] - WooCommerce Socket.IO Widget Implementation

### Context
WooCommerce needs a frontend widget component with Socket.IO integration. Currently only has the backend API endpoint at [`apps/woocommerce/api/chat.js`](apps/woocommerce/api/chat.js).

### Task
Create a WooCommerce frontend widget with Socket.IO integration for real-time chat functionality.

### Requirements
- Create new widget component file: `apps/woocommerce/frontend/components/AIDiscoveryWidget.js`
- Implement Socket.IO client connection to WooCommerce backend
- Add `chat-response` event handler matching demo pattern
- Include face analysis integration capabilities
- Add proper error handling and connection management
- Ensure WordPress/WooCommerce compatibility

### Previous Issues
- No frontend widget component exists
- Missing real-time chat capabilities
- Need WordPress-compatible implementation

### Expected Output
New file [`apps/woocommerce/frontend/components/AIDiscoveryWidget.js`](apps/woocommerce/frontend/components/AIDiscoveryWidget.js) with:
```javascript
class WooCommerceAIWidget {
  constructor(options = {}) {
    this.socket = null;
    this.isConnected = false;
    this.init(options);
  }

  async init(options) {
    // Initialize Socket.IO connection
    this.socket = io(options.socketUrl || window.location.origin);
    
    // Set up event handlers
    this.socket.on('chat-response', this.handleChatResponse.bind(this));
    this.socket.on('connect', () => this.setConnectionStatus(true));
    this.socket.on('disconnect', () => this.setConnectionStatus(false));
  }

  handleChatResponse(data) {
    // Process real-time chat responses
  }
}
```

---

## Prompt [LS3_03] - Magento Socket.IO Widget Implementation

### Context
Magento needs a frontend widget component with Socket.IO integration. Currently only has the backend API endpoint at [`apps/magento/api/chat.js`](apps/magento/api/chat.js).

### Task
Create a Magento frontend widget with Socket.IO integration for real-time chat functionality.

### Requirements
- Create new widget component file: `apps/magento/frontend/components/AIDiscoveryWidget.js`
- Implement Socket.IO client connection to Magento backend
- Add `chat-response` event handler matching demo pattern
- Include RequireJS compatibility for Magento 2
- Add proper error handling and connection management
- Ensure Magento module system compatibility

### Previous Issues
- No frontend widget component exists
- Missing real-time chat capabilities
- Need Magento RequireJS compatibility

### Expected Output
New file [`apps/magento/frontend/components/AIDiscoveryWidget.js`](apps/magento/frontend/components/AIDiscoveryWidget.js) with:
```javascript
define([
    'jquery',
    'socket.io'
], function ($, io) {
    'use strict';

    return function(config) {
        var widget = {
            socket: null,
            isConnected: false,

            init: function() {
                // Initialize Socket.IO connection
                this.socket = io(config.socketUrl || window.location.origin);
                
                // Set up event handlers
                this.socket.on('chat-response', this.handleChatResponse.bind(this));
                this.socket.on('connect', this.onConnect.bind(this));
                this.socket.on('disconnect', this.onDisconnect.bind(this));
            },

            handleChatResponse: function(data) {
                // Process real-time chat responses
            }
        };

        widget.init();
        return widget;
    };
});
```

---

## Prompt [LS3_04] - HTML Store Socket.IO Widget Implementation

### Context
HTML Store needs a frontend widget component with Socket.IO integration. Currently only has the backend API endpoint at [`apps/html-store/api/chat.js`](apps/html-store/api/chat.js).

### Task
Create an HTML Store frontend widget with Socket.IO integration for real-time chat functionality.

### Requirements
- Create new widget component file: `apps/html-store/frontend/components/AIDiscoveryWidget.js`
- Implement Socket.IO client connection to HTML Store backend
- Add `chat-response` event handler matching demo pattern
- Ensure vanilla JavaScript compatibility (no framework dependencies)
- Add proper error handling and connection management
- Include CDN-based Socket.IO client loading

### Previous Issues
- No frontend widget component exists
- Missing real-time chat capabilities
- Need framework-agnostic implementation

### Expected Output
New file [`apps/html-store/frontend/components/AIDiscoveryWidget.js`](apps/html-store/frontend/components/AIDiscoveryWidget.js) with:
```javascript
class HTMLStoreAIWidget {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.socket = null;
    this.isConnected = false;
    this.options = options;
    this.init();
  }

  async init() {
    // Load Socket.IO from CDN if not available
    if (typeof io === 'undefined') {
      await this.loadSocketIO();
    }

    // Initialize Socket.IO connection
    this.socket = io(this.options.socketUrl || window.location.origin);
    
    // Set up event handlers
    this.socket.on('chat-response', this.handleChatResponse.bind(this));
    this.socket.on('connect', () => this.setConnectionStatus(true));
    this.socket.on('disconnect', () => this.setConnectionStatus(false));
  }

  async loadSocketIO() {
    // Dynamically load Socket.IO client
  }

  handleChatResponse(data) {
    // Process real-time chat responses
  }
}
```

---

## Prompt [LS3_05] - Content Security Policy Updates

### Context
All platforms need CSP updates to support MediaPipe WebAssembly and Socket.IO connections. The demo at [`demo/live-demo/live-demo-server.js`](demo/live-demo/live-demo-server.js) shows the required CSP configuration.

### Task
Update Content Security Policy configurations across all platforms to support Socket.IO and MediaPipe WebAssembly.

### Requirements
- Add `'unsafe-eval'` to script-src for MediaPipe WebAssembly
- Allow WebSocket connections (`ws:` and `wss:`)
- Allow Socket.IO CDN resources
- Update platform-specific CSP configurations
- Maintain security while enabling required functionality

### Previous Issues
- MediaPipe WebAssembly blocked by CSP
- Socket.IO connections blocked
- External CDN resources blocked

### Expected Output
Updated CSP configurations in:
- [`apps/shopify/middleware/security.js`](apps/shopify/middleware/security.js)
- [`apps/woocommerce/api/chat.js`](apps/woocommerce/api/chat.js) (helmet configuration)
- [`apps/magento/api/chat.js`](apps/magento/api/chat.js) (helmet configuration)
- [`apps/html-store/api/chat.js`](apps/html-store/api/chat.js) (helmet configuration)

```javascript
// CSP configuration pattern
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'", // Required for MediaPipe WebAssembly
      "https://cdn.jsdelivr.net",
      "https://cdn.socket.io"
    ],
    connectSrc: ["'self'", "ws:", "wss:", "https:"],
    workerSrc: ["'self'", "blob:"],
    childSrc: ["'self'", "blob:"]
  }
}
```

---

## Prompt [LS3_06] - Socket.IO Server Integration

### Context
Platform backend servers need Socket.IO server integration to handle real-time chat events. The demo server at [`demo/live-demo/live-demo-server.js`](demo/live-demo/live-demo-server.js) shows the complete server-side Socket.IO implementation.

### Task
Add Socket.IO server integration to all platform backend services to handle real-time chat events.

### Requirements
- Add Socket.IO server initialization to platform backends
- Implement `chat-message` event handler
- Emit `chat-response` events to clients
- Add session management for Socket.IO connections
- Integrate with existing `/api/chat` endpoints
- Add proper error handling and connection management

### Previous Issues
- No real-time server capabilities
- Missing Socket.IO event handling
- No session management for WebSocket connections

### Expected Output
Updated platform backend files with Socket.IO integration:
- [`apps/shopify/api/ai-discovery/chat.js`](apps/shopify/api/ai-discovery/chat.js)
- [`apps/woocommerce/api/chat.js`](apps/woocommerce/api/chat.js)
- [`apps/magento/api/chat.js`](apps/magento/api/chat.js)
- [`apps/html-store/api/chat.js`](apps/html-store/api/chat.js)

```javascript
// Socket.IO server integration pattern
import { Server as SocketIOServer } from 'socket.io';

// Initialize Socket.IO server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"],
    methods: ["GET", "POST"]
  }
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chat-message', async (data) => {
    try {
      // Process message through existing chat API logic
      const response = await processMessage(data);
      
      // Emit response back to client
      socket.emit('chat-response', {
        success: true,
        response: response.response,
        sessionId: data.sessionId,
        provider: response.provider,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('chat-response', {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
```

---

## Prompt [LS3_07] - Real-time Message Display Patterns

### Context
All platform widgets need consistent real-time message display patterns. The demo at [`demo/live-demo/live-avatar-interface.html`](demo/live-demo/live-avatar-interface.html) shows the complete message handling implementation.

### Task
Implement consistent real-time message display patterns across all platform widgets.

### Requirements
- Add real-time message rendering functions
- Implement typing indicators during processing
- Add connection status indicators
- Ensure smooth message animations
- Handle message queuing during disconnections
- Add error message display for failed connections

### Previous Issues
- Inconsistent message display across platforms
- No real-time feedback during processing
- Missing connection status indicators

### Expected Output
Consistent message display functions across all platform widgets:

```javascript
// Real-time message display pattern
handleChatResponse(data) {
  console.log('Chat response received:', data);
  
  if (data.success && data.response) {
    this.addMessage('assistant', data.response, {
      timestamp: data.timestamp,
      provider: data.provider,
      sessionId: data.sessionId
    });
  } else if (data.error) {
    this.addMessage('system', `Error: ${data.error}`, {
      timestamp: data.timestamp,
      type: 'error'
    });
  }
  
  // Update connection status indicators
  if (data.provider) {
    this.updateProviderStatus(data.provider);
  }
  
  // Hide typing indicator
  this.hideTypingIndicator();
}

addMessage(sender, content, metadata = {}) {
  const messageElement = this.createMessageElement(sender, content, metadata);
  this.messagesContainer.appendChild(messageElement);
  this.scrollToBottom();
  
  // Add smooth animation
  messageElement.style.opacity = '0';
  messageElement.style.transform = 'translateY(20px)';
  
  requestAnimationFrame(() => {
    messageElement.style.transition = 'all 0.3s ease';
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';
  });
}
```

---

## Prompt [LS3_08] - Error Handling and Reconnection Logic

### Context
All platform widgets need robust error handling and reconnection logic for Socket.IO connections. The demo shows basic connection management that needs to be enhanced.

### Task
Implement comprehensive error handling and reconnection logic for Socket.IO connections across all platforms.

### Requirements
- Add exponential backoff reconnection strategy
- Implement connection timeout handling
- Add offline/online detection
- Queue messages during disconnections
- Display appropriate user feedback for connection issues
- Add manual reconnection options

### Previous Issues
- No reconnection strategy for failed connections
- Missing offline state handling
- No message queuing during disconnections

### Expected Output
Robust connection management across all platform widgets:

```javascript
// Connection management pattern
class SocketConnectionManager {
  constructor(widget) {
    this.widget = widget;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageQueue = [];
    this.isOnline = navigator.onLine;
    
    this.setupOnlineDetection();
  }

  setupOnlineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.attemptReconnection();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.widget.showOfflineMessage();
    });
  }

  handleConnectionError(error) {
    console.error('Socket connection error:', error);
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnection();
    } else {
      this.widget.showConnectionFailedMessage();
    }
  }

  scheduleReconnection() {
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    
    setTimeout(() => {
      if (this.isOnline) {
        this.attemptReconnection();
      }
    }, delay);
    
    this.reconnectAttempts++;
  }

  queueMessage(message) {
    this.messageQueue.push(message);
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.widget.socket.emit('chat-message', message);
    }
  }
}
```

---

## Summary

These prompts provide comprehensive guidance for implementing Socket.IO integration across all platforms in Phase 3. Each prompt focuses on specific implementation aspects while maintaining consistency with the reference demo implementation. The prompts address:

1. **Platform-specific Socket.IO client integration** (Prompts LS3_01-04)
2. **Security policy updates** (Prompt LS3_05)
3. **Server-side Socket.IO integration** (Prompt LS3_06)
4. **Consistent UI patterns** (Prompt LS3_07)
5. **Robust error handling** (Prompt LS3_08)

All prompts maintain compatibility with existing unified `/api/chat` endpoints while adding real-time capabilities through Socket.IO integration.
