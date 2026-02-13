# GRUDACHAIN App Gallery

A modern web application showcasing GRUDACHAIN apps, games, tools, and utilities on the Puter cloud platform. Features an interactive workspace with terminal, IDE, AI chat, and key-value storage management.

![GRUDACHAIN](./attached_assets/image_1767134942654_1770888806502.png)

## Features

### 🖼️ App Gallery
- Browse and search GRUDACHAIN apps by name or category
- Real-time health status monitoring for each app
- Auto-generated screenshots via thum.io
- Category filtering and search functionality

### 🛠️ Workspace
- **Terminal** - Cloud-based terminal interface via Puter
- **IDE** - Code editor with file management
- **AI Chat** - AI assistant powered by Puter's AI services
- **Apps & KV** - Manage apps and key-value storage

### 🔐 Authentication
Uses [Puter.com](https://puter.com) for authentication - the "User-Pays" model where:
- No API keys needed for developers
- Users authenticate with their own Puter accounts
- Each user covers their own AI/storage costs
- Zero infrastructure cost for app developers

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: Express 5, Node.js
- **Database**: Drizzle ORM (PostgreSQL compatible)
- **Auth**: Puter.com OAuth
- **Build**: Vite, esbuild

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5000`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | (optional) |

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities
│   │   └── pages/         # Page components
├── server/                # Express backend
│   ├── index.ts          # Server entry
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data layer
├── shared/               # Shared types/routes
└── attached_assets/      # Static assets
```

## API Endpoints

- `GET /api/apps` - List all apps
- `GET /api/apps/health` - Health check all apps
- `GET /api/apps/:id/screenshot` - Get app screenshot

## Puter Integration

This app uses [Puter.js](https://docs.puter.com) for:
- User authentication (`puter.auth`)
- Cloud storage (`puter.fs`)
- Key-value storage (`puter.kv`)
- AI chat capabilities (`puter.ai`)

Users sign in with their Puter account to access workspace features. Learn more about the Puter SDK at [docs.puter.com](https://docs.puter.com).

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Related

- [opencode-puter-auth](https://www.npmjs.com/package/opencode-puter-auth) - Puter OAuth plugin for OpenCode CLI
- [Puter Documentation](https://docs.puter.com) - Puter.js SDK docs

## License

MIT

---

Built with ❤️ by GRUDACHAIN
