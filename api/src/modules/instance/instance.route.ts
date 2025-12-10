import { Router } from 'express';
import auth, { requireAnyRole } from '@/shared/middlewares/auth';
import { instanceController } from './instance.controller';

const router = Router();

// ============================================================================
// INSTANCE ROUTES
// ============================================================================

/**
 * Create instance
 * POST /instances
 * Requires: teacher or admin role
 */
router.post(
  '/instances',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.createInstance
);

/**
 * List instances
 * GET /instances
 * Requires: authenticated
 */
router.get('/instances', auth(), instanceController.listInstances);

/**
 * Get my enrolled instances (for students)
 * GET /instances/my/enrolled
 * Requires: authenticated
 */
router.get('/instances/my/enrolled', auth(), instanceController.getMyEnrolledInstances);

/**
 * Get my teaching instances (for teachers)
 * GET /instances/my/teaching
 * Requires: teacher role
 */
router.get(
  '/instances/my/teaching',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.getMyTeachingInstances
);

/**
 * Get instance by ID
 * GET /instances/:id
 * Requires: authenticated
 */
router.get('/instances/:id', auth(), instanceController.getInstance);

/**
 * Get instance with full details
 * GET /instances/:id/details
 * Requires: authenticated
 */
router.get('/instances/:id/details', auth(), instanceController.getInstanceWithDetails);

/**
 * Update instance
 * PATCH /instances/:id
 * Requires: teacher or admin role
 */
router.patch(
  '/instances/:id',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.updateInstance
);

/**
 * Update instance status
 * PATCH /instances/:id/status
 * Requires: teacher or admin role
 */
router.patch(
  '/instances/:id/status',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.updateInstanceStatus
);

/**
 * Toggle enrollment
 * PATCH /instances/:id/enrollment
 * Requires: teacher or admin role
 */
router.patch(
  '/instances/:id/enrollment',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.toggleEnrollment
);

/**
 * Delete instance
 * DELETE /instances/:id
 * Requires: admin role
 */
router.delete(
  '/instances/:id',
  auth(),
  requireAnyRole(['admin']),
  instanceController.deleteInstance
);

/**
 * Clone instance
 * POST /instances/:id/clone
 * Requires: teacher or admin role
 */
router.post(
  '/instances/:id/clone',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.cloneInstance
);

/**
 * Get instance statistics
 * GET /instances/:id/stats
 * Requires: teacher or admin role
 */
router.get(
  '/instances/:id/stats',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.getInstanceStats
);

// ============================================================================
// PUBLISHED ASSIGNMENT ROUTES
// ============================================================================

/**
 * Publish assignment from template
 * POST /instances/:id/assignments/publish
 * Requires: teacher or admin role
 */
router.post(
  '/instances/:id/assignments/publish',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.publishAssignment
);

/**
 * Get instance assignments
 * GET /instances/:id/assignments
 * Requires: authenticated
 */
router.get('/instances/:id/assignments', auth(), instanceController.getInstanceAssignments);

/**
 * Get published assignment
 * GET /instances/:id/assignments/:assignmentId
 * Requires: authenticated
 */
router.get(
  '/instances/:id/assignments/:assignmentId',
  auth(),
  instanceController.getPublishedAssignment
);

/**
 * Toggle assignment publish status
 * PATCH /instances/:id/assignments/:assignmentId/publish
 * Requires: teacher or admin role
 */
router.patch(
  '/instances/:id/assignments/:assignmentId/publish',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.togglePublishStatus
);

export default router;
