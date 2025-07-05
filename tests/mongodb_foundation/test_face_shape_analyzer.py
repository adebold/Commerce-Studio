"""
Unit tests for Face Shape Analyzer
Tests the AI-powered face shape analysis implementation following TDD principles
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch
from typing import Dict, Any, List
import io
from PIL import Image

from src.ai.face_shape_analyzer import (
    FaceShapeAnalyzer,
    FaceShapeAnalysisResult,
    ProductCompatibilityScore,
    get_face_shape_analyzer
)


class TestFaceShapeAnalysisResult:
    """Test FaceShapeAnalysisResult dataclass."""
    
    def test_analysis_result_creation(self):
        """Test creating a face shape analysis result."""
        measurements = {
            "face_width": 120.0,
            "face_height": 140.0,
            "forehead_width": 110.0,
            "cheekbone_width": 115.0,
            "jawline_width": 105.0,
            "width_height_ratio": 0.857
        }
        
        result = FaceShapeAnalysisResult(
            primary_shape="oval",
            confidence=0.85,
            secondary_shape="round",
            secondary_confidence=0.72,
            measurements=measurements,
            processing_time_ms=1500.0,
            model_version="face_shape_v1.0"
        )
        
        assert result.primary_shape == "oval"
        assert result.confidence == 0.85
        assert result.secondary_shape == "round"
        assert result.secondary_confidence == 0.72
        assert result.measurements["face_width"] == 120.0
        assert result.processing_time_ms == 1500.0
        assert result.model_version == "face_shape_v1.0"


class TestProductCompatibilityScore:
    """Test ProductCompatibilityScore dataclass."""
    
    def test_compatibility_score_creation(self):
        """Test creating a product compatibility score."""
        score = ProductCompatibilityScore(
            product_id="product-123",
            compatibility_score=0.92,
            reason="Excellent match! Aviator frames perfectly complement oval face shapes.",
            frame_shape="aviator",
            recommended=True
        )
        
        assert score.product_id == "product-123"
        assert score.compatibility_score == 0.92
        assert "Excellent match" in score.reason
        assert score.frame_shape == "aviator"
        assert score.recommended is True


class TestFaceShapeAnalyzer:
    """Test FaceShapeAnalyzer functionality."""
    
    def test_analyzer_initialization(self):
        """Test analyzer initialization."""
        analyzer = FaceShapeAnalyzer()
        
        assert analyzer.model_version == "face_shape_v1.0"
        assert analyzer.confidence_threshold == 0.6
        assert analyzer.secondary_threshold == 0.4
        assert isinstance(analyzer.compatibility_matrix, dict)
        
        # Check compatibility matrix structure
        face_shapes = ["oval", "round", "square", "heart", "diamond", "oblong"]
        for face_shape in face_shapes:
            assert face_shape in analyzer.compatibility_matrix
            assert isinstance(analyzer.compatibility_matrix[face_shape], dict)
    
    def test_compatibility_matrix_values(self):
        """Test that compatibility matrix has valid values."""
        analyzer = FaceShapeAnalyzer()
        
        for face_shape, frame_compatibility in analyzer.compatibility_matrix.items():
            for frame_shape, score in frame_compatibility.items():
                assert isinstance(score, float)
                assert 0.0 <= score <= 1.0
    
    @pytest.mark.asyncio
    async def test_preprocess_image_valid_jpeg(self, face_shape_analyzer, sample_face_image_data):
        """Test image preprocessing with valid JPEG image."""
        analyzer = face_shape_analyzer
        
        processed = await analyzer._preprocess_image(sample_face_image_data)
        
        assert processed is not None
        assert "image_array" in processed
        assert "face_region" in processed
        assert "original_size" in processed
        assert "processed_size" in processed
        
        # Check face region structure
        face_region = processed["face_region"]
        assert "x" in face_region
        assert "y" in face_region
        assert "width" in face_region
        assert "height" in face_region
        
        # Face region should be within image bounds
        processed_size = processed["processed_size"]
        assert 0 <= face_region["x"] < processed_size[0]
        assert 0 <= face_region["y"] < processed_size[1]
        assert face_region["width"] > 0
        assert face_region["height"] > 0
    
    @pytest.mark.asyncio
    async def test_preprocess_image_invalid_data(self, face_shape_analyzer):
        """Test image preprocessing with invalid image data."""
        analyzer = face_shape_analyzer
        
        invalid_data = b"not_an_image"
        processed = await analyzer._preprocess_image(invalid_data)
        
        assert processed is None
    
    @pytest.mark.asyncio
    async def test_preprocess_image_large_image(self, face_shape_analyzer):
        """Test image preprocessing with large image (should be resized)."""
        analyzer = face_shape_analyzer
        
        # Create a large test image
        large_img = Image.new('RGB', (1024, 768), color=(128, 128, 128))
        img_bytes = io.BytesIO()
        large_img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        processed = await analyzer._preprocess_image(img_bytes.getvalue())
        
        assert processed is not None
        processed_size = processed["processed_size"]
        
        # Image should be resized to max 512px
        assert max(processed_size) <= 512
    
    @pytest.mark.asyncio
    async def test_analyze_face_shape(self, face_shape_analyzer):
        """Test face shape analysis logic."""
        analyzer = face_shape_analyzer
        
        # Mock processed image data
        processed_image = {
            "image_array": None,  # Not used in current implementation
            "face_region": {
                "x": 25,
                "y": 25,
                "width": 100,
                "height": 120
            },
            "original_size": (150, 170),
            "processed_size": (150, 170)
        }
        
        result = await analyzer._analyze_face_shape(processed_image)
        
        assert "primary_shape" in result
        assert "confidence" in result
        assert "measurements" in result
        
        # Validate primary shape
        valid_shapes = ["oval", "round", "square", "heart", "diamond", "oblong"]
        assert result["primary_shape"] in valid_shapes
        
        # Validate confidence
        assert 0.0 <= result["confidence"] <= 1.0
        
        # Validate measurements
        measurements = result["measurements"]
        required_measurements = [
            "face_width", "face_height", "forehead_width", 
            "cheekbone_width", "jawline_width", "width_height_ratio"
        ]
        for measurement in required_measurements:
            assert measurement in measurements
            assert isinstance(measurements[measurement], float)
            assert measurements[measurement] > 0
    
    @pytest.mark.asyncio
    async def test_analyze_face_image_end_to_end(self, face_shape_analyzer, sample_face_image_data, mongodb_test_data):
        """Test complete face image analysis workflow."""
        analyzer = face_shape_analyzer
        session_id = mongodb_test_data["test_session_id"]
        user_id = mongodb_test_data["test_user_id"]
        
        # Mock MongoDB operations
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_client = AsyncMock()
            mock_context.return_value.__aenter__.return_value = mock_client
            
            result = await analyzer.analyze_face_image(
                sample_face_image_data, 
                session_id, 
                user_id
            )
            
            assert isinstance(result, FaceShapeAnalysisResult)
            assert result.primary_shape in mongodb_test_data["face_shapes"]
            assert 0.0 <= result.confidence <= 1.0
            assert result.processing_time_ms > 0
            assert result.model_version == analyzer.model_version
            
            # Verify MongoDB storage was attempted
            mock_client.face_shape_analysis.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_analyze_face_image_invalid_data(self, face_shape_analyzer, mongodb_test_data):
        """Test face image analysis with invalid image data."""
        analyzer = face_shape_analyzer
        session_id = mongodb_test_data["test_session_id"]
        
        invalid_data = b"invalid_image_data"
        
        with pytest.raises(ValueError, match="Invalid image data or face not detected"):
            await analyzer.analyze_face_image(invalid_data, session_id)
    
    @pytest.mark.asyncio
    async def test_store_analysis_result(self, face_shape_analyzer, mongodb_test_data):
        """Test storing analysis result in MongoDB."""
        analyzer = face_shape_analyzer
        
        # Create test result
        measurements = {
            "face_width": 100.0,
            "face_height": 120.0,
            "forehead_width": 95.0,
            "cheekbone_width": 98.0,
            "jawline_width": 90.0,
            "width_height_ratio": 0.833
        }
        
        result = FaceShapeAnalysisResult(
            primary_shape="oval",
            confidence=0.88,
            secondary_shape=None,
            secondary_confidence=None,
            measurements=measurements,
            processing_time_ms=2000.0,
            model_version="face_shape_v1.0"
        )
        
        session_id = mongodb_test_data["test_session_id"]
        user_id = mongodb_test_data["test_user_id"]
        image_data = b"test_image_data"
        
        # Mock MongoDB operations
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_client = AsyncMock()
            mock_context.return_value.__aenter__.return_value = mock_client
            
            await analyzer._store_analysis_result(result, session_id, user_id, image_data)
            
            # Verify insert was called
            mock_client.face_shape_analysis.insert_one.assert_called_once()
            
            # Check the document structure
            call_args = mock_client.face_shape_analysis.insert_one.call_args
            doc = call_args[0][0]
            
            assert doc["session_id"] == session_id
            assert doc["user_id"] == user_id
            assert doc["detected_face_shape"]["primary"] == "oval"
            assert doc["detected_face_shape"]["confidence"] == 0.88
            assert doc["ai_model_version"] == "face_shape_v1.0"
            assert doc["processing_time_ms"] == 2000.0
            assert "created_at" in doc
            assert "expires_at" in doc
    
    @pytest.mark.asyncio
    async def test_get_compatible_products(self, face_shape_analyzer, test_mongodb_client, sample_products_data):
        """Test getting compatible products for face shape."""
        analyzer = face_shape_analyzer
        
        # Mock MongoDB context to return test client
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            compatible_products = await analyzer.get_compatible_products(
                face_shape="oval",
                limit=10,
                min_compatibility=0.7
            )
            
            assert isinstance(compatible_products, list)
            assert len(compatible_products) > 0
            
            for product in compatible_products:
                assert isinstance(product, ProductCompatibilityScore)
                assert product.compatibility_score >= 0.7
                assert product.product_id is not None
                assert product.frame_shape is not None
                assert isinstance(product.reason, str)
                assert len(product.reason) > 0
    
    @pytest.mark.asyncio
    async def test_get_compatible_products_no_matches(self, face_shape_analyzer, test_mongodb_client, clean_mongodb):
        """Test getting compatible products when no matches exist."""
        analyzer = face_shape_analyzer
        
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            # Query with very high compatibility threshold
            compatible_products = await analyzer.get_compatible_products(
                face_shape="oval",
                limit=10,
                min_compatibility=0.99
            )
            
            assert isinstance(compatible_products, list)
            assert len(compatible_products) == 0
    
    def test_generate_compatibility_reason(self, face_shape_analyzer):
        """Test generating compatibility reasons."""
        analyzer = face_shape_analyzer
        
        # Test excellent match
        reason = analyzer._generate_compatibility_reason("oval", "aviator", 0.92)
        assert "Excellent match" in reason
        assert "aviator" in reason.lower()
        assert "oval" in reason
        
        # Test great choice
        reason = analyzer._generate_compatibility_reason("round", "square", 0.85)
        assert "Great choice" in reason
        assert "square" in reason.lower()
        assert "round" in reason
        
        # Test good fit
        reason = analyzer._generate_compatibility_reason("square", "round", 0.75)
        assert "Good fit" in reason
        
        # Test basic compatibility
        reason = analyzer._generate_compatibility_reason("heart", "rectangular", 0.65)
        assert "can work with" in reason
    
    @pytest.mark.asyncio
    async def test_analyze_product_compatibility(self, face_shape_analyzer):
        """Test analyzing product compatibility with face shapes."""
        analyzer = face_shape_analyzer
        
        # Test product data
        product_data = {
            "frame_shape": "aviator",
            "measurements": {
                "lens_width": 58,
                "frame_height": 47
            }
        }
        
        compatibility = await analyzer.analyze_product_compatibility(product_data)
        
        assert isinstance(compatibility, dict)
        
        # Check all face shapes are included
        face_shapes = ["oval", "round", "square", "heart", "diamond", "oblong"]
        for face_shape in face_shapes:
            assert face_shape in compatibility
            assert isinstance(compatibility[face_shape], float)
            assert 0.0 <= compatibility[face_shape] <= 1.0
    
    @pytest.mark.asyncio
    async def test_analyze_product_compatibility_frame_size_adjustments(self, face_shape_analyzer):
        """Test that frame measurements affect compatibility scores."""
        analyzer = face_shape_analyzer
        
        # Large frame (should boost round face compatibility)
        large_frame = {
            "frame_shape": "rectangular",
            "measurements": {
                "lens_width": 60,  # Large lens
                "frame_height": 50  # Tall frame
            }
        }
        
        large_frame_scores = await analyzer.analyze_product_compatibility(large_frame)
        
        # Small frame
        small_frame = {
            "frame_shape": "rectangular",
            "measurements": {
                "lens_width": 50,  # Small lens
                "frame_height": 30  # Short frame
            }
        }
        
        small_frame_scores = await analyzer.analyze_product_compatibility(small_frame)
        
        # Large frames should be better for round faces
        assert large_frame_scores["round"] >= small_frame_scores["round"]
        
        # Small frames should be better for oblong faces
        assert small_frame_scores["oblong"] >= large_frame_scores["oblong"]
    
    @pytest.mark.asyncio
    async def test_get_user_analysis_history(self, face_shape_analyzer, test_mongodb_client, mongodb_test_data):
        """Test getting user analysis history."""
        analyzer = face_shape_analyzer
        user_id = mongodb_test_data["test_user_id"]
        
        # Insert test analysis records
        test_analyses = [
            {
                "user_id": user_id,
                "session_id": "session-1",
                "detected_face_shape": {
                    "primary": "oval",
                    "confidence": 0.85
                },
                "created_at": datetime.utcnow() - timedelta(days=1)
            },
            {
                "user_id": user_id,
                "session_id": "session-2",
                "detected_face_shape": {
                    "primary": "round",
                    "confidence": 0.78
                },
                "created_at": datetime.utcnow()
            }
        ]
        
        await test_mongodb_client.face_shape_analysis.insert_many(test_analyses)
        
        # Mock MongoDB context
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            history = await analyzer.get_user_analysis_history(user_id, limit=10)
            
            assert isinstance(history, list)
            assert len(history) == 2
            
            # Should be sorted by created_at descending (newest first)
            assert history[0]["session_id"] == "session-2"
            assert history[1]["session_id"] == "session-1"
            
            # Check that image_url is excluded
            for analysis in history:
                assert "image_url" not in analysis
                assert "_id" in analysis
                assert isinstance(analysis["_id"], str)  # ObjectId converted to string
    
    @pytest.mark.asyncio
    async def test_get_user_analysis_history_no_data(self, face_shape_analyzer, test_mongodb_client, clean_mongodb):
        """Test getting user analysis history with no data."""
        analyzer = face_shape_analyzer
        
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            history = await analyzer.get_user_analysis_history("nonexistent-user")
            
            assert isinstance(history, list)
            assert len(history) == 0


class TestFaceShapeAnalyzerErrorHandling:
    """Test error handling in face shape analyzer."""
    
    @pytest.mark.asyncio
    async def test_mongodb_connection_error(self, face_shape_analyzer, sample_face_image_data):
        """Test handling MongoDB connection errors."""
        analyzer = face_shape_analyzer
        
        # Mock MongoDB context to raise an error
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.side_effect = Exception("MongoDB connection failed")
            
            # Analysis should still work, just without storage
            result = await analyzer.analyze_face_image(
                sample_face_image_data,
                "test-session",
                "test-user"
            )
            
            assert isinstance(result, FaceShapeAnalysisResult)
            # Storage failure should not affect analysis
    
    @pytest.mark.asyncio
    async def test_get_compatible_products_error(self, face_shape_analyzer):
        """Test handling errors in get_compatible_products."""
        analyzer = face_shape_analyzer
        
        # Mock MongoDB context to raise an error
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.side_effect = Exception("Database error")
            
            result = await analyzer.get_compatible_products("oval")
            
            # Should return empty list on error
            assert isinstance(result, list)
            assert len(result) == 0
    
    @pytest.mark.asyncio
    async def test_analyze_product_compatibility_error(self, face_shape_analyzer):
        """Test handling errors in analyze_product_compatibility."""
        analyzer = face_shape_analyzer
        
        # Test with invalid product data
        invalid_product = {
            "frame_shape": None,
            "measurements": None
        }
        
        compatibility = await analyzer.analyze_product_compatibility(invalid_product)
        
        # Should return default scores
        assert isinstance(compatibility, dict)
        face_shapes = ["oval", "round", "square", "heart", "diamond", "oblong"]
        for face_shape in face_shapes:
            assert face_shape in compatibility
            assert 0.0 <= compatibility[face_shape] <= 1.0


class TestGlobalAnalyzerInstance:
    """Test global analyzer instance management."""
    
    def test_get_face_shape_analyzer_singleton(self):
        """Test that get_face_shape_analyzer returns singleton instance."""
        analyzer1 = get_face_shape_analyzer()
        analyzer2 = get_face_shape_analyzer()
        
        assert analyzer1 is analyzer2
        assert isinstance(analyzer1, FaceShapeAnalyzer)
    
    def test_analyzer_instance_properties(self):
        """Test that global analyzer instance has correct properties."""
        analyzer = get_face_shape_analyzer()
        
        assert analyzer.model_version == "face_shape_v1.0"
        assert analyzer.confidence_threshold == 0.6
        assert analyzer.secondary_threshold == 0.4
        assert len(analyzer.compatibility_matrix) == 6  # 6 face shapes


class TestFaceShapeAnalyzerPerformance:
    """Test performance characteristics of face shape analyzer."""
    
    @pytest.mark.asyncio
    async def test_analysis_performance(self, face_shape_analyzer, sample_face_image_data):
        """Test that face shape analysis completes within reasonable time."""
        analyzer = face_shape_analyzer
        
        # Mock MongoDB operations to isolate analysis performance
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_client = AsyncMock()
            mock_context.return_value.__aenter__.return_value = mock_client
            
            start_time = datetime.utcnow()
            result = await analyzer.analyze_face_image(
                sample_face_image_data,
                "perf-test-session",
                "perf-test-user"
            )
            end_time = datetime.utcnow()
            
            analysis_duration = (end_time - start_time).total_seconds() * 1000
            
            # Analysis should complete quickly
            assert analysis_duration < 5000  # Less than 5 seconds
            assert result.processing_time_ms > 0
            assert result.processing_time_ms < 10000  # Less than 10 seconds reported
    
    @pytest.mark.asyncio
    async def test_compatibility_query_performance(self, face_shape_analyzer, test_mongodb_client, sample_products_data):
        """Test performance of compatibility queries."""
        analyzer = face_shape_analyzer
        
        with patch('src.ai.face_shape_analyzer.MongoDBContext') as mock_context:
            mock_context.return_value.__aenter__.return_value = test_mongodb_client
            
            start_time = datetime.utcnow()
            compatible_products = await analyzer.get_compatible_products(
                face_shape="oval",
                limit=20
            )
            end_time = datetime.utcnow()
            
            query_duration = (end_time - start_time).total_seconds() * 1000
            
            # Query should complete quickly
            assert query_duration < 2000  # Less than 2 seconds
            assert isinstance(compatible_products, list)