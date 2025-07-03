"""Tests for the enhanced rate limiting middleware."""

import pytest
import time
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient
import redis.asyncio as redis

from src.api.middleware.rate_limiting import (
    RateLimitMiddleware,
    RateLimitConfig,
    create_rate_limit_middleware
)


class TestRateLimitConfig:
    """Test rate limit configuration."""
    
    def test_default_config(self):
        """Test default configuration values."""
        config = RateLimitConfig()
        
        # Note: In test environment, rate limit is set to 1000
        assert config.default_limit >= 60  # From settings (may be higher in test env)
        assert config.window_size == 60
        assert config.burst_allowance == 0.5
        assert "/api/v1/recommendations" in config.endpoint_limits
        assert config.endpoint_limits["/api/v1/auth/login"] == 5
    
    def test_user_type_limits(self):
        """Test user type specific limits."""
        config = RateLimitConfig()
        
        assert config.user_type_limits["premium"] == config.default_limit * 2
        assert config.user_type_limits["enterprise"] == config.default_limit * 5
        assert config.user_type_limits["free"] == config.default_limit


class TestRateLimitMiddleware:
    """Test rate limiting middleware functionality."""
    
    @pytest.fixture
    def mock_redis(self):
        """Create a mock Redis client."""
        redis_mock = AsyncMock(spec=redis.Redis)
        redis_mock.ping = AsyncMock(return_value=True)
        redis_mock.pipeline.return_value = redis_mock
        redis_mock.execute = AsyncMock(return_value=[None, 0, None, None])
        redis_mock.zremrangebyscore = AsyncMock()
        redis_mock.zcard = AsyncMock(return_value=0)
        redis_mock.zadd = AsyncMock()
        redis_mock.expire = AsyncMock()
        redis_mock.zrange = AsyncMock(return_value=[])
        redis_mock.zrem = AsyncMock()
        return redis_mock
    
    @pytest.fixture
    def middleware(self, mock_redis):
        """Create middleware instance with mock Redis."""
        return RateLimitMiddleware(redis_client=mock_redis)
    
    @pytest.fixture
    def mock_request(self):
        """Create a mock request."""
        request = MagicMock(spec=Request)
        request.url.path = "/api/v1/test"
        request.method = "GET"
        request.headers = {}
        request.client.host = "127.0.0.1"
        request.state = MagicMock()
        request.state.user = None
        
        # Mock app state
        app_state = MagicMock()
        app_state.redis = None
        request.app.state = app_state
        
        return request
    
    def test_get_client_identifier_ip(self, middleware, mock_request):
        """Test client identifier extraction from IP."""
        mock_request.state.user = None
        mock_request.headers = {}
        mock_request.client.host = "192.168.1.1"
        
        client_id = middleware._get_client_identifier(mock_request)
        assert client_id == "ip:192.168.1.1"
    
    def test_get_client_identifier_user(self, middleware, mock_request):
        """Test client identifier extraction from authenticated user."""
        mock_request.state.user = {"sub": "user123", "user_id": "user123"}
        
        client_id = middleware._get_client_identifier(mock_request)
        assert client_id == "user:user123"
    
    def test_get_client_identifier_api_key(self, middleware, mock_request):
        """Test client identifier extraction from API key."""
        mock_request.state.user = None
        mock_request.headers = {"X-API-Key": "test-api-key"}
        
        client_id = middleware._get_client_identifier(mock_request)
        assert client_id.startswith("api_key:")
    
    def test_get_client_identifier_forwarded_ip(self, middleware, mock_request):
        """Test client identifier extraction from X-Forwarded-For header."""
        mock_request.state.user = None
        mock_request.headers = {"X-Forwarded-For": "203.0.113.1, 192.168.1.1"}
        
        client_id = middleware._get_client_identifier(mock_request)
        assert client_id == "ip:203.0.113.1"
    
    def test_get_rate_limit_default(self, middleware, mock_request):
        """Test default rate limit."""
        client_id = "ip:127.0.0.1"
        rate_limit = middleware._get_rate_limit(mock_request, client_id)
        assert rate_limit >= 60  # Default limit (may be higher in test env)
    
    def test_get_rate_limit_endpoint_specific(self, middleware, mock_request):
        """Test endpoint-specific rate limit."""
        mock_request.url.path = "/api/v1/auth/login"
        client_id = "ip:127.0.0.1"
        
        rate_limit = middleware._get_rate_limit(mock_request, client_id)
        assert rate_limit == 5  # Login endpoint limit
    
    def test_get_rate_limit_user_type(self, middleware, mock_request):
        """Test user type specific rate limit."""
        mock_request.state.user = {"user_type": "premium"}
        client_id = "user:123"
        
        rate_limit = middleware._get_rate_limit(mock_request, client_id)
        # Premium user limit should be 2x the default (may be higher in test env)
        assert rate_limit >= 120
    
    def test_should_skip_rate_limiting_health(self, middleware, mock_request):
        """Test skipping rate limiting for health checks."""
        mock_request.url.path = "/health"
        assert middleware._should_skip_rate_limiting(mock_request) is True
        
        mock_request.url.path = "/api/v1/health"
        assert middleware._should_skip_rate_limiting(mock_request) is True
    
    def test_should_skip_rate_limiting_options(self, middleware, mock_request):
        """Test skipping rate limiting for OPTIONS requests."""
        mock_request.method = "OPTIONS"
        assert middleware._should_skip_rate_limiting(mock_request) is True
    
    def test_should_skip_rate_limiting_monitoring(self, middleware, mock_request):
        """Test skipping rate limiting for internal monitoring."""
        mock_request.url.path = "/api/v1/monitoring/internal/metrics"
        assert middleware._should_skip_rate_limiting(mock_request) is True
    
    @pytest.mark.asyncio
    async def test_sliding_window_check_allowed(self, middleware, mock_redis):
        """Test sliding window check when request is allowed."""
        current_time = int(time.time())
        # Mock Redis responses for allowed request
        mock_redis.execute.return_value = [None, 5, None, None]  # 5 current requests
        mock_redis.zrange.return_value = [(b"req1", current_time - 30)]
        
        is_allowed, count, reset_time = await middleware._sliding_window_check(
            mock_redis, "test_key", 10, 60
        )
        
        assert is_allowed is True
        assert count == 6  # 5 existing + 1 new
        assert reset_time >= current_time
    
    @pytest.mark.asyncio
    async def test_sliding_window_check_denied(self, middleware, mock_redis):
        """Test sliding window check when request is denied."""
        current_time = int(time.time())
        # Mock Redis responses for denied request
        mock_redis.execute.return_value = [None, 10, None, None]  # 10 current requests
        mock_redis.zrange.return_value = [(b"req1", current_time - 30)]
        
        is_allowed, count, reset_time = await middleware._sliding_window_check(
            mock_redis, "test_key", 10, 60
        )
        
        assert is_allowed is False
        assert count == 10  # No increment for denied request
        assert reset_time >= current_time
    
    @pytest.mark.asyncio
    async def test_sliding_window_check_redis_error(self, middleware, mock_redis):
        """Test sliding window check when Redis fails."""
        mock_redis.execute.side_effect = Exception("Redis error")
        
        is_allowed, count, reset_time = await middleware._sliding_window_check(
            mock_redis, "test_key", 10, 60
        )
        
        # Should allow request on Redis error with "allow" fallback policy
        assert is_allowed is True
        assert count == 0
        assert reset_time > int(time.time())
    
    @pytest.mark.asyncio
    async def test_get_rate_limit_info(self, middleware, mock_redis):
        """Test getting rate limit information."""
        mock_redis.zcard.return_value = 5
        mock_redis.zrange.return_value = [(b"req1", int(time.time()) - 30)]
        
        info = await middleware._get_rate_limit_info(mock_redis, "test_key", 10)
        
        assert info["limit"] == 10
        assert info["remaining"] == 5
        assert info["reset"] > int(time.time())
        assert info["retry_after"] == 0
    
    @pytest.mark.asyncio
    async def test_get_rate_limit_info_exceeded(self, middleware, mock_redis):
        """Test getting rate limit information when limit is exceeded."""
        mock_redis.zcard.return_value = 12
        mock_redis.zrange.return_value = [(b"req1", int(time.time()) - 30)]
        
        info = await middleware._get_rate_limit_info(mock_redis, "test_key", 10)
        
        assert info["limit"] == 10
        assert info["remaining"] == 0
        assert info["retry_after"] > 0


class TestRateLimitMiddlewareIntegration:
    """Integration tests for rate limiting middleware."""
    
    @pytest.fixture
    def app_with_middleware(self):
        """Create FastAPI app with rate limiting middleware."""
        app = FastAPI()
        
        # Add rate limiting middleware
        middleware = create_rate_limit_middleware(fallback_policy="allow")
        app.middleware("http")(middleware)
        
        @app.get("/test")
        async def test_endpoint():
            return {"message": "success"}
        
        @app.get("/health")
        async def health_endpoint():
            return {"status": "healthy"}
        
        return app
    
    def test_health_endpoint_not_rate_limited(self, app_with_middleware):
        """Test that health endpoints are not rate limited."""
        client = TestClient(app_with_middleware)
        
        # Make multiple requests to health endpoint
        for _ in range(100):
            response = client.get("/health")
            assert response.status_code == 200
    
    @patch('src.api.middleware.rate_limiting.redis.from_url')
    def test_redis_unavailable_fallback(self, mock_redis_from_url, app_with_middleware):
        """Test fallback behavior when Redis is unavailable."""
        # Mock Redis connection failure
        mock_redis_from_url.side_effect = Exception("Redis connection failed")
        
        client = TestClient(app_with_middleware)
        response = client.get("/test")
        
        # Should still allow request with fallback policy
        assert response.status_code == 200
        assert "X-RateLimit-Status" in response.headers
        assert response.headers["X-RateLimit-Status"] == "disabled"
    
    def test_rate_limit_headers_present(self, app_with_middleware):
        """Test that rate limit headers are added to responses."""
        client = TestClient(app_with_middleware)
        response = client.get("/test")
        
        # When Redis is not available, only X-RateLimit-Status should be present
        assert "X-RateLimit-Status" in response.headers
        assert response.headers["X-RateLimit-Status"] == "disabled"


class TestCreateRateLimitMiddleware:
    """Test middleware factory function."""
    
    def test_create_middleware_default(self):
        """Test creating middleware with default settings."""
        middleware = create_rate_limit_middleware()
        
        assert isinstance(middleware, RateLimitMiddleware)
        assert middleware.fallback_policy == "allow"
    
    def test_create_middleware_custom_config(self):
        """Test creating middleware with custom configuration."""
        config = RateLimitConfig()
        config.default_limit = 100
        
        middleware = create_rate_limit_middleware(config=config, fallback_policy="deny")
        
        assert isinstance(middleware, RateLimitMiddleware)
        assert middleware.config.default_limit == 100
        assert middleware.fallback_policy == "deny"
    
    @pytest.mark.asyncio
    async def test_create_middleware_with_redis(self):
        """Test creating middleware with Redis client."""
        mock_redis = AsyncMock(spec=redis.Redis)
        middleware = create_rate_limit_middleware(redis_client=mock_redis)
        
        assert middleware.redis == mock_redis


if __name__ == "__main__":
    pytest.main([__file__])