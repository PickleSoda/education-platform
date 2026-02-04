# Feature: Syllabus Builder

## Concept
The Syllabus feature should be separated from general resources and treated as a core structural component of the course. It defines the timeline (weeks/modules) and learning objectives.

## Current State
`SyllabusItem` entities already exist in the database and are currently managed within the `api/src/modules/resource` module. This is confusing and should be refactored or at least clearly exposed as a distinct feature in the UI.

## Implementation Plan

### 1. Backend Refactoring (Optional but Recommended)
Currently, `SyllabusItem` logic resides in `resource.controller.ts`, `resource.service.ts`, etc.
*   **Action:** Ensure endpoints are clearly defined.
*   **Endpoints Existed:**
    *   `POST /courses/:courseId/syllabus`
    *   `GET /courses/:courseId/syllabus`
    *   `PATCH /syllabus/:id`
    *   `DELETE /syllabus/:id`
*   **Task:** Verify these endpoints work as expected and handle `sortOrder` correctly for drag-and-drop reordering.

### 2. Frontend: Syllabus Builder Component
**Location:** `web/src/pages/management/course/edit/tabs/syllabus-tab.tsx`

**Features:**
1.  **List View:** Display syllabus items grouped by week/order.
2.  **Drag-and-Drop:** Use `@dnd-kit/core` and `@dnd-kit/sortable` to allow reordering items.
    *   *Note:* When an item is dropped, trigger a bulk update or sequential update to backend to save new `sortOrder`.
3.  **Inline Editing:**
    *   Edit `Title`, `Description`.
    *   **Learning Objectives:** A dynamic tag input (press Enter to add objective string).
4.  **Create New Item:** A simple form at the bottom or "Add Week" button.
    *   Fields: `Title` (e.g., "Week 1: Intro"), `Description`, `Learning Objectives`.
5.  **Integration:**
    *   This tab should be part of the Course Edit layout (`web/src/pages/management/course/edit/index.tsx`).

### 3. Relevant Files
*   `api/src/modules/resource/resource.controller.ts`
*   `api/src/modules/resource/resource.service.ts`
*   `api/src/modules/resource/resource.repository.ts`
*   `api/src/modules/resource/resource.validation.ts`
*   `web/src/pages/management/course/edit/tabs/syllabus-tab.tsx` (New)
*   `web/src/api/services/syllabusService.ts` (New - separate from resourceService for clarity)
*   `web/src/types/entity.ts` (Ensure `SyllabusItem` type is correct)
