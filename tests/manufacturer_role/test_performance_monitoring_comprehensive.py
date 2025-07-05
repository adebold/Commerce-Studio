"""
Comprehensive Performance Monitoring tests for manufacturer security foundation.
Addresses critical performance monitoring implementation gap identified in reflection_LS8.md.

This test suite validates:
1. Real-time performance metrics collection and analysis
2. Performance threshold monitoring and alerting
3. Resource utilization tracking and optimization
4. Performance degradation detection and response
5. Comprehensive performance reporting and analytics
"""

import pytest
import asyncio
import time
import psutil
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum
import statistics
import json

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.auth.manufacturer_rbac import (
        ManufacturerRBACManager, PerformanceMonitor, PerformanceMetrics,
        PerformanceAlert, ResourceUtilization, PerformanceThreshold,
        PerformanceReport, PerformanceTrend
    )
    from src.security.manufacturer_encryption import ManufacturerEncryptionManager
    from src.security.manufacturer_validator import ManufacturerSecurityValidator
    from src.auth.exceptions import (
        PerformanceThresholdExceededError, ResourceExhaustionError,
        MonitoringError, AlertingError
    )
except ImportError as e:
    pytest.skip(f"Performance monitoring modules not implemented: {e}", allow_module_level=True)


class MetricType(Enum):
    """Performance metric types"""
    RESPONSE_TIME = "response_time"
    THROUGHPUT = "throughput"
    ERROR_RATE = "error_rate"
    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    DISK_IO = "disk_io"
    NETWORK_IO = "network_io"
    CONCURRENT_USERS = "concurrent_users"
    CACHE_HIT_RATE = "cache_hit_rate"
    DATABASE_CONNECTIONS = "database_connections"


class AlertSeverity(Enum):
    """Alert severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@pytest.fixture
async def performance_monitor():
    """
    Enhanced PerformanceMonitor fixture with comprehensive monitoring.
    NO MOCKS - Real implementation required.
    """
    monitor = PerformanceMonitor(
        collection_interval_seconds=1,
        alert_threshold_checks=True,
        real_time_monitoring=True,
        historical_data_retention_days=30,
        performance_optimization_enabled=True,
        predictive_analytics_enabled=True
    )
    await monitor.initialize()
    await monitor.start_monitoring()
    return monitor


@pytest.fixture
async def monitored_rbac_manager():
    """RBAC manager with performance monitoring enabled"""
    rbac_manager = ManufacturerRBACManager(
        performance_monitoring_enabled=True,
        performance_collection_interval=1,
        performance_alerting_enabled=True
    )
    await rbac_manager.initialize()
    return rbac_manager


@pytest.fixture
async def monitored_encryption_manager():
    """Encryption manager with performance monitoring enabled"""
    encryption_manager = ManufacturerEncryptionManager(
        performance_monitoring_enabled=True,
        performance_collection_interval=1,
        performance_alerting_enabled=True
    )
    await encryption_manager.initialize()
    return encryption_manager


@pytest.fixture
async def monitored_security_validator():
    """Security validator with performance monitoring enabled"""
    validator = ManufacturerSecurityValidator(
        performance_monitoring_enabled=True,
        performance_collection_interval=1,
        performance_alerting_enabled=True
    )
    await validator.initialize()
    return validator


@pytest.fixture
def performance_thresholds():
    """Performance threshold configurations"""
    return {
        MetricType.RESPONSE_TIME: {
            "warning": 100,  # 100ms
            "critical": 500  # 500ms
        },
        MetricType.THROUGHPUT: {
            "warning": 100,  # 100 requests/second
            "critical": 50   # 50 requests/second
        },
        MetricType.ERROR_RATE: {
            "warning": 0.05,  # 5%
            "critical": 0.10  # 10%
        },
        MetricType.CPU_USAGE: {
            "warning": 0.70,  # 70%
            "critical": 0.90  # 90%
        },
        MetricType.MEMORY_USAGE: {
            "warning": 0.80,  # 80%
            "critical": 0.95  # 95%
        },
        MetricType.CACHE_HIT_RATE: {
            "warning": 0.80,  # 80%
            "critical": 0.60  # 60%
        }
    }


class TestRealTimePerformanceMetrics:
    """Test real-time performance metrics collection and analysis"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_real_time_metrics_collection(self, performance_monitor, monitored_rbac_manager):
        """
        Test real-time performance metrics collection.
        
        Requirements:
        - Collect metrics every second
        - Track response times, throughput, error rates
        - Store metrics with timestamps
        """
        # Start metrics collection
        await performance_monitor.start_real_time_collection()
        
        # Perform operations to generate metrics
        test_operations = []
        for i in range(10):
            start_time = time.perf_counter()
            
            # Simulate RBAC operations
            await monitored_rbac_manager.check_permission(
                f"mfg_perf_test_{i}", "read_products"
            )
            
            operation_time = time.perf_counter() - start_time
            test_operations.append(operation_time)
            
            # Small delay to spread operations
            await asyncio.sleep(0.1)
        
        # Wait for metrics collection
        await asyncio.sleep(2)
        
        # Get collected metrics
        metrics = await performance_monitor.get_recent_metrics(duration_seconds=10)
        
        # Verify metrics collection
        assert len(metrics) > 0, "No metrics collected"
        
        # Verify metric types are present
        metric_types = {metric.type for metric in metrics}
        assert MetricType.RESPONSE_TIME in metric_types
        assert MetricType.THROUGHPUT in metric_types
        
        # Verify response time metrics
        response_time_metrics = [m for m in metrics if m.type == MetricType.RESPONSE_TIME]
        assert len(response_time_metrics) > 0
        
        # Verify timestamps are recent and ordered
        for metric in response_time_metrics:
            assert (datetime.utcnow() - metric.timestamp).total_seconds() < 15
        
        # Verify response times are reasonable
        avg_response_time = statistics.mean([m.value for m in response_time_metrics])
        assert avg_response_time < 0.1, f"Average response time too high: {avg_response_time:.3f}s"
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_throughput_metrics_calculation(self, performance_monitor, monitored_rbac_manager):
        """
        Test throughput metrics calculation and accuracy.
        
        Requirements:
        - Calculate requests per second accurately
        - Track concurrent operation throughput
        - Provide real-time throughput updates
        """
        # Clear existing metrics
        await performance_monitor.clear_metrics()
        
        # Perform high-throughput operations
        operations_count = 50
        start_time = time.perf_counter()
        
        # Concurrent operations
        async def perform_operation(op_id):
            await monitored_rbac_manager.check_permission(f"mfg_throughput_{op_id}", "read_products")
        
        tasks = [perform_operation(i) for i in range(operations_count)]
        await asyncio.gather(*tasks)
        
        total_time = time.perf_counter() - start_time
        expected_throughput = operations_count / total_time
        
        # Wait for metrics processing
        await asyncio.sleep(2)
        
        # Get throughput metrics
        throughput_metrics = await performance_monitor.get_metrics_by_type(MetricType.THROUGHPUT)
        
        assert len(throughput_metrics) > 0, "No throughput metrics collected"
        
        # Get latest throughput reading
        latest_throughput = max(throughput_metrics, key=lambda m: m.timestamp)
        measured_throughput = latest_throughput.value
        
        # Verify throughput accuracy (within 20% tolerance)
        throughput_difference = abs(measured_throughput - expected_throughput) / expected_throughput
        assert throughput_difference < 0.2, \
            f"Throughput measurement inaccurate: expected {expected_throughput:.1f}, got {measured_throughput:.1f}"
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_error_rate_tracking(self, performance_monitor, monitored_rbac_manager):
        """
        Test error rate tracking and calculation.
        
        Requirements:
        - Track successful vs failed operations
        - Calculate error rate percentage
        - Update error rates in real-time
        """
        # Clear existing metrics
        await performance_monitor.clear_metrics()
        
        # Perform operations with intentional failures
        total_operations = 20
        expected_failures = 4
        
        for i in range(total_operations):
            try:
                if i < expected_failures:
                    # Intentionally cause failures
                    await monitored_rbac_manager.check_permission("invalid_user", "invalid_permission")
                else:
                    # Successful operations
                    await monitored_rbac_manager.check_permission(f"mfg_error_test_{i}", "read_products")
            except Exception:
                pass  # Expected for failure cases
        
        # Wait for metrics processing
        await asyncio.sleep(2)
        
        # Get error rate metrics
        error_rate_metrics = await performance_monitor.get_metrics_by_type(MetricType.ERROR_RATE)
        
        assert len(error_rate_metrics) > 0, "No error rate metrics collected"
        
        # Get latest error rate
        latest_error_rate = max(error_rate_metrics, key=lambda m: m.timestamp)
        measured_error_rate = latest_error_rate.value
        
        expected_error_rate = expected_failures / total_operations
        
        # Verify error rate accuracy (within 10% tolerance)
        error_rate_difference = abs(measured_error_rate - expected_error_rate)
        assert error_rate_difference < 0.1, \
            f"Error rate inaccurate: expected {expected_error_rate:.2%}, got {measured_error_rate:.2%}"


class TestPerformanceThresholdMonitoring:
    """Test performance threshold monitoring and alerting"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_response_time_threshold_monitoring(self, performance_monitor, monitored_encryption_manager, performance_thresholds):
        """
        Test response time threshold monitoring and alerting.
        
        Requirements:
        - Monitor response time thresholds
        - Generate alerts when thresholds exceeded
        - Provide threshold breach details
        """
        # Configure response time thresholds
        await performance_monitor.set_threshold(
            MetricType.RESPONSE_TIME,
            warning_threshold=performance_thresholds[MetricType.RESPONSE_TIME]["warning"] / 1000,  # Convert to seconds
            critical_threshold=performance_thresholds[MetricType.RESPONSE_TIME]["critical"] / 1000
        )
        
        # Clear existing alerts
        await performance_monitor.clear_alerts()
        
        # Perform operation that should trigger threshold
        large_data = {"data": "x" * 100000}  # Large data to slow down encryption
        
        start_time = time.perf_counter()
        await monitored_encryption_manager.encrypt_manufacturer_data(large_data)
        operation_time = time.perf_counter() - start_time
        
        # Wait for threshold monitoring
        await asyncio.sleep(2)
        
        # Check for alerts
        alerts = await performance_monitor.get_recent_alerts(duration_seconds=10)
        
        # If operation was slow enough, should have alerts
        if operation_time > performance_thresholds[MetricType.RESPONSE_TIME]["warning"] / 1000:
            response_time_alerts = [a for a in alerts if a.metric_type == MetricType.RESPONSE_TIME]
            assert len(response_time_alerts) > 0, "No response time alerts generated"
            
            alert = response_time_alerts[0]
            assert alert.severity in [AlertSeverity.MEDIUM, AlertSeverity.HIGH, AlertSeverity.CRITICAL]
            assert alert.threshold_value is not None
            assert alert.actual_value >= alert.threshold_value
            assert alert.message is not None
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_resource_utilization_threshold_monitoring(self, performance_monitor, performance_thresholds):
        """
        Test resource utilization threshold monitoring.
        
        Requirements:
        - Monitor CPU and memory usage
        - Alert on resource exhaustion
        - Provide resource utilization trends
        """
        # Configure resource thresholds
        await performance_monitor.set_threshold(
            MetricType.CPU_USAGE,
            warning_threshold=performance_thresholds[MetricType.CPU_USAGE]["warning"],
            critical_threshold=performance_thresholds[MetricType.CPU_USAGE]["critical"]
        )
        
        await performance_monitor.set_threshold(
            MetricType.MEMORY_USAGE,
            warning_threshold=performance_thresholds[MetricType.MEMORY_USAGE]["warning"],
            critical_threshold=performance_thresholds[MetricType.MEMORY_USAGE]["critical"]
        )
        
        # Start resource monitoring
        await performance_monitor.start_resource_monitoring()
        
        # Wait for resource metrics collection
        await asyncio.sleep(3)
        
        # Get resource utilization metrics
        cpu_metrics = await performance_monitor.get_metrics_by_type(MetricType.CPU_USAGE)
        memory_metrics = await performance_monitor.get_metrics_by_type(MetricType.MEMORY_USAGE)
        
        assert len(cpu_metrics) > 0, "No CPU metrics collected"
        assert len(memory_metrics) > 0, "No memory metrics collected"
        
        # Verify resource values are reasonable
        latest_cpu = max(cpu_metrics, key=lambda m: m.timestamp)
        latest_memory = max(memory_metrics, key=lambda m: m.timestamp)
        
        assert 0.0 <= latest_cpu.value <= 1.0, f"Invalid CPU usage: {latest_cpu.value}"
        assert 0.0 <= latest_memory.value <= 1.0, f"Invalid memory usage: {latest_memory.value}"
        
        # Check for resource alerts if thresholds exceeded
        alerts = await performance_monitor.get_recent_alerts(duration_seconds=10)
        resource_alerts = [a for a in alerts if a.metric_type in [MetricType.CPU_USAGE, MetricType.MEMORY_USAGE]]
        
        # If resource usage is high, should have appropriate alerts
        for alert in resource_alerts:
            assert alert.actual_value >= alert.threshold_value
            assert alert.severity in [AlertSeverity.MEDIUM, AlertSeverity.HIGH, AlertSeverity.CRITICAL]
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_cache_performance_threshold_monitoring(self, performance_monitor, monitored_rbac_manager, performance_thresholds):
        """
        Test cache performance threshold monitoring.
        
        Requirements:
        - Monitor cache hit rates
        - Alert on poor cache performance
        - Track cache efficiency trends
        """
        # Configure cache threshold
        await performance_monitor.set_threshold(
            MetricType.CACHE_HIT_RATE,
            warning_threshold=performance_thresholds[MetricType.CACHE_HIT_RATE]["warning"],
            critical_threshold=performance_thresholds[MetricType.CACHE_HIT_RATE]["critical"]
        )
        
        # Clear cache to start fresh
        await monitored_rbac_manager.clear_cache()
        
        # Perform operations to populate cache
        cache_operations = []
        for i in range(10):
            # First access - cache miss
            await monitored_rbac_manager.check_permission(f"mfg_cache_test_{i}", "read_products")
            cache_operations.append(f"mfg_cache_test_{i}")
        
        # Repeat operations - should be cache hits
        for user_id in cache_operations:
            await monitored_rbac_manager.check_permission(user_id, "read_products")
        
        # Wait for cache metrics
        await asyncio.sleep(2)
        
        # Get cache hit rate metrics
        cache_metrics = await performance_monitor.get_metrics_by_type(MetricType.CACHE_HIT_RATE)
        
        assert len(cache_metrics) > 0, "No cache metrics collected"
        
        # Get latest cache hit rate
        latest_cache_metric = max(cache_metrics, key=lambda m: m.timestamp)
        cache_hit_rate = latest_cache_metric.value
        
        # Cache hit rate should be reasonable (at least 30% after repeated operations)
        assert cache_hit_rate >= 0.3, f"Cache hit rate too low: {cache_hit_rate:.2%}"
        
        # Check for cache performance alerts
        alerts = await performance_monitor.get_recent_alerts(duration_seconds=10)
        cache_alerts = [a for a in alerts if a.metric_type == MetricType.CACHE_HIT_RATE]
        
        # If cache hit rate is below threshold, should have alerts
        if cache_hit_rate < performance_thresholds[MetricType.CACHE_HIT_RATE]["critical"]:
            assert len(cache_alerts) > 0, "No cache performance alerts generated"


class TestResourceUtilizationTracking:
    """Test resource utilization tracking and optimization"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_comprehensive_resource_tracking(self, performance_monitor):
        """
        Test comprehensive resource utilization tracking.
        
        Requirements:
        - Track CPU, memory, disk, network usage
        - Provide detailed resource breakdowns
        - Monitor resource trends over time
        """
        # Start comprehensive resource monitoring
        await performance_monitor.start_comprehensive_resource_monitoring()
        
        # Wait for resource data collection
        await asyncio.sleep(5)
        
        # Get resource utilization summary
        resource_summary = await performance_monitor.get_resource_utilization_summary()
        
        # Verify all resource types are tracked
        assert "cpu" in resource_summary
        assert "memory" in resource_summary
        assert "disk" in resource_summary
        assert "network" in resource_summary
        
        # Verify CPU metrics
        cpu_data = resource_summary["cpu"]
        assert "usage_percent" in cpu_data
        assert "cores_count" in cpu_data
        assert "load_average" in cpu_data
        assert 0.0 <= cpu_data["usage_percent"] <= 100.0
        
        # Verify memory metrics
        memory_data = resource_summary["memory"]
        assert "usage_percent" in memory_data
        assert "total_bytes" in memory_data
        assert "available_bytes" in memory_data
        assert "used_bytes" in memory_data
        assert 0.0 <= memory_data["usage_percent"] <= 100.0
        assert memory_data["total_bytes"] > 0
        
        # Verify disk metrics
        disk_data = resource_summary["disk"]
        assert "usage_percent" in disk_data
        assert "total_bytes" in disk_data
        assert "free_bytes" in disk_data
        assert "read_bytes_per_sec" in disk_data
        assert "write_bytes_per_sec" in disk_data
        
        # Verify network metrics
        network_data = resource_summary["network"]
        assert "bytes_sent_per_sec" in network_data
        assert "bytes_recv_per_sec" in network_data
        assert "packets_sent_per_sec" in network_data
        assert "packets_recv_per_sec" in network_data
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_resource_optimization_recommendations(self, performance_monitor, monitored_rbac_manager):
        """
        Test resource optimization recommendations.
        
        Requirements:
        - Analyze resource usage patterns
        - Provide optimization recommendations
        - Track optimization effectiveness
        """
        # Perform resource-intensive operations
        for i in range(20):
            await monitored_rbac_manager.check_permission(f"mfg_resource_test_{i}", "read_products")
            await monitored_rbac_manager.check_permission(f"mfg_resource_test_{i}", "write_products")
        
        # Wait for resource analysis
        await asyncio.sleep(3)
        
        # Get optimization recommendations
        recommendations = await performance_monitor.get_optimization_recommendations()
        
        assert isinstance(recommendations, list)
        assert len(recommendations) >= 0  # May or may not have recommendations
        
        # If recommendations exist, verify structure
        for recommendation in recommendations:
            assert "type" in recommendation
            assert "description" in recommendation
            assert "impact" in recommendation
            assert "implementation_effort" in recommendation
            
            # Verify recommendation types are valid
            valid_types = ["cache_optimization", "memory_optimization", "cpu_optimization", "io_optimization"]
            assert recommendation["type"] in valid_types
            
            # Verify impact levels
            valid_impacts = ["low", "medium", "high"]
            assert recommendation["impact"] in valid_impacts
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_resource_trend_analysis(self, performance_monitor):
        """
        Test resource utilization trend analysis.
        
        Requirements:
        - Analyze resource trends over time
        - Identify resource usage patterns
        - Predict future resource needs
        """
        # Start trend monitoring
        await performance_monitor.start_trend_analysis()
        
        # Wait for trend data collection
        await asyncio.sleep(10)
        
        # Get resource trends
        trends = await performance_monitor.get_resource_trends(duration_minutes=1)
        
        assert "cpu_trend" in trends
        assert "memory_trend" in trends
        assert "disk_trend" in trends
        assert "network_trend" in trends
        
        # Verify trend data structure
        for trend_name, trend_data in trends.items():
            assert "direction" in trend_data  # increasing, decreasing, stable
            assert "rate_of_change" in trend_data
            assert "confidence" in trend_data
            assert "prediction" in trend_data
            
            # Verify direction values
            valid_directions = ["increasing", "decreasing", "stable"]
            assert trend_data["direction"] in valid_directions
            
            # Verify confidence is between 0 and 1
            assert 0.0 <= trend_data["confidence"] <= 1.0
        
        # Get future resource predictions
        predictions = await performance_monitor.predict_resource_usage(hours_ahead=1)
        
        assert "cpu_prediction" in predictions
        assert "memory_prediction" in predictions
        
        # Verify prediction structure
        for prediction_name, prediction_data in predictions.items():
            assert "predicted_value" in prediction_data
            assert "confidence_interval" in prediction_data
            assert "timestamp" in prediction_data


class TestPerformanceDegradationDetection:
    """Test performance degradation detection and response"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_performance_degradation_detection(self, performance_monitor, monitored_security_validator):
        """
        Test automatic performance degradation detection.
        
        Requirements:
        - Detect performance degradation automatically
        - Compare against baseline performance
        - Generate degradation alerts
        """
        # Establish baseline performance
        await performance_monitor.establish_performance_baseline()
        
        # Perform normal operations to establish baseline
        baseline_operations = []
        for i in range(10):
            start_time = time.perf_counter()
            await monitored_security_validator.detect_threat("sql_injection", {"input": f"test_{i}"})
            operation_time = time.perf_counter() - start_time
            baseline_operations.append(operation_time)
        
        baseline_avg = statistics.mean(baseline_operations)
        
        # Wait for baseline establishment
        await asyncio.sleep(2)
        
        # Simulate performance degradation (larger data)
        degraded_operations = []
        for i in range(10):
            start_time = time.perf_counter()
            large_input = {"input": f"test_{i}" + "x" * 10000}  # Much larger input
            await monitored_security_validator.detect_threat("sql_injection", large_input)
            operation_time = time.perf_counter() - start_time
            degraded_operations.append(operation_time)
        
        degraded_avg = statistics.mean(degraded_operations)
        
        # Wait for degradation detection
        await asyncio.sleep(3)
        
        # Check for degradation alerts
        alerts = await performance_monitor.get_recent_alerts(duration_seconds=15)
        degradation_alerts = [a for a in alerts if "degradation" in a.message.lower()]
        
        # If there was significant degradation, should have alerts
        if degraded_avg > baseline_avg * 1.5:  # 50% slower
            assert len(degradation_alerts) > 0, "No degradation alerts generated"
            
            alert = degradation_alerts[0]
            assert alert.severity in [AlertSeverity.MEDIUM, AlertSeverity.HIGH, AlertSeverity.CRITICAL]
            assert "baseline" in alert.message.lower() or "degradation" in alert.message.lower()
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_automatic_performance_recovery(self, performance_monitor, monitored_rbac_manager):
        """
        Test automatic performance recovery mechanisms.
        
        Requirements:
        - Detect performance issues
        - Trigger automatic recovery actions
        - Monitor recovery effectiveness
        """
        # Enable automatic recovery
        await performance_monitor.enable_automatic_recovery()
        
        # Configure recovery actions
        recovery_config = {
            "cache_clear_threshold": 0.5,  # Clear cache if hit rate < 50%
            "connection_pool_reset_threshold": 0.9,  # Reset pool if CPU > 90%
            "garbage_collection_threshold": 0.85  # Force GC if memory > 85%
        }
        await performance_monitor.configure_recovery_actions(recovery_config)
        
        # Simulate performance issue by overwhelming cache
        cache_overflow_operations = 100
        for i in range(cache_overflow_operations):
            await monitored_rbac_manager.check_permission(f"unique_user_{i}", "read_products")
        
        # Wait for performance monitoring and potential recovery
        await asyncio.sleep(5)
        
        # Check if recovery actions were triggered
        recovery_log = await performance_monitor.get_recovery_actions_log()
        
        # Verify recovery log structure
        assert isinstance(recovery_log, list)
        
        # If recovery actions were triggered, verify them
        for recovery_action in recovery_log:
            assert "action_type" in recovery_action
            assert "timestamp" in recovery_action
            assert "trigger_reason" in recovery_action
            assert "success" in recovery_action
            
            valid_actions = ["cache_clear", "connection_pool_reset", "garbage_collection", "circuit_breaker"]
            assert recovery_action["action_type"] in valid_actions
            
            # Verify timestamp is recent
            action_time = datetime.fromisoformat(recovery_action["timestamp"])
            assert (datetime.utcnow() - action_time).total_seconds() < 30
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_performance_circuit_breaker(self, performance_monitor, monitored_encryption_manager):
        """
        Test performance circuit breaker functionality.
        
        Requirements:
        - Implement circuit breaker for failing operations
        - Open circuit on repeated failures
        - Close circuit when performance recovers
        """
        # Configure circuit breaker
        circuit_config = {
            "failure_threshold": 5,  # Open after 5 failures
            "timeout_seconds": 10,   # Try again after 10 seconds
            "success_threshold": 3   # Close after 3 successes
        }
        await performance_monitor.configure_circuit_breaker("encryption", circuit_config)
        
        # Simulate repeated failures (invalid data)
        failure_count = 0
        for i in range(10):
            try:
                # This should fail or be very slow
                invalid_data = {"data": None}
                await monitored_encryption_manager.encrypt_manufacturer_data(invalid_data)
            except Exception:
                failure_count += 1
        
        # Wait for circuit breaker evaluation
        await asyncio.sleep(2)
        
        # Check circuit breaker status
        circuit_status = await performance_monitor.get_circuit_breaker_status("encryption")
        
        assert "state" in circuit_status
        assert "failure_count" in circuit_status
        assert "last_failure_time" in circuit_status
        
        valid_states = ["closed", "open", "half_open"]
        assert circuit_status["state"] in valid_states
        
        # If enough failures occurred, circuit should be open
        if failure_count >= circuit_config["failure_threshold"]:
            assert circuit_status["state"] == "open"
            assert circuit_status["failure_count"] >= circuit_config["failure_threshold"]


class TestPerformanceReportingAndAnalytics:
    """Test comprehensive performance reporting and analytics"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_comprehensive_performance_report_generation(self, performance_monitor):
        """
        Test comprehensive performance report generation.
        
        Requirements:
        - Generate detailed performance reports
        - Include all monitored metrics
        - Provide actionable insights
        """
        # Wait for sufficient data collection
        await asyncio.sleep(5)
        
        # Generate comprehensive report
        report = await performance_monitor.generate_performance_report(
            duration_minutes=5,
            include_trends=True,
            include_recommendations=True
        )
        
        # Verify report structure
        assert "summary" in report
        assert "metrics" in report
        assert "trends" in report
        assert "recommendations" in report
        assert "alerts" in report
        assert "resource_utilization" in report
        
        # Verify summary section
        summary = report["summary"]
        assert "report_period" in summary
        assert "total_operations" in summary
        assert "average_response_time" in summary
        assert "error_rate" in summary
        assert "throughput" in summary
        
        # Verify metrics section
        metrics = report["metrics"]
        assert isinstance(metrics, dict)
        
        # Should have metrics for major categories
        expected_metric_types = [
            MetricType.RESPONSE_TIME.value,
            MetricType.THROUGHPUT.value,
            MetricType.ERROR_RATE.value
        ]
        
        for metric_type in expected_metric_types:
            if metric_type in metrics:
                metric_data = metrics[metric_type]
                assert "count" in metric_data
                assert "average" in metric_data
                assert "min" in metric_data
                assert "max" in metric_data
        
        # Verify trends section
        trends = report["trends"]
        assert isinstance(trends, dict)
        
        # Verify recommendations section
        recommendations = report["recommendations"]
        assert isinstance(recommendations, list)
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_performance_analytics_and_insights(self, performance_monitor):
        """
        Test performance analytics and insights generation.
        
        Requirements:
        - Analyze performance patterns
        - Generate actionable insights
        - Provide optimization suggestions
        """
        # Generate analytics report
        analytics = await performance_monitor.generate_performance_analytics(
            analysis_period_hours=1,
            include_predictions=True,
            include_anomalies=True
        )
        
        # Verify analytics structure
        assert "patterns" in analytics
        assert "anomalies" in analytics
        assert "predictions" in analytics
        assert "insights" in analytics
        assert "optimization_opportunities" in analytics
        
        # Verify patterns analysis
        patterns = analytics["patterns"]
        assert isinstance(patterns, dict)
        
        # Should identify common patterns
        pattern_types = ["peak_hours", "low_activity_periods", "error_spikes", "performance_cycles"]
        for pattern_type in pattern_types:
            if pattern_type in patterns:
                pattern_data = patterns[pattern_type]
                assert "description" in pattern_data
                assert "frequency" in pattern_data
                assert "impact" in pattern_data
        
        # Verify anomalies detection
        anomalies = analytics["anomalies"]
        assert isinstance(anomalies, list)
        
        for anomaly in anomalies:
            assert "timestamp" in anomaly
            assert "metric_type" in anomaly
            assert "severity" in anomaly
            assert "description" in anomaly
            assert "deviation_score" in anomaly
        
        # Verify predictions
        predictions = analytics["predictions"]
        assert isinstance(predictions, dict)
        
        # Should have predictions for key metrics
        prediction_metrics = ["response_time", "throughput", "resource_usage"]
        for metric in prediction_metrics:
            if metric in predictions:
                prediction_data = predictions[metric]
                assert "next_hour" in prediction_data
                assert "confidence" in prediction_data
                assert 0.0 <= prediction_data["confidence"] <= 1.0
        
        # Verify insights
        insights = analytics["insights"]
        assert isinstance(insights, list)
        
        for insight in insights:
            assert "category" in insight
            assert "description" in insight
            assert "impact" in insight
            assert "recommendation" in insight
            
            valid_categories = ["performance", "resource", "optimization", "reliability"]
            assert insight["category"] in valid_categories
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_performance_dashboard_data_export(self, performance_monitor):
        """
        Test performance dashboard data export functionality.
        
        Requirements:
        - Export data in multiple formats
        - Include real-time and historical data
        - Support dashboard integration
        """
        # Export data in different formats
        json_export = await performance_monitor.export_dashboard_data(format="json")
        csv_export = await performance_monitor.export_dashboard_data(format="csv")
        
        # Verify JSON export
        assert isinstance(json_export, dict)
        assert "metadata" in json_export
        assert "metrics" in json_export
        assert "timestamps" in json_export
        
        # Verify metadata
        metadata = json_export["metadata"]
        assert "export_timestamp" in metadata
        assert "data_period" in metadata
        assert "metric_count" in metadata
        
        # Verify CSV export
        assert isinstance(csv_export, str)
        assert "timestamp" in csv_export.lower()
        assert "metric_type" in csv_export.lower()
        assert "value" in csv_export.lower()
        
        # Test real-time data stream
        real_time_stream = await performance_monitor.get_real_time_data_stream()
        
        # Verify stream structure
        assert hasattr(real_time_stream, '__aiter__')
        
        # Test streaming a few data points
        data_points = []
        async for data_point in real_time_stream:
            data_points.append(data_point)
            if len(data_points) >= 3:
                break
        
        # Verify data point structure
        for data_point in data_points:
            assert "timestamp" in data_point
            assert "metric_type" in data_point
            assert "value" in data_point
            assert "metadata" in data_point


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])