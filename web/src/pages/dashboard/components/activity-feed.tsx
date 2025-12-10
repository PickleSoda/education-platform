import { Card, CardContent, CardHeader } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Icon } from "@/components/icon";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
	id: string;
	type: "grade" | "post" | "assignment" | "announcement";
	title: string;
	description?: string;
	timestamp: string;
	courseCode?: string;
	semester?: string;
	metadata?: any;
}

interface ActivityFeedProps {
	items: ActivityItem[];
	onItemClick?: (item: ActivityItem) => void;
}

export default function ActivityFeed({ items, onItemClick }: ActivityFeedProps) {
	const getActivityIcon = (type: ActivityItem["type"]) => {
		switch (type) {
			case "grade":
				return "solar:document-text-bold-duotone";
			case "post":
				return "solar:chat-round-bold-duotone";
			case "assignment":
				return "solar:clipboard-list-bold-duotone";
			case "announcement":
				return "solar:bell-bold-duotone";
			default:
				return "solar:document-bold-duotone";
		}
	};

	const getActivityColor = (type: ActivityItem["type"]) => {
		switch (type) {
			case "grade":
				return "text-success";
			case "post":
				return "text-info";
			case "assignment":
				return "text-warning";
			case "announcement":
				return "text-primary";
			default:
				return "text-text-secondary";
		}
	};

	const getActivityLabel = (type: ActivityItem["type"]) => {
		switch (type) {
			case "grade":
				return "Graded";
			case "post":
				return "Forum Post";
			case "assignment":
				return "New Assignment";
			case "announcement":
				return "Announcement";
			default:
				return "Activity";
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<Icon icon="solar:history-bold-duotone" size={24} className="text-primary" />
					<h3 className="text-lg font-semibold">Recent Activity</h3>
				</div>
			</CardHeader>
			<CardContent>
				{items.length === 0 ? (
					<div className="text-center py-12 text-text-secondary">
						<Icon icon="solar:history-bold-duotone" size={48} className="mx-auto mb-4 opacity-50" />
						<p>No recent activity</p>
					</div>
				) : (
					<div className="space-y-3">
						{items.map((item) => (
							<div
								key={item.id}
								className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
								onClick={() => onItemClick?.(item)}
							>
								<div
									className={`h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ${getActivityColor(item.type)}`}
								>
									<Icon icon={getActivityIcon(item.type)} size={20} />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-start justify-between gap-2 mb-1">
										<p className="font-medium text-sm line-clamp-1">{item.title}</p>
										<Badge variant="outline" className="flex-shrink-0 text-xs">
											{getActivityLabel(item.type)}
										</Badge>
									</div>
									{item.description && (
										<p className="text-sm text-text-secondary line-clamp-2 mb-1">{item.description}</p>
									)}
									<div className="flex items-center gap-2 text-xs text-text-secondary">
										{item.courseCode && (
											<>
												<span className="font-medium">{item.courseCode}</span>
												{item.semester && <span>• {item.semester}</span>}
											</>
										)}
										<span className="ml-auto">
											{formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
