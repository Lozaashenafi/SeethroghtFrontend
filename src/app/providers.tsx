import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { queryClient } from '@/lib/queryClient';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            {children}
            <Toaster
              position="bottom-right"
              offset={16}
              gap={12}
              closeButton
              icons={{
                success: <CheckCircle2 size={18} className="text-emerald-700 dark:text-emerald-400" />,
                error: <XCircle size={18} className="text-orange-700 dark:text-orange-400" />,
                warning: <AlertTriangle size={18} className="text-orange-700 dark:text-orange-400" />,
                info: <Info size={18} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />,
                loading: <Loader2 size={18} className="animate-spin text-[var(--color-text)] dark:text-[var(--color-text)]" />,
              }}
              toastOptions={{
                style: {
                  background: 'var(--color-paper)',
                  color: 'var(--color-text)',
                  // Theme-aware: --color-text is olive-black in light mode and
                  // cream in dark mode, matching the site's border language.
                  border: '2px solid var(--color-text)',
                  borderRadius: 0,
                  boxShadow: '6px 6px 0px 0px var(--color-text)',
                  fontFamily: 'inherit',
                  padding: '14px 16px',
                },
                classNames: {
                  toast: 'dark:!bg-[var(--color-card)] dark:!text-[var(--color-text)] dark:!shadow-[6px_6px_0px_0px_rgba(255,239,205,0.2)]',
                  title: '!text-[11px] !font-medium !tracking-normal !leading-tight',
                  description:
                    '!text-[11px] !normal-case !tracking-normal !mt-1 !text-stone-500 dark:!text-[var(--color-text-secondary)]',
                  closeButton:
                    '!bg-transparent !border-2 !border-[var(--color-text)] dark:!border-[var(--color-text)] !rounded-none !p-1 !text-[var(--color-text)] dark:!text-[var(--color-text)] hover:!bg-[var(--color-text)] hover:!text-white dark:hover:!bg-[var(--color-text)] dark:hover:!text-[var(--color-bg)] !transition-colors',
                  success: '!border-emerald-700 dark:!border-emerald-400',
                  error: '!border-orange-700 dark:!border-orange-400',
                  warning: '!border-orange-700 dark:!border-orange-400',
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
