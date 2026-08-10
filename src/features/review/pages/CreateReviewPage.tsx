import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Briefcase,
  ArrowLeft,
  Send,
  Check,
  X,
} from 'lucide-react';
import { Container } from '@/components/common';
import { useCreateReview, useCompanies, useCompany, useTags, useDebounce } from '@/hooks';
import { useAnonymous } from '@/context/AnonymousContext';
import { ROUTES } from '@/constants';
import { getApiErrorMessage } from '@/utils';
import { toast } from 'sonner';
import { tornEffect, cardShadow } from '@/constants/brand';
import type { Tag } from '@/types';

const employmentOptions = [
  { value: '', label: 'Select employment type...' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
  { value: 'freelance', label: 'Freelance' },
] as const;

type EmploymentStatusValue = (typeof employmentOptions)[number]['value'];

const ratingLabels: Record<string, string> = {
  workLifeBalance: 'Work/Life Balance',
  culture: 'Culture',
  management: 'Management',
  compensation: 'Compensation',
  opportunities: 'Opportunities',
};

const ratingDescriptions: Record<string, string> = {
  workLifeBalance: 'How well does the company support work/life balance?',
  culture: 'How would you rate the company culture?',
  management: 'How effective is the management team?',
  compensation: 'How satisfied are you with compensation and benefits?',
  opportunities: 'How are the growth and promotion opportunities?',
};

function DiamondRatingInput({
  value,
  onChange,
  label,
  description,
}: {
  value: number | null;
  onChange: (rating: number) => void;
  label: string;
  description?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
        {label}
      </span>
      {description && (
        <span className="block text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)] ">
          {description}
        </span>
      )}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className="p-1 cursor-pointer"
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          >
            <div
              className={`w-5 h-5 rotate-45 border-2 transition-all ${
                star <= (hovered ?? value ?? 0)
                  ? 'bg-[var(--color-text)] border-[var(--color-text)] dark:bg-[var(--color-text)] dark:border-[var(--color-text)] scale-110'
                  : 'bg-transparent border-stone-300 dark:border-[var(--color-border)] hover:border-[var(--color-text)] dark:hover:border-[var(--color-text)]'
              }`}
            />
          </button>
        ))}
        {value && (
          <span className="ml-2 text-xs font-medium text-stone-500 dark:text-[var(--color-text-secondary)]">
            {value}/5
          </span>
        )}
      </div>
    </div>
  );
}

function CompanySearchSelect({
  onChange,
  presetName,
}: {
  onChange: (slug: string, name: string) => void;
  /** Name of a company preselected via the ?company= URL param. */
  presetName?: string;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedName, setSelectedName] = useState(presetName ?? '');
  const userInteractedRef = useRef(false);
  const debouncedSearch = useDebounce(search, 300);

  // Reflect the URL-preselected company once its details load, unless the user
  // has already changed/cleared the selection (so a later URL change doesn't
  // silently override their choice).
  useEffect(() => {
    if (presetName && !userInteractedRef.current) {
      setSelectedName(presetName);
    }
  }, [presetName]);
  const { data, isLoading } = useCompanies({
    search: debouncedSearch || undefined,
    limit: 8,
  });

  const companies = data?.companies ?? [];

  const handleSelect = (slug: string, name: string) => {
    userInteractedRef.current = true;
    onChange(slug, name);
    setSelectedName(name);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
        Company
      </span>
      <div className="relative">
        {selectedName ? (
          <div className="flex items-center justify-between border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[var(--color-text)] dark:text-[var(--color-text)]" />
              <span className="text-sm font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">{selectedName}</span>
            </div>
            <button
              type="button"
              onClick={() => { userInteractedRef.current = true; onChange('', ''); setSelectedName(''); }}
              className="p-1 hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] flex items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (companies.length === 1) {
                    handleSelect(companies[0].slug, companies[0].name);
                  }
                }}
                placeholder="Search a company..."
                className="flex-1 px-4 py-3 text-sm font-medium tracking-normal outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
              />
            </div>
            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <div className="absolute z-20 mt-2 w-full bg-white dark:bg-[var(--color-card)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[8px_8px_0px_0px_var(--color-text)] dark:shadow-[8px_8px_0px_0px_rgba(255,239,205,0.2)]">
                  {isLoading ? (
                    <div className="p-4 text-center text-sm text-stone-500 dark:text-[var(--color-text-secondary)] ">Searching...</div>
                  ) : companies.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-stone-500 dark:text-[var(--color-text-secondary)] ">
                        {search ? `No results for "${search}"` : 'Type to search'}
                      </p>
                      {search && (
                        <Link
                          to={`${ROUTES.CREATE_COMPANY}?name=${encodeURIComponent(search)}`}
                          onClick={() => setIsOpen(false)}
                          className="mt-3 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] hover:opacity-70 transition-opacity"
                        >
                          <Building2 size={14} />
                          Create &ldquo;{search}&rdquo; as new
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-auto">
                      {companies.map((company) => (
                        <button
                          key={company.id}
                          type="button"
                          onClick={() => handleSelect(company.slug, company.name)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-stone-100 dark:hover:bg-[var(--color-surface)] transition-colors border-b border-stone-200 dark:border-[var(--color-border)] last:border-0"
                        >
                          <div className="h-8 w-8 flex items-center justify-center border border-[var(--color-text)] dark:border-[var(--color-text)] text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                            {company.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">{company.name}</span>
                            {(company.city || company.country) && (
                              <span className="ml-2 text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)] ">
                                {company.city ?? company.country}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TagSelector({
  tags,
  selectedIds,
  onChange,
}: {
  tags: Tag[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggleTag = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((t) => t !== id));
    } else if (selectedIds.length < 10) {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
        Tags
      </span>
      <span className="block text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)] ">
        Select up to 10 tags
      </span>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-normal border-2 transition-all ${
                isSelected
                  ? 'bg-[var(--color-text)] border-[var(--color-text)] text-white dark:bg-[var(--color-text)] dark:border-[var(--color-text)] dark:text-[var(--color-bg)]'
                  : 'bg-transparent border-[var(--color-text)] dark:border-[var(--color-text)] text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)]'
              }`}
            >
              {isSelected && <Check size={12} />}
              {tag.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CreateReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillCompanySlug = searchParams.get('company');
  const { data: prefillCompany } = useCompany(prefillCompanySlug ?? undefined);

  const createReview = useCreateReview();
  const { data: tagsData } = useTags();
  const tags = tagsData ?? [];
  const { identity, regenerate } = useAnonymous();
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerateNickname = async () => {
    setRegenerating(true);
    try {
      await regenerate();
      toast.success('Your display name has been changed');
    } catch {
      toast.error(getApiErrorMessage(new Error('nickname'), 'Failed to change display name. It can only be changed once.'));
    } finally {
      setRegenerating(false);
    }
  };

  const [companySlug, setCompanySlug] = useState(prefillCompanySlug ?? '');
  const [title, setTitle] = useState('');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [workLifeBalance, setWorkLifeBalance] = useState<number | null>(null);
  const [culture, setCulture] = useState<number | null>(null);
  const [management, setManagement] = useState<number | null>(null);
  const [compensation, setCompensation] = useState<number | null>(null);
  const [opportunities, setOpportunities] = useState<number | null>(null);
  const [isCurrentEmployee, setIsCurrentEmployee] = useState(false);
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatusValue>('');
  const [jobTitle, setJobTitle] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // The overall rating is not entered directly — it is derived as the average of
  // the five category ratings, so it always reflects what the reviewer actually
  // selected. Rounded to the nearest whole number (the backend stores an int).
  const subRatingFields = [
    { key: 'workLifeBalance', value: workLifeBalance, setter: setWorkLifeBalance },
    { key: 'culture', value: culture, setter: setCulture },
    { key: 'management', value: management, setter: setManagement },
    { key: 'compensation', value: compensation, setter: setCompensation },
    { key: 'opportunities', value: opportunities, setter: setOpportunities },
  ] as const;

  const filledSubRatings = subRatingFields
    .map((field) => field.value)
    .filter((rating): rating is number => rating !== null);

  const computedOverallRating: number | null =
    filledSubRatings.length > 0
      ? Math.round(
          filledSubRatings.reduce((sum, rating) => sum + rating, 0) / filledSubRatings.length,
        )
      : null;

  const validate = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!companySlug) newErrors.company = 'Please select a company';
    if (!title.trim() || title.trim().length < 10) newErrors.title = 'Title must be at least 10 characters';
    if (title.trim().length > 200) newErrors.title = 'Title must be at most 200 characters';
    if (pros && pros.length > 2000) newErrors.pros = 'Pros must be at most 2000 characters';
    if (cons && cons.length > 2000) newErrors.cons = 'Cons must be at most 2000 characters';
    if (jobTitle && jobTitle.length > 100) newErrors.jobTitle = 'Job title must be at most 100 characters';
    setErrors(newErrors);
    return newErrors;
  }, [companySlug, title, pros, cons, jobTitle]);

  // Scroll the first invalid field into view so the inline error is visible.
  const focusFirstError = useCallback((validationErrors: Record<string, string>) => {
    const firstKey = Object.keys(validationErrors)[0];
    if (!firstKey) return;
    document
      .querySelector(`[data-field="${firstKey}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      const messages = Object.values(validationErrors);
      toast.error(`Please fix the form errors: ${messages.join(' ')}`);
      focusFirstError(validationErrors);
      return;
    }
    try {
      const review = await createReview.mutateAsync({
        companySlug,
        title: title.trim(),
        pros: pros.trim() || undefined,
        cons: cons.trim() || undefined,
        overallRating: computedOverallRating ?? undefined,
        workLifeBalance: workLifeBalance ?? undefined,
        culture: culture ?? undefined,
        management: management ?? undefined,
        compensation: compensation ?? undefined,
        opportunities: opportunities ?? undefined,
        isCurrentEmployee: isCurrentEmployee || undefined,
        employmentStatus: employmentStatus === '' ? undefined : employmentStatus,
        jobTitle: jobTitle.trim() || undefined,
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      toast.success('Your review has been posted!');
      navigate(`/review/${review.publicId}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit review. Please try again.'));
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
          to="/review"
          className="mb-8 inline-flex items-center gap-2 font-medium text-xs tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Reviews
        </Link>

        <header className="mb-10">
          <h1 className="text-4xl font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
            Write a Review
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-[var(--color-text-secondary)]">
            Share your anonymous experience. No retaliation, no regrets.
          </p>
        </header>

        {identity?.nickname && (
          <div className="mb-8 bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-5 border-2 border-[var(--color-text)] dark:border-[var(--color-text)]" style={cardShadow}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-medium tracking-normal text-stone-500 dark:text-[var(--color-text-secondary)]">
                  YOU ARE POSTING AS
                </p>
                <p className="mt-1 text-lg font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                  {identity.nickname}
                </p>
              </div>
              {!identity.nicknameRegeneratedAt && (
                <button
                  type="button"
                  onClick={handleRegenerateNickname}
                  disabled={regenerating}
                  className="inline-flex items-center gap-2 px-4 py-2 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  {regenerating ? 'Changing...' : 'Change display name'}
                </button>
              )}
            </div>
            {identity.nicknameRegeneratedAt ? (
              <p className="mt-2 text-[11px] text-stone-400 dark:text-[var(--color-text-secondary)]">
                Your display name can only be changed once.
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-stone-400 dark:text-[var(--color-text-secondary)]">
                This name is shown next to your review. You can change it once.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Company */}
            {/* NOTE: no tornEffect clipPath on this card because the dropdown would be clipped */}
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" data-field="company" style={{ ...cardShadow }}>
              <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                Company
              </h2>
              <CompanySearchSelect
                presetName={prefillCompany?.name}
                onChange={(slug) => { setCompanySlug(slug); if (slug) setErrors(p => ({ ...p, company: '' })); }}
              />
              {errors.company && <p className="mt-1.5 text-[11px] font-medium tracking-normal text-orange-700 dark:text-orange-400">{errors.company}</p>}
            </div>

            {/* Ratings */}
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                Ratings
              </h2>
              <div className="space-y-2">
                {subRatingFields.map((field) => (
                  <DiamondRatingInput
                    key={field.key}
                    label={ratingLabels[field.key]}
                    description={ratingDescriptions[field.key]}
                    value={field.value}
                    onChange={(rating) => field.setter(rating)}
                  />
                ))}
              </div>

              {/* Calculated overall — read-only, derived from the categories above */}
              <div className="mt-6 flex items-center justify-between border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] px-4 py-3">
                <div>
                  <span className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Overall Rating
                  </span>
                  <span className="block text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
                    Calculated from your five category ratings above
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {computedOverallRating ? (
                    <>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`h-3.5 w-3.5 rotate-45 border-2 ${
                              star <= computedOverallRating
                                ? 'bg-[var(--color-text)] border-[var(--color-text)] dark:bg-[var(--color-text)] dark:border-[var(--color-text)]'
                                : 'bg-transparent border-stone-300 dark:border-[var(--color-border)]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-text)]">
                        {computedOverallRating}/5
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] text-stone-400 dark:text-[var(--color-text-secondary)]">
                      Select category ratings to compute
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Review Details */}
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                Your Review
              </h2>
              <div className="space-y-5">
                <div className="space-y-1.5" data-field="title">
                  <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Review Title *
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <input
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: '' })); }}
                      placeholder="Summarize your experience..."
                      maxLength={200}
                      className="w-full px-4 py-3 text-sm font-medium tracking-normal outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                  {errors.title && <p className="text-[11px] font-medium tracking-normal text-orange-700 dark:text-orange-400">{errors.title}</p>}
                </div>

                <div className="space-y-1.5" data-field="pros">
                  <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Pros
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <textarea
                      value={pros}
                      onChange={(e) => { setPros(e.target.value); if (errors.pros) setErrors(p => ({ ...p, pros: '' })); }}
                      placeholder="What did you like about working here?"
                      rows={4}
                      maxLength={2000}
                      className="w-full px-4 py-3 text-sm outline-none bg-transparent resize-y dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                  {errors.pros && <p className="text-[11px] font-medium tracking-normal text-orange-700 dark:text-orange-400">{errors.pros}</p>}
                </div>

                <div className="space-y-1.5" data-field="cons">
                  <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Cons
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <textarea
                      value={cons}
                      onChange={(e) => { setCons(e.target.value); if (errors.cons) setErrors(p => ({ ...p, cons: '' })); }}
                      placeholder="What could be improved?"
                      rows={4}
                      maxLength={2000}
                      className="w-full px-4 py-3 text-sm outline-none bg-transparent resize-y dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                  {errors.cons && <p className="text-[11px] font-medium tracking-normal text-orange-700 dark:text-orange-400">{errors.cons}</p>}
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
              <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                Job Details
              </h2>
              <div className="space-y-5">
                <div className="space-y-1.5" data-field="jobTitle">
                  <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Job Title
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] flex items-center px-4">
                    <Briefcase size={16} className="text-stone-400 dark:text-[var(--color-text-secondary)] mr-3 shrink-0" />
                    <input
                      value={jobTitle}
                      onChange={(e) => { setJobTitle(e.target.value); if (errors.jobTitle) setErrors(p => ({ ...p, jobTitle: '' })); }}
                      placeholder="e.g. SOFTWARE ENGINEER"
                      maxLength={100}
                      className="w-full py-3 text-sm font-medium tracking-normal outline-none bg-transparent dark:placeholder-[var(--color-text-secondary)]"
                    />
                  </div>
                  {errors.jobTitle && <p className="text-[11px] font-medium tracking-normal text-orange-700 dark:text-orange-400">{errors.jobTitle}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    Employment Status
                  </label>
                  <div className="border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)]">
                    <select
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatusValue)}
                      className="w-full px-4 py-3 text-sm font-medium tracking-normal outline-none bg-transparent dark:text-[var(--color-text)]"
                    >
                      {employmentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setIsCurrentEmployee(!isCurrentEmployee)}
                    className={`flex h-6 w-6 items-center justify-center border-2 transition-colors ${
                      isCurrentEmployee
                        ? 'bg-[var(--color-text)] border-[var(--color-text)] dark:bg-[var(--color-text)] dark:border-[var(--color-text)]'
                        : 'border-stone-300 dark:border-[var(--color-border)]'
                    }`}
                  >
                    {isCurrentEmployee && <Check size={14} className="text-white dark:text-[var(--color-bg)]" />}
                  </div>
                  <span className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
                    I currently work here
                  </span>
                </label>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-8 border border-stone-200 dark:border-[var(--color-border)]" style={{ ...tornEffect, ...cardShadow }}>
                <h2 className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] mb-6 pb-3 border-b-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
                  Tags
                </h2>
                <TagSelector tags={tags} selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Link to={ROUTES.REVIEW}>
                <span className="inline-flex items-center gap-2 px-6 py-4 font-medium text-xs tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)] border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:bg-stone-200 dark:hover:bg-[var(--color-card)] transition-colors cursor-pointer">
                  Cancel
                </span>
              </Link>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs tracking-normal border-4 border-[var(--color-text)] dark:border-[var(--color-text)] shadow-[6px_6px_0px_0px_var(--color-text)] dark:shadow-[6px_6px_0px_0px_rgba(255,239,205,0.2)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createReview.isPending ? (
                  <><svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Posting...</>
                ) : (
                  <><Send size={16} /> Post Review</>
                )}
              </button>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
