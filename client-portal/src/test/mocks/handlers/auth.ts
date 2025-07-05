import { http, HttpResponse } from 'msw';
import { LoginResponse, User } from '@/types/auth';

// Sample mock user data
const mockUsers = [
  {
    id: '1',
    email: 'john.doe@example.com',
    password: 'process.env.AUTH_SECRET_1', // In a real app, this would be hashed
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Inc',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
];

// Sample tokens
const generateTokens = (userId: string) => ({
  accessToken: `mock-access-token-${userId}`,
  refreshToken: `mock-refresh-token-${userId}`
});

export const authHandlers = [
  // Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const { email, password } = body;

    const user = mockUsers.find(u => u.email === email);

    if (!user || user.password !== password) {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid email or password' }),
        { status: 401 }
      );
    }

    const tokens = generateTokens(user.id);

    const response: LoginResponse = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };

    return HttpResponse.json(response);
  }),

  // Register endpoint
  http.post('/api/auth/register', async ({ request }) => {
    const userData = await request.json() as User;

    // Check if user already exists
    if (mockUsers.some(u => u.email === userData.email)) {
      return new HttpResponse(
        JSON.stringify({ message: 'User with this email already exists' }),
        { status: 409 }
      );
    }

    // In a real handler, you would create the user here
    // For testing, we just return a success response
    return new HttpResponse(null, { status: 201 });
  }),

  // Forgot password endpoint
  http.post('/api/auth/forgot-password', async ({ request }) => {
    const body = await request.json() as { email: string };
    const { email } = body;

    const user = mockUsers.find(u => u.email === email);

    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      // Just return success anyway
      return new HttpResponse(null, { status: 200 });
    }

    return new HttpResponse(null, { status: 200 });
  }),

  // Reset password endpoint
  http.post('/api/auth/reset-password', async ({ request }) => {
    const body = await request.json() as { token: string; password: string };
    const { token } = body; // Removed unused variable

    // Validate token (simplified for testing)
    if (!token.startsWith('valid-token')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid or expired token' }),
        { status: 400 }
      );
    }

    return new HttpResponse(null, { status: 200 });
  }),

  // Get user profile endpoint
  http.get('/api/auth/profile', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Extract user ID from token (simplified for testing)
    const userId = token.includes('1') ? '1' : null;

    if (!userId) {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid token' }),
        { status: 401 }
      );
    }

    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      return new HttpResponse(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    const { password, ...userWithoutPassword } = user;

    return HttpResponse.json(userWithoutPassword);
  }),

  // Update profile endpoint
  http.patch('/api/auth/profile', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Extract user ID from token (simplified for testing)
    const userId = token.includes('1') ? '1' : null;

    if (!userId) {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid token' }),
        { status: 401 }
      );
    }

    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return new HttpResponse(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      );
    }

    // Update user data (simplified for testing)
    const updatedData = await request.json() as Partial<User>;

    const updatedUser = {
      ...user,
      ...updatedData,
      updatedAt: new Date().toISOString()
    };

    const { password, ...userWithoutPassword } = updatedUser;

    return HttpResponse.json(userWithoutPassword);
  }),

  // Logout endpoint
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Refresh token endpoint
  http.post('/api/auth/refresh-token', async ({ request }) => {
    const body = await request.json() as { refreshToken: string };
    const { refreshToken } = body;

    if (!refreshToken || !refreshToken.startsWith('mock-refresh-token')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid refresh token' }),
        { status: 401 }
      );
    }

    // Extract user ID from token (simplified for testing)
    const userId = refreshToken.includes('1') ? '1' : null;

    if (!userId) {
      return new HttpResponse(
        JSON.stringify({ message: 'Invalid token' }),
        { status: 401 }
      );
    }

    const tokens = generateTokens(userId);

    return HttpResponse.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  })
];
