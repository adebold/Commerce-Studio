# MongoDB Foundation Service - TDD Execution Guide

## Quick Start

### Run RED Phase Tests (Initial Development)
```bash
cd tests/mongodb_foundation
python run_tdd_tests.py --phase red
```

### Run All Test Phases
```bash
python run_tdd_tests.py --phase all
```

### Run Specific Test Categories
```bash
# Performance tests only
python run_tdd_tests.py --phase performance

# Security tests only
python run_tdd_tests.py --phase security

# Integration tests only
python run_tdd_tests.py --phase integration
```

## TDD Workflow

### Phase 1: RED - Write Failing Tests
```bash
# Verify all tests fail before implementation
python run_tdd_tests.py --phase red

# Expected output:
# 🔴 RED Phase Results: 21 tests failed (expected)
# ✅ TDD RED phase validation successful
```

### Phase 2: GREEN - Implement Features
```bash
# Run tests after each implementation milestone
python run_tdd_tests.py --phase green

# Target output:
# 🟢 GREEN Phase Results: 21 tests passed
```

### Phase 3: REFACTOR - Optimize Code
```bash
# Run tests during refactoring to prevent regressions
python run_tdd_tests.py --phase refactor

# Ensure no performance degradation
python run_tdd_tests.py --phase performance
```

## Test Markers and Categories

### TDD Phase Markers
- `@pytest.mark.red_phase` - Tests that should fail initially
- `@pytest.mark.green_phase` - Tests with implementation complete
- `@pytest.mark.refactor_phase` - Tests during optimization

### Functional Markers
- `@pytest.mark.performance` - Performance benchmark tests
- `@pytest.mark.security` - Security validation tests
- `@pytest.mark.integration` - Integration tests with external services
- `@pytest.mark.unit` - Unit tests for individual components
- `@pytest.mark.mongodb` - Tests requiring MongoDB connection

## Test Environment Setup

### Prerequisites
```bash
# Install test dependencies
pip install -r requirements-test.txt

# Verify environment
python run_tdd_tests.py --validate
```

### MongoDB Test Database
```bash
# Start MongoDB for integration tests
docker run -d --name mongodb-test -p 27017:27017 mongo:latest

# Or use MongoDB Atlas test cluster (configured in conftest.py)
export MONGODB_TEST_URI="mongodb+srv://test:password@cluster.mongodb.net/test"
```

## Implementation Guidelines

### 1. Start with Core Infrastructure
```python
# First implement: src/mongodb_foundation/service.py
class MongoDBFoundationService:
    def __init__(self):
        self.products = ProductCollectionManager()
        self.brands = BrandCollectionManager()
        self.categories = CategoryCollectionManager()
    
    async def initialize(self):
        # Implementation needed
        pass
```

### 2. Collection Managers
```python
# Implement: src/mongodb_foundation/managers/
class ProductCollectionManager:
    async def create(self, product_data):
        # Implementation needed
        pass
    
    async def find_by_face_shape(self, face_shape):
        # Implementation needed
        pass
```

### 3. Performance Optimization
```python
# Target: Sub-100ms queries for 10,000+ products
class PerformanceOptimizer:
    async def create_indexes(self):
        # Implementation needed
        pass
    
    async def optimize_aggregation_pipeline(self):
        # Implementation needed
        pass
```

### 4. Security Implementation
```python
# Implement: src/mongodb_foundation/security/
class InputValidator:
    async def validate_product(self, data):
        # Implementation needed
        pass
    
    def sanitize_input(self, data):
        # Implementation needed
        pass
```

## Test Data and Fixtures

### Using Test Fixtures
```python
# Available fixtures in conftest.py
async def test_example(mongodb_service, sample_products):
    # mongodb_service: Configured service instance
    # sample_products: Generated test product data
    result = await mongodb_service.products.create(sample_products[0])
    assert result["id"] is not None
```

### Faker Data Generation
```python
# Custom providers available
from tests.mongodb_foundation.conftest import EyewearProvider

fake = Faker()
fake.add_provider(EyewearProvider)

# Generate test data
frame_style = fake.frame_style()  # "aviator", "wayfarer", etc.
face_shape = fake.face_shape()    # "round", "oval", etc.
brand_name = fake.eyewear_brand() # "Ray-Ban", "Oakley", etc.
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/tdd-validation.yml
name: TDD Validation
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Run TDD Tests
        run: |
          cd tests/mongodb_foundation
          python run_tdd_tests.py --phase all
```

### Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Run TDD validation before commits
pre-commit install
```

## Performance Monitoring

### Benchmark Thresholds
- **Query Performance**: < 100ms for 10,000+ products
- **Aggregation Pipelines**: < 200ms for complex operations
- **Bulk Operations**: < 500ms for 1,000 documents

### Performance Test Execution
```bash
# Run with detailed benchmarks
python -m pytest test_tdd_framework_specification.py -m performance --benchmark-json=results.json

# Generate performance report
python -c "
import json
data = json.load(open('results.json'))
for test in data['benchmarks']:
    print(f'{test[\"name\"]}: {test[\"stats\"][\"mean\"]*1000:.1f}ms')
"
```

## Debugging Test Failures

### Common Debugging Commands
```bash
# Run single test with verbose output
python -m pytest test_tdd_framework_specification.py::TestSchemaValidation::test_products_collection_schema_validation_red_phase -v -s

# Run with pdb debugger
python -m pytest test_tdd_framework_specification.py -k "test_products" --pdb

# Generate coverage report
python -m pytest test_tdd_framework_specification.py --cov=src/mongodb_foundation --cov-report=html
```

### Log Analysis
```bash
# View test logs
tail -f tests/mongodb_foundation/test.log

# Filter for specific test
grep "test_products_collection" tests/mongodb_foundation/test.log
```

## Quality Gates

### Definition of Done for GREEN Phase
- [ ] All 21 tests pass
- [ ] Code coverage ≥ 85%
- [ ] Performance benchmarks met
- [ ] Security tests pass
- [ ] Integration tests pass
- [ ] No critical code smells
- [ ] Documentation updated

### Definition of Done for REFACTOR Phase
- [ ] All tests still pass
- [ ] Performance improved or maintained
- [ ] Code complexity reduced
- [ ] Technical debt addressed
- [ ] Documentation reflects changes

## Troubleshooting

### Common Issues
1. **MongoDB Connection Failures**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **Import Errors**
   - Verify PYTHONPATH includes src/
   - Check virtual environment activation
   - Ensure all dependencies installed

3. **Performance Test Failures**
   - Check system resources
   - Verify test data size
   - Monitor database performance

### Getting Help
- Check existing issues in repository
- Review architecture documentation
- Consult TDD best practices guide
- Contact development team for complex issues

## Next Steps

After completing the TDD framework validation:
1. Begin GREEN phase implementation
2. Focus on core infrastructure first
3. Implement in small, testable increments
4. Run tests frequently during development
5. Refactor continuously while maintaining test coverage

**Ready for implementation phase!** 🚀