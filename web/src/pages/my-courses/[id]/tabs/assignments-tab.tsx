import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/ui/skeleton";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PublishedAssignment, EnrollmentWithRelations } from "#/entity";
import { format, isPast, isFuture } from "date-fns";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useUserInfo } from "@/store/userStore";
import submissionService from "@/api/services/submissionService";
import { Progress } from "@/ui/progress";

interface AssignmentsTabProps {
	instanceId: string;
	assignments: PublishedAssignment[];
	isLoading: boolean;
	enrollment?: EnrollmentWithRelations;
}

type FilterType = "all" | "upcoming" | "scheduled" | "overdue" | "completed";

interface AssignmentRow extends PublishedAssignment {
	score: number | null;
	submissionStatus: "graded" | "submitted" | "pending" | "not_submitted";
}

export default function AssignmentsTab({ instanceId, assignments, isLoading, enrollment }: AssignmentsTabProps) {
	const [filter, setFilter] = useState<FilterType>("all");
	const navigate = useNavigate();
	const userInfo = useUserInfo();
	const studentId = enrollment?.studentId || userInfo.id;

	// Fetch real gradebook data
	const { data: gradebookData, isLoading: gradebookLoading } = useQuery({
		queryKey: ["student-gradebook", instanceId, studentId],
		queryFn: () => submissionService.getStudentGradebook(instanceId, studentId as string),
		enabled: !!instanceId && !!studentId,
	});

	const gradebook = gradebookData?.data;

	// Build a map from assignment id -> gradebook entry for quick lookup
	const gradebookMap = new Map(gradebook?.assignments.map((entry) => [entry.id, entry]) || []);

	// Merge assignments with grade data
	const assignmentRows: AssignmentRow[] = assignments.map((a) => {
		const entry = gradebookMap.get(a.id);
		const submission = entry?.submission;
		let score: number | null = null;
		let submissionStatus: AssignmentRow["submissionStatus"] = "not_submitted";

		if (submission) {
			if (submission.status === "graded" || submission.status === "returned") {
				score = submission.finalPoints ?? submission.totalPoints ?? null;
				submissionStatus = "graded";
			} else if (submission.status === "submitted" || submission.status === "late") {
				submissionStatus = "submitted";
			} else {
				submissionStatus = "pending";
			}
		}

		return { ...a, score, submissionStatus };
	});

	const assignmentTypeColors: Record<string, "info" | "warning" | "error" | "success" | "default"> = {
		homework: "info",
		quiz: "warning",
		midterm: "error",
		final: "error",
		project: "success",
		participation: "default",
	};

	const getDeadlineStatus = (deadline: string, status: string) => {
		if (status === "closed") return { label: "Closed", color: "default" as const };
		if (status === "scheduled") return { label: "Scheduled", color: "info" as const };
		const deadlineDate = new Date(deadline);
		if (isPast(deadlineDate)) return { label: "Overdue", color: "error" as const };
		const daysUntil = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
		if (daysUntil <= 1) return { label: "Due Soon", color: "error" as const };
		if (daysUntil <= 3) return { label: "Upcoming", color: "warning" as const };
		return { label: "Open", color: "success" as const };
	};

	// Include published, closed, and scheduled assignments
	const visibleAssignments = assignmentRows.filter(
		(a) => a.status === "published" || a.status === "closed" || a.status === "scheduled"
	);

	const filteredAssignments = visibleAssignments.filter((a) => {
		if (filter === "all") return true;
		if (filter === "scheduled") return a.status === "scheduled";
		if (filter === "upcoming") return a.status === "published" && isFuture(new Date(a.deadline));
		if (filter === "overdue") return a.status === "published" && isPast(new Date(a.deadline));
		if (filter === "completed") return a.status === "closed";
		return true;
	});

	const counts = {
		all: visibleAssignments.length,
		scheduled: visibleAssignments.filter((a) => a.status === "scheduled").length,
		upcoming: visibleAssignments.filter((a) => a.status === "published" && isFuture(new Date(a.deadline))).length,
		overdue: visibleAssignments.filter((a) => a.status === "published" && isPast(new Date(a.deadline))).length,
		completed: visibleAssignments.filter((a) => a.status === "closed").length,
	};

	// Grade summary calculations
	const gradedRows = visibleAssignments.filter((a) => a.score !== null);
	const earnedPoints = gradedRows.reduce((sum, row) => sum + (row.score || 0), 0);
	const gradedMaxPoints = gradedRows.reduce((sum, row) => sum + (row.maxPoints || 0), 0);
	const totalWeight = visibleAssignments.reduce((sum, row) => sum + (row.weightPercentage || 0), 0);
	const currentPercentage = gradedMaxPoints > 0 ? (earnedPoints / gradedMaxPoints) * 100 : 0;

	const getLetterGrade = (percentage: number): string => {
		if (percentage >= 90) return "A";
		if (percentage >= 80) return "B";
		if (percentage >= 70) return "C";
		if (percentage >= 60) return "D";
		return "F";
	};

	const submissionStatusConfig: Record<string, { label: string; color: "success" | "warning" | "info" | "default" }> = {
		graded: { label: "Graded", color: "success" },
		submitted: { label: "Submitted", color: "info" },
		pending: { label: "Pending", color: "warning" },
		not_submitted: { label: "Not Started", color: "default" },
	};

	const columns: ColumnsType<AssignmentRow> = [
		{
			title: "Assignment",
			dataIndex: "title",
			width: 300,
			render: (title, record) => (
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
						<Icon icon="solar:document-text-bold-duotone" size={20} className="text-primary" />
					</div>
					<div>
						<p className="font-medium">{title}</p>
						{record.description && <p className="text-xs text-text-secondary line-clamp-1">{record.description}</p>}
					</div>
				</div>
			),
		},
		{
			title: "Type",
			dataIndex: "assignmentType",
			width: 120,
			render: (type: string) => (
				<Badge variant={assignmentTypeColors[type] || "default"}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
			),
		},
		{
			title: "Points",
			dataIndex: "maxPoints",
			align: "center",
			width: 80,
			render: (points, record) => (
				<div className="text-center">
					<span className="font-medium">{points || "-"}</span>
					{record.weightPercentage && <p className="text-xs text-text-secondary">{record.weightPercentage}%</p>}
				</div>
			),
		},
		{
			title: "Deadline",
			dataIndex: "deadline",
			width: 180,
			render: (deadline, record) => {
				if (record.status === "scheduled" && record.publishAt) {
					return (
						<div>
							<p className="text-xs text-text-secondary mb-1">Publishes on</p>
							<p className="font-medium">{format(new Date(record.publishAt), "MMM dd, yyyy")}</p>
							<p className="text-xs text-text-secondary">{format(new Date(record.publishAt), "h:mm a")}</p>
							<Badge variant="info" className="text-xs mt-1">
								Scheduled
							</Badge>
						</div>
					);
				}
				const status = getDeadlineStatus(deadline, record.status);
				return (
					<div>
						<p className="font-medium">{format(new Date(deadline), "MMM dd, yyyy")}</p>
						<p className="text-xs text-text-secondary">{format(new Date(deadline), "h:mm a")}</p>
						<Badge variant={status.color} className="text-xs mt-1">
							{status.label}
						</Badge>
					</div>
				);
			},
		},
		{
			title: "Score",
			width: 120,
			render: (_, record) => {
				if (record.status === "scheduled") {
					return <span className="text-text-secondary">--</span>;
				}
				if (record.score !== null) {
					const pct = record.maxPoints ? (record.score / record.maxPoints) * 100 : 0;
					return (
						<div className="text-center">
							<span className="font-semibold">
								{record.score} / {record.maxPoints}
							</span>
							<p
								className={`text-xs font-medium ${pct >= 70 ? "text-success" : pct >= 60 ? "text-warning" : "text-error"}`}
							>
								{pct.toFixed(0)}%
							</p>
						</div>
					);
				}
				return <span className="text-text-secondary text-center block">-- / {record.maxPoints || "--"}</span>;
			},
		},
		{
			title: "Status",
			width: 120,
			render: (_, record) => {
				if (record.status === "scheduled") {
					return (
						<Badge variant="info">
							<Icon icon="solar:clock-circle-bold-duotone" size={14} className="mr-1" />
							Scheduled
						</Badge>
					);
				}
				const config = submissionStatusConfig[record.submissionStatus];
				return <Badge variant={config.color}>{config.label}</Badge>;
			},
		},
		{
			title: "Action",
			key: "action",
			align: "center",
			width: 120,
			render: (_, record) =>
				record.status === "scheduled" ? (
					<Button size="sm" variant="outline" disabled>
						<Icon icon="solar:clock-circle-bold-duotone" size={16} className="mr-2" />
						Not Yet
					</Button>
				) : (
					<Button size="sm" onClick={() => navigate(`assignments/${record.id}`)}>
						<Icon icon="solar:eye-bold-duotone" size={16} className="mr-2" />
						View
					</Button>
				),
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
			{/* Filter Tabs */}
			<Card className="p-2">
				<Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
					<TabsList>
						<TabsTrigger value="all">
							All
							<Badge variant="outline" className="ml-2">
								{counts.all}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="upcoming">
							Upcoming
							<Badge variant="outline" className="ml-2">
								{counts.upcoming}
							</Badge>
						</TabsTrigger>
						<TabsTrigger value="scheduled">
							Scheduled
							{counts.scheduled > 0 && (
								<Badge variant="info" className="ml-2">
									{counts.scheduled}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="overdue">
							Overdue
							{counts.overdue > 0 && (
								<Badge variant="error" className="ml-2">
									{counts.overdue}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="completed">
							Completed
							<Badge variant="outline" className="ml-2">
								{counts.completed}
							</Badge>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</Card>

			{/* Grade Summary */}
			{!gradebookLoading && gradedRows.length > 0 && (
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardContent className="p-5">
							<div className="flex items-center gap-4">
								<div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
									<span className="text-xl font-bold text-primary">
										{gradebook?.finalLetter || (gradedMaxPoints > 0 ? getLetterGrade(currentPercentage) : "--")}
									</span>
								</div>
								<div>
									<p className="text-xs text-text-secondary">Current Grade</p>
									<p className="text-2xl font-bold">
										{gradebook?.finalGrade != null
											? `${gradebook.finalGrade.toFixed(1)}%`
											: gradedMaxPoints > 0
												? `${currentPercentage.toFixed(1)}%`
												: "--"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-5">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs text-text-secondary">Points Earned</span>
									<span className="font-semibold text-sm">
										{earnedPoints} / {gradedMaxPoints}
									</span>
								</div>
								<Progress value={gradedMaxPoints > 0 ? (earnedPoints / gradedMaxPoints) * 100 : 0} />
								<p className="text-xs text-text-secondary">{gradedRows.length} graded assignment(s)</p>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-5">
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-xs text-text-secondary">Weight Coverage</span>
									<span className="font-semibold text-sm">{totalWeight.toFixed(1)}%</span>
								</div>
								<Progress value={totalWeight} />
								<p className="text-xs text-text-secondary">{visibleAssignments.length} assignment(s)</p>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Assignments Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Assignments</h3>
							<p className="text-sm text-text-secondary">View and submit your assignments</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{filteredAssignments.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-text-secondary">
							<Icon icon="solar:document-text-bold-duotone" size={48} className="opacity-50 mb-4" />
							<p className="font-medium">No {filter !== "all" ? filter : ""} assignments</p>
							<p className="text-sm">
								{filter === "all"
									? "No assignments have been published yet"
									: `You don't have any ${filter} assignments`}
							</p>
						</div>
					) : (
						<Table
							rowKey="id"
							size="small"
							scroll={{ x: "max-content" }}
							pagination={filteredAssignments.length > 10 ? { pageSize: 10 } : false}
							columns={columns}
							dataSource={filteredAssignments}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
