import { Permission } from '@/types/rbac';

// Role name type based on database
export type RoleName = 'student' | 'teacher' | 'admin';

// Define permissions for each role in the educational platform
const allRoles: Record<RoleName, Permission[]> = {
  student: [
    'viewProfile',
    'updateProfile',
    'viewCourses',
    'enrollCourse',
    'viewEnrollments',
    'viewAssignments',
    'submitAssignment',
    'viewOwnSubmissions',
    'viewGrades',
    'viewForum',
    'createForumPost',
    'updateOwnForumPost',
    'deleteOwnForumPost',
    'createForumComment',
    'viewAnnouncements',
    'viewNotifications',
  ],
  teacher: [
    'viewProfile',
    'updateProfile',
    'viewCourses',
    'createCourse',
    'updateOwnCourse',
    'deleteOwnCourse',
    'manageCourseContent',
    'createAssignment',
    'updateAssignment',
    'deleteAssignment',
    'viewSubmissions',
    'gradeSubmissions',
    'viewEnrollments',
    'manageForum',
    'createAnnouncement',
    'updateAnnouncement',
    'deleteAnnouncement',
    'viewNotifications',
    'viewCourseAnalytics',
  ],
  admin: [
    'viewProfile',
    'updateProfile',
    'viewCourses',
    'createCourse',
    'updateOwnCourse',
    'deleteOwnCourse',
    'manageCourseContent',
    'createAssignment',
    'updateAssignment',
    'deleteAssignment',
    'viewSubmissions',
    'gradeSubmissions',
    'viewEnrollments',
    'manageForum',
    'createAnnouncement',
    'updateAnnouncement',
    'deleteAnnouncement',
    'viewNotifications',
    'viewCourseAnalytics',
    // Admin-only permissions
    'manageUsers',
    'manageRoles',
    'viewAllCourses',
    'updateAnyCourse',
    'deleteAnyCourse',
    'viewSystemAnalytics',
    'viewAuditLogs',
    'manageSystemSettings',
  ],
};

export const roles = Object.keys(allRoles) as RoleName[];
export const roleRights = new Map<RoleName, Permission[]>(
  Object.entries(allRoles) as [RoleName, Permission[]][]
);

// Function to get the combined rights for a user with multiple roles
export const getUserRights = (userRoles: string[]): Permission[] => {
  // If user is admin, return all possible permissions
  if (userRoles.includes('admin')) {
    return Object.values(allRoles).flat();
  }

  const rights = new Set<Permission>();
  userRoles.forEach((roleName) => {
    const roleRight = roleRights.get(roleName as RoleName) ?? [];
    roleRight.forEach((right) => rights.add(right));
  });
  return Array.from(rights);
};

// Function to check if a user has a specific right
export const hasRight = (userRoles: string[], requiredRight: Permission): boolean => {
  // Admin has all rights
  if (userRoles.includes('admin')) {
    return true;
  }

  const userRights = getUserRights(userRoles);
  return userRights.includes(requiredRight);
};

// Function to check if a user has all required rights
export const hasAllRights = (userRoles: string[], requiredRights: Permission[]): boolean => {
  // Admin has all rights
  if (userRoles.includes('admin')) {
    return true;
  }

  const userRights = getUserRights(userRoles);
  return requiredRights.every((right) => userRights.includes(right));
};

// Function to check if a user has a specific role
export const hasRole = (userRoles: string[], requiredRole: RoleName): boolean => {
  return userRoles.includes(requiredRole);
};

// Function to check if a user has any of the specified roles
export const hasAnyRole = (userRoles: string[], requiredRoles: RoleName[]): boolean => {
  return requiredRoles.some((role) => userRoles.includes(role));
};

// Helper to get role names from user object
export const extractRoleNames = (roles: Array<{ role: { name: string } }>): string[] => {
  return roles.map((r) => r.role.name);
};
