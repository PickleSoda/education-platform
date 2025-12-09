# Migration Steps for User & Auth Module Rewrite

## Overview

This guide walks through the steps needed to complete the migration from the old user/auth schema to the new RBAC-based educational platform schema.

---

## Prerequisites

Before proceeding, ensure:

- ✅ You have the updated Prisma schema at `api/prisma/schema.prisma`
- ✅ You have a PostgreSQL database running
- ✅ You have backed up any existing data (if applicable)

---

## Step 1: Generate Prisma Client

The updated code uses the new schema types (User, Role, TeacherProfile, StudentProfile). Generate the Prisma client to sync TypeScript types:

```bash
cd api
npx prisma generate
```

**Expected Output**:

```
✔ Generated Prisma Client (6.19.0) to ./node_modules/@prisma/client
```

**What This Does**:

- Generates TypeScript types for all models in schema.prisma
- Creates type-safe database query methods
- Updates `@prisma/client` imports with correct types

---

## Step 2: Create Migration

Create a new migration for the schema changes:

```bash
cd api
npx prisma migrate dev --name user_auth_rbac_rewrite
```

**What This Does**:

- Creates a new migration file in `prisma/migrations/`
- Generates SQL to create/modify tables
- Applies the migration to your development database
- Auto-runs `prisma generate`

**Expected Tables Created**:

- `users` - Updated with firstName, lastName, passwordHash, isActive
- `roles` - Role definitions (student, teacher, admin)
- `user_roles` - Junction table for User ↔ Role with audit fields
- `teacher_profiles` - Teacher-specific data
- `student_profiles` - Student-specific data

---

## Step 3: Seed Initial Roles

The new RBAC system requires roles to exist in the database. Create a seed script or run SQL directly:

### Option A: SQL Script

```sql
-- Insert default roles
INSERT INTO "roles" (name, description) VALUES
  ('student', 'Student role with access to courses and submissions'),
  ('teacher', 'Teacher role with course management permissions'),
  ('admin', 'Administrator with full system access')
ON CONFLICT (name) DO NOTHING;
```

### Option B: Prisma Seed Script

Create `api/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: 'student', description: 'Student role with access to courses and submissions' },
    { name: 'teacher', description: 'Teacher role with course management permissions' },
    { name: 'admin', description: 'Administrator with full system access' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('✅ Roles seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:

```bash
npx tsx prisma/seed.ts
# OR if configured in package.json
npx prisma db seed
```

---

## Step 4: Verify Database Schema

Check that all tables were created correctly:

```sql
-- List all tables
\dt

-- Check users table structure
\d users

-- Check roles and user_roles
\d roles
\d user_roles

-- Check profile tables
\d teacher_profiles
\d student_profiles
```

**Expected user table structure**:

```
Column        | Type                | Nullable
--------------+--------------------+----------
id            | uuid               | NOT NULL
email         | character varying  | NOT NULL
password_hash | character varying  | NOT NULL
first_name    | character varying  | NOT NULL
last_name     | character varying  | NOT NULL
avatar_url    | character varying  | NULL
is_active     | boolean            | NOT NULL DEFAULT true
created_at    | timestamp          | NOT NULL DEFAULT now()
updated_at    | timestamp          | NOT NULL
```

---

## Step 5: Test Type Safety

Verify that TypeScript recognizes the new types:

```bash
cd api
npm run build
# OR
npx tsc --noEmit
```

**Common Issues**:

- ❌ `Module '@prisma/client' has no exported member 'User'`
  - **Fix**: Run `npx prisma generate` again
  
- ❌ `Property 'passwordHash' does not exist on type 'User'`
  - **Fix**: Ensure schema has `passwordHash String @map("password_hash")`
  
- ❌ `Cannot find module '@/types/response'`
  - **Fix**: Check tsconfig.json has correct path mappings

---

## Step 6: Update Environment Variables

Ensure your `.env` file has all required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/argus_dev?schema=public"

# JWT Secrets
JWT_SECRET="your-secret-key-change-in-production"
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

---

## Step 7: Test Authentication Flow

### Test 1: Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "StrongPass123",
    "firstName": "John",
    "lastName": "Doe",
    "roleName": "teacher"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "teacher@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": [{ "role": { "name": "teacher" } }]
    },
    "tokens": {
      "access": { "token": "jwt...", "expires": "..." },
      "refresh": { "token": "jwt...", "expires": "..." }
    }
  }
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "StrongPass123"
  }'
```

### Test 3: Get User Profile

```bash
curl -X GET http://localhost:3000/api/users/{userId} \
  -H "Authorization: Bearer {access_token}"
```

### Test 4: Update Teacher Profile

```bash
curl -X PUT http://localhost:3000/api/users/{userId}/teacher-profile \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Computer Science",
    "title": "Professor",
    "bio": "Specialized in distributed systems"
  }'
```

---

## Step 8: Run Automated Tests

If you have test suites, run them to verify everything works:

```bash
cd api
npm test
# OR
npm run test:unit
npm run test:integration
```

---

## Troubleshooting

### Issue: "Table 'users' already exists"

If you have an old `users` table with different structure:

**Option 1: Reset Database (Development Only)**

```bash
npx prisma migrate reset
npx prisma migrate dev
npx tsx prisma/seed.ts
```

**Option 2: Manual Migration**

```sql
-- Rename old table
ALTER TABLE users RENAME TO users_old;

-- Run Prisma migration
-- Then manually migrate data:
INSERT INTO users (email, password_hash, first_name, last_name, created_at)
SELECT email, password, 
  SPLIT_PART(name, ' ', 1) as first_name,
  SPLIT_PART(name, ' ', 2) as last_name,
  created_at
FROM users_old;

-- Migrate roles (old: role[], new: user_roles junction)
INSERT INTO user_roles (user_id, role_id, granted_at)
SELECT u.id, r.id, NOW()
FROM users_old uo
JOIN users u ON u.email = uo.email
JOIN roles r ON r.name = ANY(uo.role);
```

### Issue: "Cannot find module @prisma/client"

```bash
cd api
npm install @prisma/client@latest
npx prisma generate
```

### Issue: TypeScript Errors in Controllers

Make sure all files are saved and TypeScript server is restarted:

- VS Code: Press `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Or restart your IDE

### Issue: Authentication Middleware Fails

Check that `config/passport.ts` is configured for the new User structure:

```typescript
// Should query User with roles
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    roles: { include: { role: true } }
  }
});
```

---

## Rollback Plan

If you need to rollback:

```bash
# View migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back {migration_name}

# Reset to specific migration
npx prisma migrate resolve --applied {previous_migration_name}
```

**Manual Rollback**:

1. Restore database from backup
2. Git revert the code changes:

   ```bash
   git revert HEAD~9..HEAD  # Reverts last 9 commits (user & auth files)
   ```

---

## Verification Checklist

Before deploying to production:

- [ ] All TypeScript files compile without errors
- [ ] Prisma client is generated and up-to-date
- [ ] Database migrations are applied
- [ ] Initial roles are seeded
- [ ] User registration works with firstName/lastName
- [ ] Login returns tokens and user with roles
- [ ] Role-based access control is enforced
- [ ] Teacher profile CRUD works for teachers
- [ ] Student profile CRUD works for students
- [ ] Password reset flow works
- [ ] Soft delete (deactivate) prevents login
- [ ] API documentation is updated
- [ ] All automated tests pass

---

## Next Steps

After completing the migration:

1. **Update API Documentation**:
   - Update OpenAPI schemas in `user.openapi.ts` and `auth.openapi.ts`
   - Regenerate API docs

2. **Create Admin User**:

   ```sql
   -- Get a user ID
   SELECT id FROM users WHERE email = 'admin@example.com';
   
   -- Add admin role
   INSERT INTO user_roles (user_id, role_id)
   SELECT '{user_id}', id FROM roles WHERE name = 'admin';
   ```

3. **Configure RBAC Permissions**:
   - Update `config/roles.ts` with new permission structure
   - Test role-based endpoint access

4. **Complete Remaining Modules**:
   - Assignment module
   - Instance module
   - Enrollment module
   - Submission module
   - Forum module
   - Announcement module
   - Dashboard module

---

## Support

If you encounter issues:

1. Check the error logs
2. Verify database connection
3. Ensure Prisma client is generated
4. Review migration files in `prisma/migrations/`
5. Check that all environment variables are set

For reference:

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client API](https://www.prisma.io/docs/concepts/components/prisma-client)
- [JWT Best Practices](https://jwt.io/introduction)
