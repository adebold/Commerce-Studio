# VARAi Python SDK

The VARAi Python SDK provides a convenient way to interact with the VARAi API from Python applications.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Authentication](#authentication)
4. [API Reference](#api-reference)
   - [Frames](#frames)
   - [Recommendations](#recommendations)
   - [Users](#users)
   - [Analytics](#analytics)
5. [Examples](#examples)
6. [Error Handling](#error-handling)
7. [Async Support](#async-support)
8. [Logging](#logging)

## Installation

### Using pip

```bash
pip install varai
```

### Using poetry

```bash
poetry add varai
```

## Configuration

### Basic Configuration

```python
from varai import VaraiClient

# Create a client instance
varai = VaraiClient(
    api_key="${API_KEY_242}",
    environment="production"  # 'production', 'staging', or 'development'
)
```

### Advanced Configuration

```python
from varai import VaraiClient

# Create a client instance with advanced options
varai = VaraiClient(
    api_key="${API_KEY_242}",
    environment="production",
    timeout=30,  # Request timeout in seconds (default: 30)
    retries=3,  # Number of retry attempts for failed requests (default: 3)
    base_url="https://api.custom-domain.com/v1",  # Custom API URL (optional)
    headers={  # Additional headers to include with every request (optional)
        "X-Custom-Header": "custom-value"
    }
)
```

## Authentication

### API Key Authentication

```python
# API key authentication (recommended for server-side applications)
varai = VaraiClient(api_key="${API_KEY_242}")
```

### Bearer Token Authentication

```python
# Bearer token authentication (recommended for user-specific operations)
varai = VaraiClient(bearer_token="user_jwt_token")
```

### OAuth 2.0 Authentication

```python
# OAuth 2.0 authentication (for web applications)
varai = VaraiClient()

# Generate the authorization URL
auth_url = varai.auth.get_authorization_url(
    client_id="your_client_id",
    redirect_uri="https://your-app.com/callback",
    scope=["frames:read", "recommendations:read"],
    state="random_state_string"
)

# Redirect the user to the authorization URL
# ...

# In your callback handler, exchange the authorization code for tokens
tokens = varai.auth.exchange_code_for_tokens(
    client_id="your_client_id",
    client_secret="${PYTHON_SECRET_1}",
    code="authorization_code",
    redirect_uri="https://your-app.com/callback"
)

# Configure the client with the access token
varai.set_access_token(tokens["access_token"])

# Store the refresh token securely
# ...

# When the access token expires, use the refresh token to get a new one
new_tokens = varai.auth.refresh_tokens(
    client_id="your_client_id",
    client_secret="${PYTHON_SECRET_1}",
    refresh_token=stored_refresh_token
)

# Update the client with the new access token
varai.set_access_token(new_tokens["access_token"])
```

## API Reference

### Frames

#### List Frames

```python
# List frames with optional filtering
response = varai.frames.list(
    brand="RayBender",  # Filter by brand (optional)
    style="round",  # Filter by style (optional)
    material="acetate",  # Filter by material (optional)
    color="tortoise",  # Filter by color (optional)
    min_price=50,  # Minimum price (optional)
    max_price=200,  # Maximum price (optional)
    face_shape="oval",  # Filter by suitable face shape (optional)
    page=1,  # Page number (default: 1)
    limit=20  # Results per page (default: 20, max: 100)
)

frames = response["frames"]
pagination = response["pagination"]

# Access frame data
for frame in frames:
    print(frame["name"], frame["brand"], frame["price"])

# Access pagination data
print(f"Showing {len(frames)} of {pagination['total']} frames")
print(f"Page {pagination['page']} of {pagination['pages']}")
```

#### Get Frame Details

```python
# Get details for a specific frame
frame = varai.frames.get("f12345")

print(frame["name"], frame["brand"], frame["price"])
print(frame["dimensions"])
print(frame["colors"])
```

#### Search Frames

```python
# Search frames by text query
results = varai.frames.search("blue round glasses")

print(f"Found {len(results)} frames matching the query")
```

### Recommendations

#### Generate Recommendations

```python
# Generate personalized recommendations
recommendations = varai.recommendations.generate(
    user_id="u78901",  # User ID for personalized recommendations (optional)
    face_shape="oval",  # User's face shape (optional)
    preferences={  # User preferences (optional)
        "styles": ["round", "cat-eye"],
        "materials": ["acetate"],
        "colors": ["black", "tortoise"],
        "price_range": {
            "min": 80,
            "max": 200
        }
    },
    limit=10  # Maximum number of recommendations (default: 10, max: 50)
)

# Access recommendation data
for recommendation in recommendations:
    print(recommendation["frame"]["name"], recommendation["score"], recommendation["reasoning"])
```

#### Analyze Face Image

```python
# Analyze a face image from a file
with open("face.jpg", "rb") as image_file:
    analysis = varai.recommendations.analyze_face(
        image=image_file
    )

# Or analyze a face image from a URL
analysis = varai.recommendations.analyze_face(
    image_url="https://example.com/face.jpg"
)

print(analysis["face_shape"])
print(analysis["features"])
print(analysis["style_attributes"])
```

#### Style-Based Recommendations

```python
# Get style-based recommendations
recommendations = varai.recommendations.get_style_based(
    text_query="Modern, lightweight frames with a blue tint",
    # OR
    reference_image_url="https://example.com/reference-image.jpg",
    # OR
    style_tags=["modern", "lightweight", "blue"]
)

# Access recommendation data
for recommendation in recommendations:
    print(recommendation["frame"]["name"], recommendation["score"])
```

### Users

#### Get User Profile

```python
# Get the current user's profile
user = varai.users.get_current_user()

print(user["email"], user["first_name"], user["last_name"])
print(user["preferences"])
print(user["measurements"])
```

#### Update User Preferences

```python
# Update user preferences
updated_user = varai.users.update_preferences("u78901", {
    "styles": ["round", "cat-eye", "rectangle"],
    "materials": ["acetate", "metal"],
    "colors": ["black", "tortoise", "gold"],
    "price_range": {
        "min": 100,
        "max": 300
    }
})

print("User preferences updated:", updated_user["preferences"])
```

### Analytics

#### Get User Analytics

```python
# Get user analytics data
analytics = varai.analytics.get_users(
    time_range="7d"  # '24h', '7d', '30d', or '90d'
)

print(analytics["daily_active_users"])
```

#### Get Recommendation Analytics

```python
# Get recommendation analytics data
analytics = varai.analytics.get_recommendations(
    time_range="30d"  # '24h', '7d', '30d', or '90d'
)

print(analytics["conversion_rate"])
print(analytics["top_recommended_frames"])
```

## Examples

### Basic Example

```python
from varai import VaraiClient

# Initialize the client
varai = VaraiClient(api_key="${API_KEY_242}")

# List frames
response = varai.frames.list(limit=5)
frames = response["frames"]

# Print frame details
for frame in frames:
    print(f"Name: {frame['name']}")
    print(f"Brand: {frame['brand']}")
    print(f"Price: ${frame['price']}")
    print(f"Style: {frame['style']}")
    print(f"Material: {frame['material']}")
    print(f"Color: {frame['color']}")
    print("---")

# Generate recommendations
recommendations = varai.recommendations.generate(
    face_shape="oval",
    preferences={
        "styles": ["round"],
        "price_range": {
            "min": 50,
            "max": 200
        }
    },
    limit=3
)

# Print recommendations
print("\nRecommendations:")
for i, recommendation in enumerate(recommendations, 1):
    frame = recommendation["frame"]
    print(f"{i}. {frame['name']} - ${frame['price']}")
    print(f"   Score: {recommendation['score']}")
    print(f"   Reasoning: {recommendation['reasoning']}")
    print("")
```

### Face Analysis Example

```python
from varai import VaraiClient
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import requests
from io import BytesIO

# Initialize the client
varai = VaraiClient(api_key="${API_KEY_242}")

# URL of the image to analyze
image_url = "https://example.com/face.jpg"

# Download the image
response = requests.get(image_url)
image_data = BytesIO(response.content)

# Analyze the face
analysis = varai.recommendations.analyze_face(image=image_data)

# Display the image
img = mpimg.imread(image_data)
plt.figure(figsize=(10, 8))
plt.imshow(img)
plt.axis('off')
plt.title(f"Face Shape: {analysis['face_shape']}")

# Print analysis results
print(f"Face Shape: {analysis['face_shape']}")
print("\nFacial Features:")
for feature, value in analysis["features"].items():
    print(f"- {feature}: {value}")

print("\nStyle Attributes:")
for attr, value in analysis["style_attributes"].items():
    if attr == "style_tags":
        print(f"- Style Tags: {', '.join(value)}")
    else:
        print(f"- {attr}: {value}")

# Generate recommendations based on the analysis
recommendations = varai.recommendations.generate(
    face_shape=analysis["face_shape"],
    preferences={
        "styles": analysis["style_attributes"]["style_tags"],
        "price_range": {
            "min": 50,
            "max": 300
        }
    },
    limit=5
)

# Print recommendations
print("\nRecommended Frames:")
for i, recommendation in enumerate(recommendations, 1):
    frame = recommendation["frame"]
    print(f"{i}. {frame['name']} - ${frame['price']}")
    print(f"   Brand: {frame['brand']}")
    print(f"   Style: {frame['style']}")
    print(f"   Material: {frame['material']}")
    print(f"   Color: {frame['color']}")
    print(f"   Match Score: {recommendation['score']}")
    print("")

plt.show()
```

### Web Application Example (Flask)

```python
from flask import Flask, request, redirect, session, jsonify
import os
from varai import VaraiClient

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Initialize the VARAi client
varai = VaraiClient()

@app.route('/')
def index():
    return '''
        <h1>VARAi API Demo</h1>
        <a href="/login">Login with VARAi</a>
    '''

@app.route('/login')
def login():
    # Generate the authorization URL
    auth_url = varai.auth.get_authorization_url(
        client_id=os.environ.get("VARAI_CLIENT_ID"),
        redirect_uri="http://localhost:5000/callback",
        scope=["frames:read", "recommendations:read"],
        state=os.urandom(16).hex()
    )
    
    return redirect(auth_url)

@app.route('/callback')
def callback():
    # Exchange the authorization code for tokens
    code = request.args.get('code')
    
    tokens = varai.auth.exchange_code_for_tokens(
        client_id=os.environ.get("VARAI_CLIENT_ID"),
        client_secret=os.environ.get("VARAI_CLIENT_SECRET"),
        code=code,
        redirect_uri="http://localhost:5000/callback"
    )
    
    # Store the tokens in the session
    session['access_token'] = tokens["access_token"]
    session['refresh_token'] = tokens["refresh_token"]
    
    return redirect('/dashboard')

@app.route('/dashboard')
def dashboard():
    # Check if the user is authenticated
    if 'access_token' not in session:
        return redirect('/login')
    
    # Configure the client with the access token
    varai.set_access_token(session['access_token'])
    
    try:
        # Get the user profile
        user = varai.users.get_current_user()
        
        # Get recommendations for the user
        recommendations = varai.recommendations.generate(
            user_id=user["id"],
            limit=5
        )
        
        # Render the dashboard
        return f'''
            <h1>Welcome, {user["first_name"]}!</h1>
            <h2>Your Recommendations:</h2>
            <ul>
                {"".join([f"<li>{rec['frame']['name']} - ${rec['frame']['price']}</li>" for rec in recommendations])}
            </ul>
            <a href="/logout">Logout</a>
        '''
    except Exception as e:
        # Handle token expiration
        if 'refresh_token' in session:
            try:
                # Refresh the tokens
                new_tokens = varai.auth.refresh_tokens(
                    client_id=os.environ.get("VARAI_CLIENT_ID"),
                    client_secret=os.environ.get("VARAI_CLIENT_SECRET"),
                    refresh_token=session['refresh_token']
                )
                
                # Update the session
                session['access_token'] = new_tokens["access_token"]
                session['refresh_token'] = new_tokens["refresh_token"]
                
                return redirect('/dashboard')
            except:
                # If refresh fails, redirect to login
                return redirect('/login')
        else:
            return redirect('/login')

@app.route('/logout')
def logout():
    # Clear the session
    session.clear()
    
    return redirect('/')

@app.route('/api/frames')
def api_frames():
    # Check if the user is authenticated
    if 'access_token' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    # Configure the client with the access token
    varai.set_access_token(session['access_token'])
    
    # Get query parameters
    brand = request.args.get('brand')
    style = request.args.get('style')
    material = request.args.get('material')
    color = request.args.get('color')
    
    # List frames with filtering
    response = varai.frames.list(
        brand=brand,
        style=style,
        material=material,
        color=color,
        limit=10
    )
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
```

## Error Handling

The SDK raises standardized exceptions that you can catch and handle in your application:

```python
from varai import VaraiClient
from varai.exceptions import (
    VaraiError,
    AuthenticationError,
    PermissionError,
    ValidationError,
    NotFoundError,
    RateLimitError,
    ServerError,
    NetworkError,
    TimeoutError
)

varai = VaraiClient(api_key="${API_KEY_242}")

try:
    frame = varai.frames.get("non_existent_id")
except NotFoundError:
    print("Frame not found")
except AuthenticationError as e:
    print(f"Authentication failed: {e}")
except RateLimitError as e:
    print(f"Rate limit exceeded. Retry after: {e.retry_after} seconds")
except VaraiError as e:
    print(f"API error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### Exception Types

| Exception | Description |
|-----------|-------------|
| `AuthenticationError` | Authentication failed |
| `PermissionError` | Insufficient permissions |
| `ValidationError` | Invalid request parameters |
| `NotFoundError` | Resource not found |
| `RateLimitError` | Rate limit exceeded |
| `ServerError` | Server error |
| `NetworkError` | Network error |
| `TimeoutError` | Request timed out |
| `VaraiError` | Base exception for all VARAi errors |

## Async Support

The SDK provides async versions of all methods for use with asyncio:

```python
import asyncio
from varai import AsyncVaraiClient

async def main():
    # Initialize the async client
    varai = AsyncVaraiClient(api_key="${API_KEY_242}")
    
    # Make async requests
    frame = await varai.frames.get("f12345")
    
    recommendations = await varai.recommendations.generate(
        face_shape="oval",
        limit=5
    )
    
    # Close the client session
    await varai.close()
    
    return frame, recommendations

# Run the async function
frame, recommendations = asyncio.run(main())
```

## Logging

The SDK uses Python's standard logging module. You can configure the logger to control the verbosity of the SDK:

```python
import logging

# Configure the logger
logging.basicConfig(level=logging.INFO)

# Or configure the SDK's logger specifically
logger = logging.getLogger("varai")
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logger.addHandler(handler)

# Initialize the client
varai = VaraiClient(api_key="${API_KEY_242}")
```

The SDK logs the following information:

- `DEBUG`: Request and response details, including headers and bodies
- `INFO`: API operations and their results
- `WARNING`: Deprecated features or potential issues
- `ERROR`: API errors and exceptions