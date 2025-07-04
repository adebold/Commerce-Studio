"""
Comprehensive Usage Limits and Quota Enforcement tests for manufacturer security foundation.
Addresses critical usage tracking implementation gap identified in reflection_LS8.md.

This test suite validates:
1. Tier-based usage limits definition and enforcement
2. Real-time usage tracking with concurrent operations
3. Quota enforcement mechanisms and overage handling
4. Usage reset on billing cycles
5. Performance benchmarks for all usage operations
"""

import pytest
import asyncio
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.auth.manufacturer_rbac import (
        ManufacturerRBACManager, UsageLimits, UsageResult, 
        UsageTracker, QuotaEnforcer, BillingCycle
    )
    from src.auth.exceptions import (
        QuotaExceededError, RateLimitExceededError, 
        InvalidUsageTypeError, BillingCycleError
    )
except ImportError as e:
    pytest.skip(f"Usage limits modules not implemented: {e}", allow_module_level=True)


class UsageType(Enum):
    """Usage types for tracking"""
    PRODUCT_UPLOADS = "product_uploads"
    ML_REQUESTS = "ml_requests"
    API_CALLS = "api_calls"
    DATA_EXPORTS = "data_exports"
    BULK_OPERATIONS = "bulk_operations"


@pytest.fixture
async def usage_rbac_manager():
    """
    Enhanced ManufacturerRBACManager fixture with usage tracking enabled.
    NO MOCKS - Real implementation required.
    """
    rbac_manager = ManufacturerRBACManager(
        cache_enabled=True,
        cache_ttl_seconds=300,
        usage_tracking_enabled=True,
        quota_enforcement_enabled=True,
        real_time_tracking=True,
        billing_cycle_days=30
    )
    await rbac_manager.initialize()
    return rbac_manager


@pytest.fixture
def tier_usage_limits():
    """Fixture defining tier-based usage limits"""
    return {
        'free': {
            UsageType.PRODUCT_UPLOADS: 100,
            UsageType.ML_REQUESTS: 50,
            UsageType.API_CALLS: 1000,
            UsageType.DATA_EXPORTS: 5,
            UsageType.BULK_OPERATIONS: 0  # Not allowed
        },
        'professional': {
            UsageType.PRODUCT_UPLOADS: 1000,
            UsageType.ML_REQUESTS: 500,
            UsageType.API_CALLS: 10000,
            UsageType.DATA_EXPORTS: 50,
            UsageType.BULK_OPERATIONS: 10
        },
        'enterprise': {
            UsageType.PRODUCT_UPLOADS: -1,  # Unlimited
            UsageType.ML_REQUESTS: 5000,
            UsageType.API_CALLS: 100000,
            UsageType.DATA_EXPORTS: -1,  # Unlimited
            UsageType.BULK_OPERATIONS: -1  # Unlimited
        }
    }


@pytest.fixture
def test_manufacturer_usage_accounts():
    """Fixture providing test manufacturer accounts for usage scenarios"""
    return {
        'free_tier': {
            "manufacturer_id": "mfg_usage_free_001",
            "email": "usage.free@testeyewear.com",
            "company_name": "Free Usage Test Co",
            "tier": "free",
            "billing_cycle_start": datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        },
        'professional_tier': {
            "manufacturer_id": "mfg_usage_pro_001",
            "email": "usage.pro@testeyewear.com",
            "company_name": "Professional Usage Test Corp",
            "tier": "professional",
            "billing_cycle_start": datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        },
        'enterprise_tier': {
            "manufacturer_id": "mfg_usage_ent_001",
            "email": "usage.enterprise@testeyewear.com",
            "company_name": "Enterprise Usage Test Corp",
            "tier": "enterprise",
            "billing_cycle_start": datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        }
    }


class TestTierBasedUsageLimits:
    """Test tier-based usage limits definition and validation"""
    
    @pytest.mark.asyncio
    async def test_tier_based_usage_limits_enforcement(self, usage_rbac_manager, tier_usage_limits, test_manufacturer_usage_accounts):
        """
        Test comprehensive tier-based usage limits enforcement.
        
        Requirements:
        - Validate limits for each tier
        - Enforce tier-specific restrictions
        - Performance: Limit check < 10ms
        """
        for tier_name, account_data in test_manufacturer_usage_accounts.items():
            manufacturer_id = account_data["manufacturer_id"]
            tier = account_data["tier"]
            expected_limits = tier_usage_limits[tier]
            
            # Register manufacturer with tier
            await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
            
            # Test each usage type limit
            for usage_type, expected_limit in expected_limits.items():
                start_time = time.perf_counter()
                usage_result = await usage_rbac_manager.check_usage_limit(
                    manufacturer_id, usage_type
                )
                check_time = time.perf_counter() - start_time
                
                # Verify response structure
                assert isinstance(usage_result, dict)
                assert "allowed" in usage_result
                assert "remaining" in usage_result
                assert "limit" in usage_result
                assert "current" in usage_result
                assert "tier" in usage_result
                assert "usage_type" in usage_result
                
                # Verify limits match tier
                assert usage_result["limit"] == expected_limit
                assert usage_result["tier"] == tier
                assert usage_result["usage_type"] == usage_type.value
                
                # Verify performance requirement
                assert check_time < 0.01, f"Usage limit check too slow: {check_time:.4f}s for {tier}/{usage_type.value}"
                
                # For new accounts, current usage should be 0
                assert usage_result["current"] == 0
                
                # Verify remaining calculation
                if expected_limit == -1:  # Unlimited
                    assert usage_result["remaining"] == -1
                    assert usage_result["allowed"] == True
                else:
                    assert usage_result["remaining"] == expected_limit
                    assert usage_result["allowed"] == True
    
    @pytest.mark.asyncio
    async def test_usage_limit_tier_differences(self, usage_rbac_manager, tier_usage_limits):
        """
        Test that different tiers have different usage limits.
        
        Requirements:
        - Free tier has lowest limits
        - Professional tier has moderate limits
        - Enterprise tier has highest/unlimited limits
        """
        # Create manufacturers for each tier
        manufacturers = {}
        for tier in ['free', 'professional', 'enterprise']:
            manufacturer_id = f"mfg_tier_diff_{tier}_001"
            await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
            manufacturers[tier] = manufacturer_id
        
        # Compare limits across tiers for each usage type
        for usage_type in UsageType:
            limits = {}
            for tier, manufacturer_id in manufacturers.items():
                usage_result = await usage_rbac_manager.check_usage_limit(
                    manufacturer_id, usage_type
                )
                limits[tier] = usage_result["limit"]
            
            # Verify tier hierarchy (unless unlimited)
            if limits['free'] != -1 and limits['professional'] != -1:
                assert limits['free'] <= limits['professional'], \
                    f"Free tier limit should be <= Professional for {usage_type.value}"
            
            if limits['professional'] != -1 and limits['enterprise'] != -1:
                assert limits['professional'] <= limits['enterprise'], \
                    f"Professional tier limit should be <= Enterprise for {usage_type.value}"


class TestRealTimeUsageTracking:
    """Test real-time usage tracking functionality"""
    
    @pytest.mark.asyncio
    async def test_usage_increment_and_tracking(self, usage_rbac_manager, test_manufacturer_usage_accounts):
        """
        Test usage increment operations and real-time tracking.
        
        Requirements:
        - Accurate usage increment
        - Real-time usage updates
        - Performance: Increment < 5ms
        """
        account_data = test_manufacturer_usage_accounts['professional_tier']
        manufacturer_id = account_data["manufacturer_id"]
        tier = account_data["tier"]
        
        # Register manufacturer
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
        
        # Test usage increment for different types
        test_increments = [
            (UsageType.PRODUCT_UPLOADS, 5),
            (UsageType.ML_REQUESTS, 10),
            (UsageType.API_CALLS, 100),
            (UsageType.DATA_EXPORTS, 2)
        ]
        
        for usage_type, increment_amount in test_increments:
            # Get initial usage
            initial_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
            assert initial_usage == 0, f"Initial usage should be 0 for {usage_type.value}"
            
            # Perform increments
            for i in range(increment_amount):
                start_time = time.perf_counter()
                await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, 1)
                increment_time = time.perf_counter() - start_time
                
                # Verify performance requirement
                assert increment_time < 0.005, f"Usage increment too slow: {increment_time:.4f}s"
                
                # Verify real-time tracking
                current_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
                assert current_usage == i + 1, f"Usage not tracked correctly: expected {i+1}, got {current_usage}"
            
            # Verify final usage
            final_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
            assert final_usage == increment_amount, \
                f"Final usage incorrect for {usage_type.value}: expected {increment_amount}, got {final_usage}"
    
    @pytest.mark.asyncio
    async def test_concurrent_usage_tracking_accuracy(self, usage_rbac_manager, test_manufacturer_usage_accounts):
        """
        Test usage tracking accuracy under concurrent operations.
        
        Requirements:
        - No race conditions in usage tracking
        - Accurate counts under concurrent load
        - Atomic increment operations
        """
        account_data = test_manufacturer_usage_accounts['enterprise_tier']
        manufacturer_id = account_data["manufacturer_id"]
        tier = account_data["tier"]
        
        # Register manufacturer
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
        
        # Perform concurrent usage increments
        concurrent_increments = 50
        usage_type = UsageType.API_CALLS
        
        async def increment_usage():
            await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, 1)
        
        # Execute concurrent increments
        start_time = time.perf_counter()
        tasks = [increment_usage() for _ in range(concurrent_increments)]
        await asyncio.gather(*tasks)
        total_time = time.perf_counter() - start_time
        
        # Verify accurate count
        final_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
        assert final_usage == concurrent_increments, \
            f"Concurrent usage tracking failed: expected {concurrent_increments}, got {final_usage}"
        
        # Verify reasonable performance under load
        avg_time_per_increment = total_time / concurrent_increments
        assert avg_time_per_increment < 0.01, \
            f"Concurrent usage increment too slow: {avg_time_per_increment:.4f}s"
    
    @pytest.mark.asyncio
    async def test_usage_tracking_persistence(self, usage_rbac_manager, test_manufacturer_usage_accounts):
        """
        Test usage tracking persistence across sessions.
        
        Requirements:
        - Usage data persists across manager restarts
        - Accurate usage restoration
        - Data integrity maintenance
        """
        account_data = test_manufacturer_usage_accounts['free_tier']
        manufacturer_id = account_data["manufacturer_id"]
        tier = account_data["tier"]
        
        # Register manufacturer and increment usage
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
        
        usage_increments = {
            UsageType.PRODUCT_UPLOADS: 25,
            UsageType.ML_REQUESTS: 15,
            UsageType.API_CALLS: 500
        }
        
        for usage_type, amount in usage_increments.items():
            await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, amount)
        
        # Simulate manager restart
        await usage_rbac_manager.shutdown()
        new_rbac_manager = ManufacturerRBACManager(
            cache_enabled=True,
            usage_tracking_enabled=True,
            quota_enforcement_enabled=True
        )
        await new_rbac_manager.initialize()
        
        # Verify usage data persistence
        for usage_type, expected_amount in usage_increments.items():
            current_usage = await new_rbac_manager.get_current_usage(manufacturer_id, usage_type)
            assert current_usage == expected_amount, \
                f"Usage not persisted for {usage_type.value}: expected {expected_amount}, got {current_usage}"


class TestQuotaEnforcementMechanisms:
    """Test quota enforcement and overage handling"""
    
    @pytest.mark.asyncio
    async def test_usage_quota_enforcement_and_overages(self, usage_rbac_manager, test_manufacturer_usage_accounts, tier_usage_limits):
        """
        Test quota enforcement when limits are exceeded.
        
        Requirements:
        - Block operations when quota exceeded
        - Proper error handling for overages
        - Quota status in responses
        """
        account_data = test_manufacturer_usage_accounts['free_tier']
        manufacturer_id = account_data["manufacturer_id"]
        tier = account_data["tier"]
        
        # Register manufacturer
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
        
        # Test quota enforcement for product uploads (free tier limit: 100)
        usage_type = UsageType.PRODUCT_UPLOADS
        limit = tier_usage_limits['free'][usage_type]
        
        # Increment usage to limit
        await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, limit)
        
        # Verify at limit
        usage_result = await usage_rbac_manager.check_usage_limit(manufacturer_id, usage_type)
        assert usage_result["remaining"] == 0
        assert usage_result["allowed"] == False
        assert usage_result["current"] == limit
        
        # Test quota exceeded exception
        with pytest.raises(QuotaExceededError) as exc_info:
            await usage_rbac_manager.enforce_usage_limit(manufacturer_id, usage_type)
        
        error_message = str(exc_info.value).lower()
        assert "quota exceeded" in error_message
        assert manufacturer_id in str(exc_info.value)
        assert usage_type.value in error_message
        
        # Test increment beyond limit fails
        with pytest.raises(QuotaExceededError):
            await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, 1, enforce_limit=True)
        
        # Verify usage didn't increase beyond limit
        final_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
        assert final_usage == limit, "Usage should not exceed limit when enforcement is enabled"
    
    @pytest.mark.asyncio
    async def test_unlimited_tier_quota_handling(self, usage_rbac_manager, test_manufacturer_usage_accounts):
        """
        Test quota handling for unlimited tier features.
        
        Requirements:
        - Unlimited features have no quota enforcement
        - Proper handling of -1 limits
        - Performance under high usage
        """
        account_data = test_manufacturer_usage_accounts['enterprise_tier']
        manufacturer_id = account_data["manufacturer_id"]
        tier = account_data["tier"]
        
        # Register manufacturer
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
        
        # Test unlimited usage types
        unlimited_types = [UsageType.PRODUCT_UPLOADS, UsageType.DATA_EXPORTS, UsageType.BULK_OPERATIONS]
        
        for usage_type in unlimited_types:
            # Verify unlimited status
            usage_result = await usage_rbac_manager.check_usage_limit(manufacturer_id, usage_type)
            assert usage_result["limit"] == -1, f"{usage_type.value} should be unlimited for enterprise"
            assert usage_result["remaining"] == -1, f"{usage_type.value} remaining should be -1"
            assert usage_result["allowed"] == True, f"{usage_type.value} should always be allowed"
            
            # Test high usage without quota enforcement
            high_usage_amount = 10000
            await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, high_usage_amount)
            
            # Verify no quota enforcement
            current_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
            assert current_usage == high_usage_amount
            
            # Verify still allowed after high usage
            usage_result = await usage_rbac_manager.check_usage_limit(manufacturer_id, usage_type)
            assert usage_result["allowed"] == True
    
    @pytest.mark.asyncio
    async def test_tier_upgrade_quota_impact(self, usage_rbac_manager):
        """
        Test impact of tier upgrades on usage quotas.
        
        Requirements:
        - Tier upgrade increases limits
        - Existing usage preserved
        - Immediate quota relief
        """
        manufacturer_id = "mfg_tier_upgrade_001"
        
        # Start with free tier
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, "free")
        
        # Use up free tier quota for ML requests (limit: 50)
        usage_type = UsageType.ML_REQUESTS
        free_limit = 50
        await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, free_limit)
        
        # Verify at free tier limit
        usage_result = await usage_rbac_manager.check_usage_limit(manufacturer_id, usage_type)
        assert usage_result["allowed"] == False
        assert usage_result["remaining"] == 0
        
        # Upgrade to professional tier
        await usage_rbac_manager.upgrade_manufacturer_tier(manufacturer_id, "professional")
        
        # Verify quota relief
        usage_result = await usage_rbac_manager.check_usage_limit(manufacturer_id, usage_type)
        professional_limit = 500
        assert usage_result["limit"] == professional_limit
        assert usage_result["current"] == free_limit  # Usage preserved
        assert usage_result["remaining"] == professional_limit - free_limit
        assert usage_result["allowed"] == True
        
        # Verify can continue using service
        await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, 10)
        current_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
        assert current_usage == free_limit + 10


class TestBillingCycleAndUsageReset:
    """Test billing cycle management and usage reset"""
    
    @pytest.mark.asyncio
    async def test_usage_reset_on_billing_cycle(self, usage_rbac_manager, test_manufacturer_usage_accounts):
        """
        Test usage reset on billing cycle boundaries.
        
        Requirements:
        - Reset usage at billing cycle start
        - Preserve historical usage data
        - Accurate billing cycle tracking
        """
        account_data = test_manufacturer_usage_accounts['professional_tier']
        manufacturer_id = account_data["manufacturer_id"]
        tier = account_data["tier"]
        
        # Register manufacturer
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
        
        # Increment usage in current billing cycle
        usage_increments = {
            UsageType.PRODUCT_UPLOADS: 100,
            UsageType.ML_REQUESTS: 50,
            UsageType.API_CALLS: 1000
        }
        
        for usage_type, amount in usage_increments.items():
            await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, amount)
        
        # Verify current usage
        for usage_type, expected_amount in usage_increments.items():
            current_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
            assert current_usage == expected_amount
        
        # Simulate billing cycle reset
        await usage_rbac_manager.reset_billing_cycle(manufacturer_id)
        
        # Verify usage reset
        for usage_type in usage_increments.keys():
            current_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
            assert current_usage == 0, f"Usage not reset for {usage_type.value}"
        
        # Verify historical data preserved
        previous_cycle_usage = await usage_rbac_manager.get_previous_cycle_usage(manufacturer_id)
        for usage_type, expected_amount in usage_increments.items():
            assert previous_cycle_usage[usage_type.value] == expected_amount
    
    @pytest.mark.asyncio
    async def test_billing_cycle_automatic_reset(self, usage_rbac_manager):
        """
        Test automatic billing cycle reset based on time.
        
        Requirements:
        - Automatic reset after billing period
        - Accurate billing cycle calculation
        - No manual intervention required
        """
        manufacturer_id = "mfg_auto_reset_001"
        tier = "professional"
        
        # Register manufacturer with past billing cycle start
        past_billing_start = datetime.utcnow() - timedelta(days=35)  # 35 days ago
        await usage_rbac_manager.register_manufacturer_usage(
            manufacturer_id, tier, billing_cycle_start=past_billing_start
        )
        
        # Add some usage
        await usage_rbac_manager.increment_usage(manufacturer_id, UsageType.API_CALLS, 500)
        
        # Check if billing cycle needs reset
        needs_reset = await usage_rbac_manager.check_billing_cycle_reset_needed(manufacturer_id)
        assert needs_reset == True, "Billing cycle should need reset after 35 days"
        
        # Trigger automatic reset check
        await usage_rbac_manager.process_automatic_billing_resets()
        
        # Verify usage was reset
        current_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, UsageType.API_CALLS)
        assert current_usage == 0, "Usage should be reset after automatic billing cycle reset"
        
        # Verify new billing cycle start
        billing_info = await usage_rbac_manager.get_billing_cycle_info(manufacturer_id)
        assert billing_info["cycle_start"] > past_billing_start
        assert billing_info["days_remaining"] > 25  # Should be close to 30 days


class TestUsagePerformanceAndOptimization:
    """Test usage tracking performance and optimization"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_usage_tracking_performance_benchmarks(self, usage_rbac_manager, test_manufacturer_usage_accounts):
        """
        Test usage tracking performance requirements.
        
        Requirements:
        - Usage check < 10ms
        - Usage increment < 5ms
        - Quota enforcement < 5ms
        """
        account_data = test_manufacturer_usage_accounts['professional_tier']
        manufacturer_id = account_data["manufacturer_id"]
        tier = account_data["tier"]
        
        # Register manufacturer
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
        
        # Test usage check performance
        check_times = []
        for _ in range(20):
            start_time = time.perf_counter()
            await usage_rbac_manager.check_usage_limit(manufacturer_id, UsageType.API_CALLS)
            check_time = time.perf_counter() - start_time
            check_times.append(check_time)
        
        avg_check_time = sum(check_times) / len(check_times)
        assert avg_check_time < 0.01, f"Usage check too slow: {avg_check_time:.4f}s"
        
        # Test usage increment performance
        increment_times = []
        for _ in range(20):
            start_time = time.perf_counter()
            await usage_rbac_manager.increment_usage(manufacturer_id, UsageType.API_CALLS, 1)
            increment_time = time.perf_counter() - start_time
            increment_times.append(increment_time)
        
        avg_increment_time = sum(increment_times) / len(increment_times)
        assert avg_increment_time < 0.005, f"Usage increment too slow: {avg_increment_time:.4f}s"
        
        # Test quota enforcement performance
        enforcement_times = []
        for _ in range(20):
            start_time = time.perf_counter()
            try:
                await usage_rbac_manager.enforce_usage_limit(manufacturer_id, UsageType.API_CALLS)
            except QuotaExceededError:
                pass  # Expected when quota exceeded
            enforcement_time = time.perf_counter() - start_time
            enforcement_times.append(enforcement_time)
        
        avg_enforcement_time = sum(enforcement_times) / len(enforcement_times)
        assert avg_enforcement_time < 0.005, f"Quota enforcement too slow: {avg_enforcement_time:.4f}s"
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_high_volume_usage_tracking(self, usage_rbac_manager):
        """
        Test usage tracking under high volume operations.
        
        Requirements:
        - Handle high volume usage tracking
        - Maintain performance under load
        - No data loss or corruption
        """
        manufacturer_id = "mfg_high_volume_001"
        tier = "enterprise"
        
        # Register manufacturer
        await usage_rbac_manager.register_manufacturer_usage(manufacturer_id, tier)
        
        # Simulate high volume usage
        high_volume_increments = 1000
        usage_type = UsageType.API_CALLS
        
        start_time = time.perf_counter()
        
        # Perform high volume increments
        for i in range(high_volume_increments):
            await usage_rbac_manager.increment_usage(manufacturer_id, usage_type, 1)
            
            # Check performance every 100 increments
            if (i + 1) % 100 == 0:
                current_time = time.perf_counter()
                elapsed_time = current_time - start_time
                avg_time_per_increment = elapsed_time / (i + 1)
                assert avg_time_per_increment < 0.01, \
                    f"High volume usage tracking degraded: {avg_time_per_increment:.4f}s per increment"
        
        total_time = time.perf_counter() - start_time
        
        # Verify accurate count
        final_usage = await usage_rbac_manager.get_current_usage(manufacturer_id, usage_type)
        assert final_usage == high_volume_increments, \
            f"High volume tracking failed: expected {high_volume_increments}, got {final_usage}"
        
        # Verify reasonable total performance
        avg_time_per_increment = total_time / high_volume_increments
        assert avg_time_per_increment < 0.01, \
            f"High volume usage tracking too slow: {avg_time_per_increment:.4f}s per increment"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])