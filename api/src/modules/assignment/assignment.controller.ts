import httpStatus from 'http-status';

import ApiError from '@/shared/utils/api-error';
import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';
import type { ApiResponse } from '@/types/response';

import { assignmentService } from './assignment.service';
import type {
  AssignmentTemplateWithCriteria,
  GradingStructure,
  GradingCriteria,
  AssignmentStats,
  CriteriaValidation,
} from './assignment.types';
import {
  createAssignmentTemplateSchema,
  getAssignmentTemplateSchema,
  listAssignmentTemplatesSchema,
  updateAssignmentTemplateSchema,
  deleteAssignmentTemplateSchema,
  copyAssignmentTemplateSchema,
  reorderAssignmentTemplatesSchema,
  validateGradingCriteriaSchema,
  addGradingCriteriaSchema,
  updateGradingCriteriaSchema,
  deleteGradingCriteriaSchema,
  reorderGradingCriteriaSchema,
} from './assignment.validation';

// ============================================================================
// ASSIGNMENT TEMPLATE CONTROLLERS
// ============================================================================

/**
 * Create a new assignment template
 * POST /courses/:courseId/assignments
 */
export const createAssignmentTemplate = catchAsync(
  async (req): Promise<ApiResponse<AssignmentTemplateWithCriteria>> => {
    const { params, body } = await zParse(createAssignmentTemplateSchema, req);

    const template = await assignmentService.create({ ...body, courseId: params.courseId });

    return {
      statusCode: httpStatus.CREATED,
      message: 'Assignment template created successfully',
      data: template,
    };
  }
);

/**
 * Get assignment template by ID
 * GET /assignments/:id
 */
export const getAssignmentTemplate = catchAsync(
  async (req): Promise<ApiResponse<AssignmentTemplateWithCriteria>> => {
    const { params } = await zParse(getAssignmentTemplateSchema, req);

    const template = await assignmentService.get(params.id);

    if (!template) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assignment template not found');
    }

    return {
      statusCode: httpStatus.OK,
      message: 'Assignment template retrieved successfully',
      data: template,
    };
  }
);

/**
 * List assignment templates for a course
 * GET /courses/:courseId/assignments
 */
export const listAssignmentTemplates = catchAsync(
  async (req): Promise<ApiResponse<AssignmentTemplateWithCriteria[]>> => {
    const { params, query } = await zParse(listAssignmentTemplatesSchema, req);

    const templates = await assignmentService.list(params.courseId, {
      assignmentType: query?.assignmentType,
      syllabusItemId: query?.syllabusItemId,
    });

    return {
      statusCode: httpStatus.OK,
      message: 'Assignment templates retrieved successfully',
      data: templates,
    };
  }
);

/**
 * Get grading structure for a course
 * GET /courses/:courseId/grading-structure
 */
export const getGradingStructure = catchAsync(
  async (req): Promise<ApiResponse<GradingStructure>> => {
    const { courseId } = req.params;

    const structure = await assignmentService.getGradingStructure(courseId);

    return {
      statusCode: httpStatus.OK,
      message: 'Grading structure retrieved successfully',
      data: structure,
    };
  }
);

/**
 * Update assignment template
 * PATCH /assignments/:id
 */
export const updateAssignmentTemplate = catchAsync(
  async (req): Promise<ApiResponse<AssignmentTemplateWithCriteria>> => {
    const { params, body } = await zParse(updateAssignmentTemplateSchema, req);

    const template = await assignmentService.update(params.id, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Assignment template updated successfully',
      data: template,
    };
  }
);

/**
 * Delete assignment template
 * DELETE /assignments/:id
 */
export const deleteAssignmentTemplate = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(deleteAssignmentTemplateSchema, req);

  await assignmentService.delete(params.id);

  return {
    statusCode: httpStatus.NO_CONTENT,
    message: 'Assignment template deleted successfully',
  };
});

/**
 * Reorder assignment templates
 * PUT /courses/:courseId/assignments/reorder
 */
export const reorderAssignmentTemplates = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params, body } = await zParse(reorderAssignmentTemplatesSchema, req);

  await assignmentService.reorder(params.courseId, body.templateOrder);

  return {
    statusCode: httpStatus.OK,
    message: 'Assignment templates reordered successfully',
  };
});

/**
 * Copy assignment template
 * POST /assignments/:id/copy
 */
export const copyAssignmentTemplate = catchAsync(
  async (req): Promise<ApiResponse<AssignmentTemplateWithCriteria>> => {
    const { params, body } = await zParse(copyAssignmentTemplateSchema, req);

    const template = await assignmentService.copy(params.id, body?.targetCourseId);

    return {
      statusCode: httpStatus.CREATED,
      message: 'Assignment template copied successfully',
      data: template,
    };
  }
);

/**
 * Validate grading criteria
 * GET /assignments/:id/validate
 */
export const validateGradingCriteria = catchAsync(
  async (req): Promise<ApiResponse<CriteriaValidation>> => {
    const { params } = await zParse(validateGradingCriteriaSchema, req);

    const validation = await assignmentService.validateCriteria(params.id);

    return {
      statusCode: httpStatus.OK,
      message: 'Validation completed',
      data: validation,
    };
  }
);

/**
 * Get template statistics
 * GET /assignments/:id/stats
 */
export const getTemplateStats = catchAsync(async (req): Promise<ApiResponse<AssignmentStats>> => {
  const { id } = req.params;

  const stats = await assignmentService.getStats(id);

  return {
    statusCode: httpStatus.OK,
    message: 'Template statistics retrieved successfully',
    data: stats,
  };
});

// ============================================================================
// GRADING CRITERIA CONTROLLERS
// ============================================================================

/**
 * Add grading criteria to template
 * POST /assignments/:id/criteria
 */
export const addGradingCriteria = catchAsync(async (req): Promise<ApiResponse<GradingCriteria>> => {
  const { params, body } = await zParse(addGradingCriteriaSchema, req);

  const criteria = await assignmentService.addCriteria(params.id, body);

  return {
    statusCode: httpStatus.CREATED,
    message: 'Grading criteria added successfully',
    data: criteria,
  };
});

/**
 * Update grading criteria
 * PATCH /assignments/:id/criteria/:criteriaId
 */
export const updateGradingCriteria = catchAsync(
  async (req): Promise<ApiResponse<GradingCriteria>> => {
    const { params, body } = await zParse(updateGradingCriteriaSchema, req);

    const criteria = await assignmentService.updateCriteria(params.criteriaId, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Grading criteria updated successfully',
      data: criteria,
    };
  }
);

/**
 * Delete grading criteria
 * DELETE /assignments/:id/criteria/:criteriaId
 */
export const deleteGradingCriteria = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(deleteGradingCriteriaSchema, req);

  await assignmentService.deleteCriteria(params.criteriaId);

  return {
    statusCode: httpStatus.NO_CONTENT,
    message: 'Grading criteria deleted successfully',
  };
});

/**
 * Reorder grading criteria
 * PUT /assignments/:id/criteria/reorder
 */
export const reorderGradingCriteria = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params, body } = await zParse(reorderGradingCriteriaSchema, req);

  await assignmentService.reorderCriteria(params.id, body.criteriaOrder);

  return {
    statusCode: httpStatus.OK,
    message: 'Grading criteria reordered successfully',
  };
});

// ============================================================================
// CONTROLLER EXPORT
// ============================================================================

export const assignmentController = {
  // Template CRUD
  create: createAssignmentTemplate,
  getById: getAssignmentTemplate,
  list: listAssignmentTemplates,
  getGradingStructure,
  update: updateAssignmentTemplate,
  delete: deleteAssignmentTemplate,
  reorder: reorderAssignmentTemplates,
  copy: copyAssignmentTemplate,
  validate: validateGradingCriteria,
  getStats: getTemplateStats,

  // Grading criteria
  addCriteria: addGradingCriteria,
  updateCriteria: updateGradingCriteria,
  deleteCriteria: deleteGradingCriteria,
  reorderCriteria: reorderGradingCriteria,
};
