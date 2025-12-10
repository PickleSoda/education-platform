import { AssignmentTemplate, GradingCriteria, AssignmentType, GradingMode } from '@prisma/client';

// ============================================================================
// ASSIGNMENT TEMPLATE TYPES
// ============================================================================

export interface AssignmentTemplateCreateInput {
  courseId: string;
  title: string;
  description?: string | null;
  assignmentType: AssignmentType;
  gradingMode: GradingMode;
  maxPoints?: number | null;
  weightPercentage?: number | null;
  defaultDurationDays?: number | null;
  instructions?: string | null;
  attachments?: any;
  syllabusItemId?: string | null;
  sortOrder?: number;
  gradingCriteria?: GradingCriteriaInput[];
}

export interface AssignmentTemplateUpdateInput {
  title?: string;
  description?: string | null;
  assignmentType?: AssignmentType;
  gradingMode?: GradingMode;
  maxPoints?: number | null;
  weightPercentage?: number | null;
  defaultDurationDays?: number | null;
  instructions?: string | null;
  attachments?: any;
  syllabusItemId?: string | null;
  sortOrder?: number;
}

export interface GradingCriteriaInput {
  name: string;
  description?: string | null;
  maxPoints: number;
  sortOrder?: number;
}

export interface GradingCriteriaUpdateInput {
  name?: string;
  description?: string | null;
  maxPoints?: number;
  sortOrder?: number;
}

export interface AssignmentTemplateWithCriteria extends AssignmentTemplate {
  gradingCriteria?: GradingCriteria[];
  syllabusItem?: {
    id: string;
    title: string;
    weekNumber: number | null;
  } | null;
}

export interface AssignmentListFilters {
  courseId: string;
  assignmentType?: AssignmentType;
  syllabusItemId?: string;
}

export interface GradingStructure {
  templates: AssignmentTemplateWithCriteria[];
  assignments: AssignmentTemplateWithCriteria[];
  totalWeight: number;
  totalMaxPoints: number;
}

export interface AssignmentStats {
  templateId: string;
  title: string;
  usageCount: number;
  publishedCount: number;
  instances: {
    instanceId: string;
    semester: string;
    publishedAt: Date | null;
  }[];
}

export interface CriteriaValidation {
  isValid: boolean;
  criteriaSum: number;
  maxPoints: number;
}

export { GradingCriteria, AssignmentTemplate };
