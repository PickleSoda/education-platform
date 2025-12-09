import apiClient from "../apiClient";
import type { ApiResponse } from "#/api";

export interface Role {
	id: number;
	name: string;
	description: string | null;
}

export interface CreateRoleReq {
	name: string;
	description?: string;
}

export interface UpdateRoleReq {
	name?: string;
	description?: string;
}

export enum RoleApi {
	Roles = "/roles",
}

const getRoles = () => apiClient.get<ApiResponse<Role[]>>({ url: RoleApi.Roles });

const getRoleById = (id: number) => apiClient.get<ApiResponse<Role>>({ url: `${RoleApi.Roles}/${id}` });

const createRole = (data: CreateRoleReq) => apiClient.post<ApiResponse<Role>>({ url: RoleApi.Roles, data });

const updateRole = (id: number, data: UpdateRoleReq) =>
	apiClient.patch<ApiResponse<Role>>({ url: `${RoleApi.Roles}/${id}`, data });

const deleteRole = (id: number) => apiClient.delete<ApiResponse<void>>({ url: `${RoleApi.Roles}/${id}` });

export default {
	getRoles,
	getRoleById,
	createRole,
	updateRole,
	deleteRole,
};
