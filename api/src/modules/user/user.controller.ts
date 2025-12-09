import httpStatus from 'http-status';

import ApiError from '@/shared/utils/api-error';
import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';
import type { ApiResponse, PaginatedResponse, ExtendedUser } from '@/types/response';

import * as userService from './user.service';
import type { UserWithRoles } from './user.types';
import {
  createUserSchema,
  getUserSchema,
  listUsersSchema,
  updateUserSchema,
  deleteUserSchema,
  addRoleSchema,
  removeRoleSchema,
  updateTeacherProfileSchema,
  updateStudentProfileSchema,
} from './user.validation';

// ============================================================================
// USER CRUD
// ============================================================================

export const createUser = catchAsync(async (req): Promise<ApiResponse<UserWithRoles>> => {
  const { body } = await zParse(createUserSchema, req);

  // Get the current user ID from request (set by auth middleware)
  const grantedBy = (req.user as ExtendedUser)?.id;

  const user = await userService.createUser(body, grantedBy);

  return {
    statusCode: httpStatus.CREATED,
    message: 'User created successfully',
    data: user,
  };
});

export const getUser = catchAsync(async (req): Promise<ApiResponse<UserWithRoles>> => {
  const { params } = await zParse(getUserSchema, req);

  const user = await userService.getUserById(params.id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return {
    statusCode: httpStatus.OK,
    message: 'User retrieved successfully',
    data: user,
  };
});

export const listUsers = catchAsync(async (req): Promise<PaginatedResponse<UserWithRoles>> => {
  const { query } = await zParse(listUsersSchema, req);

  const result = await userService.listUsers(query);

  return {
    statusCode: httpStatus.OK,
    message: 'Users retrieved successfully',
    data: result.users,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  };
});

export const updateUser = catchAsync(async (req): Promise<ApiResponse<UserWithRoles>> => {
  const { params, body } = await zParse(updateUserSchema, req);

  // Get the current user ID from request (set by auth middleware)
  const updatedBy = (req.user as ExtendedUser)?.id;

  const user = await userService.updateUser(params.id, body, updatedBy);

  return {
    statusCode: httpStatus.OK,
    message: 'User updated successfully',
    data: user,
  };
});

export const deleteUser = catchAsync(async (req): Promise<ApiResponse<void>> => {
  const { params } = await zParse(deleteUserSchema, req);

  await userService.deleteUser(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
  };
});

export const softDeleteUser = catchAsync(async (req): Promise<ApiResponse<UserWithRoles>> => {
  const { params } = await zParse(deleteUserSchema, req);

  const user = await userService.softDeleteUser(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'User deactivated successfully',
    data: user,
  };
});

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

export const addRole = catchAsync(async (req): Promise<ApiResponse<UserWithRoles>> => {
  const { params, body } = await zParse(addRoleSchema, req);

  // Get the current user ID from request (set by auth middleware)
  const grantedBy = (req.user as ExtendedUser)?.id;

  const user = await userService.addRoleToUser(params.id, body.roleName, grantedBy);

  return {
    statusCode: httpStatus.OK,
    message: `Role '${body.roleName}' added successfully`,
    data: user,
  };
});

export const removeRole = catchAsync(async (req): Promise<ApiResponse<UserWithRoles>> => {
  const { params } = await zParse(removeRoleSchema, req);

  const user = await userService.removeRoleFromUser(params.id, params.roleName);

  return {
    statusCode: httpStatus.OK,
    message: `Role '${params.roleName}' removed successfully`,
    data: user,
  };
});

export const getUserRoles = catchAsync(async (req): Promise<ApiResponse<string[]>> => {
  const { params } = await zParse(getUserSchema, req);

  const roles = await userService.getUserRoles(params.id);

  return {
    statusCode: httpStatus.OK,
    message: 'User roles retrieved successfully',
    data: roles,
  };
});

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

export const updateTeacherProfile = catchAsync(
  async (req): Promise<ApiResponse<{ profile: any }>> => {
    const { params, body } = await zParse(updateTeacherProfileSchema, req);

    const profile = await userService.updateTeacherProfile(params.id, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Teacher profile updated successfully',
      data: { profile },
    };
  }
);

export const updateStudentProfile = catchAsync(
  async (req): Promise<ApiResponse<{ profile: any }>> => {
    const { params, body } = await zParse(updateStudentProfileSchema, req);

    const profile = await userService.updateStudentProfile(params.id, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Student profile updated successfully',
      data: { profile },
    };
  }
);

export const getTeacherProfile = catchAsync(async (req): Promise<ApiResponse<{ profile: any }>> => {
  const { params } = await zParse(getUserSchema, req);

  const profile = await userService.getTeacherProfile(params.id);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Teacher profile not found');
  }

  return {
    statusCode: httpStatus.OK,
    message: 'Teacher profile retrieved successfully',
    data: { profile },
  };
});

export const getStudentProfile = catchAsync(async (req): Promise<ApiResponse<{ profile: any }>> => {
  const { params } = await zParse(getUserSchema, req);

  const profile = await userService.getStudentProfile(params.id);
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student profile not found');
  }

  return {
    statusCode: httpStatus.OK,
    message: 'Student profile retrieved successfully',
    data: { profile },
  };
});
