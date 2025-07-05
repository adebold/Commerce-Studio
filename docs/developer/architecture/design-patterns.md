# VARAi Design Patterns Documentation

This document outlines the key design patterns used throughout the VARAi platform. Understanding these patterns will help developers maintain consistency when extending or modifying the codebase.

## Overview

The VARAi platform employs a variety of design patterns to address common software design challenges. These patterns are categorized as:

1. Architectural Patterns
2. Creational Patterns
3. Structural Patterns
4. Behavioral Patterns
5. Concurrency Patterns
6. Frontend Patterns
7. Data Access Patterns

## Architectural Patterns

### Microservices Architecture

The VARAi platform is built on a microservices architecture, with each service responsible for a specific domain of functionality.

**Implementation:**
- Services are deployed as independent containers
- Each service has its own database or database schema
- Services communicate via well-defined APIs
- Service boundaries align with business domains

**Example:**
```python
# auth_service/app.py
from fastapi import FastAPI, Depends
from .routers import auth, users, roles

app = FastAPI(title="VARAi Auth Service")

app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(roles.router, prefix="/roles", tags=["roles"])
```

### API Gateway Pattern

The platform uses an API Gateway as the single entry point for all client requests, which then routes to the appropriate microservice.

**Implementation:**
- Centralized authentication and authorization
- Request routing based on path or content
- Response caching for improved performance
- Rate limiting and throttling

**Example:**
```typescript
// api-gateway/src/routes.ts
import { Router } from 'express';
import { authMiddleware } from './middleware/auth';
import { rateLimit } from './middleware/rate-limit';

const router = Router();

router.use('/auth', rateLimit({ max: 10 }), authServiceProxy);
router.use('/products', authMiddleware, productServiceProxy);
router.use('/recommendations', authMiddleware, recommendationServiceProxy);
router.use('/analytics', authMiddleware, analyticsServiceProxy);

export default router;
```

### Event-Driven Architecture

For asynchronous operations, the platform uses an event-driven architecture with message queues.

**Implementation:**
- Publishers emit events without knowledge of consumers
- Consumers subscribe to relevant event types
- Message broker (RabbitMQ) handles reliable delivery
- Events are persisted for replay and audit

**Example:**
```python
# analytics_service/events/publisher.py
from aio_pika import connect, Message, DeliveryMode

async def publish_event(event_type, event_data):
    connection = await connect("amqp://guest:guest@rabbitmq/")
    channel = await connection.channel()
    
    exchange = await channel.declare_exchange(
        "varai_events", type="topic", durable=True
    )
    
    message = Message(
        body=json.dumps(event_data).encode(),
        delivery_mode=DeliveryMode.PERSISTENT,
        content_type="application/json",
        headers={"event_type": event_type}
    )
    
    await exchange.publish(message, routing_key=event_type)
    await connection.close()
```

### CQRS (Command Query Responsibility Segregation)

The platform separates read and write operations for complex domains like analytics and recommendations.

**Implementation:**
- Commands modify state and return minimal response
- Queries retrieve data without side effects
- Different models for read and write operations
- Event sourcing for state changes

**Example:**
```typescript
// recommendation_service/src/commands/create-recommendation.ts
export class CreateRecommendationCommand {
  constructor(
    public readonly userId: string,
    public readonly productIds: string[],
    public readonly reason: string
  ) {}
}

export class CreateRecommendationHandler {
  async execute(command: CreateRecommendationCommand): Promise<string> {
    const recommendation = new Recommendation({
      userId: command.userId,
      productIds: command.productIds,
      reason: command.reason,
      createdAt: new Date()
    });
    
    await this.recommendationRepository.save(recommendation);
    await this.eventBus.publish(new RecommendationCreatedEvent(recommendation));
    
    return recommendation.id;
  }
}
```

## Creational Patterns

### Factory Method

Used to create objects without specifying the exact class of object to be created.

**Implementation:**
- Abstract factory interfaces define object creation methods
- Concrete factories implement these interfaces
- Clients use the factory to create objects

**Example:**
```python
# ml_service/factories/model_factory.py
from abc import ABC, abstractmethod
from ..models import FaceDetectionModel, FrameRenderingModel, RecommendationModel

class ModelFactory(ABC):
    @abstractmethod
    def create_model(self):
        pass

class FaceDetectionModelFactory(ModelFactory):
    def create_model(self):
        return FaceDetectionModel()

class FrameRenderingModelFactory(ModelFactory):
    def create_model(self):
        return FrameRenderingModel()

class RecommendationModelFactory(ModelFactory):
    def create_model(self):
        return RecommendationModel()
```

### Dependency Injection

Used throughout the platform to provide dependencies to components without hard-coding them.

**Implementation:**
- Dependencies are declared in constructor or method parameters
- DI container resolves and provides dependencies
- Facilitates testing through mock dependencies

**Example:**
```typescript
// auth_service/src/services/user-service.ts
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly eventPublisher: EventPublisher
  ) {}
  
  async createUser(userData: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordHasher.hash(userData.password);
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    
    await this.userRepository.save(user);
    await this.eventPublisher.publish('user.created', user);
    
    return user;
  }
}
```

## Structural Patterns

### Adapter Pattern

Used to make incompatible interfaces work together, particularly in e-commerce platform integrations.

**Implementation:**
- Adapters convert external platform data to VARAi format
- Each e-commerce platform has its own adapter
- Common interface for all adapters

**Example:**
```typescript
// integrations/platforms/shopify/shopify-adapter.ts
import { PlatformAdapter } from '../../types/platform-adapter';

export class ShopifyAdapter implements PlatformAdapter {
  async getProducts(): Promise<Product[]> {
    const shopifyProducts = await this.shopifyClient.products.list();
    
    return shopifyProducts.map(shopifyProduct => ({
      id: shopifyProduct.id,
      name: shopifyProduct.title,
      description: shopifyProduct.body_html,
      price: parseFloat(shopifyProduct.variants[0].price),
      images: shopifyProduct.images.map(image => image.src),
      metadata: {
        vendor: shopifyProduct.vendor,
        productType: shopifyProduct.product_type,
        tags: shopifyProduct.tags
      }
    }));
  }
  
  // Other adapter methods...
}
```

### Decorator Pattern

Used to add functionality to objects dynamically, particularly for cross-cutting concerns.

**Implementation:**
- Decorators wrap objects with additional functionality
- Multiple decorators can be stacked
- Original interface is preserved

**Example:**
```python
# api/middleware/decorators.py
from functools import wraps
from fastapi import Depends, HTTPException
from ..auth import get_current_user

def require_permission(permission: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, user=Depends(get_current_user), **kwargs):
            if not user.has_permission(permission):
                raise HTTPException(status_code=403, detail="Permission denied")
            return await func(*args, user=user, **kwargs)
        return wrapper
    return decorator
```

### Proxy Pattern

Used for controlling access to objects, particularly for caching and authorization.

**Implementation:**
- Proxy implements same interface as the real object
- Proxy controls access to the real object
- Can add caching, logging, or access control

**Example:**
```typescript
// api_gateway/src/proxies/service-proxy.ts
export class CachedServiceProxy implements ServiceProxy {
  constructor(
    private readonly realServiceProxy: ServiceProxy,
    private readonly cache: Cache
  ) {}
  
  async request(path: string, method: string, data?: any): Promise<any> {
    const cacheKey = `${method}:${path}:${JSON.stringify(data || {})}`;
    
    // Try to get from cache for GET requests
    if (method === 'GET') {
      const cachedResult = await this.cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
    }
    
    // Forward to real service
    const result = await this.realServiceProxy.request(path, method, data);
    
    // Cache the result for GET requests
    if (method === 'GET') {
      await this.cache.set(cacheKey, result, 60); // Cache for 60 seconds
    }
    
    return result;
  }
}
```

## Behavioral Patterns

### Observer Pattern

Used for event handling and notifications throughout the platform.

**Implementation:**
- Subjects maintain a list of observers
- Observers are notified when subject state changes
- Implemented via event emitters or message queues

**Example:**
```typescript
// frontend/src/services/analytics.ts
import { EventEmitter } from 'events';

export class AnalyticsService {
  private eventEmitter = new EventEmitter();
  
  trackEvent(eventName: string, eventData: any): void {
    // Track the event
    this.apiClient.post('/analytics/events', {
      name: eventName,
      data: eventData,
      timestamp: new Date().toISOString()
    });
    
    // Notify observers
    this.eventEmitter.emit(eventName, eventData);
  }
  
  onEvent(eventName: string, callback: (eventData: any) => void): void {
    this.eventEmitter.on(eventName, callback);
  }
  
  offEvent(eventName: string, callback: (eventData: any) => void): void {
    this.eventEmitter.off(eventName, callback);
  }
}
```

### Strategy Pattern

Used to define a family of algorithms and make them interchangeable.

**Implementation:**
- Strategy interface defines algorithm contract
- Concrete strategies implement the interface
- Context uses the strategy through composition

**Example:**
```python
# recommendation_service/strategies/recommendation_strategy.py
from abc import ABC, abstractmethod

class RecommendationStrategy(ABC):
    @abstractmethod
    def recommend(self, user_id, limit=10):
        pass

class ContentBasedStrategy(RecommendationStrategy):
    def recommend(self, user_id, limit=10):
        # Content-based recommendation logic
        pass

class CollaborativeFilteringStrategy(RecommendationStrategy):
    def recommend(self, user_id, limit=10):
        # Collaborative filtering logic
        pass

class HybridStrategy(RecommendationStrategy):
    def recommend(self, user_id, limit=10):
        # Hybrid recommendation logic
        pass

class RecommendationService:
    def __init__(self, strategy: RecommendationStrategy):
        self.strategy = strategy
    
    def set_strategy(self, strategy: RecommendationStrategy):
        self.strategy = strategy
    
    def get_recommendations(self, user_id, limit=10):
        return self.strategy.recommend(user_id, limit)
```

### Chain of Responsibility

Used for processing requests through a chain of handlers.

**Implementation:**
- Each handler decides to process or pass to next
- Handlers are linked in a chain
- Request flows through the chain until handled

**Example:**
```typescript
// auth_service/src/middleware/auth-chain.ts
abstract class AuthHandler {
  private nextHandler: AuthHandler | null = null;
  
  setNext(handler: AuthHandler): AuthHandler {
    this.nextHandler = handler;
    return handler;
  }
  
  async handle(request: Request): Promise<User | null> {
    const user = await this.authenticate(request);
    if (user || !this.nextHandler) {
      return user;
    }
    return this.nextHandler.handle(request);
  }
  
  protected abstract authenticate(request: Request): Promise<User | null>;
}

class JwtAuthHandler extends AuthHandler {
  protected async authenticate(request: Request): Promise<User | null> {
    // JWT authentication logic
  }
}

class ApiKeyAuthHandler extends AuthHandler {
  protected async authenticate(request: Request): Promise<User | null> {
    // API key authentication logic
  }
}

class SessionAuthHandler extends AuthHandler {
  protected async authenticate(request: Request): Promise<User | null> {
    // Session authentication logic
  }
}
```

## Concurrency Patterns

### Worker Pool Pattern

Used for distributing tasks across multiple workers, particularly for ML processing.

**Implementation:**
- Fixed pool of worker processes or threads
- Task queue for pending work
- Workers process tasks concurrently
- Results collected and aggregated

**Example:**
```python
# ml_service/worker_pool.py
import asyncio
from concurrent.futures import ProcessPoolExecutor

class WorkerPool:
    def __init__(self, max_workers=None):
        self.executor = ProcessPoolExecutor(max_workers=max_workers)
        self.loop = asyncio.get_event_loop()
        self.tasks = []
    
    async def submit(self, fn, *args, **kwargs):
        return await self.loop.run_in_executor(
            self.executor, 
            lambda: fn(*args, **kwargs)
        )
    
    async def map(self, fn, items):
        tasks = [self.submit(fn, item) for item in items]
        return await asyncio.gather(*tasks)
    
    def shutdown(self):
        self.executor.shutdown()
```

### Circuit Breaker Pattern

Used to prevent cascading failures when calling external services.

**Implementation:**
- Monitors for failures in external service calls
- Opens circuit after threshold of failures
- Periodically allows test requests to check recovery
- Automatically resets after successful test

**Example:**
```typescript
// api_gateway/src/circuit-breaker.ts
enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeout: number = 30000 // 30 seconds
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      // Check if it's time to try again
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit is open');
      }
    }
    
    try {
      const result = await fn();
      
      // Reset on success if half-open
      if (this.state === CircuitState.HALF_OPEN) {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
  
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold || 
        this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
    }
  }
  
  private reset(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }
}
```

## Frontend Patterns

### Container/Presentational Pattern

Used to separate data fetching from presentation in React components.

**Implementation:**
- Container components handle data and state
- Presentational components focus on UI rendering
- Presentational components receive props from containers
- Enhances reusability and testability

**Example:**
```tsx
// frontend/src/components/recommendations/RecommendationContainer.tsx
import React, { useEffect, useState } from 'react';
import { useRecommendationService } from '../../hooks/useRecommendationService';
import { RecommendationList } from './RecommendationList';

export const RecommendationContainer: React.FC<{ userId: string }> = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const recommendationService = useRecommendationService();
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await recommendationService.getRecommendations(userId);
        setRecommendations(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [userId, recommendationService]);
  
  return (
    <RecommendationList 
      recommendations={recommendations}
      loading={loading}
      error={error}
    />
  );
};

// frontend/src/components/recommendations/RecommendationList.tsx
import React from 'react';
import { RecommendationCard } from './RecommendationCard';

interface Props {
  recommendations: Recommendation[];
  loading: boolean;
  error: Error | null;
}

export const RecommendationList: React.FC<Props> = ({ 
  recommendations, 
  loading, 
  error 
}) => {
  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="recommendation-list">
      {recommendations.map(recommendation => (
        <RecommendationCard 
          key={recommendation.id}
          recommendation={recommendation}
        />
      ))}
    </div>
  );
};
```

### Hooks Pattern

Used extensively in React components to encapsulate and reuse stateful logic.

**Implementation:**
- Custom hooks extract and share component logic
- Hooks follow React's rules (only call at top level)
- Prefixed with "use" to indicate they're hooks

**Example:**
```tsx
// frontend/src/hooks/useAuth.tsx
import { useState, useEffect, useContext, createContext } from 'react';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const authService = new AuthService();
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const user = await authService.login(email, password);
      setUser(user);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Data Access Patterns

### Repository Pattern

Used to abstract data access logic from business logic.

**Implementation:**
- Repository interfaces define data access methods
- Concrete repositories implement these interfaces
- Business logic depends on repository interfaces
- Facilitates testing and switching data sources

**Example:**
```typescript
// auth_service/src/repositories/user-repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export class MongoUserRepository implements UserRepository {
  constructor(private readonly db: Db) {}
  
  async findById(id: string): Promise<User | null> {
    const userData = await this.db.collection('users').findOne({ _id: new ObjectId(id) });
    return userData ? new User(userData) : null;
  }
  
  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.db.collection('users').findOne({ email });
    return userData ? new User(userData) : null;
  }
  
  async save(user: User): Promise<User> {
    const result = await this.db.collection('users').insertOne(user);
    return { ...user, _id: result.insertedId };
  }
  
  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: userData }
    );
    return this.findById(id) as Promise<User>;
  }
  
  async delete(id: string): Promise<void> {
    await this.db.collection('users').deleteOne({ _id: new ObjectId(id) });
  }
}
```

### Unit of Work Pattern

Used to maintain consistency when working with multiple repositories.

**Implementation:**
- Unit of Work coordinates multiple repositories
- Ensures all operations succeed or fail together
- Manages transactions and concurrency

**Example:**
```python
# product_service/repositories/unit_of_work.py
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient

class UnitOfWork:
    def __init__(self, db_client: AsyncIOMotorClient):
        self.db_client = db_client
        self.product_repository = None
        self.category_repository = None
        self.brand_repository = None
    
    @asynccontextmanager
    async def start_transaction(self):
        session = await self.db_client.start_session()
        
        try:
            async with session.start_transaction():
                # Create repositories with session
                self.product_repository = ProductRepository(self.db_client, session)
                self.category_repository = CategoryRepository(self.db_client, session)
                self.brand_repository = BrandRepository(self.db_client, session)
                
                yield self
                # Transaction is committed if no exceptions occur
        finally:
            await session.end_session()
```

## Next Steps

For more detailed information on architecture decisions, please refer to the [Architecture Decision Records](./adr/index.md).