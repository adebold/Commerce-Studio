"""
End-to-End tests for e-commerce platform integrations.

This module contains tests for verifying that the merchant-facing
e-commerce integration components function correctly, including
platform connections, app installations, and monitoring dashboards.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_merchant_integration_journey(browser, base_url, api_client, api_url):
    """Test complete merchant journey from signup to integration setup and monitoring.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
        api_client: API client fixture
        api_url: Base API URL
    """
    # Step 1: Navigate to the merchant signup page
    browser.get(f"{base_url}/merchant/signup")
    
    # Verify we're on the merchant signup page
    assert "merchant" in browser.current_url.lower()
    assert "signup" in browser.current_url.lower()
    
    # Step 2: Fill out the merchant signup form
    email_field = browser.find_element(By.ID, "merchantEmail")
    password_field = browser.find_element(By.ID, "merchantPassword")
    confirm_password_field = browser.find_element(By.ID, "confirmMerchantPassword")
    store_name_field = browser.find_element(By.ID, "storeName")
    store_url_field = browser.find_element(By.ID, "storeUrl")
    
    # Generate a unique email address
    test_email = f"test_merchant_{int(time.time())}@example.com"
    
    email_field.send_keys(test_email)
    password_field.send_keys("MerchantPass123!")
    confirm_password_field.send_keys("MerchantPass123!")
    store_name_field.send_keys("Test Eyewear Store")
    store_url_field.send_keys("https://test-eyewear-store.example.com")
    
    # Accept terms and conditions
    terms_checkbox = browser.find_element(By.ID, "merchantTermsCheckbox")
    terms_checkbox.click()
    
    # Submit the form
    signup_button = browser.find_element(By.XPATH, "//button[@type='submit']")
    signup_button.click()
    
    # Wait for the platform selection page to load
    WebDriverWait(browser, 10).until(
        lambda x: "/merchant/platform-selection" in x.current_url
    )
    
    # Step 3: Select e-commerce platform
    shopify_option = browser.find_element(By.CSS_SELECTOR, "div.platform-option[data-platform='shopify']")
    shopify_option.click()
    
    # Click next button
    next_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
    next_button.click()
    
    # Step 4: Authorize platform connection (simulate OAuth)
    # Wait for the authorization page
    WebDriverWait(browser, 10).until(
        lambda x: "/merchant/authorize" in x.current_url
    )
    
    # Fill API credentials for testing (since we can't do actual OAuth in test)
    api_key_field = browser.find_element(By.ID, "apiKey")
    api_secret_field = browser.find_element(By.ID, "apiSecret")
    store_domain_field = browser.find_element(By.ID, "storeDomain")
    
    api_key_field.send_keys("test_api_key_12345")
    api_secret_field.send_keys("test_api_secret_12345")
    store_domain_field.send_keys("test-store.myshopify.com")
    
    # Submit the authorization form
    authorize_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Authorize')]")
    authorize_button.click()
    
    # Wait for the app selection page
    WebDriverWait(browser, 10).until(
        lambda x: "/merchant/app-selection" in x.current_url
    )
    
    # Step 5: Select apps to integrate
    vto_app = browser.find_element(By.CSS_SELECTOR, "div.app-option[data-app='virtual-try-on']")
    pd_calculator = browser.find_element(By.CSS_SELECTOR, "div.app-option[data-app='pd-calculator']")
    
    vto_app.click()
    pd_calculator.click()
    
    # Click next button
    next_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
    next_button.click()
    
    # Step 6: Configure apps
    WebDriverWait(browser, 10).until(
        lambda x: "/merchant/app-configuration" in x.current_url
    )
    
    # Configure VTO settings
    vto_placement = browser.find_element(By.ID, "vtoPlacement")
    vto_placement.send_keys("product_page")
    
    # Configure PD Calculator settings
    pd_placement = browser.find_element(By.ID, "pdCalculatorPlacement")
    pd_placement.send_keys("checkout_page")
    
    # Submit configurations
    save_button = browser.find_element(By.XPATH, "//button[contains(text(), 'Save Configuration')]")
    save_button.click()
    
    # Wait for the data sync page
    WebDriverWait(browser, 10).until(
        lambda x: "/merchant/initial-sync" in x.current_url
    )
    
    # Step 7: Start initial data synchronization
    start_sync_button = browser.find_element(By.ID, "startSyncButton")
    start_sync_button.click()
    
    # Wait for sync to complete (progress reaches 100%)
    WebDriverWait(browser, 30).until(
        EC.text_to_be_present_in_element(
            (By.ID, "syncProgress"), "100%"
        )
    )
    
    # Complete integration button appears
    complete_button = WebDriverWait(browser, 10).until(
        EC.element_to_be_clickable((By.ID, "completeIntegrationButton"))
    )
    complete_button.click()
    
    # Wait for merchant dashboard to load
    WebDriverWait(browser, 10).until(
        lambda x: "/merchant/dashboard" in x.current_url
    )
    
    # Step 8: Verify dashboard components are present
    assert browser.find_element(By.ID, "integrationStatusCard").is_displayed()
    assert browser.find_element(By.ID, "syncMetricsCard").is_displayed()
    assert browser.find_element(By.ID, "activeAppsCard").is_displayed()
    
    # Verify integration status shows connected
    status_badge = browser.find_element(By.CSS_SELECTOR, "#integrationStatusCard .status-badge")
    assert "Connected" in status_badge.text
    
    # Verify apps are showing as active
    app_list = browser.find_elements(By.CSS_SELECTOR, "#activeAppsCard .app-item")
    app_names = [app.text for app in app_list]
    assert "Virtual Try-On" in app_names
    assert "PD Calculator" in app_names
    
    # Clean up - delete the test merchant via API
    api_client.delete(f"{api_url}/merchants/cleanup-test", json={"email": test_email})


def test_merchant_integration_monitoring(merchant_browser, base_url, api_url):
    """Test merchant monitoring dashboard for integration status and metrics.
    
    Args:
        merchant_browser: Selenium WebDriver instance authenticated as merchant
        base_url: Base URL of the application
        api_url: Base API URL
    """
    # Navigate to merchant dashboard
    merchant_browser.get(f"{base_url}/merchant/dashboard")
    
    # Verify dashboard loaded
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.ID, "merchantDashboard"))
    )
    
    # Navigate to integration monitoring section
    monitoring_link = merchant_browser.find_element(By.XPATH, "//a[contains(text(), 'Integration Monitoring')]")
    monitoring_link.click()
    
    # Wait for monitoring page to load
    WebDriverWait(merchant_browser, 10).until(
        lambda x: "/merchant/monitoring" in x.current_url
    )
    
    # Verify monitoring components are present
    assert merchant_browser.find_element(By.ID, "apiResponseTimeChart").is_displayed()
    assert merchant_browser.find_element(By.ID, "errorRateChart").is_displayed()
    assert merchant_browser.find_element(By.ID, "syncHistoryTable").is_displayed()
    assert merchant_browser.find_element(By.ID, "activeUsersChart").is_displayed()
    
    # Test date range filter
    date_range_select = merchant_browser.find_element(By.ID, "dateRangeSelect")
    date_range_select.click()
    
    # Select last 7 days option
    seven_days_option = merchant_browser.find_element(By.XPATH, "//li[contains(text(), 'Last 7 Days')]")
    seven_days_option.click()
    
    # Wait for charts to reload
    time.sleep(2)  # Simple wait for animation
    
    # Verify sync history shows entries
    sync_rows = merchant_browser.find_elements(By.CSS_SELECTOR, "#syncHistoryTable tbody tr")
    assert len(sync_rows) > 0, "No sync history entries displayed"
    
    # Test error log filtering
    error_logs_tab = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'Error Logs')]")
    error_logs_tab.click()
    
    # Wait for error logs to load
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.ID, "errorLogsTable"))
    )
    
    # Filter errors by severity
    severity_filter = merchant_browser.find_element(By.ID, "severityFilter")
    severity_filter.click()
    
    # Select warning severity
    warning_option = merchant_browser.find_element(By.XPATH, "//li[contains(text(), 'Warning')]")
    warning_option.click()
    
    # Verify filtered results
    time.sleep(1)  # Wait for filter to apply
    error_rows = merchant_browser.find_elements(By.CSS_SELECTOR, "#errorLogsTable tbody tr")
    
    # At least check if filtering worked (either we have results or an empty state message)
    if len(error_rows) > 0:
        # If we have results, verify they're all warnings
        for row in error_rows:
            severity_cell = row.find_element(By.CSS_SELECTOR, "td.severity-cell")
            assert "Warning" in severity_cell.text
    else:
        # If no results, verify empty state message
        empty_state = merchant_browser.find_element(By.CSS_SELECTOR, "#errorLogsTable .empty-state")
        assert "No warnings found" in empty_state.text


def test_merchant_app_management(merchant_browser, base_url, api_url):
    """Test merchant app management functionality including installation and configuration.
    
    Args:
        merchant_browser: Selenium WebDriver instance authenticated as merchant
        base_url: Base URL of the application
        api_url: Base API URL
    """
    # Navigate to merchant app management
    merchant_browser.get(f"{base_url}/merchant/apps")
    
    # Verify app management page loaded
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.ID, "appManagement"))
    )
    
    # Verify installed apps are displayed
    installed_apps_tab = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'Installed Apps')]")
    installed_apps_tab.click()
    
    # Wait for installed apps to load
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".installed-apps-list"))
    )
    
    # Get installed apps
    installed_app_items = merchant_browser.find_elements(By.CSS_SELECTOR, ".app-item")
    initial_installed_count = len(installed_app_items)
    
    # Navigate to app marketplace
    marketplace_tab = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'App Marketplace')]")
    marketplace_tab.click()
    
    # Wait for marketplace to load
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".app-marketplace"))
    )
    
    # Find an app that's not installed yet
    available_apps = merchant_browser.find_elements(By.CSS_SELECTOR, ".app-card:not(.installed)")
    assert len(available_apps) > 0, "No available apps to install"
    
    # Click on the first available app
    available_apps[0].click()
    
    # Wait for app details to load
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.ID, "appDetails"))
    )
    
    # Get app name for verification later
    app_name = merchant_browser.find_element(By.CSS_SELECTOR, "#appDetails h2").text
    
    # Install the app
    install_button = merchant_browser.find_element(By.ID, "installAppButton")
    install_button.click()
    
    # Wait for installation confirmation
    WebDriverWait(merchant_browser, 10).until(
        EC.text_to_be_present_in_element(
            (By.CSS_SELECTOR, ".installation-status"),
            "Installation complete"
        )
    )
    
    # Configure app
    configure_button = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'Configure')]")
    configure_button.click()
    
    # Wait for configuration page
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.ID, "appConfiguration"))
    )
    
    # Assume there's at least one toggle setting we can change
    toggle_setting = merchant_browser.find_element(By.CSS_SELECTOR, ".setting-toggle input[type='checkbox']")
    initial_state = toggle_setting.is_selected()
    toggle_setting.click()
    
    # Save configuration
    save_button = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'Save Changes')]")
    save_button.click()
    
    # Wait for confirmation
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".save-confirmation"))
    )
    
    # Go back to installed apps
    merchant_browser.get(f"{base_url}/merchant/apps")
    installed_apps_tab = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'Installed Apps')]")
    installed_apps_tab.click()
    
    # Verify the new app is now in the installed list
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".installed-apps-list"))
    )
    
    updated_installed_apps = merchant_browser.find_elements(By.CSS_SELECTOR, ".app-item")
    assert len(updated_installed_apps) > initial_installed_count, "New app not added to installed list"
    
    # Verify the app name is in the list
    app_names = [app.find_element(By.CSS_SELECTOR, "h3").text for app in updated_installed_apps]
    assert app_name in app_names, f"Newly installed app '{app_name}' not found in installed apps"


def test_third_party_api_integration(merchant_browser, base_url, api_url):
    """Test third-party API key integration for external VTO provider.
    
    Args:
        merchant_browser: Selenium WebDriver instance authenticated as merchant
        base_url: Base URL of the application
        api_url: Base API URL
    """
    # Navigate to integration settings
    merchant_browser.get(f"{base_url}/merchant/settings/integrations")
    
    # Verify integration settings page loaded
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.ID, "externalIntegrations"))
    )
    
    # Click on Add New Integration button
    add_integration_button = merchant_browser.find_element(By.ID, "addIntegrationButton")
    add_integration_button.click()
    
    # Wait for integration types to load
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".integration-type-list"))
    )
    
    # Select External VTO Provider
    external_vto_option = merchant_browser.find_element(By.XPATH, "//div[contains(text(), 'External VTO Provider')]")
    external_vto_option.click()
    
    # Continue to setup
    continue_button = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'Continue')]")
    continue_button.click()
    
    # Wait for provider selection
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.ID, "providerSelection"))
    )
    
    # Select a provider (e.g., "FittingBox")
    provider_option = merchant_browser.find_element(By.XPATH, "//div[contains(text(), 'FittingBox')]")
    provider_option.click()
    
    # Continue to API setup
    next_button = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'Next')]")
    next_button.click()
    
    # Wait for API key form
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.ID, "apiKeyForm"))
    )
    
    # Fill in API credentials
    api_key_field = merchant_browser.find_element(By.ID, "externalApiKey")
    api_secret_field = merchant_browser.find_element(By.ID, "externalApiSecret")
    
    api_key_field.send_keys("test_external_api_key_12345")
    api_secret_field.send_keys("test_external_api_secret_12345")
    
    # Test connection
    test_connection_button = merchant_browser.find_element(By.ID, "testConnectionButton")
    test_connection_button.click()
    
    # Wait for connection test result
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".connection-test-result"))
    )
    
    # Verify connection was successful
    test_result = merchant_browser.find_element(By.CSS_SELECTOR, ".connection-test-result")
    assert "successful" in test_result.text.lower(), "External API connection test failed"
    
    # Save integration
    save_button = merchant_browser.find_element(By.XPATH, "//button[contains(text(), 'Save Integration')]")
    save_button.click()
    
    # Wait for confirmation
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".integration-saved-confirmation"))
    )
    
    # Verify integration is now listed
    WebDriverWait(merchant_browser, 10).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, ".integrations-list"))
    )
    
    integration_items = merchant_browser.find_elements(By.CSS_SELECTOR, ".integration-item")
    integration_names = [item.find_element(By.CSS_SELECTOR, ".integration-name").text for item in integration_items]
    
    assert "FittingBox" in integration_names, "New external integration not found in list"
    
    # Verify status is shown as connected
    for item in integration_items:
        name = item.find_element(By.CSS_SELECTOR, ".integration-name").text
        if name == "FittingBox":
            status = item.find_element(By.CSS_SELECTOR, ".integration-status").text
            assert "Connected" in status, "Integration not showing as connected"
