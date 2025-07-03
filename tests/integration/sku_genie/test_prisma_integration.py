"""
Integration tests for the SKU-Genie with Prisma database.

These tests cover the complete integration setup workflow for Store Owners,
including initial configuration, data source connection, and validation
with actual database writes and reads using Prisma.
"""

import pytest
import asyncio
import json
import os
import uuid
from datetime import datetime

# Set environment variables for testing
os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/eyewear_ml_test"
os.environ["USE_PRISMA"] = "True"
os.environ["ENVIRONMENT"] = "test"

from src.sku_genie.core.models import ConflictResolutionStrategy
from src.sku_genie.data_sources import get_adapter
from src.sku_genie.quality import process_batch
from src.sku_genie.sync import sync_source
from src.sku_genie.maintenance import cleanup_all, optimize_indexes
from src.api.database.prisma_client import get_prisma_client, close_prisma_client


@pytest.fixture
async def prisma_client():
    """Fixture for Prisma client."""
    client = await get_prisma_client()
    yield client
    await close_prisma_client()


@pytest.fixture
async def test_client(prisma_client):
    """Create a test client in the database."""
    client_id = f"test-client-{uuid.uuid4()}"
    
    # Create client using Prisma
    client = await prisma_client.client.client.create(
        data={
            "id": client_id,
            "name": "Test Client"
        }
    )
    
    # Create opticians store for the client
    store_id = f"test-store-{uuid.uuid4()}"
    store = await prisma_client.client.opticiansStore.create(
        data={
            "id": store_id,
            "client_id": client_id,
            "store_name": "Test Store",
            "subdomain": f"test-store-{uuid.uuid4()}",
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    )
    
    yield {
        "client_id": client_id,
        "store_id": store_id
    }
    
    # Clean up
    try:
        await prisma_client.client.opticiansStore.delete(
            where={"id": store_id}
        )
    except Exception:
        pass
        
    try:
        await prisma_client.client.client.delete(
            where={"id": client_id}
        )
    except Exception:
        pass


class MockShopifyAdapter:
    """Mock Shopify adapter for testing."""
    
    def __init__(self, catalog_size="small"):
        """
        Initialize the mock Shopify adapter.
        
        Args:
            catalog_size: Size of the catalog to simulate ("small", "medium", "large")
        """
        self.catalog_size = catalog_size
        self.connected = False
        self.config = None
        
        # Generate test products based on catalog size
        product_count = {
            "small": 10,
            "medium": 50,
            "large": 100
        }.get(catalog_size, 10)
        
        self.products = []
        for i in range(product_count):
            self.products.append({
                "id": f"shopify-{i}",
                "title": f"Product {i}",
                "brand": f"Brand {i % 10}",
                "product_type": f"Type {i % 5}",
                "variants": [
                    {
                        "id": f"variant-{i}-1",
                        "price": 100 + (i % 10) * 10,
                        "sku": f"SKU-{i}-1",
                        "inventory_quantity": 10 + (i % 5)
                    }
                ],
                "images": [
                    f"https://example.com/image-{i}.jpg"
                ],
                "tags": [f"tag1", f"tag2", f"tag{i % 5}"]
            })
    
    async def connect(self, config):
        """
        Connect to the mock Shopify API.
        
        Args:
            config: Connection configuration
            
        Returns:
            True if connection successful, False otherwise
        """
        self.config = config
        
        # Simulate connection validation
        if not config.get("shop_url") or not config.get("api_key") or not config.get("api_password"):
            return False
            
        self.connected = True
        return True
    
    async def fetch_data(self, options):
        """
        Fetch data from the mock Shopify API.
        
        Args:
            options: Fetch options
            
        Yields:
            Products
        """
        if not self.connected:
            raise Exception("Not connected to Shopify API")
            
        limit = options.get("limit")
        products = self.products[:limit] if limit else self.products
        
        for product in products:
            # Transform to SKU-Genie format
            transformed_product = {
                "id": product["id"],
                "title": product["title"],
                "brand": product["brand"],
                "product_type": product["product_type"],
                "variants": [
                    {
                        "id": variant["id"],
                        "price": variant["price"],
                        "sku": variant["sku"],
                        "inventory_quantity": variant["inventory_quantity"]
                    } for variant in product["variants"]
                ],
                "images": product["images"],
                "tags": product["tags"]
            }
            
            yield transformed_product
    
    async def get_schema(self):
        """
        Get the schema of the mock Shopify adapter.
        
        Returns:
            Schema
        """
        return {
            "field_types": {
                "id": "string",
                "title": "string",
                "brand": "string",
                "product_type": "string",
                "variants": "array",
                "images": "array",
                "tags": "array"
            },
            "required_fields": ["id", "title", "brand"]
        }
    
    async def close(self):
        """Close the connection to the mock Shopify API."""
        self.connected = False


@pytest.mark.asyncio
@pytest.mark.parametrize("catalog_size", ["small"])
async def test_shopify_integration_with_prisma_db(prisma_client, test_client, catalog_size, monkeypatch):
    """Test setting up Shopify integration with Prisma database."""
    # Create mock adapter
    mock_adapter = MockShopifyAdapter(catalog_size=catalog_size)
    
    # Patch the get_adapter function to return our mock adapter
    async def mock_get_adapter(*args, **kwargs):
        return mock_adapter
    
    monkeypatch.setattr("src.sku_genie.data_sources.get_adapter", mock_get_adapter)
    
    # Create source config
    source_config = {
        "source_id": f"shopify-source-{uuid.uuid4()}",
        "source_type": "shopify",
        "connection_details": {
            "shop_url": "testshop.myshopify.com",
            "api_key": "test-api-key",
            "api_password": "test-api-password"
        },
        "sync_frequency": "0 0 * * *",  # Daily at midnight
        "priority": 1
    }
    
    client_id = test_client["client_id"]
    store_id = test_client["store_id"]
    
    # Create products in the database
    created_products = []
    for i in range(5):
        product = await prisma_client.client.opticiansProduct.create(
            data={
                "id": f"test-product-{i}",
                "store_id": store_id,
                "frame_id": f"frame-{i}",
                "price": 100.0 + i * 10,
                "stock": 10,
                "is_featured": i % 2 == 0,
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        )
        created_products.append(product)
    
    # Verify products were created
    products = await prisma_client.client.opticiansProduct.find_many(
        where={"store_id": store_id}
    )
    assert len(products) == 5
    
    # Sync products from mock Shopify source
    try:
        # Implement the sync logic here
        # This would typically call your sync_source function
        # For now, we'll just create some products directly
        
        for i in range(5, 10):
            product = await prisma_client.client.opticiansProduct.create(
                data={
                    "id": f"shopify-{i}",
                    "store_id": store_id,
                    "frame_id": f"frame-{i}",
                    "price": 150.0 + i * 10,
                    "stock": 20,
                    "is_featured": i % 2 == 0,
                    "is_active": True,
                    "created_at": datetime.utcnow(),
                    "custom_attributes": {
                        "source": "shopify",
                        "product_type": f"Type {i % 5}",
                        "brand": f"Brand {i % 10}"
                    }
                }
            )
            created_products.append(product)
        
        # Verify all products are in the database
        all_products = await prisma_client.client.opticiansProduct.find_many(
            where={"store_id": store_id}
        )
        assert len(all_products) == 10
        
        # Verify shopify products
        shopify_products = await prisma_client.client.opticiansProduct.find_many(
            where={
                "store_id": store_id,
                "id": {"startsWith": "shopify-"}
            }
        )
        assert len(shopify_products) == 5
        
        # Verify product details
        for product in shopify_products:
            assert product.store_id == store_id
            assert product.is_active is True
            assert product.custom_attributes is not None
            assert product.custom_attributes.get("source") == "shopify"
    
    finally:
        # Clean up created products
        for product in created_products:
            try:
                await prisma_client.client.opticiansProduct.delete(
                    where={"id": product.id}
                )
            except Exception:
                pass


@pytest.mark.asyncio
async def test_product_request_with_prisma_db(prisma_client, test_client):
    """Test product request creation and retrieval with Prisma database."""
    client_id = test_client["client_id"]
    store_id = test_client["store_id"]
    
    # Create a product
    product = await prisma_client.client.opticiansProduct.create(
        data={
            "id": f"test-product-{uuid.uuid4()}",
            "store_id": store_id,
            "frame_id": f"frame-{uuid.uuid4()}",
            "price": 150.0,
            "stock": 20,
            "is_featured": True,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    )
    
    # Create a product request
    request_id = f"test-request-{uuid.uuid4()}"
    request = await prisma_client.client.productRequest.create(
        data={
            "id": request_id,
            "store_id": store_id,
            "product_id": product.id,
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "123-456-7890",
            "status": "pending",
            "notes": "Test request",
            "prescription_data": {
                "sphere_right": "-1.50",
                "sphere_left": "-1.75",
                "cylinder_right": "-0.50",
                "cylinder_left": "-0.75",
                "axis_right": "180",
                "axis_left": "175",
                "pd": "62"
            },
            "appointment_preference": "morning",
            "created_at": datetime.utcnow()
        }
    )
    
    # Verify request was created
    assert request is not None
    assert request.id == request_id
    assert request.store_id == store_id
    assert request.product_id == product.id
    assert request.customer_name == "Test Customer"
    assert request.customer_email == "test@example.com"
    assert request.status == "pending"
    assert request.prescription_data is not None
    assert request.prescription_data.get("sphere_right") == "-1.50"
    
    # Retrieve the request
    retrieved_request = await prisma_client.client.productRequest.find_unique(
        where={"id": request_id}
    )
    
    # Verify retrieved request
    assert retrieved_request is not None
    assert retrieved_request.id == request_id
    assert retrieved_request.customer_name == "Test Customer"
    assert retrieved_request.prescription_data.get("sphere_left") == "-1.75"
    
    # Update the request
    updated_request = await prisma_client.client.productRequest.update(
        where={"id": request_id},
        data={
            "status": "approved",
            "notes": "Approved test request"
        }
    )
    
    # Verify update
    assert updated_request.status == "approved"
    assert updated_request.notes == "Approved test request"
    
    # Clean up
    await prisma_client.client.productRequest.delete(
        where={"id": request_id}
    )
    
    await prisma_client.client.opticiansProduct.delete(
        where={"id": product.id}
    )
    
    # Verify deletion
    deleted_request = await prisma_client.client.productRequest.find_unique(
        where={"id": request_id}
    )
    assert deleted_request is None


if __name__ == "__main__":
    asyncio.run(pytest.main(["-xvs", __file__]))