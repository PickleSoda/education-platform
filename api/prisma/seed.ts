import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedTags, seedCourses } from '../src/modules/course/course.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clean existing data (optional, be careful in production)
  console.log('Cleaning existing data...');
  await prisma.courseLecturer.deleteMany();
  await prisma.courseTag.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Roles
  console.log('Creating roles...');
  const studentRole = await prisma.role.create({
    data: {
      name: 'student',
      description: 'Student role with basic course access and assignment submission rights',
    },
  });

  const teacherRole = await prisma.role.create({
    data: {
      name: 'teacher',
      description: 'Teacher role with course creation and management rights',
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Administrator role with full system access',
    },
  });

  console.log('✓ Roles created:', { studentRole, teacherRole, adminRole });

  // 2. Create Admin User
  console.log('Creating admin user...');
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@argus.edu',
      passwordHash: adminPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  console.log('✓ Admin user created:', {
    email: adminUser.email,
    name: `${adminUser.firstName} ${adminUser.lastName}`,
    roles: adminUser.roles.map((r) => r.role.name),
  });

  // 3. Create Sample Teacher User
  console.log('Creating teacher user...');
  const teacherPasswordHash = await bcrypt.hash('Teacher123!', 10);
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@argus.edu',
      passwordHash: teacherPasswordHash,
      firstName: 'John',
      lastName: 'Smith',
      isActive: true,
      roles: {
        create: {
          roleId: teacherRole.id,
          grantedBy: adminUser.id,
        },
      },
      teacherProfile: {
        create: {
          department: 'Computer Science',
          title: 'Professor',
          bio: 'Experienced computer science educator with 10+ years in software engineering.',
          officeLocation: 'Building A, Room 301',
        },
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      teacherProfile: true,
    },
  });

  console.log('✓ Teacher user created:', {
    email: teacherUser.email,
    name: `${teacherUser.firstName} ${teacherUser.lastName}`,
    roles: teacherUser.roles.map((r) => r.role.name),
    profile: teacherUser.teacherProfile,
  });

  // 4. Create Sample Student Users
  console.log('Creating student users...');
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@argus.edu',
      passwordHash: studentPasswordHash,
      firstName: 'Alice',
      lastName: 'Johnson',
      isActive: true,
      roles: {
        create: {
          roleId: studentRole.id,
          grantedBy: adminUser.id,
        },
      },
      studentProfile: {
        create: {
          studentId: 'S2023001',
          program: 'Computer Science',
          enrollmentYear: 2023,
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@argus.edu',
      passwordHash: studentPasswordHash,
      firstName: 'Bob',
      lastName: 'Williams',
      isActive: true,
      roles: {
        create: {
          roleId: studentRole.id,
          grantedBy: adminUser.id,
        },
      },
      studentProfile: {
        create: {
          studentId: 'S2024001',
          program: 'Information Systems',
          enrollmentYear: 2024,
        },
      },
    },
  });

  console.log('✓ Student users created:', [
    {
      email: student1.email,
      name: `${student1.firstName} ${student1.lastName}`,
    },
    {
      email: student2.email,
      name: `${student2.firstName} ${student2.lastName}`,
    },
  ]);

  // 5. Create Tags
  console.log('Creating tags...');
  const createdTags = await Promise.all(
    seedTags.map((tag) =>
      prisma.tag.create({
        data: {
          name: tag.name,
          color: tag.color,
        },
      })
    )
  );

  const tagMap = new Map(createdTags.map((tag) => [tag.name, tag]));
  console.log(
    '✓ Tags created:',
    createdTags.map((t) => t.name)
  );

  // 6. Create Courses
  console.log('Creating courses...');
  const createdCourses = [];

  for (const courseData of seedCourses) {
    const course = await prisma.course.create({
      data: {
        code: courseData.code,
        title: courseData.title,
        description: courseData.description,
        credits: courseData.credits,
        typicalDurationWeeks: courseData.typicalDurationWeeks,
        createdBy: teacherUser.id,
        tags: {
          create: courseData.tags.map((tagName) => ({
            tag: {
              connect: { id: tagMap.get(tagName)!.id },
            },
          })),
        },
        lecturers: {
          create: {
            userId: teacherUser.id,
            isPrimary: true,
          },
        },
      },
      include: {
        tags: { include: { tag: true } },
        lecturers: true,
      },
    });
    createdCourses.push(course);
  }

  console.log(
    '✓ Courses created:',
    createdCourses.map((c) => ({ code: c.code, title: c.title, tags: c.tags.map((t) => t.tag.name) }))
  );

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin:   admin@argus.edu / Admin123!');
  console.log('Teacher: teacher@argus.edu / Teacher123!');
  console.log('Student: student1@argus.edu / Student123!');
  console.log('Student: student2@argus.edu / Student123!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
