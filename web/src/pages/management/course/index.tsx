import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Course } from "#/entity";
import courseService from "@/api/services/courseService";
import { useState } from "react";
import { ArchiveConfirmModal } from "./archive-confirm-modal";
import { toast } from "sonner";

export default function CoursePage() {
	const { push } = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();

	const [archiveModal, setArchiveModal] = useState<{
		show: boolean;
		course: Course | null;
	}>({ show: false, course: null });

	const { data, isLoading } = useQuery({
		queryKey: ["courses"],
		queryFn: () => courseService.getCourses({ includeArchived: "true" }),
	});

	const courses = data?.data || [];

	// Archive/Unarchive mutation
	const archiveMutation = useMutation({
		mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
			isArchived ? courseService.unarchiveCourse(id) : courseService.archiveCourse(id),
		onSuccess: (_, variables) => {
			toast.success(`Course ${variables.isArchived ? "unarchived" : "archived"} successfully`);
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			setArchiveModal({ show: false, course: null });
		},
		onError: () => {
			toast.error("Failed to update course status");
		},
	});

	const handleArchiveClick = (course: Course) => {
		setArchiveModal({ show: true, course });
	};

	const handleArchiveConfirm = () => {
		if (archiveModal.course) {
			archiveMutation.mutate({
				id: archiveModal.course.id,
				isArchived: archiveModal.course.isArchived,
			});
		}
	};

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
			width: 120,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray-500">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							push(`${pathname}/${record.id}`);
						}}
						title="View details"
					>
						<Icon icon="mdi:book-open-page-variant" size={18} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							push(`${pathname}/edit/${record.id}`);
						}}
						title="Edit course"
					>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => handleArchiveClick(record)}
						title={record.isArchived ? "Unarchive course" : "Archive course"}
					>
						<Icon
							icon={record.isArchived ? "solar:inbox-unarchive-bold-duotone" : "solar:inbox-archive-bold-duotone"}
							size={18}
							className={record.isArchived ? "text-success!" : "text-warning!"}
						/>
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>Course Management</div>
						<Button onClick={() => push(`${pathname}/create`)}>
							<Icon icon="solar:add-circle-bold-duotone" size={18} className="mr-2" />
							New Course
						</Button>
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

			<ArchiveConfirmModal
				show={archiveModal.show}
				courseName={archiveModal.course?.title || ""}
				isArchived={archiveModal.course?.isArchived || false}
				onConfirm={handleArchiveConfirm}
				onCancel={() => setArchiveModal({ show: false, course: null })}
				loading={archiveMutation.isPending}
			/>
		</>
	);
}
