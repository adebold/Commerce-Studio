"""
Test Coverage Analysis and Reporting for MongoDB Foundation Hardening

This module provides comprehensive test coverage analysis for:
- Test execution statistics and coverage metrics
- Missing test scenarios identification
- Performance benchmarking results
- Security test validation results

Following TDD principles:
- Measure test coverage across all hardening modules
- Identify gaps in test scenarios
- Generate actionable coverage reports
- Validate test quality and effectiveness
"""

import pytest
import asyncio
import os
import sys
import subprocess
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pathlib import Path


class TestCoverageAnalyzer:
    """Analyze test coverage for MongoDB Foundation hardening modules"""
    
    def __init__(self, test_directory: str = "tests/mongodb_foundation"):
        self.test_directory = Path(test_directory)
        self.source_directory = Path("src")
        self.coverage_data = {}
        self.test_results = {}
        
    def discover_test_files(self) -> List[Path]:
        """Discover all test files in the test directory"""
        test_files = []
        for file_path in self.test_directory.glob("test_*.py"):
            test_files.append(file_path)
        return test_files
    
    def discover_source_modules(self) -> List[Path]:
        """Discover all source modules that need test coverage"""
        source_modules = []
        
        # Core hardening modules
        hardening_modules = [
            "src/validation/validators.py",
            "src/reliability/circuit_breaker.py",
            "src/performance/cache_manager.py",
            "src/performance/concurrent_limiter.py",
            "src/utils/datetime_utils.py"
        ]
        
        for module_path in hardening_modules:
            module_file = Path(module_path)
            if module_file.exists():
                source_modules.append(module_file)
        
        return source_modules
    
    async def analyze_test_coverage(self) -> Dict[str, Any]:
        """Analyze test coverage across all modules"""
        coverage_report = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "test_files": [],
            "source_modules": [],
            "coverage_summary": {},
            "missing_tests": [],
            "recommendations": []
        }
        
        # Discover files
        test_files = self.discover_test_files()
        source_modules = self.discover_source_modules()
        
        coverage_report["test_files"] = [str(f) for f in test_files]
        coverage_report["source_modules"] = [str(f) for f in source_modules]
        
        # Analyze each test file
        for test_file in test_files:
            test_analysis = await self.analyze_test_file(test_file)
            coverage_report[f"test_analysis_{test_file.stem}"] = test_analysis
        
        # Generate coverage summary
        coverage_report["coverage_summary"] = self.generate_coverage_summary(test_files, source_modules)
        
        # Identify missing tests
        coverage_report["missing_tests"] = self.identify_missing_tests(source_modules)
        
        # Generate recommendations
        coverage_report["recommendations"] = self.generate_recommendations(coverage_report)
        
        return coverage_report
    
    async def analyze_test_file(self, test_file: Path) -> Dict[str, Any]:
        """Analyze a specific test file for coverage and quality"""
        analysis = {
            "file_name": str(test_file),
            "test_classes": [],
            "test_methods": [],
            "coverage_areas": [],
            "tdd_compliance": {},
            "performance_tests": [],
            "security_tests": [],
            "integration_tests": []
        }
        
        try:
            # Read test file content
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract test classes and methods
            analysis["test_classes"] = self.extract_test_classes(content)
            analysis["test_methods"] = self.extract_test_methods(content)
            
            # Analyze coverage areas
            analysis["coverage_areas"] = self.analyze_coverage_areas(content)
            
            # Check TDD compliance
            analysis["tdd_compliance"] = self.check_tdd_compliance(content)
            
            # Categorize test types
            analysis["performance_tests"] = self.extract_performance_tests(content)
            analysis["security_tests"] = self.extract_security_tests(content)
            analysis["integration_tests"] = self.extract_integration_tests(content)
            
        except Exception as e:
            analysis["error"] = f"Failed to analyze {test_file}: {str(e)}"
        
        return analysis
    
    def extract_test_classes(self, content: str) -> List[str]:
        """Extract test class names from test file content"""
        import re
        class_pattern = r"class\s+(Test\w+)"
        matches = re.findall(class_pattern, content)
        return matches
    
    def extract_test_methods(self, content: str) -> List[str]:
        """Extract test method names from test file content"""
        import re
        method_pattern = r"def\s+(test_\w+)"
        matches = re.findall(method_pattern, content)
        return matches
    
    def analyze_coverage_areas(self, content: str) -> List[str]:
        """Analyze what areas of functionality are covered by tests"""
        coverage_areas = []
        
        # Check for specific patterns indicating coverage areas
        patterns = {
            "input_validation": r"validate_\w+|validation|sanitize",
            "cache_operations": r"cache\.|CacheManager|MemoryCache",
            "circuit_breaker": r"circuit_breaker|CircuitBreaker",
            "concurrent_limiting": r"concurrent_limiter|ConcurrentLimiter",
            "datetime_utilities": r"datetime_utils|utc_now|is_expired",
            "error_handling": r"Exception|Error|try:|except:",
            "performance": r"benchmark|performance|throughput",
            "security": r"injection|sanitize|security|malicious",
            "integration": r"integration|end_to_end|workflow"
        }
        
        for area, pattern in patterns.items():
            import re
            if re.search(pattern, content, re.IGNORECASE):
                coverage_areas.append(area)
        
        return coverage_areas
    
    def check_tdd_compliance(self, content: str) -> Dict[str, Any]:
        """Check if test file follows TDD principles"""
        compliance = {
            "has_red_phase_tests": False,
            "has_comprehensive_scenarios": False,
            "has_edge_case_tests": False,
            "has_failure_tests": False,
            "follows_aaa_pattern": False,
            "score": 0.0
        }
        
        # Check for RED phase indicators
        red_indicators = ["RED PHASE", "Write failing tests", "Expected behavior"]
        compliance["has_red_phase_tests"] = any(indicator in content for indicator in red_indicators)
        
        # Check for comprehensive scenarios
        scenario_indicators = ["Test Suite", "Expected behavior", "edge case", "boundary"]
        compliance["has_comprehensive_scenarios"] = len([i for i in scenario_indicators if i in content]) >= 2
        
        # Check for edge case testing
        edge_case_indicators = ["edge case", "boundary", "limit", "empty", "null", "invalid"]
        compliance["has_edge_case_tests"] = len([i for i in edge_case_indicators if i in content]) >= 2
        
        # Check for failure testing
        failure_indicators = ["Exception", "Error", "fail", "timeout", "reject"]
        compliance["has_failure_tests"] = len([i for i in failure_indicators if i in content]) >= 3
        
        # Check for AAA pattern (Arrange-Act-Assert)
        aaa_indicators = ["# Arrange", "# Act", "# Assert", "assert", "await", "mock"]
        compliance["follows_aaa_pattern"] = len([i for i in aaa_indicators if i in content]) >= 3
        
        # Calculate compliance score
        total_checks = len([k for k in compliance.keys() if k != "score"])
        passed_checks = sum(1 for k, v in compliance.items() if k != "score" and v)
        compliance["score"] = passed_checks / total_checks
        
        return compliance
    
    def extract_performance_tests(self, content: str) -> List[str]:
        """Extract performance test method names"""
        import re
        perf_pattern = r"def\s+(test_.*(?:performance|benchmark|throughput|latency|speed)\w*)"
        matches = re.findall(perf_pattern, content, re.IGNORECASE)
        return matches
    
    def extract_security_tests(self, content: str) -> List[str]:
        """Extract security test method names"""
        import re
        security_pattern = r"def\s+(test_.*(?:security|injection|sanitize|malicious|attack)\w*)"
        matches = re.findall(security_pattern, content, re.IGNORECASE)
        return matches
    
    def extract_integration_tests(self, content: str) -> List[str]:
        """Extract integration test method names"""
        import re
        integration_pattern = r"def\s+(test_.*(?:integration|end_to_end|workflow|complete)\w*)"
        matches = re.findall(integration_pattern, content, re.IGNORECASE)
        return matches
    
    def generate_coverage_summary(self, test_files: List[Path], source_modules: List[Path]) -> Dict[str, Any]:
        """Generate overall coverage summary"""
        summary = {
            "total_test_files": len(test_files),
            "total_source_modules": len(source_modules),
            "coverage_percentage": 0.0,
            "test_distribution": {},
            "quality_metrics": {}
        }
        
        # Calculate basic coverage percentage
        if source_modules:
            # Simplified coverage calculation based on file existence
            covered_modules = 0
            for module in source_modules:
                module_name = module.stem
                test_file_exists = any(f"test_{module_name}" in str(tf) for tf in test_files)
                if test_file_exists:
                    covered_modules += 1
            
            summary["coverage_percentage"] = (covered_modules / len(source_modules)) * 100
        
        # Test distribution
        summary["test_distribution"] = {
            "unit_tests": len([f for f in test_files if "test_" in f.name and "integration" not in f.name]),
            "integration_tests": len([f for f in test_files if "integration" in f.name]),
            "performance_tests": len([f for f in test_files if any(p in f.name for p in ["performance", "benchmark"])]),
            "security_tests": len([f for f in test_files if "security" in f.name])
        }
        
        return summary
    
    def identify_missing_tests(self, source_modules: List[Path]) -> List[Dict[str, str]]:
        """Identify missing test scenarios"""
        missing_tests = []
        
        # Define required test categories for each module type
        required_tests = {
            "validators": ["input_validation", "sanitization", "security_injection", "edge_cases"],
            "circuit_breaker": ["failure_detection", "recovery", "state_transitions", "performance"],
            "cache_manager": ["basic_operations", "ttl_expiration", "lru_eviction", "concurrency"],
            "concurrent_limiter": ["rate_limiting", "queue_management", "timeout_handling", "fairness"],
            "datetime_utils": ["timezone_handling", "validation", "conversion", "performance"]
        }
        
        for module in source_modules:
            module_name = module.stem
            if module_name in required_tests:
                for test_category in required_tests[module_name]:
                    # Check if test exists (simplified check)
                    test_file_pattern = f"test_{module_name}.py"
                    test_file_path = self.test_directory / test_file_pattern
                    
                    if not test_file_path.exists():
                        missing_tests.append({
                            "module": module_name,
                            "test_category": test_category,
                            "priority": "high",
                            "description": f"Missing {test_category} tests for {module_name}"
                        })
        
        return missing_tests
    
    def generate_recommendations(self, coverage_report: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate recommendations for improving test coverage"""
        recommendations = []
        
        # Coverage-based recommendations
        coverage_percentage = coverage_report["coverage_summary"]["coverage_percentage"]
        if coverage_percentage < 80:
            recommendations.append({
                "type": "coverage",
                "priority": "high",
                "description": f"Test coverage is {coverage_percentage:.1f}%. Target is 80%+",
                "action": "Add missing unit tests for uncovered modules"
            })
        
        # Performance test recommendations
        performance_test_count = len([
            test for analysis_key, analysis in coverage_report.items()
            if analysis_key.startswith("test_analysis_") and isinstance(analysis, dict)
            for test in analysis.get("performance_tests", [])
        ])
        
        if performance_test_count < 5:
            recommendations.append({
                "type": "performance",
                "priority": "medium",
                "description": f"Only {performance_test_count} performance tests found",
                "action": "Add comprehensive performance benchmarks"
            })
        
        # Security test recommendations
        security_test_count = len([
            test for analysis_key, analysis in coverage_report.items()
            if analysis_key.startswith("test_analysis_") and isinstance(analysis, dict)
            for test in analysis.get("security_tests", [])
        ])
        
        if security_test_count < 3:
            recommendations.append({
                "type": "security",
                "priority": "high",
                "description": f"Only {security_test_count} security tests found",
                "action": "Add comprehensive security validation tests"
            })
        
        # Integration test recommendations
        integration_test_count = len([
            test for analysis_key, analysis in coverage_report.items()
            if analysis_key.startswith("test_analysis_") and isinstance(analysis, dict)
            for test in analysis.get("integration_tests", [])
        ])
        
        if integration_test_count < 3:
            recommendations.append({
                "type": "integration",
                "priority": "medium",
                "description": f"Only {integration_test_count} integration tests found",
                "action": "Add end-to-end workflow validation tests"
            })
        
        return recommendations


class TestExecutionReporter:
    """Execute tests and generate comprehensive reports"""
    
    def __init__(self, test_directory: str = "tests/mongodb_foundation"):
        self.test_directory = test_directory
        
    async def run_test_suite(self) -> Dict[str, Any]:
        """Run the complete test suite and collect results"""
        execution_report = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "test_execution": {},
            "performance_metrics": {},
            "failure_analysis": {},
            "recommendations": []
        }
        
        try:
            # Run pytest with coverage
            test_command = [
                sys.executable, "-m", "pytest",
                self.test_directory,
                "-v",
                "--tb=short",
                "--maxfail=10",
                "--durations=10"
            ]
            
            start_time = time.time()
            result = subprocess.run(
                test_command,
                capture_output=True,
                text=True,
                cwd=os.getcwd()
            )
            end_time = time.time()
            
            execution_report["test_execution"] = {
                "command": " ".join(test_command),
                "return_code": result.returncode,
                "execution_time": end_time - start_time,
                "stdout": result.stdout[-2000:],  # Last 2000 chars
                "stderr": result.stderr[-1000:] if result.stderr else ""
            }
            
            # Parse test results
            execution_report["performance_metrics"] = self.parse_performance_metrics(result.stdout)
            execution_report["failure_analysis"] = self.analyze_failures(result.stdout, result.stderr)
            
        except Exception as e:
            execution_report["error"] = f"Failed to execute tests: {str(e)}"
        
        return execution_report
    
    def parse_performance_metrics(self, stdout: str) -> Dict[str, Any]:
        """Parse performance metrics from test output"""
        metrics = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "skipped_tests": 0,
            "slowest_tests": []
        }
        
        # Extract basic test counts
        import re
        
        # Look for pytest summary line
        summary_pattern = r"(\d+) passed.*?(\d+) failed.*?(\d+) skipped"
        summary_match = re.search(summary_pattern, stdout)
        if summary_match:
            metrics["passed_tests"] = int(summary_match.group(1))
            metrics["failed_tests"] = int(summary_match.group(2))
            metrics["skipped_tests"] = int(summary_match.group(3))
            metrics["total_tests"] = metrics["passed_tests"] + metrics["failed_tests"] + metrics["skipped_tests"]
        
        # Extract slowest tests
        duration_pattern = r"(\d+\.\d+)s call.*?(test_\w+)"
        duration_matches = re.findall(duration_pattern, stdout)
        metrics["slowest_tests"] = [
            {"test_name": test_name, "duration": float(duration)}
            for duration, test_name in duration_matches
        ]
        
        return metrics
    
    def analyze_failures(self, stdout: str, stderr: str) -> Dict[str, Any]:
        """Analyze test failures and errors"""
        analysis = {
            "failure_count": 0,
            "error_types": {},
            "common_issues": [],
            "import_errors": []
        }
        
        # Count failures
        failure_indicators = ["FAILED", "ERROR", "AssertionError"]
        for indicator in failure_indicators:
            count = stdout.count(indicator) + stderr.count(indicator)
            if count > 0:
                analysis["error_types"][indicator] = count
                analysis["failure_count"] += count
        
        # Identify import errors
        if "ModuleNotFoundError" in stderr or "ImportError" in stderr:
            analysis["import_errors"].append("Missing module dependencies")
        
        # Identify common issues
        if "src" in stderr and "ModuleNotFoundError" in stderr:
            analysis["common_issues"].append("Source module import issues - check PYTHONPATH")
        
        if "conftest" in stderr:
            analysis["common_issues"].append("Test configuration issues - check conftest.py")
        
        return analysis


# Main test coverage execution
@pytest.mark.asyncio
async def test_generate_comprehensive_coverage_report():
    """
    TEST: Generate comprehensive test coverage report
    
    Expected behavior:
    - Analyze all test files and source modules
    - Generate coverage statistics and recommendations
    - Identify missing test scenarios
    - Provide actionable improvement suggestions
    """
    analyzer = TestCoverageAnalyzer()
    coverage_report = await analyzer.analyze_test_coverage()
    
    # Validate report structure
    assert "timestamp" in coverage_report
    assert "test_files" in coverage_report
    assert "source_modules" in coverage_report
    assert "coverage_summary" in coverage_report
    assert "missing_tests" in coverage_report
    assert "recommendations" in coverage_report
    
    # Coverage should be reasonable
    coverage_percentage = coverage_report["coverage_summary"]["coverage_percentage"]
    assert coverage_percentage >= 0
    assert coverage_percentage <= 100
    
    # Should have identified test files
    assert len(coverage_report["test_files"]) > 0
    
    # Should have recommendations if coverage is low
    if coverage_percentage < 90:
        assert len(coverage_report["recommendations"]) > 0
    
    print(f"\nTest Coverage Report Generated:")
    print(f"Coverage: {coverage_percentage:.1f}%")
    print(f"Test Files: {len(coverage_report['test_files'])}")
    print(f"Source Modules: {len(coverage_report['source_modules'])}")
    print(f"Recommendations: {len(coverage_report['recommendations'])}")
    
    return coverage_report


@pytest.mark.asyncio
async def test_execute_test_suite_and_analyze():
    """
    TEST: Execute test suite and analyze results
    
    Expected behavior:
    - Run all MongoDB Foundation tests
    - Collect performance metrics
    - Analyze failures and provide recommendations
    - Generate actionable report
    """
    reporter = TestExecutionReporter()
    execution_report = await reporter.run_test_suite()
    
    # Validate execution report
    assert "timestamp" in execution_report
    assert "test_execution" in execution_report
    
    # Check if tests were attempted
    execution_data = execution_report["test_execution"]
    assert "return_code" in execution_data
    assert "execution_time" in execution_data
    
    print(f"\nTest Execution Report:")
    print(f"Return Code: {execution_data['return_code']}")
    print(f"Execution Time: {execution_data['execution_time']:.2f}s")
    
    if "performance_metrics" in execution_report:
        metrics = execution_report["performance_metrics"]
        print(f"Total Tests: {metrics.get('total_tests', 0)}")
        print(f"Passed: {metrics.get('passed_tests', 0)}")
        print(f"Failed: {metrics.get('failed_tests', 0)}")
    
    return execution_report


if __name__ == "__main__":
    # Run coverage analysis
    asyncio.run(test_generate_comprehensive_coverage_report())
    asyncio.run(test_execute_test_suite_and_analyze())