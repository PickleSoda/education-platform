import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

async function setupTestDatabase() {
  try {
    console.log('🔧 Setting up test database...');

    // Check if we're using test database
    if (!process.env.DATABASE_URL?.includes('test')) {
      throw new Error(
        'Must use a test database. DATABASE_URL should contain "test".'
      );
    }

    console.log('📦 Test database URL:', process.env.DATABASE_URL);

    // Apply migrations
    console.log('📝 Applying migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env },
    });

    // Clear all data
    console.log('🧹 Cleaning test database...');
    await prisma.$transaction([
      // Delete in correct order due to foreign keys
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

    console.log('✅ Test database setup complete!');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
// eslint-disable-next-line no-undef
if (require.main === module) {
  setupTestDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { setupTestDatabase };
