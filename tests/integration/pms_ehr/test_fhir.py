"""
Tests for the FHIR integration.
"""

import pytest
import json
from unittest.mock import patch, MagicMock, AsyncMock

from src.integrations.pms_ehr.base import (
    IntegrationCapability,
    IntegrationStandard,
    AuthMethod,
    IntegrationError,
    AuthenticationError,
    ConnectionError
)
from src.integrations.pms_ehr.fhir import (
    FHIRIntegration,
    FHIRPatientIntegration,
    FHIRInventoryIntegration,
    FHIROrderIntegration,
    FHIRClinicalDataIntegration
)


class TestFHIRIntegration:
    """Tests for the FHIR integration."""
    
    @pytest.fixture
    def auth_config(self):
        """Authentication configuration for testing."""
        return {
            "client_id": "test_client_id",
            "client_secret": "test_client_secret"
        }
    
    @pytest.fixture
    def fhir_integration(self, auth_config):
        """Create a FHIR integration for testing."""
        return FHIRIntegration(
            provider_name="test_provider",
            base_url="https://test.fhir.server/fhir",
            auth_config=auth_config,
            capabilities=[IntegrationCapability.PATIENT_DATA],
            fhir_version="R4"
        )
    
    @pytest.mark.asyncio
    async def test_init(self, fhir_integration, auth_config):
        """Test initialization of FHIR integration."""
        assert fhir_integration.provider_name == "test_provider"
        assert fhir_integration.base_url == "https://test.fhir.server/fhir"
        assert fhir_integration.auth_config == auth_config
        assert fhir_integration.standard == IntegrationStandard.FHIR
        assert IntegrationCapability.PATIENT_DATA in fhir_integration.capabilities
        assert fhir_integration.fhir_version == "R4"
        assert fhir_integration.auth_method == AuthMethod.OAUTH2
    
    @pytest.mark.asyncio
    async def test_oauth2_authenticate(self, fhir_integration):
        """Test OAuth2 authentication."""
        # Mock the session post method
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            "access_token": "test_access_token",
            "expires_in": 3600
        })
        
        mock_session = MagicMock()
        mock_session.post = AsyncMock(return_value=mock_response)
        
        # Set the session
        fhir_integration.session = mock_session
        
        # Call the method
        result = await fhir_integration._oauth2_authenticate()
        
        # Check the result
        assert result is True
        assert fhir_integration.token == "test_access_token"
        assert fhir_integration._authenticated is True
        
        # Check that the session post method was called correctly
        mock_session.post.assert_called_once()
        args, kwargs = mock_session.post.call_args
        assert args[0] == "https://test.fhir.server/fhir/token"
        assert kwargs["data"] == {
            "grant_type": "client_credentials",
            "client_id": "test_client_id",
            "client_secret": "test_client_secret",
            "scope": "patient/*.read"
        }
    
    @pytest.mark.asyncio
    async def test_oauth2_authenticate_failure(self, fhir_integration):
        """Test OAuth2 authentication failure."""
        # Mock the session post method
        mock_response = MagicMock()
        mock_response.status = 401
        mock_response.text = AsyncMock(return_value="Unauthorized")
        
        mock_session = MagicMock()
        mock_session.post = AsyncMock(return_value=mock_response)
        
        # Set the session
        fhir_integration.session = mock_session
        
        # Call the method
        result = await fhir_integration._oauth2_authenticate()
        
        # Check the result
        assert result is False
        assert fhir_integration.token is None
        assert fhir_integration._authenticated is False
    
    @pytest.mark.asyncio
    async def test_api_key_authenticate(self, auth_config):
        """Test API key authentication."""
        # Create a FHIR integration with API key authentication
        auth_config = {"api_key": "test_api_key"}
        fhir_integration = FHIRIntegration(
            provider_name="test_provider",
            base_url="https://test.fhir.server/fhir",
            auth_config=auth_config,
            capabilities=[IntegrationCapability.PATIENT_DATA]
        )
        
        # Call the method
        result = await fhir_integration._api_key_authenticate()
        
        # Check the result
        assert result is True
        assert fhir_integration.token == "test_api_key"
        assert fhir_integration._authenticated is True
    
    @pytest.mark.asyncio
    async def test_basic_auth_authenticate(self, auth_config):
        """Test basic authentication."""
        # Create a FHIR integration with basic authentication
        auth_config = {"username": "test_user", "password": "test_password"}
        fhir_integration = FHIRIntegration(
            provider_name="test_provider",
            base_url="https://test.fhir.server/fhir",
            auth_config=auth_config,
            capabilities=[IntegrationCapability.PATIENT_DATA]
        )
        
        # Call the method
        result = await fhir_integration._basic_auth_authenticate()
        
        # Check the result
        assert result is True
        assert fhir_integration._authenticated is True
    
    @pytest.mark.asyncio
    async def test_test_connection(self, fhir_integration):
        """Test connection testing."""
        # Mock the authenticate method
        fhir_integration.authenticate = AsyncMock(return_value=True)
        fhir_integration._authenticated = True
        
        # Mock the _get_headers method
        fhir_integration._get_headers = AsyncMock(return_value={"Authorization": "Bearer test_token"})
        
        # Mock the session get method
        mock_response = MagicMock()
        mock_response.status = 200
        
        mock_session = MagicMock()
        mock_session.get = AsyncMock(return_value=mock_response)
        
        # Set the session
        fhir_integration.session = mock_session
        
        # Call the method
        result = await fhir_integration.test_connection()
        
        # Check the result
        assert result is True
        
        # Check that the session get method was called correctly
        mock_session.get.assert_called_once()
        args, kwargs = mock_session.get.call_args
        assert args[0] == "https://test.fhir.server/fhir/metadata"
        assert kwargs["headers"] == {"Authorization": "Bearer test_token"}
    
    @pytest.mark.asyncio
    async def test_test_connection_failure(self, fhir_integration):
        """Test connection testing failure."""
        # Mock the authenticate method
        fhir_integration.authenticate = AsyncMock(return_value=True)
        fhir_integration._authenticated = True
        
        # Mock the _get_headers method
        fhir_integration._get_headers = AsyncMock(return_value={"Authorization": "Bearer test_token"})
        
        # Mock the session get method
        mock_response = MagicMock()
        mock_response.status = 404
        
        mock_session = MagicMock()
        mock_session.get = AsyncMock(return_value=mock_response)
        
        # Set the session
        fhir_integration.session = mock_session
        
        # Call the method
        result = await fhir_integration.test_connection()
        
        # Check the result
        assert result is False
    
    @pytest.mark.asyncio
    async def test_get_resource(self, fhir_integration):
        """Test getting a resource."""
        # Mock the authenticate method
        fhir_integration.authenticate = AsyncMock(return_value=True)
        fhir_integration._authenticated = True
        
        # Mock the _get_headers method
        fhir_integration._get_headers = AsyncMock(return_value={"Authorization": "Bearer test_token"})
        
        # Mock the _get_auth method
        fhir_integration._get_auth = AsyncMock(return_value=None)
        
        # Mock the session get method
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={"id": "test_id", "resourceType": "Patient"})
        
        mock_session = MagicMock()
        mock_session.get = AsyncMock(return_value=mock_response)
        
        # Set the session
        fhir_integration.session = mock_session
        
        # Call the method
        result = await fhir_integration._get_resource("Patient", "test_id")
        
        # Check the result
        assert result == {"id": "test_id", "resourceType": "Patient"}
        
        # Check that the session get method was called correctly
        mock_session.get.assert_called_once()
        args, kwargs = mock_session.get.call_args
        assert args[0] == "https://test.fhir.server/fhir/Patient/test_id"
        assert kwargs["headers"] == {"Authorization": "Bearer test_token"}
    
    @pytest.mark.asyncio
    async def test_get_resource_not_found(self, fhir_integration):
        """Test getting a resource that doesn't exist."""
        # Mock the authenticate method
        fhir_integration.authenticate = AsyncMock(return_value=True)
        fhir_integration._authenticated = True
        
        # Mock the _get_headers method
        fhir_integration._get_headers = AsyncMock(return_value={"Authorization": "Bearer test_token"})
        
        # Mock the _get_auth method
        fhir_integration._get_auth = AsyncMock(return_value=None)
        
        # Mock the session get method
        mock_response = MagicMock()
        mock_response.status = 404
        
        mock_session = MagicMock()
        mock_session.get = AsyncMock(return_value=mock_response)
        
        # Set the session
        fhir_integration.session = mock_session
        
        # Call the method
        with pytest.raises(IntegrationError):
            await fhir_integration._get_resource("Patient", "test_id")
    
    @pytest.mark.asyncio
    async def test_search_resources(self, fhir_integration):
        """Test searching for resources."""
        # Mock the authenticate method
        fhir_integration.authenticate = AsyncMock(return_value=True)
        fhir_integration._authenticated = True
        
        # Mock the _get_headers method
        fhir_integration._get_headers = AsyncMock(return_value={"Authorization": "Bearer test_token"})
        
        # Mock the _get_auth method
        fhir_integration._get_auth = AsyncMock(return_value=None)
        
        # Mock the session get method
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.json = AsyncMock(return_value={
            "entry": [
                {"resource": {"id": "test_id_1", "resourceType": "Patient"}},
                {"resource": {"id": "test_id_2", "resourceType": "Patient"}}
            ]
        })
        
        mock_session = MagicMock()
        mock_session.get = AsyncMock(return_value=mock_response)
        
        # Set the session
        fhir_integration.session = mock_session
        
        # Call the method
        result = await fhir_integration._search_resources("Patient", {"name": "test"})
        
        # Check the result
        assert result == [
            {"resource": {"id": "test_id_1", "resourceType": "Patient"}},
            {"resource": {"id": "test_id_2", "resourceType": "Patient"}}
        ]
        
        # Check that the session get method was called correctly
        mock_session.get.assert_called_once()
        args, kwargs = mock_session.get.call_args
        assert args[0] == "https://test.fhir.server/fhir/Patient"
        assert kwargs["params"] == {"name": "test"}
        assert kwargs["headers"] == {"Authorization": "Bearer test_token"}


class TestFHIRPatientIntegration:
    """Tests for the FHIR patient integration."""
    
    @pytest.fixture
    def auth_config(self):
        """Authentication configuration for testing."""
        return {
            "client_id": "test_client_id",
            "client_secret": "test_client_secret"
        }
    
    @pytest.fixture
    def patient_integration(self, auth_config):
        """Create a FHIR patient integration for testing."""
        return FHIRPatientIntegration(
            provider_name="test_provider",
            base_url="https://test.fhir.server/fhir",
            auth_config=auth_config,
            capabilities=[IntegrationCapability.PATIENT_DATA]
        )
    
    @pytest.mark.asyncio
    async def test_get_patient(self, patient_integration):
        """Test getting a patient."""
        # Mock the _get_resource method
        patient_integration._get_resource = AsyncMock(return_value={"id": "test_id", "resourceType": "Patient"})
        
        # Call the method
        result = await patient_integration.get_patient("test_id")
        
        # Check the result
        assert result == {"id": "test_id", "resourceType": "Patient"}
        
        # Check that the _get_resource method was called correctly
        patient_integration._get_resource.assert_called_once_with("Patient", "test_id")
    
    @pytest.mark.asyncio
    async def test_search_patients(self, patient_integration):
        """Test searching for patients."""
        # Mock the _search_resources method
        patient_integration._search_resources = AsyncMock(return_value=[
            {"resource": {"id": "test_id_1", "resourceType": "Patient"}},
            {"resource": {"id": "test_id_2", "resourceType": "Patient"}}
        ])
        
        # Call the method
        result = await patient_integration.search_patients({"name": "test"})
        
        # Check the result
        assert result == [
            {"resource": {"id": "test_id_1", "resourceType": "Patient"}},
            {"resource": {"id": "test_id_2", "resourceType": "Patient"}}
        ]
        
        # Check that the _search_resources method was called correctly
        patient_integration._search_resources.assert_called_once_with("Patient", {"name": "test"})
    
    @pytest.mark.asyncio
    async def test_create_patient(self, patient_integration):
        """Test creating a patient."""
        # Mock the _create_resource method
        patient_integration._create_resource = AsyncMock(return_value="test_id")
        
        # Call the method
        result = await patient_integration.create_patient({"name": [{"family": "Test", "given": ["John"]}]})
        
        # Check the result
        assert result == "test_id"
        
        # Check that the _create_resource method was called correctly
        patient_integration._create_resource.assert_called_once()
        args, kwargs = patient_integration._create_resource.call_args
        assert args[0] == "Patient"
        assert args[1]["resourceType"] == "Patient"
        assert args[1]["name"] == [{"family": "Test", "given": ["John"]}]
    
    @pytest.mark.asyncio
    async def test_update_patient(self, patient_integration):
        """Test updating a patient."""
        # Mock the _update_resource method
        patient_integration._update_resource = AsyncMock(return_value=True)
        
        # Call the method
        result = await patient_integration.update_patient("test_id", {"name": [{"family": "Test", "given": ["John"]}]})
        
        # Check the result
        assert result is True
        
        # Check that the _update_resource method was called correctly
        patient_integration._update_resource.assert_called_once()
        args, kwargs = patient_integration._update_resource.call_args
        assert args[0] == "Patient"
        assert args[1] == "test_id"
        assert args[2]["resourceType"] == "Patient"
        assert args[2]["id"] == "test_id"
        assert args[2]["name"] == [{"family": "Test", "given": ["John"]}]