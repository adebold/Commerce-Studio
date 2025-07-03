#!/usr/bin/env python3
"""
Template Engine Test Runner

Comprehensive test runner for the Template Engine with multiple execution modes:
- Unit tests only
- Integration tests only  
- Performance tests
- Security tests
- Full test suite
- Coverage reporting
- Continuous integration mode
"""

import sys
import os
import subprocess
import argparse
import time
from pathlib import Path
from typing import List, Optional


class TemplateEngineTestRunner:
    """Test runner for Template Engine test suite."""
    
    def __init__(self):
        self.test_dir = Path(__file__).parent
        self.project_root = self.test_dir.parent.parent
        self.coverage_threshold = 80
        
    def run_command(self, cmd: List[str], description: str) -> bool:
        """Run a command and return success status."""
        print(f"\n{'='*60}")
        print(f"Running: {description}")
        print(f"Command: {' '.join(cmd)}")
        print(f"{'='*60}")
        
        start_time = time.time()
        try:
            result = subprocess.run(
                cmd,
                cwd=self.project_root,
                check=True,
                capture_output=False
            )
            duration = time.time() - start_time
            print(f"\n✅ {description} completed successfully in {duration:.2f}s")
            return True
        except subprocess.CalledProcessError as e:
            duration = time.time() - start_time
            print(f"\n❌ {description} failed after {duration:.2f}s with exit code {e.returncode}")
            return False
    
    def install_dependencies(self) -> bool:
        """Install test dependencies."""
        requirements_file = self.test_dir / "requirements-test.txt"
        if not requirements_file.exists():
            print(f"❌ Requirements file not found: {requirements_file}")
            return False
        
        cmd = [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)]
        return self.run_command(cmd, "Installing test dependencies")
    
    def run_unit_tests(self, verbose: bool = False) -> bool:
        """Run unit tests only."""
        cmd = [
            sys.executable, "-m", "pytest",
            str(self.test_dir),
            "-m", "unit or not (integration or performance or security)",
            "--tb=short"
        ]
        
        if verbose:
            cmd.extend(["-v", "-s"])
        
        return self.run_command(cmd, "Unit Tests")
    
    def run_integration_tests(self, verbose: bool = False) -> bool:
        """Run integration tests only."""
        cmd = [
            sys.executable, "-m", "pytest", 
            str(self.test_dir),
            "-m", "integration",
            "--tb=short"
        ]
        
        if verbose:
            cmd.extend(["-v", "-s"])
        
        return self.run_command(cmd, "Integration Tests")
    
    def run_performance_tests(self, verbose: bool = False) -> bool:
        """Run performance tests only."""
        cmd = [
            sys.executable, "-m", "pytest",
            str(self.test_dir / "test_performance.py"),
            "--tb=short",
            "--durations=20"
        ]
        
        if verbose:
            cmd.extend(["-v", "-s"])
        
        return self.run_command(cmd, "Performance Tests")
    
    def run_security_tests(self, verbose: bool = False) -> bool:
        """Run security tests only."""
        cmd = [
            sys.executable, "-m", "pytest",
            str(self.test_dir / "test_security.py"),
            "--tb=short"
        ]
        
        if verbose:
            cmd.extend(["-v", "-s"])
        
        return self.run_command(cmd, "Security Tests")
    
    def run_all_tests(self, verbose: bool = False) -> bool:
        """Run complete test suite."""
        cmd = [
            sys.executable, "-m", "pytest",
            str(self.test_dir),
            "--tb=short",
            "--durations=10"
        ]
        
        if verbose:
            cmd.extend(["-v", "-s"])
        
        return self.run_command(cmd, "Complete Test Suite")
    
    def run_coverage_tests(self, html_report: bool = True) -> bool:
        """Run tests with coverage reporting."""
        cmd = [
            sys.executable, "-m", "pytest",
            str(self.test_dir),
            "--cov=src/store_generation/template_engine",
            "--cov-report=term-missing",
            f"--cov-fail-under={self.coverage_threshold}",
            "--tb=short"
        ]
        
        if html_report:
            html_dir = self.test_dir / "htmlcov"
            cmd.extend([f"--cov-report=html:{html_dir}"])
        
        success = self.run_command(cmd, f"Coverage Tests (≥{self.coverage_threshold}%)")
        
        if success and html_report:
            html_file = self.test_dir / "htmlcov" / "index.html"
            if html_file.exists():
                print(f"\n📊 Coverage report available at: {html_file}")
        
        return success
    
    def run_lint_checks(self) -> bool:
        """Run code quality checks."""
        success = True
        
        # Run flake8
        cmd = [
            sys.executable, "-m", "flake8",
            str(self.project_root / "src" / "store_generation" / "template_engine"),
            "--max-line-length=100",
            "--ignore=E203,W503"
        ]
        if not self.run_command(cmd, "Flake8 Linting"):
            success = False
        
        # Run mypy
        cmd = [
            sys.executable, "-m", "mypy",
            str(self.project_root / "src" / "store_generation" / "template_engine"),
            "--ignore-missing-imports"
        ]
        if not self.run_command(cmd, "MyPy Type Checking"):
            success = False
        
        return success
    
    def run_security_scan(self) -> bool:
        """Run security scans."""
        success = True
        
        # Run bandit
        cmd = [
            sys.executable, "-m", "bandit",
            "-r",
            str(self.project_root / "src" / "store_generation" / "template_engine"),
            "-f", "json",
            "-o", str(self.test_dir / "bandit-report.json")
        ]
        if not self.run_command(cmd, "Bandit Security Scan"):
            success = False
        
        # Run safety
        cmd = [
            sys.executable, "-m", "safety",
            "check",
            "--json",
            "--output", str(self.test_dir / "safety-report.json")
        ]
        if not self.run_command(cmd, "Safety Dependency Scan"):
            success = False
        
        return success
    
    def run_ci_pipeline(self) -> bool:
        """Run complete CI pipeline."""
        print("\n🚀 Starting Template Engine CI Pipeline")
        print("="*60)
        
        steps = [
            ("Installing Dependencies", self.install_dependencies),
            ("Lint Checks", self.run_lint_checks),
            ("Security Scan", self.run_security_scan),
            ("Unit Tests", self.run_unit_tests),
            ("Integration Tests", self.run_integration_tests),
            ("Security Tests", self.run_security_tests),
            ("Performance Tests", self.run_performance_tests),
            ("Coverage Tests", lambda: self.run_coverage_tests(html_report=True))
        ]
        
        results = []
        start_time = time.time()
        
        for step_name, step_func in steps:
            step_start = time.time()
            success = step_func()
            step_duration = time.time() - step_start
            
            results.append({
                "name": step_name,
                "success": success,
                "duration": step_duration
            })
            
            if not success:
                print(f"\n❌ CI Pipeline failed at step: {step_name}")
                break
        
        total_duration = time.time() - start_time
        
        # Print summary
        print(f"\n{'='*60}")
        print("CI Pipeline Summary")
        print(f"{'='*60}")
        
        for result in results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"{result['name']:<25} {status:<10} {result['duration']:.2f}s")
        
        total_success = all(r["success"] for r in results)
        final_status = "✅ SUCCESS" if total_success else "❌ FAILED"
        
        print(f"\nTotal Duration: {total_duration:.2f}s")
        print(f"Final Result: {final_status}")
        
        return total_success
    
    def generate_test_report(self) -> bool:
        """Generate comprehensive test report."""
        cmd = [
            sys.executable, "-m", "pytest",
            str(self.test_dir),
            "--html=" + str(self.test_dir / "report.html"),
            "--self-contained-html",
            "--json-report",
            "--json-report-file=" + str(self.test_dir / "report.json"),
            "--tb=short"
        ]
        
        success = self.run_command(cmd, "Generating Test Report")
        
        if success:
            html_report = self.test_dir / "report.html"
            json_report = self.test_dir / "report.json"
            
            print(f"\n📄 Test reports generated:")
            if html_report.exists():
                print(f"  HTML: {html_report}")
            if json_report.exists():
                print(f"  JSON: {json_report}")
        
        return success


def main():
    """Main entry point for test runner."""
    parser = argparse.ArgumentParser(
        description="Template Engine Test Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_tests.py --unit                 # Run unit tests only
  python run_tests.py --integration          # Run integration tests only
  python run_tests.py --performance          # Run performance tests only
  python run_tests.py --security             # Run security tests only
  python run_tests.py --coverage             # Run with coverage reporting
  python run_tests.py --ci                   # Run complete CI pipeline
  python run_tests.py --all --verbose        # Run all tests with verbose output
        """
    )
    
    # Test selection options
    test_group = parser.add_mutually_exclusive_group()
    test_group.add_argument("--unit", action="store_true", help="Run unit tests only")
    test_group.add_argument("--integration", action="store_true", help="Run integration tests only")
    test_group.add_argument("--performance", action="store_true", help="Run performance tests only")
    test_group.add_argument("--security", action="store_true", help="Run security tests only")
    test_group.add_argument("--coverage", action="store_true", help="Run with coverage reporting")
    test_group.add_argument("--all", action="store_true", help="Run all tests")
    test_group.add_argument("--ci", action="store_true", help="Run complete CI pipeline")
    
    # Additional options
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--install-deps", action="store_true", help="Install dependencies first")
    parser.add_argument("--lint", action="store_true", help="Run lint checks")
    parser.add_argument("--scan", action="store_true", help="Run security scans")
    parser.add_argument("--report", action="store_true", help="Generate test report")
    
    args = parser.parse_args()
    
    # Default to running all tests if no specific option is given
    if not any([args.unit, args.integration, args.performance, args.security, 
                args.coverage, args.all, args.ci]):
        args.all = True
    
    runner = TemplateEngineTestRunner()
    success = True
    
    try:
        # Install dependencies if requested
        if args.install_deps:
            if not runner.install_dependencies():
                return 1
        
        # Run lint checks if requested
        if args.lint:
            if not runner.run_lint_checks():
                success = False
        
        # Run security scans if requested
        if args.scan:
            if not runner.run_security_scan():
                success = False
        
        # Run tests based on selection
        if args.ci:
            success = runner.run_ci_pipeline()
        elif args.unit:
            success = runner.run_unit_tests(args.verbose)
        elif args.integration:
            success = runner.run_integration_tests(args.verbose)
        elif args.performance:
            success = runner.run_performance_tests(args.verbose)
        elif args.security:
            success = runner.run_security_tests(args.verbose)
        elif args.coverage:
            success = runner.run_coverage_tests(html_report=True)
        elif args.all:
            success = runner.run_all_tests(args.verbose)
        
        # Generate report if requested
        if args.report:
            if not runner.generate_test_report():
                success = False
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Test execution interrupted by user")
        return 130
    except Exception as e:
        print(f"\n\n❌ Test runner error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())