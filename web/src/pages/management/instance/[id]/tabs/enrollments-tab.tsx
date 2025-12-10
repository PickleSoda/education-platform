import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Input } from "@/ui/input";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import enrollmentService from "@/api/services/enrollmentService";
import type { EnrollmentWithRelations } from "#/entity";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

interface EnrollmentsTabProps {
	instanceId: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
	enrolled: { label: "Enrolled", variant: "success" },
	dropped: { label: "Dropped", variant: "error" },
	completed: { label: "Completed", variant: "info" },
};

export function EnrollmentsTab({ instanceId }: EnrollmentsTabProps) {
	const queryClient = useQueryClient();
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [dropModal, setDropModal] = useState<{ show: boolean; enrollment: EnrollmentWithRelations | null }>({
		show: false,
		enrollment: null,
	});

	// Fetch enrollments for this instance
	const { data, isLoading } = useQuery({
		queryKey: ["instance-enrollments", instanceId],
		queryFn: () => enrollmentService.getInstanceEnrollments(instanceId),
	});

	const enrollments = data?.data || [];

	// Filter enrollments
	const filteredEnrollments = enrollments.filter((enrollment) => {
		const matchesSearch =
			searchQuery === "" ||
			enrollment.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			enrollment.student?.email?.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	// Update status mutation
	const statusMutation = useMutation({
		mutationFn: ({ enrollmentId, status }: { enrollmentId: string; status: string }) =>
			enrollmentService.updateEnrollmentStatus(enrollmentId, { status }),
		onSuccess: () => {
			toast.success("Enrollment status updated");
			queryClient.invalidateQueries({ queryKey: ["instance-enrollments", instanceId] });
			queryClient.invalidateQueries({ queryKey: ["instance", instanceId] });
		},
		onError: () => {
			toast.error("Failed to update enrollment status");
		},
	});

	// Drop student mutation
	const dropMutation = useMutation({
		mutationFn: (enrollmentId: string) => enrollmentService.dropStudent(instanceId, enrollmentId),
		onSuccess: () => {
			toast.success("Student dropped from course");
			queryClient.invalidateQueries({ queryKey: ["instance-enrollments", instanceId] });
			queryClient.invalidateQueries({ queryKey: ["instance", instanceId] });
			setDropModal({ show: false, enrollment: null });
		},
		onError: () => {
			toast.error("Failed to drop student");
		},
	});

	// Export roster mutation
	const exportMutation = useMutation({
		mutationFn: () => enrollmentService.exportRoster(instanceId, { format: "csv" }),
		onSuccess: (data) => {
			// Create download link
			const blob = new Blob([data as unknown as BlobPart], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `roster-${instanceId}.csv`;
			a.click();
			window.URL.revokeObjectURL(url);
			toast.success("Roster exported successfully");
		},
		onError: () => {
			toast.error("Failed to export roster");
		},
	});

	const getStudentInitials = (name?: string) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const columns: ColumnsType<EnrollmentWithRelations> = [
		{
			title: "Student",
			key: "student",
			width: 300,
			render: (_, record) => (
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
						{getStudentInitials(record.student?.name)}
					</div>
					<div>
						<div className="font-medium">{record.student?.name || "Unknown"}</div>
						<div className="text-xs text-text-secondary">{record.student?.email}</div>
					</div>
				</div>
			),
		},
		{
			title: "Enrolled At",
			dataIndex: "enrolledAt",
			width: 160,
			render: (date: string) => (
				<div className="text-sm">
					<div>{format(new Date(date), "MMM d, yyyy")}</div>
					<div className="text-xs text-text-secondary">{format(new Date(date), "h:mm a")}</div>
				</div>
			),
		},
		{
			title: "Final Grade",
			dataIndex: "finalGrade",
			align: "center",
			width: 100,
			render: (grade: number | null) =>
				grade !== null ? (
					<Badge variant={grade >= 60 ? "success" : "error"}>{grade}%</Badge>
				) : (
					<span className="text-text-secondary">-</span>
				),
		},
		{
			title: "Status",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status: string) => (
				<Badge variant={statusConfig[status]?.variant || "default"}>{statusConfig[status]?.label || status}</Badge>
			),
		},
		{
			title: "Action",
			key: "action",
			align: "center",
			width: 120,
			render: (_, record) => (
				<div className="flex justify-center gap-1">
					{record.status === "enrolled" && (
						<>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => statusMutation.mutate({ enrollmentId: record.id, status: "completed" })}
								title="Mark as completed"
							>
								<Icon icon="solar:check-circle-bold-duotone" size={18} className="text-success!" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setDropModal({ show: true, enrollment: record })}
								title="Drop student"
							>
								<Icon icon="solar:user-minus-bold-duotone" size={18} className="text-error!" />
							</Button>
						</>
					)}
					{record.status === "dropped" && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => statusMutation.mutate({ enrollmentId: record.id, status: "enrolled" })}
							title="Re-enroll student"
						>
							<Icon icon="solar:user-plus-bold-duotone" size={18} className="text-success!" />
						</Button>
					)}
				</div>
			),
		},
	];

	// Stats
	const enrolledCount = enrollments.filter((e) => e.status === "enrolled").length;
	const droppedCount = enrollments.filter((e) => e.status === "dropped").length;
	const completedCount = enrollments.filter((e) => e.status === "completed").length;

	return (
		<>
			<div className="space-y-6">
				{/* Stats Cards */}
				<div className="grid grid-cols-4 gap-4">
					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<Icon icon="solar:users-group-rounded-bold-duotone" size={20} className="text-primary" />
							</div>
							<div>
								<div className="text-2xl font-bold">{enrollments.length}</div>
								<div className="text-xs text-text-secondary">Total</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
								<Icon icon="solar:user-check-bold-duotone" size={20} className="text-success" />
							</div>
							<div>
								<div className="text-2xl font-bold">{enrolledCount}</div>
								<div className="text-xs text-text-secondary">Active</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
								<Icon icon="solar:diploma-bold-duotone" size={20} className="text-info" />
							</div>
							<div>
								<div className="text-2xl font-bold">{completedCount}</div>
								<div className="text-xs text-text-secondary">Completed</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="flex items-center gap-3 p-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
								<Icon icon="solar:user-minus-bold-duotone" size={20} className="text-error" />
							</div>
							<div>
								<div className="text-2xl font-bold">{droppedCount}</div>
								<div className="text-xs text-text-secondary">Dropped</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Enrollments Table */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Icon icon="solar:users-group-rounded-bold-duotone" size={20} className="text-primary" />
								<span className="font-medium">Student Enrollments</span>
							</div>
							<div className="flex items-center gap-3">
								<Input
									placeholder="Search students..."
									className="w-64"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="All Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="enrolled">Enrolled</SelectItem>
										<SelectItem value="completed">Completed</SelectItem>
										<SelectItem value="dropped">Dropped</SelectItem>
									</SelectContent>
								</Select>
								<Button variant="outline" onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
									<Icon icon="solar:export-bold-duotone" size={18} className="mr-2" />
									Export
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{enrollments.length === 0 ? (
							<div className="py-12 text-center">
								<Icon icon="solar:users-group-rounded-bold-duotone" size={48} className="mx-auto mb-4 text-gray-300" />
								<h3 className="font-medium">No students enrolled yet</h3>
								<p className="text-sm text-text-secondary">
									Students will appear here once they enroll in this course instance.
								</p>
							</div>
						) : (
							<Table
								rowKey="id"
								size="small"
								scroll={{ x: "max-content" }}
								pagination={{ pageSize: 10 }}
								columns={columns}
								dataSource={filteredEnrollments}
								loading={isLoading}
							/>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Drop Student Confirmation */}
			<AlertDialog
				open={dropModal.show}
				onOpenChange={(open) => !open && setDropModal({ show: false, enrollment: null })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Drop Student</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to drop <strong>{dropModal.enrollment?.student?.name}</strong> from this course?
							They will need to re-enroll to access course materials again.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => dropModal.enrollment && dropMutation.mutate(dropModal.enrollment.id)}
							className="bg-error text-white hover:bg-error/90"
						>
							{dropMutation.isPending ? "Dropping..." : "Drop Student"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
