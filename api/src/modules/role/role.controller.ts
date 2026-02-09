import httpStatus from 'http-status';

import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';
import type { ApiResponse } from '@/types/response';

import { roleService } from './role.service';
import type { RoleWithUserCount } from './role.types';
import {
  createRoleSchema,
  updateRoleSchema,
  getRoleSchema,
  deleteRoleSchema,
} from './role.validation';

export const getAllRoles = catchAsync(async (): Promise<ApiResponse<RoleWithUserCount[]>> => {
  const roles = await roleService.getAllRoles();

  return {
    statusCode: httpStatus.OK,
    message: 'Roles retrieved successfully',
    data: roles,
  };
});

export const getRoleById = catchAsync(async (req): Promise<ApiResponse<RoleWithUserCount>> => {
  const { params } = await zParse(getRoleSchema, req);

  const role = await roleService.getRoleById(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'Role retrieved successfully',
    data: role,
  };
});

export const createRole = catchAsync(async (req): Promise<ApiResponse<RoleWithUserCount>> => {
  const { body } = await zParse(createRoleSchema, req);

  const role = await roleService.createRole(body);

  return {
    statusCode: httpStatus.CREATED,
    message: 'Role created successfully',
    data: role,
  };
});

export const updateRole = catchAsync(async (req): Promise<ApiResponse<RoleWithUserCount>> => {
  const { params, body } = await zParse(updateRoleSchema, req);

  const role = await roleService.updateRole(params.id, body);

  return {
    statusCode: httpStatus.OK,
    message: 'Role updated successfully',
    data: role,
  };
});

export const deleteRole = catchAsync(async (req): Promise<ApiResponse<{ message: string }>> => {
  const { params } = await zParse(deleteRoleSchema, req);

  const result = await roleService.deleteRole(params.id);

  return {
    statusCode: httpStatus.OK,
    message: result.message,
    data: result,
  };
});
