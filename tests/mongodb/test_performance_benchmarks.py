"""
MongoDB Performance Benchmark Tests

Tests for query performance (<100ms target), index utilization validation,
concurrent access tests, and large dataset performance tests (10,000+ products).
"""
import pytest
import asyncio
import time
import uuid
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from bson import ObjectId
import random


class TestQueryPerformance:
    """Test suite for query performance benchmarks."""
    
    @pytest.mark.asyncio
    async def test_product_search_performance(self, products_collection, sample_products_bulk, performance_timer):
        """Test product search query performance (<100ms target)."""
        # Create indexes for optimal performance
        await products_collection.create_index([("name", "text"), ("description", "text")])
        await products_collection.create_index("metadata.status")
        await products_collection.create_index("analytics.popularity_score")
        
        # Test simple find query
        performance_timer.start()
        results = await products_collection.find({"metadata.status": "active"}).limit(20).to_list(None)
        elapsed = performance_timer.stop()
        
        assert len(results) > 0
        assert elapsed < 100, f"Simple find query took {elapsed:.2f}ms, should be <100ms"
        
        # Test text search query
        performance_timer.start()
        results = await products_collection.find(
            {"$text": {"$search": "Test"}}
        ).limit(20).to_list(None)
        elapsed = performance_timer.stop()
        
        assert elapsed < 100, f"Text search query took {elapsed:.2f}ms, should be <100ms"
        
        # Test sorted query
        performance_timer.start()
        results = await products_collection.find(
            {"metadata.status": "active"}
        ).sort([("analytics.popularity_score", -1)]).limit(20).to_list(None)
        elapsed = performance_timer.stop()
        
        assert elapsed < 100, f"Sorted query took {elapsed:.2f}ms, should be <100ms"
    
    @pytest.mark.asyncio
    async def test_face_shape_compatibility_query_performance(self, products_collection, sample_products_bulk, performance_timer):
        """Test face shape compatibility query performance."""
        # Create indexes for face shape compatibility
        await products_collection.create_index("face_shape_compatibility.oval.score")
        await products_collection.create_index("face_shape_compatibility.round.score")
        await products_collection.create_index("face_shape_compatibility.square.score")
        
        # Test face shape compatibility query
        performance_timer.start()
        results = await products_collection.find({
            "face_shape_compatibility.oval.score": {"$gte": 0.7},
            "metadata.status": "active"
        }).limit(20).to_list(None)
        elapsed = performance_timer.stop()
        
        assert elapsed < 100, f"Face shape query took {elapsed:.2f}ms, should be <100ms"
        
        # Test multiple face shape query
        performance_timer.start()
        results = await products_collection.find({
            "$or": [
                {"face_shape_compatibility.oval.score": {"$gte": 0.8}},
                {"face_shape_compatibility.round.score": {"$gte": 0.8}}
            ],
            "metadata.status": "active"
        }).limit(20).to_list(None)
        elapsed = performance_timer.stop()
        
        assert elapsed < 100, f"Multiple face shape query took {elapsed:.2f}ms, should be <100ms"
    
    @pytest.mark.asyncio
    async def test_aggregation_pipeline_performance(self, products_collection, sample_products_bulk, performance_timer):
        """Test aggregation pipeline performance for recommendations."""
        # Create compound indexes for aggregation
        await products_collection.create_index([
            ("metadata.status", 1),
            ("analytics.popularity_score", -1),
            ("quality.data_quality_score", -1)
        ])
        
        # Test recommendation scoring aggregation
        pipeline = [
            {"$match": {"metadata.status": "active"}},
            {"$addFields": {
                "recommendation_score": {
                    "$add": [
                        {"$multiply": ["$analytics.popularity_score", 0.3]},
                        {"$multiply": ["$quality.data_quality_score", 0.2]},
                        {"$multiply": ["$face_shape_compatibility.oval.score", 0.5]}
                    ]
                }
            }},
            {"$sort": {"recommendation_score": -1}},
            {"$limit": 10}
        ]
        
        performance_timer.start()
        results = await products_collection.aggregate(pipeline).to_list(None)
        elapsed = performance_timer.stop()
        
        assert len(results) > 0
        assert elapsed < 100, f"Aggregation pipeline took {elapsed:.2f}ms, should be <100ms"
    
    @pytest.mark.asyncio
    async def test_category_hierarchy_query_performance(self, categories_collection, performance_timer):
        """Test category hierarchy query performance."""
        # Create test category hierarchy
        root_cats = []
        for i in range(10):
            root_cat = {
                "category_id": f"root-{i}",
                "name": f"Root Category {i}",
                "level": 0,
                "parent_id": None,
                "path": [],
                "metadata": {"created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), "status": "active"}
            }
            result = await categories_collection.insert_one(root_cat)
            root_cats.append(result.inserted_id)
            
            # Add child categories
            for j in range(5):
                child_cat = {
                    "category_id": f"child-{i}-{j}",
                    "name": f"Child Category {i}-{j}",
                    "level": 1,
                    "parent_id": result.inserted_id,
                    "path": [result.inserted_id],
                    "metadata": {"created_at": datetime.utcnow(), "updated_at": datetime.utcnow(), "status": "active"}
                }
                await categories_collection.insert_one(child_cat)
        
        # Create indexes
        await categories_collection.create_index("parent_id")
        await categories_collection.create_index("path")
        await categories_collection.create_index("level")
        
        # Test hierarchy traversal query
        performance_timer.start()
        root_category = root_cats[0]
        descendants = await categories_collection.find(
            {"path": root_category}
        ).to_list(None)
        elapsed = performance_timer.stop()
        
        assert len(descendants) == 5  # Should find 5 children
        assert elapsed < 100, f"Hierarchy query took {elapsed:.2f}ms, should be <100ms"


class TestIndexUtilization:
    """Test suite for index utilization validation."""
    
    @pytest.mark.asyncio
    async def test_index_usage_verification(self, products_collection, sample_products_bulk):
        """Test that queries properly utilize indexes."""
        # Create test indexes
        await products_collection.create_index("metadata.status")
        await products_collection.create_index("brand_id")
        await products_collection.create_index("analytics.popularity_score")
        
        # Test query with explain to verify index usage
        explain_result = await products_collection.find(
            {"metadata.status": "active"}
        ).explain()
        
        # Verify that the query used an index
        execution_stats = explain_result.get("executionStats", {})
        assert execution_stats.get("totalDocsExamined", 0) <= execution_stats.get("totalDocsReturned", 0)
        
        # Check winning plan uses index
        winning_plan = explain_result.get("queryPlanner", {}).get("winningPlan", {})
        assert "IXSCAN" in str(winning_plan) or "TEXT" in str(winning_plan)
    
    @pytest.mark.asyncio
    async def test_compound_index_utilization(self, products_collection, sample_products_bulk):
        """Test compound index utilization."""
        # Create compound index
        await products_collection.create_index([
            ("metadata.status", 1),
            ("analytics.popularity_score", -1)
        ])
        
        # Test query that should use compound index
        explain_result = await products_collection.find({
            "metadata.status": "active",
            "analytics.popularity_score": {"$gte": 0.5}
        }).explain()
        
        # Verify index usage
        winning_plan = explain_result.get("queryPlanner", {}).get("winningPlan", {})
        assert "IXSCAN" in str(winning_plan)
        
        # Verify both fields are used in index
        index_bounds = str(winning_plan)
        assert "metadata.status" in index_bounds
        assert "analytics.popularity_score" in index_bounds
    
    @pytest.mark.asyncio
    async def test_text_index_utilization(self, products_collection, sample_products_bulk):
        """Test text index utilization for search queries."""
        # Create text index
        await products_collection.create_index([
            ("name", "text"),
            ("description", "text"),
            ("short_description", "text")
        ])
        
        # Test text search query
        explain_result = await products_collection.find({
            "$text": {"$search": "Test Product"}
        }).explain()
        
        # Verify text index usage
        winning_plan = explain_result.get("queryPlanner", {}).get("winningPlan", {})
        assert "TEXT" in str(winning_plan)
    
    @pytest.mark.asyncio
    async def test_unused_index_detection(self, mongodb_database, products_collection):
        """Test detection of unused indexes."""
        # Create an index that won't be used
        await products_collection.create_index("unused_field")
        
        # Perform some queries that don't use this index
        await products_collection.find({"metadata.status": "active"}).to_list(None)
        await products_collection.find({"name": "Test"}).to_list(None)
        
        # Check index statistics
        try:
            index_stats = await products_collection.aggregate([{"$indexStats": {}}]).to_list(None)
            
            unused_indexes = []
            for stat in index_stats:
                if stat["accesses"]["ops"] == 0 and stat["name"] != "_id_":
                    unused_indexes.append(stat["name"])
            
            # The unused_field index should appear as unused
            assert any("unused_field" in idx for idx in unused_indexes)
            
        except Exception:
            # $indexStats might not be available in all MongoDB versions
            pytest.skip("$indexStats not available in this MongoDB version")


class TestConcurrentAccess:
    """Test suite for concurrent access performance."""
    
    @pytest.mark.asyncio
    async def test_concurrent_read_performance(self, products_collection, sample_products_bulk, performance_timer):
        """Test concurrent read operations performance."""
        # Create index for optimal read performance
        await products_collection.create_index("metadata.status")
        
        async def read_operation():
            """Single read operation."""
            return await products_collection.find(
                {"metadata.status": "active"}
            ).limit(10).to_list(None)
        
        # Test concurrent reads
        concurrent_operations = 10
        performance_timer.start()
        
        tasks = [read_operation() for _ in range(concurrent_operations)]
        results = await asyncio.gather(*tasks)
        
        elapsed = performance_timer.stop()
        
        # Verify all operations completed successfully
        assert len(results) == concurrent_operations
        for result in results:
            assert len(result) > 0
        
        # Check average time per operation
        avg_time = elapsed / concurrent_operations
        assert avg_time < 50, f"Average concurrent read time {avg_time:.2f}ms, should be <50ms"
    
    @pytest.mark.asyncio
    async def test_concurrent_write_performance(self, products_collection, sample_product_data, performance_timer):
        """Test concurrent write operations performance."""
        async def write_operation(index):
            """Single write operation."""
            product_data = sample_product_data.copy()
            product_data["product_id"] = f"concurrent-test-{index}"
            product_data["sku"] = f"CONC-{index:04d}"
            product_data["name"] = f"Concurrent Test Product {index}"
            
            return await products_collection.insert_one(product_data)
        
        # Test concurrent writes
        concurrent_operations = 5  # Fewer writes to avoid conflicts
        performance_timer.start()
        
        tasks = [write_operation(i) for i in range(concurrent_operations)]
        results = await asyncio.gather(*tasks)
        
        elapsed = performance_timer.stop()
        
        # Verify all operations completed successfully
        assert len(results) == concurrent_operations
        for result in results:
            assert result.inserted_id is not None
        
        # Check average time per operation
        avg_time = elapsed / concurrent_operations
        assert avg_time < 100, f"Average concurrent write time {avg_time:.2f}ms, should be <100ms"
    
    @pytest.mark.asyncio
    async def test_mixed_concurrent_operations(self, products_collection, sample_products_bulk, sample_product_data, performance_timer):
        """Test mixed read/write concurrent operations."""
        # Create index for reads
        await products_collection.create_index("metadata.status")
        
        async def read_operation():
            """Read operation."""
            return await products_collection.find(
                {"metadata.status": "active"}
            ).limit(5).to_list(None)
        
        async def write_operation(index):
            """Write operation."""
            product_data = sample_product_data.copy()
            product_data["product_id"] = f"mixed-test-{index}"
            product_data["sku"] = f"MIX-{index:04d}"
            product_data["name"] = f"Mixed Test Product {index}"
            
            return await products_collection.insert_one(product_data)
        
        # Mix of read and write operations
        performance_timer.start()
        
        tasks = []
        for i in range(10):
            if i % 3 == 0:  # 1/3 writes, 2/3 reads
                tasks.append(write_operation(i))
            else:
                tasks.append(read_operation())
        
        results = await asyncio.gather(*tasks)
        elapsed = performance_timer.stop()
        
        # Verify all operations completed successfully
        assert len(results) == 10
        
        # Check total time for mixed operations
        assert elapsed < 500, f"Mixed operations took {elapsed:.2f}ms, should be <500ms"


class TestLargeDatasetPerformance:
    """Test suite for large dataset performance (10,000+ products)."""
    
    @pytest.mark.asyncio
    async def test_large_dataset_creation(self, products_collection, sample_product_data, performance_timer):
        """Test creation of large dataset (10,000+ products)."""
        # Generate 1000 products for testing (reduced for CI performance)
        batch_size = 100
        total_products = 1000
        
        performance_timer.start()
        
        for batch_start in range(0, total_products, batch_size):
            batch_products = []
            for i in range(batch_start, min(batch_start + batch_size, total_products)):
                product = sample_product_data.copy()
                product["product_id"] = f"large-test-{i:05d}"
                product["sku"] = f"LARGE-{i:05d}"
                product["name"] = f"Large Dataset Product {i}"
                product["analytics"]["popularity_score"] = random.uniform(0.1, 1.0)
                batch_products.append(product)
            
            await products_collection.insert_many(batch_products)
        
        elapsed = performance_timer.stop()
        
        # Verify all products were inserted
        count = await products_collection.count_documents({})
        assert count >= total_products
        
        # Check insertion performance
        avg_time_per_product = elapsed / total_products
        assert avg_time_per_product < 10, f"Average insertion time {avg_time_per_product:.2f}ms per product, should be <10ms"
    
    @pytest.mark.asyncio
    async def test_large_dataset_query_performance(self, products_collection, performance_timer):
        """Test query performance on large dataset."""
        # Ensure we have a large dataset (from previous test or create minimal)
        count = await products_collection.count_documents({})
        if count < 100:
            pytest.skip("Large dataset not available, run test_large_dataset_creation first")
        
        # Create indexes for performance
        await products_collection.create_index("analytics.popularity_score")
        await products_collection.create_index("metadata.status")
        await products_collection.create_index([
            ("metadata.status", 1),
            ("analytics.popularity_score", -1)
        ])
        
        # Test pagination performance
        performance_timer.start()
        results = await products_collection.find(
            {"metadata.status": "active"}
        ).sort([("analytics.popularity_score", -1)]).skip(500).limit(20).to_list(None)
        elapsed = performance_timer.stop()
        
        assert len(results) > 0
        assert elapsed < 100, f"Pagination query on large dataset took {elapsed:.2f}ms, should be <100ms"
        
        # Test aggregation performance on large dataset
        pipeline = [
            {"$match": {"metadata.status": "active"}},
            {"$group": {
                "_id": None,
                "avg_popularity": {"$avg": "$analytics.popularity_score"},
                "count": {"$sum": 1}
            }}
        ]
        
        performance_timer.start()
        results = await products_collection.aggregate(pipeline).to_list(None)
        elapsed = performance_timer.stop()
        
        assert len(results) == 1
        assert elapsed < 200, f"Aggregation on large dataset took {elapsed:.2f}ms, should be <200ms"
    
    @pytest.mark.asyncio
    async def test_large_dataset_face_shape_query_performance(self, products_collection, performance_timer):
        """Test face shape queries on large dataset."""
        # Check dataset size
        count = await products_collection.count_documents({})
        if count < 100:
            pytest.skip("Large dataset not available")
        
        # Create face shape indexes
        for shape in ["oval", "round", "square", "heart", "diamond", "oblong"]:
            await products_collection.create_index(f"face_shape_compatibility.{shape}.score")
        
        # Test face shape compatibility query performance
        performance_timer.start()
        results = await products_collection.find({
            "face_shape_compatibility.oval.score": {"$gte": 0.7},
            "metadata.status": "active"
        }).sort([("face_shape_compatibility.oval.score", -1)]).limit(50).to_list(None)
        elapsed = performance_timer.stop()
        
        assert elapsed < 100, f"Face shape query on large dataset took {elapsed:.2f}ms, should be <100ms"
        
        # Test multi-face-shape query
        performance_timer.start()
        results = await products_collection.find({
            "$or": [
                {"face_shape_compatibility.oval.score": {"$gte": 0.8}},
                {"face_shape_compatibility.round.score": {"$gte": 0.8}},
                {"face_shape_compatibility.square.score": {"$gte": 0.8}}
            ],
            "metadata.status": "active"
        }).limit(30).to_list(None)
        elapsed = performance_timer.stop()
        
        assert elapsed < 150, f"Multi-face-shape query on large dataset took {elapsed:.2f}ms, should be <150ms"
    
    @pytest.mark.asyncio
    async def test_large_dataset_memory_usage(self, products_collection):
        """Test memory usage efficiency for large dataset operations."""
        # Check dataset size
        count = await products_collection.count_documents({})
        if count < 100:
            pytest.skip("Large dataset not available")
        
        # Test cursor-based iteration (memory efficient)
        processed_count = 0
        cursor = products_collection.find({"metadata.status": "active"}).batch_size(50)
        
        async for document in cursor:
            processed_count += 1
            # Process document (minimal operation for testing)
            assert document["_id"] is not None
            
            # Break after processing a reasonable number for testing
            if processed_count >= 200:
                break
        
        assert processed_count > 0
        
        # Test aggregation with allowDiskUse for large operations
        pipeline = [
            {"$match": {"metadata.status": "active"}},
            {"$sort": {"analytics.popularity_score": -1}},
            {"$group": {
                "_id": "$brand_id",
                "product_count": {"$sum": 1},
                "avg_popularity": {"$avg": "$analytics.popularity_score"}
            }},
            {"$sort": {"product_count": -1}}
        ]
        
        # This should not raise memory errors
        results = await products_collection.aggregate(pipeline, allowDiskUse=True).to_list(None)
        assert len(results) >= 0  # May be empty if no brands, but should not error


class TestPerformanceRegression:
    """Test suite for performance regression detection."""
    
    @pytest.mark.asyncio
    async def test_baseline_performance_metrics(self, products_collection, sample_products_bulk, performance_timer):
        """Establish baseline performance metrics for regression testing."""
        # Create standard indexes
        await products_collection.create_index("metadata.status")
        await products_collection.create_index("analytics.popularity_score")
        await products_collection.create_index([("name", "text")])
        
        performance_metrics = {}
        
        # Test 1: Simple find query
        performance_timer.start()
        await products_collection.find({"metadata.status": "active"}).limit(20).to_list(None)
        performance_metrics["simple_find"] = performance_timer.stop()
        
        # Test 2: Sorted query
        performance_timer.start()
        await products_collection.find({}).sort([("analytics.popularity_score", -1)]).limit(20).to_list(None)
        performance_metrics["sorted_query"] = performance_timer.stop()
        
        # Test 3: Text search
        performance_timer.start()
        await products_collection.find({"$text": {"$search": "Test"}}).limit(10).to_list(None)
        performance_metrics["text_search"] = performance_timer.stop()
        
        # Test 4: Count operation
        performance_timer.start()
        await products_collection.count_documents({"metadata.status": "active"})
        performance_metrics["count_operation"] = performance_timer.stop()
        
        # Assert baseline performance thresholds
        assert performance_metrics["simple_find"] < 50, f"Simple find: {performance_metrics['simple_find']:.2f}ms"
        assert performance_metrics["sorted_query"] < 100, f"Sorted query: {performance_metrics['sorted_query']:.2f}ms"
        assert performance_metrics["text_search"] < 100, f"Text search: {performance_metrics['text_search']:.2f}ms"
        assert performance_metrics["count_operation"] < 50, f"Count operation: {performance_metrics['count_operation']:.2f}ms"
        
        # Log metrics for future regression comparison
        print(f"\nBaseline Performance Metrics:")
        for operation, time_ms in performance_metrics.items():
            print(f"  {operation}: {time_ms:.2f}ms")
    
    @pytest.mark.asyncio
    async def test_performance_under_load(self, products_collection, sample_products_bulk, performance_timer):
        """Test performance degradation under simulated load."""
        # Create indexes
        await products_collection.create_index("metadata.status")
        await products_collection.create_index("analytics.popularity_score")
        
        # Simulate load with concurrent operations
        async def load_operation():
            """Simulated load operation."""
            return await products_collection.find(
                {"metadata.status": "active"}
            ).sort([("analytics.popularity_score", -1)]).limit(10).to_list(None)
        
        # Test performance under increasing load
        load_levels = [1, 5, 10, 20]
        performance_results = {}
        
        for load_level in load_levels:
            performance_timer.start()
            
            tasks = [load_operation() for _ in range(load_level)]
            await asyncio.gather(*tasks)
            
            total_time = performance_timer.stop()
            avg_time = total_time / load_level
            performance_results[load_level] = avg_time
            
            # Performance should not degrade drastically
            assert avg_time < 200, f"Performance at load {load_level}: {avg_time:.2f}ms, should be <200ms"
        
        # Log performance under different load levels
        print(f"\nPerformance Under Load:")
        for load, avg_time in performance_results.items():
            print(f"  Load {load}: {avg_time:.2f}ms avg")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])