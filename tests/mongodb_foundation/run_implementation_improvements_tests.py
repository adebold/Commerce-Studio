#!/usr/bin/env python3
"""
Implementation Improvements Test Runner
======================================

This script runs all the tests created to address the critical issues identified
in the MongoDB Foundation Service review. It validates that all implementation
improvements are working correctly.

Tests included:
1. Real Security Validation Tests
2. Real Database Operations Tests  
3. Real Performance Benchmarks Tests
4. Consistent Error Handling Tests

Usage:
    python run_implementation_improvements_tests.py
    python run_implementation_improvements_tests.py --verbose
    python run_implementation_improvements_tests.py --performance-only
    python run_implementation_improvements_tests.py --security-only
"""

import os
import sys
import subprocess
import argparse
import time
from typing import Dict, List, Tuple
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


class TestRunner:
    """Runs implementation improvement tests with detailed reporting"""
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.test_results: Dict[str, Dict] = {}
        self.start_time = time.time()
        
    def print_header(self):
        """Print test runner header"""
        print("=" * 80)
        print("MongoDB Foundation Service - Implementation Improvements Test Runner")
        print("=" * 80)
        print(f"Testing implementation improvements to address critical issues")
        print(f"Started at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        print()
        
    def print_section(self, title: str):
        """Print section header"""
        print(f"\n{'=' * 60}")
        print(f"🧪 {title}")
        print(f"{'=' * 60}")
        
    def run_test_file(self, test_file: str, description: str) -> Tuple[bool, Dict]:
        """Run a specific test file and capture results"""
        print(f"\n🔍 Running: {description}")
        print(f"   File: {test_file}")
        
        # Build pytest command
        cmd = [
            sys.executable, "-m", "pytest",
            test_file,
            "-v" if self.verbose else "-q",
            "--tb=short",
            "--no-header",
            "--disable-warnings"
        ]
        
        # Run the test
        start_time = time.time()
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent
            )
            
            execution_time = time.time() - start_time
            
            # Parse results
            success = result.returncode == 0
            output = result.stdout
            errors = result.stderr
            
            # Extract test counts from output
            test_count = self._extract_test_count(output)
            
            test_result = {
                'success': success,
                'execution_time': execution_time,
                'test_count': test_count,
                'output': output,
                'errors': errors,
                'description': description
            }
            
            # Print immediate results
            status = "✅ PASSED" if success else "❌ FAILED"
            print(f"   Status: {status}")
            print(f"   Tests: {test_count}")
            print(f"   Time: {execution_time:.2f}s")
            
            if not success and errors:
                print(f"   Errors: {errors[:200]}...")
                
            return success, test_result
            
        except Exception as e:
            print(f"   ❌ ERROR: Failed to run test - {e}")
            return False, {
                'success': False,
                'execution_time': 0,
                'test_count': 0,
                'output': '',
                'errors': str(e),
                'description': description
            }
    
    def _extract_test_count(self, output: str) -> int:
        """Extract test count from pytest output"""
        try:
            # Look for patterns like "3 passed" or "5 passed, 2 warnings"
            for line in output.split('\n'):
                if 'passed' in line and ('=' in line or 'warnings' in line):
                    words = line.split()
                    for i, word in enumerate(words):
                        if word == 'passed' and i > 0:
                            return int(words[i-1])
            return 0
        except:
            return 0
    
    def run_security_tests(self) -> bool:
        """Run security validation tests"""
        self.print_section("Security Validation Tests")
        
        success, result = self.run_test_file(
            "test_real_security_validation.py",
            "Real Security Validation - Addresses Mock Security Implementation"
        )
        
        self.test_results['security'] = result
        
        if success:
            print("   ✅ Security validation is active and working")
            print("   ✅ Malicious inputs properly detected and rejected")
            print("   ✅ No false positives with valid inputs")
        else:
            print("   ❌ Security validation tests failed")
            
        return success
    
    def run_database_tests(self) -> bool:
        """Run real database operation tests"""
        self.print_section("Real Database Operations Tests")
        
        success, result = self.run_test_file(
            "test_real_database_operations.py",
            "Real Database Operations - Addresses Mock-Heavy Implementation"
        )
        
        self.test_results['database'] = result
        
        if success:
            print("   ✅ Real database operations confirmed")
            print("   ✅ Data persistence validated")
            print("   ✅ No mock dependencies detected")
        else:
            print("   ❌ Database operations tests failed")
            
        return success
    
    def run_performance_tests(self) -> bool:
        """Run performance benchmark tests"""
        self.print_section("Performance Benchmarks Tests")
        
        success, result = self.run_test_file(
            "test_real_performance_benchmarks.py",
            "Real Performance Benchmarks - Addresses False Performance Claims"
        )
        
        self.test_results['performance'] = result
        
        if success:
            print("   ✅ Realistic performance benchmarks validated")
            print("   ✅ False 15,000+ ops/sec claims debunked")
            print("   ✅ Memory usage patterns confirm real operations")
        else:
            print("   ❌ Performance benchmark tests failed")
            
        return success
    
    def run_error_handling_tests(self) -> bool:
        """Run error handling consistency tests"""
        self.print_section("Error Handling Consistency Tests")
        
        success, result = self.run_test_file(
            "test_consistent_error_handling.py",
            "Consistent Error Handling - Addresses Inconsistent Error Patterns"
        )
        
        self.test_results['error_handling'] = result
        
        if success:
            print("   ✅ Consistent error handling patterns validated")
            print("   ✅ Standardized error messages and structure")
            print("   ✅ Error recovery patterns working")
        else:
            print("   ❌ Error handling consistency tests failed")
            
        return success
    
    def print_summary(self):
        """Print comprehensive test summary"""
        self.print_section("Implementation Improvements Test Summary")
        
        total_time = time.time() - self.start_time
        total_tests = sum(result.get('test_count', 0) for result in self.test_results.values())
        total_success = all(result.get('success', False) for result in self.test_results.values())
        
        print(f"\n📊 Overall Results:")
        print(f"   Total execution time: {total_time:.2f}s")
        print(f"   Total tests executed: {total_tests}")
        print(f"   Overall status: {'✅ ALL PASSED' if total_success else '❌ SOME FAILED'}")
        
        print(f"\n📋 Test Category Results:")
        
        categories = [
            ('security', 'Security Validation', 'Mock Security Implementation'),
            ('database', 'Database Operations', 'Mock-Heavy Implementation'),
            ('performance', 'Performance Benchmarks', 'False Performance Claims'),
            ('error_handling', 'Error Handling', 'Inconsistent Error Patterns')
        ]
        
        for category, name, addresses in categories:
            if category in self.test_results:
                result = self.test_results[category]
                status = "✅ PASSED" if result['success'] else "❌ FAILED"
                print(f"   {name}: {status} ({result['test_count']} tests, {result['execution_time']:.2f}s)")
                print(f"      Addresses: {addresses}")
            else:
                print(f"   {name}: ⏭️ SKIPPED")
        
        print(f"\n🎯 Critical Issues Status:")
        issues_status = [
            ("Mock-Heavy Implementation", self.test_results.get('database', {}).get('success', False)),
            ("False Performance Claims", self.test_results.get('performance', {}).get('success', False)),
            ("Mock Security Implementation", self.test_results.get('security', {}).get('success', False)),
            ("Inconsistent Error Handling", self.test_results.get('error_handling', {}).get('success', False))
        ]
        
        resolved_count = 0
        for issue, resolved in issues_status:
            status = "✅ RESOLVED" if resolved else "❌ UNRESOLVED"
            print(f"   {issue}: {status}")
            if resolved:
                resolved_count += 1
        
        print(f"\n📈 Production Readiness Assessment:")
        if resolved_count == len(issues_status):
            print("   Status: ✅ PRODUCTION READY")
            print("   All critical issues have been resolved with comprehensive testing")
        elif resolved_count >= len(issues_status) * 0.75:
            print("   Status: ⚠️ MOSTLY READY")
            print("   Most critical issues resolved, some remaining issues need attention")
        else:
            print("   Status: ❌ NOT PRODUCTION READY")
            print("   Multiple critical issues remain unresolved")
        
        if self.verbose and not total_success:
            print(f"\n🔍 Detailed Error Information:")
            for category, result in self.test_results.items():
                if not result['success'] and result['errors']:
                    print(f"\n{category.upper()} ERRORS:")
                    print(result['errors'][:500])
                    if len(result['errors']) > 500:
                        print("... (truncated)")
    
    def check_mongodb_connection(self) -> bool:
        """Check if MongoDB is available for testing"""
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            import asyncio
            
            async def check_connection():
                client = AsyncIOMotorClient('mongodb://localhost:27017')
                try:
                    await client.admin.command('ping')
                    return True
                except:
                    return False
                finally:
                    client.close()
            
            return asyncio.run(check_connection())
        except:
            return False
    
    def run_all_tests(self, test_filter: str = None) -> bool:
        """Run all implementation improvement tests"""
        self.print_header()
        
        # Check MongoDB connection
        if not self.check_mongodb_connection():
            print("⚠️  WARNING: MongoDB not available - some tests may be skipped")
            print("   To run all tests, ensure MongoDB is running on localhost:27017")
            print()
        
        all_success = True
        
        # Run tests based on filter
        if test_filter is None or test_filter == "security":
            success = self.run_security_tests()
            all_success = all_success and success
            
        if test_filter is None or test_filter == "database":
            success = self.run_database_tests()
            all_success = all_success and success
            
        if test_filter is None or test_filter == "performance":
            success = self.run_performance_tests()
            all_success = all_success and success
            
        if test_filter is None or test_filter == "error":
            success = self.run_error_handling_tests()
            all_success = all_success and success
        
        # Print summary
        self.print_summary()
        
        return all_success


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Run MongoDB Foundation Service implementation improvements tests")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--security-only", action="store_true", help="Run only security tests")
    parser.add_argument("--database-only", action="store_true", help="Run only database tests")
    parser.add_argument("--performance-only", action="store_true", help="Run only performance tests")
    parser.add_argument("--error-only", action="store_true", help="Run only error handling tests")
    
    args = parser.parse_args()
    
    # Determine test filter
    test_filter = None
    if args.security_only:
        test_filter = "security"
    elif args.database_only:
        test_filter = "database"
    elif args.performance_only:
        test_filter = "performance"
    elif args.error_only:
        test_filter = "error"
    
    # Run tests
    runner = TestRunner(verbose=args.verbose)
    success = runner.run_all_tests(test_filter)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()