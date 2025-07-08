# Batched Code-Centric Prompts for Store Generation Service Foundation Enterprise Rewrite [LS2]

## Overview

This document contains batched, implementation-ready prompts for the complete enterprise rewrite of the Store Generation Service Foundation. Each prompt results in tested, production-ready code that passes all comprehensive test specifications from [`test_specs_LS1.md`](test_specs_LS1.md:1).

**CRITICAL REQUIREMENT**: All code must follow TDD red-green-refactor cycle and achieve >95% test coverage.

---

## Batch 1: Enterprise Template Engine Foundation

### Prompt [LS2_B1_SECURE_TEMPLATE_ENGINE]

**Context**: Replace the dangerous string replacement template engine with enterprise-grade Jinja2 implementation with comprehensive security framework.

**Test-Driven Implementation**:

```python
# tests/template_engine/test_secure_engine_core.py
import pytest
import asyncio
from unittest.mock import Mock, patch
from src.store_generation.template_engine.secure_template_engine import SecureTemplateEngine
from src.store_generation.template_engine.exceptions import TemplateSecurityError, TemplateNotFoundError

class TestSecureTemplateEngineCore:
    """Test secure template engine core functionality with TDD approach."""
    
    @pytest.mark.asyncio
    async def test_jinja2_environment_security_configuration(self):
        """Test Jinja2 environment is configured with maximum security."""
        engine = SecureTemplateEngine(sandbox=True)
        
        # MUST implement: Jinja2 with autoescape, sandboxing, size limits
        assert engine.environment.autoescape is True
        assert engine.environment.sandboxed is True
        assert hasattr(engine, 'max_template_size')
        assert engine.max_template_size <= 1024 * 1024  # 1MB limit
        
    @pytest.mark.asyncio 
    async def test_template_injection_prevention(self):
        """Test prevention of template injection attacks."""
        engine = SecureTemplateEngine(sandbox=True)
        
        malicious_context = {
            'user_input': '{{ config.SECRET_KEY }}',
            'exploit': '{% for item in [].__class__.__bases__[0].__subclasses__() %}{% endfor %}'
        }
        
        # MUST implement: Context sanitization preventing code execution
        with pytest.raises(TemplateSecurityError):
            await engine.render_template('store_listing.html', 'modern-minimal', malicious_context)
            
    @pytest.mark.asyncio
    async def test_xss_prevention_with_bleach(self):
        """Test XSS prevention using bleach sanitization."""
        engine = SecureTemplateEngine(sandbox=True)
        
        xss_context = {
            'product_name': '<script>alert("XSS")</script>',
            'description': '<img src=x onerror=alert("XSS")>'
        }
        
        # MUST implement: Bleach sanitization with strict security policies
        result = await engine.render_template('product_page.html', 'modern-minimal', xss_context)
        assert '<script>' not in result
        assert 'onerror=' not in result
        assert '&lt;script&gt;' in result  # Should be escaped
```

**Implementation Requirements**:
1. **SecureTemplateEngine Class** with Jinja2 Environment configured for security
2. **Context Sanitization** using bleach with strict allowlist
3. **Template Validation** with size limits and security scanning
4. **Sandbox Execution** preventing access to Python internals
5. **Security Logging** for all template operations and violations
6. **Error Recovery** with security-focused error messages

**Expected Files Created**:
- `src/store_generation/template_engine/secure_template_engine.py`
- `src/store_generation/template_engine/security/`
- `src/store_generation/template_engine/security/validators.py`
- `src/store_generation/template_engine/security/sanitizers.py`
- `tests/template_engine/test_secure_engine_core.py`
- `tests/template_engine/test_security_framework.py`

---

## Batch 2: Enterprise Asset Pipeline with CDN Integration

### Prompt [LS2_B2_ASSET_PIPELINE_CDN]

**Context**: Replace placeholder asset generation with real asset processing, CDN integration, responsive images, and performance optimization.

**Test-Driven Implementation**:

```python
# tests/template_engine/test_asset_pipeline_enterprise.py
import pytest
import asyncio
from pathlib import Path
from unittest.mock import Mock, patch, AsyncMock
from src.store_generation.template_engine.asset_pipeline import EnterpriseAssetPipeline
from src.store_generation.template_engine.cdn import CDNManager

class TestEnterpriseAssetPipeline:
    """Test enterprise asset pipeline with real processing."""
    
    @pytest.mark.asyncio
    async def test_real_css_minification_and_bundling(self):
        """Test actual CSS minification and bundling."""
        pipeline = EnterpriseAssetPipeline(cdn_enabled=True)
        
        css_files = [
            'themes/modern-minimal/assets/css/base.css',
            'themes/modern-minimal/assets/css/components.css'
        ]
        
        # MUST implement: Real CSS minification using cssnano or similar
        result = await pipeline.process_css_bundle(css_files)
        
        assert result['minified'] is True
        assert result['original_size'] > result['minified_size']
        assert result['compression_ratio'] > 0.3  # At least 30% reduction
        assert result['cdn_url'].startswith('https://cdn.example.com/')
        
    @pytest.mark.asyncio
    async def test_responsive_image_generation(self):
        """Test responsive image set generation."""
        pipeline = EnterpriseAssetPipeline(cdn_enabled=True)
        
        source_image = 'themes/modern-minimal/assets/images/hero.jpg'
        breakpoints = [320, 768, 1024, 1920]
        
        # MUST implement: Real image processing with multiple formats
        result = await pipeline.generate_responsive_images(source_image, breakpoints)
        
        assert len(result['variants']) == len(breakpoints)
        assert 'webp' in result['formats']
        assert 'avif' in result['formats']
        assert all(variant['cdn_url'] for variant in result['variants'])
        
    @pytest.mark.asyncio
    async def test_cdn_upload_with_cache_busting(self):
        """Test actual CDN upload with content-based cache busting."""
        cdn_manager = CDNManager(provider='aws_cloudfront')
        
        asset_data = b'/* CSS content */'
        asset_path = 'assets/css/main.css'
        
        # MUST implement: Real CDN upload with proper error handling
        result = await cdn_manager.upload_asset(asset_data, asset_path)
        
        assert result['uploaded'] is True
        assert result['cache_hash'] is not None
        assert len(result['cache_hash']) == 32  # MD5 hash
        assert result['cdn_url'].endswith(f"?v={result['cache_hash']}")
        
    @pytest.mark.asyncio
    async def test_progressive_loading_service_worker(self):
        """Test service worker generation for PWA support."""
        pipeline = EnterpriseAssetPipeline(pwa_enabled=True)
        
        assets = [
            'assets/css/main.css',
            'assets/js/app.js',
            'assets/images/logo.webp'
        ]
        
        # MUST implement: Service worker with asset caching strategies
        sw_content = await pipeline.generate_service_worker(assets)
        
        assert 'self.addEventListener("install"' in sw_content
        assert 'caches.open(' in sw_content
        assert all(asset in sw_content for asset in assets)
```

**Implementation Requirements**:
1. **EnterpriseAssetPipeline Class** with real processing capabilities
2. **CSS/JS Optimization** using industry-standard minifiers
3. **Responsive Image Processing** with WebP/AVIF support
4. **CDN Integration** with upload, versioning, and failover
5. **Content Hashing** for cache invalidation
6. **Progressive Loading** with service worker generation

**Expected Files Created**:
- `src/store_generation/template_engine/asset_pipeline.py`
- `src/store_generation/template_engine/cdn/`
- `src/store_generation/template_engine/cdn/managers.py`
- `src/store_generation/template_engine/optimization/`
- `tests/template_engine/test_asset_pipeline_enterprise.py`
- `tests/template_engine/test_cdn_integration.py`

---

## Batch 3: MongoDB Integration with Transactions

### Prompt [LS2_B3_DATABASE_INTEGRATION]

**Context**: Replace stubbed database operations with full MongoDB integration, transactions, schema validation, and performance optimization.

**Test-Driven Implementation**:

```python
# tests/template_engine/test_mongodb_integration.py
import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from src.store_generation.database.mongodb_manager import MongoDBManager
from src.store_generation.database.schema_validator import SchemaValidator
from src.store_generation.database.transaction_manager import TransactionManager

class TestMongoDBIntegration:
    """Test MongoDB integration with transactions and validation."""
    
    @pytest.mark.asyncio
    async def test_collection_creation_with_schema_validation(self):
        """Test actual MongoDB collection creation with JSON schema validation."""
        db_manager = MongoDBManager(connection_string="mongodb://localhost:27017/test")
        
        store_config = {
            'store_id': 'test_store_001',
            'collections': ['products', 'orders', 'customers']
        }
        
        # MUST implement: Real collection creation with validation schemas
        result = await db_manager.setup_store_collections(store_config)
        
        assert result['collections_created'] == 3
        assert 'products' in result['created']
        assert all(col['schema_validation'] for col in result['created'].values())
        
    @pytest.mark.asyncio
    async def test_acid_transaction_support(self):
        """Test ACID transaction support for store operations."""
        transaction_manager = TransactionManager(db_manager)
        
        store_data = {
            'products': [{'id': 'p1', 'name': 'Frame 1'}],
            'store_config': {'id': 's1', 'name': 'Test Store'}
        }
        
        # MUST implement: Session-based transactions with rollback
        async with transaction_manager.transaction() as session:
            result = await transaction_manager.create_store_with_products(store_data, session)
            
        assert result['transaction_successful'] is True
        assert result['products_inserted'] == 1
        assert result['store_created'] is True
        
    @pytest.mark.asyncio
    async def test_performance_optimized_indexes(self):
        """Test creation of performance-optimized indexes."""
        db_manager = MongoDBManager(connection_string="mongodb://localhost:27017/test")
        
        # MUST implement: Compound indexes for query optimization
        indexes_result = await db_manager.create_performance_indexes()
        
        expected_indexes = [
            {'collection': 'products', 'fields': ['store_id', 'category', 'price']},
            {'collection': 'orders', 'fields': ['store_id', 'created_at']},
            {'collection': 'customers', 'fields': ['store_id', 'email']}
        ]
        
        for expected in expected_indexes:
            assert expected in indexes_result['created']
            
    @pytest.mark.asyncio
    async def test_query_performance_benchmarks(self):
        """Test query performance meets <50ms requirement."""
        db_manager = MongoDBManager(connection_string="mongodb://localhost:27017/test")
        
        # Insert test data
        await db_manager.insert_test_products(count=10000)
        
        # MUST implement: Optimized queries with aggregation pipelines
        start_time = asyncio.get_event_loop().time()
        products = await db_manager.get_products_by_category('eyeglasses', limit=100)
        query_time = (asyncio.get_event_loop().time() - start_time) * 1000
        
        assert query_time < 50  # <50ms requirement
        assert len(products) <= 100
        assert all('category' in product for product in products)
```

**Implementation Requirements**:
1. **MongoDBManager Class** with full database lifecycle management
2. **Schema Validation** using JSON Schema for all document types
3. **Transaction Management** with session-based ACID compliance
4. **Index Strategy** optimized for all query patterns
5. **Performance Optimization** with aggregation pipelines
6. **Connection Management** with connection pooling and failover

**Expected Files Created**:
- `src/store_generation/database/mongodb_manager.py`
- `src/store_generation/database/schema_validator.py`
- `src/store_generation/database/transaction_manager.py`
- `src/store_generation/database/schemas/`
- `tests/template_engine/test_mongodb_integration.py`
- `tests/template_engine/test_database_performance.py`
---

## Batch 4: Performance Monitoring and Resource Management

### Prompt [LS2_B4_PERFORMANCE_MONITORING]

**Context**: Implement comprehensive performance monitoring and resource management to achieve <30 second generation for 1000+ products with <500MB memory usage.

**Test-Driven Implementation**:

```python
# tests/template_engine/test_performance_monitoring.py
import pytest
import asyncio
import psutil
from src.store_generation.performance.monitor import PerformanceMonitor
from src.store_generation.performance.resource_limiter import ResourceLimiter
from src.store_generation.performance.streaming_processor import StreamingProcessor

class TestPerformanceMonitoring:
    """Test performance monitoring and resource management."""
    
    @pytest.mark.asyncio
    async def test_generation_time_under_30_seconds(self):
        """Test store generation completes in <30 seconds for 1000+ products."""
        monitor = PerformanceMonitor()
        resource_limiter = ResourceLimiter(max_memory_mb=500, max_cpu_percent=80)
        
        # MUST implement: Optimized generation with monitoring
        with monitor.track_operation('store_generation') as tracker:
            with resource_limiter.enforce_limits():
                result = await generate_store_with_1000_products()
                
        assert tracker.duration < 30.0  # <30 seconds requirement
        assert tracker.peak_memory_mb < 500  # <500MB requirement
        assert result['products_processed'] >= 1000
        
    @pytest.mark.asyncio
    async def test_streaming_processing_large_catalogs(self):
        """Test streaming processing for >10,000 products."""
        processor = StreamingProcessor(batch_size=100, memory_limit_mb=200)
        
        # MUST implement: Memory-efficient streaming with backpressure
        product_stream = generate_test_products(count=10000)
        
        processed_count = 0
        memory_peaks = []
        
        async for batch in processor.process_stream(product_stream):
            processed_count += len(batch['products'])
            memory_peaks.append(psutil.Process().memory_info().rss / 1024 / 1024)
            
        assert processed_count == 10000
        assert max(memory_peaks) < 200  # Memory bounded
        assert len(memory_peaks) >= 100  # Processed in batches
        
    @pytest.mark.asyncio
    async def test_concurrent_optimization_batching(self):
        """Test optimized concurrent task batching."""
        monitor = PerformanceMonitor()
        
        # MUST implement: Optimal concurrency with CPU/memory awareness
        tasks = [create_product_rendering_task(i) for i in range(100)]
        
        with monitor.track_operation('concurrent_processing') as tracker:
            results = await monitor.execute_optimized_batches(tasks)
            
        assert len(results) == 100
        assert tracker.cpu_efficiency > 0.8  # >80% CPU utilization
        assert tracker.memory_efficiency > 0.8  # Efficient memory usage
        
    @pytest.mark.asyncio
    async def test_performance_alert_system(self):
        """Test performance threshold monitoring and alerting."""
        monitor = PerformanceMonitor()
        alert_handler = Mock()
        
        # MUST implement: Real-time performance alerting
        monitor.configure_alerts(
            memory_threshold_mb=400,
            cpu_threshold_percent=85,
            response_time_threshold_ms=100,
            alert_handler=alert_handler
        )
        
        # Simulate high memory usage
        await simulate_high_memory_operation()
        
        assert alert_handler.called
        alert_call = alert_handler.call_args[0][0]
        assert alert_call['type'] == 'memory_threshold_exceeded'
        assert alert_call['value'] > 400
```

**Implementation Requirements**:
1. **PerformanceMonitor Class** with real-time metrics collection
2. **ResourceLimiter** with memory/CPU limits and enforcement
3. **StreamingProcessor** for memory-efficient large catalog processing
4. **Concurrent Optimization** with adaptive batching strategies
5. **Alert System** with configurable thresholds
6. **Benchmarking** with automated performance regression testing

**Expected Files Created**:
- `src/store_generation/performance/monitor.py`
- `src/store_generation/performance/resource_limiter.py`
- `src/store_generation/performance/streaming_processor.py`
- `src/store_generation/performance/alerts.py`
- `tests/template_engine/test_performance_monitoring.py`
- `tests/template_engine/test_resource_management.py`

---

## Batch 5: Multi-Tenant Security Framework

### Prompt [LS2_B5_MULTI_TENANT_SECURITY]

**Context**: Implement comprehensive multi-tenant management with complete data isolation, access controls, and security framework for enterprise deployment.

**Test-Driven Implementation**:

```python
# tests/template_engine/test_multi_tenant_security.py
import pytest
import asyncio
from src.store_generation.tenancy.tenant_manager import TenantManager
from src.store_generation.tenancy.security_framework import SecurityFramework
from src.store_generation.tenancy.isolation_manager import IsolationManager

class TestMultiTenantSecurity:
    """Test multi-tenant security and isolation."""
    
    @pytest.mark.asyncio
    async def test_complete_tenant_data_isolation(self):
        """Test complete isolation of tenant data and resources."""
        tenant_manager = TenantManager()
        isolation_manager = IsolationManager()
        
        # Create two tenants
        tenant_a = await tenant_manager.create_tenant({
            'tenant_id': 'tenant_a',
            'name': 'Store A',
            'domain': 'store-a.example.com'
        })
        
        tenant_b = await tenant_manager.create_tenant({
            'tenant_id': 'tenant_b', 
            'name': 'Store B',
            'domain': 'store-b.example.com'
        })
        
        # MUST implement: Database-level tenant isolation
        assert tenant_a['database_name'] != tenant_b['database_name']
        assert tenant_a['resource_quota'] is not None
        assert not await isolation_manager.can_access_tenant_data('tenant_a', 'tenant_b')
        
    @pytest.mark.asyncio
    async def test_access_control_framework(self):
        """Test comprehensive access control and authorization."""
        security_framework = SecurityFramework()
        
        tenant_context = {
            'tenant_id': 'tenant_001',
            'user_id': 'user_123',
            'roles': ['store_admin'],
            'permissions': ['read_products', 'write_products']
        }
        
        # MUST implement: Role-based access control (RBAC)
        access_result = await security_framework.authorize_action(
            tenant_context, 'template_access', 'store_listing.html'
        )
        
        assert access_result['authorized'] is True
        assert 'store_admin' in access_result['roles_evaluated']
        assert access_result['audit_logged'] is True
        
    @pytest.mark.asyncio
    async def test_tenant_resource_quota_enforcement(self):
        """Test per-tenant resource limits and usage tracking."""
        tenant_manager = TenantManager()
        
        tenant_config = {
            'tenant_id': 'tenant_quota_test',
            'resource_limits': {
                'max_products': 1000,
                'max_storage_mb': 100,
                'max_requests_per_hour': 10000
            }
        }
        
        tenant = await tenant_manager.create_tenant(tenant_config)
        
        # MUST implement: Real-time quota tracking and enforcement
        usage = await tenant_manager.get_resource_usage('tenant_quota_test')
        
        assert usage['products_count'] <= 1000
        assert usage['storage_used_mb'] <= 100
        
        # Test quota enforcement
        with pytest.raises(ResourceQuotaExceededError):
            await tenant_manager.add_products('tenant_quota_test', count=1001)
            
    @pytest.mark.asyncio
    async def test_audit_logging_comprehensive(self):
        """Test comprehensive audit logging for compliance."""
        security_framework = SecurityFramework()
        audit_logger = security_framework.audit_logger
        
        # MUST implement: Detailed audit trail
        await security_framework.log_tenant_activity({
            'tenant_id': 'tenant_audit',
            'user_id': 'user_456',
            'action': 'template_render',
            'resource': 'product_page.html',
            'ip_address': '192.168.1.100',
            'timestamp': '2025-05-25T12:00:00Z'
        })
        
        audit_records = await audit_logger.get_tenant_audit_log('tenant_audit')
        
        assert len(audit_records) >= 1
        assert audit_records[0]['action'] == 'template_render'
        assert audit_records[0]['compliance_level'] == 'SOX_COMPLIANT'
```

**Implementation Requirements**:
1. **TenantManager Class** with complete lifecycle management
2. **SecurityFramework** with RBAC and authorization
3. **IsolationManager** with database-level data segregation
4. **Resource Quotas** with real-time tracking and enforcement
5. **Audit Logging** with compliance-grade detail
6. **Configuration Management** with tenant-specific settings

**Expected Files Created**:
- `src/store_generation/tenancy/tenant_manager.py`
- `src/store_generation/tenancy/security_framework.py`
- `src/store_generation/tenancy/isolation_manager.py`
- `src/store_generation/tenancy/audit_logger.py`
- `tests/template_engine/test_multi_tenant_security.py`
- `tests/template_engine/test_tenant_isolation.py`

---

## Batch 6: Advanced SEO Integration

### Prompt [LS2_B6_ADVANCED_SEO_INTEGRATION]

**Context**: Implement comprehensive SEO optimization with Schema.org structured data, WCAG compliance, and >95 Lighthouse scores.

**Test-Driven Implementation**:

```python
# tests/template_engine/test_advanced_seo.py
import pytest
import json
from bs4 import BeautifulSoup
from src.store_generation.seo.advanced_optimizer import AdvancedSEOOptimizer
from src.store_generation.seo.structured_data import StructuredDataGenerator
from src.store_generation.seo.accessibility import AccessibilityValidator

class TestAdvancedSEOIntegration:
    """Test advanced SEO optimization features."""
    
    @pytest.mark.asyncio
    async def test_comprehensive_structured_data_generation(self):
        """Test complete Schema.org structured data implementation."""
        seo_optimizer = AdvancedSEOOptimizer()
        structured_data_gen = StructuredDataGenerator()
        
        product_data = {
            'name': 'Designer Eyeglasses',
            'price': 299.99,
            'brand': 'EyewearBrand',
            'category': 'Eyeglasses',
            'reviews': [{'rating': 5, 'comment': 'Great glasses!'}]
        }
        
        # MUST implement: Complete Schema.org markup
        structured_data = await structured_data_gen.generate_product_schema(product_data)
        
        assert structured_data['@type'] == 'Product'
        assert structured_data['offers']['price'] == 299.99
        assert 'aggregateRating' in structured_data
        assert structured_data['brand']['@type'] == 'Brand'
        
        # Validate JSON-LD format
        json.loads(json.dumps(structured_data))  # Should not raise
        
    @pytest.mark.asyncio
    async def test_dynamic_meta_tag_optimization(self):
        """Test dynamic, content-aware meta tag generation."""
        seo_optimizer = AdvancedSEOOptimizer()
        
        page_context = {
            'product': {
                'name': 'Blue Light Blocking Glasses',
                'category': 'Computer Glasses',
                'price': 149.99
            },
            'store': {
                'name': 'EyewearShop',
                'description': 'Premium eyewear for modern life'
            }
        }
        
        # MUST implement: Dynamic meta generation with optimization
        meta_tags = await seo_optimizer.generate_optimized_meta_tags(page_context)
        
        assert len(meta_tags['title']) <= 60  # SEO best practice
        assert len(meta_tags['description']) <= 160
        assert 'Blue Light Blocking Glasses' in meta_tags['title']
        assert meta_tags['og:type'] == 'product'
        assert meta_tags['twitter:card'] == 'summary_large_image'
        
    @pytest.mark.asyncio
    async def test_wcag_accessibility_compliance(self):
        """Test WCAG 2.1 AA accessibility compliance."""
        accessibility_validator = AccessibilityValidator()
        
        html_content = await render_test_product_page()
        
        # MUST implement: Comprehensive accessibility validation
        accessibility_report = await accessibility_validator.validate_wcag_compliance(html_content)
        
        assert accessibility_report['compliance_level'] == 'WCAG_2_1_AA'
        assert accessibility_report['violations'] == []
        assert accessibility_report['color_contrast']['min_ratio'] >= 4.5
        assert accessibility_report['semantic_html']['score'] >= 0.95
        assert accessibility_report['keyboard_navigation']['accessible'] is True
        
    @pytest.mark.asyncio
    async def test_core_web_vitals_optimization(self):
        """Test Core Web Vitals optimization for performance SEO."""
        seo_optimizer = AdvancedSEOOptimizer()
        
        page_config = {
            'enable_critical_css': True,
            'lazy_load_images': True,
            'preload_fonts': True
        }
        
        # MUST implement: Core Web Vitals optimization
        optimizations = await seo_optimizer.optimize_core_web_vitals(page_config)
        
        assert optimizations['critical_css']['inlined'] is True
        assert optimizations['largest_contentful_paint']['optimized'] is True
        assert optimizations['cumulative_layout_shift']['score'] < 0.1
        assert optimizations['first_input_delay']['target_ms'] < 100
        
    @pytest.mark.asyncio
    async def test_international_seo_hreflang(self):
        """Test hreflang implementation for international SEO."""
        seo_optimizer = AdvancedSEOOptimizer()
        
        site_config = {
            'default_language': 'en',
            'supported_languages': ['en', 'es', 'fr', 'de'],
            'regions': ['us', 'mx', 'fr', 'de']
        }
        
        # MUST implement: Proper hreflang generation
        hreflang_tags = await seo_optimizer.generate_hreflang_tags(site_config, 'product/123')
        
        assert len(hreflang_tags) == 4
        assert any('hreflang="en-us"' in tag for tag in hreflang_tags)
        assert any('hreflang="es-mx"' in tag for tag in hreflang_tags)
        assert all('rel="alternate"' in tag for tag in hreflang_tags)
```

**Implementation Requirements**:
1. **AdvancedSEOOptimizer Class** with comprehensive optimization
2. **Structured Data Generator** for complete Schema.org support
3. **AccessibilityValidator** with WCAG 2.1 AA compliance
4. **Core Web Vitals** optimization and monitoring
5. **International SEO** with hreflang and multi-language support
6. **SEO Analytics** with performance tracking

**Expected Files Created**:
- `src/store_generation/seo/advanced_optimizer.py`
- `src/store_generation/seo/structured_data.py`
- `src/store_generation/seo/accessibility.py`
- `src/store_generation/seo/core_web_vitals.py`
- `tests/template_engine/test_advanced_seo.py`
- `tests/template_engine/test_accessibility_compliance.py`

---

## Batch 7: Face Shape ML Integration

### Prompt [LS2_B7_FACE_SHAPE_ML_INTEGRATION]

**Context**: Implement comprehensive face shape analysis integration with ML model connectivity, compatibility scoring, and personalized recommendations.

**Test-Driven Implementation**:

```python
# tests/template_engine/test_face_shape_ml.py
import pytest
import asyncio
from unittest.mock import Mock, AsyncMock
from src.store_generation.ml.face_shape_analyzer import FaceShapeAnalyzer
from src.store_generation.ml.compatibility_scorer import CompatibilityScorer
from src.store_generation.ml.recommendation_engine import MLRecommendationEngine

class TestFaceShapeMLIntegration:
    """Test face shape ML integration and recommendations."""
    
    @pytest.mark.asyncio
    async def test_ml_model_integration_connectivity(self):
        """Test connection to face shape analysis ML service."""
        analyzer = FaceShapeAnalyzer(
            model_endpoint="https://ml-api.example.com/face-analysis",
            api_key="test_key"
        )
        
        # MUST implement: Real ML model integration
        face_image_data = load_test_face_image()
        
        analysis_result = await analyzer.analyze_face_shape(face_image_data)
        
        assert analysis_result['face_shape'] in ['oval', 'round', 'square', 'heart', 'diamond']
        assert analysis_result['confidence_score'] >= 0.8
        assert 'facial_measurements' in analysis_result
        assert analysis_result['processing_time_ms'] < 500
        
    @pytest.mark.asyncio
    async def test_compatibility_scoring_algorithm(self):
        """Test real-time face shape to eyewear compatibility scoring."""
        compatibility_scorer = CompatibilityScorer()
        
        face_analysis = {
            'face_shape': 'oval',
            'facial_measurements': {
                'face_width': 140,
                'face_length': 180,
                'jawline_width': 120
            }
        }
        
        eyewear_product = {
            'frame_width': 135,
            'lens_height': 45,
            'bridge_width': 18,
            'temple_length': 145,
            'frame_style': 'rectangular'
        }
        
        # MUST implement: Scientific compatibility scoring
        compatibility = await compatibility_scorer.calculate_compatibility(
            face_analysis, eyewear_product
        )
        
        assert 0.0 <= compatibility['score'] <= 1.0
        assert 'fit_analysis' in compatibility
        assert 'style_match' in compatibility
        assert compatibility['recommendations'] is not None
        
    @pytest.mark.asyncio
    async def test_personalized_recommendation_engine(self):
        """Test ML-driven personalized product recommendations."""
        recommendation_engine = MLRecommendationEngine()
        
        user_profile = {
            'face_shape': 'round',
            'style_preferences': ['modern', 'minimalist'],
            'previous_purchases': ['sunglasses', 'reading_glasses'],
            'price_range': {'min': 100, 'max': 300}
        }
        
        product_catalog = load_test_product_catalog(size=1000)
        
        # MUST implement: Sophisticated recommendation algorithm
        recommendations = await recommendation_engine.generate_recommendations(
            user_profile, product_catalog, limit=10
        )
        
        assert len(recommendations) == 10
        assert all(rec['compatibility_score'] >= 0.7 for rec in recommendations)
        assert all(100 <= rec['price'] <= 300 for rec in recommendations)
        assert recommendations[0]['compatibility_score'] >= recommendations[-1]['compatibility_score']
        
    @pytest.mark.asyncio
    async def test_template_integration_ml_data(self):
        """Test seamless integration of ML data into template rendering."""
        template_engine = SecureTemplateEngine()
        face_shape_service = FaceShapeMLService()
        
        template_context = {
            'user_id': 'user_789',
            'face_image_url': 'https://example.com/face.jpg'
        }
        
        # MUST implement: ML-enhanced template context
        enhanced_context = await face_shape_service.enhance_template_context(template_context)
        
        result = await template_engine.render_template(
            'product_recommendations.html', 'modern-minimal', enhanced_context
        )
        
        assert 'data-face-shape=' in result
        assert 'data-compatibility-scores=' in result
        assert 'recommended-products' in result
        assert len(enhanced_context['ml_recommendations']) > 0
```

**Implementation Requirements**:
1. **FaceShapeAnalyzer Class** with ML model integration
2. **CompatibilityScorer** with scientific scoring algorithms
3. **MLRecommendationEngine** with personalization capabilities
4. **Template Integration** with ML data injection
5. **Performance Optimization** for real-time analysis
6. **Error Handling** with ML service resilience

**Expected Files Created**:
- `src/store_generation/ml/face_shape_analyzer.py`
- `src/store_generation/ml/compatibility_scorer.py`
- `src/store_generation/ml/recommendation_engine.py`
- `src/store_generation/ml/integration_service.py`
- `tests/template_engine/test_face_shape_ml.py`
- `tests/template_engine/test_ml_integration.py`

---

## Batch 8: Comprehensive Testing Framework

### Prompt [LS2_B8_COMPREHENSIVE_TESTING]

**Context**: Implement comprehensive testing framework achieving >95% coverage with performance benchmarks, security validation, and integration testing.

**Test-Driven Implementation**:

```python
# tests/template_engine/test_comprehensive_framework.py
import pytest
import asyncio
import coverage
from unittest.mock import Mock, patch
from src.store_generation.testing.framework import ComprehensiveTestFramework
from src.store_generation.testing.performance_benchmarks import PerformanceBenchmarks
from src.store_generation.testing.security_scanner import SecurityScanner

class TestComprehensiveTestingFramework:
    """Test comprehensive testing framework implementation."""
    
    @pytest.mark.asyncio
    async def test_coverage_above_95_percent(self):
        """Test that code coverage exceeds 95% requirement."""
        test_framework = ComprehensiveTestFramework()
        
        # MUST implement: Automated coverage tracking
        coverage_report = await test_framework.run_coverage_analysis()
        
        assert coverage_report['total_coverage'] > 0.95  # >95% requirement
        assert coverage_report['branch_coverage'] > 0.90  # >90% branch coverage
        assert coverage_report['uncovered_lines'] < 50  # Minimal uncovered code
        
        # Critical modules must have 100% coverage
        critical_modules = [
            'template_engine.secure_template_engine',
            'tenancy.security_framework',
            'database.transaction_manager'
        ]
        
        for module in critical_modules:
            assert coverage_report['modules'][module]['coverage'] == 1.0
            
    @pytest.mark.asyncio
    async def test_performance_benchmark_validation(self):
        """Test performance benchmarks meet all requirements."""
        benchmarks = PerformanceBenchmarks()
        
        # MUST implement: Comprehensive performance validation
        benchmark_results = await benchmarks.run_all_benchmarks()
        
        # Core performance requirements
        assert benchmark_results['store_generation_1000_products']['duration'] < 30.0
        assert benchmark_results['memory_usage_10k_products']['peak_mb'] < 500
        assert benchmark_results['template_render_single']['avg_ms'] < 100
        assert benchmark_results['database_query_performance']['avg_ms'] < 50
        
        # Scalability requirements
        assert benchmark_results['concurrent_requests']['success_rate'] > 0.99
        assert benchmark_results['cdn_upload_performance']['avg_ms'] < 1000
        
    @pytest.mark.asyncio
    async def test_security_vulnerability_scanning(self):
        """Test comprehensive security vulnerability scanning."""
        security_scanner = SecurityScanner()
        
        # MUST implement: Automated security scanning
        security_report = await security_scanner.scan_all_components()
        
        # Zero critical vulnerabilities allowed
        assert security_report['critical_vulnerabilities'] == 0
        assert security_report['high_vulnerabilities'] == 0
        assert security_report['template_injection_tests']['passed'] is True
        assert security_report['xss_prevention_tests']['passed'] is True
        assert security_report['sql_injection_tests']['passed'] is True
        
        # Security best practices validation
        assert security_report['security_headers']['implemented'] is True
        assert security_report['input_validation']['comprehensive'] is True
        assert security_report['authentication']['secure'] is True
        
    @pytest.mark.asyncio
    async def test_end_to_end_integration_scenarios(self):
        """Test complete end-to-end integration scenarios."""
        test_framework = ComprehensiveTestFramework()
        
        # MUST implement: Full workflow integration tests
        integration_scenarios = [
            'tenant_onboarding_complete_workflow',
            'store_generation_with_ml_recommendations',
            'multi_tenant_concurrent_operations',
            'disaster_recovery_and_failover'
        ]
        
        results = {}
        for scenario in integration_scenarios:
            results[scenario] = await test_framework.run_integration_scenario(scenario)
            
        # All scenarios must pass
        assert all(result['passed'] for result in results.values())
        assert all(result['performance_acceptable'] for result in results.values())
        assert all(result['security_validated'] for result in results.values())
        
    @pytest.mark.asyncio
    async def test_regression_testing_automation(self):
        """Test automated regression testing framework."""
        test_framework = ComprehensiveTestFramework()
        
        # MUST implement: Automated regression detection
        baseline_metrics = await test_framework.establish_performance_baseline()
        
        # Simulate code changes
        await simulate_code_changes()
        
        # Run regression tests
        regression_results = await test_framework.detect_performance_regressions(baseline_metrics)
        
        assert regression_results['performance_regression_detected'] is False
        assert regression_results['functionality_regression_detected'] is False
        assert regression_results['security_regression_detected'] is False
        
    @pytest.mark.asyncio
    async def test_load_testing_enterprise_scale(self):
        """Test load testing at enterprise scale."""
        test_framework = ComprehensiveTestFramework()
        
        load_test_config = {
            'concurrent_users': 1000,
            'test_duration_minutes': 30,
            'ramp_up_time_minutes': 5,
            'scenarios': [
                'store_generation',
                'product_browsing',
                'ml_recommendations',
                'admin_operations'
            ]
        }
        
        # MUST implement: Enterprise-scale load testing
        load_test_results = await test_framework.run_load_test(load_test_config)
        
        assert load_test_results['avg_response_time_ms'] < 500
        assert load_test_results['error_rate'] < 0.01  # <1% error rate
        assert load_test_results['throughput_rps'] > 100  # >100 requests/second
        assert load_test_results['resource_utilization']['cpu'] < 0.8  # <80% CPU
        assert load_test_results['resource_utilization']['memory'] < 0.8  # <80% memory
```

**Implementation Requirements**:
1. **ComprehensiveTestFramework Class** with full testing orchestration
2. **Performance Benchmarks** with automated validation
3. **Security Scanner** with vulnerability detection
4. **Integration Testing** with end-to-end scenarios
5. **Regression Testing** with automated baseline comparison
6. **Load Testing** with enterprise-scale simulation

**Expected Files Created**:
- `src/store_generation/testing/framework.py`
- `src/store_generation/testing/performance_benchmarks.py`
- `src/store_generation/testing/security_scanner.py`
- `src/store_generation/testing/integration_scenarios.py`
- `tests/template_engine/test_comprehensive_framework.py`
- `tests/template_engine/test_enterprise_validation.py`

---

## Implementation Execution Strategy

### TDD Red-Green-Refactor Workflow

1. **RED Phase**: Implement all test cases first (failing tests)
2. **GREEN Phase**: Implement minimum code to pass tests
3. **REFACTOR Phase**: Optimize and enhance implementation

### Batch Execution Order

Execute batches in dependency order:
1. **Batch 1**: Secure Template Engine (foundation)
2. **Batch 3**: Database Integration (data layer)
3. **Batch 5**: Multi-Tenant Security (isolation)
4. **Batch 2**: Asset Pipeline (optimization)
5. **Batch 4**: Performance Monitoring (observability)
6. **Batch 6**: Advanced SEO (enhancement)
7. **Batch 7**: ML Integration (intelligence)
8. **Batch 8**: Comprehensive Testing (validation)

### Success Criteria Validation

Each batch must achieve:
- **>95% test coverage** for all implemented code
- **Zero security vulnerabilities** in security scans
- **Performance benchmarks met** for all operations
- **Complete integration** with existing infrastructure
- **Production-ready** deployment artifacts

### Integration with Existing Infrastructure

All implementations must integrate with:
- Existing [`tests/template_engine/`](tests/template_engine/:1) structure
- Current [`themes/`](themes/:1) directory organization
- MongoDB foundation from [`tests/mongodb_foundation/`](tests/mongodb_foundation/:1)
- CI/CD pipeline requirements

---

## Conclusion

This comprehensive set of batched prompts provides complete enterprise-grade implementation specifications for the Store Generation Service Foundation. Each prompt is designed to:

1. **Replace primitive implementations** with enterprise-grade solutions
2. **Follow TDD principles** with comprehensive test coverage
3. **Meet all performance requirements** from test specifications
4. **Implement security best practices** for multi-tenant environments
5. **Integrate seamlessly** with existing infrastructure
6. **Provide production-ready** deployment artifacts

The implementation will transform the current primitive string replacement system into a robust, scalable, and secure enterprise platform capable of generating high-quality stores for 1000+ products in under 30 seconds while maintaining strict security, performance, and quality standards.