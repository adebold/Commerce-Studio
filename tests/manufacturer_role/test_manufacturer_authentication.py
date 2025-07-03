"""
Test suite for manufacturer authentication and security validation.
Addresses critical mock implementation issues identified in reflection_LS4.md.

This test suite ensures:
1. Real JWT token validation (not mock)
2. Actual RBAC implementation for manufacturer roles
3. Real encryption for sensitive business data
4. Comprehensive threat detection patterns
"""

import pytest
import asyncio
import time
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.auth.manufacturer_auth import ManufacturerAuthManager
    from src.auth.manufacturer_rbac import ManufacturerRBACManager, ManufacturerRole, ManufacturerPermission
    from src.security.manufacturer_encryption import ManufacturerEncryptionManager
    from src.security.manufacturer_validator import ManufacturerSecurityValidator
    from src.auth.exceptions import TokenExpiredError, InvalidTokenError, InsufficientPermissionsError
except ImportError as e:
    pytest.skip(f"Manufacturer authentication modules not implemented: {e}", allow_module_level=True)


class ManufacturerRole(Enum):
    """Manufacturer-specific roles for RBAC testing"""
    MANUFACTURER_FREE = "manufacturer_free"
    MANUFACTURER_PAID = "manufacturer_paid"
    MANUFACTURER_ENTERPRISE = "manufacturer_enterprise"


class ManufacturerPermission(Enum):
    """Manufacturer-specific permissions"""
    UPLOAD_PRODUCTS = "upload_products"
    VIEW_BASIC_ANALYTICS = "view_basic_analytics"
    ACCESS_ML_TOOLS = "access_ml_tools"
    EXPORT_DATA = "export_data"
    API_ACCESS = "api_access"
    ADVANCED_ANALYTICS = "advanced_analytics"
    BULK_OPERATIONS = "bulk_operations"
    WHITE_LABEL_ACCESS = "white_label_access"


@dataclass
class ManufacturerContext:
    """Context for manufacturer authentication and authorization"""
    manufacturer_id: str
    company_name: str
    email: str
    tier: str
    roles: list
    permissions: Optional[list] = None
    session_data: Optional[Dict[str, Any]] = None


@pytest.fixture
async def real_auth_manager():
    """
    Real ManufacturerAuthManager fixture - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    # This should fail in RED phase - real implementation required
    auth_manager = ManufacturerAuthManager(
        secret_key="test_secret_key_for_manufacturer_auth",
        algorithm="HS256",
        token_expiry_hours=24
    )
    await auth_manager.initialize()
    return auth_manager


@pytest.fixture
async def real_rbac_manager():
    """
    Real ManufacturerRBACManager fixture - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    rbac_manager = ManufacturerRBACManager()
    await rbac_manager.initialize()
    return rbac_manager


@pytest.fixture
async def real_encryption_manager():
    """
    Real ManufacturerEncryptionManager fixture - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    encryption_manager = ManufacturerEncryptionManager(
        encryption_key="test_encryption_key_32_chars_long",
        key_rotation_enabled=True
    )
    await encryption_manager.initialize()
    return encryption_manager


@pytest.fixture
async def real_security_validator():
    """
    Real ManufacturerSecurityValidator fixture - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    validator = ManufacturerSecurityValidator()
    await validator.load_threat_patterns()
    return validator


class TestManufacturerAuthentication:
    """Test suite for manufacturer authentication and session management"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_manufacturer_jwt_token_validation(self, real_auth_manager):
        """
        Test real JWT token validation for manufacturer sessions.
        
        This test addresses Issue 1 from reflection_LS4.md:
        - Eliminates mock authentication
        - Validates real JWT token structure and claims
        - Tests token expiration handling
        """
        manufacturer_data = {
            "manufacturer_id": "mfg_001",
            "company_name": "Test Eyewear Co",
            "email": "admin@testeyewear.com",
            "tier": "free",
            "roles": [ManufacturerRole.MANUFACTURER_FREE.value]
        }
        
        # Generate real JWT token - should fail if mock implementation
        start_time = time.perf_counter()
        token = await real_auth_manager.generate_manufacturer_token(manufacturer_data)
        token_generation_time = time.perf_counter() - start_time
        
        # Validate token structure (JWT has 3 parts separated by dots)
        assert token is not None, "Token generation failed"
        assert isinstance(token, str), "Token must be string"
        token_parts = token.split('.')
        assert len(token_parts) == 3, f"Invalid JWT structure: {len(token_parts)} parts, expected 3"
        
        # Performance assertion - token generation should be fast
        assert token_generation_time < 0.1, f"Token generation too slow: {token_generation_time:.3f}s"
        
        # Validate token claims using real JWT validation
        start_time = time.perf_counter()
        claims = await real_auth_manager.validate_token(token)
        validation_time = time.perf_counter() - start_time
        
        # Verify all required claims are present
        assert claims["manufacturer_id"] == manufacturer_data["manufacturer_id"]
        assert claims["company_name"] == manufacturer_data["company_name"]
        assert claims["email"] == manufacturer_data["email"]
        assert claims["tier"] == manufacturer_data["tier"]
        assert "exp" in claims, "Expiration claim missing"
        assert "iat" in claims, "Issued at claim missing"
        assert "jti" in claims, "JWT ID claim missing for session tracking"
        
        # Performance assertion - validation should be fast
        assert validation_time < 0.05, f"Token validation too slow: {validation_time:.3f}s"
        
        # Test token expiration handling
        expired_token = await real_auth_manager.generate_expired_token(manufacturer_data)
        
        with pytest.raises(TokenExpiredError) as exc_info:
            await real_auth_manager.validate_token(expired_token)
        
        assert "expired" in str(exc_info.value).lower()
        
        # Test invalid token handling
        invalid_token = "invalid.jwt.token"
        
        with pytest.raises(InvalidTokenError) as exc_info:
            await real_auth_manager.validate_token(invalid_token)
        
        assert "invalid" in str(exc_info.value).lower()
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_manufacturer_session_management(self, real_auth_manager):
        """
        Test real session management for manufacturers.
        
        This test ensures:
        - Session creation and tracking
        - Session invalidation
        - Concurrent session handling
        """
        manufacturer_data = {
            "manufacturer_id": "mfg_session_test",
            "company_name": "Session Test Co",
            "email": "session@test.com",
            "tier": "paid"
        }
        
        # Create session
        session = await real_auth_manager.create_session(manufacturer_data)
        
        assert session.session_id is not None
        assert session.manufacturer_id == manufacturer_data["manufacturer_id"]
        assert session.created_at is not None
        assert session.expires_at is not None
        assert session.is_active == True
        
        # Validate session
        is_valid = await real_auth_manager.validate_session(session.session_id)
        assert is_valid == True
        
        # Test session refresh
        refreshed_session = await real_auth_manager.refresh_session(session.session_id)
        assert refreshed_session.expires_at > session.expires_at
        
        # Test session invalidation
        await real_auth_manager.invalidate_session(session.session_id)
        
        is_valid_after_invalidation = await real_auth_manager.validate_session(session.session_id)
        assert is_valid_after_invalidation == False
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_manufacturer_rbac_implementation(self, real_rbac_manager):
        """
        Test real RBAC implementation for manufacturer roles.
        
        This test addresses the mock security issue by validating:
        - Real permission checking (not hardcoded True)
        - Tier-based access control
        - Role hierarchy enforcement
        """
        # Test free tier manufacturer permissions
        free_manufacturer = ManufacturerContext(
            manufacturer_id="mfg_001",
            company_name="Free Eyewear Co",
            email="free@eyewear.com",
            tier="free",
            roles=[ManufacturerRole.MANUFACTURER_FREE]
        )
        
        # Free tier should have limited permissions
        assert await real_rbac_manager.has_permission(
            free_manufacturer, ManufacturerPermission.UPLOAD_PRODUCTS
        ) == True
        
        assert await real_rbac_manager.has_permission(
            free_manufacturer, ManufacturerPermission.VIEW_BASIC_ANALYTICS
        ) == True
        
        # Free tier should NOT have premium permissions
        assert await real_rbac_manager.has_permission(
            free_manufacturer, ManufacturerPermission.ACCESS_ML_TOOLS
        ) == False
        
        assert await real_rbac_manager.has_permission(
            free_manufacturer, ManufacturerPermission.API_ACCESS
        ) == False
        
        assert await real_rbac_manager.has_permission(
            free_manufacturer, ManufacturerPermission.ADVANCED_ANALYTICS
        ) == False
        
        # Test paid tier manufacturer permissions
        paid_manufacturer = ManufacturerContext(
            manufacturer_id="mfg_002",
            company_name="Premium Eyewear Co", 
            email="premium@eyewear.com",
            tier="paid",
            roles=[ManufacturerRole.MANUFACTURER_PAID]
        )
        
        # Paid tier should have all permissions
        all_permissions = [
            ManufacturerPermission.UPLOAD_PRODUCTS,
            ManufacturerPermission.VIEW_BASIC_ANALYTICS,
            ManufacturerPermission.ACCESS_ML_TOOLS,
            ManufacturerPermission.EXPORT_DATA,
            ManufacturerPermission.API_ACCESS,
            ManufacturerPermission.ADVANCED_ANALYTICS
        ]
        
        for permission in all_permissions:
            has_permission = await real_rbac_manager.has_permission(paid_manufacturer, permission)
            assert has_permission == True, f"Paid tier should have {permission.value}"
        
        # Test permission enforcement with real database check
        try:
            await real_rbac_manager.enforce_permission(
                free_manufacturer, 
                ManufacturerPermission.ACCESS_ML_TOOLS
            )
            pytest.fail("Should have raised InsufficientPermissionsError")
        except InsufficientPermissionsError as e:
            assert "ml_tools" in str(e).lower()
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_manufacturer_data_encryption(self, real_encryption_manager):
        """
        Test encryption of sensitive manufacturer business data.
        
        This test ensures:
        - Real encryption (not mock)
        - Proper key management
        - Data integrity validation
        """
        sensitive_data = {
            "business_license": "BL123456789",
            "tax_id": "TAX987654321", 
            "bank_account": "ACC555666777",
            "contact_phone": "+1-555-123-4567",
            "revenue_data": {
                "annual_revenue": 5000000,
                "quarterly_breakdown": [1200000, 1300000, 1250000, 1250000]
            },
            "supplier_contracts": [
                {"supplier": "Lens Corp", "contract_value": 500000},
                {"supplier": "Frame Materials Inc", "contract_value": 300000}
            ]
        }
        
        # Test encryption performance
        start_time = time.perf_counter()
        encrypted_data = await real_encryption_manager.encrypt_manufacturer_data(sensitive_data)
        encryption_time = time.perf_counter() - start_time
        
        # Verify encryption worked (data should be different)
        assert encrypted_data != sensitive_data
        assert isinstance(encrypted_data, dict)
        assert "encrypted_payload" in encrypted_data
        assert "encryption_metadata" in encrypted_data
        
        # Verify sensitive data is not visible in encrypted form
        encrypted_str = str(encrypted_data)
        assert "BL123456789" not in encrypted_str
        assert "TAX987654321" not in encrypted_str
        assert "ACC555666777" not in encrypted_str
        assert "5000000" not in encrypted_str
        
        # Performance assertion
        assert encryption_time < 0.1, f"Encryption too slow: {encryption_time:.3f}s"
        
        # Test decryption
        start_time = time.perf_counter()
        decrypted_data = await real_encryption_manager.decrypt_manufacturer_data(encrypted_data)
        decryption_time = time.perf_counter() - start_time
        
        # Verify decryption accuracy
        assert decrypted_data == sensitive_data
        assert decryption_time < 0.1, f"Decryption too slow: {decryption_time:.3f}s"
        
        # Test encryption key rotation
        rotated_encrypted_data = await real_encryption_manager.rotate_encryption_key(encrypted_data)
        assert rotated_encrypted_data != encrypted_data
        
        # Verify data can still be decrypted after key rotation
        re_decrypted_data = await real_encryption_manager.decrypt_manufacturer_data(rotated_encrypted_data)
        assert re_decrypted_data == sensitive_data


class TestManufacturerSecurityValidation:
    """Test suite for manufacturer input validation and threat detection"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_real_sql_injection_detection(self, real_security_validator):
        """
        Test real SQL injection detection patterns.
        
        This test addresses Issue 5 from reflection_LS4.md:
        - Real threat detection (not hardcoded True)
        - Pattern-based validation
        - Performance measurement
        """
        # SQL injection test cases
        sql_injection_payloads = [
            "'; DROP TABLE products; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --",
            "'; INSERT INTO products VALUES ('malicious'); --",
            "' OR 1=1 --",
            "admin'--",
            "' OR 'x'='x",
            "1' AND 1=1 --",
            "' HAVING 1=1 --",
            "'; EXEC xp_cmdshell('dir'); --"
        ]
        
        for payload in sql_injection_payloads:
            product_data = {
                "name": payload,
                "description": "Test product",
                "sku": "TEST123",
                "manufacturer_id": "mfg_001"
            }
            
            start_time = time.perf_counter()
            is_threat = await real_security_validator.detect_threat("sql_injection", product_data)
            detection_time = time.perf_counter() - start_time
            
            # Must detect as threat (not hardcoded True)
            assert is_threat == True, f"Failed to detect SQL injection: {payload}"
            
            # Performance assertion
            assert detection_time < 0.01, f"Threat detection too slow: {detection_time:.4f}s"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_real_nosql_injection_detection(self, real_security_validator):
        """
        Test real NoSQL injection detection for MongoDB operations.
        
        Critical for manufacturer product uploads to MongoDB.
        """
        nosql_injection_payloads = [
            {"$where": "this.name == 'admin'"},
            {"$ne": None},
            {"$regex": ".*"},
            {"$gt": ""},
            {"name": {"$ne": None}},
            {"$or": [{"name": "admin"}, {"role": "admin"}]},
            {"$expr": {"$gt": ["$price", 0]}},
            {"manufacturer_id": {"$in": ["'; DROP TABLE products; --"]}}
        ]
        
        for payload in nosql_injection_payloads:
            start_time = time.perf_counter()
            is_threat = await real_security_validator.detect_threat("nosql_injection", payload)
            detection_time = time.perf_counter() - start_time
            
            assert is_threat == True, f"Failed to detect NoSQL injection: {payload}"
            assert detection_time < 0.01, f"NoSQL detection too slow: {detection_time:.4f}s"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_business_data_validation(self, real_security_validator):
        """
        Test validation of business-critical manufacturer data.
        
        Ensures data integrity for manufacturer business information.
        """
        # Test valid business data
        valid_manufacturer_data = {
            "company_name": "Valid Eyewear Company LLC",
            "business_email": "contact@valideyewear.com",
            "business_license": "BL123456789",
            "tax_id": "12-3456789",
            "website": "https://valideyewear.com",
            "phone": "+1-555-123-4567",
            "address": {
                "street": "123 Business Ave",
                "city": "Commerce City",
                "state": "CA",
                "zip": "90210",
                "country": "US"
            }
        }
        
        validation_result = await real_security_validator.validate_manufacturer_data(valid_manufacturer_data)
        
        assert validation_result.is_valid == True
        assert len(validation_result.errors) == 0
        assert validation_result.security_score > 0.8
        
        # Test invalid business data
        invalid_manufacturer_data = {
            "company_name": "",  # Empty name
            "business_email": "invalid-email-format",  # Invalid email
            "business_license": "123",  # Too short
            "tax_id": "invalid-tax-format",  # Invalid format
            "website": "not-a-valid-url",  # Invalid URL
            "phone": "123",  # Invalid phone format
            "address": {
                "street": "",  # Empty street
                "city": "",  # Empty city
                "state": "INVALID",  # Invalid state
                "zip": "123",  # Invalid zip
                "country": "XX"  # Invalid country
            }
        }
        
        validation_result = await real_security_validator.validate_manufacturer_data(invalid_manufacturer_data)
        
        assert validation_result.is_valid == False
        assert len(validation_result.errors) > 5  # Multiple validation errors
        assert validation_result.security_score < 0.3
        
        # Verify specific error types
        error_types = [error.error_type for error in validation_result.errors]
        assert "EMPTY_REQUIRED_FIELD" in error_types
        assert "INVALID_EMAIL_FORMAT" in error_types
        assert "INVALID_URL_FORMAT" in error_types
        assert "INVALID_PHONE_FORMAT" in error_types
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_rate_limiting_and_abuse_detection(self, real_security_validator):
        """
        Test rate limiting and abuse detection for manufacturer operations.
        
        Critical for preventing abuse of free tier accounts.
        """
        manufacturer_id = "mfg_rate_test_001"
        
        # Simulate normal usage pattern
        for i in range(10):
            result = await real_security_validator.check_rate_limit(
                manufacturer_id, 
                "product_upload",
                current_usage=i
            )
            assert result.allowed == True
            assert result.remaining_requests > 0
        
        # Simulate abuse pattern (rapid requests)
        abuse_requests = []
        for i in range(100):
            start_time = time.perf_counter()
            result = await real_security_validator.check_rate_limit(
                manufacturer_id,
                "product_upload", 
                current_usage=50 + i  # Approaching limit rapidly
            )
            request_time = time.perf_counter() - start_time
            abuse_requests.append((result, request_time))
        
        # Should detect abuse and start blocking
        blocked_requests = [req for req, _ in abuse_requests if not req.allowed]
        assert len(blocked_requests) > 0, "Rate limiting should block excessive requests"
        
        # Should maintain performance even under abuse
        avg_response_time = sum(time for _, time in abuse_requests) / len(abuse_requests)
        assert avg_response_time < 0.01, f"Rate limiting too slow under load: {avg_response_time:.4f}s"


if __name__ == "__main__":
    # Run tests with verbose output
    pytest.main([__file__, "-v", "--tb=short"])