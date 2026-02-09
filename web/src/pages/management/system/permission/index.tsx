import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import Table, { type ColumnsType } from "antd/es/table";
import { useState } from "react";
import { PERMISSION_GROUPS } from "@/config/permissions";

// Create a flattened list of permissions with group information
const getPermissionsData = () => {
	const permissionsData: Array<{
		id: string;
		name: string;
		group: string;
		description: string;
	}> = [];

	PERMISSION_GROUPS.forEach((group) => {
		group.permissions.forEach((permission, index) => {
			permissionsData.push({
				id: `${group.label}-${index}`,
				name: permission,
				group: group.label,
				description: getPermissionDescription(permission),
			});
		});
	});

	return permissionsData;
};

const getPermissionDescription = (permission: string): string => {
	const descriptions: Record<string, string> = {
		// Profile & Users
		viewProfile: "View user profile information",
		updateProfile: "Update user profile information",
		manageUsers: "Create, update, and delete user accounts",
		manageRoles: "Manage system roles and permissions",
		viewAllUsers: "View all users in the system",

		// Courses
		viewCourses: "View available courses",
		createCourse: "Create new courses",
		updateOwnCourse: "Update courses you created",
		deleteOwnCourse: "Delete courses you created",
		updateAnyCourse: "Update any course in the system",
		deleteAnyCourse: "Delete any course in the system",
		viewAllCourses: "View all courses in the system",
		manageCourseContent: "Manage course content and materials",
		viewCourseAnalytics: "View course statistics and analytics",

		// Enrollments
		enrollCourse: "Enroll in courses",
		viewEnrollments: "View course enrollment information",

		// Assignments
		viewAssignments: "View assignment information",
		createAssignment: "Create new assignments",
		updateAssignment: "Update existing assignments",
		deleteAssignment: "Delete assignments",
		submitAssignment: "Submit assignment solutions",
		viewSubmissions: "View assignment submissions",
		viewOwnSubmissions: "View own assignment submissions",
		gradeSubmissions: "Grade student submissions",

		// Forum
		viewForum: "View forum discussions",
		createForumPost: "Create forum posts",
		updateOwnForumPost: "Update own forum posts",
		deleteOwnForumPost: "Delete own forum posts",
		createForumComment: "Create forum comments",
		manageForum: "Full forum moderation capabilities",

		// Announcements
		viewAnnouncements: "View course announcements",
		createAnnouncement: "Create announcements",
		updateAnnouncement: "Update announcements",
		deleteAnnouncement: "Delete announcements",

		// Grades
		viewGrades: "View assignment grades",

		// Notifications
		viewNotifications: "View system notifications",

		// System Admin
		viewSystemAnalytics: "View system-wide analytics and reports",
		viewAuditLogs: "View system audit logs",
		manageSystemSettings: "Manage global system settings",
	};

	return descriptions[permission] || "System permission";
};

export default function PermissionPage() {
	const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

	const permissionsData = getPermissionsData();
	const filteredData = selectedGroup ? permissionsData.filter((p) => p.group === selectedGroup) : permissionsData;

	const columns: ColumnsType<(typeof permissionsData)[0]> = [
		{
			title: "Permission",
			dataIndex: "name",
			width: 300,
			render: (name: string) => <code className="text-sm bg-muted px-2 py-1 rounded">{name}</code>,
		},
		{
			title: "Group",
			dataIndex: "group",
			width: 150,
			render: (group: string) => <Badge variant="outline">{group}</Badge>,
		},
		{
			title: "Description",
			dataIndex: "description",
			render: (description: string) => <span className="text-muted-foreground">{description}</span>,
		},
	];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<div className="text-lg font-medium">System Permissions</div>
						<div className="text-sm text-muted-foreground">
							Read-only view of all permissions configured in the system
						</div>
					</div>
				</div>

				{/* Group filter buttons */}
				<div className="flex flex-wrap gap-2 mt-4">
					<Button
						variant={selectedGroup === null ? "default" : "outline"}
						size="sm"
						onClick={() => setSelectedGroup(null)}
					>
						All ({permissionsData.length})
					</Button>
					{PERMISSION_GROUPS.map((group) => (
						<Button
							key={group.label}
							variant={selectedGroup === group.label ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedGroup(group.label)}
						>
							{group.label} ({group.permissions.length})
						</Button>
					))}
				</div>
			</CardHeader>
			<CardContent>
				<Table
					rowKey="id"
					size="small"
					scroll={{ x: "max-content" }}
					pagination={{
						pageSize: 20,
						showSizeChanger: true,
						showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} permissions`,
					}}
					columns={columns}
					dataSource={filteredData}
				/>
			</CardContent>
		</Card>
	);
}
