#!/usr/bin/env python3
"""
Cloud Run Regulatory Compliance Test Suite

This script tests the regulatory compliance aspects of the Cloud Run deployment,
including GDPR compliance, healthcare data handling, and data residency requirements.
"""

import argparse
import json
import os
import requests
import sys
import time
from typing import Dict, List, Optional, Tuple

# Default configuration
DEFAULT_CONFIG = {
    "regions": ["us", "eu"],
    "services": ["api", "auth", "frontend", "recommendation", "virtual-try-on", "analytics"],
    "domain": "dev.eyewearml.com",
    "timeout": 30,
    "retries": 3
}

class ComplianceTest:
    """Base class for compliance tests"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.results = {
            "passed": [],
            "failed": [],
            "skipped": []
        }
    
    def run_all_tests(self) -> Dict:
        """Run all test methods in the class"""
        test_methods = [method for method in dir(self) if method.startswith('test_') and callable(getattr(self, method))]
        
        for method in test_methods:
            test_func = getattr(self, method)
            test_name = method[5:].replace('_', ' ').title()
            print(f"Running test: {test_name}...")
            
            try:
                result = test_func()
                if result:
                    self.results["passed"].append(test_name)
                    print(f"✅ {test_name}: PASSED")
                else:
                    self.results["failed"].append(test_name)
                    print(f"❌ {test_name}: FAILED")
            except Exception as e:
                self.results["failed"].append(f"{test_name} (Error: {str(e)})")
                print(f"❌ {test_name}: ERROR - {str(e)}")
        
        return self.results
    
    def get_service_url(self, service: str, region: str) -> str:
        """Get the URL for a service in a specific region"""
        # For ml-datadriven-recos service, use the actual Cloud Run URLs
        if service == "ml-datadriven-recos":
            if region == "us":
                return "https://ml-datadriven-recos-us-ddtojwjn7a-uc.a.run.app"
            elif region == "eu":
                return "https://ml-datadriven-recos-eu-ddtojwjn7a-ew.a.run.app"
        # For other services, use the default URL format
        return f"https://{region}-{service}.{self.config['domain']}"


class GDPRComplianceTest(ComplianceTest):
    """Tests for GDPR compliance"""
    
    def test_eu_region_availability(self) -> bool:
        """Test that services are available in the EU region"""
        if "eu" not in self.config["regions"]:
            print("Skipping EU region test as it's not in the configuration")
            self.results["skipped"].append("EU Region Availability")
            return True
        
        all_available = True
        for service in self.config["services"]:
            url = self.get_service_url(service, "eu")
            try:
                # For ml-datadriven-recos service, check the root path
                if service == "ml-datadriven-recos":
                    response = requests.get(url, timeout=self.config["timeout"])
                else:
                    response = requests.get(f"{url}/health", timeout=self.config["timeout"])
                if response.status_code != 200:
                    print(f"  Service {service} not available in EU region: {response.status_code}")
                    all_available = False
            except requests.RequestException as e:
                print(f"  Error connecting to {service} in EU region: {str(e)}")
                all_available = False
        
        return all_available
    
    def test_data_subject_rights_endpoints(self) -> bool:
        """Test that data subject rights endpoints are available"""
        required_endpoints = [
            "/api/user/data/export",
            "/api/user/data/delete"
        ]
        
        all_available = True
        for region in self.config["regions"]:
            url = self.get_service_url("api", region)
            for endpoint in required_endpoints:
                try:
                    # Just check OPTIONS to avoid actually triggering data operations
                    response = requests.options(f"{url}{endpoint}", timeout=self.config["timeout"])
                    if response.status_code >= 400:
                        print(f"  Endpoint {endpoint} not available in {region} region: {response.status_code}")
                        all_available = False
                except requests.RequestException as e:
                    print(f"  Error connecting to {endpoint} in {region} region: {str(e)}")
                    all_available = False
        
        return all_available
    
    def test_privacy_policy_availability(self) -> bool:
        """Test that privacy policy is available"""
        all_available = True
        for region in self.config["regions"]:
            url = self.get_service_url("frontend", region)
            try:
                response = requests.get(f"{url}/privacy-policy", timeout=self.config["timeout"])
                if response.status_code != 200:
                    print(f"  Privacy policy not available in {region} region: {response.status_code}")
                    all_available = False
            except requests.RequestException as e:
                print(f"  Error connecting to privacy policy in {region} region: {str(e)}")
                all_available = False
        
        return all_available
    
    def test_cookie_consent_mechanism(self) -> bool:
        """Test that cookie consent mechanism is in place"""
        all_available = True
        for region in self.config["regions"]:
            url = self.get_service_url("frontend", region)
            try:
                response = requests.get(url, timeout=self.config["timeout"])
                if "cookie-consent" not in response.text.lower():
                    print(f"  Cookie consent mechanism not found in {region} region")
                    all_available = False
            except requests.RequestException as e:
                print(f"  Error connecting to frontend in {region} region: {str(e)}")
                all_available = False
        
        return all_available


class HealthcareDataTest(ComplianceTest):
    """Tests for healthcare data compliance"""
    
    def test_encryption_headers(self) -> bool:
        """Test that proper encryption headers are in place"""
        required_headers = [
            "Strict-Transport-Security",
            "X-Content-Type-Options",
            "X-XSS-Protection"
        ]
        
        all_headers_present = True
        for region in self.config["regions"]:
            for service in self.config["services"]:
                url = self.get_service_url(service, region)
                try:
                    # For ml-datadriven-recos service, check the root path
                    if service == "ml-datadriven-recos":
                        response = requests.get(url, timeout=self.config["timeout"])
                    else:
                        response = requests.get(f"{url}/health", timeout=self.config["timeout"])
                    for header in required_headers:
                        if header not in response.headers:
                            print(f"  Header {header} missing from {service} in {region} region")
                            all_headers_present = False
                except requests.RequestException as e:
                    print(f"  Error connecting to {service} in {region} region: {str(e)}")
                    all_headers_present = False
        
        return all_headers_present
    
    def test_prescription_data_endpoints_security(self) -> bool:
        """Test that prescription data endpoints have proper security"""
        prescription_endpoints = [
            "/api/prescriptions",
            "/api/user/prescriptions"
        ]
        
        all_secure = True
        for region in self.config["regions"]:
            url = self.get_service_url("api", region)
            for endpoint in prescription_endpoints:
                try:
                    # Try accessing without authentication
                    response = requests.get(f"{url}{endpoint}", timeout=self.config["timeout"])
                    if response.status_code != 401 and response.status_code != 403:
                        print(f"  Endpoint {endpoint} in {region} region not properly secured: {response.status_code}")
                        all_secure = False
                except requests.RequestException as e:
                    print(f"  Error connecting to {endpoint} in {region} region: {str(e)}")
                    all_secure = False
        
        return all_secure
    
    def test_biometric_data_consent(self) -> bool:
        """Test that biometric data collection requires explicit consent"""
        biometric_endpoints = [
            "/api/face-analysis",
            "/api/virtual-try-on"
        ]
        
        all_require_consent = True
        for region in self.config["regions"]:
            url = self.get_service_url("api", region)
            for endpoint in biometric_endpoints:
                try:
                    # Try accessing with authentication but without consent header
                    headers = {"Authorization": "Bearer test_token"}
                    response = requests.post(f"{url}{endpoint}", headers=headers, timeout=self.config["timeout"])
                    
                    # Should require consent header
                    if response.status_code != 400 and "consent" not in response.text.lower():
                        print(f"  Endpoint {endpoint} in {region} region doesn't require consent: {response.status_code}")
                        all_require_consent = False
                except requests.RequestException as e:
                    print(f"  Error connecting to {endpoint} in {region} region: {str(e)}")
                    all_require_consent = False
        
        return all_require_consent


class DataResidencyTest(ComplianceTest):
    """Tests for data residency requirements"""
    
    def test_region_specific_data_storage(self) -> bool:
        """Test that data is stored in the appropriate region"""
        # This is a simplified test that checks if the region header is respected
        test_data = {"test_key": "test_value"}
        
        all_regions_respected = True
        for region in self.config["regions"]:
            url = self.get_service_url("api", region)
            try:
                # Try storing data with region header
                headers = {"X-Data-Region": region}
                response = requests.post(
                    f"{url}/api/test-data-residency", 
                    headers=headers,
                    json=test_data,
                    timeout=self.config["timeout"]
                )
                
                if response.status_code != 200 or "stored_in_region" not in response.json() or response.json()["stored_in_region"] != region:
                    print(f"  Data residency not respected in {region} region")
                    all_regions_respected = False
            except requests.RequestException as e:
                print(f"  Error testing data residency in {region} region: {str(e)}")
                all_regions_respected = False
        
        return all_regions_respected
    
    def test_cross_region_data_transfer_controls(self) -> bool:
        """Test that cross-region data transfer controls are in place"""
        # This test checks if the API prevents cross-region data access
        
        all_controls_in_place = True
        for source_region in self.config["regions"]:
            for target_region in self.config["regions"]:
                if source_region == target_region:
                    continue
                
                url = self.get_service_url("api", source_region)
                try:
                    # Try accessing data from another region
                    headers = {"X-Target-Region": target_region}
                    response = requests.get(
                        f"{url}/api/test-cross-region-access", 
                        headers=headers,
                        timeout=self.config["timeout"]
                    )
                    
                    # Should be blocked or require special permission
                    if response.status_code != 403:
                        print(f"  Cross-region access from {source_region} to {target_region} not properly controlled: {response.status_code}")
                        all_controls_in_place = False
                except requests.RequestException as e:
                    print(f"  Error testing cross-region access from {source_region} to {target_region}: {str(e)}")
                    all_controls_in_place = False
        
        return all_controls_in_place


class AuditLoggingTest(ComplianceTest):
    """Tests for audit logging"""
    
    def test_audit_logging_endpoints(self) -> bool:
        """Test that audit logging endpoints are available"""
        audit_endpoints = [
            "/api/admin/audit-logs",
            "/api/admin/compliance-reports"
        ]
        
        all_available = True
        for region in self.config["regions"]:
            url = self.get_service_url("api", region)
            for endpoint in audit_endpoints:
                try:
                    # Just check OPTIONS to avoid actually triggering operations
                    response = requests.options(f"{url}{endpoint}", timeout=self.config["timeout"])
                    if response.status_code >= 400:
                        print(f"  Audit endpoint {endpoint} not available in {region} region: {response.status_code}")
                        all_available = False
                except requests.RequestException as e:
                    print(f"  Error connecting to {endpoint} in {region} region: {str(e)}")
                    all_available = False
        
        return all_available
    
    def test_data_access_logging(self) -> bool:
        """Test that data access is properly logged"""
        # This test requires admin access to verify logs
        # For simplicity, we'll just check if the logging endpoint works
        
        all_logging_working = True
        for region in self.config["regions"]:
            url = self.get_service_url("api", region)
            try:
                # Make a test request that should be logged
                test_response = requests.get(f"{url}/api/test-data-access-logging", timeout=self.config["timeout"])
                
                # Then check if it was logged (requires admin credentials)
                admin_headers = {"Authorization": "Bearer admin_test_token"}
                log_response = requests.get(
                    f"{url}/api/admin/audit-logs?action=test-data-access-logging", 
                    headers=admin_headers,
                    timeout=self.config["timeout"]
                )
                
                if log_response.status_code != 200 or len(log_response.json()) == 0:
                    print(f"  Data access logging not working in {region} region")
                    all_logging_working = False
            except requests.RequestException as e:
                print(f"  Error testing data access logging in {region} region: {str(e)}")
                all_logging_working = False
        
        return all_logging_working


def main():
    """Main function to run the compliance tests"""
    parser = argparse.ArgumentParser(description="Test Cloud Run deployment for regulatory compliance")
    parser.add_argument("--config", type=str, help="Path to configuration file")
    parser.add_argument("--regions", type=str, help="Comma-separated list of regions to test")
    parser.add_argument("--services", type=str, help="Comma-separated list of services to test")
    parser.add_argument("--domain", type=str, help="Domain name for the services")
    parser.add_argument("--timeout", type=int, help="Request timeout in seconds")
    parser.add_argument("--output", type=str, help="Output file for test results")
    args = parser.parse_args()
    
    # Load configuration
    config = DEFAULT_CONFIG.copy()
    if args.config:
        try:
            with open(args.config, 'r') as f:
                config.update(json.load(f))
        except Exception as e:
            print(f"Error loading configuration file: {str(e)}")
            sys.exit(1)
    
    # Override with command-line arguments
    if args.regions:
        config["regions"] = args.regions.split(",")
    if args.services:
        config["services"] = args.services.split(",")
    if args.domain:
        config["domain"] = args.domain
    if args.timeout:
        config["timeout"] = args.timeout
    
    # Run tests
    print(f"Running compliance tests with configuration:")
    print(f"  Regions: {', '.join(config['regions'])}")
    print(f"  Services: {', '.join(config['services'])}")
    print(f"  Domain: {config['domain']}")
    print(f"  Timeout: {config['timeout']} seconds")
    print()
    
    test_suites = [
        ("GDPR Compliance", GDPRComplianceTest(config)),
        ("Healthcare Data", HealthcareDataTest(config)),
        ("Data Residency", DataResidencyTest(config)),
        ("Audit Logging", AuditLoggingTest(config))
    ]
    
    all_results = {}
    for name, suite in test_suites:
        print(f"\n=== Running {name} Tests ===\n")
        results = suite.run_all_tests()
        all_results[name] = results
    
    # Print summary
    print("\n=== Test Summary ===\n")
    total_passed = sum(len(results["passed"]) for results in all_results.values())
    total_failed = sum(len(results["failed"]) for results in all_results.values())
    total_skipped = sum(len(results["skipped"]) for results in all_results.values())
    total_tests = total_passed + total_failed + total_skipped
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {total_passed} ({total_passed/total_tests*100:.1f}%)")
    print(f"Failed: {total_failed} ({total_failed/total_tests*100:.1f}%)")
    print(f"Skipped: {total_skipped} ({total_skipped/total_tests*100:.1f}%)")
    
    # Save results to file if requested
    if args.output:
        try:
            with open(args.output, 'w') as f:
                json.dump({
                    "config": config,
                    "results": all_results,
                    "summary": {
                        "total": total_tests,
                        "passed": total_passed,
                        "failed": total_failed,
                        "skipped": total_skipped
                    }
                }, f, indent=2)
            print(f"\nResults saved to {args.output}")
        except Exception as e:
            print(f"\nError saving results to file: {str(e)}")
    
    # Exit with appropriate status code
    sys.exit(1 if total_failed > 0 else 0)


if __name__ == "__main__":
    main()