# Sample Implementation: Database Models for Opticians Catalog

This document provides a sample implementation of the first prompt from the Opticians Catalog Project Plan. It demonstrates how to create the SQLAlchemy database models for the Opticians Catalog feature.

## Prompt 1: Create Database Models for Opticians Catalog

```python
"""SQLAlchemy models for the Opticians Catalog feature."""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, 
    Integer, Float, JSON, Table, Text, Date
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

from src.api.database import Base

def generate_uuid():
    """Generate a UUID for primary keys."""
    return str(uuid.uuid4())

class OpticiansStore(Base):
    """Optician store model for the database."""
    __tablename__ = "opticians_stores"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    client_id = Column(String, ForeignKey("clients.id"), nullable=False)
    store_name = Column(String, nullable=False)
    store_description = Column(Text)
    logo_url = Column(String)
    primary_color = Column(String, default="#4A90E2")
    secondary_color = Column(String, default="#F5F5F5")
    contact_email = Column(String)
    contact_phone = Column(String)
    address = Column(String)
    custom_domain = Column(String, unique=True)
    subdomain = Column(String, unique=True, nullable=False)
    
    # Theme customization
    theme_template = Column(String, default="default")
    custom_css = Column(Text)
    custom_header = Column(Text)
    custom_footer = Column(Text)
    featured_products = Column(JSON, default=list)
    homepage_sections = Column(JSON, default=list)
    navigation_menu = Column(JSON, default=list)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="opticians_stores")
    products = relationship("OpticiansProduct", back_populates="store", cascade="all, delete-orphan")
    requests = relationship("ProductRequest", back_populates="store", cascade="all, delete-orphan")
    form_templates = relationship("RequestFormTemplate", back_populates="store", cascade="all, delete-orphan")
    page_customizations = relationship("StorePageCustomization", back_populates="store", cascade="all, delete-orphan")
    analytics = relationship("CatalogAnalytics", back_populates="store", cascade="all, delete-orphan")

class OpticiansProduct(Base):
    """Optician product model for the database."""
    __tablename__ = "opticians_products"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    store_id = Column(String, ForeignKey("opticians_stores.id"), nullable=False)
    frame_id = Column(String, nullable=False)  # Reference to frame in master database
    
    # Store-specific product details
    price = Column(Float)
    stock = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    custom_description = Column(Text)
    custom_attributes = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    store = relationship("OpticiansStore", back_populates="products")
    requests = relationship("ProductRequest", back_populates="product", cascade="all, delete-orphan")

class ProductRequest(Base):
    """Product request model for the database."""
    __tablename__ = "product_requests"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    store_id = Column(String, ForeignKey("opticians_stores.id"), nullable=False)
    product_id = Column(String, ForeignKey("opticians_products.id"), nullable=False)
    
    # Customer information
    customer_name = Column(String, nullable=False)
    customer_email = Column(String, nullable=False)
    customer_phone = Column(String)
    
    # Request details
    status = Column(String, default="pending")  # pending, processing, completed, cancelled
    notes = Column(Text)
    prescription_data = Column(JSON, default=dict)
    appointment_preference = Column(String)
    custom_fields = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    store = relationship("OpticiansStore", back_populates="requests")
    product = relationship("OpticiansProduct", back_populates="requests")

class RequestFormTemplate(Base):
    """Request form template model for the database."""
    __tablename__ = "request_form_templates"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    store_id = Column(String, ForeignKey("opticians_stores.id"), nullable=False)
    name = Column(String, nullable=False)
    fields = Column(JSON, nullable=False)
    is_default = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    store = relationship("OpticiansStore", back_populates="form_templates")

class StorePageCustomization(Base):
    """Store page customization model for the database."""
    __tablename__ = "store_page_customizations"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    store_id = Column(String, ForeignKey("opticians_stores.id"), nullable=False)
    page_type = Column(String, nullable=False)  # home, about, contact, etc.
    content = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    store = relationship("OpticiansStore", back_populates="page_customizations")

class CatalogAnalytics(Base):
    """Catalog analytics model for the database."""
    __tablename__ = "catalog_analytics"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    store_id = Column(String, ForeignKey("opticians_stores.id"), nullable=False)
    date = Column(Date, nullable=False)
    
    # Analytics data
    page_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    product_views = Column(JSON, default=dict)  # {product_id: view_count}
    search_terms = Column(JSON, default=list)
    requests_submitted = Column(Integer, default=0)
    recommendation_clicks = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    store = relationship("OpticiansStore", back_populates="analytics")
```

## Implementation Notes

1. **Model Structure**:
   - All models follow the existing pattern in `src/api/models/db_models.py`
   - Primary keys use UUID generation for consistency with existing models
   - Timestamps (created_at, updated_at) are included for all models
   - JSON columns are used for flexible data structures

2. **Relationships**:
   - Bidirectional relationships are established between related models
   - Cascade delete is configured for child records
   - Foreign keys ensure data integrity

3. **Default Values**:
   - Sensible defaults are provided where appropriate
   - Boolean flags default to True for active status
   - Empty collections default to appropriate empty values (list, dict)

4. **Integration Points**:
   - The `client_id` in OpticiansStore links to the existing Client model
   - The `frame_id` in OpticiansProduct references frames in the master database

5. **Next Steps**:
   - Update the Client model to include the reverse relationship:
     ```python
     # Add to the existing Client model
     opticians_stores = relationship("OpticiansStore", back_populates="client", cascade="all, delete-orphan")
     ```
   - Create database migrations (Prompt 2)
   - Create Pydantic models for API schemas (Prompt 3)
