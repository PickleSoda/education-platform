import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import type { Course } from "#/entity";
import courseService from "@/api/services/courseService";

export default function CoursePage() {
	const { push } = useRouter();
	const pathname = usePathname();

	const { data, isLoading } = useQuery({
		queryKey: ["courses"],
		queryFn: () => courseService.getCourses(),
	});

	const courses = data?.data || [];
	console.log(courses);
	const columns: ColumnsType<Course> = [
		{
			title: "Code",
			dataIndex: "code",
			width: 120,
			render: (code) => <span className="font-medium">{code}</span>,
		},
		{
			title: "Title",
			dataIndex: "title",
			width: 300,
			render: (title, record) => (
				<div className="flex flex-col">
					<span className="text-sm font-medium">{title}</span>
					{record.description && <span className="text-xs text-text-secondary line-clamp-1">{record.description}</span>}
				</div>
			),
		},
		{
			title: "Credits",
			dataIndex: "credits",
			align: "center",
			width: 80,
			render: (credits) => <Badge variant="info">{credits}</Badge>,
		},
		{
			title: "Tags",
			dataIndex: "tags",
			width: 200,
			render: (tags?: Course["tags"]) => (
				<div className="flex flex-wrap gap-1">
					{tags?.map((courseTag) => (
						<Badge key={courseTag.tag.id} variant="outline">
							{courseTag.tag.name}
						</Badge>
					))}
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "isArchived",
			align: "center",
			width: 100,
			render: (isArchived: boolean) => (
				<Badge variant={isArchived ? "error" : "success"}>{isArchived ? "Archived" : "Active"}</Badge>
			),
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							push(`${pathname}/${record.id}`);
						}}
					>
						<Icon icon="mdi:book-open-page-variant" size={18} />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => {}}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon">
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>Course Catalog</div>
					<Button onClick={() => {}}>New</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					columns={columns}
					dataSource={courses}
					loading={isLoading}
				/>
			</CardContent>
		</Card>
	);
}
