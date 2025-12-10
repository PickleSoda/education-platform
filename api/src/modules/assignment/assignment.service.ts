import httpStatus from 'http-status';
import ApiError from '@/shared/utils/api-error';
import { courseRepository } from '@/modules/course/course.repository';
import { assignmentRepository } from './assignment.repository';
import type {
  AssignmentTemplateCreateInput,
  AssignmentTemplateUpdateInput,
  AssignmentTemplateWithCriteria,
  GradingCriteriaInput,
  GradingCriteriaUpdateInput,
  GradingStructure,
  AssignmentStats,
  CriteriaValidation,
} from './assignment.types';

// ============================================================================
// SERVICE FUNCTIONS
// ============================================================================

/**
 * Create a new assignment template
 */
export const createAssignmentTemplate = async (
  data: AssignmentTemplateCreateInput
): Promise<AssignmentTemplateWithCriteria> => {
  // Verify course exists
  const course = await courseRepository.findById(data.courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  // Validate grading criteria sum if provided
  if (data.gradingCriteria && data.maxPoints) {
    const criteriaSum = data.gradingCriteria.reduce((sum, c) => sum + c.maxPoints, 0);
    if (criteriaSum !== data.maxPoints) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Grading criteria sum (${criteriaSum}) must equal maxPoints (${data.maxPoints})`
      );
    }
  }

  return assignmentRepository.create(data);
};

/**
 * Get assignment template by ID
 */
export const getAssignmentTemplate = async (
  templateId: string
): Promise<AssignmentTemplateWithCriteria> => {
  const template = await assignmentRepository.getWithCriteria(templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
  }
  return template;
};

/**
 * List assignment templates for a course
 */
export const listAssignmentTemplates = async (
  courseId: string,
  filters: { assignmentType?: string; syllabusItemId?: string } = {}
): Promise<AssignmentTemplateWithCriteria[]> => {
  // Verify course exists
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return assignmentRepository.list(courseId, filters);
};

/**
 * Get grading structure for a course
 */
export const getGradingStructure = async (courseId: string): Promise<GradingStructure> => {
  // Verify course exists
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return assignmentRepository.getGradingStructure(courseId);
};

/**
 * Update assignment template
 */
export const updateAssignmentTemplate = async (
  templateId: string,
  data: AssignmentTemplateUpdateInput
): Promise<AssignmentTemplateWithCriteria> => {
  // Verify template exists
  const existing = await assignmentRepository.findById(templateId);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
  }

  // Warn if template has been published
  const isPublished = await assignmentRepository.isPublished(templateId);
  if (isPublished && (data.maxPoints || data.gradingMode)) {
    // In production, you might want to prevent this or handle it differently
    console.warn(`Template ${templateId} has been published. Changes may affect existing grades.`);
  }

  return assignmentRepository.update(templateId, data);
};

/**
 * Delete assignment template
 */
export const deleteAssignmentTemplate = async (templateId: string): Promise<void> => {
  // Verify template exists
  const existing = await assignmentRepository.findById(templateId);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
  }

  // Check if template has been published
  const isPublished = await assignmentRepository.isPublished(templateId);
  if (isPublished) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete template that has been published to course instances'
    );
  }

  await assignmentRepository.delete(templateId);
};

/**
 * Reorder assignment templates
 */
export const reorderAssignmentTemplates = async (
  courseId: string,
  templateOrder: string[]
): Promise<void> => {
  // Verify course exists
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  await assignmentRepository.reorder(courseId, templateOrder);
};

/**
 * Copy assignment template (within same course or to another course)
 */
export const copyAssignmentTemplate = async (
  templateId: string,
  targetCourseId?: string,
  title?: string
): Promise<AssignmentTemplateWithCriteria> => {
  const source = await assignmentRepository.getWithCriteria(templateId);
  if (!source) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
  }

  const courseId = targetCourseId || source.courseId;

  // Verify target course exists
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Target course not found');
  }

  const copyData: AssignmentTemplateCreateInput = {
    courseId,
    title: title || (targetCourseId ? source.title : `${source.title} (Copy)`),
    description: source.description,
    assignmentType: source.assignmentType,
    gradingMode: source.gradingMode,
    maxPoints: source.maxPoints ? Number(source.maxPoints) : null,
    weightPercentage: source.weightPercentage ? Number(source.weightPercentage) : null,
    defaultDurationDays: source.defaultDurationDays,
    instructions: source.instructions,
    attachments: source.attachments,
    gradingCriteria: source.gradingCriteria?.map((c) => ({
      name: c.name,
      description: c.description,
      maxPoints: Number(c.maxPoints),
      sortOrder: c.sortOrder,
    })),
  };

  return assignmentRepository.create(copyData);
};

/**
 * Validate grading criteria (ensure sum equals maxPoints)
 */
export const validateGradingCriteria = async (templateId: string): Promise<CriteriaValidation> => {
  const template = await assignmentRepository.getWithCriteria(templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
  }

  const criteriaSum =
    template.gradingCriteria?.reduce((sum, c) => sum + Number(c.maxPoints), 0) || 0;

  const maxPoints = Number(template.maxPoints) || 0;

  return {
    isValid: criteriaSum === maxPoints,
    criteriaSum,
    maxPoints,
  };
};

// ============================================================================
// GRADING CRITERIA SERVICE FUNCTIONS
// ============================================================================

/**
 * Add grading criteria to template
 */
export const addGradingCriteria = async (
  templateId: string,
  data: GradingCriteriaInput
): Promise<any> => {
  // Verify template exists
  const template = await assignmentRepository.findById(templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
  }

  return assignmentRepository.addCriteria(templateId, data);
};

/**
 * Update grading criteria
 */
export const updateGradingCriteria = async (
  criteriaId: string,
  data: GradingCriteriaUpdateInput
): Promise<any> => {
  try {
    return await assignmentRepository.updateCriteria(criteriaId, data);
  } catch (error: any) {
    if (error.message === 'Grading criteria not found') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Grading criteria not found');
    }
    throw error;
  }
};

/**
 * Delete grading criteria
 */
export const deleteGradingCriteria = async (criteriaId: string): Promise<void> => {
  await assignmentRepository.deleteCriteria(criteriaId);
};

/**
 * Reorder grading criteria
 */
export const reorderGradingCriteria = async (
  templateId: string,
  criteriaOrder: string[]
): Promise<void> => {
  // Verify template exists
  const template = await assignmentRepository.findById(templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
  }

  await assignmentRepository.reorderCriteria(templateId, criteriaOrder);
};

/**
 * Get template usage statistics
 */
export const getTemplateStats = async (templateId: string): Promise<AssignmentStats> => {
  const template = await assignmentRepository.getWithCriteria(templateId);
  if (!template) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
  }

  const usageCount = await assignmentRepository.getUsageCount(templateId);

  // For now, return basic stats. Can be expanded later.
  return {
    templateId,
    title: template.title,
    usageCount,
    publishedCount: 0, // Would need to query instance assignments to get actual count
    instances: [], // Would need additional query to get instance details
  };
};

// ============================================================================
// SERVICE EXPORT
// ============================================================================

export const assignmentService = {
  // Template operations
  create: createAssignmentTemplate,
  get: getAssignmentTemplate,
  list: listAssignmentTemplates,
  getGradingStructure,
  update: updateAssignmentTemplate,
  delete: deleteAssignmentTemplate,
  reorder: reorderAssignmentTemplates,
  copy: copyAssignmentTemplate,
  validateCriteria: validateGradingCriteria,
  getStats: getTemplateStats,

  // Criteria operations
  addCriteria: addGradingCriteria,
  updateCriteria: updateGradingCriteria,
  deleteCriteria: deleteGradingCriteria,
  reorderCriteria: reorderGradingCriteria,
};
