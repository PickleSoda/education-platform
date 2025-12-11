import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Icon } from "@/components/icon";
import type { PublishedAssignment } from "#/entity";

interface FeedbackTabProps {
	assignment: PublishedAssignment;
	submission: {
		totalPoints?: number;
		feedback?: string;
	} | null;
}

export function FeedbackTab({ assignment, submission }: FeedbackTabProps) {
	// Mock data - in real app, this would come from the submission grades
	const criteriaGrades = [
		{ name: "Code Quality & Implementation", points: 25, maxPoints: 25 },
		{ name: "Complexity Analysis", points: 23, maxPoints: 25 },
		{ name: "Performance Testing & Results", points: 20, maxPoints: 25 },
		{ name: "Documentation & Presentation", points: 24, maxPoints: 25 },
	];

	const getGradeColor = (points: number, maxPoints: number) => {
		const percentage = (points / maxPoints) * 100;
		if (percentage >= 90) return "bg-success/10";
		if (percentage >= 70) return "bg-info/10";
		if (percentage >= 50) return "bg-warning/10";
		return "bg-error/10";
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-4">Grade Feedback</h3>

				{/* Score Breakdown */}
				{assignment.gradingCriteria && assignment.gradingCriteria.length > 0 && (
					<div className="mb-6 space-y-3">
						<h4 className="font-semibold">Score Breakdown</h4>
						<div className="space-y-2">
							{criteriaGrades.map((criterion, index) => (
								<div
									key={index}
									className={`flex justify-between items-center p-3 rounded-lg ${getGradeColor(criterion.points, criterion.maxPoints)}`}
								>
									<span>{criterion.name}</span>
									<span className="font-semibold">
										{criterion.points}/{criterion.maxPoints}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Overall Score */}
				{submission?.totalPoints && (
					<div className="mb-6">
						<Card className="p-4 bg-primary/5 border-primary/20">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-sm text-text-secondary mb-1">Total Score</div>
									<div className="text-3xl font-bold text-primary">
										{submission.totalPoints}/{assignment.maxPoints}
									</div>
									<div className="text-sm text-text-secondary mt-1">
										{Math.round(((submission.totalPoints || 0) / (assignment.maxPoints || 1)) * 100)}%
									</div>
								</div>
								<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
									<Icon icon="solar:cup-star-bold-duotone" size={32} className="text-primary" />
								</div>
							</div>
						</Card>
					</div>
				)}

				{/* Instructor Feedback */}
				{submission?.feedback && (
					<div className="border-t pt-6">
						<h4 className="font-semibold mb-3">Instructor Feedback</h4>
						<Card className="p-4 bg-secondary/50">
							<p className="text-sm leading-relaxed whitespace-pre-wrap">{submission.feedback}</p>
						</Card>
					</div>
				)}

				{/* Regrade Request Button */}
				<div className="flex gap-3 mt-6">
					<Button variant="outline">
						<Icon icon="solar:refresh-bold-duotone" size={16} className="mr-2" />
						Request Regrade
					</Button>
				</div>
			</div>
		</div>
	);
}
