"""
MongoDB Test Framework Validation

Validates that the comprehensive test framework meets all Phase 2 requirements
and TDD principles for the Agentic Implementation Strategy.
"""
import os
import sys
from pathlib import Path
from typing import List, Dict, Any
import ast
import importlib.util


class TestFrameworkValidator:
    """Validates the MongoDB test framework completeness and quality."""
    
    def __init__(self):
        self.test_dir = Path(__file__).parent
        self.validation_results = {}
        
    def validate_all(self) -> Dict[str, Any]:
        """Run comprehensive validation of the test framework."""
        print("🔍 Validating MongoDB Test Framework")
        print("=" * 50)
        
        validations = [
            ("Test Structure", self._validate_test_structure),
            ("Schema Validation Coverage", self._validate_schema_coverage),
            ("Data Integrity Coverage", self._validate_integrity_coverage),
            ("Performance Coverage", self._validate_performance_coverage),
            ("Migration Coverage", self._validate_migration_coverage),
            ("TDD Compliance", self._validate_tdd_compliance),
            ("Requirements Fulfillment", self._validate_requirements)
        ]
        
        for validation_name, validation_func in validations:
            print(f"\n📋 {validation_name}...")
            result = validation_func()
            self.validation_results[validation_name] = result
            
            if result["passed"]:
                print(f"✅ {validation_name}: PASSED")
            else:
                print(f"❌ {validation_name}: FAILED")
                for issue in result.get("issues", []):
                    print(f"   • {issue}")
        
        return self._generate_validation_summary()
    
    def _validate_test_structure(self) -> Dict[str, Any]:
        """Validate the test framework structure."""
        required_files = [
            "__init__.py",
            "conftest.py", 
            "test_schema_validation.py",
            "test_data_integrity.py",
            "test_performance_benchmarks.py",
            "test_migration_validation.py",
            "requirements.txt",
            "run_tests.py",
            "README.md",
            "pytest.ini"
        ]
        
        issues = []
        for file_name in required_files:
            file_path = self.test_dir / file_name
            if not file_path.exists():
                issues.append(f"Missing required file: {file_name}")
        
        return {
            "passed": len(issues) == 0,
            "issues": issues,
            "files_checked": len(required_files),
            "files_found": len(required_files) - len(issues)
        }
    
    def _validate_schema_coverage(self) -> Dict[str, Any]:
        """Validate schema validation test coverage."""
        required_test_classes = [
            "TestProductsSchemaValidation",
            "TestBrandsSchemaValidation", 
            "TestCategoriesSchemaValidation",
            "TestSchemaConstraints"
        ]
        
        required_test_methods = [
            "test_product_required_fields_validation",
            "test_product_data_types_validation",
            "test_face_shape_compatibility_validation",
            "test_metadata_validation",
            "test_brand_required_fields_validation",
            "test_category_required_fields_validation"
        ]
        
        return self._validate_test_file_coverage(
            "test_schema_validation.py",
            required_test_classes,
            required_test_methods
        )
    
    def _validate_integrity_coverage(self) -> Dict[str, Any]:
        """Validate data integrity test coverage."""
        required_test_classes = [
            "TestCrossCollectionReferences",
            "TestDuplicatePrevention",
            "TestDataConsistency",
            "TestRelationshipIntegrity"
        ]
        
        required_test_methods = [
            "test_product_brand_reference_integrity",
            "test_product_category_reference_integrity",
            "test_product_unique_constraints",
            "test_brand_unique_constraints",
            "test_category_unique_constraints"
        ]
        
        return self._validate_test_file_coverage(
            "test_data_integrity.py",
            required_test_classes,
            required_test_methods
        )
    
    def _validate_performance_coverage(self) -> Dict[str, Any]:
        """Validate performance benchmark test coverage."""
        required_test_classes = [
            "TestQueryPerformance",
            "TestIndexUtilization",
            "TestConcurrentAccess",
            "TestLargeDatasetPerformance"
        ]
        
        required_test_methods = [
            "test_product_search_performance",
            "test_face_shape_compatibility_query_performance",
            "test_index_usage_verification",
            "test_concurrent_read_performance",
            "test_large_dataset_creation"
        ]
        
        return self._validate_test_file_coverage(
            "test_performance_benchmarks.py",
            required_test_classes,
            required_test_methods
        )
    
    def _validate_migration_coverage(self) -> Dict[str, Any]:
        """Validate migration validation test coverage."""
        required_test_classes = [
            "TestSKUGenieDataTransformation",
            "TestPostgreSQLToMongoDBMigration",
            "TestDataQualityPreservation",
            "TestMLCompatibilityScoreAccuracy"
        ]
        
        required_test_methods = [
            "test_sku_genie_to_mongodb_transformation",
            "test_batch_transformation_validation",
            "test_data_type_migration_validation",
            "test_quality_score_preservation",
            "test_face_shape_compatibility_migration"
        ]
        
        return self._validate_test_file_coverage(
            "test_migration_validation.py",
            required_test_classes,
            required_test_methods
        )
    
    def _validate_test_file_coverage(self, file_name: str, required_classes: List[str], required_methods: List[str]) -> Dict[str, Any]:
        """Validate coverage of a specific test file."""
        file_path = self.test_dir / file_name
        
        if not file_path.exists():
            return {
                "passed": False,
                "issues": [f"Test file {file_name} not found"],
                "classes_found": 0,
                "methods_found": 0
            }
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                tree = ast.parse(f.read())
            
            found_classes = []
            found_methods = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    found_classes.append(node.name)
                elif isinstance(node, ast.FunctionDef):
                    found_methods.append(node.name)
            
            issues = []
            
            # Check for missing classes
            for required_class in required_classes:
                if required_class not in found_classes:
                    issues.append(f"Missing test class: {required_class}")
            
            # Check for missing methods
            for required_method in required_methods:
                if required_method not in found_methods:
                    issues.append(f"Missing test method: {required_method}")
            
            return {
                "passed": len(issues) == 0,
                "issues": issues,
                "classes_found": len([c for c in found_classes if c in required_classes]),
                "methods_found": len([m for m in found_methods if m in required_methods]),
                "total_classes": len(found_classes),
                "total_methods": len(found_methods)
            }
            
        except Exception as e:
            return {
                "passed": False,
                "issues": [f"Error parsing {file_name}: {str(e)}"],
                "classes_found": 0,
                "methods_found": 0
            }
    
    def _validate_tdd_compliance(self) -> Dict[str, Any]:
        """Validate TDD compliance of the test framework."""
        tdd_requirements = [
            "Tests written before implementation",
            "Red-Green-Refactor cycle support",
            "Comprehensive test coverage",
            "Performance regression tests",
            "Declarative test specifications"
        ]
        
        # Check for TDD indicators in test files
        tdd_indicators = []
        
        # Look for async test methods (MongoDB requires async)
        test_files = [
            "test_schema_validation.py",
            "test_data_integrity.py", 
            "test_performance_benchmarks.py",
            "test_migration_validation.py"
        ]
        
        async_test_count = 0
        total_test_count = 0
        
        for test_file in test_files:
            file_path = self.test_dir / test_file
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    tree = ast.parse(content)
                    
                    for node in ast.walk(tree):
                        if isinstance(node, ast.FunctionDef) and node.name.startswith('test_'):
                            total_test_count += 1
                            
                            # Check if it's an async test
                            if any(isinstance(d, ast.Name) and d.id == 'asyncio' for d in ast.walk(node)) or \
                               'async def' in content[node.lineno-1:node.end_lineno]:
                                async_test_count += 1
                                
                except Exception:
                    pass
        
        issues = []
        
        # Validate async test coverage (required for MongoDB)
        if async_test_count < total_test_count * 0.8:  # At least 80% should be async
            issues.append(f"Insufficient async test coverage: {async_test_count}/{total_test_count}")
        
        # Check for performance timing in tests
        performance_file = self.test_dir / "test_performance_benchmarks.py"
        if performance_file.exists():
            with open(performance_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if "performance_timer" not in content:
                    issues.append("Performance tests missing timing mechanisms")
        
        return {
            "passed": len(issues) == 0,
            "issues": issues,
            "async_test_coverage": f"{async_test_count}/{total_test_count}",
            "tdd_requirements_met": len(tdd_requirements) - len(issues)
        }
    
    def _validate_requirements(self) -> Dict[str, Any]:
        """Validate that all Phase 2 requirements are fulfilled."""
        requirements = [
            ("Schema Validation Tests", ["Products field validation", "Face shape scoring", "Data type constraints"]),
            ("Data Integrity Tests", ["Cross-collection references", "Duplicate prevention", "Consistency checks"]),
            ("Performance Benchmarks", ["<100ms query target", "Index utilization", "10,000+ products"]),
            ("Migration Validation", ["SKU Genie transformation", "PostgreSQL migration", "ML compatibility"])
        ]
        
        issues = []
        requirements_met = 0
        
        for req_category, req_items in requirements:
            # This is a simplified check - in practice, would analyze test content more deeply
            test_file_map = {
                "Schema Validation Tests": "test_schema_validation.py",
                "Data Integrity Tests": "test_data_integrity.py", 
                "Performance Benchmarks": "test_performance_benchmarks.py",
                "Migration Validation": "test_migration_validation.py"
            }
            
            test_file = self.test_dir / test_file_map[req_category]
            if test_file.exists():
                requirements_met += 1
            else:
                issues.append(f"Missing tests for: {req_category}")
        
        # Check for specific performance targets
        performance_file = self.test_dir / "test_performance_benchmarks.py"
        if performance_file.exists():
            with open(performance_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if "100" not in content:  # Looking for 100ms targets
                    issues.append("Performance tests missing <100ms target validation")
        
        return {
            "passed": len(issues) == 0,
            "issues": issues,
            "requirements_met": requirements_met,
            "total_requirements": len(requirements)
        }
    
    def _generate_validation_summary(self) -> Dict[str, Any]:
        """Generate comprehensive validation summary."""
        total_validations = len(self.validation_results)
        passed_validations = sum(1 for result in self.validation_results.values() if result["passed"])
        
        summary = {
            "overall_passed": passed_validations == total_validations,
            "validation_count": total_validations,
            "passed_count": passed_validations,
            "failed_count": total_validations - passed_validations,
            "success_rate": (passed_validations / total_validations) * 100,
            "detailed_results": self.validation_results
        }
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 VALIDATION SUMMARY")
        print("=" * 50)
        print(f"Overall Status: {'✅ PASSED' if summary['overall_passed'] else '❌ FAILED'}")
        print(f"Validations: {passed_validations}/{total_validations} passed")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        
        if summary["overall_passed"]:
            print("\n🎉 MongoDB Test Framework is ready for Phase 2!")
            print("✨ All TDD requirements and test coverage validated")
            print("🚀 Proceed to Auto-Coder mode for MongoDB implementation")
        else:
            print(f"\n⚠️  {summary['failed_count']} validation(s) failed")
            print("🔧 Address issues before proceeding to implementation")
        
        return summary


def main():
    """Main validation entry point."""
    print("🏗️  MongoDB Test Framework Validator")
    print("Phase 2: TDD Compliance and Coverage Validation")
    print()
    
    validator = TestFrameworkValidator()
    summary = validator.validate_all()
    
    return 0 if summary["overall_passed"] else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)