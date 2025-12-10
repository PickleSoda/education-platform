/**
 * Assignment Template Seed Data
 * Shared data used by both database seeding and OpenAPI documentation examples
 */

import type { AssignmentType, GradingMode } from '@prisma/client';

// ============================================================================
// ASSIGNMENT TEMPLATES
// ============================================================================

export interface SeedAssignmentTemplate {
  title: string;
  description: string;
  assignmentType: AssignmentType;
  gradingMode: GradingMode;
  maxPoints: number;
  weightPercentage: number;
  defaultDurationDays: number;
  instructions: string;
  gradingCriteria: Array<{
    name: string;
    description: string;
    maxPoints: number;
  }>;
}

export interface CourseAssignments {
  courseCode: string;
  templates: SeedAssignmentTemplate[];
}

// CS-101: Introduction to Programming
const cs101Assignments: SeedAssignmentTemplate[] = [
  {
    title: 'Variables and Data Types',
    description: 'Practice exercises on variable declaration, data types, and type conversion',
    assignmentType: 'homework',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 5,
    defaultDurationDays: 7,
    instructions:
      'Complete all exercises in the provided Jupyter notebook. Ensure your code runs without errors and produces the expected output. Submit your .ipynb file.',
    gradingCriteria: [
      {
        name: 'Correctness',
        description: 'All exercises produce correct output',
        maxPoints: 70,
      },
      {
        name: 'Code Quality',
        description: 'Code is well-organized and follows Python conventions',
        maxPoints: 20,
      },
      {
        name: 'Documentation',
        description: 'Code includes appropriate comments',
        maxPoints: 10,
      },
    ],
  },
  {
    title: 'Control Flow and Loops',
    description: 'Practice problems on if-statements, for loops, and while loops',
    assignmentType: 'homework',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 5,
    defaultDurationDays: 7,
    instructions:
      'Solve all programming challenges using appropriate control structures. Test your code with various inputs.',
    gradingCriteria: [
      {
        name: 'Correctness',
        description: 'Solutions work for all test cases',
        maxPoints: 80,
      },
      {
        name: 'Efficiency',
        description: 'Code uses appropriate algorithms',
        maxPoints: 20,
      },
    ],
  },
  {
    title: 'Midterm Exam',
    description: 'Comprehensive assessment covering weeks 1-7',
    assignmentType: 'midterm',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 20,
    defaultDurationDays: 1,
    instructions:
      'This is a timed exam. You will have 2 hours to complete all questions. Open book, but no collaboration allowed.',
    gradingCriteria: [
      {
        name: 'Multiple Choice',
        description: '20 questions on theory and concepts',
        maxPoints: 40,
      },
      {
        name: 'Coding Problems',
        description: '3 programming challenges',
        maxPoints: 60,
      },
    ],
  },
  {
    title: 'Functions and Modules',
    description: 'Build reusable functions and organize code into modules',
    assignmentType: 'homework',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 8,
    defaultDurationDays: 10,
    instructions:
      'Create a Python module with well-documented functions. Include unit tests for each function.',
    gradingCriteria: [
      {
        name: 'Functionality',
        description: 'All functions work as specified',
        maxPoints: 60,
      },
      {
        name: 'Testing',
        description: 'Comprehensive unit tests included',
        maxPoints: 20,
      },
      {
        name: 'Documentation',
        description: 'Clear docstrings and comments',
        maxPoints: 20,
      },
    ],
  },
  {
    title: 'Final Project',
    description: 'Build a complete Python application demonstrating course concepts',
    assignmentType: 'project',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 30,
    defaultDurationDays: 21,
    instructions:
      'Develop a command-line application of your choice. Must include file I/O, functions, classes, and error handling. Submit source code and documentation.',
    gradingCriteria: [
      {
        name: 'Functionality',
        description: 'Application works correctly and meets requirements',
        maxPoints: 40,
      },
      {
        name: 'Code Quality',
        description: 'Well-structured, readable, maintainable code',
        maxPoints: 30,
      },
      {
        name: 'Documentation',
        description: 'README, comments, and user guide',
        maxPoints: 15,
      },
      {
        name: 'Creativity',
        description: 'Innovative features and design',
        maxPoints: 15,
      },
    ],
  },
];

// CS-201: Data Structures and Algorithms
const cs201Assignments: SeedAssignmentTemplate[] = [
  {
    title: 'Array and List Operations',
    description: 'Implement basic operations on arrays and linked lists',
    assignmentType: 'homework',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 6,
    defaultDurationDays: 10,
    instructions:
      'Implement the specified data structures from scratch. No using built-in list classes.',
    gradingCriteria: [
      {
        name: 'Correctness',
        description: 'All operations work correctly',
        maxPoints: 70,
      },
      {
        name: 'Time Complexity',
        description: 'Meets required time complexity bounds',
        maxPoints: 30,
      },
    ],
  },
  {
    title: 'Trees and Graph Traversal',
    description: 'Implement binary search trees and graph traversal algorithms',
    assignmentType: 'homework',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 8,
    defaultDurationDays: 14,
    instructions:
      'Build a BST class with insert, delete, and search operations. Implement BFS and DFS for graphs.',
    gradingCriteria: [
      {
        name: 'Implementation',
        description: 'All required methods implemented correctly',
        maxPoints: 60,
      },
      {
        name: 'Algorithm Analysis',
        description: 'Written analysis of time and space complexity',
        maxPoints: 25,
      },
      {
        name: 'Testing',
        description: 'Comprehensive test cases',
        maxPoints: 15,
      },
    ],
  },
  {
    title: 'Algorithm Design Quiz',
    description: 'Timed assessment on algorithm design techniques',
    assignmentType: 'quiz',
    gradingMode: 'points',
    maxPoints: 50,
    weightPercentage: 10,
    defaultDurationDays: 1,
    instructions: 'Complete within 90 minutes. Show your work for partial credit.',
    gradingCriteria: [
      {
        name: 'Problem Solving',
        description: 'Correct algorithmic approach',
        maxPoints: 50,
      },
    ],
  },
  {
    title: 'Final Exam',
    description: 'Comprehensive final covering all course topics',
    assignmentType: 'final',
    gradingMode: 'points',
    maxPoints: 150,
    weightPercentage: 25,
    defaultDurationDays: 1,
    instructions:
      'Closed book examination. 3 hours. Covers data structures, algorithms, and complexity analysis.',
    gradingCriteria: [
      {
        name: 'Theory',
        description: 'Conceptual questions',
        maxPoints: 60,
      },
      {
        name: 'Implementation',
        description: 'Coding problems',
        maxPoints: 60,
      },
      {
        name: 'Analysis',
        description: 'Complexity analysis',
        maxPoints: 30,
      },
    ],
  },
];

// CS-301: Web Development Fundamentals
const cs301Assignments: SeedAssignmentTemplate[] = [
  {
    title: 'HTML & CSS Portfolio',
    description: 'Create a personal portfolio website using HTML5 and CSS3',
    assignmentType: 'homework',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 8,
    defaultDurationDays: 14,
    instructions:
      'Build a responsive portfolio site with multiple pages. Must include semantic HTML, CSS Grid/Flexbox, and modern design principles.',
    gradingCriteria: [
      {
        name: 'HTML Structure',
        description: 'Proper semantic HTML5 elements',
        maxPoints: 30,
      },
      {
        name: 'CSS Styling',
        description: 'Professional design and layout',
        maxPoints: 40,
      },
      {
        name: 'Responsiveness',
        description: 'Works on mobile, tablet, and desktop',
        maxPoints: 30,
      },
    ],
  },
  {
    title: 'JavaScript Interactive Features',
    description: 'Add interactive elements using vanilla JavaScript',
    assignmentType: 'homework',
    gradingMode: 'points',
    maxPoints: 100,
    weightPercentage: 10,
    defaultDurationDays: 10,
    instructions:
      'Implement form validation, dynamic content loading, and at least one interactive widget (e.g., image carousel, accordion).',
    gradingCriteria: [
      {
        name: 'Functionality',
        description: 'All features work correctly',
        maxPoints: 60,
      },
      {
        name: 'Code Quality',
        description: 'Clean, modular JavaScript',
        maxPoints: 25,
      },
      {
        name: 'User Experience',
        description: 'Intuitive and polished interactions',
        maxPoints: 15,
      },
    ],
  },
  {
    title: 'React Application',
    description: 'Build a single-page application using React',
    assignmentType: 'project',
    gradingMode: 'points',
    maxPoints: 150,
    weightPercentage: 25,
    defaultDurationDays: 21,
    instructions:
      'Create a React app with routing, state management, and API integration. Examples: task manager, weather app, movie database.',
    gradingCriteria: [
      {
        name: 'React Components',
        description: 'Well-structured component hierarchy',
        maxPoints: 40,
      },
      {
        name: 'State Management',
        description: 'Proper use of hooks and state',
        maxPoints: 35,
      },
      {
        name: 'API Integration',
        description: 'Fetches and displays external data',
        maxPoints: 35,
      },
      {
        name: 'UI/UX',
        description: 'Professional appearance and usability',
        maxPoints: 40,
      },
    ],
  },
];

export const seedAssignmentsByCourse: CourseAssignments[] = [
  { courseCode: 'CS-101', templates: cs101Assignments },
  { courseCode: 'CS-201', templates: cs201Assignments },
  { courseCode: 'CS-301', templates: cs301Assignments },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAssignmentsByCourseCode(courseCode: string): SeedAssignmentTemplate[] {
  const courseAssignments = seedAssignmentsByCourse.find((ca) => ca.courseCode === courseCode);
  return courseAssignments?.templates || [];
}

export function getTotalWeightForCourse(courseCode: string): number {
  const templates = getAssignmentsByCourseCode(courseCode);
  return templates.reduce((sum, template) => sum + template.weightPercentage, 0);
}
