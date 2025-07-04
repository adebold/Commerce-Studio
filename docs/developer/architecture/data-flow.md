# VARAi Data Flow Documentation

This document describes the data flows between different components of the VARAi platform, helping developers understand how data moves through the system.

## Overview

The VARAi platform processes several types of data:

1. **User Data**: Information about users, their preferences, and authentication
2. **Product Data**: Information about eyewear products, including images and metadata
3. **Analytics Data**: Usage data and metrics for reporting and optimization
4. **ML Data**: Data used for machine learning models, including face measurements and style preferences

## Key Data Flows

### User Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant APIGateway as API Gateway
    participant AuthService as Auth Service
    participant Database
    
    Client->>APIGateway: Login Request
    APIGateway->>AuthService: Forward Authentication Request
    AuthService->>Database: Validate Credentials
    Database-->>AuthService: User Data
    AuthService->>AuthService: Generate JWT Token
    AuthService-->>APIGateway: Authentication Response
    APIGateway-->>Client: JWT Token + User Info
```

### Virtual Try-On Flow

```mermaid
sequenceDiagram
    participant Client
    participant APIGateway as API Gateway
    participant MLService as ML Service
    participant Storage
    participant Analytics
    
    Client->>APIGateway: Upload User Photo
    APIGateway->>MLService: Process Photo Request
    MLService->>MLService: Detect Face
    MLService->>MLService: Extract Measurements
    MLService->>Storage: Store Measurements
    Storage-->>MLService: Confirmation
    MLService->>MLService: Render Frame on Photo
    MLService-->>APIGateway: Processed Image
    APIGateway-->>Client: Virtual Try-On Result
    APIGateway->>Analytics: Log Try-On Event
```

### Product Recommendation Flow

```mermaid
sequenceDiagram
    participant Client
    participant APIGateway as API Gateway
    participant RecService as Recommendation Service
    participant MLService as ML Service
    participant Database
    
    Client->>APIGateway: Request Recommendations
    APIGateway->>RecService: Forward Request
    RecService->>Database: Fetch User Preferences
    Database-->>RecService: User Data
    RecService->>Database: Fetch Product Catalog
    Database-->>RecService: Product Data
    RecService->>MLService: Get Style Compatibility
    MLService-->>RecService: Compatibility Scores
    RecService->>RecService: Generate Recommendations
    RecService-->>APIGateway: Recommendation Results
    APIGateway-->>Client: Personalized Recommendations
```

### E-commerce Integration Flow

```mermaid
sequenceDiagram
    participant ECommerce as E-commerce Platform
    participant Adapter as Platform Adapter
    participant APIGateway as API Gateway
    participant Database
    
    ECommerce->>Adapter: Product Update Webhook
    Adapter->>Adapter: Transform Data
    Adapter->>APIGateway: Sync Product Data
    APIGateway->>Database: Store Product Data
    Database-->>APIGateway: Confirmation
    APIGateway-->>Adapter: Sync Success
    Adapter-->>ECommerce: Webhook Response
```

### Analytics Data Flow

```mermaid
sequenceDiagram
    participant Client
    participant APIGateway as API Gateway
    participant Analytics as Analytics Service
    participant Queue as Message Queue
    participant Processor as Data Processor
    participant Warehouse as Data Warehouse
    
    Client->>APIGateway: User Interaction
    APIGateway->>Analytics: Track Event
    Analytics->>Queue: Publish Event
    Queue->>Processor: Consume Event
    Processor->>Processor: Process Data
    Processor->>Warehouse: Store Processed Data
    Warehouse-->>Processor: Confirmation
```

## Data Storage

### Database Collections

The VARAi platform uses MongoDB Atlas as its primary database, with the following main collections:

1. **tenants**: Information about organizations using the platform
2. **users**: User account information
3. **roles**: Role definitions for RBAC
4. **products**: Eyewear product information
5. **frames**: Detailed frame information
6. **recommendations**: Generated product recommendations
7. **analytics_events**: User interaction events
8. **ml_models**: Machine learning model metadata
9. **face_measurements**: User face measurement data

### Object Storage

The platform uses cloud object storage for:

1. **Product Images**: High-quality images of eyewear products
2. **User Photos**: User-uploaded photos for virtual try-on
3. **Rendered Images**: Virtual try-on results
4. **ML Model Files**: Serialized machine learning models

## Data Transformation

### Product Data Transformation

When integrating with e-commerce platforms, product data undergoes the following transformation:

```
E-commerce Platform Product
↓
Platform Adapter Transformation
↓
VARAi Product Schema
↓
Database Storage
```

### Analytics Data Transformation

User interaction events go through the following transformation pipeline:

```
Raw Event
↓
Event Validation
↓
Event Enrichment (user, tenant, timestamp)
↓
Event Storage (raw)
↓
Batch Processing
↓
Aggregation
↓
Data Warehouse Storage
```

## Data Security

All data flows in the VARAi platform adhere to the following security principles:

1. **Authentication**: All API requests require proper authentication
2. **Authorization**: Access to data is controlled by role-based permissions
3. **Encryption**: Sensitive data is encrypted in transit and at rest
4. **Data Isolation**: Multi-tenant data is strictly isolated
5. **Audit Logging**: All data access and modifications are logged

## Next Steps

For more detailed information on the technology stack used for data processing, please refer to the [Technology Stack Documentation](./technology-stack.md).