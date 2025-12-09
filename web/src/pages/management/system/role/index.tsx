import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import Table, { type ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Role_Old } from "#/entity";
import { BasicStatus } from "#/enum";
import { RoleModal, type RoleModalProps } from "./role-modal";
import roleService, { type Role } from "@/api/services/roleService";

const DEFAULE_ROLE_VALUE: Role_Old = {
	id: "",
	name: "",
	code: "",
	status: BasicStatus.ENABLE,
	permission: [],
};

export default function RolePage() {
	const { data, isLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: () => roleService.getRoles(),
	});

	const roles = data?.data || [];

	const [roleModalPros, setRoleModalProps] = useState<RoleModalProps>({
		formValue: { ...DEFAULE_ROLE_VALUE },
		title: "New",
		show: false,
		onOk: () => {
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
		onCancel: () => {
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
	});

	const columns: ColumnsType<Role> = [
		{
			title: "ID",
			dataIndex: "id",
			width: 80,
		},
		{
			title: "Name",
			dataIndex: "name",
			width: 200,
			render: (name) => <span className="font-medium capitalize">{name}</span>,
		},
		{
			title: "Description",
			dataIndex: "description",
			render: (description) => description || <span className="text-text-secondary">No description</span>,
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => (
				<div className="flex w-full justify-center text-gray">
					<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
						<Icon icon="solar:pen-bold-duotone" size={18} />
					</Button>
					<Button variant="ghost" size="icon">
						<Icon icon="mingcute:delete-2-fill" size={18} className="text-error!" />
					</Button>
				</div>
			),
		},
	];

	const onCreate = () => {
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			title: "Create New",
			formValue: {
				...prev.formValue,
				...DEFAULE_ROLE_VALUE,
			},
		}));
	};

	const onEdit = (formValue: Role) => {
		// Convert Role to Role_Old format for the modal
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit",
			formValue: {
				id: String(formValue.id),
				name: formValue.name,
				code: formValue.name,
				status: BasicStatus.ENABLE,
				permission: [],
			},
		}));
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>Role List</div>
					<Button onClick={onCreate}>New</Button>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={false}
					columns={columns}
					dataSource={roles}
					loading={isLoading}
				/>
			</CardContent>
			<RoleModal {...roleModalPros} />
		</Card>
	);
}
