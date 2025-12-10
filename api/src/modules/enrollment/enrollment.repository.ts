import prisma from '@/client';
import { PaginationOptions, PaginatedResult } from '@/shared/repositories/base.repository';
import type {
  EnrollmentCreateInput,
  EnrollmentUpdateInput,
  EnrollmentListFilters,
  EnrollmentWithStudent,
  EnrollmentWithInstance,
  EnrollmentWithRelations,
  EnrollmentStats,
  GradeCalculationResult,
  EnrollmentStatus,
} from './enrollment.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert letter grade from numeric score
 */
export function getLetterGrade(score: number): string {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

/**
 * Transform Prisma Decimal fields to numbers
 */
const transformEnrollment = <T extends { finalGrade?: any }>(enrollment: T): T => {
  if (!enrollment) return enrollment;
  return {
    ...enrollment,
    finalGrade: enrollment.finalGrade ? Number(enrollment.finalGrade) : enrollment.finalGrade,
  };
};

// ============================================================================
// REPOSITORY FUNCTIONS
// ============================================================================

/**
 * Create a new enrollment
 */
export const createEnrollment = async (
  data: EnrollmentCreateInput
): Promise<EnrollmentWithRelations> => {
  const result = await prisma.enrollment.create({
    data: {
      instanceId: data.instanceId,
      studentId: data.studentId,
    },
    include: {
      student: {
        include: { studentProfile: true },
      },
      instance: {
        include: { course: true },
      },
    },
  });

  return transformEnrollment(result) as EnrollmentWithRelations;
};

/**
 * Find enrollment by ID
 */
export const findEnrollmentById = async (
  enrollmentId: string
): Promise<EnrollmentWithRelations | null> => {
  const result = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: {
        include: { studentProfile: true },
      },
      instance: {
        include: { course: true },
      },
    },
  });

  return result ? (transformEnrollment(result) as EnrollmentWithRelations) : null;
};

/**
 * Find enrollment by instance and student (composite key)
 */
export const findEnrollmentByInstanceAndStudent = async (
  instanceId: string,
  studentId: string
): Promise<EnrollmentWithRelations | null> => {
  const result = await prisma.enrollment.findUnique({
    where: {
      instanceId_studentId: { instanceId, studentId },
    },
    include: {
      student: {
        include: { studentProfile: true },
      },
      instance: {
        include: { course: true },
      },
    },
  });

  return result ? (transformEnrollment(result) as EnrollmentWithRelations) : null;
};

/**
 * Get all enrollments for a course instance (roster)
 */
export const getInstanceEnrollments = async (
  instanceId: string,
  status?: EnrollmentStatus
): Promise<EnrollmentWithStudent[]> => {
  const results = await prisma.enrollment.findMany({
    where: {
      instanceId,
      ...(status && { status }),
    },
    include: {
      student: {
        include: { studentProfile: true },
      },
    },
    orderBy: { student: { lastName: 'asc' } },
  });

  return results.map((r: any) => transformEnrollment(r)) as EnrollmentWithStudent[];
};

/**
 * Get all enrollments for a student
 */
export const getStudentEnrollments = async (
  studentId: string,
  status?: EnrollmentStatus
): Promise<EnrollmentWithInstance[]> => {
  const results = await prisma.enrollment.findMany({
    where: {
      studentId,
      ...(status && { status }),
    },
    include: {
      instance: {
        include: { course: true },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  return results.map((r: any) => transformEnrollment(r)) as EnrollmentWithInstance[];
};

/**
 * List enrollments with filters and pagination
 */
export const listEnrollments = async (
  filters: EnrollmentListFilters,
  options: PaginationOptions
): Promise<PaginatedResult<EnrollmentWithRelations>> => {
  const { page = 1, limit = 20, sortBy = 'enrolledAt', sortOrder = 'desc' } = options;

  const where: Record<string, any> = {};

  if (filters.instanceId) {
    where.instanceId = filters.instanceId;
  }
  if (filters.studentId) {
    where.studentId = filters.studentId;
  }
  if (filters.status) {
    where.status = filters.status;
  }

  const [results, total] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      include: {
        student: {
          include: { studentProfile: true },
        },
        instance: {
          include: { course: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.enrollment.count({ where }),
  ]);

  return {
    results: results.map((r: any) => transformEnrollment(r)) as EnrollmentWithRelations[],
    page,
    limit,
    totalResults: total,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Update enrollment status
 */
export const updateEnrollmentStatus = async (
  enrollmentId: string,
  status: EnrollmentStatus
): Promise<EnrollmentWithRelations> => {
  const result = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      status,
      ...(status === 'completed' && { completedAt: new Date() }),
    },
    include: {
      student: {
        include: { studentProfile: true },
      },
      instance: {
        include: { course: true },
      },
    },
  });

  return transformEnrollment(result) as EnrollmentWithRelations;
};

/**
 * Update enrollment (general update)
 */
export const updateEnrollment = async (
  enrollmentId: string,
  data: EnrollmentUpdateInput
): Promise<EnrollmentWithRelations> => {
  const result = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      ...data,
      ...(data.status === 'completed' && { completedAt: new Date() }),
    },
    include: {
      student: {
        include: { studentProfile: true },
      },
      instance: {
        include: { course: true },
      },
    },
  });

  return transformEnrollment(result) as EnrollmentWithRelations;
};

/**
 * Delete enrollment
 */
export const deleteEnrollment = async (enrollmentId: string): Promise<void> => {
  await prisma.enrollment.delete({
    where: { id: enrollmentId },
  });
};

/**
 * Calculate and set final grade for a student in an instance
 */
export const calculateFinalGrade = async (
  instanceId: string,
  studentId: string
): Promise<GradeCalculationResult> => {
  const submissions = await prisma.submission.findMany({
    where: {
      studentId,
      publishedAssignment: { instanceId },
      status: 'graded',
    },
    include: { publishedAssignment: true },
  });

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let gradedAssignments = 0;

  for (const sub of submissions) {
    if (sub.finalPoints !== null && sub.publishedAssignment.weightPercentage) {
      const weight = Number(sub.publishedAssignment.weightPercentage);
      const maxPoints = Number(sub.publishedAssignment.maxPoints) || 100;
      const score = (Number(sub.finalPoints) / maxPoints) * 100;
      totalWeightedScore += score * weight;
      totalWeight += weight;
      gradedAssignments++;
    }
  }

  const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : null;
  const finalLetter = finalGrade !== null ? getLetterGrade(finalGrade) : null;

  // Update the enrollment with calculated grade
  await prisma.enrollment.update({
    where: {
      instanceId_studentId: { instanceId, studentId },
    },
    data: { finalGrade, finalLetter },
  });

  return {
    finalGrade,
    finalLetter,
    totalWeight,
    gradedAssignments,
  };
};

/**
 * Bulk enroll multiple students
 */
export const bulkEnrollStudents = async (
  instanceId: string,
  studentIds: string[]
): Promise<{ created: number; skipped: number }> => {
  // Get existing enrollments to avoid duplicates
  const existing = await prisma.enrollment.findMany({
    where: {
      instanceId,
      studentId: { in: studentIds },
    },
    select: { studentId: true },
  });

  const existingIds = new Set(existing.map((e: { studentId: string }) => e.studentId));
  const newStudentIds = studentIds.filter((id) => !existingIds.has(id));

  if (newStudentIds.length > 0) {
    await prisma.enrollment.createMany({
      data: newStudentIds.map((studentId) => ({
        instanceId,
        studentId,
      })),
      skipDuplicates: true,
    });
  }

  return {
    created: newStudentIds.length,
    skipped: studentIds.length - newStudentIds.length,
  };
};

/**
 * Get enrollment statistics for an instance
 */
export const getEnrollmentStats = async (instanceId: string): Promise<EnrollmentStats> => {
  const instance = await prisma.courseInstance.findUnique({
    where: { id: instanceId },
    select: {
      id: true,
      enrollmentOpen: true,
      enrollmentLimit: true,
    },
  });

  if (!instance) {
    throw new Error('Instance not found');
  }

  const stats = await prisma.enrollment.groupBy({
    by: ['status'],
    where: { instanceId },
    _count: { status: true },
  });

  const statusCounts: Record<string, number> = {};
  stats.forEach((s: { status: string; _count: { status: number } }) => {
    statusCounts[s.status] = s._count.status;
  });

  const totalEnrolled = statusCounts['enrolled'] || 0;
  const totalDropped = statusCounts['dropped'] || 0;
  const totalCompleted = statusCounts['completed'] || 0;
  const totalFailed = statusCounts['failed'] || 0;

  return {
    instanceId,
    totalEnrolled,
    totalDropped,
    totalCompleted,
    totalFailed,
    enrollmentOpen: instance.enrollmentOpen,
    enrollmentLimit: instance.enrollmentLimit,
    availableSpots: instance.enrollmentLimit ? instance.enrollmentLimit - totalEnrolled : null,
  };
};

/**
 * Check if a student is enrolled in an instance
 */
export const isStudentEnrolled = async (
  instanceId: string,
  studentId: string
): Promise<boolean> => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      instanceId_studentId: { instanceId, studentId },
    },
    select: { status: true },
  });

  return enrollment !== null && enrollment.status === 'enrolled';
};

/**
 * Get instance with enrollment count (for limit checking)
 */
export const getInstanceWithEnrollmentCount = async (instanceId: string) => {
  return prisma.courseInstance.findUnique({
    where: { id: instanceId },
    include: {
      course: true,
      _count: { select: { enrollments: { where: { status: 'enrolled' } } } },
    },
  });
};

// ============================================================================
// REPOSITORY EXPORT
// ============================================================================

export const enrollmentRepository = {
  create: createEnrollment,
  findById: findEnrollmentById,
  findByInstanceAndStudent: findEnrollmentByInstanceAndStudent,
  getInstanceEnrollments,
  getStudentEnrollments,
  list: listEnrollments,
  updateStatus: updateEnrollmentStatus,
  update: updateEnrollment,
  delete: deleteEnrollment,
  calculateFinalGrade,
  bulkEnroll: bulkEnrollStudents,
  getStats: getEnrollmentStats,
  isStudentEnrolled,
  getInstanceWithEnrollmentCount,
};
