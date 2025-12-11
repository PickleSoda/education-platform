import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CreateInstanceReq } from "@/api/services/courseInstanceService";
import courseService from "@/api/services/courseService";
import { Icon } from "@/components/icon";

interface CreateInstanceModalProps {
	show: boolean;
	courseId?: string;
	courseName?: string;
	onClose: () => void;
	onSubmit: (data: CreateInstanceReq) => void;
	isSubmitting?: boolean;
}

export function CreateInstanceModal({
	show,
	courseId,
	courseName,
	onClose,
	onSubmit,
	isSubmitting = false,
}: CreateInstanceModalProps) {
	const [formData, setFormData] = useState<CreateInstanceReq>({
		courseId: courseId || "",
		semester: "",
		startDate: "",
		endDate: "",
		enrollmentLimit: undefined,
		enrollmentOpen: false,
		lecturerIds: [],
	});

	// Fetch courses only when courseId is not provided
	const { data: coursesData } = useQuery({
		queryKey: ["courses", { includeArchived: "false" }],
		queryFn: () => courseService.getCourses({ includeArchived: "false" }),
		enabled: !courseId && show,
	});

	const courses = coursesData?.data || [];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Convert YYYY-MM-DD to ISO datetime string
		const submitData: CreateInstanceReq = {
			...formData,
			startDate: formData.startDate ? new Date(formData.startDate + "T00:00:00").toISOString() : "",
			endDate: formData.endDate ? new Date(formData.endDate + "T23:59:59").toISOString() : "",
		};

		onSubmit(submitData);
	};

	const handleClose = () => {
		setFormData({
			courseId: courseId || "",
			semester: "",
			startDate: "",
			endDate: "",
			enrollmentLimit: undefined,
			enrollmentOpen: false,
			lecturerIds: [],
		});
		onClose();
	};

	return (
		<Dialog open={show} onOpenChange={(open) => !open && handleClose()}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Icon icon="solar:calendar-add-bold-duotone" size={24} />
						Create Course Instance
					</DialogTitle>
					<DialogDescription>
						{courseName ? (
							<>
								Create a new instance for <strong>{courseName}</strong>
							</>
						) : (
							"Create a new course instance for a specific semester"
						)}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					{!courseId && (
						<div className="space-y-2">
							<Label htmlFor="courseId">
								Course <span className="text-error">*</span>
							</Label>
							<Select
								value={formData.courseId}
								onValueChange={(value) => setFormData({ ...formData, courseId: value })}
								required
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a course" />
								</SelectTrigger>
								<SelectContent>
									{courses.map((course) => (
										<SelectItem key={course.id} value={course.id}>
											{course.code} - {course.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="semester">
							Semester <span className="text-error">*</span>
						</Label>
						<Input
							id="semester"
							placeholder="e.g., Fall 2024, Spring 2025"
							value={formData.semester}
							onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="startDate">
								Start Date <span className="text-error">*</span>
							</Label>
							<Input
								id="startDate"
								type="date"
								value={formData.startDate}
								onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="endDate">
								End Date <span className="text-error">*</span>
							</Label>
							<Input
								id="endDate"
								type="date"
								value={formData.endDate}
								onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
								required
								min={formData.startDate}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="enrollmentLimit">Enrollment Limit (Optional)</Label>
						<Input
							id="enrollmentLimit"
							type="number"
							min="1"
							placeholder="Leave empty for unlimited"
							value={formData.enrollmentLimit || ""}
							onChange={(e) =>
								setFormData({
									...formData,
									enrollmentLimit: e.target.value ? parseInt(e.target.value) : undefined,
								})
							}
						/>
						<p className="text-xs text-text-secondary">Maximum number of students allowed to enroll</p>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label htmlFor="enrollmentOpen">Open Enrollment</Label>
							<p className="text-sm text-text-secondary">Allow students to enroll immediately after creation</p>
						</div>
						<Switch
							id="enrollmentOpen"
							checked={formData.enrollmentOpen}
							onCheckedChange={(checked) => setFormData({ ...formData, enrollmentOpen: checked })}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								isSubmitting || !formData.courseId || !formData.semester || !formData.startDate || !formData.endDate
							}
						>
							{isSubmitting ? (
								<>
									<Icon icon="solar:loading-bold-duotone" size={18} className="mr-2 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
									Create Instance
								</>
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
