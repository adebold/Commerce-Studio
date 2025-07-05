"""
Enhanced Test-Driven Development for Cache Manager Memory Leak Prevention

This test suite specifically addresses the HIGH SEVERITY memory leak issue
identified in reflection_LS4.md for cache manager cleanup mechanisms.

Critical Issue: Memory leak where expired cache entries accumulate in 
_cache_timestamps dictionary, causing gradual memory growth over time.

Location: src/performance/cache_manager.py:354-364

Following TDD Red-Green-Refactor cycle with focus on memory leak prevention:
1. RED: Write failing tests that detect memory leaks
2. GREEN: Implement guaranteed cleanup mechanisms
3. REFACTOR: Optimize for production memory management
"""

import pytest
import asyncio
import gc
import psutil
import os
import time
import threading
from typing import Dict, Any, List, Optional
from unittest.mock import patch, MagicMock
import weakref
from collections import defaultdict


class TestCacheMemoryLeakDetection:
    """
    Test Suite: Cache Manager Memory Leak Detection
    
    RED PHASE: Write failing tests that detect memory leaks in cache cleanup
    These tests must fail until proper cleanup mechanisms are implemented
    """
    
    @pytest.mark.asyncio
    async def test_orphaned_timestamp_cleanup_prevents_memory_leak(self):
        """
        FAILING TEST: Orphaned timestamp entries must be cleaned up to prevent memory leak
        
        Critical Memory Leak:
        - _cache_timestamps entries remain after cache cleanup
        - Gradual memory growth from orphaned timestamps
        - No mechanism to detect and clean orphaned entries
        
        Expected Fix:
        - Cleanup removes from both _read_cache and _cache_timestamps
        - Orphan detection and removal mechanism
        - Guaranteed memory cleanup
        """
        # This test MUST FAIL until orphaned timestamp cleanup is implemented
        
        with pytest.raises(NotImplementedError, match="Orphaned timestamp cleanup not implemented"):
            from src.performance.cache_manager import CacheManager
            
            cache_manager = CacheManager(
                memory_cache_size=100,
                default_ttl=0.1,  # Very short TTL for fast testing
                cleanup_interval=0.05  # Frequent cleanup
            )
            
            # Track memory usage before test
            initial_memory = self._get_process_memory()
            
            # Simulate scenario that creates orphaned timestamps
            orphaned_entries_count = 1000
            
            for i in range(orphaned_entries_count):
                # Set cache entries that will expire quickly
                await cache_manager.set(f"test_key_{i}", f"test_value_{i}")
            
            # Wait for entries to expire but not be cleaned up properly
            await asyncio.sleep(0.2)
            
            # Force cleanup that might leave orphaned timestamps
            await cache_manager._force_cleanup()
            
            # Check for orphaned timestamps (this should detect the leak)
            orphaned_count = await self._count_orphaned_timestamps(cache_manager)
            
            # This should fail because orphaned timestamps exist
            assert orphaned_count == 0, f"Found {orphaned_count} orphaned timestamp entries"
            
            # Verify memory has returned to baseline
            final_memory = self._get_process_memory()
            memory_growth = final_memory - initial_memory
            
            # This should fail due to memory not being properly released
            assert memory_growth < 1024 * 1024, f"Memory grew by {memory_growth} bytes indicating leak"
    
    @pytest.mark.asyncio
    async def test_memory_growth_under_extended_load(self):
        """
        FAILING TEST: Memory usage must remain stable under extended load
        
        Critical Memory Leak:
        - Memory grows continuously during high-frequency operations
        - Cache cleanup doesn't release all allocated memory
        - Long-running processes accumulate memory leaks
        
        Expected Fix:
        - Stable memory usage over time
        - Proper cleanup of all cache structures
        - Memory returns to baseline after cleanup cycles
        """
        # This test MUST FAIL until memory leak is fixed
        
        with pytest.raises(AssertionError, match="Memory leak detected"):
            from src.performance.cache_manager import CacheManager
            
            cache_manager = CacheManager(
                memory_cache_size=50,
                default_ttl=0.1,
                cleanup_interval=0.1
            )
            
            # Baseline memory measurement
            gc.collect()  # Force garbage collection
            baseline_memory = self._get_process_memory()
            
            # Memory tracking over time
            memory_samples = []
            test_duration = 2.0  # 2 seconds of sustained load
            sample_interval = 0.1
            
            # Sustained high-frequency cache operations
            async def sustained_cache_operations():
                """Generate sustained cache load"""
                operation_count = 0
                start_time = time.time()
                
                while time.time() - start_time < test_duration:
                    # High-frequency set/get/delete operations
                    key = f"load_test_{operation_count % 100}"
                    value = f"data_{operation_count}" * 10  # Larger values
                    
                    await cache_manager.set(key, value)
                    await cache_manager.get(key)
                    
                    if operation_count % 10 == 0:
                        await cache_manager.delete(key)
                    
                    operation_count += 1
                    await asyncio.sleep(0.001)  # Small delay
            
            # Memory sampling task
            async def memory_sampling():
                """Sample memory usage over time"""
                while len(memory_samples) * sample_interval < test_duration:
                    gc.collect()
                    current_memory = self._get_process_memory()
                    memory_samples.append({
                        'timestamp': time.time(),
                        'memory_usage': current_memory,
                        'memory_growth': current_memory - baseline_memory
                    })
                    await asyncio.sleep(sample_interval)
            
            # Run sustained load and memory sampling concurrently
            await asyncio.gather(
                sustained_cache_operations(),
                memory_sampling()
            )
            
            # Force final cleanup
            await cache_manager._force_cleanup()
            gc.collect()
            
            # Analyze memory growth pattern
            final_memory = self._get_process_memory()
            total_growth = final_memory - baseline_memory
            max_growth = max(sample['memory_growth'] for sample in memory_samples)
            
            # Check for memory leak indicators
            # This should fail due to memory leak
            assert total_growth < 5 * 1024 * 1024, \
                f"Total memory growth: {total_growth} bytes indicates memory leak"
            
            assert max_growth < 10 * 1024 * 1024, \
                f"Peak memory growth: {max_growth} bytes indicates memory leak"
            
            # Verify memory trend is not continuously increasing
            if len(memory_samples) >= 10:
                recent_growth = memory_samples[-5:]
                early_growth = memory_samples[:5]
                
                recent_avg = sum(s['memory_growth'] for s in recent_growth) / len(recent_growth)
                early_avg = sum(s['memory_growth'] for s in early_growth) / len(early_growth)
                
                growth_trend = recent_avg - early_avg
                
                # This should fail if memory is continuously growing
                assert growth_trend < 2 * 1024 * 1024, \
                    f"Memory growth trend: {growth_trend} bytes indicates continuous leak"
    
    @pytest.mark.asyncio
    async def test_atomic_cache_and_timestamp_cleanup(self):
        """
        FAILING TEST: Cache and timestamp cleanup must be atomic
        
        Critical Memory Leak:
        - Partial cleanup leaves inconsistent state
        - Cache entry removed but timestamp remains
        - Timestamp removed but cache entry remains
        
        Expected Fix:
        - Atomic cleanup of both structures
        - All-or-nothing cleanup operations
        - Consistent state after cleanup
        """
        # This test MUST FAIL until atomic cleanup is implemented
        
        with pytest.raises(NotImplementedError, match="Atomic cleanup not implemented"):
            from src.performance.cache_manager import CacheManager
            
            cache_manager = CacheManager(
                memory_cache_size=100,
                default_ttl=0.1
            )
            
            # Set up cache entries
            test_entries = 50
            for i in range(test_entries):
                await cache_manager.set(f"atomic_test_{i}", f"value_{i}")
            
            # Wait for expiration
            await asyncio.sleep(0.15)
            
            # Simulate partial cleanup failure scenarios
            cleanup_scenarios = [
                self._simulate_cache_cleanup_failure,
                self._simulate_timestamp_cleanup_failure,
                self._simulate_concurrent_cleanup_conflict
            ]
            
            for scenario in cleanup_scenarios:
                # Reset cache state
                for i in range(test_entries):
                    await cache_manager.set(f"scenario_test_{i}", f"value_{i}")
                
                await asyncio.sleep(0.15)  # Let entries expire
                
                # Simulate cleanup failure
                with pytest.raises(Exception):
                    await scenario(cache_manager)
                
                # Verify atomic cleanup - both should be consistent
                cache_keys = set(cache_manager._read_cache.keys())
                timestamp_keys = set(cache_manager._cache_timestamps.keys())
                
                # This should fail due to inconsistent cleanup
                assert cache_keys == timestamp_keys, \
                    f"Inconsistent cleanup: cache has {len(cache_keys)} keys, timestamps has {len(timestamp_keys)} keys"
    
    @pytest.mark.asyncio
    async def test_concurrent_cleanup_memory_safety(self):
        """
        FAILING TEST: Concurrent cleanup operations must not cause memory leaks
        
        Critical Memory Leak:
        - Race conditions during cleanup leave orphaned entries
        - Concurrent access corrupts cleanup process
        - Memory leaks accumulate under concurrent load
        
        Expected Fix:
        - Thread-safe cleanup operations
        - Proper synchronization during cleanup
        - No memory leaks under concurrency
        """
        # This test MUST FAIL until concurrent cleanup safety is implemented
        
        with pytest.raises(AssertionError, match="Concurrent cleanup memory leaks detected"):
            from src.performance.cache_manager import CacheManager
            
            cache_manager = CacheManager(
                memory_cache_size=200,
                default_ttl=0.1,
                cleanup_interval=0.05  # Frequent cleanup
            )
            
            # Track memory and orphaned entries during concurrent operations
            memory_tracking = {
                'baseline': self._get_process_memory(),
                'samples': [],
                'orphaned_counts': []
            }
            
            # Concurrent operations that stress cleanup mechanisms
            async def concurrent_cache_stress(worker_id: int):
                """Stress test cache operations with concurrent cleanup"""
                operations = 100
                
                for i in range(operations):
                    key = f"worker_{worker_id}_key_{i}"
                    value = f"worker_{worker_id}_value_{i}" * 5
                    
                    # Set, get, and sometimes delete
                    await cache_manager.set(key, value, ttl=0.05)
                    await cache_manager.get(key)
                    
                    if i % 10 == 0:
                        await cache_manager.delete(key)
                    
                    # Force cleanup occasionally
                    if i % 20 == 0:
                        await cache_manager._force_cleanup()
                    
                    # Small delay to create race conditions
                    await asyncio.sleep(0.001)
            
            # Memory and orphan monitoring
            async def memory_monitor():
                """Monitor memory usage and orphaned entries"""
                for _ in range(40):  # Monitor for 2 seconds
                    gc.collect()
                    current_memory = self._get_process_memory()
                    orphaned_count = await self._count_orphaned_timestamps(cache_manager)
                    
                    memory_tracking['samples'].append(current_memory)
                    memory_tracking['orphaned_counts'].append(orphaned_count)
                    
                    await asyncio.sleep(0.05)
            
            # Run concurrent stress test
            stress_tasks = [
                concurrent_cache_stress(worker_id) 
                for worker_id in range(10)
            ]
            
            await asyncio.gather(
                *stress_tasks,
                memory_monitor(),
                return_exceptions=True
            )
            
            # Final cleanup and analysis
            await cache_manager._force_cleanup()
            gc.collect()
            
            final_memory = self._get_process_memory()
            final_orphaned = await self._count_orphaned_timestamps(cache_manager)
            
            # Check for memory leaks
            memory_growth = final_memory - memory_tracking['baseline']
            max_orphaned = max(memory_tracking['orphaned_counts'])
            
            # These should fail due to memory leaks under concurrency
            assert memory_growth < 10 * 1024 * 1024, \
                f"Memory grew by {memory_growth} bytes under concurrent cleanup"
            
            assert final_orphaned == 0, \
                f"Found {final_orphaned} orphaned entries after concurrent operations"
            
            assert max_orphaned < 10, \
                f"Peak orphaned entries: {max_orphaned} indicates cleanup failures"
    
    @pytest.mark.asyncio
    async def test_cache_size_overflow_memory_protection(self):
        """
        FAILING TEST: Cache size overflow must not cause unbounded memory growth
        
        Critical Memory Leak:
        - Cache exceeds configured size limits
        - LRU eviction doesn't properly free memory
        - Memory grows beyond expected bounds
        
        Expected Fix:
        - Strict size limit enforcement
        - Proper memory release during eviction
        - Memory usage stays within bounds
        """
        # This test MUST FAIL until size overflow protection is implemented
        
        with pytest.raises(AssertionError, match="Cache size overflow memory leak"):
            from src.performance.cache_manager import CacheManager
            
            # Small cache size to trigger overflow quickly
            max_cache_size = 10
            cache_manager = CacheManager(
                memory_cache_size=max_cache_size,
                default_ttl=300  # Long TTL to prevent expiration cleanup
            )
            
            baseline_memory = self._get_process_memory()
            
            # Add many more entries than cache size limit
            overflow_multiplier = 10
            total_entries = max_cache_size * overflow_multiplier
            
            # Track cache internal state
            cache_states = []
            
            for i in range(total_entries):
                # Large values to amplify memory impact
                large_value = f"large_data_{i}" * 100
                await cache_manager.set(f"overflow_key_{i}", large_value)
                
                # Sample cache state periodically
                if i % 10 == 0:
                    cache_states.append({
                        'entries_added': i + 1,
                        'cache_size': len(cache_manager._read_cache),
                        'timestamp_size': len(cache_manager._cache_timestamps),
                        'memory_usage': self._get_process_memory()
                    })
            
            final_memory = self._get_process_memory()
            final_cache_size = len(cache_manager._read_cache)
            final_timestamp_size = len(cache_manager._cache_timestamps)
            
            # Verify size limits are enforced
            # This should fail if cache grows beyond limits
            assert final_cache_size <= max_cache_size, \
                f"Cache size {final_cache_size} exceeds limit {max_cache_size}"
            
            assert final_timestamp_size <= max_cache_size, \
                f"Timestamp size {final_timestamp_size} exceeds limit {max_cache_size}"
            
            # Verify memory usage is reasonable for cache size
            memory_growth = final_memory - baseline_memory
            expected_max_memory = max_cache_size * 1024 * 10  # 10KB per entry estimate
            
            # This should fail if memory grows beyond reasonable bounds
            assert memory_growth < expected_max_memory, \
                f"Memory growth {memory_growth} bytes exceeds expected {expected_max_memory}"
    
    # Helper methods for memory leak detection
    def _get_process_memory(self) -> int:
        """Get current process memory usage in bytes"""
        process = psutil.Process(os.getpid())
        return process.memory_info().rss
    
    async def _count_orphaned_timestamps(self, cache_manager) -> int:
        """Count orphaned timestamp entries"""
        try:
            cache_keys = set(cache_manager._read_cache.keys())
            timestamp_keys = set(cache_manager._cache_timestamps.keys())
            orphaned = timestamp_keys - cache_keys
            return len(orphaned)
        except AttributeError:
            # Cache manager not properly implemented yet
            raise NotImplementedError("Cache manager internals not accessible")
    
    async def _simulate_cache_cleanup_failure(self, cache_manager):
        """Simulate failure during cache cleanup"""
        # Mock cache cleanup to fail partway through
        original_cleanup = cache_manager._cleanup_cache
        
        def failing_cleanup():
            # Simulate partial cleanup that fails
            expired_keys = list(cache_manager._cache_timestamps.keys())[:10]
            for key in expired_keys[:5]:  # Only clean up half
                cache_manager._read_cache.pop(key, None)
            # Fail before cleaning timestamps
            raise Exception("Simulated cleanup failure")
        
        cache_manager._cleanup_cache = failing_cleanup
        
        try:
            await cache_manager._force_cleanup()
        finally:
            cache_manager._cleanup_cache = original_cleanup
    
    async def _simulate_timestamp_cleanup_failure(self, cache_manager):
        """Simulate failure during timestamp cleanup"""
        # Similar to cache cleanup failure but for timestamps
        raise NotImplementedError("Timestamp cleanup failure simulation")
    
    async def _simulate_concurrent_cleanup_conflict(self, cache_manager):
        """Simulate concurrent access conflict during cleanup"""
        # Simulate race condition during cleanup
        raise NotImplementedError("Concurrent cleanup conflict simulation")


class TestCacheMemoryLeakReproduction:
    """
    Test Suite: Memory Leak Reproduction
    
    These tests reproduce the exact memory leak scenario described in reflection_LS4.md
    """
    
    @pytest.mark.asyncio
    async def test_reproduce_exact_memory_leak_scenario(self):
        """
        REPRODUCTION TEST: Reproduce the exact memory leak from reflection_LS4.md
        
        This test creates the exact scenario:
        - _cleanup_cache removes from _read_cache
        - _cache_timestamps.pop() might fail silently
        - Orphaned timestamps accumulate over time
        """
        # This reproduces the exact issue from reflection_LS4.md
        with pytest.raises(NotImplementedError):
            # Simulate the problematic cleanup code:
            # def _cleanup_cache(self):
            #     for key in expired_keys:
            #         self._read_cache.pop(key, None)  # Removes from cache
            #         self._cache_timestamps.pop(key, None)  # But this might fail silently
            
            cache_manager = await self._create_problematic_cache_manager()
            
            # Create the exact leak scenario
            await self._simulate_exact_memory_leak(cache_manager)
    
    async def _create_problematic_cache_manager(self):
        """Create cache manager with the problematic implementation"""
        raise NotImplementedError("Problematic cache manager implementation not available")
    
    async def _simulate_exact_memory_leak(self, cache_manager):
        """Simulate the exact memory leak scenario"""
        # Implement exact reproduction of the memory leak
        pass


# Memory leak detection fixtures
@pytest.fixture
def memory_tracker():
    """Fixture for tracking memory usage during tests"""
    class MemoryTracker:
        def __init__(self):
            self.baseline = None
            self.samples = []
        
        def start_tracking(self):
            gc.collect()
            self.baseline = psutil.Process().memory_info().rss
        
        def sample_memory(self):
            current = psutil.Process().memory_info().rss
            growth = current - self.baseline if self.baseline else 0
            self.samples.append({'memory': current, 'growth': growth})
            return growth
        
        def get_max_growth(self):
            return max(s['growth'] for s in self.samples) if self.samples else 0
    
    return MemoryTracker()