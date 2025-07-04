#!/usr/bin/env python3
"""
Test Implementation: aiGI Workflow and MCP Tools Integration
Addresses Issue 4 from reflection_LS2.md - lack of aiGI integration
"""

import pytest
import asyncio
import json
from datetime import datetime
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch
from dataclasses import dataclass, asdict
from typing import Dict, List, Any, Optional
from test_implementation_eyewear_ml import EyewearMLStatusReportValidator, ValidationResult


@dataclass
class MCPValidationContext:
    """Context for MCP-enhanced validation."""
    timestamp: str
    project_state: Dict[str, Any]
    previous_validations: List[Dict[str, Any]]
    external_links: List[str]
    mcp_tools_available: List[str]


@dataclass
class MemoryEntry:
    """Memory entry for validation history."""
    validation_id: str
    timestamp: str
    results: Dict[str, Any]
    context: MCPValidationContext
    performance_metrics: Dict[str, float]


class MockMCPClient:
    """Mock MCP client for testing aiGI integration."""
    
    def __init__(self):
        self.connected = False
        self.available_tools = [
            "analyze_code",
            "validate_external_links", 
            "get_project_state",
            "security_scan",
            "performance_analysis"
        ]
    
    async def connect(self) -> bool:
        """Mock MCP connection."""
        await asyncio.sleep(0.1)  # Simulate connection time
        self.connected = True
        return True
    
    async def get_project_state(self) -> Dict[str, Any]:
        """Mock project state retrieval."""
        return {
            "git_status": {
                "branch": "main",
                "commit": "abc123",
                "files_changed": 15,
                "uncommitted_changes": False
            },
            "dependencies": {
                "python_packages": 45,
                "npm_packages": 123,
                "outdated_packages": 3
            },
            "test_coverage": {
                "overall": 87.5,
                "critical_paths": 95.2,
                "last_run": "2025-05-27T05:16:00Z"
            },
            "security_scan": {
                "vulnerabilities": 0,
                "last_scan": "2025-05-27T04:00:00Z",
                "compliance_score": 98.5
            }
        }
    
    async def validate_external_links(self, links: List[str]) -> Dict[str, Dict[str, Any]]:
        """Mock external link validation."""
        results = {}
        for link in links:
            if "example.com" in link:
                results[link] = {
                    "status": "reachable",
                    "response_time": 250,
                    "status_code": 200,
                    "ssl_valid": True
                }
            else:
                results[link] = {
                    "status": "unreachable",
                    "response_time": None,
                    "status_code": 404,
                    "ssl_valid": None
                }
        return results
    
    async def analyze_code_quality(self, file_patterns: List[str]) -> Dict[str, Any]:
        """Mock code quality analysis."""
        return {
            "complexity_score": 6.5,
            "maintainability_index": 78.3,
            "technical_debt_hours": 12.5,
            "code_smells": 3,
            "security_hotspots": 1,
            "recommendations": [
                "Reduce cyclomatic complexity in recommendation engine",
                "Add type hints to legacy modules",
                "Update deprecated API usage"
            ]
        }
    
    async def disconnect(self) -> None:
        """Mock MCP disconnection."""
        self.connected = False


class MockMemoryManager:
    """Mock memory manager for validation history."""
    
    def __init__(self):
        self.memory_store: List[MemoryEntry] = []
    
    def store_validation_results(self, results: Dict[str, Any]) -> str:
        """Store validation results in memory."""
        validation_id = f"val_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        entry = MemoryEntry(
            validation_id=validation_id,
            timestamp=datetime.now().isoformat(),
            results=results,
            context=results.get("context", {}),
            performance_metrics=results.get("performance_metrics", {})
        )
        
        self.memory_store.append(entry)
        return validation_id
    
    def get_similar_validations(self, threshold: float = 0.8) -> List[Dict[str, Any]]:
        """Get similar validation results from memory."""
        # Mock similarity matching
        return [
            {
                "validation_id": "val_20250526_120000",
                "success_rate": 0.85,
                "common_failures": ["file_references", "security_metrics"],
                "recommendations": ["Update file paths", "Add security documentation"]
            }
        ]
    
    def get_performance_trends(self) -> Dict[str, List[float]]:
        """Get performance trends over time."""
        return {
            "execution_time": [15.2, 14.8, 16.1, 15.5, 14.9],
            "memory_usage": [45.2, 44.8, 46.1, 45.0, 44.5],
            "success_rate": [0.82, 0.85, 0.88, 0.87, 0.89]
        }


class AIGIIntegratedValidator(EyewearMLStatusReportValidator):
    """Enhanced validator with aiGI workflow integration."""
    
    def __init__(self, report_path: str, project_root: str = ".", 
                 mcp_client: Optional[MockMCPClient] = None,
                 memory_manager: Optional[MockMemoryManager] = None):
        super().__init__(report_path, project_root)
        self.mcp_client = mcp_client or MockMCPClient()
        self.memory_manager = memory_manager or MockMemoryManager()
        self.validation_context: Optional[MCPValidationContext] = None
    
    async def initialize_aigi_context(self) -> MCPValidationContext:
        """Initialize aiGI validation context."""
        await self.mcp_client.connect()
        
        project_state = await self.mcp_client.get_project_state()
        previous_validations = self.memory_manager.get_similar_validations()
        external_links = self.extract_external_links()
        
        self.validation_context = MCPValidationContext(
            timestamp=datetime.now().isoformat(),
            project_state=project_state,
            previous_validations=previous_validations,
            external_links=external_links,
            mcp_tools_available=self.mcp_client.available_tools
        )
        
        return self.validation_context
    
    def extract_external_links(self) -> List[str]:
        """Extract external links from report content."""
        import re
        
        # Pattern for external HTTP/HTTPS links
        external_pattern = r'https?://[^\s\)]+(?:\([^\)]*\))?[^\s\)]*'
        external_links = re.findall(external_pattern, self.content)
        
        return list(set(external_links))  # Remove duplicates
    
    async def validate_with_mcp_enhancement(self) -> Dict[str, Any]:
        """Run validation with MCP tool enhancement."""
        # Initialize aiGI context
        context = await self.initialize_aigi_context()
        
        # Run base validation
        base_results = self.run_comprehensive_validation()
        
        # Enhance with MCP validations
        mcp_enhancements = {}
        
        # Validate external links if any found
        if context.external_links:
            external_validation = await self.mcp_client.validate_external_links(
                context.external_links
            )
            mcp_enhancements["external_links"] = external_validation
        
        # Get code quality analysis
        code_quality = await self.mcp_client.analyze_code_quality(["*.py", "*.ts", "*.js"])
        mcp_enhancements["code_quality"] = code_quality
        
        # Combine results
        enhanced_results = {
            **base_results,
            "mcp_enhancements": mcp_enhancements,
            "validation_context": asdict(context),
            "aigi_integrated": True
        }
        
        # Store in memory for future learning
        validation_id = self.memory_manager.store_validation_results(enhanced_results)
        enhanced_results["validation_id"] = validation_id
        
        return enhanced_results
    
    async def validate_with_reflection(self) -> Dict[str, Any]:
        """Run validation with self-reflection capabilities."""
        results = await self.validate_with_mcp_enhancement()
        
        # Get performance trends
        performance_trends = self.memory_manager.get_performance_trends()
        
        # Analyze trends and generate insights
        reflection_insights = self._generate_reflection_insights(results, performance_trends)
        
        results["reflection_insights"] = reflection_insights
        return results
    
    def _generate_reflection_insights(self, current_results: Dict[str, Any], 
                                    performance_trends: Dict[str, List[float]]) -> Dict[str, Any]:
        """Generate self-reflection insights."""
        insights = {
            "performance_trend": "improving" if performance_trends["success_rate"][-1] > performance_trends["success_rate"][0] else "declining",
            "common_failure_patterns": [],
            "optimization_recommendations": [],
            "learning_applications": []
        }
        
        # Analyze current vs historical performance
        current_success_rate = current_results.get("success_rate", 0)
        avg_historical_rate = sum(performance_trends["success_rate"]) / len(performance_trends["success_rate"])
        
        if current_success_rate < avg_historical_rate:
            insights["optimization_recommendations"].append(
                "Current success rate below historical average - review failed validations"
            )
        
        # Extract patterns from failed tests
        failed_tests = [r for r in current_results.get("results", []) if not r.get("passed", True)]
        failure_categories = {}
        
        for test in failed_tests:
            category = test.get("test_name", "unknown").split("_")[0]
            failure_categories[category] = failure_categories.get(category, 0) + 1
        
        if failure_categories:
            insights["common_failure_patterns"] = list(failure_categories.keys())
            insights["optimization_recommendations"].append(
                f"Focus on improving: {', '.join(failure_categories.keys())}"
            )
        
        return insights


class TestAIGIIntegration:
    """Test suite for aiGI workflow and MCP tools integration."""
    
    @pytest.fixture
    def sample_report_with_links(self):
        """Sample report content with external links."""
        return """
        # Commercial Status Report
        
        ## Executive Summary
        The Eyewear-ML platform integrates with external services including:
        - Shopify API: https://example.com/shopify-docs
        - Payment processing: https://stripe.com/docs
        - Analytics: https://analytics.example.com
        
        ## Platform Overview
        Our virtual try-on technology leverages computer vision algorithms
        documented at https://opencv.org/documentation.
        
        ## Security
        We follow OWASP guidelines: https://owasp.org/security-guidelines
        """
    
    @pytest.fixture
    def aigi_validator(self, tmp_path, sample_report_with_links):
        """Create aiGI-integrated validator."""
        report_file = tmp_path / "aigi_report.md"
        report_file.write_text(sample_report_with_links)
        
        return AIGIIntegratedValidator(
            str(report_file), 
            str(tmp_path),
            MockMCPClient(),
            MockMemoryManager()
        )
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_mcp_client_connection(self, aigi_validator):
        """Test MCP client connection."""
        connected = await aigi_validator.mcp_client.connect()
        assert connected
        assert aigi_validator.mcp_client.connected
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_aigi_context_initialization(self, aigi_validator):
        """Test aiGI validation context initialization."""
        aigi_validator.load_report()
        context = await aigi_validator.initialize_aigi_context()
        
        assert context is not None
        assert context.timestamp is not None
        assert context.project_state is not None
        assert isinstance(context.external_links, list)
        assert len(context.external_links) > 0
        assert "analyze_code" in context.mcp_tools_available
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_external_link_extraction(self, aigi_validator):
        """Test extraction of external links from report."""
        aigi_validator.load_report()
        links = aigi_validator.extract_external_links()
        
        assert len(links) >= 4  # Should find at least 4 external links
        assert any("example.com" in link for link in links)
        assert any("stripe.com" in link for link in links)
        assert any("opencv.org" in link for link in links)
        assert any("owasp.org" in link for link in links)
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_mcp_enhanced_validation(self, aigi_validator):
        """Test validation with MCP enhancement."""
        aigi_validator.load_report()
        results = await aigi_validator.validate_with_mcp_enhancement()
        
        assert results["aigi_integrated"] is True
        assert "mcp_enhancements" in results
        assert "validation_context" in results
        assert "validation_id" in results
        
        # Check MCP enhancements
        mcp_enhancements = results["mcp_enhancements"]
        assert "external_links" in mcp_enhancements
        assert "code_quality" in mcp_enhancements
        
        # Verify external link validation
        external_results = mcp_enhancements["external_links"]
        assert len(external_results) > 0
        
        # Check code quality analysis
        code_quality = mcp_enhancements["code_quality"]
        assert "complexity_score" in code_quality
        assert "maintainability_index" in code_quality
        assert "recommendations" in code_quality
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_project_state_integration(self, aigi_validator):
        """Test project state integration."""
        aigi_validator.load_report()
        context = await aigi_validator.initialize_aigi_context()
        
        project_state = context.project_state
        assert "git_status" in project_state
        assert "dependencies" in project_state
        assert "test_coverage" in project_state
        assert "security_scan" in project_state
        
        # Verify git status
        git_status = project_state["git_status"]
        assert "branch" in git_status
        assert "commit" in git_status
        
        # Verify test coverage
        test_coverage = project_state["test_coverage"]
        assert "overall" in test_coverage
        assert test_coverage["overall"] > 0
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_memory_persistence(self, aigi_validator):
        """Test validation result persistence in memory."""
        aigi_validator.load_report()
        results = await aigi_validator.validate_with_mcp_enhancement()
        
        # Verify validation was stored in memory
        validation_id = results["validation_id"]
        assert validation_id is not None
        assert len(aigi_validator.memory_manager.memory_store) > 0
        
        # Check stored entry
        stored_entry = aigi_validator.memory_manager.memory_store[-1]
        assert stored_entry.validation_id == validation_id
        assert stored_entry.results == results
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_similar_validation_retrieval(self, aigi_validator):
        """Test retrieval of similar validation results."""
        aigi_validator.load_report()
        
        # Get similar validations
        similar = aigi_validator.memory_manager.get_similar_validations()
        
        assert isinstance(similar, list)
        if len(similar) > 0:
            assert "validation_id" in similar[0]
            assert "success_rate" in similar[0]
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_reflection_capabilities(self, aigi_validator):
        """Test self-reflection and learning capabilities."""
        aigi_validator.load_report()
        results = await aigi_validator.validate_with_reflection()
        
        assert "reflection_insights" in results
        
        insights = results["reflection_insights"]
        assert "performance_trend" in insights
        assert "optimization_recommendations" in insights
        assert "learning_applications" in insights
        
        # Verify insight quality
        assert insights["performance_trend"] in ["improving", "declining"]
        assert isinstance(insights["optimization_recommendations"], list)
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_performance_trend_analysis(self, aigi_validator):
        """Test performance trend analysis."""
        trends = aigi_validator.memory_manager.get_performance_trends()
        
        assert "execution_time" in trends
        assert "memory_usage" in trends
        assert "success_rate" in trends
        
        # Verify trend data structure
        for metric, values in trends.items():
            assert isinstance(values, list)
            assert len(values) > 0
            assert all(isinstance(v, (int, float)) for v in values)
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.aigi_integration
    async def test_mcp_tool_availability_check(self, aigi_validator):
        """Test MCP tool availability verification."""
        await aigi_validator.mcp_client.connect()
        
        available_tools = aigi_validator.mcp_client.available_tools
        expected_tools = [
            "analyze_code",
            "validate_external_links",
            "get_project_state",
            "security_scan",
            "performance_analysis"
        ]
        
        for tool in expected_tools:
            assert tool in available_tools
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.edge_case
    async def test_mcp_connection_failure_handling(self, tmp_path):
        """Test handling of MCP connection failures."""
        # Create validator with faulty MCP client
        class FailingMCPClient(MockMCPClient):
            async def connect(self):
                raise ConnectionError("MCP service unavailable")
        
        report_file = tmp_path / "test_report.md"
        report_file.write_text("# Test Report")
        
        validator = AIGIIntegratedValidator(
            str(report_file), 
            str(tmp_path),
            FailingMCPClient(),
            MockMemoryManager()
        )
        
        validator.load_report()
        
        # Should handle connection failure gracefully
        with pytest.raises(ConnectionError):
            await validator.initialize_aigi_context()
    
    @pytest.mark.tdd
    @pytest.mark.asyncio
    @pytest.mark.edge_case
    async def test_empty_external_links_handling(self, tmp_path):
        """Test handling when no external links are found."""
        content_no_links = """
        # Test Report
        This report has no external links.
        Just internal references and plain text.
        """
        
        report_file = tmp_path / "no_links_report.md"
        report_file.write_text(content_no_links)
        
        validator = AIGIIntegratedValidator(str(report_file), str(tmp_path))
        validator.load_report()
        
        links = validator.extract_external_links()
        assert len(links) == 0
        
        # Should still work with MCP enhancement
        results = await validator.validate_with_mcp_enhancement()
        assert results["aigi_integrated"] is True
        
        # External links enhancement should be empty or minimal
        mcp_enhancements = results["mcp_enhancements"]
        if "external_links" in mcp_enhancements:
            assert len(mcp_enhancements["external_links"]) == 0