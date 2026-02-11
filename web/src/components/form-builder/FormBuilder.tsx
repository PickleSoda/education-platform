import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Separator } from "@/ui/separator";
import { QuestionEditor } from "./QuestionEditor";
import { useLocalStorage } from "./useLocalStorage";
import type { FormAttachment, Question } from "./types";

interface FormBuilderProps {
	assignmentId?: string;
	initialForm?: FormAttachment;
	onSave: (form: FormAttachment) => void;
	onCancel: () => void;
	isSaving?: boolean;
}

export function FormBuilder({ assignmentId, initialForm, onSave, onCancel, isSaving = false }: FormBuilderProps) {
	const [title, setTitle] = useState(initialForm?.title || "");
	const [questions, setQuestions] = useState<Question[]>(initialForm?.questions || []);

	// LocalStorage for autosave
	const storageKey = `form_builder_draft_${assignmentId || "new"}`;
	const [draftForm, setDraftForm, clearDraft] = useLocalStorage<Partial<FormAttachment>>(storageKey, {});

	// Auto-save to localStorage every 5 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			if ((title || questions.length > 0) && assignmentId) {
				const currentForm = {
					type: "form" as const,
					id: initialForm?.id || storageKey,
					title,
					questions,
				};
				setDraftForm(currentForm);
			}
		}, 500);

		return () => clearInterval(interval);
	}, [title, questions, assignmentId, setDraftForm, initialForm?.id]);

	// Load draft on component mount (only once)
	useEffect(() => {
		// Get draft directly from localStorage to avoid dependency on draftForm state
		const savedDraft = localStorage.getItem(storageKey);
		if (savedDraft && !initialForm) {
			try {
				const parsedDraft = JSON.parse(savedDraft);
				if (parsedDraft && Object.keys(parsedDraft).length > 0) {
					const shouldLoadDraft = window.confirm(
						"A saved draft was found. Would you like to continue where you left off?"
					);

					if (shouldLoadDraft) {
						setTitle(parsedDraft.title || "");
						setQuestions(parsedDraft.questions || []);
					} else {
						clearDraft();
					}
				}
			} catch (error) {
				console.error("Failed to parse draft:", error);
				clearDraft();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageKey, initialForm]); // Only depend on storageKey and initialForm, not draftForm

	const addQuestion = () => {
		const newQuestion: Question = {
			id: `q_${Date.now()}`,
			type: "paragraph",
			text: "",
			points: 1,
			options: [],
			correctAnswer: [],
		};
		setQuestions([...questions, newQuestion]);
	};

	const updateQuestion = (index: number, updatedQuestion: Question) => {
		const updated = [...questions];
		updated[index] = updatedQuestion;
		setQuestions(updated);
	};

	const deleteQuestion = (index: number) => {
		const updated = questions.filter((_, i) => i !== index);
		setQuestions(updated);
	};

	const moveQuestion = (index: number, direction: "up" | "down") => {
		const updated = [...questions];
		const targetIndex = direction === "up" ? index - 1 : index + 1;

		if (targetIndex >= 0 && targetIndex < questions.length) {
			[updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
			setQuestions(updated);
		}
	};

	const handleSave = () => {
		const form: FormAttachment = {
			type: "form",
			id: initialForm?.id || `form_${Date.now()}`,
			title: title || "Untitled Quiz",
			questions,
		};

		onSave(form);

		// Clear draft after successful save
		clearDraft();
	};

	const handleCancel = () => {
		const hasChanges =
			title !== (initialForm?.title || "") ||
			JSON.stringify(questions) !== JSON.stringify(initialForm?.questions || []);

		if (hasChanges) {
			const shouldDiscard = window.confirm("You have unsaved changes. Are you sure you want to discard them?");

			if (!shouldDiscard) return;
		}

		clearDraft();
		onCancel();
	};

	const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
	const incompleteQuestions = questions.filter(
		(q) =>
			!q.text.trim() ||
			((q.type === "multiple_choice" || q.type === "checkbox") &&
				(!q.options ||
					q.options.length < 2 ||
					q.options.some((opt) => !opt.text.trim()) ||
					q.correctAnswer?.length === 0))
	);

	const isValidForm = questions.length > 0 && incompleteQuestions.length === 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-3">
							<Icon icon="solar:document-add-bold-duotone" size={24} />
							{initialForm ? "Edit Quiz/Survey" : "Create Quiz/Survey"}
						</CardTitle>
						<div className="flex items-center gap-2">
							<Badge variant="outline">
								{questions.length} Question{questions.length !== 1 ? "s" : ""}
							</Badge>
							<Badge variant="secondary">
								{totalPoints} Point{totalPoints !== 1 ? "s" : ""}
							</Badge>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Form Title */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Quiz/Survey Title</label>
							<Input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Enter quiz or survey title..."
							/>
						</div>

						{/* Auto-save indicator */}
						{Object.keys(draftForm).length > 0 && (
							<div className="flex items-center gap-2 text-sm text-text-secondary">
								<Icon icon="solar:floppy-disk-bold-duotone" size={16} />
								Draft auto-saved
							</div>
						)}

						{/* Validation warnings */}
						{incompleteQuestions.length > 0 && (
							<div className="flex items-center gap-2 text-sm text-warning">
								<Icon icon="solar:danger-triangle-bold-duotone" size={16} />
								{incompleteQuestions.length} question{incompleteQuestions.length !== 1 ? "s" : ""} need
								{incompleteQuestions.length === 1 ? "s" : ""} attention
							</div>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Questions */}
			<div className="space-y-4">
				{questions.map((question, index) => (
					<QuestionEditor
						key={question.id}
						question={question}
						questionNumber={index + 1}
						onQuestionChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
						onQuestionDelete={() => deleteQuestion(index)}
						onQuestionMove={(direction) => moveQuestion(index, direction)}
						canMoveUp={index > 0}
						canMoveDown={index < questions.length - 1}
					/>
				))}

				{questions.length === 0 && (
					<Card className="border-dashed">
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Icon icon="solar:document-text-bold-duotone" size={48} className="text-text-secondary mb-4" />
							<h3 className="text-lg font-medium mb-2">No questions yet</h3>
							<p className="text-text-secondary mb-6">
								Start building your quiz or survey by adding your first question.
							</p>
							<Button onClick={addQuestion}>
								<Icon icon="solar:add-circle-bold-duotone" size={16} className="mr-2" />
								Add First Question
							</Button>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Add Question Button */}
			{questions.length > 0 && (
				<Card className="border-dashed">
					<CardContent className="py-6">
						<Button onClick={addQuestion} variant="outline" className="w-full">
							<Icon icon="solar:add-circle-bold-duotone" size={16} className="mr-2" />
							Add Question
						</Button>
					</CardContent>
				</Card>
			)}

			<Separator />

			{/* Action Buttons */}
			<div className="flex justify-between">
				<Button variant="outline" onClick={handleCancel} disabled={isSaving}>
					Cancel
				</Button>

				<div className="flex gap-3">
					<Button onClick={handleSave} disabled={!isValidForm || isSaving}>
						<Icon icon="solar:floppy-disk-bold-duotone" size={16} className="mr-2" />
						{isSaving ? "Saving..." : initialForm ? "Update Quiz" : "Save Quiz"}
					</Button>
				</div>
			</div>
		</div>
	);
}
