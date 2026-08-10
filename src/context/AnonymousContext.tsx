import { createContext, useState, useCallback, useContext, useEffect, type ReactNode } from 'react';
import {
  getAnonymousIdentity,
  regenerateNickname,
  type AnonymousIdentity,
} from '@/services/anonymous.service';

interface AnonymousContextType {
  identity: AnonymousIdentity | null;
  isReady: boolean;
  regenerate: () => Promise<void>;
}

const AnonymousContext = createContext<AnonymousContextType | null>(null);

export function AnonymousProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<AnonymousIdentity | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    getAnonymousIdentity()
      .then((id) => {
        if (active) setIdentity(id);
      })
      .catch(() => {
        // Identity is best-effort; the backend re-mints cookies on demand.
      })
      .finally(() => {
        if (active) setIsReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const regenerate = useCallback(async () => {
    const id = await regenerateNickname();
    setIdentity(id);
  }, []);

  return (
    <AnonymousContext.Provider value={{ identity, isReady, regenerate }}>
      {children}
    </AnonymousContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnonymous(): AnonymousContextType {
  const context = useContext(AnonymousContext);
  if (!context) {
    throw new Error('useAnonymous must be used within an AnonymousProvider');
  }
  return context;
}
