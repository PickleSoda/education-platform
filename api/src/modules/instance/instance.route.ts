import { Router } from 'express';
import auth, { requireAnyRole } from '@/shared/middlewares/auth';
import * as controller from './instance.controller';

const router = Router();

// ============================================================================
// INSTANCE ROUTES
// ============================================================================

/**
 * Create instance
 * POST /instances
 * Requires: teacher or admin role
 */
router.post('/instances', auth, requireAnyRole(['teacher', 'admin']), controller.createInstance);

/**
 * List instances
 * GET /instances
 * Requires: authenticated
 */
router.get('/instances', auth, controller.listInstances);

/**
 * Get my enrolled instances (for students)
 * GET /instances/my/enrolled
 * Requires: authenticated
 */
router.get('/instances/my/enrolled', auth, controller.getMyEnrolledInstances);

/**
 * Get my teaching instances (for teachers)
 * GET /instances/my/teaching
 * Requires: teacher role
 */
router.get(
  '/instances/my/teaching',
  auth,
  requireAnyRole(['teacher', 'admin']),
  controller.getMyTeachingInstances
);

/**
 * Get instance by ID
 * GET /instances/:id
 * Requires: authenticated
 */
router.get('/instances/:id', auth, controller.getInstance);

/**
 * Get instance with full details
 * GET /instances/:id/details
 * Requires: authenticated
 */
router.get('/instances/:id/details', auth, controller.getInstanceWithDetails);

/**
 * Update instance
 * PATCH /instances/:id
 * Requires: teacher or admin role
 */
router.patch(
  '/instances/:id',
  auth,
  requireAnyRole(['teacher', 'admin']),
  controller.updateInstance
);

/**
 * Update instance status
 * PATCH /instances/:id/status
 * Requires: teacher or admin role
 */
router.patch(
  '/instances/:id/status',
  auth,
  requireAnyRole(['teacher', 'admin']),
  controller.updateInstanceStatus
);

/**
 * Toggle enrollment
 * PATCH /instances/:id/enrollment
 * Requires: teacher or admin role
 */
router.patch(
  '/instances/:id/enrollment',
  auth,
  requireAnyRole(['teacher', 'admin']),
  controller.toggleEnrollment
);

/**
 * Delete instance
 * DELETE /instances/:id
 * Requires: admin role
 */
router.delete('/instances/:id', auth, requireAnyRole(['admin']), controller.deleteInstance);

/**
 * Clone instance
 * POST /instances/:id/clone
 * Requires: teacher or admin role
 */
router.post(
  '/instances/:id/clone',
  auth,
  requireAnyRole(['teacher', 'admin']),
  controller.cloneInstance
);

/**
 * Get instance statistics
 * GET /instances/:id/stats
 * Requires: teacher or admin role
 */
router.get(
  '/instances/:id/stats',
  auth,
  requireAnyRole(['teacher', 'admin']),
  controller.getInstanceStats
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
  auth,
  requireAnyRole(['teacher', 'admin']),
  controller.publishAssignment
);

/**
 * Get instance assignments
 * GET /instances/:id/assignments
 * Requires: authenticated
 */
router.get('/instances/:id/assignments', auth, controller.getInstanceAssignments);

/**
 * Get published assignment
 * GET /instances/:id/assignments/:assignmentId
 * Requires: authenticated
 */
router.get('/instances/:id/assignments/:assignmentId', auth, controller.getPublishedAssignment);

/**
 * Toggle assignment publish status
 * PATCH /instances/:id/assignments/:assignmentId/publish
 * Requires: teacher or admin role
 */
router.patch(
  '/instances/:id/assignments/:assignmentId/publish',
  auth,
  requireAnyRole(['teacher', 'admin']),
  controller.togglePublishStatus
);

export default router;
