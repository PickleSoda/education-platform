import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Assignment Module', () => {
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
  }, 30000);

  beforeEach(async () => {
    // Clean assignment-specific data between tests
    await prisma.gradingCriteria.deleteMany();
    await prisma.assignmentTemplate.deleteMany();
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
  // ASSIGNMENT TEMPLATE CRUD TESTS
  // ==========================================================================

  describe('POST /courses/:courseId/assignments - Create Assignment Template', () => {
    it('should create assignment template as admin', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/assignments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Homework 1',
          description: 'First homework assignment',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          weightPercentage: 10,
          defaultDurationDays: 7,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Homework 1');
      expect(res.body.data.assignmentType).toBe('homework');
      expect(res.body.data.maxPoints).toBe(100);
      assignmentTemplateId = res.body.data.id;
    });

    it('should create assignment template as teacher', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/assignments`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Midterm Exam',
          description: 'Midterm examination',
          assignmentType: 'midterm',
          gradingMode: 'points',
          maxPoints: 200,
          weightPercentage: 30,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Midterm Exam');
      expect(res.body.data.assignmentType).toBe('midterm');
    });

    it('should create assignment with pass_fail grading mode', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/assignments`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Participation',
          description: 'Class participation',
          assignmentType: 'participation',
          gradingMode: 'pass_fail',
          weightPercentage: 5,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.gradingMode).toBe('pass_fail');
    });

    it('should fail to create as student', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/assignments`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Homework 1',
          assignmentType: 'homework',
        })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/assignments`)
        .send({
          title: 'Homework 1',
          assignmentType: 'homework',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should fail with invalid course ID', async () => {
      const res = await request(app)
        .post('/v1/courses/00000000-0000-0000-0000-000000000000/assignments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Homework 1',
          assignmentType: 'homework',
        });

      // The endpoint should return 404 when course doesn't exist
      // But if validation rejects the UUID format, it returns 400
      // Either is acceptable for an invalid/non-existent course
      expect([httpStatus.NOT_FOUND, httpStatus.BAD_REQUEST]).toContain(res.status);
    });
  });

  describe('GET /courses/:courseId/assignments - List Assignment Templates', () => {
    beforeEach(async () => {
      // Create test assignment templates
      await prisma.assignmentTemplate.createMany({
        data: [
          {
            courseId,
            title: 'Homework 1',
            description: 'First homework',
            assignmentType: 'homework',
            gradingMode: 'points',
            maxPoints: 100,
            weightPercentage: 10,
            sortOrder: 1,
          },
          {
            courseId,
            title: 'Midterm Exam',
            description: 'Midterm examination',
            assignmentType: 'midterm',
            gradingMode: 'points',
            maxPoints: 200,
            weightPercentage: 30,
            sortOrder: 2,
          },
          {
            courseId,
            title: 'Final Project',
            description: 'Final project',
            assignmentType: 'project',
            gradingMode: 'points',
            maxPoints: 300,
            weightPercentage: 40,
            sortOrder: 3,
          },
        ],
      });
    });

    it('should list all assignment templates for a course', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}/assignments`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
    });

    it('should return templates ordered by sortOrder', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}/assignments`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toBe('Homework 1');
      expect(res.body.data[1].title).toBe('Midterm Exam');
      expect(res.body.data[2].title).toBe('Final Project');
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/v1/courses/${courseId}/assignments`).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /assignments/:id - Get Assignment Template by ID', () => {
    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
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

    it('should get assignment template by ID', async () => {
      const res = await request(app)
        .get(`/v1/assignments/${assignmentTemplateId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(assignmentTemplateId);
      expect(res.body.data.title).toBe('Homework 1');
    });

    it('should return 404 for non-existent template', async () => {
      await request(app)
        .get('/v1/assignments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/v1/assignments/${assignmentTemplateId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /assignments/:id - Update Assignment Template', () => {
    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
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

    it('should update assignment template as admin', async () => {
      const res = await request(app)
        .patch(`/v1/assignments/${assignmentTemplateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Homework 1',
          maxPoints: 150,
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Homework 1');
      expect(res.body.data.maxPoints).toBe(150);
    });

    it('should update assignment template as teacher', async () => {
      const res = await request(app)
        .patch(`/v1/assignments/${assignmentTemplateId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Updated description',
          weightPercentage: 15,
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Updated description');
      expect(res.body.data.weightPercentage).toBe(15);
    });

    it('should fail to update as student', async () => {
      await request(app)
        .patch(`/v1/assignments/${assignmentTemplateId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated' })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent template', async () => {
      await request(app)
        .patch('/v1/assignments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /assignments/:id - Delete Assignment Template', () => {
    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
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

    it('should delete assignment template as admin', async () => {
      await request(app)
        .delete(`/v1/assignments/${assignmentTemplateId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NO_CONTENT);

      // Verify deletion
      const deleted = await prisma.assignmentTemplate.findUnique({
        where: { id: assignmentTemplateId },
      });
      expect(deleted).toBeNull();
    });

    it('should delete assignment template as teacher', async () => {
      await request(app)
        .delete(`/v1/assignments/${assignmentTemplateId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.NO_CONTENT);
    });

    it('should fail to delete as student', async () => {
      await request(app)
        .delete(`/v1/assignments/${assignmentTemplateId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent template', async () => {
      await request(app)
        .delete('/v1/assignments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  // ==========================================================================
  // COPY & REORDER TESTS
  // ==========================================================================

  describe('POST /assignments/:id/copy - Copy Assignment Template', () => {
    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 1',
          description: 'First homework assignment',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          weightPercentage: 10,
          gradingCriteria: {
            create: [
              {
                name: 'Correctness',
                description: 'Code correctness',
                maxPoints: 70,
                sortOrder: 1,
              },
              {
                name: 'Style',
                description: 'Code style',
                maxPoints: 30,
                sortOrder: 2,
              },
            ],
          },
        },
      });
      assignmentTemplateId = template.id;
    });

    it('should copy assignment template as teacher', async () => {
      const res = await request(app)
        .post(`/v1/assignments/${assignmentTemplateId}/copy`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ targetCourseId: courseId })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).not.toBe(assignmentTemplateId);
      expect(res.body.data.title).toContain('Homework 1');
    });

    it('should copy with custom title', async () => {
      const res = await request(app)
        .post(`/v1/assignments/${assignmentTemplateId}/copy`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          targetCourseId: courseId,
          title: 'Homework 2 - Copied',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Homework 2 - Copied');
    });

    it('should fail as student', async () => {
      await request(app)
        .post(`/v1/assignments/${assignmentTemplateId}/copy`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ targetCourseId: courseId })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('PUT /courses/:courseId/assignments/reorder - Reorder Assignment Templates', () => {
    let template1Id: string;
    let template2Id: string;
    let template3Id: string;

    beforeEach(async () => {
      const template1 = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 1',
          assignmentType: 'homework',
          gradingMode: 'points',
          sortOrder: 1,
        },
      });
      template1Id = template1.id;

      const template2 = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 2',
          assignmentType: 'homework',
          gradingMode: 'points',
          sortOrder: 2,
        },
      });
      template2Id = template2.id;

      const template3 = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 3',
          assignmentType: 'homework',
          gradingMode: 'points',
          sortOrder: 3,
        },
      });
      template3Id = template3.id;
    });

    it('should reorder assignments as teacher', async () => {
      const res = await request(app)
        .put(`/v1/courses/${courseId}/assignments/reorder`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          order: [template3Id, template1Id, template2Id],
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);

      // Verify new order
      const templates = await prisma.assignmentTemplate.findMany({
        where: { courseId },
        orderBy: { sortOrder: 'asc' },
      });

      expect(templates[0].id).toBe(template3Id);
      expect(templates[1].id).toBe(template1Id);
      expect(templates[2].id).toBe(template2Id);
    });

    it('should fail as student', async () => {
      await request(app)
        .put(`/v1/courses/${courseId}/assignments/reorder`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          order: [template3Id, template1Id, template2Id],
        })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ==========================================================================
  // GRADING CRITERIA TESTS
  // ==========================================================================

  describe('POST /assignments/:id/criteria - Add Grading Criteria', () => {
    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 1',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
        },
      });
      assignmentTemplateId = template.id;
    });

    it('should add grading criteria as teacher', async () => {
      const res = await request(app)
        .post(`/v1/assignments/${assignmentTemplateId}/criteria`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Correctness',
          description: 'Code correctness and functionality',
          maxPoints: 70,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Correctness');
      expect(res.body.data.maxPoints).toBe(70);
    });

    it('should add multiple criteria', async () => {
      await request(app)
        .post(`/v1/assignments/${assignmentTemplateId}/criteria`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Correctness',
          maxPoints: 70,
        })
        .expect(httpStatus.CREATED);

      const res = await request(app)
        .post(`/v1/assignments/${assignmentTemplateId}/criteria`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Style',
          maxPoints: 30,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.sortOrder).toBe(2);
    });

    it('should fail as student', async () => {
      await request(app)
        .post(`/v1/assignments/${assignmentTemplateId}/criteria`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: 'Correctness',
          maxPoints: 70,
        })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('PATCH /assignments/:id/criteria/:criteriaId - Update Grading Criteria', () => {
    let criteriaId: string;

    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 1',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          gradingCriteria: {
            create: {
              name: 'Correctness',
              description: 'Code correctness',
              maxPoints: 70,
              sortOrder: 1,
            },
          },
        },
        include: { gradingCriteria: true },
      });
      assignmentTemplateId = template.id;
      criteriaId = template.gradingCriteria[0].id;
    });

    it('should update grading criteria as teacher', async () => {
      const res = await request(app)
        .patch(`/v1/assignments/${assignmentTemplateId}/criteria/${criteriaId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          name: 'Updated Correctness',
          maxPoints: 80,
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Correctness');
      expect(res.body.data.maxPoints).toBe(80);
    });

    it('should fail as student', async () => {
      await request(app)
        .patch(`/v1/assignments/${assignmentTemplateId}/criteria/${criteriaId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: 'Updated' })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent criteria', async () => {
      await request(app)
        .patch(
          `/v1/assignments/${assignmentTemplateId}/criteria/00000000-0000-0000-0000-000000000000`
        )
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ name: 'Updated' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /assignments/:id/criteria/:criteriaId - Delete Grading Criteria', () => {
    let criteriaId: string;

    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 1',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          gradingCriteria: {
            create: {
              name: 'Correctness',
              description: 'Code correctness',
              maxPoints: 70,
              sortOrder: 1,
            },
          },
        },
        include: { gradingCriteria: true },
      });
      assignmentTemplateId = template.id;
      criteriaId = template.gradingCriteria[0].id;
    });

    it('should delete grading criteria as teacher', async () => {
      await request(app)
        .delete(`/v1/assignments/${assignmentTemplateId}/criteria/${criteriaId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.NO_CONTENT);

      // Verify deletion
      const deleted = await prisma.gradingCriteria.findUnique({
        where: { id: criteriaId },
      });
      expect(deleted).toBeNull();
    });

    it('should fail as student', async () => {
      await request(app)
        .delete(`/v1/assignments/${assignmentTemplateId}/criteria/${criteriaId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('PUT /assignments/:id/criteria/reorder - Reorder Grading Criteria', () => {
    let criteria1Id: string;
    let criteria2Id: string;
    let criteria3Id: string;

    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 1',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          gradingCriteria: {
            create: [
              { name: 'Criteria 1', maxPoints: 40, sortOrder: 1 },
              { name: 'Criteria 2', maxPoints: 30, sortOrder: 2 },
              { name: 'Criteria 3', maxPoints: 30, sortOrder: 3 },
            ],
          },
        },
        include: { gradingCriteria: { orderBy: { sortOrder: 'asc' } } },
      });
      assignmentTemplateId = template.id;
      criteria1Id = template.gradingCriteria[0].id;
      criteria2Id = template.gradingCriteria[1].id;
      criteria3Id = template.gradingCriteria[2].id;
    });

    it('should reorder criteria as teacher', async () => {
      const res = await request(app)
        .put(`/v1/assignments/${assignmentTemplateId}/criteria/reorder`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          order: [criteria3Id, criteria1Id, criteria2Id],
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);

      // Verify new order
      const criteria = await prisma.gradingCriteria.findMany({
        where: { assignmentTemplateId },
        orderBy: { sortOrder: 'asc' },
      });

      expect(criteria[0].id).toBe(criteria3Id);
      expect(criteria[1].id).toBe(criteria1Id);
      expect(criteria[2].id).toBe(criteria2Id);
    });

    it('should fail as student', async () => {
      await request(app)
        .put(`/v1/assignments/${assignmentTemplateId}/criteria/reorder`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          order: [criteria3Id, criteria1Id, criteria2Id],
        })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ==========================================================================
  // VALIDATION & STATS TESTS
  // ==========================================================================

  describe('GET /assignments/:id/validate - Validate Grading Criteria', () => {
    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 1',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
          gradingCriteria: {
            create: [
              { name: 'Correctness', maxPoints: 70, sortOrder: 1 },
              { name: 'Style', maxPoints: 30, sortOrder: 2 },
            ],
          },
        },
      });
      assignmentTemplateId = template.id;
    });

    it('should validate criteria sum matches maxPoints', async () => {
      const res = await request(app)
        .get(`/v1/assignments/${assignmentTemplateId}/validate`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isValid).toBe(true);
    });

    it('should fail as student', async () => {
      await request(app)
        .get(`/v1/assignments/${assignmentTemplateId}/validate`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /assignments/:id/stats - Get Template Statistics', () => {
    beforeEach(async () => {
      const template = await prisma.assignmentTemplate.create({
        data: {
          courseId,
          title: 'Homework 1',
          assignmentType: 'homework',
          gradingMode: 'points',
          maxPoints: 100,
        },
      });
      assignmentTemplateId = template.id;
    });

    it('should get template statistics as teacher', async () => {
      const res = await request(app)
        .get(`/v1/assignments/${assignmentTemplateId}/stats`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('publishedCount');
    });

    it('should fail as student', async () => {
      await request(app)
        .get(`/v1/assignments/${assignmentTemplateId}/stats`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /courses/:courseId/grading-structure - Get Grading Structure', () => {
    beforeEach(async () => {
      await prisma.assignmentTemplate.createMany({
        data: [
          {
            courseId,
            title: 'Homework 1',
            assignmentType: 'homework',
            gradingMode: 'points',
            maxPoints: 100,
            weightPercentage: 10,
          },
          {
            courseId,
            title: 'Midterm',
            assignmentType: 'midterm',
            gradingMode: 'points',
            maxPoints: 200,
            weightPercentage: 30,
          },
          {
            courseId,
            title: 'Final',
            assignmentType: 'final',
            gradingMode: 'points',
            maxPoints: 300,
            weightPercentage: 40,
          },
        ],
      });
    });

    it('should get grading structure for a course', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}/grading-structure`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('assignments');
      expect(res.body.data.assignments).toHaveLength(3);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/v1/courses/${courseId}/grading-structure`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
