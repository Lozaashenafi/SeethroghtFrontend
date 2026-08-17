import { useState } from 'react';
import { Eye, Shield, AlertTriangle, ThumbsUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useLocalStorage } from '@/hooks';

const WELCOME_SEEN_KEY = 'see-through-welcome-seen';

// The welcome modal is intentionally ALWAYS light — hardcoded light-theme
// colors (from globals.css), independent of the app's dark mode.
const guidelines = [
  {
    icon: Eye,
    title: 'See Through the Surface',
    description: 'Read honest, anonymous reviews from real employees before you apply.',
    color: 'text-[#2b2f23]',
  },
  {
    icon: Shield,
    title: 'Stay Anonymous',
    description: 'No names, no emails, no tracking. Your identity is protected.',
    color: 'text-[#15803d]',
  },
  {
    icon: AlertTriangle,
    title: 'Accuracy Notice',
    description: 'Reviews are personal opinions. Check likes and comments for balance.',
    color: 'text-[#c2410c]',
  },
  {
    icon: ThumbsUp,
    title: 'Be Honest & Fair',
    description: 'Only review companies you worked for. No malice, keep it constructive.',
    color: 'text-[#1d4ed8]',
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
      
    >
      {/* Main Content Card — always light */}
      <div className="bg-[#ffffff]  p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/lightlogo.png"
            alt="See Through"
            className="mx-auto mb-5 h-20 w-20 object-contain"
          />
          <h2 className="text-3xl md:text-4xl font-medium leading-tight text-[#2b2f23]">
            Welcome to See Through
          </h2>
          <p className="mt-3 text-base text-[#6b7280]">
            Honest, anonymous workplace reviews — no account needed.
          </p>
        </div>

        {/* Guidelines — simple stacked list for readability */}
        <div className="space-y-3 mb-8">
          {guidelines.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 bg-[#fcfaf7] border border-[#ece6d6] p-4"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#2b2f23] bg-white">
                  <Icon size={18} className={item.color} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#2b2f23]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#6b7280]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer/Action */}
        <div className="space-y-4">
          <button
            onClick={handleDismiss}
            className="w-full py-4 bg-[#2b2f23] text-white font-medium text-base tracking-normal hover:opacity-90 transition-transform active:scale-[0.98] shadow-[4px_4px_0px_0px_rgba(43,47,35,0.25)]"
          >
            I Understand. Enter.
          </button>
          <p className="text-center text-xs text-[#6b7280]">
            Verification is required for posting, not browsing.
          </p>
        </div>
      </div>
    </Modal>
  );
}