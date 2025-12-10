import { useParams, useRouter } from "@/routes/hooks";
import { Card } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import courseService from "@/api/services/courseService";
import assignmentService from "@/api/services/assignmentService";
import courseInstanceService from "@/api/services/courseInstanceService";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Skeleton } from "@/ui/skeleton";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { TagsTab } from "./tabs/tags-tab";
import { LecturersTab } from "./tabs/lecturers-tab";
import { AssignmentsTab } from "./tabs/assignments-tab";
import { InstancesTab } from "./tabs/instances-tab";
import { StatisticsTab } from "./tabs/statistics-tab";

export default function CourseManagementDetails() {
	const { id } = useParams();
	const { push } = useRouter();
	const isCreateMode = id === "create";

	// Fetch course data
	const { data: courseData, isLoading: courseLoading } = useQuery({
		queryKey: ["course", id],
		queryFn: () => courseService.getCourseById(id as string),
		enabled: !isCreateMode && !!id,
	});

	// Fetch assignment templates
	const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
		queryKey: ["assignments", id],
		queryFn: () => assignmentService.getAssignmentTemplates(id as string),
		enabled: !isCreateMode && !!id,
	});

	// Fetch instances
	const { data: instancesData, isLoading: instancesLoading } = useQuery({
		queryKey: ["instances", id],
		queryFn: () => courseInstanceService.getInstances({ courseId: id as string }),
		enabled: !isCreateMode && !!id,
	});

	// Fetch course stats
	const { data: statsData, isLoading: statsLoading } = useQuery({
		queryKey: ["courseStats", id],
		queryFn: () => courseService.getCourseStats(id as string),
		enabled: !isCreateMode && !!id,
	});

	const course = courseData?.data;
	const assignments = assignmentsData?.data || [];
	const instances = instancesData?.data || [];
	const stats = statsData?.data;

	if (courseLoading && !isCreateMode) {
		return (
			<Card className="p-6">
				<div className="space-y-4">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</Card>
		);
	}

	if (!course && !isCreateMode) {
		return (
			<Card className="p-6">
				<div className="text-center">
					<Icon icon="solar:file-remove-bold-duotone" size={48} className="mx-auto text-text-secondary mb-4" />
					<h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
					<p className="text-text-secondary mb-4">{"The course you're looking for doesn't exist."}</p>
					<Button onClick={() => push("/management/courses")}>Back to Courses</Button>
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => push("/management/courses")}>
							<Icon icon="solar:arrow-left-line-duotone" size={20} />
						</Button>
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-2xl font-bold">{course?.code || "New Course"}</h1>
								{course && (
									<Badge variant={course.isArchived ? "error" : "success"}>
										{course.isArchived ? "Archived" : "Active"}
									</Badge>
								)}
							</div>
							<p className="text-sm text-text-secondary mt-1">{course?.title || "Create a new course"}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{course && (
							<>
								<Button variant="outline" onClick={() => push(`/courses/${course.id}`)}>
									<Icon icon="solar:eye-bold-duotone" size={18} className="mr-2" />
									View Public Page
								</Button>
								<Button variant={course.isArchived ? "default" : "outline"}>
									<Icon
										icon={course.isArchived ? "solar:inbox-unarchive-bold-duotone" : "solar:inbox-archive-bold-duotone"}
										size={18}
										className="mr-2"
									/>
									{course.isArchived ? "Unarchive" : "Archive"}
								</Button>
							</>
						)}
					</div>
				</div>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="basic" className="w-full">
				<Card className="p-2">
					<TabsList className="w-full justify-start">
						<TabsTrigger value="basic">
							<Icon icon="solar:document-bold-duotone" size={18} className="mr-2" />
							Basic Info
						</TabsTrigger>
						{!isCreateMode && (
							<>
								<TabsTrigger value="tags">
									<Icon icon="solar:tag-bold-duotone" size={18} className="mr-2" />
									Tags
								</TabsTrigger>
								<TabsTrigger value="lecturers">
									<Icon icon="solar:users-group-rounded-bold-duotone" size={18} className="mr-2" />
									Lecturers
								</TabsTrigger>
								<TabsTrigger value="assignments">
									<Icon icon="solar:document-text-bold-duotone" size={18} className="mr-2" />
									Assignments
									{assignments.length > 0 && (
										<Badge variant="outline" className="ml-2">
											{assignments.length}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="instances">
									<Icon icon="solar:calendar-bold-duotone" size={18} className="mr-2" />
									Instances
									{instances.length > 0 && (
										<Badge variant="outline" className="ml-2">
											{instances.length}
										</Badge>
									)}
								</TabsTrigger>
								<TabsTrigger value="statistics">
									<Icon icon="solar:chart-bold-duotone" size={18} className="mr-2" />
									Statistics
								</TabsTrigger>
							</>
						)}
					</TabsList>
				</Card>

				<TabsContent value="basic">
					<BasicInfoTab course={course} isCreateMode={isCreateMode} />
				</TabsContent>

				{!isCreateMode && (
					<>
						<TabsContent value="tags">
							<TagsTab courseId={id as string} currentTags={course?.tags || []} />
						</TabsContent>

						<TabsContent value="lecturers">
							<LecturersTab courseId={id as string} lecturers={course?.lecturers || []} />
						</TabsContent>

						<TabsContent value="assignments">
							<AssignmentsTab courseId={id as string} assignments={assignments} isLoading={assignmentsLoading} />
						</TabsContent>

						<TabsContent value="instances">
							<InstancesTab courseId={id as string} instances={instances} isLoading={instancesLoading} />
						</TabsContent>

						<TabsContent value="statistics">
							<StatisticsTab courseId={id as string} stats={stats} isLoading={statsLoading} />
						</TabsContent>
					</>
				)}
			</Tabs>
		</div>
	);
}
