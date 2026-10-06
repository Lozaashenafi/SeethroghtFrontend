import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  getInstallPlatform,
  getInstallState,
  isMobileDevice,
  isStandalone,
  promptInstall,
  subscribeInstallState,
  type InstallPlatform,
} from '@/lib/pwa';

/** Delay before the install interstitial appears, so it never blocks first paint. */
const SHOW_DELAY_MS = 1500;
const DISMISS_KEY = 'see-through-install-dismissed';

function readDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function writeDismissed(value: boolean): void {
  try {
    if (value) window.sessionStorage.setItem(DISMISS_KEY, '1');
    else window.sessionStorage.removeItem(DISMISS_KEY);
  } catch {
    // Private-mode storage failures are non-fatal.
  }
}

export interface PwaInstall {
  /** True when the install interstitial should be rendered. */
  shouldPrompt: boolean;
  platform: InstallPlatform;
  /** True when the browser gave us a native install prompt to trigger. */
  canPrompt: boolean;
  isMobile: boolean;
  isInstalled: boolean;
  isInstalling: boolean;
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  dismiss: () => void;
}

/**
 * Drives the "install the app" interstitial shown to phone visitors.
 *
 * Browsers cannot force an install, so this surfaces the native prompt where
 * available and step-by-step "add to home screen" instructions where it is not
 * (iOS Safari never fires `beforeinstallprompt`). Dismissal is per-session, so
 * returning phone visitors are asked again instead of never.
 */
export function usePwaInstall(): PwaInstall {
  const installState = useSyncExternalStore(
    subscribeInstallState,
    getInstallState,
    () => 'unknown' as const,
  );

  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(readDismissed);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(isStandalone);
  const [isMobile, setIsMobile] = useState(isMobileDevice);
  const [platform] = useState<InstallPlatform>(getInstallPlatform);

  // Wait a beat before interrupting, so the page paints first.
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Keep standalone state honest (install completes, or window is resized).
  useEffect(() => {
    const sync = () => setIsInstalled(isStandalone());
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const mobile = window.matchMedia('(pointer: coarse)');

    displayMode.addEventListener('change', sync);
    mobile.addEventListener('change', () => setIsMobile(isMobileDevice()));
    window.addEventListener('appinstalled', sync);
    window.addEventListener('resize', sync);

    return () => {
      displayMode.removeEventListener('change', sync);
      mobile.removeEventListener('change', () => setIsMobile(isMobileDevice()));
      window.removeEventListener('appinstalled', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  const install = useCallback(async () => {
    setIsInstalling(true);
    const outcome = await promptInstall();
    setIsInstalling(false);
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDismissed(true);
      writeDismissed(true);
    } else if (outcome === 'dismissed') {
      setDismissed(true);
      writeDismissed(true);
    }
    return outcome;
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    writeDismissed(true);
  }, []);

  const shouldPrompt = ready && isMobile && !isInstalled && !dismissed;

  return {
    shouldPrompt,
    platform,
    canPrompt: installState === 'available',
    isMobile,
    isInstalled,
    isInstalling,
    install,
    dismiss,
  };
}
