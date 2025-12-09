// queries.ts
// This file contains shared query patterns for modules that haven't been fully migrated yet.
// User/Auth queries are in: modules/user/user.repository.ts, modules/auth/auth.service.ts
// Course queries are in: modules/course/course.repository.ts
// Assignment template queries are in: modules/assignment/assignment.repository.ts
// Instance queries are in: modules/instance/instance.repository.ts

import { PrismaClient, EnrollmentStatus, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// ENROLLMENT QUERIES
// ============================================================================

export const enrollmentQueries = {
  // Enroll student
  async enrollStudent(instanceId: string, studentId: string) {
    // Check enrollment limit
    const instance = await prisma.courseInstance.findUnique({
      where: { id: instanceId },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!instance) throw new Error('Instance not found');
    if (!instance.enrollmentOpen) throw new Error('Enrollment is closed');
    if (instance.enrollmentLimit && instance._count.enrollments >= instance.enrollmentLimit) {
      throw new Error('Enrollment limit reached');
    }

    const enrollment = await prisma.enrollment.create({
      data: { instanceId, studentId },
      include: { instance: { include: { course: true } } },
    });

    // Create notification
    await notificationQueries.createNotification({
      userId: studentId,
      type: 'enrollment_confirmed',
      title: 'Enrollment Confirmed',
      message: `You have been enrolled in ${enrollment.instance.course.title}`,
      data: { instanceId, courseId: enrollment.instance.courseId },
    });

    return enrollment;
  },

  // Get all enrolled students for an instance
  async getInstanceEnrollments(instanceId: string) {
    return prisma.enrollment.findMany({
      where: { instanceId },
      include: {
        student: {
          include: { studentProfile: true },
        },
      },
      orderBy: { student: { lastName: 'asc' } },
    });
  },

  // Update enrollment status
  async updateEnrollmentStatus(enrollmentId: string, status: EnrollmentStatus) {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status,
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    });
  },

  // Calculate and set final grade
  async calculateFinalGrade(instanceId: string, studentId: string) {
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

    for (const sub of submissions) {
      if (sub.finalPoints !== null && sub.publishedAssignment.weightPercentage) {
        const weight = Number(sub.publishedAssignment.weightPercentage);
        const maxPoints = Number(sub.publishedAssignment.maxPoints) || 100;
        const score = (Number(sub.finalPoints) / maxPoints) * 100;
        totalWeightedScore += score * weight;
        totalWeight += weight;
      }
    }

    const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : null;
    const finalLetter = finalGrade !== null ? getLetterGrade(finalGrade) : null;

    return prisma.enrollment.update({
      where: {
        instanceId_studentId: { instanceId, studentId },
      },
      data: { finalGrade, finalLetter },
    });
  },
};

function getLetterGrade(score: number): string {
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

// ============================================================================
// SUBMISSION & GRADING QUERIES
// ============================================================================

export const submissionQueries = {
  // Create or update submission draft
  async saveSubmission(data: {
    assignmentId: string;
    studentId: string;
    content?: string;
    attachments?: any;
  }) {
    return prisma.submission.upsert({
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
    });
  },

  // Submit assignment
  async submitAssignment(assignmentId: string, studentId: string) {
    const assignment = await prisma.publishedAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) throw new Error('Assignment not found');

    const now = new Date();
    const isLate = assignment.deadline ? now > assignment.deadline : false;

    // Check if past late deadline
    if (assignment.lateDeadline && now > assignment.lateDeadline) {
      throw new Error('Submission deadline has passed');
    }

    return prisma.submission.update({
      where: {
        publishedAssignmentId_studentId: {
          publishedAssignmentId: assignmentId,
          studentId,
        },
      },
      data: {
        status: isLate ? 'late' : 'submitted',
        submittedAt: now,
        isLate,
      },
    });
  },

  // Grade submission with criteria (for points mode)
  async gradeSubmission(data: {
    submissionId: string;
    graderId: string;
    criteriaGrades: Array<{
      criteriaId: string;
      pointsAwarded: number;
      feedback?: string;
    }>;
    overallFeedback?: string;
  }) {
    const submission = await prisma.submission.findUnique({
      where: { id: data.submissionId },
      include: { publishedAssignment: true },
    });

    if (!submission) throw new Error('Submission not found');

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
          gradedBy: data.graderId,
        },
        update: {
          pointsAwarded: grade.pointsAwarded,
          feedback: grade.feedback,
          gradedBy: data.graderId,
          gradedAt: new Date(),
        },
      });
    }

    // Calculate total points
    const totalPoints = data.criteriaGrades.reduce((sum, g) => sum + g.pointsAwarded, 0);

    // Apply late penalty if applicable
    let finalPoints = totalPoints;
    let latePenaltyApplied = 0;

    if (submission.isLate && submission.publishedAssignment.latePenaltyPercent) {
      latePenaltyApplied =
        totalPoints * (Number(submission.publishedAssignment.latePenaltyPercent) / 100);
      finalPoints = totalPoints - latePenaltyApplied;
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
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
        student: true,
        publishedAssignment: { include: { instance: true } },
      },
    });

    // Notify student
    await notificationQueries.createNotification({
      userId: submission.studentId,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your submission for "${updatedSubmission.publishedAssignment.title}" has been graded`,
      data: {
        submissionId: data.submissionId,
        assignmentId: submission.publishedAssignmentId,
        finalPoints,
      },
    });

    return updatedSubmission;
  },

  // Grade pass/fail submission
  async gradePassFail(data: {
    submissionId: string;
    graderId: string;
    isPassed: boolean;
    feedback?: string;
  }) {
    const submission = await prisma.submission.update({
      where: { id: data.submissionId },
      data: {
        isPassed: data.isPassed,
        feedback: data.feedback,
        gradedBy: data.graderId,
        gradedAt: new Date(),
        status: 'graded',
      },
      include: { student: true, publishedAssignment: true },
    });

    await notificationQueries.createNotification({
      userId: submission.studentId,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your submission for "${submission.publishedAssignment.title}" has been marked as ${data.isPassed ? 'complete' : 'incomplete'}`,
      data: { submissionId: data.submissionId, isPassed: data.isPassed },
    });

    return submission;
  },

  // Get student gradebook
  async getStudentGradebook(instanceId: string, studentId: string) {
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
        maxPoints: a.maxPoints,
        weightPercentage: a.weightPercentage,
        deadline: a.deadline,
        submission: a.submissions[0] || null,
        criteria: a.gradingCriteria,
      })),
      finalGrade: enrollment?.finalGrade,
      finalLetter: enrollment?.finalLetter,
    };
  },
};

// ============================================================================
// NOTIFICATION QUERIES
// ============================================================================

export const notificationQueries = {
  // Create notification
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    instanceId?: string;
    assignmentId?: string;
    forumPostId?: string;
  }) {
    // Check user settings
    const settings = await prisma.notificationSetting.findFirst({
      where: {
        userId: data.userId,
        type: data.type,
        channel: 'in_app',
      },
    });

    // If explicitly disabled, don't create
    if (settings && !settings.isEnabled) return null;

    return prisma.notification.create({ data });
  },

  // Get user notifications
  async getUserNotifications(
    userId: string,
    params?: {
      unreadOnly?: boolean;
      limit?: number;
      cursor?: string;
    }
  ) {
    const { unreadOnly = false, limit = 20, cursor } = params || {};

    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // Mark as read
  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  },

  // Mark all as read
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  // Update notification settings
  async updateSettings(
    userId: string,
    settings: Array<{
      type: NotificationType;
      channel: 'in_app' | 'email' | 'push';
      isEnabled: boolean;
    }>
  ) {
    const operations = settings.map((s) =>
      prisma.notificationSetting.upsert({
        where: {
          userId_type_channel: {
            userId,
            type: s.type,
            channel: s.channel,
          },
        },
        create: { userId, ...s },
        update: { isEnabled: s.isEnabled },
      })
    );

    return prisma.$transaction(operations);
  },
};

// ============================================================================
// FORUM QUERIES
// ============================================================================

export const forumQueries = {
  // Get forums for an instance
  async getInstanceForums(instanceId: string) {
    return prisma.forum.findMany({
      where: { instanceId },
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  },

  // Get forum with posts
  async getForumWithPosts(
    forumId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: 'recent' | 'popular';
    }
  ) {
    const { page = 1, limit = 20, sortBy = 'recent' } = params || {};

    const [forum, posts, total] = await Promise.all([
      prisma.forum.findUnique({
        where: { id: forumId },
        include: { instance: { include: { course: true } } },
      }),
      prisma.forumPost.findMany({
        where: { forumId },
        include: {
          author: true,
          tags: { include: { tag: true } },
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy:
          sortBy === 'recent'
            ? [{ isPinned: 'desc' }, { createdAt: 'desc' }]
            : [{ isPinned: 'desc' }, { viewCount: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumPost.count({ where: { forumId } }),
    ]);

    return { forum, posts, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  // Create post
  async createPost(data: {
    forumId: string;
    authorId: string;
    title: string;
    content: string;
    isAnonymous?: boolean;
    tagIds?: number[];
  }) {
    const post = await prisma.forumPost.create({
      data: {
        forumId: data.forumId,
        authorId: data.authorId,
        title: data.title,
        content: data.content,
        isAnonymous: data.isAnonymous ?? false,
        tags: data.tagIds
          ? {
              create: data.tagIds.map((tagId) => ({ tagId })),
            }
          : undefined,
      },
      include: {
        author: true,
        forum: { include: { instance: true } },
      },
    });

    return post;
  },

  // Get post with comments
  async getPostWithComments(postId: string, userId?: string) {
    // Increment view count
    await prisma.forumPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    });

    return prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: true,
        tags: { include: { tag: true } },
        reactions: userId ? { where: { userId } } : false,
        comments: {
          where: { parentId: null }, // Top-level comments only
          include: {
            author: true,
            reactions: userId ? { where: { userId } } : false,
            replies: {
              include: {
                author: true,
                reactions: userId ? { where: { userId } } : false,
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: [{ isAnswer: 'desc' }, { createdAt: 'asc' }],
        },
        _count: { select: { comments: true, reactions: true } },
      },
    });
  },

  // Add comment
  async addComment(data: {
    postId: string;
    authorId: string;
    content: string;
    parentId?: string;
    isAnonymous?: boolean;
  }) {
    const comment = await prisma.forumComment.create({
      data: {
        postId: data.postId,
        authorId: data.authorId,
        content: data.content,
        parentId: data.parentId,
        isAnonymous: data.isAnonymous ?? false,
      },
      include: {
        author: true,
        post: { include: { author: true } },
      },
    });

    // Notify post author
    if (comment.post.authorId !== data.authorId) {
      await notificationQueries.createNotification({
        userId: comment.post.authorId,
        type: 'forum_reply',
        title: 'New Reply',
        message: `Someone replied to your post "${comment.post.title}"`,
        data: { postId: data.postId, commentId: comment.id },
        forumPostId: data.postId,
      });
    }

    // If replying to a comment, notify parent comment author
    if (data.parentId) {
      const parentComment = await prisma.forumComment.findUnique({
        where: { id: data.parentId },
      });
      if (parentComment && parentComment.authorId !== data.authorId) {
        await notificationQueries.createNotification({
          userId: parentComment.authorId,
          type: 'forum_reply',
          title: 'New Reply',
          message: `Someone replied to your comment`,
          data: { postId: data.postId, commentId: comment.id },
          forumPostId: data.postId,
        });
      }
    }

    return comment;
  },

  // Mark comment as answer
  async markAsAnswer(commentId: string, postAuthorId: string) {
    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) throw new Error('Comment not found');
    if (comment.post.authorId !== postAuthorId) {
      throw new Error('Only post author can mark answers');
    }

    // Unmark any existing answer
    await prisma.forumComment.updateMany({
      where: { postId: comment.postId, isAnswer: true },
      data: { isAnswer: false },
    });

    return prisma.forumComment.update({
      where: { id: commentId },
      data: { isAnswer: true },
    });
  },

  // Add reaction to post
  async togglePostReaction(postId: string, userId: string, type: string) {
    const existing = await prisma.postReaction.findUnique({
      where: { postId_userId_type: { postId, userId, type } },
    });

    if (existing) {
      await prisma.postReaction.delete({
        where: { postId_userId_type: { postId, userId, type } },
      });
      return { action: 'removed' };
    } else {
      await prisma.postReaction.create({
        data: { postId, userId, type },
      });
      return { action: 'added' };
    }
  },

  // Search posts
  async searchPosts(instanceId: string, query: string) {
    return prisma.forumPost.findMany({
      where: {
        forum: { instanceId },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        author: true,
        forum: true,
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  },
};

// ============================================================================
// ANNOUNCEMENT QUERIES
// ============================================================================

export const announcementQueries = {
  // Create announcement
  async createAnnouncement(data: {
    instanceId: string;
    title: string;
    content: string;
    createdBy: string;
    isPinned?: boolean;
    publishNow?: boolean;
  }) {
    const announcement = await prisma.announcement.create({
      data: {
        instanceId: data.instanceId,
        title: data.title,
        content: data.content,
        createdBy: data.createdBy,
        isPinned: data.isPinned ?? false,
        publishedAt: data.publishNow ? new Date() : null,
      },
    });

    if (data.publishNow) {
      // Notify all enrolled students
      const enrollments = await prisma.enrollment.findMany({
        where: { instanceId: data.instanceId, status: 'enrolled' },
        select: { studentId: true },
      });

      await prisma.notification.createMany({
        data: enrollments.map((e) => ({
          userId: e.studentId,
          type: 'announcement' as NotificationType,
          title: 'New Announcement',
          message: data.title,
          data: { announcementId: announcement.id },
          instanceId: data.instanceId,
        })),
      });
    }

    return announcement;
  },

  // Get announcements for instance
  async getInstanceAnnouncements(instanceId: string) {
    return prisma.announcement.findMany({
      where: {
        instanceId,
        publishedAt: { not: null },
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });
  },
};

// ============================================================================
// DASHBOARD / ANALYTICS QUERIES
// ============================================================================

export const dashboardQueries = {
  // Teacher dashboard stats
  async getTeacherDashboard(teacherId: string) {
    const instances = await prisma.courseInstance.findMany({
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

    const instanceIds = instances.map((i) => i.id);

    // Pending submissions to grade
    const pendingSubmissions = await prisma.submission.count({
      where: {
        publishedAssignment: { instanceId: { in: instanceIds } },
        status: { in: ['submitted', 'late'] },
      },
    });

    // Recent forum activity
    const recentPosts = await prisma.forumPost.findMany({
      where: {
        forum: { instanceId: { in: instanceIds } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: true,
        forum: { include: { instance: { include: { course: true } } } },
      },
    });

    // Upcoming deadlines
    const upcomingDeadlines = await prisma.publishedAssignment.findMany({
      where: {
        instanceId: { in: instanceIds },
        status: 'published',
        deadline: { gte: new Date() },
      },
      orderBy: { deadline: 'asc' },
      take: 5,
      include: { instance: { include: { course: true } } },
    });

    return {
      activeInstances: instances,
      pendingSubmissions,
      recentPosts,
      upcomingDeadlines,
    };
  },

  // Student dashboard
  async getStudentDashboard(studentId: string) {
    const enrollments = await prisma.enrollment.findMany({
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

    const instanceIds = enrollments.map((e) => e.instanceId);

    // Upcoming assignments
    const upcomingAssignments = await prisma.publishedAssignment.findMany({
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
      take: 10,
      include: { instance: { include: { course: true } } },
    });

    // Recent grades
    const recentGrades = await prisma.submission.findMany({
      where: {
        studentId,
        status: 'graded',
        gradedAt: { not: null },
      },
      orderBy: { gradedAt: 'desc' },
      take: 5,
      include: {
        publishedAssignment: {
          include: { instance: { include: { course: true } } },
        },
      },
    });

    // Unread notifications count
    const unreadNotifications = await prisma.notification.count({
      where: { userId: studentId, isRead: false },
    });

    return {
      enrollments,
      upcomingAssignments,
      recentGrades,
      unreadNotifications,
    };
  },

  // Instance grade distribution (for teacher)
  async getInstanceGradeDistribution(instanceId: string, assignmentId?: string) {
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
  },
};

export default {
  enrollment: enrollmentQueries,
  submission: submissionQueries,
  notification: notificationQueries,
  forum: forumQueries,
  announcement: announcementQueries,
  dashboard: dashboardQueries,
};
