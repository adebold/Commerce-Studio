"""
Test suite for manufacturer integration with eyewear ML tools.
Addresses ML integration requirements from prompts_LS6.md.

This test suite ensures:
1. Real ML service integration (not mock)
2. Face shape compatibility analysis for manufacturer products
3. Style matching and recommendation engine integration
4. Virtual try-on model generation and fitting
5. Performance optimization for ML operations at scale
"""

import pytest
import asyncio
import time
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.ml.face_shape_analyzer import FaceShapeAnalyzer
    from src.ml.style_matching_service import StyleMatchingService
    from src.ml.virtual_try_on_service import VirtualTryOnService
    from src.ml.product_compatibility_analyzer import ProductCompatibilityAnalyzer
    from src.ml.ml_service_manager import MLServiceManager
    from src.repository.manufacturer_product_manager import ManufacturerProductManager
    from src.models.product import Product, ProductDimensions
    from src.models.ml_analysis import MLAnalysisResult, FaceShapeCompatibility, StyleAnalysis
    from src.models.virtual_try_on import VTOModel, FittingResult
except ImportError as e:
    pytest.skip(f"ML integration modules not implemented: {e}", allow_module_level=True)


@dataclass
class ProductDimensions:
    """Product dimensions for ML analysis"""
    lens_width: float
    bridge_width: float
    temple_length: float
    frame_width: float
    frame_height: float


@dataclass
class FaceShapeCompatibility:
    """Face shape compatibility scores"""
    oval: float
    round: float
    square: float
    heart: float
    diamond: float
    oblong: float


@dataclass
class StyleAnalysis:
    """Style analysis results"""
    style_score: float
    target_demographics: List[str]
    occasion_suitability: Dict[str, float]
    style_tags: List[str]
    trend_alignment: float


@dataclass
class MLAnalysisResult:
    """Complete ML analysis result for a product"""
    product_id: str
    face_shape_compatibility: FaceShapeCompatibility
    style_analysis: StyleAnalysis
    virtual_try_on_ready: bool
    confidence_score: float
    analysis_timestamp: datetime


@dataclass
class VTOModel:
    """Virtual try-on model data"""
    model_id: str
    product_id: str
    calibration_points: List[Tuple[float, float, float]]
    texture_mapping: Dict[str, str]
    geometry_data: Dict[str, Any]
    optimization_level: str


@dataclass
class FittingResult:
    """Virtual try-on fitting result"""
    fit_score: float
    adjustment_recommendations: List[str]
    comfort_prediction: float
    aesthetic_score: float
    size_recommendation: str


@pytest.fixture
async def real_ml_service():
    """
    Real MLServiceManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    ml_service = MLServiceManager()
    await ml_service.initialize()
    await ml_service.load_models()
    return ml_service


@pytest.fixture
async def real_face_shape_analyzer():
    """
    Real FaceShapeAnalyzer - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    analyzer = FaceShapeAnalyzer()
    await analyzer.initialize()
    await analyzer.load_face_shape_models()
    return analyzer


@pytest.fixture
async def real_style_service():
    """
    Real StyleMatchingService - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    style_service = StyleMatchingService()
    await style_service.initialize()
    await style_service.load_style_models()
    return style_service


@pytest.fixture
async def real_vto_service():
    """
    Real VirtualTryOnService - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    vto_service = VirtualTryOnService()
    await vto_service.initialize()
    await vto_service.load_3d_models()
    return vto_service


@pytest.fixture
async def real_product_manager():
    """
    Real ManufacturerProductManager for ML integration testing
    """
    # This should use the same fixture from performance tests
    from tests.manufacturer_role.test_product_repository_performance import real_product_manager
    return real_product_manager


class TestManufacturerMLIntegration:
    """Test suite for manufacturer integration with eyewear ML tools"""
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_face_shape_compatibility_integration(self, real_ml_service, real_product_manager):
        """
        Test integration between manufacturer products and face shape ML tools.
        
        This test ensures:
        - Real ML analysis (not hardcoded results)
        - Accurate face shape compatibility scoring
        - Performance optimization for batch processing
        """
        manufacturer_id = "mfg_ml_test_001"
        
        # Create manufacturer
        await real_product_manager.create_manufacturer(manufacturer_id, {
            "company_name": "ML Test Eyewear Co",
            "email": "ml@test.com",
            "tier": "paid"
        })
        
        # Create test product with realistic dimensions
        product_data = {
            "sku": "ML-TEST-001",
            "name": "Test Aviator Sunglasses",
            "manufacturer_id": manufacturer_id,
            "dimensions": ProductDimensions(
                lens_width=58.0,
                bridge_width=14.0,
                temple_length=140.0,
                frame_width=130.0,
                frame_height=45.0
            ),
            "frame_shape": "aviator",
            "frame_material": "metal",
            "lens_material": "polycarbonate",
            "category": "sunglasses"
        }
        
        created_product = await real_product_manager.create_product(product_data)
        
        # Test ML analysis integration with real algorithms
        start_time = time.perf_counter()
        ml_analysis = await real_ml_service.analyze_product_compatibility(created_product.id)
        analysis_time = time.perf_counter() - start_time
        
        # Verify ML analysis results structure and quality
        assert ml_analysis is not None
        assert isinstance(ml_analysis, MLAnalysisResult)
        assert ml_analysis.product_id == created_product.id
        assert ml_analysis.confidence_score > 0.7, f"ML confidence too low: {ml_analysis.confidence_score}"
        
        # Performance assertion for real ML processing
        assert analysis_time < 2.0, f"ML analysis took {analysis_time:.3f}s, expected < 2s"
        
        # Verify face shape compatibility scores are realistic
        face_compat = ml_analysis.face_shape_compatibility
        assert isinstance(face_compat, FaceShapeCompatibility)
        
        # Aviator frames should score well for oval and square faces
        assert face_compat.oval > 0.7, f"Aviators should suit oval faces, got {face_compat.oval}"
        assert face_compat.square > 0.6, f"Aviators should suit square faces, got {face_compat.square}"
        
        # All scores should be between 0 and 1
        all_scores = [face_compat.oval, face_compat.round, face_compat.square, 
                     face_compat.heart, face_compat.diamond, face_compat.oblong]
        assert all(0.0 <= score <= 1.0 for score in all_scores), "Face shape scores must be between 0 and 1"
        
        # Scores should sum to a reasonable total (not all zeros or all ones)
        total_score = sum(all_scores)
        assert 2.0 <= total_score <= 5.0, f"Total face shape scores seem unrealistic: {total_score}"
        
        # Test batch ML processing for manufacturer
        additional_products = []
        for i in range(5):
            product = {
                "sku": f"ML-BATCH-{i:03d}",
                "name": f"Batch Test Product {i}",
                "manufacturer_id": manufacturer_id,
                "dimensions": ProductDimensions(
                    lens_width=50.0 + i * 2,
                    bridge_width=16.0 + i,
                    temple_length=135.0 + i * 5,
                    frame_width=125.0 + i * 3,
                    frame_height=35.0 + i * 2
                ),
                "frame_shape": ["round", "square", "cat_eye", "wayfarer", "rectangle"][i],
                "frame_material": "acetate",
                "category": "eyeglasses"
            }
            created = await real_product_manager.create_product(product)
            additional_products.append(created)
        
        # Test batch analysis performance
        start_time = time.perf_counter()
        batch_analysis = await real_ml_service.batch_analyze_manufacturer_products(manufacturer_id)
        batch_time = time.perf_counter() - start_time
        
        # Verify batch processing results
        total_products = len(additional_products) + 1  # +1 for the first product
        assert len(batch_analysis) == total_products
        assert batch_time < 10.0, f"Batch analysis took {batch_time:.3f}s for {total_products} products"
        
        # Verify all products have valid analysis
        for product_id, analysis in batch_analysis.items():
            assert isinstance(analysis, MLAnalysisResult)
            assert analysis.confidence_score > 0.5
            assert "face_shape_compatibility" in analysis.__dict__
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_style_matching_integration(self, real_style_service, real_product_manager):
        """
        Test integration with style matching ML tools.
        
        This test ensures:
        - Real style analysis algorithms
        - Accurate demographic targeting
        - Style-based recommendation generation
        """
        manufacturer_id = "mfg_style_test_001"
        
        # Create manufacturer
        await real_product_manager.create_manufacturer(manufacturer_id, {
            "company_name": "Style Test Eyewear Co",
            "email": "style@test.com",
            "tier": "paid"
        })
        
        # Create diverse product portfolio for style testing
        style_test_products = [
            {
                "sku": "STYLE-001",
                "name": "Classic Wayfarer",
                "style_tags": ["classic", "casual", "retro"],
                "frame_shape": "wayfarer",
                "frame_material": "acetate",
                "color": "black",
                "manufacturer_id": manufacturer_id,
                "target_age_range": "25-45",
                "gender_target": "unisex"
            },
            {
                "sku": "STYLE-002", 
                "name": "Modern Cat Eye",
                "style_tags": ["modern", "feminine", "bold"],
                "frame_shape": "cat_eye",
                "frame_material": "metal",
                "color": "rose_gold",
                "manufacturer_id": manufacturer_id,
                "target_age_range": "20-35",
                "gender_target": "female"
            },
            {
                "sku": "STYLE-003",
                "name": "Professional Rectangle",
                "style_tags": ["professional", "minimal", "business"],
                "frame_shape": "rectangle",
                "frame_material": "titanium",
                "color": "gunmetal",
                "manufacturer_id": manufacturer_id,
                "target_age_range": "30-50",
                "gender_target": "unisex"
            },
            {
                "sku": "STYLE-004",
                "name": "Trendy Round",
                "style_tags": ["trendy", "artistic", "vintage"],
                "frame_shape": "round",
                "frame_material": "acetate",
                "color": "tortoiseshell",
                "manufacturer_id": manufacturer_id,
                "target_age_range": "18-30",
                "gender_target": "unisex"
            }
        ]
        
        created_products = []
        for product_data in style_test_products:
            created_product = await real_product_manager.create_product(product_data)
            created_products.append(created_product)
        
        # Test style analysis for each product
        style_analyses = []
        for product in created_products:
            start_time = time.perf_counter()
            style_analysis = await real_style_service.analyze_product_style(product.id)
            analysis_time = time.perf_counter() - start_time
            
            # Verify analysis structure and quality
            assert style_analysis is not None
            assert isinstance(style_analysis, StyleAnalysis)
            assert style_analysis.style_score > 0.5, f"Style score too low for {product.sku}"
            assert len(style_analysis.target_demographics) > 0
            assert len(style_analysis.occasion_suitability) > 0
            assert style_analysis.trend_alignment >= 0.0
            
            # Performance assertion
            assert analysis_time < 1.0, f"Style analysis took {analysis_time:.3f}s for {product.sku}"
            
            # Verify demographic targeting makes sense
            if "feminine" in product.style_tags:
                assert "female" in style_analysis.target_demographics or "women" in str(style_analysis.target_demographics).lower()
            
            if "professional" in product.style_tags:
                assert style_analysis.occasion_suitability.get("business", 0) > 0.7
            
            if "trendy" in product.style_tags:
                assert style_analysis.trend_alignment > 0.6
            
            style_analyses.append(style_analysis)
        
        # Test style-based recommendations
        user_style_profiles = [
            {
                "preferred_styles": ["classic", "professional"],
                "face_shape": "oval",
                "age_range": "25-35",
                "gender": "unisex",
                "lifestyle": "business_professional"
            },
            {
                "preferred_styles": ["modern", "trendy"],
                "face_shape": "round",
                "age_range": "20-30",
                "gender": "female",
                "lifestyle": "fashion_forward"
            },
            {
                "preferred_styles": ["vintage", "artistic"],
                "face_shape": "square",
                "age_range": "25-40",
                "gender": "unisex",
                "lifestyle": "creative_professional"
            }
        ]
        
        for profile in user_style_profiles:
            start_time = time.perf_counter()
            recommendations = await real_style_service.get_style_recommendations(
                user_style_profile=profile,
                manufacturer_filter=manufacturer_id,
                max_recommendations=10
            )
            recommendation_time = time.perf_counter() - start_time
            
            # Verify recommendations quality
            assert len(recommendations) > 0, f"No recommendations for profile: {profile}"
            assert recommendation_time < 0.5, f"Recommendation generation took {recommendation_time:.3f}s"
            
            # Verify recommendations match profile preferences
            for rec in recommendations:
                assert rec["manufacturer_id"] == manufacturer_id
                assert "style_match_score" in rec
                assert rec["style_match_score"] > 0.5
                
                # Check style alignment
                rec_product = next(p for p in created_products if p.sku == rec["sku"])
                common_styles = set(profile["preferred_styles"]) & set(rec_product.style_tags)
                if len(common_styles) > 0:
                    assert rec["style_match_score"] > 0.7, f"High style match expected for {rec['sku']}"
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_virtual_try_on_integration(self, real_vto_service, real_product_manager):
        """
        Test integration with virtual try-on ML tools.
        
        This test ensures:
        - Real 3D model generation
        - Accurate fitting simulation
        - Performance optimization for VTO operations
        """
        manufacturer_id = "mfg_vto_test_001"
        
        # Create manufacturer
        await real_product_manager.create_manufacturer(manufacturer_id, {
            "company_name": "VTO Test Eyewear Co",
            "email": "vto@test.com",
            "tier": "paid"
        })
        
        # Create product with VTO-compatible data
        vto_product_data = {
            "sku": "VTO-TEST-001",
            "name": "VTO Test Glasses",
            "manufacturer_id": manufacturer_id,
            "dimensions": ProductDimensions(
                lens_width=52.0,
                bridge_width=18.0,
                temple_length=145.0,
                frame_width=135.0,
                frame_height=40.0
            ),
            "frame_shape": "round",
            "frame_color": "black",
            "lens_color": "clear",
            "frame_material": "acetate",
            "3d_model_data": {
                "mesh_url": "https://example.com/models/vto-test-001.obj",
                "texture_url": "https://example.com/textures/vto-test-001.jpg",
                "material_properties": {
                    "reflectivity": 0.3,
                    "transparency": 0.0,
                    "roughness": 0.7
                }
            }
        }
        
        created_product = await real_product_manager.create_product(vto_product_data)
        
        # Test VTO model generation with real 3D processing
        start_time = time.perf_counter()
        vto_model = await real_vto_service.generate_vto_model(created_product.id)
        generation_time = time.perf_counter() - start_time
        
        # Verify VTO model structure and quality
        assert vto_model is not None
        assert isinstance(vto_model, VTOModel)
        assert vto_model.model_id is not None
        assert vto_model.product_id == created_product.id
        assert len(vto_model.calibration_points) >= 8, "Minimum 8 calibration points required for accurate fitting"
        assert "geometry_data" in vto_model.__dict__
        assert vto_model.optimization_level in ["low", "medium", "high"]
        
        # Performance assertion for 3D model generation
        assert generation_time < 5.0, f"VTO model generation took {generation_time:.3f}s, expected < 5s"
        
        # Verify calibration points are valid 3D coordinates
        for point in vto_model.calibration_points:
            assert len(point) == 3, "Calibration points must be 3D coordinates"
            assert all(isinstance(coord, (int, float)) for coord in point), "Coordinates must be numeric"
        
        # Test VTO fitting simulation with realistic face data
        face_data_samples = [
            {
                "face_width": 140.0,
                "face_height": 180.0,
                "interpupillary_distance": 62.0,
                "nose_bridge_width": 16.0,
                "temple_width": 135.0,
                "face_shape": "oval"
            },
            {
                "face_width": 155.0,
                "face_height": 175.0,
                "interpupillary_distance": 65.0,
                "nose_bridge_width": 18.0,
                "temple_width": 140.0,
                "face_shape": "round"
            },
            {
                "face_width": 145.0,
                "face_height": 190.0,
                "interpupillary_distance": 60.0,
                "nose_bridge_width": 15.0,
                "temple_width": 130.0,
                "face_shape": "square"
            }
        ]
        
        fitting_results = []
        for face_data in face_data_samples:
            start_time = time.perf_counter()
            fitting_result = await real_vto_service.simulate_fitting(
                vto_model.model_id,
                face_data
            )
            fitting_time = time.perf_counter() - start_time
            
            # Verify fitting result structure and quality
            assert fitting_result is not None
            assert isinstance(fitting_result, FittingResult)
            assert 0.0 <= fitting_result.fit_score <= 1.0, f"Fit score must be between 0 and 1, got {fitting_result.fit_score}"
            assert 0.0 <= fitting_result.comfort_prediction <= 1.0, f"Comfort prediction must be between 0 and 1"
            assert 0.0 <= fitting_result.aesthetic_score <= 1.0, f"Aesthetic score must be between 0 and 1"
            assert fitting_result.size_recommendation in ["XS", "S", "M", "L", "XL"], "Invalid size recommendation"
            assert len(fitting_result.adjustment_recommendations) >= 0, "Adjustment recommendations should be a list"
            
            # Performance assertion for fitting simulation
            assert fitting_time < 1.0, f"VTO fitting simulation took {fitting_time:.3f}s, expected < 1s"
            
            # Verify fitting logic makes sense
            if face_data["interpupillary_distance"] > 65:
                # Wide IPD should suggest larger frame or adjustments
                assert fitting_result.size_recommendation in ["M", "L", "XL"] or \
                       any("wider" in adj.lower() for adj in fitting_result.adjustment_recommendations)
            
            fitting_results.append(fitting_result)
        
        # Test batch VTO processing
        additional_vto_products = []
        for i in range(3):
            product = {
                "sku": f"VTO-BATCH-{i:03d}",
                "name": f"VTO Batch Product {i}",
                "manufacturer_id": manufacturer_id,
                "dimensions": ProductDimensions(
                    lens_width=50.0 + i * 3,
                    bridge_width=16.0 + i,
                    temple_length=140.0 + i * 5,
                    frame_width=130.0 + i * 5,
                    frame_height=38.0 + i * 3
                ),
                "frame_shape": ["aviator", "wayfarer", "cat_eye"][i],
                "3d_model_data": {
                    "mesh_url": f"https://example.com/models/batch-{i}.obj",
                    "texture_url": f"https://example.com/textures/batch-{i}.jpg"
                }
            }
            created = await real_product_manager.create_product(product)
            additional_vto_products.append(created)
        
        # Test batch VTO model generation
        start_time = time.perf_counter()
        batch_vto_models = await real_vto_service.batch_generate_vto_models(
            [p.id for p in additional_vto_products]
        )
        batch_generation_time = time.perf_counter() - start_time
        
        # Verify batch processing efficiency
        assert len(batch_vto_models) == len(additional_vto_products)
        assert batch_generation_time < 10.0, f"Batch VTO generation took {batch_generation_time:.3f}s for 3 products"
        
        # Verify all batch models are valid
        for model in batch_vto_models.values():
            assert isinstance(model, VTOModel)
            assert len(model.calibration_points) >= 8
            assert model.optimization_level in ["low", "medium", "high"]
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_ml_performance_optimization(self, real_ml_service, real_product_manager):
        """
        Test ML performance optimization for manufacturer-scale operations.
        
        This test ensures:
        - Efficient caching of ML results
        - Batch processing optimization
        - Resource management under load
        """
        manufacturer_id = "mfg_ml_perf_test_001"
        
        # Create manufacturer
        await real_product_manager.create_manufacturer(manufacturer_id, {
            "company_name": "ML Performance Test Co",
            "email": "mlperf@test.com",
            "tier": "enterprise"
        })
        
        # Create large product catalog for performance testing
        products = []
        for i in range(50):  # 50 products for performance testing
            product = {
                "sku": f"ML-PERF-{i:03d}",
                "name": f"ML Performance Product {i}",
                "manufacturer_id": manufacturer_id,
                "dimensions": ProductDimensions(
                    lens_width=48.0 + (i % 15),
                    bridge_width=14.0 + (i % 8),
                    temple_length=135.0 + (i % 20),
                    frame_width=125.0 + (i % 25),
                    frame_height=35.0 + (i % 15)
                ),
                "frame_shape": ["round", "square", "aviator", "wayfarer", "cat_eye"][i % 5],
                "frame_material": ["acetate", "metal", "titanium", "plastic"][i % 4],
                "category": "eyeglasses"
            }
            created = await real_product_manager.create_product(product)
            products.append(created)
        
        # Test initial batch ML analysis (cold cache)
        start_time = time.perf_counter()
        initial_analysis = await real_ml_service.batch_analyze_manufacturer_products(
            manufacturer_id,
            enable_caching=True
        )
        initial_time = time.perf_counter() - start_time
        
        assert len(initial_analysis) == len(products)
        assert initial_time < 30.0, f"Initial ML analysis took {initial_time:.3f}s for {len(products)} products"
        
        # Test cached ML analysis (warm cache)
        start_time = time.perf_counter()
        cached_analysis = await real_ml_service.batch_analyze_manufacturer_products(
            manufacturer_id,
            enable_caching=True
        )
        cached_time = time.perf_counter() - start_time
        
        # Cached analysis should be significantly faster
        assert len(cached_analysis) == len(products)
        assert cached_time < initial_time * 0.2, f"Cached analysis not fast enough: {cached_time:.3f}s vs initial {initial_time:.3f}s"
        assert cached_time < 5.0, f"Cached ML analysis took {cached_time:.3f}s, expected < 5s"
        
        # Verify cached results are identical
        for product_id in initial_analysis:
            assert product_id in cached_analysis
            initial_result = initial_analysis[product_id]
            cached_result = cached_analysis[product_id]
            
            # Results should be identical (within floating point precision)
            assert abs(initial_result.confidence_score - cached_result.confidence_score) < 0.001
            assert initial_result.face_shape_compatibility.oval == cached_result.face_shape_compatibility.oval
        
        # Test concurrent ML analysis
        async def analyze_subset(start_idx: int, end_idx: int):
            subset_products = [p.id for p in products[start_idx:end_idx]]
            return await real_ml_service.batch_analyze_products(subset_products)
        
        # Run concurrent analysis on different product subsets
        concurrent_tasks = [
            analyze_subset(0, 10),
            analyze_subset(10, 20),
            analyze_subset(20, 30),
            analyze_subset(30, 40),
            analyze_subset(40, 50)
        ]
        
        start_time = time.perf_counter()
        concurrent_results = await asyncio.gather(*concurrent_tasks)
        concurrent_time = time.perf_counter() - start_time
        
        # Verify concurrent processing efficiency
        total_concurrent_products = sum(len(result) for result in concurrent_results)
        assert total_concurrent_products == len(products)
        assert concurrent_time < 20.0, f"Concurrent ML analysis took {concurrent_time:.3f}s"
        
        # Concurrent should be faster than sequential for this workload
        products_per_second = len(products) / concurrent_time
        assert products_per_second > 2.0, f"ML processing rate {products_per_second:.2f} products/s too slow"


class TestMLServiceReliability:
    """Test suite for ML service reliability and error handling"""
    
    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_ml_error_handling_and_fallbacks(self, real_ml_service):
        """
        Test ML service error handling and fallback mechanisms.
        
        This test ensures:
        - Graceful handling of invalid input data
        - Fallback mechanisms for ML service failures
        - Proper error reporting and logging
        """
        # Test invalid product data handling
        invalid_product_data = [
            {
                "product_id": "invalid_001",
                "dimensions": None,  # Missing dimensions
                "frame_shape": "unknown_shape"
            },
            {
                "product_id": "invalid_002",
                "dimensions": ProductDimensions(
                    lens_width=-10.0,  # Negative dimension
                    bridge_width=0.0,  # Zero dimension
                    temple_length=1000.0,  # Unrealistic dimension
                    frame_width=5.0,  # Too small
                    frame_height=200.0  # Too large
                ),
                "frame_shape": "round"
            }
        ]
        
        for invalid_data in invalid_product_data:
            try:
                result = await real_ml_service.analyze_product_compatibility(invalid_data["product_id"])
                
                # If analysis succeeds, it should have low confidence
                if result is not None:
                    assert result.confidence_score < 0.5, "Invalid data should result in low confidence"
                    
            except ValueError as e:
                # Proper error handling is acceptable
                assert "invalid" in str(e).lower() or "dimension" in str(e).lower()
            
            except Exception as e:
                # Should not raise unexpected exceptions
                pytest.fail(f"Unexpected exception for invalid data: {e}")
        
        # Test ML service resilience under load
        stress_test_products = [f"stress_test_{i:04d}" for i in range(100)]
        
        # Simulate some ML service failures
        failed_analyses = []
        successful_analyses = []
        
        for product_id in stress_test_products:
            try:
                result = await real_ml_service.analyze_product_compatibility(product_id)
                if result is not None:
                    successful_analyses.append(result)
                else:
                    failed_analyses.append(product_id)
            except Exception as e:
                failed_analyses.append(product_id)
        
        # Should handle failures gracefully
        total_requests = len(stress_test_products)
        success_rate = len(successful_analyses) / total_requests
        
        # Allow for some failures under stress, but most should succeed
        assert success_rate > 0.8, f"ML service success rate {success_rate:.2f} too low under stress"


if __name__ == "__main__":
    # Run ML integration tests with verbose output
    pytest.main([__file__, "-v", "--tb=short", "-m", "integration"])