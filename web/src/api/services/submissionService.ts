import type { ApiResponse, PaginatedResponse } from "#/api";
import type {
	SubmissionWithRelations,
	SubmissionWithCourseRelations,
	StudentGradebook,
	SubmissionStats,
} from "#/entity";
import apiClient from "../apiClient";
import axios from "axios";
import { GLOBAL_CONFIG } from "@/global-config";
import userStore from "@/store/userStore";

// Query parameters
export interface ListSubmissionsParams {
	page?: string;
	limit?: string;
	assignmentId?: string;
	studentId?: string;
	status?: "draft" | "submitted" | "late" | "graded" | "returned";
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}

export interface GetSubmissionStatsParams {
	assignmentId: string;
}

// Request bodies
export interface SaveSubmissionDraftReq {
	content?: string;
	attachments?: any;
	formSubmission?: any;
}

export interface UpdateSubmissionDraftReq {
	content?: string;
	attachments?: any;
	formSubmission?: any;
}

export interface GradeSubmissionReq {
	criteriaGrades: Array<{
		criteriaId: string;
		pointsAwarded: number;
		feedback?: string;
	}>;
	overallFeedback?: string;
}

export interface GradePassFailReq {
	isPassed: boolean;
	feedback?: string;
}

export enum SubmissionApi {
	Submissions = "/submissions",
	Draft = "/submissions/assignments",
	Gradebook = "/submissions/instances",
	// eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
	Stats = "/submissions/assignments",
}

// Submission endpoints
const getSubmissions = (params?: ListSubmissionsParams) =>
	apiClient.get<PaginatedResponse<SubmissionWithCourseRelations>>({ url: SubmissionApi.Submissions, params });

const getSubmissionById = (id: string) =>
	apiClient.get<ApiResponse<SubmissionWithRelations>>({ url: `${SubmissionApi.Submissions}/${id}` });

const saveSubmissionDraft = (assignmentId: string, data: SaveSubmissionDraftReq) =>
	apiClient.post<ApiResponse<SubmissionWithRelations>>({
		url: `${SubmissionApi.Draft}/${assignmentId}/draft`,
		data,
	});

const updateSubmissionDraft = (submissionId: string, data: UpdateSubmissionDraftReq) =>
	apiClient.patch<ApiResponse<SubmissionWithRelations>>({
		url: `${SubmissionApi.Submissions}/${submissionId}`,
		data,
	});

const submitAssignment = (assignmentId: string) =>
	apiClient.post<ApiResponse<SubmissionWithRelations>>({
		url: `${SubmissionApi.Draft}/${assignmentId}/submit`,
		data: {},
	});

const gradeSubmission = (submissionId: string, data: GradeSubmissionReq) =>
	apiClient.post<ApiResponse<SubmissionWithRelations>>({
		url: `${SubmissionApi.Submissions}/${submissionId}/grade`,
		data,
	});

const gradePassFail = (submissionId: string, data: GradePassFailReq) =>
	apiClient.post<ApiResponse<SubmissionWithRelations>>({
		url: `${SubmissionApi.Submissions}/${submissionId}/grade-pass-fail`,
		data,
	});

const getStudentGradebook = (instanceId: string, studentId: string) =>
	apiClient.get<ApiResponse<StudentGradebook>>({
		url: `${SubmissionApi.Gradebook}/${instanceId}/students/${studentId}/gradebook`,
	});

const getSubmissionStats = (assignmentId: string) =>
	apiClient.get<ApiResponse<SubmissionStats>>({
		url: `${SubmissionApi.Stats}/${assignmentId}/stats`,
	});

const uploadSubmissionFiles = async (assignmentId: string, files: File[]) => {
	const formData = new FormData();
	files.forEach((file) => {
		formData.append("files", file);
	});

	const token = userStore.getState().userToken.accessToken;
	const response = await axios.post(
		`${GLOBAL_CONFIG.apiBaseUrl}${SubmissionApi.Draft}/${assignmentId}/upload`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
				Authorization: `Bearer ${token}`,
			},
		}
	);
	return response.data;
};

const getDownloadUrl = (submissionId: string, filePath: string) =>
	`${GLOBAL_CONFIG.apiBaseUrl}${SubmissionApi.Submissions}/${submissionId}/download/${filePath}`;

const returnSubmission = (submissionId: string) =>
	apiClient.post<ApiResponse<SubmissionWithRelations>>({
		url: `${SubmissionApi.Submissions}/${submissionId}/return`,
		data: {},
	});

export default {
	// Submission CRUD
	getSubmissions,
	getSubmissionById,
	saveSubmissionDraft,
	updateSubmissionDraft,
	submitAssignment,
	// Grading
	gradeSubmission,
	gradePassFail,
	// Resubmission
	returnSubmission,
	// Gradebook
	getStudentGradebook,
	getSubmissionStats,
	// File operations
	uploadSubmissionFiles,
	getDownloadUrl,
};
