"""
Tests for the PMS/EHR integration factory.
"""

import os
import pytest
import tempfile
from unittest.mock import patch, MagicMock

from src.integrations.pms_ehr.base import (
    IntegrationCapability,
    IntegrationStandard
)
from src.integrations.pms_ehr.factory import (
    create_integration,
    get_supported_providers,
    get_provider_capabilities,
    get_provider_standard
)
from src.integrations.pms_ehr.fhir import FHIRPatientIntegration
from src.integrations.pms_ehr.smart_on_fhir import SMARTOnFHIRPatientIntegration
from src.integrations.pms_ehr.custom_json import CustomJSONPatientIntegration
from src.integrations.pms_ehr.restful import RESTfulPatientIntegration
from src.integrations.pms_ehr.custom_csv_xml import (
    FileFormat,
    CustomCSVXMLPatientIntegration
)


class TestPMSEHRFactory:
    """Tests for the PMS/EHR integration factory."""
    
    def test_get_supported_providers(self):
        """Test getting the list of supported providers."""
        providers = get_supported_providers()
        assert isinstance(providers, list)
        assert len(providers) > 0
        assert "eyefinity" in providers
        assert "revolutionehr" in providers
        assert "crystalpm" in providers
    
    def test_get_provider_capabilities(self):
        """Test getting the capabilities of a provider."""
        capabilities = get_provider_capabilities("eyefinity")
        assert isinstance(capabilities, list)
        assert len(capabilities) > 0
        assert IntegrationCapability.PATIENT_DATA in capabilities
        
        # Test with invalid provider
        with pytest.raises(ValueError):
            get_provider_capabilities("invalid_provider")
    
    def test_get_provider_standard(self):
        """Test getting the standard of a provider."""
        standard = get_provider_standard("eyefinity")
        assert standard == IntegrationStandard.SMART_ON_FHIR
        
        standard = get_provider_standard("revolutionehr")
        assert standard == IntegrationStandard.FHIR
        
        standard = get_provider_standard("crystalpm")
        assert standard == IntegrationStandard.CUSTOM_JSON
        
        # Test with invalid provider
        with pytest.raises(ValueError):
            get_provider_standard("invalid_provider")
    
    def test_create_integration_fhir(self):
        """Test creating a FHIR integration."""
        auth_config = {
            "client_id": "test_client_id",
            "client_secret": "test_client_secret"
        }
        
        integration = create_integration(
            provider_name="revolutionehr",
            auth_config=auth_config,
            capability=IntegrationCapability.PATIENT_DATA
        )
        
        assert isinstance(integration, FHIRPatientIntegration)
        assert integration.provider_name == "revolutionehr"
        assert integration.auth_config == auth_config
        assert integration.standard == IntegrationStandard.FHIR
        assert IntegrationCapability.PATIENT_DATA in integration.capabilities
    
    def test_create_integration_smart_on_fhir(self):
        """Test creating a SMART on FHIR integration."""
        auth_config = {
            "client_id": "test_client_id",
            "client_secret": "test_client_secret"
        }
        
        integration = create_integration(
            provider_name="eyefinity",
            auth_config=auth_config,
            capability=IntegrationCapability.PATIENT_DATA
        )
        
        assert isinstance(integration, SMARTOnFHIRPatientIntegration)
        assert integration.provider_name == "eyefinity"
        assert integration.auth_config == auth_config
        assert integration.standard == IntegrationStandard.SMART_ON_FHIR
        assert IntegrationCapability.PATIENT_DATA in integration.capabilities
    
    def test_create_integration_custom_json(self):
        """Test creating a Custom JSON integration."""
        auth_config = {
            "api_key": "test_api_key"
        }
        
        integration = create_integration(
            provider_name="crystalpm",
            auth_config=auth_config,
            capability=IntegrationCapability.PATIENT_DATA
        )
        
        assert isinstance(integration, CustomJSONPatientIntegration)
        assert integration.provider_name == "crystalpm"
        assert integration.auth_config == auth_config
        assert integration.standard == IntegrationStandard.CUSTOM_JSON
        assert IntegrationCapability.PATIENT_DATA in integration.capabilities
    
    def test_create_integration_restful(self):
        """Test creating a RESTful integration."""
        auth_config = {
            "api_key": "test_api_key"
        }
        
        integration = create_integration(
            provider_name="eyecloudpro",
            auth_config=auth_config,
            capability=IntegrationCapability.PATIENT_DATA
        )
        
        assert isinstance(integration, RESTfulPatientIntegration)
        assert integration.provider_name == "eyecloudpro"
        assert integration.auth_config == auth_config
        assert integration.standard == IntegrationStandard.RESTFUL
        assert IntegrationCapability.PATIENT_DATA in integration.capabilities
    
    def test_create_integration_custom_csv_xml(self):
        """Test creating a Custom CSV/XML integration."""
        auth_config = {}
        
        # Create temporary directories for import/export
        with tempfile.TemporaryDirectory() as import_dir, tempfile.TemporaryDirectory() as export_dir:
            integration = create_integration(
                provider_name="myvisionexpress",
                auth_config=auth_config,
                capability=IntegrationCapability.PATIENT_DATA,
                import_directory=import_dir,
                export_directory=export_dir
            )
            
            assert isinstance(integration, CustomCSVXMLPatientIntegration)
            assert integration.provider_name == "myvisionexpress"
            assert integration.auth_config == auth_config
            assert integration.standard == IntegrationStandard.CUSTOM_CSV_XML
            assert IntegrationCapability.PATIENT_DATA in integration.capabilities
            assert integration.file_format == FileFormat.CSV
            assert integration.import_directory == import_dir
            assert integration.export_directory == export_dir
    
    def test_create_integration_invalid_provider(self):
        """Test creating an integration with an invalid provider."""
        auth_config = {}
        
        with pytest.raises(ValueError):
            create_integration(
                provider_name="invalid_provider",
                auth_config=auth_config,
                capability=IntegrationCapability.PATIENT_DATA
            )
    
    def test_create_integration_invalid_capability(self):
        """Test creating an integration with an invalid capability."""
        auth_config = {}
        
        # Officemate doesn't support clinical data
        with pytest.raises(ValueError):
            create_integration(
                provider_name="officemate",
                auth_config=auth_config,
                capability=IntegrationCapability.CLINICAL_DATA
            )