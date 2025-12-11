import prisma from '@/client';

import type {
  ResourceTemplateWithSyllabus,
  PublishedResourceWithTemplate,
  SyllabusItemWithRelations,
  CreateResourceTemplateData,
  UpdateResourceTemplateData,
  CreatePublishedResourceData,
  UpdatePublishedResourceData,
  CreateSyllabusItemData,
  UpdateSyllabusItemData,
  ListResourceTemplatesFilter,
  ListPublishedResourcesFilter,
} from './resource.types';

// ============================================================================
// RESOURCE TEMPLATE REPOSITORY
// ============================================================================

export const createResourceTemplate = async (
  data: CreateResourceTemplateData
): Promise<ResourceTemplateWithSyllabus> => {
  return prisma.resourceTemplate.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      resourceType: data.resourceType,
      url: data.url,
      filePath: data.filePath,
      syllabusItemId: data.syllabusItemId,
      sortOrder: data.sortOrder,
    },
    include: {
      syllabusItem: {
        select: {
          id: true,
          title: true,
          weekNumber: true,
        },
      },
    },
  });
};

export const getResourceTemplateById = async (
  id: string
): Promise<ResourceTemplateWithSyllabus | null> => {
  return prisma.resourceTemplate.findUnique({
    where: { id },
    include: {
      syllabusItem: {
        select: {
          id: true,
          title: true,
          weekNumber: true,
        },
      },
    },
  });
};

export const listResourceTemplates = async (
  courseId: string,
  filter?: ListResourceTemplatesFilter
): Promise<ResourceTemplateWithSyllabus[]> => {
  return prisma.resourceTemplate.findMany({
    where: {
      courseId,
      ...(filter?.resourceType && { resourceType: filter.resourceType }),
      ...(filter?.syllabusItemId && { syllabusItemId: filter.syllabusItemId }),
    },
    include: {
      syllabusItem: {
        select: {
          id: true,
          title: true,
          weekNumber: true,
        },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
};

export const updateResourceTemplate = async (
  id: string,
  data: UpdateResourceTemplateData
): Promise<ResourceTemplateWithSyllabus> => {
  return prisma.resourceTemplate.update({
    where: { id },
    data,
    include: {
      syllabusItem: {
        select: {
          id: true,
          title: true,
          weekNumber: true,
        },
      },
    },
  });
};

export const deleteResourceTemplate = async (id: string): Promise<void> => {
  await prisma.resourceTemplate.delete({
    where: { id },
  });
};

// ============================================================================
// PUBLISHED RESOURCE REPOSITORY
// ============================================================================

export const createPublishedResource = async (
  data: CreatePublishedResourceData
): Promise<PublishedResourceWithTemplate> => {
  return prisma.publishedResource.create({
    data: {
      instanceId: data.instanceId,
      templateId: data.templateId,
      title: data.title,
      description: data.description,
      resourceType: data.resourceType,
      url: data.url,
      filePath: data.filePath,
      isPublished: data.isPublished ?? false,
      publishedAt: data.isPublished ? new Date() : null,
      sortOrder: data.sortOrder,
    },
    include: {
      template: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

export const getPublishedResourceById = async (
  id: string
): Promise<PublishedResourceWithTemplate | null> => {
  return prisma.publishedResource.findUnique({
    where: { id },
    include: {
      template: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

export const listPublishedResources = async (
  instanceId: string,
  filter?: ListPublishedResourcesFilter
): Promise<PublishedResourceWithTemplate[]> => {
  return prisma.publishedResource.findMany({
    where: {
      instanceId,
      ...(filter?.isPublished !== undefined && { isPublished: filter.isPublished }),
      ...(filter?.resourceType && { resourceType: filter.resourceType }),
    },
    include: {
      template: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
};

export const updatePublishedResource = async (
  id: string,
  data: UpdatePublishedResourceData
): Promise<PublishedResourceWithTemplate> => {
  // If setting isPublished to true and publishedAt is not set, set it now
  if (data.isPublished && !data.publishedAt) {
    data.publishedAt = new Date();
  }

  return prisma.publishedResource.update({
    where: { id },
    data,
    include: {
      template: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

export const deletePublishedResource = async (id: string): Promise<void> => {
  await prisma.publishedResource.delete({
    where: { id },
  });
};

// ============================================================================
// SYLLABUS ITEM REPOSITORY
// ============================================================================

export const createSyllabusItem = async (
  data: CreateSyllabusItemData
): Promise<SyllabusItemWithRelations> => {
  return prisma.syllabusItem.create({
    data: {
      courseId: data.courseId,
      weekNumber: data.weekNumber,
      title: data.title,
      description: data.description,
      learningObjectives: data.learningObjectives || [],
      sortOrder: data.sortOrder,
    },
    include: {
      _count: {
        select: {
          assignmentTemplates: true,
          resourceTemplates: true,
        },
      },
    },
  });
};

export const getSyllabusItemById = async (
  id: string
): Promise<SyllabusItemWithRelations | null> => {
  return prisma.syllabusItem.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          assignmentTemplates: true,
          resourceTemplates: true,
        },
      },
    },
  });
};

export const listSyllabusItems = async (courseId: string): Promise<SyllabusItemWithRelations[]> => {
  return prisma.syllabusItem.findMany({
    where: { courseId },
    include: {
      _count: {
        select: {
          assignmentTemplates: true,
          resourceTemplates: true,
        },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { weekNumber: 'asc' }],
  });
};

export const updateSyllabusItem = async (
  id: string,
  data: UpdateSyllabusItemData
): Promise<SyllabusItemWithRelations> => {
  return prisma.syllabusItem.update({
    where: { id },
    data,
    include: {
      _count: {
        select: {
          assignmentTemplates: true,
          resourceTemplates: true,
        },
      },
    },
  });
};

export const deleteSyllabusItem = async (id: string): Promise<void> => {
  await prisma.syllabusItem.delete({
    where: { id },
  });
};
