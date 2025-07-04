"""
MongoDB test configuration and fixtures.

This module provides MongoDB-specific test fixtures for schema validation,
data integrity, and performance testing.
"""
import os
import pytest
import pytest_asyncio
import asyncio
import uuid
from datetime import datetime, timedelta
from typing import AsyncGenerator, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

# Set MongoDB test environment variables
if "MONGODB_TEST_URL" not in os.environ:
    os.environ["MONGODB_TEST_URL"] = "mongodb://localhost:27017/eyewear_ml_test"
if "MONGODB_TEST_DATABASE" not in os.environ:
    os.environ["MONGODB_TEST_DATABASE"] = "eyewear_ml_test"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for MongoDB tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="session")
async def mongodb_client() -> AsyncGenerator[AsyncIOMotorClient, None]:
    """
    Create a MongoDB client for testing.
    
    This fixture provides a MongoDB client that connects to the test database.
    It's scoped to the session to avoid connecting and disconnecting for each test.
    
    Yields:
        AsyncIOMotorClient: A connected MongoDB client instance
    """
    client = AsyncIOMotorClient(os.environ["MONGODB_TEST_URL"])
    
    # Test the connection
    try:
        await client.admin.command('ping')
        print(f"Connected to MongoDB test database: {os.environ['MONGODB_TEST_URL']}")
    except Exception as e:
        pytest.skip(f"MongoDB not available: {e}")
    
    yield client
    
    # Cleanup: drop test database
    await client.drop_database(os.environ["MONGODB_TEST_DATABASE"])
    client.close()


@pytest_asyncio.fixture(scope="session")
async def mongodb_database(mongodb_client: AsyncIOMotorClient) -> AsyncIOMotorDatabase:
    """
    Get the test database instance.
    
    Args:
        mongodb_client: The MongoDB client fixture
        
    Returns:
        AsyncIOMotorDatabase: The test database instance
    """
    return mongodb_client[os.environ["MONGODB_TEST_DATABASE"]]


@pytest_asyncio.fixture(scope="function")
async def clean_collections(mongodb_database: AsyncIOMotorDatabase) -> AsyncGenerator[None, None]:
    """
    Provide clean collections for each test.
    
    This fixture ensures that each test starts with clean collections.
    It yields control to the test, then cleans up any data created during the test.
    
    Args:
        mongodb_database: The MongoDB database fixture
        
    Yields:
        None
    """
    # Test runs here
    yield
    
    # Clean up after the test
    collections_to_clean = [
        "products", "brands", "categories", 
        "face_shape_compatibility", "user_analytics"
    ]
    
    for collection_name in collections_to_clean:
        try:
            await mongodb_database[collection_name].delete_many({})
        except Exception:
            pass  # Collection might not exist


@pytest_asyncio.fixture
async def products_collection(mongodb_database: AsyncIOMotorDatabase, clean_collections):
    """
    Get the products collection with schema validation.
    
    Args:
        mongodb_database: The MongoDB database fixture
        clean_collections: Clean collections fixture
        
    Returns:
        Collection: The products collection with validation
    """
    # Create collection with validation schema
    try:
        await mongodb_database.create_collection(
            "products",
            validator={
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": ["product_id", "name", "brand_id", "metadata"],
                    "properties": {
                        "product_id": {"bsonType": "string"},
                        "name": {"bsonType": "string"},
                        "brand_id": {"bsonType": "objectId"},
                        "sku": {"bsonType": "string"},
                        "price": {
                            "bsonType": "object",
                            "properties": {
                                "base_price": {"bsonType": "number", "minimum": 0},
                                "currency": {"bsonType": "string"}
                            }
                        },
                        "face_shape_compatibility": {
                            "bsonType": "object",
                            "properties": {
                                "oval": {
                                    "bsonType": "object",
                                    "properties": {
                                        "score": {"bsonType": "number", "minimum": 0, "maximum": 1},
                                        "confidence": {"bsonType": "number", "minimum": 0, "maximum": 1}
                                    }
                                }
                            }
                        },
                        "metadata": {
                            "bsonType": "object",
                            "required": ["created_at", "updated_at", "status"],
                            "properties": {
                                "created_at": {"bsonType": "date"},
                                "updated_at": {"bsonType": "date"},
                                "status": {"enum": ["active", "inactive", "draft", "archived"]}
                            }
                        }
                    }
                }
            }
        )
    except Exception:
        pass  # Collection might already exist
    
    return mongodb_database.products


@pytest_asyncio.fixture
async def brands_collection(mongodb_database: AsyncIOMotorDatabase, clean_collections):
    """
    Get the brands collection with schema validation.
    
    Args:
        mongodb_database: The MongoDB database fixture
        clean_collections: Clean collections fixture
        
    Returns:
        Collection: The brands collection with validation
    """
    try:
        await mongodb_database.create_collection(
            "brands",
            validator={
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": ["brand_id", "name", "metadata"],
                    "properties": {
                        "brand_id": {"bsonType": "string"},
                        "name": {"bsonType": "string"},
                        "metadata": {
                            "bsonType": "object",
                            "required": ["created_at", "updated_at", "status"],
                            "properties": {
                                "created_at": {"bsonType": "date"},
                                "updated_at": {"bsonType": "date"},
                                "status": {"enum": ["active", "inactive"]}
                            }
                        }
                    }
                }
            }
        )
    except Exception:
        pass
    
    return mongodb_database.brands


@pytest_asyncio.fixture
async def categories_collection(mongodb_database: AsyncIOMotorDatabase, clean_collections):
    """Get the categories collection with schema validation."""
    try:
        await mongodb_database.create_collection(
            "categories",
            validator={
                "$jsonSchema": {
                    "bsonType": "object",
                    "required": ["category_id", "name", "level", "metadata"],
                    "properties": {
                        "category_id": {"bsonType": "string"},
                        "name": {"bsonType": "string"},
                        "level": {"bsonType": "number", "minimum": 0},
                        "parent_id": {"bsonType": ["objectId", "null"]},
                        "path": {"bsonType": "array", "items": {"bsonType": "objectId"}},
                        "metadata": {
                            "bsonType": "object",
                            "required": ["created_at", "updated_at", "status"],
                            "properties": {
                                "created_at": {"bsonType": "date"},
                                "updated_at": {"bsonType": "date"},
                                "status": {"enum": ["active", "inactive"]}
                            }
                        }
                    }
                }
            }
        )
    except Exception:
        pass
    
    return mongodb_database.categories


@pytest.fixture
def sample_product_data() -> Dict[str, Any]:
    """
    Generate sample product data for testing.
    
    Returns:
        Dict[str, Any]: Sample product document
    """
    from bson import ObjectId
    
    return {
        "product_id": str(uuid.uuid4()),
        "name": "Test Eyewear Frame",
        "brand_id": ObjectId(),
        "sku": f"TEST-{uuid.uuid4().hex[:8].upper()}",
        "upc": "123456789012",
        "description": "A high-quality test eyewear frame",
        "short_description": "Test frame",
        "price": {
            "base_price": 99.99,
            "currency": "USD",
            "discounted_price": 79.99
        },
        "specifications": {
            "frame": {
                "material": "acetate",
                "color": "black",
                "shape": "round",
                "style": "full-rim",
                "width": 140,
                "height": 45,
                "weight": 25.5
            },
            "lens": {
                "material": "polycarbonate",
                "color": "clear",
                "width": 52,
                "height": 42,
                "prescription_ready": True,
                "uv_protection": "UV400"
            },
            "measurements": {
                "eye_size": 52,
                "bridge_size": 18,
                "temple_length": 140,
                "frame_width": 140,
                "frame_height": 45
            }
        },
        "face_shape_compatibility": {
            "oval": {"score": 0.85, "confidence": 0.92, "reasons": ["Well-balanced proportions"]},
            "round": {"score": 0.75, "confidence": 0.88, "reasons": ["Angular frame complements curves"]},
            "square": {"score": 0.65, "confidence": 0.85, "reasons": ["Softens angular features"]},
            "heart": {"score": 0.70, "confidence": 0.87, "reasons": ["Balances forehead width"]},
            "diamond": {"score": 0.72, "confidence": 0.89, "reasons": ["Emphasizes cheekbones"]},
            "oblong": {"score": 0.68, "confidence": 0.86, "reasons": ["Adds width to narrow face"]}
        },
        "attributes": {
            "gender": "unisex",
            "age_group": "adult",
            "style_category": "fashion",
            "prescription_compatible": True
        },
        "quality": {
            "data_quality_score": 0.95,
            "completeness_score": 0.98,
            "last_quality_check": datetime.utcnow()
        },
        "analytics": {
            "views": 0,
            "clicks": 0,
            "conversions": 0,
            "rating": {"average": 0.0, "count": 0},
            "recommendation_score": 0.8,
            "popularity_score": 0.6
        },
        "metadata": {
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "active",
            "version": 1
        }
    }


@pytest.fixture
def sample_brand_data() -> Dict[str, Any]:
    """Generate sample brand data for testing."""
    return {
        "brand_id": str(uuid.uuid4()),
        "name": "Test Brand",
        "display_name": "Test Brand Inc.",
        "slug": "test-brand",
        "description": "A premium test eyewear brand",
        "country_of_origin": "USA",
        "established_year": 2020,
        "attributes": {
            "price_range": "mid-range",
            "target_market": ["fashion", "professional"],
            "specialties": ["prescription", "sunglasses"]
        },
        "metrics": {
            "product_count": 0,
            "average_rating": 0.0,
            "total_reviews": 0,
            "popularity_score": 0.5
        },
        "metadata": {
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "active",
            "featured": False
        }
    }


@pytest.fixture
def sample_category_data() -> Dict[str, Any]:
    """Generate sample category data for testing."""
    return {
        "category_id": str(uuid.uuid4()),
        "name": "Test Category",
        "display_name": "Test Category",
        "slug": "test-category",
        "parent_id": None,
        "level": 0,
        "path": [],
        "children_count": 0,
        "description": "A test product category",
        "attributes": {
            "type": "product_type",
            "filter_type": "single_select",
            "display_order": 1,
            "visible": True,
            "filterable": True
        },
        "metrics": {
            "product_count": 0,
            "view_count": 0,
            "conversion_rate": 0.0
        },
        "metadata": {
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "status": "active",
            "featured": False
        }
    }


@pytest_asyncio.fixture
async def sample_products_bulk(products_collection, sample_product_data) -> List[Dict[str, Any]]:
    """
    Create bulk sample products for performance testing.
    
    Args:
        products_collection: Products collection fixture
        sample_product_data: Sample product data fixture
        
    Returns:
        List[Dict[str, Any]]: List of inserted product documents
    """
    products = []
    for i in range(100):  # Create 100 sample products
        product = sample_product_data.copy()
        product["product_id"] = str(uuid.uuid4())
        product["name"] = f"Test Product {i+1}"
        product["sku"] = f"TEST-{i+1:04d}"
        product["analytics"]["popularity_score"] = 0.1 + (i * 0.009)  # Varying popularity
        products.append(product)
    
    # Insert all products
    result = await products_collection.insert_many(products)
    
    # Return products with inserted IDs
    for i, product in enumerate(products):
        product["_id"] = result.inserted_ids[i]
    
    return products


@pytest.fixture
def performance_timer():
    """Timer fixture for performance testing."""
    import time
    
    class Timer:
        def __init__(self):
            self.start_time = None
            self.end_time = None
        
        def start(self):
            self.start_time = time.perf_counter()
        
        def stop(self):
            self.end_time = time.perf_counter()
            return self.elapsed()
        
        def elapsed(self):
            if self.start_time is None:
                return 0
            end = self.end_time or time.perf_counter()
            return (end - self.start_time) * 1000  # Return milliseconds
    
    return Timer()