# See Through

**Anonymous workplace reviews — honest insights, anonymous voices.**

A production-ready frontend foundation for a workplace review platform where employees can share anonymous experiences about companies.

## Tech Stack

| Category          | Library                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| Framework         | React 19                                                                   |
| Build Tool        | Vite                                                                       |
| Language          | TypeScript                                                                 |
| Styling           | Tailwind CSS v4                                                            |
| Routing           | React Router v7                                                            |
| Data Fetching     | TanStack Query v5                                                          |
| HTTP Client       | Axios                                                                      |
| Forms             | React Hook Form + Zod                                                      |
| Animations        | Framer Motion v12                                                          |
| Icons             | Lucide React                                                               |
| Toasts            | Sonner                                                                     |
| Utilities         | clsx, tailwind-merge, react-use                                            |

## Architecture

### Feature-Based Structure

```
src/
├── app/                  # App root: providers, router, entry point
├── assets/               # Static assets: images, icons, fonts
├── components/           # Reusable components
│   ├── ui/               # Primitive UI components (Button, Card, Input, Badge)
│   ├── common/           # Shared layout components (Container, Grid, Section, Page)
│   ├── feedback/         # Feedback components (Alerts, loading states)
│   ├── navigation/       # Navigation (Navbar, Footer, MobileNav, ThemeToggle)
│   └── forms/            # Form components (Select, Checkbox, etc.)
├── features/             # Feature modules (home, company, review, search, etc.)
├── hooks/                # Global custom hooks
├── services/             # API service functions by domain
├── stores/               # State management stores
├── context/              # React context providers
├── config/               # Application configuration
├── constants/            # Shared constants
├── routes/               # Route-level components (404 page)
├── validators/           # Zod validation schemas
├── types/                # Shared TypeScript types
├── utils/                # Utility functions
├── styles/               # Global styles and theme definitions
└── lib/                  # Library configurations (Axios, QueryClient, cn, animations)
```

### Key Design Decisions

**Theme System** — Full light/dark mode with:
- LocalStorage persistence
- Automatic system preference detection
- Smooth transitions via CSS variables
- Theme toggle with animated icon (sun/moon)

**Color Palette**
- Primary: Olive `#424532` + Cream `#FFEFCD`
- Accent: Navy `#2F4F6F` (used sparingly for links, focus states, badges)
- Light bg: `#FFFDF7`, Dark bg: `#2B2F23` (no pure black)

**Providers** — Composed in `src/app/providers.tsx`:
- `QueryClientProvider` with TanStack Query devtools
- `ThemeProvider` with light/dark mode
- `BrowserRouter` for routing
- `Toaster` from Sonner for notifications

**Routing** — React Router with:
- `MainLayout` (navbar + footer) for public pages
- `DashboardLayout` (with sidebar) for admin area
- Page transitions via Framer Motion
- Placeholder pages for all routes (no business logic yet)

**Axios** — Pre-configured with:
- Base URL from environment variables
- Request/response interceptors
- Error handling
- 10-second timeout
- Ready for cookie/token authentication

**TanStack Query** — Configured with:
- 5-minute stale time
- 30-minute cache time
- 2 retry attempts
- Devtools support in development

**Accessibility**
- Semantic HTML throughout
- ARIA labels on interactive elements
- Focus-visible rings with navy accent
- Keyboard-navigable components

**Performance**
- Lazy loading ready (React.lazy + Suspense)
- Optimized re-renders with proper dependency arrays
- CSS transitions instead of JS where possible
- Framer Motion's `whileInView` for scroll-triggered animations

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Type-check TypeScript
pnpm typecheck

# Lint
pnpm lint
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=See Through
VITE_APP_DESCRIPTION=Anonymous workplace reviews
```

## Scripts

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Start development server (HMR)  |
| `pnpm build`       | Build for production            |
| `pnpm preview`     | Preview production build        |
| `pnpm lint`        | Run ESLint                      |
| `pnpm typecheck`   | Run TypeScript type checking    |
