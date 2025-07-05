import { http, HttpResponse } from 'msw';
import { User } from '@/types/auth';

// Sample mock user data
const mockUsers = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Inc',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
];

export const userHandlers = [
  // Get user profile endpoint
  http.get('/api/users/profile', async ({ request }) => {
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

    // Fix: Ensure user is an object before spreading
    return HttpResponse.json(user ? { ...user } : {});
  }),

  // Update profile endpoint
  http.patch('/api/users/profile', async ({ request }) => {
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

    return HttpResponse.json(updatedUser);
  })
];
