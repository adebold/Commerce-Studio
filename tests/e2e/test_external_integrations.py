"""
End-to-End tests for external service integrations.

This module contains tests for verifying that the application correctly
integrates with external services such as DeepSeek API, Google Vertex AI,
and the Correlation Platform.
"""

import pytest
import json
import time
from typing import Dict, Any


def test_deepseek_api_integration(authenticated_api_client, api_url):
    """Test DeepSeek API integration for style-based recommendations.
    
    Args:
        authenticated_api_client: Authenticated API client fixture
        api_url: Base API URL
    """
    # Create a style-based recommendation request
    recommendation_request = {
        "text_query": "round glasses with thin metal frames in gold color",
        "reference_image_url": None,
        "max_results": 5
    }
    
    # Send the request
    response = authenticated_api_client.post(
        f"{api_url}/recommendations/style-based",
        json=recommendation_request
    )
    
    # Verify successful response
    assert response.status_code == 200, f"Recommendation request failed: {response.text}"
    data = response.json()
    
    # Verify the response structure
    assert "recommendations" in data, "No recommendations in response"
    assert isinstance(data["recommendations"], list), "Recommendations is not a list"
    assert len(data["recommendations"]) > 0, "No recommendations returned"
    
    # Verify recommendation fields
    first_rec = data["recommendations"][0]
    required_fields = ["id", "name", "image_url", "confidence_score", "match_reason"]
    for field in required_fields:
        assert field in first_rec, f"Field '{field}' missing from recommendation"
    
    # Verify DeepSeek metadata in response
    assert "metadata" in data, "No metadata in response"
    assert "deepseek_processed" in data["metadata"], "No DeepSeek processing indicator in metadata"
    assert data["metadata"]["deepseek_processed"] is True, "DeepSeek integration not used"


def test_deepseek_api_fallback(docker_controller, authenticated_api_client, api_url):
    """Test fallback behavior when DeepSeek API is unavailable.
    
    Args:
        docker_controller: Docker controller fixture
        authenticated_api_client: Authenticated API client fixture
        api_url: Base API URL
    """
    # Simulate DeepSeek API failure by manipulating the environment
    # This assumes there's a service named "deepseek-mock" in the Docker Compose setup
    docker_controller.simulate_service_failure("deepseek-mock")
    
    # Try to make a recommendation request
    recommendation_request = {
        "text_query": "oval glasses with thick acetate frames",
        "reference_image_url": None,
        "max_results": 5
    }
    
    # Send the request (should use fallback mechanism)
    response = authenticated_api_client.post(
        f"{api_url}/recommendations/style-based",
        json=recommendation_request
    )
    
    # Verify successful response (should still work despite DeepSeek being down)
    assert response.status_code == 200, f"Fallback recommendation failed: {response.text}"
    data = response.json()
    
    # Verify the response structure
    assert "recommendations" in data, "No fallback recommendations in response"
    assert isinstance(data["recommendations"], list), "Recommendations is not a list"
    assert len(data["recommendations"]) > 0, "No fallback recommendations returned"
    
    # Verify fallback indicator in metadata
    assert "metadata" in data, "No metadata in response"
    assert "fallback_mode" in data["metadata"], "No fallback indicator in metadata"
    assert data["metadata"]["fallback_mode"] is True, "Fallback mode not indicated"
    assert "deepseek_processed" in data["metadata"], "No DeepSeek processing indicator in metadata"
    assert data["metadata"]["deepseek_processed"] is False, "DeepSeek incorrectly reported as used"
    
    # Restart the service for cleanup
    docker_controller.restart_services(["deepseek-mock"])


def test_correlation_platform_integration(authenticated_api_client, api_url):
    """Test Correlation Platform integration for regional trend analysis.
    
    Args:
        authenticated_api_client: Authenticated API client fixture
        api_url: Base API URL
    """
    # Send request to correlation-enhanced endpoint
    response = authenticated_api_client.get(f"{api_url}/correlate/styles")
    
    # Verify successful response
    assert response.status_code == 200, f"Correlation request failed: {response.text}"
    data = response.json()
    
    # Verify the response structure with correlation data
    assert "style_correlations" in data, "No style correlations in response"
    assert isinstance(data["style_correlations"], list), "Style correlations is not a list"
    assert len(data["style_correlations"]) > 0, "No correlations returned"
    
    # Verify correlation metadata
    assert "metadata" in data, "No metadata in response"
    assert "correlation_platform_version" in data["metadata"], "No Correlation Platform version in metadata"
    assert "correlation_timestamp" in data["metadata"], "No correlation timestamp in metadata"
    
    # Verify correlation specific fields
    first_correlation = data["style_correlations"][0]
    required_fields = ["primary_style", "correlated_styles", "strength", "confidence"]
    for field in required_fields:
        assert field in first_correlation, f"Field '{field}' missing from correlation"


def test_vertex_ai_integration(authenticated_api_client, api_url):
    """Test Google Vertex AI integration for ML-based features.
    
    Args:
        authenticated_api_client: Authenticated API client fixture
        api_url: Base API URL
    """
    # Create a request that should use Vertex AI for processing
    ml_request = {
        "image_url": "https://example.com/test-image.jpg",
        "analysis_type": "facial_attributes"
    }
    
    # Send the request
    response = authenticated_api_client.post(
        f"{api_url}/ml/analyze",
        json=ml_request
    )
    
    # Verify successful response
    assert response.status_code == 200, f"ML analysis request failed: {response.text}"
    data = response.json()
    
    # Verify the response structure with ML analysis results
    assert "analysis_results" in data, "No analysis results in response"
    assert "face_shape" in data["analysis_results"], "No face shape in analysis results"
    assert "confidence" in data["analysis_results"], "No confidence score in analysis results"
    
    # Verify Vertex AI metadata
    assert "metadata" in data, "No metadata in response"
    assert "vertex_ai_model" in data["metadata"], "No Vertex AI model information in metadata"
    assert "processing_time_ms" in data["metadata"], "No processing time in metadata"


def test_multi_service_recommendation_flow(authenticated_api_client, api_url):
    """Test complete recommendation flow using multiple external services.
    
    Args:
        authenticated_api_client: Authenticated API client fixture
        api_url: Base API URL
    """
    # Step 1: Get user preferences
    preferences_response = authenticated_api_client.get(f"{api_url}/user/preferences")
    assert preferences_response.status_code == 200, "Failed to get user preferences"
    preferences = preferences_response.json()
    
    # Step 2: Generate recommendations based on preferences (uses DeepSeek)
    recommendation_request = {
        "user_preferences": preferences,
        "max_results": 5
    }
    
    recommendations_response = authenticated_api_client.post(
        f"{api_url}/recommendations/personalized",
        json=recommendation_request
    )
    assert recommendations_response.status_code == 200, "Failed to get recommendations"
    recommendations = recommendations_response.json()
    
    # Step 3: Enhance recommendations with correlations (uses Correlation Platform)
    recommendation_ids = [item["id"] for item in recommendations["recommendations"]]
    enhance_request = {
        "frame_ids": recommendation_ids,
        "enhance_with": ["correlations", "regional_trends"]
    }
    
    enhanced_response = authenticated_api_client.post(
        f"{api_url}/recommendations/enhance",
        json=enhance_request
    )
    assert enhanced_response.status_code == 200, "Failed to enhance recommendations"
    enhanced_data = enhanced_response.json()
    
    # Verify the enhanced data contains information from all services
    assert "recommendations" in enhanced_data, "No recommendations in enhanced response"
    assert len(enhanced_data["recommendations"]) == len(recommendation_ids), "Recommendation count mismatch"
    
    # Check for DeepSeek data
    assert "deepseek_processed" in enhanced_data["metadata"], "No DeepSeek processing indicator"
    assert enhanced_data["metadata"]["deepseek_processed"] is True, "DeepSeek not used"
    
    # Check for Correlation Platform data
    assert "correlations" in enhanced_data["metadata"], "No correlation data in enhanced response"
    assert enhanced_data["metadata"]["correlations"]["applied"] is True, "Correlations not applied"
    
    # Check for region-specific data
    assert "region_specific_enhancements" in enhanced_data["metadata"], "No region-specific data"
    assert enhanced_data["metadata"]["region_specific_enhancements"]["applied"] is True, "Region data not applied"
