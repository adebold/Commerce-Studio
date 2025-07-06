# Dialogflow Fulfillment Configuration for ML Integration

This guide demonstrates how to configure Dialogflow CX to use the ML-powered recommendation handlers for conversational AI flows.

## Overview

The ML integration adds enhanced recommendation capabilities to the Dialogflow webhook. To use these capabilities, you need to ensure that your Dialogflow flows use the correct fulfillment tags when calling the webhook.

## Fulfillment Tags

The following tags are available for ML-powered recommendations:

| Tag | Handler | Description |
|-----|---------|-------------|
| `recommendation.style` | `mlRecommendationHandlers.getStyleRecommendations` | Get ML-powered style recommendations |
| `recommendation.faceshape` | `mlRecommendationHandlers.getFaceShapeRecommendations` | Get face shape compatible frames |
| `recommendation.fit` | `mlRecommendationHandlers.getFitRecommendations` | Get fit-optimized recommendations |
| `recommendation.tryon` | `mlRecommendationHandlers.recordTryOnEvent` | Record virtual try-on events |
| `recommendation.similar` | `mlRecommendationHandlers.getSimilarFrames` | Find similar frames |
| `recommendation.trending` | `recommendationHandlers.getTrendingItems` | Get trending items (legacy handler) |

## Configuration Steps

### 1. In Dialogflow CX Console

1. Navigate to your agent in Dialogflow CX Console
2. Go to the page where you want to add the fulfillment
3. Add a new route or edit an existing one
4. Configure the fulfillment as shown below

### 2. Fulfillment Configuration

For style recommendations:

```yaml
webhook:
  webhook: eyewearml-webhook
  tag: recommendation.style
```

For face shape recommendations:

```yaml
webhook:
  webhook: eyewearml-webhook
  tag: recommendation.faceshape
```

For fit recommendations:

```yaml
webhook:
  webhook: eyewearml-webhook
  tag: recommendation.fit
```

### 3. Parameter Mapping

Make sure to map the appropriate parameters to your webhook calls.

For style recommendations:

```yaml
parameter_mappings:
  - parameter: style
    value: $session.params.style
  - parameter: occasion
    value: $session.params.occasion
  - parameter: personality
    value: $session.params.personality
  - parameter: color
    value: $session.params.color
  - parameter: material
    value: $session.params.material
  - parameter: price_range
    value: $session.params.price_range
```

For face shape recommendations:

```yaml
parameter_mappings:
  - parameter: face_shape
    value: $session.params.face_shape
  - parameter: color
    value: $session.params.color
  - parameter: material
    value: $session.params.material
  - parameter: brand
    value: $session.params.brand
  - parameter: price_range
    value: $session.params.price_range
```

## Example: Complete Style Recommendation Flow

Here's a complete example of a style recommendation flow using the ML-powered recommendations:

### Route Configuration

```yaml
routes:
  - condition: $intent.name = "Style Recommendation"
    transition: Style Recommendation
    
  - condition: $intent.name = "Get Recommendations"
    webhook:
      webhook: eyewearml-webhook
      tag: recommendation.style
    parameter_mappings:
      - parameter: style
        value: $session.params.style
      - parameter: occasion
        value: $session.params.occasion
      - parameter: personality
        value: $session.params.personality
      - parameter: color
        value: $session.params.color
      - parameter: material
        value: $session.params.material
      - parameter: price_range
        value: $session.params.price_range
```

### Response Configuration

```yaml
response:
  messages:
    - text:
        - "Based on your preferences, I've found some frames that would suit your style."
    - payload:
        type: "recommendation_cards"
```

## Testing the Integration

After configuring the fulfillment, you can test the integration:

1. Go to the "Test Agent" section in Dialogflow CX Console
2. Start a conversation with a query that triggers a style recommendation intent
3. Verify that the ML-powered recommendations are displayed
4. Check the webhook logs to ensure the correct handler is being called

## Troubleshooting

If the ML-powered recommendations are not working properly:

1. Check the webhook logs for any errors
2. Verify that the fulfillment tag matches one of the available tags
3. Ensure that the necessary parameters are being passed to the webhook
4. Check that the ML API is properly configured and accessible
