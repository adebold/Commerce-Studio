#!/usr/bin/env python3
"""
MongoDB Foundation Service - TDD Framework Validation
====================================================

This script validates that the TDD framework is properly configured and
all test specifications are correctly defined for the RED phase.

Usage:
    python validate_tdd_framework.py
"""

import sys
import os
import ast
import inspect
from pathlib import Path
from typing import List, Dict, Set, Any
import importlib.util

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


class TDDFrameworkValidator:
    """
    Validates the TDD framework configuration and test specifications
    """
    
    def __init__(self):
        self.test_dir = Path(__file__).parent
        self.validation_results = {}
        self.errors = []
        self.warnings = []
    
    def validate_framework(self) -> bool:
        """
        Run comprehensive validation of the TDD framework
        """
        print("🔍 Validating MongoDB Foundation Service TDD Framework")
        print("=" * 60)
        
        validations = [
            ("File Structure", self._validate_file_structure),
            ("Test Specifications", self._validate_test_specifications),
            ("RED Phase Tests", self._validate_red_phase_tests),
            ("Test Categories", self._validate_test_categories),
            ("Performance Tests", self._validate_performance_tests),
            ("Security Tests", self._validate_security_tests),
            ("Integration Tests", self._validate_integration_tests),
            ("Configuration", self._validate_configuration),
            ("Dependencies", self._validate_dependencies)
        ]
        
        all_passed = True
        
        for validation_name, validation_func in validations:
            print(f"\n📋 {validation_name}")
            print("-" * 40)
            
            try:
                passed = validation_func()
                self.validation_results[validation_name] = passed
                
                if passed:
                    print(f"✅ {validation_name} validation passed")
                else:
                    print(f"❌ {validation_name} validation failed")
                    all_passed = False
                    
            except Exception as e:
                print(f"💥 {validation_name} validation error: {e}")
                self.validation_results[validation_name] = False
                self.errors.append(f"{validation_name}: {e}")
                all_passed = False
        
        self._print_summary()
        return all_passed
    
    def _validate_file_structure(self) -> bool:
        """
        Validate required files exist and are properly structured
        """
        required_files = [
            "test_tdd_framework_specification.py",
            "conftest.py",
            "pytest.ini",
            "test_requirements.txt",
            "run_tdd_tests.py",
            "README.md"
        ]
        
        missing_files = []
        for file_name in required_files:
            file_path = self.test_dir / file_name
            if file_path.exists():
                print(f"  ✅ {file_name}")
            else:
                print(f"  ❌ {file_name} missing")
                missing_files.append(file_name)
        
        return len(missing_files) == 0
    
    def _validate_test_specifications(self) -> bool:
        """
        Validate test specification file structure and content
        """
        test_file = self.test_dir / "test_tdd_framework_specification.py"
        
        if not test_file.exists():
            print("  ❌ Test specification file missing")
            return False
        
        # Parse the test file
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            tree = ast.parse(content)
            
            # Find test classes
            test_classes = []
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef) and node.name.startswith("Test"):
                    test_classes.append(node.name)
            
            expected_classes = [
                "TestSchemaValidation",
                "TestPerformanceBenchmarks", 
                "TestDataIntegritySkuGenie",
                "TestCrudOperationsAuditLogging",
                "TestRealTimeSyncConflictResolution",
                "TestProductDataServiceIntegration",
                "TestEdgeCaseHandling",
                "TestSecurityValidation"
            ]
            
            missing_classes = []
            for expected_class in expected_classes:
                if expected_class in test_classes:
                    print(f"  ✅ {expected_class}")
                else:
                    print(f"  ❌ {expected_class} missing")
                    missing_classes.append(expected_class)
            
            return len(missing_classes) == 0
            
        except SyntaxError as e:
            print(f"  ❌ Syntax error in test file: {e}")
            return False
        except Exception as e:
            print(f"  ❌ Error parsing test file: {e}")
            return False
    
    def _validate_red_phase_tests(self) -> bool:
        """
        Validate RED phase tests are properly defined
        """
        test_file = self.test_dir / "test_tdd_framework_specification.py"
        
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for RED phase test methods
            red_phase_methods = []
            lines = content.split('\n')
            
            for i, line in enumerate(lines):
                if "def test_" in line and "_red_phase" in line:
                    method_name = line.strip().split('(')[0].replace('async def ', '').replace('def ', '')
                    red_phase_methods.append(method_name)
            
            print(f"  ✅ Found {len(red_phase_methods)} RED phase test methods")
            
            # Validate RED phase tests have NotImplementedError expectations
            not_implemented_count = content.count("pytest.raises(NotImplementedError")
            print(f"  ✅ Found {not_implemented_count} NotImplementedError expectations")
            
            # Minimum expected RED phase tests
            min_red_phase_tests = 15
            if len(red_phase_methods) >= min_red_phase_tests:
                print(f"  ✅ Sufficient RED phase tests ({len(red_phase_methods)} >= {min_red_phase_tests})")
                return True
            else:
                print(f"  ❌ Insufficient RED phase tests ({len(red_phase_methods)} < {min_red_phase_tests})")
                return False
                
        except Exception as e:
            print(f"  ❌ Error validating RED phase tests: {e}")
            return False
    
    def _validate_test_categories(self) -> bool:
        """
        Validate all required test categories are covered
        """
        required_categories = [
            "Schema Validation",
            "Performance Benchmarks", 
            "Data Integrity",
            "CRUD Operations",
            "Real-time Sync",
            "Integration",
            "Edge Cases",
            "Security"
        ]
        
        test_file = self.test_dir / "test_tdd_framework_specification.py"
        
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            covered_categories = []
            for category in required_categories:
                # Check for the category name with flexible spacing and punctuation
                category_variants = [
                    category,  # Exact match
                    category.replace(" ", ""),  # No spaces
                    category.replace(" ", "-"),  # Hyphenated
                    category.replace("-", " "),  # Spaces instead of hyphens
                ]
                
                found = False
                for variant in category_variants:
                    if variant.lower() in content.lower():
                        found = True
                        break
                
                if found:
                    print(f"  ✅ {category} tests found")
                    covered_categories.append(category)
                else:
                    print(f"  ❌ {category} tests missing")
            
            return len(covered_categories) == len(required_categories)
            
        except Exception as e:
            print(f"  ❌ Error validating test categories: {e}")
            return False
    
    def _validate_performance_tests(self) -> bool:
        """
        Validate performance tests meet sub-100ms requirements
        """
        test_file = self.test_dir / "test_tdd_framework_specification.py"
        
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for performance assertions
            performance_checks = [
                "< 100",  # Sub-100ms requirements
                "time.perf_counter()",  # Performance measurement
                "query_time_ms",  # Query time tracking
                "operation_time_ms"  # Operation time tracking
            ]
            
            found_checks = []
            for check in performance_checks:
                if check in content:
                    print(f"  ✅ {check} found in performance tests")
                    found_checks.append(check)
                else:
                    print(f"  ❌ {check} missing from performance tests")
            
            return len(found_checks) == len(performance_checks)
            
        except Exception as e:
            print(f"  ❌ Error validating performance tests: {e}")
            return False
    
    def _validate_security_tests(self) -> bool:
        """
        Validate security tests cover required attack vectors
        """
        test_file = self.test_dir / "test_tdd_framework_specification.py"
        
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for security test coverage
            security_checks = [
                "injection",  # NoSQL/SQL injection
                "xss",  # Cross-site scripting
                "sanitization",  # Input sanitization
                "authentication",  # Auth checks
                "encryption"  # Data encryption
            ]
            
            found_checks = []
            for check in security_checks:
                if check.lower() in content.lower():
                    print(f"  ✅ {check} security tests found")
                    found_checks.append(check)
                else:
                    print(f"  ❌ {check} security tests missing")
            
            return len(found_checks) >= 3  # At least 3 security categories
            
        except Exception as e:
            print(f"  ❌ Error validating security tests: {e}")
            return False
    
    def _validate_integration_tests(self) -> bool:
        """
        Validate integration tests cover key external dependencies
        """
        test_file = self.test_dir / "test_tdd_framework_specification.py"
        
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for integration coverage
            integration_checks = [
                "ProductDataService",  # Existing service integration
                "SKUGenie",  # External data source
                "webhook",  # Real-time sync
                "transformation"  # Data transformation
            ]
            
            found_checks = []
            for check in integration_checks:
                if check in content:
                    print(f"  ✅ {check} integration tests found")
                    found_checks.append(check)
                else:
                    print(f"  ❌ {check} integration tests missing")
            
            return len(found_checks) >= 3  # At least 3 integration categories
            
        except Exception as e:
            print(f"  ❌ Error validating integration tests: {e}")
            return False
    
    def _validate_configuration(self) -> bool:
        """
        Validate pytest and test configuration
        """
        config_file = self.test_dir / "pytest.ini"
        conftest_file = self.test_dir / "conftest.py"
        
        config_valid = True
        
        # Validate pytest.ini
        if config_file.exists():
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    config_content = f.read()
                
                required_config = [
                    "testpaths",
                    "python_files",
                    "markers",
                    "asyncio_mode"
                ]
                
                for config_item in required_config:
                    if config_item in config_content:
                        print(f"  ✅ {config_item} configured")
                    else:
                        print(f"  ❌ {config_item} missing from pytest.ini")
                        config_valid = False
                        
            except Exception as e:
                print(f"  ❌ Error reading pytest.ini: {e}")
                config_valid = False
        else:
            print("  ❌ pytest.ini missing")
            config_valid = False
        
        # Validate conftest.py
        if conftest_file.exists():
            try:
                with open(conftest_file, 'r', encoding='utf-8') as f:
                    conftest_content = f.read()
                
                required_fixtures = [
                    "@pytest.fixture",
                    "mongodb_test_client",
                    "sample_product_data",
                    "clean_test_database"
                ]
                
                for fixture in required_fixtures:
                    if fixture in conftest_content:
                        print(f"  ✅ {fixture} configured")
                    else:
                        print(f"  ❌ {fixture} missing from conftest.py")
                        config_valid = False
                        
            except Exception as e:
                print(f"  ❌ Error reading conftest.py: {e}")
                config_valid = False
        else:
            print("  ❌ conftest.py missing")
            config_valid = False
        
        return config_valid
    
    def _validate_dependencies(self) -> bool:
        """
        Validate required test dependencies
        """
        requirements_file = self.test_dir / "test_requirements.txt"
        
        if not requirements_file.exists():
            print("  ❌ test_requirements.txt missing")
            return False
        
        try:
            with open(requirements_file, 'r', encoding='utf-8') as f:
                requirements_content = f.read()
            
            required_packages = [
                "pytest",
                "pytest-asyncio",
                "motor",
                "pymongo",
                "mongomock",
                "faker",
                "pytest-cov"
            ]
            
            missing_packages = []
            for package in required_packages:
                if package in requirements_content:
                    print(f"  ✅ {package}")
                else:
                    print(f"  ❌ {package} missing")
                    missing_packages.append(package)
            
            return len(missing_packages) == 0
            
        except Exception as e:
            print(f"  ❌ Error reading requirements: {e}")
            return False
    
    def _print_summary(self):
        """
        Print validation summary
        """
        print("\n" + "=" * 60)
        print("📊 TDD FRAMEWORK VALIDATION SUMMARY")
        print("=" * 60)
        
        passed_validations = sum(1 for result in self.validation_results.values() if result)
        total_validations = len(self.validation_results)
        
        print(f"Validations Passed: {passed_validations}/{total_validations}")
        
        if passed_validations == total_validations:
            print("✅ TDD Framework is properly configured and ready for use!")
            print("\n🚀 Next Steps:")
            print("  1. Run RED phase tests: python run_tdd_tests.py --phase red")
            print("  2. Implement MongoDB Foundation Service using Auto-Coder mode")
            print("  3. Run GREEN phase tests to validate implementation")
        else:
            print("❌ TDD Framework has configuration issues that need to be resolved")
            
            if self.errors:
                print("\n🐛 Errors Found:")
                for error in self.errors:
                    print(f"  • {error}")
            
            if self.warnings:
                print("\n⚠️  Warnings:")
                for warning in self.warnings:
                    print(f"  • {warning}")


def main():
    """
    Main validation entry point
    """
    validator = TDDFrameworkValidator()
    success = validator.validate_framework()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()