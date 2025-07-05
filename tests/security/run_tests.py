#!/usr/bin/env python3
"""
TDD Test Runner for Security Foundation [LS3_1.1-1.3]

This script executes the RED-phase test suite for the Security Foundation batch,
designed to drive implementation of core security capabilities.

Test Categories:
- Zero Trust Network Security [LS3_1.1]
- Multi-Tenant Security [LS3_1.2] 
- Security Compliance Audit [LS3_1.3]

Expected Behavior: ALL TESTS SHOULD FAIL during RED phase
This failure drives the subsequent GREEN phase implementation.
"""

import sys
import os
import subprocess
import argparse
import time
from pathlib import Path
from datetime import datetime
import json


class SecurityFoundationTestRunner:
    """Test runner for Security Foundation TDD tests."""
    
    def __init__(self):
        self.test_dir = Path(__file__).parent
        self.project_root = self.test_dir.parent.parent
        self.results = {
            "test_run_id": f"security_foundation_{int(time.time())}",
            "timestamp": datetime.utcnow().isoformat(),
            "phase": "RED",
            "expected_outcome": "ALL_TESTS_FAIL",
            "test_categories": {},
            "overall_summary": {}
        }
    
    def setup_environment(self):
        """Setup test environment and dependencies."""
        print("🔧 Setting up Security Foundation test environment...")
        
        # Install test dependencies
        requirements_file = self.test_dir / "requirements-test.txt"
        if requirements_file.exists():
            print(f"📦 Installing test dependencies from {requirements_file}")
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
            ], check=True)
        
        # Ensure test directories exist
        test_dirs = [
            self.test_dir / "security",
            self.test_dir / "multi_tenant", 
            self.test_dir / "zero_trust"
        ]
        
        for test_dir in test_dirs:
            test_dir.mkdir(parents=True, exist_ok=True)
            init_file = test_dir / "__init__.py"
            if not init_file.exists():
                init_file.write_text("# TDD Security Foundation Tests\n")
        
        print("✅ Environment setup complete")
    
    def run_zero_trust_tests(self):
        """Run Zero Trust Network Security tests."""
        print("\n🛡️  Running Zero Trust Network Security Tests [LS3_1.1]")
        print("=" * 60)
        
        test_files = [
            "test_zero_trust_architecture.py",
            "test_network_microsegmentation.py", 
            "test_continuous_verification.py"
        ]
        
        category_results = {
            "category": "Zero Trust Network Security",
            "test_files": {},
            "total_tests": 0,
            "failed_tests": 0,
            "passed_tests": 0,
            "expected_failures": 0
        }
        
        for test_file in test_files:
            test_path = self.test_dir / "zero_trust" / test_file
            if test_path.exists():
                print(f"\n🔍 Running {test_file}...")
                result = self._run_pytest(test_path)
                category_results["test_files"][test_file] = result
                category_results["total_tests"] += result.get("total", 0)
                category_results["failed_tests"] += result.get("failed", 0)
                category_results["passed_tests"] += result.get("passed", 0)
            else:
                print(f"⚠️  Test file {test_file} not found")
        
        # In RED phase, failures are expected and desired
        category_results["expected_failures"] = category_results["failed_tests"]
        self.results["test_categories"]["zero_trust"] = category_results
        
        return category_results
    
    def run_multi_tenant_tests(self):
        """Run Multi-Tenant Security tests."""
        print("\n🏢 Running Multi-Tenant Security Tests [LS3_1.2]")
        print("=" * 60)
        
        test_files = [
            "test_tenant_isolation.py",
            "test_tenant_access_control.py",
            "test_resource_quota_enforcement.py"
        ]
        
        category_results = {
            "category": "Multi-Tenant Security",
            "test_files": {},
            "total_tests": 0,
            "failed_tests": 0,
            "passed_tests": 0,
            "expected_failures": 0
        }
        
        for test_file in test_files:
            test_path = self.test_dir / "multi_tenant" / test_file
            if test_path.exists():
                print(f"\n🔍 Running {test_file}...")
                result = self._run_pytest(test_path)
                category_results["test_files"][test_file] = result
                category_results["total_tests"] += result.get("total", 0)
                category_results["failed_tests"] += result.get("failed", 0)
                category_results["passed_tests"] += result.get("passed", 0)
            else:
                print(f"⚠️  Test file {test_file} not found")
        
        # In RED phase, failures are expected and desired
        category_results["expected_failures"] = category_results["failed_tests"]
        self.results["test_categories"]["multi_tenant"] = category_results
        
        return category_results
    
    def run_compliance_audit_tests(self):
        """Run Security Compliance Audit tests."""
        print("\n📋 Running Security Compliance Audit Tests [LS3_1.3]")
        print("=" * 60)
        
        test_files = [
            "test_security_compliance_audit.py"
        ]
        
        category_results = {
            "category": "Security Compliance Audit",
            "test_files": {},
            "total_tests": 0,
            "failed_tests": 0,
            "passed_tests": 0,
            "expected_failures": 0
        }
        
        for test_file in test_files:
            test_path = self.test_dir / "security" / test_file
            if test_path.exists():
                print(f"\n🔍 Running {test_file}...")
                result = self._run_pytest(test_path)
                category_results["test_files"][test_file] = result
                category_results["total_tests"] += result.get("total", 0)
                category_results["failed_tests"] += result.get("failed", 0)
                category_results["passed_tests"] += result.get("passed", 0)
            else:
                print(f"⚠️  Test file {test_file} not found")
        
        # In RED phase, failures are expected and desired
        category_results["expected_failures"] = category_results["failed_tests"]
        self.results["test_categories"]["compliance_audit"] = category_results
        
        return category_results
    
    def _run_pytest(self, test_path):
        """Execute pytest on a specific test file."""
        try:
            # Run pytest with verbose output and JSON report
            cmd = [
                sys.executable, "-m", "pytest",
                str(test_path),
                "-v",
                "--tb=short",
                "--no-header"
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=str(self.project_root)
            )
            
            # Parse pytest output for test counts
            output_lines = result.stdout.split('\n')
            total_tests = 0
            failed_tests = 0
            passed_tests = 0
            
            for line in output_lines:
                if "failed" in line and "passed" in line:
                    # Parse line like "5 failed, 2 passed in 1.23s"
                    parts = line.split()
                    for i, part in enumerate(parts):
                        if part == "failed" and i > 0:
                            failed_tests = int(parts[i-1])
                        elif part == "passed" and i > 0:
                            passed_tests = int(parts[i-1])
                elif line.startswith("="):
                    # Look for summary lines
                    if "failed" in line:
                        # Extract numbers from summary
                        import re
                        numbers = re.findall(r'\d+', line)
                        if numbers:
                            failed_tests = int(numbers[0])
            
            total_tests = failed_tests + passed_tests
            
            return {
                "total": total_tests,
                "failed": failed_tests,
                "passed": passed_tests,
                "return_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
        except subprocess.CalledProcessError as e:
            return {
                "total": 0,
                "failed": 0,
                "passed": 0,
                "return_code": e.returncode,
                "error": str(e)
            }
    
    def generate_summary_report(self):
        """Generate comprehensive test run summary."""
        print("\n" + "=" * 80)
        print("🔴 SECURITY FOUNDATION TDD RED-PHASE SUMMARY")
        print("=" * 80)
        
        total_tests = 0
        total_failed = 0
        total_passed = 0
        
        for category_name, category_data in self.results["test_categories"].items():
            total_tests += category_data["total_tests"]
            total_failed += category_data["failed_tests"]
            total_passed += category_data["passed_tests"]
            
            print(f"\n📊 {category_data['category']}:")
            print(f"   Total Tests: {category_data['total_tests']}")
            print(f"   Failed: {category_data['failed_tests']} ✅ (Expected in RED phase)")
            print(f"   Passed: {category_data['passed_tests']} ⚠️  (Unexpected in RED phase)")
            
            if category_data['passed_tests'] > 0:
                print(f"   🚨 WARNING: {category_data['passed_tests']} tests passed unexpectedly!")
        
        self.results["overall_summary"] = {
            "total_tests": total_tests,
            "failed_tests": total_failed,
            "passed_tests": total_passed,
            "red_phase_compliance": total_failed == total_tests,
            "ready_for_green_phase": total_failed > 0 and total_passed == 0
        }
        
        print(f"\n🎯 OVERALL RESULTS:")
        print(f"   Total Tests: {total_tests}")
        print(f"   Failed: {total_failed}")
        print(f"   Passed: {total_passed}")
        
        if self.results["overall_summary"]["red_phase_compliance"]:
            print(f"\n✅ RED PHASE COMPLIANCE: PERFECT")
            print(f"   All {total_failed} tests failed as expected.")
            print(f"   Ready to proceed to GREEN phase implementation.")
        else:
            print(f"\n⚠️  RED PHASE COMPLIANCE: ISSUES DETECTED")
            if total_passed > 0:
                print(f"   {total_passed} tests passed unexpectedly.")
                print(f"   Review these tests - they may need implementation or be incorrectly written.")
            if total_failed == 0:
                print(f"   No tests failed - this suggests missing test implementations.")
        
        print(f"\n📋 NEXT STEPS:")
        print(f"   1. Review failed tests to understand requirements")
        print(f"   2. Begin GREEN phase implementation")
        print(f"   3. Implement code to make tests pass incrementally")
        print(f"   4. Refactor during REFACTOR phase")
        
        return self.results["overall_summary"]
    
    def save_results(self):
        """Save test results to JSON file."""
        results_file = self.test_dir / f"red_phase_results_{self.results['test_run_id']}.json"
        
        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n💾 Results saved to: {results_file}")
        return results_file


def main():
    """Main test runner entry point."""
    parser = argparse.ArgumentParser(
        description="Security Foundation TDD Test Runner (RED Phase)"
    )
    parser.add_argument(
        "--category",
        choices=["zero_trust", "multi_tenant", "compliance", "all"],
        default="all",
        help="Test category to run"
    )
    parser.add_argument(
        "--setup-only",
        action="store_true",
        help="Only setup environment, don't run tests"
    )
    parser.add_argument(
        "--no-setup",
        action="store_true", 
        help="Skip environment setup"
    )
    
    args = parser.parse_args()
    
    print("🔴 SECURITY FOUNDATION TDD TEST RUNNER (RED PHASE)")
    print("🎯 Expected Outcome: ALL TESTS SHOULD FAIL")
    print("🚀 This drives implementation in the GREEN phase")
    print("=" * 60)
    
    runner = SecurityFoundationTestRunner()
    
    try:
        # Setup environment
        if not args.no_setup:
            runner.setup_environment()
        
        if args.setup_only:
            print("✅ Environment setup complete. Exiting.")
            return 0
        
        # Run selected test categories
        if args.category in ["zero_trust", "all"]:
            runner.run_zero_trust_tests()
        
        if args.category in ["multi_tenant", "all"]:
            runner.run_multi_tenant_tests()
        
        if args.category in ["compliance", "all"]:
            runner.run_compliance_audit_tests()
        
        # Generate summary and save results
        summary = runner.generate_summary_report()
        runner.save_results()
        
        # Return appropriate exit code
        if summary["red_phase_compliance"]:
            print(f"\n🎉 RED PHASE SUCCESSFUL: All tests failed as expected!")
            return 0  # Success in RED phase means all tests failed
        else:
            print(f"\n❌ RED PHASE ISSUES: Some tests didn't fail as expected.")
            return 1  # Issues detected
    
    except Exception as e:
        print(f"\n💥 Test runner error: {e}")
        import traceback
        traceback.print_exc()
        return 2


if __name__ == "__main__":
    sys.exit(main())