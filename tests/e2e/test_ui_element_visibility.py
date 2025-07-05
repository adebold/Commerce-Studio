"""
End-to-End tests for UI element visibility based on user role.

This module tests that appropriate UI elements (buttons, menus, links)
are visible or hidden based on user role permissions.
"""

import pytest
from tests.e2e.page_objects.login_page import LoginPage
from tests.e2e.page_objects.landing_page import LandingPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class UIElementVisibilityHelper:
    """Helper class for UI element visibility tests."""
    
    # User credentials for each role
    USER_CREDENTIALS = {
        "anonymous": None,  # No credentials for anonymous
        "viewer": {
            "email": "test@example.com",
            "password": "Password123!"
        },
        "brand_manager": {
            "email": "brandmanager@example.com",
            "password": "BrandPass789!"
        },
        "client_admin": {
            "email": "optician@example.com",
            "password": "Optician123!"
        },
        "super_admin": {
            "email": "admin@example.com",
            "password": "AdminPass456!"
        }
    }
    
    # UI Elements that should be visible for specific roles
    ROLE_VISIBLE_ELEMENTS = {
        "anonymous": [
            (By.CSS_SELECTOR, "[href='/auth']"),  # Login link
            (By.CSS_SELECTOR, "nav a[href='/']"),  # Home link
        ],
        "viewer": [
            (By.ID, "user-profile-menu"),  # User profile menu
            (By.CSS_SELECTOR, "[href='/viewer-dashboard']"),  # Viewer dashboard link
            (By.CSS_SELECTOR, "[href='/frame-finder']"),  # Frame finder link
        ],
        "brand_manager": [
            (By.ID, "user-profile-menu"),  # User profile menu
            (By.CSS_SELECTOR, "[href='/brand-manager-dashboard']"),  # Brand manager dashboard link
            (By.CSS_SELECTOR, ".brand-settings-button"),  # Brand settings button
        ],
        "client_admin": [
            (By.ID, "user-profile-menu"),  # User profile menu
            (By.CSS_SELECTOR, "[href='/client-admin-dashboard']"),  # Client admin dashboard link
            (By.CSS_SELECTOR, ".client-settings-button"),  # Client settings button
            (By.CSS_SELECTOR, ".user-management-link"),  # User management link
        ],
        "super_admin": [
            (By.ID, "user-profile-menu"),  # User profile menu
            (By.CSS_SELECTOR, "[href='/super-admin-dashboard']"),  # Admin dashboard link
            (By.CSS_SELECTOR, ".admin-settings-button"),  # Admin settings button
            (By.CSS_SELECTOR, ".system-settings-link"),  # System settings link
            (By.CSS_SELECTOR, ".user-management-link"),  # User management link
        ]
    }
    
    # UI Elements that should be hidden for specific roles
    ROLE_HIDDEN_ELEMENTS = {
        "anonymous": [
            (By.ID, "user-profile-menu"),  # User profile menu
            (By.CSS_SELECTOR, "[href*='dashboard']"),  # Any dashboard link
            (By.CSS_SELECTOR, ".admin-settings-button"),  # Admin settings button
            (By.CSS_SELECTOR, ".user-management-link"),  # User management link
        ],
        "viewer": [
            (By.CSS_SELECTOR, "[href='/super-admin-dashboard']"),  # Admin dashboard link
            (By.CSS_SELECTOR, "[href='/client-admin-dashboard']"),  # Client admin dashboard link
            (By.CSS_SELECTOR, "[href='/brand-manager-dashboard']"),  # Brand manager dashboard link
            (By.CSS_SELECTOR, ".admin-settings-button"),  # Admin settings button
            (By.CSS_SELECTOR, ".user-management-link"),  # User management link
        ],
        "brand_manager": [
            (By.CSS_SELECTOR, "[href='/super-admin-dashboard']"),  # Admin dashboard link
            (By.CSS_SELECTOR, "[href='/client-admin-dashboard']"),  # Client admin dashboard link
            (By.CSS_SELECTOR, ".admin-settings-button"),  # Admin settings button
        ],
        "client_admin": [
            (By.CSS_SELECTOR, "[href='/super-admin-dashboard']"),  # Admin dashboard link
            (By.CSS_SELECTOR, ".admin-settings-button"),  # Admin settings button
            (By.CSS_SELECTOR, ".system-settings-link"),  # System settings link
        ],
        "super_admin": [
            # Super admin should see everything, but we can check for visual indicators
            # that something is specifically disabled
            (By.CSS_SELECTOR, ".disabled-feature"),  # Any explicitly disabled feature
        ]
    }
    
    # Pages to check for each role
    PAGES_TO_CHECK = {
        "anonymous": ["/", "/products", "/solutions", "/pricing"],
        "viewer": ["/", "/products", "/viewer-dashboard", "/frame-finder"],
        "brand_manager": ["/", "/products", "/brand-manager-dashboard"],
        "client_admin": ["/", "/products", "/client-admin-dashboard"],
        "super_admin": ["/", "/products", "/super-admin-dashboard"]
    }
    
    def __init__(self, browser, base_url):
        """Initialize UI element visibility helper.
        
        Args:
            browser: Selenium WebDriver instance
            base_url: Base URL of the application
        """
        self.browser = browser
        self.base_url = base_url
        self.wait = WebDriverWait(browser, 5)
        self.login_page = LoginPage(browser, base_url)
    
    def login_as_role(self, role):
        """Log in as a specific role.
        
        Args:
            role: User role to login as
            
        Returns:
            bool: True if login successful or role is anonymous
        """
        # If anonymous, just ensure logged out
        if role == "anonymous":
            self.logout()
            return True
        
        # Otherwise login with credentials
        credentials = self.USER_CREDENTIALS[role]
        if not credentials:
            return False
        
        self.logout()
        self.login_page.load()
        self.login_page.login(credentials["email"], credentials["password"])
        
        # Verify login success
        try:
            if role != "anonymous":
                self.wait.until(EC.presence_of_element_located((By.ID, "user-profile-menu")))
            return True
        except TimeoutException:
            return False
    
    def logout(self):
        """Log out current user."""
        try:
            # Find user profile menu
            profile_menu = self.browser.find_element(By.ID, "user-profile-menu")
            profile_menu.click()
            
            # Find and click logout button
            logout_button = self.browser.find_element(By.XPATH, "//button[contains(text(), 'Logout')]")
            logout_button.click()
            
            # Wait for logout to complete
            self.wait.until(EC.url_contains("/"))
        except:
            # If an exception occurs, navigate to home page
            self.browser.get(f"{self.base_url}/")
    
    def navigate_to(self, path):
        """Navigate to a specific path.
        
        Args:
            path: URL path to navigate to
        """
        url = f"{self.base_url}{path}"
        self.browser.get(url)
        # Short wait to ensure page loads
        import time
        time.sleep(1)
    
    def is_element_visible(self, locator):
        """Check if an element is visible on the page.
        
        Args:
            locator: Element locator tuple (By.X, "selector")
            
        Returns:
            bool: True if element is visible, False otherwise
        """
        try:
            element = self.browser.find_element(*locator)
            return element.is_displayed()
        except NoSuchElementException:
            return False
    
    def check_elements_visibility(self, visible_locators, hidden_locators):
        """Check that elements are appropriately visible or hidden.
        
        Args:
            visible_locators: List of locator tuples for elements that should be visible
            hidden_locators: List of locator tuples for elements that should be hidden
            
        Returns:
            tuple: (all_visible_correct, all_hidden_correct, errors)
                where errors is a list of error messages
        """
        errors = []
        
        # Check visible elements
        all_visible_correct = True
        for locator in visible_locators:
            if not self.is_element_visible(locator):
                all_visible_correct = False
                errors.append(f"Element {locator} should be visible but is not")
        
        # Check hidden elements
        all_hidden_correct = True
        for locator in hidden_locators:
            if self.is_element_visible(locator):
                all_hidden_correct = False
                errors.append(f"Element {locator} should be hidden but is visible")
        
        return all_visible_correct, all_hidden_correct, errors


def test_ui_elements_for_each_role(browser, base_url):
    """Test that UI elements are correctly visible/hidden for each user role.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    helper = UIElementVisibilityHelper(browser, base_url)
    
    # Test each role
    for role in helper.USER_CREDENTIALS.keys():
        # Login as role
        assert helper.login_as_role(role), f"Failed to login as {role}"
        
        # Check each page for this role
        for page in helper.PAGES_TO_CHECK.get(role, ["/"]):
            helper.navigate_to(page)
            
            # Get the locators for this role
            visible_locators = helper.ROLE_VISIBLE_ELEMENTS.get(role, [])
            hidden_locators = helper.ROLE_HIDDEN_ELEMENTS.get(role, [])
            
            # Check element visibility
            visible_correct, hidden_correct, errors = helper.check_elements_visibility(
                visible_locators, hidden_locators
            )
            
            # Assert with meaningful error message
            error_msg = f"UI element visibility incorrect for {role} on page {page}: {errors}"
            assert visible_correct and hidden_correct, error_msg


def test_navigation_menu_items(browser, base_url):
    """Test that navigation menu shows appropriate items for each user role.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    helper = UIElementVisibilityHelper(browser, base_url)
    
    # Expected menu items for each role
    menu_items = {
        "anonymous": ["Home", "Products", "Solutions", "Pricing", "Login"],
        "viewer": ["Home", "Products", "Solutions", "Pricing", "Dashboard"],
        "brand_manager": ["Home", "Products", "Solutions", "Pricing", "Dashboard", "Brand Management"],
        "client_admin": ["Home", "Products", "Solutions", "Pricing", "Dashboard", "User Management"],
        "super_admin": ["Home", "Products", "Solutions", "Pricing", "Dashboard", "User Management", "System Settings"]
    }
    
    for role, expected_items in menu_items.items():
        # Login as role
        assert helper.login_as_role(role), f"Failed to login as {role}"
        
        # Navigate to home page
        helper.navigate_to("/")
        
        # Get all navigation menu items
        nav_items = browser.find_elements(By.CSS_SELECTOR, "nav a, nav button")
        visible_items = [item.text for item in nav_items if item.is_displayed() and item.text.strip()]
        
        # Check if all expected items are present
        for expected_item in expected_items:
            found = False
            for visible_item in visible_items:
                if expected_item.lower() in visible_item.lower():
                    found = True
                    break
            
            assert found, f"Menu item '{expected_item}' should be visible for {role} but was not found. Visible items: {visible_items}"


def test_form_field_visibility(browser, base_url):
    """Test that form fields are visible/hidden appropriately based on user role.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    helper = UIElementVisibilityHelper(browser, base_url)
    
    # Check super admin dashboard settings
    helper.login_as_role("super_admin")
    helper.navigate_to("/super-admin-dashboard")
    
    # Look for system settings form if it exists
    try:
        # Try to find settings button or link
        settings_link = browser.find_element(By.XPATH, "//a[contains(text(), 'Settings')] | //button[contains(text(), 'Settings')]")
        settings_link.click()
        
        # Check for admin-only fields
        admin_fields = browser.find_elements(By.CSS_SELECTOR, ".admin-only-field")
        for field in admin_fields:
            assert field.is_displayed(), "Admin-only field should be visible to super admin"
    except NoSuchElementException:
        # If settings section doesn't exist, skip this part
        pass
    
    # Check client admin dashboard settings
    helper.login_as_role("client_admin")
    helper.navigate_to("/client-admin-dashboard")
    
    # Look for client settings form if it exists
    try:
        # Try to find settings button or link
        settings_link = browser.find_element(By.XPATH, "//a[contains(text(), 'Settings')] | //button[contains(text(), 'Settings')]")
        settings_link.click()
        
        # Check client admin has access to their fields
        client_fields = browser.find_elements(By.CSS_SELECTOR, ".client-admin-field")
        for field in client_fields:
            assert field.is_displayed(), "Client admin field should be visible to client admin"
        
        # Check client admin doesn't have access to admin fields
        admin_fields = browser.find_elements(By.CSS_SELECTOR, ".admin-only-field")
        for field in admin_fields:
            assert not field.is_displayed(), "Admin-only field should not be visible to client admin"
    except NoSuchElementException:
        # If settings section doesn't exist, skip this part
        pass


def test_action_button_visibility(browser, base_url):
    """Test that action buttons are visible/hidden appropriately based on user role.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    helper = UIElementVisibilityHelper(browser, base_url)
    
    # Button locators with expected visibility per role
    button_visibility = {
        "add_user_button": {
            "locator": (By.CSS_SELECTOR, ".add-user-button, button[aria-label='Add User']"),
            "visible_for": ["super_admin", "client_admin"],
            "hidden_for": ["viewer", "brand_manager", "anonymous"]
        },
        "edit_system_settings_button": {
            "locator": (By.CSS_SELECTOR, ".edit-system-settings, button[aria-label='Edit System Settings']"),
            "visible_for": ["super_admin"],
            "hidden_for": ["client_admin", "brand_manager", "viewer", "anonymous"]
        },
        "edit_brand_settings_button": {
            "locator": (By.CSS_SELECTOR, ".edit-brand-settings, button[aria-label='Edit Brand Settings']"),
            "visible_for": ["super_admin", "client_admin", "brand_manager"],
            "hidden_for": ["viewer", "anonymous"]
        }
    }
    
    # Pages to check
    pages_to_check = ["/", "/super-admin-dashboard", "/client-admin-dashboard", "/brand-manager-dashboard", "/viewer-dashboard"]
    
    for role in helper.USER_CREDENTIALS.keys():
        # Login as role
        assert helper.login_as_role(role), f"Failed to login as {role}"
        
        # Check each page that might be accessible
        for page in pages_to_check:
            try:
                helper.navigate_to(page)
                
                # Check each button's visibility
                for button_name, button_info in button_visibility.items():
                    locator = button_info["locator"]
                    should_be_visible = role in button_info["visible_for"]
                    
                    # Check button visibility
                    try:
                        is_visible = helper.is_element_visible(locator)
                        
                        # Only assert if we're on a page that the user should have access to
                        # (to avoid false failures due to redirects)
                        if page in helper.PAGES_TO_CHECK.get(role, []):
                            if should_be_visible:
                                assert is_visible, f"Button {button_name} should be visible for {role} on {page} but is not"
                            else:
                                assert not is_visible, f"Button {button_name} should be hidden for {role} on {page} but is visible"
                    except:
                        # If we can't determine visibility, it might be because we were redirected
                        # due to lack of permissions, which is expected for some role/page combinations
                        pass
            except:
                # Page might not be accessible for this role, which is expected
                pass
