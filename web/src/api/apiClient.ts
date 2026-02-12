import { GLOBAL_CONFIG } from "@/global-config";
import { t } from "@/locales/i18n";
import userStore from "@/store/userStore";
import axios, { type AxiosRequestConfig, type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import type { ApiResponse } from "#/api";

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

// ============================================================================
// TOKEN REFRESH LOGIC
// ============================================================================

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((promise) => {
		if (error) {
			promise.reject(error);
		} else {
			promise.resolve(token!);
		}
	});
	failedQueue = [];
};

const refreshTokens = async (): Promise<string | null> => {
	const refreshToken = userStore.getState().userToken.refreshToken;
	if (!refreshToken) return null;

	try {
		// Call refresh endpoint directly (not through apiClient to avoid interceptor loop)
		const response = await axios.post(`${GLOBAL_CONFIG.apiBaseUrl}/auth/refresh-tokens`, {
			refreshToken,
		});

		const { tokens } = response.data?.data || {};
		if (tokens) {
			// Update tokens in store
			userStore.getState().actions.setUserToken({
				accessToken: tokens.access.token,
				refreshToken: tokens.refresh.token,
			});
			return tokens.access.token;
		}
		return null;
	} catch (error) {
		// Refresh failed - clear tokens and redirect to login
		userStore.getState().actions.clearUserInfoAndToken();
		return null;
	}
};

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

axiosInstance.interceptors.request.use(
	(config) => {
		const token = userStore.getState().userToken.accessToken;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// ============================================================================
// RESPONSE INTERCEPTOR WITH BACKGROUND TOKEN REFRESH
// ============================================================================

axiosInstance.interceptors.response.use(
	(res: AxiosResponse<any>) => {
		if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));
		// Backend returns { success, data, message, statusCode }
		const { success, message } = res.data;
		if (success !== false) {
			return res.data;
		}
		throw new Error(message || t("sys.api.apiRequestFailed"));
	},
	async (error: AxiosError<ApiResponse>) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
		const { response, message } = error || {};

		// Handle 401 Unauthorized - attempt token refresh
		if (response?.status === 401 && !originalRequest._retry) {
			// Don't retry refresh token endpoint itself
			if (originalRequest.url?.includes('/auth/refresh-tokens')) {
				userStore.getState().actions.clearUserInfoAndToken();
				return Promise.reject(error);
			}

			if (isRefreshing) {
				// If already refreshing, queue this request
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return axiosInstance(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const newToken = await refreshTokens();

				if (newToken) {
					// Success - retry original request and process queued requests
					processQueue(null, newToken);
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return axiosInstance(originalRequest);
				} else {
					// Refresh failed
					processQueue(error, null);
					userStore.getState().actions.clearUserInfoAndToken();
					return Promise.reject(error);
				}
			} catch (refreshError) {
				processQueue(refreshError, null);
				userStore.getState().actions.clearUserInfoAndToken();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// Handle other errors
		const errMsg = response?.data?.message || message || t("sys.api.errorMessage");
		toast.error(errMsg, { position: "top-center" });
		return Promise.reject(error);
	}
);

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "GET" });
	}
	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "POST" });
	}
	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PUT" });
	}
	patch<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "PATCH" });
	}
	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return this.request<T>({ ...config, method: "DELETE" });
	}
	request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<any, T>(config);
	}
}

export default new APIClient();
