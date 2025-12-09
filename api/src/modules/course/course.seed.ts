/**
 * Course Seed Data
 * Shared data used by both database seeding and OpenAPI documentation examples
 */

// ============================================================================
// TAGS
// ============================================================================

export const seedTags = [
  { name: 'Programming', color: '#3B82F6' },
  { name: 'Web Development', color: '#10B981' },
  { name: 'Database', color: '#F59E0B' },
  { name: 'Algorithms', color: '#8B5CF6' },
  { name: 'Software Engineering', color: '#EF4444' },
  { name: 'Machine Learning', color: '#EC4899' },
  { name: 'Security', color: '#6366F1' },
  { name: 'Networking', color: '#14B8A6' },
] as const;

// ============================================================================
// COURSES
// ============================================================================

export const seedCourses = [
  {
    code: 'CS-101',
    title: 'Introduction to Programming',
    description:
      'A foundational course covering programming fundamentals using Python. Topics include variables, control structures, functions, and basic data structures.',
    credits: 6,
    typicalDurationWeeks: 14,
    tags: ['Programming'],
  },
  {
    code: 'CS-201',
    title: 'Data Structures and Algorithms',
    description:
      'Advanced study of data structures (trees, graphs, hash tables) and algorithm design techniques. Includes complexity analysis and optimization strategies.',
    credits: 6,
    typicalDurationWeeks: 14,
    tags: ['Programming', 'Algorithms'],
  },
  {
    code: 'CS-301',
    title: 'Web Development Fundamentals',
    description:
      'Comprehensive introduction to modern web development. Covers HTML, CSS, JavaScript, and frameworks like React. Includes both frontend and backend concepts.',
    credits: 6,
    typicalDurationWeeks: 14,
    tags: ['Web Development', 'Programming'],
  },
  {
    code: 'CS-302',
    title: 'Database Systems',
    description:
      'Study of relational database design, SQL, normalization, and query optimization. Includes hands-on experience with PostgreSQL and introduction to NoSQL databases.',
    credits: 4.5,
    typicalDurationWeeks: 12,
    tags: ['Database', 'Software Engineering'],
  },
  {
    code: 'CS-401',
    title: 'Software Engineering Practices',
    description:
      'Modern software development methodologies including Agile, CI/CD, testing strategies, and team collaboration. Covers real-world project management techniques.',
    credits: 6,
    typicalDurationWeeks: 14,
    tags: ['Software Engineering'],
  },
  {
    code: 'CS-450',
    title: 'Introduction to Machine Learning',
    description:
      'Foundations of machine learning including supervised and unsupervised learning, neural networks, and model evaluation. Practical applications using Python and scikit-learn.',
    credits: 6,
    typicalDurationWeeks: 14,
    tags: ['Machine Learning', 'Programming', 'Algorithms'],
  },
] as const;

// ============================================================================
// OPENAPI EXAMPLES
// ============================================================================

export const courseExamples = {
  // Example course for create request
  createRequest: {
    code: seedCourses[0].code,
    title: seedCourses[0].title,
    description: seedCourses[0].description,
    credits: seedCourses[0].credits,
    typicalDurationWeeks: seedCourses[0].typicalDurationWeeks,
    tags: seedCourses[0].tags,
  },

  // Example course response (after creation)
  courseResponse: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    code: seedCourses[0].code,
    title: seedCourses[0].title,
    description: seedCourses[0].description,
    credits: seedCourses[0].credits,
    typicalDurationWeeks: seedCourses[0].typicalDurationWeeks,
    isArchived: false,
    createdBy: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z',
    tags: [{ tag: { id: 1, name: 'Programming', color: '#3B82F6' } }],
    lecturers: [
      {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        isPrimary: true,
        user: {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'teacher@argus.edu',
          firstName: 'John',
          lastName: 'Smith',
        },
      },
    ],
    _count: { instances: 0 },
  },

  // Example for update request
  updateRequest: {
    title: 'Introduction to Programming with Python',
    description:
      'Updated course description with expanded curriculum covering advanced Python topics.',
    credits: 7.5,
  },

  // Example course list response
  courseListResponse: seedCourses.slice(0, 3).map((course, index) => ({
    id: `550e8400-e29b-41d4-a716-44665544000${index}`,
    code: course.code,
    title: course.title,
    description: course.description,
    credits: course.credits,
    typicalDurationWeeks: course.typicalDurationWeeks,
    isArchived: false,
    createdBy: '550e8400-e29b-41d4-a716-446655440001',
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z',
    tags: course.tags.map((tagName, tagIndex) => ({
      tag: {
        id: tagIndex + 1,
        name: tagName,
        color: seedTags.find((t) => t.name === tagName)?.color || '#808080',
      },
    })),
    _count: { instances: index },
  })),

  // Example copy request
  copyRequest: {
    newCode: 'CS-101-COPY',
  },

  // Tag examples
  tagResponse: seedTags[0],
  tagListResponse: seedTags.map((tag, index) => ({
    id: index + 1,
    name: tag.name,
    color: tag.color,
  })),
  createTagRequest: {
    name: 'Cloud Computing',
    color: '#0EA5E9',
  },

  // Lecturer examples
  lecturerResponse: {
    userId: '550e8400-e29b-41d4-a716-446655440001',
    isPrimary: true,
    user: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'teacher@argus.edu',
      firstName: 'John',
      lastName: 'Smith',
    },
  },
  addLecturerRequest: {
    userId: '550e8400-e29b-41d4-a716-446655440002',
    isPrimary: false,
  },

  // Stats example
  statsResponse: {
    courseId: '550e8400-e29b-41d4-a716-446655440000',
    code: seedCourses[0].code,
    title: seedCourses[0].title,
    totalInstances: 3,
    totalSyllabusItems: 12,
    totalAssignments: 5,
    totalResources: 8,
    tags: seedCourses[0].tags,
    lecturers: 2,
    primaryLecturer: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'teacher@argus.edu',
      firstName: 'John',
      lastName: 'Smith',
    },
  },
};
