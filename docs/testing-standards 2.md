# VARAi Testing Standards and Guidelines

This document outlines the testing standards and guidelines for the VARAi platform. Following these standards ensures consistent, high-quality testing across all components of the platform.

## Table of Contents

1. [General Testing Principles](#general-testing-principles)
2. [Test Organization](#test-organization)
3. [Naming Conventions](#naming-conventions)
4. [Frontend Testing](#frontend-testing)
5. [Backend Testing](#backend-testing)
6. [Authentication Testing](#authentication-testing)
7. [Mock and Stub Usage](#mock-and-stub-usage)
8. [Test Coverage Requirements](#test-coverage-requirements)
9. [Continuous Integration](#continuous-integration)
10. [Test Maintenance](#test-maintenance)

## General Testing Principles

- **Test-Driven Development (TDD)**: Write tests before implementing features when possible.
- **Single Responsibility**: Each test should verify a single aspect of functionality.
- **Independence**: Tests should be independent of each other and run in any order.
- **Readability**: Tests should be easy to read and understand.
- **Maintainability**: Tests should be easy to maintain and update.
- **Reliability**: Tests should produce consistent results.
- **Speed**: Tests should run quickly to enable frequent execution.

## Test Organization

### Frontend Tests

```
frontend/
├── src/
│   ├── components/
│   │   ├── __tests__/
│   │   │   └── Component.test.tsx
│   ├── services/
│   │   ├── __tests__/
│   │   │   └── service.test.ts
│   ├── utils/
│   │   ├── __tests__/
│   │   │   └── util.test.ts
```

### Backend Tests

```
src/
├── tests/
│   ├── test_module.py
│   ├── test_api.py
│   ├── integration/
│   │   └── test_integration.py
```

### Auth Module Tests

```
auth/
├── test/
│   ├── auth.test.ts
│   ├── role.test.ts
│   ├── tenant.test.ts
```

## Naming Conventions

### Frontend Tests

- Test files should be named `*.test.tsx` or `*.test.ts`
- Test suites should use descriptive names: `describe('ComponentName', () => {...})`
- Test cases should start with "should": `test('should render correctly', () => {...})`

### Backend Tests

- Test files should be named `test_*.py`
- Test classes should be named `Test*`
- Test methods should be named `test_*`
- Test method names should be descriptive: `test_user_login_with_valid_credentials`

## Frontend Testing

### Component Testing

- Use React Testing Library for component tests
- Test rendering, user interactions, and state changes
- Use `data-testid` attributes for test selectors
- Test both success and error states

Example:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  test('should render correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Service Testing

- Mock external dependencies (API calls, localStorage, etc.)
- Test success and error scenarios
- Verify correct parameters are passed to dependencies

Example:

```ts
import { login } from './authService';

// Mock fetch
global.fetch = jest.fn();

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should login successfully with valid credentials', async () => {
    // Mock successful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    const result = await login('test@example.com', 'password123');
    
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.any(Object));
    expect(result).toEqual({ success: true, token: 'test-token' });
  });
});
```

## Backend Testing

### Unit Testing

- Use pytest for Python tests
- Mock external dependencies
- Test edge cases and error handling
- Use fixtures for test data

Example:

```python
import pytest
from unittest.mock import patch, MagicMock
from src.auth.auth import verify_password

def test_verify_password():
    """Test password verification."""
    # Test valid password
    assert verify_password("password123", get_password_hash("password123")) is True
    
    # Test invalid password
    assert verify_password("wrongpassword", get_password_hash("password123")) is False
```

### API Testing

- Test API endpoints using TestClient
- Verify response status codes and content
- Test authentication and authorization
- Test validation errors

Example:

```python
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)

def test_get_user_profile_authenticated():
    """Test getting user profile when authenticated."""
    # Mock authentication
    with patch("src.api.dependencies.auth.get_current_user") as mock_get_user:
        mock_get_user.return_value = {"id": "user123", "email": "test@example.com"}
        
        response = client.get("/api/users/me", headers={"Authorization": "Bearer test-token"})
        
        assert response.status_code == 200
        assert response.json()["email"] == "test@example.com"
```

## Authentication Testing

- Test login, logout, and registration flows
- Test token generation and validation
- Test permission checks and role-based access
- Test multi-tenancy features

## Mock and Stub Usage

### When to Use Mocks

- External services (APIs, databases)
- Time-dependent functions
- Random number generators
- File system operations
- Network requests

### How to Create Mocks

#### Frontend (Jest)

```ts
// Mock a module
jest.mock('../api', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' }),
}));

// Mock a specific function
const mockFn = jest.fn().mockImplementation(() => 'mocked result');
```

#### Backend (pytest)

```python
# Mock a function
@patch('module.function')
def test_something(mock_function):
    mock_function.return_value = 'mocked result'
    
# Mock a class
@patch('module.Class')
def test_with_class(MockClass):
    instance = MockClass.return_value
    instance.method.return_value = 'mocked result'
```

## Test Coverage Requirements

- Frontend: Minimum 70% line coverage
- Backend: Minimum 80% line coverage
- Auth Module: Minimum 85% line coverage

Coverage is measured and enforced in the CI pipeline.

## Continuous Integration

All tests run automatically on:
- Pull requests to main and develop branches
- Pushes to main and develop branches

The CI pipeline includes:
1. Frontend tests
2. Backend tests
3. Auth module tests
4. End-to-end tests
5. Coverage reporting

## Test Maintenance

### When to Update Tests

- When fixing bugs
- When adding new features
- When refactoring code
- When tests become flaky

### Handling Flaky Tests

1. Identify the cause of flakiness
2. Fix the underlying issue (race conditions, timing issues, etc.)
3. If the issue cannot be fixed, mark the test as flaky and create a ticket

### Test Review Process

- Tests should be reviewed as part of code review
- Reviewers should verify test coverage and quality
- Tests should be run locally before submitting a PR