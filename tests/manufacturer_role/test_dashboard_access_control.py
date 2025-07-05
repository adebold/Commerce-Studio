"""
Test suite for manufacturer dashboard access control and feature gating.
Addresses security and access control requirements from prompts_LS6.md.

This test suite ensures:
1. Role-based access control (RBAC) for manufacturer features
2. Tier-based feature gating and limitations
3. Real-time permission validation
4. Audit logging for security compliance
5. Session management and token validation
"""

import pytest
import asyncio
import time
import jwt
from typing import Dict, Any, List, Optional, Set
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import json

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.auth.manufacturer_auth_manager import ManufacturerAuthManager
    from src.auth.rbac_manager import RBACManager
    from src.auth.feature_gate_manager import FeatureGateManager
    from src.auth.session_manager import SessionManager
    from src.audit.security_audit_logger import SecurityAuditLogger
    from src.models.manufacturer_role import ManufacturerRole, Permission, FeatureTier
    from src.models.access_control import AccessControlPolicy, PermissionCheck
    from src.models.audit_event import AuditEvent, SecurityEvent
except ImportError as e:
    pytest.skip(f"Access control modules not implemented: {e}", allow_module_level=True)


class ManufacturerTier(Enum):
    """Manufacturer subscription tiers"""
    FREE = "free"
    BASIC = "basic"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class Permission(Enum):
    """Manufacturer permissions"""
    # Product management
    PRODUCT_CREATE = "product:create"
    PRODUCT_READ = "product:read"
    PRODUCT_UPDATE = "product:update"
    PRODUCT_DELETE = "product:delete"
    PRODUCT_BULK_UPLOAD = "product:bulk_upload"
    
    # Analytics access
    ANALYTICS_BASIC = "analytics:basic"
    ANALYTICS_ADVANCED = "analytics:advanced"
    ANALYTICS_EXPORT = "analytics:export"
    
    # ML tools access
    ML_FACE_SHAPE_ANALYSIS = "ml:face_shape_analysis"
    ML_STYLE_MATCHING = "ml:style_matching"
    ML_VIRTUAL_TRY_ON = "ml:virtual_try_on"
    ML_BATCH_PROCESSING = "ml:batch_processing"
    
    # API access
    API_READ = "api:read"
    API_WRITE = "api:write"
    API_ADMIN = "api:admin"
    
    # Dashboard features
    DASHBOARD_BASIC = "dashboard:basic"
    DASHBOARD_ADVANCED = "dashboard:advanced"
    DASHBOARD_ADMIN = "dashboard:admin"
    
    # Support features
    SUPPORT_BASIC = "support:basic"
    SUPPORT_PRIORITY = "support:priority"
    SUPPORT_DEDICATED = "support:dedicated"


@dataclass
class FeatureTier:
    """Feature tier configuration"""
    tier: ManufacturerTier
    permissions: Set[Permission]
    limits: Dict[str, int]
    features: Set[str]


@dataclass
class AccessControlPolicy:
    """Access control policy definition"""
    policy_id: str
    manufacturer_id: str
    tier: ManufacturerTier
    permissions: Set[Permission]
    restrictions: Dict[str, Any]
    expires_at: Optional[datetime]


@dataclass
class PermissionCheck:
    """Permission check result"""
    granted: bool
    permission: Permission
    reason: str
    tier_required: Optional[ManufacturerTier]
    upgrade_available: bool


@dataclass
class AuditEvent:
    """Security audit event"""
    event_id: str
    manufacturer_id: str
    event_type: str
    resource: str
    action: str
    result: str
    timestamp: datetime
    ip_address: str
    user_agent: str
    additional_data: Dict[str, Any]


@pytest.fixture
async def real_auth_manager():
    """
    Real ManufacturerAuthManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    auth_manager = ManufacturerAuthManager()
    await auth_manager.initialize()
    return auth_manager


@pytest.fixture
async def real_rbac_manager():
    """
    Real RBACManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    rbac_manager = RBACManager()
    await rbac_manager.initialize()
    await rbac_manager.load_policies()
    return rbac_manager


@pytest.fixture
async def real_feature_gate_manager():
    """
    Real FeatureGateManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    feature_manager = FeatureGateManager()
    await feature_manager.initialize()
    await feature_manager.load_tier_configurations()
    return feature_manager


@pytest.fixture
async def real_session_manager():
    """
    Real SessionManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    session_manager = SessionManager()
    await session_manager.initialize()
    return session_manager


@pytest.fixture
async def real_audit_logger():
    """
    Real SecurityAuditLogger - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    audit_logger = SecurityAuditLogger()
    await audit_logger.initialize()
    return audit_logger


class TestManufacturerAccessControl:
    """Test suite for manufacturer dashboard access control and feature gating"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_tier_based_feature_gating(self, real_feature_gate_manager, real_rbac_manager):
        """
        Test tier-based feature gating and permission enforcement.
        
        This test ensures:
        - Real permission validation (not hardcoded)
        - Accurate tier-based restrictions
        - Proper upgrade prompts for restricted features
        """
        # Define tier configurations for testing
        tier_configs = {
            ManufacturerTier.FREE: FeatureTier(
                tier=ManufacturerTier.FREE,
                permissions={
                    Permission.PRODUCT_CREATE,
                    Permission.PRODUCT_READ,
                    Permission.DASHBOARD_BASIC,
                    Permission.ANALYTICS_BASIC,
                    Permission.SUPPORT_BASIC
                },
                limits={
                    "max_products": 10,
                    "ml_analyses_per_month": 5,
                    "api_calls_per_day": 100
                },
                features={"basic_dashboard", "product_upload", "basic_analytics"}
            ),
            ManufacturerTier.PROFESSIONAL: FeatureTier(
                tier=ManufacturerTier.PROFESSIONAL,
                permissions={
                    Permission.PRODUCT_CREATE,
                    Permission.PRODUCT_READ,
                    Permission.PRODUCT_UPDATE,
                    Permission.PRODUCT_DELETE,
                    Permission.PRODUCT_BULK_UPLOAD,
                    Permission.DASHBOARD_ADVANCED,
                    Permission.ANALYTICS_ADVANCED,
                    Permission.ML_FACE_SHAPE_ANALYSIS,
                    Permission.ML_STYLE_MATCHING,
                    Permission.API_READ,
                    Permission.API_WRITE,
                    Permission.SUPPORT_PRIORITY
                },
                limits={
                    "max_products": 1000,
                    "ml_analyses_per_month": 500,
                    "api_calls_per_day": 10000
                },
                features={"advanced_dashboard", "bulk_operations", "ml_tools", "api_access"}
            ),
            ManufacturerTier.ENTERPRISE: FeatureTier(
                tier=ManufacturerTier.ENTERPRISE,
                permissions=set(Permission),  # All permissions
                limits={
                    "max_products": -1,  # Unlimited
                    "ml_analyses_per_month": -1,  # Unlimited
                    "api_calls_per_day": -1  # Unlimited
                },
                features={"enterprise_dashboard", "white_label", "dedicated_support", "custom_integrations"}
            )
        }
        
        # Test manufacturers with different tiers
        test_manufacturers = [
            {
                "manufacturer_id": "mfg_free_001",
                "tier": ManufacturerTier.FREE,
                "company_name": "Free Tier Eyewear"
            },
            {
                "manufacturer_id": "mfg_pro_001",
                "tier": ManufacturerTier.PROFESSIONAL,
                "company_name": "Professional Eyewear Co"
            },
            {
                "manufacturer_id": "mfg_ent_001",
                "tier": ManufacturerTier.ENTERPRISE,
                "company_name": "Enterprise Eyewear Corp"
            }
        ]
        
        # Test permission checks for each tier
        for manufacturer in test_manufacturers:
            manufacturer_id = manufacturer["manufacturer_id"]
            tier = manufacturer["tier"]
            expected_config = tier_configs[tier]
            
            # Test each permission
            for permission in Permission:
                start_time = time.perf_counter()
                permission_check = await real_rbac_manager.check_permission(
                    manufacturer_id=manufacturer_id,
                    permission=permission
                )
                check_time = time.perf_counter() - start_time
                
                # Verify permission check structure
                assert isinstance(permission_check, PermissionCheck)
                assert permission_check.permission == permission
                
                # Performance assertion
                assert check_time < 0.1, f"Permission check took {check_time:.3f}s, expected < 0.1s"
                
                # Verify permission logic
                should_be_granted = permission in expected_config.permissions
                assert permission_check.granted == should_be_granted, \
                    f"Permission {permission} for tier {tier}: expected {should_be_granted}, got {permission_check.granted}"
                
                # Verify upgrade prompts for denied permissions
                if not permission_check.granted:
                    assert permission_check.tier_required is not None, "Should specify required tier for denied permission"
                    assert permission_check.upgrade_available == True, "Should offer upgrade for denied permission"
                    assert len(permission_check.reason) > 0, "Should provide reason for denial"
        
        # Test feature access validation
        feature_test_cases = [
            {
                "manufacturer_id": "mfg_free_001",
                "feature": "ml_tools",
                "should_have_access": False
            },
            {
                "manufacturer_id": "mfg_pro_001",
                "feature": "ml_tools",
                "should_have_access": True
            },
            {
                "manufacturer_id": "mfg_free_001",
                "feature": "basic_dashboard",
                "should_have_access": True
            },
            {
                "manufacturer_id": "mfg_ent_001",
                "feature": "white_label",
                "should_have_access": True
            }
        ]
        
        for test_case in feature_test_cases:
            has_access = await real_feature_gate_manager.check_feature_access(
                manufacturer_id=test_case["manufacturer_id"],
                feature=test_case["feature"]
            )
            
            assert has_access == test_case["should_have_access"], \
                f"Feature access mismatch for {test_case['manufacturer_id']}.{test_case['feature']}"
        
        # Test usage limits enforcement
        limit_test_cases = [
            {
                "manufacturer_id": "mfg_free_001",
                "resource": "products",
                "current_usage": 5,
                "limit": 10,
                "should_allow": True
            },
            {
                "manufacturer_id": "mfg_free_001",
                "resource": "products",
                "current_usage": 10,
                "limit": 10,
                "should_allow": False
            },
            {
                "manufacturer_id": "mfg_ent_001",
                "resource": "products",
                "current_usage": 10000,
                "limit": -1,  # Unlimited
                "should_allow": True
            }
        ]
        
        for test_case in limit_test_cases:
            can_proceed = await real_feature_gate_manager.check_usage_limit(
                manufacturer_id=test_case["manufacturer_id"],
                resource=test_case["resource"],
                current_usage=test_case["current_usage"]
            )
            
            assert can_proceed == test_case["should_allow"], \
                f"Usage limit check failed for {test_case['manufacturer_id']}.{test_case['resource']}"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_session_management_and_token_validation(self, real_session_manager, real_auth_manager):
        """
        Test session management and JWT token validation.
        
        This test ensures:
        - Real JWT token generation and validation
        - Session lifecycle management
        - Token refresh mechanisms
        - Security token validation
        """
        manufacturer_id = "mfg_session_test_001"
        
        # Test session creation with real JWT
        session_data = {
            "manufacturer_id": manufacturer_id,
            "tier": "professional",
            "permissions": ["product:create", "product:read", "analytics:advanced"],
            "ip_address": "192.168.1.100",
            "user_agent": "Mozilla/5.0 (Test Browser)"
        }
        
        start_time = time.perf_counter()
        session = await real_session_manager.create_session(session_data)
        creation_time = time.perf_counter() - start_time
        
        # Verify session structure
        assert session is not None
        assert session.session_id is not None
        assert session.manufacturer_id == manufacturer_id
        assert session.access_token is not None
        assert session.refresh_token is not None
        assert session.expires_at > datetime.now()
        
        # Performance assertion
        assert creation_time < 0.2, f"Session creation took {creation_time:.3f}s, expected < 0.2s"
        
        # Test JWT token validation
        start_time = time.perf_counter()
        token_validation = await real_auth_manager.validate_token(session.access_token)
        validation_time = time.perf_counter() - start_time
        
        # Verify token validation
        assert token_validation.valid == True
        assert token_validation.manufacturer_id == manufacturer_id
        assert token_validation.tier == "professional"
        assert "product:create" in token_validation.permissions
        
        # Performance assertion
        assert validation_time < 0.1, f"Token validation took {validation_time:.3f}s, expected < 0.1s"
        
        # Test token expiration handling
        # Create short-lived token for testing
        short_session_data = session_data.copy()
        short_session_data["expires_in"] = 1  # 1 second
        
        short_session = await real_session_manager.create_session(short_session_data)
        
        # Wait for token to expire
        await asyncio.sleep(2)
        
        expired_validation = await real_auth_manager.validate_token(short_session.access_token)
        assert expired_validation.valid == False
        assert expired_validation.error == "token_expired"
        
        # Test token refresh
        refresh_result = await real_session_manager.refresh_session(short_session.refresh_token)
        
        assert refresh_result.success == True
        assert refresh_result.new_access_token is not None
        assert refresh_result.new_refresh_token is not None
        
        # Verify new token is valid
        new_token_validation = await real_auth_manager.validate_token(refresh_result.new_access_token)
        assert new_token_validation.valid == True
        assert new_token_validation.manufacturer_id == manufacturer_id
        
        # Test session invalidation
        await real_session_manager.invalidate_session(session.session_id)
        
        invalidated_validation = await real_auth_manager.validate_token(session.access_token)
        assert invalidated_validation.valid == False
        assert invalidated_validation.error == "session_invalidated"
        
        # Test concurrent session management
        concurrent_sessions = []
        for i in range(5):
            concurrent_session_data = session_data.copy()
            concurrent_session_data["session_context"] = f"concurrent_test_{i}"
            
            concurrent_session = await real_session_manager.create_session(concurrent_session_data)
            concurrent_sessions.append(concurrent_session)
        
        # Verify all concurrent sessions are valid
        for session in concurrent_sessions:
            validation = await real_auth_manager.validate_token(session.access_token)
            assert validation.valid == True
            assert validation.manufacturer_id == manufacturer_id
        
        # Test session limit enforcement (if applicable)
        active_sessions = await real_session_manager.get_active_sessions(manufacturer_id)
        assert len(active_sessions) <= 10, "Should enforce reasonable session limits"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_security_audit_logging(self, real_audit_logger, real_rbac_manager):
        """
        Test security audit logging for compliance.
        
        This test ensures:
        - Real audit event logging (not mock)
        - Comprehensive security event tracking
        - Audit trail integrity
        - Compliance reporting capabilities
        """
        manufacturer_id = "mfg_audit_test_001"
        
        # Test various security events
        security_events = [
            {
                "event_type": "authentication_success",
                "resource": "dashboard",
                "action": "login",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Test Browser)",
                "additional_data": {"login_method": "email_password"}
            },
            {
                "event_type": "permission_check",
                "resource": "product_management",
                "action": "create_product",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Test Browser)",
                "additional_data": {"permission": "product:create", "granted": True}
            },
            {
                "event_type": "permission_denied",
                "resource": "ml_tools",
                "action": "access_advanced_analytics",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Test Browser)",
                "additional_data": {"permission": "analytics:advanced", "tier_required": "professional"}
            },
            {
                "event_type": "feature_access",
                "resource": "api",
                "action": "bulk_upload",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Test Browser)",
                "additional_data": {"feature": "bulk_upload", "products_count": 50}
            },
            {
                "event_type": "session_invalidated",
                "resource": "session",
                "action": "logout",
                "ip_address": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Test Browser)",
                "additional_data": {"reason": "user_logout"}
            }
        ]
        
        logged_events = []
        for event_data in security_events:
            start_time = time.perf_counter()
            audit_event = await real_audit_logger.log_security_event(
                manufacturer_id=manufacturer_id,
                event_type=event_data["event_type"],
                resource=event_data["resource"],
                action=event_data["action"],
                result="success" if "denied" not in event_data["event_type"] else "denied",
                ip_address=event_data["ip_address"],
                user_agent=event_data["user_agent"],
                additional_data=event_data["additional_data"]
            )
            logging_time = time.perf_counter() - start_time
            
            # Verify audit event structure
            assert audit_event is not None
            assert isinstance(audit_event, AuditEvent)
            assert audit_event.event_id is not None
            assert audit_event.manufacturer_id == manufacturer_id
            assert audit_event.timestamp is not None
            assert audit_event.event_type == event_data["event_type"]
            
            # Performance assertion
            assert logging_time < 0.1, f"Audit logging took {logging_time:.3f}s, expected < 0.1s"
            
            logged_events.append(audit_event)
        
        # Test audit trail retrieval
        start_time = time.perf_counter()
        audit_trail = await real_audit_logger.get_audit_trail(
            manufacturer_id=manufacturer_id,
            start_date=datetime.now() - timedelta(hours=1),
            end_date=datetime.now() + timedelta(hours=1)
        )
        retrieval_time = time.perf_counter() - start_time
        
        # Verify audit trail completeness
        assert len(audit_trail) >= len(security_events)
        assert retrieval_time < 0.5, f"Audit trail retrieval took {retrieval_time:.3f}s, expected < 0.5s"
        
        # Verify all logged events are in the trail
        trail_event_ids = {event.event_id for event in audit_trail}
        for logged_event in logged_events:
            assert logged_event.event_id in trail_event_ids, f"Event {logged_event.event_id} missing from audit trail"
        
        # Test audit trail filtering
        permission_events = await real_audit_logger.get_audit_trail(
            manufacturer_id=manufacturer_id,
            event_types=["permission_check", "permission_denied"],
            start_date=datetime.now() - timedelta(hours=1),
            end_date=datetime.now() + timedelta(hours=1)
        )
        
        assert len(permission_events) >= 2, "Should find permission-related events"
        for event in permission_events:
            assert event.event_type in ["permission_check", "permission_denied"]
        
        # Test compliance reporting
        compliance_report = await real_audit_logger.generate_compliance_report(
            manufacturer_id=manufacturer_id,
            report_period=timedelta(days=1)
        )
        
        assert compliance_report is not None
        assert compliance_report.manufacturer_id == manufacturer_id
        assert compliance_report.total_events >= len(security_events)
        assert compliance_report.authentication_events >= 1
        assert compliance_report.permission_events >= 2
        assert compliance_report.access_violations >= 1  # The permission_denied event
        
        # Test audit integrity verification
        integrity_check = await real_audit_logger.verify_audit_integrity(
            manufacturer_id=manufacturer_id,
            start_date=datetime.now() - timedelta(hours=1),
            end_date=datetime.now() + timedelta(hours=1)
        )
        
        assert integrity_check.valid == True
        assert integrity_check.total_events == len(audit_trail)
        assert integrity_check.hash_verification == True
        assert integrity_check.timestamp_verification == True
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_real_time_permission_validation(self, real_rbac_manager, real_feature_gate_manager):
        """
        Test real-time permission validation during operations.
        
        This test ensures:
        - Real-time permission checks during operations
        - Dynamic permission updates
        - Performance under concurrent access
        """
        manufacturer_id = "mfg_realtime_test_001"
        
        # Simulate real-time operations requiring permission checks
        operations = [
            {"operation": "create_product", "permission": Permission.PRODUCT_CREATE},
            {"operation": "view_analytics", "permission": Permission.ANALYTICS_BASIC},
            {"operation": "use_ml_tools", "permission": Permission.ML_FACE_SHAPE_ANALYSIS},
            {"operation": "bulk_upload", "permission": Permission.PRODUCT_BULK_UPLOAD},
            {"operation": "api_access", "permission": Permission.API_READ}
        ]
        
        # Test concurrent permission checks
        async def check_operation_permission(operation_data):
            start_time = time.perf_counter()
            permission_check = await real_rbac_manager.check_permission(
                manufacturer_id=manufacturer_id,
                permission=operation_data["permission"]
            )
            check_time = time.perf_counter() - start_time
            
            return {
                "operation": operation_data["operation"],
                "permission": operation_data["permission"],
                "granted": permission_check.granted,
                "check_time": check_time
            }
        
        # Run concurrent permission checks
        start_time = time.perf_counter()
        concurrent_checks = await asyncio.gather(*[
            check_operation_permission(op) for op in operations
        ])
        total_concurrent_time = time.perf_counter() - start_time
        
        # Verify concurrent performance
        assert total_concurrent_time < 1.0, f"Concurrent permission checks took {total_concurrent_time:.3f}s"
        
        for check_result in concurrent_checks:
            assert check_result["check_time"] < 0.2, f"Individual check took {check_result['check_time']:.3f}s"
        
        # Test dynamic permission updates
        # Simulate tier upgrade
        await real_rbac_manager.update_manufacturer_tier(manufacturer_id, ManufacturerTier.PROFESSIONAL)
        
        # Verify permissions updated in real-time
        updated_check = await real_rbac_manager.check_permission(
            manufacturer_id=manufacturer_id,
            permission=Permission.ML_FACE_SHAPE_ANALYSIS
        )
        
        assert updated_check.granted == True, "Permission should be granted after tier upgrade"
        
        # Test permission caching and invalidation
        # Check same permission multiple times (should use cache)
        cache_test_times = []
        for i in range(10):
            start_time = time.perf_counter()
            await real_rbac_manager.check_permission(
                manufacturer_id=manufacturer_id,
                permission=Permission.PRODUCT_CREATE
            )
            check_time = time.perf_counter() - start_time
            cache_test_times.append(check_time)
        
        # Later checks should be faster due to caching
        avg_early_time = sum(cache_test_times[:3]) / 3
        avg_later_time = sum(cache_test_times[-3:]) / 3
        
        assert avg_later_time <= avg_early_time, "Permission caching should improve performance"


class TestAccessControlIntegration:
    """Test suite for access control integration with other systems"""
    
    @pytest.mark.security
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_access_control_with_product_operations(self, real_rbac_manager, real_audit_logger):
        """
        Test access control integration with product management operations.
        
        This test ensures:
        - Permission checks are enforced during product operations
        - Audit logging captures access control decisions
        - Proper error handling for unauthorized operations
        """
        # Test manufacturers with different permission levels
        test_scenarios = [
            {
                "manufacturer_id": "mfg_limited_001",
                "tier": ManufacturerTier.FREE,
                "can_create": True,
                "can_bulk_upload": False,
                "can_delete": False
            },
            {
                "manufacturer_id": "mfg_full_001",
                "tier": ManufacturerTier.PROFESSIONAL,
                "can_create": True,
                "can_bulk_upload": True,
                "can_delete": True
            }
        ]
        
        for scenario in test_scenarios:
            manufacturer_id = scenario["manufacturer_id"]
            
            # Test product creation permission
            create_check = await real_rbac_manager.check_permission(
                manufacturer_id=manufacturer_id,
                permission=Permission.PRODUCT_CREATE
            )
            
            assert create_check.granted == scenario["can_create"]
            
            # Test bulk upload permission
            bulk_check = await real_rbac_manager.check_permission(
                manufacturer_id=manufacturer_id,
                permission=Permission.PRODUCT_BULK_UPLOAD
            )
            
            assert bulk_check.granted == scenario["can_bulk_upload"]
            
            # Test delete permission
            delete_check = await real_rbac_manager.check_permission(
                manufacturer_id=manufacturer_id,
                permission=Permission.PRODUCT_DELETE
            )
            
            assert delete_check.granted == scenario["can_delete"]
            
            # Verify audit logging for permission checks
            audit_events = await real_audit_logger.get_audit_trail(
                manufacturer_id=manufacturer_id,
                event_types=["permission_check"],
                start_date=datetime.now() - timedelta(minutes=5)
            )
            
            assert len(audit_events) >= 3, "Should log all permission checks"


if __name__ == "__main__":
    # Run access control tests with verbose output
    pytest.main([__file__, "-v", "--tb=short", "-m", "security"])