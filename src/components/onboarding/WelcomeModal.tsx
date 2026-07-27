import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield, AlertTriangle, MessageSquare, ThumbsUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui';
import { useLocalStorage } from '@/hooks';
import { fadeInUp, staggerContainer } from '@/lib/animations';

const WELCOME_SEEN_KEY = 'see-through-welcome-seen';

const guidelines = [
  {
    icon: Eye,
    title: 'See Through the Surface',
    description:
      'This platform lets you read honest, anonymous reviews from real employees before you apply or get hired. Get the inside scoop on company culture, management, and more.',
    color: 'text-brand-navy',
  },
  {
    icon: Shield,
    title: 'Stay Anonymous',
    description:
      'Everything you share is completely anonymous. No names, no emails, no tracking. Your identity is protected so you can speak freely.',
    color: 'text-brand-olive',
  },
  {
    icon: AlertTriangle,
    title: 'Reviews May Not Be 100% Accurate',
    description:
      'Every review is a personal opinion. Information might not always be accurate. Always check the likes, comments, and multiple reviews to get a balanced view.',
    color: 'text-warning',
  },
  {
    icon: ThumbsUp,
    title: 'Be Honest & Fair',
    description:
      'Only write about companies you actually work(ed) for. Don\'t post reviews out of revenge or malice. Keep it constructive and respectful.',
    color: 'text-success',
  },
  {
    icon: MessageSquare,
    title: 'Keep It Clean',
    description:
      'No bad language, harassment, or personal attacks. Reviews with inappropriate content will be removed. Let\'s keep this helpful for everyone.',
    color: 'text-info',
  },
];

export function WelcomeModal() {
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage(WELCOME_SEEN_KEY, false);
  const [isOpen, setIsOpen] = useState(!hasSeenWelcome);

  const handleDismiss = () => {
    setHasSeenWelcome(true);
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      size="lg"
      showCloseButton={false}
      className="overflow-hidden"
    >
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-olive/10 dark:bg-brand-cream/10"
          >
            <Eye size={32} className="text-brand-olive dark:text-brand-cream" />
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-2xl font-semibold text-brand-olive dark:text-brand-cream"
          >
            Welcome to See Through
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-2 text-sm text-text-secondary"
          >
            Honest workplace reviews, shared anonymously.
          </motion.p>
        </motion.div>

        {/* Guidelines */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {guidelines.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="flex items-start gap-3 rounded-xl bg-brand-olive/[0.03] dark:bg-brand-cream/[0.03] p-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface">
                  <Icon size={18} className={item.color} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-text">{item.title}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={handleDismiss}
            variant="primary"
            size="lg"
            className="w-full"
          >
            I Understand, Let's Go!
          </Button>
          <p className="mt-2 text-xs text-text-secondary/60">
            You can find this info again anytime in the footer.
          </p>
        </motion.div>
      </div>
    </Modal>
  );
}
