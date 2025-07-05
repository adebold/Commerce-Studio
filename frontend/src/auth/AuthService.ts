// Define User interface locally to avoid importing from .tsx files
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'brand_manager' | 'client_admin' | 'developer' | 'viewer';
  company?: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Demo users with consistent credentials
const DEMO_USERS: Record<string, User> = {
  'super@varai.com': {
    id: '1',
    email: 'super@varai.com',
    name: 'Sarah Chen',
    role: 'super_admin',
    company: 'VARAi Technologies',
    avatar: '👩‍💼'
  },
  'brand@varai.com': {
    id: '2',
    email: 'brand@varai.com',
    name: 'Marcus Rodriguez',
    role: 'brand_manager',
    company: 'Fashion Forward Inc.',
    avatar: '👨‍💼'
  },
  'admin@varai.com': {
    id: '3',
    email: 'admin@varai.com',
    name: 'Emily Johnson',
    role: 'client_admin',
    company: 'Retail Solutions Ltd.',
    avatar: '👩‍💻'
  },
  'dev@varai.com': {
    id: '4',
    email: 'dev@varai.com',
    name: 'Alex Kim',
    role: 'developer',
    company: 'VARAi Technologies',
    avatar: '👨‍💻'
  },
  'viewer@varai.com': {
    id: '5',
    email: 'viewer@varai.com',
    name: 'Lisa Wang',
    role: 'viewer',
    company: 'Analytics Team',
    avatar: '👩‍🔬'
  }
};

// Demo password for all accounts
const DEMO_PASSWORD = 'demo123';

export class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { email, password } = credentials;
      const user = DEMO_USERS[email.toLowerCase()];
      
      if (!user) {
        return {
          success: false,
          error: 'User not found. Please check your email address.'
        };
      }
      
      if (password !== DEMO_PASSWORD) {
        return {
          success: false,
          error: 'Invalid password. Use "demo123" for all demo accounts.'
        };
      }
      
      // Generate a simple token for demo purposes
      const token = this.generateToken(user);
      
      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // In a real app, this would invalidate the token on the server
    // For demo purposes, we just clear local storage
    localStorage.removeItem('varai_user');
    localStorage.removeItem('varai_token');
  }

  /**
   * Get current user from stored data
   */
  getCurrentUser(): User | null {
    try {
      const storedUser = localStorage.getItem('varai_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      localStorage.removeItem('varai_user');
    }
    return null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    const token = localStorage.getItem('varai_token');
    return !!(user && token);
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('varai_token');
  }

  /**
   * Verify if the current session is valid
   */
  async verifySession(): Promise<boolean> {
    const user = this.getCurrentUser();
    const token = this.getToken();
    
    if (!user || !token) {
      return false;
    }
    
    // In a real app, this would verify the token with the server
    // For demo purposes, we just check if the data exists
    return true;
  }

  /**
   * Generate a demo token
   */
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // In a real app, this would be a proper JWT token
    // For demo purposes, we just encode the payload
    return btoa(JSON.stringify(payload));
  }

  /**
   * Get all available demo users (for display purposes)
   */
  getDemoUsers(): User[] {
    return Object.values(DEMO_USERS);
  }

  /**
   * Get demo password (for display purposes)
   */
  getDemoPassword(): string {
    return DEMO_PASSWORD;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();