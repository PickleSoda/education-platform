# 🎯 PNPM Workspace Setup - @edu-platform

## How the @edu-platform/ prefix works

Your monorepo is configured with **scoped packages** using the `@edu-platform/` prefix.

## Configuration Files

### 1. `pnpm-workspace.yaml`

```yaml
packages:
  - 'api'
  - 'web'
```

This tells PNPM which directories contain packages.

### 2. `.npmrc`

```ini
shamefully-hoist=true
strict-peer-dependencies=false
link-workspace-packages=true
auto-install-peers=true
```

**What each setting does:**

- `shamefully-hoist=true` - Hoists dependencies to root for better compatibility
- `link-workspace-packages=true` - Enables workspace package linking
- `auto-install-peers=true` - Automatically installs peer dependencies
- `strict-peer-dependencies=false` - Relaxed peer dependency checking

### 3. Package Names

Each package has its scoped name:

**api/package.json:**

```json
{
  "name": "@edu-platform/api",
  ...
}
```

**web/package.json:**

```json
{
  "name": "@edu-platform/web",
  ...
}
```

## Using the Workspace

### Running Commands

**From root (runs on all packages):**

```bash
pnpm dev              # Runs dev script in all packages
pnpm build            # Builds all packages
pnpm lint             # Lints all packages
```

**Target specific package:**

```bash
pnpm --filter @edu-platform/api dev
pnpm --filter @edu-platform/web build
```

**Using shortcuts (defined in root package.json):**

```bash
pnpm dev:api          # Shortcut for filtering api
pnpm dev:web          # Shortcut for filtering web
```

### Adding Dependencies

**To a specific package:**

```bash
# Add to API
pnpm --filter @edu-platform/api add express

# Add to Web
pnpm --filter @edu-platform/web add react

# Add dev dependency
pnpm --filter @edu-platform/api add -D typescript
```

**To root (shared across all):**

```bash
pnpm add -w typescript
```

### Linking Packages Together

If you want to use API code in Web:

**In web/package.json:**

```json
{
  "dependencies": {
    "@edu-platform/api": "workspace:*"
  }
}
```

Then:

```bash
pnpm install
```

### Installing All Dependencies

```bash
# From root - installs for all packages
pnpm install

# Or use recursive flag
pnpm install -r
```

## Benefits of This Setup

1. **Isolation**: Each package has its own dependencies
2. **Shared dependencies**: Common packages are deduplicated
3. **Type safety**: TypeScript works across packages
4. **Easy scripting**: Run commands on all packages at once
5. **Version control**: Lock file keeps everything in sync

## Docker Integration

The `@edu-platform/` prefix doesn't affect Docker. Docker builds work independently:

```bash
# Docker sees the folders (api/, web/)
docker compose -f docker-compose.dev.yml up
```

Each Dockerfile installs dependencies normally:

```dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
```

PNPM inside the container reads the package name from `package.json`.

## Verifying Setup

Check your workspace is configured correctly:

```bash
# List all workspace packages
pnpm list -r --depth 0

# Should output:
# @edu-platform/api 1.0.0
# @edu-platform/web 0.0.0
```

## Common Patterns

### Run command in multiple packages

```bash
pnpm -r exec rm -rf dist    # Remove dist in all packages
pnpm -r exec pnpm build      # Build all packages
```

### Update dependencies

```bash
pnpm update -r              # Update all packages
pnpm update -r --latest     # Update to latest versions
```

### Check for outdated packages

```bash
pnpm outdated -r
```

## Why Use Scoped Packages?

1. **Namespace collision prevention**: Won't conflict with npm packages
2. **Professional organization**: Clear project ownership
3. **Easy filtering**: `--filter @edu-platform/*`
4. **Monorepo best practice**: Standard in modern projects
5. **Future-proof**: Can publish to private npm registry if needed

## Example Workflow

```bash
# 1. Clone the repo
git clone <repo-url>
cd argus

# 2. Install all dependencies
pnpm install

# 3. Run development (all packages)
pnpm dev

# 4. Add a package to API
pnpm --filter @edu-platform/api add zod

# 5. Build everything
pnpm build

# 6. Run tests
pnpm test
```

## Troubleshooting

### "Cannot find module '@edu-platform/api'"

```bash
pnpm install    # Reinstall to create workspace links
```

### "Workspace packages not found"

Check `pnpm-workspace.yaml` paths match your folders.

### "Lock file is out of sync"

```bash
pnpm install --force
```

### Clean installation

```bash
# Remove all node_modules
pnpm clean

# Or manually
rm -rf node_modules api/node_modules web/node_modules

# Reinstall
pnpm install
```

## Advanced: Sharing Code Between Packages

Create a shared package:

```
packages/
  shared/
    package.json  # @edu-platform/shared
    src/
      utils/
```

Then use in api or web:

```json
{
  "dependencies": {
    "@edu-platform/shared": "workspace:*"
  }
}
```

---

Your PNPM workspace is fully configured and ready! 🎉
