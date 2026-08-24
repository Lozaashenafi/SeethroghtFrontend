import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2, UploadCloud, X } from 'lucide-react';
import { CompanyLogo } from './CompanyLogo';
import { getApiErrorMessage } from '@/utils';
import { toast } from 'sonner';

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB — must match backend limit
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

type LogoMode = 'upload' | 'url';

interface LogoUploadProps {
  /** Company name — used for the fallback initial in the preview. */
  name: string;
  /** Current logo URL (null/'' = none). */
  value: string | null;
  /** Called with the new URL after upload/paste, or null on remove. */
  onChange: (url: string | null) => void;
  /**
   * Performs the actual upload and resolves with the stored URL. Supplied by
   * the parent so user-side (generic endpoint) and admin-side (one-shot
   * company endpoint) flows can differ.
   */
  upload: (file: File) => Promise<string>;
}

/**
 * Company logo picker with two sources:
 *  - Upload image → validated client-side, uploaded via `upload` callback
 *  - Paste URL    → for external/hotlinked logos (e.g. scraped ones)
 * Both feed the same preview; uploading or saving a URL replaces the other.
 */
export function LogoUpload({ name, value, onChange, upload }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState<LogoMode>('upload');
  const [draftUrl, setDraftUrl] = useState('');

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

  const applyDraftUrl = () => {
    const trimmed = draftUrl.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed); // validity check only
    } catch {
      toast.error('Please enter a valid URL (starting with https://)');
      return;
    }
    onChange(trimmed);
    setDraftUrl('');
    toast.success('Logo URL saved!');
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium tracking-normal text-[var(--color-text)] dark:text-[var(--color-text)]">
        Logo
      </label>
      <div className="flex items-start gap-4">
        <CompanyLogo
          name={name || 'Company'}
          logoUrl={value}
          size="h-16 w-16"
          fallbackTextSize="text-2xl"
        />
        <div className="min-w-0 flex-1 space-y-2">
          {/* Mode toggle */}
          <div className="inline-flex border-2 border-[var(--color-text)] dark:border-[var(--color-text)]">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs transition-colors ${
                mode === 'upload'
                  ? 'bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)]'
                  : 'text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-stone-100 dark:hover:bg-[var(--color-card)]'
              }`}
            >
              <ImagePlus size={12} />
              Upload image
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs transition-colors ${
                mode === 'url'
                  ? 'bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)]'
                  : 'text-[var(--color-text)] dark:text-[var(--color-text)] hover:bg-stone-100 dark:hover:bg-[var(--color-card)]'
              }`}
            >
              <Link2 size={12} />
              Use URL
            </button>
          </div>

          {mode === 'upload' ? (
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
                  <UploadCloud size={14} />
                )}
                {isUploading ? 'Uploading...' : 'Choose file'}
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
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyDraftUrl())}
                placeholder="https://example.com/logo.png"
                className="w-full sm:flex-1 min-w-0 px-3 py-2 text-sm outline-none border-2 border-[var(--color-text)] dark:border-[var(--color-text)] bg-white dark:bg-[var(--color-surface)] dark:text-[var(--color-text)] dark:placeholder:text-[var(--color-text-secondary)]/50"
              />
              <button
                type="button"
                disabled={!draftUrl.trim()}
                onClick={applyDraftUrl}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-text)] dark:bg-[var(--color-text)] text-white dark:text-[var(--color-bg)] font-medium text-xs border-2 border-[var(--color-text)] dark:border-[var(--color-text)] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                Save URL
              </button>
            </div>
          )}

          <p className="text-[10px] text-stone-400 dark:text-[var(--color-text-secondary)]">
            PNG, JPEG, or WebP · max 2 MB · optional
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
