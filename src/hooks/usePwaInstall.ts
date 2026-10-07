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
 * (iOS Safari never fires `beforeinstallprompt`).
 *
 * Closing the prompt is intentionally NOT persisted: it only hides the sheet
 * for the current page view, so a phone visitor who has not installed the app
 * is asked again on every load instead of being silenced for the whole session.
 */
export function usePwaInstall(): PwaInstall {
  const installState = useSyncExternalStore(
    subscribeInstallState,
    getInstallState,
    () => 'unknown' as const,
  );

  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
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
    const onMobileChange = () => setIsMobile(isMobileDevice());

    displayMode.addEventListener('change', sync);
    mobile.addEventListener('change', onMobileChange);
    window.addEventListener('appinstalled', sync);
    window.addEventListener('resize', sync);

    return () => {
      displayMode.removeEventListener('change', sync);
      mobile.removeEventListener('change', onMobileChange);
      window.removeEventListener('appinstalled', sync);
      window.removeEventListener('resize', sync);
    };
  }, []);

  const install = useCallback(async () => {
    setIsInstalling(true);
    const outcome = await promptInstall();
    setIsInstalling(false);
    // 'accepted' hides the sheet via isInstalled; 'dismissed' keeps the manual
    // steps on screen so the visitor can still install by hand.
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDismissed(true);
    }
    return outcome;
  }, []);

  const dismiss = useCallback(() => setDismissed(true), []);

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
