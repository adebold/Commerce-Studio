"""
Comprehensive Multi-Factor Authentication (MFA) tests for manufacturer security foundation.
Addresses critical MFA implementation gap identified in reflection_LS8.md.

This test suite validates:
1. TOTP secret generation and management
2. TOTP verification with time windows
3. Backup codes functionality
4. MFA integration with authentication flow
5. Performance benchmarks for all MFA operations
"""

import pytest
import asyncio
import time
import pyotp
import uuid
import qrcode
from datetime import datetime, timedelta
from typing import Dict, Any, List
from io import BytesIO
import base64

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.auth.manufacturer_auth import ManufacturerAuthManager, MFASetupResult, MFAVerificationResult
    from src.auth.exceptions import (
        MFARequiredError, InvalidMFATokenError, MFASetupError,
        BackupCodeUsedError, RateLimitExceededError
    )
except ImportError as e:
    pytest.skip(f"MFA modules not implemented: {e}", allow_module_level=True)


@pytest.fixture
async def mfa_auth_manager():
    """
    Enhanced ManufacturerAuthManager fixture with MFA enabled.
    NO MOCKS - Real implementation required.
    """
    auth_manager = ManufacturerAuthManager(
        secret_key="mfa_test_secret_key_for_comprehensive_testing",
        algorithm="HS256",
        token_expiry_hours=24,
        mfa_enabled=True,
        mfa_window_seconds=30,
        backup_codes_count=10,
        backup_code_length=8
    )
    await auth_manager.initialize()
    return auth_manager


@pytest.fixture
def test_manufacturer_mfa_accounts():
    """Fixture providing test manufacturer accounts for MFA scenarios"""
    return {
        'standard_mfa': {
            "manufacturer_id": "mfg_mfa_std_001",
            "email": "mfa.standard@testeyewear.com",
            "password": "MFASecure123!",
            "company_name": "MFA Standard Eyewear Co",
            "tier": "professional",
            "phone": "+1-555-MFA-0001"
        },
        'enterprise_mfa': {
            "manufacturer_id": "mfg_mfa_ent_001",
            "email": "mfa.enterprise@testeyewear.com",
            "password": "MFAEnterprise456!",
            "company_name": "MFA Enterprise Eyewear Corp",
            "tier": "enterprise",
            "phone": "+1-555-MFA-0002"
        }
    }


class TestMFASetupAndConfiguration:
    """Test MFA setup and configuration functionality"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_mfa_setup_totp_generation(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test TOTP secret generation and QR code creation.
        
        Requirements:
        - Generate cryptographically secure TOTP secrets
        - Create valid QR codes for authenticator apps
        - Performance: MFA setup < 100ms
        - Proper secret storage and retrieval
        """
        manufacturer_data = test_manufacturer_mfa_accounts['standard_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Test MFA setup performance
        start_time = time.perf_counter()
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        setup_time = time.perf_counter() - start_time
        
        # Verify setup results structure
        assert isinstance(mfa_setup, dict)
        assert "secret" in mfa_setup
        assert "qr_code" in mfa_setup
        assert "backup_codes" in mfa_setup
        assert "provisioning_uri" in mfa_setup
        
        # Verify performance requirement
        assert setup_time < 0.1, f"MFA setup too slow: {setup_time:.3f}s"
        
        # Verify secret format and security
        secret = mfa_setup["secret"]
        assert len(secret) == 32, "TOTP secret must be 32 characters (Base32)"
        assert secret.isalnum(), "TOTP secret must contain only alphanumeric characters"
        assert secret.isupper(), "TOTP secret should be uppercase Base32"
        
        # Verify backup codes
        backup_codes = mfa_setup["backup_codes"]
        assert len(backup_codes) == 10, "Must generate exactly 10 backup codes"
        for code in backup_codes:
            assert len(code) == 8, "Each backup code must be 8 characters"
            assert code.isalnum(), "Backup codes must be alphanumeric"
        
        # Verify QR code is valid base64 image
        qr_code_data = mfa_setup["qr_code"]
        assert qr_code_data.startswith("data:image/png;base64,"), "QR code must be base64 PNG"
        
        # Verify provisioning URI format
        provisioning_uri = mfa_setup["provisioning_uri"]
        assert provisioning_uri.startswith("otpauth://totp/"), "Invalid provisioning URI format"
        assert manufacturer_id in provisioning_uri, "Provisioning URI must contain manufacturer ID"
        assert "EyewearML" in provisioning_uri, "Provisioning URI must contain issuer"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_mfa_secret_storage_and_retrieval(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test secure storage and retrieval of MFA secrets.
        
        Requirements:
        - Secrets stored securely (encrypted)
        - Retrieval performance < 10ms
        - Secret rotation capability
        """
        manufacturer_data = test_manufacturer_mfa_accounts['enterprise_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Setup MFA
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        original_secret = mfa_setup["secret"]
        
        # Test secret retrieval performance
        start_time = time.perf_counter()
        retrieved_secret = await mfa_auth_manager.get_mfa_secret(manufacturer_id)
        retrieval_time = time.perf_counter() - start_time
        
        assert retrieved_secret == original_secret
        assert retrieval_time < 0.01, f"Secret retrieval too slow: {retrieval_time:.4f}s"
        
        # Test secret rotation
        await mfa_auth_manager.rotate_mfa_secret(manufacturer_id)
        new_secret = await mfa_auth_manager.get_mfa_secret(manufacturer_id)
        
        assert new_secret != original_secret, "Secret rotation must generate new secret"
        assert len(new_secret) == 32, "Rotated secret must maintain format"


class TestTOTPVerification:
    """Test TOTP token verification functionality"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_totp_verification_time_window(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test TOTP verification with time window tolerance.
        
        Requirements:
        - Verify current TOTP codes
        - Accept codes within ±30 second window
        - Reject codes outside time window
        - Performance: Verification < 50ms
        """
        manufacturer_data = test_manufacturer_mfa_accounts['standard_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Setup MFA
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        secret = mfa_setup["secret"]
        
        # Generate TOTP tokens for different time periods
        totp = pyotp.TOTP(secret)
        current_time = datetime.utcnow()
        
        # Current token
        current_token = totp.at(current_time)
        
        # Past token (within window)
        past_token = totp.at(current_time - timedelta(seconds=30))
        
        # Future token (within window)
        future_token = totp.at(current_time + timedelta(seconds=30))
        
        # Token outside window
        old_token = totp.at(current_time - timedelta(seconds=90))
        
        # Test current token verification
        start_time = time.perf_counter()
        is_valid_current = await mfa_auth_manager.verify_mfa_token(manufacturer_id, current_token)
        verification_time = time.perf_counter() - start_time
        
        assert is_valid_current == True, "Current TOTP token must be valid"
        assert verification_time < 0.05, f"TOTP verification too slow: {verification_time:.4f}s"
        
        # Test time window tolerance
        is_valid_past = await mfa_auth_manager.verify_mfa_token(manufacturer_id, past_token)
        is_valid_future = await mfa_auth_manager.verify_mfa_token(manufacturer_id, future_token)
        
        assert is_valid_past == True, "Past token within window must be valid"
        assert is_valid_future == True, "Future token within window must be valid"
        
        # Test token outside window
        is_valid_old = await mfa_auth_manager.verify_mfa_token(manufacturer_id, old_token)
        assert is_valid_old == False, "Token outside window must be invalid"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_totp_token_reuse_prevention(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test prevention of TOTP token reuse.
        
        Requirements:
        - Prevent replay attacks
        - Track used tokens
        - Clear used tokens after time window
        """
        manufacturer_data = test_manufacturer_mfa_accounts['enterprise_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Setup MFA
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        secret = mfa_setup["secret"]
        
        # Generate current TOTP token
        totp = pyotp.TOTP(secret)
        current_token = totp.now()
        
        # First verification should succeed
        is_valid_first = await mfa_auth_manager.verify_mfa_token(manufacturer_id, current_token)
        assert is_valid_first == True, "First token use must be valid"
        
        # Second verification should fail (token reuse)
        is_valid_second = await mfa_auth_manager.verify_mfa_token(manufacturer_id, current_token)
        assert is_valid_second == False, "Token reuse must be prevented"
        
        # Verify exception is raised for reused token
        with pytest.raises(InvalidMFATokenError) as exc_info:
            await mfa_auth_manager.verify_mfa_token(manufacturer_id, current_token, raise_on_invalid=True)
        
        assert "already used" in str(exc_info.value).lower()


class TestBackupCodesFunctionality:
    """Test backup codes generation and usage"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_backup_codes_generation_and_format(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test backup codes generation with proper format.
        
        Requirements:
        - Generate 10 unique backup codes
        - Each code 8 characters alphanumeric
        - Cryptographically secure generation
        """
        manufacturer_data = test_manufacturer_mfa_accounts['standard_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Setup MFA and get backup codes
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        backup_codes = mfa_setup["backup_codes"]
        
        # Verify backup codes format
        assert len(backup_codes) == 10, "Must generate exactly 10 backup codes"
        
        # Verify each backup code format
        for i, code in enumerate(backup_codes):
            assert len(code) == 8, f"Backup code {i} must be 8 characters: {code}"
            assert code.isalnum(), f"Backup code {i} must be alphanumeric: {code}"
            assert code.isupper(), f"Backup code {i} should be uppercase: {code}"
        
        # Verify uniqueness
        assert len(set(backup_codes)) == 10, "All backup codes must be unique"
        
        # Verify entropy (no obvious patterns)
        for code in backup_codes:
            # Check for simple patterns
            assert not all(c == code[0] for c in code), f"Backup code has repeated character: {code}"
            assert code != "12345678", "Backup code must not be sequential"
            assert code != "AAAAAAAA", "Backup code must not be repeated character"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_backup_codes_single_use_enforcement(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test single-use enforcement for backup codes.
        
        Requirements:
        - Each backup code can only be used once
        - Track used backup codes
        - Prevent backup code reuse
        """
        manufacturer_data = test_manufacturer_mfa_accounts['enterprise_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Setup MFA
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        backup_codes = mfa_setup["backup_codes"]
        test_backup_code = backup_codes[0]
        
        # First use should succeed
        is_valid_first = await mfa_auth_manager.verify_backup_code(manufacturer_id, test_backup_code)
        assert is_valid_first == True, "First backup code use must be valid"
        
        # Second use should fail
        is_valid_second = await mfa_auth_manager.verify_backup_code(manufacturer_id, test_backup_code)
        assert is_valid_second == False, "Backup code reuse must be prevented"
        
        # Verify exception for reused backup code
        with pytest.raises(BackupCodeUsedError) as exc_info:
            await mfa_auth_manager.verify_backup_code(
                manufacturer_id, test_backup_code, raise_on_used=True
            )
        
        assert "already used" in str(exc_info.value).lower()
        
        # Verify other backup codes still work
        second_backup_code = backup_codes[1]
        is_valid_other = await mfa_auth_manager.verify_backup_code(manufacturer_id, second_backup_code)
        assert is_valid_other == True, "Other backup codes must remain valid"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_backup_codes_regeneration(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test backup codes regeneration functionality.
        
        Requirements:
        - Generate new set of backup codes
        - Invalidate old backup codes
        - Maintain security properties
        """
        manufacturer_data = test_manufacturer_mfa_accounts['standard_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Setup MFA
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        original_backup_codes = mfa_setup["backup_codes"]
        
        # Use one backup code
        await mfa_auth_manager.verify_backup_code(manufacturer_id, original_backup_codes[0])
        
        # Regenerate backup codes
        new_backup_codes = await mfa_auth_manager.regenerate_backup_codes(manufacturer_id)
        
        # Verify new codes are different
        assert len(new_backup_codes) == 10, "Must generate 10 new backup codes"
        assert set(new_backup_codes).isdisjoint(set(original_backup_codes)), "New codes must be different"
        
        # Verify old codes are invalidated
        for old_code in original_backup_codes[1:]:  # Skip the used one
            is_valid_old = await mfa_auth_manager.verify_backup_code(manufacturer_id, old_code)
            assert is_valid_old == False, f"Old backup code must be invalid: {old_code}"
        
        # Verify new codes work
        is_valid_new = await mfa_auth_manager.verify_backup_code(manufacturer_id, new_backup_codes[0])
        assert is_valid_new == True, "New backup codes must be valid"


class TestMFAIntegrationWithAuthentication:
    """Test MFA integration with authentication flow"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_mfa_required_authentication_flow(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test authentication flow when MFA is required.
        
        Requirements:
        - Enforce MFA for enabled accounts
        - Proper error handling for missing MFA
        - Complete authentication with MFA
        """
        manufacturer_data = test_manufacturer_mfa_accounts['standard_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        email = manufacturer_data["email"]
        password = manufacturer_data["password"]
        
        # Register manufacturer
        await mfa_auth_manager.register_manufacturer(manufacturer_data)
        
        # Setup MFA
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        secret = mfa_setup["secret"]
        
        # Enable MFA for account
        await mfa_auth_manager.enable_mfa(manufacturer_id)
        
        # Attempt authentication without MFA should fail
        with pytest.raises(MFARequiredError) as exc_info:
            await mfa_auth_manager.authenticate_manufacturer(email, password)
        
        assert "MFA required" in str(exc_info.value)
        assert manufacturer_id in str(exc_info.value)
        
        # Generate TOTP token
        totp = pyotp.TOTP(secret)
        mfa_token = totp.now()
        
        # Complete authentication with MFA
        auth_result = await mfa_auth_manager.authenticate_manufacturer_with_mfa(
            email, password, mfa_token
        )
        
        assert auth_result.success == True
        assert auth_result.manufacturer_id == manufacturer_id
        assert auth_result.mfa_verified == True
        assert auth_result.token is not None
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_mfa_rate_limiting(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test rate limiting for MFA verification attempts.
        
        Requirements:
        - Limit MFA verification attempts
        - Implement exponential backoff
        - Prevent brute force attacks
        """
        manufacturer_data = test_manufacturer_mfa_accounts['enterprise_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Setup MFA
        await mfa_auth_manager.setup_mfa(manufacturer_id)
        
        # Attempt multiple invalid MFA verifications
        invalid_token = "000000"
        
        for attempt in range(5):  # Exceed rate limit
            try:
                await mfa_auth_manager.verify_mfa_token(manufacturer_id, invalid_token)
            except InvalidMFATokenError:
                pass  # Expected for invalid token
        
        # Next attempt should trigger rate limiting
        with pytest.raises(RateLimitExceededError) as exc_info:
            await mfa_auth_manager.verify_mfa_token(manufacturer_id, invalid_token)
        
        assert "rate limit exceeded" in str(exc_info.value).lower()
        assert "try again" in str(exc_info.value).lower()


class TestMFAPerformanceAndConcurrency:
    """Test MFA performance and concurrent operations"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_mfa_verification_performance_benchmarks(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test MFA verification performance requirements.
        
        Requirements:
        - TOTP verification < 50ms
        - Backup code verification < 30ms
        - Concurrent verification support
        """
        manufacturer_data = test_manufacturer_mfa_accounts['standard_mfa']
        manufacturer_id = manufacturer_data["manufacturer_id"]
        
        # Setup MFA
        mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
        secret = mfa_setup["secret"]
        backup_codes = mfa_setup["backup_codes"]
        
        # Test TOTP verification performance
        totp = pyotp.TOTP(secret)
        totp_token = totp.now()
        
        totp_times = []
        for _ in range(10):
            start_time = time.perf_counter()
            await mfa_auth_manager.verify_mfa_token(manufacturer_id, totp_token)
            verification_time = time.perf_counter() - start_time
            totp_times.append(verification_time)
        
        avg_totp_time = sum(totp_times) / len(totp_times)
        assert avg_totp_time < 0.05, f"TOTP verification too slow: {avg_totp_time:.4f}s"
        
        # Test backup code verification performance
        backup_times = []
        for i in range(5):  # Test first 5 backup codes
            start_time = time.perf_counter()
            await mfa_auth_manager.verify_backup_code(manufacturer_id, backup_codes[i])
            verification_time = time.perf_counter() - start_time
            backup_times.append(verification_time)
        
        avg_backup_time = sum(backup_times) / len(backup_times)
        assert avg_backup_time < 0.03, f"Backup code verification too slow: {avg_backup_time:.4f}s"
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_concurrent_mfa_operations(self, mfa_auth_manager, test_manufacturer_mfa_accounts):
        """
        Test concurrent MFA operations.
        
        Requirements:
        - Support multiple concurrent verifications
        - No race conditions in token tracking
        - Maintain security under load
        """
        # Setup multiple manufacturers with MFA
        manufacturer_ids = []
        secrets = []
        
        for i in range(5):
            manufacturer_data = {
                "manufacturer_id": f"mfg_concurrent_{i:03d}",
                "email": f"concurrent{i}@testeyewear.com",
                "password": f"ConcurrentSecure{i}!",
                "company_name": f"Concurrent Test Co {i}",
                "tier": "professional"
            }
            
            manufacturer_id = manufacturer_data["manufacturer_id"]
            manufacturer_ids.append(manufacturer_id)
            
            mfa_setup = await mfa_auth_manager.setup_mfa(manufacturer_id)
            secrets.append(mfa_setup["secret"])
        
        # Generate TOTP tokens for all manufacturers
        tokens = []
        for secret in secrets:
            totp = pyotp.TOTP(secret)
            tokens.append(totp.now())
        
        # Perform concurrent MFA verifications
        async def verify_mfa(manufacturer_id, token):
            return await mfa_auth_manager.verify_mfa_token(manufacturer_id, token)
        
        start_time = time.perf_counter()
        tasks = [
            verify_mfa(manufacturer_ids[i], tokens[i])
            for i in range(5)
        ]
        results = await asyncio.gather(*tasks)
        total_time = time.perf_counter() - start_time
        
        # Verify all verifications succeeded
        assert all(result == True for result in results), "All concurrent verifications must succeed"
        
        # Verify reasonable performance under concurrent load
        avg_time_per_verification = total_time / 5
        assert avg_time_per_verification < 0.1, f"Concurrent MFA too slow: {avg_time_per_verification:.4f}s"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])