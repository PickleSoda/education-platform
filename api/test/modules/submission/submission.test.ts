import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Submission Module', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  let student2Token: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let adminId: string;
  let teacherId: string;
  let studentId: string;
  let student2Id: string;
  let courseId: string;
  let instanceId: string;
  let assignmentId: string;
  let publishedAssignmentId: string;
  let criteriaId: string;
  let submissionId: string;

  beforeAll(async () => {
    // Clear test data in proper order for FK constraints
    await prisma.submissionGrade.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.publishedGradingCriteria.deleteMany();
    await prisma.publishedAssignment.deleteMany();
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
        studentProfile: { create: { studentId: 'STU001', program: 'Computer Science' } },
      },
    });
    studentId = student.id;

    const student2 = await prisma.user.create({
      data: {
        email: 'student2@test.com',
        passwordHash: await encryptPassword('StudentPass123'),
        firstName: 'Bob',
        lastName: 'Student2',
        roles: { create: { roleId: studentRole!.id } },
        studentProfile: { create: { studentId: 'STU002', program: 'Mathematics' } },
      },
    });
    student2Id = student2.id;

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

    const student2Login = await request(app).post('/v1/auth/login').send({
      email: 'student2@test.com',
      password: 'StudentPass123',
    });
    student2Token = student2Login.body.data.tokens.access.token;

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

    // Create assignment template
    const assignment = await prisma.assignmentTemplate.create({
      data: {
        courseId,
        title: 'Homework 1',
        description: 'First homework assignment',
        assignmentType: 'homework',
        gradingMode: 'points',
        maxPoints: 100,
      },
    });
    assignmentId = assignment.id;

    // Create grading criteria
    const criteria = await prisma.gradingCriteria.create({
      data: {
        assignmentTemplateId: assignmentId,
        name: 'Correctness',
        description: 'Code correctness',
        maxPoints: 100,
        sortOrder: 1,
      },
    });
    criteriaId = criteria.id;

    // Create course instance
    const instance = await prisma.courseInstance.create({
      data: {
        courseId: courseId,
        semester: 'Fall 2025',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-12-15'),
        status: 'active',
        enrollmentLimit: 30,
        enrollmentOpen: true,
        createdBy: teacherId,
      },
    });
    instanceId = instance.id;

    // Enroll students
    await prisma.enrollment.createMany({
      data: [
        { instanceId, studentId, status: 'enrolled' },
        { instanceId, studentId: student2Id, status: 'enrolled' },
      ],
    });

    // Publish assignment
    const publishedAssignment = await prisma.publishedAssignment.create({
      data: {
        instanceId,
        templateId: assignmentId,
        title: 'Homework 1',
        description: 'First homework assignment',
        assignmentType: 'homework',
        gradingMode: 'points',
        maxPoints: 100,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        lateDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        latePenaltyPercent: 10,
        status: 'published',
      },
    });
    publishedAssignmentId = publishedAssignment.id;

    // Create published grading criteria
    await prisma.publishedGradingCriteria.create({
      data: {
        publishedAssignmentId,
        templateCriteriaId: criteriaId,
        name: 'Correctness',
        description: 'Code correctness',
        maxPoints: 100,
        sortOrder: 1,
      },
    });
  }, 30000);

  beforeEach(async () => {
    // Clean submission-specific data between tests
    await prisma.submissionGrade.deleteMany();
    await prisma.submission.deleteMany();
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.submissionGrade.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.publishedGradingCriteria.deleteMany();
    await prisma.publishedAssignment.deleteMany();
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
  // SAVE SUBMISSION DRAFT TESTS
  // ==========================================================================

  describe('POST /submissions/assignments/:assignmentId/draft - Save Submission Draft', () => {
    it('should save submission draft as student', async () => {
      const res = await request(app)
        .post(`/v1/submissions/assignments/${publishedAssignmentId}/draft`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          content: 'My draft submission content',
          attachments: { files: ['file1.pdf'] },
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.content).toBe('My draft submission content');
      expect(res.body.data.studentId).toBe(studentId);
    });

    it('should update existing draft on save', async () => {
      // First save
      await request(app)
        .post(`/v1/submissions/assignments/${publishedAssignmentId}/draft`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'Original content' })
        .expect(httpStatus.CREATED);

      // Second save should update
      const res = await request(app)
        .post(`/v1/submissions/assignments/${publishedAssignmentId}/draft`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'Updated content' })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Updated content');
    });

    it('should fail for non-existent assignment', async () => {
      await request(app)
        .post('/v1/submissions/assignments/00000000-0000-0000-0000-000000000000/draft')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'Content' })
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/v1/submissions/assignments/${publishedAssignmentId}/draft`)
        .send({ content: 'Content' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // SUBMIT ASSIGNMENT TESTS
  // ==========================================================================

  describe('POST /submissions/assignments/:assignmentId/submit - Submit Assignment', () => {
    beforeEach(async () => {
      // Create a draft submission first
      await prisma.submission.create({
        data: {
          publishedAssignmentId,
          studentId,
          content: 'My submission content',
          status: 'draft',
        },
      });
    });

    it('should submit assignment as student', async () => {
      const res = await request(app)
        .post(`/v1/submissions/assignments/${publishedAssignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('submitted');
      expect(res.body.data.submittedAt).toBeTruthy();
    });

    it('should mark late submissions', async () => {
      // Update assignment to have past deadline
      await prisma.publishedAssignment.update({
        where: { id: publishedAssignmentId },
        data: {
          deadline: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
      });

      const res = await request(app)
        .post(`/v1/submissions/assignments/${publishedAssignmentId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('late');
      expect(res.body.data.isLate).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/v1/submissions/assignments/${publishedAssignmentId}/submit`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // GET SUBMISSION TESTS
  // ==========================================================================

  describe('GET /submissions/:submissionId - Get Submission by ID', () => {
    beforeEach(async () => {
      const submission = await prisma.submission.create({
        data: {
          publishedAssignmentId,
          studentId,
          content: 'Test submission',
          status: 'submitted',
          submittedAt: new Date(),
        },
      });
      submissionId = submission.id;
    });

    it('should get submission by ID', async () => {
      const res = await request(app)
        .get(`/v1/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(submissionId);
      expect(res.body.data.content).toBe('Test submission');
    });

    it('should fail for non-existent submission', async () => {
      await request(app)
        .get('/v1/submissions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/v1/submissions/${submissionId}`).expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // LIST SUBMISSIONS TESTS
  // ==========================================================================

  describe('GET /submissions - List Submissions', () => {
    beforeEach(async () => {
      await prisma.submission.createMany({
        data: [
          {
            publishedAssignmentId,
            studentId,
            content: 'Submission 1',
            status: 'submitted',
            submittedAt: new Date(),
          },
          {
            publishedAssignmentId,
            studentId: student2Id,
            content: 'Submission 2',
            status: 'graded',
            submittedAt: new Date(),
            gradedAt: new Date(),
          },
        ],
      });
    });

    it('should list submissions with filters', async () => {
      const res = await request(app)
        .get(`/v1/submissions?assignmentId=${publishedAssignmentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter by student', async () => {
      const res = await request(app)
        .get(`/v1/submissions?studentId=${studentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].studentId).toBe(studentId);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get(`/v1/submissions?status=graded`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('graded');
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get(`/v1/submissions?page=1&limit=1`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.totalPages).toBe(2);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/v1/submissions').expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // GRADE SUBMISSION TESTS
  // ==========================================================================

  describe('POST /submissions/:submissionId/grade - Grade Submission', () => {
    let publishedCriteriaId: string;

    beforeEach(async () => {
      const submission = await prisma.submission.create({
        data: {
          publishedAssignmentId,
          studentId,
          content: 'Test submission',
          status: 'submitted',
          submittedAt: new Date(),
        },
      });
      submissionId = submission.id;

      const publishedCriteria = await prisma.publishedGradingCriteria.findFirst({
        where: { publishedAssignmentId },
      });
      publishedCriteriaId = publishedCriteria!.id;
    });

    it('should grade submission as teacher', async () => {
      const res = await request(app)
        .post(`/v1/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          criteriaGrades: [
            {
              criteriaId: publishedCriteriaId,
              pointsAwarded: 85,
              feedback: 'Good work',
            },
          ],
          overallFeedback: 'Well done overall',
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('graded');
      expect(res.body.data.totalPoints).toBe(85);
      expect(res.body.data.finalPoints).toBe(85);
      expect(res.body.data.gradedAt).toBeTruthy();
    });

    it('should apply late penalty when grading late submission', async () => {
      // Mark submission as late
      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'late', isLate: true },
      });

      const res = await request(app)
        .post(`/v1/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          criteriaGrades: [
            {
              criteriaId: publishedCriteriaId,
              pointsAwarded: 100,
            },
          ],
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalPoints).toBe(100);
      expect(res.body.data.latePenaltyApplied).toBe(10); // 10% penalty
      expect(res.body.data.finalPoints).toBe(90);
    });

    it('should fail as student', async () => {
      await request(app)
        .post(`/v1/submissions/${submissionId}/grade`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          criteriaGrades: [
            {
              criteriaId: publishedCriteriaId,
              pointsAwarded: 85,
            },
          ],
        })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail for non-existent submission', async () => {
      await request(app)
        .post('/v1/submissions/00000000-0000-0000-0000-000000000000/grade')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          criteriaGrades: [
            {
              criteriaId: publishedCriteriaId,
              pointsAwarded: 85,
            },
          ],
        })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  // ==========================================================================
  // GRADE PASS/FAIL TESTS
  // ==========================================================================

  describe('POST /submissions/:submissionId/grade-pass-fail - Grade Pass/Fail', () => {
    let passfailAssignmentId: string;

    beforeEach(async () => {
      // Create a pass/fail assignment
      const passfailAssignment = await prisma.publishedAssignment.create({
        data: {
          instanceId,
          templateId: assignmentId,
          title: 'Participation',
          description: 'Class participation',
          assignmentType: 'participation',
          gradingMode: 'pass_fail',
          status: 'published',
        },
      });
      passfailAssignmentId = passfailAssignment.id;

      const submission = await prisma.submission.create({
        data: {
          publishedAssignmentId: passfailAssignment.id,
          studentId,
          content: 'Participated',
          status: 'submitted',
          submittedAt: new Date(),
        },
      });
      submissionId = submission.id;
    });

    afterEach(async () => {
      // Clean up pass/fail assignment and submissions created in this test group
      await prisma.submission.deleteMany({
        where: { publishedAssignmentId: passfailAssignmentId },
      });
      await prisma.publishedAssignment.delete({
        where: { id: passfailAssignmentId },
      });
    });

    it('should grade as pass', async () => {
      const res = await request(app)
        .post(`/v1/submissions/${submissionId}/grade-pass-fail`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          isPassed: true,
          feedback: 'Good participation',
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('graded');
      expect(res.body.data.isPassed).toBe(true);
    });

    it('should grade as fail', async () => {
      const res = await request(app)
        .post(`/v1/submissions/${submissionId}/grade-pass-fail`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          isPassed: false,
          feedback: 'Needs improvement',
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isPassed).toBe(false);
    });

    it('should fail as student', async () => {
      await request(app)
        .post(`/v1/submissions/${submissionId}/grade-pass-fail`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ isPassed: true })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ==========================================================================
  // GET GRADEBOOK TESTS
  // ==========================================================================

  describe('GET /submissions/instances/:instanceId/students/:studentId/gradebook - Get Gradebook', () => {
    beforeEach(async () => {
      await prisma.submission.create({
        data: {
          publishedAssignmentId,
          studentId,
          content: 'Test',
          status: 'graded',
          submittedAt: new Date(),
          gradedAt: new Date(),
          totalPoints: 85,
          finalPoints: 85,
        },
      });
    });

    it('should get student gradebook', async () => {
      const res = await request(app)
        .get(`/v1/submissions/instances/${instanceId}/students/${studentId}/gradebook`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.assignments).toHaveLength(1);
      expect(res.body.data.assignments[0].submission).toBeTruthy();
    });

    it('should return empty for student with no submissions', async () => {
      const res = await request(app)
        .get(`/v1/submissions/instances/${instanceId}/students/${student2Id}/gradebook`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.assignments).toHaveLength(1);
      expect(res.body.data.assignments[0].submission).toBeNull();
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/v1/submissions/instances/${instanceId}/students/${studentId}/gradebook`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // GET SUBMISSION STATS TESTS
  // ==========================================================================

  describe('GET /submissions/assignments/:assignmentId/stats - Get Submission Stats', () => {
    beforeEach(async () => {
      await prisma.submission.createMany({
        data: [
          {
            publishedAssignmentId,
            studentId,
            content: 'Test 1',
            status: 'submitted',
            submittedAt: new Date(),
          },
          {
            publishedAssignmentId,
            studentId: student2Id,
            content: 'Test 2',
            status: 'graded',
            submittedAt: new Date(),
            gradedAt: new Date(),
            totalPoints: 90,
            finalPoints: 90,
          },
        ],
      });
    });

    it('should get submission statistics as teacher', async () => {
      const res = await request(app)
        .get(`/v1/submissions/assignments/${publishedAssignmentId}/stats`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.submitted).toBe(2);
      expect(res.body.data.graded).toBe(1);
      expect(res.body.data.pending).toBe(1);
    });

    it('should calculate average score', async () => {
      const res = await request(app)
        .get(`/v1/submissions/assignments/${publishedAssignmentId}/stats`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.averageScore).toBe(90);
    });

    it('should fail as student', async () => {
      await request(app)
        .get(`/v1/submissions/assignments/${publishedAssignmentId}/stats`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ==========================================================================
  // UPDATE SUBMISSION TESTS
  // ==========================================================================

  describe('PATCH /submissions/:submissionId - Update Submission', () => {
    beforeEach(async () => {
      const submission = await prisma.submission.create({
        data: {
          publishedAssignmentId,
          studentId,
          content: 'Original content',
          status: 'draft',
        },
      });
      submissionId = submission.id;
    });

    it('should update submission draft as student', async () => {
      const res = await request(app)
        .patch(`/v1/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          content: 'Updated content',
          attachments: { files: ['newfile.pdf'] },
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Updated content');
    });

    it('should fail for non-existent submission', async () => {
      await request(app)
        .patch('/v1/submissions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ content: 'Updated' })
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .patch(`/v1/submissions/${submissionId}`)
        .send({ content: 'Updated' })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
