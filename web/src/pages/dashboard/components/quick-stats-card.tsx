import { Card, CardContent } from "@/ui/card";
import { Icon } from "@/components/icon";

interface QuickStatsCardProps {
	icon: string;
	title: string;
	value: number | string;
	description?: string;
	variant?: "default" | "primary" | "success" | "warning" | "error";
}

export default function QuickStatsCard({ icon, title, value, description, variant = "default" }: QuickStatsCardProps) {
	const variantStyles = {
		default: "bg-gray-100 text-gray-600",
		primary: "bg-primary/10 text-primary",
		success: "bg-success/10 text-success",
		warning: "bg-warning/10 text-warning",
		error: "bg-error/10 text-error",
	};

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<p className="text-sm text-text-secondary mb-1">{title}</p>
						<p className="text-3xl font-bold">{value}</p>
						{description && <p className="text-xs text-text-secondary mt-1">{description}</p>}
					</div>
					<div className={`h-14 w-14 rounded-lg flex items-center justify-center ${variantStyles[variant]}`}>
						<Icon icon={icon} size={28} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
