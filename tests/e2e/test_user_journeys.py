"""
End-to-End tests for complete user journeys.

This module contains tests for complete user flows through the EyewearML
application, from authentication to recommendations to selection and checkout.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from tests.e2e.page_objects.login_page import LoginPage


def test_new_user_full_journey(browser, base_url, api_client, api_url):
    """Test complete journey for a new user from signup to checkout.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
        api_client: API client fixture
        api_url: Base API URL
    """
    # Step 1: Navigate to the signup page
    browser.get(f"{base_url}/signup")
    
    # Verify we're on the signup page
    assert "signup" in browser.current_url.lower()
    
    # Step 2: Fill out the signup form with test user information
    email_field = browser.find_element(By.ID, "email")
    password_field = browser.find_element(By.ID, "password")
    confirm_password_field = browser.find_element(By.ID, "confirmPassword")
    first_name_field = browser.find_element(By.ID, "firstName")
    last_name_field = browser.find_element(By.ID, "lastName")
    
    # Generate a unique email address
    test_email = f"test_user_{int(time.time())}@example.com"
    
    email_field.send_keys(test_email)
    password_field.send_keys("Password123!")
    confirm_password_field.send_keys("Password123!")
    first_name_field.send_keys("Test")
    last_name_field.send_keys("User")
    
    # Check the terms and conditions checkbox
    terms_checkbox = browser.find_element(By.ID, "termsCheckbox")
    terms_checkbox.click()
    
    # Submit the form
    signup_button = browser.find_element(By.XPATH, "//button[@type='submit']")
    signup_button.click()
    
    # Wait for onboarding page to load after successful signup
    WebDriverWait(browser, 10).until(
        lambda x: "/onboarding" in x.current_url
    )
    
    # Step 3: Complete the onboarding process
    # Page 1: Select face shape
    face_shape_option = browser.find_element(By.CSS_SELECTOR, "div.face-shape-option[data-shape='oval']")
    face_shape_option.click()
    
    # Click next button
    next_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
    next_button.click()
    
    # Page 2: Select style preferences
    style_option = browser.find_element(By.CSS_SELECTOR, "div.style-option[data-style='minimal']")
    style_option.click()
    
    # Click next button
    next_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
    next_button.click()
    
    # Page 3: Select color preferences
    color_option = browser.find_element(By.CSS_SELECTOR, "div.color-option[data-color='gold']")
    color_option.click()
    
    # Click finish button
    finish_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Finish')]")
    finish_button.click()
    
    # Wait for recommendations page to load
    WebDriverWait(browser, 10).until(
        lambda x: "/recommendations" in x.current_url
    )
    
    # Step 4: Select a frame from recommendations
    # Verify recommendations are displayed
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.recommendation-item"))
    )
    
    # Click on the first recommendation
    recommendation_items = browser.find_elements(By.CSS_SELECTOR, "div.recommendation-item")
    assert len(recommendation_items) > 0, "No recommendations displayed"
    recommendation_items[0].click()
    
    # Wait for frame detail page to load
    WebDriverWait(browser, 10).until(
        lambda x: "/frames/" in x.current_url
    )
    
    # Step 5: Customize the selected frame
    # Select lens type
    lens_option = browser.find_element(By.CSS_SELECTOR, "div.lens-option[data-type='blue-light']")
    lens_option.click()
    
    # Select additional features
    coating_option = browser.find_element(By.CSS_SELECTOR, "div.coating-option[data-coating='anti-glare']")
    coating_option.click()
    
    # Step 6: Add to cart
    add_to_cart_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Add to Cart')]")
    add_to_cart_button.click()
    
    # Wait for confirmation message
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.cart-confirmation"))
    )
    
    # Navigate to cart
    view_cart_button = browser.find_element(By.XPATH, "//a[contains(text(), 'View Cart')]")
    view_cart_button.click()
    
    # Wait for cart page to load
    WebDriverWait(browser, 10).until(
        lambda x: "/cart" in x.current_url
    )
    
    # Verify the selected frame is in the cart
    cart_items = browser.find_elements(By.CSS_SELECTOR, "div.cart-item")
    assert len(cart_items) > 0, "No items in cart"
    
    # Step 7: Proceed to checkout
    checkout_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Checkout')]")
    checkout_button.click()
    
    # Wait for checkout page to load
    WebDriverWait(browser, 10).until(
        lambda x: "/checkout" in x.current_url
    )
    
    # Fill shipping information (assuming first-time checkout)
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.ID, "address1"))
    )
    
    address_field = browser.find_element(By.ID, "address1")
    city_field = browser.find_element(By.ID, "city")
    state_field = browser.find_element(By.ID, "state")
    zip_field = browser.find_element(By.ID, "zipCode")
    
    address_field.send_keys("123 Test St")
    city_field.send_keys("Test City")
    state_field.send_keys("CA")
    zip_field.send_keys("12345")
    
    # Continue to payment
    continue_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Continue to Payment')]")
    continue_button.click()
    
    # Wait for payment section to become visible
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.ID, "cardNumber"))
    )
    
    # Fill payment information (in a real test, would use a test payment provider)
    # For this E2E test, we'll just verify the payment page loads
    assert browser.find_element(By.ID, "cardNumber").is_displayed(), "Payment form not displayed"
    
    # For test purposes, we'll stop before actual payment processing
    # In a real test, we might use a test payment processor to complete the flow
    
    # Verify the order summary is correct
    order_summary = browser.find_element(By.CSS_SELECTOR, "div.order-summary")
    assert order_summary.is_displayed(), "Order summary not displayed"
    assert "Total" in order_summary.text, "Total price not found in order summary"
    
    # Clean up - delete the test user via API
    # This step ensures the test doesn't leave test data behind
    api_client.delete(f"{api_url}/users/cleanup-test", json={"email": test_email})


def test_returning_user_journey(authenticated_browser, base_url, api_url, authenticated_api_client):
    """Test journey for a returning user with existing account and history.
    
    Args:
        authenticated_browser: Authenticated WebDriver instance
        base_url: Base URL of the application
        api_url: Base API URL
        authenticated_api_client: Authenticated API client fixture
    """
    # Step 1: Navigate to the dashboard
    authenticated_browser.get(f"{base_url}/dashboard")
    
    # Verify dashboard has loaded
    WebDriverWait(authenticated_browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.dashboard-container"))
    )
    
    # Step 2: View order history
    order_history_link = authenticated_browser.find_element(By.XPATH, "//a[contains(text(), 'Order History')]")
    order_history_link.click()
    
    # Wait for order history page to load
    WebDriverWait(authenticated_browser, 10).until(
        lambda x: "/orders" in x.current_url
    )
    
    # Verify order history is displayed
    orders = authenticated_browser.find_elements(By.CSS_SELECTOR, "div.order-item")
    
    # If no orders yet, create a test order via API
    if len(orders) == 0:
        # Create a test order via API
        order_data = {
            "items": [
                {
                    "frame_id": "frame-123",
                    "lens_type": "standard",
                    "coatings": ["anti-glare"]
                }
            ],
            "shipping_address": {
                "address1": "123 Test St",
                "city": "Test City",
                "state": "CA",
                "zip": "12345"
            }
        }
        
        response = authenticated_api_client.post(f"{api_url}/orders", json=order_data)
        assert response.status_code == 201, f"Failed to create test order: {response.text}"
        
        # Refresh the page to see the new order
        authenticated_browser.refresh()
        
        # Wait for orders to load
        WebDriverWait(authenticated_browser, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div.order-item"))
        )
        
        orders = authenticated_browser.find_elements(By.CSS_SELECTOR, "div.order-item")
    
    assert len(orders) > 0, "No orders found in history"
    
    # Step 3: Reorder a previous frame from history
    reorder_button = authenticated_browser.find_element(By.XPATH, "//button[contains(text(), 'Reorder')]")
    reorder_button.click()
    
    # Wait for confirmation dialog
    WebDriverWait(authenticated_browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.reorder-dialog"))
    )
    
    # Confirm reorder
    confirm_button = authenticated_browser.find_element(By.XPATH, "//button[contains(text(), 'Confirm')]")
    confirm_button.click()
    
    # Wait for cart page to load
    WebDriverWait(authenticated_browser, 10).until(
        lambda x: "/cart" in x.current_url
    )
    
    # Verify the reordered frame is in the cart
    cart_items = authenticated_browser.find_elements(By.CSS_SELECTOR, "div.cart-item")
    assert len(cart_items) > 0, "No items in cart after reorder"
    
    # Step 4: View personalized recommendations based on history
    authenticated_browser.get(f"{base_url}/recommendations/personalized")
    
    # Wait for recommendations to load
    WebDriverWait(authenticated_browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.recommendation-item"))
    )
    
    # Verify personalized recommendations are displayed
    recommendations = authenticated_browser.find_elements(By.CSS_SELECTOR, "div.recommendation-item")
    assert len(recommendations) > 0, "No personalized recommendations displayed"
    
    # Verify personalization indicator is present
    personalization_indicator = authenticated_browser.find_element(By.CSS_SELECTOR, "div.personalization-indicator")
    assert personalization_indicator.is_displayed(), "Personalization indicator not displayed"
    assert "Based on your history" in personalization_indicator.text, "Personalization attribution not displayed"


def test_client_portal_journey(browser, base_url, api_client, api_url):
    """Test the client portal user journey for opticians.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
        api_client: API client fixture
        api_url: Base API URL
    """
    # Step 1: Navigate to the client portal
    browser.get(f"{base_url}/client-portal/login")
    
    # Verify we're on the client portal login page
    assert "client-portal" in browser.current_url.lower()
    
    # Step 2: Log in as an optician
    email_field = browser.find_element(By.ID, "email")
    password_field = browser.find_element(By.ID, "password")
    
    email_field.send_keys("optician@example.com")
    password_field.send_keys("Optician123!")
    
    login_button = browser.find_element(By.XPATH, "//button[@type='submit']")
    login_button.click()
    
    # Wait for client portal dashboard to load
    WebDriverWait(browser, 10).until(
        lambda x: "/client-portal/dashboard" in x.current_url
    )
    
    # Step 3: Search for a client
    search_field = browser.find_element(By.ID, "clientSearch")
    search_field.send_keys("Smith")
    
    search_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Search')]")
    search_button.click()
    
    # Wait for search results
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.client-search-results"))
    )
    
    # If no clients found, create a test client
    client_results = browser.find_elements(By.CSS_SELECTOR, "div.client-result-item")
    
    if len(client_results) == 0:
        # Create new client button
        new_client_button = browser.find_element(By.XPATH, "//button[contains(text(), 'New Client')]")
        new_client_button.click()
        
        # Wait for new client form
        WebDriverWait(browser, 10).until(
            EC.presence_of_element_located((By.ID, "clientFirstName"))
        )
        
        # Fill client information
        browser.find_element(By.ID, "clientFirstName").send_keys("John")
        browser.find_element(By.ID, "clientLastName").send_keys("Smith")
        browser.find_element(By.ID, "clientEmail").send_keys("john.smith@example.com")
        browser.find_element(By.ID, "clientPhone").send_keys("1234567890")
        
        # Submit form
        submit_button = browser.find_element(By.XPATH, "//button[@type='submit']")
        submit_button.click()
        
        # Wait for client profile page
        WebDriverWait(browser, 10).until(
            lambda x: "/client-portal/clients/" in x.current_url
        )
    else:
        # Click on the first client
        client_results[0].click()
        
        # Wait for client profile page
        WebDriverWait(browser, 10).until(
            lambda x: "/client-portal/clients/" in x.current_url
        )
    
    # Step 4: Create a new order for the client
    new_order_button = browser.find_element(By.XPATH, "//button[contains(text(), 'New Order')]")
    new_order_button.click()
    
    # Wait for frame selection page
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.frame-catalog"))
    )
    
    # Select a frame
    frames = browser.find_elements(By.CSS_SELECTOR, "div.frame-item")
    assert len(frames) > 0, "No frames found in catalog"
    frames[0].click()
    
    # Wait for frame customization page
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.frame-customization"))
    )
    
    # Select lens options
    lens_option = browser.find_element(By.CSS_SELECTOR, "div.lens-option[data-type='progressive']")
    lens_option.click()
    
    # Step 5: Upload prescription
    prescription_upload = browser.find_element(By.ID, "prescriptionUpload")
    
    # In a real test, would upload an actual file
    # For this E2E test, we'll just verify the upload control is present
    assert prescription_upload.is_displayed(), "Prescription upload control not displayed"
    
    # Step 6: Complete order
    complete_order_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Complete Order')]")
    complete_order_button.click()
    
    # Wait for order confirmation
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.order-confirmation"))
    )
    
    # Verify order confirmation is displayed
    confirmation = browser.find_element(By.CSS_SELECTOR, "div.order-confirmation")
    assert confirmation.is_displayed(), "Order confirmation not displayed"
    assert "Order completed" in confirmation.text, "Order confirmation message not displayed"
    
    # Verify order appears in client's order history
    browser.find_element(By.XPATH, "//a[contains(text(), 'Order History')]").click()
    
    # Wait for order history page
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.order-history"))
    )
    
    # Verify the new order is listed
    orders = browser.find_elements(By.CSS_SELECTOR, "div.order-item")
    assert len(orders) > 0, "No orders found in client history"
    
    # Clean up - remove test data via API
    client_id = browser.current_url.split("/")[-2]  # Extract client ID from URL
    api_client.delete(f"{api_url}/client-portal/clients/cleanup-test/{client_id}")
