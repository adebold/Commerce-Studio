"""
Test Prisma integration.

This module tests the Prisma integration to ensure it works correctly.
"""
import asyncio
import os
import pytest
import uuid
from datetime import datetime

# Set environment variables for testing
os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/eyewear_ml_test"
os.environ["USE_PRISMA"] = "True"
os.environ["ENVIRONMENT"] = "test"

# Import Prisma client
from src.api.database.prisma_client import get_prisma_client, close_prisma_client


@pytest.fixture
async def prisma_client():
    """Fixture for Prisma client."""
    client = await get_prisma_client()
    yield client
    await close_prisma_client()


@pytest.mark.asyncio
async def test_prisma_connection(prisma_client):
    """Test Prisma connection."""
    assert prisma_client is not None
    assert prisma_client.is_connected


@pytest.mark.asyncio
async def test_create_recommendation(prisma_client):
    """Test creating a recommendation."""
    # Create test data
    tenant_id = f"test-tenant-{uuid.uuid4()}"
    user_id = f"test-user-{uuid.uuid4()}"
    session_id = f"test-session-{uuid.uuid4()}"
    recommendation_type = "test-recommendation"
    products = {"products": [{"id": "test-product-1", "score": 0.9}, {"id": "test-product-2", "score": 0.8}]}
    metadata = {"source": "test", "algorithm": "test-algorithm"}
    
    # Create recommendation
    recommendation = await prisma_client.client.recommendation.create(
        data={
            "tenant_id": tenant_id,
            "user_id": user_id,
            "session_id": session_id,
            "recommendation_type": recommendation_type,
            "products": products,
            "recommendation_metadata": metadata,
        }
    )
    
    # Verify recommendation was created
    assert recommendation is not None
    assert recommendation.tenant_id == tenant_id
    assert recommendation.user_id == user_id
    assert recommendation.session_id == session_id
    assert recommendation.recommendation_type == recommendation_type
    assert recommendation.products == products
    assert recommendation.recommendation_metadata == metadata
    
    # Clean up
    await prisma_client.client.recommendation.delete(
        where={"id": recommendation.id}
    )


@pytest.mark.asyncio
async def test_create_feedback(prisma_client):
    """Test creating feedback."""
    # Create test data
    tenant_id = f"test-tenant-{uuid.uuid4()}"
    user_id = f"test-user-{uuid.uuid4()}"
    session_id = f"test-session-{uuid.uuid4()}"
    product_id = f"test-product-{uuid.uuid4()}"
    recommendation_id = f"test-recommendation-{uuid.uuid4()}"
    feedback_type = "like"
    value = 1.0
    context = {"source": "test", "page": "product-detail"}
    
    # Create feedback
    feedback = await prisma_client.client.feedback.create(
        data={
            "tenant_id": tenant_id,
            "user_id": user_id,
            "session_id": session_id,
            "product_id": product_id,
            "recommendation_id": recommendation_id,
            "feedback_type": feedback_type,
            "value": value,
            "context": context,
        }
    )
    
    # Verify feedback was created
    assert feedback is not None
    assert feedback.tenant_id == tenant_id
    assert feedback.user_id == user_id
    assert feedback.session_id == session_id
    assert feedback.product_id == product_id
    assert feedback.recommendation_id == recommendation_id
    assert feedback.feedback_type == feedback_type
    assert feedback.value == value
    assert feedback.context == context
    
    # Clean up
    await prisma_client.client.feedback.delete(
        where={"id": feedback.id}
    )


@pytest.mark.asyncio
async def test_query_recommendations(prisma_client):
    """Test querying recommendations."""
    # Create test data
    tenant_id = f"test-tenant-{uuid.uuid4()}"
    recommendation_type = "test-query"
    products = {"products": [{"id": "test-product-1", "score": 0.9}]}
    
    # Create multiple recommendations
    recommendations = []
    for i in range(3):
        recommendation = await prisma_client.client.recommendation.create(
            data={
                "tenant_id": tenant_id,
                "recommendation_type": recommendation_type,
                "products": products,
            }
        )
        recommendations.append(recommendation)
    
    # Query recommendations
    queried_recommendations = await prisma_client.client.recommendation.find_many(
        where={
            "tenant_id": tenant_id,
            "recommendation_type": recommendation_type,
        }
    )
    
    # Verify query results
    assert len(queried_recommendations) == 3
    
    # Clean up
    for recommendation in recommendations:
        await prisma_client.client.recommendation.delete(
            where={"id": recommendation.id}
        )


@pytest.mark.asyncio
async def test_update_recommendation(prisma_client):
    """Test updating a recommendation."""
    # Create test data
    tenant_id = f"test-tenant-{uuid.uuid4()}"
    recommendation_type = "test-update"
    products = {"products": [{"id": "test-product-1", "score": 0.9}]}
    
    # Create recommendation
    recommendation = await prisma_client.client.recommendation.create(
        data={
            "tenant_id": tenant_id,
            "recommendation_type": recommendation_type,
            "products": products,
        }
    )
    
    # Update recommendation
    updated_products = {"products": [{"id": "test-product-2", "score": 0.95}]}
    updated_recommendation = await prisma_client.client.recommendation.update(
        where={"id": recommendation.id},
        data={"products": updated_products}
    )
    
    # Verify update
    assert updated_recommendation.products == updated_products
    
    # Clean up
    await prisma_client.client.recommendation.delete(
        where={"id": recommendation.id}
    )


@pytest.mark.asyncio
async def test_delete_recommendation(prisma_client):
    """Test deleting a recommendation."""
    # Create test data
    tenant_id = f"test-tenant-{uuid.uuid4()}"
    recommendation_type = "test-delete"
    products = {"products": [{"id": "test-product-1", "score": 0.9}]}
    
    # Create recommendation
    recommendation = await prisma_client.client.recommendation.create(
        data={
            "tenant_id": tenant_id,
            "recommendation_type": recommendation_type,
            "products": products,
        }
    )
    
    # Delete recommendation
    deleted_recommendation = await prisma_client.client.recommendation.delete(
        where={"id": recommendation.id}
    )
    
    # Verify deletion
    assert deleted_recommendation.id == recommendation.id
    
    # Verify recommendation no longer exists
    recommendation = await prisma_client.client.recommendation.find_unique(
        where={"id": recommendation.id}
    )
    assert recommendation is None


if __name__ == "__main__":
    # Run tests
    asyncio.run(test_prisma_connection(asyncio.run(get_prisma_client())))
    print("All tests passed!")