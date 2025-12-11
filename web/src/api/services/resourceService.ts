import type { ApiResponse, PaginatedResponse } from "#/api";
import type { ResourceTemplate, PublishedResource, ResourceType } from "#/entity";
import apiClient from "../apiClient";

// Request bodies
export interface CreateResourceTemplateReq {
	title: string;
	description?: string;
	resourceType?: ResourceType;
	url?: string;
	filePath?: string;
	syllabusItemId?: string;
	sortOrder?: number;
}

export interface UpdateResourceTemplateReq {
	title?: string;
	description?: string;
	resourceType?: ResourceType;
	url?: string;
	filePath?: string;
	syllabusItemId?: string;
	sortOrder?: number;
}

export interface PublishResourceReq {
	title: string;
	description?: string;
	resourceType?: ResourceType;
	url?: string;
	filePath?: string;
	isPublished?: boolean;
	sortOrder?: number;
}

export enum ResourceApi {
	Templates = "/courses/:courseId/resources",
	Published = "/instances/:instanceId/resources",
}

// Resource Template endpoints (for course management)
const getResourceTemplates = (courseId: string) =>
	apiClient.get<PaginatedResponse<ResourceTemplate[]>>({
		url: `/courses/${courseId}/resources`,
	});

const getResourceTemplateById = (resourceId: string) =>
	apiClient.get<ApiResponse<ResourceTemplate>>({
		url: `/resources/${resourceId}`,
	});

const createResourceTemplate = (courseId: string, data: CreateResourceTemplateReq) =>
	apiClient.post<ApiResponse<ResourceTemplate>>({
		url: `/courses/${courseId}/resources`,
		data,
	});

const updateResourceTemplate = (resourceId: string, data: UpdateResourceTemplateReq) =>
	apiClient.patch<ApiResponse<ResourceTemplate>>({
		url: `/resources/${resourceId}`,
		data,
	});

const deleteResourceTemplate = (resourceId: string) =>
	apiClient.delete<ApiResponse<void>>({
		url: `/resources/${resourceId}`,
	});

// Published Resource endpoints (for course instances)
const getPublishedResources = (instanceId: string) =>
	apiClient.get<PaginatedResponse<PublishedResource[]>>({
		url: `/instances/${instanceId}/resources`,
	});

const getPublishedResourceById = (resourceId: string) =>
	apiClient.get<ApiResponse<PublishedResource>>({
		url: `/instances/resources/${resourceId}`,
	});

const publishResource = (instanceId: string, data: PublishResourceReq) =>
	apiClient.post<ApiResponse<PublishedResource>>({
		url: `/instances/${instanceId}/resources`,
		data,
	});

const updatePublishedResource = (resourceId: string, data: Partial<PublishResourceReq>) =>
	apiClient.patch<ApiResponse<PublishedResource>>({
		url: `/instances/resources/${resourceId}`,
		data,
	});

const deletePublishedResource = (resourceId: string) =>
	apiClient.delete<ApiResponse<void>>({
		url: `/instances/resources/${resourceId}`,
	});

const resourceService = {
	// Templates
	getResourceTemplates,
	getResourceTemplateById,
	createResourceTemplate,
	updateResourceTemplate,
	deleteResourceTemplate,
	// Published
	getPublishedResources,
	getPublishedResourceById,
	publishResource,
	updatePublishedResource,
	deletePublishedResource,
};

export default resourceService;
