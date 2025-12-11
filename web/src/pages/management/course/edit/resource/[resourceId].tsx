import { useParams, useRouter } from "@/routes/hooks";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Icon } from "@/components/icon";
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
import resourceService, { type CreateResourceTemplateReq } from "@/api/services/resourceService";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { ResourceType } from "@/types/entity";

export default function ResourceTemplatePage() {
	const { id: courseId, resourceId } = useParams();
	const { push } = useRouter();
	const queryClient = useQueryClient();
	const isCreateMode = resourceId === "create";

	const [formData, setFormData] = useState<CreateResourceTemplateReq>({
		title: "",
		description: "",
		resourceType: "document",
		url: "",
		filePath: "",
		sortOrder: 0,
	});

	const [deleteModal, setDeleteModal] = useState(false);

	// Fetch resource template data if editing
	const { data: templateData, isLoading } = useQuery({
		queryKey: ["resource-template", resourceId],
		queryFn: () => resourceService.getResourceTemplateById(resourceId as string),
		enabled: !isCreateMode && !!resourceId,
	});

	const template = templateData?.data;

	// Populate form data when template is loaded
	useEffect(() => {
		if (template) {
			setFormData({
				title: template.title,
				description: template.description || "",
				resourceType: (template.resourceType as ResourceType) || "document",
				url: template.url || "",
				filePath: template.filePath || "",
				sortOrder: template.sortOrder || 0,
			});
		}
	}, [template]);

	// Create mutation
	const createMutation = useMutation({
		mutationFn: () => resourceService.createResourceTemplate(courseId as string, formData),
		onSuccess: () => {
			toast.success("Resource template created successfully");
			queryClient.invalidateQueries({ queryKey: ["resources", courseId] });
			push(`/management/courses/edit/${courseId}`);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to create resource template");
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: () => resourceService.updateResourceTemplate(resourceId as string, formData),
		onSuccess: () => {
			toast.success("Resource template updated successfully");
			queryClient.invalidateQueries({ queryKey: ["resource-template", resourceId] });
			queryClient.invalidateQueries({ queryKey: ["resources", courseId] });
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to update resource template");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: () => resourceService.deleteResourceTemplate(resourceId as string),
		onSuccess: () => {
			toast.success("Resource template deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["resources", courseId] });
			push(`/management/courses/edit/${courseId}`);
		},
		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to delete resource template");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate that either URL or file path is provided
		if (!formData.url && !formData.filePath) {
			toast.error("Please provide either a URL or file path");
			return;
		}

		if (isCreateMode) {
			createMutation.mutate();
		} else {
			updateMutation.mutate();
		}
	};

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
							<h1 className="text-2xl font-bold">{isCreateMode ? "Create Resource Template" : formData.title}</h1>
							<p className="text-sm text-text-secondary mt-1">
								{isCreateMode ? "Add a new resource to your course" : "Edit resource template"}
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
								placeholder="e.g., Lecture 1 Slides, Tutorial Video"
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Brief description of the resource"
								rows={3}
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="resourceType">Resource Type</Label>
								<Select
									value={formData.resourceType}
									onValueChange={(value) => setFormData({ ...formData, resourceType: value as ResourceType })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="document">
											<div className="flex items-center gap-2">
												<Icon icon="solar:document-text-bold-duotone" size={16} />
												Document
											</div>
										</SelectItem>
										<SelectItem value="video">
											<div className="flex items-center gap-2">
												<Icon icon="solar:video-library-bold-duotone" size={16} />
												Video
											</div>
										</SelectItem>
										<SelectItem value="link">
											<div className="flex items-center gap-2">
												<Icon icon="solar:link-bold-duotone" size={16} />
												Link
											</div>
										</SelectItem>
										<SelectItem value="slide">
											<div className="flex items-center gap-2">
												<Icon icon="solar:presentation-graph-bold-duotone" size={16} />
												Slide
											</div>
										</SelectItem>
										<SelectItem value="code">
											<div className="flex items-center gap-2">
												<Icon icon="solar:code-bold-duotone" size={16} />
												Code
											</div>
										</SelectItem>
										<SelectItem value="other">
											<div className="flex items-center gap-2">
												<Icon icon="solar:file-bold-duotone" size={16} />
												Other
											</div>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="sortOrder">Sort Order</Label>
								<Input
									id="sortOrder"
									type="number"
									min={0}
									value={formData.sortOrder}
									onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Resource Location */}
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">Resource Location</h3>
						<p className="text-sm text-text-secondary mt-1">
							Provide either a URL (for external resources) or a file path (for uploaded files)
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="url">URL</Label>
							<Input
								id="url"
								type="url"
								placeholder="https://example.com/resource.pdf"
								value={formData.url}
								onChange={(e) => setFormData({ ...formData, url: e.target.value })}
							/>
							<p className="text-xs text-text-secondary">
								Enter the web address of an external resource (YouTube, Google Drive, etc.)
							</p>
						</div>

						<div className="flex items-center gap-4 my-4">
							<div className="flex-1 border-t border-border" />
							<span className="text-sm text-text-secondary">OR</span>
							<div className="flex-1 border-t border-border" />
						</div>

						<div className="space-y-2">
							<Label htmlFor="filePath">File Path</Label>
							<Input
								id="filePath"
								placeholder="/uploads/course-123/lecture-1.pdf"
								value={formData.filePath}
								onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
							/>
							<p className="text-xs text-text-secondary">
								Enter the server path to an uploaded file (file upload functionality coming soon)
							</p>
						</div>
					</CardContent>
				</Card>

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
								!formData.title ||
								(!formData.url && !formData.filePath)
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
									{isCreateMode ? "Create Resource" : "Save Changes"}
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
						<AlertDialogTitle>Delete Resource Template</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete <strong>{formData.title}</strong>? This action cannot be undone. The
							resource template will be permanently removed.
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
