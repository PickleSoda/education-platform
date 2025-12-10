import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Instance Module', () => {
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let adminId: string;
  let teacherId: string;
  let studentId: string;
  let courseId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let instanceId: string;
  let assignmentTemplateId: string;

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

    // Create an assignment template for the course
    const template = await prisma.assignmentTemplate.create({
      data: {
        courseId: courseId,
        title: 'Homework 1',
        description: 'First homework assignment',
        assignmentType: 'homework',
        gradingMode: 'points',
        maxPoints: 100,
        weightPercentage: 10,
      },
    });
    assignmentTemplateId = template.id;
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
  // INSTANCE CRUD TESTS
  // ==========================================================================

  describe('POST /instances - Create Instance', () => {
    beforeEach(async () => {
      // Clean up instances before each test in this suite
      await prisma.courseInstance.deleteMany();
    });

    it('should create a new instance as admin', async () => {
      const res = await request(app)
        .post('/v1/instances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId,
          semester: 'Fall 2024',
          startDate: '2024-09-01',
          endDate: '2024-12-15',
          enrollmentLimit: 30,
          lecturerIds: [teacherId],
        })
        .expect(httpStatus.CREATED);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.semester).toBe('Fall 2024');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.enrollmentOpen).toBe(false);
    });

    it('should create a new instance as teacher', async () => {
      const res = await request(app)
        .post('/v1/course/instances')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          courseId,
          semester: 'Spring 2025',
          startDate: '2025-01-15',
          endDate: '2025-05-15',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.semester).toBe('Spring 2025');
    });

    it('should fail to create instance as student', async () => {
      await request(app)
        .post('/v1/instances')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseId,
          semester: 'Fall 2024',
          startDate: '2024-09-01',
          endDate: '2024-12-15',
        })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail to create instance without authentication', async () => {
      await request(app)
        .post('/v1/instances')
        .send({
          courseId,
          semester: 'Fall 2024',
          startDate: '2024-09-01',
          endDate: '2024-12-15',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should fail with invalid course ID', async () => {
      await request(app)
        .post('/v1/instances')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseId: '00000000-0000-0000-0000-000000000000',
          semester: 'Fall 2024',
          startDate: '2024-09-01',
          endDate: '2024-12-15',
        })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /instances - List Instances', () => {
    beforeEach(async () => {
      // Clean up and create fresh test instances for this suite
      await prisma.courseInstance.deleteMany();

      // Create test instances
      await Promise.all([
        prisma.courseInstance.create({
          data: {
            courseId,
            semester: 'Fall 2024',
            startDate: new Date('2024-09-01'),
            endDate: new Date('2024-12-15'),
            status: 'active',
          },
        }),
        prisma.courseInstance.create({
          data: {
            courseId,
            semester: 'Spring 2025',
            startDate: new Date('2025-01-15'),
            endDate: new Date('2025-05-15'),
            status: 'draft',
          },
        }),
        prisma.courseInstance.create({
          data: {
            courseId,
            semester: 'Fall 2025',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-12-15'),
            status: 'archived',
          },
        }),
      ]);
    });

    it('should list all instances', async () => {
      const res = await request(app)
        .get('/v1/instances')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/v1/instances?status=active')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      res.body.data.forEach((instance: { status: string }) => {
        expect(instance.status).toBe('active');
      });
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/v1/instances?page=1&limit=1')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(1);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/v1/instances').expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /instances/:id - Get Instance', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      // Clean up and create fresh instance for this suite
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
        },
      });
      localInstanceId = instance.id;
    });

    it('should get instance details', async () => {
      const res = await request(app)
        .get(`/v1/courses/instances/${localInstanceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.id).toBe(localInstanceId);
      expect(res.body.data.semester).toBe('Fall 2024');
    });

    it('should return 404 for non-existent instance', async () => {
      await request(app)
        .get('/v1/courses/instances/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/v1/courses/instances/${localInstanceId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /instances/:id - Update Instance', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      // Clean up and create fresh instance for this suite
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'draft',
        },
      });
      localInstanceId = instance.id;
    });

    it('should update instance as admin', async () => {
      const res = await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          semester: 'Updated Fall 2024',
          enrollmentLimit: 50,
        })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.semester).toBe('Updated Fall 2024');
      expect(res.body.data.enrollmentLimit).toBe(50);
    });

    it('should update instance as teacher', async () => {
      const res = await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          enrollmentLimit: 40,
        })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.enrollmentLimit).toBe(40);
    });

    it('should fail to update as student', async () => {
      await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          semester: 'Updated',
        })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent instance', async () => {
      await request(app)
        .patch('/v1/courses/instances/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ semester: 'Updated' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /instances/:id/status - Update Instance Status', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      // Clean up and create fresh instance for this suite
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'draft',
        },
      });
      localInstanceId = instance.id;
    });

    it('should update status to scheduled', async () => {
      const res = await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}/status`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'scheduled' })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.status).toBe('scheduled');
    });

    it('should update status to active', async () => {
      // First set to scheduled
      await prisma.courseInstance.update({
        where: { id: localInstanceId },
        data: { status: 'scheduled' },
      });

      const res = await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}/status`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'active' })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.status).toBe('active');
    });

    it('should update status to completed', async () => {
      await prisma.courseInstance.update({
        where: { id: localInstanceId },
        data: { status: 'active' },
      });

      const res = await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}/status`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'completed' })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.status).toBe('completed');
    });

    it('should fail to update status as student', async () => {
      await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'active' })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('PATCH /instances/:id/enrollment - Toggle Enrollment', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      // Clean up and create fresh instance for this suite
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
          enrollmentOpen: false,
        },
      });
      localInstanceId = instance.id;
    });

    it('should toggle enrollment open', async () => {
      const res = await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}/enrollment`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ enrollmentOpen: true })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.enrollmentOpen).toBe(true);
    });

    it('should toggle enrollment closed', async () => {
      await prisma.courseInstance.update({
        where: { id: localInstanceId },
        data: { enrollmentOpen: true },
      });

      const res = await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}/enrollment`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ enrollmentOpen: false })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.enrollmentOpen).toBe(false);
    });

    it('should fail as student', async () => {
      await request(app)
        .patch(`/v1/courses/instances/${localInstanceId}/enrollment`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ enrollmentOpen: true })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('DELETE /instances/:id - Delete Instance', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      // Clean up and create fresh instance for this suite
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'draft',
        },
      });
      localInstanceId = instance.id;
    });

    it('should delete instance as admin', async () => {
      await request(app)
        .delete(`/v1/courses/instances/${localInstanceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NO_CONTENT);

      // Verify deletion
      const deleted = await prisma.courseInstance.findUnique({
        where: { id: localInstanceId },
      });
      expect(deleted).toBeNull();
    });

    it('should fail to delete as teacher', async () => {
      await request(app)
        .delete(`/v1/courses/instances/${localInstanceId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail to delete as student', async () => {
      await request(app)
        .delete(`/v1/courses/instances/${localInstanceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent instance', async () => {
      await request(app)
        .delete('/v1/courses/instances/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  // ==========================================================================
  // CLONE INSTANCE TESTS
  // ==========================================================================

  describe('POST /instances/:id/clone - Clone Instance', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      // Clean up and create fresh instance for this suite
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
          enrollmentLimit: 30,
        },
      });
      localInstanceId = instance.id;
    });

    it('should clone instance as teacher', async () => {
      const res = await request(app)
        .post(`/v1/courses/instances/${localInstanceId}/clone`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          semester: 'Fall 2025',
          startDate: '2025-09-01',
          endDate: '2025-12-15',
        })
        .expect(httpStatus.CREATED);
      console.log(res.body);
      expect(res.body.message).toBeDefined();
      expect(res.body.data.semester).toBe('Fall 2025');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.id).not.toBe(localInstanceId);
    });

    it('should clone instance as admin', async () => {
      const res = await request(app)
        .post(`/v1/courses/instances/${localInstanceId}/clone`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          semester: 'Spring 2025',
          startDate: '2025-01-15',
          endDate: '2025-05-15',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.semester).toBe('Spring 2025');
    });

    it('should fail to clone as student', async () => {
      await request(app)
        .post(`/v1/courses/instances/${localInstanceId}/clone`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          semester: 'Fall 2025',
          startDate: '2025-09-01',
          endDate: '2025-12-15',
        })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ==========================================================================
  // PUBLISHED ASSIGNMENT TESTS
  // ==========================================================================

  describe('POST /instances/:id/assignments/publish - Publish Assignment', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
        },
      });
      localInstanceId = instance.id;
    });

    it('should publish assignment from template', async () => {
      const res = await request(app)
        .post(`/v1/courses/instances/${localInstanceId}/assignments/publish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          templateId: assignmentTemplateId,
          deadline: '2026-10-15T23:59:59Z',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.title).toBe('Homework 1');
      expect(res.body.data.instanceId).toBe(localInstanceId);
    });

    it('should publish assignment with custom settings', async () => {
      const res = await request(app)
        .post(`/v1/courses/instances/${localInstanceId}/assignments/publish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          templateId: assignmentTemplateId,
          deadline: '2026-10-15T23:59:59Z',
          lateDeadline: '2026-10-17T23:59:59Z',
          latePenaltyPercent: 20,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.latePenaltyPercent).toBe(20);
    });

    it('should fail as student', async () => {
      await request(app)
        .post(`/v1/courses/instances/${localInstanceId}/assignments/publish`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          templateId: assignmentTemplateId,
          deadline: '2026-10-15T23:59:59Z',
        })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail with invalid template ID', async () => {
      await request(app)
        .post(`/v1/courses/instances/${localInstanceId}/assignments/publish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          templateId: '00000000-0000-0000-0000-000000000000',
          deadline: '2026-10-15T23:59:59Z',
        })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('GET /instances/:id/assignments - Get Instance Assignments', () => {
    let localInstanceId: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let publishedAssignmentId: string;

    beforeEach(async () => {
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
        },
      });
      localInstanceId = instance.id;

      // Create published assignment
      const published = await prisma.publishedAssignment.create({
        data: {
          instanceId: localInstanceId,
          templateId: assignmentTemplateId,
          title: 'Homework 1',
          description: 'First homework',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          status: 'published',
          deadline: new Date('2024-10-15'),
        },
      });
      publishedAssignmentId = published.id;
    });

    it('should get instance assignments as student', async () => {
      const res = await request(app)
        .get(`/v1/courses/instances/${localInstanceId}/assignments`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Homework 1');
    });

    it('should get instance assignments as teacher', async () => {
      const res = await request(app)
        .get(`/v1/courses/instances/${localInstanceId}/assignments`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data).toHaveLength(1);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/v1/courses/instances/${localInstanceId}/assignments`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /instances/:id/assignments/:assignmentId - Get Published Assignment', () => {
    let localInstanceId: string;
    let publishedAssignmentId: string;

    beforeEach(async () => {
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
        },
      });
      localInstanceId = instance.id;

      const published = await prisma.publishedAssignment.create({
        data: {
          instanceId: localInstanceId,
          templateId: assignmentTemplateId,
          title: 'Homework 1',
          description: 'First homework',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          status: 'published',
          deadline: new Date('2024-10-15'),
        },
      });
      publishedAssignmentId = published.id;
    });

    it('should get published assignment details', async () => {
      const res = await request(app)
        .get(`/v1/courses/instances/${localInstanceId}/assignments/${publishedAssignmentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.id).toBe(publishedAssignmentId);
      expect(res.body.data.title).toBe('Homework 1');
    });

    it('should return 404 for non-existent assignment', async () => {
      await request(app)
        .get(
          `/v1/courses/instances/${localInstanceId}/assignments/00000000-0000-0000-0000-000000000000`
        )
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /instances/:id/assignments/:assignmentId/publish - Toggle Publish Status', () => {
    let localInstanceId: string;
    let publishedAssignmentId: string;

    beforeEach(async () => {
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
        },
      });
      localInstanceId = instance.id;

      const published = await prisma.publishedAssignment.create({
        data: {
          instanceId: localInstanceId,
          templateId: assignmentTemplateId,
          title: 'Homework 1',
          description: 'First homework',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          status: 'draft',
          deadline: new Date('2024-10-15'),
        },
      });
      publishedAssignmentId = published.id;
    });

    it('should toggle to published', async () => {
      const res = await request(app)
        .patch(
          `/v1/courses/instances/${localInstanceId}/assignments/${publishedAssignmentId}/publish`
        )
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'published' })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.status).toBe('published');
    });

    it('should toggle to closed', async () => {
      await prisma.publishedAssignment.update({
        where: { id: publishedAssignmentId },
        data: { status: 'published' },
      });

      const res = await request(app)
        .patch(
          `/v1/courses/instances/${localInstanceId}/assignments/${publishedAssignmentId}/publish`
        )
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'closed' })
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.status).toBe('closed');
    });

    it('should fail as student', async () => {
      await request(app)
        .patch(
          `/v1/courses/instances/${localInstanceId}/assignments/${publishedAssignmentId}/publish`
        )
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'published' })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ==========================================================================
  // MY INSTANCES TESTS
  // ==========================================================================

  describe('GET /instances/my/enrolled - Get My Enrolled Instances', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
        },
      });
      localInstanceId = instance.id;

      // Enroll student
      await prisma.enrollment.create({
        data: {
          instanceId: localInstanceId,
          studentId,
          status: 'enrolled',
        },
      });
    });

    it('should get enrolled instances as student', async () => {
      const res = await request(app)
        .get('/v1/courses/instances/my/enrolled')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/v1/courses/instances/my/enrolled').expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /instances/my/teaching - Get My Teaching Instances', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let localInstanceId: string;

    beforeEach(async () => {
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
          lecturers: {
            create: {
              userId: teacherId,
              role: 'lecturer',
            },
          },
        },
      });
      localInstanceId = instance.id;
    });

    it('should get teaching instances as teacher', async () => {
      const res = await request(app)
        .get('/v1/courses/instances/my/teaching')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail as student', async () => {
      await request(app)
        .get('/v1/courses/instances/my/teaching')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /instances/:id/stats - Get Instance Statistics', () => {
    let localInstanceId: string;

    beforeEach(async () => {
      await prisma.courseInstance.deleteMany();

      const instance = await prisma.courseInstance.create({
        data: {
          courseId,
          semester: 'Fall 2024',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-12-15'),
          status: 'active',
        },
      });
      localInstanceId = instance.id;

      // Add some enrollments
      await prisma.enrollment.create({
        data: {
          instanceId: localInstanceId,
          studentId,
          status: 'enrolled',
        },
      });
    });

    it('should get instance statistics as teacher', async () => {
      const res = await request(app)
        .get(`/v1/courses/instances/${localInstanceId}/stats`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
      expect(res.body.data).toHaveProperty('enrollmentCount');
    });

    it('should get instance statistics as admin', async () => {
      const res = await request(app)
        .get(`/v1/courses/instances/${localInstanceId}/stats`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.message).toBeDefined();
    });

    it('should fail as student', async () => {
      await request(app)
        .get(`/v1/courses/instances/${localInstanceId}/stats`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });
});
