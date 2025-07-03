"""
Schema definitions for the EyewearML platform.

This file defines the expected data structures for the business logic endpoints.
These schemas serve as a contract for future implementation and are used by the
test suite to validate endpoint responses once implemented.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


# Product Catalog Schemas

class ProductBrand(BaseModel):
    """Product brand information."""
    id: str
    name: str
    logo_url: Optional[str] = None
    website: Optional[str] = None


class ProductImage(BaseModel):
    """Product image information."""
    id: str
    url: str
    alt_text: Optional[str] = None
    primary: bool = False
    thumbnail_url: Optional[str] = None


class ProductPrice(BaseModel):
    """Product price information."""
    base_price: float
    currency: str = "USD"
    discount_price: Optional[float] = None
    discount_percent: Optional[int] = None
    on_sale: bool = False


class ProductCategory(str, Enum):
    """Product category enum."""
    EYEGLASSES = "eyeglasses"
    SUNGLASSES = "sunglasses"
    CONTACTS = "contacts"
    ACCESSORIES = "accessories"


class ProductSchema(BaseModel):
    """Basic product information schema."""
    id: str
    name: str
    category: ProductCategory
    brand: ProductBrand
    price: ProductPrice
    thumbnail_url: Optional[str] = None
    average_rating: Optional[float] = None
    total_reviews: Optional[int] = None


class ProductDetailSchema(ProductSchema):
    """Detailed product information schema."""
    description: str
    features: List[str]
    specifications: Dict[str, Any]
    images: List[ProductImage]
    variants: Optional[List["ProductDetailSchema"]] = None
    related_products: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    suitable_face_shapes: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime


class ProductSearchResultSchema(BaseModel):
    """Product search results schema."""
    products: List[ProductSchema]
    total: int
    page: int
    page_size: int
    query: str


# Face Shape Analysis Schemas

class FaceShape(str, Enum):
    """Face shape classification enum."""
    OVAL = "oval"
    ROUND = "round"
    SQUARE = "square"
    HEART = "heart"
    DIAMOND = "diamond"
    OBLONG = "oblong"
    TRIANGLE = "triangle"


class FaceShapeAnalysisRequest(BaseModel):
    """Face shape analysis request schema."""
    image_url: str
    return_visualization: Optional[bool] = False


class FaceMeasurements(BaseModel):
    """Facial measurements schema."""
    face_width: float
    face_height: float
    jaw_width: float
    forehead_width: float
    cheekbone_width: float


class FaceShapeAnalysisResultSchema(BaseModel):
    """Face shape analysis result schema."""
    face_shape: FaceShape
    confidence: float
    measurements: Optional[FaceMeasurements] = None
    visualization_url: Optional[str] = None
    alternative_shapes: Optional[List[Dict[str, float]]] = None


class ImageUploadResultSchema(BaseModel):
    """Image upload result schema."""
    image_id: str
    url: str
    filename: str
    size: int
    mime_type: str
    created_at: datetime


# Recommendation Engine Schemas

class RecommendationReason(BaseModel):
    """Reason for product recommendation."""
    type: str
    description: str


class ProductRecommendationSchema(BaseModel):
    """Product recommendation schema."""
    product_id: str
    product: ProductSchema
    score: float
    reasons: List[RecommendationReason]
    position: int


# Virtual Try-On Schemas

class VirtualTryOnRequest(BaseModel):
    """Virtual try-on request schema."""
    face_image_url: str
    product_id: str
    options: Optional[Dict[str, Any]] = None


class VirtualTryOnStatus(str, Enum):
    """Virtual try-on job status enum."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class VirtualTryOnResultSchema(BaseModel):
    """Virtual try-on result schema."""
    job_id: str
    status: VirtualTryOnStatus
    result_image_url: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    error: Optional[str] = None


class VirtualTryOnStatusSchema(BaseModel):
    """Virtual try-on job status schema."""
    job_id: str
    status: VirtualTryOnStatus
    progress: Optional[float] = None
    result_url: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime
    updated_at: datetime