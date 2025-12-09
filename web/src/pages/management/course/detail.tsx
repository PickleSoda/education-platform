import { useParams } from "@/routes/hooks";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Course } from "#/entity";
import courseService from "@/api/services/courseService";

export default function CourseDetail() {
	const { id } = useParams();

	const { data, isLoading } = useQuery({
		queryKey: ["course", id],
		queryFn: () => courseService.getCourseById(id as string),
		enabled: !!id,
	});

	const course: Course | undefined = data?.data;

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!course) {
		return <div>Course not found</div>;
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-2xl font-bold">{course.code}</span>
						<Badge variant={course.isArchived ? "error" : "success"}>{course.isArchived ? "Archived" : "Active"}</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div>
						<h3 className="text-lg font-semibold mb-2">Course Information</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<span className="text-sm text-text-secondary">Title:</span>
								<p className="text-sm font-medium">{course.title}</p>
							</div>
							<div>
								<span className="text-sm text-text-secondary">Credits:</span>
								<p className="text-sm font-medium">{course.credits}</p>
							</div>
							<div className="col-span-2">
								<span className="text-sm text-text-secondary">Description:</span>
								<p className="text-sm">{course.description || "No description available"}</p>
							</div>
						</div>
					</div>
					{course.tags && course.tags.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-2">Tags</h3>
							<div className="flex flex-wrap gap-2">
								{course.tags.map((courseTag) => (
									<Badge
										key={courseTag.tag.id}
										variant="outline"
										style={{ borderColor: courseTag.tag.color || undefined }}
									>
										{courseTag.tag.name}
									</Badge>
								))}
							</div>
						</div>
					)}{" "}
					{course.lecturers && course.lecturers.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-2">Lecturers</h3>
							<div className="space-y-2">
								{course.lecturers.map((lecturer) => (
									<div key={lecturer.userId} className="flex items-center gap-2">
										<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
											<span className="text-sm font-medium">
												{lecturer.user.firstName[0]}
												{lecturer.user.lastName[0]}
											</span>
										</div>
										<div className="flex flex-col flex-1">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">
													{lecturer.user.firstName} {lecturer.user.lastName}
												</span>
												{lecturer.isPrimary && <Badge variant="info">Primary</Badge>}
											</div>
											<span className="text-xs text-text-secondary">{lecturer.user.email}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					)}{" "}
					<div>
						<h3 className="text-lg font-semibold mb-2">Metadata</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<span className="text-text-secondary">Created:</span>
								<p>{new Date(course.createdAt).toLocaleString()}</p>
							</div>
							<div>
								<span className="text-text-secondary">Last Updated:</span>
								<p>{new Date(course.updatedAt).toLocaleString()}</p>
							</div>
							{course.typicalDurationWeeks && (
								<div className="col-span-2">
									<span className="text-text-secondary">Typical Duration:</span>
									<p>{course.typicalDurationWeeks} weeks</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
