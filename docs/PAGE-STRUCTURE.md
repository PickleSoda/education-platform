# Page Structure & User Flows

This document outlines the visual structure and user flows for course management, instances, and assignments in the Argus education platform.

---

## 📚 Course Routes

### 1. Course Catalog (Public/Student View)

**Route:** `/courses`

**Purpose:** Browse and discover available courses

**Visual Layout:**

- **Header Section**
  - Search bar with filters (tags, credits, semester)
  - Sort dropdown (by title, code, credits, popularity)
  - View toggle (grid/list view)

- **Filter Sidebar**
  - Tags (checkboxes with color indicators)
  - Credits range slider
  - Lecturer filter
  - "Show archived courses" toggle

- **Course Grid/List**
  - Each course card displays:
    - Course code and title
    - Short description (truncated)
    - Credits badge
    - Tags (colored chips)
    - "View Details" button
    - "Currently available" indicator for active instances
    - Enrollment status badge (if enrolled)

**User Actions:**

- Search and filter courses
- Click course card → Navigate to Course Details
- View course statistics (number of instances, enrollments)

---

### 2. Course Details (Public/Student View)

**Route:** `/courses/:courseId`

**Purpose:** View detailed course information and join available instances

**Visual Layout:**

- **Hero Section**
  - Course title and code
  - Credits badge
  - Tags
  - Primary lecturer info
  - "Enroll" or "Already Enrolled" button (context-aware)

- **Course Information Tabs**
  - **Overview Tab**
    - Full description
    - Learning objectives
    - Prerequisites
    - Typical duration
  - **Lecturers Tab**
    - List of all lecturers
    - Primary lecturer highlighted
    - Contact information
    - Office hours (if available)
  - **Instances Tab**
    - List of available instances
    - For each instance:
      - Semester badge
      - Start/end dates
      - Status indicator (scheduled, active, completed)
      - Enrollment info (X/Y enrolled, "Full" badge)
      - "Join Instance" button (if enrollment open)
      - "View Instance" button (if already enrolled)
  - **Assignments Tab** (Preview of templates)
    - Overview of grading structure
    - Assignment types breakdown (homework %, quiz %, projects %)
    - Total weight distribution chart

**User Actions:**

- Enroll in available instances
- View instance details
- Bookmark/favorite course
- Share course link

---

### 3. Manage Courses (Admin/Teacher View)

**Route:** `/management/courses`

**Purpose:** CRUD operations for course management

**Visual Layout:**

- **Header Section**
  - "Create New Course" button (prominent)
  - Search bar
  - Filter dropdown (my courses, all courses, archived)
  - Bulk actions toolbar (when items selected)

- **Course Management Table**
  - Columns:
    - Checkbox (for bulk selection)
    - Course Code
    - Title
    - Credits
    - Tags (pills)
    - Instances count
    - Status (active/archived badge)
    - Actions dropdown (Edit, Archive, Copy, Delete, View Details)
  - Pagination controls
  - Items per page selector

- **Quick Actions Panel** (right sidebar)
  - Recent activity feed
  - Quick stats (total courses, active instances, enrollment summary)
  - Shortcuts to common tasks

**User Actions:**

- Create new course
- Edit course details
- Archive/unarchive courses
- Copy course template
- Delete course (with confirmation)
- View detailed course management page

---

### 4. Manage Course Details (Admin/Teacher View)

**Route:** `/management/courses/edit/:courseId` or `/management/courses/create`

**Purpose:** Comprehensive course management interface

**Visual Layout:**

- **Header Section**
  - Course title and code (editable inline)
  - Action buttons: "Save Changes", "Archive", "View Public Page"
  - Status indicator

- **Tabbed Management Interface**

  #### **Basic Info Tab**
  - Editable form fields:
    - Course code
    - Title
    - Description (rich text editor)
    - Credits
    - Typical duration
  - "Save" and "Cancel" buttons

  #### **Tags Tab**
  - **Current Tags Section**
    - List of assigned tags (removable chips)
    - Color-coded tags
  - **Add Tags Section**
    - Tag search/autocomplete
    - "Create New Tag" button
    - Color picker for new tags
    - Recently used tags

  #### **Lecturers Tab**
  - **Current Lecturers List**
    - Each lecturer card shows:
      - Name and email
      - Primary lecturer badge
      - "Set as Primary" button
      - "Remove" button
  - **Add Lecturer Section**
    - User search (teachers only)
    - Role selector (primary/assistant)
    - "Add Lecturer" button

  #### **Assignment Templates Tab**
  - **Grading Structure Overview**
    - Visual weight distribution chart
    - Total weight indicator (should equal 100%)
    - Total max points summary
  - **Assignment List**
    - Draggable list (for reordering)
    - Each assignment card:
      - Title and type badge
      - Points/weight display
      - Grading mode indicator
      - Quick actions (Edit, Copy, Delete)
    - "Create New Assignment" button
  - **Assignment Template Modal/Page**
    - Form fields:
      - Title
      - Description
      - Assignment type dropdown
      - Grading mode toggle (points/pass-fail)
      - Max points
      - Weight percentage
      - Default duration (days)
      - Instructions (rich text)
    - **Grading Criteria Section**
      - List of criteria (draggable)
      - Each criterion: name, description, max points
      - Points validation (sum must equal max points)
      - "Add Criterion" button

  #### **Instances Tab**
  - **Quick Actions**
    - "Create New Instance" button
    - Filter by semester/status
  - **Instances List**
    - Each instance card:
      - Semester badge
      - Date range
      - Status with color coding
      - Enrollment stats (enrolled/limit)
      - Quick actions (Edit, Clone, View, Archive)
      - "Publish Assignment" quick button
  - **Create Instance Modal**
    - Semester selector
    - Start/end date pickers
    - Enrollment limit
    - Enrollment open toggle
    - Lecturer assignment
    - "Copy from template" option
    - "Create" button

  #### **Statistics Tab**
  - Dashboard-style layout:
    - Total instances chart
    - Enrollment trends graph
    - Assignment completion rates
    - Student performance overview
    - Resource usage stats

**User Actions:**

- Edit all course details
- Manage tags (add, remove, create)
- Manage lecturers (add, remove, set primary)
- Create/edit/delete assignment templates
- Manage grading criteria
- Create/edit/clone instances
- View comprehensive statistics

---

### 5. My Courses (Student View)

**Route:** `/my/courses` or `/dashboard/courses`

**Purpose:** View all enrolled courses

**Visual Layout:**

- **Header Section**
  - Page title "My Courses"
  - Filter tabs: "All", "Active", "Completed", "Dropped"
  - Sort dropdown (by semester, course code, recent activity)

- **Course Cards Grid**
  - Each card displays:
    - Course code and title
    - Semester badge
    - Progress ring/bar (assignment completion %)
    - Current grade (if available)
    - Next deadline indicator
    - "Go to Course" button
    - Status badge (enrolled, completed, dropped)
  - Empty state if no courses enrolled

- **Sidebar Panel**
  - **Upcoming Deadlines**
    - List of next 5 deadlines across all courses
    - Color-coded by urgency
  - **Recent Grades**
    - Latest graded assignments
  - **Announcements**
    - Recent course announcements

**User Actions:**

- Navigate to specific course instance
- View assignment details
- Filter and sort courses
- Drop course (with confirmation)

---

### 6. My Courses (Teacher View)

**Route:** `/teacher/my-courses`

**Purpose:** View courses where user is a lecturer

**Visual Layout:**

- **Header Section**
  - Page title "My Teaching Courses"
  - "Create New Course" button
  - Filter by semester/status

- **Course Cards Grid**
  - Each card displays:
    - Course code and title
    - All associated instances (collapsed/expandable)
    - For each instance:
      - Semester and dates
      - Enrollment count
      - Pending submissions badge
      - Pending grading badge
      - "Manage Instance" button
    - "Manage Course" button
    - Primary lecturer badge (if applicable)

- **Quick Stats Dashboard**
  - Total students across all courses
  - Pending grading count
  - Upcoming deadlines
  - Recent activity feed

**User Actions:**

- Navigate to course management
- Navigate to instance management
- View pending grading queue
- Access gradebook
- Bulk grade assignments

---

## 🎓 Course Instance Routes

### 7. Instance Details (Student View)

**Route:** `/instances/:instanceId`

**Purpose:** Access all instance-specific content and activities

**Visual Layout:**

- **Header Section**
  - Course title and code
  - Semester badge
  - Instance status
  - Enrolled indicator
  - "Drop Course" button (if applicable)

- **Navigation Tabs**
  - **Home Tab**
    - Instance announcements
    - Upcoming events calendar
    - Quick links (syllabus, assignments, forums)
    - Recent activity feed
    - Current grade widget
  - **Assignments Tab**
    - List of all published assignments
    - Each assignment card:
      - Title and type badge
      - Points/weight
      - Status (not started, in progress, submitted, graded)
      - Deadline with countdown
      - Grade (if available)
      - "View/Submit" button
    - Filter: All, Upcoming, Overdue, Completed
    - Sort: By deadline, by weight, by status
  - **Grades Tab**
    - Grade summary card (current total)
    - Weight distribution chart
    - Assignment grades table:
      - Assignment name
      - Type
      - Score
      - Max points
      - Weight
      - Status
      - Feedback link
    - Grade prediction calculator
  - **Resources Tab**
    - Organized by week/topic
    - File browser interface
    - Each resource:
      - Title and type icon
      - Upload date
      - File size
      - Download button
      - Preview (if applicable)
  - **Forums Tab**
    - Forum list (General, Q&A, Assignments, Announcements)
    - Each forum:
      - Recent posts preview
      - Unread count badge
      - "View Forum" button
  - **People Tab**
    - **Lecturers Section**
      - Lecturer cards with contact info
    - **Students Section**
      - Searchable student list
      - Profile pictures
      - Contact buttons (if enabled)

**User Actions:**

- Submit assignments
- View grades and feedback
- Access resources
- Participate in forums
- View classmates and lecturers
- Drop course

---

### 8. Manage Instances (Admin/Teacher View)

**Route:** `/management/instances`

**Purpose:** View and manage all course instances

**Visual Layout:**

- **Header Section**
  - "Create New Instance" button (prominent)
  - Search bar (search by course code, title, semester)
  - Filter dropdowns:
    - Status filter (all, draft, scheduled, active, completed, archived)
    - Semester filter
    - Course filter
  - Bulk actions toolbar (when items selected)

- **Instance Management Table**
  - Columns:
    - Checkbox (for bulk selection)
    - Course Code
    - Course Title
    - Semester
    - Start Date
    - End Date
    - Status (color-coded badge)
    - Enrollment (X/Y with progress bar)
    - Lecturers (avatar group)
    - Actions dropdown (Edit, Clone, View, Archive, Delete)
  - Pagination controls
  - Items per page selector
  - Sort by any column

- **Quick Filters Chips**
  - "My Instances" (show only where user is lecturer)
  - "Active Instances"
  - "Enrollment Open"
  - "Needs Attention" (low enrollment, no assignments published, etc.)

- **Quick Stats Panel** (top or sidebar)
  - Total instances
  - Active instances count
  - Total enrollments across all instances
  - Instances requiring action

**User Actions:**

- Create new instance
- Edit instance details
- Clone instance for new semester
- View instance management page
- Archive/delete instances
- Bulk status updates
- Export instance list

---

### 9. Instance Management (Teacher/Admin View)

**Route:** `/management/instances/:instanceId` or `/management/instances/create`

**Purpose:** Manage all aspects of a course instance

**Visual Layout:**

- **Header Section**
  - Course title and semester
  - Status dropdown (with status workflow)
  - "View Student View" button
  - Action buttons: "Publish Assignment", "Upload Resource", "Create Announcement"

- **Management Tabs**

  #### **Dashboard Tab**
  - **Quick Stats Cards**
    - Total enrollments
    - Pending submissions
    - Pending grading
    - Forum activity
  - **Activity Timeline**
    - Recent submissions
    - Recent posts
    - Grade distributions
  - **Alerts Panel**
    - Students at risk
    - Overdue assignments
    - System notifications

  #### **Enrollments Tab**
  - **Enrollment Controls**
    - Toggle enrollment open/closed
    - Set enrollment limit
    - "Enroll Student" button (manual add)
  - **Student List Table**
    - Columns:
      - Student name and email
      - Enrollment date
      - Status dropdown (enrolled, dropped, completed, failed)
      - Current grade
      - Submission rate
      - Last active
      - Actions (View Profile, Message, Remove)
    - Search and filter
    - Export to CSV
    - Bulk actions

  #### **Assignments Tab**
  - **Published Assignments List**
    - Each assignment card:
      - Title and template indicator
      - Status badge (draft, scheduled, published, closed)
      - Deadline and late deadline
      - Submission stats (X/Y submitted)
      - Grading progress bar
      - Actions (Edit, View Submissions, Grade, Close, Delete)
  - **Publish New Assignment Section**
    - Template selector (from course templates)
    - Deadline picker
    - Late submission settings
    - Auto-publish scheduler
    - "Publish" button
  - **Assignment Templates Link**
    - Quick access to manage course-level templates

  #### **Resources Tab**
  - **Resource Library**
    - Folder tree structure
    - Upload area (drag & drop)
    - Bulk upload
    - Each resource:
      - File name and type
      - Upload date
      - Visibility toggle (published/draft)
      - Actions (Edit, Download, Delete, Move)

  #### **Forums Tab**
  - **Forum Management**
    - List of forums
    - Create new forum button
    - Each forum:
      - Title and type
      - Post count
      - Sort order (draggable)
      - Settings (Edit, Delete, Pin posts)
  - **Moderation Tools**
    - Flagged posts queue
    - Pin/unpin posts
    - Lock/unlock threads

  #### **Grades Tab**
  - **Gradebook Interface**
    - Spreadsheet-style layout
    - Rows: Students
    - Columns: Assignments + Total
    - Inline editing
    - Formula support
    - Color coding (below threshold)
  - **Grade Actions**
    - Export grades
    - Curve grades
    - Drop lowest score
    - Extra credit assignment
    - Grade statistics view

  #### **Settings Tab**
  - Instance-specific settings:
    - Semester and dates
    - Enrollment settings
    - Grading policies
    - Late submission policies
    - Forum settings
    - Notification preferences
  - **Danger Zone**
    - Archive instance
    - Delete instance (admin only)

**User Actions:**

- Manage student enrollments
- Publish and manage assignments
- Grade submissions
- Upload and organize resources
- Moderate forums
- Update instance settings
- View comprehensive analytics

---

### 10. Ongoing Courses (Student Dashboard)

**Route:** `/dashboard` or `/home`

**Purpose:** Quick overview of all active course instances

**Visual Layout:**

- **Header Section**
  - Welcome message with user name
  - Current semester indicator
  - Quick stats (enrolled courses, pending assignments, upcoming deadlines)

- **Active Courses Grid**
  - Compact course cards showing:
    - Course code and title
    - Semester
    - Progress bar (completion %)
    - Current grade indicator
    - Next deadline (highlighted)
    - Unread announcements badge
    - "Go to Course" button

- **Upcoming Deadlines Widget**
  - Chronological list of next 10 deadlines
  - Each item:
    - Course code
    - Assignment title
    - Deadline date/time
    - Time remaining (color-coded)
    - Quick "Submit" link

- **Recent Activity Feed**
  - New grades posted
  - New assignments published
  - Forum mentions
  - Announcements

- **Quick Actions Panel**
  - "Browse Courses" button
  - "View All Grades" button
  - Calendar view toggle

**User Actions:**

- Navigate to specific courses
- Quick access to assignments
- View calendar of all deadlines
- Check recent activity

---

## 📝 Assignment Routes

### 11. Assignment Submission (Student View)

**Route:** `/my-courses/:instanceId/assignments/:assignmentId`

**Purpose:** View assignment details and submit work

**Visual Layout:**

- **Header Section**
  - Assignment title and type badge
  - Course code and semester
  - Breadcrumb navigation
  - Status badge (not started, in progress, submitted, graded)

- **Assignment Details Card**
  - **Instructions Section**
    - Full description (rich text)
    - Detailed instructions
    - Attached files (downloadable)
    - Grading criteria table
      - Criterion name and description
      - Max points
  - **Metadata Section**
    - Published date
    - Deadline with countdown timer
    - Late deadline (if applicable)
    - Late penalty percentage
    - Max points and weight
    - Grading mode

- **Submission Section**
  - **If Not Submitted:**
    - File upload area (drag & drop)
    - Text editor (if text submission)
    - "Save Draft" button
    - "Submit" button (with confirmation)
  - **If Submitted:**
    - Submission timestamp
    - Submitted files (with download links)
    - "Resubmit" button (if before deadline)
    - Submission history (all attempts)

- **Grading Section** (if graded)
  - Total score badge (large, prominent)
  - Breakdown by criteria:
    - Criterion name
    - Points earned / max points
    - Feedback comments
  - Overall feedback (from instructor)
  - "Request Regrade" button (if enabled)

**User Actions:**

- Download assignment materials
- Upload submission files
- Save draft submissions
- Submit assignment
- View submission history
- View grades and feedback

---

### 12. Assignment Grading (Teacher View)

**Route:** `/teacher/instances/:instanceId/assignments/:assignmentId/grade`

**Purpose:** Grade student submissions

**Visual Layout:**

- **Header Section**
  - Assignment title
  - Course and semester
  - Submission stats (X/Y submitted, Y pending grade)
  - Action buttons: "Export Grades", "Download All Submissions"

- **Submission List Sidebar**
  - Searchable/filterable student list
  - Each student item:
    - Student name
    - Submission status icon
    - Grade indicator (if graded)
    - Late badge (if applicable)
  - Filter: All, Submitted, Not Submitted, Graded, Pending
  - Sort: By name, submission time, grade

- **Grading Interface** (main content)
  - **Student Info Header**
    - Student name and email
    - Submission timestamp
    - Late penalty indicator
    - Previous/Next student navigation
  - **Submission Viewer**
    - Submitted files (viewer/download)
    - Embedded document viewer (if supported)
    - Side-by-side comparison (if resubmission)
  - **Grading Form**
    - Grading criteria checklist/table:
      - Each criterion row:
        - Name and description
        - Points input (with max validation)
        - Feedback text area
    - Total points calculator (auto-sum)
    - Overall feedback text area (rich text)
    - "Save Draft" button
    - "Submit Grade" button
  - **Quick Actions**
    - Copy grade from previous submission
    - Apply rubric template
    - Flag for review
    - Request plagiarism check

**User Actions:**

- View all submissions
- Grade individual submissions
- Provide feedback per criterion
- Save and submit grades
- Batch grade similar submissions
- Export grades to CSV

---

## 🔄 User Flows

### Student Enrollment Flow

1. Student browses **Course Catalog** → Filters/searches for course
2. Clicks course card → **Course Details** page
3. Views **Instances Tab** → Finds active instance with open enrollment
4. Clicks "Join Instance" → Confirmation modal → Enrolled
5. Redirected to **Instance Details** (Home Tab)
6. Instance now appears in **My Courses** and **Ongoing Courses**

### Teacher Course Creation Flow

1. Teacher navigates to **Manage Courses**
2. Clicks "Create New Course" → Course creation form
3. Fills basic info → Saves course
4. Redirected to **Manage Course Details**
5. Adds tags in **Tags Tab**
6. Creates assignment templates in **Assignments Tab**
   - Defines grading criteria for each
   - Ensures weight totals 100%
7. Navigates to **Instances Tab** → Creates new instance
8. Publishes assignments from templates with deadlines
9. Toggles enrollment open
10. Course now visible in **Course Catalog**

### Assignment Submission Flow

1. Student views **Ongoing Courses** → Sees upcoming deadline
2. Clicks course → **Instance Details** → **Assignments Tab**
3. Clicks assignment → **Assignment Submission** page
4. Reviews instructions and grading criteria
5. Uploads files / Enters text
6. Saves draft (optional)
7. Clicks "Submit" → Confirmation → Submitted
8. Status changes to "Submitted" in assignments list

### Grading Flow

1. Teacher navigates to **Instance Management** → **Assignments Tab**
2. Clicks assignment → Views submission stats
3. Clicks "Grade" → **Assignment Grading** page
4. Selects student from sidebar
5. Reviews submission
6. Fills in points for each grading criterion
7. Provides overall feedback
8. Submits grade
9. Navigates to next student
10. After all graded → Student sees grade in **Grades Tab**

---

## 🎨 Design Notes

### Color Coding Conventions

- **Status Colors:**
  - Draft: Gray
  - Scheduled: Blue
  - Active: Green
  - Completed: Purple
  - Archived: Dark Gray
  - Closed: Red

- **Deadline Colors:**
  - More than 7 days: Green
  - 3-7 days: Yellow
  - 1-3 days: Orange
  - Less than 1 day: Red
  - Overdue: Dark Red

- **Grade Colors:**
  - A (90-100%): Green
  - B (80-89%): Light Green
  - C (70-79%): Yellow
  - D (60-69%): Orange
  - F (Below 60%): Red

### Responsive Considerations

- Mobile: Stack sidebars below main content
- Tablet: Side-by-side layout for lists and details
- Desktop: Full three-column layouts with sidebars

### Accessibility

- All actions keyboard navigable
- Screen reader labels for all icons
- High contrast mode support
- Focus indicators
- ARIA landmarks and roles

### Performance

- Lazy load course cards (infinite scroll)
- Paginate large lists (assignments, students)
- Cache frequently accessed data
- Optimize image loading
- Progressive disclosure (tabs, accordions)

---

## 📋 Summary

This document provides a comprehensive overview of all major pages and user flows in the Argus platform. Each route is designed with specific user roles in mind (student, teacher, admin) and includes detailed visual layouts and interaction patterns.

### Key Pages by Role

**Students:**

- Course Catalog
- Course Details (with join functionality)
- Ongoing Courses Dashboard
- My Courses
- Instance Details
- Assignment Submission

**Teachers:**

- Manage Courses
- Manage Course Details
- My Teaching Courses
- Instance Management
- Assignment Grading

**Admins:**

- All teacher pages plus additional permissions
- User management
- System configuration

This structure ensures a clear separation of concerns while maintaining consistent design patterns across the platform.
