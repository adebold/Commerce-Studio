"""
Tests for the SKU-Genie conflict detection and resolution.

This module contains tests for the conflict detection and resolution functionality.
"""

import unittest
import asyncio
from datetime import datetime

from src.sku_genie.core.models import Conflict, ConflictResolutionStrategy
from src.sku_genie.sync.conflict import ConflictDetector, ConflictResolver, DataMerger


class TestConflictDetection(unittest.TestCase):
    """Tests for conflict detection."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.detector = ConflictDetector()
        
        self.source_data = {
            "id": "123",
            "brand": "Ray-Ban",
            "frameShape": "round",
            "frameMaterial": "metal",
            "frameWidth": 140,
            "price": 150.0,
            "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
            "website": "https://example.com",
            "email": "info@example.com",
            "source": "shopify",
            "source_id": "shopify_123",
            "last_updated": datetime.now().isoformat()
        }
        
        self.db_data = {
            "id": "123",
            "brand": "Ray-Ban",
            "frameShape": "square",  # Different from source
            "frameMaterial": "metal",
            "frameWidth": 135,  # Different from source
            "price": 150.0,
            "images": ["https://example.com/image1.jpg"],  # Different from source
            "website": "https://example.com",
            "email": "info@example.com",
            "source": "manual",
            "source_id": "manual_123",
            "last_updated": (datetime.now().replace(day=1)).isoformat()  # Older than source
        }
    
    def test_detect_conflicts(self):
        """Test detecting conflicts between source data and database data."""
        conflicts = self.detector.detect_conflicts(self.source_data, self.db_data)
        
        # Check that conflicts were detected
        self.assertGreater(len(conflicts), 0)
        
        # Check for specific conflicts
        conflicts_by_field = {conflict.field: conflict for conflict in conflicts}
        
        self.assertIn("frameShape", conflicts_by_field)
        self.assertEqual(conflicts_by_field["frameShape"].source_value, "round")
        self.assertEqual(conflicts_by_field["frameShape"].db_value, "square")
        
        self.assertIn("frameWidth", conflicts_by_field)
        self.assertEqual(conflicts_by_field["frameWidth"].source_value, 140)
        self.assertEqual(conflicts_by_field["frameWidth"].db_value, 135)
        
        self.assertIn("images", conflicts_by_field)
        
        # Check that ignored fields are not included
        self.assertNotIn("source", conflicts_by_field)
        self.assertNotIn("source_id", conflicts_by_field)
        self.assertNotIn("last_updated", conflicts_by_field)
    
    def test_no_conflicts(self):
        """Test detecting no conflicts when data is identical."""
        # Make a copy of source data
        identical_data = self.source_data.copy()
        
        conflicts = self.detector.detect_conflicts(self.source_data, identical_data)
        
        # Check that no conflicts were detected
        self.assertEqual(len(conflicts), 0)


class TestConflictResolution(unittest.TestCase):
    """Tests for conflict resolution."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.resolver = ConflictResolver()
        
        self.source_data = {
            "id": "123",
            "brand": "Ray-Ban",
            "frameShape": "round",
            "frameMaterial": "metal",
            "frameWidth": 140,
            "price": 150.0,
            "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
            "website": "https://example.com",
            "email": "info@example.com",
            "source": "shopify",
            "source_id": "shopify_123",
            "last_updated": datetime.now().isoformat()
        }
        
        self.db_data = {
            "id": "123",
            "brand": "Ray-Ban",
            "frameShape": "square",  # Different from source
            "frameMaterial": "metal",
            "frameWidth": 135,  # Different from source
            "price": 150.0,
            "images": ["https://example.com/image1.jpg"],  # Different from source
            "website": "https://example.com",
            "email": "info@example.com",
            "source": "manual",
            "source_id": "manual_123",
            "last_updated": (datetime.now().replace(day=1)).isoformat()  # Older than source
        }
        
        # Create conflicts
        self.detector = ConflictDetector()
        self.conflicts = self.detector.detect_conflicts(self.source_data, self.db_data)
    
    def test_resolve_conflicts_source_wins(self):
        """Test resolving conflicts with source wins strategy."""
        resolved_data = self.resolver.resolve_conflicts(
            self.source_data, self.db_data, self.conflicts, ConflictResolutionStrategy.SOURCE_WINS
        )
        
        # Check that source data was used for conflicting fields
        self.assertEqual(resolved_data["frameShape"], "round")
        self.assertEqual(resolved_data["frameWidth"], 140)
        self.assertEqual(resolved_data["images"], ["https://example.com/image1.jpg", "https://example.com/image2.jpg"])
        
        # Check that non-conflicting fields were preserved
        self.assertEqual(resolved_data["brand"], "Ray-Ban")
        self.assertEqual(resolved_data["frameMaterial"], "metal")
        self.assertEqual(resolved_data["price"], 150.0)
    
    def test_resolve_conflicts_db_wins(self):
        """Test resolving conflicts with database wins strategy."""
        resolved_data = self.resolver.resolve_conflicts(
            self.source_data, self.db_data, self.conflicts, ConflictResolutionStrategy.DB_WINS
        )
        
        # Check that database data was used for conflicting fields
        self.assertEqual(resolved_data["frameShape"], "square")
        self.assertEqual(resolved_data["frameWidth"], 135)
        self.assertEqual(resolved_data["images"], ["https://example.com/image1.jpg"])
        
        # Check that non-conflicting fields were preserved
        self.assertEqual(resolved_data["brand"], "Ray-Ban")
        self.assertEqual(resolved_data["frameMaterial"], "metal")
        self.assertEqual(resolved_data["price"], 150.0)
    
    def test_resolve_conflicts_newest_wins(self):
        """Test resolving conflicts with newest wins strategy."""
        resolved_data = self.resolver.resolve_conflicts(
            self.source_data, self.db_data, self.conflicts, ConflictResolutionStrategy.NEWEST_WINS
        )
        
        # Check that source data was used for conflicting fields (source is newer)
        self.assertEqual(resolved_data["frameShape"], "round")
        self.assertEqual(resolved_data["frameWidth"], 140)
        self.assertEqual(resolved_data["images"], ["https://example.com/image1.jpg", "https://example.com/image2.jpg"])
        
        # Check that non-conflicting fields were preserved
        self.assertEqual(resolved_data["brand"], "Ray-Ban")
        self.assertEqual(resolved_data["frameMaterial"], "metal")
        self.assertEqual(resolved_data["price"], 150.0)


class TestDataMerging(unittest.TestCase):
    """Tests for data merging."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.merger = DataMerger()
        
        self.source_items = [
            {
                "id": "123",
                "brand": "Ray-Ban",
                "frameShape": "round",
                "frameMaterial": "metal",
                "frameWidth": 140,
                "price": 150.0,
                "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
                "source": "shopify",
                "source_id": "shopify_123",
                "last_updated": datetime.now().isoformat()
            },
            {
                "id": "456",
                "brand": "Oakley",
                "frameShape": "square",
                "frameMaterial": "plastic",
                "frameWidth": 145,
                "price": 200.0,
                "images": ["https://example.com/image3.jpg"],
                "source": "shopify",
                "source_id": "shopify_456",
                "last_updated": datetime.now().isoformat()
            },
            {
                "id": "789",
                "brand": "Gucci",
                "frameShape": "cat-eye",
                "frameMaterial": "acetate",
                "frameWidth": 138,
                "price": 300.0,
                "images": ["https://example.com/image4.jpg"],
                "source": "shopify",
                "source_id": "shopify_789",
                "last_updated": datetime.now().isoformat()
            }
        ]
        
        self.db_items = [
            {
                "id": "123",
                "brand": "Ray-Ban",
                "frameShape": "square",  # Different from source
                "frameMaterial": "metal",
                "frameWidth": 135,  # Different from source
                "price": 150.0,
                "images": ["https://example.com/image1.jpg"],  # Different from source
                "source": "manual",
                "source_id": "manual_123",
                "last_updated": (datetime.now().replace(day=1)).isoformat()  # Older than source
            },
            {
                "id": "456",
                "brand": "Oakley",
                "frameShape": "square",
                "frameMaterial": "plastic",
                "frameWidth": 145,
                "price": 180.0,  # Different from source
                "images": ["https://example.com/image3.jpg"],
                "source": "manual",
                "source_id": "manual_456",
                "last_updated": (datetime.now().replace(day=1)).isoformat()  # Older than source
            }
            # Note: No item with id "789" in database
        ]
    
    def test_merge_batch(self):
        """Test merging a batch of items."""
        merged_items = self.merger.merge_batch(
            self.source_items, self.db_items, "id", ConflictResolutionStrategy.NEWEST_WINS
        )
        
        # Check that all source items are in the merged items
        self.assertEqual(len(merged_items), 3)
        
        # Check that items with conflicts were merged correctly
        merged_items_by_id = {item["id"]: item for item in merged_items}
        
        # Item 123 should have source values for conflicting fields
        self.assertEqual(merged_items_by_id["123"]["frameShape"], "round")
        self.assertEqual(merged_items_by_id["123"]["frameWidth"], 140)
        self.assertEqual(merged_items_by_id["123"]["images"], ["https://example.com/image1.jpg", "https://example.com/image2.jpg"])
        
        # Item 456 should have source values for conflicting fields
        self.assertEqual(merged_items_by_id["456"]["price"], 200.0)
        
        # Item 789 should be included as is
        self.assertEqual(merged_items_by_id["789"]["brand"], "Gucci")
        self.assertEqual(merged_items_by_id["789"]["frameShape"], "cat-eye")
        self.assertEqual(merged_items_by_id["789"]["frameMaterial"], "acetate")


if __name__ == "__main__":
    unittest.main()