import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { commonResponses } from '@/openapi/common.responses';
import { withSuccessResponse } from '@/openapi/common.schemas';

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

const studentProfileSchema = z.object({
  studentId: z.string().nullable(),
  enrollmentYear: z.number().nullable(),
  program: z.string().nullable(),
});

const studentSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  studentProfile: studentProfileSchema.nullable(),
});

const courseSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string().nullable(),
});

const instanceSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  semester: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.string(),
  course: courseSchema,
});

const enrollmentSchema = z.object({
  id: z.string(),
  instanceId: z.string(),
  studentId: z.string(),
  status: z.enum(['enrolled', 'dropped', 'completed', 'failed']),
  enrolledAt: z.string(),
  completedAt: z.string().nullable(),
  finalGrade: z.number().nullable(),
  finalLetter: z.string().nullable(),
  student: studentSchema.optional(),
  instance: instanceSchema.optional(),
});

const enrollmentWithStudentSchema = enrollmentSchema.extend({
  student: studentSchema,
});

const enrollmentWithInstanceSchema = enrollmentSchema.extend({
  instance: instanceSchema,
});

const enrollmentStatsSchema = z.object({
  instanceId: z.string(),
  totalEnrolled: z.number(),
  totalDropped: z.number(),
  totalCompleted: z.number(),
  totalFailed: z.number(),
  enrollmentOpen: z.boolean(),
  enrollmentLimit: z.number().nullable(),
  availableSpots: z.number().nullable(),
});

const gradeCalculationResultSchema = z.object({
  finalGrade: z.number().nullable(),
  finalLetter: z.string().nullable(),
  totalWeight: z.number(),
  gradedAssignments: z.number(),
});

const bulkEnrollResultSchema = z.object({
  successful: z.array(z.string()),
  failed: z.array(
    z.object({
      studentId: z.string(),
      reason: z.string(),
    })
  ),
});

const rosterExportSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

const enrollRequestSchema = z.object({
  studentId: z.string().uuid().optional(),
});

const updateStatusRequestSchema = z.object({
  status: z.enum(['enrolled', 'dropped', 'completed', 'failed']),
});

const bulkEnrollRequestSchema = z.object({
  studentIds: z.array(z.string().uuid()),
});

const calculateGradeRequestSchema = z.object({
  studentId: z.string().uuid().optional(),
});

// ============================================================================
// REGISTER PATHS
// ============================================================================

export const registerEnrollmentPaths = (registry: OpenAPIRegistry) => {
  // Get my enrollments
  registry.registerPath({
    method: 'get',
    path: '/enrollments/me',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Get my enrollments',
    description: 'Get all course enrollments for the current user.',
    request: {
      query: z.object({
        status: z.enum(['enrolled', 'dropped', 'completed', 'failed']).optional(),
      }),
    },
    responses: {
      200: {
        description: 'Enrollments retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(enrollmentWithInstanceSchema)),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Self-enroll in a course instance
  registry.registerPath({
    method: 'post',
    path: '/enrollments/instances/{instanceId}/enroll',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Enroll in a course instance',
    description: 'Enroll the current user (or specified student) in a course instance.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
      }),
      body: {
        content: {
          'application/json': {
            schema: enrollRequestSchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: 'Enrolled successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(enrollmentSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get enrollment by ID
  registry.registerPath({
    method: 'get',
    path: '/enrollments/{id}',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Get enrollment by ID',
    description: 'Get detailed information about a specific enrollment.',
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Enrollment retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(enrollmentSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Update enrollment status
  registry.registerPath({
    method: 'patch',
    path: '/enrollments/{id}/status',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Update enrollment status',
    description: 'Update the status of an enrollment. Requires teacher or admin role.',
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
      body: {
        content: {
          'application/json': {
            schema: updateStatusRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Enrollment status updated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(enrollmentSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Delete enrollment
  registry.registerPath({
    method: 'delete',
    path: '/enrollments/{id}',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Delete enrollment',
    description: 'Permanently delete an enrollment. Requires admin role.',
    request: {
      params: z.object({
        id: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Enrollment deleted successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.null()),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get instance enrollments (roster)
  registry.registerPath({
    method: 'get',
    path: '/enrollments/instances/{instanceId}/enrollments',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Get instance enrollments',
    description:
      'Get all enrollments for a course instance (roster). Requires teacher or admin role.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
      }),
      query: z.object({
        status: z.enum(['enrolled', 'dropped', 'completed', 'failed']).optional(),
      }),
    },
    responses: {
      200: {
        description: 'Enrollments retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.array(enrollmentWithStudentSchema)),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Get enrollment statistics
  registry.registerPath({
    method: 'get',
    path: '/enrollments/instances/{instanceId}/stats',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Get enrollment statistics',
    description: 'Get enrollment statistics for a course instance. Requires teacher or admin role.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Statistics retrieved successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(enrollmentStatsSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Drop student
  registry.registerPath({
    method: 'post',
    path: '/enrollments/instances/{instanceId}/students/{studentId}/drop',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Drop a student',
    description: 'Drop a student from a course instance. Requires teacher or admin role.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
        studentId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Student dropped successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(enrollmentSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Check enrollment
  registry.registerPath({
    method: 'get',
    path: '/enrollments/instances/{instanceId}/students/{studentId}/enrolled',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Check if student is enrolled',
    description: 'Check if a specific student is enrolled in a course instance.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
        studentId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Enrollment status checked',
        content: {
          'application/json': {
            schema: withSuccessResponse(z.object({ isEnrolled: z.boolean() })),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Bulk enroll
  registry.registerPath({
    method: 'post',
    path: '/enrollments/instances/{instanceId}/bulk-enroll',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Bulk enroll students',
    description: 'Enroll multiple students at once. Requires teacher or admin role.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
      }),
      body: {
        content: {
          'application/json': {
            schema: bulkEnrollRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Bulk enrollment completed',
        content: {
          'application/json': {
            schema: withSuccessResponse(bulkEnrollResultSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Export roster
  registry.registerPath({
    method: 'get',
    path: '/enrollments/instances/{instanceId}/roster/export',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Export roster',
    description: 'Export the course roster as CSV data. Requires teacher or admin role.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'Roster exported successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(rosterExportSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Calculate final grade
  registry.registerPath({
    method: 'post',
    path: '/enrollments/instances/{instanceId}/calculate-grade',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Calculate final grade',
    description: 'Calculate and save the final grade for a student.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
      }),
      body: {
        content: {
          'application/json': {
            schema: calculateGradeRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Final grade calculated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(gradeCalculationResultSchema),
          },
        },
      },
      ...commonResponses,
    },
  });

  // Calculate all grades
  registry.registerPath({
    method: 'post',
    path: '/enrollments/instances/{instanceId}/calculate-all-grades',
    tags: ['Enrollments'],
    security: [{ bearerAuth: [] }],
    summary: 'Calculate all final grades',
    description:
      'Calculate and save final grades for all enrolled students. Requires teacher or admin role.',
    request: {
      params: z.object({
        instanceId: z.string().uuid(),
      }),
    },
    responses: {
      200: {
        description: 'All grades calculated successfully',
        content: {
          'application/json': {
            schema: withSuccessResponse(
              z.object({
                processed: z.number(),
                results: z.array(gradeCalculationResultSchema),
              })
            ),
          },
        },
      },
      ...commonResponses,
    },
  });
};
