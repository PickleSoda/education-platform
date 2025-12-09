import { Router } from 'express';
import { courseController } from './course.controller';
import auth, { requireAnyRole } from '@/shared/middlewares/auth';

const router = Router();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

// Get all tags (public)
router.get('/tags', courseController.getAllTags);

// ============================================================================
// PROTECTED ROUTES (Require Authentication)
// ============================================================================

router.use(auth());

// Search courses (must come before /:id to avoid conflict)
router.get('/search', courseController.search);

// List courses (requires auth)
router.get('/', courseController.list);

// Get course by ID (must come after specific routes)
router.get('/:id', courseController.getById);

// ============================================================================
// USER-SPECIFIC ROUTES (must come before /:id routes)
// ============================================================================

// Get my created courses
router.get('/my/created', courseController.getMyCourses);

// Get courses I teach
router.get('/my/teaching', courseController.getMyTeachingCourses);

// ============================================================================
// TEACHER/ADMIN ROUTES (Course Management)
// ============================================================================

// Create course (teacher, admin)
router.post('/', requireAnyRole(['teacher', 'admin']), courseController.create);

// Update course (teacher, admin)
router.patch('/:id', requireAnyRole(['teacher', 'admin']), courseController.update);

// Archive course (teacher, admin)
router.post('/:id/archive', requireAnyRole(['teacher', 'admin']), courseController.archive);

// Unarchive course (teacher, admin)
router.post('/:id/unarchive', requireAnyRole(['teacher', 'admin']), courseController.unarchive);

// Copy course (teacher, admin)
router.post('/:id/copy', requireAnyRole(['teacher', 'admin']), courseController.copy);

// Delete course (admin only)
router.delete('/:id', requireAnyRole(['admin']), courseController.delete);

// Get course stats (teacher, admin)
router.get('/:id/stats', requireAnyRole(['teacher', 'admin']), courseController.getStats);

// ============================================================================
// LECTURER MANAGEMENT ROUTES
// ============================================================================

// Get lecturers for a course
router.get('/:id/lecturers', courseController.getLecturers);

// Add lecturer (teacher, admin)
router.post('/:id/lecturers', requireAnyRole(['teacher', 'admin']), courseController.addLecturer);

// Update lecturer (teacher, admin)
router.patch(
  '/:id/lecturers/:userId',
  requireAnyRole(['teacher', 'admin']),
  courseController.updateLecturer
);

// Remove lecturer (teacher, admin)
router.delete(
  '/:id/lecturers/:userId',
  requireAnyRole(['teacher', 'admin']),
  courseController.removeLecturer
);

// ============================================================================
// TAG MANAGEMENT ROUTES
// ============================================================================

// Create tag (teacher, admin)
router.post('/tags', requireAnyRole(['teacher', 'admin']), courseController.createTag);

// Add tag to course (teacher, admin)
router.post('/:id/tags', requireAnyRole(['teacher', 'admin']), courseController.addTag);

// Remove tag from course (teacher, admin)
router.delete('/:id/tags/:tagId', requireAnyRole(['teacher', 'admin']), courseController.removeTag);

export default router;
