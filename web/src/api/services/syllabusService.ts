import type { ApiResponse } from "#/api";
import type { SyllabusItem } from "#/entity";
import apiClient from "../apiClient";

// Request bodies
export interface CreateSyllabusItemReq {
	weekNumber?: number;
	title: string;
	description?: string;
	learningObjectives?: string[];
	sortOrder?: number;
}

export interface UpdateSyllabusItemReq {
	weekNumber?: number;
	title?: string;
	description?: string;
	learningObjectives?: string[];
	sortOrder?: number;
}

// Syllabus Item endpoints
const getSyllabusItems = (courseId: string) =>
	apiClient.get<ApiResponse<SyllabusItem[]>>({
		url: `/courses/${courseId}/syllabus`,
	});

const getSyllabusItemById = (syllabusItemId: string) =>
	apiClient.get<ApiResponse<SyllabusItem>>({
		url: `/syllabus/${syllabusItemId}`,
	});

const createSyllabusItem = (courseId: string, data: CreateSyllabusItemReq) =>
	apiClient.post<ApiResponse<SyllabusItem>>({
		url: `/courses/${courseId}/syllabus`,
		data,
	});

const updateSyllabusItem = (syllabusItemId: string, data: UpdateSyllabusItemReq) =>
	apiClient.patch<ApiResponse<SyllabusItem>>({
		url: `/syllabus/${syllabusItemId}`,
		data,
	});

const deleteSyllabusItem = (syllabusItemId: string) =>
	apiClient.delete<ApiResponse<void>>({
		url: `/syllabus/${syllabusItemId}`,
	});

const syllabusService = {
	getSyllabusItems,
	getSyllabusItemById,
	createSyllabusItem,
	updateSyllabusItem,
	deleteSyllabusItem,
};

export default syllabusService;
