"""
Comprehensive RBAC and security validation tests for manufacturer security foundation.
Based on test specifications in test_specs_manufacturer_security_foundation_LS8.md.

This test suite validates:
1. Tier-based RBAC with comprehensive permission matrix
2. Usage limits enforcement and quota management
3. Security threat detection and validation
4. Business data validation and integrity
5. Performance benchmarks for all security operations
"""

import pytest
import asyncio
import time
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.auth.manufacturer_rbac import (
        ManufacturerRBACManager, ManufacturerRole, ManufacturerPermission, 
        ManufacturerContext, UsageLimits, UsageResult, PermissionResult
    )
    from src.security.manufacturer_validator import (
        ManufacturerSecurityValidator, SecurityThreat, ValidationResult,
        ThreatDetectionResult, BusinessDataValidationResult
    )
    from src.auth.exceptions import (
        InsufficientPermissionsError, RateLimitExceededError,
        SecurityThreatDetectedError, QuotaExceededError
    )
except ImportError as e:
    pytest.skip(f"RBAC and security validation modules not implemented: {e}", allow_module_level=True)


@pytest.fixture
async def rbac_manager():
    """
    RBAC Manager fixture with comprehensive configuration.
    NO MOCKS - Real implementation required.
    """
    rbac_manager = ManufacturerRBACManager(
        cache_enabled=True,
        cache_ttl_seconds=300,
        usage_tracking_enabled=True,
        quota_enforcement_enabled=True
    )
    await rbac_manager.initialize()
    return rbac_manager


@pytest.fixture
async def security_validator():
    """
    Security Validator fixture with threat patterns loaded.
    NO MOCKS - Real implementation required.
    """
    validator = ManufacturerSecurityValidator(
        threat_detection_enabled=True,
        real_time_monitoring=True,
        performance_optimized=True
    )
    await validator.load_threat_patterns()
    await validator.initialize_ml_models()
    return validator


@pytest.fixture
def manufacturer_contexts():
    """Fixture providing manufacturer contexts for different tiers"""
    return {
        'free': ManufacturerContext(
            manufacturer_id="mfg_free_rbac_001",
            company_name="Free Tier RBAC Test Co",
            email="free.rbac@testeyewear.com",
            tier="free",
            roles=[ManufacturerRole.MANUFACTURER_FREE],
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
            ip_address="192.168.1.100",
            user_agent="TestAgent/1.0"
        ),
        'professional': ManufacturerContext(
            manufacturer_id="mfg_pro_rbac_001",
            company_name="Professional RBAC Test Corp",
            email="pro.rbac@testeyewear.com",
            tier="professional",
            roles=[ManufacturerRole.MANUFACTURER_PAID],
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
            ip_address="192.168.1.101",
            user_agent="TestAgent/1.0"
        ),
        'enterprise': ManufacturerContext(
            manufacturer_id="mfg_ent_rbac_001",
            company_name="Enterprise RBAC Test Solutions",
            email="enterprise.rbac@testeyewear.com",
            tier="enterprise",
            roles=[ManufacturerRole.MANUFACTURER_ENTERPRISE],
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
            ip_address="192.168.1.102",
            user_agent="TestAgent/1.0"
        )
    }


class TestTierBasedRBAC:
    """Comprehensive tier-based RBAC permission matrix tests"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_complete_permission_matrix_validation(self, rbac_manager, manufacturer_contexts):
        """
        Test the complete permission matrix across all manufacturer tiers.
        
        Requirements:
        - Free tier: UPLOAD_PRODUCTS, VIEW_BASIC_ANALYTICS only
        - Professional tier: + ACCESS_ML_TOOLS, EXPORT_DATA, API_ACCESS, ADVANCED_ANALYTICS
        - Enterprise tier: + BULK_OPERATIONS, WHITE_LABEL_ACCESS
        - Permission checking performance < 5ms per check
        """
        
        # Define complete permission matrix
        permission_matrix = {
            'free': {
                'allowed': [
                    ManufacturerPermission.UPLOAD_PRODUCTS,
                    ManufacturerPermission.VIEW_BASIC_ANALYTICS
                ],
                'denied': [
                    ManufacturerPermission.ACCESS_ML_TOOLS,
                    ManufacturerPermission.EXPORT_DATA,
                    ManufacturerPermission.API_ACCESS,
                    ManufacturerPermission.ADVANCED_ANALYTICS,
                    ManufacturerPermission.BULK_OPERATIONS,
                    ManufacturerPermission.WHITE_LABEL_ACCESS
                ]
            },
            'professional': {
                'allowed': [
                    ManufacturerPermission.UPLOAD_PRODUCTS,
                    ManufacturerPermission.VIEW_BASIC_ANALYTICS,
                    ManufacturerPermission.ACCESS_ML_TOOLS,
                    ManufacturerPermission.EXPORT_DATA,
                    ManufacturerPermission.API_ACCESS,
                    ManufacturerPermission.ADVANCED_ANALYTICS
                ],
                'denied': [
                    ManufacturerPermission.BULK_OPERATIONS,
                    ManufacturerPermission.WHITE_LABEL_ACCESS
                ]
            },
            'enterprise': {
                'allowed': [
                    ManufacturerPermission.UPLOAD_PRODUCTS,
                    ManufacturerPermission.VIEW_BASIC_ANALYTICS,
                    ManufacturerPermission.ACCESS_ML_TOOLS,
                    ManufacturerPermission.EXPORT_DATA,
                    ManufacturerPermission.API_ACCESS,
                    ManufacturerPermission.ADVANCED_ANALYTICS,
                    ManufacturerPermission.BULK_OPERATIONS,
                    ManufacturerPermission.WHITE_LABEL_ACCESS
                ],
                'denied': []  # Enterprise has all permissions
            }
        }
        
        # Test each tier's permissions
        for tier_name, context in manufacturer_contexts.items():
            tier_permissions = permission_matrix[tier_name]
            
            # Test allowed permissions
            for permission in tier_permissions['allowed']:
                start_time = time.perf_counter()
                
                has_permission = await rbac_manager.has_permission(context, permission)
                permission_result = await rbac_manager.check_permission_detailed(context, permission)
                
                check_time = time.perf_counter() - start_time
                
                assert has_permission == True, f"{tier_name} tier should have {permission.value}"
                assert permission_result.granted == True
                assert permission_result.reason == "tier_permission_granted"
                assert check_time < 0.005, f"Permission check too slow: {check_time:.4f}s"
            
            # Test denied permissions
            for permission in tier_permissions['denied']:
                start_time = time.perf_counter()
                
                has_permission = await rbac_manager.has_permission(context, permission)
                permission_result = await rbac_manager.check_permission_detailed(context, permission)
                
                check_time = time.perf_counter() - start_time
                
                assert has_permission == False, f"{tier_name} tier should NOT have {permission.value}"
                assert permission_result.granted == False
                assert "insufficient_tier" in permission_result.reason
                assert check_time < 0.005, f"Permission check too slow: {check_time:.4f}s"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_permission_enforcement_with_detailed_exceptions(self, rbac_manager, manufacturer_contexts):
        """
        Test permission enforcement with detailed exception handling.
        
        Requirements:
        - Raise InsufficientPermissionsError for denied permissions
        - Include meaningful error context
        - Log permission violations
        - Handle edge cases properly
        """
        free_context = manufacturer_contexts['free']
        
        # Test permission enforcement for denied permission
        with pytest.raises(InsufficientPermissionsError) as exc_info:
            await rbac_manager.enforce_permission(
                free_context,
                ManufacturerPermission.BULK_OPERATIONS,
                operation_context="bulk_product_upload"
            )
        
        error = exc_info.value
        assert error.manufacturer_id == free_context.manufacturer_id
        assert error.permission == ManufacturerPermission.BULK_OPERATIONS.value
        assert error.tier == free_context.tier
        assert "bulk_product_upload" in error.operation_context
        assert error.code == "INSUFFICIENT_PERMISSIONS"
        
        # Test permission enforcement for allowed permission (should not raise)
        try:
            await rbac_manager.enforce_permission(
                free_context,
                ManufacturerPermission.UPLOAD_PRODUCTS,
                operation_context="single_product_upload"
            )
        except InsufficientPermissionsError:
            pytest.fail("Should not raise exception for allowed permission")
        
        # Test permission violation logging
        violations = await rbac_manager.get_permission_violations(
            free_context.manufacturer_id,
            hours=1
        )
        
        assert len(violations) >= 1
        latest_violation = violations[0]
        assert latest_violation.manufacturer_id == free_context.manufacturer_id
        assert latest_violation.permission == ManufacturerPermission.BULK_OPERATIONS.value
        assert latest_violation.timestamp is not None
        assert latest_violation.ip_address == free_context.ip_address
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_permission_caching_and_performance_optimization(self, rbac_manager, manufacturer_contexts):
        """
        Test permission caching for performance optimization.
        
        Requirements:
        - Cache permission results for active sessions
        - Invalidate cache on role/tier changes
        - Performance: Cached checks < 1ms
        - Handle cache consistency
        """
        enterprise_context = manufacturer_contexts['enterprise']
        
        # First permission check (cache miss)
        start_time = time.perf_counter()
        has_permission_1 = await rbac_manager.has_permission(
            enterprise_context,
            ManufacturerPermission.WHITE_LABEL_ACCESS
        )
        first_check_time = time.perf_counter() - start_time
        
        assert has_permission_1 == True
        
        # Second permission check (cache hit)
        start_time = time.perf_counter()
        has_permission_2 = await rbac_manager.has_permission(
            enterprise_context,
            ManufacturerPermission.WHITE_LABEL_ACCESS
        )
        cached_check_time = time.perf_counter() - start_time
        
        assert has_permission_2 == True
        assert cached_check_time < 0.001, f"Cached check too slow: {cached_check_time:.4f}s"
        assert cached_check_time < first_check_time, "Cached check should be faster"
        
        # Test cache invalidation on tier change
        await rbac_manager.update_manufacturer_tier(
            enterprise_context.manufacturer_id,
            new_tier="professional"
        )
        
        # Permission check after tier change (cache should be invalidated)
        start_time = time.perf_counter()
        has_permission_3 = await rbac_manager.has_permission(
            enterprise_context,
            ManufacturerPermission.WHITE_LABEL_ACCESS
        )
        post_change_time = time.perf_counter() - start_time
        
        assert has_permission_3 == False, "Should lose enterprise permissions after downgrade"
        assert post_change_time > cached_check_time, "Should be slower after cache invalidation"
        
        # Verify cache consistency across multiple checks
        for _ in range(10):
            has_permission = await rbac_manager.has_permission(
                enterprise_context,
                ManufacturerPermission.WHITE_LABEL_ACCESS
            )
            assert has_permission == False, "Cache should be consistent"


class TestUsageLimitsAndQuotas:
    """Comprehensive usage limits and quota enforcement tests"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_comprehensive_tier_based_usage_limits(self, rbac_manager, manufacturer_contexts):
        """
        Test comprehensive usage limits enforcement across all tiers.
        
        Requirements:
        - Free: 100 products/month, 50 ML requests/month, 1000 API calls/month
        - Professional: 1000 products/month, 500 ML requests/month, 10000 API calls/month
        - Enterprise: Unlimited products, 5000 ML requests/month, 100000 API calls/month
        - Real-time usage tracking and enforcement
        """
        
        # Define tier-based usage limits
        tier_limits = {
            'free': {
                'product_uploads_monthly': 100,
                'ml_tool_requests_monthly': 50,
                'api_calls_monthly': 1000,
                'data_exports_monthly': 5
            },
            'professional': {
                'product_uploads_monthly': 1000,
                'ml_tool_requests_monthly': 500,
                'api_calls_monthly': 10000,
                'data_exports_monthly': 50
            },
            'enterprise': {
                'product_uploads_monthly': -1,  # Unlimited
                'ml_tool_requests_monthly': 5000,
                'api_calls_monthly': 100000,
                'data_exports_monthly': 500
            }
        }
        
        for tier_name, context in manufacturer_contexts.items():
            limits = tier_limits[tier_name]
            
            # Test product upload limits
            product_limit = limits['product_uploads_monthly']
            
            if product_limit > 0:  # Not unlimited
                # Test usage within limits
                for i in range(min(product_limit, 10)):  # Test first 10 uploads
                    usage_result = await rbac_manager.check_usage_limit(
                        context,
                        "product_uploads",
                        increment=1
                    )
                    
                    assert usage_result.allowed == True
                    assert usage_result.current_usage == i + 1
                    assert usage_result.limit == product_limit
                    assert usage_result.remaining == product_limit - (i + 1)
                
                # Simulate approaching limit
                await rbac_manager.set_current_usage(
                    context.manufacturer_id,
                    "product_uploads",
                    product_limit - 1
                )
                
                # Last allowed upload
                usage_result = await rbac_manager.check_usage_limit(
                    context,
                    "product_uploads",
                    increment=1
                )
                assert usage_result.allowed == True
                assert usage_result.remaining == 0
                
                # Exceeding limit should fail
                usage_result = await rbac_manager.check_usage_limit(
                    context,
                    "product_uploads",
                    increment=1
                )
                assert usage_result.allowed == False
                assert usage_result.remaining == 0
                assert "quota_exceeded" in usage_result.reason
            
            else:  # Unlimited
                # Test unlimited usage
                for i in range(1000, 1010):  # Test high usage numbers
                    usage_result = await rbac_manager.check_usage_limit(
                        context,
                        "product_uploads",
                        increment=1
                    )
                    assert usage_result.allowed == True
                    assert usage_result.limit == -1  # Unlimited indicator
            
            # Test ML tool request limits
            ml_limit = limits['ml_tool_requests_monthly']
            
            for i in range(min(ml_limit, 10)):
                usage_result = await rbac_manager.check_usage_limit(
                    context,
                    "ml_tool_requests",
                    increment=1
                )
                assert usage_result.allowed == True
            
            # Test API call limits
            api_limit = limits['api_calls_monthly']
            
            # Test batch API usage
            batch_size = min(api_limit // 10, 100)
            usage_result = await rbac_manager.check_usage_limit(
                context,
                "api_calls",
                increment=batch_size
            )
            assert usage_result.allowed == True
            assert usage_result.current_usage == batch_size
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_usage_quota_enforcement_and_overages(self, rbac_manager, manufacturer_contexts):
        """
        Test usage quota enforcement and overage handling.
        
        Requirements:
        - Block operations when quotas exceeded
        - Provide clear quota status in responses
        - Handle quota resets and upgrades
        - Track overage attempts
        """
        free_context = manufacturer_contexts['free']
        
        # Set usage near limit
        ml_limit = 50  # Free tier ML limit
        await rbac_manager.set_current_usage(
            free_context.manufacturer_id,
            "ml_tool_requests",
            ml_limit - 1
        )
        
        # Last allowed request
        usage_result = await rbac_manager.check_usage_limit(
            free_context,
            "ml_tool_requests",
            increment=1
        )
        assert usage_result.allowed == True
        assert usage_result.remaining == 0
        
        # Attempt to exceed quota
        with pytest.raises(QuotaExceededError) as exc_info:
            await rbac_manager.enforce_usage_limit(
                free_context,
                "ml_tool_requests",
                increment=1,
                operation_context="face_shape_analysis"
            )
        
        error = exc_info.value
        assert error.manufacturer_id == free_context.manufacturer_id
        assert error.resource_type == "ml_tool_requests"
        assert error.current_usage == ml_limit
        assert error.limit == ml_limit
        assert "face_shape_analysis" in error.operation_context
        
        # Track overage attempt
        overage_attempts = await rbac_manager.get_overage_attempts(
            free_context.manufacturer_id,
            hours=1
        )
        assert len(overage_attempts) >= 1
        
        latest_attempt = overage_attempts[0]
        assert latest_attempt.resource_type == "ml_tool_requests"
        assert latest_attempt.attempted_increment == 1
        assert latest_attempt.operation_context == "face_shape_analysis"
        
        # Test quota reset (monthly cycle)
        await rbac_manager.reset_monthly_quotas(free_context.manufacturer_id)
        
        usage_result = await rbac_manager.check_usage_limit(
            free_context,
            "ml_tool_requests",
            increment=1
        )
        assert usage_result.allowed == True
        assert usage_result.current_usage == 1
        assert usage_result.remaining == ml_limit - 1
        
        # Test tier upgrade quota handling
        await rbac_manager.upgrade_manufacturer_tier(
            free_context.manufacturer_id,
            new_tier="professional"
        )
        
        # Should have professional tier limits now
        usage_result = await rbac_manager.check_usage_limit(
            free_context,
            "ml_tool_requests",
            increment=100  # Would exceed free tier limit
        )
        assert usage_result.allowed == True  # Professional tier allows more
        assert usage_result.limit == 500  # Professional tier limit
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_real_time_usage_tracking_performance(self, rbac_manager, manufacturer_contexts):
        """
        Test real-time usage tracking performance under load.
        
        Requirements:
        - Handle concurrent usage updates
        - Maintain accuracy under load
        - Performance: Usage checks < 10ms
        - Prevent race conditions
        """
        professional_context = manufacturer_contexts['professional']
        
        # Test concurrent usage tracking
        concurrent_requests = 50
        
        async def track_usage(request_id):
            start_time = time.perf_counter()
            usage_result = await rbac_manager.check_usage_limit(
                professional_context,
                "api_calls",
                increment=1
            )
            tracking_time = time.perf_counter() - start_time
            
            return {
                'request_id': request_id,
                'allowed': usage_result.allowed,
                'current_usage': usage_result.current_usage,
                'tracking_time': tracking_time
            }
        
        # Execute concurrent usage tracking
        tasks = [track_usage(i) for i in range(concurrent_requests)]
        results = await asyncio.gather(*tasks)
        
        # Validate results
        assert len(results) == concurrent_requests
        
        # All requests should be allowed (within professional limits)
        for result in results:
            assert result['allowed'] == True
            assert result['tracking_time'] < 0.01, f"Usage tracking too slow: {result['tracking_time']:.4f}s"
        
        # Validate usage accuracy (should equal number of requests)
        final_usage = await rbac_manager.get_current_usage(
            professional_context.manufacturer_id,
            "api_calls"
        )
        assert final_usage == concurrent_requests, f"Usage tracking inaccurate: {final_usage} != {concurrent_requests}"
        
        # Test race condition prevention
        # Reset usage and test rapid concurrent increments
        await rbac_manager.reset_usage(
            professional_context.manufacturer_id,
            "api_calls"
        )
        
        # Rapid concurrent increments
        rapid_tasks = [
            rbac_manager.increment_usage(
                professional_context.manufacturer_id,
                "api_calls",
                1
            ) for _ in range(100)
        ]
        
        await asyncio.gather(*rapid_tasks)
        
        final_rapid_usage = await rbac_manager.get_current_usage(
            professional_context.manufacturer_id,
            "api_calls"
        )
        assert final_rapid_usage == 100, f"Race condition detected: {final_rapid_usage} != 100"


class TestSecurityThreatDetection:
    """Comprehensive security threat detection and validation tests"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_comprehensive_sql_injection_detection(self, security_validator):
        """
        Test comprehensive SQL injection detection patterns.
        
        Requirements:
        - Detect classic SQL injection patterns
        - Identify blind SQL injection attempts
        - Handle encoded and obfuscated payloads
        - Performance: Detection < 10ms per check
        """
        
        # Classic SQL injection patterns
        sql_injection_payloads = [
            "'; DROP TABLE products; --",
            "' OR '1'='1",
            "' OR 1=1 --",
            "' UNION SELECT * FROM users --",
            "'; INSERT INTO admin VALUES ('hacker', 'password'); --",
            "' AND (SELECT COUNT(*) FROM information_schema.tables) > 0 --",
            "' OR SLEEP(5) --",
            "' OR BENCHMARK(1000000,MD5(1)) --"
        ]
        
        # Blind SQL injection patterns
        blind_sql_payloads = [
            "' AND (SELECT SUBSTRING(@@version,1,1))='5' --",
            "' AND (SELECT COUNT(*) FROM users WHERE username='admin')=1 --",
            "' AND ASCII(SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1))>64 --",
            "' AND (SELECT LENGTH(password) FROM users WHERE username='admin')>5 --"
        ]
        
        # Encoded/obfuscated payloads
        encoded_payloads = [
            "%27%20OR%20%271%27%3D%271",  # URL encoded
            "&#39; OR &#39;1&#39;=&#39;1",  # HTML entity encoded
            "\\' OR \\'1\\'=\\'1",  # Escaped quotes
            "' /*comment*/ OR /*comment*/ '1'='1",  # Comment obfuscation
        ]
        
        all_payloads = sql_injection_payloads + blind_sql_payloads + encoded_payloads
        
        for payload in all_payloads:
            test_data = {
                "product_name": payload,
                "manufacturer_id": "test_mfg_001",
                "description": "Normal product description",
                "sku": "TEST123"
            }
            
            start_time = time.perf_counter()
            threat_result = await security_validator.detect_threat("sql_injection", test_data)
            detection_time = time.perf_counter() - start_time
            
            assert threat_result.threat_detected == True, f"Failed to detect SQL injection: {payload}"
            assert threat_result.threat_type == "sql_injection"
            assert threat_result.severity in ["high", "critical"]
            assert threat_result.confidence > 0.8, f"Low confidence for obvious SQL injection: {payload}"
            assert detection_time < 0.01, f"Detection too slow: {detection_time:.4f}s for {payload}"
            
            # Validate threat details
            assert threat_result.detected_patterns is not None
            assert len(threat_result.detected_patterns) > 0
            assert threat_result.risk_score > 7.0  # High risk score for SQL injection
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_nosql_injection_detection_for_mongodb(self, security_validator):
        """
        Test NoSQL injection detection specific to MongoDB operations.
        
        Requirements:
        - Detect MongoDB operator injection
        - Identify JavaScript injection in $where clauses
        - Handle nested object injection patterns
        - Validate against manufacturer scenarios
        """
        
        # MongoDB operator injection patterns
        mongodb_injection_payloads = [
            {"$ne": None},
            {"$gt": ""},
            {"$regex": ".*"},
            {"$where": "this.name == 'admin'"},
            {"$or": [{"name": "admin"}, {"role": "admin"}]},
            {"$and": [{"$where": "this.password.length > 0"}]},
            {"$expr": {"$gt": ["$price", 0]}},
            {"$jsonSchema": {"bsonType": "object"}}
        ]
        
        # JavaScript injection in $where clauses
        js_injection_payloads = [
            {"$where": "function() { return true; }"},
            {"$where": "this.constructor.constructor('return process')()"},
            {"$where": "sleep(5000)"},
            {"$where": "this.name.match(/admin/)"},
            {"$where": "Object.keys(this).length > 0"}
        ]
        
        # Nested object injection
        nested_injection_payloads = [
            {"manufacturer": {"$ne": None}},
            {"products": {"$elemMatch": {"$where": "this.price > 0"}}},
            {"metadata": {"$exists": True, "$ne": None}},
            {"settings": {"admin": {"$ne": None}}}
        ]
        
        all_nosql_payloads = mongodb_injection_payloads + js_injection_payloads + nested_injection_payloads
        
        for payload in all_nosql_payloads:
            test_data = {
                "query": payload,
                "manufacturer_id": "test_mfg_001",
                "operation": "product_search"
            }
            
            start_time = time.perf_counter()
            threat_result = await security_validator.detect_threat("nosql_injection", test_data)
            detection_time = time.perf_counter() - start_time
            
            assert threat_result.threat_detected == True, f"Failed to detect NoSQL injection: {payload}"
            assert threat_result.threat_type == "nosql_injection"
            assert threat_result.severity in ["medium", "high", "critical"]
            assert detection_time < 0.01, f"Detection too slow: {detection_time:.4f}s"
            
            # Validate MongoDB-specific detection
            assert "mongodb" in threat_result.threat_details.lower() or "nosql" in threat_result.threat_details.lower()
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_xss_and_script_injection_detection(self, security_validator):
        """
        Test XSS and script injection detection.
        
        Requirements:
        - Detect reflected and stored XSS patterns
        - Identify script tag injection attempts
        - Handle event handler injection
        - Validate against manufacturer profile data
        """
        
        # Classic XSS patterns
        xss_payloads = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "<svg onload=alert('xss')>",
            "<iframe src=javascript:alert('xss')></iframe>",
            "<body onload=alert('xss')>",
            "<input onfocus=alert('xss') autofocus>",
            "<details open ontoggle=alert('xss')>",
            "<marquee onstart=alert('xss')>"
        ]
        
        # Event handler injection
        event_handler_payloads = [
            "onmouseover=alert('xss')",
            "onclick=alert('xss')",
            "onerror=alert('xss')",
            "onload=alert('xss')",
            "onfocus=alert('xss')",
            "onblur=alert('xss')",
            "onchange=alert('xss')",
            "onsubmit=alert('xss')"
        ]
        
        # Encoded XSS
        encoded_xss_payloads = [
            "&lt;script&gt;alert('xss')&lt;/script&gt;",
            "%3Cscript%3Ealert('xss')%3C/script%3E",
            "&#60;script&#62;alert('xss')&#60;/script&#62;",
            "\\u003cscript\\u003ealert('xss')\\u003c/script\\u003e"
        ]
        
        all_xss_payloads = xss_payloads + event_handler_payloads + encoded_xss_payloads
        
        # Test XSS in manufacturer profile data
        profile_fields = [
            "company_description",
            "website_url",
            "contact_info",
            "company_bio",
            "marketing_message"
        ]
        
        for payload in all_xss_payloads:
            for field in profile_fields:
                test_data = {
                    field: payload,
                    "manufacturer_id": "test_mfg_001",
                    "data_type": "manufacturer_profile"
                }
                
                start_time = time.perf_counter()
                threat_result = await security_validator.detect_threat("xss", test_data)
                detection_time = time.perf_counter() - start_time
                
                assert threat_result.threat_detected == True, f"Failed to detect XSS in {field}: {payload}"
                assert threat_result.threat_type == "xss"
                assert threat_result.severity in ["medium", "high"]
                assert detection_time < 0.01, f"Detection too slow: {detection_time:.4f}s"
                
                # Validate XSS-specific detection
                assert "script" in threat_result.threat_details.lower() or "xss" in threat_result.threat_details.lower()
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_business_data_validation_comprehensive(self, security_validator):
        """
        Test comprehensive business data validation for manufacturers.
        
        Requirements:
        - Validate business license formats and checksums
        - Verify tax ID format compliance
        - Check email domain reputation
        - Validate phone number formats
        - Ensure address completeness
        """
        
        # Valid business data
        valid_business_data = {
            "business_license": "BL123456789",
            "tax_id": "12-3456789",  # EIN format
            "email": "business@legitimateeyewear.com",
            "phone": "+1-555-123-4567",
            "address": {
                "street": "123 Business Ave",
                "city": "Business City",
                "state": "CA",
                "zip": "90210",
                "country": "US"
            },
            "website": "https://legitimateeyewear.com",
            "company_name": "Legitimate Eyewear Co"
        }
        
        # Test valid data
        validation_result = await security_validator.validate_manufacturer_data(valid_business_data)
        
        assert validation_result.is_valid == True
        assert len(validation_result.errors) == 0
        assert validation_result.security_score > 0.8
        assert validation_result.risk_level == "low"
        
        # Test invalid business license formats
        invalid_licenses = [
            "INVALID",
            "123",
            "BL" + "X" * 50,  # Too long
            "",  # Empty
            "BL123456789; DROP TABLE licenses; --",  # SQL injection attempt
            "<script>alert('xss')</script>",  # XSS attempt
        ]
        
        for invalid_license in invalid_licenses:
            test_data = {**valid_business_data, "business_license": invalid_license}
            
            validation_result = await security_validator.validate_manufacturer_data(test_data)
            
            assert validation_result.is_valid == False
            assert any("business_license" in error.field for error in validation_result.errors)
            assert validation_result.security_score < 0.5
        
        # Test invalid tax ID formats
        invalid_tax_ids = [
            "123",  # Too short
            "12-34567890",  # Too long
            "XX-XXXXXXX",  # Invalid format
            "12-345678A",  # Invalid characters
            "",  # Empty
            "12-3456789; --",  # SQL injection attempt
        ]
        
        for invalid_tax_id in invalid_tax_ids:
            test_data = {**valid_business_data, "tax_id": invalid_tax_id}
            
            validation_result = await security_validator.validate_manufacturer_data(test_data)
            
            assert validation_result.is_valid == False
            assert any("tax_id" in error.field for error in validation_result.errors)
        
        # Test suspicious email domains
        suspicious_emails = [
            "business@tempmail.com",
            "business@10minutemail.com",
            "business@guerrillamail.com",
            "business@mailinator.com",
            "business@suspicious-domain.tk",
        ]
        
        for suspicious_email in suspicious_emails:
            test_data = {**valid_business_data, "email": suspicious_email}
            
            validation_result = await security_validator.validate_manufacturer_data(test_data)
            
            # Should flag as suspicious but might still be valid
            assert validation_result.security_score < 0.7
            assert any("email" in warning.field for warning in validation_result.warnings)
        
        # Test invalid phone number formats
        invalid_phones = [
            "123",  # Too short
            "not-a-phone-number",
            "+1-555-123-456789",  # Too long
            "+999-555-123-4567",  # Invalid country code
            "",  # Empty
        ]
        
        for invalid_phone in invalid_phones:
            test_data = {**valid_business_data, "phone": invalid_phone}
            
            validation_result = await security_validator.validate_manufacturer_data(test_data)
            
            assert validation_result.is_valid == False
            assert any("phone" in error.field for error in validation_result.errors)
        
        # Test incomplete address data
        incomplete_addresses = [
            {"street": "123 Business Ave"},  # Missing city, state, zip
            {"city": "Business City"},  # Missing street, state, zip
            {"country": "US"},  # Missing all other fields
            {},  # Empty address
        ]
        
        for incomplete_address in incomplete_addresses:
            test_data = {**valid_business_data, "address": incomplete_address}
            
            validation_result = await security_validator.validate_manufacturer_data(test_data)
            
            assert validation_result.is_valid == False
            assert any("address" in error.field for error in validation_result.errors)


if __name__ == "__main__":
    # Run RBAC and security validation tests with verbose output
    pytest.main([__file__, "-v", "--tb=short", "-m", "security"])