"""Tests for JWT Authentication Middleware."""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi import FastAPI, Request, HTTPException
from fastapi.testclient import TestClient
import jwt
from datetime import datetime, timedelta

from src.api.middleware.jwt_auth import JWTAuthMiddleware, AuthenticationDependency
from src.auth.auth import AuthManager
from src.auth.token_validator import TokenValidator
from src.auth.api_key import ApiKeyManager, ApiKey, ApiKeyScope
from src.auth.rbac import RBACManager, UserContext, Role, Permission
from src.auth.tenant import TenantManager


class TestJWTAuthMiddleware:
    """Test cases for JWT Authentication Middleware."""
    
    @pytest.fixture
    def secret_key(self):
        """Test secret key."""
        return "test-secret-key-for-jwt-auth"
    
    @pytest.fixture
    def tenant_manager(self):
        """Mock tenant manager."""
        return Mock(spec=TenantManager)
    
    @pytest.fixture
    def auth_manager(self, secret_key):
        """Mock auth manager."""
        return Mock(spec=AuthManager)
    
    @pytest.fixture
    def token_validator(self, secret_key, tenant_manager):
        """Mock token validator."""
        return Mock(spec=TokenValidator)
    
    @pytest.fixture
    def api_key_manager(self):
        """Mock API key manager."""
        return Mock(spec=ApiKeyManager)
    
    @pytest.fixture
    def rbac_manager(self):
        """Mock RBAC manager."""
        return Mock(spec=RBACManager)
    
    @pytest.fixture
    def test_app(self, auth_manager, token_validator, api_key_manager, rbac_manager):
        """Test FastAPI app with JWT auth middleware."""
        app = FastAPI()
        
        # Add the middleware
        app.add_middleware(
            JWTAuthMiddleware,
            auth_manager=auth_manager,
            token_validator=token_validator,
            api_key_manager=api_key_manager,
            rbac_manager=rbac_manager,
            excluded_paths=["/health", "/public"]
        )
        
        @app.get("/health")
        async def health():
            return {"status": "ok"}
        
        @app.get("/public")
        async def public():
            return {"message": "public endpoint"}
        
        @app.get("/protected")
        async def protected(request: Request):
            user = getattr(request.state, "user", None)
            return {"user_id": user.user_id if user else None}
        
        return app
    
    @pytest.fixture
    def client(self, test_app):
        """Test client."""
        return TestClient(test_app)
    
    def test_excluded_paths_no_auth_required(self, client):
        """Test that excluded paths don't require authentication."""
        # Health endpoint should work without auth
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        
        # Public endpoint should work without auth
        response = client.get("/public")
        assert response.status_code == 200
        assert response.json() == {"message": "public endpoint"}
    
    def test_protected_endpoint_no_auth_header(self, client):
        """Test protected endpoint without auth header."""
        response = client.get("/protected")
        assert response.status_code == 200
        # Should work but with no user context
        assert response.json() == {"user_id": None}
    
    def test_protected_endpoint_invalid_auth_header(self, client):
        """Test protected endpoint with invalid auth header."""
        # Invalid format
        response = client.get("/protected", headers={"Authorization": "InvalidFormat"})
        assert response.status_code == 401
        
        # Invalid scheme
        response = client.get("/protected", headers={"Authorization": "Basic token123"})
        assert response.status_code == 401
    
    def test_jwt_authentication_success(self, client, token_validator):
        """Test successful JWT authentication."""
        # Mock successful token validation
        user_context = UserContext(
            user_id="test_user",
            roles=[Role.CLIENT_USER],
            tenant_id="test_tenant"
        )
        token_validator.validate_token.return_value = (True, user_context, None)
        
        response = client.get("/protected", headers={"Authorization": "Bearer valid_jwt_token"})
        assert response.status_code == 200
        assert response.json() == {"user_id": "test_user"}
    
    def test_jwt_authentication_failure(self, client, token_validator):
        """Test failed JWT authentication."""
        # Mock failed token validation
        token_validator.validate_token.return_value = (False, None, "Token expired")
        
        response = client.get("/protected", headers={"Authorization": "Bearer invalid_jwt_token"})
        assert response.status_code == 401
    
    def test_api_key_authentication_success(self, client, token_validator, api_key_manager):
        """Test successful API key authentication."""
        # Mock failed JWT validation (so it falls back to API key)
        token_validator.validate_token.return_value = (False, None, "Invalid JWT")
        
        # Mock successful API key validation
        api_key = ApiKey(
            id="test_key_id",
            tenant_id="test_tenant",
            name="Test Key",
            prefix="test",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="test_user",
            created_at=datetime.utcnow()
        )
        api_key_manager.verify_api_key.return_value = api_key
        
        response = client.get("/protected", headers={"Authorization": "Bearer test.api_key"})
        assert response.status_code == 200
        assert response.json() == {"user_id": "api_key_test_key_id"}
    
    def test_api_key_authentication_failure(self, client, token_validator, api_key_manager):
        """Test failed API key authentication."""
        # Mock failed JWT validation
        token_validator.validate_token.return_value = (False, None, "Invalid JWT")
        
        # Mock failed API key validation
        api_key_manager.verify_api_key.return_value = None
        
        response = client.get("/protected", headers={"Authorization": "Bearer invalid_api_key"})
        assert response.status_code == 401


class TestAuthenticationDependency:
    """Test cases for Authentication Dependency."""
    
    @pytest.fixture
    def mock_request(self):
        """Mock FastAPI request."""
        request = Mock(spec=Request)
        request.state = Mock()
        return request
    
    def test_require_auth_success(self, mock_request):
        """Test successful authentication requirement."""
        # Set up authenticated request
        user_context = UserContext(
            user_id="test_user",
            roles=[Role.CLIENT_USER],
            tenant_id="test_tenant"
        )
        mock_request.state.authenticated = True
        mock_request.state.user = user_context
        
        dependency = AuthenticationDependency(require_auth=True)
        
        # Should return user context without raising exception
        result = pytest.asyncio.run(dependency(mock_request))
        assert result == user_context
    
    def test_require_auth_failure_not_authenticated(self, mock_request):
        """Test authentication requirement failure - not authenticated."""
        mock_request.state.authenticated = False
        
        dependency = AuthenticationDependency(require_auth=True)
        
        with pytest.raises(HTTPException) as exc_info:
            pytest.asyncio.run(dependency(mock_request))
        
        assert exc_info.value.status_code == 401
        assert "Authentication required" in exc_info.value.detail
    
    def test_require_auth_failure_no_user_context(self, mock_request):
        """Test authentication requirement failure - no user context."""
        mock_request.state.authenticated = True
        mock_request.state.user = None
        
        dependency = AuthenticationDependency(require_auth=True)
        
        with pytest.raises(HTTPException) as exc_info:
            pytest.asyncio.run(dependency(mock_request))
        
        assert exc_info.value.status_code == 401
        assert "Invalid user context" in exc_info.value.detail
    
    def test_optional_auth_no_user(self, mock_request):
        """Test optional authentication with no user."""
        mock_request.state.authenticated = False
        mock_request.state.user = None
        
        dependency = AuthenticationDependency(require_auth=False)
        
        # Should not raise exception
        result = pytest.asyncio.run(dependency(mock_request))
        assert result is None
    
    def test_permission_check_success(self, mock_request):
        """Test successful permission check."""
        user_context = UserContext(
            user_id="test_user",
            roles=[Role.CLIENT_ADMIN],
            tenant_id="test_tenant"
        )
        mock_request.state.authenticated = True
        mock_request.state.user = user_context
        
        # Mock RBAC manager
        with patch('src.api.middleware.jwt_auth.RBACManager') as mock_rbac_class:
            mock_rbac = Mock()
            mock_rbac.has_permission.return_value = True
            mock_rbac_class.return_value = mock_rbac
            
            dependency = AuthenticationDependency(
                required_permissions=[Permission.MANAGE_PRODUCTS],
                require_auth=True
            )
            
            result = pytest.asyncio.run(dependency(mock_request))
            assert result == user_context
    
    def test_permission_check_failure(self, mock_request):
        """Test failed permission check."""
        user_context = UserContext(
            user_id="test_user",
            roles=[Role.CLIENT_USER],
            tenant_id="test_tenant"
        )
        mock_request.state.authenticated = True
        mock_request.state.user = user_context
        
        # Mock RBAC manager
        with patch('src.api.middleware.jwt_auth.RBACManager') as mock_rbac_class:
            mock_rbac = Mock()
            mock_rbac.has_permission.return_value = False
            mock_rbac_class.return_value = mock_rbac
            
            dependency = AuthenticationDependency(
                required_permissions=[Permission.MANAGE_PRODUCTS],
                require_auth=True
            )
            
            with pytest.raises(HTTPException) as exc_info:
                pytest.asyncio.run(dependency(mock_request))
            
            assert exc_info.value.status_code == 403
            assert "Permission denied" in exc_info.value.detail
    
    def test_api_key_scope_check_success(self, mock_request):
        """Test successful API key scope check."""
        user_context = UserContext(
            user_id="api_key_test",
            roles=[Role.CLIENT_USER],
            tenant_id="test_tenant"
        )
        api_key = ApiKey(
            id="test_key",
            tenant_id="test_tenant",
            name="Test Key",
            prefix="test",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY, ApiKeyScope.ANALYTICS],
            created_by="test_user",
            created_at=datetime.utcnow()
        )
        
        mock_request.state.authenticated = True
        mock_request.state.user = user_context
        mock_request.state.auth_method = "api_key"
        mock_request.state.api_key = api_key
        
        dependency = AuthenticationDependency(
            required_api_key_scopes=[ApiKeyScope.READ_ONLY],
            require_auth=True
        )
        
        result = pytest.asyncio.run(dependency(mock_request))
        assert result == user_context
    
    def test_api_key_scope_check_failure(self, mock_request):
        """Test failed API key scope check."""
        user_context = UserContext(
            user_id="api_key_test",
            roles=[Role.CLIENT_USER],
            tenant_id="test_tenant"
        )
        api_key = ApiKey(
            id="test_key",
            tenant_id="test_tenant",
            name="Test Key",
            prefix="test",
            key_hash="hash",
            scopes=[ApiKeyScope.READ_ONLY],
            created_by="test_user",
            created_at=datetime.utcnow()
        )
        
        mock_request.state.authenticated = True
        mock_request.state.user = user_context
        mock_request.state.auth_method = "api_key"
        mock_request.state.api_key = api_key
        
        dependency = AuthenticationDependency(
            required_api_key_scopes=[ApiKeyScope.ADMIN],
            require_auth=True
        )
        
        with pytest.raises(HTTPException) as exc_info:
            pytest.asyncio.run(dependency(mock_request))
        
        assert exc_info.value.status_code == 403
        assert "Insufficient API key permissions" in exc_info.value.detail


if __name__ == "__main__":
    pytest.main([__file__])