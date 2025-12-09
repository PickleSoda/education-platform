import { z } from 'zod';

// ============================================================================
// COURSE SCHEMAS
// ============================================================================

export const createCourseSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(2, 'Course code must be at least 2 characters')
      .max(20, 'Course code must not exceed 20 characters')
      .regex(
        /^[A-Z0-9-]+$/,
        'Course code must contain only uppercase letters, numbers, and hyphens'
      ),
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title must not exceed 255 characters'),
    description: z.string().max(5000, 'Description must not exceed 5000 characters').optional(),
    credits: z.coerce
      .number()
      .positive('Credits must be a positive number')
      .max(99.9, 'Credits must not exceed 99.9')
      .optional(),
    typicalDurationWeeks: z
      .number()
      .int('Duration must be a whole number')
      .positive('Duration must be positive')
      .max(52, 'Duration must not exceed 52 weeks')
      .optional(),
    tagIds: z
      .array(z.coerce.number().int().positive())
      .max(10, 'Maximum 10 tags allowed')
      .optional(),
    lecturerIds: z
      .array(z.string().uuid('Invalid lecturer ID'))
      .max(20, 'Maximum 20 lecturers')
      .optional(),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
  body: z.object({
    code: z
      .string()
      .min(2)
      .max(20)
      .regex(/^[A-Z0-9-]+$/)
      .optional(),
    title: z.string().min(3).max(255).optional(),
    description: z.string().max(5000).optional().nullable(),
    credits: z.coerce.number().positive().max(99.9).optional().nullable(),
    typicalDurationWeeks: z.number().int().positive().max(52).optional().nullable(),
    isArchived: z.boolean().optional(),
  }),
});

export const getCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
  query: z
    .object({
      includeTemplates: z
        .string()
        .transform((val) => val === 'true')
        .optional(),
    })
    .optional(),
});

export const listCoursesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().max(255).optional(),
    tagIds: z
      .string()
      .transform((val) => val.split(',').map(Number))
      .optional(),
    includeArchived: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
    sortBy: z.enum(['title', 'code', 'createdAt', 'updatedAt']).default('title'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
  }),
});

export const deleteCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
});

export const archiveCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
});

export const unarchiveCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
});

export const copyCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
  body: z.object({
    newCode: z
      .string()
      .min(2, 'Course code must be at least 2 characters')
      .max(20, 'Course code must not exceed 20 characters')
      .regex(
        /^[A-Z0-9-]+$/,
        'Course code must contain only uppercase letters, numbers, and hyphens'
      ),
  }),
});

export const getCourseStatsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
});

export const searchCoursesSchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required').max(255),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

// ============================================================================
// LECTURER SCHEMAS
// ============================================================================

export const addLecturerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
  body: z.object({
    userId: z.string().uuid('Invalid user ID'),
    isPrimary: z.boolean().default(false),
  }),
});

export const removeLecturerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
});

export const updateLecturerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
    userId: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    isPrimary: z.boolean(),
  }),
});

// ============================================================================
// TAG SCHEMAS
// ============================================================================

export const addTagSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
  body: z.object({
    tagId: z.number().int().positive('Invalid tag ID'),
  }),
});

export const removeTagSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
    tagId: z.coerce.number().int().positive('Invalid tag ID'),
  }),
});

export const createTagSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Tag name is required')
      .max(50, 'Tag name must not exceed 50 characters'),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
      .optional(),
  }),
});

export const listTagsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().positive().max(100).default(50),
    popular: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),
  }),
});

export const getLecturersSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid course ID'),
  }),
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type CreateCourseInput = z.infer<typeof createCourseSchema>['body'];
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>['body'];
export type GetCourseParams = z.infer<typeof getCourseSchema>['params'];
export type ListCoursesQuery = z.infer<typeof listCoursesSchema>['query'];
export type AddLecturerInput = z.infer<typeof addLecturerSchema>['body'];
export type UpdateLecturerInput = z.infer<typeof updateLecturerSchema>['body'];
export type AddTagInput = z.infer<typeof addTagSchema>['body'];
export type CreateTagInput = z.infer<typeof createTagSchema>['body'];
