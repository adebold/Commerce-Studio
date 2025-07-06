# Live Demo Guide - AI Avatar Chat System

## Overview

This guide provides comprehensive instructions for setting up and running the AI Avatar Chat System live demo using real NVIDIA API services. The live demo showcases the full capabilities of the system with actual AI-powered avatars, speech processing, and conversational AI.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [NVIDIA API Configuration](#nvidia-api-configuration)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Running the Demo](#running-the-demo)
7. [Demo Features](#demo-features)
8. [Troubleshooting](#troubleshooting)
9. [API Testing](#api-testing)
10. [Fallback Mode](#fallback-mode)
11. [Performance Optimization](#performance-optimization)
12. [Security Considerations](#security-considerations)

## Prerequisites

### System Requirements

- **Operating System**: Linux, macOS, or Windows 10/11
- **Node.js**: Version 16.0 or higher
- **npm**: Version 8.0 or higher
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: At least 2GB free space
- **Network**: Stable internet connection for API calls

### Required Tools

```bash
# Essential tools
node --version    # Should be 16.0+
npm --version     # Should be 8.0+
curl --version    # For API testing
git --version     # For version control

# Optional but recommended
jq --version      # For JSON processing
ffmpeg --version  # For audio processing
python3 --version # For MediaPipe face analysis
```

### NVIDIA Developer Account

1. Create an account at [NVIDIA Developer Portal](https://developer.nvidia.com/)
2. Apply for access to the following services:
   - **NVIDIA Omniverse Avatar Cloud**
   - **NVIDIA Riva Speech AI**
   - **NVIDIA Merlin Conversational AI**
3. Obtain API keys and endpoints for each service

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Commerce-Studio
```

### 2. Environment Variables

Copy the environment template and configure your API credentials:

```bash
cp .env.demo.template .env
```

Edit the `.env` file with your NVIDIA API credentials:

```bash
# NVIDIA API Configuration
NVIDIA_OMNIVERSE_API_KEY=your_omniverse_api_key_here
NVIDIA_OMNIVERSE_ENDPOINT=https://api.omniverse.nvidia.com
NVIDIA_RIVA_API_KEY=your_riva_api_key_here
NVIDIA_RIVA_ENDPOINT=https://api.riva.nvidia.com
NVIDIA_MERLIN_API_KEY=your_merlin_api_key_here
NVIDIA_MERLIN_ENDPOINT=https://api.merlin.nvidia.com

# Demo Server Configuration
DEMO_SERVER_HOST=localhost
DEMO_SERVER_PORT=3000
DEMO_SSL_ENABLED=false
DEMO_CORS_ORIGINS=http://localhost:3000,http://localhost:8080

# MediaPipe Configuration
MEDIAPIPE_MODEL_PATH=./models/mediapipe
MEDIAPIPE_CONFIDENCE_THRESHOLD=0.8

# Fallback Configuration
DEMO_FALLBACK_ENABLED=true
DEMO_MOCK_AVATAR_ENABLED=true
DEMO_MOCK_SPEECH_ENABLED=true

# Security Configuration
DEMO_RATE_LIMIT_REQUESTS=60
DEMO_SESSION_TIMEOUT=1800
DEMO_MAX_MESSAGE_LENGTH=1000

# Development Configuration
DEMO_DEBUG_MODE=false
DEMO_VERBOSE_LOGGING=false
NODE_ENV=production
```

## NVIDIA API Configuration

### Service Configuration Files

The system uses YAML configuration files to manage NVIDIA API settings:

#### 1. NVIDIA API Configuration (`config/nvidia/live-api-configuration.yaml`)

This file contains the technical configuration for each NVIDIA service:

```yaml
nvidia_services:
  omniverse_avatar:
    endpoint: "${NVIDIA_OMNIVERSE_ENDPOINT}"
    api_key: "${NVIDIA_OMNIVERSE_API_KEY}"
    timeout: 30000
    retry_attempts: 3
    models:
      professional_consultant: "nvidia_avatar_v2_professional"
      friendly_assistant: "nvidia_avatar_v2_casual"
    
  riva_speech:
    endpoint: "${NVIDIA_RIVA_ENDPOINT}"
    api_key: "${NVIDIA_RIVA_API_KEY}"
    timeout: 15000
    retry_attempts: 2
    models:
      speech_to_text: "riva_stt_en_us_conformer"
      text_to_speech: "riva_tts_en_us_fastpitch"
    
  merlin_conversation:
    endpoint: "${NVIDIA_MERLIN_ENDPOINT}"
    api_key: "${NVIDIA_MERLIN_API_KEY}"
    timeout: 20000
    retry_attempts: 3
    models:
      conversation: "merlin_conversation_v1"
```

#### 2. Demo Configuration (`demo/live-demo-configuration.yaml`)

This file contains demo-specific settings and scenarios.

## Installation

### Automated Setup

Use the provided setup script for automated installation:

```bash
# Make the script executable
chmod +x scripts/live-demo-setup.sh

# Run the setup
./scripts/live-demo-setup.sh setup
```

### Manual Setup

If you prefer manual installation:

```bash
# 1. Install Node.js dependencies
cd demo/live-demo
npm install

# 2. Create required directories
mkdir -p temp logs certs

# 3. Install Python dependencies (optional, for MediaPipe)
pip3 install mediapipe opencv-python

# 4. Test configuration
node -e "console.log('Configuration test passed')"
```

## Configuration

### Server Configuration

The demo server can be configured through environment variables or the configuration files:

```javascript
// Key configuration options
{
  server: {
    host: "localhost",
    port: 3000,
    ssl_enabled: false
  },
  nvidia_services: {
    omniverse_avatar: { enabled: true },
    riva_speech: { enabled: true },
    merlin_conversation: { enabled: true }
  },
  security: {
    api_rate_limiting: { enabled: true, requests_per_minute: 60 },
    input_validation: { enabled: true, max_message_length: 1000 }
  }
}
```

### Avatar Configuration

Configure available avatars and their properties:

```yaml
avatar:
  available_avatars:
    - id: "professional_consultant"
      name: "Professional Eyewear Consultant"
      model_id: "nvidia_avatar_v2_professional"
      voice_profile: "professional_female"
      
    - id: "friendly_assistant"
      name: "Friendly Shopping Assistant"
      model_id: "nvidia_avatar_v2_casual"
      voice_profile: "friendly_male"
```

## Running the Demo

### Quick Start

```bash
# Start the demo server
./scripts/live-demo-setup.sh start

# Or start in background
./scripts/live-demo-setup.sh start-bg
```

### Manual Start

```bash
# Navigate to demo directory
cd demo/live-demo

# Start the server
node live-demo-server.js
```

### Accessing the Demo

Once the server is running, access the demo at:

- **Main Interface**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **API Status**: http://localhost:3000/api/status

## Demo Features

### 1. AI Avatar Interaction

- **Real-time Avatar Rendering**: Photorealistic avatars powered by NVIDIA Omniverse
- **Facial Animations**: Lip-sync and emotion mapping
- **Multiple Avatar Types**: Professional consultant and friendly assistant
- **Avatar Switching**: Change avatars during conversation

### 2. Speech Processing

- **Speech-to-Text**: Convert voice input to text using NVIDIA Riva
- **Text-to-Speech**: Generate natural speech from AI responses
- **Multi-language Support**: English (US/UK), Spanish, French
- **Voice Profiles**: Different voice characteristics for each avatar

### 3. Conversational AI

- **Context-Aware Responses**: Intelligent conversation using NVIDIA Merlin
- **Eyewear Expertise**: Specialized knowledge for eyewear consultation
- **Session Memory**: Maintains conversation context
- **Personalized Recommendations**: Based on user preferences and face analysis

### 4. Face Analysis

- **Real-time Analysis**: Live face shape and measurement detection
- **MediaPipe Integration**: Advanced facial landmark detection
- **Frame Recommendations**: AI-powered eyewear suggestions
- **Privacy Protection**: No image storage, real-time processing only

### 5. Interactive Features

- **Voice Input**: Click and hold to record voice messages
- **Text Chat**: Type messages for text-based interaction
- **Camera Integration**: Real-time face analysis for recommendations
- **Product Visualization**: Virtual try-on capabilities

## API Testing

### Automated Testing

Test NVIDIA API connectivity:

```bash
# Run full API tests
./scripts/nvidia-api-test.sh

# Quick connectivity test
./scripts/nvidia-api-test.sh --quick

# Test specific service
./scripts/nvidia-api-test.sh --service omniverse
```

### Manual Testing

Test individual endpoints:

```bash
# Test Omniverse Avatar API
curl -H "Authorization: Bearer $NVIDIA_OMNIVERSE_API_KEY" \
     -H "Content-Type: application/json" \
     "$NVIDIA_OMNIVERSE_ENDPOINT/v1/health"

# Test Riva Speech API
curl -H "Authorization: Bearer $NVIDIA_RIVA_API_KEY" \
     -H "Content-Type: application/json" \
     "$NVIDIA_RIVA_ENDPOINT/v1/health"

# Test Merlin Conversation API
curl -H "Authorization: Bearer $NVIDIA_MERLIN_API_KEY" \
     -H "Content-Type: application/json" \
     "$NVIDIA_MERLIN_ENDPOINT/v1/health"
```

## Fallback Mode

If NVIDIA APIs are unavailable, the system automatically switches to fallback mode:

### Features in Fallback Mode

- **Mock Avatar Service**: Simulated avatar responses
- **Text-only Interaction**: Chat without speech processing
- **Static Recommendations**: Pre-configured eyewear suggestions
- **Local Face Analysis**: Basic MediaPipe-only analysis

### Enabling Fallback Mode

```bash
# Set in environment variables
DEMO_FALLBACK_ENABLED=true
DEMO_MOCK_AVATAR_ENABLED=true
DEMO_MOCK_SPEECH_ENABLED=true
```

## Troubleshooting

### Common Issues

#### 1. API Authentication Errors

**Problem**: "Unauthorized" or "Forbidden" errors

**Solution**:
```bash
# Verify API keys are set
echo $NVIDIA_OMNIVERSE_API_KEY
echo $NVIDIA_RIVA_API_KEY
echo $NVIDIA_MERLIN_API_KEY

# Test API connectivity
./scripts/nvidia-api-test.sh --quick
```

#### 2. Server Won't Start

**Problem**: Port already in use or permission errors

**Solution**:
```bash
# Check if port is in use
lsof -i :3000

# Kill existing process
pkill -f "live-demo-server.js"

# Try different port
DEMO_SERVER_PORT=3001 node live-demo-server.js
```

#### 3. Camera Access Issues

**Problem**: Camera not working in browser

**Solution**:
- Ensure HTTPS is enabled for camera access
- Check browser permissions
- Try different browser
- Verify camera is not used by other applications

#### 4. Audio Processing Errors

**Problem**: Speech recognition not working

**Solution**:
```bash
# Check microphone permissions
# Verify ffmpeg installation
ffmpeg -version

# Test audio recording in browser
# Check browser console for errors
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEMO_DEBUG_MODE=true
DEMO_VERBOSE_LOGGING=true
node live-demo-server.js
```

### Log Analysis

Check log files for errors:

```bash
# View live logs
./scripts/live-demo-setup.sh logs

# Check specific log files
tail -f logs/live-demo.log
tail -f nvidia-api-test.log
```

## Performance Optimization

### Server Optimization

```yaml
performance:
  caching:
    enabled: true
    avatar_cache_duration: 3600
    product_cache_duration: 1800
    
  optimization:
    lazy_loading: true
    image_compression: true
    cdn_enabled: true
    
  limits:
    max_concurrent_sessions: 50
    max_avatar_render_time: 5000
    max_api_timeout: 10000
```

### Client Optimization

- **Reduce Video Quality**: Lower avatar rendering quality for slower connections
- **Disable Features**: Turn off non-essential features for better performance
- **Browser Optimization**: Use Chrome or Firefox for best performance

### Network Optimization

- **CDN Usage**: Enable CDN for static assets
- **Compression**: Enable gzip compression
- **Caching**: Implement proper caching strategies

## Security Considerations

### API Security

- **API Key Protection**: Never expose API keys in client-side code
- **Rate Limiting**: Implement proper rate limiting
- **Input Validation**: Sanitize all user inputs
- **HTTPS**: Use HTTPS in production

### Data Privacy

- **No Image Storage**: Face analysis images are not stored
- **Session Encryption**: All sessions are encrypted
- **Data Anonymization**: Personal data is anonymized
- **GDPR Compliance**: Follows data protection regulations

### Production Deployment

```yaml
security:
  api_rate_limiting:
    enabled: true
    requests_per_minute: 60
    burst_limit: 10
    
  input_validation:
    enabled: true
    max_message_length: 1000
    sanitize_html: true
    
  data_protection:
    encrypt_sessions: true
    secure_cookies: true
    https_only: true
```

## Demo Scenarios

### Scenario 1: First-Time User

**Duration**: 5 minutes

**Steps**:
1. Welcome greeting from AI avatar
2. Face analysis explanation and demonstration
3. Virtual try-on with sample frames
4. Personalized recommendations
5. Purchase guidance

### Scenario 2: Returning Customer

**Duration**: 3 minutes

**Steps**:
1. Personalized greeting with preference recall
2. New product recommendations
3. Comparison with previous selections
4. Updated recommendations

### Scenario 3: Technical Demonstration

**Duration**: 10 minutes

**Steps**:
1. AI technology introduction
2. Deep dive into face analysis
3. Recommendation algorithm explanation
4. Avatar technology showcase
5. Integration possibilities discussion

## Monitoring and Analytics

### Real-time Monitoring

- **Session Tracking**: Monitor active sessions
- **API Performance**: Track response times
- **Error Rates**: Monitor failure rates
- **User Engagement**: Track interaction metrics

### Analytics Dashboard

Access analytics at: http://localhost:3000/analytics

**Metrics Include**:
- Session duration
- Message count
- API response times
- Error rates
- User satisfaction scores

## Support and Maintenance

### Regular Maintenance

- **API Key Rotation**: Regularly update API keys
- **Log Cleanup**: Clean old log files
- **Cache Clearing**: Clear cached data periodically
- **Security Updates**: Keep dependencies updated

### Getting Help

- **Documentation**: Check this guide and API documentation
- **Logs**: Review log files for error details
- **Testing**: Use provided test scripts
- **Community**: Check GitHub issues and discussions

## Conclusion

The AI Avatar Chat System live demo provides a comprehensive showcase of advanced AI technologies for eyewear discovery and consultation. By following this guide, you can successfully set up and run a fully functional demonstration that highlights the system's capabilities with real NVIDIA AI services.

For additional support or questions, please refer to the troubleshooting section or contact the development team.