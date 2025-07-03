"""Tests for enhanced API key functionality."""

import pytest
from unittest.mock import Mock, patch
from fastapi import Request, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from datetime import datetime, timedelta

from src.auth.api_key import (
    ApiKeyManager, ApiKey, ApiKeyScope, ApiKeyBearer, 
    ApiKeyDependency, create_api_key_dependency
)
from src.auth.rbac import UserContext, Role


class TestApiKeyBearer:
    """Test cases for ApiKeyBearer security scheme."""
    
    @pytest.fixture
    def api_key_manager(self):
        """Mock API key manager."""
        return Mock(spec=ApiKeyManager)
    
    @pytest.fixture
    def api_key_bearer(self, api_key_manager):
        """ApiKeyBearer instance."""
        return ApiKeyBearer(api_key_manager, auto_error=True)
    
    @pytest.fixture
    def mock_request(self):
        """Mock FastAPI request."""
        request = Mock(spec=Request)
        request.client = Mock()
        request.client.host = "127.0.0.1"
        request.headers = {}
        request.state = Mock()
        return request
    
    @pytest.fixture
    def valid_api_key(self):
        """Valid API key object."""
        return ApiKey(
            id="test_key_id",
            tenant_id="test_tenant",
            name="Test API Key",
            prefix="test",
            key_hash="hashed_secret",
            scopes=[ApiKeyScope.READ_ONLY, ApiKeyScope.WRITE],
            created_by="test_user",
            created_at=datetime.utcnow()
        )
    
    @pytest.mark.asyncio
    async def test_valid_api_key_authentication(self, api_key_bearer, api_key_manager, mock_request, valid_api_key):
        """Test successful API key authentication."""
        # Mock the parent HTTPBearer call
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="test.secret123")
        
        with patch.object(api_key_bearer.__class__.__bases__[0], '__call__', return_value=credentials):
            # Mock API key verification
            api_key_manager.verify_api_key.return_value = valid_api_key
            
            result = await api_key_bearer(mock_request)
            
            assert result == valid_api_key
            assert mock_request.state.api_key == valid_api_key
            api_key_manager.verify_api_key.assert_called_once_with("test.secret123", "127.0.0.1")
    
    @pytest.mark.asyncio
    async def test_invalid_api_key_authentication(self, api_key_bearer, api_key_manager, mock_request):
        """Test failed API key authentication."""
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid.key")
        
        with patch.object(api_key_bearer.__class__.__bases__[0], '__call__', return_value=credentials):
            # Mock API key verification failure
            api_key_manager.verify_api_key.return_value = None
            
            with pytest.raises(HTTPException) as exc_info:
                await api_key_bearer(mock_request)
            
            assert exc_info.value.status_code == 401
            assert "Invalid or expired API key" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_missing_credentials(self, api_key_bearer, mock_request):
        """Test missing credentials."""
        with patch.object(api_key_bearer.__class__.__bases__[0], '__call__', return_value=None):
            with pytest.raises(HTTPException) as exc_info:
                await api_key_bearer(mock_request)
            
            assert exc_info.value.status_code == 401
            assert "Missing API key" in exc_info.value.detail
    
    def test_get_client_ip_forwarded_for(self, api_key_bearer, mock_request):
        """Test client IP extraction from X-Forwarded-For header."""
        mock_request.headers = {"X-Forwarded-For": "192.168.1.1, 10.0.0.1"}
        
        ip = api_key_bearer._get_client_ip(mock_request)
        assert ip == "192.168.1.1"
    
    def test_get_client_ip_real_ip(self, api_key_bearer, mock_request):
        """Test client IP extraction from X-Real-IP header."""
        mock_request.headers = {"X-Real-IP": "192.168.1.2"}
        
        ip = api_key_bearer._get_client_ip(mock_request)
        assert ip == "192.168.1.2"
    
    def test_get_client_ip_direct(self, api_key_bearer, mock_request):
        """Test client IP extraction from direct connection."""
        ip = api_key_bearer._get_client_ip(mock_request)
        assert ip == "127.0.0.1"


class TestApiKeyDependency:
    """Test cases for ApiKeyDependency."""
    
    @pytest.fixture
    def api_key_manager(self):
        """Mock API key manager."""
        return Mock(spec=ApiKeyManager)
    
    @pytest.fixture
    def mock_request(self):
        """Mock FastAPI request."""
        request = Mock(spec=Request)
        request.client = Mock()
        request.client.host = "127.0.0.1"
        request.headers = {}
        request.state = Mock()
        return request
    
    @pytest.fixture
    def valid_api_key(self):
        """Valid API key object."""
        return ApiKey(
            id="test_key_id",
            tenant_id="test_tenant",
            name="Test API Key",
            prefix="test",
            key_hash="hashed_secret",
            scopes=[ApiKeyScope.READ_ONLY, ApiKeyScope.WRITE, ApiKeyScope.ANALYTICS],
            created_by="test_user",
            created_at=datetime.utcnow(),
            metadata={"client_id": "test_client", "brand_id": "test_brand"}
        )
    
    @pytest.mark.asyncio
    async def test_successful_authentication_with_scopes(self, api_key_manager, mock_request, valid_api_key):
        """Test successful authentication with required scopes."""
        dependency = ApiKeyDependency(
            api_key_manager=api_key_manager,
            required_scopes=[ApiKeyScope.READ_ONLY, ApiKeyScope.ANALYTICS]
        )
        
        # Mock the security call
        with patch.object(dependency.security, '__call__', return_value=valid_api_key):
            api_key, user_context = await dependency(mock_request)
            
            assert api_key == valid_api_key
            assert isinstance(user_context, UserContext)
            assert user_context.user_id == "api_key_test_key_id"
            assert user_context.tenant_id == "test_tenant"
            assert user_context.client_id == "test_client"
            assert user_context.brand_id == "test_brand"
            assert mock_request.state.user == user_context
    
    @pytest.mark.asyncio
    async def test_insufficient_scopes(self, api_key_manager, mock_request, valid_api_key):
        """Test authentication failure due to insufficient scopes."""
        dependency = ApiKeyDependency(
            api_key_manager=api_key_manager,
            required_scopes=[ApiKeyScope.ADMIN]  # Not in valid_api_key.scopes
        )
        
        with patch.object(dependency.security, '__call__', return_value=valid_api_key):
            with pytest.raises(HTTPException) as exc_info:
                await dependency(mock_request)
            
            assert exc_info.value.status_code == 403
            assert "Insufficient API key permissions" in exc_info.value.detail
            assert "admin" in exc_info.value.detail
    
    def test_create_user_context_from_api_key_admin_scope(self, api_key_manager):
        """Test user context creation for admin scope."""
        api_key = ApiKey(
            id="admin_key",
            tenant_id="test_tenant",
            name="Admin Key",
            prefix="admin",
            key_hash="hash",
            scopes=[ApiKeyScope.ADMIN],
            created_by="admin_user",
            created_at=datetime.utcnow()
        )
        
        dependency = ApiKeyDependency(api_key_manager)
        user_context = dependency._create_user_context_from_api_key(api_key)
        
        assert Role.TENANT_ADMIN in user_context.roles
        assert user_context.user_id == "api_key_admin_key"
        assert user_context.tenant_id == "test_tenant"
    
    def test_create_user_context_from_api_key_write_scope(self, api_key_manager):
        """Test user context creation for write scope."""
        api_key = ApiKey(
            id="write_key",
            tenant_id="test_tenant",
            name="Write Key",
            prefix="write",
            key_hash="hash",
            scopes=[ApiKeyScope.WRITE],
            created_by="user",
            created_at=datetime.utcnow()
        )
        
        dependency = ApiKeyDependency(api_key_manager)
        user_context = dependency._create_user_context_from_api_key(api_key)
        
        assert Role.CLIENT_ADMIN in user_context.roles
        assert user_context.user_id == "api_key_write_key"
    
    def test_create_user_context_from_api_key_read_only_scope(self, api_key_manager):
        """Test user context creation for read-only scope."""
        api_key = ApiKey(
            id="readonly_key",
            tenant_id="test_tenant",
            name="Read-Only Key",
            prefix="readonly",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="user",
            created_at=datetime.utcnow()
        )
        
        dependency = ApiKeyDependency(api_key_manager)
        user_context = dependency._create_user_context_from_api_key(api_key)
        
        assert Role.CLIENT_USER in user_context.roles
        assert user_context.user_id == "api_key_readonly_key"
    
    def test_create_user_context_from_api_key_analytics_scope(self, api_key_manager):
        """Test user context creation with analytics scope."""
        api_key = ApiKey(
            id="analytics_key",
            tenant_id="test_tenant",
            name="Analytics Key",
            prefix="analytics",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY, ApiKeyScope.ANALYTICS],
            created_by="user",
            created_at=datetime.utcnow()
        )
        
        dependency = ApiKeyDependency(api_key_manager)
        user_context = dependency._create_user_context_from_api_key(api_key)
        
        assert Role.CLIENT_USER in user_context.roles
        assert Role.ANALYST in user_context.roles
        assert len(user_context.roles) == 2
    
    def test_create_user_context_from_api_key_no_scopes(self, api_key_manager):
        """Test user context creation with no scopes (default role)."""
        api_key = ApiKey(
            id="no_scope_key",
            tenant_id="test_tenant",
            name="No Scope Key",
            prefix="noscope",
            key_hash="hash",
            scopes=[],
            created_by="user",
            created_at=datetime.utcnow()
        )
        
        dependency = ApiKeyDependency(api_key_manager)
        user_context = dependency._create_user_context_from_api_key(api_key)
        
        assert user_context.roles == [Role.CLIENT_USER]


class TestCreateApiKeyDependency:
    """Test cases for create_api_key_dependency function."""
    
    def test_create_dependency_no_scopes(self):
        """Test creating dependency without required scopes."""
        api_key_manager = Mock(spec=ApiKeyManager)
        
        dependency = create_api_key_dependency(api_key_manager)
        
        assert isinstance(dependency, ApiKeyDependency)
        assert dependency.api_key_manager == api_key_manager
        assert dependency.required_scopes == []
    
    def test_create_dependency_with_scopes(self):
        """Test creating dependency with required scopes."""
        api_key_manager = Mock(spec=ApiKeyManager)
        required_scopes = [ApiKeyScope.READ_ONLY, ApiKeyScope.ANALYTICS]
        
        dependency = create_api_key_dependency(api_key_manager, required_scopes)
        
        assert isinstance(dependency, ApiKeyDependency)
        assert dependency.api_key_manager == api_key_manager
        assert dependency.required_scopes == required_scopes


class TestApiKeyManagerIntegration:
    """Integration tests for API key manager with FastAPI security."""
    
    @pytest.fixture
    def api_key_manager(self):
        """Real API key manager instance."""
        return ApiKeyManager()
    
    def test_create_and_verify_api_key(self, api_key_manager):
        """Test creating and verifying an API key."""
        # Create API key
        api_key, key_string = api_key_manager.create_api_key(
            tenant_id="test_tenant",
            name="Integration Test Key",
            scopes=[ApiKeyScope.READ_ONLY, ApiKeyScope.WRITE],
            created_by="test_user"
        )
        
        assert api_key is not None
        assert key_string is not None
        assert "." in key_string  # Should have prefix.secret format
        
        # Verify API key
        verified_key = api_key_manager.verify_api_key(key_string)
        assert verified_key is not None
        assert verified_key.id == api_key.id
        assert verified_key.tenant_id == "test_tenant"
        assert ApiKeyScope.READ_ONLY in verified_key.scopes
        assert ApiKeyScope.WRITE in verified_key.scopes
    
    def test_api_key_expiration(self, api_key_manager):
        """Test API key expiration."""
        # Create expired API key
        api_key, key_string = api_key_manager.create_api_key(
            tenant_id="test_tenant",
            name="Expired Key",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="test_user",
            expires_in_days=-1  # Already expired
        )
        
        # Should not verify expired key
        verified_key = api_key_manager.verify_api_key(key_string)
        assert verified_key is None
    
    def test_api_key_revocation(self, api_key_manager):
        """Test API key revocation."""
        # Create API key
        api_key, key_string = api_key_manager.create_api_key(
            tenant_id="test_tenant",
            name="To Be Revoked",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="test_user"
        )
        
        # Verify it works initially
        verified_key = api_key_manager.verify_api_key(key_string)
        assert verified_key is not None
        
        # Revoke the key
        revoked_key = api_key_manager.revoke_api_key(
            api_key.id,
            revoked_by="admin",
            reason="Test revocation"
        )
        assert revoked_key is not None
        assert revoked_key.revoked_at is not None
        
        # Should not verify revoked key
        verified_key = api_key_manager.verify_api_key(key_string)
        assert verified_key is None


if __name__ == "__main__":
    pytest.main([__file__])