import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import type { UserInfo } from "#/entity";
import userService from "@/api/services/userService";

export default function UserPage() {
	const { push } = useRouter();
	const pathname = usePathname();

	const { data, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: () => userService.listUsers(),
	});

	const users = data?.data || [];

	const columns: ColumnsType<UserInfo> = [
		{
			title: "Name",
			dataIndex: "name",
			width: 300,
			render: (_, record) => {
				return (
					<div className="flex">
						{record.avatarUrl ? (
							<img alt="" src={record.avatarUrl} className="h-10 w-10 rounded-full" />
						) : (
							<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
								<span className="text-sm font-medium">
									{record.firstName[0]}
									{record.lastName[0]}
								</span>
							</div>
						)}
						<div className="ml-2 flex flex-col">
							<span className="text-sm font-medium">
								{record.firstName} {record.lastName}
							</span>
							<span className="text-xs text-text-secondary">{record.email}</span>
						</div>
					</div>
				);
			},
		},
		{
			title: "Roles",
			dataIndex: "roles",
			align: "center",
			width: 150,
			render: (roles?: UserInfo["roles"]) => (
				<div className="flex flex-wrap gap-1 justify-center">
					{roles?.map((userRole) => (
						<Badge key={userRole.role.id} variant="info">
							{userRole.role.name}
						</Badge>
					))}
				</div>
			),
		},
		{
			title: "Status",
			dataIndex: "isActive",
			align: "center",
			width: 120,
			render: (isActive: boolean) => (
				<Badge variant={!isActive ? "error" : "success"}>{!isActive ? "Inactive" : "Active"}</Badge>
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
						<Icon icon="mdi:card-account-details" size={18} />
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
					<div>User List</div>
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
					dataSource={users}
					loading={isLoading}
				/>
			</CardContent>
		</Card>
	);
}
