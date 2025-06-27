"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
import sys
import traceback
import redis.asyncio as redis

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Helper function to log imports
def log_import(module_name, from_module=None):
    """Log import attempts to help debug import errors."""
    try:
        if from_module:
            logger.info(f"Attempting to import '{module_name}' from '{from_module}'")
            module = __import__(from_module, fromlist=[module_name])
            imported = getattr(module, module_name)
            logger.info(f"Successfully imported '{module_name}' from '{from_module}'")
            return imported
        else:
            logger.info(f"Attempting to import module '{module_name}'")
            imported = __import__(module_name, fromlist=['*'])
            logger.info(f"Successfully imported module '{module_name}'")
            return imported
    except ImportError as e:
        logger.error(f"ImportError when importing {module_name}: {str(e)}")
        logger.error(f"Import path: {sys.path}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise
    except AttributeError as e:
        logger.error(f"AttributeError when importing {module_name}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error when importing {module_name}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise

app = FastAPI(
    title="EyewearML API",
    description="API for eyewear recommendations and virtual try-on",
    version="1.0.0"
)

# Add CORS middleware
# Configure CORS with debug logging
logger.info("Configuring CORS middleware")
origins = [
    "http://localhost:5173",  # Frontend dev server
    "http://127.0.0.1:5173",
    "http://localhost:5174",  # Alternative frontend port
    "http://127.0.0.1:5174",
    "*",  # Allow all origins in staging for testing
]
logger.info(f"Allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Range", "X-Total-Count"],
    max_age=600,
)
logger.info("CORS middleware configured")

# Add rate limiting middleware
try:
    logger.info("Configuring rate limiting middleware")
    from src.api.middleware.rate_limiting import create_rate_limit_middleware
    
    # Create rate limiting middleware with fallback policy
    rate_limit_middleware = create_rate_limit_middleware(fallback_policy="allow")
    app.middleware("http")(rate_limit_middleware)
    logger.info("Rate limiting middleware configured")
except ImportError as e:
    logger.warning(f"Failed to import rate limiting middleware: {e}")
except Exception as e:
    logger.warning(f"Failed to configure rate limiting middleware: {e}")

# Add JWT authentication middleware
try:
    logger.info("Configuring JWT authentication middleware")
    from src.api.middleware.jwt_auth import JWTAuthMiddleware
    from src.auth import (
        AuthManager,
        TokenValidator,
        ApiKeyManager,
        RBACManager,
        TenantManager,
        BackwardCompatibilityManager
    )
    from src.api.dependencies.auth import init_auth_deps
    
    # Initialize auth managers immediately
    try:
        from src.core.config import get_settings
        settings = get_settings()
        secret_key = getattr(settings, 'JWT_SECRET_KEY', 'your-secret-key-change-in-production')
        
        # Initialize managers
        tenant_manager = TenantManager()
        auth_manager = AuthManager(secret_key=secret_key, tenant_manager=tenant_manager)
        token_validator = TokenValidator(secret_key=secret_key)
        api_key_manager = ApiKeyManager()
        rbac_manager = RBACManager()
        
        # Add JWT middleware immediately
        app.add_middleware(
            JWTAuthMiddleware,
            auth_manager=auth_manager,
            token_validator=token_validator,
            api_key_manager=api_key_manager,
            rbac_manager=rbac_manager,
            excluded_paths=[
                "/health",
                "/",
                "/docs",
                "/openapi.json",
                "/redoc",
                "/favicon.ico"
            ]
        )
        
        app.state.jwt_auth_middleware_configured = True
        app.state.auth_imports_successful = True
        logger.info("JWT authentication middleware configured successfully")
        
    except Exception as e:
        logger.warning(f"Failed to initialize auth managers: {e}")
        app.state.jwt_auth_middleware_configured = False
        app.state.auth_imports_successful = False
        
except ImportError as e:
    logger.warning(f"Failed to import JWT authentication middleware: {e}")
    logger.warning(f"Traceback: {traceback.format_exc()}")
    app.state.auth_imports_successful = False
    app.state.jwt_auth_middleware_configured = False
except Exception as e:
    logger.warning(f"Failed to configure JWT authentication middleware: {e}")
    logger.warning(f"Traceback: {traceback.format_exc()}")
    app.state.auth_imports_successful = False
    app.state.jwt_auth_middleware_configured = False

# Import and include health router first (critical for Cloud Run)
try:
    logger.info("Attempting to import health routers")
    # Log detailed import information
    from src.api.routers.health import router as health_router, root_router
    app.include_router(health_router)
    app.include_router(root_router)  # Include the root router for Cloud Run health checks
    logger.info("Successfully included health routers")
    app.state.health_router_included = True
except ImportError as e:
    logger.error(f"ImportError when including health router: {str(e)}")
    logger.error(f"Import path: {sys.path}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    app.state.health_router_included = False
    # Don't raise exception here to allow the app to start
except Exception as e:
    logger.error(f"Failed to include health router: {str(e)}", exc_info=True)
    app.state.health_router_included = False
    # Don't raise exception here to allow the app to start

# Add fallback health endpoints if the main health router failed to load
if not getattr(app.state, 'health_router_included', False):
    logger.warning("Adding fallback health endpoints")
    
    @app.get("/")
    async def fallback_root():
        """Fallback root endpoint for Cloud Run health checks."""
        return {"status": "healthy", "message": "EyewearML API is running"}
    
    @app.get("/health")
    async def fallback_health():
        """Fallback health endpoint."""
        return {
            "status": "healthy",
            "timestamp": "2025-06-12T11:09:00Z",
            "version": "1.0.0",
            "message": "Basic health check - some features may be limited"
        }
    
    logger.info("Fallback health endpoints added")

# Try to include other routers but don't fail if they're not available
try:
    # Import routers with error handling for each
    try:
        logger.info("Attempting to import scraping router")
        from src.api.routers import scraping
        app.include_router(scraping)
        logger.info("Successfully included scraping router")
    except ImportError as e:
        logger.warning(f"ImportError when including scraping router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include scraping router: {str(e)}")
    
    try:
        logger.info("Attempting to import analytics router")
        from src.api.routers import analytics
        app.include_router(analytics)
        logger.info("Successfully included analytics router")
    except ImportError as e:
        logger.warning(f"ImportError when including analytics router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include analytics router: {str(e)}")
    
    # Add core business logic routers - import directly to avoid __init__.py issues
    try:
        logger.info("Attempting to import frames router")
        from src.api.routers.frames import router as frames_router
        app.include_router(frames_router, prefix="/api/v1", tags=["frames"])
        logger.info("Successfully included frames router")
    except ImportError as e:
        logger.warning(f"ImportError when including frames router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include frames router: {str(e)}")
    
    try:
        logger.info("Attempting to import recommendations router")
        from src.api.routers.recommendations_simple import router as recommendations_router
        app.include_router(recommendations_router, prefix="/api/v1", tags=["recommendations"])
        logger.info("Successfully included recommendations router")
    except ImportError as e:
        logger.warning(f"ImportError when including recommendations router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include recommendations router: {str(e)}")
    
    try:
        logger.info("Attempting to import virtual try-on router")
        from src.api.routers.virtual_try_on import router as virtual_try_on_router
        app.include_router(virtual_try_on_router, prefix="/api/v1", tags=["virtual-try-on"])
        logger.info("Successfully included virtual try-on router")
    except ImportError as e:
        logger.warning(f"ImportError when including virtual try-on router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include virtual try-on router: {str(e)}")
    
    try:
        logger.info("Attempting to import monitoring router")
        from src.api.routers import monitoring
        app.include_router(monitoring)
        logger.info("Successfully included monitoring router")
    except ImportError as e:
        logger.warning(f"ImportError when including monitoring router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include monitoring router: {str(e)}")
    
    try:
        logger.info("Attempting to import developer router")
        from src.api.routers import developer
        app.include_router(developer)
        logger.info("Successfully included developer router")
    except ImportError as e:
        logger.warning(f"ImportError when including developer router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include developer router: {str(e)}")
    
    try:
        logger.info("Attempting to import contact_lens_try_on router")
        from src.api.routers import contact_lens_try_on
        app.include_router(contact_lens_try_on)
        logger.info("Successfully included contact lens try-on router")
    except ImportError as e:
        logger.warning(f"ImportError when including contact_lens_try_on router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include contact lens try-on router: {str(e)}")
    
    try:
        logger.info("Attempting to import auth_example router")
        from src.api.routers.auth_example import router as auth_example_router
        app.include_router(auth_example_router)
        logger.info("Successfully included auth example router")
    except ImportError as e:
        logger.warning(f"ImportError when including auth_example router: {str(e)}")
        logger.warning(f"Traceback: {traceback.format_exc()}")
    except Exception as e:
        logger.warning(f"Failed to include auth example router: {str(e)}")
except Exception as e:
    logger.error(f"Error including routers: {str(e)}", exc_info=True)

# Include service discovery router
try:
    logger.info("Attempting to import service discovery router")
    from src.api.routers.service_discovery import router as service_discovery_router
    app.include_router(service_discovery_router)
    logger.info("Successfully included service discovery router")
except ImportError as e:
    logger.warning(f"ImportError when including service discovery router: {str(e)}")
    logger.warning(f"Traceback: {traceback.format_exc()}")
except Exception as e:
    logger.warning(f"Failed to include service discovery router: {str(e)}")

# MongoDB router
try:
    logger.info("Attempting to import MongoDB router")
    from src.api.routers.mongodb import router as mongodb_router
    app.include_router(mongodb_router)
    logger.info("Successfully included MongoDB router")

    # Admin Portal Router
    logger.info("Attempting to import admin router")
    from src.api.routers.admin import router as admin_router
    app.include_router(admin_router, prefix="/api/v1", tags=["admin"])
    logger.info("Successfully included admin router")
except ImportError as e:
    logger.warning(f"ImportError when including MongoDB router: {str(e)}")
    logger.warning(f"Traceback: {traceback.format_exc()}")
except Exception as e:
    logger.warning(f"Failed to include MongoDB router: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("Starting EyewearML API")
    try:
        # Import settings within the startup event to ensure environment variables are loaded
        logger.info("Loading application settings")
        from src.api.core.config import settings
        logger.info("Application settings loaded successfully")

        # Initialize Prisma client if enabled
        if settings.USE_PRISMA:
            try:
                logger.info("Initializing Prisma client...")
                from src.api.database.prisma_client import get_prisma_client
                prisma_client = await get_prisma_client()
                logger.info("Prisma client initialized successfully")
            except ImportError as e:
                logger.warning(f"ImportError when initializing Prisma client: {str(e)}")
                logger.warning(f"Traceback: {traceback.format_exc()}")
            except Exception as e:
                logger.warning(f"Failed to initialize Prisma client: {str(e)}")

        # Initialize Redis for rate limiting
        try:
            logger.info("Initializing Redis client for rate limiting...")
            redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            await redis_client.ping()
            app.state.redis = redis_client
            logger.info("Redis client initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize Redis client: {e}")
            logger.warning("Rate limiting will use fallback policy")
            app.state.redis = None

        # Initialize MongoDB
        try:
            logger.info("Initializing MongoDB connection...")
            from src.api.database.mongodb_client import get_mongodb_manager
            mongodb_manager = await get_mongodb_manager()
            app.state.mongodb_manager = mongodb_manager
            logger.info("MongoDB connection initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize MongoDB connection: {e}")
            logger.warning("MongoDB-dependent features will be disabled")
            app.state.mongodb_manager = None

        # Initialize Service Discovery
        try:
            logger.info("Initializing Service Discovery...")
            from src.api.services.service_discovery import init_service_discovery
            
            # Use Redis client for service discovery if available
            redis_for_discovery = app.state.redis if hasattr(app.state, 'redis') else None
            service_discovery = await init_service_discovery(redis_for_discovery)
            app.state.service_discovery = service_discovery
            
            # Register this FastAPI instance as a service
            await service_discovery.register_service(
                service_name="eyewear-api",
                host="localhost",
                port=8000,
                protocol="http",
                health_check_path="/health",
                metadata={
                    "version": "1.0.0",
                    "environment": settings.ENVIRONMENT,
                    "service_type": "api_gateway"
                },
                tags={"api", "gateway", "eyewear"}
            )
            
            logger.info("Service Discovery initialized successfully")
        except ImportError as e:
            logger.warning(f"ImportError when initializing Service Discovery: {str(e)}")
            logger.warning(f"Traceback: {traceback.format_exc()}")
        except Exception as e:
            logger.warning(f"Failed to initialize Service Discovery: {str(e)}")

        # Initialize basic services only
        logger.info("Initializing basic services...")
        
        # Try to initialize repositories but don't fail if it doesn't work
        try:
            logger.info("Attempting to import and initialize repositories")
            # Log all imports to help identify where the render_asset import error might be occurring
            try:
                logger.info("Checking for any 'services.render' imports")
                try:
                    import services.render
                    logger.info("Successfully imported services.render")
                except ImportError as e:
                    logger.warning(f"ImportError when importing services.render: {str(e)}")
                    logger.warning(f"This is expected if the module doesn't exist")
                except Exception:
                    # Ignore other exceptions during this optional import check
                    pass
            except Exception as e:
                logger.warning(f"Error checking for services.render: {str(e)}")
                
            from src.api.dependencies.repositories import initialize_repositories
            await initialize_repositories(settings) # Pass settings to initialize_repositories
            logger.info("Repositories initialized successfully")
        except ImportError as e:
            logger.warning(f"ImportError when initializing repositories: {str(e)}")
            logger.warning(f"Traceback: {traceback.format_exc()}")
        except Exception as e:
            logger.warning(f"Failed to initialize repositories: {str(e)}")
            logger.warning("Continuing without database connections for cloud deployment")
        
        # Initialize enhanced authentication system
        try:
            logger.info("Initializing enhanced authentication system")
            
            # Check if auth imports were successful by trying to import
            try:
                from src.auth import Role, Permission, TenantManager, AuthManager, TokenValidator, ApiKeyManager, RBACManager, BackwardCompatibilityManager
                auth_imports_successful = True
                logger.info("Auth imports successful")
            except ImportError as e:
                logger.warning(f"Auth imports failed: {str(e)}")
                auth_imports_successful = False
            
            # Only initialize if imports were successful
            if not auth_imports_successful:
                logger.warning("Skipping enhanced auth initialization due to import failures")
                raise ImportError("Auth imports failed during startup")
            
            # Get secret key from settings
            secret_key = getattr(settings, 'JWT_SECRET_KEY', 'your-secret-key-change-in-production')
            
            # Initialize managers if not already done during app initialization
            if not hasattr(app.state, 'auth_manager'):
                tenant_manager = TenantManager()
                auth_manager = AuthManager(secret_key=secret_key)
                token_validator = TokenValidator(secret_key=secret_key, tenant_manager=tenant_manager)
                api_key_manager = ApiKeyManager()
                rbac_manager = RBACManager()
                compatibility_manager = BackwardCompatibilityManager(api_key_manager, auth_manager)
                
                # Store managers in app state
                app.state.auth_manager = auth_manager
                app.state.token_validator = token_validator
                app.state.api_key_manager = api_key_manager
                app.state.rbac_manager = rbac_manager
                app.state.tenant_manager = tenant_manager
                app.state.compatibility_manager = compatibility_manager
                
                # Initialize auth dependencies
                init_auth_deps(auth_manager, token_validator, api_key_manager, rbac_manager)
                logger.info("Auth managers initialized in startup event")
            else:
                logger.info("Auth managers already initialized during app creation")
            
            # Try to initialize OAuth manager for backward compatibility
            try:
                from src.auth.oauth import OAuthManager
                app.state.oauth_manager = OAuthManager()
                logger.info("OAuth manager initialized successfully")
            except ImportError as e:
                logger.warning(f"OAuth manager not available: {str(e)}")
            
            logger.info("Enhanced authentication system initialized successfully")
            
        except ImportError as e:
            logger.warning(f"ImportError when initializing enhanced auth system: {str(e)}")
            logger.warning(f"Traceback: {traceback.format_exc()}")
            # Fall back to basic auth managers
            try:
                from src.auth.api_key import ApiKeyManager
                app.state.api_key_manager = ApiKeyManager()
                logger.info("Fallback: Basic API key manager initialized")
            except Exception as fallback_e:
                logger.error(f"Failed to initialize fallback auth: {str(fallback_e)}")
        except Exception as e:
            logger.warning(f"Failed to initialize enhanced auth system: {str(e)}")
            logger.warning(f"Traceback: {traceback.format_exc()}")
            
        logger.info("Basic services initialized")
    except Exception as e:
        logger.error(f"Failed to initialize services: {str(e)}", exc_info=True)
        # Don't raise exception to allow the app to start

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down EyewearML API")
    
    # Cleanup Service Discovery
    try:
        if hasattr(app.state, 'service_discovery') and app.state.service_discovery:
            logger.info("Shutting down Service Discovery...")
            from src.api.services.service_discovery import cleanup_service_discovery
            await cleanup_service_discovery()
            logger.info("Service Discovery shut down successfully")
    except Exception as e:
        logger.warning(f"Failed to shutdown Service Discovery: {e}")
    
    # Cleanup Redis client
    try:
        if hasattr(app.state, 'redis') and app.state.redis:
            logger.info("Closing Redis connection...")
            await app.state.redis.close()
            logger.info("Redis connection closed successfully")
    except Exception as e:
        logger.warning(f"Failed to close Redis connection: {e}")
    
    # Cleanup Prisma client if enabled
    try:
        from .core.config import settings
        if hasattr(settings, 'USE_PRISMA') and settings.USE_PRISMA:
            try:
                logger.info("Disconnecting Prisma client...")
                from src.api.database.prisma_client import close_prisma_client
                await close_prisma_client()
                logger.info("Prisma client disconnected successfully")
            except ImportError as e:
                logger.warning(f"ImportError when disconnecting Prisma client: {str(e)}")
                logger.warning(f"Traceback: {traceback.format_exc()}")
            except Exception as e:
                logger.warning(f"Failed to disconnect Prisma client: {str(e)}")
    except ImportError as e:
        logger.warning(f"Failed to import settings: {str(e)}")
    
    # Cleanup MongoDB connection
    try:
        if hasattr(app.state, 'mongodb_manager') and app.state.mongodb_manager:
            logger.info("Closing MongoDB connection...")
            from src.api.database.mongodb_client import close_mongodb_connection
            await close_mongodb_connection()
            logger.info("MongoDB connection closed successfully")
    except Exception as e:
        logger.warning(f"Failed to close MongoDB connection: {e}")
    
    # Cleanup monitoring services
    try:
        logger.info("Stopping monitoring services...")
        try:
            logger.info("Attempting to import alert_manager")
            from src.api.services.monitoring.alerts import alert_manager
            alert_manager.stop()
            logger.info("Monitoring services stopped successfully")
        except ImportError as e:
            logger.warning(f"ImportError when stopping alert manager: {str(e)}")
            logger.warning(f"Traceback: {traceback.format_exc()}")
        except Exception as e:
            logger.warning(f"Failed to stop alert manager: {str(e)}")
    except Exception as e:
        logger.error(f"Failed to stop monitoring services: {str(e)}", exc_info=True)

# Root endpoint is now handled by the health module's root_router
