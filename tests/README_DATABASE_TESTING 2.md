# Database Testing with Prisma

This document outlines the approach for testing database interactions using Prisma in the Eyewear ML project.

## Overview

The test suite has been enhanced to include comprehensive database interaction testing against a real test database. This ensures that our data persistence layer works correctly and that our application properly writes to and reads from the database.

## Test Database Setup

### Configuration

The test database is configured in `tests/conftest.py` with the following environment variables:

```python
os.environ["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/eyewear_ml_test"
os.environ["USE_PRISMA"] = "True"
os.environ["ENVIRONMENT"] = "test"
```

### Prerequisites

To run the database tests, you need:

1. PostgreSQL installed and running
2. A database named `eyewear_ml_test` created
3. A user `postgres` with password `postgres` that has access to the test database

You can create the test database with:

```sql
CREATE DATABASE eyewear_ml_test;
```

### Schema Migration

Before running tests, ensure the database schema is up to date:

```bash
# From the project root
python -m scripts.setup_prisma
```

## Test Structure

The database tests are organized into three categories:

1. **Integration Tests**: Test database operations in isolation
2. **API Tests**: Test API endpoints with database verification
3. **E2E Tests**: Test complete user flows with database verification

### Key Test Files

- `tests/test_prisma_integration.py`: Basic Prisma integration tests
- `tests/integration/sku_genie/test_prisma_integration.py`: SKU Genie integration tests with database verification
- `tests/api/test_recommendation_service_with_db.py`: API tests with database verification
- `tests/e2e/test_consumer_data_opt_in_with_db.py`: E2E tests with database verification

## Test Fixtures

The following fixtures are available for database testing:

### Global Fixtures (in `tests/conftest.py`)

- `prisma_client`: Provides a connected Prisma client
- `clean_db`: Ensures a clean database state for each test
- `setup_test_db`: Combines prisma_client and clean_db for convenience

### Test-Specific Fixtures

Each test file may define additional fixtures for specific testing needs, such as:

- `test_tenant`: Creates a test tenant ID
- `test_user`: Creates a test user in the database
- `test_client`: Creates a test client in the database

## Best Practices

When writing database tests, follow these best practices:

1. **Isolation**: Each test should be isolated and not depend on the state from other tests
2. **Clean Up**: Always clean up test data after tests complete
3. **Verification**: Verify both the API response and the actual database state
4. **Use Transactions**: When possible, use transactions to roll back changes
5. **Use Unique IDs**: Generate unique IDs for test entities to avoid conflicts

Example of proper test structure:

```python
@pytest.mark.asyncio
async def test_create_and_verify(prisma_client):
    # 1. Set up test data
    test_id = f"test-{uuid.uuid4()}"
    
    # 2. Perform the operation
    result = await create_something(test_id)
    
    # 3. Verify the API response
    assert result.success is True
    
    # 4. Verify the database state
    db_record = await prisma_client.client.something.find_unique(
        where={"id": test_id}
    )
    assert db_record is not None
    assert db_record.property == expected_value
    
    # 5. Clean up
    await prisma_client.client.something.delete(
        where={"id": test_id}
    )
```

## Running Database Tests

To run all database tests:

```bash
pytest tests/
```

To run specific database tests:

```bash
# Run only Prisma integration tests
pytest tests/test_prisma_integration.py

# Run only SKU Genie database tests
pytest tests/integration/sku_genie/test_prisma_integration.py

# Run only API database tests
pytest tests/api/test_recommendation_service_with_db.py

# Run only E2E database tests
pytest tests/e2e/test_consumer_data_opt_in_with_db.py
```

## Troubleshooting

### Connection Issues

If you encounter database connection issues:

1. Verify PostgreSQL is running
2. Check the database URL in the environment variables
3. Ensure the test database exists
4. Verify the user has proper permissions

### Schema Issues

If you encounter schema-related errors:

1. Run the migration script again
2. Check for any pending migrations
3. Verify the schema in `prisma/schema.prisma`

### Test Failures

If tests fail due to database issues:

1. Check if the test is properly cleaning up after itself
2. Verify that the test is not depending on state from other tests
3. Check if the database operations are properly wrapped in try/except blocks
4. Verify that the test is using the correct database models and fields

## Extending the Test Suite

When adding new database tests:

1. Follow the existing patterns for test organization
2. Use the provided fixtures for database access
3. Ensure proper setup and cleanup
4. Verify both API responses and database state
5. Document any new fixtures or patterns in this README

## Continuous Integration

The database tests are run as part of the CI pipeline. The CI environment:

1. Sets up a PostgreSQL database
2. Runs migrations
3. Executes the tests
4. Reports results

See `.github/workflows/ci.yml` for details on the CI configuration.