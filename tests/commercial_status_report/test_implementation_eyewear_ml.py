#!/usr/bin/env python3
"""
Eyewear-ML Commercial Status Report - Test Implementation Guide
Implements TDD validation for the Eyewear-ML platform commercial status report
"""

import os
import re
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
import subprocess
import time
import psutil
from urllib.parse import urlparse


@dataclass
class ValidationResult:
    """Represents the result of a validation test."""
    test_name: str
    passed: bool
    message: str
    details: Optional[Dict[str, Any]] = None
    severity: str = "error"  # error, warning, info


class EyewearMLStatusReportValidator:
    """
    Comprehensive validator for the Eyewear-ML Commercial Status Report.
    Implements TDD principles with specific focus on the eyewear-ml project structure.
    """
    
    def __init__(self, report_path: str, project_root: str = "."):
        self.report_path = Path(report_path)
        self.project_root = Path(project_root)
        self.content = ""
        self.validation_results: List[ValidationResult] = []
        
        # Eyewear-ML specific project structure
        self.expected_directories = {
            "src": ["virtual_try_on", "recommendations", "mongodb_foundation", "reliability"],
            "auth": ["auth-service"],
            "frontend": ["frontend"],
            "business-services": ["product-service"],
            "tests": ["e2e", "integration", "mongodb_foundation", "security"],
            "deployment": ["kubernetes", "docker-config", "deployment-scripts"],
            "docs": ["sku-genie", "architecture"],
            "observability": ["observability"],
            "config": ["config"]
        }
        
        # Critical files that should be referenced in the report
        self.critical_files = [
            "src/mongodb_foundation/mongodb_client.py",
            "src/mongodb_foundation/service.py", 
            "src/recommendations/engine.py",
            "src/virtual_try_on/service.py",
            "frontend/tsconfig.json",
            "business-services/product-service/src/infrastructure/mongodb.ts",
            "tests/e2e/virtual-try-on.test.js",
            "tests/integration/e-commerce/cross-platform/cross-platform-compatibility.test.ts",
            "kubernetes/deployments/",
            "docker-config/"
        ]

    def load_report(self) -> bool:
        """Load the report content from file."""
        try:
            if self.report_path.exists():
                self.content = self.report_path.read_text(encoding='utf-8')
                self._add_result("report_loaded", True, "Report loaded successfully")
                return True
            else:
                self._add_result("report_loaded", False, 
                               f"Report file not found: {self.report_path}")
                return False
        except Exception as e:
            self._add_result("report_loaded", False, 
                           f"Error loading report: {str(e)}")
            return False

    def validate_executive_summary(self) -> None:
        """Validate the Executive Summary section for eyewear-ml specifics."""
        section = self._extract_section("Executive Summary")
        
        if not section:
            self._add_result("executive_summary_exists", False, 
                           "Executive Summary section not found")
            return
        
        self._add_result("executive_summary_exists", True, 
                        "Executive Summary section found")
        
        # Word count validation
        word_count = len(section.split())
        self._add_result("executive_summary_word_count", 
                        200 <= word_count <= 400,
                        f"Word count: {word_count} (target: 200-400 words)")
        
        # Eyewear-ML specific content validation
        required_eyewear_ml_elements = {
            "virtual_try_on": ["virtual try-on", "try on", "virtual fitting"],
            "recommendations": ["recommendation", "personalized", "algorithm"],
            "ecommerce": ["e-commerce", "shopify", "woocommerce", "magento"],
            "ai_ml": ["AI", "machine learning", "ML", "artificial intelligence"],
            "platform_metrics": ["users", "accuracy", "performance", "uptime"],
            "growth_indicators": ["growth", "revenue", "expansion", "adoption"]
        }
        
        for element, keywords in required_eyewear_ml_elements.items():
            found = any(keyword.lower() in section.lower() for keyword in keywords)
            self._add_result(f"executive_summary_{element}", found,
                           f"{'Found' if found else 'Missing'} {element} content")

    def validate_platform_overview(self) -> None:
        """Validate Platform Overview section for eyewear-ml architecture."""
        section = self._extract_section("Platform Overview")
        
        if not section:
            self._add_result("platform_overview_exists", False,
                           "Platform Overview section not found")
            return
        
        self._add_result("platform_overview_exists", True,
                        "Platform Overview section found")
        
        # Core eyewear-ml components validation
        required_components = {
            "virtual_try_on": ["virtual try-on", "face detection", "AR", "computer vision"],
            "recommendation_engine": ["recommendation", "collaborative filtering", "content-based"],
            "mongodb_foundation": ["mongodb", "database", "data storage", "atlas"],
            "authentication": ["auth", "authentication", "JWT", "OAuth"],
            "api_gateway": ["api gateway", "API", "endpoint", "routing"],
            "frontend": ["frontend", "React", "TypeScript", "UI"],
            "ecommerce_integration": ["Shopify", "WooCommerce", "Magento", "BigCommerce"],
            "analytics": ["analytics", "tracking", "metrics", "monitoring"]
        }
        
        for component, keywords in required_components.items():
            found = any(keyword.lower() in section.lower() for keyword in keywords)
            self._add_result(f"platform_overview_{component}", found,
                           f"{'Documented' if found else 'Missing'} {component} component")

    def validate_file_references(self) -> None:
        """Validate file references are accurate for eyewear-ml project structure."""
        # Find all file references in markdown format
        file_ref_pattern = r'\[`([^`]+)`\]\(([^)]+)(?::(\d+))?\)'
        matches = re.finditer(file_ref_pattern, self.content)
        
        total_refs = 0
        valid_refs = 0
        
        for match in matches:
            total_refs += 1
            filename = match.group(1)
            file_path = match.group(2)
            line_number = match.group(3)
            
            # Validate file existence
            full_path = self.project_root / file_path
            if full_path.exists():
                valid_refs += 1
                self._add_result(f"file_exists_{filename}", True,
                               f"File exists: {file_path}")
                
                # Validate line number if specified
                if line_number:
                    try:
                        with open(full_path, 'r', encoding='utf-8') as f:
                            total_lines = len(f.readlines())
                        
                        line_num = int(line_number)
                        if line_num <= total_lines:
                            self._add_result(f"line_valid_{filename}", True,
                                           f"Line {line_number} valid for {file_path}")
                        else:
                            self._add_result(f"line_valid_{filename}", False,
                                           f"Line {line_number} exceeds file length {total_lines}")
                    except Exception as e:
                        self._add_result(f"line_valid_{filename}", False,
                                       f"Error validating line number: {str(e)}")
            else:
                self._add_result(f"file_exists_{filename}", False,
                               f"File not found: {file_path}")
        
        # Overall file reference validation
        self._add_result("file_references_exist", total_refs > 0,
                        f"File references found: {total_refs}")

    def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run all validation tests and return comprehensive results."""
        start_time = time.time()
        
        # Clear previous results
        self.validation_results = []
        
        # Load report
        if not self.load_report():
            return {
                "status": "failed",
                "error": "Could not load report file",
                "results": []
            }
        
        # Run all validations
        validation_methods = [
            self.validate_executive_summary,
            self.validate_platform_overview,
            self.validate_file_references
        ]
        
        for method in validation_methods:
            try:
                method()
            except Exception as e:
                self._add_result(f"validation_error_{method.__name__}", False,
                               f"Validation method failed: {str(e)}")
        
        # Calculate results
        total_tests = len(self.validation_results)
        passed_tests = sum(1 for result in self.validation_results if result.passed)
        failed_tests = total_tests - passed_tests
        success_rate = passed_tests / total_tests if total_tests > 0 else 0
        
        execution_time = time.time() - start_time
        
        return {
            "status": "completed",
            "execution_time": execution_time,
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "results": [
                {
                    "test_name": result.test_name,
                    "passed": result.passed,
                    "message": result.message,
                    "severity": result.severity,
                    "details": result.details
                }
                for result in self.validation_results
            ]
        }

    def generate_validation_report(self) -> str:
        """Generate a comprehensive validation report."""
        results = self.run_comprehensive_validation()
        
        report = f"""# Eyewear-ML Commercial Status Report - Validation Results

## Summary
- **Total Tests**: {results['total_tests']}
- **Passed**: {results['passed_tests']}
- **Failed**: {results['failed_tests']}
- **Success Rate**: {results['success_rate']:.1%}
- **Execution Time**: {results['execution_time']:.2f} seconds

## Test Results

"""
        
        for result in results['results']:
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            report += f"### {status} {result['test_name']}\n"
            report += f"{result['message']}\n\n"
        
        report += """## Recommendations

Based on the validation results:

1. **File References**: Ensure all referenced files exist in the project
2. **Content Completeness**: Verify all required sections are present
3. **Data Freshness**: Update timestamps to reflect current status
4. **Technical Accuracy**: Validate all technical claims and metrics

## Next Steps

1. Address failed validations
2. Re-run comprehensive validation
3. Generate final commercial status report
"""
        
        return report

    def _extract_section(self, section_name: str) -> str:
        """Extract a specific section from the markdown content."""
        # Pattern to match section headers
        pattern = rf'^#{1,6}\s+.*{re.escape(section_name)}.*$'
        match = re.search(pattern, self.content, re.MULTILINE | re.IGNORECASE)
        
        if not match:
            return ""
        
        start = match.end()
        
        # Find the next section header at the same or higher level
        lines = self.content[start:].split('\n')
        section_lines = []
        
        for line in lines:
            if re.match(r'^#{1,6}\s+', line):
                break
            section_lines.append(line)
        
        return '\n'.join(section_lines).strip()

    def _add_result(self, test_name: str, passed: bool, message: str, 
                   details: Optional[Dict[str, Any]] = None, severity: str = "error") -> None:
        """Add a validation result."""
        result = ValidationResult(
            test_name=test_name,
            passed=passed,
            message=message,
            details=details,
            severity=severity
        )
        self.validation_results.append(result)


# CLI interface for the validator
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Validate Eyewear-ML Commercial Status Report")
    parser.add_argument("report_path", help="Path to the commercial status report")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    parser.add_argument("--output", help="Output file for validation report")
    
    args = parser.parse_args()
    
    validator = EyewearMLStatusReportValidator(args.report_path, args.project_root)
    report = validator.generate_validation_report()
    
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(report)
        print(f"Validation report saved to {args.output}")
    else:
        print(report)