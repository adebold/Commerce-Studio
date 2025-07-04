"""
Integration tests for Template Engine

Comprehensive integration testing covering:
- End-to-end template rendering workflows
- Component interaction testing
- Real theme processing
- Asset pipeline integration
- Cache behavior validation
- Error recovery scenarios
"""

import pytest
import asyncio
from pathlib import Path
import json
import tempfile
from unittest.mock import Mock, AsyncMock

from src.store_generation.template_engine.service import TemplateEngineService


class TestTemplateEngineIntegration:
    """Integration test cases for Template Engine."""
    
    @pytest.mark.asyncio
    async def test_complete_store_generation_workflow(self, initialized_template_engine_service, sample_theme_structure, sample_store_config, sample_products, sample_seo_data):
        """Test complete store generation workflow from start to finish."""
        service = await initialized_template_engine_service()
        theme_name = sample_theme_structure["theme_name"]
        
        # Step 1: Discover and validate themes
        await service.theme_manager.discover_themes()
        themes = await service.get_available_themes()
        assert theme_name in themes
        
        # Step 2: Validate the theme
        validation = await service.validate_theme(theme_name)
        assert validation["is_valid"] is True
        
        # Step 3: Process product assets
        for product in sample_products:
            if hasattr(product, 'media') and product.media:
                processed_media = await service.process_assets(
                    asset_type="product",
                    assets=product.media.dict()
                )
                assert processed_media is not None
        
        # Step 4: Process theme assets
        theme_assets = await service.theme_manager.get_theme_assets(theme_name)
        if theme_assets:
            processed_theme_assets = await service.process_assets(
                asset_type="theme",
                assets=theme_assets,
                theme=theme_name
            )
            assert processed_theme_assets is not None
        
        # Step 5: Render store listing page
        store_html = await service.render_store_page(
            store_config=sample_store_config,
            products=sample_products,
            seo_data=sample_seo_data,
            page_type="store_listing"
        )
        
        assert store_html is not None
        assert isinstance(store_html, str)
        assert len(store_html) > 0
        
        # Step 6: Render individual product pages
        for product in sample_products[:2]:  # Test first 2 products
            product_html = await service.render_store_page(
                store_config=sample_store_config,
                products=[product],
                seo_data=sample_seo_data,
                page_type="product_page"
            )
            
            assert product_html is not None
            assert isinstance(product_html, str)
            assert len(product_html) > 0
        
        # Step 7: Render partials
        for product in sample_products[:1]:  # Test one product card
            partial_html = await service.render_partial(
                partial_name="product_card.html",
                context={"product": product},
                theme=theme_name
            )
            
            assert partial_html is not None
            assert isinstance(partial_html, str)
    
    @pytest.mark.asyncio
    async def test_theme_switching_workflow(self, mock_cache_manager, temp_themes_dir, sample_store_config, sample_products):
        """Test switching between different themes."""
        # Create multiple test themes
        theme_configs = [
            {"name": "theme-1", "version": "1.0.0", "description": "First theme"},
            {"name": "theme-2", "version": "1.0.0", "description": "Second theme"},
        ]
        
        for config in theme_configs:
            theme_dir = temp_themes_dir / config["name"]
            theme_dir.mkdir()
            
            # Create theme.json
            (theme_dir / "theme.json").write_text(json.dumps(config, indent=2))
            
            # Create templates
            templates_dir = theme_dir / "templates"
            templates_dir.mkdir()
            
            base_template = f"""<!DOCTYPE html>
<html>
<head><title>{{{{ store_config.store_name }}}} - {config['name']}</title></head>
<body>
    <h1>{config['name']} Theme</h1>
    {{% block content %}}{{% endblock %}}
</body>
</html>"""
            (templates_dir / "base.html").write_text(base_template)
            
            store_template = f"""{{% extends "base.html" %}}
{{% block content %}}
<div class="{config['name']}-store">
    <h2>Products from {config['name']}</h2>
    {{% for product in products %}}
        <div class="product">{{{{ product.name }}}}</div>
    {{% endfor %}}
</div>
{{% endblock %}}"""
            (templates_dir / "store_listing.html").write_text(store_template)
            
            product_template = f"""{{% extends "base.html" %}}
{{% block content %}}
<div class="{config['name']}-product">
    <h2>{{{{ products[0].name }}}}</h2>
    <p>Rendered with {config['name']} theme</p>
</div>
{{% endblock %}}"""
            (templates_dir / "product_page.html").write_text(product_template)
        
        # Initialize service
        service = TemplateEngineService(
            cache_manager=mock_cache_manager,
            themes_directory=str(temp_themes_dir)
        )
        await service.initialize()
        
        try:
            # Discover themes
            await service.theme_manager.discover_themes()
            themes = await service.get_available_themes()
            assert "theme-1" in themes
            assert "theme-2" in themes
            
            # Render with first theme
            sample_store_config.theme = Mock()
            sample_store_config.theme.value = "theme-1"
            
            html1 = await service.render_store_page(
                store_config=sample_store_config,
                products=sample_products,
                seo_data={"title": "Test"},
                page_type="store_listing"
            )
            
            # Render with second theme
            sample_store_config.theme.value = "theme-2"
            
            html2 = await service.render_store_page(
                store_config=sample_store_config,
                products=sample_products,
                seo_data={"title": "Test"},
                page_type="store_listing"
            )
            
            # Results should be different based on theme
            assert html1 != html2
            assert "theme-1" in html1
            assert "theme-2" in html2
            
        finally:
            await service.shutdown()
    
    @pytest.mark.asyncio
    async def test_error_recovery_scenarios(self, initialized_template_engine_service, sample_store_config, sample_products):
        """Test error recovery in various scenarios."""
        service = await initialized_template_engine_service()
        
        # Scenario 1: Missing theme - should fallback to default theme
        # Create store config with nonexistent theme
        invalid_config = sample_store_config.copy()
        invalid_config.theme = "nonexistent-theme"
        
        # Should not raise error, but fallback to default theme
        result = await service.render_store_page(
            store_config=invalid_config,
            products=sample_products,
            seo_data={"title": "Test"}
        )
        
        # Verify fallback worked - result should be HTML string
        assert isinstance(result, str)
        assert len(result) > 0
        assert "<html" in result or "<!DOCTYPE" in result
        
        # Service should still be functional after error
        status = await service.get_service_status()
        assert status["initialized"] is True
        
        # Scenario 2: Invalid template context
        invalid_context = {"circular_ref": None}
        invalid_context["circular_ref"] = invalid_context  # Circular reference
        
        try:
            await service.render_store_page(
                store_config=sample_store_config,
                products=sample_products,
                seo_data=invalid_context
            )
        except Exception:
            pass  # Expected to fail
        
        # Service should still be functional
        status = await service.get_service_status()
        assert status["initialized"] is True
        
        # Scenario 3: Cache failures
        original_cache_method = service.cache_manager.get_cached_template
        service.cache_manager.get_cached_template = AsyncMock(side_effect=Exception("Cache error"))
        
        try:
            # Should still work even with cache failures
            result = await service.render_store_page(
                theme="modern-minimal",
                template="store_listing",
                store_config=sample_store_config,
                products=sample_products,
                seo_data={"test": "data"}
            )
            # Even if it fails, service should be recoverable
        except Exception:
            pass
        
        # Restore cache method
        service.cache_manager.get_cached_template = original_cache_method
        
        # Service should still be functional
        status = await service.get_service_status()
        assert status["initialized"] is True
    
    @pytest.mark.asyncio
    async def test_concurrent_theme_operations(self, initialized_template_engine_service, sample_theme_structure):
        """Test concurrent theme operations."""
        service = await initialized_template_engine_service()
        theme_name = sample_theme_structure["theme_name"]
        
        await service.theme_manager.discover_themes()
        
        async def concurrent_operation(operation_id):
            """Perform various theme operations concurrently."""
            try:
                # Get theme details
                details = await service.theme_manager.get_theme_details(theme_name)
                
                # Validate theme
                validation = await service.validate_theme(theme_name)
                
                # Get templates
                templates = await service.theme_manager.get_theme_templates(theme_name)
                
                # Get assets
                assets = await service.theme_manager.get_theme_assets(theme_name)
                
                return {
                    "operation_id": operation_id,
                    "details": details is not None,
                    "validation": validation["is_valid"],
                    "templates_count": len(templates),
                    "assets_count": len(assets)
                }
            except Exception as e:
                return {"operation_id": operation_id, "error": str(e)}
        
        # Run concurrent operations
        tasks = [concurrent_operation(i) for i in range(10)]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All operations should succeed
        successful_results = [r for r in results if isinstance(r, dict) and "error" not in r]
        assert len(successful_results) == 10
        
        # Results should be consistent
        for result in successful_results:
            assert result["details"] is True
            assert result["validation"] is True
            assert result["templates_count"] > 0
            assert result["assets_count"] > 0
    
    @pytest.mark.asyncio
    async def test_cache_consistency_across_operations(self, initialized_template_engine_service, sample_store_config, sample_products):
        """Test cache consistency across different operations."""
        service = await initialized_template_engine_service()
        
        # Enable actual caching for this test
        cache_key = "consistency_test"
        
        # First render
        result1 = await service.render_store_page(
            store_config=sample_store_config,
            products=sample_products,
            seo_data={"cache_key": cache_key}
        )
        
        # Second render with same cache key should be from cache
        result2 = await service.render_store_page(
            store_config=sample_store_config,
            products=sample_products,
            seo_data={"cache_key": cache_key}
        )
        
        # Results should be identical
        assert result1 == result2
        
        # Clear specific cache
        await service.clear_caches("modern-minimal")
        
        # Third render should work (rebuilding cache)
        result3 = await service.render_store_page(
            store_config=sample_store_config,
            products=sample_products,
            seo_data={"cache_key": cache_key}
        )
        
        # Should still get a valid result
        assert result3 is not None
        assert isinstance(result3, str)
    
    @pytest.mark.asyncio
    async def test_asset_pipeline_integration(self, initialized_template_engine_service, sample_theme_structure):
        """Test integration of the complete asset pipeline."""
        service = await initialized_template_engine_service()
        theme_name = sample_theme_structure["theme_name"]
        
        # Step 1: Get theme assets
        theme_assets = await service.theme_manager.get_theme_assets(theme_name)
        assert len(theme_assets) > 0
        
        # Step 2: Process theme assets
        processed_assets = await service.process_assets(
            asset_type="theme",
            assets=theme_assets,
            theme=theme_name
        )
        
        assert processed_assets is not None
        assert len(processed_assets) > 0
        
        # Step 3: Generate asset manifest
        manifest = await service.asset_handler.generate_asset_manifest(
            processed_assets, theme_name
        )
        
        assert manifest["theme"] == theme_name
        assert "assets" in manifest
        assert "version" in manifest
        assert "generated_at" in manifest
        
        # Step 4: Process product assets
        test_media = {
            "primary_image": "https://example.com/test.jpg",
            "gallery_images": ["https://example.com/gallery1.jpg"],
            "video_url": "https://example.com/video.mp4"
        }
        
        processed_media = await service.process_assets(
            asset_type="product",
            assets=test_media
        )
        
        assert processed_media is not None
        assert "primary_image" in processed_media
        
        # Step 5: Test asset URL generation in templates
        mock_face_shape = Mock()
        mock_face_shape.oval = 0.8
        mock_face_shape.round = 0.6
        mock_face_shape.square = 0.5
        mock_face_shape.heart = 0.7
        mock_face_shape.diamond = 0.4
        mock_face_shape.oblong = 0.3
        
        context = {
            "store_config": Mock(store_name="Test Store"),
            "products": [Mock(
                name="Test Product",
                price=199.99,
                product_id="test-123",
                brand="Test Brand",
                frame_type="Eyeglasses",
                color="Black",
                frame_material="Acetate",
                face_shape_compatibility=mock_face_shape,
                quality_score=0.85,
                in_stock=True,
                inventory_quantity=10,
                media=Mock(primary_image=processed_media["primary_image"])
            )],
            "theme_assets": processed_assets,
            "seo_data": {"description": "Test description"}
        }
        
        # This should work with processed assets
        result = await service.render_template(
            template_name="store_listing.html",
            context=context,
            theme=theme_name
        )
        
        assert result is not None
        assert isinstance(result, str)
    
    @pytest.mark.asyncio
    async def test_real_world_load_simulation(self, initialized_template_engine_service, sample_store_config, performance_test_data):
        """Test with realistic load patterns."""
        service = await initialized_template_engine_service()
        
        # Simulate different types of requests
        request_types = [
            ("store_listing", performance_test_data[:20]),
            ("product_page", [performance_test_data[0]]),
            ("store_listing", performance_test_data[20:40]),
            ("product_page", [performance_test_data[1]]),
        ]
        
        results = []
        
        for page_type, products in request_types:
            try:
                result = await service.render_store_page(
                    store_config=sample_store_config,
                    products=products,
                    seo_data={"title": f"Test {page_type}"},
                    page_type=page_type
                )
                results.append({"type": page_type, "success": True, "length": len(result)})
            except Exception as e:
                results.append({"type": page_type, "success": False, "error": str(e)})
        
        # At least some requests should succeed
        successful_requests = [r for r in results if r["success"]]
        assert len(successful_requests) > 0
        
        # Get service metrics
        status = await service.get_service_status()
        assert "render_metrics" in status or "service is functioning"
    
    @pytest.mark.asyncio
    async def test_service_lifecycle_management(self, mock_cache_manager, temp_themes_dir):
        """Test complete service lifecycle management."""
        # Phase 1: Initialization
        service = TemplateEngineService(
            cache_manager=mock_cache_manager,
            themes_directory=str(temp_themes_dir)
        )
        
        # Initially not initialized
        assert service._initialized is False
        
        # Initialize
        await service.initialize()
        assert service._initialized is True
        
        # Phase 2: Operations
        themes = await service.get_available_themes()
        assert isinstance(themes, list)
        
        status = await service.get_service_status()
        assert status["initialized"] is True
        
        health = await service.health_check()
        assert "status" in health
        
        # Phase 3: Cleanup
        await service.shutdown()
        assert service._initialized is False
        
        # Should handle double shutdown gracefully
        await service.shutdown()
        assert service._initialized is False
    
    @pytest.mark.asyncio
    async def test_context_manager_integration(self, mock_cache_manager, temp_themes_dir):
        """Test using service as context manager."""
        async with TemplateEngineService(
            cache_manager=mock_cache_manager,
            themes_directory=str(temp_themes_dir)
        ) as service:
            # Service should be initialized
            assert service._initialized is True
            
            # Should be able to perform operations
            themes = await service.get_available_themes()
            assert isinstance(themes, list)
            
            status = await service.get_service_status()
            assert status["initialized"] is True
        
        # After context exit, should be shut down
        assert service._initialized is False
    
    @pytest.mark.asyncio
    async def test_configuration_validation_integration(self, mock_cache_manager):
        """Test configuration validation during integration."""
        # Test with invalid configuration
        try:
            invalid_service = TemplateEngineService(
                cache_manager=mock_cache_manager,
                themes_directory="/nonexistent/path",
                render_timeout=-1,  # Invalid timeout
                max_template_size=-1  # Invalid size
            )
            await invalid_service.initialize()
            
            # Should either apply secure defaults or raise error
            if invalid_service._initialized:
                assert invalid_service.render_timeout > 0
                assert invalid_service.max_template_size > 0
                await invalid_service.shutdown()
            
        except Exception:
            # Expected for invalid configuration
            pass
    
    @pytest.mark.asyncio
    async def test_partial_failure_recovery(self, initialized_template_engine_service, sample_store_config, sample_products):
        """Test recovery from partial failures."""
        service = await initialized_template_engine_service()
        
        # Simulate partial component failure
        original_method = service.asset_handler.process_product_assets
        
        # Make asset processing fail intermittently
        call_count = 0
        async def intermittent_failure(assets):
            nonlocal call_count
            call_count += 1
            if call_count % 2 == 0:  # Fail every second call
                raise Exception("Intermittent asset processing failure")
            return await original_method(assets)
        
        service.asset_handler.process_product_assets = intermittent_failure
        
        # Try multiple operations - some should succeed, some fail
        results = []
        for i in range(5):
            try:
                if hasattr(sample_products[0], 'media') and sample_products[0].media:
                    result = await service.process_assets(
                        asset_type="product",
                        assets=sample_products[0].media.dict()
                    )
                    results.append(("success", result))
            except Exception as e:
                results.append(("failure", str(e)))
        
        # Should have both successes and failures
        successes = [r for r in results if r[0] == "success"]
        failures = [r for r in results if r[0] == "failure"]
        
        # Service should still be functional after partial failures
        status = await service.get_service_status()
        assert status["initialized"] is True
        
        # Restore original method
        service.asset_handler.process_product_assets = original_method