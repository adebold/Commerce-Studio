#!/usr/bin/env python3
"""
Security audit script for ML monitoring system.

This script performs automated security checks on the ML monitoring system,
identifying potential vulnerabilities and misconfigurations.
"""

import os
import sys
import json
import argparse
import logging
import requests
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("security_audit")


class SecurityAuditor:
    """Base class for security auditors."""
    
    def __init__(self, name: str, config: Dict[str, Any]):
        """
        Initialize auditor.
        
        Args:
            name: Auditor name
            config: Auditor configuration
        """
        self.name = name
        self.config = config
        self.logger = logging.getLogger(f"security_audit.{name}")
        self.findings = []
    
    def audit(self) -> List[Dict[str, Any]]:
        """
        Perform security audit.
        
        Returns:
            List of findings
        """
        self.logger.info(f"Starting security audit: {self.name}")
        self._run_audit()
        self.logger.info(f"Completed security audit: {self.name} - {len(self.findings)} findings")
        return self.findings
    
    def _run_audit(self):
        """Run the audit (to be implemented by subclasses)."""
        raise NotImplementedError("Subclasses must implement _run_audit()")
    
    def add_finding(
        self,
        title: str,
        description: str,
        severity: str,
        location: Optional[str] = None,
        recommendation: Optional[str] = None,
        evidence: Optional[str] = None,
    ):
        """
        Add a security finding.
        
        Args:
            title: Finding title
            description: Finding description
            severity: Finding severity (critical, high, medium, low, info)
            location: Location where the finding was found
            recommendation: Recommended fix
            evidence: Evidence of the finding
        """
        finding = {
            "title": title,
            "description": description,
            "severity": severity,
            "auditor": self.name,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        if location:
            finding["location"] = location
        
        if recommendation:
            finding["recommendation"] = recommendation
        
        if evidence:
            finding["evidence"] = evidence
        
        self.findings.append(finding)
        
        # Log the finding
        self.logger.warning(f"[{severity.upper()}] {title}")


class DependencyScanner(SecurityAuditor):
    """Security auditor for dependencies."""
    
    def _run_audit(self):
        """Run dependency scan."""
        self.logger.info("Scanning dependencies for vulnerabilities")
        
        # Check if pip-audit is installed
        try:
            subprocess.run(
                ["pip", "show", "pip-audit"],
                check=True,
                capture_output=True,
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.logger.info("pip-audit not found, installing")
            try:
                subprocess.run(
                    ["pip", "install", "pip-audit"],
                    check=True,
                    capture_output=True,
                )
            except subprocess.CalledProcessError as e:
                self.add_finding(
                    title="Failed to install dependency scanner",
                    description="Could not install pip-audit for dependency scanning",
                    severity="medium",
                    evidence=e.stderr.decode(),
                    recommendation="Install pip-audit manually: pip install pip-audit",
                )
                return
        
        # Run pip-audit
        try:
            result = subprocess.run(
                ["pip-audit"],
                check=False,  # Don't fail on vulnerabilities
                capture_output=True,
                text=True,
            )
            
            # Check if vulnerabilities were found
            if result.returncode != 0:
                # Parse output for vulnerabilities
                lines = result.stdout.splitlines()
                for i, line in enumerate(lines):
                    if "Found" in line and "vulnerability" in line:
                        # Extract vulnerabilities
                        vulns = []
                        for j in range(i + 1, len(lines)):
                            if lines[j].strip():
                                vulns.append(lines[j])
                            else:
                                break
                        
                        if vulns:
                            self.add_finding(
                                title="Vulnerable dependencies found",
                                description="Security vulnerabilities found in project dependencies",
                                severity="high",
                                evidence="\n".join(vulns),
                                recommendation="Update the vulnerable dependencies to the latest versions",
                            )
            else:
                self.logger.info("No vulnerable dependencies found")
        except subprocess.CalledProcessError as e:
            self.add_finding(
                title="Dependency scan failed",
                description="Failed to scan dependencies for vulnerabilities",
                severity="medium",
                evidence=e.stderr.decode(),
                recommendation="Run pip-audit manually to check for vulnerabilities",
            )


class CodeScanner(SecurityAuditor):
    """Security auditor for code."""
    
    def _run_audit(self):
        """Run code scan."""
        self.logger.info("Scanning code for security issues")
        
        # Check if bandit is installed
        try:
            subprocess.run(
                ["bandit", "--version"],
                check=True,
                capture_output=True,
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.logger.info("Bandit not found, installing")
            try:
                subprocess.run(
                    ["pip", "install", "bandit"],
                    check=True,
                    capture_output=True,
                )
            except subprocess.CalledProcessError as e:
                self.add_finding(
                    title="Failed to install code scanner",
                    description="Could not install bandit for code scanning",
                    severity="medium",
                    evidence=e.stderr.decode(),
                    recommendation="Install bandit manually: pip install bandit",
                )
                return
        
        # Run bandit on src directory
        try:
            result = subprocess.run(
                ["bandit", "-r", "src", "-f", "json"],
                check=False,  # Don't fail on issues
                capture_output=True,
                text=True,
            )
            
            # Parse JSON output
            try:
                data = json.loads(result.stdout)
                results = data.get("results", [])
                
                for issue in results:
                    severity = issue.get("issue_severity", "").lower()
                    title = issue.get("issue_text", "Unknown issue")
                    location = f"{issue.get('filename', '?')}:{issue.get('line_number', '?')}"
                    confidence = issue.get("issue_confidence", "").lower()
                    code = issue.get("code", "")
                    
                    self.add_finding(
                        title=title,
                        description=f"Confidence: {confidence}",
                        severity=severity,
                        location=location,
                        evidence=code,
                        recommendation="Review the code and fix the security issue",
                    )
                
                if not results:
                    self.logger.info("No code security issues found")
            except json.JSONDecodeError:
                # Bandit didn't output valid JSON
                if "No issues identified" in result.stdout:
                    self.logger.info("No code security issues found")
                else:
                    self.add_finding(
                        title="Code scan failed",
                        description="Failed to parse bandit output",
                        severity="low",
                        evidence=result.stdout,
                        recommendation="Run bandit manually to check for issues",
                    )
        except subprocess.CalledProcessError as e:
            self.add_finding(
                title="Code scan failed",
                description="Failed to scan code for security issues",
                severity="medium",
                evidence=e.stderr.decode(),
                recommendation="Run bandit manually to check for issues",
            )


class ConfigScanner(SecurityAuditor):
    """Security auditor for configuration."""
    
    def _run_audit(self):
        """Run configuration scan."""
        self.logger.info("Scanning configuration for security issues")
        
        # Check for hardcoded secrets in configuration files
        secret_patterns = [
            "api_key",
            "apikey",
            "api-key",
            "password",
            "secret",
            "token",
            "accesskey",
            "access_key",
            "access-key",
        ]
        
        # List of file patterns to check
        file_patterns = [
            "*.py",
            "*.json",
            "*.yaml",
            "*.yml",
            "*.ini",
            "*.conf",
            ".env*",
        ]
        
        # Find all config files
        config_files = []
        for pattern in file_patterns:
            config_files.extend(list(Path(".").glob(f"**/{pattern}")))
        
        # Check each file for secrets
        for file_path in config_files:
            # Skip virtual environment and .git directories
            if ".venv" in str(file_path) or ".git" in str(file_path):
                continue
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                
                for i, line in enumerate(lines):
                    line_lower = line.lower()
                    
                    # Skip comments
                    if line.strip().startswith(("#", "//", "/*")):
                        continue
                    
                    # Check if line contains a secret pattern
                    for pattern in secret_patterns:
                        if pattern in line_lower:
                            # Check if it's a hardcoded value
                            if "=" in line or ":" in line:
                                parts = line.split("=", 1) if "=" in line else line.split(":", 1)
                                if len(parts) > 1 and parts[1].strip():
                                    value = parts[1].strip()
                                    # Skip values from environment variables
                                    if not ("os.getenv" in value or "${" in value or "process.env" in value):
                                        self.add_finding(
                                            title="Hardcoded secret found",
                                            description=f"Potential hardcoded secret in configuration file",
                                            severity="high",
                                            location=f"{file_path}:{i+1}",
                                            evidence=line.strip(),
                                            recommendation="Move secrets to environment variables or a secure secret manager",
                                        )
            except Exception as e:
                self.logger.error(f"Error scanning {file_path}: {str(e)}")
        
        # Check for insecure default configurations
        self._check_insecure_defaults()
    
    def _check_insecure_defaults(self):
        """Check for insecure default configurations."""
        # Check TLS configuration
        if os.getenv("TLS_ENABLED", "true").lower() in ("false", "0", "no"):
            self.add_finding(
                title="TLS is disabled",
                description="TLS is disabled, which may expose communication to eavesdropping",
                severity="high",
                location="Environment variables",
                recommendation="Enable TLS by setting TLS_ENABLED=true",
            )
        
        # Check JWT configuration
        if not os.getenv("JWT_SECRET_KEY"):
            self.add_finding(
                title="Missing JWT secret key",
                description="JWT_SECRET_KEY environment variable is not set",
                severity="critical",
                location="Environment variables",
                recommendation="Set a strong, unique JWT_SECRET_KEY environment variable",
            )
        
        # Check encryption configuration
        if not os.getenv("ENCRYPTION_KEY"):
            self.add_finding(
                title="Missing encryption key",
                description="ENCRYPTION_KEY environment variable is not set",
                severity="critical",
                location="Environment variables",
                recommendation="Set a strong, unique ENCRYPTION_KEY environment variable",
            )


class APIScanner(SecurityAuditor):
    """Security auditor for API endpoints."""
    
    def _run_audit(self):
        """Run API scan."""
        self.logger.info("Scanning API endpoints for security issues")
        
        # Get API URL from configuration
        api_url = self.config.get("api_url", "http://localhost:8000")
        token = self.config.get("token")
        
        # Check if API is available
        try:
            response = requests.get(f"{api_url}/health", timeout=5)
        except requests.RequestException as e:
            self.logger.warning(f"API not available for scanning: {str(e)}")
            return
        
        # Perform unauthenticated access test
        self._test_unauthenticated_access(api_url)
        
        # Perform authenticated tests if token is provided
        if token:
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test for excessive privileges
            self._test_excessive_privileges(api_url, headers)
            
            # Test for missing access controls
            self._test_missing_access_controls(api_url, headers)
    
    def _test_unauthenticated_access(self, api_url):
        """Test for unauthenticated access to protected endpoints."""
        protected_endpoints = [
            "/metrics",
            "/alerts",
            "/alert-rules",
            "/dashboards/model-performance",
            "/users",
            "/roles",
        ]
        
        for endpoint in protected_endpoints:
            try:
                response = requests.get(f"{api_url}{endpoint}", timeout=5)
                
                # Check if endpoint is accessible without authentication
                if response.status_code != 401:
                    self.add_finding(
                        title="Unauthenticated access to protected endpoint",
                        description=f"Endpoint {endpoint} is accessible without authentication",
                        severity="critical",
                        location=f"{api_url}{endpoint}",
                        evidence=f"Status code: {response.status_code}",
                        recommendation="Ensure all protected endpoints require authentication",
                    )
            except requests.RequestException:
                pass
    
    def _test_excessive_privileges(self, api_url, headers):
        """Test for excessive privileges."""
        admin_endpoints = [
            "/users",
            "/roles",
        ]
        
        for endpoint in admin_endpoints:
            try:
                response = requests.get(f"{api_url}{endpoint}", headers=headers, timeout=5)
                
                # Check if non-admin user can access admin endpoints
                if response.status_code == 200:
                    self.add_finding(
                        title="Potential excessive privileges",
                        description=f"User may have excessive privileges to access {endpoint}",
                        severity="high",
                        location=f"{api_url}{endpoint}",
                        evidence=f"Status code: {response.status_code}",
                        recommendation="Verify user roles and permissions",
                    )
            except requests.RequestException:
                pass
    
    def _test_missing_access_controls(self, api_url, headers):
        """Test for missing access controls."""
        # Try to access another user's information
        try:
            response = requests.get(f"{api_url}/users/admin", headers=headers, timeout=5)
            
            # Check if user can access another user's information
            if response.status_code == 200:
                self.add_finding(
                    title="Missing access controls",
                    description="User can access another user's information",
                    severity="high",
                    location=f"{api_url}/users/admin",
                    evidence=f"Status code: {response.status_code}",
                    recommendation="Implement proper access controls for user resources",
                )
        except requests.RequestException:
            pass


class NetworkScanner(SecurityAuditor):
    """Security auditor for network configuration."""
    
    def _run_audit(self):
        """Run network scan."""
        self.logger.info("Scanning network configuration for security issues")
        
        # Check if the server is exposed to the internet
        api_host = os.getenv("API_HOST", "0.0.0.0")
        api_port = int(os.getenv("API_PORT", "8000"))
        
        if api_host == "0.0.0.0":
            self.add_finding(
                title="API server bound to all interfaces",
                description=f"API server is bound to all network interfaces ({api_host}:{api_port})",
                severity="medium",
                location="Environment variables",
                recommendation="Bind the server to localhost or specific interfaces if it should not be publicly accessible",
            )
        
        # Check if rate limiting is enabled
        if not os.getenv("RATE_LIMIT_ENABLED", "true").lower() in ("true", "1", "yes"):
            self.add_finding(
                title="Rate limiting is disabled",
                description="Rate limiting is disabled, which may make the API vulnerable to DoS attacks",
                severity="medium",
                location="Environment variables",
                recommendation="Enable rate limiting by setting RATE_LIMIT_ENABLED=true",
            )
        
        # Check TLS configuration
        self._check_tls_configuration()
    
    def _check_tls_configuration(self):
        """Check TLS configuration."""
        # Check TLS version
        if os.getenv("TLS_MIN_VERSION", "TLSv1.2") == "TLSv1" or os.getenv("TLS_MIN_VERSION", "TLSv1.2") == "TLSv1.1":
            self.add_finding(
                title="Insecure TLS version",
                description=f"Minimum TLS version is set to {os.getenv('TLS_MIN_VERSION')}",
                severity="high",
                location="Environment variables",
                recommendation="Set minimum TLS version to TLSv1.2 or higher",
            )
        
        # Check if HSTS is enabled
        hsts_header = "Strict-Transport-Security"
        security_headers = os.getenv("SECURITY_HEADERS", "")
        
        if not hsts_header in security_headers:
            self.add_finding(
                title="HSTS not enabled",
                description="HTTP Strict Transport Security (HSTS) is not enabled",
                severity="medium",
                location="Security headers",
                recommendation="Enable HSTS by adding the Strict-Transport-Security header",
            )


def run_security_audit(config_file: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Run security audit.
    
    Args:
        config_file: Path to configuration file
        
    Returns:
        List of findings
    """
    # Load configuration
    config = {}
    if config_file and os.path.isfile(config_file):
        with open(config_file, "r") as f:
            config = json.load(f)
    
    # Create auditors
    auditors = [
        DependencyScanner("dependency_scanner", config),
        CodeScanner("code_scanner", config),
        ConfigScanner("config_scanner", config),
        APIScanner("api_scanner", config),
        NetworkScanner("network_scanner", config),
    ]
    
    # Run audits
    findings = []
    for auditor in auditors:
        findings.extend(auditor.audit())
    
    return findings


def generate_report(findings: List[Dict[str, Any]], output_file: Optional[str] = None) -> str:
    """
    Generate security audit report.
    
    Args:
        findings: List of findings
        output_file: Path to output file
        
    Returns:
        Report content
    """
    # Count findings by severity
    severity_counts = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0,
    }
    
    for finding in findings:
        severity = finding.get("severity", "").lower()
        if severity in severity_counts:
            severity_counts[severity] += 1
    
    # Generate report
    report = f"""
# Security Audit Report

Date: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}

## Summary

- **Total findings**: {len(findings)}
- **Critical**: {severity_counts["critical"]}
- **High**: {severity_counts["high"]}
- **Medium**: {severity_counts["medium"]}
- **Low**: {severity_counts["low"]}
- **Info**: {severity_counts["info"]}

## Findings
"""
    
    # Add findings to report
    for severity in ["critical", "high", "medium", "low", "info"]:
        severity_findings = [f for f in findings if f.get("severity", "").lower() == severity]
        if severity_findings:
            report += f"\n### {severity.title()} ({len(severity_findings)})\n\n"
            
            for i, finding in enumerate(severity_findings):
                title = finding.get("title", "Unknown finding")
                description = finding.get("description", "")
                location = finding.get("location", "")
                recommendation = finding.get("recommendation", "")
                evidence = finding.get("evidence", "")
                auditor = finding.get("auditor", "")
                
                report += f"#### {i+1}. {title}\n\n"
                
                if description:
                    report += f"**Description**: {description}\n\n"
                
                if location:
                    report += f"**Location**: {location}\n\n"
                
                if recommendation:
                    report += f"**Recommendation**: {recommendation}\n\n"
                
                if evidence:
                    report += f"**Evidence**:\n```\n{evidence}\n```\n\n"
                
                if auditor:
                    report += f"**Auditor**: {auditor}\n\n"
    
    # Write report to file
    if output_file:
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, "w") as f:
            f.write(report)
    
    return report


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Security audit for ML monitoring system")
    parser.add_argument(
        "--config",
        help="Path to configuration file",
        default=None,
    )
    parser.add_argument(
        "--output",
        help="Path to output report file",
        default="security_audit_report.md",
    )
    parser.add_argument(
        "--json",
        help="Output findings as JSON",
        action="store_true",
    )
    return parser.parse_args()


def main():
    """Run security audit."""
    args = parse_args()
    
    # Run security audit
    findings = run_security_audit(args.config)
    
    # Output findings as JSON
    if args.json:
        print(json.dumps(findings, indent=2))
    else:
        # Generate report
        report = generate_report(findings, args.output)
        
        # Summary
        critical = sum(1 for f in findings if f.get("severity", "").lower() == "critical")
        high = sum(1 for f in findings if f.get("severity", "").lower() == "high")
        
        if critical > 0 or high > 0:
            logger.warning(f"Security audit completed with {critical} critical and {high} high severity findings")
        else:
            logger.info(f"Security audit completed with {len(findings)} findings")
        
        logger.info(f"Report saved to {args.output}")


if __name__ == "__main__":
    main()
