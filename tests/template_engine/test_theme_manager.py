"""
Unit tests for ThemeManager

Comprehensive test suite covering:
- Theme discovery and loading
- Theme validation
- Hot reload functionality
- Cache management
- Error handling
- Theme metadata processing
"""

import pytest
import asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from pathlib import Path
import json
import tempfile
import shutil

from src.store_generation.template_engine.theme_manager import ThemeManager
from src.store_generation.template_engine.exceptions import (
    ThemeNotFoundError,
    TemplateNotFoundError,
    TemplateValidationError
)


class TestThemeManager:
    """Test cases for ThemeManager class."""
    
    def test_theme_manager_initialization(self, temp_themes_dir):
        """Test theme manager initialization."""
        manager = ThemeManager(
            themes_directory=str(temp_themes_dir),
            enable_hot_reload=True,
            cache_timeout=300
        )
        
        assert manager.themes_directory == str(temp_themes_dir)
        assert manager.enable_hot_reload is True
        assert manager.cache_timeout == 300
        assert manager._themes_cache == {}
        assert manager._file_watchers == {}
        assert manager._theme_templates_cache == {}
    
    @pytest.mark.asyncio
    async def test_discover_themes_success(self, theme_manager, sample_theme_structure):
        """Test successful theme discovery."""
        themes = await theme_manager.discover_themes()
        
        assert len(themes) >= 1
        theme_name = sample_theme_structure["theme_name"]
        assert theme_name in themes
        
        theme_info = themes[theme_name]
        assert theme_info["name"] == theme_name
        assert theme_info["version"] == "1.0.0"
        assert theme_info["description"] == "Test theme for unit testing"
        assert theme_info["author"] == "Test Author"
        assert "path" in theme_info
        assert "templates_count" in theme_info
        assert "assets_count" in theme_info
    
    @pytest.mark.asyncio
    async def test_discover_themes_empty_directory(self, temp_themes_dir):
        """Test theme discovery with empty directory."""
        empty_dir = temp_themes_dir / "empty"
        empty_dir.mkdir()
        
        manager = ThemeManager(themes_directory=str(empty_dir))
        themes = await manager.discover_themes()
        
        assert len(themes) == 0
    
    @pytest.mark.asyncio
    async def test_discover_themes_invalid_config(self, temp_themes_dir):
        """Test theme discovery with invalid theme.json."""
        invalid_theme_dir = temp_themes_dir / "invalid-theme"
        invalid_theme_dir.mkdir()
        
        # Create invalid JSON
        (invalid_theme_dir / "theme.json").write_text("{ invalid json }")
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        themes = await manager.discover_themes()
        
        # Invalid theme should be ignored
        assert "invalid-theme" not in themes
    
    @pytest.mark.asyncio
    async def test_get_theme_details_success(self, theme_manager, sample_theme_structure):
        """Test getting theme details for existing theme."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        details = await theme_manager.get_theme_details(theme_name)
        
        assert details["name"] == theme_name
        assert details["version"] == "1.0.0"
        assert details["path"] == str(sample_theme_structure["theme_dir"])
        assert "templates" in details
        assert "assets" in details
        assert len(details["templates"]) > 0
        assert len(details["assets"]) > 0
    
    @pytest.mark.asyncio
    async def test_get_theme_details_not_found(self, theme_manager):
        """Test getting theme details for non-existent theme."""
        await theme_manager.discover_themes()
        
        with pytest.raises(ThemeNotFoundError) as exc_info:
            await theme_manager.get_theme_details("nonexistent-theme")
        
        assert exc_info.value.context["theme_name"] == "nonexistent-theme"
    
    @pytest.mark.asyncio
    async def test_get_available_themes(self, theme_manager, sample_theme_structure):
        """Test getting list of available themes."""
        await theme_manager.discover_themes()
        
        available = await theme_manager.get_available_themes()
        
        assert isinstance(available, list)
        assert sample_theme_structure["theme_name"] in available
    
    @pytest.mark.asyncio
    async def test_validate_theme_success(self, theme_manager, sample_theme_structure):
        """Test successful theme validation."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        validation = await theme_manager.validate_theme(theme_name)
        
        assert validation["is_valid"] is True
        assert validation["theme_name"] == theme_name
        assert len(validation["errors"]) == 0
        assert len(validation["warnings"]) == 0
        assert validation["required_templates_found"] is True
        assert validation["theme_config_valid"] is True
    
    @pytest.mark.asyncio
    async def test_validate_theme_missing_required_templates(self, temp_themes_dir):
        """Test theme validation with missing required templates."""
        # Create theme with missing required templates
        theme_dir = temp_themes_dir / "incomplete-theme"
        theme_dir.mkdir()
        
        # Create theme.json
        theme_config = {"name": "incomplete-theme", "version": "1.0.0"}
        (theme_dir / "theme.json").write_text(json.dumps(theme_config))
        
        # Create templates directory but no base.html
        templates_dir = theme_dir / "templates"
        templates_dir.mkdir()
        (templates_dir / "some_other.html").write_text("<html>Other template</html>")
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        await manager.discover_themes()
        
        validation = await manager.validate_theme("incomplete-theme")
        
        assert validation["is_valid"] is False
        assert validation["required_templates_found"] is False
        assert len(validation["errors"]) > 0
        assert any("base.html" in error for error in validation["errors"])
    
    @pytest.mark.asyncio
    async def test_validate_theme_not_found(self, theme_manager):
        """Test validation of non-existent theme."""
        await theme_manager.discover_themes()
        
        with pytest.raises(ThemeNotFoundError):
            await theme_manager.validate_theme("nonexistent-theme")
    
    @pytest.mark.asyncio
    async def test_get_theme_templates_success(self, theme_manager, sample_theme_structure):
        """Test getting theme templates list."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        templates = await theme_manager.get_theme_templates(theme_name)
        
        assert isinstance(templates, list)
        assert "base.html" in templates
        assert "store_listing.html" in templates
        assert "product_page.html" in templates
        assert "partials/product_card.html" in templates
    
    @pytest.mark.asyncio
    async def test_get_theme_templates_not_found(self, theme_manager):
        """Test getting templates for non-existent theme."""
        await theme_manager.discover_themes()
        
        with pytest.raises(ThemeNotFoundError):
            await theme_manager.get_theme_templates("nonexistent-theme")
    
    @pytest.mark.asyncio
    async def test_get_theme_assets_success(self, theme_manager, sample_theme_structure):
        """Test getting theme assets list."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        assets = await theme_manager.get_theme_assets(theme_name)
        
        assert isinstance(assets, list)
        assert any("css/main.css" in asset for asset in assets)
        assert any("js/main.js" in asset for asset in assets)
        assert any("images/" in asset for asset in assets)
    
    @pytest.mark.asyncio
    async def test_get_theme_template_path_success(self, theme_manager, sample_theme_structure):
        """Test getting template path for existing template."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        template_path = await theme_manager.get_theme_template_path(
            theme_name, "base.html"
        )
        
        assert template_path is not None
        assert template_path.name == "base.html"
        assert template_path.exists()
    
    @pytest.mark.asyncio
    async def test_get_theme_template_path_not_found(self, theme_manager, sample_theme_structure):
        """Test getting template path for non-existent template."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        template_path = await theme_manager.get_theme_template_path(
            theme_name, "nonexistent.html"
        )
        
        assert template_path is None
    
    @pytest.mark.asyncio
    async def test_get_theme_asset_path_success(self, theme_manager, sample_theme_structure):
        """Test getting asset path for existing asset."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        asset_path = await theme_manager.get_theme_asset_path(
            theme_name, "css/main.css"
        )
        
        assert asset_path is not None
        assert asset_path.name == "main.css"
        assert asset_path.exists()
    
    @pytest.mark.asyncio
    async def test_get_theme_asset_path_not_found(self, theme_manager, sample_theme_structure):
        """Test getting asset path for non-existent asset."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        asset_path = await theme_manager.get_theme_asset_path(
            theme_name, "nonexistent.css"
        )
        
        assert asset_path is None
    
    @pytest.mark.asyncio
    async def test_get_theme_config_success(self, theme_manager, sample_theme_structure):
        """Test getting theme configuration."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        config = await theme_manager.get_theme_config(theme_name)
        
        assert config["name"] == theme_name
        assert config["version"] == "1.0.0"
        assert config["description"] == "Test theme for unit testing"
        assert config["author"] == "Test Author"
        assert config["supports_partials"] is True
        assert config["supports_inheritance"] is True
    
    @pytest.mark.asyncio
    async def test_get_theme_config_not_found(self, theme_manager):
        """Test getting config for non-existent theme."""
        await theme_manager.discover_themes()
        
        with pytest.raises(ThemeNotFoundError):
            await theme_manager.get_theme_config("nonexistent-theme")
    
    @pytest.mark.asyncio
    async def test_reload_theme_success(self, theme_manager, sample_theme_structure):
        """Test reloading a theme."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        # Get initial details
        initial_details = await theme_manager.get_theme_details(theme_name)
        
        # Reload theme
        await theme_manager.reload_theme(theme_name)
        
        # Get details again
        reloaded_details = await theme_manager.get_theme_details(theme_name)
        
        # Should have same structure but potentially updated timestamps
        assert reloaded_details["name"] == initial_details["name"]
        assert reloaded_details["version"] == initial_details["version"]
    
    @pytest.mark.asyncio
    async def test_reload_theme_not_found(self, theme_manager):
        """Test reloading non-existent theme."""
        await theme_manager.discover_themes()
        
        with pytest.raises(ThemeNotFoundError):
            await theme_manager.reload_theme("nonexistent-theme")
    
    @pytest.mark.asyncio
    async def test_reload_all_themes(self, theme_manager, sample_theme_structure):
        """Test reloading all themes."""
        await theme_manager.discover_themes()
        
        # Get initial count
        initial_themes = await theme_manager.get_available_themes()
        initial_count = len(initial_themes)
        
        # Reload all
        await theme_manager.reload_all_themes()
        
        # Check themes are still available
        reloaded_themes = await theme_manager.get_available_themes()
        assert len(reloaded_themes) == initial_count
        assert sample_theme_structure["theme_name"] in reloaded_themes
    
    @pytest.mark.asyncio
    async def test_clear_theme_cache_specific(self, theme_manager, sample_theme_structure):
        """Test clearing cache for specific theme."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        # Cache should have theme data
        assert theme_name in theme_manager._themes_cache
        
        await theme_manager.clear_theme_cache(theme_name)
        
        # Specific theme should be cleared
        assert theme_name not in theme_manager._themes_cache
    
    @pytest.mark.asyncio
    async def test_clear_theme_cache_all(self, theme_manager, sample_theme_structure):
        """Test clearing all theme caches."""
        theme_name = sample_theme_structure["theme_name"]
        await theme_manager.discover_themes()
        
        # Cache should have data
        assert len(theme_manager._themes_cache) > 0
        
        await theme_manager.clear_theme_cache()
        
        # All caches should be cleared
        assert len(theme_manager._themes_cache) == 0
        assert len(theme_manager._theme_templates_cache) == 0
    
    def test_is_valid_theme_directory_valid(self, sample_theme_structure):
        """Test validation of valid theme directory."""
        theme_dir = sample_theme_structure["theme_dir"]
        
        manager = ThemeManager(themes_directory="/tmp")
        is_valid = manager._is_valid_theme_directory(theme_dir)
        
        assert is_valid is True
    
    def test_is_valid_theme_directory_missing_config(self, temp_themes_dir):
        """Test validation of theme directory without config."""
        theme_dir = temp_themes_dir / "no-config"
        theme_dir.mkdir()
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        is_valid = manager._is_valid_theme_directory(theme_dir)
        
        assert is_valid is False
    
    def test_is_valid_theme_directory_missing_templates(self, temp_themes_dir):
        """Test validation of theme directory without templates."""
        theme_dir = temp_themes_dir / "no-templates"
        theme_dir.mkdir()
        
        # Create theme.json but no templates directory
        theme_config = {"name": "no-templates", "version": "1.0.0"}
        (theme_dir / "theme.json").write_text(json.dumps(theme_config))
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        is_valid = manager._is_valid_theme_directory(theme_dir)
        
        assert is_valid is False
    
    def test_load_theme_config_success(self, sample_theme_structure):
        """Test loading valid theme configuration."""
        theme_dir = sample_theme_structure["theme_dir"]
        
        manager = ThemeManager(themes_directory="/tmp")
        config = manager._load_theme_config(theme_dir)
        
        assert config is not None
        assert config["name"] == sample_theme_structure["theme_name"]
        assert config["version"] == "1.0.0"
    
    def test_load_theme_config_invalid_json(self, temp_themes_dir):
        """Test loading invalid JSON configuration."""
        theme_dir = temp_themes_dir / "invalid-json"
        theme_dir.mkdir()
        
        # Create invalid JSON
        (theme_dir / "theme.json").write_text("{ invalid }")
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        config = manager._load_theme_config(theme_dir)
        
        assert config is None
    
    def test_load_theme_config_missing_file(self, temp_themes_dir):
        """Test loading configuration from directory without theme.json."""
        theme_dir = temp_themes_dir / "no-config"
        theme_dir.mkdir()
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        config = manager._load_theme_config(theme_dir)
        
        assert config is None
    
    def test_scan_theme_templates(self, sample_theme_structure):
        """Test scanning theme templates."""
        theme_dir = sample_theme_structure["theme_dir"]
        
        manager = ThemeManager(themes_directory="/tmp")
        templates = manager._scan_theme_templates(theme_dir)
        
        assert isinstance(templates, list)
        assert "base.html" in templates
        assert "store_listing.html" in templates
        assert "product_page.html" in templates
        assert "partials/product_card.html" in templates
    
    def test_scan_theme_templates_no_directory(self, temp_themes_dir):
        """Test scanning templates from directory without templates folder."""
        theme_dir = temp_themes_dir / "no-templates"
        theme_dir.mkdir()
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        templates = manager._scan_theme_templates(theme_dir)
        
        assert templates == []
    
    def test_scan_theme_assets(self, sample_theme_structure):
        """Test scanning theme assets."""
        theme_dir = sample_theme_structure["theme_dir"]
        
        manager = ThemeManager(themes_directory="/tmp")
        assets = manager._scan_theme_assets(theme_dir)
        
        assert isinstance(assets, list)
        assert any("css/main.css" in asset for asset in assets)
        assert any("js/main.js" in asset for asset in assets)
        assert any("images/" in asset for asset in assets)
    
    def test_scan_theme_assets_no_directory(self, temp_themes_dir):
        """Test scanning assets from directory without assets folder."""
        theme_dir = temp_themes_dir / "no-assets"
        theme_dir.mkdir()
        
        manager = ThemeManager(themes_directory=str(temp_themes_dir))
        assets = manager._scan_theme_assets(theme_dir)
        
        assert assets == []
    
    def test_validate_theme_config_valid(self, sample_theme_structure):
        """Test validation of valid theme configuration."""
        config = sample_theme_structure["config"]
        
        manager = ThemeManager(themes_directory="/tmp")
        errors, warnings = manager._validate_theme_config(config)
        
        assert len(errors) == 0
        assert len(warnings) == 0
    
    def test_validate_theme_config_missing_required(self):
        """Test validation of theme config missing required fields."""
        config = {
            "version": "1.0.0"
            # Missing required 'name' field
        }
        
        manager = ThemeManager(themes_directory="/tmp")
        errors, warnings = manager._validate_theme_config(config)
        
        assert len(errors) > 0
        assert any("name" in error for error in errors)
    
    def test_validate_theme_config_missing_optional(self):
        """Test validation of theme config missing optional fields."""
        config = {
            "name": "test-theme",
            "version": "1.0.0"
            # Missing optional fields like 'description', 'author'
        }
        
        manager = ThemeManager(themes_directory="/tmp")
        errors, warnings = manager._validate_theme_config(config)
        
        assert len(errors) == 0
        assert len(warnings) > 0
    
    def test_validate_required_templates_success(self, sample_theme_structure):
        """Test validation of required templates when all present."""
        templates = ["base.html", "store_listing.html", "product_page.html"]
        
        manager = ThemeManager(themes_directory="/tmp")
        missing = manager._validate_required_templates(templates)
        
        assert len(missing) == 0
    
    def test_validate_required_templates_missing(self):
        """Test validation of required templates when some missing."""
        templates = ["base.html"]  # Missing store_listing.html and product_page.html
        
        manager = ThemeManager(themes_directory="/tmp")
        missing = manager._validate_required_templates(templates)
        
        assert len(missing) > 0
        assert "store_listing.html" in missing
        assert "product_page.html" in missing
    
    @pytest.mark.asyncio
    async def test_get_theme_statistics(self, theme_manager, sample_theme_structure):
        """Test getting theme statistics."""
        await theme_manager.discover_themes()
        
        stats = await theme_manager.get_theme_statistics()
        
        assert "total_themes" in stats
        assert "themes_cached" in stats
        assert "total_templates" in stats
        assert "total_assets" in stats
        assert "cache_hit_rate" in stats
        assert stats["total_themes"] >= 1
        assert stats["themes_cached"] >= 0
        assert stats["total_templates"] >= 4  # base, store_listing, product_page, product_card
        assert stats["total_assets"] >= 3  # CSS, JS, image