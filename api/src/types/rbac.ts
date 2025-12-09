// Permission types for the educational platform

// User profile and account management
export type ProfilePermission =
  | 'viewProfile'
  | 'updateProfile'
  | 'manageUsers'
  | 'manageRoles'
  | 'viewAllUsers';

// Course management permissions
export type CoursePermission =
  | 'viewCourses'
  | 'createCourse'
  | 'updateOwnCourse'
  | 'deleteOwnCourse'
  | 'updateAnyCourse'
  | 'deleteAnyCourse'
  | 'viewAllCourses'
  | 'manageCourseContent'
  | 'viewCourseAnalytics';

// Enrollment management
export type EnrollmentPermission = 'enrollCourse' | 'viewEnrollments';

// Assignment permissions
export type AssignmentPermission =
  | 'viewAssignments'
  | 'createAssignment'
  | 'updateAssignment'
  | 'deleteAssignment'
  | 'submitAssignment'
  | 'viewSubmissions'
  | 'viewOwnSubmissions'
  | 'gradeSubmissions';

// Forum and discussion permissions
export type ForumPermission =
  | 'viewForum'
  | 'createForumPost'
  | 'updateOwnForumPost'
  | 'deleteOwnForumPost'
  | 'createForumComment'
  | 'manageForum';

// Announcement permissions
export type AnnouncementPermission =
  | 'viewAnnouncements'
  | 'createAnnouncement'
  | 'updateAnnouncement'
  | 'deleteAnnouncement';

// Grading permissions
export type GradingPermission = 'viewGrades';

// Notification permissions
export type NotificationPermission = 'viewNotifications';

// System administration permissions
export type SystemPermission = 'viewSystemAnalytics' | 'viewAuditLogs' | 'manageSystemSettings';

// All permissions combined
export type Permission =
  | ProfilePermission
  | CoursePermission
  | EnrollmentPermission
  | AssignmentPermission
  | ForumPermission
  | AnnouncementPermission
  | GradingPermission
  | NotificationPermission
  | SystemPermission;
