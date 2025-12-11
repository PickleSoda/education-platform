import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CourseInstance } from "#/entity";
import courseInstanceService from "@/api/services/courseInstanceService";
import { useIsAdmin } from "@/store/userStore";
import { useState } from "react";
import { format } from "date-fns";
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

export default function InstanceManagementPage() {
	const { push } = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const isAdmin = useIsAdmin();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [deleteModal, setDeleteModal] = useState<{
		show: boolean;
		instance: CourseInstance | null;
	}>({ show: false, instance: null });

	// Fetch instances - admin sees all, teachers see only their teaching instances
	const { data, isLoading } = useQuery({
		queryKey: ["management-instances", isAdmin],
		queryFn: () => (isAdmin ? courseInstanceService.getInstances() : courseInstanceService.getMyTeachingInstances()),
	});

	const instances = data?.data || [];

	// Filter instances
	const filteredInstances = instances.filter((instance) => {
		const matchesSearch =
			searchQuery === "" ||
			instance.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			instance.course?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			instance.semester?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === "all" || instance.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: (id: string) => courseInstanceService.deleteInstance(id),
		onSuccess: () => {
			toast.success("Instance deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["management-instances"] });
			setDeleteModal({ show: false, instance: null });
		},
		onError: () => {
			toast.error("Failed to delete instance");
		},
	});

	const handleDeleteClick = (instance: CourseInstance) => {
		setDeleteModal({ show: true, instance });
	};

	const handleDeleteConfirm = () => {
		if (deleteModal.instance) {
			deleteMutation.mutate(deleteModal.instance.id);
		}
	};

	const columns: ColumnsType<CourseInstance> = [
		{
			title: "Course",
			key: "course",
			width: 300,
			render: (_, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{record.course?.title}</span>
					<span className="text-xs text-text-secondary">{record.course?.code}</span>
				</div>
			),
		},
		{
			title: "Semester",
			dataIndex: "semester",
			width: 120,
			render: (semester) => <span className="font-medium">{semester}</span>,
		},
		{
			title: "Period",
			key: "period",
			width: 200,
			render: (_, record) => (
				<div className="flex flex-col text-sm">
					<span>{format(new Date(record.startDate), "MMM d, yyyy")}</span>
					<span className="text-text-secondary">to {format(new Date(record.endDate), "MMM d, yyyy")}</span>
				</div>
			),
		},
		{
			title: "Enrollments",
			key: "enrollments",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex items-center justify-center gap-1">
					<Icon icon="solar:users-group-rounded-bold-duotone" size={16} className="text-primary" />
					<span>{record._count?.enrollments || 0}</span>
					{record.enrollmentLimit && <span className="text-text-secondary">/ {record.enrollmentLimit}</span>}
				</div>
			),
		},
		{
			title: "Assignments",
			key: "assignments",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex items-center justify-center gap-1">
					<Icon icon="solar:document-text-bold-duotone" size={16} className="text-info" />
					<span>{record._count?.publishedAssignments || 0}</span>
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			align: "center",
			width: 140,
			render: (status: InstanceStatus) => (
				<Badge variant={statusConfig[status]?.variant || "default"}>{statusConfig[status]?.label || status}</Badge>
			),
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 80,
			render: (_, record) => (
				<Button
					variant="ghost"
					size="icon"
					onClick={(e) => {
						e.stopPropagation();
						handleDeleteClick(record);
					}}
					title="Delete instance"
					disabled={record.status !== "draft"}
				>
					<Icon icon="solar:trash-bin-trash-bold-duotone" size={18} className="text-error!" />
				</Button>
			),
		},
	];

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="text-lg font-semibold">Instance Management</div>
						<div className="flex items-center gap-3">
							<Input
								placeholder="Search courses..."
								className="w-64"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="All Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="draft">Draft</SelectItem>
									<SelectItem value="enrollment_open">Enrollment Open</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="archived">Archived</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table
						rowKey="id"
						size="small"
						scroll={{ x: "max-content" }}
						pagination={{ pageSize: 10 }}
						columns={columns}
						dataSource={filteredInstances}
						loading={isLoading}
						onRow={(record) => ({
							onClick: () => push(`${pathname}/${record.id}`),
							style: { cursor: "pointer" },
						})}
					/>
				</CardContent>
			</Card>

			<AlertDialog
				open={deleteModal.show}
				onOpenChange={(open) => !open && setDeleteModal({ show: false, instance: null })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Instance</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the instance for <strong>{deleteModal.instance?.course?.title}</strong> (
							{deleteModal.instance?.semester})? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteConfirm} className="bg-error text-white hover:bg-error/90">
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
