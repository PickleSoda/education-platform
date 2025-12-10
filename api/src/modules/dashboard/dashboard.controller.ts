import httpStatus from 'http-status';
import { dashboardService } from './dashboard.service';
import catchAsync from '@/shared/utils/catch-async';
import zParse from '@/shared/utils/z-parse';
import type { ApiResponse, ExtendedUser } from '@/types/response';
import {
  getTeacherDashboardSchema,
  getStudentDashboardSchema,
  getInstanceAnalyticsSchema,
} from './dashboard.validation';

// ============================================================================
// TEACHER DASHBOARD CONTROLLER
// ============================================================================

export const getTeacherDashboard = catchAsync(async (req): Promise<ApiResponse<any>> => {
  zParse(getTeacherDashboardSchema, req);

  const userId = (req.user as ExtendedUser)!.id;
  const data = await dashboardService.getTeacherDashboard(userId);

  return {
    statusCode: httpStatus.OK,
    message: 'Teacher dashboard data retrieved successfully',
    data,
  };
});

// ============================================================================
// STUDENT DASHBOARD CONTROLLER
// ============================================================================

export const getStudentDashboard = catchAsync(async (req): Promise<ApiResponse<any>> => {
  zParse(getStudentDashboardSchema, req);

  const userId = (req.user as ExtendedUser)!.id;
  const data = await dashboardService.getStudentDashboard(userId);

  return {
    statusCode: httpStatus.OK,
    message: 'Student dashboard data retrieved successfully',
    data,
  };
});

// ============================================================================
// INSTANCE ANALYTICS CONTROLLER
// ============================================================================

export const getInstanceAnalytics = catchAsync(async (req): Promise<ApiResponse<any>> => {
  const { params, query } = await zParse(getInstanceAnalyticsSchema, req);

  const data = await dashboardService.getInstanceAnalytics(params.instanceId, query.assignmentId);

  return {
    statusCode: httpStatus.OK,
    message: 'Instance analytics retrieved successfully',
    data,
  };
});

// ============================================================================
// CONTROLLER EXPORTS
// ============================================================================

export const dashboardController = {
  getTeacherDashboard,
  getStudentDashboard,
  getInstanceAnalytics,
};
