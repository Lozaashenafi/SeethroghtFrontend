import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { getApiErrorMessage } from '@/utils';
import { toast } from 'sonner';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB — must match backend limit
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

interface LogoUploadProps {
  /** Company name — used for the fallback initial in the preview. */
  name: string;
  /** Current logo URL (null = none). */
  value: string | null;
  /** Called with the new URL after a successful upload, or null on remove. */
  onChange: (url: string | null) => void;
  /**
   * Performs the actual upload and resolves with the stored URL. Supplied by
   * the parent so user-side (generic endpoint) and admin-side (one-shot
   * company endpoint) flows can differ.
   */
  upload: (file: File) => Promise<string>;
}

/**
 * File picker for company logos. Validates type/size client-side, uploads via
 * the provided `upload` callback, previews the result, and offers removal.
 * A manually-entered or scraped URL can still coexist — uploading replaces it.
 */
export function LogoUpload({ name, value, onChange, upload }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Unsupported image type. Use PNG, JPEG, or WebP.');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error('Image is too large. Maximum size is 2 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await upload(file);
      onChange(url);
      toast.success('Logo uploaded!');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload logo'));
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
        Logo
      </label>
      <div className="flex items-center gap-4">
        <CompanyLogo
          name={name || 'Company'}
          logoUrl={value}
          size="h-16 w-16"
          fallbackTextSize="text-2xl"
        />
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] font-medium text-xs text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-stone-100 dark:hover:bg-[var(--color-card)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} />
              )}
              {isUploading ? 'Uploading...' : 'Upload image'}
            </button>
            {value && !isUploading && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-stone-300 dark:border-[var(--color-border)] font-medium text-xs text-stone-500 dark:text-[var(--color-text-secondary)] hover:border-red-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Remove
              </button>
            )}
          </div>
          <p className="text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
            PNG, JPEG, or WebP · max 2 MB{value ? '' : ' · optional'}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
