import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/ui/skeleton";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { AssignmentTemplate } from "#/entity";

interface AssignmentsTabProps {
	assignments: AssignmentTemplate[];
	isLoading: boolean;
	totalWeight: number;
}

export default function AssignmentsTab({ assignments, isLoading, totalWeight }: AssignmentsTabProps) {
	const assignmentTypeColors: Record<string, string> = {
		homework: "info",
		quiz: "warning",
		midterm: "error",
		final: "error",
		project: "success",
		participation: "default",
	};

	const isValidWeight = Math.abs(totalWeight - 100) < 0.01;

	const columns: ColumnsType<AssignmentTemplate> = [
		{
			title: "Title",
			dataIndex: "title",
			width: 300,
			render: (title, record) => (
				<div className="flex flex-col">
					<span className="font-medium">{title}</span>
					{record.description && <span className="text-xs text-text-secondary line-clamp-1">{record.description}</span>}
				</div>
			),
		},
		{
			title: "Type",
			dataIndex: "assignmentType",
			width: 120,
			render: (type: string) => (
				<Badge variant={assignmentTypeColors[type] as any}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
			),
		},
		{
			title: "Max Points",
			dataIndex: "maxPoints",
			align: "center",
			width: 100,
			render: (points) => <span className="font-medium">{points || "-"}</span>,
		},
		{
			title: "Weight",
			dataIndex: "weightPercentage",
			align: "center",
			width: 100,
			render: (weight) => <span className="font-medium">{weight ? `${weight}%` : "-"}</span>,
		},
		{
			title: "Grading Mode",
			dataIndex: "gradingMode",
			width: 120,
			render: (mode) => <span className="text-sm">{mode === "pass_fail" ? "Pass/Fail" : "Points"}</span>,
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
			{/* Grading Structure Overview */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Grading Structure Overview</h3>
					<p className="text-sm text-text-secondary">Weight distribution across assignment types</p>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-center p-4 border rounded-lg">
							<div className="text-2xl font-bold">{assignments.length}</div>
							<div className="text-sm text-text-secondary">Total Assignments</div>
						</div>
						<div className="text-center p-4 border rounded-lg">
							<div className="flex items-center justify-center gap-2">
								<span className="text-2xl font-bold">{totalWeight.toFixed(1)}%</span>
								{!isValidWeight && assignments.length > 0 && (
									<span>
										<Icon icon="solar:danger-bold-duotone" size={20} className="text-error" />
										<span className="text-xs text-error">Weight should total 100%</span>
									</span>
								)}
								{isValidWeight && assignments.length > 0 && (
									<Icon icon="solar:check-circle-bold-duotone" size={20} className="text-success" />
								)}
							</div>
							<div className="text-sm text-text-secondary">Total Weight</div>
						</div>
						<div className="text-center p-4 border rounded-lg">
							<div className="text-2xl font-bold">{assignments.reduce((sum, a) => sum + (a.maxPoints || 0), 0)}</div>
							<div className="text-sm text-text-secondary">Total Max Points</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Assignment Templates List */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Grading Criteria</h3>
					<p className="text-sm text-text-secondary">Preview of grading structure for this course</p>
				</CardHeader>
				<CardContent>
					{assignments.length === 0 ? (
						<div className="text-center py-12 text-text-secondary">
							<Icon icon="solar:document-text-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
							<p>No assignment templates defined yet</p>
						</div>
					) : (
						<Table
							rowKey="id"
							size="small"
							scroll={{ x: "max-content" }}
							pagination={false}
							columns={columns}
							dataSource={assignments}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
