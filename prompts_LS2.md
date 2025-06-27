# Refined Prompts for Store Generation Service Foundation [LS2]

## Critical Analysis Summary

Based on comprehensive reflection analysis from LS1, the Store Generation Service Foundation requires complete enterprise-grade rewriting. Current implementation scores (Overall: 4.7/10, Security: 4.0/10, Coverage: 2.0/10) fall drastically short of minimum thresholds (7.5/10 across all metrics), with critical security vulnerabilities, missing enterprise features, and massive gaps between test specifications and implementation.

**MANDATORY REQUIREMENT**: Previous code must be replaced entirely. Only results tested and proven to meet all critical test requirements are acceptable.

---

## Prompt [LS2_ENTERPRISE_TEMPLATE_ENGINE]

### Context
Current template engine uses primitive string replacement with no security validation, enabling XSS attacks and template injection vulnerabilities. Test specifications require enterprise-grade Jinja2 implementation with comprehensive security framework.

### Objective
Implement enterprise-grade secure template engine with Jinja2, XSS prevention, template injection protection, and comprehensive input validation replacing the dangerous string replacement approach.

### Focus Areas
- **Security-First Template Engine**: Jinja2 with autoescape, sandboxing, and injection prevention
- **Input Validation & Sanitization**: Comprehensive validation for all template inputs and context variables
- **Template Security Framework**: Size limits, execution timeouts, and secure defaults
- **XSS Prevention**: Content sanitization using bleach with strict security policies
- **Error Handling**: Structured error handling with security-focused logging

### Code Reference
```python
# DANGEROUS CURRENT IMPLEMENTATION - MUST BE REPLACED
def render_template(self, template_content: str, context: Dict[str, Any]) -> str:
    rendered = template_content
    for key, value in context.items():
        placeholder = f"{{{key}}}"
        rendered = rendered.replace(placeholder, str(value))  # SECURITY VULNERABILITY
    return rendered
```

### Requirements
- **Jinja2 Integration**: Use Jinja2 Environment with security-focused configuration
- **Auto-escaping**: Enable autoescape for HTML/XML with strict policies
- **Template Validation**: Implement template size limits and security scanning
- **Context Sanitization**: Sanitize all context variables using bleach
- **Sandbox Execution**: Implement sandboxed template execution environment
- **Security Logging**: Comprehensive audit logging for all template operations
- **Error Recovery**: Graceful error handling with security-focused responses

### Expected Improvements
- Security score improvement from 4.0 to >8.5
- Elimination of XSS and template injection vulnerabilities
- Comprehensive input validation coverage >95%
- Template rendering performance <100ms per template
- Security audit compliance for enterprise deployment

---

## Prompt [LS2_ASSET_PIPELINE_CDN]

### Context
Current asset generation is completely missing CDN integration, optimization, and real asset processing. Implementation generates placeholder file paths without creating actual optimized assets, failing performance and infrastructure requirements.

### Objective
Implement comprehensive asset pipeline with CDN integration, image optimization, responsive image generation, minification, and cache busting to replace placeholder implementations.

### Focus Areas
- **Real Asset Processing**: Actual CSS/JS minification and optimization
- **CDN Integration**: Upload assets to CDN with proper versioning and cache busting
- **Responsive Images**: Generate responsive image sets for multiple breakpoints
- **Performance Optimization**: Asset bundling, compression, and progressive loading
- **Asset Versioning**: Content-based hashing for cache invalidation

### Code Reference
```python
# PLACEHOLDER CURRENT IMPLEMENTATION - MUST BE REPLACED
async def _generate_assets(self, config: StoreConfiguration) -> List[str]:
    generated_files = []
    css_file = f"stores/{config.store_id}/assets/css/custom.css"
    generated_files.append(css_file)  # NO ACTUAL FILE CREATION
    return generated_files
```

### Requirements
- **Asset Pipeline Class**: Implement AssetPipeline with CDN, optimization, and caching
- **CSS/JS Optimization**: Minification, bundling, and compression
- **Responsive Images**: Generate multiple image sizes (320px, 768px, 1024px, 1920px)
- **CDN Upload**: Actual asset upload to CDN with proper error handling
- **Content Hashing**: MD5-based cache busting for all assets
- **Progressive Loading**: Service worker generation for PWA support
- **WebP/AVIF Support**: Modern image format generation and fallbacks

### Expected Improvements
- Performance score improvement from 5.0 to >8.5
- Real asset generation and CDN deployment
- Image optimization reducing load times >60%
- Cache hit rate >90% with proper versioning
- PWA compliance with service worker support

---

## Prompt [LS2_DATABASE_INTEGRATION]

### Context
Database operations are completely stubbed out with no actual implementation. Collections are not created, no indexes exist, no data validation occurs, and no transactions are implemented, causing complete failure of data persistence requirements.

### Objective
Implement full MongoDB integration with transaction support, schema validation, proper indexing, and comprehensive data persistence replacing all placeholder implementations.

### Focus Areas
- **MongoDB Collections**: Create actual collections with proper schemas and indexes
- **Transaction Support**: Implement ACID transactions for store generation operations
- **Schema Validation**: JSON Schema validation for all data models
- **Index Strategy**: Performance-optimized indexes for all query patterns
- **Data Persistence**: Real data storage with backup and recovery

### Code Reference
```python
# PLACEHOLDER CURRENT IMPLEMENTATION - MUST BE REPLACED
async def _setup_database_collections(self, config: StoreConfiguration) -> bool:
    collections = ["store_products", "store_orders"]
    for collection_name in collections:
        pass  # NO ACTUAL IMPLEMENTATION
    return True
```

### Requirements
- **Collection Creation**: Actual MongoDB collection creation with validation schemas
- **Index Strategy**: Compound indexes for products, orders, customers, and analytics
- **Transaction Management**: Session-based transactions with rollback support
- **Schema Validation**: JSON Schema validation for all document types
- **Data Integrity**: Foreign key relationships and referential integrity
- **Performance Optimization**: Query optimization and aggregation pipelines
- **Backup Integration**: Automated backup and disaster recovery

### Expected Improvements
- Database functionality from 0% to 100% implementation
- Data persistence with ACID compliance
- Query performance <50ms for standard operations
- Data integrity validation >99%
- Backup and recovery procedures fully operational

---

## Prompt [LS2_PERFORMANCE_MONITORING]

### Context
Service completely fails performance requirements with no monitoring, optimization, or resource management. Missing <30 second generation requirement for 1000+ products, no memory limits, and synchronous operations blocking the event loop.

### Objective
Implement comprehensive performance monitoring, resource management, and optimization framework to achieve <30 second generation time for 1000+ products with <500MB memory usage.

### Focus Areas
- **Performance Monitoring**: Real-time metrics collection and analysis
- **Resource Management**: Memory limits, CPU throttling, and resource quotas
- **Async Optimization**: Proper async/await patterns with concurrent processing
- **Batch Processing**: Streaming processing for large catalogs
- **Memory Management**: Bounded caches and garbage collection optimization

### Code Reference
```python
# UNOPTIMIZED CURRENT IMPLEMENTATION - MUST BE REPLACED
async def generate_store(self, config: StoreConfiguration) -> GenerationResult:
    # No performance monitoring, no resource limits, no optimization
    generation_tasks = [...]  # Basic concurrent execution without optimization
    results = await asyncio.gather(*generation_tasks)
```

### Requirements
- **PerformanceMonitor Class**: Real-time performance tracking and metrics
- **ResourceLimiter**: Memory limits (2GB max), CPU throttling, and timeouts
- **Streaming Processing**: Handle >10,000 products with streaming algorithms
- **Concurrent Optimization**: Optimized task batching and parallel execution
- **Memory Tracking**: Peak memory usage monitoring and garbage collection
- **Performance Benchmarks**: Automated performance regression testing
- **Alert Systems**: Performance threshold monitoring and alerting

### Expected Improvements
- Generation time <30 seconds for 1000+ products (currently undefined)
- Memory usage <500MB for 10,000 products (currently unbounded)
- Performance score improvement from 5.0 to >8.5
- Resource utilization optimization >80%
- Real-time performance monitoring and alerting

---

## Prompt [LS2_MULTI_TENANT_SECURITY]

### Context
Implementation completely lacks multi-tenant isolation, management, and security features. No tenant data segregation, access controls, or security framework exists, creating critical security vulnerabilities for enterprise deployment.

### Objective
Implement comprehensive multi-tenant management with complete data isolation, access controls, security framework, and tenant-specific customizations for enterprise-grade deployment.

### Focus Areas
- **Tenant Isolation**: Complete data and resource isolation between tenants
- **Security Framework**: Access controls, authentication, and authorization
- **Tenant Management**: Tenant provisioning, configuration, and lifecycle management
- **Data Segregation**: Database-level tenant data isolation
- **Resource Quotas**: Per-tenant resource limits and usage tracking

### Code Reference
```python
# MISSING IMPLEMENTATION - MUST BE CREATED
# No multi-tenant functionality exists in current codebase
# Complete implementation required from scratch
```

### Requirements
- **TenantManager Class**: Complete tenant lifecycle management
- **SecurityFramework**: Authentication, authorization, and access control
- **Data Isolation**: Database-level tenant data segregation
- **Resource Quotas**: Per-tenant memory, storage, and processing limits
- **Audit Logging**: Comprehensive tenant activity and security logging
- **Configuration Management**: Tenant-specific configurations and features
- **Migration Support**: Tenant data migration and backup procedures

### Expected Improvements
- Multi-tenancy from 0% to 100% implementation
- Security framework with enterprise-grade access controls
- Complete tenant data isolation and privacy compliance
- Per-tenant resource management and monitoring
- Audit compliance for enterprise security requirements

---

## Prompt [LS2_ADVANCED_SEO_INTEGRATION]

### Context
Current SEO implementation only includes basic meta tags, missing structured data, advanced optimization, accessibility compliance, and performance optimization required for enterprise-grade SEO.

### Objective
Implement comprehensive SEO optimization with Schema.org structured data, advanced meta tag generation, accessibility compliance, and performance optimization for >95 Lighthouse SEO scores.

### Focus Areas
- **Structured Data**: Complete Schema.org implementation for products, organizations, reviews
- **Advanced Meta Tags**: Dynamic meta generation with Open Graph and Twitter Cards
- **Accessibility Compliance**: WCAG 2.1 AA compliance with semantic HTML
- **Performance SEO**: Core Web Vitals optimization and mobile-first indexing
- **International SEO**: hreflang implementation and multi-language support

### Code Reference
```python
# BASIC CURRENT IMPLEMENTATION - NEEDS ENHANCEMENT
# Only basic meta tags exist, missing structured data and advanced features
```

### Requirements
- **AdvancedSEOOptimizer Class**: Comprehensive SEO optimization framework
- **Structured Data Generator**: Schema.org markup for all content types
- **Meta Tag Optimization**: Dynamic, content-aware meta tag generation
- **Accessibility Framework**: WCAG 2.1 AA compliance validation
- **Performance Optimization**: Core Web Vitals and Lighthouse optimization
- **International Support**: hreflang and multi-language SEO
- **SEO Analytics**: SEO performance monitoring and reporting

### Expected Improvements
- SEO score improvement to >95 Lighthouse score
- Complete structured data implementation
- WCAG 2.1 AA accessibility compliance
- Core Web Vitals optimization
- International SEO support for global deployment

---

## Prompt [LS2_FACE_SHAPE_ML_INTEGRATION]

### Context
Face shape analysis integration is completely missing from current implementation, despite being a core requirement for personalized eyewear recommendations and product compatibility scoring.

### Objective
Implement comprehensive face shape analysis integration with ML model connectivity, compatibility scoring, and personalized recommendation engine for enhanced user experience.

### Focus Areas
- **ML Model Integration**: Connect to existing face shape analysis services
- **Compatibility Scoring**: Real-time face shape to eyewear compatibility calculation
- **Recommendation Engine**: Personalized product recommendations based on face analysis
- **Visual Indicators**: UI components for displaying compatibility scores
- **Analytics Integration**: Track recommendation effectiveness and user engagement

### Code Reference
```python
# MISSING IMPLEMENTATION - MUST BE CREATED
# No face shape analysis integration exists in current codebase
```

### Requirements
- **FaceShapeAnalyzer Class**: ML model integration and analysis processing
- **CompatibilityScorer**: Real-time compatibility calculation algorithms
- **RecommendationEngine**: Personalized product recommendation system
- **UI Components**: Face shape indicators and compatibility displays
- **Analytics Tracking**: Recommendation performance and user engagement metrics
- **A/B Testing**: Recommendation algorithm testing and optimization
- **Performance Optimization**: Sub-100ms recommendation response times

### Expected Improvements
- Complete face shape analysis integration
- Real-time personalized recommendations
- Enhanced user experience with ML-driven insights
- Improved conversion rates through better product matching
- Analytics-driven recommendation optimization

---

## Prompt [LS2_COMPREHENSIVE_TESTING]

### Context
Test coverage is critically low (2.0/10) with missing test infrastructure despite comprehensive test specifications. 758 lines of test specifications exist but actual test implementation is minimal and non-functional.

### Objective
Implement comprehensive test suite covering all enterprise features with >95% coverage, performance benchmarks, security validation, and quality assurance aligned with test specifications.

### Focus Areas
- **Unit Testing**: Complete coverage of all service components and functions
- **Integration Testing**: End-to-end workflow validation and component interaction
- **Performance Testing**: Benchmark testing for all performance requirements
- **Security Testing**: Vulnerability scanning and security validation
- **Quality Testing**: Accessibility, SEO, and mobile responsiveness validation

### Code Reference
```python
# INSUFFICIENT CURRENT TESTING - NEEDS COMPLETE IMPLEMENTATION
# Test framework exists but lacks comprehensive coverage and real validation
```

### Requirements
- **Complete Test Suite**: Implement all test specifications from test_specs_LS1.md
- **Performance Benchmarks**: <30s generation for 1000+ products, <100ms rendering
- **Security Validation**: XSS prevention, injection attack testing, access control validation
- **Quality Assurance**: Lighthouse >95, WCAG 2.1 AA compliance, mobile responsiveness
- **Multi-tenant Testing**: Tenant isolation, data segregation, and security validation
- **Load Testing**: Concurrent user simulation and scalability validation
- **Automated CI/CD**: Complete test automation with quality gates

### Expected Improvements
- Test coverage from 2.0 to >95%
- All critical performance benchmarks met and validated
- Comprehensive security testing and vulnerability prevention
- Quality assurance with automated Lighthouse and accessibility testing
- Complete CI/CD pipeline with quality gates

---

## Implementation Strategy

### Phase 1: Security Foundation (Priority 1)
1. **Enterprise Template Engine** [LS2_ENTERPRISE_TEMPLATE_ENGINE]
2. **Multi-tenant Security** [LS2_MULTI_TENANT_SECURITY]
3. **Database Integration** [LS2_DATABASE_INTEGRATION]

### Phase 2: Performance & Infrastructure (Priority 2)
4. **Asset Pipeline CDN** [LS2_ASSET_PIPELINE_CDN]
5. **Performance Monitoring** [LS2_PERFORMANCE_MONITORING]
6. **Advanced SEO Integration** [LS2_ADVANCED_SEO_INTEGRATION]

### Phase 3: Intelligence & Testing (Priority 3)
7. **Face Shape ML Integration** [LS2_FACE_SHAPE_ML_INTEGRATION]
8. **Comprehensive Testing** [LS2_COMPREHENSIVE_TESTING]

### Success Criteria
- **Overall Score**: >8.5 (from 4.7)
- **Security Score**: >8.5 (from 4.0)
- **Coverage Score**: >9.0 (from 2.0)
- **Performance Score**: >8.5 (from 5.0)
- **All Critical Tests**: 100% passing
- **Production Readiness**: Enterprise-grade deployment ready

### Critical Requirements
1. **Complete Replacement**: Previous code must be entirely replaced
2. **TDD Compliance**: All code must pass comprehensive test specifications
3. **Enterprise-Grade**: Security, performance, and scalability for production deployment
4. **Documentation**: Complete technical documentation and deployment guides
5. **Validation**: All features must be tested and proven to meet requirements

---

**Generated**: 2025-05-25T04:10:25Z  
**Target Layer**: LS2 Enterprise Foundation  
**Implementation Mode**: Complete Rewrite Required  
**Validation**: All prompts must result in tested, production-ready code