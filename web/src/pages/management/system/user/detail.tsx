import { useParams } from "@/routes/hooks";
import { Card, CardContent } from "@/ui/card";
import type { UserInfo } from "#/entity";

const USERS: UserInfo[] = [];

export default function UserDetail() {
	const { id } = useParams();
	const user = USERS.find((user) => user.id === id);
	return (
		<Card>
			<CardContent>
				<p>
					This is the detail page of {user?.firstName} {user?.lastName}
				</p>
			</CardContent>
		</Card>
	);
}
