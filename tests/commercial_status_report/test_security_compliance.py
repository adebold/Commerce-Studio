#!/usr/bin/env python3
"""
Test Implementation: Security and HIPAA Compliance Validation
Addresses Issue 2 from reflection_LS2.md - inadequate security validation
"""

import pytest
import re
from pathlib import Path
from unittest.mock import patch, MagicMock
from test_implementation_eyewear_ml import EyewearMLStatusReportValidator, ValidationResult


class SecurityComplianceValidator(EyewearMLStatusReportValidator):
    """Enhanced validator with comprehensive security and HIPAA compliance checks."""
    
    def validate_security_compliance(self) -> None:
        """Validate comprehensive security and HIPAA compliance."""
        section = self._extract_section("Security")
        
        if not section:
            self._add_result("security_section_exists", False,
                           "Security section not found")
            return
        
        self._add_result("security_section_exists", True,
                        "Security section found")
        
        # HIPAA-specific requirements for healthcare data
        hipaa_requirements = {
            "phi_protection": [
                "PHI", "protected health information", "patient data",
                "health information", "medical data", "biometric data"
            ],
            "access_controls": [
                "role-based access", "RBAC", "least privilege",
                "access control", "user permissions", "authorization"
            ],
            "audit_trails": [
                "audit log", "access tracking", "compliance monitoring",
                "audit trail", "logging", "activity monitoring"
            ],
            "encryption": [
                "AES-256", "encryption at rest", "encryption in transit",
                "TLS", "SSL", "encrypted", "cryptography"
            ],
            "breach_notification": [
                "breach response", "incident management", "breach notification",
                "incident response", "security incident"
            ],
            "business_associate": [
                "BAA", "business associate agreement", "HIPAA compliance",
                "healthcare compliance"
            ]
        }
        
        for requirement, keywords in hipaa_requirements.items():
            found = any(keyword.lower() in section.lower() for keyword in keywords)
            self._add_result(f"hipaa_{requirement}", found,
                           f"{'Documented' if found else 'Missing'} {requirement}")
        
        # General security requirements
        security_requirements = {
            "authentication": [
                "authentication", "JWT", "OAuth", "SSO", "multi-factor",
                "2FA", "MFA", "login security"
            ],
            "network_security": [
                "firewall", "VPN", "network security", "intrusion detection",
                "DDoS protection", "WAF", "web application firewall"
            ],
            "data_protection": [
                "data protection", "backup", "disaster recovery",
                "data retention", "data classification"
            ],
            "vulnerability_management": [
                "vulnerability scan", "penetration test", "security assessment",
                "OWASP", "security testing", "CVE"
            ],
            "compliance_frameworks": [
                "SOC 2", "ISO 27001", "GDPR", "CCPA", "PCI DSS",
                "compliance framework"
            ]
        }
        
        for requirement, keywords in security_requirements.items():
            found = any(keyword.lower() in section.lower() for keyword in keywords)
            self._add_result(f"security_{requirement}", found,
                           f"{'Documented' if found else 'Missing'} {requirement}")
    
    def validate_security_architecture(self) -> None:
        """Validate security architecture documentation."""
        section = self._extract_section("Security Architecture") or self._extract_section("Platform Overview")
        
        if not section:
            self._add_result("security_architecture_documented", False,
                           "Security architecture not documented")
            return
        
        # Security architecture components
        architecture_components = {
            "api_security": [
                "API security", "rate limiting", "API gateway",
                "API authentication", "API authorization"
            ],
            "database_security": [
                "database security", "database encryption", "connection security",
                "database access control", "MongoDB security"
            ],
            "container_security": [
                "container security", "Docker security", "Kubernetes security",
                "pod security", "image scanning"
            ],
            "infrastructure_security": [
                "infrastructure security", "cloud security", "AWS security",
                "GCP security", "Azure security"
            ]
        }
        
        for component, keywords in architecture_components.items():
            found = any(keyword.lower() in section.lower() for keyword in keywords)
            self._add_result(f"security_architecture_{component}", found,
                           f"{'Documented' if found else 'Missing'} {component}")
    
    def validate_security_metrics(self) -> None:
        """Validate security metrics and KPIs."""
        content_lower = self.content.lower()
        
        # Security metrics patterns
        security_metrics = {
            "uptime_security": r'(\d+\.?\d*)%\s*uptime',
            "incident_response_time": r'(\d+)\s*(minute|hour|second)s?\s*(response|resolution)',
            "vulnerability_count": r'(\d+)\s*(vulnerability|vulnerabilities|CVE)',
            "compliance_score": r'(\d+\.?\d*)%\s*(complian|audit)',
            "security_scan_frequency": r'(daily|weekly|monthly)\s*(scan|security|audit)'
        }
        
        for metric, pattern in security_metrics.items():
            found = re.search(pattern, content_lower)
            self._add_result(f"security_metric_{metric}", bool(found),
                           f"{'Found' if found else 'Missing'} {metric} metric")
    
    def validate_security_file_references(self) -> None:
        """Validate security-related file references."""
        security_files = [
            "auth/",
            "security/",
            "tests/security/",
            "config/security",
            "kubernetes/security",
            "docker-config/",
            "observability/"
        ]
        
        for file_path in security_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                self._add_result(f"security_file_{file_path.replace('/', '_')}", True,
                               f"Security file/directory exists: {file_path}")
            else:
                self._add_result(f"security_file_{file_path.replace('/', '_')}", False,
                               f"Security file/directory missing: {file_path}")


class TestSecurityCompliance:
    """Test suite for security and HIPAA compliance validation."""
    
    @pytest.fixture
    def sample_security_content(self):
        """Sample security section content for testing."""
        return """
        # Security Architecture
        
        The Eyewear-ML platform implements comprehensive security measures to protect 
        protected health information (PHI) and ensure HIPAA compliance. Our security 
        architecture includes multiple layers of protection.
        
        ## Access Controls
        The platform uses role-based access control (RBAC) with least privilege 
        principles. All user authentication is handled through JWT tokens with 
        multi-factor authentication (MFA) support.
        
        ## Encryption
        All data is encrypted at rest using AES-256 encryption and in transit 
        using TLS 1.3. Database connections use encrypted channels with certificate 
        validation.
        
        ## Audit Trails
        Comprehensive audit logging tracks all access to patient data and system 
        resources. Audit trails are maintained for compliance monitoring and 
        incident response.
        
        ## HIPAA Compliance
        The platform maintains a business associate agreement (BAA) and implements 
        all required HIPAA safeguards. Breach notification procedures are in place 
        with incident response times under 30 minutes.
        
        ## Security Metrics
        - 99.9% uptime with security monitoring
        - Daily vulnerability scans with zero critical CVEs
        - 15-minute incident response time
        - SOC 2 Type II certification maintained
        """
    
    @pytest.fixture
    def security_validator(self, tmp_path, sample_security_content):
        """Create security validator with sample content."""
        report_file = tmp_path / "security_report.md"
        report_file.write_text(sample_security_content)
        return SecurityComplianceValidator(str(report_file), str(tmp_path))
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_security_section_exists(self, security_validator):
        """Security section must exist."""
        security_validator.load_report()
        security_validator.validate_security_compliance()
        
        result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "security_section_exists"), None
        )
        assert result is not None
        assert result.passed
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_hipaa_phi_protection(self, security_validator):
        """HIPAA PHI protection must be documented."""
        security_validator.load_report()
        security_validator.validate_security_compliance()
        
        result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "hipaa_phi_protection"), None
        )
        assert result is not None
        assert result.passed
        assert "Documented phi_protection" in result.message
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_hipaa_access_controls(self, security_validator):
        """HIPAA access controls must be documented."""
        security_validator.load_report()
        security_validator.validate_security_compliance()
        
        result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "hipaa_access_controls"), None
        )
        assert result is not None
        assert result.passed
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_hipaa_audit_trails(self, security_validator):
        """HIPAA audit trails must be documented."""
        security_validator.load_report()
        security_validator.validate_security_compliance()
        
        result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "hipaa_audit_trails"), None
        )
        assert result is not None
        assert result.passed
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_hipaa_encryption(self, security_validator):
        """HIPAA encryption requirements must be documented."""
        security_validator.load_report()
        security_validator.validate_security_compliance()
        
        result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "hipaa_encryption"), None
        )
        assert result is not None
        assert result.passed
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_hipaa_breach_notification(self, security_validator):
        """HIPAA breach notification procedures must be documented."""
        security_validator.load_report()
        security_validator.validate_security_compliance()
        
        result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "hipaa_breach_notification"), None
        )
        assert result is not None
        assert result.passed
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_hipaa_business_associate(self, security_validator):
        """HIPAA business associate agreement must be documented."""
        security_validator.load_report()
        security_validator.validate_security_compliance()
        
        result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "hipaa_business_associate"), None
        )
        assert result is not None
        assert result.passed
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_security_authentication(self, security_validator):
        """Authentication security must be documented."""
        security_validator.load_report()
        security_validator.validate_security_compliance()
        
        result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "security_authentication"), None
        )
        assert result is not None
        assert result.passed
    
    @pytest.mark.tdd
    @pytest.mark.security
    def test_security_metrics_validation(self, security_validator):
        """Security metrics must be present and validated."""
        security_validator.load_report()
        security_validator.validate_security_metrics()
        
        # Check for uptime metric
        uptime_result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "security_metric_uptime_security"), None
        )
        assert uptime_result is not None
        assert uptime_result.passed
        
        # Check for incident response time
        incident_result = next(
            (r for r in security_validator.validation_results 
             if r.test_name == "security_metric_incident_response_time"), None
        )
        assert incident_result is not None
        assert incident_result.passed
    
    @pytest.mark.tdd
    @pytest.mark.edge_case
    def test_missing_security_section(self, tmp_path):
        """Test behavior when security section is missing."""
        content_without_security = """
        # Platform Overview
        This report is missing a security section.
        """
        report_file = tmp_path / "no_security_report.md"
        report_file.write_text(content_without_security)
        
        validator = SecurityComplianceValidator(str(report_file), str(tmp_path))
        validator.load_report()
        validator.validate_security_compliance()
        
        result = next(
            (r for r in validator.validation_results 
             if r.test_name == "security_section_exists"), None
        )
        assert result is not None
        assert not result.passed
        assert "not found" in result.message
    
    @pytest.mark.tdd
    @pytest.mark.edge_case
    def test_insufficient_security_coverage(self, tmp_path):
        """Test detection of insufficient security coverage."""
        minimal_security = """
        # Security
        We have basic security measures in place.
        """
        report_file = tmp_path / "minimal_security_report.md"
        report_file.write_text(minimal_security)
        
        validator = SecurityComplianceValidator(str(report_file), str(tmp_path))
        validator.load_report()
        validator.validate_security_compliance()
        
        # Should fail most HIPAA requirements
        failed_requirements = [
            r for r in validator.validation_results 
            if not r.passed and r.test_name.startswith("hipaa_")
        ]
        assert len(failed_requirements) >= 4  # Most HIPAA requirements should fail
    
    @pytest.mark.tdd
    @pytest.mark.integration
    def test_security_architecture_validation(self, security_validator):
        """Test security architecture component validation."""
        security_validator.load_report()
        security_validator.validate_security_architecture()
        
        # Check that security architecture components are validated
        architecture_results = [
            r for r in security_validator.validation_results 
            if r.test_name.startswith("security_architecture_")
        ]
        assert len(architecture_results) >= 4  # Should validate multiple components