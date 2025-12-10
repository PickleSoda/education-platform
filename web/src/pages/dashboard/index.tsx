import { Spin } from "antd";
import { useUserRoles } from "@/store/userStore";
import StudentDashboard from "./student";
import TeacherDashboard from "./teacher";

export default function Dashboard() {
	const roles = useUserRoles();

	// Role-based rendering
	if (roles.includes("student")) {
		return <StudentDashboard />;
	}

	if (roles.includes("teacher") || roles.includes("admin")) {
		return <TeacherDashboard />;
	}

	// Loading state while determining role
	return (
		<div className="flex h-96 items-center justify-center">
			<Spin size="large" />
		</div>
	);
}
