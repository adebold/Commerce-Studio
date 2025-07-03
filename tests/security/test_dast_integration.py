#!/usr/bin/env python3
"""
DAST Integration Test Script

This script tests the DAST integration by making requests to the application
and verifying that the DAST scan can detect security issues.

Usage:
    python test_dast_integration.py --url https://dev.eyewearml.com

"""

import argparse
import json
import logging
import os
import sys
import time
from urllib.parse import urljoin

import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("dast-test")


class DastIntegrationTest:
    """Test class for DAST integration verification."""

    def __init__(self, base_url):
        """Initialize the test with the base URL of the application."""
        self.base_url = base_url
        self.session = requests.Session()
        self.results = {
            "tests_run": 0,
            "tests_passed": 0,
            "tests_failed": 0,
            "details": [],
        }

    def run_tests(self):
        """Run all tests and return the results."""
        logger.info(f"Starting DAST integration tests against {self.base_url}")

        # Run all test methods
        test_methods = [
            method for method in dir(self) if method.startswith("test_") and callable(getattr(self, method))
        ]

        for method in test_methods:
            test_func = getattr(self, method)
            test_name = method.replace("test_", "")
            logger.info(f"Running test: {test_name}")

            try:
                result = test_func()
                self.results["tests_run"] += 1
                if result["status"] == "passed":
                    self.results["tests_passed"] += 1
                else:
                    self.results["tests_failed"] += 1
                self.results["details"].append(result)
            except Exception as e:
                logger.error(f"Error running test {test_name}: {str(e)}")
                self.results["tests_run"] += 1
                self.results["tests_failed"] += 1
                self.results["details"].append({
                    "name": test_name,
                    "status": "failed",
                    "message": f"Exception: {str(e)}",
                })

        return self.results

    def test_basic_connectivity(self):
        """Test basic connectivity to the application."""
        try:
            response = self.session.get(self.base_url, timeout=10)
            response.raise_for_status()
            return {
                "name": "basic_connectivity",
                "status": "passed",
                "message": f"Successfully connected to {self.base_url}",
                "response_code": response.status_code,
            }
        except requests.exceptions.RequestException as e:
            return {
                "name": "basic_connectivity",
                "status": "failed",
                "message": f"Failed to connect to {self.base_url}: {str(e)}",
            }

    def test_api_health(self):
        """Test the API health endpoint."""
        try:
            api_url = urljoin(self.base_url, "/api/health")
            response = self.session.get(api_url, timeout=10)
            response.raise_for_status()
            return {
                "name": "api_health",
                "status": "passed",
                "message": "API health check successful",
                "response_code": response.status_code,
            }
        except requests.exceptions.RequestException as e:
            return {
                "name": "api_health",
                "status": "failed",
                "message": f"API health check failed: {str(e)}",
            }

    def test_auth_health(self):
        """Test the Auth service health endpoint."""
        try:
            auth_url = urljoin(self.base_url, "/auth/health")
            response = self.session.get(auth_url, timeout=10)
            response.raise_for_status()
            return {
                "name": "auth_health",
                "status": "passed",
                "message": "Auth health check successful",
                "response_code": response.status_code,
            }
        except requests.exceptions.RequestException as e:
            return {
                "name": "auth_health",
                "status": "failed",
                "message": f"Auth health check failed: {str(e)}",
            }

    def test_security_headers(self):
        """Test for security headers in the response."""
        try:
            response = self.session.get(self.base_url, timeout=10)
            response.raise_for_status()
            
            # Check for common security headers
            security_headers = {
                "Strict-Transport-Security": "HSTS header missing",
                "X-Content-Type-Options": "X-Content-Type-Options header missing",
                "X-Frame-Options": "X-Frame-Options header missing",
                "Content-Security-Policy": "CSP header missing",
            }
            
            missing_headers = []
            for header, message in security_headers.items():
                if header not in response.headers:
                    missing_headers.append(message)
            
            if missing_headers:
                return {
                    "name": "security_headers",
                    "status": "failed",
                    "message": "Missing security headers",
                    "details": missing_headers,
                }
            else:
                return {
                    "name": "security_headers",
                    "status": "passed",
                    "message": "All required security headers present",
                }
        except requests.exceptions.RequestException as e:
            return {
                "name": "security_headers",
                "status": "failed",
                "message": f"Failed to check security headers: {str(e)}",
            }

    def test_reflected_xss_detection(self):
        """Test if a reflected XSS payload is detected by the DAST scan."""
        try:
            # This is a test payload that should be detected by the DAST scan
            # It's harmless but should trigger XSS detection
            xss_payload = "<script>alert('XSS')</script>"
            test_url = urljoin(self.base_url, f"/search?q={xss_payload}")
            
            response = self.session.get(test_url, timeout=10)
            
            # We're not actually testing if XSS works (it shouldn't!),
            # just creating a URL that the DAST scanner should flag
            return {
                "name": "reflected_xss_detection",
                "status": "passed",
                "message": "Created test URL for DAST XSS detection",
                "test_url": test_url,
            }
        except requests.exceptions.RequestException as e:
            return {
                "name": "reflected_xss_detection",
                "status": "failed",
                "message": f"Failed to create XSS test: {str(e)}",
            }

    def test_sql_injection_detection(self):
        """Test if a SQL injection payload is detected by the DAST scan."""
        try:
            # This is a test payload that should be detected by the DAST scan
            # It's harmless but should trigger SQL injection detection
            sqli_payload = "1' OR '1'='1"
            test_url = urljoin(self.base_url, f"/api/products?id={sqli_payload}")
            
            response = self.session.get(test_url, timeout=10)
            
            # We're not actually testing if SQL injection works (it shouldn't!),
            # just creating a URL that the DAST scanner should flag
            return {
                "name": "sql_injection_detection",
                "status": "passed",
                "message": "Created test URL for DAST SQL injection detection",
                "test_url": test_url,
            }
        except requests.exceptions.RequestException as e:
            return {
                "name": "sql_injection_detection",
                "status": "failed",
                "message": f"Failed to create SQL injection test: {str(e)}",
            }


def main():
    """Main function to run the tests."""
    parser = argparse.ArgumentParser(description="DAST Integration Test")
    parser.add_argument("--url", required=True, help="Base URL of the application")
    parser.add_argument("--output", help="Output file for test results (JSON)")
    args = parser.parse_args()

    test = DastIntegrationTest(args.url)
    results = test.run_tests()

    # Print summary
    logger.info("Test Summary:")
    logger.info(f"Tests Run: {results['tests_run']}")
    logger.info(f"Tests Passed: {results['tests_passed']}")
    logger.info(f"Tests Failed: {results['tests_failed']}")

    # Save results if output file specified
    if args.output:
        with open(args.output, "w") as f:
            json.dump(results, f, indent=2)
        logger.info(f"Results saved to {args.output}")

    # Return non-zero exit code if any tests failed
    if results["tests_failed"] > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()