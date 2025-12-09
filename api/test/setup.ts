import { beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  // Ensure we're using test database
  if (!process.env.DATABASE_URL?.includes('test')) {
    throw new Error(
      'Tests must use a test database. Check your DATABASE_URL environment variable.'
    );
  }

  // Set test-specific environment variables
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_ACCESS_EXPIRATION_MINUTES = '15';
  process.env.JWT_REFRESH_EXPIRATION_DAYS = '30';
  process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES = '10';
  process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES = '10';

  // Clean database before tests
  console.log('🧹 Cleaning test database...');
  await prisma.$transaction([
    prisma.submissionGrade.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.publishedGradingCriteria.deleteMany(),
    prisma.publishedResource.deleteMany(),
    prisma.publishedAssignment.deleteMany(),
    prisma.gradingCriteria.deleteMany(),
    prisma.resourceTemplate.deleteMany(),
    prisma.assignmentTemplate.deleteMany(),
    prisma.commentReaction.deleteMany(),
    prisma.postReaction.deleteMany(),
    prisma.forumComment.deleteMany(),
    prisma.forumPostTag.deleteMany(),
    prisma.forumPost.deleteMany(),
    prisma.forumTag.deleteMany(),
    prisma.forum.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.notificationSetting.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.instanceLecturer.deleteMany(),
    prisma.courseLecturer.deleteMany(),
    prisma.syllabusItem.deleteMany(),
    prisma.courseInstance.deleteMany(),
    prisma.courseTag.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.course.deleteMany(),
    prisma.teacherProfile.deleteMany(),
    prisma.studentProfile.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.role.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  console.log('✅ Test database cleaned');
});

afterAll(async () => {
  await prisma.$disconnect();
});
