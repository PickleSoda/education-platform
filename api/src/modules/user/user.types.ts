import { User, Role, TeacherProfile, StudentProfile } from '@prisma/client';

// ============================================================================
// USER TYPES
// ============================================================================

export interface UserCreateInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface UserUpdateInput {
  email?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}

export interface UserWithRoles extends User {
  roles: Array<{
    role: {
      id: number;
      name: string;
      description: string | null;
    };
    grantedAt: Date;
  }>;
  teacherProfile?: {
    department: string | null;
    title: string | null;
    bio: string | null;
    officeLocation: string | null;
  } | null;
  studentProfile?: {
    studentId: string | null;
    enrollmentYear: number | null;
    program: string | null;
  } | null;
}

// Alternative type with full Prisma models
export type UserWithFullRoles = User & {
  roles: Array<{
    role: Role;
    grantedAt: Date;
    grantedById: string | null;
  }>;
  teacherProfile?: TeacherProfile | null;
  studentProfile?: StudentProfile | null;
};
