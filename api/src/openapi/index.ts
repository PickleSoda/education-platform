import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { registerAssignmentPaths } from '@/modules/assignment/assignment.openapi';
import { registerAuthPaths } from '@/modules/auth/auth.openapi';
import { registerCoursePaths } from '@/modules/course/course.openapi';
import { registerFilePaths } from '@/modules/file/file.openapi';
import { registerInstancePaths } from '@/modules/courseInstance/instance.openapi';
import { registerNotificationPaths } from '@/modules/notification/notification.openapi';
import { registerUserPaths } from '@/modules/user/user.openapi';

import { name, version } from '../../package.json';

const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// Register all paths
registerAuthPaths(registry);
registerUserPaths(registry);
registerCoursePaths(registry);
registerAssignmentPaths(registry);
registerInstancePaths(registry);
registerNotificationPaths(registry);
registerFilePaths(registry);

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: `${name} API documentation`,
    version,
  },
  servers: [
    {
      url: '/v1',
    },
  ],
  security: [{ bearerAuth: [] }],
});
