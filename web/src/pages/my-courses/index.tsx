import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import enrollmentService from "@/api/services/enrollmentService";
import type { EnrollmentWithRelations } from "#/entity";
import { format } from "date-fns";
import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { useState } from "react";

type FilterStatus = "all" | "enrolled" | "completed" | "dropped";

export default function MyCoursesPage() {
	const navigate = useNavigate();
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

	const { data: enrollmentsData, isLoading } = useQuery({
		queryKey: ["my-enrollments"],
		queryFn: () => enrollmentService.getMyEnrollments(),
	});

	const enrollments: EnrollmentWithRelations[] = enrollmentsData?.data || [];

	const filteredEnrollments = enrollments.filter((enrollment) => {
		if (filterStatus === "all") return true;
		return enrollment.status === filterStatus;
	});

	const statusCounts = {
		all: enrollments.length,
		enrolled: enrollments.filter((e) => e.status === "enrolled").length,
		completed: enrollments.filter((e) => e.status === "completed").length,
		dropped: enrollments.filter((e) => e.status === "dropped").length,
	};

	const statusColors: Record<string, "success" | "warning" | "error" | "default"> = {
		enrolled: "success",
		completed: "warning",
		dropped: "error",
	};

	const instanceStatusColors: Record<string, "default" | "info" | "success" | "warning" | "error"> = {
		draft: "default",
		scheduled: "info",
		active: "success",
		completed: "warning",
		archived: "error",
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<Skeleton className="h-10 w-48" />
					<Skeleton className="h-10 w-32" />
				</div>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-64 w-full" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">My Courses</h1>
					<p className="text-text-secondary mt-1">View and manage your enrolled courses</p>
				</div>
				<Button onClick={() => navigate("/courses")}>
					<Icon icon="solar:magnifer-bold-duotone" size={20} className="mr-2" />
					Browse Courses
				</Button>
			</div>

			{/* Quick Stats */}
			<div className="grid gap-4 grid-cols-2 md:grid-cols-4">
				<Card>
					<CardContent className="p-4 flex items-center gap-4">
						<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
							<Icon icon="solar:book-bold-duotone" size={24} className="text-primary" />
						</div>
						<div>
							<p className="text-2xl font-bold">{statusCounts.all}</p>
							<p className="text-sm text-text-secondary">Total Courses</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 flex items-center gap-4">
						<div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
							<Icon icon="solar:play-circle-bold-duotone" size={24} className="text-green-500" />
						</div>
						<div>
							<p className="text-2xl font-bold">{statusCounts.enrolled}</p>
							<p className="text-sm text-text-secondary">Active</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 flex items-center gap-4">
						<div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
							<Icon icon="solar:check-circle-bold-duotone" size={24} className="text-yellow-500" />
						</div>
						<div>
							<p className="text-2xl font-bold">{statusCounts.completed}</p>
							<p className="text-sm text-text-secondary">Completed</p>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 flex items-center gap-4">
						<div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
							<Icon icon="solar:close-circle-bold-duotone" size={24} className="text-red-500" />
						</div>
						<div>
							<p className="text-2xl font-bold">{statusCounts.dropped}</p>
							<p className="text-sm text-text-secondary">Dropped</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filter Tabs */}
			<Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as FilterStatus)}>
				<TabsList>
					<TabsTrigger value="all">
						All
						<Badge variant="outline" className="ml-2">
							{statusCounts.all}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="enrolled">
						Active
						<Badge variant="outline" className="ml-2">
							{statusCounts.enrolled}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="completed">
						Completed
						<Badge variant="outline" className="ml-2">
							{statusCounts.completed}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="dropped">
						Dropped
						<Badge variant="outline" className="ml-2">
							{statusCounts.dropped}
						</Badge>
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{/* Course Cards */}
			{filteredEnrollments.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-16">
						<Icon icon="solar:notebook-bold-duotone" size={64} className="text-text-secondary opacity-50 mb-4" />
						<h3 className="text-lg font-medium mb-2">
							{filterStatus === "all" ? "No courses yet" : `No ${filterStatus} courses`}
						</h3>
						<p className="text-text-secondary mb-4">
							{filterStatus === "all"
								? "You haven't enrolled in any courses yet. Browse our catalog to get started!"
								: `You don't have any courses with status "${filterStatus}".`}
						</p>
						{filterStatus === "all" && (
							<Button onClick={() => navigate("/courses")}>
								<Icon icon="solar:magnifer-bold-duotone" size={20} className="mr-2" />
								Browse Courses
							</Button>
						)}
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{filteredEnrollments.map((enrollment) => {
						const course = enrollment.instance?.course;
						const instance = enrollment.instance;

						return (
							<Card key={enrollment.id} className="hover:shadow-md transition-shadow">
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1 flex-wrap">
												{course && (
													<Badge variant="outline" className="text-xs">
														{course.code}
													</Badge>
												)}
												<Badge variant={statusColors[enrollment.status] || "default"} className="text-xs">
													{enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
												</Badge>
											</div>
											<h3 className="font-semibold text-lg truncate">{course?.title || "Unknown Course"}</h3>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Course Description */}
									{course?.description && (
										<p className="text-sm text-text-secondary line-clamp-2">{course.description}</p>
									)}

									{/* Instance Info */}
									{instance && (
										<div className="space-y-2 text-sm">
											<div className="flex items-center justify-between">
												<span className="text-text-secondary">Semester</span>
												<span className="font-medium">{instance.semester}</span>
											</div>
											{instance.startDate && instance.endDate && (
												<div className="flex items-center justify-between">
													<span className="text-text-secondary">Duration</span>
													<span className="font-medium text-xs">
														{format(new Date(instance.startDate), "MMM dd")} -{" "}
														{format(new Date(instance.endDate), "MMM dd, yyyy")}
													</span>
												</div>
											)}
											<div className="flex items-center justify-between">
												<span className="text-text-secondary">Status</span>
												<Badge variant={instanceStatusColors[instance.status] || "default"} className="text-xs">
													{instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
												</Badge>
											</div>
											{course?.credits && (
												<div className="flex items-center justify-between">
													<span className="text-text-secondary">Credits</span>
													<span className="font-medium">{course.credits}</span>
												</div>
											)}
										</div>
									)}

									{/* Enrollment Info */}
									<div className="pt-2 border-t space-y-2 text-sm">
										<div className="flex items-center justify-between">
											<span className="text-text-secondary">Enrolled</span>
											<span className="font-medium">{format(new Date(enrollment.enrolledAt), "MMM dd, yyyy")}</span>
										</div>
										{enrollment.finalGrade !== null && (
											<div className="flex items-center justify-between">
												<span className="text-text-secondary">Final Grade</span>
												<Badge variant="info" className="text-sm font-bold">
													{enrollment.finalGrade}%
												</Badge>
											</div>
										)}
									</div>

									{/* Actions */}
									<div className="flex gap-2 pt-2">
										{enrollment.status === "enrolled" && instance && (
											<Button className="flex-1" onClick={() => navigate(`/my-courses/${instance.id}`)}>
												<Icon icon="solar:arrow-right-bold-duotone" size={18} className="mr-2" />
												Go to Course
											</Button>
										)}
										{enrollment.status === "completed" && instance && (
											<Button
												variant="outline"
												className="flex-1"
												onClick={() => navigate(`/my-courses/${instance.id}`)}
											>
												<Icon icon="solar:eye-bold-duotone" size={18} className="mr-2" />
												View Course
											</Button>
										)}
										{enrollment.status === "dropped" && course && (
											<Button variant="ghost" className="flex-1" onClick={() => navigate(`/courses/${course.id}`)}>
												<Icon icon="solar:restart-bold-duotone" size={18} className="mr-2" />
												Re-enroll
											</Button>
										)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
