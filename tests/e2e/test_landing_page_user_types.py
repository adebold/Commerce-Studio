"""
End-to-End tests for landing page display based on user type.

This module contains tests for verifying that the landing page displays
correctly for different user types (anonymous, regular user, admin, optician).
"""

import pytest
from tests.e2e.page_objects.landing_page import LandingPage
from tests.e2e.page_objects.login_page import LoginPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def get_navigation_items(browser):
    """Helper function to get all navigation items.
    
    Args:
        browser: Selenium WebDriver instance
        
    Returns:
        list: Text content of all navigation items
    """
    nav_items = browser.find_elements(By.CSS_SELECTOR, "nav a")
    return [item.text for item in nav_items]


def logout_if_needed(browser):
    """Helper function to log out if a user is logged in.
    
    Args:
        browser: Selenium WebDriver instance
    """
    # Find user profile menu if it exists
    try:
        profile_menu = browser.find_element(By.ID, "user-profile-menu")
        profile_menu.click()
        
        # Find and click logout button
        logout_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Logout')]")
        logout_button.click()
        
        # Wait for logout to complete and redirect to landing page
        WebDriverWait(browser, 10).until(
            EC.url_contains("/")
        )
    except:
        # If no profile menu found, user is already logged out
        pass


def test_anonymous_user_landing_page(browser, base_url):
    """Test landing page for anonymous (not logged in) users.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    landing_page = LandingPage(browser, base_url)
    
    # Ensure user is logged out
    logout_if_needed(browser)
    
    # Navigate to landing page
    landing_page.load()
    
    # Verify landing page is loaded
    assert landing_page.is_loaded(), "Landing page did not load properly"
    
    # Verify anonymous user specific elements
    
    # 1. Login and Sign Up buttons should be visible
    assert landing_page.has_sign_in_button(), "Sign In button not found for anonymous user"
    assert landing_page.has_sign_up_button(), "Sign Up button not found for anonymous user"
    
    # 2. Verify CTA section is visible to encourage registration
    assert landing_page.has_cta_section(), "CTA section not found for anonymous user"
    
    # 3. Verify navigation items appropriate for anonymous users
    nav_items = get_navigation_items(browser)
    assert "Login" in nav_items or "Sign In" in nav_items, "Login link not found in navigation"
    assert "Register" in nav_items or "Sign Up" in nav_items, "Register link not found in navigation"
    
    # 4. No user-specific content should be visible
    page_source = browser.page_source.lower()
    assert "dashboard" not in page_source, "Dashboard link should not be visible to anonymous users"
    assert "account" not in page_source, "Account link should not be visible to anonymous users"


def test_regular_user_landing_page(browser, base_url):
    """Test landing page for regular users after login.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    landing_page = LandingPage(browser, base_url)
    login_page = LoginPage(browser, base_url)
    
    # Ensure user is logged out
    logout_if_needed(browser)
    
    # Login as regular user
    login_page.load()
    login_page.login("test@example.com", "Password123!")
    
    # Navigate back to landing page after login
    landing_page.load()
    
    # Verify landing page is loaded
    assert landing_page.is_loaded(), "Landing page did not load properly for logged in user"
    
    # Verify regular user specific elements
    
    # 1. Login and Sign Up buttons should be replaced by user profile menu
    assert not landing_page.has_sign_in_button(), "Sign In button should not be visible after login"
    profile_menu = browser.find_element(By.ID, "user-profile-menu")
    assert profile_menu, "User profile menu not found after login"
    
    # 2. Navigation should include user-specific items
    nav_items = get_navigation_items(browser)
    assert "Dashboard" in nav_items, "Dashboard link not found in navigation for logged in user"
    assert "My Account" in nav_items, "My Account link not found in navigation for logged in user"
    
    # 3. CTA section might be modified for logged in users
    # Either different CTA or not present, depending on implementation
    if landing_page.has_cta_section():
        cta_text = browser.find_element(By.CSS_SELECTOR, ".cta-section h4").text
        assert "transform your eyewear business" not in cta_text.lower(), "CTA should be personalized for logged in users"


def test_admin_user_landing_page(browser, base_url):
    """Test landing page for admin users after login.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    landing_page = LandingPage(browser, base_url)
    login_page = LoginPage(browser, base_url)
    
    # Ensure user is logged out
    logout_if_needed(browser)
    
    # Login as admin user
    login_page.load()
    login_page.login("admin@example.com", "AdminPass456!")
    
    # Navigate back to landing page after login
    landing_page.load()
    
    # Verify landing page is loaded
    assert landing_page.is_loaded(), "Landing page did not load properly for admin user"
    
    # Verify admin user specific elements
    
    # 1. Admin-specific navigation items should be present
    nav_items = get_navigation_items(browser)
    assert "Admin Panel" in nav_items or "Admin Dashboard" in nav_items, "Admin Panel link not found for admin user"
    assert "User Management" in nav_items, "User Management link not found for admin user"
    assert "System Settings" in nav_items, "System Settings link not found for admin user"
    
    # 2. Admin badge or indicator might be present
    try:
        admin_badge = browser.find_element(By.CSS_SELECTOR, ".admin-badge, .admin-indicator")
        assert admin_badge, "Admin badge not found"
    except:
        pytest.fail("Admin indicator or badge not found on landing page for admin user")


def test_optician_user_landing_page(browser, base_url):
    """Test landing page for optician users after login.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    landing_page = LandingPage(browser, base_url)
    login_page = LoginPage(browser, base_url)
    
    # Ensure user is logged out
    logout_if_needed(browser)
    
    # Login as optician user
    login_page.load()
    login_page.login("optician@example.com", "Optician123!")
    
    # Navigate back to landing page after login
    landing_page.load()
    
    # Verify landing page is loaded
    assert landing_page.is_loaded(), "Landing page did not load properly for optician user"
    
    # Verify optician user specific elements
    
    # 1. Optician-specific navigation items should be present
    nav_items = get_navigation_items(browser)
    assert "Patient Management" in nav_items, "Patient Management link not found for optician user"
    assert "Practice Dashboard" in nav_items, "Practice Dashboard link not found for optician user"
    
    # 2. Practice information might be displayed
    try:
        practice_info = browser.find_element(By.ID, "practice-info")
        assert practice_info, "Practice information not found"
    except:
        pytest.fail("Practice information not found on landing page for optician user")
    
    # 3. Ensure admin-specific items are NOT present
    assert "User Management" not in nav_items, "Admin section should not be visible to optician users"
