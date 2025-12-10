import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import type { PublishedAssignment, Course } from "#/entity";

interface DeadlineWidgetProps {
	assignments: Array<
		PublishedAssignment & {
			instance: {
				id: string;
				semester: string;
				course: Course;
			};
		}
	>;
	onAssignmentClick?: (assignmentId: string, instanceId: string) => void;
}

export default function DeadlineWidget({ assignments, onAssignmentClick }: DeadlineWidgetProps) {
	const getDeadlineColor = (deadline: Date) => {
		const daysRemaining = differenceInDays(deadline, new Date());
		if (daysRemaining < 1) return "error";
		if (daysRemaining <= 3) return "warning";
		if (daysRemaining <= 7) return "info";
		return "default";
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Icon icon="solar:calendar-mark-bold-duotone" size={24} className="text-primary" />
						<h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
					</div>
					{assignments.length > 0 && (
						<Badge variant="outline" className="ml-2">
							{assignments.length}
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{assignments.length === 0 ? (
					<div className="text-center py-12 text-text-secondary">
						<Icon icon="solar:calendar-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
						<p>No upcoming deadlines</p>
						<p className="text-sm mt-1">You&apos;re all caught up!</p>
					</div>
				) : (
					<div className="space-y-3">
						{assignments.map((assignment) => {
							const deadline = assignment.deadline ? new Date(assignment.deadline) : null;
							const isOverdue = deadline ? isPast(deadline) : false;

							return (
								<div
									key={assignment.id}
									className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
									onClick={() => onAssignmentClick?.(assignment.id, assignment.instance.id)}
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-start justify-between gap-2 mb-1">
											<p className="font-medium truncate">{assignment.title}</p>
											<Badge
												variant={assignment.assignmentType === "final" ? "error" : "outline"}
												className="flex-shrink-0"
											>
												{assignment.assignmentType}
											</Badge>
										</div>
										<p className="text-sm text-text-secondary truncate">
											{assignment.instance.course.code} - {assignment.instance.semester}
										</p>
										{deadline && (
											<div className="flex items-center gap-2 mt-2">
												<Icon
													icon={isOverdue ? "solar:danger-bold-duotone" : "solar:clock-circle-bold-duotone"}
													size={16}
													className={isOverdue ? "text-error" : "text-text-secondary"}
												/>
												<span className={`text-xs ${isOverdue ? "text-error font-medium" : "text-text-secondary"}`}>
													{isOverdue ? "Overdue" : formatDistanceToNow(deadline, { addSuffix: true })} •{" "}
													{format(deadline, "MMM dd, h:mm a")}
												</span>
												<Badge variant={getDeadlineColor(deadline)} className="ml-auto">
													{differenceInDays(deadline, new Date())}d
												</Badge>
											</div>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
