# Testing Guide for Client Portal

This document provides an overview of testing practices, tools, and patterns for the EyewearML Client Portal.

## Testing Architecture

The testing architecture is built with the following tools:

- **Vitest**: Fast Vite-based testing framework
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For API mocking
- **Jest DOM**: For DOM testing utilities

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Directory Structure

```
src/test/
├── mocks/              # MSW mocking setup
│   ├── handlers/       # API route handlers
│   │   ├── auth.ts     # Auth API handlers
│   │   ├── reports.ts  # Reports API handlers
│   │   └── user.ts     # User API handlers
│   ├── handlers.ts     # Combines all handlers
│   └── server.ts       # MSW server setup
├── utils.tsx           # Testing utilities
├── setup.ts            # Global test setup
└── README.md           # This documentation
```

## Testing Components

```tsx
// Example component test
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    
    await waitFor(() => {
      expect(screen.getByText('Clicked!')).toBeInTheDocument();
    });
  });
});
```

## API Mocking with MSW

MSW intercepts API requests and provides mock responses. This allows you to test components that make API calls without actually hitting a real server.

### Setting Up an API Test

```tsx
import { describe, expect, it } from 'vitest';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import myApiService from '../myApiService';

describe('API Service', () => {
  it('fetches data successfully', async () => {
    const response = await myApiService.getData();
    expect(response).toHaveProperty('data');
  });

  it('handles errors', async () => {
    // Override the default handler for a specific test
    server.use(
      http.get('/api/data', () => {
        return new HttpResponse(
          JSON.stringify({ message: 'Error fetching data' }),
          { status: 500 }
        );
      })
    );
    
    await expect(myApiService.getData()).rejects.toThrow();
  });
});
```

## Custom Mock Handlers

If you need to add custom handlers for a specific API endpoint, you can create them in the appropriate handler file:

```typescript
// src/test/mocks/handlers/myFeature.ts
import { http, HttpResponse } from 'msw';

export const myFeatureHandlers = [
  http.get('/api/my-feature', () => {
    return HttpResponse.json([
      { id: 1, name: 'Feature 1' },
      { id: 2, name: 'Feature 2' }
    ]);
  }),
  
  http.post('/api/my-feature', async ({ request }) => {
    const newFeature = await request.json();
    return HttpResponse.json({ id: 3, ...newFeature }, { status: 201 });
  })
];

// Then import in src/test/mocks/handlers.ts
import { myFeatureHandlers } from './handlers/myFeature';

export const handlers = [
  ...authHandlers,
  ...reportsHandlers,
  ...userHandlers,
  ...myFeatureHandlers
];
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it's built.
2. **Use testing-library queries in priority order**: Prefer `getByRole`, `getByLabelText`, etc. over `getByTestId`.
3. **Mock API responses**: Use MSW to simulate backend responses.
4. **Test user flows**: Test complete user journeys rather than just isolated functions.
5. **Keep tests independent**: Each test should be able to run on its own.
6. **Use descriptive test names**: Names should clearly describe what's being tested.

## Accessibility Testing

Testing for accessibility is built into RTL's approach. Use the following practices:

- Use `getByRole` to ensure elements have proper ARIA roles
- Test keyboard navigation using `userEvent.tab()`
- Ensure forms have proper labels using `getByLabelText`
- Test for proper focus management
- Verify contrast and readability

## Adding New Tests

When adding new tests:

1. Place component tests in a `__tests__` directory adjacent to the component
2. Name test files with `.test.ts` or `.test.tsx` suffix
3. For API mocks, add handlers to the appropriate file in `src/test/mocks/handlers/`
4. Import the handlers in `src/test/mocks/handlers.ts`

## Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Mock Service Worker](https://mswjs.io/docs/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
