import type { ApiResponse, PaginatedResponse } from "#/api";
import type { Course, CourseLecturer, CourseStats, CourseTag, Tag } from "#/entity";
import apiClient from "../apiClient";

// Query parameters
export interface ListCoursesParams {
	page?: string;
	limit?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	tagIds?: string;
	includeArchived?: string;
}

export interface SearchCoursesParams {
	q: string;
	limit?: string;
}

export interface GetTagsParams {
	limit?: string;
	popular?: string;
}

// Request bodies
export interface CreateCourseReq {
	code: string;
	title: string;
	description?: string;
	credits?: number;
	typicalDurationWeeks?: number;
	tags?: string[];
	lecturerIds?: string[];
}

export interface UpdateCourseReq {
	code?: string;
	title?: string;
	description?: string;
	credits?: number;
	typicalDurationWeeks?: number;
}

export interface CopyCourseReq {
	newCode: string;
}

export interface AddLecturerReq {
	userId: string;
	isPrimary?: boolean;
}

export interface AddTagReq {
	tagId: number;
}

export interface CreateTagReq {
	name: string;
	color?: string;
}

export enum CourseApi {
	Courses = "/courses",
	Tags = "/courses/tags",
	Search = "/courses/search",
	MyCreated = "/courses/my/created",
	MyTeaching = "/courses/my/teaching",
}

// Course endpoints
const getCourses = (params?: ListCoursesParams) =>
	apiClient.get<PaginatedResponse<Course>>({ url: CourseApi.Courses, params });

const getCourseById = (id: string) => apiClient.get<ApiResponse<Course>>({ url: `${CourseApi.Courses}/${id}` });

const createCourse = (data: CreateCourseReq) => apiClient.post<ApiResponse<Course>>({ url: CourseApi.Courses, data });

const updateCourse = (id: string, data: UpdateCourseReq) =>
	apiClient.patch<ApiResponse<Course>>({ url: `${CourseApi.Courses}/${id}`, data });

const deleteCourse = (id: string) => apiClient.delete<ApiResponse<void>>({ url: `${CourseApi.Courses}/${id}` });

const archiveCourse = (id: string) =>
	apiClient.post<ApiResponse<Course>>({ url: `${CourseApi.Courses}/${id}/archive` });

const unarchiveCourse = (id: string) =>
	apiClient.post<ApiResponse<Course>>({ url: `${CourseApi.Courses}/${id}/unarchive` });

const copyCourse = (id: string, data: CopyCourseReq) =>
	apiClient.post<ApiResponse<Course>>({ url: `${CourseApi.Courses}/${id}/copy`, data });

const getCourseStats = (id: string) =>
	apiClient.get<ApiResponse<CourseStats>>({ url: `${CourseApi.Courses}/${id}/stats` });

// Lecturer endpoints
const addLecturer = (id: string, data: AddLecturerReq) =>
	apiClient.post<ApiResponse<CourseLecturer>>({ url: `${CourseApi.Courses}/${id}/lecturers`, data });

const removeLecturer = (id: string, userId: string) =>
	apiClient.delete<ApiResponse<void>>({ url: `${CourseApi.Courses}/${id}/lecturers/${userId}` });

const getCourseLecturers = (id: string) =>
	apiClient.get<ApiResponse<CourseLecturer[]>>({ url: `${CourseApi.Courses}/${id}/lecturers` });

// Tag endpoints
const addTag = (id: string, data: AddTagReq) =>
	apiClient.post<ApiResponse<CourseTag>>({ url: `${CourseApi.Courses}/${id}/tags`, data });

const removeTag = (id: string, tagId: number) =>
	apiClient.delete<ApiResponse<void>>({ url: `${CourseApi.Courses}/${id}/tags/${tagId}` });

const getAllTags = (params?: GetTagsParams) => apiClient.get<ApiResponse<Tag[]>>({ url: CourseApi.Tags, params });

const createTag = (data: CreateTagReq) => apiClient.post<ApiResponse<Tag>>({ url: CourseApi.Tags, data });

// Search endpoints
const searchCourses = (params: SearchCoursesParams) =>
	apiClient.get<PaginatedResponse<Course>>({ url: CourseApi.Search, params });

const getMyCreatedCourses = () => apiClient.get<ApiResponse<Course[]>>({ url: CourseApi.MyCreated });

const getMyTeachingCourses = () => apiClient.get<ApiResponse<Course[]>>({ url: CourseApi.MyTeaching });

export default {
	// Course CRUD
	getCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse,
	// Course actions
	archiveCourse,
	unarchiveCourse,
	copyCourse,
	getCourseStats,
	// Lecturers
	addLecturer,
	removeLecturer,
	getCourseLecturers,
	// Tags
	addTag,
	removeTag,
	getAllTags,
	createTag,
	// Search
	searchCourses,
	getMyCreatedCourses,
	getMyTeachingCourses,
};
