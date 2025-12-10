import express from 'express';

import authRoute from '../modules/auth/auth.route';
import assignmentRoute from '../modules/assignment/assignment.route';
import courseRoute from '../modules/course/course.route';
import dashboardRoute from '../modules/dashboard/dashboard.route';
import enrollmentRoute from '../modules/enrollment/enrollment.route';
import fileRoute from '../modules/file/file.route';
import healthRoute from '../modules/health/health.route';
import instanceRoute from '../modules/courseInstance/instance.route';
import notificationRoute from '../modules/notification/notification.route';
import userRoute from '../modules/user/user.route';
import submissionRoute from '../modules/submission/submission.route';
import docsRoute from './docs.route';

const router = express.Router();

interface RouteConfig {
  path: string;
  route: express.Router;
  middleware?: express.RequestHandler[];
}

const routes: RouteConfig[] = [
  {
    path: '/health',
    route: healthRoute,
  },
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/courses/instances',
    route: instanceRoute,
  },
  {
    path: '/courses',
    route: courseRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
  {
    path: '/enrollments',
    route: enrollmentRoute,
  },
  {
    path: '/submissions',
    route: submissionRoute,
  },
  {
    path: '/docs',
    route: docsRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/files',
    route: fileRoute,
  },
  {
    path: '/',
    route: assignmentRoute,
  },
];

// Register all routes
routes.forEach(({ path, route, middleware = [] }) => {
  if (middleware.length > 0) {
    router.use(path, middleware, route);
  } else {
    router.use(path, route);
  }
});

export default router;
