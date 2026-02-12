# GRUDACHAIN App Gallery

## Overview

This is a full-stack web application that serves as an app gallery/showcase and development workspace for "GRUDACHAIN" — a collection of apps hosted on the Puter platform. The app displays a grid of app cards with screenshots, stats, and links, and includes a full development workspace with terminal, IDE, AI chat, app management, and KV storage — all powered by the Puter.js SDK.

The backend seeds app data from a text file into a PostgreSQL database, then serves it via a REST API. The frontend fetches and displays this data with search and category filtering. The Workspace page provides direct access to Puter cloud services client-side.

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
- **Puter.js SDK**: Loaded via CDN (`https://js.puter.com/v2/`) for client-side cloud operations
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

Key pages:
- `Home` (`/`) — Main gallery with search bar, category filter, app card grid, and link to Workspace
- `Workspace` (`/workspace`) — Development workspace with Terminal, IDE, AI Chat, Apps & KV panels
- `NotFound` — 404 fallback

Key components:
- `AppCard` — Displays individual app with screenshot thumbnail (via thum.io), stats, emblem color picker
- `Footer` — Simple footer with "Powered by Puter" link
- `workspace/TerminalPanel` — CLI-like terminal supporting Puter fs/kv/app/ai commands
- `workspace/EditorPanel` — File browser + code editor for Puter cloud storage
- `workspace/AIChatPanel` — AI chat with model selection and streaming (GPT-4o, Claude, Gemini, etc.)
- `workspace/AppsKVPanel` — App manager (create/list/delete) and KV storage manager

### Hooks
- `use-apps.ts` — Fetches app data from backend API
- `use-puter.ts` — Manages Puter.js SDK ready state, auth (signIn/signOut), and username

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

### Puter.js SDK Integration
The Puter.js SDK is loaded via CDN in `client/index.html` and accessed as `window.puter`. It provides:
- **Authentication**: `puter.auth.signIn()`, `puter.auth.getUser()`, `puter.auth.isSignedIn()`
- **Cloud Storage**: `puter.fs.readdir()`, `puter.fs.read()`, `puter.fs.write()`, `puter.fs.mkdir()`, `puter.fs.delete()`, `puter.fs.copy()`, `puter.fs.move()`
- **KV Storage**: `puter.kv.set()`, `puter.kv.get()`, `puter.kv.del()`, `puter.kv.list()`
- **AI Chat**: `puter.ai.chat()` with model selection and streaming support
- **App Management**: `puter.apps.create()`, `puter.apps.list()`, `puter.apps.delete()`, `puter.apps.update()`

User-pays model: no API keys needed; users authenticate with their own Puter account.

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
- **Puter.js SDK** — Client-side cloud SDK loaded via CDN (`https://js.puter.com/v2/`). Provides auth, cloud storage, KV database, AI chat, and app management.
- **thum.io** — External screenshot thumbnail service, proxied server-side via `GET /api/apps/:id/screenshot` with `wait/5/noscrollbar` params for guest-mode capture. In-memory cache (1hr TTL, max 60 entries).
- **Google Fonts** — Inter, Space Grotesk, DM Sans, Fira Code, Geist Mono, Architects Daughter loaded via CDN
- **Puter Platform** — App URLs point to `puter.com/app/*`; footer links to `developer.puter.com`
- **Replit plugins** — `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` (dev only, when `REPL_ID` is set)

## Recent Changes
- Server-side screenshot proxy (`GET /api/apps/:id/screenshot`) with thum.io wait/5 for guest-mode rendering, 1hr in-memory cache
- Server-side health check (`GET /api/apps/health`) with HEAD method, 3min cache, `?refresh=true` bypass
- N/A display with red styling for broken apps (404, unreachable, 500+)
- Puter login/logout button on gallery homepage
- SEO meta tags (title, description, OpenGraph, Twitter)
- Stats parsing handles tab-separated data format
- Animation delay capped at 0.6s max
- usePuter hook stops polling after SDK loads (max 10s)
- Added Puter.js SDK integration via CDN for client-side cloud operations
- Added `/workspace` route with Terminal, IDE, AI Chat, and Apps & KV panels
- Terminal supports: ls, cd, mkdir, touch, cat, rm, cp, mv, pwd, clear, whoami, app:list, app:create, app:delete, app:update, kv.set, kv.get, kv.del, kv.list, ai, ai:model
- IDE panel provides file browser with read/write/upload/delete and code editor
- AI Chat supports streaming responses with selectable models (GPT-4o, Claude, Gemini, DeepSeek, Llama)
- App Manager allows creating, listing, and deleting Puter apps
- KV Storage manager allows setting, getting, deleting, and listing key-value pairs with inline editing
