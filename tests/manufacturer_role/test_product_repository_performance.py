"""
Test suite for centralized product repository performance testing.
Addresses critical performance issues identified in reflection_LS4.md.

This test suite ensures:
1. Real MongoDB operations (not hash-based mock performance)
2. Actual database performance benchmarking
3. Industry-scale product handling validation
4. Real caching implementation testing
"""

import pytest_asyncio
import pytest
import asyncio
import time
import statistics
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import random
import string

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.repository.product_repository import ProductRepository
    from src.repository.manufacturer_product_manager import ManufacturerProductManager
    from src.search.product_search_manager import ProductSearchManager
    from src.cache.real_cache_manager import RealCacheManager
    from src.performance.performance_monitor import PerformanceMonitor
    from src.database.mongodb_client import MongoDBClient
    from src.models.product import Product, ProductDimensions, ProductCategory
    from src.models.manufacturer import Manufacturer
except ImportError as e:
    pytest.skip(f"Product repository modules not implemented: {e}", allow_module_level=True)


@dataclass
class PerformanceMetrics:
    """Performance metrics for repository operations"""
    operation_name: str
    total_time: float
    operations_per_second: float
    average_time_per_operation: float
    min_time: float
    max_time: float
    p95_time: float
    p99_time: float
    memory_usage_mb: float
    success_rate: float


@dataclass
class BulkUploadResult:
    """Result of bulk product upload operation"""
    successful: List[str]
    failed: List[Dict[str, Any]]
    total_time: float
    products_per_second: float


@pytest_asyncio.fixture
async def mongodb_test_container():
    """
    Real MongoDB test container - NO MOCKS
    This fixture will fail until real MongoDB container implementation exists (RED PHASE)
    """
    from testcontainers.mongodb import MongoDbContainer
    
    # Start real MongoDB container
    mongodb_container = MongoDbContainer("mongo:7.0")
    mongodb_container.start()
    
    # Wait for container to be ready
    await asyncio.sleep(2)
    
    yield mongodb_container
    
    # Cleanup
    mongodb_container.stop()


@pytest_asyncio.fixture
async def real_mongodb_client(mongodb_test_container):
    """
    Real MongoDB client connected to test container - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    connection_string = mongodb_test_container.get_connection_url()
    client = MongoDBClient(connection_string)
    await client.connect()
    
    # Initialize database and collections
    await client.initialize_manufacturer_collections()
    
    yield client
    
    # Cleanup
    await client.disconnect()


@pytest_asyncio.fixture
async def real_product_manager(real_mongodb_client):
    """
    Real ManufacturerProductManager with actual MongoDB operations - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    manager = ManufacturerProductManager(real_mongodb_client)
    await manager.initialize()
    return manager


@pytest_asyncio.fixture
async def real_search_manager(real_mongodb_client):
    """
    Real ProductSearchManager with actual search indexing - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    search_manager = ProductSearchManager(real_mongodb_client)
    await search_manager.initialize_search_indexes()
    return search_manager


@pytest_asyncio.fixture
async def real_cache_manager():
    """
    Real CacheManager with actual Redis/memory caching - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    cache_manager = RealCacheManager(
        backend="redis",  # Use real Redis for testing
        connection_string="redis://localhost:6379/0"
    )
    await cache_manager.initialize()
    
    yield cache_manager
    
    # Cleanup
    await cache_manager.flush_all()
    await cache_manager.disconnect()


@pytest_asyncio.fixture
async def performance_monitor():
    """
    Real PerformanceMonitor for actual timing measurements - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    monitor = PerformanceMonitor()
    await monitor.initialize()
    return monitor


class TestProductRepositoryPerformance:
    """Test suite for real database performance benchmarking"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_real_product_upload_performance(self, real_product_manager, performance_monitor):
        """
        Test real product upload performance with MongoDB operations.
        
        This test addresses Issue 3 from reflection_LS4.md:
        - Real database operations (not hash-based performance)
        - Actual MongoDB write performance
        - Industry-scale product handling
        """
        manufacturer_id = "mfg_perf_test_001"
        
        # Create test manufacturer first
        manufacturer_data = {
            "company_name": "Performance Test Eyewear Co",
            "email": "perf@test.com",
            "tier": "paid",
            "business_license": "BL123456789"
        }
        
        await real_product_manager.create_manufacturer(manufacturer_id, manufacturer_data)
        
        # Generate realistic product data for performance testing
        products = []
        for i in range(1000):  # Test with 1000 products
            products.append({
                "sku": f"PERF-TEST-{i:06d}",
                "name": f"Performance Test Product {i}",
                "brand": f"Test Brand {i % 10}",  # 10 different brands
                "manufacturer_id": manufacturer_id,
                "price": round(50.0 + (i * 0.1), 2),
                "description": f"Performance test product description for item {i}. " * 3,  # Realistic length
                "category": random.choice(["sunglasses", "eyeglasses", "reading_glasses", "safety_glasses"]),
                "frame_material": random.choice(["acetate", "metal", "titanium", "plastic", "wood"]),
                "lens_material": random.choice(["polycarbonate", "glass", "plastic", "trivex"]),
                "dimensions": {
                    "lens_width": 50 + (i % 15),
                    "bridge_width": 16 + (i % 8),
                    "temple_length": 135 + (i % 20),
                    "frame_width": 125 + (i % 25),
                    "frame_height": 35 + (i % 15)
                },
                "colors": [
                    f"color_{j}" for j in range(random.randint(1, 5))
                ],
                "tags": [
                    f"tag_{j}" for j in range(random.randint(3, 8))
                ],
                "metadata": {
                    "weight": round(20.0 + (i * 0.01), 2),
                    "country_of_origin": random.choice(["US", "IT", "CN", "JP", "DE"]),
                    "warranty_months": random.choice([12, 24, 36])
                }
            })
        
        # Test bulk upload performance with real MongoDB operations
        start_time = time.perf_counter()
        memory_before = await performance_monitor.get_memory_usage()
        
        results = await real_product_manager.bulk_upload_products(products)
        
        end_time = time.perf_counter()
        memory_after = await performance_monitor.get_memory_usage()
        
        upload_time = end_time - start_time
        products_per_second = len(products) / upload_time
        memory_used = memory_after - memory_before
        
        # Performance assertions for real database operations
        assert upload_time < 30.0, f"Bulk upload took {upload_time:.2f}s, expected < 30s for 1000 products"
        assert products_per_second > 30, f"Upload rate {products_per_second:.2f} products/s, expected > 30/s"
        assert memory_used < 100, f"Memory usage {memory_used:.2f}MB too high, expected < 100MB"
        
        # Verify all products were uploaded successfully
        assert len(results.successful) == len(products), f"Only {len(results.successful)}/{len(products)} uploaded successfully"
        assert len(results.failed) == 0, f"Failed uploads: {results.failed}"
        
        # Verify database state with real query
        total_products = await real_product_manager.count_products_by_manufacturer(manufacturer_id)
        assert total_products >= len(products), f"Database count {total_products} < uploaded count {len(products)}"
        
        # Test individual product retrieval performance
        sample_skus = [products[i]["sku"] for i in range(0, len(products), 100)]  # Sample every 100th product
        
        retrieval_times = []
        for sku in sample_skus:
            start_time = time.perf_counter()
            product = await real_product_manager.get_product_by_sku(sku, manufacturer_id)
            retrieval_time = time.perf_counter() - start_time
            retrieval_times.append(retrieval_time)
            
            assert product is not None, f"Product with SKU {sku} not found"
            assert product.sku == sku
        
        # Performance assertions for retrieval
        avg_retrieval_time = statistics.mean(retrieval_times)
        max_retrieval_time = max(retrieval_times)
        
        assert avg_retrieval_time < 0.01, f"Average retrieval time {avg_retrieval_time:.4f}s too slow"
        assert max_retrieval_time < 0.05, f"Max retrieval time {max_retrieval_time:.4f}s too slow"
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_real_product_search_performance(self, real_search_manager, real_product_manager):
        """
        Test real product search performance with complex queries.
        
        This test ensures:
        - Real MongoDB text search performance
        - Complex aggregation query performance
        - Search index effectiveness
        """
        manufacturer_id = "mfg_search_test_001"
        
        # Setup: Create manufacturer and searchable products
        await self._setup_search_test_data(real_product_manager, manufacturer_id)
        
        # Test simple text search performance
        search_queries = [
            "sunglasses",
            "acetate frame",
            "polarized lens",
            "aviator style",
            "titanium lightweight"
        ]
        
        simple_search_times = []
        for query in search_queries:
            start_time = time.perf_counter()
            results = await real_search_manager.search_products(
                query=query,
                manufacturer_id=manufacturer_id
            )
            search_time = time.perf_counter() - start_time
            simple_search_times.append(search_time)
            
            assert len(results) > 0, f"No results for query: {query}"
            assert search_time < 0.1, f"Simple search for '{query}' took {search_time:.3f}s, expected < 0.1s"
        
        avg_simple_search_time = statistics.mean(simple_search_times)
        assert avg_simple_search_time < 0.05, f"Average simple search time {avg_simple_search_time:.3f}s too slow"
        
        # Test complex search with filters and aggregations
        complex_queries = [
            {
                "query": "acetate sunglasses",
                "filters": {
                    "price_range": {"min": 50, "max": 200},
                    "frame_material": "acetate",
                    "lens_width_range": {"min": 50, "max": 60}
                },
                "sort_by": "price",
                "sort_order": "asc",
                "limit": 50
            },
            {
                "query": "titanium eyeglasses",
                "filters": {
                    "frame_material": "titanium",
                    "category": "eyeglasses",
                    "colors": ["black", "silver"]
                },
                "sort_by": "popularity",
                "sort_order": "desc",
                "limit": 25
            }
        ]
        
        complex_search_times = []
        for query_params in complex_queries:
            start_time = time.perf_counter()
            results = await real_search_manager.search_products(
                query=query_params["query"],
                filters=query_params["filters"],
                manufacturer_id=manufacturer_id,
                sort_by=query_params["sort_by"],
                sort_order=query_params["sort_order"],
                limit=query_params["limit"]
            )
            search_time = time.perf_counter() - start_time
            complex_search_times.append(search_time)
            
            assert len(results) > 0, f"No results for complex query: {query_params['query']}"
            assert search_time < 0.2, f"Complex search took {search_time:.3f}s, expected < 0.2s"
        
        # Test search with aggregations (faceted search)
        start_time = time.perf_counter()
        aggregated_results = await real_search_manager.search_with_aggregations(
            query="eyeglasses",
            aggregations=["brand", "frame_material", "price_range", "category"],
            manufacturer_id=manufacturer_id
        )
        aggregation_time = time.perf_counter() - start_time
        
        assert aggregation_time < 0.3, f"Aggregated search took {aggregation_time:.3f}s, expected < 0.3s"
        assert "aggregations" in aggregated_results
        assert "products" in aggregated_results
        assert len(aggregated_results["products"]) > 0
        
        # Verify aggregation structure
        aggregations = aggregated_results["aggregations"]
        assert "brand" in aggregations
        assert "frame_material" in aggregations
        assert "price_range" in aggregations
        assert len(aggregations["brand"]) > 0
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_real_caching_performance(self, real_cache_manager):
        """
        Test real caching implementation performance.
        
        This test addresses Issue 2 from reflection_LS4.md:
        - Real caching operations (not mock)
        - Actual cache hit/miss performance
        - Memory usage validation
        """
        # Test cache miss performance
        cache_keys = [f"manufacturer:mfg_001:products:page_{i}" for i in range(100)]
        
        cache_miss_times = []
        for key in cache_keys:
            start_time = time.perf_counter()
            result = await real_cache_manager.get(key)
            miss_time = time.perf_counter() - start_time
            cache_miss_times.append(miss_time)
            
            assert result is None, f"Cache should be empty for key: {key}"
        
        avg_miss_time = statistics.mean(cache_miss_times)
        max_miss_time = max(cache_miss_times)
        
        assert avg_miss_time < 0.001, f"Average cache miss time {avg_miss_time:.4f}s too slow"
        assert max_miss_time < 0.005, f"Max cache miss time {max_miss_time:.4f}s too slow"
        
        # Test cache set performance with realistic data
        test_products = [
            {
                "id": f"prod_{i}",
                "name": f"Product {i}",
                "price": 99.99 + i,
                "description": f"Product description {i}" * 10,  # Realistic size
                "metadata": {"weight": 25.5, "dimensions": {"width": 52, "height": 40}}
            }
            for i in range(100)
        ]
        
        cache_set_times = []
        for i, key in enumerate(cache_keys):
            start_time = time.perf_counter()
            await real_cache_manager.set(key, test_products[i], ttl=300)
            set_time = time.perf_counter() - start_time
            cache_set_times.append(set_time)
        
        avg_set_time = statistics.mean(cache_set_times)
        max_set_time = max(cache_set_times)
        
        assert avg_set_time < 0.01, f"Average cache set time {avg_set_time:.4f}s too slow"
        assert max_set_time < 0.05, f"Max cache set time {max_set_time:.4f}s too slow"
        
        # Test cache hit performance
        cache_hit_times = []
        for i, key in enumerate(cache_keys):
            start_time = time.perf_counter()
            result = await real_cache_manager.get(key)
            hit_time = time.perf_counter() - start_time
            cache_hit_times.append(hit_time)
            
            assert result is not None, f"Cache hit failed for key: {key}"
            assert result == test_products[i], f"Cache data mismatch for key: {key}"
        
        avg_hit_time = statistics.mean(cache_hit_times)
        max_hit_time = max(cache_hit_times)
        
        assert avg_hit_time < 0.001, f"Average cache hit time {avg_hit_time:.4f}s too slow"
        assert max_hit_time < 0.005, f"Max cache hit time {max_hit_time:.4f}s too slow"
        
        # Test cache invalidation performance
        invalidation_patterns = [
            "manufacturer:mfg_001:*",
            "manufacturer:*:products:*",
            "manufacturer:mfg_001:products:page_*"
        ]
        
        for pattern in invalidation_patterns:
            start_time = time.perf_counter()
            invalidated_count = await real_cache_manager.invalidate_pattern(pattern)
            invalidation_time = time.perf_counter() - start_time
            
            assert invalidation_time < 0.1, f"Cache invalidation for '{pattern}' took {invalidation_time:.4f}s"
            assert invalidated_count > 0, f"No keys invalidated for pattern: {pattern}"
        
        # Verify invalidation worked
        for key in cache_keys[:10]:  # Check first 10 keys
            result = await real_cache_manager.get(key)
            assert result is None, f"Cache key {key} should be invalidated"
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_concurrent_operations_performance(self, real_product_manager, real_search_manager):
        """
        Test performance under concurrent load.
        
        This test ensures:
        - Database connection pooling effectiveness
        - Concurrent operation handling
        - Resource contention management
        """
        manufacturer_id = "mfg_concurrent_test_001"
        
        # Setup manufacturer
        await real_product_manager.create_manufacturer(manufacturer_id, {
            "company_name": "Concurrent Test Co",
            "email": "concurrent@test.com",
            "tier": "paid"
        })
        
        # Test concurrent product uploads
        async def upload_batch(batch_id: int, batch_size: int = 50):
            products = []
            for i in range(batch_size):
                products.append({
                    "sku": f"CONCURRENT-{batch_id:03d}-{i:03d}",
                    "name": f"Concurrent Product {batch_id}-{i}",
                    "manufacturer_id": manufacturer_id,
                    "price": 99.99 + i,
                    "category": "sunglasses"
                })
            
            start_time = time.perf_counter()
            result = await real_product_manager.bulk_upload_products(products)
            upload_time = time.perf_counter() - start_time
            
            return {
                "batch_id": batch_id,
                "upload_time": upload_time,
                "success_count": len(result.successful),
                "products_per_second": len(products) / upload_time
            }
        
        # Run 10 concurrent upload batches
        concurrent_tasks = [upload_batch(i) for i in range(10)]
        
        start_time = time.perf_counter()
        batch_results = await asyncio.gather(*concurrent_tasks)
        total_concurrent_time = time.perf_counter() - start_time
        
        # Analyze concurrent performance
        total_products = sum(result["success_count"] for result in batch_results)
        overall_products_per_second = total_products / total_concurrent_time
        
        assert total_products == 500, f"Expected 500 products, got {total_products}"
        assert overall_products_per_second > 50, f"Concurrent upload rate {overall_products_per_second:.2f} too slow"
        assert total_concurrent_time < 20, f"Concurrent uploads took {total_concurrent_time:.2f}s, expected < 20s"
        
        # Test concurrent search operations
        async def search_batch(query: str, batch_id: int):
            search_times = []
            for i in range(20):  # 20 searches per batch
                start_time = time.perf_counter()
                results = await real_search_manager.search_products(
                    query=f"{query} {i}",
                    manufacturer_id=manufacturer_id
                )
                search_time = time.perf_counter() - start_time
                search_times.append(search_time)
            
            return {
                "batch_id": batch_id,
                "avg_search_time": statistics.mean(search_times),
                "max_search_time": max(search_times),
                "total_searches": len(search_times)
            }
        
        # Run concurrent search batches
        search_queries = ["sunglasses", "eyeglasses", "frames", "lenses", "accessories"]
        search_tasks = [search_batch(query, i) for i, query in enumerate(search_queries)]
        
        search_results = await asyncio.gather(*search_tasks)
        
        # Analyze concurrent search performance
        for result in search_results:
            assert result["avg_search_time"] < 0.1, f"Batch {result['batch_id']} avg search time too slow"
            assert result["max_search_time"] < 0.5, f"Batch {result['batch_id']} max search time too slow"
    
    async def _setup_search_test_data(self, product_manager, manufacturer_id: str):
        """Setup test data for search performance testing"""
        # Create manufacturer
        await product_manager.create_manufacturer(manufacturer_id, {
            "company_name": "Search Test Eyewear Co",
            "email": "search@test.com",
            "tier": "paid"
        })
        
        # Create diverse product portfolio for search testing
        search_products = []
        
        # Sunglasses products
        for i in range(100):
            search_products.append({
                "sku": f"SUN-{i:04d}",
                "name": f"Sunglasses Model {i}",
                "category": "sunglasses",
                "frame_material": random.choice(["acetate", "metal", "titanium"]),
                "lens_material": "polycarbonate",
                "manufacturer_id": manufacturer_id,
                "price": 80 + (i * 2),
                "description": f"Premium sunglasses with {random.choice(['polarized', 'photochromic', 'mirrored'])} lenses",
                "tags": ["sunglasses", "uv-protection", random.choice(["sport", "fashion", "classic"])]
            })
        
        # Eyeglasses products
        for i in range(100):
            search_products.append({
                "sku": f"EYE-{i:04d}",
                "name": f"Eyeglasses Frame {i}",
                "category": "eyeglasses",
                "frame_material": random.choice(["acetate", "titanium", "plastic"]),
                "lens_material": "glass",
                "manufacturer_id": manufacturer_id,
                "price": 120 + (i * 1.5),
                "description": f"Professional eyeglasses frame with {random.choice(['anti-reflective', 'blue-light', 'progressive'])} coating",
                "tags": ["eyeglasses", "prescription", random.choice(["business", "casual", "designer"])]
            })
        
        # Upload all search test products
        await product_manager.bulk_upload_products(search_products)


class TestProductRepositoryScalability:
    """Test suite for industry-scale product repository scalability"""
    
    @pytest.mark.performance
    @pytest.mark.slow
    @pytest.mark.asyncio
    async def test_large_scale_product_handling(self, real_product_manager):
        """
        Test handling of industry-scale product catalogs (10,000+ products).
        
        This test validates:
        - Large dataset performance
        - Memory efficiency at scale
        - Database indexing effectiveness
        """
        manufacturer_id = "mfg_scale_test_001"
        
        # Create manufacturer
        await real_product_manager.create_manufacturer(manufacturer_id, {
            "company_name": "Large Scale Eyewear Corp",
            "email": "scale@test.com",
            "tier": "enterprise"
        })
        
        # Generate 10,000 products in batches
        batch_size = 1000
        total_products = 10000
        batches = total_products // batch_size
        
        upload_times = []
        memory_usage = []
        
        for batch_num in range(batches):
            # Generate batch of products
            products = []
            for i in range(batch_size):
                product_id = (batch_num * batch_size) + i
                products.append({
                    "sku": f"SCALE-{product_id:06d}",
                    "name": f"Scale Test Product {product_id}",
                    "manufacturer_id": manufacturer_id,
                    "price": 50 + (product_id * 0.01),
                    "category": random.choice(["sunglasses", "eyeglasses", "reading_glasses"]),
                    "frame_material": random.choice(["acetate", "metal", "titanium", "plastic"]),
                    "brand": f"Brand {product_id % 50}",  # 50 different brands
                    "description": f"Scale test product {product_id} with detailed description " * 5
                })
            
            # Upload batch and measure performance
            start_time = time.perf_counter()
            result = await real_product_manager.bulk_upload_products(products)
            upload_time = time.perf_counter() - start_time
            
            upload_times.append(upload_time)
            
            # Verify batch success
            assert len(result.successful) == batch_size, f"Batch {batch_num} upload failed"
            
            # Check that performance doesn't degrade significantly
            if batch_num > 0:
                performance_degradation = upload_time / upload_times[0]
                assert performance_degradation < 2.0, f"Performance degraded {performance_degradation:.2f}x at batch {batch_num}"
        
        # Verify total product count
        total_count = await real_product_manager.count_products_by_manufacturer(manufacturer_id)
        assert total_count == total_products, f"Expected {total_products}, got {total_count}"
        
        # Test search performance at scale
        search_start = time.perf_counter()
        search_results = await real_product_manager.search_products(
            manufacturer_id=manufacturer_id,
            query="Scale Test",
            limit=100
        )
        search_time = time.perf_counter() - search_start
        
        assert len(search_results) == 100, "Search should return 100 results"
        assert search_time < 0.5, f"Search at scale took {search_time:.3f}s, expected < 0.5s"


if __name__ == "__main__":
    # Run performance tests with verbose output
    pytest.main([__file__, "-v", "--tb=short", "-m", "performance"])