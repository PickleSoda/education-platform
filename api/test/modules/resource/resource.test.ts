import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Resource Module', () => {
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let adminId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let teacherId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let studentId: string;
  let courseId: string;
  let instanceId: string;
  let resourceTemplateId: string;
  let publishedResourceId: string;
  let syllabusItemId: string;

  beforeAll(async () => {
    // Clear test data in proper order for FK constraints
    await prisma.publishedGradingCriteria.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.publishedAssignment.deleteMany();
    await prisma.publishedResource.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.instanceLecturer.deleteMany();
    await prisma.courseInstance.deleteMany();
    await prisma.gradingCriteria.deleteMany();
    await prisma.assignmentTemplate.deleteMany();
    await prisma.resourceTemplate.deleteMany();
    await prisma.syllabusItem.deleteMany();
    await prisma.courseTag.deleteMany();
    await prisma.courseLecturer.deleteMany();
    await prisma.course.deleteMany();
    await prisma.token.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create roles if they don't exist
    await prisma.role.upsert({
      where: { name: 'admin' },
      create: { name: 'admin', description: 'Administrator' },
      update: {},
    });
    await prisma.role.upsert({
      where: { name: 'teacher' },
      create: { name: 'teacher', description: 'Teacher' },
      update: {},
    });
    await prisma.role.upsert({
      where: { name: 'student' },
      create: { name: 'student', description: 'Student' },
      update: {},
    });

    // Create users
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const teacherRole = await prisma.role.findUnique({ where: { name: 'teacher' } });
    const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash: await encryptPassword('AdminPass123'),
        firstName: 'Admin',
        lastName: 'User',
        roles: { create: { roleId: adminRole!.id } },
      },
    });
    adminId = admin.id;

    const teacher = await prisma.user.create({
      data: {
        email: 'teacher@test.com',
        passwordHash: await encryptPassword('TeacherPass123'),
        firstName: 'John',
        lastName: 'Teacher',
        roles: { create: { roleId: teacherRole!.id } },
        teacherProfile: { create: {} },
      },
    });
    teacherId = teacher.id;

    const student = await prisma.user.create({
      data: {
        email: 'student@test.com',
        passwordHash: await encryptPassword('StudentPass123'),
        firstName: 'Jane',
        lastName: 'Student',
        roles: { create: { roleId: studentRole!.id } },
        studentProfile: { create: {} },
      },
    });
    studentId = student.id;

    // Login to get tokens
    const adminLogin = await request(app).post('/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'AdminPass123',
    });
    adminToken = adminLogin.body.data.tokens.access.token;

    const teacherLogin = await request(app).post('/v1/auth/login').send({
      email: 'teacher@test.com',
      password: 'TeacherPass123',
    });
    teacherToken = teacherLogin.body.data.tokens.access.token;

    const studentLogin = await request(app).post('/v1/auth/login').send({
      email: 'student@test.com',
      password: 'StudentPass123',
    });
    studentToken = studentLogin.body.data.tokens.access.token;

    // Create a test course
    const course = await prisma.course.create({
      data: {
        code: 'CS101',
        title: 'Introduction to Computer Science',
        description: 'Fundamentals of CS',
        credits: 3,
      },
    });
    courseId = course.id;

    // Create a test course instance
    const instance = await prisma.courseInstance.create({
      data: {
        courseId: course.id,
        year: 2024,
        semester: 'Spring',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-05-15'),
      },
    });
    instanceId = instance.id;
  }, 30000);

  beforeEach(async () => {
    // Clean resource-specific data between tests
    await prisma.publishedResource.deleteMany();
    await prisma.resourceTemplate.deleteMany();
    await prisma.syllabusItem.deleteMany();
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.publishedGradingCriteria.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.publishedAssignment.deleteMany();
    await prisma.publishedResource.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.instanceLecturer.deleteMany();
    await prisma.courseInstance.deleteMany();
    await prisma.gradingCriteria.deleteMany();
    await prisma.assignmentTemplate.deleteMany();
    await prisma.resourceTemplate.deleteMany();
    await prisma.syllabusItem.deleteMany();
    await prisma.courseTag.deleteMany();
    await prisma.courseLecturer.deleteMany();
    await prisma.course.deleteMany();
    await prisma.token.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  // ==========================================================================
  // RESOURCE TEMPLATE CRUD TESTS
  // ==========================================================================

  describe('POST /courses/:courseId/resources - Create Resource Template', () => {
    it('should create resource template as admin', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/resources`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Lecture 1 Slides',
          description: 'Introduction slides',
          resourceType: 'slide',
          url: 'https://example.com/slides.pdf',
          sortOrder: 1,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Lecture 1 Slides');
      expect(res.body.data.resourceType).toBe('slide');
      expect(res.body.data.url).toBe('https://example.com/slides.pdf');
      resourceTemplateId = res.body.data.id;
    });

    it('should create resource template as teacher', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/resources`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Textbook Chapter 1',
          description: 'Required reading',
          resourceType: 'document',
          filePath: '/uploads/resources/chapter1.pdf',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Textbook Chapter 1');
      expect(res.body.data.resourceType).toBe('document');
    });

    it('should fail to create resource without title', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/resources`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Missing title',
          resourceType: 'document',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail to create resource without url or filePath', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/resources`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Invalid Resource',
          description: 'No url or filePath',
          resourceType: 'document',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/resources`)
        .send({
          title: 'Unauthorized Resource',
          resourceType: 'document',
          url: 'https://example.com/resource.pdf',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /courses/:courseId/resources - List Resource Templates', () => {
    beforeEach(async () => {
      // Create test resources
      await prisma.resourceTemplate.createMany({
        data: [
          {
            courseId,
            title: 'Lecture 1',
            resourceType: 'slide',
            url: 'https://example.com/lecture1.pdf',
            sortOrder: 1,
          },
          {
            courseId,
            title: 'Video Tutorial',
            resourceType: 'video',
            url: 'https://example.com/video1.mp4',
            sortOrder: 2,
          },
          {
            courseId,
            title: 'Code Sample',
            resourceType: 'code',
            filePath: '/uploads/resources/sample.zip',
            sortOrder: 3,
          },
        ],
      });
    });

    it('should list all resource templates as admin', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}/resources`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].title).toBe('Lecture 1');
    });

    it('should filter resources by type', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}/resources`)
        .query({ resourceType: 'video' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].resourceType).toBe('video');
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/v1/courses/${courseId}/resources`).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /resources/:id - Get Resource Template', () => {
    beforeEach(async () => {
      const template = await prisma.resourceTemplate.create({
        data: {
          courseId,
          title: 'Test Resource',
          resourceType: 'document',
          url: 'https://example.com/test.pdf',
        },
      });
      resourceTemplateId = template.id;
    });

    it('should get resource template by ID', async () => {
      const res = await request(app)
        .get(`/v1/resources/${resourceTemplateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(resourceTemplateId);
      expect(res.body.data.title).toBe('Test Resource');
    });

    it('should return 404 for non-existent resource', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440099';
      await request(app)
        .get(`/v1/resources/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/v1/resources/${resourceTemplateId}`).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /resources/:id - Update Resource Template', () => {
    beforeEach(async () => {
      const template = await prisma.resourceTemplate.create({
        data: {
          courseId,
          title: 'Original Title',
          resourceType: 'document',
          url: 'https://example.com/original.pdf',
        },
      });
      resourceTemplateId = template.id;
    });

    it('should update resource template', async () => {
      const res = await request(app)
        .patch(`/v1/resources/${resourceTemplateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated description',
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.description).toBe('Updated description');
    });

    it('should update resource type', async () => {
      const res = await request(app)
        .patch(`/v1/resources/${resourceTemplateId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          resourceType: 'video',
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.resourceType).toBe('video');
    });

    it('should return 404 for non-existent resource', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440099';
      await request(app)
        .patch(`/v1/resources/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'New Title' })
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .patch(`/v1/resources/${resourceTemplateId}`)
        .send({ title: 'New Title' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /resources/:id - Delete Resource Template', () => {
    beforeEach(async () => {
      const template = await prisma.resourceTemplate.create({
        data: {
          courseId,
          title: 'To Be Deleted',
          resourceType: 'document',
          url: 'https://example.com/delete.pdf',
        },
      });
      resourceTemplateId = template.id;
    });

    it('should delete resource template', async () => {
      const res = await request(app)
        .delete(`/v1/resources/${resourceTemplateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);

      // Verify deletion
      const deleted = await prisma.resourceTemplate.findUnique({
        where: { id: resourceTemplateId },
      });
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent resource', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440099';
      await request(app)
        .delete(`/v1/resources/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .delete(`/v1/resources/${resourceTemplateId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // PUBLISHED RESOURCE CRUD TESTS
  // ==========================================================================

  describe('POST /instances/:instanceId/resources - Publish Resource', () => {
    beforeEach(async () => {
      const template = await prisma.resourceTemplate.create({
        data: {
          courseId,
          title: 'Template Resource',
          resourceType: 'document',
          url: 'https://example.com/template.pdf',
        },
      });
      resourceTemplateId = template.id;
    });

    it('should publish resource from template', async () => {
      const res = await request(app)
        .post(`/v1/instances/${instanceId}/resources`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          templateId: resourceTemplateId,
          isPublished: true,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.templateId).toBe(resourceTemplateId);
      expect(res.body.data.isPublished).toBe(true);
      expect(res.body.data.publishedAt).toBeTruthy();
      publishedResourceId = res.body.data.id;
    });

    it('should create standalone published resource', async () => {
      const res = await request(app)
        .post(`/v1/instances/${instanceId}/resources`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Standalone Resource',
          description: 'Not from template',
          resourceType: 'link',
          url: 'https://example.com/standalone.pdf',
          isPublished: true,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Standalone Resource');
      expect(res.body.data.templateId).toBeNull();
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/v1/instances/${instanceId}/resources`)
        .send({
          templateId: resourceTemplateId,
          isPublished: true,
        })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /instances/:instanceId/resources - List Published Resources', () => {
    beforeEach(async () => {
      await prisma.publishedResource.createMany({
        data: [
          {
            instanceId,
            title: 'Published Lecture 1',
            resourceType: 'slide',
            url: 'https://example.com/lecture1.pdf',
            isPublished: true,
            publishedAt: new Date(),
          },
          {
            instanceId,
            title: 'Draft Resource',
            resourceType: 'document',
            url: 'https://example.com/draft.pdf',
            isPublished: false,
          },
          {
            instanceId,
            title: 'Published Video',
            resourceType: 'video',
            url: 'https://example.com/video.mp4',
            isPublished: true,
            publishedAt: new Date(),
          },
        ],
      });
    });

    it('should list all published resources as teacher', async () => {
      const res = await request(app)
        .get(`/v1/instances/${instanceId}/resources`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter only published resources for students', async () => {
      const res = await request(app)
        .get(`/v1/instances/${instanceId}/resources`)
        .query({ isPublished: true })
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.every((r: any) => r.isPublished)).toBe(true);
    });

    it('should filter by resource type', async () => {
      const res = await request(app)
        .get(`/v1/instances/${instanceId}/resources`)
        .query({ resourceType: 'video' })
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].resourceType).toBe('video');
    });
  });

  describe('PATCH /instances/resources/:id - Update Published Resource', () => {
    beforeEach(async () => {
      const published = await prisma.publishedResource.create({
        data: {
          instanceId,
          title: 'Original Published',
          resourceType: 'document',
          url: 'https://example.com/original.pdf',
          isPublished: false,
        },
      });
      publishedResourceId = published.id;
    });

    it('should update published resource and set publishedAt when publishing', async () => {
      const res = await request(app)
        .patch(`/v1/instances/resources/${publishedResourceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Published',
          isPublished: true,
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Published');
      expect(res.body.data.isPublished).toBe(true);
      expect(res.body.data.publishedAt).toBeTruthy();
    });

    it('should fail without authentication', async () => {
      await request(app)
        .patch(`/v1/instances/resources/${publishedResourceId}`)
        .send({ title: 'New Title' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /instances/resources/:id - Delete Published Resource', () => {
    beforeEach(async () => {
      const published = await prisma.publishedResource.create({
        data: {
          instanceId,
          title: 'To Be Deleted',
          resourceType: 'document',
          url: 'https://example.com/delete.pdf',
          isPublished: false,
        },
      });
      publishedResourceId = published.id;
    });

    it('should delete published resource', async () => {
      const res = await request(app)
        .delete(`/v1/instances/resources/${publishedResourceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);

      // Verify deletion
      const deleted = await prisma.publishedResource.findUnique({
        where: { id: publishedResourceId },
      });
      expect(deleted).toBeNull();
    });

    it('should fail without authentication', async () => {
      await request(app)
        .delete(`/v1/instances/resources/${publishedResourceId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // SYLLABUS ITEM CRUD TESTS
  // ==========================================================================

  describe('POST /courses/:courseId/syllabus - Create Syllabus Item', () => {
    it('should create syllabus item as admin', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/syllabus`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          weekNumber: 1,
          title: 'Week 1: Introduction',
          description: 'Course overview and setup',
          learningObjectives: ['Understand course structure', 'Set up development environment'],
          sortOrder: 1,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.weekNumber).toBe(1);
      expect(res.body.data.title).toBe('Week 1: Introduction');
      expect(res.body.data.learningObjectives).toHaveLength(2);
      syllabusItemId = res.body.data.id;
    });

    it('should create syllabus item as teacher', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/syllabus`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          weekNumber: 2,
          title: 'Week 2: Variables',
          description: 'Variable types and declarations',
          learningObjectives: ['Declare variables', 'Use different types'],
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.weekNumber).toBe(2);
    });

    it('should fail without title', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/syllabus`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          weekNumber: 3,
          description: 'Missing title',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/syllabus`)
        .send({
          title: 'Unauthorized Syllabus',
          weekNumber: 1,
        })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /courses/:courseId/syllabus - List Syllabus Items', () => {
    beforeEach(async () => {
      await prisma.syllabusItem.createMany({
        data: [
          {
            courseId,
            weekNumber: 1,
            title: 'Week 1',
            learningObjectives: ['Objective 1'],
            sortOrder: 1,
          },
          {
            courseId,
            weekNumber: 2,
            title: 'Week 2',
            learningObjectives: ['Objective 2'],
            sortOrder: 2,
          },
          {
            courseId,
            weekNumber: 3,
            title: 'Week 3',
            learningObjectives: ['Objective 3'],
            sortOrder: 3,
          },
        ],
      });
    });

    it('should list all syllabus items', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}/syllabus`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0].weekNumber).toBe(1);
    });

    it('should filter by week number', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}/syllabus`)
        .query({ weekNumber: 2 })
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].weekNumber).toBe(2);
    });

    it('should be accessible to students', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}/syllabus`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('PATCH /syllabus/:id - Update Syllabus Item', () => {
    beforeEach(async () => {
      const item = await prisma.syllabusItem.create({
        data: {
          courseId,
          weekNumber: 1,
          title: 'Original Title',
          learningObjectives: ['Original objective'],
          sortOrder: 1,
        },
      });
      syllabusItemId = item.id;
    });

    it('should update syllabus item', async () => {
      const res = await request(app)
        .patch(`/v1/syllabus/${syllabusItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          description: 'New description',
          learningObjectives: ['New objective 1', 'New objective 2'],
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.description).toBe('New description');
      expect(res.body.data.learningObjectives).toHaveLength(2);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .patch(`/v1/syllabus/${syllabusItemId}`)
        .send({ title: 'New Title' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /syllabus/:id - Delete Syllabus Item', () => {
    beforeEach(async () => {
      const item = await prisma.syllabusItem.create({
        data: {
          courseId,
          weekNumber: 99,
          title: 'To Be Deleted',
          learningObjectives: ['Objective'],
          sortOrder: 99,
        },
      });
      syllabusItemId = item.id;
    });

    it('should delete syllabus item', async () => {
      const res = await request(app)
        .delete(`/v1/syllabus/${syllabusItemId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);

      // Verify deletion
      const deleted = await prisma.syllabusItem.findUnique({
        where: { id: syllabusItemId },
      });
      expect(deleted).toBeNull();
    });

    it('should fail without authentication', async () => {
      await request(app).delete(`/v1/syllabus/${syllabusItemId}`).expect(httpStatus.UNAUTHORIZED);
    });
  });
});
