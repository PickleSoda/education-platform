import { Card, CardContent, CardHeader } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import type { ResourceTemplate } from "#/entity";
import { Icon } from "@/components/icon";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Skeleton } from "@/ui/skeleton";
import { useRouter } from "@/routes/hooks";

interface ResourcesTabProps {
	courseId: string;
	resources: ResourceTemplate[];
	isLoading: boolean;
}

const resourceTypeColors: Record<string, string> = {
	document: "info",
	video: "error",
	link: "warning",
	slide: "success",
	code: "default",
	other: "default",
};

const resourceTypeIcons: Record<string, string> = {
	document: "solar:document-text-bold-duotone",
	video: "solar:video-library-bold-duotone",
	link: "solar:link-bold-duotone",
	slide: "solar:presentation-graph-bold-duotone",
	code: "solar:code-bold-duotone",
	other: "solar:file-bold-duotone",
};

export function ResourcesTab({ courseId, resources, isLoading }: ResourcesTabProps) {
	const { push } = useRouter();

	const columns: ColumnsType<ResourceTemplate> = [
		{
			title: "Title",
			dataIndex: "title",
			width: 300,
			render: (title, record) => (
				<div className="flex items-center gap-3">
					<Icon icon={resourceTypeIcons[record.resourceType || "other"]} size={24} className="text-primary" />
					<div className="flex flex-col">
						<span className="font-medium">{title}</span>
						{record.description && (
							<span className="text-xs text-text-secondary line-clamp-1">{record.description}</span>
						)}
					</div>
				</div>
			),
		},
		{
			title: "Type",
			dataIndex: "resourceType",
			width: 120,
			render: (type: string | null) => {
				const displayType = type || "other";
				return (
					<Badge variant={resourceTypeColors[displayType] as any}>
						{displayType.charAt(0).toUpperCase() + displayType.slice(1)}
					</Badge>
				);
			},
		},
		{
			title: "Location",
			dataIndex: "url",
			width: 200,
			render: (url: string | null, record) => {
				if (url) {
					return (
						<div className="flex items-center gap-2">
							<Icon icon="solar:link-circle-bold-duotone" size={16} className="text-primary" />
							<span className="text-xs truncate max-w-[150px]" title={url}>
								{url}
							</span>
						</div>
					);
				}
				if (record.filePath) {
					return (
						<div className="flex items-center gap-2">
							<Icon icon="solar:file-check-bold-duotone" size={16} className="text-success" />
							<span className="text-xs truncate max-w-[150px]" title={record.filePath}>
								{record.filePath}
							</span>
						</div>
					);
				}
				return <span className="text-xs text-text-secondary">No file/URL</span>;
			},
		},
		{
			title: "Syllabus Link",
			dataIndex: "syllabusItem",
			width: 150,
			render: (syllabusItem?: ResourceTemplate["syllabusItem"]) =>
				syllabusItem ? (
					<div className="flex flex-col">
						<span className="text-xs font-medium">{syllabusItem.title}</span>
						{syllabusItem.weekNumber && (
							<span className="text-xs text-text-secondary">Week {syllabusItem.weekNumber}</span>
						)}
					</div>
				) : (
					<span className="text-xs text-text-secondary">Not linked</span>
				),
		},
		{
			title: "Created",
			dataIndex: "createdAt",
			width: 120,
			render: (date: string) => new Date(date).toLocaleDateString(),
		},
	];

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
			{/* Resource Overview */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold">Course Resources</h3>
							<p className="text-sm text-text-secondary mt-1">
								Manage resource templates that can be published to course instances
							</p>
						</div>
						<Button onClick={() => push(`/management/courses/edit/${courseId}/resource/create`)}>
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							Create Resource
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-5 gap-4 mb-6">
						<div className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
							<Icon icon="solar:document-text-bold-duotone" size={24} className="text-blue-600" />
							<span className="text-sm font-medium">Documents</span>
							<span className="text-2xl font-bold">
								{resources.filter((r) => r.resourceType === "document").length}
							</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
							<Icon icon="solar:video-library-bold-duotone" size={24} className="text-red-600" />
							<span className="text-sm font-medium">Videos</span>
							<span className="text-2xl font-bold">{resources.filter((r) => r.resourceType === "video").length}</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
							<Icon icon="solar:link-bold-duotone" size={24} className="text-orange-600" />
							<span className="text-sm font-medium">Links</span>
							<span className="text-2xl font-bold">{resources.filter((r) => r.resourceType === "link").length}</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
							<Icon icon="solar:presentation-graph-bold-duotone" size={24} className="text-green-600" />
							<span className="text-sm font-medium">Slides</span>
							<span className="text-2xl font-bold">{resources.filter((r) => r.resourceType === "slide").length}</span>
						</div>
						<div className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
							<Icon icon="solar:code-bold-duotone" size={24} className="text-gray-600" />
							<span className="text-sm font-medium">Code</span>
							<span className="text-2xl font-bold">{resources.filter((r) => r.resourceType === "code").length}</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Resources Table */}
			<Card>
				<CardContent className="p-0">
					{resources.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-text-secondary">
							<Icon icon="solar:folder-open-bold-duotone" size={64} className="opacity-50 mb-4" />
							<p className="text-lg font-medium mb-2">No resources yet</p>
							<p className="text-sm mb-6">Create resource templates to share with your course instances</p>
							<Button onClick={() => push(`/management/courses/edit/${courseId}/resource/create`)}>
								<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
								Create Your First Resource
							</Button>
						</div>
					) : (
						<Table
							columns={columns}
							dataSource={resources}
							rowKey="id"
							pagination={{
								pageSize: 10,
								showTotal: (total) => `Total ${total} resources`,
							}}
							onRow={(record) => ({
								onClick: () => push(`/management/courses/edit/${courseId}/resource/${record.id}`),
								className: "cursor-pointer hover:bg-hover",
							})}
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
