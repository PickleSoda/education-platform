# Argus Educational Platform

A full-stack educational platform built with modern technologies in a monorepo structure.

## 🚀 Quick Start

```bash
cp .env.example .env       # Configure environment
pnpm install               # Install dependencies
pnpm docker:dev            # Start with Docker
```

Access: Frontend at <http://localhost:3001>, API at <http://localhost:8000>

## 📚 Documentation

### Getting Started

- **[SETUP.md](docs/SETUP.md)** - Complete setup, development, and testing guide
- **[QUICKSTART.md](docs/QUICKSTART.md)** - Quick reference and common commands
- **[PNPM-GUIDE.md](PNPM-GUIDE.md)** - Understanding the @edu-platform/ workspace

### Infrastructure

- **[DOCKER-ASSESSMENT.md](DOCKER-ASSESSMENT.md)** - Docker configuration details
- **[DATABASE-SETUP.md](api/docs/DATABASE-SETUP.md)** - Database configuration guide
- **[MIGRATION-GUIDE.md](api/docs/MIGRATION-GUIDE.md)** - Database migration guide

### Architecture

- **[MODULE-STRUCTURE.md](api/docs/MODULE-STRUCTURE.md)** - Backend module architecture
- **[PAGE-STRUCTURE.md](docs/PAGE-STRUCTURE.md)** - Frontend page structure and user flows

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
├── api/                    # Backend (@edu-platform/api)
│   ├── src/               # Source code
│   ├── prisma/            # Database schema & migrations
│   ├── test/              # Test files
│   └── docs/              # API-specific documentation
├── web/                    # Frontend (@edu-platform/web)
│   ├── src/               # Source code
│   └── public/            # Static assets
├── docs/                   # Project documentation
├── docker/                 # Nginx & SSL configs
├── package.json            # Root workspace config
├── pnpm-workspace.yaml     # Workspace definition
└── .npmrc                  # PNPM configuration
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

Key environment variables (see `.env.example` for complete list):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | postgresql://... |
| `JWT_SECRET` | Secret for JWT signing | (generate 64+ chars) |
| `REDIS_HOST` | Redis hostname | localhost |
| `PORT` | API port | 8000 |
| `VITE_API_URL` | API URL for frontend | <http://localhost:8000> |

## Test Accounts

After running `pnpm db:seed`:

| Email | Password | Role |
|-------|----------|------|
| <admin@argus.edu> | Admin123! | Admin |
| <teacher@argus.edu> | Teacher123! | Teacher |
| <student1@argus.edu> | Student123! | Student |
| <student2@argus.edu> | Student123! | Student |

## API Documentation

Access Swagger documentation when API is running:

- **Swagger UI**: <http://localhost:8000/v1/docs>
- **OpenAPI JSON**: <http://localhost:8000/v1/docs.json>

## Troubleshooting

### Port Already in Use

```bash
# Find and kill process (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Database Connection Issues

```bash
# Restart PostgreSQL container
docker compose -f docker-compose.dev.yml restart postgres
```

### PNPM Workspace Issues

```bash
# Clean reinstall
rm -rf node_modules api/node_modules web/node_modules
pnpm install
```

See **[SETUP.md](docs/SETUP.md)** for comprehensive troubleshooting guide.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm lint` and `pnpm test`
4. Ensure all tests pass
5. Submit a pull request

## License

MIT

## Development Workflow

### Start Development Environment

```bash
# With Docker (recommended)
pnpm docker:dev             # Start all services
pnpm docker:dev:logs        # View logs
pnpm docker:dev:down        # Stop services

# Without Docker
pnpm dev                    # Start API and Web
pnpm dev:api                # Start only API
pnpm dev:web                # Start only Web
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm --filter @edu-platform/api test:watch

# Run tests with coverage
pnpm --filter @edu-platform/api test:coverage

# Run specific test file
pnpm --filter @edu-platform/api test src/modules/auth/auth.test.ts
```

See **[SETUP.md](docs/SETUP.md)** for detailed testing instructions.

### Database Management

```bash
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed database
pnpm db:studio              # Open Prisma Studio
```

### Code Quality

```bash
pnpm lint                   # Lint all packages
pnpm format                 # Format all files
pnpm type-check             # TypeScript check
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services locally |
| `pnpm dev:api` | Start backend API only |
| `pnpm dev:web` | Start frontend only |
| `pnpm test` | Run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | TypeScript type checking |
| `pnpm docker:dev` | Start with Docker (dev) |
| `pnpm docker:prod` | Start with Docker (prod) |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:seed` | Seed database with test data |
| `pnpm db:studio` | Open Prisma Studio |
