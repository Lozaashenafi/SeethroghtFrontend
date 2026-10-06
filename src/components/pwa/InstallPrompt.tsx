import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MoreVertical, Plus, Share, Wifi, Zap, Smartphone, X, Loader2 } from 'lucide-react';
import { usePwaInstall } from '@/hooks';

const benefits = [
  { icon: Zap, label: 'Opens instantly in full screen — no browser bars' },
  { icon: Wifi, label: 'Works offline once a page has loaded' },
  { icon: Smartphone, label: 'Lives on your home screen like a real app' },
];

/**
 * Aggressive install interstitial shown to phone visitors who are browsing in
 * a browser tab. Browsers forbid programmatic installs, so this is the closest
 * legitimate equivalent: it takes over the screen, drives the native prompt
 * where available, and shows exact "add to home screen" steps where it isn't.
 */
export function InstallPrompt() {
  const { shouldPrompt, platform, canPrompt, isInstalling, install, dismiss } = usePwaInstall();

  // Lock background scroll while the interstitial is up. Release on close
  // (matching Modal/MobileNav): restoring a captured value would re-lock the
  // page whenever another overlay was open when the sheet appeared.
  useEffect(() => {
    if (!shouldPrompt) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [shouldPrompt]);

  const handleInstall = async () => {
    const outcome = await install();
    // 'unavailable' (e.g. iOS) leaves the sheet open so the steps stay visible.
    if (outcome === 'unavailable' && platform !== 'ios') dismiss();
  };

  const ios = platform === 'ios';

  return (
    <AnimatePresence>
      {shouldPrompt && (
        <motion.div
          key="pwa-install"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex flex-col bg-black/50 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          {/* Brand row so it never feels like a spam overlay. */}
          <div className="flex items-center justify-center gap-2 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-2 text-white">
            <img src="/lightlogo.png" alt="" className="h-6 w-6 object-contain" />
            <span className="text-sm font-medium tracking-normal">See Through</span>
          </div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="mt-auto w-full max-h-[92dvh] overflow-y-auto overscroll-contain border-t-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] px-5 pt-6 pb-safe"
          >
            <div className="mx-auto w-full max-w-md">
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="pwa-install-title"
                  className="text-2xl font-medium leading-tight text-[var(--color-text)] dark:text-[var(--color-text)]"
                >
                  Install the See Through app
                </h2>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label="Close install prompt"
                  className="-mr-1 -mt-1 shrink-0 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] p-2 text-[var(--color-text)] dark:text-[var(--color-text)] active:bg-[var(--color-text)] active:text-white dark:active:bg-[var(--color-text)] dark:active:text-[var(--color-bg)]"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">
                Get a faster, offline-ready app on your phone. It is free and takes a few seconds.
              </p>

              <ul className="mt-5 space-y-2">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <li
                      key={benefit.label}
                      className="flex items-center gap-3 border-2 border-[var(--color-text)]/12 dark:border-[var(--color-border)] bg-[var(--color-paper)] dark:bg-[var(--color-card)] px-3 py-2.5"
                    >
                      <Icon size={17} className="shrink-0 text-[var(--color-text)] dark:text-[var(--color-text)]" />
                      <span className="text-[13px] leading-snug text-[var(--color-text)] dark:text-[var(--color-text)]">
                        {benefit.label}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {!canPrompt && (
                <div className="mt-5 border-2 border-[var(--color-text)]/15 dark:border-[var(--color-border)] bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-4">
                  <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">
                    {ios ? 'On iPhone / iPad' : 'Add it to your home screen'}
                  </p>
                  {ios ? (
                    <ol className="mt-3 space-y-3">
                      <li className="flex items-start gap-3 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[11px] font-semibold">1</span>
                        <span className="pt-0.5">
                          Open this page in <strong>Safari</strong> (iOS can only install from Safari).
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[11px] font-semibold">2</span>
                        <span className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          Tap the <Share size={15} className="inline" /> <strong>Share</strong> button.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[11px] font-semibold">3</span>
                        <span className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          Choose <Plus size={15} className="inline" /> <strong>Add to Home Screen</strong>.
                        </span>
                      </li>
                    </ol>
                  ) : (
                    <ol className="mt-3 space-y-3">
                      <li className="flex items-start gap-3 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[11px] font-semibold">1</span>
                        <span className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          Open the browser menu <MoreVertical size={15} className="inline" /> (top-right).
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[11px] font-semibold">2</span>
                        <span className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          Tap <Download size={15} className="inline" /> <strong>Install app</strong> or{' '}
                          <strong>Add to Home screen</strong>.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-[var(--color-text)] dark:text-[var(--color-text)]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[11px] font-semibold">3</span>
                        <span className="pt-0.5">Confirm, then open See Through from your home screen.</span>
                      </li>
                    </ol>
                  )}
                </div>
              )}

              <div className="mt-6 space-y-3">
                {canPrompt ? (
                  <button
                    type="button"
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="flex w-full items-center justify-center gap-2 border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-text)] dark:bg-[var(--color-text)] py-4 text-sm font-medium tracking-normal text-white dark:text-[var(--color-bg)] shadow-[4px_4px_0px_0px_var(--color-text)] dark:shadow-[4px_4px_0px_0px_rgba(255,239,205,0.2)] transition-transform active:translate-y-0.5 disabled:opacity-70"
                  >
                    {isInstalling ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    {isInstalling ? 'Installing…' : 'Install app'}
                  </button>
                ) : (
                  <div className="border-4 border-dashed border-[var(--color-text)]/30 dark:border-[var(--color-border)] py-4 text-center text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">
                    Follow the steps above to install
                  </div>
                )}

                <button
                  type="button"
                  onClick={dismiss}
                  className="w-full py-2 text-xs font-medium tracking-normal text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] underline-offset-4 hover:underline"
                >
                  Continue in browser for now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
