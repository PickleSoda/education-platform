import { Router } from 'express';

import auth from '@/shared/middlewares/auth';

import * as resourceController from './resource.controller';

const router = Router();

// ============================================================================
// RESOURCE TEMPLATE ROUTES (for course management)
// ============================================================================

// Create resource template
router.post('/courses/:courseId/resources', auth(), resourceController.createResourceTemplate);

// Upload file and create resource template
router.post(
  '/courses/:courseId/resources/upload',
  auth(),
  resourceController.uploadMiddleware,
  resourceController.uploadResourceFile
);

// List resource templates for a course
router.get('/courses/:courseId/resources', auth(), resourceController.listResourceTemplates);

// Get resource template by ID
router.get('/resources/:id', auth(), resourceController.getResourceTemplate);

// Update resource template
router.patch('/resources/:id', auth(), resourceController.updateResourceTemplate);

// Delete resource template
router.delete('/resources/:id', auth(), resourceController.deleteResourceTemplate);

// ============================================================================
// PUBLISHED RESOURCE ROUTES (for course instances)
// ============================================================================

// Publish a resource to an instance
router.post('/instances/:instanceId/resources', auth(), resourceController.createPublishedResource);

// List published resources for an instance
router.get('/instances/:instanceId/resources', auth(), resourceController.listPublishedResources);

// Get published resource by ID
router.get('/instances/resources/:id', auth(), resourceController.getPublishedResource);

// Update published resource
router.patch('/instances/resources/:id', auth(), resourceController.updatePublishedResource);

// Delete published resource
router.delete('/instances/resources/:id', auth(), resourceController.deletePublishedResource);

// ============================================================================
// SYLLABUS ITEM ROUTES
// ============================================================================

// Create syllabus item
router.post('/courses/:courseId/syllabus', auth(), resourceController.createSyllabusItem);

// List syllabus items for a course
router.get('/courses/:courseId/syllabus', auth(), resourceController.listSyllabusItems);

// Get syllabus item by ID
router.get('/syllabus/:id', auth(), resourceController.getSyllabusItem);

// Update syllabus item
router.patch('/syllabus/:id', auth(), resourceController.updateSyllabusItem);

// Delete syllabus item
router.delete('/syllabus/:id', auth(), resourceController.deleteSyllabusItem);

export default router;
