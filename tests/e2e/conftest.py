"""
Pytest fixtures for E2E testing.

This module provides fixtures for setting up and tearing down
test environments for end-to-end tests.
"""

import os
import time
import json
import pytest
import requests
from typing import Dict, List, Optional, Generator, Any
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

from tests.e2e.utils.docker_utils import DockerController


# Environment variables and configuration
DEFAULT_BASE_URL = "http://localhost:3005"  # Frontend URL
DEFAULT_API_URL = "http://localhost:8001"   # API URL
DEFAULT_TIMEOUT = 60  # Default timeout in seconds


@pytest.fixture(scope="session")
def docker_controller() -> DockerController:
    """Create a Docker controller for managing services.
    
    Returns:
        DockerController: Controller for Docker operations
    """
    return DockerController(compose_file="docker-compose.yml", project_name="eyewear-ml-e2e")


@pytest.fixture(scope="session")
def docker_environment(docker_controller: DockerController) -> Generator[Dict[str, Any], None, None]:
    """Set up Docker environment with required services.
    
    Args:
        docker_controller: Docker controller fixture
        
    Yields:
        Dict[str, Any]: Environment information including service status
    """
    # List of required services
    services = ["api", "mongodb", "redis", "frontend", "client-portal"]
    
    # Start services
    print("Starting Docker services...")
    started = docker_controller.start_services(services)
    
    if not started:
        pytest.fail("Failed to start Docker services")
    
    # Wait for services to be available
    print("Waiting for services to be available...")
    time.sleep(5)  # Allow some startup time
    
    # Check service status
    service_status = {}
    for service in services:
        service_status[service] = docker_controller.get_service_status(service)
    
    environment_info = {
        "services": services,
        "status": service_status,
        "base_url": os.environ.get("E2E_BASE_URL", DEFAULT_BASE_URL),
        "api_url": os.environ.get("E2E_API_URL", DEFAULT_API_URL)
    }
    
    try:
        yield environment_info
    finally:
        # Teardown: stop all services
        print("Stopping Docker services...")
        docker_controller.stop_services(remove_volumes=True)


@pytest.fixture(scope="session")
def base_url(docker_environment: Dict[str, Any]) -> str:
    """Get the base URL for frontend tests.
    
    Args:
        docker_environment: Docker environment fixture
        
    Returns:
        str: Base URL for the frontend application
    """
    return docker_environment["base_url"]


@pytest.fixture(scope="session")
def api_url(docker_environment: Dict[str, Any]) -> str:
    """Get the API URL for backend tests.
    
    Args:
        docker_environment: Docker environment fixture
        
    Returns:
        str: URL for the API
    """
    return docker_environment["api_url"]


@pytest.fixture(scope="function")
def browser(docker_environment: Dict[str, Any]) -> Generator[webdriver.Chrome, None, None]:
    """Create a Chrome WebDriver instance for browser testing.
    
    Args:
        docker_environment: Docker environment fixture
        
    Yields:
        webdriver.Chrome: Chrome WebDriver instance
    """
    # Set up Chrome options
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    
    # Create and configure WebDriver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.set_page_load_timeout(DEFAULT_TIMEOUT)
    driver.implicitly_wait(10)
    
    try:
        yield driver
    finally:
        # Quit the WebDriver
        driver.quit()


@pytest.fixture(scope="session")
def api_client(api_url: str) -> requests.Session:
    """Create a requests session for API testing.
    
    Args:
        api_url: API URL fixture
        
    Returns:
        requests.Session: Session for making API requests
    """
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Accept": "application/json"
    })
    return session


@pytest.fixture(scope="function")
def auth_token(api_client: requests.Session, api_url: str) -> str:
    """Get an authentication token for API testing.
    
    Args:
        api_client: API client fixture
        api_url: API URL fixture
        
    Returns:
        str: Authentication token
    """
    # Test credentials - this would typically come from a secure source or test data
    credentials = {
        "username": "test@example.com",
        "password": "Password123!"
    }
    
    response = api_client.post(f"{api_url}/auth/login", json=credentials)
    
    if response.status_code != 200:
        pytest.fail(f"Failed to get auth token: {response.text}")
    
    data = response.json()
    return data["access_token"]


@pytest.fixture(scope="function")
def authenticated_api_client(api_client: requests.Session, auth_token: str) -> requests.Session:
    """Create an authenticated API client.
    
    Args:
        api_client: API client fixture
        auth_token: Authentication token fixture
        
    Returns:
        requests.Session: Authenticated session for making API requests
    """
    api_client.headers.update({
        "Authorization": f"Bearer {auth_token}"
    })
    return api_client


@pytest.fixture(scope="function")
def authenticated_browser(browser: webdriver.Chrome, base_url: str) -> webdriver.Chrome:
    """Create an authenticated browser session.
    
    Args:
        browser: WebDriver fixture
        base_url: Base URL fixture
        
    Returns:
        webdriver.Chrome: Authenticated WebDriver
    """
    # Navigate to login page
    browser.get(f"{base_url}/login")
    
    # Find login form elements
    username_input = browser.find_element_by_id("email")
    password_input = browser.find_element_by_id("password")
    submit_button = browser.find_element_by_xpath("//button[@type='submit']")
    
    # Enter credentials and submit
    username_input.send_keys("test@example.com")
    password_input.send_keys("Password123!")
    submit_button.click()
    
    # Wait for redirect to dashboard after successful login
    WebDriverWait(browser, 10).until(
        lambda x: "/dashboard" in x.current_url
    )
    
    return browser


@pytest.fixture(scope="session")
def test_data() -> Dict[str, Any]:
    """Load test data from JSON files.
    
    Returns:
        Dict[str, Any]: Test data
    """
    data = {}
    
    # Load user data
    user_data_path = os.path.join(os.path.dirname(__file__), "test_data", "users.json")
    if os.path.exists(user_data_path):
        with open(user_data_path, "r") as f:
            data["users"] = json.load(f)
    else:
        # Default test users if file doesn't exist
        data["users"] = [
            {
                "email": "test@example.com",
                "password": "Password123!",
                "role": "user",
                "region": "na"
            },
            {
                "email": "euuser@example.com",
                "password": "Password123!",
                "role": "user",
                "region": "eu"
            },
            {
                "email": "admin@example.com",
                "password": "AdminPass456!",
                "role": "admin",
                "region": "na"
            }
        ]
    
    # Load frame data
    frames_data_path = os.path.join(os.path.dirname(__file__), "test_data", "frames.json")
    if os.path.exists(frames_data_path):
        with open(frames_data_path, "r") as f:
            data["frames"] = json.load(f)
    
    return data


@pytest.fixture(scope="function")
def cleanup_test_data(docker_controller: DockerController) -> Generator[None, None, None]:
    """Clean up test data after tests.
    
    Args:
        docker_controller: Docker controller fixture
        
    Yields:
        None
    """
    # Let the test run
    yield
    
    # Clean up by executing database cleanup commands
    docker_controller.execute_command(
        "mongodb", 
        "mongo --eval 'db.test_collection.deleteMany({\"test_data\": true})'"
    )
