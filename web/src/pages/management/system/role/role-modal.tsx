import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PERMISSION_GROUPS, getRolePermissions } from "@/config/permissions";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";

import type { Role_Old } from "#/entity";

export type RoleModalProps = {
	formValue: Role_Old;
	title: string;
	show: boolean;
	onOk: VoidFunction;
	onCancel: VoidFunction;
};

export function RoleModal({ title, show, formValue, onOk, onCancel }: RoleModalProps) {
	const form = useForm<Role_Old>({
		defaultValues: formValue,
	});

	const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

	useEffect(() => {
		// Get default permissions for the role
		const rolePermissions = getRolePermissions(formValue.name);
		setSelectedPermissions(rolePermissions);
	}, [formValue]);

	useEffect(() => {
		form.reset(formValue);
	}, [formValue, form]);

	return (
		<Dialog open={show} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Name</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Input {...field} disabled />
										</FormControl>
									</div>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="desc"
							render={({ field }) => (
								<FormItem className="grid grid-cols-4 items-center gap-4">
									<FormLabel className="text-right">Description</FormLabel>
									<div className="col-span-3">
										<FormControl>
											<Textarea {...field} />
										</FormControl>
									</div>
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-4 items-start gap-4">
							<FormLabel className="text-right pt-2">Permissions</FormLabel>
							<div className="col-span-3 space-y-3">
								{PERMISSION_GROUPS.map((group) => (
									<div key={group.label} className="space-y-2">
										<h4 className="font-medium text-sm">{group.label}</h4>
										<div className="grid grid-cols-2 gap-2">
											{group.permissions.map((permission) => (
												<div key={permission} className="flex items-center space-x-2">
													<input
														type="checkbox"
														id={permission}
														checked={selectedPermissions.includes(permission)}
														onChange={(e) => {
															if (e.target.checked) {
																setSelectedPermissions([...selectedPermissions, permission]);
															} else {
																setSelectedPermissions(selectedPermissions.filter((p) => p !== permission));
															}
														}}
														className="h-4 w-4 rounded border-gray-300"
													/>
													<label htmlFor={permission} className="text-sm text-gray-700 cursor-pointer">
														{permission}
													</label>
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</Form>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						onClick={() => {
							form.handleSubmit(onOk)();
						}}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
