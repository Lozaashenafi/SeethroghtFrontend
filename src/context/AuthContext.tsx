import { createContext, useState, useCallback, useContext, type ReactNode } from 'react';
import {
  adminLogin,
  getAdminToken,
  getAdminUser,
  setAdminAuth,
  clearAdminAuth,
} from '@/services/auth.service';

interface AdminUser {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  admin: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getAdminToken());
  const [admin, setAdmin] = useState<AdminUser | null>(getAdminUser());

  const login = useCallback(async (email: string, password: string) => {
    const result = await adminLogin(email, password);
    setAdminAuth(result.token, result.admin);
    setToken(result.token);
    setAdmin(result.admin);
  }, []);

  const logout = useCallback(() => {
    clearAdminAuth();
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        admin,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
