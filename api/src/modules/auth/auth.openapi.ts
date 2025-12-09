import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { successResponseSchema, withSuccessResponse } from '@/openapi/common.schemas';

import {
  registerSchema,
  loginSchema,
  logoutSchema,
  refreshTokensSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation';

// Extract schemas from validation
const registerInputSchema = registerSchema.shape.body;
const loginInputSchema = loginSchema.shape.body;
const logoutInputSchema = logoutSchema.shape.body;
const refreshTokensInputSchema = refreshTokensSchema.shape.body;
const forgotPasswordInputSchema = forgotPasswordSchema.shape.body;
const resetPasswordInputSchema = resetPasswordSchema.shape.body;

// Response schemas
const roleSchema = z.object({
  role: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
  }),
  grantedAt: z.string(),
  grantedById: z.string().nullable(),
});

const teacherProfileSchema = z.object({
  userId: z.string(),
  department: z.string().nullable(),
  title: z.string().nullable(),
  bio: z.string().nullable(),
  officeLocation: z.string().nullable(),
});

const studentProfileSchema = z.object({
  userId: z.string(),
  studentId: z.string().nullable(),
  enrollmentYear: z.number().nullable(),
  program: z.string().nullable(),
});

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  avatarUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  roles: z.array(roleSchema),
  teacherProfile: teacherProfileSchema.nullable().optional(),
  studentProfile: studentProfileSchema.nullable().optional(),
});

const tokensSchema = z.object({
  access: z.object({
    token: z.string(),
    expires: z.string(),
  }),
  refresh: z.object({
    token: z.string(),
    expires: z.string(),
  }),
});

const authResponseSchema = z.object({
  user: userSchema,
  tokens: tokensSchema,
});

export const registerAuthPaths = (registry: OpenAPIRegistry) => {
  // Register
  registry.registerPath({
    method: 'post',
    path: '/auth/register',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: registerInputSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User registered successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(authResponseSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Login
  registry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: loginInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User logged in successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(authResponseSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Logout
  registry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: logoutInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User logged out successfully',
        content: {
          'application/json': {
            schema: successResponseSchema,
          },
        },
      },
      ...commonResponses,
    },
  });

  // Refresh tokens
  registry.registerPath({
    method: 'post',
    path: '/auth/refresh-tokens',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: refreshTokensInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Tokens refreshed successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(tokensSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Forgot password
  registry.registerPath({
    method: 'post',
    path: '/auth/forgot-password',
    tags: ['Auth'],
    request: {
      body: {
        content: {
          'application/json': {
            schema: forgotPasswordInputSchema,
            example: {
              email: 'user@example.com',
            },
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Reset password email sent successfully',
        content: {
          'application/json': {
            schema: successResponseSchema,
          },
        },
      },
      ...commonResponses,
    },
  });

  // Reset password
  registry.registerPath({
    method: 'post',
    path: '/auth/reset-password',
    tags: ['Auth'],
    request: {
      query: z.object({
        token: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: resetPasswordInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Password reset successfully',
        content: {
          'application/json': {
            schema: successResponseSchema,
          },
        },
      },
      ...commonResponses,
    },
  });
};
