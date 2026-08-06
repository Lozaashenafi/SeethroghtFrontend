import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Building2, ArrowLeft, Send, Globe, Search, Loader2, Sparkles } from 'lucide-react';
import { Container } from '@/components/common';
import { useIndustries } from '@/hooks';
import { createCompany, scrapeCompanyWebsite, type ScrapedCompanyData } from '@/services/companies.service';
import { getApiErrorMessage } from '@/utils';
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
  const [isScraping, setIsScraping] = useState(false);

  const [name, setName] = useState(prefillName);
  const [slug, setSlug] = useState(prefillSlug);
  const [website, setWebsite] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [industryId, setIndustryId] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');

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

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) {
      toast.error('Please enter a website URL');
      return;
    }
    setIsScraping(true);
    try {
      const data: ScrapedCompanyData = await scrapeCompanyWebsite(scrapeUrl.trim());
      let filledCount = 0;

      if (data.name) {
        handleNameChange(data.name);
        filledCount++;
      }
      if (data.description) {
        setDescription(data.description);
        filledCount++;
      }
      if (data.country) {
        setCountry(data.country);
        filledCount++;
      }
      if (data.city) {
        setCity(data.city);
        filledCount++;
      }
      if (data.industrySlug && industries) {
        const match = industries.find((ind) => ind.slug === data.industrySlug);
        if (match) {
          setIndustryId(match.id);
          filledCount++;
        }
      }
      if (data.logoUrl) {
        // Logo is scraped but not stored as a form field;
        // we could use it for preview in the future
      }

      setWebsite(scrapeUrl.trim());

      toast.success(
        `Scraped successfully! ${filledCount > 0 ? `Filled ${filledCount} field${filledCount > 1 ? 's' : ''}.` : 'No additional data found — you can fill manually.'}`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to scrape website. Check the URL and try again.'));
    } finally {
      setIsScraping(false);
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
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create company'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper-warm)] dark:bg-[var(--color-bg)] text-[var(--color-text)] dark:text-[var(--color-text)] selection:bg-[var(--color-text)] dark:selection:bg-[var(--color-text)] selection:text-stone-50 dark:selection:text-[var(--color-bg)]">
      {/* Background Grid */}
      <div
        className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />

      <Container size="md" className="relative z-10 py-16">
        <Link
          to="/company"
          className="mb-8 inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Companies
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-5 mb-4">
            <div className="h-16 w-16 flex items-center justify-center border-4 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
              <Building2 size={28} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-[var(--color-text)] dark:text-[var(--color-text)] leading-none">
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
            {/* ─────────────── Scrape from Website ─────────────── */}
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                <Sparkles size={18} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text)] dark:text-[var(--color-text)]">
                  Quick Add — Scrape from Website
                </h2>
              </div>
              <p className="text-sm font-serif text-stone-500 dark:text-[var(--color-text-secondary)] mb-5">
                Enter a company's website URL and we'll automatically pull their info — name, description, location, and industry.
              </p>
              <div className="flex items-stretch gap-3">
                <div className="flex-1 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] flex items-center px-4">
                  <Globe size={16} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-3 shrink-0" />
                  <input
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleScrape())}
                    placeholder="https://example.com"
                    className="w-full py-3 text-sm outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={isScraping || !scrapeUrl.trim()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-xs uppercase tracking-widest border-4 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[4px_4px_0px_0px_var(--color-text)] dark:shadow-[4px_4px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {isScraping ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} />
                  )}
                  {isScraping ? 'Scraping...' : 'Scrape Data'}
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text)] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                Basic Information
              </h2>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Company Name *
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Slug *
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Industry *
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
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
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Website
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] flex items-center px-4">
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
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text)] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                Location
              </h2>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Country
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <input
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States"
                      className="w-full px-4 py-3 text-sm outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--color-text)] dark:text-[var(--color-text)]">
                    City
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
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
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--color-text)] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                Description
              </h2>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--color-text)] dark:text-[var(--color-text)]">
                  About the company
                </label>
                <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
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
                <span className="inline-flex items-center gap-2 px-6 py-4 font-black text-xs uppercase tracking-widest text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)] transition-colors cursor-pointer">
                  Cancel
                </span>
              </Link>
              <button
                type="submit"
                disabled={!name.trim() || !slug.trim() || !industryId}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-black text-xs uppercase tracking-widest border-4 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[6px_6px_0px_0px_var(--color-text)] dark:shadow-[6px_6px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
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
