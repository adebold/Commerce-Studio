"""
Security Implementation Validation Tests

Tests to verify that real security implementations are working:
- Real NoSQL injection prevention 
- Real threat detection
- Real input validation
- Real security scoring

This replaces the mock security tests to ensure production readiness.
"""

import pytest
import asyncio
from typing import Dict, Any
from unittest.mock import AsyncMock, MagicMock

# Import the real security components
from src.mongodb_foundation.security import (
    InputSanitizer, ThreatDetector, SecurityAuditor, SecurityViolation,
    SecurityThreatLevel, SecurityViolationType, validate_input, get_security_metrics
)
from src.mongodb_foundation.managers import ProductCollectionManager
from src.mongodb_foundation.types import ServiceError, ErrorType


class TestRealSecurityImplementation:
    """Test that security implementations are real, not mocked"""
    
    def test_input_sanitizer_prevents_nosql_injection(self):
        """Test that InputSanitizer actually prevents NoSQL injection"""
        # These should all raise SecurityViolation
        malicious_inputs = [
            {"$ne": None},
            {"$gt": ""},
            {"$where": "this.password == 'admin'"},
            {"$regex": ".*"},
            {"$or": [{"active": True}]}
        ]
        
        for malicious_input in malicious_inputs:
            with pytest.raises(SecurityViolation) as exc_info:
                InputSanitizer.sanitize_query_dict(malicious_input)
            
            # Verify it's a real SecurityViolation with proper attributes
            assert exc_info.value.violation_type == SecurityViolationType.NOSQL_INJECTION
            assert exc_info.value.threat_level in [SecurityThreatLevel.HIGH, SecurityThreatLevel.CRITICAL]
            assert hasattr(exc_info.value, 'timestamp')
            assert hasattr(exc_info.value, 'details')
    
    def test_face_shape_validation_is_real(self):
        """Test that face shape validation works for real"""
        # Valid face shapes should pass
        valid_shapes = ["round", "oval", "square", "rectangle", "diamond", "heart", "triangle"]
        for shape in valid_shapes:
            result = InputSanitizer.validate_face_shape(shape)
            assert result == shape.lower()
        
        # Invalid face shapes should fail
        invalid_shapes = [
            "invalid_shape",
            {"$ne": None},
            "<script>alert('xss')</script>",
            "../../../etc/passwd",
            "'; DROP TABLE users; --"
        ]
        
        for invalid_shape in invalid_shapes:
            with pytest.raises(SecurityViolation):
                InputSanitizer.validate_face_shape(invalid_shape)
    
    def test_sku_validation_is_real(self):
        """Test that SKU validation works for real"""
        # Valid SKUs should pass
        valid_skus = ["ABC-123", "FRAME_001", "SK12345", "TEST-SKU-001"]
        for sku in valid_skus:
            result = InputSanitizer.validate_sku(sku)
            assert result == sku
        
        # Invalid SKUs should fail
        invalid_skus = [
            "sku with spaces",
            "sku@with#special$chars",
            {"$ne": None},
            "<script>alert('xss')</script>",
            "x" * 51,  # Too long
            ""  # Empty
        ]
        
        for invalid_sku in invalid_skus:
            with pytest.raises(SecurityViolation):
                InputSanitizer.validate_sku(invalid_sku)
    
    def test_threat_detector_is_real(self):
        """Test that ThreatDetector actually detects threats"""
        detector = ThreatDetector()
        
        # Clean input should not trigger threat
        clean_data = {"name": "Test Product", "sku": "TEST-001"}
        threat = detector.detect_threat(clean_data, "192.168.1.1")
        assert threat is None
        
        # Malicious input should trigger threat
        malicious_data = {"$where": "this.password == 'admin'"}
        threat = detector.detect_threat(malicious_data, "192.168.1.1")
        assert threat is not None
        assert isinstance(threat, SecurityViolation)
        assert threat.violation_type == SecurityViolationType.NOSQL_INJECTION
    
    def test_security_auditor_is_real(self):
        """Test that SecurityAuditor actually audits operations"""
        auditor = SecurityAuditor()
        
        # Clean operation should pass audit
        clean_data = {"name": "Test Product", "sku": "TEST-001"}
        result = auditor.audit_operation("CREATE", clean_data, "user123", "192.168.1.1")
        assert result is True
        
        # Malicious operation should fail audit
        malicious_data = {"$where": "this.password == 'admin'"}
        result = auditor.audit_operation("CREATE", malicious_data, "user123", "192.168.1.1")
        assert result is False
        
        # Check that events were logged
        assert len(auditor.security_events) >= 2
    
    def test_security_score_calculation_is_real(self):
        """Test that security score calculation is based on real data"""
        auditor = SecurityAuditor()
        
        # Initial score should be high
        initial_score = auditor.get_security_score()
        assert initial_score == 1.0
        
        # After threat detection, score should decrease
        malicious_data = {"$where": "this.password == 'admin'"}
        auditor.audit_operation("CREATE", malicious_data, "user123", "192.168.1.1")
        
        score_after_threat = auditor.get_security_score()
        assert score_after_threat < initial_score
    
    def test_validate_input_function_is_real(self):
        """Test that the main validate_input function works for real"""
        # Valid inputs should pass
        valid_face_shape = validate_input("round", "face_shape")
        assert valid_face_shape == "round"
        
        valid_sku = validate_input("TEST-001", "sku")
        assert valid_sku == "TEST-001"
        
        # Invalid inputs should raise SecurityViolation
        with pytest.raises(SecurityViolation):
            validate_input({"$ne": None}, "query")
        
        with pytest.raises(SecurityViolation):
            validate_input("invalid_shape", "face_shape")
    
    def test_security_metrics_are_real(self):
        """Test that security metrics return real data"""
        # Trigger some security events first
        try:
            validate_input({"$ne": None}, "query")
        except SecurityViolation:
            pass
        
        try:
            validate_input("TEST-001", "sku")
        except SecurityViolation:
            pass
        
        metrics = get_security_metrics()
        
        # Verify metrics structure and real data
        assert isinstance(metrics, dict)
        assert "security_score" in metrics
        assert "total_threats_detected" in metrics
        assert "total_operations_validated" in metrics
        assert "rate_limited_ips" in metrics
        assert "recent_events_count" in metrics
        
        # Verify data types
        assert isinstance(metrics["security_score"], float)
        assert isinstance(metrics["total_threats_detected"], int)
        assert isinstance(metrics["total_operations_validated"], int)
        assert isinstance(metrics["rate_limited_ips"], int)
        assert isinstance(metrics["recent_events_count"], int)


class TestProductManagerSecurityIntegration:
    """Test that ProductCollectionManager uses real security validation"""
    
    @pytest.fixture
    def mock_db(self):
        """Create mock database for testing"""
        db = MagicMock()
        collection = AsyncMock()
        db.products = collection
        return db, collection
    
    @pytest.mark.asyncio
    async def test_create_product_security_validation(self, mock_db):
        """Test that create method uses real security validation"""
        db, collection = mock_db
        manager = ProductCollectionManager(db)
        
        # Mock successful insert
        collection.insert_one.return_value = AsyncMock()
        collection.insert_one.return_value.inserted_id = "507f1f77bcf86cd799439011"
        collection.find_one.return_value = {
            "_id": "507f1f77bcf86cd799439011",
            "sku": "TEST-001",
            "name": "Test Product"
        }
        
        # Valid product data should work
        valid_product = {
            "sku": "TEST-001",
            "name": "Test Product",
            "face_shape_compatibility": ["round", "oval"]
        }
        
        result = await manager.create(valid_product)
        assert result is not None
        
        # Invalid product data should raise SecurityViolation -> ServiceError
        invalid_product = {
            "sku": {"$ne": None},  # NoSQL injection attempt
            "name": "Test Product"
        }
        
        with pytest.raises(ServiceError) as exc_info:
            await manager.create(invalid_product)
        
        assert exc_info.value.type == ErrorType.SECURITY_VIOLATION
        assert "Security validation failed" in str(exc_info.value.message)
    
    @pytest.mark.asyncio
    async def test_find_by_sku_security_validation(self, mock_db):
        """Test that findBySku uses real security validation"""
        db, collection = mock_db
        manager = ProductCollectionManager(db)
        
        # Mock successful find
        collection.find_one.return_value = {
            "_id": "507f1f77bcf86cd799439011",
            "sku": "TEST-001",
            "name": "Test Product"
        }
        
        # Valid SKU should work
        result = await manager.findBySku("TEST-001")
        assert result is not None
        
        # Invalid SKU should raise SecurityViolation -> ServiceError
        with pytest.raises(ServiceError) as exc_info:
            await manager.findBySku("sku with spaces")
        
        assert exc_info.value.type == ErrorType.SECURITY_VIOLATION
    
    @pytest.mark.asyncio
    async def test_get_products_by_face_shape_security_validation(self, mock_db):
        """Test that getProductsByFaceShape uses real security validation"""
        db, collection = mock_db
        manager = ProductCollectionManager(db)
        
        # Mock successful find - properly chain the mock calls
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = [{
            "_id": "507f1f77bcf86cd799439011",
            "sku": "TEST-001",
            "name": "Test Product"
        }]
        
        # Mock the chained calls: collection.find().limit().to_list()
        mock_find = AsyncMock()
        mock_find.limit.return_value = mock_cursor
        collection.find.return_value = mock_find
        
        # Valid face shape should work
        result = await manager.getProductsByFaceShape("round")
        assert isinstance(result, list)
        
        # Invalid face shape should raise SecurityViolation -> ServiceError
        with pytest.raises(ServiceError) as exc_info:
            await manager.getProductsByFaceShape("invalid_shape")
        
        assert exc_info.value.type == ErrorType.SECURITY_VIOLATION


class TestSecurityPerformanceValidation:
    """Test that security implementations don't have significant performance impact"""
    
    def test_security_validation_performance(self):
        """Test that security validation completes in reasonable time"""
        import time
        
        # Test 1000 validations should complete quickly
        start_time = time.time()
        
        for i in range(1000):
            try:
                validate_input(f"TEST-{i:03d}", "sku")
            except SecurityViolation:
                pass
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Should complete in under 1 second
        assert duration < 1.0, f"Security validation took {duration:.3f}s for 1000 operations"
    
    def test_threat_detection_performance(self):
        """Test that threat detection is efficient"""
        import time
        
        detector = ThreatDetector()
        
        start_time = time.time()
        
        for i in range(100):
            detector.detect_threat({"name": f"Product {i}"}, f"192.168.1.{i % 255}")
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Should complete in under 0.5 seconds
        assert duration < 0.5, f"Threat detection took {duration:.3f}s for 100 operations"


if __name__ == "__main__":
    # Run validation tests
    pytest.main([__file__, "-v"])