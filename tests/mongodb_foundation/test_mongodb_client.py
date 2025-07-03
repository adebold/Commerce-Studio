"""
Unit tests for MongoDB Client
Tests the EyewearMongoDBClient implementation following TDD principles
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any

from src.database.mongodb_client import (
    EyewearMongoDBClient, 
    MongoDBConfig, 
    MongoDBContext,
    test_mongodb_connection,
    get_collection_stats
)
from .conftest import (
    validate_product_schema,
    validate_brand_schema,
    validate_category_schema,
    generate_test_product
)


class TestMongoDBConfig:
    """Test MongoDB configuration functionality."""
    
    def test_default_config_creation(self):
        """Test that default configuration is created correctly."""
        config = MongoDBConfig()
        
        assert config.database_name == "eyewear_ml"
        assert config.max_pool_size == 10
        assert config.min_pool_size == 1
        assert isinstance(config.connection_string, str)
        assert "mongodb://" in config.connection_string
    
    def test_config_from_environment(self, monkeypatch):
        """Test that configuration reads from environment variables."""
        # Set environment variables
        monkeypatch.setenv("MONGODB_DATABASE", "test_db")
        monkeypatch.setenv("MONGODB_MAX_POOL_SIZE", "20")
        monkeypatch.setenv("MONGODB_MIN_POOL_SIZE", "5")
        monkeypatch.setenv("MONGODB_USE_SSL", "true")
        
        config = MongoDBConfig()
        
        assert config.database_name == "test_db"
        assert config.max_pool_size == 20
        assert config.min_pool_size == 5
        assert config.use_ssl is True


class TestEyewearMongoDBClient:
    """Test EyewearMongoDBClient functionality."""
    
    @pytest.mark.asyncio
    async def test_client_initialization(self):
        """Test that client initializes correctly."""
        client = EyewearMongoDBClient()
        
        assert client.config is not None
        assert client.is_connected is False
        assert client._client is None
        assert client._database is None
    
    @pytest.mark.asyncio
    async def test_client_connection(self, test_mongodb_client):
        """Test MongoDB connection establishment."""
        client = test_mongodb_client
        
        assert client.is_connected is True
        assert client._client is not None
        assert client._database is not None
        assert client.database.name == "eyewear_ml_test"
    
    @pytest.mark.asyncio
    async def test_collection_properties(self, test_mongodb_client):
        """Test that collection properties return correct collections."""
        client = test_mongodb_client
        
        # Test collection property access
        products = client.products
        brands = client.brands
        categories = client.categories
        face_analysis = client.face_shape_analysis
        analytics = client.store_analytics
        ai_queue = client.ai_processing_queue
        
        assert products.name == "products"
        assert brands.name == "brands"
        assert categories.name == "categories"
        assert face_analysis.name == "face_shape_analysis"
        assert analytics.name == "store_analytics"
        assert ai_queue.name == "ai_processing_queue"
    
    @pytest.mark.asyncio
    async def test_collection_access_without_connection(self):
        """Test that accessing collections without connection raises error."""
        client = EyewearMongoDBClient()
        
        with pytest.raises(RuntimeError, match="Not connected to MongoDB"):
            _ = client.products
        
        with pytest.raises(RuntimeError, match="Not connected to MongoDB"):
            _ = client.brands
    
    @pytest.mark.asyncio
    async def test_health_check_healthy(self, test_mongodb_client):
        """Test health check with healthy connection."""
        client = test_mongodb_client
        
        health = await client.health_check()
        
        assert health["status"] == "healthy"
        assert "ping_time_ms" in health
        assert health["ping_time_ms"] > 0
        assert health["database"] == "eyewear_ml_test"
        assert "collections" in health
        assert "timestamp" in health
    
    @pytest.mark.asyncio
    async def test_health_check_unhealthy(self):
        """Test health check with unhealthy connection."""
        client = EyewearMongoDBClient()
        
        health = await client.health_check()
        
        assert health["status"] == "unhealthy"
        assert "error" in health
        assert health["error"] == "Not connected to MongoDB"
    
    @pytest.mark.asyncio
    async def test_database_initialization(self, test_mongodb_client):
        """Test database initialization creates required collections."""
        client = test_mongodb_client
        
        # Get collection names before and after initialization
        collections_before = await client.database.list_collection_names()
        result = await client.initialize_database()
        collections_after = await client.database.list_collection_names()
        
        assert result is True
        
        required_collections = [
            "products", "brands", "categories",
            "face_shape_analysis", "store_analytics", "ai_processing_queue"
        ]
        
        for collection_name in required_collections:
            assert collection_name in collections_after


class TestMongoDBOperations:
    """Test MongoDB CRUD operations."""
    
    @pytest.mark.asyncio
    async def test_insert_and_find_brand(self, test_mongodb_client, clean_mongodb):
        """Test inserting and finding a brand document."""
        client = test_mongodb_client
        
        # Test data
        brand_data = {
            "name": "Test Brand",
            "slug": "test-brand",
            "description": "Test brand description",
            "active": True,
            "created_at": datetime.utcnow()
        }
        
        # Insert brand
        result = await client.brands.insert_one(brand_data)
        assert result.inserted_id is not None
        
        # Find brand
        found_brand = await client.brands.find_one({"_id": result.inserted_id})
        assert found_brand is not None
        assert found_brand["name"] == "Test Brand"
        assert found_brand["slug"] == "test-brand"
        assert found_brand["active"] is True
        
        # Validate schema
        assert validate_brand_schema(found_brand)
    
    @pytest.mark.asyncio
    async def test_insert_and_find_category(self, test_mongodb_client, clean_mongodb):
        """Test inserting and finding a category document."""
        client = test_mongodb_client
        
        # Test data
        category_data = {
            "name": "Test Category",
            "slug": "test-category",
            "description": "Test category description",
            "level": 0,
            "parent_id": None,
            "active": True,
            "visible_in_nav": True,
            "sort_order": 1,
            "created_at": datetime.utcnow()
        }
        
        # Insert category
        result = await client.categories.insert_one(category_data)
        assert result.inserted_id is not None
        
        # Find category
        found_category = await client.categories.find_one({"_id": result.inserted_id})
        assert found_category is not None
        assert found_category["name"] == "Test Category"
        assert found_category["level"] == 0
        assert found_category["active"] is True
        
        # Validate schema
        assert validate_category_schema(found_category)
    
    @pytest.mark.asyncio
    async def test_insert_and_find_product(self, test_mongodb_client, sample_brands_data, sample_categories_data):
        """Test inserting and finding a product document."""
        client = test_mongodb_client
        brand = sample_brands_data[0]
        category = sample_categories_data[0]
        
        # Generate test product
        product_data = generate_test_product(brand["_id"], category["_id"], "TEST001")
        
        # Insert product
        result = await client.products.insert_one(product_data)
        assert result.inserted_id is not None
        
        # Find product
        found_product = await client.products.find_one({"_id": result.inserted_id})
        assert found_product is not None
        assert found_product["sku"] == "TEST-TEST001"
        assert found_product["brand_id"] == brand["_id"]
        assert found_product["category_id"] == category["_id"]
        assert found_product["active"] is True
        
        # Validate schema
        assert validate_product_schema(found_product)
    
    @pytest.mark.asyncio
    async def test_unique_constraint_violation(self, test_mongodb_client, clean_mongodb):
        """Test that unique constraints are enforced."""
        client = test_mongodb_client
        
        # Insert first brand
        brand_data = {
            "name": "Unique Test Brand",
            "slug": "unique-test-brand",
            "active": True,
            "created_at": datetime.utcnow()
        }
        
        result1 = await client.brands.insert_one(brand_data)
        assert result1.inserted_id is not None
        
        # Try to insert brand with same slug (should fail)
        with pytest.raises(Exception):  # Duplicate key error
            await client.brands.insert_one(brand_data)
    
    @pytest.mark.asyncio
    async def test_update_document(self, test_mongodb_client, sample_brands_data):
        """Test updating a document."""
        client = test_mongodb_client
        brand = sample_brands_data[0]
        
        # Update brand
        update_result = await client.brands.update_one(
            {"_id": brand["_id"]},
            {"$set": {"description": "Updated description", "updated_at": datetime.utcnow()}}
        )
        
        assert update_result.modified_count == 1
        
        # Verify update
        updated_brand = await client.brands.find_one({"_id": brand["_id"]})
        assert updated_brand["description"] == "Updated description"
    
    @pytest.mark.asyncio
    async def test_delete_document(self, test_mongodb_client, sample_brands_data):
        """Test deleting a document."""
        client = test_mongodb_client
        brand = sample_brands_data[0]
        
        # Delete brand
        delete_result = await client.brands.delete_one({"_id": brand["_id"]})
        assert delete_result.deleted_count == 1
        
        # Verify deletion
        deleted_brand = await client.brands.find_one({"_id": brand["_id"]})
        assert deleted_brand is None


class TestMongoDBQueries:
    """Test MongoDB query operations and indexes."""
    
    @pytest.mark.asyncio
    async def test_filter_products_by_brand(self, test_mongodb_client, sample_products_data):
        """Test filtering products by brand."""
        client = test_mongodb_client
        brand_id = sample_products_data[0]["brand_id"]
        
        # Query products by brand
        cursor = client.products.find({"brand_id": brand_id, "active": True})
        products = await cursor.to_list(length=100)
        
        assert len(products) > 0
        for product in products:
            assert product["brand_id"] == brand_id
            assert product["active"] is True
    
    @pytest.mark.asyncio
    async def test_filter_products_by_face_shape(self, test_mongodb_client, sample_products_data):
        """Test filtering products by face shape compatibility."""
        client = test_mongodb_client
        
        # Query products with high oval face compatibility
        cursor = client.products.find({
            "face_shape_compatibility.oval": {"$gte": 0.8},
            "active": True
        })
        products = await cursor.to_list(length=100)
        
        assert len(products) > 0
        for product in products:
            assert product["face_shape_compatibility"]["oval"] >= 0.8
            assert product["active"] is True
    
    @pytest.mark.asyncio
    async def test_text_search_products(self, test_mongodb_client, sample_products_data):
        """Test text search functionality."""
        client = test_mongodb_client
        
        # Search for "test" in product names and descriptions
        cursor = client.products.find({
            "$text": {"$search": "test"}
        })
        products = await cursor.to_list(length=100)
        
        assert len(products) > 0
        # Verify search terms appear in searchable fields
        for product in products:
            text_content = " ".join([
                product.get("name", "").lower(),
                product.get("description", "").lower(),
                product.get("ai_description", "").lower()
            ])
            assert "test" in text_content
    
    @pytest.mark.asyncio
    async def test_aggregation_pipeline(self, test_mongodb_client, sample_products_data):
        """Test MongoDB aggregation pipeline operations."""
        client = test_mongodb_client
        
        # Aggregation pipeline to get product statistics by brand
        pipeline = [
            {"$match": {"active": True}},
            {"$group": {
                "_id": "$brand_name",
                "product_count": {"$sum": 1},
                "avg_price": {"$avg": "$price"},
                "max_price": {"$max": "$price"},
                "min_price": {"$min": "$price"}
            }},
            {"$sort": {"product_count": -1}}
        ]
        
        cursor = client.products.aggregate(pipeline)
        results = await cursor.to_list(length=100)
        
        assert len(results) > 0
        for result in results:
            assert "_id" in result  # brand_name
            assert "product_count" in result
            assert "avg_price" in result
            assert result["product_count"] > 0
    
    @pytest.mark.asyncio
    async def test_sort_and_limit(self, test_mongodb_client, sample_products_data):
        """Test sorting and limiting query results."""
        client = test_mongodb_client
        
        # Get top 1 product by price
        cursor = client.products.find({"active": True}).sort("price", -1).limit(1)
        products = await cursor.to_list(length=1)
        
        assert len(products) == 1
        highest_price_product = products[0]
        
        # Verify it's actually the highest priced product
        all_cursor = client.products.find({"active": True})
        all_products = await all_cursor.to_list(length=100)
        
        max_price = max(product["price"] for product in all_products)
        assert highest_price_product["price"] == max_price


class TestMongoDBIndexes:
    """Test MongoDB index functionality."""
    
    @pytest.mark.asyncio
    async def test_index_existence(self, test_mongodb_client):
        """Test that required indexes exist."""
        client = test_mongodb_client
        
        # Check products collection indexes
        products_indexes = await client.products.list_indexes().to_list(length=100)
        index_names = [idx["name"] for idx in products_indexes]
        
        required_indexes = [
            "idx_products_sku",
            "idx_products_brand_active",
            "idx_products_category_active",
            "idx_products_text_search"
        ]
        
        for required_index in required_indexes:
            assert required_index in index_names
    
    @pytest.mark.asyncio
    async def test_unique_index_enforcement(self, test_mongodb_client, clean_mongodb):
        """Test that unique indexes prevent duplicate inserts."""
        client = test_mongodb_client
        
        # Insert product with unique SKU
        product1 = generate_test_product(None, None, "UNIQUE001")
        result1 = await client.products.insert_one(product1)
        assert result1.inserted_id is not None
        
        # Try to insert another product with same SKU
        product2 = generate_test_product(None, None, "UNIQUE001")
        
        with pytest.raises(Exception):  # Duplicate key error
            await client.products.insert_one(product2)


class TestMongoDBContext:
    """Test MongoDB context manager."""
    
    @pytest.mark.asyncio
    async def test_context_manager(self):
        """Test MongoDB context manager functionality."""
        async with MongoDBContext() as client:
            assert isinstance(client, EyewearMongoDBClient)
            assert client.is_connected is True
    
    @pytest.mark.asyncio
    async def test_context_manager_operations(self, clean_mongodb):
        """Test performing operations within context manager."""
        brand_data = {
            "name": "Context Test Brand",
            "slug": "context-test-brand",
            "active": True,
            "created_at": datetime.utcnow()
        }
        
        # Use context manager for operations
        async with MongoDBContext() as client:
            # Insert brand
            result = await client.brands.insert_one(brand_data)
            assert result.inserted_id is not None
            
            # Find brand
            found_brand = await client.brands.find_one({"_id": result.inserted_id})
            assert found_brand is not None
            assert found_brand["name"] == "Context Test Brand"


class TestUtilityFunctions:
    """Test utility functions."""
    
    @pytest.mark.asyncio
    async def test_connection_test(self):
        """Test MongoDB connection test function."""
        result = await test_mongodb_connection()
        assert isinstance(result, bool)
        # Result depends on MongoDB availability
    
    @pytest.mark.asyncio
    async def test_collection_stats(self, test_mongodb_client, sample_products_data):
        """Test getting collection statistics."""
        stats = await get_collection_stats()
        
        assert isinstance(stats, dict)
        assert "products" in stats
        assert "brands" in stats
        assert "categories" in stats
        
        # Check that products collection has data
        if stats["products"]:
            assert "count" in stats["products"]
            assert stats["products"]["count"] > 0


class TestErrorHandling:
    """Test error handling scenarios."""
    
    @pytest.mark.asyncio
    async def test_invalid_connection_string(self):
        """Test handling of invalid connection string."""
        from src.database.mongodb_client import MongoDBConfig
        
        # Create config with invalid connection string
        config = MongoDBConfig()
        config.connection_string = "mongodb://invalid-host:27017"
        config.server_selection_timeout_ms = 1000  # Short timeout
        
        client = EyewearMongoDBClient(config)
        
        # Connection should fail
        connected = await client.connect()
        assert connected is False
        assert client.is_connected is False
    
    @pytest.mark.asyncio
    async def test_operations_without_connection(self):
        """Test that operations fail gracefully without connection."""
        client = EyewearMongoDBClient()
        
        # Health check should return unhealthy status
        health = await client.health_check()
        assert health["status"] == "unhealthy"
        
        # Database initialization should fail
        result = await client.initialize_database()
        assert result is False
    
    @pytest.mark.asyncio
    async def test_invalid_document_insertion(self, test_mongodb_client, clean_mongodb):
        """Test handling of invalid document insertion."""
        client = test_mongodb_client
        
        # Try to insert document that violates schema validation
        invalid_product = {
            "sku": "INVALID",
            # Missing required fields
            "price": "invalid_price_type",  # Should be number
            "active": "not_boolean"  # Should be boolean
        }
        
        with pytest.raises(Exception):
            await client.products.insert_one(invalid_product)


class TestPerformance:
    """Test performance characteristics."""
    
    @pytest.mark.asyncio
    async def test_bulk_insert_performance(self, test_mongodb_client, clean_mongodb, performance_test_config):
        """Test bulk insert performance."""
        client = test_mongodb_client
        bulk_size = performance_test_config["bulk_insert_size"]
        
        # Generate test products
        products = []
        for i in range(bulk_size):
            product = generate_test_product(None, None, f"BULK{i:03d}")
            products.append(product)
        
        # Measure bulk insert time
        start_time = datetime.utcnow()
        result = await client.products.insert_many(products)
        end_time = datetime.utcnow()
        
        duration_ms = (end_time - start_time).total_seconds() * 1000
        
        # Assertions
        assert len(result.inserted_ids) == bulk_size
        assert duration_ms < performance_test_config["max_response_time_ms"]
        
        # Calculate throughput
        throughput = bulk_size / (duration_ms / 1000)  # Operations per second
        assert throughput > performance_test_config["min_throughput_qps"]
    
    @pytest.mark.asyncio
    async def test_query_performance(self, test_mongodb_client, sample_products_data, performance_test_config):
        """Test query performance with indexes."""
        client = test_mongodb_client
        iterations = performance_test_config["query_iterations"]
        
        # Measure query performance
        start_time = datetime.utcnow()
        
        for _ in range(iterations):
            # Test indexed query (should be fast)
            cursor = client.products.find({"active": True}).limit(10)
            products = await cursor.to_list(length=10)
            assert len(products) > 0
        
        end_time = datetime.utcnow()
        duration_ms = (end_time - start_time).total_seconds() * 1000
        
        # Average query time should be reasonable
        avg_query_time = duration_ms / iterations
        assert avg_query_time < 100  # Less than 100ms per query