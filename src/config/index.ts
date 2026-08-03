export const config = {
  api: {
    // Fall back to same-origin so the Vite dev proxy (targets localhost:4000)
    // is used when VITE_API_BASE_URL is unset. Service URLs already include
    // the /api/v1 prefix, so an empty baseURL resolves them correctly.
    baseURL: (import.meta.env.VITE_API_BASE_URL as string) || '',
    timeout: 10000,
  },
  app: {
    name: (import.meta.env.VITE_APP_NAME as string) || 'See Through',
    description:
      (import.meta.env.VITE_APP_DESCRIPTION as string) ||
      'Anonymous workplace reviews',
  },
} as const;
