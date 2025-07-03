"""
MongoDB Data Integrity Tests

Tests for cross-collection reference validation, duplicate prevention,
data consistency checks, and relationship integrity.
"""
import pytest
import asyncio
import uuid
from datetime import datetime
from bson import ObjectId
from pymongo.errors import DuplicateKeyError


class TestCrossCollectionReferences:
    """Test suite for cross-collection reference validation."""
    
    @pytest.mark.asyncio
    async def test_product_brand_reference_integrity(self, products_collection, brands_collection, sample_brand_data, sample_product_data):
        """Test that product brand references are valid."""
        # Insert a brand first
        brand_result = await brands_collection.insert_one(sample_brand_data)
        brand_id = brand_result.inserted_id
        
        # Create product with valid brand reference
        sample_product_data["brand_id"] = brand_id
        product_result = await products_collection.insert_one(sample_product_data)
        
        # Verify the reference
        product = await products_collection.find_one({"_id": product_result.inserted_id})
        assert product["brand_id"] == brand_id
        
        # Verify we can join the data
        pipeline = [
            {"$match": {"_id": product_result.inserted_id}},
            {"$lookup": {
                "from": "brands",
                "localField": "brand_id",
                "foreignField": "_id",
                "as": "brand_info"
            }}
        ]
        
        result = await products_collection.aggregate(pipeline).to_list(None)
        assert len(result) == 1
        assert len(result[0]["brand_info"]) == 1
        assert result[0]["brand_info"][0]["name"] == sample_brand_data["name"]
    
    @pytest.mark.asyncio
    async def test_product_category_reference_integrity(self, products_collection, categories_collection, sample_category_data, sample_product_data):
        """Test that product category references are valid."""
        # Insert categories first
        category1_result = await categories_collection.insert_one(sample_category_data.copy())
        category1_id = category1_result.inserted_id
        
        category2_data = sample_category_data.copy()
        category2_data["category_id"] = str(uuid.uuid4())
        category2_data["name"] = "Second Category"
        category2_result = await categories_collection.insert_one(category2_data)
        category2_id = category2_result.inserted_id
        
        # Create product with multiple category references
        sample_product_data["category_ids"] = [category1_id, category2_id]
        product_result = await products_collection.insert_one(sample_product_data)
        
        # Verify the references
        product = await products_collection.find_one({"_id": product_result.inserted_id})
        assert len(product["category_ids"]) == 2
        assert category1_id in product["category_ids"]
        assert category2_id in product["category_ids"]
        
        # Verify we can join the data
        pipeline = [
            {"$match": {"_id": product_result.inserted_id}},
            {"$lookup": {
                "from": "categories",
                "localField": "category_ids",
                "foreignField": "_id",
                "as": "category_info"
            }}
        ]
        
        result = await products_collection.aggregate(pipeline).to_list(None)
        assert len(result) == 1
        assert len(result[0]["category_info"]) == 2
    
    @pytest.mark.asyncio
    async def test_category_parent_reference_integrity(self, categories_collection, sample_category_data):
        """Test that category parent references are valid."""
        # Insert parent category
        parent_category = sample_category_data.copy()
        parent_result = await categories_collection.insert_one(parent_category)
        parent_id = parent_result.inserted_id
        
        # Insert child category with parent reference
        child_category = sample_category_data.copy()
        child_category["category_id"] = str(uuid.uuid4())
        child_category["name"] = "Child Category"
        child_category["parent_id"] = parent_id
        child_category["level"] = 1
        child_category["path"] = [parent_id]
        
        child_result = await categories_collection.insert_one(child_category)
        
        # Verify the parent-child relationship
        child = await categories_collection.find_one({"_id": child_result.inserted_id})
        assert child["parent_id"] == parent_id
        assert parent_id in child["path"]
        
        # Verify we can find children of parent
        children = await categories_collection.find({"parent_id": parent_id}).to_list(None)
        assert len(children) == 1
        assert children[0]["_id"] == child_result.inserted_id
    
    @pytest.mark.asyncio
    async def test_orphaned_reference_detection(self, products_collection, sample_product_data):
        """Test detection of orphaned references."""
        # Create product with non-existent brand reference
        non_existent_brand_id = ObjectId()
        sample_product_data["brand_id"] = non_existent_brand_id
        
        # Insert should succeed (MongoDB doesn't enforce foreign keys)
        product_result = await products_collection.insert_one(sample_product_data)
        
        # But lookup should return empty brand_info
        pipeline = [
            {"$match": {"_id": product_result.inserted_id}},
            {"$lookup": {
                "from": "brands",
                "localField": "brand_id",
                "foreignField": "_id",
                "as": "brand_info"
            }}
        ]
        
        result = await products_collection.aggregate(pipeline).to_list(None)
        assert len(result) == 1
        assert len(result[0]["brand_info"]) == 0  # No matching brand found


class TestDuplicatePrevention:
    """Test suite for duplicate prevention mechanisms."""
    
    @pytest.mark.asyncio
    async def test_product_unique_constraints(self, products_collection, sample_product_data):
        """Test that products have proper unique constraints."""
        # Create indexes for unique fields
        await products_collection.create_index("product_id", unique=True)
        await products_collection.create_index("sku", unique=True, sparse=True)
        
        # Insert first product
        result1 = await products_collection.insert_one(sample_product_data)
        assert result1.inserted_id is not None
        
        # Try to insert duplicate product_id
        duplicate_product = sample_product_data.copy()
        with pytest.raises(DuplicateKeyError):
            await products_collection.insert_one(duplicate_product)
        
        # Try to insert duplicate SKU
        duplicate_sku_product = sample_product_data.copy()
        duplicate_sku_product["product_id"] = str(uuid.uuid4())  # Different product_id
        # But same SKU should fail
        with pytest.raises(DuplicateKeyError):
            await products_collection.insert_one(duplicate_sku_product)
    
    @pytest.mark.asyncio
    async def test_brand_unique_constraints(self, brands_collection, sample_brand_data):
        """Test that brands have proper unique constraints."""
        # Create indexes for unique fields
        await brands_collection.create_index("brand_id", unique=True)
        await brands_collection.create_index("name", unique=True)
        
        # Insert first brand
        result1 = await brands_collection.insert_one(sample_brand_data)
        assert result1.inserted_id is not None
        
        # Try to insert duplicate brand_id
        duplicate_brand = sample_brand_data.copy()
        with pytest.raises(DuplicateKeyError):
            await brands_collection.insert_one(duplicate_brand)
        
        # Try to insert duplicate name
        duplicate_name_brand = sample_brand_data.copy()
        duplicate_name_brand["brand_id"] = str(uuid.uuid4())  # Different brand_id
        # But same name should fail
        with pytest.raises(DuplicateKeyError):
            await brands_collection.insert_one(duplicate_name_brand)
    
    @pytest.mark.asyncio
    async def test_category_unique_constraints(self, categories_collection, sample_category_data):
        """Test that categories have proper unique constraints."""
        # Create indexes for unique fields
        await categories_collection.create_index("category_id", unique=True)
        await categories_collection.create_index("slug", unique=True)
        
        # Insert first category
        result1 = await categories_collection.insert_one(sample_category_data)
        assert result1.inserted_id is not None
        
        # Try to insert duplicate category_id
        duplicate_category = sample_category_data.copy()
        with pytest.raises(DuplicateKeyError):
            await categories_collection.insert_one(duplicate_category)
        
        # Try to insert duplicate slug
        duplicate_slug_category = sample_category_data.copy()
        duplicate_slug_category["category_id"] = str(uuid.uuid4())  # Different category_id
        # But same slug should fail
        with pytest.raises(DuplicateKeyError):
            await categories_collection.insert_one(duplicate_slug_category)
    
    @pytest.mark.asyncio
    async def test_sparse_index_behavior(self, products_collection, sample_product_data):
        """Test sparse index behavior for optional unique fields."""
        # Create sparse unique index for UPC (optional field)
        await products_collection.create_index("upc", unique=True, sparse=True)
        
        # Insert product with UPC
        product_with_upc = sample_product_data.copy()
        product_with_upc["upc"] = "123456789012"
        result1 = await products_collection.insert_one(product_with_upc)
        assert result1.inserted_id is not None
        
        # Insert product without UPC (should succeed due to sparse index)
        product_without_upc = sample_product_data.copy()
        product_without_upc["product_id"] = str(uuid.uuid4())
        product_without_upc["sku"] = f"TEST-{uuid.uuid4().hex[:8].upper()}"
        if "upc" in product_without_upc:
            del product_without_upc["upc"]
        
        result2 = await products_collection.insert_one(product_without_upc)
        assert result2.inserted_id is not None
        
        # Try to insert duplicate UPC (should fail)
        duplicate_upc_product = sample_product_data.copy()
        duplicate_upc_product["product_id"] = str(uuid.uuid4())
        duplicate_upc_product["sku"] = f"TEST-{uuid.uuid4().hex[:8].upper()}"
        duplicate_upc_product["upc"] = "123456789012"  # Same UPC
        
        with pytest.raises(DuplicateKeyError):
            await products_collection.insert_one(duplicate_upc_product)


class TestDataConsistency:
    """Test suite for data consistency checks."""
    
    @pytest.mark.asyncio
    async def test_product_analytics_consistency(self, products_collection, sample_product_data):
        """Test consistency of product analytics data."""
        # Insert product with analytics
        sample_product_data["analytics"] = {
            "views": 100,
            "clicks": 10,
            "conversions": 2,
            "rating": {"average": 4.5, "count": 20},
            "recommendation_score": 0.8,
            "popularity_score": 0.6
        }
        
        result = await products_collection.insert_one(sample_product_data)
        
        # Test: Conversion rate calculation consistency
        product = await products_collection.find_one({"_id": result.inserted_id})
        expected_conversion_rate = product["analytics"]["conversions"] / product["analytics"]["clicks"]
        
        # Update with calculated conversion rate
        await products_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"analytics.conversion_rate": expected_conversion_rate}}
        )
        
        # Verify consistency
        updated_product = await products_collection.find_one({"_id": result.inserted_id})
        actual_conversion_rate = updated_product["analytics"]["conversions"] / updated_product["analytics"]["clicks"]
        assert abs(updated_product["analytics"]["conversion_rate"] - actual_conversion_rate) < 0.001
    
    @pytest.mark.asyncio
    async def test_face_shape_score_consistency(self, products_collection, sample_product_data):
        """Test consistency of face shape compatibility scores."""
        result = await products_collection.insert_one(sample_product_data)
        
        # Verify all face shape scores are within valid range [0, 1]
        product = await products_collection.find_one({"_id": result.inserted_id})
        face_shapes = ["oval", "round", "square", "heart", "diamond", "oblong"]
        
        for shape in face_shapes:
            if shape in product["face_shape_compatibility"]:
                score = product["face_shape_compatibility"][shape]["score"]
                confidence = product["face_shape_compatibility"][shape]["confidence"]
                
                assert 0 <= score <= 1, f"Score for {shape} out of range: {score}"
                assert 0 <= confidence <= 1, f"Confidence for {shape} out of range: {confidence}"
    
    @pytest.mark.asyncio
    async def test_category_hierarchy_consistency(self, categories_collection, sample_category_data):
        """Test consistency of category hierarchy."""
        # Insert root category
        root_category = sample_category_data.copy()
        root_result = await categories_collection.insert_one(root_category)
        root_id = root_result.inserted_id
        
        # Insert child category
        child_category = sample_category_data.copy()
        child_category["category_id"] = str(uuid.uuid4())
        child_category["name"] = "Child Category"
        child_category["parent_id"] = root_id
        child_category["level"] = 1
        child_category["path"] = [root_id]
        
        child_result = await categories_collection.insert_one(child_category)
        child_id = child_result.inserted_id
        
        # Insert grandchild category
        grandchild_category = sample_category_data.copy()
        grandchild_category["category_id"] = str(uuid.uuid4())
        grandchild_category["name"] = "Grandchild Category"
        grandchild_category["parent_id"] = child_id
        grandchild_category["level"] = 2
        grandchild_category["path"] = [root_id, child_id]
        
        grandchild_result = await categories_collection.insert_one(grandchild_category)
        
        # Verify hierarchy consistency
        grandchild = await categories_collection.find_one({"_id": grandchild_result.inserted_id})
        
        # Level should match path length
        assert grandchild["level"] == len(grandchild["path"])
        
        # Path should contain all ancestors
        assert root_id in grandchild["path"]
        assert child_id in grandchild["path"]
        
        # Path should be in correct order
        assert grandchild["path"][0] == root_id
        assert grandchild["path"][1] == child_id
    
    @pytest.mark.asyncio
    async def test_brand_metrics_consistency(self, brands_collection, products_collection, sample_brand_data, sample_product_data):
        """Test consistency of brand metrics with product data."""
        # Insert brand
        brand_result = await brands_collection.insert_one(sample_brand_data)
        brand_id = brand_result.inserted_id
        
        # Insert products for this brand
        products = []
        total_rating_sum = 0
        total_review_count = 0
        
        for i in range(3):
            product = sample_product_data.copy()
            product["product_id"] = str(uuid.uuid4())
            product["sku"] = f"TEST-{i+1:04d}"
            product["brand_id"] = brand_id
            product["analytics"]["rating"] = {"average": 4.0 + i * 0.5, "count": 10 + i * 5}
            
            total_rating_sum += product["analytics"]["rating"]["average"] * product["analytics"]["rating"]["count"]
            total_review_count += product["analytics"]["rating"]["count"]
            
            result = await products_collection.insert_one(product)
            products.append(result.inserted_id)
        
        # Calculate expected brand metrics
        expected_product_count = len(products)
        expected_average_rating = total_rating_sum / total_review_count
        expected_total_reviews = total_review_count
        
        # Update brand metrics
        await brands_collection.update_one(
            {"_id": brand_id},
            {"$set": {
                "metrics.product_count": expected_product_count,
                "metrics.average_rating": expected_average_rating,
                "metrics.total_reviews": expected_total_reviews
            }}
        )
        
        # Verify consistency by aggregating actual product data
        pipeline = [
            {"$match": {"brand_id": brand_id}},
            {"$group": {
                "_id": "$brand_id",
                "product_count": {"$sum": 1},
                "total_rating_weighted": {"$sum": {"$multiply": ["$analytics.rating.average", "$analytics.rating.count"]}},
                "total_review_count": {"$sum": "$analytics.rating.count"}
            }},
            {"$addFields": {
                "average_rating": {"$divide": ["$total_rating_weighted", "$total_review_count"]}
            }}
        ]
        
        aggregated_metrics = await products_collection.aggregate(pipeline).to_list(None)
        assert len(aggregated_metrics) == 1
        
        # Compare with brand metrics
        brand = await brands_collection.find_one({"_id": brand_id})
        
        assert brand["metrics"]["product_count"] == aggregated_metrics[0]["product_count"]
        assert abs(brand["metrics"]["average_rating"] - aggregated_metrics[0]["average_rating"]) < 0.001
        assert brand["metrics"]["total_reviews"] == aggregated_metrics[0]["total_review_count"]


class TestRelationshipIntegrity:
    """Test suite for relationship integrity across collections."""
    
    @pytest.mark.asyncio
    async def test_cascade_delete_simulation(self, products_collection, brands_collection, sample_brand_data, sample_product_data):
        """Test cascade delete behavior simulation."""
        # Insert brand and products
        brand_result = await brands_collection.insert_one(sample_brand_data)
        brand_id = brand_result.inserted_id
        
        product_ids = []
        for i in range(3):
            product = sample_product_data.copy()
            product["product_id"] = str(uuid.uuid4())
            product["sku"] = f"TEST-{i+1:04d}"
            product["brand_id"] = brand_id
            
            result = await products_collection.insert_one(product)
            product_ids.append(result.inserted_id)
        
        # Verify products exist
        product_count = await products_collection.count_documents({"brand_id": brand_id})
        assert product_count == 3
        
        # Simulate cascade delete: delete all products before deleting brand
        delete_result = await products_collection.delete_many({"brand_id": brand_id})
        assert delete_result.deleted_count == 3
        
        # Now delete the brand
        brand_delete_result = await brands_collection.delete_one({"_id": brand_id})
        assert brand_delete_result.deleted_count == 1
        
        # Verify all are deleted
        remaining_products = await products_collection.count_documents({"brand_id": brand_id})
        assert remaining_products == 0
        
        remaining_brands = await brands_collection.count_documents({"_id": brand_id})
        assert remaining_brands == 0
    
    @pytest.mark.asyncio
    async def test_referential_integrity_check(self, products_collection, brands_collection, categories_collection):
        """Test referential integrity checking across collections."""
        # Create some test data with known relationships
        from bson import ObjectId
        
        # Insert categories
        cat1_id = ObjectId()
        cat2_id = ObjectId()
        
        await categories_collection.insert_many([
            {
                "category_id": "cat-1",
                "name": "Category 1",
                "level": 0,
                "metadata": {"created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), "status": "active"}
            },
            {
                "category_id": "cat-2", 
                "name": "Category 2",
                "level": 0,
                "metadata": {"created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), "status": "active"}
            }
        ])
        
        categories = await categories_collection.find({}).to_list(None)
        cat1_id = categories[0]["_id"]
        cat2_id = categories[1]["_id"]
        
        # Insert brand
        brand_result = await brands_collection.insert_one({
            "brand_id": "brand-1",
            "name": "Brand 1",
            "metadata": {"created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), "status": "active"}
        })
        brand_id = brand_result.inserted_id
        
        # Insert product with references
        await products_collection.insert_one({
            "product_id": "prod-1",
            "name": "Product 1",
            "brand_id": brand_id,
            "category_ids": [cat1_id, cat2_id],
            "metadata": {"created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), "status": "active"}
        })
        
        # Test referential integrity query
        # Find products with invalid brand references
        pipeline = [
            {"$lookup": {
                "from": "brands",
                "localField": "brand_id",
                "foreignField": "_id",
                "as": "brand_info"
            }},
            {"$match": {"brand_info": {"$size": 0}}}  # No matching brand found
        ]
        
        orphaned_products = await products_collection.aggregate(pipeline).to_list(None)
        assert len(orphaned_products) == 0  # Should be no orphaned products
        
        # Test category reference integrity
        pipeline = [
            {"$unwind": "$category_ids"},
            {"$lookup": {
                "from": "categories",
                "localField": "category_ids",
                "foreignField": "_id",
                "as": "category_info"
            }},
            {"$match": {"category_info": {"$size": 0}}}  # No matching category found
        ]
        
        orphaned_category_refs = await products_collection.aggregate(pipeline).to_list(None)
        assert len(orphaned_category_refs) == 0  # Should be no orphaned category references
    
    @pytest.mark.asyncio
    async def test_bidirectional_relationship_consistency(self, categories_collection, sample_category_data):
        """Test bidirectional relationship consistency."""
        # Insert parent category
        parent_category = sample_category_data.copy()
        parent_result = await categories_collection.insert_one(parent_category)
        parent_id = parent_result.inserted_id
        
        # Insert child categories
        child_ids = []
        for i in range(3):
            child_category = sample_category_data.copy()
            child_category["category_id"] = f"child-{i+1}"
            child_category["name"] = f"Child Category {i+1}"
            child_category["parent_id"] = parent_id
            child_category["level"] = 1
            child_category["path"] = [parent_id]
            
            result = await categories_collection.insert_one(child_category)
            child_ids.append(result.inserted_id)
        
        # Update parent with children count
        children_count = len(child_ids)
        await categories_collection.update_one(
            {"_id": parent_id},
            {"$set": {"children_count": children_count}}
        )
        
        # Verify bidirectional consistency
        parent = await categories_collection.find_one({"_id": parent_id})
        actual_children = await categories_collection.find({"parent_id": parent_id}).to_list(None)
        
        assert parent["children_count"] == len(actual_children)
        assert parent["children_count"] == children_count


if __name__ == "__main__":
    pytest.main([__file__, "-v"])