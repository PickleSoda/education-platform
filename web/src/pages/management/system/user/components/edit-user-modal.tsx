import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { UserInfo } from "#/entity";
import userService, { type UpdateUserReq } from "@/api/services/userService";

interface EditUserModalProps {
	open: boolean;
	onClose: () => void;
	user: UserInfo | null;
}

export default function EditUserModal({ open, onClose, user }: EditUserModalProps) {
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState<UpdateUserReq>({
		firstName: "",
		lastName: "",
		email: "",
		avatarUrl: "",
		isActive: true,
	});

	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				avatarUrl: user.avatarUrl || "",
				isActive: user.isActive ?? true,
			});
		}
	}, [user]);

	const updateMutation = useMutation({
		mutationFn: (data: UpdateUserReq) => {
			if (!user) throw new Error("User not found");
			return userService.updateUser(user.id, data);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User updated successfully");
			onClose();
		},
		onError: (error: any) => {
			toast.error(error?.message || "Failed to update user");
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateMutation.mutate(formData);
	};

	const handleInputChange = (field: keyof UpdateUserReq, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>Update user information. Changes will be saved immediately.</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input
								id="firstName"
								value={formData.firstName}
								onChange={(e) => handleInputChange("firstName", e.target.value)}
								placeholder="Enter first name"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								id="lastName"
								value={formData.lastName}
								onChange={(e) => handleInputChange("lastName", e.target.value)}
								placeholder="Enter last name"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								value={formData.email}
								onChange={(e) => handleInputChange("email", e.target.value)}
								placeholder="Enter email address"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
							<Input
								id="avatarUrl"
								type="url"
								value={formData.avatarUrl}
								onChange={(e) => handleInputChange("avatarUrl", e.target.value)}
								placeholder="https://example.com/avatar.jpg"
							/>
						</div>
						<div className="flex items-center justify-between">
							<Label htmlFor="isActive">Active Status</Label>
							<Switch
								id="isActive"
								checked={formData.isActive}
								onCheckedChange={(checked) => handleInputChange("isActive", checked)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
							Cancel
						</Button>
						<Button type="submit" disabled={updateMutation.isPending}>
							{updateMutation.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
