import { Card, CardContent } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Progress } from "@/ui/progress";
import { Icon } from "@/components/icon";
import { format } from "date-fns";
import type { Enrollment, CourseInstance, Course, User } from "#/entity";

interface CourseProgressCardProps {
	enrollment: Enrollment & {
		instance: CourseInstance & {
			course: Course;
			lecturers: Array<{
				userId: string;
				isPrimary: boolean;
				user: User;
			}>;
		};
	};
	upcomingDeadlines?: number;
	unreadAnnouncements?: number;
	onViewCourse: (instanceId: string) => void;
}

export default function CourseProgressCard({
	enrollment,
	upcomingDeadlines = 0,
	unreadAnnouncements = 0,
	onViewCourse,
}: CourseProgressCardProps) {
	const { instance } = enrollment;
	const { course } = instance;
	//todo: primary lecturer logic
	const primaryLecturer = instance.lecturers[0];
	// Calculate progress (placeholder - would need actual completion data)
	const progress = enrollment.finalGrade ? enrollment.finalGrade : 0;

	return (
		<Card className="hover:shadow-lg transition-shadow">
			<CardContent className="p-6">
				<div className="space-y-4">
					{/* Header */}
					<div className="flex items-start justify-between">
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2 mb-1">
								<Badge variant="outline">{course.code}</Badge>
								<Badge variant={instance.status === "active" ? "success" : "default"}>{instance.status}</Badge>
							</div>
							<h3 className="text-lg font-semibold line-clamp-2 mb-1">{course.title}</h3>
							<p className="text-sm text-text-secondary">{instance.semester}</p>
						</div>
					</div>

					{/* Progress */}
					{enrollment.finalGrade !== null && (
						<div className="space-y-2">
							<div className="flex items-center justify-between text-sm">
								<span className="text-text-secondary">Current Grade</span>
								<span className="font-semibold">
									{enrollment.finalGrade || "-"} ({enrollment.finalGrade?.toFixed(1)}%)
								</span>
							</div>
							<Progress value={progress} className="h-2" />
						</div>
					)}

					{/* Lecturer */}
					{primaryLecturer && (
						<div className="flex items-center gap-2 text-sm">
							<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
								<span className="text-xs font-medium">
									{primaryLecturer.user.firstName[0]}
									{primaryLecturer.user.lastName[0]}
								</span>
							</div>
							<span className="text-text-secondary truncate">
								{primaryLecturer.user.firstName} {primaryLecturer.user.lastName}
							</span>
						</div>
					)}

					{/* Stats */}
					<div className="flex items-center gap-4 text-sm">
						{upcomingDeadlines > 0 && (
							<div className="flex items-center gap-1 text-warning">
								<Icon icon="solar:calendar-mark-bold-duotone" size={16} />
								<span className="font-medium">{upcomingDeadlines} due</span>
							</div>
						)}
						{unreadAnnouncements > 0 && (
							<div className="flex items-center gap-1 text-info">
								<Icon icon="solar:bell-bold-duotone" size={16} />
								<span className="font-medium">{unreadAnnouncements} new</span>
							</div>
						)}
						{instance.endDate && (
							<div className="flex items-center gap-1 text-text-secondary ml-auto">
								<Icon icon="solar:calendar-bold-duotone" size={16} />
								<span>{format(new Date(instance.endDate), "MMM dd, yyyy")}</span>
							</div>
						)}
					</div>

					{/* Action */}
					<Button className="w-full" variant="outline" onClick={() => onViewCourse(instance.id)}>
						<Icon icon="solar:login-2-bold-duotone" size={18} className="mr-2" />
						Go to Course
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
