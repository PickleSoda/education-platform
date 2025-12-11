import httpStatus from 'http-status';
import multer from 'multer';

import ApiError from '@/shared/utils/api-error';
import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';
import type { ApiResponse } from '@/types/response';
import { storageService } from '@/shared/services/storage.service';

import * as resourceService from './resource.service';
import type {
  ResourceTemplateWithSyllabus,
  PublishedResourceWithTemplate,
  SyllabusItemWithRelations,
} from './resource.types';
import {
  createResourceTemplateSchema,
  getResourceTemplateSchema,
  listResourceTemplatesSchema,
  updateResourceTemplateSchema,
  deleteResourceTemplateSchema,
  createPublishedResourceSchema,
  getPublishedResourceSchema,
  listPublishedResourcesSchema,
  updatePublishedResourceSchema,
  deletePublishedResourceSchema,
  createSyllabusItemSchema,
  getSyllabusItemSchema,
  listSyllabusItemsSchema,
  updateSyllabusItemSchema,
  deleteSyllabusItemSchema,
  uploadResourceFileSchema,
} from './resource.validation';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept most common file types
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mpeg',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export const uploadMiddleware = upload.single('file');

// ============================================================================
// RESOURCE TEMPLATE CONTROLLERS
// ============================================================================

/**
 * Create a new resource template
 * POST /courses/:courseId/resources
 */
export const createResourceTemplate = catchAsync(
  async (req): Promise<ApiResponse<ResourceTemplateWithSyllabus>> => {
    const { params, body } = await zParse(createResourceTemplateSchema, req);

    const template = await resourceService.createResourceTemplate({
      ...body,
      courseId: params.courseId,
    });

    return {
      statusCode: httpStatus.CREATED,
      message: 'Resource template created successfully',
      data: template,
    };
  }
);

/**
 * Upload file and create resource template
 * POST /courses/:courseId/resources/upload
 */
export const uploadResourceFile = catchAsync(
  async (req): Promise<ApiResponse<ResourceTemplateWithSyllabus>> => {
    const { params, body } = await zParse(uploadResourceFileSchema, req);

    if (!req.file) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
    }

    // Upload file to storage
    const uploadResult = await storageService.uploadFile(req.file, 'resources');

    // Create resource template with file info
    const template = await resourceService.createResourceTemplate({
      courseId: params.courseId,
      title: body.title,
      description: body.description,
      resourceType: body.resourceType,
      filePath: uploadResult.filePath,
      url: uploadResult.url,
      syllabusItemId: body.syllabusItemId,
      sortOrder: body.sortOrder,
    });

    return {
      statusCode: httpStatus.CREATED,
      message: 'File uploaded and resource template created successfully',
      data: template,
    };
  }
);

/**
 * Get resource template by ID
 * GET /resources/:id
 */
export const getResourceTemplate = catchAsync(
  async (req): Promise<ApiResponse<ResourceTemplateWithSyllabus>> => {
    const { params } = await zParse(getResourceTemplateSchema, req);

    const template = await resourceService.getResourceTemplate(params.id);

    if (!template) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Resource template not found');
    }

    return {
      statusCode: httpStatus.OK,
      message: 'Resource template retrieved successfully',
      data: template,
    };
  }
);

/**
 * List resource templates for a course
 * GET /courses/:courseId/resources
 */
export const listResourceTemplates = catchAsync(
  async (req): Promise<ApiResponse<ResourceTemplateWithSyllabus[]>> => {
    const { params, query } = await zParse(listResourceTemplatesSchema, req);

    const templates = await resourceService.listResourceTemplates(params.courseId, {
      resourceType: query?.resourceType,
      syllabusItemId: query?.syllabusItemId,
    });

    return {
      statusCode: httpStatus.OK,
      message: 'Resource templates retrieved successfully',
      data: templates,
    };
  }
);

/**
 * Update resource template
 * PATCH /resources/:id
 */
export const updateResourceTemplate = catchAsync(
  async (req): Promise<ApiResponse<ResourceTemplateWithSyllabus>> => {
    const { params, body } = await zParse(updateResourceTemplateSchema, req);

    const template = await resourceService.updateResourceTemplate(params.id, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Resource template updated successfully',
      data: template,
    };
  }
);

/**
 * Delete resource template
 * DELETE /resources/:id
 */
export const deleteResourceTemplate = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(deleteResourceTemplateSchema, req);

  await resourceService.deleteResourceTemplate(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'Resource template deleted successfully',
    data: undefined,
  };
});

// ============================================================================
// PUBLISHED RESOURCE CONTROLLERS
// ============================================================================

/**
 * Create/publish a resource to an instance
 * POST /instances/:instanceId/resources
 */
export const createPublishedResource = catchAsync(
  async (req): Promise<ApiResponse<PublishedResourceWithTemplate>> => {
    const { params, body } = await zParse(createPublishedResourceSchema, req);

    const resource = await resourceService.createPublishedResource({
      ...body,
      instanceId: params.instanceId,
    });

    return {
      statusCode: httpStatus.CREATED,
      message: 'Resource published successfully',
      data: resource,
    };
  }
);

/**
 * Get published resource by ID
 * GET /instances/resources/:id
 */
export const getPublishedResource = catchAsync(
  async (req): Promise<ApiResponse<PublishedResourceWithTemplate>> => {
    const { params } = await zParse(getPublishedResourceSchema, req);

    const resource = await resourceService.getPublishedResource(params.id);

    if (!resource) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Published resource not found');
    }

    return {
      statusCode: httpStatus.OK,
      message: 'Published resource retrieved successfully',
      data: resource,
    };
  }
);

/**
 * List published resources for an instance
 * GET /instances/:instanceId/resources
 */
export const listPublishedResources = catchAsync(
  async (req): Promise<ApiResponse<PublishedResourceWithTemplate[]>> => {
    const { params, query } = await zParse(listPublishedResourcesSchema, req);

    const resources = await resourceService.listPublishedResources(params.instanceId, {
      isPublished: query?.isPublished,
      resourceType: query?.resourceType,
    });

    return {
      statusCode: httpStatus.OK,
      message: 'Published resources retrieved successfully',
      data: resources,
    };
  }
);

/**
 * Update published resource
 * PATCH /instances/resources/:id
 */
export const updatePublishedResource = catchAsync(
  async (req): Promise<ApiResponse<PublishedResourceWithTemplate>> => {
    const { params, body } = await zParse(updatePublishedResourceSchema, req);

    const resource = await resourceService.updatePublishedResource(params.id, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Published resource updated successfully',
      data: resource,
    };
  }
);

/**
 * Delete published resource
 * DELETE /instances/resources/:id
 */
export const deletePublishedResource = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(deletePublishedResourceSchema, req);

  await resourceService.deletePublishedResource(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'Published resource deleted successfully',
    data: undefined,
  };
});

// ============================================================================
// SYLLABUS ITEM CONTROLLERS
// ============================================================================

/**
 * Create a new syllabus item
 * POST /courses/:courseId/syllabus
 */
export const createSyllabusItem = catchAsync(
  async (req): Promise<ApiResponse<SyllabusItemWithRelations>> => {
    const { params, body } = await zParse(createSyllabusItemSchema, req);

    const item = await resourceService.createSyllabusItem({
      ...body,
      courseId: params.courseId,
    });

    return {
      statusCode: httpStatus.CREATED,
      message: 'Syllabus item created successfully',
      data: item,
    };
  }
);

/**
 * Get syllabus item by ID
 * GET /syllabus/:id
 */
export const getSyllabusItem = catchAsync(
  async (req): Promise<ApiResponse<SyllabusItemWithRelations>> => {
    const { params } = await zParse(getSyllabusItemSchema, req);

    const item = await resourceService.getSyllabusItem(params.id);

    if (!item) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Syllabus item not found');
    }

    return {
      statusCode: httpStatus.OK,
      message: 'Syllabus item retrieved successfully',
      data: item,
    };
  }
);

/**
 * List syllabus items for a course
 * GET /courses/:courseId/syllabus
 */
export const listSyllabusItems = catchAsync(
  async (req): Promise<ApiResponse<SyllabusItemWithRelations[]>> => {
    const { params } = await zParse(listSyllabusItemsSchema, req);

    const items = await resourceService.listSyllabusItems(params.courseId);

    return {
      statusCode: httpStatus.OK,
      message: 'Syllabus items retrieved successfully',
      data: items,
    };
  }
);

/**
 * Update syllabus item
 * PATCH /syllabus/:id
 */
export const updateSyllabusItem = catchAsync(
  async (req): Promise<ApiResponse<SyllabusItemWithRelations>> => {
    const { params, body } = await zParse(updateSyllabusItemSchema, req);

    const item = await resourceService.updateSyllabusItem(params.id, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Syllabus item updated successfully',
      data: item,
    };
  }
);

/**
 * Delete syllabus item
 * DELETE /syllabus/:id
 */
export const deleteSyllabusItem = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(deleteSyllabusItemSchema, req);

  await resourceService.deleteSyllabusItem(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'Syllabus item deleted successfully',
    data: undefined,
  };
});
