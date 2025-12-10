import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PublishedAssignment, EnrollmentWithRelations } from "#/entity";
import { Progress } from "@/ui/progress";

interface GradesTabProps {
	instanceId: string;
	assignments: PublishedAssignment[];
	enrollment?: EnrollmentWithRelations;
}

interface GradeRow {
	id: string;
	title: string;
	type: string;
	maxPoints: number | null;
	weight: number | null;
	score: number | null;
	status: "graded" | "submitted" | "pending" | "not_submitted";
}

export default function GradesTab({ assignments }: GradesTabProps) {
	// Transform assignments to grade rows (would need real submission data)
	const gradeRows: GradeRow[] = assignments
		.filter((a) => a.status === "published" || a.status === "closed")
		.map((a) => ({
			id: a.id,
			title: a.title,
			type: a.assignmentType,
			maxPoints: a.maxPoints,
			weight: a.weightPercentage,
			score: null, // Would come from submissions
			status: "not_submitted" as const,
		}));

	// Calculate totals
	const totalWeight = gradeRows.reduce((sum, row) => sum + (row.weight || 0), 0);
	const totalMaxPoints = gradeRows.reduce((sum, row) => sum + (row.maxPoints || 0), 0);
	const earnedPoints = gradeRows.filter((row) => row.score !== null).reduce((sum, row) => sum + (row.score || 0), 0);
	const gradedMaxPoints = gradeRows
		.filter((row) => row.score !== null)
		.reduce((sum, row) => sum + (row.maxPoints || 0), 0);

	const currentPercentage = gradedMaxPoints > 0 ? (earnedPoints / gradedMaxPoints) * 100 : 0;

	const typeColors: Record<string, "info" | "warning" | "error" | "success" | "default"> = {
		homework: "info",
		quiz: "warning",
		midterm: "error",
		final: "error",
		project: "success",
		participation: "default",
	};

	const statusConfig: Record<string, { label: string; color: "success" | "warning" | "info" | "default" }> = {
		graded: { label: "Graded", color: "success" },
		submitted: { label: "Submitted", color: "info" },
		pending: { label: "Pending", color: "warning" },
		not_submitted: { label: "Not Submitted", color: "default" },
	};

	const getLetterGrade = (percentage: number): string => {
		if (percentage >= 90) return "A";
		if (percentage >= 80) return "B";
		if (percentage >= 70) return "C";
		if (percentage >= 60) return "D";
		return "F";
	};

	const columns: ColumnsType<GradeRow> = [
		{
			title: "Assignment",
			dataIndex: "title",
			width: 300,
			render: (title) => <span className="font-medium">{title}</span>,
		},
		{
			title: "Type",
			dataIndex: "type",
			width: 120,
			render: (type: string) => (
				<Badge variant={typeColors[type] || "default"}>{type.charAt(0).toUpperCase() + type.slice(1)}</Badge>
			),
		},
		{
			title: "Score",
			width: 120,
			render: (_, record) => (
				<div className="text-center">
					{record.score !== null ? (
						<span className="font-semibold">
							{record.score} / {record.maxPoints}
						</span>
					) : (
						<span className="text-text-secondary">-- / {record.maxPoints || "--"}</span>
					)}
				</div>
			),
		},
		{
			title: "Weight",
			dataIndex: "weight",
			align: "center",
			width: 80,
			render: (weight) => <span>{weight ? `${weight}%` : "--"}</span>,
		},
		{
			title: "Percentage",
			width: 100,
			render: (_, record) => {
				if (record.score === null || !record.maxPoints) {
					return <span className="text-text-secondary">--</span>;
				}
				const pct = (record.score / record.maxPoints) * 100;
				return (
					<span className={`font-semibold ${pct >= 70 ? "text-success" : pct >= 60 ? "text-warning" : "text-error"}`}>
						{pct.toFixed(1)}%
					</span>
				);
			},
		},
		{
			title: "Status",
			width: 140,
			render: (_, record) => {
				const config = statusConfig[record.status];
				return <Badge variant={config.color}>{config.label}</Badge>;
			},
		},
	];

	return (
		<div className="space-y-6">
			{/* Grade Summary */}
			<div className="grid gap-6 md:grid-cols-3">
				{/* Current Grade Card */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center gap-4">
							<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
								<span className="text-2xl font-bold text-primary">
									{gradedMaxPoints > 0 ? getLetterGrade(currentPercentage) : "--"}
								</span>
							</div>
							<div>
								<p className="text-sm text-text-secondary">Current Grade</p>
								<p className="text-3xl font-bold">{gradedMaxPoints > 0 ? `${currentPercentage.toFixed(1)}%` : "--"}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Points Earned Card */}
				<Card>
					<CardContent className="p-6">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-text-secondary">Points Earned</span>
								<span className="font-semibold">
									{earnedPoints} / {gradedMaxPoints}
								</span>
							</div>
							<Progress value={gradedMaxPoints > 0 ? (earnedPoints / gradedMaxPoints) * 100 : 0} />
							<p className="text-xs text-text-secondary">
								Based on {gradeRows.filter((r) => r.score !== null).length} graded assignment(s)
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Weight Distribution Card */}
				<Card>
					<CardContent className="p-6">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm text-text-secondary">Weight Coverage</span>
								<span className="font-semibold">{totalWeight.toFixed(1)}%</span>
							</div>
							<Progress value={totalWeight} />
							<p className="text-xs text-text-secondary">
								{gradeRows.length} assignment(s) • {totalMaxPoints} total points
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Weight Distribution by Type */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Grade Distribution by Type</h3>
					<p className="text-sm text-text-secondary">Weight breakdown across assignment types</p>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
						{Object.entries(
							gradeRows.reduce(
								(acc, row) => {
									acc[row.type] = (acc[row.type] || 0) + (row.weight || 0);
									return acc;
								},
								{} as Record<string, number>
							)
						).map(([type, weight]) => (
							<div key={type} className="text-center p-4 border rounded-lg">
								<Badge variant={typeColors[type] || "default"} className="mb-2">
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</Badge>
								<p className="text-2xl font-bold">{weight}%</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Grades Table */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Assignment Grades</h3>
							<p className="text-sm text-text-secondary">Detailed breakdown of all assignments</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{gradeRows.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-text-secondary">
							<Icon icon="solar:chart-bold-duotone" size={48} className="opacity-50 mb-4" />
							<p className="font-medium">No grades yet</p>
							<p className="text-sm">Grades will appear here once assignments are graded</p>
						</div>
					) : (
						<Table
							rowKey="id"
							size="small"
							scroll={{ x: "max-content" }}
							pagination={gradeRows.length > 10 ? { pageSize: 10 } : false}
							columns={columns}
							dataSource={gradeRows}
							summary={() => (
								<Table.Summary fixed>
									<Table.Summary.Row className="bg-accent/50">
										<Table.Summary.Cell index={0}>
											<span className="font-semibold">Total</span>
										</Table.Summary.Cell>
										<Table.Summary.Cell index={1}></Table.Summary.Cell>
										<Table.Summary.Cell index={2} align="center">
											<span className="font-semibold">
												{earnedPoints} / {gradedMaxPoints}
											</span>
										</Table.Summary.Cell>
										<Table.Summary.Cell index={3} align="center">
											<span className="font-semibold">{totalWeight}%</span>
										</Table.Summary.Cell>
										<Table.Summary.Cell index={4}>
											<span className="font-semibold">
												{gradedMaxPoints > 0 ? `${currentPercentage.toFixed(1)}%` : "--"}
											</span>
										</Table.Summary.Cell>
										<Table.Summary.Cell index={5}></Table.Summary.Cell>
									</Table.Summary.Row>
								</Table.Summary>
							)}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
