"""
pytest configuration and fixtures for template engine tests

Provides shared fixtures, mocking utilities, and test configuration
for comprehensive template engine testing.
"""

import asyncio
import os
import tempfile
import pytest
from pathlib import Path
from typing import Dict, Any, List
from unittest.mock import Mock, AsyncMock, MagicMock
import json

# Import template engine components
from src.store_generation.template_engine.renderer import TemplateRenderer
from src.store_generation.template_engine.theme_manager import ThemeManager
from src.store_generation.template_engine.asset_handler import AssetHandler
from src.store_generation.template_engine.service import TemplateEngineService
from src.store_generation.template_engine.exceptions import *


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def temp_themes_dir():
    """Create a temporary themes directory for testing."""
    with tempfile.TemporaryDirectory() as temp_dir:
        themes_dir = Path(temp_dir) / "themes"
        themes_dir.mkdir(parents=True, exist_ok=True)
        yield themes_dir


@pytest.fixture
def sample_theme_structure(temp_themes_dir):
    """Create a complete sample theme structure for testing."""
    theme_dir = temp_themes_dir / "modern-minimal"
    theme_dir.mkdir(parents=True, exist_ok=True)
    
    # Create theme.json
    theme_config = {
        "name": "modern-minimal",
        "version": "1.0.0",
        "description": "Test theme for unit testing",
        "author": "Test Author",
        "supports_partials": True,
        "supports_inheritance": True
    }
    (theme_dir / "theme.json").write_text(json.dumps(theme_config, indent=2))
    
    # Create templates directory
    templates_dir = theme_dir / "templates"
    templates_dir.mkdir(exist_ok=True)
    
    # Create partials directory
    partials_dir = templates_dir / "partials"
    partials_dir.mkdir(exist_ok=True)
    
    # Create base template
    base_template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}{{ store_config.store_name }}{% endblock %}</title>
    <meta name="description" content="{% block description %}{{ seo_data.description }}{% endblock %}">
    {% block head_assets %}{% endblock %}
</head>
<body>
    <header class="site-header">
        <h1>{{ store_config.store_name }}</h1>
        <nav>
            {% block navigation %}
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/products">Products</a></li>
            </ul>
            {% endblock %}
        </nav>
    </header>
    
    <main class="main-content">
        {% block content %}{% endblock %}
    </main>
    
    <footer class="site-footer">
        {% block footer %}
        <p>&copy; 2024 {{ store_config.store_name }}. All rights reserved.</p>
        {% endblock %}
    </footer>
    
    {% block scripts %}{% endblock %}
</body>
</html>"""
    (templates_dir / "base.html").write_text(base_template)
    
    # Create store listing template
    store_listing_template = """{% extends "base.html" %}

{% block title %}{{ store_config.store_name }} - Premium Eyewear{% endblock %}

{% block content %}
<div class="store-listing">
    <section class="hero-section">
        <h2>{{ store_config.store_description }}</h2>
    </section>
    
    <section class="products-grid">
        <h3>Our Products ({{ products|length }} items)</h3>
        <div class="product-grid">
            {% for product in products %}
                {% include "partials/product_card.html" %}
            {% endfor %}
        </div>
    </section>
</div>
{% endblock %}

{% block scripts %}
<script>
    console.log('Store listing loaded with {{ products|length }} products');
</script>
{% endblock %}"""
    (templates_dir / "store_listing.html").write_text(store_listing_template)
    
    # Create product page template
    product_page_template = """{% extends "base.html" %}

{% block title %}{{ product.name }} - {{ store_config.store_name }}{% endblock %}

{% block content %}
<div class="product-page">
    <div class="product-gallery">
        {% if product.media.primary_image %}
        <img src="{{ product.media.primary_image }}" alt="{{ product.name }}" class="primary-image">
        {% endif %}
        
        {% if product.media.gallery_images %}
        <div class="gallery-thumbnails">
            {% for image in product.media.gallery_images %}
            <img src="{{ image }}" alt="{{ product.name }}" class="thumbnail">
            {% endfor %}
        </div>
        {% endif %}
    </div>
    
    <div class="product-details">
        <h1>{{ product.name }}</h1>
        <p class="brand">{{ product.brand }}</p>
        <p class="price">${{ "%.2f"|format(product.price) }}</p>
        <p class="description">{{ product.description }}</p>
        
        <div class="product-specs">
            <p><strong>Material:</strong> {{ product.frame_material }}</p>
            <p><strong>Color:</strong> {{ product.color }}</p>
            <p><strong>Style:</strong> {{ product.style }}</p>
        </div>
        
        <div class="face-shape-compatibility">
            <h4>Face Shape Compatibility:</h4>
            <ul>
                {% if product.face_shape_compatibility.oval > 0.7 %}
                <li>Oval: Excellent Match</li>
                {% endif %}
                {% if product.face_shape_compatibility.round > 0.7 %}
                <li>Round: Excellent Match</li>
                {% endif %}
            </ul>
        </div>
        
        {% if product.in_stock %}
        <button class="add-to-cart" data-product-id="{{ product.product_id }}">
            Add to Cart
        </button>
        {% else %}
        <p class="out-of-stock">Out of Stock</p>
        {% endif %}
    </div>
</div>
{% endblock %}"""
    (templates_dir / "product_page.html").write_text(product_page_template)
    
    # Create product card partial
    product_card_partial = """<div class="product-card" data-product-id="{{ product.product_id }}">
    {% if product.media.primary_image %}
    <div class="product-image">
        <img src="{{ product.media.primary_image }}" alt="{{ product.name }}" loading="lazy">
    </div>
    {% endif %}
    
    <div class="product-info">
        <h4 class="product-name">{{ product.name }}</h4>
        <p class="product-brand">{{ product.brand }}</p>
        <p class="product-price">${{ "%.2f"|format(product.price) }}</p>
        
        {% if product.face_shape_compatibility %}
        <div class="compatibility-indicator">
            <span class="compatibility-score">
                Compatibility: {{ (product.face_shape_compatibility.oval * 100)|round }}%
            </span>
        </div>
        {% endif %}
        
        <div class="product-actions">
            <a href="/products/{{ product.product_id }}" class="view-product">View Details</a>
            {% if product.in_stock %}
            <button class="quick-add" data-product-id="{{ product.product_id }}">Quick Add</button>
            {% endif %}
        </div>
    </div>
</div>"""
    (partials_dir / "product_card.html").write_text(product_card_partial)
    
    # Create assets directory
    assets_dir = theme_dir / "assets"
    assets_dir.mkdir(exist_ok=True)
    
    # Create CSS directory and file
    css_dir = assets_dir / "css"
    css_dir.mkdir(exist_ok=True)
    
    main_css = """/* Test Theme Main CSS */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    line-height: 1.6;
}

.site-header {
    background: #333;
    color: white;
    padding: 1rem;
}

.main-content {
    min-height: 70vh;
    padding: 2rem;
}

.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.product-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    transition: transform 0.2s;
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.product-image img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
}

.product-price {
    font-size: 1.2em;
    font-weight: bold;
    color: #2c5aa0;
}

.site-footer {
    background: #f8f9fa;
    padding: 2rem;
    text-align: center;
    margin-top: 3rem;
}"""
    (css_dir / "main.css").write_text(main_css)
    
    # Create JS directory and file
    js_dir = assets_dir / "js"
    js_dir.mkdir(exist_ok=True)
    
    main_js = """// Test Theme Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Quick add to cart functionality
    document.querySelectorAll('.quick-add').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            console.log('Quick add clicked for product:', productId);
            // Simulate add to cart
            this.textContent = 'Added!';
            setTimeout(() => {
                this.textContent = 'Quick Add';
            }, 2000);
        });
    });
    
    // Product card hover effects
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});"""
    (js_dir / "main.js").write_text(main_js)
    
    # Create images directory with placeholder
    images_dir = assets_dir / "images"
    images_dir.mkdir(exist_ok=True)
    
    # Create a simple placeholder image (base64 encoded 1x1 pixel)
    placeholder_img = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    (images_dir / "placeholder.png").write_bytes(
        __import__('base64').b64decode(placeholder_img)
    )
    
    return {
        "theme_dir": theme_dir,
        "theme_name": "modern-minimal",
        "templates_dir": templates_dir,
        "assets_dir": assets_dir,
        "config": theme_config
    }


@pytest.fixture
def mock_cache_manager():
    """Create a mock cache manager for testing."""
    cache_manager = AsyncMock()
    cache_manager.get_cached_template = AsyncMock(return_value=None)
    cache_manager.cache_template = AsyncMock()
    cache_manager.get_cached_asset_optimization = AsyncMock(return_value=None)
    cache_manager.cache_asset_optimization = AsyncMock()
    cache_manager.set = AsyncMock()
    cache_manager.get = AsyncMock(return_value=None)
    cache_manager.invalidate_pattern = AsyncMock()
    cache_manager.health_check = AsyncMock(return_value={"status": "healthy"})
    cache_manager.get_cache_statistics = AsyncMock(return_value={
        "hits": 100,
        "misses": 50,
        "hit_rate": 66.7,
        "total_operations": 150
    })
    cache_manager.close = AsyncMock()
    return cache_manager


@pytest.fixture
def sample_store_config():
    """Create a sample store configuration for testing."""
    from src.store_generation.models import StoreConfiguration, StoreTheme
    
    return StoreConfiguration(
        store_name="Test Eyewear Store",
        store_description="Premium eyewear for testing",
        contact_email="test@example.com",
        theme=StoreTheme.MODERN_MINIMAL,
        site_title="Test Store - Premium Glasses",
        site_description="Test store for comprehensive testing"
    )


@pytest.fixture
def sample_products():
    """Create sample products for testing."""
    from src.store_generation.models import (
        EnhancedProduct, ProductMedia, SEOData, FaceShapeCompatibility
    )
    
    return [
        EnhancedProduct(
            product_id="test_001",
            sku="TEST-001",
            name="Test Aviator Sunglasses",
            description="Classic aviator style for testing",
            brand="TestBrand",
            category="Sunglasses",
            price=99.99,
            in_stock=True,
            inventory_quantity=25,
            frame_type="Sunglasses",
            frame_material="Metal",
            color="Black",
            style="Aviator",
            face_shape_compatibility=FaceShapeCompatibility(
                oval=0.9, round=0.7, square=0.8, heart=0.6, diamond=0.7, oblong=0.8
            ),
            media=ProductMedia(
                primary_image="https://example.com/test-aviator-1.jpg",
                gallery_images=[
                    "https://example.com/test-aviator-2.jpg",
                    "https://example.com/test-aviator-3.jpg"
                ]
            ),
            seo=SEOData(
                title="Test Aviator Sunglasses - TestBrand",
                description="Premium aviator sunglasses for testing",
                keywords=["sunglasses", "aviator", "test"]
            ),
            quality_score=0.95
        ),
        EnhancedProduct(
            product_id="test_002",
            sku="TEST-002",
            name="Test Reading Glasses",
            description="Comfortable reading glasses for testing",
            brand="TestBrand",
            category="Reading Glasses",
            price=49.99,
            in_stock=True,
            inventory_quantity=50,
            frame_type="Reading",
            frame_material="Plastic",
            color="Tortoise",
            style="Rectangular",
            face_shape_compatibility=FaceShapeCompatibility(
                oval=0.8, round=0.9, square=0.7, heart=0.8, diamond=0.6, oblong=0.9
            ),
            media=ProductMedia(
                primary_image="https://example.com/test-reading-1.jpg",
                gallery_images=["https://example.com/test-reading-2.jpg"]
            ),
            seo=SEOData(
                title="Test Reading Glasses - TestBrand",
                description="Comfortable reading glasses for testing",
                keywords=["reading glasses", "prescription", "test"]
            ),
            quality_score=0.88
        )
    ]


@pytest.fixture
def sample_seo_data():
    """Create sample SEO data for testing."""
    from src.store_generation.models import SEOData
    
    return SEOData(
        title="Test Store - Premium Eyewear",
        description="Testing comprehensive eyewear selection",
        keywords=["eyewear", "glasses", "sunglasses", "test"]
    )


@pytest.fixture
def theme_manager(temp_themes_dir):
    """Create a theme manager instance for testing."""
    return ThemeManager(
        themes_directory=str(temp_themes_dir),
        enable_hot_reload=True
    )


@pytest.fixture
def asset_handler(mock_cache_manager):
    """Create an asset handler instance for testing."""
    return AssetHandler(
        cache_manager=mock_cache_manager,
        cdn_base_url="https://cdn.test.com",
        enable_optimization=True,
        max_image_size=1024,
        compression_quality=85
    )


@pytest.fixture
def template_renderer(theme_manager, asset_handler, mock_cache_manager):
    """Create a template renderer instance for testing."""
    return TemplateRenderer(
        theme_manager=theme_manager,
        asset_handler=asset_handler,
        cache_manager=mock_cache_manager,
        render_timeout=10.0,
        enable_auto_escape=True
    )


@pytest.fixture
def template_engine_service(mock_cache_manager, temp_themes_dir):
    """Create a template engine service instance for testing."""
    return TemplateEngineService(
        cache_manager=mock_cache_manager,
        themes_directory=str(temp_themes_dir),
        enable_optimization=True,
        cdn_base_url="https://cdn.test.com",
        render_timeout=10.0
    )


@pytest.fixture
def initialized_template_engine_service(template_engine_service, sample_theme_structure):
    """Create and initialize a template engine service for testing."""
    async def _initialize():
        await template_engine_service.initialize()
        return template_engine_service
    
    return _initialize


# Performance testing fixtures
@pytest.fixture
def performance_test_data():
    """Create large datasets for performance testing."""
    from src.store_generation.models import (
        EnhancedProduct, ProductMedia, FaceShapeCompatibility, SEOData
    )
    
    products = []
    for i in range(100):  # 100 products for performance testing
        product = EnhancedProduct(
            product_id=f"perf_test_{i:03d}",
            sku=f"PERF-{i:03d}",
            name=f"Performance Test Product {i}",
            description=f"Product {i} for performance testing with longer description content",
            brand="PerfTestBrand",
            category="Sunglasses" if i % 2 == 0 else "Reading Glasses",
            price=50.0 + (i * 10.0),
            in_stock=i % 10 != 0,  # 90% in stock
            inventory_quantity=i + 10,
            frame_type="Sunglasses" if i % 2 == 0 else "Reading",
            frame_material="Metal" if i % 3 == 0 else "Plastic",
            color=["Black", "Brown", "Silver", "Gold"][i % 4],
            style=["Aviator", "Rectangular", "Round", "Cat-Eye"][i % 4],
            face_shape_compatibility=FaceShapeCompatibility(
                oval=0.5 + (i % 5) * 0.1,
                round=0.6 + (i % 4) * 0.1,
                square=0.7 + (i % 3) * 0.1,
                heart=0.5 + (i % 6) * 0.08,
                diamond=0.6 + (i % 5) * 0.08,
                oblong=0.8 + (i % 2) * 0.1
            ),
            media=ProductMedia(
                primary_image=f"https://example.com/perf-test-{i}-1.jpg",
                gallery_images=[
                    f"https://example.com/perf-test-{i}-2.jpg",
                    f"https://example.com/perf-test-{i}-3.jpg"
                ]
            ),
            seo=SEOData(
                title=f"Performance Test Product {i} - PerfTestBrand",
                description=f"Product {i} for performance testing with longer description content for SEO optimization",
                keywords=[f"perf-test-{i}", "eyewear", "performance", "testing"],
                structured_data={
                    "@type": "Product",
                    "name": f"Performance Test Product {i}",
                    "brand": "PerfTestBrand"
                },
                open_graph={
                    "og:title": f"Performance Test Product {i}",
                    "og:description": f"Product {i} for performance testing"
                }
            ),
            quality_score=0.7 + (i % 30) * 0.01
        )
        products.append(product)
    
    return products


# Security testing fixtures
@pytest.fixture
def malicious_template_content():
    """Create template content with potential security issues for testing."""
    return {
        "path_traversal": "../../etc/passwd",
        "xss_attempt": "<script>alert('xss')</script>",
        "dangerous_functions": "{{ eval('import os; os.system(\"rm -rf /\")') }}",
        "unsafe_filter": "{{ user_input | safe }}",
        "code_injection": "{% set x = __import__('subprocess').call(['ls', '-la']) %}"
    }


@pytest.fixture
def secure_template_content():
    """Create secure template content for testing."""
    return {
        "safe_variable": "{{ product.name }}",
        "escaped_content": "{{ product.description | e }}",
        "safe_loop": "{% for product in products %}{{ product.name }}{% endfor %}",
        "conditional": "{% if product.in_stock %}Available{% endif %}"
    }


# Mock external dependencies
@pytest.fixture
def mock_jinja_environment():
    """Create a mock Jinja2 environment for testing."""
    env = Mock()
    template = Mock()
    template.render_async = AsyncMock(return_value="<html>Mocked rendered content</html>")
    template.new_context = Mock()
    env.get_template = Mock(return_value=template)
    return env


@pytest.fixture
def mock_file_operations():
    """Mock file system operations for isolated testing."""
    with pytest.MonkeyPatch.context() as m:
        # Mock pathlib.Path operations
        mock_path = Mock()
        mock_path.exists = Mock(return_value=True)
        mock_path.is_dir = Mock(return_value=True)
        mock_path.is_file = Mock(return_value=True)
        mock_path.stat.return_value.st_size = 1024
        mock_path.read_text = Mock(return_value="mocked file content")
        mock_path.write_text = Mock()
        mock_path.mkdir = Mock()
        
        yield mock_path


# Helper functions for tests
def assert_html_structure(html_content: str, expected_elements: List[str]):
    """Assert that HTML content contains expected elements."""
    for element in expected_elements:
        assert element in html_content, f"Expected element '{element}' not found in HTML"


def assert_no_security_issues(html_content: str):
    """Assert that HTML content doesn't contain security vulnerabilities."""
    dangerous_patterns = [
        "<script>",
        "javascript:",
        "eval(",
        "exec(",
        "__import__"
    ]
    
    for pattern in dangerous_patterns:
        assert pattern not in html_content, f"Security issue found: {pattern}"


async def measure_async_performance(async_func, *args, **kwargs):
    """Measure the performance of an async function."""
    import time
    start_time = time.time()
    result = await async_func(*args, **kwargs)
    end_time = time.time()
    return result, end_time - start_time


# Test data generators
def generate_test_context(size: str = "small") -> Dict[str, Any]:
    """Generate test context data of various sizes."""
    if size == "small":
        return {"test_var": "test_value", "count": 5}
    elif size == "medium":
        return {
            "products": [{"id": i, "name": f"Product {i}"} for i in range(50)],
            "metadata": {"total": 50, "page": 1}
        }
    elif size == "large":
        return {
            "products": [
                {
                    "id": i,
                    "name": f"Product {i}",
                    "description": f"Long description for product {i} " * 10,
                    "attributes": {f"attr_{j}": f"value_{j}" for j in range(20)}
                }
                for i in range(1000)
            ],
            "metadata": {"total": 1000, "page": 1},
            "settings": {f"setting_{i}": f"value_{i}" for i in range(100)}
        }
    else:
        return {}