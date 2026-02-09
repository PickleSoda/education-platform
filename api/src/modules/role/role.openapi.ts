import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse } from '@/openapi/common.schemas';

import { createRoleSchema, updateRoleSchema, getRoleSchema } from './role.validation';

// Extract schemas from validation
const createRoleInputSchema = createRoleSchema.shape.body;
const updateRoleInputSchema = updateRoleSchema.shape.body;
const roleIdParamSchema = getRoleSchema.shape.params;

// Role response schema
const roleSchema = z.object({
  id: z.number().describe('Role ID'),
  name: z.string().describe('Role name'),
  description: z.string().nullable().describe('Role description'),
  _count: z.object({
    users: z.number().describe('Number of users with this role'),
  }),
});

export const registerRolePaths = (registry: OpenAPIRegistry) => {
  // Get all roles
  registry.registerPath({
    method: 'get',
    path: '/v1/roles',
    description: 'Get all roles',
    summary: 'Get all roles',
    tags: ['Roles'],
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: 'Roles retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(roleSchema)),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Create role
  registry.registerPath({
    method: 'post',
    path: '/v1/roles',
    description: 'Create a new role',
    summary: 'Create a new role',
    tags: ['Roles'],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        description: 'Role creation data',
        content: {
          'application/json': {
            schema: createRoleInputSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Role created successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(roleSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get role by ID
  registry.registerPath({
    method: 'get',
    path: '/v1/roles/{id}',
    description: 'Get role by ID',
    summary: 'Get role by ID',
    tags: ['Roles'],
    security: [{ bearerAuth: [] }],
    request: {
      params: roleIdParamSchema,
    },
    responses: {
      200: {
        description: 'Role retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(roleSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update role
  registry.registerPath({
    method: 'patch',
    path: '/v1/roles/{id}',
    description: 'Update role',
    summary: 'Update role',
    tags: ['Roles'],
    security: [{ bearerAuth: [] }],
    request: {
      params: roleIdParamSchema,
      body: {
        description: 'Role update data',
        content: {
          'application/json': {
            schema: updateRoleInputSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Role updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(roleSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete role
  registry.registerPath({
    method: 'delete',
    path: '/v1/roles/{id}',
    description: 'Delete role',
    summary: 'Delete role',
    tags: ['Roles'],
    security: [{ bearerAuth: [] }],
    request: {
      params: roleIdParamSchema,
    },
    responses: {
      200: {
        description: 'Role deleted successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ message: z.string() })),
          },
        },
      },
      ...commonResponses,
    },
  });
};
