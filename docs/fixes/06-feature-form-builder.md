# Feature: Form Builder (Assignment Type)

## Concept
A flexible form builder for assignments (Quizzes, Surveys) using a JSON schema stored directly on the Assignment model. 

## Data Structure
We will use the existing `attachments` JSON field on `AssignmentTemplate` and `PublishedAssignment`. To support both standard file attachments (like PDFs for a midterm) and the Quiz Form simultaneously, this field will be an **extensible array of attachment objects**.

**Schema Structure (JSON):**
```typescript
type Attachment = FileAttachment | FormAttachment;

interface FileAttachment {
  type: 'file';
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

interface FormAttachment {
  type: 'form';
  id: string;
  title?: string;
  questions: Question[];
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'checkbox' | 'short_answer' | 'paragraph';
  text: string;
  points: number;
  options?: Option[];
  correctAnswer?: string[]; // Array of option IDs or text matches
}

interface Option {
  id: string;
  text: string;
}
```

**Example JSON stored in DB:**
```json
[
  {
    "type": "file",
    "id": "file-123",
    "name": "Midterm_Instructions.pdf",
    "url": "https://s3..."
  },
  {
    "type": "form",
    "id": "form-456",
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "text": "What is 2+2?",
        "points": 5,
        "options": [
          { "id": "opt-1", "text": "3" },
          { "id": "opt-2", "text": "4" }
        ],
        "correctAnswer": ["opt-2"]
      }
    ]
  }
]
```

## Implementation Plan

### 1. Backend Validation
**File:** `api/src/modules/assignment/assignment.validation.ts`

**Task:** Update `createAssignmentSchema` and `updateAssignmentSchema`.
*   Validate `attachments` as an array.
*   Use Zod discriminated union to validate objects based on `type` ('file' vs 'form').
*   Ensure Form structure is valid (questions exist, points are positive).

### 2. Frontend: Form Builder UI
**Location:** `web/src/components/form-builder` (New Directory)

**Components:**
1.  **`FormBuilder`**: Main container.
    *   **LocalStorage Integration:** Use `useLocalStorage` hook (from `react-use` or custom) to autosave the form state (`form_builder_draft_${assignmentId}`) as the teacher edits. Clear on successful save.
    *   Manages the state of the `questions` array.
2.  **`QuestionEditor`**: Card for a single question.
    *   Input: Question Text (Textarea).
    *   Select: Type (Radio, Checkbox, Text).
    *   Input: Points (Number).
    *   **`OptionList`**: For Radio/Checkbox types.
        *   Add/Remove options.
        *   **Correct Answer Toggle**: A radio/checkbox next to the option to mark it as correct (for auto-grading).
3.  **`FormRenderer`**: Component to render the form for the **Student View**.
    *   **LocalStorage Integration:** Autosave student answers locally (`submission_draft_${assignmentId}`) to prevent data loss during the exam.

### 3. Integration in Assignment Editor
**File:** `web/src/pages/management/course/edit/tabs/assignments-tab.tsx` or `assignment-modal.tsx`

**Logic:**
*   The Attachment section should allow adding multiple items.
*   "Add File" button -> Uploads file, adds `{type: 'file', ...}` to array.
*   "Add/Edit Quiz" button -> Opens `FormBuilder`. On save, adds or updates the `{type: 'form', ...}` object in the array.
*   Ensure the UI can display both a list of uploaded files AND the presence of a quiz form.

### 4. Auto-Grading Logic
**File:** `api/src/modules/submission/submission.service.ts`

**Task:** Update `submitAssignment` or create a new `submitQuiz` method.
*   When a submission is received:
    *   Find the `form` attachment in the Assignment's `attachments` array.
    *   If found, treat as Answer Key.
    *   Compare student's `content` (JSON answers) vs Answer Key.
    *   Calculate `finalPoints`.
    *   Set status to `graded`.

### 5. Relevant Files
*   `api/src/modules/assignment/assignment.validation.ts`
*   `api/src/modules/assignment/assignment.service.ts`
*   `api/src/modules/submission/submission.service.ts`
*   `web/src/components/form-builder` (New Directory)
*   `web/src/pages/management/course/edit/tabs/assignments-tab.tsx`
*   `web/src/types/entity.ts` (Update Assignment interface)
