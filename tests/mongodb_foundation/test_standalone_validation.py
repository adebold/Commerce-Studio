"""
Standalone validation tests for MongoDB Foundation
TDD validation that can run independently of existing project dependencies
"""

import pytest
import asyncio
import os
from datetime import datetime
from typing import Dict, Any
import sys

# Add project root to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    MOTOR_AVAILABLE = True
except ImportError:
    MOTOR_AVAILABLE = False

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


@pytest.mark.skipif(not MOTOR_AVAILABLE, reason="Motor MongoDB driver not available")
class TestMongoDBFoundationStandalone:
    """Standalone tests for MongoDB Foundation that don't depend on existing project code."""
    
    @pytest.fixture(scope="class")
    async def test_client(self):
        """Create test MongoDB client."""
        connection_string = os.getenv("TEST_MONGODB_URL", "mongodb://localhost:27017")
        database_name = "eyewear_ml_test_standalone"
        
        client = AsyncIOMotorClient(connection_string)
        
        try:
            # Test connection
            await client.admin.command('ping')
            database = client[database_name]
            yield database
        except Exception:
            pytest.skip("MongoDB not available for testing")
        finally:
            # Cleanup
            await client.drop_database(database_name)
            client.close()
    
    @pytest.mark.asyncio
    async def test_mongodb_connection_validation(self, test_client):
        """Test that MongoDB connection works."""
        # Simple ping test
        result = await test_client.command("ping")
        assert result["ok"] == 1
    
    @pytest.mark.asyncio
    async def test_eyewear_collections_creation(self, test_client):
        """Test creating eyewear-specific collections."""
        collections = ["products", "brands", "categories", "face_shape_analysis"]
        
        for collection_name in collections:
            collection = test_client[collection_name]
            
            # Insert test document
            test_doc = {
                "name": f"test_{collection_name}",
                "created_at": datetime.utcnow(),
                "test_field": True
            }
            
            result = await collection.insert_one(test_doc)
            assert result.inserted_id is not None
            
            # Verify document exists
            found_doc = await collection.find_one({"_id": result.inserted_id})
            assert found_doc is not None
            assert found_doc["name"] == f"test_{collection_name}"
    
    @pytest.mark.asyncio
    async def test_product_schema_validation(self, test_client):
        """Test product document schema validation."""
        products = test_client["products"]
        
        # Valid product document
        valid_product = {
            "sku": "TEST-001",
            "product_id": "test-product-001",
            "name": "Test Frame",
            "description": "Test eyewear frame",
            "brand_id": "test-brand-id",
            "brand_name": "Test Brand",
            "category_id": "test-category-id", 
            "category_name": "Test Category",
            "frame_type": "prescription",
            "frame_shape": "rectangular",
            "frame_material": "acetate",
            "price": 99.99,
            "currency": "USD",
            "inventory_quantity": 10,
            "in_stock": True,
            "face_shape_compatibility": {
                "oval": 0.85,
                "round": 0.75,
                "square": 0.90,
                "heart": 0.80,
                "diamond": 0.75,
                "oblong": 0.88
            },
            "quality_score": 0.90,
            "active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert valid product
        result = await products.insert_one(valid_product)
        assert result.inserted_id is not None
        
        # Verify product can be queried
        found_product = await products.find_one({"sku": "TEST-001"})
        assert found_product is not None
        assert found_product["price"] == 99.99
        assert found_product["active"] is True
        
        # Test face shape compatibility queries
        oval_compatible = await products.find_one({
            "face_shape_compatibility.oval": {"$gte": 0.8}
        })
        assert oval_compatible is not None
        assert oval_compatible["sku"] == "TEST-001"
    
    @pytest.mark.asyncio
    async def test_face_shape_analysis_workflow(self, test_client):
        """Test face shape analysis data workflow."""
        face_analysis = test_client["face_shape_analysis"]
        
        # Test analysis document
        analysis_doc = {
            "session_id": "test-session-123",
            "user_id": "test-user-456",
            "detected_face_shape": {
                "primary": "oval",
                "confidence": 0.88,
                "secondary": "round",
                "secondary_confidence": 0.72
            },
            "measurements": {
                "face_width": 120.0,
                "face_height": 140.0,
                "forehead_width": 110.0,
                "cheekbone_width": 115.0,
                "jawline_width": 105.0,
                "width_height_ratio": 0.857
            },
            "ai_model_version": "face_shape_v1.0",
            "processing_time_ms": 2500.0,
            "created_at": datetime.utcnow()
        }
        
        # Insert analysis
        result = await face_analysis.insert_one(analysis_doc)
        assert result.inserted_id is not None
        
        # Query by session
        session_analysis = await face_analysis.find_one({"session_id": "test-session-123"})
        assert session_analysis is not None
        assert session_analysis["detected_face_shape"]["primary"] == "oval"
        assert session_analysis["detected_face_shape"]["confidence"] == 0.88
        
        # Query by user
        user_analyses = []
        async for doc in face_analysis.find({"user_id": "test-user-456"}):
            user_analyses.append(doc)
        
        assert len(user_analyses) == 1
        assert user_analyses[0]["ai_model_version"] == "face_shape_v1.0"
    
    @pytest.mark.asyncio
    async def test_brand_category_relationships(self, test_client):
        """Test brand and category relationship functionality."""
        brands = test_client["brands"]
        categories = test_client["categories"]
        products = test_client["products"]
        
        # Insert test brand
        brand_doc = {
            "name": "Test Brand A",
            "slug": "test-brand-a",
            "description": "Test brand for validation",
            "active": True,
            "featured": True,
            "created_at": datetime.utcnow()
        }
        brand_result = await brands.insert_one(brand_doc)
        brand_id = brand_result.inserted_id
        
        # Insert test category
        category_doc = {
            "name": "Test Category",
            "slug": "test-category",
            "description": "Test category for validation",
            "level": 0,
            "parent_id": None,
            "active": True,
            "created_at": datetime.utcnow()
        }
        category_result = await categories.insert_one(category_doc)
        category_id = category_result.inserted_id
        
        # Insert product with references
        product_doc = {
            "sku": "REL-001",
            "name": "Relationship Test Frame",
            "brand_id": brand_id,
            "brand_name": "Test Brand A",
            "category_id": category_id,
            "category_name": "Test Category",
            "price": 149.99,
            "active": True,
            "created_at": datetime.utcnow()
        }
        product_result = await products.insert_one(product_doc)
        
        # Test aggregation pipeline to join data
        pipeline = [
            {"$match": {"sku": "REL-001"}},
            {
                "$lookup": {
                    "from": "brands",
                    "localField": "brand_id",
                    "foreignField": "_id",
                    "as": "brand_details"
                }
            },
            {
                "$lookup": {
                    "from": "categories", 
                    "localField": "category_id",
                    "foreignField": "_id",
                    "as": "category_details"
                }
            }
        ]
        
        async for enriched_product in products.aggregate(pipeline):
            assert len(enriched_product["brand_details"]) == 1
            assert len(enriched_product["category_details"]) == 1
            assert enriched_product["brand_details"][0]["name"] == "Test Brand A"
            assert enriched_product["category_details"][0]["name"] == "Test Category"
    
    @pytest.mark.asyncio
    async def test_compatibility_scoring_queries(self, test_client):
        """Test face shape compatibility scoring queries."""
        products = test_client["products"]
        
        # Insert products with different compatibility scores
        test_products = [
            {
                "sku": "COMPAT-OVAL-HIGH",
                "name": "High Oval Compatibility",
                "frame_shape": "aviator",
                "face_shape_compatibility": {"oval": 0.95, "round": 0.70},
                "price": 199.99,
                "active": True
            },
            {
                "sku": "COMPAT-OVAL-LOW",
                "name": "Low Oval Compatibility", 
                "frame_shape": "rectangular",
                "face_shape_compatibility": {"oval": 0.60, "round": 0.85},
                "price": 129.99,
                "active": True
            },
            {
                "sku": "COMPAT-ROUND-HIGH",
                "name": "High Round Compatibility",
                "frame_shape": "square",
                "face_shape_compatibility": {"oval": 0.75, "round": 0.92},
                "price": 179.99,
                "active": True
            }
        ]
        
        await products.insert_many(test_products)
        
        # Test high oval compatibility query
        high_oval_cursor = products.find({
            "face_shape_compatibility.oval": {"$gte": 0.9},
            "active": True
        }).sort("face_shape_compatibility.oval", -1)
        
        high_oval_products = await high_oval_cursor.to_list(length=10)
        assert len(high_oval_products) == 1
        assert high_oval_products[0]["sku"] == "COMPAT-OVAL-HIGH"
        
        # Test aggregation for top compatible products
        compatibility_pipeline = [
            {"$match": {"active": True}},
            {"$addFields": {"oval_score": "$face_shape_compatibility.oval"}},
            {"$sort": {"oval_score": -1}},
            {"$limit": 2}
        ]
        
        top_compatible = []
        async for product in products.aggregate(compatibility_pipeline):
            top_compatible.append(product)
        
        assert len(top_compatible) == 2
        assert top_compatible[0]["sku"] == "COMPAT-OVAL-HIGH"
        assert top_compatible[0]["oval_score"] == 0.95
    
    @pytest.mark.asyncio 
    async def test_performance_indexing(self, test_client):
        """Test performance with proper indexing."""
        products = test_client["products"]
        
        # Create indexes that would be needed for eyewear queries
        await products.create_index("sku", unique=True)
        await products.create_index([("active", 1), ("in_stock", 1)])
        await products.create_index([("brand_id", 1), ("active", 1)])
        await products.create_index([("category_id", 1), ("active", 1)])
        await products.create_index("face_shape_compatibility.oval")
        await products.create_index("face_shape_compatibility.round")
        
        # Insert test data for performance testing
        bulk_products = []
        for i in range(100):
            bulk_products.append({
                "sku": f"PERF-{i:03d}",
                "name": f"Performance Test Frame {i}",
                "brand_id": f"brand-{i % 10}",  # 10 different brands
                "category_id": f"category-{i % 5}",  # 5 different categories
                "price": 100.0 + (i * 5),
                "active": True,
                "in_stock": i % 20 != 0,  # 95% in stock
                "face_shape_compatibility": {
                    "oval": 0.5 + (i % 50) / 100,  # Scores from 0.5 to 0.99
                    "round": 0.4 + (i % 60) / 100
                },
                "created_at": datetime.utcnow()
            })
        
        await products.insert_many(bulk_products)
        
        # Test indexed query performance
        start_time = datetime.utcnow()
        
        # Query that should use indexes
        cursor = products.find({
            "active": True,
            "in_stock": True,
            "face_shape_compatibility.oval": {"$gte": 0.8}
        }).sort("price", 1).limit(10)
        
        results = await cursor.to_list(length=10)
        end_time = datetime.utcnow()
        
        query_time_ms = (end_time - start_time).total_seconds() * 1000
        
        # Query should complete quickly with indexes
        assert query_time_ms < 1000  # Less than 1 second
        assert len(results) > 0
        
        # Verify results are properly sorted and filtered
        for product in results:
            assert product["active"] is True
            assert product["in_stock"] is True
            assert product["face_shape_compatibility"]["oval"] >= 0.8


@pytest.mark.skipif(not PIL_AVAILABLE, reason="PIL not available")
class TestImageProcessingValidation:
    """Test image processing capabilities for face shape analysis."""
    
    def test_basic_image_creation(self):
        """Test that we can create and process images for face analysis."""
        import io
        
        # Create test image
        img = Image.new('RGB', (100, 100), color=(128, 128, 128))
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        # Verify image data
        image_data = img_bytes.getvalue()
        assert len(image_data) > 0
        
        # Verify we can load it back
        loaded_img = Image.open(io.BytesIO(image_data))
        assert loaded_img.size == (100, 100)
        assert loaded_img.mode == 'RGB'
    
    def test_image_resizing_simulation(self):
        """Test image resizing logic for face analysis."""
        # Create large image
        large_img = Image.new('RGB', (1024, 768), color=(200, 150, 100))
        
        # Simulate resizing logic
        max_size = 512
        if max(large_img.size) > max_size:
            ratio = max_size / max(large_img.size)
            new_size = tuple(int(dim * ratio) for dim in large_img.size)
            resized_img = large_img.resize(new_size, Image.Resampling.LANCZOS)
        else:
            resized_img = large_img
        
        # Verify resize worked correctly
        assert max(resized_img.size) <= max_size
        assert resized_img.size[0] == 512  # Width should be 512
        assert resized_img.size[1] == 384  # Height should be 384 (maintaining ratio)


class TestCompatibilityMatrixValidation:
    """Test face shape compatibility matrix logic."""
    
    def test_compatibility_matrix_structure(self):
        """Test the compatibility matrix has proper structure."""
        # This mirrors the structure from our face shape analyzer
        compatibility_matrix = {
            "oval": {
                "round": 0.95, "square": 0.90, "aviator": 0.92, 
                "cat_eye": 0.88, "rectangular": 0.85, "wayfarer": 0.90
            },
            "round": {
                "square": 0.95, "rectangular": 0.92, "cat_eye": 0.90,
                "aviator": 0.85, "wayfarer": 0.88, "round": 0.70
            },
            "square": {
                "round": 0.95, "aviator": 0.92, "cat_eye": 0.90,
                "oval": 0.88, "wayfarer": 0.85, "rectangular": 0.75
            },
            "heart": {
                "aviator": 0.95, "cat_eye": 0.90, "round": 0.88,
                "wayfarer": 0.85, "rectangular": 0.82, "square": 0.75
            },
            "diamond": {
                "cat_eye": 0.95, "oval": 0.90, "round": 0.88,
                "aviator": 0.85, "rectangular": 0.80, "square": 0.75
            },
            "oblong": {
                "round": 0.95, "aviator": 0.90, "wayfarer": 0.88,
                "cat_eye": 0.85, "square": 0.80, "rectangular": 0.75
            }
        }
        
        # Validate structure
        expected_face_shapes = {"oval", "round", "square", "heart", "diamond", "oblong"}
        expected_frame_shapes = {"round", "square", "aviator", "cat_eye", "rectangular", "wayfarer", "oval"}
        
        assert set(compatibility_matrix.keys()) == expected_face_shapes
        
        for face_shape, frame_scores in compatibility_matrix.items():
            assert isinstance(frame_scores, dict)
            
            for frame_shape, score in frame_scores.items():
                assert frame_shape in expected_frame_shapes
                assert isinstance(score, float)
                assert 0.0 <= score <= 1.0
    
    def test_compatibility_reasoning(self):
        """Test compatibility score reasoning logic."""
        def generate_compatibility_reason(face_shape: str, frame_shape: str, score: float) -> str:
            if score >= 0.9:
                return f"Excellent match! {frame_shape.title()} frames perfectly complement {face_shape} face shapes."
            elif score >= 0.8:
                return f"Great choice! {frame_shape.title()} frames work very well with {face_shape} face shapes."
            elif score >= 0.7:
                return f"Good fit! {frame_shape.title()} frames are suitable for {face_shape} face shapes."
            else:
                return f"{frame_shape.title()} frames can work with {face_shape} face shapes."
        
        # Test different score ranges
        excellent_reason = generate_compatibility_reason("oval", "aviator", 0.92)
        assert "Excellent match" in excellent_reason
        assert "aviator" in excellent_reason.lower()
        
        great_reason = generate_compatibility_reason("round", "square", 0.85)
        assert "Great choice" in great_reason
        
        good_reason = generate_compatibility_reason("square", "round", 0.75)
        assert "Good fit" in good_reason
        
        basic_reason = generate_compatibility_reason("heart", "rectangular", 0.65)
        assert "can work with" in basic_reason


if __name__ == "__main__":
    # Run tests if executed directly
    pytest.main([__file__, "-v"])