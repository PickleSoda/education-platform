import { z } from 'zod';

// ============================================================================
// ASSIGNMENT TEMPLATE VALIDATION SCHEMAS
// ============================================================================

export const assignmentTypeEnum = z.enum([
  'homework',
  'quiz',
  'midterm',
  'final',
  'project',
  'participation',
]);

export const gradingModeEnum = z.enum(['points', 'pass_fail']);

export const gradingCriteriaSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  maxPoints: z.number().min(0).max(1000),
  sortOrder: z.number().int().min(0).optional(),
});

export const createAssignmentTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional().nullable(),
    assignmentType: assignmentTypeEnum,
    gradingMode: gradingModeEnum,
    maxPoints: z.number().min(0).max(1000).optional().nullable(),
    weightPercentage: z.number().min(0).max(100).optional().nullable(),
    defaultDurationDays: z.number().int().min(1).max(365).optional().nullable(),
    instructions: z.string().max(10000).optional().nullable(),
    attachments: z.any().optional(),
    syllabusItemId: z.string().uuid().optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
    gradingCriteria: z.array(gradingCriteriaSchema).optional(),
  }),
  params: z.object({
    courseId: z.string().uuid(),
  }),
});

export const updateAssignmentTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    assignmentType: assignmentTypeEnum.optional(),
    gradingMode: gradingModeEnum.optional(),
    maxPoints: z.number().min(0).max(1000).optional().nullable(),
    weightPercentage: z.number().min(0).max(100).optional().nullable(),
    defaultDurationDays: z.number().int().min(1).max(365).optional().nullable(),
    instructions: z.string().max(10000).optional().nullable(),
    attachments: z.any().optional(),
    syllabusItemId: z.string().uuid().optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getAssignmentTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listAssignmentTemplatesSchema = z.object({
  params: z.object({
    courseId: z.string().uuid(),
  }),
  query: z.object({
    assignmentType: assignmentTypeEnum.optional(),
    syllabusItemId: z.string().uuid().optional(),
  }),
});

export const deleteAssignmentTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const reorderAssignmentTemplatesSchema = z.object({
  body: z.object({
    templateOrder: z.array(z.string().uuid()).min(1),
  }),
  params: z.object({
    courseId: z.string().uuid(),
  }),
});

export const copyAssignmentTemplateSchema = z.object({
  body: z.object({
    targetCourseId: z.string().uuid().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ============================================================================
// GRADING CRITERIA VALIDATION SCHEMAS
// ============================================================================

export const addGradingCriteriaSchema = z.object({
  body: gradingCriteriaSchema,
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateGradingCriteriaSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    maxPoints: z.number().min(0).max(1000).optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
    criteriaId: z.string().uuid(),
  }),
});

export const deleteGradingCriteriaSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    criteriaId: z.string().uuid(),
  }),
});

export const reorderGradingCriteriaSchema = z.object({
  body: z.object({
    criteriaOrder: z.array(z.string().uuid()).min(1),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const validateGradingCriteriaSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CreateAssignmentTemplateInput = z.infer<typeof createAssignmentTemplateSchema>;
export type UpdateAssignmentTemplateInput = z.infer<typeof updateAssignmentTemplateSchema>;
export type ListAssignmentTemplatesInput = z.infer<typeof listAssignmentTemplatesSchema>;
export type AddGradingCriteriaInput = z.infer<typeof addGradingCriteriaSchema>;
export type UpdateGradingCriteriaInput = z.infer<typeof updateGradingCriteriaSchema>;
