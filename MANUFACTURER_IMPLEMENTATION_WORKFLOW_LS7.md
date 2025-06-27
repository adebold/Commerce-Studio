# Manufacturer Implementation Workflow - Step-by-Step Guide

## 🎯 Overview

This document provides concrete, actionable steps for implementing the manufacturer onboarding and free account journey using the SPARC architecture. Each step includes specific code examples, test requirements, and validation criteria.

**Current Status**: RED PHASE - Tests exist but implementations are missing  
**Next Phase**: GREEN PHASE - Implement code to make tests pass  
**Architecture Reference**: [`MANUFACTURER_SPARC_ARCHITECTURE_LS7.md`](MANUFACTURER_SPARC_ARCHITECTURE_LS7.md)

---

## 🔄 TDD Workflow Integration

### Red-Green-Refactor Cycle
1. **RED**: Run existing tests (they should fail) ✅ **CURRENT PHASE**
2. **GREEN**: Implement minimal code to pass tests
3. **REFACTOR**: Improve code while maintaining test coverage
4. **VALIDATE**: Ensure all quality gates are met

### Agentic Elements Integration
- **User Autonomy**: Self-service onboarding with intelligent guidance
- **Feedback Loops**: Real-time optimization based on user behavior
- **Adaptive Flows**: Dynamic onboarding paths based on manufacturer profile

---

## 📋 Phase 1: Security Foundation Implementation

### Step 1.1: Set Up Development Environment

**Objective**: Establish development infrastructure with real databases

**Tasks:**
```bash
# 1. Install dependencies
pip install -r tests/manufacturer_role/requirements-test.txt

# 2. Start MongoDB test container
docker run -d --name mongodb-test -p 27017:27017 mongo:latest

# 3. Start Redis test container  
docker run -d --name redis-test -p 6379:6379 redis:latest

# 4. Verify connections
python -c "
import pymongo
import redis
mongo_client = pymongo.MongoClient('mongodb://localhost:27017/')
redis_client = redis.Redis(host='localhost', port=6379, db=0)
print('✓ Database connections established')
"
```

**Validation:**
- MongoDB accessible on localhost:27017
- Redis accessible on localhost:6379
- All test dependencies installed

### Step 1.2: Implement Real JWT Authentication

**Objective**: Replace mock authentication with real JWT implementation

**File**: [`src/auth/manufacturer_auth.py`](src/auth/manufacturer_auth.py)

**Implementation:**
```python
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
    def __init__(self, secret_key: str, algorithm: str = "HS256", token_expiry_hours: int = 24):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.token_expiry_hours = token_expiry_hours
        self._sessions: Dict[str, Any] = {}
        self._failed_attempts: Dict[str, int] = {}
    
    async def authenticate_manufacturer(self, email: str, password: str, mfa_code: Optional[str] = None) -> AuthResult:
        """Real authentication with rate limiting and MFA support"""
        
        # 1. Rate limiting check
        if self._failed_attempts.get(email, 0) >= 5:
            raise AuthenticationError("Account temporarily locked due to failed attempts")
        
        # 2. Retrieve manufacturer from database (implement with real MongoDB)
        manufacturer = await self._get_manufacturer_by_email(email)
        if not manufacturer:
            self._failed_attempts[email] = self._failed_attempts.get(email, 0) + 1
            raise AuthenticationError("Invalid credentials")
        
        # 3. Verify password with bcrypt
        if not bcrypt.checkpw(password.encode('utf-8'), manufacturer['password_hash'].encode('utf-8')):
            self._failed_attempts[email] = self._failed_attempts.get(email, 0) + 1
            raise AuthenticationError("Invalid credentials")
        
        # 4. MFA verification if enabled
        if manufacturer.get('mfa_enabled', False):
            if not mfa_code:
                return AuthResult(status="mfa_required", mfa_required=True)
            
            if not self._verify_mfa_code(manufacturer['mfa_secret'], mfa_code):
                raise AuthenticationError("Invalid MFA code")
        
        # 5. Generate real JWT tokens
        access_token = await self._generate_access_token(manufacturer)
        refresh_token = await self._generate_refresh_token(manufacturer)
        
        # 6. Create session
        session_id = str(uuid.uuid4())
        session = {
            'session_id': session_id,
            'manufacturer_id': manufacturer['_id'],
            'created_at': datetime.utcnow(),
            'expires_at': datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
            'is_active': True
        }
        self._sessions[session_id] = session
        
        # 7. Reset failed attempts on successful auth
        self._failed_attempts.pop(email, None)
        
        return AuthResult(
            status="success",
            access_token=access_token,
            refresh_token=refresh_token,
            session_id=session_id,
            manufacturer=manufacturer
        )
    
    async def _generate_access_token(self, manufacturer: Dict) -> str:
        """Generate real JWT access token"""
        payload = {
            'manufacturer_id': str(manufacturer['_id']),
            'company_name': manufacturer['company_name'],
            'email': manufacturer['email'],
            'tier': manufacturer.get('tier', 'free'),
            'roles': manufacturer.get('roles', ['manufacturer_free']),
            'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
            'iat': datetime.utcnow(),
            'jti': str(uuid.uuid4()),
            'type': 'access'
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    async def validate_token(self, token: str) -> Dict[str, Any]:
        """Validate JWT token and return claims"""
        try:
            claims = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            
            # Verify session is still active
            if claims.get('type') == 'access':
                session_valid = await self._validate_session_from_token(claims)
                if not session_valid:
                    raise InvalidTokenError("Session no longer active")
            
            return claims
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError("JWT token has expired")
        except jwt.InvalidTokenError:
            raise InvalidTokenError("Invalid JWT token")
    
    def _verify_mfa_code(self, secret: str, code: str) -> bool:
        """Verify TOTP MFA code"""
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=1)
    
    async def _get_manufacturer_by_email(self, email: str) -> Optional[Dict]:
        """Retrieve manufacturer from MongoDB - implement with real database"""
        # TODO: Implement real MongoDB query
        # For now, return mock data for testing
        if email == "test@manufacturer.com":
            return {
                '_id': 'test_manufacturer_id',
                'email': email,
                'company_name': 'Test Manufacturer',
                'password_hash': bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
                'tier': 'free',
                'roles': ['manufacturer_free'],
                'mfa_enabled': False
            }
        return None
    
    async def _validate_session_from_token(self, claims: Dict) -> bool:
        """Validate session is still active"""
        # TODO: Implement real session validation
        return True

# Exception classes
class AuthenticationError(Exception):
    pass

class InvalidTokenError(Exception):
    pass

class TokenExpiredError(Exception):
    pass
```

**Test Validation:**
```bash
# Run authentication tests
python -m pytest tests/manufacturer_role/test_manufacturer_authentication.py::TestManufacturerAuthentication::test_manufacturer_jwt_token_validation -v
```

**Success Criteria:**
- JWT tokens properly generated and validated
- MFA integration working
- Rate limiting prevents brute force attacks
- All authentication tests pass

### Step 1.3: Implement RBAC with Real Permission Validation

**Objective**: Build role-based access control with tier-based permissions

**File**: [`src/auth/manufacturer_rbac.py`](src/auth/manufacturer_rbac.py)

**Implementation:**
```python
from enum import Enum
from dataclasses import dataclass
from typing import Dict, Set, List, Optional
import asyncio

class ManufacturerRole(Enum):
    MANUFACTURER_FREE = "manufacturer_free"
    MANUFACTURER_PROFESSIONAL = "manufacturer_professional"
    MANUFACTURER_ENTERPRISE = "manufacturer_enterprise"

class ManufacturerPermission(Enum):
    UPLOAD_PRODUCTS = "upload_products"
    VIEW_BASIC_ANALYTICS = "view_basic_analytics"
    ACCESS_ML_TOOLS = "access_ml_tools"
    EXPORT_DATA = "export_data"
    API_ACCESS = "api_access"
    ADVANCED_ANALYTICS = "advanced_analytics"
    BULK_OPERATIONS = "bulk_operations"
    WHITE_LABEL_ACCESS = "white_label_access"

@dataclass
class UsageLimits:
    product_uploads_monthly: int
    ml_tool_requests_monthly: int
    api_calls_monthly: int
    data_exports_monthly: int

@dataclass
class ManufacturerContext:
    manufacturer_id: str
    company_name: str
    email: str
    tier: str
    roles: List[ManufacturerRole]
    current_usage: Optional[Dict[str, int]] = None
    permissions: Optional[List[ManufacturerPermission]] = None

class ManufacturerRBACManager:
    """Real RBAC implementation with tier-based permissions and usage limits"""
    
    def __init__(self):
        self._permission_matrix = self._build_permission_matrix()
        self._usage_limits = self._build_usage_limits()
        self._cached_permissions: Dict[str, Set[ManufacturerPermission]] = {}
    
    def _build_permission_matrix(self) -> Dict[ManufacturerRole, Set[ManufacturerPermission]]:
        """Define tier-based permission matrix"""
        return {
            ManufacturerRole.MANUFACTURER_FREE: {
                ManufacturerPermission.UPLOAD_PRODUCTS,
                ManufacturerPermission.VIEW_BASIC_ANALYTICS,
                ManufacturerPermission.ACCESS_ML_TOOLS
            },
            ManufacturerRole.MANUFACTURER_PROFESSIONAL: {
                ManufacturerPermission.UPLOAD_PRODUCTS,
                ManufacturerPermission.VIEW_BASIC_ANALYTICS,
                ManufacturerPermission.ACCESS_ML_TOOLS,
                ManufacturerPermission.EXPORT_DATA,
                ManufacturerPermission.API_ACCESS,
                ManufacturerPermission.ADVANCED_ANALYTICS,
                ManufacturerPermission.BULK_OPERATIONS
            },
            ManufacturerRole.MANUFACTURER_ENTERPRISE: {
                # All permissions
                permission for permission in ManufacturerPermission
            }
        }
    
    def _build_usage_limits(self) -> Dict[ManufacturerRole, UsageLimits]:
        """Define tier-based usage limits"""
        return {
            ManufacturerRole.MANUFACTURER_FREE: UsageLimits(
                product_uploads_monthly=100,
                ml_tool_requests_monthly=50,
                api_calls_monthly=1000,
                data_exports_monthly=1
            ),
            ManufacturerRole.MANUFACTURER_PROFESSIONAL: UsageLimits(
                product_uploads_monthly=5000,
                ml_tool_requests_monthly=1000,
                api_calls_monthly=50000,
                data_exports_monthly=10
            ),
            ManufacturerRole.MANUFACTURER_ENTERPRISE: UsageLimits(
                product_uploads_monthly=-1,  # Unlimited
                ml_tool_requests_monthly=-1,
                api_calls_monthly=-1,
                data_exports_monthly=-1
            )
        }
    
    async def has_permission(self, context: ManufacturerContext, permission: ManufacturerPermission) -> bool:
        """Check if manufacturer has specific permission"""
        
        # 1. Get permissions for manufacturer's roles
        manufacturer_permissions = await self._get_permissions_for_context(context)
        
        # 2. Check if permission exists
        has_perm = permission in manufacturer_permissions
        
        # 3. Check usage limits if permission exists
        if has_perm:
            within_limits = await self._check_usage_limits(context, permission)
            return within_limits
        
        return False
    
    async def enforce_permission(self, context: ManufacturerContext, permission: ManufacturerPermission) -> None:
        """Enforce permission or raise exception"""
        if not await self.has_permission(context, permission):
            raise PermissionDeniedError(
                f"Permission '{permission.value}' denied for manufacturer '{context.manufacturer_id}' "
                f"with tier '{context.tier}'"
            )
    
    async def get_accessible_features(self, context: ManufacturerContext) -> List[str]:
        """Get list of features accessible to manufacturer"""
        permissions = await self._get_permissions_for_context(context)
        
        feature_map = {
            ManufacturerPermission.UPLOAD_PRODUCTS: "product_upload",
            ManufacturerPermission.VIEW_BASIC_ANALYTICS: "basic_analytics",
            ManufacturerPermission.ACCESS_ML_TOOLS: "ml_analysis",
            ManufacturerPermission.EXPORT_DATA: "data_export",
            ManufacturerPermission.API_ACCESS: "api_integration",
            ManufacturerPermission.ADVANCED_ANALYTICS: "advanced_analytics",
            ManufacturerPermission.BULK_OPERATIONS: "bulk_operations",
            ManufacturerPermission.WHITE_LABEL_ACCESS: "white_label"
        }
        
        accessible_features = []
        for permission in permissions:
            if permission in feature_map:
                # Check usage limits
                if await self._check_usage_limits(context, permission):
                    accessible_features.append(feature_map[permission])
        
        return accessible_features
    
    async def _get_permissions_for_context(self, context: ManufacturerContext) -> Set[ManufacturerPermission]:
        """Get all permissions for manufacturer context"""
        
        # Check cache first
        cache_key = f"{context.manufacturer_id}:{context.tier}"
        if cache_key in self._cached_permissions:
            return self._cached_permissions[cache_key]
        
        # Aggregate permissions from all roles
        all_permissions = set()
        for role in context.roles:
            if role in self._permission_matrix:
                all_permissions.update(self._permission_matrix[role])
        
        # Cache permissions
        self._cached_permissions[cache_key] = all_permissions
        
        return all_permissions
    
    async def _check_usage_limits(self, context: ManufacturerContext, permission: ManufacturerPermission) -> bool:
        """Check if manufacturer is within usage limits for permission"""
        
        # Get primary role for usage limits
        primary_role = context.roles[0] if context.roles else ManufacturerRole.MANUFACTURER_FREE
        
        if primary_role not in self._usage_limits:
            return False
        
        limits = self._usage_limits[primary_role]
        current_usage = context.current_usage or {}
        
        # Check specific permission limits
        limit_checks = {
            ManufacturerPermission.UPLOAD_PRODUCTS: (
                current_usage.get('product_uploads_monthly', 0),
                limits.product_uploads_monthly
            ),
            ManufacturerPermission.ACCESS_ML_TOOLS: (
                current_usage.get('ml_tool_requests_monthly', 0),
                limits.ml_tool_requests_monthly
            ),
            ManufacturerPermission.API_ACCESS: (
                current_usage.get('api_calls_monthly', 0),
                limits.api_calls_monthly
            ),
            ManufacturerPermission.EXPORT_DATA: (
                current_usage.get('data_exports_monthly', 0),
                limits.data_exports_monthly
            )
        }
        
        if permission in limit_checks:
            current, limit = limit_checks[permission]
            # -1 means unlimited
            return limit == -1 or current < limit
        
        # No specific limit for this permission
        return True
    
    def invalidate_cache(self, manufacturer_id: str) -> None:
        """Invalidate cached permissions for manufacturer"""
        keys_to_remove = [key for key in self._cached_permissions.keys() if key.startswith(f"{manufacturer_id}:")]
        for key in keys_to_remove:
            del self._cached_permissions[key]

class PermissionDeniedError(Exception):
    pass
```

**Test Validation:**
```bash
# Run RBAC tests
python -m pytest tests/manufacturer_role/test_dashboard_access_control.py::TestManufacturerDashboardAccess::test_tier_based_feature_gating -v
```

**Success Criteria:**
- Tier-based permissions correctly enforced
- Usage limits properly validated
- Permission caching working efficiently
- All RBAC tests pass

### Step 1.4: Implement Security Validation

**Objective**: Build comprehensive security validation and threat detection

**File**: [`src/security/manufacturer_validator.py`](src/security/manufacturer_validator.py)

**Implementation:**
```python
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
    """Comprehensive security validation for manufacturer operations"""
    
    def __init__(self):
        self._sql_injection_patterns = self._build_sql_injection_patterns()
        self._xss_patterns = self._build_xss_patterns()
        self._threat_history: Dict[str, List[SecurityThreat]] = {}
        self._rate_limits: Dict[str, List[datetime]] = {}
    
    def _build_sql_injection_patterns(self) -> List[re.Pattern]:
        """Build SQL injection detection patterns"""
        patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)",
            r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
            r"(\b(OR|AND)\s+['\"]?\w+['\"]?\s*=\s*['\"]?\w+['\"]?)",
            r"(--|#|/\*|\*/)",
            r"(\bUNION\s+SELECT\b)",
            r"(\b(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)\b)"
        ]
        return [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    
    def _build_xss_patterns(self) -> List[re.Pattern]:
        """Build XSS detection patterns"""
        patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe[^>]*>",
            r"<object[^>]*>",
            r"<embed[^>]*>",
            r"<link[^>]*>",
            r"<meta[^>]*>"
        ]
        return [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
    
    async def validate_manufacturer_input(self, data: Dict[str, Any], context: Dict[str, Any]) -> ValidationResult:
        """Comprehensive validation of manufacturer input data"""
        
        errors = []
        warnings = []
        threats = []
        
        # 1. Input sanitization and validation
        sanitization_result = await self._validate_input_sanitization(data)
        errors.extend(sanitization_result.get('errors', []))
        threats.extend(sanitization_result.get('threats', []))
        
        # 2. SQL injection detection
        sql_injection_result = await self._detect_sql_injection(data)
        if sql_injection_result['detected']:
            threats.append(SecurityThreat(
                threat_type="SQL_INJECTION",
                severity="HIGH",
                description=f"SQL injection attempt detected: {sql_injection_result['pattern']}",
                detected_at=datetime.utcnow(),
                source_ip=context.get('source_ip'),
                user_agent=context.get('user_agent')
            ))
        
        # 3. XSS detection
        xss_result = await self._detect_xss(data)
        if xss_result['detected']:
            threats.append(SecurityThreat(
                threat_type="XSS",
                severity="MEDIUM",
                description=f"XSS attempt detected: {xss_result['pattern']}",
                detected_at=datetime.utcnow(),
                source_ip=context.get('source_ip'),
                user_agent=context.get('user_agent')
            ))
        
        # 4. Rate limiting validation
        rate_limit_result = await self._validate_rate_limits(context)
        if not rate_limit_result['valid']:
            threats.append(SecurityThreat(
                threat_type="RATE_LIMIT_EXCEEDED",
                severity="MEDIUM",
                description=f"Rate limit exceeded: {rate_limit_result['message']}",
                detected_at=datetime.utcnow(),
                source_ip=context.get('source_ip')
            ))
        
        # 5. Business logic validation
        business_validation = await self._validate_business_logic(data, context)
        errors.extend(business_validation.get('errors', []))
        warnings.extend(business_validation.get('warnings', []))
        
        # 6. Store threat history
        if threats:
            await self._store_threat_history(context.get('manufacturer_id'), threats)
        
        is_valid = len(errors) == 0 and len([t for t in threats if t.severity == "HIGH"]) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            threats=threats
        )
    
    async def _validate_input_sanitization(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate input sanitization"""
        errors = []
        threats = []
        
        for key, value in data.items():
            if isinstance(value, str):
                # Check for null bytes
                if '\x00' in value:
                    threats.append(SecurityThreat(
                        threat_type="NULL_BYTE_INJECTION",
                        severity="HIGH",
                        description=f"Null byte detected in field '{key}'",
                        detected_at=datetime.utcnow()
                    ))
                
                # Check for excessive length
                if len(value) > 10000:  # Configurable limit
                    errors.append(f"Field '{key}' exceeds maximum length")
                
                # Check for control characters
                if any(ord(char) < 32 and char not in ['\t', '\n', '\r'] for char in value):
                    threats.append(SecurityThreat(
                        threat_type="CONTROL_CHAR_INJECTION",
                        severity="MEDIUM",
                        description=f"Control characters detected in field '{key}'",
                        detected_at=datetime.utcnow()
                    ))
        
        return {'errors': errors, 'threats': threats}
    
    async def _detect_sql_injection(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect SQL injection attempts"""
        for key, value in data.items():
            if isinstance(value, str):
                for pattern in self._sql_injection_patterns:
                    if pattern.search(value):
                        return {
                            'detected': True,
                            'field': key,
                            'pattern': pattern.pattern,
                            'value': value[:100]  # Truncate for logging
                        }
        
        return {'detected': False}
    
    async def _detect_xss(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect XSS attempts"""
        for key, value in data.items():
            if isinstance(value, str):
                for pattern in self._xss_patterns:
                    if pattern.search(value):
                        return {
                            'detected': True,
                            'field': key,
                            'pattern': pattern.pattern,
                            'value': value[:100]  # Truncate for logging
                        }
        
        return {'detected': False}
    
    async def _validate_rate_limits(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate rate limits"""
        source_ip = context.get('source_ip')
        if not source_ip:
            return {'valid': True}
        
        now = datetime.utcnow()
        window_start = now - timedelta(minutes=1)
        
        # Clean old entries
        if source_ip in self._rate_limits:
            self._rate_limits[source_ip] = [
                timestamp for timestamp in self._rate_limits[source_ip]
                if timestamp > window_start
            ]
        else:
            self._rate_limits[source_ip] = []
        
        # Check rate limit (60 requests per minute)
        if len(self._rate_limits[source_ip]) >= 60:
            return {
                'valid': False,
                'message': f"Rate limit exceeded for IP {source_ip}"
            }
        
        # Add current request
        self._rate_limits[source_ip].append(now)
        
        return {'valid': True}
    
    async def _validate_business_logic(self, data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate business logic constraints"""
        errors = []
        warnings = []
        
        # Example business validations
        if 'company_name' in data:
            if len(data['company_name']) < 2:
                errors.append("Company name must be at least 2 characters")
            if len(data['company_name']) > 100:
                errors.append("Company name must be less than 100 characters")
        
        if 'email' in data:
            email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
            if not email_pattern.match(data['email']):
                errors.append("Invalid email format")
        
        if 'product_count' in data:
            try:
                count = int(data['product_count'])
                if count < 0:
                    errors.append("Product count cannot be negative")
                if count > 100000:
                    warnings.append("Large product count may impact performance")
            except (ValueError, TypeError):
                errors.append("Product count must be a valid number")
        
        return {'errors': errors, 'warnings': warnings}
    
    async def _store_threat_history(self, manufacturer_id: str, threats: List[SecurityThreat]) -> None:
        """Store threat history for analysis"""
        if manufacturer_id:
            if manufacturer_id not in self._threat_history:
                self._threat_history[manufacturer_id] = []
            self._threat_history[manufacturer_id].extend(threats)
            
            # Keep only last 100 threats per manufacturer
            self._threat_history[manufacturer_id] = self._threat_history[manufacturer_id][-100:]
    
    async def get_threat_summary(self, manufacturer_id: str) -> Dict[str, Any]:
        """Get threat summary for manufacturer"""
        if manufacturer_id not in self._threat_history:
            return {'total_threats': 0, 'threat_types': {}, 'recent_threats': []}
        
        threats = self._threat_history[manufacturer_id]
        threat_types = {}
        
        for threat in threats:
            threat_types[threat.threat_type] = threat_types.get(threat.threat_type, 0) + 1
        
        recent_threats = sorted(threats, key=lambda t: t.detected_at, reverse=True)[:10]
        
        return {
            'total_threats': len(threats),
            'threat_types': threat_types,
            'recent_threats': [
                {
                    'type': t.threat_type,
                    'severity': t.severity,
                    'description': t.description,
                    'detected_at': t.detected_at.isoformat()
                }
                for t in recent_threats
            ]
        }
```

**Test Validation:**
```bash
# Run security validation tests
python -m pytest tests/manufacturer_role/test_manufacturer_authentication.py::TestManufacturerAuthentication::test_security_audit_logging -v
```

**Success Criteria:**
- SQL injection attempts detected and blocked
- XSS attempts detected and blocked
- Rate limiting properly enforced
- Threat history maintained for analysis
- All security tests pass

---

## 📋 Phase 2: Product Repository Implementation

### Step 2.1: Implement Product Repository with MongoDB

**Objective**: Build scalable product repository with real database operations

**File**: [`src/eyewear_database/manufacturerProductRepository.ts`](src/eyewear_database/manufacturerProductRepository.ts)

**Implementation:**
```python
# src/eyewear_database/manufacturer_product_repository.py

import asyncio
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import pymongo
from pymongo import MongoClient
from bson import ObjectId

@dataclass
class ProductUploadResult:
    success_count: int
    failed_count: int
    errors: List[str]
    upload_time: float
    product_ids: List[str]

@dataclass
class SearchResult:
    products: List[Dict[str, Any]]
    total_count: int
    page: int
    page_size: int
    search_time: float

class ManufacturerProductRepository:
    """High-performance product repository with MongoDB backend"""
    
    def __init__(self, connection_string: str = "mongodb://localhost:27017/", database_name: str = "eyewear_ml"):
        self.client = MongoClient(connection_string)
        self.db = self.client[database_name]
        self.products_collection = self.db.products
        self.manufacturers_collection = self.db.manufacturers
        
        # Create indexes for performance
        self._create_indexes()
    
    def _create_indexes(self):
        """Create database indexes for optimal performance"""
        # Product indexes
        self.products_collection.create_index([("manufacturer_id", 1)])
        self.products_collection.create_index([("sku", 1), ("manufacturer_id", 1)], unique=True)
        self.products_collection.create_index([("name", "text"), ("brand", "text"), ("category", "text")])
        self.products_collection.create_index([("created_at", -1)])
        
        # Compound indexes for complex queries
        self.products_collection.create_index([
            ("manufacturer_id", 1),
            ("category", 1),
            ("created_at", -1)
        ])
    
    async def bulk_upload_products(self, manufacturer_id: str, products: List[Dict[str, Any]]) -> ProductUploadResult:
        """Bulk upload products with performance optimization"""
        start_time = time.time()
        
        try:
            # Validate manufacturer exists
            manufacturer = await self._get_manufacturer(manufacturer_id)
            if not manufacturer:
                return ProductUploadResult(
                    success_count=0,
                    failed_count=len(products),
                    errors=["Manufacturer not found"],
                    upload_time=time.time() - start_time,
                    product_ids=[]
                )
            
            # Prepare products for insertion
            prepared_products = []
            errors = []
            
            for i, product in enumerate(products):
                try:
                    prepared_product = await self._prepare_product_for_insertion(manufacturer_id, product)
                    prepared_products.append(prepared_product)
                except Exception as e:
                    errors.append(f"Product {i}: {str(e)}")
            
            # Bulk insert with ordered=False for better performance
            if prepared_products:
                try:
                    result = self.products_collection.insert_many(prepared_products, ordered=False)
                    product_ids = [str(id) for id in result.inserted_ids]
                    success_count = len(result.inserted_ids)
                except pymongo.errors.BulkWriteError as e:
                    # Handle partial success
                    success_count = len(e.details.get('writeErrors', []))
                    product_ids = []
                    for error in e.details.get('writeErrors', []):
                        errors.append(f"Insert error: {error.get('errmsg', 'Unknown error')}")
            else:
                success_count = 0
                product_ids = []
            
            upload_time = time.time() - start_time
            
            return ProductUploadResult(
                success_count=success_count,
                failed_count=len(products) - success_count,
                errors=errors,
                upload_time=upload_time,
                product_ids=product_ids
            )
            
        except Exception as e:
            return ProductUploadResult(
                success_count=0,
                failed_count=len(products),
                errors=[f"Bulk upload failed: {str(e)}"],
                upload_time=time.time() - start_time,
                product_ids=[]
            )
    
    async def search_products(self, manufacturer_id: str, query: str = "", filters: Dict[str, Any] = None, 
                            page: int = 1, page_size: int = 20) -> SearchResult:
        """Advanced product search with filtering and pagination"""
        start_time = time.time()
        
        # Build search criteria
        search_criteria = {"manufacturer_id": ObjectId(manufacturer_id)}
        
        # Text search
        if query:
            search_criteria["$text"] = {"$search": query}
        
        # Apply filters
        if filters:
            if "category" in filters:
                search_criteria["category"] = filters["category"]
            
            if "brand" in filters:
                search_criteria["brand"] = filters["brand"]
            
            if "price_range" in filters:
                price_filter = {}
                if "min" in filters["price_range"]:
                    price_filter["$gte"] = filters["price_range"]["min"]
                if "max" in filters["price_range"]:
                    price_filter["$lte"] = filters["price_range"]["max"]
                if price_filter:
                    search_criteria["price"] = price_filter
            
            if "date_range" in filters:
                date_filter = {}
                if "start" in filters["date_range"]:
                    date_filter["$gte"] = filters["date_range"]["start"]
                if "end" in filters["date_range"]:
                    date_filter["$lte"] = filters["date_range"]["end"]
                if date_filter:
                    search_criteria["created_at"] = date_filter
        
        # Execute search with pagination
        skip = (page - 1) * page_size
        
        cursor = self.products_collection.find(search_criteria).skip(skip).limit(page_size)
        
        # Sort by relevance if text search, otherwise by creation date
        if query:
            cursor = cursor.sort([("score", {"$meta": "textScore"})])
        else:
            cursor = cursor.sort([("created_at", -1)])
        
        products = list(cursor)
        
        # Convert ObjectIds to strings
        for product in products:
            product["_id"] = str(product["_id"])
            product["manufacturer_id"] = str(product["manufacturer_id"])
        
        # Get total count
        total_count = self.products_collection.count_documents(search_criteria)
        
        search_time = time.time() - start_time
        
        return SearchResult(
            products=products,
            total_count=total_count,
            page=page,
            page_size=page_size,
            search_time=search_time
        )
    
    async def analyze_product_compatibility(self, product_id: str) -> Dict[str, Any]:
        """Analyze product compatibility using ML services"""
        # Get product data
        product = self.products_collection.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise ValueError(f"Product {product_id} not found")
        
        # TODO: Integrate with ML services
        # For now, return mock analysis
        analysis = {
            "face_shape_compatibility": {
                "round": 0.8,
                "oval": 0.9,
                "square": 0.7,
                "heart": 0.6,
                "diamond": 0.5
            },
            "style_score": 0.85,
            "target_demographics": ["young_professional", "fashion_forward"],
            "color_compatibility": {
                "skin_tone_warm": 0.7,
                "skin_tone_cool": 0.8,
                "skin_tone_neutral": 0.9
            },
            "analyzed_at": datetime.utcnow(),
            "confidence_score": 0.82
        }
        
        # Update product with analysis
        self.products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"ml_analysis": analysis}}
        )
        
        return analysis
    
    async def _prepare_product_for_insertion(self, manufacturer_id: str, product: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare product data for database insertion"""
        
        # Validate required fields
        required_fields = ["sku", "name", "brand", "category"]
        for field in required_fields:
            if field not in product:
                raise ValueError(f"Missing required field: {field}")
        
        # Prepare product document
        prepared_product = {
            "manufacturer_id": ObjectId(manufacturer_id),
            "sku": product["sku"],
            "name": product["name"],
            "brand": product["brand"],
            "category": product["category"],
            "description": product.get("description", ""),
            "price": product.get("price", 0.0),
            "currency": product.get("currency", "USD"),
            "dimensions": product.get("dimensions", {}),
            "materials": product.get("materials", []),
            "colors": product.get("colors", []),
            "images": product.get("images", []),
            "metadata": product.get("metadata", {}),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "is_active": True
        }
        
        return prepared_product
    
    async def _get_manufacturer(self, manufacturer_id: str) -> Optional[Dict[str, Any]]:
        """Get manufacturer by ID"""
        try:
            return self.manufacturers_collection.find_one({"_id": ObjectId(manufacturer_id)})
        except:
            return None
    
    async def get_product_statistics(self, manufacturer_id: str) -> Dict[str, Any]:
        """Get product statistics for manufacturer"""
        pipeline = [
            {"$match": {"manufacturer_id": ObjectId(manufacturer_id)}},
            {"$group": {
                "_id": None,
                "total_products": {"$sum": 1},
                "categories": {"$addToSet": "$category"},
                "brands": {"$addToSet": "$brand"},
                "avg_price": {"$avg": "$price"},
                "latest_upload": {"$max": "$created_at"}
            }}
        ]
        
        result = list(self.products_collection.aggregate(pipeline))
        
        if result:
            stats = result[0]
            stats.pop("_id", None)
            return stats
        else:
            return {
                "total_products": 0,
                "categories": [],
                "brands": [],
                "avg_price": 0,
                "latest_upload": None
            }
```

**Test Validation:**
```bash
# Run product repository performance tests
python -m pytest tests/manufacturer_role/test_product_repository_performance.py::TestProductRepositoryPerformance::test_bulk_upload_performance -v
```

**Success Criteria:**
- Bulk upload achieves >30 products/second
- Search queries respond in <100ms
- Database indexes properly optimized
- All product repository tests pass

---

## 📋 Phase 3: Agentic Onboarding Implementation

### Step 3.1: Implement Agentic Onboarding Manager

**Objective**: Build intelligent onboarding with personalization and A/B testing

**File**: [`src/merchant-onboarding/agentic_onboarding_manager.py`](src/merchant-onboarding/agentic_onboarding_manager.py)

**Implementation:**
```python
import asyncio
import json
import random
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum

class OnboardingStepType(Enum):
    WELCOME = "welcome"
    PROFILE_COLLECTION = "profile_collection"
    FEATURE_INTRODUCTION = "feature_introduction"
    PRODUCT_UPLOAD_DEMO = "product_upload_demo"
    ML_TOOLS_DEMO = "ml_tools_demo"
    UPGRADE_PROMPT = "upgrade_prompt"
    COMPLETION = "completion"

@dataclass
class OnboardingStep:
    step_id: str
    step_type: OnboardingStepType
    title: str
    content: str
    actions: List[Dict[str, Any]]
    estimated_duration: int  # seconds
    personalization_data: Dict[str, Any]
    ab_variant: Optional[str] = None

@dataclass
class OnboardingFlow:
    flow_id: str
    manufacturer_id: str
    steps: List[OnboardingStep]
    current_step_index: int
    personalization_profile: Dict[str, Any]
    ab_test_variants: Dict[str, str]
    created_at: datetime
    estimated_completion_time: int

@dataclass
class ManufacturerProfile:
    manufacturer_id: str
    company_name: str
    company_size: str
    annual_revenue: Optional[float]
    product_count_estimate: int
    primary_market: str
    tech_savviness: str
    industry_experience: str
    goals: List[str]

class AgenticOnboardingManager:
    """Intelligent onboarding manager with personalization and A/B testing"""
    
    def __init__(self):
        self._flow_templates = self._build_flow_templates()
        self._ab_test_variants = self._build_ab_test_variants()
        self._personalization_rules = self._build_personalization_rules()
        self._active_flows: Dict[str, OnboardingFlow] = {}
    
    def _build_flow_templates(self) -> Dict[str, List[OnboardingStep]]:
        """Build onboarding flow templates for different manufacturer types"""
        return {
            "enterprise": [
                OnboardingStep(
                    step_id="welcome_enterprise",
                    step_type=OnboardingStepType.WELCOME,
                    title="Welcome to Enterprise Eyewear ML",
                    content="Accelerate your enterprise eyewear business with AI-powered insights",
                    actions=[{"type": "continue", "label": "Get Started"}],
                    estimated_duration=30,
                    personalization_data={"focus": "enterprise_features"}
                ),
                OnboardingStep(
                    step_id="profile_enterprise",
                    step_type=OnboardingStepType.PROFILE_COLLECTION,
                    title="Tell us about your enterprise",
                    content="Help us customize your experience for maximum ROI",
                    actions=[{"type": "form", "fields": ["integration_needs", "team_size", "current_tools"]}],
                    estimated_duration=180,
                    personalization_data={"depth": "detailed"}
                ),
                OnboardingStep(
                    step_id="features_enterprise",
                    step_type=OnboardingStepType.FEATURE_INTRODUCTION,
                    title="Enterprise Features Overview",
                    content="Discover advanced analytics, API access, and white-label solutions",
                    actions=[{"type": "interactive_tour", "features": ["advanced_analytics", "api_access", "white_label"]}],
                    estimated_duration=300,
                    personalization_data={"feature_set": "enterprise"}
                )
            ],
            "professional": [
                OnboardingStep(
                    step_id="welcome_professional",
                    step_type=OnboardingStepType.WELCOME,
                    title="Welcome to Professional Eyewear ML",
                    content="Grow your eyewear business with professional-grade ML tools",
                    actions=[{"type": "continue", "label": "Start Journey"}],
                    estimated_duration=30,
                    personalization_data={"focus": "growth_tools"}
                ),
                OnboardingStep(
                    step_id="profile_professional",
                    step_type=OnboardingStepType.PROFILE_COLLECTION,
                    title="Your business profile",
                    content="Let's understand your business to provide relevant recommendations",
                    actions=[{"type": "form", "fields": ["business_goals", "current_challenges", "growth_stage"]}],
                    estimated_duration=120,
                    personalization_data={"depth": "moderate"}
                ),
                OnboardingStep(
                    step_id="upload_demo_professional",
                    step_type=OnboardingStepType.PRODUCT_UPLOAD_DEMO,
                    title="Upload your first products",
                    content="See how easy it is to upload and analyze your eyewear catalog",
                    actions=[{"type": "guided_upload", "max_products": 10}],
                    estimated_duration=240,
                    personalization_data={"demo_type": "guided"}
                )
            ],
            "startup": [
                OnboardingStep(
                    step_id="welcome_startup",
                    step_type=OnboardingStepType.WELCOME,
                    title="Welcome to Eyewear ML",
                    content="Start your eyewear business journey with AI-powered insights",
                    actions=[{"type": "continue", "label": "Let's Begin"}],
                    estimated_duration=20,
                    personalization_data={"focus": "getting_started"}
                ),
                OnboardingStep(
                    step_id="profile_startup",
                    step_type=OnboardingStepType.PROFILE_COLLECTION,
                    title="Quick setup",
                    content="A few quick questions to get you started",
                    actions=[{"type": "form", "fields": ["business_stage", "target_market", "immediate_needs"]}],
                    estimated_duration=90,
                    personalization_data={"depth": "basic"}
                ),
                OnboardingStep(
                    step_id="ml_demo_startup",
                    step_type=OnboardingStepType.ML_TOOLS_DEMO,
                    title="See ML in action",
                    content="Watch how our AI analyzes face shapes and recommends perfect fits",
                    actions=[{"type": "interactive_demo", "demo_type": "face_shape_analysis"}],
                    estimated_duration=180,
                    personalization_data={"demo_complexity": "simple"}
                )
            ]
        }
    
    def _build_ab_test_variants(self) -> Dict[str, Dict[str, Any]]:
        """Build A/B testing variants for optimization"""
        return {
            "welcome_message": {
                "variant_a": {
                    "title": "Welcome to Eyewear ML",
                    "content": "Transform your eyewear business with AI-powered insights",
                    "cta": "Get Started"
                },
                "variant_b": {
                    "title": "Boost Your Eyewear Sales",
                    "content": "Increase conversions by 40% with personalized recommendations",
                    "cta": "Start Free Trial"
                }
            },
            "upgrade_prompt": {
                "variant_a": {
                    "timing": "after_demo",
                    "message": "Unlock advanced features with Professional plan",
                    "incentive": "14-day free trial"
                },
                "variant_b": {
                    "timing": "after_value_demonstration",
                    "message": "Ready to scale? Upgrade for unlimited access",
                    "incentive": "50% off first month"
                }
            },
            "feature_introduction": {
                "variant_a": {
                    "approach": "feature_focused",
                    "content": "Explore our powerful ML tools and analytics"
                },
                "variant_b": {
                    "approach": "benefit_focused",
                    "content": "See how customers increased sales by 40% with our platform"
                }
            }
        }
    
    def _build_personalization_rules(self) -> Dict[str, Any]:
        """Build personalization rules based on manufacturer profiles"""
        return {
            "company_size": {
                "startup": {"flow_template": "startup", "focus": "simplicity"},
                "small": {"flow_template": "professional", "focus": "growth"},
                "medium": {"flow_template": "professional", "focus": "efficiency"},
                "large": {"flow_template": "enterprise", "focus": "scale"},
                "enterprise": {"flow_template": "enterprise", "focus": "integration"}
            },
            "tech_savviness": {
                "beginner": {"complexity": "low", "guidance": "high"},
                "intermediate": {"complexity": "medium", "guidance": "medium"},
                "advanced": {"complexity": "high", "guidance": "low"}
            },
            "industry_experience": {
                "new": {"education_level": "high", "demo_depth": "detailed"},
                "experienced": {"education_level": "low", "demo_depth": "overview"},
                "expert": {"education_level": "minimal", "demo_depth": "technical"}
            }
        }
    
    async def generate_personalized_flow(self, profile: ManufacturerProfile) -> OnboardingFlow:
        """Generate personalized onboarding flow based on manufacturer profile"""
        
        # 1. Analyze manufacturer profile
        analysis = await self._analyze_manufacturer_profile(profile)
        
        # 2. Select appropriate flow template
        flow_template = self._select_flow_template(analysis)
        
        # 3. Personalize steps based on profile
        personalized_steps = await self._personalize_steps(flow_template, profile, analysis)
        
        # 4. Apply A/B testing variants
        ab_variants = await self._assign_ab_test_variants(profile.manufacturer_id)
        optimized_steps = await self._apply_ab_variants(personalized_steps, ab_variants)
        
        # 5. Calculate estimated completion time
        estimated_time = sum(step.estimated_duration for step in optimized_steps)
        
        # 6. Create flow
        flow = OnboardingFlow(
            flow_id=f"flow_{profile.manufacturer_id}_{int(datetime.utcnow().timestamp())}",
            manufacturer_id=profile.manufacturer_id,
            steps=optimized_steps,
            current_step_index=0,
            personalization_profile=analysis,
            ab_test_variants=ab_variants,
            created_at=datetime.utcnow(),
            estimated_completion_time=estimated_time
        )
        
        # 7. Store active flow
        self._active_flows[profile.manufacturer_id] = flow
        
        # 8. Track flow generation
        await self._track_flow_generation(profile.manufacturer_id, flow, analysis)
        
        return flow
    
    async def _analyze_manufacturer_profile(self, profile: ManufacturerProfile) -> Dict[str, Any]:
        """Analyze manufacturer profile to determine optimal onboarding strategy"""
        
        # Calculate complexity score
        complexity_factors = {
            "company_size": {"startup": 1, "small": 2, "medium": 3, "large": 4, "enterprise": 5},
            "tech_savviness": {"beginner": 1, "intermediate": 3, "advanced": 5},
            "product_count": min(profile.product_count_estimate / 1000, 5)
        }
        
        complexity_score = (
            complexity_factors["company_size"].get(profile.company_size, 2) +
            complexity_factors["tech_savviness"].get(profile.tech_savviness, 2) +
            complexity_factors["product_count"]
        ) / 3
        
        # Predict conversion probability using simple heuristics
        conversion_factors = {
            "company_size_score": complexity_factors["company_size"].get(profile.company_size, 2) * 0.2,
            "revenue_score": min((profile.annual_revenue or 0) / 1000000, 1) * 0.3,
            "product_volume_score": min(profile.product_count_estimate / 5000, 1) * 0.3,
            "goals_alignment_score": len([g for g in profile.goals if g in ["increase_sales", "improve_efficiency", "scale_business"]]) * 0.2
        }
        
        conversion_probability = sum(conversion_factors.values())
        
        # Determine recommended flow type
        if profile.company_size in ["large", "enterprise"]:
            flow_type = "enterprise"
        elif profile.company_size in ["medium", "small"] and conversion_probability > 0.6:
            flow_type = "professional"
        else:
            flow_type = "startup"
        
        # Identify key value propositions
        value_props = []
        if "increase_sales" in profile.goals:
            value_props.append("conversion_optimization")
        if "improve_efficiency" in profile.goals:
            value_props.append("automation_tools")
        if "scale_business" in profile.goals:
            value_props.append("enterprise_features")
        if profile.product_count_estimate > 1000:
            value_props.append("bulk_operations")
        
        return {
            "complexity_score": complexity_score,
            "conversion_probability": conversion_probability,
            "recommended_flow_type": flow_type,
            "key_value_propositions": value_props,
            "personalization_factors": {
                "company_size": profile.company_size,
                "tech_savviness": profile.tech_savviness,
                "industry_experience": profile.industry_experience,
                "primary_market": profile.primary_market
            }
        }
    
    def _select_flow_template(self, analysis: Dict[str, Any]) -> List[OnboardingStep]:
        """Select appropriate flow template based on analysis"""
        flow_type = analysis["recommended_flow_type"]
        return self._flow_templates.get(flow_type, self._flow_templates["startup"])
    
    async def _personalize_steps(self, template_steps: List[OnboardingStep], 
                                profile: ManufacturerProfile, analysis: Dict[str, Any]) -> List[OnboardingStep]:
        """Personalize onboarding steps based on profile and analysis"""
        
        personalized_steps = []
        
        for step in template_steps:
            # Create a copy of the step
            personalized_step = OnboardingStep(
                step_id=step.step_id,
                step_type=step.step_type,
                title=step.title,
                content=step.content,
                actions=step.actions.copy(),
                estimated_duration=step.estimated_duration,
                personalization_data=step.personalization_data.copy()
            )
            
            # Apply personalization based on profile
            if step.step_type == OnboardingStepType.WELCOME:
                personalized_step.content = self._personalize_welcome_message(step.content, profile, analysis)
            
            elif step.step_type == OnboardingStepType.FEATURE_INTRODUCTION:
                personalized_step.actions = self._personalize_feature_introduction(step.actions, analysis)
            
            elif step.step_type == OnboardingStepType.PRODUCT_UPLOAD_DEMO:
                personalized_step = self._personalize_upload_demo(personalized_step, profile)
            
            elif step.step_type == OnboardingStepType.ML_TOOLS_DEMO:
                personalized_step = self._personalize_ml_demo(personalized_step, profile, analysis)
            
            # Adjust duration based on tech savviness
            if profile.tech_savviness == "beginner":
                personalized_step.estimated_duration = int(personalized_step.estimated_duration * 1.5)
            elif profile.tech_savviness == "advanced":
                personalized_step.estimated_duration = int(personalized_step.estimated_duration * 0.7)
            
            personalized_steps.append(personalized_step)
        
        # Add upgrade prompt if conversion probability is high
        if analysis["conversion_probability"] > 0.7:
            upgrade_step = self._create_upgrade_prompt_step(profile, analysis)
            # Insert before completion
            personalized_steps.insert(-1, upgrade_step)
        
        return personalized_steps
    
    def _personalize_welcome_message(self, content: str, profile: ManufacturerProfile, analysis: Dict[str, Any]) -> str:
        """Personalize welcome message based on profile"""
        
        if "increase_sales" in profile.goals:
            return f"Welcome {profile.company_name}! Ready to boost your eyewear sales with AI-powered recommendations?"
        elif "improve_efficiency" in profile.goals:
            return f"Welcome {profile.company_name}! Streamline your eyewear operations with intelligent automation."
        elif "scale_business" in profile.goals:
            return f"Welcome {profile.company_name}! Scale your eyewear business with enterprise-grade ML tools."
        else:
            return f"Welcome {profile.company_name}! Transform your eyewear business with AI-powered insights."
    
    def _personalize_feature_introduction(self, actions: List[Dict[str, Any]], analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Personalize feature introduction based on analysis"""
        
        personalized_actions = []
        
        for action in actions:
            if action.get("type") == "interactive_tour":
                # Customize features based on value propositions
                features = []
                for value_prop in analysis["key_value_propositions"]:
                    if value_prop == "conversion_optimization":
                        features.append("recommendation_engine")
                    elif value_prop == "automation_tools":
                        features.append("bulk_operations")
                    elif value_prop == "enterprise_features":
                        features.extend(["api_access", "advanced_analytics"])
                
                action["features"] = features or action.get("features", [])
            
            personalized_actions.append(action)
        
        return personalized_actions
    
    async def _assign_ab_test_variants(self, manufacturer_id: str) -> Dict[str, str]:
        """Assign A/B testing variants for manufacturer"""
        
        # Use manufacturer ID for consistent variant assignment
        random.seed(hash(manufacturer_id))
        
        variants = {}
        for test_name in self._ab_test_variants.keys():
            variant_key = random.choice(["variant_a", "variant_b"])
            variants[test_name] = variant_key
        
        return variants
    
    async def _track_flow_generation(self, manufacturer_id: str, flow: OnboardingFlow, analysis: Dict[str, Any]) -> None:
        """Track flow generation for analytics"""
        
        # TODO: Implement real analytics tracking
        tracking_data = {
            "event": "onboarding_flow_generated",
            "manufacturer_id": manufacturer_id,
            "flow_id": flow.flow_id,
            "flow_type": analysis["recommended_flow_type"],
            "complexity_score": analysis["complexity_score"],
            "conversion_probability": analysis["conversion_probability"],
            "ab_variants": flow.ab_test_variants,
            "estimated_completion_time": flow.estimated_completion_time,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        print(f"📊 Flow Generated: {json.dumps(tracking_data, indent=2)}")
    
    async def process_step_completion(self, manufacturer_id: str, step_id: str, step_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process step completion and determine next step"""
        
        if manufacturer_id not in self._active_flows:
            raise ValueError(f"No active flow found for manufacturer {manufacturer_id}")
        
        flow = self._active_flows[manufacturer_id]
        
        # Find current step
        current_step = None
        for i, step in enumerate(flow.steps):
            if step.step_id == step_id:
                current_step = step
                flow.current_step_index = i
                break
        
        if not current_step:
            raise ValueError(f"Step {step_id} not found in flow")
        
        # Process step data
        await self._process_step_data(manufacturer_id, current_step, step_data)
        
        # Determine next step
        next_step_index = flow.current_step_index + 1
        
        if next_step_index < len(flow.steps):
            next_step = flow.steps[next_step_index]
            flow.current_step_index = next_step_index
            
            return {
                "status": "continue",
                "next_step": {
                    "step_id": next_step.step_id,
                    "step_type": next_step.step_type.value,
                    "title": next_step.title,
                    "content": next_step.content,
                    "actions": next_step.actions,
                    "estimated_duration": next_step.estimated_duration
                },
                "progress": {
                    "current_step": next_step_index + 1,
                    "total_steps": len(flow.steps),
                    "completion_percentage": int((next_step_index + 1) / len(flow.steps) * 100)
                }
            }
        else:
            # Flow completed
            await self._complete_onboarding_flow(manufacturer_id, flow)
            
            return {
                "status": "completed",
                "completion_data": {
                    "flow_id": flow.flow_id,
                    "completed_at": datetime.utcnow().isoformat(),
                    "total_duration": (datetime.utcnow() - flow.created_at).total_seconds()
                }
            }
    
    async def _process_step_data(self, manufacturer_id: str, step: OnboardingStep, step_data: Dict[str, Any]) -> None:
        """Process data collected from step completion"""
        
        # TODO: Implement real data processing and storage
        processing_data = {
            "manufacturer_id": manufacturer_id,
            "step_id": step.step_id,
            "step_type": step.step_type.value,
            "step_data": step_data,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        print(f"📝 Step Completed: {json.dumps(processing_data, indent=2)}")
    
    async def _complete_onboarding_flow(self, manufacturer_id: str, flow: OnboardingFlow) -> None:
        """Complete onboarding flow and trigger follow-up actions"""
        
        # Remove from active flows
        self._active_flows.pop(manufacturer_id, None)
        
        # TODO: Implement completion actions
        completion_data = {
            "event": "onboarding_flow_completed",
            "manufacturer_id": manufacturer_id,
            "flow_id": flow.flow_id,
            "total_duration": (datetime.utcnow() - flow.created_at).total_seconds(),
            "ab_variants": flow.ab_test_variants,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        print(f"🎉 Onboarding Completed: {json.dumps(completion_data, indent=2)}")
```

**Test Validation:**
```bash
# Run agentic onboarding tests
python -m pytest tests/manufacturer_role/test_agentic_conversion_tracking.py::TestAgenticConversionTracking::test_personalized_onboarding_flow_generation -v
```

**Success Criteria:**
- Onboarding flows adapt to manufacturer profiles
- A/B testing variants properly assigned
- Personalization rules correctly applied
- All agentic onboarding tests pass

---

## 📋 Phase 4: ML Integration Implementation

### Step 4.1: Implement ML Service Manager

**Objective**: Integrate with existing ML services for face shape analysis and recommendations

**File**: [`src/ml_integration/ml_service_manager.py`](src/ml_integration/ml_service_manager.py)

**Implementation:**
```python
import asyncio
import time
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
from enum import Enum

class MLServiceType(Enum):
    FACE_SHAPE_ANALYSIS = "face_shape_analysis"
    STYLE_MATCHING = "style_matching"
    VIRTUAL_TRY_ON = "virtual_try_on"
    RECOMMENDATION_ENGINE = "recommendation_engine"

@dataclass
class MLAnalysisResult:
    service_type: MLServiceType
    product_id: str
    analysis_data: Dict[str, Any]
    confidence_score: float
    processing_time: float
    analyzed_at: datetime

@dataclass
class BatchAnalysisResult:
    batch_id: str
    manufacturer_id: str
    total_products: int
    successful_analyses: int
    failed_analyses: int
    results: List[MLAnalysisResult]
    total_processing_time: float
    started_at: datetime
    completed_at: datetime

class MLServiceManager:
    """Manager for ML service integration with performance optimization"""
    
    def __init__(self):
        self._service_endpoints = self._configure_service_endpoints()
        self._service_health = {}
        self._analysis_cache = {}
        self._batch_queue = asyncio.Queue()
        self._processing_stats = {
            "total_analyses": 0,
            "successful_analyses": 0,
            "failed_analyses": 0,
            "average_processing_time": 0.0
        }
    
    def _configure_service_endpoints(self) -> Dict[MLServiceType, Dict[str, Any]]:
        """Configure ML service endpoints and settings"""
        return {
            MLServiceType.FACE_SHAPE_ANALYSIS: {
                "endpoint": "http://localhost:8001/api/face-analysis",
                "timeout": 5.0,
                "retry_attempts": 3,
                "cache_ttl": 3600  # 1 hour
            },
            MLServiceType.STYLE_MATCHING: {
                "endpoint": "http://localhost:8002/api/style-matching",
                "timeout": 3.0,
                "retry_attempts": 2,
                "cache_ttl": 1800  # 30 minutes
            },
            MLServiceType.VIRTUAL_TRY_ON: {
                "endpoint": "http://localhost:8003/api/virtual-try-on",
                "timeout": 10.0,
                "retry_attempts": 2,
                "cache_ttl": 7200  # 2 hours
            },
            MLServiceType.RECOMMENDATION_ENGINE: {
                "endpoint": "http://localhost:8004/api/recommendations",
                "timeout": 2.0,
                "retry_attempts": 3,
                "cache_ttl": 900  # 15 minutes
            }
        }
    
    async def analyze_product_compatibility(self, product_id: str, product_data: Dict[str, Any]) -> MLAnalysisResult:
        """Analyze single product compatibility using face shape analysis"""
        
        start_time = time.time()
        
        # Check cache first
        cache_key = f"face_analysis_{product_id}"
        if cache_key in self._analysis_cache:
            cached_result = self._analysis_cache[cache_key]
            if (datetime.utcnow() - cached_result["timestamp"]).total_seconds() < 3600:
                return MLAnalysisResult(
                    service_type=MLServiceType.FACE_SHAPE_ANALYSIS,
                    product_id=product_id,
                    analysis_data=cached_result["data"],
                    confidence_score=cached_result["confidence"],
                    processing_time=time.time() - start_time,
                    analyzed_at=datetime.utcnow()
                )
        
        try:
            # Perform face shape analysis
            analysis_data = await self._call_face_shape_analysis_service(product_data)
            
            # Calculate confidence score based on data quality
            confidence_score = self._calculate_confidence_score(product_data, analysis_data)
            
            # Cache result
            self._analysis_cache[cache_key] = {
                "data": analysis_data,
                "confidence": confidence_score,
                "timestamp": datetime.utcnow()
            }
            
            # Update stats
            self._update_processing_stats(True, time.time() - start_time)
            
            return MLAnalysisResult(
                service_type=MLServiceType.FACE_SHAPE_ANALYSIS,
                product_id=product_id,
                analysis_data=analysis_data,
                confidence_score=confidence_score,
                processing_time=time.time() - start_time,
                analyzed_at=datetime.utcnow()
            )
            
        except Exception as e:
            # Update stats for failure
            self._update_processing_stats(False, time.time() - start_time)
            
            # Return fallback analysis
            return await self._generate_fallback_analysis(product_id, product_data, start_time)
    
    async def _call_face_shape_analysis_service(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Call face shape analysis ML service"""
        
        # TODO: Implement real ML service call
        # For now, return mock analysis based on product dimensions
        
        dimensions = product_data.get("dimensions", {})
        lens_width = dimensions.get("lens_width", 50)
        frame_width = dimensions.get("frame_width", 140)
        frame_height = dimensions.get("frame_height", 40)
        
        # Calculate compatibility scores based on frame geometry
        aspect_ratio = frame_width / frame_height if frame_height > 0 else 3.5
        
        # Mock analysis based on frame characteristics
        analysis = {
            "face_shape_compatibility": {
                "round": max(0.1, min(0.9, (aspect_ratio - 2.5) * 0.3 + 0.5)),
                "oval": 0.8,  # Oval faces work with most frames
                "square": max(0.1, min(0.9, (4.0 - aspect_ratio) * 0.3 + 0.4)),
                "heart": max(0.1, min(0.9, (aspect_ratio - 3.0) * 0.2 + 0.6)),
                "diamond": max(0.1, min(0.9, (3.5 - abs(aspect_ratio - 3.5)) * 0.4 + 0.3))
            },
            "style_characteristics": {
                "frame_style": self._determine_frame_style(dimensions),
                "formality_score": self._calculate_formality_score(product_data),
                "versatility_score": self._calculate_versatility_score(dimensions)
            },
            "target_demographics": self._determine_target_demographics(product_data),
            "color_compatibility": {
                "skin_tone_warm": 0.7,
                "skin_tone_cool": 0.8,
                "skin_tone_neutral": 0.9
            },
            "fit_analysis": {
                "bridge_fit": self._analyze_bridge_fit(dimensions),
                "temple_fit": self._analyze_temple_fit(dimensions),
                "overall_comfort": self._calculate_comfort_score(dimensions)
            }
        }
        
        # Simulate processing delay
        await asyncio.sleep(0.1)
        
        return analysis
    
    def _determine_frame_style(self, dimensions: Dict[str, Any]) -> str:
        """Determine frame style based on dimensions"""
        frame_width = dimensions.get("frame_width", 140)
        frame_height = dimensions.get("frame_height", 40)
        
        if frame_height > 45:
            return "oversized"
        elif frame_height < 35:
            return "narrow"
        elif frame_width > 145:
            return "wide"
        elif frame_width < 135:
            return "compact"
        else:
            return "standard"
    
    def _calculate_formality_score(self, product_data: Dict[str, Any]) -> float:
        """Calculate formality score based on product characteristics"""
        category = product_data.get("category", "").lower()
        materials = product_data.get("materials", [])
        
        formality_factors = {
            "business": 0.9,
            "professional": 0.8,
            "classic": 0.7,
            "casual": 0.3,
            "sport": 0.2,
            "fashion": 0.5
        }
        
        base_score = 0.5
        for category_term, score in formality_factors.items():
            if category_term in category:
                base_score = score
                break
        
        # Adjust based on materials
        if "metal" in materials:
            base_score += 0.1
        if "titanium" in materials:
            base_score += 0.2
        if "plastic" in materials:
            base_score -= 0.1
        
        return max(0.0, min(1.0, base_score))
    
    def _calculate_versatility_score(self, dimensions: Dict[str, Any]) -> float:
        """Calculate versatility score based on frame dimensions"""
        frame_width = dimensions.get("frame_width", 140)
        frame_height = dimensions.get("frame_height", 40)
        
        # Standard dimensions are more versatile
        width_score = 1.0 - abs(frame_width - 140) / 20
        height_score = 1.0 - abs(frame_height - 40) / 10
        
        return max(0.0, min(1.0, (width_score + height_score) / 2))
    
    def _determine_target_demographics(self, product_data: Dict[str, Any]) -> List[str]:
        """Determine target demographics based on product characteristics"""
        demographics = []
        
        category = product_data.get("category", "").lower()
        price = product_data.get("price", 0)
        
        # Age demographics
        if "youth" in category or "teen" in category:
            demographics.append("young_adult")
        elif "classic" in category or "traditional" in category:
            demographics.append("mature_adult")
        else:
            demographics.append("general_adult")
        
        # Style demographics
        if "fashion" in category or "trendy" in category:
            demographics.append("fashion_forward")
        elif "business" in category or "professional" in category:
            demographics.append("professional")
        elif "sport" in category or "active" in category:
            demographics.append("active_lifestyle")
        
        # Price demographics
        if price > 300:
            demographics.append("premium_buyer")
        elif price > 150:
            demographics.append("mid_market")
        else:
            demographics.append("value_conscious")
        
        return demographics
    
    def _analyze_bridge_fit(self, dimensions: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze bridge fit characteristics"""
        bridge_width = dimensions.get("bridge_width", 18)
        
        return {
            "bridge_width": bridge_width,
            "fit_category": "narrow" if bridge_width < 16 else "wide" if bridge_width > 20 else "standard",
            "comfort_score": max(0.0, min(1.0, 1.0 - abs(bridge_width - 18) / 5))
        }
    
    def _analyze_temple_fit(self, dimensions: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze temple fit characteristics"""
        temple_length = dimensions.get("temple_length", 145)
        
        return {
            "temple_length": temple_length,
            "fit_category": "short" if temple_length < 140 else "long" if temple_length > 150 else "standard",
            "comfort_score": max(0.0, min(1.0, 1.0 - abs(temple_length - 145) / 10))
        }
    
    def _calculate_comfort_score(self, dimensions: Dict[str, Any]) -> float:
        """Calculate overall comfort score"""
        bridge_fit = self._analyze_bridge_fit(dimensions)
        temple_fit = self._analyze_temple_fit(dimensions)
        
        return (bridge_fit["comfort_score"] + temple_fit["comfort_score"]) / 2
    
    def _calculate_confidence_score(self, product_data: Dict[str, Any], analysis_data: Dict[str, Any]) -> float:
        """Calculate confidence score based on data quality and analysis completeness"""
        
        # Base confidence
        confidence = 0.5
        
        # Increase confidence based on available data
        if product_data.get("dimensions"):
            confidence += 0.2
        if product_data.get("materials"):
            confidence += 0.1
        if product_data.get("category"):
            confidence += 0.1
        if product_data.get("images"):
            confidence += 0.1
        
        # Increase confidence based on analysis completeness
        if analysis_data.get("face_shape_compatibility"):
            confidence += 0.1
        if analysis_data.get("style_characteristics"):
            confidence += 0.1
        if analysis_data.get("fit_analysis"):
            confidence += 0.1
        
        return max(0.0, min(1.0, confidence))
    
    async def _generate_fallback_analysis(self, product_id: str, product_data: Dict[str, Any], start_time: float) -> MLAnalysisResult:
        """Generate fallback analysis when ML service fails"""
        
        fallback_analysis = {
            "face_shape_compatibility": {
                "round": 0.6,
                "oval": 0.8,
                "square": 0.6,
                "heart": 0.6,
                "diamond": 0.5
            },
            "style_characteristics": {
                "frame_style": "standard",
                "formality_score": 0.5,
                "versatility_score": 0.7
            },
            "target_demographics": ["general_adult"],
            "color_compatibility": {
                "skin_tone_warm": 0.7,
                "skin_tone_cool": 0.7,
                "skin_tone_neutral": 0.8
            },
            "fallback": True,
            "reason": "ML service unavailable"
        }
        
        return MLAnalysisResult(
            service_type=MLServiceType.FACE_SHAPE_ANALYSIS,
            product_id=product_id,
            analysis_data=fallback_analysis,
            confidence_score=0.3,  # Low confidence for fallback
            processing_time=time.time() - start_time,
            analyzed_at=datetime.utcnow()
        )
    
    async def batch_analyze_products(self, manufacturer_id: str, products: List[Dict[str, Any]]) -> BatchAnalysisResult:
        """Batch analyze multiple products for efficiency"""
        
        batch_id = f"batch_{manufacturer_id}_{int(datetime.utcnow().timestamp())}"
        started_at = datetime.utcnow()
        
        results = []
        successful_analyses = 0
        failed_analyses = 0
        
        # Process products in batches for optimal performance
        batch_size = 10
        for i in range(0, len(products), batch_size):
            batch = products[i:i + batch_size]
            
            # Process batch concurrently
            tasks = [
                self.analyze_product_compatibility(product["_id"], product)
                for product in batch
            ]
            
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in batch_results:
                if isinstance(result, Exception):
                    failed_analyses += 1
                else:
                    results.append(result)
                    successful_analyses += 1
        
        completed_at = datetime.utcnow()
        total_processing_time = (completed_at - started_at).total_seconds()
        
        return BatchAnalysisResult(
            batch_id=batch_id,
            manufacturer_id=manufacturer_id,
            total_products=len(products),
            successful_analyses=successful_analyses,
            failed_analyses=failed_analyses,
            results=results,
            total_processing_time=total_processing_time,
            started_at=started_at,
            completed_at=completed_at
        )
    
    def _update_processing_stats(self, success: bool, processing_time: float) -> None:
        """Update processing statistics"""
        self._processing_stats["total_analyses"] += 1
        
        if success:
            self._processing_stats["successful_analyses"] += 1
        else:
            self._processing_stats["failed_analyses"] += 1
        
        # Update average processing time
        total_time = (self._processing_stats["average_processing_time"] * 
                     (self._processing_stats["total_analyses"] - 1) + processing_time)
        self._processing_stats["average_processing_time"] = total_time / self._processing_stats["total_analyses"]
    
    async def get_service_health(self) -> Dict[str, Any]:
        """Get health status of all ML services"""
        
        health_status = {}
        
        for service_type in MLServiceType:
            try:
                # TODO: Implement real health check
                # For now, simulate health check
                await asyncio.sleep(0.01)
                
                health_status[service_type.value] = {
                    "status": "healthy",
                    "response_time": 0.05,
                    "last_check": datetime.utcnow().isoformat()
                }
            except Exception as e:
                health_status[service_type.value] = {
                    "status": "unhealthy",
                    "error": str(e),
                    "last_check": datetime.utcnow().isoformat()
                }
        
        return {
            "services": health_status,
            "overall_status": "healthy" if all(s["status"] == "healthy" for s in health_status.values()) else "degraded",
            "processing_stats": self._processing_stats
        }
```

**Test Validation:**
```bash
# Run ML integration tests
python -m pytest tests/manufacturer_role/test_ml_tools_integration.py::TestMLToolsIntegration::test_face_shape_analysis_integration -v
```

**Success Criteria:**
- ML analysis completes in <2 seconds per product
- Batch processing handles >100 products efficiently
- Fallback mechanisms work when services unavailable
- All ML integration tests pass

---

## 📋 Implementation Summary

### Current Status: RED PHASE COMPLETE ✅

**What We've Accomplished:**
1. ✅ **Architecture Complete**: SPARC methodology applied with comprehensive system design
2. ✅ **Test Framework Ready**: All test files exist and define expected behavior
3. ✅ **Implementation Roadmap**: Step-by-step guide with concrete code examples
4. ✅ **Agentic Elements**: Personalization, A/B testing, and adaptive flows designed

### Next Phase: GREEN PHASE 🟢

**Immediate Actions for Code Team:**

1. **Start with Security Foundation** (Week 1)
   - Implement [`ManufacturerAuthManager`](src/auth/manufacturer_auth.py) with real JWT
   - Build [`ManufacturerRBACManager`](src/auth/manufacturer_rbac.py) with tier permissions
   - Create [`ManufacturerSecurityValidator`](src/security/manufacturer_validator.py) with threat detection

2. **Build Product Repository** (Week 2)
   - Implement [`ManufacturerProductRepository`](src/eyewear_database/manufacturer_product_repository.py) with MongoDB
   - Optimize for >30 products/second upload performance
   - Add real-time search with <100ms response time

3. **Develop Agentic Onboarding** (Week 3)
   - Create [`AgenticOnboardingManager`](src/merchant-onboarding/agentic_onboarding_manager.py) with personalization
   - Build A/B testing framework for conversion optimization
   - Implement adaptive flow generation

4. **Integrate ML Services** (Week 4)
   - Build [`MLServiceManager`](src/ml_integration/ml_service_manager.py) with existing services
   - Implement batch processing for manufacturer catalogs
   - Add fallback mechanisms for service reliability

### Success Metrics

**Technical KPIs:**
- Authentication: <500ms response time ⏱️
- Product Upload: >30 products/second 📈
- Search: <100ms query response 🔍
- ML Analysis: <2 seconds per product 🧠

**Business KPIs:**
- Conversion Rate: 15-25% improvement 💰
- User Engagement: 40% increase in feature adoption 📊
- Time to Value: <24 hours for first product upload ⚡
- Customer Satisfaction: >90% satisfaction score 😊

### Quality Gates

**Before Moving to REFACTOR Phase:**
- [ ] All authentication tests pass (12 tests)
- [ ] All performance tests pass (10 tests)
- [ ] All agentic tests pass (8 tests)
- [ ] All ML integration tests pass (9 tests)
- [ ] All dashboard access tests pass (8 tests)

**Test Command:**
```bash
cd tests/manufacturer_role
python run_manufacturer_tests.py --verbose
```

---

## 🎯 Architecture Status: COMPLETE

The SPARC methodology has delivered a comprehensive architecture that addresses all requirements:

✅ **Specification**: Business and technical requirements clearly defined  
✅ **Plan**: System architecture with component boundaries and interfaces  
✅ **Act**: Implementation roadmap with concrete steps and code examples  
✅ **Reflect**: Risk assessment and mitigation strategies identified  
✅ **Critique**: Quality gates and success metrics established  

**The architecture incorporates agentic capabilities for:**
- 🤖 **User Autonomy**: Self-service onboarding with intelligent guidance
- 🔄 **Feedback Loops**: Real-time optimization based on user behavior  
- 🎯 **Adaptive Flows**: Dynamic onboarding paths based on manufacturer profile

**Ready for implementation with clear roadmap and success criteria.**