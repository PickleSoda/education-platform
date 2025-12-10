import { z } from 'zod';

// ============================================================================
// SUBMISSION SCHEMAS
// ============================================================================

export const saveSubmissionSchema = z.object({
  params: z.object({
    assignmentId: z.string().uuid('Invalid assignment ID'),
  }),
  body: z.object({
    content: z.string().max(10000, 'Content must not exceed 10000 characters').optional(),
    attachments: z.any().optional(),
  }),
});

export const updateSubmissionSchema = z.object({
  params: z.object({
    submissionId: z.string().uuid('Invalid submission ID'),
  }),
  body: z.object({
    content: z.string().max(10000, 'Content must not exceed 10000 characters').optional(),
    attachments: z.any().optional(),
  }),
});

export const submitAssignmentSchema = z.object({
  params: z.object({
    assignmentId: z.string().uuid('Invalid assignment ID'),
  }),
});

export const gradeSubmissionSchema = z.object({
  params: z.object({
    submissionId: z.string().uuid('Invalid submission ID'),
  }),
  body: z.object({
    criteriaGrades: z
      .array(
        z.object({
          criteriaId: z.string().uuid('Invalid criteria ID'),
          pointsAwarded: z.number().nonnegative('Points must be non-negative'),
          feedback: z.string().max(2000).optional(),
        })
      )
      .min(1, 'At least one criterion grade is required'),
    overallFeedback: z.string().max(5000, 'Feedback must not exceed 5000 characters').optional(),
  }),
});

export const gradePassFailSchema = z.object({
  params: z.object({
    submissionId: z.string().uuid('Invalid submission ID'),
  }),
  body: z.object({
    isPassed: z.boolean(),
    feedback: z.string().max(5000, 'Feedback must not exceed 5000 characters').optional(),
  }),
});

export const getSubmissionSchema = z.object({
  params: z.object({
    submissionId: z.string().uuid('Invalid submission ID'),
  }),
});

export const listSubmissionsSchema = z.object({
  query: z.object({
    assignmentId: z.string().uuid().optional(),
    studentId: z.string().uuid().optional(),
    status: z.enum(['draft', 'submitted', 'late', 'graded', 'returned']).optional(),
    graded: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['createdAt', 'submittedAt', 'gradedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const getGradebookSchema = z.object({
  params: z.object({
    instanceId: z.string().uuid('Invalid instance ID'),
    studentId: z.string().uuid('Invalid student ID'),
  }),
});

export const getSubmissionStatsSchema = z.object({
  params: z.object({
    assignmentId: z.string().uuid('Invalid assignment ID'),
  }),
});

// Type exports for validation
export type SaveSubmissionInput = z.infer<typeof saveSubmissionSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type GradePassFailInput = z.infer<typeof gradePassFailSchema>;
export type GetSubmissionInput = z.infer<typeof getSubmissionSchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsSchema>['query'];
export type GetGradebookInput = z.infer<typeof getGradebookSchema>;
export type GetSubmissionStatsInput = z.infer<typeof getSubmissionStatsSchema>;
