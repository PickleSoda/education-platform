import { z } from 'zod';

// ============================================================================
// RESOURCE TEMPLATE SCHEMAS
// ============================================================================

export const createResourceTemplateSchema = z.object({
  params: z.object({
    courseId: z.string().uuid(),
  }),
  body: z
    .object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
      url: z.string().url().optional(),
      filePath: z.string().optional(),
      syllabusItemId: z.string().uuid().optional(),
      sortOrder: z.number().int().min(0).optional(),
    })
    .refine((data) => data.url || data.filePath, {
      message: 'Either url or filePath must be provided',
    }),
});

export const getResourceTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listResourceTemplatesSchema = z.object({
  params: z.object({
    courseId: z.string().uuid(),
  }),
  query: z
    .object({
      resourceType: z.string().optional(),
      syllabusItemId: z.string().uuid().optional(),
    })
    .optional(),
});

export const updateResourceTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
    url: z.string().url().optional(),
    filePath: z.string().optional(),
    syllabusItemId: z.string().uuid().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const deleteResourceTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ============================================================================
// PUBLISHED RESOURCE SCHEMAS
// ============================================================================

export const createPublishedResourceSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid(),
  }),
  body: z
    .object({
      templateId: z.string().uuid().optional(),
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
      url: z.string().url().optional(),
      filePath: z.string().optional(),
      isPublished: z.boolean().optional().default(false),
      sortOrder: z.number().int().min(0).optional(),
    })
    .refine((data) => data.url || data.filePath, {
      message: 'Either url or filePath must be provided',
    }),
});

export const getPublishedResourceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listPublishedResourcesSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid(),
  }),
  query: z
    .object({
      isPublished: z
        .string()
        .transform((val) => val === 'true')
        .optional(),
      resourceType: z.string().optional(),
    })
    .optional(),
});

export const updatePublishedResourceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
    url: z.string().url().optional(),
    filePath: z.string().optional(),
    isPublished: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const deletePublishedResourceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ============================================================================
// SYLLABUS ITEM SCHEMAS
// ============================================================================

export const createSyllabusItemSchema = z.object({
  params: z.object({
    courseId: z.string().uuid(),
  }),
  body: z.object({
    weekNumber: z.number().int().min(1).max(52).optional(),
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    learningObjectives: z.array(z.string()).optional().default([]),
    sortOrder: z.number().int().min(0),
  }),
});

export const getSyllabusItemSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listSyllabusItemsSchema = z.object({
  params: z.object({
    courseId: z.string().uuid(),
  }),
});

export const updateSyllabusItemSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    weekNumber: z.number().int().min(1).max(52).optional(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    learningObjectives: z.array(z.string()).optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

export const deleteSyllabusItemSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const uploadResourceFileSchema = z.object({
  params: z.object({
    courseId: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    resourceType: z.enum(['document', 'video', 'link', 'slide', 'code', 'other']).optional(),
    syllabusItemId: z.string().uuid().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});
