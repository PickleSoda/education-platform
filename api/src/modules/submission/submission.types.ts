import { Submission, SubmissionGrade } from '@prisma/client';

// ============================================================================
// SUBMISSION TYPES
// ============================================================================

export interface SubmissionCreateInput {
  assignmentId: string;
  studentId: string;
  content?: string;
  attachments?: any;
}

export interface SubmissionUpdateInput {
  content?: string;
  attachments?: any;
}

export interface SubmissionGradeInput {
  submissionId: string;
  graderId: string;
  criteriaGrades: Array<{
    criteriaId: string;
    pointsAwarded: number;
    feedback?: string;
  }>;
  overallFeedback?: string;
}

export interface SubmissionPassFailInput {
  submissionId: string;
  graderId: string;
  isPassed: boolean;
  feedback?: string;
}

export interface SubmissionListFilters {
  assignmentId?: string;
  studentId?: string;
  status?: string;
  graded?: boolean;
}

export type SubmissionWithRelations = Submission & {
  student?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  publishedAssignment?: {
    id: string;
    title: string;
    deadline: Date | null;
    lateDeadline: Date | null;
    latePenaltyPercent: any;
  } | null;
  grades?: SubmissionGrade[];
  gradedBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
};

export interface GradebookEntry {
  id: string;
  title: string;
  type: string;
  gradingMode: string;
  maxPoints: number | null;
  weightPercentage: number | null;
  deadline: Date | null;
  submission: SubmissionWithRelations | null;
  criteria: any[];
}

export interface StudentGradebook {
  assignments: GradebookEntry[];
  finalGrade: number | null;
  finalLetter: string | null | undefined;
}

export interface SubmissionStats {
  total: number;
  submitted: number;
  graded: number;
  pending: number;
  late: number;
  averageScore: number | null;
}
