import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('yvi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple localStorage-based auth (no backend)
    const storedUsers = JSON.parse(localStorage.getItem('yvi_users') || '{}');
    
    if (storedUsers[email] && storedUsers[email].password === password) {
      const userData = { email, name: storedUsers[email].name };
      setUser(userData);
      localStorage.setItem('yvi_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, name?: string): Promise<boolean> => {
    // Store new user in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('yvi_users') || '{}');
    
    if (storedUsers[email]) {
      return false; // User already exists
    }
    
    storedUsers[email] = { password, name };
    localStorage.setItem('yvi_users', JSON.stringify(storedUsers));
    
    const userData = { email, name };
    setUser(userData);
    localStorage.setItem('yvi_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yvi_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
