import express from 'express';

import auth, { requireRight } from '@/shared/middlewares/auth';

import * as controllers from './role.controller';

const router = express.Router();

// ============================================================================
// ROLE CRUD ROUTES
// ============================================================================

router
  .route('/')
  .get(auth(), requireRight('manageRoles'), controllers.getAllRoles)
  .post(auth(), requireRight('manageRoles'), controllers.createRole);

router
  .route('/:id')
  .get(auth(), requireRight('manageRoles'), controllers.getRoleById)
  .patch(auth(), requireRight('manageRoles'), controllers.updateRole)
  .delete(auth(), requireRight('manageRoles'), controllers.deleteRole);

export default router;
