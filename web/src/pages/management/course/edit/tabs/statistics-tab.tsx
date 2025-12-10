import { Card, CardContent, CardHeader } from "@/ui/card";
import { Skeleton } from "@/ui/skeleton";
import { Icon } from "@/components/icon";
import { CourseStats } from "@/types/entity";

interface StatisticsTabProps {
	courseId: string;
	stats?: CourseStats;
	isLoading: boolean;
}

export function StatisticsTab({ courseId, stats, isLoading }: StatisticsTabProps) {
	console.log("StatisticsTab props:", { courseId, stats, isLoading });
	if (isLoading || !stats) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{[...Array(6)].map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<Skeleton className="h-24 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Course Information */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Course Information</h3>
					<p className="text-sm text-text-secondary">Basic course details and metadata</p>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<div className="space-y-3">
								<div>
									<span className="text-sm font-medium text-text-secondary">Course Code</span>
									<p className="text-lg font-semibold">{stats.code}</p>
								</div>
								<div>
									<span className="text-sm font-medium text-text-secondary">Course Title</span>
									<p className="text-lg font-semibold">{stats.title}</p>
								</div>
								<div>
									<span className="text-sm font-medium text-text-secondary">Tags</span>
									<div className="flex flex-wrap gap-2 mt-1">
										{stats.tags.length > 0 ? (
											stats.tags.map((tag) => (
												<span
													key={tag}
													className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
												>
													{tag}
												</span>
											))
										) : (
											<span className="text-sm text-text-secondary">No tags assigned</span>
										)}
									</div>
								</div>
							</div>
						</div>
						<div>
							<div className="space-y-3">
								<div>
									<span className="text-sm font-medium text-text-secondary">Total Lecturers</span>
									<p className="text-lg font-semibold">{stats.lecturers}</p>
								</div>
								{stats.primaryLecturer && (
									<div>
										<span className="text-sm font-medium text-text-secondary">Primary Lecturer</span>
										<div className="flex items-center gap-3 mt-2 p-3 border rounded-lg">
											<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
												<span className="text-sm font-medium">
													{stats.primaryLecturer.firstName[0]}
													{stats.primaryLecturer.lastName[0]}
												</span>
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium">
													{stats.primaryLecturer.firstName} {stats.primaryLecturer.lastName}
												</p>
												<p className="text-xs text-text-secondary truncate">{stats.primaryLecturer.email}</p>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Overview Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Icon icon="solar:calendar-bold-duotone" size={24} className="text-primary" />
							<h4 className="text-sm font-medium text-text-secondary">Instances</h4>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{stats.totalInstances}</div>
						<p className="text-xs text-text-secondary mt-1">Course offerings</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Icon icon="solar:document-text-bold-duotone" size={24} className="text-warning" />
							<h4 className="text-sm font-medium text-text-secondary">Assignments</h4>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{stats.totalAssignments}</div>
						<p className="text-xs text-text-secondary mt-1">Assignment templates</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Icon icon="solar:book-bold-duotone" size={24} className="text-success" />
							<h4 className="text-sm font-medium text-text-secondary">Syllabus Items</h4>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{stats.totalSyllabusItems}</div>
						<p className="text-xs text-text-secondary mt-1">Curriculum topics</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Icon icon="solar:folder-with-files-bold-duotone" size={24} className="text-info" />
							<h4 className="text-sm font-medium text-text-secondary">Resources</h4>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{stats.totalResources}</div>
						<p className="text-xs text-text-secondary mt-1">Learning materials</p>
					</CardContent>
				</Card>
			</div>

			{/* Detailed Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Enrollment Trends</h3>
						<p className="text-sm text-text-secondary">Student enrollment over semesters</p>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center h-64 text-text-secondary">
							<div className="text-center">
								<Icon icon="solar:chart-bold-duotone" size={48} className="mx-auto mb-2 opacity-50" />
								<p className="text-sm">Chart visualization coming soon</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Assignment Completion</h3>
						<p className="text-sm text-text-secondary">Average completion rates by assignment type</p>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center h-64 text-text-secondary">
							<div className="text-center">
								<Icon icon="solar:pie-chart-bold-duotone" size={48} className="mx-auto mb-2 opacity-50" />
								<p className="text-sm">Chart visualization coming soon</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Student Performance</h3>
						<p className="text-sm text-text-secondary">Grade distribution across instances</p>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center h-64 text-text-secondary">
							<div className="text-center">
								<Icon icon="solar:graph-bold-duotone" size={48} className="mx-auto mb-2 opacity-50" />
								<p className="text-sm">Chart visualization coming soon</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Instance Activity</h3>
						<p className="text-sm text-text-secondary">Resource usage and engagement metrics</p>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center h-64 text-text-secondary">
							<div className="text-center">
								<Icon icon="solar:chart-2-bold-duotone" size={48} className="mx-auto mb-2 opacity-50" />
								<p className="text-sm">Chart visualization coming soon</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
