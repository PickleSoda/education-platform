import express from 'express';

import auth, { requireRight } from '@/shared/middlewares/auth';

import * as controllers from './user.controller';

const router = express.Router();

// ============================================================================
// USER CRUD ROUTES
// ============================================================================

router
  .route('/')
  .post(auth(), requireRight('manageUsers'), controllers.createUser)
  .get(auth(), requireRight('manageUsers'), controllers.listUsers);

router
  .route('/:id')
  .get(auth(), controllers.getUser)
  .patch(auth(), requireRight('manageUsers'), controllers.updateUser)
  .delete(auth(), requireRight('manageUsers'), controllers.deleteUser);

// Soft delete endpoint (deactivate user)
router
  .route('/:id/deactivate')
  .post(auth(), requireRight('manageUsers'), controllers.softDeleteUser);

// ============================================================================
// ROLE MANAGEMENT ROUTES
// ============================================================================

router
  .route('/:id/roles')
  .get(auth(), requireRight('manageUsers'), controllers.getUserRoles)
  .post(auth(), requireRight('manageUsers'), controllers.addRole);

router
  .route('/:id/roles/:roleName')
  .delete(auth(), requireRight('manageUsers'), controllers.removeRole);

// ============================================================================
// PROFILE MANAGEMENT ROUTES
// ============================================================================

router
  .route('/:id/teacher-profile')
  .get(auth(), controllers.getTeacherProfile)
  .put(auth(), controllers.updateTeacherProfile);

router
  .route('/:id/student-profile')
  .get(auth(), controllers.getStudentProfile)
  .put(auth(), controllers.updateStudentProfile);

export default router;
