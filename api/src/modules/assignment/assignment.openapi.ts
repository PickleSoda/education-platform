import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse } from '@/openapi/common.schemas';

// Response schemas
const gradingCriteriaSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  maxPoints: z.number(),
  sortOrder: z.number(),
});

const syllabusItemRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  weekNumber: z.number().nullable(),
});

const assignmentTemplateSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  assignmentType: z.enum(['homework', 'quiz', 'midterm', 'final', 'project', 'participation']),
  gradingMode: z.enum(['points', 'pass_fail']),
  maxPoints: z.number().nullable(),
  weightPercentage: z.number().nullable(),
  defaultDurationDays: z.number().nullable(),
  instructions: z.string().nullable(),
  attachments: z.any().nullable(),
  syllabusItemId: z.string().nullable(),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  gradingCriteria: z.array(gradingCriteriaSchema).optional(),
  syllabusItem: syllabusItemRefSchema.nullable().optional(),
});

const gradingStructureSchema = z.object({
  templates: z.array(assignmentTemplateSchema),
  totalWeight: z.number(),
  totalMaxPoints: z.number(),
});

// Request schemas
const createAssignmentTemplateSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  assignmentType: z.enum(['homework', 'quiz', 'midterm', 'final', 'project', 'participation']),
  gradingMode: z.enum(['points', 'pass_fail']),
  maxPoints: z.number().optional(),
  weightPercentage: z.number().optional(),
  defaultDurationDays: z.number().optional(),
  instructions: z.string().optional(),
  syllabusItemId: z.string().optional(),
  gradingCriteria: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        maxPoints: z.number(),
      })
    )
    .optional(),
});

const updateAssignmentTemplateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  assignmentType: z
    .enum(['homework', 'quiz', 'midterm', 'final', 'project', 'participation'])
    .optional(),
  gradingMode: z.enum(['points', 'pass_fail']).optional(),
  maxPoints: z.number().optional(),
  weightPercentage: z.number().optional(),
  defaultDurationDays: z.number().optional(),
  instructions: z.string().optional(),
  syllabusItemId: z.string().optional(),
});

const addGradingCriteriaSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  maxPoints: z.number(),
});

// Examples
const assignmentExample = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  courseId: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Homework 1: Introduction to Variables',
  description: 'Practice exercises on variable declaration and types',
  assignmentType: 'homework',
  gradingMode: 'points',
  maxPoints: 100,
  weightPercentage: 10,
  defaultDurationDays: 7,
  instructions: 'Complete all exercises in the provided template.',
  attachments: null,
  syllabusItemId: null,
  sortOrder: 0,
  createdAt: '2025-01-15T10:30:00.000Z',
  updatedAt: '2025-01-15T10:30:00.000Z',
  gradingCriteria: [
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      templateId: '550e8400-e29b-41d4-a716-446655440010',
      name: 'Correctness',
      description: 'All exercises produce correct output',
      maxPoints: 70,
      sortOrder: 0,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      templateId: '550e8400-e29b-41d4-a716-446655440010',
      name: 'Code Quality',
      description: 'Code is well-organized and documented',
      maxPoints: 30,
      sortOrder: 1,
    },
  ],
};

export const registerAssignmentPaths = (registry: OpenAPIRegistry) => {
  // Create assignment template
  registry.registerPath({
    method: 'post',
    path: '/courses/{courseId}/assignments',
    tags: ['Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Create assignment template',
    description: 'Create a new assignment template for a course. Requires teacher or admin role.',
    request: {
      params: z.object({ courseId: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: createAssignmentTemplateSchema,
            example: {
              title: 'Homework 1: Introduction to Variables',
              description: 'Practice exercises on variable declaration and types',
              assignmentType: 'homework',
              gradingMode: 'points',
              maxPoints: 100,
              weightPercentage: 10,
              defaultDurationDays: 7,
              gradingCriteria: [
                {
                  name: 'Correctness',
                  description: 'All exercises produce correct output',
                  maxPoints: 70,
                },
                { name: 'Code Quality', description: 'Code is well-organized', maxPoints: 30 },
              ],
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Assignment template created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(assignmentTemplateSchema),
            example: {
              success: true,
              message: 'Assignment template created successfully',
              data: assignmentExample,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // List assignment templates
  registry.registerPath({
    method: 'get',
    path: '/courses/{courseId}/assignments',
    tags: ['Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'List assignment templates',
    description: 'Get all assignment templates for a course.',
    request: {
      params: z.object({ courseId: z.string() }),
      query: z.object({
        assignmentType: z.string().optional(),
        syllabusItemId: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: 'Assignment templates retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(assignmentTemplateSchema)),
            example: {
              success: true,
              message: 'Assignment templates retrieved successfully',
              data: [assignmentExample],
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get grading structure
  registry.registerPath({
    method: 'get',
    path: '/courses/{courseId}/grading-structure',
    tags: ['Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Get grading structure',
    description:
      'Get the complete grading structure for a course including all assignment templates.',
    request: {
      params: z.object({ courseId: z.string() }),
    },
    responses: {
      200: {
        description: 'Grading structure retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(gradingStructureSchema),
            example: {
              success: true,
              message: 'Grading structure retrieved successfully',
              data: {
                templates: [assignmentExample],
                totalWeight: 100,
                totalMaxPoints: 1000,
              },
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get assignment template
  registry.registerPath({
    method: 'get',
    path: '/assignments/{id}',
    tags: ['Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Get assignment template',
    description: 'Get an assignment template by ID.',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Assignment template retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(assignmentTemplateSchema),
            example: {
              success: true,
              message: 'Assignment template retrieved successfully',
              data: assignmentExample,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update assignment template
  registry.registerPath({
    method: 'patch',
    path: '/assignments/{id}',
    tags: ['Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Update assignment template',
    description: 'Update an assignment template. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: updateAssignmentTemplateSchema,
            example: {
              title: 'Homework 1: Variables and Data Types',
              maxPoints: 120,
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Assignment template updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(assignmentTemplateSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete assignment template
  registry.registerPath({
    method: 'delete',
    path: '/assignments/{id}',
    tags: ['Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Delete assignment template',
    description:
      'Delete an assignment template. Cannot delete if template has been published. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      204: {
        description: 'Assignment template deleted successfully',
      },
      ...commonResponses,
    },
  });

  // Copy assignment template
  registry.registerPath({
    method: 'post',
    path: '/assignments/{id}/copy',
    tags: ['Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Copy assignment template',
    description: 'Create a copy of an assignment template. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({ targetCourseId: z.string().optional() }),
            example: { targetCourseId: '550e8400-e29b-41d4-a716-446655440001' },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Assignment template copied successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(assignmentTemplateSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Add grading criteria
  registry.registerPath({
    method: 'post',
    path: '/assignments/{id}/criteria',
    tags: ['Assignments', 'Grading Criteria'],
    security: [{ bearerAuth: [] }],
    summary: 'Add grading criteria',
    description:
      'Add a grading criterion to an assignment template. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: addGradingCriteriaSchema,
            example: {
              name: 'Documentation',
              description: 'Code includes appropriate comments',
              maxPoints: 20,
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Grading criteria added successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(gradingCriteriaSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update grading criteria
  registry.registerPath({
    method: 'patch',
    path: '/assignments/{id}/criteria/{criteriaId}',
    tags: ['Assignments', 'Grading Criteria'],
    security: [{ bearerAuth: [] }],
    summary: 'Update grading criteria',
    description: 'Update a grading criterion. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string(), criteriaId: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({
              name: z.string().optional(),
              description: z.string().optional(),
              maxPoints: z.number().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Grading criteria updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(gradingCriteriaSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete grading criteria
  registry.registerPath({
    method: 'delete',
    path: '/assignments/{id}/criteria/{criteriaId}',
    tags: ['Assignments', 'Grading Criteria'],
    security: [{ bearerAuth: [] }],
    summary: 'Delete grading criteria',
    description: 'Delete a grading criterion. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string(), criteriaId: z.string() }),
    },
    responses: {
      204: {
        description: 'Grading criteria deleted successfully',
      },
      ...commonResponses,
    },
  });

  // Validate grading criteria
  registry.registerPath({
    method: 'get',
    path: '/assignments/{id}/validate',
    tags: ['Assignments'],
    security: [{ bearerAuth: [] }],
    summary: 'Validate grading criteria',
    description: 'Check if grading criteria sum equals maxPoints. Requires teacher or admin role.',
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: {
        description: 'Validation completed',
        content: {
          'application/json': {
            schema: withSuccessResponse(
              z.object({
                valid: z.boolean(),
                criteriaSum: z.number(),
                maxPoints: z.number(),
              })
            ),
            example: {
              success: true,
              message: 'Validation completed',
              data: { valid: true, criteriaSum: 100, maxPoints: 100 },
            },
          },
        },
      },
      ...commonResponses,
    },
  });
};
