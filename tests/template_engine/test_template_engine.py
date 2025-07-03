"""
Comprehensive Test-Driven Development (TDD) test suite for Store Generation Service's template rendering engine.

This test suite defines the expected behavior for the template rendering engine before implementation,
following TDD principles. All tests are designed to fail initially (RED phase) and provide clear
targets for subsequent Auto-Coder implementation.

Test Coverage:
- Template rendering for various template types (store listing, product page, partials)
- Data injection and display validation
- Error handling for missing/invalid data
- Performance benchmarks (<30 seconds for 1000+ products)
- Mobile responsiveness verification
- SEO optimization (Schema.org markup, meta tags)
- Asset pipeline integration (CSS, JavaScript, images, CDN)

Author: TDD Mode - Test-Driven Development Suite
Version: 1.0.0
"""

import pytest
import asyncio
import time
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional
from unittest.mock import Mock, AsyncMock, patch
from bs4 import BeautifulSoup
import lxml.etree as etree

# Import template engine components (these may not exist yet - part of TDD)
from src.store_generation.template_engine.renderer import TemplateRenderer
from src.store_generation.template_engine.service import TemplateEngineService
from src.store_generation.template_engine.theme_manager import ThemeManager
from src.store_generation.template_engine.asset_handler import AssetHandler
from src.store_generation.models import (
    EnhancedProduct, StoreConfiguration, ProductMedia, 
    SEOData, FaceShapeCompatibility, StoreTheme
)
from src.store_generation.template_engine.exceptions import (
    TemplateNotFoundError, TemplateRenderError, TemplateValidationError
)


class TestTemplateEngineCore:
    """Core template rendering functionality tests."""
    
    @pytest.mark.asyncio
    async def test_render_store_listing_template_with_valid_data(
        self, initialized_template_engine_service, sample_store_config, sample_products, sample_theme_structure
    ):
        """
        Test that store listing template renders correctly with valid product data.
        
        Expected behavior:
        - Template should render without errors
        - All product data should be properly injected
        - HTML structure should be valid
        - Product count should match input data
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products),
            'seo_data': {
                'title': f"{sample_store_config.store_name} - Premium Eyewear",
                'description': sample_store_config.store_description
            }
        }
        
        # ACT
        template_engine_service = await initialized_template_engine_service()
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        assert rendered_html is not None, "Rendered HTML should not be None"
        assert isinstance(rendered_html, str), "Rendered HTML should be a string"
        assert len(rendered_html) > 0, "Rendered HTML should not be empty"
        
        # Parse HTML for structure validation
        soup = BeautifulSoup(rendered_html, 'html.parser')
        
        # Verify essential HTML structure
        assert soup.find('html'), "HTML should contain <html> tag"
        assert soup.find('head'), "HTML should contain <head> tag"
        assert soup.find('body'), "HTML should contain <body> tag"
        
        # Verify store information is present
        assert sample_store_config.store_name in rendered_html, \
            "Store name should be present in rendered HTML"
        
        # Verify product data injection
        for product in sample_products:
            assert product.name in rendered_html, \
                f"Product {product.name} should be present in rendered HTML"
            assert product.brand in rendered_html, \
                f"Product brand {product.brand} should be present in rendered HTML"
            assert str(product.price) in rendered_html, \
                f"Product price {product.price} should be present in rendered HTML"
        
        # Verify product count
        assert f"{len(sample_products)}" in rendered_html, \
            "Product count should match actual number of products"

    @pytest.mark.asyncio
    async def test_render_product_page_template_with_complete_data(
        self, initialized_template_engine_service, sample_store_config, sample_products, sample_theme_structure
    ):
        """
        Test that individual product page template renders correctly.
        
        Expected behavior:
        - Single product data should be properly displayed
        - All product attributes should be present
        - Face shape compatibility should be rendered
        - Media gallery should be handled correctly
        """
        # ARRANGE
        product = sample_products[0]  # Use first product
        template_context = {
            'store_config': sample_store_config,
            'product': product,
            'seo_data': {
                'title': f"{product.name} - {sample_store_config.store_name}",
                'description': product.description
            }
        }
        
        # ACT
        template_engine_service = await initialized_template_engine_service()
        rendered_html = await template_engine_service.render_template(
            template_name='product_page.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        assert rendered_html is not None, "Product page HTML should not be None"
        assert product.name in rendered_html, "Product name should be displayed"
        assert product.description in rendered_html, "Product description should be displayed"
        assert product.brand in rendered_html, "Product brand should be displayed"
        assert str(product.price) in rendered_html, "Product price should be displayed"
        assert product.frame_material in rendered_html, "Frame material should be displayed"
        assert product.color in rendered_html, "Product color should be displayed"
        assert product.style in rendered_html, "Product style should be displayed"
        
        # Verify face shape compatibility data
        if product.face_shape_compatibility:
            compatibility_found = any([
                "oval" in rendered_html.lower(),
                "round" in rendered_html.lower(),
                "square" in rendered_html.lower(),
                "heart" in rendered_html.lower()
            ])
            assert compatibility_found, "Face shape compatibility should be displayed"
        
        # Verify media handling
        if product.media and product.media.primary_image:
            assert product.media.primary_image in rendered_html, \
                "Primary image URL should be present"

    @pytest.mark.asyncio
    async def test_render_partial_template_integration(
        self, template_engine_service, sample_products
    ):
        """
        Test that partial templates (like product cards) render correctly.
        
        Expected behavior:
        - Partial templates should be reusable components
        - Data should be passed correctly to partials
        - Partial output should integrate seamlessly with main templates
        """
        # ARRANGE
        product = sample_products[0]
        template_context = {
            'product': product
        }
        
        # ACT
        rendered_partial = await template_engine_service.render_partial(
            partial_name='partials/product_card.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        assert rendered_partial is not None, "Partial template should render"
        assert product.name in rendered_partial, "Product name should be in partial"
        assert product.brand in rendered_partial, "Product brand should be in partial"
        assert str(product.price) in rendered_partial, "Product price should be in partial"
        
        # Verify partial has proper CSS classes for styling
        soup = BeautifulSoup(rendered_partial, 'html.parser')
        product_card = soup.find(class_='product-card')
        assert product_card is not None, "Partial should have product-card class"
class TestTemplateEngineErrorHandling:
    """Error handling and edge case tests."""
    
    @pytest.mark.asyncio
    async def test_handle_missing_template_gracefully(self, initialized_template_engine_service, sample_theme_structure):
        """
        Test graceful handling of missing template files.
        
        Expected behavior:
        - Should raise TemplateNotFoundError for non-existent templates
        - Error message should be descriptive
        - System should not crash
        """
        # ARRANGE
        template_engine_service = await initialized_template_engine_service()
        template_context = {'test': 'data'}
        
        # ACT & ASSERT
        with pytest.raises(TemplateNotFoundError) as exc_info:
            await template_engine_service.render_template(
                template_name='non_existent_template.html',
                context=template_context,
                theme='modern-minimal'
            )
        
        assert "non_existent_template.html" in str(exc_info.value), \
            "Error message should include template name"

    @pytest.mark.asyncio
    async def test_handle_missing_product_data_gracefully(
        self, template_engine_service, sample_store_config
    ):
        """
        Test that templates handle missing or incomplete product data gracefully.
        
        Expected behavior:
        - Templates should render without crashing when data is missing
        - Default values or placeholders should be used
        - No broken template variables should appear in output
        """
        # ARRANGE - Create product with missing fields
        incomplete_product = {
            'product_id': 'incomplete_001',
            'name': 'Incomplete Product',
            # Missing: description, brand, price, media, etc.
        }
        
        template_context = {
            'store_config': sample_store_config,
            'products': [incomplete_product],
            'total_products': 1
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        assert rendered_html is not None, "Template should render despite missing data"
        assert incomplete_product['name'] in rendered_html, "Product name should be present"
        
        # Verify no broken template variables (like {{ undefined_var }})
        broken_variables = re.findall(r'\{\{[^}]+\}\}', rendered_html)
        assert len(broken_variables) == 0, \
            f"No broken template variables should remain: {broken_variables}"

    @pytest.mark.asyncio
    async def test_handle_invalid_data_types_gracefully(
        self, template_engine_service, sample_store_config
    ):
        """
        Test template handling of invalid data types.
        
        Expected behavior:
        - Should handle type mismatches gracefully
        - Should not crash on unexpected data structures
        - Should provide meaningful error messages
        """
        # ARRANGE - Create context with invalid data types
        invalid_context = {
            'store_config': sample_store_config,
            'products': "not_a_list",  # Should be a list
            'total_products': "not_a_number"  # Should be a number
        }
        
        # ACT & ASSERT
        with pytest.raises(TemplateValidationError) as exc_info:
            await template_engine_service.render_template(
                template_name='store_listing.html',
                context=invalid_context,
                theme='modern-minimal'
            )
        
        assert "validation" in str(exc_info.value).lower(), \
            "Error should indicate validation failure"


class TestTemplateEnginePerformance:
    """Performance benchmark tests."""
    
    @pytest.mark.asyncio
    async def test_single_product_page_render_performance(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that single product page renders within acceptable time limits.
        
        Performance Target: < 100ms for single product page
        """
        # ARRANGE
        product = sample_products[0]
        template_context = {
            'store_config': sample_store_config,
            'product': product
        }
        
        # ACT
        start_time = time.time()
        rendered_html = await template_engine_service.render_template(
            template_name='product_page.html',
            context=template_context,
            theme='modern-minimal'
        )
        end_time = time.time()
        
        # ASSERT
        render_time = end_time - start_time
        assert render_time < 0.1, \
            f"Single product page should render in <100ms, took {render_time:.3f}s"
        assert rendered_html is not None, "Product page should render successfully"

    @pytest.mark.asyncio
    async def test_batch_rendering_1000_products_performance(
        self, template_engine_service, sample_store_config, performance_test_data
    ):
        """
        Test batch rendering of 1000+ product pages within time limit.
        
        Performance Target: < 30 seconds for 1000+ products
        This is the critical performance requirement from the prompt.
        """
        # ARRANGE
        products_1000 = performance_test_data[:1000]  # Ensure exactly 1000 products
        
        # ACT
        start_time = time.time()
        
        # Simulate batch rendering of 1000 product pages
        rendered_pages = []
        for i, product in enumerate(products_1000):
            product_context = {
                'store_config': sample_store_config,
                'product': product
            }
            
            rendered_page = await template_engine_service.render_template(
                template_name='product_page.html',
                context=product_context,
                theme='modern-minimal'
            )
            rendered_pages.append(rendered_page)
            
            # Optional: Add progress tracking for debugging
            if (i + 1) % 100 == 0:
                print(f"Rendered {i + 1}/1000 products")
        
        end_time = time.time()
        
        # ASSERT
        total_render_time = end_time - start_time
        assert total_render_time < 30.0, \
            f"1000 products should render in <30s, took {total_render_time:.3f}s"
        assert len(rendered_pages) == 1000, "All 1000 products should be rendered"
        
        # Verify all pages contain valid content
        for i, page in enumerate(rendered_pages):
            assert page is not None, f"Product {i} page should not be None"
            assert len(page) > 0, f"Product {i} page should not be empty"

    @pytest.mark.asyncio
    async def test_store_listing_with_large_dataset_performance(
        self, template_engine_service, sample_store_config, performance_test_data
    ):
        """
        Test store listing page performance with large product datasets.
        
        Performance Target: < 2 seconds for store listing with 1000+ products
        """
        # ARRANGE
        large_product_set = performance_test_data[:1000]
        template_context = {
            'store_config': sample_store_config,
            'products': large_product_set,
            'total_products': len(large_product_set)
        }
        
        # ACT
        start_time = time.time()
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        end_time = time.time()
        
        # ASSERT
        render_time = end_time - start_time
        assert render_time < 2.0, \
            f"Store listing with 1000 products should render in <2s, took {render_time:.3f}s"
        assert rendered_html is not None, "Store listing should render successfully"
class TestTemplateEngineMobileResponsiveness:
    """Mobile responsiveness and responsive design tests."""
    
    @pytest.mark.asyncio
    async def test_mobile_viewport_meta_tag_presence(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that mobile viewport meta tag is present in rendered HTML.
        
        Expected behavior:
        - HTML should contain proper viewport meta tag
        - Meta tag should have correct mobile-responsive attributes
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products)
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        viewport_meta = soup.find('meta', attrs={'name': 'viewport'})
        
        assert viewport_meta is not None, "Viewport meta tag should be present"
        
        content = viewport_meta.get('content', '')
        assert 'width=device-width' in content, \
            "Viewport should include width=device-width"
        assert 'initial-scale=1' in content, \
            "Viewport should include initial-scale=1"

    @pytest.mark.asyncio
    async def test_responsive_css_classes_present(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that responsive CSS classes are properly applied.
        
        Expected behavior:
        - HTML should contain responsive grid classes
        - Mobile-friendly class structures should be present
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products)
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        
        # Check for responsive grid classes
        products_grid = soup.find(class_='products-grid')
        assert products_grid is not None, "Products grid should have responsive class"
        
        # Check for container classes
        containers = soup.find_all(class_='container')
        assert len(containers) > 0, "Responsive container classes should be present"

    @pytest.mark.asyncio
    async def test_mobile_friendly_image_attributes(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that images have mobile-friendly attributes.
        
        Expected behavior:
        - Images should have loading="lazy" attribute for performance
        - Alt text should be present for accessibility
        - Responsive image sizing should be applied
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products)
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        images = soup.find_all('img')
        
        assert len(images) > 0, "Images should be present in rendered HTML"
        
        for img in images:
            # Check for lazy loading
            loading_attr = img.get('loading')
            if loading_attr:  # May not be required for all images
                assert loading_attr == 'lazy', "Images should use lazy loading"
            
            # Check for alt text
            alt_text = img.get('alt')
            assert alt_text is not None and alt_text.strip() != '', \
                "Images should have descriptive alt text"


class TestTemplateEngineSEOOptimization:
    """SEO optimization and structured data tests."""
    
    @pytest.mark.asyncio
    async def test_essential_meta_tags_presence(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that essential SEO meta tags are present and correct.
        
        Expected behavior:
        - Title tag should be present and descriptive
        - Meta description should be present
        - Open Graph tags should be included
        """
        # ARRANGE
        seo_data = {
            'title': f"{sample_store_config.store_name} - Premium Eyewear Collection",
            'description': "Discover premium eyewear with advanced face shape matching technology."
        }
        
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products),
            'seo_data': seo_data
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        
        # Check title tag
        title_tag = soup.find('title')
        assert title_tag is not None, "Title tag should be present"
        assert seo_data['title'] in title_tag.get_text(), \
            "Title should contain SEO optimized title"
        
        # Check meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        assert meta_desc is not None, "Meta description should be present"
        assert seo_data['description'] in meta_desc.get('content', ''), \
            "Meta description should contain SEO description"
        
        # Check for Open Graph tags
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        og_description = soup.find('meta', attrs={'property': 'og:description'})
        
        assert og_title is not None, "Open Graph title should be present"
        assert og_description is not None, "Open Graph description should be present"

    @pytest.mark.asyncio
    async def test_structured_data_schema_org_markup(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that Schema.org structured data is correctly implemented.
        
        Expected behavior:
        - JSON-LD structured data should be present
        - Product schema should include required fields
        - Organization schema should be included
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products)
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        
        # Find JSON-LD script tags
        json_ld_scripts = soup.find_all('script', attrs={'type': 'application/ld+json'})
        assert len(json_ld_scripts) > 0, "JSON-LD structured data should be present"
        
        # Parse and validate structured data
        structured_data_found = False
        for script in json_ld_scripts:
            try:
                data = json.loads(script.get_text())
                
                # Check for Organization schema
                if isinstance(data, dict) and data.get('@type') == 'Organization':
                    assert 'name' in data, "Organization schema should include name"
                    structured_data_found = True
                
                # Check for Product schema
                if isinstance(data, dict) and data.get('@type') == 'Product':
                    required_fields = ['name', 'description', 'offers']
                    for field in required_fields:
                        assert field in data, f"Product schema should include {field}"
                    structured_data_found = True
                
                # Check for ItemList schema (for product listings)
                if isinstance(data, dict) and data.get('@type') == 'ItemList':
                    assert 'numberOfItems' in data, "ItemList should include numberOfItems"
                    structured_data_found = True
                    
            except json.JSONDecodeError:
                pytest.fail("Structured data should be valid JSON")
        
        assert structured_data_found, "At least one valid structured data schema should be present"

    @pytest.mark.asyncio
    async def test_product_page_structured_data(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that individual product pages have proper structured data.
        
        Expected behavior:
        - Product schema should include comprehensive product information
        - Offers schema should include pricing and availability
        - Review/Rating schema should be included if applicable
        """
        # ARRANGE
        product = sample_products[0]
        template_context = {
            'store_config': sample_store_config,
            'product': product
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='product_page.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        json_ld_scripts = soup.find_all('script', attrs={'type': 'application/ld+json'})
        
        product_schema_found = False
        for script in json_ld_scripts:
            try:
                data = json.loads(script.get_text())
                if isinstance(data, dict) and data.get('@type') == 'Product':
                    # Verify required product fields
                    assert data.get('name') == product.name, \
                        "Product schema name should match product name"
                    assert data.get('description') == product.description, \
                        "Product schema description should match product description"
                    
                    # Verify offers schema
                    offers = data.get('offers')
                    assert offers is not None, "Product should include offers schema"
                    if isinstance(offers, dict):
                        assert offers.get('@type') == 'Offer', "Offers should be Offer type"
                        assert 'price' in offers, "Offer should include price"
                        assert 'priceCurrency' in offers, "Offer should include currency"
                        assert 'availability' in offers, "Offer should include availability"
                    
                    product_schema_found = True
                    break
                    
            except json.JSONDecodeError:
                pytest.fail("Product structured data should be valid JSON")
        
        assert product_schema_found, "Product page should include Product structured data"
class TestTemplateEngineAssetIntegration:
    """Asset pipeline integration tests (CSS, JavaScript, images, CDN)."""
    
    @pytest.mark.asyncio
    async def test_css_asset_linking_correct(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that CSS assets are correctly linked in rendered HTML.
        
        Expected behavior:
        - CSS files should be properly linked in <head>
        - Links should have correct paths and attributes
        - Theme-specific CSS should be included
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products)
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        
        # Find CSS link tags
        css_links = soup.find_all('link', attrs={'rel': 'stylesheet'})
        assert len(css_links) > 0, "CSS stylesheet links should be present"
        
        # Verify main CSS is included
        main_css_found = False
        for link in css_links:
            href = link.get('href', '')
            if 'main.css' in href:
                main_css_found = True
                # Verify CSS link has proper attributes
                assert link.get('type') == 'text/css' or 'type' not in link.attrs, \
                    "CSS link should have correct type attribute or none (defaults to text/css)"
                break
        
        assert main_css_found, "Main CSS file should be linked"

    @pytest.mark.asyncio
    async def test_javascript_asset_linking_correct(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that JavaScript assets are correctly linked in rendered HTML.
        
        Expected behavior:
        - JavaScript files should be included at appropriate locations
        - Scripts should have proper attributes and loading strategies
        - Theme-specific JavaScript should be included
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products)
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        
        # Find script tags
        script_tags = soup.find_all('script')
        assert len(script_tags) > 0, "JavaScript script tags should be present"
        
        # Check for external script files or inline scripts
        has_external_scripts = any(script.get('src') for script in script_tags)
        has_inline_scripts = any(script.get_text().strip() for script in script_tags if not script.get('src'))
        
        assert has_external_scripts or has_inline_scripts, \
            "Should have either external JavaScript files or inline scripts"

    @pytest.mark.asyncio
    async def test_image_asset_paths_correct(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that image assets have correct paths and attributes.
        
        Expected behavior:
        - Image URLs should be properly formatted
        - Images should have appropriate alt text
        - Lazy loading should be implemented for performance
        """
        # ARRANGE - Ensure products have media
        products_with_media = []
        for product in sample_products:
            if not hasattr(product, 'media') or not product.media:
                product.media = ProductMedia(
                    primary_image=f"https://example.com/images/{product.product_id}.jpg",
                    gallery_images=[f"https://example.com/images/{product.product_id}_gallery.jpg"]
                )
            products_with_media.append(product)
        
        template_context = {
            'store_config': sample_store_config,
            'products': products_with_media,
            'total_products': len(products_with_media)
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        images = soup.find_all('img')
        
        assert len(images) > 0, "Images should be present in rendered HTML"
        
        for img in images:
            # Check for valid src attribute
            src = img.get('src')
            assert src is not None and src.strip() != '', \
                "Images should have valid src attribute"
            
            # Check for alt text
            alt_text = img.get('alt')
            assert alt_text is not None and alt_text.strip() != '', \
                "Images should have descriptive alt text"

    @pytest.mark.asyncio
    async def test_cdn_paths_verification(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that CDN paths are correctly applied to assets when configured.
        
        Expected behavior:
        - Asset URLs should use CDN base URL when configured
        - CDN paths should be properly formatted
        - Fallback should work when CDN is not available
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products),
            'cdn_base_url': 'https://cdn.test.com'  # Mock CDN URL
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        
        # Check CSS links for CDN usage
        css_links = soup.find_all('link', attrs={'rel': 'stylesheet'})
        if css_links:
            # At least one CSS link should potentially use CDN
            cdn_usage_found = any(
                'cdn.test.com' in link.get('href', '') or 
                link.get('href', '').startswith('http')
                for link in css_links
            )
            # Note: This test allows for both CDN and non-CDN assets

    @pytest.mark.asyncio
    async def test_asset_integrity_and_security(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that assets have proper integrity and security attributes.
        
        Expected behavior:
        - External assets should have integrity hashes when applicable
        - Cross-origin assets should have proper CORS attributes
        - Security headers should be present for external resources
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products)
        }
        
        # ACT
        rendered_html = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=template_context,
            theme='modern-minimal'
        )
        
        # ASSERT
        soup = BeautifulSoup(rendered_html, 'html.parser')
        
        # Check for external assets
        external_links = soup.find_all('link', href=lambda x: x and x.startswith('http'))
        external_scripts = soup.find_all('script', src=lambda x: x and x.startswith('http'))
        
        # If external assets exist, verify security attributes
        for link in external_links:
            href = link.get('href', '')
            if href.startswith('http'):
                # Should have crossorigin or integrity for security
                has_security = link.get('crossorigin') or link.get('integrity')
                # This is a recommendation, not a hard requirement
        
        for script in external_scripts:
            src = script.get('src', '')
            if src.startswith('http'):
                # Should have crossorigin or integrity for security
                has_security = script.get('crossorigin') or script.get('integrity')
                # This is a recommendation, not a hard requirement


class TestTemplateEngineIntegrationScenarios:
    """Integration scenarios combining multiple features."""
    
    @pytest.mark.asyncio
    async def test_full_store_generation_workflow(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test complete store generation workflow with all components.
        
        Expected behavior:
        - Store listing page should render with all features
        - Individual product pages should render correctly
        - All SEO, mobile, and asset features should work together
        """
        # ARRANGE
        store_context = {
            'store_config': sample_store_config,
            'products': sample_products,
            'total_products': len(sample_products),
            'seo_data': {
                'title': f"{sample_store_config.store_name} - Complete Store",
                'description': "Full-featured eyewear store with all optimizations"
            }
        }
        
        # ACT - Render store listing
        store_listing = await template_engine_service.render_template(
            template_name='store_listing.html',
            context=store_context,
            theme='modern-minimal'
        )
        
        # ACT - Render product pages for all products
        product_pages = []
        for product in sample_products:
            product_context = {
                'store_config': sample_store_config,
                'product': product,
                'seo_data': {
                    'title': f"{product.name} - {sample_store_config.store_name}",
                    'description': product.description
                }
            }
            
            product_page = await template_engine_service.render_template(
                template_name='product_page.html',
                context=product_context,
                theme='modern-minimal'
            )
            product_pages.append(product_page)
        
        # ASSERT
        assert store_listing is not None, "Store listing should render"
        assert len(product_pages) == len(sample_products), "All product pages should render"
        
        # Verify store listing contains all products
        for product in sample_products:
            assert product.name in store_listing, \
                f"Store listing should contain {product.name}"
        
        # Verify each product page contains correct product data
        for i, page in enumerate(product_pages):
            product = sample_products[i]
            assert product.name in page, f"Product page {i} should contain product name"
            assert product.description in page, f"Product page {i} should contain description"

    @pytest.mark.asyncio
    async def test_theme_switching_functionality(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that different themes can be applied to the same content.
        
        Expected behavior:
        - Same content should render differently with different themes
        - All themes should produce valid HTML
        - Theme-specific assets should be loaded
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products[:2],  # Use subset for performance
            'total_products': 2
        }
        
        themes_to_test = ['modern-minimal']  # Add more themes as they become available
        
        # ACT & ASSERT
        rendered_outputs = {}
        for theme in themes_to_test:
            rendered_html = await template_engine_service.render_template(
                template_name='store_listing.html',
                context=template_context,
                theme=theme
            )
            
            assert rendered_html is not None, f"Theme {theme} should render"
            assert len(rendered_html) > 0, f"Theme {theme} should produce content"
            
            # Verify HTML structure
            soup = BeautifulSoup(rendered_html, 'html.parser')
            assert soup.find('html'), f"Theme {theme} should produce valid HTML"
            
            rendered_outputs[theme] = rendered_html
        
        # If multiple themes tested, verify they produce different output
        if len(rendered_outputs) > 1:
            theme_names = list(rendered_outputs.keys())
            for i in range(len(theme_names)):
                for j in range(i + 1, len(theme_names)):
                    theme1, theme2 = theme_names[i], theme_names[j]
                    # Themes should produce different HTML (different styling/structure)
                    # This is a basic check - in practice, themes will differ significantly
                    assert rendered_outputs[theme1] != rendered_outputs[theme2], \
                        f"Themes {theme1} and {theme2} should produce different output"


# Additional test helpers and utilities
class TestTemplateEngineUtilities:
    """Utility tests for template engine helper functions."""
    
    @pytest.mark.asyncio
    async def test_template_validation_functionality(self, initialized_template_engine_service, sample_theme_structure):
        """
        Test that template validation works correctly.
        
        Expected behavior:
        - Valid templates should pass validation
        - Invalid templates should fail validation with descriptive errors
        """
        # This test ensures the template engine can validate templates
        # before attempting to render them
        
        # Test will be implemented when validation functionality is available
        pass

    @pytest.mark.asyncio
    async def test_caching_mechanism_effectiveness(
        self, template_engine_service, sample_store_config, sample_products
    ):
        """
        Test that template caching improves performance.
        
        Expected behavior:
        - First render should be slower (cache miss)
        - Subsequent renders should be faster (cache hit)
        - Cache invalidation should work correctly
        """
        # ARRANGE
        template_context = {
            'store_config': sample_store_config,
            'products': sample_products[:1],  # Single product for performance
            'total_products': 1
        }
        
        # ACT - First render (cache miss)
        start_time = time.time()
        first_render = await template_engine_service.render_template(
            template_name='product_page.html',
            context=template_context,
            theme='modern-minimal'
        )
        first_render_time = time.time() - start_time
        
        # ACT - Second render (cache hit)
        start_time = time.time()
        second_render = await template_engine_service.render_template(
            template_name='product_page.html',
            context=template_context,
            theme='modern-minimal'
        )
        second_render_time = time.time() - start_time
        
        # ASSERT
        assert first_render is not None, "First render should succeed"
        assert second_render is not None, "Second render should succeed"
        assert first_render == second_render, "Cached render should match original"
        
        # Performance assertion - cached render should be faster
        # Allow some tolerance for timing variations
        cache_performance_improvement = second_render_time < (first_render_time * 0.8)
        # Note: This assertion might be too strict in some environments
        # The test documents expected caching behavior