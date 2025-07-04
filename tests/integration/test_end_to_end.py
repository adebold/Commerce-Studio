import pytest
import requests
import subprocess
import time
import os
import json
import logging
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestEndToEndIntegration:
    """End-to-end integration tests for the complete application stack."""
    
    @pytest.fixture(scope="class")
    def services_check(self):
        """Fixture to verify all required services are running."""
        # Check API server
        api_running = False
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            api_running = response.status_code == 200
        except requests.exceptions.RequestException:
            logger.warning("API server is not running")
        
        # Check database
        db_running = False
        try:
            # Simple check if MongoDB port is accessible
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            result = s.connect_ex(('localhost', 27017))
            s.close()
            db_running = result == 0
        except Exception as e:
            logger.warning(f"Database check failed: {str(e)}")
        
        # Check Redis
        redis_running = False
        try:
            import socket
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2)
            result = s.connect_ex(('localhost', 6379))
            s.close()
            redis_running = result == 0
        except Exception as e:
            logger.warning(f"Redis check failed: {str(e)}")
        
        # Check frontend server
        frontend_running = False
        try:
            response = requests.get("http://localhost:3000", timeout=5)
            frontend_running = response.status_code == 200
        except requests.exceptions.RequestException:
            logger.warning("Frontend server is not running")
        
        # Skip tests if services are not running
        if not all([api_running, db_running, redis_running, frontend_running]):
            services_status = {
                "API": "Running" if api_running else "Not Running",
                "Database": "Running" if db_running else "Not Running",
                "Redis": "Running" if redis_running else "Not Running",
                "Frontend": "Running" if frontend_running else "Not Running"
            }
            pytest.skip(f"Required services are not running: {json.dumps(services_status, indent=2)}")
        
        return {
            "api_running": api_running,
            "db_running": db_running,
            "redis_running": redis_running,
            "frontend_running": frontend_running
        }
    
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
    
    def test_complete_user_flow(self, services_check, driver):
        """Test complete user flow from login to checkout."""
        # RED: This will fail if the user flow is broken
        try:
            # 1. Navigate to home page
            driver.get("http://localhost:3000")
            
            # 2. Login
            driver.find_element(By.CSS_SELECTOR, "[data-testid='login-button']").click()
            
            # Fill login form
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, "[data-testid='login-form']"))
            )
            driver.find_element(By.CSS_SELECTOR, "[data-testid='email-input']").send_keys("test@example.com")
            driver.find_element(By.CSS_SELECTOR, "[data-testid='password-input']").send_keys("test123")
            driver.find_element(By.CSS_SELECTOR, "[data-testid='submit-login']").click()
            
            # Verify successful login
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='user-profile']"))
            )
            driver.save_screenshot("e2e_1_login.png")
            
            # 3. Navigate to face shape analysis
            driver.find_element(By.CSS_SELECTOR, "[data-testid='face-shape-link']").click()
            
            # Verify face shape page loaded
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='face-shape-analysis']"))
            )
            
            # Upload test image for face shape analysis
            file_input = driver.find_element(By.CSS_SELECTOR, "[data-testid='file-input']")
            file_input.send_keys(os.path.abspath("./tests/test_data/face_sample.jpg"))
            
            # Wait for analysis to complete
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='analysis-result']"))
            )
            driver.save_screenshot("e2e_2_face_analysis.png")
            
            # Verify shape prediction is present
            shape_result = driver.find_element(By.CSS_SELECTOR, "[data-testid='shape-prediction']")
            assert shape_result.text != "", "Face shape prediction is empty"
            
            # 4. Go to recommendations based on face shape
            driver.find_element(By.CSS_SELECTOR, "[data-testid='view-recommendations']").click()
            
            # Verify recommendations page loaded
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='recommendations']"))
            )
            driver.save_screenshot("e2e_3_recommendations.png")
            
            # Verify recommendations are displayed
            recommendations = driver.find_elements(By.CSS_SELECTOR, "[data-testid='product-card']")
            assert len(recommendations) > 0, "No product recommendations displayed"
            
            # 5. Select a product
            recommendations[0].click()
            
            # Verify product detail page loaded
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='product-detail']"))
            )
            driver.save_screenshot("e2e_4_product_detail.png")
            
            # 6. Try on virtually
            driver.find_element(By.CSS_SELECTOR, "[data-testid='try-on-button']").click()
            
            # Verify virtual try-on page loaded
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='virtual-try-on']"))
            )
            
            # Wait for try-on visualization
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='try-on-result']"))
            )
            driver.save_screenshot("e2e_5_virtual_try_on.png")
            
            # 7. Add to cart
            driver.find_element(By.CSS_SELECTOR, "[data-testid='add-to-cart']").click()
            
            # Verify item added to cart
            WebDriverWait(driver, 10).until(
                EC.text_to_be_present_in_element(
                    (By.CSS_SELECTOR, "[data-testid='cart-count']"), "1"
                )
            )
            
            # 8. Go to cart
            driver.find_element(By.CSS_SELECTOR, "[data-testid='cart-icon']").click()
            
            # Verify cart page loaded
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='cart']"))
            )
            driver.save_screenshot("e2e_6_cart.png")
            
            # Verify product in cart
            cart_items = driver.find_elements(By.CSS_SELECTOR, "[data-testid='cart-item']")
            assert len(cart_items) > 0, "No items in cart"
            
            # 9. Proceed to checkout
            driver.find_element(By.CSS_SELECTOR, "[data-testid='checkout-button']").click()
            
            # Verify checkout page loaded
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='checkout']"))
            )
            driver.save_screenshot("e2e_7_checkout.png")
            
            # 10. Fill checkout information
            driver.find_element(By.CSS_SELECTOR, "[data-testid='address-line1']").send_keys("123 Test St")
            driver.find_element(By.CSS_SELECTOR, "[data-testid='city']").send_keys("Test City")
            driver.find_element(By.CSS_SELECTOR, "[data-testid='zip']").send_keys("12345")
            
            # 11. Submit order
            driver.find_element(By.CSS_SELECTOR, "[data-testid='place-order']").click()
            
            # Verify order confirmation page
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='order-confirmation']"))
            )
            driver.save_screenshot("e2e_8_order_confirmation.png")
            
            # Verify order ID is present
            order_id = driver.find_element(By.CSS_SELECTOR, "[data-testid='order-id']")
            assert order_id.text != "", "Order ID is empty"
            
            # Test completed successfully
            logger.info("End-to-end user flow test completed successfully")
            
        except TimeoutException as e:
            # Take screenshot of failure
            driver.save_screenshot("e2e_failure.png")
            pytest.fail(f"End-to-end test failed: Timeout waiting for element: {str(e)}")
            
        except Exception as e:
            # Take screenshot of failure
            driver.save_screenshot("e2e_failure.png")
            pytest.fail(f"End-to-end test failed: {str(e)}")
    
    def test_api_data_consistency(self, services_check):
        """Test data consistency between API endpoints."""
        # RED: This will fail if data is inconsistent across endpoints
        
        # 1. Get list of products
        products_response = requests.get("http://localhost:8000/api/v1/products", timeout=5)
        assert products_response.status_code == 200, f"Products API returned {products_response.status_code}"
        
        products = products_response.json()
        assert len(products) > 0, "No products returned from API"
        
        # 2. Get first product details
        product_id = products[0]["id"]
        product_response = requests.get(f"http://localhost:8000/api/v1/products/{product_id}", timeout=5)
        assert product_response.status_code == 200, f"Product API returned {product_response.status_code}"
        
        product = product_response.json()
        
        # 3. Verify product details match
        assert product["id"] == product_id, "Product ID mismatch"
        assert product["name"] == products[0]["name"], "Product name mismatch"
        assert product["price"] == products[0]["price"], "Product price mismatch"
        
        # 4. Get recommendations for this product
        recommendations_response = requests.get(
            f"http://localhost:8000/api/v1/recommendations?product_id={product_id}",
            timeout=5
        )
        assert recommendations_response.status_code == 200, f"Recommendations API returned {recommendations_response.status_code}"
        
        recommendations = recommendations_response.json()
        
        # 5. Verify recommendations structure
        for recommendation in recommendations:
            assert "id" in recommendation, "Recommendation missing ID"
            assert "name" in recommendation, "Recommendation missing name"
            assert "price" in recommendation, "Recommendation missing price"
            assert "image_url" in recommendation, "Recommendation missing image URL"
    
    def test_performance_metrics(self, services_check):
        """Test API and frontend performance metrics."""
        # RED: This will fail if performance is below thresholds
        
        # 1. Test API response times
        endpoints = [
            "/api/v1/health",
            "/api/v1/products",
            "/api/v1/face-shapes",
            "/api/v1/recommendations"
        ]
        
        for endpoint in endpoints:
            start_time = time.time()
            response = requests.get(f"http://localhost:8000{endpoint}", timeout=5)
            response_time = time.time() - start_time
            
            assert response.status_code == 200, f"Endpoint {endpoint} returned {response.status_code}"
            assert response_time < 2.0, f"Endpoint {endpoint} took {response_time:.2f}s (threshold: 2.0s)"
            
            logger.info(f"Endpoint {endpoint} response time: {response_time:.2f}s")
        
        # 2. Test frontend load time
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        
        try:
            driver = webdriver.Chrome(options=options)
            driver.set_page_load_timeout(30)
            
            start_time = time.time()
            driver.get("http://localhost:3000")
            
            # Wait for main content to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "main"))
            )
            
            load_time = time.time() - start_time
            assert load_time < 5.0, f"Frontend load time {load_time:.2f}s exceeds threshold (5.0s)"
            
            logger.info(f"Frontend load time: {load_time:.2f}s")
            
            # Execute JavaScript to get performance metrics
            js_metrics = driver.execute_script("""
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domLoadTime = perfData.domComplete - perfData.domLoading;
                
                return {
                    pageLoadTime: pageLoadTime,
                    domLoadTime: domLoadTime
                };
            """)
            
            logger.info(f"JS Performance metrics: {js_metrics}")
            
            assert js_metrics["pageLoadTime"] < 5000, f"Page load time: {js_metrics['pageLoadTime']}ms exceeds threshold (5000ms)"
            assert js_metrics["domLoadTime"] < 3000, f"DOM load time: {js_metrics['domLoadTime']}ms exceeds threshold (3000ms)"
            
        finally:
            if 'driver' in locals():
                driver.quit()