"""
MongoDB Schema Validation Tests

Tests for validating MongoDB collection schemas, field validation,
data type constraints, and required field enforcement.
"""
import pytest
import asyncio
from datetime import datetime
from bson import ObjectId
from pymongo.errors import WriteError


class TestProductsSchemaValidation:
    """Test suite for products collection schema validation."""
    
    @pytest.mark.asyncio
    async def test_product_required_fields_validation(self, products_collection):
        """Test that required fields are enforced for products."""
        # Test: Missing product_id should fail
        invalid_product = {
            "name": "Test Product",
            "brand_id": ObjectId(),
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        with pytest.raises(WriteError) as exc_info:
            await products_collection.insert_one(invalid_product)
        
        assert "product_id" in str(exc_info.value)
        
        # Test: Missing name should fail
        invalid_product = {
            "product_id": "test-123",
            "brand_id": ObjectId(),
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        with pytest.raises(WriteError):
            await products_collection.insert_one(invalid_product)
        
        # Test: Missing brand_id should fail
        invalid_product = {
            "product_id": "test-123",
            "name": "Test Product",
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        with pytest.raises(WriteError):
            await products_collection.insert_one(invalid_product)
    
    @pytest.mark.asyncio
    async def test_product_data_types_validation(self, products_collection):
        """Test that data types are enforced for product fields."""
        base_product = {
            "product_id": "test-123",
            "name": "Test Product",
            "brand_id": ObjectId(),
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        # Test: Invalid product_id type (should be string)
        invalid_product = base_product.copy()
        invalid_product["product_id"] = 123
        
        with pytest.raises(WriteError):
            await products_collection.insert_one(invalid_product)
        
        # Test: Invalid brand_id type (should be ObjectId)
        invalid_product = base_product.copy()
        invalid_product["brand_id"] = "not-an-objectid"
        
        with pytest.raises(WriteError):
            await products_collection.insert_one(invalid_product)
        
        # Test: Invalid price structure
        invalid_product = base_product.copy()
        invalid_product["price"] = {
            "base_price": -10.0,  # Negative price should fail
            "currency": "USD"
        }
        
        with pytest.raises(WriteError):
            await products_collection.insert_one(invalid_product)
    
    @pytest.mark.asyncio
    async def test_face_shape_compatibility_validation(self, products_collection):
        """Test face shape compatibility score validation."""
        base_product = {
            "product_id": "test-123",
            "name": "Test Product",
            "brand_id": ObjectId(),
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        # Test: Valid face shape compatibility scores
        valid_product = base_product.copy()
        valid_product["face_shape_compatibility"] = {
            "oval": {"score": 0.85, "confidence": 0.92},
            "round": {"score": 0.75, "confidence": 0.88}
        }
        
        result = await products_collection.insert_one(valid_product)
        assert result.inserted_id is not None
        
        # Clean up
        await products_collection.delete_one({"_id": result.inserted_id})
        
        # Test: Invalid score range (>1.0)
        invalid_product = base_product.copy()
        invalid_product["face_shape_compatibility"] = {
            "oval": {"score": 1.5, "confidence": 0.92}  # Score > 1.0 should fail
        }
        
        with pytest.raises(WriteError):
            await products_collection.insert_one(invalid_product)
        
        # Test: Invalid confidence range (<0)
        invalid_product = base_product.copy()
        invalid_product["face_shape_compatibility"] = {
            "oval": {"score": 0.85, "confidence": -0.1}  # Confidence < 0 should fail
        }
        
        with pytest.raises(WriteError):
            await products_collection.insert_one(invalid_product)
    
    @pytest.mark.asyncio
    async def test_metadata_validation(self, products_collection):
        """Test metadata field validation."""
        base_product = {
            "product_id": "test-123",
            "name": "Test Product",
            "brand_id": ObjectId()
        }
        
        # Test: Missing metadata should fail
        with pytest.raises(WriteError):
            await products_collection.insert_one(base_product)
        
        # Test: Invalid status value
        invalid_product = base_product.copy()
        invalid_product["metadata"] = {
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "invalid_status"  # Should fail - not in enum
        }
        
        with pytest.raises(WriteError):
            await products_collection.insert_one(invalid_product)
        
        # Test: Valid status values
        valid_statuses = ["active", "inactive", "draft", "archived"]
        for status in valid_statuses:
            valid_product = base_product.copy()
            valid_product["metadata"] = {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": status
            }
            
            result = await products_collection.insert_one(valid_product)
            assert result.inserted_id is not None
            
            # Clean up
            await products_collection.delete_one({"_id": result.inserted_id})
    
    @pytest.mark.asyncio
    async def test_complete_valid_product_insertion(self, products_collection, sample_product_data):
        """Test insertion of a complete valid product document."""
        result = await products_collection.insert_one(sample_product_data)
        assert result.inserted_id is not None
        
        # Verify the document was inserted correctly
        inserted_product = await products_collection.find_one({"_id": result.inserted_id})
        assert inserted_product is not None
        assert inserted_product["product_id"] == sample_product_data["product_id"]
        assert inserted_product["name"] == sample_product_data["name"]
        assert inserted_product["face_shape_compatibility"]["oval"]["score"] == 0.85


class TestBrandsSchemaValidation:
    """Test suite for brands collection schema validation."""
    
    @pytest.mark.asyncio
    async def test_brand_required_fields_validation(self, brands_collection):
        """Test that required fields are enforced for brands."""
        # Test: Missing brand_id should fail
        invalid_brand = {
            "name": "Test Brand",
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        with pytest.raises(WriteError):
            await brands_collection.insert_one(invalid_brand)
        
        # Test: Missing name should fail
        invalid_brand = {
            "brand_id": "test-brand-123",
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        with pytest.raises(WriteError):
            await brands_collection.insert_one(invalid_brand)
    
    @pytest.mark.asyncio
    async def test_brand_status_validation(self, brands_collection):
        """Test brand status field validation."""
        base_brand = {
            "brand_id": "test-brand-123",
            "name": "Test Brand"
        }
        
        # Test: Invalid status value
        invalid_brand = base_brand.copy()
        invalid_brand["metadata"] = {
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "invalid_status"
        }
        
        with pytest.raises(WriteError):
            await brands_collection.insert_one(invalid_brand)
        
        # Test: Valid status values
        valid_statuses = ["active", "inactive"]
        for status in valid_statuses:
            valid_brand = base_brand.copy()
            valid_brand["metadata"] = {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": status
            }
            
            result = await brands_collection.insert_one(valid_brand)
            assert result.inserted_id is not None
            
            # Clean up
            await brands_collection.delete_one({"_id": result.inserted_id})
    
    @pytest.mark.asyncio
    async def test_complete_valid_brand_insertion(self, brands_collection, sample_brand_data):
        """Test insertion of a complete valid brand document."""
        result = await brands_collection.insert_one(sample_brand_data)
        assert result.inserted_id is not None
        
        # Verify the document was inserted correctly
        inserted_brand = await brands_collection.find_one({"_id": result.inserted_id})
        assert inserted_brand is not None
        assert inserted_brand["brand_id"] == sample_brand_data["brand_id"]
        assert inserted_brand["name"] == sample_brand_data["name"]


class TestCategoriesSchemaValidation:
    """Test suite for categories collection schema validation."""
    
    @pytest.mark.asyncio
    async def test_category_required_fields_validation(self, categories_collection):
        """Test that required fields are enforced for categories."""
        # Test: Missing category_id should fail
        invalid_category = {
            "name": "Test Category",
            "level": 0,
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        with pytest.raises(WriteError):
            await categories_collection.insert_one(invalid_category)
        
        # Test: Missing level should fail
        invalid_category = {
            "category_id": "test-cat-123",
            "name": "Test Category",
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        with pytest.raises(WriteError):
            await categories_collection.insert_one(invalid_category)
    
    @pytest.mark.asyncio
    async def test_category_level_validation(self, categories_collection):
        """Test category level field validation."""
        base_category = {
            "category_id": "test-cat-123",
            "name": "Test Category",
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        # Test: Negative level should fail
        invalid_category = base_category.copy()
        invalid_category["level"] = -1
        
        with pytest.raises(WriteError):
            await categories_collection.insert_one(invalid_category)
        
        # Test: Valid level values
        for level in [0, 1, 2, 3]:
            valid_category = base_category.copy()
            valid_category["level"] = level
            
            result = await categories_collection.insert_one(valid_category)
            assert result.inserted_id is not None
            
            # Clean up
            await categories_collection.delete_one({"_id": result.inserted_id})
    
    @pytest.mark.asyncio
    async def test_category_hierarchy_validation(self, categories_collection):
        """Test category hierarchy (parent_id and path) validation."""
        # Test: Root category (level 0, no parent)
        root_category = {
            "category_id": "root-cat",
            "name": "Root Category",
            "level": 0,
            "parent_id": None,
            "path": [],
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        result = await categories_collection.insert_one(root_category)
        assert result.inserted_id is not None
        root_id = result.inserted_id
        
        # Test: Child category (level 1, with parent)
        child_category = {
            "category_id": "child-cat",
            "name": "Child Category",
            "level": 1,
            "parent_id": root_id,
            "path": [root_id],
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        result = await categories_collection.insert_one(child_category)
        assert result.inserted_id is not None
    
    @pytest.mark.asyncio
    async def test_complete_valid_category_insertion(self, categories_collection, sample_category_data):
        """Test insertion of a complete valid category document."""
        result = await categories_collection.insert_one(sample_category_data)
        assert result.inserted_id is not None
        
        # Verify the document was inserted correctly
        inserted_category = await categories_collection.find_one({"_id": result.inserted_id})
        assert inserted_category is not None
        assert inserted_category["category_id"] == sample_category_data["category_id"]
        assert inserted_category["name"] == sample_category_data["name"]
        assert inserted_category["level"] == 0


class TestSchemaConstraints:
    """Test suite for additional schema constraints and edge cases."""
    
    @pytest.mark.asyncio
    async def test_field_length_constraints(self, products_collection):
        """Test field length constraints."""
        base_product = {
            "product_id": "test-123",
            "brand_id": ObjectId(),
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        # Test: Very long product name (should be allowed but tested for performance)
        long_name = "A" * 1000  # 1000 character name
        valid_product = base_product.copy()
        valid_product["name"] = long_name
        
        result = await products_collection.insert_one(valid_product)
        assert result.inserted_id is not None
        
        # Clean up
        await products_collection.delete_one({"_id": result.inserted_id})
    
    @pytest.mark.asyncio
    async def test_nested_object_validation(self, products_collection):
        """Test validation of nested object structures."""
        base_product = {
            "product_id": "test-123",
            "name": "Test Product",
            "brand_id": ObjectId(),
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        # Test: Valid nested specifications structure
        valid_product = base_product.copy()
        valid_product["specifications"] = {
            "frame": {
                "material": "acetate",
                "color": "black",
                "shape": "round",
                "width": 140,
                "height": 45
            },
            "lens": {
                "material": "polycarbonate",
                "color": "clear",
                "prescription_ready": True
            }
        }
        
        result = await products_collection.insert_one(valid_product)
        assert result.inserted_id is not None
        
        # Verify nested structure was preserved
        inserted_product = await products_collection.find_one({"_id": result.inserted_id})
        assert inserted_product["specifications"]["frame"]["material"] == "acetate"
        assert inserted_product["specifications"]["lens"]["prescription_ready"] is True
    
    @pytest.mark.asyncio
    async def test_array_field_validation(self, products_collection):
        """Test validation of array fields."""
        base_product = {
            "product_id": "test-123",
            "name": "Test Product",
            "brand_id": ObjectId(),
            "metadata": {
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "status": "active"
            }
        }
        
        # Test: Valid array fields
        valid_product = base_product.copy()
        valid_product["category_ids"] = [ObjectId(), ObjectId(), ObjectId()]
        valid_product["attributes"] = {
            "features": ["lightweight", "durable", "flexible"],
            "season": ["spring", "summer", "fall", "winter"]
        }
        
        result = await products_collection.insert_one(valid_product)
        assert result.inserted_id is not None
        
        # Verify array fields were preserved
        inserted_product = await products_collection.find_one({"_id": result.inserted_id})
        assert len(inserted_product["category_ids"]) == 3
        assert "lightweight" in inserted_product["attributes"]["features"]
        assert len(inserted_product["attributes"]["season"]) == 4


if __name__ == "__main__":
    pytest.main([__file__, "-v"])