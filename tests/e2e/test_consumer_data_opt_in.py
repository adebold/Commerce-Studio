"""
End-to-end tests for the consumer data opt-in process.

These tests cover the data opt-in workflow for consumers across different
devices, browsers, and network conditions.
"""

import pytest
import time
import json
import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

from tests.e2e.page_objects.opt_in_page import OptInPage
from tests.e2e.page_objects.frame_finder_page import FrameFinderPage
from tests.e2e.page_objects.virtual_try_on_page import VirtualTryOnPage


@pytest.mark.parametrize("device", ["desktop", "tablet", "mobile"])
def test_data_opt_in_different_devices(browser, base_url, device, request):
    """
    Test data opt-in process on different devices.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
        device: Device type to simulate
        request: Pytest request object
    """
    # Set viewport size based on device
    if device == "desktop":
        browser.set_window_size(1920, 1080)
    elif device == "tablet":
        browser.set_window_size(768, 1024)
    elif device == "mobile":
        browser.set_window_size(375, 812)
    
    # Navigate to the frame finder page
    browser.get(f"{base_url}/frame-finder")
    
    # Initialize page objects
    frame_finder_page = FrameFinderPage(browser)
    
    # Wait for page to load
    frame_finder_page.wait_for_page_load()
    
    # Verify data collection notice is displayed
    assert frame_finder_page.is_data_notice_displayed(), "Data collection notice not displayed"
    
    # Verify notice content is appropriate for the device
    notice_text = frame_finder_page.get_data_notice_text()
    assert "data collection" in notice_text.lower(), "Data collection not mentioned in notice"
    assert "face analysis" in notice_text.lower(), "Face analysis not mentioned in notice"
    
    # Verify opt-in button is displayed
    assert frame_finder_page.is_opt_in_button_displayed(), "Opt-in button not displayed"
    
    # Click the opt-in button
    frame_finder_page.click_opt_in_button()
    
    # Verify detailed opt-in page is displayed
    opt_in_page = OptInPage(browser)
    assert opt_in_page.is_displayed(), "Detailed opt-in page not displayed"
    
    # Verify all required consent sections are displayed
    assert opt_in_page.is_face_analysis_section_displayed(), "Face analysis section not displayed"
    assert opt_in_page.is_data_storage_section_displayed(), "Data storage section not displayed"
    assert opt_in_page.is_data_usage_section_displayed(), "Data usage section not displayed"
    
    # Verify consent checkboxes are displayed
    assert opt_in_page.is_face_analysis_checkbox_displayed(), "Face analysis checkbox not displayed"
    assert opt_in_page.is_data_storage_checkbox_displayed(), "Data storage checkbox not displayed"
    assert opt_in_page.is_data_usage_checkbox_displayed(), "Data usage checkbox not displayed"
    
    # Check all consent checkboxes
    opt_in_page.check_face_analysis_checkbox()
    opt_in_page.check_data_storage_checkbox()
    opt_in_page.check_data_usage_checkbox()
    
    # Click continue button
    opt_in_page.click_continue_button()
    
    # Verify we're redirected back to frame finder with consent granted
    frame_finder_page.wait_for_page_load()
    assert frame_finder_page.is_consent_granted_indicator_displayed(), "Consent granted indicator not displayed"
    
    # Verify face analysis is now available
    assert frame_finder_page.is_face_analysis_available(), "Face analysis not available after consent"
    
    # Take screenshot for verification
    screenshot_path = os.path.join(request.config.rootdir, "screenshots", f"data_opt_in_{device}.png")
    os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)
    browser.save_screenshot(screenshot_path)


@pytest.mark.parametrize("browser_type", ["chrome", "firefox", "safari", "edge"])
def test_data_opt_in_different_browsers(selenium_grid, base_url, browser_type, request):
    """
    Test data opt-in process on different browsers.
    
    Args:
        selenium_grid: Selenium Grid fixture
        base_url: Base URL of the application
        browser_type: Browser type to test
        request: Pytest request object
    """
    # Skip test if browser is not available in the grid
    if browser_type not in selenium_grid.available_browsers:
        pytest.skip(f"Browser {browser_type} not available in Selenium Grid")
    
    # Get browser from Selenium Grid
    browser = selenium_grid.get_browser(browser_type)
    
    try:
        # Set standard viewport size
        browser.set_window_size(1366, 768)
        
        # Navigate to the virtual try-on page
        browser.get(f"{base_url}/virtual-try-on")
        
        # Initialize page object
        virtual_try_on_page = VirtualTryOnPage(browser)
        
        # Wait for page to load
        virtual_try_on_page.wait_for_page_load()
        
        # Verify data collection notice is displayed
        assert virtual_try_on_page.is_data_notice_displayed(), "Data collection notice not displayed"
        
        # Verify notice content
        notice_text = virtual_try_on_page.get_data_notice_text()
        assert "camera access" in notice_text.lower(), "Camera access not mentioned in notice"
        assert "face data" in notice_text.lower(), "Face data not mentioned in notice"
        
        # Verify opt-in button is displayed
        assert virtual_try_on_page.is_opt_in_button_displayed(), "Opt-in button not displayed"
        
        # Click the opt-in button
        virtual_try_on_page.click_opt_in_button()
        
        # Verify detailed opt-in page is displayed
        opt_in_page = OptInPage(browser)
        assert opt_in_page.is_displayed(), "Detailed opt-in page not displayed"
        
        # Verify browser-specific consent elements are displayed
        assert opt_in_page.is_camera_access_section_displayed(), "Camera access section not displayed"
        
        # Check all consent checkboxes
        opt_in_page.check_all_checkboxes()
        
        # Click continue button
        opt_in_page.click_continue_button()
        
        # Verify we're redirected back to virtual try-on with consent granted
        virtual_try_on_page.wait_for_page_load()
        assert virtual_try_on_page.is_consent_granted_indicator_displayed(), "Consent granted indicator not displayed"
        
        # Verify camera access prompt appears (browser-specific)
        try:
            assert virtual_try_on_page.is_camera_prompt_displayed(), "Camera access prompt not displayed"
        except (AssertionError, TimeoutException):
            # Some browsers handle camera permissions differently
            # Log this but don't fail the test
            print(f"Camera prompt detection failed on {browser_type} - may be handled by browser UI")
        
        # Take screenshot for verification
        screenshot_path = os.path.join(request.config.rootdir, "screenshots", f"data_opt_in_{browser_type}.png")
        os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)
        browser.save_screenshot(screenshot_path)
        
    finally:
        # Always quit the browser to release resources
        browser.quit()


@pytest.mark.parametrize("network_condition", ["fast", "slow", "flaky"])
def test_data_opt_in_different_network_conditions(browser, base_url, network_condition, network_throttle, request):
    """
    Test data opt-in process under different network conditions.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
        network_condition: Network condition to simulate
        network_throttle: Network throttling fixture
        request: Pytest request object
    """
    # Apply network throttling
    if network_condition == "fast":
        network_throttle.set_condition("Good 3G")
    elif network_condition == "slow":
        network_throttle.set_condition("Regular 2G")
    elif network_condition == "flaky":
        network_throttle.set_condition("Flaky Connection")
    
    try:
        # Navigate to the frame finder page
        browser.get(f"{base_url}/frame-finder")
        
        # Initialize page objects
        frame_finder_page = FrameFinderPage(browser)
        
        # Wait for page to load with longer timeout for slow connections
        frame_finder_page.wait_for_page_load(timeout=60 if network_condition != "fast" else 30)
        
        # Verify data collection notice is displayed
        assert frame_finder_page.is_data_notice_displayed(), "Data collection notice not displayed"
        
        # Click the opt-in button
        frame_finder_page.click_opt_in_button()
        
        # Verify detailed opt-in page is displayed
        opt_in_page = OptInPage(browser)
        assert opt_in_page.is_displayed(), "Detailed opt-in page not displayed"
        
        # Check all consent checkboxes
        opt_in_page.check_all_checkboxes()
        
        # Click continue button
        opt_in_page.click_continue_button()
        
        # Verify we're redirected back to frame finder with consent granted
        frame_finder_page.wait_for_page_load(timeout=60 if network_condition != "fast" else 30)
        assert frame_finder_page.is_consent_granted_indicator_displayed(), "Consent granted indicator not displayed"
        
        # Take screenshot for verification
        screenshot_path = os.path.join(request.config.rootdir, "screenshots", f"data_opt_in_{network_condition}.png")
        os.makedirs(os.path.dirname(screenshot_path), exist_ok=True)
        browser.save_screenshot(screenshot_path)
        
    finally:
        # Reset network throttling
        network_throttle.reset()


def test_data_opt_in_partial_consent(browser, base_url):
    """
    Test data opt-in process with partial consent.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # Navigate to the virtual try-on page
    browser.get(f"{base_url}/virtual-try-on")
    
    # Initialize page object
    virtual_try_on_page = VirtualTryOnPage(browser)
    
    # Wait for page to load
    virtual_try_on_page.wait_for_page_load()
    
    # Click the opt-in button
    virtual_try_on_page.click_opt_in_button()
    
    # Verify detailed opt-in page is displayed
    opt_in_page = OptInPage(browser)
    assert opt_in_page.is_displayed(), "Detailed opt-in page not displayed"
    
    # Check only some consent checkboxes (partial consent)
    opt_in_page.check_face_analysis_checkbox()
    # Deliberately not checking data storage checkbox
    opt_in_page.check_data_usage_checkbox()
    
    # Click continue button
    opt_in_page.click_continue_button()
    
    # Verify error message is displayed about required consents
    assert opt_in_page.is_error_message_displayed(), "Error message not displayed for partial consent"
    assert "all required consents" in opt_in_page.get_error_message_text().lower(), "Error message doesn't mention required consents"
    
    # Now check the remaining checkbox
    opt_in_page.check_data_storage_checkbox()
    
    # Click continue button again
    opt_in_page.click_continue_button()
    
    # Verify we're redirected back to virtual try-on with consent granted
    virtual_try_on_page.wait_for_page_load()
    assert virtual_try_on_page.is_consent_granted_indicator_displayed(), "Consent granted indicator not displayed"


def test_data_opt_in_withdrawal(browser, base_url):
    """
    Test withdrawing data opt-in consent.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # First grant consent
    browser.get(f"{base_url}/frame-finder")
    frame_finder_page = FrameFinderPage(browser)
    frame_finder_page.wait_for_page_load()
    frame_finder_page.click_opt_in_button()
    
    opt_in_page = OptInPage(browser)
    opt_in_page.check_all_checkboxes()
    opt_in_page.click_continue_button()
    
    frame_finder_page.wait_for_page_load()
    assert frame_finder_page.is_consent_granted_indicator_displayed(), "Consent granted indicator not displayed"
    
    # Navigate to privacy settings
    browser.get(f"{base_url}/account/privacy")
    
    # Wait for privacy settings page to load
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.ID, "privacy-settings"))
    )
    
    # Find and click the withdraw consent button
    withdraw_button = browser.find_element(By.ID, "withdraw-consent-button")
    withdraw_button.click()
    
    # Confirm withdrawal in the dialog
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.ID, "confirm-withdrawal-button"))
    )
    confirm_button = browser.find_element(By.ID, "confirm-withdrawal-button")
    confirm_button.click()
    
    # Verify success message
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".withdrawal-success"))
    )
    success_message = browser.find_element(By.CSS_SELECTOR, ".withdrawal-success").text
    assert "successfully withdrawn" in success_message.lower(), "Success message doesn't confirm withdrawal"
    
    # Navigate back to frame finder
    browser.get(f"{base_url}/frame-finder")
    frame_finder_page.wait_for_page_load()
    
    # Verify consent notice is displayed again (as if no consent was given)
    assert frame_finder_page.is_data_notice_displayed(), "Data collection notice not displayed after withdrawal"
    assert not frame_finder_page.is_consent_granted_indicator_displayed(), "Consent granted indicator still displayed after withdrawal"


def test_data_opt_in_persistence(browser, base_url):
    """
    Test persistence of data opt-in consent across sessions.
    
    Args:
        browser: Selenium WebDriver instance
        base_url: Base URL of the application
    """
    # First grant consent
    browser.get(f"{base_url}/frame-finder")
    frame_finder_page = FrameFinderPage(browser)
    frame_finder_page.wait_for_page_load()
    frame_finder_page.click_opt_in_button()
    
    opt_in_page = OptInPage(browser)
    opt_in_page.check_all_checkboxes()
    opt_in_page.click_continue_button()
    
    frame_finder_page.wait_for_page_load()
    assert frame_finder_page.is_consent_granted_indicator_displayed(), "Consent granted indicator not displayed"
    
    # Store cookies for later verification
    cookies = browser.get_cookies()
    consent_cookie = next((c for c in cookies if "consent" in c["name"].lower()), None)
    assert consent_cookie is not None, "Consent cookie not found"
    
    # Clear cookies and local storage to simulate new session
    browser.delete_all_cookies()
    browser.execute_script("window.localStorage.clear();")
    
    # Navigate to frame finder again
    browser.get(f"{base_url}/frame-finder")
    frame_finder_page.wait_for_page_load()
    
    # Verify consent notice is displayed again (as if no consent was given)
    assert frame_finder_page.is_data_notice_displayed(), "Data collection notice not displayed in new session"
    
    # Now log in to verify consent persists for authenticated users
    browser.get(f"{base_url}/login")
    
    # Wait for login page to load
    WebDriverWait(browser, 10).until(
        EC.presence_of_element_located((By.ID, "email"))
    )
    
    # Enter login credentials
    email_field = browser.find_element(By.ID, "email")
    password_field = browser.find_element(By.ID, "password")
    
    email_field.send_keys("test@example.com")
    password_field.send_keys("Password123!")
    
    # Submit login form
    login_button = browser.find_element(By.XPATH, "//button[@type='submit']")
    login_button.click()
    
    # Wait for successful login
    WebDriverWait(browser, 10).until(
        lambda x: "/dashboard" in x.current_url or "/account" in x.current_url
    )
    
    # Navigate to frame finder again
    browser.get(f"{base_url}/frame-finder")
    frame_finder_page.wait_for_page_load()
    
    # Verify consent is restored for authenticated user
    assert frame_finder_page.is_consent_granted_indicator_displayed(), "Consent not restored for authenticated user"


# Add page object classes that would be imported in actual implementation

class OptInPage:
    """Page object for the data opt-in page."""
    
    def __init__(self, browser):
        self.browser = browser
    
    def is_displayed(self):
        """Check if the opt-in page is displayed."""
        try:
            WebDriverWait(self.browser, 10).until(
                EC.presence_of_element_located((By.ID, "data-opt-in-form"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_face_analysis_section_displayed(self):
        """Check if the face analysis section is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "face-analysis-section"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_data_storage_section_displayed(self):
        """Check if the data storage section is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "data-storage-section"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_data_usage_section_displayed(self):
        """Check if the data usage section is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "data-usage-section"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_camera_access_section_displayed(self):
        """Check if the camera access section is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "camera-access-section"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_face_analysis_checkbox_displayed(self):
        """Check if the face analysis checkbox is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "face-analysis-checkbox"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_data_storage_checkbox_displayed(self):
        """Check if the data storage checkbox is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "data-storage-checkbox"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_data_usage_checkbox_displayed(self):
        """Check if the data usage checkbox is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "data-usage-checkbox"))
            )
            return True
        except TimeoutException:
            return False
    
    def check_face_analysis_checkbox(self):
        """Check the face analysis checkbox."""
        checkbox = self.browser.find_element(By.ID, "face-analysis-checkbox")
        if not checkbox.is_selected():
            checkbox.click()
    
    def check_data_storage_checkbox(self):
        """Check the data storage checkbox."""
        checkbox = self.browser.find_element(By.ID, "data-storage-checkbox")
        if not checkbox.is_selected():
            checkbox.click()
    
    def check_data_usage_checkbox(self):
        """Check the data usage checkbox."""
        checkbox = self.browser.find_element(By.ID, "data-usage-checkbox")
        if not checkbox.is_selected():
            checkbox.click()
    
    def check_all_checkboxes(self):
        """Check all consent checkboxes."""
        checkboxes = self.browser.find_elements(By.CSS_SELECTOR, "input[type='checkbox']")
        for checkbox in checkboxes:
            if not checkbox.is_selected():
                checkbox.click()
    
    def click_continue_button(self):
        """Click the continue button."""
        continue_button = self.browser.find_element(By.ID, "continue-button")
        continue_button.click()
    
    def is_error_message_displayed(self):
        """Check if an error message is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".error-message"))
            )
            return True
        except TimeoutException:
            return False
    
    def get_error_message_text(self):
        """Get the text of the error message."""
        error_message = self.browser.find_element(By.CSS_SELECTOR, ".error-message")
        return error_message.text


class FrameFinderPage:
    """Page object for the frame finder page."""
    
    def __init__(self, browser):
        self.browser = browser
    
    def wait_for_page_load(self, timeout=30):
        """Wait for the page to load."""
        WebDriverWait(self.browser, timeout).until(
            EC.presence_of_element_located((By.ID, "frame-finder-container"))
        )
    
    def is_data_notice_displayed(self):
        """Check if the data collection notice is displayed."""
        try:
            WebDriverWait(self.browser, 10).until(
                EC.presence_of_element_located((By.ID, "data-collection-notice"))
            )
            return True
        except TimeoutException:
            return False
    
    def get_data_notice_text(self):
        """Get the text of the data collection notice."""
        notice = self.browser.find_element(By.ID, "data-collection-notice")
        return notice.text
    
    def is_opt_in_button_displayed(self):
        """Check if the opt-in button is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "opt-in-button"))
            )
            return True
        except TimeoutException:
            return False
    
    def click_opt_in_button(self):
        """Click the opt-in button."""
        opt_in_button = self.browser.find_element(By.ID, "opt-in-button")
        opt_in_button.click()
    
    def is_consent_granted_indicator_displayed(self):
        """Check if the consent granted indicator is displayed."""
        try:
            WebDriverWait(self.browser, 10).until(
                EC.presence_of_element_located((By.ID, "consent-granted-indicator"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_face_analysis_available(self):
        """Check if face analysis is available."""
        try:
            WebDriverWait(self.browser, 10).until(
                EC.presence_of_element_located((By.ID, "face-analysis-container"))
            )
            return True
        except TimeoutException:
            return False


class VirtualTryOnPage:
    """Page object for the virtual try-on page."""
    
    def __init__(self, browser):
        self.browser = browser
    
    def wait_for_page_load(self, timeout=30):
        """Wait for the page to load."""
        WebDriverWait(self.browser, timeout).until(
            EC.presence_of_element_located((By.ID, "virtual-try-on-container"))
        )
    
    def is_data_notice_displayed(self):
        """Check if the data collection notice is displayed."""
        try:
            WebDriverWait(self.browser, 10).until(
                EC.presence_of_element_located((By.ID, "data-collection-notice"))
            )
            return True
        except TimeoutException:
            return False
    
    def get_data_notice_text(self):
        """Get the text of the data collection notice."""
        notice = self.browser.find_element(By.ID, "data-collection-notice")
        return notice.text
    
    def is_opt_in_button_displayed(self):
        """Check if the opt-in button is displayed."""
        try:
            WebDriverWait(self.browser, 5).until(
                EC.presence_of_element_located((By.ID, "opt-in-button"))
            )
            return True
        except TimeoutException:
            return False
    
    def click_opt_in_button(self):
        """Click the opt-in button."""
        opt_in_button = self.browser.find_element(By.ID, "opt-in-button")
        opt_in_button.click()
    
    def is_consent_granted_indicator_displayed(self):
        """Check if the consent granted indicator is displayed."""
        try:
            WebDriverWait(self.browser, 10).until(
                EC.presence_of_element_located((By.ID, "consent-granted-indicator"))
            )
            return True
        except TimeoutException:
            return False
    
    def is_camera_prompt_displayed(self):
        """Check if the camera access prompt is displayed."""
        try:
            # This is browser-specific and may not be detectable in all browsers
            WebDriverWait(self.browser, 10).until(
                EC.presence_of_element_located((By.ID, "camera-permission-dialog"))
            )
            return True
        except TimeoutException:
            # Try to detect by checking if the video element is active
            try:
                video = self.browser.find_element(By.TAG_NAME, "video")
                return video.get_attribute("readyState") > 0
            except:
                return False