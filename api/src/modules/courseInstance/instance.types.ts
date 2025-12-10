import {
  CourseInstance,
  InstanceStatus,
  PublishedAssignment,
  PublishedResource,
  Forum,
} from '@prisma/client';

// ============================================================================
// COURSE INSTANCE TYPES
// ============================================================================

export interface InstanceCreateInput {
  courseId: string;
  semester: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
  enrollmentLimit?: number | null;
  enrollmentOpen?: boolean;
  lecturerIds?: string[];
}

export interface InstanceUpdateInput {
  semester?: string;
  startDate?: Date;
  endDate?: Date;
  enrollmentLimit?: number | null;
  enrollmentOpen?: boolean;
  status?: InstanceStatus;
}

export interface InstanceListFilters {
  courseId?: string;
  status?: InstanceStatus;
  semester?: string;
  lecturerId?: string;
  studentId?: string;
  includeArchived?: boolean;
}

export interface InstanceLecturerData {
  userId: string;
  role?: string;
  isPrimary?: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface InstanceWithRelations extends CourseInstance {
  course?: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    credits: number | null;
  };
  lecturers?: InstanceLecturerData[];
  forums?: Forum[];
  _count?: {
    enrollments: number;
    publishedAssignments: number;
    publishedResources: number;
  };
}

export interface InstanceWithDetails extends InstanceWithRelations {
  publishedAssignments?: PublishedAssignment[];
  publishedResources?: PublishedResource[];
}

// ============================================================================
// PUBLISHED ASSIGNMENT TYPES
// ============================================================================

export interface PublishAssignmentInput {
  instanceId: string;
  templateId: string;
  publishAt?: Date | null;
  deadline: Date;
  lateDeadline?: Date | null;
  latePenaltyPercent?: number | null;
  autoPublish?: boolean;
  publishedBy: string;
}

export interface PublishedAssignmentUpdateInput {
  title?: string;
  description?: string | null;
  instructions?: string | null;
  deadline?: Date;
  lateDeadline?: Date | null;
  latePenaltyPercent?: number | null;
  publishAt?: Date | null;
  autoPublish?: boolean;
}

export interface PublishedAssignmentWithCriteria extends PublishedAssignment {
  gradingCriteria?: {
    id: string;
    name: string;
    description: string | null;
    maxPoints: number;
    sortOrder: number;
  }[];
  template?: {
    id: string;
    title: string;
  };
  _count?: {
    submissions: number;
  };
}

// ============================================================================
// PUBLISHED RESOURCE TYPES
// ============================================================================

export interface PublishResourceInput {
  instanceId: string;
  templateId?: string;
  title: string;
  description?: string | null;
  resourceType: string;
  url?: string | null;
  fileData?: any;
  publishAt?: Date | null;
  autoPublish?: boolean;
  publishedBy: string;
}

export interface PublishedResourceUpdateInput {
  title?: string;
  description?: string | null;
  url?: string | null;
  publishAt?: Date | null;
  autoPublish?: boolean;
}

// ============================================================================
// INSTANCE STATS
// ============================================================================

export interface InstanceStats {
  instanceId: string;
  courseCode: string;
  courseTitle: string;
  semester: string;
  status: InstanceStatus;
  enrollmentCount: number;
  enrollmentLimit: number | null;
  assignmentCount: number;
  resourceCount: number;
  submissionStats: {
    total: number;
    pending: number;
    graded: number;
  };
}
