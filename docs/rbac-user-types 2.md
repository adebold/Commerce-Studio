# EyewearML RBAC Implementation and User Types

This document provides an overview of the Role-Based Access Control (RBAC) system implemented in the EyewearML platform, detailing the different user types, their permissions, and how they are verified through testing.

## User Types

The EyewearML platform supports the following user types:

### 1. Regular Users

Regular users are customers who use the platform to browse eyewear, try virtual frames, and place orders.

**Credentials:**
- Example user: `test@example.com` / `Password123!`
- Region: North America (NA)

**Permissions:**
- View and update their profile
- Browse frame catalog
- Use virtual try-on features
- Receive AI-based frame recommendations
- Place and track orders
- Access order history

**Dashboard Elements:**
- Frame recommendations
- Order history
- Profile settings
- Virtual try-on tool

### 2. Admin Users

Admin users have superuser privileges for managing the entire platform.

**Credentials:**
- Example user: `admin@example.com` / `AdminPass456!`
- Region: North America (NA)

**Permissions:**
- All regular user permissions
- User management (create, edit, delete)
- System settings configuration
- Access to analytics dashboards
- Content management
- Inventory management
- Global settings control

**Dashboard Elements:**
- User management section
- System settings panel
- Analytics dashboard
- Content management system
- Inventory control panel

### 3. Optician Users

Optician users represent eyecare professionals who use the platform to manage their patients and practice.

**Credentials:**
- Example user: `optician@example.com` / `Optician123!`
- Region: North America (NA)
- Practice ID: practice-123

**Permissions:**
- All regular user permissions
- Patient management
- Prescription management
- Practice statistics
- Professional consultation tools
- Order processing for patients

**Dashboard Elements:**
- Patient list
- Practice statistics
- Prescription management tools
- Professional consultation interface

### 4. Region-Specific Users

Users from different regions may see localized content and catalog items.

**European User:**
- Example user: `euuser@example.com` / `Password123!`
- Region: Europe (EU)

**Region-Specific Differences:**
- Localized pricing (EUR vs USD)
- Region-specific frame selections
- Compliance with regional regulations (GDPR for EU)
- Region-specific shipping options
- Different marketing promotions

## RBAC Implementation

### Authentication Flow

1. User submits login credentials (email/password)
2. Backend validates credentials and returns JWT token
3. Token contains encoded user role and permissions
4. Frontend stores token in local storage or HTTP-only cookie
5. API requests include token in Authorization header
6. Backend middleware validates token and checks permissions for requested resources

### Permission Hierarchy

The permission system follows this hierarchy:

```
Admin
  └── All Permissions

Optician
  ├── Patient Management
  ├── Prescription Management
  └── Practice Statistics
  
Regular User
  ├── Profile Management
  ├── Virtual Try-On
  ├── Order Management
  └── Frame Browsing
```

### Frontend Authorization

The frontend implements authorization through:

1. Protected routes that check user role before rendering
2. Conditional rendering of UI elements based on permissions
3. Navigation menus that adapt to user role
4. API request middleware that handles unauthorized responses

### Testing the RBAC System

We verify the RBAC implementation through comprehensive E2E tests:

1. **Authentication Tests** (`test_authentication.py`):
   - Verify successful login for different user types
   - Test authentication API endpoints
   - Verify failed authentication scenarios

2. **Dashboard Tests** (`test_user_dashboard.py`):
   - Verify appropriate dashboard content for each user type
   - Ensure role-specific UI elements are displayed/hidden correctly

3. **Landing Page Tests** (`test_landing_page_user_types.py`):
   - Test how the landing page adapts to different user types
   - Verify navigation and UI elements change based on role

4. **User Journey Tests** (`test_user_journeys.py`):
   - Test complete workflows for different user types
   - Verify authorization boundaries are enforced

## Best Practices

1. **Principle of Least Privilege**:
   - Users are granted only the permissions necessary for their role
   - Access is denied by default, requiring explicit permission grants

2. **Role Separation**:
   - Clear separation between admin, optician, and regular user roles
   - Well-defined boundaries for each role's capabilities

3. **Consistent Testing**:
   - Every role and permission is verified through E2E tests
   - Tests ensure UI adapts appropriately to user roles
   - Tests verify API endpoints enforce proper authorization
