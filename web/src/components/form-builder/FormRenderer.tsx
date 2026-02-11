import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Checkbox } from "@/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Label } from "@/ui/label";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { useLocalStorage } from "./useLocalStorage";
import type { FormAttachment, QuestionAnswer, FormSubmission } from "./types";

interface FormRendererProps {
	form: FormAttachment;
	assignmentId: string;
	initialSubmission?: FormSubmission;
	onSubmit: (submission: FormSubmission) => void;
	onSaveDraft?: (submission: FormSubmission) => void;
	isSubmitting?: boolean;
	readonly?: boolean;
	showCorrectAnswers?: boolean;
}

export function FormRenderer({
	form,
	assignmentId,
	initialSubmission,
	onSubmit,
	onSaveDraft,
	isSubmitting = false,
	readonly = false,
	showCorrectAnswers = false,
}: FormRendererProps) {
	const [answers, setAnswers] = useState<QuestionAnswer[]>(() => {
		if (initialSubmission) {
			return initialSubmission.answers;
		}
		// Initialize empty answers for all questions
		return form.questions.map((q) => ({
			questionId: q.id,
			answer: [],
		}));
	});

	// LocalStorage for autosave (only for students, not readonly mode)
	const storageKey = `submission_draft_${assignmentId}`;
	const [draftSubmission, setDraftSubmission, clearDraft] = useLocalStorage<FormSubmission>(storageKey, {
		formId: form.id,
		answers: [],
	});

	// Auto-save draft every 10 seconds (only if not readonly)
	useEffect(() => {
		if (readonly) return;

		const interval = setInterval(() => {
			const submission: FormSubmission = {
				formId: form.id,
				answers,
			};
			setDraftSubmission(submission);
			onSaveDraft?.(submission);
		}, 10000);

		return () => clearInterval(interval);
	}, [answers, form.id, readonly, setDraftSubmission, onSaveDraft]);

	// Load draft on component mount (only if no initial submission and not readonly)
	useEffect(() => {
		if (
			!readonly &&
			!initialSubmission &&
			draftSubmission &&
			draftSubmission.formId === form.id &&
			draftSubmission.answers.length > 0
		) {
			const shouldLoadDraft = window.confirm(
				"A saved draft was found for this quiz. Would you like to continue where you left off?"
			);

			if (shouldLoadDraft) {
				setAnswers(draftSubmission.answers);
			} else {
				clearDraft();
			}
		}
	}, [readonly, initialSubmission, draftSubmission, form.id, clearDraft]);

	const updateAnswer = (questionId: string, answer: string[]) => {
		setAnswers((prev) => prev.map((qa) => (qa.questionId === questionId ? { ...qa, answer } : qa)));
	};

	const handleSubmit = () => {
		const submission: FormSubmission = {
			formId: form.id,
			answers,
		};
		onSubmit(submission);
		clearDraft();
	};

	const getAnswer = (questionId: string) => {
		return answers.find((qa) => qa.questionId === questionId)?.answer || [];
	};

	const isQuestionAnswered = (questionId: string) => {
		const answer = getAnswer(questionId);
		return answer.length > 0 && answer[0] !== "";
	};

	const answeredQuestions = form.questions.filter((q) => isQuestionAnswered(q.id)).length;
	const totalQuestions = form.questions.length;
	const allAnswered = answeredQuestions === totalQuestions;

	const renderQuestionInput = (question: any) => {
		const answer = getAnswer(question.id);
		const isCorrect =
			showCorrectAnswers &&
			question.correctAnswer &&
			JSON.stringify(answer.sort()) === JSON.stringify([...question.correctAnswer].sort());

		switch (question.type) {
			case "multiple_choice":
				return (
					<div className="space-y-3">
						<RadioGroup
							value={answer[0] || ""}
							onValueChange={(value) => updateAnswer(question.id, [value])}
							disabled={readonly}
						>
							{question.options?.map((option: any) => (
								<div key={option.id} className="flex items-center space-x-3">
									<RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
									<Label
										htmlFor={`${question.id}-${option.id}`}
										className={`flex-1 ${showCorrectAnswers && question.correctAnswer?.includes(option.id) ? "text-success font-medium" : ""}`}
									>
										{option.text}
										{showCorrectAnswers && question.correctAnswer?.includes(option.id) && (
											<Badge variant="success" className="ml-2">
												Correct
											</Badge>
										)}
									</Label>
								</div>
							))}
						</RadioGroup>
						{showCorrectAnswers && (
							<div className={`text-sm ${isCorrect ? "text-success" : "text-error"}`}>
								<Icon
									icon={isCorrect ? "solar:check-circle-bold" : "solar:close-circle-bold"}
									size={16}
									className="mr-1"
								/>
								{isCorrect ? "Correct!" : "Incorrect"}
							</div>
						)}
					</div>
				);

			case "checkbox":
				return (
					<div className="space-y-3">
						{question.options?.map((option: any) => (
							<div key={option.id} className="flex items-center space-x-3">
								<Checkbox
									id={`${question.id}-${option.id}`}
									checked={answer.includes(option.id)}
									onCheckedChange={(checked) => {
										if (checked) {
											updateAnswer(question.id, [...answer, option.id]);
										} else {
											updateAnswer(
												question.id,
												answer.filter((a) => a !== option.id)
											);
										}
									}}
									disabled={readonly}
								/>
								<Label
									htmlFor={`${question.id}-${option.id}`}
									className={`flex-1 ${showCorrectAnswers && question.correctAnswer?.includes(option.id) ? "text-success font-medium" : ""}`}
								>
									{option.text}
									{showCorrectAnswers && question.correctAnswer?.includes(option.id) && (
										<Badge variant="success" className="ml-2">
											Correct
										</Badge>
									)}
								</Label>
							</div>
						))}
						{showCorrectAnswers && (
							<div className={`text-sm ${isCorrect ? "text-success" : "text-error"}`}>
								<Icon
									icon={isCorrect ? "solar:check-circle-bold" : "solar:close-circle-bold"}
									size={16}
									className="mr-1"
								/>
								{isCorrect ? "Correct!" : "Incorrect"}
							</div>
						)}
					</div>
				);

			case "short_answer":
				return (
					<div className="space-y-2">
						<Input
							value={answer[0] || ""}
							onChange={(e) => updateAnswer(question.id, [e.target.value])}
							placeholder="Enter your answer..."
							disabled={readonly}
						/>
						{showCorrectAnswers && question.correctAnswer?.[0] && (
							<div className="text-sm text-text-secondary">
								<strong>Sample answer:</strong> {question.correctAnswer[0]}
							</div>
						)}
					</div>
				);

			case "paragraph":
				return (
					<div className="space-y-2">
						<Textarea
							value={answer[0] || ""}
							onChange={(e) => updateAnswer(question.id, [e.target.value])}
							placeholder="Enter your detailed answer..."
							className="min-h-24"
							disabled={readonly}
						/>
						{showCorrectAnswers && question.correctAnswer?.[0] && (
							<div className="text-sm text-text-secondary">
								<strong>Sample answer:</strong> {question.correctAnswer[0]}
							</div>
						)}
					</div>
				);

			default:
				return null;
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Icon icon="solar:document-text-bold-duotone" size={24} />
							{form.title || "Quiz/Survey"}
						</div>
						{!readonly && (
							<div className="flex items-center gap-2">
								<Badge variant="outline">
									{answeredQuestions}/{totalQuestions} Answered
								</Badge>
								<Badge variant={allAnswered ? "success" : "secondary"}>
									{Math.round((answeredQuestions / totalQuestions) * 100)}% Complete
								</Badge>
							</div>
						)}
					</CardTitle>
				</CardHeader>
			</Card>

			{/* Questions */}
			<div className="space-y-6">
				{form.questions.map((question, index) => (
					<Card key={question.id} className={`${isQuestionAnswered(question.id) ? "border-success" : ""}`}>
						<CardContent className="pt-6">
							<div className="space-y-4">
								{/* Question Header */}
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<Badge variant="outline">Question {index + 1}</Badge>
											<Badge variant="secondary">
												{question.points} point{question.points !== 1 ? "s" : ""}
											</Badge>
											{isQuestionAnswered(question.id) && (
												<Badge variant="success">
													<Icon icon="solar:check-circle-bold" size={14} className="mr-1" />
													Answered
												</Badge>
											)}
										</div>
										<p className="text-base font-medium leading-relaxed">{question.text}</p>
									</div>
								</div>

								{/* Question Input */}
								<div className="mt-4">{renderQuestionInput(question)}</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Auto-save indicator */}
			{!readonly && Object.keys(draftSubmission).length > 0 && (
				<div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
					<Icon icon="solar:floppy-disk-bold-duotone" size={16} />
					Draft auto-saved
				</div>
			)}

			{/* Submit Button */}
			{!readonly && (
				<div className="flex justify-end">
					<Button onClick={handleSubmit} disabled={!allAnswered || isSubmitting} size="lg">
						<Icon icon="solar:send-bold-duotone" size={16} className="mr-2" />
						{isSubmitting ? "Submitting..." : "Submit Quiz"}
					</Button>
				</div>
			)}
		</div>
	);
}
