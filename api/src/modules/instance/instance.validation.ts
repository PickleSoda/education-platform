import { z } from 'zod';

// ============================================================================
// INSTANCE VALIDATION SCHEMAS
// ============================================================================

export const instanceStatusEnum = z.enum(['draft', 'scheduled', 'active', 'completed', 'archived']);

export const createInstanceSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    semester: z.string().min(1).max(50),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    enrollmentLimit: z.number().int().min(1).max(1000).optional().nullable(),
    enrollmentOpen: z.boolean().optional(),
    lecturerIds: z.array(z.string().uuid()).optional(),
  }),
});

export const updateInstanceSchema = z.object({
  body: z.object({
    semester: z.string().min(1).max(50).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    enrollmentLimit: z.number().int().min(1).max(1000).optional().nullable(),
    enrollmentOpen: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getInstanceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listInstancesSchema = z.object({
  query: z.object({
    courseId: z.string().uuid().optional(),
    status: instanceStatusEnum.optional(),
    semester: z.string().optional(),
    lecturerId: z.string().uuid().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const updateInstanceStatusSchema = z.object({
  body: z.object({
    status: instanceStatusEnum,
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const toggleEnrollmentSchema = z.object({
  body: z.object({
    isOpen: z.boolean(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const deleteInstanceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const cloneInstanceSchema = z.object({
  body: z.object({
    semester: z.string().min(1).max(50),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ============================================================================
// PUBLISHED ASSIGNMENT VALIDATION SCHEMAS
// ============================================================================

export const publishAssignmentSchema = z.object({
  body: z.object({
    templateId: z.string().uuid(),
    publishAt: z.string().datetime().optional().nullable(),
    deadline: z.string().datetime(),
    lateDeadline: z.string().datetime().optional().nullable(),
    latePenaltyPercent: z.number().min(0).max(100).optional().nullable(),
    autoPublish: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getInstanceAssignmentsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    status: z.enum(['draft', 'scheduled', 'published', 'closed']).optional(),
  }),
});

export const getPublishedAssignmentSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    assignmentId: z.string().uuid(),
  }),
});

export const togglePublishStatusSchema = z.object({
  body: z.object({
    publish: z.boolean(),
  }),
  params: z.object({
    id: z.string().uuid(),
    assignmentId: z.string().uuid(),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateInstanceInput = z.infer<typeof createInstanceSchema>;
export type UpdateInstanceInput = z.infer<typeof updateInstanceSchema>;
export type ListInstancesInput = z.infer<typeof listInstancesSchema>;
export type PublishAssignmentInput = z.infer<typeof publishAssignmentSchema>;
