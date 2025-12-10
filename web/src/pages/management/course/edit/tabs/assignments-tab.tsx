import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import type { AssignmentTemplate } from "#/entity";
import { Icon } from "@/components/icon";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Skeleton } from "@/ui/skeleton";

interface AssignmentsTabProps {
	courseId: string;
	assignments: AssignmentTemplate[];
	isLoading: boolean;
}

const assignmentTypeColors: Record<string, string> = {
	homework: "info",
	quiz: "warning",
	midterm: "error",
	final: "error",
	project: "success",
	participation: "default",
};

export function AssignmentsTab({ courseId, assignments, isLoading }: AssignmentsTabProps) {
	const totalWeight = assignments.reduce((sum, a) => sum + (a.weightPercentage || 0), 0);
	const totalMaxPoints = assignments.reduce((sum, a) => sum + (a.maxPoints || 0), 0);
	const isValidWeight = Math.abs(totalWeight - 100) < 0.01;
	console.log({ courseId, assignments, totalWeight, isValidWeight });
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
			title: "Points",
			dataIndex: "maxPoints",
			align: "center",
			width: 100,
			render: (points, record) => (
				<div className="flex flex-col items-center">
					<span className="font-medium">{points || "-"}</span>
					<span className="text-xs text-text-secondary">
						{record.gradingMode === "pass_fail" ? "Pass/Fail" : "Points"}
					</span>
				</div>
			),
		},
		{
			title: "Weight",
			dataIndex: "weightPercentage",
			align: "center",
			width: 100,
			render: (weight) => <span className="font-medium">{weight ? `${weight}%` : "-"}</span>,
		},
		{
			title: "Criteria",
			dataIndex: "gradingCriteria",
			align: "center",
			width: 100,
			render: (criteria?: AssignmentTemplate["gradingCriteria"]) => (
				<Badge variant="outline">{criteria?.length || 0}</Badge>
			),
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 120,
			render: (_, _record) => (
				<div className="flex w-full justify-center">
					<Button variant="ghost" size="icon" title="Edit assignment">
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" title="Copy assignment">
						<Icon icon="solar:copy-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon" title="Delete assignment">
						<Icon icon="solar:trash-bin-trash-bold-duotone" size={18} className="text-error" />
					</Button>
				</div>
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
			{/* Grading Structure Overview */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Grading Structure Overview</h3>
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
								{!isValidWeight && (
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
							<div className="text-2xl font-bold">{totalMaxPoints}</div>
							<div className="text-sm text-text-secondary">Total Max Points</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Assignment List */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Assignment Templates</h3>
							<p className="text-sm text-text-secondary">
								Define assignments that can be published in course instances
							</p>
						</div>
						<Button>
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							Create Assignment
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{assignments.length === 0 ? (
						<div className="text-center py-12 text-text-secondary">
							<Icon icon="solar:document-text-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
							<p className="mb-4">No assignment templates yet</p>
							<Button variant="outline">
								<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
								Create Your First Assignment
							</Button>
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
