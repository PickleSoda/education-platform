import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Icon } from "@/components/icon";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import courseService, { type CreateCourseReq } from "@/api/services/courseService";
import { toast } from "sonner";
import { useRouter } from "@/routes/hooks";

export default function CreateCoursePage() {
	const { push } = useRouter();
	const queryClient = useQueryClient();

	const [formData, setFormData] = useState<CreateCourseReq>({
		code: "",
		title: "",
		description: "",
		credits: undefined,
		typicalDurationWeeks: undefined,
		tags: [],
		lecturerIds: [],
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateCourseReq) => courseService.createCourse(data),
		onSuccess: (response) => {
			toast.success("Course created successfully");
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			// Redirect to edit page to add more details
			push(`/management/course/edit/${response.data?.id}`);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create course");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.code || !formData.title) {
			toast.error("Course code and title are required");
			return;
		}

		createMutation.mutate(formData);
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<Card className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => push("/management/course")}>
							<Icon icon="solar:arrow-left-line-duotone" size={20} />
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Create New Course</h1>
							<p className="text-sm text-text-secondary mt-1">Fill in basic information to create a course template</p>
						</div>
					</div>
				</div>
			</Card>

			{/* Form */}
			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Icon icon="solar:document-bold-duotone" size={24} className="text-primary" />
							<div>
								<h3 className="text-lg font-semibold">Basic Information</h3>
								<p className="text-sm text-text-secondary">Required details about the course</p>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="code">
									Course Code <span className="text-error">*</span>
								</Label>
								<Input
									id="code"
									placeholder="e.g., CS-101, MATH-201"
									value={formData.code}
									onChange={(e) => setFormData({ ...formData, code: e.target.value })}
									required
								/>
								<p className="text-xs text-text-secondary">A unique identifier for the course</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="credits">Credits</Label>
								<Input
									id="credits"
									type="number"
									min={0}
									placeholder="e.g., 3, 6"
									value={formData.credits || ""}
									onChange={(e) =>
										setFormData({ ...formData, credits: e.target.value ? Number(e.target.value) : undefined })
									}
								/>
								<p className="text-xs text-text-secondary">ECTS or credit hours</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="title">
								Course Title <span className="text-error">*</span>
							</Label>
							<Input
								id="title"
								placeholder="e.g., Introduction to Computer Science"
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								required
							/>
							<p className="text-xs text-text-secondary">The full name of the course</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Provide a detailed description of the course, including objectives, prerequisites, and what students will learn..."
								rows={6}
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							/>
							<p className="text-xs text-text-secondary">
								This will be shown to students when browsing courses (optional but recommended)
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="typicalDurationWeeks">Typical Duration (weeks)</Label>
							<Input
								id="typicalDurationWeeks"
								type="number"
								min={1}
								placeholder="e.g., 12, 14, 16"
								value={formData.typicalDurationWeeks || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										typicalDurationWeeks: e.target.value ? Number(e.target.value) : undefined,
									})
								}
							/>
							<p className="text-xs text-text-secondary">
								How many weeks does this course typically run (e.g., semester length)
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Next Steps Info */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Icon icon="solar:info-circle-bold-duotone" size={24} className="text-info" />
							<div>
								<h3 className="text-lg font-semibold">What&apos;s Next?</h3>
								<p className="text-sm text-text-secondary">After creating the course, you can add:</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<ul className="space-y-2 text-sm text-text-secondary">
							<li className="flex items-center gap-2">
								<Icon icon="solar:tag-bold-duotone" size={16} className="text-primary" />
								<span>
									<strong>Tags:</strong> Categorize your course (e.g., Programming, Mathematics, Data Science)
								</span>
							</li>
							<li className="flex items-center gap-2">
								<Icon icon="solar:users-group-rounded-bold-duotone" size={16} className="text-primary" />
								<span>
									<strong>Lecturers:</strong> Assign teaching staff to the course
								</span>
							</li>
							<li className="flex items-center gap-2">
								<Icon icon="solar:document-text-bold-duotone" size={16} className="text-primary" />
								<span>
									<strong>Assignment Templates:</strong> Define grading structure and assignment types
								</span>
							</li>
							<li className="flex items-center gap-2">
								<Icon icon="solar:calendar-bold-duotone" size={16} className="text-primary" />
								<span>
									<strong>Course Instances:</strong> Create specific offerings for different semesters
								</span>
							</li>
						</ul>
					</CardContent>
				</Card>

				{/* Actions */}
				<Card className="p-6">
					<div className="flex items-center justify-between">
						<Button type="button" variant="outline" onClick={() => push("/management/course")}>
							<Icon icon="solar:close-circle-bold-duotone" size={18} className="mr-2" />
							Cancel
						</Button>
						<Button type="submit" disabled={createMutation.isPending || !formData.code || !formData.title} size="lg">
							{createMutation.isPending ? (
								<>
									<Icon icon="solar:loading-bold" size={18} className="mr-2 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
									Create Course
								</>
							)}
						</Button>
					</div>
				</Card>
			</form>
		</div>
	);
}
