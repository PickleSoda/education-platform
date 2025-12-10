import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/ui/hover-card";
import { useLocation } from "react-router";
import type { NavListProps } from "../types";
import { NavItem } from "./nav-item";
import { useUserPermissions, useUserRoles } from "@/store/userStore";
import { checkAny } from "@/utils";

export function NavList({ data, depth = 0 }: NavListProps) {
	const hasChild = data.children && data.children.length > 0;
	const location = useLocation();
	const isActive = location.pathname.includes(data.path);

	// Auth guard check
	const permissions = useUserPermissions();
	const roles = useUserRoles();
	const allPermissions = [...permissions, ...roles.map((role) => `role:${role}`)];
	const hasAuth = data.auth ? checkAny(data.auth, allPermissions) : true;

	if (data.hidden || !hasAuth) {
		return null;
	}

	const renderNavItem = () => {
		return (
			<NavItem
				key={data.title}
				// data
				path={data.path}
				title={data.title}
				caption={data.caption}
				info={data.info}
				icon={data.icon}
				auth={data.auth}
				// state
				disabled={data.disabled}
				active={isActive}
				// options
				hasChild={hasChild}
				depth={depth}
			/>
		);
	};

	const renderRootItemWithHoverCard = () => {
		return (
			<HoverCard openDelay={100}>
				<HoverCardTrigger>{renderNavItem()}</HoverCardTrigger>
				<HoverCardContent side={depth === 1 ? "bottom" : "right"} sideOffset={10} className="p-1">
					{data.children?.map((child) => (
						<NavList key={child.title} data={child} depth={depth + 1} />
					))}
				</HoverCardContent>
			</HoverCard>
		);
	};

	return <li className="list-none">{hasChild ? renderRootItemWithHoverCard() : renderNavItem()}</li>;
}
