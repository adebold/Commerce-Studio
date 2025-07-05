# Implementation-Ready Batched Prompts for LS3

## Overview
These implementation-ready prompts target the critical enterprise-grade functionality gaps identified in LS2 reflection analysis (overall score: 58.2/100). All prompts are structured for code-centric implementation with specific file paths, function signatures, and test-driven development approaches.

## Critical Enterprise Gaps Summary
1. **E-commerce Integration Recovery** - 100% test failure rate across platforms
2. **RBAC Integration** - Existing system in `/src/auth` needs integration with store generation
3. **Database Schema Enhancement** - Missing migration system and validation
4. **Enterprise Observability** - Missing APM integration and SLA monitoring
5. **Production Deployment** - Incomplete infrastructure automation

---

## Batch 1: E-commerce Platform Integration [LS3_B1]

### Prompt [LS3_B1_001] - Virtual Try-On UI Component Recovery

#### Context
E-commerce platform integration tests show 100% failure rate for virtual try-on functionality across all supported platforms (Shopify, WooCommerce, Magento, BigCommerce). Missing UI components cause 404 errors and broken user experiences.

#### Task
Implement missing virtual try-on UI components and ensure proper routing in the frontend application.

#### Requirements
- Create the missing `TryOnButton` component referenced in tests
- Implement the complete virtual try-on component hierarchy
- Ensure components are properly exported and available
- Add responsive design support for all viewport sizes
- Implement proper error states and loading indicators
- Add comprehensive unit tests with 95%+ coverage

#### Previous Issues
- Component selector `button.varai-try-on-button` not found in DOM
- React components not properly exported from barrel files
- Missing responsive design implementations for mobile views
- Lack of proper error handling for API failures

#### Expected Output
```typescript
// File: frontend/src/components/virtual-try-on/TryOnButton.tsx
import React, { useState } from 'react';
import { useVirtualTryOn } from '../../hooks/useVirtualTryOn';
import { Button, Spinner, ErrorMessage } from '../ui';
import { logAnalyticsEvent } from '../../utils/analytics';

interface TryOnButtonProps {
  productId: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onTryOnStart?: () => void;
  onTryOnComplete?: (result: TryOnResult) => void;
}

export const TryOnButton: React.FC<TryOnButtonProps> = ({
  productId,
  variant = 'primary',
  size = 'medium',
  className = '',
  onTryOnStart,
  onTryOnComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startVirtualTryOn } = useVirtualTryOn();
  
  const handleTryOn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      onTryOnStart?.();
      
      logAnalyticsEvent('virtual_try_on_initiated', {
        product_id: productId,
        timestamp: new Date().toISOString(),
      });
      
      const result = await startVirtualTryOn(productId);
      onTryOnComplete?.(result);
      
    } catch (err) {
      setError('Unable to start virtual try-on. Please try again.');
      console.error('Virtual try-on error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="varai-try-on-container">
      <Button 
        onClick={handleTryOn}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={`varai-try-on-button ${className}`}
        data-testid="virtual-try-on-button"
      >
        {isLoading ? (
          <>
            <Spinner size="small" />
            <span>Starting Try-On...</span>
          </>
        ) : (
          <span>Try On Virtually</span>
        )}
      </Button>
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

// File: frontend/src/components/virtual-try-on/index.ts
export * from './TryOnButton';
export * from './FaceShapeDetector';
export * from './VirtualMirror';
export * from './ProductRecommendations';
export * from './TryOnResults';
```

### Prompt [LS3_B1_002] - Face Shape Detection API Endpoint

#### Context
The face shape detection API endpoints are missing, causing virtual try-on functionality to fail across all platforms. The implementation needs to connect to existing ML models and properly handle image uploads.

#### Task
Implement the face shape detection API endpoint that processes uploaded face images and returns shape classification results.

#### Requirements
- Create RESTful API endpoint for face shape detection
- Implement proper image validation and preprocessing
- Connect to existing ML model for face shape classification
- Add comprehensive error handling with informative messages
- Implement proper caching for performance optimization
- Create unit and integration tests with 95%+ coverage

#### Previous Issues
- 404 errors when trying to access face shape detection API
- Unhandled exceptions when processing invalid images
- Missing JWT authentication integration
- Poor error reporting to frontend components

#### Expected Output
```python
# File: src/api/endpoints/virtual_try_on.py
import io
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from PIL import Image, UnidentifiedImageError

from src.auth.middleware import get_current_user, require_permission
from src.auth.permissions import Permissions
from src.ml.face_shape_detector import FaceShapeDetector
from src.utils.logging import get_logger
from src.utils.monitoring import performance_monitor
from src.utils.cache import cache_manager

router = APIRouter(prefix="/virtual-try-on", tags=["virtual-try-on"])
logger = get_logger(__name__)
face_shape_detector = FaceShapeDetector()

class FaceShapeResponse(BaseModel):
    face_shape: str
    confidence: float
    processing_time_ms: float
    recommended_styles: List[str]
    face_points: Optional[dict] = None

@router.post(
    "/detect-face-shape",
    response_model=FaceShapeResponse,
    status_code=status.HTTP_200_OK,
)
async def detect_face_shape(
    image: UploadFile = File(...),
    current_user = Depends(get_current_user),
):
    """
    Analyze uploaded face image and detect face shape.
    Returns face shape classification and recommended frame styles.
    """
    # Permission check
    require_permission(current_user, Permissions.USE_VIRTUAL_TRY_ON)
    
    # Cache check
    cache_key = f"face_shape:{current_user.id}:{hash(await image.read())}"
    await image.seek(0)  # Reset file position after reading
    
    cached_result = await cache_manager.get(cache_key)
    if cached_result:
        logger.info(f"Face shape cache hit for user {current_user.id}")
        return cached_result
    
    # Process image
    try:
        start_time = time.time()
        
        # Validate image
        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is not an image",
            )
        
        # Process image with ML model
        with performance_monitor.measure_operation("face_shape_detection"):
            image_data = await image.read()
            try:
                pil_image = Image.open(io.BytesIO(image_data))
                
                # Run face shape detection
                face_shape_result = await face_shape_detector.detect(pil_image)
                
                # Get recommended styles based on face shape
                recommended_styles = await face_shape_detector.get_recommended_styles(
                    face_shape_result["face_shape"]
                )
                
                processing_time = (time.time() - start_time) * 1000
                
                response = FaceShapeResponse(
                    face_shape=face_shape_result["face_shape"],
                    confidence=face_shape_result["confidence"],
                    processing_time_ms=processing_time,
                    recommended_styles=recommended_styles,
                    face_points=face_shape_result.get("face_points"),
                )
                
                # Cache result
                await cache_manager.set(cache_key, response.dict(), expire=3600)
                
                logger.info(
                    f"Face shape detected: {face_shape_result['face_shape']} "
                    f"for user {current_user.id} in {processing_time:.2f}ms"
                )
                
                return response
                
            except UnidentifiedImageError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image format",
                )
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Face shape detection error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing face image",
        )
```

### Prompt [LS3_B1_003] - Product Sync Service Recovery

#### Context
Product synchronization with e-commerce platforms is completely broken, showing 100% failure rate in tests. Webhook handlers are failing to process product updates and creation events, preventing real-time inventory synchronization.

#### Task
Implement robust product synchronization service with proper webhook handling for all supported e-commerce platforms.

#### Requirements
- Create platform-specific adapters for each supported e-commerce platform
- Implement proper webhook signature validation and request parsing
- Add robust error handling with retry mechanisms
- Implement transaction safety for database operations
- Add comprehensive logging and monitoring
- Create unit and integration tests with 95%+ coverage

#### Previous Issues
- Webhook signature validation failures
- Missing platform-specific webhook handlers
- Database transaction failures during sync operations
- Lack of proper error recovery mechanisms

#### Expected Output
```typescript
// File: src/services/product-sync/index.ts
import { PlatformType } from '../../types/platforms';
import { ShopifyAdapter } from './adapters/shopify';
import { WooCommerceAdapter } from './adapters/woocommerce';
import { MagentoAdapter } from './adapters/magento';
import { BigCommerceAdapter } from './adapters/bigcommerce';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';
import { db } from '../../db';

export interface SyncAdapter {
  validateWebhook(headers: Record<string, string>, body: string): Promise<boolean>;
  parseProductData(data: any): Promise<ProductData>;
  syncProduct(productData: ProductData): Promise<SyncResult>;
}

export class ProductSyncService {
  private adapters: Map<PlatformType, SyncAdapter>;
  
  constructor() {
    this.adapters = new Map();
    this.adapters.set('shopify', new ShopifyAdapter());
    this.adapters.set('woocommerce', new WooCommerceAdapter());
    this.adapters.set('magento', new MagentoAdapter());
    this.adapters.set('bigcommerce', new BigCommerceAdapter());
  }
  
  async handleWebhook(
    platform: PlatformType,
    headers: Record<string, string>,
    body: string,
    tenantId: string
  ): Promise<WebhookResult> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`Unsupported platform: ${platform}`);
    }
    
    const startTime = Date.now();
    
    try {
      // Validate webhook signature
      const isValid = await adapter.validateWebhook(headers, body);
      if (!isValid) {
        logger.warn(`Invalid webhook signature for ${platform} tenant ${tenantId}`);
        return { success: false, reason: 'INVALID_SIGNATURE' };
      }
      
      // Parse webhook data
      const data = JSON.parse(body);
      const productData = await adapter.parseProductData(data);
      
      // Start transaction for data consistency
      const result = await db.transaction(async (tx) => {
        return await adapter.syncProduct(productData);
      });
      
      // Record metrics
      const duration = Date.now() - startTime;
      metrics.recordWebhookProcessing(platform, 'success', duration);
      
      logger.info(`Successfully processed ${platform} webhook for tenant ${tenantId}`, {
        tenant: tenantId,
        platform,
        productId: productData.id,
        duration
      });
      
      return {
        success: true,
        productId: productData.id,
        processingTime: duration,
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      metrics.recordWebhookProcessing(platform, 'failure', duration);
      
      logger.error(`Failed to process ${platform} webhook for tenant ${tenantId}`, {
        tenant: tenantId,
        platform,
        error: error.message,
        stack: error.stack,
        duration
      });
      
      return {
        success: false,
        reason: 'PROCESSING_ERROR',
        error: error.message
      };
    }
  }
}

// File: src/services/product-sync/adapters/shopify.ts
import crypto from 'crypto';
import { SyncAdapter } from '../index';
import { getShopifyConfig } from '../../../config';
import { logger } from '../../../utils/logger';

export class ShopifyAdapter implements SyncAdapter {
  async validateWebhook(headers: Record<string, string>, body: string): Promise<boolean> {
    const config = await getShopifyConfig();
    const hmacHeader = headers['x-shopify-hmac-sha256'];
    
    if (!hmacHeader) {
      logger.warn('Missing Shopify HMAC signature header');
      return false;
    }
    
    const calculatedHmac = crypto
      .createHmac('sha256', config.webhookSecret)
      .update(body)
      .digest('base64');
      
    return crypto.timingSafeEqual(
      Buffer.from(hmacHeader),
      Buffer.from(calculatedHmac)
    );
  }
  
  async parseProductData(data: any): Promise<ProductData> {
    // Shopify-specific parsing logic
    return {
      id: data.id.toString(),
      title: data.title,
      description: data.body_html,
      images: data.images.map(img => ({
        id: img.id,
        src: img.src,
        position: img.position,
        alt: img.alt || ''
      })),
      variants: data.variants.map(variant => ({
        id: variant.id.toString(),
        sku: variant.sku,
        price: parseFloat(variant.price),
        inventory_quantity: variant.inventory_quantity,
        option_values: Object.entries(variant)
          .filter(([key]) => key.startsWith('option'))
          .map(([_, value]) => value?.toString() || '')
      })),
      options: data.options.map(option => ({
        name: option.name,
        values: option.values
      })),
      metadata: {
        vendor: data.vendor,
        product_type: data.product_type,
        tags: data.tags.split(',').map(tag => tag.trim())
      }
    };
  }
  
  async syncProduct(productData: ProductData): Promise<SyncResult> {
    // Implementation of Shopify product sync logic
    try {
      // Update or create product in database
      const product = await db.products.upsert({
        where: { 
          external_id_platform: {
            external_id: productData.id,
            platform: 'shopify'
          }
        },
        update: {
          // Update fields
          title: productData.title,
          description: productData.description,
          // ...other fields
          updated_at: new Date()
        },
        create: {
          // Create fields
          external_id: productData.id,
          platform: 'shopify',
          title: productData.title,
          description: productData.description,
          // ...other fields
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      // Sync variants, images, etc.
      // ...implementation details
      
      return {
        success: true,
        productId: product.id
      };
    } catch (error) {
      logger.error('Failed to sync Shopify product', {
        productId: productData.id,
        error: error.message
      });
      
      throw error;
    }
  }
}
```

---

## Batch 2: Security & RBAC Integration [LS3_B2]

### Prompt [LS3_B2_001] - RBAC Integration with Store Generation

#### Context
The existing RBAC system in `/src/auth` has 8 roles, 50+ permissions, and complete middleware, but isn't integrated with store generation services. This integration is critical for proper authorization and tenant isolation.

#### Task
Integrate the existing RBAC system with store generation services to ensure proper authentication, authorization, and multi-tenant isolation.

#### Requirements
- Connect existing `RBACManager` to store generation API endpoints
- Integrate `MultiTenantAuthMiddleware` with template engine
- Add role-based permission checks to all administrative functions
- Implement proper tenant isolation for database operations
- Add comprehensive audit logging for authenticated operations
- Create unit and integration tests with 95%+ coverage

#### Previous Issues
- Store generation APIs lack proper authentication
- Template engine operations bypass tenant isolation
- Missing audit trails for administrative actions
- Insufficient permission checks on sensitive operations

#### Expected Output
```python
# File: src/store_generation/service.py
from typing import Dict, List, Optional, Any
from datetime import datetime

from src.auth.rbac import RBACManager, Permission
from src.auth.multi_tenant_middleware import MultiTenantAuthMiddleware
from src.auth.user_context import UserContext
from src.auth.audit import AuditLogger
from src.store_generation.template_engine import TemplateEngine
from src.store_generation.models import StoreTemplate, GeneratedStore
from src.store_generation.database import DatabaseManager
from src.utils.logging import get_logger

logger = get_logger(__name__)
audit_logger = AuditLogger()

class SecureStoreGenerationService:
    """Store generation service with RBAC integration."""
    
    def __init__(self):
        self.rbac_manager = RBACManager()
        self.auth_middleware = MultiTenantAuthMiddleware()
        self.template_engine = TemplateEngine()
        self.db_manager = DatabaseManager()
    
    async def generate_store(
        self,
        user_context: UserContext,
        template_id: str,
        store_config: Dict[str, Any]
    ) -> GeneratedStore:
        """Generate a new store from template with proper RBAC checks."""
        # Check if user has permission to generate stores
        if not self.rbac_manager.has_permission(
            user_context, 
            Permission.GENERATE_STORE
        ):
            audit_logger.log_access_denied(
                user_context,
                "generate_store",
                {"template_id": template_id}
            )
            raise PermissionError("User lacks permission to generate stores")
        
        # Ensure tenant isolation
        if "tenant_id" in store_config and store_config["tenant_id"] != user_context.tenant_id:
            audit_logger.log_access_denied(
                user_context,
                "generate_store",
                {"template_id": template_id, "tenant_mismatch": True}
            )
            raise PermissionError("Cannot generate store for different tenant")
        
        # Add tenant context to store configuration
        secure_store_config = {
            **store_config,
            "tenant_id": user_context.tenant_id,
            "created_by": user_context.user_id,
            "created_at": datetime.utcnow()
        }
        
        # Log the operation start
        logger.info(
            f"User {user_context.user_id} generating store from template {template_id}"
        )
        audit_logger.log_operation_started(
            user_context,
            "generate_store",
            {"template_id": template_id}
        )
        
        try:
            # Fetch template with tenant isolation
            template = await self.db_manager.get_template_by_id(
                template_id, 
                tenant_id=user_context.tenant_id
            )
            
            if not template:
                raise ValueError(f"Template {template_id} not found")
            
            # Generate store with secure template engine
            generated_store = await self.template_engine.generate(
                template,
                secure_store_config,
                user_context=user_context  # Pass user context to template engine
            )
            
            # Save generated store with tenant isolation
            store_record = await self.db_manager.save_generated_store(
                generated_store,
                tenant_id=user_context.tenant_id,
                user_id=user_context.user_id
            )
            
            # Log successful operation
            audit_logger.log_operation_completed(
                user_context,
                "generate_store",
                {
                    "template_id": template_id,
                    "store_id": store_record.id,
                    "status": "success"
                }
            )
            
            return store_record
            
        except Exception as e:
            # Log failed operation
            logger.error(
                f"Failed to generate store: {str(e)}",
                exc_info=True
            )
            audit_logger.log_operation_failed(
                user_context,
                "generate_store",
                {
                    "template_id": template_id,
                    "error": str(e),
                    "status": "failed"
                }
            )
            raise
```

### Prompt [LS3_B2_002] - Secure Template Engine Implementation

#### Context
The template engine lacks proper security controls and RBAC integration, creating potential vulnerabilities and bypassing tenant isolation. A secure implementation is needed to integrate with the existing authentication infrastructure.

#### Task
Implement a secure template engine with proper RBAC integration, tenant isolation, and comprehensive security controls.

#### Requirements
- Create secure template rendering with proper input validation
- Implement tenant isolation for all template operations
- Add permission-based access control for template editing
- Implement content security policies for rendered templates
- Add audit logging for all template operations
- Create unit and integration tests with 95%+ coverage

#### Previous Issues
- Template engine operations bypass tenant isolation
- Missing permission checks on template modifications
- Lack of input sanitization for user-provided content
- Missing audit trails for template changes

#### Expected Output
```python
# File: src/store_generation/template_engine.py
import re
from typing import Dict, Any, Optional, List
from jinja2 import Environment, Template, meta, sandbox
from jinja2.exceptions import TemplateError

from src.auth.rbac import RBACManager, Permission
from src.auth.user_context import UserContext
from src.auth.audit import AuditLogger
from src.utils.logging import get_logger
from src.utils.sanitizer import sanitize_html
from src.store_generation.models import StoreTemplate, GeneratedStore
from src.store_generation.security import ContentSecurityPolicy

logger = get_logger(__name__)
audit_logger = AuditLogger()
rbac_manager = RBACManager()

class SecureTemplateEngine:
    """Secure template engine with RBAC integration and tenant isolation."""
    
    def __init__(self):
        # Create sandboxed environment for safe template execution
        self.env = sandbox.SandboxedEnvironment(
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add custom filters
        self.env.filters['sanitize'] = sanitize_html
        
        # Content security policy
        self.csp = ContentSecurityPolicy()
    
    async def validate_template_access(
        self,
        user_context: UserContext,
        template: StoreTemplate,
        operation: str
    ) -> bool:
        """Validate if user has permission to access/modify template."""
        # Check tenant isolation
        if template.tenant_id != user_context.tenant_id:
            audit_logger.log_access_denied(
                user_context,
                f"template_{operation}",
                {"template_id": template.id, "tenant_mismatch": True}
            )
            return False
        
        # Check operation-specific permissions
        permission_map = {
            "view": Permission.VIEW_TEMPLATES,
            "edit": Permission.EDIT_TEMPLATES,
            "delete": Permission.DELETE_TEMPLATES,
            "use": Permission.GENERATE_STORE
        }
        
        required_permission = permission_map.get(operation)
        if not required_permission:
            logger.error(f"Unknown template operation: {operation}")
            return False
        
        has_permission = rbac_manager.has_permission(
            user_context, 
            required_permission
        )
        
        if not has_permission:
            audit_logger.log_access_denied(
                user_context,
                f"template_{operation}",
                {"template_id": template.id, "permission": required_permission.name}
            )
        
        return has_permission
    
    async def validate_template_security(self, template_source: str) -> List[str]:
        """Validate template for security issues."""
        security_issues = []
        
        # Check for dangerous patterns
        dangerous_patterns = [
            (r'{{.*?.__class__.*?}}', "Potential server-side template injection"),
            (r'{{.*?.__globals__.*?}}', "Potential server-side template injection"),
            (r'{{.*?.__getattribute__.*?}}', "Potential server-side template injection"),
            (r'{{.*?open\s*\(.*?}}', "Potential file access"),
            (r'{{.*?subprocess.*?}}', "Potential command execution"),
            (r'{{.*?os\..*?}}', "Potential OS operation"),
            (r'{{.*?config.*?}}', "Potential configuration access"),
        ]
        
        for pattern, message in dangerous_patterns:
            if re.search(pattern, template_source):
                security_issues.append(message)
        
        # Analyze template for undefined variables
        try:
            ast = self.env.parse(template_source)
            variables = meta.find_undeclared_variables(ast)
            
            # Check for suspicious variable names
            suspicious_vars = [
                "config", "settings", "env", "environment", 
                "secret", "password", "token", "key"
            ]
            
            for var in variables:
                if var.lower() in suspicious_vars:
                    security_issues.append(f"Suspicious variable name: {var}")
        
        except Exception as e:
            security_issues.append(f"Template parsing error: {str(e)}")
        
        return security_issues
    
    async def generate(
        self,
        template: StoreTemplate,
        context: Dict[str, Any],
        user_context: UserContext
    ) -> GeneratedStore:
        """Generate store from template with security controls."""
        # Validate access
        if not await self.validate_template_access(user_context, template, "use"):
            raise PermissionError(
                f"User {user_context.user_id} does not have permission to use template {template.id}"
            )
        
        # Validate template security
        security_issues = await self.validate_template_security(template.content)
        if security_issues:
            issues_str = "; ".join(security_issues)
            logger.error(f"Template security issues: {issues_str}")
            audit_logger.log_security_event(
                user_context,
                "template_security_violation",
                {
                    "template_id": template.id,
                    "issues": security_issues
                }
            )
            raise SecurityError(f"Template contains security issues: {issues_str}")
        
        # Add tenant and user context
        secure_context = {
            **context,
            "tenant_id": user_context.tenant_id,
            "user": {
                "id": user_context.user_id,
                "email": user_context.email,
                "roles": user_context.roles
            }
        }
        
        # Log operation
        audit_logger.log_operation_started(
            user_context,
            "template_generate",
            {"template_id": template.id}
        )
        
        try:
            # Render template in sandbox
            template_obj = self.env.from_string(template.content)
            rendered_content = template_obj.render(**secure_context)
            
            # Apply content security policy
            secured_content = self.csp.apply(rendered_content)
            
            # Create generated store
            generated_store = GeneratedStore(
                template_id=template.id,
                content=secured_content,
                context=secure_context,
                tenant_id=user_context.tenant_id,
                created_by=user_context.user_id
            )
            
            # Log success
            audit_logger.log_operation_completed(
                user_context,
                "template_generate",
                {"template_id": template.id, "status": "success"}
            )
            
            return generated_store
            
        except TemplateError as e:
            # Log template error
            logger.error(f"Template rendering error: {str(e)}")
            audit_logger.log_operation_failed(
                user_context,
                "template_generate",
                {
                    "template_id": template.id,
                    "error": str(e),
                    "status": "failed"
                }
            )
            raise
        except Exception as e:
            # Log general error
            logger.error(f"Template generation error: {str(e)}", exc_info=True)
            audit_logger.log_operation_failed(
                user_context,
                "template_generate",
                {
                    "template_id": template.id,
                    "error": str(e),
                    "status": "failed"
                }
            )
            raise
```

---

## Batch 3: Database Schema & Migration [LS3_B3]

### Prompt [LS3_B3_001] - Schema Migration System

#### Context
The database schema system lacks versioning, migration capabilities, and proper validation. An enterprise-grade migration system is needed for zero-downtime schema evolution.

#### Task
Implement a comprehensive schema migration system with versioning, validation, and rollback capabilities.

#### Requirements
- Create schema version tracking with migration history
- Implement forward and backward migration scripts
- Add transaction safety for all migration operations
- Implement validation checks before migration execution
- Add comprehensive logging and error handling
- Create unit and integration tests with 95%+ coverage

#### Previous Issues
- No schema versioning or migration tracking
- Missing validation before schema changes
- Lack of rollback capabilities for failed migrations
- No support for complex migrations with dependencies

#### Expected Output
```python
# File: src/database/migrations/manager.py
import os
import importlib.util
import inspect
import logging
import re
import sys
import time
import traceback
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Type, Any, Set
from uuid import uuid4

from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, Boolean, ForeignKey, Text, inspect
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import text
from sqlalchemy.exc import SQLAlchemyError

from src.config import