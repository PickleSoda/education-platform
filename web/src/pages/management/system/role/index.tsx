import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Input } from "@/ui/input";
import Table, { type ColumnsType } from "antd/es/table";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import type { Role } from "@/api/services/roleService";
import { RoleModal, type RoleModalProps, type RoleFormData } from "./role-modal";
import roleService from "@/api/services/roleService";

export default function RolePage() {
	const queryClient = useQueryClient();

	// Search state
	const [searchTerm, setSearchTerm] = useState("");

	const { data, isLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: () => roleService.getRoles(),
	});

	// Filter roles based on search term
	const filteredRoles = useMemo(() => {
		if (!data?.data || !searchTerm.trim()) return data?.data || [];

		return data.data.filter(
			(role) =>
				role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
		);
	}, [data?.data, searchTerm]);

	const createRoleMutation = useMutation({
		mutationFn: (data: RoleFormData) => roleService.createRole(data),
		onSuccess: () => {
			message.success("Role created successfully");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: (error: any) => {
			message.error(error.response?.data?.message || "Failed to create role");
		},
	});

	const updateRoleMutation = useMutation({
		mutationFn: ({ id, data }: { id: number; data: RoleFormData }) => roleService.updateRole(id, data),
		onSuccess: () => {
			message.success("Role updated successfully");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
			setRoleModalProps((prev) => ({ ...prev, show: false }));
		},
		onError: (error: any) => {
			message.error(error.response?.data?.message || "Failed to update role");
		},
	});

	const deleteRoleMutation = useMutation({
		mutationFn: (id: number) => roleService.deleteRole(id),
		onSuccess: () => {
			message.success("Role deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["roles"] });
		},
		onError: (error: any) => {
			message.error(error.response?.data?.message || "Failed to delete role");
		},
	});

	const [roleModalProps, setRoleModalProps] = useState<RoleModalProps>({
		formValue: null,
		title: "New",
		show: false,
		onOk: (data: RoleFormData) => {
			if (roleModalProps.formValue) {
				// Update existing role
				updateRoleMutation.mutate({ id: roleModalProps.formValue.id, data });
			} else {
				// Create new role
				createRoleMutation.mutate(data);
			}
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
			title: "Users",
			dataIndex: ["_count", "users"],
			width: 100,
			render: (count) => count || 0,
		},
		{
			title: "Action",
			key: "operation",
			align: "center",
			width: 100,
			render: (_, record) => {
				const protectedRoles = ["student", "teacher", "admin"];
				const isProtected = protectedRoles.includes(record.name.toLowerCase());
				const hasUsers = record._count?.users > 0;

				return (
					<div className="flex w-full justify-center text-gray">
						<Button variant="ghost" size="icon" onClick={() => onEdit(record)}>
							<Icon icon="solar:pen-bold-duotone" size={18} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(record)}
							disabled={isProtected || hasUsers}
							title={
								isProtected
									? "Cannot delete core system roles"
									: hasUsers
										? `Cannot delete: ${record._count?.users} users assigned`
										: "Delete role"
							}
						>
							<Icon
								icon="mingcute:delete-2-fill"
								size={18}
								className={isProtected || hasUsers ? "text-muted!" : "text-error!"}
							/>
						</Button>
					</div>
				);
			},
		},
	];

	const onCreate = () => {
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			title: "Create New Role",
			formValue: null,
		}));
	};

	const onEdit = (formValue: Role) => {
		setRoleModalProps((prev) => ({
			...prev,
			show: true,
			title: "Edit Role",
			formValue,
		}));
	};

	const onDelete = (role: Role) => {
		// Protect core system roles from deletion
		const protectedRoles = ["student", "teacher", "admin"];
		if (protectedRoles.includes(role.name.toLowerCase())) {
			message.warning(`Cannot delete protected role '${role.name}'. This is a core system role.`);
			return;
		}

		if (role._count?.users && role._count.users > 0) {
			message.warning(`Cannot delete role '${role.name}' because ${role._count.users} users are assigned to it.`);
			return;
		}

		if (window.confirm(`Are you sure you want to delete the role '${role.name}'? This action cannot be undone.`)) {
			deleteRoleMutation.mutate(role.id);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>Role List</div>
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-2">
							<Icon icon="solar:magnifer-linear" size={16} className="text-text-secondary" />
							<Input
								placeholder="Search roles..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-64"
							/>
						</div>
						<Button onClick={onCreate}>New</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={{
						showSizeChanger: true,
						showQuickJumper: true,
						showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
						pageSize: 10,
						pageSizeOptions: ["10", "20", "50", "100"],
					}}
					columns={columns}
					dataSource={filteredRoles}
					loading={isLoading}
				/>
			</CardContent>
			<RoleModal {...roleModalProps} />
		</Card>
	);
}
