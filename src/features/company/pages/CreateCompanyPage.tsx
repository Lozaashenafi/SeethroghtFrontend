import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Building2, ArrowLeft, Send, Globe } from 'lucide-react';
import { Container } from '@/components/common';
import { useIndustries } from '@/hooks';
import { createCompany } from '@/services/companies.service';
import { toast } from 'sonner';
import { tornEffect, cardShadow } from '@/constants/brand';

export function CreateCompanyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillName = searchParams.get('name') || '';
  const prefillSlug = prefillName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const { data: industries } = useIndustries();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(prefillName);
  const [slug, setSlug] = useState(prefillSlug);
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [industryId, setIndustryId] = useState('');

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !industryId) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsLoading(true);
    try {
      await createCompany({
        name: name.trim(),
        slug: slug.trim(),
        industryId,
        website: website.trim() || undefined,
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        description: description.trim() || undefined,
      });
      toast.success('Company added!');
      navigate(`/company/${slug.trim()}`);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create company';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[var(--color-bg)] text-[#2b2f23] dark:text-[var(--color-text)] selection:bg-[#2b2f23] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        <Link
          to="/company"
          className="mb-8 inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[#2b2f23] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Companies
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-5 mb-4">
            <div className="h-16 w-16 flex items-center justify-center border-4 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
              <Building2 size={28} className="text-[#2b2f23] dark:text-[var(--color-text)]" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-[#2b2f23] dark:text-[var(--color-text)] italic leading-none">
                Add a Company
              </h1>
              <p className="mt-2 text-sm font-serif text-stone-500 dark:text-[var(--color-text-secondary)]">
                Help others by adding a company to the ledger
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#2b2f23] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[#2b2f23] dark:border-[var(--color-text)]">
                Basic Information
              </h2>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                    Company Name *
                  </label>
                  <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <input
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      required
                      className="w-full px-4 py-3 text-sm font-medium outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                    Slug *
                  </label>
                  <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="acme-corp"
                      required
                      className="w-full px-4 py-3 text-sm font-mono outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-stone-400 dark:text-[var(--color-text-secondary)] uppercase mt-1">
                    URL-friendly identifier (lowercase, dashes)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                    Industry *
                  </label>
                  <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <select
                      value={industryId}
                      onChange={(e) => setIndustryId(e.target.value)}
                      required
                      className="w-full px-4 py-3 text-sm outline-none bg-transparent dark:text-[var(--color-text)]"
                    >
                      <option value="">Select an industry...</option>
                      {industries?.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                    Website
                  </label>
                  <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] flex items-center px-4">
                    <Globe size={16} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-3 shrink-0" />
                    <input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full py-3 text-sm outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#2b2f23] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[#2b2f23] dark:border-[var(--color-text)]">
                Location
              </h2>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                    Country
                  </label>
                  <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States"
                      className="w-full px-4 py-3 text-sm outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                    City
                  </label>
                  <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. San Francisco"
                      className="w-full px-4 py-3 text-sm outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#FCFAF7] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#2b2f23] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[#2b2f23] dark:border-[var(--color-text)]">
                Description
              </h2>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#2b2f23] dark:text-[var(--color-text)]">
                  About the company
                </label>
                <div className="border-2 border-[#2b2f23] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about this company..."
                    rows={4}
                    className="w-full px-4 py-3 text-sm outline-none bg-transparent resize-y dark:placeholder-[var(--color-text-secondary)]"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Link to="/company">
                <span className="inline-flex items-center gap-2 px-6 py-4 font-black text-xs uppercase tracking-widest text-[#2b2f23] dark:text-[var(--color-text)] border-2 border-[#2b2f23] dark:border-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)] transition-colors cursor-pointer">
                  Cancel
                </span>
              </Link>
              <button
                type="submit"
                disabled={!name.trim() || !slug.trim() || !industryId}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#2b2f23] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-xs uppercase tracking-widest border-4 border-[#2b2f23] dark:border-[var(--color-text)] shadow-[6px_6px_0px_0px_#2b2f23] dark:shadow-[6px_6px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding...
                  </span>
                ) : (
                  <><Send size={16} /> Add Company</>
                )}
              </button>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
