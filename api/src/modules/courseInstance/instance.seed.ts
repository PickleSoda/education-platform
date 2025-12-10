/**
 * Instance Seed Data
 * Shared data used by both database seeding and OpenAPI documentation examples
 */

import type { InstanceStatus } from '@prisma/client';

// Helper to get dynamic dates
const now = new Date();
const getDate = (daysOffset: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + daysOffset);
  return date;
};

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
    startDate: getDate(-120), // ~4 months ago
    endDate: getDate(-30), // ~1 month ago
    status: 'completed',
    enrollmentLimit: 30,
    enrollmentOpen: false,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    startDate: getDate(-60), // ~2 months ago
    endDate: getDate(60), // ~2 months from now
    status: 'active',
    enrollmentLimit: 35,
    enrollmentOpen: true,
  },
  {
    courseCode: 'CS-101',
    semester: 'Fall 2025',
    startDate: getDate(90), // ~3 months from now
    endDate: getDate(180), // ~6 months from now
    status: 'scheduled',
    enrollmentLimit: 30,
    enrollmentOpen: false,
  },

  // CS-201: Data Structures and Algorithms
  {
    courseCode: 'CS-201',
    semester: 'Fall 2024',
    startDate: getDate(-120),
    endDate: getDate(-30),
    status: 'completed',
    enrollmentLimit: 25,
    enrollmentOpen: false,
  },
  {
    courseCode: 'CS-201',
    semester: 'Spring 2025',
    startDate: getDate(-45), // Started 45 days ago
    endDate: getDate(75), // Ends in 75 days
    status: 'active',
    enrollmentLimit: 28,
    enrollmentOpen: true,
  },

  // CS-301: Web Development Fundamentals
  {
    courseCode: 'CS-301',
    semester: 'Spring 2025',
    startDate: getDate(-50),
    endDate: getDate(70),
    status: 'active',
    enrollmentLimit: 30,
    enrollmentOpen: true,
  },
  {
    courseCode: 'CS-301',
    semester: 'Fall 2025',
    startDate: getDate(90),
    endDate: getDate(180),
    status: 'scheduled',
    enrollmentLimit: 32,
    enrollmentOpen: false,
  },

  // CS-302: Database Systems
  {
    courseCode: 'CS-302',
    semester: 'Spring 2025',
    startDate: getDate(-40),
    endDate: getDate(80),
    status: 'active',
    enrollmentLimit: 25,
    enrollmentOpen: true,
  },

  // CS-401: Software Engineering Practices
  {
    courseCode: 'CS-401',
    semester: 'Fall 2024',
    startDate: getDate(-120),
    endDate: getDate(-30),
    status: 'completed',
    enrollmentLimit: 20,
    enrollmentOpen: false,
  },
  {
    courseCode: 'CS-401',
    semester: 'Spring 2025',
    startDate: getDate(-55),
    endDate: getDate(65),
    status: 'active',
    enrollmentLimit: 22,
    enrollmentOpen: true,
  },

  // CS-450: Introduction to Machine Learning
  {
    courseCode: 'CS-450',
    semester: 'Spring 2025',
    startDate: getDate(-35),
    endDate: getDate(85),
    status: 'active',
    enrollmentLimit: 20,
    enrollmentOpen: true,
  },
  {
    courseCode: 'CS-450',
    semester: 'Fall 2025',
    startDate: getDate(90),
    endDate: getDate(180),
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
  // CS-101 Spring 2025 - Active instance with varied assignments
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Variables and Data Types',
    publishAt: null,
    deadline: getDate(-30), // Past - already closed
    lateDeadline: getDate(-28),
    latePenaltyPercent: 20,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Control Flow and Loops',
    publishAt: null,
    deadline: getDate(-10), // Recently past - can be graded
    lateDeadline: getDate(-8),
    latePenaltyPercent: 20,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Midterm Exam',
    publishAt: null,
    deadline: getDate(5), // Due in 5 days - can submit
    lateDeadline: null,
    latePenaltyPercent: 0,
    status: 'published',
    autoPublish: false,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Functions and Modules',
    publishAt: null,
    deadline: getDate(20), // Due in 20 days - can submit
    lateDeadline: getDate(23),
    latePenaltyPercent: 15,
    status: 'published',
    autoPublish: false,
  },
  {
    courseCode: 'CS-101',
    semester: 'Spring 2025',
    templateTitle: 'Final Project',
    publishAt: getDate(30),
    deadline: getDate(50),
    lateDeadline: getDate(52),
    latePenaltyPercent: 10,
    status: 'scheduled',
    autoPublish: true,
  },

  // CS-201 Spring 2025 - Active instance
  {
    courseCode: 'CS-201',
    semester: 'Spring 2025',
    templateTitle: 'Array and List Operations',
    publishAt: null,
    deadline: getDate(-20), // Past - graded
    lateDeadline: getDate(-18),
    latePenaltyPercent: 25,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-201',
    semester: 'Spring 2025',
    templateTitle: 'Trees and Graph Traversal',
    publishAt: null,
    deadline: getDate(7), // Due in a week - can submit
    lateDeadline: getDate(11),
    latePenaltyPercent: 20,
    status: 'published',
    autoPublish: false,
  },
  {
    courseCode: 'CS-201',
    semester: 'Spring 2025',
    templateTitle: 'Algorithm Design Quiz',
    publishAt: null,
    deadline: getDate(15),
    lateDeadline: null,
    latePenaltyPercent: 0,
    status: 'published',
    autoPublish: false,
  },
  {
    courseCode: 'CS-201',
    semester: 'Spring 2025',
    templateTitle: 'Final Exam',
    publishAt: getDate(40),
    deadline: getDate(60),
    lateDeadline: null,
    latePenaltyPercent: 0,
    status: 'scheduled',
    autoPublish: true,
  },

  // CS-301 Spring 2025 - Active instance
  {
    courseCode: 'CS-301',
    semester: 'Spring 2025',
    templateTitle: 'HTML & CSS Portfolio',
    publishAt: null,
    deadline: getDate(-25), // Past - graded
    lateDeadline: getDate(-23),
    latePenaltyPercent: 15,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-301',
    semester: 'Spring 2025',
    templateTitle: 'JavaScript Interactive Features',
    publishAt: null,
    deadline: getDate(3), // Due in 3 days - urgent!
    lateDeadline: getDate(5),
    latePenaltyPercent: 20,
    status: 'published',
    autoPublish: false,
  },
  {
    courseCode: 'CS-301',
    semester: 'Spring 2025',
    templateTitle: 'React Application',
    publishAt: null,
    deadline: getDate(35),
    lateDeadline: getDate(37),
    latePenaltyPercent: 10,
    status: 'published',
    autoPublish: false,
  },

  // CS-302 Spring 2025 - Active instance
  {
    courseCode: 'CS-302',
    semester: 'Spring 2025',
    templateTitle: 'SQL Queries Practice',
    publishAt: null,
    deadline: getDate(-15), // Past - graded
    lateDeadline: getDate(-13),
    latePenaltyPercent: 20,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-302',
    semester: 'Spring 2025',
    templateTitle: 'Database Design Project',
    publishAt: null,
    deadline: getDate(10),
    lateDeadline: getDate(13),
    latePenaltyPercent: 15,
    status: 'published',
    autoPublish: false,
  },

  // CS-401 Spring 2025 - Active instance
  {
    courseCode: 'CS-401',
    semester: 'Spring 2025',
    templateTitle: 'Agile Sprint 1',
    publishAt: null,
    deadline: getDate(-5), // Just passed - can grade
    lateDeadline: getDate(-3),
    latePenaltyPercent: 10,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-401',
    semester: 'Spring 2025',
    templateTitle: 'Testing Documentation',
    publishAt: null,
    deadline: getDate(12),
    lateDeadline: getDate(14),
    latePenaltyPercent: 15,
    status: 'published',
    autoPublish: false,
  },

  // CS-450 Spring 2025 - Active instance
  {
    courseCode: 'CS-450',
    semester: 'Spring 2025',
    templateTitle: 'Linear Regression Analysis',
    publishAt: null,
    deadline: getDate(-8), // Past - graded
    lateDeadline: getDate(-6),
    latePenaltyPercent: 25,
    status: 'closed',
    autoPublish: false,
  },
  {
    courseCode: 'CS-450',
    semester: 'Spring 2025',
    templateTitle: 'Neural Network Implementation',
    publishAt: null,
    deadline: getDate(18),
    lateDeadline: getDate(21),
    latePenaltyPercent: 20,
    status: 'published',
    autoPublish: false,
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
