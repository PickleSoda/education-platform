import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import auth from '@/shared/middlewares/auth';

const router = Router();

// All dashboard routes require authentication
router.use(auth());

// Teacher dashboard
router.get('/teacher', dashboardController.getTeacherDashboard);

// Student dashboard
router.get('/student', dashboardController.getStudentDashboard);

// Instance analytics (teachers only - could add role check)
router.get('/instances/:instanceId/analytics', dashboardController.getInstanceAnalytics);

export default router;
