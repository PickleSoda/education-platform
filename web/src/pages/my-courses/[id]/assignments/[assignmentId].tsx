import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { useParams } from "react-router";
import { format, isPast } from "date-fns";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import type { PublishedAssignment } from "#/entity";
import submissionService from "@/api/services/submissionService";
import { useQuery } from "@tanstack/react-query";
import courseInstanceService from "@/api/services/courseInstanceService";
import { InstructionsTab, SubmissionTab, FeedbackTab } from "./tabs";

export default function AssignmentSubmissionPage() {
	const { id: instanceId, assignmentId } = useParams<{
		id: string;
		assignmentId: string;
	}>();

	const [submission, setSubmission] = useState<{
		status: "not-started" | "draft" | "submitted" | "late" | "graded" | "returned";
		content?: string;
		submittedAt?: string;
		totalPoints?: number;
		feedback?: string;
	} | null>(null);
	const [content, setContent] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [activeTab, setActiveTab] = useState<"instructions" | "submission" | "feedback">("instructions");

	const { data: assignmentData } = useQuery({
		queryKey: ["assignment", assignmentId],
		queryFn: () => courseInstanceService.getPublishedAssignmentById(instanceId as string, assignmentId as string),
		enabled: !!instanceId && !!assignmentId,
	});

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
		if (!assignmentId) return;
		setIsSaving(true);
		try {
			await submissionService.saveSubmissionDraft(assignmentId, { content });
			setSubmission((prev) => ({
				...prev!,
				status: "draft",
				content,
			}));
		} catch (error) {
			console.error("Failed to save draft:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleSubmit = async () => {
		if (!assignmentId) return;
		setIsSubmitting(true);
		try {
			const result = await submissionService.submitAssignment(assignmentId);
			setSubmission({
				status: result.status as any,
				content: result.content || undefined,
				submittedAt: result.submittedAt || undefined,
				totalPoints: result.totalPoints || undefined,
				feedback: result.feedback || undefined,
			});
		} catch (error) {
			console.error("Failed to submit assignment:", error);
		} finally {
			setIsSubmitting(false);
		}
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
						<div className="font-semibold capitalize">{submission?.status || "Not Started"}</div>
						{submission?.submittedAt && (
							<div className="text-xs text-text-secondary">
								{format(new Date(submission.submittedAt), "MMM dd, yyyy")}
							</div>
						)}
					</Card>

					{submission?.status === "graded" && (
						<Card className="p-4 bg-success/10">
							<div className="text-sm text-text-secondary mb-1">Your Score</div>
							<div className="text-2xl font-bold text-success">
								{submission.totalPoints}/{assignment.maxPoints}
							</div>
							<div className="text-xs text-text-secondary mt-1">
								{Math.round((submission.totalPoints || 0 / assignment.maxPoints!) * 100)}%
							</div>
						</Card>
					)}
				</div>
			</div>

			{/* Content Tabs */}
			<Card>
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
					<CardHeader className="border-b">
						<TabsList className="w-full justify-start">
							<TabsTrigger value="instructions">Instructions</TabsTrigger>
							{!isOverdue && <TabsTrigger value="submission">Submission</TabsTrigger>}
							{submission?.status === "graded" && <TabsTrigger value="feedback">Feedback</TabsTrigger>}
						</TabsList>
					</CardHeader>

					<CardContent className="p-6">
						{activeTab === "instructions" && <InstructionsTab assignment={assignment} />}

						{activeTab === "submission" && (
							<SubmissionTab
								content={content}
								setContent={setContent}
								handleSaveDraft={handleSaveDraft}
								handleSubmit={handleSubmit}
								isSaving={isSaving}
								isSubmitting={isSubmitting}
								isOverdue={isOverdue}
							/>
						)}

						{activeTab === "feedback" && <FeedbackTab assignment={assignment} submission={submission} />}
					</CardContent>
				</Tabs>
			</Card>
		</div>
	);
}
