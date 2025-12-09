import { Request, Response } from 'express';
import { instanceService } from './instance.service';
import catchAsync from '@/shared/utils/catch-async';
import { ExtendedUser } from '@/types/response';

// ============================================================================
// INSTANCE CONTROLLERS
// ============================================================================

/**
 * Create a new instance
 * POST /instances
 */
export const createInstance = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as ExtendedUser)!.id;
  const data = {
    ...req.body,
    createdBy: userId,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
  };

  const instance = await instanceService.create(data);
  return res
    .status(201)
    .json({ success: true, data: instance, message: 'Instance created successfully' });
});

/**
 * Get instance by ID
 * GET /instances/:id
 */
export const getInstance = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const instance = await instanceService.get(id);
  return res.json({ success: true, data: instance, message: 'Instance retrieved successfully' });
});

/**
 * Get instance with full details
 * GET /instances/:id/details
 */
export const getInstanceWithDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const instance = await instanceService.getWithDetails(id);
  return res.json({
    success: true,
    data: instance,
    message: 'Instance details retrieved successfully',
  });
});

/**
 * List instances
 * GET /instances
 */
export const listInstances = catchAsync(async (req: Request, res: Response) => {
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
  return res.json({ success: true, data: result, message: 'Instances retrieved successfully' });
});

/**
 * Get my instances (for students)
 * GET /instances/my/enrolled
 */
export const getMyEnrolledInstances = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as ExtendedUser)!.id;
  const instances = await instanceService.getStudentInstances(userId);
  return res.json({
    success: true,
    data: instances,
    message: 'Enrolled instances retrieved successfully',
  });
});

/**
 * Get my instances (for teachers)
 * GET /instances/my/teaching
 */
export const getMyTeachingInstances = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as ExtendedUser)!.id;
  const instances = await instanceService.getTeacherInstances(userId);
  return res.json({
    success: true,
    data: instances,
    message: 'Teaching instances retrieved successfully',
  });
});

/**
 * Update instance
 * PATCH /instances/:id
 */
export const updateInstance = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = {
    ...req.body,
    ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
    ...(req.body.endDate && { endDate: new Date(req.body.endDate) }),
  };

  const instance = await instanceService.update(id, data);
  return res.json({ success: true, data: instance, message: 'Instance updated successfully' });
});

/**
 * Update instance status
 * PATCH /instances/:id/status
 */
export const updateInstanceStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const instance = await instanceService.updateStatus(id, status);
  return res.json({
    success: true,
    data: instance,
    message: 'Instance status updated successfully',
  });
});

/**
 * Toggle enrollment
 * PATCH /instances/:id/enrollment
 */
export const toggleEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isOpen } = req.body;

  const instance = await instanceService.toggleEnrollment(id, isOpen);
  return res.json({
    success: true,
    data: instance,
    message: `Enrollment ${isOpen ? 'opened' : 'closed'} successfully`,
  });
});

/**
 * Delete instance
 * DELETE /instances/:id
 */
export const deleteInstance = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await instanceService.delete(id);
  return res.status(204).send();
});

/**
 * Clone instance
 * POST /instances/:id/clone
 */
export const cloneInstance = catchAsync(async (req: Request, res: Response) => {
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

  return res
    .status(201)
    .json({ success: true, data: instance, message: 'Instance cloned successfully' });
});

/**
 * Get instance statistics
 * GET /instances/:id/stats
 */
export const getInstanceStats = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const stats = await instanceService.getStats(id);
  return res.json({
    success: true,
    data: stats,
    message: 'Instance statistics retrieved successfully',
  });
});

// ============================================================================
// PUBLISHED ASSIGNMENT CONTROLLERS
// ============================================================================

/**
 * Publish assignment from template
 * POST /instances/:id/assignments/publish
 */
export const publishAssignment = catchAsync(async (req: Request, res: Response) => {
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
  return res
    .status(201)
    .json({ success: true, data: assignment, message: 'Assignment published successfully' });
});

/**
 * Get instance assignments
 * GET /instances/:id/assignments
 */
export const getInstanceAssignments = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.query;

  const assignments = await instanceService.getInstanceAssignments(id, status as string);
  return res.json({
    success: true,
    data: assignments,
    message: 'Assignments retrieved successfully',
  });
});

/**
 * Get published assignment
 * GET /instances/:id/assignments/:assignmentId
 */
export const getPublishedAssignment = catchAsync(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const assignment = await instanceService.getPublishedAssignment(assignmentId);
  return res.json({
    success: true,
    data: assignment,
    message: 'Assignment retrieved successfully',
  });
});

/**
 * Toggle assignment publish status
 * PATCH /instances/:id/assignments/:assignmentId/publish
 */
export const togglePublishStatus = catchAsync(async (req: Request, res: Response) => {
  const { assignmentId } = req.params;
  const { publish } = req.body;

  const assignment = await instanceService.togglePublishStatus(assignmentId, publish);
  return res.json({
    success: true,
    data: assignment,
    message: `Assignment ${publish ? 'published' : 'unpublished'} successfully`,
  });
});
