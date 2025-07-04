"""
Test cases for the recommendation service.

This module contains unit and integration tests for the recommendation service functionality.
"""
import pytest
import asyncio
from unittest.mock import MagicMock, patch, AsyncMock
from datetime import datetime

from src.api.services.recommendation_service import RecommendationService
from src.api.models.recommendations import (
    PersonalizedRecommendationRequest,
    PopularProductsRequest,
    TrendingProductsRequest,
    PriceRange,
    FrameDimensions,
    SignalCollectionRequest,
    RecommendationFeedbackRequest
)


# Fixture for recommendation service with mocked dependencies
@pytest.fixture
def recommendation_service():
    """Create a recommendation service with mocked dependencies."""
    # Create mock dependencies
    db_session = MagicMock()
    vector_db = MagicMock()
    deepseek_service = MagicMock()
    catalog_service = MagicMock()
    
    # Configure catalog service mock to return test products
    async def mock_get_products(tenant_id):
        return [
            {
                "product_id": "test1",
                "name": "Test Round Glasses",
                "brand": "TestBrand",
                "price": 99.99,
                "style": "round",
                "material": "metal",
                "color": "gold",
                "gender": "unisex",
                "face_shapes": ["oval", "heart"],
                "is_sunglasses": False,
                "is_blue_light": False,
                "tags": ["bestseller"]
            },
            {
                "product_id": "test2",
                "name": "Test Square Glasses",
                "brand": "TestBrand",
                "price": 129.99,
                "style": "square",
                "material": "acetate",
                "color": "tortoise",
                "gender": "unisex",
                "face_shapes": ["oval", "round"],
                "is_sunglasses": False,
                "is_blue_light": True,
                "tags": ["new_arrival"]
            }
        ]
    
    catalog_service.get_products = AsyncMock(side_effect=mock_get_products)
    
    # Configure deepseek service mock
    deepseek_service.generate_user_embedding = AsyncMock(return_value=[0.1, 0.2, 0.3])
    
    async def mock_generate_product_embeddings(products):
        for product in products:
            product["embedding"] = [0.1, 0.2, 0.3]
        return products
    
    deepseek_service.generate_product_embeddings = AsyncMock(side_effect=mock_generate_product_embeddings)
    
    async def mock_calculate_similarities(user_embedding, product_embeddings, product_ids):
        return [(id, 0.8) for id in product_ids]
    
    deepseek_service.calculate_similarities = AsyncMock(side_effect=mock_calculate_similarities)
    
    deepseek_service.generate_recommendation_reasoning = MagicMock(
        return_value="This is a great match for your preferences."
    )
    
    # Create service with mocked dependencies
    service = RecommendationService(
        db_session=db_session,
        vector_db=vector_db,
        deepseek_service=deepseek_service,
        catalog_service=catalog_service
    )
    
    return service


# Tests for personalized recommendations
@pytest.mark.asyncio
async def test_get_personalized_recommendations_basic(recommendation_service):
    """Test basic personalized recommendations functionality."""
    # Create request
    request = PersonalizedRecommendationRequest(
        customer_id="test_customer",
        style_preferences=["round", "aviator"],
        face_shape="oval",
        include_reasoning=True
    )
    
    # Get recommendations
    response = await recommendation_service.get_personalized_recommendations(request, "test_tenant")
    
    # Check response
    assert response is not None
    assert hasattr(response, "metadata")
    assert hasattr(response, "products")
    assert len(response.products) > 0
    
    # Check metadata
    assert response.metadata.request_id is not None
    assert response.metadata.generated_at is not None
    assert response.metadata.processing_time_ms > 0
    
    # Check products
    for product in response.products:
        assert product.product_id is not None
        assert product.name is not None
        assert product.price is not None
        assert product.score is not None
        assert product.score.value >= 0 and product.score.value <= 1
        assert product.reasoning is not None


@pytest.mark.asyncio
async def test_get_personalized_recommendations_with_filters(recommendation_service):
    """Test personalized recommendations with filters."""
    # Create request with filters
    request = PersonalizedRecommendationRequest(
        style_preferences=["round"],
        face_shape="oval",
        gender="unisex",
        price_range=PriceRange(min=50, max=150),
        is_sunglasses=False,
        is_blue_light=True,
        limit=1
    )
    
    # Get recommendations
    response = await recommendation_service.get_personalized_recommendations(request, "test_tenant")
    
    # Check response
    assert response is not None
    assert len(response.products) <= 1  # Respect limit
    
    if len(response.products) > 0:
        product = response.products[0]
        assert product.price >= 50 and product.price <= 150
        assert product.is_blue_light is True
        assert product.is_sunglasses is False


# Tests for popular products
@pytest.mark.asyncio
async def test_get_popular_products(recommendation_service):
    """Test getting popular products."""
    # Create request
    request = PopularProductsRequest(limit=5)
    
    # Get popular products
    response = await recommendation_service.get_popular_products(request, "test_tenant")
    
    # Check response
    assert response is not None
    assert hasattr(response, "metadata")
    assert hasattr(response, "products")
    assert len(response.products) > 0
    assert len(response.products) <= 5  # Respect limit
    
    # Check products
    for product in response.products:
        assert product.product_id is not None
        assert product.name is not None
        assert product.price is not None
        assert product.score is not None
        assert product.score.value >= 0 and product.score.value <= 1


@pytest.mark.asyncio
async def test_get_popular_products_with_filters(recommendation_service):
    """Test getting popular products with filters."""
    # Create request with filters
    request = PopularProductsRequest(
        limit=10,
        min_price=100,
        style="square",
        is_blue_light=True
    )
    
    # Get popular products
    response = await recommendation_service.get_popular_products(request, "test_tenant")
    
    # Check response
    assert response is not None
    
    # Check filtered products
    for product in response.products:
        assert product.price >= 100
        assert product.style == "square"
        assert product.is_blue_light is True


# Tests for trending products
@pytest.mark.asyncio
async def test_get_trending_products(recommendation_service):
    """Test getting trending products."""
    # Create request
    request = TrendingProductsRequest(time_period="7d", limit=5)
    
    # Get trending products
    response = await recommendation_service.get_trending_products(request, "test_tenant")
    
    # Check response
    assert response is not None
    assert hasattr(response, "metadata")
    assert hasattr(response, "products")
    assert len(response.products) > 0
    assert len(response.products) <= 5  # Respect limit
    
    # Check products
    for product in response.products:
        assert product.product_id is not None
        assert product.name is not None
        assert product.price is not None
        assert product.score is not None
        assert product.score.value >= 0 and product.score.value <= 1


@pytest.mark.asyncio
async def test_get_trending_products_with_filters(recommendation_service):
    """Test getting trending products with filters."""
    # Create request with filters
    request = TrendingProductsRequest(
        time_period="30d",
        limit=10,
        min_price=100,
        material="acetate"
    )
    
    # Get trending products
    response = await recommendation_service.get_trending_products(request, "test_tenant")
    
    # Check response
    assert response is not None
    
    # Check filtered products
    for product in response.products:
        assert product.price >= 100
        assert product.material == "acetate"


# Tests for signal collection
@pytest.mark.asyncio
async def test_collect_signal(recommendation_service):
    """Test collecting user signals."""
    # Create signal request
    request = SignalCollectionRequest(
        customer_id="test_customer",
        signal_type="view",
        product_id="test1",
        value=1.0,
        attributes={"time_spent": 30}
    )
    
    # Collect signal
    response = await recommendation_service.collect_signal(request, "test_tenant")
    
    # Check response
    assert response is not None
    assert response["success"] is True
    assert "signal_id" in response


@pytest.mark.asyncio
async def test_collect_signal_invalid_type(recommendation_service):
    """Test collecting user signals with invalid type."""
    # Create signal request with invalid type
    request = SignalCollectionRequest(
        customer_id="test_customer",
        signal_type="invalid",
        product_id="test1"
    )
    
    # Collect signal
    response = await recommendation_service.collect_signal(request, "test_tenant")
    
    # Check response
    assert response is not None
    assert response["success"] is False
    assert "error" in response


# Tests for feedback recording
@pytest.mark.asyncio
async def test_record_feedback(recommendation_service):
    """Test recording feedback."""
    # Create feedback request
    request = RecommendationFeedbackRequest(
        customer_id="test_customer",
        recommendation_id="rec123",
        product_id="test1",
        feedback_type="like",
        rating=5,
        comment="Great recommendation!"
    )
    
    # Record feedback
    response = await recommendation_service.record_feedback(request, "test_tenant")
    
    # Check response
    assert response is not None
    assert response["success"] is True
    assert "feedback_id" in response


@pytest.mark.asyncio
async def test_record_feedback_invalid_type(recommendation_service):
    """Test recording feedback with invalid type."""
    # Create feedback request with invalid type
    request = RecommendationFeedbackRequest(
        customer_id="test_customer",
        recommendation_id="rec123",
        product_id="test1",
        feedback_type="invalid"
    )
    
    # Record feedback
    response = await recommendation_service.record_feedback(request, "test_tenant")
    
    # Check response
    assert response is not None
    assert response["success"] is False
    assert "error" in response


# Test helper methods
def test_apply_filters(recommendation_service):
    """Test filter application logic."""
    # Test products
    products = [
        {
            "product_id": "p1",
            "price": 80,
            "gender": "male",
            "face_shapes": ["oval", "square"],
            "prescription_compatible": True,
            "is_sunglasses": False,
            "is_blue_light": True
        },
        {
            "product_id": "p2",
            "price": 120,
            "gender": "female",
            "face_shapes": ["round", "heart"],
            "prescription_compatible": True,
            "is_sunglasses": True,
            "is_blue_light": False
        },
        {
            "product_id": "p3",
            "price": 150,
            "gender": "unisex",
            "face_shapes": ["oval", "round"],
            "prescription_compatible": False,
            "is_sunglasses": False,
            "is_blue_light": True
        }
    ]
    
    # Test filter by price
    request = PersonalizedRecommendationRequest(
        price_range=PriceRange(min=100, max=200)
    )
    filtered = recommendation_service._apply_filters(products, request)
    assert len(filtered) == 2
    assert all(p["price"] >= 100 and p["price"] <= 200 for p in filtered)
    
    # Test filter by gender
    request = PersonalizedRecommendationRequest(gender="female")
    filtered = recommendation_service._apply_filters(products, request)
    assert len(filtered) == 1
    assert filtered[0]["gender"] == "female"
    
    # Test filter by face shape
    request = PersonalizedRecommendationRequest(face_shape="oval")
    filtered = recommendation_service._apply_filters(products, request)
    assert len(filtered) == 2
    assert all("oval" in p["face_shapes"] for p in filtered)
    
    # Test filter by sunglasses
    request = PersonalizedRecommendationRequest(is_sunglasses=True)
    filtered = recommendation_service._apply_filters(products, request)
    assert len(filtered) == 1
    assert filtered[0]["is_sunglasses"] is True
    
    # Test multiple filters
    request = PersonalizedRecommendationRequest(
        price_range=PriceRange(min=100),
        is_blue_light=True,
        face_shape="oval"
    )
    filtered = recommendation_service._apply_filters(products, request)
    assert len(filtered) == 1
    assert filtered[0]["product_id"] == "p3"
    assert filtered[0]["price"] >= 100
    assert filtered[0]["is_blue_light"] is True
    assert "oval" in filtered[0]["face_shapes"]