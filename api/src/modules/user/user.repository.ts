import { Prisma, User } from '@prisma/client';
import prisma from '@/client';
import { PaginationOptions, PaginatedResult } from '@/shared/repositories/base.repository';
import type { UserCreateInput, UserUpdateInput, UserWithRoles } from './user.types';

// ============================================================================
// USER CRUD
// ============================================================================

/**
 * Create a new user (without roles)
 */
export const createUser = async (data: UserCreateInput): Promise<User> => {
  return prisma.user.create({
    data,
  });
};

/**
 * Create user with role
 */
export const createUserWithRole = async (
  data: UserCreateInput,
  roleName: string
): Promise<UserWithRoles> => {
  return prisma.user.create({
    data: {
      ...data,
      roles: {
        create: {
          role: {
            connect: { name: roleName },
          },
        },
      },
      // Create profile based on role
      ...(roleName === 'student' && {
        studentProfile: { create: {} },
      }),
      ...(roleName === 'teacher' && {
        teacherProfile: { create: {} },
      }),
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      studentProfile: true,
      teacherProfile: true,
    },
  });
};

/**
 * Find user by ID
 */
export const findUserById = async (userId: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

/**
 * Find user by ID with all relations
 */
export const findUserWithRelations = async (userId: string): Promise<UserWithRoles | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      teacherProfile: true,
      studentProfile: true,
    },
  });
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Find user by email with roles
 */
export const findUserByEmailWithRoles = async (email: string): Promise<UserWithRoles | null> => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      teacherProfile: true,
      studentProfile: true,
    },
  });
};

/**
 * List users with pagination and filters
 */
export const findUsers = async (
  filters: {
    search?: string;
    roleNames?: string[];
    isActive?: boolean;
  } = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<UserWithRoles>> => {
  const { search, roleNames, isActive } = filters;
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(roleNames?.length && {
      roles: {
        some: {
          role: {
            name: { in: roleNames },
          },
        },
      },
    }),
    ...(isActive !== undefined && { isActive }),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        teacherProfile: true,
        studentProfile: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    results: items,
    totalResults: total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Update user
 */
export const updateUser = async (userId: string, data: UserUpdateInput): Promise<UserWithRoles> => {
  return prisma.user.update({
    where: { id: userId },
    data,
    include: {
      roles: {
        include: {
          role: true,
        },
      },
      teacherProfile: true,
      studentProfile: true,
    },
  });
};

/**
 * Delete user (soft delete by setting isActive = false)
 */
export const softDeleteUser = async (userId: string): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
};

/**
 * Delete user (hard delete)
 */
export const deleteUser = async (userId: string): Promise<User> => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

/**
 * Count users
 */
export const countUsers = async (where?: Prisma.UserWhereInput): Promise<number> => {
  return prisma.user.count({ where });
};

// ============================================================================
// ROLE MANAGEMENT
// ============================================================================

/**
 * Check if user has specific role
 */
export const userHasRole = async (userId: string, roleName: string): Promise<boolean> => {
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId,
      role: { name: roleName },
    },
  });
  return !!userRole;
};

/**
 * Get user roles
 */
export const getUserRoles = async (userId: string) => {
  return prisma.userRole.findMany({
    where: { userId },
    include: {
      role: true,
      granter: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { grantedAt: 'desc' },
  });
};

/**
 * Add role to user
 */
export const addRoleToUser = async (userId: string, roleName: string, grantedBy?: string) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} not found`);

  return prisma.userRole.create({
    data: {
      userId,
      roleId: role.id,
      grantedBy,
    },
    include: {
      role: true,
    },
  });
};

/**
 * Remove role from user
 */
export const removeRoleFromUser = async (userId: string, roleName: string) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new Error(`Role ${roleName} not found`);

  return prisma.userRole.delete({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
  });
};

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

/**
 * Create or update teacher profile
 */
export const upsertTeacherProfile = async (
  userId: string,
  data: {
    department?: string;
    title?: string;
    bio?: string;
    officeLocation?: string;
  }
) => {
  return prisma.teacherProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
    },
    update: data,
  });
};

/**
 * Create or update student profile
 */
export const upsertStudentProfile = async (
  userId: string,
  data: {
    studentId?: string;
    enrollmentYear?: number;
    program?: string;
  }
) => {
  return prisma.studentProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...data,
    },
    update: data,
  });
};

/**
 * Get teacher profile
 */
export const getTeacherProfile = async (userId: string) => {
  return prisma.teacherProfile.findUnique({
    where: { userId },
  });
};

/**
 * Get student profile
 */
export const getStudentProfile = async (userId: string) => {
  return prisma.studentProfile.findUnique({
    where: { userId },
  });
};

// ============================================================================
// REPOSITORY EXPORT
// ============================================================================

export const userRepository = {
  // User CRUD
  create: createUser,
  createWithRole: createUserWithRole,
  findById: findUserById,
  findWithRelations: findUserWithRelations,
  findByEmail: findUserByEmail,
  findByEmailWithRoles: findUserByEmailWithRoles,
  findUsers: findUsers,
  update: updateUser,
  softDelete: softDeleteUser,
  delete: deleteUser,
  count: countUsers,

  // Role management
  userHasRole: userHasRole,
  getUserRoles: getUserRoles,
  addRoleToUser: addRoleToUser,
  removeRoleFromUser: removeRoleFromUser,

  // Profile management
  upsertTeacherProfile,
  upsertStudentProfile,
  getTeacherProfile,
  getStudentProfile,
};
