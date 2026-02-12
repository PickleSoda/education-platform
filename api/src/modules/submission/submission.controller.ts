import httpStatus from 'http-status';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';

import catchAsync from '@/shared/utils/catch-async';
import { zParse } from '@/shared/utils/z-parse';
import ApiError from '@/shared/utils/api-error';
import type { ApiResponse, PaginatedResponse, ExtendedUser } from '@/types/response';
import { storageService } from '@/shared/services/storage.service';

import { submissionService } from './submission.service';
import type {
  SubmissionWithRelations,
  StudentGradebook,
  SubmissionStats,
} from './submission.types';
import {
  saveSubmissionSchema,
  submitAssignmentSchema,
  gradeSubmissionSchema,
  gradePassFailSchema,
  getSubmissionSchema,
  listSubmissionsSchema,
  getGradebookSchema,
  getSubmissionStatsSchema,
  updateSubmissionSchema,
} from './submission.validation';

// Configure multer for submission file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mpeg',
      'application/octet-stream', // for source code files
    ];

    // Also allow source code files by extension
    const ext = path.extname(file.originalname).toLowerCase();
    const codeExtensions = [
      '.py',
      '.java',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.c',
      '.cpp',
      '.h',
      '.cs',
      '.rb',
      '.go',
      '.rs',
      '.php',
    ];

    if (allowedMimes.includes(file.mimetype) || codeExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export const submissionUploadMiddleware = upload.array('files', 10);

// ============================================================================
// SUBMISSION CONTROLLERS
// ============================================================================

/**
 * Save submission draft
 * POST /submissions/assignments/:assignmentId/draft
 */
export const saveSubmission = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params, body } = await zParse(saveSubmissionSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const submission = await submissionService.saveSubmissionDraft(
      params.assignmentId,
      userId,
      body
    );

    return {
      statusCode: httpStatus.CREATED,
      message: 'Submission draft saved successfully',
      data: submission,
    };
  }
);

/**
 * Submit an assignment
 * POST /submissions/assignments/:assignmentId/submit
 */
export const submitAssignment = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params } = await zParse(submitAssignmentSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const submission = await submissionService.submitAssignmentService(params.assignmentId, userId);

    return {
      statusCode: httpStatus.OK,
      message: 'Assignment submitted successfully',
      data: submission,
    };
  }
);

/**
 * Get submission by ID
 * GET /submissions/:submissionId
 */
export const getSubmission = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params } = await zParse(getSubmissionSchema, req);
    const user = req.user as ExtendedUser;

    const submission = await submissionService.getSubmissionById(params.submissionId);

    // Students can only view their own submissions
    // Teachers and admins can view all submissions
    const userRoles = user.roles?.map((r) => r.role.name) || [];
    const isTeacherOrAdmin = userRoles.includes('teacher') || userRoles.includes('admin');

    if (!isTeacherOrAdmin && submission.studentId !== user.id) {
      throw new Error('You do not have permission to view this submission');
    }

    return {
      statusCode: httpStatus.OK,
      message: 'Submission retrieved successfully',
      data: submission,
    };
  }
);

/**
 * List submissions with filters
 * GET /submissions
 */
export const listSubmissions = catchAsync(
  async (req): Promise<PaginatedResponse<SubmissionWithRelations>> => {
    const { query } = await zParse(listSubmissionsSchema, req);
    const user = req.user as ExtendedUser;

    // Students can only view their own submissions
    // Teachers and admins can view all submissions
    const userRoles = user.roles?.map((r) => r.role.name) || [];
    const isTeacherOrAdmin = userRoles.includes('teacher') || userRoles.includes('admin');

    // If user is a student, automatically filter by their ID
    if (!isTeacherOrAdmin) {
      query.studentId = user.id;
    }

    const result = await submissionService.listSubmissions(query);

    return {
      statusCode: httpStatus.OK,
      message: 'Submissions retrieved successfully',
      data: (result as any).data,
      meta: (result as any).pagination,
    };
  }
);

/**
 * Grade submission with criteria
 * POST /submissions/:submissionId/grade
 */
export const gradeSubmission = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params, body } = await zParse(gradeSubmissionSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const submission = await submissionService.gradeSubmissionService(
      params.submissionId,
      userId,
      body
    );

    return {
      statusCode: httpStatus.OK,
      message: 'Submission graded successfully',
      data: submission,
    };
  }
);

/**
 * Grade submission as pass/fail
 * POST /submissions/:submissionId/grade-pass-fail
 */
export const gradePassFail = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params, body } = await zParse(gradePassFailSchema, req);
    const userId = (req.user as ExtendedUser)!.id;

    const submission = await submissionService.gradePassFailService(
      params.submissionId,
      userId,
      body
    );

    return {
      statusCode: httpStatus.OK,
      message: 'Submission graded successfully',
      data: submission,
    };
  }
);

/**
 * Get student gradebook
 * GET /submissions/instances/:instanceId/students/:studentId/gradebook
 */
export const getGradebook = catchAsync(async (req): Promise<ApiResponse<StudentGradebook>> => {
  const { params } = await zParse(getGradebookSchema, req);

  const gradebook = await submissionService.getStudentGradebookService(
    params.instanceId,
    params.studentId
  );

  return {
    statusCode: httpStatus.OK,
    message: 'Gradebook retrieved successfully',
    data: gradebook,
  };
});

/**
 * Get submission statistics
 * GET /submissions/assignments/:assignmentId/stats
 */
export const getSubmissionStats = catchAsync(async (req): Promise<ApiResponse<SubmissionStats>> => {
  const { params } = await zParse(getSubmissionStatsSchema, req);

  const stats = await submissionService.getSubmissionStatsService(params.assignmentId);

  return {
    statusCode: httpStatus.OK,
    message: 'Submission statistics retrieved successfully',
    data: stats,
  };
});

/**
 * Update submission draft
 * PATCH /submissions/:submissionId
 */
export const updateSubmission = catchAsync(
  async (req): Promise<ApiResponse<SubmissionWithRelations>> => {
    const { params, body } = await zParse(updateSubmissionSchema, req);

    const submission = await submissionService.updateSubmissionDraft(params.submissionId, body);

    return {
      statusCode: httpStatus.OK,
      message: 'Submission updated successfully',
      data: submission,
    };
  }
);

/**
 * Upload files for a submission
 * POST /submissions/assignments/:assignmentId/upload
 */
export const uploadSubmissionFiles = catchAsync(async (req): Promise<ApiResponse<any>> => {
  const assignmentId = req.params.assignmentId;
  const userId = (req.user as ExtendedUser)!.id;
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files uploaded');
  }

  const uploadResults = [];
  for (const file of files) {
    const result = await storageService.uploadFile(file, `submissions/${assignmentId}`);
    uploadResults.push({
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
      filePath: result.filePath,
      url: result.url,
    });
  }

  return {
    statusCode: httpStatus.OK,
    message: 'Files uploaded successfully',
    data: uploadResults,
  };
});

/**
 * Download a submission file
 * GET /submissions/:submissionId/download/:fileName
 */
export const downloadSubmissionFile = catchAsync(async (req, res): Promise<any> => {
  const { submissionId } = req.params;
  // path-to-regexp v8 captures wildcards as arrays; join segments into a path string
  const rawFilepath = req.params.filepath || req.params[0] || req.params.fileName;
  const fileName = Array.isArray(rawFilepath) ? rawFilepath.join('/') : rawFilepath;
  const user = req.user as ExtendedUser;

  if (!fileName) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'File path is required');
  }

  // Get submission to verify access
  const submission = await submissionService.getSubmissionById(submissionId);

  // Only the student who submitted or teachers/admins can download
  const userRoles = user.roles?.map((r) => r.role.name) || [];
  const isTeacherOrAdmin = userRoles.includes('teacher') || userRoles.includes('admin');

  if (!isTeacherOrAdmin && submission.studentId !== user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to download this file');
  }

  // Find the file in submission attachments
  const attachments = submission.attachments as any[];
  if (!attachments || !Array.isArray(attachments)) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No attachments found');
  }

  const fileInfo = attachments.find(
    (att: any) => att.filePath === fileName || att.name === fileName
  );
  if (!fileInfo || !fileInfo.filePath) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  // Resolve file path
  const localStoragePath = process.env.LOCAL_STORAGE_PATH || './uploads';
  const fullPath = path.join(localStoragePath, fileInfo.filePath);

  try {
    await fs.access(fullPath);
  } catch {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found on server');
  }

  // Set headers and send file
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(fileInfo.name)}"`
  );
  res.setHeader('Content-Type', fileInfo.type || 'application/octet-stream');
  res.sendFile(path.resolve(fullPath));
});

export const submissionController = {
  saveSubmission,
  submitAssignment,
  getSubmission,
  listSubmissions,
  gradeSubmission,
  gradePassFail,
  getGradebook,
  getSubmissionStats,
  updateSubmission,
  uploadSubmissionFiles,
  downloadSubmissionFile,
};

export default submissionController;
