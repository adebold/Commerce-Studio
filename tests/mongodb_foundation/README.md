# MongoDB Foundation Service - TDD Framework

## Overview

This Test-Driven Development (TDD) framework provides comprehensive test specifications for the MongoDB Foundation Service. The framework follows the RED-GREEN-REFACTOR cycle to ensure robust, well-tested implementation of the MongoDB Foundation Service based on the architecture specifications.

## Architecture Context

The tests are designed to validate implementation against these specifications:
- [`docs/architecture/mongodb-foundation-technical-spec.md`](../../docs/architecture/mongodb-foundation-technical-spec.md)
- [`docs/architecture/mongodb-foundation-implementation-guide.md`](../../docs/architecture/mongodb-foundation-implementation-guide.md)

## Test Categories

### 1. Schema Validation Tests
- **Purpose**: Ensure MongoDB collections conform to ProductDataService expectations
- **Key Tests**:
  - Product collection schema validation
  - Brand collection schema validation  
  - Category hierarchy support
  - Face shape compatibility structure

### 2. Performance Benchmark Tests
- **Purpose**: Validate sub-100ms query performance for 10,000+ products
- **Key Tests**:
  - Basic product queries (< 100ms)
  - Face shape compatibility queries (< 100ms)
  - Aggregation pipelines with brand/category lookups (< 100ms)
  - Bulk operations efficiency (< 5000ms for 1000 products)

### 3. Data Integrity Tests (SKU Genie Integration)
- **Purpose**: Ensure data transformation maintains integrity through AI-to-store pipeline
- **Key Tests**:
  - SKU Genie to MongoDB schema transformation
  - Brand and category name resolution
  - Data validation pipeline
  - Duplicate SKU handling

### 4. CRUD Operations with Audit Logging
- **Purpose**: Validate all database operations maintain audit trails
- **Key Tests**:
  - Product creation with audit logging
  - Product updates with change tracking
  - Comprehensive audit trail verification

### 5. Real-time Sync with Conflict Resolution
- **Purpose**: Test real-time synchronization with SKU Genie
- **Key Tests**:
  - SKU Genie webhook processing
  - Conflict resolution scenarios
  - Data consistency maintenance

### 6. ProductDataService Integration
- **Purpose**: Ensure compatibility with existing ProductDataService
- **Key Tests**:
  - Product counting operations
  - Filter and aggregation compatibility
  - Data structure compliance

### 7. Edge Case Handling
- **Purpose**: Robust handling of malformed data and failures
- **Key Tests**:
  - Malformed SKU Genie data handling
  - API failure recovery
  - Network timeout handling

### 8. Security Validation
- **Purpose**: Ensure data security and access controls
- **Key Tests**:
  - Input sanitization (NoSQL injection prevention)
  - Authentication and authorization
  - Sensitive data encryption

## TDD Workflow

### Phase 1: RED 🔴
**Write failing tests that define expected behavior**

```bash
# Run RED phase tests (should fail initially)
python run_tdd_tests.py --phase red
```

Expected outcome: All tests fail with `NotImplementedError` because the MongoDB Foundation Service doesn't exist yet.

### Phase 2: GREEN 🟢
**Implement minimum code to make tests pass**

```bash
# Run GREEN phase tests (should pass after implementation)
python run_tdd_tests.py --phase green
```

Expected outcome: Tests pass as the MongoDB Foundation Service is implemented to meet requirements.

### Phase 3: REFACTOR 🔄
**Optimize code while maintaining test coverage**

```bash
# Run refactor phase tests (optimization validation)
python run_tdd_tests.py --phase refactor
```

Expected outcome: All tests continue to pass while code is optimized for performance and maintainability.

## Quick Start

### 1. Environment Setup

```bash
# Install test dependencies
pip install -r test_requirements.txt

# Validate test environment
python run_tdd_tests.py --validate
```

### 2. Run Initial RED Phase

```bash
# Start TDD cycle with RED phase
python run_tdd_tests.py --phase red
```

This will run all tests and they should fail, confirming the tests are properly defining the expected behavior.

### 3. Implement Service (Auto-Coder Phase)

After RED phase completion, use the [`🧠 Auto-Coder`](../../.roo/modes/) mode to implement the MongoDB Foundation Service based on failing test specifications.

### 4. Validate Implementation

```bash
# Run GREEN phase to validate implementation
python run_tdd_tests.py --phase green

# Run performance tests
python run_tdd_tests.py --performance

# Run security tests  
python run_tdd_tests.py --security

# Run complete test suite
python run_tdd_tests.py --all
```

## Test Execution Options

### Specific Test Categories

```bash
# Performance tests only
python run_tdd_tests.py --performance

# Security tests only
python run_tdd_tests.py --security

# Integration tests only
python run_tdd_tests.py --integration
```

### Using pytest directly

```bash
# Run specific test class
pytest test_tdd_framework_specification.py::TestSchemaValidation -v

# Run tests with specific markers
pytest -m "red_phase" -v
pytest -m "performance" -v
pytest -m "security" -v

# Run with coverage
pytest --cov=src/mongodb_foundation --cov-report=html
```

## Test Data and Fixtures

The framework provides comprehensive test fixtures:

- **`sample_product_data`**: Generated product data matching ProductDataService expectations
- **`sample_brand_data`**: Brand data for relationship testing
- **`sample_category_data`**: Category data with hierarchy support
- **`sample_sku_genie_data`**: SKU Genie format data for transformation testing
- **`bulk_test_products`**: Large datasets for performance testing
- **`security_test_data`**: Malicious input data for security testing

## Performance Requirements

The framework validates these performance requirements:

| Operation | Requirement | Test Method |
|-----------|-------------|-------------|
| Product Queries | < 100ms | `test_product_query_performance_sub_100ms_red_phase` |
| Face Shape Queries | < 100ms | `test_face_shape_query_performance_red_phase` |
| Aggregation Pipelines | < 100ms | `test_aggregation_pipeline_performance_red_phase` |
| Bulk Operations | < 5000ms (1000 items) | `test_bulk_operations_performance_red_phase` |

## Coverage Requirements

- **Minimum Coverage**: 85%
- **Line Coverage**: ≥90% for critical components
- **Branch Coverage**: ≥85% for decision logic
- **Function Coverage**: 100% for public APIs

## Integration Points

The framework tests integration with:

1. **ProductDataService**: Existing store generation service
2. **SKU Genie**: External product data source
3. **AI Enhancement Pipeline**: Face shape compatibility and product optimization
4. **Audit Logging System**: Compliance and debugging support

## Error Handling Strategy

Tests validate robust error handling for:

- **Network Failures**: Timeout and connection errors
- **Data Validation**: Malformed or missing data
- **Security Threats**: Injection attacks and unauthorized access
- **Resource Limits**: Memory and performance constraints

## Continuous Integration

The framework supports CI/CD integration:

```yaml
# Example GitHub Actions workflow
- name: Run TDD Tests
  run: |
    python tests/mongodb_foundation/run_tdd_tests.py --all
    
- name: Upload Coverage
  uses: codecov/codecov-action@v1
  with:
    file: tests/mongodb_foundation/htmlcov/coverage.xml
```

## Troubleshooting

### Common Issues

1. **Tests not failing in RED phase**
   - Verify MongoDB Foundation Service is not implemented
   - Check import statements in test specification

2. **Performance tests timing out**
   - Verify test database has sufficient data
   - Check MongoDB indexes are properly configured

3. **Security tests not catching vulnerabilities**
   - Review input sanitization implementation
   - Verify authentication/authorization mechanisms

### Debug Mode

```bash
# Run with verbose logging
pytest -v -s --log-cli-level=DEBUG

# Run single test with full traceback
pytest test_tdd_framework_specification.py::TestSchemaValidation::test_products_collection_schema_validation_red_phase -vvv --tb=long
```

## Contributing

When adding new tests:

1. Follow the RED-GREEN-REFACTOR cycle
2. Include comprehensive docstrings explaining test purpose
3. Use descriptive test names with `_red_phase` suffix for initial tests
4. Add appropriate pytest markers (`@pytest.mark.asyncio`, `@pytest.mark.performance`, etc.)
5. Update this README with new test categories

## Related Documentation

- [MongoDB Foundation Technical Specification](../../docs/architecture/mongodb-foundation-technical-spec.md)
- [MongoDB Foundation Implementation Guide](../../docs/architecture/mongodb-foundation-implementation-guide.md)
- [TDD Guidelines](../../.roo/rules/tdd_guidelines.md)
- [Auto-Coder Mode Documentation](../../.roo/modes/)

## Support

For questions about the TDD framework:

1. Review test output and logs in `tests/mongodb_foundation/test.log`
2. Check coverage reports in `tests/mongodb_foundation/htmlcov/`
3. Refer to architectural specifications for requirements clarification
4. Use the [`❓Ask`](../../.roo/modes/) mode for guidance on specific testing scenarios