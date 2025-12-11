import { Prisma } from '@prisma/client';
import prisma from '@/client';
import { PaginationOptions } from '@/shared/repositories/base.repository';
import type {
  SubmissionCreateInput,
  SubmissionUpdateInput,
  SubmissionWithRelations,
  StudentGradebook,
  SubmissionStats,
} from './submission.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform Prisma Decimal fields to numbers for JSON serialization
 */
const transformSubmission = (submission: any): SubmissionWithRelations => {
  if (!submission) return submission;
  return {
    ...submission,
    totalPoints: submission.totalPoints ? Number(submission.totalPoints) : submission.totalPoints,
    finalPoints: submission.finalPoints ? Number(submission.finalPoints) : submission.finalPoints,
    latePenaltyApplied: submission.latePenaltyApplied
      ? Number(submission.latePenaltyApplied)
      : submission.latePenaltyApplied,
  };
};

// ============================================================================
// REPOSITORY FUNCTIONS
// ============================================================================

/**
 * Create or update submission draft
 */
export const saveSubmission = async (
  data: SubmissionCreateInput
): Promise<SubmissionWithRelations> => {
  // Verify assignment exists first
  const assignment = await prisma.publishedAssignment.findUnique({
    where: { id: data.assignmentId },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const result = await prisma.submission.upsert({
    where: {
      publishedAssignmentId_studentId: {
        publishedAssignmentId: data.assignmentId,
        studentId: data.studentId,
      },
    },
    create: {
      publishedAssignmentId: data.assignmentId,
      studentId: data.studentId,
      content: data.content,
      attachments: data.attachments,
      status: 'draft',
    },
    update: {
      content: data.content,
      attachments: data.attachments,
    },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      publishedAssignment: {
        select: {
          id: true,
          title: true,
          deadline: true,
          lateDeadline: true,
          latePenaltyPercent: true,
        },
      },
    },
  });

  return transformSubmission(result) as SubmissionWithRelations;
};

/**
 * Get submission by ID
 */
export const getSubmissionById = async (
  submissionId: string
): Promise<SubmissionWithRelations | null> => {
  const result = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      publishedAssignment: {
        select: {
          id: true,
          title: true,
          deadline: true,
          lateDeadline: true,
          latePenaltyPercent: true,
        },
      },
      grades: true,
    },
  });

  return result ? transformSubmission(result) : null;
};

/**
 * Submit assignment
 */
export const submitAssignment = async (
  assignmentId: string,
  studentId: string
): Promise<SubmissionWithRelations> => {
  const assignment = await prisma.publishedAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  const now = new Date();
  const isLate = assignment.deadline ? now > assignment.deadline : false;

  // Check if past late deadline
  if (assignment.lateDeadline && now > assignment.lateDeadline) {
    throw new Error('Late submission deadline has passed');
  }

  const result = await prisma.submission.upsert({
    where: {
      publishedAssignmentId_studentId: {
        publishedAssignmentId: assignmentId,
        studentId,
      },
    },
    create: {
      publishedAssignmentId: assignmentId,
      studentId,
      status: isLate ? 'late' : 'submitted',
      submittedAt: now,
      isLate,
    },
    update: {
      status: isLate ? 'late' : 'submitted',
      submittedAt: now,
      isLate,
    },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      publishedAssignment: {
        select: {
          id: true,
          title: true,
          deadline: true,
          lateDeadline: true,
          latePenaltyPercent: true,
        },
      },
    },
  });

  return transformSubmission(result) as SubmissionWithRelations;
};

/**
 * List submissions with filters and pagination
 */
export const listSubmissions = async (
  filters: {
    assignmentId?: string;
    studentId?: string;
    status?: string;
    graded?: boolean;
  },
  options: PaginationOptions
): Promise<{ data: SubmissionWithRelations[]; pagination: any }> => {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const where: Prisma.SubmissionWhereInput = {
    ...(filters.assignmentId && { publishedAssignmentId: filters.assignmentId }),
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.graded !== undefined && { status: filters.graded ? 'graded' : { not: 'graded' } }),
  };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        publishedAssignment: {
          select: {
            id: true,
            title: true,
            deadline: true,
            lateDeadline: true,
            latePenaltyPercent: true,
            instance: {
              select: {
                id: true,
                course: {
                  select: {
                    id: true,
                    code: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        grades: true,
      },
      orderBy: { [sortBy]: sortOrder as any },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.submission.count({ where }),
  ]);

  const transformedSubmissions = submissions.map(transformSubmission) as SubmissionWithRelations[];

  return {
    data: transformedSubmissions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Grade submission with criteria (for points mode)
 */
export const gradeSubmission = async (data: {
  submissionId: string;
  graderId: string;
  criteriaGrades: Array<{
    criteriaId: string;
    pointsAwarded: number;
    feedback?: string;
  }>;
  overallFeedback?: string;
}): Promise<SubmissionWithRelations> => {
  const submission = await prisma.submission.findUnique({
    where: { id: data.submissionId },
    include: { publishedAssignment: true },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  // Create/update individual grades
  for (const grade of data.criteriaGrades) {
    await prisma.submissionGrade.upsert({
      where: {
        submissionId_publishedCriteriaId: {
          submissionId: data.submissionId,
          publishedCriteriaId: grade.criteriaId,
        },
      },
      create: {
        submissionId: data.submissionId,
        publishedCriteriaId: grade.criteriaId,
        pointsAwarded: grade.pointsAwarded,
        feedback: grade.feedback,
      },
      update: {
        pointsAwarded: grade.pointsAwarded,
        feedback: grade.feedback,
      },
    });
  }

  // Calculate total points
  const totalPoints = data.criteriaGrades.reduce((sum, g) => sum + g.pointsAwarded, 0);

  // Apply late penalty if applicable
  let finalPoints = totalPoints;
  let latePenaltyApplied = 0;

  if (submission.isLate && submission.publishedAssignment.latePenaltyPercent) {
    const penalty = submission.publishedAssignment.latePenaltyPercent as unknown as number;
    latePenaltyApplied = (totalPoints * penalty) / 100;
    finalPoints = totalPoints - latePenaltyApplied;
  }

  // Update submission
  const result = await prisma.submission.update({
    where: { id: data.submissionId },
    data: {
      totalPoints,
      latePenaltyApplied,
      finalPoints,
      feedback: data.overallFeedback,
      gradedBy: data.graderId,
      gradedAt: new Date(),
      status: 'graded',
    },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      publishedAssignment: {
        select: {
          id: true,
          title: true,
          deadline: true,
          lateDeadline: true,
          latePenaltyPercent: true,
        },
      },
      grades: true,
    },
  });

  return transformSubmission(result) as SubmissionWithRelations;
};

/**
 * Grade pass/fail submission
 */
export const gradePassFail = async (data: {
  submissionId: string;
  graderId: string;
  isPassed: boolean;
  feedback?: string;
}): Promise<SubmissionWithRelations> => {
  const result = await prisma.submission.update({
    where: { id: data.submissionId },
    data: {
      isPassed: data.isPassed,
      feedback: data.feedback,
      gradedBy: data.graderId,
      gradedAt: new Date(),
      status: 'graded',
    },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      publishedAssignment: {
        select: {
          id: true,
          title: true,
          deadline: true,
          lateDeadline: true,
          latePenaltyPercent: true,
        },
      },
    },
  });

  return transformSubmission(result) as SubmissionWithRelations;
};

/**
 * Get student gradebook for an instance
 */
export const getStudentGradebook = async (
  instanceId: string,
  studentId: string
): Promise<StudentGradebook> => {
  const assignments = await prisma.publishedAssignment.findMany({
    where: {
      instanceId,
      status: { in: ['published', 'closed'] },
    },
    include: {
      submissions: {
        where: { studentId },
        include: {
          grades: {
            include: { publishedCriteria: true },
          },
        },
      },
      gradingCriteria: { orderBy: { sortOrder: 'asc' } },
    },
    orderBy: { createdAt: 'asc' },
  });

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      instanceId_studentId: { instanceId, studentId },
    },
  });

  return {
    assignments: assignments.map((a) => ({
      id: a.id,
      title: a.title,
      type: a.assignmentType,
      gradingMode: a.gradingMode,
      maxPoints: a.maxPoints ? Number(a.maxPoints) : null,
      weightPercentage: a.weightPercentage ? Number(a.weightPercentage) : null,
      deadline: a.deadline,
      submission: a.submissions[0] ? transformSubmission(a.submissions[0]) : null,
      criteria: a.gradingCriteria,
    })),
    finalGrade: enrollment?.finalGrade ? Number(enrollment.finalGrade) : null,
    finalLetter: enrollment?.finalLetter,
  };
};

/**
 * Get submission statistics for an assignment
 */
export const getSubmissionStats = async (assignmentId: string): Promise<SubmissionStats> => {
  const submissions = await prisma.submission.findMany({
    where: { publishedAssignmentId: assignmentId },
  });

  const graded = submissions.filter((s) => s.status === 'graded');
  const submitted = submissions.filter((s) => ['submitted', 'late', 'graded'].includes(s.status));
  const late = submissions.filter((s) => s.isLate);

  const averageScore =
    graded.length > 0
      ? graded.reduce((sum, s) => {
          const points = (s.finalPoints || s.totalPoints || 0) as unknown as number;
          return sum + points;
        }, 0) / graded.length
      : null;

  return {
    total: submissions.length,
    submitted: submitted.length,
    graded: graded.length,
    pending: submissions.length - graded.length,
    late: late.length,
    averageScore: averageScore ? Number(averageScore) : null,
  };
};

/**
 * Update submission (for saving drafts)
 */
export const updateSubmission = async (
  submissionId: string,
  data: SubmissionUpdateInput
): Promise<SubmissionWithRelations> => {
  const result = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      content: data.content,
      attachments: data.attachments,
    },
    include: {
      student: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      publishedAssignment: {
        select: {
          id: true,
          title: true,
          deadline: true,
          lateDeadline: true,
          latePenaltyPercent: true,
        },
      },
      grades: true,
    },
  });

  return transformSubmission(result) as SubmissionWithRelations;
};

export const submissionRepository = {
  saveSubmission,
  getSubmissionById,
  submitAssignment,
  listSubmissions,
  gradeSubmission,
  gradePassFail,
  getStudentGradebook,
  getSubmissionStats,
  updateSubmission,
};

export default submissionRepository;
