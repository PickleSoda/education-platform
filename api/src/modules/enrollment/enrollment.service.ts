import httpStatus from 'http-status';

import { enrollmentRepository } from './enrollment.repository';
import { notificationRepository } from '@/modules/notification/notification.repository';
import ApiError from '@/shared/utils/api-error';
import type {
  EnrollmentWithRelations,
  EnrollmentWithStudent,
  EnrollmentWithInstance,
  EnrollmentStats,
  GradeCalculationResult,
  BulkEnrollResult,
  EnrollmentStatus,
} from './enrollment.types';

// ============================================================================
// ENROLLMENT SERVICE
// ============================================================================

/**
 * Enroll a student in a course instance
 */
export const enrollStudent = async (
  instanceId: string,
  studentId: string
): Promise<EnrollmentWithRelations> => {
  // Get instance with enrollment count
  const instance = await enrollmentRepository.getInstanceWithEnrollmentCount(instanceId);

  if (!instance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course instance not found');
  }

  if (!instance.enrollmentOpen) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Enrollment is closed for this course');
  }

  // Check enrollment limit
  if (instance.enrollmentLimit && instance._count.enrollments >= instance.enrollmentLimit) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Enrollment limit reached for this course');
  }

  // Check if already enrolled
  const existingEnrollment = await enrollmentRepository.findByInstanceAndStudent(
    instanceId,
    studentId
  );

  if (existingEnrollment) {
    if (existingEnrollment.status === 'enrolled') {
      throw new ApiError(httpStatus.CONFLICT, 'Student is already enrolled in this course');
    }
    // If dropped, allow re-enrollment by updating status
    if (existingEnrollment.status === 'dropped') {
      const updated = await enrollmentRepository.updateStatus(existingEnrollment.id, 'enrolled');

      // Send notification
      await notificationRepository.create({
        userId: studentId,
        title: 'Enrollment Confirmed',
        message: `You have been re-enrolled in ${updated.instance.course.title}`,
        entityType: 'enrollment',
        entityId: updated.id,
      });

      return updated;
    }
    throw new ApiError(
      httpStatus.CONFLICT,
      `Cannot enroll: current enrollment status is ${existingEnrollment.status}`
    );
  }

  // Create enrollment
  const enrollment = await enrollmentRepository.create({ instanceId, studentId });

  // Send notification
  await notificationRepository.create({
    userId: studentId,
    title: 'Enrollment Confirmed',
    message: `You have been enrolled in ${enrollment.instance.course.title}`,
    entityType: 'enrollment',
    entityId: enrollment.id,
  });

  return enrollment;
};

/**
 * Get enrollment by ID
 */
export const getEnrollmentById = async (
  enrollmentId: string
): Promise<EnrollmentWithRelations | null> => {
  return enrollmentRepository.findById(enrollmentId);
};

/**
 * Get enrollments for a course instance (roster)
 */
export const getInstanceEnrollments = async (
  instanceId: string,
  status?: EnrollmentStatus
): Promise<EnrollmentWithStudent[]> => {
  return enrollmentRepository.getInstanceEnrollments(instanceId, status);
};

/**
 * Get enrollments for a student
 */
export const getStudentEnrollments = async (
  studentId: string,
  status?: EnrollmentStatus
): Promise<EnrollmentWithInstance[]> => {
  return enrollmentRepository.getStudentEnrollments(studentId, status);
};

/**
 * Update enrollment status (drop, complete, fail)
 */
export const updateEnrollmentStatus = async (
  enrollmentId: string,
  status: EnrollmentStatus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  requesterId: string
): Promise<EnrollmentWithRelations> => {
  const enrollment = await enrollmentRepository.findById(enrollmentId);

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  // Validate status transitions
  const currentStatus = enrollment.status;
  const validTransitions: Record<EnrollmentStatus, EnrollmentStatus[]> = {
    enrolled: ['dropped', 'completed', 'failed'],
    dropped: ['enrolled'], // Can re-enroll
    completed: [], // Final state
    failed: ['enrolled'], // Can retry
  };

  if (!validTransitions[currentStatus].includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot transition from ${currentStatus} to ${status}`
    );
  }

  const updated = await enrollmentRepository.updateStatus(enrollmentId, status);

  // Send notification based on status change
  let notificationMessage = '';

  switch (status) {
    case 'dropped':
      notificationMessage = `You have been dropped from ${updated.instance.course.title}`;
      break;
    case 'completed':
      notificationMessage = `Congratulations! You have completed ${updated.instance.course.title}`;
      break;
    case 'failed':
      notificationMessage = `Your enrollment in ${updated.instance.course.title} has been marked as failed`;
      break;
    case 'enrolled':
      notificationMessage = `You have been re-enrolled in ${updated.instance.course.title}`;
      break;
  }

  if (notificationMessage) {
    await notificationRepository.create({
      userId: updated.studentId,
      title: 'Enrollment Status Updated',
      message: notificationMessage,
      entityType: 'enrollment',
      entityId: updated.id,
    });
  }

  return updated;
};

/**
 * Drop a student from a course
 */
export const dropStudent = async (
  instanceId: string,
  studentId: string,
  requesterId: string
): Promise<EnrollmentWithRelations> => {
  const enrollment = await enrollmentRepository.findByInstanceAndStudent(instanceId, studentId);

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  if (enrollment.status !== 'enrolled') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot drop: current status is ${enrollment.status}`
    );
  }

  return updateEnrollmentStatus(enrollment.id, 'dropped', requesterId);
};

/**
 * Delete enrollment (hard delete)
 */
export const deleteEnrollment = async (enrollmentId: string): Promise<void> => {
  const enrollment = await enrollmentRepository.findById(enrollmentId);

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  await enrollmentRepository.delete(enrollmentId);
};

/**
 * Calculate final grade for a student
 */
export const calculateFinalGrade = async (
  instanceId: string,
  studentId: string
): Promise<GradeCalculationResult> => {
  const enrollment = await enrollmentRepository.findByInstanceAndStudent(instanceId, studentId);

  if (!enrollment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Enrollment not found');
  }

  const result = await enrollmentRepository.calculateFinalGrade(instanceId, studentId);

  // Notify student of grade calculation
  await notificationRepository.create({
    userId: studentId,
    title: 'Final Grade Calculated',
    message: `Your final grade for ${enrollment.instance.course.title} has been calculated: ${result.finalLetter || 'N/A'}`,
    entityType: 'enrollment',
    entityId: enrollment.id,
  });

  return result;
};

/**
 * Calculate final grades for all students in an instance
 */
export const calculateAllFinalGrades = async (
  instanceId: string
): Promise<{ processed: number; results: GradeCalculationResult[] }> => {
  const enrollments = await enrollmentRepository.getInstanceEnrollments(instanceId, 'enrolled');

  const results: GradeCalculationResult[] = [];

  for (const enrollment of enrollments) {
    const result = await enrollmentRepository.calculateFinalGrade(
      instanceId,
      enrollment.student.id
    );
    results.push(result);
  }

  return {
    processed: results.length,
    results,
  };
};

/**
 * Bulk enroll students
 */
export const bulkEnrollStudents = async (
  instanceId: string,
  studentIds: string[]
): Promise<BulkEnrollResult> => {
  // Get instance with enrollment info
  const instance = await enrollmentRepository.getInstanceWithEnrollmentCount(instanceId);

  if (!instance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course instance not found');
  }

  if (!instance.enrollmentOpen) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Enrollment is closed for this course');
  }

  const successful: string[] = [];
  const failed: Array<{ studentId: string; reason: string }> = [];

  // Check enrollment limit
  const currentEnrollments = instance._count.enrollments;
  const availableSpots = instance.enrollmentLimit
    ? instance.enrollmentLimit - currentEnrollments
    : studentIds.length;

  if (availableSpots <= 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No available spots for enrollment');
  }

  // Limit the number of students to available spots
  const studentsToEnroll = studentIds.slice(0, availableSpots);
  const studentsExcluded = studentIds.slice(availableSpots);

  // Add excluded students to failed list
  studentsExcluded.forEach((studentId) => {
    failed.push({ studentId, reason: 'Enrollment limit reached' });
  });

  // Process enrollments
  for (const studentId of studentsToEnroll) {
    try {
      const existing = await enrollmentRepository.findByInstanceAndStudent(instanceId, studentId);

      if (existing) {
        if (existing.status === 'enrolled') {
          failed.push({ studentId, reason: 'Already enrolled' });
        } else if (existing.status === 'dropped') {
          await enrollmentRepository.updateStatus(existing.id, 'enrolled');
          successful.push(studentId);
        } else {
          failed.push({ studentId, reason: `Current status: ${existing.status}` });
        }
      } else {
        await enrollmentRepository.create({ instanceId, studentId });
        successful.push(studentId);
      }
    } catch (error) {
      failed.push({
        studentId,
        reason: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return { successful, failed };
};

/**
 * Get enrollment statistics for an instance
 */
export const getEnrollmentStats = async (instanceId: string): Promise<EnrollmentStats> => {
  return enrollmentRepository.getStats(instanceId);
};

/**
 * Check if a student is enrolled in an instance
 */
export const isStudentEnrolled = async (
  instanceId: string,
  studentId: string
): Promise<boolean> => {
  return enrollmentRepository.isStudentEnrolled(instanceId, studentId);
};

/**
 * Export roster as CSV data
 */
export const exportRoster = async (
  instanceId: string
): Promise<{ headers: string[]; rows: string[][] }> => {
  const enrollments = await enrollmentRepository.getInstanceEnrollments(instanceId);

  const headers = [
    'Student ID',
    'Email',
    'First Name',
    'Last Name',
    'Program',
    'Status',
    'Enrolled At',
    'Final Grade',
    'Final Letter',
  ];

  const rows = enrollments.map((e) => [
    e.student.studentProfile?.studentId || '',
    e.student.email,
    e.student.firstName,
    e.student.lastName,
    e.student.studentProfile?.program || '',
    e.status,
    e.enrolledAt.toISOString(),
    e.finalGrade?.toString() || '',
    e.finalLetter || '',
  ]);

  return { headers, rows };
};

// ============================================================================
// SERVICE EXPORT
// ============================================================================

export const enrollmentService = {
  enroll: enrollStudent,
  getById: getEnrollmentById,
  getInstanceEnrollments,
  getStudentEnrollments,
  updateStatus: updateEnrollmentStatus,
  drop: dropStudent,
  delete: deleteEnrollment,
  calculateFinalGrade,
  calculateAllFinalGrades,
  bulkEnroll: bulkEnrollStudents,
  getStats: getEnrollmentStats,
  isEnrolled: isStudentEnrolled,
  exportRoster,
};
