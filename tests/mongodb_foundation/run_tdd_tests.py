#!/usr/bin/env python3
"""
MongoDB Foundation Service - TDD Test Runner
============================================

This script runs the test-driven development framework tests for the MongoDB Foundation Service.
It provides options to run different phases of TDD testing and generate comprehensive reports.

Usage:
    python run_tdd_tests.py --phase red
    python run_tdd_tests.py --phase green
    python run_tdd_tests.py --performance
    python run_tdd_tests.py --security
    python run_tdd_tests.py --all
"""

import sys
import os
import argparse
import subprocess
import time
from pathlib import Path
from typing import List, Dict, Optional

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


class TDDTestRunner:
    """
    Test-Driven Development Test Runner for MongoDB Foundation Service
    """
    
    def __init__(self):
        self.test_dir = Path(__file__).parent
        self.project_root = self.test_dir.parent.parent
        self.results = {}
    
    def run_red_phase_tests(self) -> Dict:
        """
        Run RED phase tests (should fail initially)
        
        These tests define the expected behavior before implementation
        and should fail until the MongoDB Foundation Service is implemented.
        """
        print("🔴 Running RED Phase Tests (Expected to Fail)")
        print("=" * 60)
        
        cmd = [
            "python", "-m", "pytest",
            str(self.test_dir / "test_tdd_framework_specification.py"),
            "-m", "red_phase",
            "-v",
            "--tb=short",
            "--no-cov"  # Skip coverage for RED phase
        ]
        
        result = self._run_pytest(cmd, expect_failure=True)
        self.results["red_phase"] = result
        
        print(f"\n🔴 RED Phase Results: {result['failed']} tests failed (expected)")
        return result
    
    def run_green_phase_tests(self) -> Dict:
        """
        Run GREEN phase tests (should pass after implementation)
        
        These tests verify the implemented MongoDB Foundation Service
        meets all requirements.
        """
        print("🟢 Running GREEN Phase Tests (Should Pass)")
        print("=" * 60)
        
        cmd = [
            "python", "-m", "pytest",
            str(self.test_dir / "test_tdd_framework_specification.py"),
            "-m", "green_phase",
            "-v",
            "--cov=src/mongodb_foundation",
            "--cov-report=html"
        ]
        
        result = self._run_pytest(cmd)
        self.results["green_phase"] = result
        
        print(f"\n🟢 GREEN Phase Results: {result['passed']} tests passed")
        return result
    
    def run_performance_tests(self) -> Dict:
        """
        Run performance benchmark tests
        
        Validates sub-100ms query requirements for 10,000+ products.
        """
        print("⚡ Running Performance Tests")
        print("=" * 60)
        
        cmd = [
            "python", "-m", "pytest",
            str(self.test_dir / "test_tdd_framework_specification.py"),
            "-m", "performance",
            "-v",
            "--benchmark-only",
            "--benchmark-sort=mean"
        ]
        
        result = self._run_pytest(cmd)
        self.results["performance"] = result
        
        print(f"\n⚡ Performance Test Results: {result['passed']} benchmarks passed")
        return result
    
    def run_security_tests(self) -> Dict:
        """
        Run security validation tests
        
        Tests input sanitization, authentication, and data protection.
        """
        print("🔒 Running Security Tests")
        print("=" * 60)
        
        cmd = [
            "python", "-m", "pytest",
            str(self.test_dir / "test_tdd_framework_specification.py"),
            "-m", "security",
            "-v",
            "--tb=long"
        ]
        
        result = self._run_pytest(cmd)
        self.results["security"] = result
        
        print(f"\n🔒 Security Test Results: {result['passed']} tests passed")
        return result
    
    def run_integration_tests(self) -> Dict:
        """
        Run integration tests
        
        Tests integration with ProductDataService and SKU Genie.
        """
        print("🔗 Running Integration Tests")
        print("=" * 60)
        
        cmd = [
            "python", "-m", "pytest",
            str(self.test_dir / "test_tdd_framework_specification.py"),
            "-m", "integration",
            "-v",
            "--tb=short"
        ]
        
        result = self._run_pytest(cmd)
        self.results["integration"] = result
        
        print(f"\n🔗 Integration Test Results: {result['passed']} tests passed")
        return result
    
    def run_all_tests(self) -> Dict:
        """
        Run comprehensive test suite
        """
        print("🚀 Running Complete TDD Test Suite")
        print("=" * 60)
        
        cmd = [
            "python", "-m", "pytest",
            str(self.test_dir / "test_tdd_framework_specification.py"),
            "-v",
            "--cov=src/mongodb_foundation",
            "--cov-report=html",
            "--cov-report=term-missing",
            "--cov-fail-under=85",
            "--html=tests/mongodb_foundation/report.html",
            "--self-contained-html"
        ]
        
        result = self._run_pytest(cmd)
        self.results["all"] = result
        
        self._generate_summary_report()
        return result
    
    def validate_test_environment(self) -> bool:
        """
        Validate the test environment is properly configured
        """
        print("🔍 Validating Test Environment")
        print("-" * 40)
        
        # Check Python version
        if sys.version_info < (3, 8):
            print("❌ Python 3.8+ required")
            return False
        print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}")
        
        # Check required packages
        required_packages = [
            "pytest", "pytest-asyncio", "motor", "pymongo", 
            "mongomock", "faker", "pytest-cov"
        ]
        
        for package in required_packages:
            try:
                __import__(package.replace("-", "_"))
                print(f"✅ {package}")
            except ImportError:
                print(f"❌ {package} not installed")
                return False
        
        # Check test files exist
        test_files = [
            "test_tdd_framework_specification.py",
            "conftest.py",
            "pytest.ini",
            "test_requirements.txt"
        ]
        
        for test_file in test_files:
            if (self.test_dir / test_file).exists():
                print(f"✅ {test_file}")
            else:
                print(f"❌ {test_file} missing")
                return False
        
        print("✅ Test environment validated")
        return True
    
    def _run_pytest(self, cmd: List[str], expect_failure: bool = False) -> Dict:
        """
        Run pytest command and capture results
        """
        start_time = time.time()
        
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            end_time = time.time()
            duration = end_time - start_time
            
            # Parse pytest output for test counts
            output_lines = result.stdout.split('\n')
            passed = failed = skipped = 0
            
            for line in output_lines:
                if "passed" in line and "failed" in line:
                    # Extract numbers from summary line
                    words = line.split()
                    for i, word in enumerate(words):
                        if word == "passed":
                            passed = int(words[i-1])
                        elif word == "failed":
                            failed = int(words[i-1])
                        elif word == "skipped":
                            skipped = int(words[i-1])
            
            success = (result.returncode == 0) or (expect_failure and failed > 0)
            
            return {
                "success": success,
                "returncode": result.returncode,
                "passed": passed,
                "failed": failed,
                "skipped": skipped,
                "duration": duration,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Test execution timed out",
                "duration": 300
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "duration": 0
            }
    
    def _generate_summary_report(self):
        """
        Generate a comprehensive summary report
        """
        print("\n" + "=" * 80)
        print("📊 TDD FRAMEWORK SUMMARY REPORT")
        print("=" * 80)
        
        total_passed = sum(r.get("passed", 0) for r in self.results.values())
        total_failed = sum(r.get("failed", 0) for r in self.results.values())
        total_skipped = sum(r.get("skipped", 0) for r in self.results.values())
        total_duration = sum(r.get("duration", 0) for r in self.results.values())
        
        print(f"Total Tests Run: {total_passed + total_failed + total_skipped}")
        print(f"Passed: {total_passed}")
        print(f"Failed: {total_failed}")
        print(f"Skipped: {total_skipped}")
        print(f"Total Duration: {total_duration:.2f}s")
        
        print("\nPhase Results:")
        for phase, result in self.results.items():
            status = "✅" if result.get("success", False) else "❌"
            print(f"  {status} {phase.upper()}: {result.get('passed', 0)} passed, {result.get('failed', 0)} failed")
        
        print("\n📋 Next Steps:")
        if "red_phase" in self.results and self.results["red_phase"].get("failed", 0) > 0:
            print("  1. ✅ RED phase complete - tests define expected behavior")
            print("  2. 🔄 Implement MongoDB Foundation Service to pass tests")
            print("  3. 🟢 Run GREEN phase tests to verify implementation")
        elif "green_phase" in self.results and self.results["green_phase"].get("passed", 0) > 0:
            print("  1. ✅ GREEN phase complete - implementation working")
            print("  2. 🔄 Consider REFACTOR phase for optimization")
        
        print(f"\n📁 Reports saved to: {self.test_dir}/htmlcov/")


def main():
    """
    Main entry point for TDD test runner
    """
    parser = argparse.ArgumentParser(
        description="Run MongoDB Foundation Service TDD tests"
    )
    
    parser.add_argument(
        "--phase", 
        choices=["red", "green", "refactor"],
        help="Run specific TDD phase tests"
    )
    
    parser.add_argument(
        "--performance",
        action="store_true",
        help="Run performance benchmark tests"
    )
    
    parser.add_argument(
        "--security",
        action="store_true",
        help="Run security validation tests"
    )
    
    parser.add_argument(
        "--integration",
        action="store_true",
        help="Run integration tests"
    )
    
    parser.add_argument(
        "--all",
        action="store_true",
        help="Run complete test suite"
    )
    
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Validate test environment only"
    )
    
    args = parser.parse_args()
    
    runner = TDDTestRunner()
    
    # Validate environment first
    if not runner.validate_test_environment():
        print("❌ Environment validation failed")
        sys.exit(1)
    
    if args.validate:
        print("✅ Environment validation complete")
        return
    
    # Run requested tests
    if args.phase == "red":
        runner.run_red_phase_tests()
    elif args.phase == "green":
        runner.run_green_phase_tests()
    elif args.performance:
        runner.run_performance_tests()
    elif args.security:
        runner.run_security_tests()
    elif args.integration:
        runner.run_integration_tests()
    elif args.all:
        runner.run_all_tests()
    else:
        # Default: run RED phase for TDD workflow
        print("No specific phase selected. Running RED phase tests...")
        runner.run_red_phase_tests()


if __name__ == "__main__":
    main()