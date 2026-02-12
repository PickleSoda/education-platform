import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { useParams } from "react-router";
import { format, isPast } from "date-fns";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import type { PublishedAssignment, FormSubmission, SubmissionWithRelations } from "#/entity";
import submissionService, { type SaveSubmissionDraftReq } from "@/api/services/submissionService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import courseInstanceService from "@/api/services/courseInstanceService";
import { InstructionsTab, SubmissionTab, FeedbackTab } from "./tabs";
import type { UploadFile } from "antd";
import { toast } from "sonner";

export default function AssignmentSubmissionPage() {
	const { id: instanceId, assignmentId } = useParams<{
		id: string;
		assignmentId: string;
	}>();

	const [content, setContent] = useState("");
	const [fileList, setFileList] = useState<UploadFile[]>([]);
	const [formSubmission, setFormSubmission] = useState<FormSubmission | null>(null);
	const [activeTab, setActiveTab] = useState<"instructions" | "submission" | "feedback">("instructions");

	const queryClient = useQueryClient();

	const { data: assignmentData } = useQuery({
		queryKey: ["assignment", assignmentId],
		queryFn: () => courseInstanceService.getPublishedAssignmentById(instanceId as string, assignmentId as string),
		enabled: !!instanceId && !!assignmentId,
	});

	// Fetch existing submission data
	const { data: submissionData } = useQuery({
		queryKey: ["submission", assignmentId],
		queryFn: () => submissionService.getSubmissions({ assignmentId: assignmentId! }),
		enabled: !!assignmentId,
	});

	// Get the full submission object (with grades, gradedBy, etc.)
	const existingSubmission: SubmissionWithRelations | null =
		submissionData?.data && submissionData.data.length > 0 ? submissionData.data[0] : null;

	const submissionStatus = existingSubmission?.status || "not-started";

	// Determine if student can edit/submit
	const isGraded = submissionStatus === "graded";
	const isReturned = submissionStatus === "returned";
	const isSubmitted = submissionStatus === "submitted" || submissionStatus === "late";
	const canEdit = !isGraded && !isSubmitted; // Can edit if draft, not started, or returned

	// TanStack Query mutations
	const saveDraftMutation = useMutation({
		mutationFn: (data: { content?: string; attachments?: any; formSubmission?: FormSubmission }) =>
			submissionService.saveSubmissionDraft(assignmentId!, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["submission", assignmentId] });
			toast.success("Draft saved successfully");
		},
		onError: (error) => {
			console.error("Failed to save draft:", error);
			toast.error("Failed to save draft");
		},
	});

	const submitAssignmentMutation = useMutation({
		mutationFn: async () => {
			// First save draft if there's content, files, or form submission
			if (content.trim() || fileList.length > 0 || formSubmission) {
				const submissionData: any = {};
				if (content.trim()) submissionData.content = content;
				if (fileList.length > 0) {
					// Upload new files to server first
					const newFiles = fileList.filter((f) => f.originFileObj).map((f) => f.originFileObj as File);
					const existingAttachments = fileList
						.filter((f) => !f.originFileObj && (f as any).filePath)
						.map((f) => ({
							name: f.name,
							size: f.size || 0,
							type: f.type || "",
							filePath: (f as any).filePath,
							url: (f as any).url,
						}));

					let uploadedFiles: any[] = [];
					if (newFiles.length > 0) {
						const uploadResult = await submissionService.uploadSubmissionFiles(assignmentId!, newFiles);
						uploadedFiles = uploadResult.data || [];
					}

					submissionData.attachments = [...existingAttachments, ...uploadedFiles];
				}
				if (formSubmission) submissionData.formSubmission = formSubmission;
				await submissionService.saveSubmissionDraft(assignmentId!, submissionData);
			}
			// Then submit the assignment
			return submissionService.submitAssignment(assignmentId!);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["submission", assignmentId] });
			toast.success("Assignment submitted successfully");
		},
		onError: (error) => {
			console.error("Failed to submit assignment:", error);
			toast.error("Failed to submit assignment");
		},
	});

	// Populate form with existing submission data
	useEffect(() => {
		if (existingSubmission) {
			if (existingSubmission.content) {
				setContent(existingSubmission.content);
			}
			if (existingSubmission.formSubmission) {
				setFormSubmission(existingSubmission.formSubmission);
			}
			if (existingSubmission.attachments && Array.isArray(existingSubmission.attachments)) {
				const files: UploadFile[] = existingSubmission.attachments.map(
					(file: any, index: number) =>
						({
							uid: `${index}`,
							name: file.name || `File ${index + 1}`,
							status: "done" as const,
							size: file.size || 0,
							type: file.type || "",
							filePath: file.filePath,
							url: file.url,
						}) as any
				);
				setFileList(files);
			}
		}
	}, [submissionData]);

	const assignment: PublishedAssignment | null = assignmentData?.data || null;

	const assignmentTypeColors: Record<string, "info" | "warning" | "error" | "success" | "default"> = {
		homework: "info",
		quiz: "warning",
		midterm: "error",
		final: "error",
		project: "success",
		participation: "default",
	};

	const getDeadlineStatus = (deadline: string) => {
		const deadlineDate = new Date(deadline);
		if (isPast(deadlineDate)) {
			return { label: "Deadline Passed", color: "error" as const };
		}
		const daysUntil = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
		if (daysUntil <= 1) {
			return { label: "Due Soon", color: "error" as const };
		}
		if (daysUntil <= 3) {
			return { label: "Due in 3 days", color: "warning" as const };
		}
		return { label: `Due in ${daysUntil} days`, color: "success" as const };
	};

	const handleSaveDraft = async () => {
		if (!assignmentId || (!content.trim() && fileList.length === 0 && !formSubmission)) return;

		const submissionData: SaveSubmissionDraftReq = {};
		if (content.trim()) submissionData.content = content;
		if (fileList.length > 0) {
			// Upload new files to server first
			const newFiles = fileList.filter((f) => f.originFileObj).map((f) => f.originFileObj as File);
			const existingAttachments = fileList
				.filter((f) => !f.originFileObj && (f as any).filePath)
				.map((f) => ({
					name: f.name,
					size: f.size || 0,
					type: f.type || "",
					filePath: (f as any).filePath,
					url: (f as any).url,
				}));

			let uploadedFiles: any[] = [];
			if (newFiles.length > 0) {
				try {
					const uploadResult = await submissionService.uploadSubmissionFiles(assignmentId!, newFiles);
					uploadedFiles = uploadResult.data || [];
				} catch (error) {
					toast.error("Failed to upload files");
					return;
				}
			}

			submissionData.attachments = [...existingAttachments, ...uploadedFiles];
		}
		if (formSubmission) submissionData.formSubmission = formSubmission;

		saveDraftMutation.mutate(submissionData);
	};

	const handleSubmit = () => {
		if (!assignmentId) return;
		submitAssignmentMutation.mutate();
	};

	if (!assignment) {
		return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
	}

	const deadlineStatus = getDeadlineStatus(assignment.deadline);
	const isOverdue = isPast(new Date(assignment.deadline));

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="space-y-4">
				<div className="flex items-start justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
								<Icon icon="solar:document-text-bold-duotone" size={24} className="text-primary" />
							</div>
							<div>
								<h1 className="text-2xl font-bold">{assignment.title}</h1>
								<p className="text-sm text-text-secondary">{assignment.description}</p>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge variant={assignmentTypeColors[assignment.assignmentType] || "default"}>
							{assignment.assignmentType.charAt(0).toUpperCase() + assignment.assignmentType.slice(1)}
						</Badge>
						<Badge variant={deadlineStatus.color}>{deadlineStatus.label}</Badge>
					</div>
				</div>

				{/* Key Info Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card className="p-4">
						<div className="text-sm text-text-secondary mb-1">Max Points</div>
						<div className="text-2xl font-bold">{assignment.maxPoints}</div>
						{assignment.weightPercentage && (
							<div className="text-xs text-text-secondary mt-1">{assignment.weightPercentage}% of grade</div>
						)}
					</Card>

					<Card className="p-4">
						<div className="text-sm text-text-secondary mb-1">Deadline</div>
						<div className="font-semibold">{format(new Date(assignment.deadline), "MMM dd, yyyy")}</div>
						<div className="text-xs text-text-secondary">{format(new Date(assignment.deadline), "h:mm a")}</div>
					</Card>

					<Card className="p-4">
						<div className="text-sm text-text-secondary mb-1">Status</div>
						<div className="font-semibold capitalize">
							{submissionStatus === "not-started" ? "Not Started" : submissionStatus}
						</div>
						{existingSubmission?.submittedAt && (
							<div className="text-xs text-text-secondary">
								{format(new Date(existingSubmission.submittedAt), "MMM dd, yyyy")}
							</div>
						)}
					</Card>

					{isGraded && (
						<Card className="p-4 bg-success/10">
							<div className="text-sm text-text-secondary mb-1">Your Score</div>
							<div className="text-2xl font-bold text-success">
								{existingSubmission?.finalPoints ?? existingSubmission?.totalPoints ?? 0}/{assignment.maxPoints}
							</div>
							<div className="text-xs text-text-secondary mt-1">
								{Math.round(
									((existingSubmission?.finalPoints ?? existingSubmission?.totalPoints ?? 0) /
										(assignment.maxPoints || 1)) *
										100
								)}
								%
								{existingSubmission?.latePenaltyApplied && (
									<span className="text-warning ml-1">(late penalty applied)</span>
								)}
							</div>
						</Card>
					)}
				</div>

				{/* Returned for resubmission notice */}
				{isReturned && (
					<div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
						<Icon icon="solar:restart-bold-duotone" size={20} className="text-warning" />
						<div>
							<div className="font-medium text-warning">Returned for Resubmission</div>
							<div className="text-sm text-text-secondary">
								Your instructor has returned this assignment. You may revise and resubmit your work.
							</div>
						</div>
					</div>
				)}

				{/* Submitted notice */}
				{isSubmitted && (
					<div className="flex items-center gap-3 p-4 rounded-lg bg-info/10 border border-info/20">
						<Icon icon="solar:check-circle-bold-duotone" size={20} className="text-info" />
						<div>
							<div className="font-medium text-info">Submitted</div>
							<div className="text-sm text-text-secondary">
								Your assignment has been submitted and is awaiting grading. You cannot make changes until your
								instructor returns it.
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Content Tabs */}
			<Card>
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
					<CardHeader className="border-b">
						<TabsList className="w-full justify-start">
							<TabsTrigger value="instructions">Instructions</TabsTrigger>
							{canEdit && <TabsTrigger value="submission">Submission</TabsTrigger>}
							{(isGraded || isReturned) && <TabsTrigger value="feedback">Feedback</TabsTrigger>}
						</TabsList>
					</CardHeader>

					<CardContent className="p-6">
						{activeTab === "instructions" && <InstructionsTab assignment={assignment} />}

						{activeTab === "submission" && canEdit && (
							<SubmissionTab
								assignment={assignment}
								content={content}
								setContent={setContent}
								fileList={fileList}
								setFileList={setFileList}
								formSubmission={formSubmission ?? undefined}
								setFormSubmission={setFormSubmission}
								handleSaveDraft={handleSaveDraft}
								handleSubmit={handleSubmit}
								isSaving={saveDraftMutation.isPending}
								isSubmitting={submitAssignmentMutation.isPending}
								isOverdue={isOverdue}
							/>
						)}

						{activeTab === "feedback" && (isGraded || isReturned) && (
							<FeedbackTab assignment={assignment} submission={existingSubmission} />
						)}
					</CardContent>
				</Tabs>
			</Card>
		</div>
	);
}
