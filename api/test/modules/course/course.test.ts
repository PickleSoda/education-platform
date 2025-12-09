import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Course Module', () => {
  let adminToken: string;
  let teacherToken: string;
  let studentToken: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let adminId: string;
  let teacherId: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let studentId: string;
  let courseId: string;
  let tagId: number;

  beforeEach(async () => {
    // Clear test data
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

    // Create a test tag
    const tag = await prisma.tag.create({
      data: {
        name: 'Computer Science',
        color: '#0000FF',
      },
    });
    tagId = tag.id;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.courseTag.deleteMany();
    await prisma.courseLecturer.deleteMany();
    await prisma.course.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /courses - Create Course', () => {
    it('should create a new course as admin', async () => {
      const res = await request(app)
        .post('/v1/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'A foundational course in computer science',
          credits: 3,
          typicalDurationWeeks: 15,
          tagIds: [tagId],
          lecturerIds: [teacherId],
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('CS101');
      expect(res.body.data.title).toBe('Introduction to Computer Science');
      expect(res.body.data.credits).toBe(3);
      expect(res.body.data.tags).toHaveLength(1);
      expect(res.body.data.lecturers).toHaveLength(1);
      courseId = res.body.data.id;
    });

    it('should create a new course as teacher', async () => {
      const res = await request(app)
        .post('/v1/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          code: 'CS102',
          title: 'Data Structures',
          description: 'Learn about data structures',
          credits: 4,
          typicalDurationWeeks: 15,
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('CS102');
      expect(res.body.data.title).toBe('Data Structures');
    });

    it('should fail to create course as student', async () => {
      await request(app)
        .post('/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          code: 'CS103',
          title: 'Algorithms',
        })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail to create course without authentication', async () => {
      await request(app)
        .post('/v1/courses')
        .send({
          code: 'CS104',
          title: 'Operating Systems',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /courses - List Courses', () => {
    beforeEach(async () => {
      // Create some test courses
      await prisma.course.createMany({
        data: [
          {
            code: 'CS101',
            title: 'Introduction to Computer Science',
            description: 'Fundamentals of CS',
            credits: 3,
            isArchived: false,
          },
          {
            code: 'CS102',
            title: 'Data Structures',
            description: 'Learn data structures',
            credits: 4,
            isArchived: false,
          },
          {
            code: 'CS103',
            title: 'Algorithms',
            description: 'Algorithm design',
            credits: 4,
            isArchived: true,
          },
        ],
      });
    });

    it('should list all non-archived courses', async () => {
      const res = await request(app)
        .get('/v1/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
    });

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/v1/courses?page=1&limit=1')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(1);
      expect(res.body.meta.totalPages).toBe(2);
    });

    it('should support search by title', async () => {
      const res = await request(app)
        .get('/v1/courses?search=Data')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toContain('Data');
    });

    it('should include archived courses when requested by admin', async () => {
      const res = await request(app)
        .get('/v1/courses?includeArchived=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(3);
    });

    it('should fail without authentication', async () => {
      await request(app).get('/v1/courses').expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /courses/:id - Get Course Details', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
        },
      });
      courseId = course.id;
    });

    it('should get course details with authentication', async () => {
      const res = await request(app)
        .get(`/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(courseId);
      expect(res.body.data.code).toBe('CS101');
    });

    it('should return 404 for non-existent course', async () => {
      await request(app)
        .get('/v1/courses/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without authentication', async () => {
      await request(app).get(`/v1/courses/${courseId}`).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /courses/:id - Update Course', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
        },
      });
      courseId = course.id;
    });

    it('should update course as admin', async () => {
      const res = await request(app)
        .patch(`/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          credits: 4,
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.credits).toBe(4);
      expect(res.body.data.code).toBe('CS101'); // Should remain unchanged
    });

    it('should update course as teacher', async () => {
      const res = await request(app)
        .patch(`/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          description: 'Updated description',
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Updated description');
    });

    it('should fail to update course as student', async () => {
      await request(app)
        .patch(`/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Should Fail',
        })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent course', async () => {
      await request(app)
        .patch('/v1/courses/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Test' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /courses/:id - Delete Course', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
        },
      });
      courseId = course.id;
    });

    it('should delete course as admin', async () => {
      await request(app)
        .delete(`/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NO_CONTENT);

      const course = await prisma.course.findUnique({ where: { id: courseId } });
      expect(course).toBeNull();
    });

    it('should fail to delete course as teacher', async () => {
      await request(app)
        .delete(`/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail to delete course as student', async () => {
      await request(app)
        .delete(`/v1/courses/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent course', async () => {
      await request(app)
        .delete('/v1/courses/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('POST /courses/:id/archive - Archive Course', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
          isArchived: false,
        },
      });
      courseId = course.id;
    });

    it('should archive course as admin', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isArchived).toBe(true);
    });

    it('should fail to archive as student', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/archive`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('POST /courses/:id/unarchive - Unarchive Course', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
          isArchived: true,
        },
      });
      courseId = course.id;
    });

    it('should unarchive course as admin', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/unarchive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isArchived).toBe(false);
    });
  });

  describe('Course Tags', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
        },
      });
      courseId = course.id;
    });

    it('should add tag to course', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/tags`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ tagId })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
    });

    it('should remove tag from course', async () => {
      await prisma.courseTag.create({
        data: {
          courseId,
          tagId,
        },
      });

      await request(app)
        .delete(`/v1/courses/${courseId}/tags/${tagId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NO_CONTENT);
    });

    it('should fail to add tag as student', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/tags`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ tagId })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('Course Lecturers', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
        },
      });
      courseId = course.id;
    });

    it('should add lecturer to course', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/lecturers`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: teacherId,
          isPrimary: true,
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
    });

    it('should remove lecturer from course', async () => {
      await prisma.courseLecturer.create({
        data: {
          courseId,
          userId: teacherId,
          isPrimary: false,
        },
      });

      await request(app)
        .delete(`/v1/courses/${courseId}/lecturers/${teacherId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NO_CONTENT);
    });

    it('should fail to add lecturer as student', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/lecturers`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: teacherId,
          isPrimary: false,
        })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /courses/my/teaching - Get Teaching Courses', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
          lecturers: {
            create: {
              userId: teacherId,
              isPrimary: true,
            },
          },
        },
      });
      courseId = course.id;
    });

    it('should get teaching courses as teacher', async () => {
      const res = await request(app)
        .get('/v1/courses/my/teaching')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].code).toBe('CS101');
    });

    it('should return empty array for non-teaching user', async () => {
      const res = await request(app)
        .get('/v1/courses/my/teaching')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('POST /courses/:id/copy - Copy Course', () => {
    beforeEach(async () => {
      const course = await prisma.course.create({
        data: {
          code: 'CS101',
          title: 'Introduction to Computer Science',
          description: 'Fundamentals of CS',
          credits: 3,
        },
      });
      courseId = course.id;
    });

    it('should copy course as admin', async () => {
      const res = await request(app)
        .post(`/v1/courses/${courseId}/copy`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newCode: 'CS101-COPY',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('CS101-COPY');
      expect(res.body.data.title).toBe('Introduction to Computer Science');
      expect(res.body.data.id).not.toBe(courseId);
    });

    it('should fail to copy without new code', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/copy`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail to copy as student', async () => {
      await request(app)
        .post(`/v1/courses/${courseId}/copy`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          newCode: 'CS101-COPY',
        })
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /courses/search - Search Courses', () => {
    beforeEach(async () => {
      await prisma.course.createMany({
        data: [
          {
            code: 'CS101',
            title: 'Introduction to Computer Science',
            description: 'Fundamentals of programming',
            credits: 3,
          },
          {
            code: 'MATH201',
            title: 'Calculus I',
            description: 'Introduction to calculus',
            credits: 4,
          },
        ],
      });
    });

    it('should search courses by query', async () => {
      const res = await request(app)
        .get('/v1/courses/search?q=Computer')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toContain('Computer');
    });

    it('should limit search results', async () => {
      const res = await request(app)
        .get('/v1/courses/search?q=Introduction&limit=1')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
    });
  });
});
