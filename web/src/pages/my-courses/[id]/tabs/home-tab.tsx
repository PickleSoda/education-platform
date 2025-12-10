import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import type { CourseInstance, PublishedAssignment, EnrollmentWithRelations } from "#/entity";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
interface HomeTabProps {
	instance: CourseInstance;
	assignments: PublishedAssignment[];
	enrollment?: EnrollmentWithRelations;
}

export default function HomeTab({ instance, assignments, enrollment }: HomeTabProps) {
	// Get upcoming assignments (next 5, not past deadline)
	const upcomingAssignments = assignments
		.filter((a) => a.status === "published" && isFuture(new Date(a.deadline)))
		.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
		.slice(0, 5);

	// Get overdue assignments
	const overdueAssignments = assignments.filter((a) => a.status === "published" && isPast(new Date(a.deadline)));

	// Calculate progress (simplified - would need submission data for real progress)
	const totalAssignments = assignments.filter((a) => a.status === "published").length;

	const assignmentTypeColors: Record<string, "info" | "warning" | "error" | "success" | "default"> = {
		homework: "info",
		quiz: "warning",
		midterm: "error",
		final: "error",
		project: "success",
		participation: "default",
	};

	return (
		<div className="grid gap-6 md:grid-cols-3">
			{/* Main Content - 2 columns */}
			<div className="md:col-span-2 space-y-6">
				{/* Welcome Card */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-start gap-4">
							<div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
								<Icon icon="solar:book-bookmark-bold-duotone" size={32} className="text-primary" />
							</div>
							<div className="flex-1">
								<h2 className="text-xl font-semibold mb-2">Welcome to {instance.course?.code}</h2>
								<p className="text-text-secondary">
									{instance.semester} • {instance.course?.credits || 0} Credits
								</p>
								{enrollment && (
									<p className="text-sm text-text-secondary mt-2">
										Enrolled since {format(new Date(enrollment.enrolledAt), "MMMM dd, yyyy")}
									</p>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Announcements Placeholder */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Icon icon="solar:bell-bold-duotone" size={20} className="text-primary" />
								<h3 className="text-lg font-semibold">Announcements</h3>
							</div>
							<Button variant="ghost" size="sm">
								View All
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center justify-center py-8 text-text-secondary">
							<Icon icon="solar:bell-off-bold-duotone" size={48} className="opacity-50 mb-4" />
							<p>No announcements yet</p>
						</div>
					</CardContent>
				</Card>

				{/* Upcoming Deadlines */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Icon icon="solar:calendar-mark-bold-duotone" size={20} className="text-primary" />
								<h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
							</div>
							<Button variant="ghost" size="sm" onClick={() => {}}>
								View All
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{upcomingAssignments.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-8 text-text-secondary">
								<Icon icon="solar:calendar-minimalistic-bold-duotone" size={48} className="opacity-50 mb-4" />
								<p>No upcoming deadlines</p>
							</div>
						) : (
							<div className="space-y-3">
								{upcomingAssignments.map((assignment) => {
									const deadline = new Date(assignment.deadline);
									const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
									const urgencyColor =
										daysUntil <= 1 ? "text-error" : daysUntil <= 3 ? "text-warning" : "text-text-secondary";

									return (
										<div
											key={assignment.id}
											className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
										>
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
													<Icon icon="solar:document-text-bold-duotone" size={20} className="text-primary" />
												</div>
												<div>
													<p className="font-medium">{assignment.title}</p>
													<div className="flex items-center gap-2">
														<Badge
															variant={assignmentTypeColors[assignment.assignmentType] || "default"}
															className="text-xs"
														>
															{assignment.assignmentType}
														</Badge>
														{assignment.maxPoints && (
															<span className="text-xs text-text-secondary">{assignment.maxPoints} pts</span>
														)}
													</div>
												</div>
											</div>
											<div className="text-right">
												<p className={`text-sm font-medium ${urgencyColor}`}>
													{formatDistanceToNow(deadline, { addSuffix: true })}
												</p>
												<p className="text-xs text-text-secondary">{format(deadline, "MMM dd, h:mm a")}</p>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Sidebar - 1 column */}
			<div className="space-y-6">
				{/* Current Grade Widget */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Icon icon="solar:chart-2-bold-duotone" size={20} className="text-primary" />
							<h3 className="font-semibold">Current Grade</h3>
						</div>
					</CardHeader>
					<CardContent>
						{enrollment?.finalGrade !== null && enrollment?.finalGrade !== undefined ? (
							<div className="text-center">
								<div className="text-4xl font-bold text-primary">{enrollment.finalGrade}%</div>
								<p className="text-sm text-text-secondary mt-1">Final Grade</p>
							</div>
						) : (
							<div className="text-center py-4">
								<div className="text-3xl font-bold text-text-secondary">--</div>
								<p className="text-sm text-text-secondary mt-1">No grades yet</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Icon icon="solar:graph-new-bold-duotone" size={20} className="text-primary" />
							<h3 className="font-semibold">Quick Stats</h3>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-text-secondary">Total Assignments</span>
							<span className="font-semibold">{totalAssignments}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-text-secondary">Upcoming</span>
							<span className="font-semibold">{upcomingAssignments.length}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-text-secondary">Overdue</span>
							<span className={`font-semibold ${overdueAssignments.length > 0 ? "text-error" : ""}`}>
								{overdueAssignments.length}
							</span>
						</div>
						{instance._count && (
							<>
								<div className="flex items-center justify-between">
									<span className="text-text-secondary">Resources</span>
									<span className="font-semibold">{instance._count.publishedResources || 0}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-text-secondary">Classmates</span>
									<span className="font-semibold">{instance._count.enrollments || 0}</span>
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Quick Links */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Icon icon="solar:link-bold-duotone" size={20} className="text-primary" />
							<h3 className="font-semibold">Quick Links</h3>
						</div>
					</CardHeader>
					<CardContent className="space-y-2">
						<Button variant="outline" className="w-full justify-start" onClick={() => {}}>
							<Icon icon="solar:document-text-bold-duotone" size={18} className="mr-2" />
							Syllabus
						</Button>
						<Button variant="outline" className="w-full justify-start" onClick={() => {}}>
							<Icon icon="solar:chat-round-dots-bold-duotone" size={18} className="mr-2" />
							Discussion Forums
						</Button>
						<Button variant="outline" className="w-full justify-start" onClick={() => {}}>
							<Icon icon="solar:users-group-rounded-bold-duotone" size={18} className="mr-2" />
							Office Hours
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
