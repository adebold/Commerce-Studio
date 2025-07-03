import pytest
import requests
import time
import statistics
import concurrent.futures
import logging
import json
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create directory for performance reports
REPORTS_DIR = Path("./performance_reports")
REPORTS_DIR.mkdir(exist_ok=True)

class TestLoadPerformance:
    """Load and performance tests for the API server."""
    
    @pytest.fixture(scope="class")
    def api_health_check(self):
        """Fixture to verify API server is running."""
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code != 200:
                pytest.skip("API server is running but health check failed")
            return True
        except requests.exceptions.RequestException:
            pytest.skip("API server is not running")
    
    def make_request(self, endpoint, timeout=10):
        """Make a request to the specified endpoint and return response time."""
        start_time = time.time()
        try:
            response = requests.get(f"http://localhost:8000{endpoint}", timeout=timeout)
            response_time = time.time() - start_time
            return {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response_time": response_time
            }
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "response_time": time.time() - start_time
            }
    
    def generate_performance_report(self, endpoint, results, concurrency):
        """Generate a performance report for the given endpoint."""
        
        # Extract response times for successful requests
        successful_times = [r["response_time"] for r in results if r.get("success", False)]
        
        if not successful_times:
            logger.error(f"No successful requests for {endpoint}")
            return {
                "endpoint": endpoint,
                "success_rate": 0,
                "sample_size": len(results),
                "error": "No successful requests"
            }
        
        # Calculate statistics
        min_time = min(successful_times)
        max_time = max(successful_times)
        avg_time = statistics.mean(successful_times)
        median_time = statistics.median(successful_times)
        p95_time = np.percentile(successful_times, 95)
        p99_time = np.percentile(successful_times, 99)
        
        # Calculate success rate
        success_rate = len(successful_times) / len(results) * 100
        
        # Generate report
        report = {
            "endpoint": endpoint,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "concurrency": concurrency,
            "sample_size": len(results),
            "success_rate": success_rate,
            "min_response_time": min_time,
            "max_response_time": max_time,
            "avg_response_time": avg_time,
            "median_response_time": median_time,
            "p95_response_time": p95_time,
            "p99_response_time": p99_time
        }
        
        # Save report to file
        report_file = REPORTS_DIR / f"performance_{endpoint.replace('/', '_')}_{int(time.time())}.json"
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)
        
        # Generate chart
        plt.figure(figsize=(10, 6))
        plt.hist(successful_times, bins=20, alpha=0.7)
        plt.axvline(avg_time, color='r', linestyle='dashed', linewidth=1, label=f'Mean: {avg_time:.3f}s')
        plt.axvline(median_time, color='g', linestyle='dashed', linewidth=1, label=f'Median: {median_time:.3f}s')
        plt.axvline(p95_time, color='y', linestyle='dashed', linewidth=1, label=f'95th: {p95_time:.3f}s')
        plt.title(f'Response Time Distribution - {endpoint} (Concurrency: {concurrency})')
        plt.xlabel('Response Time (seconds)')
        plt.ylabel('Frequency')
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Save chart
        chart_file = REPORTS_DIR / f"chart_{endpoint.replace('/', '_')}_{int(time.time())}.png"
        plt.savefig(chart_file)
        plt.close()
        
        logger.info(f"Performance report saved to {report_file}")
        logger.info(f"Performance chart saved to {chart_file}")
        
        return report
    
    def test_api_endpoints_baseline(self, api_health_check):
        """Test baseline performance of API endpoints."""
        # RED: This test will fail if any endpoint exceeds baseline performance thresholds
        
        endpoints = [
            "/api/v1/health",
            "/api/v1/products",
            "/api/v1/face-shapes",
            "/api/v1/recommendations",
            "/api/v1/users/profile"
        ]
        
        baseline_thresholds = {
            "/api/v1/health": 0.1,  # 100ms
            "/api/v1/products": 0.5,  # 500ms
            "/api/v1/face-shapes": 0.5,  # 500ms
            "/api/v1/recommendations": 1.0,  # 1000ms
            "/api/v1/users/profile": 0.5  # 500ms
        }
        
        for endpoint in endpoints:
            result = self.make_request(endpoint)
            
            assert result["success"], f"Request to {endpoint} failed: {result.get('error', result.get('status_code'))}"
            
            threshold = baseline_thresholds.get(endpoint, 1.0)
            assert result["response_time"] < threshold, (
                f"Response time for {endpoint} ({result['response_time']:.3f}s) "
                f"exceeds threshold ({threshold:.3f}s)"
            )
            
            logger.info(f"Endpoint {endpoint} response time: {result['response_time']:.3f}s (threshold: {threshold:.3f}s)")
    
    @pytest.mark.parametrize("concurrency", [5, 10, 20])
    def test_api_load_concurrent_users(self, api_health_check, concurrency):
        """Test API performance under concurrent user load."""
        # RED: This test will fail if performance degrades under load
        
        endpoints = [
            "/api/v1/health",
            "/api/v1/products",
            "/api/v1/recommendations"
        ]
        
        # Thresholds for different concurrency levels
        # Values represent maximum acceptable average response time in seconds
        threshold_map = {
            "/api/v1/health": {5: 0.2, 10: 0.3, 20: 0.5},
            "/api/v1/products": {5: 0.8, 10: 1.2, 20: 2.0},
            "/api/v1/recommendations": {5: 1.5, 10: 2.0, 20: 3.0}
        }
        
        for endpoint in endpoints:
            results = []
            
            # Make concurrent requests
            with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
                futures = [executor.submit(self.make_request, endpoint) for _ in range(concurrency)]
                for future in concurrent.futures.as_completed(futures):
                    results.append(future.result())
            
            # Generate report
            report = self.generate_performance_report(endpoint, results, concurrency)
            
            # Assert success rate
            assert report["success_rate"] >= 95, f"Success rate for {endpoint} ({report['success_rate']}%) is below threshold (95%)"
            
            # Assert average response time
            threshold = threshold_map.get(endpoint, {}).get(concurrency, 2.0)
            assert report["avg_response_time"] < threshold, (
                f"Average response time for {endpoint} ({report['avg_response_time']:.3f}s) "
                f"at concurrency {concurrency} exceeds threshold ({threshold:.3f}s)"
            )
            
            logger.info(
                f"Endpoint {endpoint} at concurrency {concurrency}: "
                f"avg={report['avg_response_time']:.3f}s, "
                f"median={report['median_response_time']:.3f}s, "
                f"p95={report['p95_response_time']:.3f}s, "
                f"success={report['success_rate']:.1f}%"
            )
    
    def test_api_sustained_load(self, api_health_check):
        """Test API performance under sustained load over time."""
        # RED: This test will fail if performance degrades over time
        
        endpoint = "/api/v1/products"
        duration = 30  # seconds
        request_interval = 1  # second
        
        results = []
        start_time = time.time()
        iteration = 0
        
        while time.time() - start_time < duration:
            iteration += 1
            result = self.make_request(endpoint)
            result["iteration"] = iteration
            result["elapsed_time"] = time.time() - start_time
            results.append(result)
            
            # Sleep until next interval
            next_request_time = start_time + (iteration * request_interval)
            sleep_time = max(0, next_request_time - time.time())
            if sleep_time > 0:
                time.sleep(sleep_time)
        
        # Calculate statistics by time segment
        segments = 3
        segment_size = len(results) // segments
        
        if segment_size == 0:
            pytest.skip("Not enough data points collected for meaningful analysis")
        
        segment_avg_times = []
        
        for i in range(segments):
            start_idx = i * segment_size
            end_idx = start_idx + segment_size if i < segments - 1 else len(results)
            segment_results = results[start_idx:end_idx]
            
            successful_times = [r["response_time"] for r in segment_results if r.get("success", False)]
            if successful_times:
                segment_avg = statistics.mean(successful_times)
                segment_avg_times.append(segment_avg)
                logger.info(f"Segment {i+1} average response time: {segment_avg:.3f}s")
        
        # Assert performance stability
        if len(segment_avg_times) >= 2:
            # Calculate percent increase from first to last segment
            percent_increase = (segment_avg_times[-1] / segment_avg_times[0] - 1) * 100
            
            # Allow up to 50% degradation
            assert percent_increase < 50, (
                f"Performance degraded by {percent_increase:.1f}% over time "
                f"(from {segment_avg_times[0]:.3f}s to {segment_avg_times[-1]:.3f}s)"
            )
            
            logger.info(f"Performance change over time: {percent_increase:.1f}%")
        
        # Generate time series chart
        plt.figure(figsize=(12, 6))
        
        # Extract data for plotting
        iterations = [r["iteration"] for r in results if r.get("success", False)]
        response_times = [r["response_time"] for r in results if r.get("success", False)]
        elapsed_times = [r["elapsed_time"] for r in results if r.get("success", False)]
        
        if not iterations:
            pytest.skip("No successful requests for time series analysis")
        
        # Plot response time vs elapsed time
        plt.scatter(elapsed_times, response_times, alpha=0.7)
        
        # Add trend line
        z = np.polyfit(elapsed_times, response_times, 1)
        p = np.poly1d(z)
        plt.plot(elapsed_times, p(elapsed_times), "r--", alpha=0.7)
        
        plt.title(f'Response Time vs Elapsed Time - {endpoint}')
        plt.xlabel('Elapsed Time (seconds)')
        plt.ylabel('Response Time (seconds)')
        plt.grid(True, alpha=0.3)
        
        # Save chart
        chart_file = REPORTS_DIR / f"timeseries_{endpoint.replace('/', '_')}_{int(time.time())}.png"
        plt.savefig(chart_file)
        plt.close()
        
        logger.info(f"Time series chart saved to {chart_file}")
    
    def test_database_query_performance(self, api_health_check):
        """Test database query performance through API endpoints."""
        # RED: This test will fail if database queries are inefficient
        
        # Endpoints that involve database queries
        endpoints = [
            "/api/v1/products?limit=50",  # List all products
            "/api/v1/products?category=sunglasses&limit=20",  # Filtered query
            "/api/v1/products?sort=price_asc&limit=20",  # Sorted query
            "/api/v1/recommendations?face_shape=oval&limit=10"  # Complex query
        ]
        
        # Thresholds for database query response times
        thresholds = {
            "/api/v1/products?limit=50": 1.0,  # 1 second
            "/api/v1/products?category=sunglasses&limit=20": 1.0,
            "/api/v1/products?sort=price_asc&limit=20": 1.0,
            "/api/v1/recommendations?face_shape=oval&limit=10": 1.5
        }
        
        for endpoint in endpoints:
            # Make request
            result = self.make_request(endpoint)
            
            # Assert success
            assert result["success"], f"Request to {endpoint} failed: {result.get('error', result.get('status_code'))}"
            
            # Assert performance
            threshold = thresholds.get(endpoint, 1.5)
            assert result["response_time"] < threshold, (
                f"Response time for {endpoint} ({result['response_time']:.3f}s) "
                f"exceeds threshold ({threshold:.3f}s)"
            )
            
            logger.info(f"Endpoint {endpoint} response time: {result['response_time']:.3f}s (threshold: {threshold:.3f}s)")
    
    def test_memory_usage(self, api_health_check):
        """Test memory usage during API operations."""
        # This test monitors memory usage patterns
        # RED: This will fail if memory usage increases significantly over time
        
        endpoint = "/api/v1/products"
        iterations = 50
        
        try:
            import psutil
            process = psutil.Process()
            
            # Capture initial memory usage
            initial_memory = process.memory_info().rss / 1024 / 1024  # MB
            
            memory_usage = [initial_memory]
            
            # Make repeated requests and monitor memory
            for i in range(iterations):
                self.make_request(endpoint)
                
                current_memory = process.memory_info().rss / 1024 / 1024
                memory_usage.append(current_memory)
                
                logger.info(f"Iteration {i+1}: Memory usage: {current_memory:.2f} MB")
            
            # Calculate memory growth
            memory_increase = memory_usage[-1] - memory_usage[0]
            percent_increase = (memory_usage[-1] / memory_usage[0] - 1) * 100
            
            logger.info(f"Initial memory: {memory_usage[0]:.2f} MB")
            logger.info(f"Final memory: {memory_usage[-1]:.2f} MB")
            logger.info(f"Increase: {memory_increase:.2f} MB ({percent_increase:.1f}%)")
            
            # Plot memory usage
            plt.figure(figsize=(10, 6))
            plt.plot(range(len(memory_usage)), memory_usage)
            plt.title('Memory Usage Over Time')
            plt.xlabel('Request Iteration')
            plt.ylabel('Memory Usage (MB)')
            plt.grid(True, alpha=0.3)
            
            # Save chart
            chart_file = REPORTS_DIR / f"memory_usage_{int(time.time())}.png"
            plt.savefig(chart_file)
            plt.close()
            
            logger.info(f"Memory usage chart saved to {chart_file}")
            
            # Assert memory stability (allow up to 20% growth)
            assert percent_increase < 20, f"Memory usage increased by {percent_increase:.1f}% (threshold: 20%)"
            
        except ImportError:
            pytest.skip("psutil not available, skipping memory test")
    
    def test_cache_effectiveness(self, api_health_check):
        """Test effectiveness of caching mechanisms."""
        # RED: This test will fail if caching is not working effectively
        
        endpoint = "/api/v1/products"
        iterations = 10
        
        # First request (uncached)
        first_result = self.make_request(endpoint)
        assert first_result["success"], f"Initial request failed: {first_result.get('error')}"
        
        uncached_time = first_result["response_time"]
        logger.info(f"Uncached response time: {uncached_time:.3f}s")
        
        # Subsequent requests (should be cached)
        cached_times = []
        
        for i in range(iterations):
            result = self.make_request(endpoint)
            assert result["success"], f"Request {i+1} failed: {result.get('error')}"
            
            cached_times.append(result["response_time"])
            logger.info(f"Request {i+1} response time: {result['response_time']:.3f}s")
        
        # Calculate average cached response time
        avg_cached_time = statistics.mean(cached_times)
        logger.info(f"Average cached response time: {avg_cached_time:.3f}s")
        
        # Assert caching effectiveness (cached should be at least 30% faster)
        speedup_percent = (1 - avg_cached_time / uncached_time) * 100
        
        logger.info(f"Cache speedup: {speedup_percent:.1f}%")
        
        # Caching should provide at least 30% speedup
        assert speedup_percent >= 30, f"Cache speedup ({speedup_percent:.1f}%) below threshold (30%)"