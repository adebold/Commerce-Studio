"""
MongoDB Migration Validation Tests

Tests for SKU Genie data transformation, PostgreSQL to MongoDB migration validation,
data quality preservation, and ML compatibility score accuracy.
"""
import pytest
import asyncio
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from bson import ObjectId
from typing import Dict, Any, List
import json


class TestSKUGenieDataTransformation:
    """Test suite for SKU Genie data transformation validation."""
    
    @pytest.fixture
    def sample_sku_genie_product(self):
        """Sample SKU Genie product data structure."""
        return {
            "id": 12345,
            "full_name": "Ray-Ban Aviator Classic RB3025 Gold Frame Green Lens",
            "sku": "RB3025-001/58-58",
            "upc": "8053672125714",
            "price": Decimal("199.99"),
            "brand": "Ray-Ban",
            "frame_material": "Metal",
            "frame_color": "Gold",
            "frame_shape": "Aviator",
            "frame_style": "Full-rim",
            "frame_width": "140",
            "lens_material": "Glass",
            "lens_color": "Green",
            "lens_width": "58",
            "bridge_width": "14",
            "arm_length": "135",
            "gender": "Unisex",
            "data_quality_score": 0.92,
            "created_at": datetime(2024, 1, 15, 10, 30, 0),
            "updated_at": datetime(2024, 5, 20, 14, 45, 0),
            "description": "Classic aviator sunglasses with gold frame and green lenses",
            "image_urls": [
                "https://example.com/images/rb3025-001-front.jpg",
                "https://example.com/images/rb3025-001-side.jpg"
            ]
        }
    
    def test_sku_genie_to_mongodb_transformation(self, sample_sku_genie_product):
        """Test transformation of SKU Genie data to MongoDB format."""
        
        def transform_sku_genie_to_mongodb(sku_genie_data: Dict[str, Any]) -> Dict[str, Any]:
            """Transform SKU Genie product to MongoDB document."""
            
            # Parse measurements from strings to numbers
            def parse_measurement(value):
                try:
                    return float(value) if value else None
                except (ValueError, TypeError):
                    return None
            
            # Generate MongoDB document
            mongodb_doc = {
                "product_id": str(uuid.uuid4()),
                "name": sku_genie_data["full_name"],
                "sku": sku_genie_data["sku"],
                "upc": sku_genie_data["upc"],
                "description": sku_genie_data.get("description", ""),
                "short_description": sku_genie_data["full_name"][:100] + "..." if len(sku_genie_data["full_name"]) > 100 else sku_genie_data["full_name"],
                
                # Price information
                "price": {
                    "base_price": float(sku_genie_data["price"]),
                    "currency": "USD"
                },
                
                # Inventory placeholder (would be populated from inventory system)
                "inventory": {
                    "quantity": 0,
                    "status": "active"
                },
                
                # Specifications
                "specifications": {
                    "frame": {
                        "material": sku_genie_data.get("frame_material", "").lower(),
                        "color": sku_genie_data.get("frame_color", "").lower(),
                        "shape": sku_genie_data.get("frame_shape", "").lower(),
                        "style": sku_genie_data.get("frame_style", "").lower().replace("-", "_"),
                        "width": parse_measurement(sku_genie_data.get("frame_width"))
                    },
                    "lens": {
                        "material": sku_genie_data.get("lens_material", "").lower(),
                        "color": sku_genie_data.get("lens_color", "").lower(),
                        "width": parse_measurement(sku_genie_data.get("lens_width"))
                    },
                    "measurements": {
                        "bridge_size": parse_measurement(sku_genie_data.get("bridge_width")),
                        "temple_length": parse_measurement(sku_genie_data.get("arm_length")),
                        "eye_size": parse_measurement(sku_genie_data.get("lens_width")),
                        "frame_width": parse_measurement(sku_genie_data.get("frame_width"))
                    }
                },
                
                # Attributes
                "attributes": {
                    "gender": sku_genie_data.get("gender", "").lower(),
                    "prescription_compatible": True  # Default assumption
                },
                
                # Media
                "media": {
                    "images": [
                        {
                            "url": url,
                            "alt_text": sku_genie_data["full_name"],
                            "type": "product" if i == 0 else "angle",
                            "order": i
                        }
                        for i, url in enumerate(sku_genie_data.get("image_urls", []))
                    ]
                },
                
                # Quality information
                "quality": {
                    "data_quality_score": sku_genie_data.get("data_quality_score", 0.0),
                    "completeness_score": 0.0,  # Would be calculated
                    "last_quality_check": sku_genie_data.get("updated_at", datetime.utcnow())
                },
                
                # Integration tracking
                "integration": {
                    "source_system": "sku_genie",
                    "source_id": str(sku_genie_data["id"]),
                    "sync_status": "migrated",
                    "last_sync": datetime.utcnow()
                },
                
                # Metadata
                "metadata": {
                    "created_at": sku_genie_data.get("created_at", datetime.utcnow()),
                    "updated_at": sku_genie_data.get("updated_at", datetime.utcnow()),
                    "status": "active",
                    "version": 1
                }
            }
            
            return mongodb_doc
        
        # Transform the data
        result = transform_sku_genie_to_mongodb(sample_sku_genie_product)
        
        # Validate transformation
    
    @pytest.mark.asyncio
    async def test_batch_transformation_validation(self, products_collection):
        """Test batch transformation of multiple SKU Genie products."""
        
        # Sample batch of SKU Genie products
        sku_genie_batch = [
            {
                "id": i,
                "full_name": f"Test Product {i}",
                "sku": f"TEST-{i:04d}",
                "price": Decimal(f"{100 + i}.99"),
                "brand": "Test Brand",
                "frame_material": "Acetate",
                "frame_color": "Black",
                "frame_shape": "Round",
                "gender": "Unisex",
                "data_quality_score": 0.8 + (i * 0.01),
                "created_at": datetime.utcnow() - timedelta(days=i),
                "updated_at": datetime.utcnow()
            }
            for i in range(1, 11)  # 10 products
        ]
        
        # Transform batch
        transformed_products = []
        for sku_product in sku_genie_batch:
            # Simplified transformation for testing
            mongodb_doc = {
                "product_id": f"transformed-{sku_product['id']}",
                "name": sku_product["full_name"],
                "sku": sku_product["sku"],
                "brand_id": ObjectId(),  # Would be resolved from brand lookup
                "price": {"base_price": float(sku_product["price"]), "currency": "USD"},
                "quality": {"data_quality_score": sku_product["data_quality_score"]},
                "integration": {
                    "source_system": "sku_genie",
                    "source_id": str(sku_product["id"])
                },
                "metadata": {
                    "created_at": sku_product["created_at"],
                    "updated_at": sku_product["updated_at"],
                    "status": "active"
                }
            }
            transformed_products.append(mongodb_doc)
        
        # Insert batch
        result = await products_collection.insert_many(transformed_products)
        assert len(result.inserted_ids) == 10
        
        # Validate batch transformation
        for i, doc_id in enumerate(result.inserted_ids, 1):
            product = await products_collection.find_one({"_id": doc_id})
            assert product["name"] == f"Test Product {i}"
            assert product["sku"] == f"TEST-{i:04d}"
            assert product["integration"]["source_id"] == str(i)
            assert product["quality"]["data_quality_score"] == 0.8 + (i * 0.01)


class TestPostgreSQLToMongoDBMigration:
    """Test suite for PostgreSQL to MongoDB migration validation."""
    
    @pytest.mark.asyncio
    async def test_data_type_migration_validation(self, products_collection, brands_collection):
        """Test validation of data type migrations from PostgreSQL to MongoDB."""
        
        # Simulate PostgreSQL data types and their MongoDB equivalents
        postgresql_brand = {
            "id": 1,  # PostgreSQL INTEGER -> MongoDB ObjectId
            "name": "Test Brand",  # VARCHAR -> String
            "established_year": 2020,  # INTEGER -> Number
            "is_active": True,  # BOOLEAN -> Boolean
            "created_at": datetime.utcnow(),  # TIMESTAMP -> Date
            "metadata_json": '{"category": "fashion", "premium": true}'  # JSON -> Object
        }
        
        # Transform to MongoDB format
        mongodb_brand = {
            "brand_id": str(uuid.uuid4()),
            "name": postgresql_brand["name"],
            "established_year": postgresql_brand["established_year"],
            "attributes": json.loads(postgresql_brand["metadata_json"]),
            "metadata": {
                "created_at": postgresql_brand["created_at"],
                "updated_at": postgresql_brand["created_at"],
                "status": "active" if postgresql_brand["is_active"] else "inactive"
            }
        }
        
        # Insert and validate
        result = await brands_collection.insert_one(mongodb_brand)
        inserted_brand = await brands_collection.find_one({"_id": result.inserted_id})
        
        assert inserted_brand["name"] == "Test Brand"
        assert inserted_brand["established_year"] == 2020
        assert inserted_brand["attributes"]["category"] == "fashion"
        assert inserted_brand["attributes"]["premium"] is True
        assert inserted_brand["metadata"]["status"] == "active"


class TestDataQualityPreservation:
    """Test suite for data quality preservation during migration."""
    
    @pytest.mark.asyncio
    async def test_quality_score_preservation(self, products_collection):
        """Test that SKU Genie quality scores are preserved during migration."""
        
        # Products with various quality scores from SKU Genie
        quality_test_products = [
            {
                "product_id": f"quality-test-{i}",
                "name": f"Quality Test Product {i}",
                "brand_id": ObjectId(),
                "quality": {
                    "data_quality_score": 0.5 + (i * 0.1),  # Scores from 0.5 to 0.9
                    "completeness_score": 0.6 + (i * 0.08),
                    "last_quality_check": datetime.utcnow()
                },
                "integration": {
                    "source_system": "sku_genie",
                    "source_id": str(1000 + i)
                },
                "metadata": {
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "status": "active"
                }
            }
            for i in range(1, 6)
        ]
        
        # Insert products
        result = await products_collection.insert_many(quality_test_products)
        
        # Validate quality score preservation
        for i, doc_id in enumerate(result.inserted_ids, 1):
            product = await products_collection.find_one({"_id": doc_id})
            expected_quality_score = 0.5 + (i * 0.1)
            
            assert abs(product["quality"]["data_quality_score"] - expected_quality_score) < 0.001
            assert product["integration"]["source_system"] == "sku_genie"


class TestMLCompatibilityScoreAccuracy:
    """Test suite for ML compatibility score accuracy validation."""
    
    @pytest.mark.asyncio
    async def test_face_shape_compatibility_migration(self, products_collection):
        """Test migration and validation of face shape compatibility scores."""
        
        # Sample products with pre-calculated ML compatibility scores
        ml_products = [
            {
                "product_id": "ml-round-frame",
                "name": "Round Frame Glasses",
                "brand_id": ObjectId(),
                "specifications": {
                    "frame": {"shape": "round", "width": 140, "height": 45}
                },
                "face_shape_compatibility": {
                    "oval": {"score": 0.90, "confidence": 0.95, "reasons": ["Perfect balance for oval faces"]},
                    "round": {"score": 0.30, "confidence": 0.88, "reasons": ["May emphasize roundness"]},
                    "square": {"score": 0.85, "confidence": 0.92, "reasons": ["Softens angular features"]},
                    "heart": {"score": 0.75, "confidence": 0.87, "reasons": ["Balances forehead width"]},
                    "diamond": {"score": 0.80, "confidence": 0.90, "reasons": ["Complements cheekbones"]},
                    "oblong": {"score": 0.70, "confidence": 0.85, "reasons": ["Adds width to narrow face"]}
                },
                "metadata": {"created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), "status": "active"}
            }
        ]
        
        # Insert products
        result = await products_collection.insert_many(ml_products)
        
        # Validate ML compatibility scores
        for doc_id in result.inserted_ids:
            product = await products_collection.find_one({"_id": doc_id})
            compatibility = product["face_shape_compatibility"]
            
            # Validate score ranges
            for shape in ["oval", "round", "square", "heart", "diamond", "oblong"]:
                assert 0.0 <= compatibility[shape]["score"] <= 1.0
                assert 0.0 <= compatibility[shape]["confidence"] <= 1.0
                assert len(compatibility[shape]["reasons"]) > 0
    
    @pytest.mark.asyncio
    async def test_ml_score_validation_rules(self, products_collection):
        """Test validation rules for ML compatibility scores."""
        
        def validate_ml_scores(compatibility_scores: Dict[str, Any]) -> List[str]:
            """Validate ML compatibility scores and return any issues."""
            issues = []
            
            required_shapes = ["oval", "round", "square", "heart", "diamond", "oblong"]
            
            for shape in required_shapes:
                if shape not in compatibility_scores:
                    issues.append(f"Missing compatibility score for {shape}")
                    continue
                
                shape_data = compatibility_scores[shape]
                
                # Validate score range
                if not (0.0 <= shape_data.get("score", -1) <= 1.0):
                    issues.append(f"Invalid score for {shape}: {shape_data.get('score')}")
                
                # Validate confidence range
                if not (0.0 <= shape_data.get("confidence", -1) <= 1.0):
                    issues.append(f"Invalid confidence for {shape}: {shape_data.get('confidence')}")
                
                # Validate reasons exist
                if not shape_data.get("reasons") or len(shape_data.get("reasons", [])) == 0:
                    issues.append(f"Missing reasons for {shape}")
            
            return issues
        
        # Test valid scores
        valid_scores = {
            "oval": {"score": 0.85, "confidence": 0.92, "reasons": ["Good fit"]},
            "round": {"score": 0.75, "confidence": 0.88, "reasons": ["Decent fit"]},
            "square": {"score": 0.65, "confidence": 0.85, "reasons": ["Moderate fit"]},
            "heart": {"score": 0.70, "confidence": 0.87, "reasons": ["Good balance"]},
            "diamond": {"score": 0.72, "confidence": 0.89, "reasons": ["Nice complement"]},
            "oblong": {"score": 0.68, "confidence": 0.86, "reasons": ["Adds width"]}
        }
        
        issues = validate_ml_scores(valid_scores)
        assert len(issues) == 0, f"Valid scores should have no issues: {issues}"
        
        # Test invalid scores
        invalid_scores = {
            "oval": {"score": 1.5, "confidence": 0.92, "reasons": ["Good fit"]},  # Invalid score > 1.0
            "round": {"score": 0.75, "confidence": -0.1, "reasons": ["Decent fit"]},  # Invalid confidence < 0
            "square": {"score": 0.65, "confidence": 0.85, "reasons": []},  # Missing reasons
            "heart": {"score": 0.70, "confidence": 0.87, "reasons": ["Good balance"]},
            "diamond": {"score": 0.72, "confidence": 0.89, "reasons": ["Nice complement"]}
            # Missing oblong shape
        }
        
        issues = validate_ml_scores(invalid_scores)
        assert len(issues) == 4  # Should find 4 issues
        assert any("Invalid score for oval" in issue for issue in issues)
        assert any("Invalid confidence for round" in issue for issue in issues)
        assert any("Missing reasons for square" in issue for issue in issues)
        assert any("Missing compatibility score for oblong" in issue for issue in issues)
        assert result["name"] == sample_sku_genie_product["full_name"]
        assert result["sku"] == sample_sku_genie_product["sku"]
        assert result["upc"] == sample_sku_genie_product["upc"]
        assert result["price"]["base_price"] == float(sample_sku_genie_product["price"])
        assert result["specifications"]["frame"]["material"] == "metal"
        assert result["specifications"]["frame"]["color"] == "gold"
        assert result["specifications"]["frame"]["shape"] == "aviator"
        assert result["specifications"]["measurements"]["bridge_size"] == 14.0
        assert result["specifications"]["measurements"]["temple_length"] == 135.0
        assert result["attributes"]["gender"] == "unisex"
        assert result["quality"]["data_quality_score"] == 0.92
        assert result["integration"]["source_system"] == "sku_genie"
        assert result["integration"]["source_id"] == "12345"
        assert len(result["media"]["images"]) == 2


if __name__ == "__main__":
    pytest.main([__file__, "-v"])