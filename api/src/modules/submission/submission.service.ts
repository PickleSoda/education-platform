import { submissionRepository } from './submission.repository';
import { ListSubmissionsQuery } from './submission.validation';
import { PaginationOptions } from '@/shared/repositories/base.repository';
import { assignmentRepository } from '../assignment/assignment.repository';
import ApiError from '@/shared/utils/api-error';
import httpStatus from 'http-status';
import { notificationQueries } from '@/shared/repositories/queries';

/**
 * Auto-grade form submission
 */
const autoGradeFormSubmission = async (submission: any, assignmentTemplate: any) => {
  // Find form attachment in assignment template
  const formAttachment = assignmentTemplate.attachments?.find((att: any) => att.type === 'form');

  if (!formAttachment || !submission.formSubmission) {
    return { totalPoints: 0, questionGrades: [] };
  }

  const questionGrades: any[] = [];
  let totalPoints = 0;

  for (const question of formAttachment.questions) {
    const studentAnswer = submission.formSubmission.answers.find(
      (ans: any) => ans.questionId === question.id
    );

    let pointsAwarded = 0;
    let isCorrect = false;

    if (studentAnswer && question.correctAnswer) {
      if (question.type === 'multiple_choice') {
        // Single correct answer
        isCorrect =
          studentAnswer.answer.length === 1 &&
          question.correctAnswer.includes(studentAnswer.answer[0]);
      } else if (question.type === 'checkbox') {
        // Multiple correct answers - must match exactly
        const studentAnswers = [...studentAnswer.answer].sort();
        const correctAnswers = [...question.correctAnswer].sort();
        isCorrect = JSON.stringify(studentAnswers) === JSON.stringify(correctAnswers);
      } else if (question.type === 'short_answer' || question.type === 'paragraph') {
        // Text questions - basic keyword matching (can be improved)
        const studentText = studentAnswer.answer[0]?.toLowerCase() || '';
        const correctText = question.correctAnswer[0]?.toLowerCase() || '';

        // Simple contains check - in production, you might want more sophisticated matching
        isCorrect =
          studentText.includes(correctText) ||
          correctText
            .split(' ')
            .some((keyword: string) => keyword.length > 2 && studentText.includes(keyword));
      }

      if (isCorrect) {
        pointsAwarded = question.points;
      }
    }

    questionGrades.push({
      questionId: question.id,
      pointsAwarded,
      maxPoints: question.points,
      isCorrect,
    });

    totalPoints += pointsAwarded;
  }

  return { totalPoints, questionGrades };
};

/**
 * Save submission draft
 */
export const saveSubmissionDraft = async (
  assignmentId: string,
  studentId: string,
  data: { content?: string; attachments?: any; formSubmission?: any }
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

// ============================================================================
// SUBMISSION SERVICE
// ============================================================================

/**
 * Submit an assignment
 */
export const submitAssignmentService = async (assignmentId: string, studentId: string) => {
  const submission = await submissionRepository.submitAssignment(assignmentId, studentId);

  // Get assignment template for auto-grading
  const assignment = await submissionRepository.getSubmissionById(submission.id);
  if (assignment?.publishedAssignment?.template) {
    const template = assignment.publishedAssignment.template;

    // Auto-grade if there's a form submission
    if (submission.formSubmission && template.attachments) {
      const autoGradeResults = await autoGradeFormSubmission(submission, template);

      if (autoGradeResults.totalPoints > 0) {
        // Update submission with auto-graded results
        await submissionRepository.updateSubmission(submission.id, {
          finalPoints: autoGradeResults.totalPoints,
          status: 'graded',
          feedback: `Auto-graded: ${autoGradeResults.totalPoints} points earned from quiz/survey responses.`,
          gradedAt: new Date().toISOString(),
        });

        // Create notification
        try {
          await notificationQueries.createNotification({
            userId: studentId,
            type: 'assignment_graded',
            title: 'Assignment Auto-Graded',
            message: `Your quiz submission has been automatically graded: ${autoGradeResults.totalPoints} points`,
            data: {
              submissionId: submission.id,
              assignmentId,
              finalPoints: autoGradeResults.totalPoints,
              autoGraded: true,
            },
          });
        } catch (error) {
          console.error('Failed to send auto-grading notification:', error);
        }
      }
    }
  }

  return submission;
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
