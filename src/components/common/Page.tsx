import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { pageTransition } from '@/lib/animations';

interface PageProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function Page({ children, title, description, className }: PageProps) {
  return (
    <motion.main
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn('min-h-screen', className)}
    >
      {(title || description) && (
        <div className="mx-auto max-w-2xl px-4 pt-8 text-center sm:pt-12 sm:px-6 lg:px-8">
          {title && (
            <h1 className="text-3xl font-semibold text-brand-olive dark:text-brand-cream sm:text-4xl">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-3 text-text-secondary">{description}</p>
          )}
        </div>
      )}
      {children}
    </motion.main>
  );
}
