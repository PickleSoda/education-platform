import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Input } from "@/ui/input";
import type { CourseInstance } from "#/entity";
import { useState } from "react";

interface PeopleTabProps {
	instance: CourseInstance;
}

export default function PeopleTab({ instance }: PeopleTabProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const lecturers = instance.lecturers || [];

	// Students would be fetched from enrollment API
	const students: any[] = [];

	const filteredStudents = students.filter((student) => {
		if (!searchQuery) return true;
		const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
		return (
			fullName.includes(searchQuery.toLowerCase()) || student.email.toLowerCase().includes(searchQuery.toLowerCase())
		);
	});

	return (
		<div className="space-y-6">
			{/* Lecturers Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Icon icon="solar:user-check-bold-duotone" size={20} className="text-primary" />
						<h3 className="text-lg font-semibold">Lecturers</h3>
						<Badge variant="outline">{lecturers.length}</Badge>
					</div>
					<p className="text-sm text-text-secondary">Course instructors and teaching assistants</p>
				</CardHeader>
				<CardContent>
					{lecturers.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-text-secondary">
							<Icon icon="solar:user-bold-duotone" size={48} className="opacity-50 mb-4" />
							<p>No lecturers assigned</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{lecturers.map((lecturer) => (
								<div
									key={lecturer.userId}
									className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
								>
									<div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
										<span className="text-lg font-semibold">
											{lecturer.user.firstName[0]}
											{lecturer.user.lastName[0]}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="font-semibold truncate">
												{lecturer.user.firstName} {lecturer.user.lastName}
											</p>
											{lecturer.role === "primary" && (
												<Badge variant="info" className="text-xs">
													Primary
												</Badge>
											)}
										</div>
										<p className="text-sm text-text-secondary truncate">{lecturer.user.email}</p>
										<div className="flex items-center gap-2 mt-2">
											<Button variant="ghost" size="sm">
												<Icon icon="solar:letter-bold-duotone" size={16} className="mr-1" />
												Email
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Students Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<div className="flex items-center gap-2">
								<Icon icon="solar:users-group-rounded-bold-duotone" size={20} className="text-primary" />
								<h3 className="text-lg font-semibold">Classmates</h3>
								<Badge variant="outline">{instance._count?.enrollments || 0}</Badge>
							</div>
							<p className="text-sm text-text-secondary">Students enrolled in this course</p>
						</div>
						<div className="w-64">
							<Input
								placeholder="Search students..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full"
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{students.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-text-secondary">
							<Icon icon="solar:users-group-rounded-bold-duotone" size={64} className="opacity-50 mb-4" />
							<p className="text-lg font-medium mb-2">Student list not available</p>
							<p className="text-sm text-center max-w-md">
								The student list may be hidden by your instructor for privacy reasons, or the course enrollment data is
								still loading.
							</p>
						</div>
					) : filteredStudents.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-text-secondary">
							<Icon icon="solar:magnifer-bold-duotone" size={48} className="opacity-50 mb-4" />
							<p>No students found matching {searchQuery}</p>
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{filteredStudents.map((student) => (
								<div
									key={student.id}
									className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
								>
									<div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
										<span className="text-sm font-medium">
											{student.firstName[0]}
											{student.lastName[0]}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">
											{student.firstName} {student.lastName}
										</p>
										<p className="text-xs text-text-secondary truncate">{student.email}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Forums Section */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Icon icon="solar:chat-round-dots-bold-duotone" size={20} className="text-primary" />
						<h3 className="text-lg font-semibold">Discussion Forums</h3>
						<Badge variant="outline">{instance.forums?.length || 0}</Badge>
					</div>
					<p className="text-sm text-text-secondary">Connect with classmates and instructors</p>
				</CardHeader>
				<CardContent>
					{!instance.forums || instance.forums.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-8 text-text-secondary">
							<Icon icon="solar:chat-round-dots-bold-duotone" size={48} className="opacity-50 mb-4" />
							<p>No forums available</p>
						</div>
					) : (
						<div className="grid gap-3 md:grid-cols-2">
							{instance.forums.map((forum) => (
								<Button key={forum.id} variant="outline" className="h-auto p-4 justify-start text-left">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
											<Icon icon="solar:chat-round-dots-bold-duotone" size={20} className="text-primary" />
										</div>
										<div>
											<p className="font-medium">{forum.title}</p>
											<p className="text-xs text-text-secondary capitalize">{forum.forumType.replace("_", " ")}</p>
										</div>
									</div>
								</Button>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
