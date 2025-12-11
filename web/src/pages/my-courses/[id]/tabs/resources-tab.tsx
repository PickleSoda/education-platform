import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";
import { useQuery } from "@tanstack/react-query";
import resourceService from "@/api/services/resourceService";
import { Skeleton } from "@/ui/skeleton";
import type { PublishedResource } from "@/types/entity";

interface ResourcesTabProps {
	instanceId: string;
}

export default function ResourcesTab({ instanceId }: ResourcesTabProps) {
	// Fetch published resources for this instance
	const { data: resourcesData, isLoading } = useQuery({
		queryKey: ["published-resources", instanceId],
		queryFn: () => resourceService.getPublishedResources(instanceId),
		enabled: !!instanceId,
	});

	const resources = resourcesData?.data || [];

	const getResourceIcon = (type: string | null) => {
		switch (type) {
			case "document":
				return "solar:document-text-bold-duotone";
			case "video":
				return "solar:video-library-bold-duotone";
			case "link":
				return "solar:link-bold-duotone";
			case "slide":
				return "solar:presentation-graph-bold-duotone";
			case "code":
				return "solar:code-bold-duotone";
			default:
				return "solar:file-bold-duotone";
		}
	};

	const getResourceColor = (type: string | null) => {
		switch (type) {
			case "document":
				return "text-blue-600";
			case "video":
				return "text-red-600";
			case "link":
				return "text-orange-600";
			case "slide":
				return "text-green-600";
			case "code":
				return "text-gray-600";
			default:
				return "text-gray-500";
		}
	};

	const handleResourceClick = (resource: PublishedResource) => {
		if (resource.url) {
			window.open(resource.url, "_blank");
		} else if (resource.filePath) {
			// TODO: Implement file download
			console.log("Download file:", resource.filePath);
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<Skeleton className="h-64 w-full" />
				</CardContent>
			</Card>
		);
	}

	// Group resources by type
	const groupedResources = resources.reduce(
		(acc, resource) => {
			const type = resource.resourceType || "other";
			if (!acc[type]) acc[type] = [];
			acc[type].push(resource);
			return acc;
		},
		{} as Record<string, PublishedResource[]>
	);

	return (
		<div className="space-y-6">
			{/* Resource Categories Overview */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Icon icon="solar:folder-bold-duotone" size={20} className="text-primary" />
							<h3 className="text-lg font-semibold">Course Resources</h3>
						</div>
					</div>
					<p className="text-sm text-text-secondary">Access course materials, slides, and other resources</p>
				</CardHeader>
				<CardContent>
					{resources.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-text-secondary">
							<Icon icon="solar:folder-open-bold-duotone" size={64} className="opacity-50 mb-4" />
							<p className="text-lg font-medium mb-2">No resources yet</p>
							<p className="text-sm">Your instructor hasn&apos;t uploaded any resources yet.</p>
							<p className="text-sm">Check back later for course materials.</p>
						</div>
					) : (
						<div className="grid gap-4 md:grid-cols-4">
							<div className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
								<Icon icon="solar:document-text-bold-duotone" size={28} className="text-blue-600" />
								<span className="text-sm font-medium">Documents</span>
								<Badge variant="outline">{groupedResources.document?.length || 0}</Badge>
							</div>
							<div className="flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
								<Icon icon="solar:video-library-bold-duotone" size={28} className="text-red-600" />
								<span className="text-sm font-medium">Videos</span>
								<Badge variant="outline">{groupedResources.video?.length || 0}</Badge>
							</div>
							<div className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
								<Icon icon="solar:link-bold-duotone" size={28} className="text-orange-600" />
								<span className="text-sm font-medium">Links</span>
								<Badge variant="outline">{groupedResources.link?.length || 0}</Badge>
							</div>
							<div className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
								<Icon icon="solar:presentation-graph-bold-duotone" size={28} className="text-green-600" />
								<span className="text-sm font-medium">Slides</span>
								<Badge variant="outline">{groupedResources.slide?.length || 0}</Badge>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Resources List */}
			{resources.length > 0 && (
				<Card>
					<CardHeader>
						<h3 className="text-lg font-semibold">All Resources</h3>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{resources
								.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
								.map((resource) => (
									<div
										key={resource.id}
										className="flex items-center justify-between p-4 rounded-lg border hover:bg-hover transition-colors cursor-pointer"
										onClick={() => handleResourceClick(resource)}
									>
										<div className="flex items-center gap-4 flex-1">
											<Icon
												icon={getResourceIcon(resource.resourceType)}
												size={32}
												className={getResourceColor(resource.resourceType)}
											/>
											<div className="flex flex-col flex-1">
												<span className="font-medium">{resource.title}</span>
												{resource.description && (
													<span className="text-sm text-text-secondary line-clamp-1">{resource.description}</span>
												)}
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="outline" className="text-xs">
														{resource.resourceType || "other"}
													</Badge>
													{resource.publishedAt && (
														<span className="text-xs text-text-secondary">
															Published {new Date(resource.publishedAt).toLocaleDateString()}
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{resource.url && (
												<Button variant="ghost" size="icon">
													<Icon icon="solar:link-circle-bold-duotone" size={20} />
												</Button>
											)}
											{resource.filePath && (
												<Button variant="ghost" size="icon">
													<Icon icon="solar:download-bold-duotone" size={20} />
												</Button>
											)}
											<Icon icon="solar:arrow-right-bold" size={20} className="text-text-secondary" />
										</div>
									</div>
								))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
