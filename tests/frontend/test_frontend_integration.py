import pytest
import requests
import subprocess
import time
import os
import signal
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

class TestFrontendIntegration:
    """Test suite for frontend integration with backend API."""
    
    @pytest.fixture(scope="class")
    def frontend_server(self):
        """Fixture to start and stop the frontend development server."""
        server_process = None
        
        # Navigate to frontend directory
        frontend_dir = Path(os.getcwd()) / "frontend"
        
        # Start frontend server (npm run dev)
        server_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait for server to start
        time.sleep(10)
        
        yield server_process
        
        # Cleanup: terminate the server process
        if server_process:
            server_process.send_signal(signal.SIGTERM)
            server_process.wait(timeout=5)
    
    @pytest.fixture(scope="class")
    def driver(self):
        """Fixture for Selenium WebDriver setup."""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        
        try:
            driver = webdriver.Chrome(options=chrome_options)
            driver.set_page_load_timeout(30)
            driver.implicitly_wait(10)
            yield driver
        finally:
            if 'driver' in locals():
                driver.quit()
    
    def test_frontend_loads(self, frontend_server, driver):
        """Test that the frontend application loads successfully."""
        # RED: This will fail if frontend doesn't load
        try:
            driver.get("http://localhost:3000")
            
            # Check if the page title contains expected text
            assert "Eyewear" in driver.title, f"Unexpected page title: {driver.title}"
            
            # Check if critical UI elements are present
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "header"))
            )
            
            # Take screenshot for visual verification
            driver.save_screenshot("frontend_loaded.png")
        except (TimeoutException, WebDriverException) as e:
            pytest.fail(f"Frontend failed to load: {str(e)}")
    
    def test_api_connectivity(self, frontend_server, driver):
        """Test that the frontend can connect to the backend API."""
        # RED: This will fail if API connection fails
        try:
            driver.get("http://localhost:3000")
            
            # Execute JavaScript to test API connectivity
            api_test_script = """
            return new Promise((resolve, reject) => {
                fetch('/api/v1/health')
                    .then(response => {
                        if (response.ok) return response.json();
                        throw new Error(`API responded with status ${response.status}`);
                    })
                    .then(data => resolve({success: true, data}))
                    .catch(error => resolve({success: false, error: error.toString()}));
            });
            """
            
            result = driver.execute_async_script("""
            const callback = arguments[arguments.length - 1];
            const testScript = arguments[0];
            eval(testScript)
                .then(result => callback(result))
                .catch(error => callback({success: false, error: error.toString()}));
            """, api_test_script)
            
            assert result["success"], f"API connectivity failed: {result.get('error', 'Unknown error')}"
        except Exception as e:
            pytest.fail(f"API connectivity test failed: {str(e)}")
    
    def test_face_shape_analysis_page(self, frontend_server, driver):
        """Test the face shape analysis page functionality."""
        # RED: This will fail if face shape analysis page doesn't work
        try:
            # Navigate to face shape analysis page
            driver.get("http://localhost:3000/face-shape-analysis")
            
            # Check if the page loaded correctly
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='face-shape-analysis']"))
            )
            
            # Check for key UI components
            assert driver.find_element(By.CSS_SELECTOR, "[data-testid='upload-button']"), "Upload button not found"
            
            # Take screenshot
            driver.save_screenshot("face_shape_analysis_page.png")
        except Exception as e:
            pytest.fail(f"Face shape analysis page test failed: {str(e)}")
    
    def test_virtual_try_on_page(self, frontend_server, driver):
        """Test the virtual try-on page functionality."""
        # RED: This will fail if virtual try-on page doesn't work
        try:
            # Navigate to virtual try-on page
            driver.get("http://localhost:3000/virtual-try-on")
            
            # Check if the page loaded correctly
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='virtual-try-on']"))
            )
            
            # Check for key UI components
            assert driver.find_element(By.CSS_SELECTOR, "[data-testid='frame-selector']"), "Frame selector not found"
            
            # Take screenshot
            driver.save_screenshot("virtual_try_on_page.png")
        except Exception as e:
            pytest.fail(f"Virtual try-on page test failed: {str(e)}")
    
    def test_recommendations_page(self, frontend_server, driver):
        """Test the recommendations page functionality."""
        # RED: This will fail if recommendations page doesn't work
        try:
            # Navigate to recommendations page
            driver.get("http://localhost:3000/recommendations")
            
            # Check if the page loaded correctly
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='recommendations']"))
            )
            
            # Check for key UI components
            assert driver.find_element(By.CSS_SELECTOR, "[data-testid='recommendation-list']"), "Recommendation list not found"
            
            # Take screenshot
            driver.save_screenshot("recommendations_page.png")
        except Exception as e:
            pytest.fail(f"Recommendations page test failed: {str(e)}")
    
    def test_responsive_design(self, frontend_server, driver):
        """Test responsive design across different screen sizes."""
        # RED: This will fail if responsive design doesn't work
        try:
            # Desktop view
            driver.set_window_size(1920, 1080)
            driver.get("http://localhost:3000")
            time.sleep(2)
            driver.save_screenshot("responsive_desktop.png")
            
            # Tablet view
            driver.set_window_size(768, 1024)
            driver.get("http://localhost:3000")
            time.sleep(2)
            driver.save_screenshot("responsive_tablet.png")
            
            # Mobile view
            driver.set_window_size(375, 812)
            driver.get("http://localhost:3000")
            time.sleep(2)
            driver.save_screenshot("responsive_mobile.png")
            
            # Check if mobile menu is visible on small screens
            mobile_menu = driver.find_elements(By.CSS_SELECTOR, "[data-testid='mobile-menu']")
            assert len(mobile_menu) > 0, "Mobile menu not found on small screen"
        except Exception as e:
            pytest.fail(f"Responsive design test failed: {str(e)}")