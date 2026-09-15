import { createContext, useState, useCallback, useContext, useEffect, type ReactNode } from 'react';
import {
  adminLogin as apiLogin,
  adminLogout,
  getAdminUser,
  setAdminUser,
  clearAdminAuth,
} from '@/services/auth.service';
import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_USER_KEY = 'see-through-auth-user';

function getStoredUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      setIsLoading(false);
      return;
    }
    apiClient
      .get(API_ENDPOINTS.AUTH_ME)
      .then(({ data }) => {
        const u = data.data;
        const authUser: AuthUser = {
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          role: u.role,
          emailVerified: u.emailVerified,
        };
        setUser(authUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      })
      .catch(() => {
        localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    const authUser: AuthUser = {
      id: result.user.id,
      email: result.user.email,
      displayName: result.user.displayName,
      role: result.user.role,
      emailVerified: result.user.emailVerified,
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
    void adminLogout().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        isLoading,
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
