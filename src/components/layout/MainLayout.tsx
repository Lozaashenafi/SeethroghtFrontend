import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { EmailVerificationBanner } from '@/features/auth/components/EmailVerificationBanner';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)]">
      <Navbar />
      <EmailVerificationBanner />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
