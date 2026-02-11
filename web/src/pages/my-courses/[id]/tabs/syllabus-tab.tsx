import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import syllabusService from "@/api/services/syllabusService";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/ui/collapsible";
import { useState } from "react";

interface SyllabusTabProps {
	courseId: string;
	isLoading?: boolean;
}

export default function SyllabusTab({ courseId, isLoading: initialLoading = false }: SyllabusTabProps) {
	const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

	const { data: syllabusData, isLoading: syllabusLoading } = useQuery({
		queryKey: ["syllabus", courseId],
		queryFn: () => syllabusService.getSyllabusItems(courseId),
		enabled: !!courseId,
	});

	const syllabusItems = syllabusData?.data || [];
	const isLoading = initialLoading || syllabusLoading;

	const toggleItem = (itemId: string) => {
		setExpandedItems((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(itemId)) {
				newSet.delete(itemId);
			} else {
				newSet.add(itemId);
			}
			return newSet;
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<Skeleton className="h-24 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (syllabusItems.length === 0) {
		return (
			<Card>
				<CardContent className="p-12">
					<div className="flex flex-col items-center justify-center text-center text-text-secondary">
						<Icon icon="solar:book-bold-duotone" size={64} className="opacity-50 mb-4" />
						<p className="text-lg font-medium mb-2">No Syllabus Available</p>
						<p className="text-sm">The instructor has not yet created the course syllabus.</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Overview Stats */}
			<div className="grid grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Icon icon="solar:calendar-bold-duotone" size={24} className="text-primary" />
							<h4 className="text-sm font-medium text-text-secondary">Total Weeks</h4>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{syllabusItems.filter((s) => s.weekNumber !== null).length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Icon icon="solar:book-bold-duotone" size={24} className="text-purple-600" />
							<h4 className="text-sm font-medium text-text-secondary">Topics</h4>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">{syllabusItems.length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center gap-2">
							<Icon icon="solar:target-bold-duotone" size={24} className="text-green-600" />
							<h4 className="text-sm font-medium text-text-secondary">Learning Objectives</h4>
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-3xl font-bold">
							{syllabusItems.reduce((sum, item) => sum + item.learningObjectives.length, 0)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Syllabus Items */}
			<div className="space-y-3">
				{syllabusItems.map((item) => (
					<Card key={item.id} className="overflow-hidden">
						<Collapsible open={expandedItems.has(item.id)} onOpenChange={() => toggleItem(item.id)} className="w-full">
							<CollapsibleTrigger asChild>
								<button className="w-full p-6 text-left hover:bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-3 mb-2 flex-wrap">
												<h3 className="text-lg font-semibold">{item.title}</h3>
												{item.weekNumber !== null && (
													<Badge variant="outline" className="w-fit">
														<Icon icon="solar:calendar-bold-duotone" size={14} className="mr-1" />
														Week {item.weekNumber}
													</Badge>
												)}
											</div>
											{item.description && (
												<p className="text-sm text-text-secondary line-clamp-2">{item.description}</p>
											)}
										</div>
										<div className="flex-shrink-0">
											<Icon
												icon={
													expandedItems.has(item.id)
														? "solar:chevron-up-bold-duotone"
														: "solar:chevron-down-bold-duotone"
												}
												size={24}
												className="text-text-secondary"
											/>
										</div>
									</div>
								</button>
							</CollapsibleTrigger>

							<CollapsibleContent className="border-t px-6 pb-6 pt-4 space-y-4 bg-card/50">
								{/* Full Description */}
								{item.description && (
									<div>
										<p className="text-sm font-medium text-text-secondary mb-2">Description</p>
										<p className="text-sm whitespace-pre-wrap">{item.description}</p>
									</div>
								)}

								{/* Learning Objectives */}
								{item.learningObjectives && item.learningObjectives.length > 0 && (
									<div>
										<p className="text-sm font-medium text-text-secondary mb-3">Learning Objectives</p>
										<ul className="space-y-2">
											{item.learningObjectives.map((objective, idx) => (
												<li key={idx} className="flex items-start gap-3 text-sm">
													<div className="flex-shrink-0 mt-1">
														<div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
															{idx + 1}
														</div>
													</div>
													<span className="text-text-primary">{objective}</span>
												</li>
											))}
										</ul>
									</div>
								)}

								{/* Associated Content */}
								{item._count && (item._count.assignmentTemplates > 0 || item._count.resourceTemplates > 0) && (
									<div>
										<p className="text-sm font-medium text-text-secondary mb-3">Related Content</p>
										<div className="flex flex-wrap gap-4">
											{item._count.assignmentTemplates > 0 && (
												<div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md">
													<Icon icon="solar:document-text-bold-duotone" size={18} className="text-primary" />
													<span className="text-sm font-medium">{item._count.assignmentTemplates} Assignment(s)</span>
												</div>
											)}
											{item._count.resourceTemplates > 0 && (
												<div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 rounded-md">
													<Icon icon="solar:folder-bold-duotone" size={18} className="text-blue-600" />
													<span className="text-sm font-medium">{item._count.resourceTemplates} Resource(s)</span>
												</div>
											)}
										</div>
									</div>
								)}
							</CollapsibleContent>
						</Collapsible>
					</Card>
				))}
			</div>
		</div>
	);
}
