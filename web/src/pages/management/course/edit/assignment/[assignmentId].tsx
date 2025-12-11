import { useParams, useRouter } from "@/routes/hooks";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Icon } from "@/components/icon";
import { Switch } from "@/ui/switch";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/ui/alert-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import assignmentService, { type CreateAssignmentTemplateReq } from "@/api/services/assignmentService";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { AssignmentType } from "@/types/entity";

export default function AssignmentTemplatePage() {
	const { id: courseId, assignmentId } = useParams();
	const { push } = useRouter();
	const queryClient = useQueryClient();
	const isCreateMode = assignmentId === "create";

	const [formData, setFormData] = useState<CreateAssignmentTemplateReq>({
		title: "",
		description: "",
		assignmentType: "homework",
		gradingMode: "points",
		maxPoints: 100,
		weightPercentage: 0,
		defaultDurationDays: 7,
		instructions: "",
	});

	const [gradingCriteria, setGradingCriteria] = useState<
		Array<{ id?: string; name: string; description: string; maxPoints: number; sortOrder: number }>
	>([]);

	const [deleteModal, setDeleteModal] = useState(false);

	// Fetch assignment template data if editing
	const { data: templateData, isLoading } = useQuery({
		queryKey: ["assignment-template", assignmentId],
		queryFn: () => assignmentService.getAssignmentTemplateById(assignmentId as string),
		enabled: !isCreateMode && !!assignmentId,
	});

	const template = templateData?.data;

	// Populate form data when template is loaded
	useEffect(() => {
		if (template) {
			setFormData({
				title: template.title,
				description: template.description || "",
				assignmentType: template.assignmentType,
				gradingMode: template.gradingMode,
				maxPoints: template.maxPoints || 100,
				weightPercentage: template.weightPercentage || 0,
				defaultDurationDays: template.defaultDurationDays || 7,
				instructions: template.instructions || "",
			});
			setGradingCriteria(
				template.gradingCriteria?.map((c, idx) => ({
					id: c.id,
					name: c.name,
					description: c.description || "",
					maxPoints: Number(c.maxPoints),
					sortOrder: c.sortOrder || idx,
				})) || []
			);
		}
	}, [template]);

	// Create mutation
	const createMutation = useMutation({
		mutationFn: () =>
			assignmentService.createAssignmentTemplate(courseId as string, {
				...formData,
				gradingCriteria: gradingCriteria.length > 0 ? gradingCriteria : undefined,
			}),
		onSuccess: () => {
			toast.success("Assignment template created successfully");
			queryClient.invalidateQueries({ queryKey: ["assignments", courseId] });
			push(`/management/courses/edit/${courseId}`);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create assignment template");
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: () =>
			assignmentService.updateAssignmentTemplate(assignmentId as string, {
				...formData,
				gradingCriteria: gradingCriteria.length > 0 ? gradingCriteria : undefined,
			}),
		onSuccess: () => {
			toast.success("Assignment template updated successfully");
			queryClient.invalidateQueries({ queryKey: ["assignment-template", assignmentId] });
			queryClient.invalidateQueries({ queryKey: ["assignments", courseId] });
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update assignment template");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: () => assignmentService.deleteAssignmentTemplate(assignmentId as string),
		onSuccess: () => {
			toast.success("Assignment template deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["assignments", courseId] });
			push(`/management/courses/edit/${courseId}`);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete assignment template");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate grading criteria sum equals maxPoints if using points grading
		if (formData.gradingMode === "points" && gradingCriteria.length > 0) {
			const criteriaSum = gradingCriteria.reduce((sum, c) => sum + c.maxPoints, 0);
			if (criteriaSum !== formData.maxPoints) {
				toast.error(`Grading criteria sum (${criteriaSum}) must equal max points (${formData.maxPoints})`);
				return;
			}
		}

		if (isCreateMode) {
			createMutation.mutate();
		} else {
			updateMutation.mutate();
		}
	};

	const addCriterion = () => {
		setGradingCriteria([
			...gradingCriteria,
			{
				name: "",
				description: "",
				maxPoints: 0,
				sortOrder: gradingCriteria.length,
			},
		]);
	};

	const updateCriterion = (index: number, field: string, value: any) => {
		const updated = [...gradingCriteria];
		updated[index] = { ...updated[index], [field]: value };
		setGradingCriteria(updated);
	};

	const removeCriterion = (index: number) => {
		setGradingCriteria(gradingCriteria.filter((_, i) => i !== index));
	};

	const criteriaSum = gradingCriteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0);
	const isValidCriteria = formData.gradingMode === "pass_fail" || criteriaSum === formData.maxPoints;

	if (isLoading && !isCreateMode) {
		return (
			<Card className="p-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 w-64 bg-gray-200 rounded" />
					<div className="h-64 bg-gray-200 rounded" />
				</div>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => push(`/management/courses/edit/${courseId}`)}>
							<Icon icon="solar:arrow-left-line-duotone" size={20} />
						</Button>
						<div>
							<h1 className="text-2xl font-bold">{isCreateMode ? "Create Assignment Template" : formData.title}</h1>
							<p className="text-sm text-text-secondary mt-1">
								{isCreateMode ? "Define a new assignment template" : "Edit assignment template"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{!isCreateMode && (
							<Button variant="outline" onClick={() => setDeleteModal(true)} disabled={deleteMutation.isPending}>
								<Icon icon="solar:trash-bin-trash-bold-duotone" size={18} className="mr-2" />
								Delete
							</Button>
						)}
					</div>
				</div>
			</Card>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Basic Information */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Basic Information</h3>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">
								Title <span className="text-error">*</span>
							</Label>
							<Input
								id="title"
								placeholder="e.g., Homework 1, Midterm Exam"
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Brief description of the assignment"
								rows={3}
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="assignmentType">Assignment Type</Label>
								<Select
									value={formData.assignmentType}
									onValueChange={(value) => setFormData({ ...formData, assignmentType: value as AssignmentType })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="homework">Homework</SelectItem>
										<SelectItem value="quiz">Quiz</SelectItem>
										<SelectItem value="midterm">Midterm</SelectItem>
										<SelectItem value="final">Final</SelectItem>
										<SelectItem value="project">Project</SelectItem>
										<SelectItem value="participation">Participation</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="defaultDurationDays">Default Duration (days)</Label>
								<Input
									id="defaultDurationDays"
									type="number"
									min={1}
									value={formData.defaultDurationDays}
									onChange={(e) => setFormData({ ...formData, defaultDurationDays: Number(e.target.value) })}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Grading Configuration */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Grading Configuration</h3>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between rounded-lg border p-4">
							<div>
								<Label htmlFor="gradingMode">Grading Mode</Label>
								<p className="text-sm text-text-secondary">Choose between points-based or pass/fail grading</p>
							</div>
							<Switch
								id="gradingMode"
								checked={formData.gradingMode === "points"}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, gradingMode: checked ? "points" : "pass_fail" })
								}
							/>
						</div>

						{formData.gradingMode === "points" && (
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="maxPoints">
										Max Points <span className="text-error">*</span>
									</Label>
									<Input
										id="maxPoints"
										type="number"
										min={0}
										value={formData.maxPoints}
										onChange={(e) => setFormData({ ...formData, maxPoints: Number(e.target.value) })}
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="weightPercentage">
										Weight Percentage <span className="text-error">*</span>
									</Label>
									<Input
										id="weightPercentage"
										type="number"
										min={0}
										max={100}
										step={0.1}
										value={formData.weightPercentage}
										onChange={(e) => setFormData({ ...formData, weightPercentage: Number(e.target.value) })}
										required
									/>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Instructions */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Instructions</h3>
					</CardHeader>
					<CardContent>
						<Textarea
							id="instructions"
							placeholder="Detailed instructions for students..."
							rows={8}
							value={formData.instructions}
							onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
						/>
					</CardContent>
				</Card>

				{/* Grading Criteria */}
				{formData.gradingMode === "points" && (
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-lg font-semibold">Grading Criteria</h3>
									<p className="text-sm text-text-secondary mt-1">
										Define specific criteria for grading this assignment
									</p>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium">
												Total: {criteriaSum} / {formData.maxPoints}
											</span>
											{isValidCriteria && gradingCriteria.length > 0 && (
												<Icon icon="solar:check-circle-bold-duotone" size={20} className="text-success" />
											)}
											{!isValidCriteria && gradingCriteria.length > 0 && (
												<Icon icon="solar:danger-bold-duotone" size={20} className="text-error" />
											)}
										</div>
										{!isValidCriteria && gradingCriteria.length > 0 && (
											<p className="text-xs text-error">Criteria sum must equal max points</p>
										)}
									</div>
									<Button type="button" variant="outline" onClick={addCriterion}>
										<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
										Add Criterion
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{gradingCriteria.length === 0 ? (
								<div className="text-center py-12 text-text-secondary">
									<Icon icon="solar:clipboard-list-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
									<p className="mb-4">No grading criteria defined</p>
									<Button type="button" variant="outline" onClick={addCriterion}>
										<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
										Add Your First Criterion
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									{gradingCriteria.map((criterion, index) => (
										<div key={index} className="flex gap-4 p-4 border rounded-lg">
											<div className="flex-1 space-y-4">
												<div className="grid grid-cols-[2fr_1fr] gap-4">
													<div className="space-y-2">
														<Label htmlFor={`criterion-name-${index}`}>Criterion Name</Label>
														<Input
															id={`criterion-name-${index}`}
															placeholder="e.g., Code Quality, Documentation"
															value={criterion.name}
															onChange={(e) => updateCriterion(index, "name", e.target.value)}
															required
														/>
													</div>
													<div className="space-y-2">
														<Label htmlFor={`criterion-points-${index}`}>Points</Label>
														<Input
															id={`criterion-points-${index}`}
															type="number"
															min={0}
															max={formData.maxPoints}
															value={criterion.maxPoints}
															onChange={(e) => updateCriterion(index, "maxPoints", Number(e.target.value))}
															required
														/>
													</div>
												</div>
												<div className="space-y-2">
													<Label htmlFor={`criterion-description-${index}`}>Description (Optional)</Label>
													<Textarea
														id={`criterion-description-${index}`}
														placeholder="Describe what this criterion evaluates..."
														rows={2}
														value={criterion.description}
														onChange={(e) => updateCriterion(index, "description", e.target.value)}
													/>
												</div>
											</div>
											<div className="flex flex-col justify-center">
												<Button type="button" variant="ghost" size="icon" onClick={() => removeCriterion(index)}>
													<Icon icon="solar:trash-bin-trash-bold-duotone" size={18} className="text-error" />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Actions */}
				<Card className="p-6">
					<div className="flex items-center justify-between">
						<Button type="button" variant="outline" onClick={() => push(`/management/courses/edit/${courseId}`)}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								createMutation.isPending ||
								updateMutation.isPending ||
								!isValidCriteria ||
								!formData.title ||
								(formData.gradingMode === "points" && (formData?.maxPoints ?? 0) <= 0)
							}
						>
							{createMutation.isPending || updateMutation.isPending ? (
								<>
									<Icon icon="solar:loading-bold" size={18} className="mr-2 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Icon icon="solar:diskette-bold-duotone" size={18} className="mr-2" />
									{isCreateMode ? "Create Assignment" : "Save Changes"}
								</>
							)}
						</Button>
					</div>
				</Card>
			</form>

			{/* Delete Confirmation */}
			<AlertDialog open={deleteModal} onOpenChange={setDeleteModal}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Assignment Template</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete <strong>{formData.title}</strong>? This action cannot be undone. The
							assignment template will be permanently removed.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteMutation.mutate()}
							className="bg-error text-white hover:bg-error/90"
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
