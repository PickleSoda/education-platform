# Grading Display Bug Fix

## Problem Description
In the Assignment Management page, graded submissions appear with a status of "Graded" (Green badge), but the grade value (points) is displayed as " - " (Ungraded).

## Root Cause Analysis
The frontend table configuration in `AssignmentManagementPage` is missing the column definition for the actual grade awarded to the submission. It currently only displays `publishedAssignment.maxPoints` but ignores `submission.finalPoints`.

## Implementation Steps

### 1. Update Table Columns
**File:** `web/src/pages/management/assignment/index.tsx`

**Current Code:**
```typescript
{
    title: "Max Points",
    dataIndex: ["publishedAssignment", "maxPoints"],
    // ...
},
```

**Fix:**
Add a new "Grade" column before or after "Max Points".

```typescript
{
    title: "Grade",
    key: "grade",
    width: 100,
    align: "center",
    render: (_, record) => {
        // record is SubmissionWithCourseRelations
        if (record.status === 'graded' && record.finalPoints != null) {
            return (
                <span className="font-semibold text-success">
                    {record.finalPoints}
                </span>
            );
        }
        return <span className="text-text-secondary">-</span>;
    }
},
```

### 2. Verify Data Interface
Ensure the `SubmissionWithCourseRelations` interface in `web/src/entity/submission.ts` (or equivalent types file) actually includes `finalPoints`.
Based on `api/src/modules/submission/submission.repository.ts`, `transformSubmission` ensures `finalPoints` is returned as a number.

## Verification
1. Go to `http://localhost:3001/management/assignment`.
2. Find a submission with status "Graded".
3. Verify the new "Grade" column shows a numeric value instead of "-".
