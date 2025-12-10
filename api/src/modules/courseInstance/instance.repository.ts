import {
  Prisma,
  CourseInstance,
  InstanceStatus,
  PublishedAssignment,
  NotificationType,
} from '@prisma/client';
import prisma from '@/client';
import { PaginationOptions, PaginatedResult } from '@/shared/repositories/base.repository';
import type {
  InstanceCreateInput,
  InstanceUpdateInput,
  InstanceListFilters,
  InstanceWithRelations,
  InstanceWithDetails,
  PublishAssignmentInput,
  PublishedAssignmentWithCriteria,
} from './instance.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const transformInstance = (instance: any): InstanceWithRelations => {
  if (!instance) return instance;
  return {
    ...instance,
    course: instance.course
      ? {
          ...instance.course,
          credits: instance.course.credits ? Number(instance.course.credits) : null,
        }
      : undefined,
  };
};

const transformAssignment = (assignment: any): PublishedAssignmentWithCriteria => {
  if (!assignment) return assignment;
  return {
    ...assignment,
    maxPoints: assignment.maxPoints ? Number(assignment.maxPoints) : null,
    weightPercentage: assignment.weightPercentage ? Number(assignment.weightPercentage) : null,
    latePenaltyPercent: assignment.latePenaltyPercent
      ? Number(assignment.latePenaltyPercent)
      : null,
    gradingCriteria: assignment.gradingCriteria?.map((c: any) => ({
      ...c,
      maxPoints: c.maxPoints ? Number(c.maxPoints) : c.maxPoints,
    })),
  };
};

// ============================================================================
// INSTANCE REPOSITORY FUNCTIONS
// ============================================================================

/**
 * Create a new course instance
 */
export const createInstance = async (data: InstanceCreateInput): Promise<InstanceWithRelations> => {
  const result = await prisma.courseInstance.create({
    data: {
      courseId: data.courseId,
      semester: data.semester,
      startDate: data.startDate,
      endDate: data.endDate,
      createdBy: data.createdBy,
      enrollmentLimit: data.enrollmentLimit,
      enrollmentOpen: data.enrollmentOpen ?? false,
      status: 'draft',
      lecturers: data.lecturerIds
        ? {
            create: data.lecturerIds.map((id, index) => ({
              userId: id,
              role: index === 0 ? 'primary_lecturer' : 'lecturer',
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
      course: {
        select: { id: true, code: true, title: true, description: true, credits: true },
      },
      lecturers: {
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      },
      forums: { orderBy: { sortOrder: 'asc' } },
      _count: {
        select: { enrollments: true, publishedAssignments: true, publishedResources: true },
      },
    },
  });

  return transformInstance(result);
};

/**
 * Get instance by ID
 */
export const findInstanceById = async (instanceId: string): Promise<CourseInstance | null> => {
  return prisma.courseInstance.findUnique({
    where: { id: instanceId },
  });
};

/**
 * Get instance with relations
 */
export const getInstanceWithRelations = async (
  instanceId: string
): Promise<InstanceWithRelations | null> => {
  const result = await prisma.courseInstance.findUnique({
    where: { id: instanceId },
    include: {
      course: {
        select: { id: true, code: true, title: true, description: true, credits: true },
      },
      lecturers: {
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      },
      forums: { orderBy: { sortOrder: 'asc' } },
      _count: {
        select: { enrollments: true, publishedAssignments: true, publishedResources: true },
      },
    },
  });

  return result ? transformInstance(result) : null;
};

/**
 * Get instance with full details (including assignments and resources)
 */
export const getInstanceWithDetails = async (
  instanceId: string
): Promise<InstanceWithDetails | null> => {
  const result = await prisma.courseInstance.findUnique({
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
      lecturers: {
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      },
      publishedAssignments: {
        orderBy: { createdAt: 'asc' },
        include: { gradingCriteria: { orderBy: { sortOrder: 'asc' } } },
      },
      publishedResources: { orderBy: { sortOrder: 'asc' } },
      forums: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { enrollments: true } },
    },
  });

  return result ? transformInstance(result) : null;
};

/**
 * List instances with filters and pagination
 */
export const listInstances = async (
  filters: InstanceListFilters = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<InstanceWithRelations>> => {
  const { courseId, status, semester, lecturerId, studentId } = filters;
  const { page = 1, limit = 20, sortBy = 'startDate', sortOrder = 'desc' } = options;

  const where: Prisma.CourseInstanceWhereInput = {
    ...(courseId && { courseId }),
    ...(status && { status }),
    ...(semester && { semester: { contains: semester, mode: 'insensitive' } }),
    ...(lecturerId && { lecturers: { some: { userId: lecturerId } } }),
    ...(studentId && {
      enrollments: { some: { studentId, status: 'enrolled' } },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.courseInstance.findMany({
      where,
      include: {
        course: {
          select: { id: true, code: true, title: true, description: true, credits: true },
        },
        lecturers: {
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        },
        _count: { select: { enrollments: true, publishedAssignments: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.courseInstance.count({ where }),
  ]);

  return {
    results: items.map(transformInstance),
    totalResults: total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get instances for a student
 */
export const getStudentInstances = async (studentId: string): Promise<InstanceWithRelations[]> => {
  const results = await prisma.courseInstance.findMany({
    where: {
      enrollments: {
        some: { studentId, status: 'enrolled' },
      },
      status: { in: ['active', 'scheduled'] },
    },
    include: {
      course: {
        select: { id: true, code: true, title: true, description: true, credits: true },
      },
      lecturers: {
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      },
      _count: {
        select: {
          publishedAssignments: { where: { status: 'published' } },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  return results.map(transformInstance);
};

/**
 * Get instances for a teacher
 */
export const getTeacherInstances = async (teacherId: string): Promise<InstanceWithRelations[]> => {
  const results = await prisma.courseInstance.findMany({
    where: {
      lecturers: { some: { userId: teacherId } },
    },
    include: {
      course: {
        select: { id: true, code: true, title: true, description: true, credits: true },
      },
      _count: {
        select: {
          enrollments: { where: { status: 'enrolled' } },
          publishedAssignments: true,
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  return results.map(transformInstance);
};

/**
 * Update instance
 */
export const updateInstance = async (
  instanceId: string,
  data: InstanceUpdateInput
): Promise<InstanceWithRelations> => {
  const result = await prisma.courseInstance.update({
    where: { id: instanceId },
    data,
    include: {
      course: {
        select: { id: true, code: true, title: true, description: true, credits: true },
      },
      lecturers: {
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      },
      _count: { select: { enrollments: true, publishedAssignments: true } },
    },
  });

  return transformInstance(result);
};

/**
 * Update instance status
 */
export const updateInstanceStatus = async (
  instanceId: string,
  status: InstanceStatus
): Promise<CourseInstance> => {
  return prisma.courseInstance.update({
    where: { id: instanceId },
    data: { status },
  });
};

/**
 * Toggle enrollment open/close
 */
export const toggleEnrollment = async (
  instanceId: string,
  isOpen: boolean
): Promise<CourseInstance> => {
  return prisma.courseInstance.update({
    where: { id: instanceId },
    data: { enrollmentOpen: isOpen },
  });
};

/**
 * Delete instance
 */
export const deleteInstance = async (instanceId: string): Promise<CourseInstance> => {
  return prisma.courseInstance.delete({
    where: { id: instanceId },
  });
};

/**
 * Check if user is instance lecturer
 */
export const isInstanceLecturer = async (instanceId: string, userId: string): Promise<boolean> => {
  const lecturer = await prisma.instanceLecturer.findUnique({
    where: {
      instanceId_userId: { instanceId, userId },
    },
  });
  return !!lecturer;
};

// ============================================================================
// PUBLISHED ASSIGNMENT FUNCTIONS
// ============================================================================

/**
 * Publish assignment from template
 */
export const publishAssignment = async (
  data: PublishAssignmentInput
): Promise<PublishedAssignmentWithCriteria> => {
  const template = await prisma.assignmentTemplate.findUnique({
    where: { id: data.templateId },
    include: { gradingCriteria: true },
  });

  if (!template) throw new Error('Assignment template not found');

  const status =
    data.autoPublish && data.publishAt && data.publishAt <= new Date()
      ? 'published'
      : data.autoPublish
        ? 'scheduled'
        : 'draft';

  const result = await prisma.publishedAssignment.create({
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
      template: { select: { id: true, title: true } },
    },
  });

  // If published immediately, notify students
  if (status === 'published') {
    await notifyStudentsOfAssignment(data.instanceId, result.id, result.title);
  }

  return transformAssignment(result);
};

/**
 * Get published assignments for an instance
 */
export const getInstanceAssignments = async (
  instanceId: string,
  statusFilter?: string
): Promise<PublishedAssignmentWithCriteria[]> => {
  const where: Prisma.PublishedAssignmentWhereInput = {
    instanceId,
    ...(statusFilter && { status: statusFilter as any }),
  };

  const results = await prisma.publishedAssignment.findMany({
    where,
    include: {
      gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return results.map(transformAssignment);
};

/**
 * Get published assignment by ID
 */
export const getPublishedAssignment = async (
  assignmentId: string
): Promise<PublishedAssignmentWithCriteria | null> => {
  const result = await prisma.publishedAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      gradingCriteria: { orderBy: { sortOrder: 'asc' } },
      template: { select: { id: true, title: true } },
      _count: { select: { submissions: true } },
    },
  });

  return result ? transformAssignment(result) : null;
};

/**
 * Toggle publish status
 */
export const togglePublishStatus = async (
  assignmentId: string,
  status: string
): Promise<PublishedAssignment> => {
  const assignment = await prisma.publishedAssignment.update({
    where: { id: assignmentId },
    data: {
      status: status as any,
      ...(status === 'published' && { publishAt: new Date() }),
    },
    include: { instance: true },
  });

  if (status === 'published') {
    await notifyStudentsOfAssignment(assignment.instanceId, assignment.id, assignment.title);
  }

  return assignment;
};

/**
 * Process scheduled assignments (for cron job)
 */
export const processScheduledAssignments = async (): Promise<number> => {
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
};

// Helper function to notify students
async function notifyStudentsOfAssignment(instanceId: string, assignmentId: string, title: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { instanceId, status: 'enrolled' },
    select: { studentId: true },
  });

  if (enrollments.length > 0) {
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
}

// ============================================================================
// REPOSITORY EXPORT
// ============================================================================

export const instanceRepository = {
  // Instance CRUD
  create: createInstance,
  findById: findInstanceById,
  getWithRelations: getInstanceWithRelations,
  getWithDetails: getInstanceWithDetails,
  list: listInstances,
  update: updateInstance,
  updateStatus: updateInstanceStatus,
  toggleEnrollment,
  delete: deleteInstance,
  isLecturer: isInstanceLecturer,

  // Student/Teacher views
  getStudentInstances,
  getTeacherInstances,

  // Published assignments
  publishAssignment,
  getInstanceAssignments,
  getPublishedAssignment,
  togglePublishStatus,
  processScheduledAssignments,
};
