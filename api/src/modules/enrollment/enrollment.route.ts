import { Router } from 'express';
import { enrollmentController } from './enrollment.controller';
import auth, { requireAnyRole } from '@/shared/middlewares/auth';

const router = Router();

// ============================================================================
// PROTECTED ROUTES (Require Authentication)
// ============================================================================

router.use(auth());

// ============================================================================
// STUDENT ROUTES
// ============================================================================

// Get my enrollments
router.get('/me', enrollmentController.getMyEnrollments);

// Self-enroll in a course instance
router.post('/instances/:instanceId/enroll', enrollmentController.enroll);

// ============================================================================
// ENROLLMENT MANAGEMENT ROUTES
// ============================================================================

// Get enrollment by ID
router.get('/:id', enrollmentController.getEnrollment);

// Update enrollment status (teacher, admin)
router.patch(
  '/:id/status',
  requireAnyRole(['teacher', 'admin']),
  enrollmentController.updateEnrollmentStatus
);

// Delete enrollment (admin only)
router.delete('/:id', requireAnyRole(['admin']), enrollmentController.deleteEnrollment);

// ============================================================================
// INSTANCE-LEVEL ENROLLMENT ROUTES
// ============================================================================

// Get enrollments for an instance (roster) - teacher, admin
router.get(
  '/instances/:instanceId/enrollments',
  requireAnyRole(['teacher', 'admin']),
  enrollmentController.getInstanceEnrollments
);

// Get enrollment statistics for an instance - teacher, admin
router.get(
  '/instances/:instanceId/stats',
  requireAnyRole(['teacher', 'admin']),
  enrollmentController.getEnrollmentStats
);

// Enroll a specific student (teacher, admin)
router.post(
  '/instances/:instanceId/students/enroll',
  requireAnyRole(['teacher', 'admin']),
  enrollmentController.enroll
);

// Drop a student (teacher, admin)
router.post(
  '/instances/:instanceId/students/:studentId/drop',
  requireAnyRole(['teacher', 'admin']),
  enrollmentController.dropStudent
);

// Check if student is enrolled
router.get(
  '/instances/:instanceId/students/:studentId/enrolled',
  enrollmentController.checkEnrollment
);

// Bulk enroll students (teacher, admin)
router.post(
  '/instances/:instanceId/bulk-enroll',
  requireAnyRole(['teacher', 'admin']),
  enrollmentController.bulkEnroll
);

// Export roster (teacher, admin)
router.get(
  '/instances/:instanceId/roster/export',
  requireAnyRole(['teacher', 'admin']),
  enrollmentController.exportRoster
);

// ============================================================================
// GRADE CALCULATION ROUTES
// ============================================================================

// Calculate final grade for self or specific student
router.post('/instances/:instanceId/calculate-grade', enrollmentController.calculateFinalGrade);

// Calculate all final grades for an instance (teacher, admin)
router.post(
  '/instances/:instanceId/calculate-all-grades',
  requireAnyRole(['teacher', 'admin']),
  enrollmentController.calculateAllGrades
);

export default router;
