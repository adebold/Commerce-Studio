"""
Unit tests for AssetHandler

Comprehensive test suite covering:
- Asset processing and optimization
- Image and video handling
- CSS/JS minification
- CDN integration
- Cache management
- Performance metrics
- Error handling
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from pathlib import Path
import json
from datetime import datetime

from src.store_generation.template_engine.asset_handler import AssetHandler
from src.store_generation.template_engine.exceptions import AssetProcessingError


class TestAssetHandler:
    """Test cases for AssetHandler class."""
    
    def test_asset_handler_initialization(self, mock_cache_manager):
        """Test asset handler initialization."""
        handler = AssetHandler(
            cache_manager=mock_cache_manager,
            cdn_base_url="https://cdn.test.com",
            enable_optimization=True,
            max_image_size=2048,
            compression_quality=85
        )
        
        assert handler.cache_manager == mock_cache_manager
        assert handler.cdn_base_url == "https://cdn.test.com"
        assert handler.enable_optimization is True
        assert handler.max_image_size == 2048
        assert handler.compression_quality == 85
        
        # Check supported formats
        assert "jpeg" in handler.supported_image_formats
        assert "png" in handler.supported_image_formats
        assert "webp" in handler.supported_image_formats
        assert "mp4" in handler.supported_video_formats
        assert "webm" in handler.supported_video_formats
        
        # Check stats initialization
        assert handler.processing_stats["images_processed"] == 0
        assert handler.processing_stats["videos_processed"] == 0
        assert handler.processing_stats["css_processed"] == 0
        assert handler.processing_stats["js_processed"] == 0
        assert handler.processing_stats["total_size_reduction"] == 0
        assert handler.processing_stats["errors"] == 0
    
    @pytest.mark.asyncio
    async def test_process_product_assets_complete(self, asset_handler):
        """Test processing complete product media assets."""
        product_media = {
            "primary_image": "https://example.com/primary.jpg",
            "gallery_images": [
                "https://example.com/gallery1.jpg",
                "https://example.com/gallery2.jpg"
            ],
            "video_url": "https://example.com/product-video.mp4"
        }
        
        # Mock the processing methods
        with patch.object(asset_handler, '_process_single_image') as mock_process_image, \
             patch.object(asset_handler, '_process_single_video') as mock_process_video, \
             patch.object(asset_handler, '_generate_image_variants') as mock_generate_variants, \
             patch.object(asset_handler, '_generate_responsive_images') as mock_generate_responsive, \
             patch.object(asset_handler, '_generate_blur_placeholder') as mock_generate_blur:
            
            mock_process_image.side_effect = lambda url: f"processed_{url}"
            mock_process_video.return_value = "processed_video_url"
            mock_generate_variants.return_value = {"webp": "variant.webp", "avif": "variant.avif"}
            mock_generate_responsive.return_value = {"primary": ["image_400.jpg", "image_800.jpg"]}
            mock_generate_blur.return_value = "data:image/png;base64,placeholder"
            
            result = await asset_handler.process_product_assets(product_media)
            
            # Check processed primary image
            assert result["primary_image"] == "processed_https://example.com/primary.jpg"
            
            # Check processed gallery images
            assert len(result["gallery_images"]) == 2
            assert result["gallery_images"][0] == "processed_https://example.com/gallery1.jpg"
            assert result["gallery_images"][1] == "processed_https://example.com/gallery2.jpg"
            
            # Check processed video
            assert result["video_url"] == "processed_video_url"
            
            # Check optimization results
            assert "optimized_images" in result
            assert "responsive_images" in result
            assert "blur_placeholder" in result
            
            # Verify method calls
            assert mock_process_image.call_count == 3  # primary + 2 gallery
            mock_process_video.assert_called_once_with("https://example.com/product-video.mp4")
    
    @pytest.mark.asyncio
    async def test_process_product_assets_minimal(self, asset_handler):
        """Test processing minimal product media assets."""
        product_media = {
            "primary_image": "https://example.com/primary.jpg"
        }
        
        with patch.object(asset_handler, '_process_single_image') as mock_process_image:
            mock_process_image.return_value = "processed_primary.jpg"
            
            result = await asset_handler.process_product_assets(product_media)
            
            assert result["primary_image"] == "processed_primary.jpg"
            assert "gallery_images" not in result or not result.get("gallery_images")
            assert "video_url" not in result or not result.get("video_url")
    
    @pytest.mark.asyncio
    async def test_process_product_assets_error_handling(self, asset_handler):
        """Test error handling in product asset processing."""
        product_media = {
            "primary_image": "invalid_url"
        }
        
        with patch.object(asset_handler, '_process_single_image') as mock_process_image:
            mock_process_image.side_effect = Exception("Processing failed")
            
            with pytest.raises(AssetProcessingError) as exc_info:
                await asset_handler.process_product_assets(product_media)
            
            assert exc_info.value.context["asset_url"] == "product_media"
            assert exc_info.value.context["processing_stage"] == "product_assets"
    
    @pytest.mark.asyncio
    async def test_process_theme_assets(self, asset_handler):
        """Test processing theme-specific assets."""
        theme_name = "test-theme"
        asset_paths = [
            "css/main.css",
            "js/main.js",
            "images/logo.png",
            "fonts/custom.woff2"
        ]
        
        with patch.object(asset_handler, '_process_single_image') as mock_process_image, \
             patch.object(asset_handler, '_process_css') as mock_process_css, \
             patch.object(asset_handler, '_process_javascript') as mock_process_js:
            
            mock_process_image.return_value = "processed_logo.png"
            mock_process_css.return_value = "processed_main.css"
            mock_process_js.return_value = "processed_main.js"
            
            result = await asset_handler.process_theme_assets(theme_name, asset_paths)
            
            assert result["css/main.css"] == "processed_main.css"
            assert result["js/main.js"] == "processed_main.js"
            assert result["images/logo.png"] == "processed_logo.png"
            assert result["fonts/custom.woff2"] == "fonts/custom.woff2"  # No processing for fonts
            
            mock_process_css.assert_called_once_with("css/main.css", theme_name)
            mock_process_js.assert_called_once_with("js/main.js", theme_name)
            mock_process_image.assert_called_once_with("images/logo.png")
    
    @pytest.mark.asyncio
    async def test_process_theme_assets_error_handling(self, asset_handler):
        """Test error handling in theme asset processing."""
        theme_name = "test-theme"
        asset_paths = ["broken/asset.css"]
        
        with patch.object(asset_handler, '_process_css') as mock_process_css:
            mock_process_css.side_effect = Exception("CSS processing failed")
            
            with pytest.raises(AssetProcessingError) as exc_info:
                await asset_handler.process_theme_assets(theme_name, asset_paths)
            
            assert exc_info.value.context["asset_url"] == f"theme:{theme_name}"
            assert exc_info.value.context["processing_stage"] == "theme_assets"
    
    @pytest.mark.asyncio
    async def test_generate_asset_manifest(self, asset_handler):
        """Test asset manifest generation."""
        theme_name = "test-theme"
        assets = {
            "css/main.css": "https://cdn.test.com/css/main.css",
            "js/main.js": "https://cdn.test.com/js/main.js",
            "images/logo.png": "https://cdn.test.com/images/logo.png"
        }
        
        with patch.object(asset_handler, '_get_asset_size') as mock_get_size:
            mock_get_size.return_value = 1024
            
            manifest = await asset_handler.generate_asset_manifest(assets, theme_name)
            
            assert manifest["theme"] == theme_name
            assert "generated_at" in manifest
            assert "version" in manifest
            assert manifest["cdn_base_url"] == asset_handler.cdn_base_url
            
            # Check asset entries
            assert "css/main.css" in manifest["assets"]
            assert "js/main.js" in manifest["assets"]
            assert "images/logo.png" in manifest["assets"]
            
            # Check asset info structure
            css_info = manifest["assets"]["css/main.css"]
            assert css_info["url"] == "https://cdn.test.com/css/main.css"
            assert css_info["type"] == "css"
            assert css_info["size"] == 1024
            assert "hash" in css_info
    
    @pytest.mark.asyncio
    async def test_embed_critical_css(self, asset_handler):
        """Test critical CSS embedding and minification."""
        css_content = """
        /* Comment */
        body {
            margin: 0;
            padding: 0;
        }
        
        .header {
            background: #333;
            color: white;
        }
        """
        
        result = await asset_handler.embed_critical_css(css_content)
        
        # Check that CSS was minified
        assert "/*" not in result  # Comments removed
        assert result.count(" ") < css_content.count(" ")  # Whitespace reduced
        assert "margin:0" in result or "margin: 0" in result
        
        # Verify caching was attempted
        if asset_handler.cache_manager:
            asset_handler.cache_manager.set.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_video_embed_basic(self, asset_handler):
        """Test basic video embed generation."""
        video_url = "https://example.com/video.mp4"
        
        embed_code = await asset_handler.generate_video_embed(video_url)
        
        assert "<video" in embed_code
        assert f'src="{video_url}"' in embed_code
        assert 'type="video/mp4"' in embed_code
        assert "controls" in embed_code
        assert 'loading="lazy"' in embed_code
        assert 'preload="metadata"' in embed_code
    
    @pytest.mark.asyncio
    async def test_generate_video_embed_with_options(self, asset_handler):
        """Test video embed generation with custom options."""
        video_url = "https://example.com/video.webm"
        
        embed_code = await asset_handler.generate_video_embed(
            video_url=video_url,
            width=800,
            height=600,
            autoplay=True,
            controls=False
        )
        
        assert 'width="800"' in embed_code
        assert 'height="600"' in embed_code
        assert "autoplay" in embed_code
        assert "controls" not in embed_code
        assert 'type="video/webm"' in embed_code
    
    @pytest.mark.asyncio
    async def test_process_single_image_with_cache_hit(self, asset_handler):
        """Test single image processing with cache hit."""
        image_url = "https://example.com/image.jpg"
        cached_result = {
            "optimized_urls": {
                "primary": "https://cdn.test.com/optimized_image.jpg"
            }
        }
        
        asset_handler.cache_manager.get_cached_asset_optimization.return_value = cached_result
        
        result = await asset_handler._process_single_image(image_url)
        
        assert result == "https://cdn.test.com/optimized_image.jpg"
        asset_handler.cache_manager.get_cached_asset_optimization.assert_called_once_with(image_url)
    
    @pytest.mark.asyncio
    async def test_process_single_image_with_cdn(self, asset_handler):
        """Test single image processing with CDN URL generation."""
        image_url = "relative/path/image.jpg"
        
        # Mock cache miss
        asset_handler.cache_manager.get_cached_asset_optimization.return_value = None
        
        result = await asset_handler._process_single_image(image_url)
        
        expected_url = f"{asset_handler.cdn_base_url}/relative/path/image.jpg"
        assert result == expected_url
        assert asset_handler.processing_stats["images_processed"] == 1
        
        # Verify caching was attempted
        asset_handler.cache_manager.cache_asset_optimization.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_single_image_error_handling(self, asset_handler):
        """Test single image processing error handling."""
        image_url = "https://example.com/broken.jpg"
        
        # Mock cache manager to raise an exception
        asset_handler.cache_manager.get_cached_asset_optimization.side_effect = Exception("Cache error")
        
        # Should return original URL on error
        result = await asset_handler._process_single_image(image_url)
        
        assert result == image_url
        assert asset_handler.processing_stats["errors"] == 1
    
    @pytest.mark.asyncio
    async def test_process_single_video_with_cdn(self, asset_handler):
        """Test single video processing with CDN URL generation."""
        video_url = "relative/path/video.mp4"
        
        result = await asset_handler._process_single_video(video_url)
        
        expected_url = f"{asset_handler.cdn_base_url}/relative/path/video.mp4"
        assert result == expected_url
        assert asset_handler.processing_stats["videos_processed"] == 1
    
    @pytest.mark.asyncio
    async def test_process_css_with_cdn(self, asset_handler):
        """Test CSS processing with CDN URL generation."""
        css_path = "css/main.css"
        theme_name = "test-theme"
        
        result = await asset_handler._process_css(css_path, theme_name)
        
        expected_url = f"{asset_handler.cdn_base_url}/css/main.css"
        assert result == expected_url
        assert asset_handler.processing_stats["css_processed"] == 1
    
    @pytest.mark.asyncio
    async def test_process_javascript_with_cdn(self, asset_handler):
        """Test JavaScript processing with CDN URL generation."""
        js_path = "js/main.js"
        theme_name = "test-theme"
        
        result = await asset_handler._process_javascript(js_path, theme_name)
        
        expected_url = f"{asset_handler.cdn_base_url}/js/main.js"
        assert result == expected_url
        assert asset_handler.processing_stats["js_processed"] == 1
    
    @pytest.mark.asyncio
    async def test_generate_image_variants(self, asset_handler):
        """Test generation of image variants."""
        media = {
            "primary_image": "https://example.com/image.jpg"
        }
        
        variants = await asset_handler._generate_image_variants(media)
        
        assert "webp" in variants
        assert "avif" in variants
        # Currently returns placeholder implementation
        assert variants["webp"] == media["primary_image"]
        assert variants["avif"] == media["primary_image"]
    
    @pytest.mark.asyncio
    async def test_generate_responsive_images(self, asset_handler):
        """Test generation of responsive image sets."""
        media = {
            "primary_image": "https://example.com/image.jpg"
        }
        
        responsive_sets = await asset_handler._generate_responsive_images(media)
        
        assert "primary" in responsive_sets
        assert len(responsive_sets["primary"]) == 3  # Original + 2 sizes
    
    @pytest.mark.asyncio
    async def test_generate_blur_placeholder(self, asset_handler):
        """Test generation of blur placeholder."""
        image_url = "https://example.com/image.jpg"
        
        placeholder = await asset_handler._generate_blur_placeholder(image_url)
        
        assert placeholder is not None
        assert placeholder.startswith("data:image/png;base64,")
    
    def test_get_asset_type(self, asset_handler):
        """Test asset type determination."""
        assert asset_handler._get_asset_type("image.jpg") == "image"
        assert asset_handler._get_asset_type("image.png") == "image"
        assert asset_handler._get_asset_type("image.webp") == "image"
        assert asset_handler._get_asset_type("video.mp4") == "video"
        assert asset_handler._get_asset_type("video.webm") == "video"
        assert asset_handler._get_asset_type("style.css") == "css"
        assert asset_handler._get_asset_type("script.js") == "js"
        assert asset_handler._get_asset_type("script.mjs") == "js"
        assert asset_handler._get_asset_type("font.woff2") == "other"
    
    def test_get_video_mime_type(self, asset_handler):
        """Test video MIME type determination."""
        assert asset_handler._get_video_mime_type("video.mp4") == "video/mp4"
        assert asset_handler._get_video_mime_type("video.webm") == "video/webm"
        assert asset_handler._get_video_mime_type("video.mov") == "video/quicktime"
        assert asset_handler._get_video_mime_type("video.avi") == "video/x-msvideo"
        assert asset_handler._get_video_mime_type("video.unknown") == "video/mp4"  # Default
    
    def test_generate_asset_hash(self, asset_handler):
        """Test asset hash generation."""
        url1 = "https://example.com/asset1.jpg"
        url2 = "https://example.com/asset2.jpg"
        
        hash1 = asset_handler._generate_asset_hash(url1)
        hash2 = asset_handler._generate_asset_hash(url2)
        
        assert len(hash1) == 8  # Truncated MD5
        assert len(hash2) == 8
        assert hash1 != hash2
        
        # Same URL should generate same hash
        hash1_again = asset_handler._generate_asset_hash(url1)
        assert hash1 == hash1_again
    
    def test_generate_version_hash(self, asset_handler):
        """Test version hash generation for asset sets."""
        assets1 = {"css/main.css": "url1", "js/main.js": "url2"}
        assets2 = {"css/main.css": "url1", "js/main.js": "url3"}
        
        hash1 = asset_handler._generate_version_hash(assets1)
        hash2 = asset_handler._generate_version_hash(assets2)
        
        assert len(hash1) == 8
        assert len(hash2) == 8
        assert hash1 != hash2
        
        # Same assets should generate same hash
        hash1_again = asset_handler._generate_version_hash(assets1)
        assert hash1 == hash1_again
    
    def test_minify_css(self, asset_handler):
        """Test CSS minification."""
        css_content = """
        /* This is a comment */
        body {
            margin: 0;
            padding: 0;
        }
        
        .header {
            background: #333 ;
            color: white ;
        }
        """
        
        minified = asset_handler._minify_css(css_content)
        
        # Check that comments are removed
        assert "/*" not in minified
        assert "*/" not in minified
        
        # Check that extra whitespace is reduced
        assert minified.count(" ") < css_content.count(" ")
        assert minified.count("\n") < css_content.count("\n")
        
        # Check that content is preserved
        assert "margin:0" in minified or "margin: 0" in minified
        assert "background:#333" in minified or "background: #333" in minified
    
    @pytest.mark.asyncio
    async def test_get_processing_statistics(self, asset_handler):
        """Test getting processing statistics."""
        # Update some stats
        asset_handler.processing_stats["images_processed"] = 10
        asset_handler.processing_stats["videos_processed"] = 5
        asset_handler.processing_stats["errors"] = 2
        
        stats = await asset_handler.get_processing_statistics()
        
        assert stats["images_processed"] == 10
        assert stats["videos_processed"] == 5
        assert stats["errors"] == 2
        assert stats["optimization_enabled"] == asset_handler.enable_optimization
        assert stats["cdn_configured"] == (asset_handler.cdn_base_url is not None)
        assert "supported_formats" in stats
        assert "images" in stats["supported_formats"]
        assert "videos" in stats["supported_formats"]