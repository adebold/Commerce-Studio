"""
Pytest configuration for database testing.

This module provides fixtures and configuration for database testing with Prisma.
"""
import os
import pytest
import asyncio
from typing import AsyncGenerator

# Set environment variables for testing if not already set
if "DATABASE_URL" not in os.environ:
    os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/eyewear_ml_test"
if "USE_PRISMA" not in os.environ:
    os.environ["USE_PRISMA"] = "True"
if "ENVIRONMENT" not in os.environ:
    os.environ["ENVIRONMENT"] = "test"

from src.api.database.prisma_client import get_prisma_client, close_prisma_client


# @pytest.fixture(scope="session")
# def event_loop():
#     """Create an instance of the default event loop for each test case."""
#     loop = asyncio.get_event_loop_policy().new_event_loop()
#     yield loop
#     loop.close()


@pytest.fixture(scope="session")
async def prisma_client() -> AsyncGenerator:
    """
    Create a Prisma client for database testing.
    
    This fixture provides a Prisma client that connects to the test database.
    It's scoped to the session to avoid connecting and disconnecting for each test.
    
    Yields:
        PrismaClient: A connected Prisma client instance
    """
    client = await get_prisma_client()
    yield client
    await close_prisma_client()


@pytest.fixture(scope="function")
async def clean_db(prisma_client) -> AsyncGenerator:
    """
    Provide a clean database state for each test.
    
    This fixture ensures that each test starts with a clean database state.
    It yields control to the test, then cleans up any data created during the test.
    
    Args:
        prisma_client: The Prisma client fixture
        
    Yields:
        None
    """
    # The test will run here
    yield
    
    # Clean up after the test
    # This is a simplified example - in a real implementation,
    # you might want to be more selective about what to clean up
    try:
        # Clean up recommendations
        await prisma_client.client.recommendation.delete_many(
            where={"tenant_id": {"contains": "test-"}}
        )
    except Exception:
        pass
    
    try:
        # Clean up feedback
        await prisma_client.client.feedback.delete_many(
            where={"tenant_id": {"contains": "test-"}}
        )
    except Exception:
        pass
    
    try:
        # Clean up usage records
        await prisma_client.client.usageRecord.delete_many(
            where={"tenant_id": {"contains": "test-"}}
        )
    except Exception:
        pass
    
    try:
        # Clean up product requests
        await prisma_client.client.productRequest.delete_many(
            where={"store_id": {"contains": "test-"}}
        )
    except Exception:
        pass
    
    try:
        # Clean up opticians products
        await prisma_client.client.opticiansProduct.delete_many(
            where={"store_id": {"contains": "test-"}}
        )
    except Exception:
        pass
    
    try:
        # Clean up opticians stores
        await prisma_client.client.opticiansStore.delete_many(
            where={"id": {"contains": "test-"}}
        )
    except Exception:
        pass
    
    try:
        # Clean up clients
        await prisma_client.client.client.delete_many(
            where={"id": {"contains": "test-"}}
        )
    except Exception:
        pass


@pytest.fixture
def setup_test_db(prisma_client, clean_db):
    """
    Set up the test database with required configuration.
    
    This fixture combines the prisma_client and clean_db fixtures
    to provide a configured and clean database for testing.
    
    Args:
        prisma_client: The Prisma client fixture
        clean_db: The clean database fixture
        
    Returns:
        PrismaClient: A connected Prisma client instance
    """
    return prisma_client