import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/ui/skeleton";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { CourseInstance } from "#/entity";
import { format } from "date-fns";

interface InstancesTabProps {
	instances: CourseInstance[];
	isLoading: boolean;
}

export default function InstancesTab({ instances, isLoading }: InstancesTabProps) {
	const statusColors: Record<string, string> = {
		draft: "default",
		scheduled: "info",
		active: "success",
		completed: "warning",
		archived: "error",
	};

	const columns: ColumnsType<CourseInstance> = [
		{
			title: "Semester",
			dataIndex: "semester",
			width: 200,
			render: (semester, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{semester}</span>
					<span className="text-xs text-text-secondary">{record.startDate || ""}</span>
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
			title: "Action",
			key: "operation",
			align: "center",
			width: 120,
			render: () => (
				<Button size="sm" variant="outline">
					<Icon icon="solar:login-2-bold-duotone" size={16} className="mr-2" />
					Join
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
		<Card>
			<CardHeader>
				<h3 className="text-lg font-semibold">Active Courses</h3>
				<p className="text-sm text-text-secondary">Different offerings of this course across semesters</p>
			</CardHeader>
			<CardContent>
				{instances.length === 0 ? (
					<div className="text-center py-12 text-text-secondary">
						<Icon icon="solar:calendar-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
						<p>No instances available yet</p>
					</div>
				) : (
					<Table
						rowKey="id"
						size="small"
						scroll={{ x: "max-content" }}
						pagination={false}
						columns={columns}
						dataSource={instances}
					/>
				)}
			</CardContent>
		</Card>
	);
}
