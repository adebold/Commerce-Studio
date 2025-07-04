"""
End-to-End tests for user page access based on role.

This module verifies that different user types can access only the 
pages they are authorized to view, and cannot access restricted pages.
"""

import pytest
from tests.e2e.page_objects.login_page import LoginPage
from tests.e2e.page_objects.landing_page import LandingPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


class PageAccessTestHelper:
    """Helper class for page access tests across user types."""

    # Common selectors
    PAGE_TITLE = (By.CSS_SELECTOR, "h1, h2")
    ACCESS_DENIED_MESSAGE = (By.CSS_SELECTOR, ".access-denied, .permission-error")
    
    # Common user navigation paths
    USER_PATHS = {
        "anonymous": [
            "/",                # Home page
            "/products",        # Products page
            "/solutions",       # Solutions page
            "/pricing",         # Pricing page
            "/app-store",       # App Store
            "/auth"             # Login page
        ],
        "user": [
            "/",                # Home page
            "/products",        # Products page
            "/solutions",       # Solutions page
            "/pricing",         # Pricing page
            "/app-store",       # App Store
            "/frame-finder",    # Frame Finder
            "/style-recommendations", # Style Recommendations
            "/fit-consultation", # Fit Consultation
            "/viewer-dashboard"  # Viewer Dashboard
        ],
        "admin": [
            "/",                # Home page
            "/products",        # Products page
            "/solutions",       # Solutions page
            "/pricing",         # Pricing page
            "/app-store",       # App Store
            "/frame-finder",    # Frame Finder
            "/style-recommendations", # Style Recommendations
            "/fit-consultation", # Fit Consultation
            "/super-admin-dashboard", # Admin Dashboard
            "/api-documentation" # API Documentation
        ],
        "optician": [
            "/",                # Home page
            "/products",        # Products page
            "/solutions",       # Solutions page
            "/pricing",         # Pricing page
            "/app-store",       # App Store
            "/frame-finder",    # Frame Finder
            "/style-recommendations", # Style Recommendations
            "/fit-consultation", # Fit Consultation
            "/client-admin-dashboard" # Client Admin Dashboard
        ],
        "brand_manager": [
            "/",                # Home page
            "/products",        # Products page
            "/solutions",       # Solutions page
            "/pricing",         # Pricing page
            "/app-store",       # App Store
            "/frame-finder",    # Frame Finder
            "/style-recommendations", # Style Recommendations
            "/fit-consultation", # Fit Consultation
            "/brand-manager-dashboard" # Brand Manager Dashboard
        ]
    }
    
    # Restricted pages for each user type
    RESTRICTED_PATHS = {
        "anonymous": [
            "/super-admin-dashboard",
            "/client-admin-dashboard",
            "/brand-manager-dashboard",
            "/viewer-dashboard",
            "/api-documentation"
        ],
        "user": [
            "/super-admin-dashboard",
            "/client-admin-dashboard",
            "/brand-manager-dashboard",
            "/api-documentation"
        ],
        "admin": [
            "/client-admin-dashboard",
            "/brand-manager-dashboard",
            "/viewer-dashboard"
        ],
        "optician": [
            "/super-admin-dashboard",
            "/brand-manager-dashboard",
            "/viewer-dashboard",
            "/api-documentation"
        ],
        "brand_manager": [
            "/super-admin-dashboard",
            "/client-admin-dashboard",
            "/viewer-dashboard",
            "/api-documentation"
        ]
    }
    
    def __init__(self, browser, base_url):
        """Initialize page access helper.
        
        Args:
            browser: Selenium WebDriver instance
            base_url: Base URL of the application
        """
        self.browser = browser
        self.base_url = base_url
        self.wait = WebDriverWait(browser, 5)
    
    def navigate_to(self, path):
        """Navigate to specific path.
        
        Args:
            path: URL path to navigate to
            
        Returns:
            bool: True if navigation succeeded, False otherwise
        """
        url = f"{self.base_url}{path}"
        self.browser.get(url)
        return True
    
    def is_page_accessible(self):
        """Check if the current page is accessible (no access denied message).
        
        Returns:
            bool: True if page is accessible, False if access denied
        """
        try:
            # If we find an access denied message, page is not accessible
            self.wait.until(EC.visibility_of_element_located(self.ACCESS_DENIED_MESSAGE))
            return False
        except TimeoutException:
            # No access denied message found, page is accessible
            return True
    
    def get_page_title(self):
        """Get the page title text.
        
        Returns:
            str: Page title text or empty string if not found
        """
        try:
            return self.wait.until(EC.visibility_of_element_located(self.PAGE_TITLE)).text
        except TimeoutException:
            return ""


def logout(browser):
    """Helper function to log out.
    
    Args:
        browser: Selenium WebDriver instance
    """
    try:
        # Find user profile menu
        profile_menu = browser.find_element(By.ID, "user-profile-menu")
        profile_menu.click()
        
        # Find and click logout button
        logout_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Logout')]")
        logout_button.click()
        
        # Wait for logout to complete
        WebDriverWait(browser, 10).until(
            EC.url_contains("/")
        )
    except:
        # If an exception occurs, navigate to home page
        browser.get("/")


def test_anonymous_user_page_access(browser, base_url):
    """Test page access for anonymous (not logged in) users.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Ensure user is logged out
    logout(browser)
    
    # Create helpers
    access_helper = PageAccessTestHelper(browser, base_url)
    
    # Check accessible pages
    for path in access_helper.USER_PATHS["anonymous"]:
        access_helper.navigate_to(path)
        assert access_helper.is_page_accessible(), f"Anonymous user should be able to access {path}"
    
    # Check restricted pages
    for path in access_helper.RESTRICTED_PATHS["anonymous"]:
        access_helper.navigate_to(path)
        assert not access_helper.is_page_accessible() or "login" in browser.current_url.lower(), \
            f"Anonymous user should not be able to access {path}"


def test_regular_user_page_access(browser, base_url):
    """Test page access for regular users.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    access_helper = PageAccessTestHelper(browser, base_url)
    
    # Ensure user is logged out
    logout(browser)
    
    # Login as regular user
    login_page.load()
    login_page.login("test@example.com", "Password123!")
    
    # Check accessible pages
    for path in access_helper.USER_PATHS["user"]:
        access_helper.navigate_to(path)
        assert access_helper.is_page_accessible(), f"Regular user should be able to access {path}"
    
    # Check restricted pages
    for path in access_helper.RESTRICTED_PATHS["user"]:
        access_helper.navigate_to(path)
        assert not access_helper.is_page_accessible(), f"Regular user should not be able to access {path}"


def test_admin_user_page_access(browser, base_url):
    """Test page access for admin users.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    access_helper = PageAccessTestHelper(browser, base_url)
    
    # Ensure user is logged out
    logout(browser)
    
    # Login as admin user
    login_page.load()
    login_page.login("admin@example.com", "AdminPass456!")
    
    # Check accessible pages
    for path in access_helper.USER_PATHS["admin"]:
        access_helper.navigate_to(path)
        assert access_helper.is_page_accessible(), f"Admin user should be able to access {path}"
    
    # Check restricted pages
    for path in access_helper.RESTRICTED_PATHS["admin"]:
        access_helper.navigate_to(path)
        assert not access_helper.is_page_accessible(), f"Admin user should not be able to access {path}"


def test_optician_user_page_access(browser, base_url):
    """Test page access for optician users.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    access_helper = PageAccessTestHelper(browser, base_url)
    
    # Ensure user is logged out
    logout(browser)
    
    # Login as optician user
    login_page.load()
    login_page.login("optician@example.com", "Optician123!")
    
    # Check accessible pages
    for path in access_helper.USER_PATHS["optician"]:
        access_helper.navigate_to(path)
        assert access_helper.is_page_accessible(), f"Optician user should be able to access {path}"
    
    # Check restricted pages
    for path in access_helper.RESTRICTED_PATHS["optician"]:
        access_helper.navigate_to(path)
        assert not access_helper.is_page_accessible(), f"Optician user should not be able to access {path}"


def test_dashboard_redirects(browser, base_url):
    """Test that users are redirected to the appropriate dashboard after login.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    
    # Test admin redirect
    logout(browser)
    login_page.load()
    login_page.login("admin@example.com", "AdminPass456!")
    WebDriverWait(browser, 10).until(
        EC.url_contains("/super-admin-dashboard")
    )
    
    # Test optician redirect
    logout(browser)
    login_page.load()
    login_page.login("optician@example.com", "Optician123!")
    WebDriverWait(browser, 10).until(
        EC.url_contains("/client-admin-dashboard")
    )
    
    # Test regular user redirect
    logout(browser)
    login_page.load()
    login_page.login("test@example.com", "Password123!")
    WebDriverWait(browser, 10).until(
        EC.url_contains("/viewer-dashboard")
    )


def test_failed_authorization_feedback(browser, base_url):
    """Test that users receive appropriate feedback when accessing restricted pages.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    login_page = LoginPage(browser, base_url)
    access_helper = PageAccessTestHelper(browser, base_url)
    
    # Login as regular user
    logout(browser)
    login_page.load()
    login_page.login("test@example.com", "Password123!")
    
    # Try to access restricted admin page
    access_helper.navigate_to("/super-admin-dashboard")
    
    # Check for feedback
    try:
        error_message = browser.find_element(*access_helper.ACCESS_DENIED_MESSAGE).text.lower()
        assert "permission" in error_message or "access denied" in error_message or "not authorized" in error_message, \
            "Access denied message should explain the authorization failure"
    except:
        # If no explicit error message, at least we should not be on the admin page
        current_url = browser.current_url.lower()
        assert "/super-admin-dashboard" not in current_url, \
            "User should not be able to access the admin dashboard"
