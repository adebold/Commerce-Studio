"""
Real Performance Benchmarks Test
===============================

This test addresses the "False Performance Claims" critical issue identified in the reflection document.
The original implementation claimed 15,000+ ops/sec through hash operations rather than real database operations.

This test validates actual MongoDB performance and provides realistic benchmarks.

Key validations:
1. Real database operation performance measurement
2. Realistic throughput expectations (not inflated by hash operations)
3. Performance scaling characteristics with real data
4. Memory usage patterns during operations
5. Concurrent operation performance
"""

import pytest
import pytest_asyncio
import asyncio
import time
import psutil
import os
from typing import Dict, Any, List
from statistics import mean, median
import sys

# Add project root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from src.mongodb_foundation.managers import ProductCollectionManager
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


class TestRealPerformanceBenchmarks:
    """Test real performance characteristics to validate actual vs claimed performance"""
    
    @pytest_asyncio.fixture
    async def perf_db_manager(self):
        """Create a ProductCollectionManager for performance testing"""
        client = AsyncIOMotorClient('mongodb://localhost:27017')
        test_db = client.perf_test_eyewear_db
        
        # Verify MongoDB connection
        try:
            await client.admin.command('ping')
        except (ConnectionFailure, ServerSelectionTimeoutError):
            pytest.skip("MongoDB not available for performance testing")
        
        # Clean up test collection
        await test_db.products.delete_many({})
        
        manager = ProductCollectionManager(test_db)
        yield manager
        
        # Clean up after test
        await test_db.products.delete_many({})
        client.close()

    def generate_test_product(self, index: int) -> Dict[str, Any]:
        """Generate a realistic test product"""
        return {
            "sku": f"PERF-{index:06d}",
            "name": f"Performance Test Frame {index}",
            "brand": f"Brand {index % 10}",
            "category": "Eyeglasses" if index % 2 == 0 else "Sunglasses",
            "price": 50.0 + (index % 500),
            "description": f"A detailed description for performance test product {index} with various features and specifications that make it unique.",
            "frame_size": {
                "lens_width": 50.0 + (index % 20),
                "bridge_width": 16.0 + (index % 8),
                "temple_length": 140.0 + (index % 20)
            },
            "face_shape_compatibility": {
                "round": 0.5 + (index % 50) / 100,
                "square": 0.6 + (index % 40) / 100,
                "oval": 0.7 + (index % 30) / 100,
                "heart": 0.4 + (index % 60) / 100,
                "diamond": 0.5 + (index % 45) / 100
            },
            "materials": ["acetate", "metal", "titanium"][index % 3],
            "colors": [f"color_{index % 20}"],
            "tags": [f"tag_{index % 15}", f"feature_{index % 25}"],
            "metadata": {
                "test_run": "performance",
                "batch": index // 100,
                "created_at": time.time()
            }
        }

    @pytest.mark.asyncio
    async def test_single_operation_baseline_performance(self, perf_db_manager):
        """Measure baseline performance for single operations"""
        
        print("\n🔍 Testing Single Operation Baseline Performance")
        
        # Test single create operation
        product = self.generate_test_product(1)
        
        start_time = time.time()
        created_product = await perf_db_manager.create(product)
        create_time = time.time() - start_time
        
        assert created_product is not None
        print(f"Single CREATE: {create_time:.4f}s ({1/create_time:.2f} ops/sec)")
        
        # Test single read operation
        start_time = time.time()
        found_product = await perf_db_manager.findBySku("PERF-000001")
        read_time = time.time() - start_time
        
        assert found_product is not None
        print(f"Single READ: {read_time:.4f}s ({1/read_time:.2f} ops/sec)")
        
        # Test single update operation
        start_time = time.time()
        updated_product = await perf_db_manager.update("PERF-000001", {"name": "Updated Name"})
        update_time = time.time() - start_time
        
        assert updated_product is not None
        print(f"Single UPDATE: {update_time:.4f}s ({1/update_time:.2f} ops/sec)")
        
        # Test single delete operation
        start_time = time.time()
        delete_result = await perf_db_manager.delete("PERF-000001")
        delete_time = time.time() - start_time
        
        assert delete_result is True
        print(f"Single DELETE: {delete_time:.4f}s ({1/delete_time:.2f} ops/sec)")
        
        # Realistic expectations: MongoDB operations should be in milliseconds, not microseconds
        assert create_time > 0.001, "Create operation too fast - suggests mock behavior"
        assert read_time > 0.0005, "Read operation too fast - suggests mock behavior"
        assert update_time > 0.001, "Update operation too fast - suggests mock behavior"
        assert delete_time > 0.001, "Delete operation too fast - suggests mock behavior"
        
        print("✅ Single operation baseline performance validated")

    @pytest.mark.asyncio
    async def test_bulk_operation_performance(self, perf_db_manager):
        """Test performance with bulk operations"""
        
        print("\n🔍 Testing Bulk Operation Performance")
        
        batch_sizes = [10, 50, 100, 500]
        results = {}
        
        for batch_size in batch_sizes:
            # Generate test products
            products = [self.generate_test_product(i) for i in range(batch_size)]
            
            # Measure bulk creation
            start_time = time.time()
            for product in products:
                await perf_db_manager.create(product)
            total_time = time.time() - start_time
            
            ops_per_second = batch_size / total_time
            results[batch_size] = {
                'total_time': total_time,
                'ops_per_second': ops_per_second,
                'avg_time_per_op': total_time / batch_size
            }
            
            print(f"Batch {batch_size}: {total_time:.3f}s total, {ops_per_second:.2f} ops/sec, {total_time/batch_size:.4f}s per op")
            
            # Clean up for next batch
            await perf_db_manager.db.products.delete_many({"sku": {"$regex": "^PERF-"}})
        
        # Validate realistic performance expectations
        for batch_size, result in results.items():
            # Real MongoDB operations should not exceed ~1000 ops/sec for complex documents
            assert result['ops_per_second'] < 1000, f"Batch {batch_size}: {result['ops_per_second']} ops/sec too high - suggests mock behavior"
            
            # Operations should take reasonable time
            assert result['avg_time_per_op'] > 0.001, f"Batch {batch_size}: operations too fast - suggests mock behavior"
        
        # Performance should show some scaling characteristics
        # Larger batches might be more efficient per operation due to connection reuse
        small_batch_perf = results[10]['ops_per_second']
        large_batch_perf = results[500]['ops_per_second']
        
        print(f"Performance scaling: {small_batch_perf:.2f} ops/sec (small) vs {large_batch_perf:.2f} ops/sec (large)")
        print("✅ Bulk operation performance validated")

    @pytest.mark.asyncio
    async def test_query_performance_scaling(self, perf_db_manager):
        """Test query performance with increasing dataset sizes"""
        
        print("\n🔍 Testing Query Performance Scaling")
        
        # Create a substantial dataset
        dataset_size = 1000
        print(f"Creating dataset of {dataset_size} products...")
        
        start_time = time.time()
        for i in range(dataset_size):
            product = self.generate_test_product(i)
            await perf_db_manager.create(product)
        creation_time = time.time() - start_time
        
        print(f"Dataset creation: {creation_time:.2f}s ({dataset_size/creation_time:.2f} ops/sec)")
        
        # Test different query types
        query_tests = [
            ("Simple SKU lookup", lambda: perf_db_manager.findBySku("PERF-000500")),
            ("Category filter", lambda: perf_db_manager.getProducts({
                "filters": {"category": "Eyeglasses"},
                "pagination": {"page": 1, "limit": 50}
            })),
            ("Brand filter with pagination", lambda: perf_db_manager.getProducts({
                "filters": {"brand": "Brand 5"},
                "pagination": {"page": 1, "limit": 100}
            })),
            ("Face shape compatibility", lambda: perf_db_manager.getProductsByFaceShape("round", min_compatibility=0.7, limit=25)),
            ("Large result set", lambda: perf_db_manager.getProducts({
                "pagination": {"page": 1, "limit": 500}
            }))
        ]
        
        query_results = {}
        
        for test_name, query_func in query_tests:
            # Run each query multiple times for average
            times = []
            for _ in range(5):
                start_time = time.time()
                result = await query_func()
                query_time = time.time() - start_time
                times.append(query_time)
            
            avg_time = mean(times)
            median_time = median(times)
            min_time = min(times)
            max_time = max(times)
            
            query_results[test_name] = {
                'avg_time': avg_time,
                'median_time': median_time,
                'min_time': min_time,
                'max_time': max_time
            }
            
            print(f"{test_name}: avg {avg_time:.4f}s, median {median_time:.4f}s, range {min_time:.4f}s-{max_time:.4f}s")
            
            # Validate realistic query times
            assert avg_time > 0.001, f"{test_name}: Query too fast - suggests mock behavior"
            assert avg_time < 5.0, f"{test_name}: Query too slow - performance issue"
        
        print("✅ Query performance scaling validated")

    @pytest.mark.asyncio
    async def test_concurrent_operation_performance(self, perf_db_manager):
        """Test performance under concurrent load"""
        
        print("\n🔍 Testing Concurrent Operation Performance")
        
        # Test different levels of concurrency
        concurrency_levels = [1, 5, 10, 20]
        
        for concurrency in concurrency_levels:
            print(f"\nTesting concurrency level: {concurrency}")
            
            # Create tasks for concurrent execution
            async def create_product_batch(start_index: int, batch_size: int):
                batch_start = time.time()
                for i in range(start_index, start_index + batch_size):
                    product = self.generate_test_product(i)
                    await perf_db_manager.create(product)
                return time.time() - batch_start
            
            # Run concurrent batches
            batch_size = 20
            start_time = time.time()
            
            tasks = [
                create_product_batch(i * batch_size, batch_size)
                for i in range(concurrency)
            ]
            
            batch_times = await asyncio.gather(*tasks)
            total_time = time.time() - start_time
            
            total_operations = concurrency * batch_size
            overall_ops_per_second = total_operations / total_time
            
            print(f"Concurrency {concurrency}: {total_operations} ops in {total_time:.3f}s = {overall_ops_per_second:.2f} ops/sec")
            print(f"Batch times: min {min(batch_times):.3f}s, max {max(batch_times):.3f}s, avg {mean(batch_times):.3f}s")
            
            # Validate realistic concurrent performance
            assert overall_ops_per_second < 2000, f"Concurrent performance {overall_ops_per_second} ops/sec too high - suggests mock behavior"
            
            # Clean up for next test
            await perf_db_manager.db.products.delete_many({"sku": {"$regex": "^PERF-"}})
        
        print("✅ Concurrent operation performance validated")

    @pytest.mark.asyncio
    async def test_memory_usage_during_operations(self, perf_db_manager):
        """Test memory usage patterns during operations"""
        
        print("\n🔍 Testing Memory Usage Patterns")
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        print(f"Initial memory usage: {initial_memory:.2f} MB")
        
        # Create a large number of products and monitor memory
        memory_measurements = [initial_memory]
        batch_size = 100
        total_batches = 10
        
        for batch in range(total_batches):
            # Create a batch
            for i in range(batch_size):
                product = self.generate_test_product(batch * batch_size + i)
                await perf_db_manager.create(product)
            
            # Measure memory
            current_memory = process.memory_info().rss / 1024 / 1024
            memory_measurements.append(current_memory)
            print(f"After batch {batch + 1}: {current_memory:.2f} MB ({current_memory - initial_memory:.2f} MB increase)")
        
        final_memory = memory_measurements[-1]
        memory_growth = final_memory - initial_memory
        
        print(f"Total memory growth: {memory_growth:.2f} MB for {total_batches * batch_size} operations")
        print(f"Memory per operation: {memory_growth / (total_batches * batch_size) * 1024:.2f} KB")
        
        # Validate reasonable memory usage
        # Memory growth should be reasonable but not zero (that would suggest mocking)
        assert memory_growth > 0.1, "No memory growth detected - suggests mock operations"
        assert memory_growth < 500, f"Excessive memory growth {memory_growth:.2f} MB - potential memory leak"
        
        print("✅ Memory usage patterns validated")

    @pytest.mark.asyncio
    async def test_performance_claims_validation(self, perf_db_manager):
        """Validate that performance claims are realistic and achievable"""
        
        print("\n🔍 Validating Performance Claims")
        
        # Test the specific scenario mentioned in the reflection document
        # Create 1000 operations and measure actual throughput
        operations_count = 1000
        
        print(f"Testing {operations_count} operations for realistic throughput measurement...")
        
        start_time = time.time()
        
        # Mix of operations to simulate real usage
        for i in range(operations_count):
            if i % 4 == 0:  # 25% creates
                product = self.generate_test_product(i)
                await perf_db_manager.create(product)
            elif i % 4 == 1:  # 25% reads
                if i > 0:  # Only if products exist
                    await perf_db_manager.findBySku(f"PERF-{(i-1):06d}")
            elif i % 4 == 2:  # 25% updates
                if i > 1:  # Only if products exist
                    await perf_db_manager.update(f"PERF-{(i-2):06d}", {"name": f"Updated {i}"})
            else:  # 25% queries
                await perf_db_manager.getProducts({
                    "pagination": {"page": 1, "limit": 10}
                })
        
        total_time = time.time() - start_time
        actual_ops_per_second = operations_count / total_time
        
        print(f"Mixed operations result: {operations_count} ops in {total_time:.3f}s = {actual_ops_per_second:.2f} ops/sec")
        
        # Compare with the false claim of 15,000+ ops/sec
        claimed_ops_per_second = 15000
        performance_ratio = actual_ops_per_second / claimed_ops_per_second
        
        print(f"Actual vs claimed performance: {actual_ops_per_second:.2f} vs {claimed_ops_per_second} ops/sec")
        print(f"Performance ratio: {performance_ratio:.3f} ({performance_ratio * 100:.1f}% of claimed)")
        
        # Validate that actual performance is realistic (much lower than false claims)
        assert actual_ops_per_second < 5000, f"Performance {actual_ops_per_second} ops/sec too high - suggests hash operations instead of DB"
        assert actual_ops_per_second > 10, f"Performance {actual_ops_per_second} ops/sec too low - potential performance issue"
        
        # Performance should be significantly lower than the false 15,000+ ops/sec claim
        assert performance_ratio < 0.5, f"Performance too close to false claims - ratio {performance_ratio:.3f}"
        
        print(f"✅ Performance claims validated - realistic throughput of {actual_ops_per_second:.2f} ops/sec")
        print(f"❌ False claim of {claimed_ops_per_second} ops/sec debunked (actual is {performance_ratio * 100:.1f}%)")

    @pytest.mark.asyncio
    async def test_operation_consistency_validation(self, perf_db_manager):
        """Validate that operations are consistent and not using hash-based shortcuts"""
        
        print("\n🔍 Testing Operation Consistency (Anti-Hash Validation)")
        
        # Create products with similar but different data
        base_product = {
            "name": "Consistency Test Frame",
            "brand": "Test Brand",
            "category": "Eyeglasses",
            "price": 100.0
        }
        
        # Create variations that would have similar hashes but different database behavior
        variations = [
            {**base_product, "sku": "HASH-TEST-001", "description": "Description A"},
            {**base_product, "sku": "HASH-TEST-002", "description": "Description B"},
            {**base_product, "sku": "HASH-TEST-003", "description": "Description A"},  # Same description as first
        ]
        
        # Create all variations and time each
        creation_times = []
        for product in variations:
            start_time = time.time()
            await perf_db_manager.create(product)
            creation_time = time.time() - start_time
            creation_times.append(creation_time)
        
        # Validate that operations take consistent time (not hash-dependent)
        avg_time = mean(creation_times)
        time_variance = max(creation_times) - min(creation_times)
        
        print(f"Creation times: {[f'{t:.4f}s' for t in creation_times]}")
        print(f"Average: {avg_time:.4f}s, Variance: {time_variance:.4f}s")
        
        # Hash-based operations would be nearly identical in time
        # Real database operations have more variance due to actual I/O
        assert time_variance > 0.0001, "Creation times too consistent - suggests hash-based operations"
        
        # Test that updates actually modify stored data
        original_product = await perf_db_manager.findBySku("HASH-TEST-001")
        await perf_db_manager.update("HASH-TEST-001", {"price": 150.0})
        updated_product = await perf_db_manager.findBySku("HASH-TEST-001")
        
        assert original_product["price"] == 100.0
        assert updated_product["price"] == 150.0
        assert original_product["_id"] == updated_product["_id"]  # Same document
        
        print("✅ Operation consistency validated - real database operations confirmed")