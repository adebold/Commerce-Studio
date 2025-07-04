#!/usr/bin/env python3
"""
Commercial Status Report - Test Implementation Guide
Implementation of test specifications for automated validation
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from pathlib import Path
import pytest
import markdown
from unittest.mock import Mock, patch

@dataclass
class ValidationResult:
    """Container for validation results."""
    test_name: str
    passed: bool
    message: str
    severity: str = "error"  # error, warning, info

@dataclass
class FileReference:
    """Represents a file reference in markdown format."""
    display_text: str
    file_path: str
    line_number: Optional[int] = None
    
    def follows_format(self) -> bool:
        """Check if reference follows [`filename`](path:line) format."""
        expected_pattern = r'\[`[^`]+`\]\([^)]+(?::\d+)?\)'
        import re
        return bool(re.match(expected_pattern, self.display_text))
    
    def target_exists(self) -> bool:
        """Check if referenced file exists."""
        return os.path.exists(self.file_path)

class CommercialStatusReportValidator:
    """Main validator class for Commercial Status Report."""
    
    def __init__(self, report_path: str = "docs/commercial_status/Commercial_Status_Report.md"):
        self.report_path = report_path
        self.report_content = ""
        self.validation_results: List[ValidationResult] = []
        
    def load_report(self) -> bool:
        """Load the report content for validation."""
        try:
            with open(self.report_path, 'r', encoding='utf-8') as f:
                self.report_content = f.read()
            return True
        except FileNotFoundError:
            self.add_result("load_report", False, f"Report file not found: {self.report_path}", "error")
            return False
        except Exception as e:
            self.add_result("load_report", False, f"Error loading report: {str(e)}", "error")
            return False
    
    def add_result(self, test_name: str, passed: bool, message: str, severity: str = "error"):
        """Add validation result."""
        result = ValidationResult(test_name, passed, message, severity)
        self.validation_results.append(result)
        
    def validate_executive_summary(self) -> List[ValidationResult]:
        """Validate executive summary section."""
        results = []
        
        # Check if executive summary exists
        if "# Executive Summary" not in self.report_content and "## Executive Summary" not in self.report_content:
            self.add_result("executive_summary_exists", False, "Executive Summary section not found")
            return
        
        # Extract executive summary content
        import re
        pattern = r'#{1,2}\s*Executive Summary(.*?)(?=#{1,2}|\Z)'
        match = re.search(pattern, self.report_content, re.DOTALL | re.IGNORECASE)
        
        if not match:
            self.add_result("executive_summary_extract", False, "Could not extract Executive Summary content")
            return
            
        summary_content = match.group(1).strip()
        word_count = len(summary_content.split())
        
        # Test word count requirements
        if 200 <= word_count <= 500:
            self.add_result("executive_summary_word_count", True, f"Word count within range: {word_count}")
        else:
            self.add_result("executive_summary_word_count", False, 
                          f"Word count {word_count} not within required range 200-500")
        
        # Test for required content elements
        required_elements = {
            "revenue": ["revenue", "income", "earnings", "financial"],
            "growth": ["growth", "increase", "improvement", "expansion"],
            "achievements": ["achievement", "milestone", "success", "accomplishment"],
            "outlook": ["outlook", "future", "projection", "forecast", "strategy"]
        }
        
        for element, keywords in required_elements.items():
            found = any(keyword.lower() in summary_content.lower() for keyword in keywords)
            self.add_result(f"executive_summary_{element}", found, 
                          f"{'Found' if found else 'Missing'} {element} indicators")
    
    def validate_platform_overview(self) -> None:
        """Validate platform overview section."""
        required_components = [
            "virtual_try_on", "recommendation", "analytics", 
            "ecommerce", "user_management", "mongodb", "api"
        ]
        
        overview_pattern = r'#{1,2}\s*Platform Overview(.*?)(?=#{1,2}|\Z)'
        match = re.search(overview_pattern, self.report_content, re.DOTALL | re.IGNORECASE)
        
        if not match:
            self.add_result("platform_overview_exists", False, "Platform Overview section not found")
            return
            
        overview_content = match.group(1).strip()
        
        for component in required_components:
            found = any(keyword in overview_content.lower() 
                       for keyword in [component, component.replace("_", " "), component.replace("_", "-")])
            self.add_result(f"platform_overview_{component}", found,
                          f"{'Found' if found else 'Missing'} {component} component description")
    
    def validate_file_references(self) -> None:
        """Validate all file references in the report."""
        import re
        
        # Pattern to match [`filename`](path) or [`filename`](path:line) format
        pattern = r'\[`([^`]+)`\]\(([^)]+?)(?::(\d+))?\)'
        matches = re.findall(pattern, self.report_content)
        
        if not matches:
            self.add_result("file_references_exist", False, "No file references found in expected format")
            return
        
        self.add_result("file_references_exist", True, f"Found {len(matches)} file references")
        
        for filename, filepath, line_num in matches:
            # Check if file exists
            if os.path.exists(filepath):
                self.add_result(f"file_exists_{filename}", True, f"File exists: {filepath}")
                
                # Check line number if specified
                if line_num:
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            lines = f.readlines()
                            if int(line_num) <= len(lines):
                                self.add_result(f"line_valid_{filename}", True, 
                                              f"Line {line_num} exists in {filepath}")
                            else:
                                self.add_result(f"line_valid_{filename}", False,
                                              f"Line {line_num} exceeds file length {len(lines)} in {filepath}")
                    except Exception as e:
                        self.add_result(f"line_check_{filename}", False, 
                                      f"Error checking line number: {str(e)}")
            else:
                self.add_result(f"file_exists_{filename}", False, f"File not found: {filepath}")
    
    def validate_data_freshness(self) -> None:
        """Validate that data in the report is current."""
        current_time = datetime.now()
        
        # Check for timestamp patterns in the report
        import re
        timestamp_patterns = [
            r'(\d{4}-\d{2}-\d{2})',  # YYYY-MM-DD
            r'(\w+ \d{1,2}, \d{4})',  # Month DD, YYYY
            r'(\d{1,2}/\d{1,2}/\d{4})'  # MM/DD/YYYY
        ]
        
        timestamps_found = []
        for pattern in timestamp_patterns:
            matches = re.findall(pattern, self.report_content)
            timestamps_found.extend(matches)
        
        if timestamps_found:
            self.add_result("timestamps_present", True, f"Found {len(timestamps_found)} timestamps")
            
            # Check if any timestamps are recent (within last 30 days)
            recent_data_found = False
            for timestamp_str in timestamps_found:
                try:
                    # Try to parse the timestamp
                    from dateutil import parser
                    timestamp = parser.parse(timestamp_str)
                    age = current_time - timestamp
                    
                    if age <= timedelta(days=30):
                        recent_data_found = True
                        break
                except:
                    continue
            
            self.add_result("data_freshness", recent_data_found, 
                          "Recent data found" if recent_data_found else "No recent timestamps found")
        else:
            self.add_result("timestamps_present", False, "No timestamps found in report", "warning")
    
    def validate_security_compliance(self) -> None:
        """Validate security and compliance section."""
        security_keywords = [
            "encryption", "access control", "audit", "vulnerability", 
            "compliance", "security", "authentication", "authorization"
        ]
        
        security_pattern = r'#{1,2}\s*Security.*?Compliance(.*?)(?=#{1,2}|\Z)'
        match = re.search(security_pattern, self.report_content, re.DOTALL | re.IGNORECASE)
        
        if not match:
            self.add_result("security_section_exists", False, "Security & Compliance section not found")
            return
        
        security_content = match.group(1).strip()
        
        for keyword in security_keywords:
            found = keyword.lower() in security_content.lower()
            self.add_result(f"security_{keyword.replace(' ', '_')}", found,
                          f"{'Found' if found else 'Missing'} {keyword} coverage")
    
    def validate_markdown_structure(self) -> None:
        """Validate markdown formatting and structure."""
        lines = self.report_content.split('\n')
        
        # Check for proper header hierarchy
        header_levels = []
        for line in lines:
            if line.strip().startswith('#'):
                level = len(line.split()[0])  # Count # characters
                header_levels.append(level)
        
        if header_levels:
            # Check if headers start at level 1 or 2
            first_level = header_levels[0]
            if first_level in [1, 2]:
                self.add_result("header_hierarchy_start", True, f"Headers start at level {first_level}")
            else:
                self.add_result("header_hierarchy_start", False, 
                              f"Headers should start at level 1 or 2, found level {first_level}")
            
            # Check for proper hierarchy (no skipping levels)
            hierarchy_valid = True
            for i in range(1, len(header_levels)):
                if header_levels[i] > header_levels[i-1] + 1:
                    hierarchy_valid = False
                    break
            
            self.add_result("header_hierarchy_valid", hierarchy_valid,
                          "Header hierarchy is valid" if hierarchy_valid else "Header hierarchy skips levels")
        
        # Check for table formatting
        table_lines = [line for line in lines if '|' in line and line.strip().startswith('|')]
        if table_lines:
            self.add_result("tables_present", True, f"Found {len(table_lines)} table lines")
        
        # Check for code blocks
        code_blocks = self.report_content.count('```')
        if code_blocks % 2 == 0:
            self.add_result("code_blocks_balanced", True, f"Found {code_blocks//2} properly closed code blocks")
        else:
            self.add_result("code_blocks_balanced", False, "Unbalanced code block fences")
    
    def validate_external_links(self) -> None:
        """Validate external links are accessible."""
        import re
        
        # Find all markdown links
        link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
        matches = re.findall(link_pattern, self.report_content)
        
        external_links = [url for _, url in matches if url.startswith(('http://', 'https://'))]
        
        for link in external_links:
            try:
                response = requests.head(link, timeout=5, allow_redirects=True)
                if response.status_code == 200:
                    self.add_result(f"external_link_accessible", True, f"Link accessible: {link}")
                else:
                    self.add_result(f"external_link_accessible", False, 
                                  f"Link returned status {response.status_code}: {link}")
            except requests.RequestException as e:
                self.add_result(f"external_link_accessible", False, 
                              f"Link not accessible: {link} - {str(e)}")
    
    def create_supplemental_file_stubs(self) -> None:
        """Create stub files for missing supplemental files."""
        required_files = [
            "docs/commercial_status/executive_summary.md",
            "docs/commercial_status/technical_metrics.json",
            "docs/commercial_status/security_audit_summary.md",
            "docs/commercial_status/performance_benchmarks.csv"
        ]
        
        for file_path in required_files:
            if not os.path.exists(file_path):
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                
                # Create appropriate stub content based on file type
                if file_path.endswith('.md'):
                    stub_content = f"""# {os.path.basename(file_path).replace('_', ' ').replace('.md', '').title()}

**Status**: Stub file created automatically
**Generated**: {datetime.now().isoformat()}

This file was created as a stub to satisfy Commercial Status Report requirements.
Please update with actual content.

## Content Required
- [Add specific content requirements here]

## Data Sources
- [Specify data sources and collection methods]

## Update Schedule
- [Define how often this file should be updated]
"""
                elif file_path.endswith('.json'):
                    stub_content = json.dumps({
                        "status": "stub",
                        "generated": datetime.now().isoformat(),
                        "description": "Stub file created for Commercial Status Report",
                        "data": {},
                        "metadata": {
                            "version": "1.0",
                            "last_updated": datetime.now().isoformat()
                        }
                    }, indent=2)
                elif file_path.endswith('.csv'):
                    stub_content = """# Commercial Status Report Data Stub
# Generated: {datetime.now().isoformat()}
metric,value,unit,timestamp,source
placeholder,0,units,{datetime.now().isoformat()},stub_generator
"""
                else:
                    stub_content = f"# Stub file created {datetime.now().isoformat()}\n"
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(stub_content)
                
                self.add_result("stub_file_created", True, f"Created stub file: {file_path}", "info")
    
    def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run all validation tests and return comprehensive results."""
        if not self.load_report():
            return {"status": "failed", "error": "Could not load report file"}
        
        # Run all validation tests
        self.validate_executive_summary()
        self.validate_platform_overview()
        self.validate_file_references()
        self.validate_data_freshness()
        self.validate_security_compliance()
        self.validate_markdown_structure()
        self.validate_external_links()
        self.create_supplemental_file_stubs()
        
        # Compile results
        total_tests = len(self.validation_results)
        passed_tests = sum(1 for result in self.validation_results if result.passed)
        error_count = sum(1 for result in self.validation_results if result.severity == "error" and not result.passed)
        warning_count = sum(1 for result in self.validation_results if result.severity == "warning")
        
        return {
            "status": "completed",
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "error_count": error_count,
            "warning_count": warning_count,
            "success_rate": passed_tests / total_tests if total_tests > 0 else 0,
            "results": [
                {
                    "test": result.test_name,
                    "passed": result.passed,
                    "message": result.message,
                    "severity": result.severity
                }
                for result in self.validation_results
            ]
        }
    
    def generate_validation_report(self) -> str:
        """Generate a markdown validation report."""
        results = self.run_comprehensive_validation()
        
        report = f"""# Commercial Status Report - Validation Results

**Validation Date**: {datetime.now().isoformat()}
**Report Path**: {self.report_path}

## Summary

- **Total Tests**: {results['total_tests']}
- **Passed**: {results['passed_tests']}
- **Failed**: {results['failed_tests']}
- **Success Rate**: {results['success_rate']:.1%}
- **Errors**: {results['error_count']}
- **Warnings**: {results['warning_count']}

## Test Results

"""
        
        # Group results by category
        categories = {}
        for result in results['results']:
            category = result['test'].split('_')[0]
            if category not in categories:
                categories[category] = []
            categories[category].append(result)
        
        for category, category_results in categories.items():
            report += f"### {category.replace('_', ' ').title()}\n\n"
            
            for result in category_results:
                status_icon = "✅" if result['passed'] else "❌"
                severity_icon = {"error": "🔴", "warning": "🟡", "info": "🔵"}.get(result['severity'], "")
                
                report += f"- {status_icon} {severity_icon} **{result['test']}**: {result['message']}\n"
            
            report += "\n"
        
        # Add recommendations
        report += """## Recommendations

### Critical Issues
Fix all failed tests marked as errors before report publication.

### Warnings  
Address warnings to improve report quality and completeness.

### Next Steps
1. Review failed tests and implement fixes
2. Re-run validation after corrections
3. Monitor data freshness for ongoing accuracy
4. Update supplemental files with actual content

"""
        
        return report


def main():
    """Main function to run validation."""
    validator = CommercialStatusReportValidator()
    
    # Run validation
    results = validator.run_comprehensive_validation()
    
    # Generate and save validation report
    validation_report = validator.generate_validation_report()
    
    # Save validation report
    report_dir = "docs/commercial_status"
    os.makedirs(report_dir, exist_ok=True)
    
    with open(f"{report_dir}/validation_report.md", 'w', encoding='utf-8') as f:
        f.write(validation_report)
    
    # Print summary
    print(f"Validation completed: {results['success_rate']:.1%} success rate")
    print(f"Results saved to: {report_dir}/validation_report.md")
    
    # Return exit code based on results
    return 0 if results['error_count'] == 0 else 1


if __name__ == "__main__":
    exit(main())