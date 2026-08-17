import { createContext, useState, useCallback, useContext, useEffect, type ReactNode } from 'react';
import {
  getAnonymousIdentity,
  regenerateNickname,
  updateNickname,
  type AnonymousIdentity,
} from '@/services/anonymous.service';

interface AnonymousContextType {
  identity: AnonymousIdentity | null;
  isReady: boolean;
  /** Bumps only when the browser is handed a genuinely NEW identity (e.g. the
   * previous one was deleted by an admin). Used to remount the onboarding
   * modals so they re-read the reset flags. */
  resetKey: number;
  regenerate: () => Promise<void>;
  setNickname: (nickname: string) => Promise<void>;
}

const AnonymousContext = createContext<AnonymousContextType | null>(null);

// The publicId of the identity this browser last saw. When the identity
// changes (e.g. an admin permanently deleted it and the backend minted a
// fresh one), the visitor starts over from scratch — the onboarding flags are
// reset so the welcome page shows again.
const IDENTITY_PUBLIC_ID_KEY = 'see-through-identity-public-id';
const WELCOME_SEEN_KEY = 'see-through-welcome-seen';
const NICKNAME_SEEN_KEY = 'see-through-nickname-seen';

export function AnonymousProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<AnonymousIdentity | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAnonymousIdentity()
      .then((id) => {
        if (!active) return;
        const knownPublicId = localStorage.getItem(IDENTITY_PUBLIC_ID_KEY);
        if (knownPublicId && knownPublicId !== id.publicId) {
          // Brand-new identity — the previous one was deleted (admin) or
          // orphaned, so this browser is a fresh visitor. Reset the onboarding
          // flags to run the welcome flow again, and bump resetKey so the
          // onboarding modals remount and re-read them.
          localStorage.removeItem(WELCOME_SEEN_KEY);
          localStorage.removeItem(NICKNAME_SEEN_KEY);
          setResetKey((k) => k + 1);
        }
        localStorage.setItem(IDENTITY_PUBLIC_ID_KEY, id.publicId);
        setIdentity(id);
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

  const setNickname = useCallback(async (nickname: string) => {
    const id = await updateNickname(nickname);
    setIdentity(id);
  }, []);

  return (
    <AnonymousContext.Provider value={{ identity, isReady, resetKey, regenerate, setNickname }}>
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
