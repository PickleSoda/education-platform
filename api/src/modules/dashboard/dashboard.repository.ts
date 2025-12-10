import prisma from '@/client';

// ============================================================================
// TEACHER DASHBOARD QUERIES
// ============================================================================

export const getTeacherActiveInstances = async (teacherId: string) => {
  return prisma.courseInstance.findMany({
    where: {
      lecturers: { some: { userId: teacherId } },
      status: 'active',
    },
    include: {
      course: true,
      _count: {
        select: {
          enrollments: { where: { status: 'enrolled' } },
        },
      },
    },
  });
};

export const getTeacherPendingGradingCount = async (instanceIds: string[]) => {
  return prisma.submission.count({
    where: {
      publishedAssignment: { instanceId: { in: instanceIds } },
      status: { in: ['submitted', 'late'] },
    },
  });
};

export const getTeacherRecentForumPosts = async (instanceIds: string[], limit = 5) => {
  return prisma.forumPost.findMany({
    where: {
      forum: { instanceId: { in: instanceIds } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      author: true,
      forum: { include: { instance: { include: { course: true } } } },
    },
  });
};

export const getTeacherUpcomingDeadlines = async (instanceIds: string[], limit = 5) => {
  return prisma.publishedAssignment.findMany({
    where: {
      instanceId: { in: instanceIds },
      status: 'published',
      deadline: { gte: new Date() },
    },
    orderBy: { deadline: 'asc' },
    take: limit,
    include: { instance: { include: { course: true } } },
  });
};

// ============================================================================
// STUDENT DASHBOARD QUERIES
// ============================================================================

export const getStudentActiveEnrollments = async (studentId: string) => {
  return prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'enrolled',
      instance: { status: 'active' },
    },
    include: {
      instance: {
        include: {
          course: true,
          lecturers: { include: { user: true } },
        },
      },
    },
  });
};

export const getStudentUpcomingAssignments = async (
  studentId: string,
  instanceIds: string[],
  limit = 10
) => {
  return prisma.publishedAssignment.findMany({
    where: {
      instanceId: { in: instanceIds },
      status: 'published',
      deadline: { gte: new Date() },
      submissions: {
        none: {
          studentId,
          status: { in: ['submitted', 'late', 'graded'] },
        },
      },
    },
    orderBy: { deadline: 'asc' },
    take: limit,
    include: { instance: { include: { course: true } } },
  });
};

export const getStudentRecentGrades = async (studentId: string, limit = 5) => {
  return prisma.submission.findMany({
    where: {
      studentId,
      status: 'graded',
      gradedAt: { not: null },
    },
    orderBy: { gradedAt: 'desc' },
    take: limit,
    include: {
      publishedAssignment: {
        include: { instance: { include: { course: true } } },
      },
    },
  });
};

export const getStudentUnreadNotificationCount = async (studentId: string) => {
  return prisma.notification.count({
    where: { userId: studentId, isRead: false },
  });
};

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

export const getInstanceGradeDistribution = async (instanceId: string, assignmentId?: string) => {
  const where = {
    publishedAssignment: {
      instanceId,
      ...(assignmentId && { id: assignmentId }),
    },
    status: 'graded' as const,
    finalPoints: { not: null },
  };

  const submissions = await prisma.submission.findMany({
    where,
    select: { finalPoints: true, publishedAssignment: { select: { maxPoints: true } } },
  });

  // Calculate distribution
  const percentages = submissions.map((s) => {
    const max = Number(s.publishedAssignment.maxPoints) || 100;
    return (Number(s.finalPoints) / max) * 100;
  });

  const distribution = {
    'A (90-100)': percentages.filter((p) => p >= 90).length,
    'B (80-89)': percentages.filter((p) => p >= 80 && p < 90).length,
    'C (70-79)': percentages.filter((p) => p >= 70 && p < 80).length,
    'D (60-69)': percentages.filter((p) => p >= 60 && p < 70).length,
    'F (<60)': percentages.filter((p) => p < 60).length,
  };

  const average =
    percentages.length > 0 ? percentages.reduce((a, b) => a + b, 0) / percentages.length : 0;

  return { distribution, average, totalGraded: submissions.length };
};

// ============================================================================
// REPOSITORY EXPORTS
// ============================================================================

export const dashboardRepository = {
  // Teacher queries
  getTeacherActiveInstances,
  getTeacherPendingGradingCount,
  getTeacherRecentForumPosts,
  getTeacherUpcomingDeadlines,

  // Student queries
  getStudentActiveEnrollments,
  getStudentUpcomingAssignments,
  getStudentRecentGrades,
  getStudentUnreadNotificationCount,

  // Analytics queries
  getInstanceGradeDistribution,
};
