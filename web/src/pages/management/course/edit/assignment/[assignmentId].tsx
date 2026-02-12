import { useParams, useRouter } from "@/routes/hooks";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";

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
import { useState, useEffect, useRef } from "react";
import { AssignmentType } from "@/types/entity";
import { FormBuilder } from "@/components/form-builder";
import type { Attachment, FormAttachment, FileAttachment } from "#/entity";
import { Modal } from "antd";

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
		attachments: [],
	});

	const [gradingCriteria, setGradingCriteria] = useState<
		Array<{ id?: string; name: string; description: string; maxPoints: number; sortOrder: number }>
	>([]);

	const [deleteModal, setDeleteModal] = useState(false);
	const [formBuilderModal, setFormBuilderModal] = useState(false);
	const [editingForm, setEditingForm] = useState<FormAttachment | null>(null);
	const [isUploadingFile, setIsUploadingFile] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

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
				assignmentType: template.assignmentType as AssignmentType,
				gradingMode: template.gradingMode,
				maxPoints: template.maxPoints || 100,
				weightPercentage: template.weightPercentage || 0,
				defaultDurationDays: template.defaultDurationDays || 7,
				instructions: template.instructions || "",
				attachments: template.attachments || [],
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
			push(`/management/course/edit/${courseId}`);
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
			push(`/management/course/edit/${courseId}`);
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

	// Attachment handlers
	const handleAddForm = () => {
		setEditingForm(null);
		setFormBuilderModal(true);
	};

	const handleEditForm = (form: FormAttachment) => {
		setEditingForm(form);
		setFormBuilderModal(true);
	};

	const handleSaveForm = (form: FormAttachment) => {
		const currentAttachments = formData.attachments || [];
		let updatedAttachments: Attachment[];

		if (editingForm) {
			// Update existing form
			updatedAttachments = currentAttachments.map((att) =>
				att.type === "form" && att.id === editingForm.id ? form : att
			);
		} else {
			// Add new form
			updatedAttachments = [...currentAttachments, form];
		}

		setFormData({ ...formData, attachments: updatedAttachments });
		setFormBuilderModal(false);
		setEditingForm(null);
	};

	const handleDeleteForm = (formId: string) => {
		const updatedAttachments = (formData.attachments || []).filter(
			(att) => !(att.type === "form" && att.id === formId)
		);
		setFormData({ ...formData, attachments: updatedAttachments });
	};

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		// For create mode, we need to save the template first, so store file as a placeholder
		// For edit mode, we can upload directly
		if (isCreateMode) {
			// Add file as a local FileAttachment placeholder - will be uploaded when template is saved
			for (const file of Array.from(files)) {
				const fileUrl = URL.createObjectURL(file);
				const fileAttachment: FileAttachment = {
					type: "file",
					id: `local-${Date.now()}-${file.name}`,
					name: file.name,
					url: fileUrl,
					mimeType: file.type,
				};
				setFormData((prev) => ({
					...prev,
					attachments: [...(prev.attachments || []), fileAttachment],
				}));
			}
			toast.info("Files added. They will be uploaded when you save the template.");
		} else {
			setIsUploadingFile(true);
			try {
				for (const file of Array.from(files)) {
					const result = await assignmentService.uploadAssignmentFile(assignmentId as string, file);
					const fileAttachment = result.data as FileAttachment;
					setFormData((prev) => ({
						...prev,
						attachments: [...(prev.attachments || []), fileAttachment] as Attachment[],
					}));
				}
				toast.success("File(s) uploaded successfully");
			} catch (error: any) {
				toast.error(error?.response?.data?.message || "Failed to upload file");
			} finally {
				setIsUploadingFile(false);
			}
		}

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
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
						<Button variant="ghost" size="icon" onClick={() => push(`/management/course/edit/${courseId}`)}>
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
								<select
									id="assignmentType"
									value={formData.assignmentType || "homework"}
									onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value as AssignmentType })}
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-0 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<option value="homework">Homework</option>
									<option value="quiz">Quiz</option>
									<option value="midterm">Midterm</option>
									<option value="final">Final</option>
									<option value="project">Project</option>
									<option value="participation">Participation</option>
								</select>
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

				{/* Attachments */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold">Attachments</h3>
								<p className="text-sm text-text-secondary mt-1">
									Add files or create quizzes/surveys for this assignment
								</p>
							</div>
							<div className="flex gap-2">
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileUpload}
									className="hidden"
									multiple
									accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.csv,.jpg,.jpeg,.png,.gif,.mp4,.zip,.py,.java,.js,.ts,.jsx,.tsx"
								/>
								<Button
									type="button"
									variant="outline"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploadingFile}
								>
									{isUploadingFile ? (
										<>
											<Icon icon="solar:loading-bold" size={16} className="mr-2 animate-spin" />
											Uploading...
										</>
									) : (
										<>
											<Icon icon="solar:upload-bold-duotone" size={16} className="mr-2" />
											Upload File
										</>
									)}
								</Button>
								<Button type="button" variant="outline" onClick={handleAddForm}>
									<Icon icon="solar:document-add-bold-duotone" size={16} className="mr-2" />
									Add Quiz/Survey
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{!formData.attachments || formData.attachments.length === 0 ? (
							<div className="text-center py-8 text-text-secondary">
								<Icon icon="solar:folder-open-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
								<p className="mb-4">No attachments yet</p>
								<p className="text-xs">Add files or create interactive quizzes for your assignment</p>
							</div>
						) : (
							<div className="space-y-3">
								{formData.attachments.map((attachment) => {
									if (attachment.type === "form") {
										return (
											<div key={attachment.id} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="flex items-center gap-3">
													<Icon icon="solar:document-text-bold-duotone" size={24} className="text-primary" />
													<div>
														<p className="font-medium">{attachment.title || "Untitled Quiz"}</p>
														<p className="text-sm text-text-secondary">
															{attachment.questions?.length || 0} question
															{(attachment.questions?.length || 0) !== 1 ? "s" : ""}
															{attachment.questions && (
																<> • {attachment.questions.reduce((sum, q) => sum + q.points, 0)} points</>
															)}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button type="button" variant="outline" size="sm" onClick={() => handleEditForm(attachment)}>
														<Icon icon="solar:pen-bold-duotone" size={14} className="mr-1" />
														Edit
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => handleDeleteForm(attachment.id)}
														className="text-error hover:text-error"
													>
														<Icon icon="solar:trash-bin-minimalistic-bold-duotone" size={14} />
													</Button>
												</div>
											</div>
										);
									}

									// File attachments (if you want to support them later)
									if (attachment.type === "file") {
										return (
											<div key={attachment.id} className="flex items-center justify-between p-4 border rounded-lg">
												<div className="flex items-center gap-3">
													<Icon icon="solar:file-bold-duotone" size={24} className="text-text-secondary" />
													<div>
														<p className="font-medium">{attachment.name}</p>
														<p className="text-sm text-text-secondary">{attachment.mimeType}</p>
													</div>
												</div>
												<div className="flex items-center gap-2">
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => window.open(attachment.url, "_blank")}
													>
														<Icon icon="solar:eye-bold-duotone" size={14} className="mr-1" />
														View
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => {
															const updatedAttachments = (formData.attachments || []).filter(
																(att) => att.id !== attachment.id
															);
															setFormData({ ...formData, attachments: updatedAttachments });
														}}
														className="text-error hover:text-error"
													>
														<Icon icon="solar:trash-bin-minimalistic-bold-duotone" size={14} />
													</Button>
												</div>
											</div>
										);
									}

									return null;
								})}
							</div>
						)}
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
						<Button type="button" variant="outline" onClick={() => push(`/management/course/edit/${courseId}`)}>
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

			{/* Form Builder Modal */}
			<Modal
				title={editingForm ? "Edit Quiz/Survey" : "Create Quiz/Survey"}
				open={formBuilderModal}
				onCancel={() => {
					setFormBuilderModal(false);
					setEditingForm(null);
				}}
				footer={null}
				width={1200}
				style={{ top: 20 }}
				className="form-builder-modal"
			>
				<FormBuilder
					assignmentId={assignmentId === "create" ? undefined : assignmentId}
					initialForm={editingForm ?? undefined}
					onSave={handleSaveForm}
					onCancel={() => {
						setFormBuilderModal(false);
						setEditingForm(null);
					}}
				/>
			</Modal>
		</div>
	);
}
