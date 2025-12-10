import type { ApiResponse, PaginatedResponse } from "#/api";
import type { CourseInstance, PublishedAssignment } from "#/entity";
import apiClient from "../apiClient";

// Query parameters
export interface ListInstancesParams {
	courseId?: string;
	status?: "draft" | "scheduled" | "active" | "completed" | "archived";
	semester?: string;
	lecturerId?: string;
	page?: string;
	limit?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface InstanceStatsResponse {
	instanceId: string;
	courseCode: string;
	courseTitle: string;
	semester: string;
	status: string;
	enrollmentCount: number;
	enrollmentLimit: number | null;
	assignmentCount: number;
	resourceCount: number;
	submissionStats: {
		total: number;
		pending: number;
		graded: number;
	};
}

// Request bodies
export interface CreateInstanceReq {
	courseId: string;
	semester: string;
	startDate: string;
	endDate: string;
	enrollmentLimit?: number;
	enrollmentOpen?: boolean;
	lecturerIds?: string[];
}

export interface UpdateInstanceReq {
	semester?: string;
	startDate?: string;
	endDate?: string;
	enrollmentLimit?: number;
	enrollmentOpen?: boolean;
}

export interface UpdateInstanceStatusReq {
	status: "draft" | "scheduled" | "active" | "completed" | "archived";
}

export interface ToggleEnrollmentReq {
	isOpen: boolean;
}

export interface CloneInstanceReq {
	semester: string;
	startDate: string;
	endDate: string;
}

export interface PublishAssignmentReq {
	templateId: string;
	publishAt?: string;
	deadline: string;
	lateDeadline?: string;
	latePenaltyPercent?: number;
	autoPublish?: boolean;
}

export interface UpdatePublishedAssignmentReq {
	publishAt?: string;
	deadline?: string;
	lateDeadline?: string;
	latePenaltyPercent?: number;
	status?: "draft" | "scheduled" | "published" | "closed";
}

export enum InstanceApi {
	Instances = "/courses/instances",
	MyEnrolled = "/courses/instances/my/enrolled",
	MyTeaching = "/courses/instances/my/teaching",
}

// Instance endpoints
const getInstances = (params?: ListInstancesParams) =>
	apiClient.get<PaginatedResponse<CourseInstance>>({ url: InstanceApi.Instances, params });

const getInstanceById = (id: string) =>
	apiClient.get<ApiResponse<CourseInstance>>({ url: `${InstanceApi.Instances}/${id}` });

const getInstanceDetails = (id: string) =>
	apiClient.get<ApiResponse<CourseInstance>>({ url: `${InstanceApi.Instances}/${id}/details` });

const createInstance = (data: CreateInstanceReq) =>
	apiClient.post<ApiResponse<CourseInstance>>({ url: InstanceApi.Instances, data });

const updateInstance = (id: string, data: UpdateInstanceReq) =>
	apiClient.patch<ApiResponse<CourseInstance>>({ url: `${InstanceApi.Instances}/${id}`, data });

const updateInstanceStatus = (id: string, data: UpdateInstanceStatusReq) =>
	apiClient.patch<ApiResponse<CourseInstance>>({ url: `${InstanceApi.Instances}/${id}/status`, data });

const toggleEnrollment = (id: string, data: ToggleEnrollmentReq) =>
	apiClient.patch<ApiResponse<CourseInstance>>({ url: `${InstanceApi.Instances}/${id}/enrollment`, data });

const deleteInstance = (id: string) => apiClient.delete<ApiResponse<void>>({ url: `${InstanceApi.Instances}/${id}` });

const cloneInstance = (id: string, data: CloneInstanceReq) =>
	apiClient.post<ApiResponse<CourseInstance>>({ url: `${InstanceApi.Instances}/${id}/clone`, data });

const getInstanceStats = (id: string) =>
	apiClient.get<ApiResponse<InstanceStatsResponse>>({ url: `${InstanceApi.Instances}/${id}/stats` });

const getMyEnrolledInstances = () => apiClient.get<ApiResponse<CourseInstance[]>>({ url: InstanceApi.MyEnrolled });

const getMyTeachingInstances = () => apiClient.get<ApiResponse<CourseInstance[]>>({ url: InstanceApi.MyTeaching });

// Published assignment endpoints
const publishAssignment = (instanceId: string, data: PublishAssignmentReq) =>
	apiClient.post<ApiResponse<PublishedAssignment>>({
		url: `${InstanceApi.Instances}/${instanceId}/assignments/publish`,
		data,
	});

const getPublishedAssignments = (instanceId: string) =>
	apiClient.get<ApiResponse<PublishedAssignment[]>>({ url: `${InstanceApi.Instances}/${instanceId}/assignments` });

const getPublishedAssignmentById = (instanceId: string, assignmentId: string) =>
	apiClient.get<ApiResponse<PublishedAssignment>>({
		url: `${InstanceApi.Instances}/${instanceId}/assignments/${assignmentId}`,
	});

const updatePublishedAssignment = (instanceId: string, assignmentId: string, data: UpdatePublishedAssignmentReq) =>
	apiClient.patch<ApiResponse<PublishedAssignment>>({
		url: `${InstanceApi.Instances}/${instanceId}/assignments/${assignmentId}`,
		data,
	});

const deletePublishedAssignment = (instanceId: string, assignmentId: string) =>
	apiClient.delete<ApiResponse<void>>({
		url: `${InstanceApi.Instances}/${instanceId}/assignments/${assignmentId}`,
	});

export default {
	// Instance CRUD
	getInstances,
	getInstanceById,
	getInstanceDetails,
	createInstance,
	updateInstance,
	updateInstanceStatus,
	toggleEnrollment,
	deleteInstance,
	cloneInstance,
	getInstanceStats,
	// My instances
	getMyEnrolledInstances,
	getMyTeachingInstances,
	// Published assignments
	publishAssignment,
	getPublishedAssignments,
	getPublishedAssignmentById,
	updatePublishedAssignment,
	deletePublishedAssignment,
};
