# MongoDB Test Framework for Eyewear ML

## Phase 2: Comprehensive MongoDB Schema Validation Tests

This test framework provides comprehensive validation for MongoDB schema design, data integrity, performance benchmarks, and migration validation for the Eyewear ML system's transition from PostgreSQL to MongoDB.

## 🎯 Test Coverage

### 1. Schema Validation Tests (`test_schema_validation.py`)
- **Products Collection Validation**
  - Required field enforcement (product_id, name, brand_id, metadata)
  - Data type validation (strings, numbers, ObjectIds, dates)
  - Face shape compatibility score validation (0.0-1.0 range)
  - Metadata status enum validation (active, inactive, draft, archived)
  - Nested object structure validation
  - Array field validation

- **Brands Collection Validation**
  - Required field enforcement (brand_id, name, metadata)
  - Brand status validation (active, inactive)
  - Complete document insertion validation

- **Categories Collection Validation**
  - Required field enforcement (category_id, name, level, metadata)
  - Level validation (non-negative numbers)
  - Hierarchy validation (parent_id, path consistency)
  - Complete document insertion validation

### 2. Data Integrity Tests (`test_data_integrity.py`)
- **Cross-Collection References**
  - Product-to-brand reference integrity
  - Product-to-category reference integrity  
  - Category parent-child relationships
  - Orphaned reference detection

- **Duplicate Prevention**
  - Unique constraints for product_id, SKU, UPC
  - Unique constraints for brand_id, brand name
  - Unique constraints for category_id, category slug
  - Sparse index behavior for optional fields

- **Data Consistency**
  - Product analytics data consistency
  - Face shape score range validation
  - Category hierarchy consistency
  - Brand metrics consistency with product data

- **Relationship Integrity**
  - Cascade delete simulation
  - Referential integrity checking
  - Bidirectional relationship consistency

### 3. Performance Benchmark Tests (`test_performance_benchmarks.py`)
- **Query Performance (<100ms target)**
  - Simple find queries
  - Text search queries
  - Sorted queries
  - Face shape compatibility queries
  - Complex aggregation pipelines

- **Index Utilization**
  - Index usage verification with explain()
  - Compound index utilization
  - Text index utilization
  - Unused index detection

- **Concurrent Access**
  - Concurrent read performance
  - Concurrent write performance
  - Mixed read/write operations

- **Large Dataset Performance (10,000+ products)**
  - Large dataset creation and insertion
  - Query performance on large datasets
  - Face shape queries on large datasets
  - Memory usage efficiency
  - Performance regression detection

### 4. Migration Validation Tests (`test_migration_validation.py`)
- **SKU Genie Data Transformation**
  - Field mapping validation
  - Data type conversions
  - Nested structure creation
  - Batch transformation validation

- **PostgreSQL to MongoDB Migration**
  - Data type migration (INTEGER→ObjectId, JSON→Object, etc.)
  - Relationship migration (Foreign Keys→ObjectId references)
  - Migration data integrity validation

- **Data Quality Preservation**
  - Quality score preservation from SKU Genie
  - Quality improvement tracking
  - Quality validation rules application

- **ML Compatibility Score Accuracy**
  - Face shape compatibility score validation
  - Score range validation (0.0-1.0)
  - Confidence score validation
  - ML score validation rules

## 🚀 Quick Start

### Prerequisites
1. **MongoDB Installation**
   ```bash
   # Local MongoDB
   brew install mongodb/brew/mongodb-community  # macOS
   # OR use MongoDB Atlas cloud service
   ```

2. **Python Dependencies**
   ```bash
   pip install -r tests/mongodb/requirements.txt
   ```

3. **Environment Variables** (optional)
   ```bash
   export MONGODB_TEST_URL="mongodb://localhost:27017/eyewear_ml_test"
   export MONGODB_TEST_DATABASE="eyewear_ml_test"
   ```

### Running Tests

#### Run All Tests
```bash
cd tests/mongodb
python run_tests.py
```

#### Run Specific Test Categories
```bash
# Schema validation only
python run_tests.py schema

# Data integrity only  
python run_tests.py integrity

# Performance benchmarks only
python run_tests.py performance

# Migration validation only
python run_tests.py migration
```

#### Run Individual Test Files
```bash
# Using pytest directly
pytest test_schema_validation.py -v
pytest test_data_integrity.py -v
pytest test_performance_benchmarks.py -v
pytest test_migration_validation.py -v
```

## 📊 Performance Targets

| Test Category | Target | Measurement |
|---------------|--------|-------------|
| Query Performance | <100ms | Individual query execution time |
| Bulk Operations | <10ms/record | Average insertion time per product |
| Test Suite Execution | <5 minutes | Total time for all tests |
| Large Dataset Queries | <200ms | Queries on 10,000+ products |
| Concurrent Operations | <50ms avg | Average time under concurrent load |

## 🏗️ Test Architecture

### Test Fixtures (`conftest.py`)
- **mongodb_client**: Session-scoped MongoDB client
- **mongodb_database**: Test database instance
- **clean_collections**: Function-scoped collection cleanup
- **products_collection**: Products collection with schema validation
- **brands_collection**: Brands collection with schema validation
- **categories_collection**: Categories collection with schema validation
- **sample_data fixtures**: Generated test data for various scenarios
- **performance_timer**: High-precision timing for performance tests

### Test Data Generation
- **Realistic product data**: Based on actual eyewear specifications
- **Face shape compatibility**: ML-generated compatibility scores
- **Quality scores**: Data quality metrics from SKU Genie
- **Bulk data sets**: Automated generation of large test datasets
- **Edge cases**: Boundary conditions and error scenarios

## 🔧 Configuration

### MongoDB Schema Validation
The test framework creates collections with JSON Schema validation:

```javascript
// Products Collection Schema
{
  "$jsonSchema": {
    "bsonType": "object",
    "required": ["product_id", "name", "brand_id", "metadata"],
    "properties": {
      "product_id": {"bsonType": "string"},
      "name": {"bsonType": "string"},
      "brand_id": {"bsonType": "objectId"},
      "face_shape_compatibility": {
        "bsonType": "object",
        "properties": {
          "oval": {
            "properties": {
              "score": {"bsonType": "number", "minimum": 0, "maximum": 1}
            }
          }
        }
      }
    }
  }
}
```

### Index Strategy
Optimized indexes for performance testing:

```python
# Performance indexes
await products_collection.create_index([("name", "text"), ("description", "text")])
await products_collection.create_index("metadata.status")
await products_collection.create_index("analytics.popularity_score")
await products_collection.create_index("face_shape_compatibility.oval.score")
```

## 📈 Continuous Integration

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: MongoDB Tests
on: [push, pull_request]
jobs:
  mongodb-tests:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r tests/mongodb/requirements.txt
      - name: Run MongoDB tests
        run: cd tests/mongodb && python run_tests.py
```

### Performance Monitoring
- **Baseline metrics**: Established performance benchmarks
- **Regression detection**: Automated alerts for performance degradation
- **Trend analysis**: Historical performance tracking
- **Optimization guidance**: Recommendations for improvement

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB status
   brew services list | grep mongodb  # macOS
   sudo systemctl status mongod       # Linux
   
   # Start MongoDB
   brew services start mongodb/brew/mongodb-community  # macOS
   sudo systemctl start mongod                         # Linux
   ```

2. **Schema Validation Errors**
   - Ensure test data matches schema requirements
   - Check for required fields and data types
   - Validate nested object structures

3. **Performance Test Failures**
   - Check MongoDB index creation
   - Verify sufficient system resources
   - Review query execution plans with explain()

4. **Test Timeout Issues**
   - Increase timeout values for large datasets
   - Optimize MongoDB configuration
   - Check system performance

### Debug Mode
```bash
# Run with verbose output
pytest test_schema_validation.py -v -s

# Run specific test
pytest test_schema_validation.py::TestProductsSchemaValidation::test_product_required_fields_validation -v
```

## 📚 Next Steps

After successful completion of Phase 2 testing:

1. **Phase 3**: Implement actual MongoDB schemas in Auto-Coder mode
2. **Phase 4**: Data migration implementation  
3. **Phase 5**: Production deployment with monitoring
4. **Phase 6**: Performance optimization and scaling

## 🤝 Contributing

When adding new tests:

1. Follow TDD principles - write tests before implementation
2. Maintain <5 minute total execution time
3. Include performance benchmarks for new features
4. Update documentation for new test categories
5. Ensure all tests are deterministic and repeatable

## 📞 Support

For issues with the MongoDB test framework:
- Check the troubleshooting section above
- Review MongoDB logs for connection issues
- Validate test environment setup
- Contact the development team for schema-related questions