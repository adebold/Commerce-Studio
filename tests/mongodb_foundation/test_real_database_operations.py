"""
Real Database Operations Test
============================

This test validates that the MongoDB Foundation Service performs actual database operations
rather than relying on mock implementations. It addresses the "Mock-Heavy Implementation" 
critical issue identified in the reflection document.

Key validations:
1. Real MongoDB connection and operations
2. Actual CRUD operations with database persistence
3. Performance with real database operations (not hash-based mocks)
4. Data integrity and consistency validation
5. Real error handling from MongoDB operations
"""

import pytest
import pytest_asyncio
import asyncio
import time
from typing import Dict, Any, List
from unittest.mock import patch
import sys
import os
import jwt

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.services.mongodb_foundation import MongoDBFoundationService, DatabaseError, ValidationError, SecurityError
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, DuplicateKeyError


class TestRealDatabaseOperations:
    """Test real database operations to prove we're not using mocks in production"""
    
    @pytest_asyncio.fixture
    async def real_db_service(self):
        """Create a MongoDBFoundationService with real MongoDB connection"""
        connection_string = 'mongodb://localhost:27017'
        database_name = 'test_eyewear_db'
        jwt_secret = 'test_secret' # Dummy secret for testing security manager
        
        service = MongoDBFoundationService(connection_string, database_name, jwt_secret)
        
        # Verify we can actually connect to MongoDB
        try:
            await service.connect()
        except (ConnectionFailure, ServerSelectionTimeoutError):
            pytest.skip("MongoDB not available for real database testing")
        
        # Clean up test collections before each test
        await service.product_manager.collection.delete_many({})
        await service.brand_manager.collection.delete_many({})
        await service.category_manager.collection.delete_many({})
        
        yield service
        
        # Clean up after test
        await service.product_manager.collection.delete_many({})
        await service.brand_manager.collection.delete_many({})
        await service.category_manager.collection.delete_many({})
        await service.cleanup()

    @pytest.mark.asyncio
    async def test_real_create_operation(self, real_db_service):
        """Test that create operations actually persist to MongoDB"""
        
        product_data = {
            "sku": "REAL-TEST-001",
            "name": "Real Test Product",
            "brand_id": "brand_test_id",
            "category_id": "category_test_id",
            "price": 99.99,
            "description": "A real product for testing real database operations",
            "frame_size": {
                "lens_width": 52.0,
                "bridge_width": 18.0,
                "temple_length": 145.0
            },
            "face_shape_compatibility": {
                "oval": 0.95,
                "round": 0.9,
                "square": 0.8,
                "heart": 0.7,
                "diamond": 0.85
            }
        }
        
        # Create the product
        created_id = await real_db_service.product_manager.create(product_data)
        
        # Verify the product was actually created
        assert created_id is not None
        
        # Verify we can retrieve it directly from the database
        found_product = await real_db_service.product_manager.read(created_id)
        assert found_product is not None
        assert found_product["sku"] == "REAL-TEST-001"
        assert found_product["name"] == "Real Test Product"
        assert "_id" in found_product  # MongoDB should assign an _id
        
        # Verify performance metrics are updated
        metrics = await real_db_service.get_performance_metrics()
        assert metrics["total_operations"] >= 1
        assert metrics["average_query_time_ms"] > 0
        
        print(f"✅ Real database create operation completed. Total operations: {metrics['total_operations']}")

    @pytest.mark.asyncio
    async def test_real_update_operation(self, real_db_service):
        """Test that update operations actually modify data in MongoDB"""
        
        product_data = {
            "sku": "REAL-TEST-002",
            "name": "Original Name",
            "brand_id": "brand_test_id_2",
            "category_id": "category_test_id_2",
            "price": 50.00
        }
        
        created_id = await real_db_service.product_manager.create(product_data)
        
        update_data = {
            "name": "Updated Name",
            "price": 75.00,
            "description": "Updated description"
        }
        
        success = await real_db_service.product_manager.update(created_id, update_data)
        
        assert success is True
        
        retrieved_product = await real_db_service.product_manager.read(created_id)
        assert retrieved_product["name"] == "Updated Name"
        assert retrieved_product["price"] == 75.00
        assert retrieved_product["description"] == "Updated description"
        
        metrics = await real_db_service.get_performance_metrics()
        assert metrics["total_operations"] >= 1
        
        print(f"✅ Real database update operation completed. Total operations: {metrics['total_operations']}")

    @pytest.mark.asyncio
    async def test_real_delete_operation(self, real_db_service):
        """Test that delete operations actually remove data from MongoDB"""
        
        product_data = {
            "sku": "REAL-TEST-003",
            "name": "Product to Delete",
            "brand_id": "brand_test_id_3",
            "category_id": "category_test_id_3"
        }
        
        created_id = await real_db_service.product_manager.create(product_data)
        
        found_product = await real_db_service.product_manager.read(created_id)
        assert found_product is not None
        
        success = await real_db_service.product_manager.delete(created_id)
        
        assert success is True
        
        deleted_product = await real_db_service.product_manager.read(created_id)
        assert deleted_product is None
        
        metrics = await real_db_service.get_performance_metrics()
        assert metrics["total_operations"] >= 1
        
        print(f"✅ Real database delete operation completed. Total operations: {metrics['total_operations']}")

    @pytest.mark.asyncio
    async def test_real_query_operations(self, real_db_service):
        """Test that query operations actually search MongoDB"""
        
        products = [
            {
                "sku": f"REAL-QUERY-{i:03d}",
                "name": f"Query Test Product {i}",
                "brand_id": "query_brand_id",
                "category_id": "eyeglasses_cat_id" if i % 2 == 0 else "sunglasses_cat_id",
                "price": 50.0 + (i * 10),
                "description": f"Description for product {i}", # Added for text search
                "ai_description": f"AI generated description for product {i}", # Added for text search
                "face_shape_compatibility": {
                    "round": 0.8 + (i * 0.01),
                    "square": 0.7,
                    "oval": 0.9
                }
            }
            for i in range(5)
        ]
        
        await real_db_service.product_manager.bulk_insert(products)
        
        # Test filtering by category
        eyeglasses_result = await real_db_service.product_manager.list(filters={"category_id": "eyeglasses_cat_id"})
        
        assert len(eyeglasses_result) == 3
        for product in eyeglasses_result:
            assert product["category_id"] == "eyeglasses_cat_id"
        
        # Test search by name (using text index) with a unique phrase
        found_product_by_text = await real_db_service.product_manager.collection.find_one(
            {"$text": {"$search": "\"Query Test Product 1\""}} # Use phrase search
        )
        assert found_product_by_text is not None
        assert found_product_by_text["sku"] == "REAL-QUERY-001"
        
        metrics = await real_db_service.get_performance_metrics()
        assert metrics["total_operations"] >= 1
        
        print(f"✅ Real database query operations completed. Total operations: {metrics['total_operations']}")

    @pytest.mark.asyncio
    async def test_real_error_handling(self, real_db_service):
        """Test that error handling comes from real MongoDB operations"""
        
        product_data = {
            "sku": "REAL-ERROR-001",
            "name": "Error Test Product",
            "brand_id": "error_brand_id",
            "category_id": "error_category_id"
        }
        
        await real_db_service.product_manager.create(product_data)
        
        # Test duplicate key error with real database
        with pytest.raises(DatabaseError) as exc_info:
            await real_db_service.product_manager.create(product_data)
        
        assert "duplicate key" in str(exc_info.value).lower()
        
        # Test not found error for read
        with pytest.raises(DatabaseError):
            await real_db_service.product_manager.read("non_existent_id")
        
        # Test not found error for update
        with pytest.raises(DatabaseError):
            await real_db_service.product_manager.update("non_existent_id", {"name": "Updated"})
        
        # Test not found error for delete
        with pytest.raises(DatabaseError):
            await real_db_service.product_manager.delete("non_existent_id")
        
        print("✅ Real database error handling validated")

    @pytest.mark.asyncio
    async def test_performance_characteristics(self, real_db_service):
        """Test that performance characteristics match real database operations"""
        
        products = [
            {
                "sku": f"PERF-TEST-{i:04d}",
                "name": f"Performance Test Product {i}",
                "brand_id": "perf_brand_id",
                "category_id": "perf_category_id",
                "price": 100.0 + i
            }
            for i in range(100)
        ]
        
        # Measure bulk creation performance
        inserted_count = await real_db_service.product_manager.bulk_insert(products)
        assert inserted_count == 100
        
        metrics = await real_db_service.get_performance_metrics()
        assert metrics["total_operations"] >= 100 # Bulk insert counts as one operation for now, but individual ops are tracked
        assert metrics["average_query_time_ms"] > 0
        
        # Test query performance with larger dataset
        all_products = await real_db_service.product_manager.list(limit=100)
        assert len(all_products) == 100
        
        metrics_after_query = await real_db_service.get_performance_metrics()
        assert metrics_after_query["total_operations"] >= metrics["total_operations"] + 1
        
        print(f"✅ Real database performance characteristics validated.")
        print(f"   Total operations: {metrics_after_query['total_operations']}")
        print(f"   Average query time: {metrics_after_query['average_query_time_ms']:.2f} ms")
        print(f"   Operations per second: {metrics_after_query['operations_per_second']:.2f}")

    @pytest.mark.asyncio
    async def test_data_persistence_validation(self, real_db_service):
        """Test that data actually persists between operations"""
        
        product_data = {
            "sku": "PERSIST-TEST-001",
            "name": "Persistence Test",
            "brand_id": "persist_brand_id",
            "category_id": "persist_category_id",
            "metadata": {
                "test_field": "test_value",
                "nested": {
                    "deep_field": "deep_value"
                }
            }
        }
        
        created_id = await real_db_service.product_manager.create(product_data)
        
        # Retrieve the product multiple times to ensure consistency
        for i in range(3): # Reduced iterations for faster test
            retrieved_product = await real_db_service.product_manager.read(created_id)
            assert retrieved_product is not None
            assert str(retrieved_product["_id"]) == created_id
            assert retrieved_product["name"] == "Persistence Test"
            assert retrieved_product["metadata"]["test_field"] == "test_value"
            assert retrieved_product["metadata"]["nested"]["deep_field"] == "deep_value"
            
            # Small delay to ensure we're not hitting cache
            await asyncio.sleep(0.01)
        
        # Update the product
        await real_db_service.product_manager.update(created_id, {
            "name": "Updated Persistence Test",
            "metadata.test_field": "updated_value"
        })
        
        # Verify the update persisted
        updated_product = await real_db_service.product_manager.read(created_id)
        assert str(updated_product["_id"]) == created_id  # ID should remain the same
        assert updated_product["name"] == "Updated Persistence Test"
        assert updated_product["metadata"]["test_field"] == "updated_value"
        assert updated_product["metadata"]["nested"]["deep_field"] == "deep_value"  # Unchanged
        
        print("✅ Data persistence validation passed")

    @pytest.mark.asyncio
    async def test_security_input_validation(self, real_db_service):
        """Test that security manager's input validation works"""
        
        valid_data = {"name": "Safe Name", "description": "A safe description."}
        assert real_db_service.security_manager.validate_input(valid_data) is True
        
        invalid_string = "DROP TABLE users;"
        with pytest.raises(ValidationError):
            real_db_service.security_manager.validate_input(invalid_string)
            
        invalid_dict = {"name": "Valid", "description": "<script>alert('xss')</script>"}
        with pytest.raises(ValidationError):
            real_db_service.security_manager.validate_input(invalid_dict)
            
        print("✅ Security input validation tested")

    @pytest.mark.asyncio
    async def test_security_jwt_verification(self, real_db_service):
        """Test that security manager's JWT verification works"""
        
        # Valid JWT
        payload = {"sub": "testuser", "roles": ["user"]}
        token = jwt.encode(payload, real_db_service.security_manager.jwt_secret.encode('utf-8'), algorithm="HS256")
        
        decoded_payload = real_db_service.security_manager.verify_jwt(token)
        assert decoded_payload is not None
        assert decoded_payload["sub"] == "testuser"
        
        # Invalid JWT (wrong secret)
        invalid_token = jwt.encode(payload, "wrong_secret".encode('utf-8'), algorithm="HS256")
        with pytest.raises(SecurityError):
            real_db_service.security_manager.verify_jwt(invalid_token)
            
        # Expired JWT (for a real scenario, you'd set 'exp' claim)
        # For simplicity, we'll just test a malformed token for now
        malformed_token = "abc.def.ghi"
        with pytest.raises(SecurityError):
            real_db_service.security_manager.verify_jwt(malformed_token)
            
        print("✅ Security JWT verification tested")

    @pytest.mark.asyncio
    async def test_security_rbac(self, real_db_service):
        """Test that security manager's RBAC works"""
        
        # Admin user should have delete permission
        assert real_db_service.security_manager.check_permission(["admin"], "delete") is True
        
        # Regular user should not have delete permission
        with pytest.raises(SecurityError):
            real_db_service.security_manager.check_permission(["user"], "delete")
            
        # Guest user should only have read permission
        assert real_db_service.security_manager.check_permission(["guest"], "read") is True
        with pytest.raises(SecurityError):
            real_db_service.security_manager.check_permission(["guest"], "write")
            
        print("✅ Security RBAC tested")