# Educational Platform

A full-stack educational platform built with modern technologies in a monorepo structure.

## 🚀 Quick Start

```bash
cp .env.example .env       # Configure environment
pnpm install               # Install dependencies
pnpm docker:dev            # Start with Docker
```

Access: Frontend at <http://localhost:3001>, API at <http://localhost:8000>

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Complete setup summary and commands
- **[PNPM-GUIDE.md](PNPM-GUIDE.md)** - Understanding the @edu-platform/ workspace
- **[DOCKER-ASSESSMENT.md](DOCKER-ASSESSMENT.md)** - Docker configuration details
- **[SETUP.md](SETUP.md)** - Detailed setup instructions

## Tech Stack

### Backend (`@edu-platform/api`)

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT + Passport.js
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Vitest

### Frontend (`@edu-platform/web`)

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **State**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router v6
- **i18n**: i18next

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (recommended)

## Project Structure

```
argus/
├── api/              # Backend (@edu-platform/api)
├── web/              # Frontend (@edu-platform/web)
├── docker/           # Nginx & SSL configs
├── package.json      # Root workspace config
├── pnpm-workspace.yaml
└── .npmrc
```

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd user-management

# Copy environment file
cp .env.example .env

# Install dependencies
pnpm install
```

### 2. Start with Docker (Recommended)

```bash
# Start all services (postgres, redis, api, web)
pnpm docker:dev

# View logs
pnpm docker:dev:logs

# Stop services
pnpm docker:dev:down
```

### 3. Access the Application

- **Frontend**: <http://localhost:3001>
- **Backend API**: <http://localhost:8000>
- **API Docs**: <http://localhost:8000/v1/docs>
- **Prisma Studio**: Run `pnpm db:studio` (after starting containers)

## Development

### Without Docker

```bash
# Terminal 1: Start PostgreSQL and Redis (you need these running)
docker compose -f docker-compose.dev.yml up postgres redis

# Terminal 2: Start API
pnpm dev:api

# Terminal 3: Start Web
pnpm dev:web
```

### Database Commands

```bash
# Run migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed

# Generate Prisma client
pnpm --filter @user-management/api exec prisma generate
```

## Project Structure

```
user-management/
├── apps/
│   ├── api/                 # Express + Prisma backend
│   │   ├── prisma/          # Database schema & migrations
│   │   ├── src/
│   │   │   ├── config/      # App configuration
│   │   │   ├── modules/     # Feature modules (auth, user, etc.)
│   │   │   ├── shared/      # Shared utilities & middlewares
│   │   │   └── routes/      # Route definitions
│   │   └── test/            # Tests
│   │
│   └── web/                 # React + Vite frontend
│       ├── public/
│       └── src/
│           ├── api/         # API client
│           ├── components/  # React components
│           ├── pages/       # Page components
│           ├── router/      # Route configuration
│           └── store/       # Zustand stores
│
├── packages/
│   └── shared/              # Shared types & utilities
│
├── docker/
│   ├── nginx/               # Nginx configuration
│   └── postgres/            # Database init scripts
│
├── docker-compose.yml       # Production compose
├── docker-compose.dev.yml   # Development compose
├── pnpm-workspace.yaml      # Workspace configuration
└── package.json             # Root package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm dev:api` | Start only the API |
| `pnpm dev:web` | Start only the web app |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run tests |
| `pnpm docker:dev` | Start with Docker (dev) |
| `pnpm docker:prod` | Start with Docker (prod) |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Environment Variables

See `.env.example` for all available environment variables.

### Required Variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `JWT_SECRET` | Secret for JWT signing |
| `VITE_API_URL` | API URL for frontend |

## API Documentation

When the API is running, access Swagger documentation at:

- <http://localhost:8000/v1/docs>

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm test`
4. Submit a pull request

## License

MIT
