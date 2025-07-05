"""
Test cases for the recommendation service with database verification.

This module contains integration tests for the recommendation service functionality
that write to and read from a real test database using Prisma.
"""
import pytest
import asyncio
import os
import uuid
from datetime import datetime
from unittest.mock import MagicMock, patch, AsyncMock

# Set environment variables for testing
os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/eyewear_ml_test"
os.environ["USE_PRISMA"] = "True"
os.environ["ENVIRONMENT"] = "test"

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
from src.api.database.prisma_client import get_prisma_client, close_prisma_client


@pytest.fixture
async def prisma_client():
    """Fixture for Prisma client."""
    client = await get_prisma_client()
    yield client
    await close_prisma_client()


@pytest.fixture
async def recommendation_service(prisma_client):
    """Create a recommendation service with real database and mocked services."""
    # Create mock dependencies
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
    
    # Create service with real database and mocked services
    service = RecommendationService(
        db_session=prisma_client.client,  # Use the real Prisma client
        vector_db=vector_db,
        deepseek_service=deepseek_service,
        catalog_service=catalog_service
    )
    
    return service


@pytest.fixture
async def test_tenant(prisma_client):
    """Create a test tenant in the database."""
    tenant_id = f"test-tenant-{uuid.uuid4()}"
    
    # No need to create a tenant record as we're just using the ID
    # for the recommendation and feedback tables
    
    yield tenant_id


@pytest.mark.asyncio
async def test_collect_signal_with_db_verification(recommendation_service, prisma_client, test_tenant):
    """Test collecting user signals with database verification."""
    # Create signal request
    customer_id = f"test-customer-{uuid.uuid4()}"
    product_id = f"test-product-{uuid.uuid4()}"
    
    request = SignalCollectionRequest(
        customer_id=customer_id,
        signal_type="view",
        product_id=product_id,
        value=1.0,
        attributes={"time_spent": 30}
    )
    
    # Collect signal
    response = await recommendation_service.collect_signal(request, test_tenant)
    
    # Check response
    assert response is not None
    assert response["success"] is True
    assert "signal_id" in response
    
    # Verify data was written to the database
    # Note: The actual implementation might store this in a different way
    # This is just an example of how you might verify the data
    
    # For this test, we'll assume the signal is stored as a feedback record
    feedbacks = await prisma_client.client.feedback.find_many(
        where={
            "tenant_id": test_tenant,
            "user_id": customer_id,
            "product_id": product_id,
            "feedback_type": "view"
        }
    )
    
    assert len(feedbacks) > 0
    feedback = feedbacks[0]
    assert feedback.tenant_id == test_tenant
    assert feedback.user_id == customer_id
    assert feedback.product_id == product_id
    assert feedback.feedback_type == "view"
    assert feedback.value == 1.0
    assert feedback.context is not None
    assert feedback.context.get("time_spent") == 30
    
    # Clean up
    for feedback in feedbacks:
        await prisma_client.client.feedback.delete(
            where={"id": feedback.id}
        )


@pytest.mark.asyncio
async def test_record_feedback_with_db_verification(recommendation_service, prisma_client, test_tenant):
    """Test recording feedback with database verification."""
    # Create test data
    customer_id = f"test-customer-{uuid.uuid4()}"
    product_id = f"test-product-{uuid.uuid4()}"
    recommendation_id = f"test-recommendation-{uuid.uuid4()}"
    
    # Create feedback request
    request = RecommendationFeedbackRequest(
        customer_id=customer_id,
        recommendation_id=recommendation_id,
        product_id=product_id,
        feedback_type="like",
        rating=5,
        comment="Great recommendation!"
    )
    
    # Record feedback
    response = await recommendation_service.record_feedback(request, test_tenant)
    
    # Check response
    assert response is not None
    assert response["success"] is True
    assert "feedback_id" in response
    
    # Verify data was written to the database
    feedbacks = await prisma_client.client.feedback.find_many(
        where={
            "tenant_id": test_tenant,
            "user_id": customer_id,
            "product_id": product_id,
            "recommendation_id": recommendation_id,
            "feedback_type": "like"
        }
    )
    
    assert len(feedbacks) > 0
    feedback = feedbacks[0]
    assert feedback.tenant_id == test_tenant
    assert feedback.user_id == customer_id
    assert feedback.product_id == product_id
    assert feedback.recommendation_id == recommendation_id
    assert feedback.feedback_type == "like"
    assert feedback.value == 5.0
    assert feedback.context is not None
    assert feedback.context.get("comment") == "Great recommendation!"
    
    # Clean up
    for feedback in feedbacks:
        await prisma_client.client.feedback.delete(
            where={"id": feedback.id}
        )


@pytest.mark.asyncio
async def test_get_personalized_recommendations_with_db_verification(recommendation_service, prisma_client, test_tenant):
    """Test personalized recommendations with database verification."""
    # Create test data
    customer_id = f"test-customer-{uuid.uuid4()}"
    
    # Create request
    request = PersonalizedRecommendationRequest(
        customer_id=customer_id,
        style_preferences=["round", "aviator"],
        face_shape="oval",
        include_reasoning=True
    )
    
    # Get recommendations
    response = await recommendation_service.get_personalized_recommendations(request, test_tenant)
    
    # Check response
    assert response is not None
    assert hasattr(response, "metadata")
    assert hasattr(response, "products")
    assert len(response.products) > 0
    
    # Get the recommendation ID from the response
    recommendation_id = response.metadata.request_id
    
    # Verify recommendation was stored in the database
    recommendations = await prisma_client.client.recommendation.find_many(
        where={
            "tenant_id": test_tenant,
            "user_id": customer_id
        }
    )
    
    assert len(recommendations) > 0
    
    # Find the recommendation that matches our request
    matching_recommendation = None
    for rec in recommendations:
        if rec.recommendation_type == "personalized":
            matching_recommendation = rec
            break
    
    assert matching_recommendation is not None
    assert matching_recommendation.tenant_id == test_tenant
    assert matching_recommendation.user_id == customer_id
    assert matching_recommendation.products is not None
    assert "products" in matching_recommendation.products
    
    # Verify recommendation metadata
    assert matching_recommendation.recommendation_metadata is not None
    metadata = matching_recommendation.recommendation_metadata
    assert "style_preferences" in metadata
    assert "face_shape" in metadata
    assert metadata["face_shape"] == "oval"
    
    # Clean up
    for rec in recommendations:
        await prisma_client.client.recommendation.delete(
            where={"id": rec.id}
        )


@pytest.mark.asyncio
async def test_get_popular_products_with_db_verification(recommendation_service, prisma_client, test_tenant):
    """Test getting popular products with database verification."""
    # Create request
    request = PopularProductsRequest(limit=5)
    
    # Get popular products
    response = await recommendation_service.get_popular_products(request, test_tenant)
    
    # Check response
    assert response is not None
    assert hasattr(response, "metadata")
    assert hasattr(response, "products")
    assert len(response.products) > 0
    
    # Get the recommendation ID from the response
    recommendation_id = response.metadata.request_id
    
    # Verify recommendation was stored in the database
    recommendations = await prisma_client.client.recommendation.find_many(
        where={
            "tenant_id": test_tenant,
            "recommendation_type": "popular"
        }
    )
    
    assert len(recommendations) > 0
    recommendation = recommendations[0]
    assert recommendation.tenant_id == test_tenant
    assert recommendation.products is not None
    assert "products" in recommendation.products
    
    # Clean up
    for rec in recommendations:
        await prisma_client.client.recommendation.delete(
            where={"id": rec.id}
        )


@pytest.mark.asyncio
async def test_recommendation_feedback_flow(recommendation_service, prisma_client, test_tenant):
    """Test the complete recommendation and feedback flow with database verification."""
    # Create test data
    customer_id = f"test-customer-{uuid.uuid4()}"
    
    # 1. Get personalized recommendations
    request = PersonalizedRecommendationRequest(
        customer_id=customer_id,
        style_preferences=["round"],
        face_shape="oval",
        include_reasoning=True
    )
    
    recommendation_response = await recommendation_service.get_personalized_recommendations(request, test_tenant)
    assert recommendation_response is not None
    assert len(recommendation_response.products) > 0
    
    # Get recommendation ID and first product
    recommendation_id = recommendation_response.metadata.request_id
    first_product = recommendation_response.products[0]
    product_id = first_product.product_id
    
    # 2. Record a view signal
    view_request = SignalCollectionRequest(
        customer_id=customer_id,
        signal_type="view",
        product_id=product_id,
        recommendation_id=recommendation_id,
        value=1.0
    )
    
    view_response = await recommendation_service.collect_signal(view_request, test_tenant)
    assert view_response["success"] is True
    
    # 3. Record feedback
    feedback_request = RecommendationFeedbackRequest(
        customer_id=customer_id,
        recommendation_id=recommendation_id,
        product_id=product_id,
        feedback_type="like",
        rating=5,
        comment="Perfect recommendation!"
    )
    
    feedback_response = await recommendation_service.record_feedback(feedback_request, test_tenant)
    assert feedback_response["success"] is True
    
    # 4. Verify all data in the database
    
    # Verify recommendation
    recommendations = await prisma_client.client.recommendation.find_many(
        where={
            "tenant_id": test_tenant,
            "user_id": customer_id
        }
    )
    assert len(recommendations) > 0
    
    # Verify signals (stored as feedback)
    signals = await prisma_client.client.feedback.find_many(
        where={
            "tenant_id": test_tenant,
            "user_id": customer_id,
            "product_id": product_id,
            "feedback_type": "view"
        }
    )
    assert len(signals) > 0
    
    # Verify feedback
    feedbacks = await prisma_client.client.feedback.find_many(
        where={
            "tenant_id": test_tenant,
            "user_id": customer_id,
            "product_id": product_id,
            "feedback_type": "like"
        }
    )
    assert len(feedbacks) > 0
    
    # Clean up
    for rec in recommendations:
        await prisma_client.client.recommendation.delete(
            where={"id": rec.id}
        )
    
    for signal in signals:
        await prisma_client.client.feedback.delete(
            where={"id": signal.id}
        )
    
    for feedback in feedbacks:
        await prisma_client.client.feedback.delete(
            where={"id": feedback.id}
        )


if __name__ == "__main__":
    asyncio.run(pytest.main(["-xvs", __file__]))