# Commerce Studio - Intelligent Eyewear Consultation MVP

## 🚀 Week 1 MVP Implementation

This document outlines the implementation of the intelligent eyewear consultation system MVP, transforming the existing VTO experience into a comprehensive AI-powered consultation platform.

## 📋 Overview

The consultation system provides:
- **Natural conversation flow** through Dialogflow CX
- **Intelligent needs assessment** for personalized recommendations
- **Face analysis integration** with existing VTO APIs
- **Virtual try-on capabilities** seamlessly integrated into chat
- **Store locator and reservation** system for BOPIS (Buy Online, Pick up In Store)
- **Multi-language support** (English MVP, Dutch ready for Week 3)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  HTML Store (localhost:3001)                               │
│  ├── consultation-chat.js (Chat Interface)                 │
│  ├── api-integration.js (Existing VTO APIs)                │
│  └── main.js (Product Display)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Consultation Services (localhost:3002)                    │
│  ├── consultation-dialogflow-service.js                    │
│  ├── consultation-webhook-service.js                       │
│  └── unified-dialogflow-service.js (Base)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 External Services                           │
├─────────────────────────────────────────────────────────────┤
│  ├── Dialogflow CX (Agent: 1601a958-7e8e-4abe-a0c8-93819aa7594a) │
│  ├── Google Cloud Speech API                               │
│  ├── Virtual Try-On API                                    │
│  ├── Face Analysis API                                     │
│  └── Store Locator API                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Implementation Components

### 1. Enhanced Dialogflow Service
**File**: `services/google/consultation-dialogflow-service.js`

- Extends the existing `UnifiedDialogflowService`
- Implements consultation-specific conversation flows
- Manages consultation context and session state
- Provides intelligent intent routing and response enhancement

**Key Features**:
- Consultation stages: Greeting → Needs Assessment → Style Discovery → Face Analysis → Virtual Try-On → Recommendations → Store Locator → Reservation
- Context-aware conversation management
- Personalized response generation
- Integration hooks for ML recommendations and visual analysis

### 2. Consultation Chat Interface
**File**: `apps/html-store/js/consultation-chat.js`

- Modern chat widget integrated into existing HTML store
- Real-time conversation with typing indicators
- Camera integration for face analysis and VTO
- Quick action buttons and reply suggestions
- Mobile-responsive design

**Key Features**:
- Floating chat widget with smooth animations
- Voice input capabilities (ready for Google Speech integration)
- Rich message types (text, images, product cards, store locations)
- Integration with existing cart and product systems

### 3. Webhook Integration Service
**File**: `services/consultation-webhook-service.js`

- Express.js server handling Dialogflow CX webhooks
- Bridges conversation intents to existing APIs
- Manages consultation sessions and data collection
- Provides REST endpoints for direct integration

**Key Endpoints**:
- `POST /webhook` - Main Dialogflow CX webhook
- `POST /consultation/start` - Initialize consultation session
- `POST /consultation/face-analysis` - Face shape analysis
- `POST /consultation/virtual-tryon` - Virtual try-on processing
- `POST /consultation/recommendations` - Personalized recommendations
- `POST /consultation/store-locator` - Find nearby stores
- `POST /consultation/reservation` - Create BOPIS reservations

### 4. System Manager
**File**: `scripts/start-consultation-system.js`

- Orchestrates all consultation services
- Provides CLI interface for system management
- Health monitoring and graceful shutdown
- Integration testing capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Cloud Project with Dialogflow CX enabled
- Environment variables configured in `.env.secure`

### Installation
```bash
# Install dependencies
npm install

# Start the consultation system
npm start

# Start with testing
npm run start:test

# Development mode with auto-reload
npm run dev
```

### Environment Configuration
Required environment variables in `.env.secure`:
```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
DIALOGFLOW_AGENT_ID=1601a958-7e8e-4abe-a0c8-93819aa7594a
DIALOGFLOW_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
CONSULTATION_PORT=3002
PORT=3001
```

### Running the Demo
1. Start the consultation system:
   ```bash
   npm start
   ```

2. Serve the HTML store:
   ```bash
   npm run serve:html
   ```

3. Open browser to `http://localhost:3001`

4. Click the AI consultation chat widget in the bottom-right corner

## 💬 Conversation Flow Examples

### Basic Consultation Flow
```
User: "Hi, I'm looking for new glasses"
AI: "Hello! I'm your personal AI eyewear consultant. I'll help you find the perfect frames based on your face shape, style preferences, and needs. What brings you here today?"

User: "I need reading glasses for work"
AI: "Perfect! Let me help you find the ideal reading glasses for your work environment. Do you need prescription lenses, or are you looking for non-prescription reading glasses?"

User: "I need prescription lenses"
AI: "Great! Tell me about your work environment. Do you spend most of your time at a computer, reading documents, or in meetings?"

User: "Mostly computer work"
AI: "Excellent! For computer work, I'd recommend frames that reduce eye strain and provide comfort for extended wear. Would you like me to analyze your face shape for the most accurate recommendations?"

User: "Yes, analyze my face"
AI: "Perfect! I'll need to access your camera to analyze your face shape. Please allow camera access when prompted, and position your face in the frame with good lighting."
```

### Virtual Try-On Flow
```
User: "I want to try on frames virtually"
AI: "Excellent! Virtual try-on is a great way to see how frames look on you. I'll need camera access to get started. Would you like to try specific frames, or shall I recommend some based on your preferences?"

User: "Recommend some first"
AI: "Based on your needs for computer work and professional environment, here are my top recommendations: [Shows product cards with try-on buttons]"

User: [Clicks "Try On" button]
AI: "Great choice! Let me start the virtual try-on for these frames. Please allow camera access and position your face in the frame."
```

## 🔧 Integration Points

### Existing VTO API Integration
The consultation system integrates with existing VTO APIs through the `APIIntegration` service:

```javascript
// Face analysis integration
const faceAnalysis = await window.apiIntegration.analyzeFace(imageData);

// Virtual try-on integration  
const vtoResult = await window.apiIntegration.performVirtualTryOn(frameId, sessionId);

// Store locator integration
const stores = await window.apiIntegration.findNearbyStores(lat, lng);

// Reservation integration
const reservation = await window.apiIntegration.createReservation(reservationData);
```

### Dialogflow CX Agent Configuration
The system connects to Dialogflow CX Agent ID: `1601a958-7e8e-4abe-a0c8-93819aa7594a`

**Required Intents**:
- `consultation.start` - Initialize consultation
- `needs.assessment` - Collect user preferences
- `face.analysis_request` - Request face analysis
- `virtual.tryon_request` - Start virtual try-on
- `recommendation.request` - Get personalized recommendations
- `store.locator_request` - Find nearby stores
- `reservation.create` - Create store reservations

**Webhook Configuration**:
- Webhook URL: `http://your-domain.com:3002/webhook`
- Enable webhook for all intents
- Set timeout to 30 seconds

## 📱 Mobile Responsiveness

The consultation chat is fully responsive:
- **Desktop**: 380px wide chat window, bottom-right positioning
- **Mobile**: Full-width chat overlay, optimized touch interactions
- **Tablet**: Adaptive sizing based on screen dimensions

## 🔒 Security Considerations

- All API keys stored in environment variables
- CORS configured for specific origins
- Input validation on all webhook endpoints
- Session management with automatic cleanup
- Secure camera access handling

## 🧪 Testing

### Manual Testing
```bash
# Test consultation flow
npm test

# Health check
npm run health
```

### Integration Testing
The system includes built-in integration tests:
- Dialogflow connectivity
- Webhook endpoint validation
- API integration verification
- Session management testing

## 📊 Analytics & Monitoring

### Consultation Metrics
- Session duration and completion rates
- Intent recognition accuracy
- User interaction patterns
- Conversion from consultation to purchase

### Health Monitoring
- Service availability checks
- Response time monitoring
- Error rate tracking
- Resource usage metrics

## 🔄 Next Steps (Week 2-4)

### Week 2: Enhanced Features
- [ ] Voice integration with Google Speech API
- [ ] Advanced recommendation engine
- [ ] Multi-platform deployment (Shopify, Magento, WooCommerce)
- [ ] Analytics dashboard

### Week 3: Multi-Language Support
- [ ] Dutch language implementation
- [ ] Localized conversation flows
- [ ] European customer geo-targeting
- [ ] Cultural adaptation for Dutch market

### Week 4: Production Deployment
- [ ] Load testing and optimization
- [ ] Security audit and compliance
- [ ] Documentation and training
- [ ] Go-live preparation

## 🐛 Troubleshooting

### Common Issues

**Chat widget not appearing**:
- Check console for JavaScript errors
- Verify `consultation-chat.js` is loaded
- Ensure CSS styles are applied

**Dialogflow connection failed**:
- Verify environment variables
- Check Google Cloud credentials
- Confirm agent ID and project ID

**Webhook timeouts**:
- Check network connectivity
- Verify webhook URL configuration
- Monitor server logs for errors

### Debug Mode
Enable debug logging:
```bash
DEBUG=consultation:* npm start
```

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review server logs for error details
- Test individual components using the CLI tools
- Verify environment configuration

## 🎯 Success Metrics

### Week 1 MVP Goals
- [x] Functional consultation chat interface
- [x] Dialogflow CX integration
- [x] Basic conversation flows
- [x] VTO API integration hooks
- [x] Store locator integration
- [x] Mobile-responsive design

### Performance Targets
- Response time: < 2 seconds
- Uptime: > 99.5%
- Intent recognition: > 85% accuracy
- User engagement: > 60% completion rate

---

**Version**: 1.0.0 (Week 1 MVP)  
**Last Updated**: January 2025  
**Status**: Ready for Testing