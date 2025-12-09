import apiClient from "../apiClient";

import type { UserInfo } from "#/entity";
import type { ApiResponse, PaginatedResponse } from "#/api";

// Auth types
export interface SignInReq {
	email: string;
	password: string;
}

export interface SignUpReq {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface ForgotPasswordReq {
	email: string;
}

export interface ResetPasswordReq {
	password: string;
}

export interface AuthResponse {
	user: UserInfo;
	tokens: {
		access: {
			token: string;
			expires: string;
		};
		refresh: {
			token: string;
			expires: string;
		};
	};
}

export interface TokensResponse {
	access: {
		token: string;
		expires: string;
	};
	refresh: {
		token: string;
		expires: string;
	};
}

// User types
export interface CreateUserReq {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	avatarUrl?: string;
}

export interface UpdateUserReq {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	isActive?: boolean;
}

export interface ListUsersParams {
	page?: string;
	limit?: string;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	search?: string;
	role?: string;
	isActive?: string;
}

export interface AddRoleReq {
	roleName: string;
}

export interface TeacherProfile {
	userId: string;
	department: string | null;
	title: string | null;
	bio: string | null;
	officeLocation: string | null;
}

export interface UpdateTeacherProfileReq {
	department?: string;
	title?: string;
	bio?: string;
	officeLocation?: string;
}

export interface StudentProfile {
	userId: string;
	studentId: string | null;
	enrollmentYear: number | null;
	program: string | null;
}

export interface UpdateStudentProfileReq {
	studentId?: string;
	enrollmentYear?: number;
	program?: string;
}

export type SignInRes = AuthResponse;

export enum AuthApi {
	SignIn = "/auth/login",
	SignUp = "/auth/register",
	Logout = "/auth/logout",
	Refresh = "/auth/refresh-tokens",
	ForgotPassword = "/auth/forgot-password",
	ResetPassword = "/auth/reset-password",
}

export enum UserApi {
	Users = "/users",
}

// Auth endpoints
const signin = (data: SignInReq) => apiClient.post<ApiResponse<AuthResponse>>({ url: AuthApi.SignIn, data });
const signup = (data: SignUpReq) => apiClient.post<ApiResponse<AuthResponse>>({ url: AuthApi.SignUp, data });
const logout = (refreshToken: string) =>
	apiClient.post<ApiResponse<void>>({ url: AuthApi.Logout, data: { refreshToken } });
const refreshTokens = (refreshToken: string) =>
	apiClient.post<ApiResponse<TokensResponse>>({ url: AuthApi.Refresh, data: { refreshToken } });
const forgotPassword = (data: ForgotPasswordReq) =>
	apiClient.post<ApiResponse<void>>({ url: AuthApi.ForgotPassword, data });
const resetPassword = (token: string, data: ResetPasswordReq) =>
	apiClient.post<ApiResponse<void>>({ url: `${AuthApi.ResetPassword}?token=${token}`, data });

// User CRUD endpoints
const createUser = (data: CreateUserReq) => apiClient.post<ApiResponse<UserInfo>>({ url: UserApi.Users, data });
const listUsers = (params?: ListUsersParams) =>
	apiClient.get<PaginatedResponse<UserInfo>>({ url: UserApi.Users, params });
const getUserById = (id: string) => apiClient.get<ApiResponse<UserInfo>>({ url: `${UserApi.Users}/${id}` });
const updateUser = (id: string, data: UpdateUserReq) =>
	apiClient.patch<ApiResponse<UserInfo>>({ url: `${UserApi.Users}/${id}`, data });
const deleteUser = (id: string) => apiClient.delete<ApiResponse<void>>({ url: `${UserApi.Users}/${id}` });
const deactivateUser = (id: string) =>
	apiClient.post<ApiResponse<UserInfo>>({ url: `${UserApi.Users}/${id}/deactivate` });

// Role management endpoints
const getUserRoles = (id: string) => apiClient.get<ApiResponse<string[]>>({ url: `${UserApi.Users}/${id}/roles` });
const addRole = (id: string, data: AddRoleReq) =>
	apiClient.post<ApiResponse<UserInfo>>({ url: `${UserApi.Users}/${id}/roles`, data });
const removeRole = (id: string, roleName: string) =>
	apiClient.delete<ApiResponse<UserInfo>>({ url: `${UserApi.Users}/${id}/roles/${roleName}` });

// Profile management endpoints
const getTeacherProfile = (id: string) =>
	apiClient.get<ApiResponse<{ profile: TeacherProfile }>>({ url: `${UserApi.Users}/${id}/teacher-profile` });
const updateTeacherProfile = (id: string, data: UpdateTeacherProfileReq) =>
	apiClient.put<ApiResponse<{ profile: TeacherProfile }>>({ url: `${UserApi.Users}/${id}/teacher-profile`, data });
const getStudentProfile = (id: string) =>
	apiClient.get<ApiResponse<{ profile: StudentProfile }>>({ url: `${UserApi.Users}/${id}/student-profile` });
const updateStudentProfile = (id: string, data: UpdateStudentProfileReq) =>
	apiClient.put<ApiResponse<{ profile: StudentProfile }>>({ url: `${UserApi.Users}/${id}/student-profile`, data });

export default {
	// Auth
	signin,
	signup,
	logout,
	refreshTokens,
	forgotPassword,
	resetPassword,
	// User CRUD
	createUser,
	listUsers,
	getUserById,
	updateUser,
	deleteUser,
	deactivateUser,
	// Roles
	getUserRoles,
	addRole,
	removeRole,
	// Profiles
	getTeacherProfile,
	updateTeacherProfile,
	getStudentProfile,
	updateStudentProfile,
};
