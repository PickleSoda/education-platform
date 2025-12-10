import { dashboardRepository } from './dashboard.repository';

// ============================================================================
// TEACHER DASHBOARD SERVICE
// ============================================================================

export const getTeacherDashboard = async (teacherId: string) => {
  const activeInstances = await dashboardRepository.getTeacherActiveInstances(teacherId);
  const instanceIds = activeInstances.map((i) => i.id);

  // If no active instances, return early with empty data
  if (instanceIds.length === 0) {
    return {
      activeInstances: [],
      pendingGrading: 0,
      recentPosts: [],
      upcomingDeadlines: [],
      quickStats: {
        totalStudents: 0,
        pendingGrading: 0,
        activeInstances: 0,
      },
    };
  }

  const [pendingGrading, recentPosts, upcomingDeadlines] = await Promise.all([
    dashboardRepository.getTeacherPendingGradingCount(instanceIds),
    dashboardRepository.getTeacherRecentForumPosts(instanceIds, 5),
    dashboardRepository.getTeacherUpcomingDeadlines(instanceIds, 5),
  ]);

  // Calculate total students across all instances
  const totalStudents = activeInstances.reduce(
    (sum, instance) => sum + instance._count.enrollments,
    0
  );

  return {
    activeInstances,
    pendingGrading,
    recentPosts,
    upcomingDeadlines,
    quickStats: {
      totalStudents,
      pendingGrading,
      activeInstances: activeInstances.length,
    },
  };
};

// ============================================================================
// STUDENT DASHBOARD SERVICE
// ============================================================================

export const getStudentDashboard = async (studentId: string) => {
  const enrollments = await dashboardRepository.getStudentActiveEnrollments(studentId);
  const instanceIds = enrollments.map((e) => e.instanceId);

  // If no enrollments, return early with empty data
  if (instanceIds.length === 0) {
    return {
      enrollments: [],
      upcomingAssignments: [],
      recentGrades: [],
      unreadNotifications: 0,
      quickStats: {
        enrolledCourses: 0,
        pendingAssignments: 0,
        upcomingDeadlines: 0,
      },
    };
  }

  const [upcomingAssignments, recentGrades, unreadNotifications] = await Promise.all([
    dashboardRepository.getStudentUpcomingAssignments(studentId, instanceIds, 10),
    dashboardRepository.getStudentRecentGrades(studentId, 5),
    dashboardRepository.getStudentUnreadNotificationCount(studentId),
  ]);

  return {
    enrollments,
    upcomingAssignments,
    recentGrades,
    unreadNotifications,
    quickStats: {
      enrolledCourses: enrollments.length,
      pendingAssignments: upcomingAssignments.length,
      upcomingDeadlines: upcomingAssignments.filter((a) => a.deadline).length,
    },
  };
};

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export const getInstanceAnalytics = async (instanceId: string, assignmentId?: string) => {
  const gradeDistribution = await dashboardRepository.getInstanceGradeDistribution(
    instanceId,
    assignmentId
  );

  return {
    gradeDistribution: gradeDistribution.distribution,
    averageGrade: gradeDistribution.average,
    totalSubmissions: gradeDistribution.totalGraded,
  };
};

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

export const dashboardService = {
  getTeacherDashboard,
  getStudentDashboard,
  getInstanceAnalytics,
};
