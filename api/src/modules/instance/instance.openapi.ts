import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse, withPaginatedResponse } from '@/openapi/common.schemas';

// Shared schemas
const courseRefSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  credits: z.number().nullable(),
});

const userRefSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});

const lecturerSchema = z.object({
  userId: z.string(),
  role: z.string(),
  user: userRefSchema,
});

const forumSchema = z.object({
  id: z.string(),
  title: z.string(),
  forumType: z.string(),
  sortOrder: z.number(),
});

// Instance response schemas
const instanceSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  semester: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['draft', 'scheduled', 'active', 'completed', 'archived']),
  enrollmentOpen: z.boolean(),
  enrollmentLimit: z.number().nullable(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  course: courseRefSchema.optional(),
  lecturers: z.array(lecturerSchema).optional(),
  forums: z.array(forumSchema).optional(),
  _count: z
    .object({
      enrollments: z.number(),
      publishedAssignments: z.number(),
      publishedResources: z.number(),
    })
    .optional(),
});

const gradingCriteriaSchema = z.object({
  id: z.string(),
  publishedAssignmentId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  maxPoints: z.number(),
  sortOrder: z.number(),
});

const publishedAssignmentSchema = z.object({
  id: z.string(),
  instanceId: z.string(),
  templateId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  assignmentType: z.enum(['homework', 'quiz', 'midterm', 'final', 'project', 'participation']),
  gradingMode: z.enum(['points', 'pass_fail']),
  maxPoints: z.number().nullable(),
  weightPercentage: z.number().nullable(),
  instructions: z.string().nullable(),
  publishAt: z.string().nullable(),
  deadline: z.string(),
  lateDeadline: z.string().nullable(),
  latePenaltyPercent: z.number().nullable(),
  status: z.enum(['draft', 'scheduled', 'published', 'closed']),
  autoPublish: z.boolean(),
  publishedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  gradingCriteria: z.array(gradingCriteriaSchema).optional(),
  _count: z.object({ submissions: z.number() }).optional(),
});

const instanceStatsSchema = z.object({
  instanceId: z.string(),
  courseCode: z.string(),
  courseTitle: z.string(),
  semester: z.string(),
  status: z.string(),
  enrollmentCount: z.number(),
  enrollmentLimit: z.number().nullable(),
  assignmentCount: z.number(),
  resourceCount: z.number(),
  submissionStats: z.object({
    total: z.number(),
    pending: z.number(),
    graded: z.number(),
  }),
});

// Request schemas
const createInstanceSchema = z.object({
  courseId: z.string(),
  semester: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  enrollmentLimit: z.number().optional(),
  enrollmentOpen: z.boolean().optional(),
  lecturerIds: z.array(z.string()).optional(),
});

const updateInstanceSchema = z.object({
  semester: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  enrollmentLimit: z.number().optional(),
  enrollmentOpen: z.boolean().optional(),
});

const publishAssignmentSchema = z.object({
  templateId: z.string(),
  publishAt: z.string().optional(),
  deadline: z.string(),
  lateDeadline: z.string().optional(),
  latePenaltyPercent: z.number().optional(),
  autoPublish: z.boolean().optional(),
});

// Examples
const instanceExample = {
  id: '550e8400-e29b-41d4-a716-446655440100',
  courseId: '550e8400-e29b-41d4-a716-446655440000',
  semester: 'Spring 2025',
  startDate: '2025-02-01T00:00:00.000Z',
  endDate: '2025-06-01T00:00:00.000Z',
  status: 'active',
  enrollmentOpen: true,
  enrollmentLimit: 30,
  createdBy: '550e8400-e29b-41d4-a716-446655440001',
  createdAt: '2025-01-15T10:30:00.000Z',
  updatedAt: '2025-01-15T10:30:00.000Z',
  course: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    code: 'CS101',
    title: 'Introduction to Computer Science',
    description: 'A foundational course covering programming basics.',
    credits: 6,
  },
  lecturers: [
    {
      userId: '550e8400-e29b-41d4-a716-446655440001',
      role: 'primary_lecturer',
      user: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'lecturer@university.edu',
        firstName: 'John',
        lastName: 'Smith',
      },
    },
  ],
  forums: [
    {
      id: '550e8400-e29b-41d4-a716-446655440200',
      title: 'General Discussion',
      forumType: 'general',
      sortOrder: 0,
    },
    { id: '550e8400-e29b-41d4-a716-446655440201', title: 'Q&A', forumType: 'qa', sortOrder: 1 },
  ],
  _count: {
    enrollments: 25,
    publishedAssignments: 5,
    publishedResources: 10,
  },
};

const publishedAssignmentExample = {
  id: '550e8400-e29b-41d4-a716-446655440300',
  instanceId: '550e8400-e29b-41d4-a716-446655440100',
  templateId: '550e8400-e29b-41d4-a716-446655440010',
  title: 'Homework 1: Introduction to Variables',
  description: 'Practice exercises on variable declaration and types',
  assignmentType: 'homework',
  gradingMode: 'points',
  maxPoints: 100,
  weightPercentage: 10,
  instructions: 'Complete all exercises in the provided template.',
  publishAt: null,
  deadline: '2025-03-01T23:59:59.000Z',
  lateDeadline: '2025-03-03T23:59:59.000Z',
  latePenaltyPercent: 20,
  status: 'published',
  autoPublish: false,
  publishedBy: '550e8400-e29b-41d4-a716-446655440001',
  createdAt: '2025-02-15T10:30:00.000Z',
  updatedAt: '2025-02-15T10:30:00.000Z',
  gradingCriteria: [
    {
      id: '550e8400-e29b-41d4-a716-446655440400',
      publishedAssignmentId: '550e8400-e29b-41d4-a716-446655440300',
      name: 'Correctness',
      description: 'All exercises produce correct output',
      maxPoints: 70,
      sortOrder: 0,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440401',
      publishedAssignmentId: '550e8400-e29b-41d4-a716-446655440300',
      name: 'Code Quality',
      description: 'Code is well-organized and documented',
      maxPoints: 30,
      sortOrder: 1,
    },
  ],
  _count: { submissions: 20 },
};

export const registerInstancePaths = (registry: OpenAPIRegistry) => {
  // Create instance
  registry.registerPath({
    method: 'post',
    path: '/instances',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Create a new course instance',
    description:
      'Create a new instance of a course for a specific semester. Requires teacher or admin role.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createInstanceSchema,
            example: {
              courseId: '550e8400-e29b-41d4-a716-446655440000',
              semester: 'Spring 2025',
              startDate: '2025-02-01T00:00:00.000Z',
              endDate: '2025-06-01T00:00:00.000Z',
              enrollmentLimit: 30,
              enrollmentOpen: true,
              lecturerIds: ['550e8400-e29b-41d4-a716-446655440001'],
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Instance created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(instanceSchema),
            example: {
              success: true,
              message: 'Instance created successfully',
              data: instanceExample,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // List instances
  registry.registerPath({
    method: 'get',
    path: '/instances',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'List course instances',
    description: 'Get a paginated list of course instances with optional filters.',
    request: {
      query: z.object({
        courseId: z.string().optional(),
        status: z.enum(['draft', 'scheduled', 'active', 'completed', 'archived']).optional(),
        semester: z.string().optional(),
        lecturerId: z.string().optional(),
        page: z.string().optional(),
        limit: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
      }),
    },
    responses: {
      200: {
        description: 'Instances retrieved successfully',
        content: {
          'application/json': {
            schema: withPaginatedResponse(instanceSchema),
            example: {
              success: true,
              message: 'Instances retrieved successfully',
              data: [instanceExample],
              meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get my enrolled instances
  registry.registerPath({
    method: 'get',
    path: '/instances/my/enrolled',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Get my enrolled instances',
    description: 'Get all course instances where the authenticated user is enrolled as a student.',
    responses: {
      200: {
        description: 'Enrolled instances retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(instanceSchema)),
            example: {
              success: true,
              message: 'Enrolled instances retrieved successfully',
              data: [instanceExample],
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get my teaching instances
  registry.registerPath({
    method: 'get',
    path: '/instances/my/teaching',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Get my teaching instances',
    description:
      'Get all course instances where the authenticated user is a lecturer. Requires teacher role.',
    responses: {
      200: {
        description: 'Teaching instances retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(instanceSchema)),
            example: {
              success: true,
              message: 'Teaching instances retrieved successfully',
              data: [instanceExample],
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get instance by ID
  registry.registerPath({
    method: 'get',
    path: '/instances/{id}',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Get instance by ID',
    description: 'Get detailed information about a specific course instance.',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Instance retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(instanceSchema),
            example: {
              success: true,
              message: 'Instance retrieved successfully',
              data: instanceExample,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get instance with details
  registry.registerPath({
    method: 'get',
    path: '/instances/{id}/details',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Get instance with full details',
    description:
      'Get an instance with all related data including assignments, resources, and enrollments.',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Instance details retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(instanceSchema),
            example: {
              success: true,
              message: 'Instance details retrieved successfully',
              data: instanceExample,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update instance
  registry.registerPath({
    method: 'patch',
    path: '/instances/{id}',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Update instance',
    description: 'Update instance information. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: updateInstanceSchema,
            example: {
              semester: 'Spring 2025',
              enrollmentLimit: 35,
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Instance updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(instanceSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update instance status
  registry.registerPath({
    method: 'patch',
    path: '/instances/{id}/status',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Update instance status',
    description:
      'Update the status of a course instance. Requires teacher or admin role. Valid transitions: draft→scheduled/active, scheduled→active/draft, active→completed/archived, completed→archived.',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              status: z.enum(['draft', 'scheduled', 'active', 'completed', 'archived']),
            }),
            example: { status: 'active' },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Instance status updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(instanceSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Toggle enrollment
  registry.registerPath({
    method: 'patch',
    path: '/instances/{id}/enrollment',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Toggle enrollment',
    description: 'Open or close enrollment for a course instance. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({ isOpen: z.boolean() }),
            example: { isOpen: false },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Enrollment toggled successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(instanceSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete instance
  registry.registerPath({
    method: 'delete',
    path: '/instances/{id}',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Delete instance',
    description:
      'Delete a course instance. Requires admin role. Cannot delete instances with active enrollments.',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      204: {
        description: 'Instance deleted successfully',
      },
      ...commonResponses,
    },
  });

  // Clone instance
  registry.registerPath({
    method: 'post',
    path: '/instances/{id}/clone',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Clone instance',
    description: 'Create a copy of an instance for a new semester. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              semester: z.string(),
              startDate: z.string(),
              endDate: z.string(),
            }),
            example: {
              semester: 'Fall 2025',
              startDate: '2025-09-01T00:00:00.000Z',
              endDate: '2025-12-20T00:00:00.000Z',
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Instance cloned successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(instanceSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get instance statistics
  registry.registerPath({
    method: 'get',
    path: '/instances/{id}/stats',
    tags: ['Instances'],
    security: [{ bearerAuth: [] }],
    summary: 'Get instance statistics',
    description: 'Get statistics for a course instance. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Instance statistics retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(instanceStatsSchema),
            example: {
              success: true,
              message: 'Instance statistics retrieved successfully',
              data: {
                instanceId: '550e8400-e29b-41d4-a716-446655440100',
                courseCode: 'CS101',
                courseTitle: 'Introduction to Computer Science',
                semester: 'Spring 2025',
                status: 'active',
                enrollmentCount: 25,
                enrollmentLimit: 30,
                assignmentCount: 5,
                resourceCount: 10,
                submissionStats: { total: 100, pending: 20, graded: 80 },
              },
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // ============================================================================
  // PUBLISHED ASSIGNMENT ROUTES
  // ============================================================================

  // Publish assignment
  registry.registerPath({
    method: 'post',
    path: '/instances/{id}/assignments/publish',
    tags: ['Instances', 'Published Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Publish assignment from template',
    description:
      'Publish an assignment template to a course instance. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: publishAssignmentSchema,
            example: {
              templateId: '550e8400-e29b-41d4-a716-446655440010',
              deadline: '2025-03-01T23:59:59.000Z',
              lateDeadline: '2025-03-03T23:59:59.000Z',
              latePenaltyPercent: 20,
              autoPublish: false,
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Assignment published successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(publishedAssignmentSchema),
            example: {
              success: true,
              message: 'Assignment published successfully',
              data: publishedAssignmentExample,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get instance assignments
  registry.registerPath({
    method: 'get',
    path: '/instances/{id}/assignments',
    tags: ['Instances', 'Published Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Get instance assignments',
    description: 'Get all published assignments for a course instance.',
    request: {
      params: z.object({ id: z.string() }),
      query: z.object({
        status: z.enum(['draft', 'scheduled', 'published', 'closed']).optional(),
      }),
    },
    responses: {
      200: {
        description: 'Assignments retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(publishedAssignmentSchema)),
            example: {
              success: true,
              message: 'Assignments retrieved successfully',
              data: [publishedAssignmentExample],
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get published assignment
  registry.registerPath({
    method: 'get',
    path: '/instances/{id}/assignments/{assignmentId}',
    tags: ['Instances', 'Published Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Get published assignment',
    description: 'Get a specific published assignment by ID.',
    request: {
      params: z.object({ id: z.string(), assignmentId: z.string() }),
    },
    responses: {
      200: {
        description: 'Assignment retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(publishedAssignmentSchema),
            example: {
              success: true,
              message: 'Assignment retrieved successfully',
              data: publishedAssignmentExample,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Toggle assignment publish status
  registry.registerPath({
    method: 'patch',
    path: '/instances/{id}/assignments/{assignmentId}/publish',
    tags: ['Instances', 'Published Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Toggle assignment publish status',
    description: 'Publish or unpublish an assignment. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string(), assignmentId: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({ publish: z.boolean() }),
            example: { publish: true },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Assignment publish status updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(publishedAssignmentSchema),
          },
        },
      },
      ...commonResponses,
    },
  });
};
