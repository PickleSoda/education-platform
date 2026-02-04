# Roles & Permissions Fix

## Problem Description
Users report that role changes and permissions are not working properly. Specifically, when a role is added to a user, the changes might not be reflected immediately in the UI or API access control.

## Root Cause Analysis
1. **Frontend State Stale**: When a role is added via `ManageRolesModal`, the local user list is invalidated, but the *current user's* own session/profile data might not be refreshed. If an admin modifies their own role or another user's role, the frontend application state needs to be updated.
2. **Case Sensitivity**: The frontend uses `.toLowerCase()` for role checks, but the database might store them differently if not strictly enforced.
3. **Passport/JWT**: The JWT strategy in `passport.ts` correctly fetches the user *with relations* on every request, so API access control is actually immediate. The issue is likely the **frontend** not knowing about the new permissions to show/hide UI elements.

## Implementation Steps

### 1. Update Frontend Store (UserStore)
We need to ensure the user store refreshes the profile after any role change.

**File:** `web/src/store/userStore.ts` (or equivalent auth context)
- **Action:** Add a `refreshProfile` action that re-fetches the `/auth/me` or `/users/me` endpoint.

### 2. Update `ManageRolesModal`
**File:** `web/src/pages/management/system/user/components/manage-roles-modal.tsx`

**Current Code:**
```typescript
onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    // ...
}
```

**Fix:**
If the user being modified is the *current* user, we must also refresh the auth state.

```typescript
// Add import
import { useUserStore } from "@/store/userStore";

// In component
const { user: currentUser, refreshProfile } = useUserStore();

// In onSuccess
onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
    
    // Check if we modified the current logged-in user
    if (user?.id === currentUser?.id) {
        refreshProfile(); 
        // OR force a window reload as a fallback if store doesn't support refresh
        // window.location.reload(); 
    }
    // ...
}
```

### 3. Verify Backend Role Checks
**File:** `api/src/config/roles.ts`
Ensure role names match the database perfectly. The DB seeding scripts use lowercase ('student', 'teacher', 'admin'), and the frontend `AVAILABLE_ROLES` constant uses lowercase.

**Validation:**
Ensure `api/src/modules/user/user.service.ts` uses exact string matching.

## Verification
1. Log in as Admin.
2. Open "Manage Users".
3. Remove your own "Admin" role (if possible) or add a "Student" role to yourself.
4. Verify the UI updates immediately (e.g., student menus appear) without a manual page refresh.
