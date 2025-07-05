"""
Integration Test for Real Security Validation

This test validates that our actual implemented security measures work correctly,
rather than testing the TDD placeholder methods.
"""
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, Mock
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from src.mongodb_foundation.managers import ProductCollectionManager
from src.mongodb_foundation.types import ServiceError, ErrorType

# Malicious SKUs that should be rejected
MALICIOUS_SKUS = [
    "sku with spaces",  # Invalid characters
    "sku$ne",  # MongoDB operator
    "sku{$gt: ''}",  # MongoDB injection
    "sku'; DROP TABLE products; --",  # SQL injection attempt
    "sku\x00null",  # Null byte injection
    "sku<script>alert('xss')</script>",  # XSS attempt
    "a" * 300,  # Too long SKU
    "",  # Empty SKU
    None,  # None value
]

VALID_SKUS = [
    "ABC123",
    "abc-123",
    "abc_123",
    "SKU-ABC-123_XYZ",
]


class TestRealSecurityValidation:
    """Test actual security validation in our implemented code"""

    @pytest_asyncio.fixture
    async def product_manager(self):
        """Create a ProductCollectionManager with mocked database"""
        # Mock the MongoDB collection
        mock_collection = AsyncMock()
        mock_collection.find_one = AsyncMock(return_value={"sku": "ABC123", "name": "Test Product"})
        
        # Mock the database
        mock_db = AsyncMock()
        mock_db.products = mock_collection
        
        # Create ProductCollectionManager with mocked database
        manager = ProductCollectionManager(mock_db)
        return manager

    @pytest.mark.asyncio
    async def test_findBySku_rejects_malicious_input(self, product_manager):
        """Test that findBySku properly validates SKU input and rejects malicious attempts"""
        
        for malicious_sku in MALICIOUS_SKUS:
            with pytest.raises(ServiceError) as exc_info:
                await product_manager.findBySku(malicious_sku)
            
            # Verify it's specifically a security violation
            assert exc_info.value.type == ErrorType.SECURITY_VIOLATION
            assert "Security validation failed" in str(exc_info.value.message)
            print(f"✅ Correctly rejected malicious SKU: {malicious_sku}")

    @pytest.mark.asyncio
    async def test_findBySku_accepts_valid_input(self, product_manager):
        """Test that findBySku accepts valid SKU input"""
        
        for valid_sku in VALID_SKUS:
            try:
                result = await product_manager.findBySku(valid_sku)
                # Should not raise exception and should return product data
                assert result is not None
                print(f"✅ Correctly accepted valid SKU: {valid_sku}")
            except ServiceError as e:
                pytest.fail(f"Valid SKU {valid_sku} was incorrectly rejected: {e}")

    @pytest.mark.asyncio 
    async def test_security_validation_is_active(self, product_manager):
        """Test that security validation is actually running, not bypassed"""
        
        # Test a clearly malicious input that should trigger validation
        malicious_input = "{'$ne': None}"
        
        with pytest.raises(ServiceError) as exc_info:
            await product_manager.findBySku(malicious_input)
        
        # Verify the error is from security validation, not database issues
        assert exc_info.value.type == ErrorType.SECURITY_VIOLATION
        assert "Security validation failed" in str(exc_info.value.message)
        print("✅ Security validation is active and working")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])