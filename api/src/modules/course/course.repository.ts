import { Prisma, Course, Tag } from '@prisma/client';
import prisma from '@/client';
import { PaginationOptions, PaginatedResult } from '@/shared/repositories/base.repository';
import type {
  CourseCreateInput,
  CourseUpdateInput,
  CourseListFilters,
  CourseWithRelations,
} from './course.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform Prisma Decimal fields to numbers for JSON serialization
 */
const transformCourse = (course: any): CourseWithRelations => {
  if (!course) return course;
  return {
    ...course,
    credits: course.credits ? Number(course.credits) : course.credits,
  };
};

// ============================================================================
// REPOSITORY FUNCTIONS
// ============================================================================

/**
 * Create a new course with optional tags and lecturers
 */
export const createCourse = async (data: CourseCreateInput): Promise<CourseWithRelations> => {
  const result = await prisma.course.create({
    data: {
      code: data.code,
      title: data.title,
      description: data.description,
      credits: data.credits,
      typicalDurationWeeks: data.typicalDurationWeeks,
      createdBy: data.createdBy,
      tags: data.tagIds
        ? {
            create: data.tagIds.map((tagId) => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          }
        : undefined,
      lecturers: data.lecturerIds
        ? {
            create: data.lecturerIds.map((id, index) => ({
              userId: id,
              isPrimary: index === 0,
            })),
          }
        : undefined,
    },
    include: {
      tags: { include: { tag: true } },
      lecturers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return transformCourse(result) as CourseWithRelations;
};

/**
 * Get course by ID
 */
export const findCourseById = async (courseId: string): Promise<Course | null> => {
  return prisma.course.findUnique({
    where: { id: courseId },
  });
};

/**
 * Get course with all related data (tags, lecturers, counts)
 */
export const getCourseWithRelations = async (
  courseId: string
): Promise<CourseWithRelations | null> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      tags: { include: { tag: true } },
      lecturers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: {
        select: {
          instances: true,
          syllabusItems: true,
          assignmentTemplates: true,
          resourceTemplates: true,
        },
      },
    },
  });

  return course ? (transformCourse(course) as CourseWithRelations) : null;
};

/**
 * Get course with all templates (syllabus, assignments, resources)
 */
export const getCourseWithTemplates = async (courseId: string) => {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      tags: { include: { tag: true } },
      lecturers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      syllabusItems: {
        orderBy: { sortOrder: 'asc' },
      },
      assignmentTemplates: {
        orderBy: { sortOrder: 'asc' },
        include: {
          gradingCriteria: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      resourceTemplates: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
};

/**
 * List courses with filtering, search, and pagination
 */
export const listCourses = async (
  filters: CourseListFilters = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<CourseWithRelations>> => {
  const { search, tagIds, includeArchived = false } = filters;
  const { page = 1, limit = 20, sortBy = 'title', sortOrder = 'asc' } = options;

  const where: Prisma.CourseWhereInput = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(tagIds?.length && {
      tags: { some: { tagId: { in: tagIds } } },
    }),
    ...(!includeArchived && { isArchived: false }),
  };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        lecturers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: { select: { instances: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.course.count({ where }),
  ]);

  return {
    results: items.map((item) => transformCourse(item)) as CourseWithRelations[],
    totalResults: total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Update course details
 */
export const updateCourse = async (
  courseId: string,
  data: CourseUpdateInput
): Promise<CourseWithRelations> => {
  const result = await prisma.course.update({
    where: { id: courseId },
    data,
    include: {
      tags: { include: { tag: true } },
      lecturers: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  return transformCourse(result) as CourseWithRelations;
};

/**
 * Archive a course (soft delete)
 */
export const archiveCourse = async (courseId: string): Promise<Course> => {
  return prisma.course.update({
    where: { id: courseId },
    data: { isArchived: true },
  });
};

/**
 * Unarchive a course
 */
export const unarchiveCourse = async (courseId: string): Promise<Course> => {
  return prisma.course.update({
    where: { id: courseId },
    data: { isArchived: false },
  });
};

/**
 * Delete a course (hard delete)
 */
export const deleteCourse = async (courseId: string): Promise<Course> => {
  return prisma.course.delete({
    where: { id: courseId },
  });
};

/**
 * Add a tag to a course by tag name
 */
export const addCourseTag = async (courseId: string, tagName: string) => {
  return prisma.courseTag.create({
    data: {
      course: {
        connect: { id: courseId },
      },
      tag: {
        connectOrCreate: {
          where: { name: tagName },
          create: { name: tagName },
        },
      },
    },
    include: { tag: true },
  });
};

/**
 * Add a tag to a course by tag ID
 */
export const addCourseTagById = async (courseId: string, tagId: number) => {
  return prisma.courseTag.create({
    data: {
      course: {
        connect: { id: courseId },
      },
      tag: {
        connect: { id: tagId },
      },
    },
    include: { tag: true },
  });
};

/**
 * Remove a tag from a course
 */
export const removeCourseTag = async (courseId: string, tagId: number) => {
  return prisma.courseTag.delete({
    where: {
      courseId_tagId: {
        courseId,
        tagId,
      },
    },
  });
};

/**
 * Add a lecturer to a course
 */
export const addCourseLecturer = async (courseId: string, userId: string, isPrimary = false) => {
  return prisma.courseLecturer.create({
    data: {
      courseId,
      userId,
      isPrimary,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Remove a lecturer from a course
 */
export const removeCourseLecturer = async (courseId: string, userId: string) => {
  return prisma.courseLecturer.delete({
    where: {
      courseId_userId: {
        courseId,
        userId,
      },
    },
  });
};

/**
 * Update lecturer primary status
 */
export const updateLecturerPrimary = async (
  courseId: string,
  userId: string,
  isPrimary: boolean
) => {
  return prisma.courseLecturer.update({
    where: {
      courseId_userId: {
        courseId,
        userId,
      },
    },
    data: { isPrimary },
  });
};

/**
 * Get all lecturers for a course
 */
export const getCourseLecturers = async (courseId: string) => {
  return prisma.courseLecturer.findMany({
    where: { courseId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [{ isPrimary: 'desc' }, { user: { lastName: 'asc' } }],
  });
};

/**
 * Check if a user is a lecturer for a course
 */
export const isCourseLecturer = async (courseId: string, userId: string): Promise<boolean> => {
  const lecturer = await prisma.courseLecturer.findUnique({
    where: {
      courseId_userId: {
        courseId,
        userId,
      },
    },
  });
  return !!lecturer;
};

/**
 * Get all courses created by a user
 */
export const getCoursesByCreator = async (userId: string) => {
  return prisma.course.findMany({
    where: { createdBy: userId },
    include: {
      tags: { include: { tag: true } },
      _count: { select: { instances: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get all courses where user is a lecturer
 */
export const getCoursesByLecturer = async (userId: string) => {
  return prisma.course.findMany({
    where: {
      lecturers: {
        some: { userId },
      },
    },
    include: {
      tags: { include: { tag: true } },
      lecturers: {
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      _count: { select: { instances: true } },
    },
    orderBy: { title: 'asc' },
  });
};

// ============================================================================
// TAG QUERIES
// ============================================================================

/**
 * Get all tags
 */
export const getAllTags = async (): Promise<Tag[]> => {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });
};

/**
 * Get tag by name
 */
export const getTagByName = async (name: string): Promise<Tag | null> => {
  return prisma.tag.findUnique({
    where: { name },
  });
};

/**
 * Create a new tag
 */
export const createTag = async (name: string, color?: string): Promise<Tag> => {
  return prisma.tag.create({
    data: { name, color },
  });
};

/**
 * Get popular tags (by course count)
 */
export const getPopularTags = async (limit = 10) => {
  return prisma.tag.findMany({
    include: {
      _count: {
        select: { courses: true },
      },
    },
    orderBy: {
      courses: {
        _count: 'desc',
      },
    },
    take: limit,
  });
};

// ============================================================================
// REPOSITORY EXPORT
// ============================================================================

export const courseRepository = {
  // Course CRUD
  create: createCourse,
  findById: findCourseById,
  getWithRelations: getCourseWithRelations,
  getWithTemplates: getCourseWithTemplates,
  list: listCourses,
  update: updateCourse,
  archive: archiveCourse,
  unarchive: unarchiveCourse,
  delete: deleteCourse,

  // Course-Lecturer management
  addLecturer: addCourseLecturer,
  removeLecturer: removeCourseLecturer,
  updateLecturerPrimary,
  getLecturers: getCourseLecturers,
  isLecturer: isCourseLecturer,
  getCoursesByCreator,
  getCoursesByLecturer,

  // Tag management
  addCourseTag,
  addCourseTagById,
  removeCourseTag,
  getAllTags,
  getTagByName,
  createTag,
  getPopularTags,
};
