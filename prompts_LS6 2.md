# Refined Prompts - Layer 6: Manufacturer Role & Centralized Repository

## Overview

Based on the analysis of Layer 5 MongoDB Foundation Service implementation and the user's request for a manufacturer role feature, this layer focuses on creating a comprehensive manufacturer onboarding system with an agentic approach. The prompts address critical issues identified in the reflection while implementing the new manufacturer role functionality.

## Prompt [LS6_001]

### Context
The MongoDB Foundation Service has achieved high scores (92.8 overall) but still contains mock implementations and architectural inconsistencies. The user requires a new manufacturer role that allows free product uploads to create a centralized eyewear repository, with limited dashboard access until upgrade to paid accounts.

### Objective
Implement a production-ready manufacturer role system with real database operations, comprehensive security, and an agentic user journey that encourages conversion from free to paid accounts.

### Focus Areas
- Real MongoDB operations for manufacturer data management
- Secure manufacturer authentication and authorization
- Agentic onboarding flow with conversion optimization
- Centralized product repository architecture
- Dashboard with tiered access controls

### Code Reference
```python
# Current mock implementation from reflection analysis
@dataclass
class CacheManager:
    """Cache manager for optimized query caching"""
    enabled: bool = True
    ttl: int = 300  # 5 minutes default TTL
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        # Mock implementation for testing
        return None
```

### Requirements
- Replace all mock implementations with real MongoDB operations
- Implement manufacturer-specific RBAC with free/paid tier distinctions
- Create agentic onboarding flow with conversion tracking
- Build centralized product repository with manufacturer attribution
- Implement dashboard with progressive disclosure based on account type

### Expected Improvements
- Eliminate mock dependencies (target: 0% mock usage)
- Achieve real database performance metrics (target: <100ms query time)
- Implement comprehensive manufacturer security (target: 95+ security score)

## Prompt [LS6_002]

### Context
The TDD implementation summary shows successful RED phase completion but identifies missing fixtures and real component implementations. The manufacturer role requires comprehensive test coverage for security, data integrity, and user experience.

### Objective
Create comprehensive TDD test suite for manufacturer role functionality that validates real implementations and prevents regression to mock-based testing.

### Focus Areas
- Manufacturer authentication and authorization tests
- Product upload and repository management tests
- Dashboard access control and feature gating tests
- Agentic flow conversion tracking tests
- Performance and security validation tests

### Code Reference
```python
# Required test fixtures from TDD analysis
@pytest.fixture
async def mongodb_container():
    # Real MongoDB test container implementation required

@pytest.fixture
async def real_manufacturer_manager(mongodb_container):
    # Real ManufacturerManager implementation required
```

### Requirements
- Create manufacturer-specific test fixtures with real MongoDB containers
- Implement comprehensive security testing for manufacturer data
- Add performance benchmarks for product upload and retrieval
- Create conversion funnel testing for agentic onboarding
- Validate dashboard feature gating and access controls

### Expected Improvements
- Achieve 98%+ test coverage for manufacturer functionality
- Validate real security implementations (no mock security)
- Ensure performance SLAs for manufacturer operations

## Prompt [LS6_003]

### Context
The current architecture lacks a centralized product repository and manufacturer management system. The agentic implementation strategy requires a cohesive approach to manufacturer onboarding and conversion.

### Objective
Design and implement a comprehensive manufacturer management architecture that supports the centralized eyewear repository vision with agentic conversion optimization.

### Focus Areas
- Manufacturer data model and MongoDB schema design
- Product repository architecture with manufacturer attribution
- Tiered access control system (free vs paid accounts)
- Agentic onboarding flow with conversion tracking
- Dashboard architecture with progressive feature disclosure

### Code Reference
```typescript
// Current product service structure
interface ProductService {
  // Needs manufacturer-specific extensions
}
```

### Requirements
- Design MongoDB schemas for manufacturers, products, and access tiers
- Implement manufacturer authentication with JWT and RBAC
- Create product repository with manufacturer ownership tracking
- Build agentic onboarding flow with conversion analytics
- Develop tiered dashboard with feature gating

### Expected Improvements
- Support 10,000+ manufacturers with efficient data access
- Achieve <2s response times for dashboard operations
- Implement conversion tracking with 95%+ accuracy

## Prompt [LS6_004]

### Context
The reflection analysis identified inconsistent error handling and security implementation gaps. The manufacturer role requires robust security due to handling business-critical product data and potential payment information.

### Objective
Implement comprehensive security framework for manufacturer role with real threat detection, input validation, and audit logging.

### Focus Areas
- Manufacturer authentication and session management
- Product data validation and sanitization
- Business data protection and encryption
- Audit logging for compliance and security
- Threat detection for manufacturer-specific attacks

### Code Reference
```python
# Current mock security implementation
async def _test_threat_detection(self, threat_type: str, payload: Any) -> bool:
    """Test threat detection capability"""
    # Simulate advanced threat detection
    await asyncio.sleep(0.001)
    return True  # Simulated successful detection
```

### Requirements
- Implement real JWT token validation for manufacturer sessions
- Create comprehensive input validation for product uploads
- Add encryption for sensitive manufacturer business data
- Build audit logging system for compliance tracking
- Implement real threat detection patterns for business attacks

### Expected Improvements
- Achieve 95+ security score with real implementations
- Eliminate all mock security components
- Implement comprehensive audit trail for manufacturer actions

## Prompt [LS6_005]

### Context
The user specifically requested an agentic approach with separate user journey and pages encouraging manufacturers to join. This requires sophisticated conversion optimization and user experience design.

### Objective
Create an intelligent, agentic manufacturer onboarding system that optimizes conversion from free to paid accounts through personalized experiences and progressive value demonstration.

### Focus Areas
- Intelligent onboarding flow with personalization
- Progressive value demonstration and feature discovery
- Conversion optimization with A/B testing capability
- Manufacturer success metrics and analytics
- Automated nurturing and upgrade prompts

### Code Reference
```javascript
// Current basic user flow structure
class UserJourney {
  // Needs agentic intelligence and conversion optimization
}
```

### Requirements
- Design personalized onboarding flows based on manufacturer profile
- Implement progressive feature disclosure to demonstrate value
- Create conversion tracking and optimization system
- Build manufacturer success analytics dashboard
- Develop automated nurturing campaigns for upgrade conversion

### Expected Improvements
- Achieve 25%+ conversion rate from free to paid accounts
- Reduce onboarding completion time by 40%
- Implement real-time personalization with 90%+ accuracy

## Prompt [LS6_006]

### Context
The centralized repository vision requires efficient product data management, search capabilities, and integration with existing eyewear ML tools. Performance is critical for handling industry-scale product catalogs.

### Objective
Build high-performance centralized product repository with advanced search, categorization, and ML integration capabilities for the eyewear industry.

### Focus Areas
- Scalable product data storage and indexing
- Advanced search and filtering capabilities
- Product categorization and ML feature extraction
- Integration with existing eyewear ML tools
- Performance optimization for industry-scale catalogs

### Code Reference
```python
# Current performance issues from reflection
async def _execute_optimized_cache_operation(self, key: str, value: str):
    """Simulate optimized cache operation - REFACTOR phase ultra-fast implementation"""
    # Remove asyncio.sleep to achieve ultra-high throughput
    # Simulate minimal CPU operation instead
    hash_value = hash(key + value) % 1000000
    return hash_value
```

### Requirements
- Implement real database indexing for product search performance
- Create advanced filtering system for eyewear-specific attributes
- Build ML feature extraction pipeline for product analysis
- Integrate with existing face shape compatibility systems
- Optimize for handling 100,000+ products efficiently

### Expected Improvements
- Achieve <100ms search response times for complex queries
- Support 100,000+ products with linear performance scaling
- Implement real caching with 80%+ hit rates

## Prompt [LS6_007]

### Context
The manufacturer dashboard needs to provide value to free users while creating clear upgrade incentives. The tiered access system must be intuitive and conversion-optimized.

### Objective
Design and implement an intelligent manufacturer dashboard with tiered access controls that maximizes user engagement and conversion to paid accounts.

### Focus Areas
- Tiered feature access with clear value demonstration
- Usage analytics and insights for manufacturers
- Conversion-optimized upgrade prompts and flows
- Product performance analytics and recommendations
- Integration with eyewear ML tools for paid users

### Code Reference
```typescript
// Dashboard component structure needed
interface ManufacturerDashboard {
  // Needs tiered access and conversion optimization
}
```

### Requirements
- Create responsive dashboard with tiered feature access
- Implement usage analytics and manufacturer insights
- Build conversion-optimized upgrade flows
- Add product performance analytics and recommendations
- Integrate ML tools access for paid tier users

### Expected Improvements
- Achieve 80%+ user engagement with free tier features
- Implement 15%+ conversion rate to paid accounts
- Provide real-time analytics with <3s load times

## Integration Requirements

### Cross-Prompt Dependencies
1. **LS6_001 → LS6_002**: Real implementations must be testable
2. **LS6_003 → LS6_004**: Architecture must support security requirements
3. **LS6_005 → LS6_007**: Agentic flows must integrate with dashboard
4. **LS6_006 → All**: Repository performance affects all components

### Quality Gates
- All prompts must eliminate mock implementations
- Security implementations must achieve 95+ scores
- Performance targets must be met with real database operations
- Conversion optimization must be measurable and trackable

### Success Metrics
- **Technical**: 0% mock usage, 95+ security score, <100ms query performance
- **Business**: 25%+ conversion rate, 80%+ engagement, 100,000+ product capacity
- **User Experience**: <30s onboarding completion, intuitive dashboard navigation

## Next Steps

1. **Implement Real Database Operations** (Address LS5 mock issues)
2. **Build Manufacturer Authentication System** (Security foundation)
3. **Create Agentic Onboarding Flow** (Conversion optimization)
4. **Develop Tiered Dashboard** (Value demonstration)
5. **Build Centralized Repository** (Industry-scale performance)
6. **Integrate ML Tools** (Paid tier value proposition)
7. **Implement Analytics and Tracking** (Conversion measurement)

This layer addresses the critical issues identified in the reflection while implementing the requested manufacturer role functionality with a focus on real implementations, comprehensive security, and conversion-optimized user experiences.