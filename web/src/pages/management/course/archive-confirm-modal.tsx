import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";

export interface ArchiveConfirmModalProps {
	show: boolean;
	courseName: string;
	isArchived: boolean;
	onConfirm: () => void;
	onCancel: () => void;
	loading?: boolean;
}

export function ArchiveConfirmModal({
	show,
	courseName,
	isArchived,
	onConfirm,
	onCancel,
	loading,
}: ArchiveConfirmModalProps) {
	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{isArchived ? "Unarchive Course" : "Archive Course"}</DialogTitle>
				</DialogHeader>
				<div className="py-4">
					<p className="text-sm text-text-secondary">
						{isArchived ? (
							<>
								Are you sure you want to unarchive <strong>{courseName}</strong>? This will make the course active again
								and visible in the course catalog.
							</>
						) : (
							<>
								Are you sure you want to archive <strong>{courseName}</strong>? This will hide the course from the
								active catalog, but it will not be deleted and can be restored later.
							</>
						)}
					</p>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button onClick={onConfirm} disabled={loading}>
						{loading ? "Processing..." : isArchived ? "Unarchive" : "Archive"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
