# Manufacturer Role Test Suite

Comprehensive test-driven development (TDD) implementation for the manufacturer role feature in the eyewear ML platform. This test suite addresses all critical requirements identified in `test_specs_manufacturer_role_LS6.md` and follows the TDD principles outlined in the project's testing guidelines.

## Overview

The manufacturer role introduces business-critical functionality including:
- **Manufacturer Authentication & Authorization**: Secure onboarding and role-based access control
- **Centralized Product Repository**: High-performance product management with real database operations
- **Agentic Onboarding & Conversion Tracking**: AI-driven personalization and business intelligence
- **ML Tools Integration**: Face shape analysis, style matching, and virtual try-on capabilities
- **Dashboard Access Control**: Tier-based feature gating and security compliance

## Test Suite Architecture

### 🔴 RED PHASE (Current Status)
All tests are designed to **FAIL INITIALLY** until real implementations are created. This follows TDD principles where tests define the expected behavior before implementation.

```
tests/manufacturer_role/
├── test_manufacturer_authentication.py      # Security & auth tests
├── test_product_repository_performance.py   # Performance & scalability tests
├── test_agentic_conversion_tracking.py      # Business intelligence tests
├── test_ml_tools_integration.py            # ML service integration tests
├── test_dashboard_access_control.py        # RBAC & compliance tests
├── run_manufacturer_tests.py               # Comprehensive test runner
├── requirements-test.txt                   # Test dependencies
└── README.md                               # This file
```

## Test Categories

### 🔒 Security Tests (`test_manufacturer_authentication.py`)
- **Manufacturer Registration Security**: Password policies, email verification, duplicate prevention
- **Authentication Flow Validation**: JWT token handling, session management, MFA support
- **Password Security**: Hashing, complexity requirements, breach detection
- **Session Management**: Token refresh, concurrent sessions, security logging
- **Data Protection**: PII encryption, GDPR compliance, audit trails

**Critical Requirements:**
- Real JWT token generation and validation (NO MOCKS)
- Actual password hashing with bcrypt/argon2
- Real database operations for user management
- Performance: Authentication < 500ms, Token validation < 100ms

### ⚡ Performance Tests (`test_product_repository_performance.py`)
- **Product Upload Performance**: Bulk operations, concurrent uploads, memory efficiency
- **Search & Retrieval**: Query optimization, indexing strategies, caching
- **Database Operations**: Connection pooling, transaction management, failover
- **Scalability Testing**: Load testing, stress testing, resource monitoring
- **Cache Management**: Redis integration, cache invalidation, hit ratios

**Critical Requirements:**
- Real MongoDB operations with test containers
- Product upload rate: >30 products/second
- Search response time: <100ms for 10K+ products
- Memory usage: <500MB for 1K concurrent operations

### 🤖 Agentic Tests (`test_agentic_conversion_tracking.py`)
- **Personalized Onboarding**: Dynamic flow adaptation, user profiling, A/B testing
- **Conversion Tracking**: Event attribution, funnel analysis, revenue tracking
- **Upgrade Prompts**: Tier-based messaging, conversion optimization, timing analysis
- **Business Intelligence**: Analytics integration, reporting, predictive modeling
- **User Experience**: Flow optimization, engagement metrics, retention analysis

**Critical Requirements:**
- Real analytics event tracking (NO MOCKS)
- A/B testing with statistical significance
- Conversion attribution accuracy >95%
- Real-time personalization <200ms response time

### 🧠 ML Integration Tests (`test_ml_tools_integration.py`)
- **Face Shape Analysis**: Real ML model integration, accuracy validation, performance testing
- **Style Matching**: Algorithm effectiveness, recommendation quality, personalization
- **Virtual Try-On**: 3D model processing, rendering performance, accuracy metrics
- **Batch Processing**: ML pipeline efficiency, queue management, error handling
- **Service Reliability**: Failover mechanisms, circuit breakers, monitoring

**Critical Requirements:**
- Real ML service integration (NO MOCKS)
- Face shape analysis accuracy >90%
- Style matching relevance score >0.8
- VTO rendering time <2 seconds
- Batch processing: >100 analyses/minute

### 🛡️ Access Control Tests (`test_dashboard_access_control.py`)
- **Role-Based Access Control**: Permission validation, tier-based restrictions, real-time checks
- **Feature Gating**: Subscription tier enforcement, usage limits, upgrade prompts
- **Session Management**: Token validation, concurrent sessions, security policies
- **Audit Logging**: Compliance reporting, security events, access trails
- **Dashboard Security**: UI access control, API endpoint protection, data isolation

**Critical Requirements:**
- Real permission validation (NO HARDCODED RESPONSES)
- Permission check performance <100ms
- Complete audit trail for compliance
- Real-time session validation
- Tier-based feature enforcement

## Installation & Setup

### Prerequisites
- Python 3.9+
- MongoDB 5.0+ (for real database testing)
- Redis 6.0+ (for caching tests)
- Docker & Docker Compose (for test containers)

### Install Dependencies
```bash
# Install test dependencies
pip install -r requirements-test.txt

# Install project dependencies
pip install -r ../../requirements.txt

# Set up test environment
export MONGODB_TEST_URI="mongodb://localhost:27017/eyewear_ml_test"
export REDIS_TEST_URI="redis://localhost:6379/0"
export JWT_SECRET_KEY="test_secret_key_change_in_production"
```

### Database Setup
```bash
# Start test containers
docker-compose -f docker-compose.test.yml up -d

# Run database migrations
python -m alembic upgrade head

# Seed test data
python setup_test_data.py
```

## Running Tests

### Quick Start
```bash
# Run all manufacturer role tests
python run_manufacturer_tests.py

# Run with verbose output
python run_manufacturer_tests.py --verbose

# Run specific test category
python run_manufacturer_tests.py --filter security

# Skip slow tests (for CI)
python run_manufacturer_tests.py --quick
```

### Individual Test Modules
```bash
# Security tests only
pytest test_manufacturer_authentication.py -v -m security

# Performance tests only
pytest test_product_repository_performance.py -v -m performance

# Agentic flow tests only
pytest test_agentic_conversion_tracking.py -v -m agentic

# ML integration tests only
pytest test_ml_tools_integration.py -v -m integration

# Access control tests only
pytest test_dashboard_access_control.py -v -m security
```

### Test Markers
- `security`: Security and authentication tests
- `performance`: Performance and scalability tests
- `agentic`: Agentic onboarding and conversion tests
- `integration`: ML tools integration tests
- `slow`: Long-running tests (>30 seconds)
- `database`: Tests requiring real database operations
- `ml`: Tests requiring ML service integration

## Expected Test Results (RED PHASE)

### Current Status: ALL TESTS SHOULD FAIL
This is the expected behavior in the RED phase of TDD. Tests are designed to fail until implementations are created.

### Typical Failure Messages
```
ImportError: No module named 'src.auth.manufacturer_auth_manager'
ImportError: No module named 'src.repositories.product_repository'
ImportError: No module named 'src.ml.face_shape_analyzer'
ImportError: No module named 'src.agentic.onboarding_manager'
ImportError: No module named 'src.auth.rbac_manager'
```

### Implementation Priority Order
1. **CRITICAL**: `ManufacturerAuthManager` - Core authentication system
2. **CRITICAL**: `ProductRepository` - Database operations foundation
3. **CRITICAL**: `RBACManager` - Security and access control
4. **HIGH**: `AgenticOnboardingManager` - Business intelligence core
5. **HIGH**: `MLServiceManager` - ML tools integration
6. **MEDIUM**: `ConversionTracker` - Analytics and reporting
7. **MEDIUM**: `VirtualTryOnService` - Advanced ML features
8. **LOW**: `SecurityAuditLogger` - Compliance reporting

## Performance Benchmarks

### Target Performance Metrics
| Operation | Target | Measurement Method |
|-----------|--------|-------------------|
| User Authentication | <500ms | End-to-end login flow |
| Token Validation | <100ms | JWT decode and verify |
| Product Upload | >30/sec | Bulk upload throughput |
| Product Search | <100ms | Query response time |
| Permission Check | <100ms | RBAC validation |
| ML Face Analysis | <2s | Single image processing |
| VTO Rendering | <2s | 3D model generation |
| Cache Hit Ratio | >80% | Redis performance |

### Load Testing Scenarios
- **Concurrent Users**: 1000 simultaneous manufacturer logins
- **Product Upload**: 10,000 products uploaded in parallel
- **Search Load**: 1000 concurrent product searches
- **ML Processing**: 100 simultaneous face shape analyses
- **Permission Checks**: 10,000 concurrent RBAC validations

## Security Requirements

### Authentication Security
- Password complexity: 12+ chars, mixed case, numbers, symbols
- Password hashing: bcrypt with cost factor 12+
- JWT tokens: RS256 algorithm, 15-minute expiry
- Session management: Secure cookies, CSRF protection
- MFA support: TOTP, SMS, email verification

### Data Protection
- PII encryption: AES-256 for sensitive data
- Database encryption: TDE for MongoDB
- Transport security: TLS 1.3 for all connections
- Audit logging: All access attempts and changes
- GDPR compliance: Data portability and deletion

### Access Control
- Role-based permissions: Manufacturer, Admin, Support
- Tier-based features: Free, Basic, Professional, Enterprise
- API rate limiting: Per-tier request limits
- Resource quotas: Storage, compute, API calls
- Real-time validation: No cached permission decisions

## Business Intelligence Requirements

### Conversion Tracking
- Event attribution: Multi-touch attribution modeling
- Funnel analysis: Step-by-step conversion tracking
- A/B testing: Statistical significance validation
- Revenue attribution: Accurate ROI calculation
- Cohort analysis: User behavior over time

### Personalization
- Dynamic onboarding: Flow adaptation based on user profile
- Content personalization: Tier-appropriate messaging
- Recommendation engine: ML-driven product suggestions
- Behavioral targeting: Action-based customization
- Predictive analytics: Churn prediction and prevention

## ML Integration Requirements

### Face Shape Analysis
- Model accuracy: >90% classification accuracy
- Processing speed: <2 seconds per image
- Batch processing: >100 analyses per minute
- Model versioning: A/B testing for model improvements
- Fallback handling: Graceful degradation on service failure

### Style Matching
- Recommendation relevance: >0.8 relevance score
- Personalization: User preference learning
- Inventory integration: Real-time availability checking
- Performance: <200ms recommendation generation
- Quality metrics: Click-through and conversion rates

### Virtual Try-On
- 3D model accuracy: Realistic face mapping
- Rendering performance: <2 seconds for model generation
- Mobile optimization: Responsive design and performance
- Quality assurance: Automated visual regression testing
- User experience: Intuitive interface and controls

## Compliance & Audit

### Regulatory Compliance
- GDPR: Data protection and user rights
- CCPA: California privacy regulations
- HIPAA: Healthcare data protection (if applicable)
- SOC 2: Security and availability controls
- PCI DSS: Payment card data security

### Audit Requirements
- Access logging: All user actions and system access
- Change tracking: Database and configuration changes
- Security events: Authentication failures, permission denials
- Performance monitoring: System health and response times
- Compliance reporting: Automated compliance status reports

## Troubleshooting

### Common Issues

#### Test Environment Setup
```bash
# MongoDB connection issues
docker-compose -f docker-compose.test.yml restart mongodb

# Redis connection issues
docker-compose -f docker-compose.test.yml restart redis

# Permission issues
chmod +x run_manufacturer_tests.py
```

#### Test Execution Issues
```bash
# Clear test cache
pytest --cache-clear

# Run tests in isolation
pytest --forked

# Debug specific test
pytest test_manufacturer_authentication.py::TestManufacturerAuth::test_registration_security -v -s
```

#### Performance Issues
```bash
# Profile test execution
python -m cProfile run_manufacturer_tests.py

# Memory profiling
python -m memory_profiler run_manufacturer_tests.py

# Check resource usage
docker stats
```

### Getting Help
- Review test failure messages for implementation guidance
- Check the TDD implementation roadmap in project documentation
- Consult the reflection reports for known issues and solutions
- Follow the red-green-refactor cycle for systematic implementation

## Contributing

### Adding New Tests
1. Follow the existing test structure and naming conventions
2. Ensure tests fail initially (RED phase requirement)
3. Include performance benchmarks and security validations
4. Add comprehensive docstrings explaining test purpose
5. Update this README with new test descriptions

### Test Quality Standards
- **No Mocks for Critical Paths**: Use real implementations for core functionality
- **Performance Assertions**: Include timing and resource usage checks
- **Security Validation**: Test both positive and negative security scenarios
- **Error Handling**: Test failure modes and edge cases
- **Documentation**: Clear test descriptions and expected behaviors

### Code Review Checklist
- [ ] Tests follow TDD red-green-refactor cycle
- [ ] Real database operations (no mocks for data layer)
- [ ] Performance benchmarks included
- [ ] Security scenarios covered
- [ ] Error handling tested
- [ ] Documentation updated
- [ ] Test markers applied correctly
- [ ] Dependencies added to requirements-test.txt

## Next Steps

### Implementation Roadmap
1. **Phase 1**: Implement core authentication and authorization systems
2. **Phase 2**: Build product repository with performance optimization
3. **Phase 3**: Develop ML service integration layer
4. **Phase 4**: Create agentic onboarding and conversion tracking
5. **Phase 5**: Implement comprehensive audit logging and compliance

### Success Criteria
- All tests pass (GREEN phase)
- Performance benchmarks met
- Security requirements satisfied
- Business intelligence features functional
- ML integration operational
- Compliance requirements fulfilled

The manufacturer role test suite provides a comprehensive foundation for implementing business-critical functionality with confidence, security, and performance at scale.