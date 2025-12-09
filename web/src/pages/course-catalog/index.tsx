import { Icon } from "@/components/icon";
import { useRouter } from "@/routes/hooks";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import { Input } from "@/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/ui/pagination";
import { Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import type { Course } from "#/entity";
import courseService from "@/api/services/courseService";
import { useState } from "react";

export default function CourseCatalogPage() {
	const { push } = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize] = useState(20);

	const { data, isLoading } = useQuery({
		queryKey: ["courses", currentPage, pageSize, searchTerm],
		queryFn: () =>
			courseService.getCourses({
				page: String(currentPage),
				limit: String(pageSize),
				search: searchTerm || undefined,
			}),
	});

	const courses = data?.data || [];
	const meta = data?.meta;

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleSearchChange = (value: string) => {
		setSearchTerm(value);
		setCurrentPage(1); // Reset to first page on search
	};

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Spin size="large" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Course Catalog</h1>
					<p className="text-text-secondary mt-1">Browse all available courses {meta && `(${meta.total} total)`}</p>
				</div>
			</div>

			<div className="max-w-md">
				<Input
					placeholder="Search courses by title, code, or description..."
					value={searchTerm}
					onChange={(e) => handleSearchChange(e.target.value)}
				/>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{courses.map((course) => (
					<CourseCard key={course.id} course={course} onViewDetails={() => push(`/courses/${course.id}`)} />
				))}
			</div>

			{courses.length === 0 && (
				<div className="flex h-64 flex-col items-center justify-center text-text-secondary">
					<Icon icon="solar:document-text-linear" size={64} className="mb-4 opacity-50" />
					<p className="text-lg">No courses found</p>
					<p className="text-sm">Try adjusting your search criteria</p>
				</div>
			)}

			{meta && meta.totalPages > 1 && (
				<div className="flex justify-center mt-8">
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => handlePageChange(currentPage - 1)}
									className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
								/>
							</PaginationItem>

							{[...Array(meta.totalPages)].map((_, index) => {
								const page = index + 1;
								const showPage =
									page === 1 || page === meta.totalPages || (page >= currentPage - 1 && page <= currentPage + 1);

								if (!showPage) {
									// Show ellipsis for gaps
									if (page === currentPage - 2 || page === currentPage + 2) {
										return (
											<PaginationItem key={page}>
												<PaginationEllipsis />
											</PaginationItem>
										);
									}
									return null;
								}

								return (
									<PaginationItem key={page}>
										<PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page}>
											{page}
										</PaginationLink>
									</PaginationItem>
								);
							})}

							<PaginationItem>
								<PaginationNext
									onClick={() => handlePageChange(currentPage + 1)}
									className={currentPage === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}

interface CourseCardProps {
	course: Course;
	onViewDetails: () => void;
}

function CourseCard({ course, onViewDetails }: CourseCardProps) {
	return (
		<Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={onViewDetails}>
			<CardContent className="p-6">
				<div className="mb-4">
					<div className="flex items-start justify-between mb-2">
						<Badge variant="outline" className="text-xs">
							{course.code}
						</Badge>
						{course.isArchived && (
							<Badge variant="error" className="text-xs">
								Archived
							</Badge>
						)}
					</div>
					<h3 className="text-lg font-semibold line-clamp-2 mb-2">{course.title}</h3>
					<p className="text-sm text-text-secondary line-clamp-3 min-h-[60px]">
						{course.description || "No description available"}
					</p>
				</div>

				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm">
						<Icon icon="solar:book-bookmark-bold-duotone" size={18} className="text-primary" />
						<span className="font-medium">{course.credits} Credits</span>
					</div>

					{course.typicalDurationWeeks && (
						<div className="flex items-center gap-2 text-sm text-text-secondary">
							<Icon icon="solar:calendar-bold-duotone" size={18} />
							<span>{course.typicalDurationWeeks} weeks</span>
						</div>
					)}

					{course.lecturers && course.lecturers.length > 0 && (
						<div className="flex items-center gap-2 text-sm text-text-secondary">
							<Icon icon="solar:user-bold-duotone" size={18} />
							<span className="line-clamp-1">
								{course.lecturers.map((l) => `${l.user.firstName} ${l.user.lastName}`).join(", ")}
							</span>
						</div>
					)}

					{course.tags && course.tags.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-3">
							{course.tags.slice(0, 3).map((courseTag) => (
								<Badge key={courseTag.tag.id} variant="outline" className="text-xs">
									{courseTag.tag.name}
								</Badge>
							))}
							{course.tags.length > 3 && (
								<Badge variant="outline" className="text-xs">
									+{course.tags.length - 3}
								</Badge>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
