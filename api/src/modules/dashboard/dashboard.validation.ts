import { z } from 'zod';

// ============================================================================
// TEACHER DASHBOARD VALIDATION
// ============================================================================

export const getTeacherDashboardSchema = z.object({
	query: z.object({}).optional(),
});

// ============================================================================
// STUDENT DASHBOARD VALIDATION
// ============================================================================

export const getStudentDashboardSchema = z.object({
	query: z.object({}).optional(),
});

// ============================================================================
// INSTANCE ANALYTICS VALIDATION
// ============================================================================

export const getInstanceAnalyticsSchema = z.object({
	params: z.object({
		instanceId: z.string().uuid('Invalid instance ID format'),
	}),
	query: z.object({
		assignmentId: z.string().uuid('Invalid assignment ID format').optional(),
	}),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GetTeacherDashboardInput = z.infer<typeof getTeacherDashboardSchema>;
export type GetStudentDashboardInput = z.infer<typeof getStudentDashboardSchema>;
export type GetInstanceAnalyticsInput = z.infer<typeof getInstanceAnalyticsSchema>;
