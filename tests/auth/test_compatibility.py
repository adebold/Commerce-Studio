"""Tests for backward compatibility layer."""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta

from src.auth.compatibility import BackwardCompatibilityManager
from src.auth.api_key import ApiKeyManager, ApiKey, ApiKeyScope
from src.auth.auth import AuthManager
from src.auth.rbac import UserContext, Role


class TestBackwardCompatibilityManager:
    """Test cases for BackwardCompatibilityManager."""
    
    @pytest.fixture
    def api_key_manager(self):
        """Mock API key manager."""
        return Mock(spec=ApiKeyManager)
    
    @pytest.fixture
    def auth_manager(self):
        """Mock auth manager."""
        return Mock(spec=AuthManager)
    
    @pytest.fixture
    def compatibility_manager(self, api_key_manager, auth_manager):
        """BackwardCompatibilityManager instance."""
        return BackwardCompatibilityManager(api_key_manager, auth_manager)
    
    def test_migrate_legacy_api_key(self, compatibility_manager, api_key_manager):
        """Test migrating a legacy API key to new format."""
        # Mock API key creation
        new_api_key = ApiKey(
            id="new_key_id",
            tenant_id="test_tenant",
            name="Migrated Key",
            prefix="new",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="migration_user",
            created_at=datetime.utcnow()
        )
        api_key_manager.create_api_key.return_value = (new_api_key, "new.secret123")
        
        # Migrate legacy key
        legacy_key = "legacy_key_123"
        migrated_key, new_key_string = compatibility_manager.migrate_legacy_api_key(
            legacy_key=legacy_key,
            tenant_id="test_tenant",
            name="Migrated Legacy Key",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="migration_user"
        )
        
        assert migrated_key == new_api_key
        assert new_key_string == "new.secret123"
        assert compatibility_manager._legacy_key_mappings[legacy_key] == "new_key_id"
        
        # Verify API key manager was called correctly
        api_key_manager.create_api_key.assert_called_once_with(
            tenant_id="test_tenant",
            name="Migrated Legacy Key",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="migration_user",
            metadata={}
        )
    
    def test_verify_legacy_api_key_with_mapping(self, compatibility_manager, api_key_manager):
        """Test verifying a legacy API key with existing mapping."""
        # Set up mapping
        legacy_key = "legacy_key_456"
        new_key_id = "mapped_key_id"
        compatibility_manager._legacy_key_mappings[legacy_key] = new_key_id
        
        # Mock API key retrieval
        mapped_api_key = ApiKey(
            id=new_key_id,
            tenant_id="test_tenant",
            name="Mapped Key",
            prefix="mapped",
            key_hash="hash",
            scopes=[ApiKeyScope.WRITE],
            created_by="user",
            created_at=datetime.utcnow()
        )
        api_key_manager.get_api_key.return_value = mapped_api_key
        
        # Verify legacy key
        result = compatibility_manager.verify_legacy_api_key(legacy_key)
        
        assert result == mapped_api_key
        api_key_manager.get_api_key.assert_called_once_with(new_key_id)
    
    def test_verify_legacy_api_key_fallback(self, compatibility_manager, api_key_manager):
        """Test verifying a legacy API key without mapping (fallback to regular verification)."""
        legacy_key = "unknown_legacy_key"
        
        # Mock regular API key verification
        regular_api_key = ApiKey(
            id="regular_key_id",
            tenant_id="test_tenant",
            name="Regular Key",
            prefix="regular",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="user",
            created_at=datetime.utcnow()
        )
        api_key_manager.verify_api_key.return_value = regular_api_key
        
        # Verify key
        result = compatibility_manager.verify_legacy_api_key(legacy_key)
        
        assert result == regular_api_key
        api_key_manager.verify_api_key.assert_called_once_with(legacy_key)
    
    def test_extract_kong_headers(self, compatibility_manager):
        """Test extracting Kong-specific headers."""
        headers = {
            "X-Kong-Consumer-ID": "consumer_123",
            "X-Kong-Consumer-Username": "test_user",
            "X-Kong-Consumer-Custom-ID": "custom_456",
            "X-Kong-Credential-Username": "cred_user",
            "Authorization": "Bearer token123",  # Should be ignored
            "Content-Type": "application/json"   # Should be ignored
        }
        
        kong_metadata = compatibility_manager.extract_kong_headers(headers)
        
        expected = {
            "consumer_id": "consumer_123",
            "consumer_username": "test_user",
            "consumer_custom_id": "custom_456",
            "credential_username": "cred_user"
        }
        assert kong_metadata == expected
    
    def test_extract_kong_headers_empty(self, compatibility_manager):
        """Test extracting Kong headers when none are present."""
        headers = {
            "Authorization": "Bearer token123",
            "Content-Type": "application/json"
        }
        
        kong_metadata = compatibility_manager.extract_kong_headers(headers)
        assert kong_metadata == {}
    
    def test_create_user_context_from_kong_headers(self, compatibility_manager):
        """Test creating user context from Kong headers."""
        headers = {
            "X-Kong-Consumer-ID": "consumer_789",
            "X-Kong-Consumer-Username": "kong_user",
            "X-Kong-Consumer-Custom-ID": "custom_789"
        }
        
        user_context = compatibility_manager.create_user_context_from_kong_headers(
            headers, default_tenant_id="kong_tenant"
        )
        
        assert user_context is not None
        assert user_context.user_id == "kong_custom_789"  # Uses custom_id first
        assert user_context.tenant_id == "kong_tenant"
        assert Role.CLIENT_USER in user_context.roles
    
    def test_create_user_context_from_kong_headers_consumer_id_only(self, compatibility_manager):
        """Test creating user context with only consumer ID."""
        headers = {
            "X-Kong-Consumer-ID": "consumer_only_123"
        }
        
        user_context = compatibility_manager.create_user_context_from_kong_headers(headers)
        
        assert user_context is not None
        assert user_context.user_id == "kong_consumer_only_123"
        assert Role.CLIENT_USER in user_context.roles
    
    def test_create_user_context_from_kong_headers_no_kong_data(self, compatibility_manager):
        """Test creating user context with no Kong headers."""
        headers = {
            "Authorization": "Bearer token123",
            "Content-Type": "application/json"
        }
        
        user_context = compatibility_manager.create_user_context_from_kong_headers(headers)
        assert user_context is None
    
    def test_validate_kong_jwt_success(self, compatibility_manager, auth_manager):
        """Test successful Kong JWT validation."""
        jwt_token = "kong.jwt.token"
        expected_user_context = UserContext(
            user_id="kong_user",
            roles=[Role.CLIENT_USER],
            tenant_id="kong_tenant"
        )
        
        # Mock successful JWT verification
        auth_manager.verify_token.return_value = expected_user_context
        
        result = compatibility_manager.validate_kong_jwt(jwt_token)
        
        assert result == expected_user_context
        auth_manager.verify_token.assert_called_once_with(jwt_token)
    
    def test_validate_kong_jwt_failure(self, compatibility_manager, auth_manager):
        """Test failed Kong JWT validation."""
        jwt_token = "invalid.kong.jwt"
        
        # Mock failed JWT verification
        auth_manager.verify_token.return_value = None
        
        result = compatibility_manager.validate_kong_jwt(jwt_token)
        
        assert result is None
        auth_manager.verify_token.assert_called_once_with(jwt_token)
    
    def test_migrate_kong_consumer_to_api_key(self, compatibility_manager, api_key_manager):
        """Test migrating Kong consumer to API key."""
        # Mock API key creation
        new_api_key = ApiKey(
            id="migrated_consumer_key",
            tenant_id="consumer_tenant",
            name="Migrated from Kong: kong_consumer",
            prefix="migrated",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY, ApiKeyScope.WRITE],
            created_by="system_migration",
            created_at=datetime.utcnow(),
            metadata={
                "kong_consumer_id": "kong_consumer_123",
                "kong_consumer_username": "kong_consumer",
                "migrated_from_kong": True
            }
        )
        api_key_manager.create_api_key.return_value = (new_api_key, "migrated.secret456")
        
        # Migrate consumer
        api_key, key_string = compatibility_manager.migrate_kong_consumer_to_api_key(
            consumer_id="kong_consumer_123",
            consumer_username="kong_consumer",
            tenant_id="consumer_tenant"
        )
        
        assert api_key == new_api_key
        assert key_string == "migrated.secret456"
        
        # Verify metadata was set correctly
        call_args = api_key_manager.create_api_key.call_args
        metadata = call_args[1]["metadata"]
        assert metadata["kong_consumer_id"] == "kong_consumer_123"
        assert metadata["kong_consumer_username"] == "kong_consumer"
        assert metadata["migrated_from_kong"] is True
        assert "migration_date" in metadata
    
    def test_get_migration_status(self, compatibility_manager):
        """Test getting migration status."""
        # Add some legacy mappings
        compatibility_manager._legacy_key_mappings = {
            "legacy1": "new1",
            "legacy2": "new2"
        }
        
        status = compatibility_manager.get_migration_status()
        
        assert status["legacy_keys_mapped"] == 2
        assert "kong_headers_supported" in status
        assert "migration_timestamp" in status
        assert len(status["kong_headers_supported"]) > 0
    
    def test_validate_mixed_auth_jwt_success(self, compatibility_manager, auth_manager):
        """Test mixed authentication with successful JWT."""
        auth_header = "Bearer jwt.token.here"
        kong_headers = {"X-Kong-Consumer-ID": "fallback_consumer"}
        
        expected_user_context = UserContext(
            user_id="jwt_user",
            roles=[Role.CLIENT_ADMIN],
            tenant_id="jwt_tenant"
        )
        auth_manager.verify_token.return_value = expected_user_context
        
        result = compatibility_manager.validate_mixed_auth(auth_header, kong_headers)
        
        assert result == expected_user_context
        auth_manager.verify_token.assert_called_once_with("jwt.token.here")
    
    def test_validate_mixed_auth_api_key_success(self, compatibility_manager, auth_manager, api_key_manager):
        """Test mixed authentication with successful API key."""
        auth_header = "Bearer api.key.here"
        kong_headers = {"X-Kong-Consumer-ID": "fallback_consumer"}
        
        # Mock failed JWT verification
        auth_manager.verify_token.return_value = None
        
        # Mock successful API key verification
        api_key = ApiKey(
            id="api_key_id",
            tenant_id="api_tenant",
            name="API Key",
            prefix="api",
            key_hash="hash",
            scopes=[ApiKeyScope.WRITE],
            created_by="user",
            created_at=datetime.utcnow()
        )
        api_key_manager.verify_api_key.return_value = api_key
        
        result = compatibility_manager.validate_mixed_auth(auth_header, kong_headers)
        
        assert result is not None
        assert result.user_id == "api_key_api_key_id"
        assert result.tenant_id == "api_tenant"
        assert Role.CLIENT_ADMIN in result.roles
    
    def test_validate_mixed_auth_kong_headers_fallback(self, compatibility_manager, auth_manager, api_key_manager):
        """Test mixed authentication falling back to Kong headers."""
        auth_header = "Bearer invalid.token"
        kong_headers = {"X-Kong-Consumer-ID": "kong_consumer_456"}
        
        # Mock failed JWT and API key verification
        auth_manager.verify_token.return_value = None
        api_key_manager.verify_api_key.return_value = None
        compatibility_manager.verify_legacy_api_key = Mock(return_value=None)
        
        result = compatibility_manager.validate_mixed_auth(auth_header, kong_headers)
        
        assert result is not None
        assert result.user_id == "kong_kong_consumer_456"
        assert Role.CLIENT_USER in result.roles
    
    def test_validate_mixed_auth_no_auth(self, compatibility_manager):
        """Test mixed authentication with no valid authentication."""
        auth_header = None
        kong_headers = {}
        
        result = compatibility_manager.validate_mixed_auth(auth_header, kong_headers)
        assert result is None
    
    def test_create_user_context_from_api_key_admin_scope(self, compatibility_manager):
        """Test creating user context from API key with admin scope."""
        api_key = ApiKey(
            id="admin_key",
            tenant_id="admin_tenant",
            name="Admin Key",
            prefix="admin",
            key_hash="hash",
            scopes=[ApiKeyScope.ADMIN],
            created_by="admin",
            created_at=datetime.utcnow(),
            metadata={"client_id": "admin_client"}
        )
        
        user_context = compatibility_manager._create_user_context_from_api_key(api_key)
        
        assert user_context.user_id == "api_key_admin_key"
        assert user_context.tenant_id == "admin_tenant"
        assert user_context.client_id == "admin_client"
        assert Role.TENANT_ADMIN in user_context.roles
    
    def test_create_user_context_from_api_key_multiple_scopes(self, compatibility_manager):
        """Test creating user context from API key with multiple scopes."""
        api_key = ApiKey(
            id="multi_key",
            tenant_id="multi_tenant",
            name="Multi Scope Key",
            prefix="multi",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY, ApiKeyScope.ANALYTICS],
            created_by="user",
            created_at=datetime.utcnow()
        )
        
        user_context = compatibility_manager._create_user_context_from_api_key(api_key)
        
        assert user_context.user_id == "api_key_multi_key"
        assert Role.CLIENT_USER in user_context.roles
        assert Role.ANALYST in user_context.roles
        assert len(user_context.roles) == 2


if __name__ == "__main__":
    pytest.main([__file__])