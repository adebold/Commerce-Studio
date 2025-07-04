"""
End-to-End tests for the demo store functionality.

This module contains tests for the demo store, including
page loading, filtering, and product interactions.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from tests.e2e.page_objects.demo_store_page import DemoStorePage


def test_demo_store_loads(browser, base_url):
    """Test that the demo store loads successfully with all key elements.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create a demo store page object
    demo_store = DemoStorePage(browser, base_url)
    
    # Navigate to demo store page
    demo_store.load()
    
    # Verify page has loaded with key elements
    assert demo_store.is_loaded(), "Demo store page did not load properly"
    
    # Verify filters section is present
    assert demo_store.has_filters(), "Filters section not fully loaded"


def test_demo_store_filter_interaction(browser, base_url):
    """Test interaction with filters on the demo store page.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create a demo store page object
    demo_store = DemoStorePage(browser, base_url)
    
    # Navigate to demo store page
    demo_store.load()
    
    # Verify page has loaded
    assert demo_store.is_loaded(), "Demo store page did not load properly"
    
    try:
        # Check if products are loaded initially
        initial_products_loaded = demo_store.has_products()
        
        # Select a face shape filter
        demo_store.select_face_shape("oval")
        
        # Wait a moment for the filter to apply (we could make this more robust)
        demo_store.driver.implicitly_wait(1)
        
        # Verify products are still displayed
        assert demo_store.has_products(), "No products displayed after applying face shape filter"
        
        # Reset filters
        demo_store.reset_filters()
        
        # Verify products are still displayed
        assert demo_store.has_products(), "No products displayed after resetting filters"
        
    except TimeoutException:
        pytest.fail("Filter interaction test timed out")


def test_demo_store_face_shape_guide(browser, base_url):
    """Test that the face shape guide modal opens.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create a demo store page object
    demo_store = DemoStorePage(browser, base_url)
    
    # Navigate to demo store page
    demo_store.load()
    
    # Verify page has loaded
    assert demo_store.is_loaded(), "Demo store page did not load properly"
    
    try:
        # Click on face shape guide link
        demo_store.click_face_shape_guide()
        
        # Verify face shape guide modal appears
        face_shape_modal = (By.ID, "faceshapeModal")
        assert demo_store.is_element_present(face_shape_modal), "Face shape guide modal did not appear"
        
    except TimeoutException:
        pytest.fail("Face shape guide test timed out")
    except Exception as e:
        pytest.fail(f"Face shape guide test failed: {str(e)}")


def test_demo_store_product_interaction(browser, base_url):
    """Test interaction with products on the demo store page.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Create a demo store page object
    demo_store = DemoStorePage(browser, base_url)
    
    # Navigate to demo store page
    demo_store.load()
    
    # Verify page has loaded
    assert demo_store.is_loaded(), "Demo store page did not load properly"
    
    try:
        # Check if products are loaded
        assert demo_store.has_products(), "No products displayed on initial page load"
        
        # Click on the first product
        demo_store.click_product(0)
        
        # Verify product modal appears
        product_modal = (By.ID, "productModal")
        assert demo_store.is_element_present(product_modal), "Product modal did not appear"
        
    except TimeoutException:
        pytest.fail("Product interaction test timed out")
    except IndexError:
        pytest.fail("No products available to click")
    except Exception as e:
        pytest.fail(f"Product interaction test failed: {str(e)}")
