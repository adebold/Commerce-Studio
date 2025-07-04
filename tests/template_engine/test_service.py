"""
Unit tests for TemplateEngineService

Comprehensive test suite covering:
- Service initialization and configuration
- Template rendering orchestration
- Component integration
- Error handling and recovery
- Performance monitoring
- Health checks
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from pathlib import Path
import json

from src.store_generation.template_engine.service import TemplateEngineService
from src.store_generation.template_engine.exceptions import (
    TemplateEngineError,
    TemplateNotFoundError,
    TemplateRenderError
)


class TestTemplateEngineService:
    """Test cases for TemplateEngineService class."""
    
    def test_service_initialization(self, mock_cache_manager, temp_themes_dir):
        """Test template engine service initialization."""
        service = TemplateEngineService(
            cache_manager=mock_cache_manager,
            themes_directory=str(temp_themes_dir),
            enable_optimization=True,
            cdn_base_url="https://cdn.test.com",
            render_timeout=30.0,
            max_template_size=2048*1024
        )
        
        assert service.cache_manager == mock_cache_manager
        assert service.themes_directory == str(temp_themes_dir)
        assert service.enable_optimization is True
        assert service.cdn_base_url == "https://cdn.test.com"
        assert service.render_timeout == 30.0
        assert service.max_template_size == 2048*1024
        
        # Components should not be initialized yet
        assert service.theme_manager is None
        assert service.asset_handler is None
        assert service.renderer is None
        assert service._initialized is False
    
    @pytest.mark.asyncio
    async def test_service_initialization_async(self, template_engine_service):
        """Test async service initialization."""
        await template_engine_service.initialize()
        
        assert template_engine_service._initialized is True
        assert template_engine_service.theme_manager is not None
        assert template_engine_service.asset_handler is not None
        assert template_engine_service.renderer is not None
        
        # Check component relationships
        assert template_engine_service.renderer.theme_manager == template_engine_service.theme_manager
        assert template_engine_service.renderer.asset_handler == template_engine_service.asset_handler
    
    @pytest.mark.asyncio
    async def test_service_double_initialization(self, template_engine_service):
        """Test that double initialization doesn't cause issues."""
        await template_engine_service.initialize()
        
        # Initialize again
        await template_engine_service.initialize()
        
        # Should still be properly initialized
        assert template_engine_service._initialized is True
        assert template_engine_service.theme_manager is not None
    
    @pytest.mark.asyncio
    async def test_render_store_page_success(self, initialized_template_engine_service, sample_store_config, sample_products, sample_seo_data):
        """Test successful store page rendering."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            mock_render.return_value = "<html>Rendered store page</html>"
            
            result = await service.render_store_page(
                store_config=sample_store_config,
                products=sample_products,
                seo_data=sample_seo_data,
                page_type="store_listing"
            )
            
            assert result == "<html>Rendered store page</html>"
            
            # Verify the call was made (products will have been processed for assets)
            mock_render.assert_called_once()
            call_args, call_kwargs = mock_render.call_args
            
            # Check the key arguments match what we expect
            # Store config should be converted to dict format for the renderer
            store_config_dict = call_kwargs['store_config']
            assert isinstance(store_config_dict, dict)
            assert store_config_dict['store_name'] == sample_store_config.store_name
            assert store_config_dict['theme'] == sample_store_config.theme
            assert call_kwargs['page_type'] == "store_listing"
            assert call_kwargs['custom_context'] is None
            
            # Check that products were processed (they should have the same product_ids but potentially modified media)
            processed_products = call_kwargs['products']
            assert len(processed_products) == len(sample_products)
            for i, product in enumerate(processed_products):
                assert product.product_id == sample_products[i].product_id
                assert product.name == sample_products[i].name
            
            # Check that seo_data was converted to dict
            seo_dict = call_kwargs['seo_data']
            assert isinstance(seo_dict, dict)
            assert seo_dict['title'] == sample_seo_data.title
            assert seo_dict['description'] == sample_seo_data.description
    
    @pytest.mark.asyncio
    async def test_render_store_page_not_initialized(self, template_engine_service, sample_store_config, sample_products, sample_seo_data):
        """Test store page rendering when service not initialized."""
        with pytest.raises(TemplateEngineError) as exc_info:
            await template_engine_service.render_store_page(
                store_config=sample_store_config,
                products=sample_products,
                seo_data=sample_seo_data,
                page_type="store_listing"
            )
        
        assert exc_info.value.error_code == "SERVICE_NOT_INITIALIZED"
    
    @pytest.mark.asyncio
    async def test_render_template_success(self, initialized_template_engine_service):
        """Test successful template rendering."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render') as mock_render:
            mock_render.return_value = "<html>Rendered template</html>"
            
            result = await service.render_template(
                template_name="base.html",
                context={"title": "Test Page"},
                theme="test-theme"
            )
            
            assert result == "<html>Rendered template</html>"
            mock_render.assert_called_once_with(
                template_name="base.html",
                context={"title": "Test Page"},
                theme="test-theme",
                cache_key=None
            )
    
    @pytest.mark.asyncio
    async def test_render_template_with_cache_key(self, initialized_template_engine_service):
        """Test template rendering with custom cache key."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render') as mock_render:
            mock_render.return_value = "<html>Cached template</html>"
            
            await service.render_template(
                template_name="base.html",
                context={"title": "Test Page"},
                theme="test-theme",
                cache_key="custom_cache_key"
            )
            
            mock_render.assert_called_once_with(
                template_name="base.html",
                context={"title": "Test Page"},
                theme="test-theme",
                cache_key="custom_cache_key"
            )
    
    @pytest.mark.asyncio
    async def test_render_partial_success(self, initialized_template_engine_service):
        """Test successful partial rendering."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render') as mock_render:
            mock_render.return_value = "<div>Partial content</div>"
            
            product_mock = Mock(name="Test Product")
            result = await service.render_partial(
                partial_name="product_card.html",
                context={"product": product_mock},
                theme="test-theme"
            )
            
            assert result == "<div>Partial content</div>"
            mock_render.assert_called_once_with(
                template_name="partials/product_card.html",
                context={"product": product_mock},
                theme="test-theme"
            )
    
    @pytest.mark.asyncio
    async def test_process_assets_success(self, initialized_template_engine_service):
        """Test successful asset processing."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.asset_handler, 'process_product_assets') as mock_process_product, \
             patch.object(service.asset_handler, 'process_theme_assets') as mock_process_theme:
            
            mock_process_product.return_value = {"processed": "product_assets"}
            mock_process_theme.return_value = {"processed": "theme_assets"}
            
            # Test product assets
            product_media = {"primary_image": "test.jpg"}
            result = await service.process_assets(
                asset_type="product",
                assets=product_media
            )
            
            assert result == {"processed": "product_assets"}
            mock_process_product.assert_called_once_with(product_media)
            
            # Test theme assets
            theme_assets = ["css/main.css", "js/main.js"]
            result = await service.process_assets(
                asset_type="theme",
                assets=theme_assets,
                theme="test-theme"
            )
            
            assert result == {"processed": "theme_assets"}
            mock_process_theme.assert_called_once_with("test-theme", theme_assets)
    
    @pytest.mark.asyncio
    async def test_process_assets_invalid_type(self, initialized_template_engine_service):
        """Test asset processing with invalid asset type."""
        service = await initialized_template_engine_service()
        
        with pytest.raises(TemplateEngineError) as exc_info:
            await service.process_assets(
                asset_type="invalid_type",
                assets={}
            )
        
        assert exc_info.value.error_code == "INVALID_ASSET_TYPE"
        assert "invalid_type" in exc_info.value.message
    
    @pytest.mark.asyncio
    async def test_get_available_themes(self, initialized_template_engine_service):
        """Test getting available themes."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.theme_manager, 'get_available_themes') as mock_get_themes:
            mock_get_themes.return_value = ["theme1", "theme2", "theme3"]
            
            themes = await service.get_available_themes()
            
            assert themes == ["theme1", "theme2", "theme3"]
            mock_get_themes.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_validate_theme(self, initialized_template_engine_service):
        """Test theme validation."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.theme_manager, 'validate_theme') as mock_validate:
            mock_validate.return_value = {
                "is_valid": True,
                "theme_name": "test-theme",
                "errors": [],
                "warnings": []
            }
            
            result = await service.validate_theme("test-theme")
            
            assert result["is_valid"] is True
            assert result["theme_name"] == "test-theme"
            mock_validate.assert_called_once_with("test-theme")
    
    @pytest.mark.asyncio
    async def test_precompile_templates(self, initialized_template_engine_service):
        """Test template precompilation."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'precompile_templates') as mock_precompile:
            mock_precompile.return_value = {
                "base.html": True,
                "store_listing.html": True,
                "broken.html": False
            }
            
            result = await service.precompile_templates("test-theme")
            
            assert result["base.html"] is True
            assert result["store_listing.html"] is True
            assert result["broken.html"] is False
            mock_precompile.assert_called_once_with("test-theme", None)
    
    @pytest.mark.asyncio
    async def test_precompile_templates_specific_list(self, initialized_template_engine_service):
        """Test precompilation of specific templates."""
        service = await initialized_template_engine_service()
        
        template_list = ["base.html", "store_listing.html"]
        
        with patch.object(service.renderer, 'precompile_templates') as mock_precompile:
            mock_precompile.return_value = {
                "base.html": True,
                "store_listing.html": True
            }
            
            await service.precompile_templates("test-theme", template_list)
            
            mock_precompile.assert_called_once_with("test-theme", template_list)
    
    @pytest.mark.asyncio
    async def test_clear_caches_all(self, initialized_template_engine_service):
        """Test clearing all caches."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'clear_caches') as mock_clear_renderer, \
             patch.object(service.theme_manager, 'clear_theme_cache') as mock_clear_theme, \
             patch.object(service.cache_manager, 'invalidate_pattern') as mock_clear_cache:
            
            await service.clear_caches()
            
            mock_clear_renderer.assert_called_once_with(None)
            mock_clear_theme.assert_called_once_with(None)
            mock_clear_cache.assert_called_once_with("template_engine:*")
    
    @pytest.mark.asyncio
    async def test_clear_caches_specific_theme(self, initialized_template_engine_service):
        """Test clearing caches for specific theme."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'clear_caches') as mock_clear_renderer, \
             patch.object(service.theme_manager, 'clear_theme_cache') as mock_clear_theme, \
             patch.object(service.cache_manager, 'invalidate_pattern') as mock_clear_cache:
            
            await service.clear_caches("test-theme")
            
            mock_clear_renderer.assert_called_once_with("test-theme")
            mock_clear_theme.assert_called_once_with("test-theme")
            mock_clear_cache.assert_called_once_with("template_engine:test-theme:*")
    
    @pytest.mark.asyncio
    async def test_get_service_status(self, initialized_template_engine_service):
        """Test getting service status."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'get_render_metrics') as mock_render_metrics, \
             patch.object(service.asset_handler, 'get_processing_statistics') as mock_asset_stats, \
             patch.object(service.theme_manager, 'get_theme_statistics') as mock_theme_stats, \
             patch.object(service.cache_manager, 'health_check') as mock_cache_health:
            
            mock_render_metrics.return_value = {"templates_rendered": 100}
            mock_asset_stats.return_value = {"images_processed": 50}
            mock_theme_stats.return_value = {"total_themes": 5}
            mock_cache_health.return_value = {"status": "healthy"}
            
            status = await service.get_service_status()
            
            assert status["initialized"] is True
            assert status["service_name"] == "TemplateEngineService"
            assert "version" in status
            assert "uptime_seconds" in status
            assert "render_metrics" in status
            assert "asset_statistics" in status
            assert "theme_statistics" in status
            assert "cache_health" in status
            assert status["render_metrics"]["templates_rendered"] == 100
            assert status["asset_statistics"]["images_processed"] == 50
            assert status["theme_statistics"]["total_themes"] == 5
            assert status["cache_health"]["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_get_service_status_not_initialized(self, template_engine_service):
        """Test getting service status when not initialized."""
        status = await template_engine_service.get_service_status()
        
        assert status["initialized"] is False
        assert status["service_name"] == "TemplateEngineService"
        assert "version" in status
        assert "uptime_seconds" in status
        # Other metrics should not be present
        assert "render_metrics" not in status
        assert "asset_statistics" not in status
        assert "theme_statistics" not in status
        assert "cache_health" not in status
    
    @pytest.mark.asyncio
    async def test_health_check_healthy(self, initialized_template_engine_service):
        """Test health check when service is healthy."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.cache_manager, 'health_check') as mock_cache_health:
            mock_cache_health.return_value = {"status": "healthy"}
            
            health = await service.health_check()
            
            assert health["status"] == "healthy"
            assert health["service"] == "TemplateEngineService"
            assert health["initialized"] is True
            assert "timestamp" in health
            assert "checks" in health
            assert health["checks"]["cache"]["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_health_check_unhealthy_cache(self, initialized_template_engine_service):
        """Test health check when cache is unhealthy."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.cache_manager, 'health_check') as mock_cache_health:
            mock_cache_health.return_value = {"status": "unhealthy", "error": "Connection failed"}
            
            health = await service.health_check()
            
            assert health["status"] == "unhealthy"
            assert health["checks"]["cache"]["status"] == "unhealthy"
            assert health["checks"]["cache"]["error"] == "Connection failed"
    
    @pytest.mark.asyncio
    async def test_health_check_not_initialized(self, template_engine_service):
        """Test health check when service not initialized."""
        health = await template_engine_service.health_check()
        
        assert health["status"] == "unhealthy"
        assert health["initialized"] is False
        assert "Service not initialized" in health.get("error", "")
    
    @pytest.mark.asyncio
    async def test_shutdown_success(self, initialized_template_engine_service):
        """Test successful service shutdown."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.cache_manager, 'close') as mock_cache_close:
            await service.shutdown()
            
            assert service._initialized is False
            assert service.theme_manager is None
            assert service.asset_handler is None
            assert service.renderer is None
            mock_cache_close.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_shutdown_not_initialized(self, template_engine_service):
        """Test shutdown when service not initialized."""
        # Should not raise an error
        await template_engine_service.shutdown()
        
        assert template_engine_service._initialized is False
    
    @pytest.mark.asyncio
    async def test_ensure_initialized_decorator_success(self, initialized_template_engine_service):
        """Test that ensure_initialized decorator works correctly."""
        service = await initialized_template_engine_service()
        
        # This should work fine since service is initialized
        themes = await service.get_available_themes()
        assert isinstance(themes, list)
    
    @pytest.mark.asyncio
    async def test_ensure_initialized_decorator_failure(self, template_engine_service):
        """Test that ensure_initialized decorator raises error when not initialized."""
        # This should raise TemplateEngineError since service is not initialized
        with pytest.raises(TemplateEngineError) as exc_info:
            await template_engine_service.get_available_themes()
        
        assert exc_info.value.error_code == "SERVICE_NOT_INITIALIZED"
    
    @pytest.mark.asyncio
    async def test_error_handling_in_render_store_page(self, initialized_template_engine_service, sample_store_config, sample_products, sample_seo_data):
        """Test error handling in render_store_page."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            mock_render.side_effect = TemplateNotFoundError("template.html", "test-theme")
            
            with pytest.raises(TemplateNotFoundError):
                await service.render_store_page(
                    store_config=sample_store_config,
                    products=sample_products,
                    seo_data=sample_seo_data,
                    page_type="store_listing"
                )
    
    @pytest.mark.asyncio
    async def test_error_handling_in_process_assets(self, initialized_template_engine_service):
        """Test error handling in asset processing."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.asset_handler, 'process_product_assets') as mock_process:
            mock_process.side_effect = Exception("Asset processing failed")
            
            with pytest.raises(TemplateEngineError) as exc_info:
                await service.process_assets(
                    asset_type="product",
                    assets={"primary_image": "test.jpg"}
                )
            
            assert exc_info.value.error_code == "ASSET_PROCESSING_FAILED"
    
    def test_service_configuration_validation(self, mock_cache_manager):
        """Test service configuration validation."""
        # Test with invalid themes directory
        with pytest.raises(TemplateEngineError):
            TemplateEngineService(
                cache_manager=mock_cache_manager,
                themes_directory="/nonexistent/path",
                enable_optimization=True
            )
        
        # Test with missing cache manager
        with pytest.raises(TypeError):
            TemplateEngineService(
                themes_directory="/tmp",
                enable_optimization=True
            )
    
    @pytest.mark.asyncio
    async def test_concurrent_initialization(self, template_engine_service):
        """Test that concurrent initialization calls don't cause issues."""
        # Start multiple initialization tasks concurrently
        tasks = [
            template_engine_service.initialize()
            for _ in range(5)
        ]
        
        # Wait for all to complete
        await asyncio.gather(*tasks)
        
        # Service should be properly initialized
        assert template_engine_service._initialized is True
        assert template_engine_service.theme_manager is not None
    
    @pytest.mark.asyncio
    async def test_service_context_manager(self, mock_cache_manager, temp_themes_dir):
        """Test using service as async context manager."""
        async with TemplateEngineService(
            cache_manager=mock_cache_manager,
            themes_directory=str(temp_themes_dir)
        ) as service:
            assert service._initialized is True
            assert service.theme_manager is not None
        
        # After context exit, service should be shut down
        assert service._initialized is False
        assert service.theme_manager is None