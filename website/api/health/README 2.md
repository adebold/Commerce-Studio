# VARAi Health Monitoring System

A comprehensive health monitoring system for VARAi's Cloud Run services, providing real-time monitoring, alerting, and dashboard visualization.

## Overview

The health monitoring system tracks the status and performance of four critical Cloud Run services:
- Virtual Try On Application
- Pupillary Distance Tools
- Eyewear Fitting Height Tool
- GLB Directory Service

## Features

- **Real-time Health Monitoring**: Continuous health checks with configurable intervals
- **Performance Metrics**: Response time, error rate, and availability tracking
- **Intelligent Alerting**: Rule-based alerts with escalation and cooldown periods
- **WebSocket Integration**: Real-time dashboard updates
- **Multi-channel Notifications**: Email, Slack, PagerDuty, and webhook support
- **Admin Dashboard**: Comprehensive web interface for monitoring and management
- **RESTful API**: Full API access for integration and automation

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   Health API     │    │  Cloud Run      │
│   Dashboard     │◄──►│   Server         │◄──►│  Services       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       
         │              ┌──────────────────┐             
         └──────────────►│   WebSocket      │             
                        │   Server         │             
                        └──────────────────┘             
                                 │                       
                        ┌──────────────────┐             
                        │  Notification    │             
                        │  Services        │             
                        └──────────────────┘             
```

## Installation

1. **Install Dependencies**
   ```bash
   cd website/api/health
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Service**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API server port | 3001 |
| `WS_PORT` | WebSocket server port | 3002 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | JWT signing secret | - |
| `API_KEY` | API authentication key | - |

### Service URLs

Configure the Cloud Run service URLs:
```env
VIRTUAL_TRY_ON_URL=https://your-service.run.app
PUPILLARY_DISTANCE_URL=https://your-service.run.app
EYEWEAR_FITTING_URL=https://your-service.run.app
GLB_DIRECTORY_URL=https://your-service.run.app
```

### Monitoring Configuration

```env
HEALTH_CHECK_INTERVAL=30000      # 30 seconds
HEALTH_CHECK_TIMEOUT=10000       # 10 seconds
METRICS_RETENTION_DAYS=30        # 30 days
```

### Alert Configuration

```env
ALERT_COOLDOWN_MINUTES=5         # 5 minutes
ALERT_ESCALATION_MINUTES=15      # 15 minutes
MAX_ALERT_RETRIES=3              # 3 retries
```

## API Endpoints

### Health Status
```http
GET /api/health/status
```
Returns overall system health and individual service status.

### Metrics
```http
GET /api/health/metrics?start=2024-01-01&end=2024-01-02
```
Returns aggregated performance metrics with optional time filtering.

### Alerts
```http
GET /api/health/alerts?severity=critical
POST /api/health/alerts/:id/acknowledge
```
Manage active alerts and acknowledgments.

### Configuration
```http
GET /api/health/config
PUT /api/health/config
```
View and update monitoring configuration.

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3002');
```

### Subscribe to Updates
```javascript
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'health-status'
}));
```

### Event Types
- `health-update`: Real-time service status updates
- `alert`: New alert notifications
- `metrics-update`: Performance metrics updates

## Dashboard Integration

The health monitoring system integrates with the VARAi admin panel:

1. **Navigation**: Added "Health" tab to admin panel
2. **Real-time Updates**: WebSocket connection for live data
3. **Interactive Charts**: Chart.js integration for metrics visualization
4. **Alert Management**: In-dashboard alert acknowledgment and management

### Dashboard Features

- **Service Status Cards**: Visual health indicators for each service
- **Performance Charts**: Response time, error rate, and availability graphs
- **Alert Panel**: Active alerts with severity indicators and actions
- **Real-time Connection**: Live status indicator and automatic updates

## Notification Channels

### Email (SMTP)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Slack
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_CHANNEL=#alerts
```

### PagerDuty
```env
PAGERDUTY_INTEGRATION_KEY=your-integration-key
PAGERDUTY_SERVICE_KEY=your-service-key
```

### Webhooks
```env
WEBHOOK_URL=https://your-endpoint.com/alerts
WEBHOOK_SECRET=your-webhook-secret
```

## Monitoring Thresholds

Default thresholds can be configured:

```env
DEFAULT_RESPONSE_TIME_THRESHOLD=2000    # 2 seconds
DEFAULT_ERROR_RATE_THRESHOLD=5          # 5%
DEFAULT_CPU_THRESHOLD=80                # 80%
DEFAULT_MEMORY_THRESHOLD=85             # 85%
```

## Alert Rules

The system supports various alert conditions:

1. **Response Time**: Triggers when response time exceeds threshold
2. **Error Rate**: Triggers when error rate exceeds threshold
3. **Service Availability**: Triggers when service becomes unavailable
4. **Resource Usage**: Triggers on high CPU/memory usage (if available)

## Security

- **API Key Authentication**: All endpoints require valid API key
- **Rate Limiting**: Configurable rate limits to prevent abuse
- **CORS Protection**: Configurable CORS origins
- **Input Validation**: All inputs are validated and sanitized
- **Error Sanitization**: Sensitive information is removed from error messages

## Testing

Run the comprehensive test suite:

```bash
npm test
```

Test coverage includes:
- API endpoint functionality
- WebSocket communication
- Alert management
- Error handling
- Security measures
- Rate limiting

## Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001 3002
CMD ["npm", "start"]
```

### Cloud Run Deployment
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: varai-health-monitoring
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containers:
      - image: gcr.io/your-project/varai-health-monitoring
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
```

## Monitoring and Observability

The system provides comprehensive logging and metrics:

- **Structured Logging**: JSON format with configurable log levels
- **Health Check Metrics**: Response times, success rates, error counts
- **Alert Metrics**: Alert frequency, acknowledgment rates, escalations
- **System Metrics**: Memory usage, CPU usage, connection counts

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**
   - Check firewall settings for port 3002
   - Verify WebSocket server is running
   - Check browser console for connection errors

2. **Service Health Check Failures**
   - Verify service URLs are correct and accessible
   - Check network connectivity to Cloud Run services
   - Review service logs for errors

3. **Alert Notification Failures**
   - Verify notification service credentials
   - Check spam folders for email alerts
   - Test webhook endpoints manually

### Debug Mode

Enable debug logging:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## Contributing

1. Follow the established code style and patterns
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure all tests pass before submitting

## License

MIT License - see LICENSE file for details.