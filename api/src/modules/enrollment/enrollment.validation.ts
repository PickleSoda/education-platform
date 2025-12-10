import { z } from 'zod';

// ============================================================================
// ENROLLMENT SCHEMAS
// ============================================================================

// Define enrollment status enum for Zod
const enrollmentStatusEnum = z.enum(['enrolled', 'dropped', 'completed', 'failed']);

export const enrollSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
  }),
  body: z
    .object({
      studentId: z.string().uuid('Invalid student ID').optional(),
    })
    .optional(),
});

export const getEnrollmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid enrollment ID'),
  }),
});

export const listInstanceEnrollmentsSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
  }),
  query: z.object({
    status: enrollmentStatusEnum.optional(),
  }),
});

export const listStudentEnrollmentsSchema = z.object({
  query: z.object({
    status: enrollmentStatusEnum.optional(),
  }),
});

export const listEnrollmentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    instanceId: z.string().uuid('Invalid instance ID').optional(),
    studentId: z.string().uuid('Invalid student ID').optional(),
    status: enrollmentStatusEnum.optional(),
    sortBy: z.enum(['enrolledAt', 'completedAt', 'finalGrade']).default('enrolledAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const updateEnrollmentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid enrollment ID'),
  }),
  body: z.object({
    status: enrollmentStatusEnum,
  }),
});

export const dropStudentSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
    studentId: z.string().uuid('Invalid student ID'),
  }),
});

export const deleteEnrollmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid enrollment ID'),
  }),
});

export const calculateFinalGradeSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
  }),
  body: z
    .object({
      studentId: z.string().uuid('Invalid student ID').optional(),
    })
    .optional(),
});

export const calculateAllGradesSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
  }),
});

export const bulkEnrollSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
  }),
  body: z.object({
    studentIds: z
      .array(z.string().uuid('Invalid student ID'))
      .min(1, 'At least one student ID is required')
      .max(100, 'Maximum 100 students per bulk enrollment'),
  }),
});

export const enrollmentStatsSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
  }),
});

export const exportRosterSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
  }),
});

export const checkEnrollmentSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
    studentId: z.string().uuid('Invalid student ID'),
  }),
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type EnrollInput = z.infer<typeof enrollSchema>;
export type GetEnrollmentInput = z.infer<typeof getEnrollmentSchema>;
export type ListInstanceEnrollmentsInput = z.infer<typeof listInstanceEnrollmentsSchema>;
export type ListStudentEnrollmentsInput = z.infer<typeof listStudentEnrollmentsSchema>;
export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsSchema>['query'];
export type UpdateEnrollmentStatusInput = z.infer<typeof updateEnrollmentStatusSchema>;
export type DropStudentInput = z.infer<typeof dropStudentSchema>;
export type DeleteEnrollmentInput = z.infer<typeof deleteEnrollmentSchema>;
export type CalculateFinalGradeInput = z.infer<typeof calculateFinalGradeSchema>;
export type CalculateAllGradesInput = z.infer<typeof calculateAllGradesSchema>;
export type BulkEnrollInput = z.infer<typeof bulkEnrollSchema>;
export type EnrollmentStatsInput = z.infer<typeof enrollmentStatsSchema>;
export type ExportRosterInput = z.infer<typeof exportRosterSchema>;
export type CheckEnrollmentInput = z.infer<typeof checkEnrollmentSchema>;
