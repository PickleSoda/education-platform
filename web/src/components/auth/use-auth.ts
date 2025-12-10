import { useUserInfo, useUserToken } from "@/store/userStore";

/**
 * permission/role check hook
 * @param baseOn - check type: 'role', 'permission', or 'auto' (auto detects role:xxx prefix)
 *
 * @example
 * // permission check
 * const { check, checkAny, checkAll } = useAuthCheck('permission');
 * check('user.create')
 * checkAny(['user.create', 'user.edit'])
 * checkAll(['user.create', 'user.edit'])
 *
 * @example
 * // role check
 * const { check, checkAny, checkAll } = useAuthCheck('role');
 * check('admin')
 * checkAny(['admin', 'editor'])
 * checkAll(['admin', 'editor'])
 *
 * @example
 * // auto mode - supports role:xxx prefix pattern
 * const { check, checkAny, checkAll } = useAuthCheck('auto');
 * checkAny(['role:admin', 'role:teacher', 'permission:read'])
 */
export const useAuthCheck = (baseOn: "role" | "permission" | "auto" = "permission") => {
	const { accessToken } = useUserToken();
	const { permissions = [], roles = [] } = useUserInfo();

	// Get role names from role objects
	const roleNames = roles.map((r: any) => r.role?.name || r.name).filter(Boolean);

	// Check a single item
	const check = (item: string): boolean => {
		// if user is not logged in, return false
		if (!accessToken) {
			return false;
		}

		// Auto mode: detect role:xxx prefix
		if (baseOn === "auto") {
			if (item.startsWith("role:")) {
				const roleName = item.substring(5); // Remove "role:" prefix
				return roleNames.includes(roleName);
			}
			// Otherwise treat as permission
			return (permissions as string[]).includes(item);
		}

		// Legacy mode: check based on baseOn parameter
		if (baseOn === "role") {
			return roleNames.includes(item);
		}

		// Permission check
		return (permissions as string[]).includes(item);
	};

	// check if any item exists
	const checkAny = (items: string[]) => {
		if (items.length === 0) {
			return true;
		}
		return items.some((item) => check(item));
	};

	// check if all items exist
	const checkAll = (items: string[]) => {
		if (items.length === 0) {
			return true;
		}
		return items.every((item) => check(item));
	};

	return { check, checkAny, checkAll };
};
