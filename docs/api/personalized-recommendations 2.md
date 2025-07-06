# Personalized Recommendations API

This document provides information about the personalized recommendations API endpoints, their request/response formats, and examples of how to use them.

## Endpoints

The API provides the following endpoints:

1. **GET /recommendations/personalized** - Get personalized product recommendations for a customer
2. **POST /recommendations/reinforcement-signal** - Record reinforcement signals from user interactions
3. **GET /recommendations/popular** - Get popular products based on sales and ratings
4. **GET /recommendations/trending** - Get trending products based on recent popularity increases

---

## Personalized Recommendations

### POST /recommendations/personalized

Generate personalized product recommendations based on customer data, preferences, and browsing history.

#### Request Format

```json
{
  "customer_id": "cust123456",
  "prescription_data": {
    "sphere_right": -2.5,
    "sphere_left": -2.75,
    "cylinder_right": -0.5,
    "cylinder_left": -0.75,
    "axis_right": 180,
    "axis_left": 175,
    "add_right": null,
    "add_left": null,
    "pupillary_distance": 62,
    "lens_type": "single vision",
    "lens_material": "polycarbonate",
    "lens_coatings": ["anti-reflective", "blue light filter"]
  },
  "style_preferences": ["rectangular", "full-rim", "modern"],
  "face_shape": "oval",
  "purchase_history_weight": 0.6,
  "browsing_history_weight": 0.4,
  "price_range": {
    "min": 100,
    "max": 300
  },
  "filter_params": {
    "frame_color": ["black", "tortoise"],
    "frame_material": ["acetate", "metal"],
    "gender": "unisex"
  },
  "limit": 10
}
```

#### Response Format

```json
{
  "recommendations": [
    {
      "product_id": "frame123",
      "name": "Ray-Ban RB5154 Clubmaster",
      "description": "Classic Clubmaster style with modern materials",
      "image_url": "https://example.com/images/rb5154.jpg",
      "price": 153.00,
      "sale_price": 129.99,
      "url": "https://example.com/products/rb5154",
      "category": "prescription",
      "brand": "Ray-Ban",
      "rating": 4.7,
      "review_count": 1245,
      "availability": true,
      "attributes": {
        "frame_color": "black",
        "frame_material": "acetate",
        "frame_shape": "rectangular",
        "frame_style": "semi-rimless",
        "temple_length": 145,
        "bridge_width": 21,
        "lens_width": 51
      },
      "compatibility_score": 0.92,
      "recommendation_reason": "Matches your style preferences and fits your prescription"
    },
    // Additional product recommendations...
  ],
  "recommendation_id": "rec-uuid-12345-abcde",
  "message": "Personalized recommendations generated successfully."
}
```

---

## Reinforcement Signals

### POST /recommendations/reinforcement-signal

Record reinforcement learning signals from user interactions with recommendations.

#### Request Format

```json
{
  "customer_id": "cust123456",
  "recommendation_id": "rec-uuid-12345-abcde",
  "product_id": "frame123",
  "action_type": "click",
  "timestamp": "2025-04-10T14:32:21Z",
  "session_id": "sess-789xyz",
  "action_metadata": {
    "position": 1,
    "source_page": "recommendations",
    "time_spent_viewing": 45
  }
}
```

#### Response Format

```json
{
  "status": "success",
  "message": "Reinforcement signal recorded successfully"
}
```

#### Action Types

The following action types are supported:

- **view** - Customer viewed the product
- **click** - Customer clicked on the product
- **add_to_cart** - Customer added the product to their cart
- **purchase** - Customer purchased the product
- **dismiss** - Customer dismissed or ignored the recommendation

---

## Popular Products

### GET /recommendations/popular

Get popular products based on sales and ratings.

#### Query Parameters

- **time_period** - Time period for popularity calculation (7d, 30d, 90d). Default: 30d
- **limit** - Maximum number of products to return. Default: 10
- **category** - Filter by product category
- **brand** - Filter by product brand
- **min_price** - Minimum price filter
- **max_price** - Maximum price filter

#### Example Request

```
GET /recommendations/popular?time_period=30d&limit=5&category=prescription&min_price=100&max_price=30