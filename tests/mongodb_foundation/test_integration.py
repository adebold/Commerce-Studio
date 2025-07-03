"""
Integration tests for MongoDB Foundation
Tests end-to-end workflows and cross-component integration following TDD principles
"""

import pytest
import asyncio
from datetime import datetime
from typing import Dict, Any, List
from unittest.mock import Mock, AsyncMock, patch

from src.database.mongodb_client import EyewearMongoDBClient, MongoDBContext
from src.database.migration_service import PostgreSQLToMongoDBMigrator, run_migration
from src.ai.face_shape_analyzer import FaceShapeAnalyzer, get_face_shape_analyzer
from ..conftest import validate_product_schema, validate_brand_schema


class TestMongoDBAIIntegration:
    """Test integration between MongoDB and AI services."""
    
    @pytest.mark.asyncio
    async def test_face_shape_analysis_with_product_recommendations(
        self, 
        test_mongodb_client, 
        sample_products_data, 
        sample_face_image_data,
        mongodb_test_data
    ):
        """Test complete workflow from face analysis to product recommendations."""
        analyzer = get_face_shape_analyzer()
        session_id = mongodb_test_data["test_session_id"]
        user_id = mongodb_test_data["test_user_id"]
        
        # Mock MongoDB context for face shape analyzer
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            # Step 1: Analyze face shape
            analysis_result = await analyzer.analyze_face_image(
                sample_face_image_data, 
                session_id, 
                user_id
            )
            
            assert analysis_result is not None
            detected_face_shape = analysis_result.primary_shape
            
            # Step 2: Get compatible products
            compatible_products = await analyzer.get_compatible_products(
                face_shape=detected_face_shape,
                limit=10,
                min_compatibility=0.7
            )
            
            assert len(compatible_products) > 0
            
            # Step 3: Verify products exist in database
            for product_score in compatible_products:
                from bson import ObjectId
                product = await test_mongodb_client.products.find_one(
                    {"_id": ObjectId(product_score.product_id)}
                )
                assert product is not None
                assert product["active"] is True
                assert product["in_stock"] is True
                
                # Verify compatibility score calculation
                face_compatibility = product["face_shape_compatibility"].get(detected_face_shape, 0.0)
                assert face_compatibility >= 0.7
            
            # Step 4: Verify analysis was stored
            stored_analysis = await test_mongodb_client.face_shape_analysis.find_one({
                "session_id": session_id,
                "user_id": user_id
            })
            assert stored_analysis is not None
            assert stored_analysis["detected_face_shape"]["primary"] == detected_face_shape
    
    @pytest.mark.asyncio
    async def test_product_compatibility_analysis_workflow(
        self, 
        test_mongodb_client, 
        sample_products_data
    ):
        """Test workflow for analyzing product compatibility with all face shapes."""
        analyzer = get_face_shape_analyzer()
        
        # Get a sample product
        product = sample_products_data[0]
        
        # Analyze product compatibility
        compatibility_scores = await analyzer.analyze_product_compatibility(product)
        
        assert isinstance(compatibility_scores, dict)
        assert len(compatibility_scores) == 6  # All face shapes
        
        # Update product in database with new compatibility scores
        await test_mongodb_client.products.update_one(
            {"_id": product["_id"]},
            {"$set": {"face_shape_compatibility": compatibility_scores}}
        )
        
        # Verify update
        updated_product = await test_mongodb_client.products.find_one({"_id": product["_id"]})
        assert updated_product["face_shape_compatibility"] == compatibility_scores
        
        # Test that each face shape can find this product if compatibility is high enough
        for face_shape, score in compatibility_scores.items():
            if score >= 0.8:
                with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
                    mock_context.return_value.__aenter__.return_value = test_mongodb_client
                    
                    compatible_products = await analyzer.get_compatible_products(
                        face_shape=face_shape,
                        min_compatibility=0.8
                    )
                    
                    # Product should be found
                    product_ids = [p.product_id for p in compatible_products]
                    assert str(product["_id"]) in product_ids


class TestMigrationIntegration:
    """Test integration of migration with MongoDB and AI services."""
    
    @pytest.mark.asyncio
    async def test_complete_migration_to_ai_workflow(self, test_mongodb_client, clean_mongodb):
        """Test complete workflow from migration to AI analysis."""
        # Step 1: Run migration
        migrator = PostgreSQLToMongoDBMigrator(test_mongodb_client)
        
        # Mock PostgreSQL data for migration
        mock_products = [
            Mock(
                id="integration-1",
                frame_id="INTEG-001",
                store_id="store-integration",
                custom_description="Integration Test Frame",
                price=299.99,
                stock=15,
                is_featured=True,
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                store=Mock(id="store-integration", name="Integration Store")
            )
        ]
        
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = mock_products
            mock_prisma.return_value = mock_client
            
            migration_results = await migrator.run_full_migration()
            
            # Verify migration completed successfully
            assert all(result.status.value == "completed" for result in migration_results.values())
            assert migration_results["brands"].records_migrated > 0
            assert migration_results["categories"].records_migrated > 0
            assert migration_results["products"].records_migrated > 0
        
        # Step 2: Verify data is available for AI services
        analyzer = get_face_shape_analyzer()
        
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            # Test that AI can find compatible products
            compatible_products = await analyzer.get_compatible_products(
                face_shape="oval",
                min_compatibility=0.7
            )
            
            assert len(compatible_products) > 0
            
            # Verify products come from migration
            for product_score in compatible_products:
                from bson import ObjectId
                product = await test_mongodb_client.products.find_one(
                    {"_id": ObjectId(product_score.product_id)}
                )
                assert product is not None
                assert product["source"] == "postgresql_migration"
    
    @pytest.mark.asyncio
    async def test_migration_data_quality_for_ai(self, test_mongodb_client, clean_mongodb):
        """Test that migrated data meets AI service quality requirements."""
        migrator = PostgreSQLToMongoDBMigrator(test_mongodb_client)
        
        # Run brands and categories migration first
        await migrator.migrate_brands_data()
        await migrator.migrate_categories_data()
        
        # Mock diverse PostgreSQL products for AI testing
        diverse_products = []
        frame_shapes = ["rectangular", "round", "aviator", "cat_eye", "square"]
        
        for i, frame_shape in enumerate(frame_shapes):
            diverse_products.append(Mock(
                id=f"ai-test-{i}",
                frame_id=f"AI-{frame_shape.upper()}-{i:03d}",
                store_id=f"store-ai-{i}",
                custom_description=f"AI Test {frame_shape.title()} Frame",
                price=100.0 + (i * 50),
                stock=10 + i,
                is_featured=(i % 2 == 0),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                store=Mock(id=f"store-ai-{i}", name=f"AI Store {i}")
            ))
        
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = diverse_products
            mock_prisma.return_value = mock_client
            
            result = await migrator.migrate_products_data()
            assert result.status.value == "completed"
            assert result.records_migrated == len(diverse_products)
        
        # Step 2: Verify AI can work with all migrated products
        analyzer = get_face_shape_analyzer()
        
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            # Test compatibility for each face shape
            face_shapes = ["oval", "round", "square", "heart", "diamond", "oblong"]
            
            for face_shape in face_shapes:
                compatible_products = await analyzer.get_compatible_products(
                    face_shape=face_shape,
                    limit=10,
                    min_compatibility=0.5  # Lower threshold to include more products
                )
                
                # Should find some compatible products for each face shape
                assert len(compatible_products) > 0
                
                # Verify all returned products have valid compatibility scores
                for product_score in compatible_products:
                    assert 0.5 <= product_score.compatibility_score <= 1.0
                    assert product_score.frame_shape in frame_shapes


class TestStoreGenerationIntegration:
    """Test integration with store generation functionality."""
    
    @pytest.mark.asyncio
    async def test_mongodb_data_for_store_generation(
        self, 
        test_mongodb_client, 
        sample_brands_data, 
        sample_categories_data, 
        sample_products_data
    ):
        """Test that MongoDB data is suitable for store generation."""
        # Query products with all required fields for store generation
        pipeline = [
            {
                "$match": {
                    "active": True,
                    "in_stock": True
                }
            },
            {
                "$lookup": {
                    "from": "brands",
                    "localField": "brand_id",
                    "foreignField": "_id",
                    "as": "brand_details"
                }
            },
            {
                "$lookup": {
                    "from": "categories",
                    "localField": "category_id",
                    "foreignField": "_id",
                    "as": "category_details"
                }
            },
            {
                "$project": {
                    "sku": 1,
                    "name": 1,
                    "description": 1,
                    "ai_description": 1,
                    "price": 1,
                    "currency": 1,
                    "brand_name": 1,
                    "category_name": 1,
                    "frame_shape": 1,
                    "frame_material": 1,
                    "color": 1,
                    "media": 1,
                    "seo": 1,
                    "rating": 1,
                    "review_count": 1,
                    "featured": 1,
                    "brand_details": 1,
                    "category_details": 1
                }
            }
        ]
        
        cursor = test_mongodb_client.products.aggregate(pipeline)
        enriched_products = await cursor.to_list(length=100)
        
        assert len(enriched_products) > 0
        
        for product in enriched_products:
            # Verify required fields for store generation
            assert "sku" in product
            assert "name" in product
            assert "price" in product
            assert "currency" in product
            assert product["price"] > 0
            
            # Verify brand and category enrichment
            assert len(product["brand_details"]) > 0
            assert len(product["category_details"]) > 0
            
            brand = product["brand_details"][0]
            category = product["category_details"][0]
            
            assert brand["active"] is True
            assert category["active"] is True
            
            # Verify SEO and media fields exist
            assert "seo" in product
            assert "media" in product
    
    @pytest.mark.asyncio
    async def test_face_shape_data_for_personalization(
        self, 
        test_mongodb_client, 
        sample_products_data,
        mongodb_test_data
    ):
        """Test face shape data availability for store personalization."""
        user_id = mongodb_test_data["test_user_id"]
        session_id = mongodb_test_data["test_session_id"]
        
        # Insert test face shape analysis
        analysis_data = {
            "user_id": user_id,
            "session_id": session_id,
            "detected_face_shape": {
                "primary": "oval",
                "confidence": 0.88,
                "secondary": "round",
                "secondary_confidence": 0.72
            },
            "ai_model_version": "face_shape_v1.0",
            "processing_time_ms": 2500.0,
            "created_at": datetime.utcnow()
        }
        
        await test_mongodb_client.face_shape_analysis.insert_one(analysis_data)
        
        # Test personalized product query based on face shape
        detected_face_shape = "oval"
        
        personalized_pipeline = [
            {
                "$match": {
                    "active": True,
                    "in_stock": True,
                    f"face_shape_compatibility.{detected_face_shape}": {"$gte": 0.8}
                }
            },
            {
                "$addFields": {
                    "personalization_score": f"$face_shape_compatibility.{detected_face_shape}"
                }
            },
            {
                "$sort": {
                    "personalization_score": -1,
                    "featured": -1,
                    "rating": -1
                }
            },
            {"$limit": 10}
        ]
        
        cursor = test_mongodb_client.products.aggregate(personalized_pipeline)
        personalized_products = await cursor.to_list(length=10)
        
        assert len(personalized_products) > 0
        
        # Verify personalization scores are sorted correctly
        scores = [p["personalization_score"] for p in personalized_products]
        assert scores == sorted(scores, reverse=True)
        
        # Verify all products have high compatibility
        for product in personalized_products:
            assert product["personalization_score"] >= 0.8


class TestPerformanceIntegration:
    """Test performance characteristics of integrated workflows."""
    
    @pytest.mark.asyncio
    async def test_migration_to_ai_query_performance(self, test_mongodb_client, clean_mongodb):
        """Test performance of migration followed by AI queries."""
        migrator = PostgreSQLToMongoDBMigrator(test_mongodb_client)
        
        # Create larger mock dataset for performance testing
        large_mock_products = []
        for i in range(50):  # 50 products for performance test
            large_mock_products.append(Mock(
                id=f"perf-{i}",
                frame_id=f"PERF-{i:03d}",
                store_id=f"store-perf-{i % 5}",  # 5 stores
                custom_description=f"Performance Test Frame {i}",
                price=100.0 + (i * 10),
                stock=10 + i,
                is_featured=(i % 10 == 0),
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                store=Mock(id=f"store-perf-{i % 5}", name=f"Performance Store {i % 5}")
            ))
        
        # Time the migration
        start_time = datetime.utcnow()
        
        with patch('src.database.migration_service.get_prisma_client') as mock_prisma:
            mock_client = AsyncMock()
            mock_client.opticiansproduct.find_many.return_value = large_mock_products
            mock_prisma.return_value = mock_client
            
            migration_results = await migrator.run_full_migration()
        
        migration_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Verify migration completed quickly
        assert migration_time < 30  # Less than 30 seconds
        assert migration_results["products"].records_migrated == 50
        
        # Time AI queries on migrated data
        analyzer = get_face_shape_analyzer()
        
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            query_start = datetime.utcnow()
            
            # Perform multiple face shape queries
            for face_shape in ["oval", "round", "square"]:
                compatible_products = await analyzer.get_compatible_products(
                    face_shape=face_shape,
                    limit=20
                )
                assert len(compatible_products) > 0
            
            query_time = (datetime.utcnow() - query_start).total_seconds()
            
            # AI queries should be fast on migrated data
            assert query_time < 5  # Less than 5 seconds for all queries
    
    @pytest.mark.asyncio
    async def test_concurrent_ai_operations(self, test_mongodb_client, sample_products_data, sample_face_image_data):
        """Test concurrent AI operations on MongoDB data."""
        analyzer = get_face_shape_analyzer()
        
        # Mock MongoDB context
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            # Prepare concurrent operations
            async def analyze_and_recommend(session_suffix):
                session_id = f"concurrent-session-{session_suffix}"
                user_id = f"concurrent-user-{session_suffix}"
                
                # Face analysis
                analysis_result = await analyzer.analyze_face_image(
                    sample_face_image_data,
                    session_id,
                    user_id
                )
                
                # Product recommendations
                compatible_products = await analyzer.get_compatible_products(
                    face_shape=analysis_result.primary_shape,
                    limit=5
                )
                
                return len(compatible_products)
            
            # Run concurrent operations
            start_time = datetime.utcnow()
            
            tasks = [analyze_and_recommend(i) for i in range(5)]
            results = await asyncio.gather(*tasks)
            
            concurrent_time = (datetime.utcnow() - start_time).total_seconds()
            
            # All operations should complete successfully
            assert all(result > 0 for result in results)
            
            # Concurrent operations should not take much longer than sequential
            assert concurrent_time < 15  # Less than 15 seconds for 5 concurrent operations


class TestDataConsistencyIntegration:
    """Test data consistency across different components."""
    
    @pytest.mark.asyncio
    async def test_referential_integrity_after_migration(self, test_mongodb_client, clean_mongodb):
        """Test that referential integrity is maintained after migration."""
        migrator = PostgreSQLToMongoDBMigrator(test_mongodb_client)
        
        # Run complete migration
        migration_results = await migrator.run_full_migration()
        
        # Verify all migrations completed
        assert all(result.status.value == "completed" for result in migration_results.values())
        
        # Check referential integrity: all products should reference valid brands and categories
        products_cursor = test_mongodb_client.products.find({"active": True})
        products = await products_cursor.to_list(length=1000)
        
        brands_cursor = test_mongodb_client.brands.find({"active": True})
        brands = await brands_cursor.to_list(length=1000)
        brand_ids = {brand["_id"] for brand in brands}
        
        categories_cursor = test_mongodb_client.categories.find({"active": True})
        categories = await categories_cursor.to_list(length=1000)
        category_ids = {category["_id"] for category in categories}
        
        # Verify all product references are valid
        for product in products:
            assert product["brand_id"] in brand_ids, f"Product {product['sku']} references invalid brand"
            assert product["category_id"] in category_ids, f"Product {product['sku']} references invalid category"
            
            # Verify brand_name matches actual brand
            brand = await test_mongodb_client.brands.find_one({"_id": product["brand_id"]})
            assert brand["name"] == product["brand_name"]
            
            # Verify category_name matches actual category
            category = await test_mongodb_client.categories.find_one({"_id": product["category_id"]})
            assert category["name"] == product["category_name"]
    
    @pytest.mark.asyncio
    async def test_face_shape_compatibility_consistency(self, test_mongodb_client, sample_products_data):
        """Test that face shape compatibility scores are consistent across operations."""
        analyzer = get_face_shape_analyzer()
        
        # Get a product and analyze its compatibility
        product = sample_products_data[0]
        original_compatibility = product["face_shape_compatibility"]
        
        # Re-analyze compatibility using AI service
        ai_compatibility = await analyzer.analyze_product_compatibility({
            "frame_shape": product["frame_shape"],
            "measurements": product["measurements"]
        })
        
        # Scores should be reasonably similar (within 0.2)
        for face_shape in original_compatibility:
            if face_shape in ai_compatibility:
                original_score = original_compatibility[face_shape]
                ai_score = ai_compatibility[face_shape]
                score_diff = abs(original_score - ai_score)
                assert score_diff <= 0.2, f"Compatibility score difference too large for {face_shape}: {score_diff}"


class TestErrorRecoveryIntegration:
    """Test error recovery in integrated workflows."""
    
    @pytest.mark.asyncio
    async def test_partial_migration_recovery(self, test_mongodb_client, clean_mongodb):
        """Test recovery from partial migration failures."""
        migrator = PostgreSQLToMongoDBMigrator(test_mongodb_client)
        
        # First, run successful brands migration
        brands_result = await migrator.migrate_brands_data()
        assert brands_result.status.value == "completed"
        
        # Simulate failure in categories migration
        with patch.object(migrator.mongodb_client.categories, 'insert_one', side_effect=Exception("Simulated failure")):
            categories_result = await migrator.migrate_categories_data()
            assert categories_result.status.value == "failed"
        
        # Verify brands migration is still intact
        brands_count = await test_mongodb_client.brands.count_documents({"active": True})
        assert brands_count > 0
        
        # Retry categories migration (should succeed now)
        categories_retry_result = await migrator.migrate_categories_data()
        assert categories_retry_result.status.value == "completed"
        
        # Verify both collections are now populated
        categories_count = await test_mongodb_client.categories.count_documents({"active": True})
        assert categories_count > 0
    
    @pytest.mark.asyncio
    async def test_ai_service_fallback_behavior(self, test_mongodb_client, sample_face_image_data):
        """Test AI service behavior when MongoDB is unavailable."""
        analyzer = get_face_shape_analyzer()
        
        # Test face analysis with MongoDB unavailable
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.side_effect = Exception("MongoDB unavailable")
            
            # Analysis should still work (just without storage)
            result = await analyzer.analyze_face_image(
                sample_face_image_data,
                "fallback-session",
                "fallback-user"
            )
            
            assert result is not None
            assert result.primary_shape in ["oval", "round", "square", "heart", "diamond", "oblong"]
            assert 0.0 <= result.confidence <= 1.0
        
        # Test product compatibility with MongoDB unavailable
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.side_effect = Exception("MongoDB unavailable")
            
            compatible_products = await analyzer.get_compatible_products("oval")
            
            # Should return empty list gracefully
            assert isinstance(compatible_products, list)
            assert len(compatible_products) == 0