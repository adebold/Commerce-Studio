# Refined Prompts for MongoDB Foundation Service - Layer 5 (LS5)

## Executive Summary

This layer addresses the **CRITICAL PRODUCTION READINESS ISSUES** identified in the reflection analysis. The current implementation has a **73.7 overall score** with significant gaps in real database integration, security implementation, and performance validation. These prompts target the transformation from mock-heavy testing to production-grade MongoDB operations.

**Delta Analysis**: Layer 4 showed only **3.4** improvement (below epsilon threshold of 3.0), indicating insufficient progress toward production readiness. The primary blockers are:
1. **Mock-heavy implementations** masking real functionality gaps
2. **Performance claims based on hash operations** rather than DB operations  
3. **Security implementations that always return true**
4. **Code duplication and inconsistent error handling**

---

## Prompt [LS5_01] - Real MongoDB Integration Foundation

### Context
The current [`src/services/mongodb_foundation.py`](src/services/mongodb_foundation.py:349-351) contains mock implementations that claim production readiness but fail to deliver real MongoDB functionality. The ProductManager.find_by_sku method returns hardcoded mock data instead of actual database queries.

### Objective
Transform the MongoDB Foundation Service from mock-heavy implementation to production-grade MongoDB operations with real connection pooling, query optimization, and error handling.

### Focus Areas
- Replace all mock database operations with real MongoDB queries
- Implement proper connection pooling and retry logic
- Add comprehensive error handling for MongoDB operations
- Create real indexing strategy for performance optimization

### Code Reference
```python
async def find_by_sku(self, sku: str) -> Optional[Dict[str, Any]]:
    """Optimized SKU lookup with caching"""
    cache_key = f"product_sku:{sku}"
    cached = self.cache_manager.get(cache_key)
    if cached:
        return cached
    
    # Mock optimized query - NEEDS REAL IMPLEMENTATION
    result = {"_id": f"product_{sku}", "sku": sku, "name": f"Product {sku}"}
    self.cache_manager.set(cache_key, result)
    return result
```

### Requirements
- Implement real MongoDB connection with motor.motor_asyncio
- Create production-ready collection managers with actual queries
- Add comprehensive connection error handling and retry logic
- Implement database schema validation and indexing
- Add connection pooling configuration (min: 5, max: 100 connections)
- Create real aggregation pipelines for complex queries

### Expected Improvements
- **Performance**: Real database metrics instead of hash-based simulation
- **Reliability**: Actual connection handling with automatic reconnection
- **Scalability**: Connection pooling supporting 100+ concurrent operations

---

## Prompt [LS5_02] - Production Security Implementation

### Context
Current security implementation in [`tests/mongodb_foundation/test_refactor_phase_optimization.py`](tests/mongodb_foundation/test_refactor_phase_optimization.py:381-391) shows mocked security validation that always returns true, providing false confidence in security posture.

### Objective
Implement comprehensive security layer with real threat detection, input validation, zero-trust architecture, and audit logging that meets production security standards.

### Focus Areas
- Real input validation with regex pattern matching for injection attacks
- JWT token validation with signature verification
- Zero-trust security principles with actual permission checking
- Comprehensive audit logging with tamper-proof storage

### Code Reference
```python
async def _test_zero_trust_principle(self, principle: str) -> bool:
    """Test individual zero-trust principle"""
    # Simulate zero-trust principle validation
    await asyncio.sleep(0.001)
    return True  # Simulated successful validation - SECURITY RISK

async def _test_threat_detection(self, threat_type: str, payload: Any) -> bool:
    """Test threat detection capability"""
    # Simulate advanced threat detection
    await asyncio.sleep(0.001)
    return True  # Simulated successful detection - SECURITY RISK
```

### Requirements
- Implement real threat detection patterns for SQL/NoSQL injection, XSS, command injection
- Create JWT token validation with expiration, signature, and claims verification
- Add role-based access control (RBAC) with granular permissions
- Implement data encryption at rest using MongoDB encryption features
- Create audit logging with cryptographic integrity protection
- Add rate limiting with distributed Redis-based implementation

### Expected Improvements
- **Security Score**: Target >85 (current: 67.5)
- **Vulnerability Detection**: Real pattern matching with >90% accuracy
- **Access Control**: Granular RBAC with permission inheritance

---

## Prompt [LS5_03] - Performance Optimization and Real Benchmarking

### Context
Performance tests in [`tests/mongodb_foundation/test_refactor_phase_optimization.py`](tests/mongodb_foundation/test_refactor_phase_optimization.py:287-292) achieve claimed 15,000+ ops/sec through trivial hash operations rather than actual database operations, creating misleading performance metrics.

### Objective
Implement realistic performance optimization with actual MongoDB operations, connection pooling, query optimization, and honest performance benchmarking.

### Focus Areas
- Real database operations with actual MongoDB query execution
- Connection pooling optimization for high-throughput scenarios
- Query optimization with proper indexing strategies
- Realistic performance benchmarking with production-grade scenarios

### Code Reference
```python
async def _execute_optimized_cache_operation(self, key: str, value: str):
    """Simulate optimized cache operation - REFACTOR phase ultra-fast implementation"""
    # Remove asyncio.sleep to achieve ultra-high throughput
    # Simulate minimal CPU operation instead
    hash_value = hash(key + value) % 1000000
    return hash_value  # NOT REAL DATABASE OPERATION
```

### Requirements
- Replace hash-based simulation with real MongoDB operations
- Implement connection pooling with configurable pool sizes
- Add database indexes for common query patterns (SKU, brand_id, category_id)
- Create aggregation pipeline optimization for complex queries
- Implement query result caching with intelligent invalidation
- Add real-time performance monitoring with database operation timing
- Create batch operation support for high-throughput scenarios

### Expected Improvements
- **Performance Score**: Target >85 (current: 72.0)
- **Real Operations/Second**: Realistic metrics based on actual DB operations
- **Query Optimization**: <100ms for 95th percentile of product queries

---

## Prompt [LS5_04] - Code Quality and Architecture Standardization

### Context
Multiple duplicate method definitions exist in [`src/mongodb_foundation/managers.py`](src/mongodb_foundation/managers.py:259-278) and inconsistent error handling patterns throughout the codebase create maintenance challenges and reliability issues.

### Objective
Eliminate code duplication, standardize error handling patterns, implement consistent architectural patterns, and improve overall code maintainability.

### Focus Areas
- Remove duplicate method definitions and consolidate functionality
- Standardize error handling with custom exception hierarchy
- Implement consistent logging and monitoring patterns
- Add comprehensive type hints and input validation

### Code Reference
```python
# Duplicate method definition in ProductCollectionManager
async def create(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
    # First implementation...

# Later in the same class - DUPLICATE
try:
    # Ensure timestamps are set
    now = datetime.utcnow()
    if not product_data.get('created_at'):
        product_data['created_at'] = now
    product_data['updated_at'] = now
    # Duplicate implementation...
```

### Requirements
- Create unified exception hierarchy with specific error types (ValidationError, DatabaseError, SecurityError)
- Consolidate duplicate methods into single, comprehensive implementations
- Implement consistent logging format across all modules
- Add comprehensive input validation with Pydantic models
- Create standardized response formats for all API methods
- Implement retry logic with exponential backoff for database operations
- Add comprehensive type hints with strict mypy compliance

### Expected Improvements
- **Complexity Score**: Target <15 cyclomatic complexity (current: varies 7-16)
- **Maintainability**: Eliminate all duplicate code blocks
- **Type Safety**: 100% type hint coverage with mypy validation

---

## Prompt [LS5_05] - Test-Driven Development Enhancement

### Context
Current tests show high coverage metrics but test mocked implementations rather than real functionality, providing false confidence in system reliability and production readiness.

### Objective
Enhance test suite to validate real MongoDB operations, actual security implementations, and production-grade performance scenarios while maintaining TDD principles.

### Focus Areas
- Integration tests with real MongoDB instances
- Security tests that validate actual threat detection
- Performance tests with realistic database operations
- End-to-end tests covering complete data workflows

### Code Reference
```python
# Current test structure needs enhancement
async def test_security_comprehensive_zero_trust_validation(self):
    """Test comprehensive zero-trust security validation"""
    # These tests use mocked implementations
    principles = ["verify_every_request", "least_privilege_access", ...]
    for principle in principles:
        result = await self.service._test_zero_trust_principle(principle)
        self.assertTrue(result)  # Always passes due to mocking
```

### Requirements
- Create integration tests using real MongoDB test containers
- Implement security tests that validate actual input sanitization
- Add performance tests that measure real database operation timing
- Create chaos engineering tests for connection failure scenarios
- Implement data consistency validation tests
- Add load testing scenarios with concurrent operations
- Create end-to-end tests covering SKU Genie → MongoDB → Store Generation pipeline

### Expected Improvements
- **Coverage Score**: Maintain >90% while testing real implementations
- **Test Quality**: Integration tests covering all critical paths
- **Reliability**: Tests that fail when implementation has real issues

---

## Prompt [LS5_06] - MongoDB Schema Implementation

### Context
The specification in [`spec_phase_mongodb_foundation.md`](spec_phase_mongodb_foundation.md:40-188) defines comprehensive MongoDB collections for products, brands, categories, and face shape analysis, but current implementation lacks the actual schema implementation.

### Objective
Implement the complete MongoDB schema as specified, including all collections, indexes, and data relationships required for the eyewear ML platform.

### Focus Areas
- Implement Products collection with eyewear-specific fields
- Create Brands and Categories collections with proper relationships
- Add Face Shape Analysis collection for AI recommendations
- Implement optimized indexing strategy for query performance

### Code Reference
```javascript
// From specification - needs implementation
{
  _id: ObjectId,
  sku: string,
  name: string,
  description: string,
  ai_description: string,
  brand_id: ObjectId,
  category_id: ObjectId,
  frame_type: string,
  measurements: { lens_width: number, bridge_width: number, ... },
  face_shape_compatibility: { oval: number, round: number, ... },
  // ... complete schema implementation needed
}
```

### Requirements
- Implement complete Products collection schema with all specified fields
- Create Brands collection with brand characteristics and quality tiers
- Implement Categories collection with hierarchical structure support
- Add Face Shape Analysis collection for AI-powered recommendations
- Create compound indexes for optimal query performance
- Implement data validation rules at the database level
- Add full-text search indexes for product discovery
- Create aggregation pipelines for complex analytics queries

### Expected Improvements
- **Schema Completeness**: 100% implementation of specification requirements
- **Query Performance**: <2 seconds for product listing queries
- **Data Integrity**: Database-level validation ensuring data consistency

---

## Integration Success Criteria

### Technical Validation
1. **Real Database Operations**: All CRUD operations use actual MongoDB without mocks
2. **Security Implementation**: Real threat detection with measurable accuracy rates
3. **Performance Metrics**: Honest benchmarking with actual database operation timing
4. **Code Quality**: Zero duplicate methods, consistent error handling patterns
5. **Schema Implementation**: Complete MongoDB collections matching specification

### Performance Targets
- **Database Query Performance**: 95th percentile < 100ms for product queries
- **Connection Pool Efficiency**: Support 100+ concurrent operations
- **Cache Hit Rate**: >80% for frequently accessed product data
- **Security Validation**: <10ms for input validation and threat detection
- **End-to-End Pipeline**: Complete SKU Genie → Store Generation < 30 seconds

### Quality Gates
- **Test Coverage**: >90% with integration tests using real MongoDB
- **Security Score**: >85 with actual threat detection validation
- **Performance Score**: >85 with real database operation benchmarks
- **Complexity Score**: <15 cyclomatic complexity across all modules
- **Type Safety**: 100% mypy compliance with comprehensive type hints

## Next Steps

1. **TDD Mode Integration**: These prompts should drive comprehensive test creation before implementation
2. **Critic Mode Validation**: Each implementation should be validated against production readiness criteria
3. **Scorer Mode Metrics**: Real performance metrics should replace simulated benchmarks
4. **Final Assembly**: Production-ready MongoDB Foundation Service with complete documentation

This layer focuses on transforming the MongoDB Foundation Service from a mock-heavy prototype to a production-grade service that can reliably support the eyewear ML platform's data requirements.