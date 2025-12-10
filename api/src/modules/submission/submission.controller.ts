import httpStatus from 'http-status';

import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';
import type { ApiResponse, PaginatedResponse, ExtendedUser } from '@/types/response';

import { submissionService } from './submission.service';
import type {
  SubmissionWithRelations,
  StudentGradebook,
  SubmissionStats,
} from './submission.types';
import {
  saveSubmissionSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
  gradePassFailSchema,
  getSubmissionSchema,
  listSubmissionsSchema,
  getGradebookSchema,
  getSubmissionStatsSchema,
  updateSubmissionSchema,
} from './submission.validation';

// ============================================================================
// SUBMISSION CONTROLLERS
// ============================================================================

/**
 * Save submission draft
 * POST /submissions/assignments/:assignmentId/draft
 */
export const saveSubmission = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params, body } = await zParse(saveSubmissionSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const submission = await submissionService.saveSubmissionDraft(
      params.assignmentId,
      userId,
      body
    );

    return {
      statusCode: httpStatus.CREATED,
      message: 'Submission draft saved successfully',
      data: submission,
    };
  }
);

/**
 * Submit an assignment
 * POST /submissions/assignments/:assignmentId/submit
 */
export const submitAssignment = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params } = await zParse(submitAssignmentSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const submission = await submissionService.submitAssignmentService(params.assignmentId, userId);

    return {
      statusCode: httpStatus.OK,
      message: 'Assignment submitted successfully',
      data: submission,
    };
  }
);

/**
 * Get submission by ID
 * GET /submissions/:submissionId
 */
export const getSubmission = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params } = await zParse(getSubmissionSchema, req);

    const submission = await submissionService.getSubmissionById(params.submissionId);

    return {
      statusCode: httpStatus.OK,
      message: 'Submission retrieved successfully',
      data: submission,
    };
  }
);

/**
 * List submissions with filters
 * GET /submissions
 */
export const listSubmissions = catchAsync(
  async (req): Promise<PaginatedResponse<SubmissionWithRelations>> => {
    const { query } = await zParse(listSubmissionsSchema, req);

    const result = await submissionService.listSubmissions(query);

    return {
      statusCode: httpStatus.OK,
      message: 'Submissions retrieved successfully',
      data: (result as any).data,
      meta: (result as any).pagination,
    };
  }
);

/**
 * Grade submission with criteria
 * POST /submissions/:submissionId/grade
 */
export const gradeSubmission = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params, body } = await zParse(gradeSubmissionSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const submission = await submissionService.gradeSubmissionService(
      params.submissionId,
      userId,
      body
    );

    return {
      statusCode: httpStatus.OK,
      message: 'Submission graded successfully',
      data: submission,
    };
  }
);

/**
 * Grade submission as pass/fail
 * POST /submissions/:submissionId/grade-pass-fail
 */
export const gradePassFail = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params, body } = await zParse(gradePassFailSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const submission = await submissionService.gradePassFailService(
      params.submissionId,
      userId,
      body
    );

    return {
      statusCode: httpStatus.OK,
      message: 'Submission graded successfully',
      data: submission,
    };
  }
);

/**
 * Get student gradebook
 * GET /submissions/instances/:instanceId/students/:studentId/gradebook
 */
export const getGradebook = catchAsync(async (req): Promise<ApiResponse<StudentGradebook>> => {
  const { params } = await zParse(getGradebookSchema, req);

  const gradebook = await submissionService.getStudentGradebookService(
    params.instanceId,
    params.studentId
  );

  return {
    statusCode: httpStatus.OK,
    message: 'Gradebook retrieved successfully',
    data: gradebook,
  };
});

/**
 * Get submission statistics
 * GET /submissions/assignments/:assignmentId/stats
 */
export const getSubmissionStats = catchAsync(async (req): Promise<ApiResponse<SubmissionStats>> => {
  const { params } = await zParse(getSubmissionStatsSchema, req);

  const stats = await submissionService.getSubmissionStatsService(params.assignmentId);

  return {
    statusCode: httpStatus.OK,
    message: 'Submission statistics retrieved successfully',
    data: stats,
  };
});

/**
 * Update submission draft
 * PATCH /submissions/:submissionId
 */
export const updateSubmission = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params, body } = await zParse(updateSubmissionSchema, req);

    const submission = await submissionService.updateSubmissionDraft(params.submissionId, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Submission updated successfully',
      data: submission,
    };
  }
);

export const submissionController = {
  saveSubmission,
  submitAssignment,
  getSubmission,
  listSubmissions,
  gradeSubmission,
  gradePassFail,
  getGradebook,
  getSubmissionStats,
  updateSubmission,
};

export default submissionController;
