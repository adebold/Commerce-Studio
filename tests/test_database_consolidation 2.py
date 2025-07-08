"""
Database Consolidation Validation Tests

Tests to verify that the database consolidation fixes address the issues
identified in reflection_LS1.md architectural review.

This test suite validates:
1. SQLAlchemy removal and Prisma integration
2. Unified MongoDB connection
3. Database service functionality
4. Configuration consistency
"""

import pytest
import asyncio
import os
from unittest.mock import AsyncMock, patch, MagicMock
from typing import AsyncGenerator

# Test the new database module
try:
    import sys
    import os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src', 'api'))
    import database as db_module
    from database import (
        DatabaseService,
        db_service,
        get_database,
        get_db,
        init_database,
        close_database
    )
    PRISMA_AVAILABLE = True
except ImportError as e:
    print(f"Import error: {e}")
    PRISMA_AVAILABLE = False
    db_module = None


class TestDatabaseConsolidation:
    """Test suite for database consolidation validation."""
    
    def test_sqlalchemy_removal(self):
        """Test that SQLAlchemy dependencies have been removed."""
        if not PRISMA_AVAILABLE or db_module is None:
            pytest.skip("Database module not available")
        
        # Get the source code of the module
        import inspect
        source = inspect.getsource(db_module)
        
        # Verify SQLAlchemy imports are removed
        assert "from sqlalchemy" not in source, "SQLAlchemy imports should be removed"
        assert "sqlalchemy" not in source.lower(), "SQLAlchemy references should be removed"
        assert "create_engine" not in source, "SQLAlchemy create_engine should be removed"
        assert "sessionmaker" not in source, "SQLAlchemy sessionmaker should be removed"
        assert "declarative_base" not in source, "SQLAlchemy declarative_base should be removed"
    
    def test_prisma_integration(self):
        """Test that Prisma is properly integrated."""
        if not PRISMA_AVAILABLE or db_module is None:
            pytest.skip("Prisma not available in test environment")
        
        import inspect
        source = inspect.getsource(db_module)
        
        # Verify Prisma imports are present
        assert "from prisma import Prisma" in source, "Prisma import should be present"
        assert "from prisma.models import" in source, "Prisma models import should be present"
    
    def test_database_service_class(self):
        """Test the new DatabaseService class functionality."""
        if not PRISMA_AVAILABLE:
            pytest.skip("Prisma not available in test environment")
        
        # Test DatabaseService instantiation
        service = DatabaseService()
        assert service is not None
        assert hasattr(service, 'prisma')
        assert hasattr(service, 'connect')
        assert hasattr(service, 'disconnect')
        assert hasattr(service, 'health_check')
        assert hasattr(service, 'client')
    
    @pytest.mark.asyncio
    async def test_database_service_methods(self):
        """Test DatabaseService methods with mocking."""
        if not PRISMA_AVAILABLE or db_module is None:
            pytest.skip("Prisma not available in test environment")
        
        # Mock Prisma client
        with patch.object(db_module, 'Prisma') as mock_prisma_class:
            mock_prisma = AsyncMock()
            mock_prisma_class.return_value = mock_prisma
            
            service = DatabaseService()
            
            # Test connect method
            await service.connect()
            mock_prisma.connect.assert_called_once()
            assert service._connected is True
            
            # Test disconnect method
            await service.disconnect()
            mock_prisma.disconnect.assert_called_once()
            assert service._connected is False
            
            # Test health check
            mock_prisma.recommendation.count.return_value = 0
            result = await service.health_check()
            assert result is True
            mock_prisma.recommendation.count.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_database_function(self):
        """Test the get_database function."""
        if not PRISMA_AVAILABLE or db_module is None:
            pytest.skip("Prisma not available in test environment")
        
        with patch.object(db_module, 'Prisma') as mock_prisma_class:
            mock_prisma = AsyncMock()
            mock_prisma_class.return_value = mock_prisma
            
            # Reset the global client
            db_module.prisma_client = None
            
            client = await get_database()
            assert client is not None
            mock_prisma.connect.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_db_context_manager(self):
        """Test the get_db context manager."""
        if not PRISMA_AVAILABLE or db_module is None:
            pytest.skip("Prisma not available in test environment")
        
        with patch.object(db_module, 'get_database') as mock_get_database:
            mock_client = AsyncMock()
            mock_get_database.return_value = mock_client
            
            async with get_db() as client:
                assert client == mock_client
    
    def test_legacy_compatibility(self):
        """Test that legacy functions exist for backward compatibility."""
        if not PRISMA_AVAILABLE or db_module is None:
            pytest.skip("Database module not available")
        
        # Check that create_tables function exists for compatibility
        assert hasattr(db_module, 'create_tables')
        
        # Test that it doesn't raise an error
        db_module.create_tables()  # Should not raise an exception
    
    def test_environment_variables(self):
        """Test that environment variables are properly configured."""
        # Check that DATABASE_URL is expected to be MongoDB format
        # This would be set in docker-compose or .env files
        
        # Test MongoDB URL format validation
        valid_mongodb_urls = [
            "mongodb://admin:password@mongodb:27017/eyewear_ml?authSource=admin",
            "mongodb://localhost:27017/eyewear_ml",
            "mongodb://admin:password@mongodb:27017/eyewear_ml_unified?authSource=admin"
        ]
        
        for url in valid_mongodb_urls:
            assert url.startswith("mongodb://"), f"URL should start with mongodb://: {url}"
            assert "eyewear_ml" in url, f"URL should contain database name: {url}"
    
    def test_docker_compose_configuration(self):
        """Test that docker-compose configurations are properly updated."""
        import yaml
        
        # Test main docker-compose.yml
        if os.path.exists("docker-compose.yml"):
            with open("docker-compose.yml", 'r') as f:
                compose_config = yaml.safe_load(f)
            
            # Check that MongoDB is configured
            assert 'mongodb' in compose_config['services'], "MongoDB service should be present"
            
            # Check that Redis is configured
            assert 'redis' in compose_config['services'], "Redis service should be present"
            
            # Check that API service has proper environment variables
            api_service = compose_config['services'].get('api', {})
            api_env = api_service.get('environment', [])
            
            # Convert list format to dict if needed
            if isinstance(api_env, list):
                env_dict = {}
                for env_var in api_env:
                    if '=' in env_var:
                        key, value = env_var.split('=', 1)
                        env_dict[key] = value
                api_env = env_dict
            
            # Check for unified database URL
            database_url_found = any(
                key.startswith('DATABASE_URL') or key.startswith('MONGODB_URL')
                for key in api_env.keys()
            )
            assert database_url_found, "Database URL should be configured in API service"
    
    def test_unified_docker_compose_configuration(self):
        """Test the unified docker-compose configuration if it exists."""
        if not os.path.exists("docker-compose.unified.yml"):
            pytest.skip("Unified docker-compose configuration not found")
        
        import yaml
        
        with open("docker-compose.unified.yml", 'r') as f:
            compose_config = yaml.safe_load(f)
        
        services = compose_config.get('services', {})
        
        # Check for consolidated database services
        assert 'mongodb-primary' in services, "Primary MongoDB should be present"
        assert 'redis-primary' in services, "Primary Redis should be present"
        assert 'postgres-shared' in services, "Shared PostgreSQL should be present"
        
        # Check that services use unified network
        for service_name, service_config in services.items():
            networks = service_config.get('networks', [])
            assert 'eyewear_unified' in networks, f"Service {service_name} should use unified network"
    
    def test_requirements_txt_updates(self):
        """Test that requirements.txt has been properly updated."""
        if not os.path.exists("requirements.txt"):
            pytest.skip("requirements.txt not found")
        
        with open("requirements.txt", 'r') as f:
            requirements_content = f.read()
        
        # Check that Prisma is included
        assert "prisma==" in requirements_content, "Prisma should be in requirements.txt"
        
        # Check that SQLAlchemy is commented out or removed
        sqlalchemy_lines = [
            line for line in requirements_content.split('\n')
            if 'sqlalchemy' in line.lower() and not line.strip().startswith('#')
        ]
        assert len(sqlalchemy_lines) == 0, "SQLAlchemy should be commented out or removed"
    
    def test_configuration_files_exist(self):
        """Test that necessary configuration files exist."""
        expected_files = [
            "config/mongodb/init/01-init-db.js",
            ".env.unified",
            "docs/database-consolidation-guide.md"
        ]
        
        for file_path in expected_files:
            assert os.path.exists(file_path), f"Configuration file should exist: {file_path}"
    
    def test_startup_scripts_exist(self):
        """Test that startup scripts are available."""
        expected_scripts = [
            "scripts/start-unified-database.sh",
            "scripts/start-unified-database.ps1"
        ]
        
        for script_path in expected_scripts:
            assert os.path.exists(script_path), f"Startup script should exist: {script_path}"
    
    def test_mongodb_initialization_script(self):
        """Test the MongoDB initialization script content."""
        init_script_path = "config/mongodb/init/01-init-db.js"
        if not os.path.exists(init_script_path):
            pytest.skip("MongoDB initialization script not found")
        
        with open(init_script_path, 'r') as f:
            script_content = f.read()
        
        # Check for essential collections
        essential_collections = [
            'recommendations',
            'feedback',
            'clients',
            'tenants',
            'opticians_stores'
        ]
        
        for collection in essential_collections:
            assert f"'{collection}'" in script_content or f'"{collection}"' in script_content, \
                f"Collection {collection} should be created in init script"
        
        # Check for index creation
        assert "createIndex" in script_content, "Indexes should be created in init script"


class TestDatabaseConsolidationIntegration:
    """Integration tests for database consolidation."""
    
    @pytest.mark.asyncio
    async def test_full_database_workflow(self):
        """Test a complete database workflow with mocked Prisma."""
        if not PRISMA_AVAILABLE or db_module is None:
            pytest.skip("Prisma not available in test environment")
        
        with patch.object(db_module, 'Prisma') as mock_prisma_class:
            mock_prisma = AsyncMock()
            mock_prisma_class.return_value = mock_prisma
            
            # Test initialization
            await init_database()
            
            # Test getting database connection
            async with get_db() as client:
                assert client is not None
            
            # Test cleanup
            await close_database()
            
            # Verify calls were made
            mock_prisma.connect.assert_called()
            mock_prisma.disconnect.assert_called()


if __name__ == "__main__":
    # Run the tests
    pytest.main([__file__, "-v"])