"""
MongoDB Foundation Service - TDD Framework Configuration
========================================================

This module provides pytest configuration and fixtures for the MongoDB Foundation Service
test-driven development framework.

Features:
- Test database setup and teardown
- Mock services and data generation
- Performance testing utilities
- Security testing fixtures
- Integration test helpers
"""

import sys
import os
from pathlib import Path

# Add project root to Python path for imports
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

import pytest
import pytest_asyncio
import asyncio
import logging
from typing import Dict, Any, List
from datetime import datetime
from bson import ObjectId
from unittest.mock import AsyncMock, MagicMock

# Test framework imports
import motor.motor_asyncio
from mongomock_motor import AsyncMongoMockClient
from faker import Faker

# Import the service for testing
from src.mongodb_foundation.service import MongoDBFoundationService

# Configure logging for tests
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Faker for test data generation
fake = Faker()


@pytest.fixture(scope="session")
def event_loop():
    """
    Create an instance of the default event loop for the test session.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def mongodb_test_client():
    """
    Create a test MongoDB client using mongomock for unit tests.
    For integration tests, this can be replaced with a real MongoDB instance.
    """
    # Use mongomock for fast unit tests
    client = AsyncMongoMockClient()
    yield client
    client.close()


@pytest.fixture(scope="function")
async def clean_test_database(mongodb_test_client):
    """
    Ensure clean database state before each test.
    """
    # Drop all collections before each test
    db = mongodb_test_client.mongodb_foundation_test
    collections = await db.list_collection_names()
    
    for collection_name in collections:
        await db[collection_name].drop()
    
    yield db
    
    # Clean up after test
    for collection_name in collections:
        await db[collection_name].drop()


@pytest_asyncio.fixture
async def mongodb_foundation_service(mongodb_test_client):
    """
    Create a MongoDB Foundation Service instance with a mock client for testing.
    """
    service = MongoDBFoundationService()
    # Inject the mock client to avoid real MongoDB connection
    service.client = mongodb_test_client
    service.db = mongodb_test_client.eyewear_ml
    
    # Initialize the service to set up managers and components
    await service.initialize()
    
    yield service
    
    # Cleanup
    if service.client:
        service.client.close()


@pytest.fixture
def sample_product_data():
    """
    Generate sample product data for testing.
    """
    return {
        "sku": fake.unique.bothify(text="TEST-####"),
        "name": fake.catch_phrase(),
        "description": fake.text(max_nb_chars=200),
        "brand_id": ObjectId(),
        "category_id": ObjectId(),
        "price": round(fake.random.uniform(50.0, 500.0), 2),
        "compare_at_price": round(fake.random.uniform(100.0, 800.0), 2),
        "in_stock": fake.boolean(chance_of_getting_true=80),
        "inventory_quantity": fake.random_int(min=0, max=100),
        "active": fake.boolean(chance_of_getting_true=90),
        "featured": fake.boolean(chance_of_getting_true=20),
        "quality_score": round(fake.random.uniform(0.1, 1.0), 2),
        "rating": round(fake.random.uniform(1.0, 5.0), 1),
        "frame_type": fake.random_element(elements=("prescription", "sunglasses", "reading")),
        "color": fake.color_name(),
        "face_shape_compatibility": {
            "oval": round(fake.random.uniform(0.1, 1.0), 2),
            "round": round(fake.random.uniform(0.1, 1.0), 2),
            "square": round(fake.random.uniform(0.1, 1.0), 2),
            "heart": round(fake.random.uniform(0.1, 1.0), 2),
            "diamond": round(fake.random.uniform(0.1, 1.0), 2),
            "oblong": round(fake.random.uniform(0.1, 1.0), 2)
        },
        "frame_shape": fake.random_element(elements=("rectangular", "round", "square", "cat-eye", "aviator")),
        "frame_material": fake.random_element(elements=("acetate", "metal", "titanium", "plastic")),
        "lens_type": fake.random_element(elements=("single_vision", "progressive", "bifocal", "non_prescription")),
        "gender_target": fake.random_element(elements=("men", "women", "unisex")),
        "style": fake.random_element(elements=("modern", "classic", "vintage", "trendy")),
        "frame_size": {
            "lens_width": fake.random_int(min=40, max=65),
            "bridge_width": fake.random_int(min=14, max=24),
            "temple_length": fake.random_int(min=120, max=150),
            "frame_width": fake.random_int(min=110, max=140),
            "frame_height": fake.random_int(min=25, max=50),
            "weight": round(fake.random.uniform(15.0, 40.0), 1)
        },
        "media": {
            "primary_image": fake.image_url(),
            "gallery_images": [fake.image_url() for _ in range(fake.random_int(min=1, max=5))],
            "try_on_image": fake.image_url(),
            "optimized_images": {
                "webp": [fake.image_url() for _ in range(2)],
                "placeholder": f"data:image/jpeg;base64,{fake.sha256()}"
            }
        },
        "created_at": fake.date_time_this_year(),
        "updated_at": fake.date_time_this_month(),
        "source": "test_data"
    }


@pytest.fixture
def sample_brand_data():
    """
    Generate sample brand data for testing.
    """
    return {
        "name": fake.company(),
        "slug": fake.slug(),
        "description": fake.text(max_nb_chars=300),
        "logo_url": fake.image_url(),
        "website": fake.url(),
        "product_count": fake.random_int(min=0, max=1000),
        "active": fake.boolean(chance_of_getting_true=95),
        "sort_order": fake.random_int(min=0, max=100),
        "created_at": fake.date_time_this_year(),
        "updated_at": fake.date_time_this_month()
    }


@pytest.fixture
def sample_category_data():
    """
    Generate sample category data for testing.
    """
    return {
        "name": fake.random_element(elements=("Prescription Glasses", "Sunglasses", "Reading Glasses", "Blue Light Glasses")),
        "slug": fake.slug(),
        "description": fake.text(max_nb_chars=200),
        "parent_id": None,  # Root category by default
        "level": 0,
        "sort_order": fake.random_int(min=0, max=10),
        "active": fake.boolean(chance_of_getting_true=95),
        "created_at": fake.date_time_this_year(),
        "updated_at": fake.date_time_this_month()
    }


@pytest.fixture
def sample_sku_genie_data():
    """
    Generate sample SKU Genie product data for testing transformation.
    """
    return {
        "sku": fake.unique.bothify(text="SKU-####"),
        "name": fake.catch_phrase(),
        "description": fake.text(max_nb_chars=200),
        "brand": fake.company(),
        "category": fake.random_element(elements=("Sunglasses", "Prescription", "Reading")),
        "frame_type": fake.random_element(elements=("sunglasses", "prescription", "reading")),
        "frame_shape": fake.random_element(elements=("rectangular", "round", "aviator")),
        "frame_material": fake.random_element(elements=("acetate", "metal", "titanium")),
        "lens_type": fake.random_element(elements=("single_vision", "progressive", "non_prescription")),
        "measurements": {
            "lens_width": fake.random_int(min=45, max=60),
            "bridge_width": fake.random_int(min=14, max=22),
            "temple_length": fake.random_int(min=125, max=145),
            "frame_width": fake.random_int(min=115, max=135),
            "frame_height": fake.random_int(min=30, max=45),
            "weight": round(fake.random.uniform(20.0, 35.0), 1)
        },
        "color": fake.color_name(),
        "color_variants": [fake.color_name() for _ in range(fake.random_int(min=1, max=4))],
        "style": fake.random_element(elements=("classic", "modern", "vintage")),
        "gender": fake.random_element(elements=("men", "women", "unisex")),
        "price": round(fake.random.uniform(100.0, 600.0), 2),
        "compare_at_price": round(fake.random.uniform(150.0, 900.0), 2),
        "inventory": fake.random_int(min=0, max=50),
        "images": [fake.image_url() for _ in range(fake.random_int(min=1, max=4))],
        "quality_score": round(fake.random.uniform(0.5, 1.0), 2),
        "active": fake.boolean(chance_of_getting_true=90),
        "created_at": fake.date_time_this_year().isoformat(),
        "updated_at": fake.date_time_this_month().isoformat()
    }


@pytest.fixture
def bulk_test_products():
    """
    Generate bulk product data for performance testing.
    """
    products = []
    for i in range(1000):
        product = {
            "sku": f"BULK-{i:04d}",
            "name": f"Bulk Product {i}",
            "brand_id": ObjectId(),
            "category_id": ObjectId(),
            "price": round(fake.random.uniform(50.0, 300.0), 2),
            "active": True,
            "in_stock": True,
            "inventory_quantity": fake.random_int(min=1, max=20),
            "frame_type": fake.random_element(elements=("prescription", "sunglasses")),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "source": "bulk_test"
        }
        products.append(product)
    return products


@pytest.fixture
def mock_sku_genie_connector():
    """
    Create a mock SKU Genie connector for testing.
    """
    connector = AsyncMock()
    
    # Mock common methods
    connector.getProduct = AsyncMock()
    connector.getProducts = AsyncMock()
    connector.transformToMongoDBSchema = AsyncMock()
    connector.resolveBrandId = AsyncMock(return_value=ObjectId())
    connector.resolveCategoryId = AsyncMock(return_value=ObjectId())
    
    return connector


@pytest.fixture
def mock_sync_service():
    """
    Create a mock sync service for testing.
    """
    service = AsyncMock()
    
    # Mock sync methods
    service.handleSKUGenieWebhook = AsyncMock()
    service.syncProduct = AsyncMock()
    service.syncAllProducts = AsyncMock()
    
    return service


@pytest.fixture
def mock_ai_enhancement_pipeline():
    """
    Create a mock AI enhancement pipeline for testing.
    """
    pipeline = AsyncMock()
    
    # Mock AI methods
    pipeline.enhanceFaceShapeCompatibility = AsyncMock()
    pipeline.generateProductDescription = AsyncMock()
    pipeline.optimizeProductImages = AsyncMock()
    
    return pipeline


@pytest.fixture
def performance_monitor():
    """
    Utility fixture for monitoring test performance.
    """
    class PerformanceMonitor:
        def __init__(self):
            self.start_time = None
            self.end_time = None
        
        def start(self):
            self.start_time = asyncio.get_event_loop().time()
        
        def stop(self):
            self.end_time = asyncio.get_event_loop().time()
        
        @property
        def duration_ms(self):
            if self.start_time and self.end_time:
                return (self.end_time - self.start_time) * 1000
            return None
    
    return PerformanceMonitor()


@pytest.fixture
def security_test_data():
    """
    Generate malicious input data for security testing.
    """
    return {
        "nosql_injection": [
            {"sku": {"$ne": None}},
            {"name": {"$regex": ".*"}},
            {"price": {"$gt": 0}}
        ],
        "xss_attempts": [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>"
        ],
        "sql_injection": [
            "'; DROP TABLE products; --",
            "' OR '1'='1",
            "UNION SELECT * FROM users"
        ],
        "oversized_data": {
            "name": "A" * 10000,  # Very long name
            "description": "B" * 100000,  # Very long description
            "sku": "C" * 1000  # Very long SKU
        }
    }


# Pytest configuration
def pytest_configure(config):
    """
    Configure pytest for the MongoDB Foundation Service tests.
    """
    # Add custom markers
    config.addinivalue_line(
        "markers", "red_phase: mark test as RED phase (should fail initially)"
    )
    config.addinivalue_line(
        "markers", "green_phase: mark test as GREEN phase (implementation complete)"
    )
    config.addinivalue_line(
        "markers", "refactor_phase: mark test as REFACTOR phase (optimization)"
    )
    config.addinivalue_line(
        "markers", "performance: mark test as performance test"
    )
    config.addinivalue_line(
        "markers", "security: mark test as security test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration test"
    )


def pytest_collection_modifyitems(config, items):
    """
    Modify test collection to organize tests by TDD phase.
    """
    for item in items:
        # Mark all red_phase tests
        if "red_phase" in item.nodeid:
            item.add_marker(pytest.mark.red_phase)
        
        # Mark performance tests
        if "performance" in item.nodeid:
            item.add_marker(pytest.mark.performance)
        
        # Mark security tests
        if "security" in item.nodeid:
            item.add_marker(pytest.mark.security)
        
        # Mark integration tests
        if "integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)


@pytest.fixture(autouse=True)
def setup_test_logging(caplog):
    """
    Setup logging for each test.
    """
    caplog.set_level(logging.INFO)
    yield
    # Log test results
    logger.info(f"Test completed with {len(caplog.records)} log entries")