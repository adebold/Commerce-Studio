# VARAi Connected Apps Technical Specifications

## 🔧 API Specifications

### Apps Management API

#### GET /api/v1/apps
List all available apps with filtering and pagination.

```json
{
  "apps": [
    {
      "id": "vto-001",
      "name": "Virtual Try-On",
      "description": "AI-powered virtual eyewear fitting",
      "category": "ai_vision",
      "token_cost": 5,
      "status": "available",
      "features": ["3D rendering", "Face detection", "Real-time preview"],
      "configuration_schema": {
        "widget_placement": {
          "type": "select",
          "options": ["product_page", "collection_page", "cart_page"],
          "default": "product_page"
        },
        "style_customization": {
          "type": "object",
          "properties": {
            "button_color": {"type": "string", "default": "#007bff"},
            "button_text": {"type": "string", "default": "Try On"}
          }
        }
      },
      "pricing_tier": "professional",
      "documentation_url": "/docs/apps/virtual-try-on"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 10,
    "total_pages": 1
  }
}
```

#### POST /api/v1/customer/apps/{app_id}/activate
Activate an app for the authenticated customer.

```json
{
  "configuration": {
    "widget_placement": "product_page",
    "style_customization": {
      "button_color": "#ff6b35",
      "button_text": "Try It On"
    }
  }
}
```

Response:
```json
{
  "success": true,
  "activation_id": "ca-12345",
  "app": {
    "id": "vto-001",
    "name": "Virtual Try-On",
    "status": "active",
    "activated_at": "2024-01-15T10:30:00Z"
  },
  "embed_code": "<script src='https://cdn.varai.com/apps/vto/embed.js' data-customer-id='cust-123' data-config='...'></script>"
}
```

### Token Management API

#### GET /api/v1/customer/tokens/usage
Get current token usage and remaining balance.

```json
{
  "current_period": {
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-01-31T23:59:59Z",
    "tokens_used": 2847,
    "tokens_remaining": 7153,
    "tokens_total": 10000
  },
  "usage_by_app": [
    {
      "app_id": "vto-001",
      "app_name": "Virtual Try-On",
      "tokens_consumed": 1250,
      "sessions": 250,
      "avg_tokens_per_session": 5.0
    },
    {
      "app_id": "rec-001",
      "app_name": "Eyewear Recommendations",
      "tokens_consumed": 896,
      "sessions": 448,
      "avg_tokens_per_session": 2.0
    }
  ],
  "daily_usage": [
    {"date": "2024-01-14", "tokens": 127},
    {"date": "2024-01-15", "tokens": 89}
  ]
}
```

#### POST /api/v1/customer/tokens/consume
Internal API for consuming tokens when apps are used.

```json
{
  "app_id": "vto-001",
  "tokens_consumed": 5,
  "session_id": "sess-abc123",
  "metadata": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1",
    "product_id": "frame-001",
    "processing_time_ms": 1250
  }
}
```

### Billing API

#### GET /api/v1/customer/billing/plans
List available billing plans.

```json
{
  "plans": [
    {
      "id": "starter",
      "name": "Starter",
      "tokens_per_month": 1000,
      "price_cents": 2900,
      "billing_cycle": "monthly",
      "features": ["Basic apps access", "Email support"],
      "stripe_price_id": "price_starter_monthly"
    },
    {
      "id": "professional",
      "name": "Professional",
      "tokens_per_month": 10000,
      "price_cents": 19900,
      "billing_cycle": "monthly",
      "features": ["All apps access", "Priority support", "Advanced analytics"],
      "stripe_price_id": "price_pro_monthly"
    }
  ]
}
```

#### POST /api/v1/customer/billing/subscribe
Subscribe to a billing plan.

```json
{
  "plan_id": "professional",
  "payment_method_id": "pm_1234567890"
}
```

## 🗄️ Database Schema Design

### Core Tables

```sql
-- Apps catalog
CREATE TABLE apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    token_cost INTEGER NOT NULL CHECK (token_cost > 0),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'beta', 'deprecated', 'disabled')),
    configuration_schema JSONB NOT NULL DEFAULT '{}',
    documentation_url VARCHAR(255),
    icon_url VARCHAR(255),
    pricing_tier VARCHAR(20) DEFAULT 'starter' CHECK (pricing_tier IN ('starter', 'professional', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer app activations
CREATE TABLE customer_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
    configuration JSONB NOT NULL DEFAULT '{}',
    embed_code TEXT,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(customer_id, app_id)
);

-- Token usage tracking
CREATE TABLE token_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    tokens_consumed INTEGER NOT NULL CHECK (tokens_consumed > 0),
    session_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing plans
CREATE TABLE billing_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    tokens_per_month INTEGER NOT NULL CHECK (tokens_per_month >= -1), -- -1 for unlimited
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    stripe_price_id VARCHAR(100) UNIQUE,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer billing subscriptions
CREATE TABLE customer_billing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL REFERENCES billing_plans(id),
    stripe_subscription_id VARCHAR(100) UNIQUE,
    stripe_customer_id VARCHAR(100),
    tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
    tokens_remaining INTEGER,
    billing_cycle_start TIMESTAMP WITH TIME ZONE,
    billing_cycle_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'unpaid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id)
);

-- Token purchase history (for pay-as-you-go)
CREATE TABLE token_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tokens_purchased INTEGER NOT NULL CHECK (tokens_purchased > 0),
    price_cents INTEGER NOT NULL CHECK (price_cents > 0),
    stripe_payment_intent_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage analytics aggregations
CREATE TABLE usage_analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tokens_consumed INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    avg_processing_time_ms DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, app_id, date)
);
```

### Indexes for Performance

```sql
-- Token usage indexes
CREATE INDEX idx_token_usage_customer_created ON token_usage(customer_id, created_at DESC);
CREATE INDEX idx_token_usage_app_created ON token_usage(app_id, created_at DESC);
CREATE INDEX idx_token_usage_session ON token_usage(session_id);
CREATE INDEX idx_token_usage_created_at ON token_usage(created_at);

-- Customer apps indexes
CREATE INDEX idx_customer_apps_customer ON customer_apps(customer_id);
CREATE INDEX idx_customer_apps_status ON customer_apps(status);
CREATE INDEX idx_customer_apps_last_used ON customer_apps(last_used_at DESC);

-- Analytics indexes
CREATE INDEX idx_usage_analytics_customer_date ON usage_analytics_daily(customer_id, date DESC);
CREATE INDEX idx_usage_analytics_app_date ON usage_analytics_daily(app_id, date DESC);

-- Billing indexes
CREATE INDEX idx_customer_billing_customer ON customer_billing(customer_id);
CREATE INDEX idx_customer_billing_stripe_sub ON customer_billing(stripe_subscription_id);
CREATE INDEX idx_customer_billing_cycle ON customer_billing(billing_cycle_start, billing_cycle_end);
```

## 🔐 Security Specifications

### Authentication & Authorization

```python
# JWT Token Structure
{
  "sub": "customer_id",
  "iss": "varai.com",
  "aud": "connected-apps",
  "exp": 1640995200,
  "iat": 1640908800,
  "scope": ["apps:read", "apps:activate", "tokens:consume", "billing:manage"],
  "plan": "professional",
  "tokens_remaining": 7153
}

# API Key Structure for App Embeds
{
  "key_id": "ak_live_1234567890",
  "customer_id": "cust_123",
  "app_permissions": ["vto-001", "rec-001"],
  "rate_limit": 1000, # requests per hour
  "expires_at": "2024-12-31T23:59:59Z"
}
```

### Rate Limiting

```yaml
rate_limits:
  apps_api:
    - endpoint: "/api/v1/apps"
      limit: "100/hour"
      scope: "customer"
    
    - endpoint: "/api/v1/customer/apps/*/activate"
      limit: "10/hour"
      scope: "customer"
  
  token_consumption:
    - endpoint: "/api/v1/customer/tokens/consume"
      limit: "10000/hour"
      scope: "customer"
      burst: 100
  
  billing_api:
    - endpoint: "/api/v1/customer/billing/*"
      limit: "50/hour"
      scope: "customer"
```

### Data Encryption

```yaml
encryption:
  at_rest:
    - database: "AES-256 encryption"
    - backups: "AES-256 encryption"
    - logs: "AES-256 encryption"
  
  in_transit:
    - api_calls: "TLS 1.3"
    - webhooks: "TLS 1.3 + HMAC signature"
    - database: "TLS 1.3"
  
  sensitive_fields:
    - stripe_customer_id: "encrypted"
    - payment_method_data: "tokenized via Stripe"
    - api_keys: "hashed with bcrypt"
```

## 📊 Monitoring & Analytics

### Key Metrics to Track

```yaml
business_metrics:
  - name: "Monthly Recurring Revenue (MRR)"
    calculation: "SUM(active_subscriptions.price_cents) / 100"
    frequency: "daily"
  
  - name: "Token Consumption Rate"
    calculation: "AVG(daily_token_usage) / plan_token_limit"
    frequency: "hourly"
  
  - name: "App Adoption Rate"
    calculation: "COUNT(active_apps) / COUNT(customers)"
    frequency: "daily"

technical_metrics:
  - name: "API Response Time"
    target: "< 200ms p95"
    alert_threshold: "> 500ms p95"
  
  - name: "Token Consumption Accuracy"
    target: "100%"
    alert_threshold: "< 99.9%"
  
  - name: "Billing Sync Success Rate"
    target: "> 99.5%"
    alert_threshold: "< 99%"

user_experience_metrics:
  - name: "App Activation Success Rate"
    target: "> 95%"
    alert_threshold: "< 90%"
  
  - name: "Time to First Token Consumption"
    target: "< 5 minutes"
    alert_threshold: "> 10 minutes"
```

### Alerting Configuration

```yaml
alerts:
  critical:
    - name: "Token Consumption Service Down"
      condition: "service_health.token_service == false"
      notification: ["slack", "pagerduty", "email"]
    
    - name: "Billing Sync Failure"
      condition: "billing_sync_errors > 10 in 5m"
      notification: ["slack", "pagerduty"]
  
  warning:
    - name: "High Token Consumption"
      condition: "hourly_token_usage > 1.5 * avg_hourly_usage"
      notification: ["slack"]
    
    - name: "Low App Adoption"
      condition: "daily_app_activations < 0.5 * avg_daily_activations"
      notification: ["slack"]
```

## 🧪 Testing Strategy

### Unit Tests

```python
# Example test structure
class TestTokenConsumption:
    def test_consume_tokens_success(self):
        # Test successful token consumption
        pass
    
    def test_consume_tokens_insufficient_balance(self):
        # Test token consumption with insufficient balance
        pass
    
    def test_consume_tokens_invalid_app(self):
        # Test token consumption for non-existent app
        pass

class TestBillingIntegration:
    def test_stripe_webhook_subscription_created(self):
        # Test Stripe subscription creation webhook
        pass
    
    def test_stripe_webhook_payment_failed(self):
        # Test Stripe payment failure webhook
        pass
```

### Integration Tests

```python
class TestConnectedAppsFlow:
    def test_complete_app_activation_flow(self):
        # Test: Browse apps → Activate → Configure → Use → Track tokens
        pass
    
    def test_billing_upgrade_flow(self):
        # Test: Reach token limit → Upgrade plan → Continue usage
        pass
    
    def test_app_deactivation_flow(self):
        # Test: Deactivate app → Stop token consumption → Remove embed
        pass
```

### Load Tests

```yaml
load_tests:
  token_consumption:
    scenario: "Simulate 1000 concurrent token consumption requests"
    duration: "10 minutes"
    target_rps: 100
    success_criteria: "< 200ms p95, 0% errors"
  
  app_activation:
    scenario: "Simulate 100 concurrent app activations"
    duration: "5 minutes"
    target_rps: 20
    success_criteria: "< 500ms p95, < 1% errors"
```

## 🚀 Deployment Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/varai_connected_apps
REDIS_URL=redis://host:6379/0

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# API Configuration
JWT_SECRET=your-jwt-secret
API_RATE_LIMIT_REDIS_URL=redis://host:6379/1
CORS_ORIGINS=https://app.varai.com,https://varai.com

# Monitoring
SENTRY_DSN=https://...
DATADOG_API_KEY=...
LOG_LEVEL=INFO

# Feature Flags
ENABLE_TOKEN_ANALYTICS=true
ENABLE_USAGE_ALERTS=true
ENABLE_BETA_APPS=false
```

### Docker Configuration

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "app:app"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: connected-apps-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: connected-apps-api
  template:
    metadata:
      labels:
        app: connected-apps-api
    spec:
      containers:
      - name: api
        image: varai/connected-apps-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: connected-apps-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

This technical specification provides the detailed implementation guidance needed to build the Connected Apps feature with robust token-based billing, comprehensive monitoring, and enterprise-grade security.