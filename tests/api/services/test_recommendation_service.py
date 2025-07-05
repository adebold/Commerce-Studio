"""Tests for the recommendation service."""

import pytest
import time
import numpy as np
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from src.api.services.recommendation_service import RecommendationService
from src.api.models.recommendations import (
    Frame, StyleQuery, ReinforcementSignal, RecommendationRequest
)
from src.api.models.opticians_catalog_schemas import MasterFrameSearchParams


@pytest.fixture
def mock_db():
    """Fixture for database session."""
    return MagicMock()


@pytest.fixture
def recommendation_service(mock_db):
    """Fixture for recommendation service."""
    service = RecommendationService(mock_db)
    service.master_frame_service = AsyncMock()
    service.deepseek_service = AsyncMock()
    return service


@pytest.fixture
def sample_frames():
    """Fixture for sample frames."""
    return [
        Frame(
            id="frame1",
            name="Aviator Classic",
            brand="Ray-Ban",
            style="Aviator",
            material="Metal",
            color="Gold",
            price=149.99,
            image_url="https://example.com/frames/frame1.jpg",
            deepseek_embedding=[0.1, 0.2, 0.3, 0.4, 0.5],
            dimensions={"width": 140, "height": 50, "bridge": 18, "temple": 145}
        ),
        Frame(
            id="frame2",
            name="Wayfarer",
            brand="Ray-Ban",
            style="Square",
            material="Acetate",
            color="Black",
            price=129.99,
            image_url="https://example.com/frames/frame2.jpg",
            deepseek_embedding=[0.2, 0.3, 0.4, 0.5, 0.6],
            dimensions={"width": 142, "height": 48, "bridge": 20, "temple": 145}
        ),
        Frame(
            id="frame3",
            name="Round Metal",
            brand="Ray-Ban",
            style="Round",
            material="Metal",
            color="Gold",
            price=159.99,
            image_url="https://example.com/frames/frame3.jpg",
            deepseek_embedding=[0.3, 0.4, 0.5, 0.6, 0.7],
            dimensions={"width": 138, "height": 48, "bridge": 19, "temple": 140}
        )
    ]


@pytest.fixture
def sample_customer_data():
    """Fixture for sample customer data."""
    return {
        "id": "customer123",
        "purchase_history": [
            {
                "product_id": "frame3",
                "purchase_date": "2024-12-15",
                "price": 159.99,
                "style": "Round",
                "material": "Metal",
                "color": "Gold"
            }
        ],
        "frame_measurements": {
            "width": 140,
            "height": 48,
            "bridge": 18,
            "temple": 145
        },
        "prescription": {
            "sphere_right": -2.5,
            "sphere_left": -2.75,
            "cylinder_right": -0.5,
            "cylinder_left": -0.75,
            "axis_right": 180,
            "axis_left": 175,
            "add_power": None,
            "pupillary_distance": 64
        },
        "questionnaire_responses": {
            "style_preference": "Modern",
            "color_preference": "Gold",
            "material_preference": "Metal",
            "face_shape": "Oval"
        }
    }


@pytest.mark.asyncio
async def test_fetch_customer_data(recommendation_service):
    """Test fetching customer data."""
    # Arrange
    customer_id = "customer123"
    
    # Act
    result = await recommendation_service.fetch_customer_data(customer_id)
    
    # Assert
    assert result.get("id") == customer_id
    assert "purchase_history" in result
    assert "frame_measurements" in result
    assert "prescription" in result


@pytest.mark.asyncio
async def test_fetch_product_data_all(recommendation_service, sample_frames):
    """Test fetching all product data."""
    # Arrange
    search_result = {
        "frames": [
            {
                "id": frame.id,
                "name": frame.name,
                "brand": frame.brand,
                "style": frame.style,
                "material": frame.material,
                "color": frame.color,
                "price": frame.price,
                "image_url": frame.image_url
            }
            for frame in sample_frames
        ],
        "total": len(sample_frames)
    }
    recommendation_service.master_frame_service.search_frames.return_value = search_result
    
    # Act
    result = await recommendation_service.fetch_product_data()
    
    # Assert
    assert len(result) == len(sample_frames)
    recommendation_service.master_frame_service.search_frames.assert_called_once()
    assert isinstance(recommendation_service.master_frame_service.search_frames.call_args[0][0], MasterFrameSearchParams)


@pytest.mark.asyncio
async def test_fetch_product_data_specific(recommendation_service, sample_frames):
    """Test fetching specific products."""
    # Arrange
    product_ids = ["frame1", "frame3"]
    frame_details = {
        "id": "frame1",
        "name": "Aviator Classic",
        "brand": "Ray-Ban",
        "style": "Aviator",
        "material": "Metal",
        "color": "Gold",
        "price": 149.99,
        "image_url": "https://example.com/frames/frame1.jpg"
    }
    recommendation_service.master_frame_service.get_frame_details.return_value = frame_details
    
    # Act
    result = await recommendation_service.fetch_product_data(product_ids)
    
    # Assert
    assert len(result) == len(product_ids)
    assert recommendation_service.master_frame_service.get_frame_details.call_count == len(product_ids)


@pytest.mark.asyncio
async def test_generate_product_embeddings(recommendation_service, sample_frames):
    """Test generating product embeddings."""
    # Arrange
    frames_without_embeddings = [
        Frame(
            id=frame.id,
            name=frame.name,
            brand=frame.brand,
            style=frame.style,
            material=frame.material,
            color=frame.color,
            price=frame.price,
            image_url=frame.image_url
        )
        for frame in sample_frames
    ]
    recommendation_service.deepseek_service.update_embeddings.return_value = sample_frames
    
    # Act
    result = await recommendation_service.generate_product_embeddings(frames_without_embeddings)
    
    # Assert
    assert len(result) == len(sample_frames)
    for frame in result:
        assert frame.deepseek_embedding is not None
    recommendation_service.deepseek_service.update_embeddings.assert_called_once_with(frames_without_embeddings)


@pytest.mark.asyncio
async def test_generate_user_embedding(recommendation_service, sample_customer_data):
    """Test generating user embedding."""
    # Arrange
    embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
    style_analysis = {"embedding": embedding, "attributes": {}}
    recommendation_service.deepseek_service.analyze_style_query.return_value = style_analysis
    
    # Mock product fetching for browsing history
    recommendation_service.fetch_product_data = AsyncMock()
    recommendation_service.fetch_product_data.return_value = [
        Frame(
            id="frame2",
            name="Wayfarer",
            brand="Ray-Ban",
            style="Square",
            material="Acetate",
            color="Black",
            price=129.99,
            image_url="https://example.com/frames/frame2.jpg"
        )
    ]
    
    # Add browsing history to customer data
    sample_customer_data["browsing_history"] = [
        {
            "product_id": "frame2",
            "view_count": 5,
            "last_viewed": "2025-04-09T14:30:00Z"
        }
    ]
    
    # Act
    result = await recommendation_service.generate_user_embedding(sample_customer_data)
    
    # Assert
    assert result == embedding
    recommendation_service.deepseek_service.analyze_style_query.assert_called_once()
    assert isinstance(recommendation_service.deepseek_service.analyze_style_query.call_args[0][0], StyleQuery)


@pytest.mark.asyncio
async def test_calculate_similarity_scores(recommendation_service, sample_frames):
    """Test calculating similarity scores."""
    # Arrange
    user_embedding = [0.3, 0.3, 0.3, 0.3, 0.3]
    recommendation_service.deepseek_service.rank_frames.return_value = [
        (sample_frames[0], 0.9, "High match for style preference"),
        (sample_frames[1], 0.8, "Good match for brand preference"),
        (sample_frames[2], 0.7, "Good match for color preference")
    ]
    
    # Act
    result = await recommendation_service.calculate_similarity_scores(
        user_embedding, sample_frames, include_reasoning=True
    )
    
    # Assert
    assert len(result) == len(sample_frames)
    assert result[0][1] > result[1][1]  # Scores are in descending order
    recommendation_service.deepseek_service.rank_frames.assert_called_once()


def test_calculate_cosine_similarity(recommendation_service):
    """Test calculating cosine similarity."""
    # Arrange
    vector_a = [0.1, 0.2, 0.3, 0.4, 0.5]
    vector_b = [0.5, 0.4, 0.3, 0.2, 0.1]
    
    # Act
    result = recommendation_service._calculate_cosine_similarity(vector_a, vector_b)
    
    # Assert
    assert 0 <= result <= 1
    
    # Test with identical vectors (should be 1.0)
    identical_result = recommendation_service._calculate_cosine_similarity(vector_a, vector_a)
    assert identical_result == 1.0
    
    # Test with empty vectors (should be 0.0)
    empty_result = recommendation_service._calculate_cosine_similarity([], [])
    assert empty_result == 0.0


def test_filter_recommendations_by_measurements(recommendation_service, sample_frames):
    """Test filtering recommendations by measurements."""
    # Arrange
    recommendations = [
        (frame, 0.9, "Reasoning") for frame in sample_frames
    ]
    measurements = {"width": 140, "height": 48, "bridge": 18, "temple": 145}
    
    # Act
    result = recommendation_service.filter_recommendations_by_measurements(
        recommendations, measurements
    )
    
    # Assert
    assert len(result) == 2  # frame2 width (142) is within ±5mm of customer width (140)
    filtered_frame_ids = [frame.id for frame, _, _ in result]
    assert "frame1" in filtered_frame_ids  # width 140 == customer width 140
    assert "frame2" in filtered_frame_ids  # width 142 is within +5mm of customer width 140


def test_filter_recommendations_by_prescription(recommendation_service, sample_frames):
    """Test filtering recommendations by prescription."""
    # Arrange
    recommendations = [
        (frame, 0.9, "Reasoning") for frame in sample_frames
    ]
    high_prescription = {
        "sphere_right": -4.5,
        "sphere_left": -4.75
    }
    
    # Act
    result = recommendation_service.filter_recommendations_by_prescription(
        recommendations, high_prescription
    )
    
    # Assert
    # Should boost scores for metal frames
    metal_frames = [r for r in result if r[0].material.lower() == "metal"]
    non_metal_frames = [r for r in result if r[0].material.lower() != "metal"]
    
    for frame, score, _ in metal_frames:
        assert score > 0.9  # Metal frames should have boosted scores


@pytest.mark.asyncio
async def test_record_reinforcement_signal(recommendation_service):
    """Test recording reinforcement signal."""
    # Arrange
    signal = ReinforcementSignal(
        customer_id="customer123",
        product_id="frame1",
        action_type="view"
    )
    
    # Act
    result = await recommendation_service.record_reinforcement_signal(signal)
    
    # Assert
    assert result is True
    assert signal.timestamp is not None


@pytest.mark.asyncio
async def test_generate_recommendations_integration(
    recommendation_service, sample_frames, sample_customer_data
):
    """Integration test for generating recommendations."""
    # Arrange
    customer_id = "customer123"
    user_embedding = [0.3, 0.3, 0.3, 0.3, 0.3]
    
    # Mock all the necessary methods
    recommendation_service.fetch_customer_data = AsyncMock(return_value=sample_customer_data)
    recommendation_service.fetch_new_customer_data = AsyncMock(return_value={})
    recommendation_service.fetch_product_data = AsyncMock(return_value=sample_frames)
    recommendation_service.generate_product_embeddings = AsyncMock(return_value=sample_frames)
    recommendation_service.generate_user_embedding = AsyncMock(return_value=user_embedding)
    recommendation_service.calculate_similarity_scores = AsyncMock(return_value=[
        (sample_frames[0], 0.9, "High match for style preference"),
        (sample_frames[1], 0.8, "Good match for brand preference"),
        (sample_frames[2], 0.7, "Good match for color preference")
    ])
    
    # Act
    result = await recommendation_service.generate_recommendations(
        customer_id, limit=3, include_reasoning=True
    )
    
    # Assert
    assert len(result) == 3
    for rec in result:
        assert "product" in rec
        assert "score" in rec
        assert "reasoning" in rec