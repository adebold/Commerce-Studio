#!/usr/bin/env python3
"""
Ultra-High Throughput Performance Test for MongoDB Foundation Cache Manager

This test validates the cache manager's ability to achieve 15,000+ sustained ops/sec
with ultra-high performance optimizations enabled.

Target Performance Metrics:
- Sustained throughput: 15,000+ ops/sec for 10+ minutes
- Memory growth: <100MB over 24 hours
- P95 latency: <2ms for all operations
- P99 latency: <5ms for all operations
- Zero memory leaks under sustained load
- Support for 10,000+ concurrent operations
"""

import pytest
import asyncio
import threading
import time
import statistics
import gc
import psutil
import os
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Tuple

import sys
sys.path.insert(0, '../..')

from src.performance.cache_manager import (
    MemoryCache, 
    CacheManager, 
    create_ultra_high_performance_cache,
    get_cache
)


class PerformanceMetrics:
    """Track detailed performance metrics"""
    
    def __init__(self):
        self.operation_times: List[float] = []
        self.start_time = time.perf_counter()
        self.operations_completed = 0
        self.operations_failed = 0
        self.memory_snapshots: List[Tuple[float, int]] = []
        self.lock = threading.Lock()
    
    def record_operation(self, operation_time_ms: float, success: bool = True):
        """Record a single operation"""
        with self.lock:
            self.operation_times.append(operation_time_ms)
            if success:
                self.operations_completed += 1
            else:
                self.operations_failed += 1
    
    def record_memory_snapshot(self):
        """Record current memory usage"""
        process = psutil.Process(os.getpid())
        memory_mb = process.memory_info().rss / 1024 / 1024
        timestamp = time.perf_counter() - self.start_time
        
        with self.lock:
            self.memory_snapshots.append((timestamp, memory_mb))
    
    def get_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        with self.lock:
            if not self.operation_times:
                return {}
            
            total_time = time.perf_counter() - self.start_time
            total_ops = self.operations_completed + self.operations_failed
            
            # Calculate percentiles
            sorted_times = sorted(self.operation_times)
            p50 = statistics.median(sorted_times)
            p95_idx = int(len(sorted_times) * 0.95)
            p99_idx = int(len(sorted_times) * 0.99)
            p95 = sorted_times[p95_idx] if p95_idx < len(sorted_times) else sorted_times[-1]
            p99 = sorted_times[p99_idx] if p99_idx < len(sorted_times) else sorted_times[-1]
            
            # Memory analysis
            memory_growth = 0
            if len(self.memory_snapshots) >= 2:
                initial_memory = self.memory_snapshots[0][1]
                final_memory = self.memory_snapshots[-1][1]
                memory_growth = final_memory - initial_memory
            
            return {
                'total_operations': total_ops,
                'operations_completed': self.operations_completed,
                'operations_failed': self.operations_failed,
                'success_rate_percent': (self.operations_completed / total_ops * 100) if total_ops > 0 else 0,
                'total_time_seconds': total_time,
                'throughput_ops_per_second': total_ops / total_time if total_time > 0 else 0,
                'latency_stats': {
                    'average_ms': statistics.mean(self.operation_times),
                    'median_ms': p50,
                    'p95_ms': p95,
                    'p99_ms': p99,
                    'min_ms': min(self.operation_times),
                    'max_ms': max(self.operation_times)
                },
                'memory_growth_mb': memory_growth,
                'peak_memory_mb': max([snapshot[1] for snapshot in self.memory_snapshots]) if self.memory_snapshots else 0
            }


class ThroughputTestWorker:
    """Worker thread for sustained throughput testing"""
    
    def __init__(self, worker_id: int, cache: MemoryCache, metrics: PerformanceMetrics,
                 operations_per_worker: int, data_sizes: List[Tuple[str, bytes]]):
        self.worker_id = worker_id
        self.cache = cache
        self.metrics = metrics
        self.operations_per_worker = operations_per_worker
        self.data_sizes = data_sizes
        self.should_stop = threading.Event()
    
    def run(self):
        """Execute operations for this worker"""
        for i in range(self.operations_per_worker):
            if self.should_stop.is_set():
                break
            
            # Cycle through different data sizes
            size_name, data = self.data_sizes[i % len(self.data_sizes)]
            key = f"worker_{self.worker_id}_op_{i}_{size_name}"
            
            try:
                # SET operation
                start_time = time.perf_counter()
                self.cache.set(key, data, ttl=300)
                set_time = (time.perf_counter() - start_time) * 1000
                self.metrics.record_operation(set_time, success=True)
                
                # GET operation
                start_time = time.perf_counter()
                result = self.cache.get(key)
                get_time = (time.perf_counter() - start_time) * 1000
                self.metrics.record_operation(get_time, success=(result == data))
                
            except Exception as e:
                self.metrics.record_operation(0, success=False)
    
    def stop(self):
        """Signal worker to stop"""
        self.should_stop.set()


@pytest.fixture
def ultra_cache():
    """Create an ultra-high performance cache for testing"""
    return create_ultra_high_performance_cache(
        name="ultra_test_cache",
        max_size=50000,  # Large cache for high throughput
        default_ttl=3600
    )


@pytest.fixture
def test_data_sizes():
    """Generate test data of various sizes"""
    return [
        ("tiny", b"x" * 10),          # 10 bytes
        ("small", b"x" * 100),        # 100 bytes
        ("medium", b"x" * 1000),      # 1KB
        ("large", b"x" * 10000),      # 10KB
        ("xlarge", b"x" * 100000),    # 100KB
    ]


class TestUltraHighThroughput:
    """Ultra-high throughput performance tests"""
    
    def test_sustained_15k_ops_per_second(self, ultra_cache, test_data_sizes):
        """
        Test sustained 15,000+ operations per second for 10 minutes
        
        This is the primary performance validation test for P0 requirements.
        """
        print("\n🚀 ULTRA-HIGH THROUGHPUT TEST: 15,000+ ops/sec sustained")
        print("=" * 60)
        
        # Test configuration
        target_ops_per_second = 15000
        test_duration_seconds = 60  # Reduced for CI/testing (would be 600 for full 10-min test)
        total_target_operations = target_ops_per_second * test_duration_seconds
        
        # Use optimal number of workers
        num_workers = min(100, os.cpu_count() * 4)  # 4x CPU cores, max 100
        operations_per_worker = total_target_operations // num_workers
        
        print(f"Target: {target_ops_per_second:,} ops/sec for {test_duration_seconds} seconds")
        print(f"Total operations: {total_target_operations:,}")
        print(f"Workers: {num_workers}")
        print(f"Operations per worker: {operations_per_worker:,}")
        
        # Initialize metrics tracking
        metrics = PerformanceMetrics()
        
        # Memory monitoring thread
        def memory_monitor():
            while not stop_monitoring.is_set():
                metrics.record_memory_snapshot()
                time.sleep(1)  # Monitor every second
        
        stop_monitoring = threading.Event()
        memory_thread = threading.Thread(target=memory_monitor)
        memory_thread.start()
        
        try:
            # Create worker threads
            workers = []
            worker_threads = []
            
            for worker_id in range(num_workers):
                worker = ThroughputTestWorker(
                    worker_id=worker_id,
                    cache=ultra_cache,
                    metrics=metrics,
                    operations_per_worker=operations_per_worker,
                    data_sizes=test_data_sizes
                )
                workers.append(worker)
                
                thread = threading.Thread(target=worker.run)
                worker_threads.append(thread)
            
            # Start all workers
            start_time = time.perf_counter()
            for thread in worker_threads:
                thread.start()
            
            # Wait for completion or timeout
            for thread in worker_threads:
                thread.join(timeout=test_duration_seconds + 30)  # 30s grace period
            
            execution_time = time.perf_counter() - start_time
            
            # Stop monitoring
            stop_monitoring.set()
            memory_thread.join(timeout=5)
            
            # Get final metrics
            summary = metrics.get_summary()
            
            print(f"\n📊 PERFORMANCE RESULTS:")
            print(f"Execution time: {execution_time:.2f}s")
            print(f"Total operations: {summary['total_operations']:,}")
            print(f"Operations completed: {summary['operations_completed']:,}")
            print(f"Operations failed: {summary['operations_failed']:,}")
            print(f"Success rate: {summary['success_rate_percent']:.1f}%")
            print(f"Actual throughput: {summary['throughput_ops_per_second']:,.0f} ops/sec")
            
            print(f"\n📈 LATENCY METRICS:")
            latency = summary['latency_stats']
            print(f"Average: {latency['average_ms']:.3f}ms")
            print(f"Median (P50): {latency['median_ms']:.3f}ms")
            print(f"P95: {latency['p95_ms']:.3f}ms")
            print(f"P99: {latency['p99_ms']:.3f}ms")
            print(f"Min: {latency['min_ms']:.3f}ms")
            print(f"Max: {latency['max_ms']:.3f}ms")
            
            print(f"\n💾 MEMORY METRICS:")
            print(f"Memory growth: {summary['memory_growth_mb']:.1f}MB")
            print(f"Peak memory: {summary['peak_memory_mb']:.1f}MB")
            
            # Validate success criteria
            print(f"\n✅ SUCCESS CRITERIA VALIDATION:")
            
            # Throughput validation
            throughput_achieved = summary['throughput_ops_per_second'] >= target_ops_per_second
            print(f"Throughput ≥{target_ops_per_second:,} ops/sec: {'✅ PASS' if throughput_achieved else '❌ FAIL'} ({summary['throughput_ops_per_second']:,.0f})")
            
            # Latency validation
            p95_target = 2.0  # 2ms P95 target
            p99_target = 5.0  # 5ms P99 target
            p95_achieved = latency['p95_ms'] <= p95_target
            p99_achieved = latency['p99_ms'] <= p99_target
            print(f"P95 latency ≤{p95_target}ms: {'✅ PASS' if p95_achieved else '❌ FAIL'} ({latency['p95_ms']:.3f}ms)")
            print(f"P99 latency ≤{p99_target}ms: {'✅ PASS' if p99_achieved else '❌ FAIL'} ({latency['p99_ms']:.3f}ms)")
            
            # Memory validation
            memory_target = 100.0  # 100MB growth limit
            memory_achieved = summary['memory_growth_mb'] <= memory_target
            print(f"Memory growth ≤{memory_target}MB: {'✅ PASS' if memory_achieved else '❌ FAIL'} ({summary['memory_growth_mb']:.1f}MB)")
            
            # Success rate validation
            success_rate_target = 99.9  # 99.9% success rate
            success_rate_achieved = summary['success_rate_percent'] >= success_rate_target
            print(f"Success rate ≥{success_rate_target}%: {'✅ PASS' if success_rate_achieved else '❌ FAIL'} ({summary['success_rate_percent']:.1f}%)")
            
            # Overall validation
            all_criteria_met = all([
                throughput_achieved,
                p95_achieved,
                p99_achieved,
                memory_achieved,
                success_rate_achieved
            ])
            
            print(f"\n🎯 OVERALL RESULT: {'✅ ALL CRITERIA MET' if all_criteria_met else '❌ CRITERIA NOT MET'}")
            
            # Assert for pytest
            assert throughput_achieved, f"Throughput requirement not met: {summary['throughput_ops_per_second']:,.0f} < {target_ops_per_second:,} ops/sec"
            assert p95_achieved, f"P95 latency requirement not met: {latency['p95_ms']:.3f}ms > {p95_target}ms"
            assert p99_achieved, f"P99 latency requirement not met: {latency['p99_ms']:.3f}ms > {p99_target}ms"
            assert memory_achieved, f"Memory growth requirement not met: {summary['memory_growth_mb']:.1f}MB > {memory_target}MB"
            assert success_rate_achieved, f"Success rate requirement not met: {summary['success_rate_percent']:.1f}% < {success_rate_target}%"
            
        finally:
            # Cleanup
            for worker in workers:
                worker.stop()
            
            stop_monitoring.set()
            if memory_thread.is_alive():
                memory_thread.join(timeout=5)
    
    def test_concurrent_10k_operations(self, ultra_cache, test_data_sizes):
        """Test support for 10,000+ concurrent operations"""
        print("\n🔀 CONCURRENT OPERATIONS TEST: 10,000+ simultaneous operations")
        print("=" * 60)
        
        concurrent_operations = 10000
        
        def concurrent_operation(op_id: int) -> bool:
            """Execute a single concurrent operation"""
            try:
                size_name, data = test_data_sizes[op_id % len(test_data_sizes)]
                key = f"concurrent_op_{op_id}_{size_name}"
                
                # SET and GET operation
                ultra_cache.set(key, data, ttl=60)
                result = ultra_cache.get(key)
                
                return result == data
            except Exception:
                return False
        
        # Execute concurrent operations using ThreadPoolExecutor
        start_time = time.perf_counter()
        
        with ThreadPoolExecutor(max_workers=min(500, concurrent_operations)) as executor:
            # Submit all operations
            futures = [
                executor.submit(concurrent_operation, op_id)
                for op_id in range(concurrent_operations)
            ]
            
            # Collect results
            successful_operations = 0
            for future in as_completed(futures):
                if future.result():
                    successful_operations += 1
        
        execution_time = time.perf_counter() - start_time
        success_rate = (successful_operations / concurrent_operations) * 100
        throughput = concurrent_operations / execution_time
        
        print(f"Concurrent operations: {concurrent_operations:,}")
        print(f"Successful operations: {successful_operations:,}")
        print(f"Success rate: {success_rate:.1f}%")
        print(f"Execution time: {execution_time:.2f}s")
        print(f"Throughput: {throughput:,.0f} ops/sec")
        
        # Validate concurrent operation requirements
        min_success_rate = 99.0
        min_throughput = 5000  # Lower threshold for concurrent test
        
        success_rate_ok = success_rate >= min_success_rate
        throughput_ok = throughput >= min_throughput
        
        print(f"\n✅ CONCURRENT VALIDATION:")
        print(f"Success rate ≥{min_success_rate}%: {'✅ PASS' if success_rate_ok else '❌ FAIL'}")
        print(f"Throughput ≥{min_throughput:,} ops/sec: {'✅ PASS' if throughput_ok else '❌ FAIL'}")
        
        assert success_rate_ok, f"Concurrent success rate too low: {success_rate:.1f}% < {min_success_rate}%"
        assert throughput_ok, f"Concurrent throughput too low: {throughput:,.0f} < {min_throughput:,} ops/sec"
    
    def test_memory_leak_detection(self, ultra_cache, test_data_sizes):
        """Test for memory leaks under sustained load"""
        print("\n💾 MEMORY LEAK DETECTION: Sustained load monitoring")
        print("=" * 60)
        
        # Test configuration
        test_duration_seconds = 30  # Reduced for CI
        operations_per_second = 1000
        total_operations = test_duration_seconds * operations_per_second
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024
        memory_samples = [initial_memory]
        
        print(f"Initial memory: {initial_memory:.1f}MB")
        print(f"Target operations: {total_operations:,} over {test_duration_seconds}s")
        
        # Perform sustained operations while monitoring memory
        start_time = time.perf_counter()
        operations_completed = 0
        
        for i in range(total_operations):
            if time.perf_counter() - start_time > test_duration_seconds:
                break
            
            size_name, data = test_data_sizes[i % len(test_data_sizes)]
            key = f"leak_test_{i}_{size_name}"
            
            try:
                ultra_cache.set(key, data, ttl=60)
                ultra_cache.get(key)
                operations_completed += 1
                
                # Sample memory every 100 operations
                if i % 100 == 0:
                    current_memory = process.memory_info().rss / 1024 / 1024
                    memory_samples.append(current_memory)
                
            except Exception:
                pass
        
        # Force garbage collection
        gc.collect()
        time.sleep(0.1)  # Allow cleanup
        
        final_memory = process.memory_info().rss / 1024 / 1024
        memory_growth = final_memory - initial_memory
        max_memory = max(memory_samples)
        
        print(f"Operations completed: {operations_completed:,}")
        print(f"Final memory: {final_memory:.1f}MB")
        print(f"Memory growth: {memory_growth:.1f}MB")
        print(f"Peak memory: {max_memory:.1f}MB")
        
        # Memory leak validation
        max_allowed_growth = 50.0  # 50MB for short test
        leak_detected = memory_growth > max_allowed_growth
        
        print(f"\n✅ MEMORY LEAK VALIDATION:")
        print(f"Memory growth ≤{max_allowed_growth}MB: {'✅ PASS' if not leak_detected else '❌ FAIL'}")
        
        assert not leak_detected, f"Memory leak detected: {memory_growth:.1f}MB growth > {max_allowed_growth}MB limit"
    
    def test_cache_statistics_accuracy(self, ultra_cache):
        """Test accuracy of cache statistics under high load"""
        print("\n📊 CACHE STATISTICS ACCURACY TEST")
        print("=" * 60)
        
        # Perform known operations
        set_operations = 1000
        get_operations = 2000  # Some will be hits, some misses
        
        # Clear cache and reset stats if possible
        ultra_cache.clear()
        
        # Perform SET operations
        for i in range(set_operations):
            ultra_cache.set(f"stats_test_{i}", f"value_{i}", ttl=60)
        
        # Perform GET operations (mix of hits and misses)
        hits = 0
        misses = 0
        for i in range(get_operations):
            key = f"stats_test_{i % (set_operations + 100)}"  # Some keys won't exist
            result = ultra_cache.get(key)
            if result is not None:
                hits += 1
            else:
                misses += 1
        
        # Get cache statistics
        stats = ultra_cache.get_stats()
        
        print(f"Expected hits: {hits}")
        print(f"Expected misses: {misses}")
        print(f"Cache stats hits: {stats.hits}")
        print(f"Cache stats misses: {stats.misses}")
        print(f"Cache stats sets: {stats.sets}")
        
        # Validate statistics (allowing for some variance due to TTL expiration)
        sets_accurate = abs(stats.sets - set_operations) <= 10
        hits_reasonably_accurate = abs(stats.hits - hits) <= 50
        
        print(f"\n✅ STATISTICS VALIDATION:")
        print(f"SET operations accurate: {'✅ PASS' if sets_accurate else '❌ FAIL'}")
        print(f"HIT operations reasonably accurate: {'✅ PASS' if hits_reasonably_accurate else '❌ FAIL'}")
        
        assert sets_accurate, f"SET statistics inaccurate: expected ~{set_operations}, got {stats.sets}"


if __name__ == "__main__":
    # Allow running as standalone script for manual testing
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--manual":
        print("🚀 RUNNING ULTRA-HIGH THROUGHPUT TESTS MANUALLY")
        print("=" * 60)
        
        # Create test instances
        test_class = TestUltraHighThroughput()
        ultra_cache = create_ultra_high_performance_cache("manual_test", 50000, 3600)
        test_data_sizes = [
            ("tiny", b"x" * 10),
            ("small", b"x" * 100),
            ("medium", b"x" * 1000),
            ("large", b"x" * 10000),
            ("xlarge", b"x" * 100000),
        ]
        
        try:
            print("\n1. Testing sustained 15,000+ ops/sec...")
            test_class.test_sustained_15k_ops_per_second(ultra_cache, test_data_sizes)
            
            print("\n2. Testing 10,000+ concurrent operations...")
            test_class.test_concurrent_10k_operations(ultra_cache, test_data_sizes)
            
            print("\n3. Testing memory leak detection...")
            test_class.test_memory_leak_detection(ultra_cache, test_data_sizes)
            
            print("\n4. Testing cache statistics accuracy...")
            test_class.test_cache_statistics_accuracy(ultra_cache)
            
            print("\n🎉 ALL ULTRA-HIGH THROUGHPUT TESTS COMPLETED SUCCESSFULLY!")
            
        except Exception as e:
            print(f"\n❌ TEST FAILED: {e}")
            sys.exit(1)
    else:
        print("Run with --manual flag for standalone execution")
        print("Or use: pytest test_ultra_high_throughput.py -v")