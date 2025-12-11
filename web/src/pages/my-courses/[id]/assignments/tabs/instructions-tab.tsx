import { Badge } from "@/ui/badge";
import type { PublishedAssignment } from "#/entity";

interface InstructionsTabProps {
	assignment: PublishedAssignment;
}

export function InstructionsTab({ assignment }: InstructionsTabProps) {
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-3">Assignment Instructions</h3>
				<div className="prose prose-sm max-w-none">
					<div dangerouslySetInnerHTML={{ __html: assignment.instructions || "" }} />
				</div>
			</div>

			{assignment.gradingCriteria && assignment.gradingCriteria.length > 0 && (
				<div className="border-t pt-6">
					<h4 className="font-semibold mb-3">Grading Criteria</h4>
					<div className="space-y-3">
						{assignment.gradingCriteria.map((criterion, index) => (
							<div key={index} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
								<div>
									<div className="font-medium">{criterion.name}</div>
									{criterion.description && (
										<div className="text-sm text-text-secondary mt-1">{criterion.description}</div>
									)}
								</div>
								<Badge>{criterion.maxPoints} points</Badge>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
