#!/usr/bin/env python3
"""
TDD Progress Tracking Script for MongoDB Foundation Service

This script tracks TDD implementation progress by running the production readiness
test suite and providing detailed progress reports.

Usage:
    python run_tdd_progress_tracking.py
    python run_tdd_progress_tracking.py --phase green
    python run_tdd_progress_tracking.py --component database
    python run_tdd_progress_tracking.py --detailed
"""

import subprocess
import sys
import time
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
import re

@dataclass
class TestResult:
    name: str
    status: str  # PASSED, FAILED, ERROR, SKIPPED
    duration: float
    error_message: Optional[str] = None
    component: Optional[str] = None

@dataclass
class TDDProgress:
    timestamp: str
    phase: str  # RED, GREEN, REFACTOR
    total_tests: int
    passed_tests: int
    failed_tests: int
    error_tests: int
    skipped_tests: int
    pass_rate: float
    component_progress: Dict[str, Dict[str, int]]
    test_results: List[TestResult]
    execution_time: float
    next_priority: List[str]

class TDDProgressTracker:
    """Track TDD implementation progress for MongoDB Foundation Service"""
    
    def __init__(self):
        self.test_file = "test_tdd_production_readiness.py"
        self.progress_log = Path("tdd_progress_log.json")
        self.component_mapping = {
            "database": ["TestRealDatabaseOperations"],
            "security": ["TestRealSecurityImplementation"], 
            "performance": ["TestRealPerformanceBenchmarking"],
            "integration": ["TestEndToEndIntegration"],
            "framework": ["TestTDDFrameworkValidation"]
        }
        
    def run_tests(self, component: Optional[str] = None, verbose: bool = True) -> TDDProgress:
        """Run TDD tests and capture results"""
        
        start_time = time.time()
        
        # Build pytest command
        cmd = ["python", "-m", "pytest", self.test_file, "--tb=short"]
        
        if component and component in self.component_mapping:
            # Run specific component tests
            test_classes = self.component_mapping[component]
            for test_class in test_classes:
                cmd.extend(["-k", test_class])
        
        if verbose:
            cmd.append("-v")
            
        cmd.extend(["--json-report", "--json-report-file=test_results.json"])
        
        print(f"🧪 Running TDD Progress Check...")
        print(f"📋 Command: {' '.join(cmd)}")
        print("=" * 80)
        
        # Execute tests
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                cwd=Path(__file__).parent
            )
            execution_time = time.time() - start_time
            
            # Parse results
            progress = self._parse_test_results(result, execution_time)
            
            # Save progress
            self._save_progress(progress)
            
            # Display summary
            self._display_progress_summary(progress)
            
            return progress
            
        except Exception as e:
            print(f"❌ Error running tests: {e}")
            raise
    
    def _parse_test_results(self, result: subprocess.CompletedProcess, execution_time: float) -> TDDProgress:
        """Parse pytest output and JSON report"""
        
        test_results = []
        component_progress = {comp: {"passed": 0, "failed": 0, "error": 0, "skipped": 0} 
                            for comp in self.component_mapping.keys()}
        
        # Try to load JSON report
        json_file = Path("test_results.json")
        if json_file.exists():
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    json_data = json.load(f)
                    
                for test in json_data.get("tests", []):
                    test_name = test.get("nodeid", "").split("::")[-1]
                    status = test.get("outcome", "unknown").upper()
                    duration = test.get("duration", 0.0)
                    
                    # Extract error message
                    error_message = None
                    if status in ["FAILED", "ERROR"]:
                        error_message = test.get("call", {}).get("longrepr", "")
                        if not error_message:
                            error_message = str(test.get("setup", {}).get("longrepr", ""))
                    
                    # Determine component
                    component = self._get_component_for_test(test_name)
                    
                    test_result = TestResult(
                        name=test_name,
                        status=status,
                        duration=duration,
                        error_message=error_message,
                        component=component
                    )
                    test_results.append(test_result)
                    
                    # Update component progress
                    if component and component in component_progress:
                        if status == "PASSED":
                            component_progress[component]["passed"] += 1
                        elif status == "FAILED":
                            component_progress[component]["failed"] += 1
                        elif status == "ERROR":
                            component_progress[component]["error"] += 1
                        elif status == "SKIPPED":
                            component_progress[component]["skipped"] += 1
                            
            except Exception as e:
                print(f"⚠️  Warning: Could not parse JSON report: {e}")
        
        # Parse summary from stdout if JSON not available
        if not test_results:
            test_results = self._parse_stdout_results(result.stdout)
        
        # Calculate totals
        total_tests = len(test_results)
        passed_tests = sum(1 for t in test_results if t.status == "PASSED")
        failed_tests = sum(1 for t in test_results if t.status == "FAILED") 
        error_tests = sum(1 for t in test_results if t.status == "ERROR")
        skipped_tests = sum(1 for t in test_results if t.status == "SKIPPED")
        
        pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Determine current phase
        phase = self._determine_tdd_phase(passed_tests, failed_tests, error_tests)
        
        # Generate next priorities
        next_priority = self._generate_next_priorities(test_results, component_progress)
        
        return TDDProgress(
            timestamp=datetime.now().isoformat(),
            phase=phase,
            total_tests=total_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            error_tests=error_tests,
            skipped_tests=skipped_tests,
            pass_rate=pass_rate,
            component_progress=component_progress,
            test_results=test_results,
            execution_time=execution_time,
            next_priority=next_priority
        )
    
    def _parse_stdout_results(self, stdout: str) -> List[TestResult]:
        """Parse test results from pytest stdout"""
        results = []
        
        # Extract test outcome lines
        lines = stdout.split('\n')
        for line in lines:
            if "::" in line and any(status in line for status in ["PASSED", "FAILED", "ERROR", "SKIPPED"]):
                parts = line.split()
                if len(parts) >= 2:
                    test_name = parts[0].split("::")[-1]
                    status = parts[1]
                    
                    # Extract duration if available
                    duration = 0.0
                    duration_match = re.search(r'\[(\d+\.\d+)s\]', line)
                    if duration_match:
                        duration = float(duration_match.group(1))
                    
                    component = self._get_component_for_test(test_name)
                    
                    results.append(TestResult(
                        name=test_name,
                        status=status,
                        duration=duration,
                        component=component
                    ))
        
        return results
    
    def _get_component_for_test(self, test_name: str) -> Optional[str]:
        """Determine component for a test based on test class name"""
        for component, test_classes in self.component_mapping.items():
            for test_class in test_classes:
                if test_class.lower() in test_name.lower():
                    return component
        return None
    
    def _determine_tdd_phase(self, passed: int, failed: int, errors: int) -> str:
        """Determine current TDD phase based on test results"""
        if passed == 0 and (failed > 0 or errors > 0):
            return "RED"
        elif passed > 0 and (failed > 0 or errors > 0):
            return "GREEN_PARTIAL"
        elif passed > 0 and failed == 0 and errors == 0:
            return "GREEN"
        else:
            return "UNKNOWN"
    
    def _generate_next_priorities(self, test_results: List[TestResult], 
                                 component_progress: Dict[str, Dict[str, int]]) -> List[str]:
        """Generate prioritized list of next implementation tasks"""
        priorities = []
        
        # Priority 1: Fix ERROR conditions (missing implementations)
        error_components = []
        for component, progress in component_progress.items():
            if progress["error"] > 0:
                error_components.append(f"Implement {component} fixtures and core functionality")
        
        # Priority 2: Fix FAILED tests (implementation issues)
        failed_components = []
        for component, progress in component_progress.items():
            if progress["failed"] > 0:
                failed_components.append(f"Fix {component} implementation issues")
        
        # Priority 3: Optimize PASSED tests (refactoring)
        passed_components = []
        for component, progress in component_progress.items():
            if progress["passed"] > 0 and progress["failed"] == 0 and progress["error"] == 0:
                passed_components.append(f"Refactor and optimize {component}")
        
        priorities.extend(error_components)
        priorities.extend(failed_components)
        priorities.extend(passed_components)
        
        return priorities[:5]  # Top 5 priorities
    
    def _save_progress(self, progress: TDDProgress):
        """Save progress to JSON log file"""
        
        # Load existing progress log
        progress_history = []
        if self.progress_log.exists():
            try:
                with open(self.progress_log, 'r', encoding='utf-8') as f:
                    progress_history = json.load(f)
            except Exception as e:
                print(f"⚠️  Warning: Could not load progress history: {e}")
        
        # Add current progress
        progress_history.append(asdict(progress))
        
        # Save updated history
        try:
            with open(self.progress_log, 'w', encoding='utf-8') as f:
                json.dump(progress_history, f, indent=2)
        except Exception as e:
            print(f"⚠️  Warning: Could not save progress: {e}")
    
    def _display_progress_summary(self, progress: TDDProgress):
        """Display formatted progress summary"""
        
        print(f"\n🎯 TDD Progress Summary - {progress.timestamp}")
        print("=" * 80)
        
        # Overall Status
        phase_emoji = {
            "RED": "🔴",
            "GREEN_PARTIAL": "🟡", 
            "GREEN": "🟢",
            "UNKNOWN": "⚪"
        }
        
        print(f"{phase_emoji.get(progress.phase, '⚪')} **TDD Phase**: {progress.phase}")
        print(f"⏱️  **Execution Time**: {progress.execution_time:.2f}s")
        print(f"📊 **Pass Rate**: {progress.pass_rate:.1f}%")
        print()
        
        # Test Summary
        print("📋 **Test Results Summary**:")
        print(f"   ✅ Passed: {progress.passed_tests}")
        print(f"   ❌ Failed: {progress.failed_tests}")
        print(f"   🚫 Errors: {progress.error_tests}")
        print(f"   ⏭️  Skipped: {progress.skipped_tests}")
        print(f"   📊 Total: {progress.total_tests}")
        print()
        
        # Component Progress
        print("🧩 **Component Progress**:")
        for component, stats in progress.component_progress.items():
            total = sum(stats.values())
            if total > 0:
                passed_pct = (stats["passed"] / total * 100)
                status_emoji = "🟢" if stats["passed"] == total else "🟡" if stats["passed"] > 0 else "🔴"
                print(f"   {status_emoji} {component.title()}: {stats['passed']}/{total} ({passed_pct:.0f}%)")
        print()
        
        # Next Priorities
        if progress.next_priority:
            print("🎯 **Next Priority Actions**:")
            for i, priority in enumerate(progress.next_priority, 1):
                print(f"   {i}. {priority}")
            print()
        
        # TDD Guidance
        if progress.phase == "RED":
            print("🔴 **RED Phase**: Tests are failing as expected. Focus on implementing missing functionality.")
        elif progress.phase == "GREEN_PARTIAL":
            print("🟡 **GREEN Partial**: Some tests passing. Continue implementing remaining functionality.")
        elif progress.phase == "GREEN":
            print("🟢 **GREEN Phase**: All tests passing! Ready for refactoring and optimization.")
        
        print("=" * 80)

def main():
    parser = argparse.ArgumentParser(description="Track TDD progress for MongoDB Foundation Service")
    parser.add_argument("--component", choices=["database", "security", "performance", "integration", "framework"],
                       help="Run tests for specific component only")
    parser.add_argument("--phase", choices=["red", "green", "refactor"], 
                       help="Specify expected TDD phase")
    parser.add_argument("--detailed", action="store_true",
                       help="Show detailed test results")
    
    args = parser.parse_args()
    
    tracker = TDDProgressTracker()
    
    try:
        progress = tracker.run_tests(component=args.component, verbose=args.detailed)
        
        # Phase validation
        if args.phase:
            expected_phase = args.phase.upper()
            if expected_phase == "RED" and progress.passed_tests > 0:
                print(f"⚠️  Warning: Expected RED phase but {progress.passed_tests} tests are passing")
            elif expected_phase == "GREEN" and (progress.failed_tests > 0 or progress.error_tests > 0):
                print(f"⚠️  Warning: Expected GREEN phase but {progress.failed_tests + progress.error_tests} tests are failing")
        
        # Exit with appropriate code
        if progress.failed_tests > 0 or progress.error_tests > 0:
            sys.exit(1)
        else:
            sys.exit(0)
            
    except Exception as e:
        print(f"❌ TDD tracking failed: {e}")
        sys.exit(2)

if __name__ == "__main__":
    main()