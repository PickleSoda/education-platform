import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('User Module', () => {
  let adminToken: string;
  let testUserId: string;
  let teacherId: string;
  let studentId: string;

  beforeEach(async () => {
    // Clear test data
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

    // Create admin user for testing
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const passwordHash = await encryptPassword('AdminPass123');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        roles: {
          create: {
            roleId: adminRole!.id,
          },
        },
      },
    });

    // Login as admin to get token
    const loginRes = await request(app).post('/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'AdminPass123',
    });
    adminToken = loginRes.body.data.tokens.access.token;
  });

  afterEach(async () => {
    // Cleanup
    await prisma.userRole.deleteMany();
    await prisma.teacherProfile.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /users - Create User', () => {
    it('should create a new teacher user', async () => {
      const res = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'teacher@test.com',
          password: 'TeacherPass123',
          firstName: 'John',
          lastName: 'Teacher',
          roleName: 'teacher',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('teacher@test.com');
      expect(res.body.data.firstName).toBe('John');
      expect(res.body.data.lastName).toBe('Teacher');
      expect(res.body.data.roles).toHaveLength(1);
      expect(res.body.data.roles[0].role.name).toBe('teacher');
      teacherId = res.body.data.id;
    });

    it('should create a new student user', async () => {
      const res = await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'student@test.com',
          password: 'StudentPass123',
          firstName: 'Jane',
          lastName: 'Student',
          roleName: 'student',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.data.roles[0].role.name).toBe('student');
      studentId = res.body.data.id;
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'duplicate@test.com',
          password: 'Pass123',
          firstName: 'First',
          lastName: 'User',
          roleName: 'student',
        });

      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'duplicate@test.com',
          password: 'Pass123',
          firstName: 'Second',
          lastName: 'User',
          roleName: 'student',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail with weak password', async () => {
      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'weak@test.com',
          password: 'weak',
          firstName: 'Weak',
          lastName: 'Password',
          roleName: 'student',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail without required fields', async () => {
      await request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'incomplete@test.com',
          password: 'Pass123',
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /users - List Users', () => {
    beforeEach(async () => {
      // Create test users
      const teacherRole = await prisma.role.findUnique({ where: { name: 'teacher' } });
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });

      await prisma.user.create({
        data: {
          email: 'teacher1@test.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Teacher',
          lastName: 'One',
          roles: { create: { roleId: teacherRole!.id } },
        },
      });

      await prisma.user.create({
        data: {
          email: 'student1@test.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Student',
          lastName: 'One',
          roles: { create: { roleId: studentRole!.id } },
        },
      });
    });

    it('should list all users with pagination', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('total');
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ roles: 'teacher' })
        .expect(httpStatus.OK);

      expect(res.body.data.every((u: any) => u.roles.some((r: any) => r.role.name === 'teacher'))).toBe(true);
    });

    it('should search users by name', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'Teacher' })
        .expect(httpStatus.OK);

      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by active status', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ isActive: 'true' })
        .expect(httpStatus.OK);

      expect(res.body.data.every((u: any) => u.isActive === true)).toBe(true);
    });
  });

  describe('GET /users/:id - Get User', () => {
    beforeEach(async () => {
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      const user = await prisma.user.create({
        data: {
          email: 'getuser@test.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Get',
          lastName: 'User',
          roles: { create: { roleId: studentRole!.id } },
        },
      });
      testUserId = user.id;
    });

    it('should get user by id', async () => {
      const res = await request(app)
        .get(`/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.data.id).toBe(testUserId);
      expect(res.body.data.email).toBe('getuser@test.com');
      expect(res.body.data.roles).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/v1/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /users/:id - Update User', () => {
    beforeEach(async () => {
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      const user = await prisma.user.create({
        data: {
          email: 'update@test.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Update',
          lastName: 'User',
          roles: { create: { roleId: studentRole!.id } },
        },
      });
      testUserId = user.id;
    });

    it('should update user details', async () => {
      const res = await request(app)
        .patch(`/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        })
        .expect(httpStatus.OK);

      expect(res.body.data.firstName).toBe('Updated');
      expect(res.body.data.lastName).toBe('Name');
    });

    it('should update user email', async () => {
      const res = await request(app)
        .patch(`/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newemail@test.com',
        })
        .expect(httpStatus.OK);

      expect(res.body.data.email).toBe('newemail@test.com');
    });

    it('should fail with duplicate email', async () => {
      await prisma.user.create({
        data: {
          email: 'existing@test.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Existing',
          lastName: 'User',
        },
      });

      await request(app)
        .patch(`/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'existing@test.com',
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /users/:id/deactivate - Soft Delete', () => {
    beforeEach(async () => {
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      const user = await prisma.user.create({
        data: {
          email: 'deactivate@test.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Deactivate',
          lastName: 'User',
          roles: { create: { roleId: studentRole!.id } },
        },
      });
      testUserId = user.id;
    });

    it('should soft delete user', async () => {
      const res = await request(app)
        .post(`/v1/users/${testUserId}/deactivate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.data.isActive).toBe(false);
    });
  });

  describe('Role Management', () => {
    beforeEach(async () => {
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      const user = await prisma.user.create({
        data: {
          email: 'roles@test.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Role',
          lastName: 'User',
          roles: { create: { roleId: studentRole!.id } },
        },
      });
      testUserId = user.id;
    });

    it('should get user roles', async () => {
      const res = await request(app)
        .get(`/v1/users/${testUserId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.data).toContain('student');
    });

    it('should add role to user', async () => {
      const res = await request(app)
        .post(`/v1/users/${testUserId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleName: 'teacher' })
        .expect(httpStatus.OK);

      expect(res.body.data.roles).toHaveLength(2);
    });

    it('should remove role from user', async () => {
      await request(app)
        .delete(`/v1/users/${testUserId}/roles/student`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);
    });

    it('should fail to add duplicate role', async () => {
      await request(app)
        .post(`/v1/users/${testUserId}/roles`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ roleName: 'student' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('Profile Management', () => {
    beforeEach(async () => {
      const teacherRole = await prisma.role.findUnique({ where: { name: 'teacher' } });
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });

      const teacher = await prisma.user.create({
        data: {
          email: 'teacher@profile.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Teacher',
          lastName: 'Profile',
          roles: { create: { roleId: teacherRole!.id } },
        },
      });
      teacherId = teacher.id;

      const student = await prisma.user.create({
        data: {
          email: 'student@profile.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Student',
          lastName: 'Profile',
          roles: { create: { roleId: studentRole!.id } },
        },
      });
      studentId = student.id;
    });

    it('should update teacher profile', async () => {
      const res = await request(app)
        .put(`/v1/users/${teacherId}/teacher-profile`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          department: 'Computer Science',
          title: 'Professor',
          bio: 'Experienced educator',
          officeLocation: 'Building A, Room 101',
        })
        .expect(httpStatus.OK);

      expect(res.body.data.profile.department).toBe('Computer Science');
      expect(res.body.data.profile.title).toBe('Professor');
    });

    it('should get teacher profile', async () => {
      await prisma.teacherProfile.create({
        data: {
          userId: teacherId,
          department: 'CS',
          title: 'Prof',
        },
      });

      const res = await request(app)
        .get(`/v1/users/${teacherId}/teacher-profile`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body.data.profile.department).toBe('CS');
    });

    it('should update student profile', async () => {
      const res = await request(app)
        .put(`/v1/users/${studentId}/student-profile`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'S12345',
          enrollmentYear: 2024,
          program: 'Computer Science',
        })
        .expect(httpStatus.OK);

      expect(res.body.data.profile.studentId).toBe('S12345');
      expect(res.body.data.profile.enrollmentYear).toBe(2024);
    });

    it('should fail to update teacher profile for non-teacher', async () => {
      await request(app)
        .put(`/v1/users/${studentId}/teacher-profile`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          department: 'CS',
        })
        .expect(httpStatus.FORBIDDEN);
    });
  });
});
