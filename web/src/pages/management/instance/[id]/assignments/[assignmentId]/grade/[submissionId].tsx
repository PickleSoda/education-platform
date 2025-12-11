import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { useParams, useNavigate } from "react-router";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import type { PublishedAssignment, SubmissionWithRelations } from "#/entity";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import courseInstanceService from "@/api/services/courseInstanceService";
import submissionService from "@/api/services/submissionService";
import { toast } from "sonner";
import { toNumber } from "lodash-es";

export default function SubmissionGradingPage() {
	const {
		id: instanceId,
		assignmentId,
		submissionId,
	} = useParams<{
		id: string;
		assignmentId: string;
		submissionId: string;
	}>();

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState<"submission" | "grading">("submission");
	const [grades, setGrades] = useState<Record<string, number>>({});
	const [overallFeedback, setOverallFeedback] = useState("");

	const { data: assignmentData } = useQuery({
		queryKey: ["assignment", assignmentId],
		queryFn: () => courseInstanceService.getPublishedAssignmentById(instanceId as string, assignmentId as string),
		enabled: !!instanceId && !!assignmentId,
	});

	const assignment: PublishedAssignment | null = assignmentData?.data || null;

	const { data: submissionData } = useQuery({
		queryKey: ["submissions", assignmentId],
		queryFn: () => submissionService.getSubmissionById(submissionId as string),
		enabled: !!assignmentId,
	});

	const submission: SubmissionWithRelations | null = submissionData?.data || null;

	// Initialize grades from existing submission data
	useEffect(() => {
		if (submission?.grades && submission.grades.length > 0) {
			const existingGrades: Record<string, number> = {};
			submission.grades.forEach((grade) => {
				existingGrades[grade.publishedCriteriaId] = toNumber(grade.pointsAwarded as number);
			});
			setGrades(existingGrades);
		}
		if (submission?.feedback) {
			setOverallFeedback(submission.feedback);
		}
	}, [submission]);

	const gradeMutation = useMutation({
		mutationFn: (data: {
			criteriaGrades: Array<{ criteriaId: string; pointsAwarded: number; feedback?: string }>;
			overallFeedback?: string;
		}) => submissionService.gradeSubmission(submissionId as string, data),
		onSuccess: async () => {
			toast.success("Grade submitted successfully");
			// Invalidate the submissions list query
			await queryClient.invalidateQueries({ queryKey: ["submissions", assignmentId] });
			// Invalidate the single submission query
			await queryClient.invalidateQueries({ queryKey: ["submission", submissionId] });
			navigate(-1);
		},

		onError: (error: any) => {
			toast.error(error?.response?.data?.message || "Failed to submit grade");
		},
	});

	const handleGradeChange = (criteriaId: string, points: number) => {
		setGrades((prev) => ({
			...prev,
			[criteriaId]: points,
		}));
	};

	const handleSubmitGrade = () => {
		const criteriaGrades = Object.entries(grades).map(([criteriaId, points]) => ({
			criteriaId,
			pointsAwarded: points as number,
			feedback: "",
		}));

		gradeMutation.mutate({
			criteriaGrades,
			overallFeedback,
		});
	};

	const totalPoints = Object.values(grades).reduce((sum, val) => sum + val, 0);
	if (!assignment || !submission) {
		return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
	}
	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex items-start justify-between">
				<div className="space-y-2">
					<h1 className="text-2xl font-bold">{assignment.title}</h1>
					<p className="text-sm text-text-secondary">
						Grading submission from {submission.student?.firstName} {submission.student?.lastName}
					</p>
				</div>
				<Button variant="outline" onClick={() => navigate(-1)}>
					<Icon icon="solar:arrow-left-bold-duotone" size={16} className="mr-2" />
					Back
				</Button>
			</div>

			{/* Student Info Card */}
			<Card>
				<CardContent className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						<div>
							<p className="text-sm text-text-secondary mb-1">Student Name</p>
							<p className="font-semibold">
								{submission.student?.firstName} {submission.student?.lastName}
							</p>
							<p className="text-xs text-text-secondary">{submission.student?.email}</p>
						</div>
						<div>
							<p className="text-sm text-text-secondary mb-1">Submitted</p>
							{submission.submittedAt ? (
								<>
									<p className="font-semibold">{format(new Date(submission.submittedAt), "MMM dd, yyyy")}</p>
									<p className="text-xs text-text-secondary">{format(new Date(submission.submittedAt), "h:mm a")}</p>
								</>
							) : (
								<p className="text-text-secondary">Not submitted</p>
							)}
						</div>
						<div>
							<p className="text-sm text-text-secondary mb-1">Late Status</p>
							<Badge variant={submission.isLate ? "error" : "success"}>{submission.isLate ? "Late" : "On Time"}</Badge>
						</div>
						<div>
							<p className="text-sm text-text-secondary mb-1">Max Points</p>
							<p className="font-semibold text-lg">{assignment.maxPoints}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Content Tabs */}
			<Card>
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
					<CardHeader className="border-b">
						<TabsList className="w-full justify-start">
							<TabsTrigger value="submission">Submission</TabsTrigger>
							<TabsTrigger value="grading">Grading</TabsTrigger>
						</TabsList>
					</CardHeader>

					<CardContent className="p-6">
						{activeTab === "submission" && (
							<div className="space-y-4">
								<h3 className="text-lg font-semibold">Student Submission</h3>
								<div className="bg-secondary/50 rounded-lg p-4 min-h-96 prose prose-sm max-w-none whitespace-pre-wrap">
									{submission.content || "No content submitted"}
								</div>
							</div>
						)}

						{activeTab === "grading" && (
							<div className="space-y-6">
								<div>
									<h3 className="text-lg font-semibold mb-4">Score by Criteria</h3>
									<div className="space-y-4">
										{assignment.gradingCriteria?.map((criteria) => (
											<div key={criteria.id} className="border rounded-lg p-4 space-y-3">
												<div className="flex items-start justify-between">
													<div>
														<p className="font-semibold">{criteria.name}</p>
														{criteria.description && (
															<p className="text-sm text-text-secondary mt-1">{criteria.description}</p>
														)}
													</div>
													<Badge>{criteria.maxPoints} pts</Badge>
												</div>

												<div className="flex items-end gap-3">
													<div className="flex-1">
														<label className="text-sm font-medium mb-2 block">Points Awarded</label>
														<Input
															type="number"
															min="0"
															max={criteria.maxPoints}
															value={grades[criteria.id] || 0}
															onChange={(e) =>
																handleGradeChange(
																	criteria.id,
																	Math.min(parseInt(e.target.value) || 0, criteria.maxPoints)
																)
															}
															className="font-mono"
														/>
													</div>
													<div className="text-sm text-text-secondary">
														{grades[criteria.id] || 0} / {criteria.maxPoints}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								<div className="border-t pt-6">
									<h4 className="font-semibold mb-4">Overall Feedback</h4>
									<Textarea
										placeholder="Provide overall feedback to the student..."
										value={overallFeedback}
										onChange={(e) => setOverallFeedback(e.target.value)}
										className="min-h-32"
									/>
								</div>

								<div className="border-t pt-6 flex items-center justify-between">
									<div className="space-y-2">
										<p className="text-sm text-text-secondary">Total Score</p>
										<p className="text-3xl font-bold">
											{totalPoints} / {assignment.maxPoints}
										</p>
										<p className="text-sm font-semibold">
											{Math.round((totalPoints / (assignment.maxPoints || 1)) * 100)}%
										</p>
									</div>

									<div className="flex gap-3">
										<Button variant="outline" onClick={() => navigate(-1)} disabled={gradeMutation.isPending}>
											<Icon icon="solar:close-circle-bold-duotone" size={16} className="mr-2" />
											Cancel
										</Button>
										<Button onClick={handleSubmitGrade} disabled={gradeMutation.isPending || totalPoints === 0}>
											<Icon icon="solar:check-circle-bold-duotone" size={16} className="mr-2" />
											{gradeMutation.isPending ? "Submitting..." : "Submit Grade"}
										</Button>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Tabs>
			</Card>
		</div>
	);
}
