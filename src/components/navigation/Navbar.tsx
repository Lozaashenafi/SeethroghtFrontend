import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Eye, Pencil, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import { MobileNav } from './MobileNav';
import { Button } from '@/components/ui';
import { ROUTES } from '@/constants';

const navLinks = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Companies', href: ROUTES.COMPANY },
  { label: 'Reviews', href: ROUTES.REVIEW },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-30 border-b-4 border-[#2b2f23] dark:border-[var(--color-text)] bg-[#F4F1EA] dark:bg-[var(--color-bg)]">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Section */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter italic text-[#2b2f23] dark:text-[var(--color-text)]"
          >
            <div className="bg-[#2b2f23] dark:bg-[var(--color-text)] p-1">
                <Eye size={20} className="text-white dark:text-[var(--color-bg)]" />
            </div>
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
                    'relative flex h-full items-center text-xs font-black uppercase tracking-[0.2em] transition-colors duration-200',
                    isActive
                      ? 'text-[#2b2f23] dark:text-[var(--color-text)]'
                      : 'text-stone-400 dark:text-[var(--color-text-secondary)] hover:text-[#2b2f23] dark:hover:text-[var(--color-text)]',
                  )}
                >
                  {link.label}
                  {isActive && (
                    <div className="absolute bottom-[-4px] left-0 right-0 h-1 bg-[#2b2f23] dark:bg-[var(--color-text)]" />
                  )}
                </Link>
              );
            })}
            
            <div className="ml-4 h-10 border-l-2 border-[#2b2f23]/10 dark:border-[var(--color-border)] pl-8 flex items-center">
              <Link to={ROUTES.CREATE_REVIEW}>
                <button className="flex items-center gap-2 bg-[#2b2f23] dark:bg-[var(--color-text)] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white dark:text-[var(--color-bg)] hover:opacity-90 transition-all active:translate-y-0.5">
                  <Plus size={14} />
                  Write Review
                </button>
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
               {/* Custom styled search for navbar to match brutalist input */}
               <SearchBar className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]" />
            </div>
            
            <ThemeToggle className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] hover:bg-[#2b2f23] hover:text-white dark:hover:bg-[var(--color-text)] dark:hover:text-[var(--color-bg)] transition-colors" />
            
            <button
              onClick={() => setMobileOpen(true)}
              className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] p-2 text-[#2b2f23] dark:text-[var(--color-text)] md:hidden active:bg-[#2b2f23] active:text-white"
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