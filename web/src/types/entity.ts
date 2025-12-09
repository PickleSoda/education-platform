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

export type MenuMetaInfo = Partial<
	Pick<NavItemDataProps, "path" | "icon" | "caption" | "info" | "disabled" | "auth" | "hidden">
> & {
	externalLink?: URL;
	component?: string;
};

export type MenuTree = Menu & {
	children?: MenuTree[];
};
