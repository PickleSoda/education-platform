import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Enrollment Module', () => {
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
  let enrollmentId: string;

  beforeEach(async () => {
    // Clear test data in proper order (respecting foreign keys)
    await prisma.enrollment.deleteMany();
    await prisma.instanceLecturer.deleteMany();
    await prisma.courseInstance.deleteMany();
    await prisma.courseTag.deleteMany();
    await prisma.courseLecturer.deleteMany();
    await prisma.course.deleteMany();
    await prisma.tag.deleteMany();
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

    // Get role IDs
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const teacherRole = await prisma.role.findUnique({ where: { name: 'teacher' } });
    const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });

    // Create users
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
        lastName: 'Student',
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

    // Create a test course instance
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
  });

  afterEach(async () => {
    // Cleanup in proper order
    await prisma.enrollment.deleteMany();
    await prisma.instanceLecturer.deleteMany();
    await prisma.courseInstance.deleteMany();
    await prisma.courseTag.deleteMany();
    await prisma.courseLecturer.deleteMany();
    await prisma.course.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  // ============================================================================
  // SELF-ENROLLMENT TESTS
  // ============================================================================

  describe('POST /enrollments/instances/:instanceId/enroll - Self Enrollment', () => {
    it('should allow student to self-enroll in a course instance', async () => {
      const res = await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.studentId).toBe(studentId);
      expect(res.body.data.instanceId).toBe(instanceId);
      expect(res.body.data.status).toBe('enrolled');
      enrollmentId = res.body.data.id;
    });

    it('should fail to enroll when enrollment is closed', async () => {
      await prisma.courseInstance.update({
        where: { id: instanceId },
        data: { enrollmentOpen: false },
      });

      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail to enroll when enrollment limit is reached', async () => {
      await prisma.courseInstance.update({
        where: { id: instanceId },
        data: { enrollmentLimit: 1 },
      });

      // First enrollment should succeed
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.CREATED);

      // Second enrollment should fail
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/enroll`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail to enroll if already enrolled', async () => {
      // First enrollment
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.CREATED);

      // Second enrollment attempt should fail
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.CONFLICT);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/enroll`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should fail for non-existent instance', async () => {
      await request(app)
        .post('/v1/enrollments/instances/00000000-0000-0000-0000-000000000000/enroll')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  // ============================================================================
  // TEACHER/ADMIN ENROLLMENT TESTS
  // ============================================================================

  describe('POST /enrollments/instances/:instanceId/students/enroll - Enroll Student (Teacher/Admin)', () => {
    it('should allow teacher to enroll a student', async () => {
      const res = await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/students/enroll`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentId: studentId })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.studentId).toBe(studentId);
      expect(res.body.data.status).toBe('enrolled');
    });

    it('should allow admin to enroll a student', async () => {
      const res = await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/students/enroll`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ studentId: studentId })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.studentId).toBe(studentId);
    });

    it('should fail for student role trying to enroll another student', async () => {
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/students/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ studentId: student2Id })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ============================================================================
  // GET ENROLLMENT TESTS
  // ============================================================================

  describe('GET /enrollments/:id - Get Enrollment by ID', () => {
    beforeEach(async () => {
      const enrollment = await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: studentId,
          status: 'enrolled',
        },
      });
      enrollmentId = enrollment.id;
    });

    it('should get enrollment by ID', async () => {
      const res = await request(app)
        .get(`/v1/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(enrollmentId);
      expect(res.body.data.studentId).toBe(studentId);
      expect(res.body.data.status).toBe('enrolled');
    });

    it('should return 404 for non-existent enrollment', async () => {
      await request(app)
        .get('/v1/enrollments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/v1/enrollments/${enrollmentId}`).expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ============================================================================
  // GET MY ENROLLMENTS TESTS
  // ============================================================================

  describe('GET /enrollments/me - Get My Enrollments', () => {
    beforeEach(async () => {
      await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: studentId,
          status: 'enrolled',
        },
      });
    });

    it('should get current user enrollments', async () => {
      const res = await request(app)
        .get('/v1/enrollments/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].studentId).toBe(studentId);
    });

    it('should return empty array for user with no enrollments', async () => {
      const res = await request(app)
        .get('/v1/enrollments/me')
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it('should filter by status', async () => {
      // Add a dropped enrollment
      await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: student2Id,
          status: 'dropped',
        },
      });

      const res = await request(app)
        .get('/v1/enrollments/me?status=enrolled')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('enrolled');
    });

    it('should fail without authentication', async () => {
      await request(app).get('/v1/enrollments/me').expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ============================================================================
  // GET INSTANCE ENROLLMENTS (ROSTER) TESTS
  // ============================================================================

  describe('GET /enrollments/instances/:instanceId/enrollments - Get Roster', () => {
    beforeEach(async () => {
      await prisma.enrollment.createMany({
        data: [
          { instanceId: instanceId, studentId: studentId, status: 'enrolled' },
          { instanceId: instanceId, studentId: student2Id, status: 'enrolled' },
        ],
      });
    });

    it('should get instance enrollments as teacher', async () => {
      const res = await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/enrollments`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should get instance enrollments as admin', async () => {
      const res = await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/enrollments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should fail for student role', async () => {
      await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/enrollments`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should filter by status', async () => {
      await prisma.enrollment.update({
        where: { instanceId_studentId: { instanceId, studentId: student2Id } },
        data: { status: 'dropped' },
      });

      const res = await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/enrollments?status=enrolled`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ============================================================================
  // UPDATE ENROLLMENT STATUS TESTS
  // ============================================================================

  describe('PATCH /enrollments/:id/status - Update Enrollment Status', () => {
    beforeEach(async () => {
      const enrollment = await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: studentId,
          status: 'enrolled',
        },
      });
      enrollmentId = enrollment.id;
    });

    it('should update status to dropped as teacher', async () => {
      const res = await request(app)
        .patch(`/v1/enrollments/${enrollmentId}/status`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'dropped' })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('dropped');
    });

    it('should update status to completed as admin', async () => {
      const res = await request(app)
        .patch(`/v1/enrollments/${enrollmentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.completedAt).toBeTruthy();
    });

    it('should fail for student role', async () => {
      await request(app)
        .patch(`/v1/enrollments/${enrollmentId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'dropped' })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail for invalid status transition', async () => {
      // First complete the enrollment
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { status: 'completed' },
      });

      // Try to drop a completed enrollment (invalid)
      await request(app)
        .patch(`/v1/enrollments/${enrollmentId}/status`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ status: 'dropped' })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should return 404 for non-existent enrollment', async () => {
      await request(app)
        .patch('/v1/enrollments/00000000-0000-0000-0000-000000000000/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'dropped' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  // ============================================================================
  // DROP STUDENT TESTS
  // ============================================================================

  describe('POST /enrollments/instances/:instanceId/students/:studentId/drop - Drop Student', () => {
    beforeEach(async () => {
      await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: studentId,
          status: 'enrolled',
        },
      });
    });

    it('should drop student as teacher', async () => {
      const res = await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/students/${studentId}/drop`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('dropped');
    });

    it('should drop student as admin', async () => {
      const res = await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/students/${studentId}/drop`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('dropped');
    });

    it('should fail for student role', async () => {
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/students/${studentId}/drop`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail for non-enrolled student', async () => {
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/students/${student2Id}/drop`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  // ============================================================================
  // DELETE ENROLLMENT TESTS
  // ============================================================================

  describe('DELETE /enrollments/:id - Delete Enrollment', () => {
    beforeEach(async () => {
      const enrollment = await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: studentId,
          status: 'enrolled',
        },
      });
      enrollmentId = enrollment.id;
    });

    it('should delete enrollment as admin', async () => {
      await request(app)
        .delete(`/v1/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
      expect(enrollment).toBeNull();
    });

    it('should fail to delete as teacher', async () => {
      await request(app)
        .delete(`/v1/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail to delete as student', async () => {
      await request(app)
        .delete(`/v1/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent enrollment', async () => {
      await request(app)
        .delete('/v1/enrollments/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  // ============================================================================
  // BULK ENROLLMENT TESTS
  // ============================================================================

  describe('POST /enrollments/instances/:instanceId/bulk-enroll - Bulk Enroll', () => {
    it('should bulk enroll students as teacher', async () => {
      const res = await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/bulk-enroll`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentIds: [studentId, student2Id] })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.successful).toHaveLength(2);
      expect(res.body.data.failed).toHaveLength(0);
    });

    it('should handle already enrolled students in bulk enroll', async () => {
      // Pre-enroll one student
      await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: studentId,
          status: 'enrolled',
        },
      });

      const res = await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/bulk-enroll`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentIds: [studentId, student2Id] })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.successful).toHaveLength(1);
      expect(res.body.data.failed).toHaveLength(1);
      expect(res.body.data.failed[0].studentId).toBe(studentId);
    });

    it('should fail for student role', async () => {
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/bulk-enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ studentIds: [studentId, student2Id] })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail with empty student list', async () => {
      await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/bulk-enroll`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ studentIds: [] })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  // ============================================================================
  // ENROLLMENT STATISTICS TESTS
  // ============================================================================

  describe('GET /enrollments/instances/:instanceId/stats - Get Enrollment Stats', () => {
    beforeEach(async () => {
      await prisma.enrollment.createMany({
        data: [
          { instanceId: instanceId, studentId: studentId, status: 'enrolled' },
          { instanceId: instanceId, studentId: student2Id, status: 'dropped' },
        ],
      });
    });

    it('should get enrollment stats as teacher', async () => {
      const res = await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/stats`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalEnrolled).toBe(1);
      expect(res.body.data.totalDropped).toBe(1);
      expect(res.body.data.enrollmentOpen).toBe(true);
      expect(res.body.data.enrollmentLimit).toBe(30);
    });

    it('should fail for student role', async () => {
      await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/stats`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ============================================================================
  // CHECK ENROLLMENT TESTS
  // ============================================================================

  describe('GET /enrollments/instances/:instanceId/students/:studentId/enrolled - Check Enrollment', () => {
    beforeEach(async () => {
      await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: studentId,
          status: 'enrolled',
        },
      });
    });

    it('should return true for enrolled student', async () => {
      const res = await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/students/${studentId}/enrolled`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isEnrolled).toBe(true);
    });

    it('should return false for non-enrolled student', async () => {
      const res = await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/students/${student2Id}/enrolled`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isEnrolled).toBe(false);
    });

    it('should return false for dropped student', async () => {
      await prisma.enrollment.update({
        where: { instanceId_studentId: { instanceId, studentId } },
        data: { status: 'dropped' },
      });

      const res = await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/students/${studentId}/enrolled`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isEnrolled).toBe(false);
    });
  });

  // ============================================================================
  // EXPORT ROSTER TESTS
  // ============================================================================

  describe('GET /enrollments/instances/:instanceId/roster/export - Export Roster', () => {
    beforeEach(async () => {
      await prisma.enrollment.createMany({
        data: [
          { instanceId: instanceId, studentId: studentId, status: 'enrolled' },
          { instanceId: instanceId, studentId: student2Id, status: 'enrolled' },
        ],
      });
    });

    it('should export roster as teacher', async () => {
      const res = await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/roster/export`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.headers).toContain('Email');
      expect(res.body.data.headers).toContain('First Name');
      expect(res.body.data.headers).toContain('Last Name');
      expect(res.body.data.rows).toHaveLength(2);
    });

    it('should fail for student role', async () => {
      await request(app)
        .get(`/v1/enrollments/instances/${instanceId}/roster/export`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  // ============================================================================
  // RE-ENROLLMENT TESTS
  // ============================================================================

  describe('Re-enrollment after dropping', () => {
    beforeEach(async () => {
      await prisma.enrollment.create({
        data: {
          instanceId: instanceId,
          studentId: studentId,
          status: 'dropped',
        },
      });
    });

    it('should allow re-enrollment after being dropped', async () => {
      const res = await request(app)
        .post(`/v1/enrollments/instances/${instanceId}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('enrolled');
    });
  });
});
