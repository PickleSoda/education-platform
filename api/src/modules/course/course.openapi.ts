import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse, withPaginatedResponse } from '@/openapi/common.schemas';
import { courseExamples } from './course.seed';

// Response schemas
const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string().nullable(),
});

const lecturerSchema = z.object({
  userId: z.string(),
  isPrimary: z.boolean(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  }),
});

const courseTagSchema = z.object({
  tag: tagSchema,
});

const courseSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  credits: z.number().nullable(),
  typicalDurationWeeks: z.number().nullable(),
  isArchived: z.boolean(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(courseTagSchema).optional(),
  lecturers: z.array(lecturerSchema).optional(),
  _count: z
    .object({
      instances: z.number(),
    })
    .optional(),
});

// Request schemas
const createCourseSchema = z.object({
  code: z.string(),
  title: z.string(),
  description: z.string().optional(),
  credits: z.number().optional(),
  typicalDurationWeeks: z.number().optional(),
  tags: z.array(z.string()).optional(),
  lecturerIds: z.array(z.string()).optional(),
});

const updateCourseSchema = z.object({
  code: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  credits: z.number().optional(),
  typicalDurationWeeks: z.number().optional(),
});

const listCoursesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  tagIds: z.string().optional(),
  includeArchived: z.string().optional(),
});

const addLecturerSchema = z.object({
  userId: z.string(),
  isPrimary: z.boolean().optional(),
});

const addTagSchema = z.object({
  tagId: z.number(),
});

const createTagSchema = z.object({
  name: z.string(),
  color: z.string().optional(),
});

const copyCourseSchema = z.object({
  newCode: z.string(),
});

export const registerCoursePaths = (registry: OpenAPIRegistry) => {
  // Create course
  registry.registerPath({
    method: 'post',
    path: '/courses',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Create a new course',
    description: 'Create a new course. Requires teacher or admin role.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createCourseSchema,
            example: courseExamples.createRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Course created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(courseSchema),
            example: {
              statusCode: 201,
              message: 'Course created successfully',
              data: courseExamples.courseResponse,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // List courses
  registry.registerPath({
    method: 'get',
    path: '/courses',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'List all courses',
    description: 'Get a paginated list of courses with optional filters.',
    request: {
      query: listCoursesQuerySchema,
    },
    responses: {
      200: {
        description: 'Courses retrieved successfully',
        content: {
          'application/json': {
            schema: withPaginatedResponse(courseSchema),
            example: {
              statusCode: 200,
              message: 'Courses retrieved successfully',
              data: courseExamples.courseListResponse,
              meta: {
                page: 1,
                limit: 20,
                total: 6,
                totalPages: 1,
              },
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get course by ID
  registry.registerPath({
    method: 'get',
    path: '/courses/{id}',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Get course by ID',
    description: 'Get detailed information about a specific course.',
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: 'Course retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(courseSchema),
            example: {
              statusCode: 200,
              message: 'Course retrieved successfully',
              data: courseExamples.courseResponse,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update course
  registry.registerPath({
    method: 'patch',
    path: '/courses/{id}',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Update course',
    description: 'Update course information. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: updateCourseSchema,
            example: courseExamples.updateRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Course updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(courseSchema),
            example: {
              statusCode: 200,
              message: 'Course updated successfully',
              data: {
                ...courseExamples.courseResponse,
                ...courseExamples.updateRequest,
              },
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete course
  registry.registerPath({
    method: 'delete',
    path: '/courses/{id}',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Delete course',
    description:
      'Delete a course. Requires admin role. Cannot delete courses with active instances.',
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      204: {
        description: 'Course deleted successfully',
      },
      ...commonResponses,
    },
  });

  // Archive course
  registry.registerPath({
    method: 'post',
    path: '/courses/{id}/archive',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Archive course',
    description: 'Archive a course. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: 'Course archived successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(courseSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Unarchive course
  registry.registerPath({
    method: 'post',
    path: '/courses/{id}/unarchive',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Unarchive course',
    description: 'Unarchive a course. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: 'Course unarchived successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(courseSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Copy course
  registry.registerPath({
    method: 'post',
    path: '/courses/{id}/copy',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Copy course',
    description:
      'Create a copy of an existing course with a new code. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: copyCourseSchema,
            example: courseExamples.copyRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Course copied successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(courseSchema),
            example: {
              statusCode: 201,
              message: 'Course copied successfully',
              data: {
                ...courseExamples.courseResponse,
                id: '550e8400-e29b-41d4-a716-446655440099',
                code: courseExamples.copyRequest.newCode,
              },
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get course statistics
  registry.registerPath({
    method: 'get',
    path: '/courses/{id}/stats',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Get course statistics',
    description: 'Get statistics for a course. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: 'Course statistics retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(
              z.object({
                courseId: z.string(),
                code: z.string(),
                title: z.string(),
                totalInstances: z.number(),
                totalSyllabusItems: z.number(),
                totalAssignments: z.number(),
                totalResources: z.number(),
                tags: z.array(z.string()),
                lecturers: z.number(),
                primaryLecturer: z
                  .object({
                    id: z.string(),
                    email: z.string(),
                    firstName: z.string(),
                    lastName: z.string(),
                  })
                  .nullable(),
              })
            ),
            example: {
              statusCode: 201,
              message: 'Course statistics retrieved successfully',
              data: courseExamples.statsResponse,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Add lecturer to course
  registry.registerPath({
    method: 'post',
    path: '/courses/{id}/lecturers',
    tags: ['Courses', 'Lecturers'],
    security: [{ bearerAuth: [] }],
    summary: 'Add lecturer to course',
    description: 'Add a lecturer to a course. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: addLecturerSchema,
            example: courseExamples.addLecturerRequest,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Lecturer added successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(lecturerSchema),
            example: {
              statusCode: 201,
              message: 'Lecturer added successfully',
              data: courseExamples.lecturerResponse,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Remove lecturer from course
  registry.registerPath({
    method: 'delete',
    path: '/courses/{id}/lecturers/{userId}',
    tags: ['Courses', 'Lecturers'],
    security: [{ bearerAuth: [] }],
    summary: 'Remove lecturer from course',
    description: 'Remove a lecturer from a course. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
        userId: z.string(),
      }),
    },
    responses: {
      204: {
        description: 'Lecturer removed successfully',
      },
      ...commonResponses,
    },
  });

  // Get course lecturers
  registry.registerPath({
    method: 'get',
    path: '/courses/{id}/lecturers',
    tags: ['Courses', 'Lecturers'],
    security: [{ bearerAuth: [] }],
    summary: 'Get course lecturers',
    description: 'Get all lecturers for a course.',
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    responses: {
      200: {
        description: 'Lecturers retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(lecturerSchema)),
            example: {
              statusCode: 201,
              message: 'Lecturers retrieved successfully',
              data: [courseExamples.lecturerResponse],
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Add tag to course
  registry.registerPath({
    method: 'post',
    path: '/courses/{id}/tags',
    tags: ['Courses', 'Tags'],
    security: [{ bearerAuth: [] }],
    summary: 'Add tag to course',
    description: 'Add a tag to a course. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: addTagSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Tag added successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(courseTagSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Remove tag from course
  registry.registerPath({
    method: 'delete',
    path: '/courses/{id}/tags/{tagId}',
    tags: ['Courses', 'Tags'],
    security: [{ bearerAuth: [] }],
    summary: 'Remove tag from course',
    description: 'Remove a tag from a course. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string(),
        tagId: z.string(),
      }),
    },
    responses: {
      204: {
        description: 'Tag removed successfully',
      },
      ...commonResponses,
    },
  });

  // Get all tags
  registry.registerPath({
    method: 'get',
    path: '/courses/tags',
    tags: ['Courses', 'Tags'],
    security: [{ bearerAuth: [] }],
    summary: 'Get all tags',
    description: 'Get all available course tags.',
    request: {
      query: z.object({
        limit: z.string().optional(),
        popular: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: 'Tags retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(tagSchema)),
            example: {
              statusCode: 201,
              message: 'Tags retrieved successfully',
              data: courseExamples.tagListResponse,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Create tag
  registry.registerPath({
    method: 'post',
    path: '/courses/tags',
    tags: ['Courses', 'Tags'],
    security: [{ bearerAuth: [] }],
    summary: 'Create tag',
    description: 'Create a new course tag. Requires teacher or admin role.',
    request: {
      body: {
        content: {
          'application/json': {
            schema: createTagSchema,
            example: courseExamples.createTagRequest,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Tag created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(tagSchema),
            example: {
              statusCode: 201,
              message: 'Tag created successfully',
              data: { id: 9, ...courseExamples.createTagRequest },
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Search courses
  registry.registerPath({
    method: 'get',
    path: '/courses/search',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Search courses',
    description: 'Search for courses by title, code, or description.',
    request: {
      query: z.object({
        q: z.string(),
        limit: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: 'Search results retrieved successfully',
        content: {
          'application/json': {
            schema: withPaginatedResponse(courseSchema),
            example: {
              statusCode: 201,
              message: 'Search results retrieved successfully',
              data: courseExamples.courseListResponse,
              meta: {
                page: 1,
                limit: 20,
                total: 3,
                totalPages: 1,
              },
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get my created courses
  registry.registerPath({
    method: 'get',
    path: '/courses/my/created',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Get my created courses',
    description: 'Get all courses created by the authenticated user.',
    responses: {
      200: {
        description: 'Courses retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(courseSchema)),
            example: {
              statusCode: 200,
              message: 'Courses retrieved successfully',
              data: courseExamples.courseListResponse,
            },
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get my teaching courses
  registry.registerPath({
    method: 'get',
    path: '/courses/my/teaching',
    tags: ['Courses'],
    security: [{ bearerAuth: [] }],
    summary: 'Get my teaching courses',
    description: 'Get all courses where the authenticated user is a lecturer.',
    responses: {
      200: {
        description: 'Courses retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(courseSchema)),
            example: {
              statusCode: 200,
              message: 'Courses retrieved successfully',
              data: courseExamples.courseListResponse,
            },
          },
        },
      },
      ...commonResponses,
    },
  });
};
