"""
Integration tests for the SKU-Genie initial setup process.

These tests cover the complete integration setup workflow for Store Owners,
including initial configuration, data source connection, and validation.
"""

import unittest
import asyncio
import json
import os
import tempfile
from unittest.mock import patch, MagicMock
import uuid
from datetime import datetime

from src.sku_genie.core.models import ConflictResolutionStrategy
from src.sku_genie.data_sources import get_adapter
from src.sku_genie.quality import process_batch
from src.sku_genie.sync import sync_source
from src.sku_genie.maintenance import cleanup_all, optimize_indexes


class MockShopifyAPI:
    """Mock Shopify API for testing."""
    
    def __init__(self, catalog_size="small"):
        """
        Initialize the mock Shopify API.
        
        Args:
            catalog_size: Size of the catalog to simulate ("small", "medium", "large")
        """
        self.catalog_size = catalog_size
        self.connected = False
        self.products = []
        
        # Generate test products based on catalog size
        product_count = {
            "small": 50,
            "medium": 500,
            "large": 5000
        }.get(catalog_size, 50)
        
        for i in range(product_count):
            self.products.append({
                "id": f"shopify-{i}",
                "title": f"Product {i}",
                "vendor": f"Brand {i % 10}",
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
                    {
                        "src": f"https://example.com/image-{i}.jpg"
                    }
                ],
                "tags": f"tag1, tag2, tag{i % 5}"
            })
    
    async def connect(self, shop_url, api_key, api_password):
        """
        Connect to the mock Shopify API.
        
        Args:
            shop_url: Shop URL
            api_key: API key
            api_password: API password
            
        Returns:
            True if connection successful, False otherwise
        """
        # Simulate connection validation
        if not shop_url or not api_key or not api_password:
            return False
            
        self.connected = True
        return True
    
    async def get_products(self, limit=None):
        """
        Get products from the mock Shopify API.
        
        Args:
            limit: Maximum number of products to return
            
        Returns:
            List of products
        """
        if not self.connected:
            raise Exception("Not connected to Shopify API")
            
        if limit:
            return self.products[:limit]
        return self.products
    
    async def get_shop_info(self):
        """
        Get shop information from the mock Shopify API.
        
        Returns:
            Shop information
        """
        if not self.connected:
            raise Exception("Not connected to Shopify API")
            
        return {
            "name": "Test Shop",
            "email": "owner@testshop.com",
            "domain": "testshop.myshopify.com",
            "plan_name": "Basic",
            "created_at": datetime.utcnow().isoformat()
        }


class MockShopifyAdapter:
    """Mock Shopify adapter for testing."""
    
    def __init__(self, catalog_size="small"):
        """
        Initialize the mock Shopify adapter.
        
        Args:
            catalog_size: Size of the catalog to simulate ("small", "medium", "large")
        """
        self.api = MockShopifyAPI(catalog_size)
        self.connected = False
        self.config = None
    
    async def connect(self, config):
        """
        Connect to the mock Shopify API.
        
        Args:
            config: Connection configuration
            
        Returns:
            True if connection successful, False otherwise
        """
        self.config = config
        result = await self.api.connect(
            shop_url=config.get("shop_url"),
            api_key=config.get("api_key"),
            api_password=config.get("api_password")
        )
        
        self.connected = result
        return result
    
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
        products = await self.api.get_products(limit)
        
        for product in products:
            # Transform to SKU-Genie format
            transformed_product = {
                "id": product["id"],
                "title": product["title"],
                "brand": product["vendor"],
                "product_type": product["product_type"],
                "variants": [
                    {
                        "id": variant["id"],
                        "price": variant["price"],
                        "sku": variant["sku"],
                        "inventory_quantity": variant["inventory_quantity"]
                    } for variant in product["variants"]
                ],
                "images": [image["src"] for image in product["images"]],
                "tags": product["tags"].split(", ") if product["tags"] else []
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


class MockDatabase:
    """Mock database for testing."""
    
    def __init__(self):
        """Initialize the mock database."""
        self.collections = {
            "clients": {},
            "jobs": {},
            "products": {}
        }
        self.db = self
    
    async def get_client(self, client_id, user_context=None):
        """
        Get a client by ID.
        
        Args:
            client_id: Client ID
            user_context: User context
            
        Returns:
            Client or None
        """
        return self.collections["clients"].get(client_id)
    
    async def create_client(self, client_data, user_context=None):
        """
        Create a client.
        
        Args:
            client_data: Client data
            user_context: User context
            
        Returns:
            Client ID
        """
        client_id = client_data.get("client_id") or str(uuid.uuid4())
        client_data["client_id"] = client_id
        self.collections["clients"][client_id] = client_data
        return client_id
    
    async def update_client(self, client_id, client_data, user_context=None):
        """
        Update a client.
        
        Args:
            client_id: Client ID
            client_data: Client data
            user_context: User context
            
        Returns:
            True if successful, False otherwise
        """
        if client_id not in self.collections["clients"]:
            return False
            
        self.collections["clients"][client_id].update(client_data)
        return True
    
    async def create_job(self, job_data, user_context=None):
        """
        Create a job.
        
        Args:
            job_data: Job data
            user_context: User context
            
        Returns:
            Job ID
        """
        job_id = job_data.get("job_id") or str(uuid.uuid4())
        job_data["job_id"] = job_id
        self.collections["jobs"][job_id] = job_data
        return job_id
    
    async def update_job(self, job_id, job_data, user_context=None):
        """
        Update a job.
        
        Args:
            job_id: Job ID
            job_data: Job data
            user_context: User context
            
        Returns:
            True if successful, False otherwise
        """
        if job_id not in self.collections["jobs"]:
            return False
            
        self.collections["jobs"][job_id].update(job_data)
        return True
    
    async def find(self, filter_query):
        """
        Find documents.
        
        Args:
            filter_query: Filter query
            
        Returns:
            Cursor
        """
        collection = filter_query.pop("collection", "products")
        
        # Filter documents
        documents = []
        
        for doc_id, doc in self.collections[collection].items():
            match = True
            
            for key, value in filter_query.items():
                if key not in doc or doc[key] != value:
                    match = False
                    break
            
            if match:
                documents.append(doc)
        
        # Create cursor
        cursor = MagicMock()
        cursor.to_list = MagicMock(return_value=documents)
        
        return cursor
    
    async def bulk_write(self, operations):
        """
        Execute bulk write operations.
        
        Args:
            operations: Bulk write operations
            
        Returns:
            Result
        """
        collection = "products"
        upserted_count = 0
        modified_count = 0
        
        for op in operations:
            if "update_one" in op:
                # Update operation
                filter_query = op["update_one"]["filter"]
                update = op["update_one"]["update"]["$set"]
                upsert = op["update_one"].get("upsert", False)
                
                # Find document
                doc_id = None
                
                for key, value in filter_query.items():
                    if key == "id" or key == "_id":
                        doc_id = value
                        break
                
                if doc_id in self.collections[collection]:
                    # Update document
                    self.collections[collection][doc_id].update(update)
                    modified_count += 1
                elif upsert:
                    # Insert document
                    self.collections[collection][doc_id] = update
                    upserted_count += 1
            elif "insert_one" in op:
                # Insert operation
                document = op["insert_one"]["document"]
                doc_id = document.get("id") or document.get("_id")
                
                if doc_id:
                    self.collections[collection][doc_id] = document
                    upserted_count += 1
        
        # Create result
        result = MagicMock()
        result.upserted_count = upserted_count
        result.modified_count = modified_count
        
        return result


class TestShopifyIntegrationSetup(unittest.TestCase):
    """Integration tests for Shopify integration setup."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create mock database
        self.mock_db = MockDatabase()
        
        # Create test client
        self.client_id = "test-client"
        self.mock_db.collections["clients"][self.client_id] = {
            "client_id": self.client_id,
            "name": "Test Client",
            "active": True,
            "data_sources": [],
            "schemas": {},
            "quality_settings": {
                "conflict_resolution_strategy": ConflictResolutionStrategy.NEWEST_WINS
            }
        }
    
    @patch("src.sku_genie.data_sources.get_adapter")
    @patch("src.sku_genie.core.database.get_database")
    async def test_shopify_integration_setup_small_catalog(self, mock_get_database, mock_get_adapter):
        """Test setting up Shopify integration with a small catalog."""
        # Set up mocks
        mock_adapter = MockShopifyAdapter(catalog_size="small")
        mock_get_adapter.return_value = mock_adapter
        mock_get_database.return_value = self.mock_db
        
        # Create source config
        source_config = {
            "source_id": "shopify-source",
            "source_type": "shopify",
            "connection_details": {
                "shop_url": "testshop.myshopify.com",
                "api_key": "test-api-key",
                "api_password": "test-api-password"
            },
            "sync_frequency": "0 0 * * *",  # Daily at midnight
            "priority": 1
        }
        
        # Add data source to client
        client = await self.mock_db.get_client(self.client_id)
        client["data_sources"].append(source_config)
        await self.mock_db.update_client(self.client_id, {"data_sources": client["data_sources"]})
        
        # Sync source
        job_result = await sync_source(self.client_id, source_config)
        
        # Check job result
        self.assertEqual(job_result.status, "completed")
        self.assertEqual(job_result.total_items, 50)  # Small catalog size
        self.assertEqual(job_result.imported_items, 50)
        
        # Check database
        self.assertEqual(len(self.mock_db.collections["products"]), 50)
        
        # Verify products were imported correctly
        for i in range(50):
            product_id = f"shopify-{i}"
            self.assertIn(product_id, self.mock_db.collections["products"])
            product = self.mock_db.collections["products"][product_id]
            self.assertEqual(product["title"], f"Product {i}")
            self.assertEqual(product["brand"], f"Brand {i % 10}")
            self.assertEqual(product["client_id"], self.client_id)
    
    @patch("src.sku_genie.data_sources.get_adapter")
    @patch("src.sku_genie.core.database.get_database")
    async def test_shopify_integration_setup_medium_catalog(self, mock_get_database, mock_get_adapter):
        """Test setting up Shopify integration with a medium catalog."""
        # Set up mocks
        mock_adapter = MockShopifyAdapter(catalog_size="medium")
        mock_get_adapter.return_value = mock_adapter
        mock_get_database.return_value = self.mock_db
        
        # Create source config
        source_config = {
            "source_id": "shopify-source",
            "source_type": "shopify",
            "connection_details": {
                "shop_url": "testshop.myshopify.com",
                "api_key": "test-api-key",
                "api_password": "test-api-password"
            },
            "sync_frequency": "0 0 * * *",  # Daily at midnight
            "priority": 1
        }
        
        # Add data source to client
        client = await self.mock_db.get_client(self.client_id)
        client["data_sources"].append(source_config)
        await self.mock_db.update_client(self.client_id, {"data_sources": client["data_sources"]})
        
        # Sync source with limit to avoid long test times
        source_config["options"] = {"limit": 100}
        job_result = await sync_source(self.client_id, source_config)
        
        # Check job result
        self.assertEqual(job_result.status, "completed")
        self.assertEqual(job_result.total_items, 100)  # Limited to 100
        self.assertEqual(job_result.imported_items, 100)
        
        # Check database
        self.assertEqual(len(self.mock_db.collections["products"]), 100)
    
    @patch("src.sku_genie.data_sources.get_adapter")
    @patch("src.sku_genie.core.database.get_database")
    async def test_shopify_integration_setup_large_catalog(self, mock_get_database, mock_get_adapter):
        """Test setting up Shopify integration with a large catalog."""
        # Set up mocks
        mock_adapter = MockShopifyAdapter(catalog_size="large")
        mock_get_adapter.return_value = mock_adapter
        mock_get_database.return_value = self.mock_db
        
        # Create source config
        source_config = {
            "source_id": "shopify-source",
            "source_type": "shopify",
            "connection_details": {
                "shop_url": "testshop.myshopify.com",
                "api_key": "test-api-key",
                "api_password": "test-api-password"
            },
            "sync_frequency": "0 0 * * *",  # Daily at midnight
            "priority": 1
        }
        
        # Add data source to client
        client = await self.mock_db.get_client(self.client_id)
        client["data_sources"].append(source_config)
        await self.mock_db.update_client(self.client_id, {"data_sources": client["data_sources"]})
        
        # Sync source with limit to avoid long test times
        source_config["options"] = {"limit": 200}
        job_result = await sync_source(self.client_id, source_config)
        
        # Check job result
        self.assertEqual(job_result.status, "completed")
        self.assertEqual(job_result.total_items, 200)  # Limited to 200
        self.assertEqual(job_result.imported_items, 200)
        
        # Check database
        self.assertEqual(len(self.mock_db.collections["products"]), 200)
    
    @patch("src.sku_genie.data_sources.get_adapter")
    @patch("src.sku_genie.core.database.get_database")
    async def test_shopify_integration_invalid_credentials(self, mock_get_database, mock_get_adapter):
        """Test Shopify integration with invalid credentials."""
        # Set up mocks
        mock_adapter = MockShopifyAdapter()
        mock_get_adapter.return_value = mock_adapter
        mock_get_database.return_value = self.mock_db
        
        # Create source config with invalid credentials
        source_config = {
            "source_id": "shopify-source",
            "source_type": "shopify",
            "connection_details": {
                "shop_url": "testshop.myshopify.com",
                "api_key": "",  # Empty API key
                "api_password": "test-api-password"
            },
            "sync_frequency": "0 0 * * *",
            "priority": 1
        }
        
        # Add data source to client
        client = await self.mock_db.get_client(self.client_id)
        client["data_sources"].append(source_config)
        await self.mock_db.update_client(self.client_id, {"data_sources": client["data_sources"]})
        
        # Sync source
        job_result = await sync_source(self.client_id, source_config)
        
        # Check job result
        self.assertEqual(job_result.status, "failed")
        self.assertEqual(job_result.error, "Failed to connect to data source")
        
        # Check database
        self.assertEqual(len(self.mock_db.collections["products"]), 0)


class TestWooCommerceIntegrationSetup(unittest.TestCase):
    """Integration tests for WooCommerce integration setup."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create mock database
        self.mock_db = MockDatabase()
        
        # Create test client
        self.client_id = "test-client"
        self.mock_db.collections["clients"][self.client_id] = {
            "client_id": self.client_id,
            "name": "Test Client",
            "active": True,
            "data_sources": [],
            "schemas": {},
            "quality_settings": {
                "conflict_resolution_strategy": ConflictResolutionStrategy.NEWEST_WINS
            }
        }
    
    @patch("src.sku_genie.data_sources.get_adapter")
    @patch("src.sku_genie.core.database.get_database")
    async def test_woocommerce_integration_setup(self, mock_get_database, mock_get_adapter):
        """Test setting up WooCommerce integration."""
        # Create a mock WooCommerce adapter similar to Shopify adapter
        mock_adapter = MagicMock()
        mock_adapter.connect = MagicMock(return_value=True)
        mock_adapter.fetch_data = MagicMock(return_value=[
            {
                "id": f"woo-{i}",
                "title": f"WooProduct {i}",
                "brand": f"WooBrand {i % 5}",
                "product_type": f"WooType {i % 3}",
                "variants": [],
                "images": [f"https://example.com/woo-image-{i}.jpg"],
                "tags": [f"wootag{i}", "woocommerce"]
            } for i in range(30)
        ])
        mock_adapter.get_schema = MagicMock(return_value={
            "field_types": {
                "id": "string",
                "title": "string",
                "brand": "string",
                "product_type": "string",
                "variants": "array",
                "images": "array",
                "tags": "array"
            },
            "required_fields": ["id", "title"]
        })
        
        mock_get_adapter.return_value = mock_adapter
        mock_get_database.return_value = self.mock_db
        
        # Create source config
        source_config = {
            "source_id": "woo-source",
            "source_type": "woocommerce",
            "connection_details": {
                "site_url": "https://teststore.com",
                "consumer_key": "test-consumer-key",
                "consumer_secret": "test-consumer-secret"
            },
            "sync_frequency": "0 0 * * *",  # Daily at midnight
            "priority": 1
        }
        
        # Add data source to client
        client = await self.mock_db.get_client(self.client_id)
        client["data_sources"].append(source_config)
        await self.mock_db.update_client(self.client_id, {"data_sources": client["data_sources"]})
        
        # Sync source
        job_result = await sync_source(self.client_id, source_config)
        
        # Check job result
        self.assertEqual(job_result.status, "completed")
        
        # Verify adapter methods were called
        mock_adapter.connect.assert_called_once()
        mock_adapter.fetch_data.assert_called_once()
        mock_adapter.get_schema.assert_called_once()


if __name__ == "__main__":
    unittest.main()