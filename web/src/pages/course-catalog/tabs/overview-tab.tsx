import { Card, CardContent, CardHeader } from "@/ui/card";
import type { Course } from "#/entity";

interface OverviewTabProps {
	course: Course;
}

export default function OverviewTab({ course }: OverviewTabProps) {
	return (
		<Card>
			<CardHeader>
				<h3 className="text-lg font-semibold">Course Information</h3>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium text-text-secondary">Course Code</label>
							<p className="text-lg font-semibold">{course.code}</p>
						</div>
						<div>
							<label className="text-sm font-medium text-text-secondary">Credits</label>
							<p className="text-lg font-semibold">{course.credits}</p>
						</div>
						{course.typicalDurationWeeks && (
							<div>
								<label className="text-sm font-medium text-text-secondary">Typical Duration</label>
								<p className="text-lg font-semibold">{course.typicalDurationWeeks} weeks</p>
							</div>
						)}
					</div>
					<div className="space-y-4">
						<div>
							<label className="text-sm font-medium text-text-secondary">Description</label>
							<p className="text-sm">{course.description || "No description available"}</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
