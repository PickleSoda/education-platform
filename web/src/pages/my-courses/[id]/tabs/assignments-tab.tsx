import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/ui/skeleton";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PublishedAssignment } from "#/entity";
import { format, isPast, isFuture } from "date-fns";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";

interface AssignmentsTabProps {
	instanceId: string;
	assignments: PublishedAssignment[];
	isLoading: boolean;
}

type FilterType = "all" | "upcoming" | "overdue" | "completed";

export default function AssignmentsTab({ assignments, isLoading }: AssignmentsTabProps) {
	const [filter, setFilter] = useState<FilterType>("all");

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
		const deadlineDate = new Date(deadline);
		if (isPast(deadlineDate)) return { label: "Overdue", color: "error" as const };
		const daysUntil = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
		if (daysUntil <= 1) return { label: "Due Soon", color: "error" as const };
		if (daysUntil <= 3) return { label: "Upcoming", color: "warning" as const };
		return { label: "Open", color: "success" as const };
	};

	const filteredAssignments = assignments.filter((a) => {
		if (a.status !== "published" && a.status !== "closed") return false;
		if (filter === "all") return true;
		if (filter === "upcoming") return isFuture(new Date(a.deadline));
		if (filter === "overdue") return isPast(new Date(a.deadline)) && a.status !== "closed";
		if (filter === "completed") return a.status === "closed";
		return true;
	});

	const counts = {
		all: assignments.filter((a) => a.status === "published" || a.status === "closed").length,
		upcoming: assignments.filter((a) => a.status === "published" && isFuture(new Date(a.deadline))).length,
		overdue: assignments.filter((a) => a.status === "published" && isPast(new Date(a.deadline))).length,
		completed: assignments.filter((a) => a.status === "closed").length,
	};

	const columns: ColumnsType<PublishedAssignment> = [
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
			title: "Status",
			width: 120,
			render: () => {
				// This would need submission data to show real status
				return (
					<Badge variant="default">
						<Icon icon="solar:file-text-bold-duotone" size={14} className="mr-1" />
						Not Started
					</Badge>
				);
			},
		},
		{
			title: "Action",
			key: "action",
			align: "center",
			width: 120,
			render: () => (
				<Button size="sm">
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
