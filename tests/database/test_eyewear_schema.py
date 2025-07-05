#!/usr/bin/env python3
"""
MongoDB Eyewear Schema Test Suite
Following TDD principles for MVP Phase 1 implementation
"""

import pytest
import asyncio
from datetime import datetime
from typing import Dict, List, Any
from bson import ObjectId
from unittest.mock import MagicMock, AsyncMock, patch

# Test dependencies
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

class TestEyewearProductSchema:
    """Test suite for eyewear product schema validation and operations"""
    
    @pytest.fixture
    def sample_eyewear_product(self) -> Dict[str, Any]:
        """Sample eyewear product data following MVP schema specification"""
        return {
            "sku": "RB-2140-901-52",
            "brand": "Ray-Ban",
            "model": "Original Wayfarer",
            "category": "Sunglasses",
            "frame_shape": "square",
            "face_shape_compatibility": ["oval", "round", "heart"],
            "measurements": {
                "lens_width": 52,
                "bridge_width": 18,
                "temple_length": 150,
                "frame_width": 145,
                "frame_height": 41
            },
            "materials": {
                "frame": "Acetate",
                "lens": "G-15 Glass",
                "coating": ["UV Protection", "Anti-Scratch"]
            },
            "colors": ["Black", "Tortoise", "Blue"],
            "images": {
                "primary": "https://cdn.example.com/rayban/rb2140/primary.jpg",
                "gallery": [
                    "https://cdn.example.com/rayban/rb2140/gallery1.jpg",
                    "https://cdn.example.com/rayban/rb2140/gallery2.jpg"
                ],
                "try_on": "https://cdn.example.com/rayban/rb2140/tryon.jpg"
            },
            "pricing": {
                "base_price": 154.00,
                "sale_price": 139.00,
                "currency": "USD"
            },
            "inventory": {
                "stock_level": 25,
                "availability": "in_stock"
            },
            "seo": {
                "title": "Ray-Ban Original Wayfarer Sunglasses - Classic Black Frame",
                "description": "Iconic Ray-Ban Wayfarer sunglasses with classic black frame and G-15 lenses",
                "keywords": ["ray-ban", "wayfarer", "sunglasses", "black", "classic"]
            },
            "metadata": {
                "source": "sku_genie",
                "quality_score": 95.5,
                "last_validated": datetime.utcnow()
            }
        }
    
    @pytest.fixture
    def invalid_eyewear_product(self) -> Dict[str, Any]:
        """Invalid product data for validation testing"""
        return {
            "sku": "",  # Invalid: empty SKU
            "brand": "Ray-Ban",
            "model": "Original Wayfarer",
            "category": "InvalidCategory",  # Invalid category
            "frame_shape": "invalid_shape",  # Invalid frame shape
            "face_shape_compatibility": ["invalid_face"],  # Invalid face shape
            "measurements": {
                "lens_width": -5,  # Invalid: negative measurement
                "bridge_width": 18,
                "temple_length": 150
                # Missing required measurements
            },
            "pricing": {
                "base_price": "invalid_price",  # Invalid: string instead of number
                "currency": "XXX"  # Invalid currency code
            }
        }
    
    def test_schema_validation_valid_product(self, sample_eyewear_product):
        """Test that valid eyewear product passes schema validation"""
        # Import the schema validator (will be implemented)
        try:
            from src.database.schemas.eyewear_product_schema import EyewearProductSchema
            
            schema = EyewearProductSchema()
            validation_result = schema.validate(sample_eyewear_product)
            
            assert validation_result.is_valid
            assert len(validation_result.errors) == 0
            assert validation_result.validated_data is not None
            
        except ImportError:
            pytest.skip("EyewearProductSchema not yet implemented")
    
    def test_schema_validation_invalid_product(self, invalid_eyewear_product):
        """Test that invalid eyewear product fails schema validation"""
        try:
            from src.database.schemas.eyewear_product_schema import EyewearProductSchema
            
            schema = EyewearProductSchema()
            validation_result = schema.validate(invalid_eyewear_product)
            
            assert not validation_result.is_valid
            assert len(validation_result.errors) > 0
            
            # Check specific validation errors
            error_fields = [error.field for error in validation_result.errors]
            assert "sku" in error_fields  # Empty SKU should fail
            assert "measurements.lens_width" in error_fields  # Negative value should fail
            assert "pricing.base_price" in error_fields  # Invalid type should fail
            
        except ImportError:
            pytest.skip("EyewearProductSchema not yet implemented")
    
    def test_face_shape_compatibility_validation(self):
        """Test face shape compatibility field validation"""
        try:
            from src.database.schemas.eyewear_product_schema import EyewearProductSchema
            
            schema = EyewearProductSchema()
            
            # Valid face shapes
            valid_faces = ["oval", "round", "square", "heart", "diamond", "oblong"]
            for face_shape in valid_faces:
                product_data = {"face_shape_compatibility": [face_shape]}
                result = schema.validate_field("face_shape_compatibility", product_data)
                assert result.is_valid, f"Valid face shape {face_shape} should pass validation"
            
            # Invalid face shapes
            invalid_faces = ["invalid", "circle", "triangle"]
            for face_shape in invalid_faces:
                product_data = {"face_shape_compatibility": [face_shape]}
                result = schema.validate_field("face_shape_compatibility", product_data)
                assert not result.is_valid, f"Invalid face shape {face_shape} should fail validation"
                
        except ImportError:
            pytest.skip("EyewearProductSchema not yet implemented")
    
    def test_measurements_validation(self):
        """Test measurements field validation with ranges"""
        try:
            from src.database.schemas.eyewear_product_schema import EyewearProductSchema
            
            schema = EyewearProductSchema()
            
            # Valid measurements
            valid_measurements = {
                "lens_width": 52,    # 40-70mm range
                "bridge_width": 18,  # 14-24mm range  
                "temple_length": 150, # 120-160mm range
                "frame_width": 145,   # 120-160mm range
                "frame_height": 41    # 30-60mm range
            }
            
            result = schema.validate_field("measurements", {"measurements": valid_measurements})
            assert result.is_valid
            
            # Invalid measurements (out of range)
            invalid_measurements = {
                "lens_width": 100,    # Too large
                "bridge_width": 5,    # Too small
                "temple_length": 200, # Too large
                "frame_width": 80,    # Too small
                "frame_height": 80    # Too large
            }
            
            result = schema.validate_field("measurements", {"measurements": invalid_measurements})
            assert not result.is_valid
            
        except ImportError:
            pytest.skip("EyewearProductSchema not yet implemented")


class TestEyewearProductCollection:
    """Test suite for eyewear product collection operations"""
    
    @pytest.fixture
    def mock_mongodb_client(self):
        """Mock MongoDB client for testing"""
        client = MagicMock()
        client.eyewear_db = MagicMock()
        client.eyewear_db.products = MagicMock()
        return client
    
    @pytest.fixture
    def sample_products(self) -> List[Dict[str, Any]]:
        """Sample product data for collection testing"""
        return [
            {
                "_id": ObjectId(),
                "sku": "RB-2140-901-52",
                "brand": "Ray-Ban",
                "frame_shape": "square",
                "face_shape_compatibility": ["oval", "round"],
                "pricing": {"base_price": 154.00, "currency": "USD"},
                "created_at": datetime.utcnow()
            },
            {
                "_id": ObjectId(),
                "sku": "OX-8081-01-56",
                "brand": "Oakley",
                "frame_shape": "round",
                "face_shape_compatibility": ["square", "heart"],
                "pricing": {"base_price": 189.00, "currency": "USD"},
                "created_at": datetime.utcnow()
            }
        ]
    
    @pytest.mark.asyncio
    async def test_insert_product(self, mock_mongodb_client, sample_products):
        """Test inserting a single eyewear product"""
        try:
            from src.database.collections.eyewear_products import EyewearProductCollection
            
            collection = EyewearProductCollection(mock_mongodb_client)
            product_data = sample_products[0]
            
            # Mock successful insertion
            mock_mongodb_client.eyewear_db.products.insert_one.return_value.inserted_id = product_data["_id"]
            
            result = await collection.insert_product(product_data)
            
            assert result.success
            assert result.product_id == str(product_data["_id"])
            mock_mongodb_client.eyewear_db.products.insert_one.assert_called_once()
            
        except ImportError:
            pytest.skip("EyewearProductCollection not yet implemented")
    
    @pytest.mark.asyncio
    async def test_bulk_insert_products(self, mock_mongodb_client, sample_products):
        """Test bulk insertion of multiple eyewear products"""
        try:
            from src.database.collections.eyewear_products import EyewearProductCollection
            
            collection = EyewearProductCollection(mock_mongodb_client)
            
            # Mock successful bulk insertion
            mock_result = MagicMock()
            mock_result.inserted_ids = [product["_id"] for product in sample_products]
            mock_mongodb_client.eyewear_db.products.insert_many.return_value = mock_result
            
            result = await collection.bulk_insert_products(sample_products)
            
            assert result.success
            assert result.inserted_count == len(sample_products)
            assert len(result.product_ids) == len(sample_products)
            mock_mongodb_client.eyewear_db.products.insert_many.assert_called_once()
            
        except ImportError:
            pytest.skip("EyewearProductCollection not yet implemented")
    
    @pytest.mark.asyncio
    async def test_find_by_face_shape_compatibility(self, mock_mongodb_client, sample_products):
        """Test finding products by face shape compatibility"""
        try:
            from src.database.collections.eyewear_products import EyewearProductCollection
            
            collection = EyewearProductCollection(mock_mongodb_client)
            
            # Mock query result
            mock_mongodb_client.eyewear_db.products.find.return_value.to_list.return_value = sample_products
            
            result = await collection.find_by_face_shape("oval")
            
            assert len(result) > 0
            # Verify query was called with correct filter
            expected_query = {"face_shape_compatibility": {"$in": ["oval"]}}
            mock_mongodb_client.eyewear_db.products.find.assert_called_with(expected_query)
            
        except ImportError:
            pytest.skip("EyewearProductCollection not yet implemented")
    
    @pytest.mark.asyncio
    async def test_find_by_price_range(self, mock_mongodb_client, sample_products):
        """Test finding products within a price range"""
        try:
            from src.database.collections.eyewear_products import EyewearProductCollection
            
            collection = EyewearProductCollection(mock_mongodb_client)
            
            # Mock query result
            mock_mongodb_client.eyewear_db.products.find.return_value.to_list.return_value = sample_products
            
            result = await collection.find_by_price_range(100.00, 200.00)
            
            assert len(result) > 0
            # Verify price range query
            expected_query = {
                "pricing.base_price": {"$gte": 100.00, "$lte": 200.00}
            }
            mock_mongodb_client.eyewear_db.products.find.assert_called_with(expected_query)
            
        except ImportError:
            pytest.skip("EyewearProductCollection not yet implemented")
    
    @pytest.mark.asyncio
    async def test_update_inventory(self, mock_mongodb_client):
        """Test updating product inventory levels"""
        try:
            from src.database.collections.eyewear_products import EyewearProductCollection
            
            collection = EyewearProductCollection(mock_mongodb_client)
            
            # Mock successful update
            mock_result = MagicMock()
            mock_result.modified_count = 1
            mock_mongodb_client.eyewear_db.products.update_one.return_value = mock_result
            
            result = await collection.update_inventory("RB-2140-901-52", 20, "in_stock")
            
            assert result.success
            assert result.modified_count == 1
            
            # Verify update query
            expected_filter = {"sku": "RB-2140-901-52"}
            expected_update = {
                "$set": {
                    "inventory.stock_level": 20,
                    "inventory.availability": "in_stock",
                    "updated_at": result.updated_at
                }
            }
            mock_mongodb_client.eyewear_db.products.update_one.assert_called_once()
            
        except ImportError:
            pytest.skip("EyewearProductCollection not yet implemented")


class TestProductCatalogAPI:
    """Test suite for product catalog API endpoints"""
    
    @pytest.fixture
    def mock_fastapi_app(self):
        """Mock FastAPI application for testing"""
        from fastapi.testclient import TestClient
        from fastapi import FastAPI
        
        app = FastAPI()
        return TestClient(app)
    
    def test_get_products_endpoint(self, mock_fastapi_app):
        """Test GET /api/products endpoint"""
        try:
            # Import the router (will be implemented)
            from src.api.routes.product_catalog import router
            
            response = mock_fastapi_app.get("/api/products")
            assert response.status_code == 200
            
            data = response.json()
            assert "products" in data
            assert "total_count" in data
            assert "page" in data
            
        except ImportError:
            pytest.skip("Product catalog router not yet implemented")
    
    def test_get_product_by_sku_endpoint(self, mock_fastapi_app):
        """Test GET /api/products/{sku} endpoint"""
        try:
            from src.api.routes.product_catalog import router
            
            response = mock_fastapi_app.get("/api/products/RB-2140-901-52")
            assert response.status_code in [200, 404]  # Product exists or not found
            
            if response.status_code == 200:
                data = response.json()
                assert "sku" in data
                assert data["sku"] == "RB-2140-901-52"
                
        except ImportError:
            pytest.skip("Product catalog router not yet implemented")
    
    def test_search_products_by_face_shape_endpoint(self, mock_fastapi_app):
        """Test GET /api/products/search endpoint with face_shape filter"""
        try:
            from src.api.routes.product_catalog import router
            
            response = mock_fastapi_app.get("/api/products/search?face_shape=oval")
            assert response.status_code == 200
            
            data = response.json()
            assert "products" in data
            assert "filters_applied" in data
            assert data["filters_applied"]["face_shape"] == "oval"
            
        except ImportError:
            pytest.skip("Product catalog router not yet implemented")


class TestDataQualityIntegration:
    """Test suite for SKU Genie → MongoDB integration"""
    
    @pytest.fixture
    def sample_sku_genie_output(self) -> Dict[str, Any]:
        """Sample output from SKU Genie system"""
        return {
            "product_data": {
                "sku": "TEST-SKU-001",
                "brand": "Test Brand",
                "model": "Test Model",
                "category": "Sunglasses",
                "raw_attributes": {
                    "Frame Material": "Acetate",
                    "Lens Material": "Polycarbonate",
                    "Frame Color": "Black",
                    "Lens Width": "52mm",
                    "Bridge Width": "18mm"
                }
            },
            "quality_metrics": {
                "completeness_score": 85.5,
                "accuracy_score": 92.0,
                "consistency_score": 88.5,
                "overall_score": 88.7
            },
            "data_enrichment": {
                "suggested_categories": ["Sunglasses", "Fashion"],
                "face_shape_analysis": ["oval", "round"],
                "price_range_estimate": {"min": 120.00, "max": 180.00}
            }
        }
    
    @pytest.mark.asyncio
    async def test_sku_genie_data_transformation(self, sample_sku_genie_output):
        """Test transformation of SKU Genie output to MongoDB schema"""
        try:
            from src.database.adapters.sku_genie_adapter import SKUGenieAdapter
            
            adapter = SKUGenieAdapter()
            mongodb_product = await adapter.transform_to_mongodb_schema(sample_sku_genie_output)
            
            # Verify required fields are present
            assert "sku" in mongodb_product
            assert "brand" in mongodb_product
            assert "model" in mongodb_product
            assert "measurements" in mongodb_product
            assert "metadata" in mongodb_product
            
            # Verify quality score is preserved
            assert mongodb_product["metadata"]["quality_score"] == 88.7
            assert mongodb_product["metadata"]["source"] == "sku_genie"
            
            # Verify measurements are properly extracted
            measurements = mongodb_product["measurements"]
            assert measurements["lens_width"] == 52
            assert measurements["bridge_width"] == 18
            
        except ImportError:
            pytest.skip("SKUGenieAdapter not yet implemented")
    
    @pytest.mark.asyncio
    async def test_data_quality_validation_pipeline(self, sample_sku_genie_output):
        """Test end-to-end data quality validation pipeline"""
        try:
            from src.database.pipelines.data_quality_pipeline import DataQualityPipeline
            
            pipeline = DataQualityPipeline()
            result = await pipeline.process_sku_genie_data(sample_sku_genie_output)
            
            assert result.success
            assert result.quality_passed
            assert result.mongodb_document is not None
            assert result.validation_errors == []
            
        except ImportError:
            pytest.skip("DataQualityPipeline not yet implemented")


class TestPerformanceRequirements:
    """Test suite for performance requirements from MVP plan"""
    
    @pytest.mark.asyncio
    async def test_bulk_insert_performance(self):
        """Test that bulk insertion meets performance requirements"""
        try:
            from src.database.collections.eyewear_products import EyewearProductCollection
            import time
            
            # Generate test data for 1000 products
            test_products = []
            for i in range(1000):
                product = {
                    "sku": f"TEST-SKU-{i:04d}",
                    "brand": "Test Brand",
                    "model": f"Test Model {i}",
                    "category": "Sunglasses",
                    "frame_shape": "square",
                    "face_shape_compatibility": ["oval"],
                    "pricing": {"base_price": 100.00 + i, "currency": "USD"},
                    "created_at": datetime.utcnow()
                }
                test_products.append(product)
            
            # Mock MongoDB client
            mock_client = MagicMock()
            collection = EyewearProductCollection(mock_client)
            
            # Mock successful bulk insertion
            mock_result = MagicMock()
            mock_result.inserted_ids = [ObjectId() for _ in range(1000)]
            mock_client.eyewear_db.products.insert_many.return_value = mock_result
            
            start_time = time.time()
            result = await collection.bulk_insert_products(test_products)
            end_time = time.time()
            
            # Performance requirement: bulk insertion should complete in <30 seconds
            processing_time = end_time - start_time
            assert processing_time < 30.0, f"Bulk insertion took {processing_time:.2f}s, should be <30s"
            
            assert result.success
            assert result.inserted_count == 1000
            
        except ImportError:
            pytest.skip("EyewearProductCollection not yet implemented")
    
    @pytest.mark.asyncio
    async def test_search_query_performance(self):
        """Test that search queries meet performance requirements"""
        try:
            from src.database.collections.eyewear_products import EyewearProductCollection
            import time
            
            mock_client = MagicMock()
            collection = EyewearProductCollection(mock_client)
            
            # Mock search results
            mock_products = [{"sku": f"TEST-{i}", "face_shape_compatibility": ["oval"]} for i in range(100)]
            mock_client.eyewear_db.products.find.return_value.to_list.return_value = mock_products
            
            start_time = time.time()
            result = await collection.find_by_face_shape("oval")
            end_time = time.time()
            
            # Performance requirement: search queries should complete in <2 seconds
            query_time = end_time - start_time
            assert query_time < 2.0, f"Search query took {query_time:.2f}s, should be <2s"
            
            assert len(result) > 0
            
        except ImportError:
            pytest.skip("EyewearProductCollection not yet implemented")


if __name__ == "__main__":
    # Run the test suite
    pytest.main([__file__, "-v", "--tb=short"])