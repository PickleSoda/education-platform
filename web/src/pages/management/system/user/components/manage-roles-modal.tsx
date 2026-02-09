import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Badge } from "@/ui/badge";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import type { UserInfo } from "#/entity";
import userService from "@/api/services/userService";
import roleService from "@/api/services/roleService";

interface ManageRolesModalProps {
	open: boolean;
	onClose: () => void;
	user: UserInfo | null;
}

export default function ManageRolesModal({ open, onClose, user }: ManageRolesModalProps) {
	const queryClient = useQueryClient();
	const [userRoles, setUserRoles] = useState<string[]>([]);

	// Fetch all available roles from API
	const { data: rolesData, isLoading: rolesLoading } = useQuery({
		queryKey: ["roles"],
		queryFn: () => roleService.getRoles(),
		enabled: open, // Only fetch when modal is open
	});

	const availableRoles = rolesData?.data || [];

	useEffect(() => {
		if (user) {
			const roles = user.roles?.map((r) => r.role.name.toLowerCase()) || [];
			setUserRoles(roles);
		}
	}, [user]);

	const addRoleMutation = useMutation({
		mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => {
			return userService.addRole(userId, { roleName });
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setUserRoles((prev) => [...prev, variables.roleName]);
			toast.success(`Role '${variables.roleName}' added successfully`);
		},
		onError: (error: any, variables) => {
			toast.error(error?.message || `Failed to add role '${variables.roleName}'`);
		},
	});

	const removeRoleMutation = useMutation({
		mutationFn: ({ userId, roleName }: { userId: string; roleName: string }) => {
			return userService.removeRole(userId, roleName);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			setUserRoles((prev) => prev.filter((r) => r !== variables.roleName));
			toast.success(`Role '${variables.roleName}' removed successfully`);
		},
		onError: (error: any, variables) => {
			toast.error(error?.message || `Failed to remove role '${variables.roleName}'`);
		},
	});

	const handleToggleRole = (roleName: string) => {
		if (!user) return;

		const hasRole = userRoles.includes(roleName.toLowerCase());
		if (hasRole) {
			removeRoleMutation.mutate({ userId: user.id, roleName });
		} else {
			addRoleMutation.mutate({ userId: user.id, roleName });
		}
	};

	const isLoading = addRoleMutation.isPending || removeRoleMutation.isPending || rolesLoading;

	const getRoleIcon = (roleName: string) => {
		switch (roleName.toLowerCase()) {
			case "admin":
				return "mdi:shield-crown";
			case "teacher":
				return "mdi:school";
			case "student":
				return "mdi:account-school";
			default:
				return "mdi:account";
		}
	};

	const getRoleDescription = (roleName: string) => {
		switch (roleName.toLowerCase()) {
			case "admin":
				return "Full system access and management";
			case "teacher":
				return "Can create courses and manage content";
			case "student":
				return "Can enroll in courses and submit assignments";
			default:
				return "Custom role with specific permissions";
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Manage User Roles</DialogTitle>
					<DialogDescription>
						Add or remove roles for {user?.firstName} {user?.lastName}. Changes are applied immediately.
					</DialogDescription>
				</DialogHeader>
				<div className="py-6">
					{rolesLoading ? (
						<div className="flex justify-center py-4">
							<div className="text-muted-foreground">Loading roles...</div>
						</div>
					) : (
						<div className="space-y-3">
							{availableRoles.map((role) => {
								const hasRole = userRoles.includes(role.name.toLowerCase());
								return (
									<div
										key={role.id}
										className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
									>
										<div className="flex items-center gap-3">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center ${
													hasRole ? "bg-primary/10" : "bg-muted"
												}`}
											>
												<Icon
													icon={getRoleIcon(role.name)}
													size={20}
													className={hasRole ? "text-primary" : "text-muted-foreground"}
												/>
											</div>
											<div>
												<div className="font-medium capitalize">{role.name}</div>
												<div className="text-xs text-muted-foreground">
													{role.description || getRoleDescription(role.name)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{hasRole && <Badge variant="success">Active</Badge>}
											<Button
												size="sm"
												variant={hasRole ? "destructive" : "default"}
												onClick={() => handleToggleRole(role.name)}
												disabled={isLoading}
											>
												{hasRole ? "Remove" : "Add"}
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
