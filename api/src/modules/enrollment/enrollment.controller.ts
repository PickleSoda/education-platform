import httpStatus from 'http-status';

import ApiError from '@/shared/utils/api-error';
import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';
import type { ApiResponse, ExtendedUser } from '@/types/response';

import { enrollmentService } from './enrollment.service';
import type {
  EnrollmentWithRelations,
  EnrollmentWithStudent,
  EnrollmentWithInstance,
  EnrollmentStats,
  GradeCalculationResult,
  BulkEnrollResult,
} from './enrollment.types';
import {
  enrollSchema,
  getEnrollmentSchema,
  listInstanceEnrollmentsSchema,
  listStudentEnrollmentsSchema,
  updateEnrollmentStatusSchema,
  dropStudentSchema,
  deleteEnrollmentSchema,
  calculateFinalGradeSchema,
  calculateAllGradesSchema,
  bulkEnrollSchema,
  enrollmentStatsSchema,
  exportRosterSchema,
  checkEnrollmentSchema,
} from './enrollment.validation';

// ============================================================================
// ENROLLMENT CONTROLLERS
// ============================================================================

/**
 * Enroll student in a course instance
 * POST /instances/:instanceId/enroll
 */
export const enroll = catchAsync(async (req): Promise<ApiResponse<EnrollmentWithRelations>> => {
  const { params, body } = await zParse(enrollSchema, req);
  const userId = (req.user as ExtendedUser)!.id;

  // If studentId is provided (teacher enrolling student), use it; otherwise self-enroll
  const studentId = body?.studentId || userId;

  const enrollment = await enrollmentService.enroll(params.instanceId, studentId);

  return {
    statusCode: httpStatus.CREATED,
    message: 'Enrolled successfully',
    data: enrollment,
  };
});

/**
 * Get enrollment by ID
 * GET /enrollments/:id
 */
export const getEnrollment = catchAsync(
  async (req): Promise<ApiResponse<EnrollmentWithRelations>> => {
    const { params } = await zParse(getEnrollmentSchema, req);

    const enrollment = await enrollmentService.getById(params.id);

    if (!enrollment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
    }

    return {
      statusCode: httpStatus.OK,
      message: 'Enrollment retrieved successfully',
      data: enrollment,
    };
  }
);

/**
 * Get all enrollments for a course instance (roster)
 * GET /instances/:instanceId/enrollments
 */
export const getInstanceEnrollments = catchAsync(
  async (req): Promise<ApiResponse<EnrollmentWithStudent[]>> => {
    const { params, query } = await zParse(listInstanceEnrollmentsSchema, req);

    const enrollments = await enrollmentService.getInstanceEnrollments(
      params.instanceId,
      query.status
    );

    return {
      statusCode: httpStatus.OK,
      message: 'Enrollments retrieved successfully',
      data: enrollments,
    };
  }
);

/**
 * Get current user's enrollments
 * GET /enrollments/me
 */
export const getMyEnrollments = catchAsync(
  async (req): Promise<ApiResponse<EnrollmentWithInstance[]>> => {
    const { query } = await zParse(listStudentEnrollmentsSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const enrollments = await enrollmentService.getStudentEnrollments(userId, query.status);

    return {
      statusCode: httpStatus.OK,
      message: 'Enrollments retrieved successfully',
      data: enrollments,
    };
  }
);

/**
 * Update enrollment status
 * PATCH /enrollments/:id/status
 */
export const updateEnrollmentStatus = catchAsync(
  async (req): Promise<ApiResponse<EnrollmentWithRelations>> => {
    const { params, body } = await zParse(updateEnrollmentStatusSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const enrollment = await enrollmentService.updateStatus(params.id, body.status, userId);

    return {
      statusCode: httpStatus.OK,
      message: 'Enrollment status updated successfully',
      data: enrollment,
    };
  }
);

/**
 * Drop a student from a course instance
 * POST /instances/:instanceId/students/:studentId/drop
 */
export const dropStudent = catchAsync(
  async (req): Promise<ApiResponse<EnrollmentWithRelations>> => {
    const { params } = await zParse(dropStudentSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const enrollment = await enrollmentService.drop(params.instanceId, params.studentId, userId);

    return {
      statusCode: httpStatus.OK,
      message: 'Student dropped successfully',
      data: enrollment,
    };
  }
);

/**
 * Delete enrollment (hard delete)
 * DELETE /enrollments/:id
 */
export const deleteEnrollment = catchAsync(async (req): Promise<ApiResponse<null>> => {
  const { params } = await zParse(deleteEnrollmentSchema, req);

  await enrollmentService.delete(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'Enrollment deleted successfully',
    data: null,
  };
});

/**
 * Calculate final grade for a student (or self)
 * POST /instances/:instanceId/calculate-grade
 */
export const calculateFinalGrade = catchAsync(
  async (req): Promise<ApiResponse<GradeCalculationResult>> => {
    const { params, body } = await zParse(calculateFinalGradeSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    // If studentId is provided (teacher calculating), use it; otherwise self-calculate
    const studentId = body?.studentId || userId;

    const result = await enrollmentService.calculateFinalGrade(params.instanceId, studentId);

    return {
      statusCode: httpStatus.OK,
      message: 'Final grade calculated successfully',
      data: result,
    };
  }
);

/**
 * Calculate final grades for all students in an instance
 * POST /instances/:instanceId/calculate-all-grades
 */
export const calculateAllGrades = catchAsync(
  async (req): Promise<ApiResponse<{ processed: number; results: GradeCalculationResult[] }>> => {
    const { params } = await zParse(calculateAllGradesSchema, req);

    const result = await enrollmentService.calculateAllFinalGrades(params.instanceId);

    return {
      statusCode: httpStatus.OK,
      message: `Calculated grades for ${result.processed} students`,
      data: result,
    };
  }
);

/**
 * Bulk enroll students
 * POST /instances/:instanceId/bulk-enroll
 */
export const bulkEnroll = catchAsync(async (req): Promise<ApiResponse<BulkEnrollResult>> => {
  const { params, body } = await zParse(bulkEnrollSchema, req);

  const result = await enrollmentService.bulkEnroll(params.instanceId, body.studentIds);

  return {
    statusCode: httpStatus.OK,
    message: `Enrolled ${result.successful.length} students, ${result.failed.length} failed`,
    data: result,
  };
});

/**
 * Get enrollment statistics for an instance
 * GET /instances/:instanceId/enrollment-stats
 */
export const getEnrollmentStats = catchAsync(async (req): Promise<ApiResponse<EnrollmentStats>> => {
  const { params } = await zParse(enrollmentStatsSchema, req);

  const stats = await enrollmentService.getStats(params.instanceId);

  return {
    statusCode: httpStatus.OK,
    message: 'Enrollment statistics retrieved successfully',
    data: stats,
  };
});

/**
 * Export roster as CSV
 * GET /instances/:instanceId/roster/export
 */
export const exportRoster = catchAsync(
  async (req): Promise<ApiResponse<{ headers: string[]; rows: string[][] }>> => {
    const { params } = await zParse(exportRosterSchema, req);

    const roster = await enrollmentService.exportRoster(params.instanceId);

    return {
      statusCode: httpStatus.OK,
      message: 'Roster exported successfully',
      data: roster,
    };
  }
);

/**
 * Check if student is enrolled
 * GET /instances/:instanceId/students/:studentId/enrolled
 */
export const checkEnrollment = catchAsync(
  async (req): Promise<ApiResponse<{ isEnrolled: boolean }>> => {
    const { params } = await zParse(checkEnrollmentSchema, req);

    const isEnrolled = await enrollmentService.isEnrolled(params.instanceId, params.studentId);

    return {
      statusCode: httpStatus.OK,
      message: 'Enrollment status checked',
      data: { isEnrolled },
    };
  }
);

// ============================================================================
// CONTROLLER EXPORT
// ============================================================================

export const enrollmentController = {
  enroll,
  getEnrollment,
  getInstanceEnrollments,
  getMyEnrollments,
  updateEnrollmentStatus,
  dropStudent,
  deleteEnrollment,
  calculateFinalGrade,
  calculateAllGrades,
  bulkEnroll,
  getEnrollmentStats,
  exportRoster,
  checkEnrollment,
};
