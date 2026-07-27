export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL as string,
    timeout: 10000,
  },
  app: {
    name: (import.meta.env.VITE_APP_NAME as string) || 'See Through',
    description:
      (import.meta.env.VITE_APP_DESCRIPTION as string) ||
      'Anonymous workplace reviews',
  },
} as const;
