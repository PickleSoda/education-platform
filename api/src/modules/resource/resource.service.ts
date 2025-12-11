import * as resourceRepository from './resource.repository';
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
// RESOURCE TEMPLATE SERVICE
// ============================================================================

export const createResourceTemplate = async (
  data: CreateResourceTemplateData
): Promise<ResourceTemplateWithSyllabus> => {
  return resourceRepository.createResourceTemplate(data);
};

export const getResourceTemplate = async (
  id: string
): Promise<ResourceTemplateWithSyllabus | null> => {
  return resourceRepository.getResourceTemplateById(id);
};

export const listResourceTemplates = async (
  courseId: string,
  filter?: ListResourceTemplatesFilter
): Promise<ResourceTemplateWithSyllabus[]> => {
  return resourceRepository.listResourceTemplates(courseId, filter);
};

export const updateResourceTemplate = async (
  id: string,
  data: UpdateResourceTemplateData
): Promise<ResourceTemplateWithSyllabus> => {
  return resourceRepository.updateResourceTemplate(id, data);
};

export const deleteResourceTemplate = async (id: string): Promise<void> => {
  const resource = await resourceRepository.getResourceTemplateById(id);

  if (resource?.filePath) {
    // TODO: Delete file from storage
    // const storageService = await import('@/shared/services/storage.service');
    // await storageService.storageService.deleteFile(resource.filePath);
  }

  await resourceRepository.deleteResourceTemplate(id);
};

// ============================================================================
// PUBLISHED RESOURCE SERVICE
// ============================================================================

export const createPublishedResource = async (
  data: CreatePublishedResourceData
): Promise<PublishedResourceWithTemplate> => {
  return resourceRepository.createPublishedResource(data);
};

export const getPublishedResource = async (
  id: string
): Promise<PublishedResourceWithTemplate | null> => {
  return resourceRepository.getPublishedResourceById(id);
};

export const listPublishedResources = async (
  instanceId: string,
  filter?: ListPublishedResourcesFilter
): Promise<PublishedResourceWithTemplate[]> => {
  return resourceRepository.listPublishedResources(instanceId, filter);
};

export const updatePublishedResource = async (
  id: string,
  data: UpdatePublishedResourceData
): Promise<PublishedResourceWithTemplate> => {
  return resourceRepository.updatePublishedResource(id, data);
};

export const deletePublishedResource = async (id: string): Promise<void> => {
  const resource = await resourceRepository.getPublishedResourceById(id);

  if (resource?.filePath) {
    // TODO: Delete file from storage
    // const storageService = await import('@/shared/services/storage.service');
    // await storageService.storageService.deleteFile(resource.filePath);
  }

  await resourceRepository.deletePublishedResource(id);
};

// ============================================================================
// SYLLABUS ITEM SERVICE
// ============================================================================

export const createSyllabusItem = async (
  data: CreateSyllabusItemData
): Promise<SyllabusItemWithRelations> => {
  return resourceRepository.createSyllabusItem(data);
};

export const getSyllabusItem = async (id: string): Promise<SyllabusItemWithRelations | null> => {
  return resourceRepository.getSyllabusItemById(id);
};

export const listSyllabusItems = async (courseId: string): Promise<SyllabusItemWithRelations[]> => {
  return resourceRepository.listSyllabusItems(courseId);
};

export const updateSyllabusItem = async (
  id: string,
  data: UpdateSyllabusItemData
): Promise<SyllabusItemWithRelations> => {
  return resourceRepository.updateSyllabusItem(id, data);
};

export const deleteSyllabusItem = async (id: string): Promise<void> => {
  await resourceRepository.deleteSyllabusItem(id);
};
