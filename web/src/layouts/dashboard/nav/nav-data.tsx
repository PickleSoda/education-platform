import { Icon } from "@/components/icon";
import type { NavProps } from "@/components/nav";
import { Badge } from "@/ui/badge";
import type { NavItemDataProps } from "@/components/nav/types";
import { useUserPermissions, useUserRoles } from "@/store/userStore";
import { checkAny } from "@/utils";
import { useMemo } from "react";

/**
 *Recursively process navigation data, filtering out items without permissions
 * @param items Navigation items array
 * @param permissions Permissions list (includes both permissions and role:xxx format)
 * @returns Filtered navigation items array
 */
const filterItems = (items: NavItemDataProps[], permissions: string[]) => {
	return items.filter((item) => {
		// Check if the current item has permission
		const hasPermission = item.auth ? checkAny(item.auth, permissions) : true;

		// If there are child items, process them recursively
		if (item.children?.length) {
			const filteredChildren = filterItems(item.children, permissions);
			// If all child items are filtered out, filter out the current item
			if (filteredChildren.length === 0) {
				return false;
			}
			// Update child items
			item.children = filteredChildren;
		}

		return hasPermission;
	});
};

/**
 *
 * Filter navigation data based on permissions
 * @param permissions Permissions list
 * @returns Filtered navigation data
 */
const filterNavData = (permissions: string[]) => {
	return navData
		.map((group) => {
			// Filter items within the group
			const filteredItems = filterItems(group.items, permissions);

			// If there are no items in the group, return null
			if (filteredItems.length === 0) {
				return null;
			}

			// Return the filtered group
			return {
				...group,
				items: filteredItems,
			};
		})
		.filter((group): group is NonNullable<typeof group> => group !== null); // Filter out empty groups
};

/**
 * Hook to get filtered navigation data based on user permissions and roles
 * @returns Filtered navigation data
 */
export const useFilteredNavData = () => {
	const permissions = useUserPermissions();
	const roles = useUserRoles();
	// Combine permissions with role-based permissions (role:xxx format)
	const allPermissions = useMemo(() => [...permissions, ...roles.map((role) => `role:${role}`)], [permissions, roles]);
	const filteredNavData = useMemo(() => filterNavData(allPermissions), [allPermissions]);
	return filteredNavData;
};

export const navData: NavProps["data"] = [
	{
		name: "sys.nav.dashboard",
		items: [
			{
				title: "sys.nav.dashboard",
				path: "/dashboard",
				icon: <Icon icon="local:ic-workbench" size="24" />,
			},
			{
				title: "sys.nav.courses",
				path: "/courses",
				icon: <Icon icon="mdi:book-education" size="24" />,
			},
			{
				title: "sys.nav.myCourses",
				path: "/my-courses",
				icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
			},
			{
				title: "sys.nav.analysis",
				path: "/analysis",
				icon: <Icon icon="local:ic-analysis" size="24" />,
			},
		],
	},
	{
		name: "sys.nav.pages",
		items: [
			// management - only visible to admin and teacher roles
			{
				title: "sys.nav.management",
				path: "/management",
				icon: <Icon icon="local:ic-management" size="24" />,
				auth: ["role:admin", "role:teacher"],
				children: [
					{
						title: "sys.nav.manageCourses",
						path: "/management/course",
						icon: <Icon icon="mdi:book-education" size="24" />,
						auth: ["role:admin", "role:teacher"],
					},
					{
						title: "sys.nav.instances",
						path: "/management/instance",
						icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
						auth: ["role:admin", "role:teacher"],
					},
					{
						title: "sys.nav.assignments",
						path: "/management/assignment",
						icon: <Icon icon="solar:document-text-bold-duotone" size="24" />,
						auth: ["role:admin", "role:teacher"],
					},
					{
						title: "sys.nav.system.index",
						path: "/management/system",
						icon: <Icon icon="mdi:cog-outline" size="24" />,
						auth: ["role:admin"],
						children: [
							{
								title: "sys.nav.system.permission",
								path: "/management/system/permission",
								icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
								auth: ["role:admin"],
							},
							{
								title: "sys.nav.system.role",
								path: "/management/system/role",
								icon: <Icon icon="mdi:account-key-outline" size="24" />,
								auth: ["role:admin"],
							},
							{
								title: "sys.nav.system.user",
								path: "/management/system/user",
								icon: <Icon icon="mdi:account-multiple-outline" size="24" />,
								auth: ["role:admin"],
							},
						],
					},
				],
			},
		],
	},
	{
		name: "sys.nav.ui",
		defaultOpen: false,
		items: [
			// components
			{
				title: "sys.nav.components",
				path: "/components",
				icon: <Icon icon="solar:widget-5-bold-duotone" size="24" />,
				caption: "sys.nav.custom_ui_components",
				children: [
					{
						title: "sys.nav.icon",
						path: "/components/icon",
					},
					{
						title: "sys.nav.animate",
						path: "/components/animate",
					},
					{
						title: "sys.nav.scroll",
						path: "/components/scroll",
					},
					{
						title: "sys.nav.i18n",
						path: "/components/multi-language",
					},
					{
						title: "sys.nav.upload",
						path: "/components/upload",
					},
					{
						title: "sys.nav.chart",
						path: "/components/chart",
					},
					{
						title: "sys.nav.toast",
						path: "/components/toast",
					},

					{
						title: "sys.nav.clipboard",
						path: "/functions/clipboard",
					},
					{
						title: "sys.nav.token_expired",
						path: "/functions/token_expired",
					},
				],
			},
		],
	},
	{
		name: "sys.nav.others",
		defaultOpen: false,
		items: [
			{
				title: "sys.nav.permission",
				path: "/permission",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
			},
			{
				title: "sys.nav.permission.page_test",
				path: "/permission/page-test",
				icon: <Icon icon="mingcute:safe-lock-fill" size="24" />,
				auth: ["permission:read"],
				hidden: true,
			},
			{
				title: "sys.nav.calendar",
				path: "/calendar",
				icon: <Icon icon="solar:calendar-bold-duotone" size="24" />,
				info: <Badge variant="warning">+12</Badge>,
			},
			{
				title: "sys.nav.kanban",
				path: "/kanban",
				icon: <Icon icon="solar:clipboard-bold-duotone" size="24" />,
			},
			{
				title: "sys.nav.disabled",
				path: "/disabled",
				icon: <Icon icon="local:ic-disabled" size="24" />,
				disabled: true,
			},
			{
				title: "sys.nav.label",
				path: "#label",
				icon: <Icon icon="local:ic-label" size="24" />,
				info: (
					<Badge variant="info">
						<Icon icon="solar:bell-bing-bold-duotone" size={14} />
						New
					</Badge>
				),
			},
			{
				title: "sys.nav.link",
				path: "/link",
				icon: <Icon icon="local:ic-external" size="24" />,
				children: [
					{
						title: "sys.nav.external_link",
						path: "/link/external-link",
					},
					{
						title: "sys.nav.iframe",
						path: "/link/iframe",
					},
				],
			},
			{
				title: "sys.nav.blank",
				path: "/blank",
				icon: <Icon icon="local:ic-blank" size="24" />,
			},
			// menulevel
			{
				title: "sys.nav.menulevel.index",
				path: "/menu_level",
				icon: <Icon icon="local:ic-menulevel" size="24" />,
				children: [
					{
						title: "sys.nav.menulevel.1a",
						path: "/menu_level/1a",
					},
					{
						title: "sys.nav.menulevel.1b.index",
						path: "/menu_level/1b",
						children: [
							{
								title: "sys.nav.menulevel.1b.2a",
								path: "/menu_level/1b/2a",
							},
							{
								title: "sys.nav.menulevel.1b.2b.index",
								path: "/menu_level/1b/2b",
								children: [
									{
										title: "sys.nav.menulevel.1b.2b.3a",
										path: "/menu_level/1b/2b/3a",
									},
									{
										title: "sys.nav.menulevel.1b.2b.3b",
										path: "/menu_level/1b/2b/3b",
									},
								],
							},
						],
					},
				],
			},
			// errors
			{
				title: "sys.nav.error.index",
				path: "/error",
				icon: <Icon icon="bxs:error-alt" size="24" />,
				children: [
					{
						title: "sys.nav.error.403",
						path: "/error/403",
					},
					{
						title: "sys.nav.error.404",
						path: "/error/404",
					},
					{
						title: "sys.nav.error.500",
						path: "/error/500",
					},
				],
			},
		],
	},
];
