"""
Enhanced manufacturer authentication tests with comprehensive JWT, MFA, and session management.
Based on test specifications in test_specs_manufacturer_security_foundation_LS8.md.

This test suite validates:
1. Real JWT token generation, validation, and security
2. Multi-Factor Authentication (MFA) with TOTP
3. Session management and security
4. Rate limiting and brute force protection
5. Performance benchmarks for all operations
"""

import pytest
import asyncio
import jwt
import time
import pyotp
import uuid
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.auth.manufacturer_auth import ManufacturerAuthManager, AuthResult, ManufacturerSession
    from src.auth.exceptions import (
        TokenExpiredError, InvalidTokenError, MFARequiredError,
        RateLimitExceededError, AccountLockedError, InvalidCredentialsError
    )
except ImportError as e:
    pytest.skip(f"Manufacturer authentication modules not implemented: {e}", allow_module_level=True)


@pytest.fixture
async def enhanced_auth_manager():
    """
    Enhanced ManufacturerAuthManager fixture with comprehensive configuration.
    NO MOCKS - Real implementation required.
    """
    auth_manager = ManufacturerAuthManager(
        secret_key="enhanced_test_secret_key_for_comprehensive_auth_testing",
        algorithm="HS256",
        token_expiry_hours=24,
        mfa_enabled=True,
        rate_limiting_enabled=True,
        session_timeout_minutes=30
    )
    await auth_manager.initialize()
    return auth_manager


@pytest.fixture
def test_manufacturer_accounts():
    """Fixture providing various test manufacturer accounts for different scenarios"""
    return {
        'standard': {
            "manufacturer_id": "mfg_std_001",
            "email": "standard@testeyewear.com",
            "password": "SecurePassword123!",
            "company_name": "Standard Eyewear Co",
            "tier": "professional",
            "business_license": "BL123456789",
            "phone": "+1-555-123-4567"
        },
        'enterprise': {
            "manufacturer_id": "mfg_ent_001",
            "email": "enterprise@testeyewear.com",
            "password": "EnterpriseSecure456!",
            "company_name": "Enterprise Eyewear Corp",
            "tier": "enterprise",
            "business_license": "BL987654321",
            "phone": "+1-555-987-6543"
        },
        'free_tier': {
            "manufacturer_id": "mfg_free_001",
            "email": "free@testeyewear.com",
            "password": "FreeSecure789!",
            "company_name": "Free Tier Eyewear",
            "tier": "free",
            "business_license": "BL555666777",
            "phone": "+1-555-555-5555"
        }
    }


class TestJWTTokenManagement:
    """Comprehensive JWT token management tests"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_real_jwt_token_generation_and_structure(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test real JWT token generation with proper structure and claims.
        
        Requirements:
        - Token generation performance < 100ms
        - Proper JWT structure (header.payload.signature)
        - Required claims validation
        - Cryptographic signing verification
        """
        manufacturer = test_manufacturer_accounts['standard']
        
        # Register manufacturer first
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        token_data = {
            "manufacturer_id": manufacturer["manufacturer_id"],
            "company_name": manufacturer["company_name"],
            "email": manufacturer["email"],
            "tier": manufacturer["tier"],
            "roles": ["manufacturer_professional"]
        }
        
        # Test token generation performance
        start_time = time.perf_counter()
        jwt_token = await enhanced_auth_manager.generate_manufacturer_token(token_data)
        generation_time = time.perf_counter() - start_time
        
        # Validate token structure
        assert jwt_token is not None, "Token generation failed"
        assert isinstance(jwt_token, str), "Token must be string"
        
        token_parts = jwt_token.split('.')
        assert len(token_parts) == 3, f"Invalid JWT structure: {len(token_parts)} parts, expected 3"
        
        # Performance assertion
        assert generation_time < 0.1, f"Token generation too slow: {generation_time:.3f}s"
        
        # Validate token can be decoded (structure test)
        try:
            # Decode without verification to check structure
            header = jwt.get_unverified_header(jwt_token)
            payload = jwt.decode(jwt_token, options={"verify_signature": False})
            
            # Validate header
            assert header["alg"] == "HS256", f"Wrong algorithm: {header['alg']}"
            assert header["typ"] == "JWT", f"Wrong type: {header['typ']}"
            
            # Validate payload structure
            required_claims = ["manufacturer_id", "company_name", "email", "tier", "roles", "exp", "iat", "jti"]
            for claim in required_claims:
                assert claim in payload, f"Missing required claim: {claim}"
            
            # Validate claim values
            assert payload["manufacturer_id"] == manufacturer["manufacturer_id"]
            assert payload["company_name"] == manufacturer["company_name"]
            assert payload["email"] == manufacturer["email"]
            assert payload["tier"] == manufacturer["tier"]
            assert isinstance(payload["roles"], list)
            assert isinstance(payload["exp"], int)
            assert isinstance(payload["iat"], int)
            assert isinstance(payload["jti"], str)
            
        except jwt.InvalidTokenError as e:
            pytest.fail(f"Token structure validation failed: {e}")
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_jwt_token_validation_and_claims(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test JWT token validation with proper cryptographic verification.
        
        Requirements:
        - Token validation performance < 50ms
        - Proper signature verification
        - Claims validation and extraction
        - Error handling for invalid tokens
        """
        manufacturer = test_manufacturer_accounts['enterprise']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        token_data = {
            "manufacturer_id": manufacturer["manufacturer_id"],
            "company_name": manufacturer["company_name"],
            "email": manufacturer["email"],
            "tier": manufacturer["tier"],
            "roles": ["manufacturer_enterprise"]
        }
        
        # Generate token
        jwt_token = await enhanced_auth_manager.generate_manufacturer_token(token_data)
        
        # Test token validation performance
        start_time = time.perf_counter()
        claims = await enhanced_auth_manager.validate_token(jwt_token)
        validation_time = time.perf_counter() - start_time
        
        # Validate claims
        assert claims is not None, "Token validation failed"
        assert claims["manufacturer_id"] == manufacturer["manufacturer_id"]
        assert claims["company_name"] == manufacturer["company_name"]
        assert claims["email"] == manufacturer["email"]
        assert claims["tier"] == manufacturer["tier"]
        assert "exp" in claims
        assert "iat" in claims
        assert "jti" in claims
        
        # Performance assertion
        assert validation_time < 0.05, f"Token validation too slow: {validation_time:.3f}s"
        
        # Test expiration validation
        exp_timestamp = claims["exp"]
        current_timestamp = datetime.utcnow().timestamp()
        assert exp_timestamp > current_timestamp, "Token should not be expired"
        
        # Test issued at validation
        iat_timestamp = claims["iat"]
        assert iat_timestamp <= current_timestamp, "Token issued in future"
        assert (current_timestamp - iat_timestamp) < 60, "Token issued too long ago for test"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_jwt_token_expiration_handling(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test proper handling of expired JWT tokens.
        
        Requirements:
        - Generate tokens with custom expiration
        - Detect expired tokens accurately
        - Raise appropriate exceptions
        - Handle edge cases around expiration
        """
        manufacturer = test_manufacturer_accounts['free_tier']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        token_data = {
            "manufacturer_id": manufacturer["manufacturer_id"],
            "company_name": manufacturer["company_name"],
            "email": manufacturer["email"],
            "tier": manufacturer["tier"],
            "roles": ["manufacturer_free"]
        }
        
        # Generate expired token
        expired_token = await enhanced_auth_manager.generate_expired_token(token_data)
        
        # Test expired token detection
        with pytest.raises(TokenExpiredError) as exc_info:
            await enhanced_auth_manager.validate_token(expired_token)
        
        assert "expired" in str(exc_info.value).lower()
        assert exc_info.value.code == "TOKEN_EXPIRED"
        
        # Test token expiring during validation (edge case)
        # Generate token with very short expiry (1 second)
        short_lived_token = await enhanced_auth_manager.generate_token_with_expiry(
            token_data, 
            expiry_seconds=1
        )
        
        # Wait for token to expire
        await asyncio.sleep(2)
        
        with pytest.raises(TokenExpiredError):
            await enhanced_auth_manager.validate_token(short_lived_token)
        
        # Test token that expires exactly at validation time
        precise_token = await enhanced_auth_manager.generate_token_with_expiry(
            token_data,
            expiry_seconds=0.5
        )
        
        await asyncio.sleep(0.5)
        
        with pytest.raises(TokenExpiredError):
            await enhanced_auth_manager.validate_token(precise_token)
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_jwt_token_security_validation(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test JWT token security against tampering and forgery.
        
        Requirements:
        - Detect tampered tokens
        - Reject invalid signatures
        - Prevent algorithm confusion attacks
        - Handle malformed JWT structures
        """
        manufacturer = test_manufacturer_accounts['standard']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        token_data = {
            "manufacturer_id": manufacturer["manufacturer_id"],
            "company_name": manufacturer["company_name"],
            "email": manufacturer["email"],
            "tier": manufacturer["tier"],
            "roles": ["manufacturer_professional"]
        }
        
        # Generate valid token
        valid_token = await enhanced_auth_manager.generate_manufacturer_token(token_data)
        
        # Test tampered payload
        token_parts = valid_token.split('.')
        
        # Decode and modify payload
        import base64
        import json
        
        # Decode payload (add padding if needed)
        payload_b64 = token_parts[1]
        payload_b64 += '=' * (4 - len(payload_b64) % 4)  # Add padding
        payload_bytes = base64.urlsafe_b64decode(payload_b64)
        payload_dict = json.loads(payload_bytes)
        
        # Tamper with payload
        payload_dict["tier"] = "enterprise"  # Privilege escalation attempt
        
        # Re-encode payload
        tampered_payload_bytes = json.dumps(payload_dict).encode()
        tampered_payload_b64 = base64.urlsafe_b64encode(tampered_payload_bytes).decode().rstrip('=')
        
        # Create tampered token
        tampered_token = f"{token_parts[0]}.{tampered_payload_b64}.{token_parts[2]}"
        
        # Test tampered token detection
        with pytest.raises(InvalidTokenError) as exc_info:
            await enhanced_auth_manager.validate_token(tampered_token)
        
        assert "invalid" in str(exc_info.value).lower()
        
        # Test completely invalid token
        invalid_token = "invalid.jwt.token"
        
        with pytest.raises(InvalidTokenError):
            await enhanced_auth_manager.validate_token(invalid_token)
        
        # Test malformed JWT structures
        malformed_tokens = [
            "only.two.parts",  # Missing part
            "too.many.parts.here.invalid",  # Too many parts
            "",  # Empty token
            "no-dots-at-all",  # No structure
            "...",  # Empty parts
        ]
        
        for malformed_token in malformed_tokens:
            with pytest.raises(InvalidTokenError):
                await enhanced_auth_manager.validate_token(malformed_token)
        
        # Test algorithm confusion attack
        # Create token with "none" algorithm
        none_header = {"alg": "none", "typ": "JWT"}
        none_header_b64 = base64.urlsafe_b64encode(
            json.dumps(none_header).encode()
        ).decode().rstrip('=')
        
        none_payload_b64 = base64.urlsafe_b64encode(
            json.dumps(token_data).encode()
        ).decode().rstrip('=')
        
        none_token = f"{none_header_b64}.{none_payload_b64}."
        
        with pytest.raises(InvalidTokenError):
            await enhanced_auth_manager.validate_token(none_token)


class TestMultiFactorAuthentication:
    """Comprehensive MFA tests with TOTP and backup codes"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_mfa_setup_and_totp_verification(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test complete MFA setup and TOTP verification workflow.
        
        Requirements:
        - Generate TOTP secrets securely
        - Validate TOTP codes with time window
        - Handle time synchronization issues
        - Performance: MFA verification < 50ms
        """
        manufacturer = test_manufacturer_accounts['enterprise']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        # Setup MFA
        mfa_result = await enhanced_auth_manager.setup_mfa(manufacturer["manufacturer_id"])
        
        assert mfa_result.secret is not None
        assert len(mfa_result.secret) >= 16, "MFA secret too short"
        assert mfa_result.qr_code_url is not None
        assert mfa_result.backup_codes is not None
        assert len(mfa_result.backup_codes) == 10
        
        # Generate TOTP code
        totp = pyotp.TOTP(mfa_result.secret)
        current_code = totp.now()
        
        assert len(current_code) == 6
        assert current_code.isdigit()
        
        # Test TOTP verification performance
        start_time = time.perf_counter()
        is_valid = await enhanced_auth_manager.verify_mfa_code(
            manufacturer["manufacturer_id"], 
            current_code
        )
        verification_time = time.perf_counter() - start_time
        
        assert is_valid == True
        assert verification_time < 0.05, f"MFA verification too slow: {verification_time:.3f}s"
        
        # Test time window tolerance (previous and next codes)
        previous_code = totp.at(datetime.now() - timedelta(seconds=30))
        next_code = totp.at(datetime.now() + timedelta(seconds=30))
        
        # Previous code should be valid (within time window)
        is_previous_valid = await enhanced_auth_manager.verify_mfa_code(
            manufacturer["manufacturer_id"],
            previous_code
        )
        assert is_previous_valid == True, "Previous TOTP code should be valid within time window"
        
        # Future code should be valid (within time window)
        is_next_valid = await enhanced_auth_manager.verify_mfa_code(
            manufacturer["manufacturer_id"],
            next_code
        )
        assert is_next_valid == True, "Next TOTP code should be valid within time window"
        
        # Invalid code should fail
        invalid_code = "000000"
        is_invalid_valid = await enhanced_auth_manager.verify_mfa_code(
            manufacturer["manufacturer_id"],
            invalid_code
        )
        assert is_invalid_valid == False
        
        # Test code reuse prevention
        # Same code should not be valid twice
        is_reuse_valid = await enhanced_auth_manager.verify_mfa_code(
            manufacturer["manufacturer_id"],
            current_code
        )
        assert is_reuse_valid == False, "TOTP code reuse should be prevented"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_mfa_backup_codes_functionality(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test MFA backup codes generation and verification.
        
        Requirements:
        - Generate secure backup codes
        - Single-use backup code validation
        - Backup code regeneration
        - Emergency access scenarios
        """
        manufacturer = test_manufacturer_accounts['standard']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        # Setup MFA
        mfa_result = await enhanced_auth_manager.setup_mfa(manufacturer["manufacturer_id"])
        backup_codes = mfa_result.backup_codes
        
        # Validate backup code format
        for code in backup_codes:
            assert len(code) == 8, f"Backup code wrong length: {len(code)}"
            assert code.isalnum(), f"Backup code should be alphanumeric: {code}"
        
        # Test backup code verification
        first_backup_code = backup_codes[0]
        
        is_backup_valid = await enhanced_auth_manager.verify_mfa_backup_code(
            manufacturer["manufacturer_id"],
            first_backup_code
        )
        assert is_backup_valid == True
        
        # Test single-use enforcement
        is_backup_valid_again = await enhanced_auth_manager.verify_mfa_backup_code(
            manufacturer["manufacturer_id"],
            first_backup_code
        )
        assert is_backup_valid_again == False, "Backup code should only work once"
        
        # Test multiple backup codes
        second_backup_code = backup_codes[1]
        is_second_valid = await enhanced_auth_manager.verify_mfa_backup_code(
            manufacturer["manufacturer_id"],
            second_backup_code
        )
        assert is_second_valid == True
        
        # Test invalid backup code
        invalid_backup = "INVALID1"
        is_invalid_backup_valid = await enhanced_auth_manager.verify_mfa_backup_code(
            manufacturer["manufacturer_id"],
            invalid_backup
        )
        assert is_invalid_backup_valid == False
        
        # Test backup code regeneration
        new_backup_codes = await enhanced_auth_manager.regenerate_backup_codes(
            manufacturer["manufacturer_id"]
        )
        
        assert len(new_backup_codes) == 10
        assert new_backup_codes != backup_codes, "New backup codes should be different"
        
        # Old backup codes should no longer work
        third_backup_code = backup_codes[2]
        is_old_backup_valid = await enhanced_auth_manager.verify_mfa_backup_code(
            manufacturer["manufacturer_id"],
            third_backup_code
        )
        assert is_old_backup_valid == False, "Old backup codes should be invalidated"
        
        # New backup codes should work
        new_backup_code = new_backup_codes[0]
        is_new_backup_valid = await enhanced_auth_manager.verify_mfa_backup_code(
            manufacturer["manufacturer_id"],
            new_backup_code
        )
        assert is_new_backup_valid == True
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_mfa_rate_limiting_and_security(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test MFA security measures against brute force attacks.
        
        Requirements:
        - Rate limit MFA verification attempts
        - Account locking after failed attempts
        - Progressive delays for failures
        - Suspicious activity detection
        """
        manufacturer = test_manufacturer_accounts['free_tier']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        # Setup MFA
        await enhanced_auth_manager.setup_mfa(manufacturer["manufacturer_id"])
        
        # Test rate limiting with multiple failed attempts
        failed_attempts = 0
        max_attempts = 5
        
        for i in range(max_attempts + 2):  # Exceed limit
            try:
                start_time = time.perf_counter()
                is_valid = await enhanced_auth_manager.verify_mfa_code(
                    manufacturer["manufacturer_id"],
                    "000000"  # Invalid code
                )
                verification_time = time.perf_counter() - start_time
                
                assert is_valid == False
                failed_attempts += 1
                
                # Should implement progressive delays
                if failed_attempts > 3:
                    assert verification_time > 0.1, f"Should have delay after {failed_attempts} failures"
                
            except RateLimitExceededError as e:
                assert failed_attempts >= max_attempts, "Rate limit should trigger after max attempts"
                assert "rate limit" in str(e).lower()
                break
        
        # Account should be temporarily locked
        with pytest.raises(AccountLockedError):
            await enhanced_auth_manager.verify_mfa_code(
                manufacturer["manufacturer_id"],
                "123456"  # Even valid-format code should fail
            )
        
        # Test account unlock after timeout
        await enhanced_auth_manager.unlock_account_after_timeout(
            manufacturer["manufacturer_id"],
            timeout_seconds=1
        )
        
        await asyncio.sleep(1.1)
        
        # Should be able to attempt MFA again
        is_valid = await enhanced_auth_manager.verify_mfa_code(
            manufacturer["manufacturer_id"],
            "000000"
        )
        assert is_valid == False  # Still invalid code, but no exception


class TestSessionManagement:
    """Comprehensive session management and security tests"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_manufacturer_session_lifecycle(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test complete session management lifecycle.
        
        Requirements:
        - Create sessions with unique identifiers
        - Track session metadata and activity
        - Implement session refresh securely
        - Handle concurrent sessions
        - Session cleanup and expiration
        """
        manufacturer = test_manufacturer_accounts['enterprise']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        session_data = {
            "manufacturer_id": manufacturer["manufacturer_id"],
            "company_name": manufacturer["company_name"],
            "email": manufacturer["email"],
            "tier": manufacturer["tier"],
            "ip_address": "192.168.1.100",
            "user_agent": "TestAgent/1.0"
        }
        
        # Create session
        session = await enhanced_auth_manager.create_session(session_data)
        
        assert session.session_id is not None
        assert len(session.session_id) >= 32, "Session ID should be sufficiently long"
        assert session.manufacturer_id == manufacturer["manufacturer_id"]
        assert session.created_at is not None
        assert session.expires_at is not None
        assert session.is_active == True
        assert session.ip_address == "192.168.1.100"
        assert session.user_agent == "TestAgent/1.0"
        
        # Validate session
        is_valid = await enhanced_auth_manager.validate_session(session.session_id)
        assert is_valid == True
        
        # Test session metadata tracking
        session_info = await enhanced_auth_manager.get_session_info(session.session_id)
        assert session_info.last_activity is not None
        assert session_info.activity_count >= 1
        
        # Test session refresh
        original_expires_at = session.expires_at
        
        refreshed_session = await enhanced_auth_manager.refresh_session(session.session_id)
        assert refreshed_session.expires_at > original_expires_at
        assert refreshed_session.session_id == session.session_id
        assert refreshed_session.is_active == True
        
        # Test concurrent sessions
        session2 = await enhanced_auth_manager.create_session({
            **session_data,
            "ip_address": "192.168.1.101"
        })
        
        assert session2.session_id != session.session_id
        
        # Both sessions should be valid
        assert await enhanced_auth_manager.validate_session(session.session_id) == True
        assert await enhanced_auth_manager.validate_session(session2.session_id) == True
        
        # Test session invalidation
        await enhanced_auth_manager.invalidate_session(session.session_id)
        
        assert await enhanced_auth_manager.validate_session(session.session_id) == False
        assert await enhanced_auth_manager.validate_session(session2.session_id) == True
        
        # Test session cleanup
        await enhanced_auth_manager.cleanup_expired_sessions()
        
        # Active session should remain
        assert await enhanced_auth_manager.validate_session(session2.session_id) == True
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_session_security_and_hijacking_prevention(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test session security against hijacking and fixation attacks.
        
        Requirements:
        - Generate cryptographically secure session IDs
        - Detect session hijacking attempts
        - Implement session rotation
        - Handle suspicious activity
        """
        manufacturer = test_manufacturer_accounts['standard']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        session_data = {
            "manufacturer_id": manufacturer["manufacturer_id"],
            "company_name": manufacturer["company_name"],
            "email": manufacturer["email"],
            "tier": manufacturer["tier"],
            "ip_address": "192.168.1.100",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        
        # Create session
        session = await enhanced_auth_manager.create_session(session_data)
        
        # Test session ID entropy (should be cryptographically secure)
        session_ids = set()
        for _ in range(100):
            test_session = await enhanced_auth_manager.create_session(session_data)
            session_ids.add(test_session.session_id)
        
        # All session IDs should be unique
        assert len(session_ids) == 100, "Session IDs should be unique"
        
        # Test session hijacking detection (IP change)
        hijack_attempt_data = {
            **session_data,
            "ip_address": "10.0.0.1",  # Different IP
            "session_id": session.session_id
        }
        
        is_suspicious = await enhanced_auth_manager.detect_session_hijacking(
            session.session_id,
            hijack_attempt_data
        )
        assert is_suspicious == True, "Should detect IP change as suspicious"
        
        # Test session hijacking detection (User-Agent change)
        ua_change_data = {
            **session_data,
            "user_agent": "curl/7.68.0",  # Different User-Agent
            "session_id": session.session_id
        }
        
        is_ua_suspicious = await enhanced_auth_manager.detect_session_hijacking(
            session.session_id,
            ua_change_data
        )
        assert is_ua_suspicious == True, "Should detect User-Agent change as suspicious"
        
        # Test session rotation on privilege escalation
        original_session_id = session.session_id
        
        rotated_session = await enhanced_auth_manager.rotate_session_on_privilege_change(
            session.session_id,
            new_tier="enterprise"
        )
        
        assert rotated_session.session_id != original_session_id
        assert rotated_session.manufacturer_id == manufacturer["manufacturer_id"]
        
        # Original session should be invalidated
        assert await enhanced_auth_manager.validate_session(original_session_id) == False
        assert await enhanced_auth_manager.validate_session(rotated_session.session_id) == True
        
        # Test automatic session invalidation on suspicious activity
        await enhanced_auth_manager.invalidate_sessions_on_security_event(
            manufacturer["manufacturer_id"],
            event_type="suspicious_login_pattern"
        )
        
        # All sessions for this manufacturer should be invalidated
        assert await enhanced_auth_manager.validate_session(rotated_session.session_id) == False


class TestRateLimitingAndBruteForceProtection:
    """Comprehensive rate limiting and brute force protection tests"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_authentication_rate_limiting(self, enhanced_auth_manager, test_manufacturer_accounts):
        """
        Test rate limiting for authentication attempts.
        
        Requirements:
        - Limit login attempts per IP and account
        - Progressive delays for failed attempts
        - Account locking mechanisms
        - Rate limit bypass prevention
        """
        manufacturer = test_manufacturer_accounts['free_tier']
        
        # Register manufacturer
        await enhanced_auth_manager.register_manufacturer(manufacturer)
        
        # Test multiple failed authentication attempts
        failed_attempts = 0
        max_attempts = 5
        
        for i in range(max_attempts + 2):
            try:
                start_time = time.perf_counter()
                
                result = await enhanced_auth_manager.authenticate_manufacturer(
                    manufacturer["email"],
                    "WrongPassword123!",  # Incorrect password
                    ip_address="192.168.1.100"
                )
                
                auth_time = time.perf_counter() - start_time
                
                assert result == False
                failed_attempts += 1
                
                # Should implement progressive delays
                if failed_attempts > 2:
                    expected_delay = min(failed_attempts * 0.5, 5.0)  # Cap at 5 seconds
                    assert auth_time >= expected_delay * 0.8, f"Should have delay after {failed_attempts} failures"
                
            except RateLimitExceededError as e:
                assert failed_attempts >= max_attempts
                assert "rate limit" in str(e).lower()
                break
        
        # Account should be temporarily locked
        with pytest.raises(AccountLockedError):
            await enhanced_auth_manager.authenticate_manufacturer(
                manufacturer["email"],
                manufacturer["password"],  # Even correct password should fail
                ip_address="192.168.1.100"
            )
        
        # Test rate limiting per IP (different account, same IP)
        other_manufacturer = {
            **test_manufacturer_accounts['standard'],
            "email": "other@testeyewear.com",
            "manufacturer_id": "mfg_other_001"
        }
        
        await enhanced_auth_manager.register_manufacturer(other_manufacturer)
        
        # Should also be rate limited due to IP
        with pytest.raises(RateLimitExceededError):
            await enhanced_auth_manager.authenticate_manufacturer(
                other_manufacturer["email"],
                "WrongPassword123!",
                ip_address="192.168.1.100"  # Same IP as previous attempts
            )
        
        # Different IP should work
        result = await enhanced_auth_manager.authenticate_manufacturer(
            other_manufacturer["email"],
            other_manufacturer["password"],
            ip_address="192.168.1.200"  # Different IP
        )
        assert result == True


if __name__ == "__main__":
    # Run enhanced authentication tests with verbose output
    pytest.main([__file__, "-v", "--tb=short", "-m", "security"])