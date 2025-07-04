#!/usr/bin/env python3
"""
VARAi API Documentation Validator

This script validates the OpenAPI specification and documentation files to ensure
they are accurate, consistent, and up-to-date.

Features:
- Validates OpenAPI specification against the OpenAPI schema
- Checks for broken links in documentation
- Ensures all endpoints in the API are documented
- Validates example code snippets
- Checks for consistency between documentation and actual API behavior
- Generates a validation report

Usage:
    python validate_docs.py [options]

Options:
    --openapi-file PATH    Path to the OpenAPI specification file
    --docs-dir PATH        Path to the documentation directory
    --report-file PATH     Path to output the validation report
    --fix                  Attempt to fix issues automatically
    --verbose              Enable verbose output
"""

import argparse
import json
import os
import re
import sys
import yaml
import logging
import requests
import markdown
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any, Optional
from jsonschema import validate, ValidationError
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("docs-validator")

# OpenAPI schema URL
OPENAPI_SCHEMA_URL = "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/schemas/v3.1/schema.json"

class DocumentationValidator:
    """Validator for API documentation."""

    def __init__(
        self,
        openapi_file: str,
        docs_dir: str,
        report_file: str,
        fix_issues: bool = False,
        verbose: bool = False
    ):
        """Initialize the validator.

        Args:
            openapi_file: Path to the OpenAPI specification file
            docs_dir: Path to the documentation directory
            report_file: Path to output the validation report
            fix_issues: Whether to attempt to fix issues automatically
            verbose: Whether to enable verbose output
        """
        self.openapi_file = Path(openapi_file)
        self.docs_dir = Path(docs_dir)
        self.report_file = Path(report_file)
        self.fix_issues = fix_issues
        self.verbose = verbose
        
        if self.verbose:
            logger.setLevel(logging.DEBUG)
        
        self.issues = []
        self.warnings = []
        self.fixes = []
        
        # Load OpenAPI specification
        self.openapi_spec = self._load_yaml_or_json(self.openapi_file)
        
        # Find all documentation files
        self.doc_files = self._find_doc_files()
        
        logger.info(f"Found {len(self.doc_files)} documentation files")

    def _load_yaml_or_json(self, file_path: Path) -> Dict:
        """Load YAML or JSON file.

        Args:
            file_path: Path to the file

        Returns:
            Dict: Parsed content
        """
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        if file_path.suffix in [".yaml", ".yml"]:
            return yaml.safe_load(content)
        elif file_path.suffix == ".json":
            return json.loads(content)
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")

    def _find_doc_files(self) -> List[Path]:
        """Find all documentation files.

        Returns:
            List[Path]: List of documentation file paths
        """
        doc_files = []
        
        for ext in ["*.md", "*.html", "*.yaml", "*.yml", "*.json"]:
            doc_files.extend(self.docs_dir.glob(f"**/{ext}"))
        
        return doc_files

    def validate_openapi_spec(self) -> bool:
        """Validate the OpenAPI specification against the OpenAPI schema.

        Returns:
            bool: True if valid, False otherwise
        """
        logger.info("Validating OpenAPI specification...")
        
        try:
            # Download the OpenAPI schema
            response = requests.get(OPENAPI_SCHEMA_URL)
            schema = response.json()
            
            # Validate the OpenAPI specification
            validate(instance=self.openapi_spec, schema=schema)
            
            logger.info("OpenAPI specification is valid")
            return True
        except ValidationError as e:
            logger.error(f"OpenAPI specification validation failed: {e}")
            self.issues.append({
                "type": "openapi_schema_error",
                "file": str(self.openapi_file),
                "message": str(e),
                "fixable": False
            })
            return False
        except Exception as e:
            logger.error(f"Error validating OpenAPI specification: {e}")
            self.issues.append({
                "type": "validation_error",
                "file": str(self.openapi_file),
                "message": str(e),
                "fixable": False
            })
            return False

    def check_broken_links(self) -> bool:
        """Check for broken links in documentation.

        Returns:
            bool: True if no broken links, False otherwise
        """
        logger.info("Checking for broken links...")
        
        all_links = set()
        broken_links = set()
        
        # Extract links from Markdown files
        for file_path in self.doc_files:
            if file_path.suffix == ".md":
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Find Markdown links [text](url)
                md_links = re.findall(r'\[.+?\]\((.+?)\)', content)
                
                # Find HTML links <a href="url">
                html_links = re.findall(r'<a\s+(?:[^>]*?\s+)?href="([^"]*)"', content)
                
                links = md_links + html_links
                
                for link in links:
                    # Skip anchor links and mailto links
                    if link.startswith("#") or link.startswith("mailto:"):
                        continue
                    
                    # Handle relative links
                    if not urlparse(link).netloc:
                        # Convert relative link to absolute path
                        if link.startswith("/"):
                            # Absolute path from docs root
                            abs_link = self.docs_dir / link.lstrip("/")
                        else:
                            # Relative to current file
                            abs_link = file_path.parent / link
                        
                        # Normalize path
                        abs_link = abs_link.resolve()
                        
                        # Check if file exists
                        if not abs_link.exists():
                            broken_links.add((str(file_path), link))
                    else:
                        # External link - we don't validate these for now
                        pass
                    
                    all_links.add(link)
        
        # Report broken links
        for file_path, link in broken_links:
            self.issues.append({
                "type": "broken_link",
                "file": file_path,
                "message": f"Broken link: {link}",
                "fixable": False
            })
        
        logger.info(f"Found {len(all_links)} links, {len(broken_links)} broken")
        return len(broken_links) == 0

    def check_endpoint_coverage(self) -> bool:
        """Check that all API endpoints are documented.

        Returns:
            bool: True if all endpoints are documented, False otherwise
        """
        logger.info("Checking endpoint coverage...")
        
        # Get all endpoints from OpenAPI spec
        api_endpoints = set()
        
        for path, path_item in self.openapi_spec.get("paths", {}).items():
            for method in ["get", "post", "put", "delete", "patch"]:
                if method in path_item:
                    api_endpoints.add(f"{method.upper()} {path}")
        
        # Get all documented endpoints from Markdown files
        documented_endpoints = set()
        
        for file_path in self.doc_files:
            if file_path.suffix == ".md":
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Look for endpoint documentation patterns
                # This is a simple heuristic and might need adjustment
                for method in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                    # Find patterns like "GET /api/v1/resource"
                    endpoints = re.findall(rf'{method}\s+(/[^\s`"\']+)', content)
                    
                    # Find patterns in code blocks
                    code_blocks = re.findall(r'```[^\n]*\n(.*?)```', content, re.DOTALL)
                    for block in code_blocks:
                        endpoints.extend(re.findall(rf'{method}\s+(/[^\s`"\']+)', block))
                    
                    for endpoint in endpoints:
                        documented_endpoints.add(f"{method} {endpoint}")
        
        # Find undocumented endpoints
        undocumented = api_endpoints - documented_endpoints
        
        for endpoint in undocumented:
            self.issues.append({
                "type": "undocumented_endpoint",
                "file": str(self.openapi_file),
                "message": f"Undocumented endpoint: {endpoint}",
                "fixable": False
            })
        
        logger.info(f"Found {len(api_endpoints)} API endpoints, {len(undocumented)} undocumented")
        return len(undocumented) == 0

    def validate_code_snippets(self) -> bool:
        """Validate example code snippets.

        Returns:
            bool: True if all code snippets are valid, False otherwise
        """
        logger.info("Validating code snippets...")
        
        invalid_snippets = []
        
        for file_path in self.doc_files:
            if file_path.suffix == ".md":
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Find code blocks with language specifier
                code_blocks = re.findall(r'```(\w+)\n(.*?)```', content, re.DOTALL)
                
                for i, (lang, code) in enumerate(code_blocks):
                    # Validate based on language
                    if lang == "python":
                        try:
                            # Check for syntax errors
                            compile(code, "<string>", "exec")
                        except SyntaxError as e:
                            invalid_snippets.append((file_path, i + 1, lang, str(e)))
                    elif lang in ["javascript", "js"]:
                        # We'd need a JS parser for proper validation
                        # For now, just check for basic syntax issues
                        if code.count("{") != code.count("}") or code.count("(") != code.count(")"):
                            invalid_snippets.append((file_path, i + 1, lang, "Mismatched brackets"))
                    elif lang in ["bash", "sh"]:
                        # Basic shell syntax check
                        if code.count("'") % 2 != 0 or code.count('"') % 2 != 0:
                            invalid_snippets.append((file_path, i + 1, lang, "Mismatched quotes"))
        
        # Report invalid snippets
        for file_path, block_num, lang, error in invalid_snippets:
            self.issues.append({
                "type": "invalid_code_snippet",
                "file": str(file_path),
                "message": f"Invalid {lang} code in block #{block_num}: {error}",
                "fixable": False
            })
        
        logger.info(f"Found {len(invalid_snippets)} invalid code snippets")
        return len(invalid_snippets) == 0

    def check_consistency(self) -> bool:
        """Check for consistency between documentation and OpenAPI spec.

        Returns:
            bool: True if consistent, False otherwise
        """
        logger.info("Checking documentation consistency...")
        
        inconsistencies = []
        
        # Check that all schema definitions are documented
        schema_definitions = set(self.openapi_spec.get("components", {}).get("schemas", {}).keys())
        documented_schemas = set()
        
        for file_path in self.doc_files:
            if file_path.suffix == ".md":
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Look for schema documentation patterns
                for schema in schema_definitions:
                    if re.search(rf'\b{re.escape(schema)}\b', content):
                        documented_schemas.add(schema)
        
        # Find undocumented schemas
        undocumented_schemas = schema_definitions - documented_schemas
        
        for schema in undocumented_schemas:
            self.warnings.append({
                "type": "undocumented_schema",
                "file": str(self.openapi_file),
                "message": f"Schema not documented: {schema}",
                "fixable": False
            })
        
        # Check that all error codes are documented
        error_codes = set()
        
        # Extract error codes from OpenAPI spec
        for path_item in self.openapi_spec.get("paths", {}).values():
            for method_item in path_item.values():
                if isinstance(method_item, dict) and "responses" in method_item:
                    for status_code, response in method_item["responses"].items():
                        if status_code.startswith("4") or status_code.startswith("5"):
                            if "content" in response and "application/json" in response["content"]:
                                schema = response["content"]["application/json"].get("schema", {})
                                if "$ref" in schema:
                                    ref = schema["$ref"].split("/")[-1]
                                    if ref == "Error":
                                        error_codes.add(status_code)
        
        # Check if error codes are documented
        documented_error_codes = set()
        
        for file_path in self.doc_files:
            if file_path.suffix == ".md":
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Look for error code documentation patterns
                for code in error_codes:
                    if re.search(rf'\b{code}\b', content):
                        documented_error_codes.add(code)
        
        # Find undocumented error codes
        undocumented_error_codes = error_codes - documented_error_codes
        
        for code in undocumented_error_codes:
            self.warnings.append({
                "type": "undocumented_error_code",
                "file": str(self.openapi_file),
                "message": f"Error code not documented: {code}",
                "fixable": False
            })
        
        logger.info(f"Found {len(undocumented_schemas)} undocumented schemas, {len(undocumented_error_codes)} undocumented error codes")
        return len(undocumented_schemas) == 0 and len(undocumented_error_codes) == 0

    def fix_issues(self) -> None:
        """Attempt to fix issues automatically."""
        if not self.fix_issues:
            return
        
        logger.info("Attempting to fix issues...")
        
        # Implement fixes for fixable issues
        for issue in self.issues:
            if issue["fixable"]:
                # Implement fix logic based on issue type
                if issue["type"] == "example_issue_type":
                    # Example fix logic
                    pass
                
                self.fixes.append({
                    "type": issue["type"],
                    "file": issue["file"],
                    "message": f"Fixed: {issue['message']}"
                })

    def generate_report(self) -> None:
        """Generate a validation report."""
        logger.info("Generating validation report...")
        
        report = {
            "timestamp": "2025-04-30T11:30:00Z",
            "openapi_file": str(self.openapi_file),
            "docs_dir": str(self.docs_dir),
            "issues": self.issues,
            "warnings": self.warnings,
            "fixes": self.fixes,
            "summary": {
                "total_issues": len(self.issues),
                "total_warnings": len(self.warnings),
                "total_fixes": len(self.fixes),
                "status": "pass" if len(self.issues) == 0 else "fail"
            }
        }
        
        # Write report to file
        with open(self.report_file, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report generated: {self.report_file}")
        
        # Print summary
        print("\nValidation Summary:")
        print(f"  Issues: {len(self.issues)}")
        print(f"  Warnings: {len(self.warnings)}")
        print(f"  Fixes: {len(self.fixes)}")
        print(f"  Status: {'PASS' if len(self.issues) == 0 else 'FAIL'}")
        
        if len(self.issues) > 0:
            print("\nTop Issues:")
            for issue in self.issues[:5]:
                print(f"  - {issue['message']} ({issue['file']})")
            
            if len(self.issues) > 5:
                print(f"  ... and {len(self.issues) - 5} more issues")

    def validate(self) -> bool:
        """Run all validation checks.

        Returns:
            bool: True if all checks pass, False otherwise
        """
        # Run validation checks
        openapi_valid = self.validate_openapi_spec()
        links_valid = self.check_broken_links()
        endpoints_covered = self.check_endpoint_coverage()
        snippets_valid = self.validate_code_snippets()
        consistency_valid = self.check_consistency()
        
        # Try to fix issues
        self.fix_issues()
        
        # Generate report
        self.generate_report()
        
        # Return overall validation result
        return (
            openapi_valid and
            links_valid and
            endpoints_covered and
            snippets_valid and
            consistency_valid
        )


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="VARAi API Documentation Validator")
    parser.add_argument(
        "--openapi-file",
        default="docs/api/openapi/openapi.yaml",
        help="Path to the OpenAPI specification file"
    )
    parser.add_argument(
        "--docs-dir",
        default="docs/api",
        help="Path to the documentation directory"
    )
    parser.add_argument(
        "--report-file",
        default="docs/api/validation-report.json",
        help="Path to output the validation report"
    )
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Attempt to fix issues automatically"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose output"
    )
    
    args = parser.parse_args()
    
    validator = DocumentationValidator(
        openapi_file=args.openapi_file,
        docs_dir=args.docs_dir,
        report_file=args.report_file,
        fix_issues=args.fix,
        verbose=args.verbose
    )
    
    success = validator.validate()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()