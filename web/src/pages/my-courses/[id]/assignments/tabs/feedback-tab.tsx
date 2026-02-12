import { Card } from "@/ui/card";
import { Icon } from "@/components/icon";
import type { PublishedAssignment, SubmissionWithRelations } from "#/entity";
import { format } from "date-fns";

interface FeedbackTabProps {
	assignment: PublishedAssignment;
	submission: SubmissionWithRelations | null;
}

export function FeedbackTab({ assignment, submission }: FeedbackTabProps) {
	if (!submission || (submission.status !== "graded" && submission.status !== "returned")) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-text-secondary">
				<Icon icon="solar:chat-round-dots-bold-duotone" size={48} className="opacity-50 mb-4" />
				<p className="font-medium">No feedback yet</p>
				<p className="text-sm">Feedback will appear here once your submission is graded</p>
			</div>
		);
	}

	// Match grades with grading criteria for score breakdown
	const criteriaGrades =
		assignment.gradingCriteria?.map((criterion) => {
			const grade = submission.grades?.find((g) => g.publishedCriteriaId === criterion.id);
			return {
				id: criterion.id,
				name: criterion.name,
				description: criterion.description,
				maxPoints: criterion.maxPoints,
				pointsAwarded: grade?.pointsAwarded ?? null,
				feedback: grade?.feedback ?? null,
			};
		}) || [];

	const hasCriteriaGrades = criteriaGrades.some((c) => c.pointsAwarded !== null);

	const getGradeColor = (points: number, maxPoints: number) => {
		const percentage = (points / maxPoints) * 100;
		if (percentage >= 90) return "bg-success/10 border-success/20";
		if (percentage >= 70) return "bg-info/10 border-info/20";
		if (percentage >= 50) return "bg-warning/10 border-warning/20";
		return "bg-error/10 border-error/20";
	};

	const getPercentageColor = (percentage: number) => {
		if (percentage >= 90) return "text-success";
		if (percentage >= 70) return "text-info";
		if (percentage >= 50) return "text-warning";
		return "text-error";
	};

	const totalScore = submission.finalPoints ?? submission.totalPoints ?? null;
	const percentage =
		totalScore !== null && assignment.maxPoints ? Math.round((totalScore / assignment.maxPoints) * 100) : null;

	return (
		<div className="space-y-6">
			{/* Overall Score */}
			{totalScore !== null && (
				<Card className="p-6 bg-primary/5 border-primary/20">
					<div className="flex items-center justify-between">
						<div>
							<div className="text-sm text-text-secondary mb-1">Your Score</div>
							<div className="text-3xl font-bold text-primary">
								{totalScore} / {assignment.maxPoints}
							</div>
							{percentage !== null && (
								<div className={`text-sm font-medium mt-1 ${getPercentageColor(percentage)}`}>{percentage}%</div>
							)}
							{submission.latePenaltyApplied != null && submission.latePenaltyApplied > 0 && (
								<div className="text-xs text-warning mt-2 flex items-center gap-1">
									<Icon icon="solar:danger-triangle-bold-duotone" size={14} />
									Late penalty applied: -{submission.latePenaltyApplied}%
									{submission.totalPoints !== submission.finalPoints && (
										<span className="text-text-secondary ml-1">(Original: {submission.totalPoints})</span>
									)}
								</div>
							)}
						</div>
						<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
							<Icon icon="solar:cup-star-bold-duotone" size={32} className="text-primary" />
						</div>
					</div>
				</Card>
			)}

			{/* Grading details */}
			{submission.gradedAt && (
				<div className="flex items-center gap-4 text-sm text-text-secondary">
					<div className="flex items-center gap-1.5">
						<Icon icon="solar:calendar-bold-duotone" size={16} />
						Graded on {format(new Date(submission.gradedAt), "MMM dd, yyyy 'at' h:mm a")}
					</div>
					{submission.gradedBy && (
						<div className="flex items-center gap-1.5">
							<Icon icon="solar:user-bold-duotone" size={16} />
							by {submission.gradedBy.firstName} {submission.gradedBy.lastName}
						</div>
					)}
				</div>
			)}

			{/* Criteria Score Breakdown */}
			{hasCriteriaGrades && criteriaGrades.length > 0 && (
				<div>
					<h4 className="font-semibold mb-3">Score Breakdown</h4>
					<div className="space-y-2">
						{criteriaGrades.map((criterion) => (
							<div
								key={criterion.id}
								className={`p-4 rounded-lg border ${
									criterion.pointsAwarded !== null
										? getGradeColor(criterion.pointsAwarded, criterion.maxPoints)
										: "bg-secondary/30 border-border"
								}`}
							>
								<div className="flex justify-between items-start">
									<div className="flex-1">
										<p className="font-medium">{criterion.name}</p>
										{criterion.description && (
											<p className="text-xs text-text-secondary mt-0.5">{criterion.description}</p>
										)}
									</div>
									<div className="text-right">
										{criterion.pointsAwarded !== null ? (
											<span className="font-semibold text-lg">
												{criterion.pointsAwarded}/{criterion.maxPoints}
											</span>
										) : (
											<span className="text-text-secondary">--/{criterion.maxPoints}</span>
										)}
									</div>
								</div>
								{criterion.feedback && (
									<div className="mt-2 pt-2 border-t border-current/10">
										<p className="text-sm text-text-secondary italic">"{criterion.feedback}"</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Instructor Feedback */}
			{submission.feedback && (
				<div>
					<h4 className="font-semibold mb-3">Instructor Feedback</h4>
					<Card className="p-4 bg-secondary/30">
						<p className="text-sm leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
					</Card>
				</div>
			)}

			{/* No detailed feedback */}
			{!hasCriteriaGrades && !submission.feedback && totalScore !== null && (
				<div className="flex flex-col items-center justify-center py-8 text-text-secondary">
					<Icon icon="solar:chat-round-dots-bold-duotone" size={32} className="opacity-50 mb-3" />
					<p className="text-sm">No detailed feedback was provided for this submission</p>
				</div>
			)}

			{/* Returned for resubmission notice */}
			{submission.status === "returned" && (
				<Card className="p-4 bg-warning/10 border-warning/30">
					<div className="flex items-start gap-3">
						<Icon icon="solar:restart-bold-duotone" size={20} className="text-warning shrink-0 mt-0.5" />
						<div>
							<p className="font-medium text-warning">Returned for Resubmission</p>
							<p className="text-sm text-text-secondary mt-1">
								Your instructor has returned this submission for revision. You can update your work and resubmit.
							</p>
						</div>
					</div>
				</Card>
			)}
		</div>
	);
}
