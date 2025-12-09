import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import courseService, { type CreateCourseReq, type UpdateCourseReq } from "@/api/services/courseService";
import userService from "@/api/services/userService";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Select, Spin } from "antd";
import { toast } from "sonner";

type CourseFormData = {
	code: string;
	title: string;
	description?: string;
	credits?: number;
	typicalDurationWeeks?: number;
	tags?: string[];
	lecturerIds?: string[];
};

export default function CourseFormPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isEditMode = !!id;

	const form = useForm<CourseFormData>({
		defaultValues: {
			code: "",
			title: "",
			description: "",
			credits: 3,
			typicalDurationWeeks: 15,
			tags: [],
			lecturerIds: [],
		},
	});

	// Fetch course data if editing
	const { data: courseData, isLoading: isCourseLoading } = useQuery({
		queryKey: ["course", id],
		queryFn: () => courseService.getCourseById(id!),
		enabled: isEditMode,
	});

	// Fetch tags for selection
	const { data: tagsData, isLoading: isTagsLoading } = useQuery({
		queryKey: ["tags"],
		queryFn: () => courseService.getAllTags(),
	});

	// Fetch users (lecturers)
	const { data: usersData, isLoading: isUsersLoading } = useQuery({
		queryKey: ["users", "lecturers"],
		queryFn: () => userService.listUsers({ limit: "100" }),
	});

	const tags = tagsData?.data || [];
	const users = usersData?.data || [];

	// Populate form when editing
	useEffect(() => {
		if (courseData?.data) {
			const course = courseData.data;
			form.reset({
				code: course.code,
				title: course.title,
				description: course.description || "",
				credits: course.credits || 3,
				typicalDurationWeeks: course.typicalDurationWeeks || 15,
				tags: course.tags?.map((ct) => String(ct.tag.id)) || [],
				lecturerIds: course.lecturers?.map((l) => l.userId) || [],
			});
		}
	}, [courseData, form]);

	// Create mutation
	const createMutation = useMutation({
		mutationFn: (data: CreateCourseReq) => courseService.createCourse(data),
		onSuccess: () => {
			toast.success("Course created successfully");
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			navigate("/management/course");
		},
		onError: () => {
			toast.error("Failed to create course");
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: (data: UpdateCourseReq) => courseService.updateCourse(id!, data),
		onSuccess: async () => {
			toast.success("Course updated successfully");
			await queryClient.invalidateQueries({ queryKey: ["courses"] });
			await queryClient.invalidateQueries({ queryKey: ["course", id] });
			navigate("/management/course");
		},
		onError: () => {
			toast.error("Failed to update course");
		},
	});

	const onSubmit = (data: CourseFormData) => {
		const payload = {
			code: data.code,
			title: data.title,
			description: data.description || undefined,
			credits: data.credits || undefined,
			typicalDurationWeeks: data.typicalDurationWeeks || undefined,
			tags: data.tags,
			lecturerIds: data.lecturerIds,
		};

		if (isEditMode) {
			// For update, exclude tags and lecturerIds from main payload
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { tags: _tags, lecturerIds: _lecturerIds, ...updatePayload } = payload;
			updateMutation.mutate(updatePayload);
		} else {
			createMutation.mutate(payload as CreateCourseReq);
		}
	};

	if (isCourseLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-2xl font-bold">{isEditMode ? "Edit Course" : "Create Course"}</h2>
						<p className="text-sm text-text-secondary mt-1">
							{isEditMode ? "Update course information" : "Add a new course to the catalog"}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="code"
								rules={{ required: "Course code is required" }}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Course Code *</FormLabel>
										<FormControl>
											<Input {...field} placeholder="e.g., CS101" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="credits"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Credits</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="number"
												min={0}
												placeholder="3"
												onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="title"
							rules={{ required: "Course title is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Course Title *</FormLabel>
									<FormControl>
										<Input {...field} placeholder="e.g., Introduction to Computer Science" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea {...field} rows={4} placeholder="Enter course description..." />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="typicalDurationWeeks"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Duration (Weeks)</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="number"
											min={1}
											placeholder="15"
											onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{!isEditMode && (
							<>
								<FormField
									control={form.control}
									name="tags"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tags</FormLabel>
											<FormControl>
												<Select
													{...field}
													mode="multiple"
													placeholder="Select tags"
													loading={isTagsLoading}
													style={{ width: "100%" }}
													options={tags.map((tag) => ({
														label: tag.name,
														value: String(tag.id),
													}))}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="lecturerIds"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Lecturers</FormLabel>
											<FormControl>
												<Select
													{...field}
													mode="multiple"
													placeholder="Select lecturers"
													loading={isUsersLoading}
													style={{ width: "100%" }}
													showSearch
													filterOption={(input, option) =>
														(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
													}
													options={users.map((user) => ({
														label: `${user.firstName} ${user.lastName} (${user.email})`,
														value: user.id,
													}))}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</>
						)}

						<div className="flex justify-end gap-4">
							<Button type="button" variant="outline" onClick={() => navigate("/management/course")}>
								Cancel
							</Button>
							<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
								{isEditMode ? "Update Course" : "Create Course"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
