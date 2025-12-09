import { InstanceStatus } from '@prisma/client';
import ApiError from '@/shared/utils/api-error';
import { courseRepository } from '@/modules/course/course.repository';
import { instanceRepository } from './instance.repository';
import { PaginationOptions, PaginatedResult } from '@/shared/repositories/base.repository';
import type {
  InstanceCreateInput,
  InstanceUpdateInput,
  InstanceListFilters,
  InstanceWithRelations,
  InstanceWithDetails,
  PublishAssignmentInput,
  PublishedAssignmentWithCriteria,
  InstanceStats,
} from './instance.types';
import httpStatus from 'http-status';

// ============================================================================
// INSTANCE SERVICE FUNCTIONS
// ============================================================================

/**
 * Create a new course instance
 */
export const createInstance = async (data: InstanceCreateInput): Promise<InstanceWithRelations> => {
  // Verify course exists
  const course = await courseRepository.findById(data.courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  // Validate dates
  if (data.startDate >= data.endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'End date must be after start date');
  }

  return instanceRepository.create(data);
};

/**
 * Get instance by ID
 */
export const getInstance = async (instanceId: string): Promise<InstanceWithRelations> => {
  const instance = await instanceRepository.getWithRelations(instanceId);
  if (!instance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }
  return instance;
};

/**
 * Get instance with full details
 */
export const getInstanceWithDetails = async (instanceId: string): Promise<InstanceWithDetails> => {
  const instance = await instanceRepository.getWithDetails(instanceId);
  if (!instance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }
  return instance;
};

/**
 * List instances with filters
 */
export const listInstances = async (
  filters: InstanceListFilters = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<InstanceWithRelations>> => {
  return instanceRepository.list(filters, options);
};

/**
 * Get instances for a student
 */
export const getStudentInstances = async (studentId: string): Promise<InstanceWithRelations[]> => {
  return instanceRepository.getStudentInstances(studentId);
};

/**
 * Get instances for a teacher
 */
export const getTeacherInstances = async (teacherId: string): Promise<InstanceWithRelations[]> => {
  return instanceRepository.getTeacherInstances(teacherId);
};

/**
 * Update instance
 */
export const updateInstance = async (
  instanceId: string,
  data: InstanceUpdateInput
): Promise<InstanceWithRelations> => {
  const existing = await instanceRepository.findById(instanceId);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }

  // Validate dates if both provided
  const startDate = data.startDate || existing.startDate;
  const endDate = data.endDate || existing.endDate;
  if (startDate >= endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'End date must be after start date');
  }

  return instanceRepository.update(instanceId, data);
};

/**
 * Update instance status
 */
export const updateInstanceStatus = async (
  instanceId: string,
  status: InstanceStatus
): Promise<InstanceWithRelations> => {
  const existing = await instanceRepository.findById(instanceId);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }

  // Validate status transitions
  const validTransitions: Record<InstanceStatus, InstanceStatus[]> = {
    draft: ['scheduled', 'active'],
    scheduled: ['active', 'draft'],
    active: ['completed', 'archived'],
    completed: ['archived'],
    archived: [],
  };

  if (!validTransitions[existing.status].includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot transition from ${existing.status} to ${status}`
    );
  }

  await instanceRepository.updateStatus(instanceId, status);
  return instanceRepository.getWithRelations(instanceId) as Promise<InstanceWithRelations>;
};

/**
 * Toggle enrollment open/close
 */
export const toggleEnrollment = async (
  instanceId: string,
  isOpen: boolean
): Promise<InstanceWithRelations> => {
  const existing = await instanceRepository.findById(instanceId);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }

  await instanceRepository.toggleEnrollment(instanceId, isOpen);
  return instanceRepository.getWithRelations(instanceId) as Promise<InstanceWithRelations>;
};

/**
 * Delete instance
 */
export const deleteInstance = async (instanceId: string): Promise<void> => {
  const existing = await instanceRepository.getWithRelations(instanceId);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }

  // Check if instance has enrollments
  if (existing._count && existing._count.enrollments > 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete instance with active enrollments');
  }

  await instanceRepository.delete(instanceId);
};

/**
 * Clone instance to new semester
 */
export const cloneInstance = async (
  instanceId: string,
  newSemester: string,
  startDate: Date,
  endDate: Date,
  userId: string
): Promise<InstanceWithRelations> => {
  const source = await instanceRepository.getWithDetails(instanceId);
  if (!source) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }

  // Create new instance
  const newInstance = await instanceRepository.create({
    courseId: source.courseId,
    semester: newSemester,
    startDate,
    endDate,
    createdBy: userId,
    enrollmentLimit: source.enrollmentLimit,
    lecturerIds: source.lecturers?.map((l) => l.userId),
  });

  return newInstance;
};

// ============================================================================
// PUBLISHED ASSIGNMENT SERVICE FUNCTIONS
// ============================================================================

/**
 * Publish assignment from template
 */
export const publishAssignment = async (
  data: PublishAssignmentInput
): Promise<PublishedAssignmentWithCriteria> => {
  // Verify instance exists
  const instance = await instanceRepository.findById(data.instanceId);
  if (!instance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }

  // Validate deadline
  if (data.deadline <= new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Deadline must be in the future');
  }

  if (data.lateDeadline && data.lateDeadline <= data.deadline) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Late deadline must be after regular deadline');
  }

  return instanceRepository.publishAssignment(data);
};

/**
 * Get published assignments for an instance
 */
export const getInstanceAssignments = async (
  instanceId: string,
  statusFilter?: string
): Promise<PublishedAssignmentWithCriteria[]> => {
  const instance = await instanceRepository.findById(instanceId);
  if (!instance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }

  return instanceRepository.getInstanceAssignments(instanceId, statusFilter);
};

/**
 * Get published assignment by ID
 */
export const getPublishedAssignment = async (
  assignmentId: string
): Promise<PublishedAssignmentWithCriteria> => {
  const assignment = await instanceRepository.getPublishedAssignment(assignmentId);
  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Published assignment not found');
  }
  return assignment;
};

/**
 * Toggle publish status
 */
export const togglePublishStatus = async (
  assignmentId: string,
  publish: boolean
): Promise<PublishedAssignmentWithCriteria> => {
  const existing = await instanceRepository.getPublishedAssignment(assignmentId);
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Published assignment not found');
  }

  await instanceRepository.togglePublishStatus(assignmentId, publish);
  return instanceRepository.getPublishedAssignment(
    assignmentId
  ) as Promise<PublishedAssignmentWithCriteria>;
};

/**
 * Get instance statistics
 */
export const getInstanceStats = async (instanceId: string): Promise<InstanceStats> => {
  const instance = await instanceRepository.getWithRelations(instanceId);
  if (!instance) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Instance not found');
  }

  // For now return basic stats. Can be expanded with submission stats.
  return {
    instanceId,
    courseCode: instance.course?.code || '',
    courseTitle: instance.course?.title || '',
    semester: instance.semester || '',
    status: instance.status,
    enrollmentCount: instance._count?.enrollments || 0,
    enrollmentLimit: instance.enrollmentLimit,
    assignmentCount: instance._count?.publishedAssignments || 0,
    resourceCount: instance._count?.publishedResources || 0,
    submissionStats: {
      total: 0,
      pending: 0,
      graded: 0,
    },
  };
};

/**
 * Check if user can access instance
 */
export const canAccessInstance = async (
  instanceId: string,
  userId: string,
  roles: string[]
): Promise<boolean> => {
  if (roles.includes('admin')) return true;

  const isLecturer = await instanceRepository.isLecturer(instanceId, userId);
  if (isLecturer) return true;

  // Check if student is enrolled
  // This would need enrollment repository
  return false;
};

// ============================================================================
// SERVICE EXPORT
// ============================================================================

export const instanceService = {
  // Instance operations
  create: createInstance,
  get: getInstance,
  getWithDetails: getInstanceWithDetails,
  list: listInstances,
  update: updateInstance,
  updateStatus: updateInstanceStatus,
  toggleEnrollment,
  delete: deleteInstance,
  clone: cloneInstance,
  getStats: getInstanceStats,

  // User views
  getStudentInstances,
  getTeacherInstances,

  // Published assignments
  publishAssignment,
  getInstanceAssignments,
  getPublishedAssignment,
  togglePublishStatus,

  // Access control
  canAccess: canAccessInstance,
};
