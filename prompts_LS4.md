# Refined Prompts for Layer LS4

## Overview
Based on the comprehensive analysis of LS3 results, the Shopify Socket.IO integration achieved a 72.4% overall quality score but requires critical fixes before cross-platform propagation. The following prompts target specific high-severity issues that must be resolved to achieve production readiness.

## Prompt [LS4_001] - Memory Leak Resolution in Timeout Handler Management

### Context
The current implementation in [`AIDiscoveryWidget.tsx:519-533`](apps/shopify/frontend/components/AIDiscoveryWidget.tsx:519-533) creates memory leaks through improper event listener cleanup. The pattern of dynamically adding/removing Socket.IO event listeners without proper tracking leads to orphaned listeners that accumulate over time.

### Objective
Implement a robust timeout management system that prevents memory leaks while maintaining the existing fallback functionality to HTTP API when Socket.IO responses are delayed.

### Focus Areas
- Replace dynamic event listener manipulation with Map-based timeout tracking
- Implement proper cleanup mechanisms using useRef for persistent state
- Ensure all timeout handlers are properly cleared on component unmount
- Maintain backward compatibility with existing Socket.IO event patterns

### Code Reference
```typescript
// Current problematic implementation
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

### Requirements
- Implement Map-based timeout tracking: `activeTimeouts: Map<string, NodeJS.Timeout>`
- Use useRef for timeout state persistence across renders
- Create single event handler that manages timeouts internally
- Add comprehensive cleanup in useEffect return function
- Maintain existing 10-second timeout behavior
- Preserve HTTP fallback functionality when timeouts occur

### Expected Improvements
- Memory growth under load reduced from unbounded to < 10MB for 1000 operations
- Event listener count remains constant regardless of message volume
- Zero memory leaks detected in performance profiling
- Timeout cleanup success rate: 100%

### Test Validation
Must pass all tests in [`tests/critical-fixes/memory-leak-timeout-handler.test.js`](tests/critical-fixes/memory-leak-timeout-handler.test.js)

---

## Prompt [LS4_002] - Comprehensive Input Validation and Security Hardening

### Context
The current implementation sends user input directly via Socket.IO without any validation or sanitization, creating critical security vulnerabilities including XSS attacks and potential DoS vectors through oversized messages.

### Objective
Implement a comprehensive input validation and sanitization layer that prevents security vulnerabilities while maintaining user experience and message functionality.

### Focus Areas
- Create robust input validation utility with length limits and type checking
- Implement HTML sanitization to prevent XSS attacks
- Add protection against polyglot attacks and Unicode exploits
- Ensure validation errors provide user-friendly feedback
- Maintain message formatting for legitimate use cases

### Code Reference
```typescript
// Current vulnerable implementation
const messageData: ChatMessageData = {
  message: messageContent, // Unsanitized input
  sessionId,
  shopDomain,
  conversationContext,
  faceAnalysisResult,
  timestamp: new Date().toISOString()
};
```

### Requirements
- Implement `validateAndSanitizeMessage(message: string): string` utility
- Add message length validation (max 1000 characters)
- Implement HTML tag stripping and entity encoding
- Add protection against script injection patterns
- Create user-friendly error messages for validation failures
- Maintain support for legitimate special characters and formatting
- Add rate limiting validation (max 10 messages per minute)

### Expected Improvements
- XSS prevention effectiveness: 100%
- Message validation success rate: 100% for legitimate inputs
- Security vulnerability count: 0
- User experience degradation: < 5% (minimal impact on legitimate usage)

### Test Validation
Must pass all tests in [`tests/critical-fixes/input-validation-security.test.js`](tests/critical-fixes/input-validation-security.test.js)

---

## Prompt [LS4_003] - Race Condition Resolution in Connection Status Management

### Context
The connection error handling logic in [`AIDiscoveryWidget.tsx:164-176`](apps/shopify/frontend/components/AIDiscoveryWidget.tsx:164-176) has a race condition where `connectionAttempts` state may not be updated before the comparison check, leading to unreliable fallback behavior.

### Objective
Eliminate race conditions in connection status management by implementing atomic operations and ensuring consistent state updates across all connection scenarios.

### Focus Areas
- Replace useState with useRef for connection attempt tracking
- Implement atomic operations for connection status updates
- Ensure consistent behavior across all connection error scenarios
- Maintain existing retry logic and fallback thresholds
- Add proper error recovery mechanisms

### Code Reference
```typescript
// Current race condition implementation
newSocket.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error);
  setConnectionAttempts(prev => prev + 1);
  setConnectionStatus('error');
  
  // Race condition: connectionAttempts may not be updated yet
  if (connectionAttempts >= 3) {
    console.log('Falling back to HTTP API after multiple connection failures');
    setUseSocketIO(false);
  }
});
```

### Requirements
- Replace `connectionAttempts` useState with useRef for immediate updates
- Implement atomic connection status updates using functional state updates
- Add proper error boundary handling for connection failures
- Maintain existing 3-attempt retry threshold
- Ensure consistent behavior across connect_error, disconnect, and timeout events
- Add connection recovery mechanisms when network is restored

### Expected Improvements
- Connection state consistency: 100%
- Race condition occurrences: 0
- Fallback reliability: 100% at configured thresholds
- Connection recovery success rate: > 95%

### Test Validation
Must pass all tests in [`tests/critical-fixes/connection-race-condition.test.js`](tests/critical-fixes/connection-race-condition.test.js)

---

## Prompt [LS4_004] - Interface Consolidation and Error Recovery Standardization

### Context
Duplicate `FaceAnalysisResult` interface definitions exist in both [`AIDiscoveryWidget.tsx:19-30`](apps/shopify/frontend/components/AIDiscoveryWidget.tsx:19-30) and [`socket.ts:77-88`](apps/shopify/frontend/types/socket.ts:77-88). Additionally, error recovery patterns are inconsistent with the demo reference implementation.

### Objective
Consolidate all interface definitions into centralized type files and standardize error recovery patterns to match the demo implementation's user-friendly approach.

### Focus Areas
- Remove duplicate interface definitions and centralize in types files
- Standardize error messages to match demo implementation tone
- Implement consistent error recovery actions across all error scenarios
- Add suggested queries and recovery options for better user experience
- Ensure backward compatibility with existing integrations

### Code Reference
```typescript
// Current inconsistent error handling
const errorMessage: AIDiscoveryMessage = {
  id: `assistant_error_${Date.now()}`,
  content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
  sender: 'assistant',
  timestamp: Date.now(),
  type: 'error_recovery'
};
```

### Requirements
- Remove duplicate `FaceAnalysisResult` interface from component file
- Import all interfaces from centralized [`socket.ts`](apps/shopify/frontend/types/socket.ts)
- Implement error messages matching demo's friendly, helpful tone
- Add error recovery actions: retry_connection, browse_products, contact_support
- Include suggested queries in error responses
- Maintain consistent error message structure across all platforms
- Add proper TypeScript strict mode compliance

### Expected Improvements
- Interface definition consistency: 100%
- Error message consistency with demo: 100%
- User experience improvement: > 20% better error recovery
- TypeScript compilation errors: 0

### Test Validation
Must pass all tests in [`tests/critical-fixes/interface-consistency-error-recovery.test.js`](tests/critical-fixes/interface-consistency-error-recovery.test.js)

---

## Prompt [LS4_005] - Performance Optimization and Memory Management

### Context
The implementation lacks performance monitoring and optimization features, with no protection against memory growth under high load scenarios. Performance tests are missing, making it difficult to validate optimization efforts.

### Objective
Implement comprehensive performance optimizations including connection pooling, message batching, and memory management to ensure scalable operation under production loads.

### Focus Areas
- Implement connection pooling for multiple widget instances
- Add message batching for rapid user inputs
- Create object pooling for frequently created objects
- Add performance monitoring and metrics collection
- Implement lazy loading for Socket.IO library
- Add memory usage tracking and cleanup mechanisms

### Code Reference
```typescript
// Current implementation lacks optimization
const handleSendMessage = useCallback(async () => {
  // No batching or pooling
  const messageData: ChatMessageData = {
    message: messageContent,
    sessionId,
    shopDomain,
    conversationContext,
    faceAnalysisResult,
    timestamp: new Date().toISOString()
  };
  
  if (useSocketIO && socket?.connected) {
    socket.emit('chat-message', messageData);
  }
}, [/* dependencies */]);
```

### Requirements
- Implement connection pooling with maximum 5 concurrent connections
- Add message batching with 100ms debounce for rapid inputs
- Create object pools for MessageData and other frequently created objects
- Add performance metrics collection (response times, memory usage, connection counts)
- Implement lazy loading for Socket.IO library (reduce initial bundle size by ~50KB)
- Add memory usage monitoring with alerts at 50MB threshold
- Implement automatic cleanup of stale connections and cached data

### Expected Improvements
- Memory usage under load: < 50MB for 1000 concurrent operations
- Response time degradation: < 2x over 24-hour operation
- Bundle size reduction: > 30% through lazy loading
- Connection efficiency: > 90% connection reuse rate
- Message throughput: > 100 messages/second sustained

### Test Validation
Must pass all tests in [`tests/critical-fixes/performance-memory-leak.test.js`](tests/critical-fixes/performance-memory-leak.test.js)

---

## Implementation Priority

### Phase 1 (Critical - Must Fix Before Propagation)
1. **LS4_001** - Memory Leak Resolution (High Severity)
2. **LS4_002** - Input Validation and Security (High Severity)  
3. **LS4_003** - Race Condition Resolution (High Severity)

### Phase 2 (Important - Should Fix Before Propagation)
4. **LS4_004** - Interface Consolidation and Error Recovery (Medium Severity)
5. **LS4_005** - Performance Optimization (Medium Severity)

## Success Criteria for Cross-Platform Propagation

### Minimum Requirements (All Must Pass)
- Memory leak tests: 100% pass rate
- Security validation tests: 100% pass rate  
- Race condition tests: 100% pass rate
- Interface consistency tests: 100% pass rate
- Performance benchmarks: Meet all thresholds

### Quality Gates
- Overall score improvement: > 15 points (target: 87.4+)
- Security score: > 70 (current: 58.0)
- Performance score: > 75 (current: 68.0)
- All critical issues resolved: 100%

## Cross-Platform Considerations

### Consistency Requirements
- All fixes must be implementable across Shopify, WooCommerce, Magento, and HTML platforms
- Interface definitions must be platform-agnostic
- Error handling patterns must be consistent across all implementations
- Performance optimizations must work in all target environments

### Integration Points
- Socket.IO event names and data structures must remain consistent
- HTTP fallback mechanisms must work identically across platforms
- Security validation must be enforceable on all platforms
- Memory management patterns must be adaptable to different frameworks

## Testing Strategy

### Test-Driven Development Approach
1. **RED Phase**: Run existing tests to confirm all critical issues are exposed
2. **Implementation Phase**: Apply fixes guided by failing tests
3. **GREEN Phase**: Achieve 100% pass rate on all critical fix tests
4. **Refactor Phase**: Optimize implementations while maintaining test coverage

### Validation Commands
```bash
# Run all critical fixes tests
./scripts/run-critical-fixes-tests.sh

# Run specific test categories  
./scripts/run-critical-fixes-tests.sh memory
./scripts/run-critical-fixes-tests.sh security
./scripts/run-critical-fixes-tests.sh race-condition
./scripts/run-critical-fixes-tests.sh performance

# Generate comprehensive coverage report
./scripts/run-critical-fixes-tests.sh coverage
```

## Expected Outcomes

### Immediate Benefits
- Elimination of all high-severity security vulnerabilities
- Resolution of memory leak issues preventing production deployment
- Reliable connection management without race conditions
- Consistent error handling improving user experience

### Long-term Benefits  
- Scalable architecture supporting high-volume production usage
- Maintainable codebase with centralized type definitions
- Performance optimizations enabling better user experience
- Comprehensive test coverage preventing regression issues

### Cross-Platform Readiness
- Standardized implementation patterns ready for propagation
- Consistent security and performance characteristics across platforms
- Unified error handling and recovery mechanisms
- Validated architecture supporting multi-platform deployment