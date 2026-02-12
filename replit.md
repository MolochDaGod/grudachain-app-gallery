# GRUDACHAIN App Gallery

## Overview

This is a full-stack web application that serves as an app gallery/showcase for "GRUDACHAIN" — a collection of apps hosted on the Puter platform. The app displays a grid of app cards with screenshots, stats, and links. It uses a dark, cyberpunk/gaming-inspired aesthetic with smooth animations.

The backend seeds app data from a text file into a PostgreSQL database, then serves it via a REST API. The frontend fetches and displays this data with search and category filtering.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (`client/`)
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite (with HMR in development via `server/vite.ts`)
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark mode by default)
- **Animations**: Framer Motion for card entrance animations and page transitions
- **Fonts**: Inter (body), Space Grotesk (headings) via Google Fonts
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

Key pages:
- `Home` (`/`) — Main gallery with search bar, category filter, and app card grid
- `NotFound` — 404 fallback

Key components:
- `AppCard` — Displays individual app with screenshot thumbnail (via thum.io), stats, emblem color picker
- `Footer` — Simple footer with "Powered by Puter" link

### Backend (`server/`)
- **Framework**: Express 5 (running on Node.js via tsx)
- **API**: Single REST endpoint `GET /api/apps` returns all apps from the database
- **Database**: PostgreSQL via `node-postgres` (pg) Pool
- **ORM**: Drizzle ORM with Drizzle-Zod for schema validation
- **Storage pattern**: `IStorage` interface with `DatabaseStorage` implementation in `server/storage.ts`
- **Seeding**: On startup, if the apps table is empty, the server parses `attached_assets/Pasted-make-me-an-html-...txt` to seed app data (name, URL, stats)
- **Static serving**: In production, serves built Vite output from `dist/public`; in development, uses Vite dev middleware with HMR

### Shared (`shared/`)
- `schema.ts` — Drizzle table definitions and Zod schemas. The `apps` table has: `id` (serial), `name` (text), `category` (text, nullable), `url` (text), `stats` (text, nullable)
- `routes.ts` — API route path constants and response schemas, shared between frontend and backend

### Database Schema
Single table:
```
apps:
  id       - serial primary key
  name     - text, not null
  category - text, nullable
  url      - text, not null
  stats    - text, nullable (raw string like "4 59 Sep 7th, 2025")
```

### Build Process (`script/build.ts`)
- Client: Vite build → `dist/public/`
- Server: esbuild bundles `server/index.ts` → `dist/index.cjs`
- Most dependencies are externalized except for a specific allowlist that gets bundled for faster cold starts

### Development vs Production
- **Dev**: `npm run dev` runs tsx with Vite dev middleware, hot module replacement
- **Prod**: `npm run build` then `npm start` serves static files from dist
- **DB migrations**: `npm run db:push` uses drizzle-kit to push schema to PostgreSQL

## External Dependencies

- **PostgreSQL** — Primary database, connected via `DATABASE_URL` environment variable. Required for the app to start.
- **Drizzle ORM + Drizzle Kit** — ORM and migration tooling for PostgreSQL
- **thum.io** — External screenshot thumbnail service. Used in `AppCard` to generate app preview images: `https://image.thum.io/get/width/640/crop/360/{appUrl}`
- **Google Fonts** — Inter, Space Grotesk, DM Sans, Fira Code, Geist Mono, Architects Daughter loaded via CDN
- **Puter Platform** — App URLs point to `puter.com/app/*`; footer links to `developer.puter.com`
- **Replit plugins** — `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev only, when `REPL_ID` is set)