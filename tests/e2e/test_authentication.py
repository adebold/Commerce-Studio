"""
End-to-End tests for authentication functionality.

This module contains tests for user authentication, including
login, logout, and failed authentication scenarios.
"""

import pytest
from selenium.common.exceptions import TimeoutException
from tests.e2e.page_objects.login_page import LoginPage


def test_successful_login(browser, base_url):
    """Test successful user login flow.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create a login page object
    login_page = LoginPage(browser, base_url)
    
    # Navigate to login page
    login_page.load()
    
    # Perform login with valid credentials
    login_page.login("test@example.com", "Password123!")
    
    # Verify redirect to dashboard after successful login
    assert login_page.is_login_successful(), "Login succeeded but no redirect to dashboard"
    
    # Verify we're not on the login page anymore
    assert not login_page.is_on_login_page(), "Still on login page after successful login"
    
    # Verify we have a dashboard element visible
    assert "dashboard" in browser.current_url, "URL doesn't contain 'dashboard' after login"


def test_failed_login_invalid_credentials(browser, base_url):
    """Test login failure with invalid credentials.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create a login page object
    login_page = LoginPage(browser, base_url)
    
    # Navigate to login page
    login_page.load()
    
    # Perform login with invalid credentials
    login_page.login("invalid@example.com", "WrongPassword123!")
    
    # Verify we're still on the login page
    assert login_page.is_on_login_page(), "Not on login page after failed login"
    
    # Verify error message is displayed
    error_message = login_page.get_error_message()
    assert error_message, "No error message displayed for invalid credentials"
    assert "invalid" in error_message.lower() or "incorrect" in error_message.lower(), \
        f"Unexpected error message: {error_message}"


def test_failed_login_empty_fields(browser, base_url):
    """Test login failure with empty fields.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create a login page object
    login_page = LoginPage(browser, base_url)
    
    # Navigate to login page
    login_page.load()
    
    # Perform login with empty fields
    login_page.login("", "")
    
    # Verify we're still on the login page
    assert login_page.is_on_login_page(), "Not on login page after failed login"
    
    # Verify error message is displayed
    error_message = login_page.get_error_message()
    assert error_message, "No error message displayed for empty fields"


def test_api_login_success(api_client, api_url):
    """Test API login with valid credentials.
    
    Args:
        api_client: API client fixture
        api_url: Base API URL
    """
    # Valid credentials
    credentials = {
        "username": "test@example.com",
        "password": "Password123!"
    }
    
    # Send login request
    response = api_client.post(f"{api_url}/auth/login", json=credentials)
    
    # Verify response
    assert response.status_code == 200, f"Login failed: {response.text}"
    data = response.json()
    
    # Verify token is present in response
    assert "access_token" in data, "No access token in response"
    assert data["access_token"], "Access token is empty"
    
    # Verify token type
    assert "token_type" in data, "No token type in response"
    assert data["token_type"] == "bearer", f"Unexpected token type: {data['token_type']}"


def test_api_login_failure(api_client, api_url):
    """Test API login with invalid credentials.
    
    Args:
        api_client: API client fixture
        api_url: Base API URL
    """
    # Invalid credentials
    credentials = {
        "username": "invalid@example.com",
        "password": "WrongPassword123!"
    }
    
    # Send login request
    response = api_client.post(f"{api_url}/auth/login", json=credentials)
    
    # Verify response
    assert response.status_code == 401, f"Expected 401 status code, got {response.status_code}"
    data = response.json()
    
    # Verify error message
    assert "detail" in data, "No error detail in response"
    assert "incorrect" in data["detail"].lower() or "invalid" in data["detail"].lower(), \
        f"Unexpected error message: {data['detail']}"
