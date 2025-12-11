import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { Textarea } from "@/ui/textarea";
import { Upload } from "@/components/upload";
import type { UploadFile } from "antd";
import { useState } from "react";

interface SubmissionTabProps {
	content: string;
	setContent: (content: string) => void;
	handleSaveDraft: () => void;
	handleSubmit: () => void;
	isSaving: boolean;
	isSubmitting: boolean;
	isOverdue: boolean;
}

export function SubmissionTab({
	content,
	setContent,
	handleSaveDraft,
	handleSubmit,
	isSaving,
	isSubmitting,
	isOverdue,
}: SubmissionTabProps) {
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
		setFileList(newFileList);
	};

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-4">Submit Your Work</h3>

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
					/>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-3 mt-6">
					<Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isOverdue}>
						<Icon icon="solar:floppy-disk-bold-duotone" size={16} className="mr-2" />
						{isSaving ? "Saving..." : "Save Draft"}
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isSubmitting || (!content.trim() && fileList.length === 0) || isOverdue}
					>
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
			</div>
		</div>
	);
}
