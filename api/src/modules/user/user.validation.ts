import { z } from 'zod';

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    avatarUrl: z.string().url('Invalid avatar URL').optional(),
    roleName: z.enum(['student', 'teacher', 'admin']).default('student'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().max(255).optional(),
    roles: z
      .string()
      .transform((val) => val.split(','))
      .optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

// ============================================================================
// ROLE MANAGEMENT SCHEMAS
// ============================================================================

export const addRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    roleName: z.enum(['student', 'teacher', 'admin']),
  }),
});

export const removeRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
    roleName: z.enum(['student', 'teacher', 'admin']),
  }),
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateTeacherProfileSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    department: z.string().max(255).optional(),
    title: z.string().max(255).optional(),
    bio: z.string().max(5000).optional(),
    officeLocation: z.string().max(255).optional(),
  }),
});

export const updateStudentProfileSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z.object({
    studentId: z.string().max(50).optional(),
    enrollmentYear: z.number().int().min(1900).max(2100).optional(),
    program: z.string().max(255).optional(),
  }),
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ListUsersQuery = z.infer<typeof listUsersSchema>['query'];
export type AddRoleInput = z.infer<typeof addRoleSchema>['body'];
export type UpdateTeacherProfileInput = z.infer<typeof updateTeacherProfileSchema>['body'];
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>['body'];
