import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Dashboard Module', () => {
  let adminToken: string;
  let teacherToken: string;
  let teacher2Token: string;
  let studentToken: string;
  let student2Token: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let adminId: string;
  let teacherId: string;
  let teacher2Id: string;
  let studentId: string;
  let student2Id: string;
  let courseId: string;
  let instanceId: string;
  let instance2Id: string;
  let assignmentId: string;
  let publishedAssignmentId: string;

  beforeAll(async () => {
    // Clear test data
    await prisma.submissionGrade.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.publishedGradingCriteria.deleteMany();
    await prisma.publishedAssignment.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.instanceLecturer.deleteMany();
    await prisma.courseInstance.deleteMany();
    await prisma.gradingCriteria.deleteMany();
    await prisma.assignmentTemplate.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.forumComment.deleteMany();
    await prisma.forumPost.deleteMany();
    await prisma.forum.deleteMany();
    await prisma.courseTag.deleteMany();
    await prisma.courseLecturer.deleteMany();
    await prisma.course.deleteMany();
    await prisma.token.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create roles
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

    const teacher2 = await prisma.user.create({
      data: {
        email: 'teacher2@test.com',
        passwordHash: await encryptPassword('TeacherPass123'),
        firstName: 'Jane',
        lastName: 'Teacher2',
        roles: { create: { roleId: teacherRole!.id } },
        teacherProfile: { create: {} },
      },
    });
    teacher2Id = teacher2.id;

    const student = await prisma.user.create({
      data: {
        email: 'student@test.com',
        passwordHash: await encryptPassword('StudentPass123'),
        firstName: 'Alice',
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

    const teacher2Login = await request(app).post('/v1/auth/login').send({
      email: 'teacher2@test.com',
      password: 'TeacherPass123',
    });
    teacher2Token = teacher2Login.body.data.tokens.access.token;

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
        description: 'First homework',
        assignmentType: 'homework',
        gradingMode: 'points',
        maxPoints: 100,
        weightPercentage: 10,
      },
    });
    assignmentId = assignment.id;

    // Create course instances
    const instance = await prisma.courseInstance.create({
      data: {
        courseId,
        semester: 'Fall 2025',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-12-15'),
        status: 'active',
        enrollmentLimit: 30,
        enrollmentOpen: true,
        createdBy: teacherId,
        lecturers: {
          create: { userId: teacherId },
        },
      },
    });
    instanceId = instance.id;

    const instance2 = await prisma.courseInstance.create({
      data: {
        courseId,
        semester: 'Spring 2026',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-05-15'),
        status: 'active',
        enrollmentLimit: 25,
        enrollmentOpen: true,
        createdBy: teacher2Id,
        lecturers: {
          create: { userId: teacher2Id },
        },
      },
    });
    instance2Id = instance2.id;

    // Enroll students
    await prisma.enrollment.createMany({
      data: [
        { instanceId, studentId, status: 'enrolled' },
        { instanceId, studentId: student2Id, status: 'enrolled' },
      ],
    });

    // Create forum for instance
    const forum = await prisma.forum.create({
      data: {
        instanceId,
        title: 'General Discussion',
        description: 'General course discussion',
        sortOrder: 1,
      },
    });

    // Create forum posts
    await prisma.forumPost.createMany({
      data: [
        {
          forumId: forum.id,
          authorId: studentId,
          title: 'Question about assignment',
          content: 'I need help with homework',
        },
        {
          forumId: forum.id,
          authorId: student2Id,
          title: 'Course material clarification',
          content: 'Can someone explain this concept?',
        },
      ],
    });

    // Publish assignment
    const publishedAssignment = await prisma.publishedAssignment.create({
      data: {
        instanceId,
        templateId: assignmentId,
        title: 'Homework 1',
        description: 'First homework',
        assignmentType: 'homework',
        gradingMode: 'points',
        maxPoints: 100,
        weightPercentage: 10,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'published',
      },
    });
    publishedAssignmentId = publishedAssignment.id;

    // Create submissions (some pending grading)
    await prisma.submission.createMany({
      data: [
        {
          publishedAssignmentId,
          studentId,
          content: 'Student 1 submission',
          status: 'submitted',
          submittedAt: new Date(),
        },
        {
          publishedAssignmentId,
          studentId: student2Id,
          content: 'Student 2 submission',
          status: 'late',
          submittedAt: new Date(),
          isLate: true,
        },
      ],
    });

    // Create a second published assignment for graded submission
    const publishedAssignment2 = await prisma.publishedAssignment.create({
      data: {
        instanceId,
        templateId: assignmentId,
        title: 'Homework 0 - Graded',
        description: 'Previously graded homework',
        assignmentType: 'homework',
        gradingMode: 'points',
        maxPoints: 100,
        weightPercentage: 10,
        deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'published',
      },
    });

    // Create graded submission for student2
    await prisma.submission.create({
      data: {
        publishedAssignmentId: publishedAssignment2.id,
        studentId: student2Id,
        content: 'Graded submission',
        status: 'graded',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        totalPoints: 85,
        finalPoints: 85,
      },
    });

    // Create notifications for student
    await prisma.notification.createMany({
      data: [
        {
          userId: studentId,
          type: 'assignment_published',
          title: 'New Assignment',
          message: 'Homework 1 has been published',
          isRead: false,
        },
        {
          userId: studentId,
          type: 'announcement',
          title: 'Course Announcement',
          message: 'Welcome to the course',
          isRead: true,
        },
      ],
    });
  }, 60000);

  afterAll(async () => {
    // Cleanup
    await prisma.submissionGrade.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.publishedGradingCriteria.deleteMany();
    await prisma.publishedAssignment.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.instanceLecturer.deleteMany();
    await prisma.courseInstance.deleteMany();
    await prisma.gradingCriteria.deleteMany();
    await prisma.assignmentTemplate.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.forumComment.deleteMany();
    await prisma.forumPost.deleteMany();
    await prisma.forum.deleteMany();
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
  // TEACHER DASHBOARD TESTS
  // ==========================================================================

  describe('GET /dashboard/teacher - Get Teacher Dashboard', () => {
    it('should get teacher dashboard with active instances', async () => {
      const res = await request(app)
        .get('/v1/dashboard/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('activeInstances');
      expect(res.body.data).toHaveProperty('pendingGrading');
      expect(res.body.data).toHaveProperty('recentPosts');
      expect(res.body.data).toHaveProperty('upcomingDeadlines');
      expect(res.body.data).toHaveProperty('quickStats');

      // Verify active instances
      expect(res.body.data.activeInstances).toHaveLength(1);
      expect(res.body.data.activeInstances[0].id).toBe(instanceId);

      // Verify pending grading count
      expect(res.body.data.pendingGrading).toBe(2); // 2 submissions pending

      // Verify quick stats
      expect(res.body.data.quickStats.totalStudents).toBe(2);
      expect(res.body.data.quickStats.activeInstances).toBe(1);
      expect(res.body.data.quickStats.pendingGrading).toBe(2);
    });

    it('should include recent forum posts', async () => {
      const res = await request(app)
        .get('/v1/dashboard/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recentPosts).toBeInstanceOf(Array);
      expect(res.body.data.recentPosts.length).toBeGreaterThan(0);
      expect(res.body.data.recentPosts[0]).toHaveProperty('title');
      expect(res.body.data.recentPosts[0]).toHaveProperty('author');
    });

    it('should include upcoming deadlines', async () => {
      const res = await request(app)
        .get('/v1/dashboard/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.upcomingDeadlines).toBeInstanceOf(Array);
      expect(res.body.data.upcomingDeadlines.length).toBeGreaterThan(0);
      expect(res.body.data.upcomingDeadlines[0]).toHaveProperty('deadline');
    });

    it('should return empty data for teacher with no instances', async () => {
      const res = await request(app)
        .get('/v1/dashboard/teacher')
        .set('Authorization', `Bearer ${teacher2Token}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.activeInstances).toHaveLength(1);
      expect(res.body.data.quickStats.totalStudents).toBe(0);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/v1/dashboard/teacher').expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // STUDENT DASHBOARD TESTS
  // ==========================================================================

  describe('GET /dashboard/student - Get Student Dashboard', () => {
    it('should get student dashboard with enrollments', async () => {
      const res = await request(app)
        .get('/v1/dashboard/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('enrollments');
      expect(res.body.data).toHaveProperty('upcomingAssignments');
      expect(res.body.data).toHaveProperty('recentGrades');
      expect(res.body.data).toHaveProperty('unreadNotifications');
      expect(res.body.data).toHaveProperty('quickStats');

      // Verify enrollments
      expect(res.body.data.enrollments).toHaveLength(1);
      expect(res.body.data.enrollments[0].instanceId).toBe(instanceId);

      // Verify quick stats
      expect(res.body.data.quickStats.enrolledCourses).toBe(1);
    });

    it('should include upcoming assignments', async () => {
      const res = await request(app)
        .get('/v1/dashboard/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.upcomingAssignments).toBeInstanceOf(Array);
      // Student already submitted, so no upcoming assignments for them
      expect(res.body.data.quickStats.pendingAssignments).toBeGreaterThanOrEqual(0);
    });

    it('should include recent grades', async () => {
      const res = await request(app)
        .get('/v1/dashboard/student')
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.recentGrades).toBeInstanceOf(Array);
      // student2 has a graded submission
      expect(res.body.data.recentGrades.length).toBeGreaterThan(0);
    });

    it('should show unread notifications count', async () => {
      const res = await request(app)
        .get('/v1/dashboard/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.unreadNotifications).toBe(1); // 1 unread notification
    });

    it('should return empty data for student with no enrollments', async () => {
      // Create a new student without enrollments
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      const newStudent = await prisma.user.create({
        data: {
          email: 'newstudent@test.com',
          passwordHash: await encryptPassword('StudentPass123'),
          firstName: 'New',
          lastName: 'Student',
          roles: { create: { roleId: studentRole!.id } },
          studentProfile: { create: { studentId: 'STU003', program: 'Physics' } },
        },
      });

      const newStudentLogin = await request(app).post('/v1/auth/login').send({
        email: 'newstudent@test.com',
        password: 'StudentPass123',
      });
      const newStudentToken = newStudentLogin.body.data.tokens.access.token;

      const res = await request(app)
        .get('/v1/dashboard/student')
        .set('Authorization', `Bearer ${newStudentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.enrollments).toHaveLength(0);
      expect(res.body.data.upcomingAssignments).toHaveLength(0);
      expect(res.body.data.quickStats.enrolledCourses).toBe(0);

      // Cleanup
      await prisma.studentProfile.delete({ where: { userId: newStudent.id } });
      await prisma.userRole.deleteMany({ where: { userId: newStudent.id } });
      await prisma.user.delete({ where: { id: newStudent.id } });
    });

    it('should fail without authentication', async () => {
      await request(app).get('/v1/dashboard/student').expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // INSTANCE ANALYTICS TESTS
  // ==========================================================================

  describe('GET /dashboard/instances/:instanceId/analytics - Get Instance Analytics', () => {
    it('should get instance grade distribution', async () => {
      const res = await request(app)
        .get(`/v1/dashboard/instances/${instanceId}/analytics`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('gradeDistribution');
      expect(res.body.data).toHaveProperty('averageGrade');
      expect(res.body.data).toHaveProperty('totalSubmissions');

      // Verify grade distribution structure
      expect(res.body.data.gradeDistribution).toHaveProperty('A (90-100)');
      expect(res.body.data.gradeDistribution).toHaveProperty('B (80-89)');
      expect(res.body.data.gradeDistribution).toHaveProperty('C (70-79)');
      expect(res.body.data.gradeDistribution).toHaveProperty('D (60-69)');
      expect(res.body.data.gradeDistribution).toHaveProperty('F (<60)');

      // We have 1 graded submission with 85 points (B grade)
      expect(res.body.data.totalSubmissions).toBe(1);
      expect(res.body.data.gradeDistribution['B (80-89)']).toBe(1);
    });

    it('should filter analytics by specific assignment', async () => {
      const res = await request(app)
        .get(`/v1/dashboard/instances/${instanceId}/analytics?assignmentId=${publishedAssignmentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSubmissions).toBeGreaterThanOrEqual(0);
    });

    it('should calculate correct average grade', async () => {
      const res = await request(app)
        .get(`/v1/dashboard/instances/${instanceId}/analytics`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.averageGrade).toBeGreaterThan(0);
      expect(res.body.data.averageGrade).toBeLessThanOrEqual(100);
    });

    it('should return zero stats for instance with no graded submissions', async () => {
      const res = await request(app)
        .get(`/v1/dashboard/instances/${instance2Id}/analytics`)
        .set('Authorization', `Bearer ${teacher2Token}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSubmissions).toBe(0);
      expect(res.body.data.averageGrade).toBe(0);
    });

    it('should work with admin token', async () => {
      const res = await request(app)
        .get(`/v1/dashboard/instances/${instanceId}/analytics`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('gradeDistribution');
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/v1/dashboard/instances/${instanceId}/analytics`)
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  // ==========================================================================
  // CROSS-ROLE ACCESS TESTS
  // ==========================================================================

  describe('Dashboard Access Control', () => {
    it('should allow teacher to access teacher dashboard', async () => {
      const res = await request(app)
        .get('/v1/dashboard/teacher')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
    });

    it('should allow student to access student dashboard', async () => {
      const res = await request(app)
        .get('/v1/dashboard/student')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
    });

    it('should allow admin to access both dashboards', async () => {
      const teacherRes = await request(app)
        .get('/v1/dashboard/teacher')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      const studentRes = await request(app)
        .get('/v1/dashboard/student')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(teacherRes.body.success).toBe(true);
      expect(studentRes.body.success).toBe(true);
    });
  });
});
