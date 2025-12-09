import { TeacherProfile, StudentProfile } from '@prisma/client';
import httpStatus from 'http-status';

import ApiError from '@/shared/utils/api-error';
import { encryptPassword } from '@/shared/utils/encryption';
import { userRepository } from './user.repository';
import type { UserWithRoles } from './user.types';
import type {
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
  UpdateTeacherProfileInput,
  UpdateStudentProfileInput,
} from './user.validation';

// ============================================================================
// USER CRUD
// ============================================================================

export const createUser = async (
  data: CreateUserInput,
  _grantedBy?: string
): Promise<UserWithRoles> => {
  // Check if email already exists
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Encrypt password
  const passwordHash = await encryptPassword(data.password);

  // Create user with role
  const user = await userRepository.createWithRole(
    {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
    },
    data.roleName
  );

  return user;
};

export const getUserById = async (id: string): Promise<UserWithRoles | null> => {
  return userRepository.findWithRelations(id);
};

export const getUserByEmail = async (email: string): Promise<UserWithRoles | null> => {
  return userRepository.findByEmailWithRoles(email);
};

export const listUsers = async (
  query: ListUsersQuery
): Promise<{
  users: UserWithRoles[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  const { page, limit, search, roles, isActive, sortBy, sortOrder } = query;

  const result = await userRepository.findUsers(
    {
      search,
      roleNames: roles,
      isActive,
    },
    {
      page,
      limit,
      sortBy,
      sortOrder,
    }
  );

  return {
    users: result.results,
    total: result.totalResults,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
};

export const updateUser = async (
  id: string,
  updateData: UpdateUserInput,
  _updatedBy?: string
): Promise<UserWithRoles> => {
  // Check if user exists
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if email is being updated and if it's already taken
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await userRepository.findByEmail(updateData.email);
    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }

  // Encrypt password if provided
  let passwordHash: string | undefined;
  if (updateData.password) {
    passwordHash = await encryptPassword(updateData.password);
  }

  // Update user
  await userRepository.update(id, {
    ...(updateData.email && { email: updateData.email }),
    ...(passwordHash && { passwordHash }),
    ...(updateData.firstName && { firstName: updateData.firstName }),
    ...(updateData.lastName && { lastName: updateData.lastName }),
    ...(updateData.avatarUrl !== undefined && { avatarUrl: updateData.avatarUrl }),
    ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
  });

  // Fetch updated user with relations
  const updatedUser = await userRepository.findWithRelations(id);
  if (!updatedUser) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update user');
  }

  return updatedUser;
};

export const deleteUser = async (id: string): Promise<void> => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await userRepository.delete(id);
};

export const softDeleteUser = async (id: string): Promise<UserWithRoles> => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await userRepository.softDelete(id);

  // Fetch updated user with relations
  const updatedUser = await userRepository.findWithRelations(id);
  if (!updatedUser) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete user');
  }

  return updatedUser;
};

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

export const addRoleToUser = async (
  userId: string,
  roleName: string,
  grantedBy?: string
): Promise<UserWithRoles> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const hasRole = await userRepository.userHasRole(userId, roleName);
  if (hasRole) {
    throw new ApiError(httpStatus.BAD_REQUEST, `User already has role: ${roleName}`);
  }

  await userRepository.addRoleToUser(userId, roleName, grantedBy);

  // Fetch and return the updated user with roles
  const updatedUser = await userRepository.findWithRelations(userId);
  if (!updatedUser) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch updated user');
  }

  return updatedUser;
};

export const removeRoleFromUser = async (
  userId: string,
  roleName: string
): Promise<UserWithRoles> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const hasRole = await userRepository.userHasRole(userId, roleName);
  if (!hasRole) {
    throw new ApiError(httpStatus.BAD_REQUEST, `User does not have role: ${roleName}`);
  }

  await userRepository.removeRoleFromUser(userId, roleName);

  // Fetch and return the updated user with roles
  const updatedUser = await userRepository.findWithRelations(userId);
  if (!updatedUser) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch updated user');
  }

  return updatedUser;
};

export const getUserRoles = async (userId: string): Promise<string[]> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const userRoles = await userRepository.getUserRoles(userId);
  return userRoles.map((ur) => ur.role.name);
};

export const userHasRole = async (userId: string, roleName: string): Promise<boolean> => {
  return userRepository.userHasRole(userId, roleName);
};

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

export const updateTeacherProfile = async (
  userId: string,
  profileData: UpdateTeacherProfileInput
): Promise<TeacherProfile> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isTeacher = await userRepository.userHasRole(userId, 'teacher');
  if (!isTeacher) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is not a teacher');
  }

  return userRepository.upsertTeacherProfile(userId, profileData);
};

export const updateStudentProfile = async (
  userId: string,
  profileData: UpdateStudentProfileInput
): Promise<StudentProfile> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isStudent = await userRepository.userHasRole(userId, 'student');
  if (!isStudent) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is not a student');
  }

  return userRepository.upsertStudentProfile(userId, profileData);
};

export const getTeacherProfile = async (userId: string): Promise<TeacherProfile | null> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return userRepository.getTeacherProfile(userId);
};

export const getStudentProfile = async (userId: string): Promise<StudentProfile | null> => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return userRepository.getStudentProfile(userId);
};
