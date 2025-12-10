import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import userService, { type SignInReq } from "@/api/services/userService";

import { toast } from "sonner";
import type { UserInfo, UserToken } from "#/entity";
import { StorageEnum } from "#/enum";

type UserStore = {
	userInfo: Partial<UserInfo>;
	userToken: UserToken;

	actions: {
		setUserInfo: (userInfo: UserInfo) => void;
		setUserToken: (token: UserToken) => void;
		clearUserInfoAndToken: () => void;
	};
};

const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			userInfo: {},
			userToken: {},
			actions: {
				setUserInfo: (userInfo) => {
					set({ userInfo });
				},
				setUserToken: (userToken) => {
					set({ userToken });
				},
				clearUserInfoAndToken() {
					set({ userInfo: {}, userToken: {} });
				},
			},
		}),
		{
			name: "userStore", // name of the item in the storage (must be unique)
			storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
			partialize: (state) => ({
				[StorageEnum.UserInfo]: state.userInfo,
				[StorageEnum.UserToken]: state.userToken,
			}),
		}
	)
);

export const useUserInfo = () => useUserStore((state) => state.userInfo);
export const useUserToken = () => useUserStore((state) => state.userToken);
export const useUserPermissions = () => useUserStore((state) => state.userInfo.permissions || []);
export const useUserRoles = () => useUserStore((state) => state.userInfo.roles?.map((r) => r.role.name) || []);
export const useUserActions = () => useUserStore((state) => state.actions);

// Role checking utilities
export const useIsAdmin = () => {
	const roles = useUserRoles();
	return roles.includes("admin");
};

export const useIsTeacher = () => {
	const roles = useUserRoles();
	return roles.includes("teacher");
};

export const useIsStudent = () => {
	const roles = useUserRoles();
	return roles.includes("student");
};

export const useHasManagementAccess = () => {
	const roles = useUserRoles();
	return roles.includes("admin") || roles.includes("teacher");
};

export const useSignIn = () => {
	const { setUserToken, setUserInfo } = useUserActions();

	const signInMutation = useMutation({
		mutationFn: userService.signin,
	});

	const signIn = async (data: SignInReq) => {
		try {
			const res = await signInMutation.mutateAsync(data);
			const { user, tokens } = res?.data || {};
			if (!user || !tokens) throw new Error("Invalid response");
			setUserToken({
				accessToken: tokens.access.token,
				refreshToken: tokens.refresh.token,
			});
			setUserInfo(user);
		} catch (err: any) {
			toast.error(err.message || "Failed to sign in", {
				position: "top-center",
			});
			throw err;
		}
	};

	return signIn;
};

export default useUserStore;
