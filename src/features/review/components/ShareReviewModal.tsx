import { useState } from 'react';
import {
  Share2,
  Link2,
  Check,
  MessageCircle,
  Send,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
} from 'lucide-react';
import { Modal } from '@/components/ui';
import { toast } from 'sonner';
import { trackEvent } from '@/lib/analytics';
import {
  buildReviewShareText,
  copyToClipboard,
  emailShareUrl,
  facebookShareUrl,
  linkedinShareUrl,
  nativeShare,
  reviewUrl,
  telegramShareUrl,
  whatsappShareUrl,
  xShareUrl,
} from '@/lib/share';
import type { Review } from '@/types';

interface ShareReviewModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareReviewModal({ review, isOpen, onClose }: ShareReviewModalProps) {
  const [copied, setCopied] = useState(false);
  const url = reviewUrl(review.publicId);
  const text = buildReviewShareText(review);
  const subject = `${review.companyName ?? 'A company'} reviewed on See Through`;

  const track = (platform: string) => trackEvent('share_review', { platform });

  const handleNativeShare = async () => {
    track('native');
    const ok = await nativeShare({ title: 'See Through', text, url });
    if (ok) onClose();
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      track('copy');
      toast.success('Link copied');
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Could not copy the link');
    }
  };

  const targets = [
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: whatsappShareUrl(text, url) },
    { key: 'telegram', label: 'Telegram', icon: Send, href: telegramShareUrl(url, text) },
    { key: 'x', label: 'X / Twitter', icon: Twitter, href: xShareUrl(text, url) },
    { key: 'facebook', label: 'Facebook', icon: Facebook, href: facebookShareUrl(url) },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, href: linkedinShareUrl(url) },
    { key: 'email', label: 'Email', icon: Mail, href: emailShareUrl(subject, `${text}\n${url}`) },
  ];

  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share this review" size="sm">
      {/* Preview of the shared text */}
      <div className="mb-5 border-2 border-[var(--color-text)]/30 dark:border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] p-4">
        <p className="text-sm leading-relaxed text-stone-700 dark:text-[var(--color-text-secondary)] line-clamp-3">
          {text}
        </p>
        <p className="mt-2 truncate text-[11px] text-stone-400 dark:text-[var(--color-text-secondary)]">{url}</p>
      </div>

      {/* Action grid */}
      <div className="grid grid-cols-3 gap-3">
        {canNativeShare && (
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-2 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] p-3 hover:opacity-90 transition-opacity"
          >
            <Share2 size={20} />
            <span className="text-[10px] font-medium">More…</span>
          </button>
        )}
        {targets.map(({ key, label, icon: Icon, href }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track(key)}
            className="flex flex-col items-center gap-2 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] p-3 hover:bg-stone-100 dark:hover:bg-[var(--color-card)] transition-colors"
          >
            <Icon size={20} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            <span className="text-[10px] font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">{label}</span>
          </a>
        ))}
        <button
          onClick={handleCopy}
          className="flex flex-col items-center gap-2 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] p-3 hover:bg-stone-100 dark:hover:bg-[var(--color-card)] transition-colors"
        >
          {copied ? (
            <Check size={20} className="text-emerald-600" />
          ) : (
            <Link2 size={20} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
          )}
          <span className="text-[10px] font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
            {copied ? 'Copied!' : 'Copy link'}
          </span>
        </button>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-stone-400 dark:text-[var(--color-text-secondary)]">
        Shared links unfurl with the review's rating and title — never any reviewer identity.
      </p>
    </Modal>
  );
}
