import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import type { CourseLecturer } from "#/entity";
import { Icon } from "@/components/icon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import courseService from "@/api/services/courseService";
import { toast } from "sonner";

interface LecturersTabProps {
	courseId: string;
	lecturers: CourseLecturer[];
}

export function LecturersTab({ courseId, lecturers }: LecturersTabProps) {
	const queryClient = useQueryClient();

	const removeLecturerMutation = useMutation({
		mutationFn: (userId: string) => courseService.removeLecturer(courseId, userId),
		onSuccess: () => {
			toast.success("Lecturer removed successfully");
			queryClient.invalidateQueries({ queryKey: ["course", courseId] });
		},
		onError: () => {
			toast.error("Failed to remove lecturer");
		},
	});

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{/* Current Lecturers */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Current Lecturers</h3>
					<p className="text-sm text-text-secondary">Teaching staff assigned to this course</p>
				</CardHeader>
				<CardContent>
					{lecturers.length === 0 ? (
						<div className="text-center py-8 text-text-secondary">
							<Icon icon="solar:users-group-rounded-bold-duotone" size={48} className="mx-auto mb-2 opacity-50" />
							<p>No lecturers assigned yet</p>
						</div>
					) : (
						<div className="space-y-3">
							{lecturers.map((lecturer) => (
								<div key={lecturer.userId} className="flex items-center gap-3 p-3 border rounded-lg">
									<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<span className="text-sm font-medium">
											{lecturer.user.firstName[0]}
											{lecturer.user.lastName[0]}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium truncate">
												{lecturer.user.firstName} {lecturer.user.lastName}
											</span>
											{lecturer.isPrimary && (
												<Badge variant="info" className="text-xs">
													Primary
												</Badge>
											)}
										</div>
										<span className="text-xs text-text-secondary truncate block">{lecturer.user.email}</span>
									</div>
									<div className="flex items-center gap-1">
										{!lecturer.isPrimary && (
											<Button
												variant="ghost"
												size="icon"
												title="Set as primary"
												onClick={() => {
													// TODO: Implement set as primary
													toast.info("Set as primary functionality coming soon");
												}}
											>
												<Icon icon="solar:star-bold-duotone" size={16} />
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon"
											title="Remove lecturer"
											onClick={() => removeLecturerMutation.mutate(lecturer.userId)}
											disabled={removeLecturerMutation.isPending}
										>
											<Icon icon="solar:trash-bin-trash-bold-duotone" size={16} className="text-error" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Lecturer */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Add Lecturer</h3>
					<p className="text-sm text-text-secondary">Search and add teaching staff to this course</p>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="text-center py-8 text-text-secondary">
							<Icon icon="solar:add-circle-bold-duotone" size={48} className="mx-auto mb-2 opacity-50" />
							<p className="text-sm mb-4">Lecturer search functionality coming soon</p>
							<Button variant="outline" disabled>
								<Icon icon="solar:magnifer-linear" size={18} className="mr-2" />
								Search Teachers
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
