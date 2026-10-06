/**
 * PWA support: service-worker registration, install-prompt capture and
 * platform detection.
 *
 * The `beforeinstallprompt` event can fire before React mounts, so the
 * listener is registered at module scope (this module is imported from
 * `main.tsx` before render) and subscribers are notified afterwards.
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export type InstallPlatform = 'android' | 'ios' | 'desktop' | 'other';

const listeners = new Set<() => void>();

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installState: 'unknown' | 'available' | 'unavailable' = 'unknown';

function emit(): void {
  for (const listener of listeners) listener();
}

/** Subscribe to install-prompt availability changes. Returns an unsubscribe fn. */
export function subscribeInstallState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** 'available' when the browser handed us a native install prompt. */
export function getInstallState(): 'unknown' | 'available' | 'unavailable' {
  return installState;
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Stop Chrome's mini-infobar and keep the prompt for our own UI.
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    installState = 'available';
    emit();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installState = 'unavailable';
    emit();
  });
}

/** True when already running as an installed app (standalone window). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const displayStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const displayFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
  const displayMinimal = window.matchMedia('(display-mode: minimal-ui)').matches;
  // iOS Safari exposes navigator.standalone instead of display-mode.
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayStandalone || displayFullscreen || displayMinimal || iosStandalone;
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as Macintosh, so fall back to touch-point detection.
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes('Macintosh') && typeof document !== 'undefined' && 'ontouchend' in document)
  );
}

/** Coarse pointer + small viewport means a phone-class device. */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;
  if (ua.test(navigator.userAgent)) return true;
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth <= 820;
}

export function getInstallPlatform(): InstallPlatform {
  if (isIOS()) return 'ios';
  if (/Android/i.test(navigator.userAgent)) return 'android';
  return isMobileDevice() ? 'other' : 'desktop';
}

/** Fire the native install prompt. Returns the user's choice. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  const event = deferredPrompt;
  deferredPrompt = null;
  installState = 'unavailable';
  emit();
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    return outcome;
  } catch {
    return 'unavailable';
  }
}

/**
 * Register the service worker. Skipped in dev: Vite's dev server serves
 * modules individually and a cached shell would mask hot updates.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Registration failures are non-fatal — the app works without offline.
    });
  });
}
