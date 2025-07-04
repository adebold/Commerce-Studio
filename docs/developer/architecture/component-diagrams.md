# VARAi Component Diagrams

This document provides detailed component diagrams for the VARAi platform, illustrating the internal structure of each major system component and how they interact.

## Frontend Applications

Each platform integration follows a similar pattern:

```mermaid
graph LR
    subgraph "Platform Integration"
        UI[UI Components]
        SDK[VARAi SDK]
        State[State Management]
        API[API Client]
    end

    UI --> SDK
    SDK --> State
    State --> API
    API --> Backend[Backend Services]
```

### Commerce Studio Architecture

```mermaid
graph TB
    subgraph "Commerce Studio"
        Dashboard[Dashboard]
        Analytics[Analytics]
        Settings[Settings]
        Integration[Integration Management]
        User[User Management]
    end

    subgraph "State Management"
        Redux[Redux Store]
        Auth[Auth State]
        Config[Config State]
        Data[Data State]
    end

    subgraph "API Layer"
        Client[API Client]
        Cache[Cache]
        Error[Error Handling]
    end

    Dashboard --> Redux
    Analytics --> Redux
    Settings --> Redux
    Integration --> Redux
    User --> Redux

    Redux --> Auth
    Redux --> Config
    Redux --> Data

    Auth --> Client
    Config --> Client
    Data --> Client

    Client --> Cache
    Client --> Error
    Client --> Backend[Backend API]
```

## Backend Services

### API Gateway

```mermaid
graph TB
    subgraph "API Gateway"
        Router[Request Router]
        Auth[Auth Middleware]
        Rate[Rate Limiter]
        Cache[Cache Layer]
        Log[Request Logger]
    end

    subgraph "Service Routing"
        User[User Service Routes]
        Product[Product Service Routes]
        ML[ML Service Routes]
        Analytics[Analytics Service Routes]
        Admin[Admin Service Routes]
    end

    Client[API Client] --> Router
    Router --> Auth
    Auth --> Rate
    Rate --> Log
    Log --> Cache

    Cache --> User
    Cache --> Product
    Cache --> ML
    Cache --> Analytics
    Cache --> Admin

    User --> UserSvc[User Service]
    Product --> ProductSvc[Product Service]
    ML --> MLSvc[ML Service]
    Analytics --> AnalyticsSvc[Analytics Service]
    Admin --> AdminSvc[Admin Service]
```

### Authentication Service

```mermaid
graph TB
    subgraph "Authentication Service"
        Login[Login Handler]
        Register[Registration Handler]
        Token[Token Manager]
        RBAC[Role-Based Access Control]
        SSO[SSO Integration]
    end

    subgraph "Data Layer"
        UserRepo[User Repository]
        TenantRepo[Tenant Repository]
        RoleRepo[Role Repository]
        TokenRepo[Token Repository]
    end

    Login --> Token
    Register --> UserRepo
    Token --> TokenRepo
    RBAC --> RoleRepo
    RBAC --> TenantRepo
    SSO --> Token

    UserRepo --> DB[(Database)]
    TenantRepo --> DB
    RoleRepo --> DB
    TokenRepo --> DB
```

### ML Service

```mermaid
graph TB
    subgraph "ML Service"
        Orchestrator[ML Orchestrator]
        FaceDetection[Face Detection]
        FrameRendering[Frame Rendering]
        StyleMatching[Style Matching]
        ModelServing[Model Serving]
    end

    subgraph "Data Processing"
        ImageProcessor[Image Processor]
        FeatureExtractor[Feature Extractor]
        DataPipeline[Data Pipeline]
    end

    subgraph "Storage"
        ModelRepo[Model Repository]
        ImageCache[Image Cache]
        FeatureStore[Feature Store]
    end

    Orchestrator --> FaceDetection
    Orchestrator --> FrameRendering
    Orchestrator --> StyleMatching
    Orchestrator --> ModelServing

    FaceDetection --> ImageProcessor
    FrameRendering --> ImageProcessor
    StyleMatching --> FeatureExtractor
    ModelServing --> DataPipeline

    ImageProcessor --> ImageCache
    FeatureExtractor --> FeatureStore
    DataPipeline --> ModelRepo

    ModelRepo --> DB[(Database)]
    ImageCache --> ObjectStorage[(Object Storage)]
    FeatureStore --> DB
```

### Recommendation Service

```mermaid
graph TB
    subgraph "Recommendation Service"
        Engine[Recommendation Engine]
        ContentBased[Content-Based Filtering]
        Collaborative[Collaborative Filtering]
        Hybrid[Hybrid Recommendations]
        Trending[Trending Items]
    end

    subgraph "Data Sources"
        UserPreferences[User Preferences]
        ProductCatalog[Product Catalog]
        UserBehavior[User Behavior]
        StyleData[Style Data]
    end

    Engine --> ContentBased
    Engine --> Collaborative
    Engine --> Hybrid
    Engine --> Trending

    ContentBased --> ProductCatalog
    ContentBased --> StyleData
    Collaborative --> UserBehavior
    Hybrid --> UserPreferences
    Hybrid --> ProductCatalog
    Trending --> UserBehavior

    UserPreferences --> DB[(Database)]
    ProductCatalog --> DB
    UserBehavior --> DB
    StyleData --> DB
```

### Analytics Service

```mermaid
graph TB
    subgraph "Analytics Service"
        Collector[Event Collector]
        Processor[Data Processor]
        Reporter[Report Generator]
        RealTime[Real-Time Analytics]
    end

    subgraph "Data Pipeline"
        Queue[Message Queue]
        Stream[Stream Processing]
        Batch[Batch Processing]
        ETL[ETL Jobs]
    end

    subgraph "Storage"
        Raw[Raw Data]
        Processed[Processed Data]
        Warehouse[Data Warehouse]
    end

    Collector --> Queue
    Queue --> Stream
    Queue --> Batch
    Stream --> RealTime
    Batch --> ETL
    ETL --> Warehouse
    RealTime --> Reporter
    Warehouse --> Reporter

    Raw --> DB[(Database)]
    Processed --> DB
    Warehouse --> DB
```

## Integration Services

### E-commerce Platform Adapters

```mermaid
graph TB
    subgraph "Platform Adapter"
        API[Platform API Client]
        Webhook[Webhook Handler]
        Auth[Auth Manager]
        Sync[Data Synchronization]
    end

    subgraph "Data Mapping"
        Product[Product Mapper]
        Order[Order Mapper]
        Customer[Customer Mapper]
    end

    subgraph "Integration Points"
        Frontend[Frontend Integration]
        Backend[Backend Integration]
        Admin[Admin Integration]
    end

    API --> Auth
    Webhook --> Sync
    Sync --> Product
    Sync --> Order
    Sync --> Customer

    Product --> Frontend
    Product --> Backend
    Order --> Backend
    Customer --> Backend
    Admin --> Backend

    Frontend --> VARApi[VARAi API]
    Backend --> VARApi
```

## Data Storage

### Database Schema

```mermaid
erDiagram
    TENANT ||--o{ USER : contains
    TENANT ||--o{ ROLE : defines
    USER }o--o{ ROLE : has
    TENANT ||--o{ PRODUCT : owns
    PRODUCT ||--o{ FRAME : contains
    USER ||--o{ RECOMMENDATION : receives
    RECOMMENDATION }o--o{ PRODUCT : includes
    USER ||--o{ ANALYTICS_EVENT : generates
    
    TENANT {
        string id
        string name
        string domain
        string plan
        date createdAt
        date updatedAt
    }
    
    USER {
        string id
        string email
        string passwordHash
        string firstName
        string lastName
        string tenantId
        date createdAt
        date updatedAt
    }
    
    ROLE {
        string id
        string name
        string description
        string tenantId
        json permissions
        date createdAt
        date updatedAt
    }
    
    PRODUCT {
        string id
        string name
        string description
        string brand
        string category
        number price
        string tenantId
        date createdAt
        date updatedAt
    }
    
    FRAME {
        string id
        string productId
        string style
        string color
        string material
        json dimensions
        string imageUrl
        string modelUrl
        date createdAt
        date updatedAt
    }
    
    RECOMMENDATION {
        string id
        string userId
        string productId
        number score
        string reason
        date createdAt
    }
    
    ANALYTICS_EVENT {
        string id
        string userId
        string tenantId
        string eventType
        json eventData
        date timestamp
    }
```

## Next Steps

For more detailed information on data flows between components, please refer to the [Data Flow Documentation](./data-flow.md).