import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import courseInstanceService from "@/api/services/courseInstanceService";
import assignmentService from "@/api/services/assignmentService";
import type { PublishedAssignment } from "#/entity";
import { useState } from "react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface AssignmentsTabProps {
	instanceId: string;
	courseId: string;
}

const assignmentTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
	homework: { label: "Homework", icon: "solar:clipboard-text-bold-duotone", color: "text-info" },
	quiz: { label: "Quiz", icon: "solar:question-circle-bold-duotone", color: "text-warning" },
	midterm: { label: "Midterm", icon: "solar:document-text-bold-duotone", color: "text-error" },
	final: { label: "Final", icon: "solar:diploma-bold-duotone", color: "text-primary" },
	project: { label: "Project", icon: "solar:folder-bold-duotone", color: "text-success" },
	participation: { label: "Participation", icon: "solar:users-group-rounded-bold-duotone", color: "text-default" },
};

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
	draft: { label: "Draft", variant: "default" },
	scheduled: { label: "Scheduled", variant: "info" },
	published: { label: "Published", variant: "success" },
	closed: { label: "Closed", variant: "error" },
};

interface PublishFormData {
	templateId: string;
	publishAt: string;
	deadline: string;
	lateDeadline: string;
	latePenaltyPercent: number;
	autoPublish: boolean;
}

export function AssignmentsTab({ instanceId, courseId }: AssignmentsTabProps) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [showPublishModal, setShowPublishModal] = useState(false);
	const [deleteModal, setDeleteModal] = useState<{ show: boolean; assignment: PublishedAssignment | null }>({
		show: false,
		assignment: null,
	});
	const [formData, setFormData] = useState<PublishFormData>({
		templateId: "",
		publishAt: "",
		deadline: "",
		lateDeadline: "",
		latePenaltyPercent: 10,
		autoPublish: true,
	});

	// Fetch published assignments for this instance
	const { data: publishedData, isLoading: loadingPublished } = useQuery({
		queryKey: ["published-assignments", instanceId],
		queryFn: () => courseInstanceService.getPublishedAssignments(instanceId),
	});

	// Fetch assignment templates from the course
	const { data: templatesData, isLoading: loadingTemplates } = useQuery({
		queryKey: ["assignment-templates", courseId],
		queryFn: () => assignmentService.getAssignmentTemplates(courseId),
	});

	const publishedAssignments = publishedData?.data || [];
	const templates = templatesData?.data || [];

	// Get templates that haven't been published yet
	const publishedTemplateIds = new Set(publishedAssignments.map((pa) => pa.templateId));
	const availableTemplates = templates.filter((t) => !publishedTemplateIds.has(t.id));

	// Publish assignment mutation
	const publishMutation = useMutation({
		mutationFn: (data: PublishFormData) =>
			courseInstanceService.publishAssignment(instanceId, {
				templateId: data.templateId,
				publishAt: data.publishAt ? new Date(data.publishAt).toISOString() : undefined,
				deadline: new Date(data.deadline).toISOString(),
				lateDeadline: data.lateDeadline ? new Date(data.lateDeadline).toISOString() : undefined,
				latePenaltyPercent: data.latePenaltyPercent,
				autoPublish: data.autoPublish,
			}),
		onSuccess: () => {
			toast.success("Assignment published successfully");
			queryClient.invalidateQueries({ queryKey: ["published-assignments", instanceId] });
			queryClient.invalidateQueries({ queryKey: ["instance", instanceId] });
			setShowPublishModal(false);
			resetForm();
		},
		onError: () => {
			toast.error("Failed to publish assignment");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: (assignmentId: string) => courseInstanceService.deletePublishedAssignment(instanceId, assignmentId),
		onSuccess: () => {
			toast.success("Assignment removed successfully");
			queryClient.invalidateQueries({ queryKey: ["published-assignments", instanceId] });
			queryClient.invalidateQueries({ queryKey: ["instance", instanceId] });
			setDeleteModal({ show: false, assignment: null });
		},
		onError: () => {
			toast.error("Failed to remove assignment");
		},
	});

	const resetForm = () => {
		setFormData({
			templateId: "",
			publishAt: "",
			deadline: "",
			lateDeadline: "",
			latePenaltyPercent: 10,
			autoPublish: true,
		});
	};

	const handleTemplateSelect = (templateId: string) => {
		const template = templates.find((t) => t.id === templateId);
		if (template) {
			const now = new Date();
			const deadline = template.defaultDurationDays ? addDays(now, template.defaultDurationDays) : addDays(now, 7);
			const lateDeadline = addDays(deadline, 2);

			setFormData({
				...formData,
				templateId,
				deadline: format(deadline, "yyyy-MM-dd'T'HH:mm"),
				lateDeadline: format(lateDeadline, "yyyy-MM-dd'T'HH:mm"),
			});
		}
	};

	const handlePublish = () => {
		if (!formData.templateId || !formData.deadline) {
			toast.error("Please select a template and set a deadline");
			return;
		}
		publishMutation.mutate(formData);
	};

	const columns: ColumnsType<PublishedAssignment> = [
		{
			title: "Assignment",
			key: "assignment",
			width: 300,
			render: (_, record) => {
				const typeConfig = assignmentTypeConfig[record.assignmentType] || assignmentTypeConfig.homework;
				return (
					<div className="flex items-center gap-3">
						<div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 ${typeConfig.color}`}>
							<Icon icon={typeConfig.icon} size={20} />
						</div>
						<div>
							<div className="font-medium">{record.title}</div>
							<div className="text-xs text-text-secondary">{typeConfig.label}</div>
						</div>
					</div>
				);
			},
		},
		{
			title: "Points",
			key: "points",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div>
					{record.gradingMode === "pass_fail" ? (
						<Badge variant="outline">Pass/Fail</Badge>
					) : (
						<span className="font-medium">{record.maxPoints} pts</span>
					)}
				</div>
			),
		},
		{
			title: "Weight",
			dataIndex: "weightPercentage",
			align: "center",
			width: 80,
			render: (weight) => (weight ? `${weight}%` : "-"),
		},
		{
			title: "Deadline",
			key: "deadline",
			width: 160,
			render: (_, record) => (
				<div className="text-sm">
					<div>{format(new Date(record.deadline), "MMM d, yyyy")}</div>
					<div className="text-xs text-text-secondary">{format(new Date(record.deadline), "h:mm a")}</div>
				</div>
			),
		},
		{
			title: "Submissions",
			key: "submissions",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex items-center justify-center gap-1">
					<Icon icon="solar:document-add-bold-duotone" size={16} className="text-info" />
					<span>{record._count?.submissions || 0}</span>
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			align: "center",
			width: 120,
			render: (status: string) => (
				<Badge variant={statusConfig[status]?.variant || "default"}>{statusConfig[status]?.label || status}</Badge>
			),
		},
		{
			title: "Action",
			key: "action",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex justify-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setDeleteModal({ show: true, assignment: record })}
						title="Remove assignment"
						disabled={record.status !== "draft" && record.status !== "scheduled"}
					>
						<Icon icon="solar:trash-bin-trash-bold-duotone" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Icon icon="solar:document-text-bold-duotone" size={20} className="text-primary" />
							<span className="font-medium">Published Assignments</span>
							<Badge variant="outline">{publishedAssignments.length}</Badge>
						</div>
						<Button onClick={() => setShowPublishModal(true)} disabled={availableTemplates.length === 0}>
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							Publish Assignment
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{publishedAssignments.length === 0 ? (
						<div className="py-12 text-center">
							<Icon icon="solar:document-text-bold-duotone" size={48} className="mx-auto mb-4 text-gray-300" />
							<h3 className="font-medium">No assignments published yet</h3>
							<p className="text-sm text-text-secondary mb-4">
								Publish assignments from your course templates to make them available to students.
							</p>
							<Button onClick={() => setShowPublishModal(true)} disabled={availableTemplates.length === 0}>
								<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
								Publish First Assignment
							</Button>
						</div>
					) : (
						<Table
							rowKey="id"
							size="small"
							scroll={{ x: "max-content" }}
							pagination={false}
							columns={columns}
							dataSource={publishedAssignments}
							loading={loadingPublished}
							onRow={(record) => ({
								onClick: () => navigate(`assignments/${record.id}`),
								style: { cursor: "pointer" },
							})}
						/>
					)}
				</CardContent>
			</Card>

			{/* Publish Assignment Modal */}
			<Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>Publish Assignment</DialogTitle>
						<DialogDescription>Select an assignment template and configure the publishing settings.</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Assignment Template</Label>
							<Select value={formData.templateId} onValueChange={handleTemplateSelect}>
								<SelectTrigger>
									<SelectValue placeholder="Select a template" />
								</SelectTrigger>
								<SelectContent>
									{loadingTemplates ? (
										<SelectItem value="loading" disabled>
											Loading...
										</SelectItem>
									) : availableTemplates.length === 0 ? (
										<SelectItem value="none" disabled>
											All templates published
										</SelectItem>
									) : (
										availableTemplates.map((template) => (
											<SelectItem key={template.id} value={template.id}>
												<div className="flex items-center gap-2">
													<span>{template.title}</span>
													<Badge variant="outline" className="ml-2">
														{assignmentTypeConfig[template.assignmentType]?.label}
													</Badge>
												</div>
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>

						{formData.templateId && (
							<>
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Publish At (Optional)</Label>
										<Input
											type="datetime-local"
											value={formData.publishAt}
											onChange={(e) => setFormData({ ...formData, publishAt: e.target.value })}
										/>
										<p className="text-xs text-text-secondary">Leave empty to publish immediately</p>
									</div>
									<div className="space-y-2">
										<Label>Deadline *</Label>
										<Input
											type="datetime-local"
											value={formData.deadline}
											onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Late Deadline (Optional)</Label>
										<Input
											type="datetime-local"
											value={formData.lateDeadline}
											onChange={(e) => setFormData({ ...formData, lateDeadline: e.target.value })}
										/>
									</div>
									<div className="space-y-2">
										<Label>Late Penalty (%)</Label>
										<Input
											type="number"
											min={0}
											max={100}
											value={formData.latePenaltyPercent}
											onChange={(e) => setFormData({ ...formData, latePenaltyPercent: Number(e.target.value) })}
										/>
									</div>
								</div>

								<div className="flex items-center justify-between rounded-lg border p-3">
									<div>
										<p className="font-medium">Auto Publish</p>
										<p className="text-xs text-text-secondary">Automatically publish at the scheduled time</p>
									</div>
									<Switch
										checked={formData.autoPublish}
										onCheckedChange={(checked) => setFormData({ ...formData, autoPublish: checked })}
									/>
								</div>
							</>
						)}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPublishModal(false)}>
							Cancel
						</Button>
						<Button onClick={handlePublish} disabled={publishMutation.isPending || !formData.templateId}>
							{publishMutation.isPending ? "Publishing..." : "Publish Assignment"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation */}
			<AlertDialog
				open={deleteModal.show}
				onOpenChange={(open) => !open && setDeleteModal({ show: false, assignment: null })}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Assignment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove <strong>{deleteModal.assignment?.title}</strong>? This will also remove
							all submissions associated with this assignment.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteModal.assignment && deleteMutation.mutate(deleteModal.assignment.id)}
							className="bg-error text-white hover:bg-error/90"
						>
							{deleteMutation.isPending ? "Removing..." : "Remove"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
