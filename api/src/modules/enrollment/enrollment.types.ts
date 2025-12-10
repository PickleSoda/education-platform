// ============================================================================
// ENROLLMENT TYPES
// ============================================================================

// Base Enrollment type from Prisma (define here for portability)
export interface Enrollment {
  id: string;
  instanceId: string;
  studentId: string;
  status: EnrollmentStatus;
  enrolledAt: Date;
  completedAt: Date | null;
  finalGrade: number | null;
  finalLetter: string | null;
}

export type EnrollmentStatus = 'enrolled' | 'dropped' | 'completed' | 'failed';

export interface EnrollmentCreateInput {
  instanceId: string;
  studentId: string;
}

export interface EnrollmentUpdateInput {
  status?: EnrollmentStatus;
  finalGrade?: number | null;
  finalLetter?: string | null;
}

export interface EnrollmentListFilters {
  instanceId?: string;
  studentId?: string;
  status?: EnrollmentStatus;
}

export interface StudentProfile {
  studentId: string | null;
  enrollmentYear: number | null;
  program: string | null;
}

export interface StudentWithProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentProfile?: StudentProfile | null;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string | null;
}

export interface InstanceWithCourse {
  id: string;
  courseId: string;
  semester: string | null;
  startDate: Date;
  endDate: Date;
  status: string;
  enrollmentLimit: number | null;
  enrollmentOpen: boolean;
  course: Course;
}

export interface EnrollmentWithStudent extends Enrollment {
  student: StudentWithProfile;
}

export interface EnrollmentWithInstance extends Enrollment {
  instance: InstanceWithCourse;
}

export interface EnrollmentWithRelations extends Enrollment {
  student: StudentWithProfile;
  instance: InstanceWithCourse;
}

export interface EnrollmentStats {
  instanceId: string;
  totalEnrolled: number;
  totalDropped: number;
  totalCompleted: number;
  totalFailed: number;
  enrollmentOpen: boolean;
  enrollmentLimit: number | null;
  availableSpots: number | null;
}

export interface GradeCalculationResult {
  finalGrade: number | null;
  finalLetter: string | null;
  totalWeight: number;
  gradedAssignments: number;
}

export interface BulkEnrollResult {
  successful: string[];
  failed: Array<{
    studentId: string;
    reason: string;
  }>;
}
