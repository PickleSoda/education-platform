import { courseRepository } from './course.repository';
import { CreateCourseInput, UpdateCourseInput, ListCoursesQuery } from './course.validation';
import { PaginationOptions } from '@/shared/repositories/base.repository';
import ApiError from '@/shared/utils/api-error';
import httpStatus from 'http-status';

// ============================================================================
// COURSE SERVICE
// ============================================================================

/**
 * Create a new course with validation
 */
export const createCourse = async (data: CreateCourseInput, createdBy: string) => {
  // Check if course code already exists
  const existingCourse = await courseRepository.findById(data.code);
  if (existingCourse) {
    throw new ApiError(httpStatus.CONFLICT, `Course with code "${data.code}" already exists`);
  }

  // Create course
  return courseRepository.create({
    ...data,
    createdBy,
  });
};

/**
 * Get course by ID with optional template data
 */
export const getCourseById = async (courseId: string, includeTemplates = false) => {
  if (includeTemplates) {
    return courseRepository.getWithTemplates(courseId);
  }
  return courseRepository.getWithRelations(courseId);
};

/**
 * List courses with filters and pagination
 */
export const listCourses = async (query: ListCoursesQuery) => {
  const { page, limit, sortBy, sortOrder, search, tagIds, includeArchived } = query;

  const filters = {
    search,
    tagIds,
    includeArchived,
  };

  const options: PaginationOptions = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  return courseRepository.list(filters, options);
};

/**
 * Update course details
 */
export const updateCourse = async (courseId: string, data: UpdateCourseInput) => {
  // Check if course exists
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  // If updating code, check for duplicates
  if (data.code && data.code !== course.code) {
    const existing = await courseRepository.findById(data.code);
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, `Course with code "${data.code}" already exists`);
    }
  }

  return courseRepository.update(courseId, data);
};

/**
 * Archive a course
 */
export const archiveCourse = async (courseId: string) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return courseRepository.archive(courseId);
};

/**
 * Unarchive a course
 */
export const unarchiveCourse = async (courseId: string) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  return courseRepository.unarchive(courseId);
};

/**
 * Delete a course (with validation)
 */
export const deleteCourse = async (courseId: string) => {
  const course = await courseRepository.getWithRelations(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  // Check if course has instances
  if (course._count && course._count.instances > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete course with active instances. Archive it instead.'
    );
  }

  return courseRepository.delete(courseId);
};

/**
 * Copy/duplicate a course template
 */
export const copyCourse = async (courseId: string, newCode: string, createdBy: string) => {
  const source = await courseRepository.getWithTemplates(courseId);
  if (!source) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Source course not found');
  }

  // Check if new code is available
  const existing = await courseRepository.findById(newCode);
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, `Course with code "${newCode}" already exists`);
  }

  // Create new course (templates will be copied separately in assignment/resource modules)
  const tagIds = source.tags?.map((t) => t.tag.id) || [];
  const lecturerIds = source.lecturers?.map((l) => l.userId) || [];

  return courseRepository.create({
    code: newCode,
    title: source.title,
    description: source.description,
    credits: source.credits ? Number(source.credits) : undefined,
    typicalDurationWeeks: source.typicalDurationWeeks,
    createdBy,
    tagIds,
    lecturerIds,
  });
};

// ============================================================================
// LECTURER MANAGEMENT
// ============================================================================

/**
 * Add lecturer to course
 */
export const addLecturer = async (courseId: string, userId: string, isPrimary = false) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  // Check if lecturer already exists
  const isExisting = await courseRepository.isLecturer(courseId, userId);
  if (isExisting) {
    throw new Error('Lecturer already assigned to this course');
  }

  // If setting as primary, unset other primary lecturers
  if (isPrimary) {
    const lecturers = await courseRepository.getLecturers(courseId);
    for (const lecturer of lecturers.filter((l) => l.isPrimary)) {
      await courseRepository.updateLecturerPrimary(courseId, lecturer.userId, false);
    }
  }

  return courseRepository.addLecturer(courseId, userId, isPrimary);
};

/**
 * Remove lecturer from course
 */
export const removeLecturer = async (courseId: string, userId: string) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const isLecturer = await courseRepository.isLecturer(courseId, userId);
  if (!isLecturer) {
    throw new Error('User is not a lecturer for this course');
  }

  return courseRepository.removeLecturer(courseId, userId);
};

/**
 * Update lecturer primary status
 */
export const updateLecturerPrimary = async (
  courseId: string,
  userId: string,
  isPrimary: boolean
) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  const isLecturer = await courseRepository.isLecturer(courseId, userId);
  if (!isLecturer) {
    throw new Error('User is not a lecturer for this course');
  }

  // If setting as primary, unset other primary lecturers
  if (isPrimary) {
    const lecturers = await courseRepository.getLecturers(courseId);
    for (const lecturer of lecturers.filter((l) => l.isPrimary && l.userId !== userId)) {
      await courseRepository.updateLecturerPrimary(courseId, lecturer.userId, false);
    }
  }

  return courseRepository.updateLecturerPrimary(courseId, userId, isPrimary);
};

/**
 * Get all lecturers for a course
 */
export const getCourseLecturers = async (courseId: string) => {
  return courseRepository.getLecturers(courseId);
};

// ============================================================================
// TAG MANAGEMENT
// ============================================================================

/**
 * Add tag to course by tag name
 */
export const addTag = async (courseId: string, tagName: string) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  return courseRepository.addCourseTag(courseId, tagName);
};

/**
 * Add tag to course by tag ID
 */
export const addTagById = async (courseId: string, tagId: number) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  return courseRepository.addCourseTagById(courseId, tagId);
};

/**
 * Remove tag from course
 */
export const removeTag = async (courseId: string, tagId: number) => {
  const course = await courseRepository.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  return courseRepository.removeCourseTag(courseId, tagId);
};

/**
 * Get all tags
 */
export const getAllTags = async (limit?: number, popularOnly = false) => {
  if (popularOnly) {
    return courseRepository.getPopularTags(limit);
  }
  return courseRepository.getAllTags();
};

/**
 * Create a new tag
 */
export const createTag = async (name: string, color?: string) => {
  // Check if tag already exists
  const existing = await courseRepository.getTagByName(name);
  if (existing) {
    throw new Error(`Tag "${name}" already exists`);
  }

  return courseRepository.createTag(name, color);
};

// ============================================================================
// SEARCH & ANALYTICS
// ============================================================================

/**
 * Search courses (full-text search)
 */
export const searchCourses = async (query: string, limit = 20) => {
  return courseRepository.list(
    { search: query, includeArchived: false },
    { page: 1, limit, sortBy: 'title', sortOrder: 'asc' }
  );
};

/**
 * Get courses by creator
 */
export const getCoursesByCreator = async (userId: string) => {
  return courseRepository.getCoursesByCreator(userId);
};

/**
 * Get courses by lecturer
 */
export const getCoursesByLecturer = async (userId: string) => {
  return courseRepository.getCoursesByLecturer(userId);
};

/**
 * Get course statistics
 */
export const getCourseStats = async (courseId: string) => {
  const course = await courseRepository.getWithRelations(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  return {
    courseId: course.id,
    code: course.code,
    title: course.title,
    totalInstances: course._count?.instances || 0,
    totalSyllabusItems: course._count?.syllabusItems || 0,
    totalAssignments: course._count?.assignmentTemplates || 0,
    totalResources: course._count?.resourceTemplates || 0,
    tags: course.tags?.map((t) => t.tag.name) || [],
    lecturers: course.lecturers?.length || 0,
    primaryLecturer: course.lecturers?.find((l) => l.isPrimary)?.user || null,
  };
};

// ============================================================================
// SERVICE EXPORT
// ============================================================================

export const courseService = {
  // Course CRUD
  create: createCourse,
  getById: getCourseById,
  list: listCourses,
  update: updateCourse,
  archive: archiveCourse,
  unarchive: unarchiveCourse,
  delete: deleteCourse,
  copy: copyCourse,

  // Lecturer management
  addLecturer,
  removeLecturer,
  updateLecturerPrimary,
  getLecturers: getCourseLecturers,

  // Tag management
  addTag,
  addTagById,
  removeTag,
  getAllTags,
  createTag,

  // Search & Analytics
  search: searchCourses,
  getCoursesByCreator,
  getCoursesByLecturer,
  getStats: getCourseStats,
};
