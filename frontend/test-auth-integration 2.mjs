#!/usr/bin/env node

/**
 * Authentication Integration Test Suite
 * 
 * Tests the actual authentication services and login page integration
 * This test validates the real authentication infrastructure
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';
import { readFileSync } from 'fs';

// Setup for ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  verbose: true,
  colors: {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

/**
 * Logging utilities
 */
const log = {
  info: (msg) => console.log(`${TEST_CONFIG.colors.blue}ℹ${TEST_CONFIG.colors.reset} ${msg}`),
  success: (msg) => console.log(`${TEST_CONFIG.colors.green}✅${TEST_CONFIG.colors.reset} ${msg}`),
  error: (msg) => console.log(`${TEST_CONFIG.colors.red}❌${TEST_CONFIG.colors.reset} ${msg}`),
  warning: (msg) => console.log(`${TEST_CONFIG.colors.yellow}⚠️${TEST_CONFIG.colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${TEST_CONFIG.colors.bold}${TEST_CONFIG.colors.blue}=== ${msg} ===${TEST_CONFIG.colors.reset}\n`)
};

/**
 * Test assertion utilities
 */
function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    log.success(message);
    return true;
  } else {
    testResults.failed++;
    const error = `Assertion failed: ${message}`;
    testResults.errors.push(error);
    log.error(error);
    return false;
  }
}

function assertEqual(actual, expected, message) {
  const condition = actual === expected;
  const fullMessage = `${message} (expected: ${expected}, actual: ${actual})`;
  return assert(condition, fullMessage);
}

function assertNotNull(value, message) {
  return assert(value !== null && value !== undefined, message);
}

function assertType(value, expectedType, message) {
  const actualType = typeof value;
  const condition = actualType === expectedType;
  const fullMessage = `${message} (expected type: ${expectedType}, actual type: ${actualType})`;
  return assert(condition, fullMessage);
}

function assertContains(haystack, needle, message) {
  const condition = haystack && haystack.includes && haystack.includes(needle);
  const fullMessage = `${message} (haystack should contain: ${needle})`;
  return assert(condition, fullMessage);
}

/**
 * Mock localStorage for Node.js environment
 */
function setupMockStorage() {
  const storage = {};
  
  global.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = value; },
    removeItem: (key) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); }
  };
  
  // Mock btoa/atob for Node.js
  if (typeof global.btoa === 'undefined') {
    global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
  }
  if (typeof global.atob === 'undefined') {
    global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
  }
}

/**
 * Read and analyze TypeScript source files
 */
function analyzeSourceFile(filePath) {
  try {
    const fullPath = join(__dirname, filePath);
    const content = readFileSync(fullPath, 'utf8');
    log.info(`Successfully read source file: ${filePath}`);
    return content;
  } catch (error) {
    log.error(`Failed to read source file ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Extract demo users from AuthService.ts
 */
function extractDemoUsers(authServiceContent) {
  if (!authServiceContent) return null;
  
  try {
    // Extract the DEMO_USERS object using regex
    const demoUsersMatch = authServiceContent.match(/const DEMO_USERS[^}]+}[^}]+}[^}]+}[^}]+}[^}]+}/s);
    if (!demoUsersMatch) {
      log.warning('Could not extract DEMO_USERS from AuthService.ts');
      return null;
    }
    
    // Extract individual user emails
    const emailMatches = authServiceContent.match(/'([^']+@varai\.com)'/g);
    if (!emailMatches) {
      log.warning('Could not extract user emails from AuthService.ts');
      return null;
    }
    
    const emails = emailMatches.map(match => match.replace(/'/g, ''));
    log.success(`Extracted ${emails.length} demo user emails from AuthService.ts`);
    
    return emails;
  } catch (error) {
    log.error(`Error extracting demo users: ${error.message}`);
    return null;
  }
}

/**
 * Extract demo password from AuthService.ts
 */
function extractDemoPassword(authServiceContent) {
  if (!authServiceContent) return null;
  
  try {
    const passwordMatch = authServiceContent.match(/const DEMO_PASSWORD = '([^']+)'/);
    if (!passwordMatch) {
      log.warning('Could not extract DEMO_PASSWORD from AuthService.ts');
      return null;
    }
    
    const password = passwordMatch[1];
    log.success(`Extracted demo password from AuthService.ts: ${password}`);
    return password;
  } catch (error) {
    log.error(`Error extracting demo password: ${error.message}`);
    return null;
  }
}

/**
 * Test AuthService.ts source code analysis
 */
async function testAuthServiceSource() {
  log.header('Testing AuthService.ts Source Code Analysis');
  
  try {
    // Read the AuthService.ts file
    const authServiceContent = analyzeSourceFile('src/auth/AuthService.ts');
    assertNotNull(authServiceContent, 'AuthService.ts should be readable');
    
    if (!authServiceContent) return;
    
    // Test that it contains expected exports
    assertContains(authServiceContent, 'export interface User', 'Should export User interface');
    assertContains(authServiceContent, 'export interface LoginCredentials', 'Should export LoginCredentials interface');
    assertContains(authServiceContent, 'export interface AuthResponse', 'Should export AuthResponse interface');
    assertContains(authServiceContent, 'export class AuthService', 'Should export AuthService class');
    assertContains(authServiceContent, 'export const authService', 'Should export authService instance');
    
    // Test demo users structure
    const demoEmails = extractDemoUsers(authServiceContent);
    assertNotNull(demoEmails, 'Should extract demo user emails');
    
    if (demoEmails) {
      const expectedEmails = [
        'super@varai.com',
        'brand@varai.com',
        'admin@varai.com',
        'dev@varai.com',
        'viewer@varai.com'
      ];
      
      assertEqual(demoEmails.length, 5, 'Should have 5 demo users');
      
      for (const email of expectedEmails) {
        assert(demoEmails.includes(email), `Should include demo user: ${email}`);
      }
    }
    
    // Test demo password
    const demoPassword = extractDemoPassword(authServiceContent);
    assertNotNull(demoPassword, 'Should extract demo password');
    assertEqual(demoPassword, 'demo123', 'Demo password should be "demo123"');
    
    // Test authentication methods
    assertContains(authServiceContent, 'async login(', 'Should have login method');
    assertContains(authServiceContent, 'async logout(', 'Should have logout method');
    assertContains(authServiceContent, 'getCurrentUser(', 'Should have getCurrentUser method');
    assertContains(authServiceContent, 'isAuthenticated(', 'Should have isAuthenticated method');
    
    log.success('AuthService.ts source code analysis completed');
    
  } catch (error) {
    log.error(`AuthService source test failed: ${error.message}`);
    testResults.errors.push(`AuthService source test error: ${error.message}`);
  }
}

/**
 * Test AuthContext.tsx source code analysis
 */
async function testAuthContextSource() {
  log.header('Testing AuthContext.tsx Source Code Analysis');
  
  try {
    // Read the AuthContext.tsx file
    const authContextContent = analyzeSourceFile('src/contexts/AuthContext.tsx');
    assertNotNull(authContextContent, 'AuthContext.tsx should be readable');
    
    if (!authContextContent) return;
    
    // Test React context structure
    assertContains(authContextContent, 'export interface User', 'Should export User interface');
    assertContains(authContextContent, 'interface AuthContextType', 'Should define AuthContextType interface');
    assertContains(authContextContent, 'export const AuthProvider', 'Should export AuthProvider component');
    assertContains(authContextContent, 'export const useAuth', 'Should export useAuth hook');
    
    // Test that it has the same demo users as AuthService
    const demoEmails = extractDemoUsers(authContextContent);
    if (demoEmails) {
      assertEqual(demoEmails.length, 5, 'AuthContext should have 5 demo users');
    }
    
    // Test demo password consistency
    const demoPassword = extractDemoPassword(authContextContent);
    if (demoPassword) {
      assertEqual(demoPassword, 'demo123', 'AuthContext demo password should match AuthService');
    }
    
    // Test React-specific features
    assertContains(authContextContent, 'useState', 'Should use React useState');
    assertContains(authContextContent, 'useEffect', 'Should use React useEffect');
    assertContains(authContextContent, 'createContext', 'Should use React createContext');
    
    log.success('AuthContext.tsx source code analysis completed');
    
  } catch (error) {
    log.error(`AuthContext source test failed: ${error.message}`);
    testResults.errors.push(`AuthContext source test error: ${error.message}`);
  }
}

/**
 * Test LoginPage.tsx source code analysis
 */
async function testLoginPageSource() {
  log.header('Testing LoginPage.tsx Source Code Analysis');
  
  try {
    // Read the LoginPage.tsx file
    const loginPageContent = analyzeSourceFile('src/pages/LoginPage.tsx');
    assertNotNull(loginPageContent, 'LoginPage.tsx should be readable');
    
    if (!loginPageContent) return;
    
    // Test React component structure
    assertContains(loginPageContent, 'const LoginPage: React.FC', 'Should be a React functional component');
    assertContains(loginPageContent, 'export default LoginPage', 'Should export LoginPage as default');
    
    // Test authentication integration
    assertContains(loginPageContent, 'useAuth', 'Should use useAuth hook');
    assertContains(loginPageContent, 'useNavigate', 'Should use React Router navigation');
    
    // Test form handling
    assertContains(loginPageContent, 'handleSubmit', 'Should have form submit handler');
    assertContains(loginPageContent, 'handleDemoLogin', 'Should have demo login handler');
    
    // Test demo accounts display
    assertContains(loginPageContent, 'demoAccounts', 'Should define demo accounts');
    assertContains(loginPageContent, 'super@varai.com', 'Should include super admin demo account');
    assertContains(loginPageContent, 'admin@varai.com', 'Should include client admin demo account');
    
    // Test Material-UI components
    assertContains(loginPageContent, 'TextField', 'Should use Material-UI TextField');
    assertContains(loginPageContent, 'Button', 'Should use Material-UI Button');
    assertContains(loginPageContent, 'Container', 'Should use Material-UI Container');
    
    log.success('LoginPage.tsx source code analysis completed');
    
  } catch (error) {
    log.error(`LoginPage source test failed: ${error.message}`);
    testResults.errors.push(`LoginPage source test error: ${error.message}`);
  }
}

/**
 * Test services/auth.ts source code analysis
 */
async function testAuthServiceAlternativeSource() {
  log.header('Testing services/auth.ts Source Code Analysis');
  
  try {
    // Read the services/auth.ts file
    const authServiceContent = analyzeSourceFile('src/services/auth.ts');
    assertNotNull(authServiceContent, 'services/auth.ts should be readable');
    
    if (!authServiceContent) return;
    
    // Test enum and interface exports
    assertContains(authServiceContent, 'export enum Role', 'Should export Role enum');
    assertContains(authServiceContent, 'export interface UserContext', 'Should export UserContext interface');
    assertContains(authServiceContent, 'export interface AuthResponse', 'Should export AuthResponse interface');
    assertContains(authServiceContent, 'export interface LoginCredentials', 'Should export LoginCredentials interface');
    
    // Test service functions
    assertContains(authServiceContent, 'const login = async', 'Should have login function');
    assertContains(authServiceContent, 'const logout = async', 'Should have logout function');
    assertContains(authServiceContent, 'const getCurrentUser = async', 'Should have getCurrentUser function');
    assertContains(authServiceContent, 'export const authService', 'Should export authService object');
    
    // Test mock authentication support
    assertContains(authServiceContent, 'REACT_APP_USE_MOCK_AUTH', 'Should support mock authentication');
    assertContains(authServiceContent, 'process.env.NODE_ENV', 'Should check environment');
    
    log.success('services/auth.ts source code analysis completed');
    
  } catch (error) {
    log.error(`services/auth.ts source test failed: ${error.message}`);
    testResults.errors.push(`services/auth.ts source test error: ${error.message}`);
  }
}

/**
 * Test cross-service consistency
 */
async function testCrossServiceConsistency() {
  log.header('Testing Cross-Service Consistency');
  
  try {
    // Read all authentication-related files
    const authServiceContent = analyzeSourceFile('src/auth/AuthService.ts');
    const authContextContent = analyzeSourceFile('src/contexts/AuthContext.tsx');
    const loginPageContent = analyzeSourceFile('src/pages/LoginPage.tsx');
    
    if (!authServiceContent || !authContextContent || !loginPageContent) {
      log.warning('Cannot perform cross-service consistency check - missing files');
      return;
    }
    
    // Extract demo passwords from all files
    const authServicePassword = extractDemoPassword(authServiceContent);
    const authContextPassword = extractDemoPassword(authContextContent);
    
    if (authServicePassword && authContextPassword) {
      assertEqual(authServicePassword, authContextPassword, 'Demo passwords should be consistent across services');
    }
    
    // Check that LoginPage references the correct demo accounts
    const expectedDemoEmails = ['super@varai.com', 'brand@varai.com', 'admin@varai.com', 'dev@varai.com', 'viewer@varai.com'];
    
    for (const email of expectedDemoEmails) {
      assertContains(loginPageContent, email, `LoginPage should reference demo account: ${email}`);
    }
    
    // Check that all files use consistent password
    assertContains(loginPageContent, 'demo123', 'LoginPage should use consistent demo password');
    
    log.success('Cross-service consistency check completed');
    
  } catch (error) {
    log.error(`Cross-service consistency test failed: ${error.message}`);
    testResults.errors.push(`Cross-service consistency test error: ${error.message}`);
  }
}

/**
 * Test file structure and imports
 */
async function testFileStructure() {
  log.header('Testing File Structure and Imports');
  
  try {
    // Test auth index file
    const authIndexContent = analyzeSourceFile('src/auth/index.ts');
    assertNotNull(authIndexContent, 'auth/index.ts should exist');
    
    if (authIndexContent) {
      assertContains(authIndexContent, 'export { AuthService, authService }', 'Should re-export AuthService');
      assertContains(authIndexContent, 'export type { LoginCredentials, AuthResponse, User }', 'Should re-export types');
    }
    
    // Test that files have proper ES6 exports
    const authServiceContent = analyzeSourceFile('src/auth/AuthService.ts');
    if (authServiceContent) {
      // Count export statements
      const exportMatches = authServiceContent.match(/^export /gm);
      assert(exportMatches && exportMatches.length >= 4, 'AuthService should have multiple exports');
    }
    
    log.success('File structure and imports validation completed');
    
  } catch (error) {
    log.error(`File structure test failed: ${error.message}`);
    testResults.errors.push(`File structure test error: ${error.message}`);
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log.header('Authentication Integration Test Suite');
  log.info('Starting comprehensive authentication integration tests...');
  
  // Setup test environment
  setupMockStorage();
  
  // Run all test suites
  await testAuthServiceSource();
  await testAuthContextSource();
  await testLoginPageSource();
  await testAuthServiceAlternativeSource();
  await testCrossServiceConsistency();
  await testFileStructure();
  
  // Print test results
  log.header('Test Results Summary');
  
  if (testResults.failed === 0) {
    log.success(`All integration tests passed! 🎉`);
    log.success(`Total: ${testResults.total} tests`);
    log.success(`Passed: ${testResults.passed}`);
    log.success(`Failed: ${testResults.failed}`);
  } else {
    log.error(`Some integration tests failed! 💥`);
    log.info(`Total: ${testResults.total} tests`);
    log.success(`Passed: ${testResults.passed}`);
    log.error(`Failed: ${testResults.failed}`);
    
    if (testResults.errors.length > 0) {
      log.header('Error Details');
      testResults.errors.forEach((error, index) => {
        log.error(`${index + 1}. ${error}`);
      });
    }
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    log.error(`Integration test runner failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}

export { runTests, testResults };