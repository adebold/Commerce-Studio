"""
Comprehensive Encryption Manager Business Data tests for manufacturer security foundation.
Addresses critical business data encryption implementation gap identified in reflection_LS8.md.

This test suite validates:
1. Business data encryption interface with metadata
2. Advanced encryption features (key rotation, versioning)
3. Security and compliance requirements
4. Performance benchmarks for encryption operations
5. Data integrity and audit trail functionality
"""

import pytest
import asyncio
import time
import json
import base64
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum
import uuid

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.security.manufacturer_encryption import (
        ManufacturerEncryptionManager, EncryptionResult, DecryptionResult,
        EncryptionMetadata, KeyRotationResult, EncryptionAuditLog,
        BusinessDataEncryption, SensitiveDataMask
    )
    from src.auth.exceptions import (
        EncryptionError, DecryptionError, KeyRotationError,
        InvalidEncryptionVersionError, AuditLogError
    )
except ImportError as e:
    pytest.skip(f"Encryption manager business modules not implemented: {e}", allow_module_level=True)


class EncryptionAlgorithm(Enum):
    """Supported encryption algorithms"""
    AES_256_GCM = "aes_256_gcm"
    AES_256_CBC = "aes_256_cbc"
    CHACHA20_POLY1305 = "chacha20_poly1305"
    RSA_4096 = "rsa_4096"


class SensitiveDataType(Enum):
    """Types of sensitive business data"""
    FINANCIAL = "financial"
    PERSONAL = "personal"
    BUSINESS_CONFIDENTIAL = "business_confidential"
    REGULATORY = "regulatory"
    INTELLECTUAL_PROPERTY = "intellectual_property"


@pytest.fixture
async def encryption_manager():
    """
    Enhanced ManufacturerEncryptionManager fixture with business data capabilities.
    NO MOCKS - Real implementation required.
    """
    manager = ManufacturerEncryptionManager(
        default_algorithm=EncryptionAlgorithm.AES_256_GCM,
        key_rotation_enabled=True,
        audit_logging_enabled=True,
        performance_optimized=True,
        compliance_mode=True,
        metadata_encryption=True
    )
    await manager.initialize()
    await manager.generate_master_key()
    return manager


@pytest.fixture
def sensitive_business_data():
    """Comprehensive sensitive business data samples"""
    return {
        'financial_data': {
            "annual_revenue": 5000000,
            "quarterly_breakdown": [1200000, 1300000, 1250000, 1250000],
            "profit_margins": {"q1": 0.15, "q2": 0.18, "q3": 0.16, "q4": 0.17},
            "bank_accounts": [
                {"account_number": "123456789012", "routing": "021000021", "bank": "Chase"},
                {"account_number": "987654321098", "routing": "111000025", "bank": "Wells Fargo"}
            ],
            "credit_lines": [
                {"limit": 500000, "used": 150000, "rate": 0.045},
                {"limit": 1000000, "used": 300000, "rate": 0.038}
            ]
        },
        'personal_data': {
            "owner_ssn": "123-45-6789",
            "owner_dob": "1975-03-15",
            "emergency_contacts": [
                {"name": "Jane Doe", "phone": "+1-555-123-4567", "relation": "spouse"},
                {"name": "John Smith", "phone": "+1-555-987-6543", "relation": "business_partner"}
            ],
            "personal_addresses": [
                {"type": "home", "address": "123 Private Lane, City, ST 12345"},
                {"type": "vacation", "address": "456 Beach Rd, Resort Town, FL 54321"}
            ]
        },
        'business_confidential': {
            "supplier_contracts": [
                {"supplier": "Lens Corp", "contract_value": 500000, "terms": "exclusive_3_years"},
                {"supplier": "Frame Designs Inc", "contract_value": 750000, "terms": "preferred_partner"}
            ],
            "pricing_strategies": {
                "premium_markup": 2.5,
                "volume_discounts": {"100+": 0.05, "500+": 0.10, "1000+": 0.15},
                "competitor_analysis": {"competitor_a": "15% higher", "competitor_b": "8% lower"}
            },
            "customer_lists": [
                {"customer_id": "CUST001", "tier": "platinum", "lifetime_value": 50000},
                {"customer_id": "CUST002", "tier": "gold", "lifetime_value": 25000}
            ]
        },
        'regulatory_data': {
            "business_license": "BL123456789",
            "tax_id": "12-3456789",
            "regulatory_filings": [
                {"filing_type": "annual_report", "date": "2024-03-15", "status": "approved"},
                {"filing_type": "tax_return", "date": "2024-04-15", "status": "filed"}
            ],
            "compliance_certifications": [
                {"cert_type": "ISO_9001", "expiry": "2025-06-30", "status": "active"},
                {"cert_type": "FDA_registration", "expiry": "2024-12-31", "status": "renewal_pending"}
            ]
        },
        'intellectual_property': {
            "patents": [
                {"patent_number": "US10123456", "title": "Advanced Lens Technology", "expiry": "2035-01-15"},
                {"patent_number": "US10789012", "title": "Smart Frame Design", "expiry": "2037-08-22"}
            ],
            "trade_secrets": [
                {"name": "proprietary_coating_formula", "classification": "top_secret"},
                {"name": "manufacturing_process_optimization", "classification": "confidential"}
            ],
            "research_data": {
                "active_projects": ["next_gen_lenses", "ar_integration", "sustainable_materials"],
                "investment": 2000000,
                "timeline": "18_months"
            }
        }
    }


@pytest.fixture
def encryption_performance_data():
    """Data samples for performance testing"""
    return {
        'small_data': {"field": "small value"},
        'medium_data': {
            "field1": "medium value " * 100,
            "field2": list(range(100)),
            "field3": {"nested": {"data": "structure"}}
        },
        'large_data': {
            "field1": "large value " * 1000,
            "field2": list(range(1000)),
            "field3": {"nested": {"data": ["item"] * 500}}
        }
    }


class TestBusinessDataEncryptionInterface:
    """Test business data encryption interface with metadata"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_business_data_encryption_interface(self, encryption_manager, sensitive_business_data):
        """
        Test business data encryption with comprehensive metadata.
        
        Requirements:
        - encrypt_manufacturer_data(data: Dict) method
        - decrypt_manufacturer_data(encrypted_data: Dict) method
        - Encryption metadata generation
        - Data integrity preservation
        """
        financial_data = sensitive_business_data['financial_data']
        
        # Test encryption with metadata
        start_time = time.perf_counter()
        encrypted_result = await encryption_manager.encrypt_manufacturer_data(financial_data)
        encryption_time = time.perf_counter() - start_time
        
        # Verify encryption result structure
        assert isinstance(encrypted_result, dict)
        assert "encrypted_payload" in encrypted_result
        assert "encryption_metadata" in encrypted_result
        assert "integrity_hash" in encrypted_result
        assert "data_classification" in encrypted_result
        
        # Verify performance requirement
        assert encryption_time < 0.1, f"Encryption too slow: {encryption_time:.3f}s"
        
        # Verify metadata structure
        metadata = encrypted_result["encryption_metadata"]
        assert "algorithm" in metadata
        assert "encrypted_at" in metadata
        assert "version" in metadata
        assert "key_id" in metadata
        assert "data_size" in metadata
        assert "compression_used" in metadata
        
        # Verify sensitive data is not visible in encrypted result
        encrypted_str = str(encrypted_result)
        assert "5000000" not in encrypted_str  # Annual revenue
        assert "123456789012" not in encrypted_str  # Bank account
        assert "021000021" not in encrypted_str  # Routing number
        
        # Test decryption
        start_time = time.perf_counter()
        decrypted_data = await encryption_manager.decrypt_manufacturer_data(encrypted_result)
        decryption_time = time.perf_counter() - start_time
        
        # Verify decryption accuracy
        assert decrypted_data == financial_data
        assert decryption_time < 0.1, f"Decryption too slow: {decryption_time:.3f}s"
        
        # Verify integrity
        assert encrypted_result["integrity_hash"] is not None
        calculated_hash = await encryption_manager.calculate_data_hash(financial_data)
        assert encrypted_result["integrity_hash"] == calculated_hash
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_sensitive_data_classification_and_masking(self, encryption_manager, sensitive_business_data):
        """
        Test automatic sensitive data classification and masking.
        
        Requirements:
        - Automatic data classification
        - Sensitive field identification
        - Data masking in logs and errors
        """
        for data_type, data_sample in sensitive_business_data.items():
            # Test encryption with classification
            encrypted_result = await encryption_manager.encrypt_manufacturer_data(
                data_sample, 
                data_classification=SensitiveDataType(data_type.replace('_data', ''))
            )
            
            # Verify classification is preserved
            assert encrypted_result["data_classification"] == data_type.replace('_data', '')
            
            # Test sensitive field identification
            sensitive_fields = encrypted_result["encryption_metadata"]["sensitive_fields"]
            
            if data_type == 'financial_data':
                assert "bank_accounts" in sensitive_fields
                assert "annual_revenue" in sensitive_fields
            elif data_type == 'personal_data':
                assert "owner_ssn" in sensitive_fields
                assert "owner_dob" in sensitive_fields
            elif data_type == 'regulatory_data':
                assert "business_license" in sensitive_fields
                assert "tax_id" in sensitive_fields
            
            # Test data masking in audit logs
            audit_entry = await encryption_manager.get_last_audit_entry()
            audit_data_str = str(audit_entry.data_summary)
            
            # Verify sensitive data is masked in audit logs
            if data_type == 'financial_data':
                assert "5000000" not in audit_data_str  # Revenue should be masked
                assert "***" in audit_data_str or "MASKED" in audit_data_str
            elif data_type == 'personal_data':
                assert "123-45-6789" not in audit_data_str  # SSN should be masked
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_encryption_versioning_and_compatibility(self, encryption_manager, sensitive_business_data):
        """
        Test encryption versioning and backward compatibility.
        
        Requirements:
        - Version tracking for encrypted data
        - Backward compatibility with older versions
        - Version migration capabilities
        """
        test_data = sensitive_business_data['business_confidential']
        
        # Encrypt with current version
        encrypted_v1 = await encryption_manager.encrypt_manufacturer_data(test_data)
        current_version = encrypted_v1["encryption_metadata"]["version"]
        
        # Simulate version upgrade
        await encryption_manager.upgrade_encryption_version()
        
        # Encrypt same data with new version
        encrypted_v2 = await encryption_manager.encrypt_manufacturer_data(test_data)
        new_version = encrypted_v2["encryption_metadata"]["version"]
        
        # Verify version increment
        assert new_version > current_version
        
        # Test backward compatibility - decrypt old version
        decrypted_v1 = await encryption_manager.decrypt_manufacturer_data(encrypted_v1)
        assert decrypted_v1 == test_data
        
        # Test new version decryption
        decrypted_v2 = await encryption_manager.decrypt_manufacturer_data(encrypted_v2)
        assert decrypted_v2 == test_data
        
        # Test version migration
        migrated_data = await encryption_manager.migrate_encryption_version(encrypted_v1, new_version)
        assert migrated_data["encryption_metadata"]["version"] == new_version
        
        # Verify migrated data can be decrypted
        decrypted_migrated = await encryption_manager.decrypt_manufacturer_data(migrated_data)
        assert decrypted_migrated == test_data


class TestAdvancedEncryptionFeatures:
    """Test advanced encryption features"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_encryption_key_rotation(self, encryption_manager, sensitive_business_data):
        """
        Test encryption key rotation functionality.
        
        Requirements:
        - Seamless key rotation
        - Data re-encryption with new keys
        - Old data remains accessible
        """
        test_data = sensitive_business_data['financial_data']
        
        # Encrypt with original key
        encrypted_original = await encryption_manager.encrypt_manufacturer_data(test_data)
        original_key_id = encrypted_original["encryption_metadata"]["key_id"]
        
        # Perform key rotation
        start_time = time.perf_counter()
        rotation_result = await encryption_manager.rotate_encryption_key()
        rotation_time = time.perf_counter() - start_time
        
        # Verify rotation result
        assert isinstance(rotation_result, KeyRotationResult)
        assert rotation_result.success == True
        assert rotation_result.new_key_id != original_key_id
        assert rotation_result.old_key_id == original_key_id
        assert rotation_time < 1.0, f"Key rotation too slow: {rotation_time:.3f}s"
        
        # Encrypt with new key
        encrypted_new = await encryption_manager.encrypt_manufacturer_data(test_data)
        new_key_id = encrypted_new["encryption_metadata"]["key_id"]
        
        # Verify different keys used
        assert new_key_id != original_key_id
        assert new_key_id == rotation_result.new_key_id
        
        # Verify different encrypted results
        assert encrypted_original["encrypted_payload"] != encrypted_new["encrypted_payload"]
        
        # Verify both can be decrypted
        decrypted_original = await encryption_manager.decrypt_manufacturer_data(encrypted_original)
        decrypted_new = await encryption_manager.decrypt_manufacturer_data(encrypted_new)
        
        assert decrypted_original == test_data
        assert decrypted_new == test_data
        
        # Test bulk re-encryption of existing data
        bulk_data = [encrypted_original]
        re_encrypted_data = await encryption_manager.bulk_re_encrypt(bulk_data, rotation_result.new_key_id)
        
        assert len(re_encrypted_data) == 1
        assert re_encrypted_data[0]["encryption_metadata"]["key_id"] == rotation_result.new_key_id
        
        # Verify re-encrypted data is correct
        decrypted_re_encrypted = await encryption_manager.decrypt_manufacturer_data(re_encrypted_data[0])
        assert decrypted_re_encrypted == test_data
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_multiple_encryption_algorithms_support(self, encryption_manager, sensitive_business_data):
        """
        Test support for multiple encryption algorithms.
        
        Requirements:
        - Support multiple algorithms
        - Algorithm-specific optimization
        - Performance comparison
        """
        test_data = sensitive_business_data['personal_data']
        algorithms = [
            EncryptionAlgorithm.AES_256_GCM,
            EncryptionAlgorithm.AES_256_CBC,
            EncryptionAlgorithm.CHACHA20_POLY1305
        ]
        
        encryption_results = {}
        performance_metrics = {}
        
        for algorithm in algorithms:
            # Test encryption with specific algorithm
            start_time = time.perf_counter()
            encrypted_result = await encryption_manager.encrypt_manufacturer_data(
                test_data, algorithm=algorithm
            )
            encryption_time = time.perf_counter() - start_time
            
            # Verify algorithm is used
            assert encrypted_result["encryption_metadata"]["algorithm"] == algorithm.value
            
            # Test decryption
            start_time = time.perf_counter()
            decrypted_data = await encryption_manager.decrypt_manufacturer_data(encrypted_result)
            decryption_time = time.perf_counter() - start_time
            
            # Verify correctness
            assert decrypted_data == test_data
            
            # Store results
            encryption_results[algorithm] = encrypted_result
            performance_metrics[algorithm] = {
                "encryption_time": encryption_time,
                "decryption_time": decryption_time,
                "payload_size": len(encrypted_result["encrypted_payload"])
            }
        
        # Verify different algorithms produce different results
        payloads = [result["encrypted_payload"] for result in encryption_results.values()]
        assert len(set(payloads)) == len(algorithms), "Different algorithms should produce different results"
        
        # Verify all algorithms meet performance requirements
        for algorithm, metrics in performance_metrics.items():
            assert metrics["encryption_time"] < 0.2, f"{algorithm.value} encryption too slow"
            assert metrics["decryption_time"] < 0.2, f"{algorithm.value} decryption too slow"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_encryption_compression_optimization(self, encryption_manager, encryption_performance_data):
        """
        Test encryption with compression optimization.
        
        Requirements:
        - Automatic compression for large data
        - Compression ratio optimization
        - Performance with compression
        """
        for data_size, test_data in encryption_performance_data.items():
            # Encrypt with compression
            encrypted_with_compression = await encryption_manager.encrypt_manufacturer_data(
                test_data, enable_compression=True
            )
            
            # Encrypt without compression
            encrypted_without_compression = await encryption_manager.encrypt_manufacturer_data(
                test_data, enable_compression=False
            )
            
            # Verify compression metadata
            compression_metadata = encrypted_with_compression["encryption_metadata"]["compression_used"]
            no_compression_metadata = encrypted_without_compression["encryption_metadata"]["compression_used"]
            
            assert compression_metadata == True
            assert no_compression_metadata == False
            
            # For larger data, compression should reduce size
            if data_size == 'large_data':
                compressed_size = len(encrypted_with_compression["encrypted_payload"])
                uncompressed_size = len(encrypted_without_compression["encrypted_payload"])
                
                compression_ratio = compressed_size / uncompressed_size
                assert compression_ratio < 0.8, f"Compression not effective: ratio {compression_ratio:.2f}"
            
            # Verify both decrypt correctly
            decrypted_compressed = await encryption_manager.decrypt_manufacturer_data(encrypted_with_compression)
            decrypted_uncompressed = await encryption_manager.decrypt_manufacturer_data(encrypted_without_compression)
            
            assert decrypted_compressed == test_data
            assert decrypted_uncompressed == test_data


class TestSecurityAndCompliance:
    """Test security and compliance requirements"""
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_audit_trail_generation(self, encryption_manager, sensitive_business_data):
        """
        Test comprehensive audit trail generation.
        
        Requirements:
        - Complete audit trail for all operations
        - Tamper-evident audit logs
        - Audit log encryption
        """
        test_data = sensitive_business_data['regulatory_data']
        
        # Clear existing audit logs
        await encryption_manager.clear_audit_logs()
        
        # Perform encryption operation
        encrypted_result = await encryption_manager.encrypt_manufacturer_data(test_data)
        
        # Perform decryption operation
        decrypted_data = await encryption_manager.decrypt_manufacturer_data(encrypted_result)
        
        # Get audit trail
        audit_logs = await encryption_manager.get_audit_trail()
        
        # Verify audit entries
        assert len(audit_logs) >= 2, "Should have audit entries for encryption and decryption"
        
        encryption_audit = next((log for log in audit_logs if log.operation == "encrypt"), None)
        decryption_audit = next((log for log in audit_logs if log.operation == "decrypt"), None)
        
        assert encryption_audit is not None, "Missing encryption audit entry"
        assert decryption_audit is not None, "Missing decryption audit entry"
        
        # Verify audit entry structure
        for audit_entry in [encryption_audit, decryption_audit]:
            assert hasattr(audit_entry, 'timestamp')
            assert hasattr(audit_entry, 'operation')
            assert hasattr(audit_entry, 'user_id')
            assert hasattr(audit_entry, 'data_classification')
            assert hasattr(audit_entry, 'success')
            assert hasattr(audit_entry, 'metadata')
            
            # Verify timestamp is recent
            assert (datetime.utcnow() - audit_entry.timestamp).total_seconds() < 60
            
            # Verify operation success
            assert audit_entry.success == True
        
        # Test audit log integrity
        audit_integrity = await encryption_manager.verify_audit_integrity()
        assert audit_integrity.is_valid == True, "Audit log integrity check failed"
        
        # Test audit log encryption
        encrypted_audit_logs = await encryption_manager.export_encrypted_audit_logs()
        assert "encrypted_audit_data" in encrypted_audit_logs
        assert "audit_metadata" in encrypted_audit_logs
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_encryption_strength_validation(self, encryption_manager, sensitive_business_data):
        """
        Test encryption strength validation and compliance.
        
        Requirements:
        - Validate encryption strength
        - Compliance with security standards
        - Key strength verification
        """
        test_data = sensitive_business_data['intellectual_property']
        
        # Encrypt data
        encrypted_result = await encryption_manager.encrypt_manufacturer_data(test_data)
        
        # Validate encryption strength
        strength_validation = await encryption_manager.validate_encryption_strength(encrypted_result)
        
        assert strength_validation.is_compliant == True
        assert strength_validation.algorithm_strength >= 256, "Algorithm strength should be at least 256-bit"
        assert strength_validation.key_strength >= 256, "Key strength should be at least 256-bit"
        assert strength_validation.compliance_standards is not None
        
        # Verify compliance with specific standards
        compliance_standards = strength_validation.compliance_standards
        assert "FIPS_140_2" in compliance_standards
        assert "AES_256" in compliance_standards
        
        # Test key strength validation
        key_validation = await encryption_manager.validate_key_strength()
        assert key_validation.meets_requirements == True
        assert key_validation.entropy_score > 0.95, "Key entropy should be high"
        assert key_validation.randomness_score > 0.95, "Key randomness should be high"
    
    @pytest.mark.security
    @pytest.mark.asyncio
    async def test_data_residency_and_sovereignty(self, encryption_manager, sensitive_business_data):
        """
        Test data residency and sovereignty compliance.
        
        Requirements:
        - Data location tracking
        - Sovereignty compliance
        - Cross-border data protection
        """
        test_data = sensitive_business_data['financial_data']
        
        # Encrypt with data residency requirements
        encrypted_result = await encryption_manager.encrypt_manufacturer_data(
            test_data,
            data_residency="US",
            sovereignty_requirements=["GDPR", "CCPA"]
        )
        
        # Verify residency metadata
        residency_metadata = encrypted_result["encryption_metadata"]["data_residency"]
        assert residency_metadata["location"] == "US"
        assert "GDPR" in residency_metadata["sovereignty_requirements"]
        assert "CCPA" in residency_metadata["sovereignty_requirements"]
        
        # Test cross-border transfer validation
        transfer_validation = await encryption_manager.validate_cross_border_transfer(
            encrypted_result, target_location="EU"
        )
        
        # Should require additional protections for EU transfer
        assert transfer_validation.requires_additional_protection == True
        assert "GDPR" in transfer_validation.required_compliance
        assert transfer_validation.transfer_mechanism is not None


class TestEncryptionPerformanceAndOptimization:
    """Test encryption performance and optimization"""
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_encryption_performance_benchmarks(self, encryption_manager, encryption_performance_data):
        """
        Test encryption performance requirements.
        
        Requirements:
        - Small data encryption < 50ms
        - Medium data encryption < 100ms
        - Large data encryption < 500ms
        """
        performance_requirements = {
            'small_data': 0.05,   # 50ms
            'medium_data': 0.1,   # 100ms
            'large_data': 0.5     # 500ms
        }
        
        for data_size, test_data in encryption_performance_data.items():
            # Test encryption performance
            encryption_times = []
            for _ in range(5):  # Multiple runs for average
                start_time = time.perf_counter()
                encrypted_result = await encryption_manager.encrypt_manufacturer_data(test_data)
                encryption_time = time.perf_counter() - start_time
                encryption_times.append(encryption_time)
            
            avg_encryption_time = sum(encryption_times) / len(encryption_times)
            max_allowed_time = performance_requirements[data_size]
            
            assert avg_encryption_time < max_allowed_time, \
                f"{data_size} encryption too slow: {avg_encryption_time:.3f}s (max: {max_allowed_time}s)"
            
            # Test decryption performance
            decryption_times = []
            for _ in range(5):
                start_time = time.perf_counter()
                decrypted_data = await encryption_manager.decrypt_manufacturer_data(encrypted_result)
                decryption_time = time.perf_counter() - start_time
                decryption_times.append(decryption_time)
            
            avg_decryption_time = sum(decryption_times) / len(decryption_times)
            
            # Decryption should be faster than encryption
            assert avg_decryption_time < max_allowed_time, \
                f"{data_size} decryption too slow: {avg_decryption_time:.3f}s"
    
    @pytest.mark.performance
    @pytest.mark.asyncio
    async def test_concurrent_encryption_operations(self, encryption_manager, sensitive_business_data):
        """
        Test concurrent encryption operations performance.
        
        Requirements:
        - Support concurrent operations
        - No performance degradation under load
        - Thread safety
        """
        # Prepare test data for concurrent operations
        test_datasets = [
            sensitive_business_data['financial_data'],
            sensitive_business_data['personal_data'],
            sensitive_business_data['business_confidential'],
            sensitive_business_data['regulatory_data'],
            sensitive_business_data['intellectual_property']
        ]
        
        # Perform concurrent encryptions
        async def encrypt_dataset(data):
            return await encryption_manager.encrypt_manufacturer_data(data)
        
        start_time = time.perf_counter()
        tasks = [encrypt_dataset(data) for data in test_datasets]
        encrypted_results = await asyncio.gather(*tasks)
        total_time = time.perf_counter() - start_time
        
        # Verify all operations succeeded
        assert len(encrypted_results) == len(test_datasets)
        assert all(result is not None for result in encrypted_results)
        
        # Verify reasonable performance under concurrent load
        avg_time_per_operation = total_time / len(test_datasets)
        assert avg_time_per_operation < 0.2, f"Concurrent encryption too slow: {avg_time_per_operation:.3f}s"
        
        # Perform concurrent decryptions
        async def decrypt_result(encrypted_result):
            return await encryption_manager.decrypt_manufacturer_data(encrypted_result)
        
        start_time = time.perf_counter()
        tasks = [decrypt_result(result) for result in encrypted_results]
        decrypted_results = await asyncio.gather(*tasks)
        total_time = time.perf_counter() - start_time
        
        # Verify all decryptions succeeded and are correct
        assert len(decrypted_results) == len(test_datasets)
        for i, decrypted_data in enumerate(decrypted_results):
            assert decrypted_data == test_datasets[i]
        
        # Verify concurrent decryption performance
        avg_time_per_operation = total_time / len(encrypted_results)
        assert avg_time_per_operation < 0.15, f"Concurrent decryption too slow: {avg_time_per_operation:.3f}s"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])