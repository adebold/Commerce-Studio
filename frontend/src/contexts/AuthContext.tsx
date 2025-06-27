import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'brand_manager' | 'client_admin' | 'developer' | 'viewer';
  company?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users matching the LoginPage demo accounts
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

// Demo password for all accounts (consistent with LoginPage)
const DEMO_PASSWORD = 'demo123';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('varai_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('varai_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check demo credentials
    const demoUser = DEMO_USERS[email.toLowerCase()];
    
    if (demoUser && password === DEMO_PASSWORD) {
      setUser(demoUser);
      localStorage.setItem('varai_user', JSON.stringify(demoUser));
      localStorage.setItem('varai_token', 'demo-token-' + Date.now());
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('varai_user');
    localStorage.removeItem('varai_token');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};