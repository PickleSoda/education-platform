import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/ui/tabs";
import { OptionList } from "./OptionList";
import type { Question, Option } from "./types";

interface QuestionEditorProps {
	question: Question;
	questionNumber: number;
	onQuestionChange: (question: Question) => void;
	onQuestionDelete: () => void;
	onQuestionMove?: (direction: "up" | "down") => void;
	canMoveUp?: boolean;
	canMoveDown?: boolean;
}

export function QuestionEditor({
	question,
	questionNumber,
	onQuestionChange,
	onQuestionDelete,
	onQuestionMove,
	canMoveUp = false,
	canMoveDown = false,
}: QuestionEditorProps) {
	const [isExpanded, setIsExpanded] = useState(true);

	const handleFieldChange = <K extends keyof Question>(field: K, value: Question[K]) => {
		console.log(`Changing ${field} to:`, value); // Debug log
		const updatedQuestion = { ...question, [field]: value };

		// When changing question type, reset options and correct answers
		if (field === "type") {
			console.log(`Question type changing from ${question.type} to ${value}`); // Debug log
			if (value === "multiple_choice" || value === "checkbox") {
				if (!updatedQuestion.options || updatedQuestion.options.length === 0) {
					updatedQuestion.options = [
						{ id: `opt_${Date.now()}_1`, text: "" },
						{ id: `opt_${Date.now()}_2`, text: "" },
					];
				}
				updatedQuestion.correctAnswer = [];
			} else {
				updatedQuestion.options = undefined;
				updatedQuestion.correctAnswer = [];
			}
		}

		console.log("Updated question:", updatedQuestion); // Debug log
		onQuestionChange(updatedQuestion);
	};

	const handleOptionsChange = (options: Option[]) => {
		handleFieldChange("options", options);
	};

	const handleCorrectAnswerChange = (correctAnswer: string[]) => {
		handleFieldChange("correctAnswer", correctAnswer);
	};

	const questionTypeLabels = {
		multiple_choice: "Multiple Choice",
		checkbox: "Checkbox (Multiple Select)",
		short_answer: "Short Answer",
		paragraph: "Paragraph",
	};

	const requiresOptions = question.type === "multiple_choice" || question.type === "checkbox";

	return (
		<Card className="w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Badge variant="outline">Question {questionNumber}</Badge>
						<Badge
							variant={
								question.type === "multiple_choice" ? "default" : question.type === "checkbox" ? "info" : "secondary"
							}
						>
							{questionTypeLabels[question.type]}
						</Badge>
						<span className="text-sm text-text-secondary">
							{question.points} point{question.points !== 1 ? "s" : ""}
						</span>
					</div>

					<div className="flex items-center gap-2">
						{/* Move buttons */}
						{onQuestionMove && (
							<>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => onQuestionMove("up")}
									disabled={!canMoveUp}
								>
									<Icon icon="solar:arrow-up-bold-duotone" size={16} />
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => onQuestionMove("down")}
									disabled={!canMoveDown}
								>
									<Icon icon="solar:arrow-down-bold-duotone" size={16} />
								</Button>
							</>
						)}

						{/* Toggle expand/collapse */}
						<Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
							<Icon icon={isExpanded ? "solar:eye-bold-duotone" : "solar:eye-closed-bold-duotone"} size={16} />
						</Button>

						{/* Delete button */}
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={onQuestionDelete}
							className="text-error hover:text-error"
						>
							<Icon icon="solar:trash-bin-minimalistic-bold-duotone" size={16} />
						</Button>
					</div>
				</div>
			</CardHeader>

			{isExpanded && (
				<CardContent className="space-y-4">
					{/* Question Text */}
					<div className="space-y-2">
						<Label htmlFor={`question-text-${question.id}`}>Question Text</Label>
						<Textarea
							id={`question-text-${question.id}`}
							value={question.text}
							onChange={(e) => handleFieldChange("text", e.target.value)}
							placeholder="Enter your question..."
							className="min-h-20"
						/>
					</div>

					<div className="space-y-4">
						{/* Question Type */}
						<div className="space-y-2">
							<Label>Question Type</Label>
							<Tabs
								value={question.type}
								onValueChange={(value) => handleFieldChange("type", value as Question["type"])}
							>
								<TabsList className="grid w-full grid-cols-4">
									<TabsTrigger value="multiple_choice" className="text-xs">
										<Icon icon="solar:check-circle-bold-duotone" size={14} className="mr-1" />
										Multiple Choice
									</TabsTrigger>
									<TabsTrigger value="checkbox" className="text-xs">
										<Icon icon="solar:check-square-bold-duotone" size={14} className="mr-1" />
										Checkbox
									</TabsTrigger>
									<TabsTrigger value="short_answer" className="text-xs">
										<Icon icon="solar:text-field-focus-bold-duotone" size={14} className="mr-1" />
										Short Answer
									</TabsTrigger>
									<TabsTrigger value="paragraph" className="text-xs">
										<Icon icon="solar:text-bold-duotone" size={14} className="mr-1" />
										Paragraph
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>

						{/* Points */}
						<div className="space-y-2">
							<Label htmlFor={`question-points-${question.id}`}>Points</Label>
							<Input
								id={`question-points-${question.id}`}
								type="number"
								value={question.points}
								onChange={(e) => handleFieldChange("points", parseInt(e.target.value) || 0)}
								min={1}
								max={100}
							/>
						</div>
					</div>

					{/* Options (for multiple choice and checkbox questions) */}
					{requiresOptions && (
						<OptionList
							options={question.options || []}
							correctAnswer={question.correctAnswer || []}
							questionType={question.type as "multiple_choice" | "checkbox"}
							onOptionsChange={handleOptionsChange}
							onCorrectAnswerChange={handleCorrectAnswerChange}
						/>
					)}

					{/* Correct Answer for text questions */}
					{(question.type === "short_answer" || question.type === "paragraph") && (
						<div className="space-y-2">
							<Label htmlFor={`correct-answer-${question.id}`}>Sample/Expected Answer (for grading reference)</Label>
							<Textarea
								id={`correct-answer-${question.id}`}
								value={question.correctAnswer?.[0] || ""}
								onChange={(e) => handleFieldChange("correctAnswer", [e.target.value])}
								placeholder="Enter a sample answer or keywords for manual grading..."
								className="min-h-16"
							/>
							<p className="text-xs text-text-secondary">
								This will help with manual grading and won&apos;t be shown to students.
							</p>
						</div>
					)}
				</CardContent>
			)}
		</Card>
	);
}
