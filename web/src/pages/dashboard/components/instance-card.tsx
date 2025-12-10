import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { format } from "date-fns";
import type { CourseInstance, Course } from "#/entity";

interface InstanceCardProps {
	instance: CourseInstance & {
		course: Course;
		_count: {
			enrollments: number;
		};
	};
	pendingGrading?: number;
	upcomingDeadlines?: number;
	onManageInstance: (instanceId: string) => void;
	onManageCourse: (courseId: string) => void;
}

export default function InstanceCard({
	instance,
	pendingGrading = 0,
	upcomingDeadlines = 0,
	onManageInstance,
	onManageCourse,
}: InstanceCardProps) {
	const { course, _count } = instance;

	const statusColors: Record<string, any> = {
		draft: "default",
		scheduled: "info",
		active: "success",
		completed: "warning",
		archived: "error",
	};

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardContent className="p-6">
				<div className="space-y-4">
					{/* Header */}
					<div className="flex items-start justify-between">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-1 flex-wrap">
								<Badge variant="outline">{course.code}</Badge>
								<Badge variant={statusColors[instance.status]}>{instance.status}</Badge>
								{course.isArchived && <Badge variant="error">Archived</Badge>}
							</div>
							<h3 className="text-lg font-semibold line-clamp-2 mb-1">{course.title}</h3>
							<p className="text-sm text-text-secondary">{instance.semester}</p>
						</div>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-3 gap-4">
						<div className="text-center p-3 rounded-lg bg-gray-50">
							<div className="text-2xl font-bold">{_count.enrollments}</div>
							<div className="text-xs text-text-secondary">Students</div>
						</div>
						<div className="text-center p-3 rounded-lg bg-warning/10">
							<div className="text-2xl font-bold text-warning">{pendingGrading}</div>
							<div className="text-xs text-text-secondary">To Grade</div>
						</div>
						<div className="text-center p-3 rounded-lg bg-info/10">
							<div className="text-2xl font-bold text-info">{upcomingDeadlines}</div>
							<div className="text-xs text-text-secondary">Deadlines</div>
						</div>
					</div>

					{/* Schedule */}
					<div className="flex items-center justify-between text-sm text-text-secondary">
						{instance.startDate && instance.endDate ? (
							<>
								<div className="flex items-center gap-1">
									<Icon icon="solar:calendar-bold-duotone" size={16} />
									<span>{format(new Date(instance.startDate), "MMM dd")}</span>
								</div>
								<span>—</span>
								<div className="flex items-center gap-1">
									<Icon icon="solar:calendar-bold-duotone" size={16} />
									<span>{format(new Date(instance.endDate), "MMM dd, yyyy")}</span>
								</div>
							</>
						) : (
							<span>Schedule not set</span>
						)}
					</div>

					{/* Enrollment Status */}
					<div className="flex items-center justify-between text-sm">
						<span className="text-text-secondary">Enrollment</span>
						<Badge variant={instance.enrollmentOpen ? "success" : "default"}>
							{instance.enrollmentOpen ? "Open" : "Closed"}
						</Badge>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						<Button className="flex-1" variant="outline" size="sm" onClick={() => onManageCourse(course.id)}>
							<Icon icon="solar:book-bold-duotone" size={16} className="mr-2" />
							Course
						</Button>
						<Button className="flex-1" size="sm" onClick={() => onManageInstance(instance.id)}>
							<Icon icon="solar:settings-bold-duotone" size={16} className="mr-2" />
							Manage
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
