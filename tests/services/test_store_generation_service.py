"""
Comprehensive tests for Store Generation Service.

Tests cover:
- Store configuration validation
- Template generation
- Asset generation
- SEO optimization
- Performance and error handling
- Multi-tenant functionality
"""

import pytest
import asyncio
import json
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock

from src.services.store_generation_service import (
    StoreGenerationService,
    StoreConfiguration,
    ProductCatalogConfig,
    StoreFeatures,
    StoreType,
    ThemeStyle,
    TemplateEngine,
    SEOOptimizer,
    create_store_generation_service
)


class TestStoreConfiguration:
    """Test store configuration data structure."""
    
    def test_store_configuration_creation(self):
        """Test basic store configuration creation."""
        config = StoreConfiguration(
            store_id="test-store",
            store_name="Test Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL
        )
        
        assert config.store_id == "test-store"
        assert config.store_name == "Test Store"
        assert config.store_type == StoreType.BASIC
        assert config.theme_style == ThemeStyle.MODERN_MINIMAL
        assert config.primary_color == "#000000"
        assert config.ssl_enabled is True
    
    def test_store_configuration_with_custom_colors(self):
        """Test store configuration with custom colors."""
        config = StoreConfiguration(
            store_id="custom-store",
            store_name="Custom Store",
            store_type=StoreType.PREMIUM,
            theme_style=ThemeStyle.BOLD_CONTEMPORARY,
            primary_color="#FF5722",
            secondary_color="#FFFFFF",
            accent_color="#4CAF50"
        )
        
        assert config.primary_color == "#FF5722"
        assert config.secondary_color == "#FFFFFF"
        assert config.accent_color == "#4CAF50"
    
    def test_store_configuration_with_seo(self):
        """Test store configuration with SEO settings."""
        config = StoreConfiguration(
            store_id="seo-store",
            store_name="SEO Optimized Store",
            store_type=StoreType.ENTERPRISE,
            theme_style=ThemeStyle.PROFESSIONAL,
            seo_title="Premium Eyewear Store",
            seo_description="Best eyewear collection online",
            seo_keywords=["eyewear", "glasses", "sunglasses"]
        )
        
        assert config.seo_title == "Premium Eyewear Store"
        assert config.seo_description == "Best eyewear collection online"
        assert "eyewear" in config.seo_keywords


class TestProductCatalogConfig:
    """Test product catalog configuration."""
    
    def test_product_catalog_defaults(self):
        """Test default product catalog configuration."""
        catalog = ProductCatalogConfig()
        
        assert catalog.featured_products == []
        assert catalog.auto_recommendations is True
        assert catalog.search_enabled is True
        assert "price_low_to_high" in catalog.sorting_options
    
    def test_product_catalog_with_settings(self):
        """Test product catalog with custom settings."""
        catalog = ProductCatalogConfig(
            featured_products=["product1", "product2"],
            categories=["sunglasses", "eyeglasses"],
            brands=["Ray-Ban", "Oakley"],
            face_shape_focus=["oval", "round"]
        )
        
        assert len(catalog.featured_products) == 2
        assert "sunglasses" in catalog.categories
        assert "Ray-Ban" in catalog.brands
        assert "oval" in catalog.face_shape_focus


class TestStoreFeatures:
    """Test store features configuration."""
    
    def test_store_features_defaults(self):
        """Test default store features."""
        features = StoreFeatures()
        
        assert features.virtual_try_on is True
        assert features.ai_recommendations is True
        assert features.face_shape_analysis is True
        assert features.loyalty_program is False
        assert features.multi_language is False
    
    def test_store_features_enterprise(self):
        """Test enterprise store features."""
        features = StoreFeatures(
            virtual_try_on=True,
            ai_recommendations=True,
            face_shape_analysis=True,
            loyalty_program=True,
            multi_language=True,
            currency_conversion=True
        )
        
        assert features.loyalty_program is True
        assert features.multi_language is True
        assert features.currency_conversion is True


class TestTemplateEngine:
    """Test template generation engine."""
    
    def setup_method(self):
        """Setup for template engine tests."""
        self.template_engine = TemplateEngine("test_themes")
    
    def test_template_engine_initialization(self):
        """Test template engine initialization."""
        assert self.template_engine.templates_path.name == "test_themes"
        assert self.template_engine.cache is not None
    
    @patch('pathlib.Path.exists')
    @patch('builtins.open')
    def test_load_template_success(self, mock_open, mock_exists):
        """Test successful template loading."""
        mock_exists.return_value = True
        mock_open.return_value.__enter__.return_value.read.return_value = "<html>Test Template</html>"
        
        result = self.template_engine.load_template(ThemeStyle.MODERN_MINIMAL, "base")
        
        assert result == "<html>Test Template</html>"
        mock_open.assert_called_once()
    
    @patch('pathlib.Path.exists')
    def test_load_template_not_found(self, mock_exists):
        """Test template loading when file doesn't exist."""
        mock_exists.return_value = False
        
        result = self.template_engine.load_template(ThemeStyle.MODERN_MINIMAL, "nonexistent")
        
        assert result is None
    
    def test_render_template_basic(self):
        """Test basic template rendering."""
        template = "<h1>{store_name}</h1><p>{description}</p>"
        context = {
            "store_name": "Test Store",
            "description": "A test store"
        }
        
        result = self.template_engine.render_template(template, context)
        
        assert result == "<h1>Test Store</h1><p>A test store</p>"
    
    def test_render_template_with_complex_data(self):
        """Test template rendering with complex data."""
        template = "<div data-config='{config}'>{title}</div>"
        context = {
            "title": "Complex Template",
            "config": {"option1": "value1", "option2": "value2"}
        }
        
        result = self.template_engine.render_template(template, context)
        
        assert "Complex Template" in result
        assert '"option1": "value1"' in result
    
    def test_generate_css(self):
        """Test CSS generation."""
        config = StoreConfiguration(
            store_id="css-test",
            store_name="CSS Test Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL,
            primary_color="#FF5722",
            secondary_color="#FFFFFF",
            accent_color="#4CAF50"
        )
        
        css = self.template_engine.generate_css(config)
        
        assert "--primary-color: #FF5722" in css
        assert "--secondary-color: #FFFFFF" in css
        assert "--accent-color: #4CAF50" in css
        assert ".store-header" in css
    
    def test_generate_css_with_custom_css(self):
        """Test CSS generation with custom CSS."""
        config = StoreConfiguration(
            store_id="custom-css-test",
            store_name="Custom CSS Test",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL,
            custom_css=".custom-class { color: red; }"
        )
        
        css = self.template_engine.generate_css(config)
        
        assert "/* Custom CSS */" in css
        assert ".custom-class { color: red; }" in css


class TestSEOOptimizer:
    """Test SEO optimization engine."""
    
    def setup_method(self):
        """Setup for SEO optimizer tests."""
        self.seo_optimizer = SEOOptimizer()
    
    def test_generate_meta_tags_basic(self):
        """Test basic meta tags generation."""
        config = StoreConfiguration(
            store_id="seo-test",
            store_name="SEO Test Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL
        )
        
        meta_tags = self.seo_optimizer.generate_meta_tags(config)
        
        assert "title" in meta_tags
        assert "description" in meta_tags
        assert "keywords" in meta_tags
        assert "SEO Test Store" in meta_tags["title"]
    
    def test_generate_meta_tags_with_custom_seo(self):
        """Test meta tags generation with custom SEO."""
        config = StoreConfiguration(
            store_id="custom-seo-test",
            store_name="Custom SEO Store",
            store_type=StoreType.PREMIUM,
            theme_style=ThemeStyle.PROFESSIONAL,
            seo_title="Custom SEO Title",
            seo_description="Custom SEO Description",
            seo_keywords=["custom", "seo", "keywords"],
            logo_url="https://example.com/logo.png"
        )
        
        meta_tags = self.seo_optimizer.generate_meta_tags(config)
        
        assert meta_tags["title"] == "Custom SEO Title"
        assert meta_tags["description"] == "Custom SEO Description"
        assert meta_tags["keywords"] == "custom, seo, keywords"
        assert meta_tags["og:image"] == "https://example.com/logo.png"
    
    def test_generate_structured_data(self):
        """Test structured data generation."""
        config = StoreConfiguration(
            store_id="structured-data-test",
            store_name="Structured Data Store",
            store_type=StoreType.ENTERPRISE,
            theme_style=ThemeStyle.MODERN_MINIMAL,
            seo_description="A store for structured data testing",
            custom_domain="example.com",
            social_media={"facebook": "https://facebook.com/store"}
        )
        
        structured_data = self.seo_optimizer.generate_structured_data(config)
        
        assert structured_data["@context"] == "https://schema.org"
        assert structured_data["@type"] == "Store"
        assert structured_data["name"] == "Structured Data Store"
        assert "https://facebook.com/store" in structured_data["sameAs"]


class TestStoreGenerationService:
    """Test store generation service."""
    
    def setup_method(self):
        """Setup for store generation service tests."""
        self.service = StoreGenerationService("mongodb://localhost:27017/test")
    
    @pytest.mark.asyncio
    async def test_validate_configuration_valid(self):
        """Test configuration validation with valid data."""
        config = StoreConfiguration(
            store_id="valid-store",
            store_name="Valid Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL,
            primary_color="#FF5722",
            secondary_color="#FFFFFF",
            accent_color="#4CAF50",
            logo_url="https://example.com/logo.png",
            custom_domain="valid-store.com"
        )
        
        errors = await self.service._validate_configuration(config)
        
        assert len(errors) == 0
    
    @pytest.mark.asyncio
    async def test_validate_configuration_invalid_store_id(self):
        """Test configuration validation with invalid store ID."""
        config = StoreConfiguration(
            store_id="ab",  # Too short
            store_name="Test Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL
        )
        
        errors = await self.service._validate_configuration(config)
        
        assert len(errors) > 0
        assert any("Store ID must be at least 3 characters" in error for error in errors)
    
    @pytest.mark.asyncio
    async def test_validate_configuration_invalid_colors(self):
        """Test configuration validation with invalid colors."""
        config = StoreConfiguration(
            store_id="color-test",
            store_name="Color Test Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL,
            primary_color="invalid-color",  # Invalid hex color
            secondary_color="#GGGGGG",      # Invalid hex digits
            accent_color="#12345"           # Too short
        )
        
        errors = await self.service._validate_configuration(config)
        
        assert len(errors) >= 3  # Should have errors for all three invalid colors
    
    @pytest.mark.asyncio
    async def test_validate_configuration_invalid_urls(self):
        """Test configuration validation with invalid URLs."""
        config = StoreConfiguration(
            store_id="url-test",
            store_name="URL Test Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL,
            logo_url="invalid-url",
            custom_domain="invalid domain with spaces"
        )
        
        errors = await self.service._validate_configuration(config)
        
        assert len(errors) >= 2
        assert any("Logo URL must be a valid HTTP/HTTPS URL" in error for error in errors)
        assert any("Custom domain must be a valid domain name" in error for error in errors)
    
    @pytest.mark.asyncio
    @patch.object(StoreGenerationService, '_generate_templates')
    @patch.object(StoreGenerationService, '_generate_assets')
    @patch.object(StoreGenerationService, '_generate_configuration_files')
    @patch.object(StoreGenerationService, '_setup_database_collections')
    @patch.object(StoreGenerationService, '_generate_seo_assets')
    @patch.object(StoreGenerationService, '_save_store_configuration')
    async def test_generate_store_success(self, mock_save_config, mock_seo, mock_db, 
                                         mock_config_files, mock_assets, mock_templates):
        """Test successful store generation."""
        # Mock all async methods
        mock_templates.return_value = ["template1.html", "template2.html"]
        mock_assets.return_value = ["style.css", "script.js"]
        mock_config_files.return_value = ["config.json"]
        mock_db.return_value = True
        mock_seo.return_value = ["sitemap.xml", "robots.txt"]
        mock_save_config.return_value = None
        
        config = StoreConfiguration(
            store_id="success-test",
            store_name="Success Test Store",
            store_type=StoreType.PREMIUM,
            theme_style=ThemeStyle.MODERN_MINIMAL
        )
        
        result = await self.service.generate_store(config)
        
        assert result.success is True
        assert result.store_id == "success-test"
        assert "https://success-test.eyewear.com" in result.store_url
        assert len(result.template_files) == 2
        assert len(result.asset_files) == 2
        assert len(result.errors) == 0
    
    @pytest.mark.asyncio
    async def test_generate_store_invalid_config(self):
        """Test store generation with invalid configuration."""
        config = StoreConfiguration(
            store_id="a",  # Invalid: too short
            store_name="",  # Invalid: empty
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL
        )
        
        result = await self.service.generate_store(config)
        
        assert result.success is False
        assert len(result.errors) > 0
    
    @pytest.mark.asyncio
    @patch.object(StoreGenerationService, '_generate_templates')
    async def test_generate_store_template_error(self, mock_templates):
        """Test store generation with template generation error."""
        mock_templates.side_effect = Exception("Template generation failed")
        
        config = StoreConfiguration(
            store_id="template-error-test",
            store_name="Template Error Test",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL
        )
        
        result = await self.service.generate_store(config)
        
        assert result.success is False
        assert len(result.errors) > 0
    
    @pytest.mark.asyncio
    async def test_generate_templates(self):
        """Test template generation."""
        config = StoreConfiguration(
            store_id="template-test",
            store_name="Template Test Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL
        )
        
        catalog_config = ProductCatalogConfig()
        features = StoreFeatures()
        
        with patch.object(self.service.template_engine, 'load_template') as mock_load:
            mock_load.return_value = "<html>{store_name}</html>"
            
            files = await self.service._generate_templates(config, catalog_config, features)
            
            assert len(files) > 0
            assert all(f"stores/{config.store_id}/templates/" in file for file in files)
    
    @pytest.mark.asyncio
    async def test_generate_assets(self):
        """Test asset generation."""
        config = StoreConfiguration(
            store_id="asset-test",
            store_name="Asset Test Store",
            store_type=StoreType.BASIC,
            theme_style=ThemeStyle.MODERN_MINIMAL
        )
        
        files = await self.service._generate_assets(config)
        
        assert len(files) >= 2  # CSS and JS files
        assert any("custom.css" in file for file in files)
        assert any("store-config.js" in file for file in files)
    
    @pytest.mark.asyncio
    async def test_get_store_status(self):
        """Test getting store status."""
        store_id = "status-test"
        
        status = await self.service.get_store_status(store_id)
        
        assert status["store_id"] == store_id
        assert "status" in status
        assert "performance_metrics" in status
        assert "analytics" in status
    
    @pytest.mark.asyncio
    async def test_get_store_status_cached(self):
        """Test getting cached store status."""
        store_id = "cached-status-test"
        
        # First call to populate cache
        status1 = await self.service.get_store_status(store_id)
        
        # Second call should use cache
        status2 = await self.service.get_store_status(store_id)
        
        assert status1 == status2
    
    @pytest.mark.asyncio
    async def test_update_store_configuration(self):
        """Test updating store configuration."""
        store_id = "update-test"
        updates = {
            "store_name": "Updated Store Name",
            "primary_color": "#FF0000"
        }
        
        result = await self.service.update_store_configuration(store_id, updates)
        
        assert result is True
    
    @pytest.mark.asyncio
    async def test_update_store_configuration_invalid_id(self):
        """Test updating store configuration with invalid ID."""
        store_id = "'; DROP TABLE stores; --"  # SQL injection attempt
        updates = {"store_name": "Updated Name"}
        
        result = await self.service.update_store_configuration(store_id, updates)
        
        assert result is False
    
    @pytest.mark.asyncio
    async def test_delete_store(self):
        """Test store deletion."""
        store_id = "delete-test"
        
        result = await self.service.delete_store(store_id)
        
        assert result is True
    
    @pytest.mark.asyncio
    async def test_delete_store_invalid_id(self):
        """Test store deletion with invalid ID."""
        store_id = "'; DROP TABLE stores; --"  # SQL injection attempt
        
        result = await self.service.delete_store(store_id)
        
        assert result is False


class TestServiceFactory:
    """Test service factory function."""
    
    def test_create_store_generation_service_default(self):
        """Test creating service with default connection string."""
        service = create_store_generation_service()
        
        assert isinstance(service, StoreGenerationService)
        assert service.mongodb_client is not None
    
    def test_create_store_generation_service_custom(self):
        """Test creating service with custom connection string."""
        connection_string = "mongodb://custom:27017/custom_db"
        service = create_store_generation_service(connection_string)
        
        assert isinstance(service, StoreGenerationService)


class TestPerformanceAndStress:
    """Test performance and stress scenarios."""
    
    def setup_method(self):
        """Setup for performance tests."""
        self.service = StoreGenerationService("mongodb://localhost:27017/test")
    
    @pytest.mark.asyncio
    async def test_concurrent_store_generation(self):
        """Test concurrent store generation."""
        configs = []
        for i in range(5):
            config = StoreConfiguration(
                store_id=f"concurrent-test-{i}",
                store_name=f"Concurrent Test Store {i}",
                store_type=StoreType.BASIC,
                theme_style=ThemeStyle.MODERN_MINIMAL
            )
            configs.append(config)
        
        # Mock the slow operations to avoid actual file I/O
        with patch.object(self.service, '_generate_templates') as mock_templates, \
             patch.object(self.service, '_generate_assets') as mock_assets, \
             patch.object(self.service, '_generate_configuration_files') as mock_config, \
             patch.object(self.service, '_setup_database_collections') as mock_db, \
             patch.object(self.service, '_generate_seo_assets') as mock_seo, \
             patch.object(self.service, '_save_store_configuration') as mock_save:
            
            mock_templates.return_value = ["template.html"]
            mock_assets.return_value = ["style.css"]
            mock_config.return_value = ["config.json"]
            mock_db.return_value = True
            mock_seo.return_value = ["sitemap.xml"]
            mock_save.return_value = None
            
            tasks = [self.service.generate_store(config) for config in configs]
            results = await asyncio.gather(*tasks)
            
            assert len(results) == 5
            assert all(result.success for result in results)
    
    @pytest.mark.asyncio
    async def test_large_configuration_handling(self):
        """Test handling of large configuration data."""
        config = StoreConfiguration(
            store_id="large-config-test",
            store_name="Large Configuration Test Store",
            store_type=StoreType.ENTERPRISE,
            theme_style=ThemeStyle.MODERN_MINIMAL,
            seo_keywords=["keyword"] * 100,  # Large keyword list
            custom_css="/* Large CSS */ " + "a { color: red; } " * 1000  # Large CSS
        )
        
        catalog_config = ProductCatalogConfig(
            featured_products=[f"product_{i}" for i in range(100)],  # Large product list
            categories=[f"category_{i}" for i in range(50)]  # Large category list
        )
        
        # Validate that large configurations don't cause errors
        errors = await self.service._validate_configuration(config)
        
        # Should not fail due to size
        assert len(errors) == 0


class TestErrorHandling:
    """Test error handling scenarios."""
    
    def setup_method(self):
        """Setup for error handling tests."""
        self.service = StoreGenerationService("mongodb://localhost:27017/test")
    
    @pytest.mark.asyncio
    async def test_database_connection_error(self):
        """Test handling of database connection errors."""
        # This test assumes the database is not available
        status = await self.service.get_store_status("error-test")
        
        # Should not crash, should return error status
        assert "store_id" in status
    
    @pytest.mark.asyncio
    async def test_template_loading_error(self):
        """Test handling of template loading errors."""
        with patch.object(self.service.template_engine, 'load_template') as mock_load:
            mock_load.side_effect = Exception("Template loading failed")
            
            config = StoreConfiguration(
                store_id="template-error-test",
                store_name="Template Error Test",
                store_type=StoreType.BASIC,
                theme_style=ThemeStyle.MODERN_MINIMAL
            )
            
            # Should handle template loading errors gracefully
            with pytest.raises(Exception):
                await self.service._generate_templates(config, ProductCatalogConfig(), StoreFeatures())


if __name__ == "__main__":
    pytest.main([__file__, "-v"])