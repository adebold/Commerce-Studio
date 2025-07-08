# Enterprise Batched Implementation Prompts - Store Generation Service Foundation [LS2]

## Critical Implementation Overview

Based on comprehensive analysis from [`test_specs_LS1.md`](test_specs_LS1.md) and [`prompts_LS2.md`](prompts_LS2.md), the Store Generation Service Foundation requires complete enterprise rewrite. Current scores (Overall: 4.7/10, Security: 4.0/10, Coverage: 2.0/10) fail all minimum thresholds (>8.5/10).

**MANDATORY**: Previous primitive implementations must be completely replaced with enterprise-grade solutions that pass all test specifications and achieve >95% test coverage.

---

## BATCH 1: Security & Foundation Components

### BATCH1_ENTERPRISE_TEMPLATE_ENGINE_SECURITY

**Critical Security Replacement Required**

Replace dangerous string replacement template engine with enterprise Jinja2 implementation featuring comprehensive security framework, XSS prevention, and template injection protection.

**Implementation Requirements:**
- **File Location**: [`src/template_engine/enterprise_template_engine.py`](src/template_engine/enterprise_template_engine.py)
- **Security Framework**: [`src/template_engine/template_security.py`](src/template_engine/template_security.py)
- **Template Showcase**: [`src/template_engine/template_showcase.py`](src/template_engine/template_showcase.py)

**Core Security Components:**
```python
class EnterpriseTemplateEngine:
    """Enterprise-grade template engine with comprehensive security."""
    
    def __init__(self):
        # Jinja2 with security-focused configuration
        self.environment = Environment(
            autoescape=select_autoescape(['html', 'xml']),
            loader=FileSystemLoader('templates'),
            enable_async=True,
            undefined=StrictUndefined,
            trim_blocks=True,
            lstrip_blocks=True,
            extensions=['jinja2.ext.do', 'jinja2.ext.loopcontrols']
        )
        self.security_framework = TemplateSecurityFramework()
        self.input_validator = InputValidator()
        
    async def render_secure_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """Render template with comprehensive security validation."""
        # Input validation and sanitization
        validated_context = await self.security_framework.validate_context(context)
        sanitized_context = await self.security_framework.sanitize_context(validated_context)
        
        # Template security checks
        template = self.environment.get_template(template_name)
        await self.security_framework.validate_template(template)
        
        # Secure rendering with timeout and resource limits
        return await self._render_with_security(template, sanitized_context)

class TemplateSecurityFramework:
    """Comprehensive template security framework."""
    
    def __init__(self):
        self.sanitizer = bleach.Cleaner(
            tags=['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
            attributes={},
            strip=True
        )
        self.max_template_size = 1024 * 1024  # 1MB
        self.max_execution_time = 5.0  # seconds
        
    async def validate_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate all context variables for security."""
        validated = {}
        for key, value in context.items():
            if not self._is_safe_key(key):
                raise SecurityError(f"Unsafe context key: {key}")
            validated[key] = await self._validate_value(value)
        return validated
        
    async def sanitize_context(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize context variables to prevent XSS."""
        sanitized = {}
        for key, value in context.items():
            if isinstance(value, str):
                sanitized[key] = self.sanitizer.clean(value)
            else:
                sanitized[key] = value
        return sanitized
```

**Security Requirements:**
- XSS prevention with bleach sanitization
- Template injection protection with sandboxing
- Input validation for all context variables
- Size limits (1MB templates, 5s execution timeout)
- Audit logging for all template operations
- CSP header generation for rendered content

**Performance Requirements:**
- Template rendering <100ms per template
- Memory usage <50MB per rendering operation
- Cache hit ratio >90% for frequently used templates
- Concurrent rendering support for 100+ simultaneous requests

**Test Implementation:**
- [`tests/template_engine/test_enterprise_security.py`](tests/template_engine/test_enterprise_security.py)
- XSS attack prevention validation
- Template injection attack testing
- Input validation comprehensive coverage
- Performance benchmark testing

**Expected Score Improvement:**
- Security: 4.0 → >8.5
- Performance: Template rendering <100ms
- Coverage: Security framework >95%

---

### BATCH1_MULTI_TENANT_SECURITY_FRAMEWORK

**Complete Multi-Tenant Implementation Required**

Implement comprehensive multi-tenant management with complete data isolation, access controls, security framework, and tenant-specific customizations for enterprise deployment.

**Implementation Requirements:**
- **File Location**: [`src/multi_tenant/tenant_manager.py`](src/multi_tenant/tenant_manager.py)
- **Security Framework**: [`src/multi_tenant/security_framework.py`](src/multi_tenant/security_framework.py)
- **Data Isolation**: [`src/multi_tenant/data_isolation.py`](src/multi_tenant/data_isolation.py)

**Core Multi-Tenant Components:**
```python
class TenantManager:
    """Enterprise multi-tenant management system."""
    
    def __init__(self):
        self.security_framework = TenantSecurityFramework()
        self.data_isolator = TenantDataIsolation()
        self.resource_manager = TenantResourceManager()
        self.audit_logger = TenantAuditLogger()
        
    async def create_tenant(self, tenant_config: TenantConfiguration) -> Tenant:
        """Create new tenant with complete isolation."""
        # Validate tenant configuration
        validated_config = await self.security_framework.validate_tenant_config(tenant_config)
        
        # Create isolated database collections
        collections = await self.data_isolator.create_tenant_collections(validated_config.tenant_id)
        
        # Set up resource quotas
        quotas = await self.resource_manager.allocate_resources(validated_config)
        
        # Initialize security context
        security_context = await self.security_framework.create_security_context(validated_config)
        
        tenant = Tenant(
            id=validated_config.tenant_id,
            configuration=validated_config,
            collections=collections,
            resource_quotas=quotas,
            security_context=security_context
        )
        
        await self.audit_logger.log_tenant_creation(tenant)
        return tenant

class TenantSecurityFramework:
    """Comprehensive tenant security and access control."""
    
    async def validate_tenant_access(self, tenant_id: str, user_context: UserContext) -> bool:
        """Validate user access to tenant resources."""
        # Multi-factor authentication
        auth_result = await self.auth_manager.authenticate_user(user_context)
        if not auth_result.is_valid:
            return False
            
        # Authorization check
        return await self.access_controller.check_tenant_permission(
            tenant_id, user_context.user_id, user_context.requested_action
        )
```

**Security Requirements:**
- Complete tenant data isolation at database level
- Multi-factor authentication and authorization
- Tenant-specific encryption keys and data protection
- Resource quotas and usage monitoring
- Comprehensive audit logging
- Cross-tenant data leakage prevention

**Expected Score Improvement:**
- Multi-tenancy: 0% → 100% implementation
- Security: Enterprise-grade access controls
- Data isolation: Complete segregation validation

---

### BATCH1_DATABASE_INTEGRATION_MONGODB

**Complete Database Implementation Required**

Replace all placeholder database operations with full MongoDB integration featuring transaction support, schema validation, proper indexing, and comprehensive data persistence.

**Implementation Requirements:**
- **File Location**: [`src/database/mongodb_enterprise.py`](src/database/mongodb_enterprise.py)
- **Schema Validation**: [`src/database/schema_validator.py`](src/database/schema_validator.py)
- **Transaction Manager**: [`src/database/transaction_manager.py`](src/database/transaction_manager.py)

**Database Requirements:**
- Full MongoDB collection creation with validation schemas
- Compound indexes optimized for all query patterns
- ACID transaction support for store generation operations
- JSON Schema validation for all document types
- Foreign key relationships and referential integrity
- Automated backup and disaster recovery procedures

**Performance Requirements:**
- Query response time <50ms for standard operations
- Transaction completion <200ms for store generation
- Index optimization for 10M+ document collections
- Connection pooling for 1000+ concurrent operations

**Expected Score Improvement:**
- Database functionality: 0% → 100% implementation
- Data persistence: Full ACID compliance
- Query performance: <50ms standard operations

---

## BATCH 2: Performance & Infrastructure Components

### BATCH2_ASSET_PIPELINE_CDN_OPTIMIZATION

**Real Asset Processing Implementation Required**

Replace placeholder asset generation with comprehensive asset pipeline featuring CDN integration, image optimization, responsive image generation, and progressive loading.

**Implementation Requirements:**
- **File Location**: [`src/asset_pipeline/enterprise_asset_pipeline.py`](src/asset_pipeline/enterprise_asset_pipeline.py)
- **CDN Integration**: [`src/asset_pipeline/cdn_manager.py`](src/asset_pipeline/cdn_manager.py)
- **Image Optimization**: [`src/asset_pipeline/image_optimizer.py`](src/asset_pipeline/image_optimizer.py)

**Asset Pipeline Requirements:**
- Real CSS/JS minification and optimization
- Responsive image generation (320px, 768px, 1024px, 1920px)
- Modern image format support (WebP, AVIF) with fallbacks
- CDN upload with proper cache headers and versioning
- Content-based hashing for cache busting
- Service worker generation for PWA support

**Performance Requirements:**
- Asset processing <60 seconds for complete store
- CDN upload <30 seconds for all assets
- Image optimization >60% size reduction
- Cache hit rate >90% with proper versioning

**Expected Score Improvement:**
- Performance: 5.0 → >8.5
- Real asset generation and CDN deployment
- Image optimization >60% size reduction

---

### BATCH2_PERFORMANCE_MONITORING_OPTIMIZATION

**Comprehensive Performance Implementation Required**

Implement performance monitoring, resource management, and optimization framework to achieve <30 second generation time for 1000+ products with <500MB memory usage.

**Implementation Requirements:**
- **File Location**: [`src/performance/performance_monitor.py`](src/performance/performance_monitor.py)
- **Resource Management**: [`src/performance/resource_manager.py`](src/performance/resource_manager.py)
- **Optimization Engine**: [`src/performance/optimization_engine.py`](src/performance/optimization_engine.py)

**Performance Requirements:**
- Generation time <30 seconds for 1000+ products
- Memory usage <500MB for 10,000 products
- Real-time performance monitoring and alerting
- Resource utilization optimization >80%
- Concurrent operation support for 100+ simultaneous requests

**Expected Score Improvement:**
- Performance score: 5.0 → >8.5
- Memory usage: Unbounded → <500MB for 10K products
- Generation time: Undefined → <30s for 1K+ products

---

### BATCH2_ADVANCED_SEO_INTEGRATION

**Complete SEO Framework Implementation Required**

Implement comprehensive SEO optimization with Schema.org structured data, advanced meta tag generation, accessibility compliance, and performance optimization for >95 Lighthouse SEO scores.

**Implementation Requirements:**
- **File Location**: [`src/seo/advanced_seo_optimizer.py`](src/seo/advanced_seo_optimizer.py)
- **Structured Data**: [`src/seo/structured_data_generator.py`](src/seo/structured_data_generator.py)
- **Accessibility**: [`src/seo/accessibility_framework.py`](src/seo/accessibility_framework.py)

**SEO Requirements:**
- Complete Schema.org implementation for products, organizations, reviews
- Dynamic meta tag generation with Open Graph and Twitter Cards
- WCAG 2.1 AA accessibility compliance
- Core Web Vitals optimization
- International SEO with hreflang support

**Expected Score Improvement:**
- SEO score: Basic → >95 Lighthouse score
- Accessibility: Undefined → WCAG 2.1 AA compliance
- Structured data: Missing → Complete implementation

---

## BATCH 3: Intelligence & Quality Components

### BATCH3_FACE_SHAPE_ML_INTEGRATION

**Complete ML Integration Implementation Required**

Implement comprehensive face shape analysis integration with ML model connectivity, compatibility scoring, and personalized recommendation engine for enhanced user experience.

**Implementation Requirements:**
- **File Location**: [`src/ml_integration/face_shape_analyzer.py`](src/ml_integration/face_shape_analyzer.py)
- **Compatibility Scoring**: [`src/ml_integration/compatibility_scorer.py`](src/ml_integration/compatibility_scorer.py)
- **Recommendation Engine**: [`src/ml_integration/recommendation_engine.py`](src/ml_integration/recommendation_engine.py)

**ML Integration Requirements:**
- ML model integration and analysis processing
- Real-time compatibility calculation algorithms
- Personalized product recommendation system
- Face shape indicators and compatibility displays
- Analytics tracking for recommendation performance
- A/B testing for recommendation optimization

**Performance Requirements:**
- Recommendation response time <100ms
- ML analysis processing <200ms
- Compatibility scoring accuracy >90%
- Real-time personalized recommendations

**Expected Score Improvement:**
- ML integration: 0% → 100% implementation
- User experience: Enhanced with ML-driven insights
- Conversion optimization: Analytics-driven recommendations

---

### BATCH3_COMPREHENSIVE_TESTING_FRAMEWORK

**Complete Test Suite Implementation Required**

Implement comprehensive test suite covering all enterprise features with >95% coverage, performance benchmarks, security validation, and quality assurance aligned with test specifications.

**Implementation Requirements:**
- **File Location**: [`tests/comprehensive/enterprise_test_suite.py`](tests/comprehensive/enterprise_test_suite.py)
- **Performance Tests**: [`tests/performance/benchmark_tests.py`](tests/performance/benchmark_tests.py)
- **Security Tests**: [`tests/security/security_validation_tests.py`](tests/security/security_validation_tests.py)

**Testing Requirements:**
- Complete test suite implementing all specifications from [`test_specs_LS1.md`](test_specs_LS1.md)
- Performance benchmarks: <30s generation for 1000+ products, <100ms rendering
- Security validation: XSS prevention, injection attack testing, access control validation
- Quality assurance: Lighthouse >95, WCAG 2.1 AA compliance, mobile responsiveness
- Multi-tenant testing: Tenant isolation, data segregation, security validation
- Load testing: Concurrent user simulation and scalability validation
- Automated CI/CD: Complete test automation with quality gates

**Coverage Requirements:**
- Unit test coverage >95%
- Integration test coverage >90%
- Performance benchmark coverage 100%
- Security validation coverage 100%

**Expected Score Improvement:**
- Test coverage: 2.0 → >95%
- Quality assurance: Complete automation
- Security validation: Comprehensive vulnerability prevention
- Performance validation: All benchmarks met

---

## Implementation Strategy & Validation

### Phase 1: Security Foundation (BATCH 1)
**Priority Order:**
1. **BATCH1_ENTERPRISE_TEMPLATE_ENGINE_SECURITY** - Critical security foundation
2. **BATCH1_MULTI_TENANT_SECURITY_FRAMEWORK** - Enterprise isolation
3. **BATCH1_DATABASE_INTEGRATION_MONGODB** - Data persistence foundation

**Validation Command:**
```bash
python run_enterprise_validation_LS2.py --batch security
```

### Phase 2: Performance & Infrastructure (BATCH 2)
**Priority Order:**
4. **BATCH2_ASSET_PIPELINE_CDN_OPTIMIZATION** - Infrastructure foundation
5. **BATCH2_PERFORMANCE_MONITORING_OPTIMIZATION** - Performance optimization
6. **BATCH2_ADVANCED_SEO_INTEGRATION** - Quality foundation

**Validation Command:**
```bash
python run_enterprise_validation_LS2.py --batch performance
```

### Phase 3: Intelligence & Quality (BATCH 3)
**Priority Order:**
7. **BATCH3_FACE_SHAPE_ML_INTEGRATION** - ML intelligence
8. **BATCH3_COMPREHENSIVE_TESTING_FRAMEWORK** - Quality assurance

**Validation Command:**
```bash
python run_enterprise_validation_LS2.py --batch testing
```

### Final Validation
**Complete Enterprise Validation:**
```bash
python run_enterprise_validation_LS2.py --full-validation
```

### Success Criteria
- **Overall Score**: >8.5 (from 4.7)
- **Security Score**: >8.5 (from 4.0)  
- **Coverage Score**: >9.0 (from 2.0)
- **Performance Score**: >8.5 (from 5.0)
- **All Critical Tests**: 100% passing
- **Production Readiness**: Enterprise-grade deployment ready

### Critical Requirements
1. **Complete Replacement**: Previous code must be entirely replaced
2. **TDD Compliance**: All code must pass comprehensive test specifications from [`test_specs_LS1.md`](test_specs_LS1.md)
3. **Enterprise-Grade**: Security, performance, and scalability for production deployment
4. **Documentation**: Complete technical documentation and deployment guides
5. **Validation**: All features must be tested and proven to meet requirements using [`test_validation_enterprise_LS2.py`](test_validation_enterprise_LS2.py)

---

**Generated**: 2025-05-25T16:31:00Z  
**Target Layer**: LS2 Enterprise Foundation  
**Implementation Mode**: Complete Rewrite Required  
**Validation Framework**: [`run_enterprise_validation_LS2.py`](run_enterprise_validation_LS2.py)  
**Test Specifications**: [`test_specs_LS1.md`](test_specs_LS1.md)  
**Quality Assurance**: All prompts must result in tested, production-ready code that passes enterprise validation