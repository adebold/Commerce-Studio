#!/usr/bin/env python3
"""
Penetration testing script for ML monitoring system.

This script performs automated penetration testing on the ML monitoring system,
simulating attacks to identify security vulnerabilities.
"""

import os
import sys
import json
import time
import logging
import argparse
import requests
import concurrent.futures
from typing import Dict, List, Any, Optional, Tuple
from urllib.parse import urljoin, urlparse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("penetration_test")


class Vulnerability:
    """Class representing a vulnerability."""
    
    def __init__(
        self,
        name: str,
        description: str,
        severity: str,
        evidence: str,
        recommendation: str,
        location: Optional[str] = None,
    ):
        """
        Initialize vulnerability.
        
        Args:
            name: Vulnerability name
            description: Vulnerability description
            severity: Vulnerability severity (critical, high, medium, low, info)
            evidence: Evidence of the vulnerability
            recommendation: Recommended fix
            location: Location where the vulnerability was found
        """
        self.name = name
        self.description = description
        self.severity = severity
        self.evidence = evidence
        self.recommendation = recommendation
        self.location = location
        self.timestamp = time.time()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert vulnerability to dictionary.
        
        Returns:
            Dictionary representation of vulnerability
        """
        return {
            "name": self.name,
            "description": self.description,
            "severity": self.severity,
            "evidence": self.evidence,
            "recommendation": self.recommendation,
            "location": self.location,
            "timestamp": self.timestamp,
        }


class PenetrationTester:
    """Base class for penetration testers."""
    
    def __init__(self, target: str, config: Dict[str, Any]):
        """
        Initialize tester.
        
        Args:
            target: Target URL
            config: Tester configuration
        """
        self.target = target
        self.config = config
        self.vulnerabilities = []
        self.logger = logging.getLogger(f"penetration_test.{self.__class__.__name__}")
    
    def run(self) -> List[Vulnerability]:
        """
        Run penetration tests.
        
        Returns:
            List of vulnerabilities
        """
        self.logger.info(f"Starting penetration test: {self.__class__.__name__}")
        try:
            self._run_tests()
        except Exception as e:
            self.logger.error(f"Error running tests: {str(e)}")
        
        self.logger.info(f"Completed penetration test: {self.__class__.__name__} - {len(self.vulnerabilities)} vulnerabilities")
        return self.vulnerabilities
    
    def _run_tests(self):
        """Run penetration tests (to be implemented by subclasses)."""
        raise NotImplementedError("Subclasses must implement _run_tests()")
    
    def add_vulnerability(
        self,
        name: str,
        description: str,
        severity: str,
        evidence: str,
        recommendation: str,
        location: Optional[str] = None,
    ):
        """
        Add a vulnerability.
        
        Args:
            name: Vulnerability name
            description: Vulnerability description
            severity: Vulnerability severity (critical, high, medium, low, info)
            evidence: Evidence of the vulnerability
            recommendation: Recommended fix
            location: Location where the vulnerability was found
        """
        vulnerability = Vulnerability(
            name=name,
            description=description,
            severity=severity,
            evidence=evidence,
            recommendation=recommendation,
            location=location or self.target,
        )
        
        self.vulnerabilities.append(vulnerability)
        
        # Log the vulnerability
        self.logger.warning(f"[{severity.upper()}] {name}")


class AuthenticationTester(PenetrationTester):
    """Penetration tester for authentication."""
    
    def _run_tests(self):
        """Run authentication tests."""
        self.logger.info("Testing authentication vulnerabilities")
        
        # Define tests
        tests = [
            self._test_weak_passwords,
            self._test_brute_force,
            self._test_token_expiration,
            self._test_token_reuse,
            self._test_token_validation,
        ]
        
        # Run tests in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            for test_func in tests:
                executor.submit(test_func)
    
    def _test_weak_passwords(self):
        """Test for weak password acceptance."""
        self.logger.info("Testing weak passwords")
        
        weak_passwords = [
            "password",
            "123456",
            "12345678",
            "admin",
            "qwerty",
            "welcome",
            "",  # Empty password
        ]
        
        success = False
        evidence = ""
        
        # Try to login with weak passwords
        for password in weak_passwords:
            try:
                login_url = urljoin(self.target, "/auth/token")
                response = requests.post(
                    login_url,
                    data={"username": "admin", "password": password},
                    timeout=5,
                )
                
                if response.status_code == 200:
                    success = True
                    evidence = f"Password: {password}, Status: {response.status_code}"
                    break
                
                evidence += f"Password: {password}, Status: {response.status_code}\n"
            except requests.RequestException as e:
                evidence += f"Password: {password}, Error: {str(e)}\n"
        
        if success:
            self.add_vulnerability(
                name="Weak password accepted",
                description="System accepts weak or common passwords",
                severity="high",
                evidence=evidence,
                recommendation="Implement password strength requirements",
                location=login_url,
            )
    
    def _test_brute_force(self):
        """Test for brute force protection."""
        self.logger.info("Testing brute force protection")
        
        login_url = urljoin(self.target, "/auth/token")
        attempts = 20  # Number of login attempts
        evidence = ""
        
        # Try multiple login attempts
        for i in range(attempts):
            try:
                response = requests.post(
                    login_url,
                    data={"username": "admin", "password": f"wrong{i}"},
                    timeout=5,
                )
                
                evidence += f"Attempt {i+1}: Status {response.status_code}\n"
                
                # Check if rate limiting is applied
                if response.status_code == 429:
                    # Rate limiting detected
                    return
            except requests.RequestException as e:
                evidence += f"Attempt {i+1}: Error: {str(e)}\n"
        
        # No rate limiting detected
        self.add_vulnerability(
            name="Missing brute force protection",
            description="System does not limit failed login attempts",
            severity="high",
            evidence=evidence,
            recommendation="Implement rate limiting and account lockout after multiple failed attempts",
            location=login_url,
        )
    
    def _test_token_expiration(self):
        """Test for token expiration."""
        self.logger.info("Testing token expiration")
        
        # Check if login endpoint is available
        login_url = urljoin(self.target, "/auth/token")
        
        try:
            # Attempt to login
            login_response = requests.post(
                login_url,
                data={"username": self.config.get("username", "user"), "password": self.config.get("password", "password")},
                timeout=5,
            )
            
            if login_response.status_code != 200:
                self.logger.warning(f"Could not login to test token expiration: {login_response.status_code}")
                return
            
            # Extract token
            token_data = login_response.json()
            token = token_data.get("access_token")
            
            if not token:
                self.logger.warning("No token returned from login endpoint")
                return
            
            # Check token structure
            try:
                # Split token into parts
                parts = token.split(".")
                if len(parts) != 3:
                    self.add_vulnerability(
                        name="Invalid token structure",
                        description="JWT token does not have the correct structure",
                        severity="medium",
                        evidence=f"Token: {token}",
                        recommendation="Ensure tokens are properly formatted JWTs",
                        location=login_url,
                    )
                    return
                
                # Check if token has expiration claim
                import base64
                import json
                
                # Decode payload
                payload = parts[1]
                payload += "=" * ((4 - len(payload) % 4) % 4)  # Add padding
                decoded_payload = base64.urlsafe_b64decode(payload)
                payload_json = json.loads(decoded_payload)
                
                if "exp" not in payload_json:
                    self.add_vulnerability(
                        name="Missing token expiration",
                        description="JWT token does not include an expiration claim",
                        severity="high",
                        evidence=f"Token payload: {payload_json}",
                        recommendation="Add expiration claims to tokens",
                        location=login_url,
                    )
            except Exception as e:
                self.logger.error(f"Error checking token structure: {str(e)}")
        
        except requests.RequestException as e:
            self.logger.error(f"Error testing token expiration: {str(e)}")
    
    def _test_token_reuse(self):
        """Test for token reuse after logout."""
        self.logger.info("Testing token reuse after logout")
        
        # Check if login endpoint is available
        login_url = urljoin(self.target, "/auth/token")
        
        try:
            # Attempt to login
            login_response = requests.post(
                login_url,
                data={"username": self.config.get("username", "user"), "password": self.config.get("password", "password")},
                timeout=5,
            )
            
            if login_response.status_code != 200:
                self.logger.warning(f"Could not login to test token reuse: {login_response.status_code}")
                return
            
            # Extract token
            token_data = login_response.json()
            token = token_data.get("access_token")
            
            if not token:
                self.logger.warning("No token returned from login endpoint")
                return
            
            # Use token to access protected endpoint
            metrics_url = urljoin(self.target, "/metrics")
            auth_headers = {"Authorization": f"Bearer {token}"}
            
            response = requests.get(metrics_url, headers=auth_headers, timeout=5)
            
            if response.status_code >= 400:
                self.logger.warning(f"Could not access protected endpoint: {response.status_code}")
                return
            
            # Logout
            logout_url = urljoin(self.target, "/auth/logout")
            token_parts = token.split(".")
            token_jti = "unknown"
            
            try:
                # Extract token ID if available
                if len(token_parts) == 3:
                    import base64
                    import json
                    
                    # Decode payload
                    payload = token_parts[1]
                    payload += "=" * ((4 - len(payload) % 4) % 4)  # Add padding
                    decoded_payload = base64.urlsafe_b64decode(payload)
                    payload_json = json.loads(decoded_payload)
                    token_jti = payload_json.get("jti", "unknown")
            except Exception:
                pass
            
            logout_response = requests.post(
                logout_url,
                json={"token_jti": token_jti},
                headers=auth_headers,
                timeout=5,
            )
            
            # Try to use token again
            response = requests.get(metrics_url, headers=auth_headers, timeout=5)
            
            if response.status_code < 400:
                self.add_vulnerability(
                    name="Token reuse after logout",
                    description="JWT token can be reused after logout",
                    severity="high",
                    evidence=f"Status code after logout: {response.status_code}",
                    recommendation="Implement token revocation and checking",
                    location=metrics_url,
                )
        
        except requests.RequestException as e:
            self.logger.error(f"Error testing token reuse: {str(e)}")
    
    def _test_token_validation(self):
        """Test for token validation issues."""
        self.logger.info("Testing token validation")
        
        # Check protected endpoint
        metrics_url = urljoin(self.target, "/metrics")
        
        # Test missing token
        try:
            response = requests.get(metrics_url, timeout=5)
            if response.status_code < 400:
                self.add_vulnerability(
                    name="Missing authentication",
                    description="Protected endpoint is accessible without authentication",
                    severity="critical",
                    evidence=f"Status code: {response.status_code}",
                    recommendation="Ensure all protected endpoints require authentication",
                    location=metrics_url,
                )
        except requests.RequestException:
            pass
        
        # Test invalid token
        try:
            auth_headers = {"Authorization": "Bearer invalid.token.here"}
            response = requests.get(metrics_url, headers=auth_headers, timeout=5)
            if response.status_code < 400:
                self.add_vulnerability(
                    name="Invalid token accepted",
                    description="System accepts invalid JWT tokens",
                    severity="critical",
                    evidence=f"Status code: {response.status_code}",
                    recommendation="Properly validate JWT tokens",
                    location=metrics_url,
                )
        except requests.RequestException:
            pass
        
        # Test empty token
        try:
            auth_headers = {"Authorization": "Bearer "}
            response = requests.get(metrics_url, headers=auth_headers, timeout=5)
            if response.status_code < 400:
                self.add_vulnerability(
                    name="Empty token accepted",
                    description="System accepts empty authentication tokens",
                    severity="critical",
                    evidence=f"Status code: {response.status_code}",
                    recommendation="Properly validate authentication tokens",
                    location=metrics_url,
                )
        except requests.RequestException:
            pass


class AuthorizationTester(PenetrationTester):
    """Penetration tester for authorization."""
    
    def _run_tests(self):
        """Run authorization tests."""
        self.logger.info("Testing authorization vulnerabilities")
        
        # Define tests
        tests = [
            self._test_vertical_privilege_escalation,
            self._test_horizontal_privilege_escalation,
            self._test_missing_access_controls,
            self._test_role_validation,
        ]
        
        # Run tests sequentially for clarity
        for test_func in tests:
            test_func()
    
    def _get_auth_token(self) -> Optional[str]:
        """Get authentication token."""
        login_url = urljoin(self.target, "/auth/token")
        
        try:
            login_response = requests.post(
                login_url,
                data={"username": self.config.get("username", "user"), "password": self.config.get("password", "password")},
                timeout=5,
            )
            
            if login_response.status_code != 200:
                self.logger.warning(f"Could not login: {login_response.status_code}")
                return None
            
            token_data = login_response.json()
            return token_data.get("access_token")
        except requests.RequestException:
            return None
    
    def _test_vertical_privilege_escalation(self):
        """Test for vertical privilege escalation."""
        self.logger.info("Testing vertical privilege escalation")
        
        # Get authentication token
        token = self._get_auth_token()
        if not token:
            return
        
        # Define admin endpoints
        admin_endpoints = [
            "/users",
            "/roles",
            "/users/admin",
        ]
        
        evidence = ""
        found_vulnerable = False
        
        for endpoint in admin_endpoints:
            url = urljoin(self.target, endpoint)
            
            try:
                auth_headers = {"Authorization": f"Bearer {token}"}
                response = requests.get(url, headers=auth_headers, timeout=5)
                
                evidence += f"Endpoint: {endpoint}, Status: {response.status_code}\n"
                
                if response.status_code == 200:
                    found_vulnerable = True
            except requests.RequestException as e:
                evidence += f"Endpoint: {endpoint}, Error: {str(e)}\n"
        
        if found_vulnerable:
            self.add_vulnerability(
                name="Vertical privilege escalation",
                description="User can access administrative endpoints",
                severity="critical",
                evidence=evidence,
                recommendation="Implement proper role-based access controls",
                location=self.target,
            )
    
    def _test_horizontal_privilege_escalation(self):
        """Test for horizontal privilege escalation."""
        self.logger.info("Testing horizontal privilege escalation")
        
        # Get authentication token
        token = self._get_auth_token()
        if not token:
            return
        
        # Try to access another user's data
        user_endpoint = urljoin(self.target, "/users/admin")
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = requests.get(user_endpoint, headers=auth_headers, timeout=5)
            
            if response.status_code == 200:
                self.add_vulnerability(
                    name="Horizontal privilege escalation",
                    description="User can access another user's data",
                    severity="high",
                    evidence=f"Status code: {response.status_code}",
                    recommendation="Implement proper resource-based access controls",
                    location=user_endpoint,
                )
        except requests.RequestException:
            pass
    
    def _test_missing_access_controls(self):
        """Test for missing access controls."""
        self.logger.info("Testing missing access controls")
        
        # Define endpoints that should be protected
        protected_endpoints = [
            "/metrics",
            "/alerts",
            "/dashboards/model-performance",
        ]
        
        evidence = ""
        found_vulnerable = False
        
        for endpoint in protected_endpoints:
            url = urljoin(self.target, endpoint)
            
            try:
                response = requests.get(url, timeout=5)
                
                evidence += f"Endpoint: {endpoint}, Status: {response.status_code}\n"
                
                if response.status_code < 400:
                    found_vulnerable = True
            except requests.RequestException as e:
                evidence += f"Endpoint: {endpoint}, Error: {str(e)}\n"
        
        if found_vulnerable:
            self.add_vulnerability(
                name="Missing access controls",
                description="Protected endpoints are accessible without authentication",
                severity="critical",
                evidence=evidence,
                recommendation="Implement authentication for all protected endpoints",
                location=self.target,
            )
    
    def _test_role_validation(self):
        """Test for role validation issues."""
        self.logger.info("Testing role validation")
        
        # Get authentication token
        token = self._get_auth_token()
        if not token:
            return
        
        token_parts = token.split(".")
        if len(token_parts) != 3:
            return
        
        try:
            # Attempt to forge token with admin role
            import base64
            import json
            import hmac
            import hashlib
            
            # Decode header and payload
            header = token_parts[0]
            header_pad = header + "=" * ((4 - len(header) % 4) % 4)
            header_data = json.loads(base64.urlsafe_b64decode(header_pad))
            
            payload = token_parts[1]
            payload_pad = payload + "=" * ((4 - len(payload) % 4) % 4)
            payload_data = json.loads(base64.urlsafe_b64decode(payload_pad))
            
            # Modify payload to add admin role
            if "roles" in payload_data:
                if "admin" not in payload_data["roles"]:
                    payload_data["roles"].append("admin")
            else:
                payload_data["roles"] = ["admin"]
            
            # Encode modified payload
            modified_payload = base64.urlsafe_b64encode(
                json.dumps(payload_data).encode()
            ).decode().rstrip("=")
            
            # Create modified token
            modified_token = f"{token_parts[0]}.{modified_payload}.{token_parts[2]}"
            
            # Try to access admin endpoint with modified token
            admin_endpoint = urljoin(self.target, "/users")
            auth_headers = {"Authorization": f"Bearer {modified_token}"}
            
            response = requests.get(admin_endpoint, headers=auth_headers, timeout=5)
            
            if response.status_code == 200:
                self.add_vulnerability(
                    name="Improper role validation",
                    description="System accepts tokens with forged roles",
                    severity="critical",
                    evidence=f"Modified token accepted. Status code: {response.status_code}",
                    recommendation="Properly validate token signatures and claims",
                    location=admin_endpoint,
                )
        except Exception as e:
            self.logger.error(f"Error testing role validation: {str(e)}")


class InputValidationTester(PenetrationTester):
    """Penetration tester for input validation."""
    
    def _run_tests(self):
        """Run input validation tests."""
        self.logger.info("Testing input validation vulnerabilities")
        
        # Define tests
        tests = [
            self._test_sql_injection,
            self._test_xss,
            self._test_command_injection,
            self._test_path_traversal,
            self._test_large_inputs,
        ]
        
        # Run tests in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            for test_func in tests:
                executor.submit(test_func)
    
    def _get_auth_token(self) -> Optional[str]:
        """Get authentication token."""
        login_url = urljoin(self.target, "/auth/token")
        
        try:
            login_response = requests.post(
                login_url,
                data={"username": self.config.get("username", "user"), "password": self.config.get("password", "password")},
                timeout=5,
            )
            
            if login_response.status_code != 200:
                self.logger.warning(f"Could not login: {login_response.status_code}")
                return None
            
            token_data = login_response.json()
            return token_data.get("access_token")
        except requests.RequestException:
            return None
    
    def _test_sql_injection(self):
        """Test for SQL injection vulnerabilities."""
        self.logger.info("Testing SQL injection")
        
        # Get authentication token
        token = self._get_auth_token()
        if not token:
            return
        
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Define SQL injection payloads
        payloads = [
            "' OR '1'='1",
            "' OR '1'='1' --",
            "admin' --",
            "' UNION SELECT 1, username, password FROM users --",
            "'; DROP TABLE users; --",
        ]
        
        # Test login endpoint
        login_url = urljoin(self.target, "/auth/token")
        
        for payload in payloads:
            try:
                response = requests.post(
                    login_url,
                    data={"username": payload, "password": payload},
                    timeout=5,
                )
                
                if response.status_code == 200:
                    self.add_vulnerability(
                        name="SQL injection in login",
                        description="Login endpoint is vulnerable to SQL injection",
                        severity="critical",
                        evidence=f"Payload: {payload}, Status: {response.status_code}",
                        recommendation="Use parameterized queries and ORM",
                        location=login_url,
                    )
                    break
            except requests.RequestException:
                pass
        
        # Test other endpoints with parameters
        test_endpoints = [
            "/metrics?metric_name=",
            "/alerts?severity=",
            "/users?search=",
        ]
        
        for endpoint in test_endpoints:
            for payload in payloads:
                url = urljoin(self.target, endpoint + payload)
                
                try:
                    response = requests.get(url, headers=auth_headers, timeout=5)
                    
                    # Check for SQL errors in response
                    if response.status_code == 500 and any(
                        error in response.text for error in
                        ["SQL syntax", "ORA-", "mysql", "sqlite3", "postgresql", "SQLSTATE"]
                    ):
                        self.add_vulnerability(
                            name="SQL injection in endpoint",
                            description=f"Endpoint {endpoint} is vulnerable to SQL injection",
                            severity="critical",
                            evidence=f"Payload: {payload}, Status: {response.status_code}, Response contains SQL error",
                            recommendation="Use parameterized queries and ORM",
                            location=url,
                        )
                        break
                except requests.RequestException:
                    pass
    
    def _test_xss(self):
        """Test for cross-site scripting vulnerabilities."""
        self.logger.info("Testing XSS")
        
        # Get authentication token
        token = self._get_auth_token()
        if not token:
            return
        
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Define XSS payloads
        payloads = [
            "<script>alert(1)</script>",
            "<img src=x onerror=alert(1)>",
            "<svg onload=alert(1)>",
            "javascript:alert(1)",
            '"><script>alert(1)</script>',
        ]
        
        # Test URL parameters
        test_endpoints = [
            "/metrics?metric_name=",
            "/alerts?severity=",
            "/dashboards/model-performance?title=",
        ]
        
        for endpoint in test_endpoints:
            for payload in payloads:
                url = urljoin(self.target, endpoint + payload)
                
                try:
                    response = requests.get(url, headers=auth_headers, timeout=5)
                    
                    # Check if payload is reflected in response
                    if response.status_code == 200 and payload in response.text:
                        self.add_vulnerability(
                            name="Reflected XSS",
                            description=f"Endpoint {endpoint} is vulnerable to reflected XSS",
                            severity="high",
                            evidence=f"Payload: {payload}, Status: {response.status_code}, Payload reflected in response",
                            recommendation="Implement output encoding and Content-Security-Policy",
                            location=url,
                        )
                        break
                except requests.RequestException:
                    pass
        
        # Test POST requests
        post_endpoints = [
            "/metrics",
            "/alerts",
            "/dashboards/model-performance",
        ]
        
        for endpoint in post_endpoints:
            url = urljoin(self.target, endpoint)
            
            for payload in payloads:
                data = {"name": payload, "description": payload}
                
                try:
                    response = requests.post(url, json=data, headers=auth_headers, timeout=5)
                    
                    # Test if the payload is stored and reflected in response
                    if response.status_code < 400:
                        # Check if we can retrieve the stored payload
                        response = requests.get(url, headers=auth_headers, timeout=5)
                        
                        if payload in response.text:
                            self.add_vulnerability(
                                name="Stored XSS",
                                description=f"Endpoint {endpoint} is vulnerable to stored XSS",
                                severity="critical",
                                evidence=f"Payload: {payload}, Status: {response.status_code}, Payload stored and reflected",
                                recommendation="Implement output encoding and Content-Security-Policy",
                                location=url,
                            )
                            break
                except requests.RequestException:
                    pass
    
    def _test_command_injection(self):
        """Test for command injection vulnerabilities."""
        self.logger.info("Testing command injection")
        
        # Get authentication token
        token = self._get_auth_token()
        if not token:
            return
        
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Define command injection payloads
        payloads = [
            "; ls -la",
            "| ls -la",
            "`ls -la`",
            "$(ls -la)",
            "& ls -la",
            "&& ls -la",
            "|| ls -la",
        ]
        
        # Test URL parameters
        test_endpoints = [
            "/metrics?metric_name=",
            "/alerts?command=",
            "/dashboards/export?path=",
        ]
        
        for endpoint in test_endpoints:
            for payload in payloads:
                url = urljoin(self.target, endpoint + payload)
                
                try:
                    response = requests.get(url, headers=auth_headers, timeout=5)
                    
                    # Check for command output in response
                    if any(
                        indicator in response.text for indicator in
                        ["total", "drwx", "etc", "usr", "bin", "home"]
                    ):
                        self.add_vulnerability(
                            name="Command injection",
                            description=f"Endpoint {endpoint} is vulnerable to command injection",
                            severity="critical",
                            evidence=f"Payload: {payload}, Status: {response.status_code}, Response contains command output",
                            recommendation="Avoid system commands or use shell escaping",
                            location=url,
                        )
                        break
                except requests.RequestException:
                    pass
        
        # Test POST requests
        post_endpoints = [
            "/metrics",
            "/alerts",
            "/dashboards/export",
        ]
        
        for endpoint in post_endpoints:
            url = urljoin(self.target, endpoint)
            
            for payload in payloads:
                data = {"name": payload, "command": payload, "path": payload}
                
                try:
                    response = requests.post(url, json=data, headers=auth_headers, timeout=5)
                    
                    # Check for command output in response
                    if any(
                        indicator in response.text for indicator in
                        ["total", "drwx", "etc", "usr", "bin", "home"]
                    ):
                        self.add_vulnerability(
                            name="Command injection in POST",
                            description=f"Endpoint {endpoint} is vulnerable to command injection",
                            severity="critical",
                            evidence=f"Payload: {payload}, Status: {response.status_code}, Response contains command output",
                            recommendation="Avoid system commands or use shell escaping",
                            location=url,
                        )
                        break
                except requests.RequestException:
                    pass
    
    def _test_path_traversal(self):
        """Test for path traversal vulnerabilities."""
        self.logger.info("Testing path traversal")
        
        # Get authentication token
        token = self._get_auth_token()
        if not token:
            return
        
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Define path traversal payloads
        payloads = [
            "../../../etc/passwd",
            "..%2f..%2f..%2fetc%2fpasswd",
            "..\\..\\..\\windows\\win.ini",
            "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
            "....//....//....//etc/passwd",
        ]
        
        # Test URL parameters
        test_endpoints = [
            "/metrics/export?path=",
            "/dashboards/view?file=",
            "/alerts/export?path=",
        ]
        
        for endpoint in test_endpoints:
            for payload in payloads:
                url = urljoin(self.target, endpoint + payload)
                
                try:
                    response = requests.get(url, headers=auth_headers, timeout=5)
                    
                    # Check for sensitive file contents in response
                    if any(
                        indicator in response.text for indicator in
                        ["root:x:", "bin:x:", "nobody:x:", "windows", "[fonts]", "[extensions]"]
                    ):
                        self.add_vulnerability(
                            name="Path traversal",
                            description=f"Endpoint {endpoint} is vulnerable to path traversal",
                            severity="critical",
                            evidence=f"Payload: {payload}, Status: {response.status_code}, Response contains file contents",
                            recommendation="Use file path sanitization and do not accept user input for file paths",
                            location=url,
                        )
                        break
                except requests.RequestException:
                    pass
    
    def _test_large_inputs(self):
        """Test for large input handling."""
        self.logger.info("Testing large input handling")
        
        # Get authentication token
        token = self._get_auth_token()
        if not token:
            return
        
        auth_headers = {"Authorization": f"Bearer {token}"}
        
        # Test various input sizes
        sizes = [1024, 10240, 102400, 1024000]
        
        for size in sizes:
            # Large parameter value
            large_input = "A" * size
            
            # Test URL parameter
            url = urljoin(self.target, f"/metrics?name={large_input[:8192]}")  # Truncate for URL
            
            try:
                response = requests.get(url, headers=auth_headers, timeout=10)
                
                if response.status_code == 500:
                    self.add_vulnerability(
                        name="Large input handling issue in URL parameter",
                        description="API fails to handle large input in URL parameter",
                        severity="medium",
                        evidence=f"Input size: {size}, Status: {response.status_code}",
                        recommendation="Implement proper input size validation and handling",
                        location=url,
                    )
                    break
            except requests.RequestException as e:
                # Connection error might indicate vulnerability
                if "Connection reset" in str(e) or "Timeout" in str(e):
                    self.add_vulnerability(
                        name="Large input handling issue in URL parameter",
                        description="API crashes or times out with large input in URL parameter",
                        severity="medium",
                        evidence=f"Input size: {size}, Error: {str(e)}",
                        recommendation="Implement proper input size validation and handling",
                        location=url,
                    )
                    break
            
            # Test POST request
            url = urljoin(self.target, "/metrics")
            
            try:
                data = {"name": large_input, "description": "Test"}
                response = requests.post(url, json=data, headers=auth_headers, timeout=10)
                
                if response.status_code == 500:
                    self.add_vulnerability(
                        name="Large input handling issue in JSON body",
                        description="API fails to handle large input in JSON body",
                        severity="medium",
                        evidence=f"Input size: {size}, Status: {response.status_code}",
                        recommendation="Implement proper input size validation and handling",
                        location=url,
                    )
                    break
            except requests.RequestException as e:
                # Connection error might indicate vulnerability
                if "Connection reset" in str(e) or "Timeout" in str(e):
                    self.add_vulnerability(
                        name="Large input handling issue in JSON body",
                        description="API crashes or times out with large input in JSON body",
                        severity="medium",
                        evidence=f"Input size: {size}, Error: {str(e)}",
                        recommendation="Implement proper input size validation and handling",
                        location=url,
                    )
                    break


class TLSTester(PenetrationTester):
    """Penetration tester for TLS configuration."""
    
    def _run_tests(self):
        """Run TLS tests."""
        self.logger.info("Testing TLS vulnerabilities")
        
        # Parse URL
        parsed_url = urlparse(self.target)
        
        # Only test HTTPS URLs
        if parsed_url.scheme != "https":
            self.logger.warning("Target is not using HTTPS")
            self.add_vulnerability(
                name="Missing HTTPS",
                description="Target is not using HTTPS",
                severity="critical",
                evidence=f"URL scheme: {parsed_url.scheme}",
                recommendation="Enable HTTPS for all traffic",
                location=self.target,
            )
            return
        
        # Define tests
        tests = [
            self._test_ssl_version,
            self._test_weak_ciphers,
            self._test_certificate,
            self._test_hsts,
        ]
        
        # Run tests in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            for test_func in tests:
                executor.submit(test_func)
    
    def _test_ssl_version(self):
        """Test for SSL version vulnerabilities."""
        self.logger.info("Testing SSL/TLS version")
        
        try:
            # Use external tool to check SSL version
            result = subprocess.run(
                ["nmap", "--script", "ssl-enum-ciphers", "-p", "443", urlparse(self.target).netloc],
                check=False,
                capture_output=True,
                text=True,
            )
            
            # Check for vulnerable SSL/TLS versions
            output = result.stdout
            
            if "SSLv2" in output or "SSLv3" in output:
                self.add_vulnerability(
                    name="Insecure SSL/TLS version",
                    description="Server supports insecure SSL/TLS versions (SSLv2/SSLv3)",
                    severity="critical",
                    evidence=output,
                    recommendation="Disable SSLv2 and SSLv3, use TLSv1.2 or TLSv1.3 only",
                    location=self.target,
                )
            
            if "TLSv1.0" in output:
                self.add_vulnerability(
                    name="Outdated TLS version",
                    description="Server supports outdated TLS version (TLSv1.0)",
                    severity="high",
                    evidence=output,
                    recommendation="Disable TLSv1.0, use TLSv1.2 or TLSv1.3 only",
                    location=self.target,
                )
            
            if "TLSv1.1" in output:
                self.add_vulnerability(
                    name="Outdated TLS version",
                    description="Server supports outdated TLS version (TLSv1.1)",
                    severity="medium",
                    evidence=output,
                    recommendation="Disable TLSv1.1, use TLSv1.2 or TLSv1.3 only",
                    location=self.target,
                )
        except FileNotFoundError:
            self.logger.warning("nmap not found, skipping SSL/TLS version test")
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Error checking SSL/TLS version: {e.stderr}")
    
    def _test_weak_ciphers(self):
        """Test for weak cipher vulnerabilities."""
        self.logger.info("Testing weak ciphers")
        
        try:
            # Use external tool to check ciphers
            result = subprocess.run(
                ["nmap", "--script", "ssl-enum-ciphers", "-p", "443", urlparse(self.target).netloc],
                check=False,
                capture_output=True,
                text=True,
            )
            
            # Check for weak ciphers
            output = result.stdout
            
            weak_ciphers = [
                "NULL", 
                "EXPORT", 
                "DES", 
                "RC4", 
                "MD5",
                "anon",
                "ADH",
                "CBC",
            ]
            
            for cipher in weak_ciphers:
                if cipher in output:
                    self.add_vulnerability(
                        name="Weak cipher supported",
                        description=f"Server supports weak cipher ({cipher})",
                        severity="high",
                        evidence=output,
                        recommendation="Disable weak ciphers, use strong AEAD ciphers only",
                        location=self.target,
                    )
                    break
        except FileNotFoundError:
            self.logger.warning("nmap not found, skipping weak ciphers test")
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Error checking weak ciphers: {e.stderr}")
    
    def _test_certificate(self):
        """Test for certificate vulnerabilities."""
        self.logger.info("Testing certificate")
        
        try:
            # Use external tool to check certificate
            result = subprocess.run(
                ["openssl", "s_client", "-connect", f"{urlparse(self.target).netloc}:443", "-servername", urlparse(self.target).netloc],
                check=False,
                capture_output=True,
                text=True,
                input="Q\n",
            )
            
            # Check for certificate issues
            output = result.stdout
            
            if "self signed certificate" in output:
                self.add_vulnerability(
                    name="Self-signed certificate",
                    description="Server uses a self-signed certificate",
                    severity="high",
                    evidence="Certificate is self-signed",
                    recommendation="Use a certificate signed by a trusted CA",
                    location=self.target,
                )
            
            if "certificate has expired" in output:
                self.add_vulnerability(
                    name="Expired certificate",
                    description="Server certificate has expired",
                    severity="critical",
                    evidence="Certificate has expired",
                    recommendation="Renew the certificate",
                    location=self.target,
                )
            
            if "certificate is not trusted" in output:
                self.add_vulnerability(
                    name="Untrusted certificate",
                    description="Server certificate is not trusted",
                    severity="high",
                    evidence="Certificate is not trusted",
                    recommendation="Use a certificate signed by a trusted CA",
                    location=self.target,
                )
        except FileNotFoundError:
            self.logger.warning("openssl not found, skipping certificate test")
        except subprocess.CalledProcessError as e:
            self.logger.error(f"Error checking certificate: {e.stderr}")
    
    def _test_hsts(self):
        """Test for HSTS vulnerabilities."""
        self.logger.info("Testing HSTS")
        
        try:
            # Send a request and check HSTS header
            response = requests.get(self.target, timeout=5)
            
            # Check for HSTS header
            if "Strict-Transport-Security" not in response.headers:
                self.add_vulnerability(
                    name="Missing HSTS",
                    description="Server does not use HTTP Strict Transport Security (HSTS)",
                    severity="medium",
                    evidence="No Strict-Transport-Security header",
                    recommendation="Add HSTS header with a long max-age",
                    location=self.target,
                )
            else:
                # Check HSTS max-age
                hsts_header = response.headers["Strict-Transport-Security"]
                if "max-age=0" in hsts_header:
                    self.add_vulnerability(
                        name="HSTS disabled",
                        description="HSTS is disabled (max-age=0)",
                        severity="medium",
                        evidence=f"HSTS header: {hsts_header}",
                        recommendation="Set a long max-age value (e.g., 31536000)",
                        location=self.target,
                    )
                elif "max-age=" in hsts_header:
                    # Extract max-age value
                    max_age = int(hsts_header.split("max-age=")[1].split(";")[0])
                    
                    if max_age < 31536000:  # 1 year
                        self.add_vulnerability(
                            name="Short HSTS max-age",
                            description="HSTS max-age is less than 1 year",
                            severity="low",
                            evidence=f"HSTS header: {hsts_header}",
                            recommendation="Set a long max-age value (e.g., 31536000)",
                            location=self.target,
                        )
                
                # Check for includeSubDomains
                if "includeSubDomains" not in hsts_header:
                    self.add_vulnerability(
                        name="Missing HSTS includeSubDomains",
                        description="HSTS header does not include subdomains",
                        severity="low",
                        evidence=f"HSTS header: {hsts_header}",
                        recommendation="Add includeSubDomains directive to HSTS header",
                        location=self.target,
                    )
        except requests.RequestException as e:
            self.logger.error(f"Error checking HSTS: {str(e)}")


def run_penetration_tests(target: str, config: Optional[Dict[str, Any]] = None) -> List[Vulnerability]:
    """
    Run all penetration tests on the target.
    
    Args:
        target: Target URL
        config: Test configuration
        
    Returns:
        List of vulnerabilities
    """
    if config is None:
        config = {}
    
    # Create testers
    testers = [
        AuthenticationTester(target, config),
        AuthorizationTester(target, config),
        InputValidationTester(target, config),
        TLSTester(target, config),
    ]
    
    # Run tests
    vulnerabilities = []
    for tester in testers:
        vulnerabilities.extend(tester.run())
    
    return vulnerabilities


def generate_report(vulnerabilities: List[Vulnerability], output_file: Optional[str] = None) -> str:
    """
    Generate penetration test report.
    
    Args:
        vulnerabilities: List of vulnerabilities
        output_file: Path to output file
        
    Returns:
        Report content
    """
    # Count vulnerabilities by severity
    severity_counts = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0,
    }
    
    for vuln in vulnerabilities:
        severity = vuln.severity.lower()
        if severity in severity_counts:
            severity_counts[severity] += 1
    
    # Generate report
    report = f"""
# Penetration Test Report

Date: {time.strftime("%Y-%m-%d %H:%M:%S")}

## Summary

- **Total vulnerabilities**: {len(vulnerabilities)}
- **Critical**: {severity_counts["critical"]}
- **High**: {severity_counts["high"]}
- **Medium**: {severity_counts["medium"]}
- **Low**: {severity_counts["low"]}
- **Info**: {severity_counts["info"]}

## Vulnerabilities
"""
    
    # Add vulnerabilities to report
    for severity in ["critical", "high", "medium", "low", "info"]:
        severity_vulns = [v for v in vulnerabilities if v.severity.lower() == severity]
        if severity_vulns:
            report += f"\n### {severity.title()} ({len(severity_vulns)})\n\n"
            
            for i, vuln in enumerate(severity_vulns):
                report += f"#### {i+1}. {vuln.name}\n\n"
                
                if vuln.description:
                    report += f"**Description**: {vuln.description}\n\n"
                
                if vuln.location:
                    report += f"**Location**: {vuln.location}\n\n"
                
                if vuln.recommendation:
                    report += f"**Recommendation**: {vuln.recommendation}\n\n"
                
                if vuln.evidence:
                    report += f"**Evidence**:\n```\n{vuln.evidence}\n```\n\n"
    
    # Write report to file
    if output_file:
        os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)
        with open(output_file, "w") as f:
            f.write(report)
    
    return report


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Penetration testing for ML monitoring system")
    parser.add_argument(
        "target",
        help="Target URL",
    )
    parser.add_argument(
        "--output",
        help="Path to output report file",
        default="penetration_test_report.md",
    )
    parser.add_argument(
        "--config",
        help="Path to configuration file",
    )
    parser.add_argument(
        "--username",
        help="Username for authentication",
        default="user",
    )
    parser.add_argument(
        "--password",
        help="Password for authentication",
        default="password",
    )
    return parser.parse_args()


def main():
    """Run penetration tests."""
    args = parse_args()
    
    # Load configuration
    config = {}
    if args.config:
        try:
            with open(args.config, "r") as f:
                config = json.load(f)
        except Exception as e:
            logger.error(f"Error loading configuration: {str(e)}")
    
    # Add command line arguments to configuration
    config["username"] = args.username
    config["password"] = args.password
    
    # Run tests
    vulnerabilities = run_penetration_tests(args.target, config)
    
    # Generate report
    report = generate_report(vulnerabilities, args.output)
    
    # Print summary
    critical = sum(1 for v in vulnerabilities if v.severity.lower() == "critical")
    high = sum(1 for v in vulnerabilities if v.severity.lower() == "high")
    
    if critical > 0 or high > 0:
        logger.warning(f"Penetration test completed with {critical} critical and {high} high severity vulnerabilities")
    else:
        logger.info(f"Penetration test completed with {len(vulnerabilities)} vulnerabilities")
    
    logger.info(f"Report saved to {args.output}")


if __name__ == "__main__":
    main()
