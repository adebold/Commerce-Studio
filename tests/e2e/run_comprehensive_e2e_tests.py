#!/usr/bin/env python3
"""
Comprehensive E2E Test Runner for EyewearML Platform

This script runs all E2E tests and generates a detailed report
of platform functionality and gaps.
"""

import subprocess
import sys
import json
import time
from datetime import datetime
from pathlib import Path


def run_tests():
    """Run the E2E tests and capture results."""
    print("🚀 Starting Comprehensive E2E Testing...")
    print("=" * 60)
    
    # Run the tests with JSON output
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/e2e/test_api_endpoints_live.py",
        "tests/e2e/test_business_logic_endpoints.py",
        "-v", "--tb=short",
        "--json-report", "--json-report-file=tests/e2e/test_results.json"
    ]
    
    start_time = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True)
    end_time = time.time()
    
    print(f"⏱️  Test execution time: {end_time - start_time:.2f} seconds")
    print("=" * 60)
    
    # Print test output
    print("📋 Test Output:")
    print(result.stdout)
    
    if result.stderr:
        print("⚠️  Warnings/Errors:")
        print(result.stderr)
    
    return result.returncode == 0, result.stdout, result.stderr


def generate_summary_report():
    """Generate a summary report from test results."""
    try:
        with open("tests/e2e/test_results.json", "r") as f:
            test_data = json.load(f)
    except FileNotFoundError:
        print("❌ Test results file not found")
        return
    
    summary = test_data.get("summary", {})
    
    print("\n📊 TEST SUMMARY REPORT")
    print("=" * 60)
    print(f"📅 Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"⏱️  Duration: {summary.get('duration', 0):.2f} seconds")
    print(f"✅ Passed: {summary.get('passed', 0)}")
    print(f"❌ Failed: {summary.get('failed', 0)}")
    print(f"⚠️  Skipped: {summary.get('skipped', 0)}")
    print(f"🔢 Total: {summary.get('total', 0)}")
    
    # Calculate success rate
    total = summary.get('total', 0)
    passed = summary.get('passed', 0)
    if total > 0:
        success_rate = (passed / total) * 100
        print(f"📈 Success Rate: {success_rate:.1f}%")
    
    print("\n🎯 PLATFORM STATUS")
    print("=" * 60)
    
    if summary.get('failed', 0) == 0:
        print("🟢 All tests passing - Platform core functionality operational")
    elif summary.get('failed', 0) <= 2:
        print("🟡 Minor issues detected - Platform mostly operational")
    else:
        print("🔴 Multiple failures - Platform needs attention")
    
    # Analyze specific test results
    tests = test_data.get("tests", [])
    
    print("\n📋 DETAILED TEST ANALYSIS")
    print("=" * 60)
    
    categories = {
        "API Infrastructure": ["server_responding", "docs_available", "openapi_spec"],
        "Authentication": ["registration_flow", "authentication_flow", "protected_endpoint"],
        "Error Handling": ["error_handling", "validation_errors"],
        "Performance": ["response_times", "rate_limiting"],
        "Security": ["manufacturer_endpoint", "cors_headers"],
        "Product Catalog": ["product_catalog", "product_detail", "product_search"],
        "Face Shape Analysis": ["face_shape_analysis", "face_shape_upload"],
        "Recommendations": ["recommendations_endpoint", "face_shape_recommendations", "personalized_recommendations"],
        "Virtual Try-On": ["virtual_tryon", "virtual_tryon_status"]
    }
    
    for category, test_keywords in categories.items():
        category_tests = [t for t in tests if any(keyword in t.get("nodeid", "") for keyword in test_keywords)]
        passed_count = sum(1 for t in category_tests if t.get("outcome") == "passed")
        total_count = len(category_tests)
        
        if total_count > 0:
            status = "✅" if passed_count == total_count else "⚠️" if passed_count > 0 else "❌"
            print(f"{status} {category}: {passed_count}/{total_count} tests passing")


def main():
    """Main execution function."""
    print("🧪 EyewearML Platform - Comprehensive E2E Testing")
    print("=" * 60)
    print("Testing API server functionality, authentication, and core features...")
    print()
    
    # Run the tests
    success, stdout, stderr = run_tests()
    
    # Generate summary report
    generate_summary_report()
    
    print("\n📄 DETAILED REPORTS AVAILABLE:")
    print("=" * 60)
    print("📋 Test Report: tests/e2e/e2e_test_report.md")
    print("📊 JSON Results: tests/e2e/test_results.json")
    print("🧪 Test Code: tests/e2e/test_api_endpoints_live.py")
    
    print("\n🎯 NEXT STEPS:")
    print("=" * 60)
    if success:
        print("✅ All tests passing! Platform core is operational.")
        print("📋 Review the detailed report for improvement recommendations.")
    else:
        print("⚠️  Some tests failed. Review the detailed output above.")
        print("🔧 Address failing tests before proceeding to production.")
    
    print("\n🚀 SPARC Phase 3.2 E2E Testing Complete!")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())