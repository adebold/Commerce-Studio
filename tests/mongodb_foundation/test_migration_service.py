"""
Unit tests for Migration Service
Tests the PostgreSQL to MongoDB migration implementation following TDD principles
"""

import pytest
import asyncio
from datetime import datetime
from unittest.mock import Mock, AsyncMock, patch
from typing import Dict, Any, List

from src.database.migration_service import (
    PostgreSQLToMongoDBMigrator,
    MigrationPhase,
    MigrationStatus,
    MigrationResult,
    DataQualityReport,
    run_migration
)
from .conftest import (
    validate_product_schema,
    validate_brand_schema,
    validate_category_schema
)


class TestMigrationEnums:
    """Test migration enum values."""
    
    def test_migration_phase_values(self):
        """Test that migration phase enum has correct values."""
        assert MigrationPhase.DUAL_WRITE_POSTGRES_PRIMARY == "dual_write_postgres_primary"
        assert MigrationPhase.DUAL_WRITE_MONGODB_PRIMARY == "dual_write_mongodb_primary"
        assert MigrationPhase.MONGODB_ONLY == "mongodb_only"
    
    def test_migration_status_values(self):
        """Test that migration status enum has correct values."""
        assert MigrationStatus.PENDING == "pending"
        assert MigrationStatus.IN_PROGRESS == "in_progress"
        assert MigrationStatus.COMPLETED == "completed"
        assert MigrationStatus.FAILED == "failed"
        assert MigrationStatus.ROLLED_BACK == "rolled_back"


class TestMigrationResult:
    """Test MigrationResult dataclass."""
    
    def test_migration_result_creation(self):
        """Test creating a migration result."""
        result = MigrationResult(
            status=MigrationStatus.COMPLETED,
            records_migrated=100,
            records_failed=5,
            duration_seconds=10.5,
            errors=["Error 1", "Error 2"],
            summary={"collection": "products"}
        )
        
        assert result.status == MigrationStatus.COMPLETED
        assert result.records_migrated == 100
        assert result.records_failed == 5
        assert result.duration_seconds == 10.5
        assert len(result.errors) == 2
        assert result.summary["collection"] == "products"


class TestDataQualityReport:
    """Test DataQualityReport dataclass."""
    
    def test_data_quality_report_creation(self):
        """Test creating a data quality report."""
        issues = [
            {"record_id": "1", "issues": ["Missing field"]},
            {"record_id": "2", "issues": ["Invalid value"]}
        ]
        
        report = DataQualityReport(
            total_records=100,
            valid_records=95,
            invalid_records=5,
            completeness_score=0.95,
            consistency_score=0.98,
            issues=issues
        )
        
        assert report.total_records == 100
        assert report.valid_records == 95
        assert report.invalid_records == 5
        assert report.completeness_score == 0.95
        assert report.consistency_score == 0.98
        assert len(report.issues) == 2


class TestPostgreSQLToMongoDBMigrator:
    """Test PostgreSQL to MongoDB migrator."""
    
    def test_migrator_initialization(self, test_mongodb_client):
        """Test migrator initialization."""
        migrator = PostgreSQLToMongoDBMigrator(test_mongodb_client)
        
        assert migrator.mongodb_client == test_mongodb_client
        assert migrator.current_phase == MigrationPhase.DUAL_WRITE_POSTGRES_PRIMARY
    
    @pytest.mark.asyncio
    async def test_assess_data_quality_no_data(self, migration_service):
        """Test data quality assessment with no PostgreSQL data."""
        migrator = migration_service
        
        # Mock Prisma client to return empty data
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = []
            mock_prisma.return_value = mock_client
            
            report = await migrator.assess_data_quality()
            
            assert isinstance(report, DataQualityReport)
            assert report.total_records == 0
            assert report.valid_records == 0
            assert report.invalid_records == 0
            assert report.completeness_score == 0.0
            assert report.consistency_score == 0.0
            assert len(report.issues) == 0
    
    @pytest.mark.asyncio
    async def test_assess_data_quality_with_data(self, migration_service):
        """Test data quality assessment with mock PostgreSQL data."""
        migrator = migration_service
        
        # Mock PostgreSQL product data
        mock_products = [
            Mock(
                id="1",
                frame_id="FRAME-001",
                store_id="store-1",
                price=99.99,
                stock=10,
                store=Mock(id="store-1", name="Test Store")
            ),
            Mock(
                id="2",
                frame_id=None,  # Missing frame_id (quality issue)
                store_id="store-2",
                price=None,  # Missing price (quality issue)
                stock=-5,  # Negative stock (quality issue)
                store=Mock(id="store-2", name="Test Store 2")
            ),
            Mock(
                id="3",
                frame_id="FRAME-003",
                store_id="store-3",
                price=149.99,
                stock=5,
                store=Mock(id="store-3", name="Test Store 3")
            )
        ]
        
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = mock_products
            mock_prisma.return_value = mock_client
            
            report = await migrator.assess_data_quality()
            
            assert report.total_records == 3
            assert report.valid_records == 1  # Only first product is fully valid
            assert report.invalid_records == 2
            assert report.completeness_score == 1/3  # 1 valid out of 3
            assert report.consistency_score == 1/3  # 1 without issues out of 3
            assert len(report.issues) == 1  # One record with issues (record 2)
    
    @pytest.mark.asyncio
    async def test_migrate_brands_data(self, migration_service, clean_mongodb):
        """Test brands data migration."""
        migrator = migration_service
        
        result = await migrator.migrate_brands_data()
        
        assert isinstance(result, MigrationResult)
        assert result.status == MigrationStatus.COMPLETED
        assert result.records_migrated > 0
        assert result.records_failed == 0
        assert result.duration_seconds > 0
        assert result.summary["collection"] == "brands"
        
        # Verify brands were actually inserted
        brands_count = await migrator.mongodb_client.brands.count_documents({})
        assert brands_count == result.records_migrated
        
        # Verify brand data quality
        cursor = migrator.mongodb_client.brands.find({})
        brands = await cursor.to_list(length=100)
        
        for brand in brands:
            assert validate_brand_schema(brand)
            assert brand["active"] is True
    
    @pytest.mark.asyncio
    async def test_migrate_brands_data_idempotent(self, migration_service, clean_mongodb):
        """Test that brands migration is idempotent."""
        migrator = migration_service
        
        # Run migration twice
        result1 = await migrator.migrate_brands_data()
        result2 = await migrator.migrate_brands_data()
        
        # Second run should not insert duplicates
        assert result1.records_migrated > 0
        assert result2.records_migrated == 0  # No new records migrated
        
        # Total count should equal first migration
        brands_count = await migrator.mongodb_client.brands.count_documents({})
        assert brands_count == result1.records_migrated
    
    @pytest.mark.asyncio
    async def test_migrate_categories_data(self, migration_service, clean_mongodb):
        """Test categories data migration."""
        migrator = migration_service
        
        result = await migrator.migrate_categories_data()
        
        assert isinstance(result, MigrationResult)
        assert result.status == MigrationStatus.COMPLETED
        assert result.records_migrated > 0
        assert result.records_failed == 0
        assert result.summary["collection"] == "categories"
        
        # Verify categories were actually inserted
        categories_count = await migrator.mongodb_client.categories.count_documents({})
        assert categories_count == result.records_migrated
        
        # Verify category data quality
        cursor = migrator.mongodb_client.categories.find({})
        categories = await cursor.to_list(length=100)
        
        for category in categories:
            assert validate_category_schema(category)
            assert category["active"] is True
            assert category["level"] >= 0
    
    @pytest.mark.asyncio
    async def test_migrate_categories_hierarchy(self, migration_service, clean_mongodb):
        """Test that categories maintain proper hierarchy."""
        migrator = migration_service
        
        await migrator.migrate_categories_data()
        
        # Check root categories (level 0)
        root_categories = await migrator.mongodb_client.categories.find({"level": 0}).to_list(length=100)
        assert len(root_categories) > 0
        
        for category in root_categories:
            assert category["parent_id"] is None
            assert category["level"] == 0
    
    @pytest.mark.asyncio
    async def test_migrate_products_data_no_postgresql_data(self, migration_service, clean_mongodb):
        """Test products migration with no PostgreSQL data."""
        migrator = migration_service
        
        # Mock empty PostgreSQL data
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = []
            mock_prisma.return_value = mock_client
            
            result = await migrator.migrate_products_data()
            
            assert result.status == MigrationStatus.COMPLETED
            assert result.records_migrated == 0
            assert result.records_failed == 0
            assert result.summary["total_source_records"] == 0
    
    @pytest.mark.asyncio
    async def test_migrate_products_data_with_mock_data(self, migration_service, sample_brands_data, sample_categories_data):
        """Test products migration with mock PostgreSQL data."""
        migrator = migration_service
        
        # Mock PostgreSQL product data
        mock_products = [
            Mock(
                id="pg-1",
                frame_id="FRAME-001",
                store_id="store-1",
                custom_description="Test Frame 1",
                price=99.99,
                stock=10,
                is_featured=True,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                store=Mock(id="store-1", name="Test Store")
            ),
            Mock(
                id="pg-2",
                frame_id="FRAME-002",
                store_id="store-2",
                custom_description="Test Frame 2",
                price=149.99,
                stock=5,
                is_featured=False,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                store=Mock(id="store-2", name="Test Store 2")
            )
        ]
        
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = mock_products
            mock_prisma.return_value = mock_client
            
            result = await migrator.migrate_products_data()
            
            assert result.status == MigrationStatus.COMPLETED
            assert result.records_migrated > 0
            assert result.summary["total_source_records"] == 2
            
            # Verify products were migrated
            products_count = await migrator.mongodb_client.products.count_documents({})
            assert products_count == result.records_migrated
            
            # Verify product data quality
            cursor = migrator.mongodb_client.products.find({})
            products = await cursor.to_list(length=100)
            
            for product in products:
                assert validate_product_schema(product)
                assert product["source"] == "postgresql_migration"
                assert "source_metadata" in product
    
    @pytest.mark.asyncio
    async def test_transform_product_data(self, migration_service, sample_brands_data, sample_categories_data):
        """Test product data transformation from PostgreSQL to MongoDB schema."""
        migrator = migration_service
        
        # Mock PostgreSQL product
        pg_product = Mock(
            id="pg-test",
            frame_id="TEST-FRAME-001",
            store_id="store-test",
            custom_description="Test Product Description",
            price=199.99,
            stock=15,
            is_featured=True,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Create brand and category mappings
        brands = {brand["name"].lower(): brand for brand in sample_brands_data}
        categories = {cat["name"].lower(): cat for cat in sample_categories_data}
        
        # Transform product data
        mongodb_product = await migrator._transform_product_data(
            pg_product, brands, categories, sample_brands_data[0], sample_categories_data[0]
        )
        
        assert mongodb_product is not None
        assert mongodb_product["sku"] == "TEST-FRAME-001"
        assert mongodb_product["name"] == "Test Product Description"
        assert mongodb_product["price"] == 199.99
        assert mongodb_product["inventory_quantity"] == 15
        assert mongodb_product["featured"] is True
        assert mongodb_product["active"] is True
        assert mongodb_product["source"] == "postgresql_migration"
        
        # Verify schema compliance
        assert validate_product_schema(mongodb_product)
    
    @pytest.mark.asyncio
    async def test_transform_product_data_missing_fields(self, migration_service, sample_brands_data, sample_categories_data):
        """Test product transformation with missing PostgreSQL fields."""
        migrator = migration_service
        
        # Mock PostgreSQL product with missing fields
        pg_product = Mock(
            id="pg-minimal",
            frame_id=None,  # Missing frame_id
            store_id="store-test",
            custom_description=None,  # Missing description
            price=None,  # Missing price
            stock=None,  # Missing stock
            is_featured=None,
            is_active=None,
            created_at=None,
            updated_at=None
        )
        
        brands = {brand["name"].lower(): brand for brand in sample_brands_data}
        categories = {cat["name"].lower(): cat for cat in sample_categories_data}
        
        # Transform should handle missing fields gracefully
        mongodb_product = await migrator._transform_product_data(
            pg_product, brands, categories, sample_brands_data[0], sample_categories_data[0]
        )
        
        assert mongodb_product is not None
        assert mongodb_product["sku"] == "PROD-pg-minimal"  # Generated SKU
        assert mongodb_product["price"] == 99.99  # Default price
        assert mongodb_product["inventory_quantity"] == 0  # Default stock
        assert mongodb_product["featured"] is False  # Default featured
        assert mongodb_product["active"] is True  # Default active
    
    @pytest.mark.asyncio
    async def test_run_full_migration(self, migration_service, clean_mongodb):
        """Test complete migration workflow."""
        migrator = migration_service
        
        # Mock PostgreSQL data for complete migration
        mock_products = [
            Mock(
                id="full-1",
                frame_id="FULL-001",
                store_id="store-full",
                custom_description="Full Migration Test",
                price=299.99,
                stock=20,
                is_featured=True,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                store=Mock(id="store-full", name="Full Test Store")
            )
        ]
        
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = mock_products
            mock_prisma.return_value = mock_client
            
            results = await migrator.run_full_migration()
            
            assert isinstance(results, dict)
            assert "brands" in results
            assert "categories" in results
            assert "products" in results
            
            # Check that all migrations completed successfully
            for collection_name, result in results.items():
                assert isinstance(result, MigrationResult)
                assert result.status == MigrationStatus.COMPLETED
                assert result.records_failed == 0
            
            # Verify data exists in all collections
            brands_count = await migrator.mongodb_client.brands.count_documents({})
            categories_count = await migrator.mongodb_client.categories.count_documents({})
            products_count = await migrator.mongodb_client.products.count_documents({})
            
            assert brands_count > 0
            assert categories_count > 0
            assert products_count > 0


class TestMigrationErrorHandling:
    """Test error handling in migration process."""
    
    @pytest.mark.asyncio
    async def test_migration_with_mongodb_error(self, test_mongodb_client):
        """Test migration handling MongoDB errors."""
        migrator = PostgreSQLToMongoDBMigrator(test_mongodb_client)
        
        # Mock MongoDB client to raise an error
        with patch.object(migrator.mongodb_client.brands, 'insert_one', side_effect=Exception("MongoDB error")):
            result = await migrator.migrate_brands_data()
            
            assert result.status == MigrationStatus.FAILED
            assert "MongoDB error" in result.errors
            assert result.records_migrated == 0
    
    @pytest.mark.asyncio
    async def test_migration_with_postgresql_error(self, migration_service):
        """Test migration handling PostgreSQL errors."""
        migrator = migration_service
        
        # Mock Prisma client to raise an error
        with patch('src.database.migration_service.get_prisma_client', side_effect=Exception("PostgreSQL error")):
            result = await migrator.migrate_products_data()
            
            assert result.status == MigrationStatus.FAILED
            assert "PostgreSQL error" in result.errors
            assert result.records_migrated == 0
    
    @pytest.mark.asyncio
    async def test_partial_migration_failure(self, migration_service, clean_mongodb):
        """Test handling of partial migration failures."""
        migrator = migration_service
        
        # Mock brands collection to fail after first insert
        original_insert_one = migrator.mongodb_client.brands.insert_one
        call_count = 0
        
        async def mock_insert_one(doc):
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return await original_insert_one(doc)
            else:
                raise Exception("Simulated failure")
        
        with patch.object(migrator.mongodb_client.brands, 'insert_one', side_effect=mock_insert_one):
            result = await migrator.migrate_brands_data()
            
            # Should have some successes and some failures
            assert result.records_migrated > 0
            assert result.records_failed > 0
            assert result.status == MigrationStatus.COMPLETED  # Still completes with partial failures
            assert len(result.errors) > 0


class TestMigrationPerformance:
    """Test migration performance characteristics."""
    
    @pytest.mark.asyncio
    async def test_brands_migration_performance(self, migration_service, clean_mongodb):
        """Test brands migration performance."""
        migrator = migration_service
        
        start_time = datetime.utcnow()
        result = await migrator.migrate_brands_data()
        end_time = datetime.utcnow()
        
        duration_seconds = (end_time - start_time).total_seconds()
        
        # Performance assertions
        assert result.duration_seconds > 0
        assert result.duration_seconds < 10  # Should complete in under 10 seconds
        assert abs(result.duration_seconds - duration_seconds) < 1  # Reported time should be accurate
    
    @pytest.mark.asyncio
    async def test_large_dataset_migration_simulation(self, migration_service):
        """Test migration with simulated large dataset."""
        migrator = migration_service
        
        # Create a large number of mock products
        large_dataset_size = 1000
        mock_products = []
        
        for i in range(large_dataset_size):
            mock_products.append(Mock(
                id=f"large-{i}",
                frame_id=f"FRAME-{i:04d}",
                store_id=f"store-{i % 10}",  # 10 different stores
                custom_description=f"Large Dataset Product {i}",
                price=100.0 + (i % 200),  # Prices from 100 to 299
                stock=i % 50,  # Stock from 0 to 49
                is_featured=(i % 10 == 0),  # Every 10th product featured
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                store=Mock(id=f"store-{i % 10}", name=f"Store {i % 10}")
            ))
        
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = mock_products
            mock_prisma.return_value = mock_client
            
            start_time = datetime.utcnow()
            result = await migrator.migrate_products_data()
            end_time = datetime.utcnow()
            
            duration_seconds = (end_time - start_time).total_seconds()
            
            # Performance assertions for large dataset
            assert result.status == MigrationStatus.COMPLETED
            assert result.records_migrated == large_dataset_size
            assert duration_seconds < 60  # Should complete in under 1 minute
            
            # Calculate throughput
            throughput = large_dataset_size / duration_seconds
            assert throughput > 10  # Should process at least 10 records per second


class TestRunMigrationFunction:
    """Test the standalone run_migration function."""
    
    @pytest.mark.asyncio
    async def test_run_migration_function(self, clean_mongodb):
        """Test the run_migration convenience function."""
        # Mock PostgreSQL data
        mock_products = [
            Mock(
                id="func-1",
                frame_id="FUNC-001",
                store_id="store-func",
                custom_description="Function Test Product",
                price=199.99,
                stock=10,
                is_featured=False,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                store=Mock(id="store-func", name="Function Test Store")
            )
        ]
        
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = mock_products
            mock_prisma.return_value = mock_client
            
            results = await run_migration()
            
            assert isinstance(results, dict)
            assert "brands" in results
            assert "categories" in results
            assert "products" in results
            
            # All migrations should complete successfully
            for result in results.values():
                assert result.status == MigrationStatus.COMPLETED