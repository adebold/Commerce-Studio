#!/usr/bin/env python3
"""
Test Implementation: Standardized Metrics Framework with Automated Threshold Gating
Addresses LS4_02 - Quantitative Metrics Standardization & Performance Gating
Target: Score 7 → 8.5+ through standardized outputs and automated gating
"""

import pytest
import json
import time
from dataclasses import dataclass, asdict, field
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
from datetime import datetime, timedelta
from enum import Enum
from unittest.mock import Mock, patch
import statistics


class MetricType(Enum):
    """Standardized metric types."""
    PERFORMANCE = "performance"
    SECURITY = "security"
    COMPLIANCE = "compliance"
    QUALITY = "quality"
    AVAILABILITY = "availability"
    EFFICIENCY = "efficiency"


class ThresholdResult(Enum):
    """Threshold validation results."""
    PASS = "pass"
    FAIL = "fail"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class MetricThreshold:
    """Standardized metric threshold definition."""
    metric_name: str
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    target_value: Optional[float] = None
    tolerance_percentage: float = 5.0
    severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL
    enabled: bool = True


@dataclass
class StandardizedMetric:
    """Standardized metric with consistent schema."""
    name: str
    value: Union[float, int, str, bool]
    unit: str
    metric_type: MetricType
    timestamp: str
    source: str
    tags: Dict[str, str] = field(default_factory=dict)
    threshold: Optional[MetricThreshold] = None
    historical_values: List[float] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary with consistent schema."""
        return {
            "schema_version": "v2.1",
            "metric": {
                "name": self.name,
                "value": self.value,
                "unit": self.unit,
                "type": self.metric_type.value,
                "timestamp": self.timestamp,
                "source": self.source,
                "tags": self.tags,
                "threshold": asdict(self.threshold) if self.threshold else None,
                "historical_values": self.historical_values
            }
        }


@dataclass
class MetricsValidationReport:
    """Comprehensive metrics validation report."""
    schema_version: str
    validation_timestamp: str
    total_metrics: int
    schema_compliant_metrics: int
    threshold_violations: List[Dict[str, Any]]
    performance_regression_count: int
    overall_health_score: float
    gating_decision: str  # PASS, FAIL, WARNING
    metrics_summary: Dict[str, Any]
    recommendations: List[str]


class MetricsStandardizationFramework:
    """Framework for standardized metric outputs and automated gating."""
    
    def __init__(self, config_path: Optional[str] = None):
        self.schema_version = "v2.1"
        self.metrics_registry: Dict[str, StandardizedMetric] = {}
        self.thresholds: Dict[str, MetricThreshold] = {}
        self.historical_data: Dict[str, List[float]] = {}
        self.validation_history: List[MetricsValidationReport] = []
        self._load_configuration(config_path)
    
    def _load_configuration(self, config_path: Optional[str]) -> None:
        """Load metrics configuration."""
        # Default thresholds for common metrics
        self.thresholds = {
            "response_time_ms": MetricThreshold(
                metric_name="response_time_ms",
                max_value=2000.0,
                target_value=500.0,
                tolerance_percentage=10.0,
                severity="HIGH"
            ),
            "error_rate_percent": MetricThreshold(
                metric_name="error_rate_percent",
                max_value=1.0,
                target_value=0.1,
                tolerance_percentage=0.0,
                severity="CRITICAL"
            ),
            "security_score": MetricThreshold(
                metric_name="security_score",
                min_value=8.0,
                target_value=9.0,
                tolerance_percentage=5.0,
                severity="HIGH"
            ),
            "compliance_score": MetricThreshold(
                metric_name="compliance_score",
                min_value=8.5,
                target_value=9.5,
                tolerance_percentage=2.0,
                severity="CRITICAL"
            )
        }
    
    def register_metric(self, metric: StandardizedMetric) -> bool:
        """Register a metric with the framework."""
        try:
            # Validate metric schema
            if not self._validate_metric_schema(metric):
                return False
            
            # Add historical data if available
            if metric.name in self.historical_data:
                metric.historical_values = self.historical_data[metric.name][-10:]
            
            # Add threshold if configured
            if metric.name in self.thresholds:
                metric.threshold = self.thresholds[metric.name]
            
            self.metrics_registry[metric.name] = metric
            
            # Update historical data
            if isinstance(metric.value, (int, float)):
                if metric.name not in self.historical_data:
                    self.historical_data[metric.name] = []
                self.historical_data[metric.name].append(float(metric.value))
                self.historical_data[metric.name] = self.historical_data[metric.name][-50:]
            
            return True
        except Exception:
            return False
    
    def _validate_metric_schema(self, metric: StandardizedMetric) -> bool:
        """Validate metric against standardized schema."""
        required_fields = ['name', 'value', 'unit', 'metric_type', 'timestamp', 'source']
        
        for field in required_fields:
            if not hasattr(metric, field) or getattr(metric, field) is None:
                return False
        
        # Validate timestamp format
        try:
            datetime.fromisoformat(metric.timestamp.replace('Z', '+00:00'))
        except ValueError:
            return False
        
        # Validate metric type
        if not isinstance(metric.metric_type, MetricType):
            return False
        
        return True
    
    def validate_all_metrics(self) -> MetricsValidationReport:
        """Validate all registered metrics and generate comprehensive report."""
        validation_timestamp = datetime.now().isoformat()
        total_metrics = len(self.metrics_registry)
        schema_compliant_count = 0
        threshold_violations = []
        regression_count = 0
        recommendations = []
        
        # Validate schema compliance
        for metric_name, metric in self.metrics_registry.items():
            if self._validate_metric_schema(metric):
                schema_compliant_count += 1
            
            # Check threshold violations
            violation = self._check_threshold_violation(metric)
            if violation:
                threshold_violations.append(violation)
            
            # Check for performance regression
            if self._detect_performance_regression(metric):
                regression_count += 1
                recommendations.append(f"Performance regression detected in {metric_name}")
        
        # Calculate overall health score
        health_score = self._calculate_overall_health_score(threshold_violations, regression_count)
        
        # Determine gating decision
        gating_decision = self._make_gating_decision(threshold_violations, health_score)
        
        # Generate metrics summary
        metrics_summary = self._generate_metrics_summary()
        
        # Generate recommendations
        recommendations.extend(self._generate_optimization_recommendations(threshold_violations))
        
        report = MetricsValidationReport(
            schema_version=self.schema_version,
            validation_timestamp=validation_timestamp,
            total_metrics=total_metrics,
            schema_compliant_metrics=schema_compliant_count,
            threshold_violations=threshold_violations,
            performance_regression_count=regression_count,
            overall_health_score=health_score,
            gating_decision=gating_decision,
            metrics_summary=metrics_summary,
            recommendations=recommendations
        )
        
        self.validation_history.append(report)
        return report
    
    def _check_threshold_violation(self, metric: StandardizedMetric) -> Optional[Dict[str, Any]]:
        """Check if metric violates configured thresholds."""
        if not metric.threshold or not isinstance(metric.value, (int, float)):
            return None
        
        threshold = metric.threshold
        value = float(metric.value)
        violation = None
        
        # Check minimum threshold
        if threshold.min_value is not None and value < threshold.min_value:
            violation = {
                "metric_name": metric.name,
                "violation_type": "min_threshold",
                "actual_value": value,
                "threshold_value": threshold.min_value,
                "severity": threshold.severity,
                "deviation_percent": ((threshold.min_value - value) / threshold.min_value) * 100
            }
        
        # Check maximum threshold
        elif threshold.max_value is not None and value > threshold.max_value:
            violation = {
                "metric_name": metric.name,
                "violation_type": "max_threshold",
                "actual_value": value,
                "threshold_value": threshold.max_value,
                "severity": threshold.severity,
                "deviation_percent": ((value - threshold.max_value) / threshold.max_value) * 100
            }
        
        return violation
    
    def _detect_performance_regression(self, metric: StandardizedMetric) -> bool:
        """Detect performance regression using historical data."""
        if (not isinstance(metric.value, (int, float)) or 
            len(metric.historical_values) < 3):
            return False
        
        current_value = float(metric.value)
        recent_values = metric.historical_values[-5:]
        
        if len(recent_values) < 3:
            return False
        
        avg_recent = statistics.mean(recent_values)
        
        # For metrics where lower is better
        lower_is_better_metrics = ["response_time", "error_rate"]
        
        if any(term in metric.name.lower() for term in lower_is_better_metrics):
            return current_value > avg_recent * 1.2  # 20% increase
        else:
            return current_value < avg_recent * 0.8  # 20% decrease
    
    def _calculate_overall_health_score(self, violations: List[Dict[str, Any]], 
                                      regression_count: int) -> float:
        """Calculate overall system health score."""
        base_score = 100.0
        
        for violation in violations:
            if violation["severity"] == "CRITICAL":
                base_score -= 20.0
            elif violation["severity"] == "HIGH":
                base_score -= 10.0
            elif violation["severity"] == "MEDIUM":
                base_score -= 5.0
            else:
                base_score -= 2.0
        
        base_score -= regression_count * 5.0
        return max(0.0, base_score)
    
    def _make_gating_decision(self, violations: List[Dict[str, Any]], 
                            health_score: float) -> str:
        """Make automated gating decision for CI/CD pipeline."""
        critical_violations = [v for v in violations if v["severity"] == "CRITICAL"]
        
        if critical_violations:
            return "FAIL"
        elif health_score < 70.0:
            return "FAIL"
        elif health_score < 85.0:
            return "WARNING"
        else:
            return "PASS"
    
    def _generate_metrics_summary(self) -> Dict[str, Any]:
        """Generate comprehensive metrics summary."""
        summary = {"by_type": {}, "by_severity": {}}
        
        for metric in self.metrics_registry.values():
            metric_type = metric.metric_type.value
            if metric_type not in summary["by_type"]:
                summary["by_type"][metric_type] = 0
            summary["by_type"][metric_type] += 1
        
        return summary
    
    def _generate_optimization_recommendations(self, violations: List[Dict[str, Any]]) -> List[str]:
        """Generate optimization recommendations based on violations."""
        recommendations = []
        
        for violation in violations:
            if violation["severity"] == "CRITICAL":
                recommendations.append(f"URGENT: Address critical {violation['metric_name']} violation")
            elif violation.get("deviation_percent", 0) > 50:
                recommendations.append(f"Significant deviation in {violation['metric_name']}")
        
        return recommendations


class PerformanceThresholdManager:
    """Advanced performance threshold management with automated gating."""
    
    def __init__(self, framework: MetricsStandardizationFramework):
        self.framework = framework
        self.gating_rules: Dict[str, Any] = {}
    
    def configure_automated_gating(self, sensitivity: str = "medium") -> Dict[str, Any]:
        """Configure automated gating with specified sensitivity."""
        sensitivity_configs = {
            "low": {
                "critical_threshold_failure_limit": 1,
                "high_threshold_failure_limit": 3,
                "health_score_minimum": 60.0
            },
            "medium": {
                "critical_threshold_failure_limit": 0,
                "high_threshold_failure_limit": 2,
                "health_score_minimum": 70.0
            },
            "high": {
                "critical_threshold_failure_limit": 0,
                "high_threshold_failure_limit": 1,
                "health_score_minimum": 80.0
            }
        }
        
        config = sensitivity_configs.get(sensitivity, sensitivity_configs["medium"])
        self.gating_rules = config
        return config
    
    def apply_threshold_gates(self, metrics_report: MetricsValidationReport) -> Dict[str, Any]:
        """Apply threshold gating rules and return gating decision."""
        critical_violations = [
            v for v in metrics_report.threshold_violations 
            if v["severity"] == "CRITICAL"
        ]
        high_violations = [
            v for v in metrics_report.threshold_violations 
            if v["severity"] == "HIGH"
        ]
        
        gating_result = {
            "decision": "PASS",
            "reasons": [],
            "critical_violations": len(critical_violations),
            "high_violations": len(high_violations),
            "health_score": metrics_report.overall_health_score
        }
        
        # Apply gating rules
        if len(critical_violations) > self.gating_rules.get("critical_threshold_failure_limit", 0):
            gating_result["decision"] = "FAIL"
            gating_result["reasons"].append(f"Too many critical violations: {len(critical_violations)}")
        
        if len(high_violations) > self.gating_rules.get("high_threshold_failure_limit", 2):
            if gating_result["decision"] != "FAIL":
                gating_result["decision"] = "WARNING"
            gating_result["reasons"].append(f"Too many high severity violations: {len(high_violations)}")
        
        if metrics_report.overall_health_score < self.gating_rules.get("health_score_minimum", 70.0):
            gating_result["decision"] = "FAIL"
            gating_result["reasons"].append(f"Health score too low: {metrics_report.overall_health_score}")
        
        return gating_result


class TestStandardizedMetricsFramework:
    """Test suite for standardized metrics framework."""
    
    @pytest.fixture
    def metrics_framework(self):
        """Create metrics framework instance."""
        return MetricsStandardizationFramework()
    
    @pytest.fixture
    def sample_metrics(self):
        """Create sample standardized metrics."""
        return [
            StandardizedMetric(
                name="response_time_ms",
                value=750.5,
                unit="milliseconds",
                metric_type=MetricType.PERFORMANCE,
                timestamp=datetime.now().isoformat(),
                source="api_gateway",
                tags={"service": "eyewear-ml", "environment": "production"}
            ),
            StandardizedMetric(
                name="error_rate_percent",
                value=0.5,
                unit="percent",
                metric_type=MetricType.QUALITY,
                timestamp=datetime.now().isoformat(),
                source="monitoring_system",
                tags={"service": "recommendation_engine"}
            ),
            StandardizedMetric(
                name="security_score",
                value=8.5,
                unit="score",
                metric_type=MetricType.SECURITY,
                timestamp=datetime.now().isoformat(),
                source="security_scanner"
            )
        ]
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.standardization
    def test_metric_schema_validation(self, metrics_framework, sample_metrics):
        """Test 100% consistent metric schema validation."""
        for metric in sample_metrics:
            result = metrics_framework.register_metric(metric)
            assert result is True
            
            # Verify schema compliance
            assert metrics_framework._validate_metric_schema(metric)
            
            # Verify standardized output format
            metric_dict = metric.to_dict()
            assert metric_dict["schema_version"] == "v2.1"
            assert "metric" in metric_dict
            assert all(field in metric_dict["metric"] for field in [
                "name", "value", "unit", "type", "timestamp", "source"
            ])
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.standardization
    def test_standardized_output_format_consistency(self, metrics_framework, sample_metrics):
        """Test 100% consistent format across all validation outputs."""
        # Register multiple metrics
        for metric in sample_metrics:
            metrics_framework.register_metric(metric)
        
        # Validate all metrics
        report = metrics_framework.validate_all_metrics()
        
        # Verify report schema consistency
        assert report.schema_version == "v2.1"
        assert hasattr(report, 'validation_timestamp')
        assert hasattr(report, 'metrics_summary')
        assert hasattr(report, 'gating_decision')
        
        # Verify format consistency across metrics
        format_consistency_score = report.schema_compliant_metrics / report.total_metrics
        assert format_consistency_score == 1.0  # 100% consistency
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.gating
    def test_automated_threshold_gating(self, metrics_framework):
        """Test automated pass/fail gating based on performance metrics."""
        threshold_manager = PerformanceThresholdManager(metrics_framework)
        
        # Configure high sensitivity gating
        config = threshold_manager.configure_automated_gating(sensitivity="high")
        assert config["critical_threshold_failure_limit"] == 0
        assert config["health_score_minimum"] == 80.0
        
        # Create metric that violates critical threshold
        critical_violation_metric = StandardizedMetric(
            name="error_rate_percent",
            value=5.0,  # Exceeds 1.0% threshold
            unit="percent",
            metric_type=MetricType.QUALITY,
            timestamp=datetime.now().isoformat(),
            source="test_system"
        )
        
        metrics_framework.register_metric(critical_violation_metric)
        report = metrics_framework.validate_all_metrics()
        
        # Apply gating
        gating_result = threshold_manager.apply_threshold_gates(report)
        
        # Should fail due to critical violation
        assert gating_result["decision"] == "FAIL"
        assert gating_result["critical_violations"] > 0
        assert "critical violations" in " ".join(gating_result["reasons"]).lower()
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.regression
    def test_performance_regression_detection(self, metrics_framework):
        """Test automated performance regression detection."""
        # Create metric with historical data showing regression
        regression_metric = StandardizedMetric(
            name="response_time_ms",
            value=1500.0,  # Significantly higher than historical
            unit="milliseconds",
            metric_type=MetricType.PERFORMANCE,
            timestamp=datetime.now().isoformat(),
            source="performance_monitor",
            historical_values=[500.0, 520.0, 480.0, 510.0, 495.0]  # ~500ms baseline
        )
        
        metrics_framework.register_metric(regression_metric)
        report = metrics_framework.validate_all_metrics()
        
        # Should detect regression
        assert report.performance_regression_count > 0
        assert any("regression" in rec.lower() for rec in report.recommendations)
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.thresholds
    def test_threshold_violation_detection(self, metrics_framework):
        """Test threshold violation detection and classification."""
        # Create metrics with various threshold violations
        violations = [
            StandardizedMetric(
                name="response_time_ms",
                value=3000.0,  # Exceeds 2000ms max threshold
                unit="milliseconds",
                metric_type=MetricType.PERFORMANCE,
                timestamp=datetime.now().isoformat(),
                source="test_system"
            ),
            StandardizedMetric(
                name="security_score",
                value=7.0,  # Below 8.0 min threshold
                unit="score",
                metric_type=MetricType.SECURITY,
                timestamp=datetime.now().isoformat(),
                source="test_system"
            )
        ]
        
        for metric in violations:
            metrics_framework.register_metric(metric)
        
        report = metrics_framework.validate_all_metrics()
        
        # Should detect violations
        assert len(report.threshold_violations) >= 2
        assert report.overall_health_score < 100.0
        
        # Verify violation details
        violation_names = [v["metric_name"] for v in report.threshold_violations]
        assert "response_time_ms" in violation_names
        assert "security_score" in violation_names
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.historical
    def test_historical_data_management(self, metrics_framework):
        """Test historical data collection and management."""
        metric_name = "test_metric_ms"
        
        # Register multiple values over time
        for i, value in enumerate([100, 110, 105, 120, 115]):
            metric = StandardizedMetric(
                name=metric_name,
                value=value,
                unit="milliseconds",
                metric_type=MetricType.PERFORMANCE,
                timestamp=datetime.now().isoformat(),
                source="test_system"
            )
            metrics_framework.register_metric(metric)
        
        # Verify historical data is maintained
        assert metric_name in metrics_framework.historical_data
        historical_values = metrics_framework.historical_data[metric_name]
        assert len(historical_values) == 5
        assert historical_values[-1] == 115.0  # Latest value
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.cicd
    def test_cicd_pipeline_integration(self, metrics_framework):
        """Test CI/CD pipeline integration for automated gating."""
        threshold_manager = PerformanceThresholdManager(metrics_framework)
        threshold_manager.configure_automated_gating(sensitivity="medium")
        
        # Simulate successful deployment metrics
        success_metrics = [
            StandardizedMetric(
                name="response_time_ms",
                value=450.0,  # Within threshold
                unit="milliseconds",
                metric_type=MetricType.PERFORMANCE,
                timestamp=datetime.now().isoformat(),
                source="deployment_test"
            ),
            StandardizedMetric(
                name="error_rate_percent",
                value=0.05,  # Within threshold
                unit="percent",
                metric_type=MetricType.QUALITY,
                timestamp=datetime.now().isoformat(),
                source="deployment_test"
            )
        ]
        
        for metric in success_metrics:
            metrics_framework.register_metric(metric)
        
        report = metrics_framework.validate_all_metrics()
        gating_result = threshold_manager.apply_threshold_gates(report)
        
        # Should pass gating
        assert gating_result["decision"] == "PASS"
        assert len(gating_result["reasons"]) == 0
        assert gating_result["health_score"] >= 85.0
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.edge_case
    def test_invalid_metric_handling(self, metrics_framework):
        """Test handling of invalid metrics."""
        # Create metric with invalid schema
        invalid_metric = StandardizedMetric(
            name="",  # Invalid empty name
            value=100,
            unit="",  # Invalid empty unit
            metric_type=MetricType.PERFORMANCE,
            timestamp="invalid_timestamp",  # Invalid timestamp
            source=""  # Invalid empty source
        )
        
        # Should fail to register
        result = metrics_framework.register_metric(invalid_metric)
        assert result is False
        
        # Should not appear in registry
        assert invalid_metric.name not in metrics_framework.metrics_registry
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.performance
    def test_large_scale_metrics_performance(self, metrics_framework):
        """Test performance with large number of metrics."""
        # Register many metrics
        start_time = time.time()
        
        for i in range(100):
            metric = StandardizedMetric(
                name=f"metric_{i}",
                value=float(i),
                unit="count",
                metric_type=MetricType.PERFORMANCE,
                timestamp=datetime.now().isoformat(),
                source="load_test"
            )
            metrics_framework.register_metric(metric)
        
        # Validate performance
        validation_start = time.time()
        report = metrics_framework.validate_all_metrics()
        validation_time = time.time() - validation_start
        
        total_time = time.time() - start_time
        
        # Should complete within reasonable time
        assert total_time < 5.0  # Under 5 seconds
        assert validation_time < 2.0  # Validation under 2 seconds
        assert report.total_metrics == 100
        assert report.schema_compliant_metrics == 100
    
    @pytest.mark.tdd
    @pytest.mark.metrics
    @pytest.mark.recommendations
    def test_optimization_recommendations_generation(self, metrics_framework):
        """Test generation of optimization recommendations."""
        # Create metrics with various issues
        problematic_metrics = [
            StandardizedMetric(
                name="high_error_rate",
                value=10.0,  # Critical violation
                unit="percent",
                metric_type=MetricType.QUALITY,
                timestamp=datetime.now().isoformat(),
                source="test_system"
            ),
            StandardizedMetric(
                name="slow_response",
                value=5000.0,  # Significant deviation
                unit="milliseconds",
                metric_type=MetricType.PERFORMANCE,
                timestamp=datetime.now().isoformat(),
                source="test_system"
            )
        ]
        
        for metric in problematic_metrics:
            metrics_framework.register_metric(metric)
        
        report = metrics_framework.validate_all_metrics()
        
        # Should generate specific recommendations
        assert len(report.recommendations) > 0
        
        # Check for urgent recommendations for critical violations
        urgent_recommendations = [
            rec for rec in report.recommendations 
            if "URGENT" in rec or "critical" in rec.lower()
        ]
        assert len(urgent_recommendations) > 0