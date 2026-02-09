import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import type { SyllabusItem } from "#/entity";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/ui/skeleton";
import { useRouter } from "@/routes/hooks";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import syllabusService from "@/api/services/syllabusService";
import { toast } from "sonner";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/ui/alert-dialog";

interface SyllabusTabProps {
	courseId: string;
	isLoading: boolean;
}

interface SyllabusItemFormState {
	title: string;
	description: string;
	weekNumber: string;
	learningObjectives: string[];
	objectiveInput: string;
}

// Sortable item component
function SortableItem({
	item,
	onEdit,
	onDelete,
}: {
	item: SyllabusItem;
	onEdit: (item: SyllabusItem) => void;
	onDelete: (item: SyllabusItem) => void;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: item.id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`relative group border rounded-lg p-4 transition-colors ${
				isDragging ? "bg-primary/10 border-primary" : "bg-card hover:bg-hover"
			}`}
		>
			{/* Drag handle and week badge */}
			<div className="flex items-start gap-4">
				<div
					{...attributes}
					{...listeners}
					className="flex-shrink-0 cursor-grab active:cursor-grabbing mt-1 text-text-secondary hover:text-text-primary transition-colors"
				>
					<Icon icon="solar:menu-dots-bold-duotone" size={20} />
				</div>

				<div className="flex-1 min-w-0">
					{/* Title and week */}
					<div className="flex items-start justify-between gap-3 mb-2">
						<div className="flex-1 min-w-0">
							<h4 className="text-sm font-semibold line-clamp-2">{item.title}</h4>
							{item.weekNumber !== null && (
								<Badge variant="outline" className="mt-2 w-fit">
									Week {item.weekNumber}
								</Badge>
							)}
						</div>
					</div>

					{/* Description */}
					{item.description && <p className="text-xs text-text-secondary line-clamp-2 mb-3">{item.description}</p>}

					{/* Learning Objectives */}
					{item.learningObjectives && item.learningObjectives.length > 0 && (
						<div className="mb-3">
							<p className="text-xs font-medium text-text-secondary mb-2">Learning Objectives:</p>
							<div className="flex flex-wrap gap-2">
								{item.learningObjectives.map((objective, idx) => (
									<Badge key={idx} variant="secondary" className="text-xs">
										{objective}
									</Badge>
								))}
							</div>
						</div>
					)}

					{/* Stats */}
					{item._count && (
						<div className="flex gap-4 text-xs text-text-secondary">
							<div className="flex items-center gap-1">
								<Icon icon="solar:document-text-bold-duotone" size={14} />
								<span>{item._count.assignmentTemplates} assignments</span>
							</div>
							<div className="flex items-center gap-1">
								<Icon icon="solar:folder-bold-duotone" size={14} />
								<span>{item._count.resourceTemplates} resources</span>
							</div>
						</div>
					)}
				</div>

				{/* Action buttons */}
				<div className="flex gap-2 flex-shrink-0">
					<Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
						<Icon icon="solar:pen-bold-duotone" size={16} />
					</Button>
					<Button size="sm" variant="ghost" className="text-error" onClick={() => onDelete(item)}>
						<Icon icon="solar:trash-bin-minimalistic-bold-duotone" size={16} />
					</Button>
				</div>
			</div>
		</div>
	);
}

export function SyllabusTab({ courseId, isLoading: initialLoading }: SyllabusTabProps) {
	const { push } = useRouter();
	const queryClient = useQueryClient();
	const [editingItem, setEditingItem] = useState<SyllabusItem | null>(null);
	const [deleteItem, setDeleteItem] = useState<SyllabusItem | null>(null);
	const [isCreating, setIsCreating] = useState(false);
	const [formState, setFormState] = useState<SyllabusItemFormState>({
		title: "",
		description: "",
		weekNumber: "",
		learningObjectives: [],
		objectiveInput: "",
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			distance: 8,
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Fetch syllabus items
	const { data: syllabusData, isLoading: syllabusLoading } = useQuery({
		queryKey: ["syllabus", courseId],
		queryFn: () => syllabusService.getSyllabusItems(courseId),
		enabled: !!courseId,
	});

	const syllabusItems = syllabusData?.data || [];

	// Create mutation
	const createMutation = useMutation({
		mutationFn: () =>
			syllabusService.createSyllabusItem(courseId, {
				title: formState.title,
				description: formState.description || undefined,
				weekNumber: formState.weekNumber ? parseInt(formState.weekNumber) : undefined,
				learningObjectives: formState.learningObjectives,
			}),
		onSuccess: () => {
			toast.success("Syllabus item created successfully");
			queryClient.invalidateQueries({ queryKey: ["syllabus", courseId] });
			resetForm();
		},
		onError: () => {
			toast.error("Failed to create syllabus item");
		},
	});

	// Update mutation
	const updateMutation = useMutation({
		mutationFn: () => {
			if (!editingItem) throw new Error("No item to update");
			return syllabusService.updateSyllabusItem(editingItem.id, {
				title: formState.title || undefined,
				description: formState.description || undefined,
				weekNumber: formState.weekNumber ? parseInt(formState.weekNumber) : undefined,
				learningObjectives: formState.learningObjectives,
			});
		},
		onSuccess: () => {
			toast.success("Syllabus item updated successfully");
			queryClient.invalidateQueries({ queryKey: ["syllabus", courseId] });
			setEditingItem(null);
			resetForm();
		},
		onError: () => {
			toast.error("Failed to update syllabus item");
		},
	});

	// Delete mutation
	const deleteMutation = useMutation({
		mutationFn: () => {
			if (!deleteItem) throw new Error("No item to delete");
			return syllabusService.deleteSyllabusItem(deleteItem.id);
		},
		onSuccess: () => {
			toast.success("Syllabus item deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["syllabus", courseId] });
			setDeleteItem(null);
		},
		onError: () => {
			toast.error("Failed to delete syllabus item");
		},
	});

	// Reorder mutation (batch update)
	const reorderMutation = useMutation({
		mutationFn: async (items: SyllabusItem[]) => {
			// Update each item's sortOrder sequentially
			for (let i = 0; i < items.length; i++) {
				await syllabusService.updateSyllabusItem(items[i].id, {
					sortOrder: i,
				});
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["syllabus", courseId] });
			toast.success("Order saved successfully");
		},
		onError: () => {
			toast.error("Failed to save order");
		},
	});

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = syllabusItems.findIndex((item) => item.id === active.id);
			const newIndex = syllabusItems.findIndex((item) => item.id === over.id);

			const newItems = arrayMove(syllabusItems, oldIndex, newIndex);
			reorderMutation.mutate(newItems);
		}
	};

	const resetForm = () => {
		setFormState({
			title: "",
			description: "",
			weekNumber: "",
			learningObjectives: [],
			objectiveInput: "",
		});
		setIsCreating(false);
	};

	const startEdit = (item: SyllabusItem) => {
		setEditingItem(item);
		setFormState({
			title: item.title,
			description: item.description || "",
			weekNumber: item.weekNumber?.toString() || "",
			learningObjectives: [...item.learningObjectives],
			objectiveInput: "",
		});
		setIsCreating(false);
	};

	const addObjective = () => {
		if (formState.objectiveInput.trim()) {
			setFormState((prev) => ({
				...prev,
				learningObjectives: [...prev.learningObjectives, prev.objectiveInput.trim()],
				objectiveInput: "",
			}));
		}
	};

	const removeObjective = (index: number) => {
		setFormState((prev) => ({
			...prev,
			learningObjectives: prev.learningObjectives.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = () => {
		if (!formState.title.trim()) {
			toast.error("Title is required");
			return;
		}

		if (editingItem) {
			updateMutation.mutate();
		} else {
			createMutation.mutate();
		}
	};

	const isLoading = initialLoading || syllabusLoading;

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<Skeleton className="h-64 w-full" />
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Syllabus Overview */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Course Syllabus</h3>
							<p className="text-sm text-text-secondary mt-1">
								Define the course timeline, weeks/modules, and learning objectives
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-3 gap-4 mb-6">
						<div className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
							<Icon icon="solar:calendar-bold-duotone" size={24} className="text-blue-600" />
							<span className="text-sm font-medium">Total Weeks</span>
							<span className="text-2xl font-bold">{syllabusItems.filter((s) => s.weekNumber !== null).length}</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
							<Icon icon="solar:book-bold-duotone" size={24} className="text-purple-600" />
							<span className="text-sm font-medium">Total Topics</span>
							<span className="text-2xl font-bold">{syllabusItems.length}</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
							<Icon icon="solar:target-bold-duotone" size={24} className="text-green-600" />
							<span className="text-sm font-medium">Learning Objectives</span>
							<span className="text-2xl font-bold">
								{syllabusItems.reduce((sum, item) => sum + item.learningObjectives.length, 0)}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Form */}
			{(isCreating || editingItem) && (
				<Card className="border-primary/50 bg-primary/5">
					<CardHeader>
						<h4 className="font-semibold">{editingItem ? "Edit Syllabus Item" : "Create New Syllabus Item"}</h4>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Title */}
						<div>
							<label className="text-sm font-medium mb-2 block">Title *</label>
							<Input
								placeholder="e.g., Week 1: Introduction"
								value={formState.title}
								onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
							/>
						</div>

						{/* Week Number */}
						<div>
							<label className="text-sm font-medium mb-2 block">Week Number (Optional)</label>
							<Input
								type="number"
								placeholder="1"
								value={formState.weekNumber}
								onChange={(e) => setFormState((prev) => ({ ...prev, weekNumber: e.target.value }))}
							/>
						</div>

						{/* Description */}
						<div>
							<label className="text-sm font-medium mb-2 block">Description (Optional)</label>
							<Textarea
								placeholder="Course overview, setup, and introduction to programming concepts..."
								value={formState.description}
								onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
								rows={3}
							/>
						</div>

						{/* Learning Objectives */}
						<div>
							<label className="text-sm font-medium mb-2 block">Learning Objectives</label>
							<div className="flex gap-2 mb-2">
								<Input
									placeholder="Add a learning objective..."
									value={formState.objectiveInput}
									onChange={(e) => setFormState((prev) => ({ ...prev, objectiveInput: e.target.value }))}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addObjective();
										}
									}}
								/>
								<Button type="button" variant="outline" onClick={addObjective} size="sm">
									<Icon icon="solar:add-circle-bold-duotone" size={18} />
								</Button>
							</div>

							{/* Objectives tags */}
							{formState.learningObjectives.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{formState.learningObjectives.map((obj, idx) => (
										<Badge key={idx} variant="secondary" className="pr-1">
											<span className="flex-1">{obj}</span>
											<button type="button" onClick={() => removeObjective(idx)} className="ml-2 hover:text-error">
												×
											</button>
										</Badge>
									))}
								</div>
							)}
						</div>

						{/* Action buttons */}
						<div className="flex gap-2 justify-end pt-4">
							<Button
								variant="outline"
								onClick={() => {
									resetForm();
									setEditingItem(null);
								}}
							>
								Cancel
							</Button>
							<Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
								<Icon icon="solar:check-circle-bold-duotone" size={18} className="mr-2" />
								{editingItem ? "Update" : "Create"}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Syllabus Items List */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<h3 className="font-semibold">Syllabus Items</h3>
						{!isCreating && !editingItem && (
							<Button onClick={() => setIsCreating(true)} size="sm">
								<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
								Add Item
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent>
					{syllabusItems.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-text-secondary">
							<Icon icon="solar:calendar-bold-duotone" size={64} className="opacity-50 mb-4" />
							<p className="text-lg font-medium mb-2">No syllabus items yet</p>
							<p className="text-sm mb-6">Create syllabus items to define your course timeline and topics</p>
							<Button onClick={() => setIsCreating(true)}>
								<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
								Create First Item
							</Button>
						</div>
					) : (
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
							<SortableContext items={syllabusItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
								<div className="space-y-3">
									{syllabusItems.map((item) => (
										<SortableItem
											key={item.id}
											item={item}
											onEdit={startEdit}
											onDelete={(item) => setDeleteItem(item)}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					)}
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Syllabus Item?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{deleteItem?.title}"? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deleteMutation.mutate()}
							disabled={deleteMutation.isPending}
							className="bg-error hover:bg-error/90"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
