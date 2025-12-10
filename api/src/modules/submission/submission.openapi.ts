// ============================================================================
// SUBMISSION OPENAPI SCHEMAS
// ============================================================================

export const submissionOpenAPISchemas = {
  Submission: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
      publishedAssignmentId: { type: 'string', format: 'uuid' },
      studentId: { type: 'string', format: 'uuid' },
      content: { type: 'string', nullable: true },
      attachments: { type: 'object', nullable: true },
      status: {
        type: 'string',
        enum: ['draft', 'submitted', 'late', 'graded', 'returned'],
      },
      submittedAt: { type: 'string', format: 'date-time', nullable: true },
      totalPoints: { type: 'number', nullable: true },
      finalPoints: { type: 'number', nullable: true },
      latePenaltyApplied: { type: 'number', nullable: true },
      isPassed: { type: 'boolean', nullable: true },
      isLate: { type: 'boolean' },
      feedback: { type: 'string', nullable: true },
      gradedAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      student: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
      },
      publishedAssignment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          deadline: { type: 'string', format: 'date-time', nullable: true },
          lateDeadline: { type: 'string', format: 'date-time', nullable: true },
          latePenaltyPercent: { type: 'number', nullable: true },
        },
      },
    },
    required: ['id', 'publishedAssignmentId', 'studentId', 'status', 'createdAt', 'updatedAt'],
  },

  StudentGradebook: {
    type: 'object',
    properties: {
      assignments: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            type: { type: 'string' },
            gradingMode: { type: 'string', enum: ['points', 'pass_fail'] },
            maxPoints: { type: 'number', nullable: true },
            weightPercentage: { type: 'number', nullable: true },
            deadline: { type: 'string', format: 'date-time', nullable: true },
            submission: { $ref: '#/components/schemas/Submission' },
            criteria: { type: 'array', items: { type: 'object' } },
          },
        },
      },
      finalGrade: { type: 'number', nullable: true },
      finalLetter: { type: 'string', nullable: true },
    },
  },

  SubmissionStats: {
    type: 'object',
    properties: {
      total: { type: 'integer' },
      submitted: { type: 'integer' },
      graded: { type: 'integer' },
      pending: { type: 'integer' },
      late: { type: 'integer' },
      averageScore: { type: 'number', nullable: true },
    },
    required: ['total', 'submitted', 'graded', 'pending', 'late'],
  },

  SaveSubmissionRequest: {
    type: 'object',
    properties: {
      content: { type: 'string', maxLength: 10000 },
      attachments: { type: 'object' },
    },
  },

  GradeSubmissionRequest: {
    type: 'object',
    properties: {
      criteriaGrades: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          properties: {
            criteriaId: { type: 'string', format: 'uuid' },
            pointsAwarded: { type: 'number', minimum: 0 },
            feedback: { type: 'string', maxLength: 2000 },
          },
          required: ['criteriaId', 'pointsAwarded'],
        },
      },
      overallFeedback: { type: 'string', maxLength: 5000 },
    },
    required: ['criteriaGrades'],
  },

  GradePassFailRequest: {
    type: 'object',
    properties: {
      isPassed: { type: 'boolean' },
      feedback: { type: 'string', maxLength: 5000 },
    },
    required: ['isPassed'],
  },
};

// ============================================================================
// SUBMISSION OPENAPI PATHS
// ============================================================================

export const submissionOpenAPIPaths = {
  '/api/submissions/assignments/{assignmentId}/draft': {
    post: {
      tags: ['Submissions'],
      summary: 'Save submission draft',
      description: 'Save or update a submission draft (student only)',
      parameters: [
        {
          name: 'assignmentId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Published assignment ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SaveSubmissionRequest' },
          },
        },
      },
      responses: {
        201: {
          description: 'Submission draft saved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Submission',
              },
            },
          },
        },
        400: { description: 'Invalid request data' },
        401: { description: 'Unauthorized' },
        404: { description: 'Assignment not found' },
      },
    },
  },

  '/api/submissions/assignments/{assignmentId}/submit': {
    post: {
      tags: ['Submissions'],
      summary: 'Submit assignment',
      description: 'Submit a completed assignment for grading',
      parameters: [
        {
          name: 'assignmentId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Assignment submitted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Submission' },
            },
          },
        },
        401: { description: 'Unauthorized' },
        404: { description: 'Assignment not found' },
      },
    },
  },

  '/api/submissions/{submissionId}': {
    get: {
      tags: ['Submissions'],
      summary: 'Get submission',
      parameters: [
        {
          name: 'submissionId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Submission retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Submission' },
            },
          },
        },
        404: { description: 'Submission not found' },
      },
    },
    patch: {
      tags: ['Submissions'],
      summary: 'Update submission draft',
      parameters: [
        {
          name: 'submissionId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SaveSubmissionRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Submission updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Submission' },
            },
          },
        },
        404: { description: 'Submission not found' },
      },
    },
  },

  '/api/submissions': {
    get: {
      tags: ['Submissions'],
      summary: 'List submissions',
      description: 'List submissions with filters (teacher/admin only)',
      parameters: [
        {
          name: 'assignmentId',
          in: 'query',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'studentId',
          in: 'query',
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'status',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['draft', 'submitted', 'late', 'graded', 'returned'],
          },
        },
        {
          name: 'graded',
          in: 'query',
          schema: { type: 'boolean' },
        },
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 20, maximum: 100 },
        },
      ],
      responses: {
        200: {
          description: 'Submissions retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Submission' },
                  },
                  pagination: {
                    $ref: '#/components/schemas/Pagination',
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/submissions/{submissionId}/grade': {
    post: {
      tags: ['Submissions'],
      summary: 'Grade submission',
      description: 'Grade a submission with criteria-based points (teacher/admin only)',
      parameters: [
        {
          name: 'submissionId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GradeSubmissionRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Submission graded successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Submission' },
            },
          },
        },
        400: { description: 'Invalid request data' },
        404: { description: 'Submission not found' },
      },
    },
  },

  '/api/submissions/{submissionId}/grade-pass-fail': {
    post: {
      tags: ['Submissions'],
      summary: 'Grade submission (pass/fail)',
      description: 'Grade a submission as pass or fail (teacher/admin only)',
      parameters: [
        {
          name: 'submissionId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GradePassFailRequest' },
          },
        },
      },
      responses: {
        200: {
          description: 'Submission graded successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Submission' },
            },
          },
        },
        400: { description: 'Invalid request data' },
        404: { description: 'Submission not found' },
      },
    },
  },

  '/api/submissions/instances/{instanceId}/students/{studentId}/gradebook': {
    get: {
      tags: ['Submissions'],
      summary: 'Get student gradebook',
      description: "Get a student's gradebook for a course instance",
      parameters: [
        {
          name: 'instanceId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        {
          name: 'studentId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Gradebook retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/StudentGradebook' },
            },
          },
        },
        404: { description: 'Instance or student not found' },
      },
    },
  },

  '/api/submissions/assignments/{assignmentId}/stats': {
    get: {
      tags: ['Submissions'],
      summary: 'Get submission statistics',
      description: 'Get submission statistics for an assignment (teacher/admin only)',
      parameters: [
        {
          name: 'assignmentId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        200: {
          description: 'Submission statistics retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SubmissionStats' },
            },
          },
        },
        404: { description: 'Assignment not found' },
      },
    },
  },
};
