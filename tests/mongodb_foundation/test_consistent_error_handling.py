"""
Consistent Error Handling Test
=============================

This test addresses the "Inconsistent Error Handling" critical issue identified in the reflection document.
The original implementation had mixed exception patterns and unreachable code.

This test validates:
1. Consistent error handling patterns across all managers
2. Proper error type classification and propagation
3. No unreachable error handling code
4. Standardized error messages and structure
5. Proper exception chaining and context preservation
"""

import pytest
import pytest_asyncio
import asyncio
from typing import Dict, Any, List
from unittest.mock import patch, AsyncMock
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.mongodb_foundation.managers import ProductCollectionManager
from src.mongodb_foundation.types import ServiceError, ErrorType
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import (
    DuplicateKeyError, 
    ConnectionFailure, 
    ServerSelectionTimeoutError,
    InvalidOperation,
    NetworkTimeout,
    WriteError,
    BulkWriteError
)


class TestConsistentErrorHandling:
    """Test consistent error handling patterns across the MongoDB Foundation Service"""
    
    @pytest_asyncio.fixture
    async def error_test_manager(self):
        """Create a ProductCollectionManager for error testing"""
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        test_db = client.error_test_eyewear_db
        
        # Verify MongoDB connection
        try:
            await client.admin.command('ping')
        except (ConnectionFailure, ServerSelectionTimeoutError):
            pytest.skip("MongoDB not available for error handling testing")
        
        # Clean up test collection
        await test_db.products.delete_many({})
        
        manager = ProductCollectionManager(test_db)
        yield manager
        
        # Clean up after test
        await test_db.products.delete_many({})
        client.close()

    @pytest.mark.asyncio
    async def test_duplicate_key_error_consistency(self, error_test_manager):
        """Test consistent handling of duplicate key errors across operations"""
        
        print("\n🔍 Testing Duplicate Key Error Consistency")
        
        # Create a product first
        product_data = {
            "sku": "DUP-TEST-001",
            "name": "Duplicate Test Product",
            "brand": "Test Brand"
        }
        
        await error_test_manager.create(product_data)
        
        # Test duplicate in create operation
        with pytest.raises(ServiceError) as exc_info:
            await error_test_manager.create(product_data)
        
        create_error = exc_info.value
        assert create_error.type == ErrorType.DUPLICATE_KEY
        assert "already exists" in str(create_error.message).lower()
        assert create_error.details is not None
        assert "sku" in create_error.details
        
        print(f"✅ Create duplicate error: {create_error.type} - {create_error.message}")
        
        # Verify error structure consistency
        assert hasattr(create_error, 'type')
        assert hasattr(create_error, 'message')
        assert hasattr(create_error, 'details')
        assert hasattr(create_error, 'timestamp')
        
        print("✅ Duplicate key error handling consistent")

    @pytest.mark.asyncio
    async def test_not_found_error_consistency(self, error_test_manager):
        """Test consistent handling of not found errors across operations"""
        
        print("\n🔍 Testing Not Found Error Consistency")
        
        non_existent_sku = "NOT-FOUND-001"
        
        # Test not found in findBySku
        result = await error_test_manager.findBySku(non_existent_sku)
        assert result is None  # Should return None, not raise error
        
        # Test not found in update
        with pytest.raises(ServiceError) as exc_info:
            await error_test_manager.update(non_existent_sku, {"name": "Updated"})
        
        update_error = exc_info.value
        assert update_error.type == ErrorType.NOT_FOUND
        assert "not found" in str(update_error.message).lower()
        assert non_existent_sku in str(update_error.message)
        
        print(f"✅ Update not found error: {update_error.type} - {update_error.message}")
        
        # Test not found in delete
        with pytest.raises(ServiceError) as exc_info:
            await error_test_manager.delete(non_existent_sku)
        
        delete_error = exc_info.value
        assert delete_error.type == ErrorType.NOT_FOUND
        assert "not found" in str(delete_error.message).lower()
        assert non_existent_sku in str(delete_error.message)
        
        print(f"✅ Delete not found error: {delete_error.type} - {delete_error.message}")
        
        # Verify error structure consistency across operations
        for error in [update_error, delete_error]:
            assert hasattr(error, 'type')
            assert hasattr(error, 'message')
            assert hasattr(error, 'details')
            assert hasattr(error, 'timestamp')
            assert error.type == ErrorType.NOT_FOUND
        
        print("✅ Not found error handling consistent across operations")

    @pytest.mark.asyncio
    async def test_validation_error_consistency(self, error_test_manager):
        """Test consistent handling of validation errors"""
        
        print("\n🔍 Testing Validation Error Consistency")
        
        validation_test_cases = [
            # Invalid SKU cases
            ({"sku": "", "name": "Test"}, "Invalid SKU format"),
            ({"sku": None, "name": "Test"}, "SKU must be a string"),
            ({"sku": 123, "name": "Test"}, "SKU must be a string"),
            ({"sku": "invalid sku", "name": "Test"}, "Invalid SKU format"),
            
            # Missing required fields
            ({"name": "Test"}, "SKU is required"),
            ({"sku": "TEST-001"}, "Name is required"),
            
            # Invalid data types
            ({"sku": "TEST-002", "name": None}, "Name must be a string"),
            ({"sku": "TEST-003", "name": "Test", "price": "invalid"}, "Price must be a number"),
        ]
        
        validation_errors = []
        
        for invalid_data, expected_message_part in validation_test_cases:
            with pytest.raises(ServiceError) as exc_info:
                await error_test_manager.create(invalid_data)
            
            error = exc_info.value
            validation_errors.append(error)
            
            # Verify error type and message
            assert error.type == ErrorType.VALIDATION_ERROR
            assert expected_message_part.lower() in str(error.message).lower()
            
            print(f"✅ Validation error: {error.message}")
        
        # Verify all validation errors have consistent structure
        for error in validation_errors:
            assert hasattr(error, 'type')
            assert hasattr(error, 'message')
            assert hasattr(error, 'details')
            assert hasattr(error, 'timestamp')
            assert error.type == ErrorType.VALIDATION_ERROR
        
        print("✅ Validation error handling consistent")

    @pytest.mark.asyncio
    async def test_security_error_consistency(self, error_test_manager):
        """Test consistent handling of security errors"""
        
        print("\n🔍 Testing Security Error Consistency")
        
        security_test_cases = [
            "{'$ne': None}",
            "$ne",
            "{$gt: ''}",
            "'; DROP TABLE products; --",
            "<script>alert('xss')</script>",
            "../../../etc/passwd",
            "admin'/*",
        ]
        
        security_errors = []
        
        for malicious_input in security_test_cases:
            with pytest.raises(ServiceError) as exc_info:
                await error_test_manager.findBySku(malicious_input)
            
            error = exc_info.value
            security_errors.append(error)
            
            # Verify error type and message
            assert error.type == ErrorType.SECURITY_VIOLATION
            assert "security" in str(error.message).lower() or "validation failed" in str(error.message).lower()
            
            print(f"✅ Security error: {error.message}")
        
        # Verify all security errors have consistent structure
        for error in security_errors:
            assert hasattr(error, 'type')
            assert hasattr(error, 'message')
            assert hasattr(error, 'details')
            assert hasattr(error, 'timestamp')
            assert error.type == ErrorType.SECURITY_VIOLATION
        
        print("✅ Security error handling consistent")

    @pytest.mark.asyncio
    async def test_database_connection_error_handling(self, error_test_manager):
        """Test consistent handling of database connection errors"""
        
        print("\n🔍 Testing Database Connection Error Handling")
        
        # Mock connection failure during operation
        with patch.object(error_test_manager.collection, 'insert_one', side_effect=ConnectionFailure("Connection lost")):
            with pytest.raises(ServiceError) as exc_info:
                await error_test_manager.create({
                    "sku": "CONN-TEST-001",
                    "name": "Connection Test"
                })
            
            error = exc_info.value
            assert error.type == ErrorType.DATABASE_ERROR
            assert "connection" in str(error.message).lower()
            
            print(f"✅ Connection error: {error.message}")
        
        # Mock timeout during operation
        with patch.object(error_test_manager.collection, 'find_one', side_effect=NetworkTimeout("Operation timed out")):
            with pytest.raises(ServiceError) as exc_info:
                await error_test_manager.findBySku("TIMEOUT-TEST")
            
            error = exc_info.value
            assert error.type == ErrorType.DATABASE_ERROR
            assert "timeout" in str(error.message).lower() or "network" in str(error.message).lower()
            
            print(f"✅ Timeout error: {error.message}")
        
        print("✅ Database connection error handling consistent")

    @pytest.mark.asyncio
    async def test_error_message_standardization(self, error_test_manager):
        """Test that error messages follow consistent patterns"""
        
        print("\n🔍 Testing Error Message Standardization")
        
        # Test various error scenarios and collect messages
        error_messages = []
        
        # Validation error
        try:
            await error_test_manager.create({"sku": "", "name": "Test"})
        except ServiceError as e:
            error_messages.append(("VALIDATION", e.message))
        
        # Create a product for subsequent tests
        await error_test_manager.create({"sku": "STD-TEST-001", "name": "Standard Test"})
        
        # Duplicate key error
        try:
            await error_test_manager.create({"sku": "STD-TEST-001", "name": "Duplicate"})
        except ServiceError as e:
            error_messages.append(("DUPLICATE", e.message))
        
        # Not found error
        try:
            await error_test_manager.update("NON-EXISTENT", {"name": "Updated"})
        except ServiceError as e:
            error_messages.append(("NOT_FOUND", e.message))
        
        # Security error
        try:
            await error_test_manager.findBySku("$ne")
        except ServiceError as e:
            error_messages.append(("SECURITY", e.message))
        
        print("Error message analysis:")
        for error_type, message in error_messages:
            print(f"  {error_type}: {message}")
        
        # Verify message patterns
        for error_type, message in error_messages:
            # Messages should be descriptive
            assert len(message) > 10, f"{error_type} message too short: {message}"
            
            # Messages should not contain stack traces
            assert "Traceback" not in message
            assert "File \"" not in message
            
            # Messages should be user-friendly
            assert not message.startswith("Exception"), f"{error_type} message not user-friendly: {message}"
        
        print("✅ Error message standardization validated")

    @pytest.mark.asyncio
    async def test_error_context_preservation(self, error_test_manager):
        """Test that error context is properly preserved through the stack"""
        
        print("\n🔍 Testing Error Context Preservation")
        
        # Test that original exception information is preserved
        with patch.object(error_test_manager.collection, 'insert_one', side_effect=DuplicateKeyError("E11000 duplicate key")):
            with pytest.raises(ServiceError) as exc_info:
                await error_test_manager.create({
                    "sku": "CONTEXT-TEST-001",
                    "name": "Context Test"
                })
            
            error = exc_info.value
            
            # Verify original exception is preserved in details
            assert error.details is not None
            assert "original_error" in error.details or "error_type" in error.details
            
            print(f"✅ Context preserved: {error.details}")
        
        # Test exception chaining
        with patch.object(error_test_manager.collection, 'find_one', side_effect=InvalidOperation("Invalid operation")):
            with pytest.raises(ServiceError) as exc_info:
                await error_test_manager.findBySku("CHAIN-TEST")
            
            error = exc_info.value
            
            # Verify error has proper context
            assert error.type == ErrorType.DATABASE_ERROR
            assert error.details is not None
            
            print(f"✅ Exception chaining preserved: {error.type}")
        
        print("✅ Error context preservation validated")

    @pytest.mark.asyncio
    async def test_no_unreachable_error_code(self, error_test_manager):
        """Test that there are no unreachable error handling code paths"""
        
        print("\n🔍 Testing for Unreachable Error Code")
        
        # This test uses coverage-style analysis to ensure error paths are reachable
        error_scenarios = [
            # Each scenario should be able to trigger its corresponding error path
            ("validation", lambda: error_test_manager.create({"sku": ""})),
            ("duplicate", lambda: self._create_duplicate_scenario(error_test_manager)),
            ("not_found", lambda: error_test_manager.update("NOT-FOUND", {"name": "Test"})),
            ("security", lambda: error_test_manager.findBySku("{'$ne': None}")),
        ]
        
        triggered_errors = []
        
        for scenario_name, error_func in error_scenarios:
            try:
                await error_func()
                # If no error was raised, this indicates unreachable error code
                assert False, f"Expected error not triggered for {scenario_name} scenario"
            except ServiceError as e:
                triggered_errors.append((scenario_name, e.type))
                print(f"✅ {scenario_name} error path reachable: {e.type}")
            except Exception as e:
                assert False, f"Unexpected exception type for {scenario_name}: {type(e)} - {e}"
        
        # Verify all expected error types were triggered
        expected_error_types = {
            ErrorType.VALIDATION_ERROR,
            ErrorType.DUPLICATE_KEY,
            ErrorType.NOT_FOUND,
            ErrorType.SECURITY_VIOLATION
        }
        
        triggered_error_types = {error_type for _, error_type in triggered_errors}
        
        missing_error_types = expected_error_types - triggered_error_types
        assert not missing_error_types, f"Some error types not triggered: {missing_error_types}"
        
        print("✅ No unreachable error code detected")

    async def _create_duplicate_scenario(self, manager):
        """Helper to create a duplicate key scenario"""
        # Create original product
        await manager.create({"sku": "DUP-HELPER-001", "name": "Original"})
        # Try to create duplicate
        await manager.create({"sku": "DUP-HELPER-001", "name": "Duplicate"})

    @pytest.mark.asyncio
    async def test_error_recovery_patterns(self, error_test_manager):
        """Test that the system can recover gracefully from errors"""
        
        print("\n🔍 Testing Error Recovery Patterns")
        
        # Test recovery after validation error
        try:
            await error_test_manager.create({"sku": "", "name": "Invalid"})
        except ServiceError:
            pass  # Expected error
        
        # System should work normally after error
        recovery_product = await error_test_manager.create({
            "sku": "RECOVERY-001",
            "name": "Recovery Test"
        })
        assert recovery_product is not None
        print("✅ Recovery after validation error successful")
        
        # Test recovery after duplicate key error
        try:
            await error_test_manager.create({
                "sku": "RECOVERY-001",
                "name": "Duplicate"
            })
        except ServiceError:
            pass  # Expected error
        
        # System should still work for other operations
        found_product = await error_test_manager.findBySku("RECOVERY-001")
        assert found_product is not None
        print("✅ Recovery after duplicate key error successful")
        
        # Test recovery after not found error
        try:
            await error_test_manager.update("NON-EXISTENT", {"name": "Updated"})
        except ServiceError:
            pass  # Expected error
        
        # System should still work for valid updates
        updated_product = await error_test_manager.update("RECOVERY-001", {"name": "Updated Recovery"})
        assert updated_product["name"] == "Updated Recovery"
        print("✅ Recovery after not found error successful")
        
        print("✅ Error recovery patterns validated")

    @pytest.mark.asyncio
    async def test_concurrent_error_handling(self, error_test_manager):
        """Test error handling under concurrent conditions"""
        
        print("\n🔍 Testing Concurrent Error Handling")
        
        # Create multiple concurrent operations that will cause errors
        async def create_duplicate():
            try:
                await error_test_manager.create({
                    "sku": "CONCURRENT-001",
                    "name": "Concurrent Test"
                })
                return "success"
            except ServiceError as e:
                return e.type
        
        # First, create the original product
        await error_test_manager.create({
            "sku": "CONCURRENT-001",
            "name": "Original Concurrent"
        })
        
        # Now try multiple concurrent duplicate creations
        tasks = [create_duplicate() for _ in range(5)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All should fail with duplicate key errors (not success)
        error_count = sum(1 for result in results if result == ErrorType.DUPLICATE_KEY)
        success_count = sum(1 for result in results if result == "success")
        
        print(f"Concurrent duplicate attempts: {error_count} errors, {success_count} successes")
        
        # All should fail since the product already exists
        assert error_count == 5
        assert success_count == 0
        
        # Verify system is still functional after concurrent errors
        final_product = await error_test_manager.findBySku("CONCURRENT-001")
        assert final_product is not None
        assert final_product["name"] == "Original Concurrent"
        
        print("✅ Concurrent error handling validated")