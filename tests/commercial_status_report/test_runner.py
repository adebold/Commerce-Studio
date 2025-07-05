#!/usr/bin/env python3
"""
Eyewear-ML Commercial Status Report - TDD Test Runner
Pytest-based test suite for validating the commercial status report
"""

import pytest
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
from test_implementation_eyewear_ml import EyewearMLStatusReportValidator


class TestEyewearMLCommercialStatusReport:
    """TDD test suite for Eyewear-ML Commercial Status Report validation."""
    
    @pytest.fixture(autouse=True)
    def setup_validator(self):
        """Setup validator for all tests."""
        self.report_path = "docs/commercial_status/Eyewear_ML_Commercial_Status_Report.md"
        self.validator = EyewearMLStatusReportValidator(self.report_path, ".")
        
        # Load report for tests
        if not self.validator.load_report():
            pytest.skip("Report file not found - skipping validation tests")
    
    @pytest.mark.tdd
    @pytest.mark.unit
    def test_report_file_exists(self):
        """Test that the commercial status report file exists."""
        assert Path(self.report_path).exists(), f"Report file {self.report_path} does not exist"
    
    @pytest.mark.tdd
    @pytest.mark.unit
    def test_report_not_empty(self):
        """Test that the report file is not empty."""
        assert len(self.validator.content) > 100, "Report content is too short"
    
    # Executive Summary Tests
    @pytest.mark.tdd
    @pytest.mark.executive_summary
    def test_executive_summary_exists(self):
        """Test that Executive Summary section exists."""
        self.validator.validate_executive_summary()
        result = next((r for r in self.validator.validation_results 
                      if r.test_name == "executive_summary_exists"), None)
        assert result and result.passed, "Executive Summary section missing"
    
    @pytest.mark.tdd
    @pytest.mark.executive_summary
    def test_executive_summary_word_count(self):
        """Test that Executive Summary has appropriate word count."""
        section = self.validator._extract_section("Executive Summary")
        word_count = len(section.split())
        assert 200 <= word_count <= 400, f"Executive Summary word count {word_count} not in range 200-400"
    
    @pytest.mark.tdd
    @pytest.mark.executive_summary
    def test_executive_summary_eyewear_ml_content(self):
        """Test that Executive Summary contains eyewear-ml specific content."""
        section = self.validator._extract_section("Executive Summary")
        
        # Check for key eyewear-ml concepts
        eyewear_concepts = [
            "virtual try-on", "recommendation", "e-commerce", 
            "AI", "machine learning", "eyewear"
        ]
        
        concepts_found = sum(1 for concept in eyewear_concepts 
                           if concept.lower() in section.lower())
        assert concepts_found >= 3, f"Only {concepts_found}/6 eyewear-ml concepts found in Executive Summary"
    
    # Platform Overview Tests
    @pytest.mark.tdd
    @pytest.mark.platform_overview
    def test_platform_overview_exists(self):
        """Test that Platform Overview section exists."""
        section = self.validator._extract_section("Platform Overview")
        assert section, "Platform Overview section not found"
    
    @pytest.mark.tdd
    @pytest.mark.platform_overview
    def test_platform_components_documented(self):
        """Test that all major platform components are documented."""
        section = self.validator._extract_section("Platform Overview")
        
        required_components = [
            "virtual try-on", "recommendation", "mongodb", 
            "authentication", "frontend", "API"
        ]
        
        components_found = sum(1 for component in required_components 
                             if component.lower() in section.lower())
        assert components_found >= 4, f"Only {components_found}/6 components documented"
    
    # File Reference Tests
    @pytest.mark.tdd
    @pytest.mark.file_references
    def test_file_references_exist(self):
        """Test that file references exist in the report."""
        import re
        file_ref_pattern = r'\[`([^`]+)`\]\(([^)]+)(?::(\d+))?\)'
        matches = re.findall(file_ref_pattern, self.validator.content)
        assert len(matches) >= 5, f"Only {len(matches)} file references found (minimum 5 required)"
    
    @pytest.mark.tdd
    @pytest.mark.file_references
    def test_referenced_files_exist(self):
        """Test that referenced files actually exist in the project."""
        import re
        file_ref_pattern = r'\[`([^`]+)`\]\(([^)]+)(?::(\d+))?\)'
        matches = re.findall(file_ref_pattern, self.validator.content)
        
        missing_files = []
        for filename, file_path, line_number in matches:
            full_path = Path(file_path)
            if not full_path.exists():
                missing_files.append(file_path)
        
        if missing_files:
            pytest.fail(f"Referenced files do not exist: {missing_files}")
    
    @pytest.mark.tdd
    @pytest.mark.file_references
    def test_critical_files_referenced(self):
        """Test that critical eyewear-ml files are referenced."""
        critical_files = [
            "mongodb_foundation", "virtual_try_on", "recommendations",
            "frontend", "tests", "kubernetes"
        ]
        
        critical_refs_found = sum(1 for file_ref in critical_files 
                                if file_ref in self.validator.content)
        assert critical_refs_found >= 3, f"Only {critical_refs_found}/6 critical file areas referenced"
    
    # Data Freshness Tests
    @pytest.mark.tdd
    @pytest.mark.data_freshness
    def test_timestamps_present(self):
        """Test that timestamps are present in the report."""
        import re
        timestamp_patterns = [
            r'\*\*(\d{4}-\d{2}-\d{2})\*\*',
            r'(\d{4}-\d{2}-\d{2})',
            r'Updated:\s*(\d{4}-\d{2}-\d{2})'
        ]
        
        all_timestamps = []
        for pattern in timestamp_patterns:
            matches = re.findall(pattern, self.validator.content)
            all_timestamps.extend(matches)
        
        assert len(all_timestamps) >= 3, f"Only {len(all_timestamps)} timestamps found (minimum 3 required)"
    
    @pytest.mark.tdd
    @pytest.mark.data_freshness
    def test_data_freshness(self):
        """Test that data in the report is fresh (within 30 days)."""
        import re
        
        date_pattern = r'\*\*(\d{4}-\d{2}-\d{2})\*\*'
        dates = re.findall(date_pattern, self.validator.content)
        
        if dates:
            latest_date_str = max(dates)
            latest_date = datetime.strptime(latest_date_str, '%Y-%m-%d')
            age_days = (datetime.now() - latest_date).days
            
            assert age_days <= 30, f"Latest date {latest_date_str} is {age_days} days old (max 30 days)"
    
    # Security & Compliance Tests
    @pytest.mark.tdd
    @pytest.mark.security_compliance
    def test_security_section_exists(self):
        """Test that Security & Compliance section exists."""
        section = (self.validator._extract_section("Security") or 
                  self.validator._extract_section("Security & Compliance") or
                  self.validator._extract_section("Compliance"))
        assert section, "Security & Compliance section not found"
    
    @pytest.mark.tdd
    @pytest.mark.security_compliance
    def test_security_topics_covered(self):
        """Test that key security topics are covered."""
        section = (self.validator._extract_section("Security") or 
                  self.validator._extract_section("Security & Compliance") or
                  self.validator._extract_section("Compliance"))
        
        security_topics = [
            "authentication", "encryption", "compliance", 
            "vulnerability", "audit", "monitoring"
        ]
        
        topics_covered = sum(1 for topic in security_topics 
                           if topic.lower() in section.lower())
        assert topics_covered >= 3, f"Only {topics_covered}/6 security topics covered"
    
    # Markdown Structure Tests
    @pytest.mark.tdd
    @pytest.mark.markdown_structure
    def test_header_hierarchy_valid(self):
        """Test that markdown header hierarchy is valid."""
        import re
        headers = re.findall(r'^(#{1,6})\s+(.+)$', self.validator.content, re.MULTILINE)
        
        assert len(headers) >= 5, f"Only {len(headers)} headers found (minimum 5 required)"
        
        # Check if starts with H1
        if headers:
            first_header_level = len(headers[0][0])
            assert first_header_level == 1, f"Document starts with H{first_header_level} (should be H1)"
    
    @pytest.mark.tdd
    @pytest.mark.markdown_structure
    def test_code_blocks_balanced(self):
        """Test that code blocks are properly balanced."""
        code_block_count = self.validator.content.count('```')
        assert code_block_count % 2 == 0, f"Unbalanced code blocks: {code_block_count} backticks found"
    
    # Performance Tests
    @pytest.mark.tdd
    @pytest.mark.performance
    @pytest.mark.slow
    def test_validation_performance(self):
        """Test that comprehensive validation completes within time limits."""
        import time
        start_time = time.time()
        
        results = self.validator.run_comprehensive_validation()
        
        execution_time = time.time() - start_time
        assert execution_time <= 30, f"Validation took {execution_time:.2f}s (max 30s)"
        assert results['status'] == 'completed', "Validation did not complete successfully"
    
    # Integration Tests
    @pytest.mark.tdd
    @pytest.mark.integration
    def test_comprehensive_validation_success_rate(self):
        """Test that comprehensive validation has acceptable success rate."""
        results = self.validator.run_comprehensive_validation()
        
        success_rate = results.get('success_rate', 0)
        assert success_rate >= 0.8, f"Validation success rate {success_rate:.1%} below 80% threshold"
    
    @pytest.mark.tdd
    @pytest.mark.integration
    def test_report_generation_complete(self):
        """Test that validation report can be generated successfully."""
        report = self.validator.generate_validation_report()
        
        assert len(report) > 500, "Generated validation report is too short"
        assert "# Eyewear-ML Commercial Status Report" in report, "Report missing expected header"
        assert "## Summary" in report, "Report missing summary section"
        assert "## Test Results" in report, "Report missing test results section"


# Custom pytest configuration for this test suite
def pytest_configure(config):
    """Configure pytest for eyewear-ml commercial status report tests."""
    config.addinivalue_line(
        "markers", "tdd: Test-driven development tests"
    )
    config.addinivalue_line(
        "markers", "executive_summary: Executive summary validation tests"
    )
    config.addinivalue_line(
        "markers", "platform_overview: Platform overview validation tests"
    )
    config.addinivalue_line(
        "markers", "file_references: File reference validation tests"
    )
    config.addinivalue_line(
        "markers", "data_freshness: Data freshness validation tests"
    )
    config.addinivalue_line(
        "markers", "security_compliance: Security and compliance tests"
    )
    config.addinivalue_line(
        "markers", "markdown_structure: Markdown structure validation tests"
    )
    config.addinivalue_line(
        "markers", "performance: Performance validation tests"
    )
    config.addinivalue_line(
        "markers", "slow: Long-running tests"
    )


if __name__ == "__main__":
    """Run tests directly with this module."""
    pytest.main([__file__, "-v", "--tb=short"])