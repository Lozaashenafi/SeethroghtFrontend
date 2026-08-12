import { useState } from 'react';
import { Eye, Shield, AlertTriangle, ThumbsUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks';

const WELCOME_SEEN_KEY = 'see-through-welcome-seen';

// Match the torn effect from the homepage
const tornEffect = {
  clipPath: `polygon(0% 0%, 100% 0%, 100% 98%, 98% 100%, 95% 98%, 92% 100%, 89% 98%, 85% 100%, 80% 97%, 75% 100%, 70% 98%, 65% 100%, 60% 97%, 55% 100%, 50% 98%, 45% 100%, 40% 97%, 35% 100%, 30% 98%, 25% 100%, 20% 97%, 15% 100%, 10% 98%, 5% 100%, 0% 97%)`
};

const guidelines = [
  {
    icon: Eye,
    title: 'See Through the Surface',
    description: 'Read honest, anonymous reviews from real employees before you apply.',
    color: 'text-[var(--color-text)] dark:text-[var(--color-text)]',
  },
  {
    icon: Shield,
    title: 'Stay Anonymous',
    description: 'No names, no emails, no tracking. Your identity is protected.',
    color: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    icon: AlertTriangle,
    title: 'Accuracy Notice',
    description: 'Reviews are personal opinions. Check likes and comments for balance.',
    color: 'text-orange-700 dark:text-orange-400',
  },
  {
    icon: ThumbsUp,
    title: 'Be Honest & Fair',
    description: 'Only review companies you worked for. No malice, keep it constructive.',
    color: 'text-blue-700 dark:text-blue-400',
  },
];

interface WelcomeModalProps {
  /** Called right after the user dismisses the welcome modal (e.g. to open the nickname step). */
  onDismissed?: () => void;
}

export function WelcomeModal({ onDismissed }: WelcomeModalProps) {
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage(WELCOME_SEEN_KEY, false);
  const [isOpen, setIsOpen] = useState(!hasSeenWelcome);

  const handleDismiss = () => {
    setHasSeenWelcome(true);
    setIsOpen(false);
    onDismissed?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      size="lg"
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
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] mb-6 rotate-3">
              <Eye size={32} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            </div>
            <h2 className="text-3xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] leading-none">
              Welcome to <br/>
              <span className="bg-[var(--color-text)] text-white dark:bg-[var(--color-text)] dark:text-[var(--color-bg)] px-2">See Through</span>
            </h2>
            <p className="mt-4 text-[10px] tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
              Establishing the ground rules
            </p>
          </div>

          {/* Guidelines Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {guidelines.map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title}
                  className="p-4 border-2 border-[var(--color-text)]/10 dark:border-[var(--color-border)] bg-white/50 dark:bg-[var(--color-surface)]/50"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon size={18} className={item.color} />
                    <h3 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm leading-snug text-stone-600 dark:text-[var(--color-text-secondary)]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer/Action */}
          <div className="space-y-4">
            <button
              onClick={handleDismiss}
              className="w-full py-4 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-sm tracking-normal hover:opacity-90 transition-transform active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            >
              I Understand. Enter.
            </button>
            <p className="text-center text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
              Verification is required for posting, not browsing.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}