import { useParams, useNavigate } from "react-router";
import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Icon } from "@/components/icon";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/ui/skeleton";
import courseInstanceService from "@/api/services/courseInstanceService";
import enrollmentService from "@/api/services/enrollmentService";
import HomeTab from "./tabs/home-tab";
import AssignmentsTab from "./tabs/assignments-tab";
import GradesTab from "./tabs/grades-tab";
import ResourcesTab from "./tabs/resources-tab";
import PeopleTab from "./tabs/people-tab";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InstanceDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const { data: instanceData, isLoading: instanceLoading } = useQuery({
		queryKey: ["instance-details", id],
		queryFn: () => courseInstanceService.getInstanceDetails(id as string),
		enabled: !!id,
	});

	const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
		queryKey: ["instance-assignments", id],
		queryFn: () => courseInstanceService.getPublishedAssignments(id as string),
		enabled: !!id,
	});

	const { data: enrollmentData } = useQuery({
		queryKey: ["my-enrollments"],
		queryFn: () => enrollmentService.getMyEnrollments(),
	});

	const instance = instanceData?.data;
	const assignments = assignmentsData?.data || [];
	const course = instance?.course;

	// Find the current user's enrollment for this instance
	const myEnrollment = enrollmentData?.data?.find((e) => e.instanceId === id);

	const dropCourseMutation = useMutation({
		mutationFn: (enrollmentId: string) => enrollmentService.updateEnrollmentStatus(enrollmentId, { status: "dropped" }),
		onSuccess: () => {
			toast.success("Successfully dropped the course");
			queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
			navigate("/my-courses");
		},
		onError: (error: any) => {
			const message = error?.response?.data?.message || "Failed to drop course";
			toast.error(message);
		},
	});

	const statusColors: Record<string, "default" | "info" | "success" | "warning" | "error"> = {
		draft: "default",
		scheduled: "info",
		active: "success",
		completed: "warning",
		archived: "error",
	};

	if (instanceLoading) {
		return (
			<div className="space-y-6">
				<Skeleton className="h-48 w-full" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (!instance) {
		return (
			<div className="flex flex-col items-center justify-center h-96 text-text-secondary">
				<Icon icon="solar:document-text-bold-duotone" size={64} className="mb-4 opacity-50" />
				<p className="text-lg font-medium">Course instance not found</p>
				<Button variant="outline" className="mt-4" onClick={() => navigate("/my-courses")}>
					<Icon icon="solar:arrow-left-bold-duotone" size={20} className="mr-2" />
					Back to My Courses
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Hero Section */}
			<Card>
				<CardContent className="p-8">
					<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
						<div className="flex-1 space-y-4">
							{/* Breadcrumb */}
							<div className="flex items-center gap-2 text-sm text-text-secondary">
								<Button variant="ghost" size="sm" onClick={() => navigate("/my-courses")}>
									<Icon icon="solar:arrow-left-bold-duotone" size={16} className="mr-1" />
									My Courses
								</Button>
								<span>/</span>
								<span>{course?.code}</span>
							</div>

							{/* Badges */}
							<div className="flex items-center gap-3 flex-wrap">
								{course && (
									<Badge variant="outline" className="text-lg px-3 py-1">
										{course.code}
									</Badge>
								)}
								<Badge variant={statusColors[instance.status] || "default"}>
									{instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
								</Badge>
								<Badge variant="info">{instance.semester}</Badge>
								{course?.credits && <Badge variant="outline">{course.credits} Credits</Badge>}
								{myEnrollment && (
									<Badge variant="success">
										<Icon icon="solar:check-circle-bold-duotone" size={14} className="mr-1" />
										Enrolled
									</Badge>
								)}
							</div>

							{/* Title */}
							<h1 className="text-3xl font-bold">{course?.title || "Course Instance"}</h1>

							{/* Description */}
							{course?.description && <p className="text-text-secondary text-lg">{course.description}</p>}

							{/* Schedule Info */}
							{instance.startDate && instance.endDate && (
								<div className="flex items-center gap-2 text-text-secondary">
									<Icon icon="solar:calendar-bold-duotone" size={20} />
									<span>
										{format(new Date(instance.startDate), "MMM dd, yyyy")} -{" "}
										{format(new Date(instance.endDate), "MMM dd, yyyy")}
									</span>
								</div>
							)}

							{/* Lecturers Preview */}
							{instance.lecturers && instance.lecturers.length > 0 && (
								<div className="flex items-center gap-3 pt-2">
									<div className="flex -space-x-2">
										{instance.lecturers.slice(0, 3).map((lecturer) => (
											<div
												key={lecturer.userId}
												className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-background"
												title={`${lecturer.user.firstName} ${lecturer.user.lastName}`}
											>
												<span className="text-xs font-medium">
													{lecturer.user.firstName[0]}
													{lecturer.user.lastName[0]}
												</span>
											</div>
										))}
									</div>
									<div>
										<p className="text-sm font-medium">
											{instance.lecturers[0].user.firstName} {instance.lecturers[0].user.lastName}
											{instance.lecturers.length > 1 && ` +${instance.lecturers.length - 1} more`}
										</p>
										<p className="text-xs text-text-secondary">
											{instance.lecturers.length === 1 ? "Lecturer" : "Lecturers"}
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Actions */}
						<div className="flex flex-col gap-2">
							{myEnrollment && myEnrollment.status === "enrolled" && (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button variant="outline" className="text-error border-error hover:bg-error/10">
											<Icon icon="solar:logout-2-bold-duotone" size={20} className="mr-2" />
											Drop Course
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>Drop this course?</AlertDialogTitle>
											<AlertDialogDescription>
												Are you sure you want to drop {course?.code} - {course?.title}? This action can be undone by
												re-enrolling if enrollment is still open.
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction
												className="bg-error hover:bg-error/90"
												onClick={() => dropCourseMutation.mutate(myEnrollment.id)}
											>
												Drop Course
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Navigation Tabs */}
			<Tabs defaultValue="home" className="w-full">
				<Card className="p-2">
					<TabsList className="w-full justify-start">
						<TabsTrigger value="home">
							<Icon icon="solar:home-2-bold-duotone" size={18} className="mr-2" />
							Home
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
						<TabsTrigger value="grades">
							<Icon icon="solar:chart-bold-duotone" size={18} className="mr-2" />
							Grades
						</TabsTrigger>
						<TabsTrigger value="resources">
							<Icon icon="solar:folder-bold-duotone" size={18} className="mr-2" />
							Resources
						</TabsTrigger>
						<TabsTrigger value="people">
							<Icon icon="solar:users-group-rounded-bold-duotone" size={18} className="mr-2" />
							People
						</TabsTrigger>
					</TabsList>
				</Card>

				<TabsContent value="home">
					<HomeTab instance={instance} assignments={assignments} enrollment={myEnrollment} />
				</TabsContent>

				<TabsContent value="assignments">
					<AssignmentsTab instanceId={id as string} assignments={assignments} isLoading={assignmentsLoading} />
				</TabsContent>

				<TabsContent value="grades">
					<GradesTab instanceId={id as string} assignments={assignments} enrollment={myEnrollment} />
				</TabsContent>

				<TabsContent value="resources">
					<ResourcesTab instanceId={id as string} />
				</TabsContent>

				<TabsContent value="people">
					<PeopleTab instance={instance} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
