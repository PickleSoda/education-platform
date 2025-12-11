import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse } from '@/openapi/common.schemas';

extendZodWithOpenApi(z);

// Response schemas
const syllabusItemRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  weekNumber: z.number().nullable(),
});

const resourceTemplateSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).nullable(),
  url: z.string().nullable(),
  filePath: z.string().nullable(),
  syllabusItemId: z.string().nullable(),
  sortOrder: z.number().nullable(),
  createdAt: z.string(),
  syllabusItem: syllabusItemRefSchema.nullable().optional(),
});

const templateRefSchema = z.object({
  id: z.string(),
  title: z.string(),
});

const publishedResourceSchema = z.object({
  id: z.string(),
  instanceId: z.string(),
  templateId: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).nullable(),
  url: z.string().nullable(),
  filePath: z.string().nullable(),
  isPublished: z.boolean(),
  publishedAt: z.string().nullable(),
  sortOrder: z.number().nullable(),
  createdAt: z.string(),
  template: templateRefSchema.nullable().optional(),
});

const syllabusItemSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  weekNumber: z.number().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  learningObjectives: z.array(z.string()),
  sortOrder: z.number(),
  createdAt: z.string(),
  _count: z
    .object({
      assignmentTemplates: z.number(),
      resourceTemplates: z.number(),
    })
    .optional(),
});

// Request schemas
const createResourceTemplateSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
  url: z.string().optional(),
  filePath: z.string().optional(),
  syllabusItemId: z.string().optional(),
  sortOrder: z.number().optional(),
});

const updateResourceTemplateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
  url: z.string().optional(),
  filePath: z.string().optional(),
  syllabusItemId: z.string().optional(),
  sortOrder: z.number().optional(),
});

const createPublishedResourceSchema = z.object({
  templateId: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
  url: z.string().optional(),
  filePath: z.string().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const updatePublishedResourceSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
  url: z.string().optional(),
  filePath: z.string().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

const createSyllabusItemSchema = z.object({
  weekNumber: z.number().optional(),
  title: z.string(),
  description: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
});

const updateSyllabusItemSchema = z.object({
  weekNumber: z.number().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
});

// Examples
const resourceTemplateExample = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  courseId: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Lecture 1: Introduction Slides',
  description: 'Introductory slides covering course overview and setup',
  resourceType: 'slide',
  url: 'https://example.com/lecture1.pdf',
  filePath: null,
  syllabusItemId: '550e8400-e29b-41d4-a716-446655440020',
  sortOrder: 1,
  createdAt: '2024-01-15T10:00:00.000Z',
  syllabusItem: {
    id: '550e8400-e29b-41d4-a716-446655440020',
    title: 'Week 1: Introduction',
    weekNumber: 1,
  },
};

const publishedResourceExample = {
  id: '550e8400-e29b-41d4-a716-446655440011',
  instanceId: '550e8400-e29b-41d4-a716-446655440001',
  templateId: '550e8400-e29b-41d4-a716-446655440010',
  title: 'Lecture 1: Introduction Slides',
  description: 'Introductory slides covering course overview and setup',
  resourceType: 'slide',
  url: 'https://example.com/lecture1.pdf',
  filePath: null,
  isPublished: true,
  publishedAt: '2024-01-15T12:00:00.000Z',
  sortOrder: 1,
  createdAt: '2024-01-15T10:00:00.000Z',
  template: {
    id: '550e8400-e29b-41d4-a716-446655440010',
    title: 'Lecture 1: Introduction Slides',
  },
};

const syllabusItemExample = {
  id: '550e8400-e29b-41d4-a716-446655440020',
  courseId: '550e8400-e29b-41d4-a716-446655440000',
  weekNumber: 1,
  title: 'Week 1: Introduction to Computer Science',
  description: 'Course overview, setup, and introduction to programming concepts',
  learningObjectives: [
    'Understand the course structure and requirements',
    'Set up development environment',
    'Write first program',
  ],
  sortOrder: 1,
  createdAt: '2024-01-10T10:00:00.000Z',
  _count: {
    assignmentTemplates: 2,
    resourceTemplates: 3,
  },
};

/**
 * Register resource endpoints in OpenAPI documentation
 */
export function registerResourcePaths(registry: OpenAPIRegistry) {
  // ==========================================================================
  // RESOURCE TEMPLATE ROUTES
  // ==========================================================================

  registry.registerPath({
    method: 'post',
    path: '/v1/courses/{courseId}/resources',
    description: 'Create a new resource template for a course',
    summary: 'Create resource template',
    tags: ['Resources'],
    request: {
      params: z.object({
        courseId: z.string().openapi({ param: { name: 'courseId', in: 'path' } }),
      }),
      body: {
        content: {
          'application/json': {
            schema: createResourceTemplateSchema,
            example: {
              title: 'Lecture 1: Introduction Slides',
              description: 'Introductory slides covering course overview',
              resourceType: 'slide',
              url: 'https://example.com/lecture1.pdf',
              syllabusItemId: '550e8400-e29b-41d4-a716-446655440020',
              sortOrder: 1,
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Resource template created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(resourceTemplateSchema),
            example: {
              success: true,
              message: 'Resource template created successfully',
              data: resourceTemplateExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'post',
    path: '/v1/courses/{courseId}/resources/upload',
    description: 'Upload a file and create resource template',
    summary: 'Upload resource file',
    tags: ['Resources'],
    request: {
      params: z.object({
        courseId: z.string().openapi({ param: { name: 'courseId', in: 'path' } }),
      }),
      body: {
        content: {
          'multipart/form-data': {
            schema: z.object({
              file: z.string(),
              title: z.string(),
              description: z.string().optional(),
              resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']),
              syllabusItemId: z.string().optional(),
              sortOrder: z.number().optional(),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: 'File uploaded and resource template created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(resourceTemplateSchema),
            example: {
              success: true,
              message: 'File uploaded and resource template created successfully',
              data: {
                ...resourceTemplateExample,
                filePath: '/uploads/resources/550e8400-e29b-41d4-a716-446655440010.pdf',
              },
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'get',
    path: '/v1/courses/{courseId}/resources',
    description: 'Get all resource templates for a course',
    summary: 'List resource templates',
    tags: ['Resources'],
    request: {
      params: z.object({
        courseId: z.string().openapi({ param: { name: 'courseId', in: 'path' } }),
      }),
      query: z.object({
        resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
        syllabusItemId: z.string().optional(),
      }),
    },
    responses: {
      200: {
        description: 'Resource templates retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(resourceTemplateSchema)),
            example: {
              success: true,
              message: 'Resource templates retrieved successfully',
              data: [resourceTemplateExample],
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'get',
    path: '/v1/resources/{id}',
    description: 'Get a specific resource template by ID',
    summary: 'Get resource template',
    tags: ['Resources'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
    },
    responses: {
      200: {
        description: 'Resource template retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(resourceTemplateSchema),
            example: {
              success: true,
              message: 'Resource template retrieved successfully',
              data: resourceTemplateExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'patch',
    path: '/v1/resources/{id}',
    description: 'Update a resource template',
    summary: 'Update resource template',
    tags: ['Resources'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
      body: {
        content: {
          'application/json': {
            schema: updateResourceTemplateSchema,
            example: {
              title: 'Updated Lecture Title',
              description: 'Updated description',
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Resource template updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(resourceTemplateSchema),
            example: {
              success: true,
              message: 'Resource template updated successfully',
              data: resourceTemplateExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'delete',
    path: '/v1/resources/{id}',
    description: 'Delete a resource template',
    summary: 'Delete resource template',
    tags: ['Resources'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
    },
    responses: {
      200: {
        description: 'Resource template deleted successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ id: z.string() })),
            example: {
              success: true,
              message: 'Resource template deleted successfully',
              data: { id: '550e8400-e29b-41d4-a716-446655440010' },
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  // ==========================================================================
  // PUBLISHED RESOURCE ROUTES
  // ==========================================================================

  registry.registerPath({
    method: 'post',
    path: '/v1/instances/{instanceId}/resources',
    description: 'Publish a resource to a course instance',
    summary: 'Publish resource',
    tags: ['Resources'],
    request: {
      params: z.object({
        instanceId: z.string().openapi({ param: { name: 'instanceId', in: 'path' } }),
      }),
      body: {
        content: {
          'application/json': {
            schema: createPublishedResourceSchema,
            example: {
              templateId: '550e8400-e29b-41d4-a716-446655440010',
              isPublished: true,
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Resource published successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(publishedResourceSchema),
            example: {
              success: true,
              message: 'Resource published successfully',
              data: publishedResourceExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'get',
    path: '/v1/instances/{instanceId}/resources',
    description: 'Get all published resources for a course instance',
    summary: 'List published resources',
    tags: ['Resources'],
    request: {
      params: z.object({
        instanceId: z.string().openapi({ param: { name: 'instanceId', in: 'path' } }),
      }),
      query: z.object({
        resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
        isPublished: z.boolean().optional(),
      }),
    },
    responses: {
      200: {
        description: 'Published resources retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(publishedResourceSchema)),
            example: {
              success: true,
              message: 'Published resources retrieved successfully',
              data: [publishedResourceExample],
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'get',
    path: '/v1/instances/resources/{id}',
    description: 'Get a specific published resource by ID',
    summary: 'Get published resource',
    tags: ['Resources'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
    },
    responses: {
      200: {
        description: 'Published resource retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(publishedResourceSchema),
            example: {
              success: true,
              message: 'Published resource retrieved successfully',
              data: publishedResourceExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'patch',
    path: '/v1/instances/resources/{id}',
    description: 'Update a published resource',
    summary: 'Update published resource',
    tags: ['Resources'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
      body: {
        content: {
          'application/json': {
            schema: updatePublishedResourceSchema,
            example: {
              isPublished: true,
              title: 'Updated Resource Title',
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Published resource updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(publishedResourceSchema),
            example: {
              success: true,
              message: 'Published resource updated successfully',
              data: publishedResourceExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'delete',
    path: '/v1/instances/resources/{id}',
    description: 'Delete a published resource',
    summary: 'Delete published resource',
    tags: ['Resources'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
    },
    responses: {
      200: {
        description: 'Published resource deleted successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ id: z.string() })),
            example: {
              success: true,
              message: 'Published resource deleted successfully',
              data: { id: '550e8400-e29b-41d4-a716-446655440011' },
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  // ==========================================================================
  // SYLLABUS ITEM ROUTES
  // ==========================================================================

  registry.registerPath({
    method: 'post',
    path: '/v1/courses/{courseId}/syllabus',
    description: 'Create a new syllabus item for a course',
    summary: 'Create syllabus item',
    tags: ['Syllabus'],
    request: {
      params: z.object({
        courseId: z.string().openapi({ param: { name: 'courseId', in: 'path' } }),
      }),
      body: {
        content: {
          'application/json': {
            schema: createSyllabusItemSchema,
            example: {
              weekNumber: 1,
              title: 'Week 1: Introduction to Computer Science',
              description: 'Course overview and setup',
              learningObjectives: [
                'Understand course structure',
                'Set up development environment',
                'Write first program',
              ],
              sortOrder: 1,
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Syllabus item created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(syllabusItemSchema),
            example: {
              success: true,
              message: 'Syllabus item created successfully',
              data: syllabusItemExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'get',
    path: '/v1/courses/{courseId}/syllabus',
    description: 'Get all syllabus items for a course',
    summary: 'List syllabus items',
    tags: ['Syllabus'],
    request: {
      params: z.object({
        courseId: z.string().openapi({ param: { name: 'courseId', in: 'path' } }),
      }),
      query: z.object({
        weekNumber: z.number().optional(),
      }),
    },
    responses: {
      200: {
        description: 'Syllabus items retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(syllabusItemSchema)),
            example: {
              success: true,
              message: 'Syllabus items retrieved successfully',
              data: [syllabusItemExample],
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'get',
    path: '/v1/syllabus/{id}',
    description: 'Get a specific syllabus item by ID',
    summary: 'Get syllabus item',
    tags: ['Syllabus'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
    },
    responses: {
      200: {
        description: 'Syllabus item retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(syllabusItemSchema),
            example: {
              success: true,
              message: 'Syllabus item retrieved successfully',
              data: syllabusItemExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'patch',
    path: '/v1/syllabus/{id}',
    description: 'Update a syllabus item',
    summary: 'Update syllabus item',
    tags: ['Syllabus'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
      body: {
        content: {
          'application/json': {
            schema: updateSyllabusItemSchema,
            example: {
              title: 'Updated Week 1 Title',
              description: 'Updated description',
              learningObjectives: ['Updated objective 1', 'Updated objective 2'],
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Syllabus item updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(syllabusItemSchema),
            example: {
              success: true,
              message: 'Syllabus item updated successfully',
              data: syllabusItemExample,
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });

  registry.registerPath({
    method: 'delete',
    path: '/v1/syllabus/{id}',
    description: 'Delete a syllabus item',
    summary: 'Delete syllabus item',
    tags: ['Syllabus'],
    request: {
      params: z.object({
        id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
      }),
    },
    responses: {
      200: {
        description: 'Syllabus item deleted successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ id: z.string() })),
            example: {
              success: true,
              message: 'Syllabus item deleted successfully',
              data: { id: '550e8400-e29b-41d4-a716-446655440020' },
            },
          },
        },
      },
      ...commonResponses,
    },
    security: [{ bearerAuth: [] }],
  });
}
