import { useState } from 'react';
import { Mail, X, Loader2 } from 'lucide-react';
import { useUserAuth } from '@/context/UserAuthContext';
import { resendVerification } from '@/services/userAuth.service';
import { toast } from 'sonner';

export function EmailVerificationBanner() {
  const { user } = useUserAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);

  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    setResending(true);
    try {
      await resendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch {
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b-2 border-amber-200 dark:border-amber-800">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mail size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <span className="font-medium">Verify your email</span> to post reviews. Check your inbox for the verification link.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-normal text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-800/40 hover:bg-amber-200 dark:hover:bg-amber-700/40 rounded transition-colors disabled:opacity-40"
          >
            {resending ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              'Resend'
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 p-1"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
