// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API response wrapper from backend
 * All API endpoints return this structure
 */
export interface ApiResponse<T = unknown> {
	status: any;
	content: undefined;
	submittedAt: undefined;
	totalPoints: undefined;
	feedback: undefined;
	success?: boolean;
	statusCode?: number;
	message?: string;
	data?: T;
	error?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T = unknown> {
	success?: boolean;
	statusCode?: number;
	message?: string;
	data?: T[];
	meta?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

/**
 * Token response structure
 */
export interface TokenResponse {
	token: string;
	expires: string;
}

/**
 * Auth tokens response structure
 */
export interface AuthTokensResponse {
	access: TokenResponse;
	refresh: TokenResponse;
}

// Legacy type for backward compatibility
export interface Result<T = unknown> {
	success: boolean;
	message: string;
	data: T;
}
