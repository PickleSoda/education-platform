import type { ApiResponse } from "#/api";
import type { Enrollment, EnrollmentStats, EnrollmentWithRelations } from "#/entity";
import apiClient from "../apiClient";

// Query parameters
export interface ListEnrollmentsParams {
	status?: "enrolled" | "dropped" | "completed";
	page?: string;
	limit?: string;
}

export interface GetInstanceEnrollmentsParams {
	status?: "enrolled" | "dropped" | "completed";
	page?: string;
	limit?: string;
}

// Request bodies
export interface EnrollStudentReq {
	studentId: string;
}

export interface UpdateEnrollmentStatusReq {
	status: "enrolled" | "dropped" | "completed";
}

export interface BulkEnrollReq {
	studentIds: string[];
}

// Response types
export interface BulkEnrollResponse {
	successful: Enrollment[];
	failed: Array<{
		studentId: string;
		error: string;
	}>;
}

export interface CheckEnrollmentResponse {
	isEnrolled: boolean;
}

export interface RosterExportResponse {
	headers: string[];
	rows: string[][];
}

export enum EnrollmentApi {
	Enrollments = "/enrollments",
	MyEnrollments = "/enrollments/me",
}

// Self-enrollment endpoints
const enrollInInstance = (instanceId: string) =>
	apiClient.post<ApiResponse<Enrollment>>({
		url: `${EnrollmentApi.Enrollments}/instances/${instanceId}/enroll`,
	});

const getMyEnrollments = (params?: ListEnrollmentsParams) =>
	apiClient.get<ApiResponse<EnrollmentWithRelations[]>>({
		url: EnrollmentApi.MyEnrollments,
		params,
	});

// Enrollment CRUD
const getEnrollmentById = (id: string) =>
	apiClient.get<ApiResponse<EnrollmentWithRelations>>({
		url: `${EnrollmentApi.Enrollments}/${id}`,
	});

const updateEnrollmentStatus = (id: string, data: UpdateEnrollmentStatusReq) =>
	apiClient.patch<ApiResponse<Enrollment>>({
		url: `${EnrollmentApi.Enrollments}/${id}/status`,
		data,
	});

const deleteEnrollment = (id: string) =>
	apiClient.delete<ApiResponse<void>>({
		url: `${EnrollmentApi.Enrollments}/${id}`,
	});

// Instance enrollment management (teacher/admin)
const enrollStudentInInstance = (instanceId: string, data: EnrollStudentReq) =>
	apiClient.post<ApiResponse<Enrollment>>({
		url: `${EnrollmentApi.Enrollments}/instances/${instanceId}/students/enroll`,
		data,
	});

const getInstanceEnrollments = (instanceId: string, params?: GetInstanceEnrollmentsParams) =>
	apiClient.get<ApiResponse<EnrollmentWithRelations[]>>({
		url: `${EnrollmentApi.Enrollments}/instances/${instanceId}/enrollments`,
		params,
	});

const dropStudent = (instanceId: string, studentId: string) =>
	apiClient.post<ApiResponse<Enrollment>>({
		url: `${EnrollmentApi.Enrollments}/instances/${instanceId}/students/${studentId}/drop`,
	});

const bulkEnrollStudents = (instanceId: string, data: BulkEnrollReq) =>
	apiClient.post<ApiResponse<BulkEnrollResponse>>({
		url: `${EnrollmentApi.Enrollments}/instances/${instanceId}/bulk-enroll`,
		data,
	});

// Instance enrollment stats
const getInstanceEnrollmentStats = (instanceId: string) =>
	apiClient.get<ApiResponse<EnrollmentStats>>({
		url: `${EnrollmentApi.Enrollments}/instances/${instanceId}/stats`,
	});

// Check enrollment status
const checkEnrollment = (instanceId: string, studentId: string) =>
	apiClient.get<ApiResponse<CheckEnrollmentResponse>>({
		url: `${EnrollmentApi.Enrollments}/instances/${instanceId}/students/${studentId}/enrolled`,
	});

// Export roster
const exportRoster = (instanceId: string) =>
	apiClient.get<ApiResponse<RosterExportResponse>>({
		url: `${EnrollmentApi.Enrollments}/instances/${instanceId}/roster/export`,
	});

export default {
	// Self-enrollment
	enrollInInstance,
	getMyEnrollments,
	// CRUD
	getEnrollmentById,
	updateEnrollmentStatus,
	deleteEnrollment,
	// Instance management (teacher/admin)
	enrollStudentInInstance,
	getInstanceEnrollments,
	dropStudent,
	bulkEnrollStudents,
	// Stats and utilities
	getInstanceEnrollmentStats,
	checkEnrollment,
	exportRoster,
};
