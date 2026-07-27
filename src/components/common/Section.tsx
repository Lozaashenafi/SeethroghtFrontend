import { type HTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { fadeInUp } from '@/lib/animations';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  animate?: boolean;
  padded?: boolean;
}

export function Section({
  children,
  title,
  subtitle,
  animate = false,
  padded = true,
  className,
  ...props
}: SectionProps) {
  const content = (
    <>
      {title && (
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-semibold text-brand-olive dark:text-brand-cream sm:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-text-secondary">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </>
  );

  if (animate) {
    const motionProps: HTMLMotionProps<'section'> = {
      variants: fadeInUp,
      initial: 'hidden',
      whileInView: 'visible',
      viewport: { once: true, margin: '-50px' },
    };

    return (
      <motion.section
        className={cn(padded && 'py-12 sm:py-16 lg:py-20', className)}
        {...motionProps}
        {...(props as HTMLMotionProps<'section'>)}
      >
        {content}
      </motion.section>
    );
  }

  return (
    <section className={cn(padded && 'py-12 sm:py-16 lg:py-20', className)} {...props}>
      {content}
    </section>
  );
}
