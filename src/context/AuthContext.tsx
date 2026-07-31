import { createContext, useState, useCallback, useContext, type ReactNode } from 'react';
import {
  adminLogin,
  adminLogout,
  getAdminUser,
  setAdminUser,
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(getAdminUser());

  const login = useCallback(async (email: string, password: string) => {
    const result = await adminLogin(email, password);
    setAdminUser(result.admin);
    setAdmin(result.admin);
  }, []);

  const logout = useCallback(() => {
    clearAdminAuth();
    setAdmin(null);
    void adminLogout().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!admin,
        admin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
