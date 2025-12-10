import httpStatus from 'http-status';
import { instanceService } from './instance.service';
import catchAsync from '@/shared/utils/catch-async';
import type { ApiResponse, PaginatedResponse, ExtendedUser } from '@/types/response';
import type {
  InstanceWithRelations,
  InstanceWithDetails,
  PublishedAssignmentWithCriteria,
  InstanceStats,
} from './instance.types';

// ============================================================================
// INSTANCE CONTROLLERS
// ============================================================================

/**
 * Create a new instance
 * POST /instances
 */
export const createInstance = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithRelations>> => {
    console.log('=== createInstance controller called ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);

    const userId = (req.user as ExtendedUser)!.id;
    console.log('userId:', userId);

    const data = {
      ...req.body,
      createdBy: userId,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    };
    console.log('data:', data);

    console.log('Calling instanceService.create...');
    const instance = await instanceService.create(data);
    console.log('Instance created:', instance?.id);

    return {
      statusCode: httpStatus.CREATED,
      message: 'Instance created successfully',
      data: instance,
    };
  }
);

/**
 * Get instance by ID
 * GET /instances/:id
 */
export const getInstance = catchAsync(async (req): Promise<ApiResponse<InstanceWithRelations>> => {
  const { id } = req.params;
  const instance = await instanceService.get(id);
  return {
    statusCode: httpStatus.OK,
    message: 'Instance retrieved successfully',
    data: instance,
  };
});

/**
 * Get instance with full details
 * GET /instances/:id/details
 */
export const getInstanceWithDetails = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithDetails>> => {
    const { id } = req.params;
    const instance = await instanceService.getWithDetails(id);
    return {
      statusCode: httpStatus.OK,
      message: 'Instance details retrieved successfully',
      data: instance,
    };
  }
);

/**
 * List instances
 * GET /instances
 */
export const listInstances = catchAsync(
  async (req): Promise<PaginatedResponse<InstanceWithRelations>> => {
    const { courseId, status, semester, lecturerId, page, limit, sortBy, sortOrder } = req.query;

    const filters = {
      courseId: courseId as string,
      status: status as any,
      semester: semester as string,
      lecturerId: lecturerId as string,
    };

    const options = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    const result = await instanceService.list(filters, options);
    return {
      statusCode: httpStatus.OK,
      message: 'Instances retrieved successfully',
      data: result.results,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.totalResults,
        totalPages: result.totalPages,
      },
    };
  }
);

/**
 * Get my instances (for students)
 * GET /instances/my/enrolled
 */
export const getMyEnrolledInstances = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithRelations[]>> => {
    const userId = (req.user as ExtendedUser)!.id;
    const instances = await instanceService.getStudentInstances(userId);
    return {
      statusCode: httpStatus.OK,
      message: 'Enrolled instances retrieved successfully',
      data: instances,
    };
  }
);

/**
 * Get my instances (for teachers)
 * GET /instances/my/teaching
 */
export const getMyTeachingInstances = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithRelations[]>> => {
    const userId = (req.user as ExtendedUser)!.id;
    const instances = await instanceService.getTeacherInstances(userId);
    return {
      statusCode: httpStatus.OK,
      message: 'Teaching instances retrieved successfully',
      data: instances,
    };
  }
);

/**
 * Update instance
 * PATCH /instances/:id
 */
export const updateInstance = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithRelations>> => {
    const { id } = req.params;
    const data = {
      ...req.body,
      ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
      ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
    };

    const instance = await instanceService.update(id, data);
    return {
      statusCode: httpStatus.OK,
      message: 'Instance updated successfully',
      data: instance,
    };
  }
);

/**
 * Update instance status
 * PATCH /instances/:id/status
 */
export const updateInstanceStatus = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithRelations>> => {
    const { id } = req.params;
    const { status } = req.body;

    const instance = await instanceService.updateStatus(id, status);
    return {
      statusCode: httpStatus.OK,
      message: 'Instance status updated successfully',
      data: instance,
    };
  }
);

/**
 * Toggle enrollment
 * PATCH /instances/:id/enrollment
 */
export const toggleEnrollment = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithRelations>> => {
    const { id } = req.params;
    const { isOpen, enrollmentOpen } = req.body;

    // Support both field names
    const shouldOpen = isOpen !== undefined ? isOpen : enrollmentOpen;

    const instance = await instanceService.toggleEnrollment(id, shouldOpen);
    return {
      statusCode: httpStatus.OK,
      message: `Enrollment ${shouldOpen ? 'opened' : 'closed'} successfully`,
      data: instance,
    };
  }
);

/**
 * Delete instance
 * DELETE /instances/:id
 */
export const deleteInstance = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { id } = req.params;
  await instanceService.delete(id);
  return {
    statusCode: httpStatus.NO_CONTENT,
    message: 'Instance deleted successfully',
  };
});

/**
 * Clone instance
 * POST /instances/:id/clone
 */
export const cloneInstance = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithRelations>> => {
    const { id } = req.params;
    const userId = (req.user as ExtendedUser)!.id;
    const { semester, startDate, endDate } = req.body;

    const instance = await instanceService.clone(
      id,
      semester,
      new Date(startDate),
      new Date(endDate),
      userId
    );

    return {
      statusCode: httpStatus.CREATED,
      message: 'Instance cloned successfully',
      data: instance,
    };
  }
);

/**
 * Get instance statistics
 * GET /instances/:id/stats
 */
export const getInstanceStats = catchAsync(async (req): Promise<ApiResponse<InstanceStats>> => {
  const { id } = req.params;
  const stats = await instanceService.getStats(id);
  return {
    statusCode: httpStatus.OK,
    message: 'Instance statistics retrieved successfully',
    data: stats,
  };
});

// ============================================================================
// PUBLISHED ASSIGNMENT CONTROLLERS
// ============================================================================

/**
 * Publish assignment from template
 * POST /instances/:id/assignments/publish
 */
export const publishAssignment = catchAsync(
  async (req): Promise<ApiResponse<PublishedAssignmentWithCriteria>> => {
    const { id } = req.params;
    const userId = (req.user as ExtendedUser)!.id;

    const data = {
      ...req.body,
      instanceId: id,
      publishedBy: userId,
      deadline: new Date(req.body.deadline),
      ...(req.body.publishAt && { publishAt: new Date(req.body.publishAt) }),
      ...(req.body.lateDeadline && { lateDeadline: new Date(req.body.lateDeadline) }),
    };

    const assignment = await instanceService.publishAssignment(data);
    return {
      statusCode: httpStatus.CREATED,
      message: 'Assignment published successfully',
      data: assignment,
    };
  }
);

/**
 * Get instance assignments
 * GET /instances/:id/assignments
 */
export const getInstanceAssignments = catchAsync(
  async (req): Promise<ApiResponse<PublishedAssignmentWithCriteria[]>> => {
    const { id } = req.params;
    const { status } = req.query;

    const assignments = await instanceService.getInstanceAssignments(id, status as string);
    return {
      statusCode: httpStatus.OK,
      message: 'Assignments retrieved successfully',
      data: assignments,
    };
  }
);

/**
 * Get published assignment
 * GET /instances/:id/assignments/:assignmentId
 */
export const getPublishedAssignment = catchAsync(
  async (req): Promise<ApiResponse<PublishedAssignmentWithCriteria>> => {
    const { assignmentId } = req.params;
    const assignment = await instanceService.getPublishedAssignment(assignmentId);
    return {
      statusCode: httpStatus.OK,
      message: 'Assignment retrieved successfully',
      data: assignment,
    };
  }
);

/**
 * Toggle assignment publish status
 * PATCH /instances/:id/assignments/:assignmentId/publish
 */
export const togglePublishStatus = catchAsync(
  async (req): Promise<ApiResponse<PublishedAssignmentWithCriteria>> => {
    const { assignmentId } = req.params;
    const { publish, status } = req.body;

    // Support both 'publish' boolean and 'status' string
    const shouldPublish = publish !== undefined ? publish : status === 'published';
    const statusValue = status || (shouldPublish ? 'published' : 'draft');

    const assignment = await instanceService.togglePublishStatus(assignmentId, statusValue);
    return {
      statusCode: httpStatus.OK,
      message: `Assignment ${shouldPublish ? 'published' : 'unpublished'} successfully`,
      data: assignment,
    };
  }
);

export const instanceController = {
  createInstance,
  getInstance,
  getInstanceWithDetails,
  listInstances,
  getMyEnrolledInstances,
  getMyTeachingInstances,
  updateInstance,
  updateInstanceStatus,
  toggleEnrollment,
  deleteInstance,
  cloneInstance,
  getInstanceStats,
  publishAssignment,
  getInstanceAssignments,
  getPublishedAssignment,
  togglePublishStatus,
};
