"""
Unit tests for TemplateRenderer

Comprehensive test suite covering:
- Template rendering functionality
- Jinja2 environment management
- Caching mechanisms
- Security validation
- Performance monitoring
- Error handling and recovery
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from pathlib import Path
import time
from jinja2 import TemplateNotFound, TemplateSyntaxError, TemplateRuntimeError

from src.store_generation.template_engine.renderer import TemplateRenderer
from src.store_generation.template_engine.exceptions import (
    TemplateNotFoundError,
    TemplateRenderError,
    TemplateTimeoutError,
    TemplateSecurityError,
    TemplateValidationError
)


class TestTemplateRenderer:
    """Test cases for TemplateRenderer class."""
    
    @pytest.mark.asyncio
    async def test_renderer_initialization(self, theme_manager, asset_handler, mock_cache_manager):
        """Test template renderer initialization."""
        renderer = TemplateRenderer(
            theme_manager=theme_manager,
            asset_handler=asset_handler,
            cache_manager=mock_cache_manager,
            render_timeout=30.0,
            enable_auto_escape=True,
            max_template_size=1024*1024
        )
        
        assert renderer.theme_manager == theme_manager
        assert renderer.asset_handler == asset_handler
        assert renderer.cache_manager == mock_cache_manager
        assert renderer.render_timeout == 30.0
        assert renderer.enable_auto_escape is True
        assert renderer.max_template_size == 1024*1024
        
        # Check metrics initialization
        assert renderer.render_metrics["templates_rendered"] == 0
        assert renderer.render_metrics["cache_hits"] == 0
        assert renderer.render_metrics["cache_misses"] == 0
        assert renderer.render_metrics["average_render_time"] == 0.0
        assert renderer.render_metrics["errors"] == 0
        assert renderer.render_metrics["timeouts"] == 0
        
        # Check security configuration
        assert ".html" in renderer.security_config["allowed_extensions"]
        assert "eval" in renderer.security_config["blocked_functions"]
        assert renderer.security_config["max_recursion_depth"] == 10
    
    @pytest.mark.asyncio
    async def test_successful_template_render(self, template_renderer, sample_theme_structure):
        """Test successful template rendering."""
        # Setup theme
        theme_name = sample_theme_structure["theme_name"]
        await template_renderer.theme_manager.discover_themes()
        
        context = {
            "store_config": Mock(store_name="Test Store"),
            "products": [
                Mock(name="Test Product", price=99.99, product_id="test_1")
            ],
            "seo_data": {"title": "Test Page"}
        }
        
        # Mock the Jinja2 environment and template
        with patch.object(template_renderer, '_get_jinja_environment') as mock_get_env:
            mock_env = Mock()
            mock_template = Mock()
            mock_template.render_async = AsyncMock(return_value="<html>Rendered content</html>")
            mock_env.get_template.return_value = mock_template
            mock_get_env.return_value = mock_env
            
            result = await template_renderer.render(
                template_name="store_listing.html",
                context=context,
                theme=theme_name
            )
            
            assert result == "<html>Rendered content</html>"
            assert template_renderer.render_metrics["templates_rendered"] == 1
            assert template_renderer.render_metrics["cache_misses"] == 1
            mock_template.render_async.assert_called_once_with(**context)
    
    @pytest.mark.asyncio
    async def test_render_with_caching(self, template_renderer, sample_theme_structure):
        """Test template rendering with result caching."""
        theme_name = sample_theme_structure["theme_name"]
        cache_key = "test_cache_key"
        rendered_content = "<html>New rendered content</html>"
        
        # Mock cache miss, then successful render
        template_renderer.cache_manager.get_cached_template.return_value = None
        
        with patch.object(template_renderer, '_get_jinja_environment') as mock_get_env:
            mock_env = Mock()
            mock_template = Mock()
            mock_template.render_async = AsyncMock(return_value=rendered_content)
            mock_env.get_template.return_value = mock_template
            mock_get_env.return_value = mock_env
            
            context = {"test": "context"}
            
            result = await template_renderer.render(
                template_name="store_listing.html",
                context=context,
                theme=theme_name,
                cache_key=cache_key
            )
            
            assert result == rendered_content
            # Verify caching was attempted
            template_renderer.cache_manager.cache_template.assert_called_once_with(
                cache_key, rendered_content, theme=theme_name
            )
    
    @pytest.mark.asyncio
    async def test_render_timeout_error(self, template_renderer, sample_theme_structure):
        """Test template rendering timeout handling."""
        theme_name = sample_theme_structure["theme_name"]
        
        with patch.object(template_renderer, '_get_jinja_environment') as mock_get_env:
            mock_env = Mock()
            mock_template = Mock()
            
            # Mock a slow render that times out
            async def slow_render(**kwargs):
                await asyncio.sleep(15)  # Longer than timeout
                return "Should not reach here"
            
            mock_template.render_async = slow_render
            mock_env.get_template.return_value = mock_template
            mock_get_env.return_value = mock_env
            
            template_renderer.render_timeout = 0.1  # Very short timeout for testing
            
            with pytest.raises(TemplateTimeoutError) as exc_info:
                await template_renderer.render(
                    template_name="store_listing.html",
                    context={"test": "context"},
                    theme=theme_name
                )
            
            assert exc_info.value.context["operation"] == "template_render"
            assert exc_info.value.context["timeout_seconds"] == 0.1
            assert exc_info.value.context["template_name"] == "store_listing.html"
            assert template_renderer.render_metrics["timeouts"] == 1
    
    @pytest.mark.asyncio
    async def test_template_not_found_error(self, template_renderer, sample_theme_structure):
        """Test handling of template not found errors."""
        theme_name = sample_theme_structure["theme_name"]
        
        with patch.object(template_renderer, '_get_jinja_environment') as mock_get_env:
            mock_env = Mock()
            mock_env.get_template.side_effect = TemplateNotFound("nonexistent.html")
            mock_get_env.return_value = mock_env
            
            with pytest.raises(TemplateNotFoundError) as exc_info:
                await template_renderer.render(
                    template_name="nonexistent.html",
                    context={"test": "context"},
                    theme=theme_name
                )
            
            assert exc_info.value.context["template_name"] == "nonexistent.html"
            assert exc_info.value.context["theme"] == theme_name
            assert template_renderer.render_metrics["errors"] == 1
    
    @pytest.mark.asyncio
    async def test_template_syntax_error(self, template_renderer, sample_theme_structure):
        """Test handling of template syntax errors."""
        theme_name = sample_theme_structure["theme_name"]
        
        with patch.object(template_renderer, '_get_jinja_environment') as mock_get_env:
            mock_env = Mock()
            syntax_error = TemplateSyntaxError("Invalid syntax", lineno=10)
            mock_env.get_template.side_effect = syntax_error
            mock_get_env.return_value = mock_env
            
            with pytest.raises(TemplateRenderError) as exc_info:
                await template_renderer.render(
                    template_name="broken.html",
                    context={"test": "context"},
                    theme=theme_name
                )
            
            assert exc_info.value.context["template_name"] == "broken.html"
            assert exc_info.value.context["line_number"] == 10
            assert template_renderer.render_metrics["errors"] == 1
    
    @pytest.mark.asyncio
    async def test_render_store_page(self, template_renderer, sample_store_config, sample_products, sample_seo_data):
        """Test rendering a complete store page."""
        with patch.object(template_renderer, 'render') as mock_render:
            mock_render.return_value = "<html>Store page content</html>"
            
            result = await template_renderer.render_store_page(
                store_config=sample_store_config,
                products=sample_products,
                seo_data=sample_seo_data,
                page_type="store_listing"
            )
            
            assert result == "<html>Store page content</html>"
            
            # Verify render was called with correct parameters
            mock_render.assert_called_once()
            call_args = mock_render.call_args
            
            assert call_args[1]["template_name"] == "store_listing.html"
            assert call_args[1]["theme"] == sample_store_config.theme.value
            assert "store_config" in call_args[1]["context"]
            assert "products" in call_args[1]["context"]
            assert "seo_data" in call_args[1]["context"]
    
    @pytest.mark.asyncio
    async def test_render_partial(self, template_renderer, sample_theme_structure):
        """Test rendering template partials."""
        theme_name = sample_theme_structure["theme_name"]
        
        with patch.object(template_renderer, 'render') as mock_render:
            mock_render.return_value = "<div>Partial content</div>"
            
            result = await template_renderer.render_partial(
                partial_name="product_card.html",
                context={"product": Mock(name="Test Product")},
                theme=theme_name
            )
            
            assert result == "<div>Partial content</div>"
            
            # Verify correct partial path was used
            call_args = mock_render.call_args
            assert call_args[1]["template_name"] == "partials/product_card.html"
    
    @pytest.mark.asyncio
    async def test_render_partial_with_partials_prefix(self, template_renderer, sample_theme_structure):
        """Test rendering partial that already has partials/ prefix."""
        theme_name = sample_theme_structure["theme_name"]
        
        with patch.object(template_renderer, 'render') as mock_render:
            mock_render.return_value = "<div>Partial content</div>"
            
            await template_renderer.render_partial(
                partial_name="partials/product_card.html",
                context={"product": Mock(name="Test Product")},
                theme=theme_name
            )
            
            # Should not double the partials/ prefix
            call_args = mock_render.call_args
            assert call_args[1]["template_name"] == "partials/product_card.html"
    @pytest.mark.asyncio
    async def test_render_with_cache_hit(self, template_renderer, sample_theme_structure):
        """Test template rendering with cache hit."""
        theme_name = sample_theme_structure["theme_name"]
        cache_key = "test_cache_key"
        cached_content = "<html>Cached content</html>"
        
        # Mock cache hit
        template_renderer.cache_manager.get_cached_template.return_value = cached_content
        
        context = {"test": "context"}
        
        result = await template_renderer.render(
            template_name="store_listing.html",
            context=context,
            theme=theme_name,
            cache_key=cache_key
        )
        
        assert result == cached_content
        assert template_renderer.render_metrics["cache_hits"] == 1
        template_renderer.cache_manager.get_cached_template.assert_called_once_with(
            cache_key, theme=theme_name
        )