import { Navigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '@/context/UserAuthContext';
import { ROUTES } from '@/constants';
import { Loader2 } from 'lucide-react';

interface ProtectedUserRouteProps {
  children: React.ReactNode;
}

export function ProtectedUserRoute({ children }: ProtectedUserRouteProps) {
  const { isAuthenticated, isReady } = useUserAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
