"""
Performance tests for Template Engine

Comprehensive performance testing covering:
- Rendering speed benchmarks
- Asset processing performance
- Cache performance
- Memory usage monitoring
- Concurrent rendering tests
- Load testing scenarios
"""

import pytest
import asyncio
import time
from unittest.mock import Mock, AsyncMock, patch
import gc
import psutil
import os
from concurrent.futures import ThreadPoolExecutor

from src.store_generation.template_engine.service import TemplateEngineService


class TestTemplateEnginePerformance:
    """Performance test cases for Template Engine."""
    
    @pytest.mark.asyncio
    async def test_render_performance_single_template(self, initialized_template_engine_service, sample_store_config, performance_test_data):
        """Test single template rendering performance."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            mock_render.return_value = "<html>Performance test content</html>"
            
            # Measure rendering time
            start_time = time.time()
            
            result = await service.render_store_page(
                store_config=sample_store_config,
                products=performance_test_data[:50],  # 50 products
                seo_data={"title": "Performance Test"},
                page_type="store_listing"
            )
            
            end_time = time.time()
            render_time = end_time - start_time
            
            # Performance assertions
            assert render_time < 1.0  # Should render in less than 1 second
            assert result == "<html>Performance test content</html>"
            
            # Verify mock was called once
            mock_render.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_render_performance_multiple_templates(self, initialized_template_engine_service, sample_store_config, performance_test_data):
        """Test performance with multiple template renders."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            mock_render.return_value = "<html>Performance test content</html>"
            
            # Render multiple templates
            render_count = 10
            start_time = time.time()
            
            tasks = []
            for i in range(render_count):
                task = service.render_store_page(
                    store_config=sample_store_config,
                    products=performance_test_data[i*10:(i+1)*10],  # 10 products each
                    seo_data={"title": f"Performance Test {i}"},
                    page_type="store_listing"
                )
                tasks.append(task)
            
            results = await asyncio.gather(*tasks)
            
            end_time = time.time()
            total_time = end_time - start_time
            avg_time = total_time / render_count
            
            # Performance assertions
            assert total_time < 5.0  # All 10 renders in less than 5 seconds
            assert avg_time < 0.5  # Average render time less than 500ms
            assert len(results) == render_count
            assert all(r == "<html>Performance test content</html>" for r in results)
    
    @pytest.mark.asyncio
    async def test_concurrent_rendering_performance(self, initialized_template_engine_service, sample_store_config, performance_test_data):
        """Test performance under concurrent rendering load."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            mock_render.return_value = "<html>Concurrent test content</html>"
            
            # Simulate concurrent users
            concurrent_requests = 20
            start_time = time.time()
            
            # Create semaphore to limit concurrency
            semaphore = asyncio.Semaphore(10)  # Max 10 concurrent
            
            async def render_with_semaphore(request_id):
                async with semaphore:
                    return await service.render_store_page(
                        store_config=sample_store_config,
                        products=performance_test_data[:20],  # 20 products
                        seo_data={"title": f"Concurrent Test {request_id}"},
                        page_type="store_listing"
                    )
            
            tasks = [
                render_with_semaphore(i)
                for i in range(concurrent_requests)
            ]
            
            results = await asyncio.gather(*tasks)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            # Performance assertions
            assert total_time < 10.0  # All concurrent requests in less than 10 seconds
            assert len(results) == concurrent_requests
            assert all(r == "<html>Concurrent test content</html>" for r in results)
            assert mock_render.call_count == concurrent_requests
    
    @pytest.mark.asyncio
    async def test_cache_performance_benefits(self, initialized_template_engine_service, sample_store_config, sample_products):
        """Test performance benefits of caching."""
        service = await initialized_template_engine_service()
        
        # First render (cache miss)
        with patch.object(service.renderer, 'render') as mock_render:
            mock_render.return_value = "<html>Cached content</html>"
            
            start_time = time.time()
            result1 = await service.render_template(
                template_name="store_listing.html",
                context={"products": sample_products},
                theme="test-theme",
                cache_key="performance_test"
            )
            first_render_time = time.time() - start_time
            
            # Mock cache hit for second render
            service.cache_manager.get_cached_template.return_value = "<html>Cached content</html>"
            
            start_time = time.time()
            result2 = await service.render_template(
                template_name="store_listing.html",
                context={"products": sample_products},
                theme="test-theme",
                cache_key="performance_test"
            )
            cached_render_time = time.time() - start_time
            
            # Cache should be significantly faster
            assert cached_render_time < first_render_time
            assert cached_render_time < 0.01  # Cache should be very fast
            assert result1 == result2
    
    @pytest.mark.asyncio
    async def test_asset_processing_performance(self, initialized_template_engine_service):
        """Test asset processing performance."""
        service = await initialized_template_engine_service()
        
        # Create large asset set
        large_media = {
            "primary_image": "https://example.com/large_image.jpg",
            "gallery_images": [
                f"https://example.com/gallery_{i}.jpg"
                for i in range(50)  # 50 gallery images
            ],
            "video_url": "https://example.com/large_video.mp4"
        }
        
        with patch.object(service.asset_handler, 'process_product_assets') as mock_process:
            mock_process.return_value = {"processed": "large_assets"}
            
            start_time = time.time()
            
            result = await service.process_assets(
                asset_type="product",
                assets=large_media
            )
            
            processing_time = time.time() - start_time
            
            # Performance assertions
            assert processing_time < 2.0  # Should process in less than 2 seconds
            assert result == {"processed": "large_assets"}
            mock_process.assert_called_once_with(large_media)
    
    @pytest.mark.asyncio
    async def test_memory_usage_monitoring(self, initialized_template_engine_service, performance_test_data):
        """Test memory usage during intensive operations."""
        service = await initialized_template_engine_service()
        
        # Get initial memory usage
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            mock_render.return_value = "<html>Memory test content</html>"
            
            # Perform memory-intensive operations
            for i in range(100):  # 100 renders
                await service.render_store_page(
                    store_config=Mock(store_name=f"Store {i}"),
                    products=performance_test_data,  # Full dataset each time
                    seo_data={"title": f"Memory Test {i}"},
                    page_type="store_listing"
                )
                
                # Force garbage collection every 10 iterations
                if i % 10 == 0:
                    gc.collect()
            
            # Get final memory usage
            final_memory = process.memory_info().rss / 1024 / 1024  # MB
            memory_increase = final_memory - initial_memory
            
            # Memory assertions - be more realistic about memory usage
            assert memory_increase < 500  # Should not increase by more than 500MB (CI environment friendly)
            assert mock_render.call_count == 100
            
            # Log memory usage for debugging
            print(f"Memory increase: {memory_increase:.2f}MB")
    
    @pytest.mark.asyncio
    async def test_theme_discovery_performance(self, temp_themes_dir):
        """Test theme discovery performance with many themes."""
        # Create multiple test themes
        theme_count = 50
        for i in range(theme_count):
            theme_dir = temp_themes_dir / f"theme_{i:03d}"
            theme_dir.mkdir()
            
            # Create theme.json
            theme_config = {
                "name": f"theme_{i:03d}",
                "version": "1.0.0",
                "description": f"Test theme {i}"
            }
            (theme_dir / "theme.json").write_text(
                __import__('json').dumps(theme_config, indent=2)
            )
            
            # Create templates directory with files
            templates_dir = theme_dir / "templates"
            templates_dir.mkdir()
            (templates_dir / "base.html").write_text("<html>Base</html>")
            (templates_dir / "store_listing.html").write_text("<html>Store</html>")
        
        # Test discovery performance
        from src.store_generation.template_engine.theme_manager import ThemeManager
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        
        start_time = time.time()
        themes = await manager.discover_themes()
        discovery_time = time.time() - start_time
        
        # Performance assertions
        assert discovery_time < 5.0  # Should discover 50 themes in less than 5 seconds
        assert len(themes) == theme_count
    
    @pytest.mark.asyncio
    async def test_service_initialization_performance(self, mock_cache_manager, temp_themes_dir):
        """Test service initialization performance."""
        start_time = time.time()
        
        service = TemplateEngineService(
            cache_manager=mock_cache_manager,
            themes_directory=str(temp_themes_dir)
        )
        
        await service.initialize()
        
        initialization_time = time.time() - start_time
        
        # Performance assertions
        assert initialization_time < 1.0  # Should initialize in less than 1 second
        assert service._initialized is True
        
        await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_template_validation_performance(self, initialized_template_engine_service):
        """Test template validation performance."""
        service = await initialized_template_engine_service()
        
        # Mock theme manager to return many templates
        template_names = [f"template_{i}.html" for i in range(100)]
        
        with patch.object(service.theme_manager, 'get_theme_templates') as mock_get_templates, \
             patch.object(service.renderer, 'validate_template') as mock_validate:
            
            mock_get_templates.return_value = template_names
            mock_validate.return_value = {
                "is_valid": True,
                "errors": [],
                "security_issues": []
            }
            
            start_time = time.time()
            
            # Validate all templates
            for template_name in template_names:
                await service.renderer.validate_template(template_name, "test-theme")
            
            validation_time = time.time() - start_time
            
            # Performance assertions
            assert validation_time < 3.0  # Should validate 100 templates in less than 3 seconds
            assert mock_validate.call_count == 100
    
    @pytest.mark.asyncio
    async def test_cache_statistics_performance(self, initialized_template_engine_service):
        """Test performance of cache statistics gathering."""
        service = await initialized_template_engine_service()
        
        # Mock statistics methods that actually exist
        with patch.object(service.renderer, 'get_render_metrics') as mock_render_metrics, \
             patch.object(service.asset_handler, 'get_processing_statistics') as mock_asset_stats, \
             patch.object(service.cache_manager, 'get_cache_statistics') as mock_cache_stats:
            
            mock_render_metrics.return_value = {"templates_rendered": 1000}
            mock_asset_stats.return_value = {"images_processed": 500}
            mock_cache_stats.return_value = {"cache_hits": 100, "cache_misses": 20}
            
            start_time = time.time()
            
            # Get statistics multiple times by calling get_service_metrics directly
            for _ in range(50):
                await service.get_service_metrics()
            
            stats_time = time.time() - start_time
            
            # Performance assertions
            assert stats_time < 1.0  # Should gather stats 50 times in less than 1 second
            assert mock_render_metrics.call_count == 50
            assert mock_asset_stats.call_count == 50
            assert mock_cache_stats.call_count == 50
    
    @pytest.mark.asyncio
    async def test_error_handling_performance_impact(self, initialized_template_engine_service, sample_store_config, sample_products):
        """Test that error handling doesn't significantly impact performance."""
        service = await initialized_template_engine_service()
        
        # Test successful renders
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            mock_render.return_value = "<html>Success</html>"
            
            start_time = time.time()
            
            for _ in range(10):
                await service.render_store_page(
                    store_config=sample_store_config,
                    products=sample_products,
                    seo_data={"title": "Success Test"},
                    page_type="store_listing"
                )
            
            success_time = time.time() - start_time
        
        # Test renders with errors
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            from src.store_generation.template_engine.exceptions import TemplateNotFoundError
            mock_render.side_effect = TemplateNotFoundError("test.html", "theme")
            
            start_time = time.time()
            
            for _ in range(10):
                try:
                    await service.render_store_page(
                        store_config=sample_store_config,
                        products=sample_products,
                        seo_data={"title": "Error Test"},
                        page_type="store_listing"
                    )
                except TemplateNotFoundError:
                    pass  # Expected
            
            error_time = time.time() - start_time
        
        # Error handling should not be significantly slower
        performance_ratio = error_time / success_time
        assert performance_ratio < 2.0  # Error handling should not be more than 2x slower
    
    def test_synchronous_operations_performance(self, asset_handler):
        """Test performance of synchronous operations."""
        # Test CSS minification performance
        large_css = "/* Comment */ " + "body { margin: 0; } " * 1000
        
        start_time = time.time()
        
        for _ in range(100):
            minified = asset_handler._minify_css(large_css)
        
        minify_time = time.time() - start_time
        
        # Performance assertions
        assert minify_time < 1.0  # Should minify 100 times in less than 1 second
        assert len(minified) < len(large_css)  # Should actually minify
    
    @pytest.mark.asyncio
    async def test_load_balancing_simulation(self, initialized_template_engine_service, sample_store_config, performance_test_data):
        """Simulate load balancing scenarios."""
        service = await initialized_template_engine_service()
        
        with patch.object(service.renderer, 'render_store_page') as mock_render:
            mock_render.return_value = "<html>Load balanced content</html>"
            
            # Simulate different request patterns
            async def burst_requests():
                """Simulate burst of requests."""
                tasks = []
                for i in range(20):  # 20 rapid requests
                    task = service.render_store_page(
                        store_config=sample_store_config,
                        products=performance_test_data[:10],
                        seo_data={"title": f"Burst {i}"},
                        page_type="store_listing"
                    )
                    tasks.append(task)
                return await asyncio.gather(*tasks)
            
            async def steady_requests():
                """Simulate steady request pattern."""
                results = []
                for i in range(10):  # 10 requests with delays
                    result = await service.render_store_page(
                        store_config=sample_store_config,
                        products=performance_test_data[:10],
                        seo_data={"title": f"Steady {i}"},
                        page_type="store_listing"
                    )
                    results.append(result)
                    await asyncio.sleep(0.1)  # Small delay between requests
                return results
            
            start_time = time.time()
            
            # Run both patterns concurrently
            burst_results, steady_results = await asyncio.gather(
                burst_requests(),
                steady_requests()
            )
            
            total_time = time.time() - start_time
            
            # Performance assertions
            assert total_time < 15.0  # Should handle mixed load in less than 15 seconds
            assert len(burst_results) == 20
            assert len(steady_results) == 10
            assert mock_render.call_count == 30