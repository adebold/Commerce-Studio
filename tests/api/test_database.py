import os
import pytest
import asyncio
from unittest.mock import patch, MagicMock
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from src.api.core.config_new import Settings, DatabaseSettings

class TestDatabaseConnection:
    """Test suite for database connection validation."""
    
    @pytest.fixture
    def mock_env_vars(self):
        """Fixture to set up environment variables for testing."""
        with patch.dict(os.environ, {
            "MONGODB_URL": "mongodb://localhost:27017/test",
            "DATABASE_NAME": "test_db",
            "SECRET_KEY": "test-secret-key"
        }):
            yield
    
    @pytest.fixture
    def settings(self, mock_env_vars):
        """Fixture to get settings instance."""
        return Settings()
    
    @pytest.mark.asyncio
    async def test_database_url_validation(self, settings):
        """Test that database URL is properly validated."""
        # RED: This will fail if DB URL validation is improper
        db_settings = settings.database
        assert db_settings.MONGODB_URL == "mongodb://localhost:27017/test"
        assert db_settings.DATABASE_NAME == "test_db"
        
        # Test invalid URL
        with pytest.raises(ValueError):
            with patch.dict(os.environ, {"MONGODB_URL": "invalid-url"}):
                DatabaseSettings()
    
    @pytest.mark.asyncio
    async def test_database_connection(self, settings):
        """Test actual database connection."""
        # RED: This will fail if database connection fails
        db_settings = settings.database
        
        # Mock successful connection
        mock_client = MagicMock(spec=AsyncIOMotorClient)
        mock_client.admin.command.return_value = {"ok": 1}
        
        with patch("motor.motor_asyncio.AsyncIOMotorClient", return_value=mock_client):
            client = AsyncIOMotorClient(db_settings.MONGODB_URL)
            # Check if connection is successful
            result = await client.admin.command("ping")
            assert result["ok"] == 1
    
    @pytest.mark.asyncio
    async def test_database_connection_failure(self):
        """Test database connection failure scenarios."""
        # RED: Test handling of connection failures
        
        # Mock connection failure
        mock_client = MagicMock(spec=AsyncIOMotorClient)
        mock_client.admin.command.side_effect = ConnectionFailure("Connection failed")
        
        with patch("motor.motor_asyncio.AsyncIOMotorClient", return_value=mock_client):
            client = AsyncIOMotorClient("mongodb://localhost:27017/test")
            with pytest.raises(ConnectionFailure):
                await client.admin.command("ping")
    
    @pytest.mark.asyncio
    async def test_database_timeout(self):
        """Test database connection timeout handling."""
        # RED: Test handling of timeouts
        
        # Mock timeout
        mock_client = MagicMock(spec=AsyncIOMotorClient)
        mock_client.admin.command.side_effect = ServerSelectionTimeoutError("Timed out")
        
        with patch("motor.motor_asyncio.AsyncIOMotorClient", return_value=mock_client):
            client = AsyncIOMotorClient("mongodb://localhost:27017/test", 
                                       serverSelectionTimeoutMS=100)
            with pytest.raises(ServerSelectionTimeoutError):
                await client.admin.command("ping")
    
    @pytest.mark.asyncio
    async def test_database_authentication(self):
        """Test database authentication."""
        # RED: Test authentication handling
        
        # Set up authenticated URL
        auth_url = "mongodb://testuser:testpass@localhost:27017/test"
        
        # Mock successful authenticated connection
        mock_client = MagicMock(spec=AsyncIOMotorClient)
        mock_client.admin.command.return_value = {"ok": 1}
        
        with patch.dict(os.environ, {"MONGODB_URL": auth_url}):
            with patch("motor.motor_asyncio.AsyncIOMotorClient", return_value=mock_client):
                settings = Settings()
                client = AsyncIOMotorClient(settings.database.MONGODB_URL)
                result = await client.admin.command("ping")
                assert result["ok"] == 1
                
                # Verify credentials were used
                args, _ = AsyncIOMotorClient.call_args
                assert "testuser:testpass" in args[0]