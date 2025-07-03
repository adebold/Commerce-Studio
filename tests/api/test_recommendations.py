"""
Tests for the recommendation API.

This module provides tests for the recommendation API endpoints using pytest.
"""
import pytest
from fastapi.testclient import TestClient

from src.api.main import app
from src.api.models.recommendation_models import (
    ProductCategory, TimeFrame, SortOrder, UserProfileType
)

# Create test client
client = TestClient(app)

# Mock API key and tenant ID for testing
TEST_TENANT_ID = "tenant1"
TEST_API_KEY = "os.environ.get('API_KEY_287')'API_KEY_207')'API_KEY_303')'API_KEY_108')"
TEST_USER_ID = "user123"


@pytest.fixture
def auth_headers():
    """Fixture for authentication headers."""
    return {
        "X-API-Key": TEST_API_KEY,
        "X-Tenant-ID": TEST_TENANT_ID
    }


def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_personalized_recommendations(auth_headers):
    """Test the personalized recommendations endpoint."""
    response = client.get(
        "/api/v1/recommendations/personalized",
        params={
            "user_id": TEST_USER_ID,
            "limit": 5,
            "category": ProductCategory.EYEGLASSES
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tenant_id"] == TEST_TENANT_ID
    assert data["user_id"] == TEST_USER_ID
    assert len(data["recommendations"]) <= 5
    assert all(r["product"]["category"] == ProductCategory.EYEGLASSES for r in data["recommendations"])


def test_popular_recommendations(auth_headers):
    """Test the popular recommendations endpoint."""
    response = client.get(
        "/api/v1/recommendations/popular",
        params={
            "limit": 5,
            "time_frame": TimeFrame.MONTH
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tenant_id"] == TEST_TENANT_ID
    assert len(data["recommendations"]) <= 5
    assert data["time_frame"] == TimeFrame.MONTH


def test_trending_recommendations(auth_headers):
    """Test the trending recommendations endpoint."""
    response = client.get(
        "/api/v1/recommendations/trending",
        params={
            "limit": 5,
            "time_frame": TimeFrame.WEEK
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tenant_id"] == TEST_TENANT_ID
    assert len(data["recommendations"]) <= 5
    assert data["time_frame"] == TimeFrame.WEEK


def test_similar_products(auth_headers):
    """Test the similar products endpoint."""
    response = client.get(
        "/api/v1/recommendations/similar/PROD-0001",
        params={
            "limit": 5,
            "similarity_type": "visual"
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["tenant_id"] == TEST_TENANT_ID
    assert len(data["recommendations"]) <= 5
    assert data["product_id"] == "PROD-0001"
    assert data["similarity_type"] == "visual"


def test_submit_feedback(auth_headers):
    """Test the feedback submission endpoint."""
    feedback_data = {
        "tenant_id": TEST_TENANT_ID,
        "user_id": TEST_USER_ID,
        "product_id": "PROD-0001",
        "feedback_type": "click"
    }
    response = client.post(
        "/api/v1/recommendations/feedback",
        json=feedback_data,
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "feedback_id" in data


def test_missing_tenant_id():
    """Test request without tenant ID."""
    headers = {"X-API-Key": TEST_API_KEY}
    response = client.get(
        "/api/v1/recommendations/personalized",
        params={"user_id": TEST_USER_ID},
        headers=headers
    )
    assert response.status_code in (400, 422)  # Either 400 Bad Request or 422 Validation Error


def test_invalid_tenant_id():
    """Test request with invalid tenant ID."""
    headers = {
        "X-API-Key": TEST_API_KEY,
        "X-Tenant-ID": "invalid-tenant"
    }
    response = client.get(
        "/api/v1/recommendations/personalized",
        params={"user_id": TEST_USER_ID},
        headers=headers
    )
    assert response.status_code == 403  # Forbidden


def test_missing_user_id(auth_headers):
    """Test personalized recommendations without user ID."""
    response = client.get(
        "/api/v1/recommendations/personalized",
        headers=auth_headers
    )
    assert response.status_code == 422  # Validation Error