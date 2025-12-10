import apiClient from "../apiClient";
import type { TeacherDashboard, StudentDashboard, InstanceAnalytics } from "#/entity";
import type { ApiResponse } from "#/api";

const BASE_URL = "/dashboard";

// ============================================================================
// TEACHER DASHBOARD
// ============================================================================

const getTeacherDashboard = () => {
	return apiClient.get<ApiResponse<TeacherDashboard>>({ url: `${BASE_URL}/teacher` });
};

// ============================================================================
// STUDENT DASHBOARD
// ============================================================================

const getStudentDashboard = () => {
	return apiClient.get<ApiResponse<StudentDashboard>>({ url: `${BASE_URL}/student` });
};

// ============================================================================
// INSTANCE ANALYTICS
// ============================================================================

const getInstanceAnalytics = (instanceId: string, assignmentId?: string) => {
	const params = assignmentId ? { assignmentId } : {};
	return apiClient.get<ApiResponse<InstanceAnalytics>>({
		url: `${BASE_URL}/instances/${instanceId}/analytics`,
		params,
	});
};

// ============================================================================
// SERVICE EXPORTS
// ============================================================================

const dashboardService = {
	getTeacherDashboard,
	getStudentDashboard,
	getInstanceAnalytics,
};

export default dashboardService;
