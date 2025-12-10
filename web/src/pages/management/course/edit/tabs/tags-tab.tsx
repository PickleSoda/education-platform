import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Input } from "@/ui/input";
import type { CourseTag } from "#/entity";
import { Icon } from "@/components/icon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import courseService from "@/api/services/courseService";
import { toast } from "sonner";
import { useState } from "react";

interface TagsTabProps {
	courseId: string;
	currentTags: CourseTag[];
}

export function TagsTab({ courseId, currentTags }: TagsTabProps) {
	const queryClient = useQueryClient();
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch all available tags
	const { data: tagsData } = useQuery({
		queryKey: ["tags"],
		queryFn: () => courseService.getAllTags(),
	});

	const allTags = tagsData?.data || [];
	const currentTagIds = new Set(currentTags.map((ct) => ct.tag.id));

	// Filter available tags that aren't already added
	const availableTags = allTags.filter(
		(tag) => !currentTagIds.has(tag.id) && tag.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Add tag mutation
	const addTagMutation = useMutation({
		mutationFn: (tagId: number) => courseService.addTag(courseId, { tagId }),
		onSuccess: () => {
			toast.success("Tag added successfully");
			queryClient.invalidateQueries({ queryKey: ["course", courseId] });
		},
		onError: () => {
			toast.error("Failed to add tag");
		},
	});

	// Remove tag mutation
	const removeTagMutation = useMutation({
		mutationFn: (tagId: number) => courseService.removeTag(courseId, tagId),
		onSuccess: () => {
			toast.success("Tag removed successfully");
			queryClient.invalidateQueries({ queryKey: ["course", courseId] });
		},
		onError: () => {
			toast.error("Failed to remove tag");
		},
	});

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{/* Current Tags */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Current Tags</h3>
					<p className="text-sm text-text-secondary">Tags currently assigned to this course</p>
				</CardHeader>
				<CardContent>
					{currentTags.length === 0 ? (
						<div className="text-center py-8 text-text-secondary">
							<Icon icon="solar:tag-bold-duotone" size={48} className="mx-auto mb-2 opacity-50" />
							<p>No tags assigned yet</p>
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{currentTags.map((courseTag) => (
								<Badge
									key={courseTag.tag.id}
									variant="outline"
									style={{ borderColor: courseTag.tag.color || undefined }}
									className="px-3 py-1.5 text-sm"
								>
									<span>{courseTag.tag.name}</span>
									<button
										type="button"
										onClick={() => removeTagMutation.mutate(courseTag.tag.id)}
										className="ml-2 hover:text-error transition-colors"
										disabled={removeTagMutation.isPending}
									>
										<Icon icon="solar:close-circle-bold" size={16} />
									</button>
								</Badge>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Add Tags */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Add Tags</h3>
					<p className="text-sm text-text-secondary">Search and add tags to this course</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<Input placeholder="Search tags..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

					{availableTags.length === 0 ? (
						<div className="text-center py-8 text-text-secondary">
							<p className="text-sm">
								{searchTerm ? "No tags found matching your search" : "All available tags have been added"}
							</p>
						</div>
					) : (
						<div className="flex flex-wrap gap-2">
							{availableTags.map((tag) => (
								<Badge
									key={tag.id}
									variant="outline"
									style={{ borderColor: tag.color || undefined }}
									className="px-3 py-1.5 text-sm cursor-pointer hover:bg-background-hover transition-colors"
									onClick={() => addTagMutation.mutate(tag.id)}
								>
									<span>{tag.name}</span>
									<Icon icon="solar:add-circle-bold" size={16} className="ml-2" />
								</Badge>
							))}
						</div>
					)}

					<div className="pt-4 border-t">
						<Button variant="outline" size="sm" className="w-full">
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							Create New Tag
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
