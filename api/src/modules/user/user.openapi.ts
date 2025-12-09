import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse, withPaginatedResponse } from '@/openapi/common.schemas';

import {
  createUserSchema,
  listUsersSchema,
  getUserSchema,
  updateUserSchema,
  deleteUserSchema,
  addRoleSchema,
  removeRoleSchema,
  updateTeacherProfileSchema,
  updateStudentProfileSchema,
} from './user.validation';

// Extract schemas from validation
const createUserInputSchema = createUserSchema.shape.body;
const listUsersQuerySchema = listUsersSchema.shape.query;
const getUserParamsSchema = getUserSchema.shape.params;
const updateUserInputSchema = updateUserSchema.shape.body;
const updateUserParamsSchema = updateUserSchema.shape.params;
const deleteUserParamsSchema = deleteUserSchema.shape.params;
const addRoleInputSchema = addRoleSchema.shape.body;
const addRoleParamsSchema = addRoleSchema.shape.params;
const removeRoleParamsSchema = removeRoleSchema.shape.params;
const updateTeacherProfileInputSchema = updateTeacherProfileSchema.shape.body;
const updateTeacherProfileParamsSchema = updateTeacherProfileSchema.shape.params;
const updateStudentProfileInputSchema = updateStudentProfileSchema.shape.body;
const updateStudentProfileParamsSchema = updateStudentProfileSchema.shape.params;

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

export const registerUserPaths = (registry: OpenAPIRegistry) => {
  // Create user
  registry.registerPath({
    method: 'post',
    path: '/users',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          'application/json': {
            schema: createUserInputSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'User created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // List users
  registry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      query: listUsersQuerySchema,
    },
    responses: {
      200: {
        description: 'Users retrieved successfully',
        content: {
          'application/json': {
            schema: withPaginatedResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get user by ID
  registry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: getUserParamsSchema,
    },
    responses: {
      200: {
        description: 'User retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update user
  registry.registerPath({
    method: 'patch',
    path: '/users/{id}',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: updateUserParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: updateUserInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'User updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete user
  registry.registerPath({
    method: 'delete',
    path: '/users/{id}',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: deleteUserParamsSchema,
    },
    responses: {
      200: {
        description: 'User deleted successfully',
      },
      ...commonResponses,
    },
  });

  // Soft delete user (deactivate)
  registry.registerPath({
    method: 'post',
    path: '/users/{id}/deactivate',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: getUserParamsSchema,
    },
    responses: {
      200: {
        description: 'User deactivated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get user roles
  registry.registerPath({
    method: 'get',
    path: '/users/{id}/roles',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: getUserParamsSchema,
    },
    responses: {
      200: {
        description: 'User roles retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(z.string())),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Add role to user
  registry.registerPath({
    method: 'post',
    path: '/users/{id}/roles',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: addRoleParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: addRoleInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Role added successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Remove role from user
  registry.registerPath({
    method: 'delete',
    path: '/users/{id}/roles/{roleName}',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: removeRoleParamsSchema,
    },
    responses: {
      200: {
        description: 'Role removed successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(userSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get teacher profile
  registry.registerPath({
    method: 'get',
    path: '/users/{id}/teacher-profile',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: getUserParamsSchema,
    },
    responses: {
      200: {
        description: 'Teacher profile retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ profile: teacherProfileSchema })),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update teacher profile
  registry.registerPath({
    method: 'put',
    path: '/users/{id}/teacher-profile',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: updateTeacherProfileParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: updateTeacherProfileInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Teacher profile updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ profile: teacherProfileSchema })),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get student profile
  registry.registerPath({
    method: 'get',
    path: '/users/{id}/student-profile',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: getUserParamsSchema,
    },
    responses: {
      200: {
        description: 'Student profile retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ profile: studentProfileSchema })),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update student profile
  registry.registerPath({
    method: 'put',
    path: '/users/{id}/student-profile',
    tags: ['Users'],
    security: [{ bearerAuth: [] }],
    request: {
      params: updateStudentProfileParamsSchema,
      body: {
        content: {
          'application/json': {
            schema: updateStudentProfileInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Student profile updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ profile: studentProfileSchema })),
          },
        },
      },
      ...commonResponses,
    },
  });
};
