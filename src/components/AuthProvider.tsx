import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '../types';
import { storage } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load from session
    const session = storage.getSession();
    if (session) {
      setUser(session);
    }
    setLoading(false);
  }, []);

  const logout = async () => {
    storage.setSession(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const session = storage.getSession();
    if (session) {
      const updatedUser = await storage.getUser(session.uid);
      if (updatedUser) {
        storage.setSession(updatedUser);
        setUser(updatedUser);
        return;
      }
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile: user, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
