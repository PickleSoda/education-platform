import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Switch } from "@/ui/switch";
import { Label } from "@/ui/label";
import type { CourseInstance } from "#/entity";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import courseInstanceService from "@/api/services/courseInstanceService";
import { toast } from "sonner";

interface OverviewTabProps {
	instance: CourseInstance;
}

export function OverviewTab({ instance }: OverviewTabProps) {
	const queryClient = useQueryClient();

	const toggleEnrollmentMutation = useMutation({
		mutationFn: (isOpen: boolean) => courseInstanceService.toggleEnrollment(instance.id, { isOpen }),
		onSuccess: () => {
			toast.success("Enrollment setting updated");
			queryClient.invalidateQueries({ queryKey: ["instance", instance.id] });
		},
		onError: () => {
			toast.error("Failed to update enrollment setting");
		},
	});

	return (
		<div className="grid grid-cols-2 gap-6">
			{/* Course Information */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Icon icon="solar:book-2-bold-duotone" size={20} className="text-primary" />
						<span className="font-medium">Course Information</span>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label className="text-text-secondary">Course Title</Label>
						<p className="font-medium">{instance.course?.title}</p>
					</div>
					<div>
						<Label className="text-text-secondary">Course Code</Label>
						<p className="font-medium">{instance.course?.code}</p>
					</div>
					<div>
						<Label className="text-text-secondary">Description</Label>
						<p className="text-sm">{instance.course?.description || "No description available"}</p>
					</div>
					<div className="flex gap-8">
						<div>
							<Label className="text-text-secondary">Credits</Label>
							<p className="font-medium">{instance.course?.credits}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Instance Settings */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Icon icon="solar:settings-bold-duotone" size={20} className="text-info" />
						<span className="font-medium">Instance Settings</span>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label className="text-text-secondary">Semester</Label>
						<p className="font-medium">{instance.semester}</p>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label className="text-text-secondary">Start Date</Label>
							<p className="font-medium">{format(new Date(instance.startDate), "MMMM d, yyyy")}</p>
						</div>
						<div>
							<Label className="text-text-secondary">End Date</Label>
							<p className="font-medium">{format(new Date(instance.endDate), "MMMM d, yyyy")}</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label className="text-text-secondary">Enrollment Limit</Label>
							<p className="font-medium">{instance.enrollmentLimit || "Unlimited"}</p>
						</div>
						<div>
							<Label className="text-text-secondary">Current Enrollments</Label>
							<p className="font-medium">{instance._count?.enrollments || 0}</p>
						</div>
					</div>
					<div className="flex items-center justify-between rounded-lg border p-3">
						<div className="flex items-center gap-3">
							<Icon icon="solar:user-plus-bold-duotone" size={20} className="text-success" />
							<div>
								<p className="font-medium">Enrollment Open</p>
								<p className="text-xs text-text-secondary">Students can enroll in this course instance</p>
							</div>
						</div>
						<Switch
							checked={instance.enrollmentOpen}
							onCheckedChange={(checked) => toggleEnrollmentMutation.mutate(checked)}
							disabled={toggleEnrollmentMutation.isPending}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Instructors */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Icon icon="solar:user-check-bold-duotone" size={20} className="text-success" />
						<span className="font-medium">Instructors</span>
					</div>
				</CardHeader>
				<CardContent>
					{instance.lecturers && instance.lecturers.length > 0 ? (
						<div className="space-y-3">
							{instance.lecturers.map((lecturer) => (
								<div key={lecturer.userId} className="flex items-center gap-3 rounded-lg border p-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
										<Icon icon="solar:user-bold-duotone" size={20} className="text-primary" />
									</div>
									<div>
										<p className="font-medium">
											{lecturer.user?.firstName} {lecturer.user?.lastName}
										</p>
										<p className="text-xs text-text-secondary">{lecturer.user?.email}</p>
									</div>
									<Badge variant="outline" className="ml-auto">
										{lecturer.role}
									</Badge>
								</div>
							))}
						</div>
					) : (
						<p className="text-center text-text-secondary py-4">No instructors assigned</p>
					)}
				</CardContent>
			</Card>

			{/* Quick Stats */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Icon icon="solar:chart-2-bold-duotone" size={20} className="text-warning" />
						<span className="font-medium">Quick Stats</span>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4">
						<div className="rounded-lg bg-primary/5 p-4 text-center">
							<div className="text-2xl font-bold text-primary">{instance._count?.publishedAssignments || 0}</div>
							<div className="text-xs text-text-secondary">Assignments</div>
						</div>
						<div className="rounded-lg bg-info/5 p-4 text-center">
							<div className="text-2xl font-bold text-info">{instance._count?.publishedResources || 0}</div>
							<div className="text-xs text-text-secondary">Resources</div>
						</div>
						<div className="rounded-lg bg-success/5 p-4 text-center">
							<div className="text-2xl font-bold text-success">{instance._count?.enrollments || 0}</div>
							<div className="text-xs text-text-secondary">Students</div>
						</div>
						<div className="rounded-lg bg-warning/5 p-4 text-center">
							<div className="text-2xl font-bold text-warning">{instance.forums?.length || 0}</div>
							<div className="text-xs text-text-secondary">Forums</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
