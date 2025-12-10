import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedTags, seedCourses } from '../src/modules/course/course.seed';
import { seedAssignmentsByCourse } from '../src/modules/assignment/assignment.seed';
import {
  seedInstances,
  seedPublishedAssignments,
} from '../src/modules/courseInstance/instance.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clean existing data (optional, be careful in production)
  console.log('Cleaning existing data...');
  await prisma.publishedGradingCriteria.deleteMany();
  await prisma.publishedAssignment.deleteMany();
  await prisma.instanceLecturer.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseInstance.deleteMany();
  await prisma.gradingCriteria.deleteMany();
  await prisma.assignmentTemplate.deleteMany();
  await prisma.courseLecturer.deleteMany();
  await prisma.courseTag.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
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
  const createdCourses: any[] = [];

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
    createdCourses.map((c: any) => ({
      code: c.code,
      title: c.title,
      tags: c.tags.map((t: any) => t.tag.name),
    }))
  );

  // 7. Create Assignment Templates
  console.log('Creating assignment templates...');
  const createdTemplates = new Map<string, any>();

  for (const courseAssignments of seedAssignmentsByCourse) {
    const course = createdCourses.find((c) => c.code === courseAssignments.courseCode);
    if (!course) continue;

    for (const templateData of courseAssignments.templates) {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId: course.id,
          title: templateData.title,
          description: templateData.description,
          assignmentType: templateData.assignmentType,
          gradingMode: templateData.gradingMode,
          maxPoints: templateData.maxPoints,
          weightPercentage: templateData.weightPercentage,
          defaultDurationDays: templateData.defaultDurationDays,
          instructions: templateData.instructions,
          sortOrder: courseAssignments.templates.indexOf(templateData),
          gradingCriteria: {
            create: templateData.gradingCriteria.map((criteria, index) => ({
              name: criteria.name,
              description: criteria.description,
              maxPoints: criteria.maxPoints,
              sortOrder: index,
            })),
          },
        },
        include: {
          gradingCriteria: true,
        },
      });

      // Store template with composite key for later reference
      const key = `${courseAssignments.courseCode}:${templateData.title}`;
      createdTemplates.set(key, template);
    }
  }

  console.log(
    '✓ Assignment templates created:',
    Array.from(createdTemplates.values()).map((t) => ({
      course: createdCourses.find((c) => c.id === t.courseId)?.code,
      title: t.title,
      type: t.assignmentType,
      weight: t.weightPercentage + '%',
    }))
  );

  // 8. Create Course Instances
  console.log('Creating course instances...');
  const createdInstances = new Map<string, any>();

  for (const instanceData of seedInstances) {
    const course = createdCourses.find((c) => c.code === instanceData.courseCode);
    if (!course) continue;

    const instance = await prisma.courseInstance.create({
      data: {
        courseId: course.id,
        semester: instanceData.semester,
        startDate: instanceData.startDate,
        endDate: instanceData.endDate,
        status: instanceData.status,
        enrollmentLimit: instanceData.enrollmentLimit,
        enrollmentOpen: instanceData.enrollmentOpen,
        createdBy: teacherUser.id,
        lecturers: {
          create: {
            userId: teacherUser.id,
            role: 'primary_lecturer',
          },
        },
        forums: {
          create: [
            {
              title: 'General Discussion',
              description: 'General course discussion and announcements',
              forumType: 'general',
              sortOrder: 0,
            },
            {
              title: 'Q&A',
              description: 'Questions and answers about course material',
              forumType: 'qa',
              sortOrder: 1,
            },
            {
              title: 'Announcements',
              description: 'Course announcements and updates',
              forumType: 'announcements',
              sortOrder: 2,
            },
          ],
        },
      },
      include: {
        course: true,
        lecturers: true,
        forums: true,
      },
    });

    // Store instance with composite key for later reference
    const key = `${instanceData.courseCode}:${instanceData.semester}`;
    createdInstances.set(key, instance);
  }

  console.log(
    '✓ Course instances created:',
    Array.from(createdInstances.values()).map((i) => ({
      course: i.course.code,
      semester: i.semester,
      status: i.status,
      enrollment: `${i.enrollmentLimit} seats`,
    }))
  );

  // 9. Publish Assignments to Instances
  console.log('Publishing assignments to instances...');
  const createdPublishedAssignments = [];

  for (const publishData of seedPublishedAssignments) {
    const instanceKey = `${publishData.courseCode}:${publishData.semester}`;
    const instance = createdInstances.get(instanceKey);
    if (!instance) continue;

    const templateKey = `${publishData.courseCode}:${publishData.templateTitle}`;
    const template = createdTemplates.get(templateKey);
    if (!template) continue;

    const publishedAssignment = await prisma.publishedAssignment.create({
      data: {
        instanceId: instance.id,
        templateId: template.id,
        title: template.title,
        description: template.description,
        assignmentType: template.assignmentType,
        gradingMode: template.gradingMode,
        maxPoints: template.maxPoints,
        weightPercentage: template.weightPercentage,
        instructions: template.instructions,
        publishAt: publishData.publishAt,
        deadline: publishData.deadline,
        lateDeadline: publishData.lateDeadline,
        latePenaltyPercent: publishData.latePenaltyPercent,
        status: publishData.status,
        autoPublish: publishData.autoPublish,
        publishedBy: teacherUser.id,
        gradingCriteria: {
          create: template.gradingCriteria.map((criteria: any) => ({
            name: criteria.name,
            description: criteria.description,
            maxPoints: criteria.maxPoints,
            sortOrder: criteria.sortOrder,
          })),
        },
      },
      include: {
        gradingCriteria: true,
      },
    });

    createdPublishedAssignments.push(publishedAssignment);
  }

  console.log(
    '✓ Published assignments created:',
    createdPublishedAssignments.map((pa) => {
      const instance = Array.from(createdInstances.values()).find((i) => i.id === pa.instanceId);
      return {
        course: instance?.course.code,
        semester: instance?.semester,
        assignment: pa.title,
        status: pa.status,
      };
    })
  );

  // 10. Enroll Students in Active Instances
  console.log('Enrolling students in active instances...');
  const activeInstances = Array.from(createdInstances.values()).filter(
    (i) => i.status === 'active'
  );

  for (const instance of activeInstances) {
    // Enroll both students in all active instances
    await prisma.enrollment.createMany({
      data: [
        {
          instanceId: instance.id,
          studentId: student1.id,
          enrolledAt: new Date(),
          status: 'enrolled',
        },
        {
          instanceId: instance.id,
          studentId: student2.id,
          enrolledAt: new Date(),
          status: 'enrolled',
        },
      ],
    });
  }

  console.log(`✓ Enrolled students in ${activeInstances.length} active instances`);

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
