/** Employee tenure buckets offered on the review form. */
export const TENURE_VALUES = [
  'under-1-year',
  '1-2-years',
  '3-5-years',
  '6-10-years',
  '10-plus-years',
] as const;

export type TenureValue = (typeof TENURE_VALUES)[number];

/** Tenure as used by controlled form inputs — '' means "not selected". */
export type TenureFormValue = '' | TenureValue;

/** Display labels for the tenure buckets. */
export const TENURE_LABELS: Record<TenureValue, string> = {
  'under-1-year': 'Less than 1 year',
  '1-2-years': '1–2 years',
  '3-5-years': '3–5 years',
  '6-10-years': '6–10 years',
  '10-plus-years': '10+ years',
};

/** Human label for a stored tenure value — null when unset or unknown. */
export function tenureLabel(tenure?: string | null): string | null {
  if (!tenure) return null;
  return TENURE_LABELS[tenure as TenureValue] ?? null;
}
