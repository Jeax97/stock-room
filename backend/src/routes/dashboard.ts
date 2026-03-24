import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard';

export const dashboardRouter = Router();

dashboardRouter.get('/', getDashboardStats);
