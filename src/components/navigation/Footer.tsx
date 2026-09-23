import { Link } from 'react-router-dom';
import { Container } from '@/components/common';
import { Logo } from '@/components/ui';
import { ROUTES, APP_TAGLINE } from '@/constants';

const footerLinks = [
  {
    title: 'Navigate',
    links: [
      { label: 'Home', href: ROUTES.HOME },
      { label: 'Companies', href: ROUTES.COMPANY },
      { label: 'Reviews', href: ROUTES.REVIEW },
      { label: 'About', href: ROUTES.ABOUT },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Use', href: '#' },
      { label: 'Contact Dept.', href: '#' },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] pt-10 sm:pt-16 pb-8" role="contentinfo">
      <Container size="lg">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Tagline Section */}
          <div className="lg:col-span-2">
            <Link
              to={ROUTES.HOME}
              className="mb-6 flex items-center gap-2 text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]"
            >
              <Logo className="h-8 w-8" />
              <span>See Through</span>
            </Link>
            <p className="max-w-sm text-sm text-stone-500 dark:text-[var(--color-text-secondary)] leading-relaxed">
              "{APP_TAGLINE}"
            </p>
          </div>

          {/* Navigation Groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-6 text-[10px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] border-b border-[var(--color-text)]/20 dark:border-[var(--color-border)] pb-2">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs font-medium text-stone-500 dark:text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] flex items-center gap-2 group"
                    >
                      <span className="h-1 w-1 bg-[var(--color-text)] dark:bg-[var(--color-text)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section - "The Receipt" style */}
        <div className="mt-12 sm:mt-20 border-t-2 border-[var(--color-text)] dark:border-[var(--color-text)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[10px] font-medium tracking-normal text-stone-400 dark:text-[var(--color-text-secondary)]">
            Log Number: {year}-ST-BRUTALIST
          </div>
          
          <div className="text-[10px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            &copy; {year} See Through Ledger. No Rights Reserved.
          </div>

          <div className="flex gap-4">
             {/* Small decorative blocks to enhance the ledger look */}
             <div className="h-4 w-4 bg-[var(--color-text)] dark:bg-[var(--color-text)]" />
             <div className="h-4 w-4 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]" />
             <div className="h-4 w-4 bg-stone-300 dark:bg-[var(--color-card)]" />
          </div>
        </div>
      </Container>
    </footer>
  );
}