import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import httpStatus from 'http-status';
import request from 'supertest';
import app from '@/app';
import prisma from '@/client';
import { encryptPassword } from '@/shared/utils/encryption';

describe('Auth Module', () => {
  beforeEach(async () => {
    // Clear test data
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();

    // Create roles if they don't exist
    await prisma.role.upsert({
      where: { name: 'student' },
      create: { name: 'student', description: 'Student' },
      update: {},
    });
    await prisma.role.upsert({
      where: { name: 'teacher' },
      create: { name: 'teacher', description: 'Teacher' },
      update: {},
    });
  });

  afterEach(async () => {
    // Cleanup
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /auth/register - Register', () => {
    it('should register a new student user', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'student@test.com',
          password: 'StudentPass123',
          firstName: 'John',
          lastName: 'Doe',
          roleName: 'student',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('student@test.com');
      expect(res.body.data.user.firstName).toBe('John');
      expect(res.body.data.user.lastName).toBe('Doe');
      expect(res.body.data.user.roles).toHaveLength(1);
      expect(res.body.data.user.roles[0].role.name).toBe('student');
      expect(res.body.data.tokens).toHaveProperty('access');
      expect(res.body.data.tokens).toHaveProperty('refresh');
      expect(res.body.data.tokens.access.token).toBeDefined();
    });

    it('should register a new teacher user', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'teacher@test.com',
          password: 'TeacherPass123',
          firstName: 'Jane',
          lastName: 'Smith',
          roleName: 'teacher',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.data.user.roles[0].role.name).toBe('teacher');
    });

    it('should default to student role if not specified', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'default@test.com',
          password: 'Pass123',
          firstName: 'Default',
          lastName: 'User',
        })
        .expect(httpStatus.CREATED);

      expect(res.body.data.user.roles[0].role.name).toBe('student');
    });

    it('should fail with duplicate email', async () => {
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'Pass123',
          firstName: 'First',
          lastName: 'User',
          roleName: 'student',
        });

      await request(app)
        .post('/v1/auth/register')
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
        .post('/v1/auth/register')
        .send({
          email: 'weak@test.com',
          password: 'weak',
          firstName: 'Weak',
          lastName: 'Password',
          roleName: 'student',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail with password missing uppercase', async () => {
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'lowercase@test.com',
          password: 'lowercase123',
          firstName: 'Lower',
          lastName: 'Case',
          roleName: 'student',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail with password missing lowercase', async () => {
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'uppercase@test.com',
          password: 'UPPERCASE123',
          firstName: 'Upper',
          lastName: 'Case',
          roleName: 'student',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail with password missing number', async () => {
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'nonum@test.com',
          password: 'NoNumber',
          firstName: 'No',
          lastName: 'Number',
          roleName: 'student',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail without required fields', async () => {
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'incomplete@test.com',
          password: 'Pass123',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail with invalid email', async () => {
      await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Pass123',
          firstName: 'Invalid',
          lastName: 'Email',
          roleName: 'student',
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/login - Login', () => {
    beforeEach(async () => {
      // Create test user
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      await prisma.user.create({
        data: {
          email: 'login@test.com',
          passwordHash: await encryptPassword('LoginPass123'),
          firstName: 'Login',
          lastName: 'User',
          isActive: true,
          roles: {
            create: {
              roleId: studentRole!.id,
            },
          },
        },
      });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'LoginPass123',
        })
        .expect(httpStatus.OK);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('login@test.com');
      expect(res.body.data.user.roles).toBeDefined();
      expect(res.body.data.tokens.access.token).toBeDefined();
      expect(res.body.data.tokens.refresh.token).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'login@test.com',
          password: 'WrongPassword123',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should fail with non-existent email', async () => {
      await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'notexist@test.com',
          password: 'Pass123',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should fail with deactivated account', async () => {
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      await prisma.user.create({
        data: {
          email: 'deactivated@test.com',
          passwordHash: await encryptPassword('Pass123'),
          firstName: 'Deactivated',
          lastName: 'User',
          isActive: false,
          roles: {
            create: {
              roleId: studentRole!.id,
            },
          },
        },
      });

      await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'deactivated@test.com',
          password: 'Pass123',
        })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should fail without email', async () => {
      await request(app)
        .post('/v1/auth/login')
        .send({
          password: 'Pass123',
        })
        .expect(httpStatus.BAD_REQUEST);
    });

    it('should fail without password', async () => {
      await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'login@test.com',
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/logout - Logout', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register and get tokens
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'logout@test.com',
          password: 'LogoutPass123',
          firstName: 'Logout',
          lastName: 'User',
          roleName: 'student',
        });

      refreshToken = res.body.data.tokens.refresh.token;
    });

    it('should logout with valid refresh token', async () => {
      await request(app)
        .post('/v1/auth/logout')
        .send({
          refreshToken,
        })
        .expect(httpStatus.OK);
    });

    it('should fail with invalid refresh token', async () => {
      await request(app)
        .post('/v1/auth/logout')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(httpStatus.NOT_FOUND);
    });

    it('should fail without refresh token', async () => {
      await request(app)
        .post('/v1/auth/logout')
        .send({})
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/refresh-tokens - Refresh Tokens', () => {
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register and get tokens
      const res = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'refresh@test.com',
          password: 'RefreshPass123',
          firstName: 'Refresh',
          lastName: 'User',
          roleName: 'student',
        });

      refreshToken = res.body.data.tokens.refresh.token;
      userId = res.body.data.user.id;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const res = await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({
          refreshToken,
        })
        .expect(httpStatus.OK);

      expect(res.body.data.access.token).toBeDefined();
      expect(res.body.data.refresh.token).toBeDefined();
      expect(res.body.data.access.token).not.toBe(refreshToken);
    });

    it('should fail with invalid refresh token', async () => {
      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should fail with deactivated user', async () => {
      // Deactivate user
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({
          refreshToken,
        })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /auth/forgot-password - Forgot Password', () => {
    beforeEach(async () => {
      // Create test user
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      await prisma.user.create({
        data: {
          email: 'forgot@test.com',
          passwordHash: await encryptPassword('OldPass123'),
          firstName: 'Forgot',
          lastName: 'Password',
          roles: {
            create: {
              roleId: studentRole!.id,
            },
          },
        },
      });
    });

    it('should send reset password email', async () => {
      await request(app)
        .post('/v1/auth/forgot-password')
        .send({
          email: 'forgot@test.com',
        })
        .expect(httpStatus.OK);
    });

    it('should not fail with non-existent email (security)', async () => {
      // Should not reveal if email exists
      await request(app)
        .post('/v1/auth/forgot-password')
        .send({
          email: 'notexist@test.com',
        })
        .expect(httpStatus.OK);
    });

    it('should fail with invalid email format', async () => {
      await request(app)
        .post('/v1/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /auth/reset-password - Reset Password', () => {
    let resetToken: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let userId: string;

    beforeEach(async () => {
      // Create test user
      const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
      const user = await prisma.user.create({
        data: {
          email: 'reset@test.com',
          passwordHash: await encryptPassword('OldPass123'),
          firstName: 'Reset',
          lastName: 'Password',
          roles: {
            create: {
              roleId: studentRole!.id,
            },
          },
        },
      });
      userId = user.id;

      // Generate reset token (simplified for testing)
      const tokenService = await import('@/shared/services/token.service');
      resetToken = await tokenService.generateResetPasswordToken('reset@test.com');
    });

    it('should reset password with valid token', async () => {
      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetToken })
        .send({
          password: 'NewPass123',
        })
        .expect(httpStatus.OK);

      // Verify can login with new password
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'reset@test.com',
          password: 'NewPass123',
        })
        .expect(httpStatus.OK);

      expect(loginRes.body.data.user.email).toBe('reset@test.com');
    });

    it('should fail with invalid token', async () => {
      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: 'invalid-token' })
        .send({
          password: 'NewPass123',
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should fail with weak new password', async () => {
      await request(app)
        .post('/v1/auth/reset-password')
        .query({ token: resetToken })
        .send({
          password: 'weak',
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('Integration - Full Auth Flow', () => {
    it('should complete full registration, login, refresh, logout flow', async () => {
      // 1. Register
      const registerRes = await request(app)
        .post('/v1/auth/register')
        .send({
          email: 'fullflow@test.com',
          password: 'FullFlow123',
          firstName: 'Full',
          lastName: 'Flow',
          roleName: 'student',
        })
        .expect(httpStatus.CREATED);

      const { access, refresh } = registerRes.body.data.tokens;

      // 2. Use access token to access protected route
      const userRes = await request(app)
        .get(`/v1/users/${registerRes.body.data.user.id}`)
        .set('Authorization', `Bearer ${access.token}`)
        .expect(httpStatus.OK);

      expect(userRes.body.data.email).toBe('fullflow@test.com');

      // 3. Refresh tokens
      const refreshRes = await request(app)
        .post('/v1/auth/refresh-tokens')
        .send({
          refreshToken: refresh.token,
        })
        .expect(httpStatus.OK);

      expect(refreshRes.body.data.access.token).toBeDefined();

      // 4. Logout
      await request(app)
        .post('/v1/auth/logout')
        .send({
          refreshToken: refreshRes.body.data.refresh.token,
        })
        .expect(httpStatus.OK);

      // 5. Login again
      const loginRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'fullflow@test.com',
          password: 'FullFlow123',
        })
        .expect(httpStatus.OK);

      expect(loginRes.body.data.user.email).toBe('fullflow@test.com');
    });
  });
});
