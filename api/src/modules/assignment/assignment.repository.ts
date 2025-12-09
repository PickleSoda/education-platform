import { Prisma, AssignmentTemplate, GradingCriteria } from '@prisma/client';
import prisma from '@/client';
import type {
  AssignmentTemplateCreateInput,
  AssignmentTemplateUpdateInput,
  AssignmentTemplateWithCriteria,
  GradingCriteriaInput,
  GradingCriteriaUpdateInput,
  GradingStructure,
} from './assignment.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform Prisma Decimal fields to numbers for JSON serialization
 */
const transformTemplate = (template: any): AssignmentTemplateWithCriteria => {
  if (!template) return template;
  return {
    ...template,
    maxPoints: template.maxPoints ? Number(template.maxPoints) : template.maxPoints,
    weightPercentage: template.weightPercentage
      ? Number(template.weightPercentage)
      : template.weightPercentage,
    gradingCriteria: template.gradingCriteria?.map((c: any) => ({
      ...c,
      maxPoints: c.maxPoints ? Number(c.maxPoints) : c.maxPoints,
    })),
  };
};

// ============================================================================
// REPOSITORY FUNCTIONS
// ============================================================================

/**
 * Create assignment template with grading criteria
 */
export const createAssignmentTemplate = async (
  data: AssignmentTemplateCreateInput
): Promise<AssignmentTemplateWithCriteria> => {
  // Get max sortOrder for the course
  const maxSort = await prisma.assignmentTemplate.aggregate({
    where: { courseId: data.courseId },
    _max: { sortOrder: true },
  });

  const result = await prisma.assignmentTemplate.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      assignmentType: data.assignmentType,
      gradingMode: data.gradingMode,
      maxPoints: data.maxPoints,
      weightPercentage: data.weightPercentage,
      defaultDurationDays: data.defaultDurationDays,
      instructions: data.instructions,
      attachments: data.attachments,
      syllabusItemId: data.syllabusItemId,
      sortOrder: data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
      gradingCriteria: data.gradingCriteria
        ? {
            create: data.gradingCriteria.map((c, index) => ({
              name: c.name,
              description: c.description,
              maxPoints: c.maxPoints,
              sortOrder: c.sortOrder ?? index,
            })),
          }
        : undefined,
    },
    include: {
      gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      syllabusItem: {
        select: { id: true, title: true, weekNumber: true },
      },
    },
  });

  return transformTemplate(result);
};

/**
 * Get assignment template by ID
 */
export const findAssignmentTemplateById = async (
  templateId: string
): Promise<AssignmentTemplate | null> => {
  return prisma.assignmentTemplate.findUnique({
    where: { id: templateId },
  });
};

/**
 * Get assignment template with grading criteria
 */
export const getAssignmentTemplateWithCriteria = async (
  templateId: string
): Promise<AssignmentTemplateWithCriteria | null> => {
  const result = await prisma.assignmentTemplate.findUnique({
    where: { id: templateId },
    include: {
      gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      syllabusItem: {
        select: { id: true, title: true, weekNumber: true },
      },
    },
  });

  return result ? transformTemplate(result) : null;
};

/**
 * Get all assignment templates for a course (grading structure)
 */
export const getGradingStructure = async (courseId: string): Promise<GradingStructure> => {
  const templates = await prisma.assignmentTemplate.findMany({
    where: { courseId },
    orderBy: { sortOrder: 'asc' },
    include: {
      gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      syllabusItem: {
        select: { id: true, title: true, weekNumber: true },
      },
    },
  });

  const transformed = templates.map(transformTemplate);

  const totalWeight = transformed.reduce((sum, t) => sum + (Number(t.weightPercentage) || 0), 0);
  const totalMaxPoints = transformed.reduce((sum, t) => sum + (Number(t.maxPoints) || 0), 0);

  return {
    templates: transformed,
    totalWeight,
    totalMaxPoints,
  };
};

/**
 * List assignment templates for a course
 */
export const listAssignmentTemplates = async (
  courseId: string,
  filters: { assignmentType?: string; syllabusItemId?: string } = {}
): Promise<AssignmentTemplateWithCriteria[]> => {
  const where: Prisma.AssignmentTemplateWhereInput = {
    courseId,
    ...(filters.assignmentType && { assignmentType: filters.assignmentType as any }),
    ...(filters.syllabusItemId && { syllabusItemId: filters.syllabusItemId }),
  };

  const results = await prisma.assignmentTemplate.findMany({
    where,
    orderBy: { sortOrder: 'asc' },
    include: {
      gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      syllabusItem: {
        select: { id: true, title: true, weekNumber: true },
      },
    },
  });

  return results.map(transformTemplate);
};

/**
 * Update assignment template
 */
export const updateAssignmentTemplate = async (
  templateId: string,
  data: AssignmentTemplateUpdateInput
): Promise<AssignmentTemplateWithCriteria> => {
  const result = await prisma.assignmentTemplate.update({
    where: { id: templateId },
    data,
    include: {
      gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      syllabusItem: {
        select: { id: true, title: true, weekNumber: true },
      },
    },
  });

  return transformTemplate(result);
};

/**
 * Delete assignment template
 */
export const deleteAssignmentTemplate = async (templateId: string): Promise<AssignmentTemplate> => {
  return prisma.assignmentTemplate.delete({
    where: { id: templateId },
  });
};

/**
 * Reorder assignment templates
 */
export const reorderAssignmentTemplates = async (
  courseId: string,
  templateOrder: string[]
): Promise<void> => {
  await prisma.$transaction(
    templateOrder.map((id, index) =>
      prisma.assignmentTemplate.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
};

// ============================================================================
// GRADING CRITERIA FUNCTIONS
// ============================================================================

/**
 * Add grading criteria to template
 */
export const addGradingCriteria = async (
  assignmentTemplateId: string,
  data: GradingCriteriaInput
): Promise<GradingCriteria> => {
  // Get max sortOrder for the template
  const maxSort = await prisma.gradingCriteria.aggregate({
    where: { assignmentTemplateId },
    _max: { sortOrder: true },
  });

  const result = await prisma.gradingCriteria.create({
    data: {
      name: data.name,
      description: data.description,
      maxPoints: data.maxPoints,
      sortOrder: data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
      assignmentTemplateId,
    },
  });

  return result;
};

/**
 * Update grading criteria
 */
export const updateGradingCriteria = async (
  criteriaId: string,
  data: GradingCriteriaUpdateInput
): Promise<GradingCriteria> => {
  const result = await prisma.gradingCriteria.update({
    where: { id: criteriaId },
    data,
  });

  return result;
};

/**
 * Delete grading criteria
 */
export const deleteGradingCriteria = async (criteriaId: string): Promise<GradingCriteria> => {
  return prisma.gradingCriteria.delete({
    where: { id: criteriaId },
  });
};

/**
 * Reorder grading criteria
 */
export const reorderGradingCriteria = async (
  templateId: string,
  criteriaOrder: string[]
): Promise<void> => {
  await prisma.$transaction(
    criteriaOrder.map((id, index) =>
      prisma.gradingCriteria.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
};

/**
 * Get template usage count (how many instances have published this template)
 */
export const getTemplateUsageCount = async (templateId: string): Promise<number> => {
  return prisma.publishedAssignment.count({
    where: { templateId },
  });
};

/**
 * Check if template has been published (used in any instance)
 */
export const isTemplatePublished = async (templateId: string): Promise<boolean> => {
  const count = await prisma.publishedAssignment.count({
    where: { templateId },
  });
  return count > 0;
};

// ============================================================================
// REPOSITORY EXPORT
// ============================================================================

export const assignmentRepository = {
  // Template CRUD
  create: createAssignmentTemplate,
  findById: findAssignmentTemplateById,
  getWithCriteria: getAssignmentTemplateWithCriteria,
  getGradingStructure,
  list: listAssignmentTemplates,
  update: updateAssignmentTemplate,
  delete: deleteAssignmentTemplate,
  reorder: reorderAssignmentTemplates,

  // Grading criteria
  addCriteria: addGradingCriteria,
  updateCriteria: updateGradingCriteria,
  deleteCriteria: deleteGradingCriteria,
  reorderCriteria: reorderGradingCriteria,

  // Usage tracking
  getUsageCount: getTemplateUsageCount,
  isPublished: isTemplatePublished,
};
