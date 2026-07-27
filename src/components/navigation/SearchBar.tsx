import { useState, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useClickOutside } from '@/hooks';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/constants';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {isOpen ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies..."
              className="w-48 rounded-lg border bg-surface py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 sm:w-64"
              autoFocus
              aria-label="Search companies"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
            className="rounded-lg p-1.5 text-text-secondary hover:text-text hover:bg-brand-olive/5 dark:hover:bg-brand-cream/5"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex items-center gap-2 rounded-lg p-2 text-text-secondary hover:text-text hover:bg-brand-olive/5 dark:hover:bg-brand-cream/5 transition-colors"
          aria-label="Open search"
        >
          <Search size={18} />
          <span className="hidden text-sm sm:inline">Search</span>
        </button>
      )}
    </div>
  );
}
