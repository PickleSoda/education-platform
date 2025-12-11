import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Badge } from "@/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import type { UserInfo } from "#/entity";
import userService from "@/api/services/userService";

interface ManageRolesModalProps {
	open: boolean;
	onClose: () => void;
	user: UserInfo | null;
}

const AVAILABLE_ROLES = ["admin", "teacher", "student"] as const;

export default function ManageRolesModal({ open, onClose, user }: ManageRolesModalProps) {
	const queryClient = useQueryClient();
	const [userRoles, setUserRoles] = useState<string[]>([]);

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

	const isLoading = addRoleMutation.isPending || removeRoleMutation.isPending;

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
					<div className="space-y-3">
						{AVAILABLE_ROLES.map((role) => {
							const hasRole = userRoles.includes(role.toLowerCase());
							return (
								<div
									key={role}
									className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center ${
												hasRole ? "bg-primary/10" : "bg-muted"
											}`}
										>
											<Icon
												icon={
													role === "admin"
														? "mdi:shield-crown"
														: role === "teacher"
															? "mdi:school"
															: "mdi:account-school"
												}
												size={20}
												className={hasRole ? "text-primary" : "text-muted-foreground"}
											/>
										</div>
										<div>
											<div className="font-medium capitalize">{role}</div>
											<div className="text-xs text-muted-foreground">
												{role === "admin"
													? "Full system access and management"
													: role === "teacher"
														? "Can create courses and manage content"
														: "Can enroll in courses and submit assignments"}
											</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{hasRole && <Badge variant="success">Active</Badge>}
										<Button
											size="sm"
											variant={hasRole ? "destructive" : "default"}
											onClick={() => handleToggleRole(role)}
											disabled={isLoading}
										>
											{hasRole ? "Remove" : "Add"}
										</Button>
									</div>
								</div>
							);
						})}
					</div>
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
