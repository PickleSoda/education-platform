/**
 * Instance Seed Data
 * Shared data used by both database seeding and OpenAPI documentation examples
 */

import type { InstanceStatus } from '@prisma/client';

// ============================================================================
// COURSE INSTANCES
// ============================================================================

export interface SeedInstance {
  courseCode: string;
  semester: string;
  startDate: Date;
  endDate: Date;
  status: InstanceStatus;
  enrollmentLimit: number;
  enrollmentOpen: boolean;
}

export const seedInstances: SeedInstance[] = [
  // CS-101: Introduction to Programming - Multiple semesters
  {
    courseCode: 'CS-101',
    semester: 'Fall 2024',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-12-15'),
    status: 'completed',
    enrollmentLimit: 30,
    enrollmentOpen: false,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-05-15'),
    status: 'active',
    enrollmentLimit: 35,
    enrollmentOpen: true,
  },
  {
    courseCode: 'CS-101',
    semester: 'Fall 2025',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-12-15'),
    status: 'scheduled',
    enrollmentLimit: 30,
    enrollmentOpen: false,
  },

  // CS-201: Data Structures and Algorithms
  {
    courseCode: 'CS-201',
    semester: 'Fall 2024',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-12-15'),
    status: 'completed',
    enrollmentLimit: 25,
    enrollmentOpen: false,
  },
  {
    courseCode: 'CS-201',
    semester: 'Spring 2025',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-05-15'),
    status: 'active',
    enrollmentLimit: 28,
    enrollmentOpen: true,
  },

  // CS-301: Web Development Fundamentals
  {
    courseCode: 'CS-301',
    semester: 'Spring 2025',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-05-15'),
    status: 'active',
    enrollmentLimit: 30,
    enrollmentOpen: true,
  },
  {
    courseCode: 'CS-301',
    semester: 'Fall 2025',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-12-15'),
    status: 'scheduled',
    enrollmentLimit: 32,
    enrollmentOpen: false,
  },

  // CS-302: Database Systems
  {
    courseCode: 'CS-302',
    semester: 'Spring 2025',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-05-20'),
    status: 'active',
    enrollmentLimit: 25,
    enrollmentOpen: true,
  },

  // CS-401: Software Engineering Practices
  {
    courseCode: 'CS-401',
    semester: 'Fall 2024',
    startDate: new Date('2024-09-01'),
    endDate: new Date('2024-12-15'),
    status: 'completed',
    enrollmentLimit: 20,
    enrollmentOpen: false,
  },
  {
    courseCode: 'CS-401',
    semester: 'Spring 2025',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-05-15'),
    status: 'active',
    enrollmentLimit: 22,
    enrollmentOpen: true,
  },

  // CS-450: Introduction to Machine Learning
  {
    courseCode: 'CS-450',
    semester: 'Spring 2025',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-05-30'),
    status: 'active',
    enrollmentLimit: 20,
    enrollmentOpen: true,
  },
  {
    courseCode: 'CS-450',
    semester: 'Fall 2025',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-12-15'),
    status: 'draft',
    enrollmentLimit: 25,
    enrollmentOpen: false,
  },
];

// ============================================================================
// PUBLISHED ASSIGNMENTS (for active instances)
// ============================================================================

export interface SeedPublishedAssignment {
  courseCode: string;
  semester: string;
  templateTitle: string; // Reference to assignment template
  publishAt: Date | null;
  deadline: Date;
  lateDeadline: Date | null;
  latePenaltyPercent: number;
  status: 'draft' | 'scheduled' | 'published' | 'closed';
  autoPublish: boolean;
}

export const seedPublishedAssignments: SeedPublishedAssignment[] = [
  // CS-101 Spring 2025 - Active instance with published assignments
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Variables and Data Types',
    publishAt: null,
    deadline: new Date('2025-02-15T23:59:59'),
    lateDeadline: new Date('2025-02-17T23:59:59'),
    latePenaltyPercent: 20,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Control Flow and Loops',
    publishAt: null,
    deadline: new Date('2025-03-15T23:59:59'),
    lateDeadline: new Date('2025-03-17T23:59:59'),
    latePenaltyPercent: 20,
    status: 'published',
    autoPublish: false,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Midterm Exam',
    publishAt: new Date('2025-03-20T00:00:00'),
    deadline: new Date('2025-03-25T14:00:00'),
    lateDeadline: null,
    latePenaltyPercent: 0,
    status: 'scheduled',
    autoPublish: true,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Functions and Modules',
    publishAt: null,
    deadline: new Date('2025-04-20T23:59:59'),
    lateDeadline: new Date('2025-04-23T23:59:59'),
    latePenaltyPercent: 15,
    status: 'draft',
    autoPublish: false,
  },

  // CS-201 Spring 2025 - Active instance
  {
    courseCode: 'CS-201',
    semester: 'Spring 2025',
    templateTitle: 'Array and List Operations',
    publishAt: null,
    deadline: new Date('2025-03-01T23:59:59'),
    lateDeadline: new Date('2025-03-03T23:59:59'),
    latePenaltyPercent: 25,
    status: 'published',
    autoPublish: false,
  },
  {
    courseCode: 'CS-201',
    semester: 'Spring 2025',
    templateTitle: 'Trees and Graph Traversal',
    publishAt: null,
    deadline: new Date('2025-04-01T23:59:59'),
    lateDeadline: new Date('2025-04-05T23:59:59'),
    latePenaltyPercent: 20,
    status: 'draft',
    autoPublish: false,
  },

  // CS-301 Spring 2025 - Active instance
  {
    courseCode: 'CS-301',
    semester: 'Spring 2025',
    templateTitle: 'HTML & CSS Portfolio',
    publishAt: null,
    deadline: new Date('2025-02-28T23:59:59'),
    lateDeadline: new Date('2025-03-02T23:59:59'),
    latePenaltyPercent: 15,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-301',
    semester: 'Spring 2025',
    templateTitle: 'JavaScript Interactive Features',
    publishAt: null,
    deadline: new Date('2025-03-30T23:59:59'),
    lateDeadline: new Date('2025-04-02T23:59:59'),
    latePenaltyPercent: 20,
    status: 'published',
    autoPublish: false,
  },
  {
    courseCode: 'CS-301',
    semester: 'Spring 2025',
    templateTitle: 'React Application',
    publishAt: new Date('2025-04-01T00:00:00'),
    deadline: new Date('2025-05-10T23:59:59'),
    lateDeadline: new Date('2025-05-12T23:59:59'),
    latePenaltyPercent: 10,
    status: 'scheduled',
    autoPublish: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getInstancesByCourseCode(courseCode: string): SeedInstance[] {
  return seedInstances.filter((instance) => instance.courseCode === courseCode);
}

export function getActiveInstances(): SeedInstance[] {
  return seedInstances.filter((instance) => instance.status === 'active');
}

export function getPublishedAssignmentsForInstance(
  courseCode: string,
  semester: string
): SeedPublishedAssignment[] {
  return seedPublishedAssignments.filter(
    (pa) => pa.courseCode === courseCode && pa.semester === semester
  );
}

export function getInstanceSemesterOptions(): string[] {
  const semesters = new Set(seedInstances.map((i) => i.semester));
  return Array.from(semesters).sort();
}
