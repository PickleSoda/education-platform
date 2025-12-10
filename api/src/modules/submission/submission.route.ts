import { Router } from 'express';
import { submissionController } from './submission.controller';
import auth, { requireAnyRole } from '@/shared/middlewares/auth';

const router = Router();

// ============================================================================
// PROTECTED ROUTES (Require Authentication)
// ============================================================================

router.use(auth());

// ============================================================================
// STUDENT SUBMISSION ROUTES
// ============================================================================

// Save submission draft (student)
router.post(
  '/assignments/:assignmentId/draft',
  requireAnyRole(['student']),
  submissionController.saveSubmission
);

// Update submission draft (student)
router.patch('/:submissionId', requireAnyRole(['student']), submissionController.updateSubmission);

// Submit assignment (student)
router.post(
  '/assignments/:assignmentId/submit',
  requireAnyRole(['student']),
  submissionController.submitAssignment
);

// Get student's gradebook
router.get(
  '/instances/:instanceId/students/:studentId/gradebook',
  submissionController.getGradebook
);

// ============================================================================
// TEACHER/ADMIN ROUTES (Grading & Management)
// ============================================================================

// List submissions (teacher, admin)
router.get('/', requireAnyRole(['teacher', 'admin']), submissionController.listSubmissions);

// Get submission details (teacher, admin)
router.get(
  '/:submissionId',
  requireAnyRole(['teacher', 'admin']),
  submissionController.getSubmission
);

// Grade submission with criteria (teacher, admin)
router.post(
  '/:submissionId/grade',
  requireAnyRole(['teacher', 'admin']),
  submissionController.gradeSubmission
);

// Grade submission as pass/fail (teacher, admin)
router.post(
  '/:submissionId/grade-pass-fail',
  requireAnyRole(['teacher', 'admin']),
  submissionController.gradePassFail
);

// Get submission statistics (teacher, admin)
router.get(
  '/assignments/:assignmentId/stats',
  requireAnyRole(['teacher', 'admin']),
  submissionController.getSubmissionStats
);

export default router;
