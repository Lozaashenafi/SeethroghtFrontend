# See Through — Frontend

**Anonymous workplace reviews — honest insights, anonymous voices.**

React frontend for the See Through workplace review platform, where employees share anonymous experiences about companies.

## Tech Stack

| Category          | Library          |
| ----------------- | ---------------- |
| Framework         | React 19         |
| Build Tool        | Vite             |
| Language          | TypeScript       |
| Styling           | Tailwind CSS v4  |
| Routing           | React Router v7  |
| Data Fetching     | TanStack Query v5 |
| HTTP Client       | Axios            |
| Animations        | Framer Motion v12 |
| Icons             | Lucide React     |
| Toasts            | Sonner           |
| Utilities         | clsx, tailwind-merge |

## Architecture

### Feature-Based Structure

```
src/
├── app/                  # App root: providers, router, entry point
├── assets/               # Static assets: images, icons, fonts
├── components/           # Reusable components
│   ├── ui/               # Primitive UI components (Button, Card, Input, Badge)
│   ├── common/           # Shared layout components (Container, Grid, Section, Page)
│   ├── auth/             # Route protection (ProtectedRoute)
│   ├── layout/           # Layouts (MainLayout, DashboardLayout)
│   ├── navigation/       # Navigation (Navbar, Footer, MobileNav, ThemeToggle, SearchBar)
│   └── onboarding/       # Onboarding (WelcomeModal)
├── features/             # Feature modules (home, company, review, search, admin)
├── hooks/                # Global custom hooks (data fetching, admin, UI)
├── services/             # API service functions by domain
├── context/              # React context providers (Auth, Theme)
├── config/               # Application configuration
├── constants/            # Shared constants (brand, routes)
├── routes/               # Route-level components (404 page)
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
- `AuthProvider` for admin session state
- `BrowserRouter` for routing
- `Toaster` from Sonner for notifications

**Routing** — React Router with:
- `MainLayout` (navbar + footer) for public pages
- `DashboardLayout` (with sidebar) for the admin area, protected by `ProtectedRoute`
- Admin authentication via httpOnly cookie (the JWT never touches `localStorage`)
- Feature routes for companies, reviews, search, and admin management

**Axios** — Pre-configured with:
- Base URL from environment variables
- `withCredentials: true` for cookie-based auth
- Request/response interceptors
- 10-second timeout

**TanStack Query** — Configured with:
- 5-minute stale time
- 30-minute cache time
- 2 retry attempts
- Devtools support in development

**Performance**
- Optimized re-renders with proper dependency arrays
- CSS transitions instead of JS where possible
- Framer Motion for scroll-triggered animations

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
# Backend API base URL. Leave empty in development to use the Vite proxy (/api -> http://localhost:4000).
VITE_API_BASE_URL=
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
