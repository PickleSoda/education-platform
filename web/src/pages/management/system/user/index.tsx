import { Icon } from "@/components/icon";
import { usePathname, useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import type { UserInfo } from "#/entity";
import userService, { type ListUsersParams } from "@/api/services/userService";
import EditUserModal from "./components/edit-user-modal";
import ManageRolesModal from "./components/manage-roles-modal";

export default function UserPage() {
	const { push } = useRouter();
	const pathname = usePathname();
	const [searchParams, setSearchParams] = useSearchParams();
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [rolesModalOpen, setRolesModalOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
	
	// Search and filter state
	const [search, setSearch] = useState("");
	const [filterRole, setFilterRole] = useState<string>("all");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	// Initialize filters from URL params
	useEffect(() => {
		const searchParam = searchParams.get("search") || "";
		const roleParam = searchParams.get("role") || "all";
		const statusParam = searchParams.get("status") || "all";
		const pageParam = searchParams.get("page") || "1";
		const limitParam = searchParams.get("limit") || "10";
		
		setSearch(searchParam);
		setFilterRole(roleParam);
		setFilterStatus(statusParam);
		setCurrentPage(parseInt(pageParam));
		setPageSize(parseInt(limitParam));
	}, [searchParams]);

	// Update URL when filters change
	useEffect(() => {
		const params = new URLSearchParams();
		if (search) params.set("search", search);
		if (filterRole !== "all") params.set("role", filterRole);
		if (filterStatus !== "all") params.set("status", filterStatus);
		if (currentPage > 1) params.set("page", currentPage.toString());
		if (pageSize !== 10) params.set("limit", pageSize.toString());
		
		setSearchParams(params);
	}, [search, filterRole, filterStatus, currentPage, pageSize, setSearchParams]);

	// Prepare query parameters
	const queryParams: ListUsersParams = {
		page: currentPage.toString(),
		limit: pageSize.toString(),
		search: search || undefined,
		role: filterRole !== "all" ? filterRole : undefined,
		isActive: filterStatus !== "all" ? filterStatus : undefined,
		sortBy: "createdAt",
		sortOrder: "desc",
	};

	const { data, isLoading } = useQuery({
		queryKey: ["users", queryParams],
		queryFn: () => userService.listUsers(queryParams),
		refetchOnMount: "always",
		staleTime: 0,
	});

	const users = data?.data || [];
	const totalUsers = data?.meta?.total || 0;
	const totalPages = data?.meta?.totalPages || 0;

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
					<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold">User Management</h2>
							<p className="text-sm text-text-secondary">Manage users and their roles</p>
						</div>
						<Button onClick={() => {}}>New User</Button>
					</div>
					<div className="flex flex-col md:flex-row gap-3 mt-4">
						<Input
							placeholder="Search users by name or email..."
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1); // Reset to first page when searching
							}}
							className="md:w-80"
						/>
						<Select
							value={filterRole}
							onValueChange={(value) => {
								setFilterRole(value);
								setCurrentPage(1);
							}}
						>
							<SelectTrigger className="md:w-40">
								<SelectValue placeholder="Filter by role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Roles</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
								<SelectItem value="teacher">Teacher</SelectItem>
								<SelectItem value="student">Student</SelectItem>
							</SelectContent>
						</Select>
						<Select
							value={filterStatus}
							onValueChange={(value) => {
								setFilterStatus(value);
								setCurrentPage(1);
							}}
						>
							<SelectTrigger className="md:w-40">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="true">Active</SelectItem>
								<SelectItem value="false">Inactive</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					<Table
						rowKey="id"
						size="small"
						scroll={{ x: "max-content" }}
						pagination={{
							current: currentPage,
							pageSize: pageSize,
							total: totalUsers,
							showSizeChanger: true,
							showQuickJumper: true,
							showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
							onChange: (page, size) => {
								setCurrentPage(page);
								if (size !== pageSize) {
									setPageSize(size);
									setCurrentPage(1); // Reset to first page when changing page size
								}
							},
						}}
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
