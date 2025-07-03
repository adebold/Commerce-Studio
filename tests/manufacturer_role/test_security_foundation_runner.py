"""
Comprehensive test runner for manufacturer security foundation tests.
Based on test specifications in test_specs_manufacturer_security_foundation_LS8.md.

This runner executes all security foundation tests and generates comprehensive reports.
"""

import pytest
import asyncio
import json
import time
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "src"))


@dataclass
class TestResult:
    """Test result data structure"""
    test_name: str
    status: str  # passed, failed, skipped, error
    duration: float
    error_message: Optional[str] = None
    category: str = "unknown"
    priority: str = "medium"


@dataclass
class TestSuiteReport:
    """Complete test suite report"""
    timestamp: str
    total_tests: int
    passed: int
    failed: int
    skipped: int
    errors: int
    total_duration: float
    test_results: List[TestResult]
    coverage_summary: Dict[str, Any]
    performance_metrics: Dict[str, Any]
    security_validation_summary: Dict[str, Any]


class SecurityFoundationTestRunner:
    """Comprehensive test runner for security foundation tests"""
    
    def __init__(self):
        self.test_files = [
            "test_security_integration.py",
            "test_manufacturer_auth_enhanced.py", 
            "test_rbac_security_validation.py",
            "test_manufacturer_authentication.py",  # Existing tests
            "test_dashboard_access_control.py"      # Existing tests
        ]
        
        self.test_categories = {
            "authentication": ["test_manufacturer_auth_enhanced.py", "test_manufacturer_authentication.py"],
            "authorization": ["test_rbac_security_validation.py", "test_dashboard_access_control.py"],
            "security_validation": ["test_rbac_security_validation.py"],
            "integration": ["test_security_integration.py"],
            "performance": ["test_security_integration.py", "test_manufacturer_auth_enhanced.py"]
        }
        
        self.priority_mapping = {
            "test_jwt": "critical",
            "test_mfa": "critical", 
            "test_permission": "critical",
            "test_tier_based": "critical",
            "test_threat_detection": "high",
            "test_rate_limiting": "high",
            "test_session": "high",
            "test_encryption": "medium",
            "test_performance": "medium"
        }
    
    def get_test_priority(self, test_name: str) -> str:
        """Determine test priority based on name patterns"""
        for pattern, priority in self.priority_mapping.items():
            if pattern in test_name.lower():
                return priority
        return "medium"
    
    def get_test_category(self, test_file: str) -> str:
        """Determine test category based on file"""
        for category, files in self.test_categories.items():
            if test_file in files:
                return category
        return "unknown"
    
    async def run_security_foundation_tests(self) -> TestSuiteReport:
        """Run all security foundation tests and generate comprehensive report"""
        
        print("🧪 Starting Manufacturer Security Foundation Test Suite")
        print("=" * 80)
        
        start_time = time.perf_counter()
        all_results = []
        
        # Test execution summary
        total_tests = 0
        passed = 0
        failed = 0
        skipped = 0
        errors = 0
        
        # Run tests by category for better organization
        for category, test_files in self.test_categories.items():
            print(f"\n📋 Running {category.upper()} tests...")
            print("-" * 50)
            
            for test_file in test_files:
                if not os.path.exists(test_file):
                    print(f"⚠️  Test file not found: {test_file}")
                    continue
                
                print(f"🔍 Executing: {test_file}")
                
                # Run pytest for this specific file
                pytest_args = [
                    test_file,
                    "-v",
                    "--tb=short",
                    "--json-report",
                    f"--json-report-file=temp_{test_file}_report.json",
                    "-m", "security or integration",
                    "--durations=10"
                ]
                
                try:
                    # Run pytest and capture results
                    result_code = pytest.main(pytest_args)
                    
                    # Parse JSON report if available
                    json_report_file = f"temp_{test_file}_report.json"
                    if os.path.exists(json_report_file):
                        with open(json_report_file, 'r') as f:
                            pytest_report = json.load(f)
                        
                        # Process test results
                        for test in pytest_report.get('tests', []):
                            test_result = TestResult(
                                test_name=test['nodeid'],
                                status=test['outcome'],
                                duration=test.get('duration', 0),
                                error_message=test.get('call', {}).get('longrepr') if test['outcome'] == 'failed' else None,
                                category=self.get_test_category(test_file),
                                priority=self.get_test_priority(test['nodeid'])
                            )
                            all_results.append(test_result)
                            
                            # Update counters
                            total_tests += 1
                            if test['outcome'] == 'passed':
                                passed += 1
                            elif test['outcome'] == 'failed':
                                failed += 1
                            elif test['outcome'] == 'skipped':
                                skipped += 1
                            else:
                                errors += 1
                        
                        # Cleanup temp file
                        os.remove(json_report_file)
                    
                    # Print immediate results
                    if result_code == 0:
                        print(f"✅ {test_file}: PASSED")
                    else:
                        print(f"❌ {test_file}: FAILED (exit code: {result_code})")
                
                except Exception as e:
                    print(f"💥 Error running {test_file}: {e}")
                    errors += 1
        
        total_duration = time.perf_counter() - start_time
        
        # Generate comprehensive report
        report = TestSuiteReport(
            timestamp=datetime.now().isoformat(),
            total_tests=total_tests,
            passed=passed,
            failed=failed,
            skipped=skipped,
            errors=errors,
            total_duration=total_duration,
            test_results=all_results,
            coverage_summary=self._generate_coverage_summary(all_results),
            performance_metrics=self._generate_performance_metrics(all_results),
            security_validation_summary=self._generate_security_summary(all_results)
        )
        
        return report
    
    def _generate_coverage_summary(self, results: List[TestResult]) -> Dict[str, Any]:
        """Generate test coverage summary"""
        coverage_by_category = {}
        
        for category in self.test_categories.keys():
            category_tests = [r for r in results if r.category == category]
            if category_tests:
                coverage_by_category[category] = {
                    "total": len(category_tests),
                    "passed": len([r for r in category_tests if r.status == "passed"]),
                    "coverage_percentage": len([r for r in category_tests if r.status == "passed"]) / len(category_tests) * 100
                }
        
        # Security-specific coverage areas
        security_areas = {
            "jwt_authentication": len([r for r in results if "jwt" in r.test_name.lower()]),
            "mfa_verification": len([r for r in results if "mfa" in r.test_name.lower()]),
            "rbac_permissions": len([r for r in results if "permission" in r.test_name.lower()]),
            "threat_detection": len([r for r in results if "threat" in r.test_name.lower()]),
            "encryption": len([r for r in results if "encrypt" in r.test_name.lower()]),
            "rate_limiting": len([r for r in results if "rate" in r.test_name.lower()]),
            "session_management": len([r for r in results if "session" in r.test_name.lower()])
        }
        
        return {
            "by_category": coverage_by_category,
            "security_areas": security_areas,
            "total_security_tests": len([r for r in results if r.category in ["authentication", "authorization", "security_validation"]])
        }
    
    def _generate_performance_metrics(self, results: List[TestResult]) -> Dict[str, Any]:
        """Generate performance metrics summary"""
        performance_tests = [r for r in results if "performance" in r.test_name.lower() or r.category == "performance"]
        
        if not performance_tests:
            return {"performance_tests_found": False}
        
        durations = [r.duration for r in performance_tests if r.duration > 0]
        
        return {
            "performance_tests_found": True,
            "total_performance_tests": len(performance_tests),
            "average_duration": sum(durations) / len(durations) if durations else 0,
            "max_duration": max(durations) if durations else 0,
            "min_duration": min(durations) if durations else 0,
            "slow_tests": [
                {"name": r.test_name, "duration": r.duration} 
                for r in performance_tests 
                if r.duration > 1.0  # Tests taking more than 1 second
            ]
        }
    
    def _generate_security_summary(self, results: List[TestResult]) -> Dict[str, Any]:
        """Generate security validation summary"""
        security_tests = [r for r in results if r.category in ["authentication", "authorization", "security_validation"]]
        
        critical_tests = [r for r in security_tests if r.priority == "critical"]
        high_tests = [r for r in security_tests if r.priority == "high"]
        
        critical_passed = len([r for r in critical_tests if r.status == "passed"])
        high_passed = len([r for r in high_tests if r.status == "passed"])
        
        return {
            "total_security_tests": len(security_tests),
            "critical_tests": {
                "total": len(critical_tests),
                "passed": critical_passed,
                "pass_rate": critical_passed / len(critical_tests) * 100 if critical_tests else 0
            },
            "high_priority_tests": {
                "total": len(high_tests),
                "passed": high_passed,
                "pass_rate": high_passed / len(high_tests) * 100 if high_tests else 0
            },
            "security_readiness": self._calculate_security_readiness(security_tests)
        }
    
    def _calculate_security_readiness(self, security_tests: List[TestResult]) -> str:
        """Calculate overall security readiness level"""
        if not security_tests:
            return "unknown"
        
        passed_tests = len([r for r in security_tests if r.status == "passed"])
        pass_rate = passed_tests / len(security_tests) * 100
        
        critical_tests = [r for r in security_tests if r.priority == "critical"]
        critical_passed = len([r for r in critical_tests if r.status == "passed"])
        critical_pass_rate = critical_passed / len(critical_tests) * 100 if critical_tests else 100
        
        if critical_pass_rate >= 95 and pass_rate >= 90:
            return "production_ready"
        elif critical_pass_rate >= 90 and pass_rate >= 80:
            return "staging_ready"
        elif critical_pass_rate >= 80 and pass_rate >= 70:
            return "development_ready"
        else:
            return "not_ready"
    
    def print_comprehensive_report(self, report: TestSuiteReport):
        """Print comprehensive test report"""
        print("\n" + "=" * 80)
        print("🔒 MANUFACTURER SECURITY FOUNDATION TEST REPORT")
        print("=" * 80)
        
        # Overall summary
        print(f"\n📊 OVERALL SUMMARY")
        print(f"   Timestamp: {report.timestamp}")
        print(f"   Total Tests: {report.total_tests}")
        print(f"   ✅ Passed: {report.passed}")
        print(f"   ❌ Failed: {report.failed}")
        print(f"   ⏭️  Skipped: {report.skipped}")
        print(f"   💥 Errors: {report.errors}")
        print(f"   ⏱️  Duration: {report.total_duration:.2f}s")
        
        if report.total_tests > 0:
            pass_rate = report.passed / report.total_tests * 100
            print(f"   📈 Pass Rate: {pass_rate:.1f}%")
        
        # Security readiness
        security_readiness = report.security_validation_summary.get("security_readiness", "unknown")
        readiness_emoji = {
            "production_ready": "🟢",
            "staging_ready": "🟡", 
            "development_ready": "🟠",
            "not_ready": "🔴",
            "unknown": "⚪"
        }
        
        print(f"\n🔒 SECURITY READINESS: {readiness_emoji.get(security_readiness, '⚪')} {security_readiness.upper()}")
        
        # Coverage by category
        print(f"\n📋 COVERAGE BY CATEGORY")
        for category, data in report.coverage_summary["by_category"].items():
            coverage_pct = data["coverage_percentage"]
            coverage_emoji = "🟢" if coverage_pct >= 90 else "🟡" if coverage_pct >= 70 else "🔴"
            print(f"   {coverage_emoji} {category.title()}: {data['passed']}/{data['total']} ({coverage_pct:.1f}%)")
        
        # Security areas coverage
        print(f"\n🛡️  SECURITY AREAS COVERAGE")
        for area, count in report.coverage_summary["security_areas"].items():
            area_emoji = "✅" if count > 0 else "❌"
            print(f"   {area_emoji} {area.replace('_', ' ').title()}: {count} tests")
        
        # Critical test results
        critical_summary = report.security_validation_summary["critical_tests"]
        print(f"\n🚨 CRITICAL SECURITY TESTS")
        print(f"   Total: {critical_summary['total']}")
        print(f"   Passed: {critical_summary['passed']}")
        print(f"   Pass Rate: {critical_summary['pass_rate']:.1f}%")
        
        # Performance metrics
        if report.performance_metrics.get("performance_tests_found"):
            print(f"\n⚡ PERFORMANCE METRICS")
            print(f"   Performance Tests: {report.performance_metrics['total_performance_tests']}")
            print(f"   Average Duration: {report.performance_metrics['average_duration']:.3f}s")
            print(f"   Max Duration: {report.performance_metrics['max_duration']:.3f}s")
            
            slow_tests = report.performance_metrics.get("slow_tests", [])
            if slow_tests:
                print(f"   ⚠️  Slow Tests ({len(slow_tests)}):")
                for test in slow_tests[:5]:  # Show top 5 slow tests
                    print(f"      - {test['name']}: {test['duration']:.3f}s")
        
        # Failed tests summary
        failed_tests = [r for r in report.test_results if r.status == "failed"]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)})")
            for test in failed_tests[:10]:  # Show first 10 failed tests
                print(f"   - {test.test_name} ({test.category}, {test.priority})")
                if test.error_message:
                    # Show first line of error message
                    error_line = test.error_message.split('\n')[0][:100]
                    print(f"     Error: {error_line}...")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS")
        
        if critical_summary['pass_rate'] < 95:
            print("   🚨 CRITICAL: Fix failing critical security tests before deployment")
        
        if report.security_validation_summary["high_priority_tests"]["pass_rate"] < 90:
            print("   ⚠️  HIGH: Address high-priority security test failures")
        
        if report.performance_metrics.get("slow_tests"):
            print("   ⚡ PERFORMANCE: Optimize slow-running tests for better CI/CD performance")
        
        if report.failed > 0:
            print(f"   🔧 MAINTENANCE: {report.failed} tests need attention")
        
        print("\n" + "=" * 80)
    
    def save_report(self, report: TestSuiteReport, filename: Optional[str] = None):
        """Save comprehensive report to JSON file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"manufacturer_security_foundation_test_report_{timestamp}.json"
        
        # Convert dataclass to dict for JSON serialization
        report_dict = asdict(report)
        
        with open(filename, 'w') as f:
            json.dump(report_dict, f, indent=2, default=str)
        
        print(f"📄 Report saved to: {filename}")
        return filename


async def main():
    """Main test runner function"""
    runner = SecurityFoundationTestRunner()
    
    try:
        # Run all security foundation tests
        report = await runner.run_security_foundation_tests()
        
        # Print comprehensive report
        runner.print_comprehensive_report(report)
        
        # Save report to file
        report_file = runner.save_report(report)
        
        # Exit with appropriate code
        if report.failed > 0 or report.errors > 0:
            print(f"\n❌ Test suite completed with failures")
            sys.exit(1)
        else:
            print(f"\n✅ All tests passed successfully!")
            sys.exit(0)
    
    except Exception as e:
        print(f"\n💥 Test runner error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    # Run the comprehensive test suite
    asyncio.run(main())