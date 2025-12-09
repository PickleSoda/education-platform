import httpStatus from 'http-status';

import ApiError from '@/shared/utils/api-error';
import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';
import type { ApiResponse, PaginatedResponse, ExtendedUser } from '@/types/response';

import { courseService } from './course.service';
import type { CourseWithRelations, CourseLecturer, CourseTag, CourseStats } from './course.types';
import { Tag } from '@prisma/client';
import {
  createCourseSchema,
  getCourseSchema,
  listCoursesSchema,
  updateCourseSchema,
  deleteCourseSchema,
  archiveCourseSchema,
  unarchiveCourseSchema,
  copyCourseSchema,
  getCourseStatsSchema,
  addLecturerSchema,
  removeLecturerSchema,
  updateLecturerSchema,
  getLecturersSchema,
  addTagSchema,
  removeTagSchema,
  createTagSchema,
  listTagsSchema,
  searchCoursesSchema,
} from './course.validation';

// ============================================================================
// COURSE CONTROLLERS
// ============================================================================

/**
 * Create a new course
 * POST /courses
 */
export const createCourse = catchAsync(async (req): Promise<ApiResponse<CourseWithRelations>> => {
  const { body } = await zParse(createCourseSchema, req);
  const userId = (req.user as ExtendedUser)!.id;

  const course = await courseService.create(body, userId);

  return {
    statusCode: httpStatus.CREATED,
    message: 'Course created successfully',
    data: course,
  };
});

/**
 * Get course by ID
 * GET /courses/:id
 */
export const getCourse = catchAsync(async (req): Promise<ApiResponse<CourseWithRelations>> => {
  const { params, query } = await zParse(getCourseSchema, req);

  const course = await courseService.getById(params.id, query?.includeTemplates ?? false);

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return {
    statusCode: httpStatus.OK,
    message: 'Course retrieved successfully',
    data: course,
  };
});

/**
 * List courses with filters and pagination
 * GET /courses
 */
export const listCourses = catchAsync(
  async (req): Promise<PaginatedResponse<CourseWithRelations>> => {
    const { query } = await zParse(listCoursesSchema, req);

    const result = await courseService.list(query);

    return {
      statusCode: httpStatus.OK,
      message: 'Courses retrieved successfully',
      data: result.results,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.totalResults,
        totalPages: result.totalPages,
      },
    };
  }
);

/**
 * Update course
 * PATCH /courses/:id
 */
export const updateCourse = catchAsync(async (req): Promise<ApiResponse<CourseWithRelations>> => {
  const { params, body } = await zParse(updateCourseSchema, req);

  const course = await courseService.update(params.id, body);

  return {
    statusCode: httpStatus.OK,
    message: 'Course updated successfully',
    data: course,
  };
});

/**
 * Archive course
 * POST /courses/:id/archive
 */
export const archiveCourse = catchAsync(async (req): Promise<ApiResponse<CourseWithRelations>> => {
  const { params } = await zParse(archiveCourseSchema, req);

  const course = await courseService.archive(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'Course archived successfully',
    data: course,
  };
});

/**
 * Unarchive course
 * POST /courses/:id/unarchive
 */
export const unarchiveCourse = catchAsync(
  async (req): Promise<ApiResponse<CourseWithRelations>> => {
    const { params } = await zParse(unarchiveCourseSchema, req);

    const course = await courseService.unarchive(params.id);

    return {
      statusCode: httpStatus.OK,
      message: 'Course unarchived successfully',
      data: course,
    };
  }
);

/**
 * Delete course
 * DELETE /courses/:id
 */
export const deleteCourse = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(deleteCourseSchema, req);

  await courseService.delete(params.id);

  return {
    statusCode: httpStatus.NO_CONTENT,
    message: 'Course deleted successfully',
  };
});

/**
 * Copy course
 * POST /courses/:id/copy
 */
export const copyCourse = catchAsync(async (req): Promise<ApiResponse<CourseWithRelations>> => {
  const { params, body } = await zParse(copyCourseSchema, req);
  const userId = (req.user as ExtendedUser)!.id;

  const course = await courseService.copy(params.id, body.newCode, userId);

  return {
    statusCode: httpStatus.CREATED,
    message: 'Course copied successfully',
    data: course,
  };
});

/**
 * Get course statistics
 * GET /courses/:id/stats
 */
export const getCourseStats = catchAsync(async (req): Promise<ApiResponse<CourseStats>> => {
  const { params } = await zParse(getCourseStatsSchema, req);

  const stats = await courseService.getStats(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'Course statistics retrieved successfully',
    data: stats,
  };
});

// ============================================================================
// LECTURER CONTROLLERS
// ============================================================================

/**
 * Add lecturer to course
 * POST /courses/:id/lecturers
 */
export const addLecturer = catchAsync(async (req): Promise<ApiResponse<CourseLecturer>> => {
  const { params, body } = await zParse(addLecturerSchema, req);

  const lecturer = await courseService.addLecturer(params.id, body.userId, body.isPrimary);

  return {
    statusCode: httpStatus.OK,
    message: 'Lecturer added successfully',
    data: lecturer,
  };
});

/**
 * Remove lecturer from course
 * DELETE /courses/:id/lecturers/:userId
 */
export const removeLecturer = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(removeLecturerSchema, req);

  await courseService.removeLecturer(params.id, params.userId);

  return {
    statusCode: httpStatus.NO_CONTENT,
    message: 'Lecturer removed successfully',
  };
});

/**
 * Update lecturer
 * PATCH /courses/:id/lecturers/:userId
 */
export const updateLecturer = catchAsync(async (req): Promise<ApiResponse<CourseLecturer>> => {
  const { params, body } = await zParse(updateLecturerSchema, req);

  const lecturer = await courseService.updateLecturerPrimary(
    params.id,
    params.userId,
    body.isPrimary
  );

  return {
    statusCode: httpStatus.OK,
    message: 'Lecturer updated successfully',
    data: lecturer,
  };
});

/**
 * Get course lecturers
 * GET /courses/:id/lecturers
 */
export const getLecturers = catchAsync(async (req): Promise<ApiResponse<CourseLecturer[]>> => {
  const { params } = await zParse(getLecturersSchema, req);

  const lecturers = await courseService.getLecturers(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'Lecturers retrieved successfully',
    data: lecturers,
  };
});

// ============================================================================
// TAG CONTROLLERS
// ============================================================================

/**
 * Add tag to course
 * POST /courses/:id/tags
 */
export const addTag = catchAsync(async (req): Promise<ApiResponse<CourseTag>> => {
  const { params, body } = await zParse(addTagSchema, req);

  const tag = await courseService.addTagById(params.id, body.tagId);

  return {
    statusCode: httpStatus.OK,
    message: 'Tag added successfully',
    data: tag,
  };
});

/**
 * Remove tag from course
 * DELETE /courses/:id/tags/:tagId
 */
export const removeTag = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(removeTagSchema, req);

  await courseService.removeTag(params.id, params.tagId);

  return {
    statusCode: httpStatus.NO_CONTENT,
    message: 'Tag removed successfully',
  };
});

/**
 * Get all tags
 * GET /tags
 */
export const getAllTags = catchAsync(async (req): Promise<ApiResponse<Tag[]>> => {
  const { query } = await zParse(listTagsSchema, req);

  const tags = await courseService.getAllTags(query.limit, query.popular);

  return {
    statusCode: httpStatus.OK,
    message: 'Tags retrieved successfully',
    data: tags,
  };
});

/**
 * Create tag
 * POST /tags
 */
export const createTag = catchAsync(async (req): Promise<ApiResponse<Tag>> => {
  const { body } = await zParse(createTagSchema, req);

  const tag = await courseService.createTag(body.name, body.color);

  return {
    statusCode: httpStatus.CREATED,
    message: 'Tag created successfully',
    data: tag,
  };
});

// ============================================================================
// SEARCH CONTROLLERS
// ============================================================================

/**
 * Search courses
 * GET /courses/search
 */
export const searchCourses = catchAsync(
  async (req): Promise<ApiResponse<CourseWithRelations[]>> => {
    const { query } = await zParse(searchCoursesSchema, req);

    const result = await courseService.search(query.q, query.limit);

    return {
      statusCode: httpStatus.OK,
      message: 'Search results retrieved successfully',
      data: result.results,
    };
  }
);

/**
 * Get my courses (as creator)
 * GET /courses/my/created
 */
export const getMyCourses = catchAsync(async (req): Promise<ApiResponse<CourseWithRelations[]>> => {
  const userId = (req.user as ExtendedUser)!.id;

  const courses = await courseService.getCoursesByCreator(userId);

  return {
    statusCode: httpStatus.OK,
    message: 'Courses retrieved successfully',
    data: courses,
  };
});

/**
 * Get courses I teach
 * GET /courses/my/teaching
 */
export const getMyTeachingCourses = catchAsync(
  async (req): Promise<ApiResponse<CourseWithRelations[]>> => {
    const userId = (req.user as ExtendedUser)!.id;

    const courses = await courseService.getCoursesByLecturer(userId);

    return {
      statusCode: httpStatus.OK,
      message: 'Courses retrieved successfully',
      data: courses,
    };
  }
);

// ============================================================================
// CONTROLLER EXPORT
// ============================================================================

export const courseController = {
  // Course CRUD
  create: createCourse,
  getById: getCourse,
  list: listCourses,
  update: updateCourse,
  archive: archiveCourse,
  unarchive: unarchiveCourse,
  delete: deleteCourse,
  copy: copyCourse,
  getStats: getCourseStats,

  // Lecturer management
  addLecturer,
  removeLecturer,
  updateLecturer,
  getLecturers,

  // Tag management
  addTag,
  removeTag,
  getAllTags,
  createTag,

  // Search
  search: searchCourses,
  getMyCourses,
  getMyTeachingCourses,
};
