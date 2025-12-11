import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/ui/skeleton";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { useRouter } from "@/routes/hooks";
import { useUserInfo } from "@/store/userStore";
import dashboardService from "@/api/services/dashboardService";
import QuickStatsCard from "../components/quick-stats-card";
import DeadlineWidget from "../components/deadline-widget";
import ActivityFeed from "../components/activity-feed";
import CourseProgressCard from "../components/course-progress-card";

interface ActivityItem {
	id: string;
	type: "grade" | "post" | "assignment" | "announcement";
	title: string;
	description?: string;
	timestamp: string;
	courseCode?: string;
	semester?: string;
	metadata?: any;
}

export default function StudentDashboard() {
	const { push } = useRouter();
	const userInfo = useUserInfo();

	const { data, isLoading } = useQuery({
		queryKey: ["student-dashboard"],
		queryFn: () => dashboardService.getStudentDashboard(),
	});

	const dashboardData = data?.data;

	const handleCourseClick = (instanceId: string) => {
		push(`/my-courses/${instanceId}`);
	};

	const handleAssignmentClick = (assignmentId: string, instanceId: string) => {
		push(`/my-courses/${instanceId}/assignments/${assignmentId}`);
	};

	const handleBrowseCourses = () => {
		push("/courses");
	};

	// Transform recent grades into activity items
	const activityItems: ActivityItem[] =
		dashboardData?.recentGrades.map((submission) => ({
			id: submission.id,
			type: "grade" as const,
			title: submission.publishedAssignment.title,
			description: `Grade: ${submission.finalPoints || "-"}/${submission.publishedAssignment.maxPoints || "-"}`,
			timestamp: submission.gradedAt || submission.createdAt,
			courseCode: submission.publishedAssignment.instance.course.code,
			semester: submission.publishedAssignment.instance.semester,
		})) || [];

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-32 w-full" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-32 w-full" />
				</div>
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Welcome back, {userInfo?.firstName || "Student"}! 👋</h1>
					<p className="text-text-secondary mt-1">Here&apos;s your course overview for this semester</p>
				</div>
				<Button onClick={handleBrowseCourses}>
					<Icon icon="solar:magnifer-bold-duotone" size={20} className="mr-2" />
					Browse Courses
				</Button>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<QuickStatsCard
					icon="solar:book-bookmark-bold-duotone"
					title="Enrolled Courses"
					value={dashboardData?.quickStats.enrolledCourses || 0}
					variant="primary"
				/>
				<QuickStatsCard
					icon="solar:clipboard-list-bold-duotone"
					title="Pending Assignments"
					value={dashboardData?.quickStats.pendingAssignments || 0}
					variant="warning"
				/>
				<QuickStatsCard
					icon="solar:bell-bold-duotone"
					title="Notifications"
					value={dashboardData?.unreadNotifications || 0}
					variant="error"
				/>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Active Courses */}
				<div className="lg:col-span-2 space-y-6">
					<div>
						<h2 className="text-xl font-semibold mb-4">My Courses</h2>
						{!dashboardData?.enrollments || dashboardData.enrollments.length === 0 ? (
							<div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
								<Icon
									icon="solar:book-bold-duotone"
									size={64}
									className="mx-auto mb-4 opacity-50 text-text-secondary"
								/>
								<h3 className="text-lg font-medium mb-2">No Enrolled Courses</h3>
								<p className="text-text-secondary mb-4">Start learning by enrolling in a course</p>
								<Button onClick={handleBrowseCourses}>
									<Icon icon="solar:magnifer-bold-duotone" size={18} className="mr-2" />
									Browse Available Courses
								</Button>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{dashboardData.enrollments.map((enrollment) => {
									// Count deadlines for this course
									const courseDeadlines = dashboardData.upcomingAssignments.filter(
										(a) => a.instance.id === enrollment.instanceId
									).length;

									return (
										<CourseProgressCard
											key={enrollment.id}
											enrollment={enrollment}
											upcomingDeadlines={courseDeadlines}
											onViewCourse={handleCourseClick}
										/>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Upcoming Deadlines */}
					<DeadlineWidget
						assignments={dashboardData?.upcomingAssignments || []}
						onAssignmentClick={handleAssignmentClick}
					/>

					{/* Recent Activity */}
					<ActivityFeed items={activityItems} />
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-lg">
				<Button variant="outline" className="w-full" onClick={() => push("/courses")}>
					<Icon icon="solar:book-bookmark-bold-duotone" size={20} className="mr-2" />
					Browse Courses
				</Button>
				<Button variant="outline" className="w-full" onClick={() => push("/my-courses")}>
					<Icon icon="solar:clipboard-list-bold-duotone" size={20} className="mr-2" />
					View All Grades
				</Button>
				<Button variant="outline" className="w-full" onClick={() => push("/calendar")}>
					<Icon icon="solar:calendar-bold-duotone" size={20} className="mr-2" />
					View Calendar
				</Button>
			</div>
		</div>
	);
}
