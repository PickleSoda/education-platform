import { Icon } from "@/components/icon";
import { useParams, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Skeleton } from "@/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import courseInstanceService from "@/api/services/courseInstanceService";
import { format } from "date-fns";
import { AssignmentsTab } from "./tabs/assignments-tab";
import { EnrollmentsTab } from "./tabs/enrollments-tab";
import { OverviewTab } from "./tabs/overview-tab";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/ui/alert-dialog";

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

// Status transition configuration
const statusTransitions: Record<InstanceStatus, { next?: InstanceStatus; prev?: InstanceStatus }> = {
	draft: { next: "scheduled" },
	scheduled: { next: "active", prev: "draft" },
	active: { next: "completed", prev: "scheduled" },
	completed: { next: "archived", prev: "active" },
	archived: { prev: "completed" },
};

const statusActions: Record<
	InstanceStatus,
	{ next?: { label: string; icon: string; color: string }; prev?: { label: string; icon: string; color: string } }
> = {
	draft: {
		next: { label: "Schedule Instance", icon: "solar:calendar-bold-duotone", color: "text-info" },
	},
	scheduled: {
		next: { label: "Activate Instance", icon: "solar:play-circle-bold-duotone", color: "text-success" },
		prev: { label: "Back to Draft", icon: "solar:arrow-left-bold-duotone", color: "text-gray-500" },
	},
	active: {
		next: { label: "Mark as Completed", icon: "solar:check-circle-bold-duotone", color: "text-warning" },
		prev: { label: "Back to Scheduled", icon: "solar:arrow-left-bold-duotone", color: "text-gray-500" },
	},
	completed: {
		next: { label: "Archive Instance", icon: "solar:archive-bold-duotone", color: "text-error" },
		prev: { label: "Back to Active", icon: "solar:arrow-left-bold-duotone", color: "text-gray-500" },
	},
	archived: {
		prev: { label: "Unarchive", icon: "solar:restart-bold-duotone", color: "text-info" },
	},
};

export default function InstanceDetailPage() {
	const { id } = useParams();
	const { back } = useRouter();
	const queryClient = useQueryClient();
	const [statusModal, setStatusModal] = useState<{
		show: boolean;
		targetStatus: InstanceStatus | null;
		direction: "next" | "prev" | null;
	}>({ show: false, targetStatus: null, direction: null });

	const { data, isLoading } = useQuery({
		queryKey: ["instance", id],
		queryFn: () => courseInstanceService.getInstanceById(id!),
		enabled: !!id,
	});

	const instance = data?.data;

	// Status update mutation
	const statusMutation = useMutation({
		mutationFn: (status: InstanceStatus) => courseInstanceService.updateInstanceStatus(id!, { status }),
		onSuccess: () => {
			toast.success("Instance status updated successfully");
			queryClient.invalidateQueries({ queryKey: ["instance", id] });
			queryClient.invalidateQueries({ queryKey: ["management-instances"] });
			setStatusModal({ show: false, targetStatus: null, direction: null });
		},
		onError: () => {
			toast.error("Failed to update instance status");
		},
	});

	const handleStatusChange = (targetStatus: InstanceStatus, direction: "next" | "prev") => {
		setStatusModal({ show: true, targetStatus, direction });
	};

	const handleStatusConfirm = () => {
		if (statusModal.targetStatus) {
			statusMutation.mutate(statusModal.targetStatus);
		}
	};

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
					<p className="text-text-secondary">The instance you&apos;re looking for doesn&apos;t exist.</p>
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
						<div className="flex items-center gap-2">
							{statusTransitions[status]?.prev && statusActions[status]?.prev && (
								<Button
									variant="outline"
									onClick={() => handleStatusChange(statusTransitions[status].prev!, "prev")}
									disabled={statusMutation.isPending}
								>
									<Icon
										icon={statusActions[status].prev!.icon}
										size={18}
										className={`mr-2 ${statusActions[status].prev!.color}`}
									/>
									{statusActions[status].prev!.label}
								</Button>
							)}
							{statusTransitions[status]?.next && statusActions[status]?.next && (
								<Button
									onClick={() => handleStatusChange(statusTransitions[status].next!, "next")}
									disabled={statusMutation.isPending}
								>
									<Icon
										icon={statusActions[status].next!.icon}
										size={18}
										className={`mr-2 ${statusActions[status].next!.color}`}
									/>
									{statusActions[status].next!.label}
								</Button>
							)}
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

			{/* Status Change Confirmation Modal */}
			<AlertDialog
				open={statusModal.show}
				onOpenChange={(open) => !open && setStatusModal({ show: false, targetStatus: null, direction: null })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Change Instance Status</AlertDialogTitle>
						<AlertDialogDescription>
							{statusModal.direction === "next" && (
								<>
									Are you sure you want to change the status from <strong>{statusConfig[status]?.label}</strong> to{" "}
									<strong>{statusModal.targetStatus && statusConfig[statusModal.targetStatus]?.label}</strong>?
								</>
							)}
							{statusModal.direction === "prev" && (
								<>
									Are you sure you want to revert the status from <strong>{statusConfig[status]?.label}</strong> back to{" "}
									<strong>{statusModal.targetStatus && statusConfig[statusModal.targetStatus]?.label}</strong>?
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleStatusConfirm} disabled={statusMutation.isPending}>
							{statusMutation.isPending ? "Updating..." : "Confirm"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
