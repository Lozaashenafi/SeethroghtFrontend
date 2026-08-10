import { useState } from 'react';
import {
  Check,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useIndustries } from '@/hooks';
import { adminUpdateCompany } from '@/services/admin.service';
import { createCompany } from '@/services/companies.service';
import { toast } from 'sonner';
import type { Company } from '@/types';

interface CompanyEditModalProps {
  company: Company | null;
  onClose: () => void;
  onSaved: (company: Company | null) => void;
}

export function CompanyEditModal({ company, onClose, onSaved }: CompanyEditModalProps) {
  const [name, setName] = useState(company?.name ?? '');
  const [slug, setSlug] = useState(company?.slug ?? '');
  const [website, setWebsite] = useState(company?.website ?? '');
  const [country, setCountry] = useState(company?.country ?? '');
  const [city, setCity] = useState(company?.city ?? '');
  const [description, setDescription] = useState(company?.description ?? '');
  const [industryId, setIndustryId] = useState(company?.industryId ?? '');
  const [verified, setVerified] = useState(company?.verified ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: industries } = useIndustries();

  const isEditing = !!company;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await toast.promise(
          adminUpdateCompany(company.slug, {
            name: name || undefined,
            website: website || null,
            country: country || null,
            city: city || null,
            description: description || null,
            verified,
          }),
          { loading: 'Updating...', success: 'Company updated!', error: 'Failed to update' }
        );
      } else {
        await toast.promise(
          createCompany({ name, slug, website: website || undefined, country: country || undefined, city: city || undefined, description: description || undefined, industryId }),
          { loading: 'Creating...', success: 'Company created!', error: 'Failed to create' }
        );
      }
      onSaved(company);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-none border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-[var(--color-paper)] dark:bg-[var(--color-card)] p-6 shadow-[10px_10px_0px_0px_var(--color-text)] dark:shadow-[10px_10px_0px_0px_rgba(255,239,205,0.15)]" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
          {isEditing ? `Edit ${company.name}` : 'Add Company'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} required={!isEditing} />
          <Input label="Slug" value={slug} onChange={e => setSlug(e.target.value)} required={!isEditing}
            placeholder="my-company" disabled={isEditing} helperText="Lowercase with dashes" />
          <Input label="Website" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Country" value={country} onChange={e => setCountry(e.target.value)} />
            <Input label="City" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          {!isEditing && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">Industry</label>
              <select value={industryId} onChange={e => setIndustryId(e.target.value)} required
                className="w-full rounded-none border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
              >
                <option value="">Select industry...</option>
                {industries?.map(ind => <option key={ind.id} value={ind.id}>{ind.name}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              className="w-full rounded-none border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] dark:text-[var(--color-text)] placeholder:text-[var(--color-text)]/35 dark:placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 resize-y"
            />
          </div>
          {isEditing && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setVerified(!verified)}
                className={`flex h-5 w-5 items-center justify-center rounded-none border-2 transition-colors ${
                  verified ? 'border-[var(--color-text)] bg-[var(--color-text)] dark:border-[var(--color-text)] dark:bg-[var(--color-text)]' : 'border-stone-300 dark:border-[var(--color-border)]'
                }`}
              >
                {verified && <Check size={12} className="text-white dark:text-[var(--color-bg)]" />}
              </div>
              <span className="text-xs font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">Verified company</span>
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>{isEditing ? 'Save Changes' : 'Create Company'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
