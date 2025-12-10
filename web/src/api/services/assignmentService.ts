import type { ApiResponse } from "#/api";
import type { AssignmentTemplate, GradingCriteria } from "#/entity";
import apiClient from "../apiClient";

// Query parameters
export interface ListAssignmentTemplatesParams {
	assignmentType?: "homework" | "quiz" | "midterm" | "final" | "project" | "participation";
	syllabusItemId?: string;
}

export interface GradingStructureResponse {
	templates: AssignmentTemplate[];
	totalWeight: number;
	totalMaxPoints: number;
}

export interface ValidationResponse {
	valid: boolean;
	criteriaSum: number;
	maxPoints: number;
}

// Request bodies
export interface CreateAssignmentTemplateReq {
	title: string;
	description?: string;
	assignmentType: "homework" | "quiz" | "midterm" | "final" | "project" | "participation";
	gradingMode: "points" | "pass_fail";
	maxPoints?: number;
	weightPercentage?: number;
	defaultDurationDays?: number;
	instructions?: string;
	syllabusItemId?: string;
	gradingCriteria?: Array<{
		name: string;
		description?: string;
		maxPoints: number;
	}>;
}

export interface UpdateAssignmentTemplateReq {
	title?: string;
	description?: string;
	assignmentType?: "homework" | "quiz" | "midterm" | "final" | "project" | "participation";
	gradingMode?: "points" | "pass_fail";
	maxPoints?: number;
	weightPercentage?: number;
	defaultDurationDays?: number;
	instructions?: string;
	syllabusItemId?: string;
}

export interface CopyAssignmentTemplateReq {
	targetCourseId?: string;
}

export interface AddGradingCriteriaReq {
	name: string;
	description?: string;
	maxPoints: number;
}

export interface UpdateGradingCriteriaReq {
	name?: string;
	description?: string;
	maxPoints?: number;
}

// Assignment template endpoints
const getAssignmentTemplates = (courseId: string, params?: ListAssignmentTemplatesParams) =>
	apiClient.get<ApiResponse<AssignmentTemplate[]>>({ url: `/courses/${courseId}/assignments`, params });

const getGradingStructure = (courseId: string) =>
	apiClient.get<ApiResponse<GradingStructureResponse>>({ url: `/courses/${courseId}/grading-structure` });

const getAssignmentTemplateById = (id: string) =>
	apiClient.get<ApiResponse<AssignmentTemplate>>({ url: `/assignments/${id}` });

const createAssignmentTemplate = (courseId: string, data: CreateAssignmentTemplateReq) =>
	apiClient.post<ApiResponse<AssignmentTemplate>>({ url: `/courses/${courseId}/assignments`, data });

const updateAssignmentTemplate = (id: string, data: UpdateAssignmentTemplateReq) =>
	apiClient.patch<ApiResponse<AssignmentTemplate>>({ url: `/assignments/${id}`, data });

const deleteAssignmentTemplate = (id: string) => apiClient.delete<ApiResponse<void>>({ url: `/assignments/${id}` });

const copyAssignmentTemplate = (id: string, data?: CopyAssignmentTemplateReq) =>
	apiClient.post<ApiResponse<AssignmentTemplate>>({ url: `/assignments/${id}/copy`, data });

const validateGradingCriteria = (id: string) =>
	apiClient.get<ApiResponse<ValidationResponse>>({ url: `/assignments/${id}/validate` });

// Grading criteria endpoints
const addGradingCriteria = (assignmentId: string, data: AddGradingCriteriaReq) =>
	apiClient.post<ApiResponse<GradingCriteria>>({ url: `/assignments/${assignmentId}/criteria`, data });

const updateGradingCriteria = (assignmentId: string, criteriaId: string, data: UpdateGradingCriteriaReq) =>
	apiClient.patch<ApiResponse<GradingCriteria>>({
		url: `/assignments/${assignmentId}/criteria/${criteriaId}`,
		data,
	});

const deleteGradingCriteria = (assignmentId: string, criteriaId: string) =>
	apiClient.delete<ApiResponse<void>>({ url: `/assignments/${assignmentId}/criteria/${criteriaId}` });

export default {
	// Assignment templates
	getAssignmentTemplates,
	getGradingStructure,
	getAssignmentTemplateById,
	createAssignmentTemplate,
	updateAssignmentTemplate,
	deleteAssignmentTemplate,
	copyAssignmentTemplate,
	validateGradingCriteria,
	// Grading criteria
	addGradingCriteria,
	updateGradingCriteria,
	deleteGradingCriteria,
};
