import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import submissionService from "@/api/services/submissionService";
import { format } from "date-fns";
import type { SubmissionWithCourseRelations, SubmissionStatus } from "#/entity";

export default function AssignmentManagementPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "all">("submitted");

	// Initialize filter from URL params
	useEffect(() => {
		const statusParam = searchParams.get("status");
		if (statusParam && (statusParam === "all" || ["submitted", "graded", "returned", "draft"].includes(statusParam))) {
			setFilterStatus(statusParam as SubmissionStatus | "all");
		}
	}, [searchParams]);

	const { data: submissionsData, isLoading } = useQuery({
		queryKey: ["pending-submissions", filterStatus],
		queryFn: () =>
			submissionService.getSubmissions({
				status: filterStatus === "all" ? undefined : filterStatus,
			}),
		refetchOnMount: "always",
		staleTime: 0,
	});

	const submissions: SubmissionWithCourseRelations[] = Array.isArray(submissionsData?.data) ? submissionsData.data : [];

	const statusColors: Record<string, "default" | "info" | "success" | "warning" | "error"> = {
		draft: "default",
		submitted: "info",
		pending: "warning",
		graded: "success",
		returned: "info",
	};

	const columns: ColumnsType<SubmissionWithCourseRelations> = [
		{
			title: "Student",
			dataIndex: "student",
			width: 200,
			render: (student) => (
				<div>
					<p className="font-medium">
						{student.firstName} {student.lastName}
					</p>
					<p className="text-xs text-text-secondary">{student.email}</p>
				</div>
			),
		},
		{
			title: "Assignment",
			dataIndex: "publishedAssignment",
			width: 250,
			render: (assignment) => (
				<div>
					<p className="font-medium">{assignment.title}</p>
					<p className="text-xs text-text-secondary">
						{assignment.instance.course.code} - {assignment.instance.semester} {assignment.instance.year}
					</p>
				</div>
			),
		},
		{
			title: "Course",
			dataIndex: ["publishedAssignment", "instance", "course"],
			width: 200,
			render: (course) => (
				<div>
					<p className="font-medium">{course.code}</p>
					<p className="text-xs text-text-secondary">{course.title}</p>
				</div>
			),
		},
		{
			title: "Due Date",
			dataIndex: ["publishedAssignment", "dueDate"],
			width: 150,
			render: (date: string | null) => {
				if (!date) return <span className="text-text-secondary">No due date</span>;
				const parsedDate = new Date(date);
				if (isNaN(parsedDate.getTime())) return <span className="text-text-secondary">Invalid date</span>;

				const now = new Date();
				const isOverdue = parsedDate < now;

				return (
					<div>
						<p className={`text-sm ${isOverdue ? "text-error font-medium" : ""}`}>
							{format(parsedDate, "MMM dd, yyyy")}
						</p>
						<p className="text-xs text-text-secondary">{format(parsedDate, "h:mm a")}</p>
					</div>
				);
			},
		},
		{
			title: "Submitted",
			dataIndex: "submittedAt",
			width: 150,
			render: (date: string | null) => {
				if (!date) return <span className="text-text-secondary">Not submitted</span>;
				const parsedDate = new Date(date);
				if (isNaN(parsedDate.getTime())) return <span className="text-text-secondary">Invalid date</span>;
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
				<div className="flex gap-2 flex-wrap">
					<Badge variant={statusColors[status] || "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
					{record.isLate && <Badge variant="error">Late</Badge>}
				</div>
			),
		},
		{
			title: "Max Points",
			dataIndex: ["publishedAssignment", "maxPoints"],
			width: 100,
			align: "center",
			render: (points: number | null) => points ?? "-",
		},
		{
			title: "Action",
			key: "action",
			width: 120,
			fixed: "right",
			render: (_, record) => (
				<Button
					size="sm"
					variant="outline"
					onClick={() => handleAssignmentClick(record.publishedAssignment.id, record.publishedAssignment.instance.id)}
				>
					<Icon icon="solar:eye-bold" size={16} className="mr-1" />
					View
				</Button>
			),
		},
	];

	const handleAssignmentClick = (assignmentId: string, instanceId: string) => {
		navigate(`/management/instance/${instanceId}/assignments/${assignmentId}`);
	};

	const pendingCount = submissions.filter((s) => s.status === "submitted").length;
	const lateCount = submissions.filter((s) => s.isLate).length;
	const gradedCount = submissions.filter((s) => s.status === "graded").length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Assignment Management</h1>
					<p className="text-text-secondary mt-1">View and manage all assignments and submissions</p>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="hover:shadow-md transition-shadow">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm text-text-secondary mb-1">Total Submissions</p>
								<p className="text-3xl font-bold">{submissions.length}</p>
							</div>
							<div className="h-14 w-14 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
								<Icon icon="solar:document-text-bold-duotone" size={28} />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setFilterStatus("submitted")}>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm text-text-secondary mb-1">Pending Grading</p>
								<p className="text-3xl font-bold">{pendingCount}</p>
							</div>
							<div className="h-14 w-14 rounded-lg flex items-center justify-center bg-warning/10 text-warning">
								<Icon icon="solar:clock-circle-bold-duotone" size={28} />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm text-text-secondary mb-1">Late Submissions</p>
								<p className="text-3xl font-bold">{lateCount}</p>
							</div>
							<div className="h-14 w-14 rounded-lg flex items-center justify-center bg-error/10 text-error">
								<Icon icon="solar:danger-bold-duotone" size={28} />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm text-text-secondary mb-1">Graded</p>
								<p className="text-3xl font-bold">{gradedCount}</p>
							</div>
							<div className="h-14 w-14 rounded-lg flex items-center justify-center bg-success/10 text-success">
								<Icon icon="solar:check-circle-bold-duotone" size={28} />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters and Table */}
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
						<h2 className="text-xl font-semibold">All Submissions</h2>
						<div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
							<Input
								placeholder="Search student, assignment, or course..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="md:w-80"
							/>
							<Select
								value={filterStatus}
								onValueChange={(value) => setFilterStatus(value as SubmissionStatus | "all")}
							>
								<SelectTrigger className="md:w-40">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="submitted">Submitted</SelectItem>
									<SelectItem value="graded">Graded</SelectItem>
									<SelectItem value="returned">Returned</SelectItem>
									<SelectItem value="draft">Draft</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table
						columns={columns}
						dataSource={submissions}
						rowKey="id"
						loading={isLoading}
						pagination={{
							pageSize: 10,
							showSizeChanger: true,
							showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} submissions`,
						}}
						scroll={{ x: 1200 }}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
