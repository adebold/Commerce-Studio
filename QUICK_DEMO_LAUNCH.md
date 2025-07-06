# Quick Live Demo Launch Guide

## Overview

This guide provides instructions for launching the AI Avatar Chat live demo immediately using the pre-configured NVIDIA API key.

## Files Created

### 1. `.env.demo` - Pre-configured Environment File
- Contains the actual NVIDIA API key: `iulzg9oedq-60se7t722e-dpxw5krfwk`
- Optimized settings for demo environment
- Security settings appropriate for demonstration
- Logging and monitoring configurations

### 2. `scripts/quick-live-demo.sh` - One-Command Launch Script
- Validates the API key automatically
- Tests NVIDIA service connectivity
- Installs missing dependencies
- Launches the live demo server
- Opens browser automatically
- Provides clear status updates and error handling

### 3. `demo/live-demo/quick-start.html` - Landing Page
- Shows current API key status
- Displays system health information
- Provides troubleshooting tips
- Lists demo features and capabilities
- Links to documentation

## Quick Launch

### One-Command Launch
```bash
./scripts/quick-live-demo.sh
```

This single command will:
1. ✅ Check system requirements (Node.js, npm)
2. ✅ Validate the NVIDIA API key
3. ✅ Test NVIDIA service connectivity
4. ✅ Install dependencies automatically
5. ✅ Start the demo server
6. ✅ Open browser to quick-start page
7. ✅ Display comprehensive status information

### Alternative Commands
```bash
# Stop the demo
./scripts/quick-live-demo.sh stop

# Check server status
./scripts/quick-live-demo.sh status

# View logs
./scripts/quick-live-demo.sh logs

# Restart demo
./scripts/quick-live-demo.sh restart
```

## Demo URLs

- **Quick Start Page**: http://localhost:3000/quick-start.html
- **Live Demo Interface**: http://localhost:3000/live-avatar-interface.html
- **Health Check**: http://localhost:3000/health
- **API Status**: http://localhost:3000/api/nvidia/status

## Features Available

### ✅ AI Avatar Chat
- Interactive conversations with realistic AI avatars
- Powered by NVIDIA Omniverse Avatar Cloud

### ✅ Face Analysis
- Real-time face shape detection
- Facial landmark analysis
- Personalized recommendations

### ✅ Voice Interaction
- Speech-to-text conversion
- Text-to-speech synthesis
- Powered by NVIDIA Riva

### ✅ Virtual Try-On
- Accurate face mapping
- Real-time eyewear positioning
- Multiple frame options

### ✅ Smart Recommendations
- AI-powered product suggestions
- Based on face analysis and preferences
- Powered by NVIDIA Merlin

## System Requirements

- **Node.js**: Version 16 or higher
- **npm**: Latest version
- **Browser**: Modern browser with camera/microphone support
- **Internet**: Stable connection for NVIDIA API calls

## API Key Information

**Pre-configured NVIDIA API Key**: `iulzg9oedq-60se7t722e-dpxw5krfwk`

This key provides access to:
- NVIDIA Omniverse Avatar Cloud
- NVIDIA Riva Speech Services
- NVIDIA Merlin Conversational AI

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   ./scripts/quick-live-demo.sh stop
   ./scripts/quick-live-demo.sh start
   ```

2. **API key validation fails**
   - Check internet connection
   - Verify `.env.demo` file exists
   - API key should be: `iulzg9oedq-60se7t722e-dpxw5krfwk`

3. **Camera not working**
   - Grant browser permissions
   - Ensure camera is not in use by other applications
   - Try refreshing the page

4. **Audio issues**
   - Check microphone permissions
   - Verify system audio settings
   - Test with different browsers

5. **Slow performance**
   - Close other browser tabs
   - Check internet connection speed
   - Restart the demo server

### Log Files

- **Server logs**: `logs/quick-demo.log`
- **Setup logs**: `logs/quick-demo-launch.log`

### Support Resources

- **Live Demo Guide**: `docs/demo/LIVE_DEMO_GUIDE.md`
- **Technical Documentation**: `docs/technical/DEVELOPER-TECHNICAL-GUIDE.md`
- **API Documentation**: `docs/api/API-DOCUMENTATION-INTEGRATION-GUIDE.md`

## Security Notes

- This configuration is optimized for demonstration purposes
- The API key is pre-configured for immediate use
- For production use, implement proper API key management
- Monitor usage to stay within API limits

## Next Steps

After launching the demo:

1. **Test Camera Access**: Click "Test Camera" on the quick-start page
2. **Start Live Demo**: Click "Start Live Demo" to begin
3. **Try Features**: Test voice interaction, face analysis, and virtual try-on
4. **Explore Documentation**: Review guides for deeper understanding

## Production Deployment

For production deployment:
- Use secure API key management
- Implement proper authentication
- Configure SSL/TLS certificates
- Set up monitoring and logging
- Review security policies

---

**Ready to launch?** Run `./scripts/quick-live-demo.sh` and experience the future of AI-powered eyewear discovery!