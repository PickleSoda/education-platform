import { useParams } from "@/routes/hooks";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Icon } from "@/components/icon";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/ui/skeleton";
import type { Course } from "#/entity";
import courseService from "@/api/services/courseService";
import courseInstanceService from "@/api/services/courseInstanceService";
import assignmentService from "@/api/services/assignmentService";
import OverviewTab from "./tabs/overview-tab";
import LecturersTab from "./tabs/lecturers-tab";
import InstancesTab from "./tabs/instances-tab";
import AssignmentsTab from "./tabs/assignments-tab";

export default function CourseDetail() {
	const { id } = useParams();

	const { data: courseData, isLoading: courseLoading } = useQuery({
		queryKey: ["course", id],
		queryFn: () => courseService.getCourseById(id as string),
		enabled: !!id,
	});

	const { data: instancesData, isLoading: instancesLoading } = useQuery({
		queryKey: ["course-instances", id],
		queryFn: () => courseInstanceService.getInstances({ courseId: id as string }),
		enabled: !!id,
	});

	const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
		queryKey: ["course-assignments", id],
		queryFn: () => assignmentService.getAssignmentTemplates(id as string),
		enabled: !!id,
	});

	const course: Course | undefined = courseData?.data;
	const instances = instancesData?.data || [];
	const assignments = assignmentsData?.data || [];

	if (courseLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (!course) {
		return (
			<div className="flex flex-col items-center justify-center h-96 text-text-secondary">
				<Icon icon="solar:document-text-bold-duotone" size={64} className="mb-4 opacity-50" />
				<p className="text-lg font-medium">Course not found</p>
			</div>
		);
	}

	const primaryLecturer = course.lecturers?.find((l) => l.isPrimary);
	const totalWeight = assignments.reduce((sum, a) => sum + (a.weightPercentage || 0), 0);

	return (
		<div className="space-y-6">
			{/* Hero Section */}
			<Card>
				<CardContent className="p-8">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
						<div className="flex-1 space-y-4">
							<div className="flex items-center gap-3 flex-wrap">
								<Badge variant="outline" className="text-lg px-3 py-1">
									{course.code}
								</Badge>
								<Badge variant={course.isArchived ? "error" : "success"}>
									{course.isArchived ? "Archived" : "Active"}
								</Badge>
								<Badge variant="info">{course.credits} Credits</Badge>
							</div>

							<h1 className="text-3xl font-bold">{course.title}</h1>

							{course.description && <p className="text-text-secondary text-lg">{course.description}</p>}

							{course.tags && course.tags.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{course.tags.map((courseTag) => (
										<Badge
											key={courseTag.tag.id}
											variant="outline"
											style={{ borderColor: courseTag.tag.color || undefined }}
										>
											{courseTag.tag.name}
										</Badge>
									))}
								</div>
							)}

							{primaryLecturer && (
								<div className="flex items-center gap-3 pt-2">
									<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<span className="text-sm font-medium">
											{primaryLecturer.user.firstName[0]}
											{primaryLecturer.user.lastName[0]}
										</span>
									</div>
									<div>
										<p className="text-sm font-medium">
											{primaryLecturer.user.firstName} {primaryLecturer.user.lastName}
										</p>
										<p className="text-xs text-text-secondary">Primary Lecturer</p>
									</div>
								</div>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<Button size="lg" className="w-full md:w-auto">
								<Icon icon="solar:user-plus-bold-duotone" size={20} className="mr-2" />
								Enroll in Course
							</Button>
							<Button variant="outline" size="lg" className="w-full md:w-auto">
								<Icon icon="solar:bookmark-bold-duotone" size={20} className="mr-2" />
								Bookmark
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Course Information Tabs */}
			<Tabs defaultValue="overview" className="w-full">
				<Card className="p-2">
					<TabsList className="w-full justify-start">
						<TabsTrigger value="overview">
							<Icon icon="solar:document-bold-duotone" size={18} className="mr-2" />
							Overview
						</TabsTrigger>
						<TabsTrigger value="lecturers">
							<Icon icon="solar:users-group-rounded-bold-duotone" size={18} className="mr-2" />
							Lecturers
						</TabsTrigger>
						<TabsTrigger value="instances">
							<Icon icon="solar:calendar-bold-duotone" size={18} className="mr-2" />
							Active Courses
							{instances.length > 0 && (
								<Badge variant="outline" className="ml-2">
									{instances.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="assignments">
							<Icon icon="solar:document-text-bold-duotone" size={18} className="mr-2" />
							Grading
							{assignments.length > 0 && (
								<Badge variant="outline" className="ml-2">
									{assignments.length}
								</Badge>
							)}
						</TabsTrigger>
					</TabsList>
				</Card>

				{/* Overview Tab */}
				<TabsContent value="overview">
					<OverviewTab course={course} />
				</TabsContent>

				{/* Lecturers Tab */}
				<TabsContent value="lecturers">
					<LecturersTab course={course} />
				</TabsContent>

				{/* Instances Tab */}
				<TabsContent value="instances">
					<InstancesTab instances={instances} isLoading={instancesLoading} />
				</TabsContent>

				{/* Assignments Tab */}
				<TabsContent value="assignments">
					<AssignmentsTab assignments={assignments} isLoading={assignmentsLoading} totalWeight={totalWeight} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
