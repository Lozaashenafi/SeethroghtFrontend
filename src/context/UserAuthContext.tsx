import {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import {
  getStoredUser,
  getUserProfile,
  loginUser as apiLoginUser,
  logoutUser,
  setUser as storeUser,
  clearUser,
  type UserProfile,
} from '@/services/userAuth.service';
import { apiClient } from '@/lib/axios';
import { API_ENDPOINTS } from '@/constants';

interface UserAuthContextType {
  user: UserProfile | null;
  isReady: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  setUser: (user: UserProfile) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(getStoredUser);
  const [isReady, setIsReady] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  // On mount, verify the stored user is still valid
  useEffect(() => {
    let active = true;
    const stored = getStoredUser();
    if (stored) {
      getUserProfile()
        .then((profile) => {
          if (!active) return;
          setUserState(profile);
          storeUser(profile);
        })
        .catch(() => {
          if (!active) return;
          clearUser();
          setUserState(null);
        })
        .finally(() => {
          if (active) {
            setIsReady(true);
            setUserLoading(false);
          }
        });
    } else {
      setIsReady(true);
      setUserLoading(false);
    }
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const profile = await apiLoginUser(email, password);
    storeUser(profile);
    setUserState(profile);
    return profile;
  }, []);

  const setUser = useCallback((newUser: UserProfile) => {
    storeUser(newUser);
    setUserState(newUser);
  }, []);

  const logout = useCallback(async () => {
    clearUser();
    setUserState(null);
    await logoutUser().catch(() => {});
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      setUserState(profile);
    } catch {
      // ignore
    }
  }, []);

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isReady,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        userLoading,
        login,
        setUser,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserAuth(): UserAuthContextType {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
}
