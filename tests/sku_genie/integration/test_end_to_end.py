"""
End-to-end integration tests for the SKU-Genie system.

This module contains tests that verify the integration between different modules
of the SKU-Genie system, from data source to database.
"""

import unittest
import asyncio
import json
import os
from datetime import datetime
from unittest.mock import patch, MagicMock

from src.sku_genie.core.models import ConflictResolutionStrategy
from src.sku_genie.data_sources import get_adapter
from src.sku_genie.quality import process_batch
from src.sku_genie.sync import sync_source
from src.sku_genie.maintenance import cleanup_all, optimize_indexes


class MockDataSource:
    """Mock data source for testing."""
    
    def __init__(self, items):
        """
        Initialize the mock data source.
        
        Args:
            items: Items to return
        """
        self.items = items
        self.connected = False
    
    async def connect(self, config):
        """
        Connect to the mock data source.
        
        Args:
            config: Connection configuration
            
        Returns:
            True
        """
        self.connected = True
        return True
    
    async def fetch_data(self, options):
        """
        Fetch data from the mock data source.
        
        Args:
            options: Fetch options
            
        Returns:
            Items
        """
        for item in self.items:
            yield item
    
    async def get_schema(self):
        """
        Get the schema of the mock data source.
        
        Returns:
            Schema
        """
        return {
            "field_types": {
                "id": "string",
                "brand": "string",
                "frameShape": "string",
                "frameMaterial": "string",
                "frameWidth": "number",
                "price": "number",
                "images": "array"
            },
            "required_fields": ["id", "brand", "frameShape", "frameMaterial"]
        }
    
    async def close(self):
        """Close the connection to the mock data source."""
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
    
    async def get_client(self, client_id):
        """
        Get a client by ID.
        
        Args:
            client_id: Client ID
            
        Returns:
            Client or None
        """
        return self.collections["clients"].get(client_id)
    
    async def create_job(self, job_data):
        """
        Create a job.
        
        Args:
            job_data: Job data
            
        Returns:
            Job ID
        """
        job_id = job_data["job_id"]
        self.collections["jobs"][job_id] = job_data
        return job_id
    
    async def update_job(self, job_id, job_data):
        """
        Update a job.
        
        Args:
            job_id: Job ID
            job_data: Job data
            
        Returns:
            True
        """
        self.collections["jobs"][job_id] = job_data
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
    
    def command(self, command, collection=None):
        """
        Execute a command.
        
        Args:
            command: Command
            collection: Collection
            
        Returns:
            Result
        """
        if command == "collStats":
            return {
                "size": 1000,
                "storageSize": 1000,
                "avgObjSize": 100,
                "totalIndexSize": 500
            }
        
        return {}


class TestEndToEnd(unittest.TestCase):
    """End-to-end integration tests."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create test data
        self.test_items = [
            {
                "id": "123",
                "brand": "Ray-Ban",
                "frameShape": "round",
                "frameMaterial": "metal",
                "frameWidth": 140,
                "price": 150.0,
                "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
            },
            {
                "id": "456",
                "brand": "Oakley",
                "frameShape": "square",
                "frameMaterial": "plastic",
                "frameWidth": 145,
                "price": 200.0,
                "images": ["https://example.com/image3.jpg"]
            },
            {
                "id": "789",
                "brand": "Gucci",
                "frameShape": "cat-eye",
                "frameMaterial": "acetate",
                "frameWidth": 138,
                "price": 300.0,
                "images": ["https://example.com/image4.jpg"]
            }
        ]
        
        # Create mock data source
        self.mock_data_source = MockDataSource(self.test_items)
        
        # Create mock database
        self.mock_db = MockDatabase()
        
        # Add test client
        self.client_id = "test_client"
        self.mock_db.collections["clients"][self.client_id] = {
            "client_id": self.client_id,
            "name": "Test Client",
            "data_sources": [
                {
                    "source_id": "test_source",
                    "source_type": "mock",
                    "connection_details": {}
                }
            ],
            "schemas": {
                "products": {
                    "field_types": {
                        "id": "string",
                        "brand": "string",
                        "frameShape": "string",
                        "frameMaterial": "string",
                        "frameWidth": "number",
                        "price": "number",
                        "images": "array"
                    },
                    "required_fields": ["id", "brand", "frameShape", "frameMaterial"]
                }
            },
            "quality_settings": {
                "conflict_resolution_strategy": ConflictResolutionStrategy.NEWEST_WINS
            }
        }
    
    @patch("src.sku_genie.data_sources.get_adapter")
    @patch("src.sku_genie.core.database.get_database")
    async def test_data_source_to_quality(self, mock_get_database, mock_get_adapter):
        """Test data flow from data source to quality module."""
        # Set up mocks
        mock_get_adapter.return_value = self.mock_data_source
        
        # Get schema
        schema = self.mock_db.collections["clients"][self.client_id]["schemas"]["products"]
        
        # Process batch
        processed_items, quality_report = await process_batch(self.test_items, schema)
        
        # Check processed items
        self.assertEqual(len(processed_items), 3)
        
        # Check quality report
        self.assertEqual(quality_report.items_processed, 3)
        self.assertEqual(quality_report.items_with_issues, 0)
        self.assertEqual(quality_report.quality_score, 100)
    
    @patch("src.sku_genie.data_sources.get_adapter")
    @patch("src.sku_genie.core.database.get_database")
    async def test_sync_source(self, mock_get_database, mock_get_adapter):
        """Test syncing a source with the database."""
        # Set up mocks
        mock_get_adapter.return_value = self.mock_data_source
        mock_get_database.return_value = self.mock_db
        
        # Create source config
        source_config = {
            "source_id": "test_source",
            "source_type": "mock",
            "connection_details": {}
        }
        
        # Sync source
        job_result = await sync_source(self.client_id, source_config)
        
        # Check job result
        self.assertEqual(job_result.status, "completed")
        self.assertEqual(job_result.total_items, 3)
        self.assertEqual(job_result.imported_items, 3)
        self.assertEqual(job_result.quality_score, 100)
        
        # Check database
        self.assertEqual(len(self.mock_db.collections["products"]), 3)
        
        for item_id in ["123", "456", "789"]:
            self.assertIn(item_id, self.mock_db.collections["products"])
            self.assertEqual(self.mock_db.collections["products"][item_id]["client_id"], self.client_id)
    
    @patch("src.sku_genie.core.database.get_database")
    async def test_maintenance(self, mock_get_database):
        """Test maintenance operations."""
        # Set up mocks
        mock_get_database.return_value = self.mock_db
        
        # Add some test jobs
        for i in range(10):
            job_id = f"job_{i}"
            self.mock_db.collections["jobs"][job_id] = {
                "job_id": job_id,
                "client_id": self.client_id,
                "status": "completed",
                "created_at": datetime.now(),
                "completed_at": datetime.now()
            }
        
        # Clean up old jobs
        cleanup_result = await cleanup_all(days=30, client_id=self.client_id)
        
        # Check cleanup result
        self.assertEqual(cleanup_result["jobs"]["deleted_count"], 0)
        
        # Optimize indexes
        optimize_result = await optimize_indexes(["products"], self.client_id)
        
        # Check optimize result
        self.assertIn("products", optimize_result["results"])


if __name__ == "__main__":
    unittest.main()