"""
End-to-End tests for region-aware functionality.

This module contains tests for verifying that the application correctly
handles region-specific data and routing based on user region settings.
"""

import pytest
import requests
import json
from typing import Dict, Any


def test_na_region_routing(api_client, api_url, test_data):
    """Test that North America region routing works correctly.
    
    Args:
        api_client: API client fixture
        api_url: Base API URL
        test_data: Test data fixture
    """
    # Find a NA user from test data
    na_user = next((user for user in test_data["users"] if user["region"] == "na"), None)
    assert na_user, "No NA user found in test data"
    
    # Authenticate as NA user
    credentials = {
        "username": na_user["email"],
        "password": na_user["password"]
    }
    
    auth_response = api_client.post(f"{api_url}/auth/login", json=credentials)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
    
    token = auth_response.json()["access_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})
    
    # Make request to an endpoint that should use region-specific routing
    response = api_client.get(f"{api_url}/frames/recommendations")
    
    # Verify response
    assert response.status_code == 200, f"Recommendation request failed: {response.text}"
    
    # Verify region-specific headers or data
    assert "x-region" in response.headers, "Region header not found in response"
    assert response.headers["x-region"] == "na", f"Expected region 'na', got {response.headers['x-region']}"


def test_eu_region_routing(api_client, api_url, test_data):
    """Test that European region routing works correctly.
    
    Args:
        api_client: API client fixture
        api_url: Base API URL
        test_data: Test data fixture
    """
    # Find an EU user from test data
    eu_user = next((user for user in test_data["users"] if user["region"] == "eu"), None)
    assert eu_user, "No EU user found in test data"
    
    # Authenticate as EU user
    credentials = {
        "username": eu_user["email"],
        "password": eu_user["password"]
    }
    
    auth_response = api_client.post(f"{api_url}/auth/login", json=credentials)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
    
    token = auth_response.json()["access_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})
    
    # Make request to an endpoint that should use region-specific routing
    response = api_client.get(f"{api_url}/frames/recommendations")
    
    # Verify response
    assert response.status_code == 200, f"Recommendation request failed: {response.text}"
    
    # Verify region-specific headers or data
    assert "x-region" in response.headers, "Region header not found in response"
    assert response.headers["x-region"] == "eu", f"Expected region 'eu', got {response.headers['x-region']}"
    
    # Verify GDPR compliance headers for EU users
    assert "x-gdpr-compliance" in response.headers, "GDPR compliance header not found in EU response"
    assert response.headers["x-gdpr-compliance"] == "enabled", \
        f"Expected GDPR compliance 'enabled', got {response.headers['x-gdpr-compliance']}"


def test_region_specific_data_handling(api_client, api_url, test_data):
    """Test that region-specific data handling works correctly.
    
    Args:
        api_client: API client fixture
        api_url: Base API URL
        test_data: Test data fixture
    """
    # Authenticate as NA user first
    na_user = next((user for user in test_data["users"] if user["region"] == "na"), None)
    assert na_user, "No NA user found in test data"
    
    na_credentials = {
        "username": na_user["email"],
        "password": na_user["password"]
    }
    
    auth_response = api_client.post(f"{api_url}/auth/login", json=na_credentials)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
    
    na_token = auth_response.json()["access_token"]
    api_client.headers.update({"Authorization": f"Bearer {na_token}"})
    
    # Get NA user data
    na_response = api_client.get(f"{api_url}/styles/regional-trends")
    assert na_response.status_code == 200, f"NA region data request failed: {na_response.text}"
    na_data = na_response.json()
    
    # Now authenticate as EU user
    eu_user = next((user for user in test_data["users"] if user["region"] == "eu"), None)
    assert eu_user, "No EU user found in test data"
    
    eu_credentials = {
        "username": eu_user["email"],
        "password": eu_user["password"]
    }
    
    auth_response = api_client.post(f"{api_url}/auth/login", json=eu_credentials)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
    
    eu_token = auth_response.json()["access_token"]
    api_client.headers.update({"Authorization": f"Bearer {eu_token}"})
    
    # Get EU user data
    eu_response = api_client.get(f"{api_url}/styles/regional-trends")
    assert eu_response.status_code == 200, f"EU region data request failed: {eu_response.text}"
    eu_data = eu_response.json()
    
    # Verify that the data differs by region
    assert na_data != eu_data, "Expected different data for NA and EU regions"
    
    # Verify region identifiers in data
    assert "region" in na_data, "Region identifier not found in NA data"
    assert na_data["region"] == "na", f"Expected region 'na', got {na_data['region']}"
    
    assert "region" in eu_data, "Region identifier not found in EU data"
    assert eu_data["region"] == "eu", f"Expected region 'eu', got {eu_data['region']}"


def test_region_fallback(docker_controller, api_client, api_url, test_data):
    """Test regional fallback capability when primary region is unavailable.
    
    Args:
        docker_controller: Docker controller fixture
        api_client: API client fixture
        api_url: Base API URL
        test_data: Test data fixture
    """
    # Authenticate first to get a valid token
    na_user = next((user for user in test_data["users"] if user["region"] == "na"), None)
    assert na_user, "No NA user found in test data"
    
    credentials = {
        "username": na_user["email"],
        "password": na_user["password"]
    }
    
    auth_response = api_client.post(f"{api_url}/auth/login", json=credentials)
    assert auth_response.status_code == 200, f"Authentication failed: {auth_response.text}"
    
    token = auth_response.json()["access_token"]
    api_client.headers.update({"Authorization": f"Bearer {token}"})
    
    # Make a normal request to verify everything works
    initial_response = api_client.get(f"{api_url}/frames/recommendations")
    assert initial_response.status_code == 200, "Initial request failed"
    
    # Simulate failure of NA region service by stopping the service
    docker_controller.simulate_service_failure("api-na")
    
    # Make request again - should now be routed through fallback
    fallback_response = api_client.get(f"{api_url}/frames/recommendations")
    
    # Verify response still succeeds but comes from fallback
    assert fallback_response.status_code == 200, "Fallback request failed"
    assert "x-region-fallback" in fallback_response.headers, "Fallback header not found in response"
    assert fallback_response.headers["x-region-fallback"] == "true", \
        "Expected fallback indicator in response"
    
    # Restart the service for cleanup
    docker_controller.restart_services(["api-na"])
