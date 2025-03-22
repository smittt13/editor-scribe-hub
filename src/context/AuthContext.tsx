
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  apiKey?: string;
  role?: 'admin' | 'user';
  requestCount?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  generateApiKey: () => string;
  regenerateApiKey: () => string;
  incrementRequestCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create a default admin user
const createDefaultAdmin = () => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Only create default admin if no users exist
  if (users.length === 0) {
    const defaultAdmin = {
      id: crypto.randomUUID(),
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // In a real app, this would be hashed
      avatar: `https://ui-avatars.com/api/?name=admin&background=random`,
      role: 'admin',
      apiKey: crypto.randomUUID(),
      requestCount: 0
    };
    
    users.push(defaultAdmin);
    localStorage.setItem('users', JSON.stringify(users));
    
    toast.success('Default admin account created: admin@example.com / admin123');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Create default admin account
    createDefaultAdmin();
    
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const generateApiKey = (): string => {
    // Generate a unique API key
    const apiKey = crypto.randomUUID();
    
    if (user) {
      const updatedUser = { ...user, apiKey };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the user in the users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, apiKey } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setUser(updatedUser);
      toast.success("API key generated successfully!");
      return apiKey;
    }
    
    return '';
  };
  
  const regenerateApiKey = (): string => {
    return generateApiKey();
  };

  const incrementRequestCount = () => {
    if (user) {
      const currentCount = user.requestCount || 0;
      const newCount = currentCount + 1;
      
      // Update local user state
      const updatedUser = { ...user, requestCount: newCount };
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update the user in the users array
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? { ...u, requestCount: newCount } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // For demo, we'll simulate authentication with sample users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        toast.error("Invalid credentials. Please try again.");
        return false;
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      toast.success("Login successful!");
      navigate('/blogs');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An error occurred during login");
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // For demo, we'll simulate user registration
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.some((u: any) => u.email === email)) {
        toast.error("Email already in use");
        return false;
      }
      
      // First user is admin, others are regular users
      const role: 'admin' | 'user' = users.length === 0 ? 'admin' : 'user';
      
      const newUser = {
        id: crypto.randomUUID(),
        username,
        email,
        password, // In a real app, this would be hashed
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
        role,
        apiKey: role === 'admin' ? crypto.randomUUID() : undefined,
        requestCount: 0
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Auto-login after signup
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      toast.success("Account created successfully!");
      navigate('/blogs');
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("An error occurred during signup");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      login, 
      signup, 
      logout,
      generateApiKey,
      regenerateApiKey,
      incrementRequestCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};
