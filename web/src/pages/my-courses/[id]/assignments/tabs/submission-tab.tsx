import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Textarea } from "@/ui/textarea";
import { Upload } from "@/components/upload";
import { FormRenderer } from "@/components/form-builder";
import type { UploadFile } from "antd";
import type { FormAttachment, PublishedAssignment, FormSubmission } from "#/entity";

interface SubmissionTabProps {
	assignment?: PublishedAssignment;
	content: string;
	setContent: (content: string) => void;
	fileList: UploadFile[];
	setFileList: (files: UploadFile[]) => void;
	formSubmission: FormSubmission | undefined;
	setFormSubmission: (submission: FormSubmission | null) => void;
	handleSaveDraft: () => void;
	handleSubmit: () => void;
	isSaving: boolean;
	isSubmitting: boolean;
	isOverdue: boolean;
}

export function SubmissionTab({
	assignment,
	content,
	setContent,
	fileList,
	setFileList,
	formSubmission,
	setFormSubmission,
	handleSaveDraft,
	handleSubmit,
	isSaving,
	isSubmitting,
	isOverdue,
}: SubmissionTabProps) {
	const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
		setFileList(newFileList);
	};

	const handleFormSubmit = (submission: FormSubmission) => {
		setFormSubmission(submission);
	};

	// Check if assignment has form attachments
	const formAttachment = assignment?.attachments?.find((att) => att.type === "form") as FormAttachment | undefined;
	const hasRequiredSubmissions = content.trim() || fileList.length > 0;

	// If there's a form, check if it's completed
	const isFormCompleted = formAttachment
		? formSubmission &&
			formSubmission.formId === formAttachment.id &&
			formAttachment.questions.every((question) =>
				formSubmission.answers.find(
					(answer) => answer.questionId === question.id && answer.answer.length > 0 && answer.answer[0] !== ""
				)
			)
		: true;

	const canSubmit = (hasRequiredSubmissions || isFormCompleted) && !isOverdue;

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-4">Submit Your Work</h3>

				{/* Form Section (if present) */}
				{formAttachment && (
					<div className="mb-8">
						<FormRenderer
							form={formAttachment}
							assignmentId={assignment?.id || ""}
							initialSubmission={formSubmission}
							onSubmit={handleFormSubmit}
							isSubmitting={false}
							readonly={isOverdue}
						/>
					</div>
				)}

				{/* File Upload Section */}
				<div className="mb-6">
					<label className="text-sm font-semibold mb-2 block">Upload Files</label>
					<Upload
						multiple
						fileList={fileList}
						onChange={handleUploadChange}
						beforeUpload={() => false}
						accept=".pdf,.doc,.docx,.zip,.txt,.py,.java,.js,.ts,.jsx,.tsx"
						maxCount={10}
						disabled={isOverdue}
					/>
					<p className="text-xs text-text-secondary mt-2">
						Supported formats: PDF, DOC, DOCX, ZIP, TXT, source code files (Max 100MB per file)
					</p>
				</div>

				{/* Text Submission Section */}
				<div className="space-y-3">
					<label className="text-sm font-semibold">Add Text Content (Optional)</label>
					<Textarea
						placeholder="Write your submission text here..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="min-h-64"
						disabled={isOverdue}
					/>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3 mt-6">
					<Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isOverdue}>
						<Icon icon="solar:floppy-disk-bold-duotone" size={16} className="mr-2" />
						{isSaving ? "Saving..." : "Save Draft"}
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
						<Icon icon="solar:send-bold-duotone" size={16} className="mr-2" />
						{isSubmitting ? "Submitting..." : "Submit Assignment"}
					</Button>
					{isOverdue && (
						<div className="ml-auto flex items-center text-error text-sm">
							<Icon icon="solar:danger-bold-duotone" size={16} className="mr-2" />
							Submission deadline has passed
						</div>
					)}
				</div>

				{/* Submission Status */}
				{formAttachment && !isFormCompleted && (
					<div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
						<div className="flex items-center text-warning text-sm">
							<Icon icon="solar:info-circle-bold" size={16} className="mr-2" />
							Please complete the quiz/survey before submitting
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
