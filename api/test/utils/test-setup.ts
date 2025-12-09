import { PrismaClient, TokenType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { add } from 'date-fns';

export const prisma = new PrismaClient();

// Test database setup
beforeAll(async () => {
  // Ensure we're using test database
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must run with NODE_ENV=test');
  }

  // Ensure roles exist in database
  await ensureRolesExist();

  // Clean database before all tests
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean database before each test
  await cleanDatabase();
});

afterEach(async () => {
  // Clean database after each test
  await cleanDatabase();
});

// Ensure roles exist in database (student, teacher, admin)
async function ensureRolesExist() {
  const rolesToCreate = [
    { name: 'student', description: 'Student role' },
    { name: 'teacher', description: 'Teacher role' },
    { name: 'admin', description: 'Administrator role' },
  ];

  for (const roleData of rolesToCreate) {
    await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData,
    });
  }
}

async function cleanDatabase() {
  try {
    // Delete in order to respect foreign key constraints
    await prisma.$transaction([
      prisma.token.deleteMany({}),
      prisma.submissionGrade.deleteMany({}),
      prisma.submission.deleteMany({}),
      prisma.publishedResource.deleteMany({}),
      prisma.publishedGradingCriteria.deleteMany({}),
      prisma.publishedAssignment.deleteMany({}),
      prisma.gradingCriteria.deleteMany({}),
      prisma.resourceTemplate.deleteMany({}),
      prisma.assignmentTemplate.deleteMany({}),
      prisma.syllabusItem.deleteMany({}),
      prisma.enrollment.deleteMany({}),
      prisma.instanceLecturer.deleteMany({}),
      prisma.courseInstance.deleteMany({}),
      prisma.courseLecturer.deleteMany({}),
      prisma.courseTag.deleteMany({}),
      prisma.tag.deleteMany({}),
      prisma.course.deleteMany({}),
      prisma.announcement.deleteMany({}),
      prisma.commentReaction.deleteMany({}),
      prisma.postReaction.deleteMany({}),
      prisma.forumPostTag.deleteMany({}),
      prisma.forumTag.deleteMany({}),
      prisma.forumComment.deleteMany({}),
      prisma.forumPost.deleteMany({}),
      prisma.forum.deleteMany({}),
      prisma.notification.deleteMany({}),
      prisma.notificationSetting.deleteMany({}),
      prisma.teacherProfile.deleteMany({}),
      prisma.studentProfile.deleteMany({}),
      prisma.userRole.deleteMany({}),
      prisma.user.deleteMany({}),
      // Note: Not deleting roles as they should persist
    ]);
  } catch (error) {
    console.error('Database cleanup error:', error);
  }
}

// Faker utilities for creating test data
export const createFakeUser = async (overrides: Partial<any> = {}) => {
  // Get role from database (default to student)
  const roleName = overrides.roleName || 'student';
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  
  if (!role) {
    throw new Error(`Role ${roleName} not found in database`);
  }

  return {
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    passwordHash: faker.internet.password({ length: 12 }),
    isEmailVerified: faker.datatype.boolean(),
    ...overrides,
    roleId: role.id,
  };
};

export const createFakeNotification = (overrides: Partial<any> = {}) => ({
  type: faker.helpers.arrayElement([
    'assignment_published',
    'assignment_deadline',
    'assignment_graded',
    'enrollment_confirmed',
    'announcement',
    'forum_reply',
    'forum_mention',
    'course_started',
    'course_completed',
    'grade_updated',
    'resource_published',
  ]),
  title: faker.lorem.sentence(),
  message: faker.lorem.paragraph(),
  isRead: faker.datatype.boolean(),
  data: undefined,
  ...overrides,
});

export const createFakeToken = (overrides: Partial<any> = {}) => ({
  token: faker.string.alphanumeric(32),
  type: faker.helpers.arrayElement(['ACCESS', 'REFRESH', 'RESET_PASSWORD', 'VERIFY_EMAIL']),
  expires: faker.date.future(),
  blacklisted: faker.datatype.boolean(),
  ...overrides,
});

// Helper functions for creating test data in database
export const createTestUser = async (overrides: Partial<any> = {}) => {
  const roleName = overrides.roleName || 'student';
  delete overrides.roleName; // Remove from overrides so it doesn't get passed to Prisma
  
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    throw new Error(`Role ${roleName} not found in database`);
  }

  const user = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      passwordHash: faker.internet.password({ length: 12 }),
      ...overrides,
    },
  });

  // Create UserRole junction
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });

  return user;
};

export const createTestNotification = async (userId: string, overrides: Partial<any> = {}) => {
  const notificationData = createFakeNotification(overrides);
  return await prisma.notification.create({
    data: {
      userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      isRead: notificationData.isRead,
      data: notificationData.data,
    },
  });
};

// Helper to generate JWT token
export const generateJWTToken = (userId: string, type: TokenType = TokenType.ACCESS) => {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret';
  const expires = add(new Date(), { minutes: 15 });

  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expires.getTime() / 1000),
    type,
  };

  return jwt.sign(payload, secret);
};

// Helper to generate expired JWT token
export const generateExpiredJWTToken = (userId: string, type: TokenType = TokenType.ACCESS) => {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret';
  const expires = add(new Date(), { minutes: -15 }); // Expired 15 minutes ago

  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expires.getTime() / 1000),
    type,
  };

  return jwt.sign(payload, secret);
};

// Helper to create a token in database
export const createTestToken = async (userId: string, overrides: Partial<any> = {}) => {
  const tokenData = createFakeToken(overrides);
  return await prisma.token.create({
    data: {
      ...tokenData,
      userId,
    },
  });
};

// Helper for creating authenticated user with JWT token
export const createAuthenticatedUser = async (overrides: Partial<any> = {}) => {
  const user = await createTestUser(overrides);
  const jwtToken = generateJWTToken(user.id, TokenType.ACCESS);

  // Save the JWT token to database
  await prisma.token.create({
    data: {
      token: jwtToken,
      userId: user.id,
      type: TokenType.ACCESS,
      expires: add(new Date(), { minutes: 15 }),
      blacklisted: false,
    },
  });

  return { user, token: { token: jwtToken } };
};

// Helper for creating admin user
export const createAdminUser = async (overrides: Partial<any> = {}) => {
  return await createTestUser({
    roleName: 'admin',
    ...overrides,
  });
};

// Helper for creating admin user with JWT token
export const createAuthenticatedAdminUser = async (overrides: Partial<any> = {}) => {
  const user = await createAdminUser(overrides);
  const jwtToken = generateJWTToken(user.id, TokenType.ACCESS);

  // Save the JWT token to database
  await prisma.token.create({
    data: {
      token: jwtToken,
      userId: user.id,
      type: TokenType.ACCESS,
      expires: add(new Date(), { minutes: 15 }),
      blacklisted: false,
    },
  });

  return { user, token: { token: jwtToken } };
};
