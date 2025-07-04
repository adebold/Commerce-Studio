"""
End-to-End tests for user dashboards based on role.

This module contains tests for verifying that different user types
see the appropriate dashboard view after login.
"""

import pytest
from tests.e2e.page_objects.login_page import LoginPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class DashboardTestHelper:
    """Helper class for dashboard tests across user types."""

    # Common dashboard elements
    DASHBOARD_HEADER = (By.CSS_SELECTOR, "h1")
    USER_PROFILE_MENU = (By.ID, "user-profile-menu")
    
    # Admin-specific elements
    ADMIN_USER_MANAGEMENT = (By.ID, "user-management")
    ADMIN_SYSTEM_SETTINGS = (By.ID, "system-settings")
    
    # Optician-specific elements
    OPTICIAN_PATIENT_LIST = (By.ID, "patient-list")
    OPTICIAN_PRACTICE_STATS = (By.ID, "practice-stats")
    
    # Regular user elements
    USER_FRAME_RECOMMENDATIONS = (By.ID, "frame-recommendations")
    USER_ORDER_HISTORY = (By.ID, "order-history")
    
    def __init__(self, browser):
        """Initialize dashboard helper.
        
        Args:
            browser: Selenium WebDriver instance
        """
        self.browser = browser
        self.wait = WebDriverWait(browser, 10)
    
    def wait_for_dashboard_load(self):
        """Wait for dashboard to load."""
        self.wait.until(EC.visibility_of_element_located(self.DASHBOARD_HEADER))
    
    def has_element(self, locator):
        """Check if element is present on dashboard.
        
        Args:
            locator: Element locator tuple
            
        Returns:
            bool: True if element is present, False otherwise
        """
        try:
            self.browser.find_element(*locator)
            return True
        except:
            return False
    
    def get_dashboard_title(self):
        """Get dashboard title text.
        
        Returns:
            str: Dashboard title text
        """
        return self.browser.find_element(*self.DASHBOARD_HEADER).text


def test_admin_dashboard(browser, base_url):
    """Test that admin users see the admin dashboard.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    dashboard_helper = DashboardTestHelper(browser)
    
    # Navigate to login page
    login_page.load()
    
    # Login as admin
    login_page.login("admin@example.com", "AdminPass456!")
    
    # Verify successful login and redirection to dashboard
    assert login_page.is_login_successful(), "Admin login failed"
    
    # Wait for dashboard to load
    dashboard_helper.wait_for_dashboard_load()
    
    # Verify admin-specific elements are present
    assert dashboard_helper.has_element(dashboard_helper.ADMIN_USER_MANAGEMENT), "Admin user management not found"
    assert dashboard_helper.has_element(dashboard_helper.ADMIN_SYSTEM_SETTINGS), "Admin system settings not found"
    
    # Verify dashboard title indicates admin view
    dashboard_title = dashboard_helper.get_dashboard_title()
    assert "Admin" in dashboard_title, f"Dashboard title does not indicate admin view: {dashboard_title}"


def test_optician_dashboard(browser, base_url):
    """Test that optician users see the optician dashboard.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    dashboard_helper = DashboardTestHelper(browser)
    
    # Navigate to login page
    login_page.load()
    
    # Login as optician
    login_page.login("optician@example.com", "Optician123!")
    
    # Verify successful login and redirection to dashboard
    assert login_page.is_login_successful(), "Optician login failed"
    
    # Wait for dashboard to load
    dashboard_helper.wait_for_dashboard_load()
    
    # Verify optician-specific elements are present
    assert dashboard_helper.has_element(dashboard_helper.OPTICIAN_PATIENT_LIST), "Optician patient list not found"
    assert dashboard_helper.has_element(dashboard_helper.OPTICIAN_PRACTICE_STATS), "Optician practice stats not found"
    
    # Verify admin-specific elements are NOT present
    assert not dashboard_helper.has_element(dashboard_helper.ADMIN_USER_MANAGEMENT), "Admin elements should not be visible to optician"
    
    # Verify dashboard title indicates optician view
    dashboard_title = dashboard_helper.get_dashboard_title()
    assert "Optician" in dashboard_title, f"Dashboard title does not indicate optician view: {dashboard_title}"


def test_regular_user_dashboard(browser, base_url):
    """Test that regular users see the appropriate dashboard.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    dashboard_helper = DashboardTestHelper(browser)
    
    # Navigate to login page
    login_page.load()
    
    # Login as regular user
    login_page.login("test@example.com", "Password123!")
    
    # Verify successful login and redirection to dashboard
    assert login_page.is_login_successful(), "Regular user login failed"
    
    # Wait for dashboard to load
    dashboard_helper.wait_for_dashboard_load()
    
    # Verify regular user elements are present
    assert dashboard_helper.has_element(dashboard_helper.USER_FRAME_RECOMMENDATIONS), "User frame recommendations not found"
    assert dashboard_helper.has_element(dashboard_helper.USER_ORDER_HISTORY), "User order history not found"
    
    # Verify admin and optician elements are NOT present
    assert not dashboard_helper.has_element(dashboard_helper.ADMIN_USER_MANAGEMENT), "Admin elements should not be visible to regular user"
    assert not dashboard_helper.has_element(dashboard_helper.OPTICIAN_PATIENT_LIST), "Optician elements should not be visible to regular user"
    
    # Verify dashboard title for regular user
    dashboard_title = dashboard_helper.get_dashboard_title()
    assert "Dashboard" in dashboard_title, f"Unexpected dashboard title: {dashboard_title}"


def test_region_specific_content(browser, base_url):
    """Test that users from different regions see region-specific content.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    dashboard_helper = DashboardTestHelper(browser)
    
    # Test NA region user
    login_page.load()
    login_page.login("test@example.com", "Password123!")  # NA user
    assert login_page.is_login_successful(), "NA user login failed"
    dashboard_helper.wait_for_dashboard_load()
    
    # Check for NA-specific content (this will depend on your implementation)
    # For example, if you have a region indicator or region-specific products
    na_page_source = browser.page_source
    
    # Log out
    if dashboard_helper.has_element(dashboard_helper.USER_PROFILE_MENU):
        browser.find_element(*dashboard_helper.USER_PROFILE_MENU).click()
        # Find and click logout button (update locator as needed)
        logout_button = (By.XPATH, "//button[contains(text(), 'Logout')]")
        browser.find_element(*logout_button).click()
    
    # Test EU region user
    login_page.load()
    login_page.login("euuser@example.com", "Password123!")  # EU user
    assert login_page.is_login_successful(), "EU user login failed"
    dashboard_helper.wait_for_dashboard_load()
    
    # Check for EU-specific content
    eu_page_source = browser.page_source
    
    # Verify the content is different between regions
    assert na_page_source != eu_page_source, "Content should differ between NA and EU regions"
