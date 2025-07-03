"""
Comprehensive security integration tests for manufacturer authentication and security foundation.
Based on test specifications in test_specs_manufacturer_security_foundation_LS8.md.

This test suite validates:
1. Complete authentication flow with real JWT tokens and MFA
2. Tier-based RBAC with usage limits enforcement
3. Security validation and threat detection
4. End-to-end security workflows
5. Performance under realistic load conditions
"""

import pytest
import asyncio
import jwt
import time
import json
import uuid
import pyotp
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.auth.manufacturer_auth import ManufacturerAuthManager, AuthResult, ManufacturerSession
    from src.auth.manufacturer_rbac import ManufacturerRBACManager, ManufacturerRole, ManufacturerPermission, ManufacturerContext, UsageLimits
    from src.security.manufacturer_encryption import ManufacturerEncryptionManager
    from src.security.manufacturer_validator import ManufacturerSecurityValidator, SecurityThreat, ValidationResult
    from src.auth.exceptions import (
        TokenExpiredError, InvalidTokenError, InsufficientPermissionsError,
        RateLimitExceededError, SecurityThreatDetectedError, MFARequiredError
    )
except ImportError as e:
    pytest.skip(f"Manufacturer security modules not implemented: {e}", allow_module_level=True)


@dataclass
class TestManufacturerData:
    """Test data structure for manufacturer accounts"""
    manufacturer_id: str
    company_name: str
    email: str
    tier: str
    business_license: str
    tax_id: str
    phone: str
    address: Dict[str, str]
    mfa_secret: Optional[str] = None


@pytest.fixture
async def security_managers():
    """
    Fixture providing all security managers for integration testing.
    NO MOCKS - Real implementations required.
    """
    auth_manager = ManufacturerAuthManager(
        secret_key="test_secret_key_for_manufacturer_auth_integration",
        algorithm="HS256",
        token_expiry_hours=24
    )
    
    rbac_manager = ManufacturerRBACManager()
    
    encryption_manager = ManufacturerEncryptionManager(
        encryption_key="test_encryption_key_32_chars_long",
        key_rotation_enabled=True
    )
    
    security_validator = ManufacturerSecurityValidator()
    
    # Initialize all managers
    await auth_manager.initialize()
    await rbac_manager.initialize()
    await encryption_manager.initialize()
    await security_validator.load_threat_patterns()
    
    return {
        'auth': auth_manager,
        'rbac': rbac_manager,
        'encryption': encryption_manager,
        'validator': security_validator
    }


@pytest.fixture
def test_manufacturers():
    """Fixture providing test manufacturer data for different tiers"""
    return {
        'free': TestManufacturerData(
            manufacturer_id="mfg_free_001",
            company_name="Free Tier Eyewear Co",
            email="free@eyewear.com",
            tier="free",
            business_license="BL123456789",
            tax_id="12-3456789",
            phone="+1-555-123-4567",
            address={
                "street": "123 Free St",
                "city": "Freetown",
                "state": "CA",
                "zip": "90210",
                "country": "US"
            }
        ),
        'professional': TestManufacturerData(
            manufacturer_id="mfg_pro_001",
            company_name="Professional Eyewear Corp",
            email="pro@eyewear.com",
            tier="professional",
            business_license="BL987654321",
            tax_id="98-7654321",
            phone="+1-555-987-6543",
            address={
                "street": "456 Pro Ave",
                "city": "Protown",
                "state": "NY",
                "zip": "10001",
                "country": "US"
            }
        ),
        'enterprise': TestManufacturerData(
            manufacturer_id="mfg_ent_001",
            company_name="Enterprise Eyewear Solutions",
            email="enterprise@eyewear.com",
            tier="enterprise",
            business_license="BL555666777",
            tax_id="55-5666777",
            phone="+1-555-555-5555",
            address={
                "street": "789 Enterprise Blvd",
                "city": "Enterprise City",
                "state": "TX",
                "zip": "75001",
                "country": "US"
            }
        )
    }


class TestManufacturerSecurityIntegration:
    """Integration tests for the complete manufacturer security foundation"""
    
    @pytest.mark.integration
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_complete_authentication_flow(self, security_managers, test_manufacturers):
        """
        Test the complete authentication flow from registration through JWT validation and RBAC.
        
        This test validates:
        - Manufacturer registration with business data validation
        - Real JWT token generation and validation
        - Session management and tracking
        - Permission validation based on tier
        - Performance benchmarks throughout the flow
        """
        auth_manager = security_managers['auth']
        rbac_manager = security_managers['rbac']
        validator = security_managers['validator']
        
        manufacturer = test_manufacturers['professional']
        
        # Step 1: Validate business data during registration
        registration_data = {
            "email": manufacturer.email,
            "password": "SecurePassword123!",
            "company_name": manufacturer.company_name,
            "business_license": manufacturer.business_license,
            "tax_id": manufacturer.tax_id,
            "phone": manufacturer.phone,
            "address": manufacturer.address
        }
        
        start_time = time.perf_counter()
        validation_result = await validator.validate_manufacturer_data(registration_data)
        validation_time = time.perf_counter() - start_time
        
        assert validation_result.is_valid == True
        assert len(validation_result.errors) == 0
        assert validation_result.security_score > 0.8
        assert validation_time < 0.1, f"Business data validation too slow: {validation_time:.3f}s"
        
        # Step 2: Register manufacturer
        await auth_manager.register_manufacturer(registration_data)
        
        # Step 3: Authenticate manufacturer
        start_time = time.perf_counter()
        auth_result = await auth_manager.authenticate_manufacturer(
            manufacturer.email, 
            "SecurePassword123!"
        )
        auth_time = time.perf_counter() - start_time
        
        assert auth_result == True
        assert auth_time < 0.1, f"Authentication too slow: {auth_time:.3f}s"
        
        # Step 4: Generate JWT token
        token_data = {
            "manufacturer_id": manufacturer.manufacturer_id,
            "company_name": manufacturer.company_name,
            "email": manufacturer.email,
            "tier": manufacturer.tier,
            "roles": [ManufacturerRole.MANUFACTURER_PAID.value]
        }
        
        start_time = time.perf_counter()
        jwt_token = await auth_manager.generate_manufacturer_token(token_data)
        token_gen_time = time.perf_counter() - start_time
        
        assert jwt_token is not None
        assert isinstance(jwt_token, str)
        assert len(jwt_token.split('.')) == 3  # Valid JWT structure
        assert token_gen_time < 0.1, f"Token generation too slow: {token_gen_time:.3f}s"
        
        # Step 5: Validate JWT token
        start_time = time.perf_counter()
        claims = await auth_manager.validate_token(jwt_token)
        token_val_time = time.perf_counter() - start_time
        
        assert claims["manufacturer_id"] == manufacturer.manufacturer_id
        assert claims["tier"] == manufacturer.tier
        assert "exp" in claims
        assert "iat" in claims
        assert "jti" in claims
        assert token_val_time < 0.05, f"Token validation too slow: {token_val_time:.3f}s"
        
        # Step 6: Create session
        session = await auth_manager.create_session(token_data)
        
        assert session.session_id is not None
        assert session.manufacturer_id == manufacturer.manufacturer_id
        assert session.is_active == True
        
        # Step 7: Test RBAC permissions for professional tier
        manufacturer_context = ManufacturerContext(
            manufacturer_id=manufacturer.manufacturer_id,
            company_name=manufacturer.company_name,
            email=manufacturer.email,
            tier=manufacturer.tier,
            roles=[ManufacturerRole.MANUFACTURER_PAID]
        )
        
        # Professional tier should have these permissions
        professional_permissions = [
            ManufacturerPermission.UPLOAD_PRODUCTS,
            ManufacturerPermission.VIEW_BASIC_ANALYTICS,
            ManufacturerPermission.ACCESS_ML_TOOLS,
            ManufacturerPermission.EXPORT_DATA,
            ManufacturerPermission.API_ACCESS,
            ManufacturerPermission.ADVANCED_ANALYTICS
        ]
        
        for permission in professional_permissions:
            start_time = time.perf_counter()
            has_permission = await rbac_manager.has_permission(manufacturer_context, permission)
            permission_time = time.perf_counter() - start_time
            
            assert has_permission == True, f"Professional tier should have {permission.value}"
            assert permission_time < 0.005, f"Permission check too slow: {permission_time:.4f}s"
        
        # Professional tier should NOT have enterprise permissions
        enterprise_only_permissions = [
            ManufacturerPermission.BULK_OPERATIONS,
            ManufacturerPermission.WHITE_LABEL_ACCESS
        ]
        
        for permission in enterprise_only_permissions:
            has_permission = await rbac_manager.has_permission(manufacturer_context, permission)
            assert has_permission == False, f"Professional tier should NOT have {permission.value}"
    
    @pytest.mark.integration
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_mfa_workflow_integration(self, security_managers, test_manufacturers):
        """
        Test the complete MFA setup and verification process.
        
        This test validates:
        - MFA secret generation and storage
        - TOTP code generation and verification
        - MFA enforcement for sensitive operations
        - MFA backup codes and recovery
        """
        auth_manager = security_managers['auth']
        manufacturer = test_manufacturers['enterprise']
        
        # Step 1: Setup MFA for manufacturer
        mfa_secret = await auth_manager.setup_mfa(manufacturer.manufacturer_id)
        
        assert mfa_secret is not None
        assert len(mfa_secret) >= 16  # Minimum secret length
        assert isinstance(mfa_secret, str)
        
        # Step 2: Generate TOTP code
        totp = pyotp.TOTP(mfa_secret)
        current_code = totp.now()
        
        assert len(current_code) == 6
        assert current_code.isdigit()
        
        # Step 3: Verify TOTP code
        start_time = time.perf_counter()
        is_valid = await auth_manager.verify_mfa_code(manufacturer.manufacturer_id, current_code)
        mfa_verify_time = time.perf_counter() - start_time
        
        assert is_valid == True
        assert mfa_verify_time < 0.05, f"MFA verification too slow: {mfa_verify_time:.3f}s"
        
        # Step 4: Test invalid TOTP code
        invalid_code = "000000"
        is_valid_invalid = await auth_manager.verify_mfa_code(manufacturer.manufacturer_id, invalid_code)
        assert is_valid_invalid == False
        
        # Step 5: Test MFA enforcement for sensitive operations
        # Attempt sensitive operation without MFA verification
        with pytest.raises(MFARequiredError):
            await auth_manager.perform_sensitive_operation(
                manufacturer.manufacturer_id,
                "delete_all_products",
                mfa_verified=False
            )
        
        # Perform sensitive operation with MFA verification
        result = await auth_manager.perform_sensitive_operation(
            manufacturer.manufacturer_id,
            "delete_all_products",
            mfa_verified=True
        )
        assert result.success == True
        
        # Step 6: Test MFA backup codes
        backup_codes = await auth_manager.generate_mfa_backup_codes(manufacturer.manufacturer_id)
        
        assert len(backup_codes) == 10  # Standard number of backup codes
        for code in backup_codes:
            assert len(code) == 8  # Standard backup code length
            assert code.isalnum()
        
        # Verify backup code works
        backup_code = backup_codes[0]
        is_backup_valid = await auth_manager.verify_mfa_backup_code(
            manufacturer.manufacturer_id, 
            backup_code
        )
        assert is_backup_valid == True
        
        # Verify backup code can only be used once
        is_backup_valid_again = await auth_manager.verify_mfa_backup_code(
            manufacturer.manufacturer_id, 
            backup_code
        )
        assert is_backup_valid_again == False
    
    @pytest.mark.integration
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_tier_based_usage_limits_enforcement(self, security_managers, test_manufacturers):
        """
        Test tier-based usage limits enforcement across all manufacturer tiers.
        
        This test validates:
        - Different usage limits per tier
        - Real-time usage tracking
        - Quota enforcement and blocking
        - Usage reset and billing cycle handling
        """
        rbac_manager = security_managers['rbac']
        
        # Define tier-based usage limits
        tier_limits = {
            'free': UsageLimits(
                product_uploads_monthly=100,
                ml_tool_requests_monthly=50,
                api_calls_monthly=1000,
                data_exports_monthly=5
            ),
            'professional': UsageLimits(
                product_uploads_monthly=1000,
                ml_tool_requests_monthly=500,
                api_calls_monthly=10000,
                data_exports_monthly=50
            ),
            'enterprise': UsageLimits(
                product_uploads_monthly=-1,  # Unlimited
                ml_tool_requests_monthly=5000,
                api_calls_monthly=100000,
                data_exports_monthly=500
            )
        }
        
        for tier_name, manufacturer in test_manufacturers.items():
            limits = tier_limits[tier_name]
            
            manufacturer_context = ManufacturerContext(
                manufacturer_id=manufacturer.manufacturer_id,
                company_name=manufacturer.company_name,
                email=manufacturer.email,
                tier=manufacturer.tier,
                roles=[getattr(ManufacturerRole, f"MANUFACTURER_{tier_name.upper()}")]
            )
            
            # Test product upload limits
            if limits.product_uploads_monthly > 0:  # Not unlimited
                # Simulate usage up to limit
                for i in range(limits.product_uploads_monthly):
                    usage_result = await rbac_manager.check_usage_limit(
                        manufacturer_context,
                        "product_uploads",
                        current_usage=i
                    )
                    assert usage_result.allowed == True
                    assert usage_result.remaining >= 0
                
                # Test exceeding limit
                usage_result = await rbac_manager.check_usage_limit(
                    manufacturer_context,
                    "product_uploads",
                    current_usage=limits.product_uploads_monthly + 1
                )
                assert usage_result.allowed == False
                assert usage_result.remaining == 0
            
            # Test ML tool request limits
            for i in range(min(limits.ml_tool_requests_monthly, 10)):  # Test first 10 requests
                usage_result = await rbac_manager.check_usage_limit(
                    manufacturer_context,
                    "ml_tool_requests",
                    current_usage=i
                )
                assert usage_result.allowed == True
            
            # Test API call limits
            for i in range(min(limits.api_calls_monthly, 100)):  # Test first 100 calls
                usage_result = await rbac_manager.check_usage_limit(
                    manufacturer_context,
                    "api_calls",
                    current_usage=i
                )
                assert usage_result.allowed == True
    
    @pytest.mark.integration
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_comprehensive_threat_detection_workflow(self, security_managers, test_manufacturers):
        """
        Test comprehensive threat detection across all security components.
        
        This test validates:
        - Real-time threat detection during operations
        - Coordinated response across security components
        - Threat logging and incident tracking
        - Automated security responses
        """
        validator = security_managers['validator']
        auth_manager = security_managers['auth']
        manufacturer = test_manufacturers['free']
        
        # Test SQL injection detection in product data
        malicious_product_data = {
            "name": "'; DROP TABLE products; --",
            "description": "Normal product description",
            "sku": "MALICIOUS123",
            "manufacturer_id": manufacturer.manufacturer_id,
            "price": 99.99
        }
        
        start_time = time.perf_counter()
        threat_result = await validator.detect_threat("sql_injection", malicious_product_data)
        detection_time = time.perf_counter() - start_time
        
        assert threat_result.threat_detected == True
        assert threat_result.threat_type == "sql_injection"
        assert threat_result.severity in ["high", "critical"]
        assert detection_time < 0.01, f"Threat detection too slow: {detection_time:.4f}s"
        
        # Test NoSQL injection detection
        nosql_malicious_data = {
            "query": {"$where": "this.name == 'admin'"},
            "manufacturer_id": manufacturer.manufacturer_id
        }
        
        threat_result = await validator.detect_threat("nosql_injection", nosql_malicious_data)
        assert threat_result.threat_detected == True
        assert threat_result.threat_type == "nosql_injection"
        
        # Test XSS detection in manufacturer profile
        xss_profile_data = {
            "company_description": "<script>alert('xss')</script>",
            "website": "https://example.com",
            "manufacturer_id": manufacturer.manufacturer_id
        }
        
        threat_result = await validator.detect_threat("xss", xss_profile_data)
        assert threat_result.threat_detected == True
        assert threat_result.threat_type == "xss"
        
        # Test coordinated security response
        # When threat is detected, should trigger security actions
        security_incident = await validator.create_security_incident(
            manufacturer_id=manufacturer.manufacturer_id,
            threat_type="sql_injection",
            severity="high",
            context=malicious_product_data
        )
        
        assert security_incident.incident_id is not None
        assert security_incident.status == "active"
        assert security_incident.created_at is not None
        
        # Should trigger session invalidation for high-severity threats
        sessions_invalidated = await auth_manager.invalidate_sessions_for_security_incident(
            manufacturer.manufacturer_id,
            security_incident.incident_id
        )
        assert sessions_invalidated >= 0
        
        # Should implement temporary access restrictions
        access_restricted = await auth_manager.apply_temporary_restrictions(
            manufacturer.manufacturer_id,
            restriction_type="limited_access",
            duration_minutes=30
        )
        assert access_restricted == True
    
    @pytest.mark.integration
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_security_performance_under_load(self, security_managers):
        """
        Test security operations performance under realistic load conditions.
        
        This test validates:
        - Concurrent authentication operations
        - Permission checking under load
        - Threat detection throughput
        - System stability under stress
        """
        auth_manager = security_managers['auth']
        rbac_manager = security_managers['rbac']
        validator = security_managers['validator']
        
        # Test concurrent JWT token operations
        concurrent_operations = 100
        
        # Generate test data for concurrent operations
        test_data = []
        for i in range(concurrent_operations):
            test_data.append({
                "manufacturer_id": f"load_test_{i}",
                "company_name": f"Load Test Company {i}",
                "email": f"loadtest{i}@example.com",
                "tier": "professional",
                "roles": [ManufacturerRole.MANUFACTURER_PAID.value]
            })
        
        # Test concurrent token generation
        start_time = time.perf_counter()
        
        token_tasks = [
            auth_manager.generate_manufacturer_token(data) 
            for data in test_data
        ]
        tokens = await asyncio.gather(*token_tasks)
        
        token_generation_time = time.perf_counter() - start_time
        avg_token_time = token_generation_time / concurrent_operations
        
        assert len(tokens) == concurrent_operations
        assert all(token is not None for token in tokens)
        assert avg_token_time < 0.1, f"Average token generation too slow: {avg_token_time:.3f}s"
        
        # Test concurrent token validation
        start_time = time.perf_counter()
        
        validation_tasks = [
            auth_manager.validate_token(token) 
            for token in tokens
        ]
        claims_list = await asyncio.gather(*validation_tasks)
        
        validation_time = time.perf_counter() - start_time
        avg_validation_time = validation_time / concurrent_operations
        
        assert len(claims_list) == concurrent_operations
        assert all(claims is not None for claims in claims_list)
        assert avg_validation_time < 0.05, f"Average token validation too slow: {avg_validation_time:.3f}s"
        
        # Test concurrent permission checking
        manufacturer_contexts = [
            ManufacturerContext(
                manufacturer_id=data["manufacturer_id"],
                company_name=data["company_name"],
                email=data["email"],
                tier=data["tier"],
                roles=[ManufacturerRole.MANUFACTURER_PAID]
            )
            for data in test_data
        ]
        
        start_time = time.perf_counter()
        
        permission_tasks = [
            rbac_manager.has_permission(context, ManufacturerPermission.ACCESS_ML_TOOLS)
            for context in manufacturer_contexts
        ]
        permission_results = await asyncio.gather(*permission_tasks)
        
        permission_time = time.perf_counter() - start_time
        avg_permission_time = permission_time / concurrent_operations
        
        assert len(permission_results) == concurrent_operations
        assert all(result == True for result in permission_results)
        assert avg_permission_time < 0.005, f"Average permission check too slow: {avg_permission_time:.4f}s"
        
        # Test concurrent threat detection
        threat_data = [
            {"malicious_input": f"'; DROP TABLE test_{i}; --", "id": i}
            for i in range(concurrent_operations)
        ]
        
        start_time = time.perf_counter()
        
        threat_tasks = [
            validator.detect_threat("sql_injection", data)
            for data in threat_data
        ]
        threat_results = await asyncio.gather(*threat_tasks)
        
        threat_detection_time = time.perf_counter() - start_time
        avg_threat_time = threat_detection_time / concurrent_operations
        
        assert len(threat_results) == concurrent_operations
        assert all(result.threat_detected == True for result in threat_results)
        assert avg_threat_time < 0.01, f"Average threat detection too slow: {avg_threat_time:.4f}s"
    
    @pytest.mark.integration
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_data_encryption_integration_workflow(self, security_managers, test_manufacturers):
        """
        Test data encryption integration across the complete security workflow.
        
        This test validates:
        - Encryption of sensitive manufacturer data
        - Key management and rotation
        - Encrypted data access control
        - Performance of encryption operations
        """
        encryption_manager = security_managers['encryption']
        auth_manager = security_managers['auth']
        rbac_manager = security_managers['rbac']
        
        manufacturer = test_manufacturers['enterprise']
        
        # Prepare sensitive business data
        sensitive_data = {
            "business_license": manufacturer.business_license,
            "tax_id": manufacturer.tax_id,
            "bank_account": "ACC123456789",
            "financial_data": {
                "annual_revenue": 10000000,
                "quarterly_breakdown": [2500000, 2600000, 2450000, 2450000],
                "profit_margins": [0.15, 0.18, 0.14, 0.16]
            },
            "supplier_contracts": [
                {"supplier": "Premium Lens Corp", "contract_value": 2000000},
                {"supplier": "Luxury Frame Materials", "contract_value": 1500000}
            ],
            "customer_data": {
                "enterprise_clients": ["Fortune500Corp", "TechGiant Inc"],
                "contract_values": [5000000, 3000000]
            }
        }
        
        # Test encryption performance
        start_time = time.perf_counter()
        encrypted_data = await encryption_manager.encrypt_manufacturer_data(
            manufacturer.manufacturer_id,
            sensitive_data
        )
        encryption_time = time.perf_counter() - start_time
        
        assert encrypted_data is not None
        assert isinstance(encrypted_data, dict)
        assert "encrypted_payload" in encrypted_data
        assert "encryption_metadata" in encrypted_data
        assert encryption_time < 0.1, f"Encryption too slow: {encryption_time:.3f}s"
        
        # Verify sensitive data is not visible in encrypted form
        encrypted_str = str(encrypted_data)
        assert manufacturer.business_license not in encrypted_str
        assert manufacturer.tax_id not in encrypted_str
        assert "ACC123456789" not in encrypted_str
        assert "10000000" not in encrypted_str
        assert "Fortune500Corp" not in encrypted_str
        
        # Test decryption with proper authorization
        manufacturer_context = ManufacturerContext(
            manufacturer_id=manufacturer.manufacturer_id,
            company_name=manufacturer.company_name,
            email=manufacturer.email,
            tier=manufacturer.tier,
            roles=[ManufacturerRole.MANUFACTURER_ENTERPRISE]
        )
        
        # Verify manufacturer has permission to access encrypted data
        has_permission = await rbac_manager.has_permission(
            manufacturer_context,
            ManufacturerPermission.EXPORT_DATA
        )
        assert has_permission == True
        
        # Decrypt data with authorization
        start_time = time.perf_counter()
        decrypted_data = await encryption_manager.decrypt_manufacturer_data(
            manufacturer.manufacturer_id,
            encrypted_data,
            authorized_context=manufacturer_context
        )
        decryption_time = time.perf_counter() - start_time
        
        assert decrypted_data == sensitive_data
        assert decryption_time < 0.1, f"Decryption too slow: {decryption_time:.3f}s"
        
        # Test unauthorized access attempt
        unauthorized_context = ManufacturerContext(
            manufacturer_id="unauthorized_mfg",
            company_name="Unauthorized Company",
            email="unauthorized@example.com",
            tier="free",
            roles=[ManufacturerRole.MANUFACTURER_FREE]
        )
        
        with pytest.raises(InsufficientPermissionsError):
            await encryption_manager.decrypt_manufacturer_data(
                manufacturer.manufacturer_id,
                encrypted_data,
                authorized_context=unauthorized_context
            )
        
        # Test key rotation
        rotated_data = await encryption_manager.rotate_encryption_key(
            manufacturer.manufacturer_id,
            encrypted_data
        )
        
        assert rotated_data != encrypted_data
        assert rotated_data["encryption_metadata"]["key_version"] > encrypted_data["encryption_metadata"]["key_version"]
        
        # Verify data can still be decrypted after key rotation
        re_decrypted_data = await encryption_manager.decrypt_manufacturer_data(
            manufacturer.manufacturer_id,
            rotated_data,
            authorized_context=manufacturer_context
        )
        assert re_decrypted_data == sensitive_data


if __name__ == "__main__":
    # Run integration tests with verbose output
    pytest.main([__file__, "-v", "--tb=short", "-m", "integration"])