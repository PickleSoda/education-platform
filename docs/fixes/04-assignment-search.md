# Assignment Search Bug Fix

## Problem Description
The search bar on the Assignment Management page (`http://localhost:3001/management/assignment`) does not work. Entering text updates the UI state but filters nothing.

## Root Cause Analysis
1. **Frontend:** The `search` state variable is defined but not passed to the `submissionService.getSubmissions` call in the `useQuery` hook.
2. **Backend:** The `listSubmissions` API endpoint and repository do not accept a `search` query parameter.

## Implementation Steps

### 1. Update Backend Repository
**File:** `api/src/modules/submission/submission.repository.ts`

**Action:** Update `listSubmissions` to accept a `search` string.

```typescript
// Update interface in params
export const listSubmissions = async (
  filters: {
    // ... existing filters
    search?: string; 
  },
  options: PaginationOptions
) => {
  // ...
  const where: Prisma.SubmissionWhereInput = {
    // ... existing filters
    ...(filters.search && {
      OR: [
        {
          student: {
            OR: [
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          publishedAssignment: {
            title: { contains: filters.search, mode: 'insensitive' },
          },
        },
        {
           publishedAssignment: {
             instance: {
                course: {
                   code: { contains: filters.search, mode: 'insensitive' }
                }
             }
           }
        }
      ],
    }),
  };
  // ...
}
```

### 2. Update Backend Service & Controller
**Files:**
- `api/src/modules/submission/submission.service.ts`
- `api/src/modules/submission/submission.controller.ts`
- `api/src/modules/submission/submission.validation.ts`

**Action:** Propagate the `search` parameter from the controller query params -> service -> repository.

1.  **Validation:** Add `search: z.string().optional()` to `listSubmissionsSchema`.
2.  **Controller:** Extract `search` from `req.query`.
3.  **Service:** Pass `search` to repository.

### 3. Update Frontend Service
**File:** `web/src/api/services/submissionService.ts`

**Action:** Update `getSubmissions` to accept `search` param.

```typescript
getSubmissions(params?: { status?: string; search?: string }) {
    return apiClient.get<SubmissionWithCourseRelations[]>('/submissions', { params });
}
```

### 4. Update Frontend Page
**File:** `web/src/pages/management/assignment/index.tsx`

**Action:** Pass the `search` state to the `useQuery` hook.

```typescript
// Add debounce to avoid api spam
const debouncedSearch = useDebounce(search, 500); // You might need to add a debounce hook

const { data: submissionsData, isLoading } = useQuery({
    queryKey: ["pending-submissions", filterStatus, debouncedSearch], // Add dependency
    queryFn: () =>
        submissionService.getSubmissions({
            status: filterStatus === "all" ? undefined : filterStatus,
            search: debouncedSearch || undefined, // Pass param
        }),
    // ...
});
```

## Verification
1. Go to Assignment Management.
2. Type a student's name or assignment title in the search box.
3. Verify the table filters to show only matching submissions.
