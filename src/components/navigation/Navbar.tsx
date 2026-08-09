import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/ui';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import { MobileNav } from './MobileNav';
import { ROUTES } from '@/constants';

const navLinks = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Companies', href: ROUTES.COMPANY },
  { label: 'Reviews', href: ROUTES.REVIEW },
  { label: 'About', href: ROUTES.ABOUT },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-30 border-b-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)]">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
         
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-2xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]"
          >
            <Logo className="h-8 w-8" />
            <span>See Through</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex h-full">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'relative flex h-full items-center text-xs font-medium tracking-normal transition-colors duration-200',
                    isActive
                      ? 'text-[var(--color-text)] dark:text-[var(--color-text)]'
                      : 'text-stone-400 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)]',
                  )}
                >
                  {link.label}
                  {isActive && (
                    <div className="absolute bottom-[-4px] left-0 right-0 h-1 bg-[var(--color-text)] dark:bg-[var(--color-text)]" />
                  )}
                </Link>
              );
            })}
            
            <div className="ml-4 h-10 border-l-2 border-[var(--color-text)]/10 dark:border-[var(--color-border)] pl-8 flex items-center">
              <Link to={ROUTES.CREATE_REVIEW}>
                <button className="flex items-center gap-2 bg-[var(--color-text)] dark:bg-[var(--color-text)] px-5 py-2.5 text-[10px] font-medium tracking-normal text-white dark:text-[var(--color-bg)] hover:opacity-90 transition-all active:translate-y-0.5">
                  <Plus size={14} />
                  Write Review
                </button>
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
           
            
            <ThemeToggle className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-white dark:hover:bg-[var(--color-text)] dark:hover:text-[var(--color-bg)] transition-colors" />
            
            <button
              onClick={() => setMobileOpen(true)}
              className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] p-2 text-[var(--color-text)] dark:text-[var(--color-text)] md:hidden active:bg-[var(--color-text)] active:text-white"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Styling Overrides */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}