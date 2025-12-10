# Setup Guide

Comprehensive setup, development, and testing guide for the Argus Educational Platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Development](#development)
- [Testing](#testing)
- [Database Management](#database-management)
- [Docker Usage](#docker-usage)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **pnpm**: v9.x or higher
- **Docker**: Latest version ([Download](https://www.docker.com/))
- **Docker Compose**: v2.x or higher (included with Docker Desktop)
- **Git**: Latest version

### Installing pnpm

```bash
# Via npm
npm install -g pnpm

# Via Corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate

# Verify installation
pnpm --version
```

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB minimum
- **OS**: Windows 10/11, macOS 10.15+, or Linux

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd argus
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# This installs dependencies for:
# - Root workspace
# - @edu-platform/api
# - @edu-platform/web
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred editor
# Update the following variables:
```

#### Required Environment Variables

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=edu_platform
DATABASE_URL=postgresql://postgres:your_secure_password@localhost:5432/edu_platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Authentication
JWT_SECRET=your_very_long_random_secret_key_at_least_64_characters_long
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=7

# API Configuration
PORT=8000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:8000
```

### 4. Database Setup

#### Option A: With Docker (Recommended)

```bash
# Start PostgreSQL and Redis containers
docker compose -f docker-compose.dev.yml up postgres redis -d

# Wait for containers to be healthy (about 10 seconds)
docker compose -f docker-compose.dev.yml ps

# Run database migrations
pnpm db:migrate

# Seed the database with test data
pnpm db:seed
```

#### Option B: Local PostgreSQL

```bash
# Ensure PostgreSQL is running locally on port 5432
# Update DATABASE_URL in .env to point to your local instance

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

### 5. Verify Setup

```bash
# Generate Prisma client
pnpm --filter @edu-platform/api exec prisma generate

# Check database connection
pnpm --filter @edu-platform/api exec tsx scripts/test-db-connection.ts

# Open Prisma Studio to view database
pnpm db:studio
```

---

## Development

### Running the Full Stack

#### Option 1: With Docker (All Services)

```bash
# Start all services (postgres, redis, api, web)
pnpm docker:dev

# View logs
pnpm docker:dev:logs

# View specific service logs
docker compose -f docker-compose.dev.yml logs -f api
docker compose -f docker-compose.dev.yml logs -f web

# Stop all services
pnpm docker:dev:down
```

**Access Points:**

- Frontend: <http://localhost:3001>
- API: <http://localhost:8000>
- API Docs: <http://localhost:8000/v1/docs>
- Health Check: <http://localhost:8000/health>

#### Option 2: Local Development (Without Docker)

**Prerequisites**: PostgreSQL and Redis must be running locally

```bash
# Terminal 1: Start backend API
pnpm dev:api

# Terminal 2: Start frontend
pnpm dev:web

# Optional Terminal 3: Watch for file changes
pnpm --filter @edu-platform/api exec tsc --watch
```

### Development Workflow

#### Backend Development

```bash
# Navigate to API directory
cd api

# Start API in watch mode
pnpm dev

# Type-check without running
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format

# Generate Prisma client after schema changes
pnpm prisma generate

# Create new migration
pnpm prisma migrate dev --name describe_your_change
```

#### Frontend Development

```bash
# Navigate to web directory
cd web

# Start dev server
pnpm dev

# Type-check
pnpm type-check

# Lint
pnpm lint

# Format
pnpm format

# Build for production preview
pnpm build
pnpm preview
```

### Hot Reload

Both backend and frontend support hot reload:

- **API**: Uses `nodemon` to watch for TypeScript file changes
- **Web**: Uses Vite's built-in HMR (Hot Module Replacement)

### Code Quality

```bash
# Run all checks (root directory)
pnpm lint        # ESLint
pnpm type-check  # TypeScript compiler
pnpm format      # Prettier

# Format all files
pnpm prettier:fix

# Lint and fix all files
pnpm lint:fix
```

---

## Testing

### Backend Tests (API)

#### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific module
pnpm --filter @edu-platform/api test

# Run tests in watch mode
pnpm --filter @edu-platform/api test:watch

# Run tests with coverage
pnpm --filter @edu-platform/api test:coverage

# Run specific test file
pnpm --filter @edu-platform/api test src/modules/auth/auth.test.ts

# Run tests matching pattern
pnpm --filter @edu-platform/api test --grep "authentication"
```

#### Test Structure

```
api/test/
├── setup.ts                    # Global test setup
├── health.test.ts              # Health endpoint tests
├── modules/
│   ├── auth/
│   │   ├── auth.test.ts       # Auth integration tests
│   │   ├── login.test.ts      # Login endpoint tests
│   │   └── register.test.ts   # Registration tests
│   ├── user/
│   │   └── user.test.ts       # User CRUD tests
│   ├── course/
│   │   └── course.test.ts     # Course management tests
│   └── instance/
│       └── instance.test.ts   # Instance management tests
├── shared/
│   └── utils/
│       └── jwt.test.ts        # JWT utility tests
└── utils/
    ├── setup-test-db.ts       # Test database utilities
    └── test-setup.ts          # Test helpers
```

#### Test Database

Tests use a separate test database to avoid affecting development data:

```bash
# The test setup automatically:
# 1. Creates a test database
# 2. Runs migrations
# 3. Seeds test data
# 4. Cleans up after tests

# To manually reset test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edu_platform_test" pnpm db:migrate
```

#### Writing Tests

Example test file:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '@/app'
import { setupTestDB, teardownTestDB } from '../utils/setup-test-db'

describe('Auth Module', () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        })
        .expect(200)

      expect(response.body).toHaveProperty('data.accessToken')
      expect(response.body).toHaveProperty('data.user')
    })

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401)

      expect(response.body).toHaveProperty('message')
    })
  })
})
```

#### Test Coverage

```bash
# Generate coverage report
pnpm --filter @edu-platform/api test:coverage

# Coverage files are in api/coverage/
# Open coverage/index.html in browser to view detailed report
```

### Frontend Tests

```bash
# Run frontend tests (when implemented)
pnpm --filter @edu-platform/web test

# Run with UI
pnpm --filter @edu-platform/web test:ui

# Run in watch mode
pnpm --filter @edu-platform/web test:watch
```

### E2E Tests

```bash
# Run end-to-end tests (when implemented)
pnpm test:e2e

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run specific test
pnpm test:e2e tests/auth.spec.ts
```

---

## Database Management

### Prisma Commands

```bash
# Generate Prisma client (after schema changes)
pnpm --filter @edu-platform/api exec prisma generate

# Create a new migration
pnpm --filter @edu-platform/api exec prisma migrate dev --name your_migration_name

# Apply migrations
pnpm db:migrate

# Reset database (WARNING: deletes all data)
pnpm --filter @edu-platform/api exec prisma migrate reset

# Seed database
pnpm db:seed

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Migration Workflow

1. **Modify Schema**: Edit `api/prisma/schema.prisma`

```prisma
model NewModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
}
```

2. **Create Migration**:

```bash
pnpm --filter @edu-platform/api exec prisma migrate dev --name add_new_model
```

3. **Review Migration**: Check `api/prisma/migrations/` for SQL

4. **Generate Client**:

```bash
pnpm --filter @edu-platform/api exec prisma generate
```

5. **Update Code**: Use the new types in your code

### Seed Data

The seed script creates:

- **Roles**: student, teacher, admin
- **Users**: 1 admin, 1 teacher, 2 students
- **Courses**: 6 sample courses with tags
- **Assignment Templates**: 12 templates with grading criteria
- **Course Instances**: 12 instances across semesters
- **Published Assignments**: 9 assignments in active instances
- **Enrollments**: Students enrolled in active courses
- **Forums**: 3 forums per instance

**Test Credentials:**

| Email | Password | Role |
|-------|----------|------|
| <admin@argus.edu> | Admin123! | Admin |
| <teacher@argus.edu> | Teacher123! | Teacher |
| <student1@argus.edu> | Student123! | Student |
| <student2@argus.edu> | Student123! | Student |

### Database Tools

```bash
# Open Prisma Studio (visual database editor)
pnpm db:studio
# Access at http://localhost:5555

# View database schema
pnpm --filter @edu-platform/api exec prisma db pull

# Validate schema
pnpm --filter @edu-platform/api exec prisma validate

# Format schema file
pnpm --filter @edu-platform/api exec prisma format
```

---

## Docker Usage

### Development with Docker

```bash
# Start all services
pnpm docker:dev

# Start specific services
docker compose -f docker-compose.dev.yml up postgres redis -d

# View logs (all services)
pnpm docker:dev:logs

# View logs (specific service)
docker compose -f docker-compose.dev.yml logs -f api

# Stop all services
pnpm docker:dev:down

# Stop and remove volumes (clean slate)
docker compose -f docker-compose.dev.yml down -v

# Rebuild containers (after Dockerfile changes)
docker compose -f docker-compose.dev.yml up --build
```

### Production with Docker

```bash
# Build and start production services
pnpm docker:prod

# View logs
pnpm docker:prod:logs

# Stop services
pnpm docker:prod:down

# Rebuild images
docker compose build --no-cache
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| postgres | 5432 | PostgreSQL database |
| redis | 6379 | Redis cache |
| api | 8000 | Backend API |
| web | 3001 | Frontend (dev) / 3000 (prod) |
| nginx | 80, 443 | Reverse proxy (prod only) |

### Docker Troubleshooting

```bash
# Check container status
docker compose -f docker-compose.dev.yml ps

# Check container health
docker compose -f docker-compose.dev.yml ps | grep healthy

# Restart a specific service
docker compose -f docker-compose.dev.yml restart api

# Access container shell
docker compose -f docker-compose.dev.yml exec api sh

# View container resource usage
docker stats

# Clean up unused Docker resources
docker system prune -a
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::8000`

**Solution**:

```bash
# Windows: Find and kill process using port
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux: Find and kill process
lsof -ti:8000 | xargs kill -9

# Or change port in .env
PORT=8001
```

#### Database Connection Failed

**Problem**: `Error: Can't reach database server`

**Solution**:

```bash
# Check if PostgreSQL is running
docker compose -f docker-compose.dev.yml ps postgres

# Restart PostgreSQL
docker compose -f docker-compose.dev.yml restart postgres

# Check DATABASE_URL in .env
# Ensure it matches: postgresql://user:password@localhost:5432/db_name
```

#### Prisma Client Not Generated

**Problem**: `Cannot find module '@prisma/client'`

**Solution**:

```bash
# Generate Prisma client
pnpm --filter @edu-platform/api exec prisma generate

# Or regenerate after schema changes
pnpm db:migrate
```

#### PNPM Workspace Issues

**Problem**: `Cannot find package '@edu-platform/api'`

**Solution**:

```bash
# Clean and reinstall
rm -rf node_modules api/node_modules web/node_modules
rm pnpm-lock.yaml
pnpm install
```

#### Hot Reload Not Working

**Problem**: Changes not reflected in browser/API

**Solution**:

```bash
# For API: Check nodemon is running
# Look for "watching path(s): src/**/*" in console

# For Web: Clear Vite cache
cd web
rm -rf node_modules/.vite
pnpm dev

# For Docker: Ensure volumes are mounted correctly
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up
```

#### Tests Failing

**Problem**: Tests fail unexpectedly

**Solution**:

```bash
# Reset test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edu_platform_test" pnpm db:migrate

# Clear test cache
pnpm --filter @edu-platform/api exec vitest --clearCache

# Run tests with verbose output
pnpm --filter @edu-platform/api test --reporter=verbose
```

### Getting Help

1. **Check Logs**:
   - API logs: `pnpm docker:dev:logs` or check console
   - Frontend logs: Check browser console
   - Database logs: `docker compose -f docker-compose.dev.yml logs postgres`

2. **Verify Configuration**:
   - Review `.env` file
   - Check `docker-compose.dev.yml` for service configs
   - Validate `prisma/schema.prisma`

3. **Clean Install**:

```bash
# Nuclear option: clean everything and start fresh
docker compose -f docker-compose.dev.yml down -v
rm -rf node_modules api/node_modules web/node_modules
rm -rf api/node_modules/.prisma
rm pnpm-lock.yaml
pnpm install
pnpm db:migrate
pnpm db:seed
```

4. **Check Documentation**:
   - [QUICKSTART.md](QUICKSTART.md) - Quick reference
   - [PNPM-GUIDE.md](PNPM-GUIDE.md) - Workspace structure
   - [DATABASE-SETUP.md](../api/docs/DATABASE-SETUP.md) - Database details
   - [MODULE-STRUCTURE.md](../api/docs/MODULE-STRUCTURE.md) - Backend architecture

---

## Additional Resources

### API Documentation

- **Swagger UI**: <http://localhost:8000/v1/docs> (when API is running)
- **OpenAPI Spec**: <http://localhost:8000/v1/docs.json>

### Development Tools

- **Prisma Studio**: `pnpm db:studio` - Visual database editor
- **VS Code Extensions**:
  - Prisma (Prisma.prisma)
  - ESLint (dbaeumer.vscode-eslint)
  - Prettier (esbenp.prettier-vscode)
  - Docker (ms-azuretools.vscode-docker)

### Useful Commands Reference

```bash
# Development
pnpm dev                    # Run all services locally
pnpm dev:api                # Run API only
pnpm dev:web                # Run frontend only

# Testing
pnpm test                   # Run all tests
pnpm test:watch             # Run tests in watch mode
pnpm test:coverage          # Run with coverage

# Database
pnpm db:migrate             # Run migrations
pnpm db:seed                # Seed database
pnpm db:studio              # Open Prisma Studio

# Docker
pnpm docker:dev             # Start dev environment
pnpm docker:dev:down        # Stop dev environment
pnpm docker:dev:logs        # View logs

# Code Quality
pnpm lint                   # Lint all packages
pnpm format                 # Format all files
pnpm type-check             # TypeScript check

# Build
pnpm build                  # Build all packages
```

---

**Need more help?** Check the other documentation files or open an issue on GitHub.
