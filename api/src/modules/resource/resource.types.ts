export interface ResourceTemplateWithSyllabus {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  resourceType: string | null;
  url: string | null;
  filePath: string | null;
  syllabusItemId: string | null;
  sortOrder: number | null;
  createdAt: Date;
  syllabusItem?: {
    id: string;
    title: string;
    weekNumber: number | null;
  } | null;
}

export interface PublishedResourceWithTemplate {
  id: string;
  instanceId: string;
  templateId: string | null;
  title: string;
  description: string | null;
  resourceType: string | null;
  url: string | null;
  filePath: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  sortOrder: number | null;
  createdAt: Date;
  template?: {
    id: string;
    title: string;
  } | null;
}

export interface SyllabusItemWithRelations {
  id: string;
  courseId: string;
  weekNumber: number | null;
  title: string;
  description: string | null;
  learningObjectives: string[];
  sortOrder: number;
  createdAt: Date;
  _count?: {
    assignmentTemplates: number;
    resourceTemplates: number;
  };
}

export interface CreateResourceTemplateData {
  courseId: string;
  title: string;
  description?: string;
  resourceType?: string;
  url?: string;
  filePath?: string;
  syllabusItemId?: string;
  sortOrder?: number;
}

export interface UpdateResourceTemplateData {
  title?: string;
  description?: string;
  resourceType?: string;
  url?: string;
  filePath?: string;
  syllabusItemId?: string;
  sortOrder?: number;
}

export interface CreatePublishedResourceData {
  instanceId: string;
  templateId?: string;
  title: string;
  description?: string;
  resourceType?: string;
  url?: string;
  filePath?: string;
  isPublished?: boolean;
  publishedAt?: Date;
  sortOrder?: number;
}

export interface UpdatePublishedResourceData {
  title?: string;
  description?: string;
  resourceType?: string;
  url?: string;
  filePath?: string;
  isPublished?: boolean;
  publishedAt?: Date;
  sortOrder?: number;
}

export interface CreateSyllabusItemData {
  courseId: string;
  weekNumber?: number;
  title: string;
  description?: string;
  learningObjectives?: string[];
  sortOrder: number;
}

export interface UpdateSyllabusItemData {
  weekNumber?: number;
  title?: string;
  description?: string;
  learningObjectives?: string[];
  sortOrder?: number;
}

export interface ListResourceTemplatesFilter {
  resourceType?: string;
  syllabusItemId?: string;
}

export interface ListPublishedResourcesFilter {
  isPublished?: boolean;
  resourceType?: string;
}
