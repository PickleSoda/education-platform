import { Permission } from "@/types/rbac";

// All available permissions in the system
export const ALL_PERMISSIONS: Permission[] = [
	// User profile and account management
	"viewProfile",
	"updateProfile",
	"manageUsers",
	"manageRoles",
	"viewAllUsers",
	// Course management
	"viewCourses",
	"createCourse",
	"updateOwnCourse",
	"deleteOwnCourse",
	"updateAnyCourse",
	"deleteAnyCourse",
	"viewAllCourses",
	"manageCourseContent",
	"viewCourseAnalytics",
	// Enrollment management
	"enrollCourse",
	"viewEnrollments",
	// Assignment permissions
	"viewAssignments",
	"createAssignment",
	"updateAssignment",
	"deleteAssignment",
	"submitAssignment",
	"viewSubmissions",
	"viewOwnSubmissions",
	"gradeSubmissions",
	// Forum and discussion
	"viewForum",
	"createForumPost",
	"updateOwnForumPost",
	"deleteOwnForumPost",
	"createForumComment",
	"manageForum",
	// Announcement
	"viewAnnouncements",
	"createAnnouncement",
	"updateAnnouncement",
	"deleteAnnouncement",
	// Grading
	"viewGrades",
	// Notifications
	"viewNotifications",
	// System administration
	"viewSystemAnalytics",
	"viewAuditLogs",
	"manageSystemSettings",
];

// Grouped permissions for better UI organization
export interface PermissionGroup {
	label: string;
	permissions: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
	{
		label: "Profile & Users",
		permissions: ["viewProfile", "updateProfile", "manageUsers", "manageRoles", "viewAllUsers"],
	},
	{
		label: "Courses",
		permissions: [
			"viewCourses",
			"createCourse",
			"updateOwnCourse",
			"deleteOwnCourse",
			"updateAnyCourse",
			"deleteAnyCourse",
			"viewAllCourses",
			"manageCourseContent",
			"viewCourseAnalytics",
		],
	},
	{
		label: "Enrollments",
		permissions: ["enrollCourse", "viewEnrollments"],
	},
	{
		label: "Assignments",
		permissions: [
			"viewAssignments",
			"createAssignment",
			"updateAssignment",
			"deleteAssignment",
			"submitAssignment",
			"viewSubmissions",
			"viewOwnSubmissions",
			"gradeSubmissions",
		],
	},
	{
		label: "Forum",
		permissions: [
			"viewForum",
			"createForumPost",
			"updateOwnForumPost",
			"deleteOwnForumPost",
			"createForumComment",
			"manageForum",
		],
	},
	{
		label: "Announcements",
		permissions: ["viewAnnouncements", "createAnnouncement", "updateAnnouncement", "deleteAnnouncement"],
	},
	{
		label: "Grades",
		permissions: ["viewGrades"],
	},
	{
		label: "Notifications",
		permissions: ["viewNotifications"],
	},
	{
		label: "System Admin",
		permissions: ["viewSystemAnalytics", "viewAuditLogs", "manageSystemSettings"],
	},
];

// Get permissions by role
export const getRolePermissions = (roleName: string): Permission[] => {
	const rolePermissions: Record<string, Permission[]> = {
		student: [
			"viewProfile",
			"updateProfile",
			"viewCourses",
			"enrollCourse",
			"viewEnrollments",
			"viewAssignments",
			"submitAssignment",
			"viewOwnSubmissions",
			"viewGrades",
			"viewForum",
			"createForumPost",
			"updateOwnForumPost",
			"deleteOwnForumPost",
			"createForumComment",
			"viewAnnouncements",
			"viewNotifications",
		],
		teacher: [
			"viewProfile",
			"updateProfile",
			"viewCourses",
			"createCourse",
			"updateOwnCourse",
			"deleteOwnCourse",
			"manageCourseContent",
			"createAssignment",
			"updateAssignment",
			"deleteAssignment",
			"viewSubmissions",
			"gradeSubmissions",
			"viewEnrollments",
			"manageForum",
			"createAnnouncement",
			"updateAnnouncement",
			"deleteAnnouncement",
			"viewNotifications",
			"viewCourseAnalytics",
		],
		admin: ALL_PERMISSIONS,
	};

	return rolePermissions[roleName] || [];
};
