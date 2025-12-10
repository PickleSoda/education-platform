import { Icon } from "@/components/icon";
import { useParams, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Skeleton } from "@/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import courseInstanceService from "@/api/services/courseInstanceService";
import { format } from "date-fns";
import { AssignmentsTab } from "./tabs/assignments-tab";
import { EnrollmentsTab } from "./tabs/enrollments-tab";
import { OverviewTab } from "./tabs/overview-tab";

type InstanceStatus = "draft" | "scheduled" | "active" | "completed" | "archived";

const statusConfig: Record<
	InstanceStatus,
	{ label: string; variant: "default" | "success" | "warning" | "error" | "info" }
> = {
	draft: { label: "Draft", variant: "default" },
	scheduled: { label: "Scheduled", variant: "info" },
	active: { label: "Active", variant: "success" },
	completed: { label: "Completed", variant: "warning" },
	archived: { label: "Archived", variant: "error" },
};

export default function InstanceDetailPage() {
	const { id } = useParams();
	const { back } = useRouter();

	const { data, isLoading } = useQuery({
		queryKey: ["instance", id],
		queryFn: () => courseInstanceService.getInstanceById(id!),
		enabled: !!id,
	});

	const instance = data?.data;

	if (isLoading) {
		return (
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<Skeleton className="h-8 w-64" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!instance) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<Icon icon="solar:file-corrupted-bold-duotone" size={48} className="mx-auto mb-4 text-gray-400" />
					<h3 className="text-lg font-medium">Instance not found</h3>
					<p className="text-text-secondary">The instance you're looking for doesn't exist.</p>
					<Button onClick={() => back()} className="mt-4">
						Go Back
					</Button>
				</CardContent>
			</Card>
		);
	}

	const status = instance.status as InstanceStatus;

	return (
		<div className="space-y-6">
			{/* Header Card */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-4">
							<Button variant="ghost" size="icon" onClick={() => back()}>
								<Icon icon="solar:arrow-left-bold" size={20} />
							</Button>
							<div>
								<div className="flex items-center gap-3">
									<h1 className="text-xl font-semibold">{instance.course?.title}</h1>
									<Badge variant={statusConfig[status]?.variant || "default"}>
										{statusConfig[status]?.label || status}
									</Badge>
								</div>
								<div className="mt-1 flex items-center gap-4 text-sm text-text-secondary">
									<span className="font-medium">{instance.course?.code}</span>
									<span>•</span>
									<span>{instance.semester}</span>
									<span>•</span>
									<span>
										{format(new Date(instance.startDate), "MMM d")} -{" "}
										{format(new Date(instance.endDate), "MMM d, yyyy")}
									</span>
								</div>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-4 gap-6">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Icon icon="solar:users-group-rounded-bold-duotone" size={20} className="text-primary" />
							</div>
							<div>
								<div className="text-lg font-semibold">
									{instance._count?.enrollments || 0}
									{instance.enrollmentLimit && (
										<span className="text-sm font-normal text-text-secondary"> / {instance.enrollmentLimit}</span>
									)}
								</div>
								<div className="text-xs text-text-secondary">Enrolled Students</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
								<Icon icon="solar:document-text-bold-duotone" size={20} className="text-info" />
							</div>
							<div>
								<div className="text-lg font-semibold">{instance._count?.publishedAssignments || 0}</div>
								<div className="text-xs text-text-secondary">Published Assignments</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
								<Icon icon="solar:folder-bold-duotone" size={20} className="text-success" />
							</div>
							<div>
								<div className="text-lg font-semibold">{instance._count?.publishedResources || 0}</div>
								<div className="text-xs text-text-secondary">Resources</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
								<Icon icon="solar:diploma-bold-duotone" size={20} className="text-warning" />
							</div>
							<div>
								<div className="text-lg font-semibold">{instance.course?.credits || 0}</div>
								<div className="text-xs text-text-secondary">Credits</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tabs */}
			<Tabs defaultValue="overview">
				<TabsList>
					<TabsTrigger value="overview">
						<Icon icon="solar:info-circle-bold-duotone" size={16} className="mr-2" />
						Overview
					</TabsTrigger>
					<TabsTrigger value="assignments">
						<Icon icon="solar:document-text-bold-duotone" size={16} className="mr-2" />
						Assignments
					</TabsTrigger>
					<TabsTrigger value="enrollments">
						<Icon icon="solar:users-group-rounded-bold-duotone" size={16} className="mr-2" />
						Enrollments
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-4">
					<OverviewTab instance={instance} />
				</TabsContent>

				<TabsContent value="assignments" className="mt-4">
					<AssignmentsTab instanceId={instance.id} courseId={instance.courseId} />
				</TabsContent>

				<TabsContent value="enrollments" className="mt-4">
					<EnrollmentsTab instanceId={instance.id} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
