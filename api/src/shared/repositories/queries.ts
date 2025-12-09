// queries.ts

import { PrismaClient, InstanceStatus, EnrollmentStatus, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// USER & AUTHENTICATION QUERIES
// ============================================================================

export const userQueries = {
  // Create user with role
  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roleName: 'student' | 'teacher' | 'admin';
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: {
          create: {
            role: {
              connect: { name: data.roleName },
            },
          },
        },
        // Create profile based on role
        ...(data.roleName === 'student' && {
          studentProfile: { create: {} },
        }),
        ...(data.roleName === 'teacher' && {
          teacherProfile: { create: {} },
        }),
      },
      include: {
        roles: { include: { role: true } },
        studentProfile: true,
        teacherProfile: true,
      },
    });
  },

  // Get user with all relations
  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        studentProfile: true,
        teacherProfile: true,
      },
    });
  },

  // Get user by email (for auth)
  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: true } },
      },
    });
  },

  // Check if user has role
  async userHasRole(userId: string, roleName: string) {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: { name: roleName },
      },
    });
    return !!userRole;
  },

  // Add role to user
  async addRoleToUser(userId: string, roleName: string, grantedBy?: string) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Role ${roleName} not found`);

    return prisma.userRole.create({
      data: {
        userId,
        roleId: role.id,
        grantedBy,
      },
    });
  },
};

// ============================================================================
// COURSE TEMPLATE QUERIES
// ============================================================================

export const courseQueries = {
  // Create course with full structure
  async createCourse(data: {
    code: string;
    title: string;
    description?: string;
    credits?: number;
    createdBy: string;
    tags?: string[];
    lecturerIds?: string[];
  }) {
    return prisma.course.create({
      data: {
        code: data.code,
        title: data.title,
        description: data.description,
        credits: data.credits,
        createdBy: data.createdBy,
        tags: data.tags
          ? {
              create: data.tags.map((tagName) => ({
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              })),
            }
          : undefined,
        lecturers: data.lecturerIds
          ? {
              create: data.lecturerIds.map((id, index) => ({
                userId: id,
                isPrimary: index === 0,
              })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        lecturers: { include: { user: true } },
      },
    });
  },

  // Get course with all templates
  async getCourseWithTemplates(courseId: string) {
    return prisma.course.findUnique({
      where: { id: courseId },
      include: {
        tags: { include: { tag: true } },
        lecturers: { include: { user: true } },
        syllabusItems: { orderBy: { sortOrder: 'asc' } },
        assignmentTemplates: {
          orderBy: { sortOrder: 'asc' },
          include: { gradingCriteria: { orderBy: { sortOrder: 'asc' } } },
        },
        resourceTemplates: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  // List all courses with filters
  async listCourses(params: {
    search?: string;
    tagIds?: number[];
    includeArchived?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { search, tagIds, includeArchived = false, page = 1, limit = 20 } = params;

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(tagIds?.length && {
        tags: { some: { tagId: { in: tagIds } } },
      }),
      ...(!includeArchived && { isArchived: false }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          tags: { include: { tag: true } },
          lecturers: { include: { user: true } },
          _count: { select: { instances: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { title: 'asc' },
      }),
      prisma.course.count({ where }),
    ]);

    return { courses, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};

// ============================================================================
// ASSIGNMENT TEMPLATE QUERIES
// ============================================================================

export const assignmentTemplateQueries = {
  // Create assignment template with grading criteria
  async createAssignmentTemplate(data: {
    courseId: string;
    title: string;
    description?: string;
    assignmentType: 'homework' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation';
    gradingMode: 'points' | 'pass_fail';
    maxPoints?: number;
    weightPercentage?: number;
    defaultDurationDays?: number;
    instructions?: string;
    syllabusItemId?: string;
    gradingCriteria?: Array<{
      name: string;
      description?: string;
      maxPoints: number;
    }>;
  }) {
    return prisma.assignmentTemplate.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description,
        assignmentType: data.assignmentType,
        gradingMode: data.gradingMode,
        maxPoints: data.maxPoints,
        weightPercentage: data.weightPercentage,
        defaultDurationDays: data.defaultDurationDays,
        instructions: data.instructions,
        syllabusItemId: data.syllabusItemId,
        gradingCriteria: data.gradingCriteria
          ? {
              create: data.gradingCriteria.map((c, index) => ({
                name: c.name,
                description: c.description,
                maxPoints: c.maxPoints,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },

  // Get all assignment templates for a course (grading criteria tab)
  async getGradingStructure(courseId: string) {
    return prisma.assignmentTemplate.findMany({
      where: { courseId },
      orderBy: { sortOrder: 'asc' },
      include: {
        gradingCriteria: { orderBy: { sortOrder: 'asc' } },
        syllabusItem: true,
      },
    });
  },

  // Update assignment template
  async updateAssignmentTemplate(
    templateId: string,
    data: {
      title?: string;
      description?: string;
      maxPoints?: number;
      weightPercentage?: number;
      instructions?: string;
    }
  ) {
    return prisma.assignmentTemplate.update({
      where: { id: templateId },
      data,
      include: {
        gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      },
    });
  },
};

// ============================================================================
// COURSE INSTANCE QUERIES
// ============================================================================

export const instanceQueries = {
  // Create course instance from template
  async createInstance(data: {
    courseId: string;
    semester: string;
    startDate: Date;
    endDate: Date;
    createdBy: string;
    lecturerIds?: string[];
    enrollmentLimit?: number;
  }) {
    return prisma.courseInstance.create({
      data: {
        courseId: data.courseId,
        semester: data.semester,
        startDate: data.startDate,
        endDate: data.endDate,
        createdBy: data.createdBy,
        enrollmentLimit: data.enrollmentLimit,
        status: 'draft',
        lecturers: data.lecturerIds
          ? {
              create: data.lecturerIds.map((id) => ({
                userId: id,
                role: 'lecturer',
              })),
            }
          : undefined,
        // Auto-create default forums
        forums: {
          create: [
            { title: 'General Discussion', forumType: 'general', sortOrder: 0 },
            { title: 'Q&A', forumType: 'qa', sortOrder: 1 },
            { title: 'Announcements', forumType: 'announcements', sortOrder: 2 },
          ],
        },
      },
      include: {
        course: true,
        lecturers: { include: { user: true } },
        forums: true,
      },
    });
  },

  // Get instance with full details
  async getInstanceWithDetails(instanceId: string) {
    return prisma.courseInstance.findUnique({
      where: { id: instanceId },
      include: {
        course: {
          include: {
            tags: { include: { tag: true } },
            syllabusItems: { orderBy: { sortOrder: 'asc' } },
            assignmentTemplates: {
              orderBy: { sortOrder: 'asc' },
              include: { gradingCriteria: { orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
        lecturers: { include: { user: true } },
        publishedAssignments: {
          orderBy: { createdAt: 'asc' },
          include: { gradingCriteria: { orderBy: { sortOrder: 'asc' } } },
        },
        publishedResources: { orderBy: { sortOrder: 'asc' } },
        forums: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { enrollments: true } },
      },
    });
  },

  // List active instances for a student
  async getStudentInstances(studentId: string) {
    return prisma.courseInstance.findMany({
      where: {
        enrollments: {
          some: {
            studentId,
            status: 'enrolled',
          },
        },
        status: { in: ['active', 'scheduled'] },
      },
      include: {
        course: true,
        lecturers: { include: { user: true } },
        _count: {
          select: {
            publishedAssignments: { where: { status: 'published' } },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  },

  // List instances for a teacher
  async getTeacherInstances(teacherId: string) {
    return prisma.courseInstance.findMany({
      where: {
        lecturers: { some: { userId: teacherId } },
      },
      include: {
        course: true,
        _count: {
          select: {
            enrollments: { where: { status: 'enrolled' } },
            publishedAssignments: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });
  },

  // Update instance status
  async updateInstanceStatus(instanceId: string, status: InstanceStatus) {
    return prisma.courseInstance.update({
      where: { id: instanceId },
      data: { status },
    });
  },

  // Open/close enrollment
  async toggleEnrollment(instanceId: string, isOpen: boolean) {
    return prisma.courseInstance.update({
      where: { id: instanceId },
      data: { enrollmentOpen: isOpen },
    });
  },
};

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
// PUBLISHED ASSIGNMENT QUERIES
// ============================================================================

export const publishedAssignmentQueries = {
  // Publish assignment from template
  async publishFromTemplate(data: {
    instanceId: string;
    templateId: string;
    publishAt?: Date;
    deadline: Date;
    lateDeadline?: Date;
    latePenaltyPercent?: number;
    autoPublish?: boolean;
    publishedBy: string;
  }) {
    const template = await prisma.assignmentTemplate.findUnique({
      where: { id: data.templateId },
      include: { gradingCriteria: true },
    });

    if (!template) throw new Error('Template not found');

    const status =
      data.autoPublish && data.publishAt && data.publishAt <= new Date()
        ? 'published'
        : data.autoPublish
          ? 'scheduled'
          : 'draft';

    const published = await prisma.publishedAssignment.create({
      data: {
        instanceId: data.instanceId,
        templateId: data.templateId,
        title: template.title,
        description: template.description,
        assignmentType: template.assignmentType,
        gradingMode: template.gradingMode,
        maxPoints: template.maxPoints,
        weightPercentage: template.weightPercentage,
        instructions: template.instructions,
        ...(template.attachments && { attachments: template.attachments }),
        publishAt: data.publishAt,
        deadline: data.deadline,
        lateDeadline: data.lateDeadline,
        latePenaltyPercent: data.latePenaltyPercent,
        autoPublish: data.autoPublish ?? false,
        status,
        publishedBy: data.publishedBy,
        gradingCriteria: {
          create: template.gradingCriteria.map((c) => ({
            templateCriteriaId: c.id,
            name: c.name,
            description: c.description,
            maxPoints: c.maxPoints,
            sortOrder: c.sortOrder,
          })),
        },
      },
      include: {
        gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      },
    });

    // If published immediately, notify students
    if (status === 'published') {
      await notifyStudentsOfAssignment(data.instanceId, published.id, published.title);
    }

    return published;
  },

  // Manually publish/unpublish
  async togglePublishStatus(assignmentId: string, publish: boolean) {
    const assignment = await prisma.publishedAssignment.update({
      where: { id: assignmentId },
      data: {
        status: publish ? 'published' : 'draft',
        ...(publish && { publishAt: new Date() }),
      },
      include: { instance: true },
    });

    if (publish) {
      await notifyStudentsOfAssignment(assignment.instanceId, assignment.id, assignment.title);
    }

    return assignment;
  },

  // Get assignments for student view
  async getStudentAssignments(instanceId: string, studentId: string) {
    return prisma.publishedAssignment.findMany({
      where: {
        instanceId,
        status: 'published',
      },
      include: {
        gradingCriteria: { orderBy: { sortOrder: 'asc' } },
        submissions: {
          where: { studentId },
          include: {
            grades: true,
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });
  },

  // Get all assignments for teacher grading view
  async getTeacherAssignments(instanceId: string) {
    return prisma.publishedAssignment.findMany({
      where: { instanceId },
      include: {
        gradingCriteria: { orderBy: { sortOrder: 'asc' } },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  // Get assignment with all submissions (for grading)
  async getAssignmentWithSubmissions(assignmentId: string) {
    return prisma.publishedAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        gradingCriteria: { orderBy: { sortOrder: 'asc' } },
        submissions: {
          include: {
            student: true,
            grades: {
              include: { publishedCriteria: true },
            },
          },
          orderBy: { student: { lastName: 'asc' } },
        },
      },
    });
  },

  // Auto-publish scheduled assignments (run via cron)
  async processScheduledAssignments() {
    const now = new Date();

    const toPublish = await prisma.publishedAssignment.findMany({
      where: {
        status: 'scheduled',
        autoPublish: true,
        publishAt: { lte: now },
      },
    });

    for (const assignment of toPublish) {
      await prisma.publishedAssignment.update({
        where: { id: assignment.id },
        data: { status: 'published' },
      });

      await notifyStudentsOfAssignment(assignment.instanceId, assignment.id, assignment.title);
    }

    return toPublish.length;
  },
};

async function notifyStudentsOfAssignment(instanceId: string, assignmentId: string, title: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { instanceId, status: 'enrolled' },
    select: { studentId: true },
  });

  await prisma.notification.createMany({
    data: enrollments.map((e) => ({
      userId: e.studentId,
      type: 'assignment_published' as NotificationType,
      title: 'New Assignment',
      message: `A new assignment "${title}" has been published`,
      data: { instanceId, assignmentId },
      instanceId,
      assignmentId,
    })),
  });
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
  user: userQueries,
  course: courseQueries,
  assignmentTemplate: assignmentTemplateQueries,
  instance: instanceQueries,
  enrollment: enrollmentQueries,
  publishedAssignment: publishedAssignmentQueries,
  submission: submissionQueries,
  notification: notificationQueries,
  forum: forumQueries,
  announcement: announcementQueries,
  dashboard: dashboardQueries,
};
