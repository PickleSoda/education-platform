import { Router } from 'express';
import auth, { requireAnyRole } from '@/shared/middlewares/auth';
import { instanceController } from './instance.controller';

const router = Router();

// ============================================================================
// INSTANCE ROUTES
// ============================================================================

/**
 * Create instance
 * POST
 * Requires: teacher or admin role
 */
router.post('', auth(), requireAnyRole(['teacher', 'admin']), instanceController.createInstance);

/**
 * List instances
 * GET
 * Requires: authenticated
 */
router.get('', auth(), instanceController.listInstances);

/**
 * Get my enrolled instances (for students)
 * GET /my/enrolled
 * Requires: authenticated
 */
router.get('/my/enrolled', auth(), instanceController.getMyEnrolledInstances);

/**
 * Get my teaching instances (for teachers)
 * GET /my/teaching
 * Requires: teacher role
 */
router.get(
  '/my/teaching',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.getMyTeachingInstances
);

/**
 * Get instance by ID
 * GET /:id
 * Requires: authenticated
 */
router.get('/:id', auth(), instanceController.getInstance);

/**
 * Get instance with full details
 * GET /:id/details
 * Requires: authenticated
 */
router.get('/:id/details', auth(), instanceController.getInstanceWithDetails);

/**
 * Update instance
 * PATCH /:id
 * Requires: teacher or admin role
 */
router.patch(
  '/:id',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.updateInstance
);

/**
 * Update instance status
 * PATCH /:id/status
 * Requires: teacher or admin role
 */
router.patch(
  '/:id/status',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.updateInstanceStatus
);

/**
 * Toggle enrollment
 * PATCH /:id/enrollment
 * Requires: teacher or admin role
 */
router.patch(
  '/:id/enrollment',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.toggleEnrollment
);

/**
 * Delete instance
 * DELETE /:id
 * Requires: admin role
 */
router.delete('/:id', auth(), requireAnyRole(['admin']), instanceController.deleteInstance);

/**
 * Clone instance
 * POST /:id/clone
 * Requires: teacher or admin role
 */
router.post(
  '/:id/clone',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.cloneInstance
);

/**
 * Get instance statistics
 * GET /:id/stats
 * Requires: teacher or admin role
 */
router.get(
  '/:id/stats',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.getInstanceStats
);

// ============================================================================
// PUBLISHED ASSIGNMENT ROUTES
// ============================================================================

/**
 * Publish assignment from template
 * POST /:id/assignments/publish
 * Requires: teacher or admin role
 */
router.post(
  '/:id/assignments/publish',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.publishAssignment
);

/**
 * Get instance assignments
 * GET /:id/assignments
 * Requires: authenticated
 */
router.get('/:id/assignments', auth(), instanceController.getInstanceAssignments);

/**
 * Get published assignment
 * GET /:id/assignments/:assignmentId
 * Requires: authenticated
 */
router.get('/:id/assignments/:assignmentId', auth(), instanceController.getPublishedAssignment);

/**
 * Toggle assignment publish status
 * PATCH /:id/assignments/:assignmentId/publish
 * Requires: teacher or admin role
 */
router.patch(
  '/:id/assignments/:assignmentId/publish',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  instanceController.togglePublishStatus
);

export default router;
