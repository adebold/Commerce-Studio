"""
Login page object for frontend E2E testing.

This module provides a page object model for the login page
of the EyewearML application.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.common.exceptions import TimeoutException

from tests.e2e.page_objects.base_page import BasePage


class LoginPage(BasePage):
    """Page object for login page."""

    # Locators
    EMAIL_FIELD = (By.ID, "email")
    PASSWORD_FIELD = (By.ID, "password")
    LOGIN_BUTTON = (By.XPATH, "//button[@type='submit']")
    ERROR_MESSAGE = (By.CLASS_NAME, "error-message")
    SIGNUP_LINK = (By.XPATH, "//a[contains(text(), 'Sign up')]")
    FORGOT_PASSWORD_LINK = (By.XPATH, "//a[contains(text(), 'Forgot password')]")

    def __init__(self, driver: WebDriver, base_url: str):
        """Initialize login page.

        Args:
            driver: Selenium WebDriver instance
            base_url: Base URL of the application
        """
        super().__init__(driver, base_url)
        self.url_path = "/login"

    def load(self):
        """Load the login page."""
        return self.open(self.url_path)

    def login(self, email: str, password: str):
        """Perform login with given credentials.

        Args:
            email: User email
            password: User password

        Returns:
            self: For method chaining
        """
        self.send_keys(self.EMAIL_FIELD, email)
        self.send_keys(self.PASSWORD_FIELD, password)
        self.click(self.LOGIN_BUTTON)
        return self

    def get_error_message(self) -> str:
        """Get error message text if present.

        Returns:
            str: Error message text, empty string if not present
        """
        try:
            return self.get_text(self.ERROR_MESSAGE)
        except TimeoutException:
            return ""

    def is_login_successful(self) -> bool:
        """Check if login was successful by checking URL redirection.

        Returns:
            bool: True if redirected to dashboard, False otherwise
        """
        try:
            # After successful login, user should be redirected to dashboard
            return self.wait_for_url_contains("/dashboard", timeout=5)
        except TimeoutException:
            return False

    def click_signup(self):
        """Click on sign up link.

        Returns:
            self: For method chaining
        """
        self.click(self.SIGNUP_LINK)
        return self

    def click_forgot_password(self):
        """Click on forgot password link.

        Returns:
            self: For method chaining
        """
        self.click(self.FORGOT_PASSWORD_LINK)
        return self

    def is_on_login_page(self) -> bool:
        """Check if currently on login page.

        Returns:
            bool: True if on login page, False otherwise
        """
        return "/login" in self.driver.current_url and self.is_element_present(self.LOGIN_BUTTON)
