# Personalized Recommendations Flow Diagram

This diagram illustrates how the personalized recommendations system integrates with the overall platform.

## System Architecture

```mermaid
graph TD
    subgraph "Frontend"
        UI[User Interface]
        Cart[Shopping Cart]
        PDP[Product Detail Page]
    end
    
    subgraph "API Layer"
        API[API Gateway]
        Auth[Authentication Service]
        RecAPI[Recommendations API]
        CatAPI[Catalog API]
    end
    
    subgraph "Data Sources"
        UserDB[(User Database)]
        ProductDB[(Product Catalog)]
        BehaviorDB[(Behavior Data)]
    end
    
    subgraph "ML Services"
        DeepSeek[DeepSeek Service]
        EmbeddingGen[Embedding Generator]
        Ranking[Ranking Engine]
    end
    
    UI -->|Browse Products| PDP
    PDP -->|View Product| RecAPI
    PDP -->|Add to Cart| Cart
    Cart -->|Purchase| RecAPI
    
    UI -->|Request Personalized Recs| API
    API -->|Auth Request| Auth
    Auth -->|Validate Token| API
    API -->|Get Recommendations| RecAPI
    
    RecAPI -->|Get Customer Data| UserDB
    RecAPI -->|Get Product Data| ProductDB
    RecAPI -->|Record Signals| BehaviorDB
    BehaviorDB -->|Training Data| DeepSeek
    
    RecAPI -->|Generate Embeddings| DeepSeek
    DeepSeek -->|Product Embeddings| EmbeddingGen
    DeepSeek -->|User Preference Embeddings| EmbeddingGen
    EmbeddingGen -->|Vectors| Ranking
    Ranking -->|Scored Products| RecAPI
    
    RecAPI -->|Product Info| CatAPI
    CatAPI -->|Catalog Data| ProductDB
    
    RecAPI -->|Recommendations| API
    API -->|Display Results| UI
```

## Data Flow for Personalized Recommendations

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Gateway
    participant Recommendations API
    participant User DB
    participant Product Catalog
    participant DeepSeek ML
    
    User->>Frontend: View personalized recommendations
    Frontend->>API Gateway: POST /api/recommendations/personalized
    API Gateway->>Recommendations API: Forward request
    
    Recommendations API->>User DB: Fetch customer data
    User DB-->>Recommendations API: Return purchase history, preferences
    
    Recommendations API->>Product Catalog: Fetch product data
    Product Catalog-->>Recommendations API: Return product details
    
    Recommendations API->>DeepSeek ML: Generate product embeddings
    DeepSeek ML-->>Recommendations API: Return embeddings
    
    Recommendations API->>DeepSeek ML: Generate user preference embedding
    DeepSeek ML-->>Recommendations API: Return user embedding
    
    Recommendations API->>DeepSeek ML: Rank products
    DeepSeek ML-->>Recommendations API: Return ranked products
    
    Recommendations API->>Recommendations API: Apply filters (prescription, measurements)
    
    Recommendations API-->>API Gateway: Return personalized recommendations
    API Gateway-->>Frontend: Return response
    Frontend-->>User: Display recommendations
```

## Reinforcement Learning Signal Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Gateway
    participant Recommendations API
    participant Behavior DB
    participant ML Training Pipeline
    
    User->>Frontend: View product
    Frontend->>API Gateway: POST /api/recommendations/signals
    Note over Frontend,API Gateway: action_type: "view"
    API Gateway->>Recommendations API: Forward request
    Recommendations API->>Behavior DB: Store interaction signal
    Behavior DB-->>Recommendations API: Confirm storage
    Recommendations API-->>API Gateway: Return success response
    API Gateway-->>Frontend: Return response
    
    User->>Frontend: Add to cart
    Frontend->>API Gateway: POST /api/recommendations/signals
    Note over Frontend,API Gateway: action_type: "add_to_cart"
    API Gateway->>Recommendations API: Forward request
    Recommendations API->>Behavior DB: Store interaction signal
    Behavior DB-->>Recommendations API: Confirm storage
    Recommendations API-->>API Gateway: Return success response
    API Gateway-->>Frontend: Return response
    
    User->>Frontend: Purchase product
    Frontend->>API Gateway: POST /api/recommendations/signals
    Note over Frontend,API Gateway: action_type: "purchase"
    API Gateway->>Recommendations API: Forward request
    Recommendations API->>Behavior DB: Store interaction signal
    Behavior DB-->>Recommendations API: Confirm storage
    Recommendations API-->>API Gateway: Return success response
    API Gateway-->>Frontend: Return response
    
    Behavior DB->>ML Training Pipeline: Export interaction data
    ML Training Pipeline->>DeepSeek ML: Update model weights
    Note over ML Training Pipeline,DeepSeek ML: Regular retraining schedule