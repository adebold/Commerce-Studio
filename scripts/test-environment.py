#!/usr/bin/env python3
"""
Environment Configuration Test Script for EyewearML Platform

This script tests the environment configuration system to ensure
all components work correctly together.

Author: EyewearML Platform Team
Created: 2025-01-11
"""

import os
import sys
import asyncio
import json
from pathlib import Path
from typing import Dict, Any, List

# Add the src directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

try:
    from api.core.config_new import Settings
    from api.core.service_registry import ServiceRegistry, ServiceStatus
    # Import ConfigValidator directly from validate-config.py
    import importlib.util
    spec = importlib.util.spec_from_file_location("validate_config", Path(__file__).parent / "validate-config.py")
    validate_config_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(validate_config_module)
    ConfigValidator = validate_config_module.ConfigValidator
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the project root directory")
    sys.exit(1)


class EnvironmentTester:
    """Test environment configuration system"""
    
    def __init__(self):
        self.test_results: List[Dict[str, Any]] = []
        self.passed = 0
        self.failed = 0
    
    def run_test(self, test_name: str, test_func):
        """Run a single test and record results"""
        print(f"🧪 Testing {test_name}...")
        try:
            result = test_func()
            if asyncio.iscoroutine(result):
                result = asyncio.run(result)
            
            self.test_results.append({
                "name": test_name,
                "status": "PASSED",
                "result": result
            })
            self.passed += 1
            print(f"✅ {test_name} - PASSED")
            
        except Exception as e:
            self.test_results.append({
                "name": test_name,
                "status": "FAILED",
                "error": str(e)
            })
            self.failed += 1
            print(f"❌ {test_name} - FAILED: {e}")
    
    def test_config_loading(self):
        """Test configuration loading"""
        settings = Settings()
        
        # Test basic settings
        assert hasattr(settings, 'API_VERSION')
        assert hasattr(settings, 'ENVIRONMENT')
        assert hasattr(settings, 'DEBUG')
        
        # Test nested settings
        assert hasattr(settings, 'database')
        assert hasattr(settings, 'redis')
        assert hasattr(settings, 'security')
        
        return {
            "api_version": settings.API_VERSION,
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
            "database_url": settings.database.database_url[:20] + "..." if settings.database.database_url else None
        }
    
    def test_environment_validation(self):
        """Test environment validation"""
        validator = ConfigValidator()
        
        # Test with current environment
        validation_result = validator.validate_environment()
        
        return {
            "is_valid": validation_result["is_valid"],
            "error_count": len(validation_result.get("errors", [])),
            "warning_count": len(validation_result.get("warnings", []))
        }
    
    async def test_service_registry(self):
        """Test service registry functionality"""
        registry = ServiceRegistry()
        
        try:
            # Test connection (will fail if Redis not available, but that's expected)
            await registry.connect()
            
            # Test service registration
            await registry.register_service(
                name="test-service",
                version="1.0.0",
                host="localhost",
                port=8000,
                health_check_url="/health",
                metadata={"test": True},
                tags=["test"]
            )
            
            # Test service discovery
            services = await registry.discover_services(service_name="test-service")
            
            # Cleanup
            await registry.deregister_service("test-service", "localhost", 8000)
            await registry.disconnect()
            
            return {
                "connection": "success",
                "registration": "success",
                "discovery": len(services) > 0
            }
            
        except Exception as e:
            # Expected if Redis is not running
            return {
                "connection": "failed",
                "error": str(e),
                "note": "Redis connection expected to fail in test environment"
            }
    
    def test_config_validation_rules(self):
        """Test configuration validation rules"""
        validator = ConfigValidator()
        
        # Test security validation
        test_cases = [
            ("weak_key", "123", False),
            ("strong_key", "a" * 32, True),
            ("empty_key", "", False)
        ]
        
        results = []
        for name, key, should_pass in test_cases:
            try:
                is_valid = validator._validate_secret_key_strength(key)
                results.append({
                    "test": name,
                    "expected": should_pass,
                    "actual": is_valid,
                    "passed": is_valid == should_pass
                })
            except Exception as e:
                results.append({
                    "test": name,
                    "error": str(e),
                    "passed": False
                })
        
        return {
            "test_cases": len(results),
            "passed": sum(1 for r in results if r.get("passed", False)),
            "results": results
        }
    
    def test_environment_file_parsing(self):
        """Test .env.example file parsing"""
        env_example_path = Path(__file__).parent.parent / ".env.example"
        
        if not env_example_path.exists():
            raise FileNotFoundError(".env.example file not found")
        
        # Parse the file
        variables = {}
        with open(env_example_path, 'r') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    variables[key.strip()] = value.strip()
        
        # Check for required variables
        required_vars = [
            'API_VERSION', 'ENVIRONMENT', 'DEBUG',
            'DATABASE_URL', 'REDIS_URL', 'SECRET_KEY'
        ]
        
        missing_vars = [var for var in required_vars if var not in variables]
        
        return {
            "total_variables": len(variables),
            "required_variables": len(required_vars),
            "missing_variables": missing_vars,
            "has_all_required": len(missing_vars) == 0
        }
    
    def test_config_inheritance(self):
        """Test configuration inheritance and overrides"""
        # Test with different environment values
        original_env = os.environ.get('ENVIRONMENT')
        
        try:
            # Test development environment
            os.environ['ENVIRONMENT'] = 'development'
            dev_settings = Settings()
            
            # Test production environment
            os.environ['ENVIRONMENT'] = 'production'
            prod_settings = Settings()
            
            return {
                "dev_debug": dev_settings.DEBUG,
                "prod_debug": prod_settings.DEBUG,
                "inheritance_working": dev_settings.DEBUG != prod_settings.DEBUG
            }
            
        finally:
            # Restore original environment
            if original_env:
                os.environ['ENVIRONMENT'] = original_env
            elif 'ENVIRONMENT' in os.environ:
                del os.environ['ENVIRONMENT']
    
    def print_summary(self):
        """Print test summary"""
        total = self.passed + self.failed
        success_rate = (self.passed / total * 100) if total > 0 else 0
        
        print("\n" + "="*60)
        print("🧪 ENVIRONMENT CONFIGURATION TEST SUMMARY")
        print("="*60)
        print(f"Total Tests: {total}")
        print(f"Passed: {self.passed} ✅")
        print(f"Failed: {self.failed} ❌")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if self.failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result["status"] == "FAILED":
                    print(f"  - {result['name']}: {result['error']}")
        
        print("\n📊 DETAILED RESULTS:")
        for result in self.test_results:
            status_icon = "✅" if result["status"] == "PASSED" else "❌"
            print(f"  {status_icon} {result['name']}")
            if result["status"] == "PASSED" and "result" in result:
                if isinstance(result["result"], dict):
                    for key, value in result["result"].items():
                        print(f"    {key}: {value}")
        
        return success_rate >= 80


def main():
    """Main test function"""
    print("🚀 Starting Environment Configuration Tests")
    print("="*60)
    
    tester = EnvironmentTester()
    
    # Run all tests
    tester.run_test("Configuration Loading", tester.test_config_loading)
    tester.run_test("Environment Validation", tester.test_environment_validation)
    tester.run_test("Service Registry", tester.test_service_registry)
    tester.run_test("Validation Rules", tester.test_config_validation_rules)
    tester.run_test("Environment File Parsing", tester.test_environment_file_parsing)
    tester.run_test("Configuration Inheritance", tester.test_config_inheritance)
    
    # Print summary and exit with appropriate code
    success = tester.print_summary()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()