# Module Structure Guide

> **Date**: December 9, 2025  
> **Purpose**: Define the standard structure for all API modules in the educational platform

## Overview

Each module follows a consistent layered architecture pattern with clear separation of concerns:

```
src/modules/<module-name>/
├── <module>.repository.ts   # Database queries (Prisma)
├── <module>.service.ts      # Business logic
├── <module>.controller.ts   # HTTP request/response handling
├── <module>.route.ts        # Express route definitions
├── <module>.validation.ts   # Input validation schemas (Zod)
└── <module>.openapi.ts      # OpenAPI/Swagger documentation
```

## Layer Responsibilities

### 1. Repository Layer (`*.repository.ts`)

**Purpose**: Database access and queries

**Responsibilities**:

- Direct Prisma queries
- CRUD operations
- Complex queries with joins/aggregations
- Transaction management
- No business logic

**Pattern**:

```typescript
import { Prisma } from '@prisma/client'
import prisma from '@/client'
import { PaginationOptions, PaginatedResult } from '@/shared/repositories/base.repository'

// Types
export interface EntityCreateInput { ... }
export interface EntityUpdateInput { ... }
export interface EntityRepository { ... }

// Query functions
export const createEntity = async (data: EntityCreateInput) => { ... }
export const findEntityById = async (id: string) => { ... }
export const findEntities = async (where, options) => { ... }
export const updateEntity = async (id: string, data) => { ... }
export const deleteEntity = async (id: string) => { ... }

// Export repository object
export const entityRepository: EntityRepository = {
  create: createEntity,
  findById: findEntityById,
  findMany: findEntities,
  update: updateEntity,
  delete: deleteEntity,
  // ... custom queries
}
```

### 2. Service Layer (`*.service.ts`)

**Purpose**: Business logic and orchestration

**Responsibilities**:

- Business rule validation
- Data transformation
- Orchestrating multiple repository calls
- Transaction coordination
- Error handling
- Calling external services
- Sending notifications

**Pattern**:

```typescript
import { entityRepository } from './entity.repository'
import { notificationService } from '@/modules/notification/notification.service'

export const createEntity = async (data: CreateData, userId: string) => {
  // Validate business rules
  // Call repository
  const entity = await entityRepository.create(data)
  
  // Trigger side effects (notifications, etc.)
  await notificationService.notify(...)
  
  return entity
}

export const getEntityWithRelations = async (id: string) => {
  // Orchestrate multiple queries
  // Transform data for presentation
  return transformedData
}

export const entityService = {
  create: createEntity,
  getById: getEntityWithRelations,
  // ...
}
```

### 3. Controller Layer (`*.controller.ts`)

**Purpose**: HTTP request/response handling

**Responsibilities**:

- Extract data from request (params, query, body)
- Call service layer
- Format response
- Set HTTP status codes
- Handle controller-level errors
- No business logic

**Pattern**:

```typescript
import { Request, Response, NextFunction } from 'express'
import { entityService } from './entity.service'

export const createEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body
    const userId = req.user!.id
    
    const entity = await entityService.create(data, userId)
    
    res.status(201).json({
      success: true,
      data: entity,
      message: 'Entity created successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const getEntity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const entity = await entityService.getById(id)
    
    res.status(200).json({ success: true, data: entity })
  } catch (error) {
    next(error)
  }
}

export const entityController = {
  create: createEntity,
  getById: getEntity,
  // ...
}
```

### 4. Route Layer (`*.route.ts`)

**Purpose**: Define HTTP endpoints

**Responsibilities**:

- Map URLs to controllers
- Apply middleware (auth, validation)
- Define HTTP methods
- Group related endpoints

**Pattern**:

```typescript
import { Router } from 'express'
import { entityController } from './entity.controller'
import { authenticate, authorize } from '@/shared/middlewares/auth'
import { validate } from '@/shared/middlewares/validation'
import { createEntitySchema, updateEntitySchema } from './entity.validation'

const router = Router()

// Public routes
router.get('/entities', entityController.list)
router.get('/entities/:id', entityController.getById)

// Protected routes
router.use(authenticate)

router.post(
  '/entities',
  authorize('teacher', 'admin'),
  validate(createEntitySchema),
  entityController.create
)

router.patch(
  '/entities/:id',
  authorize('teacher', 'admin'),
  validate(updateEntitySchema),
  entityController.update
)

router.delete(
  '/entities/:id',
  authorize('admin'),
  entityController.delete
)

export default router
```

### 5. Validation Layer (`*.validation.ts`)

**Purpose**: Input validation schemas

**Responsibilities**:

- Define Zod schemas for request validation
- Type inference from schemas
- Custom validation rules
- Error messages

**Pattern**:

```typescript
import { z } from 'zod'

export const createEntitySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    type: z.enum(['type1', 'type2']),
    metadata: z.record(z.any()).optional(),
  })
})

export const updateEntitySchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
  })
})

export const listEntitiesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
})

// Type inference
export type CreateEntityInput = z.infer<typeof createEntitySchema>['body']
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>['body']
```

### 6. OpenAPI Layer (`*.openapi.ts`)

**Purpose**: API documentation

**Responsibilities**:

- Document endpoints
- Define request/response schemas
- Example requests/responses
- Authentication requirements
- Error responses

**Pattern**:

```typescript
import { createRoute } from '@hono/zod-openapi'
import { createEntitySchema } from './entity.validation'

export const createEntityRoute = createRoute({
  method: 'post',
  path: '/entities',
  tags: ['Entities'],
  summary: 'Create a new entity',
  description: 'Creates a new entity with the provided data',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createEntitySchema.shape.body,
          example: {
            name: 'Sample Entity',
            type: 'type1',
            description: 'This is a sample entity'
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Entity created successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: { type: 'object' },
              message: { type: 'string' }
            }
          }
        }
      }
    },
    400: { description: 'Invalid input' },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' }
  }
})
```

---

## Module Plan

### 1. **Course Module** (`src/modules/course/`)

**Domain**: Course templates, tags, lecturers, syllabus items

**Repository Queries**:

- `createCourse(data)` - Create course with tags and lecturers
- `getCourseById(id)` - Get course with relations
- `getCourseWithTemplates(id)` - Get course with all templates
- `listCourses(filters, pagination)` - Search/filter courses
- `updateCourse(id, data)` - Update course details
- `archiveCourse(id)` - Soft delete course
- `addCourseTag(courseId, tagName)` - Add tag to course
- `addCourseLecturer(courseId, userId, isPrimary)` - Add lecturer
- `removeLecturer(courseId, userId)` - Remove lecturer

**Service Methods**:

- `createCourseWithStructure()` - Create course + default syllabus
- `copyCourse()` - Duplicate course template
- `searchCourses()` - Full-text search
- `getCourseAnalytics()` - Usage statistics

**Endpoints**:

- `POST /courses` - Create course
- `GET /courses` - List/search courses
- `GET /courses/:id` - Get course details
- `PATCH /courses/:id` - Update course
- `DELETE /courses/:id` - Archive course
- `POST /courses/:id/tags` - Add tag
- `POST /courses/:id/lecturers` - Add lecturer
- `DELETE /courses/:id/lecturers/:userId` - Remove lecturer

---

### 2. **Assignment Module** (`src/modules/assignment/`)

**Domain**: Assignment templates and grading criteria

**Repository Queries**:

- `createAssignmentTemplate(data)` - Create with criteria
- `getAssignmentTemplate(id)` - Get template with criteria
- `getGradingStructure(courseId)` - All assignments for course
- `updateAssignmentTemplate(id, data)` - Update template
- `deleteAssignmentTemplate(id)` - Remove template
- `addGradingCriteria(templateId, criteria)` - Add criterion
- `updateGradingCriteria(id, data)` - Update criterion
- `reorderCriteria(templateId, order)` - Change sort order

**Service Methods**:

- `validateGradingCriteria()` - Ensure sum equals maxPoints
- `copyAssignmentTemplate()` - Duplicate template
- `getTemplateUsageCount()` - Track usage across instances

**Endpoints**:

- `POST /courses/:courseId/assignments` - Create template
- `GET /courses/:courseId/assignments` - List templates
- `GET /assignments/:id` - Get template details
- `PATCH /assignments/:id` - Update template
- `DELETE /assignments/:id` - Delete template
- `POST /assignments/:id/criteria` - Add criterion
- `PATCH /assignments/:id/criteria/:criteriaId` - Update criterion

---

### 3. **Instance Module** (`src/modules/instance/`)

**Domain**: Course instances, published assignments, published resources

**Repository Queries**:

- `createInstance(data)` - Create instance with forums
- `getInstanceById(id)` - Get with full details
- `getInstanceWithDetails(id)` - Include all relations
- `listStudentInstances(studentId)` - Student's courses
- `listTeacherInstances(teacherId)` - Teacher's courses
- `updateInstanceStatus(id, status)` - Change status
- `toggleEnrollment(id, isOpen)` - Open/close enrollment
- `publishAssignment(data)` - Publish from template
- `togglePublishStatus(assignmentId, publish)` - Manual publish
- `getStudentAssignments(instanceId, studentId)` - Student view
- `getTeacherAssignments(instanceId)` - Teacher view
- `getAssignmentWithSubmissions(id)` - Grading view
- `publishResource(data)` - Publish resource
- `listPublishedResources(instanceId)` - Get resources

**Service Methods**:

- `createFromTemplate()` - Instance + copy all templates
- `autoPublishAssignments()` - Cron job for scheduled
- `closeInstance()` - Calculate final grades
- `cloneInstance()` - Copy to new semester

**Endpoints**:

- `POST /instances` - Create instance
- `GET /instances` - List instances
- `GET /instances/:id` - Get instance
- `PATCH /instances/:id` - Update instance
- `PATCH /instances/:id/status` - Change status
- `POST /instances/:id/assignments/publish` - Publish assignment
- `GET /instances/:id/assignments` - List assignments
- `POST /instances/:id/resources/publish` - Publish resource
- `GET /instances/:id/resources` - List resources

---

### 4. **Enrollment Module** (`src/modules/enrollment/`)

**Domain**: Student enrollment, final grades, course roster

**Repository Queries**:

- `enrollStudent(instanceId, studentId)` - Enroll
- `getInstanceEnrollments(instanceId)` - Roster
- `getStudentEnrollments(studentId)` - Student's courses
- `updateEnrollmentStatus(id, status)` - Drop/complete
- `calculateFinalGrade(instanceId, studentId)` - Compute grade
- `bulkEnroll(instanceId, studentIds)` - Batch enrollment
- `getEnrollmentStats(instanceId)` - Counts by status

**Service Methods**:

- `processEnrollment()` - Validate limits + notify
- `dropStudent()` - Update status + notify
- `calculateAllFinalGrades(instanceId)` - End of semester
- `exportRoster()` - Generate CSV

**Endpoints**:

- `POST /instances/:id/enroll` - Enroll student
- `GET /instances/:id/enrollments` - Get roster
- `PATCH /enrollments/:id/status` - Update status
- `POST /instances/:id/calculate-grades` - Calculate finals
- `GET /enrollments/me` - My enrollments

---

### 5. **Submission Module** (`src/modules/submission/`)

**Domain**: Student submissions, grading (points & pass/fail), gradebook

**Repository Queries**:

- `saveSubmission(data)` - Save draft
- `submitAssignment(assignmentId, studentId)` - Submit
- `gradeSubmission(data)` - Grade with criteria
- `gradePassFail(data)` - Pass/fail grading
- `getStudentGradebook(instanceId, studentId)` - Gradebook
- `getSubmission(id)` - Get submission details
- `listPendingSubmissions(instanceId)` - To grade
- `getSubmissionStats(assignmentId)` - Completion rates

**Service Methods**:

- `validateSubmission()` - Check deadline
- `autoCalculateGrade()` - Sum criteria + penalty
- `returnSubmission()` - Mark as returned + notify
- `downloadSubmissions()` - Bulk download

**Endpoints**:

- `POST /assignments/:id/submissions` - Save draft
- `POST /assignments/:id/submissions/submit` - Submit
- `GET /assignments/:id/submissions` - List submissions (teacher)
- `GET /submissions/:id` - Get submission
- `POST /submissions/:id/grade` - Grade submission
- `GET /instances/:id/gradebook` - Student gradebook

---

### 6. **Forum Module** (`src/modules/forum/`)

**Domain**: Discussion forums, posts, comments, reactions

**Repository Queries**:

- `getInstanceForums(instanceId)` - List forums
- `getForumWithPosts(forumId, filters)` - Forum + posts
- `createPost(data)` - Create post
- `getPostWithComments(postId, userId?)` - Post + comments
- `addComment(data)` - Add comment
- `markAsAnswer(commentId, authorId)` - Mark answer
- `togglePostReaction(postId, userId, type)` - React
- `toggleCommentReaction(commentId, userId, type)` - React
- `searchPosts(instanceId, query)` - Search
- `updatePost(id, data)` - Edit post
- `lockPost(id)` - Lock post

**Service Methods**:

- `createWithMentions()` - Parse @mentions + notify
- `processPostCreation()` - Create + notify followers
- `searchWithHighlight()` - Full-text search

**Endpoints**:

- `GET /instances/:id/forums` - List forums
- `GET /forums/:id/posts` - Get posts
- `POST /forums/:id/posts` - Create post
- `GET /posts/:id` - Get post + comments
- `PATCH /posts/:id` - Edit post
- `POST /posts/:id/comments` - Add comment
- `POST /posts/:id/reactions` - Toggle reaction
- `POST /comments/:id/answer` - Mark as answer

---

### 7. **Announcement Module** (`src/modules/announcement/`)

**Domain**: Course announcements

**Repository Queries**:

- `createAnnouncement(data)` - Create + notify
- `getInstanceAnnouncements(instanceId)` - List
- `updateAnnouncement(id, data)` - Edit
- `deleteAnnouncement(id)` - Remove
- `pinAnnouncement(id)` - Toggle pin
- `publishAnnouncement(id)` - Publish + notify

**Service Methods**:

- `scheduleAnnouncement()` - Schedule for later
- `sendAnnouncementNotifications()` - Batch notify

**Endpoints**:

- `POST /instances/:id/announcements` - Create
- `GET /instances/:id/announcements` - List
- `PATCH /announcements/:id` - Update
- `DELETE /announcements/:id` - Delete
- `POST /announcements/:id/publish` - Publish

---

### 8. **Dashboard Module** (`src/modules/dashboard/`)

**Domain**: Analytics and overview queries

**Repository Queries**:

- `getTeacherDashboard(teacherId)` - Overview
- `getStudentDashboard(studentId)` - Overview
- `getInstanceGradeDistribution(instanceId)` - Analytics
- `getSubmissionTrends(instanceId)` - Trends
- `getForumActivity(instanceId)` - Activity stats

**Service Methods**:

- `generateWeeklySummary()` - Email digest
- `getUpcomingDeadlines()` - Next 7 days
- `calculateProgressMetrics()` - Completion %

**Endpoints**:

- `GET /dashboard/teacher` - Teacher dashboard
- `GET /dashboard/student` - Student dashboard
- `GET /instances/:id/analytics` - Instance analytics

---

## Migration Checklist

For each module:

- [ ] Create directory structure
- [ ] Move queries from `queries.ts` to `*.repository.ts`
- [ ] Create service layer with business logic
- [ ] Create controller with HTTP handlers
- [ ] Define routes with middleware
- [ ] Add validation schemas
- [ ] Document OpenAPI endpoints
- [ ] Write unit tests for repository
- [ ] Write integration tests for endpoints
- [ ] Update imports in existing code

---

## Best Practices

1. **Repository Layer**:
   - Keep queries focused and simple
   - Use transactions for multi-step operations
   - Return raw Prisma results (no transformation)
   - Include proper error handling

2. **Service Layer**:
   - Validate business rules before database calls
   - Handle transactions across multiple repositories
   - Transform data for API responses
   - Trigger notifications and side effects

3. **Controller Layer**:
   - Keep thin (delegate to service)
   - Consistent response format
   - Proper HTTP status codes
   - Use next(error) for error handling

4. **Route Layer**:
   - Group related endpoints
   - Apply authentication first
   - Apply authorization per role
   - Validate input last (before controller)

5. **Validation Layer**:
   - Validate all user input
   - Provide clear error messages
   - Use Zod for type safety
   - Define reusable schemas

6. **Testing**:
   - Unit test repositories with mock Prisma
   - Integration test endpoints with test database
   - Test authorization rules
   - Test error cases

---

**Next Steps**: Start with `course` module as it's the foundation for other modules.
