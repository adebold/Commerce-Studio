#!/usr/bin/env python3
"""
Unit tests for the DAST integration test script.

This script tests the functionality of the DAST integration test script
to ensure it correctly identifies and reports security issues.
"""

import json
import unittest
from unittest.mock import MagicMock, patch

import requests

# Import the module to test
from test_dast_integration import DastIntegrationTest


class TestDastIntegrationTest(unittest.TestCase):
    """Test cases for the DastIntegrationTest class."""

    def setUp(self):
        """Set up test fixtures."""
        self.base_url = "https://test.example.com"
        self.test_instance = DastIntegrationTest(self.base_url)
        
        # Create a mock session
        self.mock_session = MagicMock()
        self.test_instance.session = self.mock_session

    def test_initialization(self):
        """Test that the class initializes correctly."""
        self.assertEqual(self.test_instance.base_url, self.base_url)
        self.assertEqual(self.test_instance.results["tests_run"], 0)
        self.assertEqual(self.test_instance.results["tests_passed"], 0)
        self.assertEqual(self.test_instance.results["tests_failed"], 0)
        self.assertEqual(self.test_instance.results["details"], [])

    @patch("requests.Session.get")
    def test_basic_connectivity_success(self, mock_get):
        """Test the basic connectivity test with a successful response."""
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        # Run the test
        result = self.test_instance.test_basic_connectivity()
        
        # Verify the results
        self.assertEqual(result["name"], "basic_connectivity")
        self.assertEqual(result["status"], "passed")
        self.assertEqual(result["response_code"], 200)
        
        # Verify the mock was called correctly
        mock_get.assert_called_once_with(self.base_url, timeout=10)

    @patch("requests.Session.get")
    def test_basic_connectivity_failure(self, mock_get):
        """Test the basic connectivity test with a failed response."""
        # Configure the mock to raise an exception
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")
        
        # Run the test
        result = self.test_instance.test_basic_connectivity()
        
        # Verify the results
        self.assertEqual(result["name"], "basic_connectivity")
        self.assertEqual(result["status"], "failed")
        self.assertIn("Connection refused", result["message"])
        
        # Verify the mock was called correctly
        mock_get.assert_called_once_with(self.base_url, timeout=10)

    @patch("requests.Session.get")
    def test_api_health_success(self, mock_get):
        """Test the API health check with a successful response."""
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        # Run the test
        result = self.test_instance.test_api_health()
        
        # Verify the results
        self.assertEqual(result["name"], "api_health")
        self.assertEqual(result["status"], "passed")
        self.assertEqual(result["response_code"], 200)
        
        # Verify the mock was called correctly
        mock_get.assert_called_once_with(f"{self.base_url}/api/health", timeout=10)

    @patch("requests.Session.get")
    def test_auth_health_success(self, mock_get):
        """Test the Auth health check with a successful response."""
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        # Run the test
        result = self.test_instance.test_auth_health()
        
        # Verify the results
        self.assertEqual(result["name"], "auth_health")
        self.assertEqual(result["status"], "passed")
        self.assertEqual(result["response_code"], 200)
        
        # Verify the mock was called correctly
        mock_get.assert_called_once_with(f"{self.base_url}/auth/health", timeout=10)

    @patch("requests.Session.get")
    def test_security_headers_all_present(self, mock_get):
        """Test the security headers check with all headers present."""
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Content-Security-Policy": "default-src 'self'",
        }
        mock_get.return_value = mock_response
        
        # Run the test
        result = self.test_instance.test_security_headers()
        
        # Verify the results
        self.assertEqual(result["name"], "security_headers")
        self.assertEqual(result["status"], "passed")
        self.assertIn("All required security headers present", result["message"])
        
        # Verify the mock was called correctly
        mock_get.assert_called_once_with(self.base_url, timeout=10)

    @patch("requests.Session.get")
    def test_security_headers_missing(self, mock_get):
        """Test the security headers check with missing headers."""
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {
            "X-Content-Type-Options": "nosniff",
            # Missing other security headers
        }
        mock_get.return_value = mock_response
        
        # Run the test
        result = self.test_instance.test_security_headers()
        
        # Verify the results
        self.assertEqual(result["name"], "security_headers")
        self.assertEqual(result["status"], "failed")
        self.assertIn("Missing security headers", result["message"])
        self.assertIn("HSTS header missing", result["details"])
        self.assertIn("X-Frame-Options header missing", result["details"])
        self.assertIn("CSP header missing", result["details"])
        
        # Verify the mock was called correctly
        mock_get.assert_called_once_with(self.base_url, timeout=10)

    @patch("requests.Session.get")
    def test_reflected_xss_detection(self, mock_get):
        """Test the reflected XSS detection test."""
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        # Run the test
        result = self.test_instance.test_reflected_xss_detection()
        
        # Verify the results
        self.assertEqual(result["name"], "reflected_xss_detection")
        self.assertEqual(result["status"], "passed")
        self.assertIn("Created test URL for DAST XSS detection", result["message"])
        self.assertIn("<script>alert('XSS')</script>", result["test_url"])
        
        # Verify the mock was called correctly
        self.assertTrue(mock_get.called)
        call_args = mock_get.call_args[0][0]
        self.assertIn("/search?q=<script>alert('XSS')</script>", call_args)

    @patch("requests.Session.get")
    def test_sql_injection_detection(self, mock_get):
        """Test the SQL injection detection test."""
        # Configure the mock
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        # Run the test
        result = self.test_instance.test_sql_injection_detection()
        
        # Verify the results
        self.assertEqual(result["name"], "sql_injection_detection")
        self.assertEqual(result["status"], "passed")
        self.assertIn("Created test URL for DAST SQL injection detection", result["message"])
        self.assertIn("1' OR '1'='1", result["test_url"])
        
        # Verify the mock was called correctly
        self.assertTrue(mock_get.called)
        call_args = mock_get.call_args[0][0]
        self.assertIn("/api/products?id=1' OR '1'='1", call_args)

    @patch.object(DastIntegrationTest, "test_basic_connectivity")
    @patch.object(DastIntegrationTest, "test_api_health")
    @patch.object(DastIntegrationTest, "test_auth_health")
    @patch.object(DastIntegrationTest, "test_security_headers")
    @patch.object(DastIntegrationTest, "test_reflected_xss_detection")
    @patch.object(DastIntegrationTest, "test_sql_injection_detection")
    def test_run_tests_all_pass(self, mock_sqli, mock_xss, mock_headers, 
                               mock_auth, mock_api, mock_basic):
        """Test the run_tests method with all tests passing."""
        # Configure the mocks
        mock_basic.return_value = {"name": "basic_connectivity", "status": "passed", "message": "Success"}
        mock_api.return_value = {"name": "api_health", "status": "passed", "message": "Success"}
        mock_auth.return_value = {"name": "auth_health", "status": "passed", "message": "Success"}
        mock_headers.return_value = {"name": "security_headers", "status": "passed", "message": "Success"}
        mock_xss.return_value = {"name": "reflected_xss_detection", "status": "passed", "message": "Success"}
        mock_sqli.return_value = {"name": "sql_injection_detection", "status": "passed", "message": "Success"}
        
        # Run the tests
        results = self.test_instance.run_tests()
        
        # Verify the results
        self.assertEqual(results["tests_run"], 6)
        self.assertEqual(results["tests_passed"], 6)
        self.assertEqual(results["tests_failed"], 0)
        self.assertEqual(len(results["details"]), 6)

    @patch.object(DastIntegrationTest, "test_basic_connectivity")
    @patch.object(DastIntegrationTest, "test_api_health")
    @patch.object(DastIntegrationTest, "test_auth_health")
    @patch.object(DastIntegrationTest, "test_security_headers")
    @patch.object(DastIntegrationTest, "test_reflected_xss_detection")
    @patch.object(DastIntegrationTest, "test_sql_injection_detection")
    def test_run_tests_some_fail(self, mock_sqli, mock_xss, mock_headers, 
                                mock_auth, mock_api, mock_basic):
        """Test the run_tests method with some tests failing."""
        # Configure the mocks
        mock_basic.return_value = {"name": "basic_connectivity", "status": "passed", "message": "Success"}
        mock_api.return_value = {"name": "api_health", "status": "failed", "message": "Failed"}
        mock_auth.return_value = {"name": "auth_health", "status": "passed", "message": "Success"}
        mock_headers.return_value = {"name": "security_headers", "status": "failed", "message": "Failed"}
        mock_xss.return_value = {"name": "reflected_xss_detection", "status": "passed", "message": "Success"}
        mock_sqli.return_value = {"name": "sql_injection_detection", "status": "passed", "message": "Success"}
        
        # Run the tests
        results = self.test_instance.run_tests()
        
        # Verify the results
        self.assertEqual(results["tests_run"], 6)
        self.assertEqual(results["tests_passed"], 4)
        self.assertEqual(results["tests_failed"], 2)
        self.assertEqual(len(results["details"]), 6)


if __name__ == "__main__":
    unittest.main()