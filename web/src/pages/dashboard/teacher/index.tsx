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
import InstanceCard from "../components/instance-card";

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

export default function TeacherDashboard() {
	const { push } = useRouter();
	const userInfo = useUserInfo();

	const { data, isLoading } = useQuery({
		queryKey: ["teacher-dashboard"],
		queryFn: () => dashboardService.getTeacherDashboard(),
	});

	const dashboardData = data?.data;

	const handleManageInstance = (instanceId: string) => {
		push(`/management/instance/${instanceId}`);
	};

	const handleManageCourse = (courseId: string) => {
		push(`/management/course/edit/${courseId}`);
	};

	const handleCreateCourse = () => {
		push("/management/course/create");
	};

	const handleAssignmentClick = (assignmentId: string, instanceId: string) => {
		push(`/management/instance/${instanceId}/assignments/${assignmentId}/grade`);
	};

	// Transform recent forum posts into activity items
	const activityItems: ActivityItem[] =
		dashboardData?.recentPosts.map((post) => ({
			id: post.id,
			type: "post" as const,
			title: post.title,
			description: post.content.substring(0, 100) + "...",
			timestamp: post.createdAt,
			courseCode: post.forum.instance.course.code,
			semester: post.forum.instance.semester,
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
					<h1 className="text-3xl font-bold">Welcome, {userInfo?.firstName || "Teacher"}! 👋</h1>
					<p className="text-text-secondary mt-1">Manage your teaching courses and student progress</p>
				</div>
				<Button onClick={handleCreateCourse}>
					<Icon icon="solar:add-circle-bold-duotone" size={20} className="mr-2" />
					Create New Course
				</Button>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<QuickStatsCard
					icon="solar:users-group-rounded-bold-duotone"
					title="Total Students"
					value={dashboardData?.quickStats.totalStudents || 0}
					variant="primary"
				/>
				<div onClick={() => push("/management/assignment?status=submitted")} className="cursor-pointer">
					<QuickStatsCard
						icon="solar:document-text-bold-duotone"
						title="Pending Grading"
						value={dashboardData?.quickStats.pendingGrading || 0}
						variant="warning"
						description={dashboardData?.quickStats.pendingGrading ? "submissions to grade" : "All caught up!"}
					/>
				</div>
				<QuickStatsCard
					icon="solar:book-bookmark-bold-duotone"
					title="Active Instances"
					value={dashboardData?.quickStats.activeInstances || 0}
					variant="success"
				/>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Teaching Courses */}
				<div className="lg:col-span-2 space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">My Teaching Courses</h2>
						<Button variant="outline" size="sm" onClick={() => push("/management/course")}>
							View All
						</Button>
					</div>
					{!dashboardData?.activeInstances || dashboardData.activeInstances.length === 0 ? (
						<div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
							<Icon icon="solar:book-bold-duotone" size={64} className="mx-auto mb-4 opacity-50 text-text-secondary" />
							<h3 className="text-lg font-medium mb-2">No Active Courses</h3>
							<p className="text-text-secondary mb-4">Create a course to start teaching</p>
							<Button onClick={handleCreateCourse}>
								<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
								Create New Course
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{dashboardData.activeInstances.map((instance) => {
								// Count deadlines for this instance
								const instanceDeadlines = dashboardData.upcomingDeadlines.filter(
									(a) => a.instanceId === instance.id
								).length;

								// For pending grading, we'd need more detailed data per instance
								// For now, showing 0 as we don't have per-instance breakdown
								const pendingGrading = 0;

								return (
									<InstanceCard
										key={instance.id}
										instance={instance}
										pendingGrading={pendingGrading}
										upcomingDeadlines={instanceDeadlines}
										onManageInstance={handleManageInstance}
										onManageCourse={handleManageCourse}
									/>
								);
							})}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Upcoming Deadlines */}
					<DeadlineWidget
						assignments={dashboardData?.upcomingDeadlines || []}
						onAssignmentClick={handleAssignmentClick}
					/>

					{/* Recent Activity */}
					<ActivityFeed
						items={activityItems}
						onItemClick={(item) => {
							// Navigate to forum post
							push(`/forums/${item.id}`);
						}}
					/>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-lg">
				<Button variant="outline" className="w-full" onClick={() => push("/management/course")}>
					<Icon icon="solar:book-bookmark-bold-duotone" size={20} className="mr-2" />
					Manage Courses
				</Button>
				<Button variant="outline" className="w-full" onClick={() => push("/management/instance")}>
					<Icon icon="solar:settings-bold-duotone" size={20} className="mr-2" />
					Manage Instances
				</Button>
				<Button variant="outline" className="w-full" onClick={() => push("/management/assignment")}>
					<Icon icon="solar:document-text-bold-duotone" size={20} className="mr-2" />
					Assignments
				</Button>
				<Button variant="outline" className="w-full" onClick={() => push("/analysis")}>
					<Icon icon="solar:chart-bold-duotone" size={20} className="mr-2" />
					Analytics
				</Button>
			</div>
		</div>
	);
}
