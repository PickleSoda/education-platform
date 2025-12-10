import type { NavItemDataProps } from "@/components/nav/types";
import type { BasicStatus, PermissionType } from "./enum";

export interface UserToken {
	accessToken?: string;
	refreshToken?: string;
}

export interface Tag {
	id: number;
	name: string;
	color: string | null;
}

export interface CourseTag {
	tag: Tag;
}

export interface CourseLecturer {
	userId: string;
	isPrimary: boolean;
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
	};
}

export interface Course {
	id: string;
	code: string;
	title: string;
	description: string | null;
	credits: number | null;
	typicalDurationWeeks: number | null;
	isArchived: boolean;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	tags?: CourseTag[];
	lecturers?: CourseLecturer[];
	_count?: {
		instances: number;
	};
}

export interface CourseStats {
	courseId: string;
	code: string;
	title: string;
	totalInstances: number;
	totalSyllabusItems: number;
	totalAssignments: number;
	totalResources: number;
	tags: string[];
	lecturers: number;
	primaryLecturer: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
	} | null;
}

export interface CourseInstance {
	id: string;
	courseId: string;
	semester: string;
	startDate: string;
	endDate: string;
	status: "draft" | "scheduled" | "active" | "completed" | "archived";
	enrollmentOpen: boolean;
	enrollmentLimit: number | null;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
	course?: Pick<Course, "id" | "code" | "title" | "description" | "credits">;
	lecturers?: Array<{
		userId: string;
		role: string;
		user: {
			id: string;
			email: string;
			firstName: string;
			lastName: string;
		};
	}>;
	forums?: Array<{
		id: string;
		title: string;
		forumType: string;
		sortOrder: number;
	}>;
	_count?: {
		enrollments: number;
		publishedAssignments: number;
		publishedResources: number;
	};
}

export interface AssignmentTemplate {
	id: string;
	courseId: string;
	title: string;
	description: string | null;
	assignmentType: "homework" | "quiz" | "midterm" | "final" | "project" | "participation";
	gradingMode: "points" | "pass_fail";
	maxPoints: number | null;
	weightPercentage: number | null;
	defaultDurationDays: number | null;
	instructions: string | null;
	attachments: any | null;
	syllabusItemId: string | null;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
	gradingCriteria?: GradingCriteria[];
	syllabusItem?: {
		id: string;
		title: string;
		weekNumber: number | null;
	} | null;
}

export interface GradingCriteria {
	id: string;
	templateId: string;
	name: string;
	description: string | null;
	maxPoints: number;
	sortOrder: number;
}

export interface PublishedAssignment {
	id: string;
	instanceId: string;
	templateId: string;
	title: string;
	description: string | null;
	assignmentType: "homework" | "quiz" | "midterm" | "final" | "project" | "participation";
	gradingMode: "points" | "pass_fail";
	maxPoints: number | null;
	weightPercentage: number | null;
	instructions: string | null;
	publishAt: string | null;
	deadline: string;
	lateDeadline: string | null;
	latePenaltyPercent: number | null;
	status: "draft" | "scheduled" | "published" | "closed";
	autoPublish: boolean;
	publishedBy: string;
	createdAt: string;
	updatedAt: string;
	gradingCriteria?: Array<{
		id: string;
		publishedAssignmentId: string;
		name: string;
		description: string | null;
		maxPoints: number;
		sortOrder: number;
	}>;
	_count?: {
		submissions: number;
	};
}

// Enrollment types
export type EnrollmentStatus = "enrolled" | "dropped" | "completed";

export interface Enrollment {
	id: string;
	instanceId: string;
	studentId: string;
	status: EnrollmentStatus;
	enrolledAt: string;
	completedAt: string | null;
	finalGrade: number | null;
	createdAt: string;
	updatedAt: string;
}

export interface EnrollmentWithRelations extends Enrollment {
	instance?: CourseInstance & {
		course?: Pick<Course, "id" | "code" | "title" | "description" | "credits">;
	};
	student?: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		studentProfile?: StudentProfile | null;
	};
}

export interface EnrollmentStats {
	instanceId: string;
	totalEnrolled: number;
	totalDropped: number;
	totalCompleted: number;
	enrollmentLimit: number | null;
	enrollmentOpen: boolean;
	availableSpots: number | null;
}

export interface TeacherProfile {
	userId: string;
	department: string | null;
	title: string | null;
	bio: string | null;
	officeLocation: string | null;
}

export interface StudentProfile {
	userId: string;
	studentId: string | null;
	enrollmentYear: number | null;
	program: string | null;
}

export interface UserInfo {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string | null;
	isActive?: boolean;
	createdAt: string;
	updatedAt: string;
	roles?: Array<{
		role: {
			id: number;
			name: string;
			description: string | null;
		};
		grantedAt: string;
		grantedById: string | null;
	}>;
	teacherProfile?: TeacherProfile | null;
	studentProfile?: StudentProfile | null;
	permissions?: string[];
	menu?: MenuTree[];
	// Legacy fields for compatibility
	username?: string;
	avatar?: string;
	status?: BasicStatus;
}

export interface Permission_Old {
	id: string;
	parentId: string;
	name: string;
	label: string;
	type: PermissionType;
	route: string;
	status?: BasicStatus;
	order?: number;
	icon?: string;
	component?: string;
	hide?: boolean;
	hideTab?: boolean;
	frameSrc?: URL;
	newFeature?: boolean;
	children?: Permission_Old[];
}

export interface Role_Old {
	id: string;
	name: string;
	code: string;
	status: BasicStatus;
	order?: number;
	desc?: string;
	permission?: Permission_Old[];
}

export interface CommonOptions {
	status?: BasicStatus;
	desc?: string;
	createdAt?: string;
	updatedAt?: string;
}
export interface User extends CommonOptions {
	id: string; // uuid
	firstName: string;
	lastName: string;
	password: string;
	email: string;
	phone?: string;
	avatar?: string;
}

export interface Role extends CommonOptions {
	id: string; // uuid
	name: string;
	code: string;
}

export interface Permission extends CommonOptions {
	id: string; // uuid
	name: string;
	code: string; // resource:action  example: "user-management:read"
}

export interface Menu extends CommonOptions, MenuMetaInfo {
	id: string; // uuid
	parentId: string;
	name: string;
	code: string;
	order?: number;
	type: PermissionType;
}

// Submission types
export type SubmissionStatus = "draft" | "submitted" | "late" | "graded" | "returned";

export interface Submission {
	id: string;
	publishedAssignmentId: string;
	studentId: string;
	content: string | null;
	attachments: any | null;
	status: SubmissionStatus;
	submittedAt: string | null;
	totalPoints: number | null;
	finalPoints: number | null;
	latePenaltyApplied: number | null;
	isPassed: boolean | null;
	isLate: boolean;
	feedback: string | null;
	gradedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface SubmissionWithRelations extends Submission {
	student?: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
	} | null;
	publishedAssignment?: {
		id: string;
		title: string;
		deadline: string | null;
		lateDeadline: string | null;
		latePenaltyPercent: number | null;
	} | null;
	grades?: Array<{
		id: string;
		submissionId: string;
		publishedCriteriaId: string;
		pointsAwarded: number;
		feedback: string | null;
	}>;
	gradedBy?: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
	} | null;
}

export interface GradebookEntry {
	id: string;
	title: string;
	type: string;
	gradingMode: string;
	maxPoints: number | null;
	weightPercentage: number | null;
	deadline: string | null;
	submission: SubmissionWithRelations | null;
	criteria: Array<{
		id: string;
		name: string;
		maxPoints: number;
	}>;
}

export interface StudentGradebook {
	assignments: GradebookEntry[];
	finalGrade: number | null;
	finalLetter: string | null;
}

export interface SubmissionStats {
	total: number;
	submitted: number;
	graded: number;
	pending: number;
	late: number;
	averageScore: number | null;
}

export type MenuMetaInfo = Partial<
	Pick<NavItemDataProps, "path" | "icon" | "caption" | "info" | "disabled" | "auth" | "hidden">
> & {
	externalLink?: URL;
	component?: string;
};

export type MenuTree = Menu & {
	children?: MenuTree[];
};
