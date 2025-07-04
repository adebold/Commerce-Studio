#!/usr/bin/env python3
"""
TDD Security Hardening Test Runner for MongoDB Foundation

This script runs the comprehensive security hardening test suite following TDD principles:
1. RED PHASE: Run failing tests to verify they capture security requirements
2. GREEN PHASE: Implement minimal code to make tests pass
3. REFACTOR PHASE: Optimize implementation for production readiness

Usage:
    python run_security_tests.py [--phase red|green|refactor] [--priority p0|p1|p2]

Test Categories:
- Priority P0 (Security Critical): Input validation, image encryption, GDPR compliance
- Priority P1 (Reliability Critical): Circuit breaker, graceful degradation
- Priority P2 (Performance): N+1 query elimination, connection pooling, caching

Based on reflection_hardening_LS4.md analysis
"""

import sys
import os
import asyncio
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional
import argparse
import json
from datetime import datetime, timezone

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Test configuration
TEST_CATEGORIES = {
    "security_hardening": {
        "file": "test_security_hardening.py",
        "priority": "P0",
        "description": "NoSQL injection prevention, image encryption, GDPR compliance"
    },
    "input_validation": {
        "file": "test_input_validation.py", 
        "priority": "P0",
        "description": "Pydantic validation, query sanitization, field whitelisting"
    },
    "circuit_breaker": {
        "file": "test_circuit_breaker.py",
        "priority": "P1", 
        "description": "Failure thresholds, graceful degradation, recovery timeouts"
    },
    "performance_optimization": {
        "file": "test_performance_optimization.py",
        "priority": "P2",
        "description": "N+1 query elimination, connection pooling, response benchmarks"
    }
}

TDD_PHASES = {
    "red": {
        "description": "Run failing tests to verify security requirements capture",
        "expected_result": "All tests should FAIL with NotImplementedError",
        "markers": ["tdd_red_phase"]
    },
    "green": {
        "description": "Run tests after minimal implementation to verify requirements",
        "expected_result": "Critical tests should PASS, implementation should be minimal",
        "markers": ["tdd_green_phase"]
    },
    "refactor": {
        "description": "Run tests after production optimization and refactoring",
        "expected_result": "All tests should PASS with optimized implementation",
        "markers": ["tdd_refactor_phase"]
    }
}


class SecurityTestRunner:
    """TDD test runner for MongoDB Foundation security hardening"""
    
    def __init__(self, phase: str = "red", priority: Optional[str] = None):
        self.phase = phase
        self.priority = priority
        self.test_dir = Path(__file__).parent
        self.results = {
            "phase": phase,
            "priority": priority,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "categories": {},
            "summary": {},
            "coverage": {}
        }
    
    async def run_tests(self) -> Dict[str, Any]:
        """Run security hardening tests based on phase and priority"""
        print(f"🧪 MongoDB Foundation Security Hardening - TDD {self.phase.upper()} Phase")
        print(f"📊 Priority Filter: {self.priority or 'ALL'}")
        print(f"📁 Test Directory: {self.test_dir}")
        print("-" * 80)
        
        # Filter test categories by priority
        categories_to_run = self._filter_categories_by_priority()
        
        # Run each test category
        for category_name, category_info in categories_to_run.items():
            print(f"\n🔍 Running {category_name} tests ({category_info['priority']})...")
            print(f"   {category_info['description']}")
            
            result = await self._run_category_tests(category_name, category_info)
            self.results["categories"][category_name] = result
        
        # Generate summary
        self._generate_summary()
        
        # Save results
        await self._save_results()
        
        return self.results
    
    def _filter_categories_by_priority(self) -> Dict[str, Dict[str, Any]]:
        """Filter test categories by priority level"""
        if not self.priority:
            return TEST_CATEGORIES
        
        return {
            name: info for name, info in TEST_CATEGORIES.items()
            if info["priority"].lower() == self.priority.lower()
        }
    
    async def _run_category_tests(self, category_name: str, category_info: Dict[str, Any]) -> Dict[str, Any]:
        """Run tests for a specific category"""
        test_file = self.test_dir / category_info["file"]
        
        if not test_file.exists():
            return {
                "status": "SKIPPED",
                "reason": f"Test file {test_file} not found",
                "passed": 0,
                "failed": 0,
                "errors": 0
            }
        
        # Build pytest command
        cmd = self._build_pytest_command(test_file, category_info)
        
        # Run tests
        try:
            result = subprocess.run(
                cmd,
                cwd=self.test_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            return self._parse_pytest_output(result, category_info)
            
        except subprocess.TimeoutExpired:
            return {
                "status": "TIMEOUT",
                "reason": "Tests exceeded 5 minute timeout",
                "passed": 0,
                "failed": 0,
                "errors": 1
            }
        except Exception as e:
            return {
                "status": "ERROR",
                "reason": f"Failed to run tests: {str(e)}",
                "passed": 0,
                "failed": 0,
                "errors": 1
            }
    
    def _build_pytest_command(self, test_file: Path, category_info: Dict[str, Any]) -> List[str]:
        """Build pytest command for the specific phase and category"""
        cmd = [
            sys.executable, "-m", "pytest",
            str(test_file),
            "-v",
            "--tb=short",
            "--durations=10",
            f"--junitxml=results_{self.phase}_{category_info['priority']}.xml"
        ]
        
        # Add phase-specific markers
        phase_info = TDD_PHASES[self.phase]
        if phase_info["markers"]:
            for marker in phase_info["markers"]:
                cmd.extend(["-m", marker])
        
        # Add coverage for green and refactor phases
        if self.phase in ["green", "refactor"]:
            cmd.extend([
                "--cov=src",
                "--cov-report=html",
                "--cov-report=term-missing",
                f"--cov-report=xml:coverage_{self.phase}.xml"
            ])
        
        # Add timeout for performance tests
        if "performance" in test_file.name:
            cmd.extend(["--timeout=60"])
        
        return cmd
    
    def _parse_pytest_output(self, result: subprocess.CompletedProcess, category_info: Dict[str, Any]) -> Dict[str, Any]:
        """Parse pytest output and extract test results"""
        output = result.stdout + result.stderr
        
        # Parse test counts from output
        passed = output.count(" PASSED")
        failed = output.count(" FAILED") 
        errors = output.count(" ERROR")
        skipped = output.count(" SKIPPED")
        
        # Determine overall status
        if self.phase == "red":
            # In RED phase, we expect tests to fail with NotImplementedError
            if "NotImplementedError" in output and failed > 0:
                status = "EXPECTED_FAILURE"  # This is good in RED phase
            else:
                status = "UNEXPECTED_PASS"   # This is bad in RED phase
        else:
            # In GREEN/REFACTOR phases, we want tests to pass
            if result.returncode == 0:
                status = "PASSED"
            else:
                status = "FAILED"
        
        return {
            "status": status,
            "return_code": result.returncode,
            "passed": passed,
            "failed": failed,
            "errors": errors,
            "skipped": skipped,
            "total": passed + failed + errors + skipped,
            "output": output,
            "duration": self._extract_duration(output)
        }
    
    def _extract_duration(self, output: str) -> float:
        """Extract test duration from pytest output"""
        try:
            # Look for "= X.XX seconds =" in output
            import re
            duration_match = re.search(r"= ([\d.]+) seconds =", output)
            if duration_match:
                return float(duration_match.group(1))
        except:
            pass
        return 0.0
    
    def _generate_summary(self):
        """Generate test run summary"""
        total_passed = sum(cat.get("passed", 0) for cat in self.results["categories"].values())
        total_failed = sum(cat.get("failed", 0) for cat in self.results["categories"].values())
        total_errors = sum(cat.get("errors", 0) for cat in self.results["categories"].values())
        total_skipped = sum(cat.get("skipped", 0) for cat in self.results["categories"].values())
        total_tests = total_passed + total_failed + total_errors + total_skipped
        
        self.results["summary"] = {
            "total_tests": total_tests,
            "passed": total_passed,
            "failed": total_failed,
            "errors": total_errors,
            "skipped": total_skipped,
            "success_rate": (total_passed / total_tests * 100) if total_tests > 0 else 0,
            "phase_assessment": self._assess_phase_success()
        }
        
        # Print summary
        print("\n" + "=" * 80)
        print(f"📊 TDD {self.phase.upper()} Phase Summary")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {total_passed}")
        print(f"Failed: {total_failed}")
        print(f"Errors: {total_errors}")
        print(f"Skipped: {total_skipped}")
        print(f"Success Rate: {self.results['summary']['success_rate']:.1f}%")
        print(f"Phase Assessment: {self.results['summary']['phase_assessment']}")
        
        # Phase-specific guidance
        self._print_phase_guidance()
    
    def _assess_phase_success(self) -> str:
        """Assess whether the phase completed successfully"""
        if self.phase == "red":
            # RED phase success: tests should fail with NotImplementedError
            expected_failures = sum(
                1 for cat in self.results["categories"].values()
                if cat.get("status") == "EXPECTED_FAILURE"
            )
            total_categories = len(self.results["categories"])
            
            if expected_failures == total_categories:
                return "SUCCESS - All tests properly failing (requirements captured)"
            else:
                return "PARTIAL - Some tests not failing as expected"
        
        elif self.phase == "green":
            # GREEN phase success: critical tests should pass
            critical_passed = sum(
                cat.get("passed", 0) for name, cat in self.results["categories"].items()
                if TEST_CATEGORIES[name]["priority"] == "P0"
            )
            
            if critical_passed > 0:
                return "SUCCESS - Critical security tests passing"
            else:
                return "INCOMPLETE - Critical security tests still failing"
        
        else:  # refactor phase
            # REFACTOR phase success: all tests should pass
            success_rate = self.results["summary"]["success_rate"]
            
            if success_rate >= 95:
                return "SUCCESS - Production ready"
            elif success_rate >= 80:
                return "GOOD - Minor issues remain"
            else:
                return "INCOMPLETE - Significant issues remain"
    
    def _print_phase_guidance(self):
        """Print phase-specific guidance"""
        print("\n📋 Next Steps:")
        
        if self.phase == "red":
            print("1. ✅ Verify all tests are failing with NotImplementedError")
            print("2. 🔍 Review test cases to ensure they capture security requirements")
            print("3. 🚀 Begin GREEN phase: Implement minimal code to make tests pass")
            print("   Command: python run_security_tests.py --phase green")
        
        elif self.phase == "green":
            print("1. 🛠️ Implement security validators and basic functionality")
            print("2. 🔒 Focus on P0 security tests first (input validation, encryption)")
            print("3. 🧪 Run tests frequently during implementation")
            print("4. 🚀 Move to REFACTOR phase when core tests pass")
            print("   Command: python run_security_tests.py --phase refactor")
        
        else:  # refactor
            print("1. 🏗️ Optimize implementations for production")
            print("2. 📈 Improve performance and error handling")
            print("3. 📊 Achieve 95%+ test coverage")
            print("4. 🎯 Target overall score 85+ before next implementation cycle")
    
    async def _save_results(self):
        """Save test results to file"""
        results_file = self.test_dir / f"results_{self.phase}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        try:
            with open(results_file, 'w') as f:
                json.dump(self.results, f, indent=2)
            print(f"\n💾 Results saved to: {results_file}")
        except Exception as e:
            print(f"⚠️ Failed to save results: {e}")


async def main():
    """Main test runner entry point"""
    parser = argparse.ArgumentParser(
        description="TDD Security Hardening Test Runner for MongoDB Foundation"
    )
    parser.add_argument(
        "--phase",
        choices=["red", "green", "refactor"],
        default="red",
        help="TDD phase to run (default: red)"
    )
    parser.add_argument(
        "--priority",
        choices=["p0", "p1", "p2"],
        help="Filter tests by priority level"
    )
    parser.add_argument(
        "--list-tests",
        action="store_true",
        help="List available test categories and exit"
    )
    
    args = parser.parse_args()
    
    if args.list_tests:
        print("📋 Available Test Categories:")
        print("=" * 50)
        for name, info in TEST_CATEGORIES.items():
            print(f"{name:25} {info['priority']:3} {info['description']}")
        return
    
    # Run tests
    runner = SecurityTestRunner(phase=args.phase, priority=args.priority)
    results = await runner.run_tests()
    
    # Exit with appropriate code
    if results["summary"]["phase_assessment"].startswith("SUCCESS"):
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())