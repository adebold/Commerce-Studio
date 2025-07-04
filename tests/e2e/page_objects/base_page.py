"""
Base page object for frontend E2E testing.

This module provides a base class for all page objects, with common
functionality for interacting with web pages.
"""

import time
from typing import Optional, Union, List, Callable
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException


class BasePage:
    """Base class for all page objects in the EyewearML application."""

    def __init__(self, driver: WebDriver, base_url: str):
        """Initialize a page object.

        Args:
            driver: Selenium WebDriver instance
            base_url: Base URL of the application
        """
        self.driver = driver
        self.base_url = base_url
        self.default_timeout = 10  # Default timeout in seconds

    def open(self, url_path: str = ""):
        """Open a page.

        Args:
            url_path: Path to append to base_url
        """
        full_url = f"{self.base_url}/{url_path.lstrip('/')}"
        self.driver.get(full_url)
        return self

    def find_element(self, locator: tuple, timeout: Optional[int] = None) -> WebElement:
        """Find an element with wait.

        Args:
            locator: (By, value) tuple
            timeout: Wait timeout in seconds (uses default_timeout if None)

        Returns:
            WebElement: Found element

        Raises:
            TimeoutException: If element is not found within timeout
        """
        timeout = timeout or self.default_timeout
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_element_located(locator),
            f"Element {locator} not found within {timeout} seconds"
        )

    def find_elements(self, locator: tuple, timeout: Optional[int] = None) -> List[WebElement]:
        """Find multiple elements with wait.

        Args:
            locator: (By, value) tuple
            timeout: Wait timeout in seconds (uses default_timeout if None)

        Returns:
            List[WebElement]: Found elements
        """
        timeout = timeout or self.default_timeout
        return WebDriverWait(self.driver, timeout).until(
            EC.presence_of_all_elements_located(locator),
            f"Elements {locator} not found within {timeout} seconds"
        )

    def is_element_present(self, locator: tuple, timeout: Optional[int] = None) -> bool:
        """Check if an element is present.

        Args:
            locator: (By, value) tuple
            timeout: Wait timeout in seconds (uses default_timeout if None)

        Returns:
            bool: True if element is present, False otherwise
        """
        timeout = timeout or self.default_timeout
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False

    def click(self, locator: tuple, timeout: Optional[int] = None):
        """Click an element.

        Args:
            locator: (By, value) tuple
            timeout: Wait timeout in seconds (uses default_timeout if None)
        """
        element = self.find_element(locator, timeout)
        element.click()
        return self

    def send_keys(self, locator: tuple, text: str, timeout: Optional[int] = None):
        """Send keys to an element.

        Args:
            locator: (By, value) tuple
            text: Text to send
            timeout: Wait timeout in seconds (uses default_timeout if None)
        """
        element = self.find_element(locator, timeout)
        element.clear()
        element.send_keys(text)
        return self

    def get_text(self, locator: tuple, timeout: Optional[int] = None) -> str:
        """Get text of an element.

        Args:
            locator: (By, value) tuple
            timeout: Wait timeout in seconds (uses default_timeout if None)

        Returns:
            str: Text of the element
        """
        element = self.find_element(locator, timeout)
        return element.text

    def wait_for_visibility(self, locator: tuple, timeout: Optional[int] = None) -> WebElement:
        """Wait for an element to be visible.

        Args:
            locator: (By, value) tuple
            timeout: Wait timeout in seconds (uses default_timeout if None)

        Returns:
            WebElement: Visible element
        """
        timeout = timeout or self.default_timeout
        return WebDriverWait(self.driver, timeout).until(
            EC.visibility_of_element_located(locator),
            f"Element {locator} not visible within {timeout} seconds"
        )

    def wait_for_clickable(self, locator: tuple, timeout: Optional[int] = None) -> WebElement:
        """Wait for an element to be clickable.

        Args:
            locator: (By, value) tuple
            timeout: Wait timeout in seconds (uses default_timeout if None)

        Returns:
            WebElement: Clickable element
        """
        timeout = timeout or self.default_timeout
        return WebDriverWait(self.driver, timeout).until(
            EC.element_to_be_clickable(locator),
            f"Element {locator} not clickable within {timeout} seconds"
        )

    def wait_for_url_contains(self, text: str, timeout: Optional[int] = None) -> bool:
        """Wait for URL to contain specific text.

        Args:
            text: Text to wait for in URL
            timeout: Wait timeout in seconds (uses default_timeout if None)

        Returns:
            bool: True if URL contains text, False otherwise
        """
        timeout = timeout or self.default_timeout
        return WebDriverWait(self.driver, timeout).until(
            EC.url_contains(text),
            f"URL did not contain '{text}' within {timeout} seconds"
        )

    def retry(self, func: Callable, max_attempts: int = 3, delay: float = 1.0):
        """Retry a function multiple times.

        Args:
            func: Function to retry
            max_attempts: Maximum number of attempts
            delay: Delay between attempts in seconds

        Returns:
            Result of the function if successful

        Raises:
            Exception: Last exception encountered if all attempts fail
        """
        last_exception = None
        for attempt in range(max_attempts):
            try:
                return func()
            except Exception as e:
                last_exception = e
                time.sleep(delay)
        
        if last_exception:
            raise last_exception
