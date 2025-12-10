import { submissionRepository } from './submission.repository';
import { ListSubmissionsQuery } from './submission.validation';
import { PaginationOptions } from '@/shared/repositories/base.repository';
import ApiError from '@/shared/utils/api-error';
import httpStatus from 'http-status';
import { notificationQueries } from '@/shared/repositories/queries';

// ============================================================================
// SUBMISSION SERVICE
// ============================================================================

/**
 * Save submission draft
 */
export const saveSubmissionDraft = async (
  assignmentId: string,
  studentId: string,
  data: { content?: string; attachments?: any }
) => {
  try {
    return await submissionRepository.saveSubmission({
      assignmentId,
      studentId,
      ...data,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Assignment not found') {
      throw new ApiError(httpStatus.NOT_FOUND, 'Assignment not found');
    }
    throw error;
  }
};

/**
 * Submit an assignment
 */
export const submitAssignmentService = async (assignmentId: string, studentId: string) => {
  return submissionRepository.submitAssignment(assignmentId, studentId);
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (submissionId: string) => {
  const submission = await submissionRepository.getSubmissionById(submissionId);
  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Submission not found');
  }
  return submission;
};

/**
 * List submissions with filters
 */
export const listSubmissions = async (query: ListSubmissionsQuery) => {
  const { page, limit, sortBy, sortOrder, assignmentId, studentId, status, graded } = query;

  const filters = {
    assignmentId,
    studentId,
    status,
    graded,
  };

  const options: PaginationOptions = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  return submissionRepository.listSubmissions(filters, options);
};

/**
 * Grade submission with criteria
 */
export const gradeSubmissionService = async (
  submissionId: string,
  graderId: string,
  data: {
    criteriaGrades: Array<{
      criteriaId: string;
      pointsAwarded: number;
      feedback?: string;
    }>;
    overallFeedback?: string;
  }
) => {
  const submission = await submissionRepository.getSubmissionById(submissionId);
  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Submission not found');
  }

  const graded = await submissionRepository.gradeSubmission({
    submissionId,
    graderId,
    ...data,
  });

  // Create notification
  try {
    await notificationQueries.createNotification({
      userId: submission.student?.id || '',
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your submission for "${submission.publishedAssignment?.title}" has been graded`,
      data: {
        submissionId,
        assignmentId: submission.publishedAssignment?.id,
        finalPoints: graded.finalPoints,
      },
    });
  } catch (error) {
    console.error('Failed to send grading notification:', error);
  }

  return graded;
};

/**
 * Grade submission as pass/fail
 */
export const gradePassFailService = async (
  submissionId: string,
  graderId: string,
  data: {
    isPassed: boolean;
    feedback?: string;
  }
) => {
  const submission = await submissionRepository.getSubmissionById(submissionId);
  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Submission not found');
  }

  const graded = await submissionRepository.gradePassFail({
    submissionId,
    graderId,
    ...data,
  });

  // Create notification
  try {
    await notificationQueries.createNotification({
      userId: submission.student?.id || '',
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your submission for "${submission.publishedAssignment?.title}" has been marked as ${data.isPassed ? 'complete' : 'incomplete'}`,
      data: {
        submissionId,
        isPassed: data.isPassed,
      },
    });
  } catch (error) {
    console.error('Failed to send grading notification:', error);
  }

  return graded;
};

/**
 * Get student gradebook
 */
export const getStudentGradebookService = async (instanceId: string, studentId: string) => {
  return submissionRepository.getStudentGradebook(instanceId, studentId);
};

/**
 * Get submission statistics
 */
export const getSubmissionStatsService = async (assignmentId: string) => {
  return submissionRepository.getSubmissionStats(assignmentId);
};

/**
 * Update submission draft
 */
export const updateSubmissionDraft = async (
  submissionId: string,
  data: { content?: string; attachments?: any }
) => {
  const submission = await submissionRepository.getSubmissionById(submissionId);
  if (!submission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Submission not found');
  }

  return submissionRepository.updateSubmission(submissionId, data);
};

export const submissionService = {
  saveSubmissionDraft,
  submitAssignmentService,
  getSubmissionById,
  listSubmissions,
  gradeSubmissionService,
  gradePassFailService,
  getStudentGradebookService,
  getSubmissionStatsService,
  updateSubmissionDraft,
};

export default submissionService;
