"""
Commercial Status Report Test Configuration
Pytest configuration and shared fixtures
"""

import pytest
import os
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
import json


@pytest.fixture(scope="session")
def test_data_dir():
    """Fixture providing path to test data directory."""
    return Path(__file__).parent / "test_data"


@pytest.fixture(scope="session")
def sample_ls1_prompts():
    """Fixture providing sample LS1 prompt data for testing."""
    return {
        "LS1_01": {
            "title": "Executive Summary Development",
            "requirements": [
                "Concise overview of platform status",
                "Key performance metrics and achievements",
                "Strategic outlook and future direction",
                "Word count: 200-400 words"
            ]
        },
        "LS1_02": {
            "title": "Platform Overview Documentation",
            "requirements": [
                "Comprehensive system architecture description",
                "Core component documentation with file references",
                "Technology stack overview",
                "Integration points and dependencies"
            ]
        },
        "LS1_03": {
            "title": "CTO Technical Evaluation",
            "requirements": [
                "Technical architecture assessment",
                "Performance and scalability analysis",
                "Security posture evaluation",
                "Technical debt and improvement recommendations"
            ]
        },
        "LS1_04": {
            "title": "Core Features Analysis",
            "requirements": [
                "Detailed feature functionality descriptions",
                "User interaction workflows",
                "Performance metrics and benchmarks",
                "Feature adoption and usage statistics"
            ]
        },
        "LS1_05": {
            "title": "Security & Compliance Assessment",
            "requirements": [
                "Security framework documentation",
                "Compliance certification status",
                "Risk assessment and mitigation strategies",
                "Audit trail and monitoring capabilities"
            ]
        },
        "LS1_06": {
            "title": "Recent Activity Documentation",
            "requirements": [
                "Chronological activity timeline",
                "Recent deployments and updates",
                "Bug fixes and enhancements",
                "Performance improvements"
            ]
        },
        "LS1_07": {
            "title": "Assessment and Analysis",
            "requirements": [
                "Comprehensive platform evaluation",
                "Strengths and weaknesses analysis",
                "Competitive positioning",
                "Growth potential assessment"
            ]
        },
        "LS1_08": {
            "title": "Conclusion and Recommendations",
            "requirements": [
                "Summary of key findings",
                "Strategic recommendations",
                "Next steps and action items",
                "Risk mitigation strategies"
            ]
        }
    }


@pytest.fixture
def temp_workspace(tmp_path):
    """Fixture providing a temporary workspace with project structure."""
    workspace = tmp_path / "eyewear_ml_test"
    workspace.mkdir()
    
    # Create typical project directories
    directories = [
        "src/virtual_try_on",
        "src/recommendations", 
        "src/mongodb_foundation",
        "src/auth",
        "src/api",
        "docs/commercial_status",
        "tests",
        "config"
    ]
    
    for directory in directories:
        (workspace / directory).mkdir(parents=True, exist_ok=True)
    
    # Create sample files with content
    sample_files = {
        "src/virtual_try_on/service.py": """# Virtual Try-On Service
class VirtualTryOnService:
    def __init__(self):
        self.model = None
    
    def process_image(self, image):
        # Process virtual try-on
        pass
        
    def get_recommendations(self):
        # Get frame recommendations
        return []
""",
        "src/recommendations/service.py": """# Recommendation Service
class RecommendationService:
    def __init__(self):
        self.algorithm = "collaborative_filtering"
    
    def generate_recommendations(self, user_id):
        # Generate personalized recommendations
        return []
        
    def track_interaction(self, interaction):
        # Track user interactions
        pass
""",
        "src/mongodb_foundation/mongodb_client.py": """# MongoDB Foundation Client
import pymongo

class MongoDBClient:
    def __init__(self, connection_string):
        self.client = pymongo.MongoClient(connection_string)
        self.db = self.client.eyewear_ml
    
    def get_collection(self, name):
        return self.db[name]
        
    def insert_document(self, collection, document):
        return self.db[collection].insert_one(document)
"""
    }
    
    for file_path, content in sample_files.items():
        full_path = workspace / file_path
        full_path.write_text(content)
    
    return workspace


@pytest.fixture
def sample_report_sections():
    """Fixture providing sample content for each report section."""
    return {
        "executive_summary": """
The Eyewear ML Platform has demonstrated exceptional growth and technical excellence over the past quarter. 
Revenue increased by 45% compared to the previous quarter, driven by enhanced virtual try-on capabilities 
and improved recommendation algorithms. Key achievements include successful deployment of the MongoDB foundation 
layer, implementation of advanced security measures, and expansion of e-commerce integrations. The platform 
now serves over 50,000 active users with 99.8% uptime.

Looking forward, our strategic outlook focuses on expanding AI capabilities, enhancing mobile experience, 
and pursuing new market opportunities. The technical foundation is solid and scalable for future growth.
""",
        "platform_overview": """
The Eyewear ML Platform consists of several core components:

- **Virtual Try-On Service**: Powered by advanced computer vision algorithms - [`virtual_try_on.py`](src/virtual_try_on/service.py:45)
- **Recommendation Engine**: AI-driven personalized recommendations - [`recommendation_service.py`](src/recommendations/service.py:123)
- **Analytics Platform**: Comprehensive data analytics and reporting
- **E-commerce Integrations**: Seamless integration with Shopify, WooCommerce, and Magento
- **User Management**: Secure authentication and authorization system
- **MongoDB Foundation**: Scalable data storage and management - [`mongodb_client.py`](src/mongodb_foundation/mongodb_client.py:67)
- **API Gateway**: Centralized API management and routing

All components are containerized and deployed using Kubernetes for maximum scalability and reliability.
""",
        "security_compliance": """
The platform maintains a strong security posture with comprehensive encryption, access control, and audit logging. 
All data is encrypted at rest and in transit using AES-256 encryption. The platform implements OAuth 2.0 for 
authentication and RBAC for authorization. Regular vulnerability assessments are conducted using automated 
scanning tools, and the platform complies with SOC 2 Type II and ISO 27001 standards.

Key security measures include:
- Multi-factor authentication for all admin accounts
- Regular security audits and penetration testing
- Automated vulnerability scanning and patch management
- Comprehensive audit logging and monitoring
- Data anonymization and privacy controls
- GDPR and CCPA compliance frameworks
""",
        "recent_activity": """
Recent platform activity and improvements:

- **2025-05-25**: Deployed enhanced recommendation algorithm with 15% accuracy improvement
- **2025-05-20**: Implemented MongoDB performance optimizations reducing query time by 30%
- **2025-05-15**: Security audit completed with zero critical findings
- **2025-05-10**: Virtual try-on mobile experience enhancement deployed
- **2025-05-05**: New e-commerce integration with BigCommerce launched
- **2025-05-01**: Database migration to MongoDB Atlas completed successfully
"""
    }


@pytest.fixture
def mock_file_system(monkeypatch):
    """Fixture providing mock file system operations."""
    def mock_exists(path):
        # Mock that common project files exist
        common_files = [
            "src/virtual_try_on/service.py",
            "src/recommendations/service.py",
            "src/mongodb_foundation/mongodb_client.py",
            "README.md",
            "package.json",
            "requirements.txt"
        ]
        return any(str(path).endswith(file) for file in common_files)
    
    def mock_open_file(*args, **kwargs):
        # Mock file content based on file path
        file_path = str(args[0]) if args else ""
        
        if "service.py" in file_path:
            content = ["# Service implementation\n"] * 150
        elif "mongodb_client.py" in file_path:
            content = ["# MongoDB client implementation\n"] * 200
        else:
            content = ["# Default file content\n"] * 100
            
        mock_file = Mock()
        mock_file.__enter__ = Mock(return_value=mock_file)
        mock_file.__exit__ = Mock(return_value=None)
        mock_file.readlines = Mock(return_value=content)
        mock_file.read = Mock(return_value="".join(content))
        return mock_file
    
    monkeypatch.setattr(os.path, 'exists', mock_exists)
    monkeypatch.setattr('builtins.open', mock_open_file)


@pytest.fixture
def validation_criteria():
    """Fixture providing validation criteria for different report sections."""
    return {
        "executive_summary": {
            "min_words": 200,
            "max_words": 400,
            "required_keywords": ["growth", "revenue", "achievements", "outlook", "platform"],
            "required_metrics": ["percentage", "users", "uptime"]
        },
        "platform_overview": {
            "required_components": [
                "virtual try-on", "recommendation", "analytics", 
                "e-commerce", "authentication", "database", "api"
            ],
            "min_components": 5,
            "file_reference_format": r'\[`[^`]+`\]\([^)]+:\d+\)'
        },
        "security_compliance": {
            "required_topics": [
                "encryption", "authentication", "authorization", 
                "audit", "compliance", "vulnerability"
            ],
            "required_standards": ["SOC", "ISO", "GDPR", "CCPA"],
            "min_security_measures": 3
        },
        "file_references": {
            "valid_extensions": [".py", ".js", ".ts", ".java", ".go", ".md", ".json", ".yaml"],
            "format_pattern": r'\[`[^`]+`\]\([^)]+(?::\d+)?\)',
            "line_number_pattern": r':(\d+)'
        },
        "data_freshness": {
            "max_age_days": 30,
            "timestamp_patterns": [
                r'\*\*(\d{4}-\d{2}-\d{2})\*\*',
                r'(\d{4}-\d{2}-\d{2})',
                r'Updated:\s*(\d{4}-\d{2}-\d{2})',
                r'Last update:\s*(\d{4}-\d{2}-\d{2})'
            ]
        },
        "markdown_structure": {
            "max_header_depth": 4,
            "required_sections": [
                "Executive Summary", "Platform Overview", "Security", 
                "Recent Activity", "Assessment", "Conclusion"
            ],
            "min_sections": 6
        }
    }


@pytest.fixture
def mock_http_responses():
    """Fixture providing mock HTTP responses for external link validation."""
    def mock_request_head(url, **kwargs):
        response = Mock()
        
        # Simulate different response scenarios
        if "google.com" in url or "github.com" in url:
            response.status_code = 200
        elif "broken-link" in url or "nonexistent" in url:
            response.status_code = 404
        elif "timeout" in url:
            raise Exception("Request timeout")
        else:
            response.status_code = 200
            
        return response
    
    return mock_request_head


@pytest.fixture(scope="session")
def expected_test_counts():
    """Fixture providing expected test counts for comprehensive validation."""
    return {
        "executive_summary": 8,  # word count, keywords, metrics, etc.
        "platform_overview": 6,  # components, architecture, integrations
        "file_references": 12,   # format, existence, line numbers
        "security_compliance": 10, # topics, standards, measures
        "data_freshness": 4,     # timestamps, age validation
        "markdown_structure": 8, # headers, sections, formatting
        "external_links": 5,     # accessibility, format validation
        "supplemental_files": 3, # stub creation, file management
        "minimum_total": 45      # Minimum total test count
    }


@pytest.fixture
def cleanup_test_files():
    """Fixture for cleaning up test-generated files."""
    created_files = []
    
    def register_file(file_path):
        created_files.append(file_path)
    
    yield register_file
    
    # Cleanup after test
    for file_path in created_files:
        try:
            if os.path.exists(file_path):
                if os.path.isdir(file_path):
                    shutil.rmtree(file_path)
                else:
                    os.remove(file_path)
        except Exception:
            pass  # Ignore cleanup errors


@pytest.fixture
def performance_benchmarks():
    """Fixture providing performance benchmarks for validation tests."""
    return {
        "max_validation_time_seconds": 30,
        "max_memory_usage_mb": 100,
        "max_file_size_mb": 10,
        "concurrent_validation_limit": 5
    }


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers and settings."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )
    config.addinivalue_line(
        "markers", "tdd: marks tests following TDD principles"
    )


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers automatically."""
    for item in items:
        # Add TDD marker to all tests in this suite
        item.add_marker(pytest.mark.tdd)
        
        # Add integration marker to tests that use external resources
        if any(fixture in item.fixturenames for fixture in ['mock_http_responses', 'temp_workspace']):
            item.add_marker(pytest.mark.integration)
        else:
            item.add_marker(pytest.mark.unit)
            
        # Add slow marker to comprehensive tests
        if 'comprehensive' in item.name.lower():
            item.add_marker(pytest.mark.slow)