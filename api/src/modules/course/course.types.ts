import { Course, Tag } from '@prisma/client';

// ============================================================================
// COURSE TYPES
// ============================================================================

export interface CourseCreateInput {
  code: string;
  title: string;
  description?: string | null;
  credits?: number | null;
  typicalDurationWeeks?: number | null;
  createdBy: string;
  tagIds?: number[];
  lecturerIds?: string[];
}

export interface CourseUpdateInput {
  code?: string;
  title?: string;
  description?: string | null;
  credits?: number | null;
  typicalDurationWeeks?: number | null;
  isArchived?: boolean;
}

export interface CourseListFilters {
  search?: string;
  tagIds?: number[];
  includeArchived?: boolean;
}

export interface CourseTag {
  courseId: string;
  tagId: number;
  tag: Tag;
}

export interface CourseLecturer {
  courseId: string;
  userId: string;
  isPrimary: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CourseWithRelations extends Course {
  tags?: CourseTag[];
  lecturers?: CourseLecturer[];
  _count?: {
    instances: number;
    syllabusItems?: number;
    assignmentTemplates?: number;
    resourceTemplates?: number;
  };
}

export interface CourseStats {
  courseId: string;
  code: string;
  title: string;
  totalInstances: number;
  totalSyllabusItems: number;
  totalAssignments: number;
  totalResources: number;
  tags: string[];
  lecturers: number;
  primaryLecturer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface CourseSearchResult {
  results: CourseWithRelations[];
  totalResults: number;
}
