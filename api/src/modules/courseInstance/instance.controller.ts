import httpStatus from 'http-status';
import { instanceService } from './instance.service';
import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';
import type { ApiResponse, PaginatedResponse, ExtendedUser } from '@/types/response';
import type {
  InstanceWithRelations,
  InstanceWithDetails,
  PublishedAssignmentWithCriteria,
  InstanceStats,
  InstanceUpdateInput,
  PublishAssignmentInput,
} from './instance.types';
import * as instanceValidation from './instance.validation';

// ============================================================================
// INSTANCE CONTROLLERS
// ============================================================================

/**
 * Create a new instance
 * POST /instances
 */
export const createInstance = catchAsync(
  async (req): Promise<ApiResponse<InstanceWithRelations>> => {
    const { body } = await zParse(instanceValidation.createInstanceSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const data = {
      ...body,
      createdBy: userId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };

    const instance = await instanceService.create(data);

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
  const { params } = await zParse(instanceValidation.getInstanceSchema, req);
  const instance = await instanceService.get(params.id);
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
    const { params } = await zParse(instanceValidation.getInstanceSchema, req);
    const instance = await instanceService.getWithDetails(params.id);
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
    const { query } = await zParse(instanceValidation.listInstancesSchema, req);

    const filters = {
      courseId: query.courseId,
      status: query.status,
      semester: query.semester,
      lecturerId: query.lecturerId,
    };

    const options = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
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
    const { params, body } = await zParse(instanceValidation.updateInstanceSchema, req);
    const data = {
      ...body,
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
    } as InstanceUpdateInput;

    const instance = await instanceService.update(params.id, data);
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
    const { params, body } = await zParse(instanceValidation.updateInstanceStatusSchema, req);

    const instance = await instanceService.updateStatus(params.id, body.status);
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
    const { params, body } = await zParse(instanceValidation.toggleEnrollmentSchema, req);

    const instance = await instanceService.toggleEnrollment(params.id, body.isOpen);
    return {
      statusCode: httpStatus.OK,
      message: `Enrollment ${instance.enrollmentOpen ? 'opened' : 'closed'} successfully`,
      data: instance,
    };
  }
);

/**
 * Delete instance
 * DELETE /instances/:id
 */
export const deleteInstance = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(instanceValidation.deleteInstanceSchema, req);
  await instanceService.delete(params.id);
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
    const { params, body } = await zParse(instanceValidation.cloneInstanceSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const instance = await instanceService.clone(
      params.id,
      body.semester,
      new Date(body.startDate),
      new Date(body.endDate),
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
  const { params } = await zParse(instanceValidation.getInstanceSchema, req);
  const stats = await instanceService.getStats(params.id);
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
    const { params, body } = await zParse(instanceValidation.publishAssignmentSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const data = {
      ...body,
      instanceId: params.id,
      publishedBy: userId,
      deadline: new Date(body.deadline),
      ...(body.publishAt && { publishAt: new Date(body.publishAt) }),
      ...(body.lateDeadline && { lateDeadline: new Date(body.lateDeadline) }),
    } as PublishAssignmentInput;

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
    const { params, query } = await zParse(instanceValidation.getInstanceAssignmentsSchema, req);

    const assignments = await instanceService.getInstanceAssignments(params.id, query.status);
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
    const { params } = await zParse(instanceValidation.getPublishedAssignmentSchema, req);
    const assignment = await instanceService.getPublishedAssignment(params.assignmentId);
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
    const { params, body } = await zParse(instanceValidation.togglePublishStatusSchema, req);

    const statusValue = body.publish ? 'published' : 'draft';

    const assignment = await instanceService.togglePublishStatus(params.assignmentId, statusValue);
    return {
      statusCode: httpStatus.OK,
      message: `Assignment ${assignment.status === 'published' ? 'published' : 'unpublished'} successfully`,
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
