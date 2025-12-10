import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Icon } from "@/components/icon";

interface ResourcesTabProps {
	instanceId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ResourcesTab({ instanceId }: ResourcesTabProps) {
	// This would fetch from an API in a real implementation
	const resources: any[] = [];

	return (
		<div className="space-y-6">
			{/* Folder Navigation */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Icon icon="solar:folder-bold-duotone" size={20} className="text-primary" />
							<h3 className="text-lg font-semibold">Course Resources</h3>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								<Icon icon="solar:sort-horizontal-bold-duotone" size={16} className="mr-2" />
								Sort
							</Button>
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
						<div className="space-y-2">{/* Resource list would go here */}</div>
					)}
				</CardContent>
			</Card>

			{/* Quick Access Sections */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Syllabus Section */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Icon icon="solar:document-text-bold-duotone" size={20} className="text-primary" />
							<h3 className="font-semibold">Syllabus</h3>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center justify-center py-8 text-text-secondary">
							<Icon icon="solar:document-bold-duotone" size={40} className="opacity-50 mb-3" />
							<p className="text-sm">No syllabus uploaded</p>
						</div>
					</CardContent>
				</Card>

				{/* Lecture Slides Section */}
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Icon icon="solar:presentation-graph-bold-duotone" size={20} className="text-primary" />
							<h3 className="font-semibold">Lecture Slides</h3>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center justify-center py-8 text-text-secondary">
							<Icon icon="solar:presentation-graph-bold-duotone" size={40} className="opacity-50 mb-3" />
							<p className="text-sm">No slides uploaded</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Resource Categories */}
			<Card>
				<CardHeader>
					<h3 className="text-lg font-semibold">Browse by Category</h3>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-4">
						<Button variant="outline" className="h-24 flex-col gap-2">
							<Icon icon="solar:video-library-bold-duotone" size={28} />
							<span>Videos</span>
							<Badge variant="outline">0</Badge>
						</Button>
						<Button variant="outline" className="h-24 flex-col gap-2">
							<Icon icon="solar:document-bold-duotone" size={28} />
							<span>Documents</span>
							<Badge variant="outline">0</Badge>
						</Button>
						<Button variant="outline" className="h-24 flex-col gap-2">
							<Icon icon="solar:link-bold-duotone" size={28} />
							<span>Links</span>
							<Badge variant="outline">0</Badge>
						</Button>
						<Button variant="outline" className="h-24 flex-col gap-2">
							<Icon icon="solar:archive-bold-duotone" size={28} />
							<span>Archives</span>
							<Badge variant="outline">0</Badge>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
