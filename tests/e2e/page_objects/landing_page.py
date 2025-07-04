"""
Landing page object for frontend E2E testing.

This module provides a page object model for the landing page
of the EyewearML application.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.common.exceptions import TimeoutException

from tests.e2e.page_objects.base_page import BasePage


class LandingPage(BasePage):
    """Page object for landing page."""

    # Locators
    HERO_TITLE = (By.XPATH, "//h1[contains(text(), 'EyewearML Platform')]")
    SIGNIN_BUTTON = (By.XPATH, "//a[contains(text(), 'Sign In')]")
    DEMO_STORE_BUTTON = (By.XPATH, "//a[contains(text(), 'Try Demo Store')]")
    SIGNUP_BUTTON = (By.XPATH, "//a[contains(text(), 'Sign Up Now')]")
    PLATFORM_BENEFITS_SECTION = (By.XPATH, "//h2[contains(text(), 'Platform Benefits')]")
    VIRTUAL_TRYON_CARD = (By.XPATH, "//h3[contains(text(), 'Virtual Try-On')]")
    AI_RECOMMENDATIONS_CARD = (By.XPATH, "//h3[contains(text(), 'AI Recommendations')]")
    CUSTOM_STOREFRONT_CARD = (By.XPATH, "//h3[contains(text(), 'Custom Storefront')]")
    ANALYTICS_DASHBOARD_CARD = (By.XPATH, "//h3[contains(text(), 'Analytics Dashboard')]")
    CUSTOMER_JOURNEY_CARD = (By.XPATH, "//h3[contains(text(), 'Customer Journey')]")
    RBAC_SYSTEM_CARD = (By.XPATH, "//h3[contains(text(), 'RBAC System')]")
    FOOTER = (By.XPATH, "//footer | //div[contains(@sx, 'bgcolor') and contains(@sx, 'grey')]")

    def __init__(self, driver: WebDriver, base_url: str):
        """Initialize landing page.

        Args:
            driver: Selenium WebDriver instance
            base_url: Base URL of the application
        """
        super().__init__(driver, base_url)
        self.url_path = "/"

    def load(self):
        """Load the landing page."""
        return self.open(self.url_path)

    def click_sign_in(self):
        """Click on sign in button.

        Returns:
            self: For method chaining
        """
        self.click(self.SIGNIN_BUTTON)
        return self

    def click_demo_store(self):
        """Click on demo store button.

        Returns:
            self: For method chaining
        """
        self.click(self.DEMO_STORE_BUTTON)
        return self

    def click_sign_up(self):
        """Click on sign up button.

        Returns:
            self: For method chaining
        """
        self.click(self.SIGNUP_BUTTON)
        return self

    def is_loaded(self) -> bool:
        """Check if landing page is loaded.

        Returns:
            bool: True if page is loaded, False otherwise
        """
        return self.is_element_present(self.HERO_TITLE) and self.is_element_present(self.PLATFORM_BENEFITS_SECTION)

    def has_platform_benefits(self) -> bool:
        """Check if platform benefits section is present.

        Returns:
            bool: True if platform benefits section is present, False otherwise
        """
        benefits = [
            self.VIRTUAL_TRYON_CARD,
            self.AI_RECOMMENDATIONS_CARD,
            self.CUSTOM_STOREFRONT_CARD,
            self.ANALYTICS_DASHBOARD_CARD,
            self.CUSTOMER_JOURNEY_CARD,
            self.RBAC_SYSTEM_CARD
        ]
        return all(self.is_element_present(benefit) for benefit in benefits)

    def get_hero_title_text(self) -> str:
        """Get hero title text.

        Returns:
            str: Hero title text
        """
        return self.get_text(self.HERO_TITLE)
