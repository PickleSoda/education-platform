import { Router } from 'express';
import { assignmentController } from './assignment.controller';
import auth, { requireAnyRole } from '@/shared/middlewares/auth';

const router = Router();

// ============================================================================
// COURSE-SCOPED ROUTES (/courses/:courseId/assignments)
// ============================================================================

// Create assignment template (teacher, admin)
router.post(
  '/courses/:courseId/assignments',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.create
);

// List assignment templates for a course
router.get('/courses/:courseId/assignments', auth(), assignmentController.list);

// Get grading structure for a course
router.get(
  '/courses/:courseId/grading-structure',
  auth(),
  assignmentController.getGradingStructure
);

// Reorder assignment templates (teacher, admin)
router.put(
  '/courses/:courseId/assignments/reorder',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.reorder
);

// ============================================================================
// ASSIGNMENT TEMPLATE ROUTES (/assignments/:id)
// ============================================================================

// Get assignment template by ID
router.get('/assignments/:id', auth(), assignmentController.getById);

// Update assignment template (teacher, admin)
router.patch(
  '/assignments/:id',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.update
);

// Delete assignment template (teacher, admin)
router.delete(
  '/assignments/:id',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.delete
);

// Copy assignment template (teacher, admin)
router.post(
  '/assignments/:id/copy',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.copy
);

// Validate grading criteria (teacher, admin)
router.get(
  '/assignments/:id/validate',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.validate
);

// Get template statistics (teacher, admin)
router.get(
  '/assignments/:id/stats',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.getStats
);

// ============================================================================
// GRADING CRITERIA ROUTES (/assignments/:id/criteria)
// ============================================================================

// Add grading criteria (teacher, admin)
router.post(
  '/assignments/:id/criteria',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.addCriteria
);

// Update grading criteria (teacher, admin)
router.patch(
  '/assignments/:id/criteria/:criteriaId',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.updateCriteria
);

// Delete grading criteria (teacher, admin)
router.delete(
  '/assignments/:id/criteria/:criteriaId',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.deleteCriteria
);

// Reorder grading criteria (teacher, admin)
router.put(
  '/assignments/:id/criteria/reorder',
  auth(),
  requireAnyRole(['teacher', 'admin']),
  assignmentController.reorderCriteria
);

export default router;
