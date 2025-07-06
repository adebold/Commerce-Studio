#!/usr/bin/env python3
"""
Test Runner for SPARC Phase 3.1 Configuration Testing Framework

This script orchestrates the execution of test suites following TDD principles:
1. Unit tests are run first (RED phase)
2. Implementation fixes are applied if needed
3. Unit tests are run again to verify fixes (GREEN phase)
4. Integration tests are run to verify component interaction
5. Performance tests are run as needed

Usage:
    python run_tests.py [--unit] [--integration] [--all] [--verbose]
"""

import argparse
import unittest
import sys
import os
import time
import importlib
import coverage
from unittest import TextTestRunner, TestSuite

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def discover_tests(test_type=None):
    """
    Discover and return test cases based on the specified type.
    
    Args:
        test_type (str): Type of tests to discover ('unit', 'integration', or None for all)
    
    Returns:
        unittest.TestSuite: Suite of discovered tests
    """
    loader = unittest.TestLoader()
    start_dir = os.path.dirname(os.path.abspath(__file__))
    
    if test_type == 'unit':
        # Discover only unit tests (avoid integration tests)
        pattern = 'test_*.py'
        excluded_patterns = ['test_monitoring_integration.py']
        
        all_tests = loader.discover(start_dir, pattern=pattern)
        filtered_suite = TestSuite()
        
        for suite in all_tests:
            for test_case in suite:
                module_name = test_case.__class__.__module__
                if not any(excluded in module_name for excluded in excluded_patterns):
                    filtered_suite.addTest(test_case)
        
        return filtered_suite
    
    elif test_type == 'integration':
        # Discover only integration tests
        pattern = 'test_monitoring_integration.py'
        return loader.discover(start_dir, pattern=pattern)
    
    else:
        # Discover all tests
        pattern = 'test_*.py'
        return loader.discover(start_dir, pattern=pattern)


def run_test_suite(test_suite, verbosity=1):
    """
    Run a test suite and return results.
    
    Args:
        test_suite (unittest.TestSuite): Suite of tests to run
        verbosity (int): Verbosity level (1-3)
    
    Returns:
        unittest.TestResult: Results of test execution
    """
    runner = TextTestRunner(verbosity=verbosity)
    print(f"\n{'='*80}")
    print(f"Running {test_suite.countTestCases()} tests...")
    print(f"{'='*80}")
    
    start_time = time.time()
    result = runner.run(test_suite)
    elapsed = time.time() - start_time
    
    print(f"\n{'='*80}")
    print(f"Test Results: {result.testsRun} tests run in {elapsed:.2f} seconds")
    print(f"- Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"- Failures: {len(result.failures)}")
    print(f"- Errors: {len(result.errors)}")
    print(f"{'='*80}\n")
    
    return result


def generate_coverage_report(test_suite):
    """
    Run tests with coverage and generate a report.
    
    Args:
        test_suite (unittest.TestSuite): Suite of tests to run with coverage
    
    Returns:
        float: Coverage percentage
    """
    cov = coverage.Coverage(
        source=['scripts'],
        omit=['*/__pycache__/*', '*/test_*', '*/venv/*']
    )
    
    print(f"\n{'='*80}")
    print("Generating code coverage report...")
    print(f"{'='*80}")
    
    cov.start()
    runner = TextTestRunner(verbosity=0)
    runner.run(test_suite)
    cov.stop()
    
    # Generate report
    cov.report()
    cov.html_report(directory='coverage_report')
    
    coverage_percentage = cov.report()
    return coverage_percentage


def main():
    """Main function to parse arguments and run tests."""
    parser = argparse.ArgumentParser(description='Run test suites for the monitoring system.')
    
    parser.add_argument('--unit', action='store_true', help='Run only unit tests')
    parser.add_argument('--integration', action='store_true', help='Run only integration tests')
    parser.add_argument('--all', action='store_true', help='Run all tests (default)')
    parser.add_argument('--verbose', '-v', action='count', default=1, help='Increase verbosity (can use multiple times)')
    parser.add_argument('--coverage', action='store_true', help='Generate coverage report')
    
    args = parser.parse_args()
    
    # Default to running all tests if no specific type is specified
    run_all = args.all or not (args.unit or args.integration)
    
    # RED phase - run unit tests first
    if args.unit or run_all:
        print("\n=== RED PHASE: Running Unit Tests ===")
        unit_tests = discover_tests('unit')
        unit_result = run_test_suite(unit_tests, args.verbose)
        
        if not unit_result.wasSuccessful():
            print("\n⚠️  Some unit tests are failing. Fix implementation before proceeding.")
            if not run_all:
                return 1
    
    # GREEN phase - run integration tests after unit tests pass
    if args.integration or run_all:
        print("\n=== GREEN PHASE: Running Integration Tests ===")
        integration_tests = discover_tests('integration')
        integration_result = run_test_suite(integration_tests, args.verbose)
        
        if not integration_result.wasSuccessful():
            print("\n⚠️  Some integration tests are failing. Fix implementation before proceeding.")
            return 1
    
    # REFACTOR phase - measure code coverage to identify refactoring opportunities
    if args.coverage:
        print("\n=== REFACTOR PHASE: Measuring Code Coverage ===")
        all_tests = discover_tests()
        coverage_percentage = generate_coverage_report(all_tests)
        
        if coverage_percentage < 80:
            print(f"\n⚠️  Code coverage is below 80% ({coverage_percentage:.1f}%). Consider adding more tests.")
            return 1
    
    print("\n✅ All tests completed successfully!")
    return 0


if __name__ == '__main__':
    sys.exit(main())