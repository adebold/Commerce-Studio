
# Personalized Recommendations System

## Overview

This PR introduces a complete personalized product recommendations system for the eyewear platform. The system uses machine learning techniques to provide tailored product suggestions to customers based on their preferences, browsing history, purchase history, and optical prescription data.

## Features Implemented

- **Personalized Recommendations API**: Core recommendation engine that considers customer data to suggest relevant products
- **Reinforcement Learning Signal Collection**: System to gather user feedback for continuous model improvement
- **Popular Products API**: Endpoint to retrieve products that are popular based on sales and ratings
- **Trending Products API**: Endpoint to retrieve products that are showing recent growth in popularity

## Implementation Details

### API Endpoints

The following endpoints have been added:

- `POST /recommendations/personalized`: Generate personalized recommendations
- `POST /recommendations/reinforcement-signal`: Record user interactions with recommendations
- `GET /recommendations/popular`: Get popular products with filtering options
- `GET /recommendations/trending`: Get trending products with filtering options

### Components

1. **Data Models**
   - `recommendations.py`: Defines all data models for requests, responses, and internal representation
   - Added models for prescription data, recommendation requests, product recommendations, etc.

2. **Services**
   - `recommendation_service.py`: Core service handling recommendation logic
   - Implementation includes methods for generating personalized recommendations, processing reinforcement signals, and retrieving popular/trending products

3. **Router**
   - `recommendations.py`: FastAPI router with endpoint definitions
   - Includes proper input validation, error handling, and authentication checks

4. **Documentation**
   - Comprehensive API documentation in the `/docs/api/personalized-recommendations.md` file
   - Added detailed implementation next steps for future improvements

## Security and Performance Considerations

- **Authentication**: All endpoints require proper authentication
- **Tenant Isolation**: Recommendations are filtered by tenant to maintain data isolation
- **Rate Limiting**: Applied rate limiting to prevent API abuse
- **Error Handling**: Comprehensive error handling with informative error messages

## Testing Instructions

### Local Testing

1. Start the API server:
   ```
   cd src/api
   uvicorn main:app --reload
   ```

2. Test personalized recommendations:
   ```
   curl -X POST http://localhost:8000/recommendations/personalized \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <your-token>" \
     -d '{
       "customer_id": "cust123456",
       "style_preferences": ["rectangular", "full-rim"],
       "face_shape": "oval",
       "limit": 5
     }'
   ```

3. Test popular products:
   ```
   curl http://localhost:8000/recommendations/popular?limit=5&category=prescription \
     -H "Authorization: Bearer <your-token>"
   ```

### Integration Testing with Frontend

The frontend can integrate with these endpoints by:

1. For personalized recommendations:
   ```javascript
   async function getPersonalizedRecommendations(customerId, preferences) {
     const response = await fetch('/api/recommendations/personalized', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
       },
       body: JSON.stringify({
         customer_id: customerId,
         style_preferences: preferences.styles,
         face_shape: preferences.faceShape,
         limit: 10
       })
     });
     return await response.json();
   }
   ```

2. For recording user interaction signals:
   ```javascript
   async function recordUserInteraction(customerId, recommendationId, productId, action) {
     await fetch('/api/recommendations/reinforcement-signal', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
       },
       body: JSON.stringify({
         customer_id: customerId,
         recommendation_id: recommendationId,
         product_id: productId,
         action_type: action,
         timestamp: new Date().toISOString(),
         session_id: currentSessionId
       })
     });
   }
   ```

## Deployment Considerations

1. **Database Migrations**:
   - No database migrations are required for this implementation yet, but future versions will require migrations for storing reinforcement signals and model data.

2. **External Dependencies**:
   - This implementation requires the `DeepSeekService` and `MasterFrameService` to be operational.

3. **Environment Variables**:
   - No new environment variables are required for the basic functionality.
   - Future enhancements will need configuration for ML model endpoints.

## Documentation

Complete API documentation has been added in the `/docs/api/personalized-recommendations.md` file. This includes:

- Request and response formats for all endpoints
- Query parameter details
- Error response definitions
- Authentication requirements
- Example requests and responses

## Future Enhancements

The following enhancements are planned for future updates:

1. **Full ML model integration**: Replace the placeholder scoring logic with a full ML model
2. **Real-time model updates**: Implement a system for real-time model updates based on reinforcement signals
3. **A/B testing framework**: Add support for A/B testing different recommendation algorithms
4. **Recommendation explanations**: Enhance the recommendation reasons with more detailed explanations
5. **Performance optimizations**: Add caching and optimization for high-traffic scenarios

## Related Work

This feature connects with:
- The product catalog system
- User authentication and permissions
- The frontend recommendation display components (to be implemented)

## Testing Done

- Manual API testing with different input parameters
- Validation of response formats against specification
- Authentication and authorization testing

## Screenshots

(None at this stage as this is a backend API implementation)

## Closes

- Resolves #123: Implement personalized product recommendations
- Relates to #145: Enhance user experience with personalized content
=