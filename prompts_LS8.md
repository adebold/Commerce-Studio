# Manufacturer Security Foundation Prompts (LS8)

## Prompt [LS8_01]

### Context
The manufacturer role implementation requires a robust authentication system with real JWT tokens, MFA support, and session management. Current tests (test_manufacturer_authentication.py) expect a full implementation to replace mock code. The implementation workflow (MANUFACTURER_IMPLEMENTATION_WORKFLOW_LS7.md) provides initial architecture and patterns.

### Task
Implement the `ManufacturerAuthManager` class in `src/auth/manufacturer_auth.py` that handles real JWT token generation, validation, MFA verification, and session management for manufacturer users.

### Requirements
- Use real JWT token generation and validation (not mocks)
- Implement MFA (Multi-Factor Authentication) using TOTP
- Add session tracking with creation, validation, refresh, and invalidation
- Implement rate limiting to prevent brute force attacks
- Ensure token generation performance under 100ms
- Ensure token validation performance under 50ms
- Include proper error handling for expired/invalid tokens

### Previous Issues
Previous implementations used mock authentication with hardcoded responses. The new implementation must use real JWT tokens with proper signing, validation, and expiration handling. Security tests expect comprehensive threat detection.

### Expected Output
```python
# src/auth/manufacturer_auth.py
import jwt
import bcrypt
import uuid
import pyotp
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class AuthResult:
    status: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    session_id: Optional[str] = None
    manufacturer: Optional[Dict] = None
    mfa_required: bool = False

class ManufacturerAuthManager:
    # Full implementation following the TDD requirements in test_manufacturer_authentication.py
    # with methods for token generation, validation, MFA verification, and session management
    ...
```

## Prompt [LS8_02]

### Context
The manufacturer role requires a role-based access control (RBAC) system with tier-based permissions and usage limits. The implementation must align with the tests in test_manufacturer_authentication.py and test_dashboard_access_control.py, ensuring proper permission validation based on manufacturer tier.

### Task
Implement the `ManufacturerRBACManager` class in `src/auth/manufacturer_rbac.py` that enforces role-based permissions with tier-specific usage limits.

### Requirements
- Define clear roles hierarchy (free, professional, enterprise)
- Implement permission matrix with tier-specific permissions
- Add usage limits tracking (product uploads, ML requests, etc.)
- Create permission enforcement with proper error handling
- Ensure permission checking performance under 5ms
- Implement permission caching for optimization
- Add cache invalidation mechanism

### Previous Issues
Previous implementations had basic role checks without real enforcement or usage limits. The new implementation must validate actual permissions against a matrix, track usage limits, and properly enforce restrictions for each tier.

### Expected Output
```python
# src/auth/manufacturer_rbac.py
from enum import Enum
from dataclasses import dataclass
from typing import Dict, Set, List, Optional

class ManufacturerRole(Enum):
    MANUFACTURER_FREE = "manufacturer_free"
    MANUFACTURER_PROFESSIONAL = "manufacturer_professional"
    MANUFACTURER_ENTERPRISE = "manufacturer_enterprise"

class ManufacturerPermission(Enum):
    UPLOAD_PRODUCTS = "upload_products"
    VIEW_BASIC_ANALYTICS = "view_basic_analytics"
    ACCESS_ML_TOOLS = "access_ml_tools"
    # Additional permissions

@dataclass
class UsageLimits:
    product_uploads_monthly: int
    ml_tool_requests_monthly: int
    api_calls_monthly: int
    data_exports_monthly: int

class ManufacturerRBACManager:
    # Full implementation following TDD requirements
    # with methods for permission checking, enforcement, and usage tracking
    ...
```

## Prompt [LS8_03]

### Context
The manufacturer role requires encryption of sensitive business data with proper key management. The implementation must align with test_manufacturer_authentication.py, ensuring data confidentiality and integrity.

### Task
Implement the `ManufacturerEncryptionManager` class in `src/security/manufacturer_encryption.py` that handles encryption, decryption, and key rotation for sensitive manufacturer data.

### Requirements
- Use industry-standard encryption algorithms
- Implement key rotation functionality
- Ensure encrypted data cannot be read without proper decryption
- Add metadata for tracking encryption versions
- Ensure encryption performance under 100ms for typical payloads
- Ensure decryption performance under 100ms
- Implement proper error handling for invalid data

### Previous Issues
Previous implementations lacked real encryption for sensitive business data. The new implementation must use proper cryptographic techniques and key management for secure data handling.

### Expected Output
```python
# src/security/manufacturer_encryption.py
import os
import json
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from typing import Dict, Any, Optional
from datetime import datetime

class ManufacturerEncryptionManager:
    # Full implementation following TDD requirements
    # with methods for encryption, decryption, and key rotation
    ...
```

## Prompt [LS8_04]

### Context
The manufacturer role requires comprehensive security validation and threat detection to protect against common attacks. The implementation must align with test_manufacturer_authentication.py, ensuring detection of SQL injection, XSS, and other threats.

### Task
Implement the `ManufacturerSecurityValidator` class in `src/security/manufacturer_validator.py` that validates input data and detects security threats.

### Requirements
- Implement SQL injection detection patterns
- Add XSS detection patterns
- Include NoSQL injection detection for MongoDB
- Implement rate limiting and abuse detection
- Add business data validation rules
- Ensure validation performance under 10ms per check
- Implement threat logging and history tracking
- Create security scoring for manufacturer data

### Previous Issues
Previous implementations had basic validation without comprehensive threat detection. The new implementation must use pattern-based detection for various attack vectors and ensure proper validation of business-critical data.

### Expected Output
```python
# src/security/manufacturer_validator.py
import re
import hashlib
import hmac
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class SecurityThreat:
    threat_type: str
    severity: str
    description: str
    detected_at: datetime
    source_ip: Optional[str] = None
    user_agent: Optional[str] = None

@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    threats: List[SecurityThreat]

class ManufacturerSecurityValidator:
    # Full implementation following TDD requirements
    # with methods for threat detection, input validation, and rate limiting
    ...
```

## Prompt [LS8_05]

### Context
The manufacturer role implementation requires exception handling specific to authentication, authorization, and security validation. Current tests expect specific exception types to be raised in error conditions.

### Task
Implement the necessary exception classes in `src/auth/exceptions.py` for proper error handling across the manufacturer authentication and security systems.

### Requirements
- Create specific exception types for authentication failures
- Add exceptions for authorization/permission issues
- Include exceptions for security threats
- Ensure exceptions contain meaningful error messages
- Add context data to exceptions where appropriate
- Support error code standardization

### Previous Issues
Previous implementations had generic exceptions without proper context or standardization. The new implementation must provide specific, informative exceptions that align with the testing requirements.

### Expected Output
```python
# src/auth/exceptions.py
from typing import Dict, Any, Optional

class AuthenticationError(Exception):
    """Base exception for authentication failures"""
    def __init__(self, message: str, code: str = "AUTH_ERROR", context: Optional[Dict[str, Any]] = None):
        self.message = message
        self.code = code
        self.context = context or {}
        super().__init__(self.message)

class TokenExpiredError(AuthenticationError):
    """Exception raised when a JWT token has expired"""
    def __init__(self, message: str = "JWT token has expired", context: Optional[Dict[str, Any]] = None):
        super().__init__(message, code="TOKEN_EXPIRED", context=context)

# Additional exception classes for InvalidToken, InsufficientPermissions, RateLimitExceeded, etc.
...
```

## Prompt [LS8_06]

### Context
The manufacturer role requires integration tests that validate the complete authentication and security flow in a realistic environment. These tests should verify the interaction between all security components.

### Task
Create integration tests in `tests/manufacturer_role/test_security_integration.py` that validate the complete manufacturer security foundation.

### Requirements
- Test the full authentication flow from login through JWT validation
- Verify RBAC enforcement across different manufacturer tiers
- Test MFA workflows including setup and verification
- Validate security threat detection with realistic attack vectors
- Ensure proper interaction between auth, RBAC, and security components
- Test performance under realistic load conditions
- Include both positive and negative test cases

### Previous Issues
Previous tests focused on individual components rather than their integration. The new tests must validate how all security components work together in realistic scenarios.

### Expected Output
```python
# tests/manufacturer_role/test_security_integration.py
import pytest
import asyncio
import jwt
import time
from datetime import datetime, timedelta

from src.auth.manufacturer_auth import ManufacturerAuthManager
from src.auth.manufacturer_rbac import ManufacturerRBACManager, ManufacturerRole, ManufacturerPermission
from src.security.manufacturer_encryption import ManufacturerEncryptionManager
from src.security.manufacturer_validator import ManufacturerSecurityValidator

class TestManufacturerSecurityIntegration:
    """Integration tests for the complete manufacturer security foundation"""
    
    @pytest.mark.asyncio
    async def test_complete_authentication_flow(self):
        """Test the full authentication flow from login through JWT validation and RBAC"""
        # Complete test implementation
        ...
    
    @pytest.mark.asyncio
    async def test_mfa_workflow(self):
        """Test the complete MFA setup and verification process"""
        # Complete test implementation
        ...
    
    # Additional integration test methods
    ...
```

## Prompt [LS8_07]

### Context
The manufacturer role needs a database integration layer to persist authentication and security data. This implementation should work with MongoDB as specified in the implementation workflow.

### Task
Create a MongoDB integration layer in `src/auth/manufacturer_db.py` that handles storage and retrieval of manufacturer authentication and security data.

### Requirements
- Implement MongoDB connection management
- Create data models for manufacturer accounts
- Add methods for CRUD operations on manufacturer data
- Implement session storage and retrieval
- Add indexes for performance optimization
- Include proper error handling for database operations
- Ensure connection pooling for efficient resource usage

### Previous Issues
Previous implementations used in-memory storage or mocks. The new implementation must use a real MongoDB connection with proper data models, indexes, and error handling.

### Expected Output
```python
# src/auth/manufacturer_db.py
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import DuplicateKeyError, ConnectionFailure
from bson.objectid import ObjectId

class ManufacturerDatabase:
    """MongoDB integration for manufacturer authentication and security data"""
    
    def __init__(self, connection_string: str = "mongodb://localhost:27017/", database_name: str = "eyewear_ml"):
        self.client = MongoClient(connection_string)
        self.db = self.client[database_name]
        self.manufacturers = self.db.manufacturers
        self.sessions = self.db.manufacturer_sessions
        self._setup_indexes()
    
    def _setup_indexes(self):
        """Set up required indexes for performance"""
        # Implementation of index creation
        ...
    
    async def get_manufacturer_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get manufacturer by email address"""
        # Implementation of manufacturer retrieval
        ...
    
    # Additional methods for CRUD operations on manufacturers and sessions
    ...
```

## Prompt [LS8_08]

### Context
The manufacturer authentication needs to integrate with the API layer through middleware that validates JWT tokens and enforces permissions on incoming requests.

### Task
Create middleware in `src/api/middleware/manufacturer_auth_middleware.py` that handles JWT verification and RBAC enforcement for API requests.

### Requirements
- Extract and validate JWT tokens from request headers
- Load manufacturer context from validated tokens
- Check permissions for requested endpoints
- Track usage metrics for rate limiting
- Add proper error handling and responses
- Ensure minimal performance impact (<5ms overhead)
- Support both synchronous and asynchronous request handling

### Previous Issues
Previous implementations had middleware that didn't properly validate tokens or enforce permissions. The new implementation must integrate with the real JWT and RBAC systems for proper security enforcement.

### Expected Output
```python
# src/api/middleware/manufacturer_auth_middleware.py
import jwt
from typing import Dict, Any, Callable, Optional
from functools import wraps

from src.auth.manufacturer_auth import ManufacturerAuthManager
from src.auth.manufacturer_rbac import ManufacturerRBACManager, ManufacturerPermission
from src.auth.exceptions import TokenExpiredError, InvalidTokenError, InsufficientPermissionsError

class ManufacturerAuthMiddleware:
    """Middleware for manufacturer authentication and authorization"""
    
    def __init__(self, auth_manager: ManufacturerAuthManager, rbac_manager: ManufacturerRBACManager):
        self.auth_manager = auth_manager
        self.rbac_manager = rbac_manager
    
    async def authenticate_request(self, request):
        """Authenticate a request using JWT token"""
        # Implementation of request authentication
        ...
    
    def require_permission(self, permission: ManufacturerPermission):
        """Decorator to enforce specific permissions on endpoints"""
        # Implementation of permission enforcement decorator
        ...
    
    # Additional middleware methods
    ...