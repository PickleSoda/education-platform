import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Input } from "@/ui/input";
import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import { useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PublishedAssignment, SubmissionWithRelations } from "#/entity";
import submissionService from "@/api/services/submissionService";
import courseInstanceService from "@/api/services/courseInstanceService";
import { useQuery } from "@tanstack/react-query";

export default function AssignmentGradingPage() {
	const { id: instanceId, assignmentId } = useParams<{
		id: string;
		assignmentId: string;
	}>();

	const navigate = useNavigate();
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<"all" | "submitted" | "graded" | "pending">("all");

	const { data: assignmentData } = useQuery({
		queryKey: ["assignment", assignmentId],
		queryFn: () => courseInstanceService.getPublishedAssignmentById(instanceId as string, assignmentId as string),
		enabled: !!instanceId && !!assignmentId,
	});

	const assignment: PublishedAssignment | null = assignmentData?.data || null;

	const { data: submissionsData } = useQuery({
		queryKey: ["submissions", assignmentId],
		queryFn: () => submissionService.getSubmissions({ assignmentId: assignmentId as string }),
		enabled: !!assignmentId,
		refetchOnMount: "always",
		staleTime: 0,
	});

	const submissions: SubmissionWithRelations[] = Array.isArray(submissionsData?.data) ? submissionsData.data : [];

	const statusColors: Record<string, "default" | "info" | "success" | "warning" | "error"> = {
		draft: "default",
		submitted: "info",
		late: "warning",
		graded: "success",
		returned: "warning",
	};

	const columns: ColumnsType<SubmissionWithRelations> = [
		{
			title: "Student",
			dataIndex: "student",
			width: 250,
			render: (student) => (
				<div>
					<p className="font-medium">
						{student?.firstName} {student?.lastName}
					</p>
					<p className="text-xs text-text-secondary">{student?.email}</p>
				</div>
			),
		},
		{
			title: "Submitted",
			dataIndex: "submittedAt",
			width: 150,
			render: (date: string | null) => {
				if (!date) {
					return <span className="text-text-secondary">Not submitted</span>;
				}
				const parsedDate = new Date(date);
				if (isNaN(parsedDate.getTime())) {
					return <span className="text-text-secondary">Invalid date</span>;
				}
				return (
					<div>
						<p className="text-sm">{format(parsedDate, "MMM dd, yyyy")}</p>
						<p className="text-xs text-text-secondary">{format(parsedDate, "h:mm a")}</p>
					</div>
				);
			},
		},
		{
			title: "Status",
			dataIndex: "status",
			width: 120,
			render: (status: string, record) => (
				<div className="flex gap-2">
					<Badge variant={statusColors[status] || "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
					{record.isLate && <Badge variant="error">Late</Badge>}
				</div>
			),
		},
		{
			title: "Score",
			dataIndex: "finalPoints",
			align: "center",
			width: 100,
			render: (points: number | null) =>
				points !== null ? (
					<div>
						<p className="font-semibold">{points}</p>
						<p className="text-xs text-text-secondary">{Math.round((points / (assignment?.maxPoints || 1)) * 100)}%</p>
					</div>
				) : (
					<span className="text-text-secondary">-</span>
				),
		},
		{
			title: "Action",
			key: "action",
			align: "center",
			width: 120,
			render: (_, record) => (
				<Button size="sm" onClick={() => navigate(`grade/${record.id}`)}>
					<Icon icon="solar:pen-bold-duotone" size={16} className="mr-2" />
					{record.status === "graded" ? "Review" : "Grade"}
				</Button>
			),
		},
	];

	const stats = {
		total: submissions.length,
		submitted: submissions.filter((s) => ["submitted", "late", "graded"].includes(s.status)).length,
		graded: submissions.filter((s) => s.status === "graded").length,
		pending: submissions.filter((s) => s.status === "submitted" || s.status === "draft").length,
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<h1 className="text-2xl font-bold">{assignment?.title}</h1>
					<p className="text-sm text-text-secondary">View and grade student submissions</p>
				</div>
				<Button variant="outline" onClick={() => navigate(-1)}>
					<Icon icon="solar:arrow-left-bold-duotone" size={16} className="mr-2" />
					Back
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="p-4">
					<div className="text-sm text-text-secondary mb-1">Total Submissions</div>
					<div className="text-2xl font-bold">{stats.total}</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-text-secondary mb-1">Submitted</div>
					<div className="text-2xl font-bold text-info">{stats.submitted}</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-text-secondary mb-1">Graded</div>
					<div className="text-2xl font-bold text-success">{stats.graded}</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-text-secondary mb-1">Pending</div>
					<div className="text-2xl font-bold text-warning">{stats.pending}</div>
				</Card>
			</div>

			{/* Submissions Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-4">
						<h3 className="text-lg font-semibold">Submissions</h3>
						<div className="flex gap-3 flex-1 max-w-md">
							<Input
								placeholder="Search by name or email..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="flex-1"
							/>
							<select
								value={filterStatus}
								onChange={(e) => setFilterStatus(e.target.value as any)}
								className="px-3 py-2 border rounded-lg bg-white"
							>
								<option value="all">All Status</option>
								<option value="submitted">Submitted</option>
								<option value="graded">Graded</option>
								<option value="pending">Pending</option>
							</select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table
						rowKey="id"
						size="small"
						scroll={{ x: "max-content" }}
						pagination={submissions.length > 10 ? { pageSize: 10 } : false}
						columns={columns}
						dataSource={submissions}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
