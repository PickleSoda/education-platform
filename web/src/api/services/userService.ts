import apiClient from "../apiClient";

import type { UserInfo } from "#/entity";

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

export type SignInRes = AuthResponse;

export enum UserApi {
	SignIn = "/auth/login",
	SignUp = "/auth/register",
	Logout = "/auth/logout",
	Refresh = "/auth/refresh-tokens",
	User = "/users",
}

const signin = (data: SignInReq) => apiClient.post<AuthResponse>({ url: UserApi.SignIn, data });
const signup = (data: SignUpReq) => apiClient.post<AuthResponse>({ url: UserApi.SignUp, data });
const logout = (refreshToken: string) => apiClient.post({ url: UserApi.Logout, data: { refreshToken } });
const refresh = (refreshToken: string) => apiClient.post({ url: UserApi.Refresh, data: { refreshToken } });
const findById = (id: string) => apiClient.get<UserInfo>({ url: `${UserApi.User}/${id}` });

export default {
	signin,
	signup,
	findById,
	logout,
	refresh,
};
