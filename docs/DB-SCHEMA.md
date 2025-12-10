# Database Schema

> **Schema Version**: 1.0  
> **Last Updated**: December 9, 2025  
> **Total Tables**: 32 | **Enums**: 7 | **Relations**: 50+

## Overview

This schema implements a comprehensive Learning Management System (LMS) with:

- **Template/Instance Pattern** for course reusability
- **Flexible Role-Based Access Control** (RBAC)
- **Rich Grading System** with criteria-based assessment
- **Discussion Forums** with reactions and nested comments
- **Multi-Channel Notifications** (in-app, email, push)

``` md
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                 EDUCATIONAL PLATFORM                                │
│                                    ENTITY DIAGRAM                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ USERS & ROLES                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌──────────────┐      ┌────────────┐      ┌──────────┐                           │
│   │     User     │──────│  UserRole  │──────│   Role   │                           │
│   │              │      │            │      │          │                           │
│   │ • email *    │      │ • grantedAt│      │ • name * │                           │
│   │ • firstName  │      │ • grantedBy│      │          │                           │
│   │ • lastName   │      └────────────┘      └──────────┘                           │
│   │ • avatarUrl  │                          student                                 │
│   │ • isActive   │                          teacher                                 │
│   └──────┬───────┘                          admin                                   │
│          │                                                                          │
│          ├──► TeacherProfile                                                        │
│          │    • department                                                          │
│          │    • title                                                               │
│          │    • bio                                                                 │
│          │    • officeLocation                                                      │
│          │                                                                          │
│          └──► StudentProfile                                                        │
│               • studentId *                                                         │
│               • enrollmentYear                                                      │
│               • program                                                             │
│                                                                                     │
│   Note: UserRole supports role granting audit (who granted the role)               │
│         One user can have multiple roles (student + teacher possible)              │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ COURSE TEMPLATES (Reusable definitions)                                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌─────────────────────┐                                                           │
│   │       Course        │──────┬──► SyllabusItem                                   │
│   │    (template)       │      │    • weekNumber                                   │
│   │                     │      │    • title                                        │
│   │ • code * (CS101)    │      │    • learningObjectives[]                         │
│   │ • title             │      │    • sortOrder                                    │
│   │ • description       │      │                                                   │
│   │ • credits (3.5)     │      ├──► CourseTag ◄──── Tag                            │
│   │ • durationWeeks     │      │                    • name * (Web Dev, Backend)    │
│   │ • isArchived        │      │                    • color (#FF5733)              │
│   └─────────────────────┘      │                                                   │
│          │                     │                                                   │
│          │                     ├──► CourseLecturer ◄──── User                      │
│          │                     │    • isPrimary (bool)                             │
│          │                     │                                                   │
│          │                     ├──► AssignmentTemplate                              │
│          │                     │    • type: homework|quiz|midterm|final|project    │
│          │                     │    • gradingMode: points|pass_fail                │
│          │                     │    • maxPoints (100.00)                           │
│          │                     │    • weightPercentage (20.00)                     │
│          │                     │    • defaultDurationDays (7)                      │
│          │                     │    • instructions (Markdown/HTML)                 │
│          │                     │    • attachments (JSON)                           │
│          │                     │    └──► GradingCriteria                           │
│          │                     │         • name (Frontend, Backend, Tests)         │
│          │                     │         • maxPoints (60.00)                       │
│          │                     │         • sortOrder                               │
│          │                     │                                                   │
│          │                     └──► ResourceTemplate                               │
│          │                          • title                                        │
│          │                          • resourceType (pdf, video, link)              │
│          │                          • url | filePath                               │
│          │                          • syllabusItemId (optional)                    │
│          │                                                                          │
│          ▼                                                                          │
│   ┌──────────────────┐                                                              │
│   │ CourseInstance   │  ◄─── Created from template                                 │
│   │ (active course)  │       with specific dates & students                        │
│   │                  │                                                              │
│   │ • semester       │       Pattern Benefits:                                     │
│   │ • startDate      │       ✓ Reuse course structure across semesters             │
│   │ • endDate        │       ✓ Update template without affecting active courses    │
│   │ • status         │       ✓ Track changes per instance                          │
│   │ • enrollmentLimit│       ✓ Different instructors per semester                  │
│   └──────────────────┘                                                              │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ COURSE INSTANCES (Running courses with students)                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌────────────────────────┐                                                        │
│   │   CourseInstance       │─────┬──► InstanceLecturer ◄──── User                  │
│   │                        │     │    • role: lecturer|ta|grader                   │
│   │  • semester (Fall2024) │     │                                                 │
│   │  • startDate           │     │                                                 │
│   │  • endDate             │     ├──► Enrollment ◄──── User (student)              │
│   │  • status: draft|      │     │    • status: enrolled|dropped|completed|failed  │
│   │    scheduled|active|   │     │    • enrolledAt                                 │
│   │    completed|archived  │     │    • finalGrade (85.50)                         │
│   │  • enrollmentLimit     │     │    • finalLetter (B+)                           │
│   │  • enrollmentOpen      │     │    UNIQUE[instanceId, studentId]                │
│   └────────────────────────┘     │                                                 │
│                                  │                                                 │
│                                  ├──► PublishedAssignment                           │
│                                  │    • title (copied from template)               │
│                                  │    • status: draft|scheduled|published|closed   │
│                                  │    • publishAt (auto-publish support)           │
│                                  │    • deadline                                   │
│                                  │    • lateDeadline                               │
│                                  │    • latePenaltyPercent (10.00 = 10%)           │
│                                  │    • autoPublish (bool)                         │
│                                  │    └──► PublishedGradingCriteria                │
│                                  │         (copied from template criteria)         │
│                                  │         • name, maxPoints                       │
│                                  │         • templateCriteriaId (reference)        │
│                                  │                                                 │
│                                  │         Student submits ▼                       │
│                                  │         ┌────────────────────────┐              │
│                                  │         │      Submission        │              │
│                                  │         │  • status: draft|      │              │
│                                  │         │    submitted|late|     │              │
│                                  │         │    graded|returned     │              │
│                                  │         │  • content             │              │
│                                  │         │  • attachments (JSON)  │              │
│                                  │         │  • submittedAt         │              │
│                                  │         │  • isLate              │              │
│                                  │         │  • totalPoints (90.00) │              │
│                                  │         │  • latePenaltyApplied  │              │
│                                  │         │  • finalPoints         │              │
│                                  │         │  • feedback            │              │
│                                  │         │  • gradedBy, gradedAt  │              │
│                                  │         └──────────┬─────────────┘              │
│                                  │                    │                            │
│                                  │                    ▼                            │
│                                  │         ┌────────────────────────┐              │
│                                  │         │   SubmissionGrade      │              │
│                                  │         │   (per criterion)      │              │
│                                  │         │  • pointsAwarded       │              │
│                                  │         │  • feedback            │              │
│                                  │         │  • gradedBy            │              │
│                                  │         │  UNIQUE[submissionId,  │              │
│                                  │         │    publishedCriteriaId]│              │
│                                  │         └────────────────────────┘              │
│                                  │                                                 │
│                                  ├──► PublishedResource                             │
│                                  │    • title, resourceType                        │
│                                  │    • url | filePath                             │
│                                  │    • isPublished, publishedAt                   │
│                                  │                                                 │
│                                  ├──► Forum                                         │
│                                  │    • title, description                         │
│                                  │    • forumType: general|assignment|qa|          │
│                                  │      announcements                              │
│                                  │    • isLocked                                   │
│                                  │                                                 │
│                                  └──► Announcement                                  │
│                                       • title, content                             │
│                                       • isPinned                                   │
│                                       • publishedAt                                │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ DISCUSSION FORUMS                                                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌──────────────┐      ┌────────────────┐      ┌───────────────┐                  │
│   │    Forum     │──────│   ForumPost    │──────│ ForumComment  │◄───┐             │
│   │              │      │                │      │               │    │             │
│   │ • title      │      │ • title        │      │ • content     │    │ nested      │
│   │ • forumType  │      │ • content      │      │ • parentId    │────┘ replies     │
│   │ • isLocked   │      │ • isPinned     │      │ • isAnswer    │                  │
│   └──────────────┘      │ • isLocked     │      │ • isAnonymous │                  │
│                         │ • isAnonymous  │      └───────┬───────┘                  │
│   Forum Types:          │ • viewCount    │              │                          │
│   • general             └────────┬───────┘              ▼                          │
│   • assignment                   │                CommentReaction                   │
│   • qa                           ▼                • type: like|helpful|insightful  │
│   • announcements          PostReaction          PK[commentId, userId, type]       │
│                            • type                                                   │
│                            PK[postId,                                               │
│                               userId, type]        ┌──────────────┐                 │
│                                                    │  ForumTag    │                 │
│                            ┌────────────────┐     │ • name *     │                 │
│                            │ ForumPostTag   │─────│ • color      │                 │
│                            └────────────────┘     └──────────────┘                 │
│                                                                                     │
│   Features:                                                                         │
│   ✓ Nested comment replies (self-referencing parent)                               │
│   ✓ Anonymous posting support                                                      │
│   ✓ Accepted answer marking (Q&A forums)                                           │
│   ✓ Post/comment locking                                                           │
│   ✓ View count tracking                                                            │
│   ✓ Multiple reaction types per user                                               │
│   ✓ Tag categorization                                                             │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ NOTIFICATIONS                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   ┌────────────────────┐      ┌───────────────────────┐                            │
│   │   Notification     │      │ NotificationSetting   │                            │
│   │                    │      │                       │                            │
│   │ • userId           │      │ • userId              │                            │
│   │ • type             │      │ • type                │                            │
│   │ • title            │      │ • channel             │                            │
│   │ • message          │      │ • isEnabled           │                            │
│   │ • data (JSON)      │      └───────────────────────┘                            │
│   │ • isRead, readAt   │                                                           │
│   │ • instanceId?      │      User preferences per notification type & channel     │
│   │ • assignmentId?    │      UNIQUE[userId, type, channel]                        │
│   │ • forumPostId?     │                                                           │
│   └────────────────────┘                                                           │
│                                                                                     │
│   Notification Types:                    Channels:                                 │
│   • assignment_published                 • in_app (default)                        │
│   • assignment_deadline                  • email                                   │
│   • assignment_graded                    • push                                    │
│   • enrollment_confirmed                                                           │
│   • announcement                         User can customize:                       │
│   • forum_reply                          ✓ Which notifications to receive          │
│   • forum_mention                        ✓ Per channel (app, email, push)         │
│   • course_started                       ✓ Per notification type                   │
│   • course_completed                                                               │
│   • grade_updated                        Indexed by:                               │
│   • resource_published                   • [userId, isRead] - fetch unread         │
│                                          • [userId, createdAt] - chronological     │
│   Optional References:                   • [type] - filter by type                 │
│   Used for quick filtering without                                                 │
│   complex JSON queries                                                             │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ GRADING FLOW                                                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│   STEP 1: Define Template                                                          │
│   ┌────────────────────────────────────┐                                           │
│   │      AssignmentTemplate            │                                           │
│   │                                    │                                           │
│   │  title: "Web Development Project"  │                                           │
│   │  type: project                     │                                           │
│   │  gradingMode: points               │                                           │
│   │  maxPoints: 100.00                 │                                           │
│   │  weightPercentage: 20.00 (20%)     │                                           │
│   │  defaultDurationDays: 14           │                                           │
│   └────────────────────────────────────┘                                           │
│          │                                                                          │
│          └──► GradingCriteria (3 items)                                            │
│               ┌─────────────────────────┐                                          │
│               │ 1. Frontend: 60pts      │                                          │
│               │ 2. Backend: 30pts       │                                          │
│               │ 3. Documentation: 10pts │                                          │
│               └─────────────────────────┘                                          │
│                                                                                     │
│   STEP 2: Publish to Instance                                                      │
│   ┌────────────────────────────────────┐                                           │
│   │     PublishedAssignment            │  Values copied from template              │
│   │                                    │  + instance-specific settings             │
│   │  title: "Web Development Project"  │                                           │
│   │  status: published                 │                                           │
│   │  publishAt: 2024-11-01 09:00       │  ◄── Instance specific                   │
│   │  deadline: 2024-11-15 23:59        │  ◄── Instance specific                   │
│   │  lateDeadline: 2024-11-17 23:59    │  ◄── Instance specific                   │
│   │  latePenaltyPercent: 10.00         │  ◄── Instance specific                   │
│   │  autoPublish: true                 │                                           │
│   └────────────────────────────────────┘                                           │
│          │                                                                          │
│          └──► PublishedGradingCriteria                                             │
│               ┌─────────────────────────┐  Copied from template                    │
│               │ 1. Frontend: 60pts      │  Allows editing without affecting        │
│               │ 2. Backend: 30pts       │  the template                            │
│               │ 3. Documentation: 10pts │                                          │
│               └─────────────────────────┘                                          │
│                                                                                     │
│   STEP 3: Student Submits                                                          │
│   ┌────────────────────────────────────┐                                           │
│   │         Submission                 │                                           │
│   │                                    │                                           │
│   │  studentId: <uuid>                 │                                           │
│   │  status: submitted                 │                                           │
│   │  content: "GitHub: ..."            │                                           │
│   │  attachments: [{...}]              │                                           │
│   │  submittedAt: 2024-11-16 10:30     │  ◄── After deadline!                     │
│   │  isLate: true                      │                                           │
│   └────────────────────────────────────┘                                           │
│                                                                                     │
│   STEP 4: Teacher Grades (Criterion by Criterion)                                  │
│   ┌────────────────────────────────────┐                                           │
│   │       SubmissionGrade              │  One per criterion                        │
│   │                                    │                                           │
│   │  1. Frontend: 55/60 pts            │  "Missing responsive design"             │
│   │  2. Backend: 28/30 pts             │  "Good API structure"                    │
│   │  3. Documentation: 8/10 pts        │  "Add more examples"                     │
│   └────────────────────────────────────┘                                           │
│          │                                                                          │
│          ▼                                                                          │
│   STEP 5: Calculate Final Grade (Automatic)                                        │
│   ┌────────────────────────────────────┐                                           │
│   │         Submission                 │                                           │
│   │                                    │                                           │
│   │  totalPoints: 91.00                │  ◄── Sum of criterion grades             │
│   │  latePenaltyApplied: 9.10          │  ◄── 91 × 10% = 9.10                     │
│   │  finalPoints: 81.90                │  ◄── 91 - 9.10 = 81.90                   │
│   │  status: graded                    │                                           │
│   │  gradedBy: <teacher-uuid>          │                                           │
│   │  gradedAt: 2024-11-18 14:20        │                                           │
│   │  feedback: "Good work overall..."  │  ◄── Overall feedback                    │
│   └────────────────────────────────────┘                                           │
│                                                                                     │
│   Final Course Grade Calculation:                                                  │
│   Each assignment contributes weightPercentage (20%) to final grade                │
│   Example: 81.90 × 0.20 = 16.38 points toward final grade                          │
│                                                                                     │
│   Pass/Fail Mode:                                                                  │
│   When gradingMode = pass_fail:                                                    │
│   • isPassed field used instead of points                                          │
│   • Criteria grades still recorded for feedback                                    │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

## Key Design Patterns

### 1. Template/Instance Pattern
**Used in**: Course → CourseInstance, AssignmentTemplate → PublishedAssignment

**Benefits**:
- Reusability across semesters
- Update templates without affecting active courses
- Historical tracking of changes
- Different configurations per instance

### 2. Criteria-Based Grading
**Flow**: Template Criteria → Published Criteria → Submission Grades

**Benefits**:
- Transparent grading rubrics
- Detailed feedback per criterion
- Consistent evaluation across submissions
- Easy calculation of weighted scores

### 3. Audit Trail
**Fields**: `createdAt`, `updatedAt`, `editedAt`, `gradedAt`, `grantedAt`, `grantedBy`

**Benefits**:
- Track who made changes and when
- Accountability for grade modifications
- Role assignment history

### 4. Soft State Management
**Enums**: InstanceStatus, EnrollmentStatus, SubmissionStatus, PublishStatus

**Benefits**:
- Clear lifecycle tracking
- Easy filtering and reporting
- Prevents hard deletes of important data

## Database Indexes

### High-Traffic Queries
```

User:

- email (unique) - Login

CourseInstance:

- [status] - List active courses
- [startDate, endDate] - Semester filtering

Enrollment:

- [instanceId, studentId] (unique) - Student course access
- [studentId] - Student's courses
- [instanceId] - Course roster

Submission:

- [publishedAssignmentId, studentId] (unique) - One submission per student
- [publishedAssignmentId] - All assignment submissions
- [studentId] - Student's submissions

Notification:

- [userId, isRead] - Unread notifications
- [userId, createdAt] - Recent notifications
- [type] - Filter by type

ForumPost:

- [forumId, isPinned] - Pinned posts first
- [createdAt] - Chronological ordering

```

## Enums Reference

```typescript
enum AssignmentType {
  homework      // Regular assignments
  quiz          // Short assessments
  midterm       // Mid-semester exam
  final         // Final exam
  project       // Large projects
  participation // Attendance/engagement
}

enum GradingMode {
  points    // Numeric scoring (0-100)
  pass_fail // Binary pass/fail
}

enum InstanceStatus {
  draft      // Being set up
  scheduled  // Ready, not started
  active     // Currently running
  completed  // Ended
  archived   // Historical record
}

enum EnrollmentStatus {
  enrolled  // Active student
  dropped   // Withdrew
  completed // Finished successfully
  failed    // Did not pass
}

enum PublishStatus {
  draft     // Not visible to students
  scheduled // Will auto-publish at publishAt time
  published // Visible to students
  closed    // No longer accepting submissions
}

enum SubmissionStatus {
  draft     // Student working on it
  submitted // Submitted on time
  late      // Submitted after deadline
  graded    // Teacher graded
  returned  // Feedback provided
}

enum ForumType {
  general       // Open discussion
  assignment    // Assignment-specific Q&A
  qa            // General course Q&A
  announcements // Instructor announcements
}

enum NotificationType {
  assignment_published
  assignment_deadline
  assignment_graded
  enrollment_confirmed
  announcement
  forum_reply
  forum_mention
  course_started
  course_completed
  grade_updated
  resource_published
}

enum NotificationChannel {
  in_app // In-application notifications
  email  // Email notifications
  push   // Push notifications
}
```

## Business Rules & Constraints

### Validation Rules (Should be implemented in application layer or triggers)

1. **Date Constraints**:
   - CourseInstance: `endDate > startDate`
   - PublishedAssignment: `deadline >= publishAt`
   - PublishedAssignment: `lateDeadline >= deadline` (if set)

2. **Grade Constraints**:
   - SubmissionGrade: `pointsAwarded <= maxPoints`
   - Submission: `totalPoints = SUM(submissionGrades.pointsAwarded)`
   - AssignmentTemplate: `SUM(gradingCriteria.maxPoints) == maxPoints`

3. **Enrollment Constraints**:
   - Cannot enroll if `CourseInstance.enrollmentOpen = false`
   - Cannot exceed `CourseInstance.enrollmentLimit`
   - Cannot enroll in course with status `archived`

4. **Submission Constraints**:
   - Only one submission per (student, assignment)
   - `isLate = true` if `submittedAt > deadline`
   - Cannot submit if `PublishedAssignment.status = closed`

5. **Resource Validation**:
   - ResourceTemplate must have either `url` OR `filePath` (not both)
   - `resourceType` should match file extension or URL protocol

### Cascade Delete Strategy

```
User deletion:
  ✓ CASCADE: UserRole, TeacherProfile, StudentProfile
  ✓ CASCADE: Notifications, NotificationSettings
  ✓ CASCADE: ForumPost, ForumComment, Reactions
  ✓ SET NULL: Course.createdBy, CourseInstance.createdBy
  
CourseInstance deletion:
  ✓ CASCADE: Enrollments, PublishedAssignments, Forums
  ⚠️ Consider: Archive instead of delete for historical records

PublishedAssignment deletion:
  ✓ CASCADE: Submissions, PublishedGradingCriteria
  ⚠️ Consider: Prevent deletion if submissions exist

ForumPost deletion:
  ✓ CASCADE: ForumComments, PostReactions
```

## Query Examples

### Common Queries

```typescript
// Get student's active courses with enrollment status
SELECT ci.*, e.status, e.finalGrade
FROM course_instances ci
JOIN enrollments e ON e.instance_id = ci.id
WHERE e.student_id = $studentId
  AND ci.status = 'active'
ORDER BY ci.start_date DESC;

// Get all ungraded submissions for an assignment
SELECT s.*, u.first_name, u.last_name, u.email
FROM submissions s
JOIN users u ON u.id = s.student_id
WHERE s.published_assignment_id = $assignmentId
  AND s.status IN ('submitted', 'late')
ORDER BY s.submitted_at ASC;

// Get course roster with final grades
SELECT u.id, u.first_name, u.last_name, u.email,
       e.status, e.final_grade, e.final_letter
FROM enrollments e
JOIN users u ON u.id = e.student_id
WHERE e.instance_id = $instanceId
  AND e.status != 'dropped'
ORDER BY u.last_name, u.first_name;

// Calculate student's current grade in course
SELECT 
  pa.title,
  pa.weight_percentage,
  s.final_points,
  (s.final_points / pa.max_points * pa.weight_percentage) as weighted_score
FROM submissions s
JOIN published_assignments pa ON pa.id = s.published_assignment_id
WHERE s.student_id = $studentId
  AND pa.instance_id = $instanceId
  AND s.status = 'graded';

// Get forum posts with reply count and latest activity
SELECT 
  fp.*,
  COUNT(fc.id) as comment_count,
  MAX(fc.created_at) as last_activity
FROM forum_posts fp
LEFT JOIN forum_comments fc ON fc.post_id = fp.id
WHERE fp.forum_id = $forumId
GROUP BY fp.id
ORDER BY fp.is_pinned DESC, last_activity DESC;
```

## Future Enhancements

### Potential Additions

1. **Attendance Tracking**:
   - `Attendance` table with date, status (present/absent/late)
   - Link to CourseInstance and Student

2. **Grade Scales**:
   - `GradeScale` table for custom letter grade mappings
   - Link to CourseInstance or Course

3. **Assignment Groups**:
   - Group assignments by category (Homework 30%, Projects 40%, etc.)
   - Weighted calculations per group

4. **Peer Review**:
   - `PeerReview` table
   - Students can review other students' work

5. **Content Versioning**:
   - Track changes to course content over time
   - Restore previous versions

6. **Analytics Tables**:
   - Materialized views for performance
   - Pre-calculated statistics

7. **File Management**:
   - Dedicated `File` table with metadata
   - Storage location, size, MIME type

8. **Calendar Integration**:
   - `CalendarEvent` table
   - Link assignments, lectures, office hours

## Performance Considerations

### Optimization Tips

1. **Pagination**: Always use LIMIT/OFFSET for large result sets
2. **Eager Loading**: Use JOIN for related data to avoid N+1 queries
3. **Computed Fields**: Consider caching calculated values (totalPoints, finalGrade)
4. **Archiving**: Move old course instances to separate archive tables
5. **Indexes**: Monitor slow queries and add indexes as needed
6. **Materialized Views**: For complex reporting queries

### Scalability Notes

- **Partitioning**: Consider partitioning submissions and notifications by date
- **Sharding**: Can shard by institution/organization if multi-tenant
- **Read Replicas**: Use for reporting and analytics queries
- **Caching**: Cache course instances, published assignments, user roles

---

**Schema Complexity**: 🟢 Medium  
**Normalization Level**: 🟢 3NF (Third Normal Form)  
**Recommended for**: Small to medium educational institutions (100-10,000 students)

*Last updated: December 9, 2025*
