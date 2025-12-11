import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import type { CourseInstance } from "#/entity";
import { Icon } from "@/components/icon";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Skeleton } from "@/ui/skeleton";
import { format } from "date-fns";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import courseInstanceService, { type CreateInstanceReq } from "@/api/services/courseInstanceService";
import { CreateInstanceModal } from "@/pages/management/instance/create-instance-modal";
import { useRouter } from "@/routes/hooks";

interface InstancesTabProps {
	courseId: string;
	courseName?: string;
	courseCode?: string;
	instances: CourseInstance[];
	isLoading: boolean;
}

const statusColors: Record<string, string> = {
	draft: "default",
	scheduled: "info",
	active: "success",
	completed: "warning",
	archived: "error",
};

export function InstancesTab({ courseId, courseName, courseCode, instances, isLoading }: InstancesTabProps) {
	const { push } = useRouter();
	const queryClient = useQueryClient();
	const [showCreateModal, setShowCreateModal] = useState(false);

	// Create instance mutation
	const createMutation = useMutation({
		mutationFn: (data: CreateInstanceReq) => courseInstanceService.createInstance(data),
		onSuccess: () => {
			toast.success("Instance created successfully");
			queryClient.invalidateQueries({ queryKey: ["instances", courseId] });
			queryClient.invalidateQueries({ queryKey: ["management-instances"] });
			setShowCreateModal(false);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create instance");
		},
	});

	const columns: ColumnsType<CourseInstance> = [
		{
			title: "Semester",
			dataIndex: "semester",
			width: 150,
			render: (semester, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{semester}</span>
					<span className="text-xs text-text-secondary">{record.startDate}</span>
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			width: 120,
			render: (status: string) => (
				<Badge variant={statusColors[status] as any}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
			),
		},
		{
			title: "Schedule",
			width: 200,
			render: (_, record) => {
				if (!record.startDate || !record.endDate) return <span className="text-text-secondary">Not scheduled</span>;
				return (
					<div className="flex flex-col text-xs">
						<span>{format(new Date(record.startDate), "MMM dd, yyyy")}</span>
						<span className="text-text-secondary">to {format(new Date(record.endDate), "MMM dd, yyyy")}</span>
					</div>
				);
			},
		},
		{
			title: "Enrollment",
			width: 150,
			render: (_, record) => {
				const enrolled = record._count?.enrollments || 0;
				const capacity = record.enrollmentLimit;
				const isOpen = record.enrollmentOpen;
				return (
					<div className="flex flex-col items-center">
						<span className="font-medium">
							{enrolled}
							{capacity && ` / ${capacity}`}
						</span>
						<Badge variant={isOpen ? "success" : "default"} className="text-xs">
							{isOpen ? "Open" : "Closed"}
						</Badge>
					</div>
				);
			},
		},
		{
			title: "Published Assignments",
			dataIndex: ["_count", "publishedAssignments"],
			align: "center",
			width: 150,
			render: (count) => <Badge variant="outline">{count || 0}</Badge>,
		},
		{
			title: "Forums",
			dataIndex: ["_count", "forums"],
			align: "center",
			width: 100,
			render: (count) => <Badge variant="outline">{count || 0}</Badge>,
		},
	];

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<Skeleton className="h-64 w-full" />
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Quick Stats */}
			<div className="grid grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold">{instances.length}</div>
						<div className="text-sm text-text-secondary">Total Instances</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold">{instances.filter((i) => i.status === "active").length}</div>
						<div className="text-sm text-text-secondary">Active</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold">
							{instances.reduce((sum, i) => sum + (i._count?.enrollments || 0), 0)}
						</div>
						<div className="text-sm text-text-secondary">Total Students</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4 text-center">
						<div className="text-2xl font-bold">
							{instances.reduce((sum, i) => sum + (i._count?.publishedAssignments || 0), 0)}
						</div>
						<div className="text-sm text-text-secondary">Published Assignments</div>
					</CardContent>
				</Card>
			</div>

			{/* Instance List */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Course Instances</h3>
							<p className="text-sm text-text-secondary">Specific offerings of this course over different semesters</p>
						</div>
						<div className="flex gap-2">
							<Button variant="outline">
								<Icon icon="solar:copy-bold-duotone" size={18} className="mr-2" />
								Clone Latest
							</Button>
							<Button onClick={() => setShowCreateModal(true)}>
								<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
								Create Instance
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{instances.length === 0 ? (
						<div className="text-center py-12 text-text-secondary">
							<Icon icon="solar:calendar-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
							<p className="mb-4">No course instances yet</p>
							<Button variant="outline" onClick={() => setShowCreateModal(true)}>
								<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
								Create Your First Instance
							</Button>
						</div>
					) : (
						<Table
							rowKey="id"
							size="small"
							scroll={{ x: "max-content" }}
							pagination={{
								pageSize: 10,
								showSizeChanger: true,
								showTotal: (total) => `Total ${total} instances`,
							}}
							columns={columns}
							dataSource={instances}
							onRow={(record) => ({
								onClick: () => push(`/management/instance/${record.id}`),
								style: { cursor: "pointer" },
							})}
						/>
					)}
				</CardContent>
			</Card>

			<CreateInstanceModal
				show={showCreateModal}
				courseId={courseId}
				courseName={courseName ? `${courseCode} - ${courseName}` : undefined}
				onClose={() => setShowCreateModal(false)}
				onSubmit={(data) => createMutation.mutate(data)}
				isSubmitting={createMutation.isPending}
			/>
		</div>
	);
}
