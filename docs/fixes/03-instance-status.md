# Course Instance Status Bug Fix

## Problem Description
The Course Instance Management page allows filtering by statuses like "Enrollment Open" and "In Progress", but selecting these returns no results. This is because the frontend uses different status codes than the backend database.

## Root Cause Analysis
- **Frontend (`web/src/pages/management/instance/index.tsx`):** Uses `enrollment_open` and `in_progress`.
- **Backend (`prisma/schema.prisma`):** Uses `scheduled`, `active`, `draft`, `completed`, `archived`.

## Implementation Steps

### 1. Update Frontend Status Constants
**File:** `web/src/pages/management/instance/index.tsx`

**Current Status Config:**
```typescript
<SelectItem value="enrollment_open">Enrollment Open</SelectItem>
<SelectItem value="in_progress">In Progress</SelectItem>
```

**Fix:**
Align the `Select` options with the Prisma Enum `InstanceStatus`.

1. **Update `InstanceStatus` type:**
   Ensure it matches the backend: `draft | scheduled | active | completed | archived`.

2. **Update Filter Options:**
   Replace the `SelectContent` items:

```tsx
<SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="draft">Draft</SelectItem>
    <SelectItem value="scheduled">Scheduled</SelectItem> 
    <SelectItem value="active">Active (In Progress)</SelectItem>
    <SelectItem value="completed">Completed</SelectItem>
    <SelectItem value="archived">Archived</SelectItem>
</SelectContent>
```

*Note: "Enrollment Open" is actually a boolean flag (`enrollmentOpen`) in the DB, not a primary status. If filtering by enrollment status is needed, it requires a separate toggle or a more complex filter.*

### 2. Update Status Badge Configuration
Ensure the `statusConfig` object maps these keys to labels correctly.

```typescript
const statusConfig = {
    draft: { label: "Draft", variant: "default" },
    scheduled: { label: "Scheduled", variant: "info" },
    active: { label: "Active", variant: "success" },
    completed: { label: "Completed", variant: "warning" },
    archived: { label: "Archived", variant: "error" },
};
```

## Verification
1. Go to `http://localhost:3001/management/instance`.
2. Select "Active" (was "In Progress") from the dropdown.
3. Verify that instances stored as `active` in the DB now appear in the list.
