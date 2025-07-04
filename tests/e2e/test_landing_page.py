"""
End-to-End tests for the landing page functionality.

This module contains tests for the landing page, including
page loading, element verification, and navigation.
"""

import pytest
from selenium.common.exceptions import TimeoutException
from tests.e2e.page_objects.landing_page import LandingPage
from tests.e2e.page_objects.login_page import LoginPage
from tests.e2e.page_objects.demo_store_page import DemoStorePage


def test_landing_page_loads(browser, base_url):
    """Test that the landing page loads successfully with all key elements.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create a landing page object
    landing_page = LandingPage(browser, base_url)
    
    # Navigate to landing page
    landing_page.load()
    
    # Verify page has loaded with key elements
    assert landing_page.is_loaded(), "Landing page did not load properly"
    
    # Verify hero title is present
    hero_title = landing_page.get_hero_title_text()
    assert "EyewearML Platform" in hero_title, f"Unexpected hero title: {hero_title}"
    
    # Verify platform benefits section
    assert landing_page.has_platform_benefits(), "Platform benefits section not fully loaded"


def test_landing_page_navigation_to_login(browser, base_url):
    """Test navigation from landing page to login page.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    landing_page = LandingPage(browser, base_url)
    login_page = LoginPage(browser, base_url)
    
    # Navigate to landing page
    landing_page.load()
    
    # Verify landing page is loaded
    assert landing_page.is_loaded(), "Landing page did not load properly"
    
    # Click on sign in button
    landing_page.click_sign_in()
    
    # Verify redirected to login page
    assert login_page.is_on_login_page(), "Not redirected to login page after clicking Sign In"


def test_landing_page_navigation_to_demo_store(browser, base_url):
    """Test navigation from landing page to demo store.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    landing_page = LandingPage(browser, base_url)
    demo_store_page = DemoStorePage(browser, base_url)
    
    # Navigate to landing page
    landing_page.load()
    
    # Verify landing page is loaded
    assert landing_page.is_loaded(), "Landing page did not load properly"
    
    # Click on demo store button
    landing_page.click_demo_store()
    
    # Wait for redirect (demo store may open in a new tab)
    try:
        # If the demo store opens in a new tab, switch to it
        if len(browser.window_handles) > 1:
            browser.switch_to.window(browser.window_handles[-1])
        
        # Verify the demo store page is loaded
        assert demo_store_page.is_loaded(), "Demo store page did not load properly"
        
    except TimeoutException:
        pytest.fail("Demo store page did not load within timeout")


def test_landing_page_navigation_to_signup(browser, base_url):
    """Test navigation from landing page to signup page.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create page objects
    landing_page = LandingPage(browser, base_url)
    
    # Navigate to landing page
    landing_page.load()
    
    # Verify landing page is loaded
    assert landing_page.is_loaded(), "Landing page did not load properly"
    
    # Click on sign up button (located in the CTA section)
    landing_page.click_sign_up()
    
    # Verify redirected to signup page
    assert "/register" in browser.current_url, "Not redirected to register page after clicking Sign Up"
