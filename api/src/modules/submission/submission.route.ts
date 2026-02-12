import { Router } from 'express';
import { submissionController, submissionUploadMiddleware } from './submission.controller';
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

// Upload submission files (student)
router.post(
  '/assignments/:assignmentId/upload',
  requireAnyRole(['student']),
  submissionUploadMiddleware,
  submissionController.uploadSubmissionFiles
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

// List submissions (students can view their own, teachers/admins can view all)
router.get('/', submissionController.listSubmissions);

// Get submission details (students can view their own, teachers/admins can view all)
router.get('/:submissionId', submissionController.getSubmission);

// Download submission file (student who submitted or teacher/admin)
router.get('/:submissionId/download/*filepath', submissionController.downloadSubmissionFile);

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

// Return submission for resubmission (teacher, admin)
router.post(
  '/:submissionId/return',
  requireAnyRole(['teacher', 'admin']),
  submissionController.returnSubmission
);

// Get submission statistics (teacher, admin)
router.get(
  '/assignments/:assignmentId/stats',
  requireAnyRole(['teacher', 'admin']),
  submissionController.getSubmissionStats
);

export default router;
