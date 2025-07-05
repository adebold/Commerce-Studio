"""
Eyewear-ML Commercial Status Report - Test Framework

This package provides comprehensive test specifications and validation framework
for the Commercial Status Report that will be generated for the Optometry 
Practice Analytics Platform (Eyewear-ML).

The test framework follows Test-Driven Development (TDD) principles and ensures
the final report meets all requirements from the LS1_01 to LS1_08 prompts.

Modules:
- test_specs_commercial_status_report: Declarative test specifications
- test_implementation_eyewear_ml: Concrete validation implementation  
- test_runner: Pytest-based test suite
- run_tests: Executable test runner script

Usage:
    # Run all tests
    python run_tests.py
    
    # Run specific test category
    pytest -m "executive_summary"
    
    # Validate existing report
    python test_implementation_eyewear_ml.py path/to/report.md
"""

__version__ = "1.0.0"
__author__ = "Eyewear-ML TDD Team"

# Export main classes for external use
from .test_specs_commercial_status_report import (
    CommercialStatusReportTestSpecs,
    TestSpecification,
    AcceptanceCriteria
)

from .test_implementation_eyewear_ml import (
    EyewearMLStatusReportValidator,
    ValidationResult
)

__all__ = [
    "CommercialStatusReportTestSpecs",
    "TestSpecification", 
    "AcceptanceCriteria",
    "EyewearMLStatusReportValidator",
    "ValidationResult"
]