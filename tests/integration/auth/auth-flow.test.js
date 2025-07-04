/**
 * Integration tests for authentication flows
 * 
 * These tests verify that the authentication flows work correctly,
 * including user registration, login, multi-tenant authentication,
 * and role-based access control.
 */

const { test, expect } = require('@playwright/test');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Test configuration
const config = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  authUrl: process.env.AUTH_URL || 'http://localhost:3001',
  adminUser: {
    email: 'admin@example.com',
    password: 'process.env.AUTH_FLOW_SECRET'
  },
  regularUser: {
    email: 'user@example.com',
    password: 'process.env.AUTH_FLOW_SECRET_1'
  },
  tenantAdmin: {
    email: 'tenant-admin@example.com',
    password: 'process.env.AUTH_FLOW_SECRET_2'
  }
};

// Helper function to create API client
function createApiClient(token = null) {
  return axios.create({
    baseURL: config.apiUrl,
    headers: token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  });
}

// Helper function to create Auth client
function createAuthClient(token = null) {
  return axios.create({
    baseURL: config.authUrl,
    headers: token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    }
  });
}

test.describe('Authentication Flows', () => {
  let apiClient;
  let authClient;
  let userToken;
  let adminToken;
  let tenantAdminToken;
  let testUser;

  test.beforeAll(async () => {
    apiClient = createApiClient();
    authClient = createAuthClient();

    // Login as admin to get admin token
    try {
      const adminLoginResponse = await authClient.post('/auth/login', {
        email: config.adminUser.email,
        password: config.adminUser.password
      });
      adminToken = adminLoginResponse.data.token;
    } catch (error) {
      console.error('Admin login failed:', error.response?.data || error.message);
      throw error;
    }

    // Login as regular user to get user token
    try {
      const userLoginResponse = await authClient.post('/auth/login', {
        email: config.regularUser.email,
        password: config.regularUser.password
      });
      userToken = userLoginResponse.data.token;
    } catch (error) {
      console.error('User login failed:', error.response?.data || error.message);
      throw error;
    }

    // Login as tenant admin to get tenant admin token
    try {
      const tenantAdminLoginResponse = await authClient.post('/auth/login', {
        email: config.tenantAdmin.email,
        password: config.tenantAdmin.password
      });
      tenantAdminToken = tenantAdminLoginResponse.data.token;
    } catch (error) {
      console.error('Tenant admin login failed:', error.response?.data || error.message);
      throw error;
    }

    // Create a test user for registration tests
    testUser = {
      email: `test-${uuidv4()}@example.com`,
      password: 'process.env.AUTH_FLOW_SECRET_3',
      firstName: 'Test',
      lastName: 'User'
    };
  });

  test('should register a new user', async () => {
    // Register a new user
    const registerResponse = await authClient.post('/auth/register', testUser);
    
    // Verify response
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.data).toHaveProperty('userId');
    expect(registerResponse.data).toHaveProperty('message', 'User registered successfully');
    
    // Verify user can login
    const loginResponse = await authClient.post('/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data).toHaveProperty('token');
    expect(loginResponse.data).toHaveProperty('user');
    expect(loginResponse.data.user.email).toBe(testUser.email);
  });

  test('should not register a user with existing email', async () => {
    try {
      // Try to register with existing email
      await authClient.post('/auth/register', {
        email: config.regularUser.email,
        password: 'process.env.AUTH_FLOW_SECRET_4',
        firstName: 'Duplicate',
        lastName: 'User'
      });
      
      // If we get here, the test should fail
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      // Verify error response
      expect(error.response.status).toBe(409);
      expect(error.response.data).toHaveProperty('message');
      expect(error.response.data.message).toContain('already exists');
    }
  });

  test('should login with valid credentials', async () => {
    // Login with valid credentials
    const loginResponse = await authClient.post('/auth/login', {
      email: config.regularUser.email,
      password: config.regularUser.password
    });
    
    // Verify response
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data).toHaveProperty('token');
    expect(loginResponse.data).toHaveProperty('user');
    expect(loginResponse.data.user.email).toBe(config.regularUser.email);
    
    // Verify token works for API access
    const client = createApiClient(loginResponse.data.token);
    const userProfileResponse = await client.get('/users/me');
    
    expect(userProfileResponse.status).toBe(200);
    expect(userProfileResponse.data).toHaveProperty('email', config.regularUser.email);
  });

  test('should not login with invalid credentials', async () => {
    try {
      // Try to login with invalid password
      await authClient.post('/auth/login', {
        email: config.regularUser.email,
        password: 'process.env.AUTH_FLOW_SECRET_5'
      });
      
      // If we get here, the test should fail
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      // Verify error response
      expect(error.response.status).toBe(401);
      expect(error.response.data).toHaveProperty('message');
      expect(error.response.data.message).toContain('Invalid credentials');
    }
  });

  test('should refresh token', async () => {
    // Login to get a token
    const loginResponse = await authClient.post('/auth/login', {
      email: config.regularUser.email,
      password: config.regularUser.password
    });
    
    const originalToken = loginResponse.data.token;
    const refreshToken = loginResponse.data.refreshToken;
    
    // Refresh the token
    const refreshResponse = await authClient.post('/auth/refresh', {
      refreshToken: refreshToken
    });
    
    // Verify response
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.data).toHaveProperty('token');
    expect(refreshResponse.data.token).not.toBe(originalToken);
    
    // Verify new token works for API access
    const client = createApiClient(refreshResponse.data.token);
    const userProfileResponse = await client.get('/users/me');
    
    expect(userProfileResponse.status).toBe(200);
    expect(userProfileResponse.data).toHaveProperty('email', config.regularUser.email);
  });

  test('should logout user', async () => {
    // Login to get a token
    const loginResponse = await authClient.post('/auth/login', {
      email: config.regularUser.email,
      password: config.regularUser.password
    });
    
    const token = loginResponse.data.token;
    const client = createAuthClient(token);
    
    // Logout
    const logoutResponse = await client.post('/auth/logout');
    
    // Verify response
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.data).toHaveProperty('message', 'Logged out successfully');
    
    // Verify token no longer works
    try {
      await client.get('/users/me');
      
      // If we get here, the test should fail
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      // Verify error response
      expect(error.response.status).toBe(401);
    }
  });

  test('should enforce role-based access control', async () => {
    // Admin should be able to access admin resources
    const adminClient = createApiClient(adminToken);
    const adminResourceResponse = await adminClient.get('/admin/users');
    
    expect(adminResourceResponse.status).toBe(200);
    expect(Array.isArray(adminResourceResponse.data)).toBe(true);
    
    // Regular user should not be able to access admin resources
    const userClient = createApiClient(userToken);
    try {
      await userClient.get('/admin/users');
      
      // If we get here, the test should fail
      expect(true).toBe(false); // This should not be reached
    } catch (error) {
      // Verify error response
      expect(error.response.status).toBe(403);
      expect(error.response.data).toHaveProperty('message');
      expect(error.response.data.message).toContain('Forbidden');
    }
  });

  test('should support multi-tenant authentication', async () => {
    // Login as tenant admin
    const loginResponse = await authClient.post('/auth/login', {
      email: config.tenantAdmin.email,
      password: config.tenantAdmin.password
    });
    
    const token = loginResponse.data.token;
    const client = createApiClient(token);
    
    // Get available tenants
    const tenantsResponse = await client.get('/tenants');
    
    expect(tenantsResponse.status).toBe(200);
    expect(Array.isArray(tenantsResponse.data)).toBe(true);
    expect(tenantsResponse.data.length).toBeGreaterThan(0);
    
    const firstTenant = tenantsResponse.data[0];
    
    // Select a tenant
    const selectTenantResponse = await client.post('/auth/select-tenant', {
      tenantId: firstTenant.id
    });
    
    expect(selectTenantResponse.status).toBe(200);
    expect(selectTenantResponse.data).toHaveProperty('token');
    expect(selectTenantResponse.data).toHaveProperty('tenant');
    expect(selectTenantResponse.data.tenant.id).toBe(firstTenant.id);
    
    // Verify tenant-specific access
    const tenantClient = createApiClient(selectTenantResponse.data.token);
    const tenantResourceResponse = await tenantClient.get('/tenant/dashboard');
    
    expect(tenantResourceResponse.status).toBe(200);
    expect(tenantResourceResponse.data).toHaveProperty('tenantId', firstTenant.id);
  });

  test('should handle password reset flow', async () => {
    // Request password reset
    const resetRequestResponse = await authClient.post('/auth/forgot-password', {
      email: testUser.email
    });
    
    expect(resetRequestResponse.status).toBe(200);
    expect(resetRequestResponse.data).toHaveProperty('message');
    expect(resetRequestResponse.data.message).toContain('reset link sent');
    
    // In a real test, we would check the email and extract the reset token
    // For this integration test, we'll use the admin API to get the reset token
    const adminClient = createApiClient(adminToken);
    const resetTokenResponse = await adminClient.get(`/admin/users/reset-token/${testUser.email}`);
    
    expect(resetTokenResponse.status).toBe(200);
    expect(resetTokenResponse.data).toHaveProperty('resetToken');
    
    const resetToken = resetTokenResponse.data.resetToken;
    
    // Reset password
    const newPassword = 'process.env.AUTH_FLOW_SECRET_6';
    const resetPasswordResponse = await authClient.post('/auth/reset-password', {
      token: resetToken,
      password: newPassword
    });
    
    expect(resetPasswordResponse.status).toBe(200);
    expect(resetPasswordResponse.data).toHaveProperty('message');
    expect(resetPasswordResponse.data.message).toContain('password has been reset');
    
    // Verify login with new password
    const loginResponse = await authClient.post('/auth/login', {
      email: testUser.email,
      password: newPassword
    });
    
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.data).toHaveProperty('token');
  });
});

test.describe('Authentication UI Flows', () => {
  test('should display login page', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${config.authUrl}/login`);
    
    // Verify login form is displayed
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login via UI', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${config.authUrl}/login`);
    
    // Fill login form
    await page.fill('input[type="email"]', config.regularUser.email);
    await page.fill('input[type="password"]', config.regularUser.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await page.waitForURL('**/dashboard');
    
    // Verify user is logged in
    const userMenuText = await page.textContent('.user-menu');
    expect(userMenuText).toContain(config.regularUser.email);
  });

  test('should display registration page', async ({ page }) => {
    // Navigate to registration page
    await page.goto(`${config.authUrl}/register`);
    
    // Verify registration form is displayed
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should register via UI', async ({ page }) => {
    // Generate unique email
    const email = `ui-test-${uuidv4()}@example.com`;
    
    // Navigate to registration page
    await page.goto(`${config.authUrl}/register`);
    
    // Fill registration form
    await page.fill('input[name="firstName"]', 'UI');
    await page.fill('input[name="lastName"]', 'Test');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'UITest123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to verification page
    await page.waitForURL('**/verify-email');
    
    // Verify success message
    const messageText = await page.textContent('.message');
    expect(messageText).toContain('verification email');
  });

  test('should display tenant selection UI', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${config.authUrl}/login`);
    
    // Fill login form with tenant admin credentials
    await page.fill('input[type="email"]', config.tenantAdmin.email);
    await page.fill('input[type="password"]', config.tenantAdmin.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to tenant selection
    await page.waitForURL('**/select-tenant');
    
    // Verify tenant selection UI is displayed
    await expect(page.locator('.tenant-list')).toBeVisible();
    await expect(page.locator('.tenant-card')).toHaveCount.greaterThan(0);
  });

  test('should select tenant via UI', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${config.authUrl}/login`);
    
    // Fill login form with tenant admin credentials
    await page.fill('input[type="email"]', config.tenantAdmin.email);
    await page.fill('input[type="password"]', config.tenantAdmin.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for tenant selection page
    await page.waitForURL('**/select-tenant');
    
    // Select first tenant
    await page.click('.tenant-card:first-child');
    
    // Verify redirect to tenant dashboard
    await page.waitForURL('**/tenant/dashboard');
    
    // Verify tenant name is displayed
    const tenantNameText = await page.textContent('.tenant-name');
    expect(tenantNameText).not.toBe('');
  });
});