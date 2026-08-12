import { useEffect, useState } from 'react';
import { AtSign } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAnonymous } from '@/context/AnonymousContext';
import { useLocalStorage } from '@/hooks';
import { getApiErrorMessage } from '@/utils';
import { toast } from 'sonner';

const NICKNAME_SEEN_KEY = 'see-through-nickname-seen';
const NICKNAME_MAX_LENGTH = 30;

// Match the torn effect from the welcome modal / homepage
const tornEffect = {
  clipPath: `polygon(0% 0%, 100% 0%, 100% 98%, 98% 100%, 95% 98%, 92% 100%, 89% 98%, 85% 100%, 80% 97%, 75% 100%, 70% 98%, 65% 100%, 60% 97%, 55% 100%, 50% 98%, 45% 100%, 40% 97%, 35% 100%, 30% 98%, 25% 100%, 20% 97%, 15% 100%, 10% 98%, 5% 100%, 0% 97%)`,
};

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Second onboarding step: lets the visitor pick a custom alias or keep the
 * auto-generated one. Shown once per browser, and only while the identity still
 * has its one-time nickname change available.
 */
export function NicknameModal({ isOpen, onClose }: NicknameModalProps) {
  const { identity, isReady, setNickname } = useAnonymous();
  const [hasSeen, setHasSeen] = useLocalStorage(NICKNAME_SEEN_KEY, false);
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canChange = !!identity && !identity.nicknameRegeneratedAt && !identity.isBlocked;

  // Nothing to offer (nickname already changed, prompt already seen, or the
  // identity failed to load) — close instead of showing a dead-end modal.
  useEffect(() => {
    if (isReady && (!canChange || hasSeen)) onClose();
  }, [isReady, canChange, hasSeen, onClose]);

  if (!isOpen || !isReady || hasSeen || !canChange) return null;

  /** Skipping keeps the auto-generated nickname and never touches the budget. */
  const dismiss = () => {
    setHasSeen(true);
    onClose();
  };

  const handleSave = async () => {
    const value = draft.trim();
    if (!value) {
      setError('Enter a nickname, or skip to keep your current alias.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await setNickname(value);
      toast.success('Nickname saved!');
      setHasSeen(true);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save that nickname. Try another one.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={dismiss}
      size="md"
      showCloseButton={false}
      // Remove default modal styling to use our custom brutalist container
      className="bg-transparent border-none shadow-none overflow-visible"
    >
      <div className="relative">
        {/* Shadow layer */}
        <div
          className="absolute inset-0 translate-x-2 translate-y-2 bg-[var(--color-text)]/10 dark:bg-black/40"
          style={tornEffect}
        />

        {/* Main Content Card */}
        <div
          className="relative bg-[var(--color-paper)] dark:bg-[var(--color-card)] border-4 border-[var(--color-text)] dark:border-[var(--color-text)] p-8 md:p-10"
          style={tornEffect}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 items-center justify-center border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] mb-5 -rotate-3">
              <AtSign size={26} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            </div>
            <h2 className="text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] leading-none">
              Pick your alias
            </h2>
            <p className="mt-3 text-[10px] tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
              You stay anonymous either way
            </p>
          </div>

          {/* Current alias */}
          <div className="mb-5 border-2 border-[var(--color-text)]/10 dark:border-[var(--color-border)] bg-white/50 dark:bg-[var(--color-surface)]/50 p-4">
            <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] mb-1">
              YOUR CURRENT ALIAS
            </p>
            <p className="text-lg font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              {identity?.nickname ?? '—'}
            </p>
          </div>

          {/* Custom input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
              Or choose your own
            </label>
            <div className="flex items-center border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] px-4">
              <AtSign size={16} className="mr-3 shrink-0 text-stone-400 dark:text-[var(--color-text-secondary)]" />
              <input
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                maxLength={NICKNAME_MAX_LENGTH}
                placeholder="e.g. Midnight Raven"
                disabled={isSubmitting}
                className="w-full py-3 text-sm font-medium outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)] disabled:opacity-50"
              />
            </div>
            <p className="text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
              Letters, numbers, spaces and . _ ' - · up to {NICKNAME_MAX_LENGTH} characters
            </p>
          </div>

          {error && (
            <p className="mt-4 text-xs font-medium text-orange-700 dark:text-orange-400">{error}</p>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleSave}
              disabled={isSubmitting || !draft.trim()}
              className="w-full py-4 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-sm tracking-normal shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:opacity-90 transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Use This Name'}
            </button>
            <button
              onClick={dismiss}
              disabled={isSubmitting}
              className="w-full py-3 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] text-[var(--color-text)] dark:text-[var(--color-text)] font-medium text-xs tracking-normal hover:bg-[var(--color-text)]/5 dark:hover:bg-[var(--color-text)]/10 transition-colors disabled:opacity-40"
            >
              Skip — Keep My Alias
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
