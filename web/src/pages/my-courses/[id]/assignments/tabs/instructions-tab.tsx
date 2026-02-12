import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import type { PublishedAssignment, FileAttachment } from "#/entity";

interface InstructionsTabProps {
	assignment: PublishedAssignment;
}

// Helper to get icon based on file type
const getFileIcon = (mimeType?: string, name?: string): string => {
	const type = (mimeType || name || "").toLowerCase();
	if (type.includes("pdf")) return "solar:file-text-bold-duotone";
	if (type.includes("doc")) return "solar:document-text-bold-duotone";
	if (type.includes("xls") || type.includes("csv")) return "solar:chart-square-bold-duotone";
	if (type.includes("ppt")) return "solar:presentation-graph-bold-duotone";
	if (type.includes("zip") || type.includes("rar")) return "solar:archive-bold-duotone";
	if (type.includes("image") || type.includes("jpg") || type.includes("png") || type.includes("gif"))
		return "solar:gallery-bold-duotone";
	if (type.includes("video") || type.includes("mp4")) return "solar:video-frame-play-vertical-bold-duotone";
	return "solar:file-bold-duotone";
};

export function InstructionsTab({ assignment }: InstructionsTabProps) {
	const fileAttachments = (assignment.attachments || []).filter((att): att is FileAttachment => att.type === "file");

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-3">Assignment Instructions</h3>
				<div className="prose prose-sm max-w-none">
					<div dangerouslySetInnerHTML={{ __html: assignment.instructions || "" }} />
				</div>
			</div>

			{/* Resource Files */}
			{fileAttachments.length > 0 && (
				<div className="border-t pt-6">
					<h4 className="font-semibold mb-3">
						<Icon icon="solar:folder-open-bold-duotone" size={20} className="inline mr-2 text-primary" />
						Assignment Resources
					</h4>
					<div className="space-y-2">
						{fileAttachments.map((file) => (
							<div
								key={file.id}
								className="flex items-center justify-between p-3 border rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<Icon icon={getFileIcon(file.mimeType, file.name)} size={22} className="text-primary" />
									<div>
										<p className="font-medium text-sm">{file.name}</p>
										{file.mimeType && <p className="text-xs text-text-secondary">{file.mimeType}</p>}
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										if (file.url) {
											// If URL starts with /uploads, prepend server base (without /v1 or /api prefix)
											const serverBase = GLOBAL_CONFIG.apiBaseUrl.replace(/\/v\d+$/, "").replace(/\/api$/, "");
											const downloadUrl = file.url.startsWith("/uploads") ? `${serverBase}${file.url}` : file.url;
											window.open(downloadUrl, "_blank");
										}
									}}
								>
									<Icon icon="solar:download-linear" size={14} className="mr-1" />
									Download
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

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
