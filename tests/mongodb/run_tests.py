"""
MongoDB Test Runner

Comprehensive test runner for MongoDB schema validation tests with performance tracking
and detailed reporting.
"""
import os
import sys
import time
import asyncio
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

# Add the project root to the Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


class MongoDBTestRunner:
    """MongoDB test runner with performance tracking and reporting."""
    
    def __init__(self):
        self.test_results = {}
        self.start_time = None
        self.end_time = None
        
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all MongoDB tests and return comprehensive results."""
        print("🧪 Starting MongoDB Test Suite")
        print("=" * 60)
        
        self.start_time = datetime.utcnow()
        
        # Test categories to run
        test_categories = [
            ("Schema Validation", "test_schema_validation.py"),
            ("Data Integrity", "test_data_integrity.py"),
            ("Performance Benchmarks", "test_performance_benchmarks.py"),
            ("Migration Validation", "test_migration_validation.py")
        ]
        
        # Run each test category
        for category_name, test_file in test_categories:
            print(f"\n📋 Running {category_name} Tests...")
            result = self._run_test_file(test_file)
            self.test_results[category_name] = result
            
            if result["passed"]:
                print(f"✅ {category_name}: PASSED ({result['duration']:.2f}s)")
            else:
                print(f"❌ {category_name}: FAILED ({result['duration']:.2f}s)")
                print(f"   Error: {result['error']}")
        
        self.end_time = datetime.utcnow()
        
        # Generate summary report
        return self._generate_summary_report()
    
    def _run_test_file(self, test_file: str) -> Dict[str, Any]:
        """Run a specific test file and return results."""
        test_path = Path(__file__).parent / test_file
        
        if not test_path.exists():
            return {
                "passed": False,
                "duration": 0.0,
                "error": f"Test file {test_file} not found",
                "output": ""
            }
        
        start_time = time.time()
        
        try:
            # Run pytest with verbose output and specific markers
            cmd = [
                sys.executable, "-m", "pytest",
                str(test_path),
                "-v",
                "--tb=short",
                "--no-header",
                "--disable-warnings"
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout per test file
            )
            
            duration = time.time() - start_time
            
            return {
                "passed": result.returncode == 0,
                "duration": duration,
                "error": result.stderr if result.returncode != 0 else None,
                "output": result.stdout,
                "return_code": result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                "passed": False,
                "duration": time.time() - start_time,
                "error": "Test execution timed out (5 minutes)",
                "output": ""
            }
        except Exception as e:
            return {
                "passed": False,
                "duration": time.time() - start_time,
                "error": str(e),
                "output": ""
            }
    
    def _generate_summary_report(self) -> Dict[str, Any]:
        """Generate comprehensive summary report."""
        total_duration = (self.end_time - self.start_time).total_seconds()
        
        passed_categories = [name for name, result in self.test_results.items() if result["passed"]]
        failed_categories = [name for name, result in self.test_results.items() if not result["passed"]]
        
        summary = {
            "total_duration": total_duration,
            "total_categories": len(self.test_results),
            "passed_categories": len(passed_categories),
            "failed_categories": len(failed_categories),
            "success_rate": len(passed_categories) / len(self.test_results) * 100,
            "passed": len(failed_categories) == 0,
            "results": self.test_results,
            "timestamp": self.start_time.isoformat()
        }
        
        # Print detailed summary
        print("\n" + "=" * 60)
        print("📊 MONGODB TEST SUITE SUMMARY")
        print("=" * 60)
        print(f"Total Duration: {total_duration:.2f} seconds")
        print(f"Categories Run: {summary['total_categories']}")
        print(f"Passed: {summary['passed_categories']}")
        print(f"Failed: {summary['failed_categories']}")
        print(f"Success Rate: {summary['success_rate']:.1f}%")
        
        if passed_categories:
            print(f"\n✅ Passed Categories:")
            for category in passed_categories:
                duration = self.test_results[category]["duration"]
                print(f"   • {category} ({duration:.2f}s)")
        
        if failed_categories:
            print(f"\n❌ Failed Categories:")
            for category in failed_categories:
                duration = self.test_results[category]["duration"]
                error = self.test_results[category]["error"]
                print(f"   • {category} ({duration:.2f}s)")
                print(f"     Error: {error}")
        
        # Performance insights
        print(f"\n🚀 Performance Insights:")
        fastest_category = min(self.test_results.items(), key=lambda x: x[1]["duration"])
        slowest_category = max(self.test_results.items(), key=lambda x: x[1]["duration"])
        
        print(f"   • Fastest: {fastest_category[0]} ({fastest_category[1]['duration']:.2f}s)")
        print(f"   • Slowest: {slowest_category[0]} ({slowest_category[1]['duration']:.2f}s)")
        
        if total_duration < 300:  # 5 minutes
            print(f"   • Overall: EXCELLENT - Under 5 minutes ✨")
        elif total_duration < 600:  # 10 minutes
            print(f"   • Overall: GOOD - Under 10 minutes ✅")
        else:
            print(f"   • Overall: NEEDS OPTIMIZATION - Over 10 minutes ⚠️")
        
        return summary
    
    def run_specific_category(self, category: str) -> Dict[str, Any]:
        """Run tests for a specific category."""
        category_map = {
            "schema": "test_schema_validation.py",
            "integrity": "test_data_integrity.py", 
            "performance": "test_performance_benchmarks.py",
            "migration": "test_migration_validation.py"
        }
        
        if category.lower() not in category_map:
            available = ", ".join(category_map.keys())
            raise ValueError(f"Unknown category '{category}'. Available: {available}")
        
        test_file = category_map[category.lower()]
        print(f"🧪 Running {category.title()} Tests Only")
        print("=" * 40)
        
        self.start_time = datetime.utcnow()
        result = self._run_test_file(test_file)
        self.end_time = datetime.utcnow()
        
        self.test_results[category.title()] = result
        
        if result["passed"]:
            print(f"✅ {category.title()}: PASSED ({result['duration']:.2f}s)")
        else:
            print(f"❌ {category.title()}: FAILED ({result['duration']:.2f}s)")
            print(f"   Error: {result['error']}")
        
        return self._generate_summary_report()


def check_mongodb_connection():
    """Check if MongoDB is available for testing."""
    try:
        import pymongo
        from motor.motor_asyncio import AsyncIOMotorClient
        
        # Check connection
        test_url = os.environ.get("MONGODB_TEST_URL", "mongodb://localhost:27017/eyewear_ml_test")
        client = pymongo.MongoClient(test_url, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        client.close()
        
        print("✅ MongoDB connection successful")
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        print("\n📋 MongoDB Setup Instructions:")
        print("1. Install MongoDB locally or use MongoDB Atlas")
        print("2. Set MONGODB_TEST_URL environment variable (optional)")
        print("3. Ensure the test database is accessible")
        return False


def main():
    """Main entry point for MongoDB tests."""
    print("🏗️  MongoDB Test Framework for Eyewear ML")
    print("Phase 2: Comprehensive MongoDB Schema Validation Tests")
    print()
    
    # Check MongoDB connection first
    if not check_mongodb_connection():
        print("\n⚠️  MongoDB tests cannot run without a valid connection")
        return 1
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        category = sys.argv[1]
        runner = MongoDBTestRunner()
        try:
            summary = runner.run_specific_category(category)
        except ValueError as e:
            print(f"❌ {e}")
            return 1
    else:
        # Run all tests
        runner = MongoDBTestRunner()
        summary = runner.run_all_tests()
    
    # Return appropriate exit code
    return 0 if summary["passed"] else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)