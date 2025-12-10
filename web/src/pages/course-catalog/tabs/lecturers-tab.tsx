import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import type { Course } from "#/entity";

interface LecturersTabProps {
	course: Course;
}

export default function LecturersTab({ course }: LecturersTabProps) {
	return (
		<Card>
			<CardHeader>
				<h3 className="text-lg font-semibold">Course Lecturers</h3>
				<p className="text-sm text-text-secondary">Teaching staff for this course</p>
			</CardHeader>
			<CardContent>
				{!course.lecturers || course.lecturers.length === 0 ? (
					<div className="text-center py-12 text-text-secondary">
						<Icon icon="solar:users-group-rounded-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
						<p>No lecturers assigned yet</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{course.lecturers.map((lecturer) => (
							<Card key={lecturer.userId}>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
											<span className="text-xl font-medium">
												{lecturer.user.firstName[0]}
												{lecturer.user.lastName[0]}
											</span>
										</div>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<p className="font-semibold truncate">
													{lecturer.user.firstName} {lecturer.user.lastName}
												</p>
												{lecturer.isPrimary && <Badge variant="info">Primary</Badge>}
											</div>
											<p className="text-sm text-text-secondary truncate">{lecturer.user.email}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
