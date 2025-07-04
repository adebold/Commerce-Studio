# VARAi Local Testing Guide

This comprehensive guide provides everything you need to test the VARAi eyewear ML platform locally, including test user accounts, setup instructions, and testing scenarios.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test User Accounts](#test-user-accounts)
3. [Local Environment Setup](#local-environment-setup)
4. [Testing Scenarios](#testing-scenarios)
5. [API Testing](#api-testing)
6. [Frontend Testing](#frontend-testing)
7. [End-to-End Testing](#end-to-end-testing)
8. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ installed
- Python 3.9+ installed

### Launch Local Environment
```bash
# Start all services
make dev

# Or manually with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps
```

### Access Points
- **Frontend Application:** http://localhost:5173
- **Client Portal:** http://localhost:5174
- **API:** http://localhost:8001
- **MongoDB Express:** http://localhost:8081
- **API Documentation:** http://localhost:8001/docs

## Test User Accounts

### Primary Test Accounts

#### 1. Admin Account
- **Email:** `admin@example.com`
- **Password:** `AdminPass456!`
- **Role:** Super Admin
- **Access:** Full system access, administrative functions
- **Use Cases:** 
  - System configuration
  - User management
  - Analytics dashboard
  - Tenant management

#### 2. Regular Test User
- **Email:** `test@example.com`
- **Password:** `Password123!`
- **Role:** Regular User
- **Region:** North America
- **Use Cases:**
  - Virtual try-on
  - Product recommendations
  - Face shape analysis
  - Shopping experience

#### 3. EU Test User
- **Email:** `euuser@example.com`
- **Password:** `Password123!`
- **Role:** Regular User
- **Region:** Europe
- **Use Cases:**
  - GDPR compliance testing
  - EU-specific features
  - Regional content validation

### Specialized Test Accounts

#### Virtual Try-On Testing
- **Email:** `vto-test@example.com`
- **Purpose:** Virtual try-on functionality testing
- **Features:** Camera access, face detection, frame overlay

#### Recommendations Testing
- **Email:** `recommendations-test@example.com`
- **Purpose:** AI recommendation system testing
- **Features:** Personalized recommendations, ML model testing

#### Analytics Testing
- **Email:** `analytics-test@example.com`
- **Purpose:** Analytics and reporting features
- **Features:** Dashboard metrics, A/B testing, performance analytics

#### Manufacturer Test Accounts
- **Standard Tier:** `standard@testeyewear.com`
- **Enterprise Tier:** `enterprise@testeyewear.com`
- **Free Tier:** `free@testeyewear.com`
- **Purpose:** Manufacturer role testing, tier-based features

#### UI Testing Accounts (Auto-generated)
- **Admin UI:** `ui-test-admin@example.com`
- **User UI:** `ui-test-user@example.com`
- **Merchant UI:** `ui-test-merchant@example.com`

## Local Environment Setup

### 1. Environment Configuration

Create `.env.dev` file (already configured):
```bash
# Database
MONGODB_URI=mongodb://localhost:27018/varai_dev
REDIS_URL=redis://localhost:6380

# API Configuration
API_PORT=8001
API_URL=http://localhost:8001

# Frontend Configuration
FRONTEND_PORT=5173
FRONTEND_URL=http://localhost:5173

# Client Portal
CLIENT_PORTAL_PORT=5174
CLIENT_PORTAL_URL=http://localhost:5174
```

### 2. Service Health Check

Verify all services are running:
```bash
# Check Docker containers
docker-compose ps

# Test API health
curl http://localhost:8001/health

# Test frontend
curl http://localhost:5173

# Test MongoDB connection
curl http://localhost:8081
```

### 3. Database Initialization

The system automatically creates test data through setup scripts:
- Test users with proper roles
- Sample eyewear products
- Test analytics data
- Manufacturer accounts

## Testing Scenarios

### 1. User Authentication Flow

#### Login Testing
```bash
# Test admin login
POST http://localhost:8001/auth/login
{
  "email": "admin@example.com",
  "password": "AdminPass456!"
}

# Test regular user login
POST http://localhost:8001/auth/login
{
  "email": "test@example.com",
  "password": "Password123!"
}
```

#### Frontend Login Testing
1. Navigate to http://localhost:5173/login
2. Use test credentials
3. Verify dashboard access
4. Test logout functionality

### 2. Virtual Try-On Testing

#### Prerequisites
- Camera-enabled device or test images
- Test user account: `vto-test@example.com`

#### Test Steps
1. Login with VTO test account
2. Navigate to Virtual Try-On page
3. Upload test image or use camera
4. Select eyewear frames
5. Verify overlay accuracy
6. Test save/share functionality

#### Test Images Location
```
tests/fixtures/
├── face-front.jpg
├── face-side.jpg
├── face-angle.jpg
├── no-face.jpg
└── multiple-faces.jpg
```

### 3. Recommendation System Testing

#### Test Account
- **Email:** `recommendations-test@example.com`

#### Test Scenarios
1. **Cold Start Recommendations**
   - Login with new user
   - Verify default recommendations
   - Test face shape-based suggestions

2. **Personalized Recommendations**
   - Browse products
   - Add items to favorites
   - Verify recommendation updates

3. **ML Model Testing**
   - Test different face shapes
   - Verify compatibility scores
   - Test recommendation accuracy

### 4. Analytics Dashboard Testing

#### Admin Analytics
- **Account:** `admin@example.com`
- **Access:** http://localhost:5173/admin/analytics

#### Test Metrics
1. User engagement metrics
2. Product performance data
3. A/B testing results
4. Conversion analytics
5. Regional performance (NA vs EU)

### 5. Manufacturer Portal Testing

#### Test Accounts by Tier
- **Free:** `free@testeyewear.com`
- **Standard:** `standard@testeyewear.com`
- **Enterprise:** `enterprise@testeyewear.com`

#### Test Features
1. Product catalog management
2. Usage limits by tier
3. Analytics access levels
4. API rate limiting
5. Multi-factor authentication

## API Testing

### Authentication Endpoints
```bash
# Login
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get user profile
curl -X GET http://localhost:8001/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Refresh token
curl -X POST http://localhost:8001/auth/refresh \
  -H "Authorization: Bearer YOUR_REFRESH_TOKEN"
```

### Product Endpoints
```bash
# Get products
curl -X GET http://localhost:8001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get product by ID
curl -X GET http://localhost:8001/api/products/{product_id} \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get recommendations
curl -X GET http://localhost:8001/api/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Virtual Try-On Endpoints
```bash
# Upload image for analysis
curl -X POST http://localhost:8001/api/vto/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-face.jpg"

# Get face shape analysis
curl -X GET http://localhost:8001/api/vto/face-shape \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Testing

### Component Testing
```bash
# Run frontend tests
cd frontend
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx
```

### E2E Testing with Playwright
```bash
# Install dependencies
npm install

# Run E2E tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed

# Run specific test
npx playwright test login.spec.ts
```

## End-to-End Testing

### Test Suites

#### 1. User Journey Tests
- Registration → Login → Profile Setup → VTO → Purchase
- Guest browsing → Account creation → Recommendations

#### 2. Admin Workflow Tests
- Admin login → User management → Analytics review
- Tenant configuration → Feature toggles

#### 3. Manufacturer Tests
- Account setup → Product upload → Analytics review
- Tier upgrade → Feature access validation

### Running E2E Tests
```bash
# Full E2E test suite
npm run test:e2e:full

# Smoke tests only
npm run test:e2e:smoke

# Specific browser
npx playwright test --project=chromium
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check Docker status
docker-compose ps

# View logs
docker-compose logs api
docker-compose logs frontend

# Restart services
docker-compose restart
```

#### 2. Database Connection Issues
```bash
# Check MongoDB status
docker-compose logs mongodb

# Connect to MongoDB directly
docker-compose exec mongodb mongo

# Reset database
docker-compose down -v
docker-compose up -d
```

#### 3. Authentication Issues
```bash
# Clear browser storage
# Check token expiration
# Verify user exists in database

# Reset test users
npm run setup:test-users
```

#### 4. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :8001

# Kill process using port
sudo kill -9 $(lsof -t -i:8001)

# Use different ports in .env.dev
```

### Test Data Reset

#### Reset All Test Data
```bash
# Stop services
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for initialization
sleep 30

# Verify test users
curl http://localhost:8001/auth/test-users
```

#### Reset Specific Data
```bash
# Reset user data only
npm run reset:users

# Reset product data only
npm run reset:products

# Reset analytics data
npm run reset:analytics
```

### Performance Testing

#### Load Testing
```bash
# Install k6
npm install -g k6

# Run load tests
k6 run tests/performance/load-test.js

# Stress testing
k6 run tests/performance/stress-test.js
```

#### Memory and CPU Monitoring
```bash
# Monitor Docker containers
docker stats

# Monitor specific service
docker stats eyewear-ml-api-1
```

## Test Automation

### CI/CD Integration
The testing suite integrates with CI/CD pipelines:
- Automated test execution on PR
- Coverage reporting
- Performance regression detection
- Security vulnerability scanning

### Test Reporting
- Coverage reports: `coverage/lcov-report/index.html`
- E2E test reports: `test-results/`
- Performance reports: `performance-results/`

## Best Practices

### 1. Test Data Management
- Use dedicated test accounts
- Reset data between test runs
- Maintain test data consistency
- Document test scenarios

### 2. Test Environment Isolation
- Use separate databases for testing
- Mock external services
- Avoid production data in tests
- Clean up after tests

### 3. Test Maintenance
- Update tests with feature changes
- Remove obsolete tests
- Monitor test performance
- Fix flaky tests promptly

## Support

For testing support and questions:
- Check logs: `docker-compose logs`
- Review documentation: `docs/`
- Create issue: GitHub Issues
- Contact team: development team

---

**Last Updated:** December 2024
**Version:** 1.0.0