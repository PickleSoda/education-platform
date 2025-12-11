import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { UserInfo } from "#/entity";
import userService from "@/api/services/userService";
import EditUserModal from "./components/edit-user-modal";
import ManageRolesModal from "./components/manage-roles-modal";

export default function UserPage() {
	const { push } = useRouter();
	const pathname = usePathname();
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [rolesModalOpen, setRolesModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

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
						title="View Details"
					>
						<Icon icon="mdi:card-account-details" size={18} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							setSelectedUser(record);
							setEditModalOpen(true);
						}}
						title="Edit User"
					>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => {
							setSelectedUser(record);
							setRolesModalOpen(true);
						}}
						title="Manage Roles"
					>
						<Icon icon="mdi:shield-account" size={18} className="text-primary!" />
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

			<EditUserModal open={editModalOpen} onClose={() => setEditModalOpen(false)} user={selectedUser} />

			<ManageRolesModal open={rolesModalOpen} onClose={() => setRolesModalOpen(false)} user={selectedUser} />
		</>
	);
}
