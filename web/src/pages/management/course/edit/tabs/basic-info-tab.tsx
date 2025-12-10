import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import type { Course } from "#/entity";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import courseService, { type CreateCourseReq, type UpdateCourseReq } from "@/api/services/courseService";
import { toast } from "sonner";
import { useRouter } from "@/routes/hooks";

interface BasicInfoTabProps {
	course?: Course;
	isCreateMode: boolean;
}

export function BasicInfoTab({ course, isCreateMode }: BasicInfoTabProps) {
	const { push } = useRouter();
	const queryClient = useQueryClient();

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm<CreateCourseReq | UpdateCourseReq>({
		defaultValues: {
			code: course?.code || "",
			title: course?.title || "",
			description: course?.description || "",
			credits: course?.credits || undefined,
			typicalDurationWeeks: course?.typicalDurationWeeks || undefined,
		},
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateCourseReq) => courseService.createCourse(data),
		onSuccess: (response) => {
			toast.success("Course created successfully");
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			push(`/management/courses/edit/${response.data?.id}`);
		},
		onError: () => {
			toast.error("Failed to create course");
		},
	});

	const updateMutation = useMutation({
		mutationFn: (data: UpdateCourseReq) => courseService.updateCourse(course!.id, data),
		onSuccess: () => {
			toast.success("Course updated successfully");
			queryClient.invalidateQueries({ queryKey: ["course", course!.id] });
			queryClient.invalidateQueries({ queryKey: ["courses"] });
		},
		onError: () => {
			toast.error("Failed to update course");
		},
	});

	const onSubmit = (data: CreateCourseReq | UpdateCourseReq) => {
		if (isCreateMode) {
			createMutation.mutate(data as CreateCourseReq);
		} else {
			updateMutation.mutate(data);
		}
	};

	const isLoading = createMutation.isPending || updateMutation.isPending;

	return (
		<Card>
			<CardHeader>
				<h3 className="text-lg font-semibold">Basic Information</h3>
				<p className="text-sm text-text-secondary">
					{isCreateMode ? "Create a new course" : "Update course basic information"}
				</p>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="code">Course Code *</Label>
							<Input
								id="code"
								placeholder="e.g., CS-101"
								{...register("code", { required: "Course code is required" })}
								onError={() => toast.error(errors.code?.message)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="credits">Credits</Label>
							<Input
								id="credits"
								type="number"
								placeholder="e.g., 6"
								{...register("credits", { valueAsNumber: true })}
								onError={() => toast.error(errors.credits?.message)}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="title">Course Title *</Label>
						<Input
							id="title"
							placeholder="e.g., Introduction to Computer Science"
							{...register("title", { required: "Course title is required" })}
							onError={() => toast.error(errors.title?.message)}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							placeholder="Provide a detailed description of the course..."
							rows={6}
							{...register("description")}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="typicalDurationWeeks">Typical Duration (weeks)</Label>
						<Input
							id="typicalDurationWeeks"
							type="number"
							placeholder="e.g., 14"
							{...register("typicalDurationWeeks", { valueAsNumber: true })}
							onError={() => toast.error(errors.typicalDurationWeeks?.message)}
						/>
					</div>

					<div className="flex items-center gap-3">
						<Button type="submit" disabled={!isDirty || isLoading}>
							{isLoading ? "Saving..." : isCreateMode ? "Create Course" : "Save Changes"}
						</Button>
						<Button type="button" variant="outline" onClick={() => push("/management/courses")}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
