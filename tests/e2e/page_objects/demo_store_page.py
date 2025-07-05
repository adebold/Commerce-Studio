"""
Demo store page object for frontend E2E testing.

This module provides a page object model for the demo store
page of the EyewearML application.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.common.exceptions import TimeoutException

from tests.e2e.page_objects.base_page import BasePage


class DemoStorePage(BasePage):
    """Page object for demo store page."""

    # Locators
    STORE_TITLE = (By.XPATH, "//a[contains(text(), 'EyewearML Demo Store')]")
    NAVBAR = (By.CLASS_NAME, "navbar")
    FACE_SHAPE_GUIDE_LINK = (By.ID, "faceshapeGuideLink")
    FILTERS_SECTION = (By.XPATH, "//h5[text()='Filters']")
    BRAND_FILTER = (By.ID, "brand-filter")
    MANUFACTURER_FILTER = (By.ID, "manufacturer-filter")
    STYLE_FILTER = (By.ID, "style-filter")
    FACE_SHAPE_FILTER = (By.ID, "face-shape-filter")
    PRICE_FILTER = (By.ID, "price-filter")
    RESET_FILTERS_BUTTON = (By.ID, "reset-filters")
    PRODUCTS_CONTAINER = (By.ID, "products-container")
    PRODUCT_CARDS = (By.CLASS_NAME, "card")

    def __init__(self, driver: WebDriver, base_url: str):
        """Initialize demo store page.

        Args:
            driver: Selenium WebDriver instance
            base_url: Base URL of the application
        """
        super().__init__(driver, base_url)
        self.url_path = "/html-store"

    def load(self):
        """Load the demo store page."""
        return self.open(self.url_path)

    def click_face_shape_guide(self):
        """Click on face shape guide link.

        Returns:
            self: For method chaining
        """
        self.click(self.FACE_SHAPE_GUIDE_LINK)
        return self

    def is_loaded(self) -> bool:
        """Check if demo store page is loaded.

        Returns:
            bool: True if page is loaded, False otherwise
        """
        return self.is_element_present(self.STORE_TITLE) and self.is_element_present(self.FILTERS_SECTION)

    def has_filters(self) -> bool:
        """Check if filters section is present.

        Returns:
            bool: True if filters section is present, False otherwise
        """
        filters = [
            self.BRAND_FILTER,
            self.MANUFACTURER_FILTER,
            self.STYLE_FILTER,
            self.FACE_SHAPE_FILTER,
            self.PRICE_FILTER,
            self.RESET_FILTERS_BUTTON
        ]
        return all(self.is_element_present(filter_) for filter_ in filters)

    def has_products(self) -> bool:
        """Check if products are loaded.

        Returns:
            bool: True if products are loaded, False otherwise
        """
        try:
            products = self.find_elements(self.PRODUCT_CARDS)
            return len(products) > 0
        except TimeoutException:
            return False

    def click_product(self, index: int = 0):
        """Click on a product card.

        Args:
            index: Index of the product to click (default: 0)

        Returns:
            self: For method chaining
        """
        products = self.find_elements(self.PRODUCT_CARDS)
        if index < len(products):
            products[index].click()
            return self
        else:
            raise IndexError(f"Product index {index} out of range (0-{len(products)-1})")

    def select_brand(self, brand_name: str):
        """Select a brand from the brand filter.

        Args:
            brand_name: Name of the brand to select

        Returns:
            self: For method chaining
        """
        brand_select = self.find_element(self.BRAND_FILTER)
        brand_option = (By.XPATH, f"//select[@id='brand-filter']/option[text()='{brand_name}']")
        self.click(brand_option)
        return self

    def select_face_shape(self, face_shape: str):
        """Select a face shape from the face shape filter.

        Args:
            face_shape: Face shape to select (oval, round, square, heart, diamond, oblong)

        Returns:
            self: For method chaining
        """
        face_shape_select = self.find_element(self.FACE_SHAPE_FILTER)
        face_shape_option = (By.XPATH, f"//select[@id='face-shape-filter']/option[text()='{face_shape.capitalize()}']")
        self.click(face_shape_option)
        return self

    def reset_filters(self):
        """Reset all filters.

        Returns:
            self: For method chaining
        """
        self.click(self.RESET_FILTERS_BUTTON)
        return self
